// 第 1 步 · 第二轮 · 两张主样板：同一套三栏，两个时刻。
// Run：在跑（M4 方块进度和点阵转圈、M3 当前步骤的方块弹一下、M1 一道扫描扫过当前这一步），下面是输入框。
// Ask：Grok 停下来问你，ASK 卡片占住输入框的位置（像 Claude Code），答完输入框才回来。
import { board, themeProp, C, MONO, DOTS, KIT, themeCss, px, twinkle, blocks, FLIP } from './kit.mjs';

const CSS = `
.pk.main{width:1280px;height:800px;padding:22px 30px 28px}
.hd{height:44px;display:flex;align-items:center;gap:16px;margin-bottom:16px}
.brand{display:flex;align-items:center;gap:8px}
.brand b{font-family:${DOTS};font-weight:900;font-size:30px;letter-spacing:.06em;line-height:1}
.brand .mk{width:12px;height:24px;background:var(--cy);box-shadow:var(--glow);animation:blink 1.05s steps(1) infinite}
.lt .brand .mk{box-shadow:inset 0 0 0 1px var(--blk-ln)}
.hd .dn{font-family:${MONO};font-size:12px;color:var(--tx2);padding-left:14px;border-left:1px solid var(--line2);white-space:nowrap}
.hd .mo{font-size:12.5px;color:var(--tx3);white-space:nowrap}
.hd .seg{margin-left:auto}
.grid{display:grid;grid-template-columns:288px minmax(0,1fr) 336px;gap:16px;height:690px}
.col{display:flex;flex-direction:column;gap:16px;min-height:0;min-width:0}
.grow{flex:1 1 0;min-height:0}
/* 项目 */
.plist{display:flex;flex-direction:column;gap:2px}
.prow{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:10px;align-items:start;padding:8px;margin:0 -8px;clip-path:var(--clip2)}
.prow.on{background:var(--pane2)}
.prow .st{height:21px;display:flex;align-items:center;justify-content:center;color:var(--ok)}
.prow .st.w{color:var(--warn)}
.prow b{display:block;font-family:${MONO};font-weight:600;font-size:13.5px;white-space:nowrap}
.prow span.s{display:block;font-size:12.5px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prow em{font-family:${DOTS};font-weight:900;font-size:20px;line-height:1.1;color:var(--tx2)}
/* 控件 */
.stack{display:flex;flex-direction:column;gap:11px}
.lbl{font-size:12px;color:var(--tx3);margin-bottom:5px}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.sel{position:relative;isolation:isolate;display:flex;align-items:center;gap:10px;height:36px;padding:0 10px 0 12px;clip-path:var(--clip2);background:var(--line2);font-family:${MONO};font-size:12.5px}
.sel:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.sel em{font-family:inherit;font-size:11px;color:var(--tx3);margin-left:auto;white-space:nowrap}
.sel .dn{transform:rotate(90deg);color:var(--tx2);width:12px;height:12px}
.bt{display:flex;justify-content:space-between;align-items:baseline;font-family:${MONO};font-size:11px;color:var(--tx3);margin-bottom:6px}
.bt b{font-weight:500;font-size:12.5px;color:var(--tx)}
/* 正在做 */
.task{position:relative}
.ttl{font-size:17px;font-weight:600;line-height:1.35;padding-right:200px}
.meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:6px;font-family:${MONO};font-size:12px;color:var(--tx2);padding-right:200px}
.readout{position:absolute;right:18px;top:36px;text-align:right}
.rl{display:inline-block;font-family:${DOTS};font-weight:900;font-size:15px;letter-spacing:.14em;line-height:1.2;color:var(--cy-tx);text-shadow:var(--tglow)}
.lt .rl{background:var(--cy);padding:1px 5px 0}
.rv{display:block;font-family:${DOTS};font-weight:900;font-size:54px;line-height:.95;color:var(--cy-tx);text-shadow:var(--tglow)}
.wait .rl{color:var(--warn);text-shadow:none}
.lt .wait .rl{background:var(--warn-soft)}
.wait .rv{color:var(--warn);text-shadow:none}
.task .blocks{margin:28px 0 8px}
.wait .blocks i.f{animation:none}
.wait .blocks i.h{background:var(--warn);animation:none;box-shadow:none}
.bmeta{display:flex;justify-content:space-between;font-family:${MONO};font-size:11px;color:var(--tx3)}
.steps{position:relative;margin-top:12px;display:flex;flex-direction:column;gap:2px}
.steps:before{content:"";position:absolute;left:7px;top:12px;bottom:16px;border-left:2px dotted var(--line2)}
.step{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr);gap:12px;padding:4px 0}
.nd{position:relative;width:16px;height:16px;margin-top:2px;display:flex;align-items:center;justify-content:center;background:var(--pane)}
.step.ok .nd{color:var(--ok)}
.step.run .nd:before{content:"";width:10px;height:10px;background:var(--cy);box-shadow:var(--glow);animation:bounce 1.4s infinite}
.lt .step.run .nd:before{box-shadow:inset 0 0 0 1px var(--blk-ln)}
.step.run .nd:after{content:"";position:absolute;left:3px;top:3px;width:10px;height:10px;box-shadow:inset 0 0 0 1.5px var(--cy);opacity:0;animation:ring 1.4s infinite}
.lt .step.run .nd:after{box-shadow:inset 0 0 0 1.5px var(--blk-ln)}
.step.todo .nd:before{content:"";width:10px;height:10px;box-shadow:inset 0 0 0 1.5px var(--line2)}
.step.wq .nd{color:var(--warn);animation:blink 1.6s steps(1) infinite}
.sb{position:relative;min-width:0;overflow:hidden}
.sl{display:flex;align-items:baseline;gap:10px;min-width:0;font-family:${MONO};font-size:13px}
.sl b{font-weight:500;flex:0 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl .lead{flex:1 1 20px;min-width:20px;border-bottom:1px dotted var(--line2);transform:translateY(-4px)}
.tm{flex:none;font-family:${MONO};font-size:12px;color:var(--tx3)}
.step.run .tm{color:var(--cy-tx)}
.step.wq .tm,.step.wq b{color:var(--warn)}
.step.todo{color:var(--tx3)}
.sx{font-size:12px;color:var(--tx3);margin-top:1px}
.scan-fx{position:absolute;top:0;left:-90px;width:84px;height:24px;pointer-events:none;background:linear-gradient(90deg,transparent,var(--cy-scan) 78%,var(--cy) 97%,transparent);animation:scanx 2.8s cubic-bezier(.45,0,.55,1) infinite}
.out{position:relative;margin-top:6px;padding:3px 0 3px 12px;font-family:${MONO};font-size:12px;line-height:1.75;color:var(--tx2);white-space:nowrap;overflow:hidden;background:linear-gradient(var(--cy) 50%,transparent 0) 0 0/2px 4px repeat-y}
.out div{overflow:hidden;text-overflow:ellipsis}
.out .o3{color:var(--tx)}
.wait .out{background-image:linear-gradient(var(--line2) 50%,transparent 0)}
/* 输入框 */
.comp{padding:14px 16px 12px}
.cin{display:flex;align-items:center;font-family:${MONO};font-size:13px;color:var(--tx3);padding:0 2px 12px}
.cin .pr{color:var(--cy-tx);margin-right:8px}
.crow{display:flex;align-items:center;gap:8px}
.crow .sp{flex:1}
/* 改动 */
.sum{display:flex;align-items:baseline;gap:10px;margin-bottom:8px;font-family:${DOTS};font-weight:900}
.sum b{font-size:42px;line-height:1}
.sum .u{font-family:${MONO};font-weight:400;font-size:12px;color:var(--tx2);margin-right:auto}
.sum .plus,.sum .minus{font-size:24px;line-height:1}
.sum .plus{color:var(--ok)}.sum .minus{color:var(--bad)}
.files li{display:grid;grid-template-columns:16px minmax(0,1fr) auto 30px 36px;gap:8px;align-items:center;padding:7px 0;border-top:1px dotted var(--line2)}
.files .px{color:var(--tx3)}
.fp{font-family:${MONO};font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fa{font-family:${MONO};font-size:12px;color:var(--ok);text-align:right}
.fd{font-family:${MONO};font-size:12px;color:var(--bad);text-align:right}
.diff{margin-top:6px;padding-top:8px;border-top:1px dotted var(--line2);font-family:${MONO};font-size:11.5px;line-height:19px;overflow:hidden}
.diff .dh{display:flex;justify-content:space-between;color:var(--tx3);font-size:11px;padding-bottom:4px}
.diff .ln{display:grid;grid-template-columns:26px 14px minmax(0,1fr);white-space:nowrap}
.diff .ln span{overflow:hidden;text-overflow:ellipsis}
.diff .n{color:var(--tx3);text-align:right;padding-right:6px}
.diff .ln.a{background:var(--ok-soft);color:var(--ok)}.diff .ln.d{background:var(--bad-soft);color:var(--bad)}
.diff .ln .n{color:var(--tx3)}
.wide{width:100%;margin-top:14px}
.note{margin-top:8px;font-family:${MONO};font-size:11px;color:var(--tx3)}
/* 权限记录、问过你的 */
.pl li{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:8px;align-items:center;padding:4px 0;font-size:12.5px}
.pl li.y .px{color:var(--ok)}
.pl li.n .px,.pl li.n span{color:var(--tx3)}
.pl em{font-family:${MONO};font-size:11px;color:var(--tx3);white-space:nowrap}
.hist li{display:grid;grid-template-columns:40px minmax(0,1fr);gap:8px;padding:6px 0;border-top:1px dotted var(--line2)}
.hist li:first-child{border-top:0;padding-top:0}
.hist .t{font-family:${MONO};font-size:11.5px;color:var(--tx3);padding-top:1px}
.hist b{display:block;font-weight:500;font-size:12.5px}
.hist span.a{display:block;font-size:12px;color:var(--tx2)}
/* ASK 卡片 */
.ah{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.aq{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:var(--warn);color:var(--pane);flex:none}
.ah b{font-size:14.5px;font-weight:600;white-space:nowrap}
.ah .sub{font-size:12.5px;color:var(--tx2);white-space:nowrap}
.ah .r{margin-left:auto;font-family:${DOTS};font-weight:900;font-size:18px;color:var(--warn);white-space:nowrap}
.tabs{display:flex;gap:4px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px dotted var(--line2)}
.tab{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 10px;font-family:${MONO};font-size:12px;color:var(--tx2);clip-path:var(--clip2)}
.tab .tn{width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:10.5px;background:var(--raise);color:var(--tx2)}
.tab.on{background:var(--raise);color:var(--tx)}
.tab.on .tn{background:var(--warn);color:var(--pane)}
.tab.sub{margin-left:auto}
.q{font-size:15.5px;font-weight:600;margin-bottom:8px}
.opts{display:flex;flex-direction:column;gap:2px}
.opt{display:grid;grid-template-columns:16px minmax(0,1fr) 16px;gap:12px;align-items:start;padding:7px 10px;clip-path:var(--clip2)}
.opt.on{background:var(--cy-soft)}
.rb{width:16px;height:16px;margin-top:2px;box-shadow:inset 0 0 0 2px var(--line2);display:flex;align-items:center;justify-content:center}
.opt.on .rb{box-shadow:inset 0 0 0 2px var(--cy)}
.opt.on .rb:after{content:"";width:8px;height:8px;background:var(--cy)}
.lt .opt.on .rb{box-shadow:inset 0 0 0 2px var(--tx)}
.lt .opt.on .rb:after{background:var(--tx)}
.opt b{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600}
.opt span.d{display:block;font-size:12px;color:var(--tx2);margin-top:1px}
.opt .k{font-family:${MONO};font-size:11.5px;color:var(--tx3);text-align:right;padding-top:2px}
.keys{display:flex;gap:16px;margin-top:10px;font-family:${MONO};font-size:11px;color:var(--tx3);white-space:nowrap}
.keys b{color:var(--tx2);font-weight:500}
`;

