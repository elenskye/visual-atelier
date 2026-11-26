import fs from 'node:fs';
import path from 'node:path';
import {
  canvasDir,
  kindOf,
  needCanvas,
  readCloud,
  writeCloud,
  trackedFiles,
  localBlobs,
  referencedBlobs,
  rewriteBlobIds,
  isText
} from './store.js';
import { snapshot } from './versions.js';
import { sha256 } from '../utils/config.js';
import { mimeToExt } from '../bundler/codec.js';

// The cloud side is only reachable through Claude's artifact tools, so these functions never touch
// the network. An Agent saves what list_files / list_assets returned as JSON, downloads the files
// the plan asks for, and hands both back here. Everything is matched and checked by sha256.

const READ_FILE_MAX_PATHS = 32;
const READ_FILE_MAX_BYTES = 4 * 1024 * 1024;
const PUBLISH_MAX_FILES = 256;
const PUBLISH_MAX_BYTES = 60 * 1024 * 1024;

/**
 * The canvas runtime the cloud's Design type carries (artifact-type/dc-runtime.js in a list_files result) against
 * bench's copy. null when they match or the listing does not show it; a shortened sha256 (the Artifact tool of
 * Claude Code prints the first 32 hex digits) counts when it is a prefix of ours.
 */
export function runtimeDrift(config, listing) {
  const entry = (listing?.files || []).find((f) => f.path === 'artifact-type/dc-runtime.js');
  if (!entry?.sha256) return null;
  let local;
  try {
    local = sha256(fs.readFileSync(config.runtimeAbs));
  } catch {
    return null;
  }
  const cloud = String(entry.sha256).toLowerCase();
  if (cloud === local || (cloud.length < 64 && cloud.length >= 16 && local.startsWith(cloud))) return null;
  return {
    cloud,
    local,
    size: entry.size ?? null,
    message: `云端画布类型的运行时换了（${entry.size ?? '?'} 字节，sha256 ${cloud.slice(0, 16)}…；bench 的副本是 ${local.slice(0, 16)}…）：照 CLAUDE.md「画布与 bench」，对照 sha256 换掉 bench/vendor/claude-design/dc-runtime.js、更新 runtime.json，再跑 npm test`
  };
}

/** Reads a saved list_files / list_assets result. Accepts the bare JSON or a saved tool result wrapping it. */
export function readListing(file) {
  if (!fs.existsSync(file)) throw new Error(`没有这个文件：${file}`);
  const raw = fs.readFileSync(file, 'utf8');
  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };
  let data = tryParse(raw);
  if (Array.isArray(data)) {
    data = data.map((x) => (typeof x?.text === 'string' ? tryParse(x.text) : x)).find((x) => x && (x.files || x.assets)) || null;
  }
  if (!data) {
    const start = raw.indexOf('{');
    data = start >= 0 ? tryParse(raw.slice(start, raw.lastIndexOf('}') + 1)) : null;
  }
  if (!data || !(Array.isArray(data.files) || Array.isArray(data.assets))) {
    throw new Error(`${file} 里没有 list_files 或 list_assets 的结果（要有 files 或 assets 数组）`);
  }
  return data;
}

/**
 * A canvas's cloud.json. `create`: the canvas need not exist yet (dw target --new: a cloud canvas that is pulled into
 * a new local one); without it a name nobody has is an error, so a typo never leaves a half canvas behind.
 */
function cloudOf(config, name, { create = false } = {}) {
  const dir = canvasDir(config, name);
  if (!create) needCanvas(config, name);
  const cloud = readCloud(dir) || { kind: kindOf(dir) || 'canvas', targets: {} };
  cloud.targets = cloud.targets || {};
  return { dir, cloud };
}

/** A page's cloud listing has no checksums: it can be published, not pulled or checked file by file. */
function needChecksums(config, name) {
  if (needCanvas(config, name) !== 'canvas') throw new Error(`${name} 是问卷页：单个页面的云端不给校验和，没法按文件拉回或核对`);
}

/** Resolves a target slug (default: the canvas's home) and its blob map (local id → remote id). */
function resolveTarget(config, name, slug = null) {
  const { cloud } = cloudOf(config, name);
  const target = slug || cloud.home;
  if (!target) throw new Error(`${name} 还没有云端地址：先用 dw target ${name} <slug> --url <链接> 登记`);
  const entry = cloud.targets[target];
  if (!entry) throw new Error(`${name} 没有登记云端 ${target}：先用 dw target ${name} ${target} --url <链接> 登记`);
  const same = entry.blobs === 'same' || entry.blobs === undefined;
  const forward = same ? {} : { ...entry.blobs };
  const reverse = Object.fromEntries(Object.entries(forward).map(([l, r]) => [r, l]));
  return { slug: target, entry, same, forward, reverse };
}

