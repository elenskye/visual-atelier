// 几何工具：Catmull-Rom 平滑、抖动、收尖笔触、径向形状、流线填充
const f = (n, d = 1) => { const v = +(+n).toFixed(d); return Object.is(v, -0) ? 0 : v; };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function jitter(pts, amt, seed) {
  const r = rng(seed);
  return pts.map(([x, y]) => [x + (r() - 0.5) * 2 * amt, y + (r() - 0.5) * 2 * amt]);
}

// Catmull-Rom → cubic Bezier path
function crPath(pts, closed = false, d = 1) {
  const n = pts.length;
  if (n < 2) return '';
  const P = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let s = `M${f(pts[0][0], d)},${f(pts[0][1], d)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    s += `C${f(c1[0], d)},${f(c1[1], d)} ${f(c2[0], d)},${f(c2[1], d)} ${f(p2[0], d)},${f(p2[1], d)}`;
  }
  return s + (closed ? 'Z' : '');
}

// 在 Catmull-Rom 曲线上采样
function crSample(pts, per = 8) {
  const n = pts.length, out = [];
  const P = (i) => pts[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      const q = (a, b, c, e) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - e) * t2 + (-a + 3 * b - 3 * c + e) * t3);
      out.push([q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[n - 1]);
  return out;
}

// 收尖笔触：中心线 + 宽度函数 → 填充轮廓
function brush(pts, maxW, prof = 'sym', per = 5, d = 1) {
  const c = crSample(pts, per), N = c.length;
  const L = [], R = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const a = c[Math.max(0, i - 1)], b = c[Math.min(N - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    let w;
    if (prof === 'sym') w = Math.pow(Math.sin(Math.PI * t), 0.55);
    else if (prof === 'head') w = Math.pow(1 - t, 0.75) * Math.min(1, t * 9 + 0.35);
    else w = Math.pow(t, 0.75) * Math.min(1, (1 - t) * 9 + 0.35);
    w = Math.max(0.12, w) * maxW / 2;
    L.push([c[i][0] - dy * w, c[i][1] + dx * w]);
    R.push([c[i][0] + dy * w, c[i][1] - dx * w]);
  }
  const ring = L.concat(R.reverse());
  return 'M' + ring.map(([x, y]) => `${f(x, d)},${f(y, d)}`).join('L') + 'Z';
}

// 径向形状：r(θ) 函数 → 闭合点列
function radial(cx, cy, rf, n = 40) {
  const pts = [];
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; const r = rf(t); pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
  return pts;
}

// 流线：在 bbox 里生成一组平行波浪线（之后用 clipPath 裁）
function flowLines({ cx, cy, ang, span, spacing, amp, freq, phase = 0.55, step = 6, box = [-3, 67] }) {
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx; const lines = [];
  let i = 0;
  for (let o = -span; o <= span; o += spacing, i++) {
    const pts = [];
    for (let u = -span; u <= span; u += step) {
      const off = o + amp * Math.sin(freq * u + i * phase);
      const p = [cx + u * dx + off * nx, cy + u * dy + off * ny];
      if (p[0] >= box[0] && p[0] <= box[1] && p[1] >= box[0] && p[1] <= box[1]) pts.push(p);
    }
    if (pts.length > 1) lines.push(pts);
  }
  return lines;
}

function circlePts(cx, cy, r, a0 = 0, a1 = Math.PI * 2, n = 16) {
  const out = []; for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n; out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } return out;
}

module.exports = { f, rng, jitter, crPath, crSample, brush, radial, flowLines, circlePts };

// 飞白：前段实心，后段沿宽度裂成几缕、各自提前断开
function dryBrush(pts, maxW, prof = 'sym', seed = 1, strips = 3, per = 6, d = 1) {
  const { crSample: S, rng: R } = module.exports;
  const c = S(pts, per), N = c.length, r = R(seed);
  const W = (t) => {
    let w;
    if (prof === 'sym') w = Math.pow(Math.sin(Math.PI * t), 0.55);
    else if (prof === 'head') w = Math.pow(1 - t, 0.75) * Math.min(1, t * 9 + 0.35);
    else w = Math.pow(t, 0.75) * Math.min(1, (1 - t) * 9 + 0.35);
    return Math.max(0.12, w) * maxW / 2;
  };
  const rev = prof === 'tail';           // 收笔在起点的笔，裂口放在起点一侧
  const split = 0.5, gap = 0.1;
  const band = (a, b, t0, t1) => {
    const L = [], Rr = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1); if (t < t0 - 1e-6 || t > t1 + 1e-6) continue;
      const p = c[Math.max(0, i - 1)], q = c[Math.min(N - 1, i + 1)];
      let dx = q[0] - p[0], dy = q[1] - p[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
      const w = W(t);
      L.push([c[i][0] - dy * w * a, c[i][1] + dx * w * a]);
      Rr.push([c[i][0] - dy * w * b, c[i][1] + dx * w * b]);
    }
    if (L.length < 2) return '';
    return 'M' + L.concat(Rr.reverse()).map(([x, y]) => `${+x.toFixed(d)},${+y.toFixed(d)}`).join('L') + 'Z';
  };
  let out = rev ? band(-1, 1, 1 - split, 1) : band(-1, 1, 0, split);
  for (let j = 0; j < strips; j++) {
    const a = -1 + (2 * j) / strips + (j ? gap : 0), b = -1 + (2 * (j + 1)) / strips;
    const len = (j === 1 ? 0.92 : 0.6 + r() * 0.3);
    out += rev ? band(a, b, 1 - split - (1 - split) * len, 1 - split + 0.03) : band(a, b, split - 0.03, split + (1 - split) * len);
  }
  return out;
}
module.exports.dryBrush = dryBrush;

// —— Round 3 Fix：飞白的几种替代处理 ——
function widthFn(prof, maxW) {
  return (t) => {
    let w;
    if (prof === 'sym') w = Math.pow(Math.sin(Math.PI * t), 0.55);
    else if (prof === 'head') w = Math.pow(1 - t, 0.75) * Math.min(1, t * 9 + 0.35);
    else w = Math.pow(t, 0.75) * Math.min(1, (1 - t) * 9 + 0.35);
    return Math.max(0.12, w) * maxW / 2;
  };
}
// 在中心线上取一段 [t0,t1]、宽度区间 [a,b]（-1..1），thick(t) 可再乘一个收尖系数
function bandPath(c, W, a, b, t0, t1, taper = 0, d = 1) {
  const N = c.length, L = [], R = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1); if (t < t0 - 1e-6 || t > t1 + 1e-6) continue;
    const p = c[Math.max(0, i - 1)], q = c[Math.min(N - 1, i + 1)];
    let dx = q[0] - p[0], dy = q[1] - p[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const w = W(t), mid = (a + b) / 2, half = (b - a) / 2;
    let k = 1;
    if (taper) { const u = (t - t0) / Math.max(1e-6, t1 - t0); k = Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, u)))), taper); }
    const aa = mid - half * k, bb = mid + half * k;
    L.push([c[i][0] - dy * w * aa, c[i][1] + dx * w * aa]);
    R.push([c[i][0] - dy * w * bb, c[i][1] + dx * w * bb]);
  }
  if (L.length < 2) return '';
  return 'M' + L.concat(R.reverse()).map(([x, y]) => `${+x.toFixed(d)},${+y.toFixed(d)}`).join('L') + 'Z';
}
// 鬃丝飞白：前段实心，过半后分成多根鬃丝，每根一段段断开，边缘的先干
function bristleBrush(pts, maxW, prof = 'sym', seed = 1, n = 9) {
  const { crSample: S, rng: R } = module.exports;
  const c = S(pts, 10), r = R(seed), W = widthFn(prof, maxW);
  const rev = prof === 'tail', flip = (t) => rev ? 1 - t : t;
  const core = 0.42;
  let out = rev ? bandPath(c, W, -1, 1, 1 - core, 1) : bandPath(c, W, -1, 1, 0, core);
  const gap = 0.05;
  for (let j = 0; j < n; j++) {
    const a = -1 + (2 * j) / n + gap / 2, b = -1 + (2 * (j + 1)) / n - gap / 2;
    const edge = Math.abs((a + b) / 2);                       // 0 中间 → 1 边缘
    const end = 0.98 - edge * 0.28 - r() * 0.12;              // 边缘的鬃丝先干
    let t = core - 0.02;
    while (t < end) {
      const seg = 0.05 + r() * (0.16 - edge * 0.08);
      const t1 = Math.min(end, t + seg);
      const [u0, u1] = [flip(t), flip(t1)].sort((x, y) => x - y);
      out += bandPath(c, W, a, b, u0, u1, 0.35);
      t = t1 + 0.008 + r() * (0.02 + edge * 0.05) * (t / end);  // 越往后断口越多
    }
  }
  return out;
}
// 留白裂隙：外形完整，收笔一侧挖出几道细长的留白
function slitBrush(pts, maxW, prof = 'sym', seed = 1, k = 3) {
  const { crSample: S, rng: R, brush } = module.exports;
  const c = S(pts, 10), r = R(seed), W = widthFn(prof, maxW);
  const rev = prof === 'tail';
  let out = brush(pts, maxW, prof, 10);
  const lanes = [-0.5, 0.05, 0.42, -0.15, 0.6].slice(0, k);
  for (let j = 0; j < k; j++) {
    const a = lanes[j] + (r() - 0.5) * 0.12, th = 0.07 + r() * 0.07;
    const t0 = 0.48 + r() * 0.16, t1 = 0.86 + r() * 0.09;
    out += rev ? bandPath(c, W, a - th, a + th, 1 - t1, 1 - t0, 0.8) : bandPath(c, W, a - th, a + th, t0, t1, 0.8);
  }
  return out;
}
module.exports.bristleBrush = bristleBrush;
module.exports.slitBrush = slitBrush;

// 鬃丝飞白 v2：十几根互相重叠的鬃丝，每根的墨量沿笔走向递减并带低频起伏，
// 墨量低于阈值的地方断开；边缘的鬃丝先干。前段因为墨足而自然连成实心。
function inkBrush(pts, maxW, prof = 'sym', seed = 1, n = 14, dry = 1) {
  const { crSample: S, rng: R } = module.exports;
  const c = S(pts, 14), N = c.length, r = R(seed), W = widthFn(prof, maxW);
  const rev = prof === 'tail';
  const lane = 2 / n, over = lane * 0.35;
  let out = '';
  for (let j = 0; j < n; j++) {
    const mid = -1 + lane * (j + 0.5), a = mid - lane / 2 - over, b = mid + lane / 2 + over;
    const edge = Math.abs(mid);
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28], fr = [5 + r() * 4, 11 + r() * 6, 23 + r() * 9];
    const noise = (t) => 0.5 * Math.sin(fr[0] * t + ph[0]) + 0.3 * Math.sin(fr[1] * t + ph[1]) + 0.2 * Math.sin(fr[2] * t + ph[2]);
    // 墨量：起笔饱满，过 0.4 后加速变干；边缘干得更早
    const ink = (t) => 1 - dry * Math.pow(Math.max(0, (t - 0.32 + edge * 0.12) / 0.68), 1.6) * (1.05 + edge * 0.6);
    let run = null;
    const flush = (t1) => { if (run !== null && t1 - run > 0.015) { const [u0, u1] = rev ? [1 - t1, 1 - run] : [run, t1]; out += bandPath(c, W, a, b, u0, u1, 0.25); } run = null; };
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const on = ink(t) + 0.32 * noise(t) * Math.min(1, t * 2) > 0.18;
      if (on && run === null) run = t;
      if (!on && run !== null) flush(t);
    }
    flush(1);
  }
  return out;
}
module.exports.inkBrush = inkBrush;

// 提按：不靠纹理，靠粗细的节奏——按下、提起、再按下，收笔回锋成一个小顿点
function pressBrush(pts, maxW, prof = 'sym', seed = 1, d = 1) {
  const { crSample: S, rng: R } = module.exports;
  const c = S(pts, 12), N = c.length, r = R(seed), W = widthFn(prof, maxW);
  const ph = r() * 0.6, L = [], Rr = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const p = c[Math.max(0, i - 1)], q = c[Math.min(N - 1, i + 1)];
    let dx = q[0] - p[0], dy = q[1] - p[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const m = 0.62 + 0.38 * Math.pow(Math.cos(Math.PI * (1.25 * t + ph)), 2);
    const w = W(t) * m * 1.15;
    L.push([c[i][0] - dy * w, c[i][1] + dx * w]); Rr.push([c[i][0] + dy * w, c[i][1] - dx * w]);
  }
  return 'M' + L.concat(Rr.reverse()).map(([x, y]) => `${+x.toFixed(d)},${+y.toFixed(d)}`).join('L') + 'Z';
}
module.exports.pressBrush = pressBrush;
