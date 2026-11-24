// 迁移测试 1 · 设置：一个面板替掉三个对话框（design.md 的分组：供应商和 Key、花费上限、权限、CLI 检测、通知、外观、开发者选项）。
// 只照规则画：整页占宽栏（L6），页内导航（K8），设置行（K7），用不了的照样列出来、灰掉、写原因（S4）。
import { board, PROPS, A, px, FLIP } from '../s1c/kit.mjs';
import { J2, pix } from '../s1b/icon.mjs';
import { CSS, header, projects, log, ic } from './shell.mjs';

const NAV = [['PROVIDERS', '供应商和 Key'], ['LIMIT', '花费上限'], ['ACCESS', '权限'], ['CLI', 'CLI 检测'], ['NOTIFY', '通知'], ['LOOK', '外观'], ['DEV', '开发者选项']];

const j2defs = () => `<svg class="defs" width="0" height="0" aria-hidden="true"><defs>
  <linearGradient id="gbs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16214A"></stop><stop offset="1" stop-color="#050816"></stop></linearGradient>
  <filter id="gls" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow in="SourceGraphic" dx="0" dy="0" stdDeviation="0.6" flood-color="#00E5FF" flood-opacity=".55"></feDropShadow></filter></defs>
  <symbol id="j2set" viewBox="-2.35 -2.35 36.7 36.7"><rect width="32" height="32" rx="7.17" fill="url(#gbs)"></rect><g filter="url(#gls)">${pix(J2, { c: '#00E5FF', l: '#A8F6FF' })}</g></symbol></svg>`;

const tg = (k) => `<button type="button" class="tgt {{${k}C}}" onClick="{{${k}}}" aria-label="开关"><i></i></button>`;

