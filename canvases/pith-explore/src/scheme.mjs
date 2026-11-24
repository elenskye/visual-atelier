// Pith 的方案接进画布：颜色、字号、动效都从 schemes/pith/ 来（经 canvases/_lib/root.mjs），画布不另写一份。
//   SCHEME_CSS：Design System 的 tokens.css（默认配色纸与海、明暗）+ bundle.css（组件、第二套配色雾与赭、全部动效零件），和发布的 Design System 是同一份。
//   ALIAS_CSS：App 板的老变量名（--bg、--ink、--sea……，从 EX 一路沿用）指到方案的 --color-*，换配色、明暗时跟着变。
import { rootImport } from '../../_lib/root.mjs';

const { dsRuntime } = await rootImport('tooling/design-system/build.mjs');
const rt = await dsRuntime('pith', { motion: true });
export const SCHEME_CSS = `${rt.tokensCss}\n${rt.bundleCss}`;
export const PALETTES = [{ id: 'paper-sea', name: '纸与海' }, { id: 'mist-ochre', name: '雾与赭' }];

const ALIAS = { bg: 'page', card: 'surface', white: 'raised', tint: 'tint', line: 'line', line2: 'line-2', ink: 'text', ink2: 'text-2', muted: 'text-3', faint: 'text-4', sea: 'accent', 'sea-t': 'accent-text', 'on-sea': 'on-accent', crim: 'second', coral: 'coral', gold: 'gold', 'app-ink': 'app-ink', 'app-paper': 'app-paper', 'app-coral': 'app-coral' };
// 换了配色或明暗的元素（data-palette、data-theme）也要重新指一遍：别名是在声明它的元素上算好再往下传的
export const ALIAS_CSS = (root) => `${root},${root} [data-theme],${root} [data-palette]{${Object.entries(ALIAS).map(([k, v]) => `--${k}:var(--color-${v})`).join(';')}}`;

/** 两套配色、明暗各查一遍方案的 APCA 配对（和 npm run qa 同一份门槛：schemes/pith/tokens/contrast.json）。返回每套每个明暗最低的那一对。 */
export async function apcaReport() {
  const { loadTokens, resolveColor, paletteIds } = await rootImport('tooling/lib/common.mjs');
  const { calcAPCA } = await (await import('../../_lib/root.mjs')).rootPackage('apca-w3');
  const t = loadTokens('pith');
  const out = [];
  for (const pal of paletteIds(t)) for (const mode of ['light', 'dark']) {
    const rows = t.contrast.pairs.map((p) => ({ ...p, lc: Math.abs(calcAPCA(resolveColor(t, p.fg, mode, pal), resolveColor(t, p.bg, mode, pal))) }));
    const min = rows.reduce((a, b) => (b.lc - b.min < a.lc - a.min ? b : a));
    out.push({ palette: t.color.palettes[pal].label, mode, min, pass: rows.every((r) => r.lc >= r.min) });
  }
  return out;
}
