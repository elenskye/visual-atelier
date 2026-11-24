// Page builders: 见字如面 (three columns), 念念不忘 (list page), 书影 / 玩物有志 (table + side panel), and the popups.
import { ic, art, mod, seed, tip, hash, seg, dd, field, btn, stars, chip, desk, esc } from './lib.mjs';

export const CSS = `
/* ---------- 见字如面：三栏直接排在纸上（站主 11-14），栏之间淡笔色的竖虚线 ---------- */
.cols{--gapx:0px;inset:18px 26px 20px 58px}
.vl{flex:none;width:0;margin:2px 9px 14px;border-left:1.5px dashed color-mix(in srgb,var(--color-pen) 30%,transparent)}
.app[data-fold="1"] .vl.v0{display:none}
.side{padding-top:2px}
.mtop{padding:0 6px 10px 2px}
.mtop .pm-field{height:36px}
.rb{width:36px;height:36px}
.list{inset:0 2px 6px 0}
.etop{height:36px;padding:0 4px 0 16px}
.eb.on{background:var(--color-selected)}
.doc{padding:8px 34px 96px}
.grow{flex:1}
/* 链接：画成能点的标题（模块的小贴纸 + 标题，链接色的淡底） */
.lk{display:inline-block;padding:0 6px 0 3px;margin:0 1px;border-radius:7px;color:var(--color-link);background:color-mix(in srgb,var(--color-link) 9%,transparent);font:inherit;line-height:inherit;white-space:nowrap;cursor:pointer;vertical-align:baseline}
.lk:hover{background:color-mix(in srgb,var(--color-link) 16%,transparent)}
.lk .mk{vertical-align:-.2em;margin-right:3px}
.lkd{color:var(--color-ink-soft);margin-left:6px;font-size:.85em}
/* 文章里嵌进来的一条念念不忘：小白卡，手札体，日期在上面，跟着那条笔记变 */
.emb{position:relative;padding:11px 16px 13px;font-family:var(--font-hand);margin-top:.9em !important}
.emb>*:not([data-hand-painted]){position:relative}
.eh{display:flex;align-items:center;gap:7px;font-size:13px;line-height:18px;color:var(--color-ink-soft)}
.eh .op{margin-left:auto;display:flex;color:var(--color-pen)}
.et{margin-top:5px;font-size:15px;line-height:1.75;color:var(--color-ink)}
.et .hash,.ncb .hash,.mnt .hash,.ctext .hash{font-size:1em}
.src{font-family:var(--font-hand);font-size:.82em;line-height:1.6;color:var(--color-ink-soft);margin-top:.9em !important}
.src+.emb{margin-top:.3em !important}
/* 浮在正文上的东西：挂在某一段后面一个零高的位置上 */
.ovr{position:relative;height:0}
.ovr>*{position:absolute !important;z-index:30}
.sug{left:22px;top:6px;width:348px;filter:drop-shadow(0 8px 16px var(--color-shadow));font-family:var(--font-hand);line-height:1.4;text-align:left}
.sug .pm-menu-item{height:48px;padding:0 12px;justify-content:flex-start;gap:10px;font-size:15px}
.sug .st{flex:1;min-width:0;display:flex;flex-direction:column}
.sug .stt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--color-ink)}
.sug .stm{font-size:12px;line-height:16px;color:var(--color-ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sug em,.tsug em{font-style:normal;background:linear-gradient(transparent 52%,var(--color-marker) 52%,var(--color-marker) 92%,transparent 92%)}
/* 书架：写的时候右边一栏念念不忘 */
.shelf{position:relative;flex:none;width:282px;display:flex;flex-direction:column;gap:10px;padding:14px 14px 0;margin:0 0 2px;font-family:var(--font-hand)}
.shelf>*:not([data-hand-painted]){position:relative}
.shh{display:flex;align-items:center;gap:8px;height:30px;flex:none}
.shh b{font-size:17px;line-height:24px}
.shh .x{margin-left:auto;width:28px;height:28px;display:grid;place-items:center;color:var(--color-pen);border-radius:8px}
.shelf .pm-field{height:36px;font-size:14px;flex:none}
.shelf .dd{width:100%;justify-content:space-between}
.shl{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;overflow:hidden;padding:2px 2px 10px}
.mn{position:relative;flex:none;padding:9px 12px 10px;font-size:14px;line-height:1.6;text-align:left;width:100%}
.mn>*:not([data-hand-painted]){position:relative}
.mnd{display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:var(--color-ink-soft)}
.mnd .gr{margin-left:auto;display:flex;color:var(--color-ink-soft)}
.mnt{margin-top:3px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.mn.faded{opacity:.35}
.drag{left:150px;top:-26px;width:262px;transform:rotate(-2.5deg);filter:drop-shadow(0 14px 20px var(--color-shadow))}
.app[data-fold="1"] .fbar{display:none}
.doc .drop{height:0;margin-top:.55em !important;border-top:2.5px solid var(--color-primary);border-radius:2px}
/* 选一段 → 右键 */
.ctx.show{left:150px;top:-14px}
.ctx .pm-menu-item.lead{font-weight:700}
.ctx .pm-menu-item.lead .ico{color:var(--color-pen)}
/* 念念不忘的输入框从选中的那段下面弹出来 */
.clip{left:-8px;top:10px;width:440px;padding:16px 18px 12px;font-family:var(--font-hand);line-height:1.7;filter:drop-shadow(0 14px 24px var(--color-shadow))}
.clip>*:not([data-hand-painted]){position:relative}
.cslap{position:absolute !important;left:-20px;top:-24px;z-index:2}
.tsug{left:-4px;top:2px;width:200px;filter:drop-shadow(0 6px 12px var(--color-shadow))}
.tsug .pm-menu-item{height:34px;padding:0 12px;font-size:14px}
.tsug .n{font-size:12px;color:var(--color-ink-soft)}
/* 文章最后的「链接到这里的」 */
.bkx{margin-top:2.2em !important;padding-top:.8em;border-top:1.5px dashed var(--color-line);font-family:var(--font-hand)}
.bkh{font-size:13px;line-height:18px;color:var(--color-ink-soft);margin-bottom:8px}
.bkx .row{flex-wrap:wrap;gap:8px 8px}
.bkx .lk{font-size:14px;line-height:1.8;padding:1px 9px 1px 5px;border-radius:8px}

/* ---------- 页头（念念不忘、书影、玩物有志）：大标题，右边淡墨的数 ---------- */
.phd{position:absolute;left:66px;right:30px;top:22px;height:40px;display:flex;align-items:center;gap:14px}
.phd .pm-sheet-title{white-space:nowrap}
.pstat{margin:0;font-size:13px;color:var(--color-ink-soft);white-space:nowrap}
.pstat b{font-size:15px;color:var(--color-ink)}
.sbox{width:224px;height:36px;font-size:14px;flex:none}
.pm-field input{flex:1;min-width:0;background:none;border:0;outline:none;font-size:14px;color:var(--color-ink)}
.pm-field input::placeholder{color:var(--color-ink-soft)}
.fic{display:flex;margin-right:2px}

/* ---------- 念念不忘 ---------- */
.nwrap{position:absolute;left:40px;right:26px;top:80px;bottom:14px;display:flex;gap:22px}
.nnav{width:232px;flex:none;display:flex;flex-direction:column;min-height:0;overflow:hidden}
.nstat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:0 10px 12px}
.nstat b{display:block;font-size:20px;line-height:26px}
.nstat span{font-size:12px;color:var(--color-ink-soft)}
.heat{display:grid;grid-template-columns:repeat(16,11px);grid-template-rows:repeat(7,11px);grid-auto-flow:column;gap:2px;padding:0 10px 14px}
.heat i{border-radius:3px;display:block}
.h0{background:color-mix(in srgb,var(--color-ink) 7%,transparent)}
.h1{background:var(--color-cat-mint-bg)}
.h2{background:var(--color-cat-mint-sticker)}
.h3{background:var(--color-cat-mint)}
.h4{background:color-mix(in srgb,var(--color-cat-mint) 72%,var(--color-ink))}
.tslot{width:20px;flex:none;display:inline-flex;justify-content:center;color:var(--color-ink-soft)}
.nfeed{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;gap:12px;overflow:hidden;padding:2px 4px}
.comp{position:relative;flex:none;padding:12px 16px 10px;z-index:5}
.comp>*:not([data-hand-painted]){position:relative}
.ctext{min-height:50px;font-size:15px;line-height:1.75}
.ctext .ph{color:var(--color-ink-soft)}
.ctext .mkd{font-family:var(--font-hand)}
.cbar{display:flex;align-items:center;gap:8px;margin-top:4px}
.cbar .pm-btn{height:30px;padding:0 13px;font-size:14px}
.cbar .ibtn{width:30px;height:30px}
.nc{position:relative;flex:none;padding:10px 16px 12px}
.nc>*:not([data-hand-painted]){position:relative}
.nch{display:flex;align-items:center;gap:6px;height:22px;font-size:12px;color:var(--color-ink-soft)}
.nch .pin{color:var(--color-primary);display:flex}
.ncb{margin-top:3px;font-size:15px;line-height:1.75}
.ncbk{margin-top:8px}
.ncbk .tg{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--color-ink-soft);height:20px}
.brow{display:flex;align-items:center;gap:7px;height:28px;font-size:13px;color:var(--color-ink-soft);min-width:0;width:100%;text-align:left}
.brow .bt{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.brow .bd{flex:none;font-size:12px}
.ibtn{width:32px;height:32px;display:grid;place-items:center;border-radius:9px;color:var(--color-pen);flex:none}

/* ---------- 表格型（书影、玩物有志）：工具栏、白卡里的表、右边的面板 ---------- */
.tbar{position:absolute;left:62px;right:30px;top:76px;height:40px;display:flex;align-items:center;gap:10px}
.dd{height:36px;font-size:14px;gap:6px;padding:0 10px 0 12px;color:var(--color-ink);justify-content:space-between}
.dd .ico{color:var(--color-ink-soft)}
.ddl{display:flex;align-items:center;gap:6px;white-space:nowrap}
.tbar .pm-seg{height:36px}
.tbar .pm-seg-item{font-size:14px;min-width:0;padding:0 11px}
.tbar .pm-btn{height:34px;font-size:14px;padding:0 14px}
.ddw{position:relative}
.ddm{position:absolute;right:0;top:42px;width:176px;z-index:30;filter:drop-shadow(0 8px 16px var(--color-shadow))}
.ddm .pm-menu-item{height:34px;font-size:14px;padding:0 12px}
.ddm .act{color:var(--color-ink-soft);justify-content:flex-start}
.pm-menu-check{display:flex;color:var(--color-pen)}
.tcard{position:absolute;left:58px;right:28px;top:132px;bottom:16px;padding:4px 6px 0}
.tcard>*:not([data-hand-painted]){position:relative}
.gt{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;font-size:14px}
.gt th{height:32px;padding:0 10px;text-align:left;font-weight:400;font-size:12px;color:var(--color-ink-soft);border-bottom:1.5px dashed var(--color-line)}
.gt td{height:40px;padding:0 10px;border-top:1px dashed var(--color-line);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gt tbody tr:first-child td{border-top:0}
.gt th:first-child,.gt td:first-child{padding-left:14px}
.gt tr.on td{background:var(--color-selected)}
.gt tr.on td:first-child{border-radius:9px 0 0 9px}
.gt tr.on td:last-child{border-radius:0 9px 9px 0}
.gt .s{color:var(--color-ink-soft)}
.stars{display:inline-flex;gap:0;vertical-align:middle}
.spanel{position:absolute;top:4px;bottom:4px;right:4px;width:400px;z-index:12;display:flex;flex-direction:column;filter:drop-shadow(0 10px 22px var(--color-shadow))}
.spanel>*:not([data-hand-painted]){position:relative}
.sph{height:62px;flex:none;display:flex;align-items:flex-end;justify-content:space-between;padding:0 18px 10px 24px}
.sph h2{margin:0;font-size:20px;line-height:28px;font-weight:700}
.spb{flex:1;min-height:0;overflow:hidden;padding:6px 24px 8px;display:flex;flex-direction:column;gap:15px}
.fld{display:flex;flex-direction:column;gap:6px}
.fl{font-size:12px;line-height:16px;color:var(--color-ink-soft);display:flex;align-items:center;justify-content:space-between}
.fld .pm-field{height:38px;font-size:15px}
.fld .pm-field input{font-size:15px}
.fld .dd{width:100%;height:38px;font-size:15px}
.frow{display:flex;align-items:center;gap:6px}
.frow .pm-field{flex:1}
.spb .pm-seg{width:100%;height:36px}
.spb .pm-seg-item{flex:1;font-size:14px}
.ta{height:auto !important;min-height:64px;align-items:flex-start !important;padding:8px 12px !important;font-size:14px !important;line-height:1.6}
.runs{display:flex;flex-direction:column;gap:6px}
.run{display:flex;align-items:center;gap:8px}
.run .rn{width:50px;font-size:14px;flex:none}
.run .dd{width:100px;height:34px;font-size:14px}
.rx{color:var(--color-danger);width:26px;height:26px;display:grid;place-items:center;margin-left:auto}
.addrun{align-self:flex-start;display:flex;align-items:center;gap:3px;font-size:13px;color:var(--color-primary);height:24px}
.bkl{display:flex;flex-direction:column}
.bkr{display:flex;align-items:center;gap:8px;width:100%;height:36px;padding:0 6px;border-radius:9px;text-align:left;font-size:14px}
.bkr+.bkr{border-top:1px dashed var(--color-line)}
.bkr:hover{background:color-mix(in srgb,var(--color-selected) 60%,transparent)}
.bkt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bkd{flex:none;font-size:12px;color:var(--color-ink-soft)}
.spmeta{font-size:12px;color:var(--color-ink-soft)}
.spf{flex:none;display:flex;align-items:center;gap:8px;padding:12px 22px 14px 18px;border-top:1.5px dashed var(--color-line)}
.spf .pm-btn{height:32px;font-size:14px}
.spf .pm-btn--danger{padding:0 6px}
`;

