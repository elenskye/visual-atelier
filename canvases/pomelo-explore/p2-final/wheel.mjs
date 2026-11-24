// 柚子瓣（B3 版）：点左上角的柚子，从它那里转着长出来；拖着能转，松手接着转；字对上的模块亮，对不上就问柚子。
import { P, circle, handStroke, handFill, f } from './lib.mjs';
import { wob, glyph, icon } from './parts.mjs';
import { MODS, CATS_ORDER, TODAY } from './content.mjs';

// 柚子瓣：拖着能转，松手接着转；字对上的模块亮，对不上就问柚子
export function wheel(centerPomelo) {
  const C = 300, R1 = 120, R2 = 244, RR1 = 252, RR2 = 272, RM = 183, RL = 300;
  const mods = CATS_ORDER.flatMap(([cat, , ids]) => ids.map((id) => ({ id, cat })));
  const step = 360 / mods.length;
  let a = -90 - (CATS_ORDER[0][2].length * step) / 2;
  const pt = (r, deg) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)];
  const sector = (a0, a1) => {
    const g1 = (4 / R2) * 57.3, g0 = (4 / R1) * 57.3;
    const pts = [];
    for (let t = a0 + g1; t <= a1 - g1 + 0.01; t += 3) pts.push(pt(R2, t));
    pts.push(pt(R2, a1 - g1));
    for (let t = a1 - g0; t >= a0 + g0 - 0.01; t -= 3) pts.push(pt(R1, t));
    pts.push(pt(R1, a0 + g0));
    return P('M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' Z');
  };
  let wedges = '', slots = '', labels = '';
  let k = 0;
  CATS_ORDER.forEach(([cat, name, ids], ci) => {
    const a0 = a, a1 = a + ids.length * step;
    const d = sector(a0, a1);
    wedges += `<g class="wedge"><path class="fl" d="${handFill(d, { amp: 0.8, seed: 600 + ci, sp: 3, keep: 3, prec: 0 })}" fill="var(--c-${cat}-l)" transform="translate(1.6 2)"></path><path class="ol" pathLength="1" d="${handStroke(d, { amp: 1.1, seed: 610 + ci, sp: 3, keep: 3, over: 0.02, prec: 0 })}" fill="none" stroke="var(--pen)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></g>`;
    const [lx, ly] = pt(RL, (a0 + a1) / 2);
    labels += `<div class="wl" style="position:absolute;left:${f(lx - 40)}px;top:${f(ly - 13)}px;width:80px;text-align:center"><span style="display:inline-block;transform:rotate(calc(-1 * var(--a)));font-size:15px;font-weight:700;color:color-mix(in srgb,var(--c-${cat}) 60%,var(--ink))">${name}</span></div>`;
    ids.forEach((id, j) => {
      const [x, y] = pt(RM, a0 + (j + 0.5) * step);
      slots += `<div class="slot {{wm.${id}}}" data-mod="${id}" style="position:absolute;left:${f(x - 40)}px;top:${f(y - 38)}px;width:80px;height:76px"><div class="slotin" style="transform:rotate(calc(-1 * var(--a)))"><div class="slotlift" style="display:flex;flex-direction:column;align-items:center;gap:2px">${icon(MODS[id].icon, 46, `transform:rotate(${[-6, 5, -3, 7, -5][k++ % 5]}deg)`)}<span style="font-size:13px;white-space:nowrap">${MODS[id].name}</span></div></div></div>`;
    });
    a = a1;
  });
  const ring = `<path d="${handFill(circle(C, C, RR2), { amp: 1, seed: 620, sp: 3, prec: 0 })}${handFill(circle(C, C, RR1), { amp: 0.8, seed: 621, sp: 3, prec: 0 })}" fill="#FFD23F" fill-rule="evenodd" transform="translate(1.6 2)"></path><path class="ol" pathLength="1" d="${handStroke(circle(C, C, RR2), { amp: 1.3, seed: 622, over: 0.05, sp: 3, prec: 0 })}" fill="none" stroke="var(--pen)" stroke-width="2.4" stroke-linecap="round"></path><path class="ol" pathLength="1" d="${handStroke(circle(C, C, RR1), { amp: 1, seed: 623, over: 0.05, sp: 3, prec: 0 })}" fill="none" stroke="var(--pen)" stroke-width="1.8" stroke-linecap="round"></path>`;
  const pores = Array.from({ length: 28 }, (_, i) => { const [x, y] = pt(262, i * 12.86 + 4); return `<circle cx="${f(x)}" cy="${f(y)}" r="1.6" fill="#E8A92A"></circle>`; }).join('');
  const pith = `<path d="${handFill(circle(C, C, 112), { amp: 0.8, seed: 630, sp: 2.5 })}" fill="var(--card)"></path><path class="ol" pathLength="1" d="${handStroke(circle(C, C, 112), { amp: 1, seed: 631, over: 0.05, sp: 2.5 })}" fill="none" stroke="var(--pen)" stroke-width="2" stroke-linecap="round"></path>`;
  return `<div class="{{jumpCls}}" onClick="{{jumpBg}}" style="position:absolute;inset:0;z-index:50">
<div class="{{whlCls}}" style="position:absolute;left:340px;top:118px;width:600px;height:600px;touch-action:none;{{wheelStyle}}" onPointerDown="{{wheelDown}}" onPointerMove="{{dragMove}}" onPointerUp="{{dragEnd}}" onPointerCancel="{{dragEnd}}">
<svg width="600" height="600" style="position:absolute;inset:0;overflow:visible" aria-hidden="true"><g class="spin">${ring}${pores}${wedges}</g>${pith}</svg>
<div class="spin" style="position:absolute;inset:0">${slots}${labels}</div>
<div class="nodrag" style="position:absolute;left:${C - 100}px;top:${C - 92}px;width:200px;display:flex;flex-direction:column;align-items:center;gap:6px"><div class="{{face}}">${centerPomelo}</div><div class="i2" style="font-size:12px">${TODAY}</div><div class="field" style="position:relative;width:184px;height:36px;display:flex;align-items:center;padding:0 12px">${wob(184, 36, { r: 12, amp: 0.55, sw: 1.6, seed: 640, fill: 'var(--paper)', pad: 4 })}<input aria-label="去哪，或问柚子" placeholder="去哪，或问柚子" value="{{q}}" onChange="{{onQ}}" onKeyDown="{{qKey}}" style="position:relative;width:100%;font-size:15px;text-align:center"></div><sc-if value="{{noMatch}}" hint-placeholder-val="{{false}}"><button type="button" class="press" onClick="{{askFromJump}}" style="font-size:13px;color:var(--link);display:flex;align-items:center;gap:4px;max-width:200px;white-space:nowrap;overflow:hidden">${glyph('sparkle', 13)}问柚子「{{qText}}」</button></sc-if></div>
</div>
<div class="i2" style="position:absolute;left:40px;bottom:24px;font-size:14px">＋ 分类</div><div class="i2" style="position:absolute;right:40px;bottom:24px;font-size:14px">已隐藏 2</div>
</div>`;
}

