# marks

Pith 的图形，全部由 `node tooling/pith/build.mjs` 从 `tooling/pith/glyphs.mjs` 生成（清单 `manifest.json`，`--check` 核对），别手改：

- `logo/`：`pith.svg` 蕨芽 Logo；`pith-grow.svg` 会长的那一版（只在 `motion/logo-grow/` 用）；`app-icon.svg` App 图标（颜色写死，纸与海）。
- `icons/`：顶栏三个（kb、lib、set）、界面三个（new、search、send）。
- `types/`：知识库的十种记录。`stages/`：生长阶段（seed、sprout、evergreen）。
- `agents/`：十四个 Agent 图标的静止样子（会动的在 `motion/agents/`）。

单独打开靠属性上色（实心 `currentColor`、细线描边、珊瑚色 `var(--color-coral)`）；内联进页面时保留 `.t .so .st .co` 和部件的类名（`.stem`、`.l1`、`.b3`、`.w0`……），动效照类名动。
