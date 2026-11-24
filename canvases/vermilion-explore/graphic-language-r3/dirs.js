// 五个方向的图形定义。坐标：图标 64 网格；分区装饰 560×220；OG 1200×630；空状态 320×200。
const { jitter, crPath, brush, radial, flowLines, circlePts, rng } = require('./lib');

const CATS = [
  ['write', '写作'], ['project', '项目'], ['gallery', '画廊'], ['create', '创作'], ['travel', '游记'], ['other', '其他'],
];

// 元素：ln 描线（会被画出）；fl 纸片填充；br 收尖笔触；em 抵达点（朱红，只在交互时出现）；clip 裁切组
const ln = (pts, w, o = {}) => ({ k: 'ln', d: Array.isArray(pts) ? crPath(pts, o.closed) : pts, w, role: o.role || 'accent', i: o.i || 0 });
const em = (cx, cy, r) => ({ k: 'em', cx, cy, r });

function spiral(cx, cy, r0, r1, turns, a0, n, seed, jit) {
  const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; const a = a0 + t * turns * Math.PI * 2; const r = r0 + (r1 - r0) * t; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return jitter(pts, jit, seed);
}

/* ---------------- A 一笔 ---------------- */
const A = { id: 'a', name: '一笔', en: 'One Line', icons: {}, };
{
  const W = 2.3, J = 0.5;
  const P = {
    write: [[14, 53], [22, 43], [33, 28], [44, 16], [51, 9], [52, 17], [47, 27], [39, 35], [30, 41], [22, 45], [17, 50], [21, 55], [29, 53], [37, 56], [45, 53], [53, 55]],
    project: [[7, 57], [18, 56], [18, 32], [18, 9], [26, 6], [34, 11], [42, 8], [50, 10], [47, 19], [50, 28], [42, 26], [34, 30], [26, 25], [20, 28]],
    gallery: [[16, 51], [12, 31], [13, 13], [32, 12], [51, 13], [52, 32], [51, 51], [30, 52], [15, 50], [17, 43], [24, 33], [30, 39], [36, 31], [43, 42], [50, 46]],
    create: [[32, 51], [23, 46], [11, 46], [10, 30], [10, 17], [21, 15], [31, 19], [32, 35], [32, 50], [33, 35], [33, 19], [43, 15], [54, 17], [54, 31], [53, 46], [41, 46], [34, 50]],
    travel: [[6, 48], [16, 32], [22, 38], [32, 19], [42, 35], [48, 29], [55, 38], [58, 28], [55, 17], [50, 12], [45, 15], [47, 20], [51, 18]],
    other: spiral(32, 33, 2, 21, 2.25, 0.4, 30, 7, 0.3),
  };
  for (const [k] of CATS) {
    const pts = jitter(P[k], k === 'other' ? 0 : J, k.length * 13);
    const last = pts[pts.length - 1];
    const els = [ln(pts, W)];
    if (k === 'gallery') els.push(ln(jitter(circlePts(42, 22, 4.5, -2, 4.4, 10), 0.3, 3), W, { i: 1 }));
    els.push(em(last[0], last[1], 3));
    A.icons[k] = els;
  }
  // 分区装饰：一根自在的长线，中间打两个圈
  const deco = [[12, 176], [70, 160], [128, 170], [176, 140], [205, 104], [232, 92], [252, 106], [242, 128], [218, 124], [214, 100], [240, 76], [300, 64], [350, 82], [384, 122], [414, 150], [446, 146], [462, 122], [450, 102], [428, 110], [432, 136], [470, 150], [512, 120], [546, 70]];
  A.deco = { vb: [560, 220], els: [ln(jitter(deco, 1.2, 5), 2.2), em(546, 70, 5)] };
  // OG：山、太阳圈、长线
  const og = [[560, 520], [640, 470], [700, 380], [752, 300], [800, 360], [842, 410], [900, 250], [960, 150], [1020, 280], [1060, 340], [1100, 300], [1150, 380], [1160, 300], [1130, 200], [1080, 150], [1030, 170], [1050, 220], [1100, 205]];
  const og2 = [[480, 560], [620, 540], [760, 560], [900, 530], [1040, 555], [1170, 530]];
  A.og = { vb: [1200, 630], els: [ln(jitter(og, 3, 9), 4), ln(jitter(og2, 3, 4), 4, { i: 1 })] };
  // 空状态：一张空白页，线从页角溜出去，在远处打个圈
  const e = [[110, 150], [96, 92], [100, 40], [150, 36], [200, 40], [204, 92], [196, 150], [150, 154], [104, 152], [150, 160], [210, 172], [252, 160], [270, 136], [258, 118], [240, 126], [248, 146], [286, 160], [312, 150]];
  A.empty = { vb: [320, 200], els: [ln(jitter(e, 1, 2), 2.2)] };
}