export function addTarget(config, name, slug, { url = null, type = null, title = null, account = null, home = false, blobs = undefined, create = false } = {}) {
  const { dir, cloud } = cloudOf(config, name, { create });
  const prev = cloud.targets[slug] || {};
  cloud.targets[slug] = {
    ...prev,
    ...(url ? { url } : {}),
    ...(type ? { type } : {}),
    ...(title ? { title } : {}),
    // which Claude account owns it: only that account can pull from it or publish to it
    ...(account ? { account } : {}),
    // 'same': the cloud copy uses the local blob ids (a canvas that came from there); otherwise ids are mapped
    blobs: blobs ?? prev.blobs ?? {}
  };
  if (home || !cloud.home) cloud.home = slug;
  writeCloud(dir, cloud);
  return cloud.targets[slug];
}

/** Every cloud copy of a canvas, home first. */
export function listTargets(config, name) {
  const { cloud } = cloudOf(config, name);
  const rows = Object.entries(cloud.targets || {}).map(([slug, t]) => ({ slug, home: slug === cloud.home, url: t.url || null, account: t.account || null, sameIds: t.blobs === 'same' }));
  return rows.sort((a, b) => Number(b.home) - Number(a.home));
}

/**
 * Records uploaded blob ids for a target (null: the home). entries: { localId: remoteId or /_blob/url },
 * [{ name, opaque_id | url }] or the raw upload_asset result ({ assets: [...] }).
 */
export function addBlobMap(config, name, target, entries) {
  const { dir, cloud } = cloudOf(config, name);
  const slug = target || cloud.home;
  if (!slug) throw new Error(`${name} 还没有云端地址：先用 dw target ${name} <slug> --url <链接> 登记`);
  const entry = cloud.targets[slug];
  if (!entry) throw new Error(`没有登记云端 ${slug}`);
  if (entry.blobs === 'same') throw new Error(`${slug} 和本地用同一套图片 id，不需要对照表`);
  const map = { ...(entry.blobs || {}) };
  const idOf = (v) => String(v).match(/[0-9a-f]{32}/)?.[0];
  if (entries && Array.isArray(entries.assets)) {
    // the raw upload_asset result: match each upload to a local blob by sha256
    const bySha = new Map(Object.entries(localBlobs(config, name)).map(([id, b]) => [sha256(fs.readFileSync(b.abs)), id]));
    entries = entries.assets.map((a) => {
      const local = bySha.get(a.source_sha256) || bySha.get(a.sha256);
      if (!local) throw new Error(`上传结果里的 ${a.opaque_id} 对不上本地任何一张图片`);
      return { name: `${local}.x`, opaque_id: a.opaque_id };
    });
  }
  const pairs = Array.isArray(entries)
    ? entries.map((e) => [path.basename(String(e.name || '')).split('.')[0], idOf(e.opaque_id || e.url)])
    : Object.entries(entries).map(([l, r]) => [l, idOf(r)]);
  for (const [local, remote] of pairs) {
    if (!/^[0-9a-f]{32}$/.test(local || '') || !remote) throw new Error(`对照表里有一项看不懂：${local} → ${remote}`);
    map[local] = remote;
  }
  entry.blobs = map;
  writeCloud(dir, cloud);
  return map;
}

function localProject(config, name) {
  const files = trackedFiles(config, name);
  return Object.fromEntries(Object.entries(files).filter(([rel]) => rel.startsWith('project/')));
}

/** Local bytes of a project file as they should look on the target (blob ids mapped). */
function bytesForTarget(dir, rel, forward) {
  const buf = fs.readFileSync(path.join(dir, rel));
  return isText(rel) ? rewriteBlobIds(buf, forward) : buf;
}

function remoteProjectFiles(listing) {
  return (listing.files || []).filter((f) => !f.of_type && f.path.startsWith('project/'));
}

function batches(items, { maxCount, maxBytes, size = (x) => x.size || 0 }) {
  const out = [];
  let cur = [];
  let bytes = 0;
  for (const it of items) {
    const s = size(it);
    if (cur.length && (cur.length >= maxCount || bytes + s > maxBytes)) {
      out.push(cur);
      cur = [];
      bytes = 0;
    }
    cur.push(it);
    bytes += s;
  }
  if (cur.length) out.push(cur);
  return out;
}

// ---------- pull: cloud → local ----------

