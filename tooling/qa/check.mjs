// 质量检查。fail 让进程退出码非 0；warn / info 只提示。
// 用法：npm run qa  或  npm run qa -- --origin ~/Documents/GitHub/personal-website
import path from 'node:path';
import os from 'node:os';
import { readdirSync, existsSync, statSync, readFileSync } from 'node:fs';
import { calcAPCA } from 'apca-w3';
import { ROOT, parseArgs, schemesToBuild, schemeDir, outRoot, readJson, readText, loadTokens, resolveColor, paletteIds, extractBlock, parseVars, sha256, walk, writeFile, log, isMain } from '../lib/common.mjs';
import { buildWebCss } from '../tokens/build.mjs';
import { diffPng } from '../lib/gif.mjs';
import { runGraphic } from '../graphic/build.mjs';
import { runDerived } from '../marks/derive.mjs';
import { runHandmadeMarks } from '../handmade/marks.mjs';
import { renderCardSvg, NO_START, NO_END } from '../og-card/card.mjs';

const expand = (p) => p.replace(/^~(?=$|\/)/, os.homedir());
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif']);
const MB = 1024 * 1024;

export async function runQa(args = parseArgs()) {
  const origin = typeof args.origin === 'string' ? expand(args.origin) : null;
  const report = [];
  // file：这一项说的是哪个文件（相对仓库根目录），bench 的 Checks 页点了能看图
  const add = (scheme, group, name, status, detail = '', file = null) => report.push({ scheme, group, name, status, detail, ...(file ? { file: path.relative(ROOT, file).split(path.sep).join('/') } : {}) });

  for (const scheme of schemesToBuild(args)) {
    const sdir = schemeDir(scheme);
    const tokens = loadTokens(scheme);

    // 1. 资产清单：文件存在、sha256 与迁入时一致
    const mpath = path.join(sdir, 'marks', 'manifest.json');
    if (existsSync(mpath)) {
      const manifest = readJson(mpath);
      for (const a of manifest.assets) {
        const f = path.join(sdir, 'marks', a.file);
        if (!existsSync(f)) { add(scheme, '资产', a.id, 'fail', '文件不存在'); continue; }
        const h = sha256(readFileSync(f));
        add(scheme, '资产', `${a.id} 校验和`, h === a.sha256 ? 'pass' : 'fail', h === a.sha256 ? '与迁入时一致' : '与清单不一致（被改动过？）');
        if (!['draft', 'proposed', 'approved'].includes(a.status)) add(scheme, '资产', `${a.id} 状态`, 'fail', `未知状态 ${a.status}`);
        // 2. 只读对照网站现用的文件（需要 --origin），发现网站被手改或没跟上；已被新资产取代（supersededBy）的不再对照
        if (origin && a.origin && !a.supersededBy) {
          const of = path.join(origin, a.origin.path);
          if (!existsSync(of)) add(scheme, '网站对照', a.id, 'warn', '网站里没有这个文件（可能已移走或改用复制件）');
          else if (a.origin.inline) {
            // 从页面内联 SVG 提取的资产没有独立文件，只核对关键几何仍在网站页面里
            const src = readText(of);
            const missing = (a.origin.contains ?? []).filter((s) => !src.includes(s));
            add(scheme, '网站对照', `${a.id} 与网站内联图形一致`, missing.length ? 'warn' : 'pass', missing.length ? `网站里找不到：${missing.join('；')}` : '关键几何一致');
          } else add(scheme, '网站对照', `${a.id} 与网站现用文件一致`, sha256(readFileSync(of)) === h ? 'pass' : 'warn', sha256(readFileSync(of)) === h ? '逐字节一致' : '网站的文件与本仓库不一致（被手改过？）');
        }
        // 可着色的 SVG 与样式不得写死颜色
        if ((a.kind === 'svg' && ['currentColor', 'roles'].includes(a.colorMode)) || a.kind === 'css') {
          const svg = readText(f);
          const hard = svg.match(/#[0-9a-fA-F]{3,8}\b/g);
          const how = a.kind === 'css' ? '只用颜色变量' : a.colorMode === 'roles' ? '使用角色变量（--va-*）' : '使用 currentColor';
          add(scheme, '资产', `${a.id} 颜色`, hard ? 'fail' : 'pass', hard ? `写死了颜色 ${[...new Set(hard)].join(', ')}` : how);
        }
      }
    }

    // 1b. 图形语言的源文件与生成器一致（只比较，不写入）
    if (tokens.graphic) {
      const log0 = console.log; console.log = () => {};
      let r;
      try { r = runGraphic({ ...args, scheme, check: true })[0]; } finally { console.log = log0; }
      add(scheme, '资产', '图形语言源文件与生成器一致', r.changed.length || r.blocked.length ? 'warn' : 'pass',
        r.changed.length || r.blocked.length ? `与 npm run build:graphic 的结果不同：${[...r.changed, ...r.blocked].join('、')}` : 'marks/graphic/ 与动效片段都是最新的');
    }

    // 1c. 派生资产（字标转曲线、默认分享图）与生成器一致
    if (existsSync(path.join(schemeDir(scheme), 'marks', 'derived.json'))) {
      const log0 = console.log; console.log = () => {};
      let r;
      try { r = runDerived({ ...args, scheme, check: true })[0]; } finally { console.log = log0; }
      add(scheme, '资产', '派生资产与生成器一致', r.changed.length || r.blocked.length ? 'warn' : 'pass',
        r.changed.length || r.blocked.length ? `与 npm run build:derived 的结果不同：${[...r.changed, ...r.blocked].join('、')}` : '字标转曲线与默认分享图都是最新的');
    }

    // 1c'. 手作的资产（marks/art.mjs）与生成器一致
    if (existsSync(path.join(schemeDir(scheme), 'marks', 'art.mjs'))) {
      const log0 = console.log, err0 = console.error; console.log = () => {}; console.error = () => {};
      let r;
      try { r = (await runHandmadeMarks({ ...args, scheme, check: true, quiet: true }))[0]; } finally { console.log = log0; console.error = err0; }
      add(scheme, '资产', '手作资产与生成器一致', r.changed.length || r.blocked.length ? 'warn' : 'pass',
        r.changed.length || r.blocked.length ? `与 node tooling/handmade/marks.mjs 的结果不同：${[...r.changed, ...r.blocked].join('、')}` : 'marks/ 的 SVG 和清单都是最新的');
    }

    // 1d. 文章分享图：示例标题排得下、守标点禁则，导出的 PNG 尺寸对（体积在下面的预算里查，两次一致由 qa:determinism 查）
    const cardSpec = existsSync(mpath) ? readJson(mpath).assets.filter((a) => a.samples?.length) : [];
    for (const a of cardSpec) {
      const template = readJson(path.join(sdir, 'marks', a.file));
      a.samples.forEach((title, i) => {
        const name = `${a.id} 示例 ${i + 1}`;
        const { layout, lineWidths } = renderCardSvg(template, title);
        const over = Math.max(...lineWidths) - template.title.maxWidth;
        const badLine = layout.lines.find((l) => NO_START.has([...l][0]) || NO_END.has([...l].at(-1)));
        const problems = [...(over > 0 ? [`超出行宽 ${over.toFixed(1)}px`] : []), ...(badLine ? [`标点禁则：${badLine}`] : []), ...(layout.missing.length ? [`缺字 ${layout.missing.join('')}`] : [])];
        add(scheme, '分享图', `${name} 排版`, problems.length ? 'fail' : 'pass', problems.join('；') || `${layout.size}px，${layout.lines.length} 行${layout.truncated ? '，已截断' : ''}`);
        const png = path.join(outRoot(args), scheme, 'marks/png', `${a.id}@sample-${i + 1}.png`);
        if (!existsSync(png)) { add(scheme, '分享图', `${name} 导出`, 'warn', '还没有构建产物，先运行 npm run build'); return; }
        const data = readFileSync(png), w = data.readUInt32BE(16), h = data.readUInt32BE(20);
        add(scheme, '分享图', `${name} 尺寸`, w === template.width && h === template.height ? 'pass' : 'fail', `${w} × ${h}，${Math.round(data.length / 1024)} KB`, png);
      });
      const longest = a.samples.at(-1);
      add(scheme, '分享图', `${a.id} 超长标题截断`, renderCardSvg(template, longest).layout.lines.at(-1)?.endsWith('…') ? 'pass' : 'fail', '最后一个示例要排不下、停在省略号上');
    }

    // 3. token 与网站 global.css 一致（需要 --origin）
    if (origin) {
      const gp = path.join(origin, 'src/styles/global.css');
      if (existsSync(gp)) {
        const css = readText(gp);
        const siteLight = parseVars(extractBlock(css, ':root {'));
        const siteDark = parseVars(extractBlock(css, ":root[data-theme='dark']"));
        const built = buildWebCss(scheme, tokens);
        const mine = { light: parseVars(extractBlock(built, ':root {')), dark: parseVars(extractBlock(built, ":root[data-theme='dark']")) };
        for (const [mode, site] of [['light', siteLight], ['dark', siteDark]]) {
          const wrong = Object.entries(site).filter(([k, v]) => mine[mode][k] !== v);
          add(scheme, 'Token', `web 方言与网站一致（${mode}，${Object.keys(site).length} 个变量）`, wrong.length ? 'fail' : 'pass', wrong.length ? wrong.map(([k, v]) => `${k}: 网站=${v} 本仓库=${mine[mode][k]}`).join('; ') : '全部一致');
        }
      } else add(scheme, 'Token', '与网站对照', 'warn', '没找到 global.css');
    }

    // 4. APCA 对比度
    for (const palette of paletteIds(tokens)) {
      const prefix = palette ? `${tokens.color.palettes[palette].label} · ` : '';
      for (const mode of ['light', 'dark']) {
        for (const p of tokens.contrast.pairs) {
          const fg = resolveColor(tokens, p.fg, mode, palette), bg = resolveColor(tokens, p.bg, mode, palette);
          const lc = Math.abs(calcAPCA(fg, bg));
          add(scheme, '对比度', `${p.use}（${prefix}${mode}）`, lc >= p.min ? 'pass' : (p.target === 'pomelo' ? 'warn' : 'fail'), `Lc ${lc.toFixed(1)}，要求 ≥ ${p.min}（${fg} / ${bg}）`);
        }
      }
    }

    // 5. 体积预算：图片 ≤ 1.5 MB，其他 ≤ 5 MB
    for (const f of walk(sdir)) {
      const size = statSync(f).size; const limit = IMAGE_EXT.has(path.extname(f)) ? 1.5 * MB : 5 * MB;
      if (size > limit) add(scheme, '体积', path.relative(sdir, f), 'fail', `${(size / MB).toFixed(2)} MB 超过 ${limit / MB} MB`, f);
    }
    const dist = path.join(outRoot(args), scheme);
    let distCount = 0, distBad = 0;
    for (const f of walk(dist)) {
      distCount++;
      const size = statSync(f).size; const limit = IMAGE_EXT.has(path.extname(f)) ? 1.5 * MB : 5 * MB;
      if (size > limit) { distBad++; add(scheme, '体积', 'dist/' + path.relative(dist, f), 'fail', `${(size / MB).toFixed(2)} MB 超过 ${limit / MB} MB`, f); }
    }
    add(scheme, '体积', `构建产物 ${distCount} 个文件`, distBad ? 'fail' : (distCount ? 'pass' : 'warn'), distBad ? `${distBad} 个超限` : (distCount ? '均在预算内' : '还没有构建产物，先运行 npm run build'));

    // 6. 动效规则
    const mdir = path.join(sdir, 'motion');
    if (existsSync(mdir)) {
      for (const id of readdirSync(mdir)) {
        const mp = path.join(mdir, id, 'motion.json');
        if (!existsSync(mp)) continue;
        const spec = readJson(mp);
        const css = readText(path.join(mdir, id, spec.files.css));
        const name = spec.id;
        add(scheme, '动效', `${name} 档位`, ['calm', 'expressive'].includes(spec.tier) ? 'pass' : 'fail', `tier = ${spec.tier}`);
        add(scheme, '动效', `${name} 减弱动效回退`, spec.reducedMotion && /prefers-reduced-motion:\s*reduce/.test(css) ? 'pass' : 'fail', spec.reducedMotion || '缺少 reducedMotion 说明或 CSS 回退');
        if (spec.tier === 'calm') {
          const loop = /animation[^;]*\binfinite\b|animation-iteration-count:\s*infinite/.test(css);
          add(scheme, '动效', `${name} 无循环（calm）`, loop ? 'fail' : 'pass');
          const limit = tokens.motion.tiers.calm.maxMsWithoutSignature;
          // 例外：招牌动作（spec.signature），或 tokens/motion.json 的 calmExceptions 登记了这个零件
          const exc = spec.calmException ? tokens.motion.calmExceptions?.[spec.calmException] : null;
          const excOk = exc && exc.parts?.includes(spec.id) && spec.durationMs <= exc.durationMs;
          add(scheme, '动效', `${name} 时长（calm）`, spec.durationMs <= limit || spec.signature || excOk ? 'pass' : 'fail',
            spec.durationMs <= limit ? `${spec.durationMs}ms`
              : spec.signature ? `${spec.durationMs}ms 超过 ${limit}ms，已按「招牌动作」例外`
              : excOk ? `${spec.durationMs}ms 超过 ${limit}ms，已按 calm 例外「${spec.calmException}」（${exc.approved}）`
              : `${spec.durationMs}ms 超过 ${limit}ms，${spec.calmException ? `calm 例外「${spec.calmException}」没有登记这个零件或时长超出` : '没有登记例外'}`);
        } else {
          const ex = tokens.motion.tiers.expressive;
          const reg = tokens.motion.registeredSurfaces?.[spec.surface];
          const ok = ex.registeredSurfaces.includes(spec.surface) && reg;
          add(scheme, '动效', `${name} 已登记（expressive）`, ok ? 'pass' : 'fail', ok ? `表面 ${spec.surface}` : `表面 ${spec.surface ?? '（未写）'} 没有登记在 tokens/motion.json`);
          if (!ok) continue;
          if (spec.loop) {
            const loopCss = /animation[^;]*\binfinite\b/.test(css);
            add(scheme, '动效', `${name} 循环（expressive）`, reg.loop && spec.durationMs === reg.loopMs && loopCss ? 'pass' : 'fail', `一圈 ${spec.durationMs}ms，登记 ${reg.loopMs}ms`);
          } else {
            const limit = Math.min(ex.maxSingleMs, reg.maxMs ?? Infinity);
            const loop = /animation[^;]*\binfinite\b|animation-iteration-count:\s*infinite/.test(css);
            add(scheme, '动效', `${name} 无循环`, loop ? 'fail' : 'pass');
            add(scheme, '动效', `${name} 时长（expressive）`, spec.durationMs <= limit ? 'pass' : 'fail', `${spec.durationMs}ms，上限 ${limit}ms`);
          }
        }
      }
    }

    // 7. 渲染管线核对：app-icon-180.svg 渲染 180px 应与现用 apple-touch-icon.png 接近（仅提示）
    const a = path.join(outRoot(args), scheme, 'marks/png/app-icon-180@180.png');
    const b = path.join(sdir, 'marks/raster/apple-touch-icon.png');
    if (existsSync(a) && existsSync(b)) {
      const d = diffPng(readFileSync(a), readFileSync(b), 8);
      const pct = d.diffPixels / d.total * 100;
      add(scheme, '渲染', 'app-icon 渲染 vs 现用 apple-touch-icon', pct < 3 ? 'pass' : 'warn', `${pct.toFixed(2)}% 像素有差异（抗锯齿边缘），平均偏差 ${d.meanAbsDiff.toFixed(2)}`, a);
    }
  }

  const count = (s) => report.filter((r) => r.status === s).length;
  const icon = { pass: '✔', fail: '✘', warn: '!', info: '·' };
  const groups = [...new Set(report.map((r) => `${r.scheme} · ${r.group}`))];
  for (const g of groups) {
    const rows = report.filter((r) => `${r.scheme} · ${r.group}` === g);
    const show = rows.filter((r) => r.status !== 'pass' || args.verbose);
    log(`\n${g}（${rows.filter((r) => r.status === 'pass').length}/${rows.length} 通过）`);
    for (const r of show) log(`  ${icon[r.status]} ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
  }
  log(`\n通过 ${count('pass')}　失败 ${count('fail')}　提示 ${count('warn')}`);
  for (const scheme of schemesToBuild(args)) writeFile(path.join(outRoot(args), scheme, 'qa-report.json'), JSON.stringify({ generatedBy: 'tooling/qa/check.mjs', origin: !!origin, items: report.filter((r) => r.scheme === scheme) }, null, 2) + '\n');
  if (count('fail')) process.exitCode = 1;
  return report;
}

if (isMain(import.meta.url)) runQa().catch((e) => { console.error(e.message); process.exit(1); });
