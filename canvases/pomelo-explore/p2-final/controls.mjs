// 控件的小动静：「其余地方也不要安静」。一张纸上摆 12 种常用控件，每样碰一下都有回应。字都摆正。
import { P, rrect, circle, handStroke, handFill, f } from './lib.mjs';
import { wob, hline, tex, glyph, icon, tw, btn, tape, tiltLayer, checkbox, stitches } from './parts.mjs';
import { MODS } from './content.mjs';
import { palettePanel } from './views.mjs';

const CW = 274, CH = 198;
const cell = (i, title, desc, demo) => {
  const col = i % 4, row = Math.floor(i / 4);
  return `<div class="cell" style="position:absolute;left:${52 + col * (CW + 16)}px;top:${96 + row * (CH + 8)}px;width:${CW}px;height:${CH}px;padding:16px 18px">${tiltLayer([-0.6, 0.5, -0.4, 0.7, 0.4, -0.6, 0.6, -0.5, 0.5, -0.7, 0.4, -0.4][i], `<div style="position:absolute;inset:0;border-radius:12px;background:var(--card);box-shadow:0 1px 2px var(--shadow),0 6px 14px var(--shadow)"></div>${wob(CW, CH, { r: 12, amp: 0.8, sw: 1.6, seed: 1300 + i })}`)}<div style="position:relative;font-size:16px;font-weight:700;line-height:22px">${title}</div><div class="i2" style="position:relative;font-size:12px;line-height:18px;margin-bottom:12px">${desc}</div><div style="position:relative">${demo}</div></div>`;
};

const STAR = (() => { const pts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 4.6 : 10.5; pts.push(`${f(12 + r * Math.cos(a))} ${f(12.5 + r * Math.sin(a))}`); } return P('M' + pts.join(' L') + ' Z'); })();
const star = (i) => `<button type="button" class="{{starCls.${i}}}" onClick="{{rate.${i}}}" aria-label="${i + 1} 颗星" style="--sd: {{starD.${i}}};display:flex;width:32px;height:32px;align-items:center;justify-content:center"><svg width="30" height="30" viewBox="0 0 24 24" style="overflow:visible" aria-hidden="true"><path class="sfill" d="${handFill(STAR, { amp: 0.25, seed: 1350 + i })}" fill="#FFD23F" transform="translate(.6 .8)"></path><path d="${handStroke(STAR, { amp: 0.3, seed: 1360 + i, wave: 6 })}" fill="none" stroke="var(--pen)" stroke-width="1.6" stroke-linejoin="round"></path></svg></button>`;

