// Pomelo Explore 的「外框」一页（原 pomelo-frame 画布，2026-11-12 并进来）：B3 桌面拼贴的可点原型（首页桌面、模块页的纸和缝线、叠在右边的页、柚子瓣、贴纸簿）。
// 站主 2026-11-08 定的对应：开着的页就是页签，叠在纸的右边、右上「桌上开着」；不要索引签（置顶的在桌面下排「常用」和柚子瓣）；
// 子页插在纸的上边；模块坞变成贴纸簿（从桌面下面滑上来）。版式照 Phase 2 定稿的 B3（canvases/pomelo-explore/p2-final/b.mjs）。
// 手画的框、胶带、缝线、勾选、笔迹都用 Design System「Pomelo 柚儿园」的 bundle.js（Pomelo 也用同一份），颜色是它的 token；
// 柚子和模块贴纸直接取 schemes/pomelo/marks/ 生成好的 SVG（换色走 --mark-color）。交互在 app.js。
// 用法：在仓库根目录 node canvases/pomelo-explore/frame/gen.mjs
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { rootImport, fromRoot } from '../../_lib/root.mjs';
import { PROJECT, writePage } from '../page.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PG = 'frame';
const PREFIX = 'Frame-';
const { loadTokens } = await rootImport('tooling/lib/common.mjs');
const { P, handFill, handStroke, f } = await rootImport('tooling/handmade/line.mjs');
const art = await rootImport('schemes/pomelo/marks/art.mjs');
const APP_JS = readFileSync(path.join(HERE, 'app.js'), 'utf8');

const tokens = loadTokens('pomelo');
const PALETTES = Object.keys(tokens.color.palettes);
const TODAY = '11 月 8 日 · 周日';

// ---------- 贴纸 ----------
// 每张贴纸在画板里只定义一次（<symbol>），各处用 <use> 引用，画板才不会几兆大；换色的变量从 <use> 外面继承进去。
const used = new Map();
function symbolOf(file) {
  if (!used.has(file)) {
    const src = readFileSync(fromRoot(`schemes/pomelo/marks/${file}.svg`), 'utf8').trim();
    const vb = /viewBox="([^"]+)"/.exec(src)[1];
    const inner = src.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    used.set(file, { id: `s-${file.replace(/[^a-z0-9]+/gi, '-')}`, vb, inner });
  }
  return used.get(file);
}
const sprite = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${[...used.values()].map((u) => `<symbol id="${u.id}" viewBox="${u.vb}">${u.inner}</symbol>`).join('')}</defs></svg>`;
function useSym(file, w, h, { tint = null, tilt = 0, cls = '' } = {}) {
  const u = symbolOf(file);
  const [, , vw, vh] = u.vb.split(' ').map(Number);
  const vars = tint ? `--mark-color:var(--color-cat-${tint});--mark-color-soft:var(--color-cat-${tint}-sticker);` : '';
  return `<span class="mk ${cls}" style="display:inline-block;line-height:0;flex:none;${vars}${tilt ? `transform:rotate(${tilt}deg);` : ''}"><svg width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" style="display:block;overflow:visible" aria-hidden="true"><use href="#${u.id}" width="${vw}" height="${vh}"></use></svg></span>`;
}
/** 一张模块贴纸；tint 换主色（模块的「图标和颜色」）；tilt 是贴纸歪的角度（贴纸不是字，能歪）。 */
const mark = (id, size, o = {}) => useSym(`modules/${id}`, size, size, o);
/** 柚子（表情）和 AI 按钮。 */
const face = (name, size, tilt = 0) => useSym(`pomelo/${name}`, size, name === 'ai-button' ? size : Math.round((size * 108) / 112), { tilt });
/**
 * 会动的柚子：每张脸的 SVG 原样放进来（表情动画要动到 SVG 里面的眼睛、嘴，<use> 引用的碰不到），包一层 .pm-pomelo[data-face]，
 * 几张叠着，按 .app 的 data-face 显示一张；一张脸一出现，它的动画就开始（schemes/pomelo/motion/pomelo-*，Phase 5）。
 * 每处只放用得到的几张，没有的表情显示「平常」。每个副本的 id 加编号，滤镜不串。
 */
const FACE_ALL = ['normal', 'wink', 'wow', 'happy', 'sleepy', 'surprised', 'think'];
let faceSeq = 0;
function liveFace(name, size) {
  const k = ++faceSeq;
  return readFileSync(fromRoot(`schemes/pomelo/marks/pomelo/pomelo-${name}.svg`), 'utf8').trim()
    .replace(/id="([^"]+)"/g, `id="$1-${k}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${k})`)
    .replace(/ width="[\d.]+" height="[\d.]+"/, ` width="${size}" height="${Math.round((size * 108) / 112)}"`)
    .replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');
}
/** 柚子贴纸（或它的印子）的整份 SVG 原样放进来，id 加编号。 */
function inlineMark(file, size) {
  const k = ++faceSeq;
  return readFileSync(fromRoot(`schemes/pomelo/marks/${file}.svg`), 'utf8').trim()
    .replace(/id="([^"]+)"/g, `id="$1-${k}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${k})`)
    .replace(/ width="[\d.]+" height="[\d.]+"/, ` width="${size}" height="${Math.round((size * 108) / 112)}"`)
    .replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');
}
/** 小彩蛋：简报角上的柚子贴纸能撕起来，底下的印子写着悄悄话（motion/sticker-whisper，照 Phase 2 定稿）。 */
const whisper = (S) => `<div class="pm-whisper brief-peel" style="width:${S}px;height:${S}px"><div class="pm-whisper-under">${inlineMark('pomelo/pomelo-ghost', S)}<div class="pm-whisper-text">今天也<br>辛苦啦</div></div><div class="pm-whisper-peel" role="button" tabindex="0" aria-label="撕起柚子贴纸"><div class="pm-whisper-front">${inlineMark('pomelo/pomelo-normal', S)}</div><div class="pm-whisper-back">${inlineMark('pomelo/pomelo-normal', S)}</div></div></div>`;
const faces = (size, list = FACE_ALL) => list.map((n) => `<span class="pm-pomelo fc" data-face="${n}">${liveFace(n, size)}</span>`).join('');
/** 只有图标的按钮下面挂的小签（Design System 的 Tooltip，动效是 motion/tooltip）。按钮或它外面那层加 .pm-tip-host。 */
const tip = (t) => `<span class="pm-tip" role="tooltip"><span class="pm-tip-string"></span><span class="pm-tip-tag">${t}</span></span>`;

// ---------- 模块（假数据；分类、置顶照 Pomelo 默认的，加一个站主自建的「玩物有志」） ----------
const MODS = {
  todo: { name: '一步一步', live: '今天 3 件' },
  notes: { name: '念念不忘', live: '今天 2 条' },
  days: { name: '来日方长', live: '小林生日 5 天' },
  finance: { name: '钱来钱往', live: '本月 18 笔', subs: ['收支', '资产', '报表', '导入账单'] },
  packing: { name: '出门走走', live: '还空着', empty: 'packing' },
  books: { name: '摸鱼读读', live: '在读 2' },
  films: { name: '好奇看看', live: '想看 5' },
  drawing: { name: '随意画画', live: '7 / 24 节' },
  play: { name: '玩物有志', mark: 'game', live: '4 条' },
  // 自建的「日语」（循序渐进，图标是「语言」）：贴纸和 Translator 一样，橙色已经有人用，自动换成下一种没人用的颜色（天蓝）
  lang: { name: '日语', mark: 'translate', tint: 'sky', live: '7 / 30 课' },
  jobs: { name: '投石问路', live: '该跟进 2', subs: ['投递', '统计'] },
  seeker: { name: 'Seeker', live: '有草稿', yz: true, subs: ['简历', '素材', '档案', '规则', '网申', '历史', '设置'] },
  rater: { name: 'Rater', live: '36 道题', yz: true, subs: ['题库', '卡片', '面试', '规则', '设置'] },
  site: { name: '呦呦漫游', live: '', subs: ['发布', '作品', 'Now', '关于我', '职业', '资源库', '站点'] },
  youzi: { name: '柚子', live: '12 个对话' },
  translate: { name: 'Translator', live: '中英互译', yz: true, subs: ['Translator', '提示词'] },
  pub2md: { name: 'Pub2MD', live: '', yz: true, subs: ['Pub2MD', '提示词'] },
  importer: { name: 'Importer', live: '待核对 4', yz: true },
  vault: { name: '芝麻开门', live: '还空着', empty: 'vault' },
  bookmarks: { name: '一网打尽', live: '128 个网址' },
  janitor: { name: 'DevJanitor', live: '可清 3.2 GB', yz: true, subs: ['磁盘', '清理', '环境', 'Agent', '设置'] },
};
// 分类：方案定的五类（DESIGN.md §2，模块贴纸的颜色就按它分），和 Phase 2 的柚子瓣一样每类一种颜色。
const CATS = [
  { name: '日常', cat: 'mint', mods: ['todo', 'notes', 'days', 'finance', 'packing'] },
  { name: '兴趣', cat: 'pink', mods: ['books', 'films', 'drawing', 'site', 'play', 'lang'] },
  { name: '求职', cat: 'grape', mods: ['jobs', 'seeker', 'rater'] },
  { name: '柚子', cat: 'orange', mods: ['youzi', 'translate', 'pub2md', 'importer'] },
  { name: '工具', cat: 'sky', mods: ['vault', 'bookmarks', 'janitor'] },
];
const PINNED = ['todo', 'notes', 'finance', 'days', 'books', 'jobs', 'seeker', 'youzi'];
const markOf = (id) => MODS[id].mark ?? id;
const modMark = (id, size, o = {}) => (id === 'youzi' ? face('pomelo-normal', size, o.tilt ?? 0) : mark(markOf(id), size, { tint: MODS[id].tint ?? null, ...o }));

