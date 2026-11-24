# CLAUDE.md（方案）

继承仓库根目录的 `CLAUDE.md`。本方案的气质、禁用项、色板与动效数值以同目录 `DESIGN.md` 为准；与根规则冲突时，以根规则为准并告知站主。

`AGENTS.md` 是指向本文件的软链接。

- 这是 Pith（站主的 macOS 研究工作台，`~/Documents/GitHub/pith`，GitHub `elenskye/pith`）的 App 方案。0.1.0 由本仓库的会话照站主 2026-11-24 验收的 Pith Explore EX11 建，同一天站主批了 `logo-grow`，定为 1.0.0。以后由 Pith 的会话管（根目录 `CLAUDE.md`「几个会话怎么分」）；WonderLab 作品另起 `pith-wonder-<名字>`，不和这里共用 token。
- 改任何视觉基线前，先完整阅读 `DESIGN.md`。
- `approved` 的资产不改几何与参数，要改开新版本。
- 本方案的 token 与规则不得借用其他方案（Vermilion、Pomelo、Peck）；悬停只借了 Vermilion 的做法，数值是 Pith 的。
- **源从哪来**：
  - 图形的几何只有 `tooling/pith/glyphs.mjs` 一份，`node tooling/pith/build.mjs` 写出 `marks/` 的 SVG 和 `manifest.json`（`--check` 核对）；不手改 `marks/` 里的文件。
  - 动效零件的 CSS、片段、规格手写在 `motion/<零件>/`；片段用 `<!-- @include marks/… -->` 直接放图标文件，不另存一份。
  - Design System 只从本目录生成（`npm run build:ds -- --scheme pith`），`bundle.css` 末尾由构建插进第二套配色和全部动效零件；不在 Design System 页面上直接改。
  - 画布 `canvases/pith-explore/` 的 R1 从这里取颜色、动效（`src/scheme.mjs` 用 Design System 的运行时）和图形（`src/marks.mjs` 用 `tooling/pith/`），不另写一份。
- 改了就验：`node tooling/pith/build.mjs --check`、`npm run qa -- --scheme pith`、`npm run build:ds -- --scheme pith`、`npm run check:ds -- --scheme pith`、`npm run build:motion -- --scheme pith`；画布 `node canvases/pith-explore/src/build.mjs` 后 `dw check pith-explore`。
- 同步进 Pith 照 `docs/adoption.md`：单向复制已发版本，每次站主说一声。
