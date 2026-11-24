// 手作零件的样张：同一组零件逐套配色、逐明暗出一张 SVG，写进 dist/<方案>/handmade/。只处理带 tokens/handmade.json 的方案。
// 算法在 line.mjs、sticker.mjs、frame.mjs，数值全在方案的 tokens/handmade.json。正式资产（Phase 8 起）也走这几个模块。
import path from 'node:path';
import { parseArgs, schemesToBuild, outRoot, loadTokens, paletteIds, writeFile, log, isMain } from '../lib/common.mjs';
import { P, circle, ellipse, rrect, handStroke, handFill, f } from './line.mjs';
import { render } from './sticker.mjs';
import { tapeSvg } from './frame.mjs';

// 样张用的图形，只为看画法，不是方案的资产
const STAR = P('M32 8 L39 24 L56 26 L43 38 L47 55 L32 46 L17 55 L21 38 L8 26 L25 24 Z');
export const specimenArt = (cat) => ({ name: '样张', cat, parts: [
  { t: 'shape', d: STAR, fill: 'cat', seed: 11 },
  { t: 'shape', d: circle(26, 34, 2.2), fill: 'ink', sw: 0.5, amp: 0.3, seed: 12 },
  { t: 'shape', d: circle(38, 34, 2.2), fill: 'ink', sw: 0.5, amp: 0.3, seed: 13 },
  { t: 'line', d: P('M27 41 C30 44 34 44 37 41'), seed: 14 },
] });

