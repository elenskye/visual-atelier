// 由方案源生成 Claude Design System 的文件，写到 dist/<方案>/design-system/：
//   project/  要发布到 Design System 的文件：index（design-system.json）、tokens.json、README、组件、资产说明
//   upload/   要作为资产上传的图片，取自方案的 marks/（roles 图形取 build:marks 生成的 themed 版本）
// 只处理有 design-system/ 目录的方案。数值来自 tokens/，说明与组件来自 design-system/，上传记录来自 design-system/published.json。
// 用法：npm run build:ds；要按另一个账号的那份生成 index：npm run build:ds -- --scheme <方案> --account <账号名>
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { ROOT, parseArgs, schemesToBuild, schemeDir, outRoot, readJson, readText, loadTokens, paletteIds, motionParts, sha256, walk, writeFile, copyFile, log, isMain } from '../lib/common.mjs';
import { bundleClassic, selfTest } from './bundle.mjs';
import { tokensCss } from './tokens-css.mjs';
import { textureDataUri } from '../handmade/texture.mjs';

const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const MEDIA = { '.svg': 'image/svg+xml', '.png': 'image/png' };
const PREVIEW_CAP = 256 * 1024;

// rgb(27 29 28 / 0.08) → rgba(27, 29, 28, 0.08)：同一个颜色，换成 Design System 读得懂的写法
const toRgba = (s) => s.replace(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/g, 'rgba($1, $2, $3, $4)');

export function buildTokensJson(scheme, t, config, version, { localFonts = [] } = {}) {
  const usage = (name) => {
    if (!config.usage[name]) throw new Error(`${scheme}: tokens.config.json 缺少 ${name} 的用途说明`);
    return config.usage[name];
  };
  const entry = (name, value) => ({ name, value, usage: usage(name) });
  const colorTokens = Object.entries(t.targets.web.colorVars).map(([role, v]) => {
    const r = t.color.roles[role];
    return entry(v.slice(2), { light: r.light, dark: r.dark });
  });
  for (const [alias, role] of Object.entries(t.color.aliases ?? {})) {
    colorTokens.push(entry(`color-${alias}`, `{${t.targets.web.colorVars[role].slice(2)}}`));
  }
  const list = (prefix, obj) => ({ tokens: Object.entries(obj).map(([k, v]) => entry(`${prefix}-${k}`, v)) });
  const shadow = { tokens: Object.entries(t.scale.shadow).map(([k, v]) => entry(`shadow-${k}`, { light: toRgba(v.light), dark: toRgba(v.dark) })) };
  // localFonts：只在本机有的系统字体（方案 type/fonts.json 的 native）。Google Fonts 上没有，看画布的工具别去那儿取。
  const meta = { source: 'visual-atelier', scheme, schemeVersion: version, ...(localFonts.length ? { localFonts } : {}) };
  // 下面三样都是 tokens.config.json 里写了才有（Peck 用到；没写的方案照旧）：
  //   themes：主题和顺序，第一个是 Design System 的第一主题（默认浅色在前）
  //   fonts：随 Design System 打包的字体文件（[{ family, file, weight, style }]，file 相对 project/，源文件在方案的 type/<file>）
  //   scaleGroups：scale.json 里额外出成 token 的组，如 { "size": {}, "step": { "field": "size" } }（field：值是对象时取哪一项）
  const out = {
    name: config.title ?? scheme,
    version: 1,
    meta,
    color: { themes: config.themes ?? [{ id: 'light', name: '浅色' }, { id: 'dark', name: '暗色' }], tokens: colorTokens },
    type: { fonts: (config.fonts ?? []).map(({ family, file, weight, style }) => ({ family, file, weight, style })), families: { ...t.scale.font }, groups: config.typeGroups },
    spacing: list('space', t.scale.space),
    radius: list('radius', t.scale.radius),
    shadow,
    width: list('width', t.scale.width),
    text: list('text', t.scale.text),
  };
  if (t.scale.leading) out.leading = list('leading', t.scale.leading);
  for (const [group, { field } = {}] of Object.entries(config.scaleGroups ?? {})) {
    if (!t.scale[group]) throw new Error(`${scheme}: tokens.config.json 的 scaleGroups 要 ${group}，可是 scale.json 没有`);
    out[group] = { tokens: Object.entries(t.scale[group]).map(([k, v]) => entry(`${group}-${k}`, field ? v[field] : v)) };
  }
  // 没有圆角的方案（Peck 用像素阶梯角）不出空的 radius 组
  if (!out.radius.tokens.length) delete out.radius;
  // 名字规则与唯一性（type 之外共用一个命名空间）
  const names = [];
  for (const [k, fam] of Object.entries(out)) if (fam?.tokens) names.push(...fam.tokens.map((x) => x.name));
  for (const n of names) if (!NAME.test(n)) throw new Error(`${scheme}: token 名不合法 ${n}`);
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  if (dup.length) throw new Error(`${scheme}: token 重名 ${dup.join(', ')}`);
  for (const [k, stack] of Object.entries(out.type.families)) {
    if (stack.length > 200 || /[;{}<>\\()]/.test(stack)) throw new Error(`${scheme}: 字体栈 ${k} 超长或含不允许的字符`);
  }
  for (const g of out.type.groups) for (const s of g.styles) if (!NAME.test(s.name)) throw new Error(`${scheme}: 字体样式名不合法 ${s.name}`);
  return out;
}

