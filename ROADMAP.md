# ROADMAP

visual-atelier 自己的状态和计划（只写本仓库：Pomelo 的在 Pomelo 的 `docs/roadmap.md`，Peck、Pith 的在各自的仓库）。做完的大计划和逐条记录在 `history/`（索引 `history/README.md`；到 v1.0 的 Phase 0–5 的经过在 `history/v1-phase5.md`）。方案的版本号各记各的，不随 Phase 走。

## 现在（2026-11-24）

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

## 接下来

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

## 知道的限制

- **第一次要联网**：画布运行时的 React、Google Fonts 联网取过一次才存进 `bench/.cache/cdn/`；新机器先联网跑一次 `node bench/bin/dw.js offline`。
- **浏览器版本没固定**：渲染跟着系统的 Chrome 走，Chrome 更新后 PNG 的字节可能会变（`tooling/README.md`「确定性」）。云端容器里没有 Chrome，用预装的 Chromium（`docs/sessions.md`），Pomelo 用的 Mac 系统字体也没有：pomelo-explore 有 3 张板在那里报「字被裁掉一截」，在 Mac 上不会。
- **大画板拉回**：claude-artifacts 的 `read_file` 一次只给一个文本文件，几百 KB 的画板不适合这样拉（`docs/cloud.md`「下载」）。
- **导入**：Claude 导出的单文件 HTML 没有画布的排布、页和便签，`dw import` 按每行 4 张排开。
- **只在本机的**：界面里的「版本」只有 `.versions/` 存过的；Tweaks 只记在这台电脑的浏览器里；本地的页面存储只有站主一个人（`user` 永远是 `local`）。
- **画板标题生成器说了算**：站主在界面里改过板名、删过板的页，重跑那一页的生成器会改回去。
- **`dw frames` 只为看**：按真实时间截，误差一两百毫秒，两次不保证一样。
- 画板模板里 `<img src="{{src}}">` 这类占位符会让浏览器先请求一次字面地址；本地服务回空响应，自检不算它。
- **`sharp` 有一条高危审计**（`npm audit`）：`npm audit fix` 能升，但它管图片，升了 PNG 的字节可能变，要单独做、连导核对。
- **几份 bench 各用各的端口**：主工作区 4321；第二条线的 worktree：Claude 4351、Codex 4331、Argon 4341。

## 已拍板的决定（长期有效）

只记跨方案的；方案自己的在它的 `DESIGN.md` 和 `history/`，写进 `CLAUDE.md` 和各份 README 的不重复。

- **计划分开**（2026-11-12）：Dawn Plan 到 Phase 10 为止；原 Phase 11「第二条线与 MCP」归本仓库；Pomelo 继续自己的路线。跨仓库的约定两边各写自己那一半，说法一致。
- **账号**（2026-11-07）：现在用的是主力开发账号（现用账号）；旧账号建的云端只看不动，本地是真身，要上云端在现用账号里新建（`docs/cloud.md`「账号」）。例外记在「授权记录」。
- **范围**：Vermilion 只用于个人网站和站主同一身份对外的 PPT、动图；Pomelo 另建方案（2026-10-31、11-02）。
- **产出**以静态图和 GIF 为主，暂不做视频；**素材**以几何和代码生成为主，两年内没有手绘素材（2026-10-23）。
- **探索**：样稿放在 Claude 的画布上看，不用独立版 Claude Design（2026-12-14 关闭）；Claude 会话打不开共享画布时由 Claude Code 写进画布（2026-10-23、11-03）。**2026-11-22**：做视觉探索照 `skills/design-craft`（先 2–4 个真正不同的低保真方向、点名默认惯性）；探索页门槛低、优化页和方案门槛高（`canvases/README.md`「两档门槛」）；探索页的配色 APCA 只提示。
- **画布**（2026-11-12～11-14）：`canvases/` 只留要用的；每个方案一块 Explore Deck，页名「EX<N>：…」「R<N>：…」，探索全留、优化每项只留最新的；站主能在界面里改名、删除，名字以 `canvas.json` 为准（`canvases/README.md`）。bench 的菜单分 Design System、Motion Deck、Explore Deck、Questionnaire、Checks。
- **检查结果和断网**（2026-11-14）：`npm run all` 的结果在 bench 的 Checks 里；导出的单文件 HTML 断网也能打开。
- **问卷**（2026-11-03～11-13）：每份一个独立页面，带存储，Agent 读回答案；照通用模板（`skills/questionnaire/template/`，Vermilion 朱红的样子）；用完、结论进了文档就删。
- **和 Pith 联动**（2026-11-16）：本仓库给 Pith 出视觉、Design System 和资产，Pith 用的时候发现的问题反过来改本仓库；两边计划各自独立，本仓库 v1.0 以后主要当别的项目的工具。Pith 要用别的方案就复制成 `pith-wonder-<名字>`，原方案不动；App 的 `pith` 和 WonderLab 的 `pith-wonder-*` 不共用 token。**2026-11-21**：Pith 改成对话、文献库、设置三个入口，功能做成技能。**2026-11-22**：改成四个入口（对话是首页，加了知识库），排版、调查、概念拿掉页面变成技能，角色页在「设置 › 角色」，初始角色 Pith、伴读、审稿人、编辑；新的核心理念「程序不限制模型，只给更好的检索、引用工具」（`HANDOFF.md` 第 1–5 节）。
- **一个仓库**（2026-11-06）：visual-assets 和 visual-workbench 合成 visual-atelier，引擎放 `bench/`。
- **Design System**：只从本仓库生成和发布，不在页面上直接改；组件是静态预览（HTML 加和消费方同名同值的样式），不做 React；字体用 Google Fonts 托管的同款，不上传（2026-10-23～11-03）。Pomelo 的例外（Mac 系统字体、`bundle.js` 带手画零件、主题只放默认配色）见 `schemes/pomelo/DESIGN.md`（2026-11-07）。
- **发版**：tag 名 `<方案>-v<版本>`；`dist/` 不进 Git；同步时按 tag 在 Mac 上构建（云端的动效帧有 ≤ 2/255 的抗锯齿差）（2026-10-31）。
- **工具**：GIF 用 gifenc，不依赖 ffmpeg；浏览器用 playwright-core（2026-11-02）。
- **迁入范围**：只迁消费方自定义的视觉资产，不含私人页面、第三方图标与品牌标识、字体文件、内容图片（2026-10-23）。
- **MCP 的配置**（2026-11-15）：三家都用项目级配置，进 Git、不写绝对路径（Claude Code `.mcp.json`、Codex `.codex/config.toml`、Antigravity `.agents/plugins/dw/`）；用户目录里的不改。
- **规则文档的写法**（2026-11-22）：`CLAUDE.md` 只放核心规则，细则在 `docs/` 和各份 README；`ROADMAP.md` 只放现在、接下来、决定和授权，过程进 `history/`。

