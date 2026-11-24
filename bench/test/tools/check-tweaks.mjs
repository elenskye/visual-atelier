// 验 Tweaks：在本地界面里铺满每张带某个 enum 参数的画板，用 Tweaks 面板逐个切换选项，
// 确认每个选项画出来都不一样、没有报错，再拼一张总览图（每行一张板，每列一个选项）。
// 用法：node test/tools/check-tweaks.mjs <画布名> <参数名> <输出目录> [--dark] [--base http://127.0.0.1:4321]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadConfig } from '../../src/utils/config.js';

const [name, prop, outDir, ...rest] = process.argv.slice(2);
const dark = rest.includes('--dark');
const BASE = rest.includes('--base') ? rest[rest.indexOf('--base') + 1] : 'http://127.0.0.1:4321';
const config = loadConfig();
const sharp = (await import('sharp')).default;
const pw = await import('playwright-core');
const chromium = pw.chromium || pw.default.chromium;
fs.mkdirSync(outDir, { recursive: true });

const canvas = await (await fetch(`${BASE}/api/canvases/${name}`)).json();
const boards = canvas.canvas.order.filter((f) => canvas.canvas.boards[f]);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && !/favicon/.test(m.text()) && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));

const rows = [];
for (const file of boards) {
  const pageId = canvas.canvas.boards[file].page;
  await page.goto(`${BASE}/#/${name}?${pageId ? `page=${pageId}&` : ''}board=${encodeURIComponent(file)}`);
  await page.waitForFunction(() => {
    const f = document.querySelector('#focus-body iframe');
    const w = f && f.contentWindow;
    return w && typeof w.__dcRootName === 'function' && !w.document.querySelector('x-dc');
  }, null, { timeout: 30000 });
  await page.waitForTimeout(800);
  await page.click('#focus-tweaks');
  await page.waitForTimeout(300);
  const field = await page.evaluate((p) => {
    const sel = [...document.querySelectorAll('#panel select')].find((s) => s.getAttribute('aria-label') === p);
    return sel ? [...sel.options].map((o) => o.textContent) : null;
  }, prop);
  if (!field) {
    rows.push({ file, options: null });
    continue;
  }
  if (dark) {
    await page.evaluate(() => {
      const cb = document.querySelector('#panel input[type="checkbox"][aria-label="dark"]');
      if (cb && !cb.checked) cb.click();
    });
  }
  const shots = [];
  for (let i = 0; i < field.length; i++) {
    await page.evaluate(([p, idx]) => {
      const sel = [...document.querySelectorAll('#panel select')].find((s) => s.getAttribute('aria-label') === p);
      sel.selectedIndex = idx;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }, [prop, i]);
    await page.waitForTimeout(700);
    const buf = await page.locator('#focus-body .focus-frame').screenshot();
    shots.push(buf);
  }
  const hashes = shots.map((b) => crypto.createHash('sha256').update(b).digest('hex'));
  rows.push({ file, options: field, distinct: new Set(hashes).size, shots });
}
await browser.close();

// 总览图
const tw = 300;
const withShots = rows.filter((r) => r.shots);
const th = Math.round(tw * 0.625);
const cols = Math.max(...withShots.map((r) => r.shots.length));
const pad = 12;
const tiles = [];
for (let r = 0; r < withShots.length; r++) {
  for (let c = 0; c < withShots[r].shots.length; c++) {
    tiles.push({ input: await sharp(withShots[r].shots[c]).resize(tw, th, { fit: 'contain', background: '#1a1a19' }).png().toBuffer(), left: pad + c * (tw + pad), top: pad + r * (th + pad) });
  }
}
const sheet = path.join(outDir, `tweaks-${prop}${dark ? '-dark' : ''}.png`);
await sharp({ create: { width: pad + cols * (tw + pad), height: pad + withShots.length * (th + pad), channels: 3, background: '#1a1a19' } }).composite(tiles).png().toFile(sheet);

for (const r of rows) console.log(r.options ? `${r.file}：${r.options.length} 个选项，画出来 ${r.distinct} 种不同` : `${r.file}：没有 ${prop}`);
console.log(errors.length ? `报错 ${errors.length} 条：\n${errors.slice(0, 5).join('\n')}` : '没有报错');
console.log(`总览图：${sheet}`);
