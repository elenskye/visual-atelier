// 见字如面（Pomelo v1.0 Phase 1）：新模块「见字如面」的设计。11-12 在现用账号的云端画布上给站主批（11-13 批了，云端停在那一轮），
// 2026-11-13 从单独的 pomelo-notes 画布并进 Pomelo Explore，写三页：
//   x5         EX5：见字如面的贴纸（三个方案挑一个，定了 B）     X5-Sticker
//   notes      R6：见字如面原型（三栏、两种格式条、右键的格式、加密的笔记、专心写、设置）  Notes-*
//   notes-pdf  R7：见字如面格式条、PDF（格式条和新画的图标、导出的设置、PDF 的两种样式）  Notes-*
// 外框照 pomelo-explore 外框（B3）的 Frame-Page；手画的框、线、勾选都用挂上的 Design System「Pomelo 柚儿园」（project/ds/pomelo/）。
// 贴纸、柚子、界面小图标都取 schemes/pomelo/marks/ 生成好的（新画的 19 个图标和贴纸 B 站主 11-13 批了，已搬进方案）；
// drafts.mjs 只剩没选上的两个贴纸方案。
// 假数据：笔记、金额、人名都是编的。用法：在仓库根目录 node canvases/pomelo-explore/notes/gen.mjs
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { rootImport, fromRoot } from '../../_lib/root.mjs';
import { PROJECT, writePage, dsBoard, esc } from '../page.mjs';
import { DRAFT_STICKERS, STICKER_PICK } from './drafts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { loadTokens } = await rootImport('tooling/lib/common.mjs');
const { makeCtx } = await rootImport('tooling/handmade/marks.mjs');
const ICONS = await rootImport('schemes/pomelo/marks/icons.mjs');
const tokens = loadTokens('pomelo');
const mctx = makeCtx(tokens);
const PALETTES = Object.keys(tokens.color.palettes);
const CSS = readFileSync(path.join(HERE, 'notes.css'), 'utf8');
const APP_JS = readFileSync(path.join(HERE, 'app.js'), 'utf8');
const TODAY = '11 月 8 日 · 周日';

// ---------- 每张画板里的图：图标和贴纸都只定义一次（<symbol>），各处 <use> ----------
let SYM = new Map();
const symbol = (id, vb, inner) => { if (!SYM.has(id)) SYM.set(id, { vb, inner }); return id; };
const sprite = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${[...SYM].map(([id, s]) => `<symbol id="${id}" viewBox="${s.vb}">${s.inner}</symbol>`).join('')}</defs></svg>`;
const innerOf = (svg) => svg.trim().replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const vbOf = (svg) => /viewBox="([^"]+)"/.exec(svg)[1];
/** 界面小图标（24 格，跟着字的颜色）。 */
function ic(name, size = 18) {
  if (!ICONS.UI_ICONS[name]) throw new Error(`没有图标 ${name}`);
  symbol(`i-${name}`, '0 0 24 24', innerOf(ICONS.uiIconSvg(name, tokens.handmade.uiIcon)));
  return `<span class="ico" aria-hidden="true"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><use href="#i-${name}" width="24" height="24"></use></svg></span>`;
}
/** 方案里生成好的贴纸、柚子（file 是 marks/ 下的路径，不带 .svg），或起稿的贴纸（draft:<key>）。 */
function art(file, w, { tilt = 0, cls = '', tint = null } = {}) {
  let svg;
  if (file.startsWith('draft:')) {
    const k = file.slice(6);
    svg = mctx.svg(DRAFT_STICKERS[k], { view: '-8 -8 80 80', size: 64, k: 1, idp: `pm-d-${k}-`, label: DRAFT_STICKERS[k].name, tint: true });
  } else svg = readFileSync(fromRoot(`schemes/pomelo/marks/${file}.svg`), 'utf8');
  const id = `s-${file.replace(/[^a-z0-9]+/gi, '-')}`;
  const vb = vbOf(svg);
  symbol(id, vb, innerOf(svg));
  const [, , vw, vh] = vb.split(' ').map(Number);
  const h = Math.round((w * vh) / vw);
  const vars = tint ? `--mark-color:var(--color-cat-${tint});--mark-color-soft:var(--color-cat-${tint}-sticker);` : '';
  return `<span class="mk ${cls}" style="display:inline-block;line-height:0;flex:none;${vars}${tilt ? `transform:rotate(${tilt}deg);` : ''}"><svg width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" style="display:block;overflow:visible" aria-hidden="true"><use href="#${id}" width="${vw}" height="${vh}"></use></svg></span>`;
}
/** 见字如面的贴纸：三个方案都放进去，按 Tweaks 的「见字如面的贴纸」显示一张。 */
const pickArt = (k) => (k === 'articles' ? 'modules/articles' : `draft:${k}`);
const notesMark = (size, o = {}) => STICKER_PICK.map((k, i) => art(pickArt(k), size, { ...o, cls: `var var-${'abc'[i]} ${o.cls ?? ''}` })).join('');
const tip = (t) => `<span class="pm-tip" role="tooltip"><span class="pm-tip-string"></span><span class="pm-tip-tag">${t}</span></span>`;
let SEED = 1000;
const seed = () => ++SEED;
function tapeStrip({ kind = 'mint', rot = -2 } = {}) {
  const n = 4, zz = [];
  for (let i = 0; i <= n * 2; i++) zz.push(`${i % 2 ? 6 : 0}px ${Math.round((i / (n * 2)) * 1000) / 10}%`);
  const right = zz.map((p) => { const [x, y] = p.split(' '); return `calc(100% - ${x}) ${y}`; }).reverse();
  const [a, b] = kind === 'mint' ? ['tape-mint-a', 'tape-mint-b'] : ['tape-yuzu-a', 'tape-yuzu-b'];
  return `<span aria-hidden="true" style="position:absolute;inset:0;transform:rotate(${rot}deg);opacity:.88;clip-path:polygon(${[...zz, ...right].join(',')});background:repeating-linear-gradient(45deg,var(--color-${a}) 0 7px,var(--color-${b}) 7px 14px)"></span>`;
}

