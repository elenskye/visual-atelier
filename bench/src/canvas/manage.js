import fs from 'node:fs';
import path from 'node:path';
import { canvasDir, needCanvas, readCloud, writeCloud, NAME_RE } from './store.js';
import { snapshot } from './versions.js';
import { readStore, setDoc, deleteDoc } from './db.js';
import { REVIEW_COLLECTION } from './review.js';
import { readJsonFile, writeJsonFile, stamp } from '../utils/config.js';

// 改名和删除（站主 2026-11-13）：站主在画布界面和 Pomelo 的「有板有眼」里做，Agent 用 dw rename / dw delete。
//   画布（Explore Deck 或问卷页）：改名改的是标题（cloud.json，画布还有 canvas.json 的 title），目录名和地址不变；
//                                  删除是把整个目录挪进回收处。
//   页：改名改 canvas.json 里的页名；删除是这一页、它上面的画板（文件挪进回收处）、便签和画板的批准记录一起拿走。
//       只剩一页时不能删页（要删就删整块画布）。
//   画板（站主 2026-11-14）：改名改 canvas.json 里这张板的标题，文件名不变；删除是这张板（文件挪进回收处）和它的
//       批准记录。
//   Design System、Motion Deck（站主 2026-11-14）：只改 bench 里显示的名字，记在 bench/names.json；方案的源、云端
//       Design System 的名字都不变。名字清空就回到方案自己的名字。
// 回收处 canvases/.trash/<id>/：trash.json 写着删的是什么、从哪来；整块画布在 canvas/，一页或一张板的画板文件在
// files/。不进 Git，只在这台机器上；restoreTrash 原样放回（撤销），emptyTrash 清空。改页、改板之前先存一个本地版本
// （.versions/），「版本」菜单里看得到改之前的样子。

const MAX_NAME = 80;

class ManageError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
const fail = (code, message) => {
  throw new ManageError(code, message);
};

const trashDir = (config) => path.join(config.canvasesAbs, '.trash');
const canvasJsonPath = (dir) => path.join(dir, 'project', 'canvas.json');

function cleanName(value, what) {
  const t = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!t) fail('invalid_argument', `${what}不能是空的`);
  if ([...t].length > MAX_NAME) fail('invalid_argument', `${what}最多 ${MAX_NAME} 个字`);
  return t;
}

function existing(config, name) {
  const kind = needCanvas(config, name);
  return { dir: canvasDir(config, name), kind };
}

function readCanvas(dir) {
  const c = readJsonFile(canvasJsonPath(dir));
  if (!c) fail('failed_precondition', `读不到 ${canvasJsonPath(dir)}`);
  return c;
}

function titleOf(dir, kind, name) {
  const cloud = readCloud(dir) || {};
  if (cloud.title) return cloud.title;
  if (kind === 'canvas') return readJsonFile(canvasJsonPath(dir), {}).title || name;
  return name;
}

/** A board or note belongs to the first page when it names none (as the board UI shows it). */
const pageOf = (item, pages) => item.page || pages[0]?.id || null;

function newTrashId(config, base) {
  const root = trashDir(config);
  fs.mkdirSync(root, { recursive: true });
  let id = base;
  let n = 2;
  while (fs.existsSync(path.join(root, id))) id = `${base}~${n++}`;
  return id;
}
const safe = (s) => String(s).replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 60);

// ---------- 画布 ----------

/** New title for a canvas or a page; the folder name (and every address) stays. */
export function renameCanvas(config, name, title) {
  const { dir, kind } = existing(config, name);
  const t = cleanName(title, '名字');
  if (kind === 'canvas') {
    snapshot(config, name, 'before-rename');
    const c = readCanvas(dir);
    c.title = t;
    writeJsonFile(canvasJsonPath(dir), c);
  }
  const cloud = readCloud(dir) || { kind, targets: {} };
  writeCloud(dir, { ...cloud, title: t });
  return { name, kind, title: t };
}

/** Moves the whole folder into the trash. */
export function deleteCanvas(config, name, { at = new Date() } = {}) {
  const { dir, kind } = existing(config, name);
  const title = titleOf(dir, kind, name);
  const id = newTrashId(config, `${stamp(at)}-${name}`);
  const tdir = path.join(trashDir(config), id);
  fs.mkdirSync(tdir);
  fs.renameSync(dir, path.join(tdir, 'canvas'));
  const record = { id, what: 'canvas', canvas: name, kind, title, deletedAt: at.toISOString() };
  writeJsonFile(path.join(tdir, 'trash.json'), record);
  return record;
}

