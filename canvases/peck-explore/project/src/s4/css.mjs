// 第 4 步 · Design System 的组件样式（components/bundle.css）。
// 样子照第 2、3 步批准的小样（s2d/side.mjs、s3/controls.mjs 的 CSS），变量换成 tokens.css 的名字；类名都以 pk- 开头。
// 数值能对上 token 的写 var(--…)，对不上的（小样里的 12.5、15 这类）照小样原样写，S4-Kit 板逐格对过。
import { ICONS } from '../s1b/kit.mjs';
import { ICON8 } from '../s2d/side.mjs';
import { GEAR } from '../s2/proto.mjs';
import { stepClip } from '../s1b/kit.mjs';
import { notch } from '../s1c/kit.mjs';

// ---------- 像素图标：8×8 格，CSS 遮罩画成 16（12、24），颜色跟字走（currentColor） ----------
export const GLYPHS = { ...ICONS, ...ICON8, gear: GEAR };
// 图标的中文名（README 和 Icon 预览用）
export const GLYPH_NAMES = {
  check: '勾、通过', x: '关掉、失败', play: '开始', ask: '问你', bang: '注意', term: '终端', file: '文件', folder: '文件夹',
  shield: '权限', globe: '联网', trash: '删除', pen: '改', undo: '撤销', bell: '通知', send: '发出', out: '展开输出', clock: '时间',
  lock: '锁着', plus: '加', expand: '展开到宽栏', collapse: '收回', chat: 'ONE SHOT', triR: '收起的树', triD: '展开的树', stop: '停', gear: '设置',
};
/** 8×8 的格子 → 一条 path（每行连续的格子合成一段）。 */
export function glyphPath(rows) {
  let d = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      if (row[x] !== '#') { x++; continue; }
      let e = x; while (e < row.length && row[e] === '#') e++;
      d += `M${x} ${y}h${e - x}v1h-${e - x}z`;
      x = e;
    }
  });
  return d;
}
export const glyphSvg = (name, fill = '#000') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges"><path fill="${fill}" d="${glyphPath(GLYPHS[name])}"/></svg>`;
const dataUri = (svg) => `url("data:image/svg+xml,${svg.replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23')}")`;

const ON = ':not(:disabled):not(.is-off):not([aria-disabled="true"])';
const OFF = ':is(:disabled,.is-off,[aria-disabled="true"])';
const D = 'font-family:var(--font-dots);font-weight:900';

