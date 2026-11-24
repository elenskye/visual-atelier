// 第 1 步 · 三个方向：同一套内容（项目、正在做、改动、ASK、控件、输入框），各用自己的图形语言。
// A 精密仪器（点阵网格、刻度、信号线、LED、读数）
// B 冷白编辑（冰白、无边框、大号数字、青色荧光笔）
// C 点阵终端（纯黑、点阵数字、方块进度、方括号）
import { board, themeProp, clockLogic, rng, C, SANS, MONO, DOTS } from './common.mjs';

const FLIP = !!process.env.FLIP;
const DIRS = {
  A: { name: 'A · 精密仪器', kw: '仪器面板 · 刻度 · 信号线 · LED 读数', def: '深色' },
  B: { name: 'B · 冷白编辑', kw: '冰白纸面 · 大号数字 · 青色荧光笔 · 没有边框', def: '浅色' },
  C: { name: 'C · 点阵终端', kw: '纯黑 · 点阵数字 · 方块进度 · 方括号', def: '深色' },
};

// ---------- 颜色（每个方向明暗各一套） ----------
const VARS = {
  A: {
    dk: '--bg:#06080B;--grid:rgba(120,165,185,.10);--mod:#0B0F14;--mod2:#10161C;--line:#1A222A;--line2:#2B3742;--tx:#E6EFF3;--tx2:#90A1AB;--tx3:#5F707B;--cy:#00E5FF;--cy-tx:#00E5FF;--on-cy:#001A1F;--cy-soft:rgba(0,229,255,.09);--ok:#3DDC97;--bad:#FF5C6C;--warn:#FFB547;--muse:#B79DFF;--grok:#FFB547;--api:#5BB2FF;--glow:0 0 0 1px rgba(0,229,255,.4),0 0 12px rgba(0,229,255,.55);--tglow:0 0 14px rgba(0,229,255,.45);--wglow:drop-shadow(0 0 4px rgba(0,229,255,.75));--da:rgba(61,220,151,.10);--dd:rgba(255,92,108,.10)',
    lt: '--bg:#E7EBED;--grid:rgba(25,45,55,.13);--mod:#F7F9FA;--mod2:#EDF1F3;--line:#D2DADE;--line2:#AFBCC3;--tx:#091317;--tx2:#4B5C64;--tx3:#76868E;--cy:#00E5FF;--cy-tx:#091317;--on-cy:#001A1F;--cy-soft:rgba(0,229,255,.18);--ok:#119E66;--bad:#DC3046;--warn:#B87400;--muse:#7556EE;--grok:#B87400;--api:#2575D4;--glow:0 0 0 1px #091317;--tglow:none;--wglow:none;--da:rgba(17,158,102,.10);--dd:rgba(220,48,70,.09)',
  },
  B: {
    lt: '--bg:#F2F6F7;--card:#FFFFFF;--sunk:#EDF2F4;--line:#E3E9EC;--tx:#0A1013;--tx2:#55626A;--tx3:#8A979D;--cy:#00E5FF;--on-cy:#00181C;--ok:#0F9F68;--ok-t:#DBF5E9;--bad:#DE3448;--bad-t:#FFE6E9;--warn:#A86800;--warn-t:#FFF1D1;--muse:#6A4DE0;--muse-t:#EEEAFF;--grok:#A86800;--grok-t:#FFF1D1;--api:#1E66C6;--api-t:#E2EEFF;--inv:#0A1013;--inv-tx:#F2F6F7;--inv-tx2:#93A1A8;--shadow:0 1px 2px rgba(14,30,38,.05),0 12px 32px rgba(14,30,38,.07);--da:#E6F8EF;--dd:#FFEEF0',
    dk: '--bg:#080B0D;--card:#11161A;--sunk:#182025;--line:#1D262B;--tx:#EEF4F6;--tx2:#94A3AA;--tx3:#62717A;--cy:#00E5FF;--on-cy:#00181C;--ok:#45E0A0;--ok-t:#0F2A20;--bad:#FF6676;--bad-t:#341419;--warn:#FFC864;--warn-t:#30250F;--muse:#BCA9FF;--muse-t:#211B3A;--grok:#FFC864;--grok-t:#30250F;--api:#7DB9FF;--api-t:#122339;--inv:#EEF4F6;--inv-tx:#0A1013;--inv-tx2:#55626A;--shadow:0 0 0 1px #1D262B;--da:rgba(69,224,160,.10);--dd:rgba(255,102,118,.10)',
  },
  C: {
    dk: '--bg:#020303;--pane:#060809;--line:#161B1D;--line2:#2B3235;--tx:#E7EFF0;--tx2:#82908F;--tx3:#505C5E;--cy:#00E5FF;--cy-tx:#00E5FF;--on-cy:#001316;--ok:#A8FF4F;--bad:#FF4F6D;--warn:#FFC24D;--muse:#C5A9FF;--grok:#FFC24D;--api:#6CC5FF;--scan:rgba(255,255,255,.018);--tglow:0 0 16px rgba(0,229,255,.55),0 0 2px rgba(0,229,255,.9);--bglow:0 0 8px rgba(0,229,255,.6);--blk-ln:transparent;--da:transparent;--dd:transparent',
    lt: '--bg:#EBEEED;--pane:#F7F9F8;--line:#D1D7D5;--line2:#A9B3B0;--tx:#040606;--tx2:#495453;--tx3:#7A8584;--cy:#00E5FF;--cy-tx:#040606;--on-cy:#001316;--ok:#2B8C10;--bad:#D42B4A;--warn:#A06400;--muse:#6E4EE0;--grok:#A06400;--api:#2266C2;--scan:rgba(0,0,0,.014);--tglow:none;--bglow:none;--blk-ln:#040606;--da:transparent;--dd:transparent',
  },
};

