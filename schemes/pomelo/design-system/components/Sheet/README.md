# Sheet

模块页的纸：摊在桌面上的一张大纸，左边一列缝线点，手画的边，带纸纹；蓝笔的纸是 22px 一格的方格纸。

**写法**：`<section class="pm-sheet" data-hand="sheet" data-seed="…">`。底色 `color-paper`、方格 `color-grid`、圆角 `radius-paper`、投影 `shadow-sheet` 都在样式里；手画的边（线宽 1.9）、缝线（间隔 20、半透明的笔色）和纸纹由 `Pomelo.paint` 画。标题用 `pm-sheet-title`（26 粗），副题 `pm-sheet-sub`。纸可以歪一点点（`data-tilt="-0.2"`），字不歪。

**用在**：每个模块的主页面（1140 × 716，`width-sheet`）、简报、弹出来的大张纸。开着的别的页叠在右边。

**使用方提供**：内容；纸的宽高（模块页固定 1140 × 716）。左边留出 48px（`space-9`）给缝线。

**不要**：在纸上画表格竖线（用整行底色和留白分行）；纸上再套一层同样的纸；把整张纸连字一起转。