// ---------- 小零件 ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
/** 界面小图标（24 格一笔单线，跟着字的颜色），由 bundle.js 画。 */
const ICON = {
  back: 'M15 5.5 L8.5 12 L15 18.5', fwd: 'M9 5.5 L15.5 12 L9 18.5', plus: 'M12 5 L12 19 M5 12 L19 12', x: 'M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5',
  search: 'M16 16 L20.5 20.5',
  gear: Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `M${f(12 + 7 * Math.cos(a))} ${f(12 + 7 * Math.sin(a))} L${f(12 + 9.6 * Math.cos(a))} ${f(12 + 9.6 * Math.sin(a))}`; }).join(' '),
  home: 'M4 11.5 L12 4.5 L20 11.5 M6.5 9.5 L6.5 19.5 L17.5 19.5 L17.5 9.5 M10 19.5 L10 14.5 L14 14.5 L14 19.5', grid: 'M5 5 L10.5 5 L10.5 10.5 L5 10.5 Z M13.5 5 L19 5 L19 10.5 L13.5 10.5 Z M5 13.5 L10.5 13.5 L10.5 19 L5 19 Z M13.5 13.5 L19 13.5 L19 19 L13.5 19 Z',
  down: 'M7 10 L12 15 L17 10',
  back2: 'M9.5 6 L4.5 11 L9.5 16 M4.5 11 L14.5 11 C18 11 20 13 20 16 L20 19',
  sparkle: 'M12 4 Q12 12 20 12 Q12 12 12 20 Q12 12 4 12 Q12 12 12 4 Z',
  flip: 'M5 9 C6 5.5 9 4 12 4 C16.5 4 19.5 7.5 19.5 11 M19.5 11 L21.5 8.5 M19.5 11 L17 9.5 M19 15 C18 18.5 15 20 12 20 C7.5 20 4.5 16.5 4.5 13 M4.5 13 L2.5 15.5 M4.5 13 L7 14.5', pin: 'M9 4.5 L15 4.5 M10 4.5 L10 10 L7 13.5 L17 13.5 L14 10 L14 4.5 M12 13.5 L12 19.5',
};
const OS = { search: '10.5 10.5 6', gear: '12 12 3, 12 12 6.6' };
const icon = (k, size = 20, seed = 1) => `<span data-hand="icon" data-size="${size}" data-seed="${seed}" data-d="${ICON[k]}"${OS[k] ? ` data-o="${OS[k]}"` : ''}></span>`;
/** 胶带条：薄荷或柚黄的斜条纹，两端锯齿；歪的只是这一条，字放在它上面另一层。 */
function tapeStrip(w, h, { kind = 'mint', rot = -2, cls = '' } = {}) {
  const n = 4, zz = [];
  for (let i = 0; i <= n * 2; i++) zz.push(`${i % 2 ? 6 : 0}px ${f((i / (n * 2)) * 100)}%`);
  const right = zz.map((p) => { const [x, y] = p.split(' '); return `calc(100% - ${x}) ${y}`; }).reverse();
  const clip = `polygon(${[...zz, ...right].join(',')})`;
  const [a, b] = kind === 'mint' ? ['tape-mint-a', 'tape-mint-b'] : ['tape-yuzu-a', 'tape-yuzu-b'];
  return `<span class="tape ${cls}" aria-hidden="true" style="position:absolute;inset:0;transform:rotate(${rot}deg);opacity:.88;clip-path:${clip};background:repeating-linear-gradient(45deg,var(--color-${a}) 0 7px,var(--color-${b}) 7px 14px)"></span>`;
}

