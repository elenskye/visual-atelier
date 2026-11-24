// 生成资产目录页 dist/catalog/index.html：把方案里的颜色、标志、插图、动效和检查结果放在一页里浏览。
// 页面用相对路径引用 dist 里的文件，直接双击打开即可（file://），不需要服务器。
// 如果 dist/<方案>/qa-report.json 存在，会把检查结果一并列出；先跑 `npm run qa` 再生成目录即可看到。
import path from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { calcAPCA } from 'apca-w3';
import { parseArgs, schemesToBuild, outRoot, schemeDir, readJson, readText, loadTokens, resolveColor, paletteIds, pageColor, markColorRole, motionParts, walk, writeFile, log, isMain } from '../lib/common.mjs';
import { buildWebCss, buildPomeloCss } from '../tokens/build.mjs';
import { fakeLabel } from '../watermark/fake-images.mjs';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATUS = { approved: '已批准', proposed: '提议中', draft: '草稿' };
const STATUS_ICON = { pass: '✓', fail: '✗', warn: '!' };

function contrastRows(tokens, palette = null) {
  return tokens.contrast.pairs.map((p) => {
    const row = { use: p.use, fg: p.fg, bg: p.bg, min: p.min, provisional: p.target === 'pomelo' };
    for (const mode of ['light', 'dark']) {
      const fg = resolveColor(tokens, p.fg, mode, palette);
      const bg = resolveColor(tokens, p.bg, mode, palette);
      row[mode] = { fg, bg, lc: Math.abs(calcAPCA(fg, bg)) };
    }
    return row;
  });
}

