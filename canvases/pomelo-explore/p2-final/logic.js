// 两套小样共用的交互（画板脚本，经典 JS）。CFG、DATA 由生成器写在前面。
// 拖动、惯性、撕贴纸都直接改元素的 transform（每帧重画整块画板太慢），松手后再记进状态。
const PAL_KEYS = ['blue', 'purple', 'kraft', 'yellow', 'mint'];
const PAL_NAMES = ['蓝笔 · 方格纸', '紫笔 · 樱粉荧光', '黑笔 · 牛皮纸', '柚黄桌面', '薄荷桌面'];
const SCREENS = { home: 'home', money: 'money', pomelo: 'ask' };

class Component extends DCLogic {
  constructor(props) {
    super(props);
    const s = CFG.start;
    this.state = {
      scr: ['jump', 'book', 'search', 'year'].includes(s) ? 'home' : s, mod: 'home', jump: s === 'jump' ? 'in' : null, book: s === 'book' ? 'in' : null,
      tabs: ['home', 'money', 'pomelo'], face: 'normal', faceBig: 'normal',
      todos: DATA.todosDone.slice(), pop: -1, peeled: false,
      sub: 'entries', turn: null, row: -1, panel: null, flash: -1,
      q: '', chat: DATA.chat0, phase: 'idle', confirmed: false, stamp: false, input: '',
      pal: null, dark: null, cfg: false, flipped: false, flipAnim: false, greet: 0, toast: '',
      deskIn: true, search: s === 'search' ? 'in' : null, sq: s === 'search' ? '柚子' : '', ssel: 0, sgen: 0, tear: false,
      env: 'closed', zine: null, zp: 0, confetti: false, auto: false, music: false, rec: null, echoUp: false, turning: -1, allDone: false, dizzy: false, whlSpin: false,
    };
    if (CFG.tabs) this.state.tabs = CFG.tabs.slice();
    if (s === 'money' || s === 'search') this.state.mod = s === 'money' ? 'money' : 'home';
    if (s === 'ask') { this.state.mod = 'pomelo'; this.state.scr = 'ask'; }
    this.np = JSON.parse(JSON.stringify(DATA.notes || {}));
    this.els = {};
    this.ang = -8;
    this.T = [];
    this.rm = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.h = this.makeHandlers();
    this.lastKey = this.state.chat.length + this.state.phase;
  }

