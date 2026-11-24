// 第 1 步 · 第二轮共用：方向 C 点阵终端 × 配色 P3 深海。颜色、像素小图标、像素阶梯角、控件样式。
// 站主 2026-11-09 定：方向 C、配色 P3、动效 M4 点阵为主（M3 的「在跑」、M1 的扫描做点缀）。
import { board, themeProp, C, SANS, MONO, DOTS } from '../s1/common.mjs';

export { board, themeProp, C, SANS, MONO, DOTS };
export const FLIP = !!process.env.FLIP;
export const CY = '#00E5FF';

// ---------- 颜色：P3 深海落在方向 C 上 ----------
// 三级字和浅色里的琥珀、绿按 4.5:1 调过（深色三级字 #7A84B6，浅色 #646C92 / #A35E00 / #12804C）。
export const P3 = {
  dk: {
    bg: '#050816', grid: 'rgba(120,140,255,.085)', pane: '#0A0F24', pane2: '#0F1630', raise: '#172040', line: '#1E2850', line2: '#2E3B72',
    tx: '#E8ECFF', tx2: '#9AA3CF', tx3: '#7A84B6',
    cy: CY, 'cy-tx': CY, 'on-cy': '#02101A', 'cy-line': 'rgba(0,229,255,.6)', 'cy-soft': 'rgba(0,229,255,.10)', 'cy-scan': 'rgba(0,229,255,.22)',
    muse: '#A78BFA', grok: '#FFB86B', api: '#60A5FA', ok: '#4ADE80', warn: '#FFB86B', bad: '#FB7185',
    'warn-soft': 'rgba(255,184,107,.10)', 'bad-soft': 'rgba(251,113,133,.10)', 'ok-soft': 'rgba(74,222,128,.10)',
    'warn-line': 'rgba(255,184,107,.55)', 'bad-line': 'rgba(251,113,133,.6)',
    glow: '0 0 10px rgba(0,229,255,.55)', tglow: '0 0 18px rgba(0,229,255,.5),0 0 2px rgba(0,229,255,.9)', dglow: '0 0 4px rgba(0,229,255,.85)',
    'blk-ln': 'transparent', off: '#141C3C',
  },
  lt: {
    bg: '#F2F4FC', grid: 'rgba(40,50,130,.10)', pane: '#FFFFFF', pane2: '#F5F7FD', raise: '#E7EBF8', line: '#DAE0F0', line2: '#B4BDDB',
    tx: '#0B1030', tx2: '#4E567A', tx3: '#646C92',
    cy: CY, 'cy-tx': '#0B1030', 'on-cy': '#0B1030', 'cy-line': '#0B1030', 'cy-soft': 'rgba(0,229,255,.16)', 'cy-scan': 'rgba(0,229,255,.38)',
    muse: '#6D4AE8', grok: '#A35E00', api: '#2563EB', ok: '#12804C', warn: '#A35E00', bad: '#E11D48',
    'warn-soft': '#FFF3E2', 'bad-soft': '#FFE9EE', 'ok-soft': '#E3F5EC',
    'warn-line': '#A35E00', 'bad-line': '#E11D48',
    glow: 'none', tglow: 'none', dglow: 'none',
    'blk-ln': '#0B1030', off: '#E1E6F5',
  },
};
export const vars = (m) => Object.entries(m).map(([k, v]) => `--${k}:${v}`).join(';');
export const themeCss = (root) => `.${root}.dk{${vars(P3.dk)};color-scheme:dark}\n.${root}.lt{${vars(P3.lt)};color-scheme:light}`;

// ---------- 像素阶梯角：两级台阶，每级 s 像素 ----------
export const stepClip = (s) => {
  const a = `${s}px`, b = `${2 * s}px`, ra = `calc(100% - ${s}px)`, rb = `calc(100% - ${2 * s}px)`;
  return `polygon(0 ${b},${a} ${b},${a} ${a},${b} ${a},${b} 0,${rb} 0,${rb} ${a},${ra} ${a},${ra} ${b},100% ${b},100% ${rb},${ra} ${rb},${ra} ${ra},${rb} ${ra},${rb} 100%,${b} 100%,${b} ${ra},${a} ${ra},${a} ${rb},0 ${rb})`;
};

