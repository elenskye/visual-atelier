// 生成 Pomelo Explore 的「界面小图标」一页（原 pomelo-icons 画布，2026-11-12 并进来）。
// 图标直接取 schemes/pomelo/marks/icons/ 里生成好的 SVG（线跟着文字颜色），不另画一份。
// 改了 schemes/pomelo/marks/icons.mjs 先跑 node tooling/handmade/marks.mjs，再跑这里。
// 用法：在仓库根目录 node canvases/pomelo-explore/icons/gen.mjs
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { rootImport, fromRoot } from '../../_lib/root.mjs';
import { PROJECT, writePage, dsBoard } from '../page.mjs';

const PG = 'icons';
const PREFIX = 'Icons-';
const { loadTokens } = await rootImport('tooling/lib/common.mjs');
const { UI_ICONS, UI_ICON_ORDER } = await rootImport('schemes/pomelo/marks/icons.mjs');
const tokens = loadTokens('pomelo');
const PALETTES = Object.keys(tokens.color.palettes);

const src = (id) => readFileSync(fromRoot(`schemes/pomelo/marks/icons/${id}.svg`), 'utf8').trim();
const ic = (id, size) => src(id).replace(/ width="24" height="24"/, ` width="${size}" height="${size}"`).replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');

const CSS = `
body{margin:0}
.bd{box-sizing:border-box;width:1280px;height:800px;overflow:hidden;position:relative;background:var(--color-desk);padding:36px 48px;display:flex;flex-direction:column;gap:16px;color:var(--color-ink)}
.hd h1{margin:0;font-size:26px;line-height:34px;font-weight:700}
.hd p{margin:4px 0 0;font-size:14px;line-height:22px;color:var(--color-ink-soft)}
.cap{font-size:12px;line-height:16px;color:var(--color-ink-soft);text-align:center;white-space:nowrap}
.bd svg{flex:none}
.cell{display:flex;flex-direction:column;align-items:center;gap:5px;width:84px}
.cell .pair{display:flex;align-items:flex-end;gap:8px;height:30px}
.row{display:flex;align-items:center;gap:10px}
`;

function board(file, title, body, { w = 1280, h = 800 } = {}) {
  const props = { palette: { editor: 'enum', options: PALETTES, default: PALETTES[0], section: '配色' }, dark: { editor: 'boolean', default: false, section: '配色' }, $preview: { width: w, height: h } };
  const html = dsBoard({
    title, css: CSS, props,
    body: `<div class="pm bd" data-palette="{{palette}}" data-theme="{{theme}}">
${body}
</div>`,
    script: `class Component extends DCLogic {
  renderVals() {
    return { palette: this.props.palette ?? 'blue', theme: this.props.dark ? 'dark' : 'light' };
  }
  componentDidMount() { this.stop = Pomelo.paintLive(document.body); }
  componentDidUpdate() { Pomelo.paint(document.body); }
  componentWillUnmount() { this.stop && this.stop(); }
}`,
  });
  writeFileSync(path.join(PROJECT, PREFIX + file), html);
  return { file: PREFIX + file, title, w, h };
}

const cell = (id) => `<div class="cell"><div class="pair">${ic(id, 28)}${ic(id, 16)}</div><span class="cap">${UI_ICONS[id].name}</span></div>`;
const sheet = (ids, seed) => `<div class="pm-card" data-hand="card" data-seed="${seed}" style="padding:18px 16px;display:grid;grid-template-columns:repeat(13,84px);gap:14px 4px;justify-content:space-between">${ids.map(cell).join('')}</div>`;
const batch = (n) => UI_ICON_ORDER.filter((id) => UI_ICONS[id].batch === n);
const lucide = (n) => batch(n).reduce((a, id) => a + UI_ICONS[id].for.length, 0);

