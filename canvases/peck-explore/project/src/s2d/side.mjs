// 第 2 步 · 第四轮 · 右栏四个模块，落站主 11-10 回的三件事：ONE SHOT 用 Muse、Grok 和 API 模型都能答，
// 能读项目、不能改（回答上写读了哪些文件）；模型在跑任务时终端锁着；单次请求挪进 ONE SHOT。
// 在第三轮（../s2c/side.mjs）上改：中栏和左栏还是第一轮批准的小样（../s2/proto.mjs），任务照样能从头跑到尾。
// 只照 rules.mjs（第三版）画。同一份模板做能点的小样（S2d-Side）、宽栏（S2d-Wide）和 12 个时刻（S2d-SideFlow）。
import { board, PROPS, DOTS, SANS, px, twinkle, FLIP } from '../s1c/kit.mjs';
import { template, V, FRAMES } from '../s2/proto.mjs';
import { CSS as SHELL, header, ic } from '../s2b/shell.mjs';

const D = `font-family:${DOTS};font-weight:900`;

// 8×8 像素小图标（K6），这一轮新加的
export const ICON8 = {
  expand: ['###..###', '##....##', '#.#..#.#', '........', '........', '#.#..#.#', '##....##', '###..###'],
  collapse: ['#.#..#.#', '.##..##.', '###..###', '........', '........', '###..###', '.##..##.', '#.#..#.#'],
  chat: ['########', '#......#', '#.##.#.#', '#......#', '########', '..##....', '..#.....', '........'],
  triR: ['........', '..#.....', '..##....', '..###...', '..##....', '..#.....', '........', '........'],
  triD: ['........', '........', '.#####..', '..###...', '...#....', '........', '........', '........'],
  stop: ['........', '.######.', '.######.', '.######.', '.######.', '.######.', '.######.', '........'],
};
const ic2 = (name, cls = '') => {
  let r = '';
  ICON8[name].forEach((row, y) => { for (let x = 0; x < 8;) { if (row[x] !== '#') { x++; continue; } let e = x; while (e < 8 && row[e] === '#') e++; r += `<rect x="${x}" y="${y}" width="${e - x}" height="1"></rect>`; x = e; } });
  return `<svg class="px${cls ? ' ' + cls : ''}" viewBox="0 0 8 8" aria-hidden="true" shape-rendering="crispEdges">${r}</svg>`;
};

// ---------- 假数据：项目文件、预览、ONE SHOT 的问答、终端命令 ----------
const TREE = [
  { k: 'dir', n: 'src', path: 'src/', d: 0 },
  { k: 'dir', n: 'chat', path: 'src/chat/', d: 1 },
  { k: 'file', n: 'Composer.tsx', path: 'src/chat/Composer.tsx', d: 2, size: '2.1 KB' },
  { k: 'dir', n: 'settings', path: 'src/settings/', d: 1 },
  { k: 'file', n: 'SettingsSheet.tsx', path: 'src/settings/SettingsSheet.tsx', d: 2, size: '2.6 KB', only: true },
  { k: 'file', n: 'AgentsDialog.tsx', path: 'src/settings/AgentsDialog.tsx', d: 2, size: '3.4 KB' },
  { k: 'file', n: 'ApiDialog.tsx', path: 'src/settings/ApiDialog.tsx', d: 2, size: '2.2 KB' },
  { k: 'file', n: 'App.tsx', path: 'src/App.tsx', d: 1, size: '1.6 KB' },
  { k: 'file', n: 'units.ts', path: 'src/units.ts', d: 1, size: '0.4 KB' },
  { k: 'dir', n: 'tests', path: 'tests/', d: 0, closed: true },
  { k: 'file', n: 'package.json', path: 'package.json', d: 0, size: '0.9 KB' },
  { k: 'file', n: 'README.md', path: 'README.md', d: 0, size: '1.2 KB' },
  { k: 'file', n: 'tailwind.config.ts', path: 'tailwind.config.ts', d: 0, size: '0.3 KB' },
];
const L = (n, t, c) => (c ? [n, t, c] : [n, t]);
const PV = {
  'Composer.tsx': {
    old: [L(40, '  const send = useSend()'), L(41, ''), L(42, '  const [agentsOpen, setAgentsOpen] = useState(false)'), L(43, '  const [apiOpen, setApiOpen] = useState(false)'), L(44, ''), L(45, '  return ('), L(46, '    <div className="composer">'), L(47, '      <Input value={text} onChange={setText} />'), L(48, '      <Send onClick={send} />'), L(49, '    </div>')],
    mod: [L(40, '  const send = useSend()'), L(41, ''), L(42, '  const [settingsOpen, setSettingsOpen] = useState(false)', 'a'), L(43, ''), L(44, '  return ('), L(45, '    <div className="composer">'), L(46, '      <Input value={text} onChange={setText} />'), L(47, '      <Gear onClick={() => setSettingsOpen(true)} />', 'a'), L(48, '      <Send onClick={send} />'), L(49, '    </div>')],
    about: '输入框和「谁来干」的那一块。这个任务把打开两个旧对话框的状态，换成了打开设置面板。',
  },
  'SettingsSheet.tsx': {
    old: [L(1, '// 一个设置面板：供应商、Key、花费上限、权限、CLI 检测'), L(2, "import { Sheet } from '../ui/Sheet'"), L(3, ''), L(4, 'export function SettingsSheet({ open }) {'), L(5, '  return ('), L(6, '    <Sheet open={open} title="设置">'), L(7, '      <Providers />'), L(8, '      <SpendLimit />'), L(9, '      <Access />'), L(10, '      <CliCheck />')],
    about: '这个任务新写的设置面板：供应商、Key、花费上限、权限和 CLI 检测放在一起，替掉原来的两个对话框。',
  },
  'AgentsDialog.tsx': {
    old: [L(1, '// 旧的 Agent 配置对话框'), L(2, "import { Dialog } from '../ui/Dialog'"), L(3, ''), L(4, 'export function AgentsDialog({ open }) {'), L(5, '  return ('), L(6, '    <Dialog open={open} title="Agent 配置">'), L(7, '      <WorkerPicker />'), L(8, '      <SupervisorPicker />'), L(9, '    </Dialog>'), L(10, '  )')],
    about: '旧的 Agent 配置对话框。这个任务把它删了，里面的东西搬进了 SettingsSheet。',
  },
  'ApiDialog.tsx': {
    old: [L(1, '// 旧的 API 工作台'), L(2, "import { Dialog } from '../ui/Dialog'"), L(3, ''), L(4, 'export function ApiDialog({ open }) {'), L(5, '  return ('), L(6, '    <Dialog open={open} title="API 工作台">'), L(7, '      <KeyList />'), L(8, '      <BudgetFields />'), L(9, '    </Dialog>'), L(10, '  )')],
    about: '旧的 API 工作台对话框。这个任务把它删了，Key 和花费上限搬进了 SettingsSheet。',
  },
  'App.tsx': {
    old: [L(1, "import { Composer } from './chat/Composer'"), L(2, "import { AgentsDialog } from './settings/AgentsDialog'"), L(3, "import { ApiDialog } from './settings/ApiDialog'"), L(4, "import { Layout } from './ui/Layout'"), L(5, ''), L(6, 'export function App() {'), L(7, '  const [dlg, setDlg] = useState(null)'), L(8, '  return ('), L(9, '    <Layout onOpen={setDlg}>'), L(10, '      <Composer />')],
    mod: [L(1, "import { Composer } from './chat/Composer'"), L(2, "import { Layout } from './ui/Layout'"), L(3, ''), L(4, 'export function App() {'), L(5, '  return ('), L(6, '    <Layout>', 'a'), L(7, '      <Composer />'), L(8, '    </Layout>'), L(9, '  )'), L(10, '}')],
    about: '应用的外壳：摆好 Layout 和 Composer。这个任务去掉了打开两个旧对话框的状态。',
  },
  'units.ts': {
    old: [L(1, '// 温度和风速的格式'), L(2, 'export function formatTemp(n: number) {'), L(3, '  return `${n}°C`'), L(4, '}'), L(5, ''), L(6, 'export function formatWind(kmh: number) {'), L(7, '  return `${kmh} km/h`'), L(8, '}')],
    about: '温度和风速的格式。formatTemp 现在写成 21°C，数字和单位中间没有空格。',
  },
  'package.json': {
    old: [L(1, '{'), L(2, '  "name": "weather-cli",'), L(3, '  "version": "0.4.0",'), L(4, '  "scripts": {'), L(5, '    "test": "vitest run",'), L(6, '    "format": "prettier --write ."'), L(7, '  },'), L(8, '  "devDependencies": {'), L(9, '    "tailwindcss": "4.0.2",'), L(10, '    "vitest": "2.1.4"')],
    mod: [L(1, '{'), L(2, '  "name": "weather-cli",'), L(3, '  "version": "0.4.0",'), L(4, '  "scripts": {'), L(5, '    "test": "vitest run",'), L(6, '    "format": "prettier --write ."'), L(7, '  },'), L(8, '  "devDependencies": {'), L(9, '    "tailwindcss": "4.1.0",', 'a'), L(10, '    "vitest": "2.1.4"')],
    about: '依赖和脚本：test 跑 vitest，format 跑 prettier。',
  },
  'README.md': {
    old: [L(1, '# weather-cli'), L(2, ''), L(3, '在终端里看天气：weather-cli 上海'), L(4, ''), L(5, '## 安装'), L(6, ''), L(7, 'pnpm install'), L(8, 'pnpm link --global'), L(9, ''), L(10, '## 用法')],
    mod: [L(1, '# weather-cli'), L(2, ''), L(3, '在终端里看天气：weather-cli 上海'), L(4, ''), L(5, '## 安装'), L(6, ''), L(7, '```sh', 'a'), L(8, 'pnpm install'), L(9, 'pnpm link --global'), L(10, '```', 'a')],
    about: '项目说明：怎么装、怎么用。',
  },
  'tailwind.config.ts': {
    old: [L(1, "import type { Config } from 'tailwindcss'"), L(2, ''), L(3, 'export default {'), L(4, "  content: ['./src/**/*.tsx'],"), L(5, '  theme: {'), L(6, "    extend: { colors: { cyan: '#00E5FF' } },"), L(7, '  },'), L(8, '} satisfies Config')],
    about: 'Tailwind 的配置。升到 4.1 的话，theme 这一段要搬进 CSS。',
  },
};
const QA = [
  { q: 'Tailwind 4.1 和 4.0 的配置写法差在哪？', rd: ['tailwind.config.ts', 'package.json'], t1: '4.1 把主题挪进了 CSS：颜色、字号用 @theme 写在样式表里，tailwind.config 只剩插件和扫描路径。', code: '@theme { --color-cyan: #00E5FF; }', t2: '要是一起升，tailwind.config.ts 里 theme 那段要搬进 index.css；先不升就不用动。' },
  { q: '这个报错是什么意思？', rd: ['src/units.ts', 'tests/units.test.ts'], t1: 'units.test.ts 期望 21 °C（数字和单位中间有空格），formatTemp 返回的是 21°C。', code: 'return `${n} °C`', t2: '这条和正在跑的任务无关，之前就是这样。要修，可以写成下一个任务。' },
  { q: 'settingsOpen 在哪里打开？', rd: ['src/chat/Composer.tsx', 'src/settings/SettingsSheet.tsx'], t1: '第 42 行新加了 settingsOpen；齿轮按钮的 onClick 把它设成 true，下面的 SettingsSheet 跟着打开。', code: 'onClick={() => setSettingsOpen(true)}', t2: '原来的 agentsOpen、apiOpen 都删了。' },
  { q: '现在做到哪了？', rd: [], t1: '', code: '', t2: '' },
  { q: '这个文件是做什么的？', rd: [], t1: '', code: '', t2: '' },
];
// ONE SHOT 谁来答（R5、K10）：[名字, 人话, cli / api, 点的颜色, 每一问花多少（CLI 走订阅额度，没有）]
const MODELS = [
  ['MUSE', 'Muse', 'cli', 'muse', null],
  ['GROK', 'Grok', 'cli', 'grok', null],
  ['DEEPSEEK FLASH', 'DeepSeek Flash', 'api', 'api', ['$0.003', '$0.002', '$0.004', '$0.001', '$0.002']],
  ['CLAUDE OPUS 5.5', 'Claude Opus 5.5', 'api', 'api', ['$0.021', '$0.018', '$0.030', '$0.009', '$0.015']],
];
const CMDS = [
  { c: 'pnpm test', exit: 1, sec: '2.4s', out: [['> weather-cli@0.4.0 test', 'dim'], ['> vitest run', 'dim'], [' PASS  tests/forecast.test.ts (12)', 'ok'], [' PASS  tests/cli.test.ts (29)', 'ok'], [' FAIL  tests/units.test.ts (1)', 'bad'], ["   expected '21°C' to be '21 °C'", 'bad'], [' Tests  1 failed | 41 passed', 'bad']] },
  { c: 'pnpm format', exit: 0, sec: '0.6s', out: [['> prettier --write .', 'dim'], ['README.md 14ms', ''], ['src/units.ts 3ms (unchanged)', 'dim']] },
  { c: 'git diff --stat', exit: 0, sec: '0.1s', out: [] },
];
const PATHS = Object.fromEntries(TREE.filter((f) => f.k === 'file').map((f) => [f.n, f.path]));
export const DATA = { tree: TREE, pv: PV, qa: QA, models: MODELS, cmds: CMDS, paths: PATHS };

