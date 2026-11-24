// 「笔势与纸片」的 SVG 写法。
//
// 源文件（marks/graphic/*.svg）：不写死颜色。每个面带一个角色 class 和一个 CSS 变量填充：
//   笔势 va-ink → var(--va-ink)，第一层纸 va-paper → var(--va-paper)，第二层纸 va-paper-2 → var(--va-paper-2)
// 变量的取值由 marks/graphic/graphic.css 按明暗与所在底色给出；没有设变量时退回 currentColor（成为单色剪影）。
// 上好色的版本（themed）由构建时把变量换成具体色值得到，见 themedSvg()。
//
// 动效片段（motion/*/…fragment.html）：同一份几何，笔势套上遮罩，遮罩里沿中心线的描边负责「写出」。
import { num } from './geometry.mjs';

const ROLE = { 1: 'paper', 2: 'paper-2' };
const fillOf = (role) => `var(--va-${role}, currentColor)`;

/** 静态源 SVG。paperFallback：纸片没设变量时的填充，默认 currentColor（单色剪影），内容图标用 none（只剩笔势）。 */
export function staticSvg(els, [w, h], { paperFallback = 'currentColor' } = {}) {
  const body = els.map((e) => {
    if (e.k === 'paper') return `  <path class="va-${ROLE[e.layer]}" d="${e.d}" fill="var(--va-${ROLE[e.layer]}, ${paperFallback})"/>`;
    if (e.k === 'stroke') return `  <path class="va-ink" d="${e.d}" fill="${fillOf('ink')}"/>`;
    return null; // 朱红点只在动效里出现
  }).filter(Boolean).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true">\n${body}\n</svg>\n`;
}

/**
 * 动效用的内联 SVG。idPrefix 让同页多个实例的遮罩 id 各不相同。
 * 纸片带 --i（顺序）与 --dx/--dy（入场错位），遮罩描边带 --i。
 */
export function inlineSvg(els, [w, h], { idPrefix, className = 'va-graphic' }) {
  let n = 0;
  const defs = [], body = [];
  for (const e of els) {
    if (e.k === 'paper') {
      body.push(`<path class="va-${ROLE[e.layer]}" d="${e.d}" fill="${fillOf(ROLE[e.layer])}" style="--i:${e.i};--dx:${e.dx}px;--dy:${e.dy}px"/>`);
    } else if (e.k === 'stroke') {
      const id = `${idPrefix}-m${n++}`;
      defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><path class="va-mk" d="${e.c}" pathLength="1" fill="none" stroke="white" stroke-width="${num(e.w)}" stroke-linecap="round" stroke-linejoin="round" style="--i:${e.i}"/></mask>`);
      body.push(`<path class="va-ink" d="${e.d}" fill="${fillOf('ink')}" mask="url(#${id})"/>`);
    } else if (e.k === 'ember') {
      body.push(`<circle class="va-ember" cx="${num(e.cx)}" cy="${num(e.cy)}" r="${num(e.r)}" fill="${fillOf('ember')}"/>`);
    }
  }
  return `<svg class="${className}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false"><defs>${defs.join('')}</defs>${body.join('')}</svg>`;
}

/**
 * 角色 → 具体色值。规则（DESIGN.md §4「纸片」与 tokens/graphic.json 的 paper.fill）：
 *   第一层纸：放在页面底上，浅色 surface-cool、暗色 surface；放在表面底上，两种模式都用 surface-cool
 *   第二层纸：line；笔势：accent；朱红点：ember
 */
export function roleColors(tokens, graphic, theme, context = 'page') {
  const role = (name) => tokens.color.roles[name][theme];
  const fill = graphic.paper.fill;
  const first = context === 'surface' ? fill.onSurface[theme] : fill.onPage[theme];
  return { ink: role(graphic.stroke.colorRole), paper: role(first), 'paper-2': role(fill.second), ember: role('ember') };
}

/** 源 SVG → 上好色的 SVG（只替换变量，不改几何）。background 为角色名时在最底下铺一层底色。 */
export function themedSvg(src, colors, { background = null, tokens, theme } = {}) {
  // 笔势与纸片的角色取 colors；其余（如派生资产里的 text、accent-strong）直接取方案的颜色角色
  let out = src.replace(/var\(--va-([a-z0-9-]+), (?:currentColor|none)\)/g, (m, role) => {
    const c = colors[role] ?? tokens?.color.roles[role]?.[theme];
    if (!c) throw new Error(`没有角色 ${role} 的色值`);
    return c;
  });
  out = out.replace(/ class="va-[a-z0-9-]+"/g, '');
  if (background) {
    const vb = src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const bg = tokens.color.roles[background][theme];
    out = out.replace(/(<svg[^>]*>\n?)/, `$1  <rect width="${vb[1]}" height="${vb[2]}" fill="${bg}"/>\n`);
  }
  return out;
}