const who = (a, b) => `<span class="who"><i class="dot ${a.toLowerCase()}"></i>${a}${b ? `<i class="arr">→</i><i class="dot ${b.toLowerCase()}"></i>${b}` : ''}</span>`;

function left(moment) {
  const p0 = moment === 'ask'
    ? `<li class="prow on"><span class="st w">${px('ask')}</span><div><b>weather-cli</b><span class="s">等你回答 · ${C.task}</span></div><em>12</em></li>`
    : `<li class="prow on"><span class="st">${twinkle()}</span><div><b>weather-cli</b><span class="s">在跑 · ${C.task}</span></div><em>12</em></li>`;
  const rest = C.projects.slice(1).map((p) => `<li class="prow"><span class="st">${px('check')}</span><div><b>${p.name}</b><span class="s">${p.when} · ${p.last}</span></div><em>${p.n}</em></li>`).join('');
  return `<section class="col">
      <div class="mod"><p class="ml"><span class="l">项目</span><span class="r n">3</span></p><ul class="plist">${p0}${rest}</ul></div>
      <div class="mod grow"><p class="ml"><span class="l">控件</span></p>
        <div class="stack">
          <div class="row"><button type="button" class="btn pri">${px('play')}开始任务</button><button type="button" class="btn">取消</button><button type="button" class="btn ghost">稍后</button></div>
          <label class="tg"><span class="tgt"><i></i></span>完成后通知我</label>
          <div><p class="lbl">权限</p><div class="seg full ink"><button type="button">只读</button><button type="button">改前问我</button><button type="button" class="on">直接改</button></div></div>
          <div><p class="lbl">谁来干</p><div class="chips"><span class="chip"><i class="dot muse"></i>Muse</span><span class="chip on"><i class="dot muse"></i>Muse → <i class="dot grok"></i>Grok</span><span class="chip"><i class="dot api"></i>API</span></div></div>
          <div><p class="lbl">API 模式用哪个模型</p><div class="sel"><span>DeepSeek V3</span><em>配了 Key 的才列出来</em>${px('play', 'dn')}</div></div>
          <div class="field"><span class="pr">›</span>给任务起个名字<i class="caret"></i></div>
          <div><p class="bt"><span>API 本月花费</span><b>$3.20 / $20</b></p><div class="meter">${Array.from({ length: 20 }, (_, i) => `<i class="${i < 3 ? 'f' : ''}"></i>`).join('')}</div></div>
        </div>
      </div>
    </section>`;
}