function sections() {
  const prov = [
    ['Anatomy', 'Anthropic', 'Messages · 内置 Claude Opus 5.5', true],
    ['DeepSeek', 'DeepSeek', 'Chat Completions · 内置 DeepSeek Flash', true],
    ['OpenAI', 'OpenAI', 'Responses', false],
    ['Gemini', 'Google Gemini', '官方 OpenAI 兼容接口', false],
    ['Bailian', '阿里云百炼', '兼容接口 · 北京、新加坡地域要和 Key 一致', false],
  ].map(([, n, d, k]) => `<div class="srow${k ? '' : ' off'}"><div><p class="sn"><b class="nm">${n}</b></p><span class="sd">${d}${k ? '' : ' · 没配 Key，「谁来干」里不出现'}</span></div><div class="sc">${k ? '<em class="tag ok">SAVED</em><em class="tag ok">AUTH OK</em><button type="button" class="btn">CHANGE</button>' : `<em class="tag lo">NO KEY</em><button type="button" class="btn">${ic('key')}ADD KEY</button>`}</div></div>`).join('');

  const s0 = `<p class="ph2">供应商和 Key</p><p class="pd">Key 存在钥匙串里，不进配置、历史和模型上下文。「已保存」和「认证通过」分开写。只有配了 Key 的供应商，才会出现在「谁来干」里。</p>
    <div class="rows">${prov}</div>
    <div class="hr"><p class="lbl">MODELS</p><div class="srow" style="border-top:0"><div><p class="sn"><b class="nm">Claude Opus 5.5、DeepSeek Flash</b></p><span class="sd">内置。别的模型在这里加：思考能力、档位、工具支持要填清楚，不按名字猜。</span></div><div class="sc"><button type="button" class="btn">${px('plus')}ADD MODEL</button></div></div></div>`;

  const s1 = `<p class="ph2">花费上限</p><p class="pd">一个月里所有 API 任务加起来的钱。按供应商的价格表估算，算不出来的写「未知」。快到上限时停下来问你。</p>
    <div class="big2"><b>$3.20</b><span>/ $20</span><em>本月 · 11-01 起</em></div>
    <div class="meter lg" style="margin-top:10px">${Array.from({ length: 20 }, (_, i) => `<i class="${i < 3 ? 'f' : ''}"></i>`).join('')}</div>
    <div class="rows"><div class="srow"><div><p class="sn"><b class="nm">每月上限</b></p><span class="sd">到了就停，不自动加</span></div><div class="sc"><span class="fld">$20</span></div></div>
      <div class="srow"><div><p class="sn"><b class="nm">本月按供应商</b></p><span class="sd">Anthropic $2.85 · DeepSeek $0.35 · 未知 0 次</span></div><div class="sc"><button type="button" class="btn">${ic('bars')}QUOTA</button></div></div></div>`;

  const acc = [['READ', '只读', '只看不改：读代码、回答问题、写规范，不碰文件。'], ['EDIT', '允许改文件和跑命令', '改文件、跑命令都不问；高危的事开始前一张卡一次批。'], ['ALL', '全部放行', '装依赖、联网也不问；删文件、改项目外的文件还是问。']]
    .map(([k, n, d], i) => `<button type="button" class="{{ac${i}}}" onClick="{{pa${i}}}"><i class="rb"></i><span><b><span class="k">${k}</span><span class="nm">${n}</span>${i === 1 ? '<em class="tag rec">DEFAULT</em>' : ''}</b><span class="d">${d}</span></span><span></span></button>`).join('');
  const s2 = `<p class="ph2">权限</p><p class="pd">发任务时默认用哪一档；每个任务发出前还能在输入框旁边换。</p>
    <div class="ac">${acc}</div>
    <div class="hr"><p class="lbl">ALWAYS ASK</p><div class="hl"><span>${px('lock')}删文件</span><span>${px('lock')}推送</span><span>${px('lock')}装依赖、联网</span><span>${px('lock')}改项目外的文件</span><span>${px('lock')}改系统设置</span></div><p class="pd">这几样算高危，开始前一张卡一次批。项目外的默认不勾。</p></div>`;

  const cli = [['Muse Code', 'muse', true], ['Grok Build', 'grok', true]]
    .map(([n, c]) => `<div class="srow"><div><p class="sn"><b class="nm">${n}</b><span class="code">${c} --version</span></p><span class="sd">检测到 · 09:12 检测 · 登录和额度要跑任务时才知道</span></div><div class="sc"><em class="tag ok">FOUND</em></div></div>`).join('');
  const s3 = `<p class="ph2">CLI 检测</p><p class="pd">只跑 version 看能不能启动。检测到不等于登录了、有额度；认证、额度、超时出错会让任务停下，不当成成功。</p>
    <div class="rows">${cli}<div class="srow off"><div><p class="sn"><b class="nm">第三家 CLI</b></p><span class="sd">v1.0 以后接；接入层已经是通用的，加一家只加一份清单</span></div><div class="sc"><em class="tag lo">LATER</em></div></div>
      <div class="srow"><div><p class="sn"><b class="nm">让它调用 API 模型帮忙</b></p><span class="sd">CLI 在任务里把子任务交给哪个 API 模型</span></div><div class="sc"><span class="chip on"><i class="dot api"></i>DEEPSEEK FLASH</span></div></div></div>
    <div class="hr"><button type="button" class="btn pri" onClick="{{recheck}}">${px('undo')}RECHECK</button></div>`;

  const s4 = `<p class="ph2">通知</p><p class="pd">菜单栏小图标和 macOS 通知，都能关。</p>
    <div class="rows">
      <div class="srow"><div><p class="sn"><b class="nm">菜单栏小图标</b></p><span class="sd">有任务在跑时变样；空闲、在跑、等你三种</span></div><div class="sc">${tg('t0')}</div></div>
      <div class="srow"><div><p class="sn"><b class="nm">做完发通知</b></p><span class="sd">任务做完、检查通过或没过</span></div><div class="sc">${tg('t1')}</div></div>
      <div class="srow"><div><p class="sn"><b class="nm">要你回答时发通知</b></p><span class="sd">停下来问你、要你批高危的事</span></div><div class="sc">${tg('t2')}</div></div>
      <div class="srow"><div><p class="sn"><b class="nm">出错时发通知</b></p><span class="sd">任务失败、额度用完、连不上</span></div><div class="sc">${tg('t3')}</div></div></div>`;

  const s5 = `<p class="ph2">外观</p><p class="pd">默认跟随系统的明暗。</p>
    <div class="rows"><div class="srow"><div><p class="sn"><b class="nm">明暗</b></p><span class="sd">跟随系统，或者固定一种</span></div><div class="sc"><div class="seg sm"><button type="button" class="on">SYSTEM</button><button type="button">DARK</button><button type="button">LIGHT</button></div></div></div></div>
    <div class="hr"><p class="lbl">APP ICON</p><div class="tiles2">
      <button type="button" class="tile2 {{ic0}}" onClick="{{pi0}}"><svg class="ti" aria-hidden="true" shape-rendering="crispEdges"><use href="#j2set"></use></svg><span class="tl"><i class="rb {{ic0}}"></i>PIXEL</span><span class="td">像素 J2 · 默认</span></button>
      <button type="button" class="tile2 {{ic1}}" onClick="{{pi1}}"><img class="ti" src="${A.a3}" alt="现在的图标 · 润色版"><span class="tl"><i class="rb {{ic1}}"></i>CLASSIC</span><span class="td">现在的图标 · A3</span></button>
    </div><p class="pd">App 开着时 Dock 和切换器里马上换；没开时显示打包时的那个。</p></div>`;

  const s6 = `<p class="ph2">开发者选项</p><p class="pd">给测试和 ?mock 用，平时不用动。</p>
    <div class="rows"><div class="srow"><div><p class="sn"><b class="nm">假 Agent</b></p><span class="sd">不推理，照剧本改文件；只在开发和验收时用</span></div><div class="sc">${tg('t4')}</div></div>
      <div class="srow"><div><p class="sn"><b class="nm">导出调用记录</b></p><span class="sd">脱敏的 JSON：不含 Key、路径、提示词和回复，未知费用写空</span></div><div class="sc"><button type="button" class="btn">EXPORT</button></div></div></div>`;

  return [s0, s1, s2, s3, s4, s5, s6].map((s, i) => `<sc-if value="{{s${i}}}" hint-placeholder-val="{{${i === 0}}}"><div class="pane">${s}</div></sc-if>`).join('');
}

