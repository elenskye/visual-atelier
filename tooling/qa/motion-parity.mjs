// 把动效零件与网站「真实实现」逐帧比较（像素级）。比较哪些、怎么比，写在零件 motion.json 的 parity 里。
// 用法：npm run qa:parity -- --origin ~/Documents/GitHub/personal-website
import path from 'node:path';
import { parseArgs, schemesToBuild, schemeDir, readText, loadTokens, motionParts, expandHome, log, isMain } from '../lib/common.mjs';
import { launchBrowser } from '../lib/browser.mjs';
import { buildWebCss } from '../tokens/build.mjs';
import { harnessHtml, captureFrames } from '../lib/motion-harness.mjs';
import { diffPng } from '../lib/gif.mjs';
import { pieceCss as partCss, fragmentOf } from '../render/motion.mjs';

/**
 * 网站那边的标记：parity.siteMarkup 为 { file, pattern } 时从网站源文件里取（Astro 写法替换掉），
 * 为 { fromFragment, replace } 时用零件自己的片段、把类名换成网站的。
 */
function siteMarkup(origin, parity, fragment) {
  const m = parity.siteMarkup;
  if (m.fromFragment) return (m.replace ?? []).reduce((h, [a, b]) => h.split(a).join(b), fragment.replace(/<!--[\s\S]*?-->\n?/g, ''));
  const found = readText(path.join(origin, m.file)).match(new RegExp(m.pattern));
  if (!found) throw new Error(`在 ${m.file} 里没找到 ${m.pattern}`);
  return found[0].replace(/href=\{[^}]*\}/g, 'href="#"').replace(/<Fragment\b[^>]*\/>/g, '');
}

export async function runParity(args = parseArgs()) {
  if (typeof args.origin !== 'string') { console.log('跳过：需要 --origin <personal-website 路径>'); return { skipped: true }; }
  const origin = expandHome(args.origin);
  const browser = await launchBrowser();
  const results = [];
  try {
    for (const scheme of schemesToBuild(args)) {
      const parts = motionParts(schemeDir(scheme));
      if (!parts.length) continue;
      const webCss = buildWebCss(scheme, loadTokens(scheme));
      for (const { dir, spec } of parts) {
        const parity = spec.parity;
        if (!parity) continue; // 只比较网站上有对应实现的零件（motion.json 写了 parity）
        const siteCss = readText(path.join(origin, parity.siteCss));
        // 零件这边的 CSS 和片段与逐帧导出同一份（带 requires、展开 @include）
        const pieceCss = partCss(scheme, dir, spec);
        const fragment = fragmentOf(scheme, dir, spec);
        const markup = siteMarkup(origin, parity, fragment);
        // baseCss 为 site：零件这边也垫上网站的样式表（正文字体、字号），只让零件自己的规则决定动效
        const minePiece = parity.baseCss === 'site' ? `${siteCss}\n${pieceCss}` : pieceCss;
        const clip = (host) => (parity.clip ? `${host} ${parity.clip}` : null);
        for (const theme of spec.capture.themes) {
          const mk = async (html, trigger, host) => {
            const ctx = await browser.newContext({ viewport: { width: 640, height: 160 }, deviceScaleFactor: spec.capture.scale, colorScheme: theme });
            const page = await ctx.newPage();
            await page.setContent(html);
            const r = await captureFrames(page, { host, trigger, padPx: spec.capture.padPx, times: parity.times, clipHost: clip(host) });
            await ctx.close();
            return r;
          };
          const mine = await mk(harnessHtml({ webCss, pieceCss: minePiece, fragment, theme }), { type: 'class', playClass: spec.capture.playClass }, parity.host);
          const siteHtml = `<!doctype html><html lang="zh" data-theme="${theme}"><head><meta charset="utf-8"><style>${siteCss}</style><style>html,body{margin:0;background:var(--color-page)}#stage{position:absolute;left:24px;top:24px;display:flex}</style></head><body><div id="stage">${markup}</div></body></html>`;
          const site = await mk(siteHtml, { type: parity.trigger ?? 'hover' }, parity.siteHost);
          const rows = [{ t: 'rest', ...diffPng(mine.rest, site.rest) }];
          mine.frames.forEach((f, i) => rows.push({ t: f.t, ...diffPng(f.png, site.frames[i].png) }));
          const bad = rows.filter((r) => r.sizeMismatch || r.diffPixels > 0);
          const worst = Math.max(0, ...rows.map((r) => r.maxChannelDiff ?? 255));
          results.push({ id: spec.id, theme, frames: rows.length, differing: bad.length, worst });
          log(`parity  ${spec.id} ${theme}: ${rows.length} 个时间点，${bad.length} 个有差异，最大通道差 ${worst}`);
        }
      }
    }
  } finally { await browser.close(); }
  const ok = results.every((r) => r.differing === 0);
  log(ok ? 'parity  通过：与网站真实实现逐像素一致' : 'parity  未通过：存在差异');
  if (!ok) process.exitCode = 1;
  return { results, ok };
}

if (isMain(import.meta.url)) runParity().catch((e) => { console.error(e.message); process.exit(1); });
