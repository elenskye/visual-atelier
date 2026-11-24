// 第 4 步 · Peck 的 Design System 的源：照 visual-atelier 的 schemes/<方案>/design-system/ 写
// （system.json、tokens.config.json、README.md、bundle.css、components/<名字>/README.md + preview.html）。
// 导入时 scheme/design-system/ 跟着 scheme/ 一起变成 schemes/peck/design-system/。数值都从 ../s3/tokens.mjs 取。
import { GROUPS, ROLES, PAIRS, LEVELS, TYPE, SPACE, LAYOUT, STEPS, GLOW, TICK, MOTIONS, MS } from '../s3/tokens.mjs';
import { bundleCss, GLYPHS, GLYPH_NAMES } from './css.mjs';
import * as m from './markup.mjs';
import { C } from '../s1/common.mjs';

const J = (o) => JSON.stringify(o, null, 2) + '\n';

export const TITLE = 'Peck';
export const NS = 'Peck';
// 第一主题是深色（Peck 的样子是深海 + 发光的青）；Design System 页默认看深色
export const THEMES = [{ id: 'dark', name: '深色' }, { id: 'light', name: '浅色' }];
// 有文件的字体（OFL，画布附件里那两个；visual-atelier 里在方案的 type/fonts/）；Doto、IBM Plex Sans 从 Google Fonts 取
export const FONT_FILES = [
  { family: 'Fusion Pixel 12', file: 'fonts/fusion-pixel-12.woff2', src: 'ref/fusion-pixel-12.woff2', weight: '400', style: 'normal' },
  { family: 'Departure Mono', file: 'fonts/departure-mono.woff2', src: 'ref/departure-mono.woff2', weight: '400', style: 'normal' },
];
// 控件尺寸和像素角（Design System 的 size、step 两组；方案的 scale.json 里是同一份）
export const SIZE_TOKENS = [
  ['button', 34, '按钮高：主按钮、普通按钮、危险按钮（pk-btn）'], ['button-sm', 26, '小按钮高：模块头、预览头里的小按钮（pk-btn--sm；EXPAND 是 26 见方）'],
  ['chip', 28, '选项片高（pk-chip；带上的小选项片 26）'], ['seg', 28, '分段、页签里一格的高（pk-seg）'], ['input', 30, '输入行高：中栏、ONE SHOT 底下那一行（pk-input）'],
  ['field', 38, '输入框高：填 Key 这类单独的一格（pk-field）'], ['row', 23, '列表行高：文件树、改动列表（pk-row）'], ['menu-row', 30, '菜单行高（pk-menu-item）'],
  ['tag', 19, '标签高（pk-tag；文件树里 17）'], ['check', 16, '单选、多选的格（pk-radio、pk-check）'], ['switch-w', 34, '开关宽（pk-switch-track）'], ['switch-h', 18, '开关高'],
  ['icon', 16, '图标：8×8 像素格，一格 2 像素'], ['icon-sm', 12, '小图标：列表行、小按钮、提示条里'], ['icon-lg', 24, '大图标：空状态'], ['header', 44, '顶栏高'],
];

// ---------- tokens.config.json：每个 token 的用途（Design System 页上显示），字体样式 ----------
const pairNote = (id) => {
  const fg = PAIRS.filter((p) => p.fg === id);
  const bg = PAIRS.filter((p) => p.bg === id && p.kind === 'text');
  const out = [];
  if (fg.length) {
    const by = {};
    for (const p of fg) (by[p.min] ||= []).push(p.bg);
    out.push(Object.entries(by).map(([min, bgs]) => `放在 ${bgs.map((b) => `color-${b}`).join('、')} 上（APCA Lc ≥ ${min}，深浅都过）`).join('；'));
  }
  if (bg.length) out.push(`上面能放 ${[...new Set(bg.map((p) => `color-${p.fg}`))].join('、')}`);
  return out.join('。');
};
const SPACE_USE = {
  1: '台阶角的一级、图标和边之间', 2: '图标和字之间的最小间距、标签上下', 3: '选项片里图标和字、分段里几格之间', 4: '模块头里几样东西之间、按钮里图标和字',
  5: '提示条里图标和字、选项之间', 6: '输入框左右内边距、卡片里块之间', 7: '按钮左右内边距、模块之间', 8: '栏间、模块内边距（下）',
  9: '模块内边距（左右）', 10: '窗口上边距', 11: '窗口下边距', 12: '窗口左右边距',
};
const LAYOUT_USE = { left: '左栏（项目和任务）宽', right: '右栏（改动 / ONE SHOT / 文件 / 终端）宽', gap: '三栏之间', 'pad-top': '窗口上边距', 'pad-x': '窗口左右边距', 'pad-bottom': '窗口下边距' };
const FONT_NAME = { name: '缝合像素 12', body: 'Plex Sans + 苹方', code: 'Departure Mono', dots: 'Doto 900' };
const SAMPLE = {
  hero: 'weather-cli 要做什么？', title: '把设置里三个对话框合成一个面板', name: 'Grok 跑 pnpm check', body: '第一次有报错，Grok 在改。升级会顺手改 6 个文件的类名。',
  small: '订阅额度 · 只读 · 2 分钟前', code: 'settings/SettingsSheet.tsx', label: 'NEW DEL 2/3', button: 'SEND UNDO TASK', count: '12', num: '+86 −132', timer: '02:14',
};
const LS = { label: '.06em', button: '.08em' };

export function tokensConfig() {
  const usage = {};
  for (const g of GROUPS) for (const [id, name, use] of g.roles) {
    const extra = pairNote(id);
    const glow = id === 'cyan' || id === 'cyan-block' || id === 'cyan-text' ? '深色里会发光（shadow-glow-*），浅色不发光。' : '';
    usage[`color-${id}`] = `${name}：${use}。${extra ? extra + '。' : ''}${glow}`.replace(/。。/g, '。');
  }
  usage['color-focus'] = '键盘焦点：控件里面内缩 3 像素一圈 1 像素点线的颜色，就是 color-cyan-text。青块、琥珀、红底上的焦点用块上的字色（color-on-cyan、color-on-warn、color-on-bad）。';
  for (const [k, v] of Object.entries(SPACE)) usage[`space-${k}`] = `${v}px：${SPACE_USE[k]}。间距只用这 12 档。`;
  for (const [id, , v] of LAYOUT) if (typeof v === 'number') usage[`width-${id}`] = `${v}px：${LAYOUT_USE[id]}。`;
  for (const [id, name, f, size, lh, , use] of TYPE) {
    usage[`text-${id}`] = `${name}的字号 ${size}px（${FONT_NAME[f]}）：${use}。`;
    usage[`leading-${id}`] = `${name}的行高 ${lh}px。`;
  }
  for (const [id, use] of GLOW) usage[`shadow-glow-${id}`] = `发光 · ${use}：只在深色里有，浅色是 none。只给青色（和白字的微光）。`;
  for (const [id, , use] of SIZE_TOKENS) usage[`size-${id}`] = use + '。';
  for (const [id, use, lv, st] of STEPS) usage[`step-${id}`] = `${use}：切 ${lv} 级台阶，每级 ${st}px（bundle.css 的 ${{ module: '--pk-clip', control: '--pk-clip2', small: '--pk-notch' }[id]}）。没有圆角。`;
  const style = (id) => {
    const [, name, f, size, lh, w, use] = TYPE.find((t) => t[0] === id);
    return { name: `t-${id}`, family: f, fontSize: `${size}px`, lineHeight: `${lh}px`, fontWeight: w, ...(LS[id] ? { letterSpacing: LS[id] } : {}), sample: SAMPLE[id], usage: `${name}：${use}` };
  };
  const typeGroups = [
    { name: '名字和标题 · 缝合像素 12', family: 'name', styles: ['hero', 'title', 'name'].map(style) },
    { name: '说明 · Plex Sans + 苹方', family: 'body', styles: ['body', 'small'].map(style) },
    { name: '代码 · Departure Mono', family: 'code', styles: ['code'].map(style) },
    { name: '点阵字 · Doto（英文大写和数字）', family: 'dots', styles: ['label', 'button', 'count', 'num', 'timer'].map(style) },
  ];
  return {
    $note: 'Design System 的 tokens.json 由构建生成：颜色、字、间距、宽、发光取自方案的 tokens/，这里只写每个 token 的用途和字体样式。themes：第一主题是深色。fonts：有文件的两个字体。控件尺寸（size-*）和像素角（step-*）取自方案 scale.json 的 size、step（scaleGroups）。fonts 的源文件在方案的 type/<file>。',
    themes: THEMES, fonts: FONT_FILES.map(({ family, file, weight, style: st }) => ({ family, file, weight, style: st })),
    scaleGroups: { size: {}, step: { field: 'size' } },
    usage, typeGroups,
  };
}