// ---------- 页 ----------

function pageIndex(c, page) {
  const i = (c.pages || []).findIndex((p) => p.id === page);
  if (i < 0) fail('not_found', `没有这一页：${page}`);
  return i;
}

export function renamePage(config, name, page, newName) {
  const { dir, kind } = existing(config, name);
  if (kind !== 'canvas') fail('failed_precondition', `${name} 是问卷页，没有分页`);
  const t = cleanName(newName, '页名');
  const c = readCanvas(dir);
  const i = pageIndex(c, page);
  snapshot(config, name, 'before-rename');
  c.pages[i] = { ...c.pages[i], name: t };
  writeJsonFile(canvasJsonPath(dir), c);
  return { name, page, title: t };
}

/** Takes one page off a canvas: its boards (files into the trash), notes and the boards' review records. */
export function deletePage(config, name, page, { at = new Date() } = {}) {
  const { dir, kind } = existing(config, name);
  if (kind !== 'canvas') fail('failed_precondition', `${name} 是问卷页，没有分页`);
  const c = readCanvas(dir);
  const pages = c.pages || [];
  const index = pageIndex(c, page);
  if (pages.length < 2) fail('failed_precondition', '只剩这一页了：要删就删整块画布');
  snapshot(config, name, 'before-delete');

  const boards = Object.fromEntries(Object.entries(c.boards || {}).filter(([, b]) => pageOf(b, pages) === page));
  const notes = Object.fromEntries(Object.entries(c.notes || {}).filter(([, n]) => pageOf(n, pages) === page));
  const store = fs.existsSync(path.join(dir, 'db.json')) ? readStore(config, name) : {};
  const reviews = Object.fromEntries(Object.keys(boards).filter((f) => store[`${REVIEW_COLLECTION}/${f}`]).map((f) => [f, store[`${REVIEW_COLLECTION}/${f}`]]));

  const id = newTrashId(config, `${stamp(at)}-${name}--${safe(page)}`);
  const tdir = path.join(trashDir(config), id);
  fs.mkdirSync(path.join(tdir, 'files'), { recursive: true });
  for (const f of Object.keys(boards)) {
    const abs = path.join(dir, 'project', f);
    if (!fs.existsSync(abs)) continue;
    fs.mkdirSync(path.dirname(path.join(tdir, 'files', f)), { recursive: true });
    fs.renameSync(abs, path.join(tdir, 'files', f));
  }
  const record = {
    id,
    what: 'page',
    canvas: name,
    canvasTitle: titleOf(dir, kind, name),
    page: pages[index],
    index,
    title: pages[index].name,
    // a board or note that named no page was on this page because it was the first; it names it now, so it
    // comes back to this page and not to whichever page is first by then
    boards: Object.fromEntries(Object.entries(boards).map(([f, b]) => [f, { ...b, page }])),
    notes: Object.fromEntries(Object.entries(notes).map(([k, n]) => [k, { ...n, page }])),
    reviews,
    deletedAt: at.toISOString()
  };
  writeJsonFile(path.join(tdir, 'trash.json'), record);

  for (const f of Object.keys(boards)) delete c.boards[f];
  for (const k of Object.keys(notes)) delete c.notes[k];
  c.pages = pages.filter((p) => p.id !== page);
  c.order = (c.order || []).filter((f) => c.boards[f]);
  if (c.launch?.page === page) c.launch = { ...c.launch, page: c.pages[Math.min(index, c.pages.length - 1)].id };
  if (c.launch?.view === 'focused' && boards[c.launch.file]) c.launch = { view: 'canvas', page: c.pages[0].id };
  writeJsonFile(canvasJsonPath(dir), c);
  for (const f of Object.keys(reviews)) deleteDoc(config, name, `${REVIEW_COLLECTION}/${f}`);
  return { id, what: 'page', canvas: name, page, title: record.title };
}

// ---------- 画板 ----------

function boardOf(c, file) {
  if (!file || !c.boards?.[file]) fail('not_found', `没有这张画板：${file}`);
  return c.boards[file];
}

/** New title for one board; its file name (and address) stays. */
export function renameBoard(config, name, file, title) {
  const { dir, kind } = existing(config, name);
  if (kind !== 'canvas') fail('failed_precondition', `${name} 是问卷页，没有画板`);
  const t = cleanName(title, '画板名');
  const c = readCanvas(dir);
  boardOf(c, file);
  snapshot(config, name, 'before-rename');
  c.boards[file] = { ...c.boards[file], title: t };
  writeJsonFile(canvasJsonPath(dir), c);
  return { name, file, title: t };
}