// ---------- 编的数据 ----------
function photo(w, h, { crop = false } = {}) {
  const vb = crop ? '70 20 180 180' : '0 0 320 200';
  return `<svg width="${w}" height="${h}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<rect width="320" height="200" fill="var(--color-cat-orange-tint)"/><circle cx="214" cy="78" r="34" fill="var(--color-yuzu)"/>
<path d="M0 132 C60 104 120 110 170 128 C220 146 270 120 320 112 L320 200 L0 200 Z" fill="var(--color-cat-mint-sticker)"/>
<path d="M0 158 C70 140 140 150 200 162 C250 172 290 160 320 154 L320 200 L0 200 Z" fill="var(--color-leaf)" opacity=".75"/>
<g fill="var(--color-cat-pink)"><rect x="92" y="96" width="9" height="70" rx="2"/><rect x="146" y="96" width="9" height="70" rx="2"/><rect x="78" y="88" width="91" height="9" rx="3"/><rect x="86" y="106" width="75" height="6" rx="2"/></g>
<path d="M30 60 q8 -6 16 0 M48 52 q7 -5 14 0" stroke="var(--color-art-ink)" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
}
function photoGame(w, h) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 180 180" aria-hidden="true"><rect width="180" height="180" fill="var(--color-cat-sky-tint)"/>
<path d="M0 120 C40 96 70 104 100 118 C130 132 160 112 180 106 L180 180 L0 180 Z" fill="var(--color-cat-mint-sticker)"/>
<g fill="var(--color-art-white)"><ellipse cx="52" cy="54" rx="26" ry="10"/><ellipse cx="128" cy="40" rx="22" ry="8"/></g>
<rect x="74" y="58" width="34" height="16" rx="5" fill="var(--color-cat-orange-sticker)"/><path d="M80 74 L76 96 M102 74 L106 96" stroke="var(--color-art-ink)" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="140" cy="128" r="6" fill="var(--color-yuzu)"/></svg>`;
}
export const ARTICLES = [
  { id: 'oct', title: '十月读了什么', pre: '十月读得不多，三本半。每本挑一句记下来的话放在这里。', date: '11 / 14', crumb: '读书' },
  { id: 'games', title: '今年玩过的几个游戏', pre: '王国之泪二周目、星露谷第三年，还有每年冬天都要玩一次的风之旅人。', date: '11 / 13', crumb: '游戏', thumb: 'game' },
  { id: 'night', title: '读《夜航西飞》', pre: '这本书在书架上放了快两年，十月底终于读完。', date: '11 / 09', crumb: '读书 / 读后感' },
  { id: 'tokyo', title: '东京的第三天', pre: '早上被楼下面包店的香味叫醒。今天的计划是谷中银座和根津，慢慢逛。', date: '11 / 06', crumb: '旅行 / 2026 东京', thumb: 'photo' },
  { id: 'ghibli', title: '宫崎骏重看计划', pre: '一个月重看一部，从《千与千寻》开始。', date: '10 / 30', crumb: '电影' },
  { id: 'wind', title: '风很大的周末', pre: '骑车去河边，风把帽子吹走了两次。', date: '10 / 19', crumb: '随笔' },
  { id: 'slow', title: '关于慢慢来', pre: '最近总在赶，赶完一件又一件。其实没有人在后面追我。', date: '10 / 15', crumb: '随笔' },
];

