// Pomelo Explore 的「动效」一页（原 pomelo-motion 画布，2026-11-12 并进来）：给站主批的画板。每格是 schemes/pomelo/motion/ 一个零件的演示片段（和导出 GIF、bench 的 Motion Deck 同一份），
// 「再来一次」按零件的 capture.steps 重放；动效本身在挂上的 Design System 的 bundle.css 里（build:ds 从零件插进去，不另写）。
// 空状态那张板用 schemes/pomelo/marks/empty/ 的插图和 motion/empty-state。交互在 play.js。
// 用法：在仓库根目录 node canvases/pomelo-explore/motion/gen.mjs（改了零件先 npm run build:ds -- --scheme pomelo，再 dw ds install pomelo-explore pomelo）
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { rootImport, fromRoot } from '../../_lib/root.mjs';
import { PROJECT, writePage, dsBoard, esc } from '../page.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PG = 'motion';
const PREFIX = 'Motion-';
const { loadTokens } = await rootImport('tooling/lib/common.mjs');
const { partList, fragmentOf } = await rootImport('tooling/render/motion.mjs');
const art = await rootImport('schemes/pomelo/marks/art.mjs');
const PLAY_JS = readFileSync(path.join(HERE, 'play.js'), 'utf8');
const tokens = loadTokens('pomelo');
const PALETTES = Object.keys(tokens.color.palettes);
const PARTS = Object.fromEntries(partList('pomelo').map((p) => [p.id, p]));

/** 一格的说明：名字、一句话（零件标题「·」后面那半）、档位和时长。 */
function meta(id) {
  const s = PARTS[id].spec;
  let [name, desc = ''] = s.title.split(' · ');
  // 柚子的表情：名字写表情（「柚子 · 平常（呼吸、看一看、眨眼）」→ 平常 / 呼吸、看一看、眨眼）
  if (name === '柚子') { const m2 = /^([^（]+)(?:（(.+)）)?$/.exec(desc); name = m2[1]; desc = m2[2] ?? ''; }
  const secs = (ms) => `${+(ms / 1000).toFixed(2)} 秒`;
  const chip = s.loop ? `循环 · 一圈 ${secs(s.durationMs)}` : `${s.tier === 'calm' ? '小动静' : '招牌'} · ${secs(s.durationMs)}`;
  return { name, desc, chip, status: s.status };
}
/** 演示片段的大小：导出时的视口减去导出页的左上留白（24）。 */
function stageSize(id) {
  const [w, h] = PARTS[id].spec.capture.viewport ?? [240, 160];
  return [w - 24, h - 24];
}

const GAP = 22, PAD = 18, HEAD = 66, BW = 1280, M = 40;
/** 等宽的几列，每一格放进当前最矮的那一列（瀑布流）。 */
function placeAll(items, top, cols) {
  const cw = Math.floor((BW - M * 2 - GAP * (cols - 1)) / cols);
  const ys = Array(cols).fill(top);
  const out = items.map((make) => {
    const c = ys.indexOf(Math.min(...ys));
    const cell = make(cw);
    const pos = { ...cell, x: M + c * (cw + GAP), y: ys[c], w: cw };
    ys[c] += cell.h + GAP;
    return pos;
  });
  return { cells: out, bottom: Math.max(...ys) - GAP };
}

function partCell(id, k, seed) {
  const [sw, sh] = stageSize(id);
  const m = meta(id);
  const make = (cw) => {
    const h = sh + PAD + HEAD + 6;
    return {
      h,
      html: (x, y) => `<section class="cell" data-part="${id}" style="left:${x}px;top:${y}px;width:${cw}px;height:${h}px">
<div class="cardbg pm-card" data-hand="card" data-seed="${seed}" data-tilt="${[-0.5, 0.4, -0.3, 0.6, 0.3, -0.5][k % 6]}"></div>
<header class="chead"><div class="cline"><span class="cname">${esc(m.name)}</span><span class="chip">${m.chip}</span></div><div class="cdesc">${esc(m.desc)}</div></header>
<button type="button" class="again pm-btn pm-btn--plain" data-hand="button" data-fill="card" data-seed="${seed + 1}">再来一次</button>
<div class="stage" style="width:${Math.min(sw, cw - PAD * 2)}px;height:${sh}px">${fragmentOf('pomelo', PARTS[id].dir, PARTS[id].spec)}</div>
</section>`,
    };
  };
  make.id = id;
  return make;
}

