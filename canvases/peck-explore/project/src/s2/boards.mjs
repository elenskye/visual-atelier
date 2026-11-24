// 第 2 步 · 第一轮的两张板：能点的小样（S2-Proto）和流程一览（S2-Flow，同一份模板停在 8 个时刻）。
import { board, PROPS, SANS, DOTS, FLIP } from '../s1c/kit.mjs';
import { CSS, template, V, FRAMES } from './proto.mjs';

const HANDLERS = ['type', 'send', 'pw0', 'pw1', 'pw2', 'pw3', 'pa0', 'pa1', 'pa2', 'newTask', 'pp0', 'pp1', 'pp2', 'allow', 'deny', 'scope', 'po0', 'po1', 'po2', 'submit', 'later', 'busy', 'stop', 'again', 'undo', 'cancelUndo', 'doUndo', 'reset', 'api', 'gear'];

function proto() {
  const def = FLIP ? '浅色' : '深色';
  const logic = `
  constructor(p) { super(p); this.tm = []; this.state = this.init(); }
  init() { return { ph: 'home', who: 2, acc: 2, t: 0, nf: 0, no: 0, q: 0, ans: -1, perm: [true, true, false], permOk: false, permN: 0, permTxt: '', ts: [], toast: '' }; }
  componentDidMount() {
    this.iv = setInterval(() => {
      if (['plan', 'perm', 'edit', 'check', 'ask', 'check2', 'verify'].includes(this.state.ph)) this.setState({ t: this.state.t + 1 });
    }, 1000);
  }
  componentWillUnmount() { clearInterval(this.iv); clearTimeout(this.tt); this.clear(); }
  clear() { this.tm.forEach(clearTimeout); this.tm = []; }
  later(ms, fn) { this.tm.push(setTimeout(fn, ms)); }
  mark(i) { const ts = (this.state.ts || []).slice(); ts[i] = this.state.t; return ts; }
  go(ph, patch) {
    this.setState(Object.assign({ ph: ph }, patch || {}));
    if (ph === 'sending') this.later(1000, () => this.go('plan', { t: 0 }));
    if (ph === 'plan') this.later(3200, () => this.go('perm', { ts: this.mark(0) }));
    if (ph === 'edit') { for (let i = 1; i <= 5; i++) this.later(i * 700, () => this.setState({ nf: i })); this.later(5 * 700 + 600, () => this.go('check', { ts: this.mark(1), no: 0 })); }
    if (ph === 'check') { for (let i = 1; i <= 2; i++) this.later(i * 700, () => this.setState({ no: i })); this.later(2 * 700 + 700, () => this.go('ask', { q: 0 })); }
    if (ph === 'check2') { for (let i = 3; i <= 5; i++) this.later((i - 2) * 700, () => this.setState({ no: i })); this.later(3 * 700 + 600, () => this.go('verify', { ts: this.mark(2) })); }
    if (ph === 'verify') this.later(2400, () => this.go('done', { ts: this.mark(3) }));
    if (ph === 'undoing') this.later(1700, () => this.go('undone'));
  }
  say(msg) { this.setState({ toast: msg }); clearTimeout(this.tt); this.tt = setTimeout(() => this.setState({ toast: '' }), 2800); }
  renderVals() {
    const V = ${V.toString()};
    const s = this.state, ph = s.ph, dark = (this.props.theme ?? '${def}') === '深色';
    const home = ph === 'home' || ph === 'typed';
    const busy = ['plan', 'perm', 'edit', 'check', 'ask', 'check2', 'verify'].includes(ph);
    const v = V(s, dark);
    const who = (i) => () => (home ? this.setState({ who: i }) : this.say('谁来干在发任务前选；这个任务已经开始了'));
    const acc = (i) => () => (home ? this.setState({ acc: i }) : null);
    const pp = (i) => () => { const perm = s.perm.slice(); perm[i] = !perm[i]; this.setState({ perm: perm }); };
    const NAMES = ['删 2 个旧文件', '联网装依赖', '改项目外的 ~/.npmrc'];
    return Object.assign(v, {
      type: () => { if (ph === 'home') this.go('typed'); },
      send: () => {
        if (ph === 'home') return this.say('先点输入框写一句话');
        if (ph !== 'typed') return;
        if (s.acc !== 2) this.say('这一轮小样只走「直接改」这条路，已经切回 EDIT');
        this.go('sending', { acc: 2 });
      },
      pw0: who(0), pw1: who(1), pw2: who(2), pw3: who(3),
      pa0: acc(0), pa1: acc(1), pa2: acc(2),
      newTask: () => {
        if (busy) return this.say('同一个项目一次跑一个任务；这个跑完再开新的');
        if (!home) { this.clear(); this.setState(this.init()); }
      },
      pp0: pp(0), pp1: pp(1), pp2: pp(2),
      allow: () => {
        const n = s.perm.filter(Boolean).length;
        if (!n) return this.say('一项都没勾；真这样，' + v.doer + ' 会停下来问你改成怎么做');
        this.go('edit', { permOk: true, permN: n, permTxt: NAMES.filter((_, i) => s.perm[i]).join(' · '), nf: 0 });
      },
      deny: () => this.say('选 NO，' + v.doer + ' 会停下来问你要怎么改；小样先走 ALLOW 这条路'),
      scope: () => this.say('ONCE 只这一次；TASK 这个任务里都算数；PROJECT 这个项目以后都不再问'),
      po0: () => this.setState({ q: 0 }), po1: () => this.setState({ q: 1 }), po2: () => this.setState({ q: 2 }),
      submit: () => (s.q === 2 ? this.say('选「其他…」会出一个输入框让你写；小样里先选 1 或 2') : this.go('check2', { ans: s.q, no: 2 })),
      later: () => this.say('先放着：任务停在这里等你，左边这个任务一直标着「等你回答」'),
      busy: () => this.say('这个任务跑完再发下一句；要插话，先 STOP'),
      stop: () => this.say('STOP 会停在当前这一步，已经改的留着；小样里先不停'),
      again: () => this.say('演示到这里了；点左边 NEW TASK 或右上 RESET 从头再来'),
      undo: () => this.go('confirm'), cancelUndo: () => this.go('done'), doUndo: () => this.go('undoing'),
      reset: () => { this.clear(); this.setState(this.init()); },
      api: () => this.say('API 模式在后面几轮做'),
      gear: () => this.say('设置在迁移测试那轮做，只照这一步定下的规则画'),
    });
  }`;
  const html = board({ title: '能点的三栏小样', css: CSS, body: template(''), props: PROPS.theme(def), logic });
  return { file: 'S2-Proto.dc.html', x: 0, y: 0, title: '能点的三栏小样（按 Play 从头点到尾）', html };
}

