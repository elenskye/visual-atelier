// 第 2 步 · 外框小样 · 第三轮的生成器：写 ../../S2c-*.dc.html 和 ../../peck-rules.md（第二版），并把这一页登记进 canvas.json（别的页不动）。
// 在这个目录跑：node gen.mjs（本地检查加 PECK_LOCAL=1，字体和图片指到 project/ref/）
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as side from './side.mjs';
import * as docs from './docs.mjs';
import { COUNT } from './rules.mjs';

// 冻结了（2026-11-13，站主定：优化阶段每项资产只留最新一份）：第三轮整轮被第四轮替掉。画板在 Git 历史里，别再跑。
if (!process.env.FROZEN_OK) {
  console.error('s2c 冻结了：这一轮已经从 Peck Explore 删掉（README「页」）。真要重跑：FROZEN_OK=1 PECK_OUT=<别的目录>，别写回 project/。');
  process.exit(1);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.PECK_OUT ? path.resolve(process.env.PECK_OUT) : path.resolve(HERE, '../..');
const PAGE = 's2r3';

const [proto, wide, flow] = side.boards();
const [rules, report] = docs.boards();
const place = [
  [proto, 0, 0], [wide, 1360, 0], [report, 2720, 0],
  [flow, 0, 1000], [rules, 1840, 1000],
];
const boards = place.map(([b, x, y]) => ({ ...b, x, y }));
for (const b of boards) writeFileSync(path.join(OUT, b.file), b.html);
writeFileSync(path.join(OUT, 'peck-rules.md'), docs.rulesMd());

const cpath = path.join(OUT, 'canvas.json');
const cv = JSON.parse(readFileSync(cpath, 'utf8'));
const pages = [{ id: PAGE, name: '第 2 步 · 外框小样 · 第三轮' }];
for (const p of cv.pages || []) if (p.id !== PAGE) pages.push(p);
cv.pages = pages;
cv.launch = { view: 'canvas', page: PAGE };
for (const b of boards) {
  cv.boards[b.file] = { x: b.x, y: b.y, w: b.w || 1280, h: b.h || 800, title: b.title, page: PAGE, is_interactive: true, radius: 12 };
}
const mine = new Set(boards.map((b) => b.file));
cv.order = [...cv.order.filter((f) => !mine.has(f)), ...boards.map((b) => b.file)];
for (const k of Object.keys(cv.notes)) if (k.startsWith('s2r3-')) delete cv.notes[k];
Object.assign(cv.notes, {
  's2r3-title': { x: 0, y: -300, text: '第 2 步 · 外框小样 · 第三轮：右栏四个模块 + 规则第二版', kind: 'title1', maxW: 3600, page: PAGE },
  's2r3-took': {
    x: 4080, y: 0, w: 400, fill: 'teal', page: PAGE,
    text: '你定的三件事都落了：权限三档 PLAN / EDIT / AUTO；AUTO 时删文件、改项目外的还问；代码可以是 Departure Mono 11。\n\n右栏改成四个页签：CHANGES、ONE SHOT（边干活边问）、FILES（看项目文件）、TERM（自己跑命令）。\n\n左上那张能点：任务照第一轮那样从头跑到尾，跑的同时切页签、问 ONE SHOT、看文件、跑命令；每个模块右上能展开到宽栏。旁边一张是展开的样子，下面一张摆出 12 个时刻。\n\n右栏只照规则画，不够的地方补进规则（规则板标 NEW / CHG，共 ' + COUNT.all + ' 条）。',
  },
  's2r3-pick': {
    x: 4080, y: 760, w: 400, fill: 'orange', page: PAGE,
    text: '这一轮请你看\n\n1. 四个模块好不好用：切页签、带上、跳过去，像不像一个 App\n2. 规则第二版认不认\n3. 结果板上 3 件要你定的事：单次请求挪进 ONE SHOT、ONE SHOT 只走 API、终端里改的文件算谁的\n\n认了，第 2 步就收尾，进第 3 步「方案」：明暗定值过 APCA、控件全套、动效数值、图标各尺寸定稿。',
  },
});
writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
console.log(`写了 ${boards.length} 张：${boards.map((b) => b.file).join('、')}；peck-rules.md（${COUNT.all} 条，新 ${COUNT.nw}，改 ${COUNT.chg}）`);
