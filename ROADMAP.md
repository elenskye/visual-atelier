# ROADMAP

visual-atelier 自己的状态和计划（Pomelo、Peck、Pith 的计划在各自的仓库）。做完的计划和逐条记录在 `history/`（索引 `history/README.md`），结果的摘要在 `CHANGELOG.md`。方案的版本号各记各的，和仓库的版本号分开。

## 现在（2026-11-24）

- **仓库 `1.0.1`**：文档和代码精简一遍；Pith 方案定为 1.0.0、发到云端；Pomelo 的侧栏展开 `fold` 进了方案；方案的 tag 补齐（`CHANGELOG.md`）。到 v1.0 的计划（Phase 0–6）都做完了，经过在 `history/`。
- **方案**（每个方案一行，各会话只改自己那一行）：
  - **Vermilion** `1.5.0`：网站线上在用，没有新工作。Design System「Vermilion 朱红」（https://claude.ai/artifact/B89E9carxtZjjkT4adbNer ）和画布 Vermilion Explore 在现用账号。
  - **Pomelo** `1.0.1`（11-24 加了动效零件 `fold`）：Design System「Pomelo 柚儿园」（https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3 ）按 1.0.1 发了；同步进 Pomelo、删掉 Pomelo 里临时的 `src/shared/fold.css` 由 Pomelo 的会话做（站主说一声）。方案和设计由 Pomelo 的会话做（`schemes/pomelo/DESIGN.md`、`canvases/pomelo-explore/README.md`），要 Pomelo 接的写进 Pomelo 的 `docs/atelier-sync.md`。
  - **Peck** `1.0.0`（11-24 由 0.1.0 定为 1.0.0，内容没变）：Design System「Peck」在现用账号，由 Peck 的会话做（`schemes/peck/CLAUDE.md`）。
  - **Pith** `1.0.0`（11-24 站主批了 `logo-grow`，全部已批）：两套配色、36 个资产、七个动效零件、12 个组件；Design System「Pith」（https://claude.ai/artifact/CPavXvD8wdYuEEXbVhYqAb ）和 Pith Explore（https://claude.ai/artifact/HcCFtnXuGg9fQnp5qSVoH7 ，只有 R1）在现用账号。视觉基线和开发说明在 `schemes/pith/DESIGN.md`。由 Pith 的会话做；WonderLab 的 `pith-wonder-*` 等 Pith 做到 WonderLab 再起。
- **几个会话一起做**：本仓库、Pomelo、Peck、Pith 各一个（`CLAUDE.md`「几个会话怎么分」、`docs/sessions.md`）。

## 接下来

- **Pith 的前端 UI**（Pith 的会话）：照 tag `pith-v1.0.0` 同步进 Pith 的 `src/vendor/pith/`（`docs/adoption.md`，站主说一声），再接到界面上。用的时候发现 Atelier 的工具、Skill 不顺，回这里改。
- **Pomelo**（Pomelo 的会话）：同步 `pomelo-v1.0.1`；1.1 的问卷等站主填（`canvases/pomelo-v1-1-questionnaire/`）。
- **以后**（没排期）：Peck 方案的后续视觉；Vermilion 的新工作（网站、PPT、动图）；MCP 接 Pomelo 的柚子和 Peck。
- **不做**：Pomelo Explore 发回云端（以本地为准）；在 bench 里看云端的版本历史。

## 知道的限制

