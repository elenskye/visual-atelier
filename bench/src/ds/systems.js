import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { canvasDir, readCanvasJson } from '../canvas/store.js';
import { snapshot } from '../canvas/versions.js';

// Design Systems live in this repository: the source in schemes/<方案>/design-system/, the build
// (`npm run build:ds` at the root) in dist/<方案>/design-system/. The bench reads the build in place,
// never copies the source (站主 2026-11-06). Only installing one on a canvas copies files, the way
// a Claude canvas does: into project/ds/<folder>/ plus a record in canvas.json's designSystems.

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

export function systemPaths(config, name) {
  const root = config.repoAbs;
  const build = path.join(root, 'dist', name, 'design-system');
  return {
    src: path.join(root, 'schemes', name, 'design-system'),
    build,
    project: path.join(build, 'project'),
    upload: path.join(build, 'upload')
  };
}

const MEDIA = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };

/**
 * The system's index (design-system.json). The build leaves it out when an asset's bytes differ
 * from the upload record (a render that is not yet deterministic, say); then it is rebuilt here from
 * system.json and published.json, which is all the page needs, and `partial` says why.
 */
export function readIndex(config, name) {
  const p = systemPaths(config, name);
  const file = path.join(p.project, 'design-system.json');
  if (fs.existsSync(file)) return readJson(file);
  if (!fs.existsSync(path.join(p.project, 'tokens.json')) || !fs.existsSync(path.join(p.src, 'system.json'))) return null;
  const system = readJson(path.join(p.src, 'system.json'));
  const published = fs.existsSync(path.join(p.src, 'published.json')) ? readJson(path.join(p.src, 'published.json')) : {};
  const assetGroups = {};
  for (const g of system.assetGroups || []) {
    const files = {};
    for (const a of g.assets || []) {
      const rec = published.assets?.[`${g.name}/${a.name}`];
      if (rec) files[a.name] = { name: a.name, blob: rec.blob, size: rec.size, type: MEDIA[path.extname(a.name).toLowerCase()] || 'application/octet-stream' };
    }
    assetGroups[g.name] = { name: g.name, tile: g.tile, order: (g.assets || []).map((a) => a.name), files };
  }
  return {
    title: system.title,
    namespace: system.namespace,
    groups: (system.assetGroups || []).map((g) => g.name),
    assetGroups,
    lastChange: published.lastChange || null,
    partial: '构建没写出 design-system.json（有资产和上传记录对不上，多半是渲染没做到每次一致）；这里按 system.json 和 published.json 补出来，图片用本机这次渲染的'
  };
}

/** Every scheme that has a design-system/ folder. */
export function listSystems(config) {
  const schemes = path.join(config.repoAbs, 'schemes');
  if (!fs.existsSync(schemes)) return [];
  return fs
    .readdirSync(schemes)
    .filter((n) => !n.startsWith('_') && !n.startsWith('.') && fs.existsSync(path.join(schemes, n, 'design-system')))
    .sort()
    .map((name) => {
      const p = systemPaths(config, name);
      const index = readIndex(config, name);
      const built = Boolean(index);
      const system = fs.existsSync(path.join(p.src, 'system.json')) ? readJson(path.join(p.src, 'system.json')) : {};
      const published = fs.existsSync(path.join(p.src, 'published.json')) ? readJson(path.join(p.src, 'published.json')) : null;
      return {
        name,
        title: index?.title || system.title || system.name || name,
        namespace: index?.namespace || system.namespace || name,
        built,
        cloud: published?.url ? { url: published.url, account: published.account || null } : null
      };
    });
}

function systemOf(config, name) {
  const s = listSystems(config).find((x) => x.name === name);
  if (!s) throw new Error(`没有 Design System「${name}」（要有 schemes/${name}/design-system/）`);
  if (!s.built) throw new Error(`Design System「${name}」还没构建：在仓库根目录跑 npm run build:ds`);
  return s;
}

/** The marker on line 1 of a preview: <!-- @dsCard group="…" height=N width=N subtitle="…" --> */
export function parseMarker(line) {
  const m = /^<!--\s*@dsCard\b(.*?)-->/.exec(line || '');
  if (!m) return {};
  const out = {};
  for (const [, k, q, bare] of m[1].matchAll(/([a-z]+)=(?:"([^"]*)"|(\S+))/g)) out[k] = q ?? (/^\d+$/.test(bare) ? Number(bare) : bare);
  return out;
}

function walk(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const abs = path.join(dir, e.name);
    return e.isDirectory() ? walk(abs, base) : [path.relative(base, abs).split(path.sep).join('/')];
  });
}

