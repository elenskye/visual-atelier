// 迁移测试：三样小样里没画过的东西，只照 docs/pomelo-rules.md 做，看认不认得出是同一家。
// 12 个界面小图标（24 格单线、选中抹荧光笔）、加载动画「穿针」（缝线点）、投石问路的空状态（线描贴纸、画完再弹）。字都摆正。
import { P, rrect, circle, ellipse, rotate, handStroke, handFill, f, rng } from './lib.mjs';
import { wob, tex, glyph, tape, tiltLayer, btn } from './parts.mjs';
import { render, svg as artSvg, STYLES } from './art.mjs';
import { V } from './parts.mjs';
import { palettePanel } from './views.mjs';

const st = STYLES.hybrid;

// ---------- 1 界面小图标（24 格，一笔单线 2，抖动 0.32，跟着文字颜色） ----------
export const NEW_ICONS = [
  ['bell', '提醒', () => [P('M6.2 16.5 C7.2 15 7.2 12.4 7.2 10.2 C7.2 7 9.3 4.8 12 4.8 C14.7 4.8 16.8 7 16.8 10.2 C16.8 12.4 16.8 15 17.8 16.5 Z'), P('M10.2 19.4 C10.8 20.4 13.2 20.4 13.8 19.4'), P('M12 3.2 L12 4.8')]],
  ['lock', '锁', () => [rrect(5.5, 10.5, 13, 9.5, 2.6), P('M8.6 10.5 L8.6 8.2 C8.6 5.9 10.1 4.5 12 4.5 C13.9 4.5 15.4 5.9 15.4 8.2 L15.4 10.5'), P('M12 14.2 L12 16.4')]],
  ['paperclip', '附件', () => [P('M16.2 7.8 L9.6 14.4 C8.8 15.2 8.8 16.4 9.6 17.2 C10.4 18 11.6 18 12.4 17.2 L18.4 11.2 C20 9.6 20 7.1 18.4 5.5 C16.8 3.9 14.3 3.9 12.7 5.5 L6.4 11.8 C4.1 14.1 4.1 17.7 6.4 20 C8.7 22.3 12.3 22.3 14.6 20 L19 15.6')]],
  ['link', '链接', () => [P('M10.4 13.6 C9 12.2 9 10 10.4 8.6 L13 6 C14.4 4.6 16.6 4.6 18 6 C19.4 7.4 19.4 9.6 18 11 L16.6 12.4'), P('M13.6 10.4 C15 11.8 15 14 13.6 15.4 L11 18 C9.6 19.4 7.4 19.4 6 18 C4.6 16.6 4.6 14.4 6 13 L7.4 11.6')]],
  ['share', '导出', () => [P('M12 14.6 L12 4.2 M8.2 7.8 L12 4.2 L15.8 7.8'), P('M8.6 10.2 L6.2 10.2 L6.2 19.6 L17.8 19.6 L17.8 10.2 L15.4 10.2')]],
  ['tag', '标签', () => [P('M4.6 12.2 L4.6 5.8 C4.6 5.1 5.1 4.6 5.8 4.6 L12.2 4.6 L19.6 12 L12 19.6 Z'), circle(8.6, 8.6, 1.4)]],
  ['star', '收藏', () => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 3.9 : 8.4; pts.push(`${f(12 + r * Math.cos(a))} ${f(12.8 + r * Math.sin(a))}`); } return [P('M' + pts.join(' L') + ' Z')]; }],
  ['refresh-cw', '刷新', () => [P('M19 12 C19 15.9 15.9 19 12 19 C9.5 19 7.4 17.8 6.1 15.8'), P('M5 12 C5 8.1 8.1 5 12 5 C14.5 5 16.6 6.2 17.9 8.2'), P('M18.2 4.4 L18.2 8.4 L14.2 8.4'), P('M5.8 19.6 L5.8 15.6 L9.8 15.6')]],
  ['filter', '筛选', () => [P('M4.6 5.6 L19.4 5.6 L14 12.4 L14 18.2 L10 19.8 L10 12.4 Z')]],
  ['eye', '显示', () => [P('M3 12 C5.4 7.6 8.4 5.8 12 5.8 C15.6 5.8 18.6 7.6 21 12 C18.6 16.4 15.6 18.2 12 18.2 C8.4 18.2 5.4 16.4 3 12 Z'), circle(12, 12, 3)]],
  ['copy', '复制', () => [rrect(8.8, 8.8, 10.6, 10.6, 2.4), P('M15.4 8.8 L15.4 6.2 C15.4 5.2 14.8 4.6 13.8 4.6 L6.2 4.6 C5.2 4.6 4.6 5.2 4.6 6.2 L4.6 13.8 C4.6 14.8 5.2 15.4 6.2 15.4 L8.8 15.4')]],
  ['clock', '时间', () => [circle(12, 12, 8.2), P('M12 7.4 L12 12 L15.2 14')]],
];
function iconD(id, mk) {
  const sw = { amp: 0.32, wave: 7, sp: 0.6, keep: 2 };
  return mk().map((c, i) => handStroke(c, { ...sw, seed: id.length * 7 + i * 13, over: 0.05 })).join('');
}
export function migrateDefs() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${NEW_ICONS.map(([id, , mk]) => `<symbol id="n-${id}" viewBox="0 0 24 24"><path d="${iconD(id, mk)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></symbol>`).join('')}</defs></svg>`;
}
const nIcon = (id, size) => `<svg width="${size}" height="${size}" style="flex:none;display:block" aria-hidden="true"><use href="#n-${id}"></use></svg>`;
// 选中：底下抹一笔荧光笔
const smear = (seed) => `<svg class="smear" width="40" height="34" viewBox="0 0 40 34" style="position:absolute;left:-2px;top:2px;overflow:visible" aria-hidden="true"><path d="${handFill(ellipse(20, 17, 17, 12.5, -12), { amp: 1.2, seed })}" fill="var(--marker)" opacity=".85"></path></svg>`;

function iconsPanel() {
  const grid = NEW_ICONS.map(([id, name], i) => `<div style="position:absolute;left:${(i % 6) * 84}px;top:${Math.floor(i / 6) * 84}px;width:72px;height:72px;display:flex;flex-direction:column;align-items:center;gap:8px"><div style="height:30px;display:flex;align-items:flex-end">${nIcon(id, 24)}</div><div style="font-size:13px;line-height:18px">${name}</div><div class="i2" style="font-size:11px;line-height:14px;white-space:nowrap">${id}</div></div>`).join('');
  const sizes = [16, 20].map((s, k) => `<div style="display:flex;align-items:center;gap:${s === 16 ? 18 : 16}px;height:28px"><span class="i2 num" style="width:30px;font-size:12px">${s}</span>${NEW_ICONS.map(([id]) => nIcon(id, s)).join('')}</div>`).join('');
  const tools = ['bell', 'tag', 'paperclip', 'link', 'star', 'share', 'copy', 'eye'];
  const bar = `<div style="position:relative;width:420px;height:52px;display:flex;align-items:center;gap:6px;padding:0 12px">${wob(420, 52, { r: 14, amp: 0.7, sw: 1.8, seed: 1601, fill: 'var(--card)', pad: 5 })}${tools.map((id, i) => `<button type="button" class="{{nbCls.${i}}}" onClick="{{nbPick.${i}}}" aria-label="${NEW_ICONS.find((x) => x[0] === id)[1]}" style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">${smear(1610 + i)}<span style="position:relative">${nIcon(id, 22)}</span></button>`).join('')}<span style="flex:1"></span><span class="i2" style="position:relative;font-size:13px;line-height:18px;white-space:nowrap">{{nbLabel}}</span></div>`;
  return `<div style="position:absolute;left:52px;top:96px;width:560px;height:600px">
