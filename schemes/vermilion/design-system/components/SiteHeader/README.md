# SiteHeader

每页顶部的页头：左边 Logo A 标志（不放名字），中间四个导航，右边三个圆形图标按钮，底部一条 `color-line` 横线。

**结构**：`header.site-header` 是三栏网格（`minmax(120px, 1fr) auto minmax(44px, 1fr)`，栏间 `space-5`，宽度 `width-chrome`）。

- Logo：`a.va-logo-route` 内联 Logo A 的 SVG（不能用 `<img>`，否则没有悬停动效），`aria-label` 写名字。悬停或聚焦时上浮 2px，虚线路径 520ms 画出，终点圆圈抵达时变 `color-ember`。同页多个 Logo 时，mask 的 id 要各自唯一。2026-11-01 起页头不放名字（站主决定；2026-10-31 曾放转曲线的名字）。
- 导航：`nav.site-nav` 里放 `a.nav-link`，文字 `color-muted`、`text-sm`；悬停、聚焦和当前页变 `color-ember`，同时 1.5px 青绿下划线从两端收拢。当前页加 `.is-active` 和 `aria-current="page"`。
- 图标按钮：`.icon-toggle`，44px 圆形，1px `color-line` 描边，图标 20px、`color-accent-strong`；悬停时描边变 `color-accent`、底色 `color-accent-soft`、上浮 2px。明暗切换按钮 `.theme-toggle` 显示「将要切换到」的模式：浅色时显示月亮，暗色时显示太阳。

**使用方提供**：导航文字与链接、当前页、三个按钮的 `aria-label` 和行为（搜索链接、语言切换、明暗切换脚本）。

**窄屏**（≤ 760px）：导航换到第二行，左对齐、可横向滚动。

**不要**：在页头加背景色、阴影或第二条横线；导航超过一行文字；用 Emoji 当图标。
