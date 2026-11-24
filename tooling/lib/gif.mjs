import { PNG } from 'pngjs';
import gifenc from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifenc;

export const decodePng = (buf) => PNG.sync.read(buf);

/** 把相同的相邻帧合并，累加延迟。frames: [{ png: Buffer, delayMs }] */
export function mergeIdentical(frames) {
  const out = [];
  for (const f of frames) {
    const last = out[out.length - 1];
    if (last && Buffer.compare(last.png, f.png) === 0) last.delayMs += f.delayMs;
    else out.push({ ...f });
  }
  return out;
}

/**
 * 编码 GIF：全局调色板（所有帧合并量化），保证帧间颜色一致且结果确定。
 * loop: 0 = 无限循环，-1 = 只播一次。
 */
export function encodeGif(frames, { loop = 0 } = {}) {
  const decoded = frames.map((f) => ({ ...f, img: decodePng(f.png) }));
  const { width, height } = decoded[0].img;
  const total = decoded.reduce((n, f) => n + f.img.data.length, 0);
  const all = new Uint8Array(total);
  let off = 0;
  for (const f of decoded) { all.set(f.img.data, off); off += f.img.data.length; }
  const palette = quantize(all, 256, { format: 'rgb565' });
  const gif = GIFEncoder();
  decoded.forEach((f, i) => {
    const index = applyPalette(f.img.data, palette, 'rgb565');
    gif.writeFrame(index, width, height, i === 0 ? { palette, delay: f.delayMs, repeat: loop } : { delay: f.delayMs });
  });
  gif.finish();
  return Buffer.from(gif.bytes());
}

/** 把若干帧横向拼成一张总览图（PNG），用于目视自检。 */
export function contactSheet(pngs, { cols = 6, gap = 4, bg = [255, 255, 255, 255] } = {}) {
  const imgs = pngs.map(decodePng);
  const { width: w, height: h } = imgs[0];
  const rows = Math.ceil(imgs.length / cols);
  const W = cols * w + (cols + 1) * gap;
  const H = rows * h + (rows + 1) * gap;
  const sheet = new PNG({ width: W, height: H });
  for (let i = 0; i < W * H; i++) { sheet.data[i * 4] = bg[0]; sheet.data[i * 4 + 1] = bg[1]; sheet.data[i * 4 + 2] = bg[2]; sheet.data[i * 4 + 3] = bg[3]; }
  imgs.forEach((img, i) => {
    const ox = gap + (i % cols) * (w + gap);
    const oy = gap + Math.floor(i / cols) * (h + gap);
    PNG.bitblt(img, sheet, 0, 0, w, h, ox, oy);
  });
  return PNG.sync.write(sheet);
}

/** 逐像素比较两张同尺寸 PNG，返回 { diffPixels, maxChannelDiff, meanAbsDiff }。 */
export function diffPng(bufA, bufB, tolerance = 0) {
  const a = decodePng(bufA); const b = decodePng(bufB);
  if (a.width !== b.width || a.height !== b.height) return { sizeMismatch: true, a: [a.width, a.height], b: [b.width, b.height] };
  let diffPixels = 0, max = 0, sum = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    let px = 0;
    for (let c = 0; c < 4; c++) { const d = Math.abs(a.data[i + c] - b.data[i + c]); if (d > px) px = d; sum += d; }
    if (px > max) max = px;
    if (px > tolerance) diffPixels++;
  }
  return { diffPixels, maxChannelDiff: max, meanAbsDiff: sum / a.data.length, total: a.width * a.height };
}