// ---------- 见字如面 ----------
function side(active = 'all') {
  const fixed = [['all', 'notebook', '全部笔记', 143], ['pin', 'pin', '置顶', 3], ['untag', 'tag-off', '没标签的', 9], ['archive', 'archive', '归档', 12], ['trash', 'trash-2', '废纸篓', 4], ['lock', 'lock', '加密的', 2]];
  const row = ([id, icon, name, n]) => `<button type="button" class="srow${id === active ? ' on' : ''}"><span class="pk" data-hand="pick" data-seed="${seed()}"></span>${ic(icon, 17)}<span class="lbl">${name}</span><span class="n">${n}</span></button>`;
  const tw = (open) => `<span class="tw">${ic(open ? 'chevron-down' : 'chevron-right', 12)}</span>`;
  const tag = (id, icon, name, n, d, open) => `<button type="button" class="srow ${d}${id === active ? ' on' : ''}"><span class="pk" data-hand="pick" data-seed="${seed()}"></span>${open === undefined ? '<span class="tw"></span>' : tw(open)}${icon ? ic(icon, 16) : ''}<span class="lbl">${name}</span><span class="n">${n}</span></button>`;
  return `<div class="side">
${fixed.map(row).join('')}
<div class="srule"></div>
<div class="tree">
${tag('t-book', 'book-open', '读书', 31, '', true)}${tag('t-review', '', '读后感', 9, 'd1')}${tag('t-quote', '', '摘抄', 17, 'd1')}
${tag('t-game', 'gamepad-2', '游戏', 8)}${tag('t-film', 'clapperboard', '电影', 11)}${tag('t-trip', 'plane', '旅行', 18, '', false)}${tag('t-essay', 'pen-line', '随笔', 26)}${tag('t-life', 'coffee', '生活', 27, '', false)}${tag('t-work', 'briefcase', '工作', 19)}
</div></div>`;
}
function listRows(active) {
  return ARTICLES.map((n) => `<button type="button" class="nrow${n.id === active ? ' on' : ''}"><span class="pk" data-hand="pick" data-seed="${seed()}"></span>
<div class="nmain"><div class="ntitle"><span>${n.title}</span></div><div class="npre">${n.pre}</div><div class="ndate">${n.date}</div></div>
${n.thumb ? `<span class="nthumb">${n.thumb === 'photo' ? photo(54, 54, { crop: true }) : photoGame(54, 54)}</span>` : ''}</button>`).join('');
}
const fb = (icon, name, extra = '', cls = '') => `<button type="button" class="fb pm-tip-host ${cls}" aria-label="${name}">${ic(icon, 18)}${extra}${tip(name)}</button>`;
const fsep = '<span class="fsep" aria-hidden="true"></span>';
function formatBar() {
  return `<div class="fbar" data-hand="field" data-r="12" data-seed="${seed()}">
${fb('heading', '标题', `<span class="dn">${ic('chevron-down', 12)}</span>`)}${fsep}
${fb('bold', '加粗')}${fb('italic', '斜体')}${fb('underline', '下划线')}${fb('strikethrough', '删除线')}${fb('highlighter', '高亮', '<span class="fdot"></span>')}${fsep}
${fb('list', '列表')}${fb('list-ordered', '编号')}${fb('list-checks', '待办')}${fsep}
${fb('quote', '引用', '', 'opt')}${fb('code', '代码', '', 'opt')}${fb('link-2', '链接')}${fb('wikilink', '互链', '', 'opt')}${fsep}
${fb('paperclip', '图片和附件')}${fb('ellipsis', '更多格式')}
<button type="button" class="fb pin on pm-tip-host" aria-label="格式条一直在">${ic('pin', 18)}${tip('一直在')}</button>
</div>`;
}
const FT_FILL = ['cat-mint-bg', 'cat-sky-bg'];
const folderTabs = () => `<div class="ftabs" role="tablist" aria-label="见字如面的子页">${['见字如面', '设置'].map((s, i) => `<button type="button" class="ft pm-folder-tab" role="tab" aria-selected="${i === 0}"><span class="ft-off" data-hand="frame" data-r="9" data-sw="1.5" data-amp="0.5" data-fill="${FT_FILL[i]}" data-seed="${800 + i}"></span><span class="ft-on" data-hand="frame" data-r="9" data-sw="1.7" data-amp="0.5" data-fill="paper" data-seed="${810 + i}"></span><span class="ft-t">${s}</span></button>`).join('')}</div>`;