// ---------- 顶栏 ----------
function bar() {
  const lights = ['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => `<i style="left:${14 + i * 20}px;background:${c}"></i>`).join('');
  return `<header class="bar">
<span class="lights" aria-hidden="true">${lights}</span>
<button type="button" class="hub pm-press pm-tip-host" data-act="bloom" aria-label="柚子瓣：去哪，或问柚子"><span class="faces" style="transform:rotate(-8deg)">${faces(50)}</span>${tip('柚子瓣')}</button>
<button type="button" class="navb pm-press pm-tip-host" data-act="back" aria-label="后退" style="left:140px">${icon('back', 20, 11)}${tip('后退')}</button>
<button type="button" class="navb pm-press pm-tip-host" data-act="fwd" aria-label="前进" style="left:168px">${icon('fwd', 20, 12)}${tip('前进')}</button>
<button type="button" class="tohome pm-press" data-act="home">${tapeStrip(104, 28, { kind: 'mint', rot: -2 })}<span class="tl">${icon('back2', 17, 13)}回桌面</span></button>
<div class="right">
  <span class="openlbl">桌上开着</span>
  <span class="opens" role="tablist" aria-label="桌上开着的页"></span>
  <button type="button" class="ib pm-press pm-tip-host" data-act="book" aria-label="新开一页（贴纸簿）">${icon('plus', 20, 14)}${tip('新开一页')}</button>
  <span class="datechip" data-hand="frame" data-r="4" data-fill="card" data-tilt="1.5" data-sw="1.4" data-amp="0.5" data-seed="701"><span>${TODAY}</span></span>
  <button type="button" class="ib pm-press pm-tip-host" data-act="search" aria-label="找东西（⌘K）">${icon('search', 21, 15)}${tip('找东西')}</button>
  <button type="button" class="ib pm-press pm-tip-host" aria-label="设置">${icon('gear', 21, 16)}${tip('设置')}</button>
  <button type="button" class="ask pm-press pm-tip-host" data-act="ask" aria-label="问柚子（⌘J）">${face('ai-button', 36)}${tip('问柚子')}</button>
</div>
</header>`;
}

// ---------- 桌面 ----------
// 资产小票背面的曲线（Phase 2 的 curveSvg）
const CURVE = [168.2, 171.5, 170.1, 174.8, 176.3, 175.2, 179.9, 181.4, 180.2, 184.1, 186.42];
function curve(w, h, seed = 90) {
  const lo = Math.min(...CURVE) - 2, hi = Math.max(...CURVE) + 1;
  const xy = CURVE.map((v, i) => [6 + (i * (w - 12)) / (CURVE.length - 1), 6 + (h - 12) * (1 - (v - lo) / (hi - lo))]);
  const line = P('M' + xy.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L'));
  const area = P('M' + xy.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ` L${w - 6} ${h} L6 ${h} Z`);
  const [lx, ly] = xy[xy.length - 1];
  const dot = P(`M${f(lx - 4.5)} ${f(ly)} C${f(lx - 4.5)} ${f(ly - 6)} ${f(lx + 4.5)} ${f(ly - 6)} ${f(lx + 4.5)} ${f(ly)} C${f(lx + 4.5)} ${f(ly + 6)} ${f(lx - 4.5)} ${f(ly + 6)} ${f(lx - 4.5)} ${f(ly)} Z`);
  return `<svg width="${w}" height="${h}" style="display:block;overflow:visible" aria-hidden="true"><path d="${handFill(area, { amp: 0.6, seed, sp: 3, keep: 3, prec: 0 })}" fill="var(--color-cat-mint-tint)"></path><path d="${handStroke(line, { amp: 0.8, seed: seed + 1, wave: 14, sp: 1.5, keep: 3 })}" fill="none" stroke="var(--color-pen)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path><path d="${handFill(dot, { amp: 0.2, seed })}" fill="var(--color-yuzu)" stroke="var(--color-pen)" stroke-width="1.8"></path></svg>`;
}
// 便签：[左, 上, 宽, 高, 纸歪的角度]（B3 定稿的位置）
const NOTES = {
  brief: [64, 170, 476, 214, -1.2],
  todo: [580, 88, 312, 224, 1.4],
  days: [930, 74, 300, 214, -1.8],
  books: [596, 352, 318, 182, -1],
  receipt: [954, 322, 262, 330, 0],
  sticky: [86, 420, 230, 200, -2.2],
  year: [352, 420, 214, 232, 0],
};
const note = (id, inner) => {
  const [x, y, w, h] = NOTES[id];
  // 打开时一张张落下来：问候（motion/greeting）按 --pm-i 错开
  return `<div class="note pm-greet-note" data-note="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;--pm-i:${Object.keys(NOTES).indexOf(id)}">${inner}</div>`;
};
function desk() {
  const [, , bw, bh, bt] = NOTES.brief;
  const brief = `<article class="pm-card" data-hand="card" data-seed="740" data-tilt="${bt}" data-tapes="1" data-stitches style="width:${bw}px;height:${bh}px;padding:18px 22px 16px 34px">
<div class="row"><span class="pm-card-title">今日简报</span><span class="pm-card-meta" style="margin-left:auto;margin-right:40px">重写</span></div>
<p class="brief">今天有 3 件事，最急的是<span class="pm-mark" data-hand="marker" data-seed="741">交作业</span>，今晚 12 点截止。<br>小林的生日还有 5 天，礼物点子里记着<span class="pm-mark" data-hand="marker" data-seed="742">一盆小柚子树</span>。<br>这周吃饭花了 ¥486，比上周少 ¥62，继续保持。</p>
<p class="soft" style="font-size:13px;margin:6px 0 0">没看：投石问路</p>
${whisper(84)}</article>`;
  const [, , tw2, th2, tt] = NOTES.todo;
  const todos = [['交作业', false, '今晚截止'], ['给猫买粮', true, ''], ['跑步五公里', false, '']];
  const todo = `<article class="pm-card pm-card--lined" data-hand="card" data-seed="743" data-tilt="${tt}" data-tapes="2" style="width:${tw2}px;height:${th2}px;padding:16px 20px">
<div class="row" style="gap:8px">${modMark('todo', 26)}<span class="pm-card-title">今天的待办</span><span class="pm-card-meta" style="margin-left:auto">1 / 3</span></div>
${todos.map(([t, on, due], i) => `<div class="row" style="height:38px"><button type="button" class="pm-check" role="checkbox" aria-checked="${on}"><span data-hand="check" data-seed="${750 + i}"></span><span class="pm-check-text" data-hand="strike" data-seed="${760 + i}">${t}</span></button>${due ? `<span class="due">${due}</span>` : ''}</div>`).join('')}
</article>`;
  const [, , dw2, dh2, dt] = NOTES.days;
  const days = `<article class="pm-card" data-hand="card" data-seed="744" data-tilt="${dt}" data-tapes="1" style="width:${dw2}px;height:${dh2}px;padding:16px 20px;--pm-card-bg:var(--color-cat-pink-tint)">
<div class="row" style="gap:8px">${modMark('days', 26)}<span class="pm-card-title">快到的日子</span></div>
${[['小林生日', '11 月 13 日 · 周五', '5'], ['猫猫来家 3 周年', '11 月 20 日 · 周五', '12'], ['护照到期', '12 月 19 日 · 周六', '41']].map(([n, d, k], i) => `<div class="row" style="height:46px"><div style="display:flex;flex-direction:column"><span style="font-size:15px;line-height:22px">${n}</span><span class="soft" style="font-size:12px;line-height:16px">${d}</span></div><span class="pm-stat" style="margin-left:auto">还有 ${i === 0 ? `<span class="pm-mark" data-hand="marker" data-seed="765"><span class="pm-stat-num">${k}</span></span>` : `<span class="pm-stat-num">${k}</span>`} 天</span></div>`).join('')}
</article>`;
  const [, , kw, kh, kt] = NOTES.books;
  const books = `<article class="pm-card" data-hand="card" data-seed="745" data-tilt="${kt}" data-tapes="2" style="width:${kw}px;height:${kh}px;padding:16px 20px">
<div class="row" style="gap:8px">${modMark('books', 26)}<span class="pm-card-title">在读的书</span></div>
${[['《海边的柚子树》', 62], ['《慢慢来的勇气》', 18]].map(([n, p], i) => `<div style="margin-top:10px"><div class="row" style="font-size:15px;line-height:22px"><span>${n}</span><span class="soft" style="margin-left:auto;font-size:12px">${p}%</span></div><div class="bar-out" data-hand="frame" data-r="6" data-sw="1.4" data-amp="0.4" data-fill="card" data-seed="${770 + i}"><span class="bar-in" style="width:${p}%"></span></div></div>`).join('')}
</article>`;
  const [, , rw, rh] = NOTES.receipt;
  const accounts = [['银行卡', '128,300.00'], ['基金', '43,000.00'], ['支付宝', '12,640.55'], ['微信', '2,480.00']];
  const receipt = `<div class="pm-receipt" style="width:${rw}px;height:${rh}px">
<div class="pm-receipt-head">— 柚儿园 · 资产小票 —<br>${TODAY}</div><span class="pm-receipt-cut"></span>
${accounts.map(([n, v]) => `<div class="pm-receipt-row"><span>${n}</span><span class="pm-num">${v}</span></div>`).join('')}
<span class="pm-receipt-cut"></span><div class="pm-receipt-row pm-receipt-total"><span>合计</span><span class="pm-num" style="font-size:22px">¥186,420.55</span></div>
<div class="pm-receipt-row"><span></span><span class="pm-up">比上次 +¥2,310.00</span></div><div class="soft" style="font-size:12px;margin-top:10px;text-align:center">翻过来看曲线</div></div>`;
  const back = `<div class="pm-receipt" style="width:${rw}px;height:${rh}px"><div style="font-size:16px;font-weight:700;margin-bottom:8px">这三个月</div>${curve(214, 150)}<div class="soft" style="display:flex;justify-content:space-between;font-size:12px;margin-top:4px;width:214px"><span>9 月</span><span>10 月</span><span>11 月</span></div><div style="font-size:14px;margin-top:14px;line-height:1.6">十一月第一周就<br>多了 <span class="pm-num" style="font-weight:700">¥2,310</span>，工资到啦。</div></div>`;
  const receiptCard = `<div style="position:relative;width:${rw}px;height:${rh}px;perspective:900px"><div class="pm-flip"><div class="pm-flip-face rface">${receipt}</div><div class="pm-flip-face pm-flip-back rface">${back}</div></div><span class="rtape">${tapeStrip(80, 24, { kind: 'yuzu', rot: 4 })}</span><button type="button" class="rflip pm-press pm-tip-host" data-act="flip" aria-label="翻面">${icon('flip', 20, 790)}${tip('翻面')}</button></div>`;
  const [, , sw, sh, stt] = NOTES.sticky;
  const sticky = `<div class="pm-note" data-hand="note" data-seed="746" data-tilt="${stt}" data-tapes="1" style="width:${sw}px;height:${sh}px;padding:20px 20px 0">
<div class="row" style="gap:6px;font-size:15px;font-weight:700;margin-bottom:8px">${modMark('notes', 26)}念念不忘</div>
<div style="font-size:18px;line-height:1.6">周末想去看海，<br>顺路买一袋柚子。</div><div style="font-size:12px;margin-top:10px;opacity:.7">11 月 1 日 · 周日</div></div>`;
  const stats = [['books', '12', '本', '读完', 'sky', 0, 26, -7], ['films', '9', '部', '看完', 'sky', 108, 0, 5], ['drawing', '18', '节', '画了', 'pink', 18, 124, 4], ['packing', '4', '趟', '出门', 'orange', 118, 112, -6]];
  const year = `<div style="position:relative;width:214px;height:232px"><div style="position:absolute;left:4px;top:-4px;font-size:14px;font-weight:700;line-height:20px">2026 年 · 到今天</div>
${stats.map(([id, n, u, lab, c, x, y, r], i) => `<div class="ystat" data-hand="round" data-fill="cat-${c}-sticker" data-sw="1.6" data-seed="${780 + i}" data-tilt="${r}" style="left:${x}px;top:${y + 24}px">${mark(id, 22)}<span class="pm-num" style="font-size:24px;font-weight:700;line-height:1.05">${n}<span style="font-size:12px;font-weight:400">${u}</span></span><span style="font-size:11px;line-height:14px">${lab}</span></div>`).join('')}</div>`;
  const tilts = [-6, 4, -3, 6, -5, 3, -4, 5];
  const row = PINNED.map((id, i) => `<button type="button" class="dstk pm-press" data-go="${id}"><span class="dic pm-lift">${modMark(id, 56, { tilt: tilts[i] })}</span><span>${MODS[id].name}</span></button>`).join('');
  return `<section class="desk pm-greet" aria-label="桌面">
<div class="greet"><span class="gw pm-greet-word"><span class="pm-mark" data-hand="marker" data-seed="710">下午好呀</span></span><span class="gs pm-greet-sub">今天也慢慢来。</span></div>
${note('brief', brief)}${note('todo', todo)}${note('days', days)}${note('books', books)}${note('receipt', receiptCard)}${note('sticky', sticky)}${note('year', year)}
<div class="common"><span class="clabel">${tapeStrip(64, 26, { kind: 'mint', rot: -6 })}<span class="tl">常用</span></span>${row}
<button type="button" class="dstk pm-press" data-act="book"><span class="dic bookic pm-lift" data-hand="round" data-seed="750" data-fill="card">${icon('grid', 24, 17)}</span><span>贴纸簿</span></button></div>
</section>`;
}

// ---------- 模块页 ----------
const FT_FILL = ['cat-mint-bg', 'cat-sky-bg', 'cat-orange-bg', 'cat-grape-bg', 'cat-pink-bg'];
function folderTabs(id) {
  const subs = MODS[id].subs;
  if (!subs) return '';
  return `<div class="ftabs" role="tablist" aria-label="${MODS[id].name}的子页">${subs.map((s, i) => `<button type="button" class="ft pm-folder-tab" role="tab" data-sub="${i}" aria-selected="${i === 0}"><span class="ft-off" data-hand="frame" data-r="9" data-sw="1.5" data-amp="0.5" data-fill="${FT_FILL[i % 5]}" data-seed="${800 + i}"></span><span class="ft-on" data-hand="frame" data-r="9" data-sw="1.7" data-amp="0.5" data-fill="paper" data-seed="${810 + i}"></span><span class="ft-t">${s}</span></button>`).join('')}</div>`;
}
const LATER = (what) => `<div class="later"><div class="pm-note pm-slap-in is-in" data-hand="note" data-seed="890" data-tilt="-1.5" data-tapes="1" style="width:300px;padding:20px 22px"><div style="font-size:16px;font-weight:700;margin-bottom:6px">${what}</div><div style="font-size:14px;line-height:1.6">这一页里面的样子 Phase 6 再换；这次只换外框：纸、缝线、贴纸、子页的纸签。</div></div></div>`;

function financeBody() {
  const chips = ['全部', '餐饮', '交通', '日用', '住房', '宠物', '娱乐'];
  const cc = { 餐饮: 'orange', 交通: 'sky', 日用: 'mint', 住房: 'grape', 宠物: 'pink', 娱乐: 'pink', 收入: 'mint' };
  const days = [
    ['11 月 8 日 · 周日', '支出 36.00', [['午饭 · 牛肉面', '餐饮', '微信', '−32.00'], ['地铁', '交通', '交通卡', '−4.00']]],
    ['11 月 7 日 · 周六', '支出 254.50', [['超市 · 牛奶和鸡蛋', '日用', '支付宝', '−86.50'], ['和朋友聚餐', '餐饮', '信用卡', '−168.00']]],
    ['11 月 6 日 · 周五', '支出 3,329.00', [['工资', '收入', '银行卡', '+15,800.00'], ['房租', '住房', '银行卡', '−3,200.00'], ['猫粮', '宠物', '支付宝', '−129.00']]],
  ];
  return `<div class="toolbar">
<label class="pm-field" data-hand="field" data-seed="820" style="width:200px"><span class="pm-field-icon" style="order:-1">${icon('search', 18, 821)}</span><input placeholder="搜备注" aria-label="搜备注"></label>
<span class="selwrap"><button type="button" class="pm-field pm-select" data-hand="field" data-r="10" data-seed="822" aria-haspopup="listbox" aria-expanded="false" style="width:172px;white-space:nowrap"><span class="pm-num sellab">2026 年 11 月</span>${icon('down', 18, 823)}</button>
<div class="pm-menu selmenu" role="listbox" hidden>${['8 月', '9 月', '10 月', '11 月'].map((m, i) => `<div class="pm-menu-item" role="option" data-m="${m}" aria-selected="${i === 3}"><span class="pm-num">${m}</span><span class="pm-menu-check" data-hand="icon" data-size="18" data-seed="${827 + i}" data-d="M5.5 12.5 L10 17 L18.5 7" style="color:var(--color-pen)"></span></div>`).join('')}</div></span>
<span class="chips">${chips.map((c, i) => `<span class="pm-chip ${i ? `pm-cat-${cc[c]}` : 'is-all'}">${c}</span>`).join('')}</span>
<button type="button" class="pm-btn" data-hand="button" data-seed="824" style="margin-left:auto">${icon('plus', 16, 825)}记一笔</button></div>
<div class="ledger pm-card" data-hand="card" data-seed="826">
<div class="lhead"><span>备注</span><span>分类</span><span>账户</span><span style="text-align:right">金额</span></div>
${days.map(([d, sum, rows], k) => `<div class="lday"><span>${k === 0 ? `<span class="pm-mark" data-hand="marker" data-seed="${830 + k}">${d}</span>` : d}</span><span class="soft" style="font-size:12px">${sum}</span></div>${rows.map(([n, c, a, v]) => `<div class="lrow"><span>${n}</span><span><span class="pm-chip pm-cat-${cc[c]}">${c}</span></span><span class="soft">${a}</span><span class="pm-num ${v.startsWith('+') ? 'pm-up' : ''}" style="text-align:right;font-size:17px">${v}</span></div>`).join('')}`).join('')}
</div>`;
}
function todoBody() {
  const rows = [['交作业', false, '2026 / 11 / 08', true], ['给猫买粮', true, '', false], ['跑步五公里', false, '', false], ['整理照片', false, '2026 / 11 / 05', true], ['报告提交窗口', false, '2026 / 11 / 10', false]];
  return `<div class="row" style="gap:10px;margin:6px 0 14px"><span style="font-size:20px;font-weight:700">今天</span><span class="soft">${TODAY} · 还有 4 件</span></div>
<div class="pm-card pm-card--lined" data-hand="card" data-seed="840" style="padding:10px 22px 14px">${rows.map(([t, on, d, late], i) => `<div class="row" style="height:40px"><button type="button" class="pm-check" role="checkbox" aria-checked="${on}"><span data-hand="check" data-seed="${841 + i}"></span><span class="pm-check-text" data-hand="strike" data-seed="${850 + i}">${t}</span></button>${d ? `<span class="${late ? 'due' : 'soft'}" style="font-size:13px;margin-left:auto;white-space:nowrap">${d}</span>` : ''}</div>`).join('')}
<label class="pm-field" data-hand="field" data-seed="860" style="margin-top:12px"><input placeholder="加一件事…" aria-label="加一件事"></label></div>`;
}
function notesBody() {
  const ns = [['周末想去看海，顺路买一袋柚子。', '11 月 1 日 · 周日', -1.2], ['柚子树要放在朝南的窗边，冬天少浇水。', '10 月 29 日 · 周四', 1.4], ['今天在书店翻到一本讲纸的书，记一下：《纸的故事》。', '10 月 26 日 · 周一', -0.8], ['跑完步喝一杯热的柚子茶，舒服。', '10 月 24 日 · 周六', 1.8]];
  return `<label class="pm-field" data-hand="field" data-seed="870" style="width:520px;margin:4px 0 18px"><input placeholder="现在的想法是……" aria-label="现在的想法"></label>
<div class="ngrid">${ns.map(([t, d, r], i) => `<article class="pm-card" data-hand="card" data-seed="${871 + i}" data-tilt="${r}" ${i % 2 ? '' : 'data-tapes="1"'} style="padding:18px 20px"><div style="font-size:16px;line-height:1.65">${t}</div><div class="soft" style="font-size:12px;margin-top:8px">${d}</div></article>`).join('')}</div>`;
}
function daysBody() {
  const ds = [['小林生日', '每年 · 11 月 13 日', '5', 'pink'], ['猫猫来家 3 周年', '每年 · 11 月 20 日', '12', 'orange'], ['护照到期', '证件 · 12 月 19 日', '41', 'sky'], ['妈妈生日', '每年 · 1 月 6 日', '59', 'pink']];
  return `<div class="seg-wrap"><div class="pm-seg" data-hand="field" data-seed="880" role="group" aria-label="筛选"><span class="pm-seg-hl" data-hand="pick" data-seed="881"></span>${['全部', '纪念日', '生日', '证件'].map((s, i) => `<button type="button" class="pm-seg-item" aria-pressed="${i === 0}">${s}</button>`).join('')}</div></div>
<div class="dlist">${ds.map(([n, d, k, c], i) => `<article class="pm-card" data-hand="card" data-seed="${882 + i}" style="padding:14px 20px;--pm-card-bg:var(--color-cat-${c}-tint)"><div class="row"><div style="display:flex;flex-direction:column"><span style="font-size:16px;line-height:22px;font-weight:700">${n}</span><span class="soft" style="font-size:12px">${d}</span></div><span class="pm-stat" style="margin-left:auto">还有 <span class="pm-stat-num">${k}</span> 天</span></div></article>`).join('')}</div>`;
}
// 空着的页：空状态插图一笔笔画出来、再一样样弹一下，配一句话（motion/empty-state，插图在 marks/empty/）
let emptySeq = 0;
function emptyBody(key) {
  const k = ++emptySeq;
  const svg = readFileSync(fromRoot(`schemes/pomelo/marks/empty/${key}.svg`), 'utf8').trim()
    .replace(/id="([^"]+)"/g, `id="$1-e${k}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-e${k})`)
    .replace(/ width="[\d.]+" height="[\d.]+"/, ' width="320" height="188"').replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');
  return `<div class="later"><div class="pm-empty is-in">${svg}<p class="pm-empty-line">${art.EMPTY[key].line}</p></div></div>`;
}
// 柚子那一页：问柚子（横线本上一问一答）。新问的：我问的便签啪地贴上，柚子先想（表情「在想」、绕一笔），再一个字一个字写出回答。
function youziBody() {
  const old = '这周吃饭花了 ¥486，比上周少 ¥62。周三那顿火锅最贵，其余都在 30 块上下，继续保持就好。';
  return `<div class="chat"><div class="msgs">
<div class="me"><div class="mebub" data-hand="frame" data-r="10" data-sw="1.4" data-amp="0.5" data-fill="selected" data-tilt="0.7" data-tapes="1" data-seed="960">这周吃饭花了多少？</div></div>
<div class="yz"><span class="yzav faces">${faces(34, ['normal', 'think', 'happy'])}</span><div class="pm-answer">${old}</div></div>
</div>
<div class="composer"><div class="sugs">${['今天要做什么？', '小林生日送什么', '这个月花了多少'].map((t, i) => `<button type="button" class="sug pm-press" data-ask="${t}" data-hand="round" data-seed="${965 + i}">${icon('sparkle', 13, 968 + i)}${t}</button>`).join('')}</div>
<label class="pm-field cfield" data-hand="field" data-seed="970" data-r="14"><input class="cq" placeholder="接着问…" aria-label="接着问柚子"><button type="button" class="pm-btn csend" data-hand="button" data-seed="971">问</button></label></div></div>`;
}
const BODIES = { finance: financeBody, todo: todoBody, notes: notesBody, days: daysBody, youzi: youziBody };
const META = { finance: '11 月 · 支出 ¥3,619.50 · 收入 ¥15,800.00', todo: '今天 3 件 · 过期 1', notes: '共 161 条', days: '最近：小林生日 5 天', youzi: '本地模型 · 12 个对话' };

/** 一页：纸（左边缝线、歪一点点）、上边的子页纸签、左上角拍一张模块贴纸、右边露出来的贴纸（叠在下面时）。 */
function page(id) {
  const m = MODS[id];
  const subs = m.subs ?? [];
  const body = BODIES[id] ? BODIES[id]() : m.empty ? emptyBody(m.empty) : '';
  const subBodies = subs.length
    ? subs.map((s, i) => `<div class="sub" data-sub="${i}"${i ? ' hidden' : ''}>${i === 0 && body ? body : LATER(`${m.name} · ${s}`)}</div>`).join('')
    : `<div class="sub" data-sub="0">${body || LATER(m.name)}</div>`;
  return `<div class="page pm-page" data-mod="${id}" aria-label="${m.name}">
${folderTabs(id)}
<section class="pm-sheet sheet${id === 'youzi' ? ' lined' : ''}" data-hand="sheet" data-seed="${900 + Object.keys(MODS).indexOf(id) * 3}" data-tilt="-0.3">
<div class="phead"><h1 class="pm-sheet-title">${m.name}${m.yz ? `<span class="yzb">${face('pomelo-normal', 20)}</span>` : ''}</h1><span class="pm-sheet-sub" style="margin-left:auto">${META[id] ?? ''}</span></div>
<div class="pbody">${subBodies}</div>
</section>
${id === 'youzi'
    // 柚子那一页的大柚子能戳：每戳一下换一张脸，2.5 秒里戳 5 下它晕过去（小彩蛋，motion/pomelo-dizzy）
    ? `<button type="button" class="slap poke pm-slap-in" style="--pm-delay:.3s" aria-label="戳一下柚子"><span class="faces" style="transform:rotate(-8deg)">${faces(76, ['normal', 'wow', 'happy', 'wink', 'surprised', 'error', 'think'])}</span></button>`
    : `<span class="slap pm-slap-in" style="--pm-delay:.3s">${modMark(id, 70, { tilt: -8 })}</span>`}
<button type="button" class="peek pm-page-peek pm-tip-host" data-go="${id}" aria-label="换到「${m.name}」">${id === 'youzi' ? face('pomelo-normal', 46) : modMark(id, 46)}${tip(m.name)}</button>
</div>`;
}

// ---------- 贴纸簿（模块坞）：照 Phase 2 定稿（p2-final/b.mjs 的 book） ----------
// 一本斜条纹的纸簿，歪 −1.2°，从桌面下面滑上来（下边伸出画面）；分类名写在胶带上（薄荷、柚黄轮着）；
// 贴纸 66 号、各歪一点；开着的页撕走了，留一个虚线空位、写「在桌上」；点一下撕下来飞走，也能拖出簿子放到桌上。
// 比 Phase 2 宽一点（1040）：一类最多 5 个模块。
const BOOK = { x: 120, y: 96, w: 1040, h: 760 };
function book() {
  const TILT = [-3, 2, -2, 3, -4, 2];
  const grid = CATS.map((c, ci) => {
    const lab = `<div class="blab">${tapeStrip(86, 26, { kind: ci % 2 ? 'yuzu' : 'mint', rot: TILT[ci % 6] })}<span class="tl">${c.name}</span></div>`;
    const st = c.mods.map((id, j) => `<div class="stk pm-peel" data-stk="${id}" role="button" tabindex="0" aria-label="${MODS[id].name}"><span class="ghost"></span><span class="stkart pm-peel-art">${modMark(id, 66, { tilt: [-6, 5, -3, 7, -5, 4][(ci + j) % 6] })}</span><span class="stklab">${MODS[id].name}</span><span class="usedtag">在桌上</span></div>`).join('');
    return `<div class="bcat" data-cat="${ci}">${lab}<div class="bcells">${st}</div></div>`;
  }).join('');
  return `<div class="bk pm-scrim" role="dialog" aria-label="柚子的贴纸簿">
<div class="book pm-book" style="left:${BOOK.x}px;top:${BOOK.y}px;width:${BOOK.w}px;height:${BOOK.h}px">
<div class="bookpaper" data-hand="frame" data-r="18" data-amp="1.1" data-sw="2" data-seed="820" data-tilt="-1.2"></div>
<div class="bin">
<div class="bhead"><span class="faces">${faces(64, ['normal', 'wow'])}</span><div><div class="bt">柚子的贴纸簿</div><div class="soft" style="font-size:13px;line-height:20px">撕一张贴纸，就去那里 · 拖出簿子放到桌上也行</div></div>
<label class="pm-field bfield" data-hand="field" data-seed="821" data-r="12" data-fill="paper"><span class="pm-field-icon" style="order:-1">${icon('search', 18, 952)}</span><input class="bq" placeholder="去哪，或问柚子" aria-label="去哪，或问柚子"></label></div>
<button type="button" class="bask pm-press" hidden>${icon('sparkle', 14, 953)}<span></span></button>
<div class="bgrid">${grid}</div>
</div></div>
<span class="corner soft" style="left:40px">＋ 分类</span><span class="corner soft" style="right:40px">已隐藏 2</span>
</div>`;
}

// ---------- 柚子瓣：照 Phase 2 定稿（p2-final/wheel.mjs） ----------
// 一圈柚皮（两道墨线、一圈小毛孔），瓣和瓣之间留缝，每瓣一个分类、分类色的浅底；拖着能转，松手接着转（每帧乘 0.95）；
// 打字就找，对不上就问柚子；打「柚子」它转一圈。Phase 2 是 11 个模块、600 格；这里 20 个，几何按 680 格放大（×1.133）。
// 站主 2026-11-08：瓣里只放贴纸、不写名字（鼠标移上去垂下一张小签），每瓣的贴纸外、里两圈交错排（zigzag）。
const K = 680 / 600;
const W = { C: 340, R1: 120 * K, R2: 244 * K, RR1: 252 * K, RR2: 272 * K, RL: 304 * K, PITH: 112 * K, RO: 237, RI: 177, ICON: 54 };
/**
 * 一瓣里的贴纸怎么排：外、里两圈交错（第 1、3、5… 个在外圈，第 2、4… 个在里圈），沿着这一瓣均匀排开；
 * 两头各留出贴纸的半径加 7 像素，贴纸碰不到瓣的边线。只有一个时放在这一瓣正中。返回 [半径, 角度]。
 */
export function zigzag(n, a0, a1, { ro = W.RO, ri = W.RI, icon = W.ICON } = {}) {
  if (n === 1) return [[(ro + ri) / 2, (a0 + a1) / 2]];
  const pad = (r) => ((icon / 2 + 7) / r) * 57.2958;
  const r = (k) => (k % 2 ? ri : ro);
  const start = a0 + pad(r(0)), end = a1 - pad(r(n - 1));
  return Array.from({ length: n }, (_, k) => [r(k), start + ((end - start) * k) / (n - 1)]);
}
const pt = (r, deg) => [W.C + r * Math.cos((deg * Math.PI) / 180), W.C + r * Math.sin((deg * Math.PI) / 180)];
const circleCmds = (r) => {
  const pts = [];
  for (let i = 0; i <= 72; i++) pts.push(pt(r, i * 5));
  return P('M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' Z');
};
function bloom() {
  const mods = CATS.flatMap((c) => c.mods.map((id) => ({ id, cat: c.cat })));
  const step = 360 / mods.length;
  let a = -90 - (CATS[0].mods.length * step) / 2;
  const sector = (a0, a1) => {
    const g1 = (4 / W.R2) * 57.3, g0 = (4 / W.R1) * 57.3;
    const pts = [];
    for (let t = a0 + g1; t <= a1 - g1 + 0.01; t += 3) pts.push(pt(W.R2, t));
    pts.push(pt(W.R2, a1 - g1));
    for (let t = a1 - g0; t >= a0 + g0 - 0.01; t -= 3) pts.push(pt(W.R1, t));
    pts.push(pt(W.R1, a0 + g0));
    return P('M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' Z');
  };
  let wedges = '', slots = '', labels = '', k = 0;
  CATS.forEach((c, ci) => {
    const a0 = a, a1 = a + c.mods.length * step;
    const d = sector(a0, a1);
    wedges += `<g class="wedge"><path class="fl" d="${handFill(d, { amp: 0.8, seed: 600 + ci, sp: 3, keep: 3, prec: 0 })}" fill="var(--color-cat-${c.cat}-tint)" transform="translate(1.6 2)"></path><path class="ol" pathLength="1" d="${handStroke(d, { amp: 1.1, seed: 610 + ci, sp: 3, keep: 3, over: 0.02, prec: 0 })}" fill="none" stroke="var(--color-pen)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></g>`;
    const [lx, ly] = pt(W.RL, (a0 + a1) / 2);
    labels += `<div class="wl" style="left:${f(lx - 40)}px;top:${f(ly - 13)}px"><span style="color:color-mix(in srgb,var(--color-cat-${c.cat}) 60%,var(--color-ink))">${c.name}</span></div>`;
    zigzag(c.mods.length, a0, a1).forEach(([r, deg], j) => {
      const id = c.mods[j];
      const [x, y] = pt(r, deg);
      slots += `<div class="slot pm-wheel-slot" data-go="${id}" data-name="${MODS[id].name}" role="button" aria-label="${MODS[id].name}" style="left:${f(x - 36)}px;top:${f(y - 36)}px;--pm-i:${k}"><div class="slotin"><div class="slotlift pm-tip-host"><span class="ic pm-lift">${modMark(id, W.ICON, { tilt: [-6, 5, -3, 7, -5][k++ % 5] })}</span>${tip(MODS[id].name)}</div></div></div>`;
    });
    a = a1;
  });
  const ring = `<path d="${handFill(circleCmds(W.RR2), { amp: 1, seed: 620, sp: 3, prec: 0 })}${handFill(circleCmds(W.RR1), { amp: 0.8, seed: 621, sp: 3, prec: 0 })}" fill="var(--color-yuzu)" fill-rule="evenodd" transform="translate(1.6 2)"></path><path class="ol" pathLength="1" d="${handStroke(circleCmds(W.RR2), { amp: 1.3, seed: 622, over: 0.05, sp: 3, prec: 0 })}" fill="none" stroke="var(--color-pen)" stroke-width="2.4" stroke-linecap="round"></path><path class="ol" pathLength="1" d="${handStroke(circleCmds(W.RR1), { amp: 1, seed: 623, over: 0.05, sp: 3, prec: 0 })}" fill="none" stroke="var(--color-pen)" stroke-width="1.8" stroke-linecap="round"></path>`;
  const pores = Array.from({ length: 32 }, (_, i) => { const [x, y] = pt(262 * K, i * 11.25 + 4); return `<circle cx="${f(x)}" cy="${f(y)}" r="1.7" fill="color-mix(in srgb,var(--color-cat-orange) 55%,var(--color-yuzu))"></circle>`; }).join('');
  const pith = `<path d="${handFill(circleCmds(W.PITH), { amp: 0.8, seed: 630, sp: 2.5 })}" fill="var(--color-card)"></path><path class="ol" pathLength="1" d="${handStroke(circleCmds(W.PITH), { amp: 1, seed: 631, over: 0.05, sp: 2.5 })}" fill="none" stroke="var(--color-pen)" stroke-width="2" stroke-linecap="round"></path>`;
  return `<div class="jp pm-scrim" role="dialog" aria-label="柚子瓣">
<div class="whl pm-wheel">
<svg class="pm-wheel-art" width="680" height="680" style="position:absolute;inset:0;overflow:visible" aria-hidden="true"><g class="spin pm-wheel-turn">${ring}${pores}${wedges}</g>${pith}</svg>
<div class="spin pm-wheel-turn" style="position:absolute;inset:0">${slots}${labels}</div>
<div class="nodrag pithc"><span class="faces">${faces(62, ['normal', 'wow', 'happy'])}</span><div class="soft" style="font-size:12px">${TODAY}</div>
<label class="pm-field wfield" data-hand="field" data-seed="640" data-r="12" data-fill="paper"><input class="wq" placeholder="去哪，或问柚子" aria-label="去哪，或问柚子"></label>
<button type="button" class="wask pm-press" hidden>${icon('sparkle', 13, 641)}<span></span></button></div>
</div>
<span class="corner soft" style="left:40px">＋ 分类</span><span class="corner soft" style="right:40px">已隐藏 2</span>
</div>`;
}

