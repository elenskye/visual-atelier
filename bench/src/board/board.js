// 本地画布界面：只看不编辑。读 /api/canvases 和每块画布的 canvas.json，画板用 iframe 原样跑 .dc.html。
// 操作学 Claude 画布：滚轮平移，⌘ / 触控板捏合缩放，拖空白处平移，双击或 ⤢ 铺满单张，▷ 在画布上试玩。
// Tweaks 用画布运行时给的接口（__dc_booted 消息带参数定义，__dcSetProps 改值），不写回文件；改过的值记在浏览器里
// （localStorage 的 dw.tweaks.<画布>，每张板各记各的，站主 2026-11-12 定、Phase 2 做），刷新、下次打开还在。
// 批准状态：站主在画板名字后面的小牌子或单张铺满的顶栏上批准、退回，存进画布的 db.json（review/<画板>，/api/review）。
// 并排对比：单张铺满时「对比」另一张板，或这张在本地存过的旧版本（地址 &vs=<文件> 或 &vs=@<版本>）。
// 顶栏的「深色」「减弱动效」管所有画板：带 dark 参数的直接改参数，其余由 emulate.js 模拟系统设置（画板重新载入）。
// Design System（本仓库构建好的）在 #/ds/<方案> 看，见 ds.js；Motion Deck 在 #/motion/<方案>，见 motion.js。
// 改名、删除（站主 2026-11-13）：菜单里每块 Explore Deck、问卷页和每一页后面的「⋯」；删了的进回收处，提示条上能撤销
// （canvas/manage.js）。看旧版本时没有这些。改了以后告诉外面那一页（Pomelo）一声：{ source: 'dw', type: 'changed' }。
// 2026-11-14 站主加的：每张画板标题条上和单张铺满的顶栏上也有「⋯」（改名、删除）；菜单里的 Design System、Motion Deck
// 也能改名，只改 bench 里的名字（bench/names.json）。单张铺满能放大缩小：顶栏的 − 100% +，⌘ / 触控板捏合，+ − 0 1 键。
// 顶栏的菜单分五类，次序固定：Design System、Motion Deck、Explore Deck、Questionnaire、Checks（server/catalog.js；
// Checks 是 npm run all 的结果，站主 2026-11-14 加的，在 #/qa/all，见 checks.js）。
// 不卡（站主 2026-11-13，Pomelo 的「有板有眼」在 WKWebView 里和 Pomelo 共用主线程）：画板按离视野中心的远近排队载入，
// 一次两张；载入后过一会儿，看不见的、缩得很小的（屏幕上窄于 LIVE_W）板定格（embed.js），悬停、选中、试玩、开着
// Tweaks 的照常动；单张铺满时背后画布上的板全定格。
import { openSystem, closeSystem } from './ds.js';
import { openMotion, closeMotion, motionKey } from './motion.js';
import { openChecks, closeChecks, refreshChecks } from './checks.js';

const $ = (sel, el = document) => el.querySelector(sel);
const el = (tag, attrs = {}, kids = []) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'style') Object.assign(n.style, v);
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of [].concat(kids)) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
  return n;
};
const svg = (d) => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('class', 'ic sm');
  s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  s.append(p);
  return s;
};
const ICON = {
  expand: 'M14 5h5v5M10 19H5v-5M19 5l-6 6M5 19l6-6',
  tweaks: 'M5 7h9M18 7h1M5 17h3M12 17h7M16 5v4M10 15v4',
  open: 'M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4',
  play: 'M8 5.5v13l10-6.5z',
  stop: 'M7 7h10v10H7z'
};
const api = async (p) => {
  const r = await fetch(p, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${r.status} ${p}`);
  return r.json();
};
const MIN_Z = 0.02;
const MAX_Z = 4;
const STICKY = { gray: '#e9e7e2', red: '#ffd8d2', orange: '#ffe2c2', green: '#d8f0d4', teal: '#cdeee9', blue: '#d8e6ff', purple: '#e6dcff', pink: '#ffdaec', yellow: '#fff1b8' };
const SIZE = { s: 14, m: 18, l: 24, xl: 32, xxl: 48 };
const LABEL = { new: '新建', import: '导入', pull: '拉回', 'before-pull': '拉回前', 'pull-blobs': '拉回图片', publish: '发回', 'before-restore': '恢复前', save: '存档', 'before-rename': '改名前', 'before-delete': '删除前' };
const labelOf = (l) => LABEL[l] || l;

const S = {
  list: [],
  systems: [], // Design Systems built from schemes/
  ds: null, // the Design System being looked at, instead of a canvas
  dsSection: null,
  motionSchemes: [], // schemes with motion parts (schemes/<方案>/motion/)
  motion: null, // the scheme whose motion parts are being looked at (Motion Deck), instead of a canvas
  motionPart: null,
  checks: false, // looking at npm run all's results (#/qa/all), instead of a canvas
  checksSub: '', // the menu's line for it, from /api/index
  name: null,
  kind: null,
  canvas: null,
  cloud: null,
  version: null,
  versions: [],
  page: null,
  view: { tx: 0, ty: 0, z: 1 },
  tool: 'select',
  selected: null,
  playing: null,
  focus: null,
  fit: 'fit', // 单张铺满：'fit' 整张放进窗口、'fill' 宽度铺满、'zoom' 按 focusZ 放大缩小
  focusZ: 1,
  focusScale: 1, // 单张铺满这会儿的缩放（第一块）
  panelFor: null,
  meta: {}, // file → propsMeta from the runtime
  tweaks: {}, // file → { prop: value } set in the panel; kept in localStorage per canvas (loadTweaks / saveTweaks)
  errors: {}, // file → render errors the runtime reported
  frames: new Map(), // file → { box, iframe, strip, loaded, loading, warm, frozen }
  hover: null, // the board under the pointer: it moves even when small
  reviews: {}, // file → { status, at, by, note, sha256, changed } (db.json review/<file>)
  global: loadGlobals(), // { dark, reduce }: the top bar's switches for every board
  compare: null // { kind: 'board', file } | { kind: 'version', id, label }: the second board in focus
};
function loadGlobals() {
  try {
    return { dark: false, reduce: false, ...JSON.parse(localStorage.getItem('dw.globals') || '{}') };
  } catch {
    return { dark: false, reduce: false };
  }
}
const RV_LABEL = { proposed: '待批', approved: '已批准', rejected: '退回' };

const stage = $('#stage');
const world = $('#world');
const strips = $('#strips');

// ---------- 地址 ----------
function emuQuery() {
  const p = new URLSearchParams();
  if (S.global.dark) p.set('va-scheme', 'dark');
  if (S.global.reduce) p.set('va-motion', 'reduce');
  const q = p.toString();
  return q ? `?${q}` : '';
}
function boardUrl(file, version = S.version) {
  const f = file.split('/').map(encodeURIComponent).join('/');
  return (version ? `/v/${S.name}/${version}/${f}` : `/c/${S.name}/${f}`) + emuQuery();
}
/** A board on the canvas view: embed.js goes first, so it can be held still. */
const frameUrl = (file) => {
  const u = boardUrl(file);
  return `${u}${u.includes('?') ? '&' : '?'}va-embed=1`;
};
function readHash() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [name, q = ''] = h.split('?');
  const p = new URLSearchParams(q);
  if (name.startsWith('ds/')) return { ds: name.slice(3) || null, s: p.get('s') };
  if (name.startsWith('motion/')) return { motion: name.slice(7) || null, p: p.get('p') };
  if (name.startsWith('qa/')) return { checks: true };
  return { name: name || null, page: p.get('page'), board: p.get('board'), v: p.get('v'), vs: p.get('vs') };
}
// Shown inside another program's page (Pomelo's 有板有眼 puts this UI in a frame): tell it where we are, so its own
// list can follow. Nobody listening is fine.
function tellParent() {
  if (window.parent === window) return;
  try {
    const away = S.motion || S.ds || S.checks;
    window.parent.postMessage({ source: 'dw', type: 'route', name: away ? null : S.name || null, page: away ? null : S.page || null, board: away ? null : S.focus || null, ds: S.ds || null, motion: S.motion || null, checks: S.checks || false }, '*');
  } catch {}
}
function writeHash() {
  writeHashOnly();
  tellParent();
}
/** The review statuses of the canvas being looked at, for the program around this page (Pomelo's 有板有眼 can show
 *  them in its own list; Phase 2 B6): { source: 'dw', type: 'reviews', name, reviews: { 文件: { status, note, at, changed } } }. */
function tellReviews() {
  if (window.parent === window || !S.name || S.kind !== 'canvas') return;
  try {
    window.parent.postMessage({ source: 'dw', type: 'reviews', name: S.name, reviews: S.reviews }, '*');
  } catch {}
}
/** Something was renamed or deleted (here or elsewhere): the program around this page reads its list again. */
function tellChanged() {
  if (window.parent === window) return;
  try {
    window.parent.postMessage({ source: 'dw', type: 'changed' }, '*');
  } catch {}
}
function writeHashOnly() {
  if (S.checks) {
    if (location.hash !== '#/qa/all') history.replaceState(null, '', '#/qa/all');
    return;
  }
  if (S.motion) {
    const h = `#/motion/${S.motion}${S.motionPart ? `?p=${S.motionPart}` : ''}`;
    if (location.hash !== h) history.replaceState(null, '', h);
    return;
  }
  if (S.ds) {
    const h = `#/ds/${S.ds}${S.dsSection && S.dsSection !== 'overview' ? `?s=${S.dsSection}` : ''}`;
    if (location.hash !== h) history.replaceState(null, '', h);
    return;
  }
  const p = new URLSearchParams();
  if (S.page) p.set('page', S.page);
  if (S.focus) p.set('board', S.focus);
  if (S.focus && S.compare) p.set('vs', vsOf());
  if (S.version) p.set('v', S.version);
  const q = p.toString();
  const h = `#/${S.name || ''}${q ? `?${q}` : ''}`;
  if (location.hash !== h) history.replaceState(null, '', h);
}

// ---------- 数据 ----------
const pages = () => S.canvas?.pages || [];
const pageOf = (item) => item.page || pages()[0]?.id || null;
function boardsOnPage() {
  const all = S.canvas?.boards || {};
  const order = [...(S.canvas.order || []).filter((f) => all[f]), ...Object.keys(all).filter((f) => !(S.canvas.order || []).includes(f))];
  return order.filter((f) => pageOf(all[f]) === S.page).map((f) => ({ file: f, ...all[f] }));
}
function notesOnPage() {
  return Object.entries(S.canvas?.notes || {})
    .map(([id, n]) => ({ id, ...n }))
    .filter((n) => pageOf(n) === S.page);
}

