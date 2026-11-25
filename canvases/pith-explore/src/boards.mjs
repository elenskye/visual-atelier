// R1 除 App 以外的几张板：Logo 的生长、顶栏三个图标的悬停、Agent 动态图标、整套图标。颜色、动效、图形全从 schemes/pith 来（scheme.mjs、marks.mjs），
// 和 Design System、Motion Deck 是同一份；悬停和别的动效零件在 bench 的 Motion Deck 里看（/#/motion/pith）。原注：EX11 的几张板：都挂同一套配色（纸与海默认），Tweaks 换配色和明暗。
import { esc, dcBoard } from '../../_lib/board.mjs';
import { FONTS } from './base.mjs';
import { SCHEME_CSS, ALIAS_CSS } from './scheme.mjs';
import { LOGO, ICON, TYPE, STAGE, AGENTS, svg48, icon, logoMark, agentIcon, appIcon as appIconSpan } from './marks.mjs';
const appIcon = () => appIconSpan('').replace(/^<span class="">/, '').replace(/<\/span>$/, '');
import * as C from './content.mjs';

const PROPS = (w, h, extra = {}) => ({
  palette: { editor: 'enum', options: ['纸与海', '雾与赭'], default: '纸与海', section: '配色' },
  theme: { editor: 'enum', options: ['light', 'dark'], default: 'light', section: '外观' },
  ...extra,
  $preview: { width: w, height: h },
});
const VALS = `const i = ['纸与海', '雾与赭'].indexOf(this.props.palette); const base = { palId: ['paper-sea', 'mist-ochre'][i < 0 ? 0 : i], theme: this.props.theme === 'dark' ? 'dark' : 'light' };`;
const BASE = (root, w, h) => `
html,body{margin:0}
${root}{--serif:var(--font-serif);--sans:var(--font-sans);--out:cubic-bezier(.23,1,.32,1);--spring:cubic-bezier(.34,1.36,.64,1);box-sizing:border-box;width:${w}px;height:${h}px;padding:40px 48px;background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;overflow:hidden}
${root} *{box-sizing:border-box}${root} :where(h1,h2,h3,p,figure,figcaption,q){margin:0}
${root} :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;text-align:inherit;cursor:pointer;-webkit-appearance:none;appearance:none}
${root} .kick{font:700 11.5px/1 var(--sans);letter-spacing:.14em;color:var(--sea-t)}
${root}>h1{margin-top:10px;font:600 40px/1.1 var(--serif)}
${root} .lede{margin-top:8px;max-width:1120px;font-size:13.5px;line-height:1.7;color:var(--ink2)}
${root} h3{font:700 11.5px/1 var(--sans);letter-spacing:.12em;color:var(--faint)}
${root} h3 span{margin-left:8px;font-weight:400;letter-spacing:0}
${root} code{font:10.5px/1 ui-monospace,Menlo,monospace;color:var(--faint)}
${ALIAS_CSS(root)}
`;
const page = ({ title, root, w, h, css, body, props, script }) => dcBoard({
  title,
  helmet: `${FONTS}<style>
${SCHEME_CSS}
${(BASE('.' + root, w, h) + css).trim()}
</style>
`,
  body: `<div class="${root}" data-palette="{{palId}}" data-theme="{{theme}}">\n${body}\n</div>`,
  props: props || PROPS(w, h),
  script: script || `
class Component extends DCLogic {
  renderVals() { ${VALS} return base; }
}`,
});

const grid48 = `<svg class="g48" viewBox="0 0 48 48" aria-hidden="true">${Array.from({ length: 49 }, (_, i) => `<path d="M${i} 0V48M0 ${i}H48" stroke-width="${i % 6 === 0 ? 0.08 : 0.03}"/>`).join('')}</svg>`;

