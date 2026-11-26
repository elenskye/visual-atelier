# CHANGELOG

只记做完且验证过的结果，不写待办。这里只留最近一轮和摘要表；逐条记录在 `history/changelog-2026-11.md`（2026-11-02～11-25），VL1 每一步在 `schemes/vermilion/history/vl1-changelog.md`。

## 1.0.2 · 2026-11-26 · 修小毛病、清死代码、文档精简（本仓库的会话，在 pith 环境里做）

- **`dw` 的帮助**：`dw <命令> --help`、`-h`、`dw help <命令>` 只打这条命令的用法、退出码 0（以前 `dw frames --help` 按缺参数报错）；`dw list` 的帮助改成五类；帮助里补上漏写的参数（`serve --json` 的 `api`、`shot --width/--height/--full-page`、`publish --out`、`review --note` 等）。
- **命令行和 MCP**：没有的画布一律说「没有画布 X」、退出码 1（以前六种说法，`versions`、`target` 还退出 0）；`dw target` 打错名字不再凭空建一块画布（本地还没有的云端画布加 `--new`）；`dw export` 一个不存在的画布不再留下空目录；问卷页的 `verify`、`publish --record` 不再假装全对，`export --html` 不再什么都不做就退出 0；参数后面没写值（`--title`、`--board`、`--port`……）一律报「后面要写值」，不再写进 `"title": true` 或被悄悄忽略；`--json` 的输出只有 JSON；只有一页的导出包导入时图片不再丢；`dw shot`、`open` 认不带 `.dc.html` 的板名；MCP 清掉批准状态要写是哪几张。
- **画布界面**：双击画板能打开单张铺满了（以前只能点 ⤢）；在单张铺满里改板名不再退出铺满；撤销删板回到它那一页；看 Design System、Motion Deck、Checks 时别处改了文件不再被拉回画布；换页时选中、PLAY、Tweaks 面板跟着清掉；Motion Deck 播完一遍再点一次就重播、打开读不了的零件不再报错；Checks 页的错误提示会清掉、展开的列表不再一更新就收起；⌘ 加快捷键不再误触；改名、删除只重画一次。
- **tooling**：目录页的动效演示不再丢 `@include` 的内容、改用 Vermilion 的配色（以前拿了 Peck 的，缺 9 个变量）、「重播」对按步骤触发的 43 个零件也能动；`sync` 在 tag 里先核对生成器（加上 Pith 的），对不上就停下；`npm run qa` 加一项「Pith 图形与生成器一致」，不会再在 0 项没过时退出码 1；`qa --origin` 只对照 `consumers` 里有这个消费方的方案（以前 Pomelo、Peck、Pith 拿去和网站比，报 6 项没过）；`fontLinks` 只留一份（`check:ds` 不再向 Google Fonts 要 Mac 的系统字体），bench 不再为取 `tokensCss` 带上 playwright。
- **死代码和重复**：bench 的解包删掉没人读的字段、空钩子和走不到的分支；扩展名、遍历目录、读 JSON、画板次序、DOM 小工具（新的 `bench/src/board/dom.js`）各只留一份；tooling 的 graphic、derive 共用一个比较、拦已批、写清单的函数；删 `exists`、`checkPairs`、`server.host`、`browser.defaultViewport` 这类没人用的。源码共少了约 300 行，测试多了 7 个。
- **文档**：`CLAUDE.md`「文档职责」写清每份管什么；`README.md` 的目录改成指过去；`ROADMAP.md` 的决定只留别处没写的，其余列出在哪；`CHANGELOG.md` 11-24～11-25 的五段挪进 `history/changelog-2026-11.md`；`bench/README.md` 的命令示例改指 `dw help`；改掉过期的（已删的 Pomelo 问卷、Pomelo 不再用的 `docs/atelier-sync.md`、`"api":1`、Pith 的版本和消费方、`tooling/README.md` 的几处参数）。`atlas-envelope` 的 GIF 不确定查清了原因，记在「知道的限制」。
- **验证**：`npm test` 44/44（新加 `cli.test.js`、`edges.test.js`）；`npm run all` 全过（QA 1681 项、水印 50/50、Atlas 快照、`check:canvases`）；`qa:determinism` 1132 个文件两次一致；`dw import`、`dw export --html` 在 163 张真实画板和四种导出包上改前改后逐字节一样（单页导出包的图片是有意改的）；`dw check` pith-explore 6 张、vermilion-explore 16 张全过；`sync --check` Pith、网站两份一致；内置浏览器里过了画布、单张铺满、Design System、Motion Deck、Checks，另用 Chrome 脚本跑了界面的 40 项（旧代码 29 项不过）。云端没碰。

## 2026-11-24～11-25 摘要

逐条的结果和检查数字在 `history/changelog-2026-11.md`。