export function planPull(config, name, listing, { target = null } = {}) {
  const dir = canvasDir(config, name);
  needChecksums(config, name);
  const t = resolveTarget(config, name, target);
  const local = localProject(config, name);
  const remote = remoteProjectFiles(listing);
  const same = [];
  const changed = [];
  const added = [];
  for (const f of remote) {
    if (!f.sha256) throw new Error(`云端清单里 ${f.path} 没有 sha256`);
    if (!(f.path in local)) added.push(f);
    else if (sha256(bytesForTarget(dir, f.path, t.forward)) === f.sha256) same.push(f.path);
    else changed.push(f);
  }
  const remotePaths = new Set(remote.map((f) => f.path));
  const removed = Object.keys(local).filter((rel) => !remotePaths.has(rel));
  const download = [...changed, ...added];
  return {
    canvas: name,
    target: t.slug,
    version: listing.version || null,
    same: same.length,
    changed: changed.map((f) => f.path),
    added: added.map((f) => f.path),
    removed,
    downloads: download.map((f) => ({ path: f.path, size: f.size || 0 })),
    // for a tool that saves several files at once (Claude Code's Artifact tool: read with paths)
    readFileBatches: batches(download, { maxCount: READ_FILE_MAX_PATHS, maxBytes: READ_FILE_MAX_BYTES }).map((b) => b.map((f) => f.path))
  };
}

function shaIndex(paths) {
  const index = new Map();
  const add = (abs) => {
    const st = fs.statSync(abs);
    if (st.isDirectory()) for (const e of fs.readdirSync(abs)) add(path.join(abs, e));
    else if (st.isFile()) index.set(sha256(fs.readFileSync(abs)), abs);
  };
  for (const p of paths) add(path.resolve(p));
  return index;
}

/** Writes downloaded files into project/, matched to the listing by sha256, then checks every file. */
export function applyPull(config, name, listing, fromPaths, { target = null } = {}) {
  const dir = canvasDir(config, name);
  const plan = planPull(config, name, listing, { target });
  const t = resolveTarget(config, name, target);
  const want = remoteProjectFiles(listing).filter((f) => plan.changed.includes(f.path) || plan.added.includes(f.path));
  const index = shaIndex(fromPaths);
  const missing = want.filter((f) => !index.has(f.sha256)).map((f) => f.path);
  if (missing.length) throw new Error(`还缺 ${missing.length} 个文件（按 sha256 没找到）：${missing.join('、')}`);

  const before = snapshot(config, name, 'before-pull');
  for (const f of want) {
    const buf = fs.readFileSync(index.get(f.sha256));
    const abs = path.join(dir, f.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, isText(f.path) ? rewriteBlobIds(buf, t.reverse) : buf);
  }
  for (const rel of plan.removed) fs.rmSync(path.join(dir, rel));

  const check = verify(config, name, listing, { target });
  if (check.bad.length) throw new Error(`拉回后校验和不对：${check.bad.join('、')}`);
  const { cloud } = cloudOf(config, name);
  cloud.targets[t.slug].lastPull = { version: listing.version || null, at: new Date().toISOString(), files: check.ok };
  writeCloud(dir, cloud);
  const after = snapshot(config, name, 'pull');
  return { ...plan, written: want.length, verified: check.ok, versionBefore: before.id, version: after.id };
}

/** Compares every remote project file with the local one (blob ids mapped). */
export function verify(config, name, listing, { target = null } = {}) {
  const dir = canvasDir(config, name);
  needChecksums(config, name);
  const t = resolveTarget(config, name, target);
  const local = localProject(config, name);
  const bad = [];
  let ok = 0;
  const remote = remoteProjectFiles(listing);
  for (const f of remote) {
    if (!(f.path in local)) bad.push(`${f.path}（本地没有）`);
    else if (sha256(bytesForTarget(dir, f.path, t.forward)) !== f.sha256) bad.push(`${f.path}（不一致）`);
    else ok++;
  }
  const remotePaths = new Set(remote.map((f) => f.path));
  for (const rel of Object.keys(local)) if (!remotePaths.has(rel)) bad.push(`${rel}（云端没有）`);
  return { ok, total: remote.length, bad };
}

// ---------- blobs ----------

export function planBlobs(config, name, assetsListing, { target = null } = {}) {
  const t = resolveTarget(config, name, target);
  const local = localBlobs(config, name);
  const need = [];
  let same = 0;
  for (const a of assetsListing.assets || []) {
    const localId = t.reverse[a.opaque_id] || a.opaque_id;
    const have = local[localId];
    const haveSha = have ? sha256(fs.readFileSync(have.abs)) : null;
    if (haveSha && (haveSha === a.sha256 || haveSha === a.source_sha256)) same++;
    else need.push({ remoteId: a.opaque_id, localId, contentType: a.content_type, sha256: a.sha256, size: a.size_bytes });
  }
  return { canvas: name, target: t.slug, same, need };
}

