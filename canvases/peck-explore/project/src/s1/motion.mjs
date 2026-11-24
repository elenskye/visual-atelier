// 第 1 步 · 动效性格：四种性格 × 三个场景（发出一句话、在跑、完成）。都是 CSS 动画，4 秒一圈；
// 减弱动态效果时停在最后的样子（元素本身的样式就是终态，关键帧只写起点和过程）。
import { board, themeProp, SANS, MONO, DOTS } from './common.mjs';

const T = '4s';
const M = [
  { id: 'M1', name: '扫描', d: '一道青光扫过去，东西跟着显出来。利落，像仪器。' },
  { id: 'M2', name: '示波', d: '一条信号线一直在走，有输出就跳；动作都沿着这条线发生。' },
  { id: 'M3', name: '弹扣', d: '东西「啪」地弹到位，带一点回弹。快、准、有手感。' },
  { id: 'M4', name: '点阵', d: '一颗颗点亮，拼成字和图形。最极客的一种。' },
];

const CSS = `
.mb{width:1280px;height:800px;box-sizing:border-box;padding:30px 36px 34px;background:var(--bg);color:var(--tx);font-family:${SANS};font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums;display:flex;flex-direction:column;gap:14px}
.mb.dk{--bg:#0E1114;--sg:#070A0D;--sl:#1A232A;--sc:#0F161B;--tx:#E6EFF3;--tx2:#8A9BA6;--tx3:#56656E;--ok:#3DDC97;--bad:#FF5C6C;--muse:#B79DFF;--grok:#FFB547;--on:#001A1F;--glow:0 0 10px rgba(0,229,255,.7);--ring:rgba(0,229,255,.5);--wf:drop-shadow(0 0 4px rgba(0,229,255,.8))}
.mb.lt{--bg:#E9EEF0;--sg:#F8FAFB;--sl:#D6DEE2;--sc:#FFFFFF;--tx:#0A1418;--tx2:#52626A;--tx3:#8595A0;--ok:#0F9E66;--bad:#DC3046;--muse:#7556EE;--grok:#B87400;--on:#001A1F;--glow:none;--ring:#0A1418;--wf:none}
.mb *{box-sizing:border-box}.mb p,.mb h1{margin:0}.mb i,.mb em{font-style:normal}
.top{display:flex;align-items:baseline;gap:16px}
.top h1{font-size:20px;font-weight:600;letter-spacing:-.01em}
.top p{color:var(--tx2)}
.grid{flex:1;display:grid;grid-template-columns:200px repeat(3,minmax(0,1fr));grid-template-rows:22px repeat(4,minmax(0,1fr));gap:12px 14px;min-height:0}
.sh{font-size:12.5px;color:var(--tx2);align-self:end}
.sh b{color:var(--tx);font-weight:600;margin-right:6px}
.ml{display:flex;flex-direction:column;justify-content:center;gap:4px;padding-right:8px}
.ml b{font-size:17px;font-weight:600}
.ml b span{font-family:${MONO};font-size:13px;color:var(--tx3);margin-right:8px;font-weight:500}
.ml p{font-size:12px;color:var(--tx2);line-height:1.55}
.stg{position:relative;overflow:hidden;border-radius:10px;background:var(--sg);box-shadow:inset 0 0 0 1px var(--sl);font-size:12.5px}
.rowx{position:absolute;left:14px;right:14px;height:30px;display:flex;align-items:center;gap:9px;padding:0 10px;border-radius:7px;white-space:nowrap}
.rowx b{font-weight:500;overflow:hidden;text-overflow:ellipsis}
.rowx em{margin-left:auto;font-size:11.5px;color:var(--tx2);display:flex;align-items:center;gap:4px}
.dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.rd{position:relative;width:9px;height:9px;border-radius:50%;background:#00E5FF;box-shadow:0 0 0 1.5px var(--ring),var(--glow);flex:none}
.ck{width:9px;height:9px;border-radius:50%;background:var(--ok);flex:none}
.new{top:12px;background:var(--sc);box-shadow:inset 0 0 0 1px var(--sl)}
.old{top:48px;color:var(--tx3)}
.cmp{position:absolute;left:14px;right:14px;bottom:12px;height:34px;border-radius:8px;box-shadow:inset 0 0 0 1px var(--sl);background:var(--sc);display:flex;align-items:center;padding:0 6px 0 12px;overflow:hidden}
.cmp .txt{color:var(--tx);opacity:0}
.cmp .snd{margin-left:auto;width:24px;height:24px;border-radius:6px;background:#00E5FF;box-shadow:var(--glow)}
.fx{position:absolute;pointer-events:none}
@media (prefers-reduced-motion:reduce){.mb *,.mb *:before,.mb *:after{animation:none!important}.s2.m1 .rowx:after,.s2.m1 .out:after,.s3.m1 .sum:after,.s1 .fx{display:none}}

/* ===== 场景一：发出一句话 ===== */
.s1 .new,.s1 .cmp .txt{animation:${T} infinite both}
/* M1 扫描 */
.s1.m1 .cmp .txt{animation-name:s1m1t}
@keyframes s1m1t{0%,8%{opacity:1}26%,100%{opacity:0}}
.s1.m1 .cmp:after{content:"";position:absolute;top:0;bottom:0;left:0;width:2px;background:#00E5FF;box-shadow:0 0 12px 2px rgba(0,229,255,.7);opacity:0;animation:s1m1c ${T} infinite}
@keyframes s1m1c{0%,8%{transform:translateX(0);opacity:0}9%{opacity:1}28%{transform:translateX(300px);opacity:1}29%,100%{opacity:0;transform:translateX(300px)}}
.s1.m1 .new{animation-name:s1m1n}
@keyframes s1m1n{0%,30%{clip-path:inset(0 100% 0 0)}50%,94%{clip-path:inset(0 0 0 0);opacity:1}100%{opacity:0;clip-path:inset(0 0 0 0)}}
.s1.m1 .scan{left:14px;top:8px;width:2px;height:38px;background:#00E5FF;box-shadow:0 0 14px 3px rgba(0,229,255,.75);opacity:0;animation:s1m1s ${T} infinite}
@keyframes s1m1s{0%,30%{transform:translateX(0);opacity:0}31%{opacity:1}50%{transform:translateX(300px);opacity:1}51%,100%{opacity:0;transform:translateX(300px)}}
/* M2 示波 */
.s1.m2 .cmp .txt{animation-name:s1m2t}
@keyframes s1m2t{0%,10%{opacity:1}20%,100%{opacity:0}}
.s1.m2 .trace{inset:0;width:100%;height:100%}
.s1.m2 .trace path{fill:none;stroke:#00E5FF;stroke-width:1.6;stroke-linejoin:round;filter:var(--wf);stroke-dasharray:520;stroke-dashoffset:520;animation:s1m2p ${T} infinite}
@keyframes s1m2p{0%,14%{stroke-dashoffset:520;opacity:1}44%{stroke-dashoffset:0;opacity:1}58%,100%{stroke-dashoffset:0;opacity:0}}
.s1.m2 .new{animation-name:s1m2n}
@keyframes s1m2n{0%,42%{opacity:0}54%,94%{opacity:1}100%{opacity:0}}
.s1.m2 .new .rd:after{content:"";position:absolute;inset:-1px;border-radius:50%;border:1.5px solid #00E5FF;opacity:0;animation:s1m2r ${T} infinite}
@keyframes s1m2r{0%,44%{transform:scale(1);opacity:0}45%{opacity:1}62%,100%{transform:scale(3.4);opacity:0}}
/* M3 弹扣 */
.s1.m3 .cmp .txt{animation-name:s1m3t}
@keyframes s1m3t{0%,10%{opacity:1}13%,100%{opacity:0}}
.s1.m3 .pill{left:26px;bottom:21px;width:130px;height:16px;border-radius:8px;background:#00E5FF;box-shadow:var(--glow);transform-origin:left center;opacity:0;animation:s1m3p ${T} infinite}
@keyframes s1m3p{0%,10%{opacity:0;transform:translate(0,0) scaleX(1)}12%{opacity:1;transform:translate(0,0) scaleX(1);animation-timing-function:cubic-bezier(.5,0,.2,1)}22%{transform:translate(0,0) scaleX(.18);animation-timing-function:cubic-bezier(.3,1.5,.55,1)}36%{opacity:1;transform:translate(-2px,-92px) scaleX(.18)}38%,100%{opacity:0;transform:translate(-2px,-92px) scaleX(.18)}}
.s1.m3 .new{transform-origin:left center;animation-name:s1m3n}
@keyframes s1m3n{0%,35%{opacity:0;transform:scaleX(.12)}36%{opacity:1;transform:scaleX(.12);animation-timing-function:cubic-bezier(.25,1.6,.5,1)}50%,94%{opacity:1;transform:scaleX(1)}100%{opacity:0;transform:scaleX(1)}}
/* M4 点阵 */
.s1.m4 .cmp .txt{animation-name:s1m4t}
@keyframes s1m4t{0%,10%{opacity:1}22%,100%{opacity:0}}
.s1.m4 .new{animation-name:s1m4n}
@keyframes s1m4n{0%,44%{opacity:0}52%,94%{opacity:1}100%{opacity:0}}
.s1.m4 .dm{left:14px;right:14px;top:12px;height:30px;border-radius:7px;background:radial-gradient(circle,#00E5FF 1.3px,transparent 1.7px) 0 0/6px 6px;-webkit-mask:linear-gradient(90deg,#000 45%,transparent 55%) 0 0/300% 100% no-repeat;mask:linear-gradient(90deg,#000 45%,transparent 55%) 0 0/300% 100% no-repeat;opacity:0;animation:s1m4d ${T} infinite}
@keyframes s1m4d{0%,18%{opacity:1;-webkit-mask-position:100% 0;mask-position:100% 0}42%{opacity:1;-webkit-mask-position:0 0;mask-position:0 0}54%,100%{opacity:0;-webkit-mask-position:0 0;mask-position:0 0}}
.s1.m4 .cl,.s2.m4 .cl{display:grid;grid-template-columns:repeat(3,3px);gap:1.5px;flex:none}
.cl i{width:3px;height:3px;background:#00E5FF;box-shadow:0 0 3px rgba(0,229,255,.8);animation:tw 1.2s steps(1) infinite}
.cl i:nth-child(2){animation-delay:.3s}.cl i:nth-child(4){animation-delay:.6s}.cl i:nth-child(6){animation-delay:.15s}.cl i:nth-child(8){animation-delay:.45s}.cl i:nth-child(9){animation-delay:.9s}
@keyframes tw{50%{opacity:.15}}

/* ===== 场景二：在跑 ===== */
.s2 .rowx{top:12px;background:var(--sc);box-shadow:inset 0 0 0 1px var(--sl)}
.s2 .rowx .tm{margin-left:auto;font-family:${MONO};font-size:11.5px;color:var(--tx2)}
.s2 .lo{left:14px;right:14px;top:52px;bottom:12px}
/* M1 */
.s2.m1 .rowx{overflow:hidden}
.s2.m1 .rowx:after{content:"";position:absolute;top:0;bottom:0;left:0;width:60px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.22) 80%,#00E5FF 98%,transparent);animation:s2m1 1.8s cubic-bezier(.45,0,.55,1) infinite}
@keyframes s2m1{0%{transform:translateX(-70px)}70%,100%{transform:translateX(320px)}}
.s2.m1 .out{font-family:${MONO};font-size:11px;color:var(--tx3);line-height:17px;padding:2px 10px;position:relative;overflow:hidden;border-radius:6px}
.s2.m1 .out div:last-child{color:var(--tx)}
.s2.m1 .out:after{content:"";position:absolute;left:0;right:0;height:17px;top:2px;background:linear-gradient(transparent,rgba(0,229,255,.16));border-bottom:1px solid #00E5FF;animation:s2m1o 1.8s steps(3) infinite}
@keyframes s2m1o{from{transform:translateY(0)}to{transform:translateY(51px)}}
/* M2 */
.s2.m2 .lo{overflow:hidden;border-radius:6px;box-shadow:inset 0 0 0 1px var(--sl);background-image:linear-gradient(90deg,var(--sl) 1px,transparent 1px),linear-gradient(var(--sl) 1px,transparent 1px);background-size:30px 100%,100% 14px;background-position:0 0,0 6px}
.s2.m2 .lo svg{position:absolute;left:0;top:0;width:600px;height:100%;animation:s2m2 3s linear infinite}
.s2.m2 .lo path{fill:none;stroke:#00E5FF;stroke-width:1.5;stroke-linejoin:round;filter:var(--wf)}
@keyframes s2m2{to{transform:translateX(-300px)}}
/* M3 */
.s2.m3 .nodes{position:absolute;left:30px;right:30px;top:72px;height:20px}
.s2.m3 .track{position:absolute;left:0;right:0;top:9px;height:2px;background:var(--sl)}
.s2.m3 .fill{position:absolute;left:0;top:9px;height:2px;width:66.6%;background:#00E5FF;box-shadow:var(--glow);transform-origin:left;animation:s2m3f ${T} infinite both}
@keyframes s2m3f{0%{transform:scaleX(.5)}30%,100%{transform:scaleX(1)}}
.s2.m3 .nd{position:absolute;top:2px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:var(--sg);box-shadow:inset 0 0 0 1.5px var(--sl)}
.s2.m3 .nd.ok{background:var(--ok);box-shadow:none}
.s2.m3 .nd.cur{background:#00E5FF;box-shadow:0 0 0 1.5px var(--ring),var(--glow);animation:s2m3p 1.4s infinite}
@keyframes s2m3p{0%{transform:scale(1)}18%{transform:scale(1.45);animation-timing-function:cubic-bezier(.3,1.6,.5,1)}40%{transform:scale(.92)}55%,100%{transform:scale(1)}}
.s2.m3 .lab{position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;font-size:11px;color:var(--tx3)}
/* M4 */
.s2.m4 .rowx .tm{font-family:${DOTS};font-weight:900;font-size:17px;color:var(--tx)}
.s2.m4 .blk{position:absolute;left:14px;right:14px;top:64px;display:grid;grid-template-columns:repeat(20,minmax(0,1fr));gap:3px}
.s2.m4 .blk i{height:14px;background:var(--sl)}
.s2.m4 .blk i.f{background:#00E5FF;box-shadow:var(--glow);animation:s2m4w 1.6s infinite}
.s2.m4 .blk i.h{background:#00E5FF;animation:blink .7s steps(1) infinite}
@keyframes s2m4w{0%,100%{filter:brightness(1)}50%{filter:brightness(.55)}}
.s2.m4 .bl{position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;font-family:${MONO};font-size:11px;color:var(--tx3)}
@keyframes blink{50%{opacity:0}}

/* ===== 场景三：完成 ===== */
.s3 .sum{position:absolute;left:14px;right:14px;top:50%;height:84px;margin-top:-42px;border-radius:10px;background:var(--sc);box-shadow:inset 0 0 0 1px var(--sl);display:flex;align-items:center;gap:12px;padding:0 16px;overflow:hidden}
.s3 .ic{position:relative;width:34px;height:34px;flex:none;border-radius:50%;background:#00E5FF;box-shadow:var(--glow);display:flex;align-items:center;justify-content:center}
.s3 .ic svg{width:20px;height:20px}
.s3 .ic .chk{fill:none;stroke:var(--on);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.s3 .tx b{display:block;font-size:14px;font-weight:600}
.s3 .tx span{font-size:11.5px;color:var(--tx2)}
.s3 .n{margin-left:auto;display:flex;gap:8px;font-family:${MONO};font-size:15px;font-weight:500;line-height:24px;overflow:hidden;height:24px}
.s3 .n .a{color:var(--ok)}.s3 .n .d{color:var(--bad)}
.s3 .n span{display:block}
/* M1 */
.s3.m1 .sum:after{content:"";position:absolute;top:0;bottom:0;left:0;width:90px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.25) 70%,#00E5FF 96%,transparent);opacity:0;animation:s3m1b ${T} infinite}
@keyframes s3m1b{0%,10%{transform:translateX(-100px);opacity:1}34%{transform:translateX(330px);opacity:1}35%,100%{opacity:0;transform:translateX(330px)}}
.s3.m1 .ic,.s3.m1 .tx,.s3.m1 .n{animation:s3m1r ${T} infinite both}
.s3.m1 .tx{animation-name:s3m1r2}.s3.m1 .n{animation-name:s3m1r3}
@keyframes s3m1r{0%,14%{transform:scale(.4);opacity:0}20%{transform:scale(1);opacity:1}94%{opacity:1}100%{opacity:0}}
@keyframes s3m1r2{0%,18%{opacity:0;clip-path:inset(0 100% 0 0)}28%,94%{opacity:1;clip-path:inset(0 0 0 0)}100%{opacity:0}}
@keyframes s3m1r3{0%,28%{opacity:0;clip-path:inset(0 100% 0 0)}35%,94%{opacity:1;clip-path:inset(0 0 0 0)}100%{opacity:0}}
/* M2 */
.s3.m2 .ic{background:transparent;box-shadow:inset 0 0 0 1.5px #00E5FF,var(--glow)}
.s3.m2 .ic .chk{stroke:#00E5FF;stroke-dasharray:24;stroke-dashoffset:0;animation:s3m2c ${T} infinite both;filter:var(--wf)}
.mb.lt .s3.m2 .ic .chk{stroke:var(--tx)}
@keyframes s3m2c{0%,30%{stroke-dashoffset:24}46%,94%{stroke-dashoffset:0;opacity:1}100%{opacity:0}}
.s3.m2 .wave{position:absolute;left:0;right:0;top:50%;height:40px;margin-top:-20px;pointer-events:none}
.s3.m2 .wave path{fill:none;stroke:#00E5FF;stroke-width:1.5;filter:var(--wf);opacity:0;animation:s3m2w ${T} infinite both}
@keyframes s3m2w{0%{opacity:1;transform:scaleY(1)}22%{opacity:1;transform:scaleY(1)}32%{opacity:1;transform:scaleY(.05)}40%,100%{opacity:0;transform:scaleY(.05)}}
.s3.m2 .tx,.s3.m2 .n{animation:s3m2t ${T} infinite both}
@keyframes s3m2t{0%,38%{opacity:0}50%,94%{opacity:1}100%{opacity:0}}
/* M3 */
.s3.m3 .sum{animation:s3m3s ${T} infinite both}
@keyframes s3m3s{0%,6%{transform:translateY(46px) scale(.94);opacity:0;animation-timing-function:cubic-bezier(.25,1.5,.5,1)}24%,94%{transform:translateY(0) scale(1);opacity:1}100%{opacity:0}}
.s3.m3 .ic{animation:s3m3i ${T} infinite both}
@keyframes s3m3i{0%,22%{transform:scale(0);animation-timing-function:cubic-bezier(.25,1.8,.5,1)}36%,100%{transform:scale(1)}}
.s3.m3 .n span{animation:s3m3n ${T} infinite both}
.s3.m3 .n .d{animation-delay:.08s}
@keyframes s3m3n{0%,32%{transform:translateY(24px);animation-timing-function:cubic-bezier(.25,1.6,.5,1)}46%,100%{transform:translateY(0)}}
/* M4 */
.s3.m4 .ic{background:transparent;box-shadow:none;border-radius:0;width:34px;height:34px;display:grid;grid-template-columns:repeat(7,4px);grid-auto-rows:4px;gap:1px;align-content:center;justify-content:center}
.s3.m4 .ic i{width:4px;height:4px;background:var(--sl)}
.s3.m4 .ic i.on{background:#00E5FF;box-shadow:0 0 4px rgba(0,229,255,.8);animation:s3m4d ${T} infinite both}
@keyframes s3m4d{0%,12%{opacity:0}16%,94%{opacity:1}100%{opacity:0}}
.s3.m4 .n{font-family:${DOTS};font-weight:900;font-size:19px}
.s3.m4 .tx,.s3.m4 .n{animation:s3m4t ${T} infinite both}
@keyframes s3m4t{0%,40%{opacity:0}41%,44%{opacity:1}45%,47%{opacity:.2}48%,94%{opacity:1}100%{opacity:0}}
`;