async function loadList() {
  S.list = (await api('/api/canvases')).canvases;
  S.systems = await api('/api/ds').then((d) => d.systems, () => []);
  S.motionSchemes = await api('/api/motion').then((d) => d.schemes, () => []);
  S.checksSub = await api('/api/index').then((d) => d.sections.find((x) => x.id === 'checks')?.items?.[0]?.sub || '', () => '');
}

// ---------- Design System ----------
async function openDs(name, section = null) {
  leaveMotion();
  leaveChecks();
  closeMenus();
  if (S.focus) closeFocus();
  closePanel();
  S.ds = name;
  S.dsSection = section || 'overview';
  liveness();
  stage.hidden = true;
  $('#banner').hidden = true;
  $('#version-wrap').hidden = true;
  $('#globals').hidden = true;
  $('#ds-chips').replaceChildren();
  const sys = S.systems.find((x) => x.name === name);
  $('#canvas-title').textContent = sys?.title || name;
  const link = $('#cloud-link');
  link.hidden = !sys?.cloud?.url;
  if (sys?.cloud?.url) link.href = sys.cloud.url;
  // 换分节只改地址，交给 hashchange，前进后退也能用
  await openSystem(name, S.dsSection, { onNav: (id) => { location.hash = `#/ds/${name}${id !== 'overview' ? `?s=${id}` : ''}`; } });
  writeHash();
}
// ---------- Motion Deck ----------
async function openMotionView(name, part = null) {
  leaveDs();
  leaveChecks();
  closeMenus();
  if (S.focus) closeFocus();
  closePanel();
  S.motion = name;
  liveness();
  stage.hidden = true;
  $('#banner').hidden = true;
  $('#version-wrap').hidden = true;
  $('#globals').hidden = true;
  $('#ds-chips').replaceChildren();
  $('#cloud-link').hidden = true;
  const sch = S.motionSchemes.find((x) => x.name === name);
  $('#canvas-title').textContent = `Motion Deck · ${sch?.title || name}`;
  // 换零件只改地址，交给 hashchange，前进后退也能用
  S.motionPart = await openMotion(name, part, { onNav: (id) => { location.hash = `#/motion/${name}?p=${id}`; } });
  writeHash();
}
// ---------- Checks（npm run all 的结果） ----------
async function openChecksView() {
  leaveDs();
  leaveMotion();
  closeMenus();
  if (S.focus) closeFocus();
  closePanel();
  S.checks = true;
  liveness();
  stage.hidden = true;
  $('#banner').hidden = true;
  $('#version-wrap').hidden = true;
  $('#globals').hidden = true;
  $('#ds-chips').replaceChildren();
  $('#cloud-link').hidden = true;
  $('#canvas-title').textContent = 'Checks · npm run all';
  await openChecks();
  writeHash();
}
function leaveChecks() {
  if (!S.checks) return;
  S.checks = false;
  closeChecks();
  stage.hidden = false;
  $('#version-wrap').hidden = false;
  $('#globals').hidden = false;
}
function leaveMotion() {
  if (!S.motion) return;
  S.motion = null;
  S.motionPart = null;
  closeMotion();
  stage.hidden = false;
  $('#version-wrap').hidden = false;
  $('#globals').hidden = false;
}
function leaveDs() {
  if (!S.ds) return;
  S.ds = null;
  closeSystem();
  stage.hidden = false;
  $('#version-wrap').hidden = false;
  $('#globals').hidden = false;
}
const systemOfRecord = (d) => S.systems.find((x) => x.title === d.title || x.namespace.toLowerCase() === String(d.namespace).toLowerCase());
function renderDsChips() {
  const box = $('#ds-chips');
  const list = S.kind === 'canvas' ? S.canvas?.designSystems || [] : [];
  box.replaceChildren(
    ...list.map((d) => {
      const sys = systemOfRecord(d);
      return sys
        ? el('a', { class: 'pill ds-chip', href: `#/ds/${sys.name}`, title: `这块画布挂着 ${d.title}（ds/${d.namespace}/，${String(d.copiedAt || '').slice(0, 10)} 复制）`, text: d.title })
        : el('span', { class: 'pill ds-chip off', title: `这块画布挂着 ${d.title}，schemes/ 里没有它的源`, text: d.title });
    })
  );
}

async function openCanvas(name, { page = null, board = null, v = null, vs = null, keepView = false } = {}) {
  leaveDs();
  leaveMotion();
  leaveChecks();
  // a canvas made after this page loaded: read the list again before giving up on it
  if (name && !S.list.some((c) => c.name === name)) await loadList();
  const item = S.list.find((c) => c.name === name) || S.list[0];
  if (!item) {
    showEmpty('还没有画布。用 node bench/bin/dw.js new <画布名> 新建一块。');
    return;
  }
  const changed = item.name !== S.name || (v || null) !== S.version;
  S.name = item.name;
  S.kind = item.kind;
  S.version = v || null;
  const data = await api(`/api/canvases/${S.name}${S.version ? `?version=${encodeURIComponent(S.version)}` : ''}`);
  S.cloud = data.cloud;
  S.canvas = data.canvas || null;
  $('#canvas-title').textContent = item.title;
  const home = S.cloud?.home && S.cloud.targets?.[S.cloud.home]?.url;
  const link = $('#cloud-link');
  link.hidden = !home;
  if (home) link.href = home;
  if (changed) {
    S.meta = {};
    S.tweaks = loadTweaks(S.name);
    S.errors = {};
    S.selected = null;
    S.playing = null;
    S.compare = null;
    S.reviews = {};
    closePanel();
  }
  renderBanner();
  renderDsChips();
  if (S.kind === 'page') {
    S.page = null; // a page has no pages: don't carry the last canvas's into the address
    showPage();
  } else {
    $('#pageview').hidden = true;
    $('#pageview').src = 'about:blank';
    $('#tb-left').hidden = false;
    $('#tb-right').hidden = false;
    const ids = pages().map((p) => p.id);
    S.page = page && ids.includes(page) ? page : !keepView || !ids.includes(S.page) ? S.canvas.launch?.page && ids.includes(S.canvas.launch.page) ? S.canvas.launch.page : ids[0] || null : S.page;
    renderWorld({ keepView: keepView && !changed });
    loadReviews();
    const launchFile = S.canvas.launch?.view === 'focused' ? S.canvas.launch.file : null;
    if (board && vs !== undefined && (vs || null) !== (S.compare ? vsOf() : null)) S.compare = parseVs(vs, board);
    if (board && S.canvas.boards[board]) openFocus(board);
    else if (!keepView && launchFile && S.canvas.boards[launchFile]) openFocus(launchFile);
    else if (!board && S.focus) closeFocus();
  }
  writeHash();
}

function showEmpty(text) {
  const e = $('#empty');
  e.textContent = text;
  e.hidden = !text;
}

function showPage() {
  world.replaceChildren();
  strips.replaceChildren();
  S.frames.clear();
  $('#tb-left').hidden = true;
  $('#tb-right').hidden = true;
  const pv = $('#pageview');
  pv.hidden = false;
  const entry = S.cloud?.entry || '';
  const src = (S.version ? `/v/${S.name}/${S.version}/${encodeURIComponent(entry)}` : `/c/${S.name}/`) + emuQuery();
  if (pv.getAttribute('src') !== src) pv.src = src;
  showEmpty('');
}

function renderBanner() {
  const b = $('#banner');
  if (!S.version) {
    b.hidden = true;
    stage.style.top = '48px';
    $('#version-btn').textContent = '最新';
    return;
  }
  const v = S.versions.find((x) => x.id === S.version);
  b.replaceChildren(
    el('span', { text: `在看本地版本 ${S.version}${v ? `（${labelOf(v.label)}）` : ''}，只读。` }),
    el('button', { text: '回到最新', onclick: () => openCanvas(S.name, { page: S.page }) })
  );
  b.hidden = false;
  stage.style.top = `${48 + b.offsetHeight}px`;
  $('#version-btn').textContent = `版本 ${S.version.slice(0, 15)}`;
}