/* ---------------- B 流线 ---------------- */
const B = { id: 'b', name: '流线', en: 'Flow', icons: {} };
{
  const W = 1.5;
  const sil = {
    write: crPath([[12, 54], [14, 40], [22, 26], [36, 14], [53, 8], [48, 24], [40, 38], [26, 49]], true),
    project: crPath([[19, 9], [28, 6], [38, 11], [50, 8], [47, 19], [50, 30], [40, 27], [30, 31], [19, 28]], true),
    gallery: 'M18,12H46Q52,12 52,18V46Q52,52 46,52H18Q12,52 12,46V18Q12,12 18,12Z',
    create: crPath([[31, 20], [23, 15], [15, 15], [10, 18], [10, 47], [18, 44], [26, 45], [31, 50]], true) + crPath([[33, 20], [41, 15], [49, 15], [54, 18], [54, 47], [46, 44], [38, 45], [33, 50]], true),
    travel: 'M3,54L17,31L24,39L34,15L46,37L52,30L61,54Z',
    other: crPath(radial(32, 32, () => 22, 24), true),
  };
  const fl = {
    write: { cx: 32, cy: 32, ang: Math.PI / 4, span: 34, spacing: 4.4, amp: 1.3, freq: 0.18 },
    project: { cx: 34, cy: 18, ang: 0, span: 22, spacing: 3.8, amp: 2.2, freq: 0.2 },
    gallery: { cx: 32, cy: 32, ang: -0.08, span: 28, spacing: 4.6, amp: 1.8, freq: 0.16 },
    create: { cx: 32, cy: 32, ang: 0.12, span: 30, spacing: 4.2, amp: 1.2, freq: 0.2 },
    travel: { cx: 32, cy: 36, ang: 0, span: 32, spacing: 4.4, amp: 1.6, freq: 0.14 },
    other: { cx: 32, cy: 32, ang: -0.35, span: 28, spacing: 4.2, amp: 2.6, freq: 0.15 },
  };
  const polys = {
    write: [[[12, 54], [14, 40], [22, 26], [36, 14], [53, 8], [48, 24], [40, 38], [26, 49]]],
    project: [[[19, 9], [28, 6], [38, 11], [50, 8], [47, 19], [50, 30], [40, 27], [30, 31], [19, 28]]],
    gallery: [[[12, 12], [52, 12], [52, 52], [12, 52]]],
    create: [[[31, 20], [23, 15], [15, 15], [10, 18], [10, 47], [18, 44], [26, 45], [31, 50]], [[33, 20], [41, 15], [49, 15], [54, 18], [54, 47], [46, 44], [38, 45], [33, 50]]],
    travel: [[[3, 54], [17, 31], [24, 39], [34, 15], [46, 37], [52, 30], [61, 54]]],
    other: [radial(32, 32, () => 22, 24)],
  };
  const inPoly = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) c = !c; } return c; };
  const segD = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
  const near = (p, polys) => polys.some((poly) => inPoly(p, poly) || poly.some((a, i) => segD(p, a, poly[(i + 1) % poly.length]) < 7));
  const trim = (lines, polys) => { const out = []; for (const L of lines) { let run = []; for (const p of L) { if (near(p, polys)) run.push(p); else { if (run.length > 1) out.push(run); run = []; } } if (run.length > 1) out.push(run); } return out; };
  for (const [k] of CATS) {
    const lines = trim(flowLines(fl[k]), polys[k]).map((pts, i) => ln(pts, W, { i }));
    const els = [{ k: 'clip', d: sil[k], rule: k === 'gallery' ? 'evenodd' : 'nonzero', hole: k === 'gallery' ? crPath(radial(42, 22, () => 6.5, 16), true) : '', els: lines }];
    let tip = [52, 9];
    if (k === 'write') { els.push(ln([[7, 59], [14, 51], [26, 38], [40, 22], [53, 8]], 2.2, { i: 12 })); tip = [53, 8]; }
    if (k === 'project') { els.push(ln([[18, 58], [18, 30], [18, 5]], 2.2, { i: 12 })); tip = [18, 5]; }
    if (k === 'gallery') { els.push(ln(crPath(radial(42, 22, () => 6.5, 16), true), 2, { i: 12 })); tip = [42, 22]; }
    if (k === 'create') { els.push(ln([[32, 17], [32, 34], [32, 53]], 2.2, { i: 12 })); tip = [32, 15]; }
    if (k === 'travel') { els.push(ln(crPath(radial(51, 12, () => 4.5, 14), true), 2, { i: 12 })); tip = [51, 12]; }
    if (k === 'other') { els.push(ln(crPath(radial(32, 32, () => 22, 24), true), 1.6, { i: 12 })); tip = [50, 19]; }
    els.push(em(tip[0], tip[1], 3));
    B.icons[k] = els;
  }
  // 装饰：一束风
  const r = rng(11), lines = [];
  for (let i = 0; i < 10; i++) {
    const x0 = 20 + r() * 110, x1 = 540 - r() * 90, pts = [];
    for (let x = x0; x <= x1; x += 14) { const t = x / 560; pts.push([x, 58 + i * 11 + 34 * Math.sin(x / 105 + i * 0.16) * t - 30 * t * t]); }
    lines.push(ln(pts, 1.6, { i }));
  }
  B.deco = { vb: [560, 220], els: lines };
  const og = [], r2 = rng(5);
  for (let i = 0; i < 22; i++) {
    const x0 = 420 + r2() * 220, x1 = 1190 - r2() * 120, pts = [];
    for (let x = x0; x <= x1; x += 24) { const t = (x - 400) / 800; pts.push([x, 150 + i * 17 + 70 * Math.sin(x / 170 + i * 0.13) * t - 60 * t * t]); }
    og.push(ln(pts, 2.6, { i }));
  }
  B.og = { vb: [1200, 630], els: og };
  const e = [], r3 = rng(8);
  for (let i = 0; i < 7; i++) {
    const x0 = 30 + r3() * 40, x1 = 160 + i * 18 - r3() * 30, pts = [];
    for (let x = x0; x <= x1; x += 10) pts.push([x, 70 + i * 12 + 6 * Math.sin(x / 40 + i * 0.4)]);
    e.push(ln(pts, 1.8, { i }));
  }
  e.push(ln(crPath(radial(250, 70, () => 14, 18), true), 1.8, { i: 8 }));
  B.empty = { vb: [320, 200], els: e };
}

