// VL2 · Phase 2 第一轮：两套小样共用的零件。只用于探索，不是方案的源文件。
// 颜色全部走 CSS 变量：.p-<配色>.lt / .dk 两组，切换配色只换根元素的 class。
import { P, rrect, circle, ellipse, handStroke, handFill, f, mix, rng, cmdsToD } from './lib.mjs';

// ---------- 配色（Phase 1 第二轮选定的 5 套，数值照抄） ----------
export const CATS = { mint: '#3DBE8B', sky: '#4AA8E8', pink: '#F78FB3', orange: '#FF9A3C', grape: '#9B87F5' };
const ART_L = { ink: '#20241F', white: '#FFFFFF', shadow: 'rgba(38,52,28,.30)' };
const ART_D = { ink: '#20241F', white: '#F1F4EC', shadow: 'rgba(0,0,0,.55)' };
const LT = (o) => ({ card: '#FFFFFF', danger: '#C8322A', dangerT: '#FFFFFF', marker: '#FFD23F', up: '#1D7A4F', grid: 'transparent', art: ART_L, ...o });
const DK = (o) => ({ danger: '#FF6B5E', dangerT: '#1A0C0A', up: '#6FD6A0', grid: 'transparent', art: ART_D, ...o });
const bold = (color, inkC, selL, selD, paperD, desk2L, desk2D) => ({
  lt: LT({ desk: color, desk2: desk2L, paper: '#FFFFFF', line: '#D9DCD0', ink: inkC, ink2: '#4D5547', pri: inkC, priT: color, sel: selL, link: inkC, danger: '#E0362B', top: inkC, topT: '#FFFFFF', cur: color, curT: inkC, pen: inkC }),
  dk: DK({ desk: inkC, desk2: desk2D, paper: paperD, card: paperD, line: '#5A6355', ink: '#F2F5EC', ink2: '#B5BDAA', pri: color, priT: inkC, sel: selD, marker: '#8C7418', link: color, top: color, topT: inkC, cur: inkC, curT: color, pen: '#D7DECB' }),
});
export const PALS = {
  blue: {
    name: '蓝笔 · 方格纸',
    lt: LT({ desk: '#ECEDE5', desk2: '#E2E4D9', paper: '#FBFBF5', grid: '#E2E8F5', line: '#DCDDD2', ink: '#1F2328', ink2: '#5D626A', pri: '#2B4BC0', priT: '#FFFFFF', sel: '#E1E7FF', link: '#2B4BC0', top: '#ECEDE5', topT: '#1F2328', cur: '#FBFBF5', curT: '#1F2328', pen: '#2340A8', art: { ...ART_L, ink: '#2340A8' } }),
    dk: DK({ desk: '#13151B', desk2: '#0E1015', paper: '#1A1D24', grid: '#222632', card: '#232731', line: '#3A404D', ink: '#ECEEF3', ink2: '#A1A7B4', pri: '#93A9FF', priT: '#121630', sel: '#28315C', marker: '#8C7418', link: '#A6B8FF', top: '#13151B', topT: '#ECEEF3', cur: '#1A1D24', curT: '#ECEEF3', pen: '#93A9FF', art: { ...ART_D, ink: '#2340A8', white: '#F1F3F8' } }),
  },
  purple: {
    name: '紫笔 · 樱粉荧光',
    lt: LT({ desk: '#F1EAF0', desk2: '#E8DEE6', paper: '#FFFBFC', line: '#E6DCE4', ink: '#26202B', ink2: '#655C6B', pri: '#5B3FC4', priT: '#FFFFFF', sel: '#FFE1EC', marker: '#FF9EC0', link: '#5B3FC4', top: '#F1EAF0', topT: '#26202B', cur: '#FFFBFC', curT: '#26202B', pen: '#4A32A6', art: { ...ART_L, ink: '#4A32A6' } }),
    dk: DK({ desk: '#16121A', desk2: '#100D13', paper: '#1E1823', card: '#28202E', line: '#43384B', ink: '#F2ECF5', ink2: '#B1A6B8', pri: '#B8A6FF', priT: '#1B1238', sel: '#4A2238', marker: '#8E3A5E', link: '#C4B5FF', top: '#16121A', topT: '#F2ECF5', cur: '#1E1823', curT: '#F2ECF5', pen: '#B8A6FF', art: { ...ART_D, ink: '#4A32A6', white: '#F5F1F7' } }),
  },
  kraft: {
    name: '黑笔 · 牛皮纸',
    lt: LT({ desk: '#D9C4A1', desk2: '#CDB690', paper: '#FFFDF7', line: '#E4DAC8', ink: '#1F1D1A', ink2: '#5F584E', pri: '#1F1D1A', priT: '#FFFFFF', sel: '#FFF0A0', link: '#1F1D1A', top: '#D9C4A1', topT: '#1F1D1A', cur: '#FFFDF7', curT: '#1F1D1A', pen: '#1F1D1A', art: { ...ART_L, ink: '#1F1D1A' } }),
    dk: DK({ desk: '#3A3024', desk2: '#30271C', paper: '#1E1B17', card: '#29251F', line: '#463E33', ink: '#F3EEE5', ink2: '#B6AC9E', pri: '#FFD23F', priT: '#1F1D1A', sel: '#4A4019', marker: '#8C7418', link: '#FFD23F', top: '#3A3024', topT: '#F3EEE5', cur: '#1E1B17', curT: '#F3EEE5', pen: '#D9CFBF' }),
  },
  yellow: { name: '柚黄桌面', ...bold('#FFD23F', '#20241F', '#FFEE9E', '#5A4D12', '#2A3127', '#F5C629', '#181C16') },
  mint: { name: '薄荷桌面', ...bold('#6FD3A8', '#1E2A24', '#D3F5E5', '#1F4A37', '#25332C', '#62C79B', '#16201B') },
};
export const PAL_ORDER = ['blue', 'purple', 'kraft', 'yellow', 'mint'];

