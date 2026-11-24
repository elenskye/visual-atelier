// 第 3 步 · 控件全套：14 种控件 × 6 个状态（平时、悬停、键盘焦点、按下、选中、不能用），下面摆不分状态的零件。
// 外样子用第 1、2 步批准的小样 CSS（../s2d/side.mjs 的 CSS 里全有）；这一轮新定的是状态（STATES），颜色从 tokens.mjs 取。
import { board, DOTS, FLIP, px, twinkle, dotCheck } from '../s1c/kit.mjs';
import { CSS as SIDE } from '../s2d/side.mjs';
import { themeCss } from './tokens.mjs';
import { BASE, rootLogic, themeProps } from './color.mjs';

const D = `font-family:${DOTS};font-weight:900`;

// ---------- 状态：画板里用 .is-h / .is-f / .is-p 强制摆出来；真的指针和键盘也会触发 ----------
export const STATES = `
.btn,.chip,.seg button,.opt,.mi,.trow,.tg{cursor:pointer}
.btn:focus-visible,.chip:focus-visible,.seg button:focus-visible,.opt:focus-visible,.mi:focus-visible,.trow:focus-visible{outline:none}
.opt,.mi,.trow,.tg{position:relative}
.pk .btn.fill{color:var(--on-bad)}
/* 悬停：有边的控件边亮成青线、里面抬起一档；青块、琥珀、红底亮一档 */
.btn:not(.off):hover,.btn.is-h{background:var(--cy-line)}
.btn:not(.off):hover:before,.btn.is-h:before{background:var(--raise)}
.btn.pri:not(.off):hover,.btn.pri.is-h,.btn.pri:not(.off):hover:before,.btn.pri.is-h:before{background:var(--cy-hover)}
.btn.ghost:not(.off):hover,.btn.ghost.is-h{background:var(--raise);color:var(--tx)}
.btn.danger:not(.off):hover,.btn.danger.is-h{background:var(--bad)}
.btn.danger:not(.off):hover:before,.btn.danger.is-h:before{background:var(--bad-soft)}
.btn.fill:not(.off):hover,.btn.fill.is-h{background:var(--bad-hover)}
.btn.warn:not(.off):hover,.btn.warn.is-h{background:var(--warn-hover)}
.chip:not(.on):not(.off):hover,.chip.is-h:not(.on){background:var(--cy-line);color:var(--tx)}
.chip.on:hover:before,.chip.on.is-h:before{background:var(--cy-soft)}
.seg button:not(.on):not(.off):hover,.seg button.is-h:not(.on){background:var(--raise);color:var(--tx)}
.seg button.on:hover,.seg button.on.is-h,.seg button.on:hover:before,.seg button.on.is-h:before{background:var(--cy-hover)}
.opt:not(.off):not(.on):hover,.opt.is-h:not(.on),.mi:not(.off):not(.on):hover,.mi.is-h:not(.on),.trow:hover,.trow.is-h{background:var(--raise)}
.tg:hover .tgt.off,.tg.is-h .tgt.off{background:var(--cy-line)}
.tg:hover .tgt:not(.off):not(.dis),.tg.is-h .tgt:not(.off),.tg:hover .tgt:not(.off):not(.dis):before,.tg.is-h .tgt:not(.off):before{background:var(--cy-hover)}
.field.is-h:before{background:var(--raise)}
/* 键盘焦点：控件里面内缩 3 像素一圈 1 像素青点线；青块、琥珀、红底上用块上的字色 */
.btn:focus-visible:after,.btn.is-f:after,.chip:focus-visible:after,.chip.is-f:after,.seg button:focus-visible:after,.seg button.is-f:after,
.opt:focus-visible:after,.opt.is-f:after,.mi:focus-visible:after,.mi.is-f:after,.trow:focus-visible:after,.trow.is-f:after,.tg.is-f:after{content:"";position:absolute;inset:3px;border:1px dotted var(--cy-tx);pointer-events:none}
.btn.pri.is-f:after,.btn.pri:focus-visible:after,.seg button.on.is-f:after,.seg button.on:focus-visible:after{border-color:var(--on-cy)}
.btn.fill.is-f:after,.btn.fill:focus-visible:after{border-color:var(--on-bad)}
.btn.warn.is-f:after,.btn.warn:focus-visible:after{border-color:var(--on-warn)}
.tg.is-f:after{inset:-4px -6px}
/* 按下：往下沉 1 像素，发光收起；有边的按钮里面凹一档 */
.btn:not(.off):active,.btn.is-p,.chip:not(.off):active,.chip.is-p,.seg button:not(.off):active,.seg button.is-p{transform:translateY(1px);text-shadow:none}
.btn:not(.off):not(.pri):active:before,.btn.is-p:not(.pri):before{background:var(--pane2)}
.btn.pri.is-p,.btn.pri.is-p:before{background:var(--cy-fill)}
.opt:not(.off):active,.opt.is-p,.mi:not(.off):active,.mi.is-p,.trow:active,.trow.is-p{background:var(--cy-soft)}
.tg.is-p .tgt i{transform:translateY(1px)}
/* 不能用：提示色字、内凹底、没有发光；为什么写在旁边或悬停时说（I5） */
.chip.off{color:var(--tx3);background:var(--line);cursor:not-allowed}.chip.off:before{background:var(--pane2)}
.seg button.off{color:var(--tx3);cursor:not-allowed}
.opt.off{cursor:not-allowed}.opt.off b,.opt.off span.d{color:var(--tx3)}.opt.off .rb,.opt.off .cb{background:var(--line)}
.opt.off .rb:before,.opt.off .cb:before{background:var(--pane2)}
.tgt.dis{background:var(--line)}.tgt.dis:before{background:var(--pane2)}.tgt.dis i{background:var(--line2)}
.tg.off{color:var(--tx3);cursor:not-allowed}
.mi.off{cursor:not-allowed}.mi.off b,.mi.off span{color:var(--tx3)!important}.mi.off .dot{background:var(--line2)}
.trow.off{cursor:not-allowed}.trow.off .fn{color:var(--tx3)}.trow.off .px{color:var(--line2)}
.field.off{background:var(--line2);color:var(--tx3);cursor:not-allowed}.field.off:before{background:var(--pane2)}.field.off .pr{color:var(--tx3)}
.btn.off{cursor:not-allowed}
.pk .btn.warn.off,.pk .btn.fill.off,.pk .btn.danger.off{background:var(--line2);color:var(--tx3);text-shadow:none}
.pk .btn.warn.off:before,.pk .btn.fill.off:before{display:block;background:var(--pane2)}
.pk .btn.ghost.off{background:transparent;color:var(--tx3)}
`;

