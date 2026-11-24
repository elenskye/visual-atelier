// 水印的演示与检查用的假图，全部由程序画出，固定种子，同一份代码永远得到同样的像素。
// 站主的作品不进本仓库（CLAUDE.md），目录页、质量检查与小样都只用这些假图。
import sharp from 'sharp';

function noise(seed, cell) {
  const grid = new Map();
  const at = (x, y) => {
    const k = x * 73856093 ^ y * 19349663 ^ seed * 83492791;
    if (!grid.has(k)) grid.set(k, (((k * 1664525 + 1013904223) >>> 0) % 65536) / 65536);
    return grid.get(k);
  };
  const smooth = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const fx = x / cell, fy = y / cell, ix = Math.floor(fx), iy = Math.floor(fy);
    const u = smooth(fx - ix), v = smooth(fy - iy);
    const a = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * u;
    const b = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * u;
    return a + (b - a) * v;
  };
}

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

function paint(width, height, fn) {
  const data = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = fn(x, y);
      const i = (y * width + x) * 3;
      data[i] = clamp(r); data[i + 1] = clamp(g); data[i + 2] = clamp(b);
    }
  }
  return sharp(data, { raw: { width, height, channels: 3 } });
}

const KINDS = {
  // 亮：淡天与云，右下角很干净
  sky: { label: '亮处（天空）', size: [1800, 1200], draw(w, h) {
    const n = noise(3, 260), m = noise(5, 90);
    return (x, y) => { const c = n(x, y) * 0.75 + m(x, y) * 0.25, t = y / h; return [196 + 46 * c + 10 * t, 214 + 34 * c + 6 * t, 232 + 20 * c]; };
  } },
  // 暗：夜色与零星灯光
  night: { label: '暗处（夜景）', size: [1800, 1200], draw(w, h) {
    const n = noise(7, 320), m = noise(11, 14);
    return (x, y) => { const c = n(x, y), l = m(x, y) > 0.965 ? 150 : 0; return [12 + 26 * c + l, 18 + 30 * c + l * 0.9, 34 + 46 * c + l * 0.6]; };
  } },
  // 最难：中灰加密集纹理，深浅墨都不占便宜
  texture: { label: '中灰杂乱（最难）', size: [1600, 1600], draw() {
    const n = noise(13, 9), m = noise(17, 40);
    return (x, y) => { const c = (n(x, y) - 0.5) * 120 + (m(x, y) - 0.5) * 50; return [122 + c, 118 + c, 112 + c]; };
  } },
  // 竖幅：像一幅画，色块明显
  painting: { label: '竖幅（色块）', size: [1200, 1800], draw(w, h) {
    const n = noise(19, 300), m = noise(23, 120), k = noise(29, 500);
    return (x, y) => { const a = n(x, y), b = m(x, y), c = k(x, y), t = y / h; return [60 + 170 * a * (1 - t * 0.3), 50 + 110 * b + 50 * t, 70 + 150 * c * (1 - b * 0.4)]; };
  } },
  // 右下角杂乱、左下角干净：水印该自己换到左下角
  crowded: { label: '右下角杂乱', size: [1800, 1200], draw(w, h) {
    const n = noise(31, 7), s = noise(37, 280);
    return (x, y) => { const soft = 170 + 40 * s(x, y); if (x / w > 0.55 && y / h > 0.6) { const c = (n(x, y) - 0.5) * 180; return [90 + c, 96 + c, 84 + c]; } return [soft + 8, soft, soft - 12]; };
  } },
};

export const FAKE_KINDS = Object.keys(KINDS);
export const fakeLabel = (kind) => KINDS[kind].label;

/** 一张假图的 JPEG 字节。 */
export async function fakeImage(kind) {
  const { size: [w, h], draw } = KINDS[kind];
  return paint(w, h, draw(w, h)).jpeg({ quality: 90 }).toBuffer();
}
