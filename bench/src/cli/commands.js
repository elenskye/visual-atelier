import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, readJsonFile } from '../utils/config.js';
import { listCanvases, canvasDir, kindOf, readCloud, readCanvasJson } from '../canvas/store.js';
import { snapshot, listVersions, restore } from '../canvas/versions.js';
import { createCanvas, importBundle } from '../canvas/create.js';
import {
  readListing,
  addTarget,
  listTargets,
  addBlobMap,
  planPull,
  applyPull,
  verify,
  planBlobs,
  applyBlobs,
  planPublish,
  recordPublish,
  runtimeDrift
} from '../canvas/cloud.js';
import { listSystems, installSystem, readSystem, systemPaths } from '../ds/systems.js';
import { prefetchPage, runtimeResources, getResource, cacheDir } from '../server/offline.js';
import { getDoc, setDoc, readStore, dbFile } from '../canvas/db.js';
import { listReviews, setReview, clearReview, STATUS_LABEL } from '../canvas/review.js';
import { runCheck } from '../canvas/check.js';
import { runFrames, frameTimes } from '../canvas/frames.js';
import { exportBoards } from '../canvas/export.js';
import { startServer, BENCH_APP, BENCH_API } from '../server/server.js';
import { catalog } from '../server/catalog.js';
import { renameCanvas, deleteCanvas, renamePage, deletePage, renameBoard, deleteBoard, renameScheme, listTrash, restoreTrash, emptyTrash, NAME_KINDS } from '../canvas/manage.js';
import { captureUrl } from '../server/headless.js';
import { listMotionSchemes, readMotion, exportMotion, closeExportBrowser } from '../motion/parts.js';
import { createScheme, checkScheme } from '../scheme/new.js';

const list = (v) => (v === undefined || v === true ? [] : Array.isArray(v) ? v.flatMap((x) => String(x).split(',')) : String(v).split(','));
const out = (flags, data, text) => console.log(flags.json ? JSON.stringify(data, null, 2) : text);
/** A flag's value, or null when it is missing or was given without one (`--board` alone). */
const opt = (v) => (v && v !== true ? v : null);

function need(value, usage) {
  if (!value || value === true) throw new Error(`用法：${usage}`);
  return value;
}

export async function cmdList(_pos, flags) {
  const config = loadConfig();
  const items = listCanvases(config);
  const { sections } = catalog(config);
  const text = sections
    .map((s) => [`${s.title}`, ...(s.items.length ? s.items.map((it) => `  ${it.name}  ${it.sub}  ${it.title}${it.cloud ? `  ${it.cloud}` : ''}`) : ['  （没有）'])].join('\n'))
    .join('\n');
  out(flags, { canvases: items, sections }, text);
}

// 改名、删除、回收处（canvas/manage.js）：和画布界面、Pomelo 的有板有眼同一套
export async function cmdRename(pos, flags) {
  const usage = 'dw rename <画布名> <新名字>  |  dw rename <画布名> --page <页 id> <新页名>  |  dw rename <画布名> --board <文件> <新标题>  |  dw rename --ds|--motion <方案> [<新名字>]';
  const config = loadConfig();
  // Design System、Motion Deck：只改 bench 里的名字（bench/names.json）；不写新名字就回到方案自己的
  for (const kind of ['ds', 'motion']) {
    if (!flags[kind]) continue;
    const scheme = need(flags[kind], usage);
    const known = (kind === 'ds' ? listSystems(config) : listMotionSchemes(config)).map((x) => x.name);
    const r = renameScheme(config, kind, scheme, pos.join(' '), { known });
    return out(flags, r, r.reset ? `${NAME_KINDS[kind]} ${scheme} 回到方案自己的名字` : `${NAME_KINDS[kind]} ${scheme} 在 bench 里叫「${r.title}」（方案的源和云端不变）`);
  }
  const name = need(pos[0], usage);
  const title = need(pos.slice(1).join(' '), usage);
  if (flags.board) {
    const r = renameBoard(config, name, need(flags.board, usage), title);
    return out(flags, r, `${name} 的画板 ${r.file} 改名为「${r.title}」（文件名不变；改之前的样子存了本地版本）`);
  }
  if (flags.page) {
    const r = renamePage(config, name, need(flags.page, usage), title);
    return out(flags, r, `${name} 的页 ${r.page} 改名为「${r.title}」（改之前的样子存了本地版本）`);
  }
  const r = renameCanvas(config, name, title);
  out(flags, r, `${name} 改名为「${r.title}」（目录名和地址不变）`);
}

