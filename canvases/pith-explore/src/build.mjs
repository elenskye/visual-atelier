// R1：Pith 定稿（页 id r1，站主 2026-11-24 验收 EX11 后开始做的优化页）。全部从 schemes/pith 出：颜色和动效是 Design System 的同一份 CSS（scheme.mjs），
// 图形是 tooling/pith/glyphs.mjs（schemes/pith/marks/ 也从它生成）。只写自己这一页，两次生成逐字节一样。
// 用法（仓库根目录）：node canvases/pith-explore/src/build.mjs
import { writePage } from '../page.mjs';
import { app } from './app.mjs';
import { guide } from './guide.mjs';
import { logoBoard, topbarBoard, iconsBoard, agentsBoard } from './boards.mjs';
import { apcaReport } from './scheme.mjs';

const GAP = 80;
const G = guide();
const row = [
  ['Pith-App.dc.html', app(), 'App · 能点的原型（对话、知识库、文献库、设置）', true],
  ['Pith-Logo.dc.html', logoBoard(), 'Logo：蕨芽从底下长出来，结一颗果', true],
  ['Pith-Topbar.dc.html', topbarBoard(), '顶栏：三个图标各自长出来', true],
  ['Pith-Agents.dc.html', agentsBoard(), 'Pith 在想：Agent 行为的动态图标'],
  ['Pith-Icons.dc.html', iconsBoard(), '图标：铅字 × 数字花园'],
];
let x = 0;
const boards = [{ file: 'Pith-Notes.dc.html', html: G.html, x: 0, y: 0, w: G.w, h: G.h, title: '先看这张 · 这一页是什么、方案在哪、怎么用' }];
for (const [file, b, title, inter] of row) { boards.push({ file, html: b.html, x, y: G.h + 120, w: b.w, h: b.h, title, ...(inter ? { is_interactive: true } : {}) }); x += b.w + GAP; }
writePage({ id: 'r1', name: 'R1：Pith 定稿（App、Logo、顶栏、Pith 在想、图标）', prefix: 'Pith-', boards });
for (const r of await apcaReport()) console.log(`${r.palette} ${r.mode === 'light' ? '亮' : '暗'}：${r.pass ? '全过' : '有不过的'}，最紧的一对 ${r.min.use} Lc ${r.min.lc.toFixed(1)}（要 ${r.min.min}）`);
console.log(`r1：${boards.length} 张板（含说明板）`);
