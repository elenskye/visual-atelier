// 第 1 步 · 图形语言 · 第三轮的生成器：写 ../../S1c-*.dc.html，并把这一页登记进 canvas.json（别的页不动）。
// 在这个目录跑：node gen.mjs（本地检查加 PECK_LOCAL=1，字体和图片指到 project/ref/）
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.PECK_OUT ? path.resolve(process.env.PECK_OUT) : path.resolve(HERE, '../..');
const PAGE = 's1r3';

const boards = [];
for (const m of ['main', 'font', 'cyan', 'parts', 'icon']) {
  try {
    const mod = await import(`./${m}.mjs`);
    boards.push(...mod.boards());
  } catch (e) {
    if (e.code !== 'ERR_MODULE_NOT_FOUND' || !String(e.message).includes(`${m}.mjs`)) throw e;
  }
}
for (const b of boards) writeFileSync(path.join(OUT, b.file), b.html);

// canvas.json：只改这一页的画板和便签
const cpath = path.join(OUT, 'canvas.json');
const cv = JSON.parse(readFileSync(cpath, 'utf8'));
// 页名、页的先后、画布打开时落在哪一页都以 canvas.json 为准（站主在界面里能改名、删页，2026-11-13）；
// 这一页还没有时才加上，名字用下面这个
cv.pages = cv.pages || [];
if (!cv.pages.some((p) => p.id === PAGE)) cv.pages.push({ id: PAGE, name: '探索 4 · 图形语言第三轮：界面字体、浅色的青、像素角、图标' });
for (const b of boards) {
  cv.boards[b.file] = { x: b.x, y: b.y, w: b.w || 1280, h: b.h || 800, title: b.title, page: PAGE, is_interactive: true, radius: 12 };
}
const mine = new Set(boards.map((b) => b.file));
cv.order = [...cv.order.filter((f) => !mine.has(f)), ...boards.map((b) => b.file)];
for (const k of Object.keys(cv.notes)) if (k.startsWith('s1r3-')) delete cv.notes[k];
Object.assign(cv.notes, {
  's1r3-title': { x: 0, y: -300, text: '第 1 步 · 图形语言 · 第三轮', kind: 'title1', maxW: 4000, page: PAGE },
  's1r3-took': {
    x: 4080, y: 0, w: 380, fill: 'teal', page: PAGE,
    text: '第二轮你定的\n\n· 主样板、ASK 卡片、动效都认了\n· 角：像素阶梯角；底纹：LED 点阵孔\n· 发光：强\n· 点阵字：标签和按钮也用（改英文大写）\n· 图标：J2，同时留现在的图标（润色背景），设置里能换\n\n这一轮新做的\n· 浅色里的青色调了三种\n· 界面字体三种\n· 分段的选中块、标签这些青色小块也切成像素角\n\n两张主样板的 Tweaks 能切明暗、字体、浅色的青，默认是我推荐的。',
  },
  's1r3-pick': {
    x: 4080, y: 700, w: 380, fill: 'orange', page: PAGE,
    text: '这一轮请你定\n\n1. 界面字体：F1 光滑 / F2 像素名字 / F3 全像素\n2. 浅色的青：L1 柔青 / L2 深青 / L3 墨底青光\n3. 零件的像素角认不认（放大 4 倍那格看得清）\n4. 现在的图标润色哪一版：A1 / A2 / A3\n5. 设置里换图标的样子\n\n中间那格是我推荐的。都认了，第 1 步就收尾，进第 2 步：做能点的三栏小样。',
  },
});
writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
console.log(`写了 ${boards.length} 张：${boards.map((b) => b.file).join('、')}`);
