// EX11（页 id ex12）从 EX10 原样复制，没改。EX6 A 的零件：知识库每种记录一种卡片（站主 11-23）、文献库表格和动效的样式。dir-a.mjs 用。
export const CSS_ADD = `
/* 字会长：越常青，字越重（Newsreader、思源宋体都是可变字重） */
.dA .w0{font-weight:300!important}.dA .w1{font-weight:430!important}.dA .w2{font-weight:640!important}
.dA .grow-in{animation:a-grow 2.4s .6s var(--out) both}
@keyframes a-grow{from{font-weight:250}to{font-weight:430}}
/* 换屏：整页轻轻浮上来 */
.a-page{animation:a-page .42s var(--out) both}
@keyframes a-page{from{opacity:0;transform:translateY(8px)}}
/* 导航下面那颗点会滑 */
.a-nav{position:relative}
.a-ind{position:absolute;bottom:-5px;width:5px;height:5px;border-radius:50%;background:var(--sea);transition:left .45s var(--spring)}
.a-ind.at-chat{left:13px}.a-ind.at-kb{left:69px}.a-ind.at-lib{left:142px}.a-ind.at-set{left:203px}
.a-nav button.is-on::after{display:none}
.a-badge{position:absolute;top:-10px;left:96px;padding:1px 6px;border-radius:3rem;background:var(--sea);color:#fff;font:700 10.5px/1.4 var(--sans);opacity:0;transform:translateY(4px) scale(.6);pointer-events:none}
.a-badge.is-saved{animation:a-badge 2.6s 1.1s var(--spring) both}
@keyframes a-badge{0%{opacity:0;transform:translateY(4px) scale(.6)}20%{opacity:1;transform:none}80%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-4px)}}
/* 存卡：一颗种子从卡上飞到「知识库」 */
.a-fly{position:absolute;left:0;top:0;z-index:30;width:12px;height:12px;border-radius:50%;background:var(--sea);opacity:0;pointer-events:none}
.a-fly.is-saved{animation:a-fly 1.2s cubic-bezier(.5,0,.3,1) both}
@keyframes a-fly{0%{opacity:0;transform:translate(880px,660px) scale(.4)}12%{opacity:1;transform:translate(880px,640px) scale(1)}60%{transform:translate(960px,260px) scale(1)}100%{opacity:0;transform:translate(892px,30px) scale(.5)}}
/* 段落一行行展开 */
.a-p.rv.is-in,.a-ask.rv.is-in{animation:a-unfurl 1s var(--out) backwards}
@keyframes a-unfurl{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 -20% 0)}}
/* 点了编号：编号前的字下面扫过一道海蓝 */
.dA .nw{background:linear-gradient(color-mix(in srgb,var(--sea) 35%,transparent),color-mix(in srgb,var(--sea) 35%,transparent)) 0 92%/0 3px no-repeat;transition:background-size .5s var(--out)}
.dA .nw:has(.a-ref.is-on){background-size:100% 3px}
/* 状态行前面那颗种子跟着长 */
.a-seedl{display:inline-flex;position:relative;width:18px;height:18px;margin-right:4px}
.a-seedl .stg{position:absolute;inset:0;width:18px;height:18px;opacity:0;transform:scale(.6);transition:opacity .4s,transform .5s var(--spring)}
.a-seedl .g0{opacity:1;transform:none}
.step-3 .a-seedl .g0,.step-4 .a-seedl .g0{opacity:0}.step-3 .a-seedl .g1,.step-4 .a-seedl .g1{opacity:1;transform:none}
${[5, 6, 7, 8, 9, 10].map((k) => `.step-${k} .a-seedl .g0`).join(',')}{opacity:0}
${[5, 6, 7, 8, 9, 10].map((k) => `.step-${k} .a-seedl .g2`).join(',')}{opacity:1;transform:none}
.a-status{align-items:center}
/* 知识库：可以滚的卡片墙，十种卡片 */
.a-gard{display:flex;flex-direction:column}
.a-gard .a-h1{font-size:46px}
.a-gard .a-sub{font-size:19px}
.a-legend{display:flex;align-items:center;gap:14px;margin-top:14px;font-size:12.5px;color:var(--faint)}
.a-legend b{font:400 15px/1 var(--serif);color:var(--ink)}
.a-wallbox{flex:1;min-height:0;margin-top:14px;overflow-y:auto;scrollbar-width:thin;padding:6px 6px 40px 0}
.a-wall{margin-top:0;columns:4;column-gap:18px}
.a-g{position:relative;margin-bottom:16px;border-radius:.45rem;transition:transform .3s var(--out),box-shadow .3s}
.a-g:hover{transform:translateY(-3px);box-shadow:var(--sh-lg)}
.a-g .lbl{display:flex;align-items:center;gap:6px;font:700 10.5px/1 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--crim)}
.a-g .lbl .stg{width:15px;height:15px}
.a-g .tt{display:block;margin-top:8px;font:430 18px/1.3 var(--serif);color:var(--ink);transition:font-weight .6s}
.a-g .tx{display:block;margin-top:6px;font-size:13px;line-height:1.55;color:var(--muted)}
.a-g .mt{display:block;margin-top:8px;font-size:12px;color:var(--faint)}
.a-g.is-on{box-shadow:0 0 0 2px var(--sea),var(--sh-lg)}
.a-g .bx{display:block;padding:14px 16px 15px;border:1px solid var(--line);border-radius:.45rem;background:var(--card)}
.t-full .cv{display:flex;flex-direction:column;justify-content:space-between;height:156px;padding:16px;border-radius:.45rem .45rem 0 0;color:#fff;box-shadow:inset 5px 0 0 #00000022}
.t-full .cv b{font:500 19px/1.2 var(--serif)}.t-full .cv span{font:700 10px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;opacity:.85}
.t-full .bx{border-top:0;border-radius:0 0 .45rem .45rem}
.t-full .chip{display:inline-block;margin-top:8px;padding:2px 8px;border-radius:3rem;background:var(--tint);font-size:11.5px;color:var(--ink2)}
.t-excerpt .bx{padding-top:8px}
.t-excerpt q{display:block;font:italic 400 16px/1.6 var(--serif);color:var(--ink2);quotes:none}
.t-excerpt q::before{content:"“";display:block;height:30px;font:600 50px/1 var(--serif);color:var(--sea)}
.t-note .bx{background:var(--card) repeating-linear-gradient(transparent 0 25px,color-mix(in srgb,var(--sea) 14%,transparent) 25px 26px);background-position:0 52px;border-top:3px solid var(--crim)}
.t-web .bar{display:flex;align-items:center;gap:5px;padding:8px 10px;border:1px solid var(--line);border-bottom:0;border-radius:.45rem .45rem 0 0;background:var(--tint)}
.t-web .bar i{width:7px;height:7px;border-radius:50%;background:var(--line2)}
.t-web .bar span{margin-left:6px;padding:1px 8px;border-radius:3rem;background:var(--card);font-size:11px;color:var(--faint)}
.t-web .bx{border-radius:0 0 .45rem .45rem}
.t-file .bx{display:grid;grid-template-columns:46px 1fr;column-gap:12px}
.t-file .doc{position:relative;width:46px;height:58px;border-radius:3px;background:var(--white);box-shadow:inset 0 0 0 1px var(--line2);clip-path:polygon(0 0,70% 0,100% 22%,100% 100%,0 100%)}
.t-file .doc span{position:absolute;left:4px;bottom:6px;padding:1px 4px;border-radius:2px;background:#3e4f7a;color:#fff;font:700 9px/1.3 var(--sans)}
.t-file .path{display:block;margin-top:4px;font:400 11.5px/1.4 ui-monospace,Menlo,monospace;color:var(--faint)}
.t-scan .img{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;height:150px;padding:14px;border-radius:.45rem .45rem 0 0;background:#efe6d3;color:#5b4a2e;transform-origin:center;box-shadow:inset 0 0 30px #8a6a3b33}
.t-scan .img b{font:500 11px/1.4 var(--serif);letter-spacing:.14em;text-align:center}
.t-scan .img i{width:60%;height:1px;background:#5b4a2e55}
.dA[data-theme="dark"] .t-scan .img{background:#4a4234;color:#efe6d3}
.t-scan .bx{border-top:0;border-radius:0 0 .45rem .45rem}
.t-scan .chip{display:inline-block;margin-top:8px;padding:2px 8px;border-radius:3rem;background:color-mix(in srgb,var(--sea) 18%,transparent);font-size:11.5px;color:var(--sea-t)}
.t-concept .bx{border-left:3px solid var(--sea);padding-left:16px}
.t-concept .tt{font-size:25px;line-height:1.2;margin-top:10px}
.t-concept .ft{display:flex;justify-content:space-between;margin-top:12px;padding-top:8px;border-top:1px dashed var(--line2);font-size:12px;color:var(--faint)}
.t-report .vd{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:3px 10px;border-radius:3rem;background:var(--sea);color:#fff;font:700 12px/1.3 var(--sans)}
.t-report .ev{display:flex;gap:4px;margin-top:10px}
.t-report .ev i{flex:1;height:4px;border-radius:2px;background:var(--sea)}
.t-report .ev i:last-child{background:var(--line2)}
.t-wonder .art{display:block;height:150px;border-radius:.45rem .45rem 0 0;background:#3d2f63;overflow:hidden;position:relative}
.t-wonder .art svg{position:absolute;inset:0;width:100%;height:100%}
.t-wonder .art svg rect{fill:#ffd09c}
.t-wonder .art .play{position:absolute;right:10px;bottom:10px;padding:3px 9px;border-radius:3rem;background:#ffffff26;color:#fff;font:700 11px/1.3 var(--sans)}
.t-wonder:hover .art svg rect{animation:a-pins 1.4s ease-in-out infinite alternate}
@keyframes a-pins{to{transform:translateY(-6px)}}
.t-wonder .bx{border-top:0;border-radius:0 0 .45rem .45rem}
.t-answer .q{display:block;font:700 12px/1.4 var(--sans);color:var(--ink2)}
.t-answer .q::before{content:"问 ";color:var(--crim)}
.t-answer .an{display:block;margin-top:8px;padding-left:10px;border-left:2px solid var(--line2);font:400 15px/1.6 var(--serif);color:var(--ink)}
.t-answer .who{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:12px;color:var(--faint)}
.t-answer .who i{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--gold) 70%,var(--bg));font:600 10px/1 var(--serif);font-style:normal;color:var(--ink)}
.a-g.fresh{animation:a-sprout .9s var(--spring) both}
@keyframes a-sprout{from{opacity:0;transform:translateY(16px) scale(.94)}}
/* 文献库：表格 */
.a-lib{display:flex;flex-direction:column}
.a-lib .a-h1{font-size:46px}
.a-lib .a-sub{font-size:19px}
.a-tools{display:flex;align-items:center;gap:6px;margin-top:18px;font-size:14px}
.a-tools .pill{padding:6px 12px;border-radius:3rem;color:var(--ink2)}
.a-tools .pill.on{background:var(--sea);color:#fff}
.a-tools .find{margin-left:auto;display:flex;align-items:center;gap:8px;height:34px;width:260px;padding:0 12px;border:1px solid var(--line2);border-radius:.4rem;color:var(--faint);font-size:13px}
.a-tools .imp{margin-left:14px;font:700 13.5px/1 var(--sans);color:var(--sea-t)}
.a-table{flex:1;min-height:0;margin-top:16px;overflow-y:auto;scrollbar-width:thin;border-top:1px solid var(--line2)}
.a-th,.a-tr{display:grid;grid-template-columns:minmax(0,1fr) 210px 64px 92px 104px 150px;column-gap:18px;align-items:center}
.a-th{position:sticky;top:0;z-index:2;height:38px;padding:0 14px;background:var(--bg);border-bottom:1px solid var(--line);font:700 11px/1 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.a-th .on{color:var(--ink)}
.a-tr{width:100%;min-height:46px;padding:7px 14px;border-bottom:1px solid var(--line);text-align:left;transition:background .2s}
.a-tr:hover{background:color-mix(in srgb,var(--card) 70%,transparent)}
.a-tr:hover .ti b{color:var(--sea-t)}
.a-tr .ti{display:flex;align-items:center;gap:12px;min-width:0}
.a-tr .sp{flex:none;width:14px;height:22px;border-radius:1px 3px 3px 1px;box-shadow:inset 2px 0 0 #00000022}
.a-tr .ti b{font:400 16px/1.3 var(--serif);color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .2s}
.a-tr .c{font-size:13px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.a-tr .c.f{color:var(--faint)}
.a-tr .kbs{display:flex;gap:4px;flex-wrap:nowrap;overflow:hidden}
.a-tr .kbs span{padding:1px 7px;border-radius:3rem;background:var(--tint);font-size:11.5px;color:var(--crim);white-space:nowrap}
.a-tr.is-on{background:var(--card);box-shadow:inset 3px 0 0 var(--sea)}
.a-tr .new{flex:none;padding:1px 6px;border-radius:3rem;background:var(--sea);color:#fff;font:700 10px/1.4 var(--sans)}
.a-tr.fresh{animation:a-flash 2s var(--out) both}
@keyframes a-flash{0%{background:color-mix(in srgb,var(--sea) 25%,transparent)}100%{background:transparent}}
.a-xr{display:none;grid-template-columns:1fr 1fr auto;column-gap:30px;padding:4px 14px 16px 40px;border-bottom:1px solid var(--line);background:var(--card);box-shadow:inset 3px 0 0 var(--sea);font-size:13.5px;color:var(--ink2);line-height:1.7}
.a-xr.is-on{display:grid;animation:a-page .35s var(--out) both}
.a-xr b{display:block;font:500 15px/1.35 var(--serif);color:var(--ink)}
.a-xr .k{color:var(--faint)}
.a-xr .acts{display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.a-xr .acts span{font:700 13px/1 var(--sans);color:var(--sea-t)}
`;

