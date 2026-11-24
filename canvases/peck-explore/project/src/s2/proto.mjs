// 第 2 步 · 第一轮 · 能点的三栏小样：一张画板走完整条路——打开看项目列表 → 写一句话、选谁来干 → 发出 →
// 规范写好、高危的事一张卡一次批 → 改文件 → 跑检查时停下来问你 → 做完（总结 + 验证）→ 撤销整个任务。
// 第 1 步定的全用上：C × P3（浅色 L2 深青）、F2 字体、Doto 标签和按钮、像素角、动效 M4 为主（M3 在跑、M1 扫描）。
// 同一份模板既做能点的小样（S2-Proto），也在流程一览（S2-Flow）里摆成 8 个静止的时刻。
import { board, DOTS, SANS, px, twinkle, dotCheck, FLIP } from '../s1c/kit.mjs';

const D = `font-family:${DOTS};font-weight:900`;

// 齿轮（设置）：8×8，和第 1 步的像素小图标一套
export const GEAR = ['...##...', '.#.##.#.', '..####..', '###..###', '###..###', '..####..', '.#.##.#.', '...##...'];
const gear = () => {
  let r = '';
  GEAR.forEach((row, y) => { for (let x = 0; x < 8;) { if (row[x] !== '#') { x++; continue; } let e = x; while (e < 8 && row[e] === '#') e++; r += `<rect x="${x}" y="${y}" width="${e - x}" height="1"></rect>`; x = e; } });
  return `<svg class="px" viewBox="0 0 8 8" aria-hidden="true" shape-rendering="crispEdges">${r}</svg>`;
};