// ---------- 样式 ----------
const RCSS = `
.hide{display:none!important}
/* 右栏：页签（R1、R2） */
.col.rcol{gap:8px}
.rtabs{flex:none}
.rtabs button{flex:1 1 auto;padding:0 7px;font-size:13px;letter-spacing:.05em;gap:5px}
.rtabs em{font-style:normal;color:var(--cy-tx)}
.rtabs button.on em{color:var(--on-cy)}
.rtabs .tw{transform:scale(.8)}
.rtabs .bd{display:block;width:6px;height:6px;background:var(--cy-blk);box-shadow:var(--dglow);flex:none}
.rtabs .bd.ok{background:var(--ok);box-shadow:none}
.rtabs .bd.bad{background:var(--bad);box-shadow:none}
/* 模块头和预览头的小按钮（K9） */
.btn.sm2{height:26px;padding:0 8px;font-size:13px;gap:6px}
.btn.sm2 .px{width:12px;height:12px}
.ml .sm2{margin-left:2px}
.ml .r + .sm2{margin-left:10px}
.ml .xp{width:26px;padding:0}
.xp .i-co{display:none}
.grid.wx .xp .i-ex{display:none}
.grid.wx .xp .i-co{display:block}
/* 宽栏（R3、L6） */
.grid.wx{grid-template-columns:288px minmax(0,1fr)}
.grid.wx > section:nth-child(2){display:none}
.grid.wx .rtabs{align-self:flex-start;display:inline-flex;width:auto}
.grid.wx .rtabs button{flex:none;padding:0 14px}
.rwb{position:relative;isolation:isolate;flex:none;display:flex;align-items:center;gap:10px;height:44px;padding:0 5px 0 14px;clip-path:var(--clip2);background:var(--warn-line);font-size:12.5px}
.rwb:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:linear-gradient(var(--warn-soft),var(--warn-soft)),var(--pane);z-index:-1}
.rwb .px{color:var(--warn)}
.rwb .sp{flex:1}
/* 空的时候（S1） */
.rem{display:flex;flex-direction:column;gap:6px;padding:2px 0}
.rem p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.rem p.s{font-size:12px;color:var(--tx3)}
.rem p.t{font-family:var(--f-name);font-size:var(--fs-name);color:var(--tx)}
.rem .row{display:flex;align-items:center;gap:10px;margin-top:6px}
.rem .row span{font-size:12px;color:var(--tx3)}
/* ONE SHOT（R4、R5） */
.ros{display:flex;flex-direction:column}
.rth{flex:1 1 0;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:12px;overflow:hidden}
.rqa{display:flex;flex-direction:column;gap:5px}
.rqa .qh{display:flex;align-items:center;gap:8px;white-space:nowrap}
.rqa .who{display:flex;align-items:center;gap:6px;${D};font-size:13px;letter-spacing:.08em;color:var(--tx3)}
.rqa.a .who{color:var(--tx2)}
.rqa.a .who:before{content:"";width:7px;height:7px;background:var(--api)}
.rqa.a.muse .who:before{background:var(--muse)}.rqa.a.grok .who:before{background:var(--grok)}
.rqa .qm{margin-left:auto;${D};font-size:13px;color:var(--tx3)}
.rqa .qt{font-size:12.5px;line-height:1.6;color:var(--tx)}
.rqa.q .qt{font-family:var(--f-name);font-size:var(--fs-name);line-height:18px}
.rqa .qat{font-size:12px;color:var(--tx3)}
.rqa .qt2{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.rqa .qc{padding:6px 10px;clip-path:var(--clip2);background:var(--pane2);font-family:var(--f-code);font-size:var(--fs-code);line-height:18px;white-space:pre;overflow:hidden;text-overflow:ellipsis;color:var(--tx)}
.rqx{display:flex;gap:2px;margin:-6px 0 0 -8px}
.rqth{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--tx2)}
.roc{flex:none;display:flex;flex-direction:column;gap:8px;margin-top:12px;padding-top:12px;border-top:1px dotted var(--line2)}
.ratt{display:flex;gap:6px;flex-wrap:wrap}
.ratt .chip{height:26px;padding:0 8px;font-size:12.5px;gap:5px}
.ratt .chip .px{width:12px;height:12px}
.ratt .chip .code{text-transform:none;letter-spacing:0}
.ratt .chip.on .px{color:var(--cy-tx)}
.roc .crow .chip{height:28px;padding:0 9px;font-size:12.5px}
.caret.off,.foc-side .comp .caret{display:none}
/* FILES（R6、R7） */
.rfs{display:flex;flex-direction:column}
.rfb{flex:1 1 0;min-height:0;display:flex;flex-direction:column}
.rtw{flex:none}
.rtree{display:flex;flex-direction:column}
.rtree button{display:grid;grid-template-columns:12px minmax(0,1fr) auto auto auto;gap:6px;align-items:center;width:100%;height:23px;padding-right:6px;clip-path:var(--clip2);text-align:left}
.rtree .px{width:12px;height:12px;color:var(--tx3)}
.rtree .fn{font-family:var(--f-code);font-size:var(--fs-code);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--tx)}
.rtree li.dir .fn{color:var(--tx2)}
.rtree li.on button{background:var(--cy-soft)}
.rtree li.on .px{color:var(--cy-tx)}
.rtree li.del .fn{color:var(--tx3);text-decoration:line-through}
.rtree li.gone{display:none}
.rtree .tag{height:17px;padding:0 5px;font-size:12px}
.rtree .fa,.rtree .fd{${D};font-size:12px}
.rtree .fa{color:var(--ok)}.rtree .fd{color:var(--bad)}
.rign{padding:3px 0 0 6px;font-size:12px;color:var(--tx3)}
.rpv{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:6px;margin-top:8px;padding-top:9px;border-top:1px dotted var(--line2)}
.rpv .pvh{display:flex;align-items:center;gap:8px;white-space:nowrap}
.rpv .pvh .code{min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--tx)}
.rpv .pvh .pm{margin-left:auto;${D};font-size:13px;color:var(--tx2)}
.rpv .pn{font-size:12px;line-height:1.5;color:var(--tx2)}
.rpl{flex:1 1 0;min-height:0;overflow:hidden;font-family:var(--f-code);font-size:var(--fs-code);line-height:18px}
.rpl > div{display:grid;grid-template-columns:2px 22px minmax(0,1fr);gap:0 7px}
.rpl .mk.a{background:var(--ok)}
.rpl .n{color:var(--tx3);text-align:right}
.rpl span:last-child{white-space:pre;overflow:hidden;text-overflow:ellipsis;color:var(--tx)}
.rpl span.cm{color:var(--tx3)!important}
.rpl.dim span:last-child{color:var(--tx3)}
.rpa{flex:none;display:flex;gap:2px;margin:0 0 -4px -8px}
.grid.wx .rfb{flex-direction:row}
.grid.wx .rtw{width:320px;padding-right:16px}
.grid.wx .rpv{margin-top:0;padding-top:0;border-top:0;padding-left:18px;border-left:1px dotted var(--line2)}
/* TERM（R8、R9） */
.rterm{display:flex;flex-direction:column}
.rtsb{flex:1 1 0;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;font-family:var(--f-code);font-size:var(--fs-code);line-height:18px;color:var(--tx2)}
.rtsb > div:not(.rem){white-space:pre;overflow:hidden;text-overflow:ellipsis}
.rtsb .rem{font-family:var(--f-body);white-space:normal}
.rtsb .cmd{color:var(--tx);margin-top:8px}
.rtsb .cmd:first-of-type{margin-top:0}
.rtsb .cmd .tp{color:var(--cy-tx);margin-right:7px}
.rtsb .ok{color:var(--ok)}.rtsb .bad{color:var(--bad)}.rtsb .dim{color:var(--tx3)}
.rtst{position:relative;isolation:isolate;flex:none;display:flex;align-items:center;gap:8px;height:30px;margin-top:10px;padding:0 2px 0 10px;clip-path:var(--clip2);background:var(--ok-soft);white-space:nowrap}
.rtst.bad{background:var(--bad-soft)}
.rtst b{${D};font-size:13px;letter-spacing:.06em;color:var(--ok)}
.rtst.bad b{color:var(--bad)}
.rtst .code{min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--tx2)}
.rtst .sp{flex:1}
.rti{flex:none;display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:10px;border-top:1px dotted var(--line2)}
.rti .tp{font-family:var(--f-code);font-size:var(--fs-code);color:var(--cy-tx);white-space:nowrap}
.rti .cin{flex:1;min-width:0;font-family:var(--f-code);font-size:var(--fs-code)}
.rti .cin .tx{color:var(--tx)}
.rti.dim .tp{color:var(--tx3)}
.rti .kbd{font-family:var(--f-body)}
.rtn{flex:none;margin-top:8px;font-size:12px;line-height:1.5;color:var(--tx3)}
/* ONE SHOT 读了哪些文件、CLI 的额度（R4、R5） */
.rqa .qm.tx{font-family:var(--f-body);font-weight:400;font-size:12px;letter-spacing:0}
.rqa .qrd{display:flex;gap:6px;font-size:12px;line-height:1.5;color:var(--tx3);white-space:nowrap;min-width:0}
.rqa .qrd .code{min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--tx2)}
/* 谁来答的菜单（K10） */
.roc{position:relative}
.roc .crow .chip .px{width:12px;height:12px;color:var(--tx3)}
.roc .crow .chip.on .px{color:var(--cy-tx)}
.rmenu{position:absolute;left:0;right:0;bottom:36px;z-index:5;isolation:isolate;display:flex;flex-direction:column;padding:8px 6px 6px;clip-path:var(--clip2);background:var(--cy-line)}
.rmenu:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane2);z-index:-1}
.rmenu .mg{${D};font-size:12px;letter-spacing:.1em;color:var(--tx3);padding:2px 8px 4px}
.rmenu .sep{margin:5px 4px 6px;border-top:1px dotted var(--line2)}
.rmenu .mi{display:grid;grid-template-columns:7px minmax(0,1fr) auto;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;clip-path:var(--clip2);text-align:left}
.rmenu .mi b{${D};font-size:13px;letter-spacing:.06em;color:var(--tx);white-space:nowrap}
.rmenu .mi span{font-size:12px;color:var(--tx3);white-space:nowrap}
.rmenu .mi.on{background:var(--cy-soft)}
.rmenu .mi.on b{color:var(--cy-tx)}
.rmenu .ma{display:flex;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;clip-path:var(--clip2);text-align:left;font-size:12.5px;color:var(--tx2);white-space:nowrap}
.rmenu .ma .px{width:12px;height:12px;color:var(--cy-tx)}
.rmenu .ma em{margin-left:auto;font-style:normal;font-size:12px;color:var(--tx3)}
/* 终端锁着（R2、R11） */
.rtabs .lk{display:block;flex:none}
.rtabs .lk .px{width:12px;height:12px;color:var(--tx3)}
.rtabs button.on .lk .px{color:var(--on-cy)}
.rti .lkt{display:flex;align-items:center;gap:6px;${D};font-size:13px;letter-spacing:.06em;color:var(--tx3);white-space:nowrap}
.rti .lkt .px{width:12px;height:12px}
.rti.lock .cin{cursor:default}
.rti.lock .cin span{color:var(--tx3)}
`;
export const CSS = `${SHELL}\n${RCSS}`;

