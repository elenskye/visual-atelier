import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { canvasDir, kindOf, readCloud, readCanvasJson } from './store.js';
import { startServer } from '../server/server.js';
import { captureUrl } from '../server/headless.js';

// dw check：一条命令自检。每张画板按自己的宽高、在「减弱动态效果」下（动画停在最后）打开，查三样：
//   1. 报错：控制台报错、没接住的异常、运行时的渲染报错、宽或高为 0 的容器（同 dw shot）
//   2. 版面：内容出了画板、字出了画板、字被容器裁掉一截、图片没出来
//   3. 这块画布自己的版面检查：它目录里的 */lint.mjs（生成器带的，比如 Pomelo Explore 的「糊」「贴边」）
// 故意的（比如藏在贴纸底下的字）给元素加 data-nolint。截图在 .shots/check/。

export const LAYOUT_EXPRESSION = `(() => {
  const W = document.documentElement.clientWidth, H = document.documentElement.clientHeight;
  const problems = [];
  const label = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    else if (el.classList.length) s += '.' + [...el.classList].slice(0, 2).join('.');
    const t = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 20);
    return t ? s + '「' + t + '」' : s;
  };
  const skip = (el) => el.closest('[data-nolint], svg, script, style, template, [aria-hidden="true"]');
  const shown = (el) => {
    for (let a = el; a; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.02) return false;
    }
    return true;
  };
  const sw = document.documentElement.scrollWidth, sh = document.documentElement.scrollHeight;
  if (sw > W + 1) problems.push('内容出了画板：宽 ' + sw + 'px，画板 ' + W + 'px');
  if (sh > H + 1) problems.push('内容出了画板：高 ' + sh + 'px，画板 ' + H + 'px');
  for (const img of document.images) {
    const src = img.getAttribute('src') || '';
    if (/\\{\\{/.test(src) || skip(img) || !shown(img)) continue;
    if (img.complete && img.naturalWidth === 0) problems.push('图片没出来：' + src.slice(0, 80));
  }
  const clipped = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || skip(el) || !shown(el)) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    // the nearest box that does not let it overflow: a scroll area is fine (scroll to see it), a clip is not
    let box = null;
    for (let a = el; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/auto|scroll|hidden|clip/.test(s.overflowX + ' ' + s.overflowY)) { box = { a, s }; break; }
    }
    if (box && /auto|scroll/.test(box.s.overflowX + ' ' + box.s.overflowY)) continue;
    if (box) {
      const intended = box.s.textOverflow === 'ellipsis' || getComputedStyle(el).textOverflow === 'ellipsis' || (box.s.webkitLineClamp && box.s.webkitLineClamp !== 'none');
      const b = box.a.getBoundingClientRect();
      const out = r.right > b.right + 1 || r.left < b.left - 1 || r.bottom > b.bottom + 1 || r.top < b.top - 1;
      if (out && !intended && !clipped.has(box.a)) { clipped.add(box.a); problems.push('字被裁掉一截：' + label(el)); }
      if (out) continue;
    }
    if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) problems.push('字出了画板：' + label(el));
  }
  return { problems: problems.slice(0, 40), more: Math.max(0, problems.length - 40) };
})()`;

/** Every board of a canvas in order, or the entry of a page: [{ file, w, h }]. */
export function boardsOf(config, name, only = null) {
  const dir = canvasDir(config, name);
  const kind = kindOf(dir);
  if (kind === 'page') {
    const entry = readCloud(dir).entry;
    return [{ file: entry, w: 1280, h: 800, page: true }];
  }
  if (kind !== 'canvas') throw new Error(`${name} 不是画布`);
  const c = readCanvasJson(config, name);
  const order = [...(c.order || []).filter((f) => c.boards[f]), ...Object.keys(c.boards).filter((f) => !(c.order || []).includes(f))];
  const list = order.map((f) => ({ file: f, w: c.boards[f].w, h: c.boards[f].h }));
  if (!only) return list;
  const hit = list.filter((b) => b.file === only || b.file === `${only}.dc.html`);
  if (!hit.length) throw new Error(`${name} 没有画板 ${only}`);
  return hit;
}

// The canvas's own layout lints: <folder>/lint.mjs one level down (generators carry them).
export function ownLints(config, name) {
  const dir = canvasDir(config, name);
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !['archive', 'preview', 'project', 'blobs', 'node_modules'].includes(e.name) && !e.name.startsWith('.'))
    .map((e) => path.join(dir, e.name, 'lint.mjs'))
    .filter((f) => fs.existsSync(f));
}

export async function runCheck(config, name, { board = null, lints = true, onBoard = null } = {}) {
  const dir = canvasDir(config, name);
  const boards = boardsOf(config, name, board);
  const results = [];
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    for (const b of boards) {
      const stem = b.file.replace(/\.dc\.html$|\.html?$/, '');
      const out = path.join(dir, '.shots', 'check', `${stem}.png`);
      const url = b.page ? `${srv.baseUrl}/c/${name}/` : `${srv.baseUrl}/c/${name}/${b.file.split('/').map(encodeURIComponent).join('/')}`;
      const r = await captureUrl(config, url, out, { width: b.w, height: b.h, scale: 1, reducedMotion: true, inspect: b.page ? null : LAYOUT_EXPRESSION });
      const layout = r.inspect?.problems || [];
      if (r.inspect?.more) layout.push(`……还有 ${r.inspect.more} 处`);
      if (r.inspect?.error) layout.push(`版面检查没跑成：${r.inspect.error}`);
      const row = { file: b.file, size: `${b.w}×${b.h}`, shot: out, errors: [...r.allErrors, ...r.zeroSizeElements.map((z) => `宽或高为 0：${z}`), ...(r.ready ? [] : ['没等到画板渲染完'])], layout };
      row.passed = !row.errors.length && !layout.length;
      results.push(row);
      onBoard?.(row);
    }
  } finally {
    await srv.close();
  }
  const lintRuns = [];
  if (lints && !board) {
    for (const file of ownLints(config, name)) {
      // a lint that checks the generator's preview/ pages finds nothing to check when preview/ was never made (it is not in Git)
      const preview = path.join(dir, 'preview');
      if (/\.\.\/preview/.test(fs.readFileSync(file, 'utf8')) && !(fs.existsSync(preview) && fs.readdirSync(preview).some((f) => f.endsWith('.html')))) {
        lintRuns.push({ file: path.relative(dir, file), passed: false, output: `没跑：preview/ 还没生成（不进 Git）。先照这块的 README 跑 ${path.relative(dir, path.dirname(file))}/gen.mjs（站主在云端动过的先拉回），再 dw check。` });
        continue;
      }
      // tooling/ uses Playwright's own Chromium unless told otherwise; the installed Chrome is what we have
      const env = { ...process.env, ...(process.env.VA_CHROMIUM || process.env.VA_BROWSER_CHANNEL ? {} : { VA_BROWSER_CHANNEL: 'chrome' }) };
      const p = spawnSync(process.execPath, [file], { cwd: path.dirname(file), encoding: 'utf8', env, timeout: 10 * 60 * 1000 });
      lintRuns.push({ file: path.relative(dir, file), passed: p.status === 0, output: `${p.stdout || ''}${p.stderr || ''}`.trim().split('\n').slice(-12).join('\n') });
    }
  }
  return { name, boards: results, lints: lintRuns, passed: results.every((r) => r.passed) && lintRuns.every((l) => l.passed) };
}
