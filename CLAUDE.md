# CLAUDE.md

visual-atelier：站主的个人视觉仓库。多套视觉方案（`schemes/`）共用一套工具（`tooling/`），画布的源（`canvases/`）和看画布的引擎（`bench/`）也在这里；产出以 SVG、GIF、PNG、动效零件和 Design System 为主。站主没有设计软件和设计经验，用自然语言指挥：方向由 Agent 摆出来让站主挑，不要默认站主会画图。

`AGENTS.md` 指向本文件，所有 Agent 通用。这里只放核心规则，细则在每节指向的文件里。

## 开工前

1. 读本文件和 `ROADMAP.md`（现在在哪、定过什么、现行授权）。动某套方案再读它的 `DESIGN.md` 和 `CLAUDE.md`；动某块画布再读它的 `README.md`；**做视觉探索、写简报、评估几家的版本，先读 `skills/design-craft/SKILL.md`**。
2. 新会话、新 worktree、换账号：照 `docs/sessions.md`「新会话接手」冷启动（`npm ci`、构建、`npm test` 全过），认清自己是哪个会话、能动哪些文件。只认提交过的东西。
3. 每次开发前，先问站主这次属于哪种程度（下面「版本与 Git」），再开工；站主已经写明版本号就不用问，别的项目的会话顺手修本体见「几个会话怎么分」。
4. 方案获批不等于开工许可：开始实现要站主明确说；「进入 Plan 阶段」只调研、提问、写文档。计划里上一个 Phase 验收后，下一个直接开工。
5. 定过的不再问（跨方案的在 `ROADMAP.md`，方案的在它的 `DESIGN.md` 和 `history/`）。要站主定的，工作中直接用提问功能（AskUserQuestion）问，别等写完长篇汇报再列问题。
6. Git 照下面「版本与 Git」。保留站主手写的内容；工作区里不认识的改动多半是别的会话的，别动也别还原，先问。
7. 文档用中文，只写结论；同一件事只写一处，别处指过去。

## 权限边界

- 本仓库和站主的其他项目互相独立：需要的规则在这里写全，不写「去看某某项目」；别的项目取用本仓库一律复制。
- **Pomelo**（`~/Documents/GitHub/pomelo`）由它自己的会话开发；本仓库的会话对它只读，要改先问站主。它的真实数据目录谁都不碰。
- **网站**（`~/Documents/GitHub/personal-website`）默认只读：一知道要改哪些文件（含 `package.json`、lockfile、临时文件），就列清单问站主，逐文件授权，记进 `ROADMAP.md`；旧授权不能代替这一步。备份时只复制要改的文件。
- **不进仓库、不做演示**：网站隐藏页 `/love-shuyu/` 及其内容、站主的私人内容、Pomelo 的真实数据目录（演示一律 `?mock` 假数据）。本仓库私有，站主少量的作品和文章可以进；看效果的截图只放会话临时目录或画布的 `.shots/`。
- 依赖写 `^x.y.z`，不用 `latest`；新增外部或付费服务要站主授权；不用 Rive。

## 几个会话怎么分（谁能改什么）

用 Atelier 的项目（现在是 Pomelo、Peck、Pith，以后加的也一样）的会话，和本仓库的会话一样在这里做事、照本文件的规矩（站主 2026-11-27，取代 11-26「各管自己那块」）：

- **先读本文件**：这次要用到本仓库（改视觉、同步方案、用 `dw` 看画布、改 Atelier 本身），开工前先读本文件，再照「开工前」读要读的。
- **全部权限**：Atelier 本体（`bench/`、共用的 `tooling/`、`skills/`、`docs/`、根目录的规则和配置、`package.json`）和自己负责的那块（下表）都能直接编辑、优化、更新，照「版本与 Git」提交、打 tag，不用先问、不用另开会话。用的时候发现 Atelier 不顺，就在这里改，记进 `CHANGELOG.md`。
- **别家的方案先问**：下表里别的项目负责的方案、画布、工具，要改先问站主（方案互相独立，核心约定 1）；站主同意的例外记在 `ROADMAP.md`「授权记录」。
- **开发程度**：改本体时，修小毛病、改顺手的直接按小幅优化升版本（1.0.x），不用为它另问；要给 Atelier 加功能（1.1.0 这类）先问站主。

| 会话 | 负责（这块的发版、Design System 的发布、同步进消费方由它做） |
| --- | --- |
| 本仓库的会话 | Atelier 本体的计划（`ROADMAP.md`「接下来」）、`schemes/vermilion/`、`schemes/_template/`、`canvases/vermilion-*/`、还没有归属的新方案 |
| Pomelo 的会话 | `schemes/pomelo/`、`canvases/pomelo-*/`、`tooling/atlas/`、`tooling/handmade/` |
| Peck 的会话 | `schemes/peck/`、`canvases/peck-*/` |
| Pith 的会话 | `schemes/pith/`、`schemes/pith-wonder-*/`、`canvases/pith-*/`、`tooling/pith/` |