// ---------- Logo：蕨芽的生长 ----------
/** 板上自己演的节奏：演 on 毫秒、停 off 毫秒，一直循环；{{pl}} 是 .is-hover（悬停的替身），{{plIn}} 是 .is-in（Logo 打开时长一次的那个）。 */
const LOOP = (on, off) => `
class Component extends DCLogic {
  constructor(p) { super(p); this.state = { pl: true }; }
  componentDidMount() { const tick = () => { const n = !this.state.pl; this.setState({ pl: n }); this.t = setTimeout(tick, n ? ${on} : ${off}); }; this.t = setTimeout(tick, ${on}); }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() { ${VALS} return { ...base, pl: this.state.pl ? 'is-hover' : '', plIn: this.state.pl ? 'is-in' : '' }; }
}`;
const frames = (times, mk, cls = '') => `<div class="frames ${cls}">${times.map((t) => `<span class="fr"><span class="fx is-frame" style="--at:${t}s">${mk(t)}</span><code>${t.toFixed(2).replace(/0$/, '')} 秒</code></span>`).join('')}</div>`;
const FRAMES_CSS = `
.frames{display:flex;gap:10px}
.frames .fr{display:flex;flex-direction:column;align-items:center;gap:6px}
.frames .fx{display:grid;place-items:center;border-radius:10px;background:var(--bg);box-shadow:0 0 0 1px var(--line)}
.frames code{font-size:10.5px;color:var(--faint);white-space:nowrap}
`;
export function logoBoard() {
  const W = 1600, H = 860;
  const T = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2, 1.4, 1.8];
  const PH = [['脚', '0–0.24 秒', '地面先铺开'], ['茎和碗', '0.1–1.08 秒', '一笔：从底下长上去，顶上绕一圈回到茎上成 P 的碗，中间不停、接口不留缝'], ['卷', '1.06–1.38 秒', '再往里卷半圈多'], ['果', '1.34–1.74 秒', '卷心结出珊瑚色的果，弹一下']];
  const css = `
.lb .main{display:grid;grid-template-columns:760px 1fr;gap:28px;margin-top:24px}
.lb .stage{position:relative;height:470px;border-radius:16px;background:var(--card);box-shadow:0 0 0 1px var(--line)}
.lb .stage .g48{position:absolute;left:50%;top:50%;width:360px;height:360px;margin:-180px;stroke:var(--sea);opacity:.3}
.lb .stage .pith-brand{position:absolute;left:50%;top:50%;width:360px;height:360px;margin:-180px;color:var(--ink)}
.lb .stage .mark{width:360px;height:360px}
.lb .stage .hint{position:absolute;left:20px;bottom:16px;font-size:12px;color:var(--faint)}
.lb .side{display:flex;flex-direction:column;gap:18px}
.lb .ph{display:grid;grid-template-columns:64px 110px 1fr;row-gap:9px;padding:18px 20px;border-radius:14px;background:var(--card);box-shadow:0 0 0 1px var(--line);font-size:13.5px;line-height:1.4}
.lb .ph b{font:600 16px/1.3 var(--serif)}.lb .ph code{font-size:12px;line-height:1.7}.lb .ph span{color:var(--ink2)}
.lb .locks{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.lb .lock{display:flex;align-items:center;justify-content:center;gap:12px;height:96px;border-radius:14px;background:var(--bg);color:var(--ink);box-shadow:0 0 0 1px var(--line);cursor:pointer}
.lb .lock.dk{background:#1d1c1a;color:#efede8;--ink:#efede8;--coral:#ff9b86}
.lb .lock .mark{width:44px;height:44px}.lb .lock .wm{font:500 38px/1 var(--serif)}
.lb .apps{flex:1;display:flex;align-items:center;gap:18px;padding:16px 20px;border-radius:14px;background:var(--card);box-shadow:0 0 0 1px var(--line)}
.lb .apps svg{display:block;filter:drop-shadow(0 6px 10px #0003)}
.lb .apps .a1 svg{width:96px;height:96px}
.lb .apps>span:not(.sz){display:flex;flex-direction:column;align-items:center;gap:5px}
.lb .apps span[style] svg{width:var(--s);height:var(--s)}
.lb .apps .sz{margin-left:auto;display:flex;flex-direction:row;align-items:flex-end;gap:16px;color:var(--ink)}.lb .apps .sz span{display:flex;flex-direction:column;align-items:center;gap:5px}.lb .apps .sz .mark{width:var(--s);height:var(--s)}
.lb .strip{margin-top:22px}
.lb .frames .fx{width:112px;height:112px}.lb .frames .mark{width:84px;height:84px;color:var(--ink)}
${FRAMES_CSS}
${MARKS_CSS_LITE}
`;
  const body = `<p class="kick">R1 · Logo</p><h1>蕨芽：从底下长出来，结一颗果</h1>
<p class="lede">地面先铺开，茎从底下长上去、一口气绕一圈回到茎上成 P 的碗（站主 11-24：不停顿、不留缝），再往里卷，最后卷心结出一颗珊瑚色的果。整段 1.7 秒：App 打开时长一次，鼠标放到 Logo 上再长一次。左边大图自己一直演；下面是按时间截的分解；右边的字标放上鼠标也会长。</p>
<div class="main"><div class="stage">${grid48}<span class="pith-brand {{plIn}}">${logoMark('lb0')}</span><span class="hint">一直循环：长 1.7 秒，停一会儿，再长</span></div>
<div class="side"><div class="ph">${PH.map(([n, t, d]) => `<b>${n}</b><code>${t}</code><span>${d}</span>`).join('')}</div>
<div class="locks"><span class="lock pith-brand {{plIn}}" data-theme="light">${logoMark('lb1')}<b class="wm">Pith</b></span><span class="lock dk pith-brand {{plIn}}">${logoMark('lb2')}<b class="wm">Pith</b></span></div>
<div class="apps"><span class="a1">${appIcon(LOGO)}</span>${[64, 32, 16].map((n) => `<span style="--s:${n}px">${appIcon(LOGO)}<code>${n}</code></span>`).join('')}<span class="sz">${[32, 24, 16].map((n) => `<span style="--s:${n}px">${svg48(LOGO, 'mark')}<code>${n}</code></span>`).join('')}</span></div></div></div>
<div class="strip"><h3>分解 <span>按时间截的样子</span></h3>${frames(T, (t) => `<span class="pith-brand is-frame">${logoMark('lf' + Math.round(t * 100))}</span>`)}</div>`;
  return { html: page({ title: 'Pith · Logo：蕨芽的生长', root: 'lb', w: W, h: H, css, body, script: LOOP(2600, 700) }), w: W, h: H };
}
const MARKS_CSS_LITE = `.mark,.ico{overflow:visible;flex:none}.wm{font:500 23px/1 var(--serif);white-space:nowrap}`;

