// VL2 · Phase 2 最终设计：生成这一页的全部画板、canvas.json、文档副本和本地预览页。
// 用法：node gen.mjs                         以本地 project/canvas.json 为底（没有就新建）
// 用法：CANVAS=<从画布读回的 canvas.json> node gen.mjs   站主在画布上挪过东西时，以画布上的为底
// 产物：../project/（和画布上一模一样的文件）、../preview/（本地预览，用画布运行时的副本，要用 http 打开）
import { writeFileSync, readFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLES, ICONS, pomelo, render, pomeloSvg, iconSymbol } from './art.mjs';
import { V, texDefs, glyphDefs, resetUid } from './parts.mjs';
import { BASE_CSS } from './css.mjs';
import { POP_CSS, rowData, ROWS, rowMarkSymbol } from './views.mjs';
import { MODS, TODOS, Q1, A1, ANSWERS, SUGGEST, INDEX, NEAR } from './content.mjs';
import { buildB, B_CSS, NOTES, SHEET, edgeSymbols } from './b.mjs';
import { buildControls, CONTROLS_CSS } from './controls.mjs';
import { zineData, zineDefs } from './zine.mjs';
import { buildMigrate, migrateDefs, MIGRATE_CSS } from './migrate.mjs';
import { RUNTIME } from '../../_lib/root.mjs';

