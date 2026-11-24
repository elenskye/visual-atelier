# CLAUDE.md（方案）

继承仓库根目录的 `CLAUDE.md`。本方案的气质、禁用项、色板与动效数值以同目录 `DESIGN.md` 为准；与根规则冲突时，以根规则为准并告知站主。

`AGENTS.md` 是指向本文件的软链接。

- 这是 Peck（`~/Documents/GitHub/personal-cli-studio/peck`，站主的本地 Coding Agent）的方案，0.1.0 站主 2026-11-10 批了，2026-11-24 内容不变定为 1.0.0。Peck 的计划在它自己的 `docs/roadmap.md`，规则在它的 `CLAUDE.md`；本仓库的 `ROADMAP.md` 不记 Peck。
- 改任何视觉基线前，先完整阅读 `DESIGN.md`；外框怎么放（三栏、右栏四个页签、卡片、权限三档）在同目录 `peck-rules.md`。
- `approved` 的资产不改几何与参数，要改开新版本。
- 本方案的 token 与规则不得借用其他方案（Vermilion、Pomelo）；不写 `tokens/graphic.json`、`tokens/handmade.json`。
- **源从哪来**：0.1.0 的全部文件由画布 `canvases/peck-explore/` 的第 4 步生成器（`project/src/s4/`）生成，画布里 `project/scheme/` 是同一份。改方案先改生成器、在画布上给站主看，批了再复制过来；不直接手改这里的生成文件。不是生成的：`CLAUDE.md`、`AGENTS.md`、`sync.json`、各目录的 `README.md`、`type/fonts/`（两个 OFL 字体和许可原文）。
- **Design System**：只从本目录生成（`npm run build:ds`，`tokens.config.json` 的 themes、fonts、scaleGroups 都要认）；云端那份是现用账号的「Peck」（`design-system/published.json`）。不在 Design System 页面上直接改。
- **和别的会话互不冲突**（本仓库的会话、Pomelo 的会话，见根目录 `CLAUDE.md`「几个会话怎么分」）：做 Peck 的会话只碰 `schemes/peck/`、`canvases/peck-*/` 和两份索引里自己的那一行；不碰 `schemes/pomelo/`、`schemes/vermilion/`、`bench/`、`tooling/`、`docs/`、`ROADMAP.md`、`CHANGELOG.md`，除非站主针对这一次同意。动索引前先 `git status`，有别人没提交的改动就不动。
- 演示只用假数据：项目名、任务、文件路径都编，不出现站主真实项目的路径。
- 同步到 Peck 只走 `sync.json`（Peck 的 `src/vendor/peck/`），tag 叫 `peck-v<版本>`；由站主打 tag，Agent 核对 tag 再同步。