// ---------- 结构（三个方向共用） ----------
const BASE = `
.pk{position:relative;width:1280px;height:800px;overflow:hidden;box-sizing:border-box;padding:28px 36px 36px;font-family:${SANS};font-size:14px;line-height:1.55;color:var(--tx);background:var(--bg);-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.pk *{box-sizing:border-box}
.pk p,.pk h2,.pk ul,.pk ol{margin:0;padding:0}
.pk ul,.pk ol{list-style:none}
.pk button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;padding:0}
.pk i,.pk em{font-style:normal}
.pk .btn{padding:0 14px}
.hd{position:relative;z-index:1;height:44px;display:flex;align-items:center;gap:18px;margin-bottom:20px}
.brand{display:flex;align-items:center;gap:10px;white-space:nowrap}
.dirname{font-size:13px;color:var(--tx2);white-space:nowrap}
.kw{font-size:12.5px;color:var(--tx3);white-space:nowrap}
.hd .seg{margin-left:auto}
.grid{position:relative;z-index:1;display:grid;grid-template-columns:300px minmax(0,1fr) 340px;gap:20px;height:672px}
.col{display:flex;flex-direction:column;gap:20px;min-height:0;min-width:0}
.mod{position:relative;min-width:0}
.proj{flex:none}.ctl{flex:1 1 0}.task{flex:1 1 0;min-height:0}.comp{flex:none}.chg{flex:1 1 0}.ask{flex:none}
.prow{display:grid;grid-template-columns:14px minmax(0,1fr) auto;gap:10px;align-items:start}
.prow b{display:block;font-weight:600;white-space:nowrap}
.prow span{display:block;font-size:12.5px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prow em{font-style:normal;font-size:12px;color:var(--tx3)}
.ttl{font-size:17px;font-weight:600;line-height:1.35}
.meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:6px;font-size:12.5px;color:var(--tx2)}
.who{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.who .arr{font-style:normal;color:var(--tx3)}
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;flex:none}
.dot.muse{background:var(--muse)}.dot.grok{background:var(--grok)}.dot.api{background:var(--api)}
.sl{display:flex;align-items:baseline;gap:10px;min-width:0}
.sl b{font-weight:500;flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tm{flex:none;font-family:${MONO};font-size:12px;color:var(--tx3)}
.sx{font-size:12.5px;color:var(--tx2);margin-top:1px}
.out{margin-top:8px;font-family:${MONO};font-size:12px;line-height:1.75;white-space:nowrap;overflow:hidden}
.out div{overflow:hidden;text-overflow:ellipsis}
.cur{display:inline-block;width:7px;height:13px;background:var(--cy);vertical-align:-2px;margin-left:4px;animation:blink 1.05s steps(1) infinite}
.files li{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:8px;align-items:center}
.fp{font-family:${MONO};font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fa{font-family:${MONO};font-size:12px;color:var(--ok);min-width:28px;text-align:right}
.fd{font-family:${MONO};font-size:12px;color:var(--bad);min-width:32px;text-align:right}
.tag{font-style:normal;font-size:11px;line-height:18px;padding:0 6px;border-radius:4px;white-space:nowrap}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 14px;font-size:13px;font-weight:500;white-space:nowrap}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;font-size:12.5px;white-space:nowrap}
.tg{display:flex;align-items:center;gap:10px;font-size:13px}
.tgt{position:relative;width:34px;height:20px;flex:none}
.tgt i{position:absolute;top:3px;left:17px;width:14px;height:14px}
.seg,.seg3{display:inline-flex}
.seg3{width:100%}
.seg3 button{flex:1 1 0}
.field{display:flex;align-items:center;height:38px;padding:0 12px;font-size:13px;color:var(--tx3)}
.caret{display:inline-block;width:1.5px;height:16px;background:var(--cy);margin-left:2px;animation:blink 1.05s steps(1) infinite}
.cin{font-size:13.5px;color:var(--tx3)}
.crow{display:flex;align-items:center;gap:8px}
.crow .sp{flex:1}
.kbd{font-family:${MONO};font-size:11.5px;color:var(--tx3)}
.ctl .stack{display:flex;flex-direction:column;gap:14px}
.ctl .lbl{font-size:12px;color:var(--tx3);margin-bottom:6px}
.note{font-size:12px;color:var(--tx3)}
.diff{margin-top:12px;font-family:${MONO};font-size:11.5px;line-height:19px;overflow:hidden}
.diff .dh{display:flex;justify-content:space-between;color:var(--tx3);font-size:11px;padding:0 0 4px}
.diff .ln{display:grid;grid-template-columns:28px 14px minmax(0,1fr);white-space:nowrap}
.diff .ln span{overflow:hidden;text-overflow:ellipsis}
.diff .n{color:var(--tx3);text-align:right;padding-right:8px}
.diff .ln.a{background:var(--da);}.diff .ln.d{background:var(--dd)}
.diff .ln.a .m{color:var(--ok)}.diff .ln.d .m{color:var(--bad)}
.budget .bt{display:flex;justify-content:space-between;align-items:baseline;font-size:12px;color:var(--tx3);margin-bottom:6px}
.budget .bt b{font-family:${MONO};font-weight:500;font-size:12.5px;color:var(--tx)}
.bar{position:relative;height:8px;overflow:hidden}
.bar i{position:absolute;left:0;top:0;bottom:0;width:16%}
.q{font-size:15px;font-weight:600;line-height:1.4}
.qd{font-size:12.5px;margin-top:4px}
.acts{display:flex;gap:8px;margin-top:14px}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.pk *,.pk *:before,.pk *:after{animation:none!important;transition:none!important}}
`;

