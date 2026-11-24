// 手作零件的组件形状，和在页面上照 data-hand 把它们画出来的办法。
//   形状（纯函数，Node 和浏览器都能用，返回 SVG 字符串）：勾选框、评分星星、纸星星、开关、界面小图标、贴纸。
//   paint(root, opts)：只在浏览器里用。找 root 里带 data-hand 的元素，按它的宽高画手画的框、线、笔迹、胶带、缝线和上面这些形状。
// 几何取自 Pomelo 的 Phase 2 小样（站主 2026-11-05 验收：canvases/pomelo-explore/p2-final/ 的 parts.mjs、controls.mjs、zine.mjs）。
// 数值由调用方按方案的 tokens/handmade.json 传（params）；颜色由调用方给「角色 → CSS 值」的函数（color）和认得的角色（roles）。
// 画出来的东西都放在绝对定位的一层里（带 data-hand-painted），不改元素自己的大小；同一个宽高、同一个种子永远画出同一条线。
// Design System 的 components/bundle.js 由 tooling/design-system/bundle.mjs 把 line.mjs、frame.mjs、sticker.mjs 和本文件原样打包。
import { P, circle, rrect, handStroke, handFill, f } from './line.mjs';
import { wob, hline, marker, strike, tapes, stitches } from './frame.mjs';
import { render } from './sticker.mjs';

const roleVar = (role) => `var(--color-${role})`;

// ---------- 形状 ----------

// 勾选框：线描贴纸，勾上时柚黄填色和勾才显示（由样式按 aria-checked 或 .is-on 决定）
const TICK = P('M6.4 12.6 L10.4 16.6 L17.6 7.4');
export function checkboxSvg({ seed = 1, size = 22, c = roleVar } = {}) {
  const box = rrect(4, 4, 16, 16, 4.5);
  return `<svg class="pm-ck" width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;overflow:visible" aria-hidden="true"><g class="pm-ck-box"><path d="${handFill(box, { amp: 0.3, seed })}" fill="${c('art-white')}" stroke="${c('art-white')}" stroke-width="3"></path><g class="pm-ck-fill"><path d="${handFill(box, { amp: 0.3, seed: seed + 3 })}" fill="${c('yuzu')}" transform="translate(.8 1.1)"></path></g><path d="${handStroke(box, { amp: 0.38, seed, wave: 7 })}" fill="none" stroke="${c('pen')}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"></path><path class="pm-ck-tick" pathLength="1" d="${handStroke(TICK, { amp: 0.3, seed: seed + 1 })}" stroke="${c('art-ink')}" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>`;
}

// 评分的星星：柚黄填色错开一点，笔色描边；没选中时填色淡到 .12（样式决定）
const RATE_STAR = (() => {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 4.6 : 10.5;
    pts.push(`${f(12 + r * Math.cos(a))} ${f(12.5 + r * Math.sin(a))}`);
  }
  return P('M' + pts.join(' L') + ' Z');
})();
export function ratingStarSvg({ seed = 1, size = 30, c = roleVar } = {}) {
  return `<svg class="pm-star" width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;overflow:visible" aria-hidden="true"><path class="pm-star-fill" d="${handFill(RATE_STAR, { amp: 0.25, seed })}" fill="${c('yuzu')}" transform="translate(.6 .8)"></path><path d="${handStroke(RATE_STAR, { amp: 0.3, seed: seed + 10, wave: 6 })}" fill="none" stroke="${c('pen')}" stroke-width="1.6" stroke-linejoin="round"></path></svg>`;
}

