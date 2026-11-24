// 手作零件：手画的框、线、荧光笔、划掉、胶带、缝线。都返回 HTML / SVG 字符串，颜色默认走 CSS 变量。
// 数值的默认值是 Pomelo 验收过的样子，正式用的时候由调用方按 tokens/handmade.json 传。
import { P, rrect, handStroke, handFill, f, rng } from './line.mjs';

// 两种胶带的条纹色（CSS 变量），调用方也可以传具体颜色
const TAPE_VARS = [['var(--tape-a0)', 'var(--tape-b0)'], ['var(--tape-a1)', 'var(--tape-b1)']];

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
export function tape({ x, y, w = 88, h = 22, rot = -4, kind = 0, z = 4, cls = '', colors = TAPE_VARS }) {
  const [a, b] = colors[kind];
  return `<div class="tp ${cls}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:repeating-linear-gradient(45deg,${a} 0 7px,${b} 7px 14px);opacity:.88;clip-path:${ZIG};transform:rotate(${rot}deg);z-index:${z};pointer-events:none"></div>`;
}
// 每张卡片随机一到两条胶带（种子固定，两次生成一样）
export function tapes(w, h, seed, n = 'rand', colors = TAPE_VARS) {
  const r0 = rng(seed * 17 + 3);
  const nT = n === 'rand' ? (r0() < 0.5 ? 1 : 2) : n;
  const second = [{ x: w - 64, y: h - 14, w: 76, rot: 32 }, { x: -18, y: 4, w: 70, rot: -38 }, { x: w - 54, y: -4, w: 72, rot: 36 }][Math.floor(r0() * 3)];
  const first = { x: Math.round(w / 2 - 44 + (r0() - 0.5) * 40), y: -11, rot: -4 + Math.round((r0() - 0.5) * 6) };
  return [tape({ ...first, colors }), tape({ ...second, kind: 1, colors })].slice(0, nT).join('');
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

// 胶带的 SVG 版：单独出图时用（HTML 里用上面的 tape）
export function tapeSvg(x, y, w, h, rot, [a, b], { id = 'tp', stripe = 7, opacity = 0.88, teeth = 5, depth = 5 } = {}) {
  const pts = [];
  const right = [];
  for (let i = 0; i <= teeth * 2; i++) {
    const py = (i / (teeth * 2)) * h;
    const d = i % 2 ? (depth / 100) * w : 0;
    pts.push(`${f(d)},${f(py)}`);
    right.unshift(`${f(w - d)},${f(py)}`);
  }
  return `<defs><pattern id="${id}" width="${stripe * 2}" height="${stripe * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${stripe * 2}" height="${stripe * 2}" fill="${a}"></rect><rect width="${stripe}" height="${stripe * 2}" fill="${b}"></rect></pattern></defs><polygon points="${[...pts, ...right].join(' ')}" fill="url(#${id})" opacity="${opacity}" transform="translate(${x} ${y}) rotate(${rot} ${f(w / 2)} ${f(h / 2)})"></polygon>`;
}
