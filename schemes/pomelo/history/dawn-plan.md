# Dawn Plan（2026-11-07～11-12）

visual-atelier 和 Pomelo 一起走的计划：一个 Agent 两边一起做，Phase 1–10 做完。2026-11-12 站主把两边的计划分开：原 Phase 11「第二条线与 MCP」归 visual-atelier 到 v1.0 的计划，Pomelo 继续 v0.9。

这里是从 `ROADMAP.md` 原样移过来的过程记录，不是规则。现行的规则在 `CLAUDE.md`、`ROADMAP.md` 和 `schemes/pomelo/DESIGN.md`；Pomelo 那边的记录在 Pomelo 的 `docs/archive/v0.9-dawn-plan.md`。

原来的开头：

> 现在只有一个计划：Dawn Plan，visual-atelier 和 Pomelo 两边一起做，子阶段记作「Dawn Plan · Phase 3」。方案的版本号（semver）另记，不随阶段走。做完的大阶段移进 `history/`（VL1 在 `schemes/vermilion/history/`，VL2 · Phase 0–7 在 `schemes/pomelo/history/vl2-roadmap.md`，VW1 和本地画布系统在 `bench/history/vw1-plan.md`）。

## 移出时的「当前状态」（2026-11-12）


- **计划分开**（站主 11-12）：Dawn Plan 到 Phase 10 为止，原 Phase 11「第二条线与 MCP」归这边，这边另排一份到 v1.0 的计划；Pomelo 继续 v0.9（Atlas、小功能、照 Bear 做的笔记模块）。两份计划问卷只放在现用账号的云端（站主说先不建本地画布）：[Visual Atelier 计划问卷](https://claude.ai/artifact/XfbBLuVbqEJsXVFxzA21ZS)（slug `f8557c77-e531-426c-960e-214ccda17a71`）、[Pomelo v0.9 计划问卷](https://claude.ai/artifact/NdmU3uoNZfCXxYDDnxPWaY)（slug `af321749-41eb-4711-b3d1-2eafa52cadad`），都声明了 `db` 和 `user`，答案在页面存储的 `survey/answers`（`db_get` 读；只有现用账号读得到）。页面从 `vl2-phase4-questionnaire` 的模板改的，源只在会话的临时目录。读回答案后重写这份 `ROADMAP.md`，Dawn Plan 移进历史。
- 同一天 Pomelo 那边修了落签（只量图标自己，不算按钮的浅底和透明的下划线）和柚子瓣里念念不忘那块方形，只改 Pomelo 的代码，方案版本不变；细节在 Pomelo 的 `docs/roadmap.md`。

- **Vermilion**：`1.5.0`，网站线上已用，没有新工作。它的 Design System「Vermilion 朱红」在旧账号，只能看；源改了（2026-11-07 改了说明里按钮描边的颜色和 ButtonLink 的写法）还没发，下次 Vermilion 改动时在现用账号重发一份。
- **Pomelo**：`schemes/pomelo/` 是 `0.6.3`（Atlas 的设计 Tabloid 1.0.3，替掉 1.0.2，见下面「Dawn Plan · Phase 11」；站主 11-11 打了 `pomelo-v0.6.3`，核对过 tag 再同步进 Pomelo：235 个文件，写入 5 个，删掉 1.0.2 的 2 个，空下来的文件夹同步自己收掉了，`sync --check` 一致）。上一版 `0.6.2`（Tabloid 1.0.2，替掉 1.0.0、1.0.1；`pomelo-v0.6.2` 已同步：235 个文件，写入 5 个，删掉 4 个）。再上一版 `0.6.1`（Tabloid 1.0.1、界面小图标「时间穿梭」，`pomelo-v0.6.1` 已同步）。再上一版 `0.6.0`（Atlas 的设计 Tabloid 1.0.0 的快照、小彩蛋那句话居中；站主 11-11 打了 `pomelo-v0.6.0`，核对过 tag 再同步进 Pomelo：234 个文件，写入 6 个，`sync --check` 一致）。上一版 `0.5.1`（`pomelo-v0.5.1` 2026-11-10 已同步进 Pomelo：加动效零件 `chat-pop`、便签上的字跟便签墨色走；`pomelo-v0.5.0` 是界面小图标 148 个），规则在它的 `DESIGN.md`。Design System「Pomelo 柚儿园」在现用账号：https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3 （私有；旧账号那份 https://claude.ai/artifact/4GgAtgCdS5fBcX9Fp4t4NU 只看不动）。11-08 按 `0.4.1` 发了一版（`1794134895-37dc`：样式带上动效零件，没有新的图片）；`0.4.2` 的样式（平铺的纸纹、滚动条）、两张新贴纸和 `0.5.0` 的界面小图标还没发到云端，下次发布时带上。
- **Dawn Plan · Phase 1、2、3 站主验收**（1、2 在 11-07；3 在 11-08）。结果在 `CHANGELOG.md`。
- **Dawn Plan · Phase 4、5 站主 11-08 一起批了**（新贴纸、空状态插图、37 个动效零件、外框原型），方案升 `0.4.0`、站主打了 tag、同步进 Pomelo；Pomelo 那边外框换成 B3 桌面、控件和招牌时刻接上动效零件、空着的页换插图，装进正式版。等站主在 App 里验收。
  - 批了以后加的柚子第 9 张脸「担心」（Pomelo 的简报心情「有烦心事」要用，Phase 3 的 8 张里没有）和小彩蛋的板，站主 11-08 在 bench 批了（`canvases/pomelo-motion` 的 `Worried`、`Eggs`），方案升 `0.4.1`、同步进 Pomelo（18:46 再装一次正式版）：简报心情「有烦心事」时顶栏的柚子是这张脸。
- **Dawn Plan · Phase 6 在做**（站主 11-08：先修 Phase 4、5 装好后发现的三处——柚子的对话列表还是旧样子、整个 App 能上下拉一点、设置页的图标是默认的——再直接做完 Phase 6，统一验收）：
  - 原型 `canvases/pomelo-pages/` 七张板（都是 `proposed`）：首页完整版（能左右拖的桌面，两张板分别停在左右两屏）、日历、列表型、表格型、详情型、统计型。
  - 日历视图是桌上小月历点开的一页，不是模块，不进贴纸簿和柚子瓣（站主 11-08 定）；纸角上和设置一样是手画圆框里的小图标。
  - Pomelo 那边照这几张做完了，11-08 19:54 装进正式版：首页换成能左右拖的桌面（便签位置记在设置 `ui.desk`）、日历页、各模块内页照四种典型页（页头、纸上的手画卡片、带点的标签、右边的面板、手画图表）。等站主在 bench 里批这七张板、在 App 里一起验收。
- **Dawn Plan · Phase 7 界面图标**（站主 11-09 把它从 Phase 8 提前）：148 个界面小图标全部自己画（`schemes/pomelo/marks/icons.mjs`），审看画布 `canvases/pomelo-icons/`，站主 11-09 两批都批了，方案升 `0.5.0`，站主打了 `pomelo-v0.5.0`，核对过 tag 再同步（232 个文件）。Pomelo 那边 11-09 17:23 装进正式版，等站主在 App 里验收：换掉了全部 Lucide、删了依赖，呦呦漫游多了内容图标选择器（Vermilion 的清单随 Pomelo 方案同步：`sync.json` 里写 `from` 的那一项）。
- **Dawn Plan · Phase 8 在 Pomelo 里看画布做完**（站主 11-09：先做完 Pomelo 的第一轮视觉优化 11 条，再直接做 Phase 8，装正式版），11-09 19:05 装进正式版，等站主在 App 里验收：
  - bench 给别的程序的接口（`bench/README.md`「给别的程序用」）：`dw serve --json`（启动好了打一行）、`dw status`、`dw stop`、`dw open`（给地址，不开浏览器），服务上 `GET /api/status`（认 `app: visual-atelier-bench`）、`POST /api/stop`；画布界面放进别人的页面时，每换一次地方给外面发一条消息。11-09 以前开着的 `dw serve` 没有 `/api/status`，要先停掉重开。
  - Pomelo 的新模块「看画布」（兴趣一类）：启动、停止这个服务，左边列画布和画板，右边就是画布界面，不开浏览器。它不存画布，只记 visual-atelier 文件夹在哪。
  - 第一轮视觉优化只动了 Pomelo 的代码（图标库、右键的格式和图标、一步一步的图标和左边一列、柚子的项目文件夹、落签、便签里滚动），没有新资产，方案版本还是 `0.5.0`，不用打 tag。牛皮纸文件夹和左边一列的样子是照已批的规则在 Pomelo 里直接做的（牛皮纸色、典型页「列表型」），没有另出画板。
  - 下一个是 Phase 9「Atlas 年度总结」。
- **Phase 9 开工前的一轮优化**（站主 11-10 在 App 里看完提的 8 条）：都改在 Pomelo 的代码里（细节在 Pomelo 的 `docs/roadmap.md`），11-10 装进正式版，站主 11-10 验收。这边跟着动的：
  - 模块「看画布」改名「有板有眼」（站主 11-10 定）。贴纸 `marks/modules/canvas.svg` 批过了不动，它里面的标题还写着旧名字，下次给这张贴纸开新版本时再改。
  - 新动效零件 `motion/chat-pop/`（问柚子的小窗从顶栏的柚子那里长出来，0.42 秒；收起缩回去，0.2 秒），站主 11-10 看了 GIF 批了。
  - Design System 的 `bundle.css` 加了一条：便签上的字、次要的字、链接跟便签的墨色走（深色模式下每套配色的强调色都是浅的，写在便签上看不清；APCA：墨 Lc 87，次要的字 Lc 69）。Pomelo 那边先在自己的 `index.css` 里按它的变量名写了同样的一条。
  - 上面两样是 `0.5.1`：站主 11-10 打了 `pomelo-v0.5.1`，核对过 tag 再同步（232 个文件，换了 4 个），Pomelo 再装了一次正式版。还没发到云端的 Design System（和 `0.4.2`、`0.5.0` 的一起，下次发布时带上）。
- **Dawn Plan · Phase 9 第一轮在做**（站主 11-10：效果探索先放云端画布，验收成成品后再进方案）：画布 `canvases/pomelo-atlas/`，云端 https://claude.ai/artifact/RNfxkLga1kUDvJMm4TPRYY （现用账号，私有）。四张板：走一遍（信封 → 小报跟着节拍自己翻）、全部 15 页摊开、Atlas 模块页、桌上的两样和节拍表。自己定的和还没做的写在它的 `README.md`。Pomelo 那边的 Atlas 模块等方向定了再接。
  - 站主 11-10 看了提的第一轮优化 5 条（封面柚子的脸被胶带盖住、点星星的卡片做成纸条卷开卷起、「几个具体时刻」字糊、「钱」页空白、「收进抽屉」没动画），改好后又自己打磨了一遍（印出来的纸一律按浅色画、浮上来只上浮不缩放、装饰不挡点击），11-10 发到云端（版本 `1794288006-a43a`），等站主验收。
  - 同时做了 Pomelo 的第二轮优化 6 条（白屏的兜底、念念不忘标签的荧光笔、Pub2MD 的设置页、编辑卡片字出框、白板、Seeker 的边框；细节在 Pomelo 的 `docs/roadmap.md`），只改 Pomelo 的代码，方案版本不变，11-10 15:00 装进正式版，等站主验收。
  - 第三轮（站主 11-10）：Atlas 聊天页一个话题一种泡泡，再加了几处亮点（序章的流星和连星座、求职的小石子跳水、钱的小票吐出来和滚数字、回声的条和数字、终章一段段浮出来），11-10 发到云端（版本 `1794302486-1527`），细节在画布的 `README.md`，等站主验收。Pomelo 那边 3 条（关芝麻开门弹 Touch ID、柚子小窗的手画边、行李清单勾上划线）只改代码，方案版本不变，细节在 Pomelo 的 `docs/roadmap.md`。
- **Dawn Plan · Phase 9 Atlas 定稿、Phase 10 收口做完，11-11 09:27 装进 Pomelo 正式版，等站主在 App 里验收**（站主 11-10：Atlas 验收，优化完作为第一轮定稿；Phase 9、10 一起做完）：
  - 定稿叫 **Tabloid 1.0.0**（名字和版本号站主定）。设计的源在 `schemes/pomelo/atlas/tabloid/`，照 Pomelo 存的「呈现结果」画；冻结的快照在 `schemes/pomelo/atlas/releases/tabloid-1.0.0/`，规矩和数据的样子在 `schemes/pomelo/atlas/README.md`。聊天页 6 个通用泡泡、12 个专属泡泡；今年不做音乐。
  - 审看画布 `canvases/pomelo-atlas/` 改成从方案的源生成，五张板，11-10 发到云端（版本 `1794322532-5953`，10 个文件校验和全对）。
  - Pomelo 那边：Atlas 模块（每一年、每一份的历史、补做、只有站主能删）、小报放在 frame 里照它那一版设计画、首页新年第一周的信封；`docs/design.md` 重写。细节在 Pomelo 的 `docs/roadmap.md`。
  - `npm run all` 里 Pomelo、Vermilion 的全过（质量检查 1445 项、水印 50 项、`npm test` 20 个、Atlas 的快照核对）；**目录页（`build:catalog`）在 Peck 方案上报错**（它的标志资产写了 `currentColor` 但 token 里没有对应的角色），是 Peck 导入带来的，这一轮没动，等 Peck 那条线修。
- **Atlas 的一轮优化**（站主 11-11 在 App 里看完提的 5 条：「感情」泡泡的字没居中、Atlas 的页改成只摆年份的封面、用真模型测、三个模型比对、装正式版）。这边做的两样，方案升 `0.6.1`，站主 11-11 打了 `pomelo-v0.6.1`，核对过 tag 再同步进 Pomelo（237 个文件，写入 6 个，`sync --check` 一致），Pomelo 11-11 14:08 装进正式版，等站主在 App 里验收：
  - **Tabloid 1.0.1**（版本号站主定）：聊天页「感情」那颗心里的字挪到正中；用真实的一年比对时又发现两处一起修了（印在页上的笔记不带开头的标签和 Markdown 的记号；钱那页不再印「平均每天 ¥0」）。快照 `atlas/releases/tabloid-1.0.1/`，1.0.0 的不动。站主定：照 1.0.0 做的那几份照旧用 1.0.0 画，小修也不例外。
  - **界面小图标「时间穿梭」**（第 149 个，站主 11-11 看图批了）：Atlas 里每一年的封面下面用。
  - 审看画布 `canvases/pomelo-atlas/` 的 `Module` 板还是 11-10 的样子（Pomelo 里 Atlas 的页已经改了，没跟着重画，以 Pomelo 里的为准）；两块画布重新生成过，还没发回云端。
  - Pomelo 那边的 Atlas 页、各幕的重试、真模型测试的结果在 Pomelo 的 `docs/roadmap.md`。
- **Dawn Plan · Phase 11 在做**（站主 11-11）：这个线程做落签和 Atlas 的一轮优化；计划表里原来的「第二条线与 MCP」由另一个线程同时做（两边各守各的文件：这边是 `schemes/pomelo/`、`canvases/pomelo-atlas/`、`tooling/atlas/` 和 Pomelo 仓库，`ROADMAP.md`、`CHANGELOG.md` 各写各的一条）。
  - **Tabloid 1.0.2**（版本号站主定）：Atlas 页上的封面由设计自己画（年份、Tabloid、版本号）；序章星图多了粉星（模型挑的、这一年触动你的几条），和金星按日子连成星座；小报里落签的线从按钮上垂下来。快照 `atlas/releases/tabloid-1.0.2/`。
  - **哪些算定稿**（站主 11-11，改了上午的说法）：只升最后一位的小修替掉同一条线里旧的那份（1.0.0、1.0.1 的快照删了，照它们做的几份改照 1.0.2 画）；升了前两位的新定稿两份都留。规矩写在 `schemes/pomelo/atlas/README.md`，`--freeze`、`--check` 照它做。
  - Pomelo 那边接好（封面用设计画、一份照同一条线里最新的设计画、序章的提示词挑触动的记录），11-11 17:00 装进正式版，等站主在 App 里验收；细节在 Pomelo 的 `docs/roadmap.md`。
  - 落签（全局）：Pomelo 里所有落签的线从图标、贴纸画的线上垂下来，改在 Pomelo 的 `src/shared/tips.ts`；Design System 的动效零件 `tooltip`（批过的）没改，它的 `top: calc(100% + 4px)` 只在量不到画的东西时兜底。
  - **又一轮（站主 11-11 晚上，Atlas Refine 2）**：落签和图标隔 3 像素（贴着嫌丑）、叠着的页抽出来时落签跟着走；Tabloid 1.0.3（落签隔一点、整封信按 Markdown 排、留下的日子往上提），替掉 1.0.2；信在 Atlas 里本来就存了一份，Pomelo 那边让明年写信、首页的卡片在对话删了以后也读 Atlas 那份。另修了问卷模板连云端存储（别的会话发现的，见 `CHANGELOG.md`）。
- **Phase 6 的一轮优化**（站主 11-09 在 App 里看完提的 7 条：卡顿、色块、叠着的页点哪都能换、柚子页照 Phase 2 定稿重排、设置和日历的图标、滚动条）：
  - 卡顿和色块是纸纹惹的：每张纸、每张卡片各一层实时的 `feTurbulence` 滤镜，WebKit 用 CPU 逐像素算，Pomelo 每开一页卡 0.8～1 秒（在 Safari 里量的）。纸纹改成一小块算好的图平铺（`tooling/handmade/texture.mjs`，样子不变）；方案里加了滚动条的样子（`.pm-scroll`）和设置、日历的两张贴纸（`marks/places/`），审看板是 `canvases/pomelo-marks` 的 `Places`，站主 11-09 批了，方案升 `0.4.2`，站主打了 `pomelo-v0.4.2`，核对过 tag 再同步（83 个文件）。
  - Pomelo 那边改好、11-09 15:58 装进正式版，等站主在 App 里验收：叠着的页各自成层、换页不重画，露出来的地方都能点；柚子页是线圈本，左边桌面上坐着大柚子、对话是小纸条，去掉「助手」和「定时」两栏（`youzi.db` 40）；速记小窗也接上手画的那一层（以前漏了）。怎么量流畅度写在 Pomelo 的 `docs/testing.md`「流畅度」。
- **Pomelo 现状**（2026-11-09）：版本号 0.9.0；`pomelo.db` 41（一步一步的分组和目标带图标）、`youzi.db` 40、数据文件格式 40。颜色、控件、动效、空状态插图都只来自同步的 `src/vendor/pomelo/`（`ds.css` 是 Design System 给消费方的那份，只带批过的动效）。看界面：`pnpm dev` 后开 `http://localhost:1420/?mock`，测试办法在 Pomelo 的 `docs/testing.md`。
- **新会话接手**：先照 `CLAUDE.md`「新会话接手」做；云端的事看 `docs/cloud.md`「账号」。

Pomelo 的探索画布 [Pomelo Explore](https://claude.ai/artifact/CwBUdwLqGsRxZz5hKiX143) 在旧账号（「Phase 2 · 最终设计」和「Phase 3 · 方案」两页），源在 `canvases/pomelo-explore/`；站主 2026-11-08 复制了一份到现用账号：[Pomelo Explore_Copy](https://claude.ai/artifact/9FZc237QfULRPsgWd4fRnK)（按画布类型建的，工具读不了文件，要在浏览器里登录看；和本地 `project/` 生成的一样）。Phase 2 定稿以本地 `canvases/pomelo-explore/p2-final/` 为准。要给站主在 Claude 里看新样稿时，在现用账号里新建一块。

## Dawn Plan（站主 2026-11-07 定）

**2026-11-12 站主定：两边的计划分开。** Dawn Plan 到 Phase 10 为止；Phase 11「第二条线与 MCP」归 visual-atelier，它另排一份到 v1.0 的计划；Pomelo 继续 v0.9（Atlas 再完善、其余小功能、照 Bear 做的笔记模块，Atlas 为它加一幕；不做云端同步）。两份计划问卷在现用账号的云端（[Visual Atelier](https://claude.ai/artifact/XfbBLuVbqEJsXVFxzA21ZS)、[Pomelo](https://claude.ai/artifact/NdmU3uoNZfCXxYDDnxPWaY)，只放云端、没建本地画布），答案读回来以后两边各写自己的计划，这一节移进历史。

目标：2027 年元旦前 Pomelo v0.9（视觉版本）全部做完并装进正式版，不因时间压力降低完成度。原来的 VL2（方案和资产）、VW1（看画布的引擎）和 Pomelo v0.9（代码）合成这一个计划。visual-atelier 的 `ROADMAP.md` 和 Pomelo 的 `docs/roadmap.md` 各留一份一模一样的这一节，是两个仓库唯一允许重复的内容；改计划两边一起改。

**怎么走**

- 一个 Agent（Claude Code，现用账号）两边一起做：不再分账号一、账号二，也不再分 VL 线、VW 线。Pomelo v1.0 正式发布前不换账号。
- 每个 Phase 先在 visual-atelier 出资产和原型（站主目视批准），再接进 Pomelo（`?mock` 自验，站主在 App 里看）；两边都过了才算这个 Phase 验收。上一个 Phase 验收后下一个直接开工，不另等开工指令（站主 2026-11-07 定）；Phase 里要站主拍板的事用提问功能问。
- 资产到 Pomelo 照旧单向同步（visual-atelier 的 `docs/adoption.md`）：一个 Phase 的资产批准后，站主给 `schemes/pomelo/` 打一次 tag，Agent 核对 tag 再 `sync`；同步来的文件带 `VERSION` 和校验和，不手改。每个 Phase 同步一次，不等到最后。
- Git：两边的 commit、push、tag 都由站主做；Agent 改任何文件但不提交。每个 Phase 做完，Agent 直接做升级测试、装 Pomelo 正式版（`pnpm app:install`），方便站主在 App 里验收（站主 2026-11-07 定）。
- 验证：Pomelo 的代码照 Pomelo 的 `CLAUDE.md` 和 `docs/testing.md`；visual-atelier 的照它的 `CLAUDE.md`「验证」。
- 云端：Design System「Pomelo 柚儿园」用现用账号的那份 https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3 ；画布要给站主在 Claude 里看时，在现用账号里新建（visual-atelier 的 `docs/cloud.md`）。旧账号的画布和 Design System 只看不动。
- 目标日期是排期，不是验收标准；顺序比日期重要。
- 2026-11-09 站主改了后半段的顺序：界面图标提前到 Phase 7，「在 Pomelo 里看画布」提前到 Phase 8，Atlas 年度总结和收口与正式版顺延成 Phase 9、10，第二条线与 MCP 是最后一个 Phase（11），不挡 Pomelo 后面的开发和优化。

| Phase | 内容（visual-atelier → Pomelo） | 验收点 | 目标 |
| --- | --- | --- | --- |
| 1 开工 | 冷启动收官、文档改口径、Pomelo 柚儿园在现用账号重发、三个计划合成这一个 | 站主验收 Phase 6、7 的结果和这份计划 | 11-07 |
| 2 地基 | visual-atelier：Pomelo 方言的 token 发第一版（`pomelo.css`：5 套配色 × 明暗、分类色、状态色、选项色、手作专用的 `--pm-*`），手画零件的画法打包给 Pomelo（和 Design System 同一份 `bundle.js`），`sync.json` 登记，同步进 Pomelo（`src/vendor/pomelo/`）。Pomelo：主题变量换成同步来的那份（`src/index.css` 只留字体和非颜色的部分），设置 › 外观里切换配色和明暗（跟随系统、浅色、深色）；月历的数据（待办、日子、出行、面试合成一段日子的条目）；首页完整版的数据（本月、今年按月的数字、念念不忘一条，和简单版的块一起一条命令给齐）。不读 macOS 日历（站主 2026-11-07 定） | `?mock` 里能切 5 套配色和明暗，旧界面先变色、字都看得清；月历和首页的数据有 Rust 测试 | 11-13 |
| 3 柚子与模块图标 | 柚子的 App 图标 1024 源图、菜单栏实心和空心、AI 按钮、8 个表情的静态帧；模块图标约 20 个（含 Atlas 和「看画布」），先从 Pomelo 源码只读列清单、定归类；手作零件进 `marks/`。bench：批准状态（界面里标 proposed / approved，记进画布的 `db.json`，Agent 读得到）、并排对比（两张板，或同一张的两个版本）、全局明暗和减弱动效开关。Pomelo：换 App 图标、菜单栏和 AI 按钮，模块坞用新图标 | 站主目视批准（明暗；16、26、40 号）；菜单栏 16 号和 macOS 26 的图标网格在打包版里看过；bench 里站主批一张、退一张，Agent 读得到 | 11-20 |
| 4 外框 | 模块贴纸补 32 个通用的，每个模块能换贴纸、换五种分类色之一，自建模块也有贴纸（站主 2026-11-08 从 Phase 8 提前）。B3 桌面拼贴的可点原型：首页桌面、模块页的纸和缝线、柚子瓣、叠在右边的页、贴纸簿；明暗、5 套配色、减弱动效。外框这样对应（站主 2026-11-08 定）：开着的页就是页签，叠在纸的右边，顶栏右边「桌上开着」；不要索引签，置顶的在桌面下排「常用」和柚子瓣；子页插在纸的上边；模块坞变成贴纸簿。Pomelo：模块的「图标和颜色」；外框换成新的（顶栏、开着的页、贴纸簿、柚子瓣、模块页的纸和子页纸签），手画的框、胶带、缝线由同一份 `bundle.js` 画；控件（按钮、输入框、下拉、勾选、开关、标签、提示）换成 Design System 的样子 | 站主目视原型和新贴纸；Pomelo 每个模块在新外框里能打开、能用，`?mock` 和真实窗口各过一遍；字清楚（版面检查） | 12-01 |
| 5 动效与空状态 | 和 Phase 4 一起做、一起批，批了再一起接进 Pomelo（站主 2026-11-08）。空状态插图 6–8 张（明暗）。动效：招牌时刻（问候、柚子瓣、柚子在想和回答、完成待办或打卡、空状态；年度总结只做拆信封）、柚子的表情动画、控件的小动静，每个一份实现，能实时播放也能导出 GIF，带减弱动效回退。bench：动效台（拖时间轴、逐帧总览、导出 GIF，用 `schemes/` 的同一份实现）。Pomelo：动效零件接进控件和招牌时刻，减弱动态效果跟系统 | 逐帧总览自检；站主目视节奏和手感；bench 的 GIF 和 `tooling/` 导出的逐帧一致；Pomelo 里每个招牌时刻看过 | 12-08 |
| 6 首页、日历与模块内页 | 首页完整版：B3 桌面能左右拖动，放得下更多模块的便签而不挤；便签能拖能甩，拖到哪记在哪（存在设置里）；本月小月历、今年按月的图表、念念不忘一条（站主 2026-11-07 定）。日历视图（待办、日子、出行、面试一张月历）、模块内页 3–4 种典型页（列表、表格、详情、统计）。Pomelo：首页完整版、日历视图、各模块内页照典型页改 | 站主目视批准（明暗）；Pomelo 里首页和日历用真数据（打包版）；每个模块内页看过 | 12-15 |
| 7 界面图标 | 界面小图标 138 个（替换 Lucide，每个对应一个现在用的 Lucide 名字，加 Phase 4–6 新增的），分两批验收；Vermilion 的内容图标清单与 SVG 复制给「呦呦漫游」的内容图标选择器。Pomelo：全部换掉 Lucide，内容图标选择器 | 站主分批目视批准；清单无遗漏，代码里不剩 lucide 的引用 | 12-01 |
| 8 在 Pomelo 里看画布 | bench 给 Pomelo 的接口（启动、停止、状态、列画布、打开某一张）；Pomelo 的新模块读取、联动 visual-atelier，不跳浏览器 | 在新模块里启动 bench、打开 Pomelo Explore、换页、动 Tweaks、停掉服务，全程不开浏览器 | 12-08 |
| 9 Atlas 年度总结 | 年度小报的全部幕（序章、留下的日子、书影相遇、几个具体时刻、去年的回声、创作、求职这一年、身体和习惯、和柚子聊的事、钱、终章），没数据的幕不出现，「截至某日」，目录和点开原记录，桌上的信封，Atlas 模块页（每一年、补做某一年），首页「那年今日」卡片，自动翻的节拍表；明暗、减弱动态效果；星图走手绘。今年不做音乐（站主 2026-11-10）。每次定稿有名字、版本号和冻结的快照（第一版 Tabloid 1.0.0），每次运行留历史、照它那一版画，只有站主能删。Pomelo：Atlas 模块（柚子的助手、模块坞图标）、读「呈现结果」生成旅程、信封和小报的页面、往年补做、首页的信封 | 站主目视全部幕和自动翻的节奏；逐帧总览自检；版面检查通过；Pomelo 里用编的一年数据走完整个旅程，再用站主真实的一年走一遍（打包版） | 12-24 |
| 10 收口与正式版 | 重写 Pomelo 的 `docs/design.md`（开发指南并进去，不再单独写 `v0.9-guide.md`）；`sync --check` 全对；`npm run all`、Pomelo 全部测试；升级测试；站主 `pnpm app:install`；12 月 31 日的年度总结在 Atlas 里打开 | 正式版装好；1 月 1 日站主在桌上拆信封 | 12-31 |
| 11 第二条线与 MCP | Dawn Plan 的最后一个 Phase，不挡 Pomelo 后面的开发和优化。其他 Agent（Codex、Argon）全程在本地画布探索的流程和接力规则，用一个小任务跑通；`dw` 包成 MCP 服务，只听本机 | Codex 或 Argon 做完一个小任务，站主本地看过、批过，成稿进 `schemes/`；一个 Agent 不用命令行、用 MCP 新建、自检、导出一块画布 | v0.9 之后 |

**不在 Dawn Plan**：v0.9 之后、v1.0 前的系统通知和书摘；Old Timer；Vermilion 的新工作（Vermilion 朱红在现用账号重发一份，等 Vermilion 下次改动时顺手做）。

### 开工前要知道

- **规则和源**：视觉规则在 `schemes/pomelo/DESIGN.md`。画布的源在 `canvases/pomelo-explore/`，怎么生成和发布见它的 `README.md`。手作零件走 `tooling/handmade/`，数值在 `schemes/pomelo/tokens/handmade.json`；柚子、模块贴纸、App 图标的图形在 `schemes/pomelo/marks/art.mjs`，`tooling/handmade/marks.mjs` 生成 SVG（`schemes/pomelo/marks/README.md`）。审看用本地画布 `canvases/pomelo-marks/`（图标、空状态插图）、`canvases/pomelo-frame/`（外框原型）、`canvases/pomelo-motion/`（动效与空状态），站主在 bench 里批，`dw review` 读。动效零件在 `schemes/pomelo/motion/`（写法见它的 `README.md`），bench 的动效台 `/#/motion/pomelo` 拖时间轴、导 GIF。
- **样稿只放画布，不往 Design System 里写**；演示只用假数据。
- **Pomelo 这边**：前端变量用 shadcn 命名（`src/index.css`），Pomelo 方言的变量名对照在 `schemes/pomelo/tokens/targets.json`，构建产物 `dist/pomelo/tokens/pomelo.css`。App 图标在 `src-tauri/icons/`。Pomelo 的规矩在它的 `CLAUDE.md`，怎么测在 `docs/testing.md`。

### 知道的限制

- **要联网**：画布运行时从 jsDelivr 取 React，Vermilion 和 Design System 页用 Google Fonts；导出的单文件 HTML 也一样。
- **Vermilion 的渲染偶尔不一致**：`logo-mark-light.png` 偶尔和上传记录差一点（见下面「Vermilion 现状」），这时构建不写 Design System 的 index。界面和 `dw ds install` 会按 `system.json` 和 `published.json` 补出来，概览页上有一行提示。
- **大画板拉回**：claude-artifacts 的 `read_file` 对用类型建的画布一次只给一个文本文件，内容经过对话，几百 KB 的画板不适合这样拉。办法见 `docs/cloud.md`「下载」。
- **导入**：Claude 导出的单文件 HTML 没有画布的排布、页和便签，`dw import` 按每行 4 张排开。
- **旧版本只在本地**：界面里的「版本」是 `.versions/` 里存过的，不含云端的版本历史；云端的旧版本要先拉回。
- **Tweaks 看的是这一次**：刷新页面就回到默认值，挑好的参数要「复制参数」交给 Agent 改源。
- **本地的页面存储只有一个人**：没有权限分级，`user` 永远是站主（id `local`）；云端的规则（谁能写哪里）本地不管。
- 画板模板里 `<img src="{{src}}">` 这类占位符会让浏览器先请求一次字面地址；本地服务对它回空响应，自检也不算它。

## 移出的决定（Pomelo 方案自己的，细节在 `schemes/pomelo/DESIGN.md`）

- **Dawn Plan**（2026-11-07，站主）：VL2、VW1、Pomelo v0.9 合成一个计划，一个 Agent（现用账号）两边一起做，上一个 Phase 验收后下一个直接开工；计划在两个仓库各留一份一模一样的。其他 Agent 的「第二条线」和 MCP 留着，排到 v0.9 之后。
- **Pomelo 的权限**（2026-11-07，站主）：Pomelo 仓库的代码、`package.json`、版本号都可以直接改；commit、push 仍由站主做；每个 Phase 做完 Agent 直接装正式版（有升级测试也直接做）。
- **模块归类**（2026-11-07，站主）：模块贴纸和模块色跟模块坞的分类走，五色：日常薄荷、兴趣樱粉、求职葡萄紫、柚子橙、工具天蓝（细节在 `schemes/pomelo/DESIGN.md` §2）。
- **模块的图标和颜色**（2026-11-08，站主）：每个模块（自带的、助手、自建的）都能换成画好的任一张贴纸、五种分类色的任一种，默认是它自己的；自建模块也有贴纸，所以多画一批通用贴纸（从 Phase 8 提前）。
- **B3 外框怎么对应 Pomelo**（2026-11-08，站主）：开着的页就是页签，叠在纸的右边、顶栏右边「桌上开着」；不要索引签，置顶的在桌面下排「常用」和柚子瓣；子页插在纸的上边；模块坞变成贴纸簿（细节在 `schemes/pomelo/DESIGN.md` §1）。
- **Phase 4、5 一起做**（2026-11-08，站主）：外框没有动效太生硬，Phase 5 的动效和空状态跟 Phase 4 一起做、一起批，批了以后一起接进 Pomelo。动效照 Phase 2 定稿，例如柚子瓣的小签用「控件的小动静」里的小签（挂在线上晃两下停住）。
- **Pomelo v0.9 的排期**：2027 年元旦前全部做完，Atlas 在新外框里，桌上的信封原样实现；不因时间压力降低完成度（2026-11-05，站主）。「在 Pomelo 里看画布」的模块排在 v0.9 之后（2026-11-06，站主）；2026-11-09 站主提前到 Dawn Plan · Phase 8，在 Atlas 之前。