// ---------- 画布 ----------
function renderWorld({ keepView = false } = {}) {
  world.replaceChildren();
  strips.replaceChildren();
  S.frames.clear();
  const boards = boardsOnPage();
  const notes = notesOnPage();
  showEmpty(boards.length || notes.length ? '' : '这一页没有画板');

  for (const n of notes) world.append(noteEl(n));
  boards.forEach((b, i) => {
    const box = el('div', {
      class: 'board',
      'data-file': b.file,
      style: { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px`, zIndex: String(10 + i), borderRadius: b.radius ? `${b.radius}px` : '' }
    });
    const iframe = el('iframe', { title: b.title || b.file, loading: 'eager' });
    // embed.js says when it's loaded; the frame's own load event too (a server from before embed.js has none)
    iframe.addEventListener('load', () => {
      const f = S.frames.get(b.file);
      if (f?.loaded && f.iframe === iframe && iframe.getAttribute('src') !== 'about:blank') loaded(f);
    });
    box.append(iframe);
    world.append(box);
    const strip = stripEl(b);
    strips.append(strip);
    S.frames.set(b.file, { b, box, iframe, strip, loaded: false, loading: false, warm: false, frozen: false });
  });
  for (const n of world.querySelectorAll('.note-title')) fitTitle(n);

  renderPageButton();
  if (!keepView) fitView();
  else applyView();
}

function noteEl(n) {
  const base = { left: `${n.x}px`, top: `${n.y}px` };
  if (n.kind === 'title1') {
    const t = el('div', { class: 'note-title', text: n.text, style: { ...base, color: n.color ? cssColor(n.color) : '', fontStyle: n.italic ? 'italic' : '' } });
    t.dataset.maxw = n.maxW || '';
    return t;
  }
  if (n.kind === 'rect' || n.kind === 'oval') {
    return el('div', { class: `shape ${n.kind}`, style: { ...base, width: `${n.w || 200}px`, height: `${n.h || 120}px` } });
  }
  if (n.kind && n.kind !== 'sticky') return el('div', { style: { display: 'none' } });
  const size = typeof n.size === 'number' ? n.size : SIZE[n.size] || SIZE.m;
  return el('div', {
    class: 'sticky',
    text: n.text,
    style: {
      ...base,
      width: `${n.w || 320}px`,
      maxHeight: `${Math.round((n.w || 320) * 4 / 3)}px`,
      background: STICKY[n.fill] || STICKY.yellow,
      fontSize: `${size}px`,
      fontWeight: n.bold ? '700' : '',
      fontStyle: n.italic ? 'italic' : ''
    }
  });
}
const cssColor = (c) => STICKY[c] ? { red: '#d24b3e', orange: '#d97a1f', green: '#3c9a4d', teal: '#2e9c90', blue: '#3c6fe0', purple: '#7b5be0', pink: '#d0569a', gray: '#8a8883' }[c] || c : c;

// 太长的大标题缩小字号，放进 maxW
function fitTitle(n) {
  const maxW = Number(n.dataset.maxw);
  if (!maxW) return;
  const w = n.scrollWidth;
  if (w > maxW) n.style.fontSize = `${Math.max(12, Math.floor((72 * maxW) / w))}px`;
}

function stripEl(b) {
  const strip = el('div', { class: 'strip', 'data-file': b.file });
  const title = el('span', { class: 't', text: b.title || b.file.replace(/\.dc\.html$/, ''), title: b.title || b.file, onclick: () => select(b.file) });
  const rv = el('button', { class: 'rv', hidden: true, onclick: (e) => openReviewMenu(b.file, e.currentTarget) });
  const acts = el('span', { class: 'acts' });
  const err = el('span', { class: 'err', title: '这张板在运行时报错了', hidden: true });
  acts.append(
    el('button', { class: 'more', title: '改名、删除', 'aria-label': `${b.title || b.file}：改名、删除`, 'aria-haspopup': 'menu', hidden: !!S.version, onclick: (e) => { e.stopPropagation(); openActMenu(e.currentTarget, boardActs(b.file)); } }, '⋯'),
    el('button', { class: 'tw', title: 'Tweaks', 'aria-label': 'Tweaks', hidden: true, onclick: () => openPanel(b.file) }, svg(ICON.tweaks)),
    el('button', { class: 'open', title: '单张打开（新标签页）', 'aria-label': '单张打开', onclick: () => window.open(boardUrl(b.file), '_blank') }, svg(ICON.open)),
    el('button', { title: '铺满（双击画板也行）', 'aria-label': '铺满', onclick: () => openFocus(b.file) }, svg(ICON.expand))
  );
  if (b.is_interactive) {
    acts.append(el('button', { class: 'play', title: '在画布上试玩（Esc 停）', onclick: () => togglePlay(b.file) }, [svg(ICON.play), el('span', { class: 'lbl', text: 'PLAY' })]));
  }
  strip.append(err, title, rv, acts);
  return strip;
}

function refreshStrip(file) {
  const f = S.frames.get(file);
  if (!f) return;
  f.strip.querySelector('.err').hidden = !(S.errors[file] && S.errors[file].length);
  f.strip.querySelector('.err').title = (S.errors[file] || []).map((e) => e.message || String(e)).join('\n') || '';
  const tw = f.strip.querySelector('.tw');
  tw.hidden = !hasTweaks(file);
  tw.classList.toggle('set', tweaked(file));
  tw.title = tweaked(file) ? 'Tweaks（改过，记着上次的值）' : 'Tweaks';
  const rv = f.strip.querySelector('.rv');
  const rec = S.reviews[file];
  rv.hidden = !rec || !!S.version;
  if (rec) {
    rv.className = `rv ${rec.status}${rec.changed ? ' changed' : ''}`;
    rv.textContent = RV_LABEL[rec.status] || rec.status;
    rv.title = reviewTitle(rec);
  }
  fitStrip(f);
  f.strip.classList.toggle('sel', S.selected === file);
  const play = f.strip.querySelector('.play');
  if (play) {
    const on = S.playing === file;
    play.classList.toggle('on', on);
    play.replaceChildren(svg(on ? ICON.stop : ICON.play), el('span', { class: 'lbl', text: on ? '停止' : 'PLAY' }));
  }
}

function renderPageButton() {
  const ps = pages();
  $('#page-wrap').hidden = ps.length < 2;
  $('#page-sep').hidden = ps.length < 2;
  const i = ps.findIndex((p) => p.id === S.page);
  $('#page-btn').replaceChildren(el('span', { class: 'n', text: String(ps.length) }), el('span', { class: 'lb', text: ps[i]?.name || '' }), svg('m7 10 5 5 5-5'));
}

// ---------- 视图 ----------
function viewport() {
  const r = stage.getBoundingClientRect();
  return { w: r.width, h: r.height };
}
function applyView() {
  const { tx, ty, z } = S.view;
  world.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
  $('#zoom-btn').textContent = `${Math.round(z * 100)}%`;
  for (const f of S.frames.values()) {
    const { x, y, w } = f.b;
    const sx = tx + x * z;
    const sy = ty + y * z;
    const sw = w * z;
    Object.assign(f.strip.style, { left: `${sx}px`, top: `${sy - 28}px`, width: `${Math.max(sw, 24)}px` });
    fitStrip(f);
  }
  scheduleLoad();
}
// 窄了先藏「单张打开」和 PLAY 的字，再窄就只留标题，别把标题挤成半个字
function fitStrip(f) {
  const sw = f.b.w * S.view.z;
  const tw = !f.strip.querySelector('.tw').hidden;
  const play = !!f.strip.querySelector('.play');
  const rv = f.strip.querySelector('.rv')?.hidden === false ? 64 : 0;
  const more = S.version ? 0 : 24;
  const full = 64 + rv + more + (tw ? 24 : 0) + 48 + (play ? 68 : 0);
  const tight = 64 + rv + more + (tw ? 24 : 0) + 24 + (play ? 30 : 0);
  f.strip.classList.toggle('tight', sw < full && sw >= tight);
  f.strip.classList.toggle('narrow', sw < tight);
  f.strip.hidden = sw < 24;
}
function bbox() {
  const items = [
    ...boardsOnPage().map((b) => ({ x: b.x, y: b.y - 40, w: b.w, h: b.h + 40 })),
    ...[...world.children].filter((n) => !n.classList.contains('board') && n.style.display !== 'none').map((n) => ({ x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight }))
  ];
  if (!items.length) return null;
  const x0 = Math.min(...items.map((i) => i.x));
  const y0 = Math.min(...items.map((i) => i.y));
  const x1 = Math.max(...items.map((i) => i.x + i.w));
  const y1 = Math.max(...items.map((i) => i.y + i.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function fitView() {
  const b = bbox();
  const { w, h } = viewport();
  if (!b) {
    S.view = { tx: w / 2, ty: h / 2, z: 1 };
    return applyView();
  }
  const top = 64;
  const pad = 48;
  const z = Math.min(MAX_Z, 1, (w - pad * 2) / b.w, (h - top - pad) / b.h);
  S.view = { z, tx: (w - b.w * z) / 2 - b.x * z, ty: top + (h - top - pad - b.h * z) / 2 - b.y * z };
  applyView();
}
function zoomAt(z, px, py) {
  const nz = Math.min(MAX_Z, Math.max(MIN_Z, z));
  const { tx, ty, z: oz } = S.view;
  S.view = { z: nz, tx: px - (px - tx) * (nz / oz), ty: py - (py - ty) * (nz / oz) };
  applyView();
}
function zoomBy(f) {
  const { w, h } = viewport();
  zoomAt(S.view.z * f, w / 2, h / 2);
}

// 只载入在视野里（或附近）的画板，Pomelo 的板子一张就有 1 MB。离视野中心近的先载，一次最多 MAX_LOADING 张：
// 一页十几张同时开会把主线程占住好几秒（在 Pomelo 里整个 App 都跟着卡）。
const MAX_LOADING = 2;
const LOAD_TIMEOUT = 8000; // 一张一直没载完也不挡后面的
const WARM_MS = 1500; // 载入后先让它动这么久（开场动画、第一帧），再看要不要定格
const LIVE_W = 360; // 屏幕上窄于这个宽度的板定格，悬停、选中、试玩、开着 Tweaks 的除外
let loadTimer = null;
function scheduleLoad() {
  clearTimeout(loadTimer);
  loadTimer = setTimeout(loadVisible, 60);
}
function onScreen(f, margin = 0) {
  const { w, h } = viewport();
  const { tx, ty, z } = S.view;
  const { x, y, w: bw, h: bh } = f.b;
  const sx = tx + x * z;
  const sy = ty + y * z;
  return !(sx + bw * z < -margin || sy + bh * z < -margin || sx > w + margin || sy > h + margin);
}
function loadVisible() {
  const { w, h } = viewport();
  const { tx, ty, z } = S.view;
  const want = [];
  for (const [file, f] of S.frames) {
    if (f.loaded || !onScreen(f, 300)) continue;
    const cx = tx + (f.b.x + f.b.w / 2) * z - w / 2;
    const cy = ty + (f.b.y + f.b.h / 2) * z - h / 2;
    want.push({ file, f, d: cx * cx + cy * cy });
  }
  want.sort((a, b) => a.d - b.d);
  let busy = [...S.frames.values()].filter((f) => f.loading).length;
  for (const { file, f } of want) {
    if (busy >= MAX_LOADING) break;
    startLoad(file, f);
    busy++;
  }
  liveness();
}
function startLoad(file, f) {
  f.loaded = true;
  f.loading = true;
  f.warm = false;
  f.frozen = false;
  clearTimeout(f.slow);
  f.slow = setTimeout(() => loaded(f), LOAD_TIMEOUT);
  f.iframe.src = frameUrl(file);
}
/** A board's page finished loading (embed.js says so), or took too long: start the next, and let it move a while. */
function loaded(f) {
  clearTimeout(f.slow);
  f.frozen = false; // a new page starts moving, whatever the old one was
  f.warm = false;
  clearTimeout(f.warmTimer);
  f.warmTimer = setTimeout(() => {
    f.warm = true;
    liveness();
  }, WARM_MS);
  if (f.loading) {
    f.loading = false;
    scheduleLoad();
  }
}
/** Which boards on the canvas move: on screen, big enough (or hovered, selected, playing, in Tweaks), not under a
 *  board shown full size. The rest hold still; nothing is unloaded, so Tweaks and where a board was stay. */
function liveness() {
  const z = S.view.z;
  for (const [file, f] of S.frames) {
    if (!f.loaded || f.loading || !f.warm) continue;
    const keep = S.playing === file || S.selected === file || S.hover === file || S.panelFor === file;
    const live = !S.focus && !S.ds && !S.motion && !S.checks && onScreen(f) && (keep || f.b.w * z >= LIVE_W);
    if (f.frozen === !live) continue;
    try {
      const win = f.iframe.contentWindow;
      if (typeof win?.__vaFreeze !== 'function') continue;
      win.__vaFreeze(!live);
      f.frozen = !live;
      f.box.classList.toggle('still', !live);
    } catch {}
  }
}

// ---------- 选择、试玩 ----------
function select(file) {
  const prev = S.selected;
  S.selected = file;
  for (const k of [prev, file]) if (k && S.frames.get(k)) S.frames.get(k).box.classList.toggle('sel', k === file);
  if (prev) refreshStrip(prev);
  if (file) refreshStrip(file);
  if (S.panelFor && file && hasTweaks(file)) openPanel(file);
  liveness();
}
function togglePlay(file) {
  const prev = S.playing;
  S.playing = prev === file ? null : file;
  for (const k of [prev, file]) {
    const f = k && S.frames.get(k);
    if (!f) continue;
    f.box.classList.toggle('playing', k === S.playing);
    refreshStrip(k);
  }
  if (S.playing) select(file);
  liveness();
}

// ---------- 单张铺满（可以并排对比） ----------
let focusFrame = null;
let compareFrame = null;
const vsOf = () => (S.compare ? (S.compare.kind === 'board' ? S.compare.file : `@${S.compare.id}`) : null);
function parseVs(vs, file) {
  if (!vs) return null;
  if (vs.startsWith('@')) return { kind: 'version', id: vs.slice(1), label: vs.slice(1, 16) };
  return vs !== file && S.canvas?.boards?.[vs] ? { kind: 'board', file: vs } : null;
}
/** The board the second pane shows, for Tweaks and messages: another board, or this one (an old version). */
const compareFile = () => (S.compare ? (S.compare.kind === 'board' ? S.compare.file : S.focus) : null);
function paneFrame(src, b, title) {
  const frame = el('div', { class: 'focus-frame', style: { width: `${b.w}px`, height: `${b.h}px`, borderRadius: b.radius ? `${b.radius}px` : '' } });
  const iframe = el('iframe', { title, src });
  hookZoom(iframe);
  frame.append(iframe);
  return { iframe, sizer: el('div', { class: 'focus-sizer', 'data-w': String(b.w), 'data-h': String(b.h) }, frame) };
}
function openFocus(file) {
  const b = S.canvas?.boards?.[file];
  if (!b) return;
  S.focus = file;
  $('#focus').hidden = false;
  $('#focus-title').textContent = b.title || file;
  const body = $('#focus-body');
  body.replaceChildren();
  const isPage = b.expand === 'fill';
  if (isPage || (S.compare?.kind === 'board' && (S.compare.file === file || !S.canvas.boards[S.compare.file]))) S.compare = null;
  body.classList.toggle('page', isPage);
  body.classList.toggle('compare', !!S.compare);
  $('#focus-fit').hidden = isPage;
  $('#focus-zoom').hidden = isPage;
  $('#focus-more').hidden = !!S.version || S.kind !== 'canvas';
  $('#focus-compare').parentElement.hidden = isPage;
  const main = paneFrame(boardUrl(file), b, b.title || file);
  focusFrame = main.iframe;
  compareFrame = null;
  if (S.compare) {
    const c = S.compare;
    const ob = c.kind === 'board' ? S.canvas.boards[c.file] : b;
    const second = paneFrame(c.kind === 'board' ? boardUrl(c.file) : boardUrl(file, c.id), ob, ob.title || file);
    compareFrame = second.iframe;
    const label = (k, name, extra = []) => el('div', { class: 'pane-label' }, [el('span', { text: k }), el('b', { text: name }), ...extra]);
    body.append(
      el('div', { class: 'focus-pane' }, [label(S.version ? `版本 ${S.version.slice(0, 15)}` : '现在', b.title || file), main.sizer]),
      el('div', { class: 'focus-pane' }, [label(c.kind === 'board' ? '另一张' : `版本 ${c.label}`, c.kind === 'board' ? ob.title || c.file : b.title || file, [el('button', { text: '关掉对比', onclick: () => setCompare(null) })]), second.sizer])
    );
  } else body.append(main.sizer);
  layoutFocus();
  const list = boardsOnPage().map((x) => x.file);
  const i = list.indexOf(file);
  $('#focus-prev').disabled = i <= 0;
  $('#focus-next').disabled = i < 0 || i >= list.length - 1;
  $('#focus-tweaks').setAttribute('aria-pressed', String(S.panelFor === file));
  $('#focus-compare').setAttribute('aria-pressed', String(!!S.compare));
  renderFocusReview();
  if (S.panelFor) openPanel(file);
  liveness(); // 背后画布上的板都定格
  writeHash();
}
function setCompare(c) {
  S.compare = c;
  if (S.focus) openFocus(S.focus);
}
function layoutFocus() {
  if (!S.focus) return;
  const b = S.canvas.boards[S.focus];
  const body = $('#focus-body');
  if (!body.querySelector('.focus-sizer') || b.expand === 'fill') return;
  // 面板在宽屏时贴右边，窄屏（≤ 720）时在底部，铺满区给它让位
  const narrow = innerWidth <= 720;
  const panel = S.panelFor ? $('#panel').getBoundingClientRect() : null;
  const cutW = panel && !narrow ? panel.width + 24 : 0;
  const cutH = panel && narrow ? panel.height + 12 : 0;
  const compare = body.classList.contains('compare');
  body.style.paddingRight = compare && cutW ? `${cutW}px` : '';
  body.style.paddingBottom = compare && cutH ? `${cutH}px` : '';
  body.classList.toggle('fit', S.fit === 'fit');
  for (const sizer of body.querySelectorAll('.focus-sizer')) {
    const host = compare ? sizer.parentElement : body;
    const bw = Number(sizer.dataset.w);
    const bh = Number(sizer.dataset.h);
    const W = host.clientWidth - (compare ? 0 : cutW);
    const H = host.clientHeight - (compare ? 32 : cutH);
    const pad = compare ? 18 : 30;
    const s = S.fit === 'fit' ? Math.min((W - pad * 2) / bw, (H - pad * 2) / bh) : S.fit === 'fill' ? (W - pad * 2) / bw : S.focusZ;
    if (sizer === body.querySelector('.focus-sizer')) S.focusScale = s;
    sizer.querySelector('.focus-frame').style.transform = `scale(${s})`;
    const sw = bw * s;
    const sh = bh * s;
    // 放大到比窗口大时左右也能滚：右边留一样的空（块的右外边距不算进滚动范围，所以用 border）
    Object.assign(sizer.style, { width: `${sw}px`, height: `${sh}px`, marginLeft: `${Math.max(pad, (W - sw) / 2)}px`, marginTop: `${S.fit === 'fill' ? pad : Math.max(pad, (H - sh) / 2)}px`, marginBottom: `${pad}px`, borderRight: sw + pad * 2 > W ? `${pad}px solid transparent` : '', boxSizing: 'content-box' });
  }
  for (const btn of document.querySelectorAll('#focus-fit button')) btn.classList.toggle('on', btn.dataset.fit === S.fit);
  $('#focus-zoom-pct').textContent = `${Math.round(S.focusScale * 100)}%`;
  $('#focus-zoom-out').disabled = S.focusScale <= FOCUS_MIN + 1e-6;
  $('#focus-zoom-in').disabled = S.focusScale >= FOCUS_MAX - 1e-6;
}
// 单张铺满的放大缩小（站主 2026-11-14）：按住 ⌘（或触控板捏合）滚轮以指着的地方为中心，按钮和 + − 键以窗口中间为中心；
// 0 回到 100%，1 整张放进窗口。并排对比时两边一起变（同一个倍数，方便比大小）。
const FOCUS_MIN = 0.1;
const FOCUS_MAX = 8;
function setFit(mode) {
  S.fit = mode;
  layoutFocus();
}
function zoomFocus(factor, at = null) {
  if (!S.focus || S.canvas?.boards?.[S.focus]?.expand === 'fill') return;
  const body = $('#focus-body');
  const single = !body.classList.contains('compare');
  const s0 = S.focusScale || 1;
  const s1 = Math.min(FOCUS_MAX, Math.max(FOCUS_MIN, s0 * factor));
  let keep = null;
  const sizer = () => body.querySelector('.focus-sizer');
  if (single && sizer()) {
    const r = body.getBoundingClientRect();
    const ax = at && at.x != null ? at.x - r.left : body.clientWidth / 2;
    const ay = at && at.y != null ? at.y - r.top : body.clientHeight / 2;
    keep = { ax, ay, cx: (body.scrollLeft + ax - sizer().offsetLeft) / s0, cy: (body.scrollTop + ay - sizer().offsetTop) / s0 };
  }
  S.fit = 'zoom';
  S.focusZ = s1;
  layoutFocus();
  if (keep) {
    body.scrollLeft = keep.cx * s1 + sizer().offsetLeft - keep.ax;
    body.scrollTop = keep.cy * s1 + sizer().offsetTop - keep.ay;
  }
}
const focusZoomTo = (z) => zoomFocus(z / (S.focusScale || 1));
const wheelFactor = (e) => Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.01));
/** ⌘ / 触控板捏合在画板里面滚也能放大缩小（画板和界面同源，接得到它的滚轮） */
function hookZoom(iframe) {
  iframe.addEventListener('load', () => {
    let win;
    try {
      win = iframe.contentWindow;
      if (!win) return;
      win.addEventListener('wheel', (e) => {
        if (!(e.ctrlKey || e.metaKey) || !S.focus) return;
        e.preventDefault();
        const r = iframe.getBoundingClientRect();
        const k = r.width / (iframe.offsetWidth || r.width || 1);
        zoomFocus(wheelFactor(e), { x: r.left + e.clientX * k, y: r.top + e.clientY * k });
      }, { passive: false });
      win.addEventListener('keydown', (e) => {
        if (!(e.ctrlKey || e.metaKey) || !S.focus) return;
        if (zoomKey(e.key)) e.preventDefault();
      });
    } catch {}
  });
}
/** The keys that zoom a board shown full size; true when the key was one of them. */
function zoomKey(key) {
  if (key === '+' || key === '=') zoomFocus(1.25);
  else if (key === '-' || key === '_') zoomFocus(0.8);
  else if (key === '0') focusZoomTo(1);
  else if (key === '1') setFit('fit');
  else return false;
  return true;
}
function closeFocus() {
  S.focus = null;
  S.compare = null;
  focusFrame = null;
  compareFrame = null;
  $('#focus').hidden = true;
  $('#focus-body').replaceChildren();
  writeHash();
  scheduleLoad();
}
function stepFocus(d) {
  const list = boardsOnPage().map((x) => x.file);
  const i = list.indexOf(S.focus);
  const next = list[i + d];
  if (!next) return;
  // 旧版本跟着那张板走，换了板就不对比了；另一张板留着（除非换到的就是它）
  if (S.compare?.kind === 'version' || (S.compare?.kind === 'board' && S.compare.file === next)) S.compare = null;
  openFocus(next);
}
async function buildCompareMenu() {
  const m = $('#compare-menu');
  const file = S.focus;
  m.replaceChildren(el('p', { class: 'head', text: '载入中…' }));
  let versions = [];
  try {
    versions = (await api(`/api/canvases/${S.name}/versions?file=${encodeURIComponent(file)}`)).versions;
  } catch {}
  m.replaceChildren();
  if (S.compare) m.append(el('button', { role: 'menuitem', onclick: () => { closeMenus(); setCompare(null); } }, [el('span', { class: 'grow', text: '关掉对比' })]));
  m.append(el('p', { class: 'head', text: '和另一张板' }));
  for (const b of boardsOnPage()) {
    if (b.file === file) continue;
    const on = S.compare?.kind === 'board' && S.compare.file === b.file;
    m.append(el('button', { role: 'menuitem', class: on ? 'on' : '', onclick: () => { closeMenus(); setCompare({ kind: 'board', file: b.file }); } }, [el('span', { class: 'grow', text: b.title || b.file })]));
  }
  // 这张板在本地版本里的每个样子（同样的只列最新存的那次）
  m.append(el('p', { class: 'head', text: '和这张的旧版本（本地存过的）' }));
  let prev = null;
  let n = 0;
  for (const v of [...versions].reverse()) {
    if (!v.board || v.board === prev) continue;
    prev = v.board;
    n++;
    const when = new Date(v.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const on = S.compare?.kind === 'version' && S.compare.id === v.id;
    m.append(el('button', { role: 'menuitem', class: on ? 'on' : '', onclick: () => { closeMenus(); setCompare({ kind: 'version', id: v.id, label: `${labelOf(v.label)} ${when}` }); } }, [el('span', { class: 'grow two' }, [el('span', { text: labelOf(v.label) }), el('span', { class: 'sub', text: when })])]));
  }
  if (!n) m.append(el('p', { class: 'head', text: '还没有存过（dw snapshot 存一个）' }));
}

// ---------- 批准状态 ----------
const reviewTitle = (rec) => {
  const when = new Date(rec.at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `${RV_LABEL[rec.status] || rec.status} · ${when}${rec.by === 'agent' ? ' · Agent 标的' : ''}${rec.note ? `\n${rec.status === 'rejected' ? '原因' : '备注'}：${rec.note}` : ''}${rec.changed ? '\n标完以后这张板又改过' : ''}`;
};
async function loadReviews() {
  if (S.kind !== 'canvas' || !S.name) {
    S.reviews = {};
    return;
  }
  try {
    S.reviews = (await api(`/api/review/${S.name}`)).reviews || {};
  } catch {
    S.reviews = {};
  }
  for (const file of S.frames.keys()) refreshStrip(file);
  renderFocusReview();
  tellReviews();
}
async function postReview(file, status, note = '') {
  try {
    const r = await fetch(`/api/review/${S.name}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file, status, note }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.message || `${r.status}`);
    S.reviews = d.reviews || {};
  } catch (e) {
    toast(`没记上：${e.message}`);
    return;
  }
  for (const f of S.frames.keys()) refreshStrip(f);
  renderFocusReview();
  tellReviews();
  toast({ approved: '已批准', rejected: '已退回', proposed: '改回待批', clear: '清掉了' }[status]);
}
function renderFocusReview() {
  if (!S.focus) return;
  const box = $('#focus-review');
  box.hidden = !!S.version || S.kind !== 'canvas';
  const rec = S.reviews[S.focus];
  const st = $('#focus-rv-state');
  st.className = rec ? `rv ${rec.status}${rec.changed ? ' changed' : ''}` : 'rv none';
  st.textContent = rec ? RV_LABEL[rec.status] || rec.status : '没标';
  st.title = rec ? reviewTitle(rec) : '还没有批准状态';
  $('#focus-approve').setAttribute('aria-pressed', String(rec?.status === 'approved'));
  $('#focus-reject').setAttribute('aria-pressed', String(rec?.status === 'rejected'));
}
function openReviewMenu(file, anchor, { rejecting = false } = {}) {
  closeMenus();
  const m = $('#review-menu');
  const wrap = $('#review-wrap');
  const r = anchor.getBoundingClientRect();
  wrap.style.left = `${Math.max(8, Math.min(r.left, innerWidth - 276))}px`;
  wrap.style.top = `${r.bottom}px`;
  const rec = S.reviews[file];
  const title = S.canvas?.boards?.[file]?.title || file;
  m.replaceChildren(el('p', { class: 'head', text: rec ? `${title} · ${RV_LABEL[rec.status] || rec.status}` : title }));
  if (rec?.note) m.append(el('p', { class: 'note', text: `${rec.status === 'rejected' ? '原因' : '备注'}：${rec.note}` }));
  if (rec?.changed) m.append(el('p', { class: 'note', text: '标完以后这张板又改过。' }));
  if (rejecting) {
    const ta = el('textarea', { placeholder: '为什么退回（可以不写）', 'aria-label': '退回的原因', onkeydown: (e) => { if (e.key === 'Escape') closeMenus(); } });
    ta.value = rec?.status === 'rejected' ? rec.note || '' : '';
    m.append(el('div', { style: { padding: '0 10px' } }, ta), el('button', { role: 'menuitem', onclick: () => { closeMenus(); postReview(file, 'rejected', ta.value); } }, [el('span', { class: 'grow', text: '退回' })]));
    setTimeout(() => ta.focus());
  } else {
    m.append(
      el('button', { role: 'menuitem', class: rec?.status === 'approved' ? 'on' : '', onclick: () => { closeMenus(); postReview(file, 'approved'); } }, [el('span', { class: 'grow', text: '批准' })]),
      el('button', { role: 'menuitem', class: rec?.status === 'rejected' ? 'on' : '', onclick: () => openReviewMenu(file, anchor, { rejecting: true }) }, [el('span', { class: 'grow', text: '退回…' })])
    );
    if (rec && rec.status !== 'proposed') m.append(el('button', { role: 'menuitem', onclick: () => { closeMenus(); postReview(file, 'proposed'); } }, [el('span', { class: 'grow', text: '改回待批' })]));
    if (rec) m.append(el('button', { role: 'menuitem', onclick: () => { closeMenus(); postReview(file, 'clear'); } }, [el('span', { class: 'grow', text: '清掉状态' })]));
  }
  m.hidden = false;
}

// ---------- 全局开关：深色、减弱动效 ----------
function renderGlobals() {
  for (const b of document.querySelectorAll('.g-dark')) b.setAttribute('aria-pressed', String(!!S.global.dark));
  for (const b of document.querySelectorAll('.g-motion')) b.setAttribute('aria-pressed', String(!!S.global.reduce));
}
function setGlobal(key, on) {
  S.global = { ...S.global, [key]: on };
  try {
    localStorage.setItem('dw.globals', JSON.stringify(S.global));
  } catch {}
  renderGlobals();
  // 系统设置要在画板载入时就生效，所以重新载入（Tweaks 在 __dc_booted 时再推一次）
  // 画布上的板按队重新载入（一次全开会卡）
  for (const f of S.frames.values()) {
    if (!f.loaded) continue;
    clearTimeout(f.slow);
    f.loaded = false;
    f.loading = false;
    f.iframe.src = 'about:blank';
  }
  scheduleLoad();
  if (S.focus) openFocus(S.focus);
  if (S.kind === 'page') showPage();
}
/** What the global dark switch sets on a board that has its own dark / theme parameter. */
function globalProps(file) {
  if (!S.global.dark) return {};
  const out = {};
  for (const [k, m] of editable(S.meta[file])) {
    const ed = String(m.editor);
    if (/^(dark|darkMode|isDark)$/.test(k) && ed === 'boolean') out[k] = true;
    else if (/^(theme|mode|scheme|colorScheme)$/.test(k) && ed === 'enum' && (m.options || []).some((o) => (typeof o === 'object' ? o.value : o) === 'dark')) out[k] = 'dark';
  }
  return out;
}

// ---------- Tweaks ----------
const editable = (meta) => Object.entries(meta || {}).filter(([k, m]) => !k.startsWith('$') && m && typeof m === 'object' && m.editor !== null && m.editor !== undefined);
const hasTweaks = (file) => editable(S.meta[file]).length > 0;
function defaultsOf(file) {
  const out = {};
  for (const [k, m] of editable(S.meta[file])) if ('default' in m) out[k] = m.default;
  return out;
}
/** What a board gets: its defaults, the global dark switch, then what was set in the panel (only keys it still has). */
function valuesOf(file) {
  const keys = new Set(editable(S.meta[file]).map(([k]) => k));
  const own = Object.fromEntries(Object.entries(S.tweaks[file] || {}).filter(([k]) => keys.has(k)));
  return { ...defaultsOf(file), ...globalProps(file), ...own };
}
// 记住的 Tweaks：localStorage 里每块画布一份 { 画板文件: { 参数: 值 } }。存不了（无痕窗口、关了存储）就只在这一次有效。
const tweaksKey = (name) => `dw.tweaks.${name}`;
function loadTweaks(name) {
  if (!name) return {};
  try {
    const v = JSON.parse(localStorage.getItem(tweaksKey(name)) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
function saveTweaks() {
  if (!S.name) return;
  try {
    const kept = Object.fromEntries(Object.entries(S.tweaks).filter(([, v]) => v && Object.keys(v).length));
    if (Object.keys(kept).length) localStorage.setItem(tweaksKey(S.name), JSON.stringify(kept));
    else localStorage.removeItem(tweaksKey(S.name));
  } catch {}
}
const tweaked = (file) => Object.keys(S.tweaks[file] || {}).length > 0;
function windowsOf(file) {
  const out = [];
  const f = S.frames.get(file);
  if (f?.iframe.contentWindow) out.push(f.iframe.contentWindow);
  if (S.focus === file && focusFrame?.contentWindow) out.push(focusFrame.contentWindow);
  if (compareFrame?.contentWindow && compareFile() === file) out.push(compareFrame.contentWindow);
  return out;
}
function pushTweaks(file) {
  for (const w of windowsOf(file)) {
    try {
      if (typeof w.__dcSetProps === 'function') w.__dcSetProps(w.__dcRootName(), valuesOf(file));
    } catch (e) {
      console.warn('[board] 设参数失败', file, e);
    }
  }
}
function fileOfWindow(win) {
  if (focusFrame && focusFrame.contentWindow === win) return S.focus;
  if (compareFrame && compareFrame.contentWindow === win) return compareFile();
  for (const [file, f] of S.frames) if (f.iframe.contentWindow === win) return file;
  return null;
}
// 运行时没带参数定义时，从画板源文件的 data-props 读
async function metaFromSource(file) {
  try {
    const text = await (await fetch(boardUrl(file), { cache: 'no-store' })).text();
    const m = text.match(/data-props='([^']*)'/) || text.match(/data-props="([^"]*)"/);
    if (!m) return null;
    const t = document.createElement('textarea');
    t.innerHTML = m[1];
    return JSON.parse(t.value);
  } catch {
    return null;
  }
}

addEventListener('message', async (e) => {
  const d = e.data;
  if (!d || typeof d !== 'object' || typeof d.type !== 'string') return;
  const file = fileOfWindow(e.source);
  if (!file) return;
  if (d.type === 'va-embed-ready') {
    const f = S.frames.get(file);
    if (f && f.iframe.contentWindow === e.source) loaded(f);
  } else if (d.type === '__dc_booted') {
    S.meta[file] = d.propsMeta || S.meta[file] || (await metaFromSource(file)) || {};
    if (S.tweaks[file] || Object.keys(globalProps(file)).length) pushTweaks(file);
    refreshStrip(file);
    if (S.panelFor === file) renderPanel();
  } else if (d.type === '__dc_render_errors') {
    S.errors[file] = Array.isArray(d.errors) ? d.errors : [];
    refreshStrip(file);
  }
});

function openPanel(file) {
  S.panelFor = file;
  $('#panel').hidden = false;
  $('#focus-tweaks').setAttribute('aria-pressed', 'true');
  renderPanel();
  layoutFocus();
  liveness();
}
function closePanel() {
  S.panelFor = null;
  $('#panel').hidden = true;
  $('#focus-tweaks').setAttribute('aria-pressed', 'false');
  layoutFocus();
  liveness();
}
function renderPanel() {
  const file = S.panelFor;
  if (!file) return;
  const b = S.canvas?.boards?.[file];
  $('#panel-title').textContent = b?.title || file;
  const body = $('#panel-body');
  body.replaceChildren();
  const fields = editable(S.meta[file]);
  if (!(file in S.meta)) {
    body.append(el('p', { class: 'none', text: '这张板还在载入。' }));
    return;
  }
  if (!fields.length) {
    body.append(el('p', { class: 'none', text: '这张板没有声明 Tweaks。' }));
    return;
  }
  const values = valuesOf(file);
  const sections = new Map();
  for (const [k, m] of fields) {
    const sec = m.section || '参数';
    if (!sections.has(sec)) sections.set(sec, []);
    sections.get(sec).push([k, m]);
  }
  for (const [sec, items] of sections) {
    body.append(el('h3', { text: sec }));
    for (const [k, m] of items) body.append(fieldEl(file, k, m, values[k]));
  }
}
function setTweak(file, key, value) {
  S.tweaks[file] = { ...(S.tweaks[file] || {}), [key]: value };
  saveTweaks();
  refreshStrip(file);
  pushTweaks(file);
}
function fieldEl(file, key, m, value) {
  const label = m.label || key;
  const id = `tw-${key}`;
  const ed = String(m.editor);
  if (ed === 'boolean') {
    const input = el('input', { type: 'checkbox', id, 'aria-label': label, onchange: (e) => setTweak(file, key, e.target.checked) });
    input.checked = Boolean(value);
    return el('label', { class: 'field switch', for: id }, [el('span', { text: label }), input]);
  }
  if (ed === 'enum') {
    const opts = (m.options || []).map((o) => (typeof o === 'object' ? o : { value: o, label: String(o) }));
    const short = opts.length <= 4 && opts.every((o) => String(o.label).length <= 6);
    if (short) {
      const seg = el('div', { class: 'seg', role: 'group', 'aria-label': label });
      for (const o of opts) {
        seg.append(el('button', { type: 'button', class: o.value === value ? 'on' : '', text: o.label, onclick: () => { setTweak(file, key, o.value); renderPanel(); } }));
      }
      return el('div', { class: 'field' }, [el('span', { text: label }), seg]);
    }
    const sel = el('select', { id, 'aria-label': label, onchange: (e) => setTweak(file, key, opts[e.target.selectedIndex].value) });
    for (const o of opts) sel.append(el('option', { text: o.label, selected: o.value === value }));
    return el('label', { class: 'field', for: id }, [el('span', { text: label }), sel]);
  }
  if (ed === 'color') {
    const text = el('input', { type: 'text', value: value ?? '', 'aria-label': `${label}（色值）`, onchange: (e) => { setTweak(file, key, e.target.value); renderPanel(); } });
    const pick = el('input', { type: 'color', id, value: /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#000000', oninput: (e) => { text.value = e.target.value; setTweak(file, key, e.target.value); } });
    const kids = [el('span', { text: label }), el('div', { class: 'inline' }, [pick, text])];
    if (Array.isArray(m.options) && m.options.length) {
      kids.push(el('div', { class: 'swatches' }, m.options.map((c) => el('button', { type: 'button', title: c, 'aria-label': c, style: { background: c }, onclick: () => { setTweak(file, key, c); renderPanel(); } }))));
    }
    return el('div', { class: 'field' }, kids);
  }
  if (ed === 'int' || ed === 'float' || ed === 'range') {
    const step = m.step ?? (ed === 'int' ? 1 : 0.1);
    const parse = (v) => (ed === 'int' ? parseInt(v, 10) : parseFloat(v));
    if (ed === 'range' || (m.min != null && m.max != null)) {
      const out = el('span', { text: `${value ?? ''}${m.unit || ''}` });
      const r = el('input', { type: 'range', id, min: m.min ?? 0, max: m.max ?? 100, step, value: value ?? m.min ?? 0, oninput: (e) => { out.textContent = `${e.target.value}${m.unit || ''}`; setTweak(file, key, parse(e.target.value)); } });
      return el('label', { class: 'field', for: id }, [el('span', { text: label }), el('div', { class: 'inline' }, [r, out])]);
    }
    const n = el('input', { type: 'number', id, step, value: value ?? '', onchange: (e) => setTweak(file, key, parse(e.target.value)) });
    return el('label', { class: 'field', for: id }, [el('span', { text: label }), n]);
  }
  const multi = typeof value === 'string' && value.includes('\n');
  const input = el(multi ? 'textarea' : 'input', { id, type: multi ? null : 'text', onchange: (e) => setTweak(file, key, e.target.value) });
  input.value = value ?? '';
  return el('label', { class: 'field', for: id }, [el('span', { text: label }), input]);
}

// ---------- 菜单 ----------
function toggleMenu(btn, menu, build) {
  const open = menu.hidden;
  closeMenus();
  if (!open) return;
  build?.();
  menu.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
}
function closeMenus() {
  for (const m of document.querySelectorAll('.menu')) m.hidden = true;
  for (const b of document.querySelectorAll('[aria-haspopup]')) b.setAttribute('aria-expanded', 'false');
}
// 四类，次序和 server/catalog.js 的 SECTIONS 一样
const deckOf = (c) => c.deck || (c.kind === 'page' ? 'questionnaire' : 'explore');
function buildCanvasMenu() {
  const m = $('#canvas-menu');
  m.replaceChildren();
  const item = (on, title, sub, go, acts = null) => {
    const main = el('button', { role: 'menuitem', class: on ? 'on' : '', onclick: () => { closeMenus(); go(); } }, [el('span', { class: 'grow two' }, [el('span', { text: title }), el('span', { class: 'sub', text: sub })])]);
    return acts ? withMore(main, title, acts) : main;
  };
  const onCanvas = (c) => !S.ds && !S.motion && !S.checks && c.name === S.name;
  const toCanvas = (c) => () => { closeFocus(); openCanvas(c.name); };
  const canvasActs = (c) => (S.version ? null : [['改名…', () => renameCanvasUi(c)], ['删除…', () => deleteCanvasUi(c), true]]);
  const schemeActs = (kind, d) => [['改名…', () => renameSchemeUi(kind, d)], ...(d.schemeTitle ? [[`回到原名「${d.schemeTitle}」`, () => resetSchemeName(kind, d)]] : [])];
  const sections = [
    ['Design System', S.systems.map((d) => item(S.ds === d.name, d.title, d.built ? `schemes · ${d.name}` : '还没构建：npm run build:ds', () => { location.hash = `#/ds/${d.name}`; }, schemeActs('ds', d)))],
    ['Motion Deck', S.motionSchemes.map((d) => item(S.motion === d.name, d.title, `${d.parts} 个零件`, () => { location.hash = `#/motion/${d.name}`; }, schemeActs('motion', d)))],
    ['Explore Deck', S.list.filter((c) => deckOf(c) === 'explore').map((c) => item(onCanvas(c), c.title, `${c.boards} 张板${c.pages?.length > 1 ? ` · ${c.pages.length} 页` : ''}`, toCanvas(c), canvasActs(c)))],
    ['Questionnaire', S.list.filter((c) => deckOf(c) === 'questionnaire').map((c) => item(onCanvas(c), c.title, '问卷页', toCanvas(c), canvasActs(c)))],
    ['Checks', [item(S.checks, 'npm run all', S.checksSub || '构建和检查的结果', () => { location.hash = '#/qa/all'; })]]
  ];
  for (const [title, rows] of sections) {
    if (!rows.length) continue;
    m.append(el('p', { class: 'head', text: title }), ...rows);
  }
}
function buildPageMenu() {
  const m = $('#page-menu');
  m.replaceChildren();
  for (const p of pages()) {
    const n = Object.values(S.canvas.boards).filter((b) => pageOf(b) === p.id).length;
    const main = el('button', { role: 'menuitem', class: p.id === S.page ? 'on' : '', onclick: () => { closeMenus(); S.page = p.id; renderWorld(); writeHash(); } }, [el('span', { class: 'grow', text: p.name }), el('span', { class: 'sub', text: `${n} 张` })]);
    m.append(S.version ? main : withMore(main, p.name, [['改名…', () => renamePageUi(p)], ['删除这一页…', () => deletePageUi(p, n), true]]));
  }
}

// ---------- 改名、删除 ----------
/** A menu row with a「⋯」after it that opens the row's own small menu. */
function withMore(main, title, acts) {
  const what = acts.some(([, , danger]) => danger) ? '改名、删除' : '改名';
  const more = el('button', { class: 'more', 'aria-label': `${title}：${what}`, title: what, 'aria-haspopup': 'menu', onclick: (e) => { e.stopPropagation(); openActMenu(e.currentTarget, acts); } }, '⋯');
  return el('div', { class: 'mrow' }, [main, more]);
}
function openActMenu(anchor, acts) {
  const m = $('#act-menu');
  const r = anchor.getBoundingClientRect();
  const wrap = $('#act-wrap');
  wrap.style.left = `${Math.max(8, Math.min(r.right - 180, innerWidth - 188))}px`;
  wrap.style.top = `${r.bottom + 4}px`;
  m.replaceChildren(...acts.map(([label, run, danger]) => el('button', { role: 'menuitem', class: danger ? 'danger' : '', onclick: () => { closeMenus(); run(); } }, [el('span', { class: 'grow', text: label })])));
  m.hidden = false;
  anchor.setAttribute('aria-expanded', 'true');
  m.querySelector('button')?.focus();
}
/** A small dialog: with `value`, asks for a name and gives it back (null when cancelled); without, asks yes or no. */
function ask({ title, text = '', value, ok = '确定', danger = false }) {
  const d = $('#ask');
  const input = $('#ask-input');
  $('#ask-title').textContent = title;
  $('#ask-text').textContent = text;
  $('#ask-text').hidden = !text;
  input.hidden = value === undefined;
  input.value = value ?? '';
  // 回车是「确定」（表单自己的回车会按第一个按钮，那是「取消」）
  input.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      d.close('ok');
    }
  };
  $('#ask-ok').textContent = ok;
  $('#ask-ok').classList.toggle('danger', danger);
  return new Promise((resolve) => {
    const done = (v) => {
      d.removeEventListener('close', onClose);
      resolve(v);
    };
    const onClose = () => done(d.returnValue === 'ok' ? (value === undefined ? true : input.value) : value === undefined ? false : null);
    d.addEventListener('close', onClose);
    d.returnValue = '';
    d.showModal();
    if (value !== undefined) {
      input.focus();
      input.select();
    } else $('#ask-cancel').focus();
  });
}
async function post(p, body) {
  const r = await fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || `${r.status}`);
  return d;
}
async function afterChange(name = S.name, opts = {}) {
  await loadList();
  tellChanged();
  if (S.ds || S.motion) return;
  if (!S.list.some((c) => c.name === name)) return openCanvas(S.list.find((c) => c.kind === 'canvas')?.name || S.list[0]?.name);
  if (name === S.name) return openCanvas(S.name, { page: opts.page ?? S.page, keepView: true });
}
async function undo(id, back) {
  try {
    const t = await post('/api/trash/restore', { id });
    await loadList();
    tellChanged();
    if (back) await openCanvas(t.canvas, { page: t.what === 'page' ? t.page.id : null });
    toast('放回去了');
  } catch (e) {
    toast(`放不回去：${e.message}`);
  }
}
async function renameCanvasUi(c) {
  const t = await ask({ title: `给「${c.title}」改名`, text: '只改名字，地址不变。', value: c.title, ok: '改名' });
  if (t == null || t.trim() === c.title) return;
  try {
    await post(`/api/canvases/${c.name}/rename`, { title: t });
  } catch (e) {
    return toast(`没改成：${e.message}`);
  }
  await afterChange(c.name);
  toast('改好了');
}
async function deleteCanvasUi(c) {
  const what = c.kind === 'page' ? '这份问卷（连同填的答案）' : `${c.boards} 张板、它的批准记录`;
  if (!(await ask({ title: `删除「${c.title}」？`, text: `${what}一起挪进本机的回收处，下面的提示条上马上能撤销；以后要找回，Agent 用 dw trash 放回。`, ok: '删除', danger: true }))) return;
  let t;
  try {
    t = await post(`/api/canvases/${c.name}/delete`, {});
  } catch (e) {
    return toast(`没删成：${e.message}`);
  }
  await afterChange(c.name);
  toast(`删了「${c.title}」`, { label: '撤销', run: () => undo(t.id, true) });
}
async function renamePageUi(p) {
  const t = await ask({ title: `给「${p.name}」改名`, value: p.name, ok: '改名' });
  if (t == null || t.trim() === p.name) return;
  try {
    await post(`/api/canvases/${S.name}/page-rename`, { page: p.id, name: t });
  } catch (e) {
    return toast(`没改成：${e.message}`);
  }
  await afterChange(S.name);
  toast('改好了');
}
async function deletePageUi(p, n) {
  if (pages().length < 2) return toast('只剩这一页了：要删就删整块画布');
  if (!(await ask({ title: `删除「${p.name}」这一页？`, text: `这一页的 ${n} 张板、便签和批准记录一起挪进本机的回收处，下面的提示条上马上能撤销。删之前存了一个本地版本（顶栏「版本」里看得到）。`, ok: '删除', danger: true }))) return;
  let t;
  try {
    t = await post(`/api/canvases/${S.name}/page-delete`, { page: p.id });
  } catch (e) {
    return toast(`没删成：${e.message}`);
  }
  if (S.focus) closeFocus();
  await afterChange(S.name, { page: S.page === p.id ? null : S.page });
  toast(`删了「${p.name}」这一页`, { label: '撤销', run: () => undo(t.id, true) });
}
// 画板：改名只改标题（文件名、地址不变），删除连它的批准记录挪进回收处
const boardActs = (file) => [['改名…', () => renameBoardUi(file)], ['删除这张…', () => deleteBoardUi(file), true]];
async function renameBoardUi(file) {
  const b = S.canvas?.boards?.[file];
  if (!b) return;
  const old = b.title || file.replace(/\.dc\.html$/, '');
  const t = await ask({ title: `给「${old}」改名`, text: `只改画板的标题，文件名 ${file} 不变。`, value: old, ok: '改名' });
  if (t == null || t.trim() === old) return;
  try {
    await post(`/api/canvases/${S.name}/board-rename`, { file, title: t });
  } catch (e) {
    return toast(`没改成：${e.message}`);
  }
  await afterChange(S.name);
  toast('改好了');
}
async function deleteBoardUi(file) {
  const b = S.canvas?.boards?.[file];
  if (!b) return;
  const name = b.title || file.replace(/\.dc\.html$/, '');
  const rec = S.reviews[file];
  const extra = rec ? `和它的批准记录（${RV_LABEL[rec.status] || rec.status}）` : '';
  if (!(await ask({ title: `删除画板「${name}」？`, text: `这张板${extra}挪进本机的回收处，下面的提示条上马上能撤销。删之前存了一个本地版本（顶栏「版本」里看得到）。`, ok: '删除', danger: true }))) return;
  let t;
  try {
    t = await post(`/api/canvases/${S.name}/board-delete`, { file });
  } catch (e) {
    return toast(`没删成：${e.message}`);
  }
  if (S.focus === file) closeFocus();
  if (S.selected === file) S.selected = null;
  if (S.playing === file) S.playing = null;
  if (S.panelFor === file) closePanel();
  await afterChange(S.name);
  toast(`删了画板「${name}」`, { label: '撤销', run: () => undo(t.id, true) });
}
// Design System、Motion Deck：只改 bench 里的名字（bench/names.json），方案的源和云端不变
const KIND_LABEL = { ds: 'Design System', motion: 'Motion Deck' };
async function renameSchemeUi(kind, d) {
  const t = await ask({ title: `给「${d.title}」改名`, text: `只改 bench 和有板有眼里显示的名字；方案的源${kind === 'ds' ? '、云端 Design System' : ''}的名字不变（方案自己叫「${d.schemeTitle || d.title}」）。清空就回到原名。`, value: d.title, ok: '改名' });
  if (t == null || t.trim() === d.title) return;
  await postSchemeName(kind, d, t.trim());
}
const resetSchemeName = (kind, d) => postSchemeName(kind, d, '');
async function postSchemeName(kind, d, title) {
  try {
    await post(`/api/names/${kind}/${d.name}`, { title });
  } catch (e) {
    return toast(`没改成：${e.message}`);
  }
  await namesChanged();
  toast(title ? '改好了' : `回到了原名（${KIND_LABEL[kind]}）`);
}
/** The names of Design Systems or Motion Decks changed: read the lists again and fix the title on top. */
async function namesChanged() {
  await loadList();
  tellChanged();
  if (S.ds) $('#canvas-title').textContent = S.systems.find((x) => x.name === S.ds)?.title || S.ds;
  if (S.motion) await openMotionView(S.motion, S.motionPart);
}
async function buildVersionMenu() {
  const m = $('#version-menu');
  m.replaceChildren(el('p', { class: 'head', text: '载入中…' }));
  try {
    S.versions = (await api(`/api/canvases/${S.name}/versions`)).versions;
  } catch {
    S.versions = [];
  }
  m.replaceChildren(
    el('p', { class: 'head', text: '本地版本（dw 拉回、发回、存档时留下的）' }),
    el('button', { role: 'menuitem', class: S.version ? '' : 'on', onclick: () => { closeMenus(); openCanvas(S.name, { page: S.page }); } }, [el('span', { class: 'grow', text: '最新（本地文件）' })])
  );
  for (const v of [...S.versions].reverse()) {
    const when = new Date(v.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const extra = v.events?.length ? ` · 之后：${v.events.map((e) => labelOf(e.label)).join('、')}` : '';
    m.append(
      el('button', { role: 'menuitem', class: S.version === v.id ? 'on' : '', onclick: () => { closeMenus(); closeFocus(); openCanvas(S.name, { page: S.page, v: v.id }); } }, [
        el('span', { class: 'grow two' }, [el('span', { text: labelOf(v.label) }), el('span', { class: 'sub', text: `${when} · ${v.files} 个文件${extra}` })])
      ])
    );
  }
  if (!S.versions.length) m.append(el('p', { class: 'head', text: '还没有版本' }));
}

// ---------- 事件 ----------
$('#canvas-btn').addEventListener('click', () => toggleMenu($('#canvas-btn'), $('#canvas-menu'), buildCanvasMenu));
$('#page-btn').addEventListener('click', () => toggleMenu($('#page-btn'), $('#page-menu'), buildPageMenu));
$('#version-btn').addEventListener('click', () => toggleMenu($('#version-btn'), $('#version-menu'), buildVersionMenu));
$('#zoom-btn').addEventListener('click', () => toggleMenu($('#zoom-btn'), $('#zoom-menu')));
$('#zoom-menu').addEventListener('click', (e) => {
  const z = e.target.closest('[data-zoom]')?.dataset.zoom;
  if (!z) return;
  closeMenus();
  if (z === 'in') zoomBy(1.25);
  else if (z === 'out') zoomBy(0.8);
  else if (z === 'fit') fitView();
  else {
    const { w, h } = viewport();
    zoomAt(Number(z), w / 2, h / 2);
  }
});
$('#zoom-in').addEventListener('click', () => zoomBy(1.25));
$('#zoom-out').addEventListener('click', () => zoomBy(0.8));
for (const b of document.querySelectorAll('[data-tool]')) b.addEventListener('click', () => setTool(b.dataset.tool));
function setTool(t) {
  S.tool = t;
  for (const b of document.querySelectorAll('[data-tool]')) b.classList.toggle('on', b.dataset.tool === t);
  stage.classList.toggle('hand', t === 'hand');
}
document.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.menu-wrap')) closeMenus();
});

stage.addEventListener('wheel', (e) => {
  if (S.kind === 'page') return;
  e.preventDefault();
  const r = stage.getBoundingClientRect();
  if (e.ctrlKey || e.metaKey) zoomAt(S.view.z * Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top);
  else {
    S.view.tx -= e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
    S.view.ty -= e.shiftKey && !e.deltaX ? 0 : e.deltaY;
    applyView();
  }
}, { passive: false });

let drag = null;
let spaceDown = false;
stage.addEventListener('pointerdown', (e) => {
  if (S.kind === 'page' || e.target.closest('.tb, .strip, .menu')) return;
  if (e.button !== 0 && e.button !== 1) return;
  drag = { x: e.clientX, y: e.clientY, tx: S.view.tx, ty: S.view.ty, moved: false, target: e.target };
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  const dy = e.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < 3) return;
  drag.moved = true;
  stage.classList.add('panning');
  S.view.tx = drag.tx + dx;
  S.view.ty = drag.ty + dy;
  applyView();
});
stage.addEventListener('pointerup', (e) => {
  if (!drag) return;
  stage.classList.remove('panning');
  if (!drag.moved && S.tool === 'select' && !spaceDown) {
    const box = drag.target.closest?.('.board');
    select(box ? box.dataset.file : null);
  }
  drag = null;
  try {
    stage.releasePointerCapture(e.pointerId);
  } catch {}
});
// 指着的板照常动（缩小看全页时，指到哪张哪张动）
world.addEventListener('pointerover', (e) => {
  const file = e.target.closest?.('.board')?.dataset.file || null;
  if (file === S.hover) return;
  S.hover = file;
  liveness();
});
world.addEventListener('pointerleave', () => {
  if (!S.hover) return;
  S.hover = null;
  liveness();
});
stage.addEventListener('dblclick', (e) => {
  const box = e.target.closest('.board');
  if (box) openFocus(box.dataset.file);
});

addEventListener('keydown', (e) => {
  if (e.target.closest?.('input, select, textarea') || document.querySelector('dialog[open]')) return;
  if (S.ds || S.checks) {
    if (e.key === 'Escape' && document.querySelector('.menu:not([hidden])')) closeMenus();
    return;
  }
  if (S.motion) {
    if (e.key === 'Escape' && document.querySelector('.menu:not([hidden])')) return closeMenus();
    if (!e.target.closest?.('button')) motionKey(e);
    return;
  }
  if (e.key === 'Escape') {
    if (document.querySelector('.menu:not([hidden])')) return closeMenus();
    if (S.focus && S.compare) return setCompare(null);
    if (S.focus) return closeFocus();
    if (S.playing) return togglePlay(S.playing);
    if (S.panelFor) return closePanel();
    return select(null);
  }
  if (S.focus) {
    if (e.key === 'ArrowLeft') stepFocus(-1);
    else if (e.key === 'ArrowRight') stepFocus(1);
    else if (!e.altKey && zoomKey(e.key)) e.preventDefault();
    return;
  }
  if (S.kind === 'page') return;
  if (e.key === ' ' && !spaceDown) {
    spaceDown = true;
    stage.classList.add('hand');
    e.preventDefault();
  } else if (e.key === 'v' || e.key === 'V') setTool('select');
  else if (e.key === 'h' || e.key === 'H') setTool('hand');
  else if (e.key === '+' || e.key === '=') zoomBy(1.25);
  else if (e.key === '-' || e.key === '_') zoomBy(0.8);
  else if (e.key === '1') fitView();
  else if (e.key === '0') {
    const { w, h } = viewport();
    zoomAt(1, w / 2, h / 2);
  } else if (e.key === 'Enter' && S.selected) openFocus(S.selected);
});
addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    spaceDown = false;
    stage.classList.toggle('hand', S.tool === 'hand');
  }
});