export async function cmdDelete(pos, flags) {
  const usage = 'dw delete <画布名> [--page <页 id> | --board <文件>]';
  const name = need(pos[0], usage);
  const config = loadConfig();
  const r = flags.board ? deleteBoard(config, name, need(flags.board, usage)) : flags.page ? deletePage(config, name, need(flags.page, usage)) : deleteCanvas(config, name);
  const what = flags.board ? `画板「${r.title}」` : flags.page ? `「${r.title}」这一页` : `「${r.title}」`;
  out(flags, r, `删了${what}，挪进了回收处（canvases/.trash/${r.id}/）。放回：node bench/bin/dw.js trash restore ${r.id}`);
}

const trashLabel = (t) => (t.what === 'page' ? `页「${t.title}」（${t.canvasTitle}）` : t.what === 'board' ? `画板「${t.title}」（${t.canvasTitle}${t.pageName ? ` · ${t.pageName}` : ''}）` : `画布「${t.title}」`);

export async function cmdTrash(pos, flags) {
  const usage = 'dw trash [list] | dw trash restore <id> | dw trash empty --yes';
  const [sub = 'list', id] = pos;
  const config = loadConfig();
  if (sub === 'list') {
    const items = listTrash(config);
    return out(
      flags,
      { items },
      items.length ? items.map((t) => `${t.id}  ${trashLabel(t)}  ${t.deletedAt}`).join('\n') : '回收处是空的'
    );
  }
  if (sub === 'restore') {
    const t = restoreTrash(config, need(id, usage));
    return out(flags, t, `放回了${t.what === 'page' ? `「${t.canvasTitle}」的「${t.title}」这一页` : t.what === 'board' ? `「${t.canvasTitle}」的画板「${t.title}」` : `「${t.title}」`}`);
  }
  if (sub === 'empty') {
    if (flags.yes !== true) throw new Error('清空就找不回来了（Git 里提交过的还在）。确定要清空，加 --yes');
    const items = emptyTrash(config);
    return out(flags, { emptied: items.length }, `清空了回收处（${items.length} 样）`);
  }
  throw new Error(`用法：${usage}`);
}

export async function cmdNew(pos, flags) {
  const name = need(pos[0], 'dw new <画布名> [--title 标题]');
  const dir = createCanvas(loadConfig(), name, { title: flags.title || name });
  out(flags, { dir }, `已新建 ${dir}`);
}

export async function cmdImport(pos, flags) {
  const file = need(pos[0], 'dw import <导出的单文件.html> --name <画布名>');
  const name = need(flags.name, 'dw import <导出的单文件.html> --name <画布名>');
  const r = await importBundle(loadConfig(), path.resolve(file), name, { title: flags.title || null });
  out(flags, r, `已导入 ${r.boards} 张板到 ${r.dir}。导出包里没有画布的排布、页和便签，板子按每行 4 张排开。`);
}

export async function cmdTarget(pos, flags) {
  const usage = 'dw target <画布名> [<slug> --url <链接> --account <账号> [--home] [--same-ids]]';
  const name = need(pos[0], usage);
  const config = loadConfig();
  if (!pos[1]) {
    const rows = listTargets(config, name);
    return out(flags, { targets: rows }, rows.length ? rows.map((t) => `${t.home ? '* ' : '  '}${t.slug}  ${t.account || '（没记账号）'}  ${t.url || ''}`).join('\n') + '\n（* 是 home：不加 --target 时用它）' : `${name} 还没有云端地址`);
  }
  const str = (v) => (opt(v) ? String(v) : null);
  const t = addTarget(config, name, pos[1], { url: str(flags.url), type: str(flags.type), title: str(flags.title), account: str(flags.account), home: Boolean(flags.home), blobs: flags['same-ids'] ? 'same' : undefined });
  out(flags, t, `已登记 ${name} → ${pos[1]}${t.account ? `（${t.account}）` : ''}${t.blobs === 'same' ? '，图片 id 和本地相同' : '，图片 id 要对照表'}${flags.home ? '，设为 home' : ''}`);
}