function steps(moment) {
  const out = (wait) => `<div class="out"><div>&gt; pnpm check</div><div>${C.out[0]}</div><div>${C.out[1]}</div><div>SettingsSheet.tsx:58  少传了 onClose</div><div class="o3">${C.out[2]}${wait ? '' : '<i class="caret"></i>'}</div></div>`;
  return C.steps.map((s) => {
    if (s.st === 'run' && moment === 'ask') {
      return `<li class="step wq"><i class="nd">${px('ask')}</i><div class="sb"><p class="sl"><b>Grok 停下来问你</b><i class="lead"></i><span class="tm">{{clock}}</span></p><p class="sx">跑 pnpm check 时发现 Tailwind 版本对不上</p></div></li>`;
    }
    if (s.st === 'run') {
      return `<li class="step run"><i class="nd"></i><div class="sb"><p class="sl"><b>${s.t}</b><i class="lead"></i><span class="tm">{{clock}}</span></p>${out(false)}<i class="scan-fx"></i></div></li>`;
    }
    const nd = s.st === 'ok' ? px('check') : '';
    const tm = s.time ? `<span class="tm">${s.time}</span>` : '';
    const d = s.st === 'todo' ? 'Muse 读一遍改动，写总结和验证结果' : s.d;
    const sx = d && moment !== 'ask' ? `<p class="sx">${d}</p>` : '';
    return `<li class="step ${s.st}"><i class="nd">${nd}</i><div class="sb"><p class="sl"><b>${s.t}</b><i class="lead"></i>${tm}</p>${sx}</div></li>`;
  }).join('');
}

