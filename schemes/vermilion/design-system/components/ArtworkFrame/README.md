# ArtworkFrame

关于页右栏的图片位：一个和页面同色的大图框，作品按原比例完整放在里面；有多张时，左右两个圆形箭头在悬停时出现。

**结构** `aside.about-media`（纵向，间距 `space-7`）里放两种图框，都是 `radius-md`、`color-page` 底、超出部分裁掉：

- 肖像 `figure.about-portrait`：高 `min(82vh, 720px)`（窄屏 `min(64vh, 520px)`），图片 `object-fit: cover`。每次打开随机选一张。
- 作品 `figure.about-artwork`：高 `min(74vh, 660px)`，图片 `object-fit: contain`，四周空白和页面融为一体，看不出框。
- 箭头 `button.artwork-arrow`：44px 圆形，`color-surface` 底、1px `color-line` 描边、图标 17px `color-muted`，垂直居中、离边 12px。平时透明，悬停图框或聚焦时出现（180ms）；触屏设备常显。悬停箭头时描边和图标变 `color-ember`。

**使用方提供**：肖像与作品图片列表、切换脚本、`aria-label`（「上一张」「下一张」）。图片不加说明文字。

**不要**：给作品加相框、阴影或说明；把作品裁成统一比例；让箭头常显在桌面上。