export async function cmdPull(pos, flags) {
  const usage = 'dw pull <画布名> --listing <list_files.json> [--from <下载的文件或目录>] [--assets <list_assets.json>] [--target <slug>]';
  const name = need(pos[0], usage);
  const config = loadConfig();
  const target = opt(flags.target);
  const from = list(flags.from);
  if (flags.assets) {
    const assets = readListing(flags.assets);
    if (from.length) {
      const r = applyBlobs(config, name, assets, from, { target });
      return out(flags, r, `图片：${r.same} 张本来就一样，写入 ${r.written} 张`);
    }
    const r = planBlobs(config, name, assets, { target });
    return out(flags, r, `图片：${r.same} 张一样，要下载 ${r.need.length} 张${r.need.length ? `：\n${r.need.map((b) => `  ${b.remoteId} → blobs/${b.localId}`).join('\n')}` : ''}`);
  }
  const listing = readListing(need(flags.listing, usage));
  const drift = runtimeDrift(config, listing);
  if (from.length) {
    const r = applyPull(config, name, listing, from, { target });
    return out(flags, { ...r, runtime: drift }, `拉回 ${name}：写入 ${r.written} 个，删掉 ${r.removed.length} 个；校验和 ${r.verified}/${r.verified} 全对。版本 ${r.version}${drift ? `\n注意：${drift.message}` : ''}`);
  }
  const r = planPull(config, name, listing, { target });
  const lines = [`${name} ← ${r.target}：${r.same} 个一样，${r.changed.length} 个改了，${r.added.length} 个新加，${r.removed.length} 个云端没有`];
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  if (r.downloads.length) {
    lines.push(`要下载 ${r.downloads.length} 个，共 ${kb(r.downloads.reduce((a, f) => a + f.size, 0))}：`);
    for (const f of r.downloads) lines.push(`  ${f.path}  ${kb(f.size)}`);
    lines.push('下载办法和大文件的限制见 docs/cloud.md；下载好的文件放进一个目录，再加 --from <目录>');
  } else lines.push('不用下载');
  if (drift) lines.push(`注意：${drift.message}`);
  out(flags, { ...r, runtime: drift }, lines.join('\n'));
}

export async function cmdVerify(pos, flags) {
  const usage = 'dw verify <画布名> --listing <list_files.json> [--target <slug>]';
  const name = need(pos[0], usage);
  const config = loadConfig();
  const listing = readListing(need(flags.listing, usage));
  const r = verify(config, name, listing, { target: opt(flags.target) });
  const drift = runtimeDrift(config, listing);
  out(flags, { ...r, runtime: drift }, `${r.bad.length ? `对不上 ${r.bad.length} 个：\n  ${r.bad.join('\n  ')}` : `校验和 ${r.ok}/${r.total} 全对`}${drift ? `\n注意：${drift.message}` : ''}`);
  if (r.bad.length) process.exitCode = 1;
}

export async function cmdPublish(pos, flags) {
  const usage = 'dw publish <画布名> [--listing <list_files.json>] [--target <slug>] [--blob-map <file>] [--record]';
  const name = need(pos[0], usage);
  const config = loadConfig();
  const target = opt(flags.target);
  if (flags['blob-map']) {
    const map = addBlobMap(config, name, target || readCloud(canvasDir(config, name)).home, readJsonFile(flags['blob-map']));
    console.log(`对照表现在有 ${Object.keys(map).length} 张图片`);
  }
  const listing = opt(flags.listing) ? readListing(flags.listing) : null;
  if (flags.record) {
    const r = recordPublish(config, name, need(listing, usage), { target });
    return out(flags, r, `云端 ${r.target} 和本地校验和 ${r.verified} 个全对，已存版本 ${r.version}`);
  }
  const r = planPublish(config, name, listing, { target });
  if (flags.out) fs.writeFileSync(flags.out, JSON.stringify(r, null, 2) + '\n');
  if (r.needUpload) {
    return out(flags, r, `先用 upload_asset 上传 ${r.uploads.length} 张图片（name 照写，每次最多 10 张），再把结果存成 JSON，用 --blob-map 记下：\n${r.uploads.map((u) => `  ${u.name}  ${u.path}`).join('\n')}`);
  }
  const lines = [`${name} → ${r.target}${r.url ? `（${r.url}）` : ''}：${r.unchanged ?? 0} 个不用发`];
  r.publishFilesCalls.forEach((c, i) => lines.push(`publish_files 第 ${i + 1} 次（mode patch）files: ${JSON.stringify(c)}`));
  if (r.remove.length) lines.push(`remove: ${JSON.stringify(r.remove)}`);
  if (!r.publishFilesCalls.length && !r.remove.length) lines.push('云端已经是最新的');
  const drift = listing ? runtimeDrift(config, listing) : null;
  if (drift) lines.push(`注意：${drift.message}`);
  out(flags, { ...r, runtime: drift }, lines.join('\n'));
}

