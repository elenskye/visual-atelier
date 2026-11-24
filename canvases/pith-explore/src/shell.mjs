// R1 的外壳（根元素带 data-palette、data-theme 和 pith-smooth，换配色走方案的 palette-lake）。原注：EX11 的外壳：从 EX10 复制，Logo 只有蕨芽（去掉了 Logo 的 Tweaks），打开时 Logo 长一次（intro，2 秒后摘掉 .is-playing，之后悬停再长）。原注：EX10 的外壳：从 EX9 复制。这一轮：Tweaks 的「画法」换成「Logo」（髓心、蕨芽、叶段落）；存卡时种子按真位置从按钮飞到顶栏的知识库图标（offset-path，落点每次量）；
// 换配色是几圈湖面波纹，加一层水面的扭曲（SVG 滤镜，一次 1.4 秒）；对话在跑的时候输入框里是「在想」。原注：EX9（页 id ex10）的外壳：从 EX8 复制，配色进了状态（设置 › 外观、⌘K 都能换，Tweaks 的配色是起点），明暗三档（跟随系统就是 Tweaks 的明暗），图标跟 Tweaks 的「画法」走。原注：EX8（页 id ex9）的外壳：从 EX7 复制。这一轮：对话历史没有按钮，只能 ⌘\（Ctrl+\）或双指横滑叫出来（往右滑打开、往左滑收起）；
// Tweaks 加了配色（pal-N）和 Logo（mk-N）；生长阶段的小图标换成 marks.mjs 的三套。原注：EX7（页 id ex8）的外壳：从 EX6 复制，加了对话页的左栏（默认收起）、文献库的右侧面板和元信息的编辑。原注：EX6（页 id ex7）每张板的外壳和共用的状态，从 EX5 复制，加了可以自由拖动的画布（.js-pan 上的 --px、--py，拖的时候直接改 DOM，松手再记进状态）
// 和画布的镜头（board({ cams }) 传进来：去某一屏、某个知识库时镜头滑过去）、C 的对话收起（mini）。原注：EX5 加了 ⌘K 搜索框：一个方向一张 1280 × 800 的板，四屏（对话、知识库、文献库、设置 › 角色）共用一份状态，
// 能点着走完同一条任务（Pith 仓库 docs/atelier-handoff-2026-11-22.md 5.2）：
//   对话首页 → 点输入框，打出「# 读《国富论》 斯密为什么说……」→ 发送 → 一行短状态 → 回答带编号 → 点 [n] 看原文 →
//   去知识库那一段、去文献库那一条 → 存成概念卡 → 再点输入框打出「@审稿人 这个解释站得住吗？」→ 审稿人答、问要不要把 Young 1928 加进文献库。
//   设置 › 角色里把审稿人改成「说话再短一点」，回到对话，审稿人的回答跟着变短。存了的卡、加了的文献，在知识库、文献库里都看得到。
// 输入框里打 / @ # 会弹出技能、角色、知识库。⌘K（或 Ctrl+K、点角上的 ⌘K）呼出搜索框，去任何一屏、任何一个知识库、任何一个角色；Esc 关上。
// 画布型的方向没有入口，换屏全靠点画布上的地方和 ⌘K。减弱动态效果时全部直接到终态。Tweaks 只有明暗、开在哪一屏、对话从哪开始。
import { esc, dcBoard, screens as screensOf } from '../../_lib/board.mjs';
import * as C from './content.mjs';

export const W = 1280;
export const H = 800;
export const AT = [100, 450, 1000, 1550, 2050, 2750, 3450, 4000, 4500, 5000];
export const END = AT.length;
export const RAT = [100, 500, 1300, 2000];
export const REND = RAT.length;

