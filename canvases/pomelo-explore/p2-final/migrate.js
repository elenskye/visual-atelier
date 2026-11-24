// 迁移测试画板的交互（经典 JS）。CFG、DATA 由生成器写在前面。
const PAL_KEYS = ['blue', 'purple', 'kraft', 'yellow', 'mint'];
const PAL_NAMES = ['蓝笔 · 方格纸', '紫笔 · 樱粉荧光', '黑笔 · 牛皮纸', '柚黄桌面', '薄荷桌面'];
const TOOL_NAMES = ['提醒', '标签', '附件', '链接', '收藏', '导出', '复制', '显示'];

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { pal: null, dark: null, cfg: false, face: 'normal', nb: 4, pondOn: true };
    this.T = [];
    this.rm = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const H = {
      toggleCfg: () => this.setState({ cfg: !this.state.cfg }),
      setLight: () => this.setState({ dark: false }), setDark: () => this.setState({ dark: true }),
      pal: Object.fromEntries(PAL_KEYS.map((k) => [k, () => this.setState({ pal: k })])),
      nbPick: TOOL_NAMES.map((_, i) => () => this.setState({ nb: i })),
      replay: () => { this.setState({ pondOn: false }); this.later(() => this.setState({ pondOn: true }), 40); },
      nop: () => { this.setState({ face: 'happy' }); this.later(() => this.setState({ face: 'normal' }), 1200); },
    };
    this.h = H;
  }
  componentWillUnmount() { this.T.forEach(clearTimeout); }
  later(fn, ms) { const t = setTimeout(fn, ms); this.T.push(t); return t; }
  renderVals() {
    const S = this.state, P = this.props;
    const pi = PAL_NAMES.indexOf(P.palette);
    const pal = S.pal || PAL_KEYS[pi < 0 ? 0 : pi];
    const dark = S.dark ?? !!P.dark;
    return {
      root: `bd p-${pal} ${dark ? 'dk' : 'lt'}`,
      face: `pmw f-${S.face}`,
      cfgOn: S.cfg, palCls: Object.fromEntries(PAL_KEYS.map((k) => [k, k === pal ? 'sw on' : 'sw'])),
      lightCls: dark ? 'seg' : 'seg on', darkCls: dark ? 'seg on' : 'seg',
      nbCls: TOOL_NAMES.map((_, i) => (i === S.nb ? 'nb press on' : 'nb press')), nbLabel: `选中：${TOOL_NAMES[S.nb]}`,
      pondOn: S.pondOn,
      ...this.h,
    };
  }
}
