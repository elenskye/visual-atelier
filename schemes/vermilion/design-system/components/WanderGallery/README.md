# WanderGallery

画廊：中间一个固定大小的主图框，两侧是淡出的上一张、下一张；每张图都按原比例完整显示，横竖切换时页面不移动。点主图进入铺满视口的放大态。

**页面态** `section.wander-gallery > .gallery-stage`：三栏（侧图 `minmax(72px, 0.24fr)`、主图、侧图），间距 `space-4`。

- 主图框 `.gallery-frame`：高 `clamp(360px, 65svh, 720px)`；里面的 `button.gallery-zoom` 底色是 `color-page`、没有边框和圆角，图片 `object-fit: contain`。同色无框，所以竖图两侧留出的空白和页面融为一体。
- 侧图 `button.gallery-preview`：`radius-md`、不透明度 0.32、缩小到 0.96，朝主图一侧用遮罩淡出；悬停或聚焦时不透明度 0.72、恢复原大（200ms）。点侧图，它连续滑进中央。
- 计数 `p.gallery-counter`：`type-counter`（等宽 `text-xs`）、`color-muted`、居中，「2 / 5」。
- 只有一张图时用 `.gallery-stage--single`，不显示侧图和计数。

**放大态** `.gallery-lightbox`：固定铺满视口，`color-page` 底，四周留 `clamp(12px, 3vw, 32px)`；只显示当前这张，不提供切换。右上角关闭按钮 44px 圆形（1px `color-line`、`color-muted`，悬停变 `color-ember`）。保留焦点、锁住滚动，Esc 关闭，关闭后焦点回到原处。

**窄屏**（≤ 720px）：侧图收窄到 `minmax(48px, 16vw)`，间距 `space-2`。

**使用方提供**：图片列表（保持原比例）、切换与放大的脚本、方向键和触屏滑动。预览里的色块只示意构图。

**不要**：把图片裁成统一比例；给主图加边框、阴影或圆角；在放大态里放左右切换。