/** Everything the board UI needs to show one system. */
export function readSystem(config, name) {
  const s = systemOf(config, name);
  const p = systemPaths(config, name);
  const index = readIndex(config, name);
  const tokens = fs.existsSync(path.join(p.project, 'tokens.json')) ? readJson(path.join(p.project, 'tokens.json')) : null;
  const text = (rel) => (fs.existsSync(path.join(p.project, rel)) ? fs.readFileSync(path.join(p.project, rel), 'utf8') : null);
  const files = walk(p.project).sort();
  const compDir = path.join(p.project, 'components');
  const components = fs.existsSync(compDir)
    ? fs
        .readdirSync(compDir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && e.name !== 'lib' && e.name !== 'src')
        .map((e) => {
          const preview = text(`components/${e.name}/preview.html`);
          return { name: e.name, readme: text(`components/${e.name}/README.md`), hasPreview: Boolean(preview), ...parseMarker(preview?.split('\n')[0]) };
        })
    : [];
  const cover = components.find((c) => c.name === 'Cover') || null;
  const assets = (index.groups || Object.keys(index.assetGroups || {})).map((g) => {
    const group = index.assetGroups?.[g] || { files: {} };
    const order = group.order?.length ? group.order : Object.keys(group.files || {});
    return {
      group: g,
      tile: group.tile || null,
      readme: text(`assets/${g}/README.md`),
      files: order.map((k) => group.files[k]).filter(Boolean).map((f) => ({ name: f.name, blob: f.blob, size: f.size, type: f.type }))
    };
  });
  // further sections: other *.md outside components/ and archived/, in path order
  const sections = files
    .filter((f) => f.endsWith('.md') && f !== 'README.md' && !f.startsWith('components/') && !f.startsWith('archived/') && !f.startsWith('assets/'))
    .map((f) => ({ file: f, text: text(f) }));
  return {
    ...s,
    lastChange: index.lastChange || null,
    partial: index.partial || null,
    readme: text('README.md'),
    sections,
    tokens,
    fonts: fontLinks(tokens),
    components: components.filter((c) => c.name !== 'Cover'),
    cover,
    assets,
    files: files.map((f) => ({ path: f, size: fs.statSync(path.join(p.project, f)).size }))
  };
}

/** blob id → absolute path of the uploaded file, for every built system. */
export function systemBlobs(config) {
  const map = new Map();
  for (const s of listSystems(config)) {
    if (!s.built) continue;
    const p = systemPaths(config, s.name);
    const index = readIndex(config, s.name);
    for (const [g, group] of Object.entries(index.assetGroups || {})) {
      for (const f of Object.values(group.files || {})) {
        const abs = path.join(p.upload, g, f.name);
        if (f.blob && fs.existsSync(abs)) map.set(f.blob, abs);
      }
    }
  }
  return map;
}

let vaTokensCss = null;
/** tokens.json → tokens.css, with tooling's own compiler (the one check:ds uses). */
export async function tokensCss(config, tokens) {
  if (!vaTokensCss) {
    const mod = await import(pathToFileURL(path.join(config.repoAbs, 'tooling/design-system/check.mjs')).href);
    vaTokensCss = mod.tokensCss;
  }
  return vaTokensCss(tokens);
}

/**
 * Google Fonts stylesheet links for the families a tokens.json names (hosted faces have no file).
 * Names in meta.localFonts are system fonts that only exist on the machine (Pomelo's 手札体, 苹方): not on Google Fonts, skipped.
 */
// Mac 自带的字体：Google Fonts 上没有，不去请求（Peck 的字体栈里写了 Hiragino Sans GB，请求只会得到 400）
const MAC_FONTS = ['PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Hiragino Sans', 'Hiragino Mincho ProN', 'Songti SC', 'STSong', 'Heiti SC', 'STHeiti', 'Kaiti SC', 'Hannotate SC', 'Hanzipen SC', 'Yuanti SC', 'Lantinghei SC', 'SF Pro', 'SF Pro Text', 'SF Pro Display', 'SF Mono', 'Menlo', 'Monaco', 'Helvetica Neue', 'Helvetica', 'Arial', 'Times New Roman', 'Georgia', 'Apple Color Emoji'];

export function fontLinks(tokens) {
  if (!tokens?.type) return [];
  const local = new Set([...(tokens.meta?.localFonts || []), ...MAC_FONTS]);
  const weights = new Set([400]);
  for (const g of tokens.type.groups || []) for (const st of g.styles || []) if (st.fontWeight) String(st.fontWeight).split(/\s+/).forEach((w) => weights.add(Number(w)));
  const hosted = new Set((tokens.type.fonts || []).map((f) => f.family));
  const names = [];
  for (const stack of Object.values(tokens.type.families || {})) {
    // the quoted names before the first system keyword are the web fonts; the rest are fallbacks
    for (const part of stack.split(',').map((x) => x.trim())) {
      const q = /^"(.+)"$/.exec(part);
      if (!q) break;
      if (!hosted.has(q[1]) && !local.has(q[1]) && !names.includes(q[1])) names.push(q[1]);
    }
  }
  const w = [...weights].filter((x) => x >= 100 && x <= 900).sort((a, b) => a - b).join(';');
  return names.map((n) => `https://fonts.googleapis.com/css2?family=${encodeURIComponent(n).replace(/%20/g, '+')}:wght@${w}&display=swap`);
}