/** Stores downloaded blobs as blobs/<localId>.<ext>, matched by sha256. */
export function applyBlobs(config, name, assetsListing, fromPaths, { target = null } = {}) {
  const dir = canvasDir(config, name);
  const plan = planBlobs(config, name, assetsListing, { target });
  const index = shaIndex(fromPaths);
  const missing = plan.need.filter((b) => !index.has(b.sha256));
  if (missing.length) throw new Error(`还缺 ${missing.length} 张图片：${missing.map((b) => b.remoteId).join('、')}`);
  snapshot(config, name, 'before-pull');
  for (const b of plan.need) {
    const out = path.join(dir, 'blobs', `${b.localId}${mimeToExt(b.contentType)}`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.copyFileSync(index.get(b.sha256), out);
  }
  snapshot(config, name, 'pull-blobs');
  return { ...plan, written: plan.need.length };
}

// ---------- publish: local → cloud ----------

/**
 * Lists what publish_files must send to bring the target up to date. Files whose blob ids need
 * mapping are written to .stage/<slug>/ and sent from there; the source files are never changed.
 * Without a listing every project file is sent (a new, empty canvas).
 */
export function planPublish(config, name, listing = null, { target = null } = {}) {
  const dir = canvasDir(config, name);
  const kind = kindOf(dir);
  const t = resolveTarget(config, name, target);
  if (kind === 'page') {
    const { entry } = readCloud(dir);
    return { canvas: name, target: t.slug, url: t.entry.url || null, kind, publishFilesCalls: [[{ as: 'index.html', path: path.join(dir, entry) }]], remove: [], uploads: [] };
  }
  const local = localProject(config, name);
  const texts = Object.keys(local).filter(isText).map((rel) => fs.readFileSync(path.join(dir, rel)));
  const used = referencedBlobs(texts);
  const blobs = localBlobs(config, name);
  const absent = used.filter((id) => !blobs[id]);
  if (absent.length) throw new Error(`画板用到了本地没有的图片：${absent.join('、')}（先拉回图片）`);
  const uploads = t.same
    ? []
    : used.filter((id) => !t.forward[id]).map((id) => ({ localId: id, name: path.basename(blobs[id].abs), path: blobs[id].abs }));
  if (uploads.length) {
    return { canvas: name, target: t.slug, url: t.entry.url || null, needUpload: true, uploads, publishFilesCalls: [], remove: [] };
  }

  const remote = listing ? Object.fromEntries(remoteProjectFiles(listing).map((f) => [f.path, f.sha256])) : {};
  const stageRoot = path.join(dir, '.stage', t.slug);
  fs.rmSync(stageRoot, { recursive: true, force: true });
  const send = [];
  let unchanged = 0;
  for (const rel of Object.keys(local)) {
    const original = fs.readFileSync(path.join(dir, rel));
    const bytes = isText(rel) ? rewriteBlobIds(original, t.forward) : original;
    if (listing && remote[rel] === sha256(bytes)) {
      unchanged++;
      continue;
    }
    let from = path.join(dir, rel);
    if (bytes !== original) {
      from = path.join(stageRoot, rel);
      fs.mkdirSync(path.dirname(from), { recursive: true });
      fs.writeFileSync(from, bytes);
    }
    send.push({ as: rel, path: from, size: bytes.length });
  }
  const remove = listing ? Object.keys(remote).filter((rel) => !(rel in local)) : [];
  // canvas.json goes last so the canvas never points at a board that is not there yet
  send.sort((a, b) => (a.as === 'project/canvas.json') - (b.as === 'project/canvas.json'));
  const calls = batches(send, { maxCount: PUBLISH_MAX_FILES, maxBytes: PUBLISH_MAX_BYTES }).map((b) => b.map(({ as, path: p }) => ({ as, path: p })));
  return { canvas: name, target: t.slug, url: t.entry.url || null, unchanged, publishFilesCalls: calls, remove, uploads: [] };
}

/** After publishing: checks the target's new listing against local and saves a version. */
export function recordPublish(config, name, listing, { target = null } = {}) {
  const dir = canvasDir(config, name);
  needChecksums(config, name);
  const t = resolveTarget(config, name, target);
  const check = verify(config, name, listing, { target });
  if (check.bad.length) throw new Error(`云端和本地对不上：${check.bad.join('、')}`);
  const { cloud } = cloudOf(config, name);
  cloud.targets[t.slug].lastPublish = { version: listing.version || null, at: new Date().toISOString(), files: check.ok };
  writeCloud(dir, cloud);
  fs.rmSync(path.join(dir, '.stage', t.slug), { recursive: true, force: true });
  const v = snapshot(config, name, 'publish');
  return { canvas: name, target: t.slug, verified: check.ok, version: v.id };
}
