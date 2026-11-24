// 迁移测试 3、4 · 空、加载、出错，和额度与花费的外框。只照规则画（S1–S4、M3、L5、L6）。
// 一张能在 Tweaks 里切 7 个状态（S2b-States），一张把 7 个状态摆在一起（S2b-StatesFlow）。
// 额度与花费这一页的内容是 Peck 自己的作业（roadmap Phase 8），这里只画入口、外框和空状态。
import { board, PROPS, SANS, DOTS, px, twinkle, FLIP } from '../s1c/kit.mjs';
import { CSS, header, projects, log, changesEmpty, ic } from './shell.mjs';

const ld = (rows) => `<ul class="ld">${rows.map(([s, b, d, em]) => `<li><span class="s ${s === 'run' ? 'w' : s === 'x' ? 'bad' : s === 'no' ? 'w' : ''}">${s === 'run' ? twinkle() : s === 'x' ? px('x') : s === 'no' ? px('lock') : px('check')}</span><span><b class="nm">${b}</b><span class="d">${d}</span></span><em>${em || ''}</em></li>`).join('')}</ul>`;
const dimComp = (t) => `<div class="mod comp idle"><p class="cin dim"><span class="pr">›</span><span>${t}</span></p></div>`;
const busyComp = (stop) => `<div class="mod comp idle"><p class="cin dim"><span class="pr">›</span><span>${stop ? '下一句话…（这个任务跑完再发）' : '下一句话…'}</span></p><div class="crow"><span class="chip on">MUSE→GROK</span><span class="chip">EDIT</span><i class="sp"></i>${stop ? '<button type="button" class="btn danger">STOP</button>' : `<span class="kbd">⌘↵</span><button type="button" class="btn pri off">SEND${px('send')}</button>`}</div></div>`;
const blocksHtml = (fill, head, cls = 'h') => `<div class="blocks">${Array.from({ length: 28 }, (_, i) => `<i class="${i < fill ? 'f' : i === head ? cls : ''}"></i>`).join('')}</div>`;
const step = (cls, name, tm, sd) => `<li class="step ${cls}"><i class="nd"><span class="i-ok">${px('check')}</span><span class="i-wq">${px('ask')}</span><span class="i-x">${px('x')}</span></i><div class="sb"><p class="sl"><b class="nm">${name}</b><i class="lead"></i><span class="tm">${tm}</span></p>${sd ? `<p class="sx">${sd}</p>` : ''}<i class="scan-fx"></i></div></li>`;
const msg = '<div class="msg"><span class="me">YOU</span><span class="mt nm">把设置里三个对话框合成一个面板</span><span class="mm">14:02 · Muse → Grok · 直接改</span></div>';
const taskHead = (rl, clock) => `<p class="ml"><span class="l">NOW</span><span class="r">weather-cli</span></p><h2 class="ttl">把设置里三个对话框合成一个面板</h2><div class="meta"><span>Muse → Grok</span><span>直接改</span><span>14:02 开始</span></div><div class="readout"><span class="rl">${rl}</span><span class="rv">${clock}</span></div>`;

