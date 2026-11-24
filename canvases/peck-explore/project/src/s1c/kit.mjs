// 第 1 步 · 第三轮共用：在第二轮的 C × P3 上落站主第二轮定的东西。
// 站主 2026-11-09 定：角像素阶梯、底纹 LED 点阵孔、发光强、点阵字连标签和按钮也用（英文大写）。
// 这一轮新探索：浅色里的青色（L1–L3）、界面字体（F1–F3）、青色小块的边缘也像素化。
import { board as board0, C, SANS, MONO, DOTS } from '../s1/common.mjs';
import { stepClip, px, twinkle, blocks, dotCheck } from '../s1b/kit.mjs';

export { C, SANS, MONO, DOTS, stepClip, px, twinkle, blocks, dotCheck };
export const FLIP = !!process.env.FLIP;
export const CY = '#00E5FF';

// ---------- 上传到画布的文件：本地检查时指到 project/ref/ ----------
const LOCAL = !!process.env.PECK_LOCAL;
export const A = {
  fusion: LOCAL ? './ref/fusion-pixel-12.woff2' : '/_blob/3cac2eac4c813b222f13d0c459436aa1',
  dep: LOCAL ? './ref/departure-mono.woff2' : '/_blob/13ad4bc2c335a5fe439f1dd23f0a7087',
  now: LOCAL ? './ref/peck-icon-now.png' : '/_blob/b44f0fb53fca08297a47e3b734091ffe',
  a1: LOCAL ? './ref/peck-icon-a1.png' : '/_blob/75a5360474c891aa75cb5f152074d9bf',
  a2: LOCAL ? './ref/peck-icon-a2.png' : '/_blob/2e8a78b18342a6243fca97ebf01de654',
  a3: LOCAL ? './ref/peck-icon-a3.png' : '/_blob/b2b77dcfff116af6d452687ca80848d9',
};

// ---------- 字体 ----------
// 缝合像素 12 格（中文像素字，OFL）：12、18、24 号才清楚。Departure Mono（像素等宽，OFL）：11、22 号。
export const PIX = '"Fusion Pixel 12","PingFang SC",sans-serif';
export const DEP = '"Departure Mono","Fusion Pixel 12","PingFang SC",monospace';
export const FONTFACE = `@font-face{font-family:"Fusion Pixel 12";src:url(${A.fusion}) format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Departure Mono";src:url(${A.dep}) format("woff2");font-weight:400;font-style:normal;font-display:swap}`;

// 三种字的角色：名字（任务名、步骤名、问题、选项）、说明、代码。标题是大号的名字。
export const FONTSETS = {
  ff1: { name: '光滑', 'f-name': SANS, 'fw-name': 600, 'fs-name': '13.5px', 'f-title': SANS, 'fw-title': 600, 'fs-title': '17px', 'f-body': SANS, 'fs-body': '12.5px', 'f-code': MONO, 'fs-code': '12px' },
  ff2: { name: '像素名字', 'f-name': PIX, 'fw-name': 400, 'fs-name': '12px', 'f-title': PIX, 'fw-title': 400, 'fs-title': '18px', 'f-body': SANS, 'fs-body': '12.5px', 'f-code': DEP, 'fs-code': '11px' },
  ff3: { name: '全像素', 'f-name': PIX, 'fw-name': 400, 'fs-name': '12px', 'f-title': PIX, 'fw-title': 400, 'fs-title': '18px', 'f-body': PIX, 'fs-body': '12px', 'f-code': DEP, 'fs-code': '11px' },
};

