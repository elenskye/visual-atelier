// EX6、EX7 共用的零件：外框、图标、贴纸、小控件。仓库里的 token、工具、贴纸都只读地取（走 _lib/root.mjs）。
import { readFileSync } from 'node:fs';
import { rootImport, fromRoot } from '../../_lib/root.mjs';
import { dsBoard, esc } from '../page.mjs';

const { loadTokens } = await rootImport('tooling/lib/common.mjs');
const { makeCtx } = await rootImport('tooling/handmade/marks.mjs');
export const L = await rootImport('tooling/handmade/line.mjs');
const ICONS = await rootImport('schemes/pomelo/marks/icons.mjs');
export const tokens = loadTokens('pomelo');
const mctx = makeCtx(tokens);
export const PALETTES = Object.keys(tokens.color.palettes);
export const BASE_CSS = readFileSync(fromRoot('canvases/pomelo-explore/notes/notes.css'), 'utf8');
export { esc };

// ---------- 玩物有志的贴纸：三个方案（64 格，兴趣 · 樱粉，和 MODULE_ICONS 同一种写法）。站主 11-15 挑了 B，已搬进方案的 MODULE_ICONS.games；
// 这里留着三个的起稿，EX7 的贴纸板照旧三个并排（探索全留） ----------
const { P, rrect, rotate, circle, scale, move, f } = L;
const turn = (parts, deg, cx = 32, cy = 32) => parts.map((p) => ({ ...p, d: rotate(p.d, cx, cy, deg) }));
function star(cx, cy, r, k = 0.45) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * k : r;
    pts.push(`${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`);
  }
  return P('M' + pts.join(' L') + ' Z');
}
const sparkle = (x, y, r) => P(`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`);
const HEART = 'M32 50 C24 45 21 41 21 37.5 C21 34 24 32 26.8 32 C29 32 31 33.5 32 35.5 C33 33.5 35 32 37.2 32 C40 32 43 34 43 37.5 C43 41 40 45 32 50 Z';
const heartAt = (cx, cy, s = 1) => scale(move(P(HEART), cx - 32, cy - 41), s, cx, cy);

export const GAME_STICKERS = {
  // A 卡带：右上角切掉的一盒卡带，标签上一颗星，下面一排插脚
  'game-a': {
    name: '玩物有志 · A 卡带', cat: 'pink', parts: [
      ...turn([
        { t: 'shape', d: P('M15 7 L42 7 L51 16 L51 54 C51 56 49.5 57.5 47.5 57.5 L16.5 57.5 C14.5 57.5 13 56 13 54 L13 9 C13 7.9 13.9 7 15 7 Z'), fill: 'cat', seed: 611 },
        { t: 'line', d: P('M18.5 11.8 L38 11.8'), sw: 0.6, seed: 612 },
        { t: 'shape', d: rrect(18.5, 17.5, 27, 23, 3), fill: 'white', sw: 0.85, seed: 613 },
        { t: 'shape', d: star(32, 29.2, 7.2), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 614 },
        { t: 'shape', d: rrect(20, 46.5, 24, 6.5, 2), fill: 'catLight', sw: 0.7, seed: 615 },
        { t: 'line', d: P('M25 47.5 L25 52 M29.7 47.5 L29.7 52 M34.3 47.5 L34.3 52 M39 47.5 L39 52'), sw: 0.5, seed: 616 },
      ], -11),
      { t: 'shape', d: sparkle(55, 10, 5.4), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 617 },
    ],
  },
  // B 掌机：竖着的一台掌机，屏幕里一颗小心，十字键和两个圆钮
  'game-b': {
    name: '玩物有志 · B 掌机', cat: 'pink', parts: turn([
      { t: 'shape', d: P('M15.5 5 L48.5 5 C50.4 5 52 6.6 52 8.5 L52 49 C52 54.5 47.5 59 42 59 L15.5 59 C13.6 59 12 57.4 12 55.5 L12 8.5 C12 6.6 13.6 5 15.5 5 Z'), fill: 'cat', seed: 621 },
      { t: 'shape', d: rrect(17, 10, 30, 23.5, 3.5), fill: 'catLight', sw: 0.85, seed: 622 },
      { t: 'shape', d: rrect(21, 13.5, 22, 16.5, 2), fill: 'white', sw: 0.75, seed: 623 },
      { t: 'shape', d: heartAt(32, 22.6, 0.4), fill: 'heart', sw: 0.6, amp: 0.3, seed: 624 },
      { t: 'line', d: P('M17.5 45 L27 45 M22.25 40.3 L22.25 49.7'), sw: 1.15, seed: 625 },
      { t: 'shape', d: circle(40.5, 47, 3.2), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 626 },
      { t: 'shape', d: circle(46.5, 41.8, 3.2), fill: 'heart', sw: 0.7, amp: 0.35, seed: 627 },
      { t: 'line', d: P('M36.5 55.2 L40 52.4 M41.3 56.2 L44.8 53.4'), sw: 0.55, seed: 628 },
    ], 8),
  },
  // C 手柄：圆头的手柄，线绕一圈，尽头一颗闪光（和通用贴纸里的「游戏」长得不一样）
  'game-c': {
    name: '玩物有志 · C 手柄', cat: 'pink', parts: turn([
      { t: 'shape', d: P('M19 28 L45 28 C53 28 59 34 59 41 C59 48 54 53 47.5 53 C43.5 53 41 50.5 39 48 L25 48 C23 50.5 20.5 53 16.5 53 C10 53 5 48 5 41 C5 34 11 28 19 28 Z'), fill: 'cat', seed: 631 },
      { t: 'line', d: P('M12 40.5 L21 40.5 M16.5 36 L16.5 45'), sw: 1.1, seed: 632 },
      { t: 'shape', d: circle(44.5, 37.5, 3.1), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 633 },
      { t: 'shape', d: circle(50.5, 43, 3.1), fill: 'heart', sw: 0.7, amp: 0.35, seed: 634 },
      { t: 'line', d: P('M28.5 38.5 L30.5 38.5 M33.5 38.5 L35.5 38.5'), sw: 0.7, seed: 635 },
      { t: 'line', d: P('M32 28 C32 22 26.5 20.5 27.5 15 C28.5 10 35 10 36 14 C37 18 42 17.5 44.5 13.5'), sw: 0.75, seed: 636 },
      { t: 'shape', d: sparkle(49.5, 10, 5.6), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 637 },
    ], -6),
  },
};
export const GAME_PICK = ['game-a', 'game-b', 'game-c'];