/** 书架：念念不忘的笔记，能拖进文章（dragged 是被拖走那条的下标，留在原处变淡）。 */
function shelf(notes, dragged) {
  const cards = notes.map((n, i) => `<div class="mn pm-card${i === dragged ? ' faded' : ''}" data-hand="cell" data-fill="card" data-seed="${seed()}"><span class="mnd">${n.when}</span><span class="mnt">${n.text}</span></div>`).join('');
  return `<div class="vl" aria-hidden="true"></div>
<aside class="shelf" data-hand="card" data-seed="${seed()}" aria-label="念念不忘">
<div class="shh">${mod('notes', 24)}<b>念念不忘</b><button type="button" class="x pm-tip-host" aria-label="收起">${ic('x', 17)}${tip('收起')}</button></div>
${field('', { ph: '找一条…', icon: 'search' })}
${dd(`${hash('读书/摘抄')}`)}
<div class="shl">${cards}</div>
</aside>`;
}
export const SHELF_NOTES = () => [
  { when: '11 / 02 21:14', text: `地铁上读 ${chip('books', '夜航西飞', { size: 14 })}：「如果必须离开一个地方，就尽快离开。」 ${hash('读书/摘抄')}` },
  { when: '10 / 26 07:50', text: `「慢慢来，比较快。」在根津神社的绘马上看到的。 ${hash('读书/摘抄')}` },
  { when: '10 / 21 22:30', text: `${chip('books', '风之影', { size: 14 })} 第一章：「每本书都有灵魂，写它的人的灵魂，读它的人的灵魂。」 ${hash('读书/摘抄')}` },
  { when: '10 / 12 13:05', text: `午休读完《小王子》，狐狸那段还是会难过。 ${hash('读书/摘抄')}` },
];
export const dragCard = (n) => `<div class="mn pm-card drag" data-hand="cell" data-fill="card" data-seed="${seed()}"><span class="mnd">${n.when}<span class="gr">${ic('grip-vertical', 14)}</span></span><span class="mnt">${n.text}</span></div>`;

export function articlesPage({ doc, active, crumb, fold = false, shelfOn = false, dragged = -1, opens = ['articles', 'notes', 'books'] }) {
  const inner = `<div class="cols" style="--wt:170px;--wl:280px">
${side('all')}
<div class="vl v0" aria-hidden="true"></div>
<div class="book">
<div class="mid">
<div class="mtop">${field('', { ph: '找一篇…', icon: 'search' })}
<button type="button" class="rb pm-btn--icon pm-tip-host" data-hand="round" data-seed="${seed()}" aria-label="新写一篇">${ic('square-pen', 18)}${tip('新写一篇')}</button></div>
<div class="listwrap"><div class="list" data-nolint>${listRows(active)}</div></div>
</div>
<div class="vl" aria-hidden="true"></div>
<div class="ed">
<div class="etop"><span class="crumb">${ic('hash', 14)}<span class="crumb-t">${esc(crumb)}</span></span>
<button type="button" class="eb pm-tip-host${shelfOn ? ' on' : ''}" aria-label="念念不忘">${ic('feather', 17)}${tip('念念不忘')}</button>
<button type="button" class="eb pm-tip-host" aria-label="导出">${ic('file-output', 17)}${tip('导出')}</button>
<button type="button" class="eb pm-tip-host" aria-label="置顶">${ic('pin', 17)}${tip('置顶')}</button>
<button type="button" class="eb pm-tip-host" aria-label="专心写">${ic('maximize-2', 17)}${tip('专心写')}</button>
<button type="button" class="eb pm-tip-host" aria-label="更多">${ic('ellipsis', 17)}${tip('更多')}</button></div>
<div class="docwrap"><div class="doc pm-scroll" data-nolint>${doc}</div></div>
${formatBar()}
</div>
${shelfOn ? shelf(SHELF_NOTES(), dragged) : ''}
</div>
</div>`;
  return { attrs: fold ? 'data-fold="1"' : '', html: desk({ opens, inner, tabs: folderTabs() }) };
}

