// Tabloid：画页用的小零件（手画线、填色、胶带、纸片、滚数字）。一页 460 × 600，印出来的纸：颜色用 print-*，
// 不跟配色走，深色模式下也是浅色的纸。字一律摆正，歪的只是纸、胶带和贴纸。
// 每页里要「跟着节拍出来」的东西加 class="b" 和 --b（第几拍，一拍 0.8 秒），页翻到时 runtime.mjs 给这一页加 .on。
import { P, handFill, handStroke, f } from '../../../../tooling/handmade/line.mjs';

export const PW = 460, PH = 600;
export const INK = 'var(--color-print-ink)', INK2 = 'var(--color-print-ink-soft)', LINE = 'var(--color-print-line)', RULE = 'var(--color-print-rule)';
// 这份设计自己的两种颜色：星图的夜色、复写纸的蓝
export const NIGHT = '#2A3158', NIGHT2 = '#3A4474', CARBON = '#5B6FA8', CARBON_BG = '#E6ECF8';
export const CATS = ['mint', 'sky', 'pink', 'orange', 'grape'];
export const cat = (c) => `var(--color-cat-${c})`;
export const soft = (c) => `var(--color-cat-${c}-sticker)`;
export const cmds = (d) => (typeof d === 'string' ? P(d) : d);
export const st = (d, seed, { c = LINE, sw = 1.8, amp = 0.5, sp = 1.2, keep = 2, dash = '', op = '' } = {}) =>
  `<path d="${handStroke(cmds(d), { amp, seed, sp, keep })}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}${op ? ` opacity="${op}"` : ''}></path>`;
export const fl = (d, seed, c, { amp = 0.4, op = '' } = {}) => `<path d="${handFill(cmds(d), { amp, seed })}" fill="${c}"${op ? ` opacity="${op}"` : ''}></path>`;
export const svg = (w, h, inner, style = '') => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none;${style}" aria-hidden="true">${inner}</svg>`;
export const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const b = (n, extra = '', style = '') => `class="b${extra ? ' ' + extra : ''}" style="--b:${n}${style ? ';' + style : ''}"`;
export const deg = (a) => (a * Math.PI) / 180;
export const pline = (pts) => P('M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' Z');
/** 写进页面的字：数据里来的都过一遍（记录是站主自己写的原文）。 */
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
/** 压成一行、最多 n 个字。 */
export const clip = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return [...t].length > n ? [...t].slice(0, n - 1).join('') + '…' : t; };
/** 印在页上的一句笔记：去掉开头的标签（#日记 #阅读/小记）和 Markdown 的记号（**粗**、==划==、行首的 # > -），只留字；
 *  点开的纸条里还是原文。去完什么都不剩（只有标签的笔记）就照原样。 */
export const plainNote = (s) => {
  const t = String(s ?? '');
  const out = t.replace(/^(\s*#[^\s#]+)+\s*/u, '').replace(/\*\*|__|~~|==|`/g, '').replace(/^\s*(#{1,6}|>|[-*+])\s+/gm, '').trim();
  return out || t;
};
/** 一个不大的整数，由字符串定（同一条记录每次画出来一样）。 */
export const hash = (s) => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.codePointAt(0), 16777619); return (h >>> 0) % 100000; };
/** '2026-03-14' → '3 月 14 日' */
export const md = (d) => `${Number(d.slice(5, 7))} 月 ${Number(d.slice(8, 10))} 日`;
export const ymd = (d) => `${d.slice(0, 4)} 年 ${md(d)}`;

/** 胶带：两种条纹（薄荷、柚黄），两头锯齿。 */
export function tape(x, y, w, rot, kind = 0) {
  const [a, c] = kind ? ['var(--color-tape-yuzu-a)', 'var(--color-tape-yuzu-b)'] : ['var(--color-tape-mint-a)', 'var(--color-tape-mint-b)'];
  const z = 'polygon(0 0,4% 25%,0 50%,4% 75%,0 100%,100% 100%,96% 75%,100% 50%,96% 25%,100% 0)';
  return `<span aria-hidden="true" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:20px;transform:rotate(${rot}deg);background:repeating-linear-gradient(45deg,${a} 0 7px,${c} 7px 14px);clip-path:${z};opacity:.92;z-index:3"></span>`;
}
/** 歪着的纸片（只歪底，字在外面是正的）。 */
export const slip = (rot, bg = '#FFFFFF', r = 4) => `<span aria-hidden="true" style="position:absolute;inset:0;border-radius:${r}px;background:${bg};box-shadow:0 1px 2px rgba(0,0,0,.18),2px 8px 14px rgba(0,0,0,.08);transform:rotate(${rot}deg)"></span>`;

