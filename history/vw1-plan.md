# VW1 · 看画布的引擎（归档）

站主 2026-11-06 批准的 VW1 计划。2026-11-07 起并进 Dawn Plan（归档在 `schemes/pomelo/history/dawn-plan.md`）：「挂载 Design System」已在 VL2 · Phase 6 做了，「批准和对比」进 Dawn Plan · Phase 3，「动效台」进 Phase 5，「在 Pomelo 里看画布」后来提前成 Phase 8；「第二条线」和「MCP 服务」2026-11-12 归进 visual-atelier 到 v1.0 的计划（`ROADMAP.md` 的 Phase 3、4）。这里只是记录，不是规则。2026-11-12 从 `bench/history/` 移来。

| VW1 · Phase | 内容 | 要赶在 | 验收点 |
| --- | --- | --- | --- |
| 1 批准和对比 | 批准状态：在界面里把画板标成 proposed / approved，只有站主能批，记进画布的 `db.json`，Agent 用 `dw` 读到；并排对比：两张画板，或同一张的两个版本；全局开关：明暗、减弱动态效果，整块画布一起变 | VL2 · Phase 8 验收前 | 站主在本地批一张、退一张，Agent 读得到；Pomelo 同一张板的两个版本并排看；一键切暗色，13 张板一起变 |
| 2 动效台 | 拖时间轴、逐帧总览、导出 GIF；动效用 `schemes/` 里的同一份实现和 `tooling/` 的 GIF 工具，不另写一版 | VL2 · Phase 10 开工前 | Vermilion 加载圆相：拖时间轴、逐帧总览，和 `tooling/` 导出的 GIF 逐帧一致 |
| 3 第二条线 | 其他 Agent 全程在本地探索：流程、接力规则、成稿怎么进 `schemes/`；用一个真实的小任务跑通 | 不挡 VL2 | Codex 或 Argon 做完一个小任务，站主在本地看过、批过，成稿进了 `schemes/` |
| 4 MCP 服务 | 把 `dw` 的命令包成 MCP 工具，只听本机 | 不挡 VL2 | 一个 Agent 不用命令行，用 MCP 新建、自检、导出一块画布 |
| 5 在 Pomelo 里看画布 | bench 这边：给 Pomelo 用的接口，能启动、停止本地服务、知道它在不在跑；画布界面能嵌进 App，能列出画布、打开某一张。Pomelo 这边：新模块读取、联动 visual-atelier，在 Pomelo 里直接启动并操作本地画布，不跳浏览器；等 Pomelo v0.9 发完再做，不挤元旦的排期；模块图标在 VL2 · Phase 8 一起画 | Pomelo v0.9 之后 | 在 Pomelo 的新模块里启动 bench、打开 Pomelo Explore、换页、动 Tweaks、停掉服务，全程不开浏览器 |

## 本地画布系统（VL2 · Phase 4–6，问卷结论，站主 2026-11-05）

引擎在 `bench/`，画布在 `canvases/`，只给 Claude 和其他 Agent 用，不做编辑器。

- **要解决**：换账号、换 Agent 都能读写；画布有一份本地真身；改完马上能看。
- **两条线**：Claude 探索就在云端画布上做，成稿存到本地；其他 Agent 探索和成稿都在本地画布上做。
- **做了**：无限画布、活的画板、Tweaks 面板；版本历史、存数据、导出（单文件 HTML、PNG）、发回 Claude；一条命令自检、命令行加 Skill；挂载 Design System（提前到 Phase 6，站主 2026-11-06）。
- **不要**：画布上留言、上传素材、页面里调模型、连接器、多人在线、分享链接。
- **界面**：画布优先，布局和操作尽量像 Claude 画布；只看不编辑：平移缩放、动 Tweaks，Tweaks 不写回文件。中文；服务只听 127.0.0.1；只在 Mac 上看。
- **格式**：沿用 `.dc.html` 加 `canvas.json`，和 Claude 画布同一套，普通 HTML 也能当画板。不自己写运行时，用 Claude 画布运行时的副本，记校验和。
- **复现标准**：Vermilion 两块逐张和云端截图对比，差异列给站主，站主目视。

## VL2 · Phase 6 的冷启动验收（2026-11-07 通过）

站主在 Claude Code（另一个账号）、Codex、Antigravity Argon 各开一个新会话，只看仓库文档：准备仓库跑通 `npm test`，新建画布挂 Vermilion 写一张 1280×800 的板（标题、说明、两个描边按钮，都用 token），`dw check` 全过并导出 PNG，读 Phase 4 问卷的 q2 和 A7，列出文档里看不懂、走不通或要猜的地方。三个都做完 2–4（q2 = `local`「本地为主」，A7 = `later`「以后」）。第 5 条提到的、已经改掉的：

- 沙箱里 Chrome 打不开本机端口时，`dw check` 把 Chrome 的报错页当成通过（Argon）：`bench/src/server/headless.js` 现在看 `Page.navigate` 的 `errorText`、`chrome-error://` 和 HTTP 状态，报「打不开页面」「报错页」「页面返回 404」，不截图也不通过；加了测试。
- `dw new` 不生成 `README.md`，`design-loop` 第一步却要读它（Argon、Codex）：现在一起生成，写明怎么看、自检、导出和云端在哪。
- 描边按钮的类名在文档里查不到（Argon、Codex）：ButtonLink 的说明加了类名和 HTML 例子；`design-loop` 写明组件类名直接读 `design-system/README.md`、各组件的 `README.md` 和 `preview.html`。
- Vermilion 总说明写按钮描边是 `color-line`，ButtonLink 写 `color-accent`（Codex）：总说明改对了（按钮是 `color-accent`，输入框和圆形图标按钮是 `color-line`）。
- 非交互 shell 里 `nvm use` 走不通（Argon）、沙箱里 npm 缓存、Chrome、端口要提权（Codex）：`CLAUDE.md`「新会话接手」和 `bench/README.md` 写了 `source ~/.nvm/nvm.sh && nvm use` 和沙箱要放行。
- `design-loop` 第一步要先 `list_files`、拉回，没说本地新建的画布可以跳过（Codex）：写明了。
- `.shots/` 的位置和截图命名要猜（Argon）：各处写全 `canvases/<画布名>/.shots/check/<画板名>.png`。
- `ROADMAP.md` 写问卷答案在 `answers.json`，实际在 `db.json`（Argon）：改了。
