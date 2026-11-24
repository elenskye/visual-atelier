# 到 v1.0 的计划 · Phase 0–3

**只是历史，不是规则。** 2026-11-15 Phase 2、3 验收以后从 `ROADMAP.md` 原样移来：Phase 1–3 当时的写法（做了什么、站主什么时候加了什么）和这几段里用过的一次性授权。现在的计划和还有效的授权在 `ROADMAP.md`；里面说的 `CHANGELOG.md`「v1.0 · Phase …」那几段逐条结果，同一天也移进了本目录 `changelog-2026-11.md`。

Phase 0（文档整理，2026-11-12 验收，`4bfd695`）当时在 `ROADMAP.md` 里只有一行，结果见 `changelog-2026-11.md`。

## Phase 1 · 清理（→ 0.10.0，站主 11-14 验收）

结果在 `CHANGELOG.md`「v1.0 · Phase 1」和「Phase 1 补充」。

- **11-12**：画布清单站主逐块定的，Pomelo 的四块审看画布并进 Pomelo Explore 各成一页，5 份旧问卷、两块测试画布和 `pomelo-pages` 删掉；通用问卷模板；三个 Design System 在现用账号都是最新的。
- **11-13 站主加的**：bench 的菜单分四类（Design System、Motion Deck、Explore Deck、Questionnaire）；Pomelo 里看画布卡，改成按队载入、看不清的板定格；每个方案一块 Explore Deck，页分探索、优化（Atlas、见字如面并进 Pomelo Explore，Pomelo 最早的三轮探索放回来，优化的旧轮次删掉）；问卷模板改用 Vermilion 朱红；Pomelo「有板有眼」的左栏也分四类、能收起（这一步站主允许本仓库的会话改 Pomelo）。
- **11-13 再加的**：画布（Explore Deck、问卷页）和页能改名、删除，bench 的界面、`dw rename` / `dw delete` 和 Pomelo「有板有眼」的左栏都能做；删了的进回收处 `canvases/.trash/`，能撤销。
- **11-14 Phase 1 Refine**：单张铺满放大缩小、画板改名删除、Design System 和 Motion Deck 改 bench 里的名字、页名统一成 EX/R、补回 Peck 缺的图、本地 Design System 照云端（英文分节、颜色分组、Files 连资产一起数）。
- **还没做**：站主在 bench 或有板有眼里审一遍所有画布（改名、删掉不要的）；然后本仓库的会话照审完的样子删掉旧文档和旧代码（删掉的页、画布留下的生成器，冻结的 `p2-final/`、`p3-scheme/`、`s2`–`s2c` 这类，只为留档的说明），只留必要的、有效的，清空回收处之前先问站主。
- **验收**：站主 11-14 填完 `v1-phase1-questionnaire`，全部「看过，没问题」；两个小决定：检查结果页放在菜单里再加一类，导出的单文件 HTML 也要断网能开（都写进下面「已拍板」，Phase 2 做了）。

## Phase 2 · 可信、顺手（→ 0.11.0，11-15 做完，等站主验收）

- **Vermilion 标志那张 PNG 偶发不一致**（A4）：`logo-mark@512-light.png` 11-05 复验 6 次有 2 次不一样（办法和来历见 `tooling/README.md`「确定性」）。要做到连导 10 次逐字节一样。偏了的那次 `build:ds` 不写 Design System 的 index；核对 `vermilion-v1.5.0` 这个旧 tag 也照那一节做。
- **`npm run all` 全绿**（A5）：目录页（`build:catalog`）在 Peck 方案上报错：标志写了 `currentColor`，token 里没有对应的角色。要改 `schemes/peck/` 的话先问站主。
- **检查结果页**（B4）：`npm run all` 的结果在 bench 里看：哪一项、哪个方案、哪张图没过，点了看图。
- **Tweaks 记住上次的值**（B1）：每块画布、每张板各记各的，存在本机，不写回文件。
- **断网也能看**（B2）：画布运行时（React）和字体在本机存一份。导出的单文件 HTML 能不能也不联网，做的时候看。
- **在 Pomelo 的「有板有眼」里批准和退回**（B6）：先在有板有眼里试，查清差在哪。bench 要改的这边改；Pomelo 那边要接的，写进 Pomelo 的计划等它做。
- **结果**：见 `CHANGELOG.md`「v1.0 · Phase 2」。Pomelo 要接的（左栏的第五类、给画板标批准状态、在装好的 App 里试批准退回）写在 Pomelo 的 `docs/atelier-sync.md`。
- **验收**：Agent 给出连导结果和 `npm run all` 的结果；站主在 bench 里试：刷新后 Tweaks 还在、断网开一块画布、看检查结果页（验收问卷 `v1-phase23-questionnaire`）。

