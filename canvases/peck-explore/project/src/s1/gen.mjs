// 第 1 步 · 图形语言 · 第一轮的生成器：写 ../../S1-*.dc.html，并把这一页登记进 canvas.json（别的页不动）。
// 在这个目录跑：node gen.mjs
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { direction } from './dirs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.PECK_OUT ? path.resolve(process.env.PECK_OUT) : path.resolve(HERE, '../..');
const PAGE = 's1r1';

const boards = [
  { file: 'S1-A.dc.html', x: 0, y: 0, ...direction('A') },
  { file: 'S1-B.dc.html', x: 1360, y: 0, ...direction('B') },
  { file: 'S1-C.dc.html', x: 2720, y: 0, ...direction('C') },
];
for (const extra of ['color', 'motion', 'icon']) {
  try {
    const mod = await import(`./${extra}.mjs`);
    boards.push(...mod.boards());
  } catch (e) {
    if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e;
  }
}

for (const b of boards) writeFileSync(path.join(OUT, b.file), b.html);

// canvas.json：只改这一页的画板和便签
const cpath = path.join(OUT, 'canvas.json');
const cv = JSON.parse(readFileSync(cpath, 'utf8'));
// 页名、页的先后、画布打开时落在哪一页都以 canvas.json 为准（站主在界面里能改名、删页，2026-11-13）；
// 这一页还没有时才加上，名字用下面这个
cv.pages = cv.pages || [];
if (!cv.pages.some((p) => p.id === PAGE)) cv.pages.push({ id: PAGE, name: '探索 2 · 图形语言第一轮：三个方向、配色、动效、图标' });
if (!cv.pages.some((p) => p.id === 'v0')) cv.pages.unshift({ id: 'v0', name: '探索 1 · 初版（11-08，整版退回）' });
for (const [k, b] of Object.entries(cv.boards)) if (!b.page && !k.startsWith('S1-')) b.page = 'v0';
if (cv.notes.title) cv.notes.title.text = 'Peck Explore · 初版（2026-11-08，已退回）';
for (const [, n] of Object.entries(cv.notes)) if (!n.page) n.page = 'v0';
for (const b of boards) {
  cv.boards[b.file] = { x: b.x, y: b.y, w: b.w || 1280, h: b.h || 800, title: b.title, page: PAGE, is_interactive: true, radius: 12 };
}
const mine = new Set(boards.map((b) => b.file));
cv.order = [...cv.order.filter((f) => !mine.has(f)), ...boards.map((b) => b.file)];
for (const k of Object.keys(cv.notes)) if (k.startsWith('s1r1-')) delete cv.notes[k];
Object.assign(cv.notes, {
  's1r1-title': { x: 0, y: -300, text: '第 1 步 · 图形语言 · 第一轮', kind: 'title1', maxW: 4000, page: PAGE },
  's1r1-how': {
    x: 4080, y: 0, w: 380, fill: 'teal', page: PAGE,
    text: '怎么看\n\n上排：三个方向摆同一套内容（项目、正在做、改动、ASK、控件、输入框）。每张右上角 Tweaks 能切深色 / 浅色。\n\n下排：配色四套（上浅下深）、动效四种性格 × 三个场景、App 图标六个方向。\n\n要动的按 Play 看（信号线、荧光笔、点阵、计时都在动）。',
  },
  's1r1-pick': {
    x: 4080, y: 560, w: 380, fill: 'orange', page: PAGE,
    text: '这一轮请你挑\n\n1. 方向：A / B / C，可以混（比如 C 的点阵数字 + B 的冷白纸面）\n2. 配色：P1–P4\n3. 动效：M1–M4，可以按场景挑\n4. 图标：I1–I6，留一两个往下画\n\n不喜欢的直接说哪里不对，下一轮按你的话改。',
  },
  's1r1-why': {
    x: 4080, y: 1100, w: 380, fill: 'gray', page: PAGE,
    text: '这一轮怎么避开「像 VSCode」\n\n· 不再一层层灰面板 + 满屏等宽字\n· 底色有性格：点阵网格 / 冰白 / 纯黑\n· 青色只用纯 #00E5FF，是全屏唯一会发光的颜色\n· 浅色里青色不当字，当荧光笔底色配墨色字\n· 辅助色只用浅而干净的那几种',
  },
});
writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
console.log(`写了 ${boards.length} 张：${boards.map((b) => b.file).join('、')}`);
