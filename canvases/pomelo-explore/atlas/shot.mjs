// 走一遍 Atlas-Main 画板，截几张图自检（本地服务要开着：node bench/bin/dw.js serve；不是 4321 端口时设 DW_PORT）。
// 用法：VA_BROWSER_CHANNEL=chrome node canvases/pomelo-explore/atlas/shot.mjs <放截图的目录> [dark]
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { rootImport } from '../../_lib/root.mjs';

const { launchBrowser } = await rootImport('tooling/lib/browser.mjs');
const out = process.argv[2];
const dark = process.argv[3] === 'dark';
if (!out) { console.error('用法：node canvases/pomelo-explore/atlas/shot.mjs <目录> [dark]'); process.exit(2); }
mkdirSync(out, { recursive: true });
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${process.env.DW_PORT || 4321}/c/pomelo-explore/Atlas-Main.dc.html`, { waitUntil: 'networkidle' });
await page.waitForSelector('.root .pm-env');
if (dark) await page.evaluate(() => { document.querySelectorAll('.root').forEach((r) => { r.dataset.theme = 'dark'; }); });
const shot = (name) => page.screenshot({ path: path.join(out, `${name}${dark ? '-dark' : ''}.png`) });
await shot('0-desk');
await page.click('.pm-env');
await page.waitForTimeout(700);
await shot('1-opening');
await page.waitForTimeout(1500);
await shot('2-cover');
await page.click('[data-act="next"]');
await page.waitForTimeout(400);
await shot('3-flipping');
await page.waitForTimeout(6000);
await shot('4-spread1');
for (let i = 2; i <= 7; i++) {
  await page.click('[data-act="next"]');
  await page.waitForTimeout(i === 7 ? 1200 : 7600);
  await shot(`${3 + i}-spread${i}`);
}
await page.click('[data-act="toc"]');
await page.waitForTimeout(1200);
await page.click('.zp.on [data-day]');
await page.waitForTimeout(700);
await shot('11-pop');
await browser.close();
console.log('截好了：', out);
