// 联动和玩物有志（Pomelo v1.0 Phase 5）：11-15 在现用账号的云端画布「Pomelo · 联动和玩物有志」上给站主批（11-15 批了，云端停在那一轮），
// 同一天并进 Pomelo Explore，写两页：
//   x6  EX6：跨模块联动（文章里嵌笔记、[[ 的提示、笔记里的链接、书架、记到念念不忘、链接到这里的）  Links-*
//   x7  EX7：玩物有志（表格、平台的下拉、面板和周目、三个贴纸方案，定了 B 掌机）                Games-*
// 外框照见字如面那几页（notes/notes.css）；手画的框、线、勾选都用挂上的 Design System「Pomelo 柚儿园」（project/ds/pomelo/）。
// 站主批的时候改了几处（「链接到这里的」「读后感」「观后感」统一叫「柚子链接」，再加选中文字链到 Pomelo 里的写法），都在 Pomelo 里做，
// 这两页留着批的样子。假数据：书名、游戏、笔记都是编的。用法：在仓库根目录 node canvases/pomelo-explore/links/gen.mjs
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { PROJECT, writePage } from '../page.mjs';
import { resetBoard, boardHtml, art, mod, gameMark, GAME_PICK, tapeStrip, seed, chip } from './lib.mjs';
import * as Pg from './pages.mjs';

const OUT = PROJECT;

// ---------- 贴纸 ----------
const STICKER_CSS = `.sb-in{position:absolute;inset:0;padding:34px 48px}
.sbt{margin:0;font-family:var(--font-hand);font-size:26px;line-height:34px;font-weight:700}
.svs{display:flex;gap:30px;margin-top:18px}
.sv{width:368px;display:flex;flex-direction:column;align-items:center}
.svart{height:170px;display:grid;place-items:center}
.svname{font-family:var(--font-hand);font-size:17px;font-weight:700;margin-top:2px}
.sizes{display:flex;align-items:flex-end;gap:14px;margin-top:12px;height:84px}
.sizes span{display:flex;flex-direction:column;align-items:center;gap:4px}
.sizes em{font-style:normal;font-size:12px;color:var(--color-ink-soft)}
.sbrow{display:flex;gap:26px;margin-top:20px}
.sbbook{position:relative;width:560px;padding:18px 20px 12px}
.sbbook>*:not([data-hand-painted]),.sbline>*:not([data-hand-painted]){position:relative}
.blab{position:relative;width:86px;height:26px;margin:0 0 8px 2px;color:#20241F;font-size:15px;font-weight:700;line-height:26px}
.bcells{display:flex;flex-wrap:wrap;gap:4px;width:520px}
.stk{position:relative;width:84px;height:104px;display:flex;flex-direction:column;align-items:center;gap:2px}
.stklab{font-size:14px;line-height:20px;white-space:nowrap}
.sbside{display:flex;flex-direction:column;gap:16px;flex:1;min-width:0}
.sbline{position:relative;padding:12px 18px 14px}
.mk-cap{font-size:13px;color:var(--color-ink-soft)}`;
function stickerBoard() {
  const names = ['A · 卡带', 'B · 掌机', 'C · 手柄'];
  const big = GAME_PICK.map((k, i) => `<div class="sv"><div class="svart">${art(`draft:${k}`, 150)}</div><div class="svname">${names[i]}</div>
<div class="sizes"><span>${art(`draft:${k}`, 24)}<em>24</em></span><span>${art(`draft:${k}`, 30)}<em>30</em></span><span>${art(`draft:${k}`, 46)}<em>46</em></span><span>${art(`draft:${k}`, 56)}<em>56</em></span><span>${art(`draft:${k}`, 70, { tilt: -8 })}<em>70</em></span></div></div>`).join('');
  const fun = ['books', 'films', 'games', 'drawing', 'site', 'canvas'];
  const tilt = [-3, 2, -2, 3, -4, 2];
  const cells = fun.map((id, i) => `<div class="stk"><span style="transform:rotate(${tilt[i]}deg);display:inline-block">${mod(id, 64)}</span><span class="stklab">${({ books: '摸鱼读读', films: '好奇看看', games: '玩物有志', drawing: '随意画画', site: '呦呦漫游', canvas: '有板有眼' })[id]}</span></div>`).join('');
  return { html: `<div class="pm-desk" data-hand="desk" data-seed="700" style="position:absolute;inset:0"></div>
<div class="sb-in">
<h1 class="sbt">玩物有志的贴纸 · 三个方案</h1>
<div class="svs">${big}</div>
<div class="sbrow">
<div class="sbbook pm-card" data-hand="card" data-seed="${seed()}"><div class="blab">${tapeStrip({ kind: 'yuzu', rot: -2 })}<span class="tl" style="justify-content:flex-start;padding-left:12px">兴趣</span></div><div class="bcells">${cells}</div></div>
<div class="sbside">
<div class="sbline pm-card" data-hand="card" data-seed="${seed()}"><span class="mk-cap">在「桌上开着」、链接和提示里</span><div class="row" style="gap:12px;margin-top:10px;font-size:15px">${gameMark(30)}${mod('books', 30)}${mod('films', 30)}<span style="flex:1"></span>${chip('games', '风之旅人')}</div></div>
<div class="sbline pm-card" data-hand="card" data-seed="${seed()}"><span class="mk-cap">换成别的分类色</span><div class="row" style="gap:12px;margin-top:10px">${['mint', 'sky', 'pink', 'orange', 'grape'].map((t) => gameMark(44, { tint: t })).join('')}</div></div>
<div class="sbline pm-card" data-hand="card" data-seed="${seed()}"><span class="mk-cap">通用贴纸里已有的「游戏」（自建模块能挑）</span><div class="row" style="gap:12px;margin-top:8px">${art('modules/game', 44)}${art('modules/dice', 44)}${art('modules/puzzle', 44)}</div></div>
</div></div></div>` };
}