// ---------- 每张画板里的图：图标和贴纸都只定义一次（<symbol>），各处 <use> ----------
let SYM = new Map();
let SEED = 1000;
export function resetBoard() { SYM = new Map(); SEED = 1000; }
export const seed = () => ++SEED;
const symbol = (id, vb, inner) => { if (!SYM.has(id)) SYM.set(id, { vb, inner }); return id; };
export const sprite = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${[...SYM].map(([id, s]) => `<symbol id="${id}" viewBox="${s.vb}">${s.inner}</symbol>`).join('')}</defs></svg>`;
const innerOf = (svg) => svg.trim().replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const vbOf = (svg) => /viewBox="([^"]+)"/.exec(svg)[1];

/** 界面小图标（24 格，跟着字的颜色）。 */
export function ic(name, size = 18) {
  if (!ICONS.UI_ICONS[name]) throw new Error(`没有图标 ${name}`);
  symbol(`i-${name}`, '0 0 24 24', innerOf(ICONS.uiIconSvg(name, tokens.handmade.uiIcon)));
  return `<span class="ico" aria-hidden="true"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><use href="#i-${name}" width="24" height="24"></use></svg></span>`;
}
/** 方案里生成好的贴纸、柚子（marks/ 下的路径，不带 .svg），或玩物有志的起稿（draft:<key>）。 */
export function art(file, w, { tilt = 0, cls = '', tint = null } = {}) {
  let svg;
  if (file.startsWith('draft:')) {
    const k = file.slice(6);
    svg = mctx.svg(GAME_STICKERS[k], { view: '-8 -8 80 80', size: 64, k: 1, idp: `pm-d-${k}-`, label: GAME_STICKERS[k].name, tint: true });
  } else svg = readFileSync(fromRoot(`schemes/pomelo/marks/${file}.svg`), 'utf8');
  const id = `s-${file.replace(/[^a-z0-9]+/gi, '-')}`;
  const vb = vbOf(svg);
  symbol(id, vb, innerOf(svg));
  const [, , vw, vh] = vb.split(' ').map(Number);
  const h = Math.round((w * vh) / vw);
  const vars = tint ? `--mark-color:var(--color-cat-${tint});--mark-color-soft:var(--color-cat-${tint}-sticker);` : '';
  return `<span class="mk ${cls}" style="display:inline-block;line-height:0;flex:none;${vars}${tilt ? `transform:rotate(${tilt}deg);` : ''}"><svg width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" style="display:block;overflow:visible" aria-hidden="true"><use href="#${id}" width="${vw}" height="${vh}"></use></svg></span>`;
}
/** 玩物有志的贴纸：三个方案都放进去，按 Tweaks 的「玩物有志的贴纸」显示一张。 */
export const gameMark = (size, o = {}) => GAME_PICK.map((k, i) => art(`draft:${k}`, size, { ...o, cls: `var var-${'abc'[i]} ${o.cls ?? ''}` })).join('');
/** 模块的贴纸（games 是上面三个方案）。 */
export const MOD_FILE = { notes: 'modules/notes', articles: 'modules/articles', books: 'modules/books', films: 'modules/films', todo: 'modules/todo', finance: 'modules/finance', drawing: 'modules/drawing', site: 'modules/site', canvas: 'modules/canvas' };
export const mod = (id, size, o = {}) => (id === 'games' ? gameMark(size, o) : art(MOD_FILE[id], size, o));
export const MOD_NAME = { notes: '念念不忘', articles: '见字如面', books: '摸鱼读读', films: '好奇看看', games: '玩物有志', todo: '一步一步', finance: '钱来钱往', drawing: '随意画画', site: '呦呦漫游', canvas: '有板有眼' };

