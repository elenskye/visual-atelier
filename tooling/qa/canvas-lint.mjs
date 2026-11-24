// 画布样稿的版面检查（每次发布前跑）：在「减弱动态效果」下（东西都停在最后的位置）打开各个画面，逐个检查看得见的字：
//  1. 糊：字（连同它所有的上层）停下时有旋转、缩放，或挂着 will-change: transform —— 缩放显示时会糊。
//  2. 贴边：字离它所在的框（手画的边、有底色或边框的盒子）左右不到 6 像素，或者上下出了框。
// 只认画板根元素是 .bd 的样稿。由每一页自己的 lint.mjs 调用：runCanvasLint({ root: 预览目录, states: { 画板名: [[画面名, 动作]] }, sizes: { 画板名: 视口 }, only })。
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { launchBrowser } from '../lib/browser.mjs';

function check(MIN) {
  const bd = document.querySelector('.bd');
  const out = [];
  const draws = (a) => {
    if (a.classList.contains('framed') || [...a.children].some((c) => c.classList && (c.classList.contains('wob') || c.classList.contains('tl')))) return true;
    const s = getComputedStyle(a);
    const bg = s.backgroundColor.match(/rgba?\(([^)]+)\)/);
    const alpha = bg ? (bg[1].split(',')[3] === undefined ? 1 : +bg[1].split(',')[3]) : 0;
    return alpha > 0.05 || parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderLeftWidth) > 0;
  };
  const frameRect = (a) => {
    const w = [...a.children].find((c) => c.classList && c.classList.contains('wob'));
    const stroke = w && w.querySelector('path[stroke]:not([stroke="none"])');
    return stroke ? stroke.getBoundingClientRect() : a.getBoundingClientRect();
  };
  const walker = document.createTreeWalker(bd, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const txt = n.textContent.replace(/\s+/g, ' ').trim();
    const el = n.parentElement;
    // data-nolint：故意藏起来的字（比如贴纸底下的悄悄话）
    if (!txt || !el || el.closest('svg') || el.closest('[aria-hidden="true"]') || el.closest('[data-nolint]')) continue;
    let op = 1, a = el, hidden = false;
    while (a && a !== bd.parentElement) { const s = getComputedStyle(a); if (s.display === 'none' || s.visibility === 'hidden') { hidden = true; break; } op *= +s.opacity; a = a.parentElement; }
    if (hidden || op < 0.05) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) continue;
    // 被滚动区或裁切区挡住的不查
    let clipped = false;
    for (a = el.parentElement; a && a !== bd; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/(auto|scroll|hidden)/.test(s.overflowX + s.overflowY)) { const ar = a.getBoundingClientRect(); if (r.top < ar.top - 1 || r.bottom > ar.bottom + 1) { clipped = true; break; } }
    }
    if (clipped) continue;
    // 1. 糊
    let m = new DOMMatrix(), wc = false, rot = false;
    for (a = el; a && a !== bd.parentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.transform && s.transform !== 'none') m = new DOMMatrix(s.transform).multiply(m);
      if (/transform/.test(s.willChange)) wc = true;
      if ((s.rotate && s.rotate !== 'none' && parseFloat(s.rotate) !== 0) || (s.scale && s.scale !== 'none' && s.scale !== '1')) rot = true;
    }
    // 翻到背面、背面又藏起来的字看不见，不查
    let backHidden = false;
    for (a = el; a && a !== bd; a = a.parentElement) if (getComputedStyle(a).backfaceVisibility === 'hidden') backHidden = true;
    if (m.m11 < 0 && backHidden) continue;
    const tilt = Math.abs(m.m12) > 1e-3 || Math.abs(m.m21) > 1e-3 || Math.abs(m.m11 - 1) > 1e-3 || Math.abs(m.m22 - 1) > 1e-3 || rot;
    if (tilt) out.push(['糊（转歪或缩放）', txt.slice(0, 24), `matrix ${m.m11.toFixed(3)},${m.m12.toFixed(3)},${m.m21.toFixed(3)},${m.m22.toFixed(3)}`]);
    if (wc) out.push(['糊（will-change）', txt.slice(0, 24), '']);
    // 2. 贴边
    for (a = el; a && a !== bd; a = a.parentElement) {
      if (!draws(a)) continue;
      const fr = frameRect(a);
      if (fr.width < 2 || fr.height < 2) break;
      const L = r.left - fr.left, R = fr.right - r.right, T = r.top - fr.top, B = fr.bottom - r.bottom;
      if (L < MIN || R < MIN) out.push(['贴边（左右）', txt.slice(0, 24), `左 ${L.toFixed(1)} 右 ${R.toFixed(1)}（${a.tagName.toLowerCase()}.${(a.className.baseVal ?? a.className).toString().slice(0, 30)}）`]);
      if (T < -0.5 || B < -0.5) out.push(['出框（上下）', txt.slice(0, 24), `上 ${T.toFixed(1)} 下 ${B.toFixed(1)}（${a.tagName.toLowerCase()}.${(a.className.baseVal ?? a.className).toString().slice(0, 30)}）`]);
      break;
    }
  }
  return out;
}

export async function runCanvasLint({ root, states, sizes = {}, only = '' }) {
  const srv = createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(root) || !existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': p.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' });
    res.end(readFileSync(p));
  }).listen(0);
  const base = `http://localhost:${srv.address().port}/`;
  const b = await launchBrowser();
  let total = 0;
  for (const [file, screens] of Object.entries(states)) {
    if (only && !file.includes(only)) continue;
    if (!existsSync(path.join(root, file + '.html'))) continue;
    for (const [name, act] of screens) {
      const p = await b.newPage({ viewport: sizes[file] ?? { width: 1280, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const errs = [];
      p.on('pageerror', (e) => errs.push(e.message));
      await p.goto(base + file + '.html');
      await p.waitForSelector('.bd');
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(300);
      try { if (act) await act(p); } catch (e) { errs.push('STEP ' + e.message.split('\n')[0]); }
      const issues = await p.evaluate(check, 6);
      const uniq = [...new Map(issues.map((x) => [x.join('|'), x])).values()];
      total += uniq.length + errs.length;
      console.log(`${file} · ${name}：${uniq.length ? uniq.length + ' 处' : '没问题'}${errs.length ? '  出错 ' + errs.join(' | ') : ''}`);
      for (const [k, t, d] of uniq) console.log(`   ${k}  「${t}」 ${d}`);
      await p.close();
    }
  }
  await b.close();
  srv.close();
  return total;
}
