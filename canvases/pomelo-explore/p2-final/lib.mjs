// VL2 · Phase 1 第一轮样例的几何与上色。只用于探索，不是方案的源文件。
// 手绘感：沿路径均匀取点，按平滑噪声沿法线方向偏移，再用 Catmull-Rom 连成曲线。
// 同一个 seed 永远得到同一条线，两次生成结果一致。

export const f = (n) => { const v = Math.round(n * 10) / 10; return Object.is(v, -0) ? '0' : String(v); };
const f1 = f;

export function rng(seed) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 不闭合的平滑噪声，值大约在 -1..1
function noise(seed) {
  const r = rng(seed);
  const cs = [1, 2.1, 3.7].map((k, i) => ({ k: k * (0.8 + 0.4 * r()), p: r() * 6.283, a: [1, 0.45, 0.2][i] }));
  return (x) => cs.reduce((s, c) => s + c.a * Math.sin(c.k * x + c.p), 0) / 1.65;
}

// 闭合的平滑噪声：整数频率，绕一圈首尾相接
function pnoise(seed) {
  const r = rng(seed);
  const cs = [2, 3, 5].map((k, i) => ({ k, p: r() * 6.283, a: [1, 0.55, 0.3][i] }));
  return (u) => cs.reduce((s, c) => s + c.a * Math.sin(c.k * u * 6.283 + c.p), 0) / 1.85;
}

// ---------- 路径命令 ----------
// cmds: [['M',x,y],['L',x,y],['C',x1,y1,x2,y2,x,y],['Q',x1,y1,x,y],['Z']]
const K = 0.5523;
export function ellipse(cx, cy, rx, ry, rot = 0) {
  const pts = [
    ['M', cx + rx, cy],
    ['C', cx + rx, cy + ry * K, cx + rx * K, cy + ry, cx, cy + ry],
    ['C', cx - rx * K, cy + ry, cx - rx, cy + ry * K, cx - rx, cy],
    ['C', cx - rx, cy - ry * K, cx - rx * K, cy - ry, cx, cy - ry],
    ['C', cx + rx * K, cy - ry, cx + rx, cy - ry * K, cx + rx, cy],
    ['Z'],
  ];
  return rot ? rotate(pts, cx, cy, rot) : pts;
}
export const circle = (cx, cy, r) => ellipse(cx, cy, r, r);
export function rrect(x, y, w, h, r) {
  return [
    ['M', x + r, y], ['L', x + w - r, y], ['Q', x + w, y, x + w, y + r],
    ['L', x + w, y + h - r], ['Q', x + w, y + h, x + w - r, y + h],
    ['L', x + r, y + h], ['Q', x, y + h, x, y + h - r],
    ['L', x, y + r], ['Q', x, y, x + r, y], ['Z'],
  ];
}
export function mapCmds(cmds, fn) {
  return cmds.map((c) => {
    if (c[0] === 'Z') return c;
    const out = [c[0]];
    for (let i = 1; i < c.length; i += 2) { const [x, y] = fn(c[i], c[i + 1]); out.push(x, y); }
    return out;
  });
}
export function rotate(cmds, cx, cy, deg) {
  const a = (deg * Math.PI) / 180, co = Math.cos(a), si = Math.sin(a);
  return mapCmds(cmds, (x, y) => [cx + (x - cx) * co - (y - cy) * si, cy + (x - cx) * si + (y - cy) * co]);
}
export const move = (cmds, dx, dy) => mapCmds(cmds, (x, y) => [x + dx, y + dy]);
export const scale = (cmds, s, ox = 0, oy = 0) => mapCmds(cmds, (x, y) => [ox + (x - ox) * s, oy + (y - oy) * s]);
// 'M10 20 L30 40 C… Q… Z' 这样的简单字符串（只用绝对的 M L C Q Z）
export function P(str) {
  const tok = str.match(/[MLCQZ]|-?\d*\.?\d+/g);
  const out = []; let i = 0;
  const n = { M: 2, L: 2, C: 6, Q: 4, Z: 0 };
  while (i < tok.length) {
    const t = tok[i++];
    const args = tok.slice(i, i + n[t]).map(Number); i += n[t];
    out.push([t, ...args]);
  }
  return out;
}
export const cmdsToD = (cmds) => cmds.map((c) => c[0] + c.slice(1).map(f).join(' ')).join('');

