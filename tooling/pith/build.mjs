// Pith 的资产：从 tooling/pith/glyphs.mjs 写出 schemes/pith/marks/ 的 SVG 和 manifest.json。
// 每个 SVG 两用：单独打开时靠属性上色（实心 currentColor、细线描边、珊瑚色 var(--color-coral)）；
// 内联进页面时保留 .t .so .st .co 这些类名，动效零件（schemes/pith/motion/）和 Design System 照类名动它。
// 用法（仓库根目录）：node tooling/pith/build.mjs            写文件
//                     node tooling/pith/build.mjs --check    只比对，不一样就报出来（退出码 1）
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOGO, logoGrow, ICON, TYPE, STAGE, AGENTS, appIcon } from './glyphs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MARKS = path.join(ROOT, 'schemes/pith/marks');
const check = process.argv.includes('--check');
const sha = (s) => createHash('sha256').update(s).digest('hex');
// App 图标的颜色：纸与海的 app-ink、app-paper、app-coral（唯一的一份在 color.json）
const APP = JSON.parse(readFileSync(path.join(ROOT, 'schemes/pith/tokens/color.json'), 'utf8')).palettes['paper-sea'].light;

/** 内联标记 → 单独能看的 SVG：按类名补上属性。特殊的几个（读原文的高亮、引用编号里的字、后台任务的轨道……）照动效 CSS 的静止样子给。 */
const PAINT = [
  [/\bhi\b/, 'style="fill:var(--color-coral, currentColor);opacity:.4"'],
  [/\bpp\b/, 'style="fill:none;stroke:var(--color-page, white);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"'],
  [/\bmer\b/, 'fill="none" stroke="currentColor"'],
  [/\bco\b/, 'style="fill:var(--color-coral, currentColor)"'],
  [/\bst\b/, 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"'],
  [/\bso\b/, 'fill="currentColor"'],
];
const OPACITY = [[/\btrk\b/, '.22'], [/\bedge\b/, '.45']];
function standalone(inner) {
  return inner.replace(/<(path|circle|rect|ellipse) class="([^"]*)"/g, (m, tag, cls) => {
    const paint = PAINT.find(([re]) => re.test(cls));
    const op = OPACITY.find(([re]) => re.test(cls));
    return `<${tag} class="${cls}"${paint ? ' ' + paint[1] : ''}${op ? ` opacity="${op[1]}"` : ''}`;
  });
}
// var() 写不进属性，用到变量的都写成 style（引用编号里的「1」用 page 色画在珊瑚方块上）
const svgFile = (inner, cls) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="pith-glyph ${cls}">${standalone(inner)}</svg>\n`;

const approved = '站主 2026-11-24 验收 Pith Explore EX11（「验收完毕，开始做优化页、建 schemes/pith/」）';
const src = { generator: 'tooling/pith/build.mjs', geometry: 'tooling/pith/glyphs.mjs', rules: 'schemes/pith/DESIGN.md §4' };
const TYPES = [['full', '全文'], ['excerpt', '摘抄'], ['note', '笔记'], ['web', '网页快照'], ['file', '本机文件'], ['scan', '扫描件'], ['concept', '概念卡'], ['report', '调查报告'], ['wonder', 'WonderLab 作品'], ['answer', '存下的回答']];
const STAGES = [['seed', '刚种下'], ['sprout', '长着'], ['evergreen', '常青']];
const ICONS = [['kb', '知识库', '叶序：一根茎上三片互生的叶，顶上一颗珊瑚色的芽'], ['lib', '文献库', '三本书，中间那本夹着一片叶当书签'], ['set', '设置', '轮生：一圈六片叶围着一个环，环心是珊瑚色的髓'], ['new', '新对话', '一颗芽从横线上长起来'], ['search', '搜索 ⌘K', '放大镜，镜里一颗种子'], ['send', '发送', '一根细线推着实心的箭头']];

const assets = [];
const files = new Map();
const add = (id, title, file, body, extra = {}) => { files.set(file, body); assets.push({ id, title, file, kind: 'svg', status: 'approved', approved, colorMode: 'currentColor', ...extra, source: src, sha256: sha(body) }); };

add('logo', 'Logo · 蕨芽', 'logo/pith.svg', svgFile(LOGO, 'pith-logo'), { use: '顶栏左边（30px）、关于页；配 Newsreader 500 的「Pith」字标。最小 16px。' });
add('logo-grow', 'Logo · 蕨芽（会长的那一版）', 'logo/pith-grow.svg', svgFile(logoGrow('m'), 'pith-logo'), {
  status: 'proposed', approved: undefined,
  use: '只在动效里用（schemes/pith/motion/logo-grow/）：茎和碗一笔长出来，再卷进去，最后结果。不动的时候和 logo 一样。页面上有几个时，遮罩的 id（lgm-m-1/2/3）要换成不重的。',
  notes: '站主 11-24 要的修正：茎到碗不停顿、接口不留缝（茎伸进碗里 1，碗的后段用窄一点的遮罩）。待站主看过。',
});
add('app-icon', 'App 图标', 'logo/app-icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${appIcon(LOGO).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace('class="ap-bg"', `fill="${APP['app-ink']}"`).replace(/class="so"/g, `fill="${APP['app-paper']}"`).replace(/class="co"/g, `fill="${APP['app-coral']}"`)}</svg>\n`, {
  colorMode: 'fixed', use: '纸与海的 App 图标：墨色圆角方、纸色的蕨芽、珊瑚色的果。颜色是 color.json 里纸与海的 app-ink、app-paper、app-coral。',
  renders: [1024, 512, 256, 128, 64, 32, 16].map((size) => ({ size })),
});
for (const [id, t, use] of ICONS) add(`icon-${id}`, `图标 · ${t}`, `icons/${id}.svg`, svgFile(ICON[id], `pith-icon pith-icon--${id}`), { use });
TYPES.forEach(([id, t]) => add(`type-${id}`, `记录 · ${t}`, `types/${id}.svg`, svgFile(TYPE[id], `pith-type pith-type--${id}`), { use: `知识库卡片的类型标签（16px，第二色）：${t}` }));
STAGES.forEach(([id, t], k) => add(`stage-${id}`, `生长阶段 · ${t}`, `stages/${id}.svg`, svgFile(STAGE[k], `pith-stage pith-stage--${id}`), { use: '交付卡、知识库卡片上的生长阶段（强调色）；界面不写阶段的名字' }));
for (const a of AGENTS) add(`agent-${a.id}`, `Agent · ${a.name}`, `agents/${a.id}.svg`, svgFile(a.g, `pith-agent pith-agent--${a.id}`), { use: `${a.when}。状态行：「${a.line}」。动画在 motion/agents/（${a.dur}）` });

const manifest = { scheme: 'pith', $note: 'Pith 的资产，全部由 node tooling/pith/build.mjs 从 tooling/pith/glyphs.mjs 生成，别手改（改几何改 glyphs.mjs 再跑）。SVG 单独打开靠属性上色，内联时保留 .t .so .st .co 类名给动效用。status 见 docs/workflow.md；approved 的不改几何，要改开新的。', assets: assets.map((a) => JSON.parse(JSON.stringify(a))) };
files.set('manifest.json', JSON.stringify(manifest, null, 2) + '\n');

const changed = [];
for (const [rel, body] of files) {
  const f = path.join(MARKS, rel);
  const old = existsSync(f) ? readFileSync(f, 'utf8') : null;
  if (old === body) continue;
  changed.push(rel);
  if (!check) { mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, body); }
}
if (check) {
  if (changed.length) { console.log(`schemes/pith/marks/ 和生成器不一致：${changed.join('、')}`); process.exitCode = 1; } else console.log(`schemes/pith/marks/ 是最新的（${assets.length} 个资产）`);
} else console.log(`pith marks：${assets.length} 个资产，${changed.length ? `写了 ${changed.length} 个文件` : '都没变'}`);
