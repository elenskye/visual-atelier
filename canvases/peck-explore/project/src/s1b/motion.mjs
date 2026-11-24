// 第 1 步 · 第二轮 · 动效融合：M4 点阵为主（出现、消失、进度，位移按格子一跳一跳），
// M3 弹扣只用在「在跑」的当前步骤，M1 扫描在开始、等你、完成、撤销时各扫一次。
// 五个场景 5 秒一圈；元素本身的样式就是停下来的样子，减弱动态效果时只留它。
import { board, themeProp, MONO, DOTS, KIT, themeCss, px, twinkle, blocks, dotCheck, FLIP } from './kit.mjs';

const T = '5s';
const CSS = `
.pk.mo{width:1280px;height:800px;padding:26px 34px 30px;display:flex;flex-direction:column;gap:14px}
.top{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap}
.top h1{font-size:20px;font-weight:600}
.top p{font-size:13px;color:var(--tx2)}
.lg{display:flex;gap:18px;font-size:12.5px;color:var(--tx2)}
.lg span{display:inline-flex;align-items:center;gap:7px}
.lg b{font-family:${MONO};font-weight:600;color:var(--tx)}
.lg i{width:10px;height:10px}
.lg .m4{background:var(--cy)}.lg .m3{background:var(--ok)}.lg .m1{background:linear-gradient(90deg,transparent,var(--cy))}
.g6{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:14px;min-height:0}
.sc{display:flex;flex-direction:column;gap:6px;min-height:0}
.sh{display:flex;align-items:baseline;gap:8px;font-size:12.5px;color:var(--tx2);white-space:nowrap}
.sh b{font-size:14px;color:var(--tx);font-weight:600}
.sh .u{margin-left:auto;display:flex;gap:4px}
.sh .u i{font-family:${MONO};font-size:10.5px;line-height:16px;padding:0 4px;background:var(--raise);color:var(--tx2)}
.stg{position:relative;flex:1;min-height:0;overflow:hidden;background:var(--pane);box-shadow:inset 0 0 0 1px var(--line);clip-path:var(--clip)}
.dk .stg{background-color:var(--pane)}
/* 小零件 */
.rowx{position:absolute;left:14px;right:14px;height:34px;display:flex;align-items:center;gap:10px;padding:0 10px;font-size:12.5px;white-space:nowrap;background:var(--pane2);clip-path:var(--clip2)}
.rowx b{font-weight:500;overflow:hidden;text-overflow:ellipsis}
.rowx em{margin-left:auto;font-family:${MONO};font-size:11px;color:var(--tx3)}
.rowx .px{color:var(--ok)}
.band{position:absolute;top:0;bottom:0;width:28px;background:radial-gradient(circle,var(--cy) 1.2px,transparent 1.7px) 0 0/5px 5px;pointer-events:none;opacity:0}
.lt .band{background-image:radial-gradient(circle,var(--tx) 1.2px,transparent 1.7px)}
.sweep{position:absolute;top:0;bottom:0;left:-80px;width:76px;pointer-events:none;background:linear-gradient(90deg,transparent,var(--cy-scan) 78%,var(--cy) 97%,transparent);opacity:0}
.clk{font-family:${DOTS};font-weight:900;font-size:22px;line-height:1;color:var(--cy-tx);text-shadow:var(--tglow)}
.clk.w{color:var(--warn);text-shadow:none}
.stg .blocks{position:absolute;left:14px;right:14px;grid-template-columns:repeat(20,minmax(0,1fr))}
.stg .blocks i{height:12px}

/* ===== 1 发出一句话 ===== */
.s1 .nw{top:14px}
.s1 .o1{top:56px}.s1 .o2{top:98px}
.s1 .nw > *{animation:s1show ${T} infinite steps(1)}
@keyframes s1show{0%,37%{visibility:hidden}38%,100%{visibility:visible}}
.s1 .nw{animation:s1row ${T} infinite steps(10,end)}
@keyframes s1row{0%,36%{clip-path:inset(0 100% 0 0)}48%,100%{clip-path:inset(0 0 0 0)}}
.s1 .nw .band{opacity:1;animation:s1band ${T} infinite steps(10,end)}
@keyframes s1band{0%,36%{left:0;opacity:1}47.9%{left:calc(100% - 28px);opacity:1}48%,100%{left:calc(100% - 28px);opacity:0}}
.s1 .nw .sweep{animation:sweep1 ${T} infinite}
@keyframes sweep1{0%,50%{left:-80px;opacity:0}51%{opacity:1}64%{left:100%;opacity:1}65%,100%{left:100%;opacity:0}}
.s1 .old{animation:s1down ${T} infinite steps(4,end)}
@keyframes s1down{0%,28%{transform:translateY(-42px)}36%,100%{transform:translateY(0)}}
.s1 .cmp{position:absolute;left:14px;right:14px;bottom:14px;height:40px;display:flex;align-items:center;gap:8px;padding:0 6px 0 12px;font-family:${MONO};font-size:12.5px;background:var(--pane2);box-shadow:inset 0 0 0 1px var(--cy-line);clip-path:var(--clip2)}
.s1 .cmp .pr{color:var(--cy-tx)}
.s1 .cmp .tx{position:relative;color:var(--tx);clip-path:inset(0 0 0 100%);animation:s1txt ${T} infinite steps(8,end)}
@keyframes s1txt{0%,8%{clip-path:inset(0 0 0 0)}20%,100%{clip-path:inset(0 0 0 100%)}}
.s1 .cmp .dz{position:absolute;top:8px;bottom:8px;left:26px;width:150px;pointer-events:none}
.s1 .cmp .dz .band{animation:s1dz ${T} infinite steps(8,end)}
@keyframes s1dz{0%,7.9%{left:0;opacity:0}8%{left:0;opacity:1}19.9%{left:122px;opacity:1}20%,100%{left:122px;opacity:0}}
.s1 .cmp .snd{margin-left:auto;width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:var(--cy);color:var(--on-cy)}
.s1 .pkt{position:absolute;left:36px;top:24px;display:grid;grid-template-columns:repeat(3,4px);gap:2px;opacity:0;animation:s1pkt ${T} infinite steps(6,end)}
.s1 .pkt i{width:4px;height:4px;background:var(--cy);box-shadow:var(--dglow)}
@keyframes s1pkt{0%,19%{transform:translateY(210px);opacity:0}20%{transform:translateY(210px);opacity:1}35%{transform:translateY(0);opacity:1}36%,100%{transform:translateY(0);opacity:0}}

/* ===== 2 在跑 ===== */
.s2 .hd2{position:absolute;left:14px;right:14px;top:14px;display:flex;align-items:center;gap:10px;font-family:${MONO};font-size:13px}
.s2 .hd2 b{font-weight:500;flex:1}
.s2 .blocks{top:50px}
.s2 .bm{position:absolute;left:14px;right:14px;top:68px;display:flex;justify-content:space-between;font-family:${MONO};font-size:11px;color:var(--tx3)}
.s2 .st2{position:absolute;left:14px;right:14px;top:96px;display:flex;flex-direction:column;gap:4px}
.s2 .st2 li{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:10px;align-items:center;height:26px;font-family:${MONO};font-size:12.5px;overflow:hidden}
.s2 .st2 li.ok .px{color:var(--ok)}
.s2 .st2 li.todo{color:var(--tx3)}
.s2 .st2 .tm{font-size:11.5px;color:var(--tx3)}
.s2 .st2 li.run .tm{color:var(--cy-tx)}
.s2 .nd{position:relative;width:16px;height:16px;display:flex;align-items:center;justify-content:center}
.s2 li.run .nd:before{content:"";width:10px;height:10px;background:var(--cy);box-shadow:var(--glow);animation:bounce 1.4s infinite}
.s2 li.run .nd:after{content:"";position:absolute;left:3px;top:3px;width:10px;height:10px;box-shadow:inset 0 0 0 1.5px var(--cy);opacity:0;animation:ring 1.4s infinite}
.lt .s2 li.run .nd:before{box-shadow:inset 0 0 0 1px var(--blk-ln)}
.lt .s2 li.run .nd:after{box-shadow:inset 0 0 0 1.5px var(--blk-ln)}
.s2 li.todo .nd:before{content:"";width:10px;height:10px;box-shadow:inset 0 0 0 1.5px var(--line2)}
.s2 li.run .sweep{opacity:1;animation:scanx 2.8s cubic-bezier(.45,0,.55,1) infinite}
.s2 .out2{position:absolute;left:40px;right:14px;top:190px;padding-left:12px;font-family:${MONO};font-size:11.5px;line-height:1.8;color:var(--tx2);white-space:nowrap;overflow:hidden;background:linear-gradient(var(--cy) 50%,transparent 0) 0 0/2px 4px repeat-y}
.s2 .out2 .o3{color:var(--tx)}
.s2 .tg{position:absolute;right:14px;bottom:12px;display:flex;gap:6px;font-family:${MONO};font-size:10.5px;color:var(--tx3)}

/* ===== 3 停下来问你 ===== */
.s3 .hd2{position:absolute;left:14px;right:14px;top:14px;display:flex;align-items:center;gap:10px;font-family:${MONO};font-size:13px}
.s3 .hd2 b{font-weight:500;flex:1}
.s3 .hd2 .px{color:var(--warn)}
.s3 .blocks{top:48px}
.s3 .blocks i.f{animation:none}
.s3 .blocks i.h{background:var(--warn);box-shadow:none;animation:s3h ${T} infinite steps(1)}
@keyframes s3h{0%,9%{background:var(--cy);opacity:1}10%,13%{background:var(--warn);opacity:0}14%,100%{background:var(--warn);opacity:1}}
.s3 .card{position:absolute;left:14px;right:14px;top:78px;bottom:14px;padding:12px 14px}
.s3 .card .e{position:absolute;background:var(--warn)}
.s3 .card .et{left:0;top:0;width:100%;height:2px;transform-origin:left;animation:s3et ${T} infinite steps(8,end)}
.s3 .card .er{right:0;top:0;width:2px;height:100%;transform-origin:top;animation:s3er ${T} infinite steps(5,end)}
.s3 .card .eb{right:0;bottom:0;width:100%;height:2px;transform-origin:right;animation:s3eb ${T} infinite steps(8,end)}
.s3 .card .el{left:0;bottom:0;width:2px;height:100%;transform-origin:bottom;animation:s3el ${T} infinite steps(5,end)}
@keyframes s3et{0%,12%{transform:scaleX(0)}20%,100%{transform:scaleX(1)}}
@keyframes s3er{0%,20%{transform:scaleY(0)}25%,100%{transform:scaleY(1)}}
@keyframes s3eb{0%,25%{transform:scaleX(0)}33%,100%{transform:scaleX(1)}}
@keyframes s3el{0%,33%{transform:scaleY(0)}38%,100%{transform:scaleY(1)}}
.s3 .card .in{position:relative;height:100%;animation:s3in ${T} infinite steps(6,end)}
@keyframes s3in{0%,38%{clip-path:inset(0 0 100% 0)}48%,100%{clip-path:inset(0 0 0 0)}}
.s3 .card .bandv{position:absolute;left:0;right:0;height:14px;background:radial-gradient(circle,var(--warn) 1.2px,transparent 1.7px) 0 0/5px 5px;opacity:0;animation:s3bv ${T} infinite steps(6,end)}
@keyframes s3bv{0%,37.9%{top:0;opacity:0}38%{top:0;opacity:1}47.9%{top:calc(100% - 14px);opacity:1}48%,100%{opacity:0}}
.s3 .ah3{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.s3 .aq{width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:var(--warn);color:var(--pane);animation:s3q 1.6s steps(1) infinite}
@keyframes s3q{50%{opacity:.35}}
.s3 .ah3 b{font-size:13px;font-weight:600}
.s3 .q3{font-size:13px;font-weight:600;margin-bottom:6px}
.s3 .op{display:flex;align-items:center;gap:8px;height:26px;padding:0 8px;font-size:12px;color:var(--tx2)}
.s3 .op i{width:12px;height:12px;box-shadow:inset 0 0 0 2px var(--line2)}
.s3 .op.on{background:var(--cy-soft);color:var(--tx)}
.s3 .op.on i{box-shadow:inset 0 0 0 2px var(--cy);background:radial-gradient(var(--cy) 0 3px,transparent 3.5px)}
.lt .s3 .op.on i{box-shadow:inset 0 0 0 2px var(--tx);background:radial-gradient(var(--tx) 0 3px,transparent 3.5px)}
.s3 .card .sweep{animation:sweep3 ${T} infinite}
@keyframes sweep3{0%,49%{left:-80px;opacity:0}50%{opacity:1}64%{left:100%;opacity:1}65%,100%{left:100%;opacity:0}}

/* ===== 4 完成 ===== */
.s4 .blocks{top:18px}
.s4 .blocks i{animation:none}
.s4 .blocks i.lat{background:var(--cy);box-shadow:inset 0 0 0 1px var(--blk-ln);animation:s4fill ${T} infinite steps(1)}
.dk .s4 .blocks i.lat,.dk .s4 .blocks i.f{box-shadow:0 0 6px rgba(0,229,255,.45)}
@keyframes s4fill{0%{background:var(--off);box-shadow:none}100%{background:var(--cy)}}
.s4 .blocks{animation:s4flash ${T} infinite steps(1)}
@keyframes s4flash{0%,29%{filter:none}30%,32%{filter:brightness(1.6)}33%,35%{filter:none}36%,38%{filter:brightness(1.6)}39%,100%{filter:none}}
.s4 .bm{position:absolute;left:14px;right:14px;top:36px;display:flex;justify-content:space-between;font-family:${MONO};font-size:11px;color:var(--tx3)}
.s4 .sum4{position:absolute;left:14px;right:14px;top:72px;height:96px;display:flex;align-items:center;gap:14px;padding:0 16px;background:var(--pane2);clip-path:var(--clip)}
.s4 .dck i.on{animation:s4dot ${T} infinite steps(1) both}
@keyframes s4dot{0%,34%{opacity:0}35%,100%{opacity:1}}
.s4 .tx4 b{display:block;font-size:15px;font-weight:600}
.s4 .tx4 span{font-size:12px;color:var(--tx2)}
.s4 .n4{margin-left:auto;display:flex;gap:10px;font-family:${DOTS};font-weight:900;font-size:24px;line-height:1}
.s4 .n4 .a{color:var(--ok)}.s4 .n4 .d{color:var(--bad)}
.s4 .tx4,.s4 .n4{animation:s4t ${T} infinite steps(1)}
@keyframes s4t{0%,44%{opacity:0}45%,47%{opacity:1}48%,49%{opacity:.25}50%,100%{opacity:1}}
.s4 .sum4 .sweep{animation:sweep4 ${T} infinite}
@keyframes sweep4{0%,54%{left:-80px;opacity:0}55%{opacity:1}68%{left:100%;opacity:1}69%,100%{left:100%;opacity:0}}
.s4 .ver{position:absolute;left:14px;right:14px;top:184px;display:flex;flex-direction:column;gap:4px;font-family:${MONO};font-size:12px;color:var(--tx2)}
.s4 .ver p{display:flex;align-items:center;gap:8px}
.s4 .ver .px{color:var(--ok)}
.s4 .ver p{animation:s4v ${T} infinite steps(1)}
.s4 .ver p:nth-child(2){animation-name:s4v2}
@keyframes s4v{0%,57%{opacity:0}58%,100%{opacity:1}}
@keyframes s4v2{0%,61%{opacity:0}62%,100%{opacity:1}}

/* ===== 5 撤销 ===== */
.s5 .hd5{position:absolute;left:14px;right:14px;top:14px;display:flex;align-items:baseline;gap:8px;font-family:${DOTS};font-weight:900}
.s5 .roll{position:relative;display:inline-block;height:34px;overflow:hidden;font-size:34px;line-height:34px}
.s5 .roll span{display:block;transform:translateY(-136px);animation:s5roll ${T} infinite steps(4,end)}
@keyframes s5roll{0%,14%{transform:translateY(0)}46%,100%{transform:translateY(-136px)}}
.s5 .hd5 .u{font-family:${MONO};font-weight:400;font-size:12px;color:var(--tx2)}
.s5 .f5{position:absolute;left:14px;right:14px;top:60px;display:flex;flex-direction:column;gap:4px}
.s5 .f5 li{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:8px;align-items:center;height:26px;padding:0 8px;font-family:${MONO};font-size:12px;background:var(--pane2);clip-path:inset(0 0 0 100%);animation:s5f ${T} infinite steps(6,end)}
.s5 .f5 li .px{color:var(--tx3)}
.s5 .f5 li em{font-size:11px;color:var(--tx3)}
.s5 .f5 li:nth-child(2){animation-name:s5f2}.s5 .f5 li:nth-child(3){animation-name:s5f3}.s5 .f5 li:nth-child(4){animation-name:s5f4}
@keyframes s5f{0%,14%{clip-path:inset(0 0 0 0)}22%,100%{clip-path:inset(0 100% 0 0)}}
@keyframes s5f2{0%,22%{clip-path:inset(0 0 0 0)}30%,100%{clip-path:inset(0 100% 0 0)}}
@keyframes s5f3{0%,30%{clip-path:inset(0 0 0 0)}38%,100%{clip-path:inset(0 100% 0 0)}}
@keyframes s5f4{0%,38%{clip-path:inset(0 0 0 0)}46%,100%{clip-path:inset(0 100% 0 0)}}
.s5 .blocks{top:194px}
.s5 .blocks i{animation:none}
.s5 .blocks i.lof{background:var(--off);box-shadow:none;animation:s5off ${T} infinite steps(1)}
@keyframes s5off{0%{background:var(--cy)}100%{background:var(--off)}}
.s5 .back{position:absolute;left:14px;right:14px;top:220px;display:flex;align-items:center;gap:10px;height:40px;padding:0 12px;font-size:13px;font-weight:600;background:var(--pane2);clip-path:var(--clip2);overflow:hidden}
.s5 .back .px{color:var(--cy-tx)}
.s5 .back .in5{display:flex;align-items:center;gap:10px;animation:s5b ${T} infinite steps(8,end)}
@keyframes s5b{0%,66%{clip-path:inset(0 0 0 100%)}76%,100%{clip-path:inset(0 0 0 0)}}
.s5 .back .note5{margin-left:auto;font-family:${MONO};font-size:11px;color:var(--tx3);font-weight:400}
.s5 .rsweep{position:absolute;top:0;bottom:0;right:-80px;width:76px;pointer-events:none;background:linear-gradient(270deg,transparent,var(--cy-scan) 78%,var(--cy) 97%,transparent);opacity:0;animation:s5sw ${T} infinite}
@keyframes s5sw{0%,52%{right:-80px;opacity:0}53%{opacity:1}66%{right:100%;opacity:1}67%,100%{right:100%;opacity:0}}

/* ===== 节奏表 ===== */
.rules{flex:1;min-height:0;padding:10px 14px;background:var(--pane);box-shadow:inset 0 0 0 1px var(--line);clip-path:var(--clip);display:flex;flex-direction:column;gap:8px;font-size:11.5px}
.rt{display:grid;grid-template-columns:34px minmax(0,1.6fr) minmax(0,.75fr) minmax(0,.85fr);gap:5px 10px;align-items:start}
.rt span{color:var(--tx2);line-height:1.45}
.rt .h{font-family:${MONO};font-size:11px;color:var(--tx3)}
.rt b{font-weight:600;color:var(--tx)}
.rt .no{color:var(--tx3)}
.rn{margin-top:auto;padding-top:8px;border-top:1px dotted var(--line2);display:flex;flex-direction:column;gap:3px;color:var(--tx2)}
.rn p{display:flex;gap:6px}
.rn p:before{content:"";width:5px;height:5px;margin-top:6px;background:var(--cy);flex:none}
.lt .rn p:before{background:var(--tx)}
@media (prefers-reduced-motion:reduce){.s1 .nw .band,.s1 .cmp .dz,.s1 .pkt,.s3 .bandv{display:none}}
`;