export async function cmdVersions(pos, flags) {
  const name = need(pos[0], 'dw versions <画布名>');
  const vs = listVersions(loadConfig(), name);
  out(flags, { versions: vs.map(({ id, label, createdAt, files }) => ({ id, label, createdAt, files: Object.keys(files).length })) },
    vs.length ? vs.map((v) => `${v.id}  ${Object.keys(v.files).length} 个文件${v.events?.length ? `  之后：${v.events.map((e) => e.label).join('、')}` : ''}`).join('\n') : '还没有版本');
}

export async function cmdSnapshot(pos, flags) {
  const name = need(pos[0], 'dw snapshot <画布名> [--label 名字]');
  const v = snapshot(loadConfig(), name, opt(flags.label) || 'save');
  out(flags, v, v.reused ? `和上一版一样，没有新存：${v.id}` : `已存版本 ${v.id}`);
}

export async function cmdRestore(pos, flags) {
  const name = need(pos[0], 'dw restore <画布名> <版本>');
  const r = restore(loadConfig(), name, need(pos[1], 'dw restore <画布名> <版本>'));
  out(flags, r, `已恢复到 ${r.restored}；恢复前的样子存成了 ${r.savedBefore}`);
}

const portOf = (config, flags) => (opt(flags.port) ? Number(flags.port) : config.server.port);
const baseOf = (config, flags) => `http://127.0.0.1:${portOf(config, flags)}`;

/** What answers on the port: this server's `/api/status`, or null (nothing there, or something else). */
export async function benchStatus(base) {
  try {
    const r = await fetch(`${base}/api/status`, { signal: AbortSignal.timeout(1500) });
    const s = r.ok ? await r.json() : null;
    return s?.app === BENCH_APP ? s : null;
  } catch {
    return null;
  }
}

/** Asks the bench at `base` to stop (only one `dw serve` started can). */
export async function stopBench(base) {
  const r = await fetch(`${base}/api/stop`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || `停不了（${r.status}）`);
}

/** The address of a canvas in the board UI (`page`: a page id; `board`: a board file, opened full size). */
export function boardAddress(base, name, { page = null, board = null } = {}) {
  const p = new URLSearchParams();
  if (page) p.set('page', page);
  if (board) p.set('board', board);
  const q = p.toString();
  return `${base}/#/${name}${q ? `?${q}` : ''}`;
}

export async function cmdServe(_pos, flags) {
  const config = loadConfig();
  let stop;
  const stopped = new Promise((resolve) => (stop = resolve));
  let srv;
  try {
    srv = await startServer(config, { port: opt(flags.port) ? Number(flags.port) : undefined, onStop: stop, quiet: !!flags.json });
  } catch (e) {
    if (e.code !== 'EADDRINUSE') throw e;
    const base = baseOf(config, flags);
    const there = await benchStatus(base);
    if (flags.json) console.log(JSON.stringify({ ready: false, running: !!there, url: base, pid: there?.pid ?? null }));
    throw new Error(there ? `已经有一个在跑了：${base}/（进程 ${there.pid}），用 dw stop 停掉它` : `${portOf(config, flags)} 端口被别的程序占着，换一个：dw serve --port <端口>`);
  }
  // one line a program that started this can wait for
  if (flags.json) console.log(JSON.stringify({ ready: true, url: srv.baseUrl, pid: process.pid, api: BENCH_API }));
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  await stopped;
  await srv.close();
}

export async function cmdStatus(_pos, flags) {
  const config = loadConfig();
  const base = baseOf(config, flags);
  const s = await benchStatus(base);
  out(flags, s ? { running: true, ...s } : { running: false, url: base }, s ? `在跑：${s.url}/  进程 ${s.pid}  ${s.canvases} 块画布  ${s.startedAt} 启动` : `没在跑（${base}）`);
}

export async function cmdStop(_pos, flags) {
  const config = loadConfig();
  const base = baseOf(config, flags);
  const s = await benchStatus(base);
  if (!s) return out(flags, { stopped: false, running: false, url: base }, `没在跑（${base}）`);
  await stopBench(base);
  out(flags, { stopped: true, running: false, url: base, pid: s.pid }, `已停掉 ${base}/（进程 ${s.pid}）`);
}