// ---------- 颜色 ----------
// 深色：P3 深海 + 强发光（第二轮的「强」）。浅色：底和字不变，青色分三种（c1 柔青、c2 深青、c3 墨底青光），c2 是推荐，也是默认。
const DK = {
  bg: '#050816', grid: 'rgba(120,140,255,.085)', pane: '#0A0F24', pane2: '#0F1630', raise: '#172040', line: '#1E2850', line2: '#2E3B72',
  tx: '#E8ECFF', tx2: '#9AA3CF', tx3: '#7A84B6',
  'cy-fill': CY, 'cy-ol': CY, 'on-cy': '#02101A', 'cy-tx': CY, 'cy-blk': CY, 'blk-ol': 'transparent',
  'cy-line': 'rgba(0,229,255,.6)', 'cy-soft': 'rgba(0,229,255,.10)', 'cy-scan': 'rgba(0,229,255,.22)',
  muse: '#A78BFA', grok: '#FFB86B', api: '#60A5FA', ok: '#4ADE80', warn: '#FFB86B', bad: '#FB7185',
  'warn-soft': 'rgba(255,184,107,.10)', 'bad-soft': 'rgba(251,113,133,.10)', 'ok-soft': 'rgba(74,222,128,.10)',
  'warn-line': 'rgba(255,184,107,.55)', 'bad-line': 'rgba(251,113,133,.6)',
  glow: '0 0 16px rgba(0,229,255,.85)', tglow: '0 0 26px rgba(0,229,255,.75),0 0 6px rgba(0,229,255,1)', dglow: '0 0 8px rgba(0,229,255,1)',
  bglow: '0 0 12px rgba(0,229,255,.85)', 'on-glow': '0 0 6px rgba(0,229,255,.9)', hglow: '0 0 8px rgba(232,236,255,.35)',
  off: '#141C3C',
};
const LT = {
  bg: '#F2F4FC', grid: 'rgba(40,50,130,.10)', pane: '#FFFFFF', pane2: '#F5F7FD', raise: '#E7EBF8', line: '#DAE0F0', line2: '#B4BDDB',
  tx: '#0B1030', tx2: '#4E567A', tx3: '#646C92',
  muse: '#6D4AE8', grok: '#A35E00', api: '#2563EB', ok: '#12804C', warn: '#A35E00', bad: '#E11D48',
  'warn-soft': '#FFF3E2', 'bad-soft': '#FFE9EE', 'ok-soft': '#E3F5EC', 'warn-line': '#A35E00', 'bad-line': '#E11D48',
  glow: 'none', tglow: 'none', dglow: 'none', bglow: 'none', hglow: 'none', off: '#E1E6F5',
};
// 对比度（对浅色底 #F2F4FC / 白面板）：c1 字 #00758C 4.9:1；c2 白字在 #007A94 上 5.0:1、#007A94 当字 4.5:1、进度块 #0099B8 3.1:1；c3 青字在墨底上 12:1
export const LCYAN = {
  c1: { name: '柔青', 'cy-fill': '#A6ECF7', 'cy-ol': '#0089A6', 'on-cy': '#0B1030', 'cy-tx': '#00758C', 'cy-blk': '#4DD3E8', 'blk-ol': '#0089A6', 'cy-line': '#0089A6', 'cy-soft': '#E3F8FB', 'cy-scan': 'rgba(0,180,208,.30)', 'on-glow': 'none' },
  c2: { name: '深青', 'cy-fill': '#007A94', 'cy-ol': '#007A94', 'on-cy': '#FFFFFF', 'cy-tx': '#007A94', 'cy-blk': '#0099B8', 'blk-ol': 'transparent', 'cy-line': '#0099B8', 'cy-soft': '#E2F4F8', 'cy-scan': 'rgba(0,153,184,.24)', 'on-glow': 'none' },
  c3: { name: '墨底青光', 'cy-fill': '#0B1030', 'cy-ol': '#0B1030', 'on-cy': '#00E5FF', 'cy-tx': '#00758C', 'cy-blk': '#00D8F0', 'blk-ol': '#0B1030', 'cy-line': '#0B1030', 'cy-soft': '#E3F8FB', 'cy-scan': 'rgba(0,229,255,.35)', 'on-glow': '0 0 6px rgba(0,229,255,.7)' },
};
const vars = (m) => Object.entries(m).filter(([k]) => k !== 'name').map(([k, v]) => `--${k}:${v}`).join(';');
export const THEME = `.dk{${vars(DK)};color-scheme:dark}
.lt{${vars(LT)};${vars(LCYAN.c2)};color-scheme:light}
.lt.c1{${vars(LCYAN.c1)}}
.lt.c3{${vars(LCYAN.c3)}}
.pk{${vars(FONTSETS.ff2)}}
.ff1{${vars(FONTSETS.ff1)}}
.ff2{${vars(FONTSETS.ff2)}}
.ff3{${vars(FONTSETS.ff3)}}`;

