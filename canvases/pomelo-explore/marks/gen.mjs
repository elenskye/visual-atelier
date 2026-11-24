// 生成 Pomelo Explore 的「图形」一页（原 pomelo-marks 画布，2026-11-12 并进来）：柚子、模块贴纸、通用贴纸、空状态插图、App 图标的审看画板。
// 图都直接取 schemes/pomelo/marks/ 里生成好的 SVG（颜色是 var(--pm-角色, var(--color-角色))，挂了 Design System 就跟着配色和明暗走），
// 不另画一份。App 图标照 PNG 的样子按蓝笔浅色上色。改了 marks/art.mjs 先跑 node tooling/handmade/marks.mjs，再跑这里。
// 用法：在仓库根目录 node canvases/pomelo-explore/marks/gen.mjs
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { rootImport, fromRoot } from '../../_lib/root.mjs';
import { PROJECT, writePage, dsBoard } from '../page.mjs';

const PG = 'marks';
const PREFIX = 'Marks-';
const { loadTokens, readJson } = await rootImport('tooling/lib/common.mjs');
const { resolveRoles, stripHooks } = await rootImport('tooling/handmade/marks.mjs');
const art = await rootImport('schemes/pomelo/marks/art.mjs');

const tokens = loadTokens('pomelo');
const manifest = readJson(fromRoot('schemes/pomelo/marks/manifest.json'));
const asset = (id) => manifest.assets.find((a) => a.id === id);
const src = (id) => readFileSync(fromRoot(`schemes/pomelo/marks/${asset(id).file}`), 'utf8').trim();
const PALETTES = Object.keys(tokens.color.palettes);
const PAL_NAMES = Object.fromEntries(PALETTES.map((p) => [p, tokens.color.palettes[p].label ?? p]));

// 同一张图在一块画板里放几次：每次换一套 id，滤镜和遮罩才不会串
let seq = 0;
function inst(svg, w, h = w, style = '') {
  const n = ++seq;
  let out = svg.replace(/^<svg([^>]*?) width="[\d.]+" height="[\d.]+"/, `<svg$1 width="${w}" height="${h}"${style ? ` style="${style}"` : ''}`);
  for (const [, id] of svg.matchAll(/id="([^"]+)"/g)) out = out.split(`id="${id}"`).join(`id="${id}-${n}"`).split(`url(#${id})`).join(`url(#${id}-${n})`);
  return out;
}
const face = (f, w) => inst(src(`pomelo-${f}`), w, Math.round((w * 108) / 112));
// 站主批过的四张板照旧用不带换色挂钩的样子（挂钩不改样子，板的文件也就不变，批准照旧有效）
const mod = (id, w) => inst(stripHooks(src(`module-${id}`)), w);
// 带挂钩的贴纸：外面包一层设 --mark-color，就换成另一种分类色
const tintVars = (cat) => `--mark-color:var(--color-cat-${cat});--mark-color-soft:var(--color-cat-${cat}-sticker)`;
const tmod = (id, w, cat) => `<span style="display:inline-block;line-height:0${cat ? ';' + tintVars(cat) : ''}">${inst(src(`module-${id}`), w)}</span>`;

const CSS = `
body{margin:0}
.bd{box-sizing:border-box;width:1280px;height:800px;overflow:hidden;position:relative;background:var(--color-desk);padding:44px 56px;display:flex;flex-direction:column;gap:22px}
.hd h1{margin:0;font-size:26px;line-height:34px;font-weight:700}
.hd p{margin:4px 0 0;font-size:14px;line-height:22px;color:var(--color-ink-soft)}
.cap{font-size:13px;line-height:18px;color:var(--color-ink-soft);text-align:center}
.lbl{font-size:15px;line-height:22px;text-align:center}
.row{display:flex;align-items:flex-end;gap:18px}
.bd svg{flex:none}
.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:1px}
`;

