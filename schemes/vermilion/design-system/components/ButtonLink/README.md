# ButtonLink

网站唯一的按钮样式：透明底、1px `color-accent` 描边、`color-accent-strong` 文字、`radius-sm` 圆角，最小高度 44px。

**写法**：类名 `button-link`，写在 `<a>` 或 `<button>` 上，外层要在 `.vm-page` 里：

```html
<a class="button-link" href="/">返回呦呦漫游</a>
<button class="button-link" type="button">展开全部（64）</button>
```

**用在**：返回首页、展开全部、发邮件、下载简历、搜索提交。一屏里可以有几个并排（间距 `space-4`–`space-5`），它们同等重要。

**状态**：悬停或聚焦时描边加深为 `color-accent-strong`、底色变 `color-accent-soft`，过渡 180ms；焦点环是 2px `color-focus`。按钮不变朱红：朱红留给链接和选中状态。

**使用方提供**：动词开头的短文案（「返回呦呦漫游」「搜索」「展开全部（64）」）；用 `a` 还是 `button` 取决于是跳转还是操作。

**不要**：做实心填充按钮、朱红按钮或带阴影的按钮；把文案写成长句。网站没有「主按钮 / 次按钮」之分。
