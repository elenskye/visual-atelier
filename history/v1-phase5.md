# 到 v1.0 的计划 · Phase 0–5 的经过（归档于 2026-11-22）

2026-11-22 站主定把 `ROADMAP.md` 重写成短版，这些过程从那里挪过来，原样保留当时的写法。**只是历史，不是规则**：规则看 `CLAUDE.md`，现在的状态看 `ROADMAP.md`；Phase 5 的结论和三家的评估在根目录 `HANDOFF.md`（交接用，方向定了以后删）。

## Phase 0–4（都验收了）

当时的写法在 `history/v1-plan.md`（Phase 0–3）、`history/v1-phase4.md`（Phase 4，连说明、评估、站主挑的图标），逐条结果在 `history/changelog-2026-11.md`，摘要在 `CHANGELOG.md`。

| Phase | 版本 | 做了什么 | 验收 |
| --- | --- | --- | --- |
| 0 文档整理 | — | `history/`、同一件事只写一处 | 11-12 |
| 1 清理 | `0.10.0` | 画布只留要用的、每个方案一块 Explore Deck；通用问卷模板；三个 Design System 最新；改名删除和回收处 | 11-14 问卷 |
| 2 可信、顺手 | `0.11.0` | 连导一致、`npm run all` 全绿、Checks、Tweaks 记住、断网、有板有眼里批准退回 | 11-15 问卷 |
| 3 MCP | `0.12.0` | `dw mcp`，三家的配置都在仓库里 | 11-15 问卷；Antigravity 改成工作区插件以后还没连过，放进 Phase 5 的验收问卷 |
| 4 第二条线 | `0.13.0` | Codex、Argon 各在自己的分支上画格式条的 19 个图标，Git 规矩都守住；三版并排评估；站主挑了换 8 个（Pomelo 的会话换） | 11-16 问卷、站主挑 |

**Phase 1 留下的清理**（站主 11-15 定：验收以后就做，只留必要的、有效的；删掉的在 Git 历史里）：
- 本仓库的做完了（11-15）：Vermilion Explore 删了只为留档的四个文件，两份用完的验收问卷进了回收处。
- Pomelo 的写进 Pomelo 的 `docs/atelier-sync.md`「6」（冻结的 `p2-final/`、`p3-scheme/`，本机的 `archive/`，生成器里旧的默认页名，只为留档的说明）。
- **Peck 的交给 Peck 的会话**（站主转告）：`canvases/peck-explore/` 里跑不了的 `gen-v0.mjs`；冻结的 `project/src/s2/`、`s2b/`、`s2c/`（`s2c` 的板 11-13 就全删了；`s2`、`s2b` 还画着 R2 那页的六张，删生成器之前想好那页怎么留）；`README.md` 里只为留档的段落。

## Phase 5 · 新方案 pith（→ 0.14.0，11-17 开工，11-22 三家合进 main，还没挑）

- **为什么做**：站主的研究工作台 Pith 要一套 App 的视觉方案，正好拿来比三家用同一份本地工具（含 MCP）做出来的效果。站主 11-16 把 Pith 的视觉提前，所以 Phase 5 的验收就是 Pith 的视觉方案（Pith 那边是视觉期 V1）。Pith App 的背景在 `canvases/v1-phase56-questionnaire/pith-app.md`。挑定以后归 Pith 的会话：发版、同步进 Pith（V2）都由它做。
- **起新方案变顺了**（11-16 做完）：`dw scheme new <方案名>`（MCP `scheme_new`）从 `schemes/_template/` 复制、填名字、跑一遍 token 构建、质量检查、Design System 构建；模板改成一套能构建、能过检查的占位（tokens 五个文件、清单、字体、Design System 带 Cover）；`docs/architecture.md`「新方案怎么起」照着重写。
- **三家**（站主定的「Codex、Argon、Claude」）：Claude 是新开的 Claude Code 会话，和 Codex、Argon 一样在自己的 worktree、分支 `agent/<claude|codex|argon>/pith` 上做（`CLAUDE.md`「第二条线」，端口 4351、4331、4341）；本仓库的会话只评估。
- **简报**（站主 11-17 填的第 1 页，`db.json`）：Pith 是站主的数字花园，沉淀通俗、真实、可视化的知识资产。多一点淡雅、简约、灵动，少一点科技感、学术、机械。参考 Maggie Appleton 的 Digital Garden（灵动的小动效、淡雅的配色、简约）。动效是亮点，界面不能呆板、静止。交 Design System、一个动效、标志、一屏真的样子；明暗都要。用在 Pith 窗口、导出的报告和卡片、Word 选项卡。说明跟着加了动效那一项。
- **开工**（11-17）：三个 worktree 由 Pith 的会话照「第二条线」建好：`../visual-atelier-<claude|codex|argon>`，分支 `agent/<claude|codex|argon>/pith`，从带简报的 `main` 起。
- **同一份说明** `canvases/v1-phase56-questionnaire/phase5-brief.md`：简报就是站主在验收问卷第 1 页填的（pith 是什么、用在哪、多什么少什么、参考、第一版交什么、明暗），三家从 `db.json` 读；各交 `schemes/pith/`（token、标志、Design System）和 `canvases/pith-explore/` 一页两张板（总览、一屏真的样子），自检全过。
- **合并**（11-22，站主定）：三条分支都合进 `main`（Claude 那条真合并；Codex、Argon 两条只记下合并、不带文件），三家各只留最新一轮，放进同一块 Pith Explore（三页：Claude R3、Codex R5、Argon EX5），分支别的改动不要；`schemes/pith/` 先不建。被舍弃的轮次、三家的评估、对 Atelier 的分析写在 `HANDOFF.md`。三条分支、三个 worktree 等站主说再删。
- **还剩**：站主在 Pith Explore 里挑方向（或等 Pith 的架构理顺后再起一轮）；挑定以后建 `schemes/pith/`、`scheme.json` 记 `0.1.0`，仓库升 `0.14.0`。

## 当时「怎么走」一节

- 不定总日期，顺序比日期重要。和 Pomelo v0.9 两个会话同时做，不分先后。上一个 Phase 验收后下一个直接开工（`CLAUDE.md`「开工前」）。
- **验收**：看得见的（画布、图标、动效、方案）站主在 bench 里目视、批。工具、文档、MCP 由 Agent 给验证结果，再附一两条站主能自己试的命令。
- **版本**：每个 Phase 做完仓库升一位（Phase 1 是 `0.10.0`……Phase 5 是 `0.14.0`），Phase 6 收口是 `1.0.0`。版本写进 `package.json`（连 `package-lock.json`）和 `CHANGELOG.md`。站主打 tag `atelier-v<版本>`，和方案的 `<方案>-v<版本>` 分开。
- **Pomelo 要的设计不在这份计划里**：站主在 Pomelo 问卷里定了，由 Pomelo 的会话先在云端画布上出样子，批了再把成品导入 `schemes/pomelo/`，不挡这边。问卷这一份里列的「Pomelo 笔记模块要的设计」（A6）和「贴纸『有板有眼』改名」（A7）都归它。
