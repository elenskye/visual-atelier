# ROADMAP

visual-atelier 自己的状态和计划（Pomelo、Peck、Pith 的计划在各自的仓库）。做完的计划和逐条记录在 `history/`（索引 `history/README.md`），结果的摘要在 `CHANGELOG.md`。方案的版本号各记各的，和仓库的版本号分开。

## 现在（2026-11-26）

- **仓库 `1.0.3`**：用 Atelier 的项目对本仓库有全部权限、用到前先读 `CLAUDE.md`，三家 App 的规则跟着统一（1.0.2：修 `dw` 的帮助和一批小毛病、清死代码、文档精简；`CHANGELOG.md`）。到 v1.0 的计划（Phase 0–6）都做完了，经过在 `history/`。
- **方案**（每个方案一行，各会话只改自己那一行）：
  - **Vermilion** `1.5.0`：网站线上在用，没有新工作。Design System「Vermilion 朱红」（https://claude.ai/artifact/B89E9carxtZjjkT4adbNer ）和画布 Vermilion Explore 在现用账号。
  - **Pomelo** `1.0.1`（11-24 加了动效零件 `fold`）：Design System「Pomelo 柚儿园」（https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3 ）按 1.0.1 发了；11-26 同步进 Pomelo（App 1.1.0），临时的 `src/shared/fold.css` 删了。方案和设计由 Pomelo 的会话做（`schemes/pomelo/DESIGN.md`、`canvases/pomelo-explore/README.md`）。
  - **Peck** `1.0.0`（11-24 由 0.1.0 定为 1.0.0，内容没变）：Design System「Peck」在现用账号，由 Peck 的会话做（`schemes/peck/CLAUDE.md`）。
  - **Pith** `1.3.0`（已同步进 Pith 1.0.5；待批：`stage-grow`、palette-lake 1.2.0、1.1.0 起的新组件）：两套配色、37 个资产、八个动效零件、19 个组件；Design System「Pith」（https://claude.ai/artifact/CPavXvD8wdYuEEXbVhYqAb ，云端还是 1.0.0）和 Pith Explore（https://claude.ai/artifact/HcCFtnXuGg9fQnp5qSVoH7 ，只有 R1）在现用账号。视觉基线和开发说明在 `schemes/pith/DESIGN.md`，每一版改了什么在 `scheme.json` 的 `$note`。由 Pith 的会话做；WonderLab 的 `pith-wonder-*` 等 Pith 做到 WonderLab 再起。
- **几个会话一起做**：本仓库、Pomelo、Peck、Pith 各一个（`CLAUDE.md`「几个会话怎么分」、`docs/sessions.md`）。

## 接下来

- **本仓库**：没有排期的本体开发；Pomelo、Peck、Pith 用的时候发现工具、Skill 不顺，回这里改。
- **以后**（没排期）：Peck 方案的后续视觉；Vermilion 的新工作（网站、PPT、动图）；MCP 接 Pomelo 的柚子和 Peck。
- **不做**：Pomelo Explore 发回云端（以本地为准）；Peck 的 Design System 云端那份重发（站主 11-26：不重发，它的 `tokens.json` 里方案版本还写着 0.1.0）；在 bench 里看云端的版本历史。

## 知道的限制

- **第一次要联网**：画布运行时的 React、Google Fonts 联网取过一次才存进 `bench/.cache/cdn/`；新机器先联网跑一次 `node bench/bin/dw.js offline`。
- **浏览器版本没固定**：渲染跟着系统的 Chrome 走，Chrome 更新后 PNG 的字节可能会变（`tooling/README.md`「确定性」）。云端容器里没有 Chrome，用预装的 Chromium（`docs/sessions.md`），Pomelo 用的 Mac 系统字体也没有：pomelo-explore 有 3 张板在那里报「字被裁掉一截」，在 Mac 上不会。
- **`atlas-envelope` 的 GIF 两次导出不一定一样**（Pomelo 的动效零件）：11-26 查清了，只有 320 毫秒那一帧（翻盖刚开始 3D 翻转），每次启动浏览器时 Chrome 给这个新图层栅格化的结果有两种，差几百个像素、最多 8/255；同一次启动里怎么等都不变，提前 `will-change` 也没用。`npm run qa:determinism` 会报它，别的产物都逐字节一样。
- **大画板拉回**：claude-artifacts 的 `read_file` 一次只给一个文本文件，几百 KB 的画板不适合这样拉（`docs/cloud.md`「下载」）。
- **导入**：Claude 导出的单文件 HTML 没有画布的排布、页和便签，`dw import` 按每行 4 张排开。
- **只在本机的**：界面里的「版本」只有 `.versions/` 存过的；Tweaks 只记在这台电脑的浏览器里；本地的页面存储只有站主一个人（`user` 永远是 `local`）。
- **画板标题生成器说了算**：站主在界面里改过板名、删过板的页，重跑那一页的生成器会改回去。
- **`dw frames` 只为看**：按真实时间截，误差一两百毫秒，两次不保证一样。
- 画板模板里 `<img src="{{src}}">` 这类占位符会让浏览器先请求一次字面地址；本地服务回空响应，自检不算它。
- **几份 bench 各用各的端口**：主工作区 4321；第二条线的 worktree 见 `docs/sessions.md`。

