// 第 3 步 · 方案：Peck 的定值都在这一份里（颜色明暗、对比度配对、字和尺寸、动效、图标规格）。
// 画板从这里取值；同一份写成方案文件 project/scheme/（tokens/*.json、DESIGN.md……），导入 visual-atelier 时就是 schemes/peck/。
// 颜色从第 2 步批准的小样（../s1c/kit.mjs 的深色 DK、浅色 LT + L2 深青）出发，只改过不了 APCA 的几处，改了什么记在 FROM。
import { lc } from './apca.mjs';

// ---------- 混色：半透明的角色先在模块面板上混成实色（APCA 和原生端都只认实色） ----------
const hx = (h) => [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16));
const toHex = (c) => '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
/** a 占 t、b 占 1 − t（和 CSS 把半透明的 a 叠在 b 上一样）。 */
export const mix = (a, t, b) => toHex(hx(a).map((v, i) => v * t + hx(b)[i] * (1 - t)));

const PANEL = { dark: '#0A0F24', light: '#FFFFFF' };
const CY = '#00E5FF';
const BAD_D = '#FE9AA4';
// 悬停：深色里青块、琥珀、红往白里走三成，浅色里往黑里走一成半
const up = (c) => mix(c, 0.7, '#FFFFFF');
const down = (c) => mix(c, 0.85, '#000000');

// ---------- 颜色角色：[id, 名字, 用在哪, 深色, 浅色] ----------
export const GROUPS = [
  { k: 'BASE', name: '底和线', roles: [
    ['page', '页面底', '整页的底，上面是 LED 点阵孔', '#050816', '#F2F4FC'],
    ['grid', '点阵孔', '页面底上 8 格一颗的孔（半透明，只当图案）', 'rgba(120,140,255,.085)', 'rgba(40,50,130,.10)'],
    ['panel', '模块面', '模块、卡片、菜单的面', PANEL.dark, PANEL.light],
    ['panel-2', '内凹', '输入框、代码块、预览的底', '#0F1630', '#F5F7FD'],
    ['raised', '抬起', '悬停的底、灰标签、计数小块', '#172040', '#E7EBF8'],
    ['line', '模块外框', '模块的外层（装饰，靠面和点阵分开，不查对比）', '#1E2850', '#DAE0F0'],
    ['line-strong', '控件边', '按钮、选项片、分段、开关的边；模块里的点线', '#43528B', '#B4BDDB'],
    ['block-off', '没亮的格', '进度块、点阵勾里没亮的格', '#141C3C', '#E1E6F5'],
  ] },
  { k: 'TEXT', name: '字', roles: [
    ['text', '正文', '名字、正文、代码', '#E8ECFF', '#0B1030'],
    ['text-2', '说明', '说明、次要的话、没选中的标签', '#BEC7F5', '#4E567A'],
    ['text-3', '提示', '提示小字、时间、占位、模块头右边的话', '#9FAADE', '#646C92'],
  ] },
  { k: 'CYAN', name: '青', roles: [
    ['cyan', '青块', '主按钮、选中的分段、开着的开关', CY, '#007A94'],
    ['cyan-hover', '青块悬停', '主按钮、开关在悬停时', up(CY), down('#007A94')],
    ['on-cyan', '青块上的字', '青块上的字和图标', '#02101A', '#FFFFFF'],
    ['cyan-text', '青字', '选中、链接、在发生；键盘焦点的点线', CY, '#007A94'],
    ['cyan-block', '青格', '进度块、光标、点阵', CY, '#0099B8'],
    ['cyan-line', '青线', '在跑的模块边；悬停时控件的边', mix(CY, 0.6, PANEL.dark), '#0099B8'],
    ['cyan-soft', '青底', '选中的行、带上的选项片', mix(CY, 0.1, PANEL.dark), '#E2F4F8'],
    ['cyan-scan', '扫描光', '扫描光带（半透明，叠在任何底上）', 'rgba(0,229,255,.22)', 'rgba(0,153,184,.24)'],
  ] },
  { k: 'STATE', name: '状态', roles: [
    ['ok', '完成', '完成、通过、新增', '#4ADE80', '#12804C'],
    ['ok-soft', '完成底', '通过的状态条', mix('#4ADE80', 0.1, PANEL.dark), '#E3F5EC'],
    ['warn', '等你', '等你批、等你答', '#FFB86B', '#A35E00'],
    ['warn-hover', '琥珀悬停', '琥珀按钮在悬停时', up('#FFB86B'), down('#A35E00')],
    ['warn-soft', '等你底', '等你的提示条', mix('#FFB86B', 0.1, PANEL.dark), '#FFF3E2'],
    ['warn-line', '等你的边', '等你的模块、卡片的边', mix('#FFB86B', 0.6, PANEL.dark), '#A35E00'],
    ['on-warn', '琥珀上的字', '琥珀按钮上的字', '#02101A', '#FFFFFF'],
    ['bad', '出错', '删除、出错、失败、危险', BAD_D, '#E11D48'],
    ['bad-hover', '红悬停', '红底按钮在悬停时', up(BAD_D), down('#E11D48')],
    ['bad-soft', '出错底', '失败的状态条', mix(BAD_D, 0.1, PANEL.dark), '#FFE9EE'],
    ['bad-line', '出错的边', '出错的模块、危险按钮的边', mix(BAD_D, 0.65, PANEL.dark), '#E11D48'],
    ['on-bad', '红底上的字', '真要删的那一下（红底按钮）上的字', '#050816', '#FFFFFF'],
  ] },
  { k: 'WHO', name: '身份', roles: [
    ['muse', 'Muse', 'Muse 的色点', '#A78BFA', '#6D4AE8'],
    ['grok', 'Grok', 'Grok 的色点', '#FFB86B', '#A35E00'],
    ['api', 'API', 'API 模型的色点', '#60A5FA', '#2563EB'],
  ] },
];
export const ROLES = Object.fromEntries(GROUPS.flatMap((g) => g.roles.map(([id, name, use, dark, light]) => [id, { id, name, use, dark, light, g: g.k }])));

