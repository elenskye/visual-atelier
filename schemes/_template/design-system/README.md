{{title}} 的 Design System：写给用它的 Agent。一段话说清这套方案是什么样子、给谁用。

## 怎么用

- 页面或画板最外层写 `class="{{name}}"`（字体、字号、正文色、页面底都从这里来）。
- **明暗**：根上写 `data-theme="dark"` 是深色，不写是浅色。两边的变量名一样。
- **样式**：先 `tokens.css`，再 `components/bundle.css`。挂到画布上时，画板在 `support.js` 那行后面依次写 `<link rel="stylesheet" href="ds/{{name}}/tokens.css">`、`<link rel="stylesheet" href="ds/{{name}}/components/bundle.css">`。
- **类名**都以 `{{name}}-` 开头，修饰写 `{{name}}-button--primary` 这样。每个组件写在 `components/<名字>/README.md`，预览就是它的标准写法。

## 颜色

- 底和面：`color-page` 是页面底，卡片、弹层是 `color-surface`，线是 `color-line`。
- 字：正文 `color-text`，说明 `color-text-2`。
- 强调：`color-accent`，上面的字 `color-on-accent`。
