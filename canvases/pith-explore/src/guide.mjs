// R1 的说明板：这一页是什么、方案在哪、怎么用。说明用系统字体，只是标注。
import { esc } from '../../_lib/board.mjs';

export const W = 2720;
export const H = 620;
const DECIDED = [
  '花园笔记（Maggie Appleton 的样子）：奶油纸、衬线、海蓝和绯红、生长阶段、页边注；「字会长」',
  '对话做首页：打开时一片叶子从对话框长出去；顶栏只有 Logo 和三个图标；没有搜索框（⌘K）、没有侧栏按钮（⌘\ 或两指横滑，枝桠）',
  '两套配色：纸与海（默认）、雾与赭，各有明暗；设置 › 外观、⌘K 换，换的时候五圈湖面波纹',
  '图形语言「铅字 × 数字花园」：实心一粗一细，一处珊瑚色；Logo 蕨芽；知识库叶序、文献库夹叶的书、设置轮生',
  '动效：舒展（回答、页边注）、生长（存卡、Logo、顶栏图标）、上墨（悬停）；Pith 在想照 Claude Code 做十四个 Agent 图标',
  '站主 11-24 验收 EX11；Logo 从茎到碗一口气长出来、不留缝（这一页改的）',
];
const BOARDS = [
  ['App', '能点的原型：发问看状态行和「在想」、点编号看页边注、存卡看种子落到知识库图标、设置 › 外观换配色看湖面波纹、⌘\ 叫出枝桠'],
  ['Logo', '蕨芽怎么长：大图一直演、五段时间、亮暗字标（放鼠标再长）、App 图标和小尺寸、按时间截的分解'],
  ['顶栏', '一条真的顶栏能悬停；三个图标各一行：大图一直演、按时间截的分解'],
  ['Pith 在想', '十四个 Agent 图标和状态行；「存进知识库」的分解'],
  ['图标', '整套：顶栏、界面、十种记录、生长阶段，用起来的两条'],
];
const ASK = [
  ['方案在哪', 'schemes/pith/：tokens（两套配色、字、动效）、marks（36 个 SVG，tooling/pith/ 生成）、motion（七个动效零件）、design-system（12 个组件）、DESIGN.md（视觉基线和开发说明）。'],
  ['在 bench 里看', 'node bench/bin/dw.js serve：Design System 在 /#/ds/pith，Motion Deck 在 /#/motion/pith（悬停、舒展、生长、湖面波纹都在那里一个个看、导出 GIF）。'],
  ['开发 Pith 时', '照 schemes/pith/DESIGN.md 和 Design System 的 bundle.css（类名 pith-）；同步进 Pith 照 docs/adoption.md，每次站主说一声。'],
];

export function guide() {
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>Pith · R1 说明</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
html,body{margin:0}
.g{--bg:#f6f5f1;--card:#fff;--fg:#353534;--muted:#6b6865;--line:#e3e3e0;--acc:#00758f;--coral:#f4806b;box-sizing:border-box;width:${W}px;height:${H}px;padding:36px 44px;display:grid;grid-template-columns:640px 900px minmax(0,1fr);column-gap:48px;background:var(--bg);color:var(--fg);font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Noto Sans SC",sans-serif;-webkit-font-smoothing:antialiased}
.g[data-theme="dark"]{--bg:#1d1c1a;--card:#262522;--fg:#efede8;--muted:#c4c0b8;--line:#36342f;--acc:#6fdbe9;--coral:#ff9b86}
.g *{box-sizing:border-box}.g :where(h1,h2,h3,p,ol,li,dl,dt,dd){margin:0;padding:0}.g ol{list-style:none}
.g .kick{font:600 11px/1 ui-monospace,monospace;letter-spacing:.08em;color:var(--acc)}
.g h1{margin-top:8px;font-size:30px;line-height:1.25;font-weight:600}
.g .lede{margin-top:12px;font-size:13.5px;line-height:1.75;color:var(--muted)}
.g h3{margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:.06em;color:var(--muted)}
.g li{position:relative;padding:5px 0 5px 16px;font-size:13.5px;line-height:1.55}
.g li::before{content:"";position:absolute;left:2px;top:12px;width:6px;height:6px;border-radius:50%;background:var(--coral)}
.g dl{display:grid;grid-template-columns:110px 1fr;gap:10px 18px}
.g dt{font-size:14px;font-weight:600}
.g dd{font-size:13.5px;line-height:1.65;color:var(--muted)}
.g .ask{display:flex;flex-direction:column;gap:14px}
.g .ask section{padding:16px 20px;border:1px solid var(--line);border-radius:14px;background:var(--card)}
.g .ask h2{font-size:15px;font-weight:600;color:var(--acc)}
.g .ask p{margin-top:6px;font-size:13.5px;line-height:1.7}
</style>
</helmet>
<div class="g" data-theme="{{theme}}">
<div><p class="kick">R1 · Pith 定稿</p><h1>花园笔记 × 铅字 × 数字花园</h1>
<p class="lede">Pith Explore 只留这一页：EX1–EX11 的探索在 Git 历史里（云端那份还留着）。这一页的颜色、图形、动效都从 schemes/pith 来，和 Design System、Motion Deck 是同一份。</p>
<h3 style="margin-top:18px">定下来的</h3><ol>${DECIDED.map((t) => `<li>${esc(t)}</li>`).join('')}</ol></div>
<div><h3>这一页的板（从左到右）</h3><dl>${BOARDS.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></div>
<div class="ask">${ASK.map(([a, b]) => `<section><h2>${esc(a)}</h2><p>${esc(b)}</p></section>`).join('')}</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"theme":{"editor":"enum","options":["light","dark"],"default":"light","section":"外观"},"$preview":{"width":${W},"height":${H}}}'>
class Component extends DCLogic {
  renderVals() { return { theme: this.props.theme === 'dark' ? 'dark' : 'light' }; }
}
</script>
</body>
</html>
`;
  return { html, w: W, h: H };
}