const SCRIPT = (start, cams) => `
const CAMS = ${JSON.stringify(cams || {})};
const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const AT = ${JSON.stringify(AT)}, END = ${END}, RAT = ${JSON.stringify(RAT)}, REND = ${REND};
const Q = ${JSON.stringify(C.Q)}, RQ = ${JSON.stringify(C.RQ)};
const SCR = { '对话': 'chat', '知识库': 'kb', '文献库': 'lib', '设置': 'set' };
const CITES = ${JSON.stringify(C.CITES)};
const KBS = ${JSON.stringify(C.KBS)};
const MATS = ${JSON.stringify(C.MATS)};
const LIB = ${JSON.stringify(C.LIB)};
const ROLES = ${JSON.stringify(C.ROLES)};
const SKILLS = ${JSON.stringify(C.SKILLS)};
const STAGES = ${JSON.stringify(C.STAGES)};
const OTHERS = ${JSON.stringify(C.SETTINGS.slice(1))};
const PALS = ['纸与海', '雾与赭'];
class Component extends DCLogic {
  constructor(p) {
    super(p);
    this.timers = [];
    const after = p.begin === '问完以后';
    this.state = { scr: SCR[p.screen] || '${start}', ph: after ? 3 : 0, typed: after ? Q.length : 0, step: after ? END : 0, peek: -1, saved: false,
      rph: 0, rtyped: 0, rstep: 0, added: 0, menu: '', picks: [false, after, false, false], named: -1, chatRole: 1,
      kbSel: 1, kbZoom: false, matSel: -1, libSel: 0, roleSel: 2, terse: false, lp: false, pal: false, toast: '', tilt: false, mini: false, side: false, libPanel: false, libEdit: false, palN: PALS.indexOf(p.palette) + 1 || 1, lake: false, fly: '', fed: false, intro: true, look: 0, setTab: 'role', rip: 0, rx: 0, ry: 0, px: (CAMS.chat || [0, 0])[0], py: (CAMS.chat || [0, 0])[1], tick: 0 };
  }
  componentDidUpdate(pp, ps) {
    const key = this.camKey(this.state);
    if (key !== this.lastCam) { this.lastCam = key; if (CAMS[key]) { const [x, y] = CAMS[key]; if (x !== this.state.px || y !== this.state.py) this.setState({ px: x, py: y }); } }
    if (this.state.px !== this.lastPx || this.state.py !== this.lastPy) { this.lastPx = this.state.px; this.lastPy = this.state.py; this.applyPan(); }
    if (pp.screen !== this.props.screen && SCR[this.props.screen]) this.go(SCR[this.props.screen]);
    if (pp.palette !== this.props.palette && PALS.indexOf(this.props.palette) >= 0) this.setState({ palN: PALS.indexOf(this.props.palette) + 1 });
    if (pp.begin !== this.props.begin) { if (this.props.begin === '问完以后') this.jumpEnd(); else this.replay(); }
  }
  componentDidMount() {
    this.onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); this.setState({ pal: !this.state.pal, menu: '' }); }
      else if ((e.metaKey || e.ctrlKey) && (e.key === '\\\\' || e.code === 'Backslash')) { e.preventDefault(); this.toggleSide(); }
      else if (e.key === 'Escape') this.setState({ pal: false, menu: '', peek: -1, lp: false, side: false });
    };
    if (typeof window !== 'undefined') window.addEventListener('keydown', this.onKey);
    // 双指横滑：累计 wheel 的 deltaX，横向大过纵向才算；手指往右（自然滚动下 deltaX < 0）打开，往左收起。触发一次后 600ms 内不再认，免得惯性连着触发。
    this.onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const now = Date.now();
      if (now < (this.swipeLock || 0)) return;
      if (now - (this.swipeT || 0) > 220) this.swipeAcc = 0;
      this.swipeT = now; this.swipeAcc = (this.swipeAcc || 0) + e.deltaX;
      if (this.swipeAcc < -60 && !this.state.side) { this.swipeLock = now + 600; this.swipeAcc = 0; this.openSide(); }
      else if (this.swipeAcc > 60 && this.state.side) { this.swipeLock = now + 600; this.swipeAcc = 0; this.setState({ side: false }); }
    };
    if (typeof window !== 'undefined') window.addEventListener('wheel', this.onWheel, { passive: true });
    this.onMove = (e) => {
      const d = this.drag; if (!d) return;
      const x = d.px + (e.clientX - d.x0) / d.k, y = d.py + (e.clientY - d.y0) / d.k;
      d.x = x; d.y = y; d.moved = d.moved || Math.abs(e.clientX - d.x0) + Math.abs(e.clientY - d.y0) > 4;
      if (d.el) { d.el.style.setProperty('--px', x); d.el.style.setProperty('--py', y); }
    };
    this.onUp = () => {
      const d = this.drag; if (!d) return; this.drag = null;
      if (d.el) d.el.classList.remove('is-drag');
      if (d.moved) this.setState({ px: d.x, py: d.y });
    };
    if (typeof window !== 'undefined') { window.addEventListener('pointermove', this.onMove); window.addEventListener('pointerup', this.onUp); }
    this.lastCam = this.camKey(this.state); this.lastPx = this.state.px; this.lastPy = this.state.py;
    this.applyPan();
    this.introT = setTimeout(() => this.setState({ intro: false }), 2000);
  }
  applyPan() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.js-pan').forEach((el) => { el.style.setProperty('--px', this.state.px); el.style.setProperty('--py', this.state.py); });
  }
  camKey(s) { if (s.scr === 'chat' && s.ph === 3 && !s.mini && CAMS.thread) return 'thread'; return s.scr === 'kb' ? (s.kbZoom ? 'kb' + s.kbSel : 'kb') : s.scr; }
  dragStart(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target && e.target.closest && e.target.closest('button, input, .no-drag')) return;
    const el = document.querySelector('.js-pan'); if (!el) return;
    const k = el.parentElement ? el.parentElement.getBoundingClientRect().width / ${W} || 1 : 1;
    el.classList.add('is-drag');
    this.drag = { x0: e.clientX, y0: e.clientY, px: this.state.px, py: this.state.py, x: this.state.px, y: this.state.py, k, el, moved: false };
  }
  componentWillUnmount() { this.clear(); clearTimeout(this.introT); if (typeof window !== 'undefined') { window.removeEventListener('keydown', this.onKey); window.removeEventListener('wheel', this.onWheel); window.removeEventListener('pointermove', this.onMove); window.removeEventListener('pointerup', this.onUp); } }
  toPal(n, e) {
    if (n === this.state.palN) return;
    let rx = 640, ry = 400;
    const root = typeof document !== 'undefined' && document.querySelector('.x4');
    if (e && root && e.clientX !== undefined) { const r = root.getBoundingClientRect(), k = r.width / ${W} || 1; rx = (e.clientX - r.left) / k; ry = (e.clientY - r.top) / k; }
    this.setState({ palN: n, rip: 0, lake: true });
    this.later(20, () => { this.setState({ rip: 1, rx: Math.round(rx), ry: Math.round(ry) }); const a = typeof document !== 'undefined' && document.getElementById('pith-lake-anim'); if (a && a.beginElement) a.beginElement(); });
    this.later(1450, () => this.setState({ lake: false }));
    this.later(2300, () => this.setState({ rip: 0 }));
  }
  /** 存卡：种子从「存进……」那里出发，沿一条弧线落到顶栏知识库图标的正中，落下的那一刻图标晃一下、芽弹一下、+1。位置每次现量。 */
  saveCard(e) {
    if (this.state.saved) return;
    const root = typeof document !== 'undefined' && document.querySelector('.x4');
    const kb = root && root.querySelector('.a-ic[aria-label="知识库"]');
    let x0 = 760, y0 = 650, x1 = 584, y1 = 34;
    if (root && kb) {
      const r = root.getBoundingClientRect(), k = r.width / ${W} || 1, b = kb.getBoundingClientRect();
      x1 = (b.left + b.width / 2 - r.left) / k; y1 = (b.top + b.height / 2 - r.top) / k;
      const el = e && ((e.currentTarget && e.currentTarget.getBoundingClientRect && e.currentTarget) || (e.target && e.target.closest && e.target.closest('button')));
      const t = el ? el.getBoundingClientRect() : null;
      if (t) { x0 = (t.left + t.width / 2 - r.left) / k; y0 = (t.top + t.height / 2 - r.top) / k; }
    }
    const cx = (x0 + x1) / 2 + 120, cy = Math.min(y0, y1) - 40;
    this.setState({ saved: true, fly: \`M\${Math.round(x0)} \${Math.round(y0)}Q\${Math.round(cx)} \${Math.round(cy)} \${Math.round(x1)} \${Math.round(y1)}\` });
    this.later(820, () => this.setState({ fed: true }));
    this.later(1900, () => this.setState({ fed: false, fly: '' }));
  }
  openSide() { this.setState({ side: true, scr: 'chat', pal: false, menu: '', peek: -1, lp: false }); }
  toggleSide() { if (this.state.side) this.setState({ side: false }); else this.openSide(); }
  say(t) { this.setState({ toast: t }); clearTimeout(this.toastT); this.toastT = setTimeout(() => this.setState({ toast: '' }), 2200); }
  clear() { this.timers.forEach(clearTimeout); this.timers = []; }
  later(ms, fn) { this.timers.push(setTimeout(fn, ms)); }
  jumpEnd() { this.clear(); this.setState({ ph: 3, typed: Q.length, step: END, picks: [false, true, false, false], rph: 0, rtyped: 0, rstep: 0, peek: -1 }); }
  replay(role) {
    this.clear();
    this.setState({ scr: 'chat', ph: 0, typed: 0, step: 0, peek: -1, lp: false, saved: false, rph: 0, rtyped: 0, rstep: 0, added: 0, menu: '', picks: [false, false, false, false], named: -1, chatRole: role === undefined ? 1 : role, tick: this.state.tick + 1 });
  }
  type(key, text, phKey, done) {
    if (REDUCED) { this.setState({ [key]: text.length, [phKey]: done }); return; }
    for (let i = 1; i <= text.length; i++) this.later(i * 42, () => this.setState({ [key]: i }));
    this.later(text.length * 42 + 60, () => this.setState({ [phKey]: done }));
  }
  focus() {
    const s = this.state;
    if (s.mini) { this.setState({ mini: false }); return; }
    if (s.ph === 0) { this.setState({ ph: 1, menu: '', picks: [false, true, false, false] }); this.type('typed', Q, 'ph', 2); }
    else if (s.ph === 3 && s.step >= END && s.rph === 0) { this.setState({ rph: 1, menu: '' }); this.type('rtyped', RQ, 'rph', 2); }
  }
  send() {
    const s = this.state;
    if (s.ph === 1 || s.rph === 1) return;
    if (s.ph === 0) { this.focus(); return; }
    if (s.ph === 2) {
      this.clear(); this.setState({ ph: 3, step: 0, menu: '', mini: false });
      if (REDUCED) { this.setState({ step: END }); return; }
      AT.forEach((t, i) => this.later(t, () => this.setState({ step: i + 1 })));
      return;
    }
    if (s.rph === 0 && s.step >= END) { this.focus(); return; }
    if (s.rph === 2) {
      this.clear(); this.setState({ rph: 3, rstep: 0, menu: '', mini: false });
      if (REDUCED) { this.setState({ rstep: REND }); return; }
      RAT.forEach((t, i) => this.later(t, () => this.setState({ rstep: i + 1 })));
    }
  }
  go(scr) { this.setState({ scr, pal: false, tilt: false, side: false, menu: '', peek: scr === 'chat' ? this.state.peek : -1, lp: scr === 'chat' ? this.state.lp : false }); }
  renderVals() {
    const s = this.state;
    const done = s.step >= END;
    const revDone = s.rph === 3 && s.rstep >= 3;
    const thread = s.ph === 3;
    const typingRev = s.rph === 1 || s.rph === 2;
    const inText = typingRev ? RQ.slice(0, s.rtyped) : s.ph >= 1 && s.ph < 3 ? Q.slice(0, s.typed) : '';
    const kbN = KBS.map((k, i) => k.n + (i === 1 ? (s.saved ? 1 : 0) + (revDone ? 1 : 0) : 0));
    const role = ROLES[s.roleSel];
    const pk = s.peek >= 0 ? CITES[s.peek] : CITES[0];
    const mats = MATS[s.kbSel];
    const m = s.matSel >= 0 && mats[s.matSel] ? mats[s.matSel] : null;
    const v = {
      theme: s.look === 1 ? 'light' : s.look === 2 ? 'dark' : this.props.theme === 'dark' ? 'dark' : 'light',
      palId: ['paper-sea', 'mist-ochre'][s.palN - 1] || 'paper-sea', introCls: s.intro ? 'is-in' : '', lakeCls: s.lake ? 'is-lake' : '', isFly: !!s.fly, flyPath: s.fly, fedCls: s.fed ? 'is-fed' : '',
      isLook: s.setTab === 'look', isRole: s.setTab !== 'look', sRole: s.setTab !== 'look' ? 'is-on' : '', sLook: s.setTab === 'look' ? 'is-on' : '', sn0: s.setTab !== 'look' ? 'on' : '', sn6: s.setTab === 'look' ? 'on' : '',
      tabRole: () => this.setState({ setTab: 'role' }), tabLook: () => this.setState({ setTab: 'look' }),
      pc1: s.palN === 1 ? 'is-on' : '', pc2: s.palN === 2 ? 'is-on' : '', toPal1: (e) => this.toPal(1, e), toPal2: (e) => this.toPal(2, e),
      lk0: s.look === 0 ? 'is-on' : '', lk1: s.look === 1 ? 'is-on' : '', lk2: s.look === 2 ? 'is-on' : '', look0: () => this.setState({ look: 0 }), look1: () => this.setState({ look: 1 }), look2: () => this.setState({ look: 2 }),
      rip: !!s.rip, rx: String(s.rx), ry: String(s.ry),
      pgLook: () => this.setState({ scr: 'set', setTab: 'look', pal: false, menu: '', peek: -1, side: false }), swapPal: () => { const n = s.palN === 1 ? 2 : 1; this.setState({ pal: false }); this.toPal(n); this.say('换成了' + PALS[n - 1]); },
      scr: 'on-' + s.scr,
      isChat: s.scr === 'chat', isKb: s.scr === 'kb', isLib: s.scr === 'lib', isSet: s.scr === 'set',
      navChat: s.scr === 'chat' ? 'is-on' : '', navKb: s.scr === 'kb' ? 'is-on' : '', navLib: s.scr === 'lib' ? 'is-on' : '', navSet: s.scr === 'set' ? 'is-on' : '',
      goChat: () => this.go('chat'), goKb: () => this.go('kb'), goLib: () => this.go('lib'), goSet: () => this.go('set'),
      replay: () => this.replay(),
      isHome: !thread, isThread: thread, threadOn: thread ? 'is-on' : '', tick: 'k' + (s.tick % 2), stage: thread ? 'is-thread' : 'is-home', stepN: 'step-' + Math.min(s.step, END), kbNSel: String(kbN[s.kbSel]),
      inText, inEmpty: inText === '', inFull: inText !== '', inPh: thread ? (done && s.rph === 0 ? '接着问，或者 @审稿人 看看站不站得住' : '') : '问 Pith……',
      typing: s.ph === 1 || s.rph === 1 ? 'is-typing' : '', ready: s.ph === 2 || s.rph === 2 ? 'is-ready' : '',
      chipKb: s.picks[1] && !typingRev, focus: () => this.focus(), send: () => this.send(),
      busy: thread && !done ? 'is-busy' : s.rph === 3 && s.rstep < 3 ? 'is-busy' : '', isBusy: (thread && !done) || (s.rph === 3 && s.rstep < 3),
      done: done ? 'is-done' : '', idle: done && s.rph === 0 ? 'is-idle' : '',
      chatRole: ROLES[s.chatRole].name, chatMark: ROLES[s.chatRole].mark,
      saved: s.saved, unsaved: !s.saved, savedCls: s.saved ? 'is-saved' : '', grownCls: s.saved ? 'grown' : '', revCls: s.rph === 3 && s.rstep >= 3 ? 'is-rev' : '', youngCls: s.added === 1 ? 'is-young' : '', save: (e) => this.saveCard(e),
      revOn: s.rph === 3, terse: s.terse, verbose: !s.terse,
      qOpen: s.rph === 3 && s.rstep >= 4 && s.added === 0, added: s.added === 1, declined: s.added === 2,
      addYes: () => this.setState({ added: 1 }), addNo: () => this.setState({ added: 2 }),
      isPeek: s.peek >= 0 && s.scr === 'chat', pk, closePeek: () => this.setState({ peek: -1, lp: false }),
      libPane: s.lp, p2open: s.peek >= 0 ? 'is-open' : '', p3open: s.lp ? 'is-open' : '', p1spine: s.lp ? 'is-spine' : '', matCls: m ? 'is-mat' : '',
      toLibPane: () => this.setState({ lp: true, libSel: pk.lib }), closeLibPane: () => this.setState({ lp: false }),
      peekCls: s.peek >= 0 ? 'is-peek' : '', rot: 'rot-' + (s.peek + 1),
      toKb: () => this.setState({ scr: 'kb', kbSel: pk.kb, kbZoom: true, matSel: pk.mat, menu: '' }),
      toLib: () => this.setState({ scr: 'lib', libSel: pk.lib, menu: '' }),
      menuSlash: s.menu === 'slash' ? 'is-open' : '', menuAt: s.menu === 'at' ? 'is-open' : '', menuHash: s.menu === 'hash' ? 'is-open' : '',
      openSlash: () => this.setState({ menu: s.menu === 'slash' ? '' : 'slash' }), openAt: () => this.setState({ menu: s.menu === 'at' ? '' : 'at' }), openHash: () => this.setState({ menu: s.menu === 'hash' ? '' : 'hash' }),
      closeMenu: () => this.setState({ menu: '' }),
      isNamed: s.named >= 0, named: s.named >= 0 ? SKILLS[s.named].cmd + ' ' + SKILLS[s.named].name : '', unname: () => this.setState({ named: -1 }),
      kb: KBS[s.kbSel], kbZoom: s.kbZoom ? 'is-zoom' : '', cam: 'cam-' + s.scr + (s.scr === 'kb' && s.kbZoom ? s.kbSel : ''), sec: 'sec-' + s.kbSel,
      kbAll: () => this.setState({ kbZoom: false, matSel: -1 }),
      m: m || mats[0], matOpen: !!m, kbNoMat: !m, closeMat: () => this.setState({ matSel: -1 }), mStage: m ? STAGES[m.stage] : '',
      L: LIB[s.libSel], young: s.added === 1, notYoung: s.added !== 1,
      R: { ...role, chat0: role.chats[0], chat1: role.chats[1], desc: s.roleSel === 2 && s.terse ? role.desc + role.terse : role.desc }, isRev: s.roleSel === 2, terseCls: s.terse ? 'is-on' : '',
      toggleTerse: () => this.setState({ terse: !s.terse }), startChat: () => this.replay(s.roleSel),
      rc0: '', rc1: '', rc2: '', rc3: '',
      palCls: s.pal ? 'is-pal' : '', tiltCls: s.tilt || (s.peek >= 0 && s.scr === 'chat') ? 'is-tilt' : '', toggleTilt: () => this.setState({ tilt: !s.tilt, peek: -1, menu: '' }), isPal: s.pal, openPal: () => this.setState({ pal: !s.pal, menu: '' }), closePal: () => this.setState({ pal: false }),
      pgChat: () => this.go('chat'), pgLib: () => this.go('lib'), pgNew: () => this.replay(),
      isToast: !!s.toast, toast: s.toast,
      dragStart: (e) => this.dragStart(e), miniCls: s.mini ? 'is-mini' : '', isMini: s.mini, notMini: !s.mini, toggleMini: () => this.setState({ mini: !s.mini, peek: -1 }),
      recenter: () => { const c = CAMS[this.camKey(s)] || [0, 0]; this.setState({ px: c[0], py: c[1] }); },
      navAt: 'at-' + s.scr, sideCls: s.side ? 'is-side' : '', toggleSide: () => this.toggleSide(), closeSide: () => this.setState({ side: false }), isSide: s.side && s.scr === 'chat', pgSide: () => this.openSide(),
      newChat: () => { this.setState({ side: false }); this.replay(); }, pgOld: () => { this.setState({ side: false }); this.say('以前的对话这一轮没画，只画了今天这一段'); }, pgNow: () => this.setState({ side: false, scr: 'chat' }),
      libPanelCls: s.libPanel ? 'is-panel' : '', isLibPanel: s.libPanel, closeLib: () => this.setState({ libPanel: false, libEdit: false }),
      libEditCls: s.libEdit ? 'is-edit' : '', libEditing: s.libEdit, libViewing: !s.libEdit, editLib: () => this.setState({ libEdit: true }), saveLib: () => { this.setState({ libEdit: false }); this.say('元信息已保存'); }, readLib: () => this.say('阅读器这一轮没画'), dimCls: s.ph === 3 && !s.mini && s.scr === 'chat' ? 'is-dim' : '',
    };
    for (let k = 1; k <= END; k++) v['s' + k] = s.step >= k ? 'is-in' : '';
    for (let k = 1; k <= REND; k++) v['r' + k] = s.rph === 3 && s.rstep >= k ? 'is-in' : '';
    [[2, 3], [3, 4], [4, 5]].forEach(([a, b], i) => { v['st' + i] = s.step >= b ? 'is-done' : s.step >= a ? 'is-run' : ''; });
    v.rst = s.rph === 3 ? (s.rstep >= 3 ? 'is-done' : s.rstep >= 2 ? 'is-run' : '') : '';
    for (let i = 0; i < CITES.length; i++) { v['th' + (i + 1)] = s.peek === i && s.scr === 'chat' ? 'on' : ''; v['c' + (i + 1)] = s.peek === i ? 'is-on is-open' : ''; v['pk' + (i + 1)] = () => this.setState({ peek: s.peek === i ? -1 : i, lp: false, menu: '' }); }
    for (let i = 0; i < KBS.length; i++) {
      v['kc' + i] = s.picks[i] ? 'is-on' : ''; v['kp' + i] = () => { const picks = s.picks.slice(); picks[i] = !picks[i]; this.setState({ picks }); };
      v['kbc' + i] = s.kbSel === i ? 'is-on' : ''; v['kbIs' + i] = s.kbSel === i; v['kbShow' + i] = s.peek >= 0 && s.scr === 'chat' ? CITES[s.peek].kb === i : s.kbSel === i; v['kbN' + i] = String(kbN[i]);
      v['ks' + i] = () => this.setState({ kbSel: i, kbZoom: true, matSel: -1 });
      v['bh' + i] = (s.peek >= 0 && CITES[s.peek].kb === i && s.scr === 'chat') || (s.scr === 'kb' && s.kbSel === i) ? 'is-hot' : '';
      MATS[i].forEach((_, j) => { v['bud' + i + '_' + j] = () => this.setState({ scr: 'kb', kbSel: i, kbZoom: true, matSel: j, peek: -1, pal: false, menu: '' }); v['mc' + i + '_' + j] = s.kbSel === i && s.matSel === j ? 'is-on' : ''; v['ms' + i + '_' + j] = () => this.setState({ kbSel: i, kbZoom: true, matSel: s.kbSel === i && s.matSel === j ? -1 : j }); });
    }
    v.revDone = revDone;
    for (let i = 0; i < LIB.length; i++) { v['lc' + i] = s.libSel === i ? 'is-on' : ''; v['ls' + i] = () => this.setState({ libSel: i, libPanel: true, libEdit: false }); }
    for (let i = 0; i < ROLES.length; i++) {
      v['rc' + i] = s.roleSel === i ? 'is-on' : ''; v['roleIs' + i] = s.roleSel === i; v['rs' + i] = () => this.setState({ roleSel: i });
      v['ra' + i] = () => { if (i === 2) { this.setState({ menu: '' }); this.focus(); } else this.setState({ menu: '' }); };
    }
    for (let i = 0; i < SKILLS.length; i++) v['sk' + i] = () => this.setState({ named: i, menu: '' });
    for (let i = 0; i < KBS.length; i++) v['pgKb' + i] = () => this.setState({ scr: 'kb', kbSel: i, kbZoom: true, matSel: -1, pal: false, menu: '', peek: -1 });
    for (let i = 0; i < ROLES.length; i++) v['pgRole' + i] = () => this.setState({ scr: 'set', setTab: 'role', roleSel: i, pal: false, menu: '', peek: -1 });
    OTHERS.forEach((t, i) => { v['pgOther' + i] = () => { this.setState({ pal: false }); this.say('「' + t + '」这一轮没画，只画了角色和外观'); }; });
    v['pgOther' + OTHERS.indexOf('外观')] = v.pgLook;
    return v;
  }
}`;

