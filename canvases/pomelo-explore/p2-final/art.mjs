// Phase 2 第一轮的图形：从 Phase 1 第二轮复制，补 5 个模块图标；柚子拆成「身子 + 8 张脸」，脸可以切换。
// 颜色都可以是 CSS 变量（var(--…)），这样一份图能跟着配色走。
import { P, ellipse, circle, rrect, rotate, move, handStroke, handFill, cmdsToD, f, mix } from './lib.mjs';

// ---------- 画法 ----------
// line 线宽、amp 抖动、off 错版距离、border 贴纸白边：都按 64 格的图标单位
export const STYLES = {
  sticker: { key: 'sticker', name: '贴纸', outline: false, off: [0, 0], border: 4.6, shadow: true, tilt: true, line: 2.4, amp: 0.7, fillAmp: 0.65 },
  offprint: { key: 'offprint', name: '错版线描', outline: true, off: [2.6, 3.2], border: 0, shadow: false, tilt: false, line: 2.3, amp: 0.85, fillAmp: 0.45 },
  hybrid: { key: 'hybrid', name: '线描贴纸', outline: true, off: [1.4, 1.8], border: 4.2, shadow: true, tilt: true, line: 3.3, amp: 0.75, fillAmp: 0.4 },
};

// ---------- 64 格模块图标 ----------
function foot(cx, cy, rot, seed) {
  const s = 1.2;
  const parts = [{ t: 'shape', d: ellipse(cx, cy, 6 * s, 9.6 * s, rot), fill: 'cat', seed }];
  [[-4.4, -13.4, 2.3], [-1, -15.4, 2.1], [2.4, -14.8, 1.9], [5.2, -12.4, 1.6]].forEach(([dx, dy, r], i) =>
    parts.push({ t: 'shape', d: rotate(circle(cx + dx * s, cy + dy * s, r * s), cx, cy, rot), fill: 'cat', sw: 0.75, amp: 0.4, seed: seed + i + 1 }));
  return parts;
}