export function starPath(r, k = 0.56, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n, rr = i % 2 ? r * k : r; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' Z';
}
/** 这份设计自己的小图形：纸星星、金星、粉星（柚子挑的触动的那天，1.0.2）、四角的小闪光、十字绣的一针。 */
export function atlasDefs() {
  const gold = P(starPath(9.4, 0.58));
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="zstar" viewBox="-10 -10 20 20" overflow="visible"><path d="${handFill(P(starPath(9.4, 0.6)), { amp: 0.25, seed: 1201 })}" fill="currentColor"></path></symbol>
<symbol id="zgold" viewBox="-10 -10 20 20" overflow="visible"><path d="${handFill(gold, { amp: 0.25, seed: 1202 })}" fill="var(--color-yuzu)" transform="translate(.6 .8)"></path><path d="${handStroke(gold, { amp: 0.3, seed: 1203, sp: 0.6 })}" fill="none" stroke="var(--color-print-line)" stroke-width="1.5" stroke-linejoin="round"></path></symbol>
<symbol id="zpink" viewBox="-10 -10 20 20" overflow="visible"><path d="${handFill(gold, { amp: 0.25, seed: 1206 })}" fill="var(--color-cat-pink)" transform="translate(.6 .8)"></path><path d="${handStroke(gold, { amp: 0.3, seed: 1207, sp: 0.6 })}" fill="none" stroke="var(--color-print-line)" stroke-width="1.5" stroke-linejoin="round"></path></symbol>
<symbol id="zspark" viewBox="-10 -10 20 20" overflow="visible"><path d="${handFill(P(starPath(9.6, 0.3, 4)), { amp: 0.2, seed: 1205 })}" fill="currentColor"></path></symbol>
<symbol id="zx" viewBox="-5 -5 10 10" overflow="visible"><path d="${handStroke(P('M-3.2 -3.2 L3.2 3.2 M3.2 -3.2 L-3.2 3.2'), { amp: 0.18, seed: 1204, sp: 0.5, keep: 2 })}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"></path></symbol>
</defs></svg>`;
}

/** 滚出来的数字（里程表）：每一位是一条竖着的 0–9，滚到这一位停下，个位多滚两圈、十位一圈。h 是行高。
 *  这一页翻到了才滚（第 bb 拍）；摊开看和减弱动态效果时直接是最后的数（style.mjs 的 .odo）。 */
export function roll(text, bb, h) {
  let p = [...text].filter((c) => /\d/.test(c)).length;
  return `<span class="odo num" data-nolint style="--b:${bb};--h:${h}px">${[...text].map((c) => {
    if (!/\d/.test(c)) return `<span>${c}</span>`;
    p -= 1;
    const turns = p === 0 ? 2 : p === 1 ? 1 : 0, d = Number(c);
    const strip = Array.from({ length: turns * 10 + d + 1 }, (_, i) => `<i>${i % 10}</i>`).join('');
    return `<span class="rd"><span class="rs" style="--y:-${(turns * 10 + d) * h}px;animation-duration:${f(1 + turns * 0.25)}s">${strip}</span></span>`;
  }).join('')}</span>`;
}

/** 一页。scene：哪一幕；页码由 runtime.mjs 填。 */
export const page = (scene, inner, { bg = 'var(--color-print-paper)', cls = '' } = {}) =>
  `<section class="zp ${cls}" data-scene="${scene}" data-theme="light" style="background:${bg}">${inner}<span class="zno num" aria-hidden="true"></span></section>`;
export const head = (t, sub = '') => `<div style="position:absolute;left:34px;top:30px;right:34px"><div style="font-size:22px;font-weight:700;line-height:30px">${t}</div>${sub ? `<div style="font-size:13px;line-height:20px;color:${INK2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sub}</div>` : ''}</div>`;
/** 柚子的话（这一幕模型写的那一两句）：最多三行。 */
export const say = (y, lines, bb) => {
  const text = clip((lines || []).join(''), 76);
  return text ? `<div ${b(bb)}><div style="position:absolute;left:34px;right:34px;top:${y}px;display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:22px"><span style="flex:none;width:6px;height:6px;margin-top:8px;border-radius:50%;background:var(--color-yuzu)"></span><span>${esc(text)}</span></div></div>` : '';
};
export const recBtn = (id, style, inner, label) => `<button type="button" class="zrec pm-press" data-rec="${esc(id)}" aria-label="${esc(label)}" style="position:absolute;${style}">${inner}</button>`;
export const useStar = (id, x, y, size, extra = '') => `<svg width="${size}" height="${size}" viewBox="-10 -10 20 20" style="position:absolute;left:${x}px;top:${y}px;${extra}" aria-hidden="true"><use href="#${id}" x="-10" y="-10" width="20" height="20"></use></svg>`;