function board(file, title, body, { props = {}, w = 1280, h = 800, fixed = false } = {}) {
  const allProps = fixed
    ? { dark: { editor: 'boolean', default: false, section: '明暗' }, ...props, $preview: { width: w, height: h } }
    : { palette: { editor: 'enum', options: PALETTES, default: PALETTES[0], section: '配色' }, dark: { editor: 'boolean', default: false, section: '配色' }, ...props, $preview: { width: w, height: h } };
  const html = dsBoard({
    title, css: CSS, props: allProps,
    body: `<div class="pm bd" data-palette="{{palette}}" data-theme="{{theme}}">
${body}
</div>`,
    script: `class Component extends DCLogic {
  renderVals() {
    return { palette: ${fixed ? "'blue'" : "this.props.palette ?? 'blue'"}, theme: this.props.dark ? 'dark' : 'light' };
  }
  componentDidMount() { this.stop = Pomelo.paintLive(document.body); }
  componentDidUpdate() { Pomelo.paint(document.body); }
  componentWillUnmount() { this.stop && this.stop(); }
}`,
  });
  writeFileSync(path.join(PROJECT, PREFIX + file), html);
  return { file: PREFIX + file, title, w, h };
}

// ---------- 柚子 · 8 个表情 ----------
const faces = art.FACES.map((f, i) => `<div class="pm-card" data-hand="card" data-seed="${11 + i}" style="width:266px;height:248px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">${face(f, 150)}<div class="lbl">${art.FACE_NAMES[f]}</div></div>`).join('');
const B1 = board('Main.dc.html', '柚子 · 8 个表情', `
<div class="hd"><h1>柚子 · 8 个表情</h1><p>静态帧，100 格；墨线跟着配色走，柚黄、叶子、腮红不变。表情动画在 Phase 5。</p></div>
<div style="display:grid;grid-template-columns:repeat(4,266px);gap:22px 26px">${faces}</div>
<div class="row" style="gap:26px"><span class="cap" style="align-self:center">小号</span>${face('normal', 26)}${face('normal', 40)}${face('normal', 64)}${face('happy', 40)}${face('think', 40)}</div>
`);

// ---------- 菜单栏和 AI 按钮 ----------
const menuBar = (dark) => {
  const bg = dark ? '#2C2C2E' : '#F2F2F4', fg = dark ? '#FFFFFF' : '#1D1D1F';
  const glyph = (k) => inst(src(`menu-${k}`), 18).replace('aria-hidden="true">', 'aria-hidden="true" style="display:block">');
  return `<div style="height:30px;width:520px;border-radius:8px;background:${bg};color:${fg};display:flex;align-items:center;justify-content:flex-end;gap:16px;padding:0 14px;font-family:-apple-system,'PingFang SC',sans-serif;font-size:13px">${glyph('solid')}${glyph('hollow')}<span>周六 20:30</span></div>`;
};
const bigGlyph = (k, dark) => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px"><div style="width:96px;height:96px;border-radius:14px;display:grid;place-items:center;background:${dark ? '#2C2C2E' : '#F2F2F4'};color:${dark ? '#fff' : '#1D1D1F'}">${inst(src(`menu-${k}`), 72)}</div><span class="cap">${k === 'solid' ? '实心 · 模型就绪' : '空心 · 没在运行'}</span></div>`;
const topBar = (unseen) => `<div style="position:relative;height:51px;width:520px;border-radius:10px;background:var(--color-top);color:var(--color-on-top);display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:0 12px;border:1px solid var(--color-line)">
<span class="cap" style="margin-right:auto;padding-left:6px">11 月 7 日 · 周六</span>
<span style="height:30px;width:150px;border-radius:9px;background:var(--color-card);border:1px solid var(--color-line);display:flex;align-items:center;padding:0 10px" class="cap">搜索</span>
<span style="position:relative;display:block;width:30px;height:30px">${inst(src('ai-button'), 30)}${unseen ? '<span style="position:absolute;top:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:var(--color-primary);border:1px solid var(--color-top)"></span>' : ''}</span>
</div>`;
const B2 = board('Menubar.dc.html', '菜单栏和 AI 按钮', `
<div class="hd"><h1>菜单栏和 AI 按钮</h1><p>菜单栏是 macOS 的模板图（黑和透明，系统上色），18 个点里柚子占 16 个点高；AI 按钮在顶栏右边，30 号，换掉小鸟。</p></div>
<div style="display:flex;gap:40px">
  <div class="pm-card" data-hand="card" data-seed="31" style="width:572px;padding:22px 26px;display:flex;flex-direction:column;gap:16px">
    <div class="lbl" style="text-align:left;font-weight:700">菜单栏 · 实际大小</div>
    ${menuBar(false)}${menuBar(true)}
    <div class="lbl" style="text-align:left;font-weight:700;margin-top:6px">放大 4 倍</div>
    <div class="row" style="gap:16px">${bigGlyph('solid', false)}${bigGlyph('hollow', false)}${bigGlyph('solid', true)}${bigGlyph('hollow', true)}</div>
  </div>
  <div class="pm-card" data-hand="card" data-seed="32" style="width:556px;padding:22px 18px;display:flex;flex-direction:column;gap:16px">
    <div class="lbl" style="text-align:left;font-weight:700">顶栏右边 · 实际大小</div>
    ${topBar(false)}${topBar(true)}
    <div class="cap" style="text-align:left">下面一条带「有新内容」的小点。</div>
    <div class="lbl" style="text-align:left;font-weight:700;margin-top:6px">放大</div>
    <div class="row" style="gap:28px">${inst(src('ai-button'), 110)}${inst(src('ai-button'), 60)}${inst(src('ai-button'), 40)}</div>
  </div>
</div>
`);

