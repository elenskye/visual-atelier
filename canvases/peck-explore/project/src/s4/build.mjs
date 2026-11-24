// 第 4 步 · 构建 Design System：照 visual-atelier 的 build:ds 出 project/ 下要发到云端的文件，再挂到这块画布上（project/ds/peck/）。
// 用 visual-atelier 的 tooling（VA_ROOT 指向它或它的临时副本，schemes/peck 要指到这块画布的 project/scheme/）。
// 当初比 build:ds 多做四件：第一主题深色、fonts/ 两个字体文件、size 和 step 两组 token、没有圆角就不出 radius。
// 2026-11-10 导入时 build:ds 补上了这四件（tokens.config.json 的 themes、fonts、scaleGroups），这里只在旧的 build:ds 上兜底，两边出的一样。
// 字体和 A3 的原文件在画布的 blobs/（和云端附件同一份字节）。
import path from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const sha = (b) => createHash('sha256').update(b).digest('hex');
const J = (o) => JSON.stringify(o, null, 2) + '\n';
const MEDIA = { '.svg': 'image/svg+xml', '.png': 'image/png' };
function put(file, data) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, data); }
function walk(dir) { const out = []; for (const e of readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) out.push(...walk(p)); else out.push(p); } return out; }

/**
 * project：画布的 project/ 目录；out：构建输出（out/project 发到云端，out/upload 是要上传的资产）。
 * 返回 { tokens, files: {云端路径: 本地文件}, uploads: [{name, path, sha256, size}], missing: [还没上传的资产] }
 */