const COVERS = ['#7a2f4f', '#2f6f73', '#8a6a3b', '#3e4f7a', '#5b6b3a', '#6b4f7a', '#00758f', '#5a4636', '#2f5d50', '#7a4b2f', '#3f3f63', '#6a3a3a', '#44576b'];
export { COVERS };

/** 一张知识库卡片：按 type 换样子；标题的字重跟着生长阶段（字会长）。 */
export function card(m, i, j, k, { esc, stageIcon, typeIcon }) {
  const on = `{{mc${i}_${j}}}`;
  const st = ` style="--i:${k}"`;
  const lbl = `<span class="lbl">${typeIcon ? typeIcon(m.type) : stageIcon(m.stage)}${esc(m.kind)}</span>`;
  const tt = `<span class="tt w${m.stage}${m.dyn ? ' grow-in' : ''}">${esc(m.title)}</span>`;
  const mt = `<span class="mt">${esc(m.sub)} · ${m.date}</span>`;
  let inner;
  switch (m.type) {
    case 'full': inner = `<span class="cv" style="background:${COVERS[(i * 4 + j) % COVERS.length]}"><b>${esc(m.title)}</b><span>${esc(m.sub.split(' · ')[0])}</span></span><span class="bx">${lbl}<span class="tx">${esc(m.sub)}</span><span class="chip">带段落号 · 能引用</span>${''}</span>`; break;
    case 'excerpt': inner = `<span class="bx"><q>${esc(m.text)}</q>${lbl}${mt}</span>`; break;
    case 'note': inner = `<span class="bx">${lbl}${tt}<span class="tx">${esc(m.text)}</span>${mt}</span>`; break;
    case 'web': inner = `<span class="bar"><i></i><i></i><i></i><span>${esc(m.sub.split(' · ')[0])}</span></span><span class="bx">${lbl}${tt}<span class="tx">${esc(m.text)}</span><span class="mt">网页快照 · ${m.date}</span></span>`; break;
    case 'file': { const ext = (m.title.split('.').pop() || 'FILE').toUpperCase(); inner = `<span class="bx"><span class="doc"><span>${esc(ext)}</span></span><span>${lbl}${tt}<span class="path">${esc(m.sub)}</span><span class="mt">${esc(m.text)}</span></span></span>`; break; }
    case 'scan': inner = `<span class="img"><i></i><b>${esc(m.text)}</b><i></i></span><span class="bx">${lbl}${tt}<span class="chip">已识别文字 · 能检索</span>${mt}</span>`; break;
    case 'concept': inner = `<span class="bx">${lbl}${tt}<span class="tx">${esc(m.text)}</span><span class="ft"><span>${esc(m.sub.split(' · ').pop())}</span><span>${m.date}</span></span></span>`; break;
    case 'report': inner = `<span class="bx">${lbl}${tt}<span class="vd">✓ ${esc(m.verdict || '有出处')}</span><span class="tx">${esc(m.text)}</span><span class="ev"><i></i><i></i><i></i><i></i></span>${mt}</span>`; break;
    case 'wonder': inner = `<span class="art"><svg viewBox="0 0 240 150" aria-hidden="true">${Array.from({ length: 10 }, (_, c) => `<rect x="${18 + c * 21}" y="${118 - (c + 1) * 9}" width="7" height="${(c + 1) * 9}" rx="2" style="animation-delay:${c * 60}ms"/>`).join('')}</svg><span class="play">能拖动 ▸</span></span><span class="bx">${lbl}${tt}<span class="tx">${esc(m.text)}</span></span>`; break;
    case 'answer': inner = `<span class="bx">${lbl}<span class="q" style="margin-top:8px">${esc(m.title)}</span><span class="an">${esc(m.text)}</span><span class="who"><i>伴</i>${esc(m.sub)} · ${m.date}</span></span>`; break;
    default: inner = `<span class="bx">${lbl}${tt}${mt}</span>`;
  }
  const html = `<button type="button" class="a-g hv-card t-${m.type}${m.dyn ? ' fresh' : ''} ${on}" onClick="{{ms${i}_${j}}}"${st}>${inner}</button>`;
  if (m.dyn === 'saved') return `<sc-if value="{{saved}}" hint-placeholder-val="{{ false }}">${html}</sc-if>`;
  if (m.dyn === 'rev') return `<sc-if value="{{revDone}}" hint-placeholder-val="{{ false }}">${html}</sc-if>`;
  return html;
}

/** 《国富论》那个库在墙上的顺序：先刚长出来的，再让十种记录尽早都露面。 */
export const ORDER = { 1: [11, 12, 0, 2, 4, 9, 5, 7, 8, 6, 10, 3, 1] };