function contrastTable(tokens, palette = null) {
  const rows = contrastRows(tokens, palette).map((r) => {
    const cell = (m) => {
      const ok = r[m].lc >= r.min;
      return `<td class="${ok ? 'ok' : 'bad'}"><span class="sample" style="color:${r[m].fg};background:${r[m].bg}">Aa</span> Lc ${r[m].lc.toFixed(1)} ${ok ? '✓' : '✗'}</td>`;
    };
    return `<tr><td>${esc(r.use)}${r.provisional ? ' <em>（临时）</em>' : ''}</td><td><code>${esc(r.fg)}</code> / <code>${esc(r.bg)}</code></td><td>≥ ${r.min}</td>${cell('light')}${cell('dark')}</tr>`;
  }).join('');
  return `<div class="scroll"><table><thead><tr><th>用途</th><th>前景 / 背景</th><th>要求</th><th>浅色</th><th>深色</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/** 一个颜色角色的卡片：明暗两块色、名字、取值；extra 接在取值后面（网页变量）。 */
const roleCard = (id, r, extra = '') => `
    <div class="role">
      <div class="chips"><span style="background:${r.light}"></span><span style="background:${r.dark}"></span></div>
      <h4>${esc(r.label)} <code>${esc(id)}</code></h4>
      <dl><dt>浅色</dt><dd>${r.light}</dd><dt>深色</dt><dd>${r.dark}</dd>${extra}</dl>
    </div>`;

/** 多套配色：角色一行，每套一列；对比度每套一张，收起来。 */
function paletteSection(tokens) {
  const ids = paletteIds(tokens);
  const head = ids.map((id) => `<th>${esc(tokens.color.palettes[id].label)}${id === tokens.color.defaultPalette ? ' <em>（默认）</em>' : ''}</th>`).join('');
  const rows = Object.keys(tokens.color.roleDefs).map((role) => {
    const cells = ids.map((id) => {
      const r = tokens.color.paletteRoles[id][role];
      return `<td><span class="sample" style="background:${r.light}">&nbsp;</span><span class="sample" style="background:${r.dark}">&nbsp;</span> <code>${esc(r.light)}</code> <code>${esc(r.dark)}</code></td>`;
    }).join('');
    return `<tr><td>${esc(tokens.color.roleDefs[role].label)} <code>${esc(role)}</code></td>${cells}</tr>`;
  }).join('');
  const shared = Object.entries(tokens.color.shared ?? {}).map(([id, r]) => roleCard(id, r)).join('');
  const tables = ids.map((id) => `<details><summary>${esc(tokens.color.palettes[id].label)}</summary>${contrastTable(tokens, id)}</details>`).join('');
  return `
  <h3>颜色</h3>
  <p class="lead">${ids.length} 套配色，每格左边是浅色、右边是深色。下面是各套共用的颜色。</p>
  <div class="scroll"><table><thead><tr><th>角色</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>
  <h4 class="sub">各套共用</h4>
  <div class="roles">${shared}</div>
  <h4 class="sub">对比度（APCA，数值越大越清晰）</h4>
  ${tables}`;
}

function handmadeSection(scheme, out) {
  const files = walk(path.join(out, scheme, 'handmade')).filter((f) => f.endsWith('.svg')).map((f) => path.basename(f));
  if (!files.length) return '';
  return `<h3>手作零件的样张</h3><p class="lead">同一组零件换配色和深浅，全部由 <code>tooling/handmade/</code> 按 <code>tokens/handmade.json</code> 生成。</p>
  <div class="grid">${files.map((f) => `<figure><img src="../${scheme}/handmade/${f}" alt="${esc(f)}" loading="lazy"><figcaption>${esc(f.replace(/\.svg$/, ''))}</figcaption></figure>`).join('')}</div>`;
}

function colorSection(tokens) {
  if (tokens.color.palettes) return paletteSection(tokens);
  const vars = tokens.targets.web.colorVars;
  const cards = Object.entries(tokens.color.roles).map(([id, r]) => roleCard(id, r, `<dt>网页变量</dt><dd>${esc(vars[id] || '—')}</dd>`)).join('');
  return `
  <h3>颜色</h3>
  <p class="lead">每个角色一组明暗取值。左半是浅色，右半是深色。</p>
  <div class="roles">${cards}</div>
  <h4 class="sub">对比度（APCA，数值越大越清晰）</h4>
  ${contrastTable(tokens)}`;
}

function marksSection(scheme, tokens, out) {
  const manifestPath = path.join(schemeDir(scheme), 'marks', 'manifest.json');
  if (!existsSync(manifestPath)) return '';
  const manifest = readJson(manifestPath);
  const pngDir = path.join(out, scheme, 'marks', 'png');
  const pngs = existsSync(pngDir) ? readdirSync(pngDir).sort() : [];
  const tile = (mode, inner) => `<div class="tile" style="background:${pageColor(tokens, mode)}">${inner}</div>`;
  // 分享图、水印模板的示例图：[文件名（marks/png/ 下）, alt]
  const samples = (items) => `<div class="tiles card-samples">${items.map(([file, alt]) => `<a href="../${scheme}/marks/png/${file}"><img src="../${scheme}/marks/png/${file}" alt="${alt}" loading="lazy"></a>`).join('')}</div>`;
  const cards = manifest.assets.map((a) => {
    const href = `../${scheme}/marks/${a.file}`;
    let visual;
    if (a.kind === 'svg' && a.colorMode === 'roles') {
      // 底色：方案的页面色（Pomelo 叫 desk，见 color.json 的 pageRole）；方案没有 surface 时也用它
      const pageRoleName = tokens.color.pageRole ?? 'page';
      const bgRole = a.context === 'surface' && tokens.color.roles.surface ? 'surface' : pageRoleName;
      const themed = (mode) => `<div class="tile${a.viewBox?.[0] >= 400 ? ' wide' : ''}" style="background:${tokens.color.roles[bgRole][mode]}"><img src="../${scheme}/marks/themed/${a.id}-${mode}.svg" alt="${esc(a.title)}（${mode === 'light' ? '浅色' : '深色'}）"></div>`;
      visual = `<div class="tiles">${themed('light')}${themed('dark')}</div>`;
    } else if (a.samples?.length) {
      visual = samples(a.samples.map((title, i) => [`${a.id}@sample-${i + 1}.png`, `示例：${esc(title)}`]));
    } else if (a.fakeImages?.length) {
      visual = samples(a.fakeImages.map((kind) => [`${a.id}@sample-${kind}.jpg`, `假图示例：${esc(fakeLabel(kind))}`]));
    } else if (a.kind === 'css' || a.kind === 'json') {
      visual = `<div class="tiles one"><div class="tile"><code>${esc(path.basename(a.file))}</code></div></div>`;
    } else if (a.kind === 'svg' && a.colorMode === 'currentColor') {
      const svg = readText(path.join(schemeDir(scheme), 'marks', a.file));
      const colored = (mode) => `<div style="color:${tokens.color.roles[markColorRole(tokens, a)][mode]}">${svg}</div>`;
      visual = `<div class="tiles">${tile('light', colored('light'))}${tile('dark', colored('dark'))}</div>`;
    } else if (a.kind === 'svg') {
      const mode = a.id.endsWith('white') ? 'dark' : 'light';
      visual = `<div class="tiles one">${tile(mode, `<img src="${href}" alt="${esc(a.title)}">`)}</div>`;
    } else {
      visual = `<div class="tiles one"><div class="tile checker"><img class="raster" src="${href}" alt="${esc(a.title)}"></div></div>`;
    }
    const renders = pngs.filter((f) => f.startsWith(`${a.id}@`)).map((f) => `<a href="../${scheme}/marks/png/${f}">${esc(f.replace(/\.(png|jpg)$/, ''))}</a>`).join(' · ');
    return `
    <article class="card">
      ${visual}
      <div class="meta">
        <h4>${esc(a.title)} <span class="pill ${esc(a.status)}">${esc(STATUS[a.status] || a.status)}</span></h4>
        <p class="small"><code>${esc(a.id)}</code> · <a href="${href}">${esc(a.file)}</a></p>
        ${a.kind === 'svg' ? `<p class="small">颜色：${a.colorMode === 'currentColor' ? `跟随使用处（${a.colorRole ? `<code>${esc(a.colorRole)}</code>` : `没写角色，按正文色 <code>${esc(markColorRole(tokens, a))}</code> 预览`}）` : a.colorMode === 'roles' ? `角色变量（笔势、纸片），放在${a.context === 'surface' ? '表面' : '页面'}底上；上好色的版本见 <a href="../${scheme}/marks/themed/${a.id}-light.svg">浅色</a> · <a href="../${scheme}/marks/themed/${a.id}-dark.svg">深色</a>` : '写在文件里'}</p>` : a.kind === 'css' ? '<p class="small">样式文件</p>' : a.samples?.length ? '<p class="small">模板文件；上面是生成模块按示例标题排出的 PNG</p>' : a.fakeImages?.length ? '<p class="small">模板文件；上面是生成模块在程序画的假图上加的水印，站主的作品不进本仓库</p>' : a.kind === 'json' ? '<p class="small">清单文件</p>' : '<p class="small">位图，没有矢量源文件时无法直接编辑</p>'}
        ${a.use ? `<p class="small">用途：${esc(a.use)}</p>` : ''}
        ${a.approved ? `<p class="small">${esc(a.approved)}</p>` : ''}
        ${a.notes ? `<p class="note">${esc(a.notes)}</p>` : ''}
        ${a.origin ? `<p class="small dim">来源：${esc(a.origin.repo)} · ${esc(a.origin.path)} · ${esc(a.origin.importedAt)}</p>` : `<p class="small dim">来源：${esc(a.source?.generator ?? '手写')} · ${esc(a.source?.rules)}</p>`}
        <p class="small dim">校验和：<code>${esc((a.sha256 || '').slice(0, 12))}</code></p>
        ${renders ? `<p class="small">导出：${renders}</p>` : ''}
      </div>
    </article>`;
  }).join('');
  return `<h3>标志、图标与插图</h3><div class="grid">${cards}</div>`;
}

function motionSection(scheme, css) {
  const blocks = [];
  for (const { dir, spec } of motionParts(schemeDir(scheme))) {
    const fragment = readText(path.join(dir, spec.files.html));
    for (const p of spec.requires ?? []) {
      const dep = readText(path.join(schemeDir(scheme), p));
      if (!css.includes(dep)) css.push(dep);
    }
    css.push(readText(path.join(dir, spec.files.css)));
    // 同页放两份（演示、静止态），遮罩 id 各加后缀，免得互相引用
    const ids = [...fragment.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    const suffix = (html, sfx) => ids.reduce((h, id0) => h.split(`id="${id0}"`).join(`id="${id0}-${sfx}"`).split(`url(#${id0})`).join(`url(#${id0}-${sfx})`), html.replace(/<!--[\s\S]*?-->\n?/g, ''));
    const demo = suffix(fragment, 'demo');
    const still = suffix(fragment, 'still');
    const gifs = spec.capture.themes.map((t) => `
      <figure><img src="../${scheme}/motion/${spec.id}/${spec.id}-${t}.gif" alt="${esc(spec.title)} ${t === 'light' ? '浅色' : '深色'} GIF">
      <figcaption>${t === 'light' ? '浅色' : '深色'} GIF</figcaption></figure>`).join('');
    const sheets = spec.capture.themes.map((t) => `
      <figure><a href="../${scheme}/motion/${spec.id}/contact-${t}.png"><img src="../${scheme}/motion/${spec.id}/contact-${t}.png" alt="逐帧总览 ${t}"></a>
      <figcaption>逐帧总览（${t === 'light' ? '浅色' : '深色'}）</figcaption></figure>`).join('');
    blocks.push(`
    <article class="motion" data-piece="${esc(spec.id)}"${spec.capture.playTarget ? ` data-play-target="${esc(spec.capture.playTarget)}"` : ''}${spec.capture.playAll ? ' data-play-all' : ''}>
      <div class="live">
        <div class="stage" data-demo>${demo}</div>
        <div class="stage still" aria-label="静止态">${still.replace('class="va-logo-route"', 'class="va-logo-route" tabindex="-1"')}</div>
        <div class="controls">
          <button type="button" data-replay>重播</button>
          <span class="small dim">也可以把鼠标移上去，或用键盘聚焦。右边是静止态（系统开启「减弱动效」时，左边也会显示成这样）。</span>
          <span class="small warn" data-reduced hidden>你的系统开启了「减弱动效」，这里显示的是静态终态。</span>
        </div>
      </div>
      <div class="meta">
        <h4>${esc(spec.title)} <span class="pill ${esc(spec.status)}">${esc(STATUS[spec.status] || spec.status)}</span></h4>
        <p class="small"><code>${esc(spec.id)}</code> · 档位 <code>${esc(spec.tier)}</code>${spec.signature ? ' · 招牌动作' : ''}${spec.surface ? ` · 登记表面 <code>${esc(spec.surface)}</code>` : ''} · ${spec.loop ? `一圈 ${esc(spec.durationMs)}ms，循环` : `${esc(spec.durationMs)}ms`}</p>
        <p class="small">触发：${esc(spec.trigger)}</p>
        <p class="small">减弱动效：${esc(spec.reducedMotion)}</p>
        ${spec.approved ? `<p class="small">${esc(spec.approved)}</p>` : ''}
        ${spec.calmException ? `<p class="small">calm 时长例外：<code>${esc(spec.calmException)}</code>（tokens/motion.json 的 calmExceptions）</p>` : ''}
        ${spec.supersedes ? `<p class="small">取代 <code>${esc(spec.supersedes)}</code></p>` : ''}
        ${spec.supersededBy ? `<p class="note">已被取代：${esc(spec.supersededBy)}</p>` : ''}
        ${spec.origin ? `<p class="small dim">来源：${esc(spec.origin.repo)} · ${esc(spec.origin.path)}</p>` : `<p class="small dim">来源：${esc(spec.source?.generator)} · ${esc(spec.source?.rules)}</p>`}
        <p class="small">文件：${['css', 'html', 'site', 'js'].filter((k) => spec.files[k] && !spec.files[k].startsWith('../')).map((k) => `<a href="../${scheme}/motion/${spec.id}/${spec.files[k]}">${esc(spec.files[k])}</a>`).join(' · ')}</p>
      </div>
      <div class="gifs">${gifs}</div>
      <div class="sheets">${sheets}</div>
    </article>`);
  }
  return blocks.length ? `<h3>动效</h3>${blocks.join('')}` : '';
}