## 授权记录（现行）

用过的一次性授权在 `history/v1-plan.md`。

- **网站**：默认只读，要改照 `CLAUDE.md`「权限边界」按文件问站主；2026-11-01 那条总授权不用了，用过的两次（11-06、11-10）都改完、站主已提交。
- **Pomelo**：站主 2026-11-07 给的全部开发权限，由 Pomelo 的会话用；本仓库的会话只读，要改先问站主。唯一的例外：本仓库的会话能写 Pomelo 的 `docs/atelier-sync.md`（站主 2026-11-15），Pomelo 仓库别的不动。
- **Pith**（`~/Documents/GitHub/pith`，GitHub `elenskye/pith`）：由 Pith 的会话开发，照它自己的 `CLAUDE.md`；本仓库别的会话对它只读。同步进 Pith 照 `docs/adoption.md`，每次要站主说一声。
- **Codex、Antigravity 的配置**：项目级配置进了仓库（2026-11-15）；用户目录里的没改。
- **第二条线**：做版的 Agent 能在自己的分支 `agent/<名字>/<任务>` 上提交（站主 2026-11-15 批，`docs/sessions.md`「第二条线」）；Phase 4、5 的分支、worktree 都已经合并或删掉。2026-11-22 站主定：Pith 新架构写进本仓库的那一批推到 `agent/claude/pith`（从 `main` 新开），站主看过再合并。
- **GitHub**：`github.com/elenskye/elen-visual-atelier`（私有）；2026-11-24 起每轮由 Agent 自己 commit，push 由站主做（`CLAUDE.md`「版本与 Git」）。
- **Pith Explore 发到旧账号的云端**（站主 2026-11-21）：只为 Pith Explore 这一块破「旧账号只看不动」的例，在旧账号里建了一块 Design 画布（地址在它的 `README.md` 和 `cloud.json`），本地仍是真身；11-22 换成三家对比的三页。
- **本仓库的会话直接推 `main`**（站主 2026-11-22）：合并 Phase 5 的三条分支、第二步改 Atelier，都允许本仓库的会话提交并推到 `main`。
- **合并 Pith 的设计、删分支**（站主 2026-11-24，在 Pith 的会话里）：`agent/claude/pith` 并进 `main`，本地三条 `agent/*/pith` 和 GitHub 上的 `agent/claude/pith` 都删了。站主之后会删掉 GitHub 上的仓库、清掉本地历史重新 `git init`。
- **Pith 改目录名**（站主 2026-11-23，在 Pith 的会话里）：Pith 仓库从 `personal-research-lab` 改名为 `pith`，允许 Pith 的会话改本仓库里指向旧路径的地方，提交并推到 `main`。