/** Takes one board off a canvas: its file into the trash, its entry and its review record. */
export function deleteBoard(config, name, file, { at = new Date() } = {}) {
  const { dir, kind } = existing(config, name);
  if (kind !== 'canvas') fail('failed_precondition', `${name} 是问卷页，没有画板`);
  const c = readCanvas(dir);
  const pages = c.pages || [];
  const board = boardOf(c, file);
  snapshot(config, name, 'before-delete');
  const store = fs.existsSync(path.join(dir, 'db.json')) ? readStore(config, name) : {};
  const review = store[`${REVIEW_COLLECTION}/${file}`] || null;

  const id = newTrashId(config, `${stamp(at)}-${name}--${safe(file.replace(/\.dc\.html$/, ''))}`);
  const tdir = path.join(trashDir(config), id);
  fs.mkdirSync(path.join(tdir, 'files'), { recursive: true });
  const abs = path.join(dir, 'project', file);
  if (fs.existsSync(abs)) {
    fs.mkdirSync(path.dirname(path.join(tdir, 'files', file)), { recursive: true });
    fs.renameSync(abs, path.join(tdir, 'files', file));
  }
  const page = pageOf(board, pages);
  const record = {
    id,
    what: 'board',
    canvas: name,
    canvasTitle: titleOf(dir, kind, name),
    file,
    // named, so it comes back to this page even if it was the first one and isn't any more
    board: { ...board, ...(page ? { page } : {}) },
    order: (c.order || []).indexOf(file),
    at: Object.keys(c.boards).indexOf(file), // where it sits in canvas.json, so an undo leaves the file as it was
    title: board.title || file.replace(/\.dc\.html$/, ''),
    pageName: pages.find((p) => p.id === page)?.name || null,
    review,
    deletedAt: at.toISOString()
  };
  writeJsonFile(path.join(tdir, 'trash.json'), record);

  delete c.boards[file];
  c.order = (c.order || []).filter((f) => f !== file);
  if (c.launch?.view === 'focused' && c.launch.file === file) c.launch = { view: 'canvas', page: page || pages[0]?.id };
  writeJsonFile(canvasJsonPath(dir), c);
  if (review) deleteDoc(config, name, `${REVIEW_COLLECTION}/${file}`);
  return { id, what: 'board', canvas: name, file, page, title: record.title };
}

function restoreBoard(config, t, tdir) {
  const { dir, kind } = existing(config, t.canvas);
  if (kind !== 'canvas') fail('failed_precondition', `${t.canvas} 现在不是画布了，放不回去`);
  const c = readCanvas(dir);
  if (c.boards?.[t.file] || fs.existsSync(path.join(dir, 'project', t.file))) fail('already_exists', `${t.canvas} 已经有画板 ${t.file} 了，放不回去`);
  const pages = c.pages || [];
  // its page was deleted meanwhile: it goes on the first page
  const board = { ...t.board };
  if (board.page && !pages.some((p) => p.id === board.page)) board.page = pages[0]?.id;
  const from = path.join(tdir, 'files', t.file);
  if (fs.existsSync(from)) {
    fs.mkdirSync(path.dirname(path.join(dir, 'project', t.file)), { recursive: true });
    fs.renameSync(from, path.join(dir, 'project', t.file));
  }
  const entries = Object.entries(c.boards || {});
  entries.splice(t.at >= 0 ? Math.min(t.at, entries.length) : entries.length, 0, [t.file, board]);
  c.boards = Object.fromEntries(entries);
  const order = (c.order || []).filter((f) => c.boards[f] && f !== t.file);
  order.splice(t.order >= 0 ? Math.min(t.order, order.length) : order.length, 0, t.file);
  c.order = order;
  writeJsonFile(canvasJsonPath(dir), c);
  if (t.review) setDoc(config, t.canvas, `${REVIEW_COLLECTION}/${t.file}`, t.review);
  return { ...t, page: board.page };
}

// ---------- Design System、Motion Deck 的名字（只在 bench 里） ----------

export const NAME_KINDS = { ds: 'Design System', motion: 'Motion Deck' };
const namesPath = (config) => path.join(config.rootDir, 'names.json');

/** The names given in the bench: { ds: { <方案>: 名字 }, motion: { <方案>: 名字 } }. */
export function readNames(config) {
  const n = readJsonFile(namesPath(config), {}) || {};
  return { ds: { ...(n.ds || {}) }, motion: { ...(n.motion || {}) } };
}

