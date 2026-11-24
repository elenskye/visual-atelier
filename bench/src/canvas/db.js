import fs from 'node:fs';
import path from 'node:path';
import { canvasDir, kindOf } from './store.js';

// 本地的页面存储：和云端 artifact 的 db 同一套路径和写法（claude.use('db')），存在 canvases/<名字>/db.json，
// 一个 JSON 对象，键是文档路径（survey/answers），值是文档内容。按路径排序写出，Agent 直接读这个文件就行。
// 只有一个人在本机用，没有权限分级：data/users/<id>/ 也照样存，id 固定是 local。

const SEG = /^[A-Za-z0-9_\-.~:@+]+$/;
const MAX_BODY = 256 * 1024;

class DbError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/** Splits and checks a path; parity 'doc' wants an even number of segments, 'collection' an odd one. */
function checkPath(p, parity) {
  if (typeof p !== 'string' || !p) throw new DbError('invalid_argument', '路径是空的');
  if (Buffer.byteLength(p) > 1000) throw new DbError('invalid_argument', '路径超过 1000 字节');
  const segs = p.split('/');
  if (segs.length > 16) throw new DbError('invalid_argument', '路径超过 16 段');
  for (const s of segs) {
    if (!s || s === '.' || s === '..' || !SEG.test(s) || Buffer.byteLength(s) > 200) throw new DbError('invalid_argument', `路径里有不能用的一段：${JSON.stringify(s)}`);
  }
  if (parity === 'doc' && segs.length % 2 !== 0) throw new DbError('invalid_argument', `文档路径要有偶数段，${p} 是 ${segs.length} 段`);
  if (parity === 'collection' && segs.length % 2 !== 1) throw new DbError('invalid_argument', `集合路径要有奇数段，${p} 是 ${segs.length} 段`);
  return segs;
}

function checkBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new DbError('invalid_argument', '文档内容要是一个 JSON 对象');
  const text = JSON.stringify(body);
  if (Buffer.byteLength(text) > MAX_BODY) throw new DbError('invalid_argument', '文档超过 256 KiB');
  const depth = (v, d = 0) => (v && typeof v === 'object' ? Math.max(d + 1, ...Object.values(v).map((x) => depth(x, d + 1))) : d);
  if (depth(body) > 32) throw new DbError('invalid_argument', '文档嵌套超过 32 层');
  return JSON.parse(text);
}

export function dbFile(config, name) {
  const dir = canvasDir(config, name);
  if (!kindOf(dir)) throw new DbError('invalid_argument', `没有画布或页面 ${name}`);
  return path.join(dir, 'db.json');
}

export function readStore(config, name) {
  const file = dbFile(config, name);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
}

function writeStore(config, name, store) {
  const file = dbFile(config, name);
  const sorted = Object.fromEntries(Object.keys(store).sort().map((k) => [k, store[k]]));
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(sorted, null, 2) + '\n');
  fs.renameSync(tmp, file);
}

export function getDoc(config, name, p) {
  checkPath(p, 'doc');
  const store = readStore(config, name);
  return Object.hasOwn(store, p) ? { exists: true, data: store[p] } : { exists: false };
}

export function setDoc(config, name, p, body) {
  checkPath(p, 'doc');
  const store = readStore(config, name);
  store[p] = checkBody(body);
  writeStore(config, name, store);
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function merge(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = isObj(v) && isObj(a[k]) ? merge(a[k], v) : v;
  return out;
}

export function updateDoc(config, name, p, body) {
  checkPath(p, 'doc');
  const store = readStore(config, name);
  if (!Object.hasOwn(store, p)) throw new DbError('invalid_argument', `${p} 不存在，update 只改已有的文档`);
  store[p] = checkBody(merge(store[p], checkBody(body)));
  writeStore(config, name, store);
}

export function deleteDoc(config, name, p) {
  checkPath(p, 'doc');
  const store = readStore(config, name);
  if (!Object.hasOwn(store, p)) return;
  delete store[p];
  writeStore(config, name, store);
}

/** The documents directly in one collection, by id (filters and order are the page's, in the runtime). */
export function listCollection(config, name, collection) {
  const segs = checkPath(collection, 'collection');
  const store = readStore(config, name);
  return Object.keys(store)
    .filter((k) => k.startsWith(`${collection}/`) && k.split('/').length === segs.length + 1)
    .sort()
    .map((k) => ({ id: k.split('/').pop(), path: k, data: store[k] }));
}
