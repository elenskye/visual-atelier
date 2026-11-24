// 第 1 步 · 第二轮 · ASK 卡片（学 Claude Code）：一张卡问完一串问题（单选、多选、判断题、核对再提交），
// 要用到的权限也放进同一张卡一次批；右下是收起、答完、菜单栏和通知的样子。左边和右上能点。
import { board, themeProp, MONO, DOTS, KIT, themeCss, px, FLIP } from './kit.mjs';
import { J1_16 } from './icon-data.mjs';

const CSS = `
.pk.ak{width:1280px;height:800px;padding:24px 30px 28px;display:flex;flex-direction:column;gap:14px}
.top{display:flex;align-items:baseline;gap:16px}
.top h1{font-size:20px;font-weight:600;white-space:nowrap}
.top p{font-size:13px;color:var(--tx2)}
.cols{flex:1;display:grid;grid-template-columns:620px minmax(0,1fr);gap:16px;min-height:0}
.rc{display:flex;flex-direction:column;gap:16px;min-height:0}
.qc{display:flex;flex-direction:column;min-height:0}
/* 头 */
.ah{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.aq{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:var(--warn);color:var(--pane);flex:none}
.aq.pm{background:var(--tx)}
.ah b{font-size:14.5px;font-weight:600;white-space:nowrap}
.ah .sub{font-size:12.5px;color:var(--tx2);white-space:nowrap}
.ah .r{margin-left:auto;font-family:${DOTS};font-weight:900;font-size:18px;color:var(--warn);white-space:nowrap}
.ctx{padding:9px 12px;background:var(--pane2);clip-path:var(--clip2);font-size:12.5px;color:var(--tx2);line-height:1.6;margin-bottom:12px}
.ctx b{color:var(--tx);font-weight:600}
.ctx .fs{margin-top:3px;font-family:${MONO};font-size:11.5px;color:var(--tx3)}
/* 页签 */
.tabs{display:flex;gap:4px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px dotted var(--line2)}
.tab{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 11px;font-family:${MONO};font-size:12px;color:var(--tx2);clip-path:var(--clip2)}
.tab .tn{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:10.5px;background:var(--raise);color:var(--tx2)}
.tab.done .tn{background:var(--ok);color:var(--pane)}
.tab.on{background:var(--raise);color:var(--tx)}
.tab.on .tn{background:var(--warn);color:var(--pane)}
.tab.last{margin-left:auto}
.qh{display:flex;align-items:baseline;gap:10px;margin-bottom:8px}
.q{font-size:15.5px;font-weight:600}
.qk{font-family:${MONO};font-size:11px;color:var(--tx3);white-space:nowrap}
.pane{flex:1;min-height:0;display:flex;flex-direction:column}
/* 单选、多选 */
.opts{display:flex;flex-direction:column;gap:2px}
.opt{display:grid;grid-template-columns:16px minmax(0,1fr) 16px;gap:12px;align-items:start;width:100%;padding:7px 10px;clip-path:var(--clip2)}
.opt:hover{background:var(--pane2)}
.opt.on{background:var(--cy-soft)}
.rb,.cb{width:16px;height:16px;margin-top:2px;box-shadow:inset 0 0 0 2px var(--line2);display:flex;align-items:center;justify-content:center;color:var(--on-cy)}
.opt.on .rb{box-shadow:inset 0 0 0 2px var(--cy)}
.opt.on .rb:after{content:"";width:8px;height:8px;background:var(--cy)}
.opt.on .cb{background:var(--cy);box-shadow:none}
.opt .cb .px{visibility:hidden;width:12px;height:12px}
.opt.on .cb .px{visibility:visible}
.lt .opt.on .rb{box-shadow:inset 0 0 0 2px var(--tx)}
.lt .opt.on .rb:after{background:var(--tx)}
.lt .opt.on .cb{box-shadow:inset 0 0 0 1px var(--blk-ln)}
.opt.lock{cursor:default}
.ot{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600}
.od{display:block;font-size:12px;color:var(--tx2);margin-top:1px;font-weight:400}
.opt .k{font-family:${MONO};font-size:11.5px;color:var(--tx3);text-align:right;padding-top:2px}
.pv{margin-top:10px;padding:10px 12px;box-shadow:inset 0 0 0 1px var(--line2)}
.pv .pt{font-family:${MONO};font-size:11px;color:var(--tx3);margin-bottom:5px}
.pv li{display:flex;align-items:center;gap:8px;font-size:12.5px;padding:1px 0}
.pv li:before{content:"";width:6px;height:6px;background:var(--tx3);flex:none}
.pv li.w{color:var(--warn)}
.pv li.w:before{background:var(--warn)}
.other{margin-top:10px}
.cnt{margin-top:10px;font-family:${MONO};font-size:11.5px;color:var(--tx3)}
.cnt b{color:var(--tx);font-weight:500}
/* 判断题 */
.yn{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.ynb{position:relative;isolation:isolate;display:flex;flex-direction:column;gap:4px;padding:14px 16px 16px;min-height:120px;clip-path:var(--clip);background:var(--line2)}
.ynb:before{content:"";position:absolute;inset:1px;clip-path:var(--clip);background:var(--pane);z-index:-1}
.ynb .yt{font-family:${DOTS};font-weight:900;font-size:30px;line-height:1.1}
.ynb .yd{font-size:12.5px;color:var(--tx2)}
.ynb .k{position:absolute;right:14px;top:12px;font-family:${MONO};font-size:11.5px;color:var(--tx3)}
.ynb.on{background:var(--cy)}
.ynb.on:before{background:var(--pane2)}
.lt .ynb.on{background:var(--blk-ln)}
.lt .ynb.on:before{background:var(--cy-soft)}
.ynb.on .yt{color:var(--cy-tx);text-shadow:var(--tglow)}
.yhint{margin-top:10px;font-size:12px;color:var(--tx3)}
/* 核对 */
.sumr{display:grid;grid-template-columns:22px 56px minmax(0,1fr) auto;gap:10px;align-items:center;padding:8px 0;border-top:1px dotted var(--line2);font-size:13px}
.sumr:first-child{border-top:0}
.sumr .px{color:var(--ok)}
.sumr.no .px{color:var(--warn)}
.sumr .sk{font-family:${MONO};font-size:12px;color:var(--tx3)}
.sumr .sa{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sumr.no .sa{color:var(--warn);font-weight:500}
.sumr .ed{font-family:${MONO};font-size:11.5px;color:var(--tx3);text-decoration:underline;text-underline-offset:3px}
.net{margin-top:10px;padding:10px 12px;background:var(--warn-soft);box-shadow:inset 0 0 0 1px var(--warn-line);font-size:12.5px}
.net .nt{display:flex;align-items:center;gap:8px;font-weight:600;color:var(--warn);margin-bottom:3px}
.net .nd2{font-family:${MONO};font-size:11.5px;color:var(--tx2)}
.nonet{margin-top:10px;font-size:12.5px;color:var(--tx3)}
.sendrow{display:flex;align-items:center;gap:8px;margin-top:14px}
.sent{margin-top:14px;display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--ok-soft);color:var(--ok);font-size:13px;font-weight:600}
.btn.off{opacity:.45;cursor:not-allowed}
/* 底部 */
.qf{display:flex;align-items:center;gap:8px;margin-top:auto;padding-top:12px;border-top:1px dotted var(--line2)}
.keys{display:flex;gap:14px;font-family:${MONO};font-size:11px;color:var(--tx3);white-space:nowrap;margin-right:auto}
.keys b{color:var(--tx2);font-weight:500}
.qf .btn{height:30px;padding:0 12px;font-size:12px}
/* 权限卡 */
.pr2{display:grid;grid-template-columns:16px 16px minmax(0,1fr) auto;gap:10px;align-items:start;width:100%;padding:5px 10px;line-height:1.45;clip-path:var(--clip2)}
.pr2:hover{background:var(--pane2)}
.pr2 .ic{color:var(--tx2);margin-top:2px}
.pr2 .ot{font-size:13px}
.pr2 .od{font-family:${MONO};font-size:11.5px}
.pr2 .od2{display:block;font-size:11.5px;color:var(--tx3);margin-top:1px}
.pr2.on .cb{background:var(--cy);box-shadow:none}
.pr2 .cb .px{visibility:hidden;width:12px;height:12px}
.pr2.on .cb .px{visibility:visible}
.lt .pr2.on .cb{box-shadow:inset 0 0 0 1px var(--blk-ln)}
.pr2.hi .ic{color:var(--bad)}
.pr2.hi.on{background:var(--bad-soft)}
.pr2.hi.on .cb{background:var(--bad)}
.pr2 .ok2{display:none;font-size:11.5px;color:var(--bad);font-weight:600;margin-top:2px}
.pr2.hi.on .ok2{display:block}
.scope{display:flex;align-items:center;gap:10px;margin:8px 0 8px;font-size:12px;color:var(--tx3)}
.scope .seg{flex:1}
.acts{display:flex;flex-direction:column;gap:4px}
.act{display:flex;align-items:center;gap:10px;width:100%;height:30px;padding:0 10px;font-size:13px;clip-path:var(--clip2)}
.act .k{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-family:${MONO};font-size:11px;background:var(--raise);color:var(--tx2)}
.act.pri{background:var(--cy);color:var(--on-cy);font-weight:600}
.act.pri .k{background:var(--on-cy);color:var(--cy)}
.lt .act.pri{box-shadow:inset 0 0 0 1px var(--blk-ln)}
.act:not(.pri):hover{background:var(--pane2)}
.act .e{margin-left:auto;font-family:${MONO};font-size:11px;color:var(--tx3);font-weight:400}
.act.pri .e{color:var(--on-cy);opacity:.65}
/* 收起和记录 */
.st3{display:flex;flex-direction:column;gap:8px}
.sr{display:grid;grid-template-columns:92px minmax(0,1fr);gap:12px;align-items:start}
.sr .sl2{font-size:12px;color:var(--tx3);padding-top:5px}
.fold{display:flex;align-items:center;gap:10px;padding:5px 10px;background:var(--warn-soft);box-shadow:inset 0 0 0 1px var(--warn-line);font-size:12.5px}
.fold .px{color:var(--warn)}
.fold b{font-weight:600;color:var(--warn);white-space:nowrap}
.fold .w{font-family:${MONO};font-size:11.5px;color:var(--tx2);margin-left:auto;white-space:nowrap}
.fold .btn{height:24px;padding:0 8px;font-size:11.5px}
.done2{padding:5px 10px;box-shadow:inset 0 0 0 1px var(--line2);font-size:12.5px}
.done2 .h{display:flex;align-items:center;gap:8px;font-weight:600}
.done2 .h .px{color:var(--ok)}
.done2 p{color:var(--tx2);font-size:12px;margin-top:2px}
.done2 p.pm{font-family:${MONO};font-size:11.5px;color:var(--tx3)}
.mb{display:flex;align-items:center;gap:10px}
.bar{display:flex;align-items:center;gap:12px;height:26px;padding:0 10px;background:var(--pane2);box-shadow:inset 0 0 0 1px var(--line);font-size:12px;color:var(--tx2);flex:none}
.bar .bird{position:relative;width:16px;height:16px;fill:var(--tx);display:block}
.bar .bd{position:relative}
.bar .bd i{position:absolute;right:-3px;top:-2px;width:5px;height:5px;background:var(--warn)}
.ntf{flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:7px 10px;background:var(--pane2);box-shadow:inset 0 0 0 1px var(--line);clip-path:var(--clip2)}
.ntf .ic2{width:28px;height:28px;flex:none;background:#0B0E19;display:flex;align-items:center;justify-content:center}
.ntf .ic2 svg{width:22px;height:22px;display:block}
.ntf b{display:block;font-size:12.5px;font-weight:600;white-space:nowrap}
.ntf span{display:block;font-size:12px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

// 菜单栏小鸟：现在的图标像素化后的 16 格（鸟的格子），单色模板图
function birdTemplate(cls) {
  let r = '';
  J1_16.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      if (row[x] !== 'c' && row[x] !== 'l') { x++; continue; }
      let e = x; while (e < row.length && (row[e] === 'c' || row[e] === 'l')) e++;
      r += `<rect x="${x}" y="${y}" width="${e - x}" height="1"></rect>`; x = e;
    }
  });
  return `<svg class="${cls}" viewBox="2 2 12 12" aria-hidden="true" shape-rendering="crispEdges">${r}</svg>`;
}

const Q1 = [
  { t: '一起升', d: '顺手改 6 个文件的类名，多跑约 2 分钟', rec: true },
  { t: '先不升', d: '这次只合并对话框，升级以后另开一个任务' },
  { t: '只升到 4.0.x 最新补丁', d: '不改类名，但修不了 SettingsSheet 的写法' },
  { t: '其他…', d: '直接告诉 Grok 怎么做' },
];
const Q2 = [
  { t: 'settings/ 目录', d: '新面板就在这里，必须能改', lock: true },
  { t: 'chat/Composer.tsx', d: '去掉两个旧对话框的开关' },
  { t: 'App.tsx', d: '换掉入口；不选就留着旧入口' },
  { t: 'styles/globals.css', d: '升级后有两处变量要改' },
];

function body() {
  const q1 = Q1.map((o, i) => `<button type="button" class="opt {{oc${i}}}" onClick="{{o${i}}}"><span class="rb"></span><span><span class="ot">${o.t}${o.rec ? '<em class="tag rec">推荐</em>' : ''}</span><span class="od">${o.d}</span></span><span class="k">${i + 1}</span></button>`).join('');
  const q2 = Q2.map((o, i) => `<button type="button" class="opt {{cc${i}}}" onClick="{{c${i}}}"><span class="cb">${px('check')}</span><span><span class="ot">${o.t}${o.lock ? '<em class="tag lo">必须</em>' : ''}</span><span class="od">${o.d}</span></span><span class="k">${i + 1}</span></button>`).join('');
  const perms = [
    ['globe', '联网装依赖', 'pnpm add -D tailwindcss@4.1', '4 个包，来自 registry.npmjs.org', 'mid', '中'],
    ['term', '跑测试', 'pnpm test --filter settings', '只读项目文件，不联网', 'lo', '低'],
    ['trash', '删 3 个旧文件', 'settings/legacy/ 下 3 个', '撤销整个任务能找回', 'hi', '高危'],
    ['pen', '改项目外的文件', '~/.npmrc 加一行镜像地址', '不在 weather-cli 里，撤销找不回', 'hi', '高危'],
  ].map(([ic, t, d, d2, lv, lt], i) => `<button type="button" class="pr2 ${lv === 'hi' ? 'hi ' : ''}{{pc${i}}}" onClick="{{p${i}}}"><span class="cb">${px('check')}</span><span class="ic">${px(ic)}</span><span><span class="ot">${t}</span><span class="od">${d}</span><span class="od2">${d2}</span><span class="ok2">你确认允许这一项</span></span><em class="tag ${lv}">${lt}</em></button>`).join('');

  return `<div class="{{root}}">
  <div class="top"><h1>ASK 卡片 · 学 Claude Code</h1><p>一张卡问完一串问题：单选、多选、判断题；要用到的权限也放进同一张卡一次批。左边和右上能点（按 Play）。</p></div>
  <div class="cols">
    <div class="mod wait qc">
      <div class="ah"><span class="aq">${px('ask')}</span><b>Grok 停下来问你</b><span class="sub">weather-cli · 第 3 步 · 已等 {{wait}}</span><span class="r">{{pos}}</span></div>
      <div class="ctx"><p><b>为什么停：</b>pnpm check 报 SettingsSheet 用了 Tailwind 4.1 才有的写法，项目里装的是 4.0。下面三件事会影响这次改多少，Grok 想先问清楚。</p><p class="fs">涉及 SettingsSheet.tsx · tailwind.config.ts · package.json · 另外 6 个文件的类名</p></div>
      <div class="tabs"><button type="button" class="tab {{tc0}}" onClick="{{t0}}"><i class="tn">1</i>版本</button><button type="button" class="tab {{tc1}}" onClick="{{t1}}"><i class="tn">2</i>范围</button><button type="button" class="tab {{tc2}}" onClick="{{t2}}"><i class="tn">3</i>测试</button><button type="button" class="tab last {{tc3}}" onClick="{{t3}}"><i class="tn">✓</i>核对再提交</button></div>
      <sc-if value="{{v0}}" hint-placeholder-val="{{true}}"><div class="pane">
        <div class="qh"><p class="q">Tailwind 要不要一起升到 4.1？</p><span class="qk">单选</span></div>
        <div class="opts">${q1}</div>
        <sc-if value="{{notOther}}" hint-placeholder-val="{{true}}"><div class="pv"><p class="pt">选了会怎样</p><ul><sc-for list="{{pv}}" as="it" hint-placeholder-count="3"><li class="{{it.cls}}">{{it.t}}</li></sc-for></ul></div></sc-if>
        <sc-if value="{{isOther}}" hint-placeholder-val="{{false}}"><div class="field other"><span class="pr">›</span>告诉 Grok 你的想法…<i class="caret"></i></div></sc-if>
      </div></sc-if>
      <sc-if value="{{v1}}" hint-placeholder-val="{{false}}"><div class="pane">
        <div class="qh"><p class="q">这次可以动哪些地方？</p><span class="qk">多选 · 至少一项</span></div>
        <div class="opts">${q2}</div>
        <p class="cnt">已选 <b>{{n2}}</b> 处 · 没选的地方 Grok 不会动</p>
      </div></sc-if>
      <sc-if value="{{v2}}" hint-placeholder-val="{{false}}"><div class="pane">
        <div class="qh"><p class="q">要不要顺手给 SettingsSheet 补测试？</p><span class="qk">判断题</span></div>
        <div class="yn"><button type="button" class="ynb {{yc}}" onClick="{{yes}}"><span class="yt">要</span><span class="yd">多 1 个测试文件，约 1 分钟；验证那步一起跑</span><span class="k">Y</span></button><button type="button" class="ynb {{nc}}" onClick="{{no}}"><span class="yt">不要</span><span class="yd">这次不补，之后另开任务</span><span class="k">N</span></button></div>
        <p class="yhint">判断题只有两个答案；想说别的，按「其他…」或 esc 回到对话里说。</p>
      </div></sc-if>
      <sc-if value="{{v3}}" hint-placeholder-val="{{false}}"><div class="pane">
        <div class="qh"><p class="q">核对一下再提交</p><span class="qk">点哪一行回去改</span></div>
        <div><button type="button" class="sumr" onClick="{{t0}}">${px('check')}<span class="sk">1 版本</span><span class="sa">{{a1}}</span><span class="ed">改</span></button><button type="button" class="sumr" onClick="{{t1}}">${px('check')}<span class="sk">2 范围</span><span class="sa">{{a2}}</span><span class="ed">改</span></button><button type="button" class="sumr {{a3c}}" onClick="{{t2}}"><span class="i3">${px('check')}</span><span class="sk">3 测试</span><span class="sa">{{a3}}</span><span class="ed">改</span></button></div>
        <sc-if value="{{needNet}}" hint-placeholder-val="{{true}}"><div class="net"><p class="nt">${px('globe')}提交后一起批：联网装依赖</p><p class="nd2">pnpm add -D tailwindcss@4.1 · 4 个包 · registry.npmjs.org</p></div></sc-if>
        <sc-if value="{{noNet}}" hint-placeholder-val="{{false}}"><p class="nonet">这几个回答不需要新的权限。</p></sc-if>
        <sc-if value="{{notSent}}" hint-placeholder-val="{{true}}"><div class="sendrow"><button type="button" class="btn pri {{sendCls}}" onClick="{{send}}">${px('send')}{{sendLabel}}</button><button type="button" class="btn ghost" onClick="{{t0}}">回去改</button></div></sc-if>
        <sc-if value="{{sent}}" hint-placeholder-val="{{false}}"><div class="sent">${px('check')}已提交，Grok 接着跑了。卡片收进任务记录里。<button type="button" class="btn ghost" onClick="{{reset}}">再来一遍</button></div></sc-if>
      </div></sc-if>
      <div class="qf"><p class="keys"><span><b>1–4</b> 选</span><span><b>空格</b> 勾选</span><span><b>←→</b> 换题</span><span><b>esc</b> 先放着</span></p><button type="button" class="btn ghost" onClick="{{prev}}">上一题</button><button type="button" class="btn" onClick="{{next}}">下一题 <span class="k">⏎</span></button></div>
    </div>
    <div class="rc">
      <div class="mod">
        <div class="ah"><span class="aq pm">${px('shield')}</span><b>Grok 接下来要做 4 件事</b><span class="sub">一次批完，跑的时候不再一条条问</span></div>
        <div>${perms}</div>
        <div class="scope"><span>批到哪</span><div class="seg"><button type="button" class="{{sc0}}" onClick="{{s0}}">只这一次</button><button type="button" class="{{sc1}}" onClick="{{s1}}">这个任务里</button><button type="button" class="{{sc2}}" onClick="{{s2}}">这个项目里</button></div></div>
        <div class="acts"><button type="button" class="act pri"><span class="k">1</span>允许勾选的 {{np}} 项<span class="e">⏎</span></button><button type="button" class="act"><span class="k">2</span>都不允许，告诉 Grok 怎么做<span class="e">esc</span></button></div>
      </div>
      <div class="mod grow2"><p class="ml"><span class="l">收起和记录</span></p>
        <div class="st3">
          <div class="sr"><span class="sl2">任务里收起</span><div class="fold">${px('ask')}<b>Grok 在等你回答 3 个问题</b><span class="w">已等 {{wait}}</span><button type="button" class="btn">展开</button></div></div>
          <div class="sr"><span class="sl2">答完以后</span><div class="done2"><p class="h">${px('check')}你答了 3 个问题</p><p>一起升 · settings/、Composer.tsx · 补测试</p><p class="pm">批了：联网、跑测试　没批：删旧文件、改 ~/.npmrc</p></div></div>
          <div class="sr"><span class="sl2">菜单栏和通知</span><div class="mb"><div class="bar"><span class="bd">${birdTemplate('bird')}<i></i></span>1 个问题</div><div class="ntf"><span class="ic2">${birdTemplate('nb')}</span><span><b>Peck · weather-cli</b><span>Grok 有 3 个问题等你</span></span></div></div></div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