- **第一次要联网**：画布运行时的 React、Google Fonts 联网取过一次才存进 `bench/.cache/cdn/`；新机器先联网跑一次 `node bench/bin/dw.js offline`。
- **浏览器版本没固定**：渲染跟着系统的 Chrome 走，Chrome 更新后 PNG 的字节可能会变（`tooling/README.md`「确定性」）。云端容器里没有 Chrome，用预装的 Chromium（`docs/sessions.md`），Pomelo 用的 Mac 系统字体也没有：pomelo-explore 有 3 张板在那里报「字被裁掉一截」，在 Mac 上不会。
- **大画板拉回**：claude-artifacts 的 `read_file` 一次只给一个文本文件，几百 KB 的画板不适合这样拉（`docs/cloud.md`「下载」）。
- **导入**：Claude 导出的单文件 HTML 没有画布的排布、页和便签，`dw import` 按每行 4 张排开。
- **只在本机的**：界面里的「版本」只有 `.versions/` 存过的；Tweaks 只记在这台电脑的浏览器里；本地的页面存储只有站主一个人（`user` 永远是 `local`）。
- **画板标题生成器说了算**：站主在界面里改过板名、删过板的页，重跑那一页的生成器会改回去。
- **`dw frames` 只为看**：按真实时间截，误差一两百毫秒，两次不保证一样。
- 画板模板里 `<img src="{{src}}">` 这类占位符会让浏览器先请求一次字面地址；本地服务回空响应，自检不算它。
- **`atlas-envelope` 的 GIF 两次导出不一定一样**（Pomelo 的动效零件，2026-11-24 发现）：差几个像素值（最多 12/255），`npm run qa:determinism` 会报它；别的产物都逐字节一样。
- **Peck 的 Design System 云端那份**：`tokens.json` 里的方案版本还写着 0.1.0（11-24 方案定为 1.0.0，别的都一样）；它共享给了组织外的人，要不要重发等站主说。
- **几份 bench 各用各的端口**：主工作区 4321；第二条线的 worktree 见 `docs/sessions.md`。

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
- **和 Pith 联动**（2026-11-16）：本仓库给 Pith 出视觉、Design System 和资产，Pith 用的时候发现的问题反过来改本仓库；两边计划各自独立，本仓库 v1.0 以后主要当别的项目的工具。Pith 要用别的方案就复制成 `pith-wonder-<名字>`，原方案不动；App 的 `pith` 和 WonderLab 的 `pith-wonder-*` 不共用 token。Pith 的产品架构归 Pith 仓库（11-22 那份交接 11-24 搬进了 Pith 的 `docs/`）。
- **一个仓库**（2026-11-06）：visual-assets 和 visual-workbench 合成 visual-atelier，引擎放 `bench/`。
- **Design System**：只从本仓库生成和发布，不在页面上直接改；组件是静态预览（HTML 加和消费方同名同值的样式），不做 React；字体用 Google Fonts 托管的同款，不上传（2026-10-23～11-03）。Pomelo 的例外（Mac 系统字体、`bundle.js` 带手画零件、主题只放默认配色）见 `schemes/pomelo/DESIGN.md`（2026-11-07）。
- **发版**：tag 名 `<方案>-v<版本>`；`dist/` 不进 Git；同步时按 tag 在 Mac 上构建（云端的动效帧有 ≤ 2/255 的抗锯齿差）（2026-10-31）。
- **工具**：GIF 用 gifenc，不依赖 ffmpeg；浏览器用 playwright-core（2026-11-02）。
- **迁入范围**：只迁消费方自定义的视觉资产，不含私人页面、第三方图标与品牌标识、字体文件、内容图片（2026-10-23）。
- **MCP 的配置**（2026-11-15）：三家都用项目级配置，进 Git、不写绝对路径（Claude Code `.mcp.json`、Codex `.codex/config.toml`、Antigravity `.agents/plugins/dw/`）；用户目录里的不改。
- **规则文档的写法**（2026-11-22）：`CLAUDE.md` 只放核心规则，细则在 `docs/` 和各份 README；`ROADMAP.md` 只放现在、接下来、决定和授权，过程进 `history/`；不再用根目录的 `HANDOFF.md`（11-24）。
- **版本和 Git**（2026-11-24）：整个仓库一个版本号、从 1.0.0 起，每轮 Agent 提交、站主推送（`CLAUDE.md`「版本与 Git」）。站主当天重建了 Git，之前的提交只在旧 `.git` 备份里，旧提交号和 tag 都不在新仓库里；方案的 tag 在 1.0.1 补打。

## 授权记录（现行）

用完的在 `history/v1-plan.md`（11-13～11-15）和 `history/v1-close.md`（11-15～11-24）。

- **网站**：默认只读，要改照 `CLAUDE.md`「权限边界」按文件问站主。
- **Pomelo**：站主 2026-11-07 给的全部开发权限，由 Pomelo 的会话用；本仓库的会话只读，要改先问站主。唯一的例外：本仓库的会话能写 Pomelo 的 `docs/atelier-sync.md`（站主 2026-11-15）。
- **Pith**（`~/Documents/GitHub/pith`）：由 Pith 的会话开发，照它自己的 `CLAUDE.md`；本仓库别的会话对它只读。同步进 Pith 照 `docs/adoption.md`，每次要站主说一声。
- **Codex、Antigravity 的配置**：项目级配置进了仓库（2026-11-15）；用户目录里的没改。
- **第二条线**：做版的 Agent 能在自己的分支 `agent/<名字>/<任务>` 上提交（站主 2026-11-15 批，`docs/sessions.md`「第二条线」）；现在没有进行中的。
- **GitHub**：`github.com/elenskye/visual-atelier`（私有，11-24 重建）；每轮由 Agent 自己 commit、打 tag，push（连 tag）由站主做（`CLAUDE.md`「版本与 Git」）。
