// 第 2 步 · 外框小样 · 第一轮的生成器：写 ../../S2-*.dc.html，并把这一页登记进 canvas.json（别的页不动）。
// 在这个目录跑：node gen.mjs（本地检查加 PECK_LOCAL=1，字体指到 project/ref/）
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boards as make } from './boards.mjs';

// 冻结了（2026-11-13，站主定：优化阶段每项资产只留最新一份）：第一轮的三栏小样被第四轮的右栏小样替掉；这一页留下的「流程一览」（S2-Flow）挪到了「优化 · 外框小样 · 迁移测试和流程」。画板在 Git 历史里，别再跑。
if (!process.env.FROZEN_OK) {
  console.error('s2 冻结了：这一轮已经从 Peck Explore 删掉（README「页」）。真要重跑：FROZEN_OK=1 PECK_OUT=<别的目录>，别写回 project/。');
  process.exit(1);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.PECK_OUT ? path.resolve(process.env.PECK_OUT) : path.resolve(HERE, '../..');
const PAGE = 's2r1';

const boards = make();
for (const b of boards) writeFileSync(path.join(OUT, b.file), b.html);

const cpath = path.join(OUT, 'canvas.json');
const cv = JSON.parse(readFileSync(cpath, 'utf8'));
const pages = [{ id: PAGE, name: '第 2 步 · 外框小样 · 第一轮' }];
for (const p of cv.pages || []) if (p.id !== PAGE) pages.push(p);
cv.pages = pages;
cv.launch = { view: 'canvas', page: PAGE };
for (const b of boards) {
  cv.boards[b.file] = { x: b.x, y: b.y, w: b.w || 1280, h: b.h || 800, title: b.title, page: PAGE, is_interactive: true, radius: 12 };
}
const mine = new Set(boards.map((b) => b.file));
cv.order = [...cv.order.filter((f) => !mine.has(f)), ...boards.map((b) => b.file)];
for (const k of Object.keys(cv.notes)) if (k.startsWith('s2r1-')) delete cv.notes[k];
Object.assign(cv.notes, {
  's2r1-title': { x: 0, y: -300, text: '第 2 步 · 外框小样 · 第一轮', kind: 'title1', maxW: 3120, page: PAGE },
  's2r1-took': {
    x: 3200, y: 0, w: 400, fill: 'teal', page: PAGE,
    text: '第 1 步定下来的，这一页全用上\n\n· C 点阵终端 × P3 深海；浅色的青是 L2 深青\n· 字体 F2：名字用缝合像素，说明用 Plex + 苹方，代码用 Departure Mono；数字、标签、按钮用 Doto\n· 像素阶梯角、LED 点阵孔、强发光\n· 动效 M4 点阵为主，M3 弹扣只给在跑那一步，M1 扫描在发出、等你、完成、撤销时各扫一次\n· 图标 J2 为主，现在的图标用 A3，设置里能换\n\n怎么点：按左边那张的 Play，点输入框写一句话 → SEND → 等一下会弹高危卡片，ALLOW → 再等一下 Grok 会问你，选一个 SUBMIT → 做完以后右边 UNDO TASK → 确认。右上 RESET 从头再来。',
  },
  's2r1-pick': {
    x: 3200, y: 640, w: 400, fill: 'orange', page: PAGE,
    text: '这一轮请你看\n\n1. 三栏分工对不对：左边项目和任务（加这个任务的记录），中间新任务和对话，右边改动\n2. 顶栏：品牌、项目、CLI/API、设置\n3. 流程顺不顺：先一次批高危的事，跑的时候再问问题，做完默认留着，撤销前确认一次\n4. 动效接进真实流程以后，节奏太快还是太慢\n5. 哪里缺东西、哪里多余\n\n这一轮认了，下一轮把它写成规则，再做迁移测试（设置、额度、空状态、加载这些没画过的，只照规则画）。',
  },
});
writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
console.log(`写了 ${boards.length} 张：${boards.map((b) => b.file).join('、')}`);
