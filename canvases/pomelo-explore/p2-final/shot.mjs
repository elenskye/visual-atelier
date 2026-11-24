// 本地截图自检：用 http 打开预览页（画布的运行时要 fetch），每张画板截起始画面，再按脚本点几下截过程。
// 用法：node shot.mjs <输出目录> [文件名里含的字] [--pal=yellow] [--dark]
// 截图只放会话临时目录。
import { rootImport } from '../../_lib/root.mjs';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { launchBrowser } = await rootImport('tooling/lib/browser.mjs');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '../preview');
const OUT = process.argv[2];
const only = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : '';
const flags = process.argv.slice(3).filter((a) => a.startsWith('--'));
mkdirSync(OUT, { recursive: true });

const srv = createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': p.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' });
  res.end(readFileSync(p));
}).listen(0);
const port = srv.address().port;

const b = await launchBrowser();
const files = readdirSync(ROOT).filter((f) => f.endsWith('.html') && (!only || f.includes(only)));
const pal = (flags.find((f) => f.startsWith('--pal=')) || '').slice(6);
const dark = flags.includes('--dark');
const tag = (pal ? '-' + pal : '') + (dark ? '-dark' : '');

for (const f of files) {
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 300)));
  await p.goto(`http://localhost:${port}/${f}`);
  await p.waitForSelector('.bd', { timeout: 8000 }).catch(() => errs.push('no .bd'));
  await p.evaluate(() => document.fonts.ready);
  if (pal || dark) {
    await p.evaluate(({ pal, dark }) => { const bd = document.querySelector('.bd'); if (pal) bd.className = bd.className.replace(/p-\w+/, 'p-' + pal); if (dark) bd.className = bd.className.replace(/\blt\b/, 'dk'); }, { pal, dark });
  }
  await p.waitForTimeout(2600);
  const name = f.replace('.html', '');
  await p.screenshot({ path: path.join(OUT, `${name}${tag}.png`) });
  const info = await p.evaluate(() => { const bd = document.querySelector('.bd'); return bd ? { w: bd.scrollWidth, h: bd.scrollHeight, n: document.querySelectorAll('.bd *').length } : null; });
  console.log(name + tag, JSON.stringify(info), errs.length ? 'ERR ' + errs.join(' | ') : 'ok');
  await p.close();
}
await b.close();
srv.close();