// ---------- A 精密仪器 ----------
const SKIN_A = `
.A{background-image:radial-gradient(circle at 1px 1px,var(--grid) 1px,transparent 1.5px);background-size:16px 16px;background-position:-1px -1px}
.A .brand b{font-family:${MONO};font-weight:600;font-size:15px;letter-spacing:.24em}
.A .led{width:9px;height:9px;border-radius:2px;background:var(--cy);box-shadow:var(--glow)}
.A .dirname{font-family:${MONO};font-size:12px;letter-spacing:.06em;padding-left:14px;border-left:1px solid var(--line2)}
.A .mod{background:var(--mod);border:1px solid var(--line);border-radius:10px;padding:14px 18px 16px}
.A .tk{position:absolute;width:8px;height:8px;border:0 solid var(--line2)}
.A .tk.tl{left:-6px;top:-6px;border-left-width:1px;border-top-width:1px}
.A .tk.tr{right:-6px;top:-6px;border-right-width:1px;border-top-width:1px}
.A .tk.bl{left:-6px;bottom:-6px;border-left-width:1px;border-bottom-width:1px}
.A .tk.br{right:-6px;bottom:-6px;border-right-width:1px;border-bottom-width:1px}
.A .task .tk{border-color:var(--cy)}
.A .mlabel{display:flex;align-items:center;gap:10px;font-family:${MONO};font-size:10.5px;letter-spacing:.16em;color:var(--tx3);margin-bottom:12px;white-space:nowrap}
.A .mlabel:after{content:"";flex:1;height:1px;background:var(--line)}
.A .mlabel .r{order:2;color:var(--tx3)}
.A .seg{border:1px solid var(--line2);border-radius:8px;padding:3px;gap:2px;background:var(--mod)}
.A .seg button{height:28px;padding:0 12px;border-radius:5px;font-size:12.5px;color:var(--tx2);display:flex;align-items:center;gap:7px}
.A .seg button i{width:6px;height:6px;border-radius:50%;background:var(--line2)}
.A .seg button.on{background:var(--mod2);color:var(--tx)}
.A .seg button.on i{background:var(--cy);box-shadow:var(--glow)}
.A .plist{display:flex;flex-direction:column}
.A .prow{padding:10px 0;border-top:1px dashed var(--line)}
.A .prow:first-child{border-top:0;padding-top:2px}
.A .prow .st{width:8px;height:8px;border-radius:2px;margin-top:7px;background:var(--ok)}
.A .prow .st.run{background:var(--cy);box-shadow:var(--glow);animation:led 1.8s ease-in-out infinite}
.A .prow em{font-family:${MONO}}
.A .ttl{padding-right:150px}
.A .readout{position:absolute;right:18px;top:40px;text-align:right}
.A .rl{display:block;font-family:${MONO};font-size:10px;letter-spacing:.16em;color:var(--tx3)}
.A .rv{display:block;font-family:${MONO};font-size:30px;font-weight:500;line-height:1.1;color:var(--cy-tx);text-shadow:var(--tglow)}
.A .trace{position:relative;height:56px;margin:14px -18px 6px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden;background-image:linear-gradient(90deg,var(--line) 1px,transparent 1px),linear-gradient(var(--line) 1px,transparent 1px);background-size:40px 100%,100% 14px;background-position:17px 0,0 13px}
.A .trace svg{position:absolute;left:0;top:0;width:1040px;height:56px;animation:trace 6s linear infinite}
.A .wave{fill:none;stroke:var(--cy);stroke-width:1.6;stroke-linejoin:round;filter:var(--wglow)}
.A.lt .wave{stroke:#00B5CC}
.A .trace .tl2{position:absolute;left:18px;top:5px;font-family:${MONO};font-size:9.5px;letter-spacing:.16em;color:var(--tx3);background:var(--mod);padding:0 4px}
.A .trace .tr2{position:absolute;right:18px;top:5px;font-family:${MONO};font-size:9.5px;letter-spacing:.12em;color:var(--cy-tx);background:var(--mod);padding:0 4px}
.A .step{display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px;padding:9px 0;border-bottom:1px dashed var(--line)}
.A .step:last-child{border-bottom:0}
.A .sd{width:8px;height:8px;border-radius:2px;margin-top:7px;border:1px solid var(--line2)}
.A .step.ok .sd{background:var(--ok);border-color:var(--ok)}
.A .step.run .sd{background:var(--cy);border-color:var(--cy);box-shadow:var(--glow);animation:led 1.8s ease-in-out infinite}
.A .step.todo{color:var(--tx3)}
.A .step.run .tm{color:var(--cy-tx)}
.A .out{background:var(--mod2);border:1px solid var(--line);border-radius:6px;padding:7px 10px;color:var(--tx2)}
.A .out .o3{color:var(--tx)}
.A .sum{display:flex;align-items:baseline;gap:8px;margin-bottom:12px}
.A .sum b{font-family:${MONO};font-size:28px;font-weight:500;line-height:1}
.A .sum .u{font-size:12.5px;color:var(--tx2);margin-right:auto}
.A .sum .plus,.A .sum .minus{font-family:${MONO};font-size:15px}
.A .sum .plus{color:var(--ok)}.A .sum .minus{color:var(--bad)}
.A .files li{padding:9px 0;border-top:1px dashed var(--line);grid-template-columns:minmax(0,1fr) auto 40px}
.A .files .nums{display:flex;gap:8px}
.A .meter{display:flex;height:8px;gap:0;justify-content:flex-end}
.A .meter i{display:block;height:8px;-webkit-mask:repeating-linear-gradient(90deg,#000 0 3px,transparent 3px 5px);mask:repeating-linear-gradient(90deg,#000 0 3px,transparent 3px 5px)}
.A .meter .ma{background:var(--ok)}.A .meter .md{background:var(--bad)}
.A .tag{border:1px solid currentColor;line-height:16px;font-family:${MONO};font-size:10.5px}
.A .tag.new{color:var(--ok)}.A .tag.del{color:var(--bad)}
.A .btn{border-radius:6px;border:1px solid var(--line2);background:var(--mod2)}
.A .btn.pri{background:var(--cy);border-color:var(--cy);color:var(--on-cy);font-weight:600;box-shadow:var(--glow)}
.A.lt .btn.pri{box-shadow:none;border-color:#091317}
.A .btn.danger{color:var(--bad);border-color:var(--bad);background:transparent}
.A .btn.ghost{border-color:transparent;background:transparent;color:var(--tx2)}
.A .chg .btn.danger{width:100%;margin-top:14px}
.A .chg .note{margin-top:8px}
.A .chip{border:1px solid var(--line2);border-radius:6px;color:var(--tx2)}
.A .chip.on{border-color:var(--cy);color:var(--tx);background:var(--cy-soft)}
.A .tgt{border-radius:5px;background:var(--cy);box-shadow:var(--glow)}
.A.lt .tgt{box-shadow:inset 0 0 0 1px #091317}
.A .tgt i{border-radius:3px;background:var(--on-cy)}
.A .seg3{border:1px solid var(--line2);border-radius:6px;overflow:hidden}
.A .seg3 button{height:32px;font-size:12.5px;color:var(--tx2);border-left:1px solid var(--line2)}
.A .seg3 button:first-child{border-left:0}
.A .seg3 button.on{background:var(--cy-soft);color:var(--tx);box-shadow:inset 0 -2px 0 var(--cy)}
.A .field{border:1px solid var(--cy);border-radius:6px;background:var(--mod2);box-shadow:var(--glow);color:var(--tx)}
.A.lt .field{box-shadow:0 0 0 3px rgba(0,229,255,.35)}
.A .comp{padding:14px 16px 12px}
.A .comp .cin{padding:2px 2px 12px}
.A .comp .crow{border-top:1px dashed var(--line);padding-top:10px}
.A .ask{border-color:var(--warn)}
.A .ask .mlabel{color:var(--warn)}
.A .ask .mlabel:after{background:var(--warn);opacity:.35}
.A .ask .qd{color:var(--tx2)}
.A .diff{border:1px solid var(--line);border-radius:6px;background:var(--mod2);padding:6px 0 4px}
.A .diff .dh{padding:0 10px 4px;font-size:10px;letter-spacing:.14em}
.A .budget .bar{height:10px;background:var(--mod2);border:1px solid var(--line2);border-radius:3px}
.A .budget .bar i{background:var(--cy);box-shadow:var(--glow);-webkit-mask:repeating-linear-gradient(90deg,#000 0 3px,transparent 3px 5px);mask:repeating-linear-gradient(90deg,#000 0 3px,transparent 3px 5px)}
.A .budget .bar:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 calc(10% - 1px),var(--line2) calc(10% - 1px) 10%)}
.A .budget .bt{font-family:${MONO};font-size:10.5px;letter-spacing:.12em}
@keyframes trace{to{transform:translateX(-520px)}}
@keyframes led{50%{box-shadow:0 0 0 1px rgba(0,229,255,.25),0 0 3px rgba(0,229,255,.2);opacity:.7}}
`;

