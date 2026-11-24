// Pomelo Explore 的「R5：Atlas 年度小报」那一页（Dawn Plan · Phase 9 起，2026-11-13 从单独的 pomelo-atlas 画布并进来）。
// 设计的源在方案里（schemes/pomelo/atlas/tabloid/），这里只拿一份编的「呈现结果」（它的 sample.mjs）把它摆出来。
// 五张画板（文件名前面都是 Atlas-）：
//   Main      走一遍：桌上的信封 → 拆开 → 一本小报跟着节拍自己翻（一拍 0.8 秒），碰一下就停；目录、点开原记录、收进抽屉
//   Pages     全部的页摊开看（和 Main 里是同一份）
//   Bubbles   「和柚子聊的事」的泡泡：通用的 6 个、专属的 12 个
//   Module    Atlas 模块页（和 Pomelo 里一样）：一年一张封面，封面由设计自己画（1.0.2 起）；时间穿梭进那一年；样式
//   Desk      桌上的两样：新年第一周的信封、那年今日的便签；节拍表
// 手画的框用 Design System「Pomelo 柚儿园」的 bundle.js。用法：在仓库根目录 node canvases/pomelo-explore/atlas/gen.mjs
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { rootImport, fromRoot } from '../../_lib/root.mjs';
import { PROJECT, writePage, dsBoard } from '../page.mjs';

const { loadTokens } = await rootImport('tooling/lib/common.mjs');
const { stripModule } = await rootImport('tooling/design-system/bundle.mjs');
const { bundleDesign, loadAssets } = await rootImport('tooling/atlas/build.mjs');
const T = 'schemes/pomelo/atlas/tabloid';
const { PW, PH, svg, INK2, CATS } = await rootImport(`${T}/draw.mjs`);
const { prepare, SCENE_NAMES } = await rootImport(`${T}/pages.mjs`);
const { flat } = await rootImport(`${T}/shell.mjs`);
const { CSS: ZINE_CSS } = await rootImport(`${T}/style.mjs`);
const { makeKit } = await rootImport(`${T}/kit.mjs`);
const { tabloidCover } = await rootImport(`${T}/cover.mjs`);
const { BUBBLES, drawBubble } = await rootImport(`${T}/bubbles.mjs`);
const { sampleYear } = await rootImport(`${T}/sample.mjs`);
const META = JSON.parse(readFileSync(fromRoot(`${T}/design.json`), 'utf8'));
const PALETTES = Object.keys(loadTokens('pomelo').color.palettes);
const K = makeKit(await loadAssets('pomelo', 'tabloid'));
const { mark, icon } = K;
const ASSETS = await loadAssets('pomelo', 'tabloid');
const cover = (o) => tabloidCover(ASSETS, { ...o, name: META.name, version: META.version });
const TIME_TRAVEL = readFileSync(fromRoot('schemes/pomelo/marks/icons/time-travel.svg'), 'utf8').trim().replace(/ width="[\d.]+" height="[\d.]+"/, ' width="20" height="20"');

// 走一遍用的脚本：打好的设计（和冻结成快照的是同一份，去掉 export 当经典脚本用）加样例数据
const DESIGN_JS = (await bundleDesign('pomelo', 'tabloid')).replace('export const design =', 'const design =').replace(/^export default design;$/m, '');
const SAMPLE_JS = `const sampleYear = (() => {\n${stripModule(readFileSync(fromRoot(`${T}/sample.mjs`), 'utf8').replace(/^import .*$/m, ''), 'sample.mjs', () => true).code}\nreturn sampleYear;\n})();`;

const CSS = `
html,body{margin:0}
.board{background:var(--color-desk)}
.deskbg{position:absolute;inset:0}
.zhost{position:absolute;inset:0}
${ZINE_CSS}`;

