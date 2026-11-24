// 第 2 步 · 第三轮 · 外框规则第二版：第二轮的 49 条，落站主 11-10 定的三件事（权限 PLAN / EDIT / AUTO、
// AUTO 时删文件和改项目外的还问、代码可以是 Departure Mono 11），再拿右栏新加的三个模块（ONE SHOT、FILES、TERM）做迁移测试。
// n: 'new' = 这一轮补的；'chg' = 这一轮改的。第二轮的标记不再显示（那一页还在画布上）。
import { GROUPS as G2 } from '../s2b/rules.mjs';

// 这一轮改写的条目：[编号, 新的话]
const CHG = {
  L2: '三栏：左 288 放项目和任务，中间自适应放新任务和对话，右 336 放右栏四个模块（R1）；栏间 16。',
  K1: '按钮高 34，切两级台阶（每级 2）；同一时刻只有一个青色主按钮：有几个输入框时（任务、ONE SHOT、TERM），只有正在写的那个的 SEND 或 RUN 亮。',
  T5: '字号不小于 12；唯一的例外是代码用的 Departure Mono 11（站主 11-10 定）。像素字只用整数倍字号。',
  I1: '发任务 = 一句话 + 谁来干 + 权限（PLAN / EDIT / AUTO，默认 EDIT）；⌘↵ 发出。',
  I2: '高危的事开始前一张卡一次批：EDIT 时是删文件、联网装依赖、改项目外的文件；AUTO 时只剩删文件和改项目外的（推送也算项目外）。项目外的默认不勾。',
};
// 这一轮补的：[组, 编号, 话]
const ADD = [
  ['K', 'K9', '模块头和预览头里的小按钮：26 高、没有底，一两个英文词；只有图标的（EXPAND）26 见方，带名字给读屏。'],
  ['C', 'C5', '代码不按语法上色：颜色只留给意思（绿新增、红删除、青在发生、琥珀等你），注释和行号用暗字。'],
  ['I', 'I8', '权限三档：PLAN 只读，读代码、写计划，不改文件、不跑命令；EDIT（默认）改文件、跑命令不问；AUTO 装依赖、联网也不问。'],
];
// 右栏，新的一组
const R = { k: 'R', name: '右栏', en: 'SIDE', rules: [
  ['R1', '右栏顶上一条页签：CHANGES / ONE SHOT / FILES / TERM，一次开一个；页签是分段（K3）。', 'new'],
  ['R2', '切走以后，页签上说那边有新东西：CHANGES 写改了几个文件，ONE SHOT 答完一颗点，TERM 命令在跑转圈、跑完一颗绿点或红点。从不自己切走你在看的页签。', 'new'],
  ['R3', '每个模块头右边一个 EXPAND，展开到宽栏（L6），再点收回右栏。展开时任务停下来等你，宽栏顶上一条琥珀提示，点 BACK 收回去。', 'new'],
  ['R4', 'ONE SHOT 问一句答一句：不读项目、不改文件、不进任务的记录；要它看什么，用 + 带上（任务进度、FILES 里选的文件、终端输出），带上的写在问题下面。', 'new'],
  ['R5', 'ONE SHOT 走 API：答完写这一问花了多少（算进花费上限）；回答只给 COPY 和 TO TASK（放进中间的输入框）。', 'new'],
  ['R6', 'FILES 只看不改：照忽略规则藏起 node_modules 这些，写一句藏了几个；这个任务改过的文件标法和 CHANGES 一样（NEW、DEL、+ −）。', 'new'],
  ['R7', 'FILES 预览：带行号；改过的行左边一条绿，删掉的文件预览删之前的样子并写明撤销能放回来；图片、二进制、太大的不预览，写一句为什么。', 'new'],
  ['R8', 'TERM 是你自己的终端，在项目根目录：不经过权限三档、不进模型上下文；Agent 跑的命令在中栏步骤里看，不进这里。', 'new'],
  ['R9', 'TERM 每条命令跑完写 EXIT 码和用时，不是 0 就红；在跑时输入行暗着，旁边只有 STOP（I6）。任务在跑时，输入行下面写清你改的文件也算进这次改动。', 'new'],
  ['R10', '模块之间只靠「带上」和「跳过去」连：FILES 的 ONE SHOT、DIFF，TERM 失败那条的 ONE SHOT，都是切页签，不开新窗口。', 'new'],
] };

