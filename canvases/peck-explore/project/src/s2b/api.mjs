// 迁移测试 2 · API 模式：三种做法（单模型干活、规划 + 实施、单次请求）；只列配了 Key 的供应商；
// 选了没配 Key 的模型，卡片占住输入位当场填（L5、M5、I7）。
import { board, PROPS, px, FLIP } from '../s1c/kit.mjs';
import { CSS, header, projects, log, changesEmpty, ic } from './shell.mjs';

const KINDS = [
  ['SOLO', '单模型干活', '一个模型读代码、改文件、跑检查，最后自己总结。'],
  ['PLAN→DO', '规划 + 实施', '规划的模型拆成几项交给实施的模型；最多 4 项，每项能返工 1 次。'],
  ['ONE SHOT', '单次请求', '问一次、答一次，不读项目、不改文件。'],
];

const EXTRA = `
.kinds{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.kinds button{position:relative;isolation:isolate;display:flex;flex-direction:column;gap:6px;padding:12px 12px 14px;clip-path:var(--clip2);background:var(--line);text-align:left}
.kinds button:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane2);z-index:-1}
.kinds button.on{background:var(--cy-ol)}
.kinds button.on:before{inset:2px;background:linear-gradient(var(--cy-soft),var(--cy-soft)),var(--pane2)}
.kinds .kk{display:flex;align-items:center;gap:8px}
.kinds .kk i{font-style:normal}
.kinds span.d{font-size:12px;line-height:1.5;color:var(--tx2)}
.spend{display:flex;align-items:center;gap:12px}
.spend .meter{flex:1}
.spend span{font-size:12px;color:var(--tx2);white-space:nowrap}
.mrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.mrow .lb2{width:40px}
.kc .kf{display:flex;align-items:center;height:38px;padding:0 12px;margin:10px 0 8px;clip-path:var(--clip2);background:var(--cy-ol);position:relative;isolation:isolate;font-family:var(--f-code);font-size:13px;letter-spacing:.12em;color:var(--tx)}
.kc .kf:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane2);z-index:-1}
.kc .kf .pr{color:var(--cy-tx);margin-right:8px;letter-spacing:0}
.kc .ks{display:flex;gap:16px;font-size:12px;color:var(--tx3)}
.kc .ks span{display:flex;align-items:center;gap:6px}
.kc .ks .ok{color:var(--ok)}
.kc .ks .px{width:12px;height:12px}
`;

function body() {
  const kinds = KINDS.map(([k, n, d], i) => `<button type="button" class="{{k${i}}}" onClick="{{pk${i}}}"><p class="kk"><b class="tag {{kt${i}}}" style="height:21px">${k}</b><b class="nm">${n}</b></p><span class="d">${d}</span></button>`).join('');
  const models = (role) => `<span class="chip {{m0${role}}}"><i class="dot api"></i>CLAUDE OPUS 5.5</span><span class="chip {{m1${role}}}"><i class="dot api"></i>DEEPSEEK FLASH</span><button type="button" class="chip" onClick="{{nokey}}">${px('plus')}MORE</button>`;
  const home = `<div class="mod grow home"><p class="ml"><span class="l">NEW TASK</span><span class="r">weather-cli · API 模式</span></p>
      <h2 class="hero">weather-cli 要做什么？</h2>
      <p class="lead">API 模式：Peck 自己调模型干活，读写只在项目里，按花费上限算钱。</p>
      <div><p class="lbl">HOW</p><div class="kinds">${kinds}</div></div>
      <div><p class="lbl">SPEND</p><div class="spend"><div class="meter">${Array.from({ length: 20 }, (_, i) => `<i class="${i < 3 ? 'f' : ''}"></i>`).join('')}</div><span>本月 $3.20 / $20 · 这个任务按价格表估算</span></div></div>
    </div>`;
  const comp = `<div class="mod comp">
      <button type="button" class="cin" onClick="{{type}}"><span class="pr">›</span><span>一句话说要做什么…</span><i class="caret"></i></button>
      <sc-if value="{{one}}" hint-placeholder-val="{{true}}"><div class="mrow"><span class="lbl lb2" style="margin:0">MODEL</span>${models('a')}</div></sc-if>
      <sc-if value="{{two}}" hint-placeholder-val="{{false}}"><div class="mrow"><span class="lbl lb2" style="margin:0">PLAN</span>${models('a')}</div><div class="mrow"><span class="lbl lb2" style="margin:0">DO</span>${models('b')}</div></sc-if>
      <div class="crow"><span class="lbl" style="margin:0">THINK</span><div class="seg sm"><button type="button">LOW</button><button type="button" class="on">MID</button><button type="button">HIGH</button></div><span class="chip">{{acc}}</span><i class="sp"></i><span class="kbd">⌘↵</span><button type="button" class="btn pri off">SEND${px('send')}</button></div>
    </div>`;
  const key = `<div class="mod wait card kc fx"><i class="e et"></i><i class="e er"></i><i class="e eb"></i><i class="e el"></i>
      <div class="in">
        <div class="ah"><span class="aq">${ic('key')}</span><b class="nm">选了 OpenAI：还没配 Key</b><span class="sub">在 MORE 里选的；填了 Key 才能用它</span></div>
        <div class="kf"><span class="pr">›</span>{{keyMask}}<i class="caret"></i></div>
        <p class="ks"><span class="{{savedC}}">${px('check')}{{savedT}}</span><span class="{{authC}}">${px('check')}{{authT}}</span><span>存进钥匙串，不进配置、历史和模型上下文</span></p>
        <div class="pa"><i class="sp"></i><button type="button" class="btn ghost" onClick="{{cancel}}">CANCEL</button><button type="button" class="btn pri" onClick="{{save}}">{{saveL}}</button></div>
      </div><i class="bandv"></i><i class="sweep"></i></div>`;
  return `<div class="{{root}}">
  ${header({ mode: 'api', h: { cli: '{{cli}}', quota: '{{quota}}', gear: '{{gear}}' } })}
  <main class="grid">
    <section class="col">${projects('normal')}${log([])}</section>
    <section class="col">${home}<sc-if value="{{noCard}}" hint-placeholder-val="{{true}}">${comp}</sc-if><sc-if value="{{card}}" hint-placeholder-val="{{false}}">${key}</sc-if></section>
    ${changesEmpty('还没开始。API 模式改的文件也一个个出现在这里，撤销一样回到任务前快照。')}
  </main>
  <sc-if value="{{toastOn}}" hint-placeholder-val="{{false}}"><div class="toast">${px('bang')}<span>{{toast}}</span></div></sc-if>
</div>`;
}