// ---------- 画板 ----------
const A = (f) => () => Pg.articlesPage(f());
const NOTE_FEED = (extra = '') => [Pg.composer(), Pg.NOTE_CARDS.zelda(), Pg.NOTE_CARDS.ghibli(), Pg.NOTE_CARDS.review(), Pg.NOTE_CARDS.night()].join('\n') + extra;
const BOARDS = [
  // EX1 · 1 嵌进来的笔记
  { page: 'x6', row: 0, file: 'Links-Embed.dc.html', title: '文章里嵌一条念念不忘（浅色）', body: A(() => ({ doc: Pg.docNight(), active: 'night', crumb: '读书 / 读后感' })) },
  { page: 'x6', row: 0, file: 'Links-Embed-Dark.dc.html', title: '文章里嵌一条念念不忘（深色）', dark: true, body: A(() => ({ doc: Pg.docNight(), active: 'night', crumb: '读书 / 读后感' })) },
  { page: 'x6', row: 0, file: 'Links-Embed-Caret.dc.html', title: '光标进到那张小卡：露出 ![[…]]', body: A(() => ({ doc: Pg.docNight({ mode: 'caret' }), active: 'night', crumb: '读书 / 读后感' })) },
  // 2 打 [[
  { page: 'x6', row: 1, file: 'Links-Suggest-Article.dc.html', title: '文章里打 [[：文章、笔记、书、影、游戏混在一起', body: A(() => ({ doc: Pg.docNight({ suggest: true }), active: 'night', crumb: '读书 / 读后感' })) },
  { page: 'x6', row: 1, file: 'Links-Suggest-Note.dc.html', title: '念念不忘里打 [[（深色）', dark: true, body: () => Pg.notesPage({ feed: [Pg.composer({ text: '周末又玩了一会儿 <span class="mkd">[[</span>星<i class="caret"></i>', popup: Pg.SUGGEST_NOTE() }), Pg.NOTE_CARDS.zelda(false), Pg.NOTE_CARDS.ghibli(), Pg.NOTE_CARDS.review()].join('\n') }) },
  // 3 卡片里的 [[标题]]
  { page: 'x6', row: 2, file: 'Links-Chips.dc.html', title: '念念不忘卡片里的 [[标题]]，下面是「链接到这里的」（浅色）', body: () => Pg.notesPage({ feed: NOTE_FEED() }) },
  { page: 'x6', row: 2, file: 'Links-Chips-Dark.dc.html', title: '念念不忘卡片里的 [[标题]]（深色）', dark: true, body: () => Pg.notesPage({ feed: NOTE_FEED() }) },
  // 4 书架
  { page: 'x6', row: 3, file: 'Links-Shelf.dc.html', title: '写的时候右边开一栏念念不忘，拖一条进文章（浅色）', body: A(() => ({ doc: Pg.docOctober(), active: 'oct', crumb: '读书', fold: true, shelfOn: true, dragged: 2 })) },
  { page: 'x6', row: 3, file: 'Links-Shelf-Dark.dc.html', title: '书架（深色）', dark: true, body: A(() => ({ doc: Pg.docOctober(), active: 'oct', crumb: '读书', fold: true, shelfOn: true, dragged: 2 })) },
  // 5 记到念念不忘
  { page: 'x6', row: 4, file: 'Links-Clip-Menu.dc.html', title: '选一段，右键「记到念念不忘」', body: A(() => ({ doc: Pg.docSlow({ menu: true }), active: 'slow', crumb: '随笔' })) },
  { page: 'x6', row: 4, file: 'Links-Clip-Box.dc.html', title: '念念不忘的输入框弹出来，接着打标签（浅色）', body: A(() => ({ doc: Pg.docSlow({ clip: true }), active: 'slow', crumb: '随笔' })) },
  { page: 'x6', row: 4, file: 'Links-Clip-Box-Dark.dc.html', title: '念念不忘的输入框（深色）', dark: true, body: A(() => ({ doc: Pg.docSlow({ clip: true }), active: 'slow', crumb: '随笔' })) },
  // 6 链接到这里的
  { page: 'x6', row: 5, file: 'Links-Back-Article.dc.html', title: '文章最后的「链接到这里的」', body: A(() => ({ doc: Pg.docNightEnd(), active: 'night', crumb: '读书 / 读后感' })) },
  { page: 'x6', row: 5, file: 'Links-Back-Book.dc.html', title: '摸鱼读读的面板：读后感（浅色）', h: 1060, body: () => Pg.collectionPage({ kind: 'books', sel: 0, panel: Pg.bookPanel(), opens: ['books', 'articles', 'notes'] }) },
  { page: 'x6', row: 5, file: 'Links-Back-Film-Dark.dc.html', title: '好奇看看的面板：观后感（深色）', h: 1060, dark: true, body: () => Pg.collectionPage({ kind: 'films', sel: 0, panel: Pg.filmPanel(), opens: ['films', 'notes', 'articles'] }) },
  // EX2 · 玩物有志
  { page: 'x7', row: 0, file: 'Games-Table.dc.html', title: '玩物有志：表格和筛选（浅色）', body: () => Pg.collectionPage({ kind: 'games', opens: ['games', 'books', 'films'] }) },
  { page: 'x7', row: 0, file: 'Games-Dark.dc.html', title: '深色 · 平台的下拉（能管理平台）', dark: true, body: () => Pg.collectionPage({ kind: 'games', ddOpen: true, opens: ['games', 'books', 'films'] }) },
  { page: 'x7', row: 1, file: 'Games-Panel.dc.html', title: '一个游戏的面板：周目和玩后感（浅色）', h: 1060, body: () => Pg.collectionPage({ kind: 'games', sel: 0, panel: Pg.gamePanel(), opens: ['games', 'books', 'films'] }) },
  { page: 'x7', row: 1, file: 'Games-Panel-Dark.dc.html', title: '一个游戏的面板（深色）', h: 1060, dark: true, body: () => Pg.collectionPage({ kind: 'games', sel: 0, panel: Pg.gamePanel(), opens: ['games', 'books', 'films'] }) },
  { page: 'x7', row: 2, file: 'Games-Sticker.dc.html', title: '玩物有志的贴纸 · A 卡带、B 掌机、C 手柄（挑一个）', body: stickerBoard },
];

