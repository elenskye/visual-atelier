// 生成「笔势与纸片」的源文件：marks/graphic/*.svg、动效零件的 HTML 片段（三个 expressive 零件与描边绘制、404 入场、文末落款），
// 并更新 marks/manifest.json。
// 只处理带 tokens/graphic.json 的方案。几何见 shapes.mjs，写法见 svg.mjs。
//
// 用法：
//   npm run build:graphic              按 tokens/graphic.json 重新生成并写入方案目录
//   npm run build:graphic -- --check   只比较，不写入（质量检查也用这个）
//
// 保护：清单里已是 approved 的资产，生成结果与文件不同就报错、不覆盖（approved 不改几何与参数，要改开新版本）。
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { parseArgs, schemesToBuild, schemeDir, readJson, sha256, mergeManifestEntry, writeGenerated, log, isMain } from '../lib/common.mjs';
import { graphics, glyph, endMark, contentIcon, CATEGORIES, END_MARKS } from './shapes.mjs';
import { CONTENT_ICONS } from './icons.mjs';
import { staticSvg, inlineSvg } from './svg.mjs';

const GENERATED = '由 tooling/graphic/build.mjs 生成，不要手改';

/** 由 graphic.json 取几何参数。 */
export function geometryParams(graphic) {
  return {
    minWidthRatio: graphic.stroke.minWidthRatio,
    cleanSamplesPerSegment: graphic.stroke.ink.clean.samplesPerSegment,
    press: graphic.stroke.ink.press.params,
  };
}

function fragments(g) {
  const glyphs = CATEGORIES.map(([cat, label]) =>
    `  <span class="va-glyph" data-category="${cat}" title="${label}">${inlineSvg(glyph(cat, { g }), [64, 64], { idPrefix: `va-glyph-${cat}` })}</span>`).join('\n');
  const all = graphics(g);
  const byId = (id) => all.find((x) => x.id === id);
  const deco = byId('section-deco'), enso = byId('loading-enso'), notFound = byId('not-found');
  const strokeCount = (els) => els.filter((e) => e.k === 'stroke').length;
  // 文末落款：三版放在同一个 .va-end-mark 里，每版一个 .va-draw-v2（data-variant），遮罩 id 各用自己的前缀
  const endMarks = (prefix) => END_MARKS.map(([variant, label]) => {
    const els = endMark(variant, { g });
    return `<div class="va-draw-v2" data-variant="${variant}" title="${label}" style="--va-draw-n:${strokeCount(els)}">${inlineSvg(els, [64, 64], { idPrefix: `${prefix}-${variant}` })}</div>`;
  }).join('');
  const singles = Object.fromEntries(CATEGORIES.map(([cat, label]) => [
    `motion/category-glyph-hover/single/${cat}.fragment.html`,
    `<!-- ${GENERATED}。单个分类图形（${label}），遮罩 id 前缀 va-glyph-${cat}-solo；同页多个实例时换成各自唯一的前缀。 -->\n<span class="va-glyph" data-category="${cat}">${inlineSvg(glyph(cat, { g }), [64, 64], { idPrefix: `va-glyph-${cat}-solo` })}</span>\n`,
  ]));
  return {
    ...singles,
    'motion/category-glyph-hover/category-glyph-hover.fragment.html':
      `<!-- ${GENERATED}。六个分类图形；用哪个取哪个。同页多个实例时，遮罩 id（va-glyph-<类别>-m0…）要各自唯一。 -->\n<div class="va-glyph-trigger va-glyph-row">\n${glyphs}\n</div>\n`,
    'motion/section-deco-intro/section-deco-intro.fragment.html':
      `<!-- ${GENERATED}。外层带 is-playing：每次打开网站只写一次（页面 <head> 里配合 section-deco-intro.once.js）；去掉它就是静态图。同页只放一处。 -->\n<div class="va-section-deco is-playing">${inlineSvg(deco.els, deco.viewBox, { idPrefix: 'va-deco' })}</div>\n`,
    'motion/stroke-draw/stroke-draw.fragment.html':
      `<!-- ${GENERATED}。演示：写作的分类图形按笔顺画出（三笔）；用在别的图形上时换成它的片段，--va-draw-n 写它的笔画数。 -->\n<div class="va-draw" style="--va-draw-n:3;width:96px">${inlineSvg(glyph('write', { g }), [64, 64], { idPrefix: 'va-draw' })}</div>\n`,
    'motion/stroke-draw-v2/stroke-draw-v2.fragment.html':
      `<!-- ${GENERATED}。演示：写作的分类图形按笔顺画出（三笔）；用在别的图形上时换成它的片段，--va-draw-n 写它的笔画数。 -->\n<div class="va-draw-v2" style="--va-draw-n:3;width:96px">${inlineSvg(glyph('write', { g }), [64, 64], { idPrefix: 'va-draw2' })}</div>\n`,
    'motion/not-found-intro/not-found-intro.fragment.html':
      `<!-- ${GENERATED}。404 插图：外层带 is-playing，打开页面时写一次（不需要脚本）；去掉它就是静态图。 -->\n<div class="va-draw-v2 va-not-found is-playing" style="--va-draw-n:${strokeCount(notFound.els)}">${inlineSvg(notFound.els, notFound.viewBox, { idPrefix: 'va-404' })}</div>\n`,
    'motion/end-mark/end-mark.fragment.html':
      `<!-- ${GENERATED}。文末落款：三版里由 end-mark.js 每次随机显示一版，第一次滚进视口时写一次；没有脚本时只显示第一版。同页只放一处。 -->\n<div class="va-end-mark" aria-hidden="true">${endMarks('va-end')}</div>\n`,
    'motion/end-mark/end-mark.all.fragment.html':
      `<!-- ${GENERATED}。三版并排（目录页与导出用）；网站用 end-mark.fragment.html。 -->\n<div class="va-end-mark is-all" aria-hidden="true">${endMarks('va-end-all')}</div>\n`,
    'motion/loading-enso/loading-enso.fragment.html':
      `<!-- ${GENERATED}。只在等待时放进页面；等待结束就移除。 -->\n<div class="va-loading-enso" role="status" aria-label="加载中">${inlineSvg(enso.els, enso.viewBox, { idPrefix: 'va-enso' })}</div>\n`,
  };
}

