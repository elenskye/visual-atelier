# CHANGELOG

只记做完且验证过的结果，不写待办。这里只留最近一轮和摘要表；逐条记录在 `history/changelog-2026-11.md`（2026-11-02～11-24），VL1 每一步在 `schemes/vermilion/history/vl1-changelog.md`。

## 2026-11-25 · Pith 1.3.0：生长阶段各演各的、集合收起（Pith 的会话；非本体，仓库还是 1.0.1）

- **生长阶段**（站主 11-25：「常青」「长着」的图标动效只有一个点和一条线，而且一模一样）：通用上墨给瓣加的 CSS transform 盖掉了瓣上的 `rotate`，八片叠成一片。瓣的旋转挪到外面一层 `<g>`（几何不变），新零件 `stage-grow`（calm，待批）：发芽一沉一挺；生长芯先鼓、四瓣依次伸出来；常青整朵转过一瓣、隔一片的瓣先收后展。上墨让开它们。阶段改名「发芽、生长、常青」（站主定）。
- **Strip 收起**：以前收起是一下没了；现在倒着缩回去（宽收到 0、名字从右往左淡出、岔最后收起，0.34 秒），写法见组件说明。
- **验证**：`node tooling/pith/build.mjs --check`；`qa` 167 项全过；`build:ds`、`check:ds`；`build:motion` 导出 stage-grow 明暗两张、看过逐帧总览；画布重建后 `dw check pith-explore` 6 张全过、`check:canvases`。Pith 那边在 WKWebView 里按时间截过生长阶段的悬停和集合收起。云端的 Design System 没更新（规矩）。

## 2026-11-25 · Pith 1.2.0：集合的小枝桠、整页水面回来（Pith 的会话；非本体，仓库还是 1.0.1）

- **Strip**：有下级的点开长出一小段枝桠（带叶的岔、茎、每个下级一颗节点、珊瑚色的芽，依次长出来），代替原来那一根弯线（站主嫌单调、违和）；悬停改成「上墨」（`pith-ink`，带图标的图标也动）；栏高固定 42px，展开不跳。
- **衬线字的光学居中**：WebKit 里量，Newsreader（后备宋体）在固定高度的胶囊里偏上 0.9–1.4px；Strip、Tag 的集合、Branch 的条目行框下移 0.14em，复量都在 0.35px 内。
- **palette-lake 1.2.0**（待批）：整页水面回来了——App 里原生拍一张旧样子，WebGL 着色器在 GPU 上扭（实现在 Pith，CSS 里只写了做法）；WKWebView 实测约 0.1 秒开始动、144 帧无慢帧。`DESIGN.md` 第 2、7 节跟着改。

## 2026-11-25 · Pith 1.1.0、1.1.1：控件、换配色不卡（Pith 的会话；非本体，仓库还是 1.0.1）

- **1.1.1**（同一天，站主看到波纹不见了）：拍旧画面那约 0.2 秒屏幕是冻住的，吃掉了波纹最浓的一段；洇开又比波纹慢，把波纹盖住。波纹改成等 `transition.ready` 再起，洇开换成和波纹同一种先快后慢的节奏（1.3 秒）。WKWebView 里按时间截了几帧，五圈都看得见；帧数和 1.1.0 一样。

- **新组件**（站主 11-25：「检查所有勾选框、下拉框，把新的设计加到 Design System，不用等我审批」）：`Select`（下拉框和弹出的列表，右键菜单也用它；macOS 的原生菜单改不了样子）、`Check`（勾选框、单选框）、`Field`（输入框、搜索、就地改的字）、`Strip`（左右滑的一栏：文献库的集合、知识库的生长阶段）、`Tag`、`Dialog`（弹窗、提示条）、`TagTree`（文献库的标签树，`Branch` 加了分组、计数、多选）；`Buttons` 加小一号和危险的。都是 Pith 1.0.3 里先调好的样子，待批。
- **palette-lake 1.1.0**（待批）：Pith 在 WKWebView 里量，换配色时整页的水面扭曲每帧约 100 毫秒（一次掉到约 28 帧），十四个颜色变量过渡在 1500 行的文献库里有 5 个 150–280 毫秒的长帧。拿掉扭曲，颜色改成 View Transitions 从点的地方洇开；五圈波纹不变；`.pith-smooth` 只留给小页面和导出动图。`DESIGN.md` 第 1、2、5、7、9 节跟着改（第 1 节不再指已删的交接文件）。
- **验证**：`node tooling/pith/build.mjs --check`（37 个资产）；`npm run qa -- --scheme pith` 163 项全过；`check:ds` 19 个预览明暗都没问题、看过截图；`build:motion` 导出 palette-lake 明暗两张；画布重建后 `dw check pith-explore` 6 张全过，`dw ds install` 换了画布挂的副本，`check:canvases` 三块一致。云端的 Design System 没更新（规矩）。

## 2026-11-25 · Pith 1.0.1、两条规矩（Pith 的会话；非本体，仓库还是 1.0.1）

