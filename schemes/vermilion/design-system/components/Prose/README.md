# Prose

长文排版：文章、月度日志、履历补充内容的正文都放进 `.prose`，标题、段落、链接、引用、表格、代码都已排好。

**文章头**（`.wander-article`，最宽 720px）：元信息行 `.wander-article-meta`（`text-xs`、`color-muted`，项目之间自动插入 `color-line` 的「·」）→ `h1`（衬线 2.6rem、行高 1.2）→ 摘要 `.wander-article-summary`（`type-summary`，`color-muted`）→ 正文 `.wander-article-body.prose` → 文末落款 `.wander-article-end`（见下）。

**正文规则**：

- 段落与列表：`type-prose`（衬线 1.12rem、行高 1.9），段距 `space-5`。
- 二级标题 1.55rem、三级标题 1.28rem，都是衬线 400；标题上方留白比下方大。
- 链接：自动套用 TextLink 的效果。
- 引用：左边 2px `color-accent` 竖线，文字 `color-muted`。这是网站唯一的彩色竖线。
- 图片：居中、最宽 100%，1px `color-soft-line` 描边，`radius-sm`。
- 表格：无衬线 `text-sm`，1px `color-line` 格线，表头 `color-surface-cool` 底、500 字重；超宽时横向滚动。
- 行内代码与代码块：等宽，`color-surface-cool` 底；代码块 `radius-md`、1px `color-soft-line` 描边。
- 分隔线：1px `color-line`，上下 `space-6`。

**文末落款**（2026-11-02 起）：正文结尾居中放一个 40px 的「笔势与纸片」小图形，三版——抵达、远山、三点——每次打开文章随机显示一版（`end-mark.js` 的 `initEndMark`），第一次滚进视口时用描边绘制写一次（calm，640ms），减弱动效时静态；不用朱红。只放在有正文的文章里。写法：`.wander-article-end` 里放 `end-mark.fragment.html`（`.va-end-mark` 包着三版 `.va-draw-v2`），与正文之间 `space-6`，与返回链接之间 `space-7`。

**使用方提供**：Markdown 渲染出的 HTML，外面包一层 `.prose`。

**不要**：在正文里改字体或加粗整段；给引用加底色；把正文放宽到 720px 以上。