function s1() {
  return `<div class="stg s1">
  <div class="old"><div class="rowx o1">${px('check')}<b>修 Diff 里的中文乱码</b><em>09:12</em></div><div class="rowx o2">${px('check')}<b>导出加一个 Markdown 选项</b><em>昨天</em></div></div>
  <div class="rowx nw">${twinkle()}<b>把设置合成一个面板</b><em>Muse → Grok</em><i class="band"></i><i class="sweep"></i></div>
  <span class="pkt"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
  <div class="cmp"><span class="pr">›</span><span class="tx">把设置合成一个面板</span><span class="dz"><i class="band"></i></span><span class="snd">${px('send')}</span></div>
</div>`;
}

function s2() {
  return `<div class="stg s2">
  <div class="hd2">${twinkle()}<b>Grok 跑 pnpm check</b><span class="clk">{{clock}}</span></div>
  ${blocks(20, 12)}
  <p class="bm"><span>第 3 步，共 4 步</span><span>62%</span></p>
  <ol class="st2">
    <li class="ok"><span class="nd">${px('check')}</span><span>Muse 写规范</span><span class="tm">48s</span></li>
    <li class="ok"><span class="nd">${px('check')}</span><span>Grok 改 3 个文件</span><span class="tm">1:02</span></li>
    <li class="run"><span class="nd"></span><span>Grok 跑 pnpm check</span><span class="tm">{{clock}}</span><i class="sweep scan-fx"></i></li>
  </ol>
  <div class="out2"><div>&gt; tsc --noEmit</div><div>SettingsSheet.tsx:41  类型不对</div><div class="o3">→ 改 SettingsProps，再跑一遍<i class="caret"></i></div></div>
</div>`;
}