const CSS = `
.pk.cl3{width:1760px;height:1300px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:16px}
.mx{display:grid;grid-template-columns:196px repeat(6,minmax(0,1fr));column-gap:14px}
.mx .hd{display:flex;flex-direction:column;gap:2px;padding:0 0 10px;border-bottom:1px solid var(--line2)}
.mx .hd b{${D};font-size:14px;letter-spacing:.1em;color:var(--cy-tx)}
.mx .hd span{font-size:12px;line-height:1.4;color:var(--tx3)}
.mx .nm3{display:flex;flex-direction:column;justify-content:center;gap:3px;padding:9px 0;border-bottom:1px dotted var(--line2)}
.mx .nm3 b{font-size:13px;font-weight:600}
.mx .nm3 span{display:flex;gap:4px}
.mx .cell{display:flex;align-items:center;min-height:56px;padding:9px 0;border-bottom:1px dotted var(--line2);min-width:0}
.mx .cell.na{${D};font-size:14px;color:var(--line2)}
.mx .seg button{padding:0 10px}
.mx .tg{font-size:12.5px;color:var(--tx)}
.mx .opt{width:100%;padding:5px 10px;text-align:left}
.mx .opt b{font-size:12.5px;font-weight:400;line-height:18px}
.mx .rmenu.inl,.bt .rmenu.inl{position:relative;left:auto;right:auto;bottom:auto;width:100%}
.mx .rmenu.inl{padding:3px}
.mx .rtree{width:100%}
.mx .trow{display:grid;grid-template-columns:12px minmax(0,1fr) auto auto;gap:6px;align-items:center;width:100%;height:23px;padding:0 6px;clip-path:var(--clip2);text-align:left}
.mx .trow.on{background:var(--cy-soft)}.mx .trow.on .px{color:var(--cy-tx)}
.mx .field{width:100%;height:34px}
.mx .field .v{color:var(--tx);font-family:var(--f-code);font-size:var(--fs-code);letter-spacing:.06em}
.bt{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.bt .mod{display:flex;flex-direction:column;gap:9px;padding:12px 16px 14px;min-width:0}
.bt .mod .ml{margin-bottom:2px}
.bt .rw{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bt .rw > span{font-size:12px;color:var(--tx3)}
.bt .lb2{width:60px;font-size:12px;color:var(--tx3);flex:none}
.bt .blocks.b20{flex:1;grid-template-columns:repeat(20,minmax(0,1fr))}
.bt .blocks i{height:12px}
.bt .blocks i.w{background:var(--warn);box-shadow:none;animation:none}
.pk .bt .toast{display:flex!important;position:relative;left:auto;bottom:auto;transform:none;animation:none;align-self:flex-start}
.mini{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mini .mod{padding:8px 10px;gap:2px}
.mini .mod b{${D};font-size:12px;letter-spacing:.08em;color:var(--tx2)}
.mini .mod span{font-size:12px;color:var(--tx3)}
.bt .rtabs{width:100%}
.bt .wt{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--tx2)}
.bt .cinx{display:flex;align-items:center;gap:8px;font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx)}
.bt .cinx .pr{color:var(--cy-tx)}
`;