function demos() {
  const toggle = (i, label) => `<button type="button" class="{{tgCls.${i}}}" onClick="{{tg.${i}}}" role="switch" aria-checked="{{tgOn.${i}}}" style="display:flex;align-items:center;justify-content:space-between;width:100%;height:40px;font-size:15px"><span>${label}</span><span class="track" style="position:relative;width:54px;height:30px;display:block"><svg width="54" height="30" style="position:absolute;inset:0;overflow:visible" aria-hidden="true"><path class="tfill" pathLength="1" d="${handStroke(P('M13 15 L41 15'), { amp: 0.6, seed: 1370 + i, sp: 1 })}" stroke="var(--marker)" stroke-width="20" stroke-linecap="round" fill="none"></path></svg>${wob(54, 30, { r: 15, amp: 0.5, sw: 1.6, seed: 1375 + i, pad: 4 })}<span class="knob" style="position:absolute;left:3px;top:3px;width:24px;height:24px;display:block"><svg width="24" height="24" style="overflow:visible" aria-hidden="true"><path d="${handFill(circle(12, 12, 11), { amp: 0.3, seed: 1380 + i })}" fill="var(--a-white)" style="filter:drop-shadow(0 1px 1px var(--shadow))"></path><path d="${handStroke(circle(12, 12, 9.5), { amp: 0.4, seed: 1385 + i, over: 0.05 })}" fill="none" stroke="var(--pen)" stroke-width="1.6"></path></svg></span></span></button>`;
  const segs = ['全部', '纪念日', '生日', '证件'];
  const seg = `<div style="position:relative;display:flex;width:236px;height:36px;padding:3px">${wob(236, 36, { r: 11, amp: 0.55, sw: 1.5, seed: 1390, fill: 'var(--card)', pad: 4 })}<span class="{{segHl}}" style="position:absolute;left:3px;top:3px;width:57px;height:30px;transform: translateX({{segX}}px)"><svg width="57" height="30" style="position:absolute;inset:0;overflow:visible" aria-hidden="true"><path d="${handFill(rrect(1, 2, 55, 26, 9), { amp: 0.8, seed: 1391 })}" fill="var(--sel)"></path></svg></span>${segs.map((s, i) => `<button type="button" class="{{segCls.${i}}}" onClick="{{seg.${i}}}" style="position:relative;flex:1;height:30px;font-size:14px;display:flex;align-items:center;justify-content:center">${s}</button>`).join('')}</div>`;
  const months = ['9 月', '10 月', '11 月', '12 月'];
  const dd = `<div style="position:relative;width:180px"><button type="button" class="press" onClick="{{ddToggle}}" aria-label="选月份" style="position:relative;width:180px;height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;font-size:15px">${wob(180, 36, { r: 10, amp: 0.55, sw: 1.5, seed: 1395, fill: 'var(--card)', pad: 4 })}<span style="position:relative" class="num">2026 年 {{ddLabel}}</span><span class="{{ddArrow}}" style="position:relative;display:flex">${glyph('down', 16)}</span></button>
<sc-if value="{{ddOpen}}" hint-placeholder-val="{{false}}"><div class="ddlist" style="position:absolute;left:0;top:42px;width:180px;z-index:20;perspective:600px">${months.map((m, i) => `<button type="button" class="{{ddItem.${i}}}" onClick="{{ddPick.${i}}}" style="animation-delay:${(i * 0.05).toFixed(2)}s;position:relative;display:flex;align-items:center;justify-content:space-between;width:180px;height:36px;padding:0 14px;font-size:15px;background:var(--card);border-left:1.5px solid var(--pen);border-right:1.5px solid var(--pen);${i === 0 ? 'border-top:1.5px solid var(--pen);border-radius:10px 10px 0 0;' : ''}${i === 3 ? 'border-bottom:1.5px solid var(--pen);border-radius:0 0 10px 10px;' : 'border-bottom:1px dashed var(--line);'}"><span class="num">${m}</span><svg class="ddck" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="${handStroke(P('M5.5 12.5 L10 17 L18.5 7'), { amp: 0.3, seed: 1396 })}" fill="none" stroke="var(--pen)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>`).join('')}</div></sc-if></div>`;
  const checks = ['交作业', '给猫买粮', '跑步五公里'].map((t, i) => `<button type="button" class="{{ckCls.${i}}}" onClick="{{ck.${i}}}" style="display:flex;align-items:center;gap:10px;width:100%;height:32px;font-size:15px">${checkbox(1400 + i, 22)}<span class="tt" style="position:relative">${t}<svg class="sk" width="${tw(t, 15) + 8}" height="12" style="position:absolute;left:-4px;top:50%;margin-top:-6px;overflow:visible;pointer-events:none" aria-hidden="true"><path pathLength="1" d="${handStroke(P(`M4 6 C${tw(t, 15) * 0.3} 4 ${tw(t, 15) * 0.7} 8 ${tw(t, 15) + 4} 5`), { amp: 0.8, wave: 14, seed: 1405 + i, sp: 1.5 })}" stroke="var(--ink2)" stroke-width="2" stroke-linecap="round" fill="none"></path></svg></span></button>`).join('');
  const stars = `<div style="display:flex;gap:2px">${[0, 1, 2, 3, 4].map(star).join('')}</div><div class="i2" style="font-size:13px;line-height:20px;margin-top:6px">{{rateText}}</div>`;
  const input = `<div class="field" style="position:relative;width:236px;height:40px;display:flex;align-items:center;gap:8px;padding:0 12px">${wob(236, 40, { r: 11, amp: 0.6, sw: 1.6, seed: 1410, fill: 'var(--card)', pad: 4 })}<input aria-label="写点什么" placeholder="写点什么…" style="position:relative;flex:1;min-width:0;font-size:15px"><span class="pencil" style="position:relative;display:flex;color:var(--pen)">${glyph('pen', 18)}</span></div><div class="i2" style="font-size:12px;line-height:18px;margin-top:8px">点进去试试：边会描粗，笔会晃</div>`;
  const toast = `${btn('存一下', { seed: 1415, onClick: 'showToast', icon: glyph('check', 16) })}<div class="i2" style="font-size:12px;line-height:18px;margin-top:10px">便签贴在右下角</div>`;
  const items = ['旧的购物单', '过期的优惠券', '草稿 · 第 3 版'];
  const del = `${items.map((t, i) => `<div class="{{delCls.${i}}}" style="position:relative;display:flex;align-items:center;justify-content:space-between;width:236px;height:32px;padding:0 10px;margin-bottom:4px;font-size:14px"><div class="paperbg" style="position:absolute;inset:0;border-radius:6px;background:var(--desk2)"></div><span style="position:relative">${t}</span><button type="button" class="press" onClick="{{del.${i}}}" aria-label="丢掉「${t}」" style="position:relative;display:flex;color:var(--danger)">${glyph('trash', 17)}</button></div>`).join('')}<sc-if value="{{undoOn}}" hint-placeholder-val="{{false}}"><div class="i2" style="font-size:13px;line-height:20px;display:flex;gap:8px;margin-top:2px;animation:fadeUp .25s both">已丢掉<button type="button" onClick="{{undo}}" style="color:var(--link);text-decoration:underline;text-underline-offset:3px">撤销</button></div></sc-if>`;
  const order = ['todo', 'books', 'money', 'notes'];
  const sort = `<div style="position:relative;width:236px;height:116px">${order.map((id) => `<div class="srt" data-id="${id}" onPointerDown="{{sortDown.${id}}}" onPointerMove="{{dragMove}}" onPointerUp="{{dragEnd}}" onPointerCancel="{{dragEnd}}" style="position:absolute;left:0;top:{{sortTop.${id}}}px;width:236px;height:26px;display:flex;align-items:center;gap:8px;padding:0 10px;font-size:14px;touch-action:none"><div class="srtbg" style="position:absolute;inset:0;border-radius:8px;background:var(--card);box-shadow:0 1px 2px var(--shadow)"></div><span style="position:relative;display:flex;color:var(--ink2)">${glyph('more', 16)}</span><span style="position:relative;display:flex">${icon(MODS[id].icon, 20)}</span><span style="position:relative">${MODS[id].name}</span></div>`).join('')}</div>`;
  const pool = ['柚子', '海边', '周末', '读书', '晚风', '慢慢来'];
  const chips = `<div style="display:flex;flex-wrap:wrap;gap:6px 6px;width:236px">${pool.map((t, i) => `<span class="{{chipCls.${i}}}" style="position:relative;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 6px 0 12px;font-size:14px"><span class="chbg" style="position:absolute;inset:0;border-radius:14px;background:var(--c-${['orange', 'sky', 'mint', 'pink', 'grape', 'mint'][i]}-l)"></span><span style="position:relative">${t}</span><button type="button" onClick="{{chipX.${i}}}" aria-label="去掉「${t}」" style="position:relative;display:flex;width:18px;height:18px;align-items:center;justify-content:center;opacity:.6">${glyph('x', 13)}</button></span>`).join('')}<button type="button" class="press" onClick="{{chipAdd}}" style="height:28px;padding:0 10px;font-size:14px;color:var(--link);display:flex;align-items:center;gap:3px">${glyph('plus', 14)}加一个</button></div>`;
  const tips = `<div style="display:flex;gap:26px;padding-left:6px">${[['search', '找东西'], ['pin', '置顶'], ['trash', '丢掉']].map(([g, t], i) => `<span class="tipwrap" style="position:relative;display:inline-flex"><button type="button" class="press" aria-label="${t}" style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--pen)"><span style="position:absolute;inset:0">${wob(40, 40, { r: 20, amp: 0.6, sw: 1.5, seed: 1420 + i, fill: 'var(--card)', pad: 4 })}</span><span style="position:relative;display:flex">${glyph(g, 20)}</span></button><span class="tip" style="position:absolute;left:50%;top:44px;width:2px;height:16px;margin-left:-1px;background:var(--ink2)"><span style="position:absolute;left:50%;top:16px;transform:translateX(-50%);height:26px;padding:0 10px;display:flex;align-items:center;white-space:nowrap;font-size:13px;color:#20241F;background:#FFE38A;border-radius:4px;box-shadow:0 2px 4px var(--shadow)">${t}</span></span></span>`).join('')}</div>`;
  return [
    ['按钮', '按下去扁一下，松手弹回来', `<div style="display:flex;gap:10px">${btn('记一笔', { seed: 1430, icon: glyph('plus', 16) })}${btn('取消', { kind: 'plain', seed: 1431 })}</div>`],
    ['开关', '圆贴纸滑过去，荧光笔把轨道涂满', toggle(0, '开机自动启动') + toggle(1, '发给云端')],
    ['分段', '荧光笔从旧的一格拖到新的一格', seg],
    ['下拉', '一条纸展开，选中的那一格画个勾', dd],
    ['勾选', '果冻弹，划线自己画出来', checks],
    ['评分', '星星贴纸一颗接一颗弹出来', stars],
    ['输入框', '没有多余的方框，手画的边描粗', input],
    ['提示', '便签啪地贴上，过一会儿自己撕走', toast],
    ['删除', '揉成纸团丢出去，下面留一行「撤销」', del],
    ['拖动排序', '拿起来歪一下，别的让开', sort],
    ['标签', '加的时候拍上去，去掉时撕下来', chips],
    ['鼠标提示', '纸签挂在线上，晃两下停住', tips],
  ];
}