function s3() {
  return `<div class="stg s3">
  <div class="hd2">${px('ask')}<b>Grok 停下来问你</b><span class="clk w">01:12</span></div>
  ${blocks(20, 12)}
  <div class="card"><i class="e et"></i><i class="e er"></i><i class="e eb"></i><i class="e el"></i>
    <div class="in">
      <div class="ah3"><span class="aq">${px('ask')}</span><b>3 个问题</b></div>
      <p class="q3">Tailwind 要不要一起升到 4.1？</p>
      <p class="op on"><i></i>一起升（推荐）</p><p class="op"><i></i>先不升</p><p class="op"><i></i>其他…</p>
    </div>
    <i class="bandv"></i><i class="sweep"></i>
  </div>
</div>`;
}

function s4() {
  const bl = `<div class="blocks">${Array.from({ length: 20 }, (_, i) => (i < 12 ? '<i class="f"></i>' : `<i class="lat" style="animation-name:s4fill${i}"></i>`)).join('')}</div>`;
  const kf = Array.from({ length: 8 }, (_, k) => { const at = 12 + k * 2; return `@keyframes s4fill${k + 12}{0%,${at}%{background:var(--off);box-shadow:none}${at + 1}%,100%{background:var(--cy)}}`; }).join('\n');
  return { html: `<div class="stg s4">
  ${bl}
  <p class="bm"><span>4 步都做完了</span><span>03:41</span></p>
  <div class="sum4">${dotCheck()}<div class="tx4"><b>做完了</b><span>4 个文件 · 检查通过</span></div><p class="n4"><span class="a">+86</span><span class="d">−132</span></p><i class="sweep"></i></div>
  <div class="ver"><p>${px('check')}pnpm check 通过</p><p>${px('check')}pnpm test · 41 项通过</p></div>
</div>`, kf };
}