export const CSS = `
.pk.pr{width:1280px;height:800px;padding:22px 30px 28px}
/* 顶栏：品牌、项目、模式、设置 */
.hd{height:44px;display:flex;align-items:center;gap:14px;margin-bottom:16px}
.brand{display:flex;align-items:center;gap:8px}
.brand b{${D};font-size:30px;letter-spacing:.06em;line-height:1}
.brand .mk{width:12px;height:24px;background:var(--cy-blk);box-shadow:var(--glow);animation:blink 1.05s steps(1) infinite}
.lt .brand .mk{box-shadow:inset 0 0 0 1px var(--blk-ol)}
.proj{display:flex;align-items:center;gap:8px;padding-left:14px;border-left:1px solid var(--line2);white-space:nowrap}
.proj .px{color:var(--tx2)}
.proj em{font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx3)}
.hd .sp{flex:1}
.ib{position:relative;isolation:isolate;width:34px;height:34px;display:flex;align-items:center;justify-content:center;clip-path:var(--clip2);background:var(--line2);color:var(--tx2)}
.ib:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.rs{height:30px;padding:0 10px;font-size:12.5px;color:var(--tx3)}
.rs .px{width:12px;height:12px}
.grid{display:grid;grid-template-columns:288px minmax(0,1fr) 336px;gap:16px;height:690px}
.col{display:flex;flex-direction:column;gap:16px;min-height:0;min-width:0}
.grow{flex:1 1 0;min-height:0}
.band{position:absolute;top:0;bottom:0;width:28px;background:radial-gradient(circle,var(--cy-blk) 1.2px,transparent 1.7px) 0 0/5px 5px;pointer-events:none;opacity:0}
.sweep{position:absolute;top:0;bottom:0;left:-80px;width:76px;pointer-events:none;background:linear-gradient(90deg,transparent,var(--cy-scan) 78%,var(--cy-blk) 97%,transparent);opacity:0}
/* 左栏：项目和任务 */
.lp{flex:none}
.pj{padding:6px 0;border-top:1px dotted var(--line2)}
.pj:first-of-type{border-top:0;padding-top:0}
.pjh{display:flex;align-items:center;gap:8px;height:26px;white-space:nowrap}
.pjh .px{color:var(--tx2)}
.pjh em{margin-left:auto;${D};font-size:17px;color:var(--tx2)}
.pj.on .pjh .px{color:var(--cy-tx)}
.tl{display:flex;flex-direction:column;gap:1px;margin:4px 0 2px}
.tr{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr);gap:9px;align-items:start;width:100%;padding:5px 8px;clip-path:var(--clip2);overflow:hidden}
.tr .si{height:18px;display:flex;align-items:center;justify-content:center;color:var(--tx3)}
.tr .tt{min-width:0}
.tr .tt b{display:block;font-family:var(--f-name);font-weight:var(--fw-name);font-size:var(--fs-name);line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tr .tt em{display:block;font-size:11.5px;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tr.old .si{color:var(--ok)}
.tr.nt{${D};font-size:13px;letter-spacing:.08em;color:var(--tx2);align-items:center}
.tr.nt .si{color:var(--cy-tx)}
.tr.nt.on{background:var(--cy-soft);color:var(--tx)}
.tr.cur{background:var(--pane2)}
.tr.cur .si > span{display:none}
.st-run .s-run,.st-wait .s-wait,.st-ok .s-ok,.st-undo .s-undo{display:flex!important}
.st-wait .si{color:var(--warn)}
.st-ok .si{color:var(--ok)}
.st-undo .si{color:var(--tx3)}
.st-undo .tt b{color:var(--tx2);text-decoration:line-through;text-decoration-color:var(--tx3)}
.st-wait .tt em{color:var(--warn)}
.last{display:flex;gap:9px;align-items:center;padding:2px 8px 0 24px;font-size:11.5px;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.last .px{width:12px;height:12px;color:var(--ok);flex:none}
.lfoot{margin-top:6px;font-size:11.5px;color:var(--tx3);line-height:1.5}
.log ul{display:flex;flex-direction:column;gap:5px}
.kbd{font-family:var(--f-body)}
.log li{display:grid;grid-template-columns:40px minmax(0,1fr);gap:8px}
.log .t{${D};font-size:13px;color:var(--tx3);padding-top:1px}
.log b{display:block;line-height:18px}
.log li span.a{display:block;font-size:11.5px;color:var(--tx2);line-height:1.45}
.empty{font-size:12px;line-height:1.55;color:var(--tx3)}
/* 中栏：新任务 */
.home{display:flex;flex-direction:column;gap:14px}
.hero{font-family:var(--f-title);font-weight:var(--fw-title);font-size:24px;line-height:1.3;text-shadow:var(--hglow)}
.lead{font-size:13px;line-height:1.6;color:var(--tx2);max-width:460px}
.fl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.fl li{position:relative;isolation:isolate;display:flex;flex-direction:column;gap:6px;padding:12px 12px 14px;clip-path:var(--clip2);background:var(--line)}
.fl li:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane2);z-index:-1}
.fl li p{display:flex;align-items:center;gap:7px}
.fl li .k{${D};font-size:14px;color:var(--tx3)}
.fl li span{font-size:12px;line-height:1.5;color:var(--tx2)}
.fl.one{grid-template-columns:minmax(0,1fr)}
.acc{display:flex;flex-direction:column;gap:6px}
.acc .lbl{margin:0}
.acc p.ad{font-size:12.5px;line-height:1.55;color:var(--tx2)}
.acc p.ad b{font-weight:600;color:var(--tx)}
.comp{padding:14px 16px 12px;display:flex;flex-direction:column;gap:10px}
.cin{position:relative;display:flex;align-items:center;width:100%;height:30px;padding:0 2px;font-size:13.5px;color:var(--tx3);overflow:hidden}
.cin .pr{font-family:var(--f-code);color:var(--cy-tx);margin-right:8px}
.cin .tx{position:relative;color:var(--tx)}
.cin .dz{position:absolute;top:4px;bottom:4px;left:22px;width:240px;pointer-events:none}
.crow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.crow .sp{flex:1}
.comp .chip{padding:0 9px;font-size:12.5px;letter-spacing:.04em;gap:5px}
.seg.sm button{height:26px;padding:0 10px;font-size:13px}
.btn.off{background:var(--line2);color:var(--tx3);text-shadow:none}
.btn.off:before{background:var(--pane2)}
.comp.idle .cin{cursor:default}
/* 中栏：任务 */
.msg{display:flex;align-items:center;gap:10px;height:34px;padding:0 14px;clip-path:var(--clip2);background:var(--pane2);white-space:nowrap;flex:none}
.msg .me{${D};font-size:13px;letter-spacing:.1em;color:var(--on-cy);background:var(--cy-fill);padding:2px 6px 1px;clip-path:var(--notch);text-shadow:var(--on-glow)}
.msg .mt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
.msg .mm{font-size:11.5px;color:var(--tx3)}
.task{position:relative;overflow:hidden}
.ttl{font-family:var(--f-title);font-weight:var(--fw-title);font-size:var(--fs-title);line-height:1.35;padding-right:200px;text-shadow:var(--hglow)}
.meta{display:flex;align-items:center;gap:12px;margin-top:6px;font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx2);padding-right:200px;white-space:nowrap}
.readout{position:absolute;right:18px;top:36px;text-align:right}
.rl{display:inline-block;${D};font-size:15px;letter-spacing:.14em;line-height:1.2;color:var(--cy-tx);text-shadow:var(--tglow)}
.lt .rl{background:var(--cy-fill);color:var(--on-cy);text-shadow:var(--on-glow);padding:2px 6px 1px;clip-path:var(--notch)}
.rv{display:block;${D};font-size:54px;line-height:.95;color:var(--cy-tx);text-shadow:var(--tglow)}
.task.wait{--mline:var(--warn-line)}
.task.wait .rl,.task.wait .rv{color:var(--warn);text-shadow:none}
.lt .task.wait .rl{background:var(--warn-soft);color:var(--warn)}
.task.done .rl,.task.done .rv{color:var(--ok);text-shadow:none}
.lt .task.done .rl{background:var(--ok-soft);color:var(--ok)}
.task.off .rl,.task.off .rv{color:var(--tx3);text-shadow:none}
.lt .task.off .rl{background:var(--raise);color:var(--tx2)}
.task .blocks{display:grid;grid-template-columns:repeat(28,minmax(0,1fr));gap:3px;margin:22px 0 8px}
.task .blocks i{display:block;height:14px;background:var(--off)}
.task .blocks i.f{background:var(--cy-blk);box-shadow:var(--bglow);animation:wave 2.4s ease-in-out infinite}
.task .blocks i.h{background:var(--cy-blk);box-shadow:var(--bglow);animation:blink .8s steps(1) infinite}
.task .blocks i.w{background:var(--warn);animation:wq 1s steps(1) 1 both}
.lt .task .blocks i.f,.lt .task .blocks i.h{box-shadow:inset 0 0 0 1px var(--blk-ol)}
.task.wait .blocks i.f{animation:none}
.task.done .blocks i.f{animation:none}
.ph-done .task .blocks{animation:flash .9s steps(1) 1}
.task .blocks i.lof{background:var(--off);box-shadow:none;animation:lof .05s steps(1) both}
.bmeta{display:flex;justify-content:space-between;font-size:12px;color:var(--tx3)}
.bmeta b{${D};font-size:15px;color:var(--tx2)}
.steps{position:relative;margin-top:10px;display:flex;flex-direction:column;gap:1px}
.steps:before{content:"";position:absolute;left:7px;top:12px;bottom:12px;border-left:2px dotted var(--line2)}
.step{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr);gap:12px;padding:3px 0}
.nd{position:relative;width:16px;height:16px;margin-top:1px;display:flex;align-items:center;justify-content:center;background:var(--pane)}
.nd > span{display:none}
.step.ok .i-ok{display:flex;color:var(--ok)}
.step.wq .i-wq{display:flex;color:var(--warn);animation:blink 1.6s steps(1) infinite}
.step.run .nd:before{content:"";width:10px;height:10px;background:var(--cy-blk);box-shadow:var(--glow);animation:bounce 1.4s infinite}
.lt .step.run .nd:before{box-shadow:inset 0 0 0 1px var(--blk-ol)}
.step.run .nd:after{content:"";position:absolute;left:3px;top:3px;width:10px;height:10px;box-shadow:inset 0 0 0 1.5px var(--cy-blk);opacity:0;animation:ring 1.4s infinite}
.step.todo .nd:before{content:"";width:10px;height:10px;box-shadow:inset 0 0 0 1.5px var(--line2)}
.step.dim{opacity:.55}
.step.dim .i-ok{display:flex;color:var(--tx3)}
.sb{position:relative;min-width:0;overflow:hidden}
.sl{display:flex;align-items:baseline;gap:10px;min-width:0;line-height:20px}
.sl b{flex:0 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.step.run .sl b{text-shadow:var(--hglow)}
.sl .lead{flex:1 1 20px;min-width:20px;border-bottom:1px dotted var(--line2);transform:translateY(-4px)}
.tm{flex:none;${D};font-size:15px;line-height:1;color:var(--tx3)}
.step.run .tm{color:var(--cy-tx);text-shadow:var(--dglow)}
.step.wq .tm,.step.wq .sl b{color:var(--warn)}
.step.todo{color:var(--tx3)}
.sx{font-size:var(--fs-body);color:var(--tx3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sx:empty{display:none}
.step .scan-fx{display:none}
.step.run .scan-fx{display:block;position:absolute;top:0;left:-90px;width:84px;height:22px;pointer-events:none;background:linear-gradient(90deg,transparent,var(--cy-scan) 78%,var(--cy-blk) 97%,transparent);animation:scanx 2.8s cubic-bezier(.45,0,.55,1) infinite}
.out{position:relative;margin-top:4px;padding:2px 0 2px 12px;font-family:var(--f-code);font-size:var(--fs-code);line-height:19px;color:var(--tx2);white-space:nowrap;overflow:hidden;background:linear-gradient(var(--cy-blk) 50%,transparent 0) 0 0/2px 4px repeat-y}
.out div{overflow:hidden;text-overflow:ellipsis;animation:lin .3s steps(4,end) both}
.out .o3{color:var(--tx)}
.out .ok{color:var(--ok)}
.out .w{color:var(--warn)}
.task.wait .out{background-image:linear-gradient(var(--warn) 50%,transparent 0)}
.sum{position:relative;margin-top:12px;padding:12px 14px;clip-path:var(--clip);background:var(--pane2);overflow:hidden}
.sum .s1{display:flex;align-items:center;gap:14px}
.sum .s1 b{display:block;font-family:var(--f-title);font-weight:var(--fw-title);font-size:var(--fs-title);line-height:1.3}
.sum .s1 span.u{font-size:12px;color:var(--tx2)}
.sum .n4{margin-left:auto;display:flex;gap:10px;${D};font-size:24px;line-height:1}
.sum .n4 .a{color:var(--ok)}.sum .n4 .d{color:var(--bad)}
.sum .st{margin-top:8px;font-size:12.5px;line-height:1.6;color:var(--tx2)}
.sum .ver{margin-top:6px;display:flex;flex-direction:column;gap:2px;font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx2)}
.sum .ver p{display:flex;align-items:center;gap:8px}
.sum .ver .px{color:var(--ok);width:12px;height:12px}
.sum .keep{margin-top:6px;font-size:11.5px;color:var(--tx3)}
.ph-done .sum .dck i.on{animation:dotOn .1s steps(1) both}
.ph-done .sum .n4,.ph-done .sum .s1 b{animation:flick .6s steps(1) .5s both}
.ph-done .sum .sweep{animation:sweepOnce 1s .7s both}
.back{display:flex;align-items:center;gap:10px;margin-top:12px;height:42px;padding:0 14px;clip-path:var(--clip2);background:var(--pane2);overflow:hidden;font-weight:600}
.back .px{color:var(--cy-tx)}
.back span.n{margin-left:auto;font-size:11.5px;font-weight:400;color:var(--tx3)}
.back > *{animation:revealX .6s steps(8,end) both}
.ph-undoing .task .rsweep{position:absolute;top:0;bottom:0;right:-80px;width:76px;pointer-events:none;background:linear-gradient(270deg,transparent,var(--cy-scan) 78%,var(--cy-blk) 97%,transparent);animation:rsweep .9s .5s both}
/* 卡片：高危权限、ASK */
.card{position:relative;flex:none;padding:12px 16px 12px}
.card .e{position:absolute;background:var(--warn);z-index:2}
.card .et{left:0;top:0;width:100%;height:2px;transform-origin:left;animation:eX .3s steps(8,end) both}
.card .er{right:0;top:0;width:2px;height:100%;transform-origin:top;animation:eY .2s .3s steps(5,end) both}
.card .eb{right:0;bottom:0;width:100%;height:2px;transform-origin:right;animation:eX .3s .5s steps(8,end) both}
.card .el{left:0;bottom:0;width:2px;height:100%;transform-origin:bottom;animation:eY .2s .8s steps(5,end) both}
.card .e{opacity:0;animation-name:none}
.card.fx .e{opacity:1}
.card.fx .et,.card.fx .eb{animation-name:eX}.card.fx .er,.card.fx .el{animation-name:eY}
.card.fx .e{animation-fill-mode:both}
@keyframes eOut{to{opacity:0}}
.card .in{position:relative;animation:revealY .4s .8s steps(6,end) both}
.card .bandv{position:absolute;left:0;right:0;top:0;height:14px;background:radial-gradient(circle,var(--warn) 1.2px,transparent 1.7px) 0 0/5px 5px;pointer-events:none;opacity:0;animation:bandY .4s .8s steps(6,end) both}
.card .sweep{animation:sweepOnce .9s 1.2s both}
.ah{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.aq{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:var(--warn);color:var(--pane);flex:none;clip-path:var(--clip2)}
.ah b{white-space:nowrap}
.ah .sub{font-size:var(--fs-body);color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ah .r{margin-left:auto;${D};font-size:18px;color:var(--warn);white-space:nowrap}
.pl2{display:flex;flex-direction:column;gap:2px}
.pi{display:grid;grid-template-columns:16px 16px minmax(0,1fr) auto;gap:10px;align-items:start;width:100%;padding:6px 8px;clip-path:var(--clip2)}
.pi.on{background:var(--cy-soft)}
.pi .cb{margin-top:2px}
.pi > .px{margin-top:2px;color:var(--tx2)}
.pi .tx b{display:block;line-height:20px}
.pi .tx span{display:block;font-size:12px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pi .tx .ok2{display:none;color:var(--bad);font-weight:600}
.pi.hi.on .tx .ok2{display:block}
.pi.hi.on .tx .dd{display:none}
.pi .tag{margin-top:1px}
.pa{display:flex;align-items:center;gap:8px;margin-top:10px}
.pa .sp{flex:1}
.pa .scope{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--tx3);white-space:nowrap}
.q{font-family:var(--f-title);font-weight:var(--fw-title);font-size:var(--fs-title);line-height:1.35;margin-bottom:6px}
.opts{display:flex;flex-direction:column;gap:1px}
.opt{display:grid;grid-template-columns:16px minmax(0,1fr) 16px;gap:12px;align-items:start;width:100%;padding:3px 10px;clip-path:var(--clip2)}
.opt.on{background:var(--cy-soft)}
.opt .rb{margin-top:2px}
.opt b{display:flex;align-items:center;gap:8px;line-height:20px}
.opt span.d{display:block;font-size:12px;color:var(--tx2)}
.opt .k{${D};font-size:14px;color:var(--tx3);text-align:right;padding-top:2px}
.keys{display:flex;gap:14px;font-size:11.5px;color:var(--tx3);white-space:nowrap}
.keys b{font-family:var(--f-code);font-weight:400;color:var(--tx2)}
/* 右栏：改动 */
.rc{display:flex;flex-direction:column}
.snap{position:relative;display:flex;align-items:center;gap:8px;height:30px;padding:0 10px;margin-bottom:10px;clip-path:var(--clip2);background:var(--pane2);font-size:12px;color:var(--tx2);white-space:nowrap;overflow:hidden}
.snap .px{width:12px;height:12px;color:var(--cy-tx);flex:none}
.snap.no{color:var(--tx3)}.snap.no .px{color:var(--tx3)}
.snap.fx .band{animation:bandX .5s steps(10,end) both}
.snap.fx > span{animation:revealX .5s steps(10,end) both}
.sum2{display:flex;align-items:baseline;gap:10px;margin-bottom:6px;${D}}
.sum2 .cnt{position:relative;display:inline-block;height:42px;overflow:hidden;font-size:42px;line-height:42px}
.sum2 .u{font-family:var(--f-body);font-weight:400;font-size:12px;color:var(--tx2);margin-right:auto}
.sum2 .plus,.sum2 .minus{font-size:22px;line-height:1}
.sum2 .plus{color:var(--ok)}.sum2 .minus{color:var(--bad)}
.roll{display:block}
.roll > span{display:block;animation:roll .9s steps(var(--n),end) both}
.roll i{display:block;height:42px;line-height:42px}
@keyframes roll{from{transform:translateY(0)}to{transform:translateY(calc(var(--n) * -42px))}}
.files li{display:grid;grid-template-columns:16px minmax(0,1fr) auto 32px 36px;gap:8px;align-items:center;height:30px;border-top:1px dotted var(--line2);animation:revealX .35s steps(6,end) both}
.files .px{color:var(--tx3)}
.fp{font-family:var(--f-code);font-size:calc(var(--fs-code) + .5px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fa,.fd{${D};font-size:14px;text-align:right}
.fa{color:var(--ok)}.fd{color:var(--bad)}
.files .tag.none{visibility:hidden}
.files li.col{animation:colX .3s steps(6,end) both}
.diff{margin-top:6px;padding-top:8px;border-top:1px dotted var(--line2);font-family:var(--f-code);font-size:var(--fs-code);line-height:19px;overflow:hidden;animation:revealY .4s steps(5,end) both}
.diff .dh{display:flex;justify-content:space-between;color:var(--tx3);padding-bottom:4px}
.diff .ln{display:grid;grid-template-columns:26px 14px minmax(0,1fr);white-space:nowrap}
.diff .ln span{overflow:hidden;text-overflow:ellipsis}
.diff .n{color:var(--tx3);text-align:right;padding-right:6px}
.diff .ln.a{background:var(--ok-soft);color:var(--ok)}.diff .ln.d{background:var(--bad-soft);color:var(--bad)}
.diff .ln .n{color:var(--tx3)}
.rfoot{margin-top:auto;padding-top:12px}
.wide{width:100%}
.note{margin-top:8px;font-size:11.5px;line-height:1.5;color:var(--tx3)}
.cfm{position:relative;isolation:isolate;padding:12px 14px;clip-path:var(--clip2);background:var(--bad-line)}
.cfm:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.cfm .ct{display:flex;align-items:center;gap:8px;color:var(--bad)}
.cfm .cd{margin:4px 0 10px;font-size:12px;line-height:1.55;color:var(--tx2)}
.cfm .row{display:flex;gap:8px}
.btn.fill{background:var(--bad);color:var(--bg)}.btn.fill:before{display:none}
.lt .btn.fill{color:#FFFFFF}
.back2{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--tx2)}
.back2 .px{color:var(--cy-tx)}
/* 发出时的一包点、提示条 */
.pkt{position:absolute;left:400px;top:706px;display:grid;grid-template-columns:repeat(3,4px);gap:2px;z-index:5;pointer-events:none;animation:pkt .55s .35s steps(6,end) both}
.pkt i{width:4px;height:4px;background:var(--cy-blk);box-shadow:var(--dglow)}
.ph-sending .cin .tx{animation:dissolve .4s steps(8,end) both}
.ph-sending .cin .dz .band{animation:bandX2 .4s steps(8,end) both}
.ph-typed .cin .tx{animation:revealX .5s steps(12,end) both}
.tr.cur.fx{animation:revealX .5s steps(10,end) both}
.tr.cur.fx .band{animation:bandX .5s steps(10,end) both}
.tr.cur.fx .sweep{animation:sweepOnce .8s .5s both}
.toast{position:absolute;left:50%;bottom:34px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;max-width:640px;padding:9px 14px;clip-path:var(--clip2);background:var(--tx);color:var(--bg);font-size:12.5px;z-index:6;white-space:nowrap;animation:revealY .25s steps(4,end) both}
.toast .px{width:12px;height:12px;flex:none}
@keyframes revealX{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes revealY{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes colX{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 100% 0 0)}}
@keyframes dissolve{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 0 0 100%)}}
@keyframes bandX{0%{left:0;opacity:1}99%{left:calc(100% - 28px);opacity:1}100%{left:calc(100% - 28px);opacity:0}}
@keyframes bandX2{0%{left:0;opacity:1}99%{left:212px;opacity:1}100%{left:212px;opacity:0}}
@keyframes bandY{0%{top:0;opacity:1}99%{top:calc(100% - 14px);opacity:1}100%{top:calc(100% - 14px);opacity:0}}
@keyframes sweepOnce{0%{left:-80px;opacity:1}99%{left:100%;opacity:1}100%{left:100%;opacity:0}}
@keyframes rsweep{0%{right:-80px;opacity:1}99%{right:100%;opacity:1}100%{right:100%;opacity:0}}
@keyframes eX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes eY{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes pkt{0%{transform:translate(0,0);opacity:1}99%{transform:translate(-340px,-528px);opacity:1}100%{transform:translate(-340px,-528px);opacity:0}}
@keyframes flash{0%,100%{filter:none}15%,30%{filter:brightness(1.7)}45%,60%{filter:brightness(1.7)}}
@keyframes flick{0%{opacity:0}20%{opacity:1}40%{opacity:.25}60%,100%{opacity:1}}
@keyframes dotOn{from{opacity:0}to{opacity:1}}
@keyframes lof{from{background:var(--cy-blk)}to{background:var(--off)}}
@keyframes wq{0%{background:var(--cy-blk)}30%{opacity:0}60%,100%{background:var(--warn);opacity:1}}
@keyframes lin{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@media (prefers-reduced-motion:reduce){.pkt,.band,.bandv,.sweep,.rsweep,.toast{display:none!important}.card .e{display:none}}
/* 流程一览里摆成静止的样子：不动、没有提示条 */
.still *,.still *:before,.still *:after{animation:none!important}
.still .pkt,.still .toast,.still .band,.still .bandv,.still .sweep,.still .rsweep,.still .card .e{display:none!important}
`;