export function boards() {
  const def = FLIP ? '浅色' : '深色';
  const logic = `
  constructor(p) { super(p); this.state = { kind: 0, card: false, step: 0, toast: '' }; }
  componentWillUnmount() { clearTimeout(this.tt); clearTimeout(this.t2); }
  say(m) { this.setState({ toast: m }); clearTimeout(this.tt); this.tt = setTimeout(() => this.setState({ toast: '' }), 2800); }
  renderVals() {
    const s = this.state, dark = (this.props.theme ?? '${def}') === '深色';
    const v = {
      root: 'pk pr dots ' + (dark ? 'dk' : 'lt'),
      one: s.kind !== 1, two: s.kind === 1, card: s.card, noCard: !s.card,
      m0a: 'on', m1a: '', m0b: '', m1b: 'on', acc: s.kind === 2 ? 'NO FILES' : 'EDIT',
      nokey: () => this.setState({ card: true, step: 0 }),
      cancel: () => this.setState({ card: false, step: 0 }),
      save: () => {
        if (s.step === 0) { this.setState({ step: 1 }); this.t2 = setTimeout(() => this.setState({ step: 2 }), 1200); }
        else if (s.step === 2) { this.setState({ card: false, step: 0 }); this.say('OpenAI 认证通过了；它还没有模型，去设置里加一个就能选'); }
      },
      keyMask: s.step === 0 ? 'sk-••••••••••••••••••••' : 'sk-••••••••••••••••••••',
      savedC: s.step >= 1 ? 'ok' : '', savedT: s.step >= 1 ? '已保存' : '还没保存',
      authC: s.step >= 2 ? 'ok' : '', authT: s.step >= 2 ? '认证通过' : (s.step === 1 ? '认证中…' : '还没认证'),
      saveL: s.step === 2 ? 'DONE' : 'SAVE & TEST',
      type: () => this.say('小样里不用真的写；这一张看的是 API 模式的选法和填 Key'),
      cli: () => this.say('CLI 模式就是第一轮那张小样'), quota: () => this.say('额度与花费在旁边那张板'), gear: () => this.say('设置在旁边那张板'),
      toastOn: !!s.toast, toast: s.toast,
    };
    for (let i = 0; i < 3; i++) { v['k' + i] = s.kind === i ? 'on' : ''; v['kt' + i] = s.kind === i ? 'rec' : 'lo'; v['pk' + i] = () => this.setState({ kind: i }); }
    return v;
  }`;
  const html = board({ title: '迁移测试 · API 模式', css: `${CSS}\n${EXTRA}`, body: body(), props: PROPS.theme(def), logic });
  return [{ file: 'S2b-Api.dc.html', title: '迁移测试 2 · API 模式（点 MORE 看填 Key）', html }];
}