export async function buildDs({ va, project, out }) {
  const { buildTokensJson, expand } = await import(path.join(va, 'tooling/design-system/build.mjs'));
  const { tokensCss } = await import(path.join(va, 'tooling/design-system/tokens-css.mjs'));
  const { loadTokens } = await import(path.join(va, 'tooling/lib/common.mjs'));
  const sdir = path.join(project, 'scheme');
  const src = path.join(sdir, 'design-system');
  const read = (p) => readFileSync(path.join(src, p), 'utf8');
  const system = JSON.parse(read('system.json'));
  const config = { ...JSON.parse(read('tokens.config.json')), title: system.title };
  const meta = JSON.parse(readFileSync(path.join(sdir, 'scheme.json'), 'utf8'));
  const fontsJson = JSON.parse(readFileSync(path.join(sdir, 'type/fonts.json'), 'utf8'));
  const localFonts = (fontsJson.native ?? []).flatMap((x) => [x.alias, x.family].filter(Boolean));
  const t = loadTokens('peck');
  const tj = buildTokensJson('peck', t, config, meta.version, { localFonts });
  // 四件扩展
  tj.color.themes = config.themes;
  tj.type.fonts = config.fonts.map(({ family, file, weight, style }) => ({ family, file, weight, style }));
  if (tj.radius && !tj.radius.tokens.length) delete tj.radius;
  // 控件尺寸和像素角：方案 scale.json 的 size、step（step 的值是每级的像素）
  const fam = (prefix, obj, pick = (v) => v) => ({ tokens: Object.entries(obj).map(([k, v]) => { const name = `${prefix}-${k}`; if (!config.usage[name]) throw new Error(`tokens.config.json 缺少 ${name} 的用途`); return { name, value: pick(v), usage: config.usage[name] }; }) });
  if (!tj.size) tj.size = fam('size', t.scale.size);
  if (!tj.step) tj.step = fam('step', t.scale.step, (v) => v.size);
  // 名字不重（type 以外共用一个命名空间）
  const names = Object.values(tj).flatMap((f) => (f?.tokens ? f.tokens.map((x) => x.name) : []));
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  if (dup.length) throw new Error('token 重名：' + dup.join('、'));

  const P = path.join(out, 'project');
  rmSync(out, { recursive: true, force: true });
  const files = {};
  const w = (rel, data) => { put(path.join(P, rel), data); files[`project/${rel}`] = path.join(P, rel); };
  w('tokens.json', J(tj));
  // 第一份 tokens.css 由我们写（页面以后保存时接手）：第一行照格式写，字体文件的 @font-face 放在最后（路径相对 tokens.css）
  const faces = tj.type.fonts.map((f) => `@font-face { font-family: "${f.family}"; src: url("${f.file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }`).join('\n');
  w('tokens.css', `/* ${system.title} — generated from tokens.json */\n` + tokensCss(tj) + faces + '\n');
  w('README.md', read('README.md'));
  w('components/bundle.css', expand(read('bundle.css'), sdir));
  w('components/bundle.js', `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: system.namespace, components: [] })} */\nwindow.${system.namespace} = window.${system.namespace} || {};\n`);
  for (const f of walk(path.join(src, 'components'))) {
    const rel = path.relative(src, f);
    const text = expand(readFileSync(f, 'utf8'), sdir);
    if (Buffer.byteLength(text) > 256 * 1024) throw new Error(`${rel} 超过 256 KB`);
    if (/<(iframe|frame|object|embed|portal|noscript)\b/i.test(text)) throw new Error(`${rel} 含不允许的元素`);
    w(rel, text);
  }
  // 资产分组的说明（文本文件，照原样发）
  if (existsSync(path.join(src, 'assets'))) for (const f of walk(path.join(src, 'assets'))) if (f.endsWith('.md')) w(path.relative(src, f), readFileSync(f, 'utf8'));
  for (const f of config.fonts) {
    const from = path.join(project, '..', FONT_SRC[f.family]);
    put(path.join(P, f.file), readFileSync(from));
    files[`project/${f.file}`] = path.join(P, f.file);
  }

  // 资产：方案 marks/ 的 SVG（按 manifest 的 id）、A3 位图；对照上传记录
  const manifest = JSON.parse(readFileSync(path.join(sdir, 'marks/manifest.json'), 'utf8'));
  const byId = new Map(manifest.assets.map((a) => [a.id, a]));
  const pubPath = path.join(src, 'published.json');
  const published = existsSync(pubPath) ? JSON.parse(readFileSync(pubPath, 'utf8')) : null;
  const uploads = [], missing = [], assetGroups = {};
  for (const g of system.assetGroups) {
    const gfiles = {};
    for (const a of g.assets) {
      const from = a.file ? path.join(project, a.file) : path.join(sdir, 'marks', byId.get(a.id)?.file ?? '');
      if (!a.file && !byId.get(a.id)) throw new Error(`system.json 引用了 manifest 里没有的 ${a.id}`);
      const buf = readFileSync(from);
      const key = `${g.name}/${a.name}`;
      const up = path.join(out, 'upload', g.name, a.name);
      put(up, buf);
      uploads.push({ key, name: a.name, path: up, sha256: sha(buf), size: buf.length });
      const rec = published?.assets?.[key];
      if (!rec || rec.sha256 !== sha(buf)) { missing.push(key); continue; }
      gfiles[a.name] = { name: a.name, blob: rec.blob, size: rec.size, type: MEDIA[path.extname(a.name)] };
    }
    assetGroups[g.name] = { name: g.name, tile: g.tile, order: g.assets.map((x) => x.name), files: gfiles };
  }
  // index：上传都对上了才写（写在最后发）
  if (!missing.length && published?.createdOnFiles) {
    const index = {
      v: 3, layout: 'files', createdOnFiles: published.createdOnFiles, title: system.title, namespace: system.namespace, libraries: [], sections: {},
      groups: system.assetGroups.map((g) => g.name), assetGroups, blobs: {}, docs: { sections: [] },
      lastChange: { by: system.by, via: system.via, at: published.lastChange.at, note: published.lastChange.note },
    };
    w('design-system.json', J(index));
  }
  return { tokens: tj, files, uploads, missing, published };
}
// 画布附件（blobs/<id>.<扩展名>，dw 的格式）
const FONT_SRC = { 'Fusion Pixel 12': 'blobs/3cac2eac4c813b222f13d0c459436aa1.woff2', 'Departure Mono': 'blobs/13ad4bc2c335a5fe439f1dd23f0a7087.woff2' };
export const A3_SRC = 'blobs/b2b77dcfff116af6d452687ca80848d9.png';

/**
 * 挂到画布上：照 Design 画布的做法，tokens.json、tokens.css、components/bundle.css、components/bundle.js 和 tokens.css 用到的
 * 字体文件原样复制到 project/ds/peck/，canvas.json 的 designSystems 记一条。画板只引 tokens.css 和 bundle.css。
 */
export function installDs({ project, built, record }) {
  const dir = path.join(project, 'ds', 'peck');
  rmSync(dir, { recursive: true, force: true });
  const rels = ['tokens.json', 'tokens.css', 'components/bundle.css', 'components/bundle.js', ...built.tokens.type.fonts.map((f) => f.file)];
  for (const rel of rels) put(path.join(dir, rel), readFileSync(built.files[`project/${rel}`]));
  const cpath = path.join(project, 'canvas.json');
  const cv = JSON.parse(readFileSync(cpath, 'utf8'));
  const list = (cv.designSystems || []).filter((d) => d.namespace !== 'peck');
  cv.designSystems = [...list, record];
  writeFileSync(cpath, JSON.stringify(cv, null, 2) + '\n');
  return rels.map((r) => `project/ds/peck/${r}`);
}
