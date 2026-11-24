// 两套小样共用的样式和动效。动效数值都还是探索用的，Phase 3 才定档位。
import { paletteCSS } from './parts.mjs';

const SPRING = 'cubic-bezier(.3,1.6,.5,1)';
export const BASE_CSS = `@font-face{font-family:"Pomelo Hand";src:local("HannotateSC-W5");font-weight:400}
@font-face{font-family:"Pomelo Hand";src:local("HannotateSC-W7");font-weight:700}
body{margin:0}
${paletteCSS()}
.bd{position:relative;overflow:hidden;font-family:"Pomelo Hand","Hannotate SC","PingFang SC",sans-serif;color:var(--ink);background:var(--desk);line-height:1.45;-webkit-font-smoothing:antialiased;user-select:none;-webkit-user-select:none;transition:background-color .3s,color .3s}
.bd *{box-sizing:border-box}
/* 重置写成零优先级，组件自己的 class 一定压得过它（不然内边距会被清掉，字贴边） */
:where(.bd button){font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:inherit}
:where(.bd input){font:inherit;color:var(--ink);background:transparent;border:0;outline:none;padding:0;margin:0}
.bd input::placeholder{color:var(--ink2);opacity:1}
.bd button:focus-visible{outline:2px solid var(--pri);outline-offset:2px;border-radius:6px}
.bd input,.bd input:focus,.bd input:focus-visible{outline:none;box-shadow:none;caret-color:var(--pen)}
/* 文本框没有额外的方框：聚焦时手画的边描粗一点 */
.field .wob path[stroke]{transition:stroke-width .18s}
.field:focus-within .wob path[stroke]{stroke-width:2.8px}
.pf{font-family:"PingFang SC",-apple-system,sans-serif}
.i2{color:var(--ink2)}
.num{font-variant-numeric:tabular-nums}
.press{transition:transform .38s ${SPRING}}
.press:hover{transform:translateY(-1px)}
.press:active{transform:scale(.9);transition-duration:.08s}
.wob{color:var(--pen)}
.gone{display:none !important}

/* ---------- 柚子：脸、身子的动作 ---------- */
.pm{display:block;overflow:visible}
.pm .fx{display:none}
.f-normal .fx-normal,.f-think .fx-think,.f-wink .fx-wink,.f-sleepy .fx-sleepy,.f-happy .fx-happy,.f-error .fx-error,.f-surprised .fx-surprised,.f-wow .fx-wow{display:inline}
.pm .pt{transform-box:fill-box;transform-origin:50% 50%}
.pmw{transform-origin:50% 90%;will-change:transform}
.pmw.f-normal{animation:breathe 2.6s ease-in-out infinite}
.pmw.f-normal .eyes{animation:idleEyes 4.8s ease-in-out infinite}
.pmw.f-wink{animation:tilt .7s ${SPRING} both}
.pmw.f-happy{animation:hop2 1.3s ease-out both}
.pmw.f-happy .st1,.pmw.f-happy .st2,.pmw.f-wow .st1,.pmw.f-wow .st2{animation:twinkle 1.2s ease-in-out infinite}
.pmw.f-error{animation:shake .9s ease-in-out both}
.pmw.f-error .bang{animation:bangPop .5s ${SPRING} both}
.pmw.f-wow{animation:jump .6s ${SPRING} both}
.pmw.f-surprised{animation:jump .5s ease-out both}
.pmw.f-sleepy{animation:breathe 4.6s ease-in-out infinite}
.pmw.f-sleepy .zz{animation:float 2.6s ease-in-out infinite}
.pmw.f-think{animation:cThink 1.6s ease-in-out infinite}
.pmw.f-think .eyes{animation:look 1.6s ease-in-out infinite}
.pmw.f-think .th1{animation:thinkDot 1.4s ease-in-out infinite}
.pmw.f-think .th2{animation:thinkDot 1.4s ease-in-out .2s infinite}
.pmw.f-think .th3{animation:thinkDot 1.4s ease-in-out .4s infinite}
@keyframes breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.035,.97)}}
@keyframes idleEyes{0%,28%{transform:translateX(0) scaleY(1)}34%,46%{transform:translateX(3px) scaleY(1)}40%{transform:translateX(3px) scaleY(.12)}52%,64%{transform:translateX(-2px) scaleY(1)}70%,84%{transform:translateX(0) scaleY(1)}88%{transform:translateX(0) scaleY(.12)}92%,100%{transform:translateX(0) scaleY(1)}}
@keyframes hop2{0%{transform:translateY(0) scale(1)}12%{transform:translateY(-16%) scale(.96,1.05)}24%{transform:translateY(0) scale(1.1,.9)}32%{transform:scale(1)}46%{transform:translateY(-9%)}60%{transform:translateY(0) scale(1.06,.94)}70%,100%{transform:translateY(0) scale(1)}}
@keyframes twinkle{0%,100%{transform:scale(1) rotate(0)}25%{transform:scale(1.35) rotate(20deg)}50%{transform:scale(.8) rotate(0)}75%{transform:scale(1.2) rotate(-15deg)}}
@keyframes shake{0%{transform:rotate(0)}14%{transform:rotate(-9deg)}30%{transform:rotate(8deg)}46%{transform:rotate(-7deg)}62%{transform:rotate(5deg)}78%,100%{transform:rotate(0)}}
@keyframes bangPop{0%{transform:scale(0)}60%{transform:scale(1.35)}100%{transform:scale(1)}}
@keyframes jump{0%{transform:translateY(0)}40%{transform:translateY(-14%) scale(1.06)}70%{transform:translateY(0) scale(1.05,.95)}100%{transform:none}}
@keyframes tilt{0%{transform:rotate(0)}45%{transform:rotate(-12deg) scale(1.06)}100%{transform:rotate(0)}}
@keyframes float{0%{transform:translateY(4px);opacity:0}35%{opacity:1}100%{transform:translateY(-8px);opacity:0}}
@keyframes cThink{0%,46%{transform:scale(1)}52%{transform:scale(1.1,.88)}58%{transform:scale(.93,1.08)}64%{transform:scale(1.03,.97)}70%,100%{transform:scale(1)}}
@keyframes look{0%,20%{transform:translateX(0)}30%,50%{transform:translateX(3px)}60%,80%{transform:translateX(-2.5px)}90%,100%{transform:translateX(0)}}
@keyframes thinkDot{0%,100%{transform:translateY(0) scale(1)}40%{transform:translateY(-3px) scale(1.15)}}

/* ---------- 勾选框：果冻弹；划线自己画出来 ---------- */
.ckb .tick{stroke-dasharray:1;stroke-dashoffset:1}
.ckb .fillg{transform:scale(0);transform-box:fill-box;transform-origin:50% 50%}
.ckb .box{transform-box:fill-box;transform-origin:50% 90%}
.todo.on .ckb .tick{stroke-dashoffset:0}
.todo.on .ckb .fillg{transform:scale(1)}
.todo.pop .ckb .box{animation:jBox .65s both}
.todo.pop .ckb .fillg{animation:jPop .5s both}
.todo.pop .ckb .tick{transition:stroke-dashoffset .25s .15s}
.todo .sk path{stroke-dasharray:1;stroke-dashoffset:1}
.todo.on .sk path{stroke-dashoffset:0}
.todo.pop .sk path{transition:stroke-dashoffset .35s .2s ease-out}
.todo .tt{transition:color .3s}
.todo.on .tt{color:var(--ink2)}
@keyframes jBox{0%{transform:scale(1)}18%{transform:scale(1.32,.72)}36%{transform:scale(.84,1.18)}54%{transform:scale(1.08,.94)}72%{transform:scale(.98,1.02)}100%{transform:scale(1)}}
@keyframes jPop{0%{transform:scale(0)}45%{transform:scale(1.25)}70%{transform:scale(.9)}100%{transform:scale(1)}}

/* ---------- 画完再弹：线先画出来，再弹一下 ---------- */
.draw .ol{stroke-dasharray:1 1;animation:dOl .7s ease-out both}
.draw .fl,.draw .dt,.draw .bl,.draw .wb{animation:dFl .5s .45s both}
.draw.pop{animation:popAfter .5s .7s ${SPRING} both}
@keyframes dOl{0%{stroke-dashoffset:1}100%{stroke-dashoffset:0}}
@keyframes dFl{0%{opacity:0}100%{opacity:1}}
@keyframes popAfter{0%{transform:scale(1)}40%{transform:scale(1.12,.9)}70%{transform:scale(.95,1.05)}100%{transform:scale(1)}}
@keyframes fadeUp{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:none}}
@keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
@keyframes dLoop{0%{stroke-dashoffset:1}45%,55%{stroke-dashoffset:0}100%{stroke-dashoffset:-1}}
.squig path{stroke-dasharray:1 1;animation:dLoop 1.6s ease-in-out infinite}

/* ---------- 空书架：线画完，每样东西依次弹一下，鱼跳起来 ---------- */
.shelf .pt{transform-box:fill-box;transform-origin:50% 100%}
.shelf .pt.plank{animation:shelfPop .45s .55s ${SPRING} both}
.shelf .pt.book1{animation:shelfPop .5s .72s ${SPRING} both}
.shelf .pt.book2{transform-origin:0% 100%;animation:bookTip .7s .84s ease-in-out both}
.shelf .pt.fish{animation:fishHop .85s .96s ease-out both}
.shelf .pt.plant{animation:shelfPop .5s 1.12s ${SPRING} both}
@keyframes shelfPop{0%{transform:scale(1)}35%{transform:scale(1.14,.84)}65%{transform:scale(.94,1.08)}100%{transform:scale(1)}}
@keyframes bookTip{0%,100%{transform:rotate(0)}30%{transform:rotate(-7deg)}60%{transform:rotate(3deg)}80%{transform:rotate(-1deg)}}
@keyframes fishHop{0%{transform:translateY(0) rotate(0)}30%{transform:translateY(-22px) rotate(-14deg)}55%{transform:translateY(0) rotate(5deg) scale(1.12,.88)}75%{transform:scale(.96,1.05)}100%{transform:none}}

/* ---------- 问候：字一笔一笔写出来，荧光笔再划一道 ---------- */
.greet .gw{display:inline-block;clip-path:inset(0 100% 0 0);animation:write 1s .15s steps(14,end) both}
.greet .mk path{stroke-dasharray:1;stroke-dashoffset:1;animation:dOl .5s 1.05s ease-out both}
.greet .gs{animation:fadeUp .5s 1.2s both}
@keyframes write{to{clip-path:inset(0 -2% 0 0)}}

/* ---------- 打字：柚子的回答一个字一个字出来 ---------- */
.ch{white-space:pre-wrap}
.ch.live{opacity:0;animation:chIn .01s linear forwards}
.ch.b{font-weight:600;background:linear-gradient(transparent 58%,var(--marker) 58%,var(--marker) 92%,transparent 92%)}
@keyframes chIn{to{opacity:1}}

/* ---------- 贴纸：贴回去时啪一下 ---------- */
.slap{animation:slap .5s ${SPRING}}
@keyframes slap{0%{transform:scale(1.12) rotate(-6deg)}50%{transform:scale(.94) rotate(2deg)}100%{transform:none}}
@keyframes slapIn{0%{opacity:0;transform:translate(26px,-30px) rotate(24deg) scale(1.5)}55%{opacity:1;transform:rotate(-6deg) scale(.92)}78%{transform:rotate(1deg) scale(1.04)}100%{opacity:1;transform:none}}
.peel{cursor:grab;touch-action:none;will-change:transform;border-radius:50%}
.peel:focus-visible{outline:2.5px dashed var(--pen);outline-offset:1px}

/* ---------- 翻页：以左边的缝线为轴翻过去 ---------- */
.turnwrap{position:absolute;inset:0;perspective:2200px;pointer-events:none;z-index:30}
.turn{position:absolute;inset:0;transform-origin:0 50%;animation:turn .72s cubic-bezier(.45,.05,.55,.95) both;backface-visibility:hidden}
.turn::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,.18));animation:fadeIn .72s both;border-radius:inherit}
@keyframes turn{0%{transform:rotateY(0)}100%{transform:rotateY(-104deg)}}

/* ---------- 面板：弹进来 ---------- */
.panel.in{animation:panelIn .5s ${SPRING} both}
.panel.out{animation:panelOut .24s ease-in both}
@keyframes panelIn{0%{transform:translateX(105%) rotate(3deg)}100%{transform:none}}
@keyframes panelOut{to{transform:translateX(105%) rotate(2deg)}}
.erow.flash .rmk{animation:rowFlash 1.4s ease-out both}
@keyframes rowFlash{0%{opacity:0;clip-path:inset(0 100% 0 0)}25%{opacity:1;clip-path:inset(0 0 0 0)}70%{opacity:1}100%{opacity:0}}
.toast{animation:slapIn .45s ${SPRING} both}
.popin{animation:popIn2 .3s ${SPRING} both;transform-origin:90% 0}
@keyframes popIn2{0%{opacity:0;transform:translateY(-8px) scale(.94)}100%{opacity:1;transform:none}}

@media (prefers-reduced-motion:reduce){.bd *,.bd *::after{animation:none !important;transition:none !important}.greet .gw{clip-path:none}.greet .mk path{stroke-dashoffset:0}.ch.live{opacity:1}}
`;
