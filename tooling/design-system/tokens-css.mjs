// tokens.json → tokens.css，照 Design System 页的编译规则（format.md「tokens.css as compiled」），和它要从
// Google Fonts 取的字体（fontLinks）。build:ds 用它写发布用的 project/tokens.css，check:ds、bench（dw ds install、
// Design System 页）和问卷模板（skills/questionnaire/template/vermilion.mjs）也用它，都是这一份。没有依赖。
/** 按 Design System 的编译规则，把 tokens.json 变成 CSS 变量。 */
export function tokensCss(t) {
  const [first, ...rest] = t.color.themes.map((x) => x.id);
  const val = (v, theme) => (typeof v === 'string' ? v : v[theme] ?? v[first]);
  const ref = (v) => v.replace(/^\{(.+)\}$/, 'var(--$1)');
  const themed = (theme) => [...t.color.tokens, ...t.shadow.tokens].map((x) => `  --${x.name}: ${ref(val(x.value, theme))};`).join('\n');
  // 颜色、阴影之外的 { tokens: [...] } 家族（spacing、radius、width、text、leading……）都是不分明暗的变量
  const flat = Object.keys(t).filter((k) => !['color', 'shadow', 'type'].includes(k) && Array.isArray(t[k]?.tokens)).flatMap((k) => t[k].tokens.map((x) => `  --${x.name}: ${x.value};`));
  const fonts = Object.entries(t.type.families).map(([k, v]) => `  --font-${k}: ${v};`);
  const styles = t.type.groups.flatMap((g) => g.styles.map((s) => {
    const fam = s.family ?? g.family;
    const decl = [`font-family: var(--font-${fam})`, `font-size: ${s.fontSize}`, s.lineHeight != null && `line-height: ${s.lineHeight}`, s.fontWeight != null && `font-weight: ${s.fontWeight}`, s.letterSpacing && `letter-spacing: ${s.letterSpacing}`].filter(Boolean);
    return `.${s.name} { ${decl.join('; ')}; }`;
  }));
  return [`:root, [data-theme="${first}"] {\n${themed(first)}\n}`, ...rest.map((id) => `[data-theme="${id}"] {\n${themed(id)}\n}`), `:root {\n${[...flat, ...fonts].join('\n')}\n}`, ...styles].join('\n') + '\n';
}

// Mac 自带的字体：Google Fonts 上没有，不去请求（Peck 的字体栈里写了 Hiragino Sans GB，请求只会得到 400）
const MAC_FONTS = ['PingFang SC', 'PingFang TC', 'Hiragino Sans GB', 'Hiragino Sans', 'Hiragino Mincho ProN', 'Songti SC', 'STSong', 'Heiti SC', 'STHeiti', 'Kaiti SC', 'Hannotate SC', 'Hanzipen SC', 'Yuanti SC', 'Lantinghei SC', 'SF Pro', 'SF Pro Text', 'SF Pro Display', 'SF Mono', 'Menlo', 'Monaco', 'Helvetica Neue', 'Helvetica', 'Arial', 'Times New Roman', 'Georgia', 'Apple Color Emoji'];

/**
 * tokens.json 字体栈里要从 Google Fonts 取的字体，按样式里用到的字重（100–900）取，和 Design System 页一样。
 * 每个栈开头带引号的名字是网页字体，后面的是后备；跳过 meta.localFonts（只在本机有的字体，如 Pomelo 的手札体）、
 * Mac 自带的字体和随 Design System 打包的字体（type.fonts）。
 */
export function fontLinks(t) {
  if (!t?.type) return [];
  const local = new Set([...(t.meta?.localFonts || []), ...MAC_FONTS]);
  const weights = new Set([400]);
  for (const g of t.type.groups || []) for (const st of g.styles || []) if (st.fontWeight) String(st.fontWeight).split(/\s+/).forEach((w) => weights.add(Number(w)));
  const hosted = new Set((t.type.fonts || []).map((f) => f.family));
  const names = [];
  for (const stack of Object.values(t.type.families || {})) {
    for (const part of stack.split(',').map((x) => x.trim())) {
      const q = /^"(.+)"$/.exec(part);
      if (!q) break;
      if (!hosted.has(q[1]) && !local.has(q[1]) && !names.includes(q[1])) names.push(q[1]);
    }
  }
  const w = [...weights].filter((x) => x >= 100 && x <= 900).sort((a, b) => a - b).join(';');
  return names.map((n) => `https://fonts.googleapis.com/css2?family=${encodeURIComponent(n).replace(/%20/g, '+')}:wght@${w}&display=swap`);
}