/* ---------------- C 涟漪 ---------------- */
const C = { id: 'c', name: '涟漪', en: 'Ripple', icons: {} };
{
  const W = 1.6;
  const rings = (n, f, cx, cy, shift = [0, 0], seed = 1, jit = 0.25) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const s = 1 - i / n * 0.86, ox = cx + shift[0] * i, oy = cy + shift[1] * i;
      out.push(ln(crPath(jitter(radial(ox, oy, (t) => f(t) * s, 22), jit, seed + i), true), W, { i: n - 1 - i }));
    }
    return out;
  };
  const sq = (t, n) => 1 / Math.pow(Math.pow(Math.abs(Math.cos(t)), n) + Math.pow(Math.abs(Math.sin(t)), n), 1 / n);
  const defs = {
    write: [rings(4, (t) => 17 * (0.78 + 0.5 * Math.pow((1 + Math.cos(t + Math.PI / 4)) / 2, 3)), 30, 35, [1.2, -1.2], 3), [33, 31]],
    project: [rings(4, (t) => 21 * (1 + 0.14 * Math.cos(3 * (t + Math.PI / 2))), 32, 36, [0, -2], 5), [32, 28]],
    gallery: [rings(4, (t) => 21 * sq(t + 0.08, 3.6), 32, 32, [0.6, 0.4], 7), [33, 33]],
    create: [rings(4, (t) => 22 * (0.62 + 0.4 * Math.pow(Math.cos(t), 2)) * (1 - 0.12 * Math.exp(-Math.pow(t - 3 * Math.PI / 2, 2) * 6)), 32, 32, [0, 0.5], 9), [32, 33]],
    travel: [rings(5, (t) => 22 * (1 + 0.13 * Math.sin(2 * t + 1) + 0.09 * Math.sin(3 * t + 2) + 0.05 * Math.sin(5 * t)), 31, 33, [0.8, -0.5], 11, 0.3), [36, 30]],
    other: [rings(4, () => 22, 32, 32, [0.9, -0.6], 13), [35, 30]],
  };
  for (const [k] of CATS) { const [els, c] = defs[k]; C.icons[k] = els.concat([em(c[0], c[1], 3.2)]); }
  const terr = (cx, cy, R, n, seed, sh, w) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const s = 1 - i / n * 0.9, r = rng(seed);
      const a = [r() * 6, r() * 6, r() * 6];
      out.push(ln(crPath(radial(cx + sh[0] * i, cy + sh[1] * i, (t) => R * s * (1 + 0.14 * Math.sin(2 * t + a[0] + i * 0.15) + 0.09 * Math.sin(3 * t + a[1]) + 0.05 * Math.sin(5 * t + a[2] - i * 0.3)), 48), true, 0), w, { i: n - 1 - i }));
    }
    return out;
  };
  C.deco = { vb: [560, 220], els: terr(470, 118, 150, 8, 4, [-4, 2], 1.6).concat(terr(250, 180, 60, 3, 9, [2, -2], 1.6)) };
  C.og = { vb: [1200, 630], els: terr(930, 330, 420, 11, 21, [-10, 6], 2.6).concat(terr(560, 520, 130, 4, 3, [4, -3], 2.6)) };
  C.empty = { vb: [320, 200], els: terr(160, 100, 70, 4, 31, [0, 0], 1.8) };
}

