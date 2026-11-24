import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import readline from 'node:readline';
import { spawn } from 'node:child_process';
import { loadConfig, readJsonFile, writeJsonFile, BENCH_ROOT, REPO_ROOT } from '../utils/config.js';
import { canvasDir, kindOf, readCloud, readCanvasJson, boardOrder } from '../canvas/store.js';
import { snapshot } from '../canvas/versions.js';
import { createCanvas } from '../canvas/create.js';
import { runCheck } from '../canvas/check.js';
import { runFrames, frameTimes } from '../canvas/frames.js';
import { exportBoards } from '../canvas/export.js';
import { getDoc, setDoc, readStore } from '../canvas/db.js';
import { listReviews, setReview, clearReview } from '../canvas/review.js';
import { renameCanvas, deleteCanvas, renamePage, deletePage, renameBoard, deleteBoard, renameScheme, listTrash, restoreTrash } from '../canvas/manage.js';
import { listSystems, installSystem } from '../ds/systems.js';
import { listMotionSchemes } from '../motion/parts.js';
import { catalog } from '../server/catalog.js';
import { readChecks, startChecks } from '../server/checks.js';
import { benchStatus, stopBench, boardAddress } from '../cli/commands.js';
import { BENCH_API } from '../server/server.js';
import { createScheme, checkScheme } from '../scheme/new.js';

// dw 的 MCP 服务（v1.0 Phase 3，站主 2026-11-12 定）：stdio，只在本机，不加遥测。Agent 不用命令行也能用 bench：
// 列画布和画板、新建、读写画板、自检（截图和报错）、导出 PNG 和单文件 HTML、挂 Design System、读写页面存储（问卷答案）、
// 批准状态（Agent 只标「待批」）、改名删除、启动停止看画布的服务、npm run all 的结果；其余命令行能做的走 dw 这个工具。
// 协议：JSON-RPC 2.0，一行一条（MCP stdio）。stdout 只走协议，别的输出都改到 stderr。
// 配置写法见 bench/README.md「MCP」；启动用 bench/bin/dw-mcp.sh（切到 .nvmrc 的 Node 再跑 dw mcp）。

const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const VERSION = readJsonFile(path.join(REPO_ROOT, 'package.json'), {}).version || '0.0.0';
const FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\.html?$/;

const INSTRUCTIONS = `visual-atelier 的画布工具（bench）。画布的源在仓库的 canvases/<画布名>/，和 Claude 云端画布同一种格式：project/canvas.json 加一张张 *.dc.html 画板。
常用的顺序：list 看有什么 → canvas 看一块画布的页和画板 → read_board / write_board 改画板 → check 自检（每张板截图、零报错、版面；看截图加 image）→ frames 看动效（按时间线截几帧）→ export 导出 PNG 或单文件 HTML → open 给站主一个地址看。
规矩：批准和退回只由站主在画布界面里做，Agent 只能标「待批」（review_propose）。删除都进回收处，能放回。规则在仓库根目录的 CLAUDE.md 和 canvases/README.md，画板怎么写见 skills/design-loop/SKILL.md。`;

// ---------- 工具 ----------

const S = (props, required = []) => ({ type: 'object', properties: props, required, additionalProperties: false });
const str = (description) => ({ type: 'string', description });
const num = (description) => ({ type: 'number', description });
const bool = (description) => ({ type: 'boolean', description });

function needCanvas(config, name, want = null) {
  const kind = kindOf(canvasDir(config, name));
  if (!kind) throw new Error(`没有画布 ${name}（list 看有哪些）`);
  if (want && kind !== want) throw new Error(want === 'canvas' ? `${name} 是问卷页，没有画板` : `${name} 不是问卷页`);
  return kind;
}
function projectFile(config, name, rel) {
  const base = path.join(canvasDir(config, name), 'project');
  const abs = path.resolve(base, rel);
  if (!abs.startsWith(base + path.sep)) throw new Error(`${rel} 不在 ${name}/project/ 里`);
  return abs;
}