const B1 = board('Main.dc.html', '界面图标 · 第一批', `
<div class="hd"><h1>界面图标 · 第一批（${batch(1).length} 个）</h1><p>到处都有的：方向、增删改、文件和文件夹、状态、柚子帮忙。24 格一笔单线、线宽 2、抖动 0.32，跟着文字颜色；每个 28 号和 16 号各一个。替换 Pomelo 现在用的 ${lucide(1)} 个 Lucide 图标，另有 3 个是外框自己的（回桌面、翻面、一颗星）。</p></div>
${sheet(batch(1), 201)}
`);
const B2 = board('Batch2.dc.html', '界面图标 · 第二批', `
<div class="hd"><h1>界面图标 · 第二批（${batch(2).length} 个）</h1><p>指东西的：模块的小图标、标签和自建模块能选的那些、柚子页的资料和记忆。画法同第一批。替换 ${lucide(2)} 个 Lucide 图标（小鸟和柑橘都换成柚子）。</p></div>
${sheet(batch(2), 202)}
`);

// 用起来的样子：按钮、列表行、菜单，明暗各一块
const btn = (id, text, primary) => `<span class="pm-btn${primary ? '' : ' pm-btn--plain'}" data-hand="button"${primary ? '' : ' data-fill="card"'} data-seed="${300 + id.length}" style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;font-size:15px;${primary ? 'color:var(--color-on-primary)' : ''}"><span style="position:relative;display:flex">${ic(id, 16)}</span><span style="position:relative">${text}</span></span>`;
const line = (id, text, tail) => `<div class="row" style="height:38px;border-bottom:2px dashed var(--color-line);font-size:15px"><span style="display:flex;color:var(--color-pen)">${ic(id, 18)}</span><span style="flex:1">${text}</span><span class="row" style="gap:12px;color:var(--color-ink-soft)">${tail.map((t) => ic(t, 16)).join('')}</span></div>`;
const panel = (theme, seed) => `<div class="pm-card" data-hand="card" data-seed="${seed}" data-theme="${theme}" style="width:540px;padding:20px 22px;color:var(--color-ink);display:flex;flex-direction:column;gap:14px">
<div class="cap" style="text-align:left">${theme === 'dark' ? '暗色' : '浅色'}</div>
<div class="row">${btn('plus', '记一笔', true)}${btn('file-input', '导入账单')}${btn('sliders-horizontal', '筛选')}${btn('sparkles', '柚子帮忙')}</div>
<div>${line('folder', '毕业论文', ['pin', 'ellipsis'])}${line('file-text', '开题报告 · 第三稿.docx', ['external-link', 'trash-2'])}${line('calendar-heart', '妈妈的生日', ['bell-ring', 'pencil'])}${line('key-round', '图书馆账号', ['copy', 'eye'])}${line('book-open', '《海边的柚子树》', ['star', 'chevron-right'])}</div>
<div class="row" style="gap:18px;color:var(--color-ink-soft);font-size:14px"><span class="row" style="gap:5px">${ic('lightbulb', 15)}思考</span><span class="row" style="gap:5px">${ic('globe', 15)}联网</span><span class="row" style="gap:5px">${ic('library-big', 15)}知识库</span><span class="row" style="gap:5px">${ic('brain', 15)}记忆</span><span class="row" style="gap:5px">${ic('alarm-clock', 15)}定时</span><span class="row" style="gap:5px">${ic('puzzle', 15)}插件库</span></div>
<div class="row" style="gap:16px">${['chevron-left', 'chevron-right', 'refresh-cw', 'search', 'settings', 'house', 'paperclip', 'send', 'circle-check', 'triangle-alert', 'lock', 'tag'].map((i) => ic(i, 20)).join('')}</div>
</div>`;
const B3 = board('InUse.dc.html', '界面图标 · 用起来的样子', `
<div class="hd"><h1>界面图标 · 用起来的样子</h1><p>按钮里 16 号、列表行 18 和 16 号、工具行 15 号、一排 20 号：都是 Pomelo 里常见的大小。名字和内容是编的。</p></div>
<div style="display:flex;gap:28px;align-items:flex-start">${panel('light', 211)}${panel('dark', 212)}</div>
`);

const boards = [B1, B2, B3];
writePage({
  id: PG, name: 'R3：界面小图标', prefix: PREFIX,
  boards: boards.map((b, i) => ({ file: b.file, x: i * (b.w + 120), y: 0, w: b.w, h: b.h, title: b.title })),
});
console.log(`pomelo-explore/icons：${boards.length} 张画板 → ${path.relative(process.cwd(), PROJECT)}`);