// ---------- 模块贴纸 ----------
const byCat = {};
for (const id of art.MODULE_ORDER) (byCat[art.MODULE_ICONS[id].cat] ??= []).push(id);
const catRow = (cat, ids, extra = []) => `<div style="display:flex;align-items:center;gap:8px">
<div style="width:96px;flex:none;font-size:15px;line-height:22px"><span class="dot" style="background:var(--color-cat-${cat})"></span>${art.CATEGORY_NAMES[cat]}</div>
${[...extra, ...ids].map((id) => {
  const name = id === 'youzi' ? '柚子' : art.MODULE_ICONS[id].name;
  const big = id === 'youzi' ? face('normal', 60) : mod(id, 60);
  const small = id === 'youzi' ? `${face('normal', 40)}${face('normal', 26)}` : `${mod(id, 40)}${mod(id, 26)}`;
  return `<div style="width:206px;display:flex;align-items:center;gap:8px">${big}<div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px;line-height:20px;white-space:nowrap">${name}</span><span class="row" style="gap:6px">${small}</span></div></div>`;
}).join('')}
</div>`;
const B3 = board('Modules.dc.html', '模块贴纸', `
<div class="hd"><h1>模块贴纸 · 20 个</h1><p>每个填一种分类色（跟模块坞的分类走），配一样点睛；60、40、26 号。柚子模块用柚子本人。</p></div>
<div class="pm-card" data-hand="card" data-seed="41" style="padding:18px 22px;display:flex;flex-direction:column;gap:12px">
${['mint', 'pink', 'grape', 'orange', 'sky'].map((c) => catRow(c, byCat[c], c === 'orange' ? ['youzi'] : [])).join('')}
</div>
`);

// ---------- 模块坞里的样子 ----------
const LIVE = { todo: '今天 3 件', notes: '昨天写了 2 条', days: '还有 12 天', finance: '本月支出 1,286', packing: '下周去青岛', books: '在读 2 本', films: '想看 5 部', drawing: '第 7 课', site: '有 1 处改动', canvas: '3 块画布', jobs: '投了 4 家', seeker: '简历 2 份', rater: '题库 36 道', youzi: '模型就绪', translate: '', pub2md: '', importer: '', atlas: '2026 年', vault: '已锁上', bookmarks: '128 个网址', janitor: '能清 3.2 GB' };
const nameOf = (id) => (id === 'youzi' ? '柚子' : art.MODULE_ICONS[id].name);
const iconOf = (id, w) => (id === 'youzi' ? face('normal', w) : mod(id, w));
const tile = (id, i) => `<div class="pm-card" data-hand="cell" data-seed="${60 + i}" style="width:112px;height:100px;padding:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">${iconOf(id, 40)}<span style="font-size:14px;line-height:20px">${nameOf(id)}</span><span class="cap" style="font-size:12px;line-height:16px">${LIVE[id] || ' '}</span></div>`;
const dockRow = (id) => `<div style="display:flex;align-items:center;gap:10px;height:34px">${iconOf(id, 26)}<span style="font-size:14px;line-height:20px;white-space:nowrap">${nameOf(id)}</span><span class="cap" style="margin-left:auto;font-size:12px;white-space:nowrap">${LIVE[id]}</span></div>`;
const DOCK = [['日常', ['todo', 'notes', 'days']], ['生活', ['finance', 'packing']], ['兴趣', ['books', 'films', 'drawing']], ['求职', ['jobs', 'seeker', 'rater']], ['创作', ['site', 'canvas']], ['柚子', ['youzi', 'translate', 'pub2md', 'importer', 'atlas']], ['工具', ['vault', 'bookmarks', 'janitor']]];
const col = (cats) => `<div style="display:flex;flex-direction:column;gap:14px;width:250px">${cats.map(([n, ids]) => `<div><div class="cap" style="text-align:left;margin-bottom:2px">${n}</div>${ids.map(dockRow).join('')}</div>`).join('')}</div>`;
const B4 = board('Dock.dc.html', '模块坞里的样子', `
<div class="hd"><h1>模块坞里的样子</h1><p>置顶一排 40 号，分类里一行 26 号（Pomelo 现在的大小）。分类是模块坞默认的那 7 个，名字和小字都是编的。</p></div>
<div class="pm-sheet" data-hand="sheet" data-seed="51" style="flex:1;padding:22px 30px 22px 54px;display:flex;flex-direction:column;gap:18px">
  <div><div class="cap" style="text-align:left;margin-bottom:6px">置顶</div><div class="row" style="gap:14px">${['todo', 'notes', 'jobs', 'seeker', 'youzi', 'books'].map(tile).join('')}</div></div>
  <div style="display:flex;gap:44px">${col(DOCK.slice(0, 3))}${col(DOCK.slice(3, 5))}${col(DOCK.slice(5))}</div>
