# Pomelo Fold

Pomelo 侧栏的展开 / 收起动效（零件 `motion/fold` 的提议，站主 2026-11-24 在三种里挑了 C：Bear 的节奏加柚儿园的弹）。状态：**待批**。

- 云端（现用账号）：https://claude.ai/artifact/U7ieNnEjrX3dEdF2427atr
- 画板：`project/Main.dc.html`，1040 × 880：标签树、文件夹、分组三栏，点有箭头的行展开收起，「再来一次」全部重放。挂了 Design System「Pomelo 柚儿园」（`project/ds/pomelo/`）。
- 提议的零件 CSS 写在画板的 `<helmet>` 里（类名 `pm-fold`、`pm-fold-chev`，关键帧 `pm-fold-in`、`pm-fold-out`），批了原样搬进 `schemes/pomelo/motion/fold/`。
- 没有生成器，直接改 `project/` 里的文件。

看：`node bench/bin/dw.js serve`，打开 http://127.0.0.1:4321/#/pomelo-fold?board=Main.dc.html

自检：`node bench/bin/dw.js check pomelo-fold`；动效 `node bench/bin/dw.js frames pomelo-fold --board Main.dc.html`。