export function systemJson() {
  return {
    $note: 'Design System 的名字、命名空间、资产分组。资产取自方案 marks/（按 manifest 的 id），A3 是位图（marks/raster/a3.png）。没有 JS 组件：bundle.js 只声明 window.Peck。上传记录在 published.json。',
    title: TITLE, namespace: NS, by: 'Elen Skye', via: 'Claude Code · Peck Explore',
    assetGroups: [
      { name: 'App', tile: 'l', assets: [
        { id: 'app-icon-j2', name: 'peck-j2.svg' }, { id: 'app-icon-j2-128', name: 'peck-j2-128.svg' }, { id: 'app-icon-j2-64', name: 'peck-j2-64.svg' },
        { id: 'app-icon-j2-32', name: 'peck-j2-32.svg' }, { id: 'app-icon-j2-16', name: 'peck-j2-16.svg' },
        { id: 'app-icon-a3', name: 'peck-a3.png' },
      ] },
      { name: 'MenuBar', tile: 's', assets: [
        { id: 'menubar-idle', name: 'menubar-idle.svg' }, { id: 'menubar-run-1', name: 'menubar-run-1.svg' }, { id: 'menubar-run-2', name: 'menubar-run-2.svg' },
        { id: 'menubar-run-3', name: 'menubar-run-3.svg' }, { id: 'menubar-wait', name: 'menubar-wait.svg' }, { id: 'menubar-count', name: 'menubar-count-3.svg' },
      ] },
    ],
  };
}

// ---------- README.md：给用它的人和 Agent 看的规矩 ----------
const roleRow = (id) => { const r = ROLES[id]; return `| \`color-${id}\` | ${r.name} | \`${r.dark}\` | \`${r.light}\` | ${r.use} |`; };
export function readme() {
  const typeRows = TYPE.map(([id, name, f, size, lh, w, use]) => `| \`t-${id}\` | ${name} | ${FONT_NAME[f]} | ${size} / ${lh} | ${use} |`).join('\n');
  const motionRows = MOTIONS.map(([id, label, when, n, way, loop, tier]) => `| ${label} | ${when} | ${n} 格（${MS(n)}ms） | ${way} | ${tier}${loop ? '，循环' : ''} | ${MOTION_CLASS[id] || '—'} |`).join('\n');
  const glyphs = Object.keys(GLYPHS).map((n) => `\`${n}\` ${GLYPH_NAMES[n]}`).join('、');
  return `Peck 是站主自己 Mac 上的 Coding Agent：三栏（项目和任务 · 对话 · 改动 / ONE SHOT / 文件 / 终端），CLI 和 API 两种模式。样子是**点阵终端 × 深海**：深色的底上一层 LED 点阵孔，青色锐利、会发光，是全屏唯一发光的颜色；其余的颜色清爽，只留给意思；角都是像素台阶，动起来像 LED 一格一格亮。

## 怎么用

- 页面或画板最外层写 \`class="pk"\`（字体、字号、正文色、页面底都从这里来），要铺 LED 点阵孔再加 \`pk-dots\`。
- **明暗**：根上写 \`data-theme="dark"\`（默认，第一主题）或 \`"light"\`，Peck 跟随系统写这一个属性。变量名两边一样（\`--color-panel\` 还是 \`--color-panel\`）。
- **样式**：先 \`tokens.css\`，再 \`components/bundle.css\`。挂到 Design 画布上时，画板在 \`support.js\` 那行后面依次写 \`<link rel="stylesheet" href="ds/peck/tokens.css">\`、\`<link rel="stylesheet" href="ds/peck/components/bundle.css">\`。没有 JS 组件：\`components/bundle.js\` 只声明 \`window.Peck\`，所有组件都是 HTML + 类名，照每个组件的预览抄。
- **字体**：缝合像素 12（名字、标题）和 Departure Mono（代码）在 \`fonts/\`；Doto（点阵字）和 IBM Plex Sans（说明）从 Google Fonts 取（\`Doto:wght@900\`、\`IBM+Plex+Sans:wght@400;600\`）；中文退到苹方（系统字体，只在 Mac 上有）。在画布上用：把 \`fonts/\` 的两个文件上传成资产，在 \`<helmet><style>\` 里给它们写 \`@font-face\`，Google Fonts 的 \`<link>\` 也放进 \`<helmet>\`。
- **类名**都以 \`pk-\` 开头。修饰写 \`pk-btn--primary\` 这样；状态写 \`is-on\`（选中、开着）、\`is-off\` 或 \`disabled\`（不能用）。\`is-hover\`、\`is-focus\`、\`is-press\` 只在说明页上把状态摆出来用，真界面交给 \`:hover\`、\`:focus-visible\`、\`:active\`。
- **字体样式**写 \`t-\` 开头的类（\`t-name\`、\`t-body\`、\`t-code\`……，见下面「字」）。
- 每个组件写在 \`components/<名字>/README.md\`，预览就是它的标准写法。

## 内容基调

- 中文为主，专有名词保留英文：Muse、Grok、API、Tailwind、pnpm、README.md。不叫「助手」，就叫模型的名字。
- **点阵字只写英文大写和数字**：按钮、分段、标签、模块头都是英文大写——\`SEND\`、\`CANCEL\`、\`UNDO TASK\`、\`PLAN / EDIT / AUTO\`、\`[ CHANGES ]\`、\`NEW\`、\`DEL\`、\`2/3\`。中文不进 Doto。
- **名字**（任务名、步骤名、问题、选项、项目名）是中文短句，用缝合像素：「${C.task}」「Grok 跑 pnpm check」「${C.ask.q}」。
- **说明**一句话，写发生了什么、谁在干：「第一次有报错，Grok 在改」「读了 12 个文件，列出 6 条要改的」「${C.ask.d}」。
- 数字和汉字之间空一格：「6 个文件」「还剩 3 步」；行数写 \`+86 −132\`。时间 \`02:14\`、\`48s\`、\`1:02\`。
- 不用 emoji，不用感叹号。演示只用编的项目：weather-cli、notes-sync、pomelo-site。

## 颜色

- **底 → 面**：\`color-page\` 是页面底（深色深海 / 浅色冷白），上面铺 \`color-grid\` 的 LED 点阵孔；模块、卡片、菜单的面是 \`color-panel\`；输入框、代码块、预览、菜单里面是 \`color-panel-2\`（内凹）；悬停抬起一档是 \`color-raised\`。模块的外层是 \`color-line\`，控件的边是 \`color-line-strong\`。
- **字**：名字和正文 \`color-text\`；说明 \`color-text-2\`；提示小字、时间、占位 \`color-text-3\`。
- **青色只表示「在发生」和「主要的那一下」**：主按钮、选中的分段、开着的开关是 \`color-cyan\`，上面的字和图标用 \`color-on-cyan\`；青字 \`color-cyan-text\`（选中、链接、键盘焦点）；进度块、光标、点阵 \`color-cyan-block\`；在跑的模块边、悬停时控件的边 \`color-cyan-line\`；选中的行 \`color-cyan-soft\`；扫描光 \`color-cyan-scan\`。**同一时刻只有一个青色主按钮。**
- **状态色只留给意思**：绿 \`color-ok\` 完成、通过、新增；琥珀 \`color-warn\` 等你批、等你答；红 \`color-bad\` 删除、出错、危险。各自有 \`-soft\`（状态条的底）、\`-line\`（模块、卡片的边）、\`on-\`（块上的字）、\`-hover\`。代码不按语法上色。
- **身份色**：\`color-muse\` 紫、\`color-grok\` 橙、\`color-api\` 蓝，只做 7 像素的方点（\`pk-dot\`）。
- **发光只在深色，只给青色**：\`shadow-glow-dot\`（点、光标）、\`shadow-glow-block\`（进度块）、\`shadow-glow-text\`（大号青字）、\`shadow-glow-timer\`（计时）、\`shadow-glow-on-cyan\`（青块上的字）、\`shadow-glow-ink\`（在跑那一步的白字微光）。浅色里这些都是 \`none\`，青换成深青 \`#007A94\`。
- **对比度按 APCA**（Peck 的字只有 12–12.5 号，门槛比常见的高）：${LEVELS.map(([n, t]) => `${t} ≥ ${n}`).join('；')}。${PAIRS.length} 对深浅都过，每个颜色 token 的用途里写了它能放在哪些底上。
- 主要的角色：

| token | 名字 | 深色 | 浅色 | 用在哪 |
| --- | --- | --- | --- | --- |
${['page', 'panel', 'panel-2', 'raised', 'line-strong', 'text', 'text-2', 'text-3', 'cyan', 'on-cyan', 'cyan-text', 'cyan-block', 'ok', 'warn', 'bad'].map(roleRow).join('\n')}

## 字

四种字各管一件事，都是 OFL：

| 类 | 角色 | 字体 | 字号 / 行高 | 用在哪 |
| --- | --- | --- | --- | --- |
${typeRows}

- 字号不小于 12；唯一的例外是代码用的 Departure Mono 11。缝合像素只用 12、18、24（12 的整数倍才清楚）。
- 说明和回答用 Plex Sans（中文退到苹方），读长段不累；不要把整段话写成像素字或等宽字。

## 形状

- **像素阶梯角，没有圆角**：模块、卡片、菜单切 2 级 × 3px（\`--pk-clip\`）；按钮、选项片、分段、输入框 2 级 × 2px（\`--pk-clip2\`）；标签、单选多选、开关的钮 1 级 × 2px（\`--pk-notch\`）。都是 \`clip-path\`，所以边框画成两层：外层是边色，\`:before\` 是面。
- **模块两层**（\`pk-mod\`）：外层 \`color-line\`，里层 \`color-panel\`。状态只换外层：在跑 \`pk-mod--run\`（青线）、等你 \`pk-mod--wait\`（琥珀）、出错 \`pk-mod--err\`（红）。**同一时刻只有一块模块描彩边。**
- **LED 点阵孔**：页面底上 8 像素一颗（\`pk-dots\`）。
- **没有投影**；分开东西靠面的深浅、点阵和留白。
- **间距**只用 \`space-1\`…\`space-12\`（${Object.values(SPACE).join('、')}）。三栏 \`width-left\` 288 / 自适应 / \`width-right\` 336，栏间 \`width-gap\` 16；窗口边上 22、左右 30、下 28。
- **尺寸**：${SIZE_TOKENS.map(([id, v]) => `\`size-${id}\` ${v}`).join('、')}。

