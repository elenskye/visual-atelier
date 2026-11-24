// 画板（project/*.dc.html）的外壳，和 Claude 画布同一种格式（skills/design-loop、bench/README.md）：
// 生成器写一张板只管 <helmet>、正文和逻辑，外壳、Tweaks 的转义都在这里。几屏放在同一张板里、共用一份状态用 screens()。
// 探索页可以不用生成器、直接手写画板（canvases/README.md「两档门槛」）；写生成器时用这里的，别各写一份。

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** data-props 属性的值（单引号包着）：先 JSON，再转义 & 和 '（format.md：只有这三种要转义）。 */
export const propsAttr = (props) => JSON.stringify(props).replace(/&/g, '&amp;').replace(/'/g, '&#39;');

const DEFAULT_SCRIPT = `
class Component extends DCLogic {
  renderVals() { return {}; }
}`;

/**
 * 一张画板的完整源码。
 * @param {object} o
 * @param {string} o.title        <title>
 * @param {string} [o.lang]       正文的语言，默认 zh-CN
 * @param {string} [o.head]       support.js 那行后面的 <link>、<script>（挂的 Design System 的 tokens.css 之类），每行带换行
 * @param {string} [o.helmet]     <helmet> 里的东西（Google Fonts 的 <link>、<style>），带结尾换行
 * @param {string} o.body         <x-dc> 里的标记（根元素固定宽高）
 * @param {object} [o.props]      data-props：Tweaks 加 $preview: { width, height }
 * @param {string} [o.script]     class Component extends DCLogic { … }，开头带换行
 */
export function dcBoard({ title, lang = 'zh-CN', head = '', helmet = '', body, props = {}, script = DEFAULT_SCRIPT }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<script src="./support.js"></script>
${head}</head>
<body>
<x-dc>
<helmet>
${helmet}</helmet>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${propsAttr(props)}'>${script}
</script>
</body>
</html>
`;
}

/**
 * 几屏放在同一张板里、共用一份状态（format.md：要共享状态的流程做成一张板，每屏一个 <sc-if>）。
 * list：[{ when: 'isChat', html }]，when 是 renderVals() 里的布尔值；第一屏是加载时先画的那屏。
 */
export const screens = (list) =>
  list.map(({ when, html }, i) => `<sc-if value="{{${when}}}" hint-placeholder-val="{{ ${i === 0 ? 'true' : 'false'} }}">\n${html.trim()}\n</sc-if>`).join('\n');