/** 生成全部文件与清单条目，不写盘。 */
export function generate(scheme) {
  const sdir = schemeDir(scheme);
  const graphic = readJson(path.join(sdir, 'tokens', 'graphic.json'));
  const g = geometryParams(graphic);
  const files = {};
  const entries = [];
  for (const x of graphics(g)) {
    const file = `graphic/${x.id}.svg`;
    const svg = staticSvg(x.els, x.viewBox, { paperFallback: x.paperFallback });
    files[`marks/${file}`] = svg;
    const [w, h] = x.viewBox;
    const square = w === h;
    const renders = square
      ? [{ size: w === 64 ? 256 : 264, themes: ['light', 'dark'] }]
      : [{ width: w, height: h, themes: ['light', 'dark'] }];
    entries.push({
      id: x.id,
      title: x.title,
      file,
      kind: 'svg',
      colorMode: 'roles',
      context: x.context,
      ...(['og-graphic', 'og-card-graphic', 'ppt-cover', 'ppt-section'].includes(x.id) ? { background: 'page' } : {}),
      viewBox: x.viewBox,
      ink: x.ink,
      use: x.use,
      renders,
      source: { generator: 'tooling/graphic/build.mjs', rules: 'DESIGN.md §4「笔势与纸片」' },
      sha256: sha256(Buffer.from(svg)),
    });
  }
  Object.assign(files, fragments(g));
  // 内容图标清单：名字、中英文标签与关键词，加一份可直接内联的 SVG（与 marks/graphic/icon-<名>.svg 同一份几何）
  const iconsJson = JSON.stringify({
    $note: `${GENERATED}。内容图标（DESIGN.md §6）：Markdown 写 :名字:，只认这里列出的名字。svg 不写死颜色，内联时引入 marks/graphic/graphic.css（.va-graphic 给出 --va-ink 与 --va-paper）；没有它时笔势跟随文字颜色，纸片不画。`,
    syntax: ':name:',
    viewBox: [64, 64],
    icons: CONTENT_ICONS.map((icon) => ({
      name: icon.name,
      file: `graphic/icon-${icon.name}.svg`,
      label: { zh: icon.zh, en: icon.en },
      keywords: icon.keywords,
      svg: staticSvg(contentIcon(icon, { g }), [64, 64], { paperFallback: 'none' })
        .replace(' aria-hidden="true">', ' class="va-graphic va-icon-svg" aria-hidden="true" focusable="false">').replace(/\n\s*/g, ''),
    })),
  }, null, 2) + '\n';
  files['marks/icons.json'] = iconsJson;
  entries.push({
    id: 'content-icons', title: '内容图标清单', file: 'icons.json', kind: 'json',
    use: '网站把 Markdown 里的 :名字: 换成内联图标；Pomelo「呦呦漫游」编辑器复制它做图标选择器',
    source: { generator: 'tooling/graphic/build.mjs', rules: 'DESIGN.md §6「内容图标」' },
    sha256: sha256(Buffer.from(iconsJson)),
  });
  return { files, entries };
}