// ---------- 模板 ----------
const xp = (h) => `<button type="button" class="btn ghost sm2 xp" aria-label="展开到宽栏" onClick="${h('wideT')}">${ic2('expand', 'i-ex')}${ic2('collapse', 'i-co')}</button>`;

function right(h, iff, rc) {
  const tabs = `<div class="seg full rtabs">
      <button type="button" class="${h('tb0')}" onClick="${h('go0')}">CHANGES<em class="${h('bd0C')}">${h('bd0')}</em></button>
      <button type="button" class="${h('tb1')}" onClick="${h('go1')}">ONE SHOT${twinkle(h('bt1C'))}<i class="bd ${h('bd1C')}"></i></button>
      <button type="button" class="${h('tb2')}" onClick="${h('go2')}">FILES</button>
      <button type="button" class="${h('tb3')}" onClick="${h('go3')}">TERM<span class="lk ${h('lk3C')}" aria-label="锁着">${px('lock')}</span>${twinkle(h('bt3C'))}<i class="bd ${h('bd3C')}"></i></button>
    </div>`;
  const wbar = iff('wbar', `<div class="rwb">${px('ask')}<span>${h('wbarT')}</span><i class="sp"></i><button type="button" class="btn warn" onClick="${h('collapse')}">BACK</button></div>`);

  const mi = (i, note) => `<button type="button" class="mi ${h('mi' + i)}" onClick="${h('pm' + i)}"><i class="dot ${MODELS[i][3]}"></i><b>${MODELS[i][0]}</b><span>${note}</span></button>`;
  const menu = iff('menu', `<div class="rmenu" role="menu">
          <p class="mg">CLI</p>${mi(0, '订阅额度 · 只读')}${mi(1, '订阅额度 · 只读')}
          <i class="sep"></i><p class="mg">API</p>
          ${iff('hasKey', `${mi(2, '按次算钱 · 只读')}${mi(3, '按次算钱 · 只读')}`, true)}
          ${iff('noKey', `<button type="button" class="ma" onClick="${h('addKey')}">${px('plus')}配 Key 用 API 模型<em>当场填</em></button>`)}
        </div>`);
  const os = `<div class="mod grow ros"><p class="ml"><span class="l">ONE SHOT</span><span class="r">只读</span><button type="button" class="btn ghost sm2" onClick="${h('oClear')}">CLEAR</button>${xp(h)}</p>
      <div class="rth">
        ${iff('osEmpty', '<div class="rem"><p>边干活边问，不打断任务。它能读整个项目，但不改文件、不跑命令；任务进度和终端输出它看不到，用下面的 + 带上。</p><p class="s">Muse、Grok 用它们的订阅额度；API 模型按次算钱，算进花费上限。</p></div>', true)}
        <sc-for list="${h('osRows')}" as="oq" hint-placeholder-count="1"><div class="rqa {{oq.c}}"><p class="qh"><span class="who">{{oq.who}}</span><span class="qm {{oq.mC}}">{{oq.meta}}</span></p><p class="qrd {{oq.rdC}}"><span>{{oq.rdL}}</span><span class="code">{{oq.rd}}</span></p><p class="qt">{{oq.t}}</p><p class="qat {{oq.atC}}">{{oq.at}}</p><div class="qc {{oq.codeC}}">{{oq.code}}</div><p class="qt2 {{oq.t2C}}">{{oq.t2}}</p></div></sc-for>
        ${iff('osThink', `<p class="rqth">${twinkle()}<span>${h('osThinkT')}</span></p>`)}
        ${iff('osActs', `<div class="rqx"><button type="button" class="btn ghost sm2" onClick="${h('copy')}">COPY</button><button type="button" class="btn ghost sm2" onClick="${h('toTask')}">TO TASK</button></div>`)}
      </div>
      <div class="roc">${menu}
        <div class="ratt"><button type="button" class="chip ${h('at0')}" onClick="${h('pat0')}">${px('plus')}TASK</button><button type="button" class="chip ${h('at1')}" onClick="${h('pat1')}">${px('plus')}<span class="code">${h('atFile')}</span></button><button type="button" class="chip ${h('at2')}" onClick="${h('pat2')}">${px('plus')}TERM</button></div>
        <button type="button" class="cin" onClick="${h('oType')}"><span class="pr">›</span><span class="${h('odC')}">${h('odT')}</span><i class="caret ${h('ocC')}"></i></button>
        <div class="crow"><button type="button" class="chip ${h('mnC')}" aria-haspopup="menu" onClick="${h('model')}"><i class="dot ${h('modelDot')}"></i>${h('modelName')}${ic2('triD')}</button><i class="sp"></i><span class="kbd">⌘↵</span><button type="button" class="btn ${h('oSendC')}" onClick="${h('oSend')}">SEND${px('send')}</button></div>
      </div>
    </div>`;

  const rows = TREE.map((f, i) => `<li class="${h('tc' + i)}"><button type="button" onClick="${h('fo' + i)}" style="padding-left:${6 + f.d * 14}px">${f.k === 'dir' ? ic2(f.closed ? 'triR' : 'triD') : px('file')}<span class="fn">${f.n}</span><em class="tag ${h('tt' + i)}">${h('tg' + i)}</em><span class="fa">${h('ta' + i)}</span><span class="fd">${h('td' + i)}</span></button></li>`).join('');
  const fs = `<div class="mod grow rfs"><p class="ml"><span class="l">FILES</span><span class="r">只看，不改</span>${xp(h)}</p>
      <div class="rfb">
        <div class="rtw"><ul class="rtree">${rows}</ul><p class="rign">藏了 2 个忽略的文件夹：node_modules、dist</p></div>
        <div class="rpv">
          <p class="pvh"><span class="code">${h('pvPath')}</span><span class="pm">${h('pvMeta')}</span></p>
          <p class="pn ${h('pvNoteC')}">${h('pvNote')}</p>
          <div class="rpl ${h('pvC')}"><sc-for list="${h('pvLines')}" as="pl" hint-placeholder-count="8"><div><i class="mk {{pl.mc}}"></i><span class="n">{{pl.n}}</span><span class="{{pl.tc}}">{{pl.t}}</span></div></sc-for></div>
          <div class="rpa"><button type="button" class="btn ghost sm2" onClick="${h('pvAsk')}">${ic2('chat')}ONE SHOT</button><button type="button" class="btn ghost sm2 ${h('pvDiffC')}" onClick="${h('pvDiff')}">DIFF</button><button type="button" class="btn ghost sm2" onClick="${h('pvOpen')}">OPEN</button></div>
        </div>
      </div>
    </div>`;

  const term = `<div class="mod grow rterm"><p class="ml"><span class="l">TERM</span><span class="r">你自己的终端</span><button type="button" class="btn ghost sm2" onClick="${h('tClear')}">CLEAR</button>${xp(h)}</p>
      <div class="rtsb">
        ${iff('tEmpty', '<div class="rem"><p>你自己的终端，开在 ~/code/weather-cli。</p><p class="s">不经过权限三档，也不进模型上下文；Agent 跑的命令在中间的步骤里看。</p></div>', true)}
        <sc-for list="${h('tLines')}" as="tq" hint-placeholder-count="1"><div class="{{tq.c}}"><span class="tp">{{tq.p}}</span><span>{{tq.t}}</span></div></sc-for>
      </div>
      ${iff('tSt', `<div class="rtst ${h('tStC')}"><b>${h('tStT')}</b><span class="code">${h('tStCmd')}</span><i class="sp"></i>${iff('tStAsk', `<button type="button" class="btn ghost sm2" onClick="${h('tAsk')}">${ic2('chat')}ONE SHOT</button>`)}</div>`)}
      <div class="rti ${h('tiC')}"><span class="tp">weather-cli $</span><button type="button" class="cin" onClick="${h('tType')}"><span class="${h('tDraftC')}">${h('tDraft')}</span><i class="caret ${h('tcC')}"></i></button>${iff('tRunning', `<button type="button" class="btn danger" onClick="${h('tStop')}">${ic2('stop')}STOP</button>`)}${iff('tLock', `<span class="lkt">${px('lock')}LOCKED</span>`)}${iff('tIdle', `<span class="kbd">⏎</span><button type="button" class="btn ${h('tRunC')}" onClick="${h('tRun')}">RUN</button>`, true)}</div>
      <p class="rtn">${h('tNote')}</p>
    </div>`;

  return `<section class="col rcol">${wbar}${tabs}
    ${iff('isC', rc, true)}${iff('isO', os)}${iff('isF', fs)}${iff('isT', term)}
  </section>`;
}