几个会话在同一个工作区里一起做：动之前读最新的；只 `git add` 自己改的文件；工作区里别人没提交的改动别动、别还原；共用的 `CHANGELOG.md`、`ROADMAP.md`「现在」的方案行、`README.md` 的方案表各写各的那一条。细则、第二条线的 Git 规矩在 `docs/sessions.md`。

## 版本与 Git（站主 2026-11-24 定）

- **版本号**：整个仓库一个版本号，从 1.0.0 起，记在 `package.json` 的 `version`（连 `package-lock.json`）；所有会话都用它。各方案自己的版本记在 `scheme.json`，给消费方的 tag 是 `<方案>-v<版本>`（核心约定 6、`docs/adoption.md`），和仓库的版本号分开。
- **本体才升仓库的版本号**（站主 2026-11-25）：本体是 Atelier 自己的东西：`bench/`、共用的 `tooling/`、`skills/`、`docs/`、根目录的规则和配置。谁改本体谁升，升之前读最新的 `package.json`。平时给某套方案、某块画布做的更新和优化（方案发版、资产、画板、Design System、给消费方同步，连同只给一套方案用的 `tooling/<方案>/`）不升仓库的版本号、不打 `v<版本>`，也不用为它问开发程度；方案的版本照样升在 `scheme.json`、打 `<方案>-v<版本>`，提交信息写当前的仓库版本。
- **开发程度**（本体的开发），开工前先问站主是哪种：
  - 小幅优化、Bug 修复：1.0.0 → 1.0.1，不分 Phase。
  - 新增功能、大幅优化：1.0.0 → 1.1.0，计划分 Phase（如 1.2.0 Phase 1~5）。
  - 1.0.0 → 2.0.0：由站主决定，同样分 Phase。
- **正式版**：改 `package.json` 的版本，`CHANGELOG.md` 记一条，打 tag `v<版本>`。1.0.1 这类做完自动出；1.1.0、2.0.0 只在最后一轮收尾自动出，中间的 Phase 不出，除非站主在那一期要求；站主也可以自己出。方案发版的 tag `<方案>-v<版本>` 由做这个方案的会话在提交后打。
- **Git**：每一轮做完、对应的验证过了，自己 commit；push（连 tag）由站主做。不管是哪个项目的会话，在本仓库里的提交都照这里的写法。每轮结束告诉站主这轮有哪些 commit、tag，分别是什么。
- **提交信息**：`vx.x.x: dev description`。x.x.x 是这轮所属的版本；description 全英文，简约、概括，可以直接写 `fix some problems`、`minor improvement`。不写正文，不署名（不加 `Co-Authored-By`；`.claude/settings.json` 已关掉 Claude Code 默认加的署名）。
- 不 force push、不改写历史、不删分支、不改远端设置，站主说的除外。

## 仓库结构

| 路径 | 内容 |
| --- | --- |
| `schemes/<方案>/` | 一套视觉方案：`tokens/`、`marks/`、`motion/`、`type/`、`DESIGN.md`、`CLAUDE.md`、`scheme.json`，可选 `design-system/`、`history/`。新方案用 `dw scheme new`（`docs/architecture.md`） |
| `tooling/` | 所有方案共用的脚本：token 构建、渲染、GIF、质量检查、同步、字体子集（`tooling/README.md`） |
| `canvases/<画布名>/` | 一块画布或一个问卷页的全部源；`canvases/_lib/` 是生成器共用的零件（`canvases/README.md`） |
| `bench/` | 看画布的引擎：`dw` 命令行和 MCP、本地画布界面、画布运行时的副本、测试（`bench/README.md`） |
| `skills/` | 本仓库的 Skill（`.claude/skills`、`.agents/skills` 指向它） |
| `.mcp.json`、`.codex/`、`.agents/` | Claude Code、Codex、Antigravity 的项目级配置：MCP 服务 `dw`、Skill 的链接（`bench/README.md`「MCP」） |
| `docs/` | 细则（下面「文档职责」） |
| `history/` | 做完的大计划和逐条记录（只是历史） |
| `dist/`、`scratch/` | 构建产物、临时文件，不进 Git |

## 核心约定