// 纸星星（幸运星）：鼓鼓的五角星，填分类色的贴纸色；金星是柚黄、描墨线
function puffyStar(r, k) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * k : r;
    pts.push(`${f(Math.cos(a) * rr)} ${f(Math.sin(a) * rr)}`);
  }
  return P('M' + pts.join(' L') + ' Z');
}
export function paperStarSvg({ seed = 1, size = 20, gold = false, fill = null, stroke = null, c = roleVar } = {}) {
  const head = `<svg class="pm-pstar" width="${size}" height="${size}" viewBox="-10 -10 20 20" style="display:block;overflow:visible" aria-hidden="true">`;
  if (gold) {
    const g = puffyStar(9.4, 0.58);
    return `${head}<path d="${handFill(g, { amp: 0.25, seed })}" fill="${c('yuzu')}" transform="translate(.6 .8)"></path><path d="${handStroke(g, { amp: 0.3, seed: seed + 1, sp: 0.6 })}" fill="none" stroke="${stroke ?? c('art-ink')}" stroke-width="1.5" stroke-linejoin="round"></path><path d="M-2.6 -4.2 L-0.7 -6.6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"></path></svg>`;
  }
  return `${head}<path d="${handFill(puffyStar(9.4, 0.6), { amp: 0.25, seed })}" fill="${fill ?? 'currentColor'}" stroke="rgba(0,0,0,.22)" stroke-width=".9" stroke-linejoin="round"></path><path d="M-2.5 -4 L-0.6 -6.4" stroke="rgba(255,255,255,.75)" stroke-width="1.4" stroke-linecap="round"></path></svg>`;
}

// 开关：54 × 30 的手画轨道，荧光笔涂满表示开；圆贴纸的钮（开的时候往右移 24，由样式决定）
export function switchSvg({ seed = 1, c = roleVar } = {}) {
  const fill = handStroke(P('M13 15 L41 15'), { amp: 0.6, seed, sp: 1 });
  return `<svg width="54" height="30" style="position:absolute;left:0;top:0;overflow:visible" aria-hidden="true"><path class="pm-sw-fill" pathLength="1" d="${fill}" stroke="${c('marker')}" stroke-width="20" stroke-linecap="round" fill="none"></path></svg>${wob(54, 30, { r: 15, amp: 0.5, sw: 1.6, seed: seed + 5, pad: 4, color: c('pen') })}<span class="pm-sw-knob" style="position:absolute;left:3px;top:3px;width:24px;height:24px;display:block"><svg width="24" height="24" style="display:block;overflow:visible" aria-hidden="true"><path d="${handFill(circle(12, 12, 11), { amp: 0.3, seed: seed + 10 })}" fill="${c('art-white')}" style="filter:drop-shadow(0 1px 1px ${c('shadow')})"></path><path d="${handStroke(circle(12, 12, 9.5), { amp: 0.4, seed: seed + 15, over: 0.05 })}" fill="none" stroke="${c('pen')}" stroke-width="1.6"></path></svg></span>`;
}

// 界面小图标：24 格一笔单线，跟着文字颜色（currentColor），没有填色和白边。
// d 只认绝对的 M L C Q Z；圆写成 o：[[cx, cy, r], …]；圆角方块写成 rect：[[x, y, w, h, r], …]；实心小点写成 dots：[[cx, cy, r], …]。
export function glyphSvg({ d = '', o = [], rect = [], dots = [], seed = 1, size = 20, ic } = {}) {
  const sw = { amp: ic.amp, wave: ic.wave, sp: ic.sp, keep: ic.keep };
  let path = d ? handStroke(P(d), { ...sw, seed }) : '';
  o.forEach(([cx, cy, r], i) => { path += handStroke(circle(cx, cy, r), { ...sw, seed: seed + 1 + i, over: ic.over }); });
  rect.forEach(([x, y, w, h, r], i) => { path += handStroke(rrect(x, y, w, h, r), { ...sw, seed: seed + 11 + i, over: ic.over }); });
  const dot = dots.map(([cx, cy, r], i) => handFill(circle(cx, cy, r), { amp: 0.1, seed: seed + 21 + i })).join('');
  return `<svg class="pm-glyph" width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;overflow:visible" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="${ic.line}" stroke-linecap="round" stroke-linejoin="round"></path>${dot ? `<path d="${dot}" fill="currentColor"></path>` : ''}</svg>`;
}