function canvasSummary(config, name) {
  const kind = needCanvas(config, name);
  const dir = canvasDir(config, name);
  const cloud = readCloud(dir) || {};
  if (kind === 'page') return { name, kind, title: cloud.title || name, entry: cloud.entry, page: `/c/${name}/`, cloud: cloud.home ? cloud.targets?.[cloud.home]?.url || null : null };
  const c = readCanvasJson(config, name);
  const pages = c.pages?.length ? c.pages : [{ id: null, name: '（没有分页）' }];
  const first = pages[0]?.id;
  const order = boardOrder(c);
  const reviews = listReviews(config, name);
  return {
    name,
    kind,
    title: c.title || cloud.title || name,
    launch: c.launch || null,
    designSystems: (c.designSystems || []).map((d) => ({ title: d.title, namespace: d.namespace })),
    cloud: cloud.home ? cloud.targets?.[cloud.home]?.url || null : null,
    pages: pages.map((p) => ({
      id: p.id,
      name: p.name,
      boards: order
        .filter((f) => (c.boards[f].page || first) === p.id)
        .map((f) => ({ file: f, title: c.boards[f].title || f, x: c.boards[f].x, y: c.boards[f].y, w: c.boards[f].w, h: c.boards[f].h, review: reviews[f]?.status || null }))
    })),
    notes: Object.keys(c.notes || {}).length
  };
}

/** Writes a board and its entry: new boards go right of the last one on their page; a page that doesn't exist is made. */
function writeBoard(config, a) {
  needCanvas(config, a.canvas, 'canvas');
  if (!FILE_RE.test(a.file)) throw new Error(`画板文件名只用字母、数字、. - _，字母或数字开头，以 .dc.html（或 .html）结尾：${a.file}`);
  const dir = canvasDir(config, a.canvas);
  const cpath = path.join(dir, 'project', 'canvas.json');
  const c = readCanvasJson(config, a.canvas);
  snapshot(config, a.canvas, 'save');
  c.pages = c.pages || [];
  c.boards = c.boards || {};
  let page = a.page ?? c.boards[a.file]?.page ?? null;
  if (page && !c.pages.some((p) => p.id === page)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(page)) throw new Error(`页 id 只用字母、数字、- _：${page}`);
    // a canvas without pages has one unnamed page: its boards keep a page of their own, the new one comes after
    if (!c.pages.length && Object.keys(c.boards).some((f) => f !== a.file)) c.pages.push({ id: 'main', name: 'Main' });
    c.pages.push({ id: page, name: a.page_name || page });
  }
  const first = c.pages[0]?.id || null;
  const was = c.boards[a.file];
  const onPage = Object.entries(c.boards).filter(([f, b]) => f !== a.file && (b.page || first) === (page || first));
  const w = a.width ?? was?.w ?? 1280;
  const h = a.height ?? was?.h ?? 800;
  const x = a.x ?? was?.x ?? (onPage.length ? Math.max(...onPage.map(([, b]) => b.x + b.w)) + 80 : 0);
  const y = a.y ?? was?.y ?? (onPage.length ? Math.min(...onPage.map(([, b]) => b.y)) : 0);
  const entry = { ...(was || {}), x, y, w, h, title: a.title ?? was?.title ?? a.file.replace(/\.dc\.html$|\.html?$/, '') };
  if (page && page !== first) entry.page = page;
  else if (page === first && was?.page) entry.page = page;
  c.boards[a.file] = entry;
  c.order = [...(c.order || []).filter((f) => f !== a.file && c.boards[f]), a.file];
  fs.writeFileSync(path.join(dir, 'project', a.file), a.html, 'utf8');
  writeJsonFile(cpath, c);
  return { canvas: a.canvas, file: a.file, created: !was, page: entry.page || first, x, y, w, h, title: entry.title, next: '用 check 自检这张板' };
}