/** 比较或写入。返回 { changed: [相对方案目录的路径], blocked: [...] }。 */
export function runGraphic(args = parseArgs()) {
  const results = [];
  for (const scheme of schemesToBuild(args)) {
    const sdir = schemeDir(scheme);
    if (!existsSync(path.join(sdir, 'tokens', 'graphic.json'))) continue;
    const { files, entries } = generate(scheme);
    const mpath = path.join(sdir, 'marks', 'manifest.json');
    const manifest = readJson(mpath);
    const byId = new Map(manifest.assets.map((a) => [a.id, a]));
    const changed = [], blocked = [];
    for (const [rel, content] of Object.entries(files)) {
      const p = path.join(sdir, rel);
      const cur = existsSync(p) ? readFileSync(p, 'utf8') : null;
      if (cur === content) continue;
      const id = rel.startsWith('marks/graphic/') ? path.basename(rel, '.svg') : rel === 'marks/icons.json' ? 'content-icons' : null;
      if (id && byId.get(id)?.status === 'approved') { blocked.push(rel); continue; }
      changed.push(rel);
    }
    // 清单：保留状态、批准记录与备注，其余字段以生成结果为准；新资产记为 proposed
    let manifestChanged = false;
    const next = manifest.assets.filter((a) => a.source?.generator !== 'tooling/graphic/build.mjs' || entries.some((e) => e.id === a.id));
    for (const e of entries) {
      const old = byId.get(e.id);
      if (old?.status === 'approved' && old.sha256 !== e.sha256) continue;
      const merged = mergeManifestEntry(old, e);
      const i = next.findIndex((a) => a.id === e.id);
      if (i < 0) { next.push(merged); manifestChanged = true; }
      else if (JSON.stringify(next[i]) !== JSON.stringify(merged)) { next[i] = merged; manifestChanged = true; }
    }
    if (next.length !== manifest.assets.length) manifestChanged = true;
    if (manifestChanged) changed.push('marks/manifest.json');

    if (!args.check) writeGenerated(sdir, files, changed, mpath, manifest, manifestChanged ? next : null);
    const verb = args.check ? '待更新' : '已写入';
    log(`graphic ${scheme}: ${Object.keys(files).length} 个生成文件，${changed.length ? `${verb} ${changed.length} 个：${changed.join('、')}` : '与源文件一致'}${blocked.length ? `；已批准、拒绝覆盖：${blocked.join('、')}` : ''}`);
    results.push({ scheme, changed, blocked });
  }
  if (results.some((r) => r.blocked.length)) process.exitCode = 1;
  return results;
}

if (isMain(import.meta.url)) {
  try { runGraphic(); } catch (e) { console.error(e.stack || e.message); process.exit(1); }
}