function center(moment) {
  const ask = moment === 'ask';
  const readout = ask
    ? '<div class="readout"><span class="rl">WAITING</span><span class="rv">{{clock}}</span></div>'
    : '<div class="readout"><span class="rl">RUNNING</span><span class="rv">{{clock}}</span></div>';
  const task = `<div class="mod task grow ${ask ? 'wait' : 'run'}"><p class="ml"><span class="l">正在做</span><span class="r">weather-cli</span></p>
        <h2 class="ttl">${C.task}</h2>
        <div class="meta">${who('Muse', 'Grok')}<span>直接改</span><span>14:02 开始</span></div>
        ${readout}${blocks(28, 17)}
        <div class="bmeta"><span>${ask ? '第 3 步停下来等你' : '第 3 步，共 4 步'}</span><span>62%</span></div>
        <ol class="steps">${steps(moment)}</ol>
      </div>`;
  if (!ask) {
    return `<section class="col">${task}
      <div class="mod comp">
        <p class="cin"><span class="pr">›</span>下一句话…（这个任务跑完再发）<i class="caret"></i></p>
        <div class="crow"><span class="chip on">${who('Muse', 'Grok')}</span><span class="chip">直接改</span><i class="sp"></i><span class="kbd">⌘↵</span><button type="button" class="btn pri">发送${px('send')}</button></div>
      </div>
    </section>`;
  }
  return `<section class="col">${task}
      <div class="mod wait">
        <div class="ah"><span class="aq">${px('ask')}</span><b>Grok 停下来问你</b><span class="sub">3 个问题，答完它接着跑</span><span class="r">1/3</span></div>
        <div class="tabs"><button type="button" class="tab on"><i class="tn">1</i>版本</button><button type="button" class="tab"><i class="tn">2</i>范围</button><button type="button" class="tab"><i class="tn">3</i>测试</button><button type="button" class="tab sub">${px('check')}核对再提交</button></div>
        <p class="q">Tailwind 要不要一起升到 4.1？</p>
        <ol class="opts">
          <li class="opt on"><i class="rb"></i><div><b>一起升<em class="tag rec">推荐</em></b><span class="d">顺手改 6 个文件的类名，多跑约 2 分钟；要联网装依赖，提交时一起批</span></div><span class="k">1</span></li>
          <li class="opt"><i class="rb"></i><div><b>先不升</b><span class="d">这次只合并对话框，升级以后另开一个任务</span></div><span class="k">2</span></li>
          <li class="opt"><i class="rb"></i><div><b>其他…</b><span class="d">直接告诉 Grok 怎么做</span></div><span class="k">3</span></li>
        </ol>
        <p class="keys"><span><b>1–3</b> 选</span><span><b>←→</b> 换题</span><span><b>⏎</b> 下一题</span><span><b>esc</b> 先放着，任务停在这里等你</span></p>
      </div>
    </section>`;
}