/** A list of schemes with the bench's names on top: `title` is what to show, `schemeTitle` the scheme's own. */
export function withNames(config, kind, items) {
  const names = readNames(config)[kind] || {};
  return items.map((it) => (names[it.name] ? { ...it, title: names[it.name], schemeTitle: it.title } : it));
}

/** Names one Design System or Motion Deck in the bench; an empty name (or reset) goes back to the scheme's own. */
export function renameScheme(config, kind, scheme, title, { known = null } = {}) {
  if (!NAME_KINDS[kind]) fail('invalid_argument', `只能给 Design System（ds）或 Motion Deck（motion）改名：${kind}`);
  if (!scheme || !NAME_RE.test(scheme)) fail('invalid_argument', `方案名只能用小写字母、数字和连字符：${scheme}`);
  if (known && !known.includes(scheme)) fail('not_found', `没有 ${NAME_KINDS[kind]}「${scheme}」`);
  const names = readNames(config);
  const reset = title == null || String(title).trim() === '';
  if (reset) delete names[kind][scheme];
  else names[kind][scheme] = cleanName(title, '名字');
  const out = Object.fromEntries(Object.entries(names).filter(([, v]) => Object.keys(v).length));
  if (Object.keys(out).length) writeJsonFile(namesPath(config), out);
  else fs.rmSync(namesPath(config), { force: true });
  return { kind, name: scheme, title: reset ? null : names[kind][scheme], reset };
}

// ---------- 回收处 ----------

/** What is in the trash, newest first. */
export function listTrash(config) {
  const root = trashDir(config);
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .map((id) => readJsonFile(path.join(root, id, 'trash.json')))
    .filter(Boolean)
    .sort((a, b) => String(b.deletedAt).localeCompare(String(a.deletedAt)));
}

/** Puts one thing back where it was (the undo after a delete). */
export function restoreTrash(config, id) {
  if (!id || /[\\/]/.test(id) || id.startsWith('.')) fail('invalid_argument', `回收处没有 ${id}`);
  const tdir = path.join(trashDir(config), id);
  const t = readJsonFile(path.join(tdir, 'trash.json'));
  if (!t) fail('not_found', `回收处没有 ${id}`);
  if (t.what === 'canvas') {
    const dir = canvasDir(config, t.canvas);
    if (fs.existsSync(dir)) fail('already_exists', `已经有一块叫 ${t.canvas} 的画布了，放不回去`);
    fs.renameSync(path.join(tdir, 'canvas'), dir);
    fs.rmSync(tdir, { recursive: true, force: true });
    return t;
  }
  if (t.what === 'board') {
    const back = restoreBoard(config, t, tdir);
    fs.rmSync(tdir, { recursive: true, force: true });
    return back;
  }
  const { dir, kind } = existing(config, t.canvas);
  if (kind !== 'canvas') fail('failed_precondition', `${t.canvas} 现在不是画布了，放不回去`);
  const c = readCanvas(dir);
  c.pages = c.pages || [];
  if (c.pages.some((p) => p.id === t.page.id)) fail('already_exists', `${t.canvas} 已经有这一页了（${t.page.id}），放不回去`);
  for (const f of Object.keys(t.boards)) {
    if (c.boards?.[f] || fs.existsSync(path.join(dir, 'project', f))) fail('already_exists', `${t.canvas} 已经有画板 ${f} 了，放不回去`);
  }
  for (const f of Object.keys(t.boards)) {
    const from = path.join(tdir, 'files', f);
    if (fs.existsSync(from)) fs.renameSync(from, path.join(dir, 'project', f));
  }
  c.pages.splice(Math.min(t.index, c.pages.length), 0, t.page);
  c.boards = { ...(c.boards || {}), ...t.boards };
  c.notes = { ...(c.notes || {}), ...t.notes };
  const at = (f) => c.pages.findIndex((p) => p.id === pageOf(c.boards[f], c.pages));
  c.order = [...(c.order || []).filter((f) => c.boards[f]), ...Object.keys(t.boards)].sort((a, b) => at(a) - at(b));
  writeJsonFile(canvasJsonPath(dir), c);
  for (const [f, doc] of Object.entries(t.reviews || {})) setDoc(config, t.canvas, `${REVIEW_COLLECTION}/${f}`, doc);
  fs.rmSync(tdir, { recursive: true, force: true });
  return t;
}

/** Empties the trash for good. */
export function emptyTrash(config) {
  const items = listTrash(config);
  fs.rmSync(trashDir(config), { recursive: true, force: true });
  return items;
}
