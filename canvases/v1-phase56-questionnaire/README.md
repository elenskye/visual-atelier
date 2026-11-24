# Phase 5 & 6 验收问卷

到 v1.0 计划 Phase 5（新方案 pith，三家各起一版）和 Phase 6（收口）站主要做、要记的（2026-11-16）。单个页面，只在本地填。照 `skills/questionnaire/template/` 做（Vermilion 朱红）。

| 页 | 什么时候填 | 内容 | 题号 |
| --- | --- | --- | --- |
| 1 pith | 先填，提交以后才开工 | pith 是什么、用在哪、多什么少什么、参考、第一版要交什么、明暗：三家的简报 | what、where、more、less、refs、deliver、theme |
| 2 开工 | 开工时 | 提交、建三个 worktree、开三个会话 | P1–P3（矩阵） |
| 3 三家 | 三家交了以后 | 每家：MCP、冷启动、交了方案和板、只在自己的分支上提交 | claude1–4、codex1–4、argon1–4（矩阵） |
| 4 收口 | Phase 5 挑完、Phase 6 整理完以后 | 新会话冷启动、三个 Design System 最新、`npm run all` 全绿 | Z1–Z3（矩阵）、coldreport（文字） |
| 5 核对 | — | 模板自动加的 | — |

- **给三家的说明**：`phase5-brief.md`（同一份）。Pith App 的背景在 `pith-app.md`（Pith 的会话 11-16 写的）；简报是这里 `db.json` 第 1 页的答案。规矩在 `docs/sessions.md`「第二条线」。
- **填**：开着 `node bench/bin/dw.js serve`（或有板有眼里启动的），打开 http://127.0.0.1:4321/#/v1-phase56-questionnaire
- **读答案**：`node bench/bin/dw.js db v1-phase56-questionnaire survey/answers`（或 MCP 的 `db_get`）

## 本仓库的 Claude 会话验收时做的

1. **Phase 5**（11-22 做了，站主改了做法）：三条分支都合进 main，三家各只留最新一轮，放进 Pith Explore 的三页对比（不另开临时画布）；评估和被舍弃轮次的流程在 `history/pith-phase5.md`（原在根目录 `HANDOFF.md`）。还剩：站主挑方向，挑定以后建 `schemes/pith/`、`scheme.json` 记 `0.1.0`，`pith-app.md` 搬进 `schemes/pith/`；三条分支、三个 worktree 问过站主再删。
2. **Phase 6**：三个 Skill 过一遍、文档再精简、三个 Design System 在现用账号里最新（Vermilion、Peck 11-16 核过和本地构建逐个一样；Pomelo 的等 Pomelo 的会话按新版本发）、`npm run all` 全绿；站主填第 4 页；站主打 `atelier-v1.0.0`。
