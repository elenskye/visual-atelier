// 生成 atlas-envelope.fragment.html（信封的手画线用 tooling/handmade/line.mjs，种子和 Phase 2 的 zine.mjs envelope() 一样）。
// 片段不手改；改了这里在仓库根目录跑：node schemes/pomelo/motion/atlas-envelope/gen.mjs
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const { P, rrect, handStroke, handFill } = await import(pathToFileURL(path.join(ROOT, 'tooling/handmade/line.mjs')).href);
const { tape } = await import(pathToFileURL(path.join(ROOT, 'tooling/handmade/frame.mjs')).href);

const w = 330, h = 210;
const TAPE = [['var(--color-tape-mint-a)', 'var(--color-tape-mint-b)'], ['var(--color-tape-yuzu-a)', 'var(--color-tape-yuzu-b)']];
const s = (d, seed, sw = 1.9) => `<path d="${handStroke(d, { amp: 0.9, seed, sp: 2, keep: 3 })}" fill="none" stroke="var(--color-art-ink)" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"></path>`;
const fl = (d, seed, c) => `<path d="${handFill(d, { amp: 0.6, seed, sp: 3, prec: 0 })}" fill="${c}"></path>`;
const body = rrect(0, 0, w, h, 10);
// 外框分两段：信封口那条边在小报下面（小报升起来时不被它划过去），两边和底边在口袋上面
const mouth = P(`M0 10 Q0 0 10 0 L${w - 10} 0 Q${w} 0 ${w} 10`);
const rim = P(`M${w} 10 L${w} ${h - 10} Q${w} ${h} ${w - 10} ${h} L10 ${h} Q0 ${h} 0 ${h - 10} L0 10`);
const flapD = P(`M3 3 L${w / 2} ${Math.round(h * 0.58)} L${w - 3} 3 Z`);
// 口袋（信封背面）盖住除了翻盖以外的地方；它的 V 口比翻盖的边高一点，合着时一点缝都不露
const vy = Math.round(h * 0.52);
const pocketD = P(`M0 2 L${w / 2} ${vy} L${w} 2 L${w} ${h - 10} Q${w} ${h} ${w - 10} ${h} L10 ${h} Q0 ${h} 0 ${h - 10} Z`);
const pocketTop = P(`M2 3 L${w / 2} ${vy} L${w - 2} 3`);
const folds = P(`M4 ${h - 4} L${w * 0.4} ${Math.round(h * 0.6)} M${w - 4} ${h - 4} L${w * 0.6} ${Math.round(h * 0.6)}`);
const svg = (cls, z, inner, extra = '') => `<svg${cls ? ` class="${cls}"` : ''} width="${w}" height="${h}" style="position:absolute;inset:0;overflow:visible;z-index:${z}${extra}" aria-hidden="true">${inner}</svg>`;
// 缩小的小报：只有图，没有字（它跟着信封一起歪）
const mini = `<div class="pm-env-mini" style="position:absolute;left:105px;top:16px;width:120px;height:156px;z-index:2"><div style="position:absolute;inset:0;border-radius:4px;background:var(--color-print-cream);box-shadow:0 1px 2px rgba(0,0,0,.18)"></div><div style="position:absolute;left:12px;top:16px;width:58px;height:8px;border-radius:4px;background:var(--color-yuzu)"></div><div style="position:absolute;left:12px;top:30px;width:36px;height:5px;border-radius:3px;background:color-mix(in srgb,var(--color-print-ink) 14%,transparent)"></div><span class="pm-env-mini-pomelo" style="position:absolute;left:38px;top:62px;width:70px;transform:rotate(-8deg)"><!-- @include marks/pomelo/pomelo-normal.svg --></span>${tape({ x: 30, y: -8, w: 56, h: 18, rot: 4, colors: TAPE })}</div>`;

const env = `<button type="button" class="pm-env" aria-label="拆开：2026 年度小报">
<span class="pm-env-paper" style="position:absolute;inset:0;transform:rotate(-3deg);pointer-events:none"><span style="position:absolute;inset:0;border-radius:10px;box-shadow:0 2px 3px var(--color-shadow),0 16px 30px var(--color-shadow)"></span>${svg('', 0, fl(body, 950, 'var(--color-kraft-inside)'))}${svg('', 1, s(mouth, 951))}${svg('pm-env-flap', 4, fl(flapD, 953, 'var(--color-kraft-flap)') + s(flapD, 954))}${mini}${svg('', 3, fl(pocketD, 955, 'var(--color-kraft)') + s(folds, 956, 1.3) + s(pocketTop, 957, 1.7))}${svg('', 5, s(rim, 952), ';pointer-events:none')}</span>
<span class="pm-env-seal" style="position:absolute;left:${w / 2 - 30}px;top:${Math.round(h * 0.58) - 40}px;width:60px;z-index:6"><!-- @include marks/pomelo/pomelo-normal.svg --></span>
<span class="pm-env-label" style="position:absolute;left:0;right:0;bottom:20px;text-align:center;color:var(--color-print-ink);z-index:7"><span style="display:block;font-size:19px;font-weight:700;line-height:26px">2026 年度小报</span><span style="display:block;font-size:13px;line-height:20px">柚子写的 · 拆开看看</span></span>
</button>`;

const frag = `<!-- 拆年度小报的信封：撕掉封口的柚子贴纸 → 翻盖翻起来退到后面 → 小报升起来。由 gen.mjs 生成，不手改 -->
<div class="env-demo" style="padding:124px 76px 18px 22px">
${env}
</div>
`;
writeFileSync(path.join(HERE, 'atlas-envelope.fragment.html'), frag);
console.log('atlas-envelope.fragment.html', (frag.length / 1024).toFixed(1) + ' KB');