// ---------- B 冷白编辑 ----------
const SKIN_B = `
.B .brand b{font-size:21px;font-weight:700;letter-spacing:-.015em}
.B .brand .mk{display:inline-block;width:9px;height:20px;border-radius:2px;background:var(--cy);margin-left:-6px;animation:blink 1.05s steps(1) infinite}
.B .dirname{font-weight:600;color:var(--tx);padding-left:6px}
.B .seg{background:var(--sunk);border-radius:999px;padding:4px}
.B .seg button{height:30px;padding:0 16px;border-radius:999px;font-size:13px;color:var(--tx2)}
.B .seg button.on{background:var(--card);color:var(--tx);font-weight:600;box-shadow:0 1px 3px rgba(10,20,26,.12)}
.B.dk .seg button.on{background:var(--line)}
.B .seg button i{display:none}
.B .mod{background:var(--card);border-radius:20px;padding:20px 22px;box-shadow:var(--shadow)}
.B .mlabel{font-size:11.5px;font-weight:600;letter-spacing:.18em;color:var(--tx3);margin-bottom:14px;white-space:nowrap}
.B .mlabel .r{display:none}
.B .plist{display:flex;flex-direction:column;gap:14px}
.B .prow{grid-template-columns:minmax(0,1fr) auto;padding:0}
.B .prow .st{display:none}
.B .prow b{font-size:16px;letter-spacing:-.005em}
.B .prow.on b:after{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--cy);margin-left:8px;vertical-align:2px;animation:breathe 2.4s ease-in-out infinite}
.B .prow em{font-family:${MONO};color:var(--tx3)}
.B .ttl{font-size:23px;line-height:1.28;letter-spacing:-.01em;padding-right:140px}
.B .meta{margin-top:10px}
.B .who{background:var(--sunk);border-radius:999px;padding:3px 10px}
.B .readout{position:absolute;right:22px;top:18px;text-align:right}
.B .rl{display:block;font-size:12px;color:var(--tx3)}
.B .rv{display:block;font-size:46px;font-weight:600;line-height:1;letter-spacing:-.03em;margin-top:2px}
.B .steps{counter-reset:s;margin-top:18px}
.B .step{display:grid;grid-template-columns:34px minmax(0,1fr);gap:6px;padding:11px 0;border-top:1px solid var(--line)}
.B .sd{font-family:${MONO};font-size:12px;color:var(--tx3);padding-top:2px}
.B .sd:before{counter-increment:s;content:counter(s,decimal-leading-zero)}
.B .step.ok .sd{color:var(--ok)}
.B .step.todo .sl b{color:var(--tx3)}
.B .hl{position:relative;flex:none!important;overflow:visible!important;padding:1px 7px;margin-left:-7px;border-radius:4px;color:var(--on-cy);background:linear-gradient(var(--cy),var(--cy)) no-repeat 0 0/100% 100%;animation:wipe .7s cubic-bezier(.2,.8,.2,1) .3s both}
.B .hl:after{content:"";position:absolute;top:0;bottom:0;left:0;width:30px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);animation:sheen 3.2s ease-in-out 1.2s infinite;opacity:0}
.B .step.run .tm{color:var(--tx)}
.B .out{background:var(--sunk);border-radius:12px;padding:8px 12px;color:var(--tx2)}
.B .out .o3{color:var(--tx)}
.B .sum{display:flex;align-items:flex-end;gap:14px;margin-bottom:14px}
.B .sum b{font-size:46px;font-weight:600;line-height:.95;letter-spacing:-.03em}
.B .sum .u{font-size:13px;color:var(--tx2);margin-right:auto;padding-bottom:4px}
.B .sum .plus,.B .sum .minus{font-size:22px;font-weight:600;letter-spacing:-.02em;padding-bottom:1px}
.B .sum .plus{color:var(--ok)}.B .sum .minus{color:var(--bad)}
.B .files li{padding:10px 0;border-top:1px solid var(--line);grid-template-columns:minmax(0,1fr) auto}
.B .files .meter{display:none}
.B .files .nums{display:flex;gap:6px;align-items:center}
.B .tag.new{background:var(--ok-t);color:var(--ok)}.B .tag.del{background:var(--bad-t);color:var(--bad)}
.B .btn{border-radius:999px;background:var(--sunk);height:36px;padding:0 16px}
.B .btn.pri{background:var(--cy);color:var(--on-cy);font-weight:600}
.B .btn.danger{background:var(--bad-t);color:var(--bad)}
.B .btn.ghost{background:transparent;color:var(--tx2)}
.B .chg .btn.danger{margin-top:16px}
.B .chg .note{margin-top:8px}
.B .chip{border-radius:999px;background:var(--sunk);color:var(--tx2)}
.B .chip.on{background:var(--tx);color:var(--bg)}
.B .tgt{border-radius:999px;background:var(--tx)}
.B .tgt i{border-radius:50%;background:var(--cy)}
.B .seg3{background:var(--sunk);border-radius:999px;padding:4px}
.B .seg3 button{height:30px;border-radius:999px;font-size:12.5px;color:var(--tx2)}
.B .seg3 button.on{background:var(--card);color:var(--tx);font-weight:600;box-shadow:0 1px 3px rgba(10,20,26,.12)}
.B.dk .seg3 button.on{background:var(--line)}
.B .field{border-radius:12px;background:var(--card);box-shadow:inset 0 0 0 2px var(--tx),0 0 0 5px rgba(0,229,255,.45);color:var(--tx)}
.B .comp{padding:16px 18px 14px}
.B .comp .cin{padding:0 2px 14px;font-size:15px}
.B .ask{background:var(--inv);color:var(--inv-tx);box-shadow:none}
.B .ask .mlabel{color:var(--inv-tx2);display:flex;align-items:center;gap:8px}
.B .ask .qd{color:var(--inv-tx2)}
.B .ask .btn{background:rgba(128,128,128,.18);color:var(--inv-tx)}
.B .ask .btn.pri{background:var(--cy);color:var(--on-cy)}
.B .ask .btn.ghost{background:transparent;color:var(--inv-tx2)}
.B .ask .q{font-size:17px}
.B .chip .who{background:none;padding:0}
.B .files li{padding:9px 0}
.B .diff{border-radius:12px;background:var(--sunk);padding:8px 0 6px}
.B .diff .dh{padding:0 12px 4px}
.B .diff .ln{grid-template-columns:30px 14px minmax(0,1fr)}
.B .budget .bar{height:10px;border-radius:999px;background:var(--sunk)}
.B .budget .bar i{border-radius:999px;background:var(--cy)}
.B .budget .bt b{font-family:${SANS};font-weight:600;font-size:15px}
@keyframes wipe{from{background-size:0 100%;color:var(--tx)}to{background-size:100% 100%}}
@keyframes sheen{0%{left:-10%;opacity:0}10%{opacity:1}40%{left:100%;opacity:0}100%{left:100%;opacity:0}}
@keyframes breathe{50%{transform:scale(.6);opacity:.5}}
`;

