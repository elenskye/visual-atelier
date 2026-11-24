// 第 3 步 · 方案文件：照 visual-atelier 的 schemes/<方案>/ 写（tokens/ 五个文件、type/fonts.json、marks/、scheme.json、DESIGN.md）。
// 都从 tokens.mjs 和 icon.mjs 出；导入时 project/scheme/ 整个复制成 schemes/peck/，状态还是 draft，站主批了第 4 步再改 approved。
import { GROUPS, ROLES, FROM, NEW, PAIRS, CHECK, LEVELS, FONT, TYPE, SPACE, SIZE, LAYOUT, STEPS, GLOW, TICK, MOTIONS, MS, ICON } from './tokens.mjs';
import { createHash } from 'node:crypto';
import { markFiles, MARKS } from './icon.mjs';

const J = (o) => JSON.stringify(o, null, 2) + '\n';
const px = (v) => (typeof v === 'number' ? `${v}px` : v);

function colorJson() {
  const roles = {};
  for (const g of GROUPS) for (const [id, name, use, dark, light] of g.roles) roles[id] = { label: name, group: g.name, use, light, dark };
  return { $note: 'Peck 的语义角色，深浅各一套（第 3 步定值；深色为过 APCA 改过的几处记在 history）。半透明的只有 grid、cyan-scan 两个图案用的，其余都是在模块面上混好的实色。', roles, aliases: { focus: 'cyan-text' } };
}
function contrastJson() {
  return { $note: `要通过的 APCA 对比度（Lc 绝对值）。Peck 的字只有 12–12.5 号，门槛比 Vermilion 高：${LEVELS.map(([n, t]) => `${t} ≥ ${n}`).join('；')}。模块外框 line 是装饰，不查。`, pairs: PAIRS.map((p) => ({ fg: p.fg, bg: p.bg, min: p.min, use: `${p.use} / ${p.bg}` })) };
}
function scaleJson() {
  return {
    $note: '非颜色 token：字、间距、控件尺寸、布局宽、像素阶梯角、发光。没有圆角（radius 留空），角都是像素台阶（step）。发光只在深色里有。',
    width: Object.fromEntries(LAYOUT.filter(([, , v]) => typeof v === 'number').map(([k, , v]) => [k, px(v)])),
    space: Object.fromEntries(Object.entries(SPACE).map(([k, v]) => [k, px(v)])),
    radius: {},
    step: Object.fromEntries(STEPS.map(([id, use, levels, size]) => [id, { levels, size: px(size), use }])),
    size: Object.fromEntries(SIZE.map(([id, , v]) => [id, px(v)])),
    font: FONT,
    text: Object.fromEntries(TYPE.map(([id, , , size]) => [id, px(size)])),
    leading: Object.fromEntries(TYPE.map(([id, , , , lh]) => [id, px(lh)])),
    type: Object.fromEntries(TYPE.map(([id, name, f, size, lh, w, use]) => [id, { name, font: f, size, leading: lh, weight: w, use }])),
    shadow: Object.fromEntries(GLOW.map(([id, use, v]) => [`glow-${id}`, { light: 'none', dark: v, use }])),
  };
}
function motionJson() {
  const exp = MOTIONS.filter((m) => m[6] === 'expressive');
  const reg = {};
  for (const [id, label, trigger, n, way, loop] of exp) reg[id] = loop ? { tier: 'expressive', label, trigger, ticks: n, easing: way, loop: true, loopMs: MS(n) } : { tier: 'expressive', label, trigger, ticks: n, easing: way, maxMs: MS(n), loop: false };
  const calm = MOTIONS.filter((m) => m[6] === 'calm');
  return {
    $note: `一格 ${TICK}ms：一步一格（steps），位移一格一格跳，不用平滑缓动；时长都是整格。光（扫描、亮块呼吸）可以平滑，它不是东西。减弱动态效果时只留最后的样子。`,
    tickMs: TICK,
    tiers: {
      calm: { use: '控件的小动静：状态立刻变；出现、露出、溶掉 4–8 格。', stateMs: [0, 0], enterMs: MS(8), enterEasing: 'steps', maxMsWithoutSignature: MS(8), forbid: ['loop', 'parallax', 'smooth-translate', 'page-transition'] },
      expressive: { use: '发出、等你、做完、撤销这几个时刻，和在跑、等待时的循环；要登记。', maxSingleMs: 1000, registeredSurfacesOnly: true, loopRules: '只有光标、点阵转圈、进度块、在跑那一步、在跑时的扫描能循环；减弱动态效果时停下', registeredSurfaces: exp.map((m) => m[0]) },
    },
    calm: Object.fromEntries(calm.map(([id, label, trigger, n, way]) => [id, { label, trigger, ticks: n, ms: MS(n), easing: way }])),
    registeredSurfaces: reg,
    calmExceptions: {},
  };
}
function targetsJson() {
  const colorVars = Object.fromEntries(Object.keys(ROLES).map((id) => [id, `--color-${id}`]));
  return {
    $note: '网页方言（Peck 是 Tauri，界面就是网页）。明暗跟随系统：Peck 按系统的明暗在根上写 data-theme。',
    web: { colorVars, aliasVars: { '--color-focus': 'var(--color-cyan-text)' }, light: { selector: ':root', colorScheme: 'light' }, dark: { selector: ":root[data-theme='dark']", colorScheme: 'dark' } },
    pending: ['第 3 步第一轮要站主定的 3 件（DESIGN.md §7）'],
  };
}
function fontsJson() {
  return {
    $note: 'Peck 用到的字体。四个都是 OFL，可以打包进 App、可以转曲线；苹方是系统字体，只作中文后备。',
    web: [
      { family: 'Fusion Pixel 12', name: '缝合像素 12', stack: 'name', use: '名字：任务名、步骤名、问题、选项、项目名；标题', sizes: [12, 18, 24], license: 'OFL-1.1', outline: true, note: '只用 12 的整数倍字号' },
      { family: 'IBM Plex Sans', name: 'Plex Sans', stack: 'body', use: '说明、正文、提示（中文退到苹方）', weights: [400, 600], license: 'OFL-1.1', outline: true },
      { family: 'Departure Mono', name: 'Departure Mono', stack: 'code', use: '代码、路径、命令、文件名', sizes: [11, 22], license: 'OFL-1.1', outline: true, note: '11 号是「字号不小于 12」唯一的例外（站主 2026-11-10 定）' },
      { family: 'Doto', name: 'Doto', stack: 'dots', use: '数字、标签、按钮、模块头：英文大写', weights: [900], license: 'OFL-1.1', outline: true },
    ],
    native: [{ family: 'PingFang SC', name: '苹方', use: 'Plex Sans、缝合像素没有的字', license: 'macOS 系统字体，授权归 Apple', outline: false }],
    notes: ['缝合像素 12 和 Departure Mono 的文件在画布附件里（站主 2026-11-09 同意下载）；导入时登记进 docs/licensing.md。'],
  };
}
function manifestJson(marks) {
  const sha = (t) => createHash('sha256').update(t).digest('hex');
  return { assets: MARKS.map(([id, title, file, notes]) => ({
    id, title, file: file.replace(/^marks\//, ''), kind: 'svg', status: 'proposed', colorMode: file.includes('menubar') ? 'currentColor' : 'fixed',
    source: { generator: 'Peck Explore 画布的 project/src/s3/icon.mjs', rules: 'DESIGN.md §6', note: '第 3 步第一轮生成，不要手改' }, notes, sha256: sha(marks[file]),
  })) };
}

function designMd() {
  const roleRows = GROUPS.map((g) => g.roles.map(([id, name, use, dark, light]) => `| \`${id}\` | ${name} | \`${dark}\` | \`${light}\` | ${use}${FROM[id] ? '（深色第 3 步改过）' : ''}${NEW.includes(id) ? '（第 3 步新加）' : ''} |`).join('\n')).join('\n');
  const lv = LEVELS.map(([n, t]) => `${t} ≥ ${n}`).join('；');
  const typeRows = TYPE.map(([id, name, f, size, lh, w, use]) => `| ${name} | ${{ name: '缝合像素 12', body: 'Plex Sans + 苹方', code: 'Departure Mono', dots: 'Doto 900' }[f]} | ${size} / ${lh} | ${use} |`).join('\n');
  const motionRows = MOTIONS.map(([id, label, when, n, way, loop, tier]) => `| \`${id}\` | ${label} | ${when} | ${n} 格（${MS(n)}ms） | ${way} | ${tier}${loop ? '，循环' : ''} |`).join('\n');
  const nPass = CHECK.filter((c) => c.pass).length;
  return `# DESIGN.md（Peck）

只保留已定视觉基线与待确认设计点。任何视觉改动前必须完整阅读。草稿：第 3 步第一轮（2026-11-10），站主批了第 4 步（Design System）以后状态改 approved。外框怎么放（三栏、右栏四个页签、卡片、权限三档）在 \`peck-rules.md\`（66 条，现在在画布的 project/ 下，导入时一起放进来），这份只管样子。

## 1. 方向

- 给谁用、用在哪：站主自己的 Mac 上的 Coding Agent。三栏：项目和任务、对话、右栏（改动 / ONE SHOT / 文件 / 终端）。
- 气质：点阵终端（第 1 步方向 C）× 深海（P3）。青色锐利、会发光，配色清爽；动效像 LED 点阵一格一格亮。
- 反关键词：VSCode 那样一层层灰面板 + 满屏等宽字；装饰性的循环动效；圆角和柔和阴影。

## 2. 色彩

34 个语义角色，深浅各一套（\`tokens/color.json\`）。深色：底是深海，青 \`#00E5FF\` 是全屏唯一会发光的颜色；浅色：冷白底，青换成 L2 深青 \`#007A94\`，没有发光。

| 角色 | 名字 | 深色 | 浅色 | 用在哪 |
| --- | --- | --- | --- | --- |
${roleRows}

- 改色须过 APCA（\`tokens/contrast.json\`，${PAIRS.length} 对，深浅都查，现在 ${nPass} 对都过）。门槛：${lv}。
- 同一时刻只有一个青色主按钮；颜色只留给意思（绿新增、红删除、青在发生、琥珀等你），代码不按语法上色。
- 身份色：Muse 紫、Grok 橙、API 蓝，只用作 7 像素的色点。

## 3. 字体与排版

四种字各管一件事（\`type/fonts.json\`，都是 OFL）：

| 角色 | 字体 | 字号 / 行高 | 用在哪 |
| --- | --- | --- | --- |
${typeRows}

- 字号不小于 12；唯一的例外是代码用的 Departure Mono 11。像素字只用整数倍字号（缝合像素 12、18、24）。
- Doto 只写英文大写和数字；中文不进 Doto。

## 4. 图形语言

- **像素阶梯角**：${STEPS.map(([id, use, lv, st]) => `${use} ${lv} 级 × ${st}px`).join('；')}。没有圆角。
- **模块两层**：外层是边线色，里层是面板色，两层都切台阶角；状态靠外层换色（在跑青、等你琥珀、出错红），同一时刻只有一块模块描彩边。
- **LED 点阵孔**：页面底上 8 像素一颗的孔（\`grid\`）。
- **发光**：只在深色，只给青色（点、进度块、大号青字、计时、青块上的字）。浅色一律没有。
- **图标**：8×8 像素格画成 16（小处 12、大处 24），不混别的图标集。
- **控件的状态**（第 3 步定）：悬停时有边的控件边亮成青线、里面抬起一档，青块、琥珀、红底亮一档；键盘焦点是控件里面内缩 3 像素一圈 1 像素青点线（像素角会切掉外面的光圈）；按下往下沉 1 像素、发光收起；不能用是提示色字、内凹底、没有发光。
- **尺寸**：${SIZE.map(([, nm, v]) => `${nm} ${v}`).join('、')}；间距只用 ${Object.values(SPACE).join('、')}；三栏 288 / 自适应 / 336，栏间 16。

## 5. 动效

一格 ${TICK}ms，一步一格（steps）；位移一格一格跳，不用平滑缓动；时长都是整格。光（扫描、亮块呼吸）可以平滑。

- \`calm\`：控件的小动静，状态立刻变；出现、露出、溶掉 4–8 格（≤ 400ms），不循环。
- \`expressive\`：要登记；发出、等你、做完、撤销这几个时刻单次 ≤ 1 秒；在跑和等待时能循环。
- 减弱动态效果：只留最后的样子；光标常亮，转圈停成满格，扫描不出现。

| id | 动作 | 什么时候 | 时长 | 走法 | 档位 |
| --- | --- | --- | --- | --- | --- |
${motionRows}

## 6. 标志与图标

- **App 图标 J2**（主图标，Dock、Finder、打包）：${ICON.grid} 格像素鸟，底板内缩 ${ICON.inset} 格（1024 上 832，81%，Apple 的格子 824），圆角 ${ICON.radius * 100}%，深海渐变 ${ICON.plate.join(' → ')}；鸟青 ${ICON.bird}、冠羽 ${ICON.crest}，眼睛空着。64 以上加一圈光，128 以上底板下一点阴影；32 不加光；16 用手画的 16 格。
- **A3**（现在的图标润色，设置里能换）：位图，只出 Dock 用的 128 以上；导出时底板缩到 81%，和 J2 一样大。
- **菜单栏模板图**：18pt，16 格的同一只鸟，黑 + 透明由系统上色。四个状态：空闲、在跑（三颗点轮流亮）、等你（问号）、在跑 N 个（v0.7 起）。
- 文件在 \`marks/\`（\`marks/manifest.json\`），导入后由 visual-atelier 出 .icns 和 PNG。

## 7. 待确认

第 3 步第一轮要站主定：

1. 深色里说明字、提示字、红字、控件边为过 APCA 亮了一档，样子认不认。
2. App 图标照 Apple 的格子：鸟在底板里大一点（81%），换来每个尺寸都是整像素；还是保留第 1 步的比例（大尺寸边缘会糊一点）。
3. 键盘焦点画成控件里面一圈青点线（不是外面的光圈）。
`;
}

/** 方案目录下的全部文件：{ 相对路径: 内容 }。 */
export function schemeFiles() {
  const marks = Object.fromEntries(Object.entries(markFiles()).map(([p, svg]) => [p, svg + '\n']));
  const f = {
    'scheme.json': J({ name: 'peck', title: 'Peck', status: 'draft', version: '0.1.0', motion: { default: 'calm', expressive: 'registered-surfaces-only' }, consumers: ['peck'] }),
    'DESIGN.md': designMd(),
    'tokens/color.json': J(colorJson()),
    'tokens/contrast.json': J(contrastJson()),
    'tokens/scale.json': J(scaleJson()),
    'tokens/motion.json': J(motionJson()),
    'tokens/targets.json': J(targetsJson()),
    'type/fonts.json': J(fontsJson()),
    'marks/manifest.json': J(manifestJson(marks)),
    'history/apca-changes.json': J(Object.entries(FROM).map(([role, v]) => ({ role, mode: 'dark', from: v.dark, to: ROLES[role].dark, why: v.why }))),
  };
  Object.assign(f, marks);
  return f;
}