/** 整个外框：第一轮的模板 + 第二轮的顶栏 + 右栏四个模块。右栏的值在前缀 p 下，第一轮的值在 p + 'm.' 下。 */
export function shell(p = '') {
  const h = (k) => `{{${p}${k}}}`;
  const iff = (k, html, ph = false) => `<sc-if value="${h(k)}" hint-placeholder-val="{{${ph}}}">${html}</sc-if>`;
  const mp = p + 'm.';
  let t = template(mp);
  // 顶栏换成第二轮的（L3，带额度与花费）；RESET 只是小样用的
  const hs = t.indexOf('<header class="hd">'), he = t.indexOf('</header>') + '</header>'.length;
  const hd = header({ mode: 'cli', h: { api: `{{${mp}api}}`, quota: h('quota'), gear: `{{${mp}gear}}` } })
    .replace('</header>', `<button type="button" class="btn ghost rs" onClick="${h('reset')}">${px('undo')}RESET</button>\n  </header>`);
  t = t.slice(0, hs) + hd + t.slice(he);
  // 权限三档（站主 11-10 定）：PLAN / EDIT / AUTO
  t = t.replace('>EDIT</button>', '>AUTO</button>').replace('>ASK</button>', '>EDIT</button>').replace('>READ</button>', '>PLAN</button>');
  t = t.split('直接改').join('EDIT');
  // 撤销确认：做完以后你在终端改的文件不动（R12）
  t = t.replace(/<p class="cd">[\s\S]*?<\/p>/, `<p class="cd">${h('cdT')}</p>`);
  // 宽栏
  t = t.replace('<main class="grid">', `<main class="grid ${h('gx')}">`);
  // 右栏：原来的 CHANGES 模块放进第一个页签
  const rs = t.lastIndexOf('<section class="col">'), re = t.indexOf('</main>');
  let rc = t.slice(t.indexOf('<div class="mod grow rc">', rs), t.lastIndexOf('</section>', re)).trim();
  rc = rc.replace('<span class="r">直接写进项目</span>', `<span class="r">直接写进项目</span>${xp(h)}`);
  return t.slice(0, rs) + right(h, iff, rc) + '\n  ' + t.slice(re);
}

// ---------- 取值（纯函数，原样塞进画板脚本，不能用外面的变量） ----------
/** 改第一轮的值：权限三档的显示、只亮正在写的输入框（K1）。 */
export function M2(m, s) {
  const T = [['PLAN', '只读：读代码、写计划，不改文件、不跑命令。要动手，换 EDIT 再发。'], ['EDIT', '改文件、跑命令都不问；删文件、联网装依赖、改项目外的文件，开始前一张卡一次批。'], ['AUTO', '装依赖、联网也不问；删文件、改项目外的文件（推送也算）照样一张卡批。']];
  const ti = s.tier == null ? 1 : s.tier;
  m.a0 = ti === 0 ? 'on' : ''; m.a1 = ti === 1 ? 'on' : ''; m.a2 = ti === 2 ? 'on' : '';
  m.accName = T[ti][0]; m.accD = T[ti][1];
  if (s.focus && s.focus !== 'task') { m.sendC = 'off'; m.root += ' foc-side'; }
  if (s.after && s.ph === 'confirm') m.showDiff = false; // 确认要多一句话，Diff 先收起
  return m;
}