// ---------- 找东西：照 Phase 2 定稿（p2-final/search.mjs）——一张小票从顶上的出纸口打出来 ----------
const INDEX = [
  ['notes', '周末想去看海，顺路买一袋柚子。', '11 月 1 日'], ['notes', '柚子皮可以做糖，下次试试', '9 月 12 日'],
  ['books', '《海边的柚子树》', '在读 · 62%'], ['books', '《慢慢来的勇气》', '在读 · 18%'], ['books', '《雨停之前》', '读完 · 4 星'],
  ['films', '《柚子味的夏天》', '看完 · 5 星'], ['films', '《晚风》', '想看'],
  ['finance', '水果店 · 柚子', '9 月 30 日 · −26.00'], ['finance', '超市 · 柚子两个', '10 月 24 日 · −18.00'], ['finance', '午饭 · 牛肉面', '11 月 8 日 · −32.00'],
  ['todo', '买柚子回家剥给妈妈', '周六'], ['todo', '给猫买粮', '今天 · 做完了'],
  ['days', '小林生日', '11 月 13 日 · 还有 5 天'], ['days', '猫猫来家 3 周年', '11 月 20 日'],
];
const NEAR = { 柚子: [['packing', '秋天去果园的清单', '9 件'], ['notes', '橘子汽水的配方', '8 月 3 日']], 海: [['films', '《晚风》', '想看'], ['notes', '夏天的最后一次游泳', '8 月 28 日']] };
function search() {
  const RW = 520, n = 22, zz = [];
  for (let i = 0; i <= n * 2; i++) zz.push(`${((i / (n * 2)) * 100).toFixed(2)}% ${i % 2 ? 'calc(100% - 10px)' : '100%'}`);
  const clip = `polygon(0 0,100% 0,${zz.reverse().join(',')})`;
  return `<div class="sr pm-scrim pm-printer" role="dialog" aria-label="找东西">
<div class="pslot pm-print-slot" style="left:340px;top:50px"><div class="ps-body"></div><div class="ps-mouth"></div><div style="position:absolute;right:-18px;top:-16px">${face('pomelo-normal', 40, 10)}</div></div>
<div class="rcwrap" style="left:${640 - RW / 2 - 14}px;top:61px;width:${RW + 28}px">
<div class="rcpt pm-print-paper" style="width:${RW}px">
<div class="rpaper" style="clip-path:${clip}"></div>
<div style="position:relative;padding:20px 18px 30px">
<div class="soft" style="text-align:center;font-size:12px;line-height:18px">— 柚儿园 · 找东西 —</div>
<div class="sfield"><span class="soft" style="display:flex">${icon('search', 20, 902)}</span><input class="sq" aria-label="找东西" placeholder="找点什么…"><span class="soft scount" style="font-size:12px;white-space:nowrap"></span><span class="pm-rule sline" data-hand="rule" data-seed="901" data-sw="1.8"></span></div>
<div class="sres"></div>
<div class="soft" style="text-align:center;font-size:12px;line-height:18px;margin-top:16px;border-top:2px dashed var(--color-line);padding-top:10px">谢谢光临 · 柚子</div>
</div></div></div></div>`;
}