## 控件的状态

- **悬停**：有边的控件边亮成青线（\`color-cyan-line\`）、里面抬起一档（\`color-raised\`）；青块、琥珀、红底亮一档（\`-hover\`）；没边的行抬起一档。状态立刻变，不过渡。
- **键盘焦点**：控件里面内缩 3 像素一圈 1 像素点线（\`color-focus\`）。不画在外面：像素角会把外面的光圈切掉。青块、琥珀、红底上用块上的字色。
- **按下**：往下沉 1 像素，发光收起；有边的按钮里面凹一档（\`color-panel-2\`）。
- **不能用**：提示色字、内凹底、没有发光；为什么不能用写在旁边或悬停时说。

## 图标

- **界面图标**：8×8 像素格，一格 2 像素画成 16（列表行、小按钮、提示条里 12，空状态 24）。写 \`<i class="pk-i pk-i--send"></i>\`，颜色跟着字（\`currentColor\`），大小加 \`pk-i--12\` / \`pk-i--24\`。共 ${Object.keys(GLYPHS).length} 个：${glyphs}。不混别的图标集，不用 emoji。
- **App 图标 J2**（资产 App 组）：32 格的像素鸟，青 \`#00E5FF\`、冠羽 \`#A8F6FF\`，眼睛空着；深海渐变的底板占画面 7/8（第 1 步的比例），圆角 22.5%。每个尺寸一格都是整像素：\`peck-j2.svg\` 给 256 以上（1024、512、256 上一格 28、14、7 像素）；\`peck-j2-128.svg\`、\`peck-j2-64.svg\`、\`peck-j2-32.svg\` 是照 J2 缩的 28 格鸟（一格 4、2、1）；\`peck-j2-16.svg\` 是 14 格的。\`peck-a3.png\` 是现在的图标润色过的（A3），设置里能换成它。
- **菜单栏模板图**（资产 MenuBar 组）：18pt，14 格的鸟（和 \`peck-j2-16.svg\` 同一只），一格 1pt，@1x、@2x 都是整像素；黑 + 透明，由系统按明暗上色。空闲、在跑（\`run-1\`…\`run-3\` 每帧 300ms 轮流）、等你（问号）、在跑 N 个。

## 动效

一格 ${TICK}ms，一步一格（\`steps()\`）；东西一格一格跳，不用平滑缓动；时长都是整格。光（扫描、亮块呼吸）可以平滑。

| 动作 | 什么时候 | 时长 | 走法 | 档位 | 类 |
| --- | --- | --- | --- | --- | --- |
${motionRows}

- \`calm\`：控件的小动静，单次 ≤ 400ms，不循环。\`expressive\`：只给发出、等你、做完、撤销这几个时刻，单次 ≤ 1 秒；在跑和等待时才循环。
- **减弱动态效果**：只留最后的样子——光标常亮，转圈停成满格，扫描不出现，溶掉的直接不见。\`bundle.css\` 已经按 \`prefers-reduced-motion\` 写好；说明页、截图上要定格就在外层加 \`pk-still\`。

## 不要

- 不要做成 VSCode 那样：一层层灰面板 + 1 像素分隔线 + 满屏等宽字，青色只剩几个小点。
- 不要圆角、柔和阴影、渐变底（App 图标的底板除外）。
- 不要装饰性的循环动效；不要两个青色主按钮同时出现。
- 不要给浅色加发光；不要用纯青 \`#00E5FF\` 在浅色里写字。
`;
}
const MOTION_CLASS = {
  'reveal-s': '`pk-anim-reveal-s`', reveal: '`pk-anim-reveal`', dissolve: '`pk-anim-dissolve`', 'card-edge': '`pk-card-edge`', 'scan-once': '`pk-scan`',
  'done-flash': '`pk-anim-flash`', 'wait-turn': '`pk-blocks` 的 `is-wait`', caret: '`pk-caret`', twinkle: '`pk-twinkle`', 'head-blink': '`pk-blocks` 的 `is-head`',
  wave: '`pk-blocks` 的 `is-on`', running: '`pk-run`', 'scan-loop': '`pk-scan--loop`', state: '（各控件）',
};