async function shotImage(file) {
  try {
    const sharp = (await import('sharp')).default;
    const buf = await sharp(file).resize({ width: 1280, withoutEnlargement: true }).png().toBuffer();
    return { type: 'image', data: buf.toString('base64'), mimeType: 'image/png' };
  } catch {
    return null;
  }
}

function serveBase(config, port) {
  return `http://${config.server.host || '127.0.0.1'}:${port || config.server.port}`;
}

/** The bench on that port shows some other canvases folder (the main checkout, another worktree): not ours. */
function notOurs(config, s) {
  return !!(s?.canvasesDir && path.resolve(s.canvasesDir) !== path.resolve(config.canvasesAbs));
}

function notOursMessage(config, s, port) {
  const p = Number(port || config.server.port);
  return `${s.url} 上开着的是另一份的 bench（画布在 ${s.canvasesDir}），不是这一份（${config.canvasesAbs}）。换一个端口：serve_start、open 都写 port，比如 ${p + 10}`;
}

async function serveStart(config, { port }) {
  const base = serveBase(config, port);
  const there = await benchStatus(base);
  if (there && notOurs(config, there)) throw new Error(notOursMessage(config, there, port));
  if (there) return { running: true, started: false, url: there.url, pid: there.pid, api: there.api };
  fs.mkdirSync(config.cacheAbs, { recursive: true });
  const logFile = path.join(config.cacheAbs, 'serve.log');
  const fd = fs.openSync(logFile, 'a');
  const child = spawn(process.execPath, [path.join(BENCH_ROOT, 'bin', 'dw.js'), 'serve', '--port', String(port || config.server.port)], { cwd: REPO_ROOT, detached: true, stdio: ['ignore', fd, fd], env: process.env });
  child.unref();
  fs.closeSync(fd);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const s = await benchStatus(base);
    if (s) return { running: true, started: true, url: s.url, pid: s.pid, api: s.api, log: logFile };
  }
  throw new Error(`等了 12 秒还没起来，看 ${logFile}`);
}

async function serveStop(config, { port }) {
  const base = serveBase(config, port);
  const s = await benchStatus(base);
  if (!s) return { running: false, stopped: false, url: base };
  if (notOurs(config, s)) throw new Error(`${notOursMessage(config, s, port)}。它不归这一份管，不停`);
  await stopBench(base);
  return { running: false, stopped: true, url: base, pid: s.pid };
}

/** Any other dw command, the way the command line runs it (not serve or mcp: they don't end). */
function runDw(args, timeoutMs = 10 * 60 * 1000) {
  if (!Array.isArray(args) || !args.length) throw new Error('args 要写 dw 后面的参数，比如 ["versions", "pomelo-explore"]');
  if (['serve', 'mcp'].includes(args[0])) throw new Error(`dw ${args[0]} 不会自己结束，用 serve_start / serve_stop`);
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(BENCH_ROOT, 'bin', 'dw.js'), ...args.map(String)], { cwd: REPO_ROOT, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    const t = setTimeout(() => child.kill('SIGTERM'), timeoutMs);
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('close', (code) => {
      clearTimeout(t);
      resolve({ exitCode: code, stdout: out.slice(-40000), stderr: err.slice(-8000) });
    });
  });
}

// MCP 的提示：只读的工具 Agent 可以不问就用（Codex 只放行这些）；会删东西的标出来
const READ_ONLY = new Set(['list', 'canvas', 'read_board', 'open', 'ds_list', 'db_get', 'review', 'serve_status']);
const DESTRUCTIVE = new Set(['delete', 'write_board', 'write_file', 'db_set', 'dw', 'serve_stop']);
const annotationsOf = (name) => ({ readOnlyHint: READ_ONLY.has(name), destructiveHint: !READ_ONLY.has(name) && DESTRUCTIVE.has(name), idempotentHint: READ_ONLY.has(name), openWorldHint: false });