const who = '<em><i class="dot" style="background:var(--muse)"></i>Muse →<i class="dot" style="background:var(--grok)"></i>Grok</em>';
const cl = '<span class="cl"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';

function wave(w, h, seed, amp) {
  let s = seed; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const mid = h / 2, pts = [];
  for (let x = 0; x <= w; x += 4) {
    let y = (r() - 0.5) * 2;
    for (const c of [w * 0.15, w * 0.42, w * 0.7, w * 0.9]) y += Math.exp(-((x - c) ** 2) / 120) * amp * Math.sin(x * 1.1) * (0.5 + r() * 0.6);
    if (x === 0 || x === w) y = 0;
    pts.push(`${x ? 'L' : 'M'}${x} ${(mid - y).toFixed(1)}`);
  }
  return pts.join('');
}

function stage(scene, m) {
  const k = `stg s${scene} m${m}`;
  if (scene === 1) {
    const dotOrCl = m === 4 ? cl : '<i class="rd"></i>';
    const fx = {
      1: '<i class="fx scan"></i>',
      2: '<svg class="fx trace" viewBox="0 0 330 150" preserveAspectRatio="none" aria-hidden="true"><path d="M302 112 V96 H230 l5 -9 l5 18 l5 -14 l5 8 l4 -3 H120 l4 -6 l4 12 l4 -6 H27 V32"></path></svg>',
      3: '<i class="fx pill"></i>',
      4: '<i class="fx dm"></i>',
    }[m];
    return `<div class="${k}"><div class="rowx old"><i class="ck"></i><b>修 Diff 里的中文乱码</b></div><div class="rowx new">${dotOrCl}<b>把设置合成一个面板</b>${who}</div><div class="cmp"><span class="txt">把设置合成一个面板</span><i class="snd"></i></div>${fx}</div>`;
  }
  if (scene === 2) {
    const ind = m === 4 ? cl : '<i class="rd"></i>';
    const row = `<div class="rowx">${ind}<b>Grok 跑 pnpm check</b><span class="tm">02:14</span></div>`;
    const lo = {
      1: '<div class="fx lo"><div class="out"><div>&gt; tsc --noEmit</div><div>SettingsSheet.tsx:41 类型不对</div><div>→ 改 SettingsProps，再跑一遍</div></div></div>',
      2: `<div class="fx lo"><svg viewBox="0 0 600 70" preserveAspectRatio="none" aria-hidden="true"><path d="${wave(300, 70, 5, 22)}${wave(300, 70, 5, 22).replace(/[ML](\d+)/g, (a, x) => `L${+x + 300}`)}"></path></svg></div>`,
      3: '<div class="nodes"><i class="track"></i><i class="fill"></i><i class="nd ok" style="left:0"></i><i class="nd ok" style="left:33.3%"></i><i class="nd cur" style="left:66.6%"></i><i class="nd" style="left:100%"></i></div><p class="lab"><span>写规范</span><span>改代码</span><span>跑检查</span><span>总结</span></p>',
      4: `<div class="blk">${Array.from({ length: 20 }, (_, i) => `<i class="${i < 12 ? 'f' : i === 12 ? 'h' : ''}" style="animation-delay:${(i * 0.06).toFixed(2)}s"></i>`).join('')}</div><p class="bl"><span>第 3 步，共 4 步</span><span>62%</span></p>`,
    }[m];
    return `<div class="${k}">${row}${lo}</div>`;
  }
  // 完成
  const chk = '<svg viewBox="0 0 20 20" aria-hidden="true"><path class="chk" d="M4.5 10.5 L8.5 14 L15.5 6.5"></path></svg>';
  const pattern = ['0000000', '0000001', '0000010', '1000100', '0101000', '0010000', '0000000'];
  let n = 0;
  const dots = pattern.join('').split('').map((c) => (c === '1' ? `<i class="on" style="animation-delay:${(0.08 * n++).toFixed(2)}s"></i>` : '<i></i>')).join('');
  const ic = m === 4 ? `<div class="ic">${dots}</div>` : `<div class="ic">${chk}</div>`;
  const extra = m === 2 ? `<svg class="wave" viewBox="0 0 330 40" preserveAspectRatio="none" aria-hidden="true"><path d="${wave(330, 40, 9, 14)}"></path></svg>` : '';
  return `<div class="${k}"><div class="sum">${ic}<div class="tx"><b>做完了</b><span>4 个文件 · 检查通过</span></div><p class="n"><span class="a">+86</span><span class="d">−132</span></p>${extra}</div></div>`;
}

export function boards() {
  const cells = M.map((p, i) => `<div class="ml"><b><span>${p.id}</span>${p.name}</b><p>${p.d}</p></div>${[1, 2, 3].map((s) => stage(s, i + 1)).join('')}`).join('');
  const body = `<div class="{{root}}">
  <div class="top"><h1>动效性格</h1><p>四种性格放进三个真实场景，4 秒一圈；按 Play 看。可以整排挑，也可以按场景挑。</p></div>
  <div class="grid">
    <span></span><p class="sh"><b>发出一句话</b>输入框 → 任务列表</p><p class="sh"><b>在跑</b>当前这一步</p><p class="sh"><b>完成</b>总结卡</p>
    ${cells}
  </div>
</div>`;
  const logic = `renderVals() { return { root: 'mb ' + ((this.props.theme ?? '${process.env.FLIP ? '浅色' : '深色'}') === '深色' ? 'dk' : 'lt') }; }`;
  const html = board({ title: '动效性格 · 四种 × 三个场景', css: CSS, body, props: themeProp(process.env.FLIP ? '浅色' : '深色'), logic });
  return [{ file: 'S1-Motion.dc.html', x: 1360, y: 920, title: '动效性格 · M1–M4 × 三个场景', html }];
}