export function specimenSvg(tokens, palette, mode) {
  const h = tokens.handmade;
  const roles = tokens.color.paletteRoles?.[palette] ?? tokens.color.roles;
  const c = (r) => roles[r][mode];
  const st = h.sticker;
  const col = { ink: c('art-ink'), white: c('art-white'), shadow: c('art-shadow'), blush: c('blush'), cats: { mint: c('cat-mint'), sky: c('cat-sky'), pink: c('cat-pink'), orange: c('cat-orange'), grape: c('cat-grape') } };
  const idp = `${palette ?? 'x'}${mode[0]}`;
  const stroke = (d, w, color, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}></path>`;
  const frame = rrect(24, 28, 372, 244, 14);
  const fr = h.frame;
  const stitches = [];
  for (let y = 44; y < 256; y += h.stitch.gap) stitches.push(handStroke(P(`M40 ${y} L40.6 ${y + h.stitch.len}`), { amp: h.stitch.amp, wave: h.stitch.wave, seed: y, sp: 1, keep: 2 }));
  const r = h.rule, mk = h.marker, sk = h.strike, ic = h.uiIcon;
  const bell = [P('M12 4 C8 4 6.5 7 6.5 10 L6.5 13.5 L4.5 17 L19.5 17 L17.5 13.5 L17.5 10 C17.5 7 16 4 12 4 Z'), P('M10 19.5 C10.5 21 13.5 21 14 19.5')];
  const star = render(specimenArt('orange'), st, col, { k: 1, idp: `${idp}s` });
  const star2 = render(specimenArt('sky'), st, col, { k: 1, idp: `${idp}t` });
  const round = ellipse(0, 0, 34, 34);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="300" viewBox="0 0 620 300" role="img" aria-label="手作零件样张">
<rect width="620" height="300" fill="${c('desk')}"></rect>
<path d="${handFill(frame, { amp: fr.amp * 0.8, seed: 21, sp: fr.sp, keep: 3, prec: 0 })}" fill="${c('card')}"></path>
${stroke(handStroke(frame, { amp: fr.amp, wave: fr.wave, seed: 21, sp: fr.sp, keep: 2, over: fr.over, drift: fr.drift, prec: 0 }), fr.lineWidth[1], c('pen'))}
<g opacity="${h.stitch.opacity}">${stroke(stitches.join(''), h.stitch.lineWidth, c('pen'))}</g>
${tapeSvg(160, 16, 88, 22, h.tape.firstRotDeg, h.tape.kinds[0].map(c), { id: `${idp}ta`, stripe: h.tape.stripe, opacity: h.tape.opacity, teeth: h.tape.teeth, depth: h.tape.toothDepth })}
${tapeSvg(330, 30, 76, 22, h.tape.secondRotDeg, h.tape.kinds[1].map(c), { id: `${idp}tb`, stripe: h.tape.stripe, opacity: h.tape.opacity, teeth: h.tape.teeth, depth: h.tape.toothDepth })}
${stroke(handStroke(P('M70 84 C120 80 190 88 250 83'), { amp: mk.amp, wave: mk.wave, seed: 31, sp: 2, keep: 3 }), mk.lineWidth, c('marker'), ` opacity="${mk.opacity}"`)}
${stroke(handStroke(P('M70 124 C150 122 260 126 350 123'), { amp: r.amp, wave: r.wave, seed: 32, sp: 2, keep: 3 }), r.lineWidth, c('pen'))}
${stroke(handStroke(P('M70 164 C130 161 200 167 260 162'), { amp: sk.amp, wave: sk.wave, seed: 33, sp: 1.5, keep: 3 }), sk.lineWidth, c('ink-soft'))}
<g transform="translate(70 200) scale(1.6)">${stroke(bell.map((d, i) => handStroke(d, { amp: ic.amp, wave: ic.wave, sp: ic.sp, keep: ic.keep, seed: 40 + i, over: ic.over })).join(''), ic.line, c('ink'))}</g>
<rect x="136" y="204" width="110" height="36" rx="10" fill="${c('primary')}"></rect>
<rect x="262" y="204" width="110" height="36" rx="8" fill="${c('selected')}"></rect>
<g transform="translate(424 26) scale(1.25)"><defs>${star.defs}</defs>${star.html}</g>
<g transform="translate(516 40) rotate(${st.tiltDeg} 32 32)"><defs>${star2.defs}</defs>${star2.html}</g>
<g transform="translate(476 196)"><path d="${handFill(round, { amp: st.fillAmp * 2, seed: 51 })}" fill="${c('art-white')}" stroke="${c('art-white')}" stroke-width="${st.border * 2}"></path><path d="${handFill(round, { amp: st.fillAmp * 2, seed: 52 })}" fill="${c('cat-mint-sticker')}" transform="translate(${st.off[0]} ${st.off[1]})"></path>${stroke(handStroke(round, { amp: st.amp, seed: 52 }), f(st.line * 0.7), c('art-ink'))}</g>
<g transform="translate(562 214)"><path d="${handFill(ellipse(0, 0, 26, 26), { amp: st.fillAmp * 2, seed: 53 })}" fill="${c('art-white')}" stroke="${c('art-white')}" stroke-width="${st.border * 2}"></path><path d="${handFill(ellipse(0, 0, 26, 26), { amp: st.fillAmp * 2, seed: 54 })}" fill="${c('yuzu')}" transform="translate(${st.off[0]} ${st.off[1]})"></path>${stroke(handStroke(ellipse(0, 0, 26, 26), { amp: st.amp, seed: 53 }), f(st.line * 0.7), c('art-ink'))}</g>
</svg>
`;
}

export function runHandmade(args = parseArgs()) {
  for (const scheme of schemesToBuild(args)) {
    const tokens = loadTokens(scheme);
    if (!tokens.handmade) continue;
    const out = path.join(outRoot(args), scheme, 'handmade');
    let n = 0;
    for (const palette of paletteIds(tokens)) for (const mode of ['light', 'dark']) {
      writeFile(path.join(out, `${palette ?? 'default'}-${mode}.svg`), specimenSvg(tokens, palette, mode));
      n++;
    }
    log(`handmade ${scheme}: ${n} 张样张`);
  }
}

if (isMain(import.meta.url)) runHandmade();