/** 每张板都有的底：重置、红绿灯、减弱动态效果。 */
const BASE = `
html,body{margin:0}
.x4{position:relative;width:${W}px;height:${H}px;box-sizing:border-box;overflow:hidden;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.x4 *,.x4 *::before,.x4 *::after{box-sizing:border-box}
.x4 :where(h1,h2,h3,h4,p,ul,ol,li,figure,blockquote,dl,dt,dd,cite){margin:0;padding:0}
.x4 :where(ul,ol){list-style:none}
.x4 :where(cite,em){font-style:normal}
.x4 :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:inherit;-webkit-appearance:none;appearance:none}
.x4 :where(button:focus-visible){outline:2px solid currentColor;outline-offset:2px}
.x4 .num{font-variant-numeric:tabular-nums}
.x4 .nw{white-space:nowrap}
.x4 .tl{position:absolute;left:18px;top:16px;display:flex;gap:8px;z-index:30}
.x4 .tl i{display:block;width:12px;height:12px;border-radius:50%;background:#FF5F57;box-shadow:inset 0 0 0 .5px rgb(0 0 0 / .18)}
.x4 .tl i:nth-child(2){background:#FEBC2E}.x4 .tl i:nth-child(3){background:#28C840}
.x4 .scroll{display:flex;flex-direction:column-reverse;overflow-y:auto;scrollbar-width:none}
.x4 .scroll::-webkit-scrollbar{display:none}
.x4 .rv{opacity:0;transform:translateY(6px);transition:opacity 420ms ease,transform 520ms cubic-bezier(.23,1,.32,1)}
.x4 .rv.is-in{opacity:1;transform:none}
.x4 .js-pan.is-drag{transition:none!important;cursor:grabbing}
.x4 .caret{display:inline-block;width:1.5px;height:1.05em;margin-left:1px;vertical-align:-.15em;background:currentColor;opacity:0}
.x4 .is-typing .caret,.x4 .is-ready .caret{animation:x4-blink 1s steps(1) infinite}
@keyframes x4-blink{0%,49%{opacity:1}50%,100%{opacity:0}}
`;

