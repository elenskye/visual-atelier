// tokens.json → tokens.css，照 Design System 页的编译规则（format.md「tokens.css as compiled」）。
// build:ds 用它写发布用的 project/tokens.css，check:ds 和 bench 的 dw ds install 也用它，三处同一份。
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

