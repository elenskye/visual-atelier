// 把 marks/manifest.json 里的资产复制到 dist（源文件不做任何改写），并：
//   - 按清单里的 renders 导出 PNG（size 为正方形，width/height 为长方形）；
//   - colorMode 为 roles 的图形另外生成上好色的 SVG：dist/<方案>/marks/themed/<id>-<light|dark>.svg（默认配色），
//     只把 CSS 变量换成具体色值（笔势与纸片见 tooling/graphic/svg.mjs，手作的见 tooling/handmade/marks.mjs），PNG 也由它渲染；
//     renders 里可写 palette（按哪套配色上色）和 color（currentColor 的颜色，例如菜单栏模板图用 #000000）；
//   - 文章分享图的模板（带 samples）用生成模块 tooling/og-card/card.mjs 出示例，和消费方构建时同一条路，不经过浏览器；
//   - 作品水印的模板（带 fakeImages）用生成模块 tooling/watermark/watermark.mjs 在假图上出示例。
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { parseArgs, schemesToBuild, outRoot, schemeDir, readJson, readText, loadTokens, markColorRole, writeFile, copyFile, log, isMain } from '../lib/common.mjs';
import { launchBrowser, nextFrames } from '../lib/browser.mjs';
import { roleColors, themedSvg } from '../graphic/svg.mjs';
import { renderCardPng } from '../og-card/card.mjs';
import { watermarkImage } from '../watermark/watermark.mjs';
import { fakeImage } from '../watermark/fake-images.mjs';
import { resolveRoles } from '../handmade/marks.mjs';

const pageHtml = (svg, { width, height, color, bg }) => `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:${bg ?? 'transparent'}}
#box{width:${width}px;height:${height}px;color:${color};display:block}
#box svg{width:100%;height:100%;display:block}
</style></head><body><div id="box">${svg}</div></body></html>`;

/** roles 图形在某个明暗下上好色的 SVG。手作的资产（tooling/handmade/marks.mjs 生成）按配色换，palette 不写是默认那套。 */
export function themedFor(a, src, tokens, theme, palette = null) {
  if (a.source?.generator === 'tooling/handmade/marks.mjs') return resolveRoles(src, tokens, palette, theme);
  if (!tokens.graphic) throw new Error(`${a.id}：colorMode 为 roles，但方案没有 tokens/graphic.json`);
  return themedSvg(src, roleColors(tokens, tokens.graphic, theme, a.context), { background: a.background ?? null, tokens, theme });
}

export async function runMarks(args = parseArgs()) {
  const browser = await launchBrowser();
  try {
    for (const scheme of schemesToBuild(args)) {
      const dir = path.join(schemeDir(scheme), 'marks');
      const manifest = readJson(path.join(dir, 'manifest.json'));
      const tokens = loadTokens(scheme);
      const out = path.join(outRoot(args), scheme, 'marks');
      for (const a of manifest.assets) {
        mkdirSync(path.dirname(path.join(out, a.file)), { recursive: true });
        copyFile(path.join(dir, a.file), path.join(out, a.file));
        if (a.samples?.length) {
          const template = readJson(path.join(dir, a.file));
          for (const [i, title] of a.samples.entries()) writeFile(path.join(out, 'png', `${a.id}@sample-${i + 1}.png`), await renderCardPng(template, title));
        }
        if (a.fakeImages?.length) {
          const template = readJson(path.join(dir, a.file));
          for (const kind of a.fakeImages) writeFile(path.join(out, 'png', `${a.id}@sample-${kind}.jpg`), (await watermarkImage(template, await fakeImage(kind))).data);
        }
        if (a.kind !== 'svg') continue;
        const src = readText(path.join(dir, a.file));
        if (a.colorMode === 'roles') {
          for (const theme of ['light', 'dark']) writeFile(path.join(out, 'themed', `${a.id}-${theme}.svg`), themedFor(a, src, tokens, theme));
        }
        if (!a.renders?.length) continue;
        for (const r of a.renders) {
          const width = r.width ?? r.size, height = r.height ?? r.size;
          for (const theme of r.themes ?? [null]) {
            const svg = a.colorMode === 'roles' ? themedFor(a, src, tokens, theme ?? 'light', r.palette ?? null) : src;
            const color = r.color ?? (a.colorMode === 'currentColor' ? tokens.color.roles[markColorRole(tokens, a)][theme ?? 'light'] : 'inherit');
            const bg = r.background ?? null;
            const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: theme ?? 'light' });
            const page = await ctx.newPage();
            await page.setContent(pageHtml(svg, { width, height, color, bg }));
            await nextFrames(page);
            const png = await page.screenshot({ omitBackground: !bg, clip: { x: 0, y: 0, width, height } });
            await ctx.close();
            const dim = r.size ? `${r.size}` : `${width}x${height}`;
            const name = `${a.id}@${dim}${r.suffix ? '-' + r.suffix : ''}${theme ? '-' + theme : ''}.png`;
            writeFile(path.join(out, 'png', name), png);
          }
        }
      }
      log(`marks   ${scheme} → ${path.relative(process.cwd(), out)}`);
    }
  } finally { await browser.close(); }
}

if (isMain(import.meta.url)) runMarks().catch((e) => { console.error(e.message); process.exit(1); });
