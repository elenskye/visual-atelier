# Pomelo Explore · 柚子、贴纸、App 图标

Pomelo Explore「R2：柚子、贴纸、App 图标」那一页：柚子的 8 个表情、菜单栏和 AI 按钮、模块贴纸、模块坞里的样子、App 图标的三种底、32 个通用贴纸、换颜色、选图标和颜色、空状态插图、设置和日历的贴纸。本地画布，站主在 bench 里看和批（每张板的「批准 / 退回」），结果记在 `db.json` 的 `review/<画板>`，`node bench/bin/dw.js review pomelo-explore` 读。

| 画板 | 内容 |
| --- | --- |
| `Marks-Main.dc.html` | 柚子 · 8 个表情（静态帧）和几个小号 |
| `Marks-Menubar.dc.html` | 菜单栏的实心、空心（实际大小和放大 4 倍，浅色和深色菜单栏）；顶栏右边的 AI 按钮 |
| `Marks-Modules.dc.html` | 20 个模块贴纸，按分类色排，60、40、26 号 |
| `Marks-Dock.dc.html` | 模块坞里的样子：置顶 40 号、分类里一行 26 号 |
| `Marks-AppIcon-grid.dc.html` · `Marks-AppIcon-mint.dc.html` · `Marks-AppIcon-kraft.dc.html` | App 图标的三种底（方格纸、薄荷桌面、牛皮纸），各一张；站主用方格纸 |
| `Marks-Library.dc.html` | 32 个通用贴纸，56、36、24 号 |
| `Marks-Colors.dc.html` | 换颜色：10 张贴纸各换成五种分类色 |
| `Marks-Picker.dc.html` | Pomelo 里「图标和颜色」那一块的样子（示意），和换过的模块坞一行 |
| `Marks-Empty.dc.html` | 8 张空状态插图和它们的那句话，浅色、暗色各一份（会动的样子在动效零件 `empty-state`） |
| `Marks-Places.dc.html` | 设置、日历的贴纸（64、46、26 号，和模块贴纸放一起）；滚动条的样子，浅色、暗色各一块能滚的卡片 |

- **生成器**：`gen.mjs`。图都直接取 `schemes/pomelo/marks/` 里生成好的 SVG，不另画一份（批过的前四张板用去掉换色挂钩的样子，文件不变，批准照旧有效）；改了 `schemes/pomelo/marks/art.mjs` 先跑 `node tooling/handmade/marks.mjs`，再在仓库根目录跑 `node canvases/pomelo-explore/marks/gen.mjs`。画布 `project/` 里这一页的画板（文件名带前缀）和 `canvas.json` 里这一页由它写（别的页不动），不手改。
- **Design System**：挂了 Pomelo 柚儿园（`project/ds/pomelo/`），Tweaks 里的配色、明暗按 `data-palette`、`data-theme` 切；App 图标那三张只有明暗（图标本身按蓝笔浅色定死）。
- **看**：`node bench/bin/dw.js serve`，打开 http://127.0.0.1:4321/#/pomelo-explore?page=marks
- **自检**：`node bench/bin/dw.js check pomelo-explore`，截图在 `canvases/pomelo-explore/.shots/check/`。
- **云端**：没有，以本地为准。
