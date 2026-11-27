# CLAUDE.md（方案）

继承仓库根目录的 `CLAUDE.md`。本方案的气质、禁用项、色板与动效数值以同目录 `DESIGN.md` 为准；与根规则冲突时，以根规则为准并告知站主。

`AGENTS.md` 是指向本文件的软链接。

- **谁做**：本方案由 Pomelo 的会话做（2026-11-12 起），计划在 Pomelo 的 `docs/roadmap.md`；它在本仓库能改什么见根目录 `CLAUDE.md`「几个会话怎么分」。
- **新设计怎么来**（站主 2026-11-12 定）：先在现用账号的云端画布上出样子，站主在那里批；批了再把成品导入本仓库：源进 `canvases/pomelo-<名字>/`（照 `design-loop` Skill 拉回、核对），资产进本目录。然后发版、打 tag、同步。
- 改任何视觉基线前，先完整阅读 `DESIGN.md`。
- `approved` 的资产不改几何与参数，要改开新版本。
- 本方案的 token 与规则不得借用其他方案。内容图标是唯一的例外，只给「呦呦漫游」的内容图标选择器用，Pomelo 自己的界面不用。
- 不写 `tokens/graphic.json`：那是 Vermilion 的图形语言。本方案的手作零件走 `tooling/handmade/`，参数在 `tokens/handmade.json`。
- 演示只用假数据：待办、书名、金额都编。Pomelo 的真实数据目录不得进入本仓库。
- Design System「Pomelo 柚儿园」（https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3 ，现用账号；旧账号那份 https://claude.ai/artifact/4GgAtgCdS5fBcX9Fp4t4NU 只看不动）只从本目录生成：改 token、规则、组件或资产后，改 `design-system/` 与相关源文件，重建并按 `tooling/README.md` 发布；不在 Design System 页面上直接改。
- `DESIGN.md` 没写到的决定（谁在什么时候定的、每轮的过程）查 `history/` 和 `ROADMAP.md`，定过的不重复询问站主。
