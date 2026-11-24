# PageHeading

每页开头的标题区：大写的页面小标题、衬线大标题（可带一个朱红徽标），下面一段灰色导语。

**结构**（网站放在 `main.page-shell` 开头）：

- `p.page-eyebrow`：英文页面名，`text-xs`、大写、不加字距、`color-accent`，下距 18px。
- `.page-title-row`：`h1` 加可选徽标，间距 `space-4`。`h1` 是 `type-display`（衬线 4.2rem、400、行高 0.95），窄屏 2.9rem，≤ 440px 2.6rem。
- 徽标 `.page-count`：1px `color-ember` 描边的胶囊，朱红数字，补零到两位（`08`），要带 `aria-label`（「08 篇」）。文字版 `.page-count--text` 放一个短状态词。
- `p.page-intro`：导语，`type-lead`（1.5rem、行高 1.75），`color-muted`，最宽 760px；窄屏 1.18rem。

**计数**（`calm`，零件 `count-up`）：呦呦漫游的数量徽标载入时从 `00` 数到实际篇数（320ms），每次打开网站只数一次。写法：徽标加 `va-count is-playing` 和 `style="--va-count-to: <数值>"`，真实数字包在 `span.va-count-value` 里；页面 `<head>` 里放 `motion/visit-once.js`。

**页头留白**：标题区不放分区装饰（2026-11-01 站主决定）。

**页面宽度** `.page-shell`：标准 980px；`--wide` 用 `width-wide`；`--narrow` 820px；`--split` 1120px；上留 `space-8`、下留 `space-9`。

**使用方提供**：小标题、标题、导语文案；数量或状态词。

**不要**：一页出现两个 `h1`；给大标题加粗或上色；导语写成多段。
