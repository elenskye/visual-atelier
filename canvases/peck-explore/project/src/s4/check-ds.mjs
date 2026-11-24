// 本地看 Design System 的组件预览：照 Design System 页的做法给每个 preview.html 注入 tokens.css、字体、bundle.css，
// 深浅各截一张图，报脚本错误、加载失败、横向溢出、字出框。截图写到 <构建目录>/check/。
// 用法（在这个目录）：VA_ROOT=<visual-atelier 或它的临时副本> VA_BROWSER_CHANNEL=chrome node check-ds.mjs <构建目录>
import path from 'node:path';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import http from 'node:http';

const out = path.resolve(process.argv[2]);
const P = path.join(out, 'project');
const { launchBrowser } = await import(path.join(process.env.VA_ROOT, 'tooling/lib/browser.mjs'));
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Doto:wght@900&family=IBM+Plex+Sans:wght@400;600&display=swap">';
const css = readFileSync(path.join(P, 'tokens.css'), 'utf8') + readFileSync(path.join(P, 'components/bundle.css'), 'utf8');
const comps = readdirSync(path.join(P, 'components')).filter((d) => existsSync(path.join(P, 'components', d, 'preview.html')));
mkdirSync(path.join(out, 'check'), { recursive: true });
// 本机起一个只听 127.0.0.1 的小服务：字体按相对 tokens.css 的路径取（和 Design System 页一样从 project/ 取）
const docs = new Map();
const TYPES = { '.woff2': 'font/woff2', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (docs.has(u)) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(docs.get(u)); }
  const f = path.join(P, u);
  if (!f.startsWith(P) || !existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f));
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;
const b = await launchBrowser();
const problems = [];
for (const comp of comps) {
  const html = readFileSync(path.join(P, 'components', comp, 'preview.html'), 'utf8');
  const marker = html.split('\n')[0];
  const width = Number(/width=(\d+)/.exec(marker)?.[1] ?? 960);
  const height = Number(/height=(\d+)/.exec(marker)?.[1] ?? 120);
  for (const theme of ['dark', 'light']) {
    const pg = await b.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    pg.on('requestfailed', (r) => { if (!r.url().startsWith('https://fonts.')) errs.push('加载失败 ' + r.url().slice(-60)); });
    const doc = html.replace(/<html([^>]*)>/i, `<html$1 data-theme="${theme}">`).replace(/<head>/i, () => `<head>${fonts}<style>${css}</style>`);
    const u = `/_check/${comp}-${theme}.html`;
    docs.set(u, doc.replace(/url\("fonts\//g, 'url("/fonts/'));
    await pg.goto(base + u, { waitUntil: 'networkidle' }).catch(() => {});
    await pg.evaluate(() => document.fonts.ready);
    const r = await pg.evaluate(() => {
      const de = document.documentElement;
      const bad = [];
      for (const el of document.querySelectorAll('body *')) {
        if (!el.children.length && el.textContent.trim() && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible') bad.push(el.className + '：' + el.textContent.trim().slice(0, 20));
      }
      const fam = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
      return { over: de.scrollWidth - de.clientWidth, tall: de.scrollHeight, bad, fam: [...new Set(fam)] };
    });
    if (r.over > 0) errs.push(`横向溢出 ${r.over}px`);
    if (r.tall > height + 4) errs.push(`比卡片高 ${r.tall - height}px（marker height=${height}）`);
    for (const x of r.bad) errs.push('字被裁掉 ' + x);
    await pg.screenshot({ path: path.join(out, 'check', `${comp}-${theme}.png`), fullPage: true });
    for (const e of errs) problems.push(`${comp}（${theme}）：${e}`);
    if (comp === 'Button' && theme === 'dark') console.log('加载了的字体：' + r.fam.join('、'));
    await pg.close();
  }
}
await b.close();
srv.close();
for (const p of problems) console.log('  ✘ ' + p);
console.log(`${comps.length} 个预览 × 深浅：${problems.length ? problems.length + ' 个问题' : '没有问题'}`);