/** git diff --stat 的输出：新文件不在里面（还没被 Git 跟踪），按 42 列排。 */
export function STAT(m, D) {
  const fs = (m.files || []).filter((f) => f.tc !== 'new');
  if (!fs.length) return [['（没有改动）', 'dim']];
  const mx = Math.max.apply(null, fs.map((f) => f.a + f.d));
  const out = fs.map((f) => {
    const n = f.a + f.d, k = Math.max(1, Math.round(n / mx * 6)), pa = Math.round(k * f.a / n);
    let p = D.paths[f.p] || f.p;
    if (p.length > 26) p = '...' + p.slice(-23);
    return [' ' + p.padEnd(26) + ' | ' + String(n).padStart(3) + ' ' + '+'.repeat(pa) + '-'.repeat(k - pa), ''];
  });
  const A = fs.reduce((x, f) => x + f.a, 0), Dd = fs.reduce((x, f) => x + f.d, 0);
  out.push([' ' + fs.length + ' files changed, ' + A + ' insertions(+),', 'dim']);
  out.push([' ' + Dd + ' deletions(-)', 'dim']);
  return out;
}

/** 右栏的值：只看 state（s）和第一轮算出来的值（m）。 */
export function R(s, m, D) {
  const ph = s.ph;
  const busy = ['plan', 'perm', 'edit', 'check', 'ask', 'check2', 'verify'].includes(ph);
  const waiting = ph === 'perm' || ph === 'ask';
  // 模型在跑任务时终端锁着（R11）：从发出到做完，等你批、等你答、撤销的时候都算
  const lock = busy || ph === 'sending' || ph === 'undoing';
  const tab = s.tab || 0, foc = s.focus || 'task';
  const th = s.th || [], tl = s.tl || [], att = s.att || [false, false, false];
  const last = th[th.length - 1];
  const v = {};
  for (let i = 0; i < 4; i++) v['tb' + i] = tab === i ? 'on' : '';
  v.isC = tab === 0; v.isO = tab === 1; v.isF = tab === 2; v.isT = tab === 3;
  v.gx = s.wide ? 'wx' : '';
  // 页签上的提示（R2）
  v.bd0 = String(m.nshow); v.bd0C = m.nshow > 0 ? '' : 'hide';
  v.bt1C = last && last.k < 3 && tab !== 1 ? '' : 'hide';
  v.bd1C = s.unread && tab !== 1 ? '' : 'hide';
  v.bt3C = s.trun && tab !== 3 ? '' : 'hide';
  v.bd3C = s.tun && tab !== 3 ? s.tun : 'hide';
  v.lk3C = lock ? '' : 'hide';
  // 展开时任务停下来等你（R3）
  v.wbar = !!s.wide && waiting;
  v.wbarT = ph === 'perm' ? '任务 13 停下来等你：开始改之前，一次批这几件事' : '任务 13 停下来问你：Tailwind 要不要一起升到 4.1？';
  // 撤销确认：做完以后你在终端改的不动（R12）
  v.cdT = m.nfiles + ' 个文件回到 14:02 开始前的样子，删掉的 2 个放回来。' + (s.after ? '做完以后你在终端改的 README.md 不动。' : '') + '你的 Git 不动。';
  // ONE SHOT（R4、R5、K10）
  const base = (p) => p.split('/').pop();
  v.hasKey = !s.nokey; v.noKey = !!s.nokey;
  const rows = [];
  th.slice(-1).forEach((t) => {
    rows.push({ c: 'q', who: 'YOU', meta: '刚才', mC: '', rd: '', rdL: '', rdC: 'hide', t: t.q, at: t.at ? '带上：' + t.at : '', atC: t.at ? '' : 'hide', code: '', codeC: 'hide', t2: '', t2C: 'hide' });
    if (t.k >= 1) rows.push({ c: 'a ' + (t.dot || 'api'), who: t.who, meta: t.k >= 3 ? t.cost : '在写…', mC: t.k >= 3 && t.cost.charAt(0) === '$' ? '' : 'tx', rd: t.rd.map(base).join(' · '), rdL: '读了 ' + t.rd.length + ' 个文件', rdC: t.rd.length ? '' : 'hide', t: t.t1, at: '', atC: 'hide', code: t.code, codeC: t.k >= 2 && t.code ? '' : 'hide', t2: t.t2, t2C: t.k >= 3 && t.t2 ? '' : 'hide' });
  });
  v.osRows = rows; v.osEmpty = rows.length === 0 && !s.menu; // 菜单开着时，空的那段说明先收起
  v.osThink = !!last && last.k === 0;
  v.osThinkT = last ? (last.rd.length ? last.whoN + ' 在读 ' + base(last.rd[0]) + '…' : last.whoN + ' 在想…') : '';
  v.osActs = !!last && last.k >= 3;
  const marks = {};
  (m.files || []).forEach((f) => { marks[f.p] = f; });
  let sel = s.fsel == null ? 2 : s.fsel;
  if (D.tree[sel].only && !marks[D.tree[sel].n]) sel = 2;
  v.at0 = att[0] ? 'on' : ''; v.at1 = att[1] ? 'on' : ''; v.at2 = att[2] ? 'on' : (tl.length ? '' : 'no');
  v.atFile = D.tree[sel].n;
  const typed = s.od != null && s.od >= 0;
  v.odT = typed ? D.qa[s.od].q : '问一句…（点这里）'; v.odC = typed ? 'tx' : '';
  v.ocC = foc === 'os' && !s.menu ? '' : 'off';
  v.oSendC = typed && foc === 'os' ? 'pri' : 'pri off';
  const mi = s.model || 0, md = D.models[mi];
  v.modelName = md[0]; v.modelDot = md[3];
  v.menu = !!s.menu; v.mnC = s.menu ? 'on' : '';
  for (let i = 0; i < D.models.length; i++) v['mi' + i] = mi === i ? 'on' : '';
  // FILES（R6、R7）
  D.tree.forEach((f, i) => {
    const mk = f.k === 'file' ? marks[f.n] : null;
    let c = f.k;
    if (f.only && !mk) c += ' gone';
    if (mk && mk.tc === 'del') c += ' del';
    if (i === sel) c += ' on';
    v['tc' + i] = c;
    const tg = mk && (mk.tc === 'new' || mk.tc === 'del');
    v['tg' + i] = tg ? mk.tag : ''; v['tt' + i] = tg ? mk.tc : 'hide';
    v['ta' + i] = mk && mk.tc !== 'del' && mk.a ? '+' + mk.a : '';
    v['td' + i] = mk && mk.tc !== 'del' && mk.d ? '−' + mk.d : '';
  });
  const f = D.tree[sel], pv = D.pv[f.n], mk = marks[f.n];
  const del = !!mk && mk.tc === 'del', nw = !!mk && mk.tc === 'new', mod = !!mk && !del && !nw;
  v.pvPath = f.path;
  v.pvMeta = nw ? 'NEW +' + mk.a : del ? 'DEL' : mod ? '+' + mk.a + ' −' + mk.d : f.size;
  v.pvLines = (mod && pv.mod ? pv.mod : pv.old).map((l) => ({ n: String(l[0]), t: l[1], mc: mod && l[2] === 'a' ? 'a' : '', tc: l[1].trim().indexOf('//') === 0 ? 'cm' : '' }));
  v.pvNote = del ? '这个任务删了它。预览的是删之前的样子；撤销整个任务能放回来。' : nw ? '新文件，整份都是这个任务写的。' : mod ? '改过的行左边一条绿；完整的 Diff 在 CHANGES。' : '';
  v.pvNoteC = v.pvNote ? '' : 'hide';
  v.pvC = del ? 'dim' : '';
  v.pvDiffC = mk ? '' : 'hide';
  // TERM（R8、R9、R11）
  const lines = [];
  tl.forEach((r) => {
    lines.push({ c: 'cmd', p: 'weather-cli $', t: D.cmds[r.i].c });
    r.out.slice(0, r.n).forEach((o) => lines.push({ c: o[1] || '', p: '', t: o[0] }));
    if (r.st === 'stop') lines.push({ c: 'dim', p: '', t: '^C' });
  });
  v.tLines = lines.slice(-22); v.tEmpty = lines.length === 0;
  const lr = tl[tl.length - 1];
  v.tSt = !!lr && lr.st !== 'run';
  v.tStC = lr && lr.exit === 0 ? 'ok' : 'bad';
  v.tStT = lr ? 'EXIT ' + lr.exit + ' · ' + lr.sec : '';
  v.tStCmd = lr ? D.cmds[lr.i].c : '';
  v.tStAsk = !!lr && lr.st !== 'run' && lr.exit !== 0;
  v.tRunning = !!s.trun; v.tLock = lock && !s.trun; v.tIdle = !s.trun && !lock;
  const tt = !lock && s.td != null && s.td >= 0;
  v.tDraft = lock ? '任务在跑，终端锁着' : tt ? D.cmds[s.td].c : (s.trun ? '' : '点这里打一条命令');
  v.tDraftC = tt ? 'tx' : '';
  v.tcC = foc === 'term' && !s.trun && !lock ? '' : 'off';
  v.tiC = lock ? 'dim lock' : s.trun ? 'dim' : '';
  v.tRunC = tt && foc === 'term' ? 'pri' : 'off';
  v.tNote = lock ? (s.trun ? '发任务前就在跑的命令接着跑，STOP 一直能点；跑完以后输入行锁着，任务做完才解锁。' : '模型在跑任务，终端先锁着：做完、STOP 或撤销完就解锁。输出照样能看、能带去 ONE SHOT。') : '在 ~/code/weather-cli 里跑；Agent 跑的命令在中间的步骤里看。';
  return v;
}

