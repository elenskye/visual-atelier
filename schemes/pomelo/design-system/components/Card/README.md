# Card

首页的卡片和弹出的原记录：白卡，圆角 14，手画的边，一到两条胶带，两层柔和投影，歪一点。

**写法**：`<article class="pm-card" data-hand="card" data-seed="…" data-tilt="-1.2" data-tapes="1">`。底色 `color-card`（要淡色分区写 `--pm-card-bg: var(--color-cat-pink-tint)`）、圆角 `radius-card`、投影 `shadow-card` 在样式里；手画的边（线宽 1.9）、纸纹、胶带由 `Pomelo.paint` 画。标题 `pm-card-title`（17 粗），右边的小字放 `pm-card-meta`。横线本的待办加 `pm-card--lined`；左边一列缝线加 `data-stitches`。

**歪**：卡片 −2.2° 到 +2°（`data-tilt`），只歪纸、边和胶带那一层，字永远是正的。

**胶带**：`data-tapes="1"` 是贴在上边居中附近的薄荷胶带；`"2"` 再斜贴一个角的柚黄胶带。一张卡片最多两条。

**使用方提供**：标题、内容、种子（同一屏里每张卡片的种子不同，胶带位置也跟着种子走）。

**不要**：卡片套卡片；给卡片加彩色的左边框；字跟着卡片一起歪；一张卡片上贴两张以上的贴纸。