## 已拍板的决定（长期有效）

只记跨方案、别处没写的；方案自己的在它的 `DESIGN.md` 和 `history/`。

- **计划分开**（2026-11-12）：Dawn Plan 到 Phase 10 为止；原 Phase 11「第二条线与 MCP」归本仓库；Pomelo 继续自己的路线。跨仓库的约定两边各写自己那一半，说法一致。
- **范围**：Vermilion 只用于个人网站和站主同一身份对外的 PPT、动图；Pomelo 另建方案（2026-10-31、11-02）。
- **产出**以静态图和 GIF 为主，暂不做视频；**素材**以几何和代码生成为主，两年内没有手绘素材（2026-10-23）。
- **探索**：样稿放在 Claude 画布格式的画布上看（默认本地，`CLAUDE.md`「画布与 bench」），不用独立版 Claude Design（2026-12-14 关闭）；Claude 会话打不开共享画布时由 Claude Code 写进画布（2026-10-23、11-03）。
- **和 Pith 联动**（2026-11-16）：本仓库给 Pith 出视觉、Design System 和资产，Pith 用的时候发现的问题反过来改本仓库；两边计划各自独立，本仓库 v1.0 以后主要当别的项目的工具。Pith 的产品架构归 Pith 仓库（写成了 Pith 的 `docs/decisions/0030-architecture.md`）。
- **Design System**：只从本仓库生成和发布，不在页面上直接改；组件是静态预览（HTML 加和消费方同名同值的样式），不做 React；字体用 Google Fonts 托管的同款，不上传（2026-10-23～11-03）。Pomelo 的例外（Mac 系统字体、`bundle.js` 带手画零件、主题只放默认配色）见 `schemes/pomelo/DESIGN.md`（2026-11-07）。
- **工具**：GIF 用 gifenc，不依赖 ffmpeg；浏览器用 playwright-core（2026-11-02）。
- **迁入范围**：只迁消费方自定义的视觉资产，不含私人页面、第三方图标与品牌标识、字体文件、内容图片（2026-10-23）。
- **写在别处的**（定过，别再问）：版本与 Git、谁能改什么（用 Atelier 的项目有全部权限，别家的方案先问）、默认不更新到云端、规则文档怎么写 → `CLAUDE.md`；账号和旧账号 → `docs/cloud.md`「账号」；画布、Explore Deck 的页名和留哪些、探索和优化两档门槛 → `canvases/README.md`；bench 的五类、Checks、断网也能看、MCP 的配置 → `bench/README.md`；问卷 → `skills/questionnaire`；视觉探索的做法 → `skills/design-craft`；会话分工、第二条线 → `docs/sessions.md`；同步、tag → `docs/adoption.md`、`tooling/README.md`；一个仓库、重建 Git → `README.md`、`history/README.md`。

## 授权记录（现行）

用完的在 `history/v1-plan.md`（11-13～11-15）和 `history/v1-close.md`（11-15～11-24）。

- **网站**：默认只读，要改照 `CLAUDE.md`「权限边界」按文件问站主。
- **用 Atelier 的项目**（站主 2026-11-27）：Pomelo、Peck、Pith 的会话对本仓库有全部权限，照 `CLAUDE.md`「几个会话怎么分」；三家的仓库里也写了（各自 `CLAUDE.md` 讲 visual-atelier 的那一节）。
- **Pomelo 仓库**：站主 2026-11-07 给的全部开发权限，由 Pomelo 的会话用；本仓库的会话只读，要改先问站主。例外：能写 Pomelo 的 `docs/atelier-sync.md`（站主 2026-11-15；用时再建，Pomelo 做完删）。
- **Pith 仓库**（`~/Documents/GitHub/pith`）：由 Pith 的会话开发，照它自己的 `CLAUDE.md`；本仓库别的会话对它只读。同步进 Pith 照 `docs/adoption.md`，每次要站主说一声。
- **Codex、Antigravity 的配置**：项目级配置进了仓库（2026-11-15）；用户目录里的没改。
- **第二条线**：做版的 Agent 能在自己的分支 `agent/<名字>/<任务>` 上提交（站主 2026-11-15 批，`docs/sessions.md`「第二条线」）；现在没有进行中的。
- **GitHub**：`github.com/elenskye/visual-atelier`（私有，11-24 重建）；每轮由 Agent 自己 commit、打 tag，push（连 tag）由站主做（`CLAUDE.md`「版本与 Git」）。
