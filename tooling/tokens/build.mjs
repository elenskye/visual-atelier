// 读取方案的 token 源，生成各「方言」：web.css、tokens.ts、tokens.json；方案的 targets.json 声明了 pomelo 才另出 pomelo.css
// 方案有多套配色（color.json 的 palettes）时，每套明暗各出一组变量，用 data-palette 切换。
import path from 'node:path';
import { rmSync } from 'node:fs';
import { parseArgs, schemesToBuild, outRoot, loadTokens, resolveColor, paletteIds, writeFile, log, isMain } from '../lib/common.mjs';

const HEADER = '/* 生成文件，请勿手改。源：schemes/%s/tokens/ ；由 tooling/tokens/build.mjs 生成。 */\n';

function scaleLines(scale) {
  const lines = [];
  for (const [k, v] of Object.entries(scale.width)) lines.push(`  --width-${k}: ${v};`);
  for (const [k, v] of Object.entries(scale.space)) lines.push(`  --space-${k}: ${v};`);
  for (const [k, v] of Object.entries(scale.radius)) lines.push(`  --radius-${k}: ${v};`);
  for (const [k, v] of Object.entries(scale.font)) lines.push(`  --font-${k}: ${v};`);
  for (const [k, v] of Object.entries(scale.text)) lines.push(`  --text-${k}: ${v};`);
  for (const [k, v] of Object.entries(scale.leading ?? {})) lines.push(`  --leading-${k}: ${v};`);
  return lines;
}
const shadowLines = (scale, mode) => Object.entries(scale.shadow).map(([k, v]) => `  --shadow-${k}: ${v[mode]};`);

function buildPaletteWebCss(scheme, t) {
  const { targets, color, scale } = t;
  const w = targets.web;
  const colorLines = (id, mode) => Object.entries(w.colorVars).map(([role, v]) => `  ${v}: ${color.paletteRoles[id][role][mode]};`);
  // 默认那套同时写在不带 data-palette 的选择器上，没设配色也有颜色
  const sel = (id, tpl) => {
    const one = tpl.replace('%s', id);
    return id === color.defaultPalette ? `${tpl.replace(`[data-palette='%s']`, '')}, ${one}` : one;
  };
  const blocks = [[':root {', ...scaleLines(scale), '}'].join('\n')];
  for (const id of paletteIds(t)) {
    blocks.push([`${sel(id, w.light.selector)} {`, `  color-scheme: ${w.light.colorScheme};`, ...colorLines(id, 'light'), ...shadowLines(scale, 'light'), '}'].join('\n'));
    blocks.push([`${sel(id, w.dark.selector)} {`, `  color-scheme: ${w.dark.colorScheme};`, ...colorLines(id, 'dark'), ...shadowLines(scale, 'dark'), '}'].join('\n'));
  }
  return HEADER.replace('%s', scheme) + blocks.join('\n\n') + '\n';
}

export function buildWebCss(scheme, t) {
  if (t.color.palettes) return buildPaletteWebCss(scheme, t);
  const { targets, color, scale } = t;
  const w = targets.web;
  const colorLines = (mode) => Object.entries(w.colorVars).map(([role, v]) => `  ${v}: ${color.roles[role][mode]};`);
  const aliasLines = Object.entries(w.aliasVars).map(([k, v]) => `  ${k}: ${v};`);
  const light = [
    `${w.light.selector} {`, `  color-scheme: ${w.light.colorScheme};`,
    ...scaleLines(scale), ...colorLines('light'), ...aliasLines,
    ...shadowLines(scale, 'light'), '}',
  ];
  const dark = [
    `${w.dark.selector} {`, `  color-scheme: ${w.dark.colorScheme};`,
    ...colorLines('dark'), ...shadowLines(scale, 'dark'), '}',
  ];
  return HEADER.replace('%s', scheme) + light.join('\n') + '\n\n' + dark.join('\n') + '\n';
}