/**
 * 一张方向板。
 * @param {object} o
 * @param {string} o.title   画板的 <title>
 * @param {string} o.cls     根元素的类（方向的作用域）
 * @param {string} o.fonts   <helmet> 里的字体
 * @param {string} o.css     这个方向的样式
 * @param {string} o.body    四屏的标记
 */
export function board({ title, cls, fonts = '', css, body, start = '对话', cams = null, theme = 'light', palette: pal = '纸与海' }) {
  const props = {
    theme: { editor: 'enum', options: ['light', 'dark'], default: theme, section: '外观' },
    palette: { editor: 'enum', options: ['纸与海', '雾与赭'], default: pal, section: '配色（起点，App 里也能换）' },
    screen: { editor: 'enum', options: ['对话', '知识库', '文献库', '设置'], default: start, section: '开在哪一屏' },
    begin: { editor: 'enum', options: ['刚打开', '问完以后'], default: '刚打开', section: '对话从哪开始' },
    $preview: { width: W, height: H },
  };
  const startId = { '对话': 'chat', '知识库': 'kb', '文献库': 'lib', '设置': 'set' }[start];
  return dcBoard({
    title,
    helmet: `${fonts}<style>
${BASE.trim()}
${css.trim()}
@media (prefers-reduced-motion: reduce){.x4 *,.x4 *::before,.x4 *::after{animation-duration:1ms!important;animation-delay:0ms!important;animation-iteration-count:1!important;transition-duration:1ms!important;transition-delay:0ms!important}}
</style>
`,
    body: `<div class="x4 pith-smooth ${cls} {{scr}}" data-palette="{{palId}}" data-theme="{{theme}}">\n${body.trim()}\n</div>`,
    props,
    script: SCRIPT(startId, cams),
  });
}

