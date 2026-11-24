# StatusState

没有内容和找不到页面时的两种状态：一个带插图的空状态框，和一整页双语 404。两张插图都是图形语言的矢量图，外背景透明。

**空状态** `section.wander-empty`：`color-surface` 底、1px `color-line` 描边、`radius-md`、内边距 `space-6`、居中。插图是内联的 `marks/graphic/empty-graphic.svg`，加 `va-graphic status-illustration status-illustration--empty`（最宽 320px，明暗跟随主题；要用 `<img>` 时取 `assets/Illustrations/empty-graphic-*.svg`），下面一句 `color-muted` 的文案。筛选结果为空、搜索无结果、集合为空时都用它，加 `role="status"`。

**404 页**（`main.page-shell.page-shell--narrow.not-found`）：PageHeading 的写法（小标题「404」、大标题、导语）→ 插图 `figure.status-illustration--404`（最宽 560px，里面是内联的 404 插图片段 `.va-draw-v2.va-not-found`，打开页面时写一次）→ 英文段落 `.not-found-en`（衬线 1.8rem 标题 + `text-lg` 说明，`lang="en"`）→ 返回按钮 `.not-found-actions`（两个 ButtonLink，间距 `space-5`）。

**文案**：先说现状，再给出路，语气平静。404 用「走到了地图之外」/「Beyond the edge of the map」，延续「漫游」的说法。

**图形语言**：空状态插图（纸山 + 提按笔 + 圆相）2026-10-31 起取代旧位图 `wander-empty-cloud-pages-oops.png`；404 插图「折页」（地图纸折起一角，笔冲出纸边，圆相落在纸外）2026-11-02 起取代旧位图 `wander-error-cloud-pages-404.png`。它用描边绘制（calm，640ms）在打开页面时写一次，减弱动效时静态；要用 `<img>` 时取 `assets/Illustrations/not-found-*.svg`。

**使用方提供**：状态文案、返回链接。

**不要**：手改插图的几何或颜色；在空状态里放朱红或警告色；用「出错了！」这类语气。