<div style="font-size:20px;font-weight:700;line-height:28px">① 界面小图标 · 12 个</div>
<div class="i2" style="font-size:13px;line-height:20px">24 格一笔单线，跟着文字颜色；选中时底下抹一笔荧光笔，不加方框</div>
<div style="position:absolute;left:4px;top:76px;width:500px;height:160px">${grid}</div>
<div style="position:absolute;left:0;top:262px">${sizes}</div>
<div class="i2" style="position:absolute;left:0;top:340px;font-size:13px;line-height:20px">放进工具栏（点一下换选中的）</div>
<div style="position:absolute;left:4px;top:370px">${bar}</div>
<div style="position:absolute;left:4px;top:446px;width:520px;display:flex;gap:16px;align-items:center;font-size:14px;line-height:20px">
<span style="display:flex;align-items:center;gap:6px">${nIcon('clock', 18)}<span>还有 3 天</span></span>
<span style="display:flex;align-items:center;gap:6px;color:var(--link)">${nIcon('link', 18)}<span>打开网页</span></span>
<span style="display:flex;align-items:center;gap:6px">${nIcon('lock', 18)}<span>私密</span></span>
<span style="display:flex;align-items:center;gap:6px" class="i2">${nIcon('refresh-cw', 18)}<span>刚刚更新</span></span>
</div>
<div class="i2" style="position:absolute;left:0;top:486px;font-size:13px;line-height:20px">和小样里已有的图标摆在一起：</div>
<div style="position:absolute;left:4px;top:514px;display:flex;gap:14px;align-items:center">${['back', 'fwd', 'search', 'gear', 'home', 'pin', 'trash', 'cal', 'pen', 'check'].map((g) => glyph(g, 22)).join('')}<span style="width:1px;height:22px;background:var(--line);margin:0 4px"></span>${['bell', 'lock', 'tag', 'eye'].map((id) => nIcon(id, 22)).join('')}</div>
</div>`;
}

// ---------- 2 加载动画「穿针」：针在纸边缝过去，身后留下一串缝线点，缝满打个结，再从头缝 ----------
const N = 12, STEP = 22;
function needle() {
  // 针：细长的一根，针眼留白；线从针眼拖出来
  const body = P('M0 0 C6 -2.2 20 -2.6 30 0 C20 2.6 6 2.2 0 0 Z');
  return `<g class="ndl"><g transform="scale(1.6)"><path d="${handStroke(P('M-2 0 C-10 -8 -18 6 -26 -2'), { amp: 0.4, seed: 1701, sp: 1 })}" fill="none" stroke="var(--c-pink)" stroke-width="2.4" stroke-linecap="round"></path><path d="${handFill(body, { amp: 0.15, seed: 1702 })}" fill="#B8C2CC" stroke="var(--a-ink)" stroke-width="1.6" stroke-linejoin="round"></path><path d="${handFill(ellipse(5, 0, 2.4, 0.9), { amp: 0.05, seed: 1703 })}" fill="var(--card)"></path></g></g>`;
}
function loader(w, { mini = false } = {}) {
  const r = rng(1710);
  const stitch = Array.from({ length: N }, (_, i) => {
    const x = 10 + i * STEP, tilt = (r() - 0.5) * 2.4;
    return `<path class="sti" style="--i:${i}" d="${handStroke(P(`M${f(x)} ${f(20 + tilt / 2)} L${f(x + 12)} ${f(20 - tilt / 2)}`), { amp: 0.35, wave: 6, seed: 1720 + i, sp: 1, keep: 2 })}" fill="none" stroke="var(--pen)" stroke-width="3" stroke-linecap="round"></path>`;
  }).join('');
  const knot = `<path class="knot" d="${handFill(circle(10 + N * STEP - 2, 20, 3.4), { amp: 0.3, seed: 1740 })}" fill="var(--c-pink)" stroke="var(--a-ink)" stroke-width="1.2"></path>`;
  return `<svg class="sew${mini ? ' mini' : ''}" width="${w}" height="${mini ? 20 : 40}" viewBox="0 0 ${10 + N * STEP + 14} 40" style="display:block;overflow:visible" aria-hidden="true">${stitch}${knot}<g class="ndlx">${needle()}</g></svg>`;
}
function loaderPanel() {
  return `<div style="position:absolute;left:660px;top:96px;width:500px;height:250px">