// ---------- C 点阵终端 ----------
const SKIN_C = `
.C:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;background:repeating-linear-gradient(0deg,var(--scan) 0 1px,transparent 1px 3px)}
.C .brand b{font-family:${DOTS};font-weight:900;font-size:28px;letter-spacing:.08em;line-height:1}
.C .brand .mk{display:inline-block;width:12px;height:22px;background:var(--cy);box-shadow:var(--bglow);animation:blink 1.05s steps(1) infinite}
.C .dirname{font-family:${MONO};font-size:12px;padding-left:14px;border-left:1px solid var(--line2)}
.C .kw{font-family:${MONO};font-size:11.5px}
.C .seg{border:1px solid var(--line2);padding:3px;gap:3px}
.C .seg button{height:28px;padding:0 12px;font-family:${MONO};font-size:12px;color:var(--tx2);display:flex;align-items:center;gap:6px}
.C .seg button i{display:none}
.C .seg button.on{background:var(--cy);color:var(--on-cy);font-weight:600}
.C .mod{background:var(--pane);border:1px solid var(--line);border-radius:2px;padding:14px 18px 16px}
.C .tk{position:absolute;width:10px;height:10px;border:0 solid var(--line2)}
.C .tk.tl{left:-1px;top:-1px;border-left-width:2px;border-top-width:2px}
.C .tk.tr{right:-1px;top:-1px;border-right-width:2px;border-top-width:2px}
.C .tk.bl{left:-1px;bottom:-1px;border-left-width:2px;border-bottom-width:2px}
.C .tk.br{right:-1px;bottom:-1px;border-right-width:2px;border-bottom-width:2px}
.C .task .tk{border-color:var(--cy)}
.C .ask .tk{border-color:var(--warn)}
.C .mlabel{display:flex;justify-content:space-between;font-family:${MONO};font-size:11px;letter-spacing:.06em;color:var(--tx3);margin-bottom:12px;white-space:nowrap}
.C .mlabel .l:before{content:"[ "}.C .mlabel .l:after{content:" ]"}
.C .plist{display:flex;flex-direction:column}
.C .prow{padding:9px 0;border-top:1px dotted var(--line2);grid-template-columns:14px minmax(0,1fr) auto}
.C .prow:first-child{border-top:0;padding-top:2px}
.C .prow b{font-family:${MONO};font-weight:600;font-size:13.5px}
.C .prow .st{width:8px;height:8px;margin-top:6px;background:var(--ok)}
.C .prow .st.run{background:var(--cy);box-shadow:var(--bglow);animation:blink 1.05s steps(1) infinite}
.C .prow em{font-family:${DOTS};font-weight:900;font-size:20px;line-height:1;color:var(--tx2)}
.C .ttl{font-size:16px;padding-right:170px}
.C .readout{position:absolute;right:18px;top:34px;text-align:right}
.C .rl{display:block;font-family:${DOTS};font-weight:900;font-size:15px;letter-spacing:.14em;color:var(--cy-tx);text-shadow:var(--tglow)}
.C .rv{display:block;font-family:${DOTS};font-weight:900;font-size:56px;line-height:.95;color:var(--cy-tx);text-shadow:var(--tglow)}
.C .meta{font-family:${MONO};font-size:12px}
.C .blocks{display:grid;grid-template-columns:repeat(28,minmax(0,1fr));gap:3px;margin:20px 0 10px}
.C .blocks i{display:block;height:14px;background:var(--line)}
.C .blocks i.f{background:var(--cy);box-shadow:var(--bglow), inset 0 0 0 1px var(--blk-ln)}
.C .blocks i.h{background:var(--cy);box-shadow:var(--bglow), inset 0 0 0 1px var(--blk-ln);animation:blink .8s steps(1) infinite}
.C .bmeta{display:flex;justify-content:space-between;font-family:${MONO};font-size:11px;color:var(--tx3);margin-bottom:8px}
.C .step{display:grid;grid-template-columns:34px minmax(0,1fr);gap:4px;padding:6px 0;font-family:${MONO};font-size:13px}
.C .sd{color:var(--tx3);white-space:nowrap}
.C .sd:before{content:"[ ]"}
.C .step.ok .sd{color:var(--ok)}.C .step.ok .sd:before{content:"[✓]"}
.C .step.run .sd{color:var(--cy-tx)}.C .step.run .sd:before{content:"[▸]"}
.C .step.todo{color:var(--tx3)}
.C .sl b{font-weight:500}
.C .sl .lead{flex:1 1 20px;min-width:20px;border-bottom:1px dotted var(--line2);transform:translateY(-4px)}
.C .sl b{flex:0 1 auto}
.C .step.run .tm{color:var(--cy-tx)}
.C .sx{font-family:${SANS};font-size:12px;color:var(--tx3)}
.C .out{border-left:2px solid var(--cy);padding:2px 0 2px 12px;color:var(--tx2)}
.C .out .o3{color:var(--tx)}
.C .sum{display:flex;align-items:baseline;gap:10px;margin-bottom:12px;font-family:${DOTS};font-weight:900}
.C .sum b{font-size:40px;line-height:1}
.C .sum .u{font-family:${MONO};font-weight:400;font-size:12px;color:var(--tx2);margin-right:auto}
.C .sum .plus,.C .sum .minus{font-size:24px;line-height:1}
.C .sum .plus{color:var(--ok)}.C .sum .minus{color:var(--bad)}
.C .files li{padding:8px 0;border-top:1px dotted var(--line2);grid-template-columns:minmax(0,1fr) auto}
.C .files .meter{display:none}
.C .files .nums{display:flex;gap:6px;align-items:center}
.C .tag{font-family:${MONO};font-size:10.5px;border-radius:0;padding:0 4px}
.C .tag.new{background:var(--ok);color:var(--bg)}.C .tag.del{background:var(--bad);color:var(--bg)}
.C .btn{border-radius:2px;border:1px solid var(--line2);font-family:${MONO};font-size:12.5px}
.C .btn.pri{background:var(--cy);border-color:var(--cy);color:var(--on-cy);font-weight:600;box-shadow:var(--bglow)}
.C .btn.danger{color:var(--bad);border-color:var(--bad)}
.C .btn.ghost{border-color:transparent;color:var(--tx2)}
.C .chg .btn.danger{width:100%;margin-top:14px}
.C .chg .note{margin-top:8px;font-family:${MONO};font-size:11px}
.C .chip{border:1px dashed var(--line2);font-family:${MONO};font-size:12px;color:var(--tx2)}
.C .chip.on{border-style:solid;border-color:var(--cy);color:var(--tx)}
.C .tgt{background:var(--cy);box-shadow:var(--bglow)}
.C .tgt i{background:var(--on-cy)}
.C .seg3{border:1px solid var(--line2);padding:3px;gap:3px}
.C .seg3 button{height:28px;font-family:${MONO};font-size:12px;color:var(--tx2)}
.C .seg3 button.on{background:var(--tx);color:var(--bg)}
.C .field{border:1px solid var(--cy);font-family:${MONO};color:var(--tx);box-shadow:var(--bglow)}
.C .field:before{content:"› ";color:var(--cy-tx);white-space:pre}
.C .caret{width:8px;height:15px}
.C .comp{padding:14px 16px 12px}
.C .comp .cin{font-family:${MONO};font-size:13px;padding:0 2px 12px}
.C .comp .cin:before{content:"› ";color:var(--cy-tx)}
.C .diff{border-top:1px dotted var(--line2);padding-top:8px}
.C .diff .ln.a span:last-child{color:var(--ok)}.C .diff .ln.d span:last-child{color:var(--bad)}
.C .budget .bar{height:auto;display:grid;grid-template-columns:repeat(20,minmax(0,1fr));gap:3px}
.C .budget .bar i{position:static;width:auto;height:10px;background:var(--line)}
.C .budget .bar i.f{background:var(--cy);box-shadow:var(--bglow), inset 0 0 0 1px var(--blk-ln)}
.C .budget .bt{font-family:${MONO};font-size:11px}
.C .ask .mlabel .l{color:var(--warn)}
.C .ask .asktag{font-family:${DOTS};font-weight:900;font-size:22px;line-height:1;color:var(--warn)}
.C .ask .qd{color:var(--tx2)}
`;