export function paletteCSS() {
  const out = [];
  for (const key of PAL_ORDER) {
    for (const mode of ['lt', 'dk']) {
      const c = PALS[key][mode];
      const v = {
        desk: c.desk, desk2: c.desk2, paper: c.paper, grid: c.grid, card: c.card, line: c.line, ink: c.ink, ink2: c.ink2,
        pri: c.pri, 'pri-t': c.priT, sel: c.sel, marker: c.marker, link: c.link, danger: c.danger, 'danger-t': c.dangerT,
        top: c.top, 'top-t': c.topT, cur: c.cur, 'cur-t': c.curT, pen: c.pen, up: c.up,
        'a-ink': c.art.ink, 'a-white': c.art.white, 'a-shadow': c.art.shadow,
        shadow: mode === 'lt' ? 'rgba(38,52,28,.16)' : 'rgba(0,0,0,.5)',
        'tex-o': mode === 'lt' ? '.38' : '.22',
      };
      for (const [k, hex] of Object.entries(CATS)) {
        v[`c-${k}`] = hex;
        v[`c-${k}-l`] = mix(hex, c.card.length === 7 ? c.card : '#ffffff', mode === 'lt' ? 0.78 : 0.62);
        v[`c-${k}-t`] = mix(hex, c.paper, mode === 'lt' ? 0.86 : 0.74);
        v[`c-${k}-s`] = mix(hex, '#ffffff', 0.7);
      }
      out.push(`.bd.p-${key}.${mode}{${Object.entries(v).map(([k, x]) => `--${k}:${x}`).join(';')}}`);
    }
  }
  return out.join('\n');
}

// 给 art.mjs 用的颜色表：全是变量
export const V = {
  ink: 'var(--a-ink)', white: 'var(--a-white)', shadow: 'var(--a-shadow)',
  yellow: '#FFD23F', heart: '#FF7A6B', blush: '#FFA3B8', leaf: '#44B56E', wood: '#F1C48C',
  cats: Object.fromEntries(Object.keys(CATS).map((k) => [k, `var(--c-${k})`])),
  catLight: (k) => mix(CATS[k], '#ffffff', 0.72),
};