// ---------- 样式 ----------
const CSS = `
body{margin:0}
.root [hidden]{display:none !important}
.root{position:relative;width:1280px;height:800px;overflow:hidden;background:var(--color-desk);color:var(--color-ink)}
.app{position:absolute;inset:0}
.row{display:flex;align-items:center}
.soft{color:var(--color-ink-soft)}
.due{font-size:13px;color:var(--color-danger);margin-left:auto;white-space:nowrap}
.mk svg{display:block}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
/* 动静都在 Design System 的 bundle.css 里（schemes/pomelo/motion/ 的零件，build:ds 插进去，dw ds install 挂到这里）；这里只写样子 */
/* 顶栏 */
/* 顶栏的底色在纸下面（纸上边的子页纸签、左上角的贴纸能伸到顶栏里），顶栏上的东西在最上面 */
.topband{position:absolute;left:0;top:0;width:1280px;height:58px;z-index:4;background:var(--color-top)}
.bar{position:absolute;left:0;top:0;width:1280px;height:58px;z-index:40;color:var(--color-on-top);pointer-events:none}
.bar>*{pointer-events:auto}
.lights i{position:absolute;top:19.5px;width:12px;height:12px;border-radius:50%;display:block}
.hub{position:absolute;left:76px;top:3px;width:56px;height:52px;display:grid;place-items:center;border-radius:14px}
.hub:hover,.ib:hover,.navb:hover:not(:disabled),.ask:hover{background:color-mix(in srgb,var(--color-on-top) 8%,transparent)}
.navb{position:absolute;top:15px;width:28px;height:28px;display:grid;place-items:center;border-radius:8px}
.navb:disabled{opacity:.3;cursor:default}
.tohome{position:absolute;left:204px;top:15px;width:104px;height:28px;display:none;color:#20241F;font-size:15px}
.app[data-view=page] .tohome{display:block}
.tl{position:relative;z-index:1;height:100%;display:flex;align-items:center;justify-content:center;gap:4px;line-height:28px}
.right{position:absolute;right:10px;top:0;height:58px;display:flex;align-items:center;gap:8px}
.openlbl{font-size:12px;opacity:.7;margin-right:-2px}
.opens{display:flex;align-items:center;gap:0}
.ob{position:relative;width:40px;height:48px;display:grid;place-items:center}
.ob .ux{position:absolute;right:0;top:2px;width:17px;height:17px;border-radius:50%;background:var(--color-card);color:var(--color-ink);box-shadow:0 1px 3px var(--color-shadow);display:none;place-items:center}
.ob:hover .ux{display:grid}
.ob .ul{position:absolute;left:6px;right:6px;bottom:3px;height:6px;opacity:0}
.ob.on .ul{opacity:1}
.datechip{position:relative;height:30px;padding:0 13px;display:flex;align-items:center;font-size:13px;white-space:nowrap;color:var(--color-ink);margin:0 4px}
.ib{width:32px;height:32px;display:grid;place-items:center;border-radius:9px}
.ask{width:42px;height:42px;display:grid;place-items:center;border-radius:11px}
/* 桌面 */
.desk{position:absolute;inset:0;z-index:5}
.app[data-view=page] .desk{display:none}
.greet{position:absolute;left:92px;top:70px;pointer-events:none;display:flex;align-items:baseline;gap:12px}
.gw{font-size:var(--text-greeting);font-weight:700;line-height:1.15}
.gs{font-size:17px;color:var(--color-ink-soft)}
.note{position:absolute;touch-action:none;cursor:grab}
.note.drag{cursor:grabbing;z-index:30}
.brief{font-size:15px;line-height:1.85;margin:8px 0 0}
.brief-peel{position:absolute;right:-18px;top:-30px;z-index:5}
.page .slap.poke{pointer-events:auto;cursor:pointer;left:-26px;top:-36px}
.slap{position:absolute;z-index:3;pointer-events:none}
.pm-check{display:flex;align-items:center;gap:10px;font-size:15px}
.bar-out{position:relative;height:12px;margin-top:4px}
.bar-in{position:absolute;left:2px;top:2px;bottom:2px;border-radius:5px;background:var(--color-cat-sky)}
.rtape{position:absolute;left:92px;top:-12px;width:80px;height:24px}
.ystat{position:absolute;width:92px;height:92px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--color-on-sticky)}
.common{position:absolute;left:60px;top:672px;display:flex;align-items:flex-end;gap:10px;z-index:6}
.clabel{position:relative;width:64px;height:26px;margin-bottom:36px;color:#20241F;font-size:14px}
.dstk{display:flex;flex-direction:column;align-items:center;gap:2px;width:78px;font-size:13px;line-height:18px;white-space:nowrap}
.dstk .dic{display:grid;place-items:center;height:62px}
.bookic{position:relative;width:52px;height:52px !important;margin:5px 0;color:var(--color-pen)}
/* 模块页 */
.pages{position:absolute;inset:0;z-index:10;pointer-events:none}
/* 没打开的页不渲染（藏着的纸纹也会画出来） */
.page{position:absolute;left:36px;top:70px;width:1140px;height:712px;display:none;pointer-events:none}
.app[data-view=page] .page.on{display:block;pointer-events:auto;z-index:10}
.app[data-view=page] .page.st{display:block;pointer-events:auto;z-index:calc(8 - var(--j));transform:translate(calc(22px * (var(--j) + 1)),calc(4px * var(--j))) rotate(calc(.6deg + .8deg * var(--j)))}
.page.st .phead,.page.st .pbody,.page.st .ftabs,.page.st .slap{visibility:hidden}
.app .page.far{display:none}
.sheet{position:absolute;inset:0;padding:22px 40px 28px 64px;display:flex;flex-direction:column}
.phead{display:flex;align-items:baseline;gap:16px;padding-left:34px;min-height:40px}
.yzb{display:inline-block;margin-left:8px;vertical-align:2px}
.pbody{flex:1;min-height:0;margin-top:14px}
.pbody>.sub{height:100%}
.page .slap{left:-22px;top:-30px;z-index:20}
.peek{position:absolute;left:1114px;top:calc(100px + 92px * var(--j, 0));display:none;z-index:2}
.page.st .peek{display:block}
.ftabs{position:absolute;left:330px;top:-30px;height:40px;display:flex;gap:6px}
.ft{position:relative;height:40px;padding:0 18px;font-size:15px}
.ft-t{position:relative;display:block;line-height:30px}
.ft .ft-on{display:none;position:absolute;inset:0}
.ft .ft-off{position:absolute;inset:0}
.ft[aria-selected=true] .ft-on{display:block}
.ft[aria-selected=true] .ft-off{display:none}
.ft[aria-selected=true] .ft-t{font-weight:700}
.toolbar{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.chips{display:flex;gap:6px}
.pm-chip.is-all{background:var(--color-selected)}
.ledger{padding:10px 22px 12px}
.lhead,.lrow{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;align-items:center}
.lhead{height:34px;font-size:13px;color:var(--color-ink-soft);border-bottom:1.5px solid var(--color-line)}
.lday{display:flex;justify-content:space-between;align-items:center;height:34px;margin-top:6px;font-size:15px;font-weight:700}
.lrow{height:38px;font-size:15px;border-top:1px dashed var(--color-line)}
.ngrid{display:grid;grid-template-columns:repeat(2,440px);gap:22px 30px}
.dlist{display:grid;grid-template-columns:repeat(2,440px);gap:18px 30px;margin-top:16px}
.later{display:grid;place-items:center;height:100%}
/* 会动的柚子：几张脸叠着，显示 .app 的 data-face 那张；这一处没有那张就显示「平常」 */
.faces{display:inline-grid;line-height:0}
.faces .fc{grid-area:1/1;display:none}
.app[data-face=normal] .faces>.fc[data-face=normal],.app[data-face=normal] .faces:not(:has(>.fc[data-face=normal]))>.fc[data-face=normal]{display:inline-block}
.app[data-face=wink] .faces>.fc[data-face=wink],.app[data-face=wink] .faces:not(:has(>.fc[data-face=wink]))>.fc[data-face=normal]{display:inline-block}
.app[data-face=wow] .faces>.fc[data-face=wow],.app[data-face=wow] .faces:not(:has(>.fc[data-face=wow]))>.fc[data-face=normal]{display:inline-block}
.app[data-face=happy] .faces>.fc[data-face=happy],.app[data-face=happy] .faces:not(:has(>.fc[data-face=happy]))>.fc[data-face=normal]{display:inline-block}
.app[data-face=sleepy] .faces>.fc[data-face=sleepy],.app[data-face=sleepy] .faces:not(:has(>.fc[data-face=sleepy]))>.fc[data-face=normal]{display:inline-block}
.app[data-face=surprised] .faces>.fc[data-face=surprised],.app[data-face=surprised] .faces:not(:has(>.fc[data-face=surprised]))>.fc[data-face=normal]{display:inline-block}
.app[data-face=think] .faces>.fc[data-face=think],.app[data-face=think] .faces:not(:has(>.fc[data-face=think]))>.fc[data-face=normal]{display:inline-block}
.app[data-face=error] .faces>.fc[data-face=error],.app[data-face=error] .faces:not(:has(>.fc[data-face=error]))>.fc[data-face=normal]{display:inline-block}
.app:not([data-face]) .faces>.fc[data-face=normal]{display:inline-block}
/* 资产小票能翻面（motion/receipt-flip） */
.rface .pm-receipt{filter:drop-shadow(0 6px 10px var(--color-shadow))}
.rflip{position:absolute;right:10px;top:10px;display:flex;color:var(--color-pen);z-index:2}
/* 柚子那一页是横线本 */
.sheet.lined > [data-hand-painted]{background-image:repeating-linear-gradient(transparent 0 33px,color-mix(in srgb,var(--color-line) 85%,transparent) 33px 34.5px) !important;background-position:0 70px !important;background-size:auto !important}
/* 贴纸簿（Phase 2：p2-final/b.mjs） */
.bk{position:absolute;inset:0;z-index:50;background:rgba(20,24,18,.28);display:none}
.app[data-ov=book] .bk,.app[data-closing=book] .bk{display:block}
.book{position:absolute}
.bookpaper{position:absolute;inset:0}
.bookpaper > [data-hand-painted]{border-radius:18px;background-color:var(--color-card);background-image:repeating-linear-gradient(135deg,transparent 0 22px,color-mix(in srgb,var(--color-line) 45%,transparent) 22px 23.5px);box-shadow:0 -4px 10px var(--color-shadow),0 -20px 50px var(--color-shadow)}
.bin{position:relative;padding:30px 44px 0 48px}
.bhead{display:flex;align-items:center;gap:16px;margin-bottom:22px}
.bt{font-size:26px;font-weight:700;line-height:34px}
.bfield{width:300px;height:42px;margin-left:auto}
.bask{position:absolute;right:48px;top:86px;font-size:14px;color:var(--color-link);display:flex;align-items:center;gap:4px;white-space:nowrap}
.bgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 24px}
.bcat{min-height:150px}
.blab{position:relative;width:86px;height:26px;margin:0 0 8px 2px;color:#20241F;font-size:15px;font-weight:700;line-height:26px}
.bcells{display:flex;flex-wrap:wrap;gap:4px;width:456px}
.stk{position:relative;width:88px;height:104px;display:flex;flex-direction:column;align-items:center;gap:2px;touch-action:none;cursor:grab}
.stk .ghost{position:absolute;left:10px;top:2px;width:68px;height:68px;border:2px dashed var(--color-line);border-radius:22px;display:none}
.stk.is-held{cursor:grabbing}
.stklab{font-size:14px;line-height:20px;white-space:nowrap}
.usedtag{position:absolute;top:2px;right:0;font-size:11px;line-height:16px;color:var(--color-ink-soft);display:none}
.stk.used .stkart,.stk.used .stklab{opacity:.3}.stk.used .ghost,.stk.used .usedtag{display:block}
.stk.dim{opacity:.18}.stk.hit .stkart{filter:drop-shadow(0 0 8px var(--color-marker))}
.corner{position:absolute;bottom:24px;font-size:14px}
/* 柚子瓣（Phase 2：p2-final/wheel.mjs） */
.jp{position:absolute;inset:0;z-index:50;background:color-mix(in srgb,var(--color-desk) 58%,transparent);-webkit-backdrop-filter:blur(9px);backdrop-filter:blur(9px);display:none}
.app[data-ov=bloom] .jp,.app[data-closing=bloom] .jp{display:block}
.whl{position:absolute;left:300px;top:89px;width:680px;height:680px;touch-action:none;cursor:grab;--pm-a:0deg}
.whl .spin{transform:rotate(var(--pm-a));transform-origin:340px 340px}
.slot{position:absolute;width:72px;height:72px;cursor:pointer;transition:opacity .2s}
.slot:hover{z-index:5}
.slotin{transform:rotate(calc(-1 * var(--pm-a)))}
.slotlift{position:relative;width:72px;height:72px;display:grid;place-items:center}
.slotlift>.pm-tip{top:62px}
.slotlift .ic{display:flex}
.slot.dim{opacity:.16}
.slot.hit .slotlift .ic{filter:drop-shadow(0 0 6px var(--color-marker))}
.wl{position:absolute;width:80px;text-align:center}
.wl span{display:inline-block;transform:rotate(calc(-1 * var(--pm-a)));font-size:15px;font-weight:700;line-height:26px}
.pithc{position:absolute;left:213px;top:213px;width:254px;height:254px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.wfield{width:196px;height:38px}
.wfield input{text-align:center;font-size:15px}
.wask{position:absolute;left:27px;right:27px;top:198px;justify-content:center;font-size:13px;color:var(--color-link);display:flex;align-items:center;gap:4px;white-space:nowrap;overflow:hidden}
/* 找东西：小票打印机（Phase 2：p2-final/search.mjs） */
.sr{position:absolute;inset:0;z-index:55;background:rgba(20,24,18,.16);display:none}
.app[data-ov=search] .sr,.app[data-closing=search] .sr{display:block}
.pslot{position:absolute;width:600px;height:22px;z-index:3}
.ps-body{position:absolute;inset:0;border-radius:11px;background:var(--color-pen);box-shadow:0 3px 6px var(--color-shadow)}
.ps-mouth{position:absolute;left:40px;right:40px;top:9px;height:4px;border-radius:2px;background:rgba(0,0,0,.45)}
.rcwrap{position:absolute;height:730px;overflow:hidden;pointer-events:none}
.rcpt{position:absolute;left:14px;top:0;pointer-events:auto}
.rpaper{position:absolute;inset:0;background:var(--color-card);box-shadow:0 0 0 1px var(--color-line) inset}
.sfield{position:relative;display:flex;align-items:center;gap:10px;height:46px;margin:6px 4px 4px;padding:0 6px}
.sfield input{flex:1;min-width:0;font:inherit;font-size:19px;background:none;border:0;outline:none;color:inherit;caret-color:var(--color-pen)}
.sline{position:absolute;left:0;right:0;bottom:0;height:8px}
.sgh{display:flex;align-items:center;gap:6px;font-size:13px;height:26px;padding:0 12px;color:var(--color-ink-soft);margin-top:8px}
.srow{position:relative;display:flex;align-items:center;gap:12px;width:100%;height:36px;padding:0 12px;border-radius:9px;font-size:15px;text-align:left}
.srow .rt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.srow .rd{font-size:12px;white-space:nowrap;color:var(--color-ink-soft)}
.srow:hover{background:color-mix(in srgb,var(--color-selected) 55%,transparent)}
.srow.on{background:var(--color-selected)}
.snear{display:flex;align-items:center;gap:8px;margin:14px 4px 0;font-size:12px;color:var(--color-ink-soft)}
.snear i{flex:1;border-top:2px dashed var(--color-line)}
.snone{text-align:center;padding:18px 0 6px;font-size:15px}
.snone button{color:var(--color-link);margin-left:8px;display:inline-flex;align-items:center;gap:4px}
/* 顶栏「桌上开着」的小签挂在贴纸下面 */
.ob>.pm-tip{top:46px}
/* 下拉：钱来钱往的月份 */
.selwrap{position:relative;display:inline-block}
.selmenu{position:absolute;left:0;top:42px;width:172px;z-index:20}
/* 全做完：便签和小贴纸（motion/done-cheer），放在勾完的那张单子上面 */
.cheer{position:absolute;z-index:46;pointer-events:none}
.cheer .pm-cheer-note{position:absolute;left:-110px;top:-20px}
.cheer .pm-confetti{left:0;top:0}
/* 柚子那一页：一问一答 */
.chat{display:flex;flex-direction:column;height:100%}
.msgs{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;gap:18px;padding:0 20px 18px 0}
.me{display:flex;justify-content:flex-end}
.mebub{position:relative;max-width:460px;padding:12px 16px;font-family:var(--font-long);font-size:15px;line-height:1.65}
.yz{display:flex;align-items:flex-start;gap:10px;max-width:660px}
.yzav{flex:none;margin-top:-4px}
.yz .pm-answer{font-family:var(--font-long);font-size:15px;line-height:1.75;padding-top:2px}
.yz .thinking{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--color-ink-soft)}
.composer{display:flex;flex-direction:column;gap:10px;padding:0 20px 4px 0}
.sugs{display:flex;gap:10px}
.sug{position:relative;height:30px;padding:0 12px;font-size:14px;display:inline-flex;align-items:center;gap:5px}
.cfield{height:52px;padding:0 8px 0 16px}
.cfield input{font-family:var(--font-long);font-size:15px}
/* 减弱动态效果：停在最后的样子，不转、不弹 */
.root[data-motion=reduce] *,.root[data-motion=reduce] *::before{transition:none !important;animation:none !important}
@media (prefers-reduced-motion: reduce){.root *{transition:none !important;animation:none !important}}
`;