// ---------- 小零件 ----------
const ticks = (d) => (d === 'B' ? '' : '<i class="tk tl"></i><i class="tk tr"></i><i class="tk bl"></i><i class="tk br"></i>');
const label = (d, n, t, r = '') => {
  if (d === 'A') return `<p class="mlabel">${n} · ${t}${r ? `<span class="r">${r}</span>` : ''}</p>`;
  if (d === 'C') return `<p class="mlabel"><span class="l">${t}</span><span>${r}</span></p>`;
  return `<p class="mlabel">${t}</p>`;
};
const who = (a, b) => `<span class="who"><i class="dot ${a.toLowerCase()}"></i>${a}${b ? `<i class="arr">→</i><i class="dot ${b.toLowerCase()}"></i>${b}` : ''}</span>`;

function wavePath() {
  // 一个周期 520 宽，首尾都在基线上，接起来无缝；平时小抖动，有输出时一串尖峰
  const r = rng(11), P = 520, mid = 30, pts = [];
  const bursts = [[70, 26, 16], [205, 18, 9], [330, 34, 20], [455, 14, 7]];
  for (let x = 0; x <= P; x += 4) {
    let y = (r() - 0.5) * 2.2;
    for (const [c, w, a] of bursts) {
      const e = Math.exp(-((x - c) ** 2) / (2 * (w / 2.2) ** 2));
      y += e * a * Math.sin(x * 0.9 + c) * (0.6 + r() * 0.5);
    }
    if (x === 0 || x === P) y = 0;
    pts.push([x, mid - y]);
  }
  const one = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y.toFixed(1)}`).join('');
  const two = pts.slice(1).map(([x, y]) => `L${x + P} ${y.toFixed(1)}`).join('');
  return one + two;
}

function body(d) {
  const D = DIRS[d];
  const meter = (a, b) => `<span class="meter"><i class="ma" style="width:${Math.round(Math.min(26, a * 0.3))}px"></i><i class="md" style="width:${Math.round(Math.min(26, b * 0.3))}px"></i></span>`;
  const brand = d === 'A' ? '<i class="led"></i><b>PECK</b>' : d === 'B' ? '<b>Peck</b><i class="mk"></i>' : '<b>PECK</b><i class="mk"></i>';
  const proj = C.projects.map((p, i) => `<li class="prow${i === 0 ? ' on' : ''}"><i class="st ${p.st}"></i><div><b>${p.name}</b><span>${p.when} · ${p.last}</span></div><em>${p.n}</em></li>`).join('');
  const steps = C.steps.map((s, i) => {
    const mid = d === 'C' ? '<i class="lead"></i>' : '';
    const tm = s.st === 'run' ? '<span class="tm">{{clock}}</span>' : s.time ? `<span class="tm">${s.time}</span>` : '';
    const title = s.st === 'run' && d === 'B' ? `<b class="hl">${s.t}</b>` : `<b>${s.t}</b>`;
    const extra = s.st === 'run'
      ? `<div class="out"><div>${C.out[0]}</div><div>${C.out[1]}</div><div class="o3">${C.out[2]}<i class="cur"></i></div></div>`
      : s.d ? `<p class="sx">${s.d}</p>` : '';
    return `<li class="step ${s.st}"><i class="sd"></i><div><p class="sl">${title}${mid}${tm}</p>${extra}</div></li>`;
  }).join('');
  const blocks = d === 'C' ? `<div class="blocks">${Array.from({ length: 28 }, (_, i) => `<i class="${i < 17 ? 'f' : i === 17 ? 'h' : ''}"></i>`).join('')}</div><div class="bmeta"><span>第 3 步，共 4 步</span><span>62%</span></div>` : '';
  const trace = d === 'A' ? `<div class="trace"><svg viewBox="0 0 1040 56" aria-hidden="true"><path class="wave" d="${wavePath()}"></path></svg><span class="tl2">GROK · 输出</span><span class="tr2">● LIVE</span></div>` : '';
  const files = C.files.map((f) => `<li><span class="fp">${f.p.split('/').pop()}</span><span class="nums">${f.tag ? `<em class="tag ${f.tag === '新' ? 'new' : 'del'}">${f.tag}</em>` : ''}<span class="fa">+${f.a}</span><span class="fd">−${f.d}</span></span>${d === 'A' ? meter(f.a, f.d) : ''}</li>`).join('');
  const readout = d === 'C'
    ? '<div class="readout"><span class="rl">RUNNING</span><span class="rv">{{clock}}</span></div>'
    : `<div class="readout"><span class="rl">${d === 'A' ? 'ELAPSED' : '已经跑了'}</span><span class="rv">{{clock}}</span></div>`;
  const askLabel = d === 'C'
    ? '<p class="mlabel"><span class="l">ASK · Grok 停下来问你</span><span class="asktag">?</span></p>'
    : d === 'A' ? '<p class="mlabel">ASK · GROK 停下来问你</p>'
    : `<p class="mlabel"><i class="dot grok"></i>Grok 停下来问你</p>`;
  return `