// ---------- 像素角 ----------
/** 一级台阶：四个角各切掉 s×s 一格。小东西（标签、开关的钮、单选点）用。 */
export const notch = (s) => {
  const a = `${s}px`, r = `calc(100% - ${s}px)`;
  return `polygon(0 ${a},${a} ${a},${a} 0,${r} 0,${r} ${a},100% ${a},100% ${r},${r} ${r},${r} 100%,${a} 100%,${a} ${r},0 ${r})`;
};

// ---------- Tweaks ----------
export const PROPS = {
  theme: (def) => ({ theme: { editor: 'enum', options: ['深色', '浅色'], default: def, section: '看' } }),
  font: { font: { editor: 'enum', options: ['F1 光滑', 'F2 像素名字', 'F3 全像素'], default: 'F2 像素名字', section: '看' } },
  lc: { lc: { editor: 'enum', options: ['L1 柔青', 'L2 深青', 'L3 墨底青光'], default: 'L2 深青', section: '看' } },
};
/** renderVals 里用：把 Tweaks 换成根上的类名。 */
export const rootJs = (base, def) => `const dark = (this.props.theme ?? '${def}') === '深色';
    const ff = 'ff' + ((this.props.font ?? 'F2').slice(1, 2));
    const lc = 'c' + ((this.props.lc ?? 'L2').slice(1, 2));
    const root = '${base} ' + (dark ? 'dk' : 'lt') + ' ' + ff + ' ' + lc;`;

/** 画板外壳：字体文件的 @font-face 放进 helmet。 */
export const board = (o) => board0({ ...o, css: `${FONTFACE}\n${KIT}\n${THEME}\n${o.css}` });