const ST = [
  ['d', 'DEFAULT', '平时'],
  ['h', 'HOVER', '边亮成青线；青块、琥珀、红底亮一档'],
  ['f', 'FOCUS', '键盘走到：里面一圈 1 像素青点线'],
  ['p', 'PRESS', '往下沉 1 像素，发光收起'],
  ['o', 'ON', '选中、开着、已填'],
  ['x', 'OFF', '不能用：提示色字、内凹底、没有发光'],
];
const C = { d: '', h: 'is-h', f: 'is-f', p: 'is-p', o: 'on', x: 'off' };
const NA = null;
const ids = (a) => a.map((i) => `<em class="tg2 id">${i}</em>`).join('');
// [名字, 规则, (state) → html；返回 NA 表示这个状态没有]
const ROWS = [
  ['主按钮', ['K1'], (s) => (s === 'o' ? NA : `<button type="button" class="btn pri ${C[s]}">SEND${px('send')}</button>`)],
  ['按钮', ['K1'], (s) => (s === 'o' ? NA : `<button type="button" class="btn ${C[s]}">CANCEL</button>`)],
  ['小按钮', ['K9'], (s) => (s === 'o' ? NA : `<button type="button" class="btn ghost sm2 ${C[s]}">COPY</button>`)],
  ['危险按钮', ['K2'], (s) => (s === 'o' ? NA : `<button type="button" class="btn danger ${C[s]}">${px('undo')}UNDO TASK</button>`)],
  ['真要删的那一下', ['K2'], (s) => (s === 'o' ? NA : `<button type="button" class="btn fill ${C[s]}">UNDO 6 FILES</button>`)],
  ['琥珀按钮', ['R3'], (s) => (s === 'o' ? NA : `<button type="button" class="btn warn ${C[s]}">BACK</button>`)],
  ['选项片', ['K3'], (s) => `<button type="button" class="chip ${C[s]}">${px('plus')}TASK</button>`],
  ['分段', ['K3', 'I8'], (s) => `<div class="seg"><button type="button" class="${s === 'o' ? '' : 'on'}">PLAN</button><button type="button" class="${C[s]}">EDIT</button><button type="button">AUTO</button></div>`],
  ['开关', ['K7'], (s) => `<span class="tg ${s === 'x' ? 'off' : C[s]}"><span class="tgt ${s === 'o' ? '' : 'off'} ${s === 'x' ? 'dis' : ''}"><i></i></span>完成时通知</span>`],
  ['单选', ['I3'], (s) => `<button type="button" class="opt ${C[s]}"><span class="rb"></span><b>一起升到 4.1</b><span></span></button>`],
  ['多选', ['I2'], (s) => `<button type="button" class="opt ${C[s]}"><span class="cb">${px('check')}</span><b>删 2 个旧文件</b><span></span></button>`],
  ['输入框', ['K4', 'I7'], (s) => (s === 'p' ? NA : `<span class="field ${C[s]}"><span class="pr">›</span>${s === 'o' ? '<span class="v">sk-••••••••3f2a</span>' : s === 'x' ? '<span>这个任务跑完再填</span>' : s === 'f' ? '<span>粘贴 DeepSeek 的 Key</span><i class="caret"></i>' : '<span>粘贴 DeepSeek 的 Key</span>'}</span>`)],
  ['菜单项', ['K10'], (s) => `<div class="rmenu inl"><button type="button" class="mi ${C[s]}"><i class="dot muse"></i><b>MUSE</b><span>订阅额度 · 只读</span></button></div>`],
  ['列表行', ['R6'], (s) => (s === 'x' ? NA : `<div class="rtree"><button type="button" class="trow ${C[s]}">${px('file')}<span class="fn">Composer.tsx</span><span class="fa">+9</span><span class="fd">−21</span></button></div>`)],
];