function s5() {
  const bl = `<div class="blocks">${Array.from({ length: 20 }, (_, i) => (i < 12 ? `<i class="lof" style="animation-name:s5off${i}"></i>` : '<i></i>')).join('')}</div>`;
  const kf = Array.from({ length: 12 }, (_, i) => { const at = 14 + (11 - i) * 3; return `@keyframes s5off${i}{0%,${at}%{background:var(--cy)}${at + 1}%,100%{background:var(--off)}}`; }).join('\n');
  return { html: `<div class="stg s5">
  <div class="hd5"><span class="roll" data-nolint=""><span>4<br>3<br>2<br>1<br>0</span></span><span class="u">个文件改动</span></div>
  <ul class="f5">
    <li>${px('file')}<span>SettingsSheet.tsx</span><em>删掉新建的</em></li>
    <li>${px('file')}<span>Composer.tsx</span><em>改回去</em></li>
    <li>${px('file')}<span>App.tsx</span><em>改回去</em></li>
    <li>${px('file')}<span>AgentsDialog.tsx</span><em>放回来</em></li>
  </ul>
  ${bl}
  <div class="back"><span class="in5">${px('undo')}已回到 14:02 开始前的样子</span><span class="note5">你的 Git 没动</span></div>
  <i class="rsweep"></i>
</div>`, kf };
}