function right(moment) {
  const files = C.files.map((f) => `<li>${px('file')}<span class="fp">${f.p.split('/').pop()}</span>${f.tag ? `<em class="tag ${f.tag === '新' ? 'new' : 'del'}">${f.tag}</em>` : '<span></span>'}<span class="fa">+${f.a}</span><span class="fd">−${f.d}</span></li>`).join('');
  const chg = `<div class="mod grow"><p class="ml"><span class="l">改动</span><span class="r">直接写进项目</span></p>
        <div class="sum"><b>4</b><span class="u">个文件</span><span class="plus">+${C.add}</span><span class="minus">−${C.del}</span></div>
        <ul class="files">${files}</ul>
        <div class="diff"><p class="dh"><span>Composer.tsx</span><span>+9 −21</span></p><div class="ln d"><span class="n">42</span><span class="m">−</span><span>const [agentsOpen, setAgentsOpen] = useState(false)</span></div><div class="ln d"><span class="n">43</span><span class="m">−</span><span>const [apiOpen, setApiOpen] = useState(false)</span></div><div class="ln a"><span class="n">42</span><span class="m">+</span><span>const [settingsOpen, setSettingsOpen] = useState(false)</span></div><div class="ln"><span class="n">44</span><span class="m"></span><span>const { providers } = useSettings()</span></div><div class="ln d"><span class="n">58</span><span class="m">−</span><span>&lt;AgentsDialog open={agentsOpen} /&gt;</span></div><div class="ln d"><span class="n">59</span><span class="m">−</span><span>&lt;ApiDialog open={apiOpen} /&gt;</span></div><div class="ln a"><span class="n">57</span><span class="m">+</span><span>&lt;SettingsSheet open={settingsOpen} /&gt;</span></div></div>
        <button type="button" class="btn danger wide">${px('undo')}撤销整个任务</button>
        <p class="note">回到 14:02 开始前的样子，你的 Git 不动。</p>
      </div>`;
  const extra = moment === 'ask'
    ? `<div class="mod hist"><p class="ml"><span class="l">问过你的</span><span class="r">这个任务</span></p><ul>
        <li><span class="t">14:05</span><div><b>Muse 问：旧的 API 对话框入口要留吗？</b><span class="a">你答：不留，合进新面板</span></div></li>
        <li><span class="t">14:02</span><div><b>开始前一次批了 3 项权限</b><span class="a">改文件 · 删 2 个旧文件 · 跑 pnpm 命令</span></div></li>
      </ul></div>`
    : `<div class="mod"><p class="ml"><span class="l">权限</span><span class="r">开始前一次批的</span></p><ul class="pl">
        <li class="y">${px('check')}<span>改 weather-cli 里的文件</span><em>直接改</em></li>
        <li class="y">${px('check')}<span>删 2 个旧对话框文件</span><em>撤销能找回</em></li>
        <li class="y">${px('check')}<span>跑 pnpm check、pnpm test</span><em></em></li>
        <li class="n">${px('x')}<span>联网装依赖</span><em>用到时再问</em></li>
      </ul></div>`;
  return `<section class="col">${chg}${extra}</section>`;
}

