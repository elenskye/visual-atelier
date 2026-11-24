# CLAUDE.md（方案）

继承仓库根目录的 `CLAUDE.md`。本方案的气质、禁用项、色板与动效数值以同目录 `DESIGN.md` 为准；与根规则冲突时，以根规则为准并告知站主。

`AGENTS.md` 是指向本文件的软链接。

- 这是 {{title}} 的方案（`dw scheme new {{name}}` 从 `schemes/_template/` 建的）。给谁用、由哪个会话做，写在这里。
- 改任何视觉基线前，先完整阅读 `DESIGN.md`。
- `approved` 的资产不改几何与参数，要改开新版本。
- 本方案的 token 与规则不得借用其他方案。
- Design System 只从本目录生成：改 token、规则、组件或资产后，改 `design-system/` 与相关源文件，`npm run build:ds -- --scheme {{name}}` 重建，按 `tooling/README.md` 发布；不在 Design System 页面上直接改。
- 探索和审看都加成 `canvases/{{name}}-explore/` 的一页（`canvases/README.md`「Explore Deck 的规矩」）。
