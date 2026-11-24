# 到 v1.0 收口（2026-11-22～11-24）

**只是历史，不是规则。** 2026-11-24（仓库 1.0.1）`ROADMAP.md` 重写时从那里原样挪来：Phase 5 收尾、Phase 6 收口当时的写法，「到 v1.0 要做到的」，和用完的授权。版本号后来改了（站主 11-24：整个仓库从 1.0.0 起，`0.14.0`、`atelier-v1.0.0` 这两个号不用了）；Phase 6 的冷启动验收、三个旧 Skill 过一遍、Design System 都最新、`npm run all` 全绿在 1.0.1 做完（`CHANGELOG.md`）。站主 11-24 重建了 Git，文中的旧提交号只在旧 `.git` 备份里。验收问卷 `canvases/v1-phase56-questionnaire/`（第 1 页是 pith 的简报，`phase5-brief.md`、`pith-app.md` 也在里面）在冷启动验收过以后删了，在提交 `b85f15d` 里还有。

## 当时的「现在」（2026-11-24）

- **仓库 `0.13.0`。站主 11-22 定了三步**：
  1. 合并 Phase 5 的三条分支：**做完**。三家各最新一轮在 Pith Explore 里对比过，站主没挑三家的，改成本仓库照新架构再做（EX4–EX11）；三家的评估、对 Atelier 的分析在 `history/pith-phase5.md`（这一轮等于用三家 Agent 测了一遍 Atelier，结果不如人意）。
  2. 照 `history/pith-phase5.md` 第 3.4 节改 Atelier：**做完**。设计功夫 Skill（`skills/design-craft/`）和简报模板、探索和定稿分两档门槛、`dw frames` 看动效、画布运行时换新并提示过期、共用零件（`canvases/_lib/`、`tooling/fonts/`）、`CLAUDE.md` 和本文件重写成短版（`CHANGELOG.md` 11-22）。
  3. 看 Pith 的架构、理顺架构：**做完**。新架构（对话做首页，知识库是文献库和对话之间的一层，排版、调查、概念变成技能，角色学 Deva，程序不限制模型）站主 11-22 认了，写在根目录 `HANDOFF.md` 第 1–5 节和 `canvases/v1-phase56-questionnaire/pith-app.md`。**下一步**：Pith 的会话把它写进 Pith 自己的文档；Pith 的设计 11-24 定稿（下面「方案」那行）。
- **方案**（每个方案一行，各会话只改自己那一行）：
  - **Vermilion** `1.5.0`：网站线上在用，没有新工作。Design System「Vermilion 朱红」（https://claude.ai/artifact/B89E9carxtZjjkT4adbNer ）和画布 Vermilion Explore 在现用账号，旧账号那两份只看。
  - **Pomelo** `1.0.0`（11-16 收口）：Design System「Pomelo 柚儿园」（https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3 ，现用账号）按 1.0.0 发了；方案和设计都由 Pomelo 的会话做（`schemes/pomelo/DESIGN.md`、`canvases/pomelo-explore/README.md`），要接进 Pomelo 的写进 Pomelo 的 `docs/atelier-sync.md`。
  - **Peck** `0.1.0`（站主 11-10 批）：Design System「Peck」在现用账号，由 Peck 的会话做（`schemes/peck/CLAUDE.md`）。
  - **Pith** `0.1.0`（站主 11-24 验收 EX11 后建，`logo-grow` 待批）：`schemes/pith/`（两套配色、36 个资产、七个动效零件、12 个组件的 Design System，Design System 还没发到 Claude）；视觉基线和开发说明在 `schemes/pith/DESIGN.md`。Pith Explore 本地只留 R1「Pith 定稿」（从方案生成），EX1–EX11 在 Git 历史里，云端那份（旧账号）不清理。以后由 Pith 的会话做（同步进 Pith 照 `docs/adoption.md`）；WonderLab 的 `pith-wonder-*` 等 Pith v0.5 再起。
- **几个会话一起做**：本仓库、Pomelo、Peck、Pith 各一个（`CLAUDE.md`「几个会话怎么分」、`docs/sessions.md`）。

## 当时的「接下来」