/** 随 Design System 打包的字体（tokens.json 的 type.fonts）写成 @font-face，接在 tokens.css 最后；路径相对 tokens.css。没有就是空串。 */
export function fontFaces(t) {
  const faces = t.type.fonts.map((f) => `@font-face { font-family: "${f.family}"; src: url("${f.file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }`);
  return faces.length ? faces.join('\n') + '\n' : '';
}

/** 展开 <!-- @include path --> 与 /* @include path *\/（路径相对方案目录），以及 @asset-data:path（内联成 data URI）。 */
export function expand(text, sdir) {
  const inc = (p) => readText(path.join(sdir, p)).replace(/\s+$/, '');
  return text
    .replace(/<!-- @include ([^ ]+) -->/g, (_, p) => inc(p))
    .replace(/\/\* @include ([^ ]+) \*\//g, (_, p) => inc(p))
    .replace(/@asset-data:([A-Za-z0-9_./-]+)/g, (_, p) => `data:${MEDIA[path.extname(p)]};base64,${readFileSync(path.join(sdir, p)).toString('base64')}`);
}

/**
 * 多套配色的方案：tokens.json 只放默认那套的明暗（Design System 最多 8 套主题；站主 2026-11-07 定），
 * 其余各套写成 data-palette 的变量块，插进 bundle.css 的 / * @generate palettes * / 处（名字和 tokens.json 一样）。
 * data-palette 和 data-theme 写在同一个元素、或谁套着谁都行；默认那套不写块：不写 data-palette 就是它。
 * 每套先写暗色块、再写浅色块：两个都只差一层时，元素自己写的 data-theme="light" 要压过祖先的 dark。
 */
export function paletteCss(t) {
  const vars = t.targets.web.colorVars;
  const lines = (id, mode) => Object.entries(vars).map(([role, v]) => `  ${v}: ${t.color.paletteRoles[id][role][mode]};`).join('\n');
  const out = [];
  for (const id of paletteIds(t)) {
    if (!id || id === t.color.defaultPalette) continue;
    const p = `[data-palette="${id}"]`;
    out.push(`${p}[data-theme="dark"],\n[data-theme="dark"] ${p},\n${p} [data-theme="dark"] {\n${lines(id, 'dark')}\n}`);
    out.push(`${p},\n${p}[data-theme="light"],\n${p} [data-theme="light"] {\n${lines(id, 'light')}\n}`);
  }
  return out.join('\n\n');
}

// 打包了 tooling/handmade/paint.mjs 的方案：命名空间上加 paint、paintLive、color、roles。
const PAINT_ENTRY = `NS.color = (role) => 'var(' + (CONFIG.vars[role] || '--color-' + role) + ')';
NS.roles = Object.keys(CONFIG.vars);
NS.presets = CONFIG.presets || {};
const withDefaults = (o) => Object.assign({ params: CONFIG.params, presets: NS.presets, color: NS.color, roles: NS.roles }, o || {});
NS.paint = (root, o) => paint(root || document, withDefaults(o));
NS.paintLive = (root, o) => paintLive(root || document, withDefaults(o));`;

// 打包前后逐字比较的样例：每个导出的画法各一两个（参数只用 JSON；{ $export } 指模块里导出的常量）
const handmadeCases = (p) => [
  ['handStroke', [[['M', 2, 3], ['C', 20, 0, 40, 9, 60, 4]], { amp: 0.8, seed: 5 }]],
  ['handFill', [[['M', 0, 0], ['L', 30, 0], ['L', 30, 20], ['L', 0, 20], ['Z']], { amp: 0.4, seed: 2 }]],
  ['wob', [236, 40, { r: 11, amp: 0.6, sw: 1.6, seed: 1410, fill: 'var(--color-card)', pad: 4 }]],
  ['wob', [1140, 716, { r: 10, amp: 1.1, sw: 1.9, seed: 1440 }]],
  ['hline', [300, { seed: 3, sw: p.rule.lineWidth, amp: p.rule.amp }]],
  ['marker', [120, { seed: 5 }]],
  ['strike', [80, { seed: 9 }]],
  ['tapes', [300, 160, 7, 2, [['#C4EDD9', '#A6E3C6'], ['#FFE38A', '#FFD23F']]]],
  ['stitches', [400, { seed: 3, gap: p.stitch.gap, len: p.stitch.len }]],
  ['checkboxSvg', [{ seed: 1400 }]],
  ['ratingStarSvg', [{ seed: 1350 }]],
  ['paperStarSvg', [{ seed: 1201, gold: true }]],
  ['paperStarSvg', [{ seed: 1202 }]],
  ['switchSvg', [{ seed: 1370 }]],
  ['glyphSvg', [{ d: 'M16 16 L20.5 20.5', o: [[10.5, 10.5, 6]], seed: 3, ic: p.uiIcon }]],
  ['textureSvg', [p.texture]],
  ['stickerSvg', [{ $export: 'STICKER_STAR' }, p.sticker, { ink: '#2340A8', white: '#FFFFFF', shadow: 'rgba(38,52,28,.30)', blush: '#FFA3B8', cats: { orange: '#FF9A3C' } }, { idp: 't' }]],
];

/**
 * 用哪份发布记录生成 index。published.json 顶层是建它的那个账号的记录（account、url、createdOnFiles、lastChange、assets）；
 * 别的账号在自己账号里另发的一份记在 copies[账号名] 里，字段一样（资产在新账号里有新 id）。
 * 不写 --account 用顶层那份；写了就用那个账号的，没有这条记录就停下。
 */
export function pickRecord(published, account, scheme = '') {
  if (!published || !account || account === true || account === published.account) return published;
  const copy = published.copies?.[account];
  if (!copy) throw new Error(`${scheme}: published.json 里没有「${account}」的记录（顶层是 ${published.account}；别的账号记在 copies 里）`);
  return { ...copy, account };
}

/** 动效零件的 CSS：方案 motion/ 下每个零件自己的 CSS，按 id 排，插进 bundle.css 的 / * @generate motion * / 处（同一份，不另写）。 */
export function motionCss(sdir, { approvedOnly = false } = {}) {
  return motionParts(sdir).filter(({ spec }) => !approvedOnly || spec.status === 'approved')
    .map(({ id, dir, spec }) => `/* ---------- 动效 · ${spec.title}（${id}，${spec.tier}） ---------- */\n` + readText(path.join(dir, spec.files.css)).trim())
    .join('\n\n');
}

/**
 * Design System 的 tokens.json、tokens.css、bundle.css、bundle.js，只算不写文件。build:ds 写发布用的文件；
 * 动效的逐帧导出和 bench 的 Motion Deck拿它当页面的底（motion: false：bundle.css 不插动效，零件自己的 CSS 另放）。
 */
export async function dsRuntime(scheme, { motion = true, selfCheck = false } = {}) {
  // motion：true 全部零件；'approved' 只放 approved 的（给消费方的那份）；false 不放
  const sdir = schemeDir(scheme);
  const src = path.join(sdir, 'design-system');
  const t = loadTokens(scheme);
  const meta = readJson(path.join(sdir, 'scheme.json'));
  const system = readJson(path.join(src, 'system.json'));
  const cfg = { ...readJson(path.join(src, 'tokens.config.json')), title: system.title };
  const fontsPath = path.join(sdir, 'type/fonts.json');
  const localFonts = existsSync(fontsPath) ? (readJson(fontsPath).native ?? []).flatMap((x) => [x.alias, x.family].filter(Boolean)) : [];
  const tokensJson = buildTokensJson(scheme, t, cfg, meta.version, { localFonts });
  let css = expand(readText(path.join(src, 'bundle.css')), sdir);
  if (css.includes('/* @generate palettes */')) {
    if (!t.color.palettes) throw new Error(`${scheme}: bundle.css 要插配色，可是 color.json 没有 palettes`);
    css = css.replace('/* @generate palettes */', paletteCss(t));
  }
  if (css.includes('/* @generate motion */')) css = css.replace('/* @generate motion */', () => (motion ? motionCss(sdir, { approvedOnly: motion === 'approved' }) : ''));
  // 纸纹的那一小块：照 tokens/handmade.json 的 texture 算出来，内联成 data URI（不另存文件）
  if (css.includes('@texture-data')) {
    if (!t.handmade?.texture?.tile) throw new Error(`${scheme}: bundle.css 要纸纹，可是 handmade.json 的 texture 没有 tile`);
    css = css.replace('@texture-data', textureDataUri(t.handmade.texture));
  }
  if (/<\/style/i.test(css)) throw new Error(`${scheme}: bundle.css 里不能有 </style`);
  const ns = system.namespace;
  if (!/^[A-Za-z_$][\w$]*$/.test(ns)) throw new Error(`${scheme}: system.json 的 namespace 要是 JS 标识符，现在是 ${ns}`);
  let bundleJs;
  const usesPaint = !!system.bundle?.modules.some((m) => m.endsWith('handmade/paint.mjs'));
  if (system.bundle) {
    // 带画法的方案：把 tooling/ 里的模块原样打包成 bundle.js，再在 vm 里和模块本身逐字比一遍
    const { modules, params: paramsFile, presets = {} } = system.bundle;
    const params = Object.fromEntries(Object.entries(readJson(path.join(sdir, paramsFile))).filter(([k]) => !k.startsWith('$')));
    const { code } = bundleClassic({ root: ROOT, namespace: ns, title: system.title, modules, config: { params, presets, vars: t.targets.web.colorVars }, entry: usesPaint ? PAINT_ENTRY : '' });
    if (usesPaint && selfCheck) await selfTest({ root: ROOT, code, namespace: ns, modules, cases: handmadeCases(params) });
    bundleJs = code;
  } else {
    // 组件都是静态预览，没有 JS 组件；但 Design System 页没有 components/bundle.js 就不跑预览（2026-11-06 发现），
    // 所以写一个只声明命名空间的 bundle。
    bundleJs = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: ns, components: [] })} */\nwindow.${ns} = window.${ns} || {};\n`;
  }
  return { tokensJson, tokensCss: tokensCss(tokensJson), bundleCss: css, bundleJs, namespace: ns, paints: usesPaint };
}

/**
 * 给消费方（Pomelo）的一份样式：Design System 的变量 + bundle.css（组件的样子和 approved 的动效零件），同一份源，不另写。
 * 去掉排字的类名（.body、.small……，太常见，会碰到消费方自己的类名）和 omitVars 里和消费方同名的变量（Pomelo 的 Tailwind 有
 * --leading-tight、--leading-loose）。不进 project/，不发布到 Design System；sync.json 登记后同步过去。
 */
export async function consumerCss(scheme, { omitVars = [] } = {}) {
  const rt = await dsRuntime(scheme, { motion: 'approved' });
  const omit = new Set(omitVars.map((v) => `--${v}`));
  const vars = rt.tokensCss.split('\n').filter((line) => !/^\.[A-Za-z]/.test(line) && !omit.has(line.trim().split(':')[0])).join('\n');
  return `/* ${scheme} 的 Design System 样式（消费方用）：tokens 的变量 + components/bundle.css。由 tooling/design-system/build.mjs 生成，不手改。 */\n${vars}\n${rt.bundleCss}`;
}

export async function runDesignSystem(args = parseArgs()) {
  const built = [];
  for (const scheme of schemesToBuild(args)) {
    const sdir = schemeDir(scheme);
    const src = path.join(sdir, 'design-system');
    if (!existsSync(src)) continue;
    const out = path.join(outRoot(args), scheme, 'design-system');
    const project = path.join(out, 'project');
    const system = readJson(path.join(src, 'system.json'));
    const publishedPath = path.join(src, 'published.json');
    const published = pickRecord(existsSync(publishedPath) ? readJson(publishedPath) : null, args.account, scheme);

    const rt = await dsRuntime(scheme, { selfCheck: true });
    writeFile(path.join(project, 'tokens.json'), JSON.stringify(rt.tokensJson, null, 2) + '\n');
    // 第一份 tokens.css 由我们写（Design System 页只在有人在页面上保存时才生成它，之前读的人拿不到）。
    // 第一行照格式要求写「<名字> — generated from tokens.json」，页面以后保存时会接手这份文件。
    writeFile(path.join(project, 'tokens.css'), `/* ${system.title} — generated from tokens.json */\n` + rt.tokensCss + fontFaces(rt.tokensJson));
    for (const f of rt.tokensJson.type.fonts) {
      const from = path.join(sdir, 'type', f.file);
      if (!existsSync(from)) throw new Error(`${scheme}: 找不到字体文件 ${path.relative(process.cwd(), from)}（tokens.config.json 的 fonts）`);
      copyFile(from, path.join(project, f.file));
    }
    writeFile(path.join(project, 'README.md'), readText(path.join(src, 'README.md')));
    writeFile(path.join(project, 'components/bundle.css'), rt.bundleCss);
    writeFile(path.join(project, 'components/bundle.js'), rt.bundleJs);
    if (system.consumer?.css) writeFile(path.join(out, 'consumer.css'), await consumerCss(scheme, system.consumer));
    for (const f of walk(path.join(src, 'components'))) {
      const rel = path.relative(src, f);
      if (f.endsWith('.html')) {
        const html = expand(readText(f), sdir);
        if (Buffer.byteLength(html) > PREVIEW_CAP) throw new Error(`${rel} 超过 256 KB`);
        if (/<(iframe|frame|object|embed|portal|noscript)\b/i.test(html)) throw new Error(`${rel} 含不允许的元素`);
        writeFile(path.join(project, rel), html);
      } else copyFile(f, path.join(project, rel));
    }
    for (const f of walk(path.join(src, 'assets'))) copyFile(f, path.join(project, path.relative(src, f)));

    // 资产：源文件取自 marks/，render 取 build:marks 导出的 PNG；复制到 upload/，并对照上传记录。
    // 记录里的 size 是资产库实际保存的字节数（资产库会改写 SVG 的写法，和源文件不一定一样）。
    const manifest = readJson(path.join(sdir, 'marks/manifest.json'));
    const byId = new Map(manifest.assets.map((a) => [a.id, a]));
    const assetGroups = {};
    const missing = [];
    for (const g of system.assetGroups) {
      const files = {};
      for (const { id, name, render, themed } of g.assets) {
        const a = byId.get(id);
        if (!a) throw new Error(`${scheme}: system.json 引用了清单里没有的资产 ${id}`);
        // render：build:marks 导出的 PNG；themed：roles 图形上好色的 SVG（light / dark）；都没有就用源文件
        const from = render ? path.join(outRoot(args), scheme, 'marks/png', render)
          : themed ? path.join(outRoot(args), scheme, 'marks/themed', `${id}-${themed}.svg`)
          : path.join(sdir, 'marks', a.file);
        if (!existsSync(from)) throw new Error(`${scheme}: 找不到 ${path.relative(process.cwd(), from)}，先运行 npm run build:marks`);
        const buf = readFileSync(from);
        const key = `${g.name}/${name}`;
        writeFile(path.join(out, 'upload', g.name, name), buf);
        const rec = published?.assets?.[key];
        if (!rec || rec.sha256 !== sha256(buf)) { missing.push(key); continue; }
        files[name] = { name, blob: rec.blob, size: rec.size, type: MEDIA[path.extname(name)] };
      }
      assetGroups[g.name] = { name: g.name, tile: g.tile, order: g.assets.map((x) => x.name), files };
    }

    if (missing.length || !published?.createdOnFiles) {
      log(`ds      ${scheme} → ${path.relative(process.cwd(), out)}（没写 index：${missing.length} 个资产和云端的上传记录对不上，bench 按记录补出来、图片用本机的；要更新云端时先上传 upload/ 里的文件，把记录写进 design-system/published.json）`);
    } else {
      const index = {
        v: 3,
        layout: 'files',
        createdOnFiles: published.createdOnFiles,
        title: system.title,
        namespace: system.namespace,
        libraries: [],
        sections: {},
        groups: system.assetGroups.map((g) => g.name),
        assetGroups,
        blobs: {},
        docs: { sections: [] },
        lastChange: { by: system.by, via: system.via, at: published.lastChange.at, note: published.lastChange.note },
      };
      writeFile(path.join(project, 'design-system.json'), JSON.stringify(index, null, 2) + '\n');
      log(`ds      ${scheme} → ${path.relative(process.cwd(), out)}${published.account ? `（index 按「${published.account}」的记录：${published.url}）` : ''}`);
    }
    built.push({ scheme, out, missing });
  }
  return built;
}

if (isMain(import.meta.url)) {
  runDesignSystem().catch((e) => { console.error(e.message); process.exit(1); });
}