// ---------- Main：走一遍（小报由脚本照样例数据挂上去，换 Tweaks 就重挂） ----------
function mainBoard() {
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="700"></div>
<div class="zhost"></div>`;
}

// ---------- Pages：全部的页摊开 ----------
function pagesBoard() {
  const html = flat(prepare(sampleYear()), K);
  // 目录的页码：摊开看时照全部的幕写
  const scenes = [...html.matchAll(/class="zp[^"]*" data-scene="([^"]+)"/g)].map((m) => m[1]).filter((s) => s !== 'spare');
  const numbered = html.replace(/data-toc="([^"]+)"(.*?)<span class="num ztocno"([^>]*)><\/span>/g, (_, key, mid, attrs) => `data-toc="${key}"${mid}<span class="num ztocno"${attrs}>${scenes.indexOf(key) + 1}</span>`);
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="701"></div>${numbered}`;
}

// ---------- Bubbles：泡泡的清单 ----------
function bubblesBoard() {
  const cell = (bub, i) => {
    const o = drawBubble(bub.key, { cx: 120, cy: 96, R: 58, seed: 3001 + i * 200, color: CATS[i % 5], dir: i % 2 ? -1 : 1, beat: 0 });
    const name = bub.generic ? bub.name : bub.when.split('、')[0];
    return `<div style="position:relative;width:240px;height:226px"><div class="zp still" data-theme="light" style="position:absolute;inset:0;width:240px;height:226px;background:var(--color-print-paper);border-radius:8px;box-shadow:0 1px 2px var(--color-shadow),0 8px 18px var(--color-shadow)">${svg(240, 226, o.art)}<div style="position:absolute;left:${120 + (o.dx || 0) - 90}px;top:${96 + (o.dy || 0) - 22}px;width:180px;text-align:center;color:${o.color || 'var(--color-print-ink)'}"><span style="display:block;font-size:18px;line-height:24px;font-weight:700;white-space:nowrap">${name}${o.after || ''}</span><span class="num" style="display:block;font-size:11px;line-height:16px;color:${o.sub || INK2}">${40 - i} 次</span></div>
<div style="position:absolute;left:14px;right:14px;bottom:10px;font-size:12px;line-height:18px;color:var(--color-print-ink-soft);white-space:nowrap">${bub.generic ? `通用 · ${bub.name}` : `${bub.name} · ${bub.when}`}</div></div></div>`;
  };
  const group = (title, sub, list, off) => `<div style="margin-bottom:26px"><div style="display:flex;align-items:baseline;gap:12px;margin-bottom:12px"><span style="font-size:20px;line-height:28px;font-weight:700">${title}</span><span style="font-size:13px;line-height:20px;color:var(--color-ink-soft)">${sub}</span></div><div style="display:grid;grid-template-columns:repeat(6,240px);gap:20px">${list.map((bb, i) => cell(bb, i + off)).join('')}</div></div>`;
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="705"></div>
<div style="position:absolute;left:50px;top:40px;right:50px">
<div style="font-size:14px;line-height:23px;color:var(--color-ink-soft);margin-bottom:22px;max-width:1180px">模型不挑泡泡：它只把这一年常聊的话题归到一个固定的类别（做饭吃喝、求职工作、代码技术、旅行出门、宠物、睡眠、感情、钱、学习、身体、心情、家人朋友，认不出来就是「别的」），次数由程序数。画什么由设计定：类别有专属泡泡、这一页还没用过，就用它；「别的」、重复的类别用通用的，轮着来，一页里不重样。所以哪一年聊什么都画得出来。</div>
${group('通用的 6 个', '没有专属泡泡的话题：轮着用，颜色跟着位置走', BUBBLES.filter((x) => x.generic), 0)}
${group('专属的 12 个', '一个话题类别一个，一页里只用一次', BUBBLES.filter((x) => !x.generic), 6)}
</div>`;
}

// ---------- Module：Atlas 模块页（和 Pomelo 里的一样）：一年一张封面排成一排；封面是设计自己画的（1.0.2 起） ----------
function moduleBoard() {
  const tilt = [-2, 1.5, -1];
  const paper = (inner, i, n = 1) => `<span style="position:relative;display:block;flex:none;width:168px;height:218px">${n > 1 ? '<span aria-hidden="true" style="position:absolute;inset:0;border-radius:6px;background:var(--color-print-paper);box-shadow:0 1px 2px rgba(0,0,0,.18);transform:translate(7px,5px) rotate(3deg)"></span>' : ''}<span style="position:absolute;inset:0;transform:rotate(${tilt[i % 3]}deg)">${inner}</span></span>`;
  const year = (y, sub, i, { until = null, n = 1, none = '' } = {}) => {
    const cov = none
      ? `<span style="display:grid;place-items:center;width:168px;height:218px;border:2px dashed var(--color-line);border-radius:6px;font-size:13px;color:var(--color-ink-soft)">${none}</span>`
      : paper(cover({ year: y, until }), i, n);
    const act = none
      ? `<button type="button" class="pm-btn pm-btn--plain" data-hand="button" data-fill="card" data-seed="${610 + i}">补做这一年</button>`
      : `<span style="display:flex;align-items:center;gap:6px"><span class="pm-tip-host" style="display:inline-flex;padding:6px;line-height:0;color:var(--color-ink)">${TIME_TRAVEL}<span class="pm-tip" role="tooltip"><span class="pm-tip-string"></span><span class="pm-tip-tag">时间穿梭</span></span></span><span class="num" style="font-size:12px;color:var(--color-ink-soft)">${n} 份</span></span>`;
    return `<div style="width:168px"><div style="height:218px">${cov}</div><div class="num" style="margin-top:14px;font-size:16px;line-height:24px;font-weight:700">${y} 年</div><div style="font-size:12px;line-height:18px;color:var(--color-ink-soft);white-space:nowrap">${sub}</div><div style="margin-top:6px;height:36px">${act}</div></div>`;
  };
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="702"></div>
<div class="pm-sheet" data-hand="sheet" data-seed="703" style="position:absolute;left:60px;top:40px;width:1160px;height:720px">
<div style="display:flex;align-items:center;gap:12px">${mark('atlas', 44)}<div><h1 class="pm-sheet-title">Atlas</h1><p class="pm-sheet-sub">柚子写过的每一年 · 2 年 3 份</p></div><span style="margin-left:auto;display:flex;gap:10px"><button type="button" class="pm-btn pm-btn--plain" data-hand="button" data-fill="card" data-seed="606">样式</button><button type="button" class="pm-btn" data-hand="button" data-seed="604">${icon('play', 18)} 立即运行（写到今天）</button></span></div>
<div class="pm-rule" data-hand="rule" data-seed="605" style="height:8px;margin:18px 0 22px"></div>
<div style="display:flex;gap:34px;align-items:flex-start;padding-left:20px">${year(2026, '截至 11 月 10 日 · 11 幕', 0, { until: '2026-11-10' })}${year(2025, '全年 · 9 幕', 1, { n: 2 })}${year(2024, '有 212 条记录', 2, { none: '还没写' })}
<div class="pm-card" data-hand="card" data-seed="640" style="width:388px;margin-left:16px">
<div class="pm-card-title">样式<span class="pm-card-meta">装着的每一版设计</span></div>
<div style="display:flex;gap:18px;align-items:flex-start;margin-top:10px">${paper(cover({ year: 2026 }), 1)}<div style="font-size:13px;line-height:21px"><div style="font-size:15px;font-weight:700">${META.name} ${META.version}</div><div style="color:var(--color-ink-soft)">2026-11-11 定稿 · 新做的用这一版</div><div style="margin-top:6px">3 份是照它做的（1.0.0、1.0.1 时做的也算：小修以后一律照最新的画）</div></div></div></div>
</div>
<div class="pm-note" data-hand="note" data-seed="620" data-tilt="-1.5" data-tapes="1" style="position:absolute;left:56px;bottom:40px;width:470px"><div style="font-size:15px;line-height:24px;font-weight:700">封面是设计自己画的</div><div style="font-size:14px;line-height:22px">每一版定稿画自己的封面：${META.name} 是小报的头版缩小——报头、年份、柚黄的一笔、纸星星和柚子，角上印着「${META.name} ${META.version}」；今年没过完盖红章「截至某日」。点封面翻开最新的一份，时间穿梭进那一年做过的每一份。</div></div>
<div class="pm-note" data-hand="note" data-seed="621" data-tilt="1.2" data-tapes="1" style="position:absolute;left:570px;bottom:48px;width:470px"><div style="font-size:15px;line-height:24px;font-weight:700">哪一版算定稿</div><div style="font-size:14px;line-height:22px">只改最后一位（1.0.1 → 1.0.2）是小修：新的一版替掉旧的，旧的那几份也改照新的画。改了前两位（1.0.3 → 1.1.0、2.0.0）是新的定稿：两版都留着，各画各的。</div></div>
</div>`;
}

