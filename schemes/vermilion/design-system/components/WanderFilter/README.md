# WanderFilter

卡片墙上方的筛选栏：左边一行可横向滚动的话题（单选），右边一个带数量的类别下拉（多选），两者同时生效。

**话题** `.filter-topics`：大写标签 `.filter-eyebrow`（`type-filter-label`、`color-muted`）→ 左箭头 → 话题横排 `.topic-scroll`（间距 `space-5`，隐藏滚动条）→ 右箭头。

- 话题 `button.topic-chip`：纯文字、`text-md`、`color-text`，点击区 44px 高；悬停和选中都是 `color-ember`。选中用 `aria-pressed="true"`，同一时间只选一个。
- 选中指示（`calm`，零件 `selection-slide`）：`.topic-scroll` 加 `va-slide`，末尾放 `span.va-slide-indicator`（`aria-hidden`）；选中项下方一条 1.5px `color-accent` 下划线，左右各缩进 6px 贴着文字。换选时滑到新话题（220ms），取消时淡出，第一次选中原地淡入；位置由 `selection-slide.js` 的 `moveSlideIndicator` 量出来。
- 圆形箭头 `button.topic-arrow`：可见圆圈 30px（1px `color-line`），透明点击区 44px；图标 15px、`color-muted`；悬停时圆圈变 `color-accent`、图标变 `color-accent-strong`。

**类别下拉** `.filter-category`：

- 开关 `button.category-toggle`：宽 210px、高 44px、`color-surface` 底、1px `color-line` 描边、`radius-sm`；悬停或展开时描边变 `color-accent`，展开时箭头转 180°。文字是「全部类别」或「N 类已选」。
- 面板 `.category-panel`：在开关正下方 8px、与开关等宽，`color-surface` 底、1px `color-soft-line` 描边、`radius-md`、`shadow-soft`。第一行「全部类别」清除选择（下面一条 `color-soft-line`），之后每行一个复选框 + 类别名 + 数量（`text-sm`、`color-muted`）；行悬停时底色变 `color-page`，复选框用 `color-accent`。

**使用方提供**：话题与类别列表、每类数量、选中状态，以及滚动、展开、筛选的脚本（预览只是静态示意）。展开时设 `.is-open` 和 `aria-expanded="true"`，收起时给面板加 `hidden`。

**不要**：把话题做成胶囊或标签底色；把下拉做成原生 `<select>`；让面板盖住开关。