  componentDidMount() {
    this.lastMove = Date.now();
    // 小彩蛋：二十秒没动，柚子就睡着了；鼠标一动它吓一跳
    this.idle = setInterval(() => {
      const S = this.state;
      if (Date.now() - this.lastMove > 20000 && S.face === 'normal' && !S.jump && !S.book && !S.search && !S.zine) this.setState({ face: 'sleepy' });
    }, 2000);
    if (CFG.start === 'jump' || CFG.start === 'book') this.faceFor('wow', 1000);
    else if (CFG.start === 'home') this.faceFor('wink', 1100);
    this.later(() => this.setState({ deskIn: false }), 2200);
  }
  componentWillUnmount() { this.T.forEach(clearTimeout); cancelAnimationFrame(this.raf); clearInterval(this.idle); }
  componentDidUpdate() {
    const key = this.state.chat.length + this.state.phase;
    if (key !== this.lastKey) {
      this.lastKey = key;
      const el = this.els.msgs;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: this.rm ? 'auto' : 'smooth' });
    }
  }
  later(fn, ms) { const t = setTimeout(fn, this.rm ? Math.min(ms, 30) : ms); this.T.push(t); return t; }
  faceFor(f, ms, big) {
    clearTimeout(this.faceT);
    this.setState(big ? { face: f, faceBig: f } : { face: f });
    this.faceT = this.later(() => this.setState({ face: 'normal', faceBig: this.state.phase === 'think' ? 'think' : 'normal' }), ms);
  }

  // ---------- 跳转 ----------
  go(id) {
    const st = { jump: this.state.jump ? 'out' : null, book: this.state.book ? 'out' : null, search: null, tear: false, zine: null, cfg: false, panel: null, row: -1, mod: id };
    if (id === 'home') st.scr = 'home';
    else if (id === 'money') st.scr = 'money';
    else if (id === 'pomelo') st.scr = 'ask';
    else st.scr = 'stub';
    if (!this.state.tabs.includes(id)) st.tabs = [...this.state.tabs, id];
    this.setState(st);
    if (this.state.jump || this.state.book) this.later(() => this.setState({ jump: null, book: null, q: '' }), 230);
    if (id === 'home') { this.setState({ greet: this.state.greet + 1 }); this.faceFor('wink', 900); }
    else this.faceFor(st.scr === 'stub' ? 'surprised' : 'happy', 900);
  }
  openJump() {
    if (this.state.jump === 'in') return this.closeJump();
    this.setState({ jump: 'in', book: null, cfg: false, q: '' });
    this.faceFor('wow', 900);
  }
  openBook() {
    if (this.state.book === 'in') return this.closeBook();
    this.setState({ book: 'in', jump: null, cfg: false, q: '' });
    this.faceFor('wow', 900);
  }
  closeBook() {
    if (!this.state.book) return;
    this.setState({ book: 'out' });
    this.later(() => this.setState({ book: null, q: '' }), 230);
  }
  closeJump() {
    if (!this.state.jump) return;
    this.setState({ jump: 'out' });
    this.later(() => this.setState({ jump: null, q: '' }), 220);
  }
  // ---------- 搜索：小票打印机 ----------
  openSearch() {
    if (this.state.search === 'in') return this.closeSearch();
    this.setState({ search: 'in', jump: null, book: null, cfg: false, sq: '', ssel: 0, tear: false }, () => this.els.sq && this.els.sq.focus());
  }
  closeSearch() {
    if (!this.state.search) return;
    this.setState({ search: 'out' });
    this.later(() => this.setState({ search: null, tear: false }), 260);
  }
  searchHits() {
    const q = this.state.sq.trim();
    if (!q) return { groups: [], near: [] };
    const order = Object.keys(DATA.mods);
    const hits = DATA.index.filter(([m, t, d]) => t.includes(q) || d.includes(q) || DATA.mods[m].name.includes(q));
    const groups = [];
    for (const m of order) { const rows = hits.filter((h) => h[0] === m).slice(0, 3); if (rows.length) groups.push({ mod: m, rows }); }
    const near = (DATA.near[q] || []).map((h) => ({ mod: h[0], rows: [h] }));
    return { groups: groups.slice(0, 5), near };
  }
  searchFlat() {
    const { groups, near } = this.searchHits();
    return [...groups, ...near].flatMap((g) => g.rows.map((r) => r[0]));
  }
  spick(k) {
    const flat = this.searchFlat();
    if (!flat.length || this.state.tear) return;
    const mod = flat[Math.max(0, Math.min(flat.length - 1, k))];
    this.setState({ tear: true });
    this.later(() => { this.setState({ search: null, tear: false }); this.go(mod); }, 340);
  }

  // ---------- 年度小报（Atlas 年度总结的初稿） ----------
  // 拆信封：封口贴纸撕掉 → 翻盖翻到后面 → 小报升起来 → 放大成一本合着的书 → 按节拍自动翻
  openEnv() {
    if (this.state.env === 'open') return this.showZine(0);
    this.setState({ env: 'open' });
    this.faceFor('wow', 1000);
    this.later(() => this.showZine(0), 1250);
  }
  showZine(zp) {
    clearTimeout(this.autoT);
    this.setState({ zine: 'in', zp, confetti: false, rec: null, echoUp: false, auto: !this.rm, turning: -1 });
    setTimeout(() => this.els.zine && this.els.zine.focus({ preventScroll: true }), 60);
    this.schedAuto(700);
  }
  closeZine() {
    if (!this.state.zine) return;
    clearTimeout(this.autoT);
    this.setState({ zine: 'out', rec: null });
    this.later(() => this.setState({ zine: null, confetti: false }), 300);
  }
  // 自动往下走：每个跨页停几拍（一拍 0.8 秒），终章不走；减弱动态效果时默认不自动翻
  schedAuto(extra = 0) {
    clearTimeout(this.autoT);
    const S = this.state;
    if (!S.auto || !S.zine || S.rec) return;
    const beats = DATA.zine.beats[S.zp];
    if (!beats) return;
    this.autoT = setTimeout(() => this.turnZine(1, true), beats * DATA.zine.beat + extra);
  }
  pauseAuto() { clearTimeout(this.autoT); if (this.state.auto) this.setState({ auto: false }); }
  turnZine(dir, fromAuto) {
    if (!fromAuto) this.pauseAuto();
    this.goSpread(Math.max(0, Math.min(5, this.state.zp + dir)), fromAuto);
  }
  goSpread(zp, fromAuto) {
    const from = this.state.zp;
    if (zp === from) return;
    const turning = zp > from ? zp - 1 : zp;
    this.setState({ zp, confetti: false, echoUp: false, turning });
    clearTimeout(this.turnT);
    this.turnT = this.later(() => this.setState({ turning: -1 }), 850);
    if (zp === 5) this.later(() => { this.setState({ confetti: true }); this.faceFor('happy', 1400); }, 820);
    if (fromAuto) setTimeout(() => this.schedAuto(), 0);
  }
  // 拖页角翻页：右半边往左拖翻下一页，左半边往右拖翻回来；松手过一半就翻过去
  zineDown(e) {
    if (e.target.closest && e.target.closest('button,.nodrag')) return;
    this.pauseAuto();
    const box = e.currentTarget.getBoundingClientRect();
    const zp = this.state.zp;
    const right = zp === 0 || e.clientX > box.left + box.width / 2;
    const i = right ? zp : zp - 1;
    const leaf = this.els['leaf' + i];
    if (!leaf || i < 0 || i > 4) return;
    const base = right ? 0 : -180;
    let a = base;
    this.drag(e, {
      start: () => { leaf.style.transition = 'none'; },
      move: (d) => {
        a = Math.max(-180, Math.min(0, base + ((d.x - d.x0) / 400) * 180));
        leaf.style.transform = `rotateY(${a.toFixed(1)}deg)`;
      },
      end: (d) => {
        leaf.style.transition = '';
        leaf.style.transform = '';
        const go = right ? (a < -70 || d.vx < -6) : (a > -110 || d.vx > 6);
        if (go) this.turnZine(right ? 1 : -1);
      },
      click: () => { leaf.style.transition = ''; this.turnZine(right ? 1 : -1); },
    });
  }
  // 点星星：那一天留下了几条、都是什么
  jarTap(e) {
    const t = e.target.closest && e.target.closest('[data-d]');
    if (!t) return;
    const [m, d, n, c] = DATA.zine.days[+t.getAttribute('data-d')];
    const name = DATA.zine.catMod[c];
    const key = `day${m}-${d}`;
    const special = { 'day5-20': 't3', 'day7-8': 't4', 'day3-14': 'echo26', 'day2-9': 't1', 'day11-1': 'note1' }[key];
    const base = special ? DATA.zine.recs[special] : null;
    this.recData = { mod: base ? base.mod : '', modName: base ? base.modName : name, date: `2026 年 ${m} 月 ${d} 日 · 留下了 ${n} 条`, title: base ? base.title : `这天记得最多的是${name}`, text: base ? base.text : `${name} ${Math.max(1, n - 1)} 条${n > 1 ? `，还有 1 条别的` : ''}。点开去${name}里看那天。` };
    this.pauseAuto();
    this.setState({ rec: key });
  }
  openRec(id) { this.recData = DATA.zine.recs[id]; this.pauseAuto(); this.setState({ rec: id }); }

  matches() {
    const q = this.state.q.trim();
    if (!q) return null;
    return Object.keys(DATA.mods).filter((id) => id !== 'home' && DATA.mods[id].name.includes(q));
  }
  submitJump() {
    const m = this.matches();
    if (m && m.length) return this.go(m[0]);
    const q = this.state.q.trim();
    if (q) this.ask(q, true);
  }

  // ---------- 柚子 ----------
  ask(text, fromJump) {
    if (!text || this.state.phase === 'think') return;
    const chat = [...this.state.chat, { me: 1, text }];
    const st = { chat, phase: 'think', input: '', faceBig: 'think', face: 'think' };
    if (fromJump) Object.assign(st, { scr: 'ask', mod: 'pomelo', jump: this.state.jump ? 'out' : null, book: this.state.book ? 'out' : null, tabs: this.state.tabs.includes('pomelo') ? this.state.tabs : [...this.state.tabs, 'pomelo'] });
    this.setState(st);
    if (fromJump) this.later(() => this.setState({ jump: null, book: null, q: '' }), 230);
    this.later(() => {
      const a = DATA.answers[text] || DATA.answers['*'];
      const n = a.segs.reduce((s, x) => s + x[0].length, 0);
      this.setState({ chat: [...this.state.chat, { yz: 1, live: 1, ...a }], phase: 'answer', faceBig: 'happy', face: 'happy' });
      this.later(() => this.setState({ phase: 'idle', faceBig: 'normal', face: 'normal' }), (this.rm ? 0 : n * 24) + 900);
    }, 1900);
  }

  // ---------- 拖动（便签、贴纸、柚子瓣） ----------
  drag(e, opts) {
    const el = e.currentTarget;
    if (e.button !== undefined && e.button !== 0) return;
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    const d = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0, moved: false, el, ...opts };
    this.dg = d;
    cancelAnimationFrame(this.raf);
    opts.start && opts.start(d, e);
  }
  dragMove(e) {
    const d = this.dg;
    if (!d) return;
    const now = performance.now(), dt = Math.max(1, now - d.t);
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    d.vx = 0.7 * d.vx + 0.3 * (dx / dt) * 16; d.vy = 0.7 * d.vy + 0.3 * (dy / dt) * 16;
    d.x = e.clientX; d.y = e.clientY; d.t = now;
    if (!d.moved && Math.hypot(d.x - d.x0, d.y - d.y0) > 4) d.moved = true;
    if (d.moved) d.move(d, dx, dy, e);
  }
  dragEnd(e) {
    const d = this.dg;
    if (!d) return;
    this.dg = null;
    if (!d.moved) return d.click && d.click(d, e);
    if (performance.now() - d.t > 90) { d.vx = 0; d.vy = 0; }
    d.end(d, e);
  }
  // 惯性：每帧乘摩擦，速度小于阈值停下；step 可以返回新的速度（碰到边弹回）；停下后调 done
  coast(step, vx, vy, fr = 0.92, done) {
    if (this.rm) return done && done();
    const tick = () => {
      vx *= fr; vy *= fr;
      if (Math.hypot(vx, vy) < 0.15) return done && done();
      const nv = step(vx, vy);
      if (nv) [vx, vy] = nv;
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  // B3 便签：拖着走，松手有惯性，碰到桌边弹回。位置只用 translate；纸的歪用 --r，字不跟着歪；停下时位置取整
  noteTf(id) { const p = this.np[id]; return `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`; }
  noteR(id) { return this.np[id].r.toFixed(2) + 'deg'; }
  noteDown(id, e) {
    if (e.target.closest && e.target.closest('button,input,.nodrag,.peel')) return;
    const el = e.currentTarget;
    this.z = (this.z || 20) + 1;
    el.style.zIndex = this.z;
    this.np[id].z = this.z;
    const p = this.np[id], b = DATA.noteBox[id];
    const paint = () => { el.style.transform = this.noteTf(id); el.style.setProperty('--r', this.noteR(id)); };
    const settle = () => { p.x = Math.round(p.x); p.y = Math.round(p.y); paint(); this.forceUpdate(); };
    this.drag(e, {
      start: () => el.classList.add('lift'),
      move: (d, dx, dy) => {
        p.x += dx; p.y += dy; p.r = Math.max(-6, Math.min(6, p.r + dx * 0.02));
        paint();
      },
      end: (d) => {
        el.classList.remove('lift');
        this.coast((vx, vy) => {
          p.x += vx; p.y += vy;
          if (p.x + b[0] < 8 || p.x + b[0] + b[2] > 1272) { p.x -= vx; vx = -vx * 0.5; }
          if (p.y + b[1] < 56 || p.y + b[1] + b[3] > 792) { p.y -= vy; vy = -vy * 0.5; }
          p.r = Math.max(-6, Math.min(6, p.r + vx * 0.03));
          paint();
          return [vx, vy];
        }, d.vx, d.vy, 0.92, settle);
      },
      click: () => el.classList.remove('lift'),
    });
  }

  // 撕贴纸：朝拖的方向翻起来，翻过去露出白色的背面和底下的字；松手像掉回去一样落下、轻轻弹一下贴好。
  // 底下的字一直在，贴着时被贴纸盖住，所以收回时不会闪。
  peelDown(e) {
    const el = e.currentTarget;
    if (this.peelAnim) { this.peelAnim.cancel(); this.peelAnim = null; }
    clearTimeout(this.peelT);
    const pose = { ax: 0, ay: 0, a: 0 };
    const set = () => { el.style.transform = `perspective(420px) rotate3d(${pose.ax.toFixed(3)}, ${pose.ay.toFixed(3)}, 0, ${pose.a.toFixed(1)}deg)`; };
    this.drag(e, {
      move: (d) => {
        const dx = d.x - d.x0, dy = d.y - d.y0;
        const len = Math.hypot(dx, dy) || 1;
        el.style.transformOrigin = `${dx < 0 ? '0%' : '100%'} ${dy < 0 ? '0%' : '100%'}`;
        pose.ax = -dy / len; pose.ay = dx / len; pose.a = Math.min(165, len * 1.7);
        set();
      },
      end: () => this.peelBack(el, pose),
      click: () => this.peelUp(el, pose, set),
    });
  }
  // 点一下（或回车、空格）：贴纸往上翻起来，翻到桌面空着的地方，不挡卡片里的字；停一会儿再落回去
  peelUp(el, pose, set) {
    el.style.transformOrigin = '50% 0%';
    Object.assign(pose, { ax: 1, ay: 0, a: 150 });
    const mk = (deg) => `perspective(420px) rotate3d(1, 0, 0, ${deg}deg)`;
    this.peelAnim = el.animate([{ transform: mk(0) }, { transform: mk(162), offset: 0.7 }, { transform: mk(150) }], { duration: this.rm ? 1 : 520, easing: 'cubic-bezier(.3,.7,.4,1)' });
    set();
    this.peelT = setTimeout(() => this.peelBack(el, pose), 2400);
  }
  peelKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const el = e.currentTarget;
    if (this.peelAnim) { this.peelAnim.cancel(); this.peelAnim = null; }
    clearTimeout(this.peelT);
    const pose = { ax: 0, ay: 0, a: 0 };
    const set = () => { el.style.transform = `perspective(420px) rotate3d(${pose.ax.toFixed(3)}, ${pose.ay.toFixed(3)}, 0, ${pose.a.toFixed(1)}deg)`; };
    this.peelUp(el, pose, set);
  }
  peelBack(el, pose) {
    const mk = (deg) => `perspective(420px) rotate3d(${pose.ax.toFixed(3)}, ${pose.ay.toFixed(3)}, 0, ${deg}deg)`;
    const a = pose.a;
    el.style.transform = mk(0);
    const done = () => { el.style.transform = ''; el.style.transformOrigin = ''; this.peelAnim = null; };
    if (this.rm || a < 1) return done();
    // 先像掉下去一样越落越快，碰到纸面往下压一点，再弹回来贴平
    this.peelAnim = el.animate([
      { transform: mk(a), easing: 'cubic-bezier(.45,0,.9,.55)' },
      { transform: mk(-9), offset: 0.58, easing: 'cubic-bezier(.2,.6,.35,1)' },
      { transform: mk(4), offset: 0.78, easing: 'ease-in-out' },
      { transform: mk(-1.5), offset: 0.9, easing: 'ease-in-out' },
      { transform: mk(0) },
    ], { duration: 380 + a * 2.4 });
    this.peelAnim.onfinish = done;
    this.later(() => this.faceFor('wink', 900), Math.round((380 + a * 2.4) * 0.58));
  }

  // A 柚子瓣：拖着转，松手接着转一会儿
  wheelDown(e) {
    const box = e.currentTarget.getBoundingClientRect();
    const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    const el = e.currentTarget;
    const angOf = (x, y) => Math.atan2(y - cy, x - cx) * 180 / Math.PI;
    let last = angOf(e.clientX, e.clientY), w = 0, lt = performance.now();
    if (e.target.closest && e.target.closest('input,.nodrag')) return;
    this.drag(e, {
      move: (d) => {
        const a = angOf(d.x, d.y);
        let da = a - last; if (da > 180) da -= 360; if (da < -180) da += 360;
        const now = performance.now();
        w = 0.6 * w + 0.4 * (da / Math.max(1, now - lt)) * 16; lt = now;
        last = a; this.ang += da;
        el.style.setProperty('--a', this.ang.toFixed(2) + 'deg');
      },
      end: () => {
        if (performance.now() - lt > 90) w = 0;
        this.coast((v) => { this.ang += v; el.style.setProperty('--a', this.ang.toFixed(2) + 'deg'); }, w, 0, 0.95);
      },
      click: (d, ev) => {
        const t = document.elementFromPoint(ev.clientX, ev.clientY);
        const slot = t && t.closest && t.closest('[data-mod]');
        if (slot) this.go(slot.getAttribute('data-mod'));
      },
    });
  }

  // B3 贴纸册：点一下撕下来飞走；拖出册子放到桌上也行
  stickerDown(id, e) {
    const el = e.currentTarget;
    const r0 = el.getBoundingClientRect();
    this.drag(e, {
      start: () => { el.classList.add('peeling'); },
      move: (d) => {
        el.classList.add('held');
        const dx = d.x - d.x0, dy = d.y - d.y0;
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${(dx * 0.05).toFixed(1)}deg) scale(1.12)`;
      },
      end: (d) => {
        const book = this.els.book && this.els.book.getBoundingClientRect();
        el.classList.remove('peeling', 'held');
        if (book && d.y < book.top + 10) { el.style.opacity = '0'; this.go(id); return; }
        el.style.transform = '';
      },
      click: () => {
        el.classList.remove('peeling');
        el.classList.add('flyoff');
        this.later(() => this.go(id), this.rm ? 0 : 420);
      },
    });
    void r0;
  }

  // ---------- 钱来钱往 ----------
  setSub(s) {
    if (s === this.state.sub) return;
    if (s !== 'entries' && s !== 'assets') { this.setState({ toast: '这一页小样里没画' }); this.later(() => this.setState({ toast: '' }), 1400); return; }
    this.setState({ turn: this.rm ? null : this.state.sub, sub: s, panel: null, row: -1 });
    this.later(() => this.setState({ turn: null }), 760);
  }
  openRow(i) {
    this.setState({ row: i, panel: 'in' });
  }
  closePanel(saved) {
    const r = this.state.row;
    this.setState({ panel: 'out' });
    this.later(() => this.setState({ panel: null, row: -1, flash: saved ? r : -1 }), 260);
    if (saved) { this.faceFor('happy', 1200); this.later(() => this.setState({ flash: -1 }), 1500); }
  }

  makeHandlers() {
    const H = {
      openJump: () => this.openJump(),
      closeJump: () => this.closeJump(),
      jumpBg: (e) => { if (e.target === e.currentTarget) this.closeJump(); },
      openBook: () => this.openBook(),
      bookBg: (e) => { if (e.target === e.currentTarget) this.closeBook(); },
      onQ: (e) => {
        const v = e.target.value;
        this.setState({ q: v });
        if (v.trim() === '柚子' && this.state.jump) { this.setState({ whlSpin: true }); this.faceFor('happy', 1400); this.later(() => this.setState({ whlSpin: false }), 1300); }
      },
      rootMove: () => { this.lastMove = Date.now(); if (this.state.face === 'sleepy') this.faceFor('surprised', 900); },
      openSearch: () => this.openSearch(),
      srBg: (e) => { if (e.target === e.currentTarget) this.closeSearch(); },
      onSQ: (e) => this.setState({ sq: e.target.value, ssel: 0, sgen: this.state.sgen + 1 }),
      sKey: (e) => {
        const n = this.searchFlat().length;
        if (e.key === 'ArrowDown') { e.preventDefault(); this.setState({ ssel: Math.min(n - 1, this.state.ssel + 1) }); }
        if (e.key === 'ArrowUp') { e.preventDefault(); this.setState({ ssel: Math.max(0, this.state.ssel - 1) }); }
        if (e.key === 'Enter') this.spick(this.state.ssel);
        if (e.key === 'Escape') this.closeSearch();
      },
      sAsk: () => { const q = this.state.sq.trim(); this.setState({ search: null }); this.ask(q, true); },
      openEnv: () => this.openEnv(),
      closeZine: () => this.closeZine(),
      zineBg: (e) => { if (e.target === e.currentTarget) this.closeZine(); },
      zNext: () => this.turnZine(1),
      zPrev: () => this.turnZine(-1),
      zineDown: (e) => this.zineDown(e),
      zJump: Object.fromEntries([1, 2, 3, 4, 5].map((k) => [k, () => { this.pauseAuto(); this.goSpread(k); }])),
      zRestart: () => { this.setState({ auto: !this.rm }); this.goSpread(1); setTimeout(() => this.schedAuto(), 0); },
      zAuto: () => { const on = !this.state.auto; this.setState({ auto: on }); if (on) setTimeout(() => this.state.zp >= 5 ? (this.goSpread(1), this.schedAuto()) : this.turnZine(1, true), 0); else clearTimeout(this.autoT); },
      zMusic: () => this.setState({ music: !this.state.music }),
      zKey: (e) => {
        if (this.state.rec) { if (e.key === 'Escape') { e.stopPropagation(); this.setState({ rec: null }); } return; }
        if (e.key === 'ArrowRight') this.turnZine(1);
        if (e.key === 'ArrowLeft') this.turnZine(-1);
        if (e.key === 'Escape') this.closeZine();
      },
      jarTap: (e) => this.jarTap(e),
      recOpen: Object.fromEntries(Object.keys(DATA.zine ? DATA.zine.recs : {}).map((id) => [id, (e) => { e && e.stopPropagation && e.stopPropagation(); this.openRec(id); }])),
      recBg: (e) => { if (e.target === e.currentTarget) this.setState({ rec: null }); },
      recClose: () => this.setState({ rec: null }),
      recGo: () => { const m = this.recData && this.recData.mod; this.setState({ rec: null }); this.closeZine(); if (m && DATA.mods[m]) this.later(() => this.go(m), 320); },
      echoFlip: () => { this.pauseAuto(); this.setState({ echoUp: !this.state.echoUp }); },
      refZine: (el) => { this.els.zine = el; },
      refLeaf0: (el) => { this.els.leaf0 = el; },
      refLeaf1: (el) => { this.els.leaf1 = el; },
      refLeaf2: (el) => { this.els.leaf2 = el; },
      refLeaf3: (el) => { this.els.leaf3 = el; },
      refLeaf4: (el) => { this.els.leaf4 = el; },
      refSq: (el) => { this.els.sq = el; },
      qKey: (e) => { if (e.key === 'Enter') this.submitJump(); if (e.key === 'Escape') { this.closeJump(); this.closeBook(); } },
      askFromJump: () => this.ask(this.state.q.trim(), true),
      wheelDown: (e) => this.wheelDown(e),
      dragMove: (e) => this.dragMove(e),
      dragEnd: (e) => this.dragEnd(e),
      peelDown: (e) => this.peelDown(e),
      peelKey: (e) => this.peelKey(e),
      back: () => this.go('home'),
      toggleCfg: () => this.setState({ cfg: !this.state.cfg }),
      setLight: () => this.setState({ dark: false }),
      setDark: () => this.setState({ dark: true }),
      confirm: () => { if (this.state.confirmed) return; this.setState({ confirmed: true }); this.later(() => this.setState({ stamp: true }), 160); this.faceFor('happy', 1400, true); },
      onInput: (e) => this.setState({ input: e.target.value }),
      inKey: (e) => { if (e.key === 'Enter') this.ask(this.state.input.trim()); },
      send: () => this.ask(this.state.input.trim()),
      flipNote: () => { this.setState({ flipped: !this.state.flipped, flipAnim: true }); this.later(() => this.setState({ flipAnim: false }), 700); },
      save: () => this.closePanel(true),
      cancel: () => this.closePanel(false),
      pomeloPoke: () => {
        const now = Date.now();
        this.pokes = (this.pokes || []).filter((t) => now - t < 2500).concat(now);
        if (this.pokes.length >= 5 && !this.state.dizzy) {
          this.pokes = [];
          this.setState({ dizzy: true });
          this.faceFor('error', 2200, true);
          this.later(() => this.setState({ dizzy: false }), 3300);
          return;
        }
        if (!this.state.dizzy) this.faceFor(['wow', 'happy', 'wink', 'surprised'][this.pokes.length % 4], 1000, true);
      },
      refBook: (el) => { this.els.book = el; },
      refMsgs: (el) => { this.els.msgs = el; },
    };
    H.go = {}; H.tab = {}; H.close = {}; H.todo = []; H.row = []; H.sub = {}; H.pal = {}; H.note = {}; H.stk = {}; H.sug = [];
    for (const id of Object.keys(DATA.mods)) {
      H.go[id] = () => this.go(id);
      H.close[id] = (e) => {
        e.stopPropagation();
        const tabs = this.state.tabs.filter((t) => t !== id);
        if (!tabs.length) tabs.push('home');
        this.setState({ tabs });
        if (this.state.mod === id) this.go(tabs[tabs.length - 1]);
      };
      H.stk[id] = (e) => this.stickerDown(id, e);
    }
    DATA.todosDone.forEach((_, i) => {
      H.todo[i] = () => {
        const todos = this.state.todos.slice();
        todos[i] = !todos[i];
        this.setState({ todos, pop: todos[i] ? i : -1 });
        if (todos[i]) this.faceFor('happy', 1500);
        if (todos.every(Boolean)) { this.setState({ allDone: true }); this.later(() => this.setState({ allDone: false }), 3300); }
      };
    });
    for (let i = 0; i < DATA.rows; i++) H.row[i] = () => this.openRow(i);
    for (const s of ['entries', 'assets', 'reports', 'import']) H.sub[s] = () => this.setSub(s);
    PAL_KEYS.forEach((k) => { H.pal[k] = () => this.setState({ pal: k }); });
    for (const id of Object.keys(this.np)) H.note[id] = (e) => this.noteDown(id, e);
    DATA.suggest.forEach((s, i) => { H.sug[i] = () => this.ask(s); });
    return H;
  }

  searchVals() {
    const S = this.state;
    const { groups, near } = this.searchHits();
    let k = 0;
    const mk = (list) => list.map((g) => ({
      name: DATA.mods[g.mod].name, icon: DATA.mods[g.mod].icon, cls: 'sgrp',
      rows: g.rows.map((r) => { const idx = k++; return { title: r[1], detail: r[2], cls: `srow p${S.sgen % 2}${idx === S.ssel ? ' on' : ''}`, d: (idx * 0.05).toFixed(2) + 's', pick: () => this.spick(idx) }; }),
    }));
    const sGroups = mk(groups), sNear = mk(near);
    const n = sGroups.reduce((a, g) => a + g.rows.length, 0);
    return {
      searchOn: !!S.search, searchCls: S.search === 'out' ? 'sr out' : 'sr in', rcptCls: S.tear ? 'rcpt tear' : 'rcpt',
      sq: S.sq, sGroups, sNear, sHasNear: sNear.length > 0, sNone: !!S.sq.trim() && n === 0 && !sNear.length,
      sCount: S.sq.trim() ? `${n} 条` : '',
    };
  }
  extraVals() {
    const S = this.state;
    const stackIds = S.tabs.filter((t) => t !== 'home' && t !== S.mod).reverse().slice(0, 3);
    const ids = Object.keys(DATA.mods);
    return {
      stj: Object.fromEntries(ids.map((id) => [id, String(Math.max(0, stackIds.indexOf(id)))])),
      stc: Object.fromEntries(ids.map((id) => [id, stackIds.includes(id) ? 'sedge' : 'sedge gone'])),
      zineOn: !!S.zine, zineCls: S.zine === 'out' ? 'zn out' : 'zn in', zPage: String(S.zp + 1), confetti: S.confetti,
      zShift: S.zp === 0 ? 'zshift closed' : 'zshift', zLabel: DATA.zine ? DATA.zine.spreads[S.zp] : '',
      leafCls: [0, 1, 2, 3, 4].map((i) => (i < S.zp ? 'leaf flipped' : 'leaf')),
      leafZ: [0, 1, 2, 3, 4].map((i) => String(i === S.turning ? 40 : i < S.zp ? 10 + i : 10 - i)),
      faceCls: Object.fromEntries([0, 1, 2, 3, 4].flatMap((i) => [['f' + i, i === S.zp ? 'zs go' : 'zs'], ['b' + i, i === S.zp - 1 ? 'zs go' : 'zs']]).concat([['end', S.zp === 5 ? 'zs go' : 'zs']])),
      autoOn: S.auto, autoOff: !S.auto, autoAria: S.auto ? '停下自动翻' : '自动翻', musicOn: S.music, musicOff: !S.music, musicAria: S.music ? '关音乐' : '开音乐',
      recOn: !!S.rec, rec: this.recData || { date: '', title: '', text: '', modName: '' },
      echoCls: S.echoUp ? 'echo up' : 'echo', echoLabel: S.echoUp ? '放回去' : '掀开看看',
      showEnv: CFG.start === 'year' && S.scr === 'home', envCls: S.env === 'open' ? 'env open' : 'env', envHint: S.env === 'open' ? '再看一遍' : '拆开看看',
      allDone: S.allDone, dizzy: S.dizzy,
      whlCls: S.whlSpin ? 'whl spin1' : 'whl',
    };
  }
  renderVals() {
    const S = this.state, P = this.props;
    const pi = PAL_NAMES.indexOf(P.palette);
    const pal = S.pal || PAL_KEYS[pi < 0 ? 0 : pi];
    const dark = S.dark ?? !!P.dark;
    const ids = Object.keys(DATA.mods);
    const map = (fn) => Object.fromEntries(ids.map((id) => [id, fn(id)]));
    const m = this.matches();
    const wm = map((id) => (!m ? '' : m.includes(id) ? 'hit' : 'dim'));
    const chat = S.chat.map((c, ci) => {
      if (c.me) return { me: true, yz: false, text: c.text };
      let k = 0;
      const paras = [[]];
      for (const [t, b] of c.segs) {
        if (t === '\n') { paras.push([]); continue; }
        for (const ch of t) paras[paras.length - 1].push({ c: ch, cls: (b ? 'ch b' : 'ch') + (c.live ? ' live' : ''), d: (c.live ? (k++ * 0.024 + 0.05).toFixed(3) : 0) + 's' });
      }
      return { me: false, yz: true, pre: c.pre, hasPre: !!c.pre, paras: paras.map((chars) => ({ chars })), card: !!c.card, idx: ci };
    });
    const isHome = S.scr === 'home';
    return {
      root: `bd p-${pal} ${dark ? 'dk' : 'lt'}`,
      face: `pmw f-${S.face}`,
      faceBig: `pmw f-${S.faceBig}${S.dizzy ? ' spinme' : ''}`,
      isHome, isMoney: S.scr === 'money', isAsk: S.scr === 'ask', isStub: S.scr === 'stub',
      notHome: !isHome,
      greetKey: `greet g${S.greet % 2}`,
      jumpOn: !!S.jump, jumpCls: S.jump === 'out' ? 'jp out' : 'jp in',
      bookOn: !!S.book, bookCls: S.book === 'out' ? 'bk out' : 'bk in',
      deskCls: S.deskIn ? 'desk in' : 'desk',
      wm, q: S.q, noMatch: !!m && m.length === 0, qText: S.q.trim(),
      tabCls: map((id) => (S.tabs.includes(id) ? (S.mod === id ? 'tab on' : 'tab') : 'tab gone')),
      tabOrd: map((id) => String(S.tabs.indexOf(id) + 1)),
      itCls: map((id) => (S.mod === id ? 'itab on' : 'itab')),
      stickCls: map((id) => `stk ${S.tabs.includes(id) && id !== 'home' ? 'used' : ''} ${wm[id]}`),
      stub: DATA.mods[S.mod] || DATA.mods.home,
      stubKey: `stub s-${S.mod}`, stubBooks: S.mod === 'books', stubOther: S.mod !== 'books',
      todoCls: S.todos.map((d, i) => (d ? (S.pop === i ? 'todo on pop' : 'todo on') : 'todo')),
      todoN: String(S.todos.filter(Boolean).length),
      peelCls: S.peeled ? 'peelwrap peeled' : 'peelwrap',
      subCls: { entries: S.sub === 'entries' ? 'sub on' : 'sub', assets: S.sub === 'assets' ? 'sub on' : 'sub', reports: 'sub', import: 'sub' },
      isEntries: S.sub === 'entries', isAssets: S.sub === 'assets',
      turnEntries: S.turn === 'entries', turnAssets: S.turn === 'assets',
      rowCls: Array.from({ length: DATA.rows }, (_, i) => (S.row === i ? 'erow sel' : S.flash === i ? 'erow flash' : 'erow')),
      panelOn: !!S.panel, panelCls: S.panel === 'out' ? 'panel out' : 'panel in',
      prow: DATA.rowData[S.row] || DATA.rowData[0],
      toast: S.toast, hasToast: !!S.toast,
      chat, thinking: S.phase === 'think', input: S.input,
      confirmCls: S.confirmed ? 'ccard done' : 'ccard', notConfirmed: !S.confirmed, confirmed: S.confirmed, stampOn: S.stamp,
      cfgOn: S.cfg, palCls: Object.fromEntries(PAL_KEYS.map((k) => [k, k === pal ? 'sw on' : 'sw'])),
      lightCls: dark ? 'seg' : 'seg on', darkCls: dark ? 'seg on' : 'seg',
      np: Object.fromEntries(Object.keys(this.np).map((id) => [id, this.noteTf(id)])),
      nr: Object.fromEntries(Object.keys(this.np).map((id) => [id, this.noteR(id)])),
      nz: Object.fromEntries(Object.keys(this.np).map((id) => [id, String(this.np[id].z || DATA.notes[id].z || 1)])),
      flipCls: (S.flipped ? 'flipper flipped' : 'flipper') + (S.flipAnim ? ' anim' : ''),
      wheelStyle: `--a: ${this.ang}deg`,
      ...this.searchVals(), ...this.extraVals(),
      ...this.h,
    };
  }
}