// ---------- 组件：README + preview ----------
const preview = (title, { group, height, sub, css = '', body }) => `<!-- @dsCard group="${group}" height=${height} width=960 subtitle="${sub}" -->
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  html, body { margin: 0; }
  .demo { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 24px 32px; }
  .col { display: flex; flex-direction: column; gap: 8px; }
  .lb { width: 100%; font-size: 12px; color: var(--color-text-3); margin-bottom: -4px; }
${css}
</style>
</head>
<body class="pk pk-dots">
${body.trim()}
</body>
</html>
`;
const lb = (t) => `<p class="lb">${t}</p>`;

export function components() {
  const C2 = {};
  const add = (name, readme, pv) => { C2[name] = { readme, preview: preview(name, pv) }; };

  add('Button', `# Button

按钮：点阵字、英文大写，两层像素角（外层是边、里层是面）。动词开头的短词：SEND、CANCEL、UNDO TASK。

**写法**：
- 普通：\`<button class="pk-btn">CANCEL</button>\`，边 \`color-line-strong\`、面 \`color-panel\`、字 \`color-text\`。
- 主按钮：加 \`pk-btn--primary\`，整块 \`color-cyan\`，字 \`color-on-cyan\`（深色带一点光）。**一屏只有一个。**
- 危险：\`pk-btn--danger\`（红边红字，「撤销整个任务」这类）；真要删的那一下：\`pk-btn--fill\`（红底，字 \`color-on-bad\`）。
- 琥珀：\`pk-btn--warn\`，只在「等你」的提示条和卡片里（BACK、去看看）。
- 没边的：\`pk-btn--ghost\`（COPY、CLEAR 这类小动作）。小按钮加 \`pk-btn--sm\`（高 26，模块头、预览头里）；只有图标的加 \`pk-btn--square\` 并写 \`aria-label\`。
- 图标放在字前面：\`<i class="pk-i pk-i--undo"></i>UNDO TASK\`，间距 7（小按钮 6）；只有 SEND 的箭头放在字后面（往前走）。
- 不能用：\`disabled\`（或 \`is-off\`）。

**状态**：悬停边亮成青线、面抬起一档（青块、琥珀、红底亮一档）；键盘焦点是里面一圈 1 像素点线；按下沉 1 像素、发光收起。

**尺寸**：高 \`size-button\` 34（小 26），左右 14（小 8），字 \`text-button\` 14（小 13），字距 .08em。

**不要**：中文写进按钮；一排两个主按钮；按钮套阴影或圆角。`, {
    group: '控件', height: 210, sub: '普通、主按钮、危险、红底、琥珀、没边的、小按钮 × 平时 / 悬停 / 焦点 / 按下 / 不能用',
    css: '  .demo { row-gap: 12px; }',
    body: `<div class="demo">${lb('样子')}${m.btn('SEND', { v: 'primary', icEnd: 'send' })}${m.btn('CANCEL')}${m.btn('UNDO TASK', { v: 'danger', ic: 'undo' })}${m.btn('UNDO 6 FILES', { v: 'fill' })}${m.btn('BACK', { v: 'warn' })}${m.btn('COPY', { v: 'ghost', sm: true })}${m.btn('EXPAND', { sm: true, ic: 'expand' })}
${lb('状态：悬停 · 焦点 · 按下 · 不能用')}${m.btn('SEND', { v: 'primary', cls: 'is-hover' })}${m.btn('CANCEL', { cls: 'is-hover' })}${m.btn('SEND', { v: 'primary', cls: 'is-focus' })}${m.btn('CANCEL', { cls: 'is-focus' })}${m.btn('CANCEL', { cls: 'is-press' })}${m.btn('SEND', { v: 'primary', off: true })}${m.btn('UNDO 6 FILES', { v: 'fill', off: true })}</div>`,
  });

  add('Chip', `# Chip

选项片：谁来干、带上的东西、菜单的入口。点阵字，边 \`color-line-strong\`，选中时边变青、图标变青字。

**写法**：\`<button class="pk-chip"><i class="pk-i pk-i--plus"></i>TASK</button>\`；选中加 \`is-on\`；带上的小选项片加 \`pk-chip--sm\`（高 26，图标 12）；不能用 \`disabled\`。

**状态**：悬停边亮成青线、字变 \`color-text\`；选中再悬停时面变 \`color-cyan-soft\`；按下沉 1 像素。

**尺寸**：高 \`size-chip\` 28，左右 10，字 \`text-label\` 13，字距 .06em。`, {
    group: '控件', height: 90, sub: '平时、选中、带上的小选项片、悬停、不能用',
    body: `<div class="demo">${m.chip('TASK', { ic: 'plus' })}${m.chip('GROK', { on: true, ic: 'check' })}${m.chip('UNITS.TS', { sm: true, ic: 'file' })}${m.chip('SNAPSHOT', { sm: true, on: true, ic: 'check' })}${m.chip('TASK', { ic: 'plus', cls: 'is-hover' })}${m.chip('TASK', { ic: 'plus', cls: 'is-focus' })}${m.chip('API', { off: true })}</div>`,
  });

  add('Segmented', `# Segmented

分段和页签：几样里选一样（权限三档 PLAN / EDIT / AUTO、CLI / API），右栏的四个页签。选中的那块也切台阶角。

**写法**：
- 分段：\`<div class="pk-seg" role="group"><button class="is-on">PLAN</button><button>EDIT</button>…</div>\`；铺满加 \`pk-seg--full\`，矮一号加 \`pk-seg--sm\`（26）。
- 页签：\`pk-seg pk-seg--full pk-tabs\` + \`role="tablist"\`，每个 \`role="tab"\` 写 \`aria-selected\`。页签上的提示：数字 \`<em>5</em>\`（青字）、锁 \`pk-i pk-i--lock\`、点阵转圈 \`pk-twinkle\`（那边在跑）、角标 \`pk-badge\`（有新东西；\`--ok\` 做完、\`--bad\` 出错）。从不自己切走。

**状态**：没选中的悬停抬起一档；选中的悬停亮一档；焦点是里面的点线（选中的那块用 \`color-on-cyan\`）。

**尺寸**：一格高 \`size-seg\` 28，左右 12，格间 3，外框内边距 3；页签一格左右 7、字 13。`, {
    group: '控件', height: 130, sub: '权限三档、CLI / API、右栏页签（数字、锁、在跑、有新东西）',
    css: '  .tabs { width: 336px; }',
    body: `<div class="demo">${m.seg(['PLAN', 'EDIT', 'AUTO'], { on: 1 })}${m.seg(['CLI', 'API'], { on: 0, sm: true })}${m.seg(['PLAN', ['EDIT', 'is-hover'], 'AUTO'], { on: 0 })}
<div class="tabs">${m.tabs([['CHANGES', '<em>5</em>'], ['ONE SHOT'], ['FILES'], ['TERM', m.icon('lock', 12)]], 0)}</div>
<div class="tabs">${m.tabs([['CHANGES', m.twinkle()], ['ONE SHOT'], ['FILES', '<i class="pk-badge pk-badge--ok"></i>'], ['TERM', m.icon('lock', 12)]], 1)}</div></div>`,
  });

  add('Switch', `# Switch

开关：设置里的是 / 否。开着是青块 + 右边的钮（\`color-on-cyan\`），关着是边 + 左边的灰钮。

**写法**：\`<button class="pk-switch" role="switch" aria-checked="true"><span class="pk-switch-track"><i></i></span>完成时通知</button>\`；关着写 \`aria-checked="false"\`；不能用 \`disabled\`。

**状态**：悬停时关着的边亮成青线、开着的亮一档；焦点的点线画在整个开关外面一圈（含字）；按下钮沉 1 像素。

**尺寸**：\`size-switch-w\` 34 × \`size-switch-h\` 18，钮 12，字 13。`, {
    group: '控件', height: 80, sub: '开着、关着、悬停、不能用',
    body: `<div class="demo">${m.sw('完成时通知')}${m.sw('跑完自动撤销失败的步骤', { on: false })}${m.sw('完成时通知', { cls: 'is-hover' })}${m.sw('跑完自动撤销', { on: false, cls: 'is-hover' })}${m.sw('联网前问我', { off: true })}</div>`,
  });

  add('Choice', `# Choice

单选和多选：ASK 卡片里的选项、设置里的一组。一行一个，前面是像素圆（单选）或像素方（多选），名字用缝合像素，说明用小字。

**写法**：
- \`<button class="pk-opt" role="radio" aria-checked="true"><span class="pk-radio"></span><span><b class="pk-opt-name">一起升到 4.1</b><span class="pk-opt-desc">顺手改 6 个文件的类名</span></span><span class="pk-opt-key">1</span></button>\`
- 多选把 \`role\` 换成 \`checkbox\`，圆换成 \`<span class="pk-check"><i class="pk-i pk-i--check pk-i--12"></i></span>\`。
- 推荐的那一项在名字后面放 \`<em class="pk-tag pk-tag--rec">DEFAULT</em>\`；选了会怎样写在说明里。
- 选中：\`aria-checked="true"\`（或 \`is-on\`），整行 \`color-cyan-soft\`。不能用 \`disabled\`。

**状态**：悬停抬起一档；按下 \`color-cyan-soft\`；焦点是里面的点线。

**尺寸**：格 \`size-check\` 16，行内边距 3 / 10，格和字之间 12。`, {
    group: '控件', height: 260, sub: '单选（带推荐、说明、快捷键）、多选、不能用',
    css: '  .demo { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; align-items: start; }',
    body: `<div class="demo"><div class="col">${m.opt('一起升到 4.1', { on: true, desc: '顺手改 6 个文件的类名', key: '1', tag: ' ' + m.tag('DEFAULT', 'rec') })}${m.opt('先不升', { desc: '这次任务照样能做完', key: '2' })}${m.opt('这个任务跑完再说', { desc: '跑完以后再问一次', key: '3', cls: 'is-hover' })}${m.opt('换成 UnoCSS', { off: true, desc: '这个项目没装' })}</div>
<div class="col">${m.opt('删 2 个旧文件', { kind: 'check', on: true, desc: 'AgentsDialog.tsx、ProvidersDialog.tsx' })}${m.opt('跑 pnpm check', { kind: 'check', on: true })}${m.opt('改 README.md', { kind: 'check', desc: '项目外的文件，要再确认' })}${m.opt('联网装依赖', { kind: 'check', off: true, desc: 'PLAN 档不能装' })}</div></div>`,
  });

  add('Field', `# Field

输入：单独的一格输入框（填 Key 这类，\`pk-field\`），和中栏、ONE SHOT 底下的输入行（\`pk-input\`）。前面都有一个青色的 \`›\`（\`pk-prompt\`），光标是一格青块（\`pk-caret\`）。

**写法**：
- 输入框：\`<label class="pk-field"><span class="pk-prompt">›</span><input placeholder="粘贴 DeepSeek 的 Key"></label>\`；填好以后显示成 \`<span class="pk-field-value">sk-••••••••3f2a</span>\`（等宽、字距 .06em）；不能用加 \`is-off\`，旁边写为什么。
- 输入行：\`<div class="pk-input"><span class="pk-prompt">›</span><span class="pk-input-text">…</span><i class="pk-caret"></i></div>\`，没有边，放在模块里。

**样子**：输入框的边是青（\`color-cyan\`），面是内凹 \`color-panel-2\`，悬停面抬起一档。

**尺寸**：输入框高 \`size-field\` 38，左右 12，字 13；输入行高 \`size-input\` 30。`, {
    group: '控件', height: 220, sub: '输入框（空、有焦点、填好、不能用）和输入行',
    css: '  .demo { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; } .pk-mod { grid-column: 1 / -1; padding: 6px 14px; }',
    body: `<div class="demo">${m.field({ ph: '粘贴 DeepSeek 的 Key' })}${m.field({ ph: '粘贴 DeepSeek 的 Key', caret: true })}${m.field({ value: 'sk-••••••••3f2a' })}${m.field({ ph: '这个任务跑完再填', off: true })}
<div class="pk-mod">${m.input(C.task)}</div></div>`,
  });

  add('Menu', `# Menu

菜单：ONE SHOT 左下「谁来答」弹出的单子。分组标题是点阵小字，每项前面是身份色点，名字点阵字，后面是一句小字；最后可以有一条动作（\`pk-menu-action\`）。

**写法**：
\`\`\`html
<div class="pk-menu" role="menu">
  <p class="pk-menu-group">CLI</p>
  <button class="pk-menu-item is-on" role="menuitem"><i class="pk-dot pk-dot--muse"></i><b>MUSE</b><span>订阅额度 · 只读</span></button>
  <div class="pk-menu-sep"></div>
  <button class="pk-menu-action"><i class="pk-i pk-i--plus pk-i--12"></i>配 Key 用 API 模型<em>当场填</em></button>
</div>
\`\`\`
边是青线 \`color-cyan-line\`，面是 \`color-panel-2\`。选中的项 \`is-on\`（\`color-cyan-soft\` 底、青字），不能用 \`disabled\`。

**尺寸**：行高 \`size-menu-row\` 30，左右 8；菜单内边距 8 / 6 / 6。`, {
    group: '控件', height: 280, sub: 'CLI 一组、API 一组、悬停、不能用、配 Key',
    css: '  .pk-menu { width: 336px; }',
    body: `<div class="demo"><div class="pk-menu" role="menu"><p class="pk-menu-group">CLI</p>${m.menuItem('muse', 'MUSE', '订阅额度 · 只读', { on: true })}${m.menuItem('grok', 'GROK', 'PLAN 档 · 订阅额度', { cls: 'is-hover' })}<div class="pk-menu-sep"></div><p class="pk-menu-group">API</p>${m.menuItem('api', 'DEEPSEEK V3', '按次算钱 · 只读文件')}${m.menuItem('api', 'QWEN 3', '没配 Key', { off: true })}<button type="button" class="pk-menu-action">${m.icon('plus', 12)}配 Key 用 API 模型<em>当场填</em></button></div></div>`,
  });

  add('FileRow', `# FileRow

列表行：文件树、改动列表的一行。图标 12、文件名等宽（Departure Mono 11）、后面是标签和加减的行数。

**写法**：\`<div class="pk-tree"><button class="pk-row"><i class="pk-i pk-i--file pk-i--12"></i><span class="pk-row-name">Composer.tsx</span><span></span><span class="pk-add">+9</span><span class="pk-del">−21</span></button></div>\`
- 文件夹 \`pk-row--dir\`（名字 \`color-text-2\`，图标 \`folder\` / \`triD\`）；删掉的 \`pk-row--del\`（划掉、提示色）。
- 新文件放 \`<em class="pk-tag pk-tag--new">NEW</em>\`，删了放 \`pk-tag--del\`；行数 \`pk-add\`（绿）、\`pk-del\`（红）。
- 选中 \`is-on\`（\`color-cyan-soft\`，图标变青）。不能用 \`disabled\`。

**状态**：悬停抬起一档，按下 \`color-cyan-soft\`。

**尺寸**：行高 \`size-row\` 23，左右 6；行里的标签高 17。`, {
    group: '控件', height: 250, sub: '文件夹、文件、新文件、删掉的、选中、悬停',
    css: '  .pk-tree { width: 336px; }',
    body: `<div class="demo"><div class="pk-mod"><div class="pk-tree">${m.row('settings', { k: 'dir', ic: 'triD' })}${m.row('SettingsSheet.tsx', { tag: 'NEW', add: 74, on: true })}${m.row('AgentsDialog.tsx', { k: 'del', tag: 'DEL', del: 93 })}${m.row('chat', { k: 'dir', ic: 'triD' })}${m.row('Composer.tsx', { add: 9, del: 21, cls: 'is-hover' })}${m.row('App.tsx', { add: 3, del: 18 })}${m.row('units.ts', { cls: 'is-focus' })}</div></div></div>`,
  });

  add('Module', `# Module

模块：三栏里的每一块、卡片、摘要。两层像素角：外层是边（\`color-line\`），\`:before\` 是面（\`color-panel\`）。状态只换外层的边。

**写法**：
\`\`\`html
<section class="pk-mod pk-mod--run">
  <p class="pk-mod-head"><span class="pk-mod-label">TASK</span><span class="pk-mod-note">在跑 · 02:14</span><span class="pk-mod-count">3/4</span></p>
  …
</section>
\`\`\`
- 模块头：\`pk-mod-label\` 是点阵字的 \`[ LABEL ]\`，\`pk-mod-note\` 是右边的小字，\`pk-mod-count\` 是右边的数。
- 边：在跑 \`pk-mod--run\`（青线）、等你 \`pk-mod--wait\`（琥珀）、出错 \`pk-mod--err\`（红）。**同一时刻只有一块模块描彩边。**
- 内凹的块（摘要、代码、预览）：\`pk-mod--sunk\`（面 \`color-panel-2\`）。

**尺寸**：内边距 14 / 18 / 16，模块之间 14–16，台阶 2 级 × 3px。`, {
    group: '外框', height: 250, sub: '平时、在跑、等你、出错、内凹',
    css: '  .demo { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; align-items: stretch; } .pk-mod p.t { font-size: 12px; color: var(--color-text-2); }',
    body: `<div class="demo"><section class="pk-mod">${m.modHead('PROJECTS', '3 个', '')}<p class="t">平时：外层 color-line</p></section><section class="pk-mod pk-mod--run">${m.modHead('TASK', '在跑 · 02:14', '3/4')}<p class="t">在跑：边是 color-cyan-line</p></section><section class="pk-mod pk-mod--wait">${m.modHead('TASK', '等你', '')}<p class="t">等你：边是 color-warn-line</p></section><section class="pk-mod pk-mod--err">${m.modHead('TASK', '出错', '')}<p class="t">出错：边是 color-bad-line</p></section><section class="pk-mod pk-mod--sunk">${m.modHead('SUMMARY', '', '6')}<p class="t">内凹：面是 color-panel-2</p></section><section class="pk-mod">${m.modHead('CHANGES', '+86 −132', '5')}<p class="t">模块头：[ LABEL ] · 小字 · 数</p></section></div>`,
  });

  add('Ask', `# Ask

停下来问你的卡片：模型跑到一半要你定的时候，卡片占住输入框的位置，答完输入框才回来。学 Claude Code：一张卡装得下问题、说明、选项（单选、多选、判断）、推荐；要用到的权限放进同一张卡一次批。

**写法**：一块 \`pk-mod pk-mod--wait pk-ask\`，里面依次是：
- 模块头 \`[ ASK ]\` + 谁在问（\`pk-who\` + 身份色点）+ 第几题 \`1/3\`；
- 问题 \`pk-ask-q\`（缝合像素 18）、说明 \`pk-ask-d\`；
- 选项 \`pk-ask-opts\` 里放 Choice（\`pk-opt\`），推荐的带 \`DEFAULT\`；
- 底下 \`pk-ask-foot\`：左边 \`LATER\`（没边的按钮），右边主按钮 \`NEXT\` / \`SUBMIT\`。
- 出现时边一格一格点亮：卡片里放 \`<span class="pk-card-edge"><i></i><i></i><i></i><i></i></span>\`（上 → 右 → 下 → 左，16 格 800ms），内容 \`pk-anim-reveal\` 露出。

**不要**：一条条弹窗问权限；高危的权限默认勾上。`, {
    group: '外框', height: 360, sub: 'Grok 停下来问你：单选 + 推荐 + 说明，一次答完',
    css: '  .pk-ask { width: 560px; }',
    body: `<div class="demo"><section class="pk-mod pk-mod--wait pk-ask pk-still">${m.edge()}<p class="pk-mod-head"><span class="pk-mod-label">ASK</span><span class="pk-who">${m.dot('grok')}GROK 停下来问你</span><span class="pk-mod-count" style="margin-left:auto">1/3</span></p><p class="pk-ask-q">${C.ask.q}</p><p class="pk-ask-d">${C.ask.d}</p><div class="pk-ask-opts">${m.opt('一起升到 4.1', { on: true, desc: '顺手改 6 个文件的类名', key: '1', tag: ' ' + m.tag('DEFAULT', 'rec') })}${m.opt('先不升', { desc: '这次任务照样能做完', key: '2' })}${m.opt('跑完再说', { desc: '跑完以后再问一次', key: '3' })}</div><div class="pk-ask-foot">${m.btn('LATER', { v: 'ghost' })}<span class="pk-sp"></span>${m.btn('NEXT', { v: 'primary' })}</div></section></div>`,
  });

  add('Tag', `# Tag

标签：一两个英文大写的词，一级台阶角。颜色就是意思。

**写法**：\`<em class="pk-tag pk-tag--new">NEW</em>\`
- \`--new\` 新文件（绿底，字 \`color-page\`）、\`--del\` 删了、\`--high\` 高危（红底）、\`--rec\` 推荐（青块）、\`--wait\` 等你（琥珀边 + 琥珀淡底）、\`--ok\` 通过（绿边绿字）；不加修饰是计数、灰标签（\`color-raised\`）。

**尺寸**：高 \`size-tag\` 19（文件树里 17），左右 6，字 12.5。`, {
    group: '状态', height: 96, sub: '新文件、删了、推荐、等你、高危、通过、计数',
    body: `<div class="demo">${m.tag('NEW', 'new')}${m.tag('DEL', 'del')}${m.tag('DEFAULT', 'rec')}${m.tag('WAIT', 'wait')}${m.tag('HIGH', 'high')}${m.tag('PASS', 'ok')}${m.tag('2/3')}${m.tag('EDIT')}</div>`,
  });

  add('Progress', `# Progress

任务的进度和读数：方块进度（\`pk-blocks\`）、状态字（\`pk-state\`：RUN / WAIT / DONE）、大号读数（\`pk-readout\`：计时、文件数）。

**写法**：
- 方块：\`<div class="pk-blocks" style="--pk-n:28"><i class="is-on"></i>…<i class="is-head"></i><i></i>…</div>\`。亮着的 \`is-on\` 慢慢呼吸（亮度，48 格），正在走的 \`is-head\` 闪（16 格）；停下来等你时头那一格换成 \`is-wait\`（琥珀），并加 \`pk-blocks--still\` 让亮块不再呼吸；做完也加 \`pk-blocks--still\`。亮块之间错开 70ms 呼吸（\`animation-delay\`）。
- 状态字：\`<span class="pk-state">RUN</span>\`，\`--wait\`、\`--done\`、\`--err\`、\`--off\`。深色是发光的字；浅色自动变成一块底（青块、琥珀淡底……）。
- 读数：\`<b class="pk-readout">02:14</b>\`（计时 54），\`pk-readout--num\`（26，文件数、百分比）；等你、做完时加 \`--wait\`、\`--done\`。

**样子**：亮格 \`color-cyan-block\` 带 \`shadow-glow-block\`（深色），没亮的格 \`color-block-off\`，格间 3，高 14（小的 12）。`, {
    group: '状态', height: 250, sub: '在跑、停下来等你、做完；状态字和读数',
    css: '  .demo { display: grid; grid-template-columns: 120px 1fr; gap: 12px 18px; align-items: center; } .rd { display: flex; align-items: baseline; gap: 16px; }',
    body: `<div class="demo"><span class="pk-state">RUN</span>${m.blocks(28, 13)}<span class="pk-state pk-state--wait">WAIT</span>${m.blocks(28, 15, { wait: true, still: true })}<span class="pk-state pk-state--done">DONE</span>${m.blocks(28, 28, { still: true })}<span class="pk-state pk-state--off">UNDONE</span>${m.blocks(28, 0, { head: false })}<span></span><div class="rd"><b class="pk-readout">02:14</b><b class="pk-readout pk-readout--num">6</b><b class="pk-readout pk-readout--num pk-readout--done">+86</b></div></div>`,
  });

  add('Wait', `# Wait

等待的小东西：3×3 点阵转圈（\`pk-twinkle\`，短的等待、页签上那边在跑）、光标（\`pk-caret\`，输入框有焦点）、7×7 点阵勾（\`pk-dotcheck\`，做完了）。

**写法**：
- 转圈：\`<span class="pk-twinkle">\` + 9 个 \`<i></i>\`（24 格一圈，steps）。
- 光标：\`<i class="pk-caret"></i>\`（20 格闪一次）。
- 点阵勾：\`<span class="pk-dotcheck">\` + 49 个 \`<i>\`，亮的格加 \`is-on\`（7×7，从左下到右上的勾，照预览抄）。

**减弱动态效果**：转圈停成满格、光标常亮。`, {
    group: '状态', height: 120, sub: '点阵转圈、光标、点阵勾',
    css: '  .wt { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--color-text-2); }',
    body: `<div class="demo" style="gap:32px"><p class="wt">${m.twinkle()}<span>Muse 在读 units.ts…</span></p><p class="wt" style="font-family:var(--font-code);font-size:var(--text-code);color:var(--color-text)"><span class="pk-prompt">›</span>把三个对话框合成一个<i class="pk-caret"></i></p><p class="wt">${m.dotcheck()}<span>做完了 · 6 个文件</span></p></div>`,
  });

  add('Steps', `# Steps

任务的步骤：一行一步，前面一格是状态，后面是名字（缝合像素）、时间（点阵字）和一句说明。

**写法**：\`<ol>\` 里每一步 \`<li class="pk-step pk-step--run">\`：\`<span class="pk-step-node">\`（状态）+ \`<p class="pk-step-head"><b class="pk-step-name">…</b><span class="pk-step-time">…</span></p>\` + \`<p class="pk-step-desc">…</p>\`。
- \`--ok\` 做完（绿勾 \`pk-i--check\`）、\`--run\` 在跑（\`<span class="pk-run"></span>\`：弹扣一下 + 一圈光，28 格一次；名字带一点白光，时间是青字）、\`--wait\` 等你（琥珀问号，闪）、\`--todo\` 还没到（空心方格，提示色）、\`--fail\` 失败（红叉）。
- 只有在跑的那一步动。`, {
    group: '状态', height: 290, sub: '做完、在跑、等你、还没到、失败',
    css: '  ol { width: 560px; }',
    body: `<div class="demo"><ol>${m.step('ok', 'Muse 写规范', { time: '48s', desc: '读了 12 个文件，列出 6 条要改的' })}${m.step('ok', 'Grok 改 Composer.tsx、App.tsx', { time: '1:02', desc: '新建 SettingsSheet.tsx，删掉两个旧对话框' })}${m.step('run', 'Grok 跑 pnpm check', { time: '0:24', desc: '第一次有报错，Grok 在改' })}${m.step('wait', 'Grok 问你：Tailwind 要不要升', { time: 'WAIT' })}${m.step('todo', '验证并总结')}${m.step('fail', '跑 e2e', { time: '0:12', desc: '少了 playwright，没装' })}</ol></div>`,
  });

  add('Toast', `# Toast

提示条和状态条。
- **提示条**（\`pk-toast\`）：反色的一句话（\`color-text\` 底、\`color-page\` 字），浮在窗口底部中间，几秒后消失；出现用 \`pk-anim-reveal-s\`（4 格）。写一句话说清楚为什么：「同一个项目一次跑一个任务」。
- **状态条**（\`pk-bar\`）：模块顶上一条，44 高，前面图标、中间一句话、右边一个按钮。等你（默认，琥珀边 + \`color-warn-soft\`）、通过 \`pk-bar--ok\`、失败 \`pk-bar--bad\`。

**写法**：\`<div class="pk-toast"><i class="pk-i pk-i--bang pk-i--12"></i><span>…</span></div>\`；\`<div class="pk-bar"><i class="pk-i pk-i--ask"></i><span class="pk-bar-text">…</span><button class="pk-btn pk-btn--warn">BACK</button></div>\`。`, {
    group: '状态', height: 260, sub: '提示条；状态条：等你、通过、失败',
    css: '  .demo { flex-direction: column; align-items: stretch; } .demo > .pk-toast { align-self: flex-start; }',
    body: `<div class="demo">${m.toast('同一个项目一次跑一个任务')}${m.bar('任务停下来问你：Tailwind 要不要一起升到 4.1', { action: m.btn('BACK', { v: 'warn' }) })}${m.bar('pnpm check 通过 · 6 个文件', { v: 'ok', ic: 'check' })}${m.bar('跑 e2e 失败：少了 playwright', { v: 'bad', ic: 'x', action: m.btn('RETRY', { v: 'danger', sm: true }) })}</div>`,
  });

  add('Who', `# Who

谁在干：身份色点（\`pk-dot\`，7 像素的方点）+ 名字。Muse 紫 \`pk-dot--muse\`、Grok 橙 \`pk-dot--grok\`、API 模型蓝 \`pk-dot--api\`。色点只当标记，不写字、不当底色。

**写法**：\`<span class="pk-who"><i class="pk-dot pk-dot--grok"></i>GROK</span>\`（名字点阵字时放在点阵字的容器里）。`, {
    group: '状态', height: 90, sub: 'Muse、Grok、API',
    css: '  .pk-who { font-family: var(--font-dots); font-weight: 900; font-size: 13px; letter-spacing: .08em; color: var(--color-text-2); }',
    body: `<div class="demo" style="gap:24px"><span class="pk-who">${m.dot('muse')}MUSE</span><span class="pk-who">${m.dot('grok')}GROK</span><span class="pk-who">${m.dot('api')}DEEPSEEK V3</span></div>`,
  });

  add('Icon', `# Icon

界面图标：8×8 像素格，一格 2 像素画成 16。CSS 遮罩画的，颜色跟着字（\`currentColor\`）。

**写法**：\`<i class="pk-i pk-i--send"></i>\`；小处加 \`pk-i--12\`（列表行、小按钮、提示条），大处 \`pk-i--24\`（空状态）。只有图标的按钮写 \`aria-label\`。

**有这些**：${Object.keys(GLYPHS).map((n) => `\`${n}\` ${GLYPH_NAMES[n]}`).join('、')}。