// ---------- 小工具 ----------
let SEQ = 1;
export const uid = (p) => `${p}${SEQ++}`;
export const resetUid = () => { SEQ = 1; };
// 估计手札体文字宽度：中文 1em，数字 0.605em，其余 0.5em
export function tw(s, px) {
  let w = 0;
  for (const ch of s) w += /[　-鿿＀-￯]/.test(ch) ? 1 : /[0-9]/.test(ch) ? 0.605 : /[·]/.test(ch) ? 0.6 : 0.52;
  return Math.ceil(w * px);
}
export const money = (n, sign = true) => {
  const s = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (sign ? (n < 0 ? '−' : '+') : '') + s;
};

// 手画的圆角框：返回一个绝对定位的 SVG，铺在父元素上（父元素要 position:relative）
export function wob(w, h, { r = 14, amp = 0.9, sw = 1.8, color = 'var(--pen)', seed = 1, fill = null, dx = 0, dy = 0, pad = 8, stroke = true, cls = '', open = null } = {}) {
  const shape = rrect(pad, pad, w, h, r);
  const per = 2 * (w + h);
  const sp = 3, keep = per > 2400 ? 3 : 2;
  const fillPath = fill ? `<path d="${handFill(shape, { amp: amp * 0.8, seed, sp, keep: keep + 1, prec: 0 })}" fill="${fill}" transform="translate(${dx} ${dy})"></path>` : '';
  let strokePath = '';
  if (stroke) {
    const shp = open === 'left' ? P(`M${pad + r} ${pad} L${pad + w - r} ${pad} Q${pad + w} ${pad} ${pad + w} ${pad + r} L${pad + w} ${pad + h - r} Q${pad + w} ${pad + h} ${pad + w - r} ${pad + h} L${pad + r} ${pad + h}`) : shape;
    strokePath = `<path d="${handStroke(shp, { amp, wave: 26, seed, sp, keep, over: 0.03, drift: 1.2, prec: w > 60 && h > 30 ? 0 : 1 })}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"></path>`;
  }
  return `<svg class="wob ${cls}" width="${w + pad * 2 + Math.abs(dx)}" height="${h + pad * 2 + Math.abs(dy)}" style="position:absolute;left:-${pad}px;top:-${pad}px;pointer-events:none;overflow:visible" aria-hidden="true">${fillPath}${strokePath}</svg>`;
}

// 一条手画的线（横线、下划线、分割线）
export function hline(w, { seed = 1, sw = 1.6, color = 'var(--pen)', amp = 0.8, y = 4, cls = '', style = '' } = {}) {
  const d = handStroke(P(`M2 ${y} C${w * 0.33} ${y - 1.2} ${w * 0.66} ${y + 1.2} ${w - 2} ${y}`), { amp, wave: 22, seed, sp: 2, keep: 3, prec: w > 200 ? 0 : 1 });
  return `<svg class="${cls}" width="${w}" height="${y * 2}" style="display:block;overflow:visible;${style}" aria-hidden="true"><path pathLength="1" d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"></path></svg>`;
}
export function vline(h, { seed = 1, sw = 1.4, color = 'var(--line)', amp = 0.8, cls = '', style = '' } = {}) {
  const d = handStroke(P(`M4 2 C3 ${h * 0.33} 5 ${h * 0.66} 4 ${h - 2}`), { amp, wave: 26, seed, sp: 3, keep: 3, prec: 0 });
  return `<svg class="${cls}" width="8" height="${h}" style="display:block;overflow:visible;${style}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"></path></svg>`;
}