<div style="font-size:20px;font-weight:700;line-height:28px">② 加载动画 · 穿针</div>
<div class="i2" style="font-size:13px;line-height:20px">纸边的缝线点一针针缝出来，缝满打个结，再从头缝</div>
<div style="position:absolute;left:0;top:70px;width:440px;height:126px">
${tiltLayer(-0.8, `<div style="position:absolute;inset:0;background:var(--paper);border-radius:10px;box-shadow:0 1px 2px var(--shadow),0 8px 18px var(--shadow)">${tex('tx')}</div>${wob(440, 126, { r: 10, amp: 0.9, sw: 1.8, seed: 1750 })}${tape({ x: 170, y: -11, w: 84, rot: -3 })}`)}
<div style="position:absolute;left:50px;top:26px">${loader(330)}</div>
<div class="i2" style="position:absolute;left:0;right:0;top:82px;text-align:center;font-size:14px;line-height:20px">正在缝…</div>
</div>
<div style="position:absolute;left:0;top:212px;display:flex;align-items:center;gap:14px"><span style="position:relative;display:flex;align-items:center;gap:10px;width:186px;height:36px;padding:0 14px 0 12px">${wob(186, 36, { r: 10, amp: 0.55, sw: 1.6, seed: 1760, fill: 'var(--card)', pad: 4 })}<span style="position:relative;display:block;width:80px">${loader(80, { mini: true })}</span><span style="position:relative;font-size:14px;line-height:20px;white-space:nowrap">正在导出</span></span><span class="i2" style="font-size:13px;line-height:20px">按钮里也能缝</span></div>
</div>`;
}

// ---------- 3 空状态：投石问路「路还没开始问」 ----------
export const POND = {
  name: '投石问路', cat: 'grape', parts: [
    { t: 'shape', d: ellipse(122, 98, 62, 15), fill: 'var(--c-sky-s)', seed: 1801, id: 'pond' },
    { t: 'line', d: ellipse(122, 98, 38, 8.4), sw: 0.6, seed: 1802, id: 'pond' },
    { t: 'line', d: ellipse(122, 98, 16, 3.4), sw: 0.6, seed: 1803, id: 'pond' },
    { t: 'shape', d: P('M18 104 C16 93 25 84 37 84 C49 84 57 91 56 99 C55 106 47 108 37 108 C27 108 19 107 18 104 Z'), fill: 'catLight', seed: 1804, id: 'pebble' },
    { t: 'line', d: P('M27 92 C29 89 32 88 35 88'), sw: 0.7, color: 'white', withFill: true, seed: 1805, id: 'pebble' },
    { t: 'line', d: P('M212 110 L213 60'), sw: 1, seed: 1806, id: 'sign' },
    { t: 'shape', d: rotate(rrect(186, 44, 56, 24, 5), 213, 56, -5), fill: 'wood', seed: 1807, id: 'sign' },
    { t: 'line', d: rotate(P('M197 56 L229 56 M220 49 L229 56 L220 63'), 213, 56, -5), sw: 0.85, seed: 1808, id: 'sign' },
    { t: 'line', d: P('M196 110 L199 101 M202 110 L202 99 M208 110 L205 102 M64 106 L66 98 M70 106 L70 96'), sw: 0.7, seed: 1809, id: 'grass' },
  ],
};
function emptyPanel() {
  const art = artSvg(POND, st, V, { size: 320, view: '2 30 250 92', k: 1.25, idp: 'pnd', merge: false, anim: true, cls: 'draw pond' });
  return `<div style="position:absolute;left:660px;top:380px;width:500px;height:316px">