**不要**：混别的图标集；用 emoji；把图标缩到 12 以下。`, {
    group: '图标', height: 190, sub: `${Object.keys(GLYPHS).length} 个，16 / 12 / 24`,
    css: '  .demo { display: grid; grid-template-columns: repeat(9, 1fr); gap: 10px 8px; } figure { display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 0; } figcaption { font-family: var(--font-code); font-size: var(--text-code); color: var(--color-text-3); } .big { color: var(--color-cyan-text); }',
    body: `<div class="demo">${Object.keys(GLYPHS).map((n) => `<figure>${m.icon(n)}<figcaption>${n}</figcaption></figure>`).join('')}</div>`,
  });

  add('Motion', `# Motion

动效零件：一格 50ms，一步一格。类名直接加在元素上，减弱动态效果时自动只留最后的样子。

| 类 | 动作 | 时长 |
| --- | --- | --- |
| \`pk-anim-reveal-s\` | 小东西出现（提示条、标签、菜单），从上往下露 | 4 格 200ms |
| \`pk-anim-reveal\` | 露出（卡片内容、回答一段段出来） | 8 格 400ms |
| \`pk-anim-dissolve\` | 溶掉（撤销时改动一行行消失），从左往右收 | 8 格 400ms |
| \`pk-anim-flash\` | 做完闪两下 | 18 格 900ms |
| \`pk-scan\` | 扫一次：放在 \`position:relative; overflow:hidden\` 的模块里，一道光从左扫到右 | 18 格 900ms |
| \`pk-scan--loop\` | 在跑时扫描，2.8 秒一次 | 56 格 |
| \`pk-card-edge\` | 卡片的边点亮：上 → 右 → 下 → 左 | 16 格 800ms |

在跑的那一步（\`pk-run\`）、方块进度（\`pk-blocks\`）、转圈和光标见 Steps、Progress、Wait。同一时刻只有一道扫描。`, {
    group: '动效', height: 200, sub: '露出、溶掉、扫一次、卡片的边、做完闪两下（循环播放）',
    css: '  .demo { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; } .pk-mod { overflow: hidden; height: 112px; } .pk-mod p { font-size: 12px; color: var(--color-text-2); } .pk-mod * { animation-iteration-count: infinite !important; } .pk-mod .pk-card-edge i, .pk-mod .pk-anim-reveal { animation-duration: 2s !important; }',
    body: `<div class="demo"><section class="pk-mod">${m.modHead('REVEAL', '8 格')}<p class="pk-anim-reveal">读了 12 个文件，列出 6 条要改的；第一条是把三个对话框合成一个面板。</p></section><section class="pk-mod pk-mod--run">${m.modHead('SCAN', '18 格')}<span class="pk-scan"></span><p>扫一次：发出、等你、完成、撤销</p></section><section class="pk-mod">${m.edge()}${m.modHead('EDGE', '16 格')}<p>停下来问你、高危卡片出现</p></section></div>`,
  });

  return C2;
}

