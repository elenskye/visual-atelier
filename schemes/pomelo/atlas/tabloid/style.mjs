// Tabloid：样子和动静。外面要有 Design System「Pomelo 柚儿园」的变量和组件样式（--color-*、.pm-btn、.pm-env、.pm-tip…）；
// 这里只写这份设计自己的。根是 .root（data-theme、data-palette、data-motion 由挂它的地方写）。
import { PW, PH } from './draw.mjs';

export const CSS = `
/* --zshadow 在 .root 上就取好值：印出来的纸按浅色画（data-theme="light"），纸落在桌上的影子还是跟桌面的明暗走 */
.root{position:relative;overflow:hidden;font-family:var(--font-hand);color:var(--color-ink);--zshadow:var(--color-shadow)}
.zrec,.ztoc,.pm-env{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.num{font-variant-numeric:tabular-nums}
/* 一张 1280 × 800 的桌面，按容器的大小整张缩放（--zfit 由 runtime.mjs 写） */
.ztable{position:absolute;left:50%;top:50%;width:1280px;height:800px;margin:-400px 0 0 -640px;transform:scale(var(--zfit,1));transform-origin:50% 50%}
.zp{position:absolute;top:0;width:${PW}px;height:${PH}px;color:var(--color-print-ink);overflow:hidden}
.zno{position:absolute;bottom:14px;font-size:11px;line-height:16px;color:var(--color-print-ink-soft)}
.zrec{display:block;text-align:left}
.zrec:focus-visible,.ztoc:focus-visible{outline:2px solid var(--color-print-line);outline-offset:3px;border-radius:6px}
.zsky svg{pointer-events:none}.zsky [data-day],.zsky [data-rec]{pointer-events:auto}
/* 跟着节拍出来的东西：这一页翻到了（.on）才放，第几拍在 --b，一拍 0.8 秒。
   外面那层 div 铺满整页（里面的东西都是绝对定位的，不铺满它就是 460 × 0 的空盒子，clip-path 按它裁会把东西全裁掉）；
   它自己不收点击，里面的东西照常收。裁切四周多留 20px，手画线的笔触不被切掉。 */
.zp div.b{position:absolute;inset:0;pointer-events:none}
.zp div.b>*{pointer-events:auto}
.zp .b{opacity:0}
.zp.on .b{animation:at-in .5s cubic-bezier(.3,1.5,.5,1) both;animation-delay:calc(var(--b,0) * .8s + .15s)}
.zp.on .b.fade{animation-name:at-fade;animation-timing-function:ease-out}
.zp.on .b.wipe{animation-name:at-wipe;animation-duration:.7s;animation-timing-function:ease-out}
@keyframes at-in{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:none}}
@keyframes at-fade{0%{opacity:0}100%{opacity:1}}
@keyframes at-wipe{0%{opacity:1;clip-path:inset(-20px calc(100% + 20px) -20px -20px)}100%{opacity:1;clip-path:inset(-20px -20px -20px -20px)}}
.still .zp .b,.root[data-motion="reduce"] .zp .b{opacity:1 !important;animation:none !important}
/* 一本小报：右页是一张纸的正面，左页是它的背面；翻一页是一拍 */
.book{position:absolute;left:180px;top:70px;width:${PW * 2}px;height:${PH}px;perspective:2600px;transition:transform .8s cubic-bezier(.35,.1,.2,1),opacity .3s}
.book[hidden]{display:none}
.book[data-at="first"]{transform:translateX(-${PW / 2}px)}
.book[data-at="last"]{transform:translateX(${PW / 2}px)}
.book.is-in{animation:at-book .7s cubic-bezier(.25,1.2,.5,1) both}
@keyframes at-book{0%{opacity:0;transform:translate(-160px,60px) scale(.26) rotate(-3deg)}100%{opacity:1;transform:translateX(-${PW / 2}px)}}
/* 停住的时候（.rest）整本不在 3D 里：去掉透视、背面改回可见、朝外的页直接藏起来，翻过来的左页停在 none 而不是 rotateY(0)。
   透视和 backface-visibility:hidden 都会让浏览器把页按 3D 层、固定比例栅格，一放大字就糊；只有翻页那 0.8 秒是 3D 的。 */
.book .zp{backface-visibility:hidden;-webkit-backface-visibility:hidden;transition:transform .8s cubic-bezier(.35,.1,.2,1)}
.book .zp[hidden]{display:none}
.book .zp.R{left:${PW}px;transform-origin:0 50%;border-radius:3px 10px 10px 3px;box-shadow:inset 16px 0 20px -16px rgba(0,0,0,.2),0 14px 30px var(--zshadow)}
.book .zp.L{left:0;transform-origin:100% 50%;transform:rotateY(180deg);border-radius:10px 3px 3px 10px;box-shadow:inset -16px 0 20px -16px rgba(0,0,0,.2),0 14px 30px var(--zshadow)}
.book .zp.R.fl{transform:rotateY(-180deg)}
.book .zp.L.fl{transform:none}
.book.rest{perspective:none}
.book.rest .zp{backface-visibility:visible;-webkit-backface-visibility:visible}
.book.rest .zp.R.fl,.book.rest .zp.L:not(.fl){visibility:hidden}
.book .zp.R .zno{right:20px}.book .zp.L .zno{left:20px}
.root[data-motion="reduce"] .book,.root[data-motion="reduce"] .book .zp{transition:none}
.root[data-motion="reduce"] .book.is-in{animation:none}
/* 下面一条：上一页、每个跨页一个点（当前的那个跟着节拍跳）、下一页、自动翻、目录、收起来 */
.bar{position:absolute;left:0;right:0;top:${70 + PH + 26}px;display:flex;align-items:center;justify-content:center;gap:10px;transition:opacity .25s}
.bar[hidden]{display:none}
.bar.is-away{opacity:0;pointer-events:none}
.dots{display:flex;align-items:center;gap:8px;margin:0 6px}
.dots i{display:block;width:9px;height:9px;border-radius:50%;border:1.6px solid var(--color-pen)}
.dots i.on{background:var(--color-pen)}
.root[data-play="1"] .dots i.on{animation:at-beat .8s ease-in-out infinite}
@keyframes at-beat{0%,100%{transform:scale(1)}12%{transform:scale(1.55)}40%{transform:scale(1)}}
.root[data-motion="reduce"] .dots i.on{animation:none}
.tog{position:relative;display:flex;align-items:center;gap:6px;height:36px;padding:0 14px;font-size:14px;white-space:nowrap}
.tog .ic-on,.tog .ic-off{display:flex}
.tog[aria-pressed="true"] .ic-off,.tog[aria-pressed="false"] .ic-on{display:none}
.tog[aria-pressed="false"]{color:var(--color-ink-soft)}
.hint{position:absolute;left:0;right:0;top:34px;text-align:center;font-size:13px;line-height:20px;color:var(--color-ink-soft)}
.hint[hidden],.envwrap[hidden]{display:none}
/* 原记录：一张纸条，从一卷纸里往下卷开；合上时卷回去、收走（runtime.mjs 的 unroll / rollUp）。减弱动效时直接出现、消失 */
.pop{position:absolute;inset:0;z-index:50;display:grid;place-items:center;background:rgba(20,24,18,.28);transition:background-color .22s ease-out}
.pop[hidden]{display:none}
.pop.is-dim{background:rgba(20,24,18,0)}
.popwrap{position:relative;width:420px}
.pop.is-letter .popwrap{width:520px}
.popcard{position:relative;padding:26px 28px 20px;color:var(--color-print-ink)}
.popcard>.bg{position:absolute;inset:0;border-radius:4px;background:var(--color-print-paper);box-shadow:0 2px 3px rgba(0,0,0,.2),0 18px 40px rgba(0,0,0,.25);transform:rotate(-.6deg)}
/* 纸卷：一根横着的纸筒，两头看得见卷了几圈 */
.roll{position:absolute;left:-12px;right:-12px;top:-12px;height:24px;border-radius:12px;opacity:0;pointer-events:none;transform:rotate(-.6deg);
background:linear-gradient(180deg,rgba(0,0,0,.14) 0%,rgba(255,255,255,.7) 26%,rgba(255,255,255,0) 52%,rgba(0,0,0,.08) 76%,rgba(0,0,0,.26) 100%),var(--color-print-paper);
box-shadow:0 4px 8px rgba(0,0,0,.22),inset 0 0 0 1.2px rgba(43,47,39,.28)}
.roll::before,.roll::after{content:"";position:absolute;top:0;width:14px;height:24px;border-radius:50%;
background:radial-gradient(circle,rgba(43,47,39,.55) 0 1.6px,transparent 2.2px),repeating-radial-gradient(circle,var(--color-print-paper) 0 2.4px,rgba(43,47,39,.22) 2.4px 3.4px);box-shadow:inset 0 0 0 1.2px rgba(43,47,39,.34)}
.roll::before{left:-3px}.roll::after{right:-3px}
.poprow{display:flex;align-items:center;gap:8px;font-size:13px;line-height:20px;color:var(--color-print-ink-soft)}
.popmark{display:flex;line-height:0}.popmark:empty,.popmod:empty,.poptitle:empty{display:none}
/* 纸条上用的模块贴纸先放在这里（看不见但画着：贴纸里的渐变按 id 找的是这一份），弹出时复制一张 */
.popmarks{position:absolute;left:-200px;top:0;width:0;height:0;overflow:hidden;visibility:hidden}
.poplines{display:flex;flex-direction:column;gap:6px;margin-top:10px;max-height:360px;overflow-y:auto;font-size:15px;line-height:24px;white-space:pre-wrap;overflow-wrap:anywhere}
.poplines:empty{display:none}
.poplines b{font-weight:700}
.poplines .md{white-space:normal}
.md>*{margin:0}
.md>*+*{margin-top:10px}
.md h3{margin-top:20px;font-size:17px;line-height:26px;font-weight:700}
.md>h3:first-child{margin-top:0}
.md strong{font-weight:700}
.md em{font-style:normal;background:linear-gradient(transparent 62%,var(--color-print-cream) 62%)}
.md del{color:var(--color-print-ink-soft)}
.md code{font:inherit;padding:0 3px;border-radius:3px;background:var(--color-print-cream)}
.md ul,.md ol{padding-left:22px}
.md li+li{margin-top:4px}
.md li::marker{color:var(--color-print-ink-soft)}
.md blockquote{padding:0 0 0 12px;border-left:3px solid var(--color-yuzu)}
.md hr{height:0;border:0;border-top:1.5px dashed var(--color-print-rule)}
.pop [data-act="goto"][hidden]{display:none}
/* 收进抽屉：纸板做的抽屉从桌子下面拉出来，小报合上放进去，抽屉推回去 */
.drawer{position:absolute;left:380px;top:560px;width:520px;height:260px;pointer-events:none}
.drawer[hidden]{display:none}
.drawer svg{position:absolute;left:0;top:0;overflow:visible}
.drawer.back{z-index:20}.drawer.front{z-index:22}
.book.is-stowing{z-index:21}
.drawer .lbl{position:absolute;left:206px;top:130px;width:108px;height:34px;line-height:34px;text-align:center;font-size:14px;color:var(--color-print-ink)}
/* 桌面 */
.envwrap{position:absolute;left:475px;top:300px}
.envwrap.is-back{animation:at-fade .5s ease-out both}
.toastline{position:absolute;left:0;right:0;top:${70 + PH + 74}px;text-align:center;font-size:13px;line-height:20px;color:var(--color-ink-soft);opacity:0;transition:opacity .3s}
.toastline.on{opacity:1}
/* 全部的页摊开（审看） */
.grid{position:absolute;left:40px;top:40px;display:grid;grid-template-columns:repeat(5,${PW}px);gap:44px 30px}
.grid .cell{position:relative;width:${PW}px;height:${PH + 30}px}
.grid .zp{box-shadow:0 2px 4px var(--zshadow),0 14px 30px var(--zshadow);border-radius:6px}
.grid .cap{position:absolute;left:0;top:${PH + 8}px;font-size:14px;line-height:22px;color:var(--color-ink-soft)}
.grid .zno{display:none}
/* 从尾巴尖弹出来（.grow）；一闪而过的（.tr：正在输入、流星、跳的小石子、水花、小星）摊开看和减弱动态效果时不出现，
   别的停在最后的样子 */
.zp.on .b.grow{animation-name:at-grow;animation-duration:.6s;animation-timing-function:cubic-bezier(.3,1.45,.5,1)}
@keyframes at-grow{0%{opacity:0;transform:scale(.15)}45%{opacity:1}100%{opacity:1;transform:none}}
.zp.on .b.blip{animation-name:at-blip;animation-duration:1.1s;animation-timing-function:ease-out}
@keyframes at-blip{0%{opacity:0;transform:scale(.3)}22%{opacity:1;transform:none}80%{opacity:1;transform:none}100%{opacity:0;transform:scale(.9)}}
.typing{display:flex;gap:5px}.typing i{width:6px;height:6px;border-radius:50%;background:var(--color-print-ink-soft)}
.zp.on .typing i{animation:at-dot .9s ease-in-out infinite}.zp.on .typing i:nth-child(2){animation-delay:.15s}.zp.on .typing i:nth-child(3){animation-delay:.3s}
@keyframes at-dot{0%,60%,100%{transform:none;opacity:.45}30%{transform:translateY(-4px);opacity:1}}
.zp .steam{opacity:.5}.zp.on .steam{animation:at-steam 2.1s ease-in-out infinite both}
@keyframes at-steam{0%{opacity:0;transform:translateY(5px)}45%{opacity:.7}100%{opacity:0;transform:translateY(-7px)}}
.caret{display:inline-block;width:2px;height:16px;margin-left:3px;vertical-align:-2px;background:var(--color-print-ink)}
.zp.on .caret{animation:at-caret 1s steps(1) infinite}
@keyframes at-caret{50%{opacity:0}}
/* 滚出来的数字（draw.mjs 的 roll）：每一位一条竖着的 0–9，停在 --y；上下两头渐隐，滚到一半的数字不露半个 */
.odo{display:inline-flex;height:var(--h);line-height:var(--h);vertical-align:top}
.odo .rd{display:inline-block;height:var(--h);overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 22%,#000 78%,transparent);mask-image:linear-gradient(transparent,#000 22%,#000 78%,transparent)}
.odo .rs{display:block;transform:translateY(var(--y))}
.odo .rs i{display:block;height:var(--h);font-style:normal}
.zp.on .odo .rs{animation-name:at-odo;animation-timing-function:cubic-bezier(.2,.65,.25,1);animation-fill-mode:both;animation-delay:calc(var(--b,0) * .8s + .15s)}
@keyframes at-odo{from{transform:none}}
.zp .tr{opacity:0}
/* 去年的回声：两条比的条从左边长出来 */
.growx{transform-origin:0 50%}
.zp.on .growx{animation:at-growx .8s cubic-bezier(.2,.7,.3,1) both;animation-delay:calc(var(--b,0) * .8s + .15s)}
@keyframes at-growx{from{transform:scaleX(0)}}
/* 序章：星星一闪一闪；今年的星座一笔连出来（遮罩里的实线），金星被连到时啪地亮一下、外面一圈光散开；流星划过星盘 */
.zp .tw{transform-box:fill-box;transform-origin:center}
.zp.on .tw{animation:at-tw 2.6s ease-in-out infinite}
@keyframes at-tw{0%,100%{opacity:1;transform:none}50%{opacity:.3;transform:scale(.7)}}
.consdraw{stroke-dasharray:1 1}
.zp.on .consdraw{animation-name:at-draw;animation-timing-function:linear;animation-fill-mode:both;animation-delay:calc(var(--b,0) * .8s + .15s)}
@keyframes at-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.zp .b.gold{transform-box:fill-box;transform-origin:center}
.zp.on .b.gold{animation-name:at-star;animation-duration:.6s;animation-timing-function:cubic-bezier(.3,1.6,.5,1)}
@keyframes at-star{0%{opacity:0;transform:scale(0)}60%{opacity:1;transform:scale(1.35)}100%{opacity:1;transform:none}}
.zp .glow{opacity:0;transform-box:fill-box;transform-origin:center}
.zp.on .glow{animation:at-glow .8s ease-out both;animation-delay:inherit}
@keyframes at-glow{0%{opacity:.9;transform:scale(.5)}100%{opacity:0;transform:scale(2)}}
.zp.on .b.shoot{animation:none;opacity:1}
.zp.on .shoot>span{animation:at-shoot .9s cubic-bezier(.4,0,.8,.6) both;animation-delay:calc(var(--b,0) * .8s + .15s)}
@keyframes at-shoot{0%{opacity:0;transform:none}12%{opacity:1}70%{opacity:1}100%{opacity:0;transform:translate(-200px,128px)}}
/* 求职：小石子沿着虚线一跳一跳（关键帧在 pages.mjs 里算好，放在那一页的 style 里），落下的地方溅水花，拿到了金星亮起来、迸几颗小星 */
.pebble{position:absolute;left:0;top:0;width:0;height:0}
.zp.on .pebble{animation-name:at-skip;animation-timing-function:linear;animation-fill-mode:both}
.zp.on .b.hop{animation-duration:.45s;animation-timing-function:linear}
.zp.on .b.splash{animation-name:at-splash;animation-duration:.8s;animation-timing-function:ease-out}
@keyframes at-splash{0%{opacity:0;transform:scale(.6)}15%{opacity:1}100%{opacity:0;transform:scale(1.35)}}
.zp.on .b.burst{animation:none;opacity:1}
.spk{position:absolute;width:0;height:0}
.zp.on .burst .spk{animation:at-spark .75s ease-out both;animation-delay:calc(var(--b,0) * .8s + .15s)}
@keyframes at-spark{0%{opacity:0;transform:scale(.3)}25%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy))}}
/* 钱：小票从出纸口一截一截吐出来（--ph：小票多高） */
.zp.on .b.print{animation:none;opacity:1}
.zp.on .b.print>div{animation:at-print 1.7s steps(17,end) both;animation-delay:calc(var(--b,0) * .8s + .15s)}
@keyframes at-print{from{transform:translateY(calc(-1 * var(--ph,392px)))}}
/* 终章：信一段一段地浮出来，慢一点 */
.zp.on .b.letter{animation-name:at-letter;animation-duration:1.4s;animation-timing-function:cubic-bezier(.25,.6,.3,1)}
@keyframes at-letter{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:none}}
.still .zp .tr,.root[data-motion="reduce"] .zp .tr{display:none !important}
.still .zp *,.root[data-motion="reduce"] .zp *{animation:none !important}
@media (prefers-reduced-motion: reduce){.root *{transition:none !important;animation:none !important}.zp .b{opacity:1 !important}.zp .tr{display:none !important}}
`;
