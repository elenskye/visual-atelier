// 交互自检：按脚本点、拖、打字，按时间点截图，再拼成逐帧总览图。截图只放会话临时目录。
// 用法：node flow.mjs <输出目录> [场景名里含的字]
import { rootImport } from '../../_lib/root.mjs';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { launchBrowser } = await rootImport('tooling/lib/browser.mjs');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '../preview');
const OUT = process.argv[2];
const only = process.argv[3] || '';
mkdirSync(OUT, { recursive: true });
const srv = createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': p.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' });
  res.end(readFileSync(p));
}).listen(0);
const base = `http://localhost:${srv.address().port}/`;
const b = await launchBrowser();

const center = async (p, sel) => { const r = await p.locator(sel).first().boundingBox(); return [r.x + r.width / 2, r.y + r.height / 2]; };
async function drag(p, from, to, steps = 12, ms = 12) {
  await p.mouse.move(from[0], from[1]); await p.mouse.down();
  for (let i = 1; i <= steps; i++) { await p.mouse.move(from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps); await p.waitForTimeout(ms); }
}

// 每个场景：起始画板、一串动作；shot(名字) 截一张
const SCENES = {
  'controls': ['P2-Controls', async (p, shot) => {
    await p.waitForTimeout(1200);
    await p.locator('.tg').nth(1).click(); await p.waitForTimeout(120); await shot('toggle-120');
    await p.locator('.segb').nth(2).click(); await p.waitForTimeout(150); await shot('seg-150');
    await p.click('[aria-label="选月份"]'); await p.waitForTimeout(150); await shot('dd-150');
    await p.waitForTimeout(300); await shot('dd-open');
    await p.locator('.ddit').nth(1).click(); await p.waitForTimeout(250); await shot('dd-pick');
    await p.waitForTimeout(500);
    await p.locator('.star').nth(4).click(); await p.waitForTimeout(160); await shot('stars-160');
    await p.click('input[aria-label="写点什么"]'); await p.keyboard.type('周末'); await p.waitForTimeout(250); await shot('input');
    await p.click('button:has-text("存一下")'); await p.waitForTimeout(450); await shot('toast');
    await p.click('[aria-label="丢掉「过期的优惠券」"]'); await p.waitForTimeout(220); await shot('crumple-220');
    await p.waitForTimeout(600); await shot('crumpled');
    const c = await center(p, '.srt[data-id="todo"]'); await drag(p, c, [c[0] + 6, c[1] + 62], 10, 16); await shot('sort-drag');
    await p.mouse.up(); await p.waitForTimeout(500); await shot('sort-done');
    await p.click('[aria-label="去掉「海边」"]'); await p.waitForTimeout(150); await shot('chip-peel');
    await p.click('button:has-text("加一个")'); await p.waitForTimeout(200); await shot('chip-add');
    await p.hover('[aria-label="置顶"]'); await p.waitForTimeout(300); await shot('tip-300');
    await p.waitForTimeout(900); await shot('tip-rest');
  }],
  // 年度小报：拆信封 → 自动翻完一本（不碰它）。时间点对着节拍表：封面 3 拍、序章 10 拍、之后各 8、8、9 拍
  'year': ['P2-Year', async (p, shot) => {
    await p.waitForTimeout(2400); await shot('envelope');
    await p.locator('.env').click();
    const t0 = Date.now();
    const at = async (ms, lab) => { const w = ms - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w); await shot(lab); };
    await at(300, 'seal-300'); await at(800, 'flap-800'); await at(1200, 'rise-1200'); await at(1600, 'fly-1600');
    await at(3000, 'cover'); await at(4700, 'opening'); await at(6200, 'jar-filling'); await at(9800, 'jar-full');
    await at(13100, 'turn-2'); await at(14600, 'stitching'); await at(19400, 'turn-3'); await at(21400, 'moments');
    await at(25800, 'turn-4'); await at(27400, 'receipt'); await at(29600, 'echo-peek');
    await at(33600, 'turn-5'); await at(36000, 'letter');
  }],
  'zinetap': ['P2-Year', async (p, shot) => {
    await p.locator('.env').click(); await p.waitForTimeout(3200);
    await p.click('[aria-label="上一页"]'); await p.waitForTimeout(200); await shot('paused');
    await p.click('[aria-label="下一页"]'); await p.waitForTimeout(900);
    await p.click('.ztoc:has-text("去年的回声")'); await p.waitForTimeout(400); await shot('jump-flurry');
    await p.waitForTimeout(3500); await shot('echo');
    await p.click('[aria-label="看今年的原文"]'); await p.waitForTimeout(300); await shot('rec-pop');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1600); await shot('end-confetti');
    await p.click('button:has-text("收进抽屉")'); await p.waitForTimeout(500); await shot('closed-back');
  }],
  'search': ['P2-Search', async (p, shot) => {
    await p.waitForTimeout(300); await shot('print-300');
    await p.waitForTimeout(1500); await shot('printed');
    await p.fill('input[aria-label="找东西"]', '海'); await p.waitForTimeout(90); await shot('retype-90'); await p.waitForTimeout(500); await shot('retype');
    await p.press('input[aria-label="找东西"]', 'ArrowDown'); await p.press('input[aria-label="找东西"]', 'Enter');
    await p.waitForTimeout(160); await shot('tear-160');
    await p.waitForTimeout(1200); await shot('opened');
  }],
  'stack': ['P2-Pages', async (p, shot) => {
    await p.waitForTimeout(1800);
    await p.hover('[aria-label="换到「柚子」"] .stsk'); await p.waitForTimeout(400); await shot('hover');
    await p.click('[aria-label="换到「柚子」"] .stsk'); await p.waitForTimeout(160); await shot('swap-160');
    await p.waitForTimeout(900); await shot('ask');
    for (let i = 0; i < 5; i++) { await p.click('[aria-label="戳一下柚子"]'); await p.waitForTimeout(120); }
    await p.waitForTimeout(300); await shot('dizzy');
    await p.waitForTimeout(800); await shot('dizzy-2');
  }],
  'eggs': ['Main', async (p, shot) => {
    await p.waitForTimeout(2400);
    await p.locator('button.todo').nth(0).click(); await p.waitForTimeout(400);
    await p.locator('button.todo').nth(2).click(); await p.waitForTimeout(250); await shot('alldone-250');
    await p.waitForTimeout(700); await shot('alldone-950');
    await p.waitForTimeout(3000);
    await p.click('.hub'); await p.waitForTimeout(800);
    await p.click('input[aria-label="去哪，或问柚子"]'); await p.keyboard.type('柚子'); await p.waitForTimeout(400); await shot('wheel-yuzi');
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    const c = await center(p, '.peel'); await drag(p, c, [c[0] - 80, c[1] + 60], 10, 16); await shot('peel');
    await p.mouse.up(); await p.waitForTimeout(1200); await shot('peel-back');
  }],
};