/** The address of a canvas, a page of it or one board — printed, not opened in a browser (the caller shows it). */
export async function cmdOpen(pos, flags) {
  const name = need(pos[0], 'dw open <画布名> [--page 页] [--board 文件名]');
  const config = loadConfig();
  const kind = kindOf(canvasDir(config, name));
  if (!kind) throw new Error(`没有这块画布：${name}`);
  const base = baseOf(config, flags);
  let url = `${base}/c/${name}/`;
  if (kind === 'canvas') {
    const canvas = readCanvasJson(config, name);
    const page = opt(flags.page) ? String(flags.page) : null;
    const board = opt(flags.board) ? String(flags.board) : null;
    if (page && !(canvas.pages || []).some((p) => p.id === page)) throw new Error(`${name} 没有这一页：${page}（有：${(canvas.pages || []).map((p) => p.id).join('、') || '没有分页'}）`);
    if (board && !canvas.boards?.[board]) throw new Error(`${name} 没有画板 ${board}`);
    url = boardAddress(base, name, { page: page || (board && canvas.boards[board].page) || null, board });
  }
  const running = !!(await benchStatus(base));
  out(flags, { url, running }, running ? url : `${url}\n（服务没在跑：先 dw serve）`);
}

export async function cmdShot(pos, flags) {
  const name = need(pos[0], 'dw shot <画布名> [--board 文件名] [--out 图片路径] [--strict]');
  const config = loadConfig();
  const dir = canvasDir(config, name);
  const kind = kindOf(dir);
  let file;
  let w = flags.width ? Number(flags.width) : 1280;
  let h = flags.height ? Number(flags.height) : 800;
  if (kind === 'canvas') {
    const canvas = readCanvasJson(config, name);
    file = opt(flags.board) || canvas.order?.[0] || Object.keys(canvas.boards)[0];
    const b = canvas.boards[file];
    if (!b) throw new Error(`${name} 没有画板 ${file}`);
    if (!flags.width) w = b.w;
    if (!flags.height) h = b.h;
  } else if (kind === 'page') {
    file = readCloud(dir).entry;
  } else {
    throw new Error(`${name} 不是画布`);
  }
  const outPath = opt(flags.out) ? path.resolve(flags.out) : path.join(dir, '.shots', `${file.replace(/\.dc\.html$|\.html$/, '')}.png`);
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const r = await captureUrl(config, `${srv.baseUrl}/c/${name}/${encodeURI(file)}`, outPath, { width: w, height: h, fullPage: Boolean(flags['full-page']) });
    const text = [
      `${name}/${file}  ${w}×${h}  ${r.passed ? '通过（0 个报错）' : '没通过'}`,
      `截图：${r.outputPath}`,
      ...r.allErrors.map((e) => `  报错：${e}`),
      ...r.zeroSizeElements.map((z) => `  宽或高为 0：${z}`)
    ].join('\n');
    out(flags, r, text);
    if (flags.strict && !r.passed) process.exitCode = 1;
  } finally {
    await srv.close();
  }
}

export async function cmdDs(pos, flags) {
  const usage = 'dw ds [list] | dw ds install <画布名> <方案>';
  const config = loadConfig();
  const [sub = 'list', canvas, scheme] = pos;
  if (sub === 'list') {
    const rows = listSystems(config);
    return out(
      flags,
      { systems: rows },
      rows.length
        ? rows.map((d) => `${d.name}  ${d.title}  ${d.built ? '已构建' : '还没构建（仓库根目录 npm run build:ds）'}${d.cloud ? `  ${d.cloud.url}（${d.cloud.account || '没记账号'}）` : ''}`).join('\n')
        : '还没有 Design System（要有 schemes/<方案>/design-system/）'
    );
  }
  if (sub === 'install') {
    need(canvas, usage);
    need(scheme, usage);
    const r = await installSystem(config, canvas, scheme);
    return out(
      flags,
      r,
      [
        `已把 ${r.record.title} 挂到 ${canvas}：${r.files.join('、')}，canvas.json 记了一条。版本 ${r.version}`,
        '画板的 <head> 里，support.js 那行后面加（画板在子目录里就在前面加 ../）：',
        ...r.links.map((l) => (l.endsWith('.js') ? `  <script src="${l}"></script>` : `  <link rel="stylesheet" href="${l}">`)),
        ...(r.fonts.length ? ['字体放进画板的 <helmet>（画布只许 <helmet> 里的 Google Fonts 联网）：', ...r.fonts.map((u) => `  <link rel="stylesheet" href="${u}">`)] : [])
      ].join('\n')
    );
  }
  throw new Error(`用法：${usage}`);
}