// 贴纸：sticker.mjs 的画法包一层 SVG。art 是 { cat, parts: [...] }（见 sticker.mjs）；st 是 tokens/handmade.json 的 sticker。
export function stickerSvg(art, st, col, { size = 64, idp = 'pm', over = {} } = {}) {
  const { defs, html } = render(art, st, col, { k: 1, idp, over });
  return `<svg class="pm-sticker" width="${size}" height="${size}" viewBox="-8 -8 80 80" style="display:block;overflow:visible" aria-hidden="true">${defs ? `<defs>${defs}</defs>` : ''}${html}</svg>`;
}

// 贴纸的画法样张用的图形：一颗纸星星（只为看画法，不是方案的资产）
export const STICKER_STAR = { cat: 'orange', parts: [{ t: 'shape', d: P('M32 8 L39 24 L56 26 L43 38 L47 55 L32 46 L17 55 L21 38 L8 26 L25 24 Z'), fill: 'cat', seed: 11 }] };

// ---------- 在页面上画 ----------

const num = (v, d) => (v === undefined || v === null || v === '' ? d : Number(v));
const LAYER = 'position:absolute;inset:0;pointer-events:none';

// 纸纹：一层平铺的分形噪声。那一小块由 texture.mjs 照 tokens/handmade.json 的 texture 算好，样式里当背景（bundle.css 的 .pm-tex），
// 浓淡由样式按明暗选 --pm-tex-light / --pm-tex-dark。不用实时的 feTurbulence 滤镜：WebKit 里它是 CPU 逐像素算的，纸一多就卡。
// 纸纹不是抖动：线条的抖动一律算进路径。
export function textureSvg(t) {
  return `<span class="pm-tex" style="position:absolute;inset:0;border-radius:inherit;background-size:${t.tile}px ${t.tile}px;--pm-tex-light:${t.opacity.light};--pm-tex-dark:${t.opacity.dark}" aria-hidden="true"></span>`;
}

/**
 * 画 root 里（含 root 自己）所有带 data-hand 的元素。opts：
 *   params  tokens/handmade.json 的内容（必填）
 *   presets 框的预设：{ 名字: { r, amp, sw, pad, fill, stroke, tapes, stitches, tex } }。data-hand 写预设名就按它画框，
 *           元素上的 data-* 还能逐项改；r 写 "half" 是短边的一半（圆的按钮）
 *   color   角色 → CSS 值，默认 var(--color-<角色>)
 *   roles   认得的角色名；data-fill、data-stroke 写角色名时换成 color(角色)，别的值（#fff、var(--x)）原样用
 *   force   宽高没变也重画
 * 返回画了几个。
 */
export function paint(root, opts = {}) {
  const ctx = makeCtx(opts);
  const hosts = [];
  if (root.matches && root.matches('[data-hand]')) hosts.push(root);
  hosts.push(...root.querySelectorAll('[data-hand]'));
  // 先定好固定大小的形状（勾选框、星星、图标……）的宽高，套着它们的元素（荧光笔）量到的才是对的
  hosts.forEach(presize);
  let n = 0;
  hosts.forEach((el, i) => { if (paintOne(el, i + 1, ctx)) n++; });
  return n;
}

const FIXED = { check: 22, star: 30, pstar: 20, icon: 20, sticker: 64 };
function presize(el) {
  const kind = el.dataset.hand;
  if (kind === 'switch') { el.style.width = '54px'; el.style.height = '30px'; return; }
  if (FIXED[kind] === undefined) return;
  const size = num(el.dataset.size, FIXED[kind]);
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
}