$('#focus-back').addEventListener('click', closeFocus);
$('#focus-compare').addEventListener('click', () => toggleMenu($('#focus-compare'), $('#compare-menu'), buildCompareMenu));
$('#focus-approve').addEventListener('click', (e) => (S.reviews[S.focus]?.status === 'approved' ? openReviewMenu(S.focus, e.currentTarget) : postReview(S.focus, 'approved')));
$('#focus-reject').addEventListener('click', (e) => openReviewMenu(S.focus, e.currentTarget, { rejecting: true }));
for (const b of document.querySelectorAll('.g-dark')) b.addEventListener('click', () => setGlobal('dark', !S.global.dark));
for (const b of document.querySelectorAll('.g-motion')) b.addEventListener('click', () => setGlobal('reduce', !S.global.reduce));
$('#focus-prev').addEventListener('click', () => stepFocus(-1));
$('#focus-next').addEventListener('click', () => stepFocus(1));
$('#focus-tweaks').addEventListener('click', () => (S.panelFor === S.focus ? closePanel() : openPanel(S.focus)));
for (const b of document.querySelectorAll('#focus-fit button')) b.addEventListener('click', () => setFit(b.dataset.fit));
$('#focus-zoom-in').addEventListener('click', () => zoomFocus(1.25));
$('#focus-zoom-out').addEventListener('click', () => zoomFocus(0.8));
$('#focus-zoom-pct').addEventListener('click', () => focusZoomTo(1));
$('#focus-more').addEventListener('click', (e) => S.focus && openActMenu(e.currentTarget, boardActs(S.focus)));
$('#focus-body').addEventListener('wheel', (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  zoomFocus(wheelFactor(e), { x: e.clientX, y: e.clientY });
}, { passive: false });
$('#panel-close').addEventListener('click', closePanel);
$('#panel-reset').addEventListener('click', () => {
  const f = S.panelFor;
  if (!f) return;
  delete S.tweaks[f];
  saveTweaks();
  refreshStrip(f);
  pushTweaksDefaults(f);
  renderPanel();
});
function pushTweaksDefaults(file) {
  S.tweaks[file] = {};
  pushTweaks(file);
  delete S.tweaks[file];
}
$('#panel-copy').addEventListener('click', async () => {
  const f = S.panelFor;
  if (!f) return;
  const text = `${S.name} / ${f} 的 Tweaks：${JSON.stringify(valuesOf(f), null, 2)}`;
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制');
  } catch {
    toast('复制不了，参数在控制台里');
    console.log(text);
  }
});
/** A note at the bottom; with an action (撤销) it stays longer and has a button. */
function toast(text, action = null) {
  for (const old of document.querySelectorAll('.toast')) old.remove();
  const t = el('div', { class: 'toast', role: 'status' }, [el('span', { text })]);
  if (action) t.append(el('button', { text: action.label, onclick: () => { t.remove(); action.run(); } }));
  document.body.append(t);
  setTimeout(() => t.remove(), action ? 10000 : 1600);
}
addEventListener('resize', () => {
  applyView();
  layoutFocus();
  renderBanner();
});
addEventListener('hashchange', () => {
  const h = readHash();
  if (h.checks) return openChecksView();
  if (h.motion) return openMotionView(h.motion, h.p);
  if (h.ds) return openDs(h.ds, h.s);
  if (S.ds || S.motion || S.checks) return openCanvas(h.name || S.name, { page: h.page, board: h.board, v: h.v, vs: h.vs });
  if (h.name !== S.name || (h.v || null) !== S.version) return openCanvas(h.name, { page: h.page, board: h.board, v: h.v, vs: h.vs });
  if (h.page && h.page !== S.page) {
    S.page = h.page;
    renderWorld();
  }
  if (h.board && (h.board !== S.focus || (h.vs || null) !== vsOf())) {
    S.compare = parseVs(h.vs, h.board);
    openFocus(h.board);
  } else if (!h.board && S.focus) closeFocus();
});