</div>
`);

// ---------- App 图标（三种底，各一张，站主批一张） ----------
const appBoards = Object.entries(art.APP_VARIANTS).map(([v, info], i) => {
  const svg = resolveRoles(src(`app-icon-${v}`), tokens, 'blue', 'light');
  // 别的 App 的占位：和 macOS 的图标一样四周留白，方块占 824 / 1024
  const ph = (w) => `<div style="width:${w}px;height:${w}px;flex:none;display:grid;place-items:center"><div style="width:${Math.round(w * 0.805)}px;height:${Math.round(w * 0.805)}px;border-radius:${Math.round(w * 0.181)}px;background:linear-gradient(160deg,#C9CCD3,#9EA3AD)"></div></div>`;
  const dock = (dark) => `<div style="display:flex;align-items:flex-end;gap:10px;padding:8px 12px;border-radius:22px;background:${dark ? 'rgba(60,60,64,.75)' : 'rgba(255,255,255,.55)'};border:1px solid ${dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)'}">${ph(64)}${ph(64)}${inst(svg, 64)}${ph(64)}${ph(64)}</div>`;
  const desk = (dark) => `<div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:22px 26px;border-radius:16px;background:${dark ? 'linear-gradient(160deg,#1E2A3A,#121418)' : 'linear-gradient(160deg,#DCE6F2,#F4EEE4)'};color:${dark ? '#fff' : '#1D1D1F'};font-family:-apple-system,'PingFang SC',sans-serif">
    <div class="row" style="gap:22px;align-items:flex-end">${[128, 64, 32, 16].map((s) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">${inst(svg, s)}<span style="font-size:11px;opacity:.7">${s}</span></div>`).join('')}</div>
    ${dock(dark)}</div>`;
  return board(`AppIcon-${v}.dc.html`, `App 图标 · ${info.name}`, `
<div class="hd"><h1>App 图标 · ${info.name}</h1><p>1024 源图，macOS 的图标网格（824 的连续圆角方块，四周留 100）；颜色按蓝笔浅色定死。三种底挑一种：批这一张，退另外两张。</p></div>
<div style="display:flex;gap:34px;align-items:flex-start">
  <div style="flex:none">${inst(svg, 470)}</div>
  <div style="display:flex;flex-direction:column;gap:18px">${desk(false)}${desk(true)}</div>
</div>
`, { fixed: true });
});

// ---------- 通用贴纸（站主 2026-11-07：自建模块也要有贴纸，每个模块都能换图标和颜色） ----------
const libName = (id) => art.LIBRARY_ICONS[id].name;
const libCell = (id) => `<div style="width:134px;display:flex;flex-direction:column;align-items:center;gap:4px"><div class="row" style="gap:6px;align-items:center">${tmod(id, 56)}<span style="display:flex;flex-direction:column;align-items:center;gap:4px">${tmod(id, 36)}${tmod(id, 24)}</span></div><span style="font-size:14px;line-height:20px">${libName(id)}</span></div>`;
const B5 = board('Library.dc.html', '通用贴纸 · 32 个', `
<div class="hd"><h1>通用贴纸 · 32 个</h1><p>和模块贴纸一样的画法和 64 格；前 23 个对应自建模块现在能选的图标（「语言」用 Translator 那张），后 9 个是加的。每个模块都能从全部 52 张里挑，颜色另挑。</p></div>
<div class="pm-card" data-hand="card" data-seed="71" style="padding:18px 20px;display:grid;grid-template-columns:repeat(8,134px);gap:14px 8px;justify-content:space-between">
${art.LIBRARY_ORDER.map(libCell).join('')}
</div>
`);

const CAT_ORDER = ['mint', 'pink', 'grape', 'orange', 'sky'];
const CAT_LABEL = { mint: '薄荷', pink: '樱粉', grape: '葡萄紫', orange: '橙', sky: '天蓝' };
const SAMPLE = ['todo', 'books', 'jobs', 'translate', 'vault', 'game', 'music', 'coffee', 'cat', 'plane'];
const nameAny = (id) => (art.MODULE_ICONS[id] ?? art.LIBRARY_ICONS[id]).name;
const catAny = (id) => (art.MODULE_ICONS[id] ?? art.LIBRARY_ICONS[id]).cat;
const swatchHead = CAT_ORDER.map((c) => `<div class="lbl" style="width:84px"><span class="dot" style="background:var(--color-cat-${c})"></span>${CAT_LABEL[c]}</div>`).join('');
const colorRow = (id) => `<div style="display:flex;align-items:center;gap:0;height:56px"><div style="width:110px;font-size:14px;line-height:20px">${nameAny(id)}</div>${CAT_ORDER.map((c) => `<div style="width:84px;display:flex;justify-content:center;align-items:center;gap:3px">${tmod(id, 44, c)}${c === catAny(id) ? '<span class="cap" style="font-size:11px">默认</span>' : ''}</div>`).join('')}</div>`;
const B6 = board('Colors.dc.html', '换颜色', `
<div class="hd"><h1>换颜色 · 五种分类色</h1><p>每张贴纸都能换成五种分类色里的任一种：主色和浅一档一起换，墨线、白边、点睛不变。「默认」是这张贴纸本来的颜色。</p></div>
<div style="display:flex;gap:28px">
  <div class="pm-card" data-hand="card" data-seed="81" style="padding:14px 20px"><div style="display:flex;padding-left:110px;margin-bottom:4px">${swatchHead}</div>${SAMPLE.slice(0, 5).map(colorRow).join('')}</div>
  <div class="pm-card" data-hand="card" data-seed="82" style="padding:14px 20px"><div style="display:flex;padding-left:110px;margin-bottom:4px">${swatchHead}</div>${SAMPLE.slice(5).map(colorRow).join('')}</div>
</div>
<div class="cap" style="text-align:left">明暗、五套配色下分类色都不变；深色里贴纸照旧是浅的，白边照旧。</div>
`);

// ---------- 选图标和颜色（Pomelo 的弹窗，样子示意） ----------
const ALL = [...art.MODULE_ORDER, ...art.LIBRARY_ORDER];
// 樱粉里已经有模块在用的贴纸（示意：自带的四个兴趣模块，加上换成樱粉的出门走走）：变淡、点不了
const TAKEN_PINK = { books: '摸鱼读读', films: '好奇看看', drawing: '随意画画', site: '呦呦漫游', packing: '出门走走' };
const pickCell = (id, on) => `<span title="${TAKEN_PINK[id] ? `${TAKEN_PINK[id]}在用` : nameAny(id)}" style="position:relative;width:40px;height:40px;display:grid;place-items:center;border-radius:10px${on ? ';background:var(--color-selected)' : ''}${TAKEN_PINK[id] ? ';opacity:.28' : ''}">${tmod(id, 32, 'pink')}</span>`;
const sw = (c, on) => `<span style="display:flex;flex-direction:column;align-items:center;gap:3px"><span style="width:26px;height:26px;border-radius:50%;background:var(--color-cat-${c});box-shadow:0 0 0 2px var(--color-card)${on ? ',0 0 0 4px var(--color-pen)' : ''}"></span><span class="cap" style="font-size:12px">${CAT_LABEL[c]}</span></span>`;
// 贴纸簿里的一类（Phase 2 定稿的样子：分类名写在胶带上，贴纸各歪一点）
const tapeLab = (name, kind) => `<div style="position:relative;width:86px;height:26px;margin:0 0 8px 2px"><span style="position:absolute;inset:0;transform:rotate(-3deg);opacity:.88;background:repeating-linear-gradient(45deg,var(--color-tape-${kind}-a) 0 7px,var(--color-tape-${kind}-b) 7px 14px)"></span><span style="position:relative;display:block;text-align:center;line-height:26px;font-size:15px;font-weight:700;color:#20241F">${name}</span></div>`;
const bookCell = (id, name, cat, tilt) => `<div style="width:84px;display:flex;flex-direction:column;align-items:center;gap:2px">${`<span style="display:inline-block;line-height:0;transform:rotate(${tilt}deg)">`}${tmod(id, 56, cat)}</span><span style="font-size:14px;line-height:20px;white-space:nowrap">${name}</span></div>`;
const B7 = board('Picker.dc.html', '选图标和颜色', `
<div class="hd"><h1>选图标和颜色</h1><p>贴纸簿（模块坞）里右键一张贴纸 →「图标和颜色…」；新建五花八门、循序渐进时也是这一块。点一下就换，「恢复默认」回到它本来的贴纸和颜色。柚子瓣里只看贴纸，所以同一张贴纸配同一种颜色只给一个模块：别的模块在用的格子变淡、点不了（示意：「玩物有志」挑了游戏、樱粉，樱粉里那五张有模块在用）。</p></div>
<div style="display:flex;gap:30px;align-items:flex-start">
  <div class="pm-card" data-hand="card" data-seed="91" style="width:640px;padding:20px 22px;display:flex;flex-direction:column;gap:14px">
    <div class="row" style="align-items:center;gap:12px">${tmod('game', 44, 'pink')}<div style="display:flex;flex-direction:column"><span style="font-size:17px;line-height:24px;font-weight:700">玩物有志</span><span class="cap" style="text-align:left">图标和颜色</span></div><button class="pm-btn pm-btn--plain" data-hand="button" data-fill="card" data-seed="93" type="button" style="margin-left:auto">恢复默认</button></div>
    <div class="row" style="gap:16px;align-items:flex-start">${CAT_ORDER.map((c) => sw(c, c === 'pink')).join('')}</div>
    <div class="cap" style="text-align:left">模块</div>
    <div style="display:grid;grid-template-columns:repeat(14,40px);gap:2px">${art.MODULE_ORDER.map((id) => pickCell(id, false)).join('')}</div>
    <div class="cap" style="text-align:left">更多</div>
    <div style="display:grid;grid-template-columns:repeat(14,40px);gap:2px">${art.LIBRARY_ORDER.map((id) => pickCell(id, id === 'game')).join('')}</div>
  </div>
  <div class="pm-card" data-hand="card" data-seed="92" data-tilt="-1.2" style="width:470px;padding:22px 20px 18px 24px;background-image:repeating-linear-gradient(135deg,transparent 0 22px,color-mix(in srgb,var(--color-line) 45%,transparent) 22px 23.5px)">
    ${tapeLab('兴趣', 'yuzu')}
    <div style="display:flex;gap:4px">${bookCell('books', '摸鱼读读', null, -6)}${bookCell('films', '好奇看看', null, 5)}${bookCell('game', '玩物有志', 'pink', -3)}${bookCell('packing', '出门走走', 'pink', 7)}${bookCell('drawing', '随意画画', null, -5)}</div>
    <div class="cap" style="text-align:left;margin-top:10px">贴纸簿里的「兴趣」一类：「出门走走」挪进来，颜色也换成樱粉。</div>
  </div>
</div>
`);

// ---------- 空状态插图（Dawn Plan · Phase 5） ----------
const emptyCell = (k) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:262px">${inst(src(`empty-${k}`), 184, 108)}<span style="font-size:13px;line-height:18px;white-space:nowrap"><span style="color:var(--color-ink-soft)">${art.EMPTY[k].name} · </span>${art.EMPTY[k].line}</span></div>`;
const emptyPanel = (theme, seed) => `<div class="pm-card" data-hand="card" data-seed="${seed}" data-theme="${theme}" style="width:560px;padding:12px 10px 10px;color:var(--color-ink);--pm-card-bg:var(--color-paper)"><div class="cap" style="text-align:left;padding-left:10px;margin-bottom:2px">${theme === 'light' ? '浅色' : '暗色'}</div><div style="display:grid;grid-template-columns:repeat(2,262px);gap:8px 14px;justify-content:center">${art.EMPTY_ORDER.map(emptyCell).join('')}</div></div>`;
const B8 = board('Empty.dc.html', '空状态插图', `
<div class="hd"><h1>空状态插图 · 8 张</h1><p>一页还空着时：一张小插图配一句俏皮话，不写使用提示。画法和模块贴纸一样，每样东西一张白边；打开那一页时一笔笔画出来、再一样样弹一下（动效零件 empty-state）。话取 Phase 2 定的文案，书架和投石问路的图也取自 Phase 2。</p></div>
<div style="display:flex;gap:28px">${emptyPanel('light', 101)}${emptyPanel('dark', 102)}</div>
`);

// ---------- 设置和日历的贴纸、滚动条（站主 2026-11-09：设置、日历叠在桌上时的图标要和别的一个风格；滚动条单独设计） ----------
const place = (id, w) => `<span style="display:inline-block;line-height:0">${inst(src(`place-${id}`), w)}</span>`;
const placeCell = (id) => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:150px"><div class="row" style="gap:10px;align-items:center">${place(id, 64)}<span style="display:flex;flex-direction:column;align-items:center;gap:6px">${place(id, 46)}${place(id, 26)}</span></div><span class="lbl">${art.PLACE_ICONS[id].name}</span></div>`;
const beside = ["todo", "days", "vault"].map((id) => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:90px">${tmod(id, 46)}<span class="cap">${art.MODULE_ICONS[id].name}</span></div>`).join("");
const longList = Array.from({ length: 16 }, (_, i) => `<div style="height:34px;display:flex;align-items:center;gap:10px;border-bottom:2px dashed var(--color-line);font-size:15px"><span class="pm-soft pm-num" style="width:22px">${i + 1}</span>${["买猫粮", "给妈妈打电话", "交水电费", "把书还给图书馆"][i % 4]}</div>`).join("");
const scrollPanel = (theme, seed) => `<div class="pm-card pm-scroll" data-hand="card" data-seed="${seed}" data-theme="${theme}" style="width:330px;padding:14px 8px 14px 18px;color:var(--color-ink)"><div class="cap" style="text-align:left;padding-bottom:6px">${theme === "dark" ? "暗色" : "浅色"} · 鼠标移进来、拖一拖</div><div style="height:230px;overflow-y:auto;padding-right:8px">${longList}</div></div>`;
const B9 = board("Places.dc.html", "设置和日历的贴纸 · 滚动条", `
<div class="hd"><h1>设置和日历的贴纸 · 滚动条</h1><p>设置、日历不是模块，以前叠在桌上时是手画圆框里的小图标，和别的贴纸不是一个风格；现在各有一张贴纸，画法和模块贴纸一样（64 格，64、46、26 号）。滚动条：平时一小段淡墨线，鼠标移进来显出它走的那条缝线。</p></div>
<div style="display:flex;gap:28px;align-items:flex-start">
  <div class="pm-card" data-hand="card" data-seed="111" style="padding:22px 24px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;gap:26px">${art.PLACE_ORDER.map(placeCell).join("")}</div>
    <div><div class="cap" style="text-align:left;margin-bottom:8px">和模块贴纸放一起（46 号，叠在桌上露出来的大小）</div><div style="display:flex;gap:8px;align-items:flex-end"><div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:90px">${place("settings", 46)}<span class="cap">设置</span></div><div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:90px">${place("calendar", 46)}<span class="cap">日历</span></div>${beside}</div></div>
  </div>
  ${scrollPanel("light", 112)}${scrollPanel("dark", 113)}
</div>
`);

// ---------- canvas.json（只动这一页） ----------
const boards = [B1, B2, B3, B4, ...appBoards, B5, B6, B7, B8, B9];
const GAP = 120;
writePage({
  id: PG, name: 'R2：柚子、贴纸、App 图标', prefix: PREFIX,
  boards: boards.map((b, i) => ({ file: b.file, x: (i % 4) * (b.w + GAP), y: Math.floor(i / 4) * (b.h + GAP + 40), w: b.w, h: b.h, title: b.title })),
});
console.log(`pomelo-explore/marks：${boards.length} 张画板 → ${path.relative(process.cwd(), PROJECT)}`);