export const ICONS = {
  steps: { name: '一步一步', cat: 'mint', parts: [...foot(19, 45, -16, 10), ...foot(44, 25, 12, 20)] },
  read: {
    name: '摸鱼读读', cat: 'sky', parts: [
      { t: 'shape', d: P('M32 21 C26 16 17 15 9 18 L9 51 C17 48 26 49 32 54 Z'), fill: 'cat', seed: 31 },
      { t: 'shape', d: P('M32 21 C38 16 47 15 55 18 L55 51 C47 48 38 49 32 54 Z'), fill: 'cat', seed: 32 },
      { t: 'line', d: P('M32 22 L32 53'), sw: 0.8, seed: 33 },
      { t: 'line', d: P('M14 27 C18 26 22 26 27 28 M14 34 C18 33 22 33 27 35'), sw: 0.7, seed: 34 },
      { t: 'shape', d: P('M37 12 C41 7 49 6 55 11 C49 16 41 16 37 12 Z'), fill: 'yellow', seed: 35 },
      { t: 'shape', d: P('M38 12 L31 6.5 L31.5 17.5 Z'), fill: 'yellow', sw: 0.85, seed: 36 },
      { t: 'dot', d: circle(50, 10.4, 1.3), seed: 37 },
    ],
  },
  money: {
    name: '钱来钱往', cat: 'mint', parts: [
      { t: 'shape', d: circle(43, 17, 9.5), fill: 'yellow', seed: 41 },
      { t: 'line', d: P('M39.6 12.6 L43 17 L46.4 12.6 M43 17 L43 22.4 M39.8 18.3 L46.2 18.3'), sw: 0.7, sticker: 'ink', seed: 42 },
      { t: 'shape', d: rrect(7, 23, 48, 32, 8), fill: 'cat', seed: 43 },
      { t: 'line', d: P('M8 31 C20 32 32 32 40 31'), sw: 0.75, seed: 44 },
      { t: 'shape', d: rrect(40, 33, 17, 12, 5), fill: 'yellow', sw: 0.9, seed: 45 },
      { t: 'dot', d: circle(49, 39, 2), seed: 46 },
    ],
  },
  memo: {
    name: '念念不忘', cat: 'pink', parts: [
      { t: 'shape', d: P('M53 8 C41 9 23 22 18 44 L20 49 C37 47 52 31 53 8 Z'), fill: 'cat', seed: 51 },
      { t: 'line', d: P('M53 8 C43 21 31 35 11 57'), sw: 0.9, sticker: 'white', seed: 52 },
      { t: 'line', d: P('M30 31 L24 27 M38 23 L33 18'), sw: 0.7, sticker: 'white', seed: 53 },
      { t: 'dot', d: ellipse(10, 58.5, 2.6, 2), seed: 54 },
    ],
  },
  days: {
    name: '来日方长', cat: 'pink', parts: [
      { t: 'shape', d: rrect(9, 14, 46, 42, 8), fill: 'catLight', seed: 61 },
      { t: 'shape', d: P('M9 22 Q9 14 17 14 L47 14 Q55 14 55 22 L55 27 L9 27 Z'), fill: 'cat', seed: 62 },
      { t: 'line', d: P('M21 9 L21 18 M43 9 L43 18'), sw: 1.2, sticker: 'ink', seed: 63 },
      { t: 'shape', d: P('M32 50 C24 45 21 41 21 37.5 C21 34 24 32 26.8 32 C29 32 31 33.5 32 35.5 C33 33.5 35 32 37.2 32 C40 32 43 34 43 37.5 C43 41 40 45 32 50 Z'), fill: 'heart', seed: 64 },
    ],
  },
  trip: {
    name: '出门走走', cat: 'orange', parts: [
      { t: 'line', d: P('M24 22 L24 15 Q24 10 29 10 L35 10 Q40 10 40 15 L40 22'), sw: 1.5, sticker: 'ink', seed: 71 },
      { t: 'shape', d: rrect(9, 21, 46, 34, 7), fill: 'cat', seed: 72 },
      { t: 'line', d: P('M20 22 L20 54 M44 22 L44 54'), sw: 0.8, seed: 73 },
      { t: 'shape', d: P('M32 32 L34.2 36.6 L39.2 37.3 L35.6 40.8 L36.4 45.8 L32 43.4 L27.6 45.8 L28.4 40.8 L24.8 37.3 L29.8 36.6 Z'), fill: 'yellow', sw: 0.75, amp: 0.35, seed: 74 },
    ],
  },
};
export const ICON_ORDER = ['steps', 'read', 'money', 'memo', 'days', 'trip'];

