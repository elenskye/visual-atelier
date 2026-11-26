import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { canvasDir } from './store.js';
import { boardsOf, boardUrl, stemOf } from './check.js';
import { startServer } from '../server/server.js';
import { captureFrames, captureUrl } from '../server/headless.js';

// dw frames（2026-11-22，Phase 5 的教训：dw check 只截减弱动效下的终态，Agent 看不到自己画的动效）：
// 一张画板在不减弱动效的情况下，按时间线截几帧，拼成一张总览图。要先点一下才动的，先 --click。
// 帧在 .shots/frames/<画板名>/，总览图 .shots/frames/<画板名>.png（都不进 Git）。只为看动效，不保证两次一样；
// 导出要确定的东西用 dw export、npm run build:motion。

export const MAX_FRAMES = 24;

/** --at 0,300,600 或 --every 250 --until 2000（默认每 250ms 一帧到 2000ms）。 */
export function frameTimes({ at = null, every = null, until = null } = {}) {
  let times;
  if (at && at.length) times = at.map(Number);
  else {
    const step = every != null ? Number(every) : 250;
    const end = until != null ? Number(until) : 2000;
    if (step <= 0) throw new Error('--every 要大于 0');
    times = [];
    for (let t = 0; t <= end; t += step) times.push(t);
  }
  if (times.some((t) => !Number.isFinite(t) || t < 0)) throw new Error('时间点要是不小于 0 的毫秒数');
  times = [...new Set(times)].sort((a, b) => a - b);
  if (times.length > MAX_FRAMES) throw new Error(`一次最多 ${MAX_FRAMES} 帧（现在 ${times.length} 帧）：把 --every 调大或 --until 调小`);
  return times;
}

/** How many frames a row of the contact sheet holds. */
const sheetCols = (count, thumbW) => Math.min(count, thumbW > 400 ? 3 : 4);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 总览页：每帧一格，标上时间点和实际截到的时间。 */
function sheetHtml({ title, frames, thumbW, thumbH }) {
  const cols = sheetCols(frames.length, thumbW);
  const cells = frames
    .map((f) => `<figure><img src="${esc(f.file)}" width="${thumbW}" height="${thumbH}" alt=""><figcaption><b>${f.t} ms</b>${f.actual !== f.t ? `<span>实际 ${f.actual} ms</span>` : ''}</figcaption></figure>`)
    .join('\n');
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
html,body{margin:0;background:#f4f4f2;color:#1d1d1f;font:13px/1.4 -apple-system,BlinkMacSystemFont,"PingFang SC","Noto Sans SC",sans-serif}
main{display:grid;grid-template-columns:repeat(${cols},${thumbW}px);gap:14px;padding:16px;width:max-content}
h1{grid-column:1/-1;margin:0;font-size:13px;font-weight:600}
figure{margin:0}
img{display:block;border-radius:6px;box-shadow:0 0 0 1px rgb(0 0 0 / .12);background:#fff}
figcaption{display:flex;gap:8px;margin-top:5px}
figcaption span{color:#6e6e73}
</style></head><body><main><h1>${esc(title)}</h1>
${cells}
</main></body></html>
`;
}

/**
 * 截一张板的时间线。返回 { file, size, sheet, frames: [{ t, actual, png }], missedClicks, errors }。
 * @param {object} o
 * @param {string} o.board  画板文件名（必填）
 * @param {number[]} o.times 时间点（frameTimes 算好的）
 * @param {string[]} [o.clicks] 先点这些字的按钮
 * @param {number} [o.scale] 帧的倍数，默认 1
 */
export async function runFrames(config, name, { board, times, clicks = [], scale = 1 }) {
  if (!board) throw new Error('要写 --board <画板文件>：一次只截一张');
  const dir = canvasDir(config, name);
  const [b] = boardsOf(config, name, board);
  const stem = stemOf(b.file);
  const outDir = path.join(dir, '.shots', 'frames', stem);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  let r;
  try {
    r = await captureFrames(config, boardUrl(srv.baseUrl, name, b), { width: b.w, height: b.h, scale, times, clicks });
  } finally {
    await srv.close();
  }
  const frames = r.frames.map((f) => {
    const file = `${String(f.t).padStart(5, '0')}ms.png`;
    fs.writeFileSync(path.join(outDir, file), f.png);
    return { t: f.t, actual: f.actual, file, png: path.join(outDir, file) };
  });
  const errors = [...r.allErrors, ...(r.ready ? [] : ['没等到画板渲染完'])];
  let sheet = null;
  if (frames.length) {
    const thumbW = Math.min(b.w, b.w >= 960 ? 480 : 320);
    const thumbH = Math.round((b.h / b.w) * thumbW);
    const title = `${name} / ${b.file} · ${clicks.length ? `先点「${clicks.join('」「')}」，` : ''}从画完那一刻算起`;
    const html = path.join(outDir, 'sheet.html');
    fs.writeFileSync(html, sheetHtml({ title, frames, thumbW, thumbH }));
    const cols = sheetCols(frames.length, thumbW);
    const rows = Math.ceil(frames.length / cols);
    sheet = path.join(dir, '.shots', 'frames', `${stem}.png`);
    await captureUrl(config, pathToFileURL(html).href, sheet, { width: 32 + cols * thumbW + (cols - 1) * 14, height: 40 + rows * (thumbH + 34), scale: 1, fullPage: true });
  }
  return { file: b.file, size: `${b.w}×${b.h}`, sheet, frames, missedClicks: r.missedClicks || [], errors };
}