export async function cmdScheme(pos, flags) {
  const usage = 'dw scheme new <方案名> [--title 标题] [--no-check]';
  const config = loadConfig();
  const [sub, name] = pos;
  if (sub !== 'new') throw new Error(`用法：${usage}`);
  need(name, usage);
  const made = createScheme(config.repoAbs, name, { title: flags.title === true ? undefined : flags.title });
  const check = flags['no-check'] ? null : checkScheme(config.repoAbs, name);
  if (check && !check.ok) process.exitCode = 1;
  return out(flags, { ...made, check }, [
    `建好了 ${made.dir}/（${made.title}，Design System 的命名空间 ${made.namespace}），从 schemes/_template/ 复制了 ${made.files.length} 个文件。`,
    ...(check ? check.steps.map((s) => `  ${s.ok ? '过了' : '没过'}  ${s.label}${s.ok ? '' : '\n' + s.tail.replace(/^/gm, '      ')}`) : ['  没跑检查（--no-check）']),
    '下一步：照 schemes/' + name + '/DESIGN.md 定方向，改 tokens/ 的占位；探索加成 canvases/' + name + '-explore/ 的一页（dw new ' + name + '-explore）。'
  ].join('\n'));
}

export async function cmdDb(pos, flags) {
  const usage = 'dw db <画布名> [<文档路径>] | dw db <画布名> set <文档路径> <JSON 文件>';
  const name = need(pos[0], usage);
  const config = loadConfig();
  if (pos[1] === 'set') {
    const p = need(pos[2], usage);
    const body = JSON.parse(fs.readFileSync(need(pos[3], usage), 'utf8'));
    setDoc(config, name, p, body);
    return out(flags, { ok: true, path: p }, `已写入 ${name} 的 ${p}（${path.relative(process.cwd(), dbFile(config, name))}）`);
  }
  if (pos[1]) {
    const d = getDoc(config, name, pos[1]);
    return out(flags, d, d.exists ? JSON.stringify(d.data, null, 2) : `${pos[1]} 不存在`);
  }
  const store = readStore(config, name);
  const keys = Object.keys(store);
  out(flags, store, keys.length ? keys.map((k) => `${k}  ${JSON.stringify(store[k]).length} 字节`).join('\n') : `${name} 的存储是空的（${path.relative(process.cwd(), dbFile(config, name))} 还没有）`);
}