// ---------- 正文 ----------
const embedNote = ({ on = false } = {}) => `<div class="emb" data-hand="cell" data-fill="card"${on ? ' data-sw="2.4" data-stroke="primary"' : ''} data-seed="${seed()}">
<div class="eh">${mod('notes', 18)}<span>11 月 2 日 · 周一 21:14</span><span class="op pm-tip-host">${ic('external-link', 15)}${tip('去念念不忘看这一条')}</span></div>
<div class="et">地铁上读 ${chip('books', '夜航西飞', { size: 14 })}：「如果必须离开一个地方，就尽快离开，不要回头。」想起去年辞职那段时间，好像也是这样慢慢走过来的。 ${hash('读书/摘抄')}</div>
</div>`;
export function docNight({ mode = 'card', suggest = false } = {}) {
  const head = `<h1>读《夜航西飞》</h1>
<p class="dmeta"><span>11 月 9 日 · 周一</span><span>改于 5 分钟前</span><span>1,640 字</span></p>
<p>${hash('读书/读后感')}</p>
<p>这本书在书架上放了快两年，十月底终于读完。${chip('books', '夜航西飞')}写柏瑞尔·马卡姆在肯尼亚的童年、驯马、开飞机，最后一个人从英国往西飞过大西洋。</p>
<h2>读到一半时记下的</h2>
<p>那天晚上在地铁上随手记了一句，现在回头看，几乎就是整本书的意思：</p>
${mode === 'caret' ? `<p class="src"><span class="mkd">![[</span>念念不忘/2026-11-02 21:14<i class="caret"></i><span class="mkd">]]</span></p>` : ''}
${embedNote({ on: mode === 'caret' })}`;
  const tail = suggest
    ? `<p>后半本节奏变快，飞越大西洋那一章几乎是一口气读完的。一个人，很大的天，很小的飞机，</p>
<p>和 <span class="mkd">[[</span>风<i class="caret"></i></p>
<div class="ovr">${suggestBox([
        ['games', '<em>风</em>之旅人', 'PS5 · 通关', true],
        ['books', '<em>风</em>之影', '卡洛斯·鲁依斯·萨丰'],
        ['films', '起<em>风</em>了', '宫崎骏 · 2013'],
        ['articles', '<em>风</em>很大的周末', '10 月 19 日'],
        ['notes', '今天<em>风</em>很大，骑车去河边看了一会儿水', '10 月 18 日'],
      ])}</div>`
    : `<p>后半本节奏变快，飞越大西洋那一章几乎是一口气读完的。一个人，很大的天，很小的飞机，和 ${chip('games', '风之旅人')} 里那段沙漠有点像。</p>
<h2>想接着看的</h2>
<p>同名的电影 ${chip('films', '走出非洲')} 里，柏瑞尔是丹尼斯的朋友。下个月找来看。</p>`;
  return head + '\n' + tail;
}
function suggestBox(rows) {
  return `<div class="sug pm-menu" role="listbox" aria-label="链接到">${rows.map(([m, t, meta, on]) => `<div class="pm-menu-item" role="option" aria-selected="${!!on}">${mod(m, 24)}<span class="st"><span class="stt">${t}</span><span class="stm">${meta}</span></span></div>`).join('')}</div>`;
}
export function docOctober() {
  return `<h1>十月读了什么</h1>
<p class="dmeta"><span>11 月 14 日 · 周六</span><span>改于刚刚</span><span>860 字</span></p>
<p>${hash('读书')}</p>
<p>十月读得不多，三本半。每本挑一句记下来的话放在这里。</p>
<h2>《夜航西飞》</h2>
<p>读了一大半，剩下的留到十一月。${chip('books', '夜航西飞')}</p>
<h2>《风之影》</h2>
<p>巴塞罗那的雾和旧书店，读的时候总想去那边走走。</p>
<div class="drop" aria-hidden="true"></div>
<div class="ovr">${dragCard(SHELF_NOTES()[2])}</div>
<h2>《小王子》</h2>
<p>第三次读。小时候只记得玫瑰，现在记住的是狐狸。</p>`;
}
export function docSlow({ menu = false, clip = false } = {}) {
  const ctxMenu = () => {
    const it = (icon, name, keys = '', cls = '') => `<button type="button" class="pm-menu-item ${cls}">${ic(icon, 16)}<span>${name}</span>${keys ? `<span class="keys">${keys}</span>` : ''}</button>`;
    const rule = '<div class="pm-menu-item grp" aria-hidden="true"></div>';
    return `<div class="ctx pm-menu show" role="menu">
${it('feather', '记到念念不忘', '', 'lead')}
${rule}
${it('bold', '加粗', '⌘B')}${it('italic', '斜体', '⌘I')}${it('underline', '下划线', '⌘U')}${it('highlighter', '高亮', '⌘⇧H')}${it('link-2', '链接', '⌘K')}${it('wikilink', '互链', '[[')}
${rule}
${it('heading', '标题', '⌘1–6')}${it('quote', '引用')}${it('callout', '提示框')}
</div>`;
  };
  const clipBox = () => `<div class="clip pm-card" data-hand="card" data-seed="${seed()}" role="dialog" aria-label="记到念念不忘">
<span class="cslap">${mod('notes', 40, { tilt: -8 })}</span>
<div class="ctext">慢一点，路边的花才看得见。<br><span class="from">来自</span>${chip('articles', '关于慢慢来', { size: 14 })}<br>${'<span class="hash">#随</span>'}<i class="caret"></i>
<div class="ovr"><div class="tsug pm-menu" role="listbox"><div class="pm-menu-item" role="option" aria-selected="true"><span>#<em>随</em>笔</span><span class="n">26</span></div><div class="pm-menu-item" role="option" aria-selected="false"><span>#<em>随</em>笔/散步</span><span class="n">4</span></div><div class="pm-menu-item" role="option" aria-selected="false"><span>#<em>随</em>手拍</span><span class="n">12</span></div></div></div>
</div>
<div class="cbar">${`<button type="button" class="ibtn pm-tip-host" aria-label="添加附件">${ic('paperclip', 17)}${tip('添加附件')}</button>`}<span class="grow"></span>${btn('取消', { plain: true })}${btn('记下')}</div>
</div>`;
  return `<h1>关于慢慢来</h1>
<p class="dmeta"><span>10 月 15 日 · 周四</span><span>改于昨天</span><span>1,024 字</span></p>
<p>${hash('随笔')}</p>
<p>最近总在赶，赶完一件又一件。上班赶地铁，下班赶超市关门前的打折，周末赶着把一周没做完的事做完。</p>
<p>其实没有人在后面追我。<span class="sel">慢一点，路边的花才看得见。</span></p>
${menu ? `<div class="ovr">${ctxMenu()}</div>` : ''}${clip ? `<div class="ovr">${clipBox()}</div>` : ''}
<p>那天在根津神社的绘马上看到一句「慢慢来，比较快」，抄了下来，贴在书桌前面。</p>
<h2>这个月想慢下来的事</h2>
<ul><li>每天走一站路回家</li><li>周末不定闹钟</li><li>读完 ${chip('books', '夜航西飞')}</li></ul>`;
}
export function docNightEnd() {
  return `<p>读完那天晚上把书放回书架，在扉页写了日期。下次再读，大概是哪一年要出远门的时候。</p>
<h2>摘几句</h2>
<blockquote>「如果必须离开一个地方，就尽快离开，不要回头。」</blockquote>
<blockquote>「我学会了，一个人可以在不完美里活得很好。」</blockquote>
<p>同名的电影 ${chip('films', '走出非洲')} 下个月找来看；路线想画在地图上，和 ${chip('articles', '东京的第三天')} 那张一样。</p>
<div class="bkx"><div class="bkh">链接到这里的 · 3</div><div class="row">
${chip('articles', '十月读了什么<span class="lkd">11 / 14</span>')}
${chip('notes', '把读后感写完了，比想象中长<span class="lkd">11 / 09</span>')}
${chip('notes', '想把柏瑞尔飞过的路线画出来<span class="lkd">11 / 10</span>')}
</div></div>`;
}