/* ---------------- D 剪纸 ---------------- */
const D = { id: 'd', name: '剪纸', en: 'Paper Cut', icons: {} };
{
  const fl = (pts, role, i, dx, dy, closed = true) => ({ k: 'fl', d: typeof pts === 'string' ? pts : crPath(pts, closed), role, i, dx, dy });
  const W = 2;
  D.icons.write = [fl(radial(24, 40, () => 17, 20), 'cool', 0, -4, 4), fl([[12, 54], [16, 38], [26, 24], [40, 13], [54, 8], [49, 25], [39, 39], [25, 50]], 'line', 1, 4, -4), ln([[9, 57], [20, 44], [34, 28], [52, 10]], W, { i: 2 }), em(52, 10, 3)];
  D.icons.project = [fl(radial(36, 34, () => 20, 20), 'cool', 0, 4, 4), fl([[19, 9], [28, 5], [38, 11], [51, 8], [47, 19], [51, 31], [40, 27], [30, 32], [19, 28]], 'line', 1, -4, 0), ln([[18, 6], [18, 32], [18, 58]], W, { i: 2 }), em(18, 6, 3)];
  D.icons.gallery = [fl('M18,12H46Q52,12 52,18V46Q52,52 46,52H18Q12,52 12,46V18Q12,12 18,12Z', 'cool', 0, 0, 4), fl([[12, 52], [12, 44], [22, 34], [30, 40], [40, 29], [52, 41], [52, 52]], 'line', 1, 0, 5, true), ln(crPath(radial(40, 21, () => 5, 14), true), W, { i: 2 }), em(40, 21, 3)];
  D.icons.create = [fl(radial(32, 34, () => 22, 22), 'cool', 0, 0, 4), fl([[31, 20], [22, 15], [10, 18], [10, 46], [22, 44], [31, 49]], 'line', 1, -4, 0), fl([[33, 20], [42, 15], [54, 18], [54, 46], [42, 44], [33, 49]], 'line', 2, 4, 0), ln([[32, 18], [32, 34], [32, 52]], W, { i: 3 }), em(32, 15, 3)];
  D.icons.travel = [fl([[2, 56], [6, 44], [16, 30], [26, 38], [36, 22], [48, 36], [62, 44], [62, 56]], 'cool', 0, 0, 5), fl([[2, 58], [10, 48], [22, 42], [36, 47], [50, 40], [62, 46], [62, 58]], 'line', 1, 0, 5), ln(crPath(radial(46, 14, () => 6, 14), true), W, { i: 2 }), em(46, 14, 3)];
  D.icons.other = [fl(radial(32, 32, () => 22, 24), 'cool', 0, 0, 4), fl(crPath(radial(32, 32, () => 22, 24), true) + crPath(radial(40, 26, () => 18, 22), true), 'line', 1, -3, 3), ln(circlePts(32, 32, 26, 2.2, 4.4, 12), W, { i: 2 }), em(40, 26, 3)];
  D.icons.other[1].rule = 'evenodd';
  // 装饰：叠层的纸山与一根青线
  D.deco = { vb: [560, 220], els: [
    fl([[180, 220], [230, 170], [300, 120], [370, 140], [430, 90], [500, 110], [560, 80], [560, 220]], 'cool', 0, 0, 10),
    fl([[260, 220], [320, 180], [400, 170], [470, 140], [560, 150], [560, 220]], 'line', 1, 0, 10),
    ln([[150, 200], [260, 186], [380, 196], [500, 176], [556, 182]], 2, { i: 2 }),
    ln(crPath(radial(470, 54, () => 16, 18), true), 2, { i: 3 }),
  ] };
  D.og = { vb: [1200, 630], els: [
    fl([[420, 630], [520, 520], [640, 420], [760, 470], [880, 300], [1000, 360], [1120, 260], [1200, 280], [1200, 630]], 'cool', 0, 0, 20),
    fl([[560, 630], [680, 560], [820, 540], [960, 470], [1080, 500], [1200, 450], [1200, 630]], 'line', 1, 0, 20),
    ln([[400, 600], [600, 580], [800, 596], [1000, 566], [1190, 580]], 3.4, { i: 2 }),
    ln(crPath(radial(1010, 150, () => 48, 24), true), 3.4, { i: 3 }),
  ] };
  D.empty = { vb: [320, 200], els: [
    fl([[30, 200], [80, 150], [140, 130], [200, 150], [260, 120], [320, 140], [320, 200]], 'cool', 0, 0, 8),
    fl([[90, 200], [150, 175], [220, 170], [320, 160], [320, 200]], 'line', 1, 0, 8),
    ln(crPath(radial(220, 62, () => 18, 18), true), 2, { i: 2 }),
  ] };
}