const ROW_Y = { x6: [0, 960, 1920, 2880, 3840, 4800], x7: [0, 960, 2140] };
const counters = {};
const placed = [];
for (const b of BOARDS) {
  resetBoard();
  const w = 1280, h = b.h ?? 800;
  const body = b.body();
  const css = Pg.CSS + (b.file === 'Games-Sticker.dc.html' ? STICKER_CSS : '');
  const html = boardHtml({ title: b.title, w, h, css, body, dark: b.dark, mark: 'b' });
  writeFileSync(path.join(OUT, b.file), html);
  const k = `${b.page}-${b.row}`;
  const col = (counters[k] = (counters[k] ?? -1) + 1);
  placed.push({ file: b.file, x: col * 1400, y: ROW_Y[b.page][b.row], w, h, title: b.title, page: b.page, radius: 12 });
  console.log(b.file, (html.length / 1024).toFixed(0) + ' KB');
}

// ---------- canvas.json ----------
const sticky = (x, y, text, w = 560) => ({ x, y, w, fill: 'orange', text });
const notes = { x6: {}, x7: {} };
const NOTES = {
  'x6-title': { x: 0, y: -300, text: 'EX6：念念不忘、见字如面、书影游戏互相链接', kind: 'title1', maxW: 4080 },
  'x6-r0': sticky(4200, 0, '① 文章里嵌一条念念不忘\n小白卡：念念不忘的小贴纸、日期时间，下面是那条笔记的全文（手札体，和正文的苹方分开），右上角去念念不忘看原条。笔记改了这里跟着变，删了就变成淡墨虚线框「这条笔记不在了」（没画）。\n光标进到卡上时，照 Bear 2 的规矩在它上面露出一行源文字 ![[念念不忘/2026-11-02 21:14]]（淡墨，用笔记的日期时间认它），卡片的边描粗。\n要你定：源文字用日期时间认笔记（我选的，导出成 Markdown 也看得懂），还是用笔记编号。'),
  'x6-r1': sticky(4200, 960, '② 打 [[ 的提示\n一条纸做的菜单，挂在光标下面：每行是那个模块的小贴纸、标题（打的字划荧光笔）和一行淡墨（书写作者，影写导演和年份，游戏写平台和状态，文章、笔记写日期）。笔记没有标题，用开头的几个字。\n不分组，按对得上的程度排；最多 6 条。文章里和念念不忘里是同一个。'),
  'x6-r2': sticky(4200, 1920, '③ 念念不忘卡片里的 [[标题]]\n写的时候是 [[塞尔达传说：王国之泪]]，存好以后画成一个能点的小标题：模块的小贴纸 + 链接色的字和淡底，点了打开那本书、那部片、那个游戏或那篇文章。\n卡片下面原来的「N 条笔记引用了它」改成「链接到这里的 · N」，展开后文章和笔记混在一起（小贴纸分开）。'),
  'x6-r3': sticky(4200, 2880, '④ 书架\n正文右上新加一个羽毛按钮「念念不忘」，点开右边站出一栏（宽 282）：搜索、标签（下拉，带荧光笔的 #标签）、一张张笔记小卡。打开时左边的标签栏自动收起（不然正文太窄），关掉放回来。\n按住一张往正文里拖：原处那张变淡，手上那张歪一点、投影深一点，落点是一条主色横线；松手就成了 ① 那张小卡。'),
  'x6-r4': sticky(4200, 3840, '⑤ 记到念念不忘\n选中一段，右键菜单最上面加一项「记到念念不忘」（羽毛图标，粗一点）。点了在那段下面弹出念念不忘的输入框（左上角拍着念念不忘的贴纸）：选的字已经填好，下一行是「来自《关于慢慢来》」，书名号那里其实是 [[关于慢慢来]]，所以这篇文章的「链接到这里的」里会有它。光标停在最后，直接打 #，标签的提示贴在 # 下面；「记下」存好，输入框收起。'),
  'x6-r5': sticky(4200, 4800, '⑥ 链接到这里的\n文章最后：虚线下淡墨「链接到这里的 · 3」，下面一排链接色的小按钮（照现在的样子，多了小贴纸和淡墨日期），文章、笔记混排。\n书影游戏的面板最下面多一栏「读后感 · N」（好奇看看是「观后感」，玩物有志是「玩后感」）：每行小贴纸、文章标题（粗）或笔记开头、淡墨日期，点了打开。面板长了，这两张板的窗口画高了一点。'),
  'x7-title': { x: 0, y: -300, text: 'EX7：玩物有志（游戏）', kind: 'title1', maxW: 2680 },
  'x7-r0': sticky(2800, 0, '玩物有志：和摸鱼读读、好奇看看同一套（表格 + 右边的面板），放在贴纸簿的「兴趣」里。\n表格：名称、类型（自己能改，按顺序配颜色的小标签）、平台、国家、状态（想玩 · 在玩 · 通关，颜色照书影的想读 · 在读 · 已读）、尝尝咸淡、完成（最近一次的年份）、周目、备注。\n工具栏：搜索、状态分段、类型、平台、排序、「新游戏」。平台和类型一样能自己改：下拉最下面「管理平台…」。\n要你定：平台要不要也配颜色（现在是淡墨字，免得一行两个彩色标签太花）。'),
  'x7-r1': sticky(2800, 960, '面板（和书影的一样，标题「编辑」）：名称（✦ 补全）、类型、平台、国家、状态、尝尝咸淡、完成时间、备注、玩后感。\n几周目我做成书影「重读」那样：完成时间下面一行一个周目（几周目、哪一年、几颗星、红色 ×），最下面主色小字「+ 再玩一周目」；表格里的「完成」是最近一次，「周目」是一共几周目。不用单独一个「几周目」的下拉。\n要你定：这样合并，还是分开成「完成」年份 + 「几周目」下拉。'),
  'x7-r2': sticky(1400, 2140, '贴纸三个方案（64 格，兴趣的樱粉，和书影同一种画法）：A 卡带（切角的卡带，标签上一颗星）、B 掌机（竖着的掌机，屏幕里一颗心）、C 手柄（圆头手柄，线绕一圈拖着一颗闪光）。\n通用贴纸里已经有一个「游戏」手柄（自建模块能挑），所以 C 画成了不一样的样子；挑 A 或 B 就不会和它撞。原型里默认是 B，每张板的 Tweaks 都能换。\n批了以后在 visual-atelier 的 art.mjs 里定稿、发版、同步。'),
};
for (const [k, n] of Object.entries(NOTES)) notes[k.slice(0, 2)][k.slice(3)] = n;
writePage({ id: 'x6', name: 'EX6：跨模块联动', prefix: 'Links-', boards: placed.filter((p) => p.page === 'x6').map(({ page, ...r }) => r), notes: notes.x6 });
writePage({ id: 'x7', name: 'EX7：玩物有志', prefix: 'Games-', boards: placed.filter((p) => p.page === 'x7').map(({ page, ...r }) => r), notes: notes.x7 });
console.log(`${placed.length} boards`);