export async function cmdReview(pos, flags) {
  const usage = 'dw review <画布名> [--propose [--board 文件名]…] [--clear --board 文件名]';
  const name = need(pos[0], usage);
  const config = loadConfig();
  const canvas = readCanvasJson(config, name);
  const boards = list(flags.board);
  for (const b of boards) if (!canvas.boards?.[b]) throw new Error(`${name} 没有画板 ${b}`);
  if (flags.approve || flags.reject) throw new Error('批准和退回只由站主在画布界面里做；Agent 只能标「待批」（--propose）或清掉（--clear）');
  if (flags.propose) {
    const done = boards.length ? boards : canvas.order || Object.keys(canvas.boards);
    for (const b of done) setReview(config, name, b, 'proposed', { by: 'agent', note: typeof flags.note === 'string' ? flags.note : '' });
    return out(flags, { proposed: done }, `已标待批：${done.join('、')}`);
  }
  if (flags.clear) {
    if (!boards.length) throw new Error(`用法：${usage}`);
    for (const b of boards) clearReview(config, name, b);
    return out(flags, { cleared: boards }, `已清掉：${boards.join('、')}`);
  }
  const reviews = listReviews(config, name);
  const order = canvas.order || Object.keys(canvas.boards);
  const rows = order.map((file) => {
    const r = reviews[file];
    if (!r) return `${file}  没标`;
    const when = new Date(r.at).toLocaleString('zh-CN', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `${file}  ${STATUS_LABEL[r.status] || r.status}（${r.by === 'agent' ? 'Agent' : '站主'} ${when}）${r.changed ? '  标完以后又改过' : ''}${r.note ? `\n    ${r.status === 'rejected' ? '原因' : '备注'}：${r.note}` : ''}`;
  });
  out(flags, reviews, rows.join('\n'));
}

// 断网也能看（server/offline.js）：把所有画布、问卷、Design System 要从网上取的（画布运行时的 React 和 Babel、
// Google Fonts 的样式和用到的字）一次取好，存进 bench/.cache/cdn/。--all-glyphs 连没用到的字的分块也取。
export async function cmdOffline(_pos, flags) {
  const config = loadConfig();
  const allGlyphs = flags['all-glyphs'] === true;
  const rows = [];
  const missing = [];
  const note = (what, r) => {
    rows.push({ what, have: r.have.length, missing: r.missing.length });
    missing.push(...r.missing.map((m) => ({ what, ...m })));
  };
  // the runtime's files, Babel too (a board written with JSX needs it)
  const rt = { have: [], missing: [] };
  for (const r of runtimeResources(config)) {
    try {
      await getResource(config, r.url);
      rt.have.push(r.url);
    } catch (e) {
      rt.missing.push({ url: r.url, why: e.message });
    }
  }
  note('画布运行时（React、Babel）', rt);
  for (const c of listCanvases(config)) {
    const dir = canvasDir(config, c.name);
    const files = c.kind === 'canvas' ? fs.readdirSync(path.join(dir, 'project')).filter((f) => /\.html?$/i.test(f)).map((f) => path.join(dir, 'project', f)) : [path.join(dir, c.entry)];
    const total = { have: [], missing: [] };
    for (const f of files) {
      if (!fs.existsSync(f)) continue;
      const r = await prefetchPage(config, fs.readFileSync(f, 'utf8'), { allGlyphs });
      total.have.push(...r.have);
      total.missing.push(...r.missing);
    }
    note(`${c.title}（${c.name}）`, total);
  }
  for (const sys of listSystems(config).filter((x) => x.built)) {
    const data = readSystem(config, sys.name);
    const p = systemPaths(config, sys.name);
    // the characters this Design System page shows: its README, tokens, component previews
    const text = data.files.filter((f) => /\.(md|json|html)$/.test(f.path)).map((f) => fs.readFileSync(path.join(p.project, f.path), 'utf8')).join('\n');
    const links = data.fonts.map((u) => `<link rel="stylesheet" href="${u}">`).join('\n');
    note(`Design System ${sys.title}`, await prefetchPage(config, links, { allGlyphs, extraText: text }));
  }
  const dir = cacheDir(config);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => !f.endsWith('.json')) : [];
  const bytes = files.reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0);
  const uniq = [...new Map(missing.map((m) => [m.url, m])).values()];
  out(
    flags,
    { cacheDir: dir, files: files.length, bytes, rows, missing: uniq },
    [
      ...rows.map((r) => `${r.missing ? '缺' : '好'}  ${r.what}：${r.have} 个在本机${r.missing ? `，${r.missing} 个取不到` : ''}`),
      `缓存 ${dir}：${files.length} 个文件，${(bytes / 1024 / 1024).toFixed(1)} MB`,
      ...(uniq.length ? ['取不到的（多半是没联网）：', ...uniq.slice(0, 20).map((m) => `  ${m.url}`), ...(uniq.length > 20 ? [`  ……还有 ${uniq.length - 20} 个`] : [])] : ['都在本机了，断网也能看。'])
    ].join('\n')
  );
  if (uniq.length) process.exitCode = 1;
}

// MCP 服务（v1.0 Phase 3）：stdio，给 Agent 用，见 src/mcp/server.js 和 bench/README.md「MCP」
export async function cmdMcp() {
  const { serveMcp } = await import('../mcp/server.js');
  await serveMcp(loadConfig());
}

export async function cmdCheck(pos, flags) {
  const name = need(pos[0], 'dw check <画布名> [--board 文件名] [--no-lint]');
  const config = loadConfig();
  const board = opt(flags.board);
  const lines = [];
  const say = (t) => (flags.json ? lines.push(t) : console.log(t));
  const r = await runCheck(config, name, {
    board,
    lints: !flags['no-lint'],
    onBoard: (row) => {
      say(`${row.passed ? '通过' : '没通过'}  ${row.file}  ${row.size}`);
      for (const e of row.errors) say(`    报错：${e}`);
      for (const l of row.layout) say(`    版面：${l}`);
    }
  });
  for (const l of r.lints) {
    say(`${l.passed ? '通过' : '没通过'}  ${l.file}（这块画布自己的版面检查）`);
    if (!l.passed) say(l.output.split('\n').map((x) => `    ${x}`).join('\n'));
  }
  const bad = r.boards.filter((b) => !b.passed).length + r.lints.filter((l) => !l.passed).length;
  if (flags.json) console.log(JSON.stringify(r, null, 2));
  else console.log(`\n${name}：${r.boards.length} 张板${r.lints.length ? `、${r.lints.length} 个自带检查` : ''}，${bad ? `${bad} 处没通过` : '全部通过'}。截图在 ${path.relative(process.cwd(), path.join(canvasDir(config, name), '.shots', 'check'))}/`);
  if (!r.passed) process.exitCode = 1;
}