// 第一轮的事件名（静止的时刻里都换成空函数）和右栏的事件名
const HM = ['type', 'send', 'pw0', 'pw1', 'pw2', 'pw3', 'pa0', 'pa1', 'pa2', 'newTask', 'pp0', 'pp1', 'pp2', 'allow', 'deny', 'scope', 'po0', 'po1', 'po2', 'submit', 'later', 'busy', 'stop', 'again', 'undo', 'cancelUndo', 'doUndo', 'reset', 'api', 'gear'];
const HR = ['go0', 'go1', 'go2', 'go3', 'wideT', 'collapse', 'quota', 'reset', 'pat0', 'pat1', 'pat2', 'oType', 'oSend', 'copy', 'toTask', 'model', 'oClear', 'addKey', 'pvAsk', 'pvDiff', 'pvOpen', 'tType', 'tRun', 'tStop', 'tAsk', 'tClear', 'pm0', 'pm1', 'pm2', 'pm3', ...TREE.map((_, i) => 'fo' + i)];

// ---------- 能点的小样 ----------
const TABS = ['CHANGES', 'ONE SHOT', 'FILES', 'TERM'];
function side() {
  const def = FLIP ? '浅色' : '深色';
  const logic = `
  constructor(p) { super(p); this.tm = []; this.to = []; this.tq = []; this.D = ${JSON.stringify(DATA)}; this.state = Object.assign(this.init(), this.initR()); }
  init() { return { ph: 'home', who: 2, acc: 2, tier: 1, t: 0, nf: 0, no: 0, q: 0, ans: -1, perm: [true, true, false], permOk: false, permN: 0, permTxt: '', ts: [], toast: '', after: false }; }
  initR() { const i = ${JSON.stringify(TABS)}.indexOf(this.props.tab0 ?? 'CHANGES'); return { tab: i < 0 ? 0 : i, wide: false, focus: 'task', att: [false, false, false], od: -1, th: [], unread: false, model: 0, menu: false, fsel: 2, tl: [], td: -1, tnext: 0, trun: false, tun: '' }; }
  componentDidMount() {
    this.iv = setInterval(() => {
      if (['plan', 'perm', 'edit', 'check', 'ask', 'check2', 'verify'].includes(this.state.ph)) this.setState({ t: this.state.t + 1 });
    }, 1000);
  }
  componentDidUpdate(pp) {
    if (pp && pp.tab0 !== this.props.tab0) { const i = ${JSON.stringify(TABS)}.indexOf(this.props.tab0); if (i >= 0) this.setState({ tab: i }); }
  }
  componentWillUnmount() { clearInterval(this.iv); clearTimeout(this.tt); this.clear(); this.clearO(); this.clearT(); }
  clear() { this.tm.forEach(clearTimeout); this.tm = []; }
  clearO() { this.to.forEach(clearTimeout); this.to = []; }
  clearT() { this.tq.forEach(clearTimeout); this.tq = []; }
  later(ms, fn) { this.tm.push(setTimeout(fn, ms)); }
  laterO(ms, fn) { this.to.push(setTimeout(fn, ms)); }
  laterT(ms, fn) { this.tq.push(setTimeout(fn, ms)); }
  mark(i) { const ts = (this.state.ts || []).slice(); ts[i] = this.state.t; return ts; }
  go(ph, patch) {
    this.setState(Object.assign({ ph: ph }, patch || {}));
    if (ph === 'sending') this.later(1000, () => this.go('plan', { t: 0 }));
    if (ph === 'plan') this.later(3200, () => this.go('perm', { ts: this.mark(0) }));
    if (ph === 'edit') { for (let i = 1; i <= 5; i++) this.later(i * 700, () => this.setState({ nf: i })); this.later(5 * 700 + 600, () => this.go('check', { ts: this.mark(1), no: 0 })); }
    if (ph === 'check') { for (let i = 1; i <= 2; i++) this.later(i * 700, () => this.setState({ no: i })); this.later(2 * 700 + 700, () => this.go('ask', { q: 0 })); }
    if (ph === 'check2') { for (let i = 3; i <= 5; i++) this.later((i - 2) * 700, () => this.setState({ no: i })); this.later(3 * 700 + 600, () => this.go('verify', { ts: this.mark(2) })); }
    if (ph === 'verify') this.later(2400, () => this.go('done', { ts: this.mark(3) }));
    if (ph === 'undoing') this.later(1700, () => this.go('undone'));
  }
  say(msg) { this.setState({ toast: msg }); clearTimeout(this.tt); this.tt = setTimeout(() => this.setState({ toast: '' }), 2800); }
  bump(k) {
    const th = this.state.th.slice(); if (!th.length) return;
    th[th.length - 1] = Object.assign({}, th[th.length - 1], { k: k });
    this.setState({ th: th, unread: k === 3 && this.state.tab !== 1 ? true : this.state.unread });
  }
  tick() {
    const tl = this.state.tl.slice(), r = tl[tl.length - 1];
    if (!r || r.st !== 'run') return;
    if (r.n < r.out.length) { tl[tl.length - 1] = Object.assign({}, r, { n: r.n + 1 }); this.setState({ tl: tl }); this.laterT(r.i === 0 ? 300 : 180, () => this.tick()); return; }
    const c = this.D.cmds[r.i];
    tl[tl.length - 1] = Object.assign({}, r, { st: 'end', exit: c.exit, sec: c.sec });
    const patch = { tl: tl, trun: false, tun: this.state.tab !== 3 ? (c.exit === 0 ? 'ok' : 'bad') : '' };
    if (r.i === 1 && (this.state.ph === 'done' || this.state.ph === 'confirm')) patch.after = true; // 做完以后你改了 README.md（R12）
    this.setState(patch);
  }
  renderVals() {
    const V = ${V.toString()};
    const M2 = ${M2.toString()};
    const R = ${R.toString()};
    const STAT = ${STAT.toString()};
    const D = this.D;
    const s = Object.assign({}, this.state, { nokey: (this.props.oskey ?? '配了 Key') === '没配 Key' });
    if (s.nokey && s.model > 1) s.model = 0;
    const ph = s.ph, dark = (this.props.theme ?? '${def}') === '深色';
    const home = ph === 'home' || ph === 'typed';
    const busy = ['plan', 'perm', 'edit', 'check', 'ask', 'check2', 'verify'].includes(ph);
    const m = M2(V(s, dark), s);
    // 第一轮小样的事件，照旧
    const who = (i) => () => (home ? this.setState({ who: i }) : this.say('谁来干在发任务前选；这个任务已经开始了'));
    const tier = (i) => () => (home ? this.setState({ tier: i }) : this.say('权限在发任务前选；这个任务已经开始了'));
    const pp = (i) => () => { const perm = s.perm.slice(); perm[i] = !perm[i]; this.setState({ perm: perm }); };
    const NAMES = ['删 2 个旧文件', '联网装依赖', '改项目外的 ~/.npmrc'];
    Object.assign(m, {
      type: () => { this.setState({ focus: 'task' }); if (ph === 'home') this.go('typed'); },
      send: () => {
        if (ph === 'home') return this.say('先点输入框写一句话');
        if (ph !== 'typed') return;
        if (s.tier !== 1) this.say('小样只走 EDIT 这条路：AUTO 时联网装依赖不问，删文件、改项目外的照样问；PLAN 只出计划');
        else if (s.trun) this.say('终端里的命令接着跑，STOP 一直能点；输入行锁上，任务做完才解锁');
        this.go('sending', { tier: 1, focus: 'task', td: -1 });
      },
      pw0: who(0), pw1: who(1), pw2: who(2), pw3: who(3),
      pa0: tier(0), pa1: tier(1), pa2: tier(2),
      newTask: () => {
        if (busy) return this.say('同一个项目一次跑一个任务；这个跑完再开新的');
        if (!home) { this.clear(); this.setState(Object.assign(this.init(), { after: false })); }
      },
      pp0: pp(0), pp1: pp(1), pp2: pp(2),
      allow: () => {
        const n = s.perm.filter(Boolean).length;
        if (!n) return this.say('一项都没勾；真这样，' + m.doer + ' 会停下来问你改成怎么做');
        this.go('edit', { permOk: true, permN: n, permTxt: NAMES.filter((_, i) => s.perm[i]).join(' · '), nf: 0 });
      },
      deny: () => this.say('选 NO，' + m.doer + ' 会停下来问你要怎么改；小样先走 ALLOW 这条路'),
      scope: () => this.say('ONCE 只这一次；TASK 这个任务里都算数；PROJECT 这个项目以后都不再问'),
      po0: () => this.setState({ q: 0 }), po1: () => this.setState({ q: 1 }), po2: () => this.setState({ q: 2 }),
      submit: () => (s.q === 2 ? this.say('选「其他…」会出一个输入框让你写；小样里先选 1 或 2') : this.go('check2', { ans: s.q, no: 2 })),
      later: () => this.say('先放着：任务停在这里等你，左边这个任务一直标着「等你回答」'),
      busy: () => this.say('这个任务跑完再发下一句；要插话，先 STOP'),
      stop: () => this.say('STOP 会停在当前这一步，已经改的留着；小样里先不停'),
      again: () => this.say('演示到这里了；点左边 NEW TASK 或右上 RESET 从头再来'),
      undo: () => this.go('confirm'), cancelUndo: () => this.go('done'), doUndo: () => this.go('undoing'),
      api: () => this.say('API 模式的「谁来干」只剩单模型干活、规划 + 实施；单次请求挪进了右栏 ONE SHOT'),
      gear: () => this.say('设置在第二轮那页；权限三档改名以后，设置里的 ACCESS 跟着改'),
    });
    const r = R(s, m, D);
    const lockT = busy || ph === 'sending' || ph === 'undoing';
    // 右栏的事件
    const pick = (a) => (a[2] ? 1 : a[1] ? (r.atFile === 'Composer.tsx' ? 2 : 4) : a[0] ? 3 : 0);
    const goTab = (i) => () => this.setState({ tab: i, unread: i === 1 ? false : s.unread, tun: i === 3 ? '' : s.tun });
    const att = (i) => () => {
      if (i === 2 && !s.tl.length) return this.say('终端里还没跑过命令，没有输出可带');
      const a = s.att.slice(); a[i] = !a[i];
      this.setState({ att: a, od: s.od >= 0 ? pick(a) : -1 });
    };
    const hs = {
      go0: goTab(0), go1: goTab(1), go2: goTab(2), go3: goTab(3),
      wideT: () => this.setState({ wide: !s.wide }), collapse: () => this.setState({ wide: false }),
      quota: () => this.say('额度与花费在第二轮那页画了入口和外框；内容是 Peck 自己的作业'),
      reset: () => { this.clear(); this.clearO(); this.clearT(); this.setState(Object.assign(this.init(), this.initR())); },
      pat0: att(0), pat1: att(1), pat2: att(2),
      oType: () => this.setState({ od: pick(s.att), focus: 'os', menu: false }),
      oSend: () => {
        if (s.od < 0) return this.say('先点输入框写一句');
        const last = s.th[s.th.length - 1];
        if (last && last.k < 3) return this.say('上一句还在答；答完再问');
        const qi = s.od, q = D.qa[qi], md = D.models[s.model];
        const ats = [];
        if (s.att[0]) ats.push('任务 13 的进度');
        if (s.att[1]) ats.push(r.atFile);
        if (s.att[2]) ats.push('终端里 ' + D.cmds[s.tl[s.tl.length - 1].i].c + ' 的输出');
        let t1 = q.t1, t2 = q.t2;
        if (qi === 3) {
          if (home || ph === 'sending') { t1 = '还没发任务：中间写一句话、选谁来干，发出去才开始。'; t2 = ''; }
          else if (ph === 'undoing' || ph === 'undone') { t1 = '任务 13 撤销了：改动都退回去，项目回到 14:02 开始前的样子。'; t2 = '要再做，点左边 NEW TASK。'; }
          else {
            t1 = '任务 13：' + m.bm + '；右边 ' + m.nshow + ' 个文件有改动。';
            t2 = (ph === 'perm' || ph === 'ask') ? '它停下来等你：先在中间回答，它才接着跑。' : busy ? '照前面几步的速度，再有 1 分钟左右。' : (ph === 'done' || ph === 'confirm') ? '已经做完了，检查都通过；默认留着。' : '这个任务撤销了。';
          }
        }
        if (qi === 4) t1 = D.pv[r.atFile].about;
        const rd = qi === 4 ? [D.paths[r.atFile]] : q.rd;
        const turn = { q: q.q, at: ats.join(' · '), who: md[0], whoN: md[1], dot: md[3], cost: md[4] ? md[4][qi] : '订阅额度', rd: rd, t1: t1, code: q.code, t2: t2, k: 0 };
        this.setState({ th: s.th.concat([turn]), od: -1, att: [false, false, false], menu: false });
        this.laterO(900, () => this.bump(1)); this.laterO(1400, () => this.bump(2)); this.laterO(1900, () => this.bump(3));
      },
      copy: () => this.say('复制了这段回答'),
      toTask: () => this.say(busy ? '真的会放进中间的输入框，等这个任务跑完再发；小样里只演到这里' : '真的会放进中间的输入框，改一改就能发；小样里只演到这里'),
      model: () => this.setState({ menu: !s.menu }),
      pm0: () => this.setState({ model: 0, menu: false }), pm1: () => this.setState({ model: 1, menu: false }),
      pm2: () => this.setState({ model: 2, menu: false }), pm3: () => this.setState({ model: 3, menu: false }),
      oClear: () => { this.clearO(); this.setState({ th: [], od: -1 }); },
      addKey: () => { this.setState({ menu: false }); this.say('真的会在输入位弹出填 Key 的卡片（I7），填完这里就列出 API 模型；Tweaks 里切回「配了 Key」看'); },
      pvAsk: () => { const a = s.att.slice(); a[1] = true; this.setState({ tab: 1, att: a, od: pick(a), focus: 'os', unread: false }); },
      pvDiff: () => { this.setState({ tab: 0 }); if (r.atFile !== 'Composer.tsx') this.say('小样只画了 Composer.tsx 的 Diff；真的会跳到这个文件的 Diff'); },
      pvOpen: () => this.say('在你的编辑器里打开；Peck 里只看不改'),
      tType: () => {
        if (lockT) return this.say('模型在跑任务，终端锁着：做完、STOP 或撤销完就能用。要问什么，去 ONE SHOT');
        if (s.trun) return this.say('命令在跑；要停，点 STOP');
        if (s.tnext >= D.cmds.length) return this.say('小样里就这三条命令；RESET 从头再来');
        this.setState({ td: s.tnext, focus: 'term' });
      },
      tRun: () => {
        if (s.trun || lockT) return;
        if (s.td < 0) return this.say('先点输入行打一条命令');
        const i = s.td;
        this.setState({ tl: s.tl.concat([{ i: i, out: i === 2 ? STAT(m, D) : D.cmds[i].out, n: 0, st: 'run', exit: 0, sec: '' }]), td: -1, tnext: i + 1, trun: true, tun: '' });
        this.laterT(300, () => this.tick());
      },
      tStop: () => {
        if (!s.trun) return;
        this.clearT();
        const tl = s.tl.slice(); tl[tl.length - 1] = Object.assign({}, tl[tl.length - 1], { st: 'stop', exit: 130, sec: '0.8s' });
        this.setState({ tl: tl, trun: false });
      },
      tAsk: () => { const a = s.att.slice(); a[2] = true; this.setState({ tab: 1, att: a, od: 1, focus: 'os', unread: false }); },
      tClear: () => (s.trun ? this.say('命令在跑；跑完或 STOP 以后再清') : this.setState({ tl: [], tun: '' })),
    };
    D.tree.forEach((f, i) => { hs['fo' + i] = f.k === 'dir' ? () => this.say(f.closed ? 'tests 里的文件小样没画' : '小样里这个文件夹一直展开着') : () => this.setState({ fsel: i }); });
    return Object.assign(r, hs, { m: m });
  }`;
  const props = { ...PROPS.theme(def), tab0: { editor: 'enum', options: TABS, default: 'CHANGES', section: '看' }, oskey: { editor: 'enum', options: ['配了 Key', '没配 Key'], default: '配了 Key', section: '看' } };
  const html = board({ title: '右栏四个模块 · 第四轮 · 能点的小样', css: CSS, body: shell(''), props, logic });
  return { file: 'S2d-Side.dc.html', title: '右栏四个模块 · 能点的小样（ONE SHOT 选谁来答、终端会锁）', html };
}

