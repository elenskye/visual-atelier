# StickyNote

便签：一张黄色的便签纸贴在桌上，能拖能甩；便签纸不跟配色和明暗走，深色模式下也是浅色的纸。

**写法**：`<div class="pm-note" data-hand="note" data-seed="…" data-tilt="-2" data-tapes="1">`。底色 `color-sticky`、字色 `color-on-sticky`、投影 `shadow-note` 在样式里；便签没有手画的边，`Pomelo.paint` 只管歪和胶带。第一行可以是粗一点的小标题。

**用在**：首页桌面上随手记的事、打开 App 时一张张落下来的便签、提示（Toast）和鼠标提示的纸签。

**使用方提供**：两三行短字；种子；歪的角度（−2.2° 到 +2°）。

**不要**：便签写长段落；便签上的字用 `color-ink`（深色模式下会看不清，要用 `color-on-sticky`）；便签跟着配色换颜色。