// ---------- 封面：名字、色块、方块进度 ----------
export function cover() {
  // 方块进度：16 格，前 11 格亮、第 12 格是头、后 4 格没亮；放在模块里，离边 16
  const bx = 200, by = 176, bw = 9, gap = 3;
  const blocks = Array.from({ length: 16 }, (_, i) => `<rect class="${i < 12 ? 'blk' : 'off'}" x="${bx + i * (bw + gap)}" y="${by}" width="${bw}" height="14"/>`).join('\n');
  const step = (x, y, w, h, s, cls) => `<polygon class="${cls}" points="${[[x, y + 2 * s], [x + s, y + 2 * s], [x + s, y + s], [x + 2 * s, y + s], [x + 2 * s, y], [x + w - 2 * s, y], [x + w - 2 * s, y + s], [x + w - s, y + s], [x + w - s, y + 2 * s], [x + w, y + 2 * s], [x + w, y + h - 2 * s], [x + w - s, y + h - 2 * s], [x + w - s, y + h - s], [x + w - 2 * s, y + h - s], [x + w - 2 * s, y + h], [x + 2 * s, y + h], [x + 2 * s, y + h - s], [x + s, y + h - s], [x + s, y + h - 2 * s], [x, y + h - 2 * s]].map((p) => p.join(',')).join(' ')}"/>`;
  return `<!-- @dsCard height=320 -->
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${TITLE}</title>
<style>
  html, body { margin: 0; height: 100%; }
  body { background: var(--color-page); color: var(--color-text); font-family: var(--font-name); overflow: hidden; }
  .cover { position: relative; height: 320px; overflow: hidden; }
  .art { position: absolute; top: 0; left: 480px; width: 480px; height: 320px; overflow: hidden; }
  .art svg { display: block; width: 480px; height: 320px; }
  .cyan { fill: var(--color-cyan); }
  .mod { fill: var(--color-line-strong); }
  .face { fill: var(--color-panel); }
  .warn { fill: var(--color-warn); }
  .blk, .head { fill: var(--color-cyan-block); }
  .off { fill: var(--color-block-off); }
  .words { position: absolute; left: 30px; bottom: 28px; max-width: 440px; }
  .name { margin: 0; font-family: var(--font-name); font-size: 120px; line-height: .95; font-weight: 400; color: var(--color-text); }
  .tag { margin: 12px 0 0 4px; font-family: var(--font-body); font-size: 14px; line-height: 20px; color: var(--color-text-2); }
</style>
</head>
<body>
<div class="cover">
<div class="art" aria-hidden="true">
<svg viewBox="0 0 480 320" width="480" height="320">
<!--
  blocks      color-cyan 128×264 slab bleeding off the top (the one colour that glows, the identity) · color-line-strong 216×168 module with a color-panel face inset 6 (a pk-mod, the structure) · color-warn 30×30 once, off the module's lower right corner (it only means 等你) — about a quarter of 960×320
  arrangement the three columns of the app: a narrow left slab, a wider module beside it on the width-gap 16 gutter, the small amber square waiting just outside the module's corner
  pattern     the literal motif, the 方块进度: 16 blocks 9×14 at a 3px gap (pk-blocks), 12 lit in color-cyan-block, 4 dark in color-block-off, inside the module space-8 16 from its edge — Peck shows work as a row of lit blocks, not a bar
  scales      sides in space multiples (gutter width-gap 16, inset space-3 6); corners are the pixel steps, 2 levels × step-module 3 scaled ×2 = 6 for the cover; block gap 3 and height 14 from pk-blocks
-->
${step(40, -24, 128, 264, 6, 'cyan')}
${step(184, 40, 216, 168, 6, 'mod')}
${step(186, 42, 212, 164, 6, 'face')}
${blocks}
${step(408, 216, 30, 30, 2, 'warn')}
</svg>
</div>
<div class="words">
  <h1 class="name">${TITLE}</h1>
  <p class="tag">点阵终端 × 深海：青色是全屏唯一会发光的颜色。</p>
</div>
</div>
</body>
</html>
`;
}