function makeCtx({ params, presets = {}, color = roleVar, roles = null, force = false } = {}) {
  if (!params) throw new Error('paint：缺少 params（tokens/handmade.json）');
  const known = roles ? new Set(roles) : null;
  const val = (v, fallback) => {
    if (v === undefined || v === null || v === '') return fallback === null ? null : color(fallback);
    return known && known.has(v) ? color(v) : v;
  };
  return { params, presets, c: color, val, force };
}

// 一个元素的签名：宽高加上所有 data-* 选项；没变就不重画
function signature(el, w, h) {
  const keys = Object.keys(el.dataset).filter((k) => k !== 'handSig').sort();
  return `${w}x${h}|${keys.map((k) => `${k}=${el.dataset[k]}`).join('|')}`;
}

function ensureHost(el) {
  if (typeof getComputedStyle === 'function' && getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.style.isolation = 'isolate';
}

function paintOne(el, idx, ctx) {
  const kind = el.dataset.hand;
  const d = el.dataset;
  const seed = num(d.seed, idx);
  const { params: pm, c, val } = ctx;
  const fixed = FIXED[kind] === undefined ? undefined : num(d.size, FIXED[kind]);
  presize(el);
  // 行内元素（荧光笔、划掉）按行内盒子量，只适合一行字
  const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
  const sig = signature(el, w, h);
  if (!ctx.force && el.dataset.handSig === sig) return false;
  for (const old of [...el.children].filter((x) => x.hasAttribute('data-hand-painted'))) old.remove();
  ensureHost(el);

  let inner = '';
  let layerStyle = LAYER;
  let z = '';
  const fr = pm.frame;
  const preset = kind === 'frame' ? {} : ctx.presets[kind];
  if (preset) {
    // 手画的圆角框：纸、卡片、按钮、输入框。填色（fill）是手剪的边；底色、投影写在样式里时只画边。
    // 这一层整个放在内容下面（z-index -1），歪（tilt）的只是这一层：字永远是正的。
    const o = (k) => (d[k] !== undefined ? d[k] : preset[k]);
    const r = o('r') === 'half' ? Math.min(w, h) / 2 : num(o('r'), 14);
    const stroke = o('stroke');
    const tilt = num(o('tilt'), 0);
    if (o('tex') !== undefined && o('tex') !== false && o('tex') !== 'false') inner += textureSvg(pm.texture);
    inner += wob(w, h, {
      r, amp: num(o('amp'), fr.amp), sw: num(o('sw'), fr.lineWidth[1]), seed,
      fill: o('fill') ? val(o('fill'), null) : null, color: val(stroke === 'none' ? '' : stroke, 'pen'), pad: num(o('pad'), 8), stroke: stroke !== 'none',
      open: o('open') || null,
    });
    if (o('stitches') !== undefined && o('stitches') !== false) inner += stitches(h, { gap: pm.stitch.gap, len: pm.stitch.len, seed: seed + 1, color: val(o('stitches') === true ? '' : o('stitches'), 'pen'), opacity: pm.stitch.opacity });
    if (o('tapes')) {
      const colors = pm.tape.kinds.map((pair) => pair.map((role) => c(role)));
      const n = o('tapes') === 'rand' ? 'rand' : Math.min(pm.tape.maxPerCard, num(o('tapes'), 1));
      inner += tapes(w, h, seed, n, colors);
    }
    z = 'z-index:-1;';
    // 聚焦时手画的边描粗到多少（输入框），交给样式用
    layerStyle += `;--pm-sw-focus:${fr.focusLineWidth}px`;
    if (tilt) layerStyle += `;transform:rotate(${tilt}deg)`;
  } else if (kind === 'rule') {
    // 手画的横线（分割），铺满元素的宽，画在中间
    inner = hline(w, { seed, sw: num(d.sw, pm.rule.lineWidth), amp: num(d.amp, pm.rule.amp), color: val(d.stroke, 'pen'), y: Math.max(1, Math.round(h / 2)) });
  } else if (kind === 'underline') {
    inner = hline(w + 4, { seed, sw: num(d.sw, pm.rule.lineWidth), amp: num(d.amp, pm.rule.amp), color: val(d.stroke, 'pen'), style: 'position:absolute;left:-2px;bottom:-6px' });
    layerStyle = 'position:absolute;left:0;right:0;bottom:0;height:0;pointer-events:none;overflow:visible';
  } else if (kind === 'marker') {
    // 荧光笔划过：在字下面
    inner = marker(w + 8, { seed, sw: num(d.sw, pm.marker.lineWidth), opacity: num(d.opacity, pm.marker.opacity), color: val(d.stroke, 'marker') });
    z = 'z-index:-1;';
  } else if (kind === 'strike') {
    inner = strike(w, { seed, sw: num(d.sw, pm.strike.lineWidth), color: val(d.stroke, 'ink-soft') });
  } else if (kind === 'stitches') {
    inner = stitches(h, { gap: pm.stitch.gap, len: pm.stitch.len, seed, color: val(d.stroke, 'pen'), opacity: pm.stitch.opacity });
  } else if (kind === 'check') {
    inner = checkboxSvg({ seed, size: fixed, c });
  } else if (kind === 'star') {
    inner = ratingStarSvg({ seed, size: fixed, c });
  } else if (kind === 'pstar') {
    inner = paperStarSvg({ seed, size: fixed, gold: d.gold !== undefined, fill: d.fill ? val(d.fill, null) : null, stroke: d.stroke ? val(d.stroke, null) : null, c });
  } else if (kind === 'switch') {
    inner = switchSvg({ seed, c });
  } else if (kind === 'icon') {
    const list = (s, n) => (s ? s.split(',').map((x) => x.trim().split(/\s+/).map(Number)).filter((a) => a.length === n) : []);
    inner = glyphSvg({ d: d.d || '', o: list(d.o, 3), rect: list(d.rect, 5), dots: list(d.dots, 3), seed, size: fixed, ic: pm.uiIcon });
  } else if (kind === 'sticker') {
    const st = pm.sticker;
    const stage = d.stage || 'full';
    const over = { line: { outline: true, off: [0, 0], border: 0, shadow: false }, fill: { border: 0, shadow: false }, white: { shadow: false }, full: {} }[stage] ?? {};
    const art = { ...STICKER_STAR, cat: d.cat || STICKER_STAR.cat };
    const col = { ink: c('art-ink'), white: c('art-white'), shadow: c('art-shadow'), blush: c('blush'), cats: { mint: c('cat-mint'), sky: c('cat-sky'), pink: c('cat-pink'), orange: c('cat-orange'), grape: c('cat-grape') } };
    const html = stickerSvg(art, st, col, { size: fixed, idp: `pm${seed}x`, over });
    inner = stage === 'line' ? html.replace(/<path class="fl"[^>]*><\/path>/g, '') : html;
    const tilt = num(d.tilt, 0);
    if (tilt) layerStyle += `;transform:rotate(${tilt}deg)`;
  } else {
    return false;
  }
  el.insertAdjacentHTML('afterbegin', `<span data-hand-painted="${kind}" aria-hidden="true" style="${z}${layerStyle}">${inner}</span>`);
  el.dataset.handSig = signature(el, w, h);
  return true;
}

/**
 * 画一次，再在字体加载完、元素宽高变了的时候补画（只在浏览器里用）。返回停止观察的函数。
 */
export function paintLive(root, opts = {}) {
  const run = () => paint(root, opts);
  run();
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  if (typeof ResizeObserver === 'undefined') return () => {};
  let queued = false;
  const ro = new ResizeObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; run(); });
  });
  const hosts = [];
  if (root.matches && root.matches('[data-hand]')) hosts.push(root);
  hosts.push(...root.querySelectorAll('[data-hand]'));
  hosts.forEach((el) => ro.observe(el));
  return () => ro.disconnect();
}
