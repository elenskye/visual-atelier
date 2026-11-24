// 控件小动静画板的交互（经典 JS）。CFG、DATA 由生成器写在前面。
const PAL_KEYS = ['blue', 'purple', 'kraft', 'yellow', 'mint'];
const PAL_NAMES = ['蓝笔 · 方格纸', '紫笔 · 樱粉荧光', '黑笔 · 牛皮纸', '柚黄桌面', '薄荷桌面'];
const ROW = 29;

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      pal: null, dark: null, cfg: false, face: 'normal',
      tg: [true, false], tgGo: -1, seg: 0, segN: 0, dd: false, ddSel: 2,
      ck: [false, true, false], pop: -1, rate: 3, rgen: 0,
      toast: 0, toastOn: false, del: ['', '', ''], undo: -1,
      order: ['todo', 'books', 'money', 'notes'],
      chips: ['on', 'on', 'on', 'off', 'off', 'off'],
    };
    this.T = [];
    this.rm = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.h = this.makeHandlers();
  }
  componentWillUnmount() { this.T.forEach(clearTimeout); }
  later(fn, ms) { const t = setTimeout(fn, this.rm ? Math.min(ms, 30) : ms); this.T.push(t); return t; }
  faceFor(f, ms) { clearTimeout(this.ft); this.setState({ face: f }); this.ft = this.later(() => this.setState({ face: 'normal' }), ms); }

  drag(e, opts) {
    const el = e.currentTarget;
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    this.dg = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: false, ...opts };
    opts.start && opts.start(this.dg);
  }
  dragMove(e) { const d = this.dg; if (!d) return; d.x = e.clientX; d.y = e.clientY; if (!d.moved && Math.hypot(d.x - d.x0, d.y - d.y0) > 3) d.moved = true; if (d.moved) d.move(d); }
  dragEnd() { const d = this.dg; if (!d) return; this.dg = null; d.end(d); }

  // 拖动排序：拿起的那行跟着手、歪一点；别的行按目标位置让开；松手后写进顺序
  sortDown(id, e) {
    const el = e.currentTarget;
    const rows = [...el.parentElement.querySelectorAll('.srt')];
    const order = this.state.order.slice();
    const k = order.indexOf(id);
    let t = k;
    this.drag(e, {
      start: () => { el.classList.add('held'); },
      move: (d) => {
        const dy = Math.max(-k * ROW - 6, Math.min((order.length - 1 - k) * ROW + 6, d.y - d.y0));
        el.style.top = `${k * ROW + dy}px`;
        el.style.transform = 'rotate(-2deg) scale(1.03)';
        t = Math.max(0, Math.min(order.length - 1, Math.round(k + dy / ROW)));
        rows.forEach((r) => {
          const rid = r.getAttribute('data-id'); if (rid === id) return;
          const j = order.indexOf(rid);
          const nj = j > k && j <= t ? j - 1 : j < k && j >= t ? j + 1 : j;
          r.style.top = `${nj * ROW}px`;
        });
      },
      end: () => {
        el.classList.remove('held');
        el.style.transform = '';
        const next = order.filter((x) => x !== id);
        next.splice(t, 0, id);
        el.style.top = `${t * ROW}px`;
        this.setState({ order: next });
      },
    });
  }

  makeHandlers() {
    const H = {
      dragMove: (e) => this.dragMove(e), dragEnd: (e) => this.dragEnd(e),
      toggleCfg: () => this.setState({ cfg: !this.state.cfg }),
      setLight: () => this.setState({ dark: false }), setDark: () => this.setState({ dark: true }),
      ddToggle: () => this.setState({ dd: !this.state.dd }),
      showToast: () => { this.setState({ toastOn: true, toast: this.state.toast + 1 }); clearTimeout(this.tt); this.tt = this.later(() => this.setState({ toastOn: false }), 3000); this.faceFor('happy', 1200); },
      undo: () => { const i = this.state.undo; if (i < 0) return; const del = this.state.del.slice(); del[i] = 'back'; this.setState({ del, undo: -1 }); },
      chipAdd: () => { const c = this.state.chips.slice(); const i = c.findIndex((x) => x === 'off'); if (i < 0) return; c[i] = 'add'; this.setState({ chips: c }); },
    };
    H.tg = [0, 1].map((i) => () => { const tg = this.state.tg.slice(); tg[i] = !tg[i]; this.setState({ tg, tgGo: i }); });
    H.seg = [0, 1, 2, 3].map((i) => () => { if (i !== this.state.seg) this.setState({ seg: i, segN: this.state.segN + 1 }); });
    H.ddPick = [0, 1, 2, 3].map((i) => () => { this.setState({ ddSel: i }); this.later(() => this.setState({ dd: false }), 380); });
    H.ck = [0, 1, 2].map((i) => () => { const ck = this.state.ck.slice(); ck[i] = !ck[i]; this.setState({ ck, pop: ck[i] ? i : -1 }); if (ck[i]) this.faceFor('happy', 1000); });
    H.rate = [0, 1, 2, 3, 4].map((i) => () => { this.setState({ rate: i + 1, rgen: this.state.rgen + 1 }); if (i === 4) this.faceFor('wow', 1000); });
    H.del = [0, 1, 2].map((i) => () => {
      const del = this.state.del.slice(); del[i] = 'crumple';
      this.setState({ del });
      this.later(() => { const d2 = this.state.del.slice(); d2[i] = 'gone'; this.setState({ del: d2, undo: i }); }, 620);
    });
    H.chipX = [0, 1, 2, 3, 4, 5].map((i) => () => {
      const c = this.state.chips.slice(); c[i] = 'leave'; this.setState({ chips: c });
      this.later(() => { const c2 = this.state.chips.slice(); c2[i] = 'off'; this.setState({ chips: c2 }); }, 400);
    });
    H.sortDown = Object.fromEntries(['todo', 'books', 'money', 'notes'].map((id) => [id, (e) => this.sortDown(id, e)]));
    H.pal = Object.fromEntries(PAL_KEYS.map((k) => [k, () => this.setState({ pal: k })]));
    return H;
  }

  renderVals() {
    const S = this.state, P = this.props;
    const pi = PAL_NAMES.indexOf(P.palette);
    const pal = S.pal || PAL_KEYS[pi < 0 ? 0 : pi];
    const dark = S.dark ?? !!P.dark;
    const months = ['9 月', '10 月', '11 月', '12 月'];
    return {
      root: `bd p-${pal} ${dark ? 'dk' : 'lt'}`,
      face: `pmw f-${S.face}`,
      cfgOn: S.cfg, palCls: Object.fromEntries(PAL_KEYS.map((k) => [k, k === pal ? 'sw on' : 'sw'])),
      lightCls: dark ? 'seg' : 'seg on', darkCls: dark ? 'seg on' : 'seg',
      tgCls: S.tg.map((on, i) => `tg${on ? ' on' : ''}${S.tgGo === i ? ' go' : ''}`), tgOn: S.tg.map(String),
      segHl: `seghl s${S.segN % 2}`, segX: String(S.seg * 57.5), segCls: [0, 1, 2, 3].map((i) => (i === S.seg ? 'segb on' : 'segb')),
      ddOpen: S.dd, ddLabel: months[S.ddSel], ddArrow: S.dd ? 'ddar open' : 'ddar', ddItem: [0, 1, 2, 3].map((i) => (i === S.ddSel ? 'ddit on' : 'ddit')),
      ckCls: S.ck.map((d, i) => (d ? (S.pop === i ? 'todo on pop' : 'todo on') : 'todo')),
      starCls: [0, 1, 2, 3, 4].map((i) => `star${i < S.rate ? ' on' : ''} p${S.rgen % 2}`), starD: [0, 1, 2, 3, 4].map((i) => (S.rgen ? i * 0.07 : 0) + 's'),
      rateText: ['', '一颗星，不太行', '两颗星，还可以', '三颗星，挺好', '四颗星，很喜欢', '五颗星，太好了！'][S.rate],
      toastOn: S.toastOn, toastCls: `toastnote k${S.toast % 2}`,
      delCls: S.del.map((x) => `delit ${x}`), undoOn: S.undo >= 0,
      sortTop: Object.fromEntries(S.order.map((id, i) => [id, String(i * ROW)])),
      chipCls: S.chips.map((x) => `chip2 ${x}`),
      ...this.h,
    };
  }
}