const FLOW_CSS = `
.pk.flowb{width:1760px;height:800px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:18px;font-family:${SANS}}
.ft{display:flex;align-items:baseline;gap:18px}
.ft h1{font-size:22px;font-weight:600}
.ft p{font-size:13px;color:var(--tx2)}
.ft .lg{margin-left:auto;display:flex;gap:14px;font-size:12px;color:var(--tx2);white-space:nowrap}
.ft .lg b{font-family:${DOTS};font-weight:900;font-size:13px;color:var(--tx)}
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
`;

function flow() {
  const def = FLIP ? '浅色' : '深色';
  const cells = FRAMES.map((f, i) => `<div class="cell"><div class="fr" data-nolint="">${template(`f${i}.`)}</div>
    <div class="cap"><p class="ch"><span class="k">${f.k}</span><b>${f.nm}</b><span class="ms">${f.m.map((m) => `<i>${m}</i>`).join('')}</span></p><p>${f.d}</p></div></div>`).join('');
  const logic = `
  renderVals() {
    const V = ${V.toString()};
    const F = ${JSON.stringify(FRAMES.map((f) => f.s))};
    const dark = (this.props.theme ?? '${def}') === '深色';
    const noop = () => {};
    const H = ${JSON.stringify(HANDLERS)};
    const out = { root: 'pk flowb dots ' + (dark ? 'dk' : 'lt') };
    F.forEach((s, i) => {
      const v = V(Object.assign({ still: true, perm: [true, true, false], ts: [], ans: -1, permN: 0, permTxt: '' }, s), dark);
      H.forEach((k) => { v[k] = noop; });
      out['f' + i] = v;
    });
    return out;
  }`;
  const body = `<div class="{{root}}">
  <div class="ft"><h1>流程一览 · 8 个时刻</h1><p>和左边那张能点的小样是同一份界面，停在 8 个时刻。每格下面写这时候发生了什么、用了哪种动效。</p>
    <p class="lg"><span><b>M4</b> 点阵</span><span><b>M3</b> 弹扣</span><span><b>M1</b> 扫描</span></p></div>
  <div class="g8">${cells}</div>
</div>`;
  const html = board({ title: '流程一览', css: `${CSS}\n${FLOW_CSS}`, body, props: PROPS.theme(def), logic, w: 1760, h: 800 });
  return { file: 'S2-Flow.dc.html', x: 1360, y: 0, w: 1760, h: 800, title: '流程一览 · 8 个时刻（静止）', html };
}

export function boards() {
  return [proto(), flow()];
}
