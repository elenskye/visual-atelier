// 动效零件 → 逐帧定格 → GIF 与总览图；同时把 CSS 与 HTML 片段原样复制到 dist
// motion.json 的 capture 可选项：viewport [宽, 高]（默认 240 × 160）；skipRest（不放触发前的静止帧，入场与循环用）；
// endMs（循环动画取一圈的时长，按 fps 定格，不含终点那一帧）；playTarget（触发类加在演示里的某个元素上）、playAll（加在所有匹配的元素上）；
// steps（一串步骤：第几毫秒给谁加类、去类、设属性，见 lib/motion-harness.mjs 的 stepsOf；有 steps 就不看 playClass）；
// palette（多套配色的方案用哪一套，默认那套）。
// requires 列出零件依赖的方案内 CSS（相对方案目录）；片段里的 <!-- @include 路径 --> 展开成那个文件（相对方案目录）。files.site 是给网站用、与演示不同的片段，原样复制。
// 方案有 Design System 的画法（design-system/system.json 的 bundle，例如 Pomelo）时，页面的底换成 Design System 的
// tokens.css、bundle.css（不插动效）和 bundle.js，片段放好后用它画手画的框；bench 的 Motion Deck用同一个 partPage。
// 只导出一个零件：npm run build:motion -- --scheme pomelo --part tooltip
import path from 'node:path';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { parseArgs, schemesToBuild, outRoot, schemeDir, readJson, readText, loadTokens, pageColor, writeFile, copyFile, log, isMain } from '../lib/common.mjs';
import { launchBrowser } from '../lib/browser.mjs';
import { buildWebCss } from '../tokens/build.mjs';
import { harnessHtml, captureFrames, frameTimes } from '../lib/motion-harness.mjs';
import { encodeGif, mergeIdentical, contactSheet } from '../lib/gif.mjs';
import { dsRuntime, expand } from '../design-system/build.mjs';

const hexToRgba = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];

/** 零件的 CSS：先放它依赖的方案内 CSS（例如 marks/graphic/graphic.css），再放零件自己的。 */
export function pieceCss(scheme, dir, spec) {
  const deps = (spec.requires ?? []).map((p) => readText(path.join(schemeDir(scheme), p)));
  return [...deps, readText(path.join(dir, spec.files.css))].join('\n');
}

/** 方案的全部零件：[{ id, dir, spec }]，按目录名排。 */
export function partList(scheme) {
  const mdir = path.join(schemeDir(scheme), 'motion');
  if (!existsSync(mdir)) return [];
  return readdirSync(mdir).sort().filter((id) => existsSync(path.join(mdir, id, 'motion.json'))).map((id) => {
    const dir = path.join(mdir, id);
    return { id, dir, spec: readJson(path.join(dir, 'motion.json')) };
  });
}

/** 页面的底：网站方言的变量；有 Design System 画法的方案再加它的 tokens、bundle.css、bundle.js。 */
const bases = new Map();
/** 忘掉算好的底（bench 一直开着，Design System 的源改了要重新算）。 */
export function forgetBases() { bases.clear(); }
export async function schemeBase(scheme) {
  if (bases.has(scheme)) return bases.get(scheme);
  const tokens = loadTokens(scheme);
  const sys = path.join(schemeDir(scheme), 'design-system/system.json');
  let base = { tokens, webCss: buildWebCss(scheme, tokens), head: '', boot: '', bodyClass: '' };
  if (existsSync(sys) && readJson(sys).bundle) {
    const rt = await dsRuntime(scheme, { motion: false });
    base = {
      tokens, webCss: rt.tokensCss, head: `<style>${rt.bundleCss}</style><script>${rt.bundleJs}</script>`,
      boot: rt.paints ? `window.${rt.namespace}.paint(document.body)` : '', bodyClass: 'pm',
    };
  }
  bases.set(scheme, base);
  return base;
}

/** 片段：展开 <!-- @include 相对方案目录的路径 -->（例如直接放进柚子的 SVG，marks/ 重新生成后不用改片段）。 */
export const fragmentOf = (scheme, dir, spec) => expand(readText(path.join(dir, spec.files.html)), schemeDir(scheme));