function rules() {
  const R = [
    ['发出', '字散成点跳到列表；新任务一格格拼出来，旧的按格下移', '—', '拼好扫一次'],
    ['在跑', '进度块呼吸、头一格闪；3×3 点阵转圈', '当前那步的方块弹', '每 2.8 秒扫一次'],
    ['等你', '头一格变琥珀；卡片的边一格格点亮', '—', '卡片出来扫一次'],
    ['完成', '剩下的块补满、闪两下；勾一颗颗亮', '—', '总结卡扫一次'],
    ['撤销', '文件一行行收掉；数字倒跳；块倒着灭', '—', '反向扫一次'],
  ];
  const rows = R.map(([a, b, c, d]) => `<b>${a}</b><span>${b}</span><span class="${c === '—' ? 'no' : ''}">${c}</span><span>${d}</span>`).join('');
  return `<div class="rules"><div class="rt"><span class="h">时刻</span><span class="h">点阵 M4</span><span class="h">弹扣 M3</span><span class="h">扫描 M1</span>${rows}</div>
  <div class="rn"><p>位移按格子一跳一跳，不用平滑缓动；一次性动作 0.8 秒内做完</p><p>同一时刻只有一道扫描；弹扣只给正在跑的那一步</p><p>减弱动态效果时只留最后的样子</p></div></div>`;
}

