// 逐张对比本地画布和云端画布。云端那一边是在内置浏览器里「铺满」后截的图（Claude 画布只能在那里看），
// 本地这一边用无头 Chrome 按同样的视口、像素比、深色模式截本地界面的「铺满」。
// 两边都先裁出画板（和画布底色不同的区域），缩放到同一尺寸，再逐像素比。
// 用法：node test/tools/compare-cloud.mjs <画布名> <cloud.json> <输出目录> [--width 618 --height 706 --dpr 2 --base http://127.0.0.1:4321]
//   cloud.json：[[画板文件名, 云端截图路径], …]
import fs from 'node:fs';
import path from 'node:path';

const [name, listFile, outDir, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.join(' ').split('--').filter(Boolean).map((s) => s.trim().split(/\s+/)));
const W = Number(opt.width || 618);
const H = Number(opt.height || 706);
const DPR = Number(opt.dpr || 2);
const BASE = opt.base || 'http://127.0.0.1:4321';
const sharp = (await import('sharp')).default;
const pw = await import('playwright-core');
const chromium = pw.chromium || pw.default.chromium;
fs.mkdirSync(outDir, { recursive: true });
const list = JSON.parse(fs.readFileSync(listFile, 'utf8'));

// 画板区域：和画布底色差得多的行、列
async function boardRect(file, w, h, top) {
  const { data, info } = await sharp(file).resize(w, h, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => (y * info.width + x) * 3;
  const bg = [data[at(4, info.height - 4)], data[at(4, info.height - 4) + 1], data[at(4, info.height - 4) + 2]];
  const off = (x, y) => Math.abs(data[at(x, y)] - bg[0]) + Math.abs(data[at(x, y) + 1] - bg[1]) + Math.abs(data[at(x, y) + 2] - bg[2]) > 14;
  const rows = [];
  for (let y = top; y < info.height; y++) {
    let n = 0;
    for (let x = 0; x < info.width; x++) if (off(x, y)) n++;
    if (n > info.width * 0.3) rows.push(y);
  }
  if (!rows.length) return null;
  const y0 = rows[0];
  const y1 = rows[rows.length - 1];
  const cols = [];
  for (let x = 0; x < info.width; x++) {
    let n = 0;
    for (let y = y0; y <= y1; y++) if (off(x, y)) n++;
    if (n > (y1 - y0) * 0.3) cols.push(x);
  }
  if (!cols.length) return null;
  return { left: cols[0], top: y0, width: cols[cols.length - 1] - cols[0] + 1, height: y1 - y0 + 1 };
}

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR, colorScheme: 'dark' });
const page = await ctx.newPage();
const rows = [];
for (const [file, cloudShot] of list) {
  await page.goto(`${BASE}/#/${name}?board=${encodeURIComponent(file)}`);
  await page.waitForFunction(() => {
    const f = document.querySelector('#focus-body iframe');
    const w = f && f.contentWindow;
    return w && w.document.readyState === 'complete' && typeof w.__dcRootName === 'function' && !w.document.querySelector('x-dc');
  }, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  const localShot = path.join(outDir, `local-${file.replace(/\.dc\.html$/, '')}.png`);
  await page.screenshot({ path: localShot });

  const meta = await sharp(cloudShot).metadata();
  const cw = meta.width;
  const ch = meta.height;
  // 顶栏以下才算：云端有 claude.ai 的顶栏加一条铺满的顶栏，本地只有一条
  const rc = await boardRect(cloudShot, cw, ch, Number(opt.cloudtop || 110));
  const rl = await boardRect(localShot, cw, ch, Number(opt.localtop || 66));
  if (process.env.DEBUG) console.log(file, rc, rl);
  if (!rc || !rl || !rc.width || !rl.width) {
    rows.push({ file, verdict: '找不到画板区域', rc, rl });
    continue;
  }
  const size = { width: rc.width, height: rc.height };
  const crop = async (f, r) => sharp(await sharp(f).resize(cw, ch, { fit: 'fill' }).png().toBuffer()).extract(r).resize(size.width, size.height, { fit: 'fill' }).blur(1.2).removeAlpha().raw().toBuffer();
  const a = await crop(cloudShot, rc);
  const b = await crop(localShot, rl);
  // 两边裁剪框可能差一两个像素：在 ±3 像素内找最对得上的位置再算
  const Wd = size.width;
  const Hd = size.height;
  const m = 3;
  const score = (dx, dy, keep) => {
    let sum = 0;
    let bad = 0;
    let n = 0;
    for (let y = m; y < Hd - m; y++) {
      for (let x = m; x < Wd - m; x++) {
        const i = (y * Wd + x) * 3;
        const j = ((y + dy) * Wd + (x + dx)) * 3;
        const d = Math.max(Math.abs(a[i] - b[j]), Math.abs(a[i + 1] - b[j + 1]), Math.abs(a[i + 2] - b[j + 2]));
        sum += d;
        n++;
        if (d > 48) bad++;
        if (keep) keep[i] = Math.min(255, d * 3);
      }
    }
    return { mean: sum / n, badPct: (bad / n) * 100 };
  };
  let best = { dx: 0, dy: 0, ...score(0, 0) };
  for (let dy = -m; dy <= m; dy++) for (let dx = -m; dx <= m; dx++) {
    const r = score(dx, dy);
    if (r.mean < best.mean) best = { dx, dy, ...r };
  }
  const heat = Buffer.alloc(Wd * Hd * 3);
  score(best.dx, best.dy, heat);
  const { mean, badPct } = best;
  // 两边都轻微模糊过，线条边缘的锯齿和 JPEG 噪声不算；缺图、换色、错位会留下大块的差
  const verdict = mean < 5 && badPct < 0.5 ? '一致' : '有差异';
  const stem = file.replace(/\.dc\.html$/, '');
  const raw = { raw: { width: size.width, height: size.height, channels: 3 } };
  await sharp({ create: { width: size.width * 3 + 32, height: size.height, channels: 3, background: '#1a1a19' } })
    .composite([
      { input: await sharp(a, raw).png().toBuffer(), left: 0, top: 0 },
      { input: await sharp(b, raw).png().toBuffer(), left: size.width + 16, top: 0 },
      { input: await sharp(heat, raw).png().toBuffer(), left: size.width * 2 + 32, top: 0 }
    ])
    .png()
    .toFile(path.join(outDir, `compare-${stem}.png`));
  rows.push({ file, verdict, mean: Number(mean.toFixed(2)), badPct: Number(badPct.toFixed(2)), shift: [best.dx, best.dy], cloudRect: rc, localRect: rl });
}
await browser.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(rows, null, 2) + '\n');
for (const r of rows) console.log(`${r.verdict}  ${r.file}  平均差 ${r.mean ?? '-'}  明显不同的像素 ${r.badPct ?? '-'}%`);