function qaSection(scheme, out) {
  const p = path.join(out, scheme, 'qa-report.json');
  if (!existsSync(p)) return `<h3>检查结果</h3><p class="small dim">还没有检查结果。先运行 <code>npm run qa</code>，再重新生成目录。</p>`;
  const items = readJson(p).items.filter((i) => i.scheme === scheme);
  const count = (s) => items.filter((i) => i.status === s).length;
  const groups = [...new Set(items.map((i) => i.group))];
  const body = groups.map((g) => {
    const rows = items.filter((i) => i.group === g);
    return `<details><summary>${esc(g)}（${rows.filter((r) => r.status === 'pass').length}/${rows.length} 通过）</summary><ul class="qa">${rows.map((r) =>
      `<li class="${r.status}"><span>${STATUS_ICON[r.status]}</span> ${esc(r.name)}${r.detail ? ` <em>${esc(r.detail)}</em>` : ''}</li>`).join('')}</ul></details>`;
  }).join('');
  const verdict = count('fail') ? 'bad' : count('warn') ? 'warn' : 'ok';
  return `<h3>检查结果</h3><p class="verdict ${verdict}">${count('pass')} 项通过 · ${count('fail')} 项失败 · ${count('warn')} 项提醒</p>${body}`;
}

function tokenFilesSection(scheme, tokens) {
  const pomelo = tokens.targets.pomelo;
  const open = pomelo?.['open-decisions'] || [];
  return `
  <h3>生成的样式文件</h3>
  <p class="small dim">${tokens.color.palettes ? '每套配色明暗各一组变量，用 <code>data-palette</code> 切换' : '网页方言和网站 <code>global.css</code> 的变量名完全一致'}${pomelo ? '；Pomelo 方言还没有被采用' : ''}。</p>
  <details><summary><code>web.css</code>（网页）</summary><pre>${esc(buildWebCss(scheme, tokens))}</pre></details>
  ${pomelo ? `<details><summary><code>pomelo.css</code>（Pomelo 方言）</summary><pre>${esc(buildPomeloCss(scheme, tokens))}</pre></details>` : ''}
  ${open.length ? `<h4 class="sub">Pomelo 映射的未决项</h4><ul>${open.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}`;
}

const PAGE_CSS = `
*{box-sizing:border-box}
body{margin:0;background:var(--color-page);color:var(--color-text);font:16px/1.65 -apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif}
a{color:var(--color-accent-strong)} a:hover{color:var(--color-ember)}
code{font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--color-surface-cool);padding:1px 5px;border-radius:4px}
header.top{border-bottom:1px solid var(--color-line);background:var(--color-surface)}
.wrap{max-width:1080px;margin:0 auto;padding:0 16px}
header.top .wrap{display:flex;gap:16px;align-items:center;justify-content:space-between;min-height:64px;flex-wrap:wrap}
h1{font-size:20px;margin:0}
h2{font-size:26px;margin:48px 0 4px}
h3{font-size:19px;margin:36px 0 12px;padding-top:12px;border-top:1px solid var(--color-soft-line)}
h4{font-size:15px;margin:0 0 4px} h4.sub{margin:24px 0 8px}
p{margin:6px 0} .lead{color:var(--color-muted)} .small{font-size:13.5px} .dim{color:var(--color-muted)}
.note{font-size:13px;background:var(--color-accent-soft);padding:6px 8px;border-radius:6px;margin:6px 0}
button{font:inherit;font-size:14px;color:var(--color-text);background:var(--color-surface);border:1px solid var(--color-line);border-radius:8px;padding:6px 14px;cursor:pointer;min-height:36px}
button:hover{border-color:var(--color-ember);color:var(--color-ember)} button:focus-visible{outline:2px solid var(--color-focus);outline-offset:2px}
.pill{font-size:12px;font-weight:500;padding:1px 8px;border-radius:999px;border:1px solid var(--color-line);color:var(--color-muted);vertical-align:1px}
.pill.approved{color:var(--color-accent-strong);border-color:var(--color-accent)}
.facts{display:flex;gap:8px 24px;flex-wrap:wrap;margin:8px 0 0;padding:0;list-style:none;font-size:14px}
.roles{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.role{background:var(--color-surface);border:1px solid var(--color-line);border-radius:10px;overflow:hidden}
.role h4{padding:8px 10px 0} .role dl{margin:4px 10px 10px;display:grid;grid-template-columns:auto 1fr;gap:0 10px;font-size:13px}
.role dt{color:var(--color-muted)} .role dd{margin:0;font-family:ui-monospace,Menlo,monospace;font-size:12.5px}
.chips{display:grid;grid-template-columns:1fr 1fr;height:44px} .chips span{display:block}
.scroll{overflow-x:auto;border:1px solid var(--color-line);border-radius:10px;background:var(--color-surface)}
table{border-collapse:collapse;width:100%;font-size:13.5px} th,td{padding:7px 10px;text-align:left;border-bottom:1px solid var(--color-soft-line);white-space:nowrap}
th{color:var(--color-muted);font-weight:500} tr:last-child td{border-bottom:0}
td.ok{color:var(--color-accent-strong)} td.bad{color:var(--color-ember);font-weight:600}
.sample{display:inline-block;min-width:34px;text-align:center;border-radius:4px;padding:0 5px;margin-right:4px;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.card,.motion{background:var(--color-surface);border:1px solid var(--color-line);border-radius:12px;overflow:hidden}
.card .meta,.motion .meta{padding:12px 14px}
.tiles{display:grid;grid-template-columns:1fr 1fr} .tiles.one{grid-template-columns:1fr}
.tile{display:grid;place-items:center;min-height:150px;padding:18px} .tile svg,.tile img{max-width:100%;max-height:120px;width:auto;height:96px}
.card-samples{gap:4px;padding:4px} .card-samples img{display:block;width:100%;height:auto}
.tile img.raster{height:auto;max-height:160px} .tile.checker{background:repeating-conic-gradient(#d9d3c6 0 25%,#efe9dc 0 50%) 0 0/16px 16px}
.motion{margin-bottom:16px}
.live{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid var(--color-soft-line)}
.stage{display:grid;place-items:center;min-height:170px;background:var(--color-page)} .stage.still{border-left:1px solid var(--color-soft-line)}
.stage .va-logo-route{justify-self:center;width:96px;height:96px} .stage .va-logo-route svg{width:76px;height:76px}
.stage.still *{animation:none!important;transition:none!important}
.stage .va-section-deco{width:min(90%,420px)} .stage .va-not-found{width:min(90%,420px)} .tile.wide img{height:auto;width:100%;max-height:none}
.controls{grid-column:1/-1;display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:10px 14px;border-top:1px solid var(--color-soft-line)}
.warn{color:var(--color-ember)}
.gifs,.sheets{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;padding:12px 14px}
.sheets{border-top:1px solid var(--color-soft-line)} figure{margin:0} figure img{max-width:100%;height:auto;border:1px solid var(--color-soft-line);border-radius:8px;display:block}
figcaption{font-size:12.5px;color:var(--color-muted);margin-top:4px}
details{border:1px solid var(--color-line);border-radius:8px;background:var(--color-surface);margin:8px 0;padding:0 12px}
summary{cursor:pointer;padding:8px 0;font-size:14px} pre{overflow:auto;font:12.5px/1.5 ui-monospace,Menlo,monospace;margin:0 0 12px;white-space:pre}
ul.qa{list-style:none;margin:0 0 10px;padding:0;font-size:13.5px} ul.qa li{padding:2px 0} ul.qa em{color:var(--color-muted);font-style:normal}
ul.qa .fail{color:var(--color-ember)} .verdict{font-weight:600} .verdict.ok{color:var(--color-accent-strong)} .verdict.bad,.verdict.warn{color:var(--color-ember)}
footer{margin:56px 0 40px;color:var(--color-muted);font-size:13px}
@media (max-width:560px){.live{grid-template-columns:1fr}.stage.still{border-left:0;border-top:1px solid var(--color-soft-line)}.tiles{grid-template-columns:1fr}}
`;

const PAGE_JS = `
(function(){
  var root=document.documentElement;
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  var saved=store('va-theme');
  var dark=saved?saved==='dark':window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;
  function apply(){dark?root.setAttribute('data-theme','dark'):root.removeAttribute('data-theme');var b=document.getElementById('theme');if(b)b.textContent=dark?'切换到浅色':'切换到深色'}
  apply();
  document.getElementById('theme').addEventListener('click',function(){dark=!dark;store('va-theme',dark?'dark':'light');apply()});
  var reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-reduced]').forEach(function(el){el.hidden=!reduced});
  document.querySelectorAll('.motion').forEach(function(m){
    var host=m.querySelector('[data-demo] > *');var btn=m.querySelector('[data-replay]');
    if(!host||!btn)return;
    var t=m.dataset.playTarget;
    var stages=t?(m.hasAttribute('data-play-all')?[].slice.call(host.querySelectorAll(t)):[host.querySelector(t)||host]):[host];
    btn.addEventListener('click',function(){
      stages.forEach(function(stage){
        stage.classList.remove('is-playing');void stage.getBoundingClientRect();stage.classList.add('is-playing');
        clearTimeout(stage._t);stage._t=setTimeout(function(){stage.classList.remove('is-playing')},1400);
      });
    });
  });
})();
`;

export function buildCatalogHtml(schemes, out) {
  const css = [];
  const sections = schemes.map((scheme) => {
    const meta = readJson(path.join(schemeDir(scheme), 'scheme.json'));
    const tokens = loadTokens(scheme);
    const body = [colorSection(tokens), handmadeSection(scheme, out), marksSection(scheme, tokens, out), motionSection(scheme, css), qaSection(scheme, out), tokenFilesSection(scheme, tokens)].join('\n');
    return `
  <section id="${esc(scheme)}">
    <h2>${esc(meta.title || scheme)}</h2>
    <ul class="facts">
      <li>状态：<strong>${esc(meta.status)}</strong></li><li>版本：${esc(meta.version)}</li>
      <li>默认动效档：<code>${esc(meta.motion?.default)}</code></li>
      <li>使用方：${(meta.consumers || []).map(esc).join('、') || '—'}</li>
    </ul>
    ${body}
  </section>`;
  }).join('\n');
  // 页面自身的明暗配色取第一个有这些变量的方案（页面样式用 --color-page 等）；动效零件的 CSS 原样内联
  const first = schemes.find((s) => loadTokens(s).targets.web.colorVars.page) ?? schemes[0];
  const webCss = buildWebCss(first, loadTokens(first));
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>视觉资产目录</title>
<style>
${webCss}
${PAGE_CSS}
${css.join('\n')}
</style>
</head>
<body>
<header class="top"><div class="wrap"><h1>视觉资产目录</h1>
<nav>${schemes.map((s) => `<a href="#${esc(s)}">${esc(s)}</a>`).join(' · ')}</nav>
<button type="button" id="theme">切换到深色</button></div></header>
<main class="wrap">
${sections}
<footer>由 <code>tooling/catalog/build.mjs</code> 生成，请勿手改。这个页面只用来浏览，不是品牌手册；规则以各方案的 <code>DESIGN.md</code> 为准。</footer>
</main>
<script>${PAGE_JS}</script>
</body>
</html>
`;
}

export function runCatalog(args = parseArgs()) {
  const out = outRoot(args);
  const schemes = schemesToBuild(args);
  if (!schemes.length) { log('catalog  没有可用的方案'); return; }
  const html = buildCatalogHtml(schemes, out);
  writeFile(path.join(out, 'catalog', 'index.html'), html);
  log(`catalog  ${schemes.join(', ')} → ${path.relative(process.cwd(), path.join(out, 'catalog', 'index.html'))}`);
}

if (isMain(import.meta.url)) {
  try { runCatalog(); } catch (e) { console.error(e.stack || e.message); process.exit(1); }
}