export const WHEEL_CSS = `
.jp{background:color-mix(in srgb,var(--desk) 58%,transparent);-webkit-backdrop-filter:blur(9px);backdrop-filter:blur(9px)}
.jp.in{animation:fadeIn .25s both}.jp.out{animation:fadeIn .2s reverse both}
.whl{--fx:-533px;--fy:-387px;cursor:grab}
.whl .spin{transform:rotate(var(--a));transform-origin:300px 300px}
.jp.in .whl{animation:bloomGrow .62s cubic-bezier(.2,.9,.3,1.12) both}
.jp.out .whl{animation:bloomShrink .2s ease-in both}
.jp.in .whl .ol{stroke-dasharray:1 1;animation:dOl .7s .12s ease-out both}
.jp.in .whl .fl{animation:dFl .4s .4s both}
.jp.in .slot{animation:popIn .45s cubic-bezier(.3,1.6,.5,1) both}
${Array.from({ length: 11 }, (_, i) => `.jp.in .slot:nth-child(${i + 1}){animation-delay:${(0.35 + i * 0.035).toFixed(3)}s}`).join('')}
@keyframes bloomGrow{0%{transform:translate(var(--fx),var(--fy)) scale(.06) rotate(-60deg);opacity:.3}70%{opacity:1}100%{transform:none;opacity:1}}
@keyframes bloomShrink{to{transform:translate(var(--fx),var(--fy)) scale(.06) rotate(-40deg);opacity:0}}
@keyframes popIn{0%{transform:scale(0)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
.slot{cursor:pointer;transition:opacity .2s}
.slotlift .ic{transition:transform .35s cubic-bezier(.3,1.6,.5,1)}
.slot:hover .slotlift .ic{transform:rotate(-4deg) scale(1.16) translateY(-3px) !important}
.slot.dim{opacity:.16}
.slot.hit .slotlift .ic{transform:rotate(-4deg) scale(1.14) !important;filter:drop-shadow(0 0 6px var(--marker))}
.whl.spin1 .spin{animation:spinOnce 1.2s cubic-bezier(.3,.1,.2,1)}
@keyframes spinOnce{from{transform:rotate(calc(var(--a) - 360deg))}to{transform:rotate(var(--a))}}
`;