// 荧光笔划过（放在文字下面）
export function marker(w, { seed = 5, sw = 12, color = 'var(--marker)', cls = '', top = '55%', opacity = 0.9 } = {}) {
  const d = handStroke(P(`M4 12 C${w * 0.33} 10 ${w * 0.66} 14 ${w - 4} 11`), { amp: 1.2, wave: 20, seed, sp: 2, keep: 3 });
  return `<svg class="mk ${cls}" width="${w}" height="24" style="position:absolute;left:-4px;top:${top};margin-top:-12px;z-index:-1;overflow:visible;pointer-events:none" aria-hidden="true"><path pathLength="1" d="${d}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none" opacity="${opacity}"></path></svg>`;
}
// 划掉
export function strike(w, { seed = 9, sw = 2, color = 'var(--ink2)', cls = '' } = {}) {
  const d = handStroke(P(`M0 6 C${w * 0.3} 4 ${w * 0.7} 8 ${w} 5`), { amp: 0.8, wave: 14, seed, sp: 1.5, keep: 3 });
  return `<svg class="sk ${cls}" width="${w + 8}" height="12" style="position:absolute;left:-4px;top:50%;margin-top:-6px;overflow:visible;pointer-events:none" aria-hidden="true"><path pathLength="1" d="${d}" transform="translate(4 0)" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none"></path></svg>`;
}

// 胶带：两种（薄荷条纹、柚黄条纹），锯齿边
function zig(n = 5, d = 5) {
  const L1 = [], R1 = [];
  for (let i = 0; i <= n * 2; i++) {
    const y = (i / (n * 2)) * 100;
    L1.push(`${i % 2 ? d : 0}% ${f(y)}%`);
    R1.unshift(`${i % 2 ? 100 - d : 100}% ${f(y)}%`);
  }
  return `polygon(${[...L1, ...R1].join(',')})`;
}
const ZIG = zig();
export function tape({ x, y, w = 88, h = 22, rot = -4, kind = 0, z = 4, cls = '' }) {
  const [a, b] = kind ? ['#FFE38A', '#FFD23F'] : ['#C4EDD9', '#A6E3C6'];
  return `<div class="tp ${cls}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:repeating-linear-gradient(45deg,${a} 0 7px,${b} 7px 14px);opacity:.88;clip-path:${ZIG};transform:rotate(${rot}deg);z-index:${z};pointer-events:none"></div>`;
}
// 每张卡片随机一到两条胶带（种子固定，两次生成一样）
export function tapes(w, h, seed, n = 'rand') {
  const r0 = rng(seed * 17 + 3);
  const nT = n === 'rand' ? (r0() < 0.5 ? 1 : 2) : n;
  const second = [{ x: w - 64, y: h - 14, w: 76, rot: 32 }, { x: -18, y: 4, w: 70, rot: -38 }, { x: w - 54, y: -4, w: 72, rot: 36 }][Math.floor(r0() * 3)];
  const first = { x: Math.round(w / 2 - 44 + (r0() - 0.5) * 40), y: -11, rot: -4 + Math.round((r0() - 0.5) * 6) };
  return [tape(first), tape({ ...second, kind: 1 })].slice(0, nT).join('');
}

// 缝线：纸左边一列手缝的短线
export function stitches(h, { x = 9, gap = 20, len = 9, seed = 3, color = 'var(--pen)', opacity = 0.55 } = {}) {
  const r = rng(seed);
  let d = '';
  for (let y = 16; y < h - 16; y += gap) {
    const tilt = (r() - 0.5) * 2.4;
    d += handStroke(P(`M${x - tilt / 2} ${y} L${x + tilt / 2} ${y + len}`), { amp: 0.35, wave: 6, seed: y, sp: 1, keep: 2 });
  }
  return `<svg width="${x * 2}" height="${h}" style="position:absolute;left:0;top:0;pointer-events:none;opacity:${opacity}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"></path></svg>`;
}

