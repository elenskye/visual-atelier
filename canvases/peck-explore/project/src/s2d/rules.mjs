// 第 2 步 · 第四轮 · 外框规则第三版：第三轮的 62 条，落站主 11-10 回的三件事（单次请求挪进 ONE SHOT；
// ONE SHOT 用 API 和 CLI 都能答、能读项目不能改；模型在跑任务时终端锁着），再拿这几处改动做迁移测试。
// n: 'new' = 这一轮补的；'chg' = 这一轮改的。第三轮的标记不再显示（那一页还在画布上）。
import { GROUPS as G3 } from '../s2c/rules.mjs';

// 这一轮改写的条目：[编号, 新的话]
const CHG = {
  R2: '切走以后，页签上说那边有新东西：CHANGES 写改了几个文件，ONE SHOT 答完一颗点，TERM 命令在跑转圈、跑完一颗绿点或红点；终端锁着时 TERM 上一把锁。从不自己切走你在看的页签。',
  R4: 'ONE SHOT 问一句答一句：能读整个项目，不改文件、不跑命令（CLI 用 PLAN 档跑，API 只给读文件的工具）；读了哪些文件写在回答上面。任务进度、终端输出它看不到，用 + 带上；带上 FILES 里的文件是「指着它问」。',
  R5: 'ONE SHOT 谁来答：Muse、Grok 和配了 Key 的 API 模型都能选（K10），默认跟顶栏的模式，换了就记住。API 答完写这一问花了多少（算进花费上限），CLI 写「订阅额度」。回答只给 COPY 和 TO TASK。',
  R9: 'TERM 每条命令跑完写 EXIT 码和用时，不是 0 就红；命令在跑时输入行暗着，旁边只有 STOP（I6）。',
};
// 这一轮补的：[组, 编号, 话]
const ADD = [
  ['K', 'K10', '菜单：从点它的选项片上方弹出，按组列（组名英文大写小字），当前那项青底；用不了的不列，组底下一行 + 当场补（S4、I7）；再点一下选项片收起。'],
  ['I', 'I9', '谁来干：CLI 模式四种（Muse、Grok、Muse → Grok、Grok → Muse），API 模式两种（单模型干活、规划 + 实施）。单次请求不在这里，挪进右栏的 ONE SHOT（站主 11-10 定）。'],
  ['R', 'R11', '模型在跑任务时终端锁着（站主 11-10 定）：从发出到做完，等你批、等你答、撤销的时候都算。输入行换成一把锁和一句为什么；输出照样能看、能带去 ONE SHOT；发任务前就在跑的命令接着跑，STOP 一直能点。'],
  ['R', 'R12', '做完终端就解锁。之后你改的文件不算进这个任务：撤销只动任务改过的那几个，确认里写清你后来改的不动。'],
];

export const GROUPS = G3.map((g) => {
  const rules = g.rules.map(([id, t]) => (CHG[id] ? [id, CHG[id], 'chg'] : [id, t]));
  for (const [k, id, t] of ADD) if (k === g.k) rules.push([id, t, 'new']);
  return { ...g, rules };
});

export const RULES = GROUPS.flatMap((g) => g.rules.map(([id, t, n]) => ({ id, t, n: n || '', g: g.k })));
export const COUNT = { all: RULES.length, nw: RULES.filter((r) => r.n === 'new').length, chg: RULES.filter((r) => r.n === 'chg').length };

// 站主 11-10 回的三件事，落到了哪
export const DECIDED = [
  ['单次请求', '挪进 ONE SHOT', '「谁来干」的 API 模式只剩单模型干活、规划 + 实施两种', ['I9']],
  ['ONE SHOT', 'API、CLI 都能答；能读，不能改', '谁来答：Muse、Grok 和配了 Key 的 API 模型。CLI 用 PLAN 档跑，API 只给读文件的工具；回答上写读了哪些文件', ['R4', 'R5', 'K10']],
  ['终端', '模型跑任务时锁着', '从发出到做完都锁，等你批、等你答、撤销的时候也算；做完解锁，之后改的不算进任务', ['R2', 'R9', 'R11', 'R12']],
];

// 终端什么时候锁（结果板上的一条）：[名字, 小字, 锁不锁, 宽度份数]
export const LOCK = [
  ['发出 → 验证', '规划、改、检查；等你批、等你答也算', true, 5],
  ['做完', '能用', false, 2],
  ['撤销中', '锁', true, 1.4],
  ['撤销完', '能用', false, 1.6],
];

// ONE SHOT 谁来答（结果板上的小表）
export const ENGINES = [
  ['MUSE', 'CLI', 'PLAN 档跑', '订阅额度'],
  ['GROK', 'CLI', 'PLAN 档跑', '订阅额度'],
  ['DEEPSEEK FLASH', 'API', '只给读文件的工具', '按次算钱'],
  ['CLAUDE OPUS 5.5', 'API', '只给读文件的工具', '按次算钱'],
];

// 迁移测试：这一轮改动的地方只照规则画
export const TESTS = [
  { k: 'ONE SHOT', nm: '谁来答', used: ['R4', 'R5', 'K3', 'S4', 'I7'], gap: '规则里没有菜单；CLI 不按次算钱，花费那一格写什么没写；能读项目以后，读了什么要不要给你看没写', fix: ['K10', 'R4', 'R5'] },
  { k: 'TERM', nm: '锁着', used: ['I6', 'R2', 'R9', 'K4'], gap: 'I6 只管中间的输入框；终端锁着时页签、输入行、已经在跑的命令怎么办没写', fix: ['R2', 'R9', 'R11'] },
  { k: 'UNDO', nm: '解锁以后', used: ['I4', 'R8'], gap: '做完解锁以后，你在终端改的文件和任务改的怎么分没写', fix: ['R12'] },
  { k: 'API MODE', nm: '谁来干', used: ['I1', 'K3', 'S4'], gap: '单次请求挪走以后，两种模式各剩几种没写在一处', fix: ['I9'] },
];

// 要站主定的
export const QUESTIONS = [
  ['发任务时终端还有命令在跑？', '比如 pnpm dev。我画的是接着跑、STOP 一直能点；它要是改了项目里的文件，也算进这次改动。另一种是发任务前先问你要不要停它。'],
  ['ONE SHOT 默认谁来答？', '我画的是跟顶栏的模式走：CLI 模式默认 Muse，API 模式默认「谁来干」里选的模型；换了就记住。另一种是默认最便宜的 API 模型（快，但要配 Key）。'],
  ['PLAN 档的任务也锁终端？', 'PLAN 只读，不锁也不会混进改动。我画的是也锁：一条规则好记，也免得你改掉它正在读的东西。'],
];

// 四个模块进 roadmap 的哪个 Phase（第 2 步收尾时写进 design.md 和 roadmap）
export const PLACE = [
  ['CHANGES', 'Phase 3 三栏外壳', '原来的右栏，加页签'],
  ['FILES', 'Phase 3 三栏外壳', '只读，接现有的文件监听'],
  ['TERM', 'Phase 4 发任务与看任务', '本机终端进程（pty），任务在跑时锁'],
  ['ONE SHOT', 'Phase 5 · Phase 7', 'CLI 那半跟 Muse、Grok 一起做；API 那半和单次请求一起做'],
];