// ---------- 顶栏三个图标的悬停 ----------
export function topbarBoard() {
  const W = 1280, H = 960;
  const R = [
    ['kb', '知识库', '从底下长出来', '茎从底下画上去，三片叶跟着茎依次展开，顶上的芽最后弹出来。', '0.9 秒', [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9]],
    ['lib', '文献库', '书一本本摆出来', '三本书一本本落下来站好，第三本先立着、再斜靠过去；中间那本里的叶书签最后冒出来。', '1.05 秒', [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 1.1]],
    ['set', '设置', '叶子一片片转出来，停住', '一圈叶边转边一片片长出来（转得匀，每片都在同一个位置冒出来），转慢、停住，轻轻「咔」一下，环心的珊瑚色最后出现。', '1.3 秒', [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1, 1.35]],
  ];
  const css = `
.tb .bar{position:relative;display:flex;align-items:center;height:68px;margin-top:22px;padding:0 24px;border-radius:14px;background:var(--bg);color:var(--ink);box-shadow:0 0 0 1px var(--line2),0 14px 34px -24px #0006}
.tb .bar .brand{display:flex;align-items:center;gap:10px}.tb .bar .brand .mark{width:30px;height:30px}.tb .bar .brand .wm{font:500 23px/1 var(--serif)}
.tb .bar nav{position:absolute;left:50%;transform:translateX(-50%);display:flex;gap:10px}
.tb .bar nav span{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;color:var(--muted);cursor:pointer;transition:color .25s}
.tb .bar nav span:hover{color:var(--ink)}.tb .bar nav .ico{width:24px;height:24px}
.tb .bar .say{margin-left:auto;font-size:12.5px;color:var(--faint)}
.tb .rows{display:flex;flex-direction:column;gap:16px;margin-top:20px}
.tb .row{display:grid;grid-template-columns:176px 236px 1fr;gap:20px;align-items:center;padding:16px 20px;border-radius:16px;background:var(--card);box-shadow:0 0 0 1px var(--line)}
.tb .big{display:grid;place-items:center;width:176px;height:176px;border-radius:14px;background:var(--bg);color:var(--ink)}
.tb .big .ico{width:120px;height:120px}
.tb .txt b{display:block;font:600 22px/1.2 var(--serif)}.tb .txt em{display:block;margin-top:6px;font:italic 400 16px/1.3 var(--serif);color:var(--sea-t)}
.tb .txt p{margin-top:10px;font-size:13px;line-height:1.65;color:var(--ink2)}.tb .txt code{display:block;margin-top:8px}
.tb .frames{gap:7px}.tb .frames .fx{width:66px;height:66px;color:var(--ink)}.tb .frames .ico{width:48px;height:48px}
${FRAMES_CSS}
${MARKS_CSS_LITE}
`;
  const body = `<p class="kick">R1 · 顶栏</p><h1>三个图标各自长出来，珊瑚色最后出现</h1>
<p class="lede">悬停时不再是统一的「上墨」，三个图标各按自己是什么长出来：知识库是一株从底下长出来的叶，文献库是一本本摆上书架的书，设置是一圈转出来的叶。珊瑚色（芽、叶书签、髓）都在最后出现。最上面是真的顶栏，把鼠标放上去；下面每行左边的大图自己一直演，右边是按时间截的分解。</p>
<div class="bar"><span class="brand pith-brand">${logoMark('tb0')}<b class="wm">Pith</b></span><nav>${['kb', 'lib', 'set'].map((n) => `<span class="pith-ink">${icon(n)}</span>`).join('')}</nav><span class="say">放上鼠标看</span></div>
<div class="rows">${R.map(([n, t, e, d, dur, T]) => `<div class="row"><span class="big pith-ink {{pl}}">${icon(n)}</span><div class="txt"><b>${t}</b><em>${e}</em><p>${esc(d)}</p><code>${dur}</code></div>${frames(T, () => `<span class="pith-ink is-frame">${icon(n)}</span>`)}</div>`).join('')}</div>`;
  return { html: page({ title: 'Pith · 顶栏三个图标的悬停', root: 'tb', w: W, h: H, css, body, script: LOOP(2000, 600) }), w: W, h: H };
}

