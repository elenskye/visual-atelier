# Pomelo Explore · 界面小图标

Pomelo Explore「R3：界面小图标」那一页：Pomelo 的界面小图标，全部自己画，替换 Lucide。本地画布，站主在 bench 里看和批（每张板的「批准 / 退回」），结果记在 `db.json` 的 `review/<画板>`，`node bench/bin/dw.js review pomelo-explore` 读。

| 画板 | 内容 |
| --- | --- |
| `Icons-Main.dc.html` | 第一批 81 个：方向、增删改、文件和文件夹、状态、柚子帮忙；每个 28 号和 16 号 |
| `Icons-Batch2.dc.html` | 第二批 68 个（含 Atlas 的「时间穿梭」）：模块的小图标、标签和自建模块能选的那些、柚子页的资料和记忆 |
| `Icons-InUse.dc.html` | 用起来的样子：按钮、列表行、工具行，浅色、暗色各一块 |

- **生成器**：`gen.mjs`。图标直接取 `schemes/pomelo/marks/icons/` 里生成好的 SVG，不另画一份；改了 `schemes/pomelo/marks/icons.mjs` 先跑 `node tooling/handmade/marks.mjs`，再在仓库根目录跑 `node canvases/pomelo-explore/icons/gen.mjs`。画布 `project/` 里这一页的画板（文件名带前缀）和 `canvas.json` 里这一页由它写（别的页不动），不手改。
- **Design System**：挂了 Pomelo 柚儿园（`project/ds/pomelo/`），Tweaks 里切配色和明暗。
- **看**：`node bench/bin/dw.js serve`，打开 http://127.0.0.1:4321/#/pomelo-explore?page=icons
- **自检**：`node bench/bin/dw.js check pomelo-explore`，截图在 `canvases/pomelo-explore/.shots/check/`。
- **云端**：没有，以本地为准。