// ---------- 外框：顶栏、桌面、叠着的页（照外框 B3） ----------
function bar() {
  const lights = ['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => `<i style="left:${14 + i * 20}px;background:${c}"></i>`).join('');
  const opens = [['notes', notesMark(30), '见字如面', true], ['todo', art('modules/todo', 30), '一步一步'], ['finance', art('modules/finance', 30), '钱来钱往']]
    .map(([, m, n, on]) => `<button type="button" class="ob pm-tip-host${on ? ' on' : ''}" aria-label="${n}">${m}<span class="ul" data-hand="underline" data-seed="${seed()}"></span>${tip(n)}</button>`).join('');
  return `<header class="bar">
<span class="lights" aria-hidden="true">${lights}</span>
<button type="button" class="hub pm-tip-host" aria-label="柚子瓣">${art('pomelo/pomelo-normal', 50, { tilt: -8 })}${tip('柚子瓣')}</button>
<button type="button" class="navb pm-tip-host" aria-label="后退" style="left:140px">${ic('chevron-left', 20)}${tip('后退')}</button>
<button type="button" class="navb" aria-label="前进" style="left:168px" disabled>${ic('chevron-right', 20)}</button>
<button type="button" class="tohome">${tapeStrip({ kind: 'mint', rot: -2 })}<span class="tl">${ic('back-desk', 17)}回桌面</span></button>
<div class="right">
  <span class="openlbl">桌上开着</span><span class="opens">${opens}</span>
  <button type="button" class="ib pm-tip-host" aria-label="新开一页">${ic('plus', 20)}${tip('新开一页')}</button>
  <span class="datechip" data-hand="frame" data-r="4" data-fill="card" data-tilt="1.5" data-sw="1.4" data-amp="0.5" data-seed="701"><span>${TODAY}</span></span>
  <button type="button" class="ib pm-tip-host" aria-label="找东西">${ic('search', 21)}${tip('找东西')}</button>
  <button type="button" class="ib pm-tip-host" aria-label="设置">${ic('settings', 21)}${tip('设置')}</button>
  <button type="button" class="ask pm-tip-host" aria-label="问柚子">${art('pomelo/ai-button', 36)}${tip('问柚子')}</button>
</div>
</header>`;
}
const stacked = () => [['todo', '一步一步'], ['finance', '钱来钱往']].map(([id, n], j) => `<div class="page st" style="--j:${j}" aria-hidden="true">
<section class="pm-sheet sheet" data-hand="sheet" data-seed="${910 + j * 3}" data-tilt="-0.3"><span></span></section>
<button type="button" class="peek pm-page-peek pm-tip-host" style="--j:${j}" aria-label="换到「${n}」">${art(`modules/${id}`, 46)}${tip(n)}</button>
</div>`).join('');

// ---------- 编的笔记 ----------
/** 一张照片（编的，平涂的小画）：东京的街口，夕阳和鸟居。 */
function photo(w, h, { crop = false } = {}) {
  const vb = crop ? '70 20 180 180' : '0 0 320 200';
  return `<svg width="${w}" height="${h}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<rect width="320" height="200" fill="var(--color-cat-orange-tint)"/><circle cx="214" cy="78" r="34" fill="var(--color-yuzu)"/>
<path d="M0 132 C60 104 120 110 170 128 C220 146 270 120 320 112 L320 200 L0 200 Z" fill="var(--color-cat-mint-sticker)"/>
<path d="M0 158 C70 140 140 150 200 162 C250 172 290 160 320 154 L320 200 L0 200 Z" fill="var(--color-leaf)" opacity=".75"/>
<g fill="var(--color-cat-pink)"><rect x="92" y="96" width="9" height="70" rx="2"/><rect x="146" y="96" width="9" height="70" rx="2"/><rect x="78" y="88" width="91" height="9" rx="3"/><rect x="86" y="106" width="75" height="6" rx="2"/></g>
<path d="M30 60 q8 -6 16 0 M48 52 q7 -5 14 0" stroke="var(--color-art-ink)" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
}
function photo2(w, h) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 180 180" aria-hidden="true"><rect width="180" height="180" fill="var(--color-cat-sky-tint)"/>
<g fill="var(--color-cat-sky-sticker)"><rect x="18" y="40" width="40" height="120" rx="4"/><rect x="66" y="22" width="44" height="138" rx="4"/><rect x="118" y="54" width="44" height="106" rx="4"/></g>
<g stroke="var(--color-art-ink)" stroke-width="2.2" stroke-linecap="round"><path d="M10 60 L170 60 M10 100 L170 100 M10 140 L170 140"/></g>
<g fill="var(--color-heart)"><circle cx="40" cy="30" r="3"/><circle cx="120" cy="40" r="3"/><circle cx="150" cy="24" r="3"/></g></svg>`;
}

const NOTES = [
  { id: 'plan', title: '十一月的计划', pin: true, pre: '读完两本书，把东京的照片整理好，给小林寄生日礼物，学会做一道新菜。', date: '11 / 01', crumb: '随笔' },
  { id: 'tokyo', title: '东京的第三天', pre: '早上被楼下面包店的香味叫醒。今天的计划是谷中银座和根津，走路就能到，慢慢逛。', date: '11 / 06', thumb: 'photo', crumb: '旅行 / 2026 东京' },
  { id: 'tokyo2', title: '东京的第二天', pre: '雨下了一整天，躲进神保町的旧书店，买到一本 1987 年的旅行手册。', date: '11 / 05', thumb: 'photo2', crumb: '旅行 / 2026 东京' },
  { id: 'rust', title: 'Rust 生命周期笔记', pre: '生命周期不是让值活得更久，而是告诉编译器几个引用之间谁比谁活得长。', date: '11 / 02', crumb: '学习 / 编程' },
  { id: 'book', title: '读《夜航西飞》', pre: '「我学会了，一个人可以在不完美里活得很好。」这句抄在书签上。', date: '10 / 28', crumb: '读书 / 摘抄' },
  { id: 'letter', title: '给小林的生日信', lock: true, date: '10 / 20', crumb: '加密的' },
  { id: 'health', title: '体检报告和医生的话', lock: true, date: '09 / 12', crumb: '加密的', only: true },
  { id: 'stew', title: '番茄牛腩', pre: '牛腩冷水下锅，焯水后和番茄一起炖一个半小时，最后放土豆。', date: '10 / 24', crumb: '生活 / 做饭' },
  { id: 'slow', title: '关于慢慢来', pre: '最近总在赶，赶完一件又一件。其实没有人在后面追我。', date: '10 / 15', crumb: '随笔' },
];
function listRows(active, ids = NOTES.filter((n) => !n.only).map((n) => n.id)) {
  return ids.map((id) => NOTES.find((n) => n.id === id)).map((n) => `<button type="button" class="nrow${n.id === active ? ' on' : ''}" data-doc="${n.id}" data-crumb="${esc(n.crumb)}"><span class="pk" data-hand="pick" data-seed="${seed()}"></span>
<div class="nmain"><div class="ntitle">${n.pin ? ic('pin', 14) : ''}${n.lock ? ic('lock', 14) : ''}<span>${n.title}</span></div>
${n.lock ? '<div class="nlock">锁着</div>' : `<div class="npre">${n.pre}</div>`}<div class="ndate">${n.date}</div></div>
${n.thumb ? `<span class="nthumb">${n.thumb === 'photo' ? photo(54, 54, { crop: true }) : photo2(54, 54)}</span>` : ''}</button>`).join('');
}

const hash = (t) => `<span class="hash">#${t}</span>`;
const B = (t, cur) => (cur ? `<span class="mkd">**</span><strong>${t}</strong><span class="mkd">**</span>` : `<strong>${t}</strong>`);
function check(t, on) {
  return `<button type="button" class="pm-check" role="checkbox" aria-checked="${on}"><span data-hand="check" data-seed="${seed()}"></span><span class="pm-check-text" data-hand="strike" data-seed="${seed()}">${t}</span></button>`;
}
function tokyoDoc() {
  return `<h1>东京的第三天</h1>
<p class="dmeta"><span>11 月 6 日 · 周四</span><span>改于 10 分钟前</span><span>1,286 字</span></p>
<p>${hash('旅行/2026东京')} ${hash('随笔')}</p>
<p>早上被楼下面包店的香味叫醒。今天的计划是${B('谷中银座', true)}<i class="caret"></i>和根津，走路就能到，慢慢逛。</p>
<h2>上午 · 谷中银座</h2>
<p>坐 <code>千代田线</code> 到千驮木，出站往右拐。商店街比想象中短，<span class="hl">但每一家都很好逛</span>。猫比人多，台阶上那只三花一直跟着我们<sup class="fn">1</sup>。</p>
<figure class="pic"><div class="ph">${photo(300, 188)}</div><figcaption>夕阳阶梯 · IMG_2041.jpg</figcaption></figure>
<h3>买到的东西</h3>
<div class="todo">${check('手工明信片 × 3', true)}${check('炸肉饼，边走边吃', true)}${check('给小林的猫咪书签', false)}</div>
<blockquote>「慢慢来，比较快。」—— 在根津神社的绘马上看到的</blockquote>
<div class="call tip"><div class="chd">${ic('lightbulb', 16)}提示</div><p>周四一半的店休息，下次挑周末来。</p></div>
<h2>今天花了多少</h2>
<table class="tbl"><tr><th>什么</th><th class="r">日元</th></tr><tr><td>地铁一日券</td><td class="r">¥600</td></tr><tr><td>明信片</td><td class="r">¥1,320</td></tr><tr><td>午饭 · 荞麦面</td><td class="r">¥1,050</td></tr><tfoot><tr><td>合计</td><td class="r">¥2,970</td></tr></tfoot></table>
<p>晚上回去读了一会儿 <span class="wl"><span class="mkd">[[</span>读《夜航西飞》<span class="mkd">]]</span></span>，<u>想把这几天的路线整理成一篇</u>。<del>明天去镰仓</del>改成后天。</p>
<div class="fns">1. 后来查了，这一带的猫都有人喂。</div>
<div class="back"><div class="bh">${ic('corner-down-right', 15)}被这几篇引用 · 2</div><div class="bl"><b>十一月的计划</b><span class="soft">· 把东京的照片整理好…</span></div><div class="bl"><b>关于慢慢来</b><span class="soft">· 就像那天在根津…</span></div></div>`;
}
function rustDoc(sel) {
  return `<h1>Rust 生命周期笔记</h1>
<p class="dmeta"><span>11 月 2 日 · 周日</span><span>改于昨天</span><span>2,034 字</span></p>
<p>${hash('学习/编程')}</p>
<p>生命周期不是让值活得更久，<span class="${sel ? 'sel' : ''}">而是告诉编译器几个引用之间谁比谁活得长</span>。<span class="hl g">能编译</span>、<span class="hl r">编译不过</span>、<span class="hl b">待查</span>、<span class="hl p">问柚子</span>，四种颜色各标一处。</p>
<pre><span class="plang">rust ${ic('copy', 14)}</span><code><span class="k">fn</span> <span class="fnn">longest</span>&lt;<span class="k">'a</span>&gt;(x: &amp;<span class="k">'a</span> <span class="k">str</span>, y: &amp;<span class="k">'a</span> <span class="k">str</span>) -&gt; &amp;<span class="k">'a</span> <span class="k">str</span> {
    <span class="k">if</span> x.<span class="fnn">len</span>() &gt; y.<span class="fnn">len</span>() { x } <span class="k">else</span> { y }
}
<span class="c">// 返回值活不过 x 和 y 里短的那个
</span><span class="k">let</span> s = <span class="s">"柚子"</span>.<span class="fnn">to_string</span>();</code></pre>
<div class="call"><div class="chd">${ic('callout', 16)}注意</div><p>结构体里放引用，结构体本身也要带上生命周期。</p></div>
<h2>平均要查几次</h2>
<div class="math">T(n) = <span class="fr"><span>1</span><span>n</span></span> ∑<sub>i=1</sub><sup>n</sup> log<sub>2</sub> i ≈ log<sub>2</sub> n</div>
<h2>借用检查的流程</h2>
<div class="mer"><span class="mbox" data-hand="frame" data-r="8" data-sw="1.5" data-seed="${seed()}">写代码</span><svg class="marr" viewBox="0 0 38 14"><path d="M2 7 L34 7 M28 2 L34 7 L28 12" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="mbox" data-hand="frame" data-r="8" data-sw="1.5" data-fill="selected" data-seed="${seed()}">借用检查</span><svg class="marr" viewBox="0 0 38 14"><path d="M2 7 L34 7 M28 2 L34 7 L28 12" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="mbox" data-hand="frame" data-r="8" data-sw="1.5" data-seed="${seed()}">能跑</span></div>
<div class="fold">${ic('chevron-right', 16)}练习题<span class="more">· 折起来了 5 段</span></div>
<p>明天把第 10 章的例子再敲一遍，${B('不看答案')}。</p>`;
}
function letterLocked() {
  return `<div class="locked"><span class="bigfp">${ic('lock', 44)}</span><div class="lt">给小林的生日信</div><div class="ls">锁着 · 10 月 20 日</div>
<button type="button" class="pm-btn unlock" data-hand="button" data-seed="${seed()}" data-open="letter-open">${ic('fingerprint', 16)}用 Touch ID 打开</button></div>`;
}
function letterDoc() {
  return `<h1>给小林的生日信</h1><p class="dmeta"><span>10 月 20 日 · 周一</span><span>${ic('lock', 13)}加密的</span><span>612 字</span></p>
<p>小林：</p><p>生日快乐！今年认识你的第七年。记得第一次见面是在学校图书馆，你借走了我正想借的那本书，后来干脆一起看完了。</p>
<p>${B('今年想和你一起做的三件事')}：去海边看一次日出；把那本菜谱从头做到尾；一起养一盆不会死的植物。</p><p>—— 写于东京回来以后</p>`;
}
const DOCS = { tokyo: () => tokyoDoc(), rust: (o) => rustDoc(o.sel), letter: () => letterLocked(), 'letter-open': () => letterDoc() };

// ---------- 左栏 ----------
function side(active) {
  const fixed = [['all', 'notebook', '全部笔记', 143], ['pin', 'pin', '置顶', 3], ['untag', 'tag-off', '没标签的', 9], ['archive', 'archive', '归档', 12], ['trash', 'trash-2', '废纸篓', 4], ['lock', 'lock', '加密的', 2]];
  const row = ([id, icon, name, n]) => `<button type="button" class="srow${id === active ? ' on' : ''}" data-side="${id}"><span class="pk" data-hand="pick" data-seed="${seed()}"></span>${ic(icon, 17)}<span class="lbl">${name}</span><span class="n">${n}</span></button>`;
  const tw = (open) => `<span class="tw">${ic(open ? 'chevron-down' : 'chevron-right', 12)}</span>`;
  const tag = (id, icon, name, n, d, open) => `<button type="button" class="srow ${d}${id === active ? ' on' : ''}" data-side="${id}"><span class="pk" data-hand="pick" data-seed="${seed()}"></span>${open === undefined ? '<span class="tw"></span>' : tw(open)}${icon ? ic(icon, 16) : ''}<span class="lbl">${name}</span><span class="n">${n}</span></button>`;
  return `<div class="side">
<div class="shead"><h1 class="pm-sheet-title">见字如面</h1></div>
${fixed.map(row).join('')}
<div class="srule"></div>
<div class="tree">
${tag('t-trip', 'plane', '旅行', 18, '', true)}${tag('t-tokyo', '', '2026 秋天的东京', 6, 'd1')}${tag('t-kyoto', '', '京都', 4, 'd1')}
${tag('t-book', 'book-open', '读书', 31, '', true)}${tag('t-quote', '', '摘抄', 17, 'd1')}
${tag('t-study', 'graduation-cap', '学习和编程笔记', 22, '', false)}${tag('t-life', 'coffee', '生活', 27, '', false)}${tag('t-work', 'briefcase', '工作', 19)}${tag('t-essay', 'pen-line', '随笔', 26)}
</div></div>`;
}
// ---------- 中间的列表（和正文合在一张卡里，上面不写「全部笔记 · N 篇」） ----------
function mid(active, ids) {
  return `<div class="mid">
<div class="mtop"><label class="pm-field" data-hand="field" data-seed="${seed()}"><span class="ico soft" style="margin:0 6px 0 2px">${ic('search', 16)}</span><input placeholder="找一篇…" aria-label="找一篇"></label>
<button type="button" class="rb pm-btn--icon pm-tip-host" data-hand="round" data-seed="${seed()}" aria-label="新写一篇">${ic('square-pen', 18)}${tip('新写一篇')}</button></div>
<div class="listwrap"><div class="list" data-nolint>${listRows(active, ids)}</div></div>
</div>`;
}
// ---------- 格式条 ----------
const fb = (icon, name, extra = '', cls = '') => `<button type="button" class="fb pm-tip-host ${cls}" aria-label="${name}">${ic(icon, 18)}${extra}${tip(name)}</button>`;
const sep = '<span class="fsep" aria-hidden="true"></span>';
function formatBar(cls = '') {
  return `<div class="fbar ${cls}" data-hand="field" data-r="12" data-seed="${seed()}">
${fb('heading', '标题', `<span class="dn">${ic('chevron-down', 12)}</span>`)}${sep}
${fb('bold', '加粗')}${fb('italic', '斜体')}${fb('underline', '下划线')}${fb('strikethrough', '删除线')}${fb('highlighter', '高亮', '<span class="fdot"></span>')}${sep}
${fb('list', '列表')}${fb('list-ordered', '编号')}${fb('list-checks', '待办')}${sep}
${fb('quote', '引用', '', 'opt')}${fb('code', '代码', '', 'opt')}${fb('link-2', '链接')}${fb('wikilink', '互链', '', 'opt')}${sep}
${fb('paperclip', '图片和附件')}${fb('ellipsis', '更多格式')}
<button type="button" class="fb pin on pm-tip-host" aria-label="格式条一直在">${ic('pin', 18)}${tip('一直在')}</button>
</div>`;
}
function floatBar(cls = '') {
  return `<div class="float ${cls}" data-hand="field" data-r="12" data-seed="${seed()}">
${fb('bold', '加粗')}${fb('italic', '斜体')}${fb('underline', '下划线')}${fb('strikethrough', '删除线')}${fb('highlighter', '高亮', '<span class="fdot"></span>')}${sep}
${fb('code', '代码')}${fb('link-2', '链接')}${fb('wikilink', '互链')}${sep}${fb('ellipsis', '更多格式')}
<button type="button" class="fb pin pm-tip-host" aria-label="钉住格式条">${ic('pin-off', 18)}${tip('钉住')}</button>
</div>`;
}
// ---------- 右键的那条纸 ----------
function ctxMenu() {
  const it = (icon, name, keys = '') => `<button type="button" class="pm-menu-item">${ic(icon, 16)}<span>${name}</span>${keys ? `<span class="keys">${keys}</span>` : ''}</button>`;
  const rule = '<div class="pm-menu-item grp" aria-hidden="true"></div>';
  const lib = ['star', 'heart', 'flower-2', 'leaf', 'sun', 'moon', 'coffee', 'cat', 'camera', 'music', 'plane', 'map-pin', 'book-open', 'lightbulb', 'sparkles', 'gift', 'flame', 'smile', 'trophy', 'pin', 'tag', 'alarm-clock', 'calendar-heart', 'mountain', 'sprout', 'headphones', 'utensils'];
  return `<div class="ctx pm-menu" role="menu">
<div class="cv" data-v="fmt" style="display:contents">
${it('bold', '加粗', '⌘B')}${it('italic', '斜体', '⌘I')}${it('underline', '下划线', '⌘U')}${it('strikethrough', '删除线', '⌘⇧E')}${it('highlighter', '高亮', '⌘⇧H')}${it('code', '行内代码', '⌘⇧C')}${it('link-2', '链接', '⌘K')}${it('wikilink', '互链', '[[')}
${rule}
${it('heading', '标题', '⌘1–6')}${it('list', '列表')}${it('list-ordered', '编号列表')}${it('list-checks', '待办')}${it('quote', '引用')}${it('code-block', '代码块')}${it('callout', '提示框')}${it('table', '表格')}${it('divider', '分隔线')}
${rule}
<button type="button" class="pm-menu-item" data-cv="lib">${ic('sparkle', 16)}<span>柚儿园图标</span><span class="keys">${ic('chevron-right', 14)}</span></button>
</div>
<div class="cv" data-v="lib" hidden style="display:contents">
<button type="button" class="pm-menu-item back" data-cv="fmt">${ic('chevron-left', 16)}<span>柚儿园图标</span></button>
<div class="pm-menu-item gridcell"><div class="igrid">${lib.map((k) => `<span class="icell">${ic(k, 20)}</span>`).join('')}</div></div>
</div>
</div>`;
}
// ---------- 导出的设置 ----------
function miniPages(kind) {
  const lines = (n, w0 = 80) => Array.from({ length: n }, (_, i) => `<i style="display:block;height:3px;margin:3px 0;width:${w0 - (i % 3) * 12}%;border-radius:2px;background:${kind === 'pomelo' ? 'var(--color-ink-soft)' : '#9a9a94'};opacity:.55"></i>`).join('');
  const bg = kind === 'pomelo' ? 'background:var(--color-paper);background-image:linear-gradient(var(--color-grid) 1px,transparent 1px),linear-gradient(90deg,var(--color-grid) 1px,transparent 1px);background-size:8px 8px' : 'background:var(--color-print-paper)';
  const title = kind === 'pomelo' ? `<i style="display:block;width:70%;height:6px;border-radius:3px;background:var(--color-ink);margin:2px 0 4px"></i><i style="display:block;width:46%;height:5px;border-radius:3px;background:var(--color-marker);margin-top:-7px;opacity:.8"></i>` : '<i style="display:block;width:64%;height:5px;background:#222;margin:2px auto 5px"></i>';
  return `<div class="mini"><div class="mp" style="${bg};padding:10px 8px">${title}${lines(4)}<i style="display:block;height:6px"></i>${lines(5)}</div><div class="mp" style="${bg};padding:10px 8px">${lines(6)}<i style="display:block;height:12px;margin:5px 0;border-radius:2px;background:${kind === 'pomelo' ? 'var(--color-cat-mint-tint)' : '#eee'}"></i>${lines(5)}</div></div>`;
}
const seg = (key, opts, on) => `<div class="pm-seg" data-hand="field" data-seed="${seed()}" role="group" data-set="${key}">${opts.map(([v, t, cap]) => `<button type="button" class="pm-seg-item" aria-pressed="${v === on}" data-v="${v}" data-cap="${cap ?? t}"${v === on ? ` data-hand="pick" data-seed="${seed()}"` : ''}>${t}</button>`).join('')}</div>`;
function exportDialog() {
  const chk = (t, on) => `<button type="button" class="pm-check" role="checkbox" aria-checked="${on}"><span data-hand="check" data-seed="${seed()}"></span><span>${t}</span></button>`;
  return `<div class="scrim"><div class="dlg pm-card" data-hand="card" data-seed="${seed()}" role="dialog" aria-label="导出">
<h2>导出</h2><div class="dsub">「东京的第三天」· 1 篇</div>
<div class="drow"><span class="dlab">格式</span><div class="dval">${seg('fmt', [['md', 'Markdown'], ['pdf', 'PDF'], ['docx', 'Word']], 'pdf')}</div></div>
<div class="drow"><span class="dlab">样式</span><div class="dval styles">
<button type="button" class="sty on" data-hand="cell" data-fill="card" data-seed="${seed()}"><span class="pk" data-hand="pick" data-seed="${seed()}"></span>${miniPages('pomelo')}<span class="stname">柚儿园${ic('check', 16)}</span></button>
<button type="button" class="sty" data-hand="cell" data-fill="card" data-seed="${seed()}"><span class="pk" data-hand="pick" data-seed="${seed()}"></span>${miniPages('print')}<span class="stname">印刷${ic('check', 16)}</span></button>
</div></div>
<div class="drow"><span class="dlab">印上</span><div class="dval checks">${chk('目录', true)}${chk('页眉和页码', true)}${chk('标签和日期', false)}</div></div>
<div class="drow"><span class="dlab">存到</span><div class="dval dpath"><span class="pm-field" data-hand="field" data-seed="${seed()}">下载 / 见字如面</span><button type="button" class="pm-btn pm-btn--plain" data-hand="button" data-fill="card" data-seed="${seed()}">选择…</button></div></div>
<div class="dfoot"><button type="button" class="pm-btn pm-btn--plain dlg-x" data-hand="button" data-fill="card" data-seed="${seed()}">取消</button><button type="button" class="pm-btn" data-hand="button" data-seed="${seed()}">导出</button></div>
</div></div>`;
}
// ---------- 设置（子页） ----------
function settingsPage() {
  const row = (name, ctrl) => `<div class="srowset"><span class="sname">${name}</span><div class="sval">${ctrl}</div></div>`;
  return `<div class="setp"><div class="setin">
<section class="scard pm-card" data-hand="card" data-seed="${seed()}"><h2>正文</h2>
${row('字号', seg('fs', [['15', '小', '15'], ['17', '中', '17'], ['19', '大', '19'], ['21', '特大', '21']], '17'))}
${row('行距', seg('lh', [['1.6', '紧凑'], ['1.8', '适中'], ['2', '宽松']], '1.8'))}
${row('正文宽度', seg('mw', [['560', '窄'], ['680', '适中'], ['800', '宽']], '680'))}
<div class="prev"><h3>东京的第三天</h3><p>早上被楼下面包店的香味叫醒。今天的计划是<strong>谷中银座</strong>和根津，走路就能到，慢慢逛。商店街比想象中短，<span class="hl">但每一家都很好逛</span>。</p></div>
</section>
<section class="scard pm-card" data-hand="card" data-seed="${seed()}"><h2>格式条</h2>
${row('显示', seg('bar', [['always', '一直在'], ['select', '选中文字时才出来']], 'always'))}
</section>
</div></div>`;
}
const FT_FILL = ['cat-mint-bg', 'cat-sky-bg'];
const folderTabs = (sub) => `<div class="ftabs" role="tablist" aria-label="见字如面的子页">${['见字如面', '设置'].map((s, i) => `<button type="button" class="ft pm-folder-tab" role="tab" data-sub="${i}" aria-selected="${i === sub}"><span class="ft-off" data-hand="frame" data-r="9" data-sw="1.5" data-amp="0.5" data-fill="${FT_FILL[i]}" data-seed="${800 + i}"></span><span class="ft-on" data-hand="frame" data-r="9" data-sw="1.7" data-amp="0.5" data-fill="paper" data-seed="${810 + i}"></span><span class="ft-t">${s}</span></button>`).join('')}</div>`;

// ---------- 一张见字如面的画板 ----------
function notesApp(o) {
  const docs = ['tokyo', 'rust', 'letter', 'letter-open'].map((id) => `<div class="doc pm-scroll" data-nolint data-doc="${id}"${id === o.doc ? '' : ' hidden'}>${DOCS[id](o)}</div>`).join('');
  const crumb = NOTES.find((n) => n.id === (o.doc === 'letter-open' ? 'letter' : o.doc))?.crumb ?? '';
  const sub = o.sub ?? 0;
  return `<div class="pm-desk" data-hand="desk" data-seed="700" style="position:absolute;inset:0"></div>
<div class="topband"></div>
${stacked()}
<div class="page front" data-sub="${sub}">
${folderTabs(sub)}
<section class="pm-sheet sheet" data-hand="sheet" data-seed="903" data-tilt="-0.3">
<div class="cols" style="--wt:176px;--wl:296px">
${side(o.side ?? 'all')}
<div class="book pm-card" data-hand="card" data-seed="${seed()}">
${mid(o.doc === 'letter-open' ? 'letter' : o.doc, o.ids)}
<div class="vline" aria-hidden="true"></div>
<div class="ed">
<div class="etop"><span class="crumb">${ic('hash', 14)}<span class="crumb-t">${esc(crumb)}</span></span>
<button type="button" class="eb focus pm-tip-host" aria-label="专心写">${ic('maximize-2', 17)}${tip('专心写')}</button>
<button type="button" class="eb pm-tip-host" aria-label="置顶">${ic('pin', 17)}${tip('置顶')}</button>
<button type="button" class="eb pm-tip-host" aria-label="加密">${ic('lock', 17)}${tip('加密')}</button>
<button type="button" class="eb export pm-tip-host" aria-label="导出">${ic('file-output', 17)}${tip('导出')}</button>
<button type="button" class="eb pm-tip-host" aria-label="更多">${ic('ellipsis', 17)}${tip('更多')}</button></div>
<button type="button" class="eb unfocus pm-tip-host" aria-label="退出专心写">${ic('minimize-2', 18)}${tip('缩小')}</button>
<div class="docwrap">${docs}</div>
${formatBar()}
</div>
</div>
<span class="grip gl" role="separator" aria-label="拖动调整标签栏的宽"></span>
<span class="grip gr" role="separator" aria-label="拖动调整列表的宽"></span>
</div>
${settingsPage()}
</section>
<span class="slap">${notesMark(70, { tilt: -8 })}</span>
</div>
${floatBar()}
${ctxMenu()}
${exportDialog()}
${bar()}`;
}

// ---------- 贴纸 ----------
function stickerBoard() {
  const names = ['A · 漂流瓶', 'B · 纸飞机（站主 11-13 挑的）', 'C · 字里的笑脸'];
  const big = STICKER_PICK.map((k, i) => `<div class="sv"><div class="svart">${art(pickArt(k), 150)}</div><div class="svname">${names[i]}</div>
<div class="sizes"><span>${art(pickArt(k), 24)}<em>24</em></span><span>${art(pickArt(k), 30)}<em>30</em></span><span>${art(pickArt(k), 46)}<em>46</em></span><span>${art(pickArt(k), 56)}<em>56</em></span><span>${art(pickArt(k), 70, { tilt: -8 })}<em>70</em></span></div></div>`).join('');
  const daily = [['todo', '一步一步'], ['notes', '念念不忘'], ['days', '来日方长'], ['finance', '钱来钱往'], ['packing', '出门走走']];
  const tilt = [-3, 2, -2, 3, -4, 2];
  const cells = daily.map(([id, n], i) => `<div class="stk"><span style="transform:rotate(${tilt[i]}deg);display:inline-block">${art(`modules/${id}`, 66)}</span><span class="stklab">${n}</span></div>`).join('')
    + `<div class="stk"><span style="transform:rotate(${tilt[5]}deg);display:inline-block">${notesMark(66)}</span><span class="stklab">见字如面</span></div>`;
  return `<div class="pm-desk" data-hand="desk" data-seed="700" style="position:absolute;inset:0"></div>
<div class="sb-in">
<h1 class="sbt">见字如面的贴纸 · 三个方案</h1>
<div class="svs">${big}</div>
<div class="sbrow">
<div class="sbbook pm-card" data-hand="card" data-seed="${seed()}"><div class="blab">${tapeStrip({ kind: 'mint', rot: -2 })}<span class="tl" style="justify-content:flex-start;padding-left:12px">日常</span></div><div class="bcells">${cells}</div></div>
<div class="sbside">
<div class="sbline pm-card" data-hand="card" data-seed="${seed()}"><span class="mk-cap">在柚子瓣、搜索结果、「桌上开着」里</span><div class="row" style="gap:14px;margin-top:10px">${art('modules/notes', 30)}${notesMark(30)}${art('modules/todo', 30)}<span style="font-size:15px">见字如面 · 东京的第三天</span></div></div>
<div class="sbline pm-card" data-hand="card" data-seed="${seed()}"><span class="mk-cap">换成别的分类色（图标和颜色）</span><div class="row" style="gap:12px;margin-top:10px">${['mint', 'sky', 'pink', 'orange', 'grape'].map((t) => notesMark(46, { tint: t })).join('')}</div></div>
</div></div></div>`;
}
const STICKER_CSS = `.sb-in{position:absolute;inset:0;padding:34px 48px}
.sbt{margin:0;font-family:var(--font-hand);font-size:26px;line-height:34px;font-weight:700}
.svs{display:flex;gap:30px;margin-top:20px}
.sv{width:368px;display:flex;flex-direction:column;align-items:center}
.svart{height:170px;display:grid;place-items:center}
.svname{font-family:var(--font-hand);font-size:17px;font-weight:700;margin-top:2px}
.sizes{display:flex;align-items:flex-end;gap:14px;margin-top:12px;height:84px}
.sizes span{display:flex;flex-direction:column;align-items:center;gap:4px}
.sizes em{font-style:normal;font-size:12px;color:var(--color-ink-soft)}
.sbrow{display:flex;gap:26px;margin-top:22px}
.sbbook{position:relative;width:520px;padding:18px 20px 12px}
.blab{position:relative;width:86px;height:26px;margin:0 0 8px 2px;color:#20241F;font-size:15px;font-weight:700;line-height:26px}
.bcells{display:flex;flex-wrap:wrap;gap:4px;width:470px}
.stk{position:relative;width:88px;height:104px;display:flex;flex-direction:column;align-items:center;gap:2px}
.stklab{font-size:14px;line-height:20px;white-space:nowrap}
.sbside{display:flex;flex-direction:column;gap:20px;flex:1}
.sbline{position:relative;padding:14px 18px 16px}
.mk-cap{font-size:13px;color:var(--color-ink-soft)}`;

// ---------- 格式条的图标 ----------
function toolbarBoard() {
  const NEW = Object.keys(ICONS.UI_ICONS).filter((k) => ICONS.UI_ICONS[k].batch === 3);
  const OLD = ['list-checks', 'quote', 'code', 'link-2', 'paperclip', 'image-plus', 'pin', 'pin-off', 'ellipsis', 'lock', 'fingerprint', 'notebook', 'archive', 'trash-2', 'maximize-2', 'file-output', 'square-pen', 'corner-down-right', 'lightbulb', 'hash'];
  const cell = (k, isNew) => `<div class="icn${isNew ? ' new' : ''}"><div class="icbig">${ic(k, 40)}</div><div class="icsm">${ic(k, 18)}</div><div class="icname">${ICONS.UI_ICONS[k].name}</div><div class="iclu">${(ICONS.UI_ICONS[k].for ?? []).join('、') || '—'}</div></div>`;
  const more = [['code-block', '代码块'], ['table', '表格'], ['callout', '提示框'], ['divider', '分隔线'], ['sigma', '公式'], ['flowchart', '流程图'], ['footnote', '脚注'], ['fold', '全部折起来']];
  return `<div class="pm-desk" data-hand="desk" data-seed="700" style="position:absolute;inset:0"></div>
<div class="tb-in">
<h1 class="sbt">格式条和见字如面的图标</h1>
<div class="tbrow">
<div class="tbcol"><div class="tbcap">一直在：正文底下</div>${formatBar('demo')}
<div class="tbcap" style="margin-top:22px">选中文字时才出来：浮在选中的那段上面</div><div class="fwrap">${floatBar('demo show')}</div></div>
<div class="tbmore"><div class="tbcap">「更多格式」</div><div class="pm-menu tbmenu">${more.map(([k, n]) => `<div class="pm-menu-item">${ic(k, 16)}<span>${n}</span></div>`).join('')}</div></div>
</div>
<div class="tbcap" style="margin-top:22px">新画的 · ${NEW.length} 个（24 格一笔单线，和已有的 149 个同一种画法）</div>
<div class="icgrid">${NEW.map((k) => cell(k, true)).join('')}</div>
<div class="tbcap" style="margin-top:16px">用已有的 · ${OLD.length} 个</div>
<div class="icgrid old">${OLD.map((k) => cell(k, false)).join('')}</div>
</div>`;
}
const TOOLBAR_CSS = `.tb-in{position:absolute;inset:0;padding:30px 44px}
.sbt{margin:0;font-family:var(--font-hand);font-size:26px;line-height:34px;font-weight:700}
.tbrow{display:flex;gap:40px;margin-top:14px;align-items:flex-start}
.tbcol{width:560px}
.tbcap{font-size:13px;color:var(--color-ink-soft);margin-bottom:8px}
.fbar.demo{position:relative;left:auto;right:auto;bottom:auto;margin:0;filter:none}
.fwrap{position:relative;height:52px}
.float.demo{position:relative;display:inline-flex}
.tbmore{width:200px}
.tbmenu{width:190px;filter:drop-shadow(0 6px 14px var(--color-shadow))}
.tbmenu .pm-menu-item{height:30px;padding:0 12px;font-size:14px;display:flex;align-items:center;gap:9px}
.tbmenu .ico{color:var(--color-pen)}
.icgrid{display:grid;grid-template-columns:repeat(10,1fr);gap:6px 4px}
.icgrid.old{grid-template-columns:repeat(10,1fr)}
.icn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px 4px;border-radius:10px}
.icn.new{background:color-mix(in srgb,var(--color-card) 70%,transparent)}
.icbig{color:var(--color-pen);height:40px}
.icsm{color:var(--color-ink);height:18px}
.icname{font-size:13px;line-height:18px}
.iclu{font-size:10.5px;line-height:14px;color:var(--color-ink-soft);font-family:ui-monospace,Menlo,monospace}
.old .icbig{height:30px}
.old .icbig svg{width:30px;height:30px}`;

// ---------- PDF ----------
const TOC = [['上午 · 谷中银座', 1, 0], ['买到的东西', 1, 1], ['下午 · 根津', 2, 0], ['今天花了多少', 2, 0]];
function pdfBody(kind) {
  const P = kind === 'pomelo';
  const h = (lv, t) => `<h${lv}>${t}</h${lv}>`;
  const hl = (t) => `<span class="hl">${t}</span>`;
  const tagsDate = `<div class="pmeta">11 月 6 日 · 周四${P ? ` ${hash('旅行/2026东京')} ${hash('随笔')}` : ' · #旅行/2026东京 · #随笔'}</div>`;
  const toc = `<div class="toc"><div class="toct">目录</div>${TOC.map(([t, p, d]) => `<div class="tocl${d ? ' sub' : ''}"><span>${t}</span><i></i><span>${p}</span></div>`).join('')}</div>`;
  const page1 = `${P ? `<span class="pslap">${notesMark(46, { tilt: -8 })}</span>` : ''}
<h1 class="ptitle">${P ? '<span class="tm" data-hand="marker" data-seed="61"></span>' : ''}东京的第三天</h1>${tagsDate}${toc}
<p>早上被楼下面包店的香味叫醒。今天的计划是<strong>谷中银座</strong>和根津，走路就能到，慢慢逛。</p>
${h(2, '上午 · 谷中银座')}<p>坐 <code>千代田线</code> 到千驮木，出站往右拐。商店街比想象中短，${hl('但每一家都很好逛')}。猫比人多，台阶上那只三花一直跟着我们<sup class="fn">1</sup>。</p>
<figure class="pic"><div class="ph">${photo(250, 156)}</div><figcaption>夕阳阶梯</figcaption></figure>
${h(3, '买到的东西')}<ul class="plist"><li class="done">手工明信片 × 3</li><li class="done">炸肉饼，边走边吃</li><li>给小林的猫咪书签</li></ul>
<blockquote>「慢慢来，比较快。」—— 在根津神社的绘马上看到的</blockquote>
<div class="call"><b>提示</b>　周四一半的店休息，下次挑周末来。</div>`;
  const page2 = `${h(2, '下午 · 根津')}<p>根津神社的千本鸟居一排排红过去，人不多。坐在台阶上吃完了早上买的红豆面包，<u>想把这几天的路线整理成一篇</u>。</p>
<p>傍晚回到住的地方，读了一会儿《夜航西飞》。<del>明天去镰仓</del>改成后天。</p>
${h(2, '今天花了多少')}<table class="tbl"><tr><th>什么</th><th class="r">日元</th></tr><tr><td>地铁一日券</td><td class="r">¥600</td></tr><tr><td>明信片</td><td class="r">¥1,320</td></tr><tr><td>午饭 · 荞麦面</td><td class="r">¥1,050</td></tr><tfoot><tr><td>合计</td><td class="r">¥2,970</td></tr></tfoot></table>
<div class="pfns">1. 后来查了，这一带的猫都有人喂。</div>`;
  const head = `<div class="phead"><span>东京的第三天</span><span>见字如面</span></div>`;
  const foot = (n) => `<div class="pfoot">${P ? `<span class="pnum" data-hand="frame" data-r="half" data-sw="1.3" data-seed="${70 + n}">${n}</span>` : `— ${n} —`}</div>`;
  return { page1: `<div class="pg"><div class="pgin">${page1}</div>${foot(1)}</div>`, page2: `<div class="pg">${head}<div class="pgin">${page2}</div>${foot(2)}</div>` };
}
function pdfBoard(kind) {
  const { page1, page2 } = pdfBody(kind);
  const label = kind === 'pomelo' ? '柚儿园：纸的颜色、手札体的标题、柚子的配色，像从 Pomelo 里印出来' : '印刷：白纸、衬线的正文、规整的页边';
  return `<div class="pm-desk" data-hand="desk" data-seed="700" style="position:absolute;inset:0"></div>
<div class="pdf-in pdf-${kind}"><h1 class="sbt">PDF · ${kind === 'pomelo' ? '柚儿园' : '印刷'}</h1><div class="pcap">${label}（A4，按 1 pt = 1 像素画）</div>
<div class="pgs">${page1}${page2}</div></div>`;
}
const PDF_CSS = `.pdf-in{position:absolute;inset:0;padding:28px 44px}
.sbt{margin:0;font-family:var(--font-hand);font-size:26px;line-height:34px;font-weight:700}
.pcap{font-size:13px;color:var(--color-ink-soft);margin-top:2px}
.pgs{display:flex;gap:44px;margin-top:18px}
.pg{position:relative;width:595px;height:842px;flex:none;box-shadow:0 2px 6px var(--color-shadow),0 18px 40px var(--color-shadow)}
.pgin{position:absolute;inset:64px 62px 64px 66px;overflow:hidden}
.pg h1,.pg h2,.pg h3,.pg p,.pg ul,.pg blockquote,.pg table,.pg figure{margin:0}
.phead{position:absolute;left:66px;right:62px;top:30px;display:flex;justify-content:space-between;font-size:9px;line-height:14px;padding-bottom:5px}
.pfoot{position:absolute;left:0;right:0;bottom:26px;display:flex;justify-content:center;font-size:10px}
/* 柚儿园 */
.pdf-pomelo .pg{background:var(--color-paper);background-image:linear-gradient(color-mix(in srgb,var(--color-grid) 60%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--color-grid) 60%,transparent) 1px,transparent 1px);background-size:16px 16px;color:var(--color-ink)}
.pdf-pomelo .pgin{font-family:var(--font-long);font-size:11px;line-height:1.85}
.pdf-pomelo .phead{font-family:var(--font-hand);color:var(--color-ink-soft);border-bottom:1.3px dashed var(--color-line)}
.pdf-pomelo .pfoot{font-family:var(--font-hand)}
.pnum{position:relative;width:24px;height:24px;display:grid;place-items:center;font-size:11px}
.pslap{position:absolute;right:0;top:-6px}
.pdf-pomelo .ptitle{position:relative;font-family:var(--font-hand);font-size:30px;line-height:40px;font-weight:700;width:fit-content}
.tm{position:absolute;left:-4px;right:-4px;bottom:2px;height:14px;z-index:-1}
.pdf-pomelo .ptitle{z-index:0}
.pdf-pomelo .pmeta{display:flex;align-items:center;gap:8px;margin-top:4px;font-family:var(--font-hand);font-size:11px;color:var(--color-ink-soft)}
.pdf-pomelo .pmeta .hash{font-size:11px;line-height:16px}
.pdf-pomelo .pmeta .hash::after{height:5px;bottom:2px}
.toc{margin:14px 0 14px;padding:10px 14px 12px;border-radius:10px;background:color-mix(in srgb,var(--color-card) 80%,transparent)}
.pdf-pomelo .toc{border:1.3px dashed var(--color-line)}
.toct{font-weight:700;font-size:12px;margin-bottom:3px}
.pdf-pomelo .toct{font-family:var(--font-hand);font-size:14px}
.tocl{display:flex;align-items:baseline;gap:6px;font-size:11px;line-height:20px}
.pdf-pomelo .tocl{font-family:var(--font-hand)}
.tocl.sub{padding-left:14px}
.tocl i{flex:1;border-bottom:1.2px dotted var(--color-ink-soft);transform:translateY(-3px)}
.pdf-pomelo h2{font-family:var(--font-hand);font-size:17px;line-height:24px;margin-top:14px}
.pdf-pomelo h3{font-family:var(--font-hand);font-size:14px;line-height:20px;margin-top:10px}
.pg p,.pg ul,.pg blockquote,.pg .call,.pg table,.pg figure{margin-top:7px}
.pg ul{padding-left:18px}
.pg li.done{text-decoration:line-through;color:var(--color-ink-soft)}
.pdf-pomelo .plist li::marker{color:var(--color-pen)}
.pg code{font-family:ui-monospace,Menlo,monospace;font-size:10px;padding:0 4px;border-radius:4px;background:color-mix(in srgb,var(--color-desk) 75%,transparent)}
.pg .fn{font-size:8px;vertical-align:4px;color:var(--color-link)}
.pg blockquote{position:relative;padding-left:12px;color:var(--color-ink-soft)}
.pg blockquote::before{content:'';position:absolute;left:1px;top:3px;bottom:3px;width:2.5px;border-radius:2px;background:color-mix(in srgb,var(--color-pen) 45%,transparent)}
.pg .call{padding:7px 10px;border-radius:9px;background:var(--color-cat-mint-tint)}
.pdf-pomelo .call b{font-family:var(--font-hand)}
.pg .tbl{width:100%;border-collapse:collapse;font-size:10.5px;line-height:17px}
.pg .tbl th{text-align:left;padding:2px 6px;border-bottom:1.3px solid var(--color-line)}
.pdf-pomelo .tbl th{font-family:var(--font-hand)}
.pg .tbl td{padding:3px 6px;border-top:1px dashed var(--color-line)}
.pg .tbl tr:nth-child(2) td{border-top:0}
.pg .tbl .r{text-align:right}
.pg .tbl tfoot td{border-top:1.3px solid var(--color-line);font-weight:700}
.pg .pic .ph{border-radius:9px;overflow:hidden;line-height:0;width:fit-content}
.pg figcaption{font-size:9px;color:var(--color-ink-soft);margin-top:3px}
.pdf-pomelo figcaption{font-family:var(--font-hand)}
.pg u{text-decoration-thickness:1.2px;text-underline-offset:3px;text-decoration-color:var(--color-pen)}
.pg del{color:var(--color-ink-soft)}
.pfns{margin-top:16px;padding-top:5px;border-top:1.2px dashed var(--color-line);font-size:9.5px;color:var(--color-ink-soft)}
.pg .hl{--hl:var(--color-marker)}
/* 印刷：白纸、宋体正文、黑体标题，颜色固定，不跟配色走 */
.pdf-print .pg{background:var(--color-print-paper);color:var(--color-print-ink);--color-ink-soft:var(--color-print-ink-soft);--color-line:#c9c9c2;--color-link:#3a4a8a;--color-pen:#555;--color-marker:#f3e7a3;--color-desk:#eeeeea;--color-cat-mint-tint:#f1f1ec}
.pdf-print .pgin{inset:76px 72px 76px 76px;font-family:'Songti SC','STSong',serif;font-size:11px;line-height:1.9}
.pdf-print .phead{left:76px;right:72px;top:36px;font-family:'PingFang SC',sans-serif;color:var(--color-print-ink-soft);border-bottom:.8px solid #bdbdb6}
.pdf-print .pfoot{bottom:34px;font-family:'Songti SC',serif;color:var(--color-print-ink-soft)}
.pdf-print .ptitle{font-family:'PingFang SC',sans-serif;font-size:24px;line-height:34px;font-weight:600;text-align:center}
.pdf-print .pmeta{margin-top:4px;text-align:center;font-family:'PingFang SC',sans-serif;font-size:9.5px;color:var(--color-print-ink-soft)}
.pdf-print .toc{background:none;border-top:.8px solid #bdbdb6;border-bottom:.8px solid #bdbdb6;border-radius:0;padding:8px 0 10px}
.pdf-print .toct{font-family:'PingFang SC',sans-serif;text-align:center;letter-spacing:.3em}
.pdf-print h2{font-family:'PingFang SC',sans-serif;font-weight:600;font-size:14px;line-height:22px;margin-top:14px}
.pdf-print h3{font-family:'PingFang SC',sans-serif;font-weight:600;font-size:12px;line-height:18px;margin-top:10px}
.pdf-print .tbl th{font-family:'PingFang SC',sans-serif;font-weight:600}
.pdf-print .call b{font-family:'PingFang SC',sans-serif}
.pdf-print .tbl .r{font-family:inherit}`;

// ---------- 写画板 ----------
const SEC = { section: '配色' };
const baseProps = { palette: { editor: 'enum', options: PALETTES, default: 'blue', ...SEC }, dark: { editor: 'boolean', default: false, ...SEC } };
const notesProps = (o) => ({
  ...baseProps,
  dark: { ...baseProps.dark, default: !!o.dark },
  bar: { editor: 'enum', options: ['always', 'select'], default: o.bar ?? 'always', section: '格式条', label: '格式条（always 一直在 · select 选中文字时才出来）' },
  mark: { editor: 'enum', options: ['a', 'b', 'c'], default: o.mark ?? 'b', section: '贴纸', label: '见字如面的贴纸（三个方案）' },
});
function board({ file, title, w = 1280, h = 800, props, body, css = '', start = false, attrs = '' }) {
  const html = dsBoard({
    title, css: `${CSS}\n.root{width:${w}px;height:${h}px}\n${css}`,
    body: `<div class="pm root" data-palette="{{palette}}" data-theme="{{theme}}" data-mark="{{mark}}">
<div class="app" data-bar="{{bar}}" ${attrs}>
${sprite()}
${body}
</div>
</div>`,
    props: { ...props, $preview: { width: w, height: h } },
    script: `${start ? APP_JS : ''}
class Component extends DCLogic {
  renderVals() {
    return { palette: this.props.palette ?? 'blue', theme: this.props.dark ? 'dark' : 'light', bar: this.props.bar ?? 'always', mark: this.props.mark ?? 'b' };
  }
  componentDidMount() { this.stop = Pomelo.paintLive(document.body);${start ? " PomeloNotes.start(document.querySelector('.app'));" : ''} }
  componentDidUpdate() { Pomelo.paint(document.body); }
  componentWillUnmount() { this.stop && this.stop(); }
}`,
  });
  writeFileSync(path.join(PROJECT, file), html);
  console.log(file, (html.length / 1024).toFixed(0) + ' KB');
}
function build(spec) {
  SYM = new Map();
  SEED = 1000;
  const body = spec.body();
  board({ ...spec, body });
  const { body: _b, ...rest } = spec;
  return rest;
}

const BOARDS = [
  { page: 'notes', file: 'Notes-Main.dc.html', title: '三栏：拖列表两边的边调宽，双指左右滑收栏', props: notesProps({}), start: true, body: () => notesApp({ doc: 'tokyo' }) },
  { page: 'notes', file: 'Notes-Fold.dc.html', title: '往左滑一次：收起标签', props: notesProps({}), start: true, attrs: 'data-fold="1"', body: () => notesApp({ doc: 'tokyo' }) },
  { page: 'notes', file: 'Notes-Select.dc.html', title: '深色 · 选中文字时才出格式条', props: notesProps({ dark: true, bar: 'select' }), start: true, body: () => notesApp({ doc: 'rust', sel: true }) },
  { page: 'notes', file: 'Notes-Menu.dc.html', title: '右键的格式', props: notesProps({}), start: true, attrs: 'data-ctx="open"', body: () => notesApp({ doc: 'tokyo' }).replace('<p>坐 ', '<p><span class="ctx-at"></span>坐 ') },
  { page: 'notes', file: 'Notes-Locked.dc.html', title: '加密的笔记', props: notesProps({}), start: true, body: () => notesApp({ doc: 'letter', side: 'lock', ids: ['letter', 'health'] }) },
  { page: 'notes', file: 'Notes-Focus.dc.html', title: '专心写：占满整个窗口', props: notesProps({}), start: true, attrs: 'data-focus="on"', body: () => notesApp({ doc: 'tokyo' }) },
  { page: 'notes', file: 'Notes-Settings.dc.html', title: '设置：字号、行距、正文宽度、格式条', props: notesProps({}), start: true, body: () => notesApp({ doc: 'tokyo', sub: 1 }) },
  { page: 'x5', file: 'X5-Sticker.dc.html', title: '见字如面的贴纸 · A 漂流瓶、B 纸飞机、C 字里的笑脸', props: { ...baseProps, mark: notesProps({}).mark }, css: STICKER_CSS, body: () => stickerBoard() },
  { page: 'notes-pdf', file: 'Notes-Toolbar.dc.html', title: '格式条和新画的图标', h: 920, props: notesProps({}), css: TOOLBAR_CSS, body: () => toolbarBoard() },
  { page: 'notes-pdf', file: 'Notes-Export.dc.html', title: '导出：每次弹设置', props: notesProps({}), start: true, attrs: 'data-dlg="export"', body: () => notesApp({ doc: 'tokyo' }) },
  { page: 'notes-pdf', file: 'Notes-PDF-Pomelo.dc.html', title: 'PDF · 柚儿园', w: 1340, h: 1000, props: { ...baseProps, mark: notesProps({}).mark }, css: PDF_CSS, body: () => pdfBoard('pomelo') },
  { page: 'notes-pdf', file: 'Notes-PDF-Print.dc.html', title: 'PDF · 印刷（批了）', w: 1340, h: 1000, props: { ...baseProps, mark: notesProps({}).mark }, css: PDF_CSS, body: () => pdfBoard('print') },
];
// 印刷那张不跟配色走（Tweaks 只为了和别的板一样能切）；它的纸是 print-paper。

// ---------- 三页，每页一个标题、一张说明便签 ----------
// 一页一页来：先写这一页的板再写 canvas.json。两页共用 Notes- 前缀，先把别的页的新板写出来，writePage 会当成
// 上次写到一半的删掉。
let count = 0;
const placed = (page, at) => {
  const built = BOARDS.filter((b) => b.page === page).map(build);
  count += built.length;
  return built.map((b, i) => ({ file: b.file, x: at(i)[0], y: at(i)[1], w: b.w ?? 1280, h: b.h ?? 800, title: b.title, radius: 12, ...(b.start ? { is_interactive: true } : {}) }));
};
// 说明便签放在画板右边（放在上面会盖住第一张板的名字条）
const how = (x, text) => ({ x, y: 0, w: 560, fill: 'orange', text });
writePage({
  id: 'x5',
  name: 'EX5：见字如面的贴纸',
  prefix: 'X5-',
  boards: placed('x5', () => [0, 0]),
  notes: {
    title: { x: 0, y: -280, text: '见字如面的贴纸：三个方案挑一个', kind: 'title1', maxW: 4000 },
    how: how(1400, '11-13 定了 B 纸飞机（进了方案 0.7.0，名字「见字如面」）。\n三个都不画纸笔本子：A 漂流瓶（写下的话漂到对方那里）、B 纸飞机（一封信飞出去，拖着一圈虚线和一颗心）、C 字里的笑脸（纸上的字排成一张脸）。没选上的 A、C 留在 notes/drafts.mjs。原型的 Tweaks 里还能换着看。'),
  },
});
writePage({
  id: 'notes',
  name: 'R6：见字如面原型',
  prefix: 'Notes-',
  boards: placed('notes', (i) => [(i % 3) * 1400, Math.floor(i / 3) * 960]),
  notes: {
    title: { x: 0, y: -280, text: '见字如面：写成篇的文章和长笔记（替代 Bear）', kind: 'title1', maxW: 4000 },
    how: how(4200, '怎么看（11-13 照你的意见改过一轮，批了）\n七张板是同一个原型，起始画面不同，都点得动：列表和正文合在一张卡里；拖卡片的左边、列表右边那道虚线调三栏的宽（各有最小宽度，挤小了标签用省略号）；双指往左滑一次收起标签、再一次收起列表，往右滑放回来（没有按钮）；格式条浮在正文上（图钉切换「选中文字时才出来」）；右上「专心写」占满整个窗口，右上角「缩小」回来；纸上边的「设置」调字号、行距、正文宽度。\nTweaks：配色、明暗、格式条两种模式、贴纸方案。双指滑在画布上可能被画布自己拿去平移，点开这张板单独看最准。'),
  },
});
writePage({
  id: 'notes-pdf',
  name: 'R7：见字如面格式条、PDF',
  prefix: 'Notes-',
  boards: placed('notes-pdf', (i) => [[0, 0], [1400, 0], [0, 1120], [1460, 1120]][i]),
  notes: {
    title: { x: 0, y: -280, text: '格式条、导出和 PDF 的两种样式', kind: 'title1', maxW: 4000 },
    how: how(2920, '格式条和新画的 19 个图标（多了全屏专心写用的「缩小」）：11-13 批了，进了方案 0.7.0。\nPDF · 印刷：11-13 批了。\n还要你看的：导出每次弹的设置（格式、样式、目录、页眉和页码、标签和日期），PDF · 柚儿园（纸的颜色、手札体标题、柚子配色）。纸张 A4；折起来的标题和列表全部展开印出来；附件放在 PDF 旁边的一个文件夹里；Word 的样式跟 PDF 走。'),
  },
});
console.log(`pomelo-explore/notes：${count} 张画板`);