// ---------- 静止的时刻：在 node 里摆好 state，画板脚本里再用同一份 V / M2 / R 算 ----------
const RD = { tab: 0, wide: false, focus: 'task', att: [false, false, false], od: -1, th: [], unread: false, model: 0, menu: false, fsel: 2, tl: [], td: -1, tnext: 0, trun: false, tun: '', after: false, tier: 1 };
const S0 = { still: true, perm: [true, true, false], ts: [], ans: -1, permN: 0, permTxt: '' };
// 一问：默认 Muse 答（CLI 模式，R5）；o.mi 换谁来答
const turn = (qi, k, at = '', o = {}) => { const md = MODELS[o.mi || 0]; return { q: QA[qi].q, at, who: md[0], whoN: md[1], dot: md[3], cost: md[4] ? md[4][qi] : '订阅额度', rd: QA[qi].rd, t1: QA[qi].t1, code: QA[qi].code, t2: QA[qi].t2, k }; };
const rec = (i, n, st = 'end', out) => ({ i, out: out || CMDS[i].out, n: n == null ? (out || CMDS[i].out).length : n, st, exit: st === 'run' ? 0 : CMDS[i].exit, sec: st === 'run' ? '' : CMDS[i].sec });
const st = (f, patch = {}) => ({ ...S0, ...FRAMES[f].s, ...patch });

