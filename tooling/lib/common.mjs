import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, realpathSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const readText = (p) => readFileSync(p, 'utf8');
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

/** 开头的 ~ 换成用户目录（--origin、sync.json 的 root 这类路径）。 */
export const expandHome = (p) => p.replace(/^~(?=$|\/)/, os.homedir());

/** 方案目录 sdir 下的全部动效零件（带 motion.json 的文件夹）：[{ id, dir, spec }]，按文件夹名排。 */
export function motionParts(sdir) {
  const mdir = path.join(sdir, 'motion');
  if (!existsSync(mdir)) return [];
  return readdirSync(mdir).sort().filter((id) => existsSync(path.join(mdir, id, 'motion.json'))).map((id) => {
    const dir = path.join(mdir, id);
    return { id, dir, spec: readJson(path.join(dir, 'motion.json')) };
  });
}

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

/**
 * 生成器（build:graphic、build:derived）更新清单里自己的一条：保留状态、批准记录与备注，其余字段以生成结果 e 为准；
 * 没有旧条目的记为 proposed。
 */
export function mergeManifestEntry(old, e) {
  const keep = old ? { status: old.status, ...(old.approved ? { approved: old.approved } : {}), ...(old.notes ? { notes: old.notes } : {}) } : { status: 'proposed' };
  return { id: e.id, title: e.title, file: e.file, kind: e.kind, ...keep, ...Object.fromEntries(Object.entries(e).filter(([k]) => !['id', 'title', 'file', 'kind'].includes(k))) };
}

/** 生成器写回方案目录：changed（相对方案目录）里的文件取 files 的内容；assets 不为空时把清单整份写回。 */
export function writeGenerated(sdir, files, changed, manifestPath, manifest, assets) {
  for (const rel of changed) {
    if (rel === 'marks/manifest.json') continue;
    const p = path.join(sdir, rel);
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, files[rel]);
  }
  if (assets) writeFileSync(manifestPath, JSON.stringify({ ...manifest, assets }, null, 2) + '\n');
}

/**
 * 生成器（build:graphic、build:derived）共用的一遍：逐个方案生成、和方案目录比较，不是 --check 就写回。
 * generate(scheme) 返回 { files: { 相对方案目录的路径: 内容 }, entries: 清单条目 }；applies(sdir) 为假的方案跳过。
 * 保护：文件属于清单里已是 approved 的资产（条目的 marks/<file>）、内容又变了，算 blocked，不覆盖。
 * 清单：保留状态、批准记录与备注，其余字段以生成结果为准；新资产记为 proposed；不再生成的条目移除；approved 且校验和变了的条目不动。
 * 退出码：有 blocked，或 --check 时有待更新的文件，就是 1（同步在 tag 里跑 --check 靠它）；quiet 时不设（质量检查自己报）。
 * 返回 [{ scheme, changed: [相对方案目录的路径], blocked: [...] }]。
 */
export function runGenerated(args, { generator, label, noun, applies, generate }) {
  const results = [];
  for (const scheme of schemesToBuild(args)) {
    const sdir = schemeDir(scheme);
    if (!applies(sdir)) continue;
    const { files, entries } = generate(scheme);
    const mpath = path.join(sdir, 'marks', 'manifest.json');
    const manifest = readJson(mpath);
    const byId = new Map(manifest.assets.map((a) => [a.id, a]));
    const changed = [], blocked = [];
    for (const [rel, content] of Object.entries(files)) {
      const p = path.join(sdir, rel);
      if (existsSync(p) && readFileSync(p, 'utf8') === content) continue;
      const id = entries.find((e) => `marks/${e.file}` === rel)?.id;
      if (id && byId.get(id)?.status === 'approved') { blocked.push(rel); continue; }
      changed.push(rel);
    }
    const next = manifest.assets.filter((a) => a.source?.generator !== generator || entries.some((e) => e.id === a.id));
    for (const e of entries) {
      const old = byId.get(e.id);
      if (old?.status === 'approved' && old.sha256 !== e.sha256) continue;
      const merged = mergeManifestEntry(old, e);
      const i = next.findIndex((a) => a.id === e.id);
      if (i < 0) next.push(merged);
      else next[i] = merged;
    }
    const manifestChanged = JSON.stringify(next) !== JSON.stringify(manifest.assets);
    if (manifestChanged) changed.push('marks/manifest.json');

    if (!args.check) writeGenerated(sdir, files, changed, mpath, manifest, manifestChanged ? next : null);
    const verb = args.check ? '待更新' : '已写入';
    log(`${label} ${scheme}: ${Object.keys(files).length} 个${noun}，${changed.length ? `${verb} ${changed.length} 个：${changed.join('、')}` : '与源文件一致'}${blocked.length ? `；已批准、拒绝覆盖：${blocked.join('、')}` : ''}`);
    results.push({ scheme, changed, blocked });
  }
  if (!args.quiet && results.some((r) => r.blocked.length || (args.check && r.changed.length))) process.exitCode = 1;
  return results;
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