const S = {
  FIRST: () => `${header({ proj: '' })}<main class="grid">
    <section class="col">${projects('empty')}${log([])}</section>
    <section class="col"><div class="mod grow home"><p class="ml"><span class="l">WELCOME</span><span class="r">第一次打开</span></p>
      <h2 class="hero2">先打开一个项目</h2>
      <p class="lead">Peck 在项目文件夹里干活：读代码、改文件、跑命令。每个任务开始前存一份快照，不满意一键撤销。</p>
      <div><p class="lbl">FOUND ON THIS MAC</p>${ld([['ok', 'Muse Code', 'muse --version 通过', 'FOUND'], ['ok', 'Grok Build', 'grok --version 通过', 'FOUND'], ['ok', 'Anthropic、DeepSeek', 'Key 已保存，认证通过', 'API'], ['no', '另外 3 家供应商', '没配 Key，在设置里加', 'NO KEY']])}</div>
      <div class="e0"><div class="row"><button type="button" class="btn pri">${px('folder')}OPEN FOLDER</button><span>或者把文件夹拖进窗口</span></div></div>
    </div>${dimComp('先打开一个项目，再发任务')}</section>
    ${changesEmpty('还没有任务。')}</main>`,

  BOOT: () => `${header()}<main class="grid">
    <section class="col">${projects('boot')}${log([])}</section>
    <section class="col"><div class="mod grow home"><p class="ml"><span class="l">STARTING</span><span class="r">打开中</span></p>
      <h2 class="hero2">在准备…</h2>
      <p class="lead">打开时先确认 CLI 能启动、读回项目和最近的任务。一般 1 秒内做完；超过 10 秒会写已经等了多久。</p>
      ${ld([['ok', '读数据目录', 'peck.db 和任务前快照', '0.2s'], ['run', '检测 Muse Code', 'muse --version', ''], ['ok', '检测 Grok Build', 'grok --version 通过', 'FOUND'], ['run', '读项目列表', '3 个项目，最近的任务', '']])}
    </div>${dimComp('等检测完…')}</section>
    ${changesEmpty('打开中…')}</main>`,

  NOTASK: () => `${header()}<main class="grid">
    <section class="col">${projects('notask')}${log([])}</section>
    <section class="col"><div class="mod grow home"><p class="ml"><span class="l">NEW TASK</span><span class="r">weather-cli</span></p>
      <h2 class="hero">weather-cli 要做什么？</h2>
      <p class="lead">这个项目还没有任务。一句话说清楚，再选谁来干；第一个任务开始前，Peck 先存一份快照。</p>
      <div><p class="lbl">MUSE→GROK · 先写规范再实施</p><ol class="fl"><li><p><span class="k">1</span><i class="dot muse"></i><b class="nm">Muse</b></p><span>读代码，写一份规范</span></li><li><p><span class="k">2</span><i class="dot grok"></i><b class="nm">Grok</b></p><span>照规范改，跑检查</span></li><li><p><span class="k">3</span><i class="dot muse"></i><b class="nm">Muse</b></p><span>验证，写总结</span></li></ol></div>
    </div><div class="mod comp"><p class="cin"><span class="pr">›</span><span>一句话说要做什么…</span><i class="caret"></i></p><div class="crow"><span class="chip"><i class="dot muse"></i>MUSE</span><span class="chip"><i class="dot grok"></i>GROK</span><span class="chip on"><i class="dot muse"></i>MUSE→<i class="dot grok"></i>GROK</span><span class="chip"><i class="dot grok"></i>GROK→<i class="dot muse"></i>MUSE</span><i class="sp"></i><span class="chip">EDIT</span><button type="button" class="btn pri off">SEND${px('send')}</button></div></div></section>
    ${changesEmpty('还没有任务。改的文件会一个个出现在这里。')}</main>`,

  CONNECT: () => `${header()}<main class="grid">
    <section class="col">${projects('run')}${log([['14:02', '存了任务前快照', '撤销就回到这一刻']])}</section>
    <section class="col">${msg}<div class="mod task grow run">${taskHead('RUNNING', '00:12')}${blocksHtml(2, 2)}<div class="bmeta"><span>第 1 步，共 4 步</span><b>7%</b></div>
      <ol class="steps">${step('run', 'Muse 写规范', '00:12', '在等 Muse 的第一句话 · 已经等了 12 秒')}${step('todo', 'Grok 改文件', '', '')}${step('todo', 'Grok 跑 pnpm check', '', '')}${step('todo', 'Muse 验证并总结', '', '')}</ol>
    </div>${busyComp(true)}</section>
    ${changesEmpty('规范写好、权限批了，Grok 才开始改。', '任务前快照 · 14:02 · 存好了').replace('snap no', 'snap')}</main>`,

  FAIL: () => `${header()}<main class="grid">
    <section class="col">${projects('fail')}${log([['14:04', 'Grok 停了', '今天的额度用完了'], ['14:02', '批了 2 件事', '删 2 个旧文件 · 联网装依赖'], ['14:02', '存了任务前快照', '撤销就回到这一刻']])}</section>
    <section class="col">${msg}<div class="mod task grow err">${taskHead('FAILED', '01:48')}${blocksHtml(9, -1)}<div class="bmeta"><span>第 2 步停了</span><b>32%</b></div>
      <ol class="steps">${step('ok', 'Muse 写规范', '00:31', '')}${step('fail', 'Grok 改 5 个文件', '01:48', '改到第 2 个停了')}${step('todo', 'Grok 跑 pnpm check', '', '')}${step('todo', 'Muse 验证并总结', '', '')}</ol>
      <div class="eb"><p class="e1">${px('x')}<b class="nm">Grok 停了：今天的额度用完了</b></p><p class="e2">Grok Build 说明天 08:00 恢复。可以交给 Muse 接着改，或者等额度恢复再重试；已经改的 2 个文件先留着。</p>
        <div class="row"><button type="button" class="btn pri">HAND TO MUSE</button><button type="button" class="btn">RETRY</button></div>
        <p class="raw">${px('play')}<span>原始报错</span><span class="code">grok: usage limit reached · resets 08:00</span></p></div>
    </div>${busyComp(false)}</section>
    <section class="col"><div class="mod grow rc"><p class="ml"><span class="l">CHANGES</span><span class="r">直接写进项目</span></p>
      <p class="snap">${px('clock')}<span>任务前快照 · 14:02 · 存好了</span></p>
      <div class="sum2"><span class="cnt" data-nolint=""><b>2</b></span><span class="u">个文件</span><span class="plus">+83</span><span class="minus">−21</span></div>
      <ul class="files"><li>${px('file')}<span class="fp">SettingsSheet.tsx</span><em class="tag new">NEW</em><span class="fa">+74</span><span class="fd">−0</span></li><li>${px('file')}<span class="fp">Composer.tsx</span><em class="tag none">·</em><span class="fa">+9</span><span class="fd">−21</span></li></ul>
      <div class="rfoot"><button type="button" class="btn danger wide">${px('undo')}UNDO TASK</button><p class="note">任务失败了，改了一半的也能整个撤销：回到 14:02 开始前的样子，你的 Git 不动。</p></div></div></section></main>`,

  NOCLI: () => `${header()}<main class="grid">
    <section class="col">${projects('normal')}${log([])}</section>
    <section class="col"><div class="mod grow home err"><p class="ml"><span class="l">CLI</span><span class="r">检测</span></p>
      <h2 class="hero2">没找到 Muse Code 和 Grok Build</h2>
      <p class="lead">CLI 模式要用它们。装好以后点 RECHECK；等的时候可以先用 API 模式，Anthropic、DeepSeek 已经配了 Key。</p>
      ${ld([['x', 'Muse Code', 'muse --version 启动不了', 'NOT FOUND'], ['x', 'Grok Build', 'grok --version 启动不了', 'NOT FOUND']])}
      <div class="e0"><div class="row"><button type="button" class="btn pri">${px('undo')}RECHECK</button><button type="button" class="btn">API MODE</button></div>
        <p class="raw">${px('play')}<span>原始报错</span><span class="code">muse: command not found · grok: command not found</span></p></div>
    </div>${dimComp('没有能用的 CLI：装好再 RECHECK，或者切到 API 模式')}</section>
    ${changesEmpty('还没有任务。')}</main>`,

  QUOTA: () => `${header({ on: 'quota' })}<main class="grid wide">
    <section class="col">${projects('normal')}${log([['14:06', '做完了', '6 个文件 · 检查通过 · 默认留着']])}</section>
    <section class="col"><div class="mod grow"><p class="ml"><span class="l">QUOTA &amp; SPEND</span><span class="r">额度与花费</span><button type="button" class="btn ghost cl">${px('x')}CLOSE</button></p>
      <div class="e0" style="max-width:600px;padding-top:24px"><h2 class="hero2">这一页还空着</h2>
        <p>额度与花费由 Peck 自己做：v0.5 起，站主用 Peck 开发这个模块。接上以后，这里显示其他 AI 客户端的订阅额度、API 平台的余额和本机的花费。</p>
        <p>接上以前，旧的用量页照旧能用；花费上限在设置里改。</p>
        <div class="row"><button type="button" class="btn pri">${ic('bars')}OLD USAGE</button><button type="button" class="btn">${ic('gear')}LIMIT</button></div></div>
    </div></section></main>`,
};