// 「柚子在想…」那一笔（和 motion/think-line 演示里是同一笔）
const THINK_PATH = handStroke(P('M10 30 C4 22 12 12 20 18 C28 24 22 34 16 28 C10 20 20 6 32 10 C40 13 40 22 34 22'), { amp: 0.6, wave: 10, seed: 3, sp: 1 });

// ---------- 画板 ----------
function board(file, title, cfg) {
  used.clear();
  const pages = Object.keys(MODS).map(page).join('\n');
  const parts = { desk: desk(), book: book(), bloom: bloom(), search: search(), bar: bar() };
  const props = {
    palette: { editor: 'enum', options: PALETTES, default: PALETTES[0], section: '配色' },
    dark: { editor: 'boolean', default: false, section: '配色' },
    reduce: { editor: 'boolean', default: false, section: '动效', label: '减弱动态效果' },
    $preview: { width: 1280, height: 800 },
  };
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="ds/pomelo/tokens.css">
<link rel="stylesheet" href="ds/pomelo/components/bundle.css">
<script src="ds/pomelo/components/bundle.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
${CSS}
</style>
</helmet>
<div class="pm root" data-palette="{{palette}}" data-theme="{{theme}}" data-motion="{{motion}}">
<div class="app" data-view="home">
<div class="pm-desk deskbg" data-hand="desk" data-seed="700" style="position:absolute;inset:0"></div>
${sprite()}
<div class="topband"></div>
${parts.desk}
<div class="pages">
${pages}
</div>
${parts.book}
${parts.bloom}
${parts.search}
${parts.bar}
</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${JSON.stringify(props).replace(/'/g, '&#39;')}'>
const CFG = ${JSON.stringify({ ...cfg, thinkPath: THINK_PATH, avatar: faces(34, ['normal', 'think', 'happy']), mods: Object.fromEntries(Object.entries(MODS).map(([k, m]) => [k, { name: m.name }])), order: CATS.flatMap((c) => c.mods), index: INDEX, near: NEAR })};
${APP_JS}
class Component extends DCLogic {
  renderVals() {
    return { palette: this.props.palette ?? 'blue', theme: this.props.dark ? 'dark' : 'light', motion: this.props.reduce ? 'reduce' : 'full' };
  }
  componentDidMount() { this.stop = Pomelo.paintLive(document.body); PomeloFrame.start(document.querySelector('.app'), CFG); }
  componentDidUpdate() { Pomelo.paint(document.body); }
  componentWillUnmount() { this.stop && this.stop(); }
}
</script>
</body>
</html>
`;
  writeFileSync(path.join(PROJECT, PREFIX + file), html);
  console.log(file, (html.length / 1024).toFixed(0) + ' KB');
  return { file: PREFIX + file, title };
}

const boards = [
  board('Main.dc.html', '桌面', { view: 'home', open: ['finance', 'notes', 'days'] }),
  board('Page.dc.html', '模块页 · 钱来钱往（开着的页叠在右边）', { view: 'page', open: ['finance', 'days', 'notes', 'todo'] }),
  board('Bloom.dc.html', '柚子瓣', { view: 'home', open: ['finance', 'youzi'], overlay: 'bloom' }),
  board('Book.dc.html', '贴纸簿（模块坞）', { view: 'home', open: ['finance', 'youzi'], overlay: 'book' }),
  board('Search.dc.html', '找东西（小票）', { view: 'home', open: ['finance'], overlay: 'search', sq: '柚子' }),
];

// ---------- canvas.json（只动这一页） ----------
writePage({
  id: PG, name: 'R1：外框（B3）', prefix: PREFIX,
  boards: boards.map((b, i) => ({ file: b.file, x: (i % 3) * 1400, y: Math.floor(i / 3) * 960, w: 1280, h: 800, title: b.title, is_interactive: true, radius: 12 })),
});
console.log(`pomelo-explore/frame：${boards.length} 张画板`);