// Phase 2 补画：好奇看看、随意画画、芝麻开门、呦呦漫游、投石问路（小样用，Phase 5 正式画）
const keyParts = () => {
  const R = (d) => rotate(d, 32, 32, -32);
  return [
    { t: 'shape', d: R(rrect(26, 28.5, 30, 7, 3)), fill: 'cat', seed: 141 },
    { t: 'shape', d: R(rrect(43, 34, 4.5, 8, 1.6)), fill: 'cat', sw: 0.8, seed: 142 },
    { t: 'shape', d: R(rrect(50, 34, 4.5, 10, 1.6)), fill: 'cat', sw: 0.8, seed: 143 },
    { t: 'shape', d: R(circle(17, 32, 11.5)), fill: 'yellow', seed: 144 },
    { t: 'shape', d: R(circle(14, 32, 3.4)), fill: 'white', sw: 0.75, amp: 0.4, seed: 145 },
  ];
};
Object.assign(ICONS, {
  films: {
    name: '好奇看看', cat: 'sky', parts: [
      { t: 'shape', d: rrect(9, 27, 46, 29, 6), fill: 'cat', seed: 131 },
      { t: 'shape', d: rotate(rrect(8, 15, 47, 10, 3), 8, 25, -11), fill: 'yellow', seed: 132 },
      { t: 'line', d: rotate(P('M17 15.5 L21 24.5 M28 15.5 L32 24.5 M39 15.5 L43 24.5'), 8, 25, -11), sw: 0.8, seed: 133 },
      { t: 'shape', d: P('M27 35 L40 41.5 L27 48 Z'), fill: 'white', sw: 0.8, amp: 0.4, seed: 134 },
    ],
  },
  drawing: {
    name: '随意画画', cat: 'sky', parts: [
      { t: 'shape', d: P('M31 9 C46 9 57 19 57 31 C57 39 51 41 46 39 C41 37 37 40 39 46 C41 52 37 56 30 56 C17 56 7 45 7 32 C7 19 17 9 31 9 Z'), fill: 'cat', seed: 135 },
      { t: 'shape', d: circle(19, 26, 4.6), fill: 'yellow', sw: 0.75, amp: 0.4, seed: 136 },
      { t: 'shape', d: circle(31, 18.5, 4.2), fill: 'heart', sw: 0.75, amp: 0.4, seed: 137 },
      { t: 'shape', d: circle(44, 22, 4), fill: 'white', sw: 0.75, amp: 0.4, seed: 138 },
      { t: 'shape', d: circle(17, 40, 4.4), fill: 'leaf', sw: 0.75, amp: 0.4, seed: 139 },
    ],
  },
  vault: { name: '芝麻开门', cat: 'mint', parts: keyParts() },
  site: {
    name: '呦呦漫游', cat: 'orange', parts: [
      { t: 'line', d: circle(32, 9.5, 3.6), sw: 0.9, sticker: 'ink', seed: 151 },
      { t: 'shape', d: circle(32, 35, 21.5), fill: 'cat', seed: 152 },
      { t: 'shape', d: circle(32, 35, 15), fill: 'white', sw: 0.8, seed: 153 },
      { t: 'shape', d: P('M32 21.5 L37 35 L27 35 Z'), fill: 'heart', sw: 0.75, amp: 0.35, seed: 154 },
      { t: 'shape', d: P('M32 48.5 L37 35 L27 35 Z'), fill: 'yellow', sw: 0.75, amp: 0.35, seed: 155 },
      { t: 'dot', d: circle(32, 35, 1.9), seed: 156 },
    ],
  },
  jobs: {
    name: '投石问路', cat: 'grape', parts: [
      { t: 'line', d: P('M23 21 L23 15 Q23 11 27 11 L37 11 Q41 11 41 15 L41 21'), sw: 1.4, sticker: 'ink', seed: 161 },
      { t: 'shape', d: rrect(8, 20, 48, 34, 7), fill: 'cat', seed: 162 },
      { t: 'line', d: P('M9 33 C22 36.5 42 36.5 55 33'), sw: 0.75, seed: 163 },
      { t: 'shape', d: rrect(27.5, 30, 9, 8, 2.4), fill: 'yellow', sw: 0.8, seed: 164 },
    ],
  },
});