function controlsBoard() {
  const def = FLIP ? '浅色' : '深色';
  const head = `<div class="hd"><b>CONTROL</b><span>控件 · 规则</span></div>` + ST.map(([, k, t]) => `<div class="hd"><b>${k}</b><span>${t}</span></div>`).join('');
  const rows = ROWS.map(([nm, r, f]) => `<div class="nm3"><b>${nm}</b><span>${ids(r)}</span></div>` + ST.map(([s]) => { const h = f(s); return h === NA ? '<div class="cell na">—</div>' : `<div class="cell">${h}</div>`; }).join('')).join('');
  const blocks = (n, k) => `<div class="blocks b20">${Array.from({ length: 20 }, (_, i) => `<i class="${i < n ? 'f' : i === n && k ? k : ''}"></i>`).join('')}</div>`;
  const bt = `<div class="bt">
    <div class="mod"><p class="ml"><span class="l">TAGS</span><span class="r">标签：一级台阶角</span></p>
      <p class="rw"><em class="tag new">NEW</em><em class="tag del">DEL</em><em class="tag rec">DEFAULT</em><em class="tag mid">WAIT</em><em class="tag hi">HIGH</em><em class="tag lo">2/3</em></p>
      <p class="rw"><span>新文件 · 删了 · 推荐 · 等你 · 高危 · 计数</span></p>
      <p class="ml" style="margin-top:6px"><span class="l">TABS</span><span class="r">页签上的提示（R2）</span></p>
      <div class="seg full rtabs"><button type="button">CHANGES<em>5</em></button><button type="button" class="on">ONE SHOT</button><button type="button">FILES</button><button type="button">TERM<span class="lk">${px('lock')}</span></button></div></div>
    <div class="mod"><p class="ml"><span class="l">PROGRESS</span><span class="r">方块进度（K5）</span></p>
      <p class="rw"><span class="lb2">还没开始</span>${blocks(0)}</p><p class="rw"><span class="lb2">在跑</span>${blocks(7, 'h')}</p>
      <p class="rw"><span class="lb2">等你</span>${blocks(9, 'w')}</p><p class="rw"><span class="lb2">做完</span>${blocks(20)}</p></div>
    <div class="mod"><p class="ml"><span class="l">WAIT</span><span class="r">等待和光标（S2、K4）</span></p>
      <p class="wt">${twinkle()}<span>Muse 在读 units.ts…</span></p>
      <p class="cinx"><span class="pr">›</span><span>把设置里三个对话框合成一个面板</span><i class="caret"></i></p>
      <p class="wt">${dotCheck()}<span>做完了 · 6 个文件</span></p>
      <div class="toast">${px('bang')}<span>同一个项目一次跑一个任务</span></div></div>
    <div class="mod"><p class="ml"><span class="l">EDGES</span><span class="r">模块的边（M3）</span></p>
      <div class="mini"><div class="mod"><b>[ NORMAL ]</b><span>平时</span></div><div class="mod run"><b>[ RUN ]</b><span>在跑</span></div>
        <div class="mod wait"><b>[ WAIT ]</b><span>等你</span></div><div class="mod err"><b>[ ERROR ]</b><span>出错</span></div></div>
      <p class="rw"><span>同一时刻只有一块模块描彩边。</span></p></div>
  </div>`;
  const body = `<div class="{{root}}"><div class="ft"><h1>控件全套 · 六个状态</h1><p>样子是第 2 步定的；这一轮补上悬停、键盘焦点、按下、不能用。左边一格真能指、能按、能用 Tab 走到。</p></div>
    <div class="mx">${head}${rows}</div>${bt}</div>`;
  const css = `${SIDE}\n${BASE}\n${CSS}\n${STATES}\n${themeCss()}`;
  const html = board({ title: '控件全套', css, body, props: themeProps(def), logic: rootLogic('pk cl3 doc dots', def), w: 1760, h: 1300 });
  return { file: 'S3-Controls.dc.html', w: 1760, h: 1300, title: '控件全套 · 14 种控件 × 6 个状态', html };
}

export function boards() {
  return [controlsBoard()];
}