// 第 3 步为过 APCA 改的（都是深色）；半透明的改成在模块面上混好的实色，样子不变，不算改
export const FROM = {
  'text-2': { dark: '#9AA3CF', why: '说明字 Lc 53，要 ≥ 70' },
  'text-3': { dark: '#7A84B6', why: '提示小字 Lc 37，要 ≥ 55' },
  bad: { dark: '#FB7185', why: '红字 Lc 50，要 ≥ 60' },
  'line-strong': { dark: '#2E3B72', why: '控件边 Lc 8，要 ≥ 15' },
  'warn-line': { dark: 'rgba(255,184,107,.55)', why: '琥珀边 Lc 29，要 ≥ 30（不透明度 .55 → .6）' },
  'bad-line': { dark: 'rgba(251,113,133,.6)', why: '红边跟着红字改，不透明度 .6 → .65' },
};
// 这一轮新加的角色
export const NEW = ['cyan-hover', 'warn-hover', 'bad-hover', 'on-bad'];

// ---------- 要过的对比度（APCA Lc 绝对值）。字比 Vermilion 的 75 / 60 严：Peck 的字只有 12–12.5 号 ----------
export const LEVELS = [
  [90, '名字和正文'], [75, '青块上的字'], [70, '说明'], [60, '青字、状态字、按钮上的字'], [55, '提示小字'],
  [45, '进度块、身份色点'], [30, '在跑、等你、出错的边'], [15, '控件的边'],
];
const P = (fg, bgs, min, use, kind = 'text') => [].concat(bgs).map((bg) => ({ fg, bg, min, use, kind }));
export const PAIRS = [
  ...P('text', ['page', 'panel', 'panel-2', 'raised', 'cyan-soft'], 90, '正文'),
  ...P('text-2', ['panel', 'panel-2', 'raised'], 70, '说明'),
  ...P('text-3', ['page', 'panel', 'panel-2'], 55, '提示小字'),
  ...P('cyan-text', ['page', 'panel', 'cyan-soft'], 60, '青字'),
  ...P('on-cyan', ['cyan', 'cyan-hover'], 75, '主按钮的字'),
  ...P('ok', ['panel', 'ok-soft'], 60, '完成的字'),
  ...P('warn', ['panel', 'warn-soft'], 60, '等你的字'),
  ...P('bad', ['panel', 'bad-soft'], 60, '出错的字'),
  ...P('on-warn', ['warn', 'warn-hover'], 60, '琥珀按钮的字'),
  ...P('on-bad', ['bad', 'bad-hover'], 60, '红底按钮的字'),
  ...P('page', ['ok', 'bad'], 60, 'NEW / DEL 标签的字'),
  ...P('cyan-block', 'panel', 45, '进度块', 'ui'),
  ...P('muse', 'panel', 45, '身份色点', 'ui'), ...P('grok', 'panel', 45, '身份色点', 'ui'), ...P('api', 'panel', 45, '身份色点', 'ui'),
  ...P('cyan-line', 'panel', 30, '在跑的边', 'ui'), ...P('warn-line', 'panel', 30, '等你的边', 'ui'), ...P('bad-line', 'panel', 30, '出错的边', 'ui'),
  ...P('line-strong', 'panel', 15, '控件的边', 'ui'),
];
const val = (id, mode) => ROLES[id][mode];
const oldVal = (id, mode) => {
  const f = FROM[id]?.[mode];
  if (!f) return val(id, mode);
  const m = f.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/);
  return m ? mix(toHex([+m[1], +m[2], +m[3]]), +m[4], PANEL[mode]) : f;
};
/** 每一对在深浅两种里的 Lc（新值），以及改之前的 Lc（只有改过的那几对有）。 */
export const CHECK = PAIRS.map((p) => {
  const r = { ...p };
  for (const mode of ['dark', 'light']) {
    r[mode] = lc(val(p.fg, mode), val(p.bg, mode));
    const o = lc(oldVal(p.fg, mode), oldVal(p.bg, mode));
    if (o !== r[mode]) r[mode + 'Old'] = o;
  }
  r.pass = r.dark >= p.min && r.light >= p.min;
  return r;
});

