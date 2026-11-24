// 第 4 步 · 第一轮的画板：只引挂到画布上的 Design System（ds/peck/tokens.css、components/bundle.css），没有自己的控件样式，
// 画板里的 CSS 只管排版。S4-Kit 和第 3 步的控件板一格一格对（compare.mjs 出 compare.json），S4-Main 拿它搭一屏，S4-Icon 是图标，S4-Report 是结果。
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as m from './markup.mjs';
import { C } from '../s1/common.mjs';
import { FLIP, A } from '../s1c/kit.mjs';
import { appIcon, s3Icon, oldSmall, ICNS, J2, B28, B14, menuSvg, oldMenuSvg } from './icon.mjs';
import { pix } from '../s1b/icon.mjs';
import { GLYPHS } from './css.mjs';
import { report, notes as reportNotes } from './docs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GF = 'https://fonts.googleapis.com/css2?family=Doto:wght@900&family=IBM+Plex+Sans:wght@400;600&display=swap';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/'/g, '&#39;');
const DEF = FLIP ? '浅色' : '深色';

/** 一张用 Design System 的画板：support.js 后面引 ds/peck 的两份样式；Google Fonts 放进 helmet。 */
export function shell({ title, css, body, w, h, props = {}, vals = '' }) {
  const dp = esc(JSON.stringify({ theme: { editor: 'enum', options: ['深色', '浅色'], default: DEF, section: '看' }, ...props, $preview: { width: w, height: h } }));
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="ds/peck/tokens.css">
<link rel="stylesheet" href="ds/peck/components/bundle.css">
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link rel="stylesheet" href="${GF.replace(/&/g, '&amp;')}">
<style>
body{margin:0}
${DOC}
${css.trim()}
</style>
</helmet>
${body.trim()}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${dp}'>
class Component extends DCLogic {
renderVals() {
  const theme = (this.props.theme ?? '${DEF}') === '浅色' ? 'light' : 'dark';
  ${vals}
  return { theme, ${vals ? '...v' : ''} };
}
}
</script>
</body>
</html>
`;
}
// 说明页的排版（标题、说明文字、规则号）：只用 Design System 的变量
const DOC = `.doc{font-family:var(--font-body);color:var(--color-text)}
.ft{display:flex;align-items:baseline;gap:18px}
.ft h1{margin:0;font-size:22px;font-weight:600;white-space:nowrap}
.ft p{margin:0;font-size:13px;color:var(--color-text-2)}
.idt{display:inline-flex;align-items:center;height:18px;padding:0 5px;font-family:var(--font-dots);font-weight:900;font-size:12px;letter-spacing:.06em;clip-path:var(--pk-notch);background:var(--color-raised);color:var(--color-text-2)}`;

// ---------- S4-Kit：控件全套 14 种 × 6 个状态，和第 3 步的控件板同一个排法 ----------
const ST = [['d', 'DEFAULT', '平时'], ['h', 'HOVER', '边亮成青线；青块、琥珀、红底亮一档'], ['f', 'FOCUS', '键盘走到：里面一圈 1 像素青点线'], ['p', 'PRESS', '往下沉 1 像素，发光收起'], ['o', 'ON', '选中、开着、已填'], ['x', 'OFF', '不能用：提示色字、内凹底、没有发光']];
const K = { d: '', h: 'is-hover', f: 'is-focus', p: 'is-press', o: '', x: '' };
const NA = null;
// [名字, 规则号, 组件, (state) → html]
export const ROWS = [
  ['主按钮', ['K1'], 'Button', (s) => (s === 'o' ? NA : m.btn('SEND', { v: 'primary', icEnd: 'send', cls: K[s], off: s === 'x' }))],
  ['按钮', ['K1'], 'Button', (s) => (s === 'o' ? NA : m.btn('CANCEL', { cls: K[s], off: s === 'x' }))],
  ['小按钮', ['K9'], 'Button', (s) => (s === 'o' ? NA : m.btn('COPY', { v: 'ghost', sm: true, cls: K[s], off: s === 'x' }))],
  ['危险按钮', ['K2'], 'Button', (s) => (s === 'o' ? NA : m.btn('UNDO TASK', { v: 'danger', ic: 'undo', cls: K[s], off: s === 'x' }))],
  ['真要删的那一下', ['K2'], 'Button', (s) => (s === 'o' ? NA : m.btn('UNDO 6 FILES', { v: 'fill', cls: K[s], off: s === 'x' }))],
  ['琥珀按钮', ['R3'], 'Button', (s) => (s === 'o' ? NA : m.btn('BACK', { v: 'warn', cls: K[s], off: s === 'x' }))],
  ['选项片', ['K3'], 'Chip', (s) => m.chip('TASK', { ic: 'plus', on: s === 'o', cls: K[s], off: s === 'x' })],
  ['分段', ['K3', 'I8'], 'Segmented', (s) => m.seg([['PLAN', s === 'o' ? '' : 'is-on'], ['EDIT', s === 'o' ? 'is-on' : K[s], s === 'x'], 'AUTO'], { on: -1 })],
  ['开关', ['K7'], 'Switch', (s) => m.sw('完成时通知', { on: s === 'o', cls: K[s], off: s === 'x' })],
  ['单选', ['I3'], 'Choice', (s) => m.opt('一起升到 4.1', { on: s === 'o', cls: K[s], off: s === 'x' })],
  ['多选', ['I2'], 'Choice', (s) => m.opt('删 2 个旧文件', { kind: 'check', on: s === 'o', cls: K[s], off: s === 'x' })],
  ['输入框', ['K4', 'I7'], 'Field', (s) => (s === 'p' ? NA : s === 'o' ? m.field({ value: 'sk-••••••••3f2a' }) : s === 'x' ? m.field({ ph: '这个任务跑完再填', off: true }) : m.field({ ph: '粘贴 DeepSeek 的 Key', caret: s === 'f', cls: K[s] }))],
  ['菜单项', ['K10'], 'Menu', (s) => `<div class="pk-menu">${m.menuItem('muse', 'MUSE', '订阅额度 · 只读', { on: s === 'o', cls: K[s], off: s === 'x' })}</div>`],
  ['列表行', ['R6'], 'FileRow', (s) => (s === 'x' ? NA : `<div class="pk-tree">${m.row('Composer.tsx', { add: 9, del: 21, on: s === 'o', cls: K[s] })}</div>`)],
];
const KIT_CSS = `
.s4k{width:1760px;height:1300px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:16px}
.mx{display:grid;grid-template-columns:196px repeat(6,minmax(0,1fr));column-gap:14px}
.mx .hd{display:flex;flex-direction:column;gap:2px;padding:0 0 10px;border-bottom:1px solid var(--color-line-strong)}
.mx .hd b{font-family:var(--font-dots);font-weight:900;font-size:14px;letter-spacing:.1em;color:var(--color-cyan-text)}
.mx .hd span{font-size:12px;line-height:1.4;color:var(--color-text-3)}
.mx .nm3{display:flex;flex-direction:column;justify-content:center;gap:3px;padding:9px 0;border-bottom:1px dotted var(--color-line-strong)}
.mx .nm3 b{font-size:13px;font-weight:600}
.mx .nm3 span{display:flex;gap:4px;align-items:center}
.mx .nm3 code{font-family:var(--font-code);font-size:var(--text-code);color:var(--color-text-3);margin-left:4px}
.mx .cell{display:flex;align-items:center;min-height:56px;padding:9px 0;border-bottom:1px dotted var(--color-line-strong);min-width:0}
.mx .cell.na{font-family:var(--font-dots);font-weight:900;font-size:14px;color:var(--color-line-strong)}
.mx .pk-seg button{padding:0 10px}
.mx .pk-switch{font-size:12.5px}
.mx .pk-opt{padding:5px 10px}
.mx .pk-menu{width:100%;padding:3px}
.mx .pk-tree{width:100%}
.mx .pk-field{width:100%;height:34px}
.bt{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.bt>.pk-mod{display:flex;flex-direction:column;gap:9px;padding:12px 16px 14px;min-width:0}
.bt .pk-mod-head{margin-bottom:2px}
.bt .rw{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bt .rw>span{font-size:12px;color:var(--color-text-3)}
.bt .lb2{width:60px;font-size:12px;color:var(--color-text-3);flex:none}
.bt .pk-blocks{flex:1}
.bt .pk-blocks i{height:12px}
.bt .pk-toast{align-self:flex-start}
.mini{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mini .pk-mod{padding:8px 10px}
.mini .pk-mod b{display:block;font-family:var(--font-dots);font-weight:900;font-size:12px;letter-spacing:.08em;color:var(--color-text-2)}
.mini .pk-mod span{font-size:12px;color:var(--color-text-3)}
.wt{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--color-text-2)}
.cinx{display:flex;align-items:center;font-family:var(--font-code);font-size:var(--text-code);color:var(--color-text)}
`;
function kitBoard() {
  const head = `<div class="hd"><b>CONTROL</b><span>控件 · 规则 · 组件</span></div>` + ST.map(([, k, t]) => `<div class="hd"><b>${k}</b><span>${t}</span></div>`).join('');
  const rows = ROWS.map(([nm, r, comp, f]) => `<div class="nm3"><b>${nm}</b><span>${r.map((i) => `<em class="idt">${i}</em>`).join('')}<code>${comp}</code></span></div>` + ST.map(([s]) => { const h = f(s); return h === NA ? '<div class="cell na">—</div>' : `<div class="cell">${h}</div>`; }).join('')).join('');
  const bt = `<div class="bt">
    <div class="pk-mod">${m.modHead('TAGS', '标签：一级台阶角')}
      <p class="rw">${m.tag('NEW', 'new')}${m.tag('DEL', 'del')}${m.tag('DEFAULT', 'rec')}${m.tag('WAIT', 'wait')}${m.tag('HIGH', 'high')}${m.tag('2/3')}</p>
      <p class="rw"><span>新文件 · 删了 · 推荐 · 等你 · 高危 · 计数</span></p>
      <p class="pk-mod-head" style="margin:6px 0 0"><span class="pk-mod-label">TABS</span><span class="pk-mod-note">页签上的提示（R2）</span></p>
      ${m.tabs([['CHANGES', '<em>5</em>'], ['ONE SHOT'], ['FILES'], ['TERM', m.icon('lock', 12)]], 1)}</div>
    <div class="pk-mod">${m.modHead('PROGRESS', '方块进度（K5）')}
      <p class="rw"><span class="lb2">还没开始</span>${m.blocks(20, 0, { head: false })}</p><p class="rw"><span class="lb2">在跑</span>${m.blocks(20, 7)}</p>
      <p class="rw"><span class="lb2">等你</span>${m.blocks(20, 9, { wait: true, still: true })}</p><p class="rw"><span class="lb2">做完</span>${m.blocks(20, 20, { still: true })}</p></div>
    <div class="pk-mod">${m.modHead('WAIT', '等待和光标（S2、K4）')}
      <p class="wt">${m.twinkle()}<span>Muse 在读 units.ts…</span></p>
      <p class="cinx"><span class="pk-prompt">›</span><span>把设置里三个对话框合成一个面板</span><i class="pk-caret"></i></p>
      <p class="wt">${m.dotcheck()}<span>做完了 · 6 个文件</span></p>
      ${m.toast('同一个项目一次跑一个任务')}</div>
    <div class="pk-mod">${m.modHead('EDGES', '模块的边（M3）')}
      <div class="mini"><div class="pk-mod"><b>[ NORMAL ]</b><span>平时</span></div><div class="pk-mod pk-mod--run"><b>[ RUN ]</b><span>在跑</span></div>
        <div class="pk-mod pk-mod--wait"><b>[ WAIT ]</b><span>等你</span></div><div class="pk-mod pk-mod--err"><b>[ ERROR ]</b><span>出错</span></div></div>
      <p class="rw"><span>同一时刻只有一块模块描彩边。</span></p></div>
  </div>`;
  const body = `<div class="pk pk-dots doc s4k" data-theme="{{theme}}"><div class="ft"><h1>挂上画布 · 控件全套</h1><p>这张只引挂到画布上的 Design System（ds/peck/ 的 tokens.css 和 bundle.css），没有自己的控件样式。和第 3 步的控件板逐格对过，结果在第一轮结果页。</p></div>
    <div class="mx">${head}${rows}</div>${bt}</div>`;
  return { file: 'S4-Kit.dc.html', w: 1760, h: 1300, title: '挂上画布 · 控件全套（只用 Design System）', html: shell({ title: '挂上画布 · 控件全套', css: KIT_CSS, body, w: 1760, h: 1300 }) };
}

// ---------- S4-Main：拿 Design System 搭一屏（在跑 / 停下来问你） ----------
const MAIN_CSS = `
.s4m{width:1280px;height:800px;padding:22px 30px 28px;display:flex;flex-direction:column;gap:16px}
.top{display:flex;align-items:center;gap:14px;height:44px}
.brand{display:flex;align-items:center;gap:8px}
.brand b{font-family:var(--font-dots);font-weight:900;font-size:30px;letter-spacing:.06em;line-height:1}
.brand .mk{width:12px;height:24px;background:var(--color-cyan-block);box-shadow:var(--shadow-glow-text);animation:pk-blink 1s steps(1) infinite}
.top .sp{flex:1}
.grid{display:grid;grid-template-columns:var(--width-left) minmax(0,1fr) var(--width-right);gap:var(--width-gap);height:690px}
.col{display:flex;flex-direction:column;gap:14px;min-height:0;min-width:0}
.newt{margin-bottom:10px}
.newt .pk-btn{width:100%}
.pj{display:flex;flex-direction:column;gap:2px}
.pjh{display:flex;align-items:center;gap:8px;height:30px;padding:0 8px;clip-path:var(--pk-clip2)}
.pjh.on{background:var(--color-cyan-soft)}
.pjh .pk-i{color:var(--color-text-2)}
.pjh.on .pk-i{color:var(--color-cyan-text)}
.pjh span{margin-left:auto;font-size:12px;color:var(--color-text-3)}
.tsk{display:flex;flex-direction:column;gap:1px;margin:2px 0 6px 24px}
.tsk p{display:flex;align-items:center;gap:8px;height:22px;font-size:12px;color:var(--color-text-2);white-space:nowrap;overflow:hidden}
.tsk p.on{color:var(--color-text)}
.tsk p .pk-i{color:var(--color-ok)}
.log li{display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:8px;align-items:center;padding:4px 0;border-top:1px dotted var(--color-line-strong);font-size:12px;color:var(--color-text-2)}
.log li:first-child{border-top:0}
.log li .pk-i{color:var(--color-cyan-text)}
.log li em{font-family:var(--font-dots);font-weight:900;font-size:12px;color:var(--color-text-3)}
.task{position:relative;overflow:hidden;flex:1;display:flex;flex-direction:column;min-height:0}
.task .nm{margin:0 0 10px}
.st{display:flex;align-items:center;gap:14px}
.st .pk-readout{margin-left:auto;font-size:40px}
.task .pk-blocks{margin:14px 0 12px}
.out{margin-top:10px;padding:10px 14px;font-family:var(--font-code);font-size:var(--text-code);line-height:18px;color:var(--color-text-2)}
.out p:first-child{color:var(--color-text)}
.out p.e{color:var(--color-bad)}
.comp{display:flex;flex-direction:column;gap:10px;padding:14px 16px 12px}
.crow{display:flex;align-items:center;gap:8px}
.crow .sp{flex:1}
.chg{flex:1;display:flex;flex-direction:column;min-height:0}
.nums{display:flex;align-items:baseline;gap:12px;margin:2px 0 10px}
.nums span{font-size:12px;color:var(--color-text-3)}
.snap{display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:10px;border-top:1px dotted var(--color-line-strong);font-size:12px;color:var(--color-text-2)}
.snap .pk-i{color:var(--color-cyan-text)}
.chg .foot{margin-top:auto;display:flex;gap:8px}
.chg .foot .pk-btn{flex:1}
`;
function mainBoard() {
  const projects = C.projects.map((p, i) => `<div class="pj"><p class="pjh${i === 0 ? ' on' : ''}">${m.icon('folder')}<b class="t-name">${p.name}</b><span>${p.when}</span></p>${i === 0 ? `<div class="tsk"><p class="on">${m.twinkle()}<span>${C.task}</span></p><p>${m.icon('check', 12)}<span>首页的天气卡片加上体感温度</span></p><p>${m.icon('check', 12)}<span>units.ts 换成 Intl 的写法</span></p></div>` : ''}</div>`).join('');
  const left = `<section class="col"><div class="pk-mod">${m.modHead('PROJECTS', '', '3')}
      <div class="newt">${m.btn('NEW TASK', { ic: 'plus' })}</div><div>${projects}</div></div>
    <div class="pk-mod" style="flex:1">${m.modHead('LOG', '这个任务')}<ul class="log">
      <li>${m.icon('clock', 12)}<span>存了快照 · 改之前的样子</span><em>11:02</em></li>
      <li>${m.icon('shield', 12)}<span>批了：删 2 个旧文件、跑 pnpm check</span><em>11:02</em></li>
      <li>${m.icon('ask', 12)}<span>问了：设置合成一个面板还是两个</span><em>11:04</em></li></ul></div></section>`;
  const steps = (wait) => `<ol>${m.step('ok', C.steps[0].t, { time: C.steps[0].time, desc: C.steps[0].d })}${m.step('ok', C.steps[1].t, { time: C.steps[1].time, desc: C.steps[1].d })}${wait ? m.step('wait', 'Grok 问你：Tailwind 要不要升', { time: 'WAIT', desc: '跑 pnpm check 前停下来' }) : m.step('run', C.steps[2].t, { time: '0:24', desc: C.steps[2].d })}${m.step('todo', C.steps[3].t)}</ol>`;
  const task = (wait) => `<section class="pk-mod ${wait ? 'pk-mod--wait' : 'pk-mod--run'} task">${wait ? '' : '<span class="pk-scan pk-scan--loop"></span>'}
      ${m.modHead('TASK', `${wait ? m.dot('grok') + ' GROK 停下来问你' : m.dot('grok') + ' GROK · EDIT'}`, wait ? '3/4' : '3/4')}
      <p class="t-title nm">${C.task}</p>
      <div class="st"><span class="pk-state${wait ? ' pk-state--wait' : ''}">${wait ? 'WAIT' : 'RUN'}</span><span class="pk-who" style="font-size:12px;color:var(--color-text-3)">读了 12 个文件 · 改了 4 个</span><b class="pk-readout${wait ? ' pk-readout--wait' : ''}">02:14</b></div>
      ${wait ? m.blocks(28, 17, { wait: true, still: true }) : m.blocks(28, 17)}
      ${steps(wait)}
      <div class="pk-mod pk-mod--sunk out">${C.out.map((l, i) => `<p class="${i === 1 ? 'e' : ''}">${l}</p>`).join('')}</div></section>`;
  const comp = `<section class="pk-mod comp">${m.input('', { ph: '跑的时候还能补一句…', caret: false })}<div class="crow">${m.chip('GROK', { sm: true, ic: 'check', on: true })}${m.seg(['PLAN', 'EDIT', 'AUTO'], { on: 1, sm: true })}<span class="sp"></span>${m.btn('STOP', { ic: 'stop' })}</div></section>`;
  const ask = `<section class="pk-mod pk-mod--wait pk-ask">${m.edge()}<p class="pk-mod-head"><span class="pk-mod-label">ASK</span><span class="pk-who">${m.dot('grok')}GROK 停下来问你</span><span class="pk-mod-count" style="margin-left:auto">1/1</span></p><p class="pk-ask-q">${C.ask.q}</p><p class="pk-ask-d">${C.ask.d}</p><div class="pk-ask-opts">${m.opt('一起升到 4.1', { on: true, desc: '顺手改 6 个文件的类名', key: '1', tag: ' ' + m.tag('DEFAULT', 'rec') })}${m.opt('先不升', { desc: '这次任务照样能做完', key: '2' })}</div><div class="pk-ask-foot">${m.btn('LATER', { v: 'ghost' })}<span class="pk-sp"></span>${m.btn('SUBMIT', { v: 'primary' })}</div></section>`;
  const center = `<section class="col"><sc-if value="{{run}}" hint-placeholder-val="{{true}}">${task(false)}${comp}</sc-if><sc-if value="{{wait}}" hint-placeholder-val="{{false}}">${task(true)}${ask}</sc-if></section>`;
  const files = C.files.map((f) => m.row(f.p.split('/').pop(), { k: f.tag === '删' ? 'del' : 'file', tag: f.tag === '新' ? 'NEW' : f.tag === '删' ? 'DEL' : '', add: f.a || null, del: f.d || null, on: f.tag === '新' })).join('');
  const right = `<section class="col">${m.tabs([['CHANGES', `<em>${C.files.length}</em>`], ['ONE SHOT'], ['FILES'], ['TERM', m.icon('lock', 12)]], 0)}
    <div class="pk-mod chg">${m.modHead('CHANGES', '这个任务', C.files.length)}<div class="nums"><b class="pk-readout pk-readout--num pk-readout--done">+${C.add}</b><b class="pk-readout pk-readout--num" style="color:var(--color-bad);text-shadow:none">−${C.del}</b><span>行</span></div>
      <div class="pk-tree">${m.row('settings', { k: 'dir', ic: 'triD' })}${files}</div>
      <p class="snap">${m.icon('clock', 12)}<span>改之前的快照 · 11:02</span></p>
      <div class="foot">${m.btn('DIFF', { sm: true, ic: 'file' })}${m.btn('UNDO TASK', { v: 'danger', sm: true, ic: 'undo' })}</div></div></section>`;
  const body = `<div class="pk pk-dots doc s4m" data-theme="{{theme}}">
  <header class="top"><div class="brand"><b>PECK</b><i class="mk"></i></div>${m.chip('WEATHER-CLI', { ic: 'folder' })}${m.seg(['CLI', 'API'], { on: 0, sm: true })}<span class="sp"></span>${m.btn('', { v: 'ghost', square: true, ic: 'gear', aria: '设置' })}</header>
  <div class="grid">${left}${center}${right}</div></div>`;
  const props = { moment: { editor: 'enum', options: ['在跑', '停下来问你'], default: '在跑', section: '看' } };
  const vals = `const wait = (this.props.moment ?? '在跑') === '停下来问你'; const v = { run: !wait, wait };`;
  return { file: 'S4-Main.dc.html', w: 1280, h: 800, title: '拿 Design System 搭一屏 · 在跑 / 停下来问你（Tweaks 切）', html: shell({ title: '拿 Design System 搭一屏', css: MAIN_CSS, body, w: 1280, h: 800, props, vals }) };
}

// ---------- S4-Icon：图标的底板用第 1 步的比例 ----------
const ICON_CSS = `
.s4i{width:1280px;height:1000px;padding:26px 32px 28px;display:flex;flex-direction:column;gap:14px}
.ig{flex:1;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:14px;min-height:0}
.icl{display:flex;flex-direction:column;gap:14px;min-width:0}
.box{padding:12px 16px 14px}
.box .pk-mod-head{margin-bottom:10px}
.j2r{display:grid;grid-template-columns:224px minmax(0,1fr);gap:18px}
.j2r svg{display:block}
.spec li{display:grid;grid-template-columns:64px minmax(0,1fr);gap:8px;padding:4px 0;border-top:1px dotted var(--color-line-strong);font-size:12px;line-height:1.5;color:var(--color-text-2)}
.spec li:first-child{border-top:0}
.spec b{font-family:var(--font-dots);font-weight:900;font-size:12px;letter-spacing:.06em;color:var(--color-text)}
.sizes{display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap}
.sizes figure,.a3 figure{display:flex;flex-direction:column;align-items:center;gap:5px;margin:0}
.sizes figcaption,.a3 figcaption{font-family:var(--font-dots);font-weight:900;font-size:12px;color:var(--color-text-3)}
.sizes svg{display:block;flex:none}
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cmp figure{display:flex;align-items:center;gap:12px;margin:0;padding:8px;clip-path:var(--pk-clip2)}
.cmp figure.on{background:var(--color-cyan-soft)}
.cmp svg{flex:none;display:block}
.cmp figcaption{font-size:12px;line-height:1.5;color:var(--color-text-2)}
.cmp figcaption b{display:block;font-size:12.5px;color:var(--color-text)}
.icns{display:grid;grid-template-columns:1fr 1fr;column-gap:18px}
.icns li{display:grid;grid-template-columns:136px 34px 44px minmax(0,1fr);gap:6px;align-items:baseline;padding:3px 0;border-top:1px dotted var(--color-line-strong);font-size:12px;color:var(--color-text-3);white-space:nowrap}
.icns li:nth-child(-n+2){border-top:0}
.icns .c{font-family:var(--font-code);font-size:var(--text-code);color:var(--color-text)}
.icns .n{font-family:var(--font-dots);font-weight:900;font-size:12.5px;color:var(--color-text);text-align:right}
.smr{display:flex;align-items:flex-end;gap:16px;padding:4px 0}
.smr b{width:52px;font-size:12px;font-weight:600;align-self:center}
.smr figure,.kin figure{display:flex;flex-direction:column;align-items:center;gap:4px;margin:0}
.smr figcaption,.kin figcaption{font-family:var(--font-dots);font-weight:900;font-size:12px;color:var(--color-text-3)}
.smr svg,.kin svg{display:block}
.kin{display:flex;align-items:flex-end;gap:14px;margin-top:10px}
.kin figcaption{font-family:var(--font-body);font-weight:400}
.nt5{font-size:12px;line-height:1.55;color:var(--color-text-3);margin-top:8px}
.a3{display:flex;align-items:flex-end;gap:14px}
.a3 img{display:block}
.mbr{display:flex;align-items:center;gap:22px;height:30px;padding:0 14px}
.mbr.l{background:#E4E8F2;color:#000}
.mbr.d{background:#161C33;color:#FFF}
.mbr svg{display:block}
.mbr span{font-size:12px;opacity:.7;margin-left:auto}
`;
function iconBoard() {
  const sizes = [128, 64, 32, 16].map((n) => `<figure>${appIcon(n, 'sz' + n)}<figcaption>${n}</figcaption></figure>`).join('') +
    [[32, 16], [64, 32]].map(([n, base]) => `<figure>${appIcon(base, 'rt' + base).replace(`width="${base}" height="${base}"`, `width="${n}" height="${n}"`)}<figcaption>${base}@2X</figcaption></figure>`).join('');
  const spec = `<ul class="spec">
    <li><b>PLATE</b><span>底板占画面 7/8（87.5%），第 1 步的比例；圆角 22.5%，深海渐变 #16214A → #050816。</span></li>
    <li><b>BIRD</b><span>第 1 步的 J2，一个像素没动：32 格，占底板的 2/3。青 #00E5FF、冠羽 #A8F6FF，眼睛空着；64 以上加一圈光，128 以上底板下一点阴影。</span></li>
    <li><b>PIXEL</b><span>1024、512、256 用 J2，一格 28、14、7 像素；128、64、32 用照 J2 缩的 28 格鸟，一格 4、2、1；16 用 14 格的。每个尺寸都是整像素。</span></li></ul>`;
  const cmp = `<div class="cmp"><figure>${s3Icon(96, 'o96')}<figcaption><b>第 3 步提的</b>照 Apple 的格子：底板 81%，鸟在底板里大一点（81%）。</figcaption></figure>
    <figure class="on">${appIcon(96, 'n96')}<figcaption><b>你定的</b>第 1 步的比例：底板 87.5%，鸟占底板 2/3，四周更松。</figcaption></figure></div>`;
  const icns = ICNS.map(([n, px2, src, cell]) => `<li><span class="c">${n}</span><span class="n">${px2}</span><span class="n">${cell}</span><span>${src}</span></li>`).join('');
  const row = (lab, f) => `<div class="smr"><b>${lab}</b>${[64, 32, 16].map((n) => `<figure>${f(n)}<figcaption>${n}</figcaption></figure>`).join('')}</div>`;
  const small = `${row('第一版', (n) => oldSmall(n, 'os' + n))}${row('重画', (n) => appIcon(n, 'ns' + n))}`;
  // 三只鸟的格子：J2 32 格、B28 28 格（照 J2 缩）、B14 14 格，一格 3 像素（B14 6 像素）
  const raw = (rows, k, id) => `<svg viewBox="0 0 ${rows.length} ${rows.length}" width="${rows.length * k}" height="${rows.length * k}" shape-rendering="crispEdges"><rect width="${rows.length}" height="${rows.length}" fill="#0A0F24"></rect>${pix(rows, { c: '#00E5FF', l: '#A8F6FF' })}</svg>`;
  const kin = `<div class="kin">${[[J2, 3, 'J2 · 32 格'], [B28, 3, '28 格 · 照 J2 缩'], [B14, 6, '14 格']].map(([r, k, t]) => `<figure>${raw(r, k)}<figcaption>${t}</figcaption></figure>`).join('')}</div>`;
  const a3 = `<div class="a3">${[[128, 'A3 · 128'], [64, '64']].map(([n, t]) => `<figure><img src="${A.a3}" width="${n}" height="${n}" alt="A3"/><figcaption>${t}</figcaption></figure>`).join('')}<p class="nt5" style="margin:0 0 4px">A3 的底板本来就占 87%，和 J2 一样大，导出时不用再缩。</p></div>`;
  const bar = (cls) => `<div class="mbr ${cls}">${['idle', 'run', 'wait', 'count'].map((s) => menuSvg(s, 0)).join('')}<span>${cls === 'l' ? '浅色菜单栏' : '深色菜单栏'} · 1x</span></div>`;
  // 菜单栏的鸟放大 3 倍对照：第一版（16 格）和换上的（14 格）
  const zoomMenu = (svg) => svg.replace('width="18" height="18"', 'width="54" height="54"');
  const mcmp = `<div class="smr"><b>对照 · 3x</b><figure>${zoomMenu(oldMenuSvg('idle'))}<figcaption>第一版</figcaption></figure><figure>${zoomMenu(menuSvg('idle'))}<figcaption>换上的</figcaption></figure></div>`;
  const body = `<div class="pk pk-dots doc s4i" data-theme="{{theme}}"><div class="ft"><h1>图标 · 底板用第 1 步的比例</h1><p>底板占 7/8，每个尺寸一格都是整像素。小尺寸的鸟重画了：照 J2 缩下来，不再是胖脸。</p></div>
    <div class="ig"><div class="icl"><div class="pk-mod box">${m.modHead('APP ICON', 'J2 · 第 1 步的比例')}
        <div class="j2r">${appIcon(224, 'b224')}<div>${spec}</div></div><p class="pk-mod-head" style="margin:14px 0 8px"><span class="pk-mod-label">SIZES</span><span class="pk-mod-note">1:1（最后两个是 2 倍屏）</span></p><div class="sizes">${sizes}</div></div>
      <div class="pk-mod box">${m.modHead('PLATE', '你定的')}${cmp}</div>
      <div class="pk-mod box">${m.modHead('ICNS', '10 张 · 用哪份底稿 · 一格几像素')}<ul class="icns">${icns}</ul></div></div>
      <div class="icl"><div class="pk-mod pk-mod--run box">${m.modHead('SMALL', '小尺寸重画 · 1:1')}${small}<p class="nt5">第一版的小尺寸借的是第 1 步给菜单栏画的 16 格鸟：头占得太大、喙短、脖子粗。重画的照 J2 一格一格缩：冠羽往后掠、喙张开、脖子收成尖。</p>${kin}</div>
        <div class="pk-mod box">${m.modHead('A3', '现在的图标 · 设置里能换')}${a3}</div>
        <div class="pk-mod box">${m.modHead('MENU BAR', '换成 14 格的鸟 · 收尾')}<div style="display:flex;flex-direction:column;gap:8px">${bar('l')}${bar('d')}</div>${mcmp}<p class="nt5">和 16 像素 App 图标同一只鸟，一格 1pt，@1x、@2x 都是整像素；状态和鸟隔 3 格。</p></div></div></div></div>`;
  return { file: 'S4-Icon.dc.html', w: 1280, h: 1000, title: '图标 · 底板用第 1 步的比例，小尺寸重画', html: shell({ title: '图标 · 底板用第 1 步的比例', css: ICON_CSS, body, w: 1280, h: 1000 }) };
}

export function boards({ built, published }) {
  const cmpPath = path.join(HERE, 'compare.json');
  const cmp = existsSync(cmpPath) ? JSON.parse(readFileSync(cmpPath, 'utf8')) : null;
  const rep = report({ built, published, cmp, shell });
  const place = [[kitBoard(), 0, 0], [mainBoard(), 1840, 0], [rep, 3200, 0], [iconBoard(), 1840, 920]];
  return place.map(([b, x, y]) => ({ ...b, x, y }));
}
export { reportNotes as notes };