<div style="font-size:20px;font-weight:700;line-height:28px">③ 空状态 · 投石问路</div>
<div class="i2" style="font-size:13px;line-height:20px">线描贴纸，画完再弹：石头蹦两下，水面荡一圈，路牌晃一晃</div>
<div style="position:absolute;left:0;top:64px;width:440px;height:240px">
${tiltLayer(0.6, `<div style="position:absolute;inset:0;background:var(--paper);border-radius:10px;box-shadow:0 1px 2px var(--shadow),0 8px 18px var(--shadow)">${tex('tx')}</div>${wob(440, 240, { r: 10, amp: 0.9, sw: 1.8, seed: 1820 })}`)}
<sc-if value="{{pondOn}}" hint-placeholder-val="{{true}}"><div style="position:absolute;left:60px;top:22px;width:320px;height:118px">${art}<svg width="320" height="118" viewBox="2 30 250 92" style="position:absolute;left:0;top:0;overflow:visible" aria-hidden="true"><path class="rp" d="${handStroke(ellipse(122, 98, 26, 5.6), { amp: 0.3, seed: 1830, sp: 1 })}" fill="none" stroke="var(--pen)" stroke-width="1.6"></path></svg></div></sc-if>
<div style="position:absolute;left:0;right:0;top:154px;text-align:center;font-size:17px;font-weight:700;line-height:24px">路还没开始问</div>
<div style="position:absolute;left:0;right:0;top:188px;display:flex;justify-content:center">${btn('投一份', { seed: 1840, onClick: 'nop', icon: glyph('plus', 16) })}</div>
</div>
<button type="button" class="press i2" onClick="{{replay}}" style="position:absolute;right:56px;top:4px;height:28px;display:flex;align-items:center;gap:4px;font-size:13px;line-height:18px">${glyph('back2', 14)}再画一次</button>
</div>`;
}

export function buildMigrate(hubPomelo) {
  const lights = ['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => `<i style="position:absolute;left:${14 + i * 20}px;top:19.5px;width:12px;height:12px;border-radius:50%;background:${c};display:block"></i>`).join('');
  const x = 36, y = 66, w = 1208, h = 716;
  const bg = `background-color:var(--paper);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:22px 22px`;
  return `${tex('tx', 'calc(var(--tex-o) * .8)')}<div style="position:absolute;left:0;top:0;width:1280px;height:58px;z-index:30">${lights}<div class="{{face}}" style="position:absolute;left:84px;top:4px">${hubPomelo}</div><button type="button" class="press" onClick="{{toggleCfg}}" aria-label="设置（配色）" style="position:absolute;right:16px;top:16px;display:flex">${glyph('gear', 21)}</button></div>
