import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, realpathSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const readText = (p) => readFileSync(p, 'utf8');
export const exists = existsSync;
export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/** 写文件。目标已存在时先删掉再写：产物目录里的旧文件可能是只读的（例如从别处带来的），直接覆盖会 EACCES。 */
export function writeFile(p, data) {
  mkdirSync(path.dirname(p), { recursive: true });
  rmSync(p, { force: true });
  writeFileSync(p, data);
}

/** 复制文件内容，不继承源文件的只读权限，产物始终是普通可写文件。 */
export function copyFile(src, dest) {
  writeFile(dest, readFileSync(src));
}

export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

export const schemeDir = (name) => path.join(ROOT, 'schemes', name);

export function schemesToBuild(args) {
  if (typeof args.scheme === 'string') return [args.scheme];
  return readdirSync(path.join(ROOT, 'schemes'))
    .filter((d) => !d.startsWith('_') && existsSync(path.join(ROOT, 'schemes', d, 'scheme.json')))
    .sort();
}

export const outRoot = (args) => path.resolve(typeof args.out === 'string' ? args.out : path.join(ROOT, 'dist'));

export function walk(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) files.push(...walk(p));
    else files.push(p);
  }
  return files;
}

/** 取出 selector 后第一个花括号块的内容（支持嵌套）。 */
export function extractBlock(css, selector) {
  const i = css.indexOf(selector);
  if (i < 0) return null;
  const open = css.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < css.length; j++) {
    if (css[j] === '{') depth++;
    else if (css[j] === '}') { depth--; if (!depth) return css.slice(open + 1, j); }
  }
  return null;
}

export function parseVars(block) {
  const map = {};
  if (!block) return map;
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map[m[1]] = m[2].trim().replace(/\s+/g, ' ');
  return map;
}

/** 两个 #rrggbb 按比例混合：t = 0 是 a，t = 1 是 b。 */
export function mixHex(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/**
 * 多套配色：color.json 带 palettes 时，把每套展开成和单套一样的 roles（{ 角色: { label, light, dark } }）。
 * 每套的角色来自三处：roleDefs（每套都要给值）、shared（各套共用）、derive（由别的角色混出来）。
 * 展开后 color.roles 是默认那套，只认一套的工具不用改；要逐套处理的工具用 paletteRoles。
 */
function normalizeColor(color, scheme) {
  if (!color.palettes) return color;
  const paletteRoles = {};
  for (const [id, pal] of Object.entries(color.palettes)) {
    const roles = {};
    for (const [role, def] of Object.entries(color.roleDefs)) {
      for (const mode of ['light', 'dark']) if (pal[mode]?.[role] === undefined) throw new Error(`${scheme}：配色 ${id} 的 ${mode} 缺角色 ${role}`);
      roles[role] = { ...def, light: pal.light[role], dark: pal.dark[role] };
    }
    for (const [role, r] of Object.entries(color.shared ?? {})) roles[role] = r;
    for (const [role, d] of Object.entries(color.derive ?? {})) {
      const side = (ref, mode) => (ref.startsWith('#') ? ref : roles[ref][mode]);
      roles[role] = { label: d.label, light: mixHex(side(d.mix[0], 'light'), side(d.mix[1], 'light'), d.light), dark: mixHex(side(d.mix[0], 'dark'), side(d.mix[1], 'dark'), d.dark) };
    }
    paletteRoles[id] = roles;
  }
  return { ...color, paletteRoles, roles: paletteRoles[color.defaultPalette] };
}

/** 解析某方案的 token 源。 */
export function loadTokens(scheme) {
  const dir = path.join(schemeDir(scheme), 'tokens');
  const optional = (name) => (existsSync(path.join(dir, name)) ? readJson(path.join(dir, name)) : null);
  return {
    color: normalizeColor(readJson(path.join(dir, 'color.json')), scheme),
    scale: readJson(path.join(dir, 'scale.json')),
    targets: readJson(path.join(dir, 'targets.json')),
    motion: readJson(path.join(dir, 'motion.json')),
    contrast: readJson(path.join(dir, 'contrast.json')),
    graphic: optional('graphic.json'),
    handmade: optional('handmade.json'),
  };
}

/** 方案的配色 id；只有一套的方案返回 [null]，循环写法两边一样。 */
export const paletteIds = (tokens) => (tokens.color.palettes ? Object.keys(tokens.color.palettes) : [null]);

/** 动效总览、目录页当底色用的角色。 */
export const pageColor = (tokens, mode) => tokens.color.roles[tokens.color.pageRole ?? 'page'][mode];

/**
 * colorMode 为 currentColor 的资产预览时用哪个角色：清单写了 colorRole 就用它；没写（比如 Peck 的菜单栏模板图，颜色由
 * 系统给）就按正文色预览：方案的 textRole，或者叫 text / ink 的角色。
 */
export function markColorRole(tokens, asset) {
  const roles = tokens.color.roles;
  if (asset.colorRole && roles[asset.colorRole]) return asset.colorRole;
  return [tokens.color.textRole, 'text', 'ink'].find((r) => r && roles[r]) ?? Object.keys(roles)[0];
}

/** 角色 → 具体色值；支持 "@derived"（方言里声明的派生色，目前只有 pomelo 方言用）。palette 不写就是默认那套。 */
export function resolveColor(tokens, ref, mode, palette = null) {
  if (ref.startsWith('@')) {
    const d = tokens.targets.pomelo?.derived?.[ref.slice(1)];
    if (!d) throw new Error(`未声明的派生色 ${ref}`);
    return resolveColor(tokens, d[mode], mode, palette);
  }
  const roles = palette ? tokens.color.paletteRoles[palette] : tokens.color.roles;
  return roles[ref][mode];
}

export function log(...a) { console.log(...a); }

/** 当前模块是否被直接运行（而不是被 import）。 */
export function isMain(metaUrl) {
  try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(metaUrl)); } catch { return false; }
}
