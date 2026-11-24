# WanderCard

「呦呦漫游」卡片：有封面时是带表面色和阴影的图片卡，没有封面时是融进页面的无图卡，标题左侧放分类图形。整张卡是一个链接。

**图片卡** `a.wander-card.wander-card--image`：`color-surface` 底、1px `color-soft-line` 描边、`shadow-soft`、`radius-md`；封面 `figure.wander-card-media > img` 裁成 16:10；正文区内边距 `space-4`。

**无图卡** `a.wander-card.wander-card--plain.va-glyph-trigger`：常态透明、无描边，两栏（44px 分类图形 + 内容，间距 `space-3`），内边距 `space-4`。图形用 CategoryGlyph 的三笔版：写作、项目、画廊、创作各一个（标记取 `motion/category-glyph-hover/single/<类别>.fragment.html`，每张卡的遮罩 id 换成唯一前缀）；没有对应图形的类别退回 Lucide `route`（`.wander-card-icon`，22px、线宽 1.6、`color-accent`）。卡片窄时（四列在 761–1023px、两列在 441–599px）图形移到标题上方。

**卡片内容** `.wander-card-body`：标题 `h2`（`type-card-title`，衬线 1.45rem）→ 摘要 `p`（`text-sm`、`color-muted`）→ 元信息 `.wander-card-meta`（类别标签 · 语言 · 月份，见 ContentLabel）。

**悬停与聚焦**：整卡上浮 3px，标题变 `color-ember`；无图卡此时出现 `color-surface` 底、`color-soft-line` 描边和 `shadow-soft`，分类图形一笔笔写出（`expressive`，700ms），纸片改取 `color-surface-cool`；图片卡阴影略加深。

**卡片墙** `.wander-wall`：桌面 4 列、窄屏 2 列、≤ 440px 1 列，间距 `space-4`。网站用 4px 行高加脚本计算的行数做瀑布流；没有脚本时设 `grid-auto-rows: auto`。

**使用方提供**：标题、摘要、类别、语言、月份、封面图（可选）、链接。封面图加载失败时给卡片加 `.has-missing-image`，会退回分类图形（图片卡里预先放一个 `.wander-card-glyph--fallback`）。

**不要**：给卡片加彩色边、标签胶囊或按钮；在一张卡里放两个链接；把封面裁成别的比例。