export const GROUPS = G2.map((g) => {
  const rules = g.rules.map(([id, t]) => (CHG[id] ? [id, CHG[id], 'chg'] : [id, t]));
  for (const [k, id, t] of ADD) if (k === g.k) rules.push([id, t, 'new']);
  return { ...g, rules };
});
GROUPS.splice(GROUPS.findIndex((g) => g.k === 'M') + 1, 0, R);

export const RULES = GROUPS.flatMap((g) => g.rules.map(([id, t, n]) => ({ id, t, n: n || '', g: g.k })));
export const COUNT = { all: RULES.length, nw: RULES.filter((r) => r.n === 'new').length, chg: RULES.filter((r) => r.n === 'chg').length };

// 站主 11-10 定的三件事，落到了哪
export const DECIDED = [
  ['权限三档', 'PLAN / EDIT / AUTO', '输入框旁的分段改成 PLAN / EDIT / AUTO，默认 EDIT', ['I1', 'I8']],
  ['AUTO 还问什么', '删文件、改项目外的还问', 'AUTO 时装依赖、联网不问；删文件、改项目外的（推送也算）照样一张卡批', ['I2']],
  ['代码字号', 'Departure Mono 11 可以', '「字号不小于 12」只有这一个例外', ['T5']],
];
// 权限三档各自问什么（结果板上的小表）
export const TIERS = [
  ['PLAN', '只读', ['不改', '不跑', '—', '—', '—']],
  ['EDIT', '默认', ['不问', '不问', '一次批', '一次批', '一次批']],
  ['AUTO', '全部放行', ['不问', '不问', '不问', '一次批', '一次批']],
];
export const TIER_COLS = ['改文件', '跑命令', '装依赖、联网', '删文件', '改项目外的'];

// 迁移测试：右栏新加的三个模块只照规则画
export const TESTS = [
  { k: 'ONE SHOT', nm: '边干活边问', used: ['M2', 'L5', 'K4', 'T1', 'T3', 'S1', 'S2', 'S4', 'I7', 'W5'], gap: '规则里只有一个输入框，两个 SEND 都亮就有两个青色主按钮；它能看什么、花多少钱也没写', fix: ['K1', 'R4', 'R5'] },
  { k: 'FILES', nm: '看项目文件', used: ['M2', 'M4', 'T3', 'T5', 'C2', 'S1', 'S4'], gap: '代码该不该上色没写；改过的、删掉的文件怎么标，CHANGES 有、预览里没有', fix: ['C5', 'R6', 'R7'] },
  { k: 'TERM', nm: '自己跑命令', used: ['M2', 'K4', 'I6', 'T3', 'C2', 'S3', 'W1'], gap: '它和 Agent 跑的命令、和权限三档是什么关系没写；任务在跑时你改的文件算谁的没写', fix: ['R8', 'R9'] },
  { k: 'TABS', nm: '四个模块怎么放', used: ['L2', 'L6', 'K3', 'K6', 'M3'], gap: '右栏原来只有一个模块；切走以后那边有新东西、模块要更宽、模块之间怎么连都没写', fix: ['L2', 'K9', 'R1', 'R2', 'R3', 'R10'] },
];

// 要站主定的
export const QUESTIONS = [
  ['单次请求挪进 ONE SHOT？', 'API 模式原来有三种做法，单次请求是其中一种；ONE SHOT 就是它，而且 CLI 模式下也在。我画的是：「谁来干」里只留单模型干活、规划 + 实施，单次请求只在 ONE SHOT。'],
  ['ONE SHOT 只走 API？', '我画的是只走 API（快、便宜、不碰项目），没配 Key 时说清为什么、当场填。另一条路是借 Muse、Grok 的单次模式答：不用 Key，但用 CLI 的额度，也可能读项目。'],
  ['终端里改的文件算谁的？', '任务前快照管整个项目，所以任务在跑时你在 TERM 里改的文件也算进这次改动，撤销时一起回去。我画的是照这样算、标 YOU。也可以撤销时留着你改的，但 Peck 要在每条命令前后各存一次快照。'],
];

// 这四个模块进 roadmap 的哪个 Phase（第 2 步收尾时写进 design.md 和 roadmap）
export const PLACE = [
  ['CHANGES', 'Phase 3 三栏外壳', '原来的右栏，加页签'],
  ['FILES', 'Phase 3 三栏外壳', '只读，接现有的文件监听'],
  ['TERM', 'Phase 4 发任务与看任务', '要一个本机终端进程（pty）'],
  ['ONE SHOT', 'Phase 7 API 模式', '和单次请求一起做'],
];
