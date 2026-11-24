# SiteSearch

站内搜索：一个输入框加一个描边按钮，下面一行状态，再下面是一列结果卡。

**结构** `section.site-search`：

- 表单 `form.site-search-form[role=search]`：标签 `label`（`text-sm`、`color-muted`）→ `.site-search-controls`（输入框 + 按钮两栏，间距 `space-3`；≤ 440px 改上下排）。
- 输入框：48px 高、`color-surface` 底、1px `color-line` 描边、`radius-sm`；占位文字 `color-muted`（76% 不透明）；聚焦时描边变 `color-accent`，同时有焦点环。按钮用 ButtonLink。
- 状态 `p.site-search-status`：`text-sm`、`color-muted`，`aria-live="polite"`；没内容时隐藏。
- 结果 `ol.site-search-results > li.site-search-result > a`：每条一张卡，`color-surface` 底、1px `color-soft-line` 描边、`radius-md`、内边距 `space-5`，卡间 `space-4`。标题 `h2`（衬线 1.28rem、`color-accent-strong`），摘要 `p`（`color-muted`），元信息 `.site-search-result-meta`（`text-xs`、`color-accent-strong`）。悬停时描边变 `color-accent`、上浮 2px，标题变 `color-ember`。
- 等待：搜索 250ms 后仍没有结果时，在状态行下方居中显示 LoadingEnso（`.site-search-loading`，`aria-hidden`，由状态行播报「正在搜索……」），结果出来即隐藏；快的搜索不会闪一下。
- 没有结果时显示 StatusState 的空状态插图（矢量）。

**使用方提供**：搜索索引与脚本、状态文案（「正在搜索……」「没有找到相关内容。换一个词试试。」）、结果数据。

**不要**：给结果卡加缩略图或阴影；把搜索框做成胶囊。