| 日期 | 结果 | 版本 |
| --- | --- | --- |
| 11-24 | 精简文档和代码（bench 删约 900 行）；Pith 定为 1.0.0、发到云端；Pomelo 的 `fold` 进方案；方案的 tag 补齐；新的 `check:canvases` 防板和生成器漂移；Phase 6 冷启动验收 | 仓库 `1.0.1`，Pith `1.0.0`，Pomelo `1.0.1`，Peck `1.0.0` |
| 11-25 | 两条规矩：云端不主动碰、只有本体才升仓库的版本号（站主） | — |
| 11-25 | Pith 的会话：七个新组件、换配色改成洇开不卡、Strip 的小枝桠和收起、衬线字光学居中、整页水面回来、生长阶段的悬停各演各的 | Pith `1.0.1`～`1.3.0` |

## 1.0.0 之前 · 2026-11-13～11-24 摘要

| 日期 | 结果 | 版本 |
| --- | --- | --- |
| 11-13～11-16 | Pomelo v1.0（Pomelo 的会话）：见字如面、联动和玩物有志、格式条换 8 个图标、Atlas 新的几幕（Tabloid 1.1.0、1.1.1），收口时 Design System 按 1.0.0 发了 | Pomelo `0.7.0`～`1.0.0` |
| 11-16 | Phase 4 收尾，Phase 5、6 的准备；和 Pith 联动（`pith-wonder-*` 的规矩） | 仓库 `0.13.0` |
| 11-17～11-22 | Phase 5 第二条线：Claude、Codex、Argon 各做一版 Pith 的方案，合进 `main`；站主没挑三家的（评估在 `history/pith-phase5.md`） | — |
| 11-22 | 照 Phase 5 的教训改 Atelier：`skills/design-craft`、探索和定稿两档门槛、`dw frames`、画布运行时换新、共用零件 `canvases/_lib/`、规则文档改成短版；Pith 的新架构 | — |
| 11-22～11-24 | Pith Explore EX4–EX11（照新架构再做八轮），站主验收 EX11；建 `schemes/pith/`、优化页 R1，Pith 的旧轮次清掉 | Pith `0.1.0` |
| 11-24 | 合并 Pith 的设计；整个仓库一个版本号、从 1.0.0 起，每轮由 Agent 提交、站主推送；站主重建了 Git（之前的提交只在旧 `.git` 备份里） | 仓库 `1.0.0` |

## 到 v1.0 计划 · Phase 0–4 摘要（2026-11-12～11-16）

逐条的结果和检查数字在 `history/changelog-2026-11.md`，当时的计划在 `history/v1-plan.md`、`history/v1-phase4.md`。

| 日期 | 阶段 | 结果 | 仓库版本 |
| --- | --- | --- | --- |
| 11-12 | 计划分开 | Dawn Plan 归档进 `schemes/pomelo/history/`；仓库有了自己的版本号；`CLAUDE.md`「几个会话怎么分」 | `0.9.0` |
| 11-12 | Phase 0 文档整理 | 新建 `history/`；同一件事只写一处；改掉过期的说法 | — |
| 11-12～11-14 | Phase 1 清理（含补充、Refine） | 画布从 16 块剩 4 块，每个方案一块 Explore Deck，页名 EX/R；通用问卷模板（Vermilion 朱红）；三个 Design System 在现用账号都是最新的；bench 菜单分类、排队载入和定格；画布、页、画板改名删除和回收处；单张铺满放大缩小 | `0.10.0` |
| 11-15 | Phase 2 可信、顺手 | Vermilion 的 PNG 连导 10 次一致；`npm run all` 全绿、一步一步跑；bench 的 Checks；Tweaks 记住上次的值；断网能看、导出的单文件 HTML 断网能开；框在有板有眼里批准退回 | `0.11.0` |
| 11-15 | Phase 3 MCP | `dw mcp`：23 个工具，只在本机、不加遥测、没加依赖；只用 MCP 的 Agent 做完一块画布，Codex 连上 | `0.12.0` |
| 11-15 | Phase 2、3 验收和 Phase 3 Refine | 三家的 MCP 配置进仓库；worktree 各开各的 bench；第二条线的规矩和说明；Phase 1 留下的清理；文档精简 | `0.12.0` |
| 11-15～11-16 | Phase 4 第二条线 | Codex、Argon 各在自己的分支上画格式条的 19 个图标，Git 规矩都守住；三版并排评估；站主挑了换 8 个；Antigravity 的配置改成工作区插件 | `0.13.0` |

## 2026-11-02～11-11 摘要

逐条的结果和检查数字在 `history/changelog-2026-11.md`。