export const KEYS = ['FIRST', 'BOOT', 'NOTASK', 'CONNECT', 'FAIL', 'NOCLI', 'QUOTA'];
const META = {
  FIRST: ['第一次打开', '还没有项目：左边一句话 + OPEN FOLDER，中间写清这台 Mac 上找到了什么。', ['S1', 'S4', 'K1']],
  BOOT: ['打开时在准备', '写清在等什么：检测 CLI、读项目；短的用点阵转圈。', ['S2', 'A1']],
  NOTASK: ['新项目还没有任务', '和第一轮的打开一样，左边写「还没有任务」。', ['S1', 'L5']],
  CONNECT: ['等 CLI 第一句话', '任务发出去，Muse 还没开口；超过 10 秒写已经等了多久。', ['S2', 'A2', 'M3']],
  FAIL: ['任务失败', '红边模块：发生了什么、怎么办、原始报错收起来；改了一半也能撤销。', ['S3', 'M3', 'K2', 'W4']],
  NOCLI: ['没找到 CLI', '红边：哪两个没找到、怎么办；输入框暗着写原因。', ['S3', 'S4', 'L5']],
  QUOTA: ['额度与花费（外框）', '整页占宽栏；内容是 Peck 自己的作业，这里只有空状态和入口。', ['L3', 'L6', 'S1']],
};

