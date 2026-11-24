// 由已批准的资产派生新资产：把字标里的文字转成曲线，合成默认分享图，再生成文章分享图与作品水印的模板（DESIGN.md §4、§6）。
// 规格在 schemes/<方案>/marks/derived.json。字体只用登记在 type/fonts.json、可转曲线的 OFL 字体，
// 从对应的 npm 包读取（字体文件不进本仓库）。
//
// 用法：
//   npm run build:derived              生成并写入方案目录，更新 marks/manifest.json
//   npm run build:derived -- --check   只比较，不写入（质量检查也用这个）
//
// 保护：清单里已是 approved 的派生资产，生成结果与文件不同就报错、不覆盖（approved 不改几何与参数，要改开新版本）。
import path from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parseArgs, schemesToBuild, schemeDir, readJson, readText, loadTokens, sha256, log, isMain } from '../lib/common.mjs';
import { roleColors, themedSvg } from '../graphic/svg.mjs';
import { textToPath } from '../og-card/outline.mjs';

const GENERATOR = 'tooling/marks/derive.mjs';
const num = (n) => String(Math.round(n * 1000) / 1000);

/** 字体登记：family → npm 包，且必须可转曲线。 */
function packageFor(scheme, family) {
  const fonts = readJson(path.join(schemeDir(scheme), 'type', 'fonts.json'));
  const f = fonts.web.find((x) => x.family === family);
  if (!f) throw new Error(`type/fonts.json 没有登记字体 ${family}`);
  if (!f.outline) throw new Error(`${family} 的许可不允许转曲线（type/fonts.json 的 outline 为 false）`);
  return f.package;
}

// ---------- 读源文件 ----------

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

/** 从字标源文件里取出 <text> 的排版参数，转成路径。 */
function outlineText(scheme, src) {
  const m = src.match(/<text\b([^>]*)>([^<]*)<\/text>/);
  if (!m) throw new Error('源文件里没有 <text>');
  const [, attrs, content] = m;
  const tag = ` ${attrs}`;
  const family = attr(tag, 'font-family').split(',')[0].trim();
  const d = textToPath(content, {
    pkg: packageFor(scheme, family),
    weight: Number(attr(tag, 'font-weight') ?? 400),
    size: Number(attr(tag, 'font-size')),
    x: Number(attr(tag, 'x')),
    y: Number(attr(tag, 'y')),
    letterSpacing: Number(attr(tag, 'letter-spacing') ?? 0),
  });
  return { whole: m[0], d, family, weight: attr(tag, 'font-weight') ?? '400', label: content };
}

const svgInner = (src) => src.replace(/^[\s\S]*?<svg\b[^>]*>\n?/, '').replace(/\s*<\/svg>\s*$/, '');
const viewBoxOf = (src) => src.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const note = (from, what) => `<!-- 由 ${GENERATOR} 从 ${from} 生成（${what}），不要手改 -->`;

// ---------- 五种派生 ----------

function deriveOutline(scheme, mdir, spec) {
  const src = readText(path.join(mdir, spec.from));
  const t = outlineText(scheme, src);
  const what = `${t.family} ${t.weight} 转曲线`;
  const pathEl = `<path d="${t.d}" fill="currentColor"/>`;
  if (spec.keep === 'text') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${spec.viewBox.join(' ')}" role="img" aria-label="${t.label}">\n  ${note(spec.from, what)}\n  ${pathEl}\n</svg>\n`;
  }
  return src.replace(/(<svg\b[^>]*>\n?)/, `$1  ${note(spec.from, what)}\n`).replace(t.whole, pathEl);
}