<div class="sheet" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:10">${tiltLayer(-0.2, `<div style="position:absolute;inset:0;border-radius:6px 12px 12px 6px;${bg};box-shadow:0 2px 4px var(--shadow),0 18px 40px var(--shadow)">${tex('tx')}</div>${wob(w, h, { r: 12, amp: 0.9, sw: 1.9, seed: 1590 })}`)}
<div style="position:absolute;left:52px;top:24px"><div style="font-size:28px;font-weight:700;line-height:36px">迁移测试：没画过的三样</div><div class="i2" style="font-size:14px;line-height:22px">只照 docs/pomelo-rules.md 做的；右上角齿轮换配色和深浅</div></div>
${iconsPanel()}${loaderPanel()}${emptyPanel()}
</div>
<sc-if value="{{cfgOn}}" hint-placeholder-val="{{false}}">${palettePanel(20, 54, 1650)}</sc-if>`;
}

export const MIGRATE_CSS = `
.nb .smear{opacity:0;transform:scale(.4,.8) rotate(-8deg);transform-origin:20% 60%;transition:opacity .15s,transform .38s cubic-bezier(.3,1.6,.5,1)}
.nb.on .smear{opacity:1;transform:none}
.nb{color:var(--ink2)}.nb.on{color:var(--ink)}
/* 穿针：一拍 0.16 秒缝一针；针跟着往右走，每一针上下扎一下；缝满打结，停一下，淡掉重来 */
.sew .sti{opacity:0;animation:sti 3.2s linear infinite;animation-delay:calc(var(--i) * .16s)}
@keyframes sti{0%{opacity:0}2%{opacity:1}88%{opacity:1}96%,100%{opacity:0}}
.sew .knot{transform-box:fill-box;transform-origin:50% 50%;animation:knot 3.2s cubic-bezier(.3,1.6,.5,1) infinite}
@keyframes knot{0%,58%{transform:scale(0)}64%{transform:scale(1.3)}70%,88%{transform:scale(1)}96%,100%{transform:scale(0)}}
.sew .ndlx{animation:ndl 3.2s linear infinite}
@keyframes ndl{0%{transform:translate(4px,20px)}60%{transform:translate(272px,20px)}66%,88%{transform:translate(276px,14px) rotate(-20deg);opacity:1}96%{opacity:0}100%{transform:translate(4px,20px);opacity:0}}
.sew .ndl{animation:dip .16s ease-in-out infinite alternate}
@keyframes dip{0%{transform:translateY(-3px) rotate(-6deg)}100%{transform:translateY(3px) rotate(6deg)}}
.pond .pt{transform-box:fill-box;transform-origin:50% 100%}
.pond .pt.pond{animation:shelfPop .5s .6s cubic-bezier(.3,1.6,.5,1) both}
.pond .pt.pebble{animation:pebbleHop 1.1s .8s ease-out both}
@keyframes pebbleHop{0%{transform:none}18%{transform:translate(3px,-16px) rotate(-12deg)}34%{transform:translate(6px,0) scale(1.1,.9)}50%{transform:translate(8px,-7px) rotate(8deg)}66%{transform:translate(9px,0) scale(1.05,.95)}100%{transform:translate(9px,0)}}
.pond .pt.sign{transform-origin:50% 100%;animation:signWig 1s 1.2s ease-in-out both}
@keyframes signWig{0%,100%{transform:none}25%{transform:rotate(-6deg)}55%{transform:rotate(4deg)}80%{transform:rotate(-2deg)}}
.pond .pt.grass{animation:shelfPop .45s 1.35s cubic-bezier(.3,1.6,.5,1) both}
.rp{opacity:0;transform-box:fill-box;transform-origin:50% 50%;animation:ripple 2.6s 1.9s ease-out infinite}
@keyframes ripple{0%{opacity:0;transform:scale(.4)}15%{opacity:.8}100%{opacity:0;transform:scale(2.1,1.8)}}
@media (prefers-reduced-motion: reduce){.sew .sti{opacity:1}.sew .knot{transform:none}.sew .ndlx{transform:translate(276px,14px) rotate(-20deg)}.pond .pt.pebble{transform:translate(9px,0)}.rp{opacity:0}}
`;