export function bundleCss() {
  const icons = Object.keys(GLYPHS).map((n) => `.pk-i--${n}{--pk-i:${dataUri(glyphSvg(n))}}`).join('\n');
  return `/* Peck — 组件样式。类名都以 pk- 开头；颜色、字、间距、发光都从 tokens.css 取（--color-*、--font-*、--text-*、--leading-*、--space-*、--shadow-glow-*）。
   明暗：根上写 data-theme="dark"（默认）或 "light"。由 Peck Explore 画布的 project/src/s4/css.mjs 生成，不手改。 */

/* ---------- 像素阶梯角（没有圆角）：模块 2 级 × 3px，控件 2 级 × 2px，小东西 1 级 × 2px ---------- */
:root{--pk-clip:${stepClip(3)};--pk-clip2:${stepClip(2)};--pk-notch:${notch(2)}}

/* ---------- 根：写在页面或画板最外层 ---------- */
.pk{font-family:var(--font-body);font-size:var(--text-body);line-height:1.55;color:var(--color-text);background:var(--color-page);-webkit-font-smoothing:antialiased;font-synthesis:none;font-variant-numeric:tabular-nums}
.pk-dots{background-image:radial-gradient(circle at 1.5px 1.5px,var(--color-grid) 1.1px,transparent 1.6px);background-size:8px 8px}
.pk,.pk *,.pk *:before,.pk *:after{box-sizing:border-box}
:where(.pk) :where(p,h1,h2,h3,h4,ul,ol,li,figure){margin:0;padding:0}
:where(.pk) :where(ul,ol){list-style:none}
:where(.pk) :where(i,em){font-style:normal}
:where(.pk) :where(button){font:inherit;color:inherit;border:0;background:none;padding:0;margin:0;text-align:left;cursor:pointer}

/* ---------- 图标：<i class="pk-i pk-i--send"></i>，颜色跟着字 ---------- */
.pk-i{display:inline-block;flex:none;width:16px;height:16px;vertical-align:middle;background-color:currentColor;-webkit-mask:var(--pk-i) center/100% 100% no-repeat;mask:var(--pk-i) center/100% 100% no-repeat}
.pk-i--12{width:12px;height:12px}
.pk-i--24{width:24px;height:24px}
${icons}

/* ---------- 模块：外层是边线色，:before 是面板色，两层都切台阶角；状态只换外层 ---------- */
/* 边和面写在模块自己身上（不从外层的模块继承）：模块套模块时，里面那块不跟着外面变色 */
.pk-mod{--pk-edge:var(--color-line);--pk-face:var(--color-panel);position:relative;isolation:isolate;display:block;clip-path:var(--pk-clip);background:var(--pk-edge);padding:14px 18px 16px;min-width:0}
.pk-mod:before{content:"";position:absolute;inset:1px;clip-path:var(--pk-clip);background:var(--pk-face);z-index:-1}
.pk-mod--run{--pk-edge:var(--color-cyan-line)}
.pk-mod--wait{--pk-edge:var(--color-warn-line)}
.pk-mod--err{--pk-edge:var(--color-bad-line)}
.pk-mod--sunk{--pk-face:var(--color-panel-2)}
.pk-mod-head{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:12px;color:var(--color-text-3);white-space:nowrap}
.pk-mod-label{${D};font-size:var(--text-button);letter-spacing:.08em;color:var(--color-text-2)}
.pk-mod-label:before{content:"[ ";color:var(--color-text-3)}
.pk-mod-label:after{content:" ]";color:var(--color-text-3)}
.pk-mod-note{margin-left:auto}
.pk-mod-count{${D};font-size:var(--text-count);line-height:1;color:var(--color-text-2)}

/* ---------- 按钮：点阵字、英文大写 ---------- */
.pk-btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:34px;padding:0 14px;margin:0;border:0;clip-path:var(--pk-clip2);background:var(--color-line-strong);${D};font-size:var(--text-button);line-height:1.55;letter-spacing:.08em;white-space:nowrap;color:var(--color-text);text-decoration:none;cursor:pointer}
.pk-btn:before{content:"";position:absolute;inset:1px;clip-path:var(--pk-clip2);background:var(--color-panel);z-index:-1}
.pk-btn--primary{background:var(--color-cyan);color:var(--color-on-cyan);text-shadow:var(--shadow-glow-on-cyan)}
.pk-btn--primary:before{background:var(--color-cyan)}
.pk-btn--danger{background:var(--color-bad-line);color:var(--color-bad)}
.pk-btn--fill{background:var(--color-bad);color:var(--color-on-bad)}
.pk-btn--fill:before{display:none}
.pk-btn--warn{background:var(--color-warn);color:var(--color-on-warn)}
.pk-btn--warn:before{display:none}
.pk-btn--ghost{background:transparent;color:var(--color-text-2)}
.pk-btn--ghost:before{display:none}
.pk-btn--sm{height:26px;padding:0 8px;font-size:var(--text-label);gap:6px}
.pk-btn--sm .pk-i{width:12px;height:12px}
.pk-btn--square{width:26px;padding:0}
.pk-btn .pk-key{font-size:12px;opacity:.7}
/* 悬停：有边的边亮成青线、里面抬起一档；青块、琥珀、红底亮一档 */
.pk-btn:hover${ON},.pk-btn.is-hover{background:var(--color-cyan-line)}
.pk-btn:hover${ON}:before,.pk-btn.is-hover:before{background:var(--color-raised)}
.pk-btn--primary:hover${ON},.pk-btn--primary.is-hover,.pk-btn--primary:hover${ON}:before,.pk-btn--primary.is-hover:before{background:var(--color-cyan-hover)}
.pk-btn--ghost:hover${ON},.pk-btn--ghost.is-hover{background:var(--color-raised);color:var(--color-text)}
.pk-btn--danger:hover${ON},.pk-btn--danger.is-hover{background:var(--color-bad)}
.pk-btn--danger:hover${ON}:before,.pk-btn--danger.is-hover:before{background:var(--color-bad-soft)}
.pk-btn--fill:hover${ON},.pk-btn--fill.is-hover{background:var(--color-bad-hover)}
.pk-btn--warn:hover${ON},.pk-btn--warn.is-hover{background:var(--color-warn-hover)}
/* 按下：往下沉 1 像素，发光收起；有边的里面凹一档 */
.pk-btn:active${ON},.pk-btn.is-press{transform:translateY(1px);text-shadow:none}
.pk-btn:not(.pk-btn--primary):active${ON}:before,.pk-btn.is-press:not(.pk-btn--primary):before{background:var(--color-panel-2)}
.pk-btn--primary:active${ON},.pk-btn--primary.is-press,.pk-btn--primary:active${ON}:before,.pk-btn--primary.is-press:before{background:var(--color-cyan)}
/* 不能用：提示色字、内凹底、没有发光 */
.pk-btn${OFF}{background:var(--color-line-strong);color:var(--color-text-3);text-shadow:none;cursor:not-allowed}
.pk-btn${OFF}:before{display:block;background:var(--color-panel-2)}
.pk-btn--ghost${OFF}{background:transparent}
.pk-btn--ghost${OFF}:before{display:none}

/* ---------- 选项片 ---------- */
.pk-chip{position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;margin:0;border:0;clip-path:var(--pk-clip2);background:var(--color-line-strong);${D};font-size:var(--text-label);line-height:1.55;letter-spacing:.06em;color:var(--color-text-2);white-space:nowrap;cursor:pointer}
.pk-chip:before{content:"";position:absolute;inset:1px;clip-path:var(--pk-clip2);background:var(--color-panel);z-index:-1}
.pk-chip.is-on{background:var(--color-cyan);color:var(--color-text)}
.pk-chip--sm{height:26px;padding:0 8px;font-size:12.5px;gap:5px}
.pk-chip--sm .pk-i{width:12px;height:12px}
.pk-chip:hover${ON}:not(.is-on),.pk-chip.is-hover:not(.is-on){background:var(--color-cyan-line);color:var(--color-text)}
.pk-chip.is-on:hover:before,.pk-chip.is-on.is-hover:before{background:var(--color-cyan-soft)}
.pk-chip:active${ON},.pk-chip.is-press{transform:translateY(1px)}
.pk-chip${OFF}{color:var(--color-text-3);background:var(--color-line);cursor:not-allowed}
.pk-chip${OFF}:before{background:var(--color-panel-2)}

/* ---------- 分段和页签：选中的那块也切台阶角 ---------- */
.pk-seg{position:relative;isolation:isolate;display:inline-flex;gap:3px;padding:3px;clip-path:var(--pk-clip2);background:var(--color-line-strong)}
.pk-seg:before{content:"";position:absolute;inset:1px;clip-path:var(--pk-clip2);background:var(--color-panel);z-index:-1}
.pk-seg>button{position:relative;isolation:isolate;display:flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 12px;margin:0;border:0;background:none;clip-path:var(--pk-clip2);${D};font-size:var(--text-button);line-height:1.55;letter-spacing:.08em;color:var(--color-text-2);white-space:nowrap;cursor:pointer}
.pk-seg>.is-on,.pk-seg>[aria-selected="true"]{background:var(--color-cyan);color:var(--color-on-cyan);text-shadow:var(--shadow-glow-on-cyan)}
.pk-seg--full{display:flex;width:100%}
.pk-seg--full>button{flex:1 1 0}
.pk-seg--sm>button{height:26px;padding:0 10px;font-size:var(--text-label)}
.pk-seg>button:not(.is-on):not([aria-selected="true"]):hover${ON},.pk-seg>button.is-hover:not(.is-on){background:var(--color-raised);color:var(--color-text)}
.pk-seg>.is-on:hover,.pk-seg>[aria-selected="true"]:hover,.pk-seg>.is-on.is-hover{background:var(--color-cyan-hover)}
.pk-seg>button:active${ON},.pk-seg>button.is-press{transform:translateY(1px);text-shadow:none}
.pk-seg>button${OFF}{color:var(--color-text-3);cursor:not-allowed}
/* 右栏的页签：分段铺满，数字、锁、角标 */
.pk-tabs>button{flex:1 1 auto;padding:0 7px;font-size:var(--text-label);letter-spacing:.05em;gap:5px}
.pk-tabs em{font-style:normal;color:var(--color-cyan-text)}
.pk-tabs .is-on em,.pk-tabs [aria-selected="true"] em{color:var(--color-on-cyan)}
.pk-tabs .pk-i{width:12px;height:12px;color:var(--color-text-3)}
.pk-tabs .is-on .pk-i,.pk-tabs [aria-selected="true"] .pk-i{color:var(--color-on-cyan)}
.pk-tabs .pk-twinkle{transform:scale(.8)}
.pk-badge{display:block;flex:none;width:6px;height:6px;background:var(--color-cyan-block);box-shadow:var(--shadow-glow-dot)}
.pk-badge--ok{background:var(--color-ok);box-shadow:none}
.pk-badge--bad{background:var(--color-bad);box-shadow:none}

/* ---------- 开关：<button class="pk-switch" role="switch" aria-checked="true"> ---------- */
.pk-switch{position:relative;display:inline-flex;align-items:center;gap:10px;margin:0;padding:0;border:0;background:none;font:inherit;font-size:13px;color:var(--color-text);cursor:pointer}
.pk-switch-track{position:relative;isolation:isolate;display:block;width:34px;height:18px;flex:none;clip-path:var(--pk-clip2);background:var(--color-cyan)}
.pk-switch-track:before{content:"";position:absolute;inset:1px;clip-path:var(--pk-clip2);background:var(--color-cyan);z-index:-1}
.pk-switch-track i{position:absolute;top:3px;left:19px;width:12px;height:12px;background:var(--color-on-cyan);clip-path:var(--pk-notch)}
.pk-switch[aria-checked="false"] .pk-switch-track{background:var(--color-line-strong)}
.pk-switch[aria-checked="false"] .pk-switch-track:before{background:var(--color-panel)}
.pk-switch[aria-checked="false"] .pk-switch-track i{left:3px;background:var(--color-line-strong)}
.pk-switch:hover${ON}[aria-checked="false"] .pk-switch-track,.pk-switch.is-hover[aria-checked="false"] .pk-switch-track{background:var(--color-cyan-line)}
.pk-switch:hover${ON}[aria-checked="true"] .pk-switch-track,.pk-switch.is-hover[aria-checked="true"] .pk-switch-track,.pk-switch:hover${ON}[aria-checked="true"] .pk-switch-track:before,.pk-switch.is-hover[aria-checked="true"] .pk-switch-track:before{background:var(--color-cyan-hover)}
.pk-switch:active${ON} .pk-switch-track i,.pk-switch.is-press .pk-switch-track i{transform:translateY(1px)}
.pk-switch${OFF}{color:var(--color-text-3);cursor:not-allowed}
.pk-switch${OFF} .pk-switch-track{background:var(--color-line)}
.pk-switch${OFF} .pk-switch-track:before{background:var(--color-panel-2)}
.pk-switch${OFF} .pk-switch-track i{background:var(--color-line-strong)}

/* ---------- 单选、多选：一行一个选项，前面是像素圆（pk-radio）或像素方（pk-check） ---------- */
.pk-opt{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:12px;align-items:start;width:100%;padding:3px 10px;margin:0;border:0;background:none;clip-path:var(--pk-clip2);text-align:left;font:inherit;color:var(--color-text);cursor:pointer}
.pk-opt-name{display:flex;align-items:center;gap:8px;font-family:var(--font-name);font-size:var(--text-name);font-weight:400;line-height:20px}
.pk-opt-desc{display:block;font-size:12px;color:var(--color-text-2)}
.pk-opt-key{${D};font-size:14px;color:var(--color-text-3);text-align:right;padding-top:2px}
.pk-opt.is-on,.pk-opt[aria-checked="true"]{background:var(--color-cyan-soft)}
.pk-radio{position:relative;isolation:isolate;display:block;width:16px;height:16px;flex:none;margin-top:2px;clip-path:var(--pk-clip2);background:var(--color-line-strong)}
.pk-radio:before{content:"";position:absolute;inset:2px;clip-path:var(--pk-notch);background:var(--color-panel);z-index:-1}
.pk-radio.is-on,.is-on>.pk-radio,[aria-checked="true"]>.pk-radio{background:var(--color-cyan-text)}
.pk-radio.is-on:after,.is-on>.pk-radio:after,[aria-checked="true"]>.pk-radio:after{content:"";position:absolute;left:5px;top:5px;width:6px;height:6px;background:var(--color-cyan-text)}
.pk-check{position:relative;isolation:isolate;display:flex;align-items:center;justify-content:center;width:16px;height:16px;flex:none;margin-top:2px;clip-path:var(--pk-notch);background:var(--color-line-strong);color:transparent}
.pk-check:before{content:"";position:absolute;inset:2px;background:var(--color-panel);z-index:-1}
.pk-check .pk-i{width:12px;height:12px}
.pk-check.is-on,.is-on>.pk-check,[aria-checked="true"]>.pk-check{background:var(--color-cyan);color:var(--color-on-cyan)}
.pk-check.is-on:before,.is-on>.pk-check:before,[aria-checked="true"]>.pk-check:before{inset:1px;background:var(--color-cyan)}
.pk-opt:hover${ON}:not(.is-on):not([aria-checked="true"]),.pk-opt.is-hover:not(.is-on){background:var(--color-raised)}
.pk-opt:active${ON},.pk-opt.is-press{background:var(--color-cyan-soft)}
.pk-opt${OFF}{cursor:not-allowed}
.pk-opt${OFF} .pk-opt-name,.pk-opt${OFF} .pk-opt-desc{color:var(--color-text-3)}
.pk-opt${OFF} .pk-radio,.pk-opt${OFF} .pk-check{background:var(--color-line)}
.pk-opt${OFF} .pk-radio:before,.pk-opt${OFF} .pk-check:before{background:var(--color-panel-2)}

/* ---------- 输入框（单独的一格，填 Key 这类）和输入行（中栏、ONE SHOT 底下那一行） ---------- */
.pk-field{position:relative;isolation:isolate;display:flex;align-items:center;height:38px;padding:0 12px;clip-path:var(--pk-clip2);background:var(--color-cyan);font-size:13px;color:var(--color-text-3)}
.pk-field:before{content:"";position:absolute;inset:1px;clip-path:var(--pk-clip2);background:var(--color-panel-2);z-index:-1}
.pk-field input{flex:1;min-width:0;height:100%;border:0;background:none;outline:none;padding:0;font:inherit;color:var(--color-text)}
.pk-field input::placeholder{color:var(--color-text-3)}
.pk-prompt{font-family:var(--font-code);font-size:13px;color:var(--color-cyan-text);margin-right:8px}
.pk-field-value{color:var(--color-text);font-family:var(--font-code);font-size:var(--text-code);letter-spacing:.06em}
.pk-field:hover:not(.is-off):before,.pk-field.is-hover:before{background:var(--color-raised)}
.pk-field.is-off{background:var(--color-line-strong);color:var(--color-text-3);cursor:not-allowed}
.pk-field.is-off:before{background:var(--color-panel-2)}
.pk-field.is-off .pk-prompt{color:var(--color-text-3)}
.pk-input{position:relative;display:flex;align-items:center;width:100%;height:30px;padding:0 2px;font-size:13.5px;color:var(--color-text-3);overflow:hidden}
.pk-input .pk-prompt{font-size:inherit}
.pk-input-text{color:var(--color-text)}
.pk-input.is-off .pk-caret{display:none}

/* ---------- 菜单：谁来答这类弹出的单子 ---------- */
.pk-menu{position:relative;isolation:isolate;display:flex;flex-direction:column;padding:8px 6px 6px;clip-path:var(--pk-clip2);background:var(--color-cyan-line)}
.pk-menu:before{content:"";position:absolute;inset:1px;clip-path:var(--pk-clip2);background:var(--color-panel-2);z-index:-1}
.pk-menu-group{${D};font-size:12px;letter-spacing:.1em;color:var(--color-text-3);padding:2px 8px 4px}
.pk-menu-sep{margin:5px 4px 6px;border-top:1px dotted var(--color-line-strong)}
.pk-menu-item{position:relative;display:grid;grid-template-columns:7px minmax(0,1fr) auto;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;margin:0;border:0;background:none;clip-path:var(--pk-clip2);text-align:left;font:inherit;cursor:pointer}
.pk-menu-item b{${D};font-size:13px;letter-spacing:.06em;color:var(--color-text);white-space:nowrap}
.pk-menu-item span{font-size:12px;color:var(--color-text-3);white-space:nowrap}
.pk-menu-item.is-on{background:var(--color-cyan-soft)}
.pk-menu-item.is-on b{color:var(--color-cyan-text)}
.pk-menu-action{position:relative;display:flex;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;margin:0;border:0;background:none;clip-path:var(--pk-clip2);text-align:left;font:inherit;font-size:12.5px;color:var(--color-text-2);white-space:nowrap;cursor:pointer}
.pk-menu-action .pk-i{width:12px;height:12px;color:var(--color-cyan-text)}
.pk-menu-action em{margin-left:auto;font-style:normal;font-size:12px;color:var(--color-text-3)}
.pk-menu-item:hover${ON}:not(.is-on),.pk-menu-item.is-hover:not(.is-on),.pk-menu-action:hover${ON},.pk-menu-action.is-hover{background:var(--color-raised)}
.pk-menu-item:active${ON},.pk-menu-item.is-press{background:var(--color-cyan-soft)}
.pk-menu-item${OFF}{cursor:not-allowed}
.pk-menu-item${OFF} b,.pk-menu-item${OFF} span{color:var(--color-text-3)}
.pk-menu-item${OFF} .pk-dot{background:var(--color-line-strong)}

/* ---------- 键盘焦点：控件里面内缩 3 像素一圈 1 像素点线（color-focus）；像素角会切掉外面的光圈，所以画在里面 ---------- */
:is(.pk-btn,.pk-chip,.pk-seg>button,.pk-opt,.pk-menu-item,.pk-menu-action,.pk-row,.pk-switch):focus-visible{outline:none}
:is(.pk-btn,.pk-chip,.pk-seg>button,.pk-opt,.pk-menu-item,.pk-menu-action,.pk-row):is(:focus-visible,.is-focus):after{content:"";position:absolute;inset:3px;border:1px dotted var(--color-focus);pointer-events:none}
:is(.pk-btn--primary,.pk-seg>.is-on,.pk-seg>[aria-selected="true"]):is(:focus-visible,.is-focus):after{border-color:var(--color-on-cyan)}
.pk-btn.pk-btn--fill:is(:focus-visible,.is-focus):after{border-color:var(--color-on-bad)}
.pk-btn.pk-btn--warn:is(:focus-visible,.is-focus):after{border-color:var(--color-on-warn)}
.pk-switch:is(:focus-visible,.is-focus):after{content:"";position:absolute;inset:-4px -6px;border:1px dotted var(--color-focus);pointer-events:none}
.pk-field:focus-within:before{background:var(--color-panel-2)}

/* ---------- 身份色点：Muse 紫、Grok 橙、API 蓝，只用 7 像素的方点 ---------- */
.pk-dot{display:inline-block;width:7px;height:7px;flex:none;background:var(--color-text-3)}
.pk-dot--muse{background:var(--color-muse)}
.pk-dot--grok{background:var(--color-grok)}
.pk-dot--api{background:var(--color-api)}
.pk-who{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}

/* ---------- 列表行：文件树、改动列表 ---------- */
.pk-tree{display:flex;flex-direction:column}
.pk-row{position:relative;display:grid;grid-template-columns:12px minmax(0,1fr) auto auto auto;gap:6px;align-items:center;width:100%;height:23px;padding:0 6px;margin:0;border:0;background:none;clip-path:var(--pk-clip2);text-align:left;font:inherit;color:inherit;cursor:pointer}
.pk-row .pk-i{width:12px;height:12px;color:var(--color-text-3)}
.pk-row-name{font-family:var(--font-code);font-size:var(--text-code);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--color-text)}
.pk-row--dir .pk-row-name{color:var(--color-text-2)}
.pk-row--del .pk-row-name{color:var(--color-text-3);text-decoration:line-through}
.pk-row.is-on{background:var(--color-cyan-soft)}
.pk-row.is-on .pk-i{color:var(--color-cyan-text)}
.pk-row .pk-tag{height:17px;padding:0 5px;font-size:12px}
.pk-add,.pk-del{${D};font-size:12px;text-align:right}
.pk-add{color:var(--color-ok)}
.pk-del{color:var(--color-bad)}
.pk-row:hover${ON},.pk-row.is-hover{background:var(--color-raised)}
.pk-row:active${ON},.pk-row.is-press{background:var(--color-cyan-soft)}
.pk-row${OFF}{cursor:not-allowed}
.pk-row${OFF} .pk-row-name{color:var(--color-text-3)}
.pk-row${OFF} .pk-i{color:var(--color-line-strong)}

/* ---------- 标签：一级台阶角 ---------- */
.pk-tag{position:relative;isolation:isolate;display:inline-flex;align-items:center;height:19px;padding:0 6px;clip-path:var(--pk-notch);${D};font-size:12.5px;letter-spacing:.06em;line-height:1;white-space:nowrap;vertical-align:middle;background:var(--color-raised);color:var(--color-text-2)}
.pk-tag--new{background:var(--color-ok);color:var(--color-page)}
.pk-tag--del,.pk-tag--high{background:var(--color-bad);color:var(--color-page)}
.pk-tag--rec{background:var(--color-cyan);color:var(--color-on-cyan);text-shadow:var(--shadow-glow-on-cyan)}
.pk-tag--wait{background:var(--color-warn-line);color:var(--color-warn)}
.pk-tag--wait:before{content:"";position:absolute;inset:1px;clip-path:var(--pk-notch);background:var(--color-warn-soft);z-index:-1}
.pk-tag--ok{background:var(--color-ok-soft);color:var(--color-ok);box-shadow:inset 0 0 0 1px var(--color-ok)}

/* ---------- 任务的状态字（RUN / WAIT / DONE）和读数 ---------- */
.pk-state{display:inline-block;width:fit-content;${D};font-size:15px;letter-spacing:.14em;line-height:1.2;color:var(--color-cyan-text);text-shadow:var(--shadow-glow-timer)}
.pk-state--wait{color:var(--color-warn);text-shadow:none}
.pk-state--done{color:var(--color-ok);text-shadow:none}
.pk-state--err{color:var(--color-bad);text-shadow:none}
.pk-state--off{color:var(--color-text-3);text-shadow:none}
[data-theme="light"] .pk-state,.pk-state[data-theme="light"]{background:var(--color-cyan);color:var(--color-on-cyan);padding:2px 6px 1px;clip-path:var(--pk-notch)}
[data-theme="light"] .pk-state--wait,.pk-state--wait[data-theme="light"]{background:var(--color-warn-soft);color:var(--color-warn)}
[data-theme="light"] .pk-state--done,.pk-state--done[data-theme="light"]{background:var(--color-ok-soft);color:var(--color-ok)}
[data-theme="light"] .pk-state--err,.pk-state--err[data-theme="light"]{background:var(--color-bad-soft);color:var(--color-bad)}
[data-theme="light"] .pk-state--off,.pk-state--off[data-theme="light"]{background:var(--color-raised);color:var(--color-text-2)}
.pk-readout{${D};font-size:var(--text-timer);line-height:1;color:var(--color-cyan-text);text-shadow:var(--shadow-glow-timer)}
.pk-readout--num{font-size:var(--text-num);text-shadow:var(--shadow-glow-text)}
.pk-readout--wait{color:var(--color-warn);text-shadow:none}
.pk-readout--done{color:var(--color-ok);text-shadow:none}

/* ---------- 方块进度：亮着的格呼吸，正在走的那一格闪；等你时那一格变琥珀 ---------- */
.pk-blocks{display:grid;grid-template-columns:repeat(var(--pk-n,28),minmax(0,1fr));gap:3px}
.pk-blocks i{display:block;height:14px;background:var(--color-block-off)}
.pk-blocks i.is-on{background:var(--color-cyan-block);box-shadow:var(--shadow-glow-block);animation:pk-wave 2.4s ease-in-out infinite}
.pk-blocks i.is-head{background:var(--color-cyan-block);box-shadow:var(--shadow-glow-block);animation:pk-blink .8s steps(1) infinite}
.pk-blocks i.is-wait{background:var(--color-warn);box-shadow:none;animation:none}
.pk-blocks--still i.is-on{animation:none}
.pk-blocks--sm i{height:12px}

/* ---------- 等待：3×3 点阵转圈、光标、7×7 点阵勾 ---------- */
.pk-twinkle{display:inline-grid;grid-template-columns:repeat(3,3px);gap:1.5px;flex:none}
.pk-twinkle i{width:3px;height:3px;background:var(--color-cyan-block);box-shadow:var(--shadow-glow-dot);animation:pk-tw 1.2s steps(1) infinite}
.pk-twinkle i:nth-child(2){animation-delay:.3s}
.pk-twinkle i:nth-child(4){animation-delay:.6s}
.pk-twinkle i:nth-child(6){animation-delay:.15s}
.pk-twinkle i:nth-child(8){animation-delay:.45s}
.pk-twinkle i:nth-child(9){animation-delay:.9s}
.pk-caret{display:inline-block;width:8px;height:15px;margin-left:2px;vertical-align:middle;background:var(--color-cyan-block);box-shadow:var(--shadow-glow-dot);animation:pk-blink 1s steps(1) infinite}
.pk-dotcheck{display:inline-grid;grid-template-columns:repeat(7,4px);grid-auto-rows:4px;gap:1px;flex:none}
.pk-dotcheck i{width:4px;height:4px;background:var(--color-block-off)}
.pk-dotcheck i.is-on{background:var(--color-cyan-text);box-shadow:var(--shadow-glow-dot)}

/* ---------- 任务的步骤：前面一格是状态 ---------- */
.pk-step{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr);gap:12px;padding:3px 0}
.pk-step-node{position:relative;display:flex;align-items:center;justify-content:center;width:16px;height:16px;margin-top:1px}
.pk-step-head{display:flex;align-items:baseline;gap:10px}
.pk-step-name{font-family:var(--font-name);font-size:var(--text-name);font-weight:400;line-height:var(--leading-name);color:var(--color-text)}
.pk-step-time{margin-left:auto;${D};font-size:14px;color:var(--color-text-3)}
.pk-step-desc{font-size:12px;line-height:1.5;color:var(--color-text-2)}
.pk-step--ok .pk-step-node{color:var(--color-ok)}
.pk-step--run .pk-step-name{text-shadow:var(--shadow-glow-ink)}
.pk-step--run .pk-step-time{color:var(--color-cyan-text);text-shadow:var(--shadow-glow-dot)}
.pk-step--wait .pk-step-node{color:var(--color-warn);animation:pk-blink 1.6s steps(1) infinite}
.pk-step--wait .pk-step-name,.pk-step--wait .pk-step-time{color:var(--color-warn)}
.pk-step--todo,.pk-step--todo .pk-step-name{color:var(--color-text-3)}
.pk-step--todo .pk-step-node:before{content:"";width:10px;height:10px;box-shadow:inset 0 0 0 1.5px var(--color-line-strong)}
.pk-step--fail .pk-step-node,.pk-step--fail .pk-step-name,.pk-step--fail .pk-step-time{color:var(--color-bad)}
/* 在跑那一步：弹扣一下 + 一圈光 */
.pk-run{position:relative;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;flex:none}
.pk-run:before{content:"";width:10px;height:10px;background:var(--color-cyan-block);box-shadow:var(--shadow-glow-text);animation:pk-bounce 1.4s infinite}
.pk-run:after{content:"";position:absolute;left:3px;top:3px;width:10px;height:10px;box-shadow:inset 0 0 0 1.5px var(--color-cyan-block);opacity:0;animation:pk-ring 1.4s infinite}

/* ---------- 提示条（黑底一句话）和状态条（等你、通过、失败） ---------- */
.pk-toast{display:inline-flex;align-items:center;gap:8px;max-width:640px;padding:9px 14px;clip-path:var(--pk-clip2);background:var(--color-text);color:var(--color-page);font-size:12.5px;white-space:nowrap}
.pk-toast .pk-i{width:12px;height:12px}
.pk-bar{position:relative;isolation:isolate;display:flex;align-items:center;gap:10px;min-height:44px;padding:0 5px 0 14px;clip-path:var(--pk-clip2);background:var(--color-warn-line);font-size:12.5px;color:var(--color-text)}
.pk-bar:before{content:"";position:absolute;inset:1px;clip-path:var(--pk-clip2);background:var(--color-warn-soft);z-index:-1}
.pk-bar>.pk-i{color:var(--color-warn)}
.pk-bar--ok{background:var(--color-ok)}
.pk-bar--ok:before{background:var(--color-ok-soft)}
.pk-bar--ok>.pk-i{color:var(--color-ok)}
.pk-bar--bad{background:var(--color-bad-line)}
.pk-bar--bad:before{background:var(--color-bad-soft)}
.pk-bar--bad>.pk-i{color:var(--color-bad)}
.pk-bar-text{flex:1;min-width:0}

/* ---------- 停下来问你的卡片：模块（等你的边）+ 问题 + 选项 + 按钮 ---------- */
.pk-ask{position:relative}
.pk-ask-q{font-family:var(--font-name);font-size:var(--text-title);font-weight:400;line-height:var(--leading-title);color:var(--color-text);margin-bottom:4px}
.pk-ask-d{font-size:12.5px;line-height:1.6;color:var(--color-text-2);margin-bottom:10px}
.pk-ask-opts{display:flex;flex-direction:column;gap:2px}
.pk-ask-foot{display:flex;align-items:center;gap:8px;margin-top:12px}
.pk-ask-foot .pk-sp{flex:1}

/* ---------- 动效零件：一格 50ms，一步一格；光可以平滑 ---------- */
.pk-anim-reveal-s{animation:pk-reveal-y .2s steps(4,end) both}
.pk-anim-reveal{animation:pk-reveal-y .4s steps(8,end) both}
.pk-anim-dissolve{animation:pk-dissolve .4s steps(8,end) both}
.pk-anim-flash{animation:pk-flash .9s steps(1) 1}
.pk-scan{position:absolute;top:0;bottom:0;left:-80px;width:76px;pointer-events:none;background:linear-gradient(90deg,transparent,var(--color-cyan-scan) 78%,var(--color-cyan-block) 97%,transparent);animation:pk-sweep .9s both}
.pk-scan--loop{animation:pk-scanx 2.8s cubic-bezier(.45,0,.55,1) infinite}
.pk-card-edge{position:absolute;inset:0;pointer-events:none;z-index:2}
.pk-card-edge i{position:absolute;background:var(--color-warn)}
.pk-card-edge i:nth-child(1){left:0;top:0;width:100%;height:2px;transform-origin:left;animation:pk-ex .2s steps(4,end) both}
.pk-card-edge i:nth-child(2){right:0;top:0;width:2px;height:100%;transform-origin:top;animation:pk-ey .2s .2s steps(4,end) both}
.pk-card-edge i:nth-child(3){right:0;bottom:0;width:100%;height:2px;transform-origin:right;animation:pk-ex .2s .4s steps(4,end) both}
.pk-card-edge i:nth-child(4){left:0;bottom:0;width:2px;height:100%;transform-origin:bottom;animation:pk-ey .2s .6s steps(4,end) both}
@keyframes pk-blink{50%{opacity:0}}
@keyframes pk-tw{50%{opacity:.18}}
@keyframes pk-wave{0%,100%{filter:brightness(1)}50%{filter:brightness(.62)}}
@keyframes pk-bounce{0%{transform:scale(1)}18%{transform:scale(1.5);animation-timing-function:cubic-bezier(.3,1.6,.5,1)}40%{transform:scale(.9)}55%,100%{transform:scale(1)}}
@keyframes pk-ring{0%,10%{transform:scale(1);opacity:0}14%{opacity:.9}60%,100%{transform:scale(2.6);opacity:0}}
@keyframes pk-reveal-y{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes pk-dissolve{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(0 0 0 100%)}}
@keyframes pk-sweep{0%{left:-80px;opacity:1}99%{left:100%;opacity:1}100%{left:100%;opacity:0}}
@keyframes pk-scanx{0%{left:-90px}62%,100%{left:100%}}
@keyframes pk-flash{0%,100%{filter:none}15%,30%{filter:brightness(1.7)}45%,60%{filter:brightness(1.7)}}
@keyframes pk-ex{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes pk-ey{from{transform:scaleY(0)}to{transform:scaleY(1)}}
/* 减弱动态效果（和 .pk-still）：只留最后的样子；光标常亮，转圈停成满格，扫描不出现 */
@media (prefers-reduced-motion:reduce){
${STILL('')}
}
${STILL('.pk-still ')}
`;
}
function STILL(p) {
  return `${['.pk-caret', '.pk-twinkle i', '.pk-blocks i', '.pk-run:before', '.pk-step-node', '.pk-anim-reveal-s', '.pk-anim-reveal', '.pk-anim-flash', '.pk-card-edge i'].map((s) => p + s).join(',')}{animation:none!important}
${[p + '.pk-run:after', p + '.pk-scan'].join(',')}{display:none!important}
${p}.pk-anim-dissolve{animation:none!important;visibility:hidden}`;
}
