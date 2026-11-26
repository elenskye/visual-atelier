import fs from 'node:fs';
import path from 'node:path';
import { readJsonFile, writeJsonFile, sha256File } from '../utils/config.js';

// A canvas lives in canvases/<name>/:
//   project/      the files exactly as they are on the Claude canvas (canvas.json, *.dc.html, docs)
//   blobs/        images the boards load as /_blob/<id>, named <id>.<ext>, bytes as stored in the cloud
//   cloud.json    where it lives in the cloud and how blob ids map to each copy there
//   .versions/    local version history (not in Git)
// A page (a single Artifact page such as a questionnaire) has cloud.json with kind "page" and an entry file.

export const NAME_RE = /^[a-z0-9][a-z0-9-]*$/;
const BLOB_ID_RE = /\/_blob\/([0-9a-f]{32})/g;
const TEXT_EXT = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.json', '.md', '.svg', '.txt']);

function assertName(name) {
  if (!name || !NAME_RE.test(name)) {
    throw Object.assign(new Error(`画布名只能用小写字母、数字和连字符：${name}`), { code: 'invalid_argument' });
  }
}

export function canvasDir(config, name) {
  assertName(name);
  return path.join(config.canvasesAbs, name);
}

export function readCloud(dir) {
  return readJsonFile(path.join(dir, 'cloud.json'), null);
}

export function writeCloud(dir, data) {
  writeJsonFile(path.join(dir, 'cloud.json'), data);
}

export function kindOf(dir) {
  if (fs.existsSync(path.join(dir, 'project', 'canvas.json'))) return 'canvas';
  const cloud = readCloud(dir);
  if (cloud?.kind === 'canvas') return 'canvas';
  if (cloud?.kind === 'page' && cloud.entry) return 'page';
  return null;
}

/**
 * The kind of an existing canvas: 'canvas' (an Explore Deck) or 'page' (a questionnaire). Throws when there is none,
 * or when it is not the kind `want` asks for. Every command and tool that needs a canvas starts here.
 */
export function needCanvas(config, name, want = null) {
  const kind = kindOf(canvasDir(config, name));
  if (!kind) throw Object.assign(new Error(`没有画布 ${name}（list 看有哪些）`), { code: 'not_found' });
  if (want && kind !== want) throw Object.assign(new Error(want === 'canvas' ? `${name} 是问卷页，没有画板` : `${name} 不是问卷页`), { code: 'failed_precondition' });
  return kind;
}

/** Sorted POSIX paths of every file under dir, skipping dotfiles and dot-folders. */
export function walk(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs, base));
    else if (entry.isFile()) out.push(path.relative(base, abs).split(path.sep).join('/'));
  }
  return out.sort();
}

export function isText(rel) {
  return TEXT_EXT.has(path.extname(rel).toLowerCase()) || rel.endsWith('.dc.html');
}

export function listCanvases(config) {
  if (!fs.existsSync(config.canvasesAbs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(config.canvasesAbs, { withFileTypes: true })) {
    if (!entry.isDirectory() || !NAME_RE.test(entry.name)) continue;
    const dir = path.join(config.canvasesAbs, entry.name);
    const kind = kindOf(dir);
    if (!kind) continue;
    const cloud = readCloud(dir) || {};
    const home = cloud.home ? { slug: cloud.home, url: cloud.targets?.[cloud.home]?.url || null } : null;
    // which list it goes in (bench/src/server/catalog.js): a canvas is an Explore Deck, a page a Questionnaire,
    // unless cloud.json says `deck`
    const deck = cloud.deck || (kind === 'page' ? 'questionnaire' : 'explore');
    const item = { name: entry.name, kind, deck, title: cloud.title || entry.name, home };
    if (kind === 'canvas') {
      const canvas = readJsonFile(path.join(dir, 'project', 'canvas.json'), {});
      item.title = cloud.title || canvas.title || item.title;
      item.boards = Object.keys(canvas.boards || {}).length;
      item.pages = (canvas.pages || []).map((p) => ({ id: p.id, name: p.name }));
    } else {
      item.entry = cloud.entry;
    }
    out.push(item);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** A canvas's boards in order: canvas.json's `order` (those still there), then any it leaves out. */
export const boardOrder = (c) => [...(c.order || []).filter((f) => c.boards[f]), ...Object.keys(c.boards).filter((f) => !(c.order || []).includes(f))];

export function readCanvasJson(config, name) {
  needCanvas(config, name, 'canvas');
  const data = readJsonFile(path.join(canvasDir(config, name), 'project', 'canvas.json'), null);
  if (!data) throw Object.assign(new Error(`${name} 还没有 project/canvas.json（云端那份还没拉回来：dw pull）`), { code: 'failed_precondition' });
  return data;
}

/** The files a canvas keeps in sync with the cloud and in its versions: rel path → sha256. */
export function trackedFiles(config, name) {
  const dir = canvasDir(config, name);
  const kind = needCanvas(config, name);
  const files = {};
  if (kind === 'canvas') {
    for (const rel of walk(path.join(dir, 'project'))) files[`project/${rel}`] = sha256File(path.join(dir, 'project', rel));
    for (const rel of walk(path.join(dir, 'blobs'))) files[`blobs/${rel}`] = sha256File(path.join(dir, 'blobs', rel));
  } else {
    const { entry } = readCloud(dir);
    if (fs.existsSync(path.join(dir, entry))) files[entry] = sha256File(path.join(dir, entry));
  }
  return files;
}

/** Local blobs of one canvas: id → { rel, abs }. */
export function localBlobs(config, name) {
  const dir = path.join(canvasDir(config, name), 'blobs');
  const out = {};
  for (const rel of walk(dir)) {
    const id = rel.split('.')[0];
    if (/^[0-9a-f]{32}$/.test(id)) out[id] = { rel: `blobs/${rel}`, abs: path.join(dir, rel) };
  }
  return out;
}

/** Every blob of every canvas: id → absolute path. Cloud ids are random, so one flat index is safe. */
export function blobIndex(config) {
  const index = new Map();
  for (const c of listCanvases(config)) {
    for (const [id, b] of Object.entries(localBlobs(config, c.name))) index.set(id, b.abs);
  }
  return index;
}

/** Blob ids a set of text files refer to. */
export function referencedBlobs(buffers) {
  const ids = new Set();
  for (const buf of buffers) {
    for (const m of buf.toString('utf8').matchAll(BLOB_ID_RE)) ids.add(m[1]);
  }
  return [...ids].sort();
}

/** Replaces /_blob/<from> with /_blob/<to> for every pair in map. Returns the same buffer when nothing changes. */
export function rewriteBlobIds(buffer, map) {
  if (!map || Object.keys(map).length === 0) return buffer;
  const text = buffer.toString('utf8');
  let changed = false;
  const out = text.replace(BLOB_ID_RE, (full, id) => {
    if (map[id] && map[id] !== id) {
      changed = true;
      return `/_blob/${map[id]}`;
    }
    return full;
  });
  return changed ? Buffer.from(out, 'utf8') : buffer;
}
