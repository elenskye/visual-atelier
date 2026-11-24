# Pomelo Explore · 动效、空状态

Pomelo Explore「R4：动效、空状态」那一页：每格就是 `schemes/pomelo/motion/` 的一个零件：演示片段原样放进来，动效本身在挂上的 Design System 的 `bundle.css` 里（`build:ds` 从零件插进去），和导出的 GIF、bench 的 Motion Deck、Pomelo 用的是同一份。本地画布，站主在 bench 里看和批（每张板的「批准 / 退回」），结果记在 `db.json` 的 `review/<画板>`。

| 画板 | 内容 |
| --- | --- |
| `Motion-Controls.dc.html` | 控件的小动静 12 样（照 Phase 2 定稿）：按钮、开关、分段、下拉、勾选、评分、输入框、提示、删除、拖动排序、标签、鼠标提示 |
| `Motion-Faces.dc.html` | 柚子的 8 个表情：平常、在想、困了一直循环，其余放一次 |
| `Motion-Moments.dc.html` | 招牌时刻：问候、呼出柚子瓣、打「柚子」转一圈、柚子在想、柚子回答、全做完、空状态、拆信封、加载 |
| `Motion-Frame.dc.html` | 外框的动静：贴上、叠着的页、撕贴纸、贴纸簿、找东西的小票、翻小票 |
| `Motion-Eggs.dc.html` | 小彩蛋（Phase 2 定稿里的五个）：撕起柚子贴纸有句悄悄话、连戳柚子会晕、打「柚子」转一圈、全做完撒小贴纸、睡着和吓一跳 |
| `Motion-Worried.dc.html` | 柚子的第 9 张脸「担心」：和出错、平常并排 |
| `Motion-Empty.dc.html` | 8 张空状态插图（`schemes/pomelo/marks/empty/`），点一张再画一遍 |

打开画板时一格接一格放一遍；「再来一次」按零件 `motion.json` 的 `capture.steps` 重放（和导出 GIF 同样的时刻加同样的类名）；勾选、开关、分段、评分、下拉、标签、删除、信封、小票能直接点。东西放完就没了的几格（提示、删除、撕贴纸、小票）停一会儿回到开头的样子。明暗、配色在 Tweaks 里换；减弱动效用 bench 顶栏的开关（模拟系统设置，看到的就是零件自己的回退）。

**生成**：`gen.mjs` 写画布 `project/` 里这一页的画板（文件名带前缀）和 `canvas.json` 里这一页（别的页不动）（不手改），播放在 `play.js`。改了零件的 CSS 先重建 Design System 再挂一次。在仓库根目录：

```bash
npm run build:ds -- --scheme pomelo
```

```bash
node bench/bin/dw.js ds install pomelo-explore pomelo
```

```bash
node canvases/pomelo-explore/motion/gen.mjs
```

**看**：`node bench/bin/dw.js serve`，打开 http://127.0.0.1:4321/#/pomelo-explore?page=motion 。一个零件拖时间轴、一帧帧看、导 GIF：http://127.0.0.1:4321/#/motion/pomelo 。

**自检**：`node bench/bin/dw.js check pomelo-explore`，截图在 `canvases/pomelo-explore/.shots/check/`（打开那一刻，动画还没放）。

**云端**：没有，以本地为准。
