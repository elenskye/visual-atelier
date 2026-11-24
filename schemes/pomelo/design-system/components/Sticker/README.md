# Sticker

贴纸的画法（S3 线描贴纸）：手画的墨线，填色比墨线错开一点，外面一圈模切的白边，轻投影，歪着贴。模块图标、柚子、统计数字、打卡都是贴纸。预览里的星星只是画法样张，不是资产。

**参数**（`Pomelo.params.sticker`，64 格）：墨线 3.3、抖动 0.75；填色错开 (1.4, 1.8)；白边 4.2；投影向下；歪 ±8°。墨线是 `color-art-ink`（钢笔家族是笔色，色面家族是墨色），白边 `color-art-white`，投影 `color-art-shadow`，填色是分类色。贴纸在深色模式下也是浅的。

**写法**：
- 画法样张：`<span data-hand="sticker" data-cat="orange" data-tilt="-8">`；`data-stage` 写 `line`、`fill`、`white` 看每一步。
- 自己的图形：`Pomelo.hand.stickerSvg({ cat: 'mint', parts: [{ t: 'shape', d: Pomelo.hand.P('M… Z'), fill: 'cat', seed: 1 }] }, Pomelo.params.sticker, 颜色表)`，parts 还能是 `line`、`dot`、`blush`（见 sticker.mjs 的说明）。
- 纸星星：`<span data-hand="pstar" style="color: var(--color-cat-pink-sticker)">`，鼓鼓的五角星；最重要的几颗用金星 `data-gold`（柚黄、描墨线）。

**大小**：模块贴纸行内 24 / 26 / 30，桌面下排 52–60；App 图标源图 1024。

**使用方提供**：图形（正式的柚子、模块贴纸、通用贴纸在 Assets 的 Pomelo、Modules、Stickers，先用那里的，别自己画一个冒充）、分类、种子、歪的角度。

**不要**：一张卡片上超过一张贴纸；贴纸上写字（数字贴纸用 `color-on-sticky`）；用运行时的 SVG 滤镜做抖动。