const TOOLS = [
  {
    name: 'list',
    description: '列出 bench 里的全部，五类：Design System、Motion Deck、Explore Deck（画布）、Questionnaire（问卷页）、Checks（npm run all 的结果）。',
    inputSchema: S({}),
    run: (config) => catalog(config)
  },
  {
    name: 'canvas',
    description: '一块画布：标题、每一页（id、页名）和页上的画板（文件名、标题、位置大小、批准状态）、挂着的 Design System、云端地址。问卷页给入口文件。',
    inputSchema: S({ canvas: str('画布名，比如 pomelo-explore') }, ['canvas']),
    run: (config, a) => canvasSummary(config, a.canvas)
  },
  {
    name: 'new_canvas',
    description: '新建一块本地画布（README.md、cloud.json、project/canvas.json、第一张画板 Main.dc.html）。画布名只用小写字母、数字、连字符；方案的探索请加成它的 Explore Deck 的一页（write_board 带 page），不另开画布。',
    inputSchema: S({ canvas: str('画布名'), title: str('标题'), width: num('第一张画板的宽，默认 1280'), height: num('高，默认 800') }, ['canvas']),
    run: (config, a) => {
      createCanvas(config, a.canvas, { title: a.title || a.canvas, w: a.width || 1280, h: a.height || 800 });
      return canvasSummary(config, a.canvas);
    }
  },
  {
    name: 'scheme_new',
    description: '起一套新视觉方案：从 schemes/_template/ 复制成 schemes/<方案名>/、填名字，再跑一遍 token 构建、质量检查、Design System 构建，给回每一步过没过。方案名只用小写字母、数字、连字符。新方案的探索另建 <方案名>-explore 画布。',
    inputSchema: S({ scheme: str('方案名，比如 pith'), title: str('显示名，默认由方案名来'), check: bool('跑不跑检查，默认跑') }, ['scheme']),
    run: (config, a) => {
      const made = createScheme(config.repoAbs, a.scheme, { title: a.title });
      return { ...made, check: a.check === false ? null : checkScheme(config.repoAbs, a.scheme) };
    }
  },
  {
    name: 'read_board',
    description: '读画布 project/ 里的一个文件（画板 *.dc.html，或 README、数据之类的文本）。',
    inputSchema: S({ canvas: str('画布名'), file: str('project/ 里的路径，比如 Main.dc.html') }, ['canvas', 'file']),
    run: (config, a) => {
      needCanvas(config, a.canvas);
      const abs = projectFile(config, a.canvas, a.file);
      if (!fs.existsSync(abs)) throw new Error(`${a.canvas} 没有 ${a.file}`);
      return { canvas: a.canvas, file: a.file, content: fs.readFileSync(abs, 'utf8') };
    }
  },
  {
    name: 'write_board',
    description: '写一张画板（整份 HTML，覆盖原来的），并在 canvas.json 里登记：新板默认放在同一页最后一张的右边，page 写一个还没有的 id 就新建这一页（page_name 是页名，照 EX<N>：…/R<N>：… 写）。改之前存一个本地版本。写完用 check 自检。',
    inputSchema: S(
      {
        canvas: str('画布名'),
        file: str('画板文件名，以 .dc.html 结尾，比如 X6-Sticker.dc.html'),
        html: str('画板的全部 HTML'),
        title: str('画板标题，写「<资产> · <说明>」'),
        page: str('放在哪一页（页 id）'),
        page_name: str('新建页时的页名'),
        x: num('位置'),
        y: num('位置'),
        width: num('宽，默认 1280'),
        height: num('高，默认 800')
      },
      ['canvas', 'file', 'html']
    ),
    run: (config, a) => writeBoard(config, a)
  },
  {
    name: 'write_file',
    description: '写画布 project/ 里的一个文本文件（画板引用的样式、数据、说明）。canvas.json 不用它改（用 write_board、rename 这些）。',
    inputSchema: S({ canvas: str('画布名'), file: str('project/ 里的路径'), content: str('文件内容') }, ['canvas', 'file', 'content']),
    run: (config, a) => {
      needCanvas(config, a.canvas, 'canvas');
      if (/(^|\/)canvas\.json$/.test(a.file) || a.file.startsWith('ds/')) throw new Error('canvas.json、ds/ 不能直接写：用 write_board、rename、ds_install');
      const abs = projectFile(config, a.canvas, a.file);
      snapshot(config, a.canvas, 'save');
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, a.content, 'utf8');
      return { canvas: a.canvas, file: a.file, bytes: Buffer.byteLength(a.content) };
    }
  },
  {
    name: 'check',
    description: '自检：每张板（或一张）在无头 Chrome 里截图，看有没有报错、版面问题（出框、字被裁、图片坏了），再跑这块画布自带的 lint.mjs。image 为 true 且只查一张时，把截图一起给回来。',
    inputSchema: S({ canvas: str('画布名'), board: str('只查这一张（文件名）'), image: bool('把截图给回来（只在 board 写了时）') }, ['canvas']),
    run: async (config, a) => {
      needCanvas(config, a.canvas);
      const r = await runCheck(config, a.canvas, { board: a.board || null });
      const result = { canvas: a.canvas, passed: r.passed, boards: r.boards.map((b) => ({ file: b.file, passed: b.passed, size: b.size, errors: b.errors, layout: b.layout, shot: b.shot })), lints: r.lints };
      if (a.image && a.board && r.boards[0]?.shot) {
        const img = await shotImage(r.boards[0].shot);
        if (img) return { result, extra: [img] };
      }
      return result;
    }
  },
  {
    name: 'frames',
    description: '看动效：一张板在不减弱动效的情况下按时间线截几帧（默认每 250ms 到 2000ms，最多 24 帧），拼成一张总览图；click 先点这些字的按钮（依次）。check 只截减弱动效下的终态，动效要用这个看。image 为 true 时把总览图给回来。只为看，不保证两次一样。',
    inputSchema: S({ canvas: str('画布名'), board: str('画板文件名'), at: { type: 'array', items: { type: 'number' }, description: '时间点（毫秒），写了就不用 every、until' }, every: num('每隔多少毫秒一帧，默认 250'), until: num('截到第几毫秒，默认 2000'), click: { type: 'array', items: { type: 'string' }, description: '先依次点这些字的按钮' }, scale: num('帧的倍数，默认 1'), image: bool('把总览图给回来') }, ['canvas', 'board']),
    run: async (config, a) => {
      needCanvas(config, a.canvas);
      const times = frameTimes({ at: a.at || null, every: a.every, until: a.until });
      const r = await runFrames(config, a.canvas, { board: a.board, times, clicks: a.click || [], scale: a.scale || 1 });
      const result = { canvas: a.canvas, file: r.file, size: r.size, sheet: r.sheet, frames: r.frames.map(({ t, actual, png }) => ({ t, actual, png })), missedClicks: r.missedClicks, errors: r.errors };
      if (a.image && r.sheet) {
        const img = await shotImage(r.sheet);
        if (img) return { result, extra: [img] };
      }
      return result;
    }
  },
  {
    name: 'export',
    description: '导出 PNG（按板的大小乘 scale）或单文件 HTML（断网也能打开：React 和用到的字体都打进去）。默认放在 canvases/<画布名>/.shots/export/。',
    inputSchema: S({ canvas: str('画布名'), board: str('只导这一张'), png: bool('导 PNG（不写 png 也不写 html 时就是 PNG）'), html: bool('导单文件 HTML'), scale: num('PNG 的倍数，默认 2'), out: str('放到哪个目录') }, ['canvas']),
    run: async (config, a) => {
      needCanvas(config, a.canvas);
      const html = Boolean(a.html);
      const r = await exportBoards(config, a.canvas, { board: a.board || null, png: Boolean(a.png) || !html, html, scale: a.scale || 2, outDir: a.out ? path.resolve(REPO_ROOT, a.out) : null });
      return r;
    }
  },
  {
    name: 'open',
    description: '给站主看的地址：一块画布、某一页、某一张（单张铺满）。看服务在不在跑；没在跑先 serve_start。',
    inputSchema: S({ canvas: str('画布名'), page: str('页 id'), board: str('画板文件名'), port: num('端口，默认 4321；serve_start 换过端口就写同一个') }, ['canvas']),
    run: async (config, a) => {
      const kind = needCanvas(config, a.canvas);
      const base = serveBase(config, a.port);
      let url = `${base}/c/${a.canvas}/`;
      if (kind === 'canvas') {
        const c = readCanvasJson(config, a.canvas);
        if (a.page && !(c.pages || []).some((p) => p.id === a.page)) throw new Error(`${a.canvas} 没有这一页：${a.page}`);
        if (a.board && !c.boards?.[a.board]) throw new Error(`${a.canvas} 没有画板 ${a.board}`);
        url = boardAddress(base, a.canvas, { page: a.page || (a.board && c.boards[a.board].page) || null, board: a.board || null });
      }
      const s = await benchStatus(base);
      if (s && notOurs(config, s)) return { url, running: false, note: notOursMessage(config, s, a.port) };
      return { url, running: !!s };
    }
  },
  {
    name: 'rename',
    description: '改名。画布：canvas + title；一页：canvas + page + title；一张画板：canvas + board + title；Design System 或 Motion Deck 在 bench 里的名字：ds 或 motion（方案名）+ title（空的就回到原名）。目录名、文件名、地址都不变。',
    inputSchema: S({ canvas: str('画布名'), page: str('页 id'), board: str('画板文件名'), ds: str('Design System 的方案名'), motion: str('Motion Deck 的方案名'), title: str('新名字') }),
    run: (config, a) => {
      if (a.ds) return renameScheme(config, 'ds', a.ds, a.title ?? '', { known: listSystems(config).map((x) => x.name) });
      if (a.motion) return renameScheme(config, 'motion', a.motion, a.title ?? '', { known: listMotionSchemes(config).map((x) => x.name) });
      if (!a.canvas || !a.title) throw new Error('要写 canvas 和 title（或者 ds / motion）');
      if (a.board) return renameBoard(config, a.canvas, a.board, a.title);
      if (a.page) return renamePage(config, a.canvas, a.page, a.title);
      return renameCanvas(config, a.canvas, a.title);
    }
  },
  {
    name: 'delete',
    description: '删除：整块画布、其中一页（连画板、便签、批准记录）或一张画板（连批准记录）。都挪进回收处 canvases/.trash/，trash 工具能放回。删站主的东西之前先问站主。',
    inputSchema: S({ canvas: str('画布名'), page: str('删这一页'), board: str('删这一张') }, ['canvas']),
    run: (config, a) => (a.board ? deleteBoard(config, a.canvas, a.board) : a.page ? deletePage(config, a.canvas, a.page) : deleteCanvas(config, a.canvas))
  },
  {
    name: 'trash',
    description: '回收处：不写 restore 就列出删过的；restore 写一个 id 就原样放回。清空回收处只由站主做（命令行 dw trash empty --yes）。',
    inputSchema: S({ restore: str('要放回的 id') }),
    run: (config, a) => (a.restore ? restoreTrash(config, a.restore) : { items: listTrash(config) })
  },
  {
    name: 'ds_list',
    description: '本仓库的 Design System（schemes/<方案>/design-system/ 构建好的那份）：名字、构建了没有、云端地址。',
    inputSchema: S({}),
    run: (config) => ({ systems: listSystems(config) })
  },
  {
    name: 'ds_install',
    description: '把一个 Design System 挂到画布上（复制到 project/ds/<名字>/，canvas.json 记一笔），画板里引用 ds/<名字>/tokens.css 等。',
    inputSchema: S({ canvas: str('画布名'), system: str('方案名，比如 vermilion') }, ['canvas', 'system']),
    run: (config, a) => installSystem(config, a.canvas, a.system)
  },
  {
    name: 'db_get',
    description: '读页面存储（db.json，页面里 claude.use(\'db\') 写的）：不写 path 列出全部文档；问卷答案在 survey/answers。',
    inputSchema: S({ canvas: str('画布或问卷名'), path: str('文档路径，比如 survey/answers') }, ['canvas']),
    run: (config, a) => (a.path ? getDoc(config, a.canvas, a.path) : { docs: readStore(config, a.canvas) })
  },
  {
    name: 'db_set',
    description: '写页面存储的一个文档（整份替换），比如把站主在云端填的答案写回本地。',
    inputSchema: S({ canvas: str('画布或问卷名'), path: str('文档路径'), data: { type: 'object', description: '文档内容' } }, ['canvas', 'path', 'data']),
    run: (config, a) => {
      setDoc(config, a.canvas, a.path, a.data);
      return { ok: true, canvas: a.canvas, path: a.path };
    }
  },
  {
    name: 'review',
    description: '每张画板的批准状态（待批、已批准、退回和原因、标完以后又改过没有）。',
    inputSchema: S({ canvas: str('画布名') }, ['canvas']),
    run: (config, a) => {
      needCanvas(config, a.canvas, 'canvas');
      return { canvas: a.canvas, reviews: listReviews(config, a.canvas) };
    }
  },
  {
    name: 'review_propose',
    description: '把画板标成「待批」，请站主看（不写 boards 就是全部）。批准和退回只由站主在画布界面里做，这里做不了。clear 为 true 时清掉这几张的状态。',
    inputSchema: S({ canvas: str('画布名'), boards: { type: 'array', items: { type: 'string' }, description: '画板文件名' }, note: str('给站主的一句话'), clear: bool('清掉状态') }, ['canvas']),
    run: (config, a) => {
      needCanvas(config, a.canvas, 'canvas');
      const c = readCanvasJson(config, a.canvas);
      const boards = a.boards?.length ? a.boards : c.order || Object.keys(c.boards);
      for (const b of boards) if (!c.boards?.[b]) throw new Error(`${a.canvas} 没有画板 ${b}`);
      if (a.clear) {
        for (const b of boards) clearReview(config, a.canvas, b);
        return { cleared: boards };
      }
      for (const b of boards) setReview(config, a.canvas, b, 'proposed', { by: 'agent', note: a.note || '' });
      return { proposed: boards };
    }
  },
  {
    name: 'serve_status',
    description: '看画布的服务（dw serve）在不在跑。',
    inputSchema: S({ port: num('端口，默认 4321') }),
    run: async (config, a) => {
      const s = await benchStatus(serveBase(config, a.port));
      if (s && notOurs(config, s)) return { running: false, url: serveBase(config, a.port), other: s, note: notOursMessage(config, s, a.port) };
      return s ? { running: true, ...s } : { running: false, url: serveBase(config, a.port) };
    }
  },
  {
    name: 'serve_start',
    description: '启动画布的服务（dw serve，只听 127.0.0.1），已经在跑就直接说在哪。站主在浏览器或 Pomelo 的有板有眼里看。',
    inputSchema: S({ port: num('端口，默认 4321') }),
    run: (config, a) => serveStart(config, a)
  },
  {
    name: 'serve_stop',
    description: '停掉画布的服务（只停得了 dw serve 启动的）。站主可能正在看，停之前先问一声。',
    inputSchema: S({ port: num('端口，默认 4321') }),
    run: (config, a) => serveStop(config, a)
  },
  {
    name: 'checks',
    description: 'npm run all（构建所有方案和质量检查）上次的结果：每一步过没过、各方案没过和提醒的检查项。run 为 true 时再跑一遍（几分钟，自己一个进程，用 checks 看进度）。',
    inputSchema: S({ run: bool('再跑一遍') }),
    run: (config, a) => {
      if (a.run) return { started: startChecks(config, () => {}) };
      const d = readChecks(config);
      return {
        run: d.run && { status: d.run.status, startedAt: d.run.startedAt, finishedAt: d.run.finishedAt, steps: d.run.steps.map((s) => ({ id: s.id, status: s.status, ms: s.ms, ...(s.status === 'fail' ? { log: s.log.slice(-20) } : {}) })) },
        schemes: d.schemes.map((s) => ({ scheme: s.scheme, at: s.at, notPassed: s.items.filter((i) => i.status !== 'pass'), passed: s.items.filter((i) => i.status === 'pass').length })),
        watermark: d.watermark && { failed: d.watermark.items.filter((i) => i.status !== 'pass'), passed: d.watermark.items.filter((i) => i.status === 'pass').length }
      };
    }
  },
  {
    name: 'dw',
    description: '其余命令行能做的都走这里：照 node bench/bin/dw.js <args> 跑，给回输出。比如 ["help"]、["versions", "<画布>"]、["snapshot", "<画布>"]、["pull", "<画布>", "--listing", "<文件>"]、["verify", …]、["publish", …]、["motion", "export", "pomelo", "tooltip"]、["offline"]、["import", …]。serve、mcp 不行（用 serve_start）。',
    inputSchema: S({ args: { type: 'array', items: { type: 'string' }, description: 'dw 后面的参数' } }, ['args']),
    run: (config, a) => runDw(a.args)
  }
];