/** Pomelo 方言：跟随系统明暗；站主在设置里选了深浅时写 data-theme，选配色时写 data-palette。 */
function buildPalettePomeloCss(scheme, t) {
  const p = t.targets.pomelo;
  const lines = (id, mode, ind) => Object.entries(p.map).map(([name, ref]) => `${ind}${name}: ${resolveColor(t, ref, mode, id)};`);
  const blocks = [];
  for (const id of paletteIds(t)) {
    const base = `:root[data-palette="${id}"]`;
    const isDefault = id === t.color.defaultPalette;
    blocks.push(`${isDefault ? ':root, ' : ''}${base} {\n${lines(id, 'light', '  ').join('\n')}\n  color-scheme: light dark;\n}`);
    const auto = `${isDefault ? ':root:not([data-theme="light"]), ' : ''}${base}:not([data-theme="light"])`;
    blocks.push(`@media (prefers-color-scheme: dark) {\n  ${auto} {\n${lines(id, 'dark', '    ').join('\n')}\n  }\n}`);
    blocks.push(`${isDefault ? ':root[data-theme="dark"], ' : ''}${base}[data-theme="dark"] {\n${lines(id, 'dark', '  ').join('\n')}\n}`);
  }
  const note = '/* Pomelo 用的方言：同步到 Pomelo 的 src/vendor/pomelo/，根元素写 data-palette 换配色、data-theme 强制明暗。未决项见 schemes/' + scheme + '/tokens/targets.json 的 open-decisions。 */\n';
  return HEADER.replace('%s', scheme) + note + blocks.join('\n\n') + '\n';
}

/**
 * Every colour role → the variable that carries it in the Pomelo dialect: its own --pm-* when it has one,
 * else the first shadcn name mapped to it. Pomelo hands this to the handmade painter (bundle.js asks for
 * var(--color-<role>) by default, which the Pomelo dialect does not define).
 */
export function pomeloVars(t) {
  const out = {};
  for (const [name, ref] of Object.entries(t.targets.pomelo.map)) {
    if (!out[ref] || (name.startsWith('--pm-') && !out[ref].startsWith('--pm-'))) out[ref] = name;
  }
  return Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
}

export function buildPomeloCss(scheme, t) {
  if (t.color.palettes) return buildPalettePomeloCss(scheme, t);
  const p = t.targets.pomelo;
  const lines = (mode) => Object.entries(p.map).map(([name, ref]) => `    ${name}: ${resolveColor(t, ref, mode)};`);
  const note = '/* 临时映射，尚未被 Pomelo 采用。未决项见 schemes/' + scheme + '/tokens/targets.json 的 open-decisions。 */\n';
  return HEADER.replace('%s', scheme) + note +
    ':root {\n' + lines('light').map((l) => l.slice(2)).join('\n') + '\n  color-scheme: light dark;\n}\n\n' +
    '@media (prefers-color-scheme: dark) {\n  :root {\n' + lines('dark').join('\n') + '\n  }\n}\n';
}

export function buildJson(scheme, t) {
  const pick = (rolesIn) => Object.fromEntries(Object.entries(rolesIn).map(([id, r]) => [id, { light: r.light, dark: r.dark }]));
  const json = { scheme, color: pick(t.color.roles), scale: { space: t.scale.space, radius: t.scale.radius, width: t.scale.width, text: t.scale.text, font: t.scale.font }, motion: t.motion };
  if (t.color.palettes) {
    json.defaultPalette = t.color.defaultPalette;
    json.palettes = Object.fromEntries(paletteIds(t).map((id) => [id, { label: t.color.palettes[id].label, family: t.color.palettes[id].family, color: pick(t.color.paletteRoles[id]) }]));
  }
  return json;
}

export function buildTs(scheme, t) {
  const vars = t.targets.pomelo
    ? `/** 每个颜色角色在 Pomelo 方言（pomelo.css）里是哪个变量：有 --pm-* 用它，没有用 shadcn 的名字。 */\nexport const pomeloVars = ${JSON.stringify(pomeloVars(t), null, 2)} as const;\n`
    : '';
  return `// 生成文件，请勿手改。源：schemes/${scheme}/tokens/\nexport const tokens = ${JSON.stringify(buildJson(scheme, t), null, 2)} as const;\nexport type ColorRole = keyof typeof tokens.color;\n${vars}`;
}

export function runTokens(args = parseArgs()) {
  for (const scheme of schemesToBuild(args)) {
    const t = loadTokens(scheme);
    const out = path.join(outRoot(args), scheme, 'tokens');
    writeFile(path.join(out, 'web.css'), buildWebCss(scheme, t));
    const pomeloFile = path.join(out, 'pomelo.css');
    if (t.targets.pomelo) writeFile(pomeloFile, buildPomeloCss(scheme, t));
    else rmSync(pomeloFile, { force: true });
    writeFile(path.join(out, 'tokens.json'), JSON.stringify(buildJson(scheme, t), null, 2) + '\n');
    writeFile(path.join(out, 'tokens.ts'), buildTs(scheme, t));
    log(`tokens  ${scheme} → ${path.relative(process.cwd(), out)}`);
  }
}

if (isMain(import.meta.url)) runTokens();