// 把命令拆成若干段折线
export function sample(cmds, step = 0.6) {
  const subs = []; let cur = null, x = 0, y = 0, sx = 0, sy = 0;
  const line = (x2, y2) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x, y2 - y) / step));
    for (let i = 1; i <= n; i++) cur.pts.push([x + ((x2 - x) * i) / n, y + ((y2 - y) * i) / n]);
    x = x2; y = y2;
  };
  for (const c of cmds) {
    if (c[0] === 'M') { cur = { pts: [[c[1], c[2]]], closed: false }; subs.push(cur); x = sx = c[1]; y = sy = c[2]; }
    else if (c[0] === 'L') line(c[1], c[2]);
    else if (c[0] === 'C' || c[0] === 'Q') {
      const p = c[0] === 'Q'
        ? [x, y, x + (2 / 3) * (c[1] - x), y + (2 / 3) * (c[2] - y), c[3] + (2 / 3) * (c[1] - c[3]), c[4] + (2 / 3) * (c[2] - c[4]), c[3], c[4]]
        : [x, y, ...c.slice(1)];
      const len = Math.hypot(p[2] - p[0], p[3] - p[1]) + Math.hypot(p[4] - p[2], p[5] - p[3]) + Math.hypot(p[6] - p[4], p[7] - p[5]);
      const n = Math.max(4, Math.ceil(len / step));
      for (let i = 1; i <= n; i++) {
        const t = i / n, u = 1 - t;
        cur.pts.push([
          u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6],
          u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7],
        ]);
      }
      x = p[6]; y = p[7];
    } else if (c[0] === 'Z') { if (Math.hypot(x - sx, y - sy) > 1e-6) line(sx, sy); cur.closed = true; }
  }
  return subs;
}

function resample(pts, sp) {
  const out = [pts[0]]; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    let [ax, ay] = pts[i - 1]; const [bx, by] = pts[i];
    let seg = Math.hypot(bx - ax, by - ay);
    while (acc + seg >= sp) {
      const t = (sp - acc) / seg;
      ax += (bx - ax) * t; ay += (by - ay) * t;
      out.push([ax, ay]); seg = Math.hypot(bx - ax, by - ay); acc = 0;
    }
    acc += seg;
  }
  const last = pts[pts.length - 1], tail = out[out.length - 1];
  if (Math.hypot(last[0] - tail[0], last[1] - tail[1]) > sp * 0.3) out.push(last);
  return out;
}

const fi = (n) => { const v = Math.round(n); return Object.is(v, -0) ? '0' : String(v); };
function cr(p, closed, prec = 1) {
  const f = prec ? f1 : fi;
  const n = p.length;
  if (n < 2) return '';
  const at = (i) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}

function normalAt(seq, i) {
  const a = seq[Math.max(0, i - 1)], b = seq[Math.min(seq.length - 1, i + 1)];
  let nx = -(b[1] - a[1]), ny = b[0] - a[0];
  const l = Math.hypot(nx, ny) || 1;
  return [nx / l, ny / l];
}

// 手画的描边：闭合图形从随机处起笔，多画一点再收，首尾不完全对齐
export function handStroke(cmds, { amp = 0.8, wave = 9, seed = 1, over = 0.06, drift = 0.9, sp = 0.9, keep = 3, prec = 1 } = {}) {
  return sample(cmds).map((sub, k) => {
    const pts = resample(sub.pts, sp);
    if (pts.length < 2) return '';
    const nz = noise(seed * 31 + k);
    let seq = pts;
    if (sub.closed) {
      const N = pts.length - 1; // 最后一点和第一点重合
      const start = Math.floor(rng(seed * 7 + k)() * N);
      const extra = Math.round(N * over);
      seq = [];
      for (let i = 0; i <= N + extra; i++) seq.push(pts[(start + i) % N]);
    }
    const out = seq.map((p, i) => {
      const [nx, ny] = normalAt(seq, i);
      const off = amp * nz((i * sp) / wave) + (sub.closed ? drift * amp * (i / seq.length - 0.5) : 0);
      return [p[0] + nx * off, p[1] + ny * off];
    });
    const dec = out.filter((_, i) => i % keep === 0 || i === out.length - 1);
    return cr(dec, false, prec);
  }).join('');
}

// 手剪的填色块：闭合、边缘轻微起伏
export function handFill(cmds, { amp = 0.5, seed = 1, sp = 0.9, keep = 3, prec = 1 } = {}) {
  return sample(cmds).map((sub, k) => {
    let pts = resample(sub.pts, sp);
    if (!sub.closed) return cr(pts.filter((_, i) => i % keep === 0), false, prec);
    pts = pts.slice(0, -1);
    const N = pts.length;
    const nz = pnoise(seed * 13 + k);
    const out = pts.map((p, i) => {
      const [nx, ny] = normalAt([pts[(i - 1 + N) % N], p, pts[(i + 1) % N]], 1);
      const off = amp * nz(i / N);
      return [p[0] + nx * off, p[1] + ny * off];
    });
    return cr(out.filter((_, i) => i % keep === 0), true, prec);
  }).join('');
}

export function mix(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