// ---------- 共用样式（root 类名 .pk） ----------
const D = `font-family:${DOTS};font-weight:900`;
export const KIT = `
.pk{position:relative;box-sizing:border-box;overflow:hidden;font-family:var(--f-body);font-size:var(--fs-body);line-height:1.55;color:var(--tx);background:var(--bg);-webkit-font-smoothing:antialiased;font-synthesis:none;font-variant-numeric:tabular-nums;--clip:${stepClip(3)};--clip2:${stepClip(2)};--notch:${notch(2)}}
.dots{background-image:radial-gradient(circle at 1.5px 1.5px,var(--grid) 1.1px,transparent 1.6px);background-size:8px 8px}
.pk *{box-sizing:border-box}
:where(.pk) :where(p,h1,h2,h3,ul,ol,figure){margin:0;padding:0}
:where(.pk) :where(ul,ol){list-style:none}
:where(.pk) button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;padding:0;text-align:left}
:where(.pk) :where(i,em){font-style:normal}
.px{width:16px;height:16px;fill:currentColor;flex:none;display:block}
.px.s12{width:12px;height:12px}.px.s24{width:24px;height:24px}
.nm{font-family:var(--f-name);font-weight:var(--fw-name);font-size:var(--fs-name)}
.code{font-family:var(--f-code);font-size:var(--fs-code)}
/* 模块：外层是边线色，:before 是面板色，两层都切成像素阶梯角 */
.mod{position:relative;isolation:isolate;clip-path:var(--clip);background:var(--mline,var(--line));padding:14px 18px 16px;min-width:0}
.mod:before{content:"";position:absolute;inset:1px;clip-path:var(--clip);background:var(--mbg,var(--pane));z-index:-1}
.mod.run{--mline:var(--cy-line)}
.mod.wait{--mline:var(--warn-line)}
.ml{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--tx3);margin-bottom:12px;white-space:nowrap}
.ml .l{${D};font-size:14px;letter-spacing:.08em;color:var(--tx2)}
.ml .l:before{content:"[ ";color:var(--tx3)}.ml .l:after{content:" ]";color:var(--tx3)}
.ml .r{margin-left:auto}
.ml .n{${D};font-size:17px;line-height:1;color:var(--tx2)}
.lbl{${D};font-size:13px;letter-spacing:.1em;color:var(--tx3);margin-bottom:6px}
.dot{display:inline-block;width:7px;height:7px;flex:none}
.dot.muse{background:var(--muse)}.dot.grok{background:var(--grok)}.dot.api{background:var(--api)}
.who{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.who .arr{color:var(--tx3)}
/* 3×3 点阵转圈 */
.tw{display:inline-grid;grid-template-columns:repeat(3,3px);gap:1.5px;flex:none}
.tw i{width:3px;height:3px;background:var(--cy-blk);box-shadow:var(--dglow);animation:tw 1.2s steps(1) infinite}
.tw i:nth-child(2){animation-delay:.3s}.tw i:nth-child(4){animation-delay:.6s}.tw i:nth-child(6){animation-delay:.15s}.tw i:nth-child(8){animation-delay:.45s}.tw i:nth-child(9){animation-delay:.9s}
.lt .tw i{box-shadow:inset 0 0 0 .5px var(--blk-ol)}
/* 按钮：点阵字、英文大写 */
.btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:34px;padding:0 14px;clip-path:var(--clip2);background:var(--line2);${D};font-size:14px;letter-spacing:.08em;white-space:nowrap;color:var(--tx)}
.btn:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.btn.pri{background:var(--cy-ol);color:var(--on-cy);text-shadow:var(--on-glow)}
.btn.pri:before{background:var(--cy-fill)}
.btn.danger{background:var(--bad-line);color:var(--bad)}
.btn.warn{background:var(--warn);color:var(--on-warn,#02101A)}.btn.warn:before{display:none}
.lt .btn.warn{--on-warn:#FFFFFF}
.btn.ghost{background:transparent;color:var(--tx2)}.btn.ghost:before{display:none}
.btn .k{font-size:12px;opacity:.7}
/* 开关 */
.tg{display:flex;align-items:center;gap:10px;font-size:13px}
.tgt{position:relative;isolation:isolate;width:34px;height:18px;flex:none;clip-path:var(--clip2);background:var(--cy-ol)}
.tgt:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--cy-fill);z-index:-1}
.tgt i{position:absolute;top:3px;left:19px;width:12px;height:12px;background:var(--on-cy);clip-path:var(--notch)}
.tgt.off{background:var(--line2)}.tgt.off:before{background:var(--pane)}.tgt.off i{left:3px;background:var(--line2)}
/* 分段：选中的那块也切成像素角 */
.seg{display:inline-flex;gap:3px;padding:3px;clip-path:var(--clip2);background:var(--line2);position:relative;isolation:isolate}
.seg:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.seg button{position:relative;isolation:isolate;height:28px;padding:0 12px;${D};font-size:14px;letter-spacing:.08em;color:var(--tx2);display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;clip-path:var(--clip2)}
.seg button.on{background:var(--cy-ol);color:var(--on-cy);text-shadow:var(--on-glow)}
.seg button.on:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--cy-fill);z-index:-1}
.seg.full{display:flex;width:100%}.seg.full button{flex:1 1 0}
.seg.ink button.on{background:var(--tx);color:var(--bg);text-shadow:none}
.seg.ink button.on:before{display:none}
/* 选项片 */
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;clip-path:var(--clip2);background:var(--line2);${D};font-size:13px;letter-spacing:.06em;color:var(--tx2);white-space:nowrap}
.chip:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.chip.on{background:var(--cy-ol);color:var(--tx)}
/* 标签：一级台阶角 */
.tag{position:relative;isolation:isolate;display:inline-flex;align-items:center;height:19px;padding:0 6px;clip-path:var(--notch);${D};font-size:12.5px;letter-spacing:.06em;line-height:1;white-space:nowrap;vertical-align:middle}
.tag.new{background:var(--ok);color:var(--bg)}.tag.del{background:var(--bad);color:var(--bg)}
.tag.rec{background:var(--cy-ol);color:var(--on-cy);text-shadow:var(--on-glow)}
.tag.rec:before{content:"";position:absolute;inset:1px;clip-path:var(--notch);background:var(--cy-fill);z-index:-1}
.tag.mid{background:var(--warn-line);color:var(--warn)}
.tag.mid:before{content:"";position:absolute;inset:1px;clip-path:var(--notch);background:var(--warn-soft);z-index:-1}
.tag.hi{background:var(--bad);color:var(--bg)}
.tag.lo{background:var(--raise);color:var(--tx2)}
/* 单选、多选：像素圆和像素方 */
.rb{position:relative;isolation:isolate;width:16px;height:16px;flex:none;clip-path:var(--clip2);background:var(--line2)}
.rb:before{content:"";position:absolute;inset:2px;clip-path:var(--notch);background:var(--pane);z-index:-1}
.on>.rb,.rb.on{background:var(--cy-tx)}
.on>.rb:after,.rb.on:after{content:"";position:absolute;left:5px;top:5px;width:6px;height:6px;background:var(--cy-tx)}
.cb{position:relative;isolation:isolate;width:16px;height:16px;flex:none;display:flex;align-items:center;justify-content:center;clip-path:var(--notch);background:var(--line2);color:transparent}
.cb:before{content:"";position:absolute;inset:2px;background:var(--pane);z-index:-1}
.cb .px{width:12px;height:12px}
.on>.cb,.cb.on{background:var(--cy-ol);color:var(--on-cy)}
.on>.cb:before,.cb.on:before{inset:1px;background:var(--cy-fill)}
/* 输入框 */
.field{display:flex;align-items:center;height:38px;padding:0 12px;clip-path:var(--clip2);background:var(--cy-ol);position:relative;isolation:isolate;font-size:13px;color:var(--tx3)}
.field:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane2);z-index:-1}
.field .pr{font-family:var(--f-code);font-size:13px;color:var(--cy-tx);margin-right:8px}
.caret{display:inline-block;width:8px;height:15px;background:var(--cy-blk);box-shadow:var(--dglow);margin-left:2px;vertical-align:middle;animation:blink 1.05s steps(1) infinite}
.lt .caret{box-shadow:inset 0 0 0 1px var(--blk-ol)}
.kbd{font-family:var(--f-code);font-size:11.5px;color:var(--tx3)}
/* 方块进度 */
.blocks{display:grid;grid-template-columns:repeat(28,minmax(0,1fr));gap:3px}
.blocks i{display:block;height:14px;background:var(--off)}
.blocks i.f{background:var(--cy-blk);box-shadow:var(--bglow);animation:wave 2.4s ease-in-out infinite}
.blocks i.h{background:var(--cy-blk);box-shadow:var(--bglow);animation:blink .8s steps(1) infinite}
.lt .blocks i.f,.lt .blocks i.h{box-shadow:inset 0 0 0 1px var(--blk-ol)}
.meter{display:grid;grid-template-columns:repeat(20,minmax(0,1fr));gap:3px}
.meter i{height:10px;background:var(--off)}
.meter i.f{background:var(--cy-blk);box-shadow:var(--dglow)}
.lt .meter i.f{box-shadow:inset 0 0 0 1px var(--blk-ol)}
/* 点阵勾 */
.dck{display:inline-grid;grid-template-columns:repeat(7,4px);grid-auto-rows:4px;gap:1px;flex:none}
.dck i{width:4px;height:4px;background:var(--off)}
.dck i.on{background:var(--cy-blk);box-shadow:var(--dglow)}
.lt .dck i.on{background:var(--cy-tx)}
@keyframes blink{50%{opacity:0}}
@keyframes tw{50%{opacity:.18}}
@keyframes wave{0%,100%{filter:brightness(1)}50%{filter:brightness(.62)}}
@keyframes bounce{0%{transform:scale(1)}18%{transform:scale(1.5);animation-timing-function:cubic-bezier(.3,1.6,.5,1)}40%{transform:scale(.9)}55%,100%{transform:scale(1)}}
@keyframes ring{0%,10%{transform:scale(1);opacity:0}14%{opacity:.9}60%,100%{transform:scale(2.6);opacity:0}}
@keyframes scanx{0%{left:-90px}62%,100%{left:100%}}
@media (prefers-reduced-motion:reduce){.pk *,.pk *:before,.pk *:after{animation:none!important;transition:none!important}.pk .scan-fx{display:none}}
`;