export function boards() {
  const def = FLIP ? '浅色' : '深色';
  const S4 = s4(), S5 = s5();
  const cell = (n, name, sub, us, inner) => `<div class="sc"><p class="sh"><b>${n} ${name}</b>${sub}<span class="u">${us.map((u) => `<i>${u}</i>`).join('')}</span></p>${inner}</div>`;
  const body = `<div class="{{root}}">
  <div class="top"><h1>动效：点阵为主，弹扣和扫描做点缀</h1><div class="lg"><span><i class="m4"></i><b>M4 点阵</b>出现、消失、进度</span><span><i class="m3"></i><b>M3 弹扣</b>只给在跑的那一步</span><span><i class="m1"></i><b>M1 扫描</b>关键时刻扫一次</span></div></div>
  <div class="g6">
    ${cell(1, '发出一句话', '输入框 → 任务列表', ['M4', 'M1'], s1())}
    ${cell(2, '在跑', '当前这一步', ['M4', 'M3', 'M1'], s2())}
    ${cell(3, '停下来问你', 'ASK 卡片出来', ['M4', 'M1'], s3())}
    ${cell(4, '完成', '总结卡', ['M4', 'M1'], S4.html)}
    ${cell(5, '撤销', '整个任务退回去', ['M4', 'M1'], S5.html)}
    <div class="sc"><p class="sh"><b>节奏表</b>每种动效管什么</p>${rules()}</div>
  </div>
</div>`;
  const logic = `
  constructor(p) { super(p); this.state = { t: 134 }; }
  componentDidMount() { this.iv = setInterval(() => this.setState({ t: this.state.t + 1 }), 1000); }
  componentWillUnmount() { clearInterval(this.iv); }
  renderVals() {
    const t = this.state.t, dark = (this.props.theme ?? '${def}') === '深色';
    return { root: 'pk mo ' + (dark ? 'dk' : 'lt'), clock: String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0') };
  }`;
  const css = `${KIT}\n${themeCss('pk')}\n${CSS}\n${S4.kf}\n${S5.kf}\n.s4 .blocks i.lat{animation-duration:${T};animation-iteration-count:infinite;animation-timing-function:steps(1)}\n.s5 .blocks i.lof{animation-duration:${T};animation-iteration-count:infinite;animation-timing-function:steps(1)}`;
  const html = board({ title: '动效融合 · 点阵为主', css, body, props: themeProp(def), logic });
  return [{ file: 'S1b-Motion.dc.html', x: 1360, y: 920, title: '动效融合 · M4 为主，M3、M1 点缀', html }];
}