/** 四屏各包一层 sc-if。 */
export const screens = ({ chat, kb, lib, set }) => screensOf([
  { when: 'isChat', html: chat }, { when: 'isKb', html: kb }, { when: 'isLib', html: lib }, { when: 'isSet', html: set },
]);

/** 把 [n] 换成引用（mark(n) 由方向自己画），编号前两个字和编号绑在一起不断行。 */
export function cited(text, mark) {
  const parts = text.split(/(\[\d\])/);
  let html = '';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const m = p.match(/^\[(\d)\]$/);
    if (m) continue;
    const next = parts[i + 1] && parts[i + 1].match(/^\[(\d)\]$/);
    if (next) {
      const chars = [...p];
      const tail = chars.slice(-2).join('');
      html += esc(chars.slice(0, -2).join('')) + `<span class="nw">${esc(tail)}${mark(Number(next[1]))}</span>`;
    } else html += esc(p);
  }
  return html;
}

export { stageIcon } from './marks.mjs';

export { esc, C };

/** ⌘K 搜索框（每个方向自己画样子，结构一样）：p 是类名前缀。行的文字：种类 + 名字 + 右边一行小字。 */
export function palette(p) {
  const row = (on, kind, name, right) => `<button type="button" class="${p}-row" onClick="{{${on}}}"><span class="${p}-k">${kind}</span><span class="${p}-n">${esc(name)}</span><span class="${p}-r">${esc(right)}</span></button>`;
  return `<sc-if value="{{isPal}}" hint-placeholder-val="{{ false }}"><div class="${p}-scrim" onClick="{{closePal}}"></div><div class="${p}" role="dialog" aria-label="搜索框">
<p class="${p}-in"><span class="${p}-ph">去哪儿、找什么，或者直接问……</span><kbd>esc</kbd></p>
<div class="${p}-list">
<p class="${p}-g">对话</p>${row('pgChat', '对话', C.Q, '伴读 · 今天')}${row('pgNew', '对话', '新对话', '⌘N')}${row('pgSide', '对话', '以前的对话', '⌘\\ 或双指往右滑')}
<p class="${p}-g">外观</p>${row('swapPal', '配色', '换一套配色', '纸与海 ↔ 雾与赭')}${row('pgLook', '设置', '外观', '配色和明暗')}
<p class="${p}-g">知识库</p>${C.KBS.map((k, i) => row('pgKb' + i, '知识库', k.name, `${k.n} 份`)).join('')}
<p class="${p}-g">文献库</p>${row('pgLib', '文献库', '全部文献', '6 条')}
<p class="${p}-g">设置</p>${C.ROLES.map((r, i) => row('pgRole' + i, '角色', r.name, r.line)).join('')}${C.SETTINGS.slice(1).map((t, i) => row('pgOther' + i, '设置', t, '')).join('')}
</div></div></sc-if>`;
}

/** 一闪而过的提示。 */
export const toast = (cls) => `<sc-if value="{{isToast}}" hint-placeholder-val="{{ false }}"><p class="${cls}">{{toast}}</p></sc-if>`;