export async function cmdFrames(pos, flags) {
  const usage = 'dw frames <画布名> --board 文件名 [--at 0,300,600 | --every 250 --until 2000] [--click 按钮上的字] [--scale 1]';
  const name = need(pos[0], usage);
  const board = need(flags.board, usage);
  const config = loadConfig();
  const times = frameTimes({ at: flags.at ? list(flags.at) : null, every: flags.every, until: flags.until });
  const clicks = flags.click === undefined || flags.click === true ? [] : [].concat(flags.click).map(String);
  const r = await runFrames(config, name, { board, times, clicks, scale: flags.scale ? Number(flags.scale) : 1 });
  const text = [
    `${name}/${r.file}  ${r.size}  ${r.frames.length} 帧（${times.join('、')} ms）`,
    r.sheet && `总览：${path.relative(process.cwd(), r.sheet)}`,
    r.frames.length && `每一帧：${path.relative(process.cwd(), path.dirname(r.frames[0].png))}/`,
    ...r.missedClicks.map((c) => `没找到要点的按钮：${c}`),
    ...r.errors.map((e) => `报错：${e}`)
  ].filter(Boolean).join('\n');
  out(flags, { ...r, frames: r.frames.map(({ t, actual, png }) => ({ t, actual, png })) }, text);
  if (r.errors.length || r.missedClicks.length) process.exitCode = 1;
}

export async function cmdExport(pos, flags) {
  const name = need(pos[0], 'dw export <画布名> [--board 文件名] [--png] [--html] [--scale 2] [--out 目录]');
  const config = loadConfig();
  const html = Boolean(flags.html);
  const png = Boolean(flags.png) || !html;
  const r = await exportBoards(config, name, {
    board: opt(flags.board),
    png,
    html,
    scale: flags.scale ? Number(flags.scale) : 2,
    outDir: opt(flags.out) ? path.resolve(flags.out) : null
  });
  const text = [
    ...r.rows.map((row) => [row.file, row.png && `  PNG ${path.relative(process.cwd(), row.png)}`, row.html && `  HTML ${path.relative(process.cwd(), row.html)}${row.offlineMissing?.length ? '' : '（断网也能打开）'}`, ...(row.errors || []).map((e) => `  报错：${e}`), ...(row.missing || []).map((m) => `  没找到，原样留着：${m}`), ...(row.offlineMissing || []).map((u) => `  没取到，打开时要联网：${u}`)].filter(Boolean).join('\n'))
  ].filter(Boolean).join('\n');
  out(flags, r, text);
  if (r.rows.some((row) => row.errors?.length || row.missing?.length)) process.exitCode = 1;
}

export async function cmdMotion(pos, flags) {
  const usage = 'dw motion list [方案] | dw motion export <方案> [零件] [--out 目录]';
  const config = loadConfig();
  const [sub = 'list', scheme, id] = pos;
  if (sub === 'list') {
    if (!scheme) {
      const rows = listMotionSchemes(config);
      return out(flags, { schemes: rows }, rows.length ? rows.map((s) => `${s.name}  ${s.title}  ${s.parts} 个零件  http://127.0.0.1:${config.server.port}/#/motion/${s.name}`).join('\n') : '还没有动效零件（schemes/<方案>/motion/<零件>/motion.json）');
    }
    const m = await readMotion(config, scheme);
    if (!m) throw new Error(`${scheme} 没有动效零件`);
    return out(
      flags,
      m,
      m.parts
        .map((p) => (p.error ? `${p.id}  ${p.error}` : `${p.id}  ${p.title}  ${p.tier || '?'} · ${p.status || '?'}${p.durationMs != null ? ` · ${p.durationMs}ms` : ''}${p.loop ? ' · 循环' : ''}  ${Object.keys(p.exported).length ? `已导出（${Object.keys(p.exported).join('、')}）` : '没导出'}`))
        .join('\n')
    );
  }
  if (sub === 'export') {
    need(scheme, usage);
    try {
      const rows = await exportMotion(config, scheme, id || '', { out: opt(flags.out) ? path.resolve(flags.out) : null });
      return out(flags, { rows }, rows.map((r) => `${r.id} ${r.theme}：${r.frames} 帧，GIF ${(r.gif / 1024).toFixed(1)} KB → ${path.relative(process.cwd(), r.out)}`).join('\n'));
    } finally {
      await closeExportBrowser();
    }
  }
  throw new Error(`用法：${usage}`);
}