export const tip = (t) => `<span class="pm-tip" role="tooltip"><span class="pm-tip-string"></span><span class="pm-tip-tag">${t}</span></span>`;
export function tapeStrip({ kind = 'mint', rot = -2 } = {}) {
  const n = 4, zz = [];
  for (let i = 0; i <= n * 2; i++) zz.push(`${i % 2 ? 6 : 0}px ${Math.round((i / (n * 2)) * 1000) / 10}%`);
  const right = zz.map((p) => { const [x, y] = p.split(' '); return `calc(100% - ${x}) ${y}`; }).reverse();
  const [a, b] = kind === 'mint' ? ['tape-mint-a', 'tape-mint-b'] : ['tape-yuzu-a', 'tape-yuzu-b'];
  return `<span aria-hidden="true" style="position:absolute;inset:0;transform:rotate(${rot}deg);opacity:.88;clip-path:polygon(${[...zz, ...right].join(',')});background:repeating-linear-gradient(45deg,var(--color-${a}) 0 7px,var(--color-${b}) 7px 14px)"></span>`;
}

// ---------- 外框：顶栏、桌面、叠着的页（照外框 B3） ----------
const TODAY = '11 月 15 日 · 周日';
export function bar(opens) {
  const lights = ['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => `<i style="left:${14 + i * 20}px;background:${c}"></i>`).join('');
  const ob = opens.map((id, i) => `<button type="button" class="ob pm-tip-host${i === 0 ? ' on' : ''}" aria-label="${MOD_NAME[id]}">${mod(id, 30)}<span class="ul" data-hand="underline" data-seed="${seed()}"></span>${tip(MOD_NAME[id])}</button>`).join('');
  return `<header class="bar">
<span class="lights" aria-hidden="true">${lights}</span>
<button type="button" class="hub pm-tip-host" aria-label="柚子瓣">${art('pomelo/pomelo-normal', 50, { tilt: -8 })}${tip('柚子瓣')}</button>
<button type="button" class="navb pm-tip-host" aria-label="后退" style="left:140px">${ic('chevron-left', 20)}${tip('后退')}</button>
<button type="button" class="navb" aria-label="前进" style="left:168px" disabled>${ic('chevron-right', 20)}</button>
<button type="button" class="tohome">${tapeStrip({ kind: 'mint', rot: -2 })}<span class="tl">${ic('back-desk', 17)}回桌面</span></button>
<div class="right">
  <span class="openlbl">桌上开着</span><span class="opens">${ob}</span>
  <button type="button" class="ib pm-tip-host" aria-label="新开一页">${ic('plus', 20)}${tip('新开一页')}</button>
  <span class="datechip" data-hand="frame" data-r="4" data-fill="card" data-tilt="1.5" data-sw="1.4" data-amp="0.5" data-seed="701"><span>${TODAY}</span></span>
  <button type="button" class="ib pm-tip-host" aria-label="找东西">${ic('search', 21)}${tip('找东西')}</button>
  <button type="button" class="ib pm-tip-host" aria-label="设置">${ic('settings', 21)}${tip('设置')}</button>
  <button type="button" class="ask pm-tip-host" aria-label="问柚子">${art('pomelo/ai-button', 36)}${tip('问柚子')}</button>
</div>
</header>`;
}
export const stacked = (ids) => ids.map((id, j) => `<div class="page st" style="--j:${j}" aria-hidden="true">
<section class="pm-sheet sheet" data-hand="sheet" data-seed="${910 + j * 3}" data-tilt="-0.3"><span></span></section>
<button type="button" class="peek pm-page-peek pm-tip-host" style="--j:${j}" aria-label="换到「${MOD_NAME[id]}」">${mod(id, 46)}${tip(MOD_NAME[id])}</button>
</div>`).join('');

/** 一张桌面：顶栏、叠着的页、最前面的纸（inner 是纸上的东西），over 是浮在最上面的东西。 */
export function desk({ opens, inner, tabs = '', over = '' }) {
  return `<div class="pm-desk" data-hand="desk" data-seed="700" style="position:absolute;inset:0"></div>
<div class="topband"></div>
${stacked(opens.slice(1, 3))}
<div class="page front" data-sub="0">
${tabs}
<section class="pm-sheet sheet" data-hand="sheet" data-seed="903" data-tilt="-0.3">
${inner}
</section>
<span class="slap">${mod(opens[0], 70, { tilt: -8 })}</span>
</div>
${over}
${bar(opens)}`;
}

// ---------- 小零件 ----------
export const hash = (t) => `<span class="hash">#${t}</span>`;
export const seg = (opts, on, cls = '') => `<div class="pm-seg ${cls}" data-hand="field" data-seed="${seed()}" role="group">${opts.map((t) => `<button type="button" class="pm-seg-item" aria-pressed="${t === on}"${t === on ? ` data-hand="pick" data-seed="${seed()}"` : ''}>${t}</button>`).join('')}</div>`;
export const dd = (label, cls = '') => `<button type="button" class="pm-field pm-select dd ${cls}" data-hand="field" data-seed="${seed()}" data-r="10" data-sw="1.5" data-amp="0.55" aria-haspopup="listbox"><span class="ddl">${label}</span>${ic('chevron-down', 15)}</button>`;
export const field = (value, { ph = '', cls = '', icon = '' } = {}) => `<label class="pm-field ${cls}" data-hand="field" data-seed="${seed()}">${icon ? `<span class="ico soft fic">${ic(icon, 16)}</span>` : ''}<input${value ? ` value="${esc(value)}"` : ''}${ph ? ` placeholder="${ph}"` : ''} aria-label="${ph || value}"></label>`;
export const btn = (t, { plain = false, icon = '', cls = '' } = {}) => `<button type="button" class="pm-btn ${plain ? 'pm-btn--plain' : ''} ${cls}" data-hand="button"${plain ? ' data-fill="card"' : ''} data-seed="${seed()}">${icon ? ic(icon, 15) : ''}${t}</button>`;
export function stars(n, size = 14) {
  return `<span class="pm-rating stars" role="img" aria-label="${n} 颗星">${[1, 2, 3, 4, 5].map((i) => `<span class="pm-rating-star${i <= n ? ' is-on' : ''}" style="width:${size + 4}px;height:${size + 4}px"><span data-hand="star" data-size="${size + 4}" data-seed="${1350 + i - 1}"></span></span>`).join('')}</span>`;
}
/** 链接：画成能点的标题（模块的小贴纸 + 标题），文章互链不带贴纸也行，这里统一带。 */
export const chip = (modId, t, { size = 16, cls = '' } = {}) => `<button type="button" class="lk ${cls}">${mod(modId, size)}<span class="lkt">${t}</span></button>`;

// ---------- 写一张画板 ----------
export function boardHtml({ title, w, h, css, body, dark, mark }) {
  const props = {
    palette: { editor: 'enum', options: PALETTES, default: 'blue', section: '配色' },
    dark: { editor: 'boolean', default: !!dark, section: '配色' },
    mark: { editor: 'enum', options: ['a', 'b', 'c'], default: mark ?? 'a', section: '贴纸', label: '玩物有志的贴纸（A 卡带 · B 掌机 · C 手柄）' },
    $preview: { width: w, height: h },
  };
  return dsBoard({
    title, props,
    css: `${BASE_CSS}\n.root{width:${w}px;height:${h}px}\n.page{height:${h - 88}px}\n${css}`,
    body: `<div class="pm root" data-palette="{{palette}}" data-theme="{{theme}}" data-mark="{{mark}}">
<div class="app" data-bar="always" ${body.attrs ?? ''}>
${sprite()}
${body.html}
</div>
</div>`,
    script: `class Component extends DCLogic {
  renderVals() {
    return { palette: this.props.palette ?? 'blue', theme: this.props.dark ?? ${dark ? 'true' : 'false'} ? 'dark' : 'light', mark: this.props.mark ?? '${mark ?? 'a'}' };
  }
  componentDidMount() { this.stop = Pomelo.paintLive(document.body); }
  componentDidUpdate() { Pomelo.paint(document.body); }
  componentWillUnmount() { this.stop && this.stop(); }
}`,
  });
}