// ---------- 整套图标 ----------
const TYPES = [['full', '全文'], ['excerpt', '摘抄'], ['note', '笔记'], ['web', '网页快照'], ['file', '本机文件'], ['scan', '扫描件'], ['concept', '概念卡'], ['report', '调查报告'], ['wonder', 'WonderLab'], ['answer', '存下的回答']];
export function iconsBoard() {
  const W = 1280, H = 960;
  const TOP = [['kb', '知识库', '叶序：一根茎上三片互生的叶，一片比一片小，顶上一颗芽'], ['lib', '文献库', '三本书，中间那本夹着一片叶当书签'], ['set', '设置', '轮生：一圈六片叶围着一个环，像齿轮，环心是髓']];
  const strip = (th) => `<div class="u" data-palette="{{palId}}" data-theme="${th}"><div class="u-top"><span class="u-b pith-brand">${logoMark('ib-' + th)}<b>Pith</b></span><span class="u-i">${['kb', 'lib', 'set'].map((n, i) => `<span class="pith-ink${i === 0 ? ' on' : ''}">${icon(n)}</span>`).join('')}</span></div>
<div class="u-body"><p class="u-new pith-row">${svg48(ICON.new, 'ico')}<b>新对话</b></p><div class="u-comp"><span>问 Pith……</span><i>/ @ #</i><em class="pith-sweep">${svg48(ICON.send, 'ico')}</em></div>
<div class="u-card pith-lift"><span class="lbl">${svg48(TYPE.excerpt, 'ico')}摘抄</span><b>Stigler 1951 的摘抄</b><span class="m">${svg48(STAGE[1], 'sg')}读《国富论》 · 11 月 4 日</span></div></div></div>`;
  const css = `
.ib .top{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:22px}
.ib figure{display:flex;flex-direction:column;gap:8px;padding:16px;border-radius:14px;background:var(--card);box-shadow:0 0 0 1px var(--line)}
.ib .cell{position:relative;width:112px;height:112px;margin:0 auto}
.ib .cell .g48{position:absolute;inset:0;width:112px;height:112px;stroke:var(--sea);opacity:.3}
.ib .cell .ico{position:absolute;inset:0;width:112px;height:112px;color:var(--ink)}
.ib figcaption b{display:block;font:600 16px/1.2 var(--serif)}
.ib figcaption span{display:block;margin-top:4px;font-size:12px;line-height:1.55;color:var(--muted)}
.ib .row2{display:grid;grid-template-columns:300px 1fr;gap:28px;margin-top:24px}
.ib .ui{display:flex;gap:22px;margin-top:12px}.ib .ui span{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;color:var(--muted)}.ib .ui .ico{width:56px;height:56px;color:var(--ink)}
.ib .types{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:12px}.ib .types span{display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;font-size:11.5px;color:var(--muted)}.ib .types .ico{width:46px;height:46px;color:var(--ink)}
.ib .stages{display:flex;gap:28px;margin-top:12px}.ib .stages span{display:flex;align-items:center;gap:10px;font:18px/1 var(--serif);white-space:nowrap}.ib .stages .ico{width:38px;height:38px;color:var(--sea)}
.ib .stages .g0{font-weight:300}.ib .stages .g1{font-weight:430}.ib .stages .g2{font-weight:640}
.ib .strips{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:14px}
.u{border-radius:14px;overflow:hidden;background:var(--bg);color:var(--ink);box-shadow:0 0 0 1px var(--line2),0 16px 40px -24px #0006}
.u-top{position:relative;display:flex;align-items:center;height:52px;padding:0 18px;border-bottom:1px solid var(--line)}
.u-b{display:flex;align-items:center;gap:8px}.u-b .mark{width:24px;height:24px;overflow:visible}.u-b b{font:500 19px/1 var(--serif)}
.u-i{position:absolute;left:50%;transform:translateX(-50%);display:flex;gap:10px}
.u-i span{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;color:var(--muted)}.u-i span.on{color:var(--ink)}.u-i .ico{width:22px;height:22px}
.u-body{display:grid;grid-template-columns:130px 1fr;gap:12px 18px;padding:16px 18px 18px}
.u-new{grid-row:1/3;display:flex;align-items:center;gap:7px;align-self:start;--dot-x:-8px;font:700 13.5px/1 var(--sans);color:var(--sea-t)}.u-new .ico{width:17px;height:17px}
.u-comp{display:flex;align-items:center;gap:8px;height:42px;padding:0 6px 0 14px;border:1px solid var(--line2);border-radius:7px;background:var(--card);font:15px/1 var(--serif);color:var(--faint)}
.u-comp span{flex:1}.u-comp i{font-style:normal;font-size:13px;letter-spacing:.3em;color:var(--muted)}
.u-comp em{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--sea);color:var(--on-sea)}.u-comp em .ico{width:16px;height:16px}
.u-card{display:flex;flex-direction:column;gap:5px;padding:12px 14px;border:1px solid var(--line);border-radius:7px;background:var(--card)}
.u-card .lbl{display:flex;align-items:center;gap:6px;font:700 10.5px/1 var(--sans);letter-spacing:.08em;color:var(--crim)}.u-card .lbl .ico{width:16px;height:16px;color:var(--crim)}
.u-card b{font:430 17px/1.25 var(--serif)}.u-card .m{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--faint)}.u-card .sg{width:15px;height:15px;color:var(--sea)}
.u .ico{overflow:visible}
`;
  const body = `<p class="kick">R1 · 图标</p><h1>铅字 × 数字花园</h1>
<p class="lede">图形语言定为铅字：实心、一粗一细，每个图标一处珊瑚色（芽、种子、注码），是它「活」的那一点。顶栏三个借植物的特征：知识库是叶序，文献库是夹着一片叶的书，设置是轮生的叶。最下面两条能把鼠标放上去看悬停（顶栏三个各自长出来，见「顶栏」那张）。</p>
<div class="top">${TOP.map(([n, t, d]) => `<figure><div class="cell">${grid48}${svg48(ICON[n], 'ico')}</div><figcaption><b>${t}</b><span>${esc(d)}</span></figcaption></figure>`).join('')}</div>
<div class="row2"><div><h3>界面里的</h3><div class="ui">${[['new', '新对话'], ['search', '搜索 ⌘K'], ['send', '发送']].map(([n, t]) => `<span>${svg48(ICON[n], 'ico')}${t}</span>`).join('')}</div>
<h3 style="margin-top:22px">生长阶段 <span>只在这里写名字</span></h3><div class="stages">${[0, 1, 2].map((k) => `<span class="g${k}">${svg48(STAGE[k], 'ico')}${['发芽', '生长', '常青'][k]}</span>`).join('')}</div></div>
<div><h3>知识库里的十种记录</h3><div class="types">${TYPES.map(([k, t]) => `<span>${svg48(TYPE[k], 'ico')}${t}</span>`).join('')}</div></div></div>
<h3 style="margin-top:26px">用起来 <span>顶栏、对话历史的「新对话」、输入框、知识库卡片；亮、暗各一条</span></h3><div class="strips">${strip('light')}${strip('dark')}</div>`;
  return { html: page({ title: 'Pith · 图标：铅字 × 数字花园', root: 'ib', w: W, h: H, css, body }), w: W, h: H };
}