// ---------- 像素小图标：8×8 格，按 2 像素一格画成 16px ----------
export const ICONS = {
  check: ['........', '.......#', '......##', '#....##.', '##..##..', '.####...', '..##....', '........'],
  x: ['#......#', '.#....#.', '..#..#..', '...##...', '...##...', '..#..#..', '.#....#.', '#......#'],
  play: ['.#......', '.##.....', '.###....', '.####...', '.####...', '.###....', '.##.....', '.#......'],
  ask: ['..####..', '.##..##.', '.....##.', '....##..', '...##...', '...##...', '........', '...##...'],
  bang: ['...##...', '...##...', '...##...', '...##...', '...##...', '........', '...##...', '...##...'],
  term: ['########', '#......#', '#.#....#', '#..#...#', '#.#..###', '#......#', '########', '........'],
  file: ['.####...', '.#..##..', '.#...##.', '.#....#.', '.#....#.', '.#....#.', '.######.', '........'],
  folder: ['###.....', '#.#####.', '#......#', '#......#', '#......#', '#......#', '########', '........'],
  shield: ['.######.', '.#....#.', '.#.##.#.', '.#.##.#.', '.#....#.', '..#..#..', '...##...', '........'],
  globe: ['..####..', '.#.##.#.', '#..##..#', '########', '#..##..#', '.#.##.#.', '..####..', '........'],
  trash: ['..####..', '########', '.#....#.', '.#.##.#.', '.#.##.#.', '.#.##.#.', '..####..', '........'],
  pen: ['......#.', '.....###', '....###.', '...###..', '..###...', '.###....', '.##.....', '#.......'],
  undo: ['..#.....', '.##.....', '#######.', '.##....#', '..#....#', '.......#', '...####.', '........'],
  bell: ['...##...', '..####..', '.######.', '.######.', '.######.', '########', '........', '...##...'],
  send: ['....#...', '....##..', '.######.', '.#######', '.######.', '....##..', '....#...', '........'],
  out: ['#.......', '.#......', '..#.....', '.#......', '#...####', '........', '........', '........'],
  clock: ['..####..', '.#....#.', '#..#...#', '#..#...#', '#..###.#', '#......#', '.#....#.', '..####..'],
  lock: ['..####..', '.#....#.', '.#....#.', '########', '###..###', '###..###', '########', '........'],
  plus: ['...##...', '...##...', '...##...', '########', '########', '...##...', '...##...', '...##...'],
};
export function px(name, cls = '') {
  const rows = ICONS[name];
  let r = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      if (row[x] !== '#') { x++; continue; }
      let e = x; while (e < row.length && row[e] === '#') e++;
      r += `<rect x="${x}" y="${y}" width="${e - x}" height="1"></rect>`;
      x = e;
    }
  });
  return `<svg class="px${cls ? ' ' + cls : ''}" viewBox="0 0 8 8" aria-hidden="true" shape-rendering="crispEdges">${r}</svg>`;
}

/** 3×3 点阵转圈（在跑）。 */
export const twinkle = (cls = '') => `<span class="tw${cls ? ' ' + cls : ''}"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>`;

/** n 格方块进度，前 f 格亮，第 f 格闪。 */
export const blocks = (n, f, cls = 'blocks') => `<div class="${cls}">${Array.from({ length: n }, (_, i) => `<i class="${i < f ? 'f' : i === f ? 'h' : ''}"${i < f ? ` style="animation-delay:${(i * 0.07).toFixed(2)}s"` : ''}></i>`).join('')}</div>`;

/** 点阵勾（7×7），dly 给逐颗点亮用。 */
export function dotCheck(cls = 'dck') {
  const pat = ['0000000', '0000001', '0000010', '1000100', '0101000', '0010000', '0000000'];
  let n = 0;
  return `<span class="${cls}">${pat.join('').split('').map((c) => (c === '1' ? `<i class="on" style="animation-delay:${(0.07 * n++).toFixed(2)}s"></i>` : '<i></i>')).join('')}</span>`;
}