/** A component preview as the Design System page runs it: tokens.css, fonts, bundle.css, data-theme. */
export async function previewDocument(config, name, comp, theme = null) {
  const p = systemPaths(config, name);
  const file = path.join(p.project, 'components', comp, 'preview.html');
  if (!/^[A-Za-z_$][\w$]*$/.test(comp) || !fs.existsSync(file)) return null;
  const tokens = readJson(path.join(p.project, 'tokens.json'));
  const first = tokens.color?.themes?.[0]?.id || 'light';
  const css = (await tokensCss(config, tokens)) + (fs.existsSync(path.join(p.project, 'components/bundle.css')) ? fs.readFileSync(path.join(p.project, 'components/bundle.css'), 'utf8') : '');
  const head = [...fontLinks(tokens).map((u) => `<link rel="stylesheet" href="${u}">`), `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`].join('');
  const bundle = fs.existsSync(path.join(p.project, 'components/bundle.js')) ? '<script src="../bundle.js"></script>' : '';
  let html = fs.readFileSync(file, 'utf8');
  html = /<html[^>]*>/i.test(html) ? html.replace(/<html([^>]*)>/i, (m, a) => `<html${a.replace(/\sdata-theme="[^"]*"/, '')} data-theme="${theme || first}">`) : `<html data-theme="${theme || first}">${html}</html>`;
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head([^>]*)>/i, `<head$1>${head}${bundle}`) : html.replace(/<html([^>]*)>/i, `<html$1><head>${head}${bundle}</head>`);
  return html;
}

const folderOf = (namespace) => String(namespace).toLowerCase().replace(/[^a-z0-9_]+/g, '-').replace(/^[-_]+/, '').slice(0, 64) || 'ds';

/**
 * Installs a system on a local canvas the way a Claude canvas does: its tokens.json, a compiled
 * tokens.css and components/bundle.css (and bundle.js when it has one) under project/ds/<folder>/,
 * and one record in canvas.json's designSystems. Artboards then link ds/<folder>/tokens.css and
 * ds/<folder>/components/bundle.css after the support.js line.
 */
export async function installSystem(config, canvas, name, { at = new Date() } = {}) {
  const s = systemOf(config, name);
  const p = systemPaths(config, name);
  const dir = canvasDir(config, canvas);
  const index = readCanvasJson(config, canvas);
  const folder = folderOf(s.namespace);
  const list = Array.isArray(index.designSystems) ? index.designSystems : [];
  // the same folder already holds a different system (another title and another artifact)
  const clash = list.find((d) => d.namespace === folder && d.title !== s.title && !(d.artifact && s.cloud?.url && sameArtifact(d.artifact, s.cloud.url)));
  if (clash) throw new Error(`画布 ${canvas} 的 ds/${folder}/ 已经装着另一个 Design System（${clash.title}）`);
  if (!clash && list.filter((d) => d.namespace !== folder).length >= 4) throw new Error('一块画布最多挂 4 个 Design System');

  const target = path.join(dir, 'project', 'ds', folder);
  const tokens = readJson(path.join(p.project, 'tokens.json'));
  // the system's own tokens.css when it publishes one (the same file a cloud session reads), else compiled here
  const ownCss = path.join(p.project, 'tokens.css');
  const files = { 'tokens.json': fs.readFileSync(path.join(p.project, 'tokens.json')), 'tokens.css': fs.existsSync(ownCss) ? fs.readFileSync(ownCss) : Buffer.from(await tokensCss(config, tokens)) };
  for (const rel of ['components/bundle.css', 'components/bundle.js']) {
    if (fs.existsSync(path.join(p.project, rel))) files[rel] = fs.readFileSync(path.join(p.project, rel));
  }
  fs.rmSync(target, { recursive: true, force: true });
  for (const [rel, buf] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(target, rel)), { recursive: true });
    fs.writeFileSync(path.join(target, rel), buf);
  }
  const record = {
    title: s.title,
    namespace: folder,
    artifact: s.cloud?.url ? s.cloud.url.replace(/[?#].*$/, '') : null,
    version: null,
    copiedAt: at.toISOString().replace(/\.\d{3}Z$/, 'Z')
  };
  const i = list.findIndex((d) => d.namespace === folder);
  const next = i >= 0 ? [...list.slice(0, i), record, ...list.slice(i + 1).filter((d) => d.namespace !== folder)] : [...list, record];
  const canvasFile = path.join(dir, 'project', 'canvas.json');
  const raw = JSON.parse(fs.readFileSync(canvasFile, 'utf8'));
  raw.designSystems = next;
  fs.writeFileSync(canvasFile, JSON.stringify(raw, null, 2) + '\n');
  const version = snapshot(config, canvas, `ds-${folder}`, { at });
  return { folder, files: Object.keys(files).map((f) => `project/ds/${folder}/${f}`), record, version: version?.id || null, links: [`ds/${folder}/tokens.css`, ...(files['components/bundle.css'] ? [`ds/${folder}/components/bundle.css`] : []), ...(files['components/bundle.js'] ? [`ds/${folder}/components/bundle.js`] : [])], fonts: fontLinks(tokens) };
}

function sameArtifact(a, b) {
  const id = (u) => /artifact\/([^/?#]+)/.exec(u)?.[1];
  return id(a) && id(a) === id(b);
}