function body(moment) {
  const mo = moment === 'ask' ? '时刻：Grok 停下来问你' : '时刻：在跑';
  return `<div class="{{root}}">
  <header class="hd">
    <div class="brand"><b>PECK</b><i class="mk"></i></div>
    <span class="dn">C 点阵终端 × P3 深海 · 第二版</span><span class="mo">${mo}</span>
    <div class="seg"><button type="button" class="on">CLI 模式</button><button type="button">API 模式</button></div>
  </header>
  <main class="grid">${left(moment)}${center(moment)}${right(moment)}</main>
</div>`;
}

export function boards() {
  const out = [];
  for (const [moment, file, def0, title, x] of [
    ['run', 'S1b-Run.dc.html', '深色', 'C × P3 · 在跑', 0],
    ['ask', 'S1b-Wait.dc.html', '浅色', 'C × P3 · 停下来问你', 1360],
  ]) {
    const def = FLIP ? (def0 === '深色' ? '浅色' : '深色') : def0;
    const start = moment === 'ask' ? 72 : 134;
    const logic = `
  constructor(p) { super(p); this.state = { t: ${start} }; }
  componentDidMount() { this.iv = setInterval(() => this.setState({ t: this.state.t + 1 }), 1000); }
  componentWillUnmount() { clearInterval(this.iv); }
  renderVals() {
    const t = this.state.t, dark = (this.props.theme ?? '${def}') === '深色';
    return { root: 'pk main dots ' + (dark ? 'dk' : 'lt'), clock: String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0') };
  }`;
    const html = board({ title, css: `${KIT}\n${themeCss('pk')}\n${CSS}`, body: body(moment), props: themeProp(def), logic });
    out.push({ file, x, y: 0, title, html });
  }
  return out;
}