function deriveOg(scheme, mdir, spec) {
  const base = readText(path.join(mdir, spec.base));
  const [, , w, h] = viewBoxOf(base);
  const lk = spec.lockup;
  const lockSrc = readText(path.join(mdir, lk.from));
  const [, , , lh] = viewBoxOf(lockSrc);
  const s = lk.height / lh;
  const mark = lockSrc.match(/<g\b[\s\S]*?<\/g>/)[0];
  const t = outlineText(scheme, lockSrc);
  const tg = spec.tagline;
  const tagD = textToPath(tg.text, { pkg: packageFor(scheme, tg.family), weight: tg.weight, size: tg.size, x: tg.x, y: tg.baseline });
  const role = (r) => `color:var(--va-${r}, currentColor)`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true">`,
    `  ${note(`${spec.base} 与 ${lk.from}`, `底图加字标，${t.family} 转曲线`)}`,
    svgInner(base),
    `  <g transform="translate(${num(lk.x)} ${num(lk.y)}) scale(${num(s)})">`,
    `    <g style="${role(lk.markRole)}">${mark}</g>`,
    `    <path d="${t.d}" fill="currentColor" style="${role(lk.textRole)}"/>`,
    '  </g>',
    `  <path d="${tagD}" fill="currentColor" style="${role(tg.role)}"/>`,
    '</svg>',
    '',
  ].join('\n');
}

/** 文章分享图的模板：底图与字标上好色，标题的排法与字体写清楚，由消费方构建时交给 tooling/og-card/card.mjs。 */
function deriveCard(scheme, mdir, spec) {
  const tokens = loadTokens(scheme);
  const { theme } = spec;
  const role = (r) => tokens.color.roles[r][theme];
  const baseSrc = readText(path.join(mdir, spec.base));
  const [, , width, height] = viewBoxOf(baseSrc);
  const base = themedSvg(baseSrc, roleColors(tokens, tokens.graphic, theme, 'page'), { tokens, theme });
  const lk = spec.lockup;
  const lockSrc = readText(path.join(mdir, lk.from));
  const [, , , lh] = viewBoxOf(lockSrc);
  const mark = lockSrc.match(/<g\b[\s\S]*?<\/g>/)[0].replaceAll('currentColor', role(lk.markRole));
  const t = outlineText(scheme, lockSrc);
  const { role: titleRole, families, weight, ...title } = spec.headline;
  return `${JSON.stringify({
    $note: `由 ${GENERATOR} 从 marks/derived.json 与 ${spec.base}、${lk.from} 生成（色值取自 tokens/color.json 的${theme === 'light' ? '浅色' : '暗色'}），不要手改。字段说明见 tooling/og-card/card.mjs`,
    version: spec.version,
    width,
    height,
    background: role('page'),
    base: svgInner(base),
    lockup: `<g transform="translate(${num(lk.x)} ${num(lk.y)}) scale(${num(lk.height / lh)})">${mark}<path d="${t.d}" fill="${role(lk.textRole)}"/></g>`,
    title: { color: role(titleRole), ...title, stack: families.map((f) => ({ package: packageFor(scheme, f), weight })) },
  }, null, 2)}\n`;
}

/** 作品水印的模板：字标转曲线（颜色留 currentColor，运行时按画面亮度取墨），深浅两种墨取自 token。 */
function deriveWatermark(scheme, mdir, spec) {
  const tokens = loadTokens(scheme);
  const src = readText(path.join(mdir, spec.from));
  const mark = src.match(/<g\b[\s\S]*?<\/g>/)[0];
  const t = outlineText(scheme, src);
  const role = tokens.color.roles[spec.inkRole];
  const { id, title, kind, from, file, inkRole, fakeImages, use, ...params } = spec;
  return `${JSON.stringify({
    $note: `由 ${GENERATOR} 从 marks/derived.json 与 ${from} 生成（墨色取自 tokens/color.json 的 ${inkRole}），不要手改。字段说明见 tooling/watermark/watermark.mjs`,
    art: `${mark}<path d="${t.d}" fill="currentColor"/>`,
    viewBox: viewBoxOf(src),
    ink: { onLight: role.light, onDark: role.dark },
    ...params,
  }, null, 2)}\n`;
}