| 日期 | 阶段 | 结果 | 方案版本 |
| --- | --- | --- | --- |
| 11-02 | VL1 收官 | 10 个 Phase 全部验收；VL1 的过程移进 `schemes/vermilion/history/` | Vermilion `1.5.0` |
| 11-03 | VL2 · Phase 0、1 | Pomelo 视觉问卷第 1 轮、VL2 计划；图形语言定为 S3 线描贴纸、5 套配色 | — |
| 11-05 | VL2 · Phase 2、3 | 外框 B3 桌面拼贴；建 `schemes/pomelo/`（5 套配色明暗 520 对过 APCA）；截图固定走软件栅格 | Pomelo `0.1.0` |
| 11-06 | VL2 · Phase 4、5 | `canvases/` 成为画布的本地真身，`dw` 能拉回、发回、核对；画布界面（无限画布、单张铺满、Tweaks、旧版本） | — |
| 11-06 | 仓库合并 | visual-assets 和 visual-workbench 合成 visual-atelier，引擎在 `bench/` | — |
| 11-07 | VL2 · Phase 6、7 | 三个 Agent 只照文档冷启动通过；Design System「Pomelo 柚儿园」，手画零件打包进 `bundle.js`；发布 `tokens.css`；旧账号的云端逐份核对有本地源 | — |
| 11-07 | Dawn · Phase 1–3 | 柚儿园在现用账号重发；Pomelo 方言补齐、第一次同步进 Pomelo；柚子、模块贴纸、App 图标等 34 个资产；bench 有了批准状态、并排对比、全局深色和减弱动效 | Pomelo `0.2.0`、`0.3.0` |
| 11-08 | Dawn · Phase 4–6 | 通用贴纸 32 个、空状态插图 8 张、动效零件 37 个、外框原型；给消费方的 `consumer.css`；首页、日历、典型页的原型 | Pomelo `0.4.0`、`0.4.1` |
| 11-09 | Dawn · Phase 6 优化、7、8 | 纸纹换成平铺的小块（最长一帧从 989 毫秒降到 150 毫秒以内）；界面小图标 148 个；bench 给别的程序的接口（`serve --json`、`status`、`stop`、`open`、`/api/status`） | Pomelo `0.4.2`、`0.5.0` |
| 11-10 | Dawn · Phase 9 | 动效零件 `chat-pop`；Atlas 探索上云端，定稿 Tabloid 1.0.0，快照冻结和核对（`tooling/atlas/`） | Pomelo `0.5.1`、`0.6.0` |
| 11-10 | Peck 导入 | `schemes/peck/`（12 个资产）；`build:ds` 认 `themes`、`fonts`、`scaleGroups`；`sync` 认方案自己的文件 | Peck `0.1.0` |
| 11-11 | Dawn · Phase 10、11 | Tabloid 1.0.1～1.0.3、图标「时间穿梭」；同步收掉空文件夹；问卷模板用 `connectDb()` 等云端存储 | Pomelo `0.6.1`～`0.6.3` |

## VL1 结果（Vermilion）

| Phase | 结果 | 验收 | 版本 | tag 提交 |
| --- | --- | --- | --- | --- |
| 1 Set Up | 工具链；网站资产入库；Logo A 动作做成零件 | 10-23 | — | — |
| 2 Design System | 「Vermilion 朱红」发布到第 16 版，21 个组件 | 11-02 | — | — |
| 3 图形语言探索 | 定下「笔势与纸片」，大图墨感「提按」 | 10-30 | — | — |
| 4 图形语言成文与资产 | 规则，19 个资产，3 个动效零件 | 10-31 | — | — |
| 5 首批上线 | 同步工具、字标转曲线、默认分享图、分类图形、矢量空状态、搜索加载圆相、修灰影 | 11-01 | 1.0.0 | `aa08c37` |
| 6 动效小零件 | 链接下划线、话题栏滑移、数字计数、描边绘制；页头只放标志，网站不放分区装饰 | 11-01 | 1.1.0 | `ba3e583` |
| 7 404 与文末落款 | 「折页」，三版落款随机，描边绘制改为 640ms | 11-02 | 1.2.0 | `234c251` |
| 8 内容图标集 | 24 个，写法 `:名字:`，职业页的 ❗ 换成提示图标 | 11-02 | 1.3.0 | `5053e77` |
| 9 文章分享图 | 「低山」，网站构建时按标题生成，18 张，最大 48 KB | 11-02 | 1.4.0 | `55838d7` |
| 10 作品水印 | 「字标」，12 张作品图，网站构建时自动加，原图不动 | 11-02 | 1.5.0 | `309aebe` |

最终盘点：

- 65 个资产全部已批准，其中 3 张旧图留档。
- 11 个动效零件，其中 1 个旧版本留档。
- 网站里的副本 29 个文件，与 `vermilion-v1.5.0` 的构建逐字节一致。

最后一次完整检查（2026-11-02，Mac）：

- 质量检查 210 项通过、0 失败，水印检查 50 项通过，加对照网站 220 项通过。
- 两次导出 359 个文件逐字节一致。
- 网站完整 `npm run qa` 通过；站主确认线上文章分享图与画廊水印没有问题。
