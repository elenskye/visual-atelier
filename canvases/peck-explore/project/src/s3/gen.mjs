// 第 3 步 · 方案 · 第一轮的生成器：写 ../../S3-*.dc.html、方案文件 ../../scheme/，并把这一页登记进 canvas.json（别的页不动）。
// 在这个目录跑：VA_ROOT=<visual-atelier 的根目录> node gen.mjs（APCA 用它装的 apca-w3；本地检查再加 PECK_LOCAL=1）
import path from 'node:path';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as color from './color.mjs';
import * as scale from './scale.mjs';
import * as controls from './controls.mjs';
import * as motion from './motion.mjs';
import * as icon from './icon.mjs';
import * as docs from './docs.mjs';
import { schemeFiles } from './scheme.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.PECK_OUT ? path.resolve(process.env.PECK_OUT) : path.resolve(HERE, '../..');
const PAGE = 's3r1';

const [col, con] = color.boards();
const [sc] = scale.boards();
const [ctl] = controls.boards();
const [mo] = motion.boards();
const [ic] = icon.boards();
const [rep] = docs.boards();
const place = [
  [col, 0, 0], [con, 1840, 0], [rep, 3200, 0],
  [ctl, 0, 1200], [sc, 1840, 1200], [ic, 3200, 1200],
  [mo, 1840, 2300],
];
const boards = place.map(([b, x, y]) => ({ ...b, x, y }));
for (const b of boards) writeFileSync(path.join(OUT, b.file), b.html);

// 方案文件：导入 visual-atelier 时整个 scheme/ 就是 schemes/peck/
const files = schemeFiles();
for (const [p, text] of Object.entries(files)) {
  const f = path.join(OUT, 'scheme', p);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, text);
}

const cpath = path.join(OUT, 'canvas.json');
const cv = JSON.parse(readFileSync(cpath, 'utf8'));
// 页名、页的先后、画布打开时落在哪一页都以 canvas.json 为准（站主在界面里能改名、删页，2026-11-13）；
// 这一页还没有时才加上，名字用下面这个
cv.pages = cv.pages || [];
if (!cv.pages.some((p) => p.id === PAGE)) cv.pages.push({ id: PAGE, name: '优化 · 方案：色板、对比度、控件、字和尺寸、图标、动效' });
for (const b of boards) {
  cv.boards[b.file] = { x: b.x, y: b.y, w: b.w || 1280, h: b.h || 800, title: b.title, page: PAGE, is_interactive: true, radius: 12 };
}
const mine = new Set(boards.map((b) => b.file));
cv.order = [...cv.order.filter((f) => !mine.has(f)), ...boards.map((b) => b.file)];
for (const k of Object.keys(cv.notes)) if (k.startsWith('s3r1-')) delete cv.notes[k];
Object.assign(cv.notes, docs.notes(PAGE));
writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
console.log(`写了 ${boards.length} 张：${boards.map((b) => b.file).join('、')}；方案文件 ${Object.keys(files).length} 个`);