// 纸纹：一个滤镜定义，多处引用
export const texDefs = (id = 'tx') => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="3" result="n"></feTurbulence><feColorMatrix in="n" type="matrix" values="0 0 0 0 .32  0 0 0 0 .36  0 0 0 0 .26  1.6 0 0 0 -.62"></feColorMatrix></filter></svg>`;
export const tex = (id = 'tx', o = 'var(--tex-o)') => `<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;border-radius:inherit" aria-hidden="true"><rect width="100%" height="100%" filter="url(#${id})" style="opacity:${o}"></rect></svg>`;

// ---------- 界面小图标（24 格，手画，跟着文字颜色） ----------
const G = {
  back: 'M15 5 L8 12 L15 19',
  fwd: 'M9 5 L16 12 L9 19',
  plus: 'M12 5 L12 19 M5 12 L19 12',
  x: 'M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5',
  search: 'M16 16 L20.5 20.5',
  gear: '',
  home: 'M4 11.5 L12 4.5 L20 11.5 M6.5 9.5 L6.5 19.5 L17.5 19.5 L17.5 9.5 M10 19.5 L10 14.5 L14 14.5 L14 19.5',
  grid: '',
  up: 'M12 19 L12 5.5 M6.5 11 L12 5.5 L17.5 11',
  down: 'M7 10 L12 15 L17 10',
  pin: 'M9 4.5 L15 4.5 M10 4.5 L10 10 L7 14 L17 14 L14 10 L14 4.5 M12 14 L12 20',
  back2: 'M9.5 6 L4.5 11 L9.5 16 M4.5 11 L14.5 11 C18 11 20 13 20 16 L20 19',
  flip: 'M5 9 C6 5.5 9 4 12 4 C16.5 4 19.5 7.5 19.5 11 M19.5 11 L21.5 8.5 M19.5 11 L17 9.5 M19 15 C18 18.5 15 20 12 20 C7.5 20 4.5 16.5 4.5 13 M4.5 13 L2.5 15.5 M4.5 13 L7 14.5',
  trash: 'M5 7 L19 7 M9.5 7 L9.5 4.5 L14.5 4.5 L14.5 7 M7 7 L8 20 L16 20 L17 7',
  cal: 'M8 3.5 L8 7 M16 3.5 L16 7 M4.5 10 L19.5 10',
  sparkle: 'M12 4 Q12 12 20 12 Q12 12 12 20 Q12 12 4 12 Q12 12 12 4 Z',
  pen: 'M5 19 L6 15 L16 5 L19 8 L9 18 Z M14 7 L17 10',
  check: 'M5.5 12.5 L10 17 L18.5 7',
  more: '',
  play: 'M8.5 5.5 L18.5 12 L8.5 18.5 Z',
  pause: 'M9 5.5 L9 18.5 M15 5.5 L15 18.5',
  note: 'M9.2 17.5 L9.2 6.5 L19.2 4.5 L19.2 15.5',
  noteoff: 'M9.2 17.5 L9.2 6.5 L19.2 4.5 L19.2 15.5 M4 4 L20 20',
};
function glyphPath(name) {
  const sw = { amp: 0.32, wave: 7, sp: 0.6, keep: 2 };
  let cmds = G[name] ? P(G[name]) : [];
  let d = cmds.length ? handStroke(cmds, { ...sw, seed: name.length * 7 }) : '';
  if (name === 'search') d += handStroke(circle(10.5, 10.5, 6), { ...sw, seed: 3, over: 0.05 });
  if (name === 'gear') {
    d += handStroke(circle(12, 12, 3), { ...sw, seed: 4, over: 0.05 });
    d += handStroke(circle(12, 12, 6.6), { ...sw, seed: 5, over: 0.05 });
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      d += handStroke(P(`M${f(12 + 7 * Math.cos(a))} ${f(12 + 7 * Math.sin(a))} L${f(12 + 9.6 * Math.cos(a))} ${f(12 + 9.6 * Math.sin(a))}`), { ...sw, seed: 10 + i });
    }
  }
  if (name === 'grid') for (const [x, y] of [[4, 4], [13, 4], [4, 13], [13, 13]]) d += handStroke(rrect(x, y, 7, 7, 2), { ...sw, seed: x + y, over: 0.05 });
  if (name === 'cal') d += handStroke(rrect(4.5, 5.5, 15, 14.5, 3), { ...sw, seed: 6, over: 0.05 });
  if (name === 'note' || name === 'noteoff') d += handStroke(circle(7, 17.6, 2.3), { ...sw, seed: 21, over: 0.05 }) + handStroke(circle(17, 15.6, 2.3), { ...sw, seed: 22, over: 0.05 });
  return d;
}
const DOTS = (name) => (name === 'more' ? [6, 12, 18].map((x) => handFill(circle(x, 12, 1.7), { amp: 0.1, seed: x })).join('') : '');
export function glyphDefs() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Object.keys(G).map((n) => `<symbol id="g-${n}" viewBox="0 0 24 24"><path d="${glyphPath(n)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>${DOTS(n) ? `<path d="${DOTS(n)}" fill="currentColor"></path>` : ''}</symbol>`).join('')}</defs></svg>`;
}
export const glyph = (name, size = 18, style = '') => `<svg class="gl" width="${size}" height="${size}" style="flex:none;${style}" aria-hidden="true"><use href="#g-${name}"></use></svg>`;
// 模块图标（贴纸）：引用 art.mjs 生成的 <symbol>
export const icon = (id, size = 24, style = '') => `<svg class="ic" width="${size}" height="${size}" style="flex:none;overflow:visible;${style}" aria-hidden="true"><use href="#ic-${id}"></use></svg>`;

// 勾选框：线描贴纸，勾上时果冻弹（.on 由状态决定）
const TICK = P('M6.4 12.6 L10.4 16.6 L17.6 7.4');
export function checkbox(seed = 1, size = 22) {
  const box = rrect(4, 4, 16, 16, 4.5);
  return `<svg class="ckb" width="${size}" height="${size}" viewBox="0 0 24 24" style="overflow:visible;flex:none" aria-hidden="true"><g class="box"><path d="${handFill(box, { amp: 0.3, seed })}" fill="var(--a-white)" stroke="var(--a-white)" stroke-width="3"></path><g class="fillg"><path d="${handFill(box, { amp: 0.3, seed: seed + 3 })}" fill="#FFD23F" transform="translate(.8 1.1)"></path></g><path d="${handStroke(box, { amp: 0.38, seed, wave: 7 })}" fill="none" stroke="var(--pen)" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"></path><path class="tick" pathLength="1" d="${handStroke(TICK, { amp: 0.3, seed: seed + 1 })}" stroke="var(--a-ink)" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></g></svg>`;
}

