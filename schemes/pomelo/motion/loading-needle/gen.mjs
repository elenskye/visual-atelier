// 生成 loading-needle.fragment.html 和 loading-needle.css 里每一针的关键帧（手画的线用 tooling/handmade/line.mjs，种子和 Phase 2 的 migrate.mjs 一样）。
// 片段和 CSS 末尾「每一针」那一段不手改；改了这里在仓库根目录跑：node schemes/pomelo/motion/loading-needle/gen.mjs
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const { P, circle, ellipse, handStroke, handFill, f, rng } = await import(pathToFileURL(path.join(ROOT, 'tooling/handmade/line.mjs')).href);

const N = 12, STEP = 22, VBW = 10 + N * STEP + 14;
// 针：细长的一根，针眼留白；线从针眼拖出来
function needle() {
  const body = P('M0 0 C6 -2.2 20 -2.6 30 0 C20 2.6 6 2.2 0 0 Z');
  return `<g class="pm-needle-go"><g class="pm-needle-dip"><g transform="scale(1.6)"><path d="${handStroke(P('M-2 0 C-10 -8 -18 6 -26 -2'), { amp: 0.4, seed: 1701, sp: 1 })}" fill="none" stroke="var(--color-cat-pink)" stroke-width="2.4" stroke-linecap="round"></path><path d="${handFill(body, { amp: 0.15, seed: 1702 })}" fill="color-mix(in srgb,var(--color-art-white) 55%,var(--color-ink-soft))" stroke="var(--color-art-ink)" stroke-width="1.6" stroke-linejoin="round"></path><path d="${handFill(ellipse(5, 0, 2.4, 0.9), { amp: 0.05, seed: 1703 })}" fill="var(--color-card)"></path></g></g></g>`;
}
function loader(w, { mini = false } = {}) {
  const r = rng(1710);
  const stitch = Array.from({ length: N }, (_, i) => {
    const x = 10 + i * STEP, tilt = (r() - 0.5) * 2.4;
    return `<path class="pm-needle-stitch pm-needle-s${i}" d="${handStroke(P(`M${f(x)} ${f(20 + tilt / 2)} L${f(x + 12)} ${f(20 - tilt / 2)}`), { amp: 0.35, wave: 6, seed: 1720 + i, sp: 1, keep: 2 })}" fill="none" stroke="var(--color-pen)" stroke-width="3" stroke-linecap="round"></path>`;
  }).join('');
  const knot = `<path class="pm-needle-knot" d="${handFill(circle(10 + N * STEP - 2, 20, 3.4), { amp: 0.3, seed: 1740 })}" fill="var(--color-cat-pink)" stroke="var(--color-art-ink)" stroke-width="1.2"></path>`;
  return `<svg class="pm-needle${mini ? ' pm-needle--mini' : ''}" width="${w}" height="${mini ? 20 : 40}" viewBox="0 0 ${VBW} 40" aria-hidden="true">${stitch}${knot}${needle()}</svg>`;
}

const frag = `<!-- 加载 · 穿针：纸边的缝线一针针缝出来，缝满打个结，停一下，淡掉重来；按钮里也能缝。由 gen.mjs 生成，不手改 -->
<div class="needle-demo" style="display:flex;flex-direction:column;gap:18px;padding:16px 10px 6px">
<div class="pm-card" data-hand="frame" data-r="10" data-amp="0.9" data-sw="1.8" data-fill="card" data-seed="1750" data-tilt="-0.8" data-tapes="1" style="width:440px;height:126px;padding:26px 50px 0">${loader(330)}<div class="pm-soft" style="margin-top:16px;text-align:center;font-size:14px;line-height:20px">正在缝…</div></div>
<span class="pm-field" data-hand="field" data-seed="1760" style="width:186px;height:36px;gap:10px;padding:0 14px 0 12px"><span style="display:block;width:80px">${loader(80, { mini: true })}</span><span style="font-size:14px;line-height:20px;white-space:nowrap">正在导出</span></span>
</div>
`;
writeFileSync(path.join(HERE, 'loading-needle.fragment.html'), frag);

// 每一针第几下出现：第 i 针在一圈的 5i%（0.16 秒一针）出来，大家一起在 88%–96% 淡掉，一圈正好 3.2 秒、首尾接得上
const MARK = '/* ---- 每一针（gen.mjs 生成） ---- */';
const keys = Array.from({ length: N }, (_, i) => {
  const a = 5 * i;
  const head = a === 0 ? '0% { opacity: 0; }' : `0%, ${a}% { opacity: 0; }`;
  return `.pm-needle-s${i} { animation-name: pm-needle-s${i}; }\n@keyframes pm-needle-s${i} { ${head} ${a + 2}%, 88% { opacity: 1; } 96%, 100% { opacity: 0; } }`;
}).join('\n');
const cssPath = path.join(HERE, 'loading-needle.css');
const css = readFileSync(cssPath, 'utf8');
const at = css.indexOf(MARK);
writeFileSync(cssPath, (at < 0 ? css.trimEnd() + '\n\n' : css.slice(0, at)) + MARK + '\n' + keys + '\n');
console.log('loading-needle：片段', (frag.length / 1024).toFixed(1) + ' KB，CSS 每一针', N, '段');