1. **方案互相独立**：token、规则、动效数值不借用、不反向影响；共用的只有 `tooling/`。
2. **源是文件**：SVG、JSON、小型 JS 模块；颜色用 `currentColor` 或 token，不在资产里写死色值（色板文件除外）。
3. **动效是时间的函数**：每个动效只写一份实现，既能实时播放，也能逐帧定格导出 GIF。
4. **两档动效 `calm` / `expressive`**（`docs/motion-tiers.md`）：每个动效标明档位，带减弱动效下的静态终态。
5. **资产状态** `draft` → `proposed` → `approved`：只有站主能批准；`approved` 的不改几何和参数，要改开新版本。
6. **版本**：每个方案独立 semver，记在 `scheme.json` 和 `CHANGELOG.md`。
7. **字体**：只有可再分发许可（OFL 等）的能转曲线或打包；系统字体只作原生运行时字体。许可登记在 `docs/licensing.md`。
8. **产物预算**：图片 ≤ 1.5 MB，其他公开文件 ≤ 5 MB；GIF 以平涂色为主。
9. **对比度**：改色过 APCA（正文 Lc ≥ 75，次要文字和交互色 Lc ≥ 60），明暗都验。Explore Deck 的探索页（EX）只提示、不挡，不过的写进交付说明；优化页（R）和方案必须过（站主 2026-11-22）。
10. **画布的源在 `canvases/`**：生成画布的数据、脚本、手写的画板都在 `canvases/<画布名>/` 并进 Git；先进这里再上云端，云端改过先拉回（`docs/cloud.md`）。

## 画布与 bench

- 格式和 Claude 云端画布同一套（`project/canvas.json` 加 `*.dc.html`）；看、批、改名的分工，Explore Deck 的页名和**两档门槛**，都在 `canvases/README.md`。站主看、批，不改内容；批准退回只由站主做，Agent 只标「待批」。
- **默认只在本地，不更新到云端**（站主 2026-11-25、11-26）：Atelier 本地的画布和 Design System 默认不更新到 Claude Artifacts 云端，除非站主特别要求：不拉回、不发回，也不在云端新建或更新；改了只在本地看（bench）。云端那份因此旧了不算待办，不用问要不要重发，交付说明里提一句就行。问卷页照 `skills/questionnaire`，不受这条管（发出去给站主填本身就是站主要的）。
- 拉回、发回逐个文件核对 sha256，对不上就停下；碰云端前照 `docs/cloud.md`「账号」看清账号（旧账号的只看不动，例外记在 `ROADMAP.md`「授权记录」）。
- 运行时不手改：云端换了就对照 sha256 换掉 `bench/vendor/claude-design/` 的副本（`dw pull`、`verify`、`publish` 会提示）。服务只听 127.0.0.1，不加遥测。
- 有 `dw` 的 MCP 就用它（三家的配置都在仓库里，`bench/README.md`「MCP」）。`node bench/bin/dw.js help` 列出全部命令。

## 验证

改了哪边跑哪边，只跑和改动直接相关的；细则在 `docs/workflow.md`「验证」。

- **画板**：`dw check <画布名>` 全过，截图看过；有动效的再 `dw frames <画布名> --board <文件>` 看按时间线截的总览。没目视的（节奏、手感）写进交付说明。
- **bench**：`npm test`。**方案、tooling**：相关的那一条 `npm run …`；发版前 `npm run all`。
- **导出要确定**：同一份源两次导出逐字节一样。

## 采用、工具与 Skill

- **采用**：单向复制已发版本到消费方，消费方不手改；每个消费方每次同步都要站主授权；同步前核对 tag；不用 `file:` 之类的本机链接（`docs/adoption.md`、`docs/workflow.md`「资产从做到用」）。
- **放哪**：脚本放 `tooling/`，引擎放 `bench/`，Skill 放 `skills/<名字>/SKILL.md`（自包含：用途、输入、输出、验证），不放用户全局目录。

## 文档职责

同一件事只写一处，别处指过去。

| 文件 | 管什么 |
| --- | --- |
| `CLAUDE.md` | 核心规则、仓库结构、文档职责（本文件）：每次开工都读，只放规则 |
| `ROADMAP.md` | 现在、接下来、知道的限制、别处没写的跨方案决定、现行授权；不写过程 |
| `CHANGELOG.md` | 做完且验证过的结果：最近一轮加摘要表，逐条的在 `history/`；不写待办 |
| `README.md` | 给站主看：仓库是什么、方案表、第一次怎么用、常用命令 |
| `docs/` | `sessions.md` 会话分工和第二条线、`workflow.md` 工作流和验证、`cloud.md` 云端往返和账号、`architecture.md` 分层和数据流、新方案怎么起、`adoption.md` 同步到消费方、`motion-tiers.md` 动效档位、`licensing.md` 字体许可 |
| `canvases/README.md`、`bench/README.md`、`tooling/README.md` | 画布的约定；引擎怎么用（界面、给别的程序的接口、MCP）；每个脚本做什么、确定性、发布 Design System |
| `skills/<名字>/SKILL.md` | 一类活怎么做：步骤、命令、验证；规则指回上面这些 |
| `schemes/<方案>/` 的 `DESIGN.md`、`CLAUDE.md`、`scheme.json` | 方案定了的视觉基线和待确认的点、方案的规矩、版本和每版改了什么 |
| `history/` | 归档：大阶段的计划和过程，只是历史，不是规则 |

大阶段结束时，把过程移进 `history/`，`ROADMAP.md` 只留下一阶段，`CHANGELOG.md` 只留最近一轮和摘要表。