// ---------- 念念不忘 ----------
function heat() {
  let s = 7, out = '';
  for (let i = 0; i < 112; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280, rec = i / 112;
    const lv = r < 0.22 - rec * 0.1 ? 0 : r < 0.5 ? 1 : r < 0.75 ? 2 : r < 0.92 ? 3 : 4;
    out += `<i class="h${lv}"></i>`;
  }
  return `<div class="heat" aria-hidden="true">${out}</div>`;
}
function notesNav() {
  const row = (icon, name, n, on, d = '') => `<button type="button" class="srow ${d}${on ? ' on' : ''}"><span class="pk" data-hand="pick" data-seed="${seed()}"></span>${icon}<span class="lbl">${name}</span><span class="n">${n}</span></button>`;
  const tw = (open) => `<span class="tw">${open === undefined ? '' : ic(open ? 'chevron-down' : 'chevron-right', 12)}</span>`;
  const slot = (icon) => `<span class="tslot">${icon ? ic(icon, 15) : '#'}</span>`;
  return `<nav class="nnav" aria-label="念念不忘">
<div class="nstat"><div><b>1,286</b><span>笔记</span></div><div><b>42</b><span>标签</span></div><div><b>318</b><span>天</span></div></div>
${heat()}
${row(ic('notebook', 16), '全部笔记', '1,286', true)}${row(ic('pin', 16), '置顶', 6, false)}
<div class="srule"></div>
<div class="tree">
${row(tw(true) + slot('book-open'), '读书', 214)}${row(tw() + slot(''), '摘抄', 88, false, 'd1')}${row(tw() + slot(''), '读后感', 41, false, 'd1')}
${row(tw(true) + slot('gamepad-2'), '游戏', 63)}${row(tw() + slot(''), '玩后感', 19, false, 'd1')}
${row(tw() + slot('clapperboard'), '电影', 57)}${row(tw(false) + slot('plane'), '旅行', 120)}${row(tw() + slot(''), '随笔', 302)}${row(tw() + slot(''), '工作', 97)}
</div></nav>`;
}
export function noteCard({ when, pin = false, body, back = null }) {
  const bk = back ? `<div class="ncbk"><button type="button" class="tg">链接到这里的 · ${back.length}${ic('chevron-down', 12)}</button>${back.map(([m, t, d]) => `<button type="button" class="brow">${mod(m, 16)}<span class="bt">${t}</span><span class="bd">${d}</span></button>`).join('')}</div>` : '';
  return `<article class="nc pm-card" data-hand="card" data-seed="${seed()}">
<header class="nch"><time>${when}</time>${pin ? `<span class="pin" aria-label="已置顶">${ic('pin', 12)}</span>` : ''}<span class="grow"></span>${ic('ellipsis', 16)}</header>
<div class="ncb">${body}</div>${bk}
</article>`;
}
export function composer({ text = '', popup = '' } = {}) {
  return `<div class="comp pm-card" data-hand="card" data-seed="${seed()}">
<div class="ctext">${text || '<span class="ph">现在的想法是……</span>'}${popup ? `<div class="ovr">${popup}</div>` : ''}</div>
<div class="cbar"><button type="button" class="ibtn pm-tip-host" aria-label="添加附件">${ic('paperclip', 17)}${tip('添加附件')}</button><span class="grow"></span>${btn('记下')}</div>
</div>`;
}
export function notesPage({ feed, opens = ['notes', 'articles', 'games'] }) {
  const inner = `<div class="phd"><h1 class="pm-sheet-title">念念不忘</h1><span class="grow"></span>${field('', { ph: '搜索', icon: 'search', cls: 'sbox' })}</div>
<div class="nwrap">${notesNav()}<section class="nfeed">${feed}</section></div>`;
  return { html: desk({ opens, inner }) };
}
export const NOTE_CARDS = {
  zelda: (back = true) => noteCard({ when: '2026 / 11 / 12 22:05', pin: true, body: `通关了 ${chip('games', '塞尔达传说：王国之泪')}。最后那段从天上一路往下跳，配乐响起来的时候真的起鸡皮疙瘩。二周目想慢慢找呀哈哈。 ${hash('游戏/玩后感')}`, back: back ? [['articles', '<b>今年玩过的几个游戏</b>', '11 / 13'], ['notes', '二周目开始了，这次先把地图点亮', '11 / 14']] : null }),
  ghibli: () => noteCard({ when: '2026 / 11 / 10 20:31', body: `重看了 ${chip('films', '千与千寻')}，这次注意到锅炉爷爷其实一直在照顾小千。 ${hash('电影')}` }),
  review: () => noteCard({ when: '2026 / 11 / 09 23:12', body: `把 ${chip('articles', '读《夜航西飞》')} 写完了，比想象中长。 ${hash('读书/读后感')}` }),
  night: () => noteCard({ when: '2026 / 11 / 02 21:14', body: `地铁上读 ${chip('books', '夜航西飞')}：「如果必须离开一个地方，就尽快离开，不要回头。」 ${hash('读书/摘抄')}` }),
};
export const SUGGEST_NOTE = () => suggestBox([
  ['games', '<em>星</em>露谷物语', 'PC · 在玩', true],
  ['films', '<em>星</em>际穿越', '克里斯托弗·诺兰 · 2014'],
  ['books', '<em>星</em>之继承者', '詹姆斯·P·霍根'],
  ['articles', '看<em>星</em>星的晚上', '8 月 12 日'],
  ['notes', '<em>星</em>露谷第三年秋天，鸡舍终于升级完了', '11 月 7 日'],
]).replace('class="sug pm-menu"', 'class="sug pm-menu" style="left:150px;top:4px"');