export const MOMENTS = [
  { k: '1', nm: '切走以后', d: '在 FILES 看文件时：CHANGES 写改了几个，ONE SHOT 一颗点（答完了），TERM 一把锁（模型在跑任务）。不会自己切走。', m: ['R1', 'R2'], s: st(3, { nf: 5 }), r: { tab: 2, th: [turn(0, 3)], unread: true } },
  { k: '2', nm: 'ONE SHOT · 空', d: '一句话说清它能读整个项目、不能改；任务进度和终端输出它看不到，用 + 带上。', m: ['R4', 'S1'], s: st(3), r: { tab: 1 } },
  { k: '3', nm: '指着文件问', d: '在 FILES 点 ONE SHOT 跳过来，那个文件带上了（青色）；问题写好，只有这里的 SEND 亮。', m: ['R10', 'K1'], s: st(4), r: { tab: 1, att: [false, true, false], od: 2, focus: 'os' } },
  { k: '4', nm: '在读', d: '带上终端输出问「这个报错是什么意思」；Muse 先读项目，写清在读哪个文件。', m: ['S2', 'R4'], s: st(4), r: { tab: 1, th: [turn(1, 0, '终端里 pnpm test 的输出')], tl: [rec(0)] } },
  { k: '5', nm: '答完', d: '回答上面写读了哪几个文件；CLI 答的写「订阅额度」，API 答的写这一问花了多少。下面只有 COPY 和 TO TASK。', m: ['R4', 'R5', 'W5'], s: st(4), r: { tab: 1, th: [turn(1, 3, '终端里 pnpm test 的输出')], tl: [rec(0)] } },
  { k: '6', nm: '谁来答', d: '点左下的选项片弹出菜单：CLI 一组、API 一组，当前那项青底；不管谁答都只读。', m: ['K10', 'R5'], s: st(4), r: { tab: 1, menu: true } },
  { k: '7', nm: '没配 Key', d: 'API 一组不列模型，只留一行「配 Key」当场填；Muse、Grok 照样能答。', m: ['S4', 'I7', 'K10'], s: st(4), r: { tab: 1, menu: true, nokey: true } },
  { k: '8', nm: 'FILES · 改过的', d: '树里的标法和 CHANGES 一样；预览里改过的行左边一条绿，代码不按语法上色。', m: ['R6', 'R7', 'C5'], s: st(5), r: { tab: 2, fsel: 2 } },
  { k: '9', nm: 'FILES · 删掉的', d: '删掉的文件名划掉；预览删之前的样子，字调暗，写明撤销能放回来。', m: ['R7'], s: st(5), r: { tab: 2, fsel: 5 } },
  { k: '10', nm: 'TERM · 锁着', d: '模型在跑任务，终端锁着：输入行一把锁，下面写清什么时候解锁；之前的输出照样能看、能带去 ONE SHOT。', m: ['R11', 'R2'], s: st(3), r: { tab: 3, tl: [rec(0)] } },
  { k: '11', nm: 'TERM · 失败', d: '做完就解锁。跑完写 EXIT 码和用时，不是 0 就红；旁边一个 ONE SHOT，带上这段输出去问。', m: ['R9', 'S3'], s: st(5), r: { tab: 3, tl: [rec(0)] } },
  { k: '12', nm: '你后来改的', d: '做完以后你跑了 pnpm format，改了 README.md。它不算进任务：撤销确认里写清它不动。', m: ['R12', 'I4'], s: st(6), r: { tab: 0, after: true, tl: [rec(1)] } },
];
export const WIDE = { s: st(4), r: { tab: 1, wide: true, th: [turn(0, 3)], tl: [rec(0)] } };

function frozen(def, entries) {
  // entries：[[前缀, state]]；返回画板脚本
  return `
  renderVals() {
    const V = ${V.toString()};
    const M2 = ${M2.toString()};
    const R = ${R.toString()};
    const D = ${JSON.stringify(DATA)};
    const dark = (this.props.theme ?? '${def}') === '深色';
    const noop = () => {};
    const HM = ${JSON.stringify(HM)}, HR = ${JSON.stringify(HR)};
    const F = ${JSON.stringify(entries)};
    const out = { root: ROOT + (dark ? 'dk' : 'lt') };
    const pick = this.props.mod != null ? ${JSON.stringify(TABS)}.indexOf(this.props.mod) : -1;
    F.forEach(([k, s0]) => {
      const s = Object.assign({}, s0);
      if (pick >= 0) s.tab = pick;
      const m = M2(V(s, dark), s);
      HM.forEach((x) => { m[x] = noop; });
      const r = R(s, m, D);
      HR.forEach((x) => { r[x] = noop; });
      r.m = m;
      out[k] = r;
    });
    return out;
  }`;
}

const FLOW_CSS = `
.pk.sfl{width:1760px;height:1380px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:20px;font-family:${SANS}}
.ft{display:flex;align-items:baseline;gap:18px}
.ft h1{font-size:22px;font-weight:600}
.ft p{font-size:13px;color:var(--tx2)}
.g12{flex:1;display:grid;grid-template-columns:repeat(6,253px);grid-template-rows:repeat(2,minmax(0,1fr));column-gap:32px;row-gap:24px;min-height:0}
.cell{display:flex;flex-direction:column;gap:10px;min-height:0}
.fr2{position:relative;width:253px;height:508px;overflow:hidden;box-shadow:0 0 0 1px var(--line2);flex:none}
.fr2 > .pk{position:absolute;left:0;top:0;transform:scale(.72) translate(-906px,-74px);transform-origin:0 0}
.cap{display:flex;flex-direction:column;gap:5px}
.ch{display:flex;align-items:center;gap:8px;white-space:nowrap}
.ch .k{${D};font-size:20px;line-height:1;color:var(--cy-tx);text-shadow:var(--dglow)}
.ch b{font-size:14px;font-weight:600}
.cap p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.cap .ms{display:flex;flex-wrap:wrap;gap:4px}
.cap .ms i{${D};font-size:12px;letter-spacing:.06em;line-height:17px;padding:0 5px;background:var(--raise);color:var(--tx2);clip-path:var(--notch);font-style:normal}
`;
function sideFlow() {
  const def = FLIP ? '浅色' : '深色';
  const cells = MOMENTS.map((f, i) => `<div class="cell"><div class="fr2" data-nolint="">${shell(`f${i}.`)}</div>
    <div class="cap"><p class="ch"><span class="k">${f.k}</span><b>${f.nm}</b></p><p>${f.d}</p><p class="ms">${f.m.map((x) => `<i>${x}</i>`).join('')}</p></div></div>`).join('');
  const entries = MOMENTS.map((f, i) => [`f${i}`, { ...RD, ...f.s, ...f.r }]);
  const body = `<div class="{{root}}"><div class="ft"><h1>右栏 · 12 个时刻</h1><p>和能点的那张是同一份界面，只截右栏，停在 12 个时刻。每格下面写这时候发生了什么、对应哪几条规则。</p></div>
  <div class="g12">${cells}</div></div>`;
  const logic = frozen(def, entries).replace('ROOT +', "'pk sfl doc dots ' +");
  const html = board({ title: '右栏 · 12 个时刻', css: `${CSS}\n${FLOW_CSS}`, body, props: PROPS.theme(def), logic, w: 1760, h: 1380 });
  return { file: 'S2d-SideFlow.dc.html', w: 1760, h: 1380, title: '右栏 · 12 个时刻（静止）', html };
}

function wide() {
  const def = FLIP ? '浅色' : '深色';
  const entries = [['w', { ...RD, ...WIDE.s, ...WIDE.r }]];
  const logic = frozen(def, entries).replace("const out = { root: ROOT + (dark ? 'dk' : 'lt') };", 'const out = {};');
  const props = { ...PROPS.theme(def), mod: { editor: 'enum', options: TABS, default: 'ONE SHOT', section: '看' } };
  const html = board({ title: '展开到宽栏', css: CSS, body: shell('w.'), props, logic });
  return { file: 'S2d-Wide.dc.html', title: '展开到宽栏 · 任务停下来问你，你在 ONE SHOT 里查（Tweaks 里换模块）', html };
}

export function boards() {
  return [side(), wide(), sideFlow()];
}