export function boards() {
  const def = FLIP ? '浅色' : '深色';
  const logic = `
  constructor(p) {
    super(p);
    this.state = { tab: 0, q1: 0, q2: [true, true, false, false], q3: -1, perm: [true, true, false, false], scope: 1, sent: false, w: 72 };
  }
  componentDidMount() { this.iv = setInterval(() => this.setState({ w: this.state.w + 1 }), 1000); }
  componentWillUnmount() { clearInterval(this.iv); }
  renderVals() {
    const s = this.state, dark = (this.props.theme ?? '${def}') === '深色';
    const mm = (t) => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
    const go = (i) => () => this.setState({ tab: i });
    const done = [true, s.q2.some(Boolean), s.q3 >= 0];
    const tc = (i) => (s.tab === i ? 'on' : (i < 3 && done[i] ? 'done' : ''));
    const Q1 = ${JSON.stringify(Q1.map((o) => o.t))};
    const Q2 = ${JSON.stringify(Q2.map((o) => o.t))};
    const PV = [
      [['改 package.json、pnpm-lock.yaml', ''], ['6 个文件的类名跟着改', ''], ['多跑约 2 分钟', ''], ['要联网装依赖，提交时一起批', 'w']],
      [['不动依赖', ''], ['SettingsSheet 改回 4.0 的写法（多 3 行）', ''], ['升级以后另开一个任务', '']],
      [['只升补丁版，不改类名', ''], ['SettingsSheet 还要改回 4.0 的写法', ''], ['要联网装依赖，提交时一起批', 'w']],
      [],
    ];
    const q2n = s.q2.filter(Boolean).length;
    const needNet = s.q1 === 0 || s.q1 === 2;
    const v = {
      root: 'pk ak dots ' + (dark ? 'dk' : 'lt'),
      wait: mm(s.w),
      pos: s.tab < 3 ? (s.tab + 1) + '/3' : '核对',
      v0: s.tab === 0, v1: s.tab === 1, v2: s.tab === 2, v3: s.tab === 3,
      t0: go(0), t1: go(1), t2: go(2), t3: go(3),
      prev: () => this.setState({ tab: Math.max(0, s.tab - 1) }),
      next: () => this.setState({ tab: Math.min(3, s.tab + 1) }),
      pv: PV[s.q1].map(([t, cls]) => ({ t, cls })),
      isOther: s.q1 === 3, notOther: s.q1 !== 3,
      n2: q2n,
      yc: s.q3 === 1 ? 'on' : '', nc: s.q3 === 0 ? 'on' : '',
      yes: () => this.setState({ q3: 1 }), no: () => this.setState({ q3: 0 }),
      a1: Q1[s.q1].replace('…', ''),
      a2: Q2.filter((_, i) => s.q2[i]).join('、'),
      a3: s.q3 < 0 ? '还没答' : (s.q3 === 1 ? '要补测试' : '不补测试'),
      a3c: s.q3 < 0 ? 'no' : '',
      needNet, noNet: !needNet,
      sent: s.sent, notSent: !s.sent,
      sendCls: s.q3 < 0 ? 'off' : '',
      sendLabel: s.q3 < 0 ? '还有 1 题没答' : '提交 3 个回答',
      send: () => { if (s.q3 >= 0) this.setState({ sent: true }); },
      reset: () => this.setState({ tab: 0, q1: 0, q2: [true, true, false, false], q3: -1, sent: false }),
      np: s.perm.filter(Boolean).length,
      sc0: s.scope === 0 ? 'on' : '', sc1: s.scope === 1 ? 'on' : '', sc2: s.scope === 2 ? 'on' : '',
      s0: () => this.setState({ scope: 0 }), s1: () => this.setState({ scope: 1 }), s2: () => this.setState({ scope: 2 }),
    };
    for (let i = 0; i < 4; i++) {
      v['tc' + i] = tc(i);
      v['oc' + i] = s.q1 === i ? 'on' : '';
      v['o' + i] = () => this.setState({ q1: i });
      v['cc' + i] = (s.q2[i] ? 'on' : '') + (i === 0 ? ' lock' : '');
      v['c' + i] = () => { if (i === 0) return; const q2 = s.q2.slice(); q2[i] = !q2[i]; this.setState({ q2 }); };
      v['pc' + i] = s.perm[i] ? 'on' : '';
      v['p' + i] = () => { const perm = s.perm.slice(); perm[i] = !perm[i]; this.setState({ perm }); };
    }
    return v;
  }`;
  const css = `${KIT}\n${themeCss('pk')}\n${CSS}\n.grow2{flex:1 1 0;min-height:0}\n.sumr{width:100%;text-align:left}\n.sumr .i3{display:flex}\n.ntf .nb{fill:#01EBFC}`;
  const html = board({ title: 'ASK 卡片 · 学 Claude Code', css, body: body(), props: themeProp(def), logic });
  return [{ file: 'S1b-Ask.dc.html', x: 0, y: 920, title: 'ASK 卡片 · 学 Claude Code（能点）', html }];
}