## Phase 3 · MCP（→ 0.12.0，11-15 做完，等站主验收）

- **服务本身**：`dw` 包成 MCP 服务（stdio，只听本机，不加遥测）。能做的和命令行一样多（站主选的）：
  - 列画布和画板、新建、写画板；
  - 自检（截图和报错）、导出 PNG 和 HTML；
  - 挂 Design System、读写页面存储（问卷答案、批准状态）；
  - 启动、停止看画布的服务。
- **先接谁**：本机写代码的 Agent，Claude Code、Codex、Argon，配置写进 `bench/README.md`。Pomelo 的柚子和 Peck 以后再接，不是 v1.0 的事（站主说的）。
- `design-loop` Skill 写上：有 MCP 就用 MCP。
- **结果**：见 `CHANGELOG.md`「v1.0 · Phase 3」。配置写法在 `bench/README.md`「MCP」，仓库根目录有 Claude Code 用的 `.mcp.json`。
- **验收**：一个 Agent 只用 MCP 新建、自检、导出一块画布；Codex、Argon 各连上一次；附一条站主能自己试的命令（验收问卷 `v1-phase23-questionnaire`）。

## 用过的一次性授权（2026-11-13～11-15）

- **Pomelo**（`~/Documents/GitHub/pomelo`）：站主 2026-11-07 给的全部开发权限，2026-11-12 起由 Pomelo 的会话用（细则在 `CLAUDE.md`「权限边界」）；本仓库的会话对 Pomelo 只读，要改先问站主。2026-11-13 站主允许本仓库的会话在 Phase 1 补充里改 Pomelo：用过了，改了「有板有眼」（`src/modules/canvas/`、`src-tauri/src/canvas.rs`、`src/dev/mockIpc.ts` 里它的假数据）和它的文档；同一天又按站主的话把改名、删除同步进有板有眼（`src/modules/canvas/`、`canvas.rs`、`lib.rs` 里登记三个命令、假数据）；还有本仓库里 Pomelo 的画布（合并 Pomelo Explore）和 `schemes/pomelo/` 里两处路径。
- **Peck 的画布**：2026-11-13 站主允许本仓库的会话照 Explore Deck 的规矩改 `canvases/peck-explore/`（页名、删外框小样的旧轮次、生成器的页名）；`schemes/peck/` 没动。2026-11-14 站主让补回 `S1b-Icon`、`S1c-Icon` 缺的三张图：站主登录了内置浏览器的 claude.ai，从云端画布下载那张板的「HTML (.zip)」，三张 PNG 的 sha256 和云端 `list_assets` 一致，放进 `canvases/peck-explore/blobs/`，README 跟着改。
- **Pomelo 的画布**：2026-11-14 站主说「现在可以动 Pomelo 了」（Phase 1 Refine）：只用 `dw rename --page` 改了 Pomelo Explore 的 12 个页名，和它的 `README.md`、`notes/README.md`、`atlas/README.md`、`schemes/pomelo/atlas/README.md` 里写的页名；画板、生成器、Pomelo 仓库都没动。站主会告诉 Pomelo 的会话。
- **Codex、Antigravity 的配置**：Phase 3 验收时只用 `codex exec -c …` 一次性连了 Codex，`~/.codex/config.toml`、Antigravity 的 `mcp_config.json` 都没改；要常用，站主照 `bench/README.md`「MCP」加，或者让 Agent 加（先问站主）。