export function boards() {
  const def = FLIP ? '浅色' : '深色';
  const opts = KEYS.map((k) => `${k} ${META[k][0]}`);
  const blocks = KEYS.map((k) => `<sc-if value="{{is${k}}}" hint-placeholder-val="{{${k === 'FIRST'}}}"><div class="{{root}}">${S[k]()}</div></sc-if>`).join('');
  const logic = `renderVals() {
    const dark = (this.props.theme ?? '${def}') === '深色';
    const k = String(this.props.state ?? '${opts[0]}').split(' ')[0];
    const v = { root: 'pk pr dots ' + (dark ? 'dk' : 'lt') };
    ${JSON.stringify(KEYS)}.forEach((x) => { v['is' + x] = x === k; });
    return v;
  }`;
  const props = { ...PROPS.theme(def), state: { editor: 'enum', options: opts, default: opts[0], section: '看' } };
  const one = board({ title: '迁移测试 · 空、加载、出错', css: CSS, body: blocks, props, logic });

  const FLOW = `
.pk.sfb{width:1760px;height:800px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:18px;font-family:${SANS}}
.ft{display:flex;align-items:baseline;gap:18px}
.ft h1{font-size:22px;font-weight:600}
.ft p{font-size:13px;color:var(--tx2)}
.g8{flex:1;display:grid;grid-template-columns:repeat(4,400px);grid-template-rows:repeat(2,minmax(0,1fr));column-gap:32px;row-gap:22px;min-height:0}
.cell{display:flex;flex-direction:column;gap:10px;min-height:0}
.fr{position:relative;width:400px;height:250px;overflow:hidden;box-shadow:0 0 0 1px var(--line2);flex:none}
.fr > .pk{position:absolute;left:0;top:0;transform:scale(.3125);transform-origin:0 0}
.cap{display:flex;flex-direction:column;gap:5px}
.ch{display:flex;align-items:center;gap:10px;white-space:nowrap}
.ch .k{font-family:${DOTS};font-weight:900;font-size:22px;line-height:1;color:var(--cy-tx);text-shadow:var(--dglow)}
.ch b{font-size:15px;font-weight:600}
.ch .ms{margin-left:auto;display:flex;gap:4px}
.ch .ms i{font-family:${DOTS};font-weight:900;font-size:12px;letter-spacing:.06em;line-height:17px;padding:0 5px;background:var(--raise);color:var(--tx2);clip-path:var(--notch)}
.cap p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.lg2{display:flex;flex-direction:column;gap:8px;padding:16px 18px;box-shadow:inset 0 0 0 1px var(--line2);background:var(--pane)}
.lg2 b{font-family:${DOTS};font-weight:900;font-size:14px;color:var(--cy-tx);margin-right:6px}
.lg2 p{font-size:12.5px;line-height:1.55;color:var(--tx2)}
.lg2 h3{font-size:15px;font-weight:600;margin:0}
`;
  const cells = KEYS.map((k, i) => `<div class="cell"><div class="fr" data-nolint=""><div class="{{fr}}">${S[k]()}</div></div>
    <div class="cap"><p class="ch"><span class="k">${i + 1}</span><b>${META[k][0]}</b><span class="ms">${META[k][2].map((r) => `<i>${r}</i>`).join('')}</span></p><p>${META[k][1]}</p></div></div>`).join('');
  const legend = `<div class="cell"><div class="lg2"><h3>这四条是迁移测试补的</h3>
    <p><b>S1</b>空：一句话说现在是什么情况，再给下一步（一个按钮）；不画插图。</p>
    <p><b>S2</b>加载：写清在等什么；短的点阵转圈，有进度的方块，超过 10 秒写等了多久。</p>
    <p><b>S3</b>出错：红边；先说发生了什么，再说怎么办；原始报错收起来。</p>
    <p><b>S4</b>用不了的：任务里不出现；设置里照样列、灰掉、写原因。</p></div></div>`;
  const flowBody = `<div class="{{root}}"><div class="ft"><h1>空、加载、出错 · 7 个状态</h1><p>都没画过，只照规则画。旁边那张能在 Tweaks 里切到每一个，看原大。每格下面是用到的规则。</p></div><div class="g8">${cells}${legend}</div></div>`;
  const flowLogic = `renderVals() {
    const dark = (this.props.theme ?? '${def}') === '深色';
    return { root: 'pk sfb dots ' + (dark ? 'dk' : 'lt'), fr: 'pk pr dots still ' + (dark ? 'dk' : 'lt') };
  }`;
  const flow = board({ title: '空、加载、出错 · 一览', css: `${CSS}\n${FLOW}`, body: flowBody, props: PROPS.theme(def), logic: flowLogic, w: 1760, h: 800 });
  return [
    { file: 'S2b-States.dc.html', title: '迁移测试 3 · 空、加载、出错（Tweaks 里切状态）', html: one },
    { file: 'S2b-StatesFlow.dc.html', w: 1760, h: 800, title: '迁移测试 3、4 · 7 个状态一览', html: flow },
  ];
}