/** 方案 design-system/ 下的源文件：{ 相对 design-system/ 的路径: 内容 }。published.json 另写（上传以后）。 */
export function sourceFiles() {
  const f = {
    'system.json': J(systemJson()),
    'tokens.config.json': J(tokensConfig()),
    'README.md': readme(),
    'bundle.css': bundleCss(),
    'components/Cover/preview.html': cover(),
    'assets/App/README.md': `# App\n\nApp 图标。底板占画面 7/8，深海渐变，每个尺寸一格都是整像素：\n\n- \`peck-j2.svg\` — 主图标 J2，32 格的鸟；256、512、1024 用（一格 7、14、28 像素），带一圈光和底板阴影。\n- \`peck-j2-128.svg\`、\`peck-j2-64.svg\`、\`peck-j2-32.svg\` — 照 J2 缩的 28 格鸟；128、64、32 用（一格 4、2、1 像素），64 以上带光。\n- \`peck-j2-16.svg\` — 14 格的鸟，16 用。\n- \`peck-a3.png\` — 现在的图标润色过的（A3），设置里能换成它；只出 Dock 用的 128 以上。\n\n颜色都写死在图里（青 #00E5FF、冠羽 #A8F6FF），不跟明暗变。\n`,
    'assets/MenuBar/README.md': `# MenuBar\n\n菜单栏模板图，18pt。只有一种墨：黑（#000）+ 透明，macOS 按菜单栏的明暗自己上色，所以在这里的深色底上看不清是正常的。\n\n- \`menubar-idle.svg\` — 空闲：只有鸟（14 格，和 16 像素的 App 图标同一只，一格 1pt）。\n- \`menubar-run-1.svg\`、\`-2\`、\`-3\` — 在跑：右边三颗点轮流亮，每帧 300ms。\n- \`menubar-wait.svg\` — 等你：一个问号，不动。\n- \`menubar-count-3.svg\` — 在跑 N 个（v0.7 起），数字 3×5 像素，2–9。\n`,
  };
  for (const [name, { readme: r, preview: p }] of Object.entries(components())) {
    f[`components/${name}/README.md`] = r + '\n';
    f[`components/${name}/preview.html`] = p;
  }
  return f;
}
