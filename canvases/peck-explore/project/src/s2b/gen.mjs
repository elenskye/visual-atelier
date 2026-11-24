// 第 2 步 · 外框小样 · 第二轮的生成器：写 ../../S2b-*.dc.html 和 ../../peck-rules.md，并把这一页登记进 canvas.json（别的页不动）。
// 在这个目录跑：node gen.mjs（本地检查加 PECK_LOCAL=1，字体和图片指到 project/ref/）
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as docs from './docs.mjs';
import * as settings from './settings.mjs';
import * as api from './api.mjs';
import * as states from './states.mjs';
import { COUNT } from './rules.mjs';

// 冻结了（2026-11-13，站主定：优化阶段每项资产只留最新一份）：第二轮的规则（第一版）和结果板被第四轮替掉；留下的外框解剖、四张迁移测试在「优化 · 外框小样 · 迁移测试和流程」，原样不再生成。画板在 Git 历史里，别再跑。
if (!process.env.FROZEN_OK) {
  console.error('s2b 冻结了：这一轮已经从 Peck Explore 删掉（README「页」）。真要重跑：FROZEN_OK=1 PECK_OUT=<别的目录>，别写回 project/。');
  process.exit(1);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.PECK_OUT ? path.resolve(process.env.PECK_OUT) : path.resolve(HERE, '../..');
const PAGE = 's2r2';

const [rules, anat, report] = docs.boards();
const [set] = settings.boards();
const [apiB] = api.boards();
const [st, stFlow] = states.boards();
const place = [
  [rules, 0, 0], [anat, 1840, 0],
  [report, 0, 1200], [set, 1360, 1200], [apiB, 2720, 1200],
  [st, 0, 2120], [stFlow, 1360, 2120],
];
const boards = place.map(([b, x, y]) => ({ ...b, x, y }));
for (const b of boards) writeFileSync(path.join(OUT, b.file), b.html);
writeFileSync(path.join(OUT, 'peck-rules.md'), docs.rulesMd());

const cpath = path.join(OUT, 'canvas.json');
const cv = JSON.parse(readFileSync(cpath, 'utf8'));
const pages = [{ id: PAGE, name: '第 2 步 · 外框小样 · 第二轮' }];
for (const p of cv.pages || []) if (p.id !== PAGE) pages.push(p);
cv.pages = pages;
cv.launch = { view: 'canvas', page: PAGE };
for (const b of boards) {
  cv.boards[b.file] = { x: b.x, y: b.y, w: b.w || 1280, h: b.h || 800, title: b.title, page: PAGE, is_interactive: true, radius: 12 };
}
const mine = new Set(boards.map((b) => b.file));
cv.order = [...cv.order.filter((f) => !mine.has(f)), ...boards.map((b) => b.file)];
for (const k of Object.keys(cv.notes)) if (k.startsWith('s2r2-')) delete cv.notes[k];
Object.assign(cv.notes, {
  's2r2-title': { x: 0, y: -300, text: '第 2 步 · 外框小样 · 第二轮：写成规则 + 迁移测试', kind: 'title1', maxW: 3600, page: PAGE },
  's2r2-took': {
    x: 3680, y: 0, w: 400, fill: 'teal', page: PAGE,
    text: `第一轮的小样你整个批准了。这一轮做两件事：\n\n1. 写成规则：从小样里写出 ${COUNT.all} 条（第一排左边），旁边那张在小样上标出每一处对应哪条。同一份规则也存成画布里的 peck-rules.md。\n\n2. 迁移测试：拿 4 个没画过的界面只照规则画（第二、三排）——设置、API 模式、空 / 加载 / 出错、额度与花费的外框。规则不够的地方补上了（规则板上标 NEW / CHG）。\n\n能点的：设置左边的导航；API 模式里点 MORE 看填 Key；空 / 加载 / 出错在 Tweaks 里切状态，旁边那张一次摆出 7 个。`,
  },
  's2r2-pick': {
    x: 3680, y: 680, w: 400, fill: 'orange', page: PAGE,
    text: '这一轮请你看\n\n1. 规则认不认（哪条不对、缺哪条）\n2. 迁移测试画出来的 4 个界面像不像同一个 App\n3. 迁移测试结果那张板上 3 件要你定的事：权限三档用哪一套、全部放行时还问不问、代码字号能不能是 11\n\n认了，第 2 步就收尾，进第 3 步「方案」：明暗定值过 APCA、控件全套、动效数值、图标各尺寸定稿。',
  },
});
writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
console.log(`写了 ${boards.length} 张：${boards.map((b) => b.file).join('、')}；peck-rules.md`);