- **Pith 设计**：**定稿**（11-22～11-24，EX4–EX11，经过在 `CHANGELOG.md`）。站主 11-24 验收 EX11，说「开始做优化页、建 schemes/pith/」，还要 Logo 从茎到碗连起来、不留缝，并把 Atelier 里 Pith 的东西清得只剩最终一轮、Design System、Motion Deck（云端不清理）：都做了，本地会话合并以后按这套开发 Pith。还没定的几样在 `schemes/pith/DESIGN.md` 第 8 节。Pith 自己的文档由 Pith 的会话改（`HANDOFF.md` 5.1）。
- **Phase 5 收尾**（→ `0.14.0`）：方向挑定、`schemes/pith/` 0.1.0 建好（11-24）。还剩：Pith 的会话把 `HANDOFF.md` 第 1–5 节写进 Pith 的文档以后删掉它；站主打 tag。GitHub 上的三条 `agent/*/pith` 分支站主自己删（云端会话的 Git 代理不让删分支）。
- **Phase 6 · v1.0 收口**（→ `1.0.0`）：三个旧 Skill 过一遍（`design-loop`、`questionnaire`、`skill-evolver`）；开一个新会话只照文档冷启动一遍（验收问卷 `v1-phase56-questionnaire` 第 4 页），卡住的地方补上；三个 Design System 在现用账号里都是最新版（Pomelo 的由 Pomelo 的会话按新版本发）；`npm run all` 全绿；站主打 `atelier-v1.0.0`。
- **别的会话的清理**（Phase 1 留下的，细节在 `history/v1-phase5.md`）：Pomelo 的写在 Pomelo 的 `docs/atelier-sync.md`「6」；Peck 的交给 Peck 的会话。
- **以后**（不挡 v1.0）：Peck 方案的后续视觉；Vermilion 的新工作（网站、PPT、动图）；MCP 接 Pomelo 的柚子和 Peck。
- **不做**：Pomelo Explore 发回云端（以本地为准）；在 bench 里看云端的版本历史。

## 到 v1.0 要做到的（站主 2026-11-12）

1. **Agent 不用命令行也能用**：`dw` 的 MCP 能做的和命令行一样多（Phase 3 做了）。
2. **产出稳定可信**：同一份源导出两次逐字节一样；`npm run all` 全绿。
3. **云端是新的**：三个 Design System 在现用账号里是最新版；画布以本地为准，云端可以旧。

每个 Phase 做完仓库升一位（Phase 5 是 `0.14.0`），Phase 6 收口是 `1.0.0`；版本写进 `package.json`（连 `package-lock.json`）和 `CHANGELOG.md`，站主打 tag `atelier-v<版本>`。看得见的东西站主在 bench 里目视、批；工具、文档、MCP 由 Agent 给验证结果，附一两条站主能自己试的命令。

## 用完的授权（2026-11-15～11-24）

- **第二条线**：做版的 Agent 能在自己的分支 `agent/<名字>/<任务>` 上提交（站主 2026-11-15 批，`docs/sessions.md`「第二条线」）；Phase 4、5 的分支、worktree 都已经合并或删掉。2026-11-22 站主定：Pith 新架构写进本仓库的那一批推到 `agent/claude/pith`（从 `main` 新开），站主看过再合并。
- **Pith Explore 发到旧账号的云端**（站主 2026-11-21）：只为 Pith Explore 这一块破「旧账号只看不动」的例，在旧账号里建了一块 Design 画布（地址在它的 `README.md` 和 `cloud.json`），本地仍是真身；11-22 换成三家对比的三页。
- **本仓库的会话直接推 `main`**（站主 2026-11-22）：合并 Phase 5 的三条分支、第二步改 Atelier，都允许本仓库的会话提交并推到 `main`。
- **合并 Pith 的设计、删分支**（站主 2026-11-24，在 Pith 的会话里）：`agent/claude/pith` 并进 `main`，本地三条 `agent/*/pith` 和 GitHub 上的 `agent/claude/pith` 都删了。站主之后会删掉 GitHub 上的仓库、清掉本地历史重新 `git init`。
- **Pith 改目录名**（站主 2026-11-23，在 Pith 的会话里）：Pith 仓库从 `personal-research-lab` 改名为 `pith`，允许 Pith 的会话改本仓库里指向旧路径的地方，提交并推到 `main`。
- **改别的会话负责的地方**（站主 2026-11-24，仓库 1.0.1 这一轮）：「任何其他项目负责的地方，你现在都能改，拿不准就问我」。用来：Pomelo Fold 并进 Pomelo Explore、`schemes/pomelo/` 加零件 `fold` 发 1.0.1 并重发 Design System；`schemes/pith/` 定为 1.0.0、发 Design System、在现用账号新建 Pith Explore；`schemes/peck/` 版本定为 1.0.0；`tooling/atlas/`、`tooling/handmade/`、`tooling/pith/` 和各画布生成器的代码精简。
