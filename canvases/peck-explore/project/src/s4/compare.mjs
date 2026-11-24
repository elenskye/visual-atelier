// 第 4 步 · 对一遍：第 3 步的控件板（S3-Controls，小样的 CSS）和 S4-Kit（只用挂上画布的 Design System）一格一格截图比。
// 两块画布目录各放一份本地生成的（PECK_LOCAL=1；浅色那份用 FLIP=1 生成），各自深色、浅色。结果写 compare.json（S4-Report 读它）。
// 用法：VA=<visual-atelier> node compare.mjs <深色那份的 canvases 目录> <浅色那份的 canvases 目录> [截图目录]
import path from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROWS } from './boards.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VA = process.env.VA;
const [darkDir, lightDir, shotDir] = process.argv.slice(2);
const STATES = ['d', 'h', 'f', 'p', 'o', 'x'];
const { startServer } = await import(pathToFileURL(path.join(VA, 'bench/src/server/server.js')));
const { loadConfig } = await import(pathToFileURL(path.join(VA, 'bench/src/utils/config.js')));
const { launchBrowser } = await import(pathToFileURL(path.join(VA, 'tooling/lib/browser.mjs')));
const browser = await launchBrowser();
if (shotDir) mkdirSync(shotDir, { recursive: true });

async function cells(srv, file) {
  const page = await browser.newPage({ viewport: { width: 1760, height: 1300 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.goto(`${srv.baseUrl}/c/peck-explore/${file}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const f = page.frames().find((fr) => fr.url().includes(file)) || page.mainFrame();
  await f.evaluate(() => document.fonts.ready);
  // 两张板表头的说明字不一样长，行高差出小数像素，字的抗锯齿就不一样：比之前把两边的行高都钉成同样的整数
  await f.addStyleTag({ content: '.ft{height:34px !important}.mx .hd{height:56px !important}.mx .nm3,.mx .cell{height:60px !important;min-height:0 !important}' });
  await page.waitForTimeout(300);
  const els = await f.$$('.mx .cell');
  const out = [];
  for (const el of els) {
    const child = await el.$(':scope > *');
    if (!child) { out.push(null); continue; }
    const b = await child.boundingBox();
    const png = await page.screenshot({ clip: { x: Math.floor(b.x), y: Math.floor(b.y), width: Math.ceil(b.width), height: Math.ceil(b.height) } });
    out.push({ w: Math.round(b.width), h: Math.round(b.height), png });
  }
  await page.close();
  return out;
}
// 两张截图比像素：两边的格子落在不同的小数像素上，整张错开 1 像素就全不一样，所以上下左右各挪 0–1 像素取最好的那次；
// 任一通道差 > 48 算这一点不一样，不一样的点 < 2% 算一样。尺寸差 1 像素以上直接算不一样。
async function diff(a, b) {
  if (Math.abs(a.w - b.w) > 1 || Math.abs(a.h - b.h) > 1) return { pct: 100, size: `${a.w}×${a.h} → ${b.w}×${b.h}` };
  const page = await browser.newPage();
  const pct = await page.evaluate(async ([x, y]) => {
    const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
    const [i1, i2] = await Promise.all([load(x), load(y)]);
    const W = Math.min(i1.width, i2.width), H = Math.min(i1.height, i2.height);
    const g = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0); return { d: ctx.getImageData(0, 0, img.width, img.height).data, w: img.width }; };
    const A = g(i1), B = g(i2);
    let best = 100;
    for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) {
      let n = 0, t = 0;
      for (let yy = 1; yy < H - 1; yy++) for (let xx = 1; xx < W - 1; xx++) {
        const p = (yy * A.w + xx) * 4, q = ((yy + dy) * B.w + xx + dx) * 4;
        t++;
        if (Math.abs(A.d[p] - B.d[q]) > 48 || Math.abs(A.d[p + 1] - B.d[q + 1]) > 48 || Math.abs(A.d[p + 2] - B.d[q + 2]) > 48) n++;
      }
      best = Math.min(best, (100 * n) / t);
    }
    return best;
  }, [a.png.toString('base64'), b.png.toString('base64')]);
  await page.close();
  return { pct: Math.round(pct * 10) / 10 };
}

const result = {};
for (const [theme, dir] of [['dark', darkDir], ['light', lightDir]]) {
  process.env.DW_CANVASES = path.resolve(dir);
  const srv = await startServer(loadConfig(), { port: 0, watch: false, quiet: true });
  const s3 = await cells(srv, 'S3-Controls.dc.html');
  const s4 = await cells(srv, 'S4-Kit.dc.html');
  await srv.close();
  if (s3.length !== s4.length) throw new Error(`格数不一样：${s3.length} / ${s4.length}`);
  const diffs = [];
  let same = 0, total = 0;
  for (let i = 0; i < s3.length; i++) {
    if (!s3[i] || !s4[i]) continue;
    total++;
    const row = ROWS[Math.floor(i / 6)][0], state = STATES[i % 6];
    const d = await diff(s3[i], s4[i]);
    if (d.pct < 2) same++;
    else diffs.push({ row, state, ...d });
    if (shotDir && d.pct >= 2) {
      writeFileSync(path.join(shotDir, `${theme}-${i}-s3.png`), s3[i].png);
      writeFileSync(path.join(shotDir, `${theme}-${i}-s4.png`), s4[i].png);
    }
  }
  result[theme] = { same, total, diffs };
  console.log(`${theme}：${same}/${total} 格一样` + diffs.map((d) => `\n  ${d.row} · ${d.state}：${d.size || d.pct + '%'}`).join(''));
}
await browser.close();
writeFileSync(path.join(HERE, 'compare.json'), JSON.stringify({ at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'), ...result }, null, 2) + '\n');