// ---------- 字、尺寸、间距、角、发光 ----------
export const FONT = {
  name: '"Fusion Pixel 12","PingFang SC",sans-serif',
  body: '"IBM Plex Sans","PingFang SC","Hiragino Sans GB",sans-serif',
  code: '"Departure Mono","Fusion Pixel 12","PingFang SC",monospace',
  dots: '"Doto","IBM Plex Mono",monospace',
};
// 字的角色：[id, 名字, 字体, 字号, 行高, 字重, 用在哪]
export const TYPE = [
  ['hero', '首页大标题', 'name', 24, 30, 400, '首页「weather-cli 要做什么？」'],
  ['title', '标题', 'name', 18, 24, 400, '模块里的大标题、任务名'],
  ['name', '名字', 'name', 12, 18, 400, '任务名、步骤名、问题、选项、项目名'],
  ['body', '正文', 'body', 12.5, 19, 400, '说明、回答、总结'],
  ['small', '小字', 'body', 12, 18, 400, '提示、时间、模块头右边的话'],
  ['code', '代码', 'code', 11, 18, 400, '代码、路径、命令、文件名（字号不小于 12 的唯一例外）'],
  ['label', '标签', 'dots', 13, 16, 900, '标签、选项片、小按钮：英文大写'],
  ['button', '按钮', 'dots', 14, 16, 900, '按钮、分段、模块头 [ LABEL ]'],
  ['count', '计数', 'dots', 17, 17, 900, '模块头右边的数'],
  ['num', '数字', 'dots', 26, 26, 900, '改动的文件数、进度百分比'],
  ['timer', '计时', 'dots', 54, 54, 900, '在跑的计时'],
];
export const SPACE = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10, 6: 12, 7: 14, 8: 16, 9: 18, 10: 22, 11: 28, 12: 30 };
// 控件和布局的尺寸：[id, 名字, 值, 用在哪]
export const SIZE = [
  ['button', '按钮高', 34, '主按钮、普通按钮、危险按钮'],
  ['button-sm', '小按钮高', 26, '模块头、预览头里的小按钮（EXPAND 26 见方）'],
  ['chip', '选项片高', 28, '谁来干、带上、菜单的选项片'],
  ['seg', '分段里一格', 28, '分段、页签'],
  ['input', '输入行高', 30, '中栏和 ONE SHOT 的输入行'],
  ['field', '输入框高', 38, '填 Key 这类单独的输入框'],
  ['row', '列表行高', 23, '文件树、改动列表'],
  ['menu-row', '菜单行高', 30, '谁来答的菜单'],
  ['tag', '标签高', 19, '标签（树里 17）'],
  ['check', '单选多选', 16, '单选、多选'],
  ['switch', '开关', '34 × 18', '设置里的开关'],
  ['icon', '图标', '16（小处 12、大处 24）', '8×8 像素格画成 2 倍'],
  ['header', '顶栏高', 44, '顶栏'],
];
export const LAYOUT = [
  ['left', '左栏', 288], ['right', '右栏', 336], ['gap', '栏间', 16],
  ['pad-top', '窗口上', 22], ['pad-x', '窗口左右', 30], ['pad-bottom', '窗口下', 28],
  ['mod-pad', '模块内边距', '14 18 16'],
];
// 像素阶梯角：[id, 用在哪, 切几级台阶, 每级几像素]（小样里的 --clip、--clip2、--notch）
export const STEPS = [
  ['module', '模块、卡片、菜单', 2, 3], ['control', '按钮、选项片、分段、输入框', 2, 2], ['small', '标签、单选多选、开关的钮', 1, 2],
];
// 发光只在深色里有；浅色一律没有
export const GLOW = [
  ['dot', '点阵、光标、进度块的点', '0 0 8px rgba(0,229,255,1)'],
  ['block', '进度块', '0 0 12px rgba(0,229,255,.85)'],
  ['text', '大号青字', '0 0 16px rgba(0,229,255,.85)'],
  ['timer', '计时数字', '0 0 26px rgba(0,229,255,.75), 0 0 6px rgba(0,229,255,1)'],
  ['on-cyan', '青块上的字', '0 0 6px rgba(0,229,255,.9)'],
  ['ink', '白字微光', '0 0 8px rgba(232,236,255,.35)'],
];