// 歪的只是纸：底色、手画的边、胶带放进这一层一起转；字放在外面，永远是正的（歪着的字在缩放时会糊）
export const tiltLayer = (deg, inner, { cls = '' } = {}) => `<div class="tl ${cls}" style="position:absolute;inset:0;transform:rotate(${typeof deg === 'number' ? deg + 'deg' : deg});pointer-events:none">${inner}</div>`;

// 小圆角标签（分类）：分类色浅底 + 圆点
export const chip = (label, cat, { px = 13, cls = '' } = {}) => `<span class="chip ${cls}" style="display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:8px;background:var(--c-${cat}-l);color:var(--ink);font-size:${px}px;white-space:nowrap"><i style="width:7px;height:7px;border-radius:50%;background:var(--c-${cat});display:block"></i>${label}</span>`;

// 按钮：手画边框 + 按下去果冻
export function btn(label, { w = null, h = 34, kind = 'pri', seed = 7, px = 15, onClick = '', icon: ic = '', cls = '', aria = '' } = {}) {
  const W = w ?? tw(label, px) + 30 + (ic ? 22 : 0);
  const bg = kind === 'pri' ? 'var(--pri)' : kind === 'danger' ? 'transparent' : 'var(--card)';
  const fg = kind === 'pri' ? 'var(--pri-t)' : kind === 'danger' ? 'var(--danger)' : 'var(--ink)';
  return `<button type="button" class="btn press ${cls}"${onClick ? ` onClick="{{${onClick}}}"` : ''}${aria ? ` aria-label="${aria}"` : ''} style="position:relative;width:${W}px;height:${h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;color:${fg};font-size:${px}px;flex:none">${kind === 'danger' ? '' : wob(W, h, { r: 9, amp: 0.55, sw: 1.6, seed, fill: bg, pad: 4, color: kind === 'pri' ? 'var(--pen)' : 'var(--pen)' })}<span style="position:relative;display:inline-flex;align-items:center;gap:6px">${ic}${label}</span></button>`;
}