export function buildControls(hubPomelo) {
  const lights = ['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => `<i style="position:absolute;left:${14 + i * 20}px;top:19.5px;width:12px;height:12px;border-radius:50%;background:${c};display:block"></i>`).join('');
  const x = 36, y = 66, w = 1208, h = 716;
  const bg = `background-color:var(--paper);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:22px 22px`;
  return `${tex('tx', 'calc(var(--tex-o) * .8)')}<div style="position:absolute;left:0;top:0;width:1280px;height:58px;z-index:30">${lights}<div class="{{face}}" style="position:absolute;left:84px;top:4px">${hubPomelo}</div><button type="button" class="press" onClick="{{toggleCfg}}" aria-label="设置（配色）" style="position:absolute;right:16px;top:16px;display:flex">${glyph('gear', 21)}</button></div>
<div class="sheet" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:10">${tiltLayer(-0.2, `<div style="position:absolute;inset:0;border-radius:6px 12px 12px 6px;${bg};box-shadow:0 2px 4px var(--shadow),0 18px 40px var(--shadow)">${tex('tx')}</div>${wob(w, h, { r: 10, amp: 1.1, sw: 1.9, seed: 1440 })}${stitches(h, { seed: 1441 })}`)}
<div style="position:absolute;left:52px;top:24px"><div style="font-size:28px;font-weight:700;line-height:36px">控件的小动静</div><div class="i2" style="font-size:14px;line-height:22px">其余地方也不要安静：每样东西碰一下都有回应。点一点、拖一拖、勾一勾。</div></div>
${demos().map(([t, d, demo], i) => cell(i, t, d, demo)).join('')}
</div>
<sc-if value="{{toastOn}}" hint-placeholder-val="{{false}}"><div class="{{toastCls}}" style="position:absolute;right:46px;bottom:40px;width:200px;height:80px;z-index:45">${tiltLayer(-3, `<div style="position:absolute;inset:0;background:#FFE38A;box-shadow:0 2px 3px var(--shadow),3px 12px 18px var(--shadow)"></div>${tape({ x: 62, y: -10, w: 76, rot: 4 })}`)}<div style="position:relative;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#20241F">存好啦</div></div></sc-if>
<sc-if value="{{cfgOn}}" hint-placeholder-val="{{false}}">${palettePanel(20, 54, 1450)}</sc-if>`;
}

export const CONTROLS_CSS = `
.cell{z-index:1}.cell:focus-within,.cell:hover{z-index:5}
.btn:active{transform:scale(.9,.84) !important}
.tg .tfill{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .3s ease-out}
.tg.on .tfill{stroke-dashoffset:0;transition-delay:.08s}
.tg .knob{transition:transform .45s cubic-bezier(.3,1.7,.5,1)}
.tg.on .knob{transform:translateX(24px)}
.tg.go .knob svg{animation:knobSquash .45s ease-out}
@keyframes knobSquash{0%{transform:scale(1)}30%{transform:scale(1.3,.8)}60%{transform:scale(.92,1.08)}100%{transform:scale(1)}}
.seghl{transition:transform .42s cubic-bezier(.3,1.45,.5,1)}
.seghl.s0{animation:smear0 .42s ease-out}.seghl.s1{animation:smear1 .42s ease-out}
@keyframes smear0{40%{scale:1.35 .9}100%{scale:1 1}}@keyframes smear1{40%{scale:1.35 .9}100%{scale:1 1}}
.segb.on{font-weight:700}
.ddar{transition:transform .3s cubic-bezier(.3,1.6,.5,1)}.ddar.open{transform:rotate(180deg)}
.ddit{transform-origin:50% 0;animation:unfold .3s cubic-bezier(.3,1.3,.5,1) both}
@keyframes unfold{0%{transform:rotateX(-90deg);opacity:0}100%{transform:none;opacity:1}}
.ddit:hover{background:color-mix(in srgb,var(--sel) 60%,var(--card)) !important}
.ddck path{stroke-dasharray:1;stroke-dashoffset:1}
.ddit.on .ddck path{stroke-dashoffset:0;transition:stroke-dashoffset .3s .15s}
.star svg{transition:transform .3s cubic-bezier(.3,1.6,.5,1)}
.star:hover svg{transform:scale(1.18) rotate(-8deg)}
.star .sfill{opacity:.12}
.star.on .sfill{opacity:1}
.star.on.p0 svg{animation:starPop0 .45s cubic-bezier(.3,1.6,.5,1) both;animation-delay:var(--sd)}
.star.on.p1 svg{animation:starPop1 .45s cubic-bezier(.3,1.6,.5,1) both;animation-delay:var(--sd)}
@keyframes starPop0{0%{transform:scale(.3) rotate(-30deg)}60%{transform:scale(1.25) rotate(8deg)}100%{transform:none}}
@keyframes starPop1{0%{transform:scale(.3) rotate(-30deg)}60%{transform:scale(1.25) rotate(8deg)}100%{transform:none}}
.field:focus-within .pencil{animation:pencil .6s ease-in-out infinite}
@keyframes pencil{0%,100%{transform:rotate(0)}30%{transform:rotate(-14deg) translateY(-1px)}70%{transform:rotate(8deg)}}
.toastnote{animation:eggLife 3s cubic-bezier(.3,1.4,.5,1) both}
.toastnote.k1{animation-name:eggLife2}
@keyframes eggLife{0%{opacity:0;transform:translate(30px,-40px) rotate(16deg) scale(1.3)}12%{opacity:1;transform:rotate(-2deg) scale(.96)}18%{transform:none}82%{opacity:1;transform:none}100%{opacity:0;transform:translate(60px,-80px) rotate(24deg)}}
@keyframes eggLife2{0%{opacity:0;transform:translate(30px,-40px) rotate(16deg) scale(1.3)}12%{opacity:1;transform:rotate(-2deg) scale(.96)}18%{transform:none}82%{opacity:1;transform:none}100%{opacity:0;transform:translate(60px,-80px) rotate(24deg)}}
.delit.gone{display:none !important}
.delit.crumple{animation:crumple .6s cubic-bezier(.5,0,.7,.4) both;pointer-events:none}
.delit.crumple .paperbg{animation:ball .6s both}
.delit.back{animation:unball .45s cubic-bezier(.3,1.5,.5,1) both}
@keyframes crumple{0%{transform:none}30%{transform:scale(.7,.55) rotate(-12deg)}55%{transform:translate(20px,-14px) scale(.22) rotate(180deg)}100%{transform:translate(170px,30px) scale(.16) rotate(420deg);opacity:0}}
@keyframes ball{30%{border-radius:30%;filter:brightness(.92)}55%,100%{border-radius:50%;filter:brightness(.85)}}
@keyframes unball{0%{transform:translate(120px,20px) scale(.2) rotate(300deg);opacity:0}100%{transform:none;opacity:1}}
.srt{cursor:grab;transition:top .32s cubic-bezier(.3,1.4,.5,1)}
.srt.held{cursor:grabbing;transition:none;z-index:5}
.srt.held .srtbg{box-shadow:0 6px 14px var(--shadow)}
.chip2.off{display:none !important}
.chip2.add{animation:chipSlap .45s cubic-bezier(.3,1.6,.5,1) both}
.chip2.leave{animation:chipPeel .38s ease-in both;pointer-events:none}
@keyframes chipSlap{0%{transform:translate(10px,-24px) rotate(14deg) scale(1.4);opacity:0}60%{transform:rotate(-4deg) scale(.94);opacity:1}100%{transform:none}}
@keyframes chipPeel{0%{transform:none}35%{transform:translateY(-6px) rotate(-10deg) scale(1.06)}100%{transform:translate(30px,-40px) rotate(30deg);opacity:0}}
.tip{opacity:0;transform-origin:50% 0;pointer-events:none}
.tipwrap:hover .tip{opacity:1;animation:swing 1.1s ease-out both}
@keyframes swing{0%{transform:translateY(-8px) rotate(0);opacity:0}15%{opacity:1;transform:rotate(16deg)}35%{transform:rotate(-11deg)}55%{transform:rotate(6deg)}75%{transform:rotate(-3deg)}100%{transform:none;opacity:1}}
`;