/* ---------------- E 笔势 ---------------- */
const E = { id: 'e', name: '笔势', en: 'Brush', icons: {} };
{
  const br = (pts, w, prof = 'sym', i = 0) => ({ k: 'br', d: brush(pts, w, prof), c: crPath(pts), w: w * 1.8, i });
  E.icons.write = [br([[11, 56], [20, 44], [32, 29], [43, 17], [53, 8]], 5.2, 'head', 0), br([[52, 11], [47, 25], [37, 36], [24, 44]], 3.6, 'sym', 1), br([[14, 57], [30, 54], [44, 56], [54, 53]], 2.8, 'sym', 2), em(54, 53, 2.6)];
  E.icons.project = [br([[18, 59], [18, 34], [18, 7]], 3.6, 'tail', 0), br([[20, 11], [29, 6], [39, 12], [50, 8]], 5, 'sym', 1), br([[21, 27], [30, 23], [40, 29], [50, 25]], 3.8, 'sym', 2), em(18, 5, 2.6)];
  E.icons.gallery = [br([[13, 13], [12, 33], [13, 52], [33, 52], [52, 51]], 4.2, 'head', 0), br([[16, 12], [34, 12], [52, 13], [52, 30], [51, 46]], 3.2, 'tail', 1), br([[17, 45], [25, 34], [31, 40], [39, 28], [48, 43]], 3.6, 'sym', 2), em(42, 21, 2.8)];
  E.icons.create = [br([[31, 22], [21, 15], [10, 18], [10, 33], [11, 47]], 4, 'head', 0), br([[33, 22], [43, 15], [54, 18], [54, 33], [53, 47]], 4, 'head', 1), br([[11, 47], [22, 44], [32, 51], [43, 44], [53, 47]], 3, 'sym', 2), em(32, 16, 2.6)];
  E.icons.travel = [br([[5, 49], [16, 32], [22, 38], [32, 18], [43, 36], [49, 30], [59, 45]], 5, 'sym', 0), br(circlePts(50, 13, 5, -1.2, 4.4, 10), 2.8, 'head', 1), em(50, 13, 2.4)];
  E.icons.other = [br(circlePts(32, 32, 21, 2.6, 2.6 + Math.PI * 1.85, 22), 7, 'head', 0), em(32, 32, 3)];
  E.deco = { vb: [560, 220], els: [
    br([[120, 170], [220, 140], [320, 160], [420, 120], [540, 104]], 11, 'sym', 0),
    br([[250, 96], [330, 76], [420, 84], [500, 58]], 6, 'sym', 1),
    br(circlePts(480, 150, 14, 3.5, 3.5 + 5.5, 12), 4, 'head', 2),
  ] };
  E.og = { vb: [1200, 630], els: [
    br([[460, 520], [620, 450], [780, 490], [930, 380], [1080, 330], [1180, 300]], 26, 'sym', 0),
    br([[620, 300], [760, 250], [900, 270], [1050, 200]], 14, 'sym', 1),
    br(circlePts(1040, 470, 44, 3.5, 3.5 + 5.4, 18), 10, 'head', 2),
  ] };
  E.empty = { vb: [320, 200], els: [
    br([[40, 160], [120, 148], [200, 160], [290, 146]], 7, 'sym', 0),
    br(circlePts(214, 76, 22, 3.3, 3.3 + 5.4, 14), 5, 'head', 1),
  ] };
}

module.exports = { CATS, DIRS: [A, B, C, D, E] };