// ---------- 柚子（100 格） ----------
const BODY = P('M50 18 C60 18 65 23 69 29 C80 36 88 47 88 61 C88 79 71 92 50 92 C29 92 12 79 12 61 C12 47 20 36 31 29 C35 23 40 18 50 18 Z');
const LEAF = P('M52 20 C53 10 61 4 74 4 C74 14 66 21 52 20 Z');
function sparkle(x, y, r) {
  return P(`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`);
}
export function pomelo(face = 'normal') {
  const parts = [
    { t: 'line', d: P('M50 19 L48 11'), sw: 1, sticker: 'ink', seed: 80 },
    { t: 'shape', d: LEAF, fill: 'leaf', seed: 81 },
    { t: 'line', d: P('M55 17 C59 13 64 9 69 7'), sw: 0.6, sticker: 'white', seed: 82 },
    { t: 'shape', d: BODY, fill: 'yellow', seed: 83, id: 'body' },
    { t: 'line', d: P('M23 53 C24 46 28 40 33 36'), sw: 1.3, color: 'white', withFill: true, seed: 84 },
    { t: 'blush', d: ellipse(29, 71, 5.6, 3.4), seed: 85 },
    { t: 'blush', d: ellipse(71, 71, 5.6, 3.4), seed: 86 },
  ];
  if (face === 'normal') {
    parts.push(
      { t: 'dot', d: ellipse(39, 61, 3.3, 3.7), seed: 87, id: 'eyes' },
      { t: 'dot', d: ellipse(61, 61, 3.3, 3.7), seed: 88, id: 'eyes' },
      { t: 'line', d: P('M45 70 Q50 75 55 70'), sw: 0.95, sticker: 'ink', seed: 89, id: 'mouth' },
    );
  } else if (face === 'think') {
    parts.push(
      { t: 'dot', d: ellipse(43, 57, 3.1, 3.5), seed: 90, id: 'eyes' },
      { t: 'dot', d: ellipse(64, 57, 3.1, 3.5), seed: 91, id: 'eyes' },
      { t: 'line', d: P('M37 50 C39 48 42 48 45 49 M60 49 C63 48 66 48 68 50'), sw: 0.7, sticker: 'ink', seed: 92 },
      { t: 'line', d: circle(53, 72, 2.6), sw: 0.85, sticker: 'ink', seed: 93, id: 'mouth' },
      { t: 'dot', d: circle(24, 27, 2.4), seed: 94, id: 'th1' },
      { t: 'dot', d: circle(16, 18, 3.2), seed: 95, id: 'th2' },
      { t: 'dot', d: circle(8, 7, 4), seed: 96, id: 'th3' },
    );
  } else if (face === 'happy') {
    parts.push(
      { t: 'line', d: P('M33.5 62 Q39 55 44.5 62 M55.5 62 Q61 55 66.5 62'), sw: 1, sticker: 'ink', seed: 97, id: 'eyes' },
      { t: 'line', d: P('M42 69 Q50 70.5 58 69 Q57 80 50 80 Q43 80 42 69 Z'), sw: 0.9, sticker: 'ink', seed: 98, id: 'mouth' },
      { t: 'shape', d: sparkle(17, 31, 7), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 99, id: 'st1' },
      { t: 'shape', d: sparkle(88, 40, 5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 100, id: 'st2' },
    );
  } else {
    parts.push(...FACES[face]());
  }
  return { name: '柚子', cat: 'orange', parts };
}

// 其余表情：眨眼、困了、出错、惊讶、哇。黑色只用实心小点，不和错开的填色叠在一起
const FACES = {
  wink: () => [
    { t: 'line', d: P('M34 61 Q39 65 44 61'), sw: 1, sticker: 'ink', seed: 110, id: 'eyes' },
    { t: 'dot', d: ellipse(61, 61, 3.3, 3.7), seed: 111, id: 'eyes' },
    { t: 'line', d: P('M44 70 Q50 76 56 70'), sw: 0.95, sticker: 'ink', seed: 112, id: 'mouth' },
  ],
  sleepy: () => [
    { t: 'line', d: P('M34 62 Q39 64.5 44 62 M56 62 Q61 64.5 66 62'), sw: 1, sticker: 'ink', seed: 113, id: 'eyes' },
    { t: 'line', d: ellipse(50, 72, 3, 2.4), sw: 0.85, sticker: 'ink', seed: 114, id: 'mouth' },
    { t: 'line', d: P('M78 27 L86 27 L78 35 L86 35'), sw: 0.75, sticker: 'ink', seed: 115, id: 'zz' },
    { t: 'line', d: P('M89 13 L95 13 L89 19 L95 19'), sw: 0.65, sticker: 'ink', seed: 116, id: 'zz' },
  ],
  error: () => [
    { t: 'line', d: P('M34 57.5 L43 53.5 M66 57.5 L57 53.5'), sw: 0.75, sticker: 'ink', seed: 117 },
    { t: 'dot', d: ellipse(39, 62, 3, 3.4), seed: 118, id: 'eyes' },
    { t: 'dot', d: ellipse(61, 62, 3, 3.4), seed: 119, id: 'eyes' },
    { t: 'line', d: P('M42 73 Q45 70 48 73 Q51 76 54 73 Q56 71 58 72'), sw: 0.85, sticker: 'ink', seed: 120, id: 'mouth' },
    { t: 'shape', d: circle(84, 26, 11.5), fill: 'heart', sw: 0.75, seed: 121, id: 'bang' },
    { t: 'line', d: P('M84 18.5 L84 26.5'), sw: 0.95, color: 'white', seed: 122, id: 'bang' },
    { t: 'dot', d: circle(84, 31.6, 2), color: 'white', seed: 123, id: 'bang' },
  ],
  surprised: () => [
    { t: 'line', d: P('M33 50 Q39 45 45 49 M55 49 Q61 45 67 50'), sw: 0.75, sticker: 'ink', seed: 124 },
    { t: 'dot', d: ellipse(39, 60, 4.1, 4.8), seed: 125, id: 'eyes' },
    { t: 'dot', d: ellipse(61, 60, 4.1, 4.8), seed: 126, id: 'eyes' },
    { t: 'line', d: ellipse(50, 74, 3.6, 4.4), sw: 0.9, sticker: 'ink', seed: 127, id: 'mouth' },
  ],
  wow: () => [
    { t: 'dot', d: sparkle(39, 60, 6.2), seed: 128, id: 'eyes' },
    { t: 'dot', d: sparkle(61, 60, 6.2), seed: 129, id: 'eyes' },
    { t: 'line', d: ellipse(50, 74, 5.6, 5.2), sw: 0.9, sticker: 'ink', seed: 130, id: 'mouth' },
    { t: 'shape', d: sparkle(15, 34, 6.5), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 131, id: 'st1' },
    { t: 'shape', d: sparkle(87, 38, 4.6), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 132, id: 'st2' },
    { t: 'shape', d: sparkle(82, 17, 3.6), fill: 'yellow', sw: 0.6, amp: 0.3, seed: 133, id: 'st2' },
  ],
};

// ---------- 空书架（240 × 130） ----------
export const SHELF = {
  name: '空书架', cat: 'sky', parts: [
    { t: 'shape', d: rrect(8, 104, 224, 10, 3), fill: 'wood', seed: 201, id: 'plank' },
    { t: 'shape', d: rrect(38, 40, 25, 64, 3), fill: 'cat', seed: 202, id: 'book1' },
    { t: 'line', d: P('M39 52 L62 52 M39 92 L62 92'), sw: 0.8, seed: 203, id: 'book1' },
    { t: 'shape', d: rotate(rrect(70, 50, 22, 54, 3), 70, 104, 16), fill: 'pinkCat', seed: 204, id: 'book2' },
    { t: 'shape', d: P('M120 90 C133 75 161 75 177 90 C161 105 133 105 120 90 Z'), fill: 'yellow', seed: 205, id: 'fish' },
    { t: 'shape', d: P('M121 90 L104 77 L106 103 Z'), fill: 'yellow', seed: 206, id: 'fish' },
    { t: 'line', d: P('M144 81 Q150 74 157 80'), sw: 0.8, seed: 207, id: 'fish' },
    { t: 'dot', d: circle(165, 87, 2.6), seed: 208, id: 'fish' },
    { t: 'shape', d: P('M197 84 C190 74 190 65 196 58 C201 66 202 76 197 84 Z'), fill: 'leaf', seed: 209, id: 'plant' },
    { t: 'shape', d: P('M197 84 C204 75 212 73 219 75 C215 84 206 86 197 84 Z'), fill: 'leaf', seed: 210, id: 'plant' },
    { t: 'shape', d: P('M186 104 L183 84 L211 84 L208 104 Z'), fill: 'orangeCat', seed: 211, id: 'plant' },
  ],
};

// ---------- 渲染 ----------
// col：上色表；k：线宽与抖动的倍数；merge：白边合成一整张贴纸（图标）还是每块各一张（动效）
export function render(art, st, col, { k = 1, merge = true, idp = 'a', anim = false, over = {}, layer = null } = {}) {
  const s = { ...st, ...over };
  const C = (name) => {
    if (name === 'cat') return col.cats[art.cat];
    if (name === 'catLight') return col.catLight ? col.catLight(art.cat) : mix(col.cats[art.cat], '#ffffff', 0.72);
    if (name === 'pinkCat') return col.cats.pink;
    if (name === 'orangeCat') return col.cats.orange;
    return col[name] ?? name;
  };
  const off = s.off.map((v) => v * k);
  const bw = s.border * k;
  const defs = s.shadow && bw > 0
    ? `<filter id="${idp}sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="${f(1.3 * k)}" stdDeviation="${f(1.2 * k)}" flood-color="${col.shadow}" flood-opacity="1"></feDropShadow></filter>`
    : '';
  const shadowAttr = defs ? ` filter="url(#${idp}sh)"` : '';
  const blob = (p) => {
    const extra = Math.max(Math.abs(off[0]), Math.abs(off[1])) * 0.6;
    const w = 2 * (bw + extra);
    if (p.t === 'line') return `<path d="${handStroke(p.d, { amp: s.amp * k * 0.6, seed: p.seed, sp: s.sp ?? 0.9 })}" fill="none" stroke="${col.white}" stroke-width="${f(s.line * k * (p.sw ?? 0.8) + w)}" stroke-linecap="round" stroke-linejoin="round"></path>`;
    if (p.t === 'blush') return '';
    return `<path d="${handFill(p.d, { amp: s.fillAmp * k, seed: p.seed, sp: s.sp ?? 0.9 })}" fill="${col.white}" stroke="${col.white}" stroke-width="${f(w)}" stroke-linejoin="round"></path>`;
  };
  const body = (p) => {
    const amp = s.amp * k * (p.amp ?? 1);
    const tr = `transform="translate(${f(off[0])} ${f(off[1])})"`;
    const out = [];
    if (p.t === 'shape') {
      out.push(`<path class="fl" d="${handFill(p.d, { amp: s.fillAmp * k * (p.amp ?? 1), seed: p.seed, sp: s.sp ?? 0.9 })}" fill="${C(p.fill)}" ${s.outline ? tr : ''}></path>`);
      if (s.outline) out.push(`<path class="ol"${anim ? ' pathLength="1"' : ''} d="${handStroke(p.d, { amp, seed: p.seed, sp: s.sp ?? 0.9 })}" fill="none" stroke="${col.ink}" stroke-width="${f(s.line * k * (p.sw ?? 1))}" stroke-linecap="round" stroke-linejoin="round"></path>`);
    } else if (p.t === 'line') {
      const color = p.color ? C(p.color) : s.outline ? col.ink : C(p.sticker ?? 'white');
      const move = p.withFill && s.outline ? tr : '';
      out.push(`<path class="ol"${anim ? ' pathLength="1"' : ''} d="${handStroke(p.d, { amp: amp * 0.7, seed: p.seed, sp: s.sp ?? 0.9 })}" fill="none" stroke="${color}" stroke-width="${f(s.line * k * (p.sw ?? 0.8))}" stroke-linecap="round" stroke-linejoin="round" ${move}></path>`);
    } else if (p.t === 'dot') {
      out.push(`<path class="dt" d="${handFill(p.d, { amp: 0.12 * k, seed: p.seed })}" fill="${p.color ? C(p.color) : col.ink}"></path>`);
    } else if (p.t === 'blush') {
      out.push(`<path class="bl" d="${handFill(p.d, { amp: 0.3 * k, seed: p.seed })}" fill="${col.blush}" ${s.outline ? tr : ''}></path>`);
    }
    return out.join('');
  };
  let html = '';
  // 只要白边，或只要图形（柚子的脸要分层：白边在身子下面，五官在身子上面）
  if (layer === 'blob') return { defs, html: bw > 0 ? `<g class="wb"${shadowAttr}>${art.parts.map(blob).join('')}</g>` : '' };
  if (layer === 'body') return { defs, html: art.parts.map((p) => `<g class="pt${p.id ? ' ' + p.id : ''}">${body(p)}</g>`).join('') };
  if (merge) {
    if (bw > 0) html += `<g class="wb"${shadowAttr}>${art.parts.map(blob).join('')}</g>`;
    html += art.parts.map((p) => `<g class="pt${p.id ? ' ' + p.id : ''}">${body(p)}</g>`).join('');
  } else {
    // 按 id 分组：同一组的各块共用一张白边
    const groups = [];
    for (const p of art.parts) {
      const g = groups.find((x) => x.id && x.id === p.id);
      if (g) g.parts.push(p); else groups.push({ id: p.id, parts: [p] });
    }
    html += groups.map((g) => `<g class="pt${g.id ? ' ' + g.id : ''}">${bw > 0 ? `<g class="wb"${shadowAttr}>${g.parts.map(blob).join('')}</g>` : ''}${g.parts.map(body).join('')}</g>`).join('');
  }
  return { defs, html };
}

export function svg(art, st, col, { size = 64, view = '-8 -8 80 80', k = 1, idp = 'a', merge = true, anim = false, cls = '', style = '', over = {}, label = '' } = {}) {
  const { defs, html } = render(art, st, col, { k, merge, idp, anim, over });
  const [, , vw, vh] = view.split(' ').map(Number);
  const h = Math.round((size * vh) / vw);
  return `<svg class="${cls}" width="${size}" height="${h}" viewBox="${view}" style="${style}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${defs ? `<defs>${defs}</defs>` : ''}${html}</svg>`;
}

// 菜单栏小图：单色。solid 实心（模型就绪），hollow 空心（没运行）
export function menuGlyph(st, color, bg, kind, size) {
  const wob = st.outline ? 1 : 0.15;
  const eyes = `<path d="${handFill(ellipse(39, 61, 4.6, 5.2), { amp: 0.1, seed: 3 })}${handFill(ellipse(61, 61, 4.6, 5.2), { amp: 0.1, seed: 4 })}" fill="${kind === 'solid' ? bg : color}"></path>`;
  const shapes = kind === 'solid'
    ? `<path d="${handFill(BODY, { amp: 0.4 * wob, seed: 1 })}${handFill(LEAF, { amp: 0.3 * wob, seed: 2 })}" fill="${color}"></path>${eyes}`
    : `<path d="${handStroke(BODY, { amp: 1.1 * wob, seed: 1, over: 0.04 })}${handStroke(LEAF, { amp: 0.8 * wob, seed: 2, over: 0.04 })}" fill="none" stroke="${color}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"></path>${eyes}`;
  return `<svg width="${size}" height="${size}" viewBox="8 2 84 92" aria-hidden="true">${shapes}</svg>`;
}

// App 图标：1024 网格的圆角方块，纸色加方格，中间一颗大柚子
export function appIcon(st, col, size, idp) {
  const tilt = st.tilt ? -7 : 0;
  const grid = [];
  for (let v = 100 + 64; v < 924; v += 64) grid.push(`M${v} 100 L${v} 924 M100 ${v} L924 ${v}`);
  const { defs, html } = render(pomelo('normal'), st, col, { k: 1.15, idp: idp + 'p' });
  const tape = st.border > 0
    ? `<g transform="translate(300 300) rotate(-38)"><path d="M-170 -34 L170 -34 L182 -22 L170 -10 L184 2 L170 14 L180 26 L170 34 L-170 34 L-182 22 L-170 10 L-184 -2 L-170 -14 L-180 -26 Z" fill="url(#${idp}tp)" opacity=".86"></path></g>`
    : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" role="img" aria-label="App 图标"><defs>${defs}<clipPath id="${idp}sq"><path d="${cmdsToD(rrect(100, 100, 824, 824, 185))}"></path></clipPath><pattern id="${idp}tp" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="28" height="28" fill="${col.tapeA}"></rect><rect width="14" height="28" fill="${col.tapeB}"></rect></pattern></defs>
<g clip-path="url(#${idp}sq)"><rect x="100" y="100" width="824" height="824" fill="${col.iconBg}"></rect><path d="${grid.join('')}" stroke="${col.iconGrid}" stroke-width="3" fill="none"></path></g>
<g transform="translate(512 548) rotate(${tilt}) scale(6.1) translate(-50 -56)">${html}</g>${tape}</svg>`;
}

// ---------- 能换脸的柚子 ----------
// 身子（茎、叶、身子、高光、腮红）只画一次；8 张脸各一组，用 .f-<脸> 切换。
// 脸上伸出身子的部分（想法泡泡、星星、「!」、z）也有白边，白边画在身子下面。
export const FACES8 = ['normal', 'think', 'wink', 'sleepy', 'happy', 'error', 'surprised', 'wow'];
const OUTSIDE = /^(th\d|st\d|bang|zz)$/;
export function pomeloSvg(st, col, { size = 100, view = '-6 -6 112 108', k = 1.25, idp = 'pm', cls = '', label = '柚子', faces = FACES8, style = '' } = {}) {
  const all = pomelo('normal').parts;
  const base = { name: '柚子', cat: 'orange', parts: all.slice(0, 7) };
  const b = render(base, st, col, { k, idp });
  const blobs = faces.map((fc) => {
    const out = pomelo(fc).parts.slice(7).filter((p) => OUTSIDE.test(p.id ?? ''));
    return out.length ? `<g class="fx fx-${fc}">${render({ ...base, parts: out }, st, col, { k, idp, layer: 'blob' }).html}</g>` : '';
  }).join('');
  const bodies = faces.map((fc) => `<g class="fx fx-${fc}">${render({ ...base, parts: pomelo(fc).parts.slice(7) }, st, col, { k, idp, layer: 'body' }).html}</g>`).join('');
  const [, , vw, vh] = view.split(' ').map(Number);
  const h = Math.round((size * vh) / vw);
  return `<svg class="pm ${cls}" width="${size}" height="${h}" viewBox="${view}" style="${style}" role="img" aria-label="${label}">${b.defs ? `<defs>${b.defs}</defs>` : ''}${blobs}<g class="pb">${b.html}</g>${bodies}</svg>`;
}

// 模块图标做成 <symbol>，同一张图在一块画板里只写一次
export function iconSymbol(id, st, col, { idp }) {
  const { defs, html } = render(ICONS[id], st, col, { k: 1, idp });
  return `<symbol id="ic-${id}" viewBox="-8 -8 80 80">${defs ? `<defs>${defs}</defs>` : ''}${html}</symbol>`;
}

// 柚子贴纸撕走后留下的「影子」：和贴纸一样的外形（含白边），铺浅色，沿外沿一圈虚线像模切的印子。
// 外沿比贴纸收进 0.5 格，贴着时被贴纸整个盖住；撕起来才看见，影子里写悄悄话。
// 贴纸是用 <use href="#pm-static"> 画的，symbol 的内容会平移 (6, 6)，影子照着平移才对得上。
export function pomeloGhost(st, { k = 1.25, fill = 'var(--card)', line = 'var(--pen)', dash = '5 4.5', ring = 2.2, inset = 1 } = {}) {
  // 身子排第一：版面检查拿第一条描边当字的框
  const parts = pomelo('normal').parts.slice(0, 7).filter((p) => p.t !== 'blush').sort((a, b) => (b.id === 'body') - (a.id === 'body'));
  const off = st.off.map((v) => v * k);
  const bw = st.border * k;
  const w = 2 * (bw + Math.max(Math.abs(off[0]), Math.abs(off[1])) * 0.6) - inset * 2;
  const shape = (p, color, sw, dashed) => {
    const da = dashed ? ` stroke-dasharray="${dash}"` : '';
    return p.t === 'line'
      ? `<path d="${handStroke(p.d, { amp: st.amp * k * 0.6, seed: p.seed, sp: st.sp ?? 0.9 })}" fill="none" stroke="${color}" stroke-width="${f(st.line * k * (p.sw ?? 0.8) + sw)}" stroke-linecap="round" stroke-linejoin="round"${da}></path>`
      : `<path d="${handFill(p.d, { amp: st.fillAmp * k, seed: p.seed, sp: st.sp ?? 0.9 })}" fill="${dashed ? 'none' : color}" stroke="${color}" stroke-width="${f(sw)}" stroke-linejoin="round"${da}></path>`;
  };
  return `<g transform="translate(6 6)"><g class="ghost-ring">${parts.map((p) => shape(p, line, w, true)).join('')}</g><g>${parts.map((p) => shape(p, fill, w - ring * 2, false)).join('')}</g></g>`;
}