// ---------- 表格型：书影、玩物有志 ----------
export const GAMES = [
  ['塞尔达传说：王国之泪', ['动作冒险', 'mint'], 'Switch', '日本', 'done', 5, '2026', '二周目', '二周目在找全部的呀哈哈'],
  ['星露谷物语', ['模拟经营', 'sky'], 'PC', '美国', 'doing', 5, '', '', '第三年秋天，鸡舍升级完了'],
  ['蔚蓝', ['动作冒险', 'mint'], 'Switch', '加拿大', 'doing', 4, '', '', '卡在第七章'],
  ['哈迪斯', ['Roguelike', 'pink'], 'Switch', '美国', 'done', 4, '2025', '一周目', ''],
  ['风之旅人', ['冒险解谜', 'orange'], 'PS5', '美国', 'done', 5, '2025', '三周目', '每年冬天玩一次'],
  ['双人成行', ['冒险解谜', 'orange'], 'PS5', '瑞典', 'done', 4, '2025', '一周目', '和小林一起'],
  ['空洞骑士', ['动作冒险', 'mint'], 'Switch', '澳大利亚', 'doing', 4, '', '', '白色宫殿还没过'],
  ['动物森友会', ['模拟经营', 'sky'], 'Switch', '日本', 'done', 3, '2023', '一周目', ''],
  ['纪念碑谷', ['冒险解谜', 'orange'], '手机', '英国', 'done', 4, '2022', '一周目', '地铁上玩完的'],
  ['黑神话：悟空', ['动作冒险', 'mint'], 'PS5', '中国', 'todo', 0, '', '', ''],
  ['艾尔登法环', ['角色扮演', 'grape'], 'PS5', '日本', 'todo', 0, '', '', '等有一整个假期'],
  ['极乐迪斯科', ['角色扮演', 'grape'], 'PC', '爱沙尼亚', 'todo', 0, '', '', ''],
];
const GAME_STATUS = { todo: ['想玩', 'sky'], doing: ['在玩', 'orange'], done: ['通关', 'mint'] };
export const BOOKS = [
  ['夜航西飞', '柏瑞尔·马卡姆', '传记', '英国', 'doing', 4, '', ''],
  ['风之影', '卡洛斯·鲁依斯·萨丰', '小说', '西班牙', 'done', 5, '2026', '巴塞罗那的旧书店'],
  ['小王子', '圣埃克苏佩里', '小说', '法国', 'done', 5, '2026', '第三次读'],
  ['我的天才女友', '埃莱娜·费兰特', '小说', '意大利', 'doing', 0, '', ''],
  ['走出非洲', '凯伦·布里克森', '散文', '丹麦', 'todo', 0, '', '读完夜航西飞再读'],
  ['人类简史', '尤瓦尔·赫拉利', '历史', '以色列', 'done', 3, '2025', ''],
  ['三体', '刘慈欣', '科幻', '中国', 'done', 5, '2024', '重读了一遍'],
  ['原则', '瑞·达利欧', '商业', '美国', 'todo', 0, '', ''],
  ['且听风吟', '村上春树', '小说', '日本', 'done', 4, '2023', ''],
  ['额尔古纳河右岸', '迟子建', '小说', '中国', 'unmarked', 0, '', ''],
];
export const FILMS = [
  ['千与千寻', '宫崎骏', '动画', '日本', 'done', 5, '2026', '重看'],
  ['请回答 1988', '申元浩', '剧集', '韩国', 'doing', 0, '', '看到第 12 集'],
  ['起风了', '宫崎骏', '动画', '日本', 'done', 4, '2025', ''],
  ['星际穿越', '克里斯托弗·诺兰', '科幻', '美国', 'done', 5, '2024', ''],
  ['花样年华', '王家卫', '剧情', '中国香港', 'done', 5, '2023', ''],
  ['东京物语', '小津安二郎', '剧情', '日本', 'todo', 0, '', ''],
  ['走出非洲', '西德尼·波拉克', '剧情', '美国', 'todo', 0, '', '和书一起'],
  ['寄生虫', '奉俊昊', '剧情', '韩国', 'done', 4, '2022', ''],
  ['爱乐之城', '达米恩·查泽雷', '歌舞', '美国', 'todo', 0, '', ''],
  ['海街日记', '是枝裕和', '剧情', '日本', 'unmarked', 0, '', ''],
];
const BF_STATUS = {
  books: { unmarked: ['待标记', 'grape'], todo: ['想读', 'sky'], doing: ['在读', 'orange'], done: ['已读', 'mint'] },
  films: { unmarked: ['待标记', 'grape'], todo: ['想看', 'sky'], doing: ['在看', 'orange'], done: ['已看', 'mint'] },
};
const chipT = ([t, c]) => `<span class="pm-chip pm-cat-${c}">${t}</span>`;
const statusChip = (st) => (st[0] === '待标记' ? `<span class="pm-chip" style="--pm-tag-bg:color-mix(in srgb,var(--color-ink) 8%,transparent);--pm-dot:var(--color-ink-soft)">待标记</span>` : chipT(st));

function gamesTable(sel) {
  const head = ['名称', '类型', '平台', '国家', '状态', '尝尝咸淡', '完成', '周目', '备注'];
  const wd = ['22%', '104px', '76px', '76px', '78px', '112px', '60px', '66px', ''];
  return `<table class="gt"><colgroup>${wd.map((w) => `<col${w ? ` style="width:${w}"` : ''}>`).join('')}</colgroup>
<thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>
${GAMES.map((g, i) => `<tr${i === sel ? ' class="on"' : ''}><td>${g[0]}</td><td>${chipT(g[1])}</td><td class="s">${g[2]}</td><td class="s">${g[3]}</td><td>${chipT(GAME_STATUS[g[4]])}</td><td>${stars(g[5])}</td><td class="s">${g[6] || '—'}</td><td class="s">${g[7] || '—'}</td><td class="s">${g[8]}</td></tr>`).join('\n')}
</tbody></table>`;
}
function bfTable(kind, sel) {
  const rows = kind === 'books' ? BOOKS : FILMS;
  const head = [kind === 'books' ? '书名' : '名称', kind === 'books' ? '作者' : '导演', '类型', '国家', '状态', '尝尝咸淡', '完成', '备注'];
  const wd = ['24%', '16%', '76px', '9%', '84px', '112px', '70px', ''];
  return `<table class="gt"><colgroup>${wd.map((w) => `<col${w ? ` style="width:${w}"` : ''}>`).join('')}</colgroup>
<thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>
${rows.map((b, i) => `<tr${i === sel ? ' class="on"' : ''}><td>${b[0]}</td><td class="s">${b[1]}</td><td class="s">${b[2]}</td><td class="s">${b[3]}</td><td>${statusChip(BF_STATUS[kind][b[4]])}</td><td>${stars(b[5])}</td><td class="s">${b[6] || '—'}</td><td class="s">${b[7]}</td></tr>`).join('\n')}
</tbody></table>`;
}