<div class="{{root}}">
  <header class="hd">
    <div class="brand">${brand}<span class="dirname">${D.name}</span></div>
    <p class="kw">${D.kw}</p>
    <div class="seg"><button type="button" class="on" aria-pressed="true"><i></i>CLI 模式</button><button type="button" aria-pressed="false"><i></i>API 模式</button></div>
  </header>
  <main class="grid">
    <section class="col">
      <div class="mod proj">${ticks(d)}${label(d, '01', '项目', '3')}<ul class="plist">${proj}</ul></div>
      <div class="mod ctl">${ticks(d)}${label(d, '04', '控件')}
        <div class="stack">
          <div class="row"><button type="button" class="btn pri">开始任务</button><button type="button" class="btn">取消</button><button type="button" class="btn ghost">稍后</button></div>
          <label class="tg"><span class="tgt"><i></i></span>完成后通知我</label>
          <div><p class="lbl">权限</p><div class="seg3"><button type="button">只读</button><button type="button">改前问我</button><button type="button" class="on">直接改</button></div></div>
          <div><p class="lbl">谁来干</p><div class="chips"><span class="chip"><i class="dot muse"></i>Muse</span><span class="chip on"><i class="dot muse"></i>Muse → <i class="dot grok"></i>Grok</span><span class="chip"><i class="dot api"></i>API</span></div></div>
          <div class="field">给任务起个名字<i class="caret"></i></div>
          <div class="budget"><p class="bt"><span>${d === 'A' ? 'API 本月花费' : 'API 本月花费'}</span><b>$3.20 / $20</b></p><div class="bar">${d === 'C' ? Array.from({ length: 20 }, (_, i) => `<i class="${i < 3 ? 'f' : ''}"></i>`).join('') : '<i></i>'}</div></div>
        </div>
      </div>
    </section>
    <section class="col">
      <div class="mod task">${ticks(d)}${label(d, '02', '正在做', 'weather-cli')}
        <h2 class="ttl">${C.task}</h2>
        <div class="meta">${who('Muse', 'Grok')}<span>直接改</span><span>14:02 开始</span></div>
        ${readout}${trace}${blocks}
        <ol class="steps">${steps}</ol>
      </div>
      <div class="mod comp">${ticks(d)}
        <p class="cin">下一句话…（这个任务跑完再发）</p>
        <div class="crow"><span class="chip on">${who('Muse', 'Grok')}</span><span class="chip">直接改</span><i class="sp"></i><span class="kbd">⌘↵</span><button type="button" class="btn pri">发送</button></div>
      </div>
    </section>
    <section class="col">
      <div class="mod chg">${ticks(d)}${label(d, '03', '改动')}
        <div class="sum"><b>4</b><span class="u">个文件</span><span class="plus">+${C.add}</span><span class="minus">−${C.del}</span></div>
        <ul class="files">${files}</ul>
        <div class="diff"><p class="dh"><span>Composer.tsx</span><span>+9 −21</span></p><div class="ln d"><span class="n">42</span><span class="m">−</span><span>const [agentsOpen, setAgentsOpen] = useState(false)</span></div><div class="ln d"><span class="n">43</span><span class="m">−</span><span>const [apiOpen, setApiOpen] = useState(false)</span></div><div class="ln a"><span class="n">42</span><span class="m">+</span><span>const [settingsOpen, setSettingsOpen] = useState(false)</span></div></div>
        <button type="button" class="btn danger">撤销整个任务</button>
        <p class="note">回到 14:02 开始前的样子，你的 Git 不动。</p>
      </div>
      <div class="mod ask">${ticks(d)}${askLabel}
        <p class="q">${C.ask.q}</p>
        <p class="qd">${C.ask.d}</p>
        <div class="acts"><button type="button" class="btn pri">一起升</button><button type="button" class="btn">先不升</button><button type="button" class="btn ghost">我来说…</button></div>
      </div>
    </section>
  </main>
</div>`;
}

export function direction(d) {
  const D0 = DIRS[d];
  const D = { ...D0, def: FLIP ? (D0.def === '深色' ? '浅色' : '深色') : D0.def };
  const skin = { A: SKIN_A, B: SKIN_B, C: SKIN_C }[d];
  const css = `${BASE}\n.${d}.dk{${VARS[d].dk};color-scheme:dark}\n.${d}.lt{${VARS[d].lt};color-scheme:light}\n${skin}`;
  const logic = `${clockLogic(134)}
  renderVals() {
    const dark = (this.props.theme ?? '${D.def}') === '深色';
    return { root: 'pk ${d} ' + (dark ? 'dk' : 'lt'), clock: this.clock() };
  }`;
  return { title: `方向 ${D.name}`, html: board({ title: `方向 ${D.name}`, css, body: body(d), props: themeProp(D.def), logic }) };
}