const sheets = [];
for (const [name, [file, run]] of Object.entries(SCENES)) {
  if (only && !name.includes(only)) continue;
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)));
  await p.goto(base + file + '.html');
  await p.evaluate(() => document.fonts.ready);
  const shots = [];
  const shot = async (lab) => { const f = path.join(OUT, `${name}-${lab}.png`); await p.screenshot({ path: f }); shots.push([lab, f]); };
  try { await run(p, shot); } catch (e) { errs.push('STEP ' + e.message.split('\n')[0]); }
  console.log(name, shots.length, 'shots', errs.length ? 'ERR ' + errs.join(' | ') : 'ok');
  sheets.push([name, shots]);
  await p.close();
}
// 逐帧总览：每个场景一张，缩小排成网格
for (const [name, shots] of sheets) {
  if (!shots.length) continue;
  const p = await b.newPage({ viewport: { width: 1660, height: 400 }, deviceScaleFactor: 1 });
  const cells = shots.map(([lab, f]) => `<figure><img src="data:image/png;base64,${readFileSync(f).toString('base64')}"><figcaption>${lab}</figcaption></figure>`).join('');
  await p.setContent(`<style>body{margin:0;padding:10px;font:14px sans-serif;background:#ddd;display:flex;flex-wrap:wrap;gap:10px;width:1640px}figure{margin:0;width:540px}img{width:540px;display:block;border:1px solid #999}figcaption{padding:2px 0}</style>${cells}`);
  await p.screenshot({ path: path.join(OUT, `sheet-${name}.png`), fullPage: true });
  await p.close();
}
await b.close();
srv.close();