const TITLE = { games: '玩物有志', books: '摸鱼读读', films: '好奇看看' };
export function collectionPage({ kind, sel = -1, panel = '', ddOpen = false, opens }) {
  let stat, tools;
  if (kind === 'games') {
    stat = '共 <b>12</b> · 通关 <b>6</b> · 在玩 <b>3</b> · 想玩 <b>3</b>';
    const platMenu = ddOpen ? `<div class="ddm pm-menu" role="listbox">${['全部平台', 'Switch', 'PS5', 'PC', '手机'].map((p, i) => `<div class="pm-menu-item" role="option" aria-selected="${i === 0}"><span>${p}</span><span class="pm-menu-check">${ic('check', 16)}</span></div>`).join('')}<div class="pm-menu-item act" role="option" aria-selected="false">${ic('settings-2', 15)}<span>管理平台…</span></div></div>` : '';
    tools = `${field('', { ph: '搜索名称、国家、备注', icon: 'search', cls: 'sbox' })}
${seg(['全部 12', '想玩 3', '在玩 3', '通关 6'], '全部 12')}
<span class="grow"></span>${dd('全部类型')}<span class="ddw">${dd('全部平台')}${platMenu}</span>${dd('最近添加')}${btn('新游戏', { icon: 'plus' })}`;
  } else {
    const L = kind === 'books' ? ['已读', '在读', '想读', '待标记', '书名、作者', '新书'] : ['已看', '在看', '想看', '待标记', '名称、导演', '新影视'];
    const c = kind === 'books' ? [5, 2, 2, 1] : [5, 1, 3, 1];
    stat = `共 <b>10</b> · ${L[0]} <b>${c[0]}</b> · ${L[1]} <b>${c[1]}</b> · ${L[2]} <b>${c[2]}</b> · ${L[3]} <b>${c[3]}</b>`;
    tools = `${field('', { ph: `搜索${L[4]}、国家、备注`, icon: 'search', cls: 'sbox' })}
${seg(['全部 10', `${L[3]} ${c[3]}`, `${L[2]} ${c[2]}`, `${L[1]} ${c[1]}`, `${L[0]} ${c[0]}`], '全部 10')}
<span class="grow"></span>${dd('全部类型')}${dd('最近添加')}${btn(L[5], { icon: 'plus' })}`;
  }
  const inner = `<div class="phd"><h1 class="pm-sheet-title">${TITLE[kind]}</h1><span class="grow"></span><p class="pstat">${stat}</p></div>
<div class="tbar">${tools}</div>
<div class="tcard pm-card" data-hand="card" data-seed="${seed()}">${kind === 'games' ? gamesTable(sel) : bfTable(kind, sel)}</div>
${panel}`;
  return { html: desk({ opens: opens ?? [kind, 'notes', 'articles'], inner }) };
}

const fld = (label, ctrl, action = '') => `<div class="fld"><span class="fl"><span>${label}</span>${action}</span>${ctrl}</div>`;
function backList(label, rows) {
  return fld(`${label} · ${rows.length}`, `<div class="bkl">${rows.map(([m, t, d]) => `<button type="button" class="bkr">${mod(m, 20)}<span class="bkt">${t}</span><span class="bkd">${d}</span></button>`).join('')}</div>`);
}
function panelShell(body) {
  return `<aside class="spanel pm-card" data-hand="card" data-seed="1500" data-amp="0.8" aria-label="编辑">
<header class="sph"><h2>编辑</h2><button type="button" class="ibtn pm-tip-host" aria-label="关闭">${ic('x', 18)}${tip('关闭')}</button></header>
<div class="spb">${body}</div>
<footer class="spf"><button type="button" class="pm-btn pm-btn--danger">删除</button><span class="grow"></span>${btn('取消', { plain: true })}${btn('保存')}</footer>
</aside>`;
}
const sparkBtn = () => `<button type="button" class="ibtn pm-tip-host" aria-label="补全">${ic('sparkles', 16)}${tip('补全')}</button>`;
export function gamePanel() {
  return panelShell(`${fld('名称', `<div class="frow">${field('塞尔达传说：王国之泪')}${sparkBtn()}</div>`)}
${fld('类型', dd(`<span class="pm-chip pm-cat-mint">动作冒险</span>`))}
${fld('平台', dd('Switch'))}
${fld('国家', field('日本'))}
${fld('状态', seg(['想玩', '在玩', '通关'], '通关'))}
${fld('尝尝咸淡', stars(5, 22))}
${fld('完成时间', `<div class="runs"><div class="run"><span class="rn">一周目</span>${dd('2023')}</div><div class="run"><span class="rn">二周目</span>${dd('2026')}${stars(5, 16)}<button type="button" class="rx" aria-label="去掉二周目">${ic('x', 15)}</button></div><button type="button" class="addrun">${ic('plus', 13)}再玩一周目</button></div>`)}
${fld('备注', `<div class="pm-field ta" data-hand="field" data-seed="${seed()}">二周目在找全部的呀哈哈，还差 120 个。</div>`)}
${backList('玩后感', [['notes', '通关了。最后那段从天上一路往下跳，配乐响起来…', '11 / 12'], ['articles', '<b>今年玩过的几个游戏</b>', '11 / 13'], ['notes', '二周目开始了，这次先把地图点亮', '11 / 14']])}
<p class="spmeta" data-nolint>添加于 2023 / 5 / 14</p>`);
}
export function bookPanel() {
  return panelShell(`${fld('书名', `<div class="frow">${field('夜航西飞')}${sparkBtn()}</div>`)}
${fld('作者', field('柏瑞尔·马卡姆'))}
${fld('类型', dd('传记'))}
${fld('国家', field('英国'))}
${fld('状态', seg(['待标记', '想读', '在读', '已读'], '在读'))}
${fld('尝尝咸淡', stars(4, 22))}
${fld('备注', `<div class="pm-field ta" data-hand="field" data-seed="${seed()}">书架上放了快两年。</div>`)}
${backList('读后感', [['articles', '<b>读《夜航西飞》</b>', '11 / 09'], ['articles', '<b>十月读了什么</b>', '11 / 14'], ['notes', '地铁上读夜航西飞：「如果必须离开一个地方…」', '11 / 02'], ['notes', '想把柏瑞尔飞过的路线画出来', '11 / 10']])}
<p class="spmeta" data-nolint>添加于 2024 / 12 / 30</p>`);
}
export function filmPanel() {
  return panelShell(`${fld('名称', `<div class="frow">${field('千与千寻')}${sparkBtn()}</div>`)}
${fld('导演', field('宫崎骏'))}
${fld('类型', dd('动画'))}
${fld('国家', field('日本'))}
${fld('状态', seg(['待标记', '想看', '在看', '已看'], '已看'))}
${fld('尝尝咸淡', stars(5, 22))}
${fld('完成时间', `<div class="runs"><div class="run">${dd('2019')}</div><div class="run">${dd('2026')}${stars(5, 16)}<button type="button" class="rx" aria-label="去掉这一次">${ic('x', 15)}</button></div><button type="button" class="addrun">${ic('plus', 13)}再看一次</button></div>`)}
${fld('备注', `<div class="pm-field ta" data-hand="field" data-seed="${seed()}">重看，这次是一个人去影院。</div>`)}
${backList('观后感', [['notes', '重看了千与千寻，这次注意到锅炉爷爷…', '11 / 10'], ['articles', '<b>宫崎骏重看计划</b>', '10 / 30']])}
<p class="spmeta" data-nolint>添加于 2019 / 7 / 2</p>`);
}