// ---------- 文件变了就刷新 ----------
function listenChanges() {
  let es;
  try {
    es = new EventSource('/api/events');
  } catch {
    return;
  }
  // 存储变了（站主在别的窗口批了一张、Agent 标了待批）：重新读批准状态
  // npm run all 在跑（这里点的「跑一遍」，或者 Agent 在终端跑的）：结果变了就重新读
  es.addEventListener('checks', async () => {
    S.checksSub = await api('/api/index').then((d) => d.sections.find((x) => x.id === 'checks')?.items?.[0]?.sub || '', () => S.checksSub);
    if (S.checks) refreshChecks();
    tellChanged();
  });
  es.addEventListener('db', (e) => {
    try {
      if (JSON.parse(e.data).canvas === S.name) loadReviews();
    } catch {}
  });
  es.addEventListener('reload', async (e) => {
    let files = [];
    let names = false;
    try {
      ({ files = [], names = false } = JSON.parse(e.data));
    } catch {}
    if (names) return namesChanged();
    if (files.some((f) => !f.includes('/'))) await loadList();
    // 画布多了、少了、改了名（在这里、Pomelo 里或 dw 改的）：外面那一页的清单跟着读；在看的这块没了就换一块
    if (files.some((f) => !f.includes('/') || /^[^/]+\/(cloud\.json|project\/canvas\.json)$/.test(f))) tellChanged();
    if (!S.ds && !S.motion && !S.checks && S.name && !S.list.some((c) => c.name === S.name)) {
      await loadList();
      if (!S.list.some((c) => c.name === S.name)) return openCanvas(S.list.find((c) => c.kind === 'canvas')?.name || S.list[0]?.name);
    }
    if (S.version) return; // 旧版本不跟着变
    const mine = files.filter((f) => f.startsWith(`${S.name}/`)).map((f) => f.slice(S.name.length + 1));
    if (!mine.length) return;
    await loadList();
    if (S.kind === 'page') {
      $('#pageview').contentWindow?.location.reload();
      return;
    }
    if (mine.some((f) => f === 'project/canvas.json' || f === 'cloud.json')) {
      await openCanvas(S.name, { page: S.page, board: S.focus, vs: vsOf(), keepView: true });
      return;
    }
    const boards = mine.filter((f) => f.startsWith('project/')).map((f) => f.slice('project/'.length));
    const all = mine.some((f) => f.startsWith('blobs/'));
    for (const [file, f] of S.frames) {
      if ((all || boards.includes(file)) && f.loaded) f.iframe.contentWindow?.location.reload();
    }
    if (S.focus && (all || boards.includes(S.focus))) focusFrame?.contentWindow?.location.reload();
    if (compareFrame && S.compare?.kind === 'board' && (all || boards.includes(S.compare.file))) compareFrame.contentWindow?.location.reload();
    if (boards.length) loadReviews();
  });
}

// ---------- 开始 ----------
(async () => {
  try {
    await loadList();
  } catch (e) {
    showEmpty(`读不到画布清单：${e.message}`);
    return;
  }
  renderGlobals();
  const h = readHash();
  if (h.checks) await openChecksView();
  else if (h.motion) await openMotionView(h.motion, h.p);
  else if (h.ds) await openDs(h.ds, h.s);
  else await openCanvas(h.name || S.list.find((c) => c.kind === 'canvas')?.name || S.list[0]?.name, { page: h.page, board: h.board, v: h.v, vs: h.vs });
  listenChanges();
})();