// ---------- 共用样式（root 类名 .pk） ----------
export const KIT = `
.pk{position:relative;box-sizing:border-box;overflow:hidden;font-family:${SANS};font-size:14px;line-height:1.55;color:var(--tx);background:var(--bg);-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums;--clip:${stepClip(3)};--clip2:${stepClip(2)}}
.pk.dots{background-image:radial-gradient(circle at 1.5px 1.5px,var(--grid) 1.1px,transparent 1.6px);background-size:8px 8px}
.pk *{box-sizing:border-box}
:where(.pk) :where(p,h1,h2,ul,ol){margin:0;padding:0}
:where(.pk) :where(ul,ol){list-style:none}
:where(.pk) button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;padding:0;text-align:left}
:where(.pk) :where(i,em){font-style:normal}
.px{width:16px;height:16px;fill:currentColor;flex:none;display:block}
.px.s8{width:8px;height:8px}.px.s24{width:24px;height:24px}
/* 模块：外层是边线色，:before 是面板色，两层都切成像素阶梯角 */
.mod{position:relative;isolation:isolate;clip-path:var(--clip);background:var(--mline,var(--line));padding:14px 18px 16px;min-width:0}
.mod:before{content:"";position:absolute;inset:1px;clip-path:var(--clip);background:var(--mbg,var(--pane));z-index:-1}
.mod.run{--mline:var(--cy-line)}
.mod.wait{--mline:var(--warn-line)}
.ml{display:flex;align-items:center;gap:8px;font-family:${MONO};font-size:11.5px;letter-spacing:.04em;color:var(--tx3);margin-bottom:12px;white-space:nowrap}
.ml .l{color:var(--tx2)}
.ml .l:before{content:"[ ";color:var(--tx3)}.ml .l:after{content:" ]";color:var(--tx3)}
.ml .r{margin-left:auto}
.ml .n{font-family:${DOTS};font-weight:900;font-size:17px;line-height:1;color:var(--tx2)}
.dot{display:inline-block;width:7px;height:7px;flex:none}
.dot.muse{background:var(--muse)}.dot.grok{background:var(--grok)}.dot.api{background:var(--api)}
.who{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.who .arr{color:var(--tx3)}
/* 3×3 点阵转圈 */
.tw{display:inline-grid;grid-template-columns:repeat(3,3px);gap:1.5px;flex:none}
.tw i{width:3px;height:3px;background:var(--cy);box-shadow:var(--dglow);animation:tw 1.2s steps(1) infinite}
.tw i:nth-child(2){animation-delay:.3s}.tw i:nth-child(4){animation-delay:.6s}.tw i:nth-child(6){animation-delay:.15s}.tw i:nth-child(8){animation-delay:.45s}.tw i:nth-child(9){animation-delay:.9s}
.lt .tw i{box-shadow:inset 0 0 0 .5px var(--blk-ln)}
/* 按钮 */
.btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:34px;padding:0 14px;clip-path:var(--clip2);background:var(--line2);font-family:${MONO};font-size:12.5px;font-weight:500;white-space:nowrap;color:var(--tx)}
.btn:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.btn.pri{background:var(--cy);color:var(--on-cy);font-weight:600}
.btn.pri:before{display:none}
.lt .btn.pri{background:var(--blk-ln)}
.lt .btn.pri:before{display:block;background:var(--cy)}
.btn.danger{background:var(--bad-line);color:var(--bad)}
.btn.warn{background:var(--warn);color:var(--on-cy);font-weight:600}.btn.warn:before{display:none}
.btn.ghost{background:transparent;color:var(--tx2)}.btn.ghost:before{display:none}
.btn .k{font-size:11px;opacity:.7}
/* 开关、分段、标签 */
.tg{display:flex;align-items:center;gap:10px;font-size:13px}
.tgt{position:relative;width:34px;height:18px;flex:none;clip-path:var(--clip2);background:var(--cy)}
.tgt i{position:absolute;top:3px;left:19px;width:12px;height:12px;background:var(--on-cy)}
.lt .tgt{box-shadow:inset 0 0 0 1px var(--blk-ln)}
.seg{display:inline-flex;gap:3px;padding:3px;clip-path:var(--clip2);background:var(--line2);position:relative;isolation:isolate}
.seg:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.seg button{height:28px;padding:0 12px;font-family:${MONO};font-size:12px;color:var(--tx2);display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
.seg button.on{background:var(--cy);color:var(--on-cy);font-weight:600}
.seg.full{display:flex;width:100%}.seg.full button{flex:1 1 0}
.seg.ink button.on{background:var(--tx);color:var(--bg)}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;clip-path:var(--clip2);background:var(--line2);font-family:${MONO};font-size:12px;color:var(--tx2);white-space:nowrap}
.chip:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.chip.on{background:var(--cy);color:var(--tx)}
.lt .chip.on{background:var(--blk-ln)}
.tag{display:inline-block;font-family:${MONO};font-size:10.5px;line-height:17px;padding:0 5px;white-space:nowrap}
.tag.new{background:var(--ok);color:var(--bg)}.tag.del{background:var(--bad);color:var(--bg)}
.tag.rec{background:var(--cy);color:var(--on-cy);font-weight:600}
.tag.mid{background:var(--warn-soft);color:var(--warn);box-shadow:inset 0 0 0 1px var(--warn-line)}
.tag.hi{background:var(--bad);color:var(--bg);font-weight:600}
.tag.lo{background:var(--raise);color:var(--tx2)}
.field{display:flex;align-items:center;height:38px;padding:0 12px;clip-path:var(--clip2);background:var(--cy);position:relative;isolation:isolate;font-family:${MONO};font-size:13px;color:var(--tx)}
.field:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane2);z-index:-1}
.lt .field{background:var(--blk-ln)}
.field .pr{color:var(--cy-tx);margin-right:8px}
.caret{display:inline-block;width:8px;height:15px;background:var(--cy);margin-left:2px;animation:blink 1.05s steps(1) infinite}
.lt .caret{box-shadow:inset 0 0 0 1px var(--blk-ln)}
.kbd{font-family:${MONO};font-size:11.5px;color:var(--tx3)}
/* 方块进度 */
.blocks{display:grid;grid-template-columns:repeat(28,minmax(0,1fr));gap:3px}
.blocks i{display:block;height:14px;background:var(--off)}
.blocks i.f{background:var(--cy);box-shadow:inset 0 0 0 1px var(--blk-ln);animation:wave 2.4s ease-in-out infinite}
.blocks i.h{background:var(--cy);box-shadow:inset 0 0 0 1px var(--blk-ln);animation:blink .8s steps(1) infinite}
.dk .blocks i.f,.dk .blocks i.h{box-shadow:0 0 6px rgba(0,229,255,.45)}
.meter{display:grid;grid-template-columns:repeat(20,minmax(0,1fr));gap:3px}
.meter i{height:10px;background:var(--off)}
.meter i.f{background:var(--cy);box-shadow:inset 0 0 0 1px var(--blk-ln)}
/* 点阵勾 */
.dck{display:inline-grid;grid-template-columns:repeat(7,4px);grid-auto-rows:4px;gap:1px;flex:none}
.dck i{width:4px;height:4px;background:var(--off)}
.dck i.on{background:var(--cy);box-shadow:var(--dglow)}
.lt .dck i.on{background:var(--tx)}
@keyframes blink{50%{opacity:0}}
@keyframes tw{50%{opacity:.18}}
@keyframes wave{0%,100%{filter:brightness(1)}50%{filter:brightness(.62)}}
@keyframes bounce{0%{transform:scale(1)}18%{transform:scale(1.5);animation-timing-function:cubic-bezier(.3,1.6,.5,1)}40%{transform:scale(.9)}55%,100%{transform:scale(1)}}
@keyframes ring{0%,10%{transform:scale(1);opacity:0}14%{opacity:.9}60%,100%{transform:scale(2.6);opacity:0}}
@keyframes scanx{0%{left:-90px}62%,100%{left:100%}}
@media (prefers-reduced-motion:reduce){.pk *,.pk *:before,.pk *:after{animation:none!important;transition:none!important}.pk .scan-fx{display:none}}
`;
