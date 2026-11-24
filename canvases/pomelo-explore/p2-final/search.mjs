// 全局搜索：一张小票从顶上的出纸口打出来，边打字边往下打印结果；选中一行，小票撕下来带你过去。
import { P, handStroke } from './lib.mjs';
import { wob, hline, glyph, tiltLayer } from './parts.mjs';

export function searchOverlay(printerPomelo) {
  const W = 520;
  const zz = []; const n = 22;
  for (let i = 0; i <= n * 2; i++) zz.push(`${((i / (n * 2)) * 100).toFixed(2)}% ${i % 2 ? 'calc(100% - 10px)' : '100%'}`);
  const clip = `polygon(0 0,100% 0,${zz.reverse().join(',')})`;
  const row = (list) => `<sc-for list="{{${list}}}" as="g" hint-placeholder-count="2"><div class="{{g.cls}}" style="margin:8px 0 2px"><div class="i2" style="display:flex;align-items:center;gap:6px;font-size:13px;height:24px;padding:0 12px"><svg width="18" height="18" style="overflow:visible" aria-hidden="true"><use href="#ic-{{g.icon}}"></use></svg><span>{{g.name}}</span></div><sc-for list="{{g.rows}}" as="r" hint-placeholder-count="2"><button type="button" class="{{r.cls}}" onClick="{{r.pick}}" style="animation-delay: {{r.d}}"><span class="rt">{{r.title}}</span><span class="i2 rd">{{r.detail}}</span></button></sc-for></div></sc-for>`;
  return `<div class="{{searchCls}}" onClick="{{srBg}}" style="position:absolute;inset:0;z-index:55">
<div class="slot" style="position:absolute;left:${640 - 300}px;top:50px;width:600px;height:22px;z-index:3"><div style="position:absolute;inset:0;border-radius:11px;background:var(--pen);box-shadow:0 3px 6px var(--shadow)"></div><div style="position:absolute;left:40px;right:40px;top:9px;height:4px;border-radius:2px;background:rgba(0,0,0,.45)"></div><div style="position:absolute;right:-18px;top:-16px">${printerPomelo}</div></div>
<div class="rcwrap" style="position:absolute;left:${640 - W / 2 - 14}px;top:61px;width:${W + 28}px;height:730px;overflow:hidden;pointer-events:none">
<div class="{{rcptCls}}" style="position:absolute;left:14px;top:0;width:${W}px;pointer-events:auto">
<div style="position:absolute;inset:0;background:var(--card);clip-path:${clip};box-shadow:0 0 0 1px var(--line) inset"></div>
<div style="position:relative;padding:20px 18px 30px">
<div class="i2" style="text-align:center;font-size:12px;line-height:18px">— 柚儿园 · 找东西 —</div>
<div class="field" style="position:relative;display:flex;align-items:center;gap:10px;height:46px;margin:6px 4px 4px;padding:0 6px"><span class="i2" style="display:flex">${glyph('search', 20)}</span><input ref="{{refSq}}" aria-label="找东西" placeholder="找点什么…" value="{{sq}}" onChange="{{onSQ}}" onKeyDown="{{sKey}}" style="flex:1;font-size:19px"><span class="i2" style="font-size:12px;white-space:nowrap">{{sCount}}</span><div style="position:absolute;left:0;right:0;bottom:2px;pointer-events:none">${hline(W - 44, { seed: 901, sw: 1.8, cls: 'wob' })}</div></div>
${row('sGroups')}
<sc-if value="{{sNone}}" hint-placeholder-val="{{false}}"><div style="text-align:center;padding:18px 0 6px;font-size:15px">没找到「{{sq}}」<button type="button" class="press" onClick="{{sAsk}}" style="display:inline-flex;align-items:center;gap:4px;margin-left:8px;color:var(--link)">${glyph('sparkle', 14)}问问柚子</button></div></sc-if>
<sc-if value="{{sHasNear}}" hint-placeholder-val="{{false}}"><div class="pr" style="display:flex;align-items:center;gap:8px;margin:14px 4px 0"><div style="flex:1;border-top:2px dashed var(--line)"></div><span class="i2" style="display:flex;align-items:center;gap:4px;font-size:12px">${glyph('sparkle', 12)}意思相近</span><div style="flex:1;border-top:2px dashed var(--line)"></div></div>${row('sNear')}</sc-if>
<div class="i2" style="text-align:center;font-size:12px;line-height:18px;margin-top:16px;border-top:2px dashed var(--line);padding-top:10px">谢谢光临 · 柚子</div>
</div></div></div></div>`;
}

export const SEARCH_CSS = `
.sr{background:rgba(20,24,18,.16)}
.sr.in{animation:fadeIn .2s both}.sr.out{animation:fadeIn .25s reverse both}
.sr.in .slot{animation:slotIn .3s cubic-bezier(.3,1.5,.5,1) both}
@keyframes slotIn{0%{transform:translateY(-40px)}100%{transform:none}}
.rcpt{animation:printDown .5s .12s steps(9,end) both}
.sr.out .rcpt{animation:rollUp .25s ease-in both}
.rcpt.tear{animation:tearOff .38s cubic-bezier(.5,0,.8,.4) both}
@keyframes printDown{0%{transform:translateY(-100%)}100%{transform:none}}
@keyframes rollUp{to{transform:translateY(-100%)}}
@keyframes tearOff{0%{transform:none}25%{transform:translateY(6px) rotate(1deg)}100%{transform:translate(260px,-420px) rotate(24deg);opacity:0}}
.srow{position:relative;display:flex;align-items:center;gap:12px;width:100%;height:36px;padding:0 12px;border-radius:9px;font-size:15px;text-align:left}
.srow .rt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.srow .rd{font-size:12px;white-space:nowrap}
.srow:hover{background:color-mix(in srgb,var(--sel) 55%,transparent)}
.srow.on{background:var(--sel)}
.srow.p0{animation:prt0 .2s steps(3,end) both}.srow.p1{animation:prt1 .2s steps(3,end) both}
@keyframes prt0{0%{clip-path:inset(0 0 100% 0);transform:translateY(-6px)}100%{clip-path:inset(0);transform:none}}
@keyframes prt1{0%{clip-path:inset(0 0 100% 0);transform:translateY(-6px)}100%{clip-path:inset(0);transform:none}}
`;