const CSS = `
body{margin:0}
.root{position:relative;overflow:hidden;background:var(--color-desk);color:var(--color-ink)}
.bhead{position:absolute;left:${M}px;top:30px;right:${M}px}
.btitle{font-size:28px;font-weight:700;line-height:36px}
.bsub{font-size:14px;line-height:22px;color:var(--color-ink-soft)}
.cell{position:absolute}
.cardbg{position:absolute;inset:0;padding:0}
.chead{position:relative;height:${HEAD}px;padding:14px 112px 0 ${PAD}px}
.cline{display:flex;align-items:center;gap:8px}
.cname{font-size:17px;font-weight:700;line-height:24px;white-space:nowrap}
.cdesc{font-size:13px;line-height:20px;color:var(--color-ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{flex:none;height:22px;padding:0 9px;border-radius:var(--radius-tag);background:var(--color-yuzu-bg);font-size:12px;line-height:22px;white-space:nowrap}
.again{position:absolute;right:16px;top:14px;height:28px;padding:0 11px;font-size:13px}
.stage{position:relative;margin:0 ${PAD}px}
.empty-cell{cursor:pointer}
.empty-cell .stage{display:grid;place-items:center}
`;

function board(file, title, sub, cells, { cols = 3, extraCss = '' } = {}) {
  const { cells: placed, bottom } = placeAll(cells, 110, cols);
  const H = bottom + 44;
  const props = {
    palette: { editor: 'enum', options: PALETTES, default: PALETTES[0], section: '配色' },
    dark: { editor: 'boolean', default: false, section: '配色' },
    $preview: { width: BW, height: H },
  };
  // 放完东西就没了的（便签撕走、纸团丢掉、贴纸飞走、小票撕走）：停一会儿回到开头的样子
  const RESET = { toast: 3000, crumple: 2600, 'sticker-peel': 2200, 'receipt-print': 2600, 'pomelo-dizzy': 3200 };
  const parts = Object.fromEntries(cells.filter((c) => c.id).map((c) => [c.id, { html: fragmentOf('pomelo', PARTS[c.id].dir, PARTS[c.id].spec), steps: PARTS[c.id].spec.capture.steps ?? [], host: PARTS[c.id].spec.capture.host, reset: RESET[c.id] ?? 0 }]));
  const html = dsBoard({
    title, css: CSS + extraCss, props,
    body: `<div class="pm root" data-palette="{{palette}}" data-theme="{{theme}}" style="width:${BW}px;height:${H}px">
<div class="bhead"><div class="btitle">${title}</div><div class="bsub">${sub}</div></div>
${placed.map((c) => c.html(c.x, c.y)).join('\n')}
</div>`,
    script: `const CFG = ${JSON.stringify({ parts }).replace(/<\/script/gi, '<\\/script')};
${PLAY_JS}
class Component extends DCLogic {
  renderVals() { return { palette: this.props.palette ?? 'blue', theme: this.props.dark ? 'dark' : 'light' }; }
  componentDidMount() { this.stop = Pomelo.paintLive(document.body); PomeloPlay.start(CFG); }
  componentDidUpdate() { Pomelo.paint(document.body); }
  componentWillUnmount() { this.stop && this.stop(); }
}`,
  });
  writeFileSync(path.join(PROJECT, PREFIX + file), html);
  console.log(file, `${BW}×${H}`, (html.length / 1024).toFixed(0) + ' KB');
  return { file: PREFIX + file, title, h: H };
}

const cellsOf = (ids, seed0) => ids.map((id, k) => partCell(id, k, seed0 + k * 3));

// 空状态：8 张插图，一格一张，点一下再画一遍
function emptyCells() {
  return art.EMPTY_ORDER.map((key, k) => {
    const e = art.EMPTY[key];
    const svg = readFileSync(fromRoot(`schemes/pomelo/marks/empty/${key}.svg`), 'utf8').trim()
      .replace(/ width="[\d.]+" height="[\d.]+"/, ' width="256" height="150"').replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');
    const h = 278;
    return (w) => ({
      h,
      html: (x, y) => `<section class="cell empty-cell" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
<div class="cardbg pm-card" data-hand="card" data-seed="${1500 + k * 3}" data-tilt="${[-0.5, 0.4, -0.3, 0.6][k % 4]}"></div>
<header class="chead"><div><div class="cname">${esc(e.name)}</div><div class="cdesc">点一下再画一遍</div></div></header>
<div class="stage" style="width:${w - PAD * 2}px;height:${h - HEAD - PAD}px"><div class="pm-empty is-in">${svg}<p class="pm-empty-line">${esc(e.line)}</p></div></div>
</section>`,
    });
  });
}

