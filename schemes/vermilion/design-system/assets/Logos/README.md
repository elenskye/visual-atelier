# Logos

Logo A v1.0.0：点状虚线路径加终点圆圈。不改几何、线宽和虚线节奏，不加阴影、渐变或外框。

- `logo-mark.svg`：标志，64 网格，单色线稿，用 `currentColor`。放进页面时内联并用 `color-accent-strong` 上色；用 `<img>` 显示时 `currentColor` 不生效，会显示成黑色。要做悬停动效时也必须内联（见 SiteHeader）。
- `logo-mark-light.png` / `logo-mark-dark.png`：标志的 512px 位图，已用 `color-accent-strong` 的浅色、暗色值上色，透明底，分别放在浅色、暗色页面上；适合直接贴进画布或幻灯片。
- `logo-lockup.svg`：标志加字标「Elen Skye」，单色，用 `currentColor`（通常 `color-text`）。字标是 Noto Serif SC 600 的文字，不同设备上字形会略有不同。
- `logo-lockup-paths.svg`：同一个字标，文字已转成曲线，各处显示一致，优先用它；`logo-lockup-paths-light.png` / `-dark.png` 是 584 × 128 的位图，用 `color-text` 上色。
- `wordmark.svg`：只有名字「Elen Skye」（转曲线），取景框接在标志的 64 网格后面（`64 0 228 64`）：和标志同高并排，就是 `logo-lockup` 的排法。网站页头不放名字（2026-11-01 起）。
- `logo-mono-black.svg` / `logo-mono-white.svg`：纯黑、纯白版，颜色写死，用于单色场合或照片上。
- `app-icon-180.svg`：应用图标，暖纸底、圆角 36，青绿标志，颜色写死。
- `favicon-light.png` / `favicon-dark.png`：浏览器标签页图标（32 网格的小号标志）的 128px 位图，浅色、暗色各一张。网站用的是一个按系统明暗自动切换的 SVG；资产库会去掉 SVG 里的样式，所以这里给位图。
- `apple-touch-icon.png`：iOS 主屏图标，180px 位图。