/** 模板。p 是取值的前缀：小样是 ''，流程一览里每个时刻是 'f0.' 这样。 */
export function template(p = '') {
  const h = (k) => `{{${p}${k}}}`;
  const iff = (k, html, ph = false) => `<sc-if value="${h(k)}" hint-placeholder-val="{{${ph}}}">${html}</sc-if>`;
  const chip = (i, html) => `<button type="button" class="chip ${h('w' + i)}" onClick="${h('pw' + i)}">${html}</button>`;
  const dot = (a) => `<i class="dot ${a}"></i>`;

  const left = `<section class="col">
    <div class="mod lp"><p class="ml"><span class="l">PROJECTS</span><span class="r n">3</span></p>
      <div class="pj on"><p class="pjh">${px('folder')}<b class="nm">weather-cli</b><em>${h('ntask')}</em></p>
        <ul class="tl">
          <li><button type="button" class="tr nt ${h('newOn')}" onClick="${h('newTask')}"><span class="si">${px('plus')}</span><span>NEW TASK</span></button></li>
          ${iff('hasNew', `<li class="tr cur ${h('curC')}"><span class="si"><span class="s-run">${twinkle()}</span><span class="s-wait">${px('ask')}</span><span class="s-ok">${px('check')}</span><span class="s-undo">${px('undo')}</span></span><span class="tt"><b>把设置里三个对话框合成一个面板</b><em>${h('curMeta')}</em></span><i class="band"></i><i class="sweep"></i></li>`, true)}
          <li class="tr old"><span class="si">${px('check')}</span><span class="tt"><b>修 Diff 里的中文乱码</b><em>今天 09:12 · 3 个文件</em></span></li>
          <li class="tr old"><span class="si">${px('check')}</span><span class="tt"><b>加 --json 输出</b><em>昨天 · 2 个文件</em></span></li>
        </ul>
      </div>
      <div class="pj"><p class="pjh">${px('folder')}<b class="nm">notes-sync</b><em>31</em></p><p class="last">${px('check')}导出加一个 Markdown 选项 · 今天</p></div>
      <div class="pj"><p class="pjh">${px('folder')}<b class="nm">pomelo-site</b><em>8</em></p><p class="last">${px('check')}首页图片改成懒加载 · 昨天</p></div>
      <p class="lfoot">同一个项目一次跑一个任务</p>
    </div>
    <div class="mod grow log"><p class="ml"><span class="l">LOG</span><span class="r">这个任务</span></p>
      ${iff('logEmpty', '<p class="empty">发任务以后，存快照、批过的、问过的、做完、撤销都记在这里。</p>', true)}
      <ul><sc-for list="${h('log')}" as="g" hint-placeholder-count="2"><li><span class="t">{{g.t}}</span><span><b class="nm">{{g.b}}</b><span class="a">{{g.a}}</span></span></li></sc-for></ul>
    </div>
  </section>`;

  const home = `<div class="mod grow home"><p class="ml"><span class="l">NEW TASK</span><span class="r">weather-cli</span></p>
      <h2 class="hero">weather-cli 要做什么？</h2>
      <p class="lead">一句话说清楚，再选谁来干。开始前先存一份快照，做完默认留着；不满意，一键撤销整个任务。</p>
      <div><p class="lbl">${h('whoLbl')}</p><ol class="fl ${h('flC')}"><sc-for list="${h('whoFlow')}" as="f" hint-placeholder-count="3"><li><p><span class="k">{{f.k}}</span><i class="dot {{f.c}}"></i><b class="nm">{{f.a}}</b></p><span>{{f.t}}</span></li></sc-for></ol></div>
      <div class="acc"><p class="lbl">ACCESS · ${h('accName')}</p><p class="ad">${h('accD')}</p></div>
    </div>
    <div class="mod comp">
      <button type="button" class="cin" onClick="${h('type')}"><span class="pr">›</span>${iff('typedOn', '<span class="tx">把设置里三个对话框合成一个面板</span><i class="dz"><i class="band"></i></i>')}${iff('typedOff', '<span>一句话说要做什么…（点这里）</span>', true)}<i class="caret"></i></button>
      <div class="crow">${chip(0, `${dot('muse')}MUSE`)}${chip(1, `${dot('grok')}GROK`)}${chip(2, `${dot('muse')}MUSE→${dot('grok')}GROK`)}${chip(3, `${dot('grok')}GROK→${dot('muse')}MUSE`)}</div>
      <div class="crow"><div class="seg sm"><button type="button" class="${h('a0')}" onClick="${h('pa0')}">READ</button><button type="button" class="${h('a1')}" onClick="${h('pa1')}">ASK</button><button type="button" class="${h('a2')}" onClick="${h('pa2')}">EDIT</button></div><i class="sp"></i><span class="kbd">⌘↵</span><button type="button" class="btn pri ${h('sendC')}" onClick="${h('send')}">SEND${px('send')}</button></div>
    </div>`;

  const steps = [0, 1, 2, 3].map((i) => `<li class="step ${h('sc' + i)}"><i class="nd"><span class="i-ok">${px('check')}</span><span class="i-wq">${px('ask')}</span></i><div class="sb"><p class="sl"><b class="nm">${h('sn' + i)}</b><i class="lead"></i><span class="tm">${h('stm' + i)}</span></p><p class="sx">${h('sd' + i)}</p>${i === 2 ? iff('showOut', `<div class="out"><sc-for list="${h('out')}" as="o" hint-placeholder-count="2"><div class="{{o.c}}">{{o.t}}</div></sc-for></div>`) : ''}<i class="scan-fx"></i></div></li>`).join('');

  const perm = `<div class="mod wait card ${h('cardFx')}"><i class="e et"></i><i class="e er"></i><i class="e eb"></i><i class="e el"></i>
      <div class="in">
        <div class="ah"><span class="aq">${px('shield')}</span><b class="nm">开始改之前，一次批这几件事</b><span class="sub">规范里有 3 件高危的事</span><span class="r">${h('np')}/3</span></div>
        <div class="pl2">
          <button type="button" class="pi ${h('pc0')}" onClick="${h('pp0')}"><span class="cb">${px('check')}</span>${px('trash')}<span class="tx"><b class="nm">删 2 个旧文件</b><span class="dd">AgentsDialog.tsx、ApiDialog.tsx · 撤销整个任务时能放回来</span></span><em class="tag hi">HIGH</em></button>
          <button type="button" class="pi ${h('pc1')}" onClick="${h('pp1')}"><span class="cb">${px('check')}</span>${px('globe')}<span class="tx"><b class="nm">联网装依赖</b><span class="dd">pnpm add · 只在要升级依赖时用到</span></span><em class="tag mid">MED</em></button>
          <button type="button" class="pi hi ${h('pc2')}" onClick="${h('pp2')}"><span class="cb">${px('check')}</span>${px('pen')}<span class="tx"><b class="nm">改项目外的文件</b><span class="dd">~/.npmrc 加一行镜像地址 · 默认不勾</span><span class="ok2">你确认允许这一项：它不在任务快照里</span></span><em class="tag hi">HIGH</em></button>
        </div>
        <div class="pa"><span class="scope">批到哪<span class="seg sm"><button type="button" onClick="${h('scope')}">ONCE</button><button type="button" class="on">TASK</button><button type="button" onClick="${h('scope')}">PROJECT</button></span></span><i class="sp"></i><button type="button" class="btn ghost" onClick="${h('deny')}">NO</button><button type="button" class="btn pri" onClick="${h('allow')}">ALLOW ${h('np')}</button></div>
      </div><i class="bandv"></i><i class="sweep"></i></div>`;

  const ask = `<div class="mod wait card ${h('cardFx')}"><i class="e et"></i><i class="e er"></i><i class="e eb"></i><i class="e el"></i>
      <div class="in">
        <div class="ah"><span class="aq">${px('ask')}</span><b class="nm">${h('doer')} 停下来问你</b><span class="sub">1 个问题，答完它接着跑</span><span class="r">1/1</span></div>
        <p class="q">Tailwind 要不要一起升到 4.1？</p>
        <div class="opts">
          <button type="button" class="opt ${h('o0')}" onClick="${h('po0')}"><i class="rb"></i><span><b class="nm">一起升<em class="tag rec">PICK</em></b><span class="d">多改 package.json 一行；要联网装依赖，开始前已经批过</span></span><span class="k">1</span></button>
          <button type="button" class="opt ${h('o1')}" onClick="${h('po1')}"><i class="rb"></i><span><b class="nm">先不升</b><span class="d">把配置改回 4.0 的写法，升级以后另开任务</span></span><span class="k">2</span></button>
          <button type="button" class="opt ${h('o2')}" onClick="${h('po2')}"><i class="rb"></i><span><b class="nm">其他…</b><span class="d">直接告诉 ${h('doer')} 怎么做</span></span><span class="k">3</span></button>
        </div>
        <div class="pa"><p class="keys"><span><b>1–3</b> 选</span><span><b>⏎</b> 提交</span><span><b>esc</b> 先放着</span></p><i class="sp"></i><button type="button" class="btn ghost" onClick="${h('later')}">LATER</button><button type="button" class="btn pri" onClick="${h('submit')}">SUBMIT</button></div>
      </div><i class="bandv"></i><i class="sweep"></i></div>`;

  const idle = (busy) => `<div class="mod comp idle"><button type="button" class="cin" onClick="${h(busy ? 'busy' : 'again')}"><span class="pr">›</span><span>${busy ? '下一句话…（这个任务跑完再发）' : '下一句话…'}</span><i class="caret"></i></button>
      <div class="crow"><span class="chip on">${h('whoUp')}</span><span class="chip">EDIT</span><i class="sp"></i>${busy ? `<button type="button" class="btn danger" onClick="${h('stop')}">STOP</button>` : `<span class="kbd">⌘↵</span><button type="button" class="btn pri off">SEND${px('send')}</button>`}</div></div>`;

  const task = `<div class="msg"><span class="me">YOU</span><span class="mt nm">把设置里三个对话框合成一个面板</span><span class="mm">14:02 · ${h('whoChip')} · 直接改</span></div>
    <div class="mod task grow ${h('taskC')}"><p class="ml"><span class="l">NOW</span><span class="r">weather-cli</span></p>
      <h2 class="ttl">把设置里三个对话框合成一个面板</h2>
      <div class="meta"><span>${h('whoChip')}</span><span>直接改</span><span>14:02 开始</span></div>
      <div class="readout"><span class="rl">${h('rl')}</span><span class="rv">${h('clock')}</span></div>
      <div class="blocks"><sc-for list="${h('blk')}" as="b" hint-placeholder-count="28"><i class="{{b.c}}" style="animation-delay:{{b.d}}"></i></sc-for></div>
      <div class="bmeta"><span>${h('bm')}</span><b>${h('pct')}</b></div>
      <ol class="steps">${steps}</ol>
      ${iff('showSum', `<div class="sum"><div class="s1">${dotCheck()}<div><b>做完了</b><span class="u">${h('nfiles')} 个文件 · 检查通过</span></div><p class="n4"><span class="a">+${h('adds')}</span><span class="d">−${h('dels')}</span></p></div>
        <p class="st">三个设置对话框合成了一个 SettingsSheet；Composer 和 App 改成打开它；旧的两个对话框删了。${h('sumX')}</p>
        <div class="ver"><p>${px('check')}pnpm check 通过</p><p>${px('check')}pnpm test · 42 项通过</p></div>
        <p class="keep">默认留着。不满意，在右边撤销整个任务。</p><i class="sweep"></i></div>`)}
      ${iff('showBack', `<div class="back">${px('undo')}<span>已回到 14:02 开始前的样子</span><span class="n">你的 Git 没动</span></div>`)}
      <i class="rsweep"></i>
    </div>
    ${iff('slotRun', idle(true))}${iff('slotPerm', perm)}${iff('slotAsk', ask)}${iff('slotDone', idle(false))}`;

  const center = `<section class="col">${iff('isHome', home, true)}${iff('isTask', task)}</section>`;

  const right = `<section class="col">
    <div class="mod grow rc"><p class="ml"><span class="l">CHANGES</span><span class="r">直接写进项目</span></p>
      <p class="snap ${h('snapC')}">${px('clock')}<span>${h('snapT')}</span><i class="band"></i></p>
      <div class="sum2"><span class="cnt" data-nolint="">${iff('rolling', `<span class="roll" style="--n:${h('nfiles')}" data-nolint=""><span><sc-for list="${h('rollL')}" as="d" hint-placeholder-count="6"><i>{{d.n}}</i></sc-for></span></span>`)}${iff('notRolling', `<b>${h('nshow')}</b>`, true)}</span><span class="u">个文件</span><span class="plus">+${h('addsShow')}</span><span class="minus">−${h('delsShow')}</span></div>
      <ul class="files"><sc-for list="${h('files')}" as="f" hint-placeholder-count="3"><li class="{{f.c}}" style="animation-delay:{{f.dl}}">${px('file')}<span class="fp">{{f.p}}</span><em class="tag {{f.tc}}">{{f.tag}}</em><span class="fa">+{{f.a}}</span><span class="fd">−{{f.d}}</span></li></sc-for></ul>
      ${iff('showEmpty', `<p class="empty" style="margin-top:6px">${h('emptyT')}</p>`, true)}
      ${iff('showDiff', `<div class="diff"><p class="dh"><span>Composer.tsx</span><span>+9 −21</span></p><div class="ln d"><span class="n">42</span><span class="m">−</span><span>const [agentsOpen, setAgentsOpen] = useState(false)</span></div><div class="ln d"><span class="n">43</span><span class="m">−</span><span>const [apiOpen, setApiOpen] = useState(false)</span></div><div class="ln a"><span class="n">42</span><span class="m">+</span><span>const [settingsOpen, setSettingsOpen] = useState(false)</span></div><div class="ln d"><span class="n">58</span><span class="m">−</span><span>&lt;AgentsDialog open={agentsOpen} /&gt;</span></div><div class="ln a"><span class="n">57</span><span class="m">+</span><span>&lt;SettingsSheet open={settingsOpen} /&gt;</span></div></div>`)}
      <div class="rfoot">
        ${iff('showUndo', `<button type="button" class="btn danger wide" onClick="${h('undo')}">${px('undo')}UNDO TASK</button><p class="note">回到 14:02 开始前的样子，你的 Git 不动。</p>`)}
        ${iff('showConfirm', `<div class="cfm"><p class="ct">${px('undo')}<b class="nm">撤销这个任务？</b></p><p class="cd">${h('nfiles')} 个文件回到 14:02 开始前的样子，删掉的 2 个放回来。你的 Git 不动。</p><div class="row"><button type="button" class="btn fill" onClick="${h('doUndo')}">UNDO ${h('nfiles')} FILES</button><button type="button" class="btn" onClick="${h('cancelUndo')}">CANCEL</button></div></div>`)}
        ${iff('showBack2', `<p class="back2">${px('check')}已撤销。要再做一次，点左边 NEW TASK。</p>`)}
      </div>
    </div>
  </section>`;

  return `<div class="${h('root')}">
  <header class="hd">
    <div class="brand"><b>PECK</b><i class="mk"></i></div>
    <span class="proj">${px('folder')}<b class="nm">weather-cli</b><em>~/code/weather-cli</em></span>
    <i class="sp"></i>
    <div class="seg"><button type="button" class="on">CLI</button><button type="button" onClick="${h('api')}">API</button></div>
    <button type="button" class="ib" aria-label="设置" onClick="${h('gear')}">${gear()}</button>
    <button type="button" class="btn ghost rs" onClick="${h('reset')}">${px('undo')}RESET</button>
  </header>
  <main class="grid">${left}${center}${right}</main>
  ${iff('isSending', '<span class="pkt"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>')}
  ${iff('toastOn', `<div class="toast">${px('bang')}<span>${h('toast')}</span></div>`)}
</div>`;
}