/** 生成全部文件与清单条目，不写盘。 */
export function generate(scheme) {
  const mdir = path.join(schemeDir(scheme), 'marks');
  const spec = readJson(path.join(mdir, 'derived.json'));
  const files = {}, entries = [];
  for (const a of spec.assets) {
    if (a.kind === 'og-card') {
      const json = deriveCard(scheme, mdir, a);
      files[`marks/${a.file}`] = json;
      entries.push({
        id: a.id,
        title: a.title,
        file: a.file,
        kind: 'json',
        use: a.use,
        samples: a.samples,
        source: { generator: GENERATOR, from: [a.base, a.lockup.from] },
        sha256: sha256(Buffer.from(json)),
      });
      continue;
    }
    if (a.kind === 'watermark') {
      const json = deriveWatermark(scheme, mdir, a);
      files[`marks/${a.file}`] = json;
      entries.push({
        id: a.id,
        title: a.title,
        file: a.file,
        kind: 'json',
        use: a.use,
        fakeImages: a.fakeImages,
        source: { generator: GENERATOR, from: [a.from] },
        sha256: sha256(Buffer.from(json)),
      });
      continue;
    }
    const svg = a.kind === 'og' ? deriveOg(scheme, mdir, a) : deriveOutline(scheme, mdir, a);
    files[`marks/${a.file}`] = svg;
    entries.push({
      id: a.id,
      title: a.title,
      file: a.file,
      kind: 'svg',
      ...(a.kind === 'og'
        ? { colorMode: 'roles', context: 'page', background: 'page' }
        : { colorMode: 'currentColor', colorRole: a.colorRole }),
      use: a.use,
      renders: a.renders ?? [],
      source: { generator: GENERATOR, from: a.kind === 'og' ? [a.base, a.lockup.from] : [a.from] },
      sha256: sha256(Buffer.from(svg)),
    });
  }
  return { files, entries };
}

/** 比较或写入。返回 { changed: [相对方案目录的路径], blocked: [...] }。 */
export function runDerived(args = parseArgs()) {
  const results = [];
  for (const scheme of schemesToBuild(args)) {
    const sdir = schemeDir(scheme);
    if (!existsSync(path.join(sdir, 'marks', 'derived.json'))) continue;
    const { files, entries } = generate(scheme);
    const mpath = path.join(sdir, 'marks', 'manifest.json');
    const manifest = readJson(mpath);
    const byId = new Map(manifest.assets.map((a) => [a.id, a]));
    const changed = [], blocked = [];
    for (const [rel, content] of Object.entries(files)) {
      const p = path.join(sdir, rel);
      if (existsSync(p) && readFileSync(p, 'utf8') === content) continue;
      const e = entries.find((x) => `marks/${x.file}` === rel);
      if (byId.get(e.id)?.status === 'approved') { blocked.push(rel); continue; }
      changed.push(rel);
    }
    // 清单：保留状态、批准记录与备注；新资产记为 proposed；不再派生的条目移除
    const next = manifest.assets.filter((a) => a.source?.generator !== GENERATOR || entries.some((e) => e.id === a.id));
    for (const e of entries) {
      const old = byId.get(e.id);
      if (old?.status === 'approved' && old.sha256 !== e.sha256) continue;
      const keep = old ? { status: old.status, ...(old.approved ? { approved: old.approved } : {}), ...(old.notes ? { notes: old.notes } : {}) } : { status: 'proposed' };
      const merged = { id: e.id, title: e.title, file: e.file, kind: e.kind, ...keep, ...Object.fromEntries(Object.entries(e).filter(([k]) => !['id', 'title', 'file', 'kind'].includes(k))) };
      const i = next.findIndex((a) => a.id === e.id);
      if (i < 0) next.push(merged);
      else next[i] = merged;
    }
    const manifestChanged = JSON.stringify(next) !== JSON.stringify(manifest.assets);
    if (manifestChanged) changed.push('marks/manifest.json');

    if (!args.check) {
      for (const rel of changed) {
        if (rel === 'marks/manifest.json') continue;
        const p = path.join(sdir, rel);
        mkdirSync(path.dirname(p), { recursive: true });
        writeFileSync(p, files[rel]);
      }
      if (manifestChanged) writeFileSync(mpath, JSON.stringify({ ...manifest, assets: next }, null, 2) + '\n');
    }
    const verb = args.check ? '待更新' : '已写入';
    log(`derived ${scheme}: ${Object.keys(files).length} 个派生文件，${changed.length ? `${verb} ${changed.length} 个：${changed.join('、')}` : '与源文件一致'}${blocked.length ? `；已批准、拒绝覆盖：${blocked.join('、')}` : ''}`);
    results.push({ scheme, changed, blocked });
  }
  if (results.some((r) => r.blocked.length)) process.exitCode = 1;
  return results;
}

if (isMain(import.meta.url)) {
  try { runDerived(); } catch (e) { console.error(e.stack || e.message); process.exit(1); }
}
