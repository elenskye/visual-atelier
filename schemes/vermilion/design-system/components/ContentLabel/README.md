# ContentLabel

内容类别与日期的小标签：纯文字、没有底色和边框，`text-xs`，最小高度 26px。

- `.content-label`：类别名（写作、项目、画廊、创作），`color-accent-strong`。
- `.date-label`：日期，`color-muted`，只到月份：中文页「2026年7月」，英文页「Jul 2026」。
- 放进元信息行（`.wander-card-meta` 或 `.wander-article-meta`）时，第二项起自动在前面插入 `color-line` 的「·」，间距 `space-2`。

**使用方提供**：类别名、语言、日期。

**不要**：给标签加胶囊底色或描边（网站唯一的胶囊徽标是朱红计数，见 PageHeading）；显示具体到日的日期。
