// Pomelo 的图形源：柚子（8 个表情）、模块贴纸、菜单栏的小柚子、AI 按钮、App 图标、空状态插图。
// 这里只有几何和构图；画法（手画墨线、错开的填色、白边）在 tooling/handmade/，数值在 ../tokens/handmade.json。
// tooling/handmade/marks.mjs 调 assets(ctx) 写出 marks/ 下的 SVG 并更新 manifest.json；同一份源永远得到同一份文件。
// 柚子和最早 6 个模块贴纸的几何取自 Phase 2 小样（canvases/pomelo-explore/p2-final/art.mjs，站主 2026-11-05 验收）；
// 模块的分类色站主 2026-11-07 定：跟模块坞的分类走（日常薄荷、兴趣樱粉、求职葡萄紫、柚子橙、工具天蓝；兴趣和工具批的时候互换过）。
import { P, ellipse, circle, rrect, rotate, move, scale, handStroke, handFill, cmdsToD, f } from '../../../tooling/handmade/line.mjs';
import { UI_ICONS, UI_ICON_ORDER, uiIconSvg } from './icons.mjs';

// ---------- 模块贴纸（64 格，视口 -8 -8 80 80） ----------
// 每部分：shape 图形（fill 是 cat / catLight / 颜色名）、line 线、dot 实心小点；sw 线宽倍数、amp 抖动倍数、seed 种子。
function foot(cx, cy, rot, seed) {
  const s = 1.2;
  const parts = [{ t: 'shape', d: ellipse(cx, cy, 6 * s, 9.6 * s, rot), fill: 'cat', seed }];
  [[-4.4, -13.4, 2.3], [-1, -15.4, 2.1], [2.4, -14.8, 1.9], [5.2, -12.4, 1.6]].forEach(([dx, dy, r], i) =>
    parts.push({ t: 'shape', d: rotate(circle(cx + dx * s, cy + dy * s, r * s), cx, cy, rot), fill: 'cat', sw: 0.75, amp: 0.4, seed: seed + i + 1 }));
  return parts;
}
function star(cx, cy, r, k = 0.45) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * k : r;
    pts.push(`${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`);
  }
  return P('M' + pts.join(' L') + ' Z');
}
function sparkle(x, y, r) {
  return P(`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`);
}
const turn = (parts, deg, cx = 32, cy = 32) => parts.map((p) => ({ ...p, d: rotate(p.d, cx, cy, deg) }));
/** 心形：来日方长那颗心（宽 22、高 18，中心 32, 41）挪到 (cx, cy)、放大 s 倍。 */
const HEART = 'M32 50 C24 45 21 41 21 37.5 C21 34 24 32 26.8 32 C29 32 31 33.5 32 35.5 C33 33.5 35 32 37.2 32 C40 32 43 34 43 37.5 C43 41 40 45 32 50 Z';
const heartAt = (cx, cy, s = 1) => scale(move(P(HEART), cx - 32, cy - 41), s, cx, cy);
/** 五瓣花：花瓣尖在半径 r，瓣间凹到 r0。 */
function flower(cx, cy, r, r0, n = 5, rot = -90) {
  const pt = (deg, rr) => { const a = (deg * Math.PI) / 180; return `${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`; };
  const step = 360 / n;
  let d = `M${pt(rot - step / 2, r0)}`;
  for (let i = 0; i < n; i++) {
    const a = rot + i * step;
    d += ` C${pt(a - step * 0.42, r * 1.18)} ${pt(a + step * 0.42, r * 1.18)} ${pt(a + step / 2, r0)}`;
  }
  return P(d + ' Z');
}

