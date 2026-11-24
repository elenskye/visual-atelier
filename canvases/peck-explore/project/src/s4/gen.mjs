// 第 4 步 · Design System · 第一轮的生成器：
//   1. 方案文件 ../../scheme/（第 3 步的 + 站主的三个回答 + design-system/ 源）
//   2. 构建 Design System 到 <画布>/.ds/（project/ 发到云端，upload/ 是要上传的资产）
//   3. 挂到这块画布：../../ds/peck/ + canvas.json 的 designSystems
//   4. 画板 ../../S4-*.dc.html，这一页登记进 canvas.json（别的页不动）
// 在这个目录跑：VA_ROOT=<visual-atelier 的 tooling 的临时副本，schemes/peck 指到这里的 scheme/> node gen.mjs（本地检查再加 PECK_LOCAL=1）
// 字体和 A3 的原文件从画布的 blobs/ 取（build.mjs 的 FONT_SRC、A3_SRC）。
import path from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { schemeFiles, REMOVED } from './scheme.mjs';
import { buildDs, installDs, A3_SRC } from './build.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.PECK_OUT ? path.resolve(process.env.PECK_OUT) : path.resolve(HERE, '../..');
const DS_OUT = path.resolve(OUT, '../.ds');
const PAGE = 's4r1';
if (!process.env.VA_ROOT) throw new Error('要设 VA_ROOT（visual-atelier 的 tooling 用来构建 Design System）');

// 1. 方案文件
const pubPath = path.join(OUT, 'scheme/design-system/published.json');
const published = existsSync(pubPath) ? JSON.parse(readFileSync(pubPath, 'utf8')) : null;
const files = schemeFiles({ dsUrl: published?.url, a3: readFileSync(path.join(OUT, '..', A3_SRC)) });
for (const [p, text] of Object.entries(files)) {
  const f = path.join(OUT, 'scheme', p);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, text);
}
for (const p of REMOVED) rmSync(path.join(OUT, 'scheme', p), { force: true });

// 2. 构建
const built = await buildDs({ va: process.env.VA_ROOT, project: OUT, out: DS_OUT });

// 3. 挂到画布
const record = { title: 'Peck', namespace: 'peck', artifact: published?.url ?? null, version: published?.version ?? null, copiedAt: published?.lastChange?.at ?? new Date().toISOString().replace(/\.\d{3}Z$/, 'Z') };
const installed = installDs({ project: OUT, built, record });

// 4. 画板
let nBoards = 0;
if (!process.env.DS_ONLY) {
  const { boards, notes } = await import('./boards.mjs');
  const list = boards({ built, published });
  for (const b of list) writeFileSync(path.join(OUT, b.file), b.html);
  const cpath = path.join(OUT, 'canvas.json');
  const cv = JSON.parse(readFileSync(cpath, 'utf8'));
  // 页名、页的先后、画布打开时落在哪一页都以 canvas.json 为准（站主在界面里能改名、删页，2026-11-13）；
  // 这一页还没有时才加上，名字用下面这个
  cv.pages = cv.pages || [];
  if (!cv.pages.some((p) => p.id === PAGE)) cv.pages.push({ id: PAGE, name: '优化 · Design System' });
  for (const b of list) cv.boards[b.file] = { x: b.x, y: b.y, w: b.w, h: b.h, title: b.title, page: PAGE, is_interactive: true, radius: 12 };
  const mine = new Set(list.map((b) => b.file));
  cv.order = [...cv.order.filter((f) => !mine.has(f)), ...list.map((b) => b.file)];
  for (const k of Object.keys(cv.notes)) if (k.startsWith(PAGE + '-')) delete cv.notes[k];
  Object.assign(cv.notes, notes(PAGE, { published, built }));
  writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
  nBoards = list.length;
}
console.log(`方案文件 ${Object.keys(files).length} 个；Design System ${Object.keys(built.files).length} 个文件、资产 ${built.uploads.length} 个（还没上传 ${built.missing.length} 个）${built.files['project/design-system.json'] ? '，有 index' : '，没有 index'}；挂到画布 ${installed.length} 个；画板 ${nBoards} 张`);