// ---------- 取值：只看 state，算出模板要的所有值。流程一览也用它。 ----------
// 这个函数会被原样塞进画板的脚本里，所以不能用外面的变量。
export function V(s, dark) {
  const ORDER = ['home', 'typed', 'sending', 'plan', 'perm', 'edit', 'check', 'ask', 'check2', 'verify', 'done', 'confirm', 'undoing', 'undone'];
  const ph = s.ph, at = (x) => ORDER.indexOf(ph) >= ORDER.indexOf(x);
  const pad = (n) => String(n).padStart(2, '0');
  const mm = (t) => pad(Math.floor(t / 60)) + ':' + pad(t % 60);
  const hm = (t) => '14:' + pad(2 + Math.floor(t / 60));
  const WHO = [
    { chip: 'Muse', lbl: 'MUSE · 一个人做完', a: ['Muse', 'Muse', 'Muse', 'Muse'], flow: [['Muse', 'muse', '读代码、写规范、改、跑检查，最后自己验收']] },
    { chip: 'Grok', lbl: 'GROK · 一个人做完', a: ['Grok', 'Grok', 'Grok', 'Grok'], flow: [['Grok', 'grok', '读代码、写规范、改、跑检查，最后自己验收']] },
    { chip: 'Muse → Grok', lbl: 'MUSE→GROK · 先写规范再实施', a: ['Muse', 'Grok', 'Grok', 'Muse'], flow: [['Muse', 'muse', '读代码，写一份规范'], ['Grok', 'grok', '照规范改，跑检查'], ['Muse', 'muse', '验证，写总结']] },
    { chip: 'Grok → Muse', lbl: 'GROK→MUSE · 先写规范再实施', a: ['Grok', 'Muse', 'Muse', 'Grok'], flow: [['Grok', 'grok', '读代码，写一份规范'], ['Muse', 'muse', '照规范改，跑检查'], ['Grok', 'grok', '验证，写总结']] },
  ];
  const ACC = [
    ['只读', '只看不改：读代码、回答问题、写规范，不碰文件。'],
    ['改前问我', '每改一个文件、跑一条命令前都先问你。'],
    ['直接改', '改文件、跑命令都不问；<b>删文件、联网、改项目外的文件</b>这类高危的事，开始前一张卡一次批。'],
  ];
  const w = WHO[s.who], A = w.a;
  const isHome = ['home', 'typed', 'sending'].includes(ph);
  const running = ['plan', 'edit', 'check', 'check2', 'verify'].includes(ph);
  const waiting = ph === 'perm' || ph === 'ask';
  const fin = ['done', 'confirm'].includes(ph);
  const undoing = ph === 'undoing', undone = ph === 'undone';
  const up = s.ans === 0;
  // 文件：改的时候一个个出现；答了「一起升」多一个 package.json
  const ALL = [
    ['settings/SettingsSheet.tsx', 'NEW', 'new', 74, 0], ['chat/Composer.tsx', '', 'none', 9, 21], ['App.tsx', '', 'none', 3, 18],
    ['settings/AgentsDialog.tsx', 'DEL', 'del', 0, 93], ['settings/ApiDialog.tsx', 'DEL', 'del', 0, 58],
  ];
  if (up) ALL.push(['package.json', '', 'none', 1, 1]);
  const shown = undone ? 0 : (at('check') ? ALL.length : (ph === 'edit' ? s.nf : 0));
  const files = ALL.slice(0, Math.min(shown, ALL.length)).map((f, i, arr) => ({
    p: f[0].split('/').pop(), tag: f[1] || '·', tc: f[2], a: f[3], d: f[4],
    c: undoing ? 'col' : '', dl: undoing ? ((arr.length - 1 - i) * 0.09).toFixed(2) + 's' : '0s',
  }));
  const sumA = (n) => ALL.slice(0, n).reduce((x, f) => x + f[3], 0), sumD = (n) => ALL.slice(0, n).reduce((x, f) => x + f[4], 0);
  const nfiles = ALL.length;
  // 进度块：28 格
  let fill = 0, head = -1;
  if (ph === 'plan') { fill = 3; head = 3; }
  if (ph === 'perm') { fill = 6; head = 6; }
  if (ph === 'edit') { fill = 6 + Math.round(s.nf * 1.6); head = fill; }
  if (ph === 'check') { fill = 15 + s.no * 2; head = fill; }
  if (ph === 'ask') { fill = 19; head = 19; }
  if (ph === 'check2') { fill = 19 + (s.no - 2) * 1; head = fill; }
  if (ph === 'verify') { fill = 25; head = 25; }
  if (fin || undoing) { fill = 28; head = -1; }
  const blk = Array.from({ length: 28 }, (_, i) => {
    if (undoing) return { c: i < fill ? 'lof' : '', d: (((27 - i) * 0.035) + 0.2).toFixed(3) + 's' };
    if (undone) return { c: '', d: '0s' };
    if (i < fill) return { c: 'f', d: (i * 0.07).toFixed(2) + 's' };
    if (i === head && head < 28) return { c: waiting ? 'w' : 'h', d: '0s' };
    return { c: '', d: '0s' };
  });
  // 步骤
  const stIdx = { plan: 0, perm: 1, edit: 1, check: 2, ask: 2, check2: 2, verify: 3 }[ph];
  const sc = [0, 1, 2, 3].map((i) => {
    if (isHome) return 'todo';
    if (undoing || undone) return 'ok dim';
    if (fin) return 'ok';
    if (i < stIdx) return 'ok';
    if (i === stIdx) return waiting ? 'wq' : 'run';
    return 'todo';
  });
  const T = s.ts || [];
  const stm = [0, 1, 2, 3].map((i) => (sc[i].startsWith('ok') && T[i] != null ? mm(T[i]) : (sc[i] === 'run' || sc[i] === 'wq' ? mm(s.t) : '')));
  const sn = [A[0] + ' 写规范', A[1] + ' 改 5 个文件', A[2] + ' 跑 pnpm check', A[3] + ' 验证并总结'];
  const sd = [
    ph === 'plan' ? '在读代码，看哪些地方要动…' : (ph === 'perm' ? '读了 12 个文件，列出 6 条要改的' : ''),
    ph === 'perm' ? '等你批 2 件高危的事再动手' : (ph === 'edit' ? '改到第 ' + Math.max(1, s.nf) + ' 个，右边一个个出现' : ''),
    '',
    ph === 'verify' ? '跑 pnpm test，读一遍改动，写总结' : (fin ? '' : ''),
  ];
  const OUT1 = [['&gt; pnpm check', ''], ['tailwind：配置写的 4.1，装的是 4.0', 'w']];
  const OUT2 = up ? [['&gt; pnpm add -D tailwindcss@4.1', ''], ['&gt; pnpm check', ''], ['0 个错误', 'ok']] : [['→ 配置改回 4.0 的写法', ''], ['&gt; pnpm check', ''], ['0 个错误', 'ok']];
  let out = [];
  if (ph === 'check') out = OUT1.slice(0, s.no);
  if (ph === 'ask') out = OUT1;
  if (ph === 'check2') out = OUT1.concat(OUT2.slice(0, s.no - 2));
  out = out.map(([t, c]) => ({ t: t.replace('&gt;', '>'), c }));
  // 记录
  const log = [];
  if (at('plan')) log.push({ t: '14:02', b: '存了任务前快照', a: '撤销就回到这一刻' });
  if (at('edit') && s.permOk) log.push({ t: hm(T[0] || 4), b: '批了 ' + s.permN + ' 件事', a: s.permTxt });
  if (at('check2')) log.push({ t: hm(T[2] || 14), b: A[2] + ' 问：Tailwind 升不升到 4.1？', a: '你答：' + (up ? '一起升' : '先不升') });
  if (at('done') && !undoing && !undone) log.push({ t: hm(T[3] || 20), b: '做完了', a: nfiles + ' 个文件 · 检查通过 · 默认留着' });
  if (at('done') && (undoing || undone)) log.push({ t: hm(T[3] || 20), b: '做完了', a: nfiles + ' 个文件 · 检查通过' });
  if (undone) log.push({ t: hm((T[3] || 20) + 30), b: '撤销了', a: '回到 14:02 开始前的样子' });
  log.reverse();
  const rl = running ? 'RUNNING' : waiting ? 'WAITING' : fin ? 'DONE' : undoing ? 'UNDO' : 'UNDONE';
  const permN = (s.perm || []).filter(Boolean).length;
  return {
    root: 'pk pr dots ' + (dark ? 'dk' : 'lt') + ' ph-' + ph + (s.still ? ' still' : ''),
    isHome, isTask: !isHome, isSending: ph === 'sending',
    typedOn: ph !== 'home', typedOff: ph === 'home',
    w0: s.who === 0 ? 'on' : '', w1: s.who === 1 ? 'on' : '', w2: s.who === 2 ? 'on' : '', w3: s.who === 3 ? 'on' : '',
    a0: s.acc === 0 ? 'on' : '', a1: s.acc === 1 ? 'on' : '', a2: s.acc === 2 ? 'on' : '',
    accName: ACC[s.acc][0], accD: ACC[s.acc][1].replace(/<\/?b>/g, ''),
    whoLbl: w.lbl, whoChip: w.chip, whoUp: w.chip.replace(/ /g, '').toUpperCase(), flC: w.flow.length === 1 ? 'one' : '',
    whoFlow: w.flow.map(([a, c, t], i) => ({ a, c, t, k: String(i + 1) })),
    sendC: ph === 'home' ? 'off' : '',
    newOn: (ph === 'home' || ph === 'typed') ? 'on' : '',
    hasNew: at('plan'), ntask: at('plan') ? 13 : 12,
    curC: 'st-' + (running ? 'run' : waiting ? 'wait' : (fin || undoing) ? 'ok' : 'undo') + (ph === 'plan' && !s.still ? ' fx' : ''),
    curMeta: running ? '在跑 · ' + mm(s.t) : ph === 'perm' ? '等你批权限' : ph === 'ask' ? '等你回答' : (fin || undoing) ? '做完 · 刚才 · ' + nfiles + ' 个文件' : '已撤销 · 回到 14:02',
    log, logEmpty: log.length === 0,
    taskC: running ? 'run' : waiting ? 'wait' : fin ? 'done' : 'off', rl, clock: mm(s.t),
    blk, bm: isHome ? '' : (fin ? '4 步都做完了' : undoing || undone ? '撤销了，改动都退回去' : waiting ? '第 ' + (stIdx + 1) + ' 步停下来等你' : '第 ' + (stIdx + 1) + ' 步，共 4 步'),
    pct: undone ? '0%' : Math.round(fill / 28 * 100) + '%',
    sc0: sc[0], sc1: sc[1], sc2: sc[2], sc3: sc[3], sn0: sn[0], sn1: sn[1], sn2: sn[2], sn3: sn[3],
    sd0: sd[0], sd1: sd[1], sd2: sd[2], sd3: sd[3], stm0: stm[0], stm1: stm[1], stm2: stm[2], stm3: stm[3],
    showOut: out.length > 0, out,
    showSum: fin, showBack: undone, sumX: up ? 'Tailwind 一起升到了 4.1。' : 'Tailwind 留在 4.0。', nfiles, adds: sumA(nfiles), dels: sumD(nfiles),
    slotRun: running, slotPerm: ph === 'perm', slotAsk: ph === 'ask', slotDone: fin || undoing || undone,
    cardFx: s.still ? '' : 'fx', doer: A[2],
    np: permN, pc0: s.perm && s.perm[0] ? 'on' : '', pc1: s.perm && s.perm[1] ? 'on' : '', pc2: s.perm && s.perm[2] ? 'on' : '',
    o0: s.q === 0 ? 'on' : '', o1: s.q === 1 ? 'on' : '', o2: s.q === 2 ? 'on' : '',
    snapC: (at('plan') ? (ph === 'plan' && !s.still ? 'fx' : '') : 'no'),
    snapT: at('plan') ? (undone ? '回到了任务前快照 · 14:02' : '任务前快照 · 14:02 · 存好了') : '发任务时先存一份快照',
    rolling: undoing, notRolling: !undoing, rollL: Array.from({ length: nfiles + 1 }, (_, i) => ({ n: String(nfiles - i) })),
    nshow: undone ? 0 : shown, addsShow: undone ? 0 : sumA(shown), delsShow: undone ? 0 : sumD(shown),
    files, showEmpty: shown === 0 && !undoing,
    emptyT: isHome ? '还没开始。改的文件会一个个出现在这里。' : undone ? '没有改动了：' + nfiles + ' 个文件都回到了 14:02 的样子。' : '规范写好、权限批了，' + A[1] + ' 才开始改。',
    showDiff: !undone && !undoing && shown >= 2, showUndo: ph === 'done', showConfirm: ph === 'confirm', showBack2: undone,
    toastOn: !!s.toast && !s.still, toast: s.toast || '',
  };
}