// 冻结了（2026-11-13）：这一页（Phase 2 · 最终设计，外框的一轮优化）被「优化 · 外框」替掉，从画布上删了，画板在 Git 历史里。
// 这里的代码还是 frame/、schemes/pomelo/ 里写的「照 Phase 2 定稿」的出处，所以留着；别再跑。
if (!process.env.FROZEN_OK) {
  console.error('p2-final 冻结了：这一页已经从 Pomelo Explore 删掉（README「冻结的生成器」）。真要重跑，FROZEN_OK=1，而且只写进 preview/ 看，别放回画布。');
  process.exit(1);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(HERE, '../project');
const PREVIEW = path.join(HERE, '../preview');
mkdirSync(PROJECT, { recursive: true });
mkdirSync(PREVIEW, { recursive: true });
copyFileSync(RUNTIME, path.join(PREVIEW, 'dc-runtime.js'));
const LOGIC = readFileSync(path.join(HERE, 'logic.js'), 'utf8');
const PAL_NAMES = ['蓝笔 · 方格纸', '紫笔 · 樱粉荧光', '黑笔 · 牛皮纸', '柚黄桌面', '薄荷桌面'];
const st = STYLES.hybrid;

function defs(extra = '') {
  const icons = Object.keys(ICONS).map((id) => iconSymbol(id, st, V, { idp: `is${id}` })).join('');
  const pm = render(pomelo('normal'), st, V, { k: 1.25, idp: 'pms' });
  return `${texDefs('tx')}${glyphDefs()}${extra}<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${icons}${rowMarkSymbol(SHEET.w - 74)}${edgeSymbols()}<symbol id="pm-static" viewBox="-6 -6 112 108">${pm.defs ? `<defs>${pm.defs}</defs>` : ''}${pm.html}</symbol></defs></svg>`;
}

function data(extra = {}) {
  return {
    todosDone: TODOS.map((t, i) => i === 1),
    mods: Object.fromEntries(Object.entries(MODS).map(([k, m]) => [k, { name: m.name, icon: m.icon || '', empty: m.empty || '' }])),
    chat0: [{ me: 1, text: Q1 }, { yz: 1, ...A1 }],
    answers: ANSWERS, suggest: SUGGEST, rows: ROWS.length, rowData: rowData(), index: INDEX, near: NEAR,
    notes: {}, noteBox: {},
    ...extra,
  };
}

function board(file, title, cfg, inner, css, dat, logic = LOGIC, extraDefs = '') {
  const props = {
    palette: { editor: 'enum', options: PAL_NAMES, default: PAL_NAMES[0], section: '配色' },
    dark: { editor: 'boolean', default: false, section: '配色' },
    $preview: { width: 1280, height: 800 },
  };
  const script = `const CFG = ${JSON.stringify(cfg)};\nconst DATA = ${JSON.stringify(dat)};\n${logic}`;
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
${BASE_CSS}
${POP_CSS}
${css}
</style>
</helmet>
<div class="{{root}}" onPointerMove="{{rootMove}}" style="width: 1280px; height: 800px">
${defs(extraDefs)}
${inner}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${JSON.stringify(props).replace(/'/g, '&#39;')}'>
${script}
</script>
</body>
</html>
`;
  writeFileSync(path.join(PROJECT, file), html);
  writeFileSync(path.join(PREVIEW, file.replace('.dc.html', '.html')), html.replace('<script src="./support.js"></script>', '<script src="./dc-runtime.js"></script>'));
  console.log(file, (html.length / 1024).toFixed(0) + ' KB');
  return { file, title };
}

// ---------- B3：同一份可点小样，起始画面不同 ----------
const notes = Object.fromEntries(Object.entries(NOTES).map(([id, n]) => [id, { x: 0, y: 0, r: n[4], z: n[5] }]));
const noteBox = Object.fromEntries(Object.entries(NOTES).map(([id, n]) => [id, n.slice(0, 4)]));
const B_BOARDS = [
  [{ start: 'home' }, 'Main.dc.html', 'B3 · 桌面'],
  [{ start: 'money', tabs: ['home', 'days', 'notes', 'pomelo', 'money'] }, 'P2-Pages.dc.html', 'B3 · 钱来钱往（叠着的页）'],
  [{ start: 'jump' }, 'P2-Wheel.dc.html', 'B3 · 柚子瓣'],
  [{ start: 'ask' }, 'P2-Ask.dc.html', 'B3 · 问柚子'],
  [{ start: 'search' }, 'P2-Search.dc.html', 'B3 · 找东西（小票）'],
  [{ start: 'year' }, 'P2-Year.dc.html', 'Atlas 初稿 · 年度小报'],
];
const out = B_BOARDS.map(([cfg, file, title]) => {
  resetUid();
  const year = cfg.start === 'year';
  const inner = buildB({
    year,
    pomeloHub: pomeloSvg(st, V, { size: 56, idp: 'ph', label: '柚子' }),
    pomeloBig: pomeloSvg(st, V, { size: 190, idp: 'pg', label: '柚子' }),
    pomeloBook: pomeloSvg(st, V, { size: 64, idp: 'pk', label: '柚子' }),
    pomeloCenter: pomeloSvg(st, V, { size: 58, idp: 'pc', label: '柚子' }),
    printerPomelo: `<svg width="40" height="40" viewBox="-6 -6 112 108" style="overflow:visible;transform:rotate(10deg)" aria-hidden="true"><use href="#pm-static"></use></svg>`,
    coverPomelo: pomeloSvg(st, V, { size: 170, idp: 'pv', label: '柚子', faces: ['wow'] }),
    signPomelo: pomeloSvg(st, V, { size: 80, idp: 'ps', label: '柚子', faces: ['happy'] }),
  });
  return board(file, title, { line: 'B', ...cfg }, inner, B_CSS, data(year ? { notes, noteBox, zine: zineData() } : { notes, noteBox }), LOGIC, year ? zineDefs() : '');
});

// 控件的小动静：单独一块画板，自己的交互脚本
resetUid();
out.push(board('P2-Controls.dc.html', '控件的小动静', { line: 'B', start: 'controls' }, buildControls(pomeloSvg(st, V, { size: 52, idp: 'ph', label: '柚子' })), CONTROLS_CSS, {}, readFileSync(path.join(HERE, 'controls.js'), 'utf8')));

// 迁移测试：单独一块画板，自己的交互脚本
resetUid();
out.push(board('P2-Migrate.dc.html', '迁移测试 · 没画过的三样', { line: 'B', start: 'migrate' }, buildMigrate(pomeloSvg(st, V, { size: 52, idp: 'ph', label: '柚子' })), MIGRATE_CSS, {}, readFileSync(path.join(HERE, 'migrate.js'), 'utf8'), migrateDefs()));

// ---------- 画布索引：只改这一页自己的东西，别的页、别的画板都不动 ----------
const PG = 'p2';
const BASE = process.env.CANVAS || path.join(PROJECT, 'canvas.json');
const canvas = existsSync(BASE)
  ? JSON.parse(readFileSync(BASE, 'utf8'))
  : { v: 3, createdOnFiles: { v: 1, at: '2026-11-05T05:13:44Z' }, title: 'Pomelo Explore', launch: { view: 'canvas' }, pages: [], boards: {}, order: [], notes: {}, designSystems: [] };
{ const pg = { id: PG, name: 'Phase 2 · 最终设计' }; const at = canvas.pages.findIndex((p) => p.id === PG); if (at >= 0) canvas.pages[at] = pg; else canvas.pages.unshift(pg); } // 原地换，别的页（2026-11-12 并进来的几页）位置不动
canvas.launch = { view: 'canvas', page: PG };
for (const [k, b] of Object.entries(canvas.boards)) if (b.page === PG) { delete canvas.boards[k]; canvas.order = canvas.order.filter((f) => f !== k); }
for (const [k, n] of Object.entries(canvas.notes)) if (n.page === PG) delete canvas.notes[k];

// 两排，每排 4 张：上排是外框，下排是由它长出来的东西和检验
const ROW2 = 1280;
out.forEach((b, i) => {
  canvas.boards[b.file] = { x: (i % 4) * 1360, y: i < 4 ? 0 : ROW2, w: 1280, h: 800, title: b.title, page: PG, is_interactive: true, radius: 12 };
  canvas.order.push(b.file);
});
canvas.notes.p2Top = { x: 0, y: -280, text: '外框：B3 桌面拼贴', kind: 'title1', maxW: 5360, page: PG };
canvas.notes.p2Row2 = { x: 0, y: ROW2 - 280, text: '由它长出来的：找东西、Atlas、控件、迁移测试', kind: 'title1', maxW: 5360, page: PG };
canvas.notes.p2How = { x: 5440, y: 0, w: 560, page: PG, fill: 'orange', text: '怎么看这一页\n点画板的 Play 就能玩。8 张是同一套设计，只是起始画面不同，右上角齿轮能换 5 套配色和深浅。\n\n· 桌面：便签能拖、能甩；撕起简报角上的柚子贴纸，底下有句悄悄话；连戳柚子 5 下它会晕，20 秒不动它睡着\n· 钱来钱往：表格多的模块页；开着的别的页叠在右边，点一下换上来\n· 柚子瓣：拖着能转，打字就找，打「柚子」它转一圈\n· 问柚子：画完再弹，眼睛跟着转，回答一个字一个字写出来\n· 找东西：小票边打字边打印，回车撕下来带你过去\n· Atlas：拆信封，小报按节拍自己翻，碰一下就停\n· 控件：12 种控件，每样碰一下都有回应\n· 迁移测试：12 个界面小图标、加载动画「穿针」、投石问路的空状态，只照规则做' };
canvas.notes.p2Rules = { x: 5440, y: ROW2, w: 560, page: PG, fill: 'teal', text: '验收看什么\n迁移测试那三样，放在其他画板旁边，认不认得出是同一家。\n\nPhase 2 时的规则全文在 project/pomelo-rules.md，一句话：一张摊开的桌面，上面是手账。纸可以歪，字永远是正的、清楚的；处处有小动静，动起来都像纸和贴纸。\n\n还不算定稿的：小样里补画的 5 个模块图标和暂分的五类，Phase 8 再定；Atlas 各幕是初稿，Phase 11 做全；音乐按钮只有样子，声音归 Pomelo v0.9。' };
{ const pageAt = (f) => canvas.pages.findIndex((p) => p.id === canvas.boards[f].page); canvas.order.sort((a, b) => pageAt(a) - pageAt(b)); }
writeFileSync(path.join(PROJECT, 'canvas.json'), JSON.stringify(canvas, null, 2) + '\n');
console.log('canvas.json', Object.keys(canvas.boards).length, 'boards');