- **规矩**（站主定）：除非站主明确要求，画布和 Design System 不和云端同步（`CLAUDE.md`「画布与 bench」、`docs/cloud.md`、`skills/design-loop`）；只有本体的开发才升仓库的版本号，方案、画布这类平时的更新不升（`CLAUDE.md`「版本与 Git」）。`build:ds` 和 bench 在本地改过、云端没更新时的提示跟着改了。
- **Pith** `1.0.1`：文献库图标单独打开解析不了（叶书签一个元素两个 `style`），Design System 的 TopBar 里看不到图，生成器里并成一个，`tooling/pith/build.mjs` 以后查到重复的属性就报错；首页的叶子几何挪进 `tooling/pith/glyphs.mjs`，单独成一张 `marks/garden/leaf.svg`（画布 R1 改成从这里取，6 张板逐字节不变），Design System 的封面铺上它；`DESIGN.md` 加第 9 节，shadcn 变量和 `--color-*` 的对照。云端的 Design System 没更新（新规矩）。
- **验证**：`node tooling/pith/build.mjs --check`（37 个资产）；`npm run qa -- --scheme pith` 163 项全过；`check:ds` 12 个预览明暗都没问题，封面看过截图；`dw check pith-explore` 6 张全过；`check:canvases` 三块画布和生成器一致；`npm test` 37/37。没跑 `npm run all`、`build:motion`（动效没改）。

## 1.0.1 · 2026-11-24 · 精简、Pith 1.0.0、Pomelo fold（本仓库的会话）

- **Pith** `1.0.0`：站主批了 `logo-grow`，全部已批；补了同步清单 `sync.json`；Design System「Pith」发到现用账号（36 个文件回读一致）；现用账号新建 Pith Explore（只有 R1，11 个文件一致），本地画布挂上 Design System。
- **Pomelo** `1.0.1`：Pomelo Fold 验收，零件 `motion/fold` 进方案，画板并进 Pomelo Explore 的 R8，原画布删了；Design System 重发（3 个文件一致）。**Peck** 定为 `1.0.0`（内容不变）。站主删了 `canvases/peck-mcp-pomelo/`。
- **代码精简**（行为不变）：bench 删了约 900 行（打包的死路径、重复的 helper）；tooling 和生成器合并重复（`tooling/lib/common.mjs`、`canvases/_lib/page.mjs`、Pomelo Explore 的 `dsBoard`）。
- **文档**：`ROADMAP.md`、`CHANGELOG.md` 改短，旧段落进 `history/`（`v1-close.md`、`changelog-2026-11.md`）；根目录 `HANDOFF.md` 搬进 Pith 仓库；`docs/sessions.md` 不再重复分工表；三个旧 Skill 过了一遍。`sharp` 升到 0.35.5（高危审计清掉），水印输出逐字节一样。`scratch/` 清空。
- **验证**：`npm test` 37/37；bench 的 CLI、MCP、HTTP、导入导出前后逐字节一样；tooling 和生成器 4113 个产物逐字节一样（`atlas-envelope` 的 GIF 本来就不稳定）；`qa` 1674 项全过；Pith、Pomelo 的 QA 和 `dw check` 过；`vermilion-v1.5.0` 和网站副本的资产一致。没做：`npm run all`、新会话冷启动验收。


### 1.0.1 收尾（同一天，还是 1.0.1）

- **Pomelo Explore 的板和生成器对上了**：R2 的 10 张、R5 的 `Atlas-Main` 停在方案旧的样子，站主定重跑：R2「模块贴纸」「选择器」多了「见字如面」「玩物有志」，「模块坞」那格改叫「有板有眼」，别的 8 张只是内部 id 和代码；EX6、EX7 三张滚动面板最后一行标成故意裁掉（`data-nolint`，样子没变）；93 张板 `dw check` 全过。Peck Explore 的 Design System 副本跟着 1.0.0 换了版本号。
- **以后防漂移**（站主定）：新的 `npm run check:canvases`（`tooling/qa/canvases.mjs`，`npm run all` 的一步）在临时目录里把各画布的生成器重跑、和 `canvases/` 逐个文件比；共用的 `writePage` 重跑时保留 `canvas.json` 原来的顺序，不再整段挪动。`.claude/worktrees/` 进了 `.gitignore`。
- **Phase 6 收口**：一个新开的 Agent 只照文档冷启动（隔离的 worktree）：`npm ci`、构建、`npm test` 37/37、用 dw 的 MCP 列出 6 块画布，跑通；它指出的四处照改了（切 Node 的办法、构建要五六分钟、没设变量时用哪个浏览器、MCP 怎么调一个工具）。验收问卷 `v1-phase56-questionnaire/` 删了。
- **验证**：`npm run all` 全过（QA 1674 项、水印 50/50、Atlas 快照、画布和生成器）；`npm test` 37/37；故意改一张板，`check:canvases` 报得出来。

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