// ---------- Desk：桌上的两样和节拍表 ----------
function deskBoard() {
  const beats = [['封面', 3, '书合着，停三拍再翻开'], ['目录 · 序章', 10, '星星一个月一个月亮起来；流星划过；金星一颗颗连成星座'], ['留下的日子 · 书影相遇', 11, '十字绣一行行绣出来；书一本本上架，票根贴上'], ['几个具体时刻 · 去年的回声', 10, '卡片沿着虚线一张张贴上；去年的纸条、今年的纸条，数字滚出来'], ['创作 · 求职这一年', 9, '小画、一排笔触；小石子一块块跳过去'], ['身体和习惯 · 和柚子聊的事', 10, '打卡表一行行贴满；泡泡一个个弹出来，柚子回一句'], ['钱 · 终章', '停住', '小票打出来；来信不自动往下走，留给读信']];
  const moves = [['原记录 · 打开', '0.76 秒', '纸卷落下来往下滚，滚过的地方纸条露出来'], ['原记录 · 合上', '0.56 秒', '纸卷从底下往上卷，卷到顶一甩收走'], ['收进抽屉', '1.76 秒', '翻到一半的先合上；抽屉拉出来，小报落进去，推回去']]
    .map(([name, t, what], i) => `<div style="display:grid;grid-template-columns:220px 60px 1fr;align-items:baseline;min-height:30px;font-size:14px;line-height:22px;${i ? 'border-top:1.5px dashed var(--color-line);' : ''}padding:4px 0"><span style="font-weight:700">${name}</span><span class="num">${t}</span><span style="color:var(--color-ink-soft)">${what}</span></div>`).join('');
  const rows = beats.map(([name, n, what], i) => `<div style="display:grid;grid-template-columns:220px 60px 1fr;align-items:baseline;min-height:34px;font-size:14px;line-height:22px;${i ? 'border-top:1.5px dashed var(--color-line);' : ''}padding:6px 0"><span style="font-weight:700">${name}</span><span class="num">${n}${typeof n === 'number' ? ' 拍' : ''}</span><span style="color:var(--color-ink-soft)">${what}</span></div>`).join('');
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="704"></div>
<div style="position:absolute;left:60px;top:44px;font-size:22px;line-height:30px;font-weight:700">桌上的两样</div>
<div style="position:absolute;left:60px;top:78px;width:400px;font-size:13px;line-height:20px;color:var(--color-ink-soft)">新年第一周（1 月 1～7 日）多一个信封；往年的今天有记录时多一张「那年今日」</div>
<div style="position:absolute;left:70px;top:170px">${K.envelope(2026).replace(' data-act="open"', '')}</div>
<div class="pm-note" data-hand="note" data-seed="630" data-tilt="2" data-tapes="1" style="position:absolute;left:92px;top:440px;width:300px">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">${mark('atlas', 26)}<span style="font-size:15px;font-weight:700">那年今日</span><span class="num" style="margin-left:auto;font-size:12px;opacity:.7">2025 年 11 月 10 日</span></div>
<div style="font-size:15px;line-height:25px">「第一次把柚子皮晒干了泡茶，屋里香了一下午。」</div>
<div style="margin-top:8px;font-size:12px;line-height:18px;opacity:.7">念念不忘 · 一年前的今天 · 点了打开那条</div></div>
<div class="pm-card" data-hand="card" data-seed="640" style="position:absolute;left:500px;top:44px;width:720px">
<div class="pm-card-title">节拍表<span class="pm-card-meta">一拍 0.8 秒（75 BPM）· 翻一页是一拍</span></div>
${rows}
<div style="margin-top:12px;font-size:13px;line-height:21px;color:var(--color-ink-soft)">没数据的幕整页不出现，后面的往前补；幕数是单数时多一页凑成双数。碰一下小报就停，再点「自动翻」接着走。减弱动态效果时自动翻默认关，页直接换。今年不做音乐（站主 2026-11-10）。</div></div>
<div class="pm-card" data-hand="card" data-seed="642" style="position:absolute;left:500px;top:470px;width:720px">
<div class="pm-card-title">弹出、收起的动静<span class="pm-card-meta">减弱动态效果时直接出现、消失</span></div>
${moves}</div>`;
}

// ---------- 画板 ----------
function board(file, title, w, h, inner, kind) {
  const main = kind === 'main';
  const props = {
    palette: { editor: 'enum', options: PALETTES, default: PALETTES[0], section: '配色' },
    dark: { editor: 'boolean', default: false, section: '配色' },
    reduce: { editor: 'boolean', default: false, section: '动效', label: '减弱动态效果' },
    ...(main ? {
      partial: { editor: 'boolean', default: false, section: '这一年', label: '今年没过完（截至今天）' },
      other: { editor: 'boolean', default: false, section: '这一年', label: '换一年聊的话题（通用的泡泡）' },
      noJobs: { editor: 'boolean', default: false, section: '这一年', label: '这一年没求职' },
      noDrawing: { editor: 'boolean', default: false, section: '这一年', label: '这一年没画画' },
      noMoney: { editor: 'boolean', default: false, section: '这一年', label: '钱来钱往藏起来了' },
      noEcho: { editor: 'boolean', default: false, section: '这一年', label: '去年什么都没记' },
    } : {}),
    $preview: { width: w, height: h },
  };
  // 走一遍：小报照 Tweaks 选的那一年挂在 .zhost 里；Tweaks 一变（或者运行时把它冲掉了）就重挂
  const script = main ? `${DESIGN_JS}
${SAMPLE_JS}
class Component extends DCLogic {
  renderVals() {
    const p = this.props;
    return { palette: p.palette ?? 'blue', theme: p.dark ? 'dark' : 'light', motion: p.reduce ? 'reduce' : 'full' };
  }
  remount() {
    const p = this.props, host = document.querySelector('.zhost');
    const want = JSON.stringify([!!p.partial, !!p.other, !!p.noJobs, !!p.noDrawing, !!p.noMoney, !!p.noEcho]);
    const look = { palette: p.palette ?? 'blue', theme: p.dark ? 'dark' : 'light', reduce: !!p.reduce };
    if (this.atlas && this.want === want && host.contains(this.atlas.root)) return this.atlas.set(look);
    if (this.atlas) this.atlas.destroy();
    this.want = want;
    const skip = [p.noJobs && 'jobs', p.noDrawing && 'drawing', p.noMoney && 'money', p.noEcho && 'echo'].filter(Boolean);
    this.atlas = design.mount(host, sampleYear({ partial: !!p.partial, other: !!p.other, skip }), { ...look, paint: (el) => Pomelo.paint(el) });
  }
  componentDidMount() { this.stop = Pomelo.paintLive(document.body); this.remount(); }
  componentDidUpdate() { Pomelo.paint(document.body); this.remount(); }
  componentWillUnmount() { this.stop && this.stop(); this.atlas && this.atlas.destroy(); }
}` : `class Component extends DCLogic {
  renderVals() {
    const p = this.props;
    return { palette: p.palette ?? 'blue', theme: p.dark ? 'dark' : 'light', motion: p.reduce ? 'reduce' : 'full' };
  }
  componentDidMount() { this.stop = Pomelo.paintLive(document.body); }
  componentDidUpdate() { Pomelo.paint(document.body); }
  componentWillUnmount() { this.stop && this.stop(); }
}`;
  if (/<\/script/i.test(script)) throw new Error('画板的脚本里不能有 </script');
  const html = dsBoard({
    title, css: CSS, props, script,
    body: `<div class="pm root board" data-kind="${kind}" data-palette="{{palette}}" data-theme="{{theme}}" data-motion="{{motion}}" style="width:${w}px;height:${h}px">
${inner}
</div>`,
  });
  writeFileSync(path.join(PROJECT, file), html);
  console.log(file, (html.length / 1024).toFixed(0) + ' KB');
  return { file, title, w, h };
}

// 行数跟着页数走（1.1.0 起有玩物有志和自建模块，样例是 19 页）
const ROWS = Math.ceil((flat(prepare(sampleYear()), K).match(/class="cell"/g) || []).length / 5);
const GW = 40 * 2 + 5 * PW + 4 * 30, GH = 40 * 2 + ROWS * (PH + 30) + (ROWS - 1) * 44;
const boards = [
  board('Atlas-Main.dc.html', `走一遍（${META.name} ${META.version}）`, 1280, 800, mainBoard(), 'main'),
  board('Atlas-Pages.dc.html', '全部的页摊开看', GW, GH, pagesBoard(), 'pages'),
  board('Atlas-Bubbles.dc.html', '和柚子聊的事 · 通用 6 个、专属 12 个泡泡', 1640, 1010, bubblesBoard(), 'bubbles'),
  board('Atlas-Module.dc.html', `Atlas 模块页 · 一年一张封面（${META.name} ${META.version} 画的）`, 1280, 800, moduleBoard(), 'module'),
  board('Atlas-Desk.dc.html', '桌上的两样 · 节拍表', 1280, 800, deskBoard(), 'desk'),
];

// ---------- 这一页 ----------
const at = [[0, 0], [0, 940], [2700, 940], [1400, 0], [2800, 0]];
writePage({
  id: 'atlas',
  name: 'R5：Atlas 年度小报',
  prefix: 'Atlas-',
  boards: boards.map((b, i) => ({ file: b.file, x: at[i][0], y: at[i][1], w: b.w, h: b.h, title: b.title, is_interactive: i === 0, radius: 12 })),
  notes: {
    how: { x: 4200, y: 0, w: 560, fill: 'orange', text: `怎么看这一页（${META.name} ${META.version}，第一轮定稿）\n\n· 「走一遍」点 Play：点信封拆开，小报跟着节拍自己翻，碰一下就停；点星星、纸条、卡片弹出原记录；下面一条是上一页、下一页、自动翻、目录、收进抽屉。\n· 右上角的 Tweaks：换配色和明暗、减弱动态效果；「这一年」里能关掉几幕（没数据的幕不出现）、换成「今年没过完」、换一年聊的话题（看通用的泡泡）。\n· 「全部的页摊开看」是同一份页；「泡泡」是聊天页能用的全部 18 个。\n\n数据全是编的。设计的源在 schemes/pomelo/atlas/tabloid/，冻结的快照在 schemes/pomelo/atlas/releases/。` },
  },
});
console.log(`pomelo-explore/atlas：${boards.length} 张画板`);
export { SCENE_NAMES };