// ---------- 协议 ----------

async function callTool(config, name, args = {}) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) throw Object.assign(new Error(`没有这个工具：${name}`), { rpc: -32602 });
  const out = await tool.run(config, args || {});
  const extra = out && out.extra && out.result ? out.extra : [];
  const result = out && out.extra && out.result ? out.result : out;
  return { content: [{ type: 'text', text: JSON.stringify(result ?? null, null, 2) }, ...extra] };
}

/** Answers one JSON-RPC message (null for notifications). */
async function handle(config, msg) {
  const { id, method, params } = msg || {};
  const isRequest = id !== undefined && id !== null;
  const reply = (result) => (isRequest ? { jsonrpc: '2.0', id, result } : null);
  const fail = (code, message) => (isRequest ? { jsonrpc: '2.0', id, error: { code, message } } : null);
  try {
    switch (method) {
      case 'initialize': {
        const asked = params?.protocolVersion;
        return reply({
          protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'visual-atelier-dw', title: 'visual-atelier bench (dw)', version: `${VERSION} (bench api ${BENCH_API})` },
          instructions: INSTRUCTIONS
        });
      }
      case 'ping':
        return reply({});
      case 'tools/list':
        return reply({ tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema, annotations: annotationsOf(name) })) });
      case 'tools/call':
        try {
          return reply(await callTool(config, params?.name, params?.arguments));
        } catch (e) {
          if (e.rpc) return fail(e.rpc, e.message);
          return reply({ content: [{ type: 'text', text: e.message || String(e) }], isError: true });
        }
      case 'resources/list':
        return reply({ resources: [] });
      case 'resources/templates/list':
        return reply({ resourceTemplates: [] });
      case 'prompts/list':
        return reply({ prompts: [] });
      default:
        if (!isRequest || String(method).startsWith('notifications/')) return null;
        return fail(-32601, `不支持 ${method}`);
    }
  } catch (e) {
    return fail(-32603, e.message || String(e));
  }
}

/** dw mcp: reads JSON-RPC lines on stdin, answers on stdout; everything else goes to stderr. */
export async function serveMcp(config = loadConfig()) {
  const write = (obj) => process.stdout.write(JSON.stringify(obj) + '\n');
  const toErr = (...a) => process.stderr.write(util.format(...a) + '\n');
  console.log = toErr;
  console.info = toErr;
  console.warn = toErr;
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  const pending = new Set();
  rl.on('line', (line) => {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return write({ jsonrpc: '2.0', id: null, error: { code: -32700, message: '不是 JSON' } });
    }
    const batch = Array.isArray(msg) ? msg : [msg];
    for (const m of batch) {
      const p = handle(config, m).then((r) => r && write(r));
      pending.add(p);
      p.finally(() => pending.delete(p));
    }
  });
  await new Promise((resolve) => rl.on('close', resolve));
  await Promise.allSettled([...pending]);
}
