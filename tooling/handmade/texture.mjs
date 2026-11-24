// 纸纹的一小块：照 SVG 规范里 feTurbulence 的参考算法（fractalNoise，接缝对齐）算好，存成能平铺的 PNG。
// 以前每张纸、每张卡片各放一层实时的 feTurbulence 滤镜，WebKit 里它是 CPU 逐像素算的，一页要卡一秒；
// 现在算一次，样式里当背景平铺（bundle.css 的 .pm-tex）。数值来自 tokens/handmade.json 的 texture，同样的数值两次算出来逐字节一样。
//   baseFrequency、numOctaves  和原来的滤镜一样
//   tile     一块的边长（CSS 像素）；baseFrequency 会照规范微调到让这一块正好接上
//   scale    一块里每个 CSS 像素算几个点（2：视网膜屏上和原来一样细）
//   levels   透明度分几档（颜色只有一种，存成带调色板的 PNG，小）
// 颜色：原来的 feColorMatrix 把噪声变成一种灰绿（线性 RGB .32 .36 .26）、透明度 1.6 × 噪声 − .62。
import zlib from 'node:zlib';

const BSIZE = 0x100, BM = 0xff, PERLIN_N = 0x1000;
const RAND_M = 2147483647, RAND_A = 16807, RAND_Q = 127773, RAND_R = 2836;

function lattice(seed) {
  let s = seed;
  if (s <= 0) s = -(s % (RAND_M - 1)) + 1;
  if (s > RAND_M - 1) s = RAND_M - 1;
  const random = () => {
    let r = RAND_A * (s % RAND_Q) - RAND_R * Math.floor(s / RAND_Q);
    if (r <= 0) r += RAND_M;
    return (s = r);
  };
  const sel = new Int32Array(BSIZE + BSIZE + 2);
  const grad = Array.from({ length: 4 }, () => Array.from({ length: BSIZE + BSIZE + 2 }, () => [0, 0]));
  for (let k = 0; k < 4; k++) {
    for (let i = 0; i < BSIZE; i++) {
      sel[i] = i;
      const g = grad[k][i];
      for (let j = 0; j < 2; j++) g[j] = ((random() % (BSIZE + BSIZE)) - BSIZE) / BSIZE;
      const len = Math.sqrt(g[0] * g[0] + g[1] * g[1]);
      g[0] /= len;
      g[1] /= len;
    }
  }
  for (let i = BSIZE - 1; i > 0; i--) {
    const k = sel[i];
    const j = random() % BSIZE;
    sel[i] = sel[j];
    sel[j] = k;
  }
  for (let i = 0; i < BSIZE + 2; i++) {
    sel[BSIZE + i] = sel[i];
    for (let k = 0; k < 4; k++) grad[k][BSIZE + i] = grad[k][i].slice();
  }
  return { sel, grad };
}

const sCurve = (t) => t * t * (3 - 2 * t);
const lerp = (t, a, b) => a + t * (b - a);

function noise2({ sel, grad }, ch, vx, vy, st) {
  let t = vx + PERLIN_N;
  let bx0 = Math.floor(t), bx1 = bx0 + 1;
  const rx0 = t - Math.floor(t), rx1 = rx0 - 1;
  t = vy + PERLIN_N;
  let by0 = Math.floor(t), by1 = by0 + 1;
  const ry0 = t - Math.floor(t), ry1 = ry0 - 1;
  if (bx0 >= st.wrapX) bx0 -= st.w;
  if (bx1 >= st.wrapX) bx1 -= st.w;
  if (by0 >= st.wrapY) by0 -= st.h;
  if (by1 >= st.wrapY) by1 -= st.h;
  bx0 &= BM; bx1 &= BM; by0 &= BM; by1 &= BM;
  const i = sel[bx0], j = sel[bx1];
  const g = grad[ch];
  const q00 = g[sel[i + by0]], q10 = g[sel[j + by0]], q01 = g[sel[i + by1]], q11 = g[sel[j + by1]];
  const sx = sCurve(rx0), sy = sCurve(ry0);
  const a = lerp(sx, rx0 * q00[0] + ry0 * q00[1], rx1 * q10[0] + ry0 * q10[1]);
  const b = lerp(sx, rx0 * q01[0] + ry1 * q01[1], rx1 * q11[0] + ry1 * q11[1]);
  return lerp(sy, a, b);
}

/** 规范里接缝对齐的做法：把频率调到一块里正好是整数个格子（取离原来近的那个）。 */
function stitchFreq(freq, tile) {
  const lo = Math.floor(tile * freq) / tile, hi = Math.ceil(tile * freq) / tile;
  return freq / lo < hi / freq ? lo : hi;
}

/** 一块里每个点的噪声（0–1，fractalNoise 的红色通道）。 */
export function noiseTile({ baseFrequency, numOctaves, tile, scale = 2, seed = 3 }) {
  const lat = lattice(seed);
  const freq = stitchFreq(baseFrequency, tile);
  const n = tile * scale;
  const out = new Float64Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let vx = (x / scale) * freq, vy = (y / scale) * freq, ratio = 1, sum = 0;
      const st = { w: Math.round(tile * freq), h: Math.round(tile * freq), wrapX: 0, wrapY: 0 };
      st.wrapX = PERLIN_N + st.w;
      st.wrapY = PERLIN_N + st.h;
      for (let o = 0; o < numOctaves; o++) {
        sum += noise2(lat, 0, vx, vy, st) / ratio;
        vx *= 2; vy *= 2; ratio *= 2;
        st.w *= 2; st.h *= 2;
        st.wrapX = 2 * st.wrapX - PERLIN_N;
        st.wrapY = 2 * st.wrapY - PERLIN_N;
      }
      out[y * n + x] = Math.min(1, Math.max(0, (sum + 1) / 2));
    }
  }
  return out;
}

const chunk = (type, data) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
};
const srgb = (lin) => Math.round(255 * (lin <= 0.0031308 ? 12.92 * lin : 1.055 * lin ** (1 / 2.4) - 0.055));

/** 纸纹的 PNG（带调色板：一种颜色，levels 档透明度）。 */
export function texturePng(t) {
  const scale = t.scale ?? 2, levels = t.levels ?? 32;
  const n = t.tile * scale;
  const noise = noiseTile({ ...t, scale });
  const raw = Buffer.alloc((n + 1) * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const a = Math.min(1, Math.max(0, 1.6 * noise[y * n + x] - 0.62));
      raw[y * (n + 1) + 1 + x] = Math.round(a * (levels - 1));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(n, 0);
  ihdr.writeUInt32BE(n, 4);
  ihdr.set([8, 3, 0, 0, 0], 8);
  const rgb = [0.32, 0.36, 0.26].map(srgb);
  const plte = Buffer.concat(Array.from({ length: levels }, () => Buffer.from(rgb)));
  const trns = Buffer.from(Array.from({ length: levels }, (_, i) => Math.round((255 * i) / (levels - 1))));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('PLTE', plte),
    chunk('tRNS', trns),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export const textureDataUri = (t) => `data:image/png;base64,${texturePng(t).toString('base64')}`;