function body() {
  const nav = NAV.map(([en, zh], i) => `<button type="button" class="{{n${i}}}" onClick="{{g${i}}}"><b>${en}</b><span>${zh}</span></button>`).join('');
  return `<div class="{{root}}">${j2defs()}
  ${header({ on: 'settings', h: { quota: '{{quota}}', api: '{{api}}' } })}
  <main class="grid wide">
    <section class="col">${projects('normal')}${log([['14:06', '做完了', '6 个文件 · 检查通过 · 默认留着'], ['14:05', 'Grok 问：Tailwind 升不升到 4.1？', '你答：一起升'], ['14:02', '批了 2 件事', '删 2 个旧文件 · 联网装依赖']])}</section>
    <section class="col"><div class="mod grow" style="display:flex;flex-direction:column"><p class="ml"><span class="l">SETTINGS</span><span class="r">改了马上生效</span><button type="button" class="btn ghost cl" onClick="{{close}}">${px('x')}CLOSE</button></p>
      <div class="sg"><nav class="nav">${nav}</nav>${sections()}</div>
    </div></section>
  </main>
  <sc-if value="{{toastOn}}" hint-placeholder-val="{{false}}"><div class="toast">${px('bang')}<span>{{toast}}</span></div></sc-if>
</div>`;
}

export function boards() {
  const def = FLIP ? '浅色' : '深色';
  const logic = `
  constructor(p) { super(p); this.state = { sec: 0, acc: 1, t: [true, true, true, true, false], icon: 0, toast: '' }; }
  componentWillUnmount() { clearTimeout(this.tt); }
  say(m) { this.setState({ toast: m }); clearTimeout(this.tt); this.tt = setTimeout(() => this.setState({ toast: '' }), 2800); }
  renderVals() {
    const s = this.state, dark = (this.props.theme ?? '${def}') === '深色';
    const v = { root: 'pk pr dots ' + (dark ? 'dk' : 'lt'), toastOn: !!s.toast, toast: s.toast,
      close: () => this.say('CLOSE 回到原来的任务（L6）'), quota: () => this.say('额度与花费在旁边那张板'), api: () => this.say('API 模式在旁边那张板'),
      recheck: () => this.say('重新跑一遍 muse --version、grok --version') };
    for (let i = 0; i < ${NAV.length}; i++) { v['n' + i] = s.sec === i ? 'on' : ''; v['s' + i] = s.sec === i; v['g' + i] = () => this.setState({ sec: i }); }
    for (let i = 0; i < 3; i++) { v['ac' + i] = s.acc === i ? 'on' : ''; v['pa' + i] = () => this.setState({ acc: i }); }
    for (let i = 0; i < 5; i++) { v['t' + i + 'C'] = s.t[i] ? '' : 'off'; v['t' + i] = () => { const t = s.t.slice(); t[i] = !t[i]; this.setState({ t }); }; }
    for (let i = 0; i < 2; i++) { v['ic' + i] = s.icon === i ? 'on' : ''; v['pi' + i] = () => this.setState({ icon: i }); }
    return v;
  }`;
  const html = board({ title: '迁移测试 · 设置', css: CSS, body: body(), props: PROPS.theme(def), logic });
  return [{ file: 'S2b-Settings.dc.html', title: '迁移测试 1 · 设置（左边导航能点）', html }];
}
