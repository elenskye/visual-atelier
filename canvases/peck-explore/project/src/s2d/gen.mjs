// 第 2 步 · 外框小样 · 第四轮的生成器：写 ../../S2d-*.dc.html 和 ../../peck-rules.md（第三版），并把这一页登记进 canvas.json（别的页不动）。
// 在这个目录跑：node gen.mjs（本地检查加 PECK_LOCAL=1，字体和图片指到 project/ref/）
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as side from './side.mjs';
import * as docs from './docs.mjs';
import { COUNT } from './rules.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.PECK_OUT ? path.resolve(process.env.PECK_OUT) : path.resolve(HERE, '../..');
const PAGE = 's2r4';

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
// 页名、页的先后、画布打开时落在哪一页都以 canvas.json 为准（站主在界面里能改名、删页，2026-11-13）；
// 这一页还没有时才加上，名字用下面这个
cv.pages = cv.pages || [];
if (!cv.pages.some((p) => p.id === PAGE)) cv.pages.push({ id: PAGE, name: '优化 · 外框小样（第四轮为准）：右栏四个模块、ONE SHOT、规则第三版' });
for (const b of boards) {
  cv.boards[b.file] = { x: b.x, y: b.y, w: b.w || 1280, h: b.h || 800, title: b.title, page: PAGE, is_interactive: true, radius: 12 };
}
const mine = new Set(boards.map((b) => b.file));
cv.order = [...cv.order.filter((f) => !mine.has(f)), ...boards.map((b) => b.file)];
for (const k of Object.keys(cv.notes)) if (k.startsWith('s2r4-')) delete cv.notes[k];
Object.assign(cv.notes, {
  's2r4-title': { x: 0, y: -300, text: '第 2 步 · 外框小样 · 第四轮：ONE SHOT 选谁来答、终端会锁 + 规则第三版', kind: 'title1', maxW: 3600, page: PAGE },
  's2r4-took': {
    x: 4080, y: 0, w: 400, fill: 'teal', page: PAGE,
    text: '你回的三件事都落了：\n\n1. 单次请求挪进 ONE SHOT，API 模式的「谁来干」只剩单模型干活、规划 + 实施。\n2. ONE SHOT 用 Muse、Grok 和 API 模型都能答（左下的选项片弹菜单）；能读整个项目，回答上写读了哪些文件；不改文件、不跑命令。\n3. 模型在跑任务时终端锁着：从发出到做完，等你批、等你答、撤销的时候都算。做完解锁，之后你改的文件不算进任务。\n\n左上那张能点：任务照样从头跑到尾；跑的时候去 TERM 点输入行试试锁。旁边是 ONE SHOT 展开的样子，下面摆出 12 个时刻。\n\n规则板标 NEW / CHG，共 ' + COUNT.all + ' 条。',
  },
  's2r4-pick': {
    x: 4080, y: 860, w: 400, fill: 'orange', page: PAGE,
    text: '这一轮请你看\n\n1. ONE SHOT 的菜单和「读了哪些文件」、终端锁着的样子对不对\n2. 规则第三版认不认\n3. 结果板上 3 件要你定的事：发任务时终端还有命令在跑怎么办、ONE SHOT 默认谁来答、PLAN 档也锁不锁\n\n认了，第 2 步就收尾：权限三档、四个模块、ONE SHOT、终端锁一起写进 Peck 的 design.md 和 roadmap，然后进第 3 步「方案」。',
  },
});
writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
console.log(`写了 ${boards.length} 张：${boards.map((b) => b.file).join('、')}；peck-rules.md（${COUNT.all} 条，新 ${COUNT.nw}，改 ${COUNT.chg}）`);