// ---------- 动效：一格 50ms，一步一格；时长都是整格 ----------
export const TICK = 50;
// [id, 名字, 什么时候, 格数, 走法, 循环, 档位, 改之前]
export const MOTIONS = [
  ['state', '控件状态', '悬停、按下、选中、开关', 0, '立刻变，不过渡', false, 'calm', ''],
  ['reveal-s', '小东西出现', '提示条、标签、菜单', 4, 'steps(4)', false, 'calm', '提示条 .25s → .2s'],
  ['reveal', '露出', '卡片内容、回答一段段出来', 8, 'steps(8)', false, 'calm', '.35–.6s，统一成 .4s'],
  ['dissolve', '溶掉', '撤销时改动一行行消失', 8, 'steps(8)', false, 'calm', ''],
  ['card-edge', '卡片的边点亮', '停下来问你、高危卡片出现', 16, 'steps(16)：上 → 右 → 下 → 左', false, 'expressive', ''],
  ['send', '发出', '发任务：一格光从输入框飞到任务', 12, 'steps(6)', false, 'expressive', '.55s → .6s'],
  ['scan-once', '扫一次', '发出、等你、完成、撤销', 18, '平滑（光不是东西）', false, 'expressive', '.8 / .9 / 1s → .9s'],
  ['done-flash', '做完闪两下', '任务做完', 18, 'steps(1)', false, 'expressive', ''],
  ['wait-turn', '头一格变琥珀', '停下来等你', 20, 'steps(1)', false, 'expressive', ''],
  ['roll', '数字滚', '撤销时文件数往下滚', 18, 'steps(n)，n 是滚过的数', false, 'expressive', ''],
  ['caret', '光标闪', '输入框有焦点', 20, 'steps(1)', true, 'expressive', '1.05s → 1s'],
  ['twinkle', '点阵转圈', '短的等待（3×3 点阵）', 24, 'steps(1)', true, 'expressive', ''],
  ['head-blink', '头一格闪', '进度块正在走的那一格', 16, 'steps(1)', true, 'expressive', ''],
  ['wave', '亮块呼吸', '进度块亮着的格', 48, '缓入缓出（只变亮度）', true, 'expressive', ''],
  ['running', '在跑那一步', '弹扣一下 + 一圈光', 28, '回弹 cubic-bezier(.3,1.6,.5,1)', true, 'expressive', ''],
  ['scan-loop', '在跑时扫描', '在跑的那一步每 2.8 秒扫一次', 56, '平滑', true, 'expressive', ''],
];
export const MS = (n) => n * TICK;

