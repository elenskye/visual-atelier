// 第 1 步 · 图形语言 · 第二轮的生成器：写 ../../S1b-*.dc.html，并把这一页登记进 canvas.json（别的页不动）。
// 在这个目录跑：node gen.mjs
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.PECK_OUT ? path.resolve(process.env.PECK_OUT) : path.resolve(HERE, '../..');
const PAGE = 's1r2';

const boards = [];
for (const m of ['main', 'dims', 'ask', 'motion', 'icon']) {
  try {
    const mod = await import(`./${m}.mjs`);
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
if (!cv.pages.some((p) => p.id === PAGE)) cv.pages.push({ id: PAGE, name: '探索 3 · 图形语言第二轮：主样板、四个细节、ASK 卡片、图标' });
for (const b of boards) {
  cv.boards[b.file] = { x: b.x, y: b.y, w: b.w || 1280, h: b.h || 800, title: b.title, page: PAGE, is_interactive: true, radius: 12 };
}
const mine = new Set(boards.map((b) => b.file));
cv.order = [...cv.order.filter((f) => !mine.has(f)), ...boards.map((b) => b.file)];
for (const k of Object.keys(cv.notes)) if (k.startsWith('s1r2-')) delete cv.notes[k];
Object.assign(cv.notes, {
  's1r2-title': { x: 0, y: -300, text: '第 1 步 · 图形语言 · 第二轮', kind: 'title1', maxW: 4000, page: PAGE },
  's1r2-took': {
    x: 4080, y: 0, w: 380, fill: 'teal', page: PAGE,
    text: '第一轮你定的\n\n· 方向 C 点阵终端\n· 配色 P3 深海\n· 动效 M4 点阵为主，留 M3 的「在跑」、M1 的扫描做点缀\n· 图标重新来一轮，其中一个只把现在的图标像素化\n· ASK 学 Claude Code：一张卡装得下很多信息，有选择题和判断题；权限一次放进一张卡\n\n上排：两张主样板（在跑 / 停下来问你，Tweaks 切明暗）和还没定的四个细节。\n下排：ASK 卡片（能点）、动效怎么融合、新图标。按 Play 看动的。',
  },
  's1r2-pick': {
    x: 4080, y: 620, w: 380, fill: 'orange', page: PAGE,
    text: '这一轮请你定\n\n1. 主样板认不认（哪里不对直接说）\n2. 四个细节各挑一格：角、底纹、发光、点阵字用到哪（中间那格是我推荐的）\n3. ASK 卡片：问题卡和权限卡的样子、信息量够不够\n4. 动效融合：五个场景里哪个过了、哪个太多\n5. 图标：J1–J5 留一到两个\n\n认了就进第 2 步：做能点的三栏小样。',
  },
});
writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
console.log(`写了 ${boards.length} 张：${boards.map((b) => b.file).join('、')}`);