/** 一个零件的演示页（逐帧导出和 bench 的 Motion Deck都用它）。 */
export async function partPage(scheme, id, theme, { palette } = {}) {
  const part = partList(scheme).find((p) => p.id === id);
  if (!part) throw new Error(`${scheme} 没有动效零件 ${id}`);
  const base = await schemeBase(scheme);
  const { spec, dir } = part;
  return harnessHtml({
    webCss: base.webCss, head: base.head, boot: base.boot, bodyClass: base.bodyClass,
    pieceCss: pieceCss(scheme, dir, spec), fragment: fragmentOf(scheme, dir, spec), theme, palette: palette ?? spec.capture.palette ?? '',
  });
}

/** 等字体到、手画的框画好。 */
export async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => { if (window.Pomelo?.paint) window.Pomelo.paint(document.body); });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/**
 * 导出一个零件：每个主题一张 GIF、一张逐帧总览图，写到 out（默认 dist/<方案>/motion/<id>/）。
 * 返回 [{ theme, gif, contact, frames }]，gif、contact 是 Buffer。bench 的 Motion Deck也调它，所以两边导出的一模一样。
 */
export async function renderPart(browser, scheme, id, { out = null, write = true } = {}) {
  const part = partList(scheme).find((p) => p.id === id);
  if (!part) throw new Error(`${scheme} 没有动效零件 ${id}`);
  const { spec, dir } = part;
  const base = await schemeBase(scheme);
  if (write && out) {
    mkdirSync(out, { recursive: true });
    for (const k of ['css', 'html', 'js', 'site']) if (spec.files[k]) copyFile(path.join(dir, spec.files[k]), path.join(out, spec.files[k]));
  }
  const c = spec.capture;
  const results = [];
  for (const theme of c.themes) {
    const [vw, vh] = c.viewport ?? [240, 160];
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: c.scale, colorScheme: theme });
    const page = await ctx.newPage();
    await page.setContent(await partPage(scheme, id, theme));
    await settle(page);
    const times = c.endMs ? frameTimes(c.endMs, c.fps).filter((t) => t < c.endMs) : null;
    const { rest, frames } = await captureFrames(page, {
      host: c.host, trigger: { type: 'class', host: c.host, playClass: c.playClass, target: c.playTarget, all: c.playAll }, steps: c.steps ?? null, padPx: c.padPx, fps: c.fps, times,
    });
    await ctx.close();
    const step = Math.round(1000 / c.fps);
    const seq = c.skipRest ? [] : [{ png: rest, delayMs: c.holdStartMs }];
    frames.forEach((f, i) => seq.push({ png: f.png, delayMs: i === frames.length - 1 ? c.holdEndMs : (c.skipRest && i === 0 ? c.holdStartMs : step) }));
    const gif = encodeGif(mergeIdentical(seq), { loop: c.loop });
    // 总览图：静止帧 + 均匀抽取的动画帧
    const pick = [...(c.skipRest ? [] : [rest]), ...frames.filter((_, i) => i % 3 === 0 || i === frames.length - 1).map((f) => f.png)];
    const bg = hexToRgba(pageColor(base.tokens, theme));
    const contact = contactSheet(pick, { cols: 7, bg });
    if (write && out) {
      writeFile(path.join(out, `${spec.id}-${theme}.gif`), gif);
      writeFile(path.join(out, `contact-${theme}.png`), contact);
    }
    results.push({ theme, gif, contact, frames: frames.length });
    log(`motion  ${scheme}/${spec.id} ${theme}: ${frames.length} 帧 → ${(gif.length / 1024).toFixed(1)} KB`);
  }
  return results;
}

export async function runMotion(args = parseArgs()) {
  const browser = await launchBrowser();
  try {
    for (const scheme of schemesToBuild(args)) {
      for (const { id, spec } of partList(scheme)) {
        if (typeof args.part === 'string' && args.part !== id) continue;
        await renderPart(browser, scheme, id, { out: path.join(outRoot(args), scheme, 'motion', spec.id) });
      }
    }
  } finally { await browser.close(); }
}

if (isMain(import.meta.url)) runMotion().catch((e) => { console.error(e.message); process.exit(1); });
