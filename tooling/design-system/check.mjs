// 本地检查 Design System 的组件预览：按 Design System 页面的做法给每个 preview.html 注入 token 变量、
// 字体、bundle.css 与 bundle.js，明暗各截一张图，并报告脚本错误、加载失败、横向溢出和没画上的手画零件（data-hand）。
// 截图写到 dist/<方案>/design-system/check/（只供自检，不发布）。先运行 npm run build:ds。
// 用法：npm run check:ds
import path from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { parseArgs, schemesToBuild, outRoot, readJson, readText, writeFile, log, isMain } from '../lib/common.mjs';
import { launchBrowser } from '../lib/browser.mjs';
import { tokensCss } from './tokens-css.mjs';

// bench 从这里取 tokensCss（dw ds install 写画布里的 tokens.css）
export { tokensCss };

/**
 * tokens.json 字体栈里要从 Google Fonts 取的字体：每个栈开头带引号的名字，跳过 meta.localFonts（只在本机有的系统字体）。
 * 和 Design System 页一样按样式里用到的字重取。
 */
export function fontLinks(t) {
  // 本机字体和随 Design System 打包的字体（type.fonts）都不去 Google Fonts 取
  const local = new Set([...(t.meta?.localFonts ?? []), ...(t.type.fonts ?? []).map((f) => f.family)]);
  const weights = new Set([400]);
  for (const g of t.type.groups) for (const s of g.styles) if (s.fontWeight) String(s.fontWeight).split(/\s+/).forEach((w) => weights.add(Number(w)));
  const names = [];
  for (const stack of Object.values(t.type.families)) {
    for (const part of stack.split(',').map((x) => x.trim())) {
      const q = /^"(.+)"$/.exec(part);
      if (!q) break;
      if (!local.has(q[1]) && !names.includes(q[1])) names.push(q[1]);
    }
  }
  const w = [...weights].sort((a, b) => a - b).join(';');
  return names.map((n) => `https://fonts.googleapis.com/css2?family=${n.replace(/ /g, '+')}:wght@${w}&display=swap`);
}

export async function runCheck(args = parseArgs()) {
  const browser = await launchBrowser();
  const problems = [];
  try {
    for (const scheme of schemesToBuild(args)) {
      const base = path.join(outRoot(args), scheme, 'design-system');
      const project = path.join(base, 'project');
      if (!existsSync(project)) continue;
      const tokens = readJson(path.join(project, 'tokens.json'));
      // 随包的字体内联成 data URI（预览用 setContent 打开，没有地址可以解析相对路径）
      const faces = (tokens.type.fonts ?? []).map((f) => `@font-face { font-family: "${f.family}"; src: url(data:font/woff2;base64,${readFileSync(path.join(project, f.file)).toString('base64')}) format("woff2"); font-weight: ${f.weight}; font-style: ${f.style}; }`).join('\n');
      const css = tokensCss(tokens) + faces + readText(path.join(project, 'components/bundle.css'));
      const fonts = fontLinks(tokens).map((u) => `<link rel="stylesheet" href="${u}">`).join('');
      const bundlePath = path.join(project, 'components/bundle.js');
      const bundle = existsSync(bundlePath) ? `<script>${readText(bundlePath)}</script>` : '';
      const comps = readdirSync(path.join(project, 'components')).filter((d) => existsSync(path.join(project, 'components', d, 'preview.html')));
      for (const comp of comps) {
        const html = readText(path.join(project, 'components', comp, 'preview.html'));
        const marker = html.split('\n')[0];
        const width = Number(/width=(\d+)/.exec(marker)?.[1] ?? 960);
        for (const theme of ['light', 'dark']) {
          const ctx = await browser.newContext({ viewport: { width, height: 400 }, deviceScaleFactor: 1 });
          const page = await ctx.newPage();
          const errors = [];
          page.on('pageerror', (e) => errors.push(e.message));
          page.on('requestfailed', (r) => { if (!r.url().startsWith('https://fonts.')) errors.push(`加载失败 ${r.url().slice(0, 80)}`); });
          const doc = html
            .replace(/<html([^>]*)>/i, `<html$1 data-theme="${theme}">`)
            .replace(/<head>/i, () => `<head>${fonts}<style>${css}</style>${bundle}`);
          await page.setContent(doc, { waitUntil: 'networkidle' }).catch(() => page.setContent(doc));
          await page.evaluate(() => document.fonts.ready);
          // 手画零件：字体到了以后 paintLive 会按新的宽高补画，等两帧再查
          await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
          const unpainted = await page.evaluate(() => [...document.querySelectorAll('[data-hand]')].filter((el) => !el.querySelector(':scope > [data-hand-painted]')).map((el) => `${el.tagName.toLowerCase()}[data-hand=${el.dataset.hand}]`));
          if (unpainted.length) errors.push(`没画上的手画零件 ${unpainted.length} 个：${[...new Set(unpainted)].join('、')}`);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (overflow > 0) errors.push(`横向溢出 ${overflow}px`);
          writeFile(path.join(base, 'check', `${comp}-${theme}.png`), await page.screenshot({ fullPage: true }));
          await ctx.close();
          for (const e of errors) problems.push(`${comp}（${theme}）：${e}`);
        }
      }
      log(`check   ${scheme}：${comps.length} 个预览 × 明暗 → ${path.relative(process.cwd(), path.join(base, 'check'))}`);
    }
  } finally { await browser.close(); }
  for (const p of problems) log(`  ✘ ${p}`);
  log(problems.length ? `发现 ${problems.length} 个问题` : '没有发现问题');
  if (problems.length) process.exitCode = 1;
  return problems;
}

if (isMain(import.meta.url)) runCheck().catch((e) => { console.error(e.message); process.exit(1); });
