// 「笔势与纸片」的几何：Catmull-Rom 平滑、收尖笔触、提按笔触、径向形状。
// 数值规则见 schemes/<方案>/DESIGN.md §4「笔势与纸片」与 tokens/graphic.json。
// 只用确定的运算（固定种子的伪随机、四舍五入到 1 位小数），同一份输入永远得到同一份路径。

/** 数字转字符串：保留 d 位小数，去掉多余的 0，不出现 -0。 */
export const num = (n, d = 1) => { const v = +(+n).toFixed(d); return Object.is(v, -0) ? 0 : v; };

/** 固定种子的线性同余伪随机，返回 [0, 1)。 */
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/** 点列 → 平滑的三次贝塞尔路径（Catmull-Rom）。closed 为闭合形。 */
export function crPath(pts, closed = false, d = 1) {
  const n = pts.length;
  if (n < 2) return '';
  const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let s = `M${num(pts[0][0], d)},${num(pts[0][1], d)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    s += `C${num(c1[0], d)},${num(c1[1], d)} ${num(c2[0], d)},${num(c2[1], d)} ${num(p2[0], d)},${num(p2[1], d)}`;
  }
  return s + (closed ? 'Z' : '');
}

/** 在 Catmull-Rom 曲线上按每段 per 个点采样。 */
export function crSample(pts, per = 8) {
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

/**
 * 收笔形状 → 半宽函数 W(t)，t ∈ [0, 1]。
 * sym：两头尖，sin(πt)^0.55；head：起笔重收笔尖，(1−t)^0.75，起笔 t < 0.1 内由 0.35 升到 1；tail：head 的镜像。
 * 最细处不小于最粗处的 12%。
 */
export function widthFn(prof, maxW, minRatio = 0.12) {
  return (t) => {
    let w;
    if (prof === 'sym') w = Math.pow(Math.sin(Math.PI * t), 0.55);
    else if (prof === 'head') w = Math.pow(1 - t, 0.75) * Math.min(1, t * 9 + 0.35);
    else w = Math.pow(t, 0.75) * Math.min(1, (1 - t) * 9 + 0.35);
    return Math.max(minRatio, w) * maxW / 2;
  };
}

/** 中心线 + 半宽函数 → 闭合填充轮廓。mult(t) 在半宽上再乘一个系数（提按用）。 */
function outline(c, W, mult = () => 1, d = 1) {
  const N = c.length, L = [], R = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const a = c[Math.max(0, i - 1)], b = c[Math.min(N - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const w = W(t) * mult(t);
    L.push([c[i][0] - dy * w, c[i][1] + dx * w]);
    R.push([c[i][0] + dy * w, c[i][1] - dx * w]);
  }
  return 'M' + L.concat(R.reverse()).map(([x, y]) => `${num(x, d)},${num(y, d)}`).join('L') + 'Z';
}

/** 光洁笔：图标、菜单栏、加载等 ≤ 160px 的图形。 */
export function brush(pts, maxW, prof = 'sym', g = {}) {
  const per = g.cleanSamplesPerSegment ?? 5;
  return outline(crSample(pts, per), widthFn(prof, maxW, g.minWidthRatio));
}

/**
 * 提按笔：宽 ≥ 400px 的大图。不用纹理，靠粗细的节奏——按下、提起、再按下。
 * 半宽 × m(t) × scale，m(t) = base + amp · cos²(π(cycles·t + φ))，φ 由种子取在 [0, phaseMax)。
 */
export function pressBrush(pts, maxW, prof = 'sym', seed = 1, g = {}) {
  const p = { base: 0.62, amp: 0.38, cycles: 1.25, phaseMax: 0.6, scale: 1.15, samplesPerSegment: 12, ...(g.press ?? {}) };
  const ph = rng(seed)() * p.phaseMax;
  const m = (t) => (p.base + p.amp * Math.pow(Math.cos(Math.PI * (p.cycles * t + ph)), 2)) * p.scale;
  return outline(crSample(pts, p.samplesPerSegment), widthFn(prof, maxW, g.minWidthRatio), m);
}

/** 径向形状：r(θ) → 闭合点列（纸片用）。 */
export function radial(cx, cy, rf, n = 40) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = rf(t);
    pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return pts;
}

/** 圆弧上的点列（圆相与绕圈的笔）。 */
export function circlePts(cx, cy, r, a0 = 0, a1 = Math.PI * 2, n = 16) {
  const out = [];
  for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n; out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
  return out;
}