// ---------- 图标 ----------
export const ICON = {
  sizes: [1024, 512, 256, 128, 64, 32, 16],
  grid: 32, inset: 3, radius: 0.225,
  plate: ['#16214A', '#050816'], bird: CY, crest: '#A8F6FF', glow: 'feDropShadow 0.6 格，青 .55',
  menubar: { pt: 18, states: ['空闲', '在跑', '等你', '在跑 3 个'] },
};

// ---------- 小样用的 CSS 变量：角色 → 第 1、2 步小样里的变量名 ----------
const VARS = {
  page: ['bg'], grid: ['grid'], panel: ['pane'], 'panel-2': ['pane2'], raised: ['raise'], line: ['line'], 'line-strong': ['line2'], 'block-off': ['off'],
  text: ['tx'], 'text-2': ['tx2'], 'text-3': ['tx3'],
  cyan: ['cy-fill', 'cy-ol', 'cy'], 'cyan-hover': ['cy-hover'], 'on-cyan': ['on-cy'], 'cyan-text': ['cy-tx'], 'cyan-block': ['cy-blk'], 'cyan-line': ['cy-line'], 'cyan-soft': ['cy-soft'], 'cyan-scan': ['cy-scan'],
  ok: ['ok'], 'ok-soft': ['ok-soft'], warn: ['warn'], 'warn-hover': ['warn-hover'], 'warn-soft': ['warn-soft'], 'warn-line': ['warn-line'], 'on-warn': ['on-warn'],
  bad: ['bad'], 'bad-hover': ['bad-hover'], 'bad-soft': ['bad-soft'], 'bad-line': ['bad-line'], 'on-bad': ['on-bad'],
  muse: ['muse'], grok: ['grok'], api: ['api'],
};
const GLOWVAR = { dot: 'dglow', block: 'bglow', text: 'glow', timer: 'tglow', 'on-cyan': 'on-glow', ink: 'hglow' };
/** 盖在小样主题上的变量（放在画板 CSS 的最后）：.dk 深色、.lt 浅色。old = true 时给改之前的值（对照用）。 */
export function themeCss(sel = { dark: '.dk', light: '.lt' }, old = false) {
  const out = [];
  for (const mode of ['dark', 'light']) {
    const v = [];
    for (const [id, names] of Object.entries(VARS)) for (const n of names) v.push(`--${n}:${old ? oldVal(id, mode) : val(id, mode)}`);
    for (const [id, , g] of GLOW) v.push(`--${GLOWVAR[id]}:${mode === 'dark' ? g : 'none'}`);
    if (mode === 'light') v.push('--blk-ol:transparent');
    out.push(`${sel[mode]}{${v.join(';')}}`);
  }
  return out.join('\n');
}
export { val, oldVal };