// ---------- Agent 动态图标库 ----------
export function agentsBoard() {
  const W = 1280, H = 1390;
  const SEQ = ['think', 'search', 'read', 'cite', 'write', 'done'];
  const css = `
.ab .seq{position:relative;display:flex;align-items:center;gap:14px;margin-top:22px;padding:18px 22px;border-radius:14px;background:var(--card);box-shadow:0 0 0 1px var(--line)}
.ab .seq>b{font:700 11.5px/1 var(--sans);letter-spacing:.12em;color:var(--faint)}
.ab .seqline{position:relative;flex:1;height:28px}
.ab .seqline>span{position:absolute;left:0;top:0;display:flex;align-items:center;gap:10px;height:28px;opacity:0;animation:sq 7.2s infinite;animation-delay:calc(var(--i) * 1.2s)}
@keyframes sq{0%{opacity:0;transform:translateY(5px)}2%,15%{opacity:1;transform:none}17%,100%{opacity:0;transform:translateY(-5px)}}
.ab .seqline .pith-agent{width:22px;height:22px;color:var(--sea)}
.ab .seqline .shim,.ab .seqline .tx{font:400 17px/1 var(--serif)}
.ab .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:20px}
.ab .cell{display:flex;flex-direction:column;gap:8px;padding:16px 18px;border-radius:14px;background:var(--card);box-shadow:0 0 0 1px var(--line)}
.ab .cell .bigi{width:72px;height:72px;color:var(--ink)}
.ab .cell b{font:600 17px/1.2 var(--serif)}
.ab .cell .w{font-size:12px;line-height:1.5;color:var(--muted)}
.ab .cell .ln{display:flex;align-items:center;gap:7px;margin-top:2px;padding-top:9px;border-top:1px dashed var(--line2);font:14px/1.3 var(--serif)}
.ab .cell .ln .pith-agent{width:16px;height:16px;color:var(--muted);flex:none}
.ab .cell .d{font-size:11px;color:var(--faint)}
.ab .cell.new{box-shadow:0 0 0 2px var(--coral)}
.ab .sv{display:grid;grid-template-columns:330px 1fr;gap:20px;align-items:center;margin-top:16px;padding:16px 20px;border-radius:14px;background:var(--card);box-shadow:0 0 0 2px var(--coral)}
.ab .svh{display:flex;align-items:center;gap:16px}.ab .svh .svbig{width:96px;height:96px;flex:none;color:var(--ink)}
.ab .svh b{font:600 19px/1.2 var(--serif)}.ab .svh b i{margin-left:6px;padding:1px 8px;border-radius:3rem;background:color-mix(in srgb,var(--coral) 24%,transparent);font:700 11px/1.5 var(--sans);font-style:normal;color:var(--ink2);vertical-align:3px}
.ab .svh p{margin-top:6px;font-size:12.5px;line-height:1.6;color:var(--muted)}
.ab .frames{gap:6px}.ab .frames .fx{width:64px;height:64px;color:var(--ink)}.ab .frames .pith-agent{width:52px;height:52px}
${FRAMES_CSS}
`;
  const body = `<p class="kick">R1 · Pith 在想</p><h1>Agent 行为的动态图标</h1>
<p class="lede">像 Claude Code 那样：Pith 在做什么，状态行前面就是哪个图标在动，字上扫过一道光；做完那一步，图标停住、字变淡。十四个对应对话 Agent 的工具（HANDOFF 第 3 节）。都是铅字画的，一处珊瑚色；减弱动态效果时停在一帧看得懂的样子。「存进知识库」：珊瑚色的种子落下来、埋进土里，土鼓一下，长出一根小枝丫，顶上的芽还是珊瑚色。</p>
<div class="sv"><div class="svh">${agentIcon('save', 'svbig')}<div><b>存进知识库 <i>改了</i></b><p>落下、顿一下、埋进土里、土鼓一下、茎、两根枝和叶、芽。2.6 秒一轮。</p></div></div><div class="frames">${[0.3, 0.5, 0.6, 0.75, 1, 1.15, 1.4, 1.6, 1.75, 1.95, 2.2].map((t) => `<span class="fr"><span class="fx">${agentIcon('save', 'is-frame').replace('<svg ', `<svg style="--at:${t}s" `)}</span><code>${t.toFixed(2).replace(/0$/, '')} 秒</code></span>`).join('')}</div></div>
<div class="seq"><b>一次回答里</b><div class="seqline">${SEQ.map((id, i) => { const a = AGENTS.find((x) => x.id === id); return `<span style="--i:${i}">${agentIcon(id)}<span class="shim">${esc(a.line)}</span></span>`; }).join('')}</div></div>
<div class="grid">${AGENTS.map((a) => `<div class="cell${a.id === 'save' ? ' new' : ''}">${agentIcon(a.id, 'bigi')}<b>${a.name}</b><span class="w">${esc(a.when)}</span><span class="ln">${agentIcon(a.id)}<span class="shim">${esc(a.line)}</span></span><span class="d">${a.dur}</span></div>`).join('')}</div>`;
  return { html: page({ title: 'Pith · Agent 行为的动态图标', root: 'ab', w: W, h: H, css, body }), w: W, h: H };
}

// ---------- 悬停 ----------