export const MODULE_ICONS = {
  // ---- 日常 · 薄荷 ----
  todo: { name: '一步一步', cat: 'mint', parts: [...foot(19, 45, -16, 10), ...foot(44, 25, 12, 20)] },
  notes: {
    name: '念念不忘', cat: 'mint', parts: [
      { t: 'shape', d: P('M53 8 C41 9 23 22 18 44 L20 49 C37 47 52 31 53 8 Z'), fill: 'cat', seed: 51 },
      { t: 'line', d: P('M53 8 C43 21 31 35 11 57'), sw: 0.9, seed: 52 },
      { t: 'line', d: P('M30 31 L24 27 M38 23 L33 18'), sw: 0.7, seed: 53 },
      { t: 'dot', d: ellipse(10, 58.5, 2.6, 2), seed: 54 },
    ],
  },
  // 见字如面：纸飞机，一封信飞出去，后面拖着一圈虚线（v1.0 Phase 1 三个方案里的 B，站主 2026-11-13 挑的）
  articles: {
    name: '见字如面', cat: 'mint', parts: [
      { t: 'shape', d: P('M59 6 L6 25 L25 33 Z'), fill: 'white', seed: 841 },
      { t: 'shape', d: P('M59 6 L25 33 L31 51 Z'), fill: 'cat', seed: 842 },
      { t: 'shape', d: P('M25 33 L32 40 L31 51 Z'), fill: 'catLight', sw: 0.85, seed: 843 },
      { t: 'line', d: P('M59 6 L25 33'), sw: 0.7, seed: 844 },
      { t: 'line', d: P('M20 38 C16 40.5 13 43 11.5 45.5'), sw: 0.65, seed: 845 },
      { t: 'line', d: P('M9.5 50 C9.2 54 11.5 57 15 57'), sw: 0.65, seed: 846 },
      { t: 'line', d: P('M19.5 55.5 C21.5 53.5 21.6 50.6 19.5 49'), sw: 0.65, seed: 847 },
      { t: 'shape', d: P('M44 58 C40.5 55.5 39 53.8 39 51.8 C39 50.2 40.2 49 41.7 49 C42.7 49 43.5 49.6 44 50.4 C44.5 49.6 45.3 49 46.3 49 C47.8 49 49 50.2 49 51.8 C49 53.8 47.5 55.5 44 58 Z'), fill: 'heart', sw: 0.75, amp: 0.3, seed: 848 },
    ],
  },
  days: {
    name: '来日方长', cat: 'mint', parts: [
      { t: 'shape', d: rrect(9, 14, 46, 42, 8), fill: 'catLight', seed: 61 },
      { t: 'shape', d: P('M9 22 Q9 14 17 14 L47 14 Q55 14 55 22 L55 27 L9 27 Z'), fill: 'cat', seed: 62 },
      { t: 'line', d: P('M21 9 L21 18 M43 9 L43 18'), sw: 1.2, seed: 63 },
      { t: 'shape', d: P('M32 50 C24 45 21 41 21 37.5 C21 34 24 32 26.8 32 C29 32 31 33.5 32 35.5 C33 33.5 35 32 37.2 32 C40 32 43 34 43 37.5 C43 41 40 45 32 50 Z'), fill: 'heart', seed: 64 },
    ],
  },
  finance: {
    name: '钱来钱往', cat: 'mint', parts: [
      { t: 'shape', d: circle(43, 17, 9.5), fill: 'yellow', seed: 41 },
      { t: 'line', d: P('M39.6 12.6 L43 17 L46.4 12.6 M43 17 L43 22.4 M39.8 18.3 L46.2 18.3'), sw: 0.7, seed: 42 },
      { t: 'shape', d: rrect(7, 23, 48, 32, 8), fill: 'cat', seed: 43 },
      { t: 'line', d: P('M8 31 C20 32 32 32 40 31'), sw: 0.75, seed: 44 },
      { t: 'shape', d: rrect(40, 33, 17, 12, 5), fill: 'yellow', sw: 0.9, seed: 45 },
      { t: 'dot', d: circle(49, 39, 2), seed: 46 },
    ],
  },
  packing: {
    name: '出门走走', cat: 'mint', parts: [
      { t: 'line', d: P('M24 22 L24 15 Q24 10 29 10 L35 10 Q40 10 40 15 L40 22'), sw: 1.5, seed: 71 },
      { t: 'shape', d: rrect(9, 21, 46, 34, 7), fill: 'cat', seed: 72 },
      { t: 'line', d: P('M20 22 L20 54 M44 22 L44 54'), sw: 0.8, seed: 73 },
      { t: 'shape', d: P('M32 32 L34.2 36.6 L39.2 37.3 L35.6 40.8 L36.4 45.8 L32 43.4 L27.6 45.8 L28.4 40.8 L24.8 37.3 L29.8 36.6 Z'), fill: 'yellow', sw: 0.75, amp: 0.35, seed: 74 },
    ],
  },
  // ---- 兴趣 · 樱粉 ----
  books: {
    name: '摸鱼读读', cat: 'pink', parts: [
      { t: 'shape', d: P('M32 21 C26 16 17 15 9 18 L9 51 C17 48 26 49 32 54 Z'), fill: 'cat', seed: 31 },
      { t: 'shape', d: P('M32 21 C38 16 47 15 55 18 L55 51 C47 48 38 49 32 54 Z'), fill: 'cat', seed: 32 },
      { t: 'line', d: P('M32 22 L32 53'), sw: 0.8, seed: 33 },
      { t: 'line', d: P('M14 27 C18 26 22 26 27 28 M14 34 C18 33 22 33 27 35'), sw: 0.7, seed: 34 },
      { t: 'shape', d: P('M37 12 C41 7 49 6 55 11 C49 16 41 16 37 12 Z'), fill: 'yellow', seed: 35 },
      { t: 'shape', d: P('M38 12 L31 6.5 L31.5 17.5 Z'), fill: 'yellow', sw: 0.85, seed: 36 },
      { t: 'dot', d: circle(50, 10.4, 1.3), seed: 37 },
    ],
  },
  films: {
    name: '好奇看看', cat: 'pink', parts: [
      { t: 'shape', d: rrect(9, 27, 46, 29, 6), fill: 'cat', seed: 131 },
      { t: 'shape', d: rotate(rrect(8, 15, 47, 10, 3), 8, 25, -11), fill: 'yellow', seed: 132 },
      { t: 'line', d: rotate(P('M17 15.5 L21 24.5 M28 15.5 L32 24.5 M39 15.5 L43 24.5'), 8, 25, -11), sw: 0.8, seed: 133 },
      { t: 'shape', d: P('M27 34.5 L40.5 41.5 L27 48.5 Z'), fill: 'white', sw: 0.8, amp: 0.4, seed: 134 },
    ],
  },
  // 玩物有志：竖着的掌机，屏幕里一颗小心（站主 2026-11-15 在「Pomelo · 联动和玩物有志」画布上挑了 B）
  games: {
    name: '玩物有志', cat: 'pink', parts: turn([
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
  drawing: {
    name: '随意画画', cat: 'pink', parts: [
      { t: 'shape', d: P('M31 9 C46 9 57 19 57 31 C57 39 51 41 46 39 C41 37 37 40 39 46 C41 52 37 56 30 56 C17 56 7 45 7 32 C7 19 17 9 31 9 Z'), fill: 'cat', seed: 135 },
      { t: 'shape', d: circle(19, 26, 4.6), fill: 'yellow', sw: 0.75, amp: 0.4, seed: 136 },
      { t: 'shape', d: circle(31, 18.5, 4.2), fill: 'heart', sw: 0.75, amp: 0.4, seed: 137 },
      { t: 'shape', d: circle(44, 22, 4), fill: 'white', sw: 0.75, amp: 0.4, seed: 138 },
      { t: 'shape', d: circle(17, 40, 4.4), fill: 'leaf', sw: 0.75, amp: 0.4, seed: 139 },
    ],
  },
  site: {
    name: '呦呦漫游', cat: 'pink', parts: [
      { t: 'line', d: circle(32, 9.5, 3.6), sw: 0.9, seed: 151 },
      { t: 'shape', d: circle(32, 35, 21.5), fill: 'cat', seed: 152 },
      { t: 'shape', d: circle(32, 35, 15), fill: 'white', sw: 0.8, seed: 153 },
      { t: 'shape', d: P('M32 21.5 L37 35 L27 35 Z'), fill: 'heart', sw: 0.75, amp: 0.35, seed: 154 },
      { t: 'shape', d: P('M32 48.5 L37 35 L27 35 Z'), fill: 'yellow', sw: 0.75, amp: 0.35, seed: 155 },
      { t: 'dot', d: circle(32, 35, 1.9), seed: 156 },
    ],
  },
  canvas: {
    name: '有板有眼', cat: 'pink', parts: [
      { t: 'line', d: P('M24 42 L15 58 M40 42 L49 58 M32 44 L32 55'), sw: 1.1, seed: 231 },
      { t: 'shape', d: rrect(7, 7, 50, 37, 6), fill: 'cat', seed: 232 },
      { t: 'shape', d: rrect(13, 13, 38, 25, 3), fill: 'white', sw: 0.8, seed: 233 },
      { t: 'shape', d: P('M15 36 L25 24 L31 30.5 L36 25.5 L49 36 Z'), fill: 'catLight', sw: 0.75, amp: 0.45, seed: 234 },
      { t: 'shape', d: circle(42.5, 19.5, 3.7), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 235 },
    ],
  },
  // ---- 求职 · 葡萄紫 ----
  jobs: {
    name: '投石问路', cat: 'grape', parts: [
      { t: 'line', d: P('M23 21 L23 15 Q23 11 27 11 L37 11 Q41 11 41 15 L41 21'), sw: 1.4, seed: 161 },
      { t: 'shape', d: rrect(8, 20, 48, 34, 7), fill: 'cat', seed: 162 },
      { t: 'line', d: P('M9 33 C22 36.5 42 36.5 55 33'), sw: 0.75, seed: 163 },
      { t: 'shape', d: rrect(27.5, 30, 9, 8, 2.4), fill: 'yellow', sw: 0.8, seed: 164 },
    ],
  },
  seeker: {
    name: 'Seeker', cat: 'grape', parts: [
      { t: 'shape', d: rrect(8, 7, 38, 50, 7), fill: 'cat', seed: 241 },
      { t: 'shape', d: circle(27, 22, 7), fill: 'yellow', sw: 0.85, seed: 242 },
      { t: 'shape', d: P('M15.5 42 C15.5 34.5 20.5 31.5 27 31.5 C33.5 31.5 38.5 34.5 38.5 42 Z'), fill: 'white', sw: 0.85, amp: 0.5, seed: 243 },
      { t: 'line', d: P('M15 49 L31 49'), sw: 0.75, seed: 244 },
      { t: 'shape', d: circle(45, 44, 9.5), fill: 'white', seed: 245 },
      { t: 'line', d: P('M51.6 51 L57.5 57.2'), sw: 1.5, seed: 246 },
      { t: 'line', d: P('M40.5 41 C41.5 38.8 43.4 37.6 45.6 37.5'), sw: 0.6, seed: 247 },
    ],
  },
  rater: {
    name: 'Rater', cat: 'grape', parts: [
      { t: 'shape', d: P('M18 8 L46 8 Q56 8 56 18 L56 33 Q56 43 46 43 L31 43 L19 53.5 L21 43 L18 43 Q8 43 8 33 L8 18 Q8 8 18 8 Z'), fill: 'cat', seed: 251 },
      { t: 'line', d: P('M25.5 20 C25.5 15 28.8 13 32.2 13 C36 13 38.8 15.4 38.8 18.8 C38.8 22.4 35.6 23.6 33.8 25 C32.6 26 32.2 27.2 32.2 29.6'), sw: 1, seed: 252 },
      { t: 'dot', d: circle(32.2, 35.5, 2.4), seed: 253 },
      { t: 'shape', d: star(50, 47, 10), fill: 'yellow', sw: 0.8, amp: 0.4, seed: 254 },
    ],
  },
  // ---- 柚子 · 橙（柚子本人另画，见 pomelo()） ----
  translate: {
    name: 'Translator', cat: 'orange', parts: [
      { t: 'shape', d: P('M15 7 L31 7 Q40 7 40 16 L40 24 Q40 33 31 33 L21 33 L12.5 40.5 L13.5 32.6 Q6 31.5 6 24 L6 16 Q6 7 15 7 Z'), fill: 'cat', seed: 261 },
      { t: 'line', d: P('M23 11.6 L23.6 14.2 M15.6 16.8 L30.6 16.4 M27.4 17.4 C25 23.6 20.6 27.4 16 28.8 M18.4 17.6 C21.2 23.6 25.6 27.2 30.6 28.4'), sw: 0.7, seed: 262 },
      { t: 'shape', d: P('M33 24 L49 24 Q58 24 58 33 L58 41 Q58 50 50 50.4 L51 57.5 L42.5 50.4 L33 50.4 Q24 50.4 24 41 L24 33 Q24 24 33 24 Z'), fill: 'yellow', seed: 263 },
      { t: 'line', d: P('M35.4 45 L41 29.6 L46.6 45 M37.4 40 L44.6 40'), sw: 0.85, seed: 264 },
    ],
  },
  pub2md: {
    name: 'Pub2MD', cat: 'orange', parts: [
      { t: 'shape', d: P('M15 6 L37 6 L49 18 L49 56 Q49 58 47 58 L15 58 Q13 58 13 56 L13 8 Q13 6 15 6 Z'), fill: 'cat', seed: 271 },
      { t: 'shape', d: P('M37 6 L37 16 Q37 18 39 18 L49 18 Z'), fill: 'catLight', sw: 0.8, amp: 0.5, seed: 272 },
      { t: 'line', d: P('M19.5 17 L31 17 M19.5 24.5 L41 24.5 M19.5 32 L35 32'), sw: 0.7, seed: 273 },
      { t: 'shape', d: rrect(27, 37, 31, 20, 6), fill: 'yellow', seed: 274 },
      { t: 'line', d: P('M32.5 52 L32.5 42.4 L37 47.6 L41.5 42.4 L41.5 52 M50.5 42 L50.5 51.6 M46.8 48.2 L50.5 52 L54.2 48.2'), sw: 0.8, seed: 275 },
    ],
  },
  importer: {
    name: 'Importer', cat: 'orange', parts: [
      { t: 'shape', d: P('M13 7 L41 7 L41 55 L37.5 51.4 L34 55 L30.5 51.4 L27 55 L23.5 51.4 L20 55 L16.5 51.4 L13 55 Z'), fill: 'cat', seed: 281 },
      { t: 'line', d: P('M18.5 16 L35.5 16 M18.5 23 L31 23 M18.5 30 L35.5 30'), sw: 0.7, seed: 282 },
      { t: 'shape', d: circle(46, 41, 11.5), fill: 'yellow', seed: 283 },
      { t: 'line', d: P('M46 34.4 L46 47 M40.6 42 L46 47.4 L51.4 42'), sw: 1, seed: 284 },
    ],
  },
  atlas: {
    name: 'Atlas', cat: 'orange', parts: [
      { t: 'shape', d: P('M6 15 L23 9 L41 15 L58 9 L58 50 L41 56 L23 50 L6 56 Z'), fill: 'cat', seed: 291 },
      { t: 'shape', d: P('M23 9 L41 15 L41 56 L23 50 Z'), fill: 'catLight', sw: 0.8, amp: 0.5, seed: 292 },
      { t: 'dot', d: circle(12.5, 45, 1.5), seed: 293 },
      { t: 'dot', d: circle(18, 40, 1.5), seed: 294 },
      { t: 'dot', d: circle(24.5, 38.5, 1.5), seed: 295 },
      { t: 'dot', d: circle(30.5, 34.5, 1.5), seed: 296 },
      { t: 'dot', d: circle(35, 29.5, 1.5), seed: 297 },
      { t: 'shape', d: star(46.5, 24, 10.5), fill: 'yellow', sw: 0.8, amp: 0.4, seed: 298 },
    ],
  },
  // ---- 工具 · 天蓝 ----
  vault: {
    name: '芝麻开门', cat: 'sky', parts: turn([
      { t: 'shape', d: rrect(26, 28.5, 30, 7, 3), fill: 'cat', seed: 141 },
      { t: 'shape', d: rrect(43, 34, 4.5, 8, 1.6), fill: 'cat', sw: 0.8, seed: 142 },
      { t: 'shape', d: rrect(50, 34, 4.5, 10, 1.6), fill: 'cat', sw: 0.8, seed: 143 },
      { t: 'shape', d: circle(17, 32, 11.5), fill: 'yellow', seed: 144 },
      { t: 'shape', d: circle(14, 32, 3.4), fill: 'white', sw: 0.75, amp: 0.4, seed: 145 },
    ], -32),
  },
  bookmarks: {
    name: '一网打尽', cat: 'sky', parts: [
      { t: 'shape', d: rotate(rrect(36, 17.5, 36, 6, 3), 36, 20.5, 47), fill: 'wood', seed: 301 },
      { t: 'shape', d: ellipse(22, 17, 16, 7.5, -12), fill: 'catLight', sw: 0.8, amp: 0.5, seed: 302 },
      { t: 'shape', d: P('M6.4 20.4 C6 32 9 46 17 54 C23 59 29 53 31 44 C33.5 34 36.5 26 37.6 13.4 C36 19 29 23.6 21.4 24.4 C14 25.2 8 23.6 6.4 20.4 Z'), fill: 'cat', seed: 303 },
      { t: 'shape', d: star(21, 37, 7.5), fill: 'yellow', sw: 0.75, amp: 0.4, seed: 304 },
      { t: 'line', d: P('M8.5 31.5 C15 32.5 27 31 34.5 27 M11 43.5 C16 44.5 24 43 30.5 39.5 M15 25.5 C13.5 35 14 46 17.5 53.5 M27.5 23 C28 33 26 44 22.5 54'), sw: 0.6, color: 'white', withFill: true, seed: 305 },
      { t: 'line', d: ellipse(22, 17, 16, 7.5, -12), sw: 1.1, seed: 306 },
    ],
  },
  janitor: {
    name: 'DevJanitor', cat: 'sky', parts: [
      ...turn([
        { t: 'shape', d: rrect(29.5, 1, 5, 30, 2.5), fill: 'wood', sw: 0.85, seed: 311 },
        { t: 'shape', d: P('M22 37 L42 37 L49.5 57 Q32 61 14.5 57 Z'), fill: 'cat', seed: 312 },
        { t: 'line', d: P('M27 41 L23.5 56 M32 41 L32 58 M37 41 L40.5 56'), sw: 0.65, seed: 313 },
        { t: 'shape', d: rrect(21.5, 29, 21, 8, 3), fill: 'yellow', sw: 0.85, seed: 314 },
      ], 30, 32, 36),
      { t: 'shape', d: sparkle(48, 14, 6.5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 315 },
      { t: 'shape', d: sparkle(56, 27, 4), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 316 },
    ],
  },
};

/** 模块坞里的顺序（按分类），也是审看画板上的顺序。 */
export const MODULE_ORDER = ['todo', 'notes', 'articles', 'days', 'finance', 'packing', 'books', 'films', 'games', 'drawing', 'site', 'canvas', 'jobs', 'seeker', 'rater', 'translate', 'pub2md', 'importer', 'atlas', 'vault', 'bookmarks', 'janitor'];
export const CATEGORY_NAMES = { mint: '日常', pink: '兴趣', grape: '求职', orange: '柚子', sky: '工具' };

// ---------- 通用贴纸（站主 2026-11-07 要的：自建模块也有贴纸，每个模块都能换图标和颜色） ----------
// 和模块贴纸同一种画法、同一个 64 格；cat 是默认颜色，Pomelo 里能换成五种分类色的任一种。
// 前 23 个对应自建模块现在能选的 Lucide 图标（Pomelo 的 modules/custom/icons.ts，languages 用 Translator 那张），后 9 个是加的。
export const LIBRARY_ICONS = {
  shapes: {
    name: '形状', cat: 'mint', parts: [
      { t: 'shape', d: rotate(rrect(34, 32, 22, 22, 4), 45, 43, 14), fill: 'catLight', seed: 401 },
      { t: 'shape', d: P('M38 7 L55 35 L21 35 Z'), fill: 'yellow', sw: 0.9, seed: 402 },
      { t: 'shape', d: circle(22, 41, 14), fill: 'cat', seed: 403 },
    ],
  },
  checklist: {
    name: '清单', cat: 'mint', parts: [
      { t: 'shape', d: rrect(10, 10, 44, 48, 7), fill: 'cat', seed: 411 },
      { t: 'shape', d: rrect(16, 18, 32, 34, 3), fill: 'white', sw: 0.8, seed: 412 },
      { t: 'shape', d: rrect(23, 5, 18, 9, 3), fill: 'yellow', sw: 0.85, seed: 413 },
      { t: 'line', d: P('M20 27 L23 30 L28 23.5 M20 38 L23 41 L28 34.5'), sw: 0.8, seed: 414 },
      { t: 'line', d: P('M32 27 L43 27 M32 38 L43 38 M21 47 L40 47'), sw: 0.6, seed: 415 },
    ],
  },
  game: {
    name: '游戏', cat: 'pink', parts: [
      { t: 'shape', d: P('M19 19 L45 19 C52 19 56 24 57.5 31 L60 43 C61 49 57 53 52 52 C48.5 51.5 46.5 48 44 45 L20 45 C17.5 48 15.5 51.5 12 52 C7 53 3 49 4 43 L6.5 31 C8 24 12 19 19 19 Z'), fill: 'cat', seed: 421 },
      { t: 'line', d: P('M12.5 32 L23.5 32 M18 26.5 L18 37.5'), sw: 1.15, seed: 422 },
      { t: 'shape', d: circle(44.5, 28.5, 3.6), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 423 },
      { t: 'shape', d: circle(50.5, 35.5, 3.6), fill: 'heart', sw: 0.7, amp: 0.35, seed: 424 },
      { t: 'line', d: P('M28 29 L30.5 29 M33.5 29 L36 29'), sw: 0.75, seed: 425 },
    ],
  },
  music: {
    name: '音乐', cat: 'pink', parts: [
      { t: 'shape', d: P('M25.5 17 L48 10.5 L48 18.5 L25.5 25 Z'), fill: 'cat', sw: 0.9, seed: 431 },
      { t: 'line', d: P('M25.5 47 L25.5 18 M48 41.5 L48 12'), sw: 1, seed: 432 },
      { t: 'shape', d: ellipse(19.5, 47.5, 7.4, 5.6, -22), fill: 'cat', seed: 433 },
      { t: 'shape', d: ellipse(42, 42, 7.4, 5.6, -22), fill: 'cat', seed: 434 },
      { t: 'shape', d: sparkle(11, 17, 6), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 435 },
    ],
  },
  headphones: {
    name: '耳机', cat: 'sky', parts: [
      { t: 'shape', d: P('M9 40 C9 21 19 10 32 10 C45 10 55 21 55 40 L49.5 40 C49.5 25 42 16 32 16 C22 16 14.5 25 14.5 40 Z'), fill: 'cat', sw: 0.9, seed: 441 },
      { t: 'shape', d: rrect(7, 34, 14, 23, 6.5), fill: 'cat', seed: 442 },
      { t: 'shape', d: rrect(43, 34, 14, 23, 6.5), fill: 'cat', seed: 443 },
      { t: 'shape', d: rrect(17, 38, 6, 15, 2.6), fill: 'yellow', sw: 0.75, seed: 444 },
      { t: 'shape', d: rrect(41, 38, 6, 15, 2.6), fill: 'yellow', sw: 0.75, seed: 445 },
    ],
  },
  camera: {
    name: '相机', cat: 'sky', parts: [
      { t: 'shape', d: P('M21 20 L25 12 L39 12 L43 20 Z'), fill: 'catLight', sw: 0.85, seed: 451 },
      { t: 'shape', d: rrect(6, 19, 52, 36, 8), fill: 'cat', seed: 452 },
      { t: 'shape', d: circle(32, 37, 12), fill: 'white', seed: 453 },
      { t: 'shape', d: circle(32, 37, 6.4), fill: 'catLight', sw: 0.8, amp: 0.45, seed: 454 },
      { t: 'line', d: P('M27 32.5 C28.5 30.8 30.4 30 32.4 30'), sw: 0.6, seed: 455 },
      { t: 'shape', d: rrect(45.5, 24, 7, 5, 1.6), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 456 },
    ],
  },
  tv: {
    name: '电视', cat: 'pink', parts: [
      { t: 'line', d: P('M23 7 L32 17 L42 5'), sw: 1, seed: 461 },
      { t: 'shape', d: rrect(6, 17, 52, 38, 9), fill: 'cat', seed: 462 },
      { t: 'shape', d: rrect(11.5, 22.5, 32, 27, 6), fill: 'white', sw: 0.85, seed: 463 },
      { t: 'shape', d: heartAt(27.5, 36.5, 0.62), fill: 'heart', sw: 0.75, amp: 0.4, seed: 464 },
      { t: 'shape', d: circle(50.5, 29, 3.1), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 465 },
      { t: 'shape', d: circle(50.5, 40.5, 3.1), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 466 },
    ],
  },
  coffee: {
    name: '咖啡', cat: 'orange', parts: [
      { t: 'line', d: P('M46 30 C55 29 57 37 52.5 41 C50.5 43 48 43.5 45 43.5'), sw: 1.3, seed: 471 },
      { t: 'shape', d: P('M11 23 L49 23 L46 48 Q45 55 38 55 L22 55 Q15 55 14 48 Z'), fill: 'cat', seed: 472 },
      { t: 'shape', d: ellipse(30, 23, 19, 4.4), fill: 'catLight', sw: 0.85, seed: 473 },
      { t: 'shape', d: heartAt(30, 38.5, 0.52), fill: 'white', sw: 0.7, amp: 0.35, seed: 474 },
      { t: 'line', d: P('M23 15 C21 12 25 10 23 6 M33 15 C31 12 35 10 33 6'), sw: 0.7, seed: 475 },
    ],
  },
  bowl: {
    name: '饭碗', cat: 'orange', parts: [
      { t: 'line', d: P('M35 26 L56 6 M41 27 L60 11'), sw: 1.1, seed: 481 },
      { t: 'shape', d: P('M10 32 C10 24 17 20 24 22 C27 15 37 15 40 22 C47 20 54 24 54 32 Z'), fill: 'white', sw: 0.9, seed: 482 },
      { t: 'shape', d: circle(26, 25, 4.4), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 483 },
      { t: 'shape', d: P('M6 31 L58 31 C58 46 47 56 32 56 C17 56 6 46 6 31 Z'), fill: 'cat', seed: 484 },
      { t: 'line', d: P('M11 40 C24 43.5 40 43.5 53 40'), sw: 0.6, color: 'white', withFill: true, seed: 485 },
    ],
  },
  bag: {
    name: '购物袋', cat: 'mint', parts: [
      { t: 'shape', d: P('M12 22 L52 22 L55.5 57 L8.5 57 Z'), fill: 'cat', seed: 491 },
      { t: 'line', d: P('M23 28 L23 17 Q23 9 32 9 Q41 9 41 17 L41 28'), sw: 1.2, seed: 492 },
      { t: 'dot', d: circle(23, 28.5, 1.9), seed: 493 },
      { t: 'dot', d: circle(41, 28.5, 1.9), seed: 494 },
      { t: 'shape', d: star(32, 42.5, 9), fill: 'yellow', sw: 0.8, amp: 0.4, seed: 495 },
    ],
  },
  gift: {
    name: '礼物', cat: 'pink', parts: [
      { t: 'shape', d: rrect(10, 28, 44, 28, 4), fill: 'cat', seed: 501 },
      { t: 'shape', d: rrect(6, 19, 52, 11, 3.5), fill: 'catLight', seed: 502 },
      { t: 'shape', d: rrect(28, 19, 8, 37, 1), fill: 'yellow', sw: 0.8, seed: 503 },
      { t: 'shape', d: P('M32 19 C26 8 14 10 18 17 C20 20.5 26 20.5 32 19 Z'), fill: 'yellow', sw: 0.85, seed: 504 },
      { t: 'shape', d: P('M32 19 C38 8 50 10 46 17 C44 20.5 38 20.5 32 19 Z'), fill: 'yellow', sw: 0.85, seed: 505 },
    ],
  },
  shirt: {
    name: 'T 恤', cat: 'sky', parts: [
      { t: 'shape', d: P('M22 9 L12 13 L4 24 L12 31.5 L17 27 L17 56 L47 56 L47 27 L52 31.5 L60 24 L52 13 L42 9 C40 14 36 16.5 32 16.5 C28 16.5 24 14 22 9 Z'), fill: 'cat', seed: 511 },
      { t: 'shape', d: rrect(36.5, 31, 7.5, 8.5, 1.8), fill: 'yellow', sw: 0.75, seed: 512 },
      { t: 'line', d: P('M18 46 C27 47.5 37 47.5 46 46'), sw: 0.6, color: 'white', withFill: true, seed: 513 },
    ],
  },
  plane: {
    name: '飞机', cat: 'sky', parts: [
      ...turn([
        { t: 'shape', d: P('M11 31 L7 18 L14.5 18 L23 29 Z'), fill: 'catLight', sw: 0.85, seed: 521 },
        { t: 'shape', d: P('M8 34 C8 30 12 28 18 28 L50 28 C56 28 60 31 60 34 C60 37 56 40 50 40 L18 40 C12 40 8 38 8 34 Z'), fill: 'cat', seed: 522 },
        { t: 'shape', d: P('M26 35 L39 35 L31 53 L23.5 53 Z'), fill: 'catLight', sw: 0.85, seed: 523 },
        { t: 'dot', d: circle(33, 32.6, 1.5), seed: 524 },
        { t: 'dot', d: circle(39, 32.6, 1.5), seed: 525 },
        { t: 'dot', d: circle(45, 32.6, 1.5), seed: 526 },
        { t: 'shape', d: P('M52 30.5 L57 32.2 L57.6 34.2 L52 34.2 Z'), fill: 'white', sw: 0.6, amp: 0.3, seed: 527 },
      ], -22, 34, 34),
      { t: 'shape', d: sparkle(14, 50, 5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 528 },
    ],
  },
  mountain: {
    name: '山', cat: 'mint', parts: [
      { t: 'shape', d: circle(50, 14, 6.5), fill: 'yellow', sw: 0.8, seed: 531 },
      { t: 'shape', d: P('M29 55 L44 25 L60 55 Z'), fill: 'catLight', seed: 532 },
      { t: 'shape', d: P('M4 55 L24 14 L45 55 Z'), fill: 'cat', seed: 533 },
      { t: 'shape', d: P('M18.7 25 L24 14 L29.3 25 L26.6 23 L24 26 L21.4 23 Z'), fill: 'white', sw: 0.7, amp: 0.35, seed: 534 },
    ],
  },
  leaf: {
    name: '叶子', cat: 'mint', parts: [
      { t: 'shape', d: P('M11 53 C7 30 22 10 55 8 C57 38 41 55 11 53 Z'), fill: 'cat', seed: 541 },
      { t: 'line', d: P('M11 53 C23 39 34 28 47 17'), sw: 0.85, seed: 542 },
      { t: 'line', d: P('M24 39.5 L23 30 M31.5 32 L31.5 23 M29.5 41.5 L39 41.5 M37 33 L46 32'), sw: 0.6, seed: 543 },
      { t: 'shape', d: circle(48, 45, 5.6), fill: 'heart', sw: 0.75, amp: 0.4, seed: 544 },
      { t: 'dot', d: circle(46.2, 43.6, 1.1), seed: 545 },
      { t: 'dot', d: circle(49.6, 46.8, 1.1), seed: 546 },
    ],
  },
  sprout: {
    name: '发芽', cat: 'mint', parts: [
      { t: 'line', d: P('M32 36 C32 30 32 26 32 21'), sw: 1, seed: 551 },
      { t: 'shape', d: P('M32 25 C26 14 15 13 10 18 C16 27 26 28 32 25 Z'), fill: 'leaf', seed: 552 },
      { t: 'shape', d: P('M32 22 C36 10 48 7 54 11 C50 21 40 24 32 22 Z'), fill: 'leaf', seed: 553 },
      { t: 'shape', d: P('M18 38 L46 38 L42 57 L22 57 Z'), fill: 'cat', seed: 554 },
      { t: 'shape', d: rrect(14, 33, 36, 8, 3), fill: 'catLight', sw: 0.9, seed: 555 },
    ],
  },
  dumbbell: {
    name: '哑铃', cat: 'grape', parts: [
      ...turn([
        { t: 'shape', d: rrect(14, 29.5, 36, 5.5, 2.2), fill: 'catLight', sw: 0.85, seed: 561 },
        { t: 'shape', d: rrect(3, 24, 7, 17, 2.5), fill: 'cat', sw: 0.9, seed: 562 },
        { t: 'shape', d: rrect(8, 18, 9.5, 29, 3), fill: 'cat', seed: 563 },
        { t: 'shape', d: rrect(54, 24, 7, 17, 2.5), fill: 'cat', sw: 0.9, seed: 564 },
        { t: 'shape', d: rrect(46.5, 18, 9.5, 29, 3), fill: 'cat', seed: 565 },
      ], -22, 32, 34),
      { t: 'shape', d: sparkle(51, 11, 6), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 566 },
    ],
  },
  heart: {
    name: '爱心', cat: 'pink', parts: [
      { t: 'shape', d: heartAt(31, 34, 2.15), fill: 'cat', seed: 571 },
      { t: 'line', d: P('M14.5 26 C15 21 18.5 18 23 18'), sw: 1.1, color: 'white', withFill: true, seed: 572 },
      { t: 'shape', d: sparkle(53, 12, 6.5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 573 },
    ],
  },
  star: {
    name: '星星', cat: 'orange', parts: [
      { t: 'shape', d: star(31, 34, 25, 0.5), fill: 'cat', seed: 581 },
      { t: 'line', d: P('M21.5 29.5 L28 29'), sw: 1, color: 'white', withFill: true, seed: 582 },
      { t: 'shape', d: sparkle(54, 11, 6), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 583 },
    ],
  },
  grad: {
    name: '学士帽', cat: 'grape', parts: [
      { t: 'shape', d: P('M16 29 L16 42 C16 47.5 24 51 32 51 C40 51 48 47.5 48 42 L48 29 L32 36 Z'), fill: 'catLight', seed: 591 },
      { t: 'shape', d: P('M32 11 L60 23.5 L32 36 L4 23.5 Z'), fill: 'cat', seed: 592 },
      { t: 'line', d: P('M32 23.5 L52 28.5 L52 41'), sw: 0.8, seed: 593 },
      { t: 'shape', d: rrect(49, 40, 6, 9, 1.8), fill: 'yellow', sw: 0.75, seed: 594 },
      { t: 'dot', d: circle(32, 23.5, 2.2), seed: 595 },
    ],
  },
  code: {
    name: '代码', cat: 'sky', parts: [
      { t: 'shape', d: rrect(6, 9, 52, 46, 7), fill: 'cat', seed: 601 },
      { t: 'dot', d: circle(12.5, 15.5, 1.7), seed: 602 },
      { t: 'dot', d: circle(18.5, 15.5, 1.7), seed: 603 },
      { t: 'dot', d: circle(24.5, 15.5, 1.7), seed: 604 },
      { t: 'shape', d: rrect(11, 22, 42, 28, 4), fill: 'white', sw: 0.85, seed: 605 },
      { t: 'line', d: P('M23 29.5 L16.5 36 L23 42.5 M41 29.5 L47.5 36 L41 42.5'), sw: 0.95, seed: 606 },
      { t: 'line', d: P('M35 27.5 L29 44.5'), sw: 0.95, color: 'cat', seed: 607 },
    ],
  },
  puzzle: {
    name: '拼图', cat: 'grape', parts: [
      { t: 'shape', d: P('M10 18 L24 18 C22 10 38 10 36 18 L50 18 L50 30 C58 28 58 44 50 42 L50 56 L36 56 C38 48 22 48 24 56 L10 56 L10 42 C16 44 16 30 10 30 Z'), fill: 'cat', seed: 611 },
      { t: 'line', d: P('M15 25.5 C15.5 23.5 17 22.5 19 22.5'), sw: 0.8, color: 'white', withFill: true, seed: 612 },
      { t: 'shape', d: sparkle(55, 11, 5.5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 613 },
    ],
  },
  trophy: {
    name: '奖杯', cat: 'orange', parts: [
      { t: 'line', d: P('M18 15 C8.5 15 8.5 29 19 30 M46 15 C55.5 15 55.5 29 45 30'), sw: 1.15, seed: 621 },
      { t: 'shape', d: rrect(28.5, 38, 7, 10, 1.4), fill: 'catLight', sw: 0.85, seed: 622 },
      { t: 'shape', d: rrect(19, 47, 26, 9, 2.6), fill: 'catLight', seed: 623 },
      { t: 'shape', d: P('M17 9 L47 9 L47 23 C47 34 40.5 40 32 40 C23.5 40 17 34 17 23 Z'), fill: 'cat', seed: 624 },
      { t: 'shape', d: star(32, 22.5, 7.5), fill: 'yellow', sw: 0.75, amp: 0.4, seed: 625 },
    ],
  },
  cat: {
    name: '猫咪', cat: 'orange', parts: [
      { t: 'shape', d: P('M12 23 L13 8 L24.5 16 C29 14.5 35 14.5 39.5 16 L51 8 L52 23 C56 28 57.5 34 56.5 40 C54.5 51 44 56.5 32 56.5 C20 56.5 9.5 51 7.5 40 C6.5 34 8 28 12 23 Z'), fill: 'cat', seed: 631 },
      { t: 'shape', d: P('M16 14 L16.5 21 L21.5 17.5 Z'), fill: 'catLight', sw: 0.6, amp: 0.3, seed: 632 },
      { t: 'shape', d: P('M48 14 L47.5 21 L42.5 17.5 Z'), fill: 'catLight', sw: 0.6, amp: 0.3, seed: 633 },
      { t: 'dot', d: ellipse(23.5, 35.5, 2.6, 3.2), seed: 634 },
      { t: 'dot', d: ellipse(40.5, 35.5, 2.6, 3.2), seed: 635 },
      { t: 'blush', d: ellipse(18, 43.5, 3.8, 2.4), seed: 636 },
      { t: 'blush', d: ellipse(46, 43.5, 3.8, 2.4), seed: 637 },
      { t: 'line', d: P('M32 43 Q29.5 47 27 45.5 M32 43 Q34.5 47 37 45.5'), sw: 0.6, seed: 638 },
      { t: 'dot', d: P('M29.6 40.6 L34.4 40.6 L32 43.4 Z'), seed: 639 },
    ],
  },
  flower: {
    name: '小花', cat: 'pink', parts: [
      { t: 'line', d: P('M32 36 C32 44 31 50 29.5 58'), sw: 1, seed: 641 },
      { t: 'shape', d: P('M30.5 50 C24 45 17 46 13.5 50.5 C19 55 25.5 55 30.5 50 Z'), fill: 'leaf', sw: 0.85, seed: 642 },
      { t: 'shape', d: flower(32, 26, 18, 7), fill: 'cat', seed: 643 },
      { t: 'shape', d: circle(32, 26, 6.5), fill: 'yellow', sw: 0.8, amp: 0.4, seed: 644 },
    ],
  },
  bulb: {
    name: '灵感', cat: 'orange', parts: [
      { t: 'line', d: P('M4.5 23 L9.5 24 M10 8 L13.5 11.5 M54 8 L50.5 11.5 M59.5 23 L54.5 24'), sw: 0.8, seed: 651 },
      { t: 'shape', d: rrect(23.5, 46, 17, 11, 3.2), fill: 'catLight', seed: 652 },
      { t: 'line', d: P('M24 51.5 L40 51.5'), sw: 0.6, seed: 653 },
      { t: 'shape', d: P('M32 6 C43 6 51 14 51 25 C51 32 47 36 44 40 C42 42.5 41 44.5 41 47 L23 47 C23 44.5 22 42.5 20 40 C17 36 13 32 13 25 C13 14 21 6 32 6 Z'), fill: 'cat', seed: 654 },
      { t: 'line', d: P('M28 40.5 L28 33.5 C28 28.5 36 28.5 36 33.5 L36 40.5'), sw: 0.7, seed: 655 },
      { t: 'line', d: P('M19.5 23 C20 17 23.5 13 28.5 12'), sw: 1, color: 'white', withFill: true, seed: 656 },
    ],
  },
  house: {
    name: '小家', cat: 'mint', parts: [
      { t: 'shape', d: rrect(41, 9, 7, 14, 1.6), fill: 'cat', sw: 0.85, seed: 661 },
      { t: 'shape', d: P('M12 29 L32 13 L52 29 L52 54 Q52 56 50 56 L14 56 Q12 56 12 54 Z'), fill: 'catLight', seed: 662 },
      { t: 'shape', d: P('M4 31 L32 7.5 L60 31 L55 35.5 L32 16 L9 35.5 Z'), fill: 'cat', seed: 663 },
      { t: 'shape', d: rrect(26.5, 37, 11, 19, 3.5), fill: 'yellow', sw: 0.85, seed: 664 },
      { t: 'shape', d: rrect(15.5, 37, 7.5, 7.5, 1.6), fill: 'white', sw: 0.7, seed: 665 },
      { t: 'shape', d: rrect(41, 37, 7.5, 7.5, 1.6), fill: 'white', sw: 0.7, seed: 666 },
      { t: 'dot', d: circle(34.5, 47, 1.3), seed: 667 },
    ],
  },
  pill: {
    name: '健康', cat: 'sky', parts: [
      ...turn([
        { t: 'shape', d: P('M32 22.5 L20 22.5 C14.2 22.5 9.5 27.2 9.5 33 C9.5 38.8 14.2 43.5 20 43.5 L32 43.5 Z'), fill: 'cat', seed: 671 },
        { t: 'shape', d: P('M32 22.5 L44 22.5 C49.8 22.5 54.5 27.2 54.5 33 C54.5 38.8 49.8 43.5 44 43.5 L32 43.5 Z'), fill: 'catLight', seed: 672 },
        { t: 'line', d: P('M15 29 C16 27 18 26 20 26'), sw: 0.8, color: 'white', withFill: true, seed: 673 },
      ], -36, 32, 34),
      { t: 'shape', d: P('M47 4 L52 4 L52 9 L57 9 L57 14 L52 14 L52 19 L47 19 L47 14 L42 14 L42 9 L47 9 Z'), fill: 'heart', sw: 0.75, amp: 0.35, seed: 674 },
      { t: 'shape', d: sparkle(12, 52, 5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 675 },
    ],
  },
  letter: {
    name: '信封', cat: 'pink', parts: [
      { t: 'shape', d: rrect(6, 16, 52, 36, 5), fill: 'catLight', seed: 681 },
      { t: 'line', d: P('M8 50 L25 34 M56 50 L39 34'), sw: 0.65, seed: 682 },
      { t: 'shape', d: P('M7 19 Q7 16 10 16 L54 16 Q57 16 57 19 L32 38.5 Z'), fill: 'cat', seed: 683 },
      { t: 'shape', d: heartAt(32, 36, 0.6), fill: 'heart', sw: 0.75, amp: 0.4, seed: 684 },
    ],
  },
  piggy: {
    name: '存钱', cat: 'pink', parts: [
      { t: 'shape', d: rrect(17, 46, 7.5, 10, 2.5), fill: 'cat', sw: 0.85, seed: 691 },
      { t: 'shape', d: rrect(37, 46, 7.5, 10, 2.5), fill: 'cat', sw: 0.85, seed: 692 },
      { t: 'line', d: P('M9 35 C3.5 33 4 27 8.5 28.5'), sw: 0.75, seed: 693 },
      { t: 'shape', d: P('M36 22 L42 12 L46 24 Z'), fill: 'cat', sw: 0.85, seed: 694 },
      { t: 'shape', d: ellipse(31, 37, 23, 17), fill: 'cat', seed: 695 },
      { t: 'shape', d: ellipse(53.5, 37.5, 5, 6.5), fill: 'catLight', sw: 0.85, amp: 0.45, seed: 696 },
      { t: 'dot', d: ellipse(52.2, 36, 0.9, 1.4), seed: 697 },
      { t: 'dot', d: ellipse(55, 39, 0.9, 1.4), seed: 698 },
      { t: 'dot', d: ellipse(44, 31, 2, 2.4), seed: 699 },
      { t: 'line', d: P('M23 23.5 L34 22.5'), sw: 0.8, seed: 700 },
      { t: 'shape', d: circle(28.5, 11, 7), fill: 'yellow', sw: 0.85, seed: 701 },
      { t: 'line', d: P('M28.5 7.5 L28.5 14.5'), sw: 0.6, seed: 702 },
    ],
  },
  dice: {
    name: '骰子', cat: 'grape', parts: [
      { t: 'shape', d: rotate(rrect(30, 7, 26, 26, 6), 43, 20, 16), fill: 'catLight', seed: 711 },
      { t: 'dot', d: circle(37.5, 13.5, 2.1), seed: 712 },
      { t: 'dot', d: circle(42.5, 20.5, 2.1), seed: 713 },
      { t: 'dot', d: circle(47.5, 27.5, 2.1), seed: 714 },
      { t: 'shape', d: rrect(7, 26, 31, 31, 7), fill: 'cat', seed: 715 },
      ...[[15, 34], [30, 34], [22.5, 41.5], [15, 49], [30, 49]].map(([x, y], i) => ({ t: 'dot', d: circle(x, y, 2.5), color: 'white', seed: 716 + i })),
    ],
  },
  moon: {
    name: '月亮', cat: 'grape', parts: [
      { t: 'shape', d: P('M37 7 C23 9 13 20 13 34 C13 48 25 58 39 58 C46.5 58 52.5 55 56.5 50 C51.5 52 46.5 53 41.5 52 C29.5 50 21.5 40 22.5 28 C23.5 18 29.5 10 37 7 Z'), fill: 'cat', seed: 721 },
      { t: 'shape', d: star(46, 19, 7.5), fill: 'yellow', sw: 0.75, amp: 0.4, seed: 722 },
      { t: 'shape', d: sparkle(55, 34, 4.2), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 723 },
      { t: 'shape', d: sparkle(34, 39, 3.2), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 724 },
    ],
  },
};
export const LIBRARY_ORDER = Object.keys(LIBRARY_ICONS);

// ---------- 不是模块的两页：设置、日历（站主 2026-11-09 要的：它们叠在桌上、列在「桌上开着」时，和模块贴纸一个画法） ----------
// 同一个 64 格、同一种画法，放在 places/，不进「图标和颜色」的挑选（那里只有 modules/ 的 52 张）。
/** 齿轮：n 个齿，齿顶在半径 r、齿根在 r0。 */
function gear(cx, cy, r, r0, n = 8) {
  const pt = (a, rr) => `${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`;
  const step = (Math.PI * 2) / n;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = i * step - Math.PI / 2;
    d += `${i ? ' L' : 'M'}${pt(a - step * 0.29, r0)} L${pt(a - step * 0.17, r)} L${pt(a + step * 0.17, r)} L${pt(a + step * 0.29, r0)} Q${pt(a + step / 2, r0 * 1.03)} ${pt(a + step * 0.71, r0)}`;
  }
  return P(d + ' Z');
}
export const PLACE_ICONS = {
  settings: {
    name: '设置', cat: 'sky', parts: [
      { t: 'shape', d: rotate(gear(32, 32, 25, 18.5), 32, 32, 11), fill: 'cat', seed: 801 },
      { t: 'shape', d: circle(32, 32, 8.5), fill: 'yellow', sw: 0.85, amp: 0.4, seed: 802 },
    ],
  },
  calendar: {
    name: '日历', cat: 'mint', parts: turn([
      { t: 'shape', d: rrect(8, 13, 48, 44, 8), fill: 'white', seed: 811 },
      { t: 'shape', d: P('M8 21 Q8 13 16 13 L48 13 Q56 13 56 21 L56 25 L8 25 Z'), fill: 'cat', seed: 812 },
      { t: 'line', d: P('M20 8 L20 17 M32 8 L32 17 M44 8 L44 17'), sw: 1.1, seed: 813 },
      { t: 'shape', d: rrect(14, 30, 9, 8, 2.4), fill: 'catLight', sw: 0.65, amp: 0.35, seed: 814 },
      { t: 'shape', d: rrect(27.5, 30, 9, 8, 2.4), fill: 'catLight', sw: 0.65, amp: 0.35, seed: 815 },
      { t: 'shape', d: rrect(41, 30, 9, 8, 2.4), fill: 'catLight', sw: 0.65, amp: 0.35, seed: 816 },
      { t: 'shape', d: rrect(14, 43, 9, 8, 2.4), fill: 'catLight', sw: 0.65, amp: 0.35, seed: 817 },
      { t: 'shape', d: circle(32, 47, 6.2), fill: 'yellow', sw: 0.75, amp: 0.4, seed: 818 },
      { t: 'shape', d: rrect(41, 43, 9, 8, 2.4), fill: 'catLight', sw: 0.65, amp: 0.35, seed: 819 },
    ], 4),
  },
};
export const PLACE_ORDER = Object.keys(PLACE_ICONS);
/** 自建模块现在存的图标名（Lucide 的名字）→ 贴纸。 */
export const MADE_ICON_MARKS = {
  shapes: 'shapes', 'list-checks': 'checklist', 'gamepad-2': 'game', music: 'music', headphones: 'headphones', camera: 'camera', tv: 'tv',
  coffee: 'coffee', utensils: 'bowl', 'shopping-bag': 'bag', gift: 'gift', shirt: 'shirt', plane: 'plane', mountain: 'mountain', leaf: 'leaf',
  sprout: 'sprout', dumbbell: 'dumbbell', heart: 'heart', star: 'star', 'graduation-cap': 'grad', languages: 'translate', code: 'code', puzzle: 'puzzle', trophy: 'trophy',
};

// ---------- 柚子（100 格） ----------
const BODY = P('M50 18 C60 18 65 23 69 29 C80 36 88 47 88 61 C88 79 71 92 50 92 C29 92 12 79 12 61 C12 47 20 36 31 29 C35 23 40 18 50 18 Z');
const LEAF = P('M52 20 C53 10 61 4 74 4 C74 14 66 21 52 20 Z');
export const FACES = ['normal', 'think', 'wink', 'sleepy', 'happy', 'error', 'surprised', 'wow'];
export const FACE_NAMES = { normal: '平常', think: '在想', wink: '眨眼', sleepy: '困了', happy: '开心', error: '出错', surprised: '惊讶', wow: '哇', worried: '担心' };

const FACE_PARTS = {
  normal: () => [
    { t: 'dot', d: ellipse(39, 61, 3.3, 3.7), seed: 87, id: 'eyes' },
    { t: 'dot', d: ellipse(61, 61, 3.3, 3.7), seed: 88, id: 'eyes' },
    { t: 'line', d: P('M45 70 Q50 75 55 70'), sw: 0.95, seed: 89, id: 'mouth' },
  ],
  think: () => [
    { t: 'dot', d: ellipse(43, 57, 3.1, 3.5), seed: 90, id: 'eyes' },
    { t: 'dot', d: ellipse(64, 57, 3.1, 3.5), seed: 91, id: 'eyes' },
    { t: 'line', d: P('M37 50 C39 48 42 48 45 49 M60 49 C63 48 66 48 68 50'), sw: 0.7, seed: 92 },
    { t: 'line', d: circle(53, 72, 2.6), sw: 0.85, seed: 93, id: 'mouth' },
    { t: 'dot', d: circle(24, 27, 2.4), seed: 94, id: 'th1' },
    { t: 'dot', d: circle(16, 18, 3.2), seed: 95, id: 'th2' },
    { t: 'dot', d: circle(8, 7, 4), seed: 96, id: 'th3' },
  ],
  happy: () => [
    { t: 'line', d: P('M33.5 62 Q39 55 44.5 62 M55.5 62 Q61 55 66.5 62'), sw: 1, seed: 97, id: 'eyes' },
    { t: 'line', d: P('M42 69 Q50 70.5 58 69 Q57 80 50 80 Q43 80 42 69 Z'), sw: 0.9, seed: 98, id: 'mouth' },
    { t: 'shape', d: sparkle(17, 31, 7), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 99, id: 'st1' },
    { t: 'shape', d: sparkle(88, 40, 5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 100, id: 'st2' },
  ],
  wink: () => [
    { t: 'line', d: P('M34 61 Q39 65 44 61'), sw: 1, seed: 110, id: 'eyes' },
    { t: 'dot', d: ellipse(61, 61, 3.3, 3.7), seed: 111, id: 'eyes' },
    { t: 'line', d: P('M44 70 Q50 76 56 70'), sw: 0.95, seed: 112, id: 'mouth' },
  ],
  sleepy: () => [
    { t: 'line', d: P('M34 62 Q39 64.5 44 62 M56 62 Q61 64.5 66 62'), sw: 1, seed: 113, id: 'eyes' },
    { t: 'line', d: ellipse(50, 72, 3, 2.4), sw: 0.85, seed: 114, id: 'mouth' },
    { t: 'line', d: P('M78 27 L86 27 L78 35 L86 35'), sw: 0.75, seed: 115, id: 'zz' },
    { t: 'line', d: P('M89 13 L95 13 L89 19 L95 19'), sw: 0.65, seed: 116, id: 'zz' },
  ],
  error: () => [
    { t: 'line', d: P('M34 57.5 L43 53.5 M66 57.5 L57 53.5'), sw: 0.75, seed: 117 },
    { t: 'dot', d: ellipse(39, 62, 3, 3.4), seed: 118, id: 'eyes' },
    { t: 'dot', d: ellipse(61, 62, 3, 3.4), seed: 119, id: 'eyes' },
    { t: 'line', d: P('M42 73 Q45 70 48 73 Q51 76 54 73 Q56 71 58 72'), sw: 0.85, seed: 120, id: 'mouth' },
    { t: 'shape', d: circle(84, 26, 11.5), fill: 'heart', sw: 0.75, seed: 121, id: 'bang' },
    { t: 'line', d: P('M84 18.5 L84 26.5'), sw: 0.95, color: 'white', seed: 122, id: 'bang' },
    { t: 'dot', d: circle(84, 31.6, 2), color: 'white', seed: 123, id: 'bang' },
  ],
  surprised: () => [
    { t: 'line', d: P('M33 50 Q39 45 45 49 M55 49 Q61 45 67 50'), sw: 0.75, seed: 124 },
    { t: 'dot', d: ellipse(39, 60, 4.1, 4.8), seed: 125, id: 'eyes' },
    { t: 'dot', d: ellipse(61, 60, 4.1, 4.8), seed: 126, id: 'eyes' },
    { t: 'line', d: ellipse(50, 74, 3.6, 4.4), sw: 0.9, seed: 127, id: 'mouth' },
  ],
  // 担心（站主 2026-11-08 要的第 9 张：今日简报说有烦心事的那一小时）：出错那张去掉红色「!」，皱眉、嘴有点歪
  worried: () => FACE_PARTS.error().filter((x) => x.id !== 'bang'),
  wow: () => [
    { t: 'dot', d: sparkle(39, 60, 6.2), seed: 128, id: 'eyes' },
    { t: 'dot', d: sparkle(61, 60, 6.2), seed: 129, id: 'eyes' },
    { t: 'line', d: ellipse(50, 74, 5.6, 5.2), sw: 0.9, seed: 130, id: 'mouth' },
    { t: 'shape', d: sparkle(15, 34, 6.5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 131, id: 'st1' },
    { t: 'shape', d: sparkle(87, 38, 4.6), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 132, id: 'st2' },
    { t: 'shape', d: sparkle(82, 17, 3.6), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 133, id: 'st2' },
  ],
};

/** 柚子：身子（茎、叶、身子、高光、腮红）加一张脸。墨色只用实心小点，不和错开的填色叠在一起。 */
export function pomelo(face = 'normal') {
  return {
    name: '柚子', cat: 'orange', parts: [
      { t: 'line', d: P('M50 19 L48 11'), sw: 1, seed: 80 },
      { t: 'shape', d: LEAF, fill: 'leaf', seed: 81 },
      { t: 'line', d: P('M55 17 C59 13 64 9 69 7'), sw: 0.6, seed: 82 },
      { t: 'shape', d: BODY, fill: 'yellow', seed: 83, id: 'body' },
      { t: 'line', d: P('M23 53 C24 46 28 40 33 36'), sw: 1.3, color: 'white', withFill: true, seed: 84 },
      { t: 'blush', d: ellipse(29, 71, 5.6, 3.4), seed: 85 },
      { t: 'blush', d: ellipse(71, 71, 5.6, 3.4), seed: 86 },
      ...FACE_PARTS[face](),
    ],
  };
}
/** 柚子的视口：脸上伸出去的想法泡泡、星星、「!」、z 都在里面。 */
export const POMELO_VIEW = '-6 -6 112 108';

/**
 * 柚子贴纸撕起来以后留下的「印子」（小彩蛋：撕起简报角上的柚子贴纸，底下有句悄悄话）：和贴纸一样的外形（含白边），
 * 铺柚子橙的浅色，沿外沿一圈虚线像模切的印子；外沿比贴纸收进一点，贴着时被贴纸整个盖住，撕起来才看见。
 * 照 Phase 2 定稿的 pomeloGhost（canvases/pomelo-explore/p2-final/art.mjs，站主 2026-11-05 验收），字不在图里，界面写在印子上。
 */
export function pomeloGhost(ctx, { k = 1.25, dash = '5 4.5', ring = 2.2, inset = 1 } = {}) {
  const st = ctx.st;
  // 身子排第一（茎、叶、高光跟着），腮红不要
  const parts = pomelo('normal').parts.slice(0, 7).filter((p) => p.t !== 'blush').sort((a, b) => (b.id === 'body') - (a.id === 'body'));
  const off = st.off.map((v) => v * k);
  const bw = st.border * k;
  const w = 2 * (bw + Math.max(Math.abs(off[0]), Math.abs(off[1])) * 0.6) - inset * 2;
  const fill = ctx.V('cat-orange-tint'), line = ctx.V('pen');
  const shape = (p, color, sw, dashed) => {
    const da = dashed ? ` stroke-dasharray="${dash}"` : '';
    return p.t === 'line'
      ? `<path d="${handStroke(p.d, { amp: st.amp * k * 0.6, seed: p.seed, sp: st.sp ?? 0.9 })}" fill="none" stroke="${color}" stroke-width="${f(st.line * k * (p.sw ?? 0.8) + sw)}" stroke-linecap="round" stroke-linejoin="round"${da}></path>`
      : `<path d="${handFill(p.d, { amp: st.fillAmp * k, seed: p.seed, sp: st.sp ?? 0.9 })}" fill="${dashed ? 'none' : color}" stroke="${color}" stroke-width="${f(sw)}" stroke-linejoin="round"${da}></path>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="96" viewBox="${POMELO_VIEW}" role="img" aria-label="柚子贴纸的印子"><g class="ghost-ring">${parts.map((p) => shape(p, line, w, true)).join('')}</g><g>${parts.map((p) => shape(p, fill, w - ring * 2, false)).join('')}</g></svg>\n`;
}

// ---------- AI 按钮：柚子探出头，旁边一个小对话泡泡 ----------
export function aiButton() {
  const p = pomelo('normal');
  return {
    name: '问柚子', cat: 'orange', parts: [
      ...p.parts,
      { t: 'shape', d: P('M84 8 L100 8 Q108 8 108 16 L108 22 Q108 30 100 30 L92 30 L85 36.5 L86 30 L84 30 Q76 30 76 22 L76 16 Q76 8 84 8 Z'), fill: 'white', sw: 0.75, amp: 0.5, seed: 321, id: 'bubble' },
      { t: 'dot', d: circle(84.5, 19, 2.3), seed: 322, id: 'bubble' },
      { t: 'dot', d: circle(92, 19, 2.3), seed: 323, id: 'bubble' },
      { t: 'dot', d: circle(99.5, 19, 2.3), seed: 324, id: 'bubble' },
    ],
  };
}
export const AI_VIEW = '6 -4 110 110';

// ---------- 菜单栏：单色的柚子，做成 macOS 的模板图（只用黑和透明） ----------
// 遮罩里的 white / black 只表示留下和挖掉，不是颜色。
// solid 实心（本地模型就绪），眼睛和嘴挖空；hollow 空心（没在运行），身子描一圈边，叶子、眼睛是实心的。
// 视口 18 × 18 个点：柚子占 16 个点高（菜单栏的图按 18 个点高显示，tray-icon 0.25 的做法）。
export function menuGlyph(kind) {
  const eyes = handFill(ellipse(38.5, 60, 5.6, 6.4), { amp: 0.1, seed: 3 }) + handFill(ellipse(61.5, 60, 5.6, 6.4), { amp: 0.1, seed: 4 });
  const mouth = handStroke(P('M43 71.5 Q50 78.5 57 71.5'), { amp: 0.3, seed: 5 });
  const shape = handFill(BODY, { amp: 0.4, seed: 1 }) + handFill(LEAF, { amp: 0.3, seed: 2 });
  const ring = handStroke(BODY, { amp: 1.1, seed: 1, over: 0.04 });
  const leaf = handFill(LEAF, { amp: 0.3, seed: 2 });
  // 柚子的外形大约 x 10–90、y 2–94：放进 18 格里高 16、居中
  const s = 16 / 92, tx = 9 - 50 * s, ty = 1 - 2 * s;
  const g = (inner) => `<g transform="translate(${f(tx * 100) / 100} ${f(ty * 100) / 100}) scale(${s.toFixed(5)})">${inner}</g>`;
  const body = kind === 'solid'
    ? `<defs><mask id="pm-menu-solid-m" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><path d="${shape}" fill="white"></path><path d="${eyes}" fill="black"></path><path d="${mouth}" fill="none" stroke="black" stroke-width="7" stroke-linecap="round"></path></mask></defs><rect x="0" y="0" width="100" height="100" fill="currentColor" mask="url(#pm-menu-solid-m)"></rect>`
    : `<path d="${ring}" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path><path d="${leaf}" fill="currentColor"></path><path d="${eyes}" fill="currentColor"></path><path d="${mouth}" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"></path>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">${g(body)}</svg>\n`;
}

// ---------- App 图标（1024 格，macOS 的图标网格：824 的连续圆角方块，四周留 100） ----------
// 连续圆角（squircle）：每个角从边上 1.528665 r 处开始弯，照 iOS / macOS 的圆角做法。
function squircle(x, y, w, h, r) {
  const k = [1.52866483, 1.08849299, 0.86840701, 0.63149379, 0.074911, 0.37282392, 0.16905899];
  const [a, b, c, d, e, g, hh] = k.map((v) => v * r);
  const x1 = x + w, y1 = y + h;
  const n = (v) => f(v);
  return [
    `M${n(x + a)} ${n(y)}`, `L${n(x1 - a)} ${n(y)}`,
    `C${n(x1 - b)} ${n(y)} ${n(x1 - c)} ${n(y)} ${n(x1 - d)} ${n(y + e)}`,
    `C${n(x1 - g)} ${n(y + hh)} ${n(x1 - hh)} ${n(y + g)} ${n(x1 - e)} ${n(y + d)}`,
    `C${n(x1)} ${n(y + c)} ${n(x1)} ${n(y + b)} ${n(x1)} ${n(y + a)}`,
    `L${n(x1)} ${n(y1 - a)}`,
    `C${n(x1)} ${n(y1 - b)} ${n(x1)} ${n(y1 - c)} ${n(x1 - e)} ${n(y1 - d)}`,
    `C${n(x1 - hh)} ${n(y1 - g)} ${n(x1 - g)} ${n(y1 - hh)} ${n(x1 - d)} ${n(y1 - e)}`,
    `C${n(x1 - c)} ${n(y1)} ${n(x1 - b)} ${n(y1)} ${n(x1 - a)} ${n(y1)}`,
    `L${n(x + a)} ${n(y1)}`,
    `C${n(x + b)} ${n(y1)} ${n(x + c)} ${n(y1)} ${n(x + d)} ${n(y1 - e)}`,
    `C${n(x + g)} ${n(y1 - hh)} ${n(x + hh)} ${n(y1 - g)} ${n(x + e)} ${n(y1 - d)}`,
    `C${n(x)} ${n(y1 - c)} ${n(x)} ${n(y1 - b)} ${n(x)} ${n(y1 - a)}`,
    `L${n(x)} ${n(y + a)}`,
    `C${n(x)} ${n(y + b)} ${n(x)} ${n(y + c)} ${n(x + e)} ${n(y + d)}`,
    `C${n(x + hh)} ${n(y + g)} ${n(x + g)} ${n(y + hh)} ${n(x + d)} ${n(y + e)}`,
    `C${n(x + c)} ${n(y)} ${n(x + b)} ${n(y)} ${n(x + a)} ${n(y)}`, 'Z',
  ].join('');
}
export const APP_TILE = squircle(100, 100, 824, 824, 185.4);

/** 胶带：两端锯齿的斜条纹，宽 w、高 h，中心在 (0, 0)。 */
function tapePath(w, h, teeth = 5, depth = 12) {
  const hw = w / 2, hh = h / 2, step = h / teeth;
  let d = `M${-hw} ${-hh} L${hw} ${-hh}`;
  for (let i = 1; i <= teeth; i++) d += ` L${f(hw + (i % 2 ? depth : 0))} ${f(-hh + step * i - step / 2)} L${hw} ${f(-hh + step * i)}`;
  d += ` L${-hw} ${hh}`;
  for (let i = teeth - 1; i >= 0; i--) d += ` L${f(-hw - ((teeth - i) % 2 ? depth : 0))} ${f(-hh + step * i + step / 2)} L${-hw} ${f(-hh + step * i)}`;
  return d + ' Z';
}

/**
 * App 图标的几种底：grid 方格纸（蓝笔的纸色和方格）、mint 薄荷桌面、kraft 牛皮纸。
 * ctx.V(role) 给颜色（CSS 变量）；ctx.sticker(art, opts) 画贴纸，返回 { defs, html }。
 */
export const APP_VARIANTS = {
  grid: { name: '方格纸', bg: 'paper', lines: 'grid', tape: ['tape-mint-a', 'tape-mint-b'] },
  mint: { name: '薄荷桌面', bg: 'cat-mint-sticker', lines: null, tape: ['tape-yuzu-a', 'tape-yuzu-b'] },
  kraft: { name: '牛皮纸', bg: 'kraft', lines: null, tape: ['tape-mint-a', 'tape-mint-b'] },
};
export function appIcon(variant, ctx) {
  const v = APP_VARIANTS[variant];
  const id = `pm-app-${variant}`;
  const grid = [];
  if (v.lines) for (let p = 100 + 64; p < 924; p += 64) grid.push(`M${p} 100 L${p} 924 M100 ${p} L924 ${p}`);
  const pm = ctx.sticker(pomelo('normal'), { k: 1.15, idp: `${id}-p` });
  const tape = `<g transform="translate(286 292) rotate(-38)"><path d="${tapePath(330, 66)}" fill="url(#${id}-tp)" opacity=".9"></path></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-label="柚儿园">
<defs>${pm.defs}<clipPath id="${id}-sq"><path d="${APP_TILE}"></path></clipPath><filter id="${id}-ds" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="${ctx.V('art-shadow')}" flood-opacity=".8"></feDropShadow></filter><pattern id="${id}-tp" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="28" height="28" fill="${ctx.V(v.tape[0])}"></rect><rect width="14" height="28" fill="${ctx.V(v.tape[1])}"></rect></pattern></defs>
<path d="${APP_TILE}" fill="${ctx.V(v.bg)}" filter="url(#${id}-ds)"></path>
<g clip-path="url(#${id}-sq)">${v.lines ? `<path d="${grid.join('')}" stroke="${ctx.V(v.lines)}" stroke-width="4" fill="none"></path>` : ''}
<g transform="translate(512 556) rotate(-7) scale(6.2) translate(-50 -56)">${pm.html}</g>${tape}</g>
</svg>
`;
}

/**
 * 方案的资产清单，给 tooling/handmade/marks.mjs。ctx：
 *   ctx.svg(art, { view, size, idp, label })   一张贴纸的整份 SVG（颜色是 CSS 变量）
 *   ctx.sticker(art, opts)                      贴纸的 { defs, html }
 *   ctx.V(role)                                 角色的 CSS 变量
 */
// ---------- 空状态插图（Dawn Plan · Phase 5）：一页还空着时，一张小插图配一句俏皮话，不写使用提示 ----------
// 画法同模块贴纸，但每样东西一张白边、各成一组（<g class="pt 名字 动作" style="--i:第几个">），墨线带 pathLength，
// 动效零件 motion/empty-state 按组一笔笔画出来、再一样样弹一下。几何在 240 × 150 里，东西都站在 y ≈ 132 这条线上。
// 话取 Phase 2 小样的文案（canvases/pomelo-explore/p2-final/content.mjs，站主 2026-11-05 验收）；书架和投石问路的图也取自 Phase 2。
// 组名后面的词是动作（empty-state.css）：hop 跳一下、tip 歪一下、sway 晃一晃、swing 吊着荡、flap 盖子打开、rise 冒上来、twinkle 闪一下、echo 一圈圈荡开；不写就是弹一下。
const R = (role) => `var(--pm-${role}, var(--color-${role}))`;
/** 一组零件挪一下（Phase 2 的图换到这里的坐标）。 */
const shift = (parts, dx, dy) => parts.map((p) => ({ ...p, d: move(p.d, dx, dy) }));

function emptyBooks() {
  return shift([
    { t: 'shape', d: rrect(8, 104, 224, 10, 3), fill: 'wood', seed: 201, id: 'plank' },
    { t: 'shape', d: rrect(38, 40, 25, 64, 3), fill: 'cat', seed: 202, id: 'book1' },
    { t: 'line', d: P('M39 52 L62 52 M39 92 L62 92'), sw: 0.8, seed: 203, id: 'book1' },
    { t: 'shape', d: rotate(rrect(70, 50, 22, 54, 3), 70, 104, 16), fill: R('cat-sky'), seed: 204, id: 'book2 tip' },
    { t: 'shape', d: P('M121 90 L104 77 L106 103 Z'), fill: 'yellow', seed: 206, id: 'fish hop' },
    { t: 'shape', d: P('M120 90 C133 75 161 75 177 90 C161 105 133 105 120 90 Z'), fill: 'yellow', seed: 205, id: 'fish hop' },
    { t: 'line', d: P('M144 81 Q150 74 157 80'), sw: 0.8, seed: 207, id: 'fish hop' },
    { t: 'dot', d: circle(165, 87, 2.6), seed: 208, id: 'fish hop' },
    { t: 'shape', d: P('M197 84 C190 74 190 65 196 58 C201 66 202 76 197 84 Z'), fill: 'leaf', seed: 209, id: 'plant' },
    { t: 'shape', d: P('M197 84 C204 75 212 73 219 75 C215 84 206 86 197 84 Z'), fill: 'leaf', seed: 210, id: 'plant' },
    { t: 'shape', d: P('M186 104 L183 84 L211 84 L208 104 Z'), fill: R('cat-orange'), seed: 211, id: 'plant' },
  ], 0, 18);
}

function emptyJobs() {
  return shift([
    { t: 'shape', d: ellipse(122, 98, 62, 15), fill: R('cat-sky-sticker'), seed: 1801, id: 'pond' },
    { t: 'line', d: ellipse(122, 98, 38, 8.4), sw: 0.6, seed: 1802, id: 'pond' },
    { t: 'line', d: ellipse(122, 98, 16, 3.4), sw: 0.6, seed: 1803, id: 'pond' },
    { t: 'shape', d: P('M18 104 C16 93 25 84 37 84 C49 84 57 91 56 99 C55 106 47 108 37 108 C27 108 19 107 18 104 Z'), fill: 'catLight', seed: 1804, id: 'pebble hop' },
    { t: 'line', d: P('M27 92 C29 89 32 88 35 88'), sw: 0.7, color: 'white', withFill: true, seed: 1805, id: 'pebble hop' },
    { t: 'line', d: P('M212 110 L213 60'), sw: 1, seed: 1806, id: 'sign sway' },
    { t: 'shape', d: rotate(rrect(186, 44, 56, 24, 5), 213, 56, -5), fill: 'wood', seed: 1807, id: 'sign sway' },
    { t: 'line', d: rotate(P('M197 56 L229 56 M220 49 L229 56 L220 63'), 213, 56, -5), sw: 0.85, seed: 1808, id: 'sign sway' },
    { t: 'line', d: P('M196 110 L199 101 M202 110 L202 99 M208 110 L205 102 M64 106 L66 98 M70 106 L70 96'), sw: 0.7, seed: 1809, id: 'grass' },
  ], -6, 22);
}

function emptyTodo() {
  const card = (d) => rotate(d, 59, 130, -7);
  return [
    { t: 'shape', d: card(rrect(26, 46, 66, 84, 6)), fill: 'white', seed: 2001, id: 'card' },
    { t: 'line', d: card(rrect(38, 62, 12, 12, 3)), sw: 0.65, seed: 2002, id: 'card' },
    { t: 'line', d: card(rrect(38, 88, 12, 12, 3)), sw: 0.65, seed: 2003, id: 'card' },
    { t: 'shape', d: ellipse(152, 128, 50, 8.5), fill: 'catLight', seed: 2004, id: 'saucer' },
    { t: 'line', d: P('M186 88 C202 86 204 107 182 111'), sw: 1.1, seed: 2005, id: 'cup' },
    { t: 'shape', d: P('M116 80 L188 80 C188 106 174 124 152 124 C130 124 116 106 116 80 Z'), fill: 'cat', seed: 2006, id: 'cup' },
    { t: 'shape', d: ellipse(152, 80, 36, 6), fill: 'wood', sw: 0.8, seed: 2007, id: 'cup' },
    { t: 'line', d: P('M124 91 C125 102 129 110 136 115'), sw: 1, color: 'white', withFill: true, seed: 2008, id: 'cup' },
    { t: 'line', d: P('M140 80 C134 65 121 64 118 79'), sw: 0.6, seed: 2009, id: 'cup' },
    { t: 'shape', d: rrect(110, 79, 15, 17, 3), fill: 'yellow', sw: 0.8, seed: 2010, id: 'cup' },
    { t: 'line', d: P('M140 66 C133 58 146 52 139 42 M162 64 C155 56 168 50 161 40'), sw: 0.85, seed: 2011, id: 'steam rise' },
    { t: 'shape', d: circle(214, 122, 13), fill: 'wood', seed: 2012, id: 'cookie hop' },
    { t: 'dot', d: circle(209, 117, 2.3), seed: 2013, id: 'cookie hop' },
    { t: 'dot', d: circle(220, 120, 2.1), seed: 2014, id: 'cookie hop' },
    { t: 'dot', d: circle(212, 127, 1.9), seed: 2015, id: 'cookie hop' },
  ];
}

function emptyNotes() {
  const note = (d) => rotate(d, 72, 128, -6);
  const quill = (d) => move(scale(d, 1.3, 0, 0), 70, 56);
  const rib = [[163, 86], [172, 77], [182, 75], [192, 77], [201, 86]].map(([x, y]) => `M182 126 L${x} ${y}`).join(' ');
  return [
    { t: 'shape', d: note(rrect(30, 40, 84, 88, 4)), fill: 'catLight', seed: 2101, id: 'note' },
    { t: 'shape', d: note(rotate(rrect(52, 32, 36, 13, 2), 70, 38, -8)), fill: 'yellow', sw: 0.7, seed: 2102, id: 'note' },
    { t: 'shape', d: quill(P('M53 8 C41 9 23 22 18 44 L20 49 C37 47 52 31 53 8 Z')), fill: 'cat', seed: 2103, id: 'quill sway' },
    { t: 'line', d: quill(P('M53 8 C43 21 31 35 11 57')), sw: 0.9, seed: 2104, id: 'quill sway' },
    { t: 'line', d: quill(P('M30 31 L24 27 M38 23 L33 18')), sw: 0.7, seed: 2105, id: 'quill sway' },
    { t: 'dot', d: quill(ellipse(10, 58.5, 2.6, 2)), seed: 2106, id: 'quill sway' },
    { t: 'shape', d: P('M170 124 L194 124 L192 135 L172 135 Z'), fill: R('cat-orange-sticker'), seed: 2107, id: 'shell' },
    { t: 'shape', d: P('M182 130 C171 130 156 113 152 98 C148 82 164 72 182 72 C200 72 216 82 212 98 C208 113 193 130 182 130 Z'), fill: R('cat-orange-sticker'), seed: 2108, id: 'shell' },
    { t: 'line', d: P(rib), sw: 0.6, seed: 2109, id: 'shell' },
    { t: 'line', d: P('M216 72 C223 76 226 85 222 93 M226 62 C237 69 240 88 231 100'), sw: 0.8, seed: 2110, id: 'echo' },
  ];
}

function emptyDays() {
  const dots = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) dots.push({ t: 'dot', d: circle(66 + j * 17, 86 + i * 14, 2.7), color: R('cat-mint-sticker'), seed: 2210 + i * 5 + j, id: 'cal' });
  return [
    { t: 'shape', d: rrect(50, 50, 100, 82, 8), fill: 'white', seed: 2201, id: 'cal' },
    { t: 'shape', d: P('M50 60 Q50 50 60 50 L140 50 Q150 50 150 60 L150 72 L50 72 Z'), fill: 'cat', seed: 2202, id: 'cal' },
    { t: 'line', d: P('M76 42 L76 57 M124 42 L124 57'), sw: 1.2, seed: 2203, id: 'cal' },
    ...dots,
    { t: 'line', d: P('M190 87 C182 100 200 110 190 120 C185 126 178 128 170 131'), sw: 0.7, seed: 2230, id: 'balloon sway' },
    { t: 'shape', d: P('M186 81 L194 81 L190 88 Z'), fill: 'heart', sw: 0.7, amp: 0.5, seed: 2231, id: 'balloon sway' },
    { t: 'shape', d: ellipse(190, 57, 21, 25), fill: 'heart', seed: 2232, id: 'balloon sway' },
    { t: 'line', d: P('M180 47 C181 41 185 37 190 36'), sw: 1, color: 'white', withFill: true, seed: 2233, id: 'balloon sway' },
    { t: 'shape', d: sparkle(222, 102, 9), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 2234, id: 'spark twinkle' },
    { t: 'shape', d: sparkle(210, 123, 5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 2235, id: 'spark twinkle' },
  ];
}

function emptyPacking() {
  const tag = (d) => rotate(d, 33, 106, 8);
  const hat = (d) => rotate(d, 211, 124, -8);
  return [
    { t: 'shape', d: P('M64 92 L72 44 Q73 37 80 37 L158 37 Q165 37 166 44 L174 92 Z'), fill: 'cat', seed: 2301, id: 'lid flap' },
    { t: 'shape', d: P('M74 90 L80 51 Q81 47 85 47 L153 47 Q157 47 158 51 L164 90 Z'), fill: 'catLight', sw: 0.8, seed: 2302, id: 'lid flap' },
    { t: 'line', d: P('M86 60 L152 60 L150 74 L88 74 Z'), sw: 0.55, seed: 2303, id: 'lid flap' },
    { t: 'shape', d: P('M56 92 L182 92 L180 104 L58 104 Z'), fill: 'catLight', seed: 2304, id: 'base' },
    { t: 'shape', d: rrect(52, 102, 134, 31, 8), fill: 'cat', seed: 2305, id: 'base' },
    { t: 'shape', d: rrect(80, 98, 11, 10, 2.5), fill: 'yellow', sw: 0.7, amp: 0.5, seed: 2306, id: 'base' },
    { t: 'shape', d: rrect(147, 98, 11, 10, 2.5), fill: 'yellow', sw: 0.7, amp: 0.5, seed: 2307, id: 'base' },
    { t: 'line', d: P('M55 104 C45 103 38 102 34 108'), sw: 0.6, seed: 2308, id: 'tag swing' },
    { t: 'shape', d: tag(rrect(24, 106, 18, 24, 4)), fill: 'yellow', sw: 0.8, seed: 2309, id: 'tag swing' },
    { t: 'dot', d: tag(circle(33, 112, 2.2)), color: 'white', seed: 2310, id: 'tag swing' },
    { t: 'shape', d: hat(ellipse(211, 124, 30, 7)), fill: 'wood', seed: 2311, id: 'hat hop' },
    { t: 'shape', d: hat(P('M199 123 C199 103 223 103 223 123 Z')), fill: 'wood', seed: 2312, id: 'hat hop' },
    { t: 'line', d: hat(P('M199.5 119 C206 117 216 117 222.5 119')), sw: 1.4, color: 'heart', seed: 2313, id: 'hat hop' },
    { t: 'line', d: hat(P('M222 119 C228 121 231 126 236 129')), sw: 1.1, color: 'heart', seed: 2314, id: 'hat hop' },
  ];
}

/** 一粒爆米花：三瓣的小云朵，中心 (x, y)。 */
const kernel = (x, y, k = 1, rot = 0) => rotate(scale(move(P('M-8 4 C-12 4 -13 -2 -9 -4 C-10 -9 -4 -11 -1 -8 C1 -12 8 -11 8 -6 C12 -5 12 2 7 3 C5 7 -5 7 -8 4 Z'), x, y), k, x, y), x, y, rot);

function emptyFilms() {
  const tk = (d) => rotate(d, 62, 96, -10);
  const stripe = (u0, u1) => P(`M${f(120 + 70 * u0)} 80 L${f(120 + 70 * u1)} 80 L${f(130 + 50 * u1)} 131 L${f(130 + 50 * u0)} 131 Z`);
  return [
    { t: 'shape', d: tk(P('M24 78 L100 78 L100 90 C95 90 95 102 100 102 L100 114 L24 114 L24 102 C29 102 29 90 24 90 Z')), fill: 'yellow', seed: 2401, id: 'ticket' },
    { t: 'line', d: tk(P('M80 82 L80 87 M80 93 L80 99 M80 105 L80 110')), sw: 0.6, seed: 2402, id: 'ticket' },
    { t: 'shape', d: tk(star(52, 96, 8)), fill: 'heart', sw: 0.6, amp: 0.4, seed: 2403, id: 'ticket' },
    ...[[132, 72, 11], [148, 63, 12], [165, 65, 12], [180, 73, 10], [156, 76, 11]].map(([x, y, r], i) => ({ t: 'shape', d: circle(x, y, r), fill: 'white', sw: 0.8, seed: 2410 + i, id: 'puff' })),
    { t: 'dot', d: circle(146, 60, 2.2), color: 'yellow', seed: 2416, id: 'puff' },
    { t: 'dot', d: circle(168, 63, 2), color: 'yellow', seed: 2417, id: 'puff' },
    { t: 'shape', d: P('M120 80 L190 80 L180 132 L130 132 Z'), fill: 'white', seed: 2420, id: 'bucket' },
    { t: 'shape', d: stripe(0.13, 0.27), fill: 'cat', sw: 0.6, seed: 2421, id: 'bucket' },
    { t: 'shape', d: stripe(0.43, 0.57), fill: 'cat', sw: 0.6, seed: 2422, id: 'bucket' },
    { t: 'shape', d: stripe(0.73, 0.87), fill: 'cat', sw: 0.6, seed: 2423, id: 'bucket' },
    { t: 'shape', d: rrect(115, 75, 80, 11, 4), fill: 'cat', seed: 2424, id: 'bucket' },
    { t: 'shape', d: kernel(206, 125, 1), fill: 'white', sw: 0.8, seed: 2430, id: 'corn hop' },
    { t: 'shape', d: kernel(224, 117, 0.85, 30), fill: 'white', sw: 0.8, seed: 2431, id: 'corn hop' },
    { t: 'dot', d: circle(203, 123, 1.9), color: 'yellow', seed: 2432, id: 'corn hop' },
  ];
}

function emptyVault() {
  const seed = (x, y, rot) => rotate(move(P('M0 -7 C4 -4 5 2 0 7 C-5 2 -4 -4 0 -7 Z'), x, y), x, y, rot);
  const key = (d) => rotate(d, 205, 121, -16);
  return [
    { t: 'shape', d: P('M80 132 L80 76 C80 44 160 44 160 76 L160 132 Z'), fill: 'catLight', seed: 2501, id: 'door' },
    { t: 'shape', d: P('M91 132 L91 78 C91 56 149 56 149 78 L149 132 Z'), fill: 'cat', seed: 2502, id: 'door' },
    { t: 'line', d: P('M110 62 L110 132 M130 60 L130 132'), sw: 0.6, seed: 2503, id: 'door' },
    { t: 'dot', d: P('M140 93 C136.5 93 134.5 95.5 134.5 98.5 C134.5 100.5 135.5 102 137 103 L136 109 L144 109 L143 103 C144.5 102 145.5 100.5 145.5 98.5 C145.5 95.5 143.5 93 140 93 Z'), seed: 2504, id: 'door' },
    { t: 'shape', d: seed(36, 125, -35), fill: 'white', sw: 0.6, amp: 0.5, seed: 2510, id: 'seeds' },
    { t: 'shape', d: seed(54, 129, 25), fill: 'white', sw: 0.6, amp: 0.5, seed: 2511, id: 'seeds' },
    { t: 'shape', d: seed(46, 110, 70), fill: 'white', sw: 0.6, amp: 0.5, seed: 2512, id: 'seeds' },
    { t: 'shape', d: key(rrect(196, 117.5, 31, 7, 2.5)), fill: 'yellow', sw: 0.8, seed: 2520, id: 'key hop' },
    { t: 'shape', d: key(rrect(214, 123, 5, 8, 1.5)), fill: 'yellow', sw: 0.7, seed: 2521, id: 'key hop' },
    { t: 'shape', d: key(rrect(221, 123, 5, 10, 1.5)), fill: 'yellow', sw: 0.7, seed: 2522, id: 'key hop' },
    { t: 'shape', d: key(circle(187, 121, 11)), fill: 'yellow', seed: 2523, id: 'key hop' },
    { t: 'dot', d: key(circle(187, 121, 3.4)), color: 'white', seed: 2524, id: 'key hop' },
    { t: 'shape', d: sparkle(178, 60, 9), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 2530, id: 'spark twinkle' },
    { t: 'shape', d: sparkle(193, 79, 5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 2531, id: 'spark twinkle' },
  ];
}

/** 8 张空状态插图：key → 模块、名字、那句话、主色（模块的分类色）。order 是弹出来的先后（不写就按画的先后）。 */
export const EMPTY = {
  todo: { module: 'todo', name: '一步一步', line: '今天没有安排，喝杯茶吧', cat: 'mint', art: emptyTodo },
  notes: { module: 'notes', name: '念念不忘', line: '念念不忘，必有回响', cat: 'mint', art: emptyNotes },
  days: { module: 'days', name: '来日方长', line: '来日方长，日子还空着', cat: 'mint', art: emptyDays },
  packing: { module: 'packing', name: '出门走走', line: '行李箱还空着', cat: 'mint', art: emptyPacking, order: ['base', 'lid', 'tag', 'hat'] },
  books: { module: 'books', name: '摸鱼读读', line: '书架空空，去摸会儿鱼吧', cat: 'pink', art: emptyBooks },
  films: { module: 'films', name: '好奇看看', line: '还没看什么，挑一部吧', cat: 'pink', art: emptyFilms, order: ['ticket', 'bucket', 'puff', 'corn'] },
  jobs: { module: 'jobs', name: '投石问路', line: '路还没开始问', cat: 'grape', art: emptyJobs },
  vault: { module: 'vault', name: '芝麻开门', line: '芝麻还没开过门', cat: 'sky', art: emptyVault, order: ['door', 'key', 'seeds', 'spark'] },
};
export const EMPTY_ORDER = Object.keys(EMPTY);
/** 插图的视口和大小：240 × 150 的图，左右各留 8 给白边和投影。取样放稀一倍（sp 1.8，同 Phase 2 的空书架），文件小一半。 */
export const EMPTY_VIEW = '-8 0 256 150';
export const EMPTY_SIZE = 256;
/** 一张空状态插图的图形（给 ctx.svg / sticker 用）。 */
export const emptyArt = (key) => ({ name: EMPTY[key].name, cat: EMPTY[key].cat, parts: EMPTY[key].art(), ...(EMPTY[key].order ? { order: EMPTY[key].order } : {}) });

export function assets(ctx) {
  const out = [];
  for (const face of FACES) {
    out.push({
      id: `pomelo-${face}`, title: `柚子 · ${FACE_NAMES[face]}`, file: `pomelo/pomelo-${face}.svg`, colorMode: 'roles',
      svg: ctx.svg(pomelo(face), { view: POMELO_VIEW, size: 100, k: 1.25, idp: `pm-${face}-`, label: `柚子 · ${FACE_NAMES[face]}` }),
      notes: '柚子的静态帧，100 格。表情动画在 Phase 5。',
    });
  }
  out.push({
    id: 'pomelo-worried', title: '柚子 · 担心', file: 'pomelo/pomelo-worried.svg', colorMode: 'roles',
    svg: ctx.svg(pomelo('worried'), { view: POMELO_VIEW, size: 100, k: 1.25, idp: 'pm-worried-', label: '柚子 · 担心' }),
    notes: '第 9 张脸（站主 2026-11-08 要的）：Pomelo 的心情「担心」（今日简报说有烦心事）。出错那张去掉红色「!」。',
  });
  out.push({
    id: 'pomelo-ghost', title: '柚子 · 撕起来以后的印子', file: 'pomelo/pomelo-ghost.svg', colorMode: 'roles',
    svg: pomeloGhost(ctx),
    notes: '小彩蛋：简报角上的柚子贴纸撕起来，底下是这块印子，悄悄话写在印子上（界面写字）。和柚子 100 格一样大，贴纸盖住时看不见。照 Phase 2 定稿。',
  });
  out.push({
    id: 'ai-button', title: 'AI 按钮 · 问柚子', file: 'pomelo/ai-button.svg', colorMode: 'roles',
    svg: ctx.svg(aiButton(), { view: AI_VIEW, size: 110, k: 1.25, idp: 'pm-ai-', label: '问柚子' }),
    notes: '顶栏右边的「问柚子」（⌘J），换掉小鸟。',
  });
  for (const kind of ['solid', 'hollow']) {
    out.push({
      id: `menu-${kind}`, title: kind === 'solid' ? '菜单栏 · 实心（模型就绪）' : '菜单栏 · 空心（没在运行）', file: `pomelo/menu-${kind}.svg`,
      colorMode: 'currentColor', colorRole: 'ink', svg: menuGlyph(kind),
      renders: [{ size: 36, suffix: 'template', color: '#000000' }],
      notes: 'macOS 菜单栏的模板图：只用黑和透明，系统按菜单栏的明暗上色。36 像素（18 个点 @2x），柚子占 16 个点高。',
    });
  }
  for (const variant of Object.keys(APP_VARIANTS)) {
    out.push({
      id: `app-icon-${variant}`, title: `App 图标 · ${APP_VARIANTS[variant].name}`, file: `app-icon/app-icon-${variant}.svg`, colorMode: 'roles',
      svg: appIcon(variant, ctx), renders: [{ size: 1024, themes: ['light'], palette: 'blue' }],
      notes: '1024 源图，macOS 的图标网格（824 连续圆角，四周 100）。颜色按蓝笔浅色定死在 PNG 里。三种底，站主挑一种。',
    });
  }
  for (const id of MODULE_ORDER) {
    const icon = MODULE_ICONS[id];
    out.push({
      id: `module-${id}`, title: `模块 · ${icon.name}`, file: `modules/${id}.svg`, colorMode: 'roles',
      svg: ctx.svg(icon, { view: '-8 -8 80 80', size: 64, k: 1, idp: `pm-m-${id}-`, label: icon.name, tint: true }),
      category: icon.cat,
      notes: `${CATEGORY_NAMES[icon.cat]} · ${icon.cat}；外面设 --mark-color、--mark-color-soft 能换成别的分类色`,
    });
  }
  for (const id of LIBRARY_ORDER) {
    const icon = LIBRARY_ICONS[id];
    out.push({
      id: `module-${id}`, title: `贴纸 · ${icon.name}`, file: `modules/${id}.svg`, colorMode: 'roles',
      svg: ctx.svg(icon, { view: '-8 -8 80 80', size: 64, k: 1, idp: `pm-m-${id}-`, label: icon.name, tint: true }),
      category: icon.cat,
      notes: `通用贴纸，默认${CATEGORY_NAMES[icon.cat]}色（${icon.cat}）；任何模块都能选，颜色能换`,
    });
  }
  for (const id of PLACE_ORDER) {
    const icon = PLACE_ICONS[id];
    out.push({
      id: `place-${id}`, title: `贴纸 · ${icon.name}`, file: `places/${id}.svg`, colorMode: 'roles',
      svg: ctx.svg(icon, { view: '-8 -8 80 80', size: 64, k: 1, idp: `pm-p-${id}-`, label: icon.name, tint: true }),
      category: icon.cat,
      notes: `${icon.name}不是模块，没有「图标和颜色」；叠在桌上、列在「桌上开着」时用这张（${CATEGORY_NAMES[icon.cat]}色）`,
    });
  }
  for (const id of UI_ICON_ORDER) {
    const icon = UI_ICONS[id];
    out.push({
      id: `icon-${id}`, title: `图标 · ${icon.name}`, file: `icons/${id}.svg`, colorMode: 'currentColor', colorRole: 'ink',
      svg: uiIconSvg(id, ctx.tokens.handmade.uiIcon),
      notes: icon.for.length ? `界面小图标，第 ${icon.batch} 批；替换 Lucide 的 ${icon.for.join('、')}` : `界面小图标，第 ${icon.batch} 批；外框自己的`,
    });
  }
  for (const key of EMPTY_ORDER) {
    const e = EMPTY[key];
    out.push({
      id: `empty-${key}`, title: `空状态 · ${e.name}`, file: `empty/${key}.svg`, colorMode: 'roles',
      svg: ctx.svg(emptyArt(key), { view: EMPTY_VIEW, size: EMPTY_SIZE, k: 1.25, idp: `pm-e-${key}-`, label: `${e.name}：${e.line}`, merge: false, anim: true, stagger: true, over: { sp: 1.8 } }),
      category: e.cat,
      notes: `${e.name}还空着时：「${e.line}」。动效零件 motion/empty-state 一笔笔画出来、再一样样弹一下。`,
    });
  }
  return out;
}