const boards = [
  board('Controls.dc.html', '控件的小动静', '照 Phase 2 定稿：每样碰一下都有回应。能直接点、勾、拖；「再来一次」重放演示。', cellsOf(['press', 'switch', 'segmented', 'select', 'check', 'rating', 'field', 'toast', 'crumple', 'sort', 'tag', 'tooltip'], 1300), { cols: 3 }),
  board('Faces.dc.html', '柚子的表情', '平常、在想、困了一直循环；其余换到那张脸时放一次。', cellsOf(['pomelo-idle', 'pomelo-think', 'pomelo-sleepy', 'pomelo-wink', 'pomelo-happy', 'pomelo-error', 'pomelo-wow', 'pomelo-surprised'], 1340), { cols: 4 }),
  board('Moments.dc.html', '招牌时刻', '打开的问候、呼出柚子瓣、柚子在想和回答、全做完、空状态、拆信封、加载。', cellsOf(['greeting', 'wheel-open', 'wheel-spin', 'think-line', 'pomelo-answer', 'done-cheer', 'empty-state', 'atlas-envelope', 'loading-needle'], 1380), { cols: 2 }),
  board('Frame.dc.html', '外框的动静', '桌面和模块页上的：贴上、叠着的页、撕贴纸、贴纸簿、找东西的小票、翻小票。在外框原型里也都能玩。', cellsOf(['slap-in', 'page-stack', 'sticker-peel', 'book-open', 'receipt-print', 'receipt-flip'], 1420), { cols: 2 }),
  board('Eggs.dc.html', '小彩蛋', 'Phase 2 定稿里的五个：撕起简报的柚子贴纸有句悄悄话、连戳柚子 5 下会晕、打「柚子」柚子瓣转一圈、勾完待办撒小贴纸、20 秒不动睡着（鼠标一动吓一跳）。', cellsOf(['sticker-whisper', 'pomelo-dizzy', 'wheel-spin', 'done-cheer', 'pomelo-sleepy', 'pomelo-surprised'], 1460), { cols: 2 }),
  board('Worried.dc.html', '柚子 · 担心（第 9 张脸）', 'Pomelo 的心情「担心」：今日简报说有烦心事的那一小时，顶栏的柚子是这张。出错那张去掉红色「!」，比平常慢一点地呼吸、眼睛往下看。旁边是出错和平常，对比着看。', cellsOf(['pomelo-worried', 'pomelo-error', 'pomelo-idle'], 1500), { cols: 3 }),
  board('Empty.dc.html', '空状态', '插图一笔笔画出来，再一样样弹一下，配一句话。点一张再画一遍。', emptyCells(), { cols: 4 }),
];

// ---------- canvas.json（只动这一页） ----------
const placed = [];
let y = 0;
boards.forEach((b, i) => {
  placed.push({ file: b.file, x: (i % 2) * 1400, y, w: BW, h: b.h, title: b.title, is_interactive: true, radius: 12 });
  if (i % 2 === 1 || i === boards.length - 1) y += Math.max(b.h, i % 2 ? boards[i - 1].h : 0) + 120;
});
writePage({
  id: PG, name: 'R4：动效、空状态', prefix: PREFIX, boards: placed,
  notes: {
    how: { x: 0, y: -220, w: 820, fill: 'orange', text: '怎么看\n每格就是 schemes/pomelo/motion/ 的一个零件，和导出的 GIF、Pomelo 以后用的是同一份。「再来一次」重放；控件能直接点。\n要拖时间轴、一帧帧看、导 GIF：bench 的 Motion Deck http://127.0.0.1:4321/#/motion/pomelo\n外框里的样子：这块画布的「R1：外框（B3）」那一页，五张板都能玩。' },
  },
});
console.log(`pomelo-explore/motion：${boards.length} 张画板`);