// ---------- 流程一览要摆的 8 个时刻 ----------
export const FRAMES = [
  { k: '1', nm: '打开', d: '先看项目列表，每个项目带最近几次任务；中间是新任务：一句话 + 谁来干。', m: [], s: { ph: 'home', who: 2, acc: 2, t: 0, nf: 0, no: 0, q: 0 } },
  { k: '2', nm: '写好一句话', d: '选「先写规范再实施」，权限默认直接改。字一格格打出来。', m: ['M4'], s: { ph: 'typed', who: 2, acc: 2, t: 0, nf: 0, no: 0, q: 0 } },
  { k: '3', nm: '一次批高危的事', d: '规范写好，里面的高危操作放进一张卡一次批；改项目外的文件默认不勾。', m: ['M4', 'M1'], s: { ph: 'perm', who: 2, acc: 2, t: 4, nf: 0, no: 0, q: 0, perm: [true, true, false], ts: [4] } },
  { k: '4', nm: '在跑', d: '改的文件在右边一个个出现；当前这一步的方块弹，扫描扫过。', m: ['M4', 'M3', 'M1'], s: { ph: 'edit', who: 2, acc: 2, t: 9, nf: 3, no: 0, q: 0, permOk: true, permN: 2, permTxt: '删 2 个旧文件 · 联网装依赖', ts: [4] } },
  { k: '5', nm: '停下来问你', d: 'ASK 卡片占住输入框的位置，答完输入框才回来；进度头一格变琥珀。', m: ['M4', 'M1'], s: { ph: 'ask', who: 2, acc: 2, t: 15, nf: 5, no: 2, q: 0, permOk: true, permN: 2, permTxt: '删 2 个旧文件 · 联网装依赖', ts: [4, 10] } },
  { k: '6', nm: '做完了', d: '总结 + 验证结果；默认留着。剩下的块补满、闪两下，勾一颗颗亮。', m: ['M4', 'M1'], s: { ph: 'done', who: 2, acc: 2, t: 23, nf: 5, no: 5, q: 0, ans: 0, permOk: true, permN: 2, permTxt: '删 2 个旧文件 · 联网装依赖', ts: [4, 10, 18, 23] } },
  { k: '7', nm: '撤销前确认', d: '撤销是删改动的事，先在右边确认一次：几个文件、回到几点、Git 不动。', m: [], s: { ph: 'confirm', who: 2, acc: 2, t: 23, nf: 5, no: 5, q: 0, ans: 0, permOk: true, permN: 2, permTxt: '删 2 个旧文件 · 联网装依赖', ts: [4, 10, 18, 23] } },
  { k: '8', nm: '撤销了', d: '文件一行行收掉、数字倒跳、块倒着灭，反向扫一次；左边任务划掉。', m: ['M4', 'M1'], s: { ph: 'undone', who: 2, acc: 2, t: 23, nf: 5, no: 5, q: 0, ans: 0, permOk: true, permN: 2, permTxt: '删 2 个旧文件 · 联网装依赖', ts: [4, 10, 18, 23] } },
];
