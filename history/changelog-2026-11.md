# CHANGELOG · 2026-11（归档）

根目录 `CHANGELOG.md` 里 VL1 收官、VL2、两个仓库合并、Dawn Plan 这一段的逐条记录，2026-11-12（v1.0 · Phase 0）原样移来，内容没有改。**只是历史，不是规则**：文中的「`ROADMAP.md`」「下一步」「还没做」都停在当时；摘要表在 `CHANGELOG.md`，现在的状态看 `ROADMAP.md`。

文中提到的 `bench/history/vw1-plan.md` 现在是本目录的 `vw1-plan.md`。

2026-11-15（到 v1.0 计划 Phase 2、3 验收以后）又原样移来 11-12～11-15 仓库自己的八段（计划分开、Phase 0–3），排在最前面；同一时期 Pomelo 的会话写的两段留在 `CHANGELOG.md`。那几段说的「`ROADMAP.md` 的 Phase N」现在在本目录 `v1-plan.md`。

2026-11-16（Phase 4 验收以后）又原样移来 11-15 仓库自己的两段（Phase 2、3 验收和 Phase 3 Refine，Phase 4），排在最前面。

2026-11-24（仓库 1.0.1）又原样移来 11-13～11-24 的全部段落（Pomelo v1.0、Phase 5、Pith 的设计、版本号从 1.0.0 起），排在最前面。那几段写的旧提交号（`546725d` 这类）在站主 11-24 重建 Git 之前的历史里。

2026-11-26（仓库 1.0.2）又原样移来 11-24～11-25 的五段（仓库 1.0.1 和它的收尾、Pith 1.0.1～1.3.0），排在最前面。

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

## 2026-11-24 · 合并 Pith 的设计；版本号从 1.0.0 起（Pith 的会话）

- **合并**：云端的 `agent/claude/pith`（19 个提交，到 `7c1350f`）并进 `main`。只有 `CHANGELOG.md` 冲突，两边的条目都留了；`schemes/pith/CLAUDE.md` 里 Pith 的旧路径 `personal-research-lab` 改成 `pith`。
- **删分支**：本地 `agent/argon/pith`、`agent/claude/pith`、`agent/codex/pith`（都已并进 `main`），GitHub 上的 `agent/claude/pith`。现在只有 `main`。
- **新的开发准则**（站主定）：整个仓库一个版本号，从 1.0.0 起（`package.json` 原来是 0.13.0）；按开发程度升版本，开工前先问；每轮自己 commit、push 由站主做；提交信息 `vx.x.x: dev description`，不署名。写进 `CLAUDE.md`「开工前」和新的「版本与 Git」，`docs/sessions.md`、`ROADMAP.md`「授权记录」跟着改；加了 `.claude/settings.json` 关掉 Claude Code 默认的署名。
- **验证**：合并后 `npm test` 37 项全过，`node tooling/pith/build.mjs --check` 一致。改完准则和版本号以后又跑了一遍 `npm test`，37 项全过。

## 2026-11-24 · Pith 0.1.0：建方案、优化页 R1、清理（本仓库的会话）

- **站主说的**：验收完毕，开始做优化页、建 `schemes/pith/`；Logo 的动效从茎到碗要连起来、图形上那层细细的空白填好（别处不改）；Atelier 里 Pith 的东西只留最终一轮、Design System、Motion Deck（云端不清理，只清 Pith 的）；提交推送，之后本地会话合并、按这套开发 Pith。
- **Logo 的生长**：茎和碗的前段放在同一个遮罩下（茎往碗里多伸 1，两块叠着，不留缝），碗绕回茎上的后段用窄一点的遮罩、画同一条中心线，所以一笔长出来、中间不停；脚、卷、果和不动的 Logo 都没改。
- **`schemes/pith/` 0.1.0**（`dw scheme new` 起的，`status: proposed`）：
  - token：两套配色（纸与海默认、雾与赭），各有明暗，19 个角色；最淡的字比 EX 里深浅各挪了一点点，好在选中行的淡底上也过 Lc 60；APCA 两套明暗 56 对全过。字（Newsreader、Lato，中文 Noto Serif SC、Noto Sans SC）、字号、间距、阴影；动效两档、三种性格、六个登记的表面。
  - 资产 36 个（Logo、会长的 Logo、App 图标、顶栏和界面六个、十种记录、生长阶段、十四个 Agent 图标），由新的 `tooling/pith/`（`glyphs.mjs` 几何、`build.mjs` 写 SVG 和清单，`npm run build:pith`）生成；SVG 单独打开靠属性上色，内联时留类名给动效。
  - 动效零件七个：悬停「上墨」、顶栏三个图标的生长、Logo 的生长（待批）、Pith 在想、舒展、存进知识库、换配色的湖面波纹；都逐帧导出过 GIF（Motion Deck）。
  - Design System：12 个组件（封面、顶栏、输入框、状态行、回答和页边注、交付卡、知识库卡片、文献库的行、枝桠、按钮和链接、外观、图标）、6 组资产；`bundle.css` 末尾插进雾与赭和全部动效零件。还没发到 Claude。
  - `DESIGN.md` 是视觉基线和开发说明（原 `HANDOFF.md` 第 3 节「界面」的细则搬进来）；`CLAUDE.md` 写了源从哪来、怎么验，以后归 Pith 的会话。
- **Pith Explore**：本地只留 **R1：Pith 定稿**（`Pith-` 开头的 6 张板：说明、App、Logo、顶栏、Pith 在想、图标），生成器 `src/` 从方案取颜色和动效（Design System 的运行时）、从 `tooling/pith/` 取图形，不另写一份；EX1–EX11 的页、生成器、字体删了（Git 历史 `546725d` 有）；云端那份没动。
- **文档**：`HANDOFF.md` 只留新架构（第 1–5 节），Phase 5 的结论挪到 `history/pith-phase5.md`；`CLAUDE.md`、`docs/sessions.md` 的分工表里 Pith 的会话多了 `tooling/pith/`；`docs/licensing.md` 换成 Pith 现在用的四个字体（删掉的候选字体去掉）；`README.md`、`ROADMAP.md`、`canvases/README.md`、`tooling/README.md` 跟着改。问卷画布 `v1-phase56-questionnaire/` 没删：Phase 6 的冷启动验收还要用它第 4 页。
- **验证**：
  - `npm run qa -- --scheme pith` 161 项全过；`npm run build:ds`、`npm run check:ds`（12 个预览 × 明暗）没有问题；`npm run build:motion -- --scheme pith` 七个零件 × 明暗都导出，逐帧总览看过；`npm run qa:determinism -- --scheme pith` 89 个文件两次逐字节一致；`npm test` 37 项全过；`node tooling/pith/build.mjs --check` 一致。
  - `dw check pith-explore` 6 张板全过；App 板走了一遍（打开时 Logo 长出来、悬停三个图标、发问、页边注、存卡、换雾与赭的波纹）没有报错；R1 生成两次逐字节一样；Logo 的生长在 10 倍大的分解图上逐帧看过。
  - 没目视的：动效的手感、水面扭曲在真机上的流畅度。

## 2026-11-24 · Pith Explore 第十一页：验收（本仓库的会话）

- **站主说的**（拿 EX10 的 B 蕨芽和轮生的设置提的）：
  - 「存进知识库」的 Agent 图标：红色的点埋进土里，再长出小枝丫。
  - Logo 的动效：从底下长出来，再结出果实（红色的点）。
  - 顶栏悬停：知识库从底下长出来、文献库书一本本摆出来、设置叶子一片片转出来再定住；红色都最后出现。
  - 做完出新一轮画布验收。
- **EX11**（`canvases/pith-explore/ex12/`，页 id `ex12`，打开画布先落在这页）：
  - Logo 只留 B 蕨芽：拆成脚、茎、外圈、内卷四段，两段卷各用一个遮罩沿中心线画出来；App 打开时长一次，悬停再长（1.7 秒）。
  - 顶栏三个图标的部件分开命名，悬停各自长出来（0.9 / 1.05 / 1.3 秒），珊瑚色最后出现；设置的滑杆备选去掉了。
  - 「存进知识库」重画：种子落下、顿一下、埋进土里，土鼓一下，茎、两根枝和叶、珊瑚色的芽依次长出来（2.6 秒一轮）；App 里交付卡的「已种下」前面演一遍，停在长好的样子。
  - 板：说明、Logo（大图循环 + 五段时间 + 分解）、顶栏（真的顶栏能悬停，三个图标各一行：循环 + 分解）、Pith 在想（加了「存进知识库」的分解）、图标、悬停、动效、App。分解帧用暂停的动画定在某一刻，和真的播放是同一份时间。
- **HANDOFF**：第 3 节「界面」更新了状态行和悬停两条，加了「Logo 会长」一条。
- **验证**：
  - `dw check` 8 张板全过；生成两次逐字节一样。
  - 先在 6 倍大的分解图上看过每一段（修了细线藏起来时末端多出的一个点）。
  - App 板按时间截过：打开时 Logo 长出来、悬停 Logo 和三个图标、存卡后「已种下」的图标，没有报错；`dw frames` 看过顶栏板的循环。
  - 没目视的：这些动效的手感、设置转得快不快、悬停 1 秒多来回划会不会烦。
- **云端**：Pith Explore（旧账号）发成第 15 版，加了 8 张板、换了 `canvas.json`，逐个核对 sha256 一致；发之前核过云端的 `canvas.json` 还是第 12 版那份、`dc-runtime.js` 和本地副本一样（第 13、14 版是画布类型自己升级）。

## 2026-11-23 · Pith 的目录改名（Pith 的会话）

- Pith 仓库从 `~/Documents/GitHub/personal-research-lab` 改名为 `~/Documents/GitHub/pith`（和 GitHub 上的 `elenskye/pith` 同名）。指向旧路径的三处跟着改：`ROADMAP.md` 授权记录、`docs/adoption.md` 消费方表、`docs/sessions.md`「Pith 的会话」。
- 只改了文档，没跑 `npm test`。

## 2026-11-23 · Pith Explore 第十页：铅字 × 数字花园（本仓库的会话）

- **站主定了**：
  - 画法选 S2 铅字，整体图形语言是「铅字」+「数字花园」。
  - 动效：存进知识库用「生长」，种子要准确打到图标；回答出现、点编号看原文用「舒展」。
  - 换配色像几层真实的湖面波纹。
  - 「Pith 在想」照 Claude Code，按 Agent 行为做一组动态图标。
  - Logo 和知识库、文献库、设置图标模仿植物的特征；多用珊瑚色点缀；借 Vermilion 的悬停，用到所有能悬停的地方。
- **EX10**（`canvases/pith-explore/ex11/`，页 id `ex11`，打开画布先落在这页）：
  - Logo 三个候选，都是铅字：A 髓心（碗里刻年轮、正中一颗珊瑚色的髓）、B 蕨芽（P 的碗是一卷渐细的蕨芽，卷心一颗芽）、C 叶段落（段落符的碗换成一片叶）。
  - 整套图标：知识库是叶序，文献库是夹着一片叶的书，设置是轮生的叶（备选：种子做滑块的滑杆）；界面三个、十种记录、生长阶段都按铅字画，每个一处珊瑚色。
  - 十四个 Agent 行为的动态图标（在想、检索、读原文、引用、查文献库、联网、计算、加载技能、写、问你、存进知识库、后台任务、改 Word、完成），状态行的字上扫过一道光。
  - 悬停：借 Vermilion 的做法，Pith 的「上墨」：纸片滑进来、细线重写、实心压一下、珊瑚点抵达；链接下划线从两端收拢；列表行节点落一颗珊瑚点。
  - 动效板：回答、页边注舒展；存卡生长（种子落到知识库图标正中）；换配色是五圈冷暖交替的湖面波纹，加一层水面扭曲。
  - App 板全部接上：Tweaks 换 Logo；状态行换成 Agent 图标、等的时候输入框里是「在想」；存卡时按真实位置算种子的弧线；配色加了珊瑚色 `--coral`。
- **HANDOFF**：第 3 节「界面」加了状态行的动态图标、悬停、动效三条开发说明。
- **验证**：
  - `dw check` 7 张板全过；生成两次逐字节一样。
  - App 板走了一遍，没有报错；`dw frames` 看过动效板。
  - 图形放大逐个改过。
  - 没目视的：悬停和动效的手感、水面扭曲的流畅度。
- **云端**：Pith Explore（旧账号）发成第 12 版，加了 7 张板、换了 `canvas.json`，逐个核对 sha256 一致；发之前核过云端的 `canvas.json` 还是第 11 版那份。

## 2026-11-23 · Pith Explore 第九页：图标、动效和亮眼时刻（本仓库的会话）

- **站主定了**：
  - 配色留纸与海和雾与赭（站主说「L1 和 L2」，按配色理解）；Pith 里要能换。
  - 画布和 App 默认用纸与海。
  - 框架、对话页定了。
  - Logo 和图标都不满意；照 Pomelo Explore 的做法，再做一轮图标、动效和亮眼时刻。
- **EX9**（`canvases/pith-explore/ex10/`，页 id `ex10`，打开画布先落在这页），照 Pomelo Explore EX1 和 R4 的结构：
  - 三种画法各一张板，同一批东西各画一遍（App 图标、Logo 和字标、顶栏三个、界面三个、知识库十种记录、生长阶段、放进界面的样子）：
    - S1 钢笔淡彩：手抖的钢笔线加错开的淡彩；Logo 是茎的横切面（一圈维管束、中间那团髓）。
    - S2 铅字：实心、粗细对比的印刷符号；Logo 是镜像的段落符，正好是个 P，右上一颗注码；生长阶段是星号从点长成花。
    - S3 剪纸：不描边的平涂色块叠在一起；Logo 是小写 p，圆心空着；生长阶段像月相。
  - 维度板：以钢笔淡彩为底，一次只变一项（线宽、手抖、淡彩、淡彩的颜色、线的颜色）。
  - 动效板：四种性格（生长、舒展、落墨、翻页）× 三个场景（回答出现、点编号看原文、存进知识库），一直循环，减弱动效时停在终态。
  - 亮眼时刻板，十个招牌时刻，都能「再来一次」：打开 Pith、叫出以前的对话、Pith 在想、回答展开、点编号看原文、存进知识库、字会长、换配色（能点）、空的知识库、导入 Zotero。
  - App 板：框架和对话页照 EX8；设置 › 外观里有两块色板和明暗三档，换配色时颜色慢慢过渡（`@property`），从点的地方漾开波纹；⌘K 也能换；图标跟 Tweaks 的画法走，知识库卡片的标签换成十种记录各自的图标。
- **HANDOFF**：第 3 节「界面」加了配色切换的开发说明。
- **验证**：
  - `dw check` 8 张板全过；生成两次逐字节一样。
  - App 板走了一遍，没有报错；动效板、亮眼时刻板用 `dw frames` 看过时间线，重放、换配色点过。
  - 图标放大逐个改过。
  - 没目视的：动效性格的手感、换配色过渡的快慢。
- **云端**：Pith Explore（旧账号）发成第 11 版，加了 8 张板、换了 `canvas.json`，逐个核对 sha256 一致。发之前核过云端的 `canvas.json` 还是第 9 版那份；中间的第 10 版是画布类型自己升级界面，项目文件和 `dc-runtime.js` 没变。

## 2026-11-23 · Pith Explore 第八页：叶子和枝桠重画，三套配色 × 三套 Logo（本仓库的会话）

- **站主定了**：
  - 对话页用 V1「生长」，图形和动效要好好画（EX7 的线太乱）。
  - 去掉侧栏按钮：对话历史只能快捷键或双指往一侧拖出来（写进 `HANDOFF.md` 第 3 节「界面」，开发时注意）。
  - 对话历史是从左边长出来的枝桠，背景和对话页融为一体；设置的导航也这样，只是常驻。
  - 知识库不出现「刚种下、长着、常青」的说明。
  - 新探索：至少三套配色、三套 Logo 加图标（原来的很粗糙）。
- **EX8**（`canvases/pith-explore/ex9/`，页 id `ex9`，打开画布先落在这页）：
  - 叶子：一片规整的叶子，主脉在对话框的中线上，叶柄在左、叶尖在右；十对侧脉沿主脉成对长出去，通到芽的五根略深；叶缘、很淡的叶面最后铺上；五颗芽在叶缘上，标签都在叶子外面，线不压字、不交叉。约 3 秒：问候和对话框 → 主脉 → 侧脉 → 叶缘和叶面 → 芽。悬停一颗芽，通到它的叶脉亮起来。
  - 对话历史：⌘\（Ctrl+\）或双指往右滑，一根主枝从左边伸进来，每段对话一根小枝；没有底色，页面往右让 60、叶子变淡；往左滑、Esc、点空白处收起。⌘K 里也有「以前的对话」。
  - 设置：导航是常驻的枝桠，选中的那根小枝和节点是强调色。
  - 三套配色（`palettes.mjs`，明暗各一版）：P1 纸与海（Maggie 的暖白、海蓝、品红）、P2 雾与赭（冷雾灰、石板字、赭石、靛蓝）、P3 夜与金（暗色为主，蓝黑底、羊皮纸字、金色叶脉、月光蓝）。
  - 三套 Logo 加图标（`marks.mjs`，24 格手算）：L1 芽（单线一笔画的芽）、L2 髓（茎的横切面，每个图标一颗实心的髓，生长阶段是年轮圈数）、L3 叶（半片叶子拼成的 P，细线植物画）。每套六个图标（知识库、文献库、设置、新对话、搜索、发送）和三个生长阶段，悬停各有动作。
  - 总览板把三套配色和三套 Logo 并排放大；三张能点的板默认 P1 + L1、P2 + L2、P3 + L3（暗），Tweaks 里能随便拼。
- **验证**：
  - `dw check` 5 张板全过；生成两次逐字节一样。
  - 三张板照任务走了一遍，没有报错；`dw frames` 看过叶子长出来的顺序；Logo 和图标放大逐个看过。
  - APCA 六版全过（最低 Lc 60.8）。
  - 没目视的：叶子和枝桠的节奏、真机触控板的横滑手感。
- **云端**：Pith Explore（旧账号）发成第 9 版，加了 5 张板、换了 `canvas.json`，逐个核对 sha256 一致；发之前核过云端的 `canvas.json` 还是第 8 版那份。

## 2026-11-23 · Pith Explore 第七页：花园笔记细化（本仓库的会话）

- **站主定了**：
  - 整体方向为花园笔记（A）。
  - 顶栏只留左边的 Logo；知识库、文献库、设置三个图标居中，不写字。
  - 不要搜索框，只用快捷键 ⌘K。
  - 打开 App 要亮眼：对话框居中，左栏默认收起。
  - 文献库要右侧栏，能阅览、改元信息。
  - 知识库、文献库不放「引用过它的对话」。
  - 知识库、文献库、设置更简约、大气；图标和动效再打磨；对话页给几个方案。
- **EX7**（`canvases/pith-explore/ex8/`，页 id `ex8`，打开画布先落在这页）：
  - 三张板只差对话页打开的那一刻：
    - V1 生长：叶脉从对话框一笔笔长出去，末梢是最近照料的材料，问候的字重慢慢长。
    - V2 一页：大字问候逐字浮起，输入线从中间向两边拉开。
    - V3 一瞥：六张最近的卡片浮上来围成一圈。
  - 共用的部分：
    - 新画的图标：两片叶子的芽、三本书、两根滑杆；悬停时叶子摆、书歪、滑块挪，名字过一会儿浮出来。
    - 左栏从左边滑出、盖在上面。
    - 问了以后的对话页居中，带页边注。
    - 知识库只剩大标题、一排知识库名和卡片墙。
    - 文献库是五列表格；点一行，表格收窄，右边滑出面板（阅读、编辑元信息、附件、在哪个知识库、标签）。
    - 设置是一列字加一个人。
  - 存卡时种子飞向知识库图标。
- **验证**：
  - `dw check pith-explore` 28 张板全过；生成两次逐字节一样。
  - 三种开场按时间截过。
  - 文献库面板、编辑态、左栏都看过。
  - 没目视的：开场动效和悬停的手感。
- **云端**：Pith Explore（旧账号）发成第 8 版，加了 4 张板、换了 `canvas.json`（顺手把 EX5、EX6 试跑时留下的短页名补全），逐个核对 sha256 一致。

## 2026-11-23 · Pith Explore 第六页：新架构第三轮，A 和 C（本仓库的会话）

- **站主对 EX5 的意见**：
  - A 依然很有竞争力：再打磨动效；知识库每种记录做一种卡片；文献库主体用表格。
  - B、C 偏离了想法：要的是打开 Pith，正中央一个大而抢眼的对话入口；画布可以自由拖动，不是思维导图；页面做成数字花园之间经脉相连。
  - D 的「字会长」留下；D、E 舍弃；不要像素。
  - 站主又在提问里定了 C 的四点：铺材料、一份一株；经脉是引用和生长；画成叶脉；问了以后入口就地展开成对话。
- **EX6**（`canvases/pith-explore/ex7/`，页 id `ex7`，打开画布先落在这页）：
  - **A 花园笔记**：
    - 知识库有十种卡片（全文是排版做的封面、摘抄是引语、笔记是横线纸、网页快照带浏览器边框、本机文件带扩展名、扫描件、概念卡、调查报告带结论、WonderLab 作品带小图、存下的回答），卡片墙能滚。
    - 文献库改成表格（13 条真书真论文，点一行在下面展开）。
    - 动效：导航的点会滑；段落一行行展开；编号前的字扫过下划线；状态行的种子跟着长；存卡时种子飞进「知识库」、亮出 +1。
    - 标题按生长阶段变重。
  - **C 叶脉**：
    - 夜色（Tweaks 换浅色），正中央一个大入口，外面有慢慢扩散的涟漪。
    - 四条主脉伸向四个知识库，越分越细，末梢的芽是材料；生长脉连起长出来的材料。
    - 问了以后入口就地展开成对话，镜头往左让出右边，引用的芽亮起来、金色顺着叶脉画过去；存卡时叶脉长出新的一枝。
    - 画布按住就能拖；点知识库的名字或芽，镜头飞过去；文献库、角色在 ⌘K。
  - **外壳**：从 EX5 复制，加了能拖的画布、镜头和收起。
- **验证**：
  - `dw check pith-explore` 24 张板全过；生成两次逐字节一样。
  - A、C 浅、深都点着走完、截图看过；C 的拖动单独测过。
  - APCA：A 浅、C 浅全过；A 深、C 深各有一处没到 60（README 自检里有数）。
  - 没目视的：动效和拖动的手感。
- **云端**：Pith Explore（旧账号）发成第 7 版，加了 3 张板、换了 `canvas.json`，逐个核对 sha256 一致。

## 2026-11-23 · Pith Explore 第五页：新架构第二轮（本仓库的会话）

- **站主对 EX4 的意见**：花园笔记的风格和配色很舒服，有数字花园的感觉，但粗糙；园林平面大胆，亮点是「所有功能在一个屏幕，App 本身就是一张研究画布」，去掉左下角的四个入口（设置也不要），要哪页就快捷键叫出搜索框，「园林」主题改成数字花园、不要绿色；叠页、年轮舍弃。
- **EX5**（`canvases/pith-explore/ex6/`，页 id `ex6`，打开画布先落在这页）：五个方向，各一张能点的板，同一条任务，都加了 ⌘K 搜索框。
  - **A 花园笔记·打磨**：保持传统结构，加了左边一列对话、页边注、三种知识库卡片、书封墙、设置左栏，深色次要字调亮了。
  - **B 花园画布**：花园笔记的纸和卡片铺在没有入口的画布上，点编号，旁边那簇里的卡亮起来、连一根海蓝的线。
  - **C 像素花园**：研究画布的新风格，点阵地面、像素苗床，检索时格子扫亮，角色是像素头像。
  - **D 字的花园**：只有黑白，字重表示生长阶段。
  - **E 三层**：对话、知识库、文献库三张平面，点编号三层斜过来，一根线从这一句穿到那本书。
- **验证**：
  - `dw check pith-explore` 21 张板全过；生成两次逐字节一样。
  - 五个方向浅色、深色各点着走完一遍，截图看过，没有报错。
  - APCA 浅色全过，深色几处次要字没到 60（数在 README 自检）。
  - 没目视的：动效的手感和节奏。
- **云端**：Pith Explore（旧账号）发成第 6 版，只加了 6 张板、换了 `canvas.json`，逐个核对 sha256 一致。

## 2026-11-22 · Pith Explore 第四页：新架构的四个方向（本仓库的会话）

- **EX4**（`canvases/pith-explore/ex4/`，页 id `ex4`，打开画布先落在这页）：照 Pith 新架构（`HANDOFF.md` 第 1–5 节）。站主要求：一个方向几乎照 Maggie Appleton、一个适当借、两个大胆试，都要简约、大气、有数字花园的感觉。每个方向一张 1280 × 800 的板，对话、知识库、文献库、设置 › 角色四屏共用一份状态，能点着走同一条任务。任务是：# 选知识库、问斯密，回答带编号；点编号看原话、去知识库和文献库；存概念卡；@审稿人，再回答问题卡；改审稿人的说明，对话跟着变。
  - **A 花园笔记**：配色、字号、卡片墙、生长阶段、「种下于、照料于」照 Maggie 网站的 CSS 值；她的 Canela 是付费字体，换成 Newsreader 和思源宋体，界面字用和她一样的 Lato。
  - **B 叠页**：出处一页页从右边叠出来，最左那页收成竖排书脊。
  - **C 园林平面**：整个 App 是一张晒图风格的园林平面图，换屏时镜头移动，被引用的苗床会亮。
  - **D 年轮**：一圈一个月，材料是圈上的点，回答时用到的点一颗颗亮起来。
- **共用的**：`content.mjs`（真书真论文，斯密三句、Young 一句原话）、`shell.mjs`（四屏状态机、`/ @ #` 菜单、角色）、`guide.mjs` 说明板、`apca-report.mjs`。只用 Google Fonts。
- **验证**：
  - `dw check pith-explore` 15 张板全过；生成两次逐字节一样。
  - 四个方向浅色、深色各点着走完一遍，截图看过，没有报错；`dw frames` 看过 C 的镜头和 B 的回答播放。
  - APCA 探索页只提示：浅色 C、D 全过；深色的次要字、注记大多不够（README 自检里有数）。
  - 没目视的：动效的手感和节奏。
- **云端**：Pith Explore（旧账号，站主 11-21 授权）发成第 5 版，只加了 5 张板、换了 `canvas.json`，逐个核对 sha256 一致；发之前核过云端和本地上一版一样，没人在云端改过。
- 为了看 Maggie 的网站、让截图里的 Google Fonts 真加载，这个会话新建了云端环境 `elen-visual-atelier`（站主批准），多放行了 maggieappleton.com、fonts.googleapis.com、fonts.gstatic.com。

## 2026-11-22 · Pith 的新架构（本仓库的会话）

- **读了 Pith 仓库**（`elenskye/pith`，只读，`b128d24`），对照站主提的四个问题（回复限制太死、少了知识库、首页要是对话、要大气简约少按钮）和 Deva 的角色做法，写了新架构，发成「Pith 新架构」页（https://claude.ai/artifact/1a21TV2iijxHU3c6C6Xsqh ，现用账号）。站主当天认了，另定：编号引用、不核对；一份材料能进多个知识库；排版、调查、概念拿掉页面变成技能；角色页放「设置 › 角色」；初始角色 Pith、伴读、审稿人、编辑。
- **`HANDOFF.md`**：第 1–5 节换成新架构（理念、四个入口和三层数据、对话 Agent 和技能、角色、Pith 的会话要改的文档和分期、视觉下一轮怎么验），取代 11-21 的三个入口；第 6–8 节没动，第 9 节去掉定了的两条。
- **`pith-app.md`**：照新架构重写（四个入口、三个符号、初始角色、不再画四类句子的记号、第一轮画什么）。`ROADMAP.md` 的第 3 步、Pith 那一行、接下来、和 Pith 联动的决定，`README.md` 的方案表跟着改。

## 2026-11-22 · 改 Atelier：照 Phase 5 的教训（本仓库的会话）

站主 11-22 定的第二步（`HANDOFF.md` 第 8.4 节），四块都做，改动直接进 `main`。

- **设计功夫 Skill**（`skills/design-craft/`）：画什么、怎么判断好不好——先摆 2–4 个真正不同的低保真方向（遮住颜色和字体还分得出才算）、每个方向押一个注并写代价、点名模型的默认惯性（旧纸底加衬线加陶土色、苔绿植物隐喻、三栏骨架、左彩条卡片、渐变光晕、满屏小动效、emoji）、动效集中在一两个时刻、能点的原型用画布模板写、评估几家先遮色看骨架。带 `brief-template.md`（参照、反例、要避开的默认、真实任务、第一轮只交方向）。`design-loop`、`questionnaire`、`skills/README.md` 指过去。
- **探索和定稿分两档门槛**：EX 页可以手写画板、不要求生成器和逐字节一致、用 Google Fonts、APCA 只提示；R 页和建方案才要生成器、逐字节一致、字体登记和子集、APCA 全过。写进 `canvases/README.md`「Explore Deck 的规矩」、`CLAUDE.md` 核心约定 9（站主 11-22 定）、`design-loop`。
- **`dw frames`：Agent 看得到动效**（命令行和 MCP `frames`）：一张板不减弱动效，按时间线截几帧（`--at` 或 `--every`/`--until`，默认每 250ms 到 2000ms，最多 24 帧），拼成总览 `.shots/frames/<画板名>.png`；`--click` 先点按钮再截（要点一下才动的）。总览也是 Chrome 拼的，不加依赖。截图那段拆成 `withCdpPage`、`openAndSettle` 给 `captureUrl` 和 `captureFrames` 共用。`design-craft`、`design-loop`、`bench/README.md` 写了用法。
- **画布运行时换新**：`bench/vendor/claude-design/dc-runtime.js` 换成 11-22 云端 Design 类型带的那份（197,599 字节，`c4929939…`，取的 CDN 文件和校验值和旧的一样），`runtime.json` 跟着改；`dw pull`、`verify`、`publish` 读到的清单里有 `artifact-type/dc-runtime.js` 而和副本不一样时提示（`runtimeDrift`），`docs/cloud.md` 写了清单要留这一条。
- **无头 Chrome 的窗口至少 800 × 600**：Linux 上窗口小于约 500px 时 Chromium 没有能截的画面，`Page.captureScreenshot` 超时、回退到命令行截图（云端容器里 `npm test` 那一条一直挂）；视口照旧按板的大小。
- **共用零件**：`canvases/_lib/board.mjs`（画板外壳 `dcBoard`、一张板几屏共用状态的 `screens`）、`canvases/_lib/apca.mjs`（`lc`、`checkPairs`）、`tooling/fonts/subset.mjs`（TrueType 子集，带命令行；从 Pith Explore 的 Claude 生成器挪过来）。Pith Explore 的 Claude 生成器改用前三样，Argon 的改用 `apca.mjs`（原来绕过 `root.mjs` 直接引 `apca-w3`）；重跑后板和字体子集逐字节一样。写进 `canvases/README.md`、`tooling/README.md`。
- **规则文档重写成短版**（站主 11-22 选的）：`CLAUDE.md` 从 188 行减到约 100 行，只放核心规则（开工前、权限边界、几个会话怎么分、仓库结构、核心约定、画布与 bench、验证、采用和放哪、文档职责），细则挪到新的 `docs/sessions.md`（新会话接手、几个会话怎么分的细则、第二条线，原文照搬）、`docs/workflow.md`「验证」、`canvases/README.md`「看、批、写」、`bench/README.md`；规则没删。`ROADMAP.md` 从 126 行减到约 80 行：现在、接下来、到 v1.0 要做到的、限制、决定、授权；Phase 0–5 的经过移进 `history/v1-phase5.md`。指向挪走章节的地方都改了（`README.md`、`bench/README.md`、`design-loop`、`canvases/` 的几份）。`docs/workflow.md` 的探索轮数改成和 `design-craft` 一致（2–4 个低保真方向）。
- **验证**：`npm test` 37/37（新加 `frames` 两条、运行时提示一条，MCP 的工具清单加了 `frames`）；新运行时下 `dw check` pith-explore 10、vermilion-explore 16、peck-explore 47 张全过，pomelo-explore 92 张有 3 张「字被裁掉一截」，换回旧运行时一样，是容器里没有 Pomelo 用的 Mac 字体。

## 2026-11-22 · Phase 5 三家合进 main，Pith Explore 只留三家的最新一轮（本仓库的会话）

- **合并**：`agent/claude/pith` 真合并；`agent/codex/pith`、`agent/argon/pith` 只记下合并（提交历史都在），文件只取最新一轮。站主定：三家各留最新一轮放进同一块画布对比，分支别的改动不要，正式版没定，所以 `schemes/pith/` 不建。
- **Pith Explore**（`canvases/pith-explore/`）：三页——EX1 Claude R3（`X3-Guide`、`X3-A`–`D`）、EX2 Codex R5（`R5-Prototype` 和它的样式、脚本、字体）、EX3 Argon EX5（`X5-A`–`D`）。Claude、Argon 的生成器挪到 `claude/`、`argon/`，重跑两次和合并前逐字节一样；`dw check` 10 张全过。云端那份（旧账号）换成这三页。
- **`HANDOFF.md`**：三家的交接合成一份：产品理念（三个入口、技能、Deva）、被舍弃的轮次、三家的长短、对 Atelier 的分析和要改的。
- **跟着改的**：`ROADMAP.md` 的 Phase 5 和授权记录、`CLAUDE.md` 里 Pith 那一行、`canvases/README.md`、`docs/licensing.md`（画布带的字体）、`pith-app.md` 开头一句。

## 2026-11-16 · Pomelo v1.0 收口，Pomelo `1.0.0`，Design System 发了（Pomelo 的会话）

- **Design System「Pomelo 柚儿园」**：照 Pomelo v1.0 里现在的样子加了三个组件——Menu（右键菜单：一条矮一点的纸，常用的加粗在上面，组的那一格指着时旁边再出一条）、Callout（见字如面的五种提示框）、Link（柚子链接的小卡、带点线的字、列表里大一号的）；样式进 `bundle.css`，类名不和 Pomelo 自己的撞（`pm-menu--ctx`、`pm-callout`；`pm-lk` 和 Pomelo 的同名同值）。资产加了玩物有志的贴纸。`npm run check:ds` 25 个预览明暗都过。
- **发布**：上传 10 个资产（格式条换的 8 个图标、重画的「当心」、玩物有志的贴纸），记进 `published.json`；61 个 `project/` 文件一次发到现用账号那份，`list_files` 逐个核对 sha256 一致。
- **方案 `1.0.0`**：DESIGN 的形状词汇加了菜单、提示框、柚子链接。

## 2026-11-16 · Pomelo v1.0 · Phase 7 写下的字，Tabloid 1.1.1，Pomelo `0.11.0`（Pomelo 的会话）

- **Tabloid 1.1.1**（替掉 1.1.0，冻结在 `releases/tabloid-1.1.1/`）：站主在云端画布「Pomelo · Atlas 新的几幕」第三轮批了见字如面的两幕，树顶挑 B（木牌）。新文件 `writing.mjs`：写下的字（几篇、多少字、和去年比；标签长成的树，主标签是左右伸出去的枝、子标签是小枝上垂的柚子，树干下挂木牌写没打标签的几篇；十二支铅笔）、重要的时刻（柚子挑的几篇，第一篇抄的那句写进稿纸，其余排成书签，最后是附言）。两幕紧跟留下的日子；记录多了 `article`，数据的样子写进 `atlas/README.md`「写下的字」。`sample.mjs` 加了一年编的见字如面。放不下的主标签名挪到枝头上面、贴着纸边。
- **Pomelo Explore**：R5 的样例重画（21 页）；EX8 的便签和说明写上挑了 B、定稿成 1.1.1。`dw check pomelo-explore` 过，`npm run check:atlas` 过。

## 2026-11-17 · Phase 5 开工：简报、三个 worktree（Pith 的会话）

- **简报**：站主填了验收问卷第 1 页（`canvases/v1-phase56-questionnaire/db.json`）。要点：
  - Pith 是数字花园；多淡雅、简约、灵动，少科技感、学术、机械；
  - 参考 Maggie Appleton 的 Digital Garden；动效是亮点；
  - 交 Design System、一个动效、标志、一屏；明暗都要。
- **跟着改的**：
  - `phase5-brief.md`：加了「一个动效」要交什么，`motion/<id>/` 在 Motion Deck 里能播、能导出 GIF，`X1-Screen` 里用上；参考网站只取感觉、不抄。
  - `pith-app.md`：「Pith 是什么」先写站主自己的话，气质照第 1 页，删了「不能花哨」。
  - `ROADMAP.md`：Phase 5 的状态、简报摘要。
- **三个 worktree**：照「第二条线」从带简报的 `main` 建：`../visual-atelier-<claude|codex|argon>`，分支 `agent/<claude|codex|argon>/pith`。

## 2026-11-16 · 和 Pith 联动，Phase 5 补上 Pith 的背景（Pith 的会话）

- **站主定的**：Pith 的视觉提前，Phase 5 的验收就是 Pith App 的视觉方案。本仓库给 Pith 出设计；Pith 用的时候发现的问题，反过来改本仓库。Pith 用别的项目的设计系统就复制成 `pith-wonder-<名字>`（例：「Pith Wonder - Pomelo」），原方案不动。App 的 `pith` 和 WonderLab 的 `pith-wonder-*` 分开。写进了 `ROADMAP.md`「已拍板的决定」「授权记录」和方案那几行、`CLAUDE.md`「几个会话怎么分」（加了 Pith 的会话）、`README.md` 的方案表、`docs/adoption.md` 的消费方。
- **Pith 的背景** `canvases/v1-phase56-questionnaire/pith-app.md`：从 Pith 仓库抄过来的事实，包括 App 是什么、现在的界面、接进 Pith 要对上的变量名、三家都画同一屏（文献库）。`phase5-brief.md` 让三家先读它，颜色角色要对得上那几个变量。
- **验收问卷第 1 页**：开头说明这一轮只做 App、事实在 `pith-app.md`；「主要用在哪」换成 Pith 的三处（窗口界面、导出的报告和卡片、Word 选项卡）。`dw check v1-phase56-questionnaire` 过。

## 2026-11-16 · Pomelo v1.0 · Phase 7 Atlas 新的几幕，Tabloid 1.1.0，Pomelo `0.10.0`（Pomelo 的会话）

- **Tabloid 1.1.0**（`schemes/pomelo/atlas/tabloid/`，冻结在 `releases/tabloid-1.1.0/`，1.0.3 留着）：站主在云端画布「Pomelo · Atlas 新的几幕」上批了的两种页进了新文件 `parts.mjs`——玩物有志（掌机、卡带盒、二周目的小红章、「玩到二周目以上」那一行）和自建模块的一幕（十个零件、三种排法，照 Pomelo 填好的 `plan` 画）；目录多于十一幕排两栏；打包时带上自建模块能戴的 24 张贴纸。`sample.mjs` 加了七个游戏和三个自建模块（咖啡馆、日语、爬过的山）。数据的样子写进 `atlas/README.md`。写下的字（见字如面）还在改，批了出 1.1.1。
- **Pomelo Explore**：加了「EX8：Atlas 新的几幕」（`scenes/`，从 Pomelo 的原型并进来，5 张 `Scenes-*`）；「R5」的 `Atlas-Pages` 跟着样例变成 19 页（板的高度跟着页数走，摊开看的格子认得自建模块的页）。
- **方案** `0.10.0`：`sync.json` 加了 `tabloid-1.1.0` 两行；`DESIGN.md` 写了 1.1.0。`npm run all` 全过（1509 项，Atlas 的快照都对）。站主 11-16 定 Git 都交给会话做：Pomelo 的会话只提交自己这部分、打了 `pomelo-v0.10.0`，同步进 Pomelo。

## 2026-11-16 · Pomelo v1.0 · 格式条换图标、重画「当心」，Pomelo `0.9.0`（Pomelo 的会话）

- **图标**（`schemes/pomelo/marks/icons.mjs`，照 Pomelo `docs/atelier-sync.md`「8」）：删除线、互链、分隔线、折叠换成 Codex 的（`b28c553`），高亮、编号、提示框、流程图换成 Argon 的（`6e7bb6c`），几何原样取自两家的提交、用原来的名字（种子不变，画出来和对比板一样）。「当心」站主 11-16 说感叹号的点看不见：三角放大一点、竖线短一点，点改用一小段圆头的线（实心小点只有几个点，小的时候是个歪的小三角）。9 个先改 `proposed` 生成、再改回 `approved`，批准记录写了是哪天、谁挑的。方案升 `0.9.0`；DESIGN §6 写了这次。
- **Pomelo Explore**：重跑了 `icons/`、`notes/`、`links/` 的生成器（R3、R6、R7、EX6 里用到这几个图标的板跟着变）；`atlas/` 的板只差配色变量，没留；`canvas.json` 只是键的先后变了，没留。
- **Design System** 照站主 11-15 定的，等 Pomelo v1.0 做完再发（还是 0.7.0）。

## 2026-11-16 · v1.0 · Phase 4 收尾、Phase 5 和 6 的准备，仓库 0.13.0

- **Phase 4 站主挑完**：格式条的 19 个图标里，删除线、互链、分隔线、折叠换成 Codex 的，高亮、编号、提示框、流程图换成 Argon 的，其余 11 个不动。换方案里的图标归 Pomelo 的会话：8 个照 `icons.mjs` 写法的几何（用原来的 id，画出来和对比板一模一样）、建议的做法（原 id、方案升 0.9.0）写进 Pomelo 的 `docs/atelier-sync.md`「8」。说明、评估、站主挑的、当时 `ROADMAP.md` 的写法收进 `history/v1-phase4.md`。
- **删了**（站主让删）：临时画布 `p4-format-icons`、验收问卷 `v1-phase34-questionnaire`（都进了回收处，提交 `b06c1c6` 里还在）、分支 `agent/codex/format-icons`（`b28c553`）、`agent/argon/format-icons`（`6e7bb6c`）。
- **`dw scheme new <方案名> [--title 标题]`**（B5，`bench/src/scheme/new.js`；MCP 加了 `scheme_new`，共 24 个工具）：把 `schemes/_template/` 复制成新方案、填 `{{name}}`、`{{title}}`、`{{Name}}`（Design System 的命名空间），JSON 都能解析才算建好，出错不留半份；再照 tooling 跑 token 构建、质量检查、Design System 构建，每一步过没过都说。
- **方案模板照现在的做法重写**（A11）：`schemes/_template/` 从只有说明改成一套能构建、能过检查的占位：`scheme.json`、`CLAUDE.md`、`DESIGN.md`，tokens 五个文件（7 个颜色角色，明暗两套，APCA 都过），`marks/manifest.json`、`type/fonts.json`，`design-system/`（`system.json`、`tokens.config.json`、`README.md`、`bundle.css`、`Cover`）。第一次跑检查时深色的说明色和强调色对比度不够，调了两个占位色。`docs/architecture.md`「新方案最少要有什么」改写成「新方案怎么起」，`README.md`、`CLAUDE.md`、`schemes/README.md`、`tooling/README.md`、`docs/workflow.md` 跟着改。
- **Phase 5 的规矩和说明**：`CLAUDE.md`「第二条线」改成三家（再加一个新开的 Claude Code 会话，分支 `agent/claude/<任务>`、端口 4351），加了「不看别人的分支」；`design-loop` 跟着改。给三家的同一份说明 `canvases/v1-phase56-questionnaire/phase5-brief.md`：从验收问卷第 1 页读简报，交 `schemes/pith/` 和 `canvases/pith-explore/` 一页两张板。
- **Phase 6 的准备**：Vermilion、Peck 的 Design System 云端（`list_files`）和本地重新构建的逐个文件 sha256 一样（50、47 个文件）；Pomelo 的还停在 0.7.0，等 Pomelo 的会话换完图标按新版本发。
- **验收问卷** `canvases/v1-phase56-questionnaire/`：5 页（pith 的简报、开工、三家、收口、核对），`dw check` 过。
- **文档**：`ROADMAP.md` 的 Phase 4 移进 `history/v1-phase4.md`、Phase 0–4 一张表；这里 11-15 仓库自己的两段移进 `history/changelog-2026-11.md`，摘要表加到 Phase 4。
- **验证**：`npm test` 34 个全过（新加 `test/scheme.test.js`：在一份临时仓库里建方案、真的跑三步检查，名字被占、不合规矩都报错）；`dw-mcp.sh` 列出 24 个工具。

## 2026-11-15 · Pomelo v1.0 · Phase 6，接 atelier-sync（Pomelo 的会话）

- **Pomelo 的有板有眼**接了 `api` 5：左栏第五类 Checks（只有 bench 发了才列，点了框换到它的 `route`，`checks: true` 的 `route` 消息让它选中）；开着的画布读 `/api/review/<名字>`，画板后面照 bench 的叫法标待批、已批准、退回（改过的加「· 改过」，悬停看原因），跟着 `reviews` 消息变。在 Pomelo 的模拟页里框着真的 bench 看过：外框那页的板标「已批准 · 改过」。
- **Pomelo Explore**：`frame`、`marks`、`icons`、`motion`、`atlas`、`notes` 的 `gen.mjs` 新建页的默认名改成 `canvas.json` 里的 EX/R 名字（只在那一页不存在时用）；README 写上「界面里改过板名、删过板的页，重跑生成器前先写进生成器」。站主定的清理：删了冻结的 `p3-scheme/`，本机的 `archive/`（EX1–EX3 的旧生成器，不在 Git 里）进了废纸篓；`p2-final/` 留着，方案里 38 个动效零件、贴纸、手画零件和 `system.json` 写的出处都是它。精简了 Pomelo Explore 各页和 `schemes/pomelo/`（DESIGN、atlas、marks、motion）说明里只为留档的段落，DESIGN 补到 0.8.0（玩物有志、`link-pomelo`、贴纸个数）；`design-system/README.md` 会跟着发进 Design System，没动。`README.md` 方案表 Pomelo 那一行改成 0.8.0。
- **没跑** `npm run all`：方案的源和生成器只改了说明和默认页名，画板、资产没重新生成。

## 2026-11-15 · Pomelo v1.0 · Phase 5 联动和玩物有志，Pomelo `0.8.0`（Pomelo 的会话）

站主 11-15 在现用账号的云端画布「Pomelo · 联动和玩物有志」上批了设计（便签里「要你定」的照画的；贴纸挑 B 掌机），另外定了两处：「链接到这里的」「读后感」「观后感」统一叫「柚子链接」，选中的字也能链到 Pomelo 里的东西、颜色和普通链接分开。云端画布停在那一轮。

- **资产**：贴纸 B 搬进 `art.mjs` 的 `MODULE_ICONS.games`（「玩物有志」，樱粉，排在好奇看看后面），生成后 `approved`（248 个）；`sync.json` 加了 `marks/modules/games.svg`。
- **颜色**：新角色 `link-pomelo`「柚子链接」（链到 Pomelo 里的东西，和 `link` 分开）：五套配色的浅色都是 `#A85210`、深色都是 `#FFB870`，纸和卡面上 APCA 都过 60（浅色 73.8–76.4，深色 63.6–71.1）；`contrast.json` 加了这两对，`targets.json` 加 `--color-link-pomelo` / `--pm-link-pomelo`，Design System 的说明（`tokens.config.json`、`README.md`）写上它。`--module-games` 进 `targets.json`（樱粉）。
- **画布**：源从会话的临时目录并进 Pomelo Explore（`canvases/pomelo-explore/links/`：`gen.mjs` 用 `writePage` 写两页，`lib.mjs` 改走 `_lib/root.mjs`），页「EX6：跨模块联动」（15 张 `Links-*`）、「EX7：玩物有志」（5 张 `Games-*`，A、C 两个落选的贴纸留在 `lib.mjs` 里），排在 EX5 后面；两次生成逐字节一致。
- **验证**：`npm run build`、`npm run all` 全过（1509 项，对比度 540/540，watermark 50/50，Atlas 快照都对）。
- **同步**：站主打了 `pomelo-v0.8.0`（`95c97cd`），核对 tag 指向的提交、里面 `scheme.json` 是 `0.8.0`、方案和画布和工作区一致后同步进 Pomelo：`pomelo.css`、`tokens.ts`、`ds.css`、`handmade.js`（新颜色和 `--module-games`）、`marks/modules/games.svg`，`sync --check --tag` 一致。Design System 还没按 0.8.0 发。

## 2026-11-13 · Pomelo v1.0 · Phase 1 见字如面，Pomelo `0.7.0`（Pomelo 的会话）

站主 11-13 在云端画布「见字如面」上批了原型、导出设置和两种 PDF，贴纸挑 B 纸飞机；不再更新云端画布。

- **资产**：贴纸 B 搬进 `art.mjs` 的 `MODULE_ICONS.articles`（「见字如面」，薄荷，排在念念不忘后面），19 个新图标搬进 `icons.mjs`（第 3 批：标题、加粗、斜体、下划线、删除线、高亮、代码块、列表、编号、提示框、分隔线、互链、表格、公式、流程图、脚注、折叠、没标签、缩小），生成后都是 `approved`（247 个）。`--module-articles` 进 `targets.json`；`sync.json` 加了这 20 个文件。
- **有板有眼**的贴纸名字从「看画布」改过来：生成器挡住了（approved），核对过只差 `aria-label`、几何不变，临时改 `proposed` 生成再改回 `approved`，批准记录里写了这次。
- **画布** `canvases/pomelo-notes/`：`drafts.mjs` 只留没选上的 A、C 两个贴纸，图标和贴纸 B 改取方案里的，重新生成了（没发云端）。
- **Design System「Pomelo 柚儿园」**：上传 21 张（新的 20 张和改了名字的有板有眼），说明里的数目改成 21 个模块贴纸、168 个图标，发了 `1794541193-c5f1`。
- **同步**：站主打了 `pomelo-v0.7.0`（`d531cd3`），核对 tag 指向的提交、里面 `scheme.json` 是 `0.7.0`、方案和画布和工作区一致后同步进 Pomelo：新的 20 个文件、`canvas.svg`、`pomelo.css`（`--module-articles`），`sync --check --tag` 一致。
- **验证**：`npm run build` 到 `build:catalog` 之前都过；`build:catalog` 在 Peck 的菜单栏资产上报错（它们没有 `colorRole`，不是这次的改动，留给 Peck 的会话）；单独跑 `qa` 1487 项全过、`qa:watermark` 50/50、`check:atlas` 都对。

## 2026-11-15 · v1.0 · Phase 4 第二条线，仓库 0.13.0（等站主挑）

Codex、Argon 照同一份说明（`canvases/v1-phase34-questionnaire/phase4-brief.md`）各在自己的分支上画了一版「见字如面」格式条的 19 个图标，各出一份小问卷，站主照验收问卷让它们做、记了结果。本仓库的会话当天验收：

- **Git 规矩都守住了**：`agent/codex/format-icons` 两次提交（`58794c1`、`b28c553`）、`agent/argon/format-icons` 一次（`6e7bb6c`），都从 `79684cd` 开始，只动了各自的 `canvases/p4-<agent>-format-icons/`、`canvases/p4-<agent>-questionnaire/`；没推送（远端只有 main），main 没被动过。
- **冷启动**：两家都只照文档跑通 `npm ci`、构建、`npm test`（32 个过）。Argon 在 Antigravity 的沙箱里，`git`（worktree 的 `.git` 在工作区外面）、Chrome、本机端口都要放行：写进 `CLAUDE.md`「新会话接手」。Codex 提到 `npm ci` 报一条高危审计：`sharp` 0.35.3（libheif、librsvg），没动，见 `ROADMAP.md`。
- **MCP**：Codex 用仓库里的配置连上 `dw`。Argon 没连上：Antigravity 不读工作区根上的 `.agents/mcp_config.json`，只读全局配置和插件目录。照它内置的文档改成工作区插件 `.agents/plugins/dw/`（`plugin.json` 加 `mcp_config.json`，工作区插件默认开着），在插件目录里跑那条命令，`initialize` 正常、23 个工具都在；Antigravity 里还没连过。`CLAUDE.md`、`bench/README.md`、`design-loop`、`README.md` 跟着改。
- **三版并排**：临时画布 `canvases/p4-format-icons/`（站主定的：单开一块，挑完就删）。`gen.mjs` 用方案的同一个画法画两张对比板（19 行 × 三版放大 2 倍和原大；原大放进一条格式条，浅色、深色），生成时先核对 Claude 那 19 个和方案生成的 SVG 逐字节一样；两家的几何和四张原板从提交原样复制，Claude 那张是 Pomelo Explore「R7」原样。挂的 Design System 和两条分支上的逐字节一样。两次生成一致，`dw check` 7 张全过，截图看过。
- **评估**（在临时画布的 `README.md`）：三版放在一起是同一家。原大认图标，互链（`[[ ]]`）、分隔线（Argon 向外的箭头）另两家的更好认，脚注 Claude 的最像，Argon 的 x² 像乘方。Codex 照说明最严（字段能原样搬进方案）；Argon 的场景最完整，但字段改了名，斜体、流程图、缩小几处坐标和 Claude 那版几乎一样，像是读 `icons.mjs` 时看到了第 3 批：说明把「别看」写在它必须读的文件里，写说明的规矩补进 `CLAUDE.md`「第二条线」。建议 Claude 那版不用整套换，用不用哪几个站主定。
- **worktree**：站主让清，`git worktree remove` 清了两个（里面只剩缓存、截图、`node_modules`，提交过的都在分支上）；先停了 Codex 留在 4331 的 bench。两条分支留到站主挑完。
- **版本**：`package.json`、`package-lock.json` 升到 `0.13.0`。

## 2026-11-15 · v1.0 · Phase 2、3 验收和 Phase 3 Refine，仓库 0.12.0

站主 11-15 填完 Phase 2/3 验收问卷：Tweaks 记住、Checks 和「跑一遍」、有板有眼里批准和退回都试过没问题；连导一致、`npm run all` 全绿、只用 MCP 做完一块画布、Codex 连上都认；断网的两项没试。问卷里要的当天做完：

- **三家的 MCP 配置都进仓库**（站主定：都用项目级的，和 `.mcp.json` 一样进 Git）：新加 `.codex/config.toml`（`[mcp_servers.dw]`）和 `.agents/mcp_config.json`（Antigravity 的工作区配置，顶层 `mcpServers`）。都不写绝对路径：命令是 `/bin/sh -c 'exec "$(git rev-parse --show-toplevel)/bench/bin/dw-mcp.sh"'`，在哪个 worktree 打开就连那个 worktree 的 `dw`。实测：`codex mcp list` 在仓库根、子目录、一个临时 worktree 里都列出 `dw`（这台机器早就把本仓库设为信任，它的 worktree 跟着算）；没设信任的目录里项目配置不读，也试过；在临时 worktree 的子目录里照这条命令起服务，`initialize` 正常。Antigravity 没有能直接跑的命令行，没连，放进 Phase 4 验收问卷 Argon 那一页。`bench/README.md`「MCP」照新的写法重写（Codex 要信任、Antigravity 全局配置的新路径 `~/.gemini/config/mcp_config.json`）。用户目录里的配置都没改。
- **worktree 各开各的 bench**：MCP 的 `serve_start`、`serve_status`、`serve_stop`、`open` 认得出端口上开着的是别的仓库或 worktree 的 bench（`/api/status` 的 `canvasesDir` 不是自己的）：不当成自己的、不停它，说换个端口；`open` 加了 `port`。
- **Phase 4 的规矩和说明**：`CLAUDE.md` 新加「第二条线」（站主在问卷里批的：分支 `agent/<codex|argon>/<任务>`、一个 Agent 一个 worktree、只在自己的分支上提交，能用和不能用的 Git 命令，端口 Codex 4331、Argon 4341），`design-loop` 写了一句指过去。给两个 Agent 的同一份说明 `canvases/v1-phase34-questionnaire/phase4-brief.md`：格式条的 19 个图标，放临时画布 `p4-<agent>-format-icons`（站主用提问功能定的：单开一块，挑完就删）。
- **验收问卷** `canvases/v1-phase34-questionnaire/`：交给别的 Agent 的部分，站主照步骤让它们做、记结果（开工、Codex、Argon、核对 4 页），`dw check` 过。
- **Phase 1 留下的清理**（站主定：验收以后就做）：Vermilion Explore 删了只为留档的 `r3-assets-svg.tgz`、两张加载圆相的 GIF 和跑不了的 `gif.js`（`rebuild-blobs.mjs` 重做，233/233 张和云端一致）；Phase 1、Phase 2/3 两份验收问卷进了回收处（站主同意删）。Pomelo 的写进 Pomelo 的 `docs/atelier-sync.md`「6」（同时给第 2 节「在装好的 App 里试批准退回」打了勾，站主试过），Peck 的写在 `ROADMAP.md`。
- **文档精简**：`ROADMAP.md` 的 Phase 1–3 和用过的一次性授权原样移进 `history/v1-plan.md`，Phase 0–3 留一张表；这里 11-12～11-15 仓库自己的八段原样移进 `history/changelog-2026-11.md`，留一张摘要表；`CLAUDE.md`、`README.md`、`bench/README.md`、`canvases/README.md`、`docs/workflow.md`、`history/README.md` 跟着改。
- **验证**：`npm test` 32 个全过（新加：端口上是别处的 bench 时 MCP 不认它）。

## 2026-11-15 · v1.0 · Phase 3 MCP，仓库 0.12.0（等站主验收）

- **`dw mcp`**（`bench/src/mcp/server.js`，启动用 `bench/bin/dw-mcp.sh`：切到 `.nvmrc` 的 Node 再跑）：stdio 的 MCP 服务，只在本机，不加遥测，协议手写、没加依赖。23 个工具：`list`、`canvas`、`new_canvas`、`read_board`、`write_board`（顺带登记 `canvas.json`，`page` 写新 id 就新建一页；没分页的画布加第一页时原来的板留在自己那页）、`write_file`、`check`（`image` 为 true 时截图一起给回来）、`export`、`open`、`rename`、`delete`、`trash`、`ds_list`、`ds_install`、`db_get`、`db_set`、`review`、`review_propose`（Agent 只能标待批）、`serve_status`、`serve_start`、`serve_stop`、`checks`，其余命令行能做的走 `dw`（照 `dw <args>` 跑，`serve`、`mcp` 不行）。只读的标了 `readOnlyHint`，会删、会覆盖的标了 `destructiveHint`。stdout 只走协议，别的输出都改到 stderr。
- **配置**：仓库根目录的 `.mcp.json`（Claude Code）；Codex、Antigravity 的写法在 `bench/README.md`「MCP」，它们的配置没改。`design-loop` 写上「有 MCP 就用 MCP」，`CLAUDE.md`「画布与 bench」加了一条。
- **验收用的试跑**：一个只开了 dw 工具的 Claude（`claude -p --strict-mcp-config --tools ""`，Sonnet）照一句话新建画布、写一张三个色块的板、自检（第一次查出出框 8 像素，自己改到通过）、导出 PNG 和单文件 HTML，8 轮、0.09 美元，画布在会话的临时目录。Codex（`codex exec -c 'mcp_servers.dw.command=…'`，没改 `~/.codex/config.toml`）看到 23 个工具，调了 `list`、`canvas`；第一次因为它不问就不用会改东西的工具，加了只读标记以后通过。Antigravity 没有能直接跑的命令行，没连。
- **验证**：`npm test` 31 个全过（新加 `test/mcp.test.js`：真的起一个 `dw mcp` 进程，走完新建、写板、自检带截图、导出、存储、待批、改名、删除放回、地址、五类清单、`dw` 透传，stdout 每行都是 JSON-RPC）。

## 2026-11-15 · v1.0 · Phase 2 可信、顺手，仓库 0.11.0（等站主验收）

- **Vermilion 的 PNG 连导一致**（A4）：找到了原因：新开的 Chrome 里第一个页面，`setContent` 之后马上截图，视口最下面 87 像素（窗口顶上浏览器界面的高度，视口是模拟撑出来的那一截）有时还留着没画完的一帧，被换成了图最上面 87 行；`logo-mark@512-light.png` 是 `build:marks` 截的第一张，上面又有圆圈，所以每次差的都是它（差 6486 个像素）。改成截图前先等两帧（`tooling/lib/browser.mjs` 的 `nextFrames`，`render/marks.mjs` 用上）。验证：Vermilion 整条渲染连跑 10 次，359 个文件次次逐字节一样，9 张发布过的 PNG 都和 `published.json` 的记录一样（修之前 4 次有 2 次不一样）；只跑资产 20 次、每次新开浏览器，也都一样。已发的字节没变，不用改记录。经过写在 `tooling/README.md`「确定性」。
- **`npm run all` 全绿**（A5）：目录页在 Peck 上报错，是菜单栏的 6 个模板图 `colorMode` 写了 `currentColor` 却没写 `colorRole`。目录页改成没写角色时按正文色预览（`tooling/lib/common.mjs` 的 `markColorRole`），`schemes/peck/` 没动。`npm run all` 改由 `tooling/qa/all.mjs` 一步一步跑（和原来 `&&` 一样，前一步没过就停），每一步的结果、用时、最后几十行输出写进 `dist/qa/run.json`；`qa/check.mjs` 说的是某个文件的项带 `file`，水印检查写 `dist/qa/watermark.json`。11-15 跑了一遍：13 步全过（4 分 53 秒，动效 GIF 占 4 分 26 秒），三个方案的检查 0 没过、0 提醒（Peck 91、Pomelo 1186、Vermilion 210 项过了），水印 50/50，三个 Design System 的 index 都按上传记录写出来了。
- **Checks**（B4，站主在 Phase 1 问卷里定：菜单里再加一类）：bench 菜单的第五类，`#/qa/all`。每一步过没过、用时、点开看输出；按方案列出没过、提醒的检查项，说的是哪张图的有缩略图（`/_dist/` 只给 `dist/` 里的）；「跑一遍」在后台起 `tooling/qa/all.mjs`（bench 停了它照样跑完），跑的时候页面和菜单那一行每秒跟着变（SSE `checks`）；终端里跑的也跟得上。`/api/index` 多了第五个 section `checks`，`api` 升到 5。
- **Tweaks 记住上次的值**（B1）：记在浏览器的 `localStorage`（`dw.tweaks.<画布>`，每张板各记各的），刷新、下次打开还在；改过的板 Tweaks 按钮上有个点，「恢复默认」清掉；板后来不再声明的参数不再推给它。不写回文件。
- **断网也能看**（B2）：本机服务把画布运行时取的 React（jsDelivr）和 Google Fonts 都改走 `/_cdn/`，第一次取来存进 `bench/.cache/cdn/`（不进 Git），只取这三个主机、只 GET；React 这几个文件按运行时写的 sha384 核对，对不上不存；运行时文件一个字没改（页面里先放一句 `window.__resources`，是它自带的口子）。`dw offline` 一次取齐所有画布、问卷、Design System 要的（这次 94 个文件、7.9 MB）。Design System 页不再向 Google Fonts 要 Mac 自带的字体（Peck 的 Hiragino Sans GB 原来会得到 400）。
- **导出的单文件 HTML 断网能开**（站主在 Phase 1 问卷里要的）：React 经导出外壳的 `ext_resources` 打进文件；Google Fonts 的样式写进页面，只留这张板用到的字所在的分块，字体文件打进清单；取不到的列在 `offlineMissing`，打开时照旧联网。实测：Vermilion「第一轮总览 · 浅色」2.1 MB、Peck「App 图标 · 第三轮」5.0 MB（四张大图），在断网的 Chrome 里打开 React 和字体都在，只有画板模板里本来就有的 `{{src}}` 占位地址报 404（联网时也一样）。
- **在有板有眼里批准、退回**（B6）：bench 被别的源的页面框着（有板有眼就是这样）时批准、写原因退回都正常（新测试，Chrome）；批准状态变了给外面那一页发 `{ source: "dw", type: "reviews", name, reviews }`，`route` 消息多了 `checks`。装好的 Pomelo 里没试成（截不到它的窗口）；Pomelo 那边要接的（左栏第五类、给画板标状态、在 App 里试一次）写在 Pomelo 的 `docs/atelier-sync.md`。
- **验证**：`npm test` 全过（新加：断网缓存和导出打包、检查结果、框在别的源里批准退回）；内置浏览器里看过 Checks 页、Tweaks 改了刷新还在（按钮上有点、板照记下的参数显示）。

## 2026-11-14 · v1.0 · Phase 1 Refine，仓库 0.10.0

站主粗看了一遍所有画布后要的九条（这一步站主允许动 Pomelo 的画布，Pomelo 仓库没动）。

- **单张铺满能放大缩小**：顶栏 −、百分比（点了回到 100%）、+，⌘ / 触控板捏合加滚轮（在画板上面也行，以指着的地方为中心），`+` `−` `0` `1` 键；放大后上下左右都能滚；并排对比两边同一个倍数。Fill、Fit 照旧。
- **画板能改名、删除**：画板标题条上和单张铺满顶栏的「⋯」。改名只改 `canvas.json` 的标题；删除连它的批准记录进回收处，撤销后回到原来的页、原来的先后，`canvas.json` 和删之前逐字节一样（页已经删了就放到第一页）。`dw rename <画布> --board <文件> <标题>`、`dw delete <画布> --board <文件>`，接口 `board-rename`、`board-delete`，`api` 升到 4。
- **Design System、Motion Deck 能改名**（站主选的：只改 bench 里的名字）：菜单里它们后面的「⋯」，名字记在 `bench/names.json`，菜单、顶栏、`/api/index`（多一个 `schemeTitle`）都跟着变；方案的源、云端名字、`dw ds install` 记的名字不变；「回到原名」或清空就删掉这条。`dw rename --ds|--motion <方案> [<名字>]`、`POST /api/names/<ds|motion>/<方案>`。
- **页名统一成 EX/R**：照站主给 Peck Explore 改的样子（`EX1：…`、`R1：…`），用 `dw rename --page` 改了 Vermilion Explore 4 页、Pomelo Explore 12 页，规矩写进 `canvases/README.md`、`CLAUDE.md`、`ROADMAP.md`，三块画布 README 里的页名跟着改。生成器里新建页时用的默认名还是旧的（只在那一页不存在时用，下次清理生成器时一起处理）。
- **Peck Explore 补图**：`S1b-Icon`、`S1c-Icon` 缺的现在的图标原图、A1、A2 三张 PNG（云端工具读不了），从云端画布那张板的「HTML (.zip)」下载里取出来，sha256 和云端 `list_assets` 一致，放进 `canvases/peck-explore/blobs/`。两张板 `dw check` 通过，截图里图都在。
- **本地 Design System**：分节名改英文，和云端一样（Overview、Colors、Typography、Spacing、Corner radius、Shadows、Width、Text、Leading、Size、Step、Components、Assets、Files）；Colors 照云端分组（Palette、surface、soft、accent……）；Files 连资产一起数，Vermilion 是 165，和云端一样。
- **资产数不一样是正常的**：云端「assets」文件夹 118 = 115 张图 + 3 个 `README.md`；本地「资产」只数图（115），三个 `README.md` 在「文件」里。两边总数都是 165；云端的 `manifest.json` 是它自己生成的，本地对应 `design-system.json`。
- **验证**：`npm test` 27 个全过（新加：画板改名删除放回、bench 里的名字、颜色分组，HTTP 测试加了画板和名字）；在内置浏览器里看过：单张铺满点 +、⌘ 滚轮（画板里外）、`0`、`1`、`-`；在一块临时画布上点过画板改名、单张铺满里删除再撤销（`canvas.json` 的 sha256 和删之前一样，回收处空），Design System 改名再回到原名（`bench/names.json` 没留下）；Motion Deck 用命令行改名再改回。临时画布用完删了。

## 2026-11-13 · v1.0 · Phase 1 补充：画布和页的改名、删除，仓库 0.10.0

站主要的：画布和画布里的页都能改名、删除，同步到 Pomelo 的「有板有眼」（这一步照站主的话改了 Pomelo）。

- **核心** `bench/src/canvas/manage.js`：画布（Explore Deck、问卷页）改名改标题（`cloud.json`、`canvas.json`），目录名和地址不变；删整块画布是把目录挪进回收处 `canvases/.trash/<id>/`（不进 Git）。页改名改 `canvas.json` 的页名；删页连它的画板（文件进回收处）、便签、画板的批准记录一起拿走，打开时落在的页跟着挪，只剩一页时不让删。回收处的每一样都能原样放回：页回到原来的位置，画板顺序、便签、批准记录都回来；名字被占了就说放不回。改页之前存本地版本（「改名前」「删页前」）。
- **接口**（`api` 3）：`POST /api/canvases/<名字>/rename|delete|page-rename|page-delete`、`GET /api/trash`、`POST /api/trash/restore`。会改东西的请求只认本机这个服务的名字（`Host`、`Origin` 都查），别的网站和把域名指到 127.0.0.1 的都挡掉。命令行 `dw rename`、`dw delete`、`dw trash [restore|empty --yes]`。
- **画布界面**：菜单里每块 Explore Deck、每份问卷、页菜单里每一页后面的「⋯」→ 改名…、删除…；改名是一个小对话框（回车就是改名，中文输入法选字时不算），删除先问一句，提示条上「撤销」10 秒；看旧版本时没有这些。改了以后、文件被别处改了，都给外面那一页发 `changed`；在看的那块被别处删了就换到第一块。
- **生成器不盖掉站主起的名字**：`pomelo-explore/page.mjs` 和 Peck 的步骤生成器只在一页还没有时给它起名；Atlas 那一页的名字去掉了会过时的版本号。验证：Peck 的 `s2d` 在一份改过页名的 `canvas.json` 上重跑，名字留着、板逐字节一样；Atlas 重跑，板一样。
- **有板有眼**（Pomelo）：`canvas_rename`、`canvas_delete`、`canvas_restore` 三个命令（`canvas.rs`，向 bench 发 JSON，它不肯时照它的话说，旧的服务说「停止再启动」）；左栏的 Explore Deck、问卷、页右键或行尾「⋯」改名、删除，左栏顶上一条「撤销」；bench 发来 `changed` 就重新读清单；`?mock` 里也能试。`http()` 改成头和正文一次写出。
- **验证**：`npm test` 24 个全过（新加：改名删除放回的全过程、HTTP 和挡别处的请求）；在一份临时的画布副本上用内置浏览器点过改名（回车）、删页撤销、删问卷撤销，控制台没有报错；Pomelo `cargo test canvas::` 3 个过、`real_canvas_bench` 过、`tsc --noEmit` 过、`hooks-lint`、`ui-lint`（/canvas）0 处，`?mock` 里点过改名、删页撤销、删画布，截图看过对话框和撤销条。正式版没装。

## 2026-11-13 · v1.0 · Phase 1 补充，仓库 0.10.0（等站主验收）

站主看了 Phase 1 的结果加的一轮（验收问卷还没填）。这一步站主允许本仓库的会话改 Pomelo 和 Peck 的画布。

- **bench 分四类**：顶栏菜单按 Design System、Motion Deck（原「动效台」）、Explore Deck、Questionnaire 排（`src/server/catalog.js`），`dw list` 也这样列；新接口 `GET /api/index` 给别的程序同样的四类，`api` 升到 2；`listCanvases` 多一个 `deck`。
- **不卡**：Pomelo 的「有板有眼」在 WKWebView 里，画布界面和 Pomelo 共用主线程。画布上的板改成按离视野中心的远近排队载入，一次两张；载完 1.5 秒后，看不见的、屏幕上窄于 360 像素的板定格（新的 `src/board/embed.js`：CSS 动画、SVG 动画、Web Animations、`requestAnimationFrame` 都停，放开接着动），指着、选中、PLAY、开着 Tweaks 的照常动；单张铺满、看 Design System 或 Motion Deck 时画布上的板全定格。只有画布上的板带它（`?va-embed=1`），导出、自检、单张打开都是原样。无头 Chrome 里量：动效那页 7 张板全动时主线程每秒忙 262 毫秒、Phase 2 那页 147 毫秒，定格后都是 0。旧的服务配新的界面时退回用 iframe 自己的 load 事件，不会卡住。
- **每个方案一块 Explore Deck**（规矩写进 `canvases/README.md`「Explore Deck 的规矩」，`CLAUDE.md`「画布与 bench」第 9 条）。改之前每块都 `dw snapshot` 存了 `before-rename`。
  - **Pomelo Explore** 12 页 67 张：`pomelo-atlas`、`pomelo-notes` 并进来（生成器搬进 `atlas/`、`notes/`，板加 `Atlas-`、`Notes-` 前缀，用 `page.mjs` 写；两块的本机版本历史挪到 `scratch/retired-canvases/`）；本机 `archive/` 的三份旧生成器在临时目录重跑，放回 Phase 1 两轮、Phase 2 第一轮成探索 1–3（19 张）；Phase 3 方案改叫探索 4（`P3-*` → `X4-*`，批准记录跟着改名）；删了优化的旧轮次「Phase 2 · 最终设计」8 张和 `P3-Desk`；`p2-final/`、`p3-scheme/` 冻结（生成器一跑就停，`lint.mjs` 删了）；`page.mjs` 改成按页删板，几页能共用一个前缀；见字如面的说明便签挪到板的右边（原来盖住第一张板的名字条）。
  - **Vermilion Explore** 4 页 16 张：四轮都是探索，一张不删，分页、改名 `X1-`～`X4-`。
  - **Peck Explore** 8 页 47 张：外框小样只留第四轮，加一页「只在前两轮画过的」（流程一览、外框解剖、四张迁移测试）；删了被第四轮替掉的 8 张；`s2`、`s2b`、`s2c` 的生成器冻结；其余生成器改成页原地换名、不挪先后（`s1c`、`s2d` 重跑，板和 `peck-rules.md` 逐字节一样）。
- **问卷模板用 Vermilion 朱红**：暖纸的底、衬线标题、页码是一条漫游路径（时间线的空心圆，当前那页圆心变朱红）、题是一张张卡、说明是纸片；青绿管结构和「建议」，朱红只在悬停、选中、焦点和「未答」时出现。颜色、间距、字体是 Vermilion 的 tokens，由新的 `template/vermilion.mjs` 从构建好的 Design System 写进页面（`--check` 只看）。新加的两个颜色配对过 APCA（正文 / 浅青底 83、88；页面色 / 深青 79、69）。题型、存储、核对页的代码没动。
- **验收问卷**换成新模板，题目照这一轮重写（7 页：Bench、Explore Deck、有板有眼、Design System、Phase 2、模板、核对）；站主答过的 D1–D3 还在，`db.json` 没动过。
- **Pomelo「有板有眼」**（Pomelo 仓库）：`canvas_list` 改成四类（读 `/api/index`，旧的服务退回 `/api/canvases`）；左栏四类各能收起（设置 `canvas.closed`），开着的 Explore Deck 按页收起，默认只展开正在看的那页；右边换到 Design System、Motion Deck 时左栏跟着。`cargo test canvas::` 3 个过、`tsc --noEmit` 过、`hooks-lint`、`ui-lint`（/canvas）0 处。正式版没装（工作区里有 Pomelo 会话没做完的改动）。
- **文档**：`bench/README.md`、`canvases/README.md`、三块画布和问卷的 README、`questionnaire`、`design-loop` 两个 Skill、`CLAUDE.md`、`ROADMAP.md`、Pomelo 的需求、架构、测试文档；「动效台」都改叫 Motion Deck。
- **验证**：`npm test` 22 个全过（新加：四类和 `embed.js` 的注入、无头 Chrome 里定格和放开）；`dw check` Pomelo Explore 67 张、Vermilion Explore 16 张全过，Peck Explore 47 张里两张是早就知道的缺图（`S1b-Icon`、`S1c-Icon`，第 1 步的三张位图读不回）；问卷页 `dw check` 过，模板在本地点过、`dw db` 读回、测试答案删了。

## 2026-11-12 · v1.0 · Phase 1 清理，仓库 0.10.0（等站主验收）

- **画布清单**（站主用提问功能逐块定）：`canvases/` 从 16 块剩 4 块加一份验收问卷。
  - 留：Vermilion Explore、Pomelo Explore、Pomelo Atlas、Peck Explore。
  - 并进 Pomelo Explore：`pomelo-marks`、`-icons`、`-motion`、`-frame` 各成一页（图形、界面小图标、动效与空状态、外框）。生成器搬进同名目录，共用新的 `page.mjs`（只写自己那一页、只删自己前缀的板），`p2-final/`、`p3-scheme/` 也改成原地换自己那页；27 张板加了页名前缀，和原来逐字节一致，27 条批准记录搬进它的 `db.json`（备注写着从哪来），挂上 Pomelo 柚儿园。`dw check pomelo-explore` 40 张板和两个自带检查全过。Pomelo 的 `DESIGN.md` 里指向旧画布的三处改指过去。
  - 删：`vermilion-improve-questionnaire`、`vl2-phase4-questionnaire`、`repo-merge-questionnaire`、`peck-refactor-questionnaire`、`peck-harness-questionnaire`（连 Peck 会话没提交的结论和答案，站主选的「现在就删」，结论 Peck 仓库里有）、`workbench-roundtrip`、`pomelo-todo-card`、`pomelo-pages`（七张板一直待批）。删掉的和并掉的原目录都挪进了 `scratch/`（本机的版本历史、截图也在），跟踪的文件在 Git 历史里。指向它们的文档都改了。
- **通用问卷模板** `skills/questionnaire/template/survey.html`（底子是 `vl2-phase4-questionnaire` 和两份计划问卷，三份是同一套代码）：只改开头「改这里」的题目数据；单选、限数的多选、矩阵（每行选一个，可分块）、文字；「建议」和「没选的都按建议填」（核对页能一次填完全卷）；每页的补充；自动加的核对页（按页列、没选的标红、能「去改」）；`connectDb()` 等云端存储；「复制答案」一直都在；手机宽度、明暗。`questionnaire` Skill 照它重写。验证：本地 `dw serve` 里走了一遍（连上存储、按建议填、多选上限挡住第三个、核对、提交、`dw db` 读回、375 宽没有横向滚动），测试答案删了。
- **验收问卷** `canvases/v1-phase1-questionnaire/`：模板做的第一份，5 页（画布、三个 Design System、Phase 2 的两个小决定、模板本身、核对），`dw check` 通过。
- **三个 Design System 在现用账号都是最新的**：
  - **Pomelo 柚儿园**（这一次由本仓库的会话发）：发了 `0.6.3`（`1794485413-dade`）。样式带上 `0.4.2` 以后的纸纹、滚动条、`chat-pop` 等动效零件、便签的墨色；资产加三组：Stickers（32 个通用贴纸加设置、日历）、Empty（8 张空状态插图）、Icons（149 个界面小图标），共 191 张，各组有说明；Icon、Sticker 和总说明里「正式的一套还没有」改成指向 Assets。上传记录按每张的源文件 sha256 对上；发完 `list_assets` 逐张核对 id、大小、源 sha256，223 张全对；11 个文件回读 sha256 一致。`check:ds` 22 个预览明暗都没问题。
  - **Vermilion 朱红**：站主复制的那份改回原名，`published.json` 顶层换成它（旧账号那份挪进 `copies`）。复制时图片 id 和图片本身都带过来了（页面上看过，图都在），所以没重传；发了 11-07 改的说明、ButtonLink 和第一份 `tokens.css`，4 个文件回读一致。
  - **Peck**：本地构建的 47 个文件和云端逐个一致，不用发。
  - **Vermilion Explore**：站主复制的那份改回原名，18 个文件和本地逐个 sha256 一致，`dw target … --same-ids` 登记成 home；旧账号那份的账号名改成「旧账号」。
- **验证**：`npm test` 20 个全过；改过的文档里的路径和小节引用都对得上。

## 2026-11-12 · v1.0 · Phase 0 文档整理（站主 11-12 验收）

只动文档（外加 `dw new` 生成的 README 里一个过期的小节名），版本不变。

- **新建根目录 `history/`**（站主定）：放仓库层面的归档，`README.md` 是全部历史的索引。CHANGELOG 里 11-02～11-11 的逐条记录原样移进 `history/changelog-2026-11.md`，这里只留摘要表（264 行 → 66 行）；`bench/history/vw1-plan.md` 移进来，开头那句去向改对了。
- **同一件事只写一处**：第一次用的步骤只在 `README.md`「第一次用」（`bench/README.md`、`tooling/README.md` 指过去）；`ROADMAP.md` 的决定里删掉 `CLAUDE.md` 已经写了的几条；`docs/workflow.md` 删掉过期的「用另一个账号接着做」，问卷、两条线改成指向 Skill 和 `CLAUDE.md`；`docs/architecture.md` 删掉旧两个仓库的说法和重复的「工具与 Skill」。
- **改掉过期的**：`ROADMAP.md` 里网站的「可编辑」总授权（以 `CLAUDE.md` 的默认只读为准，用过的两次授权都已提交）；`canvases/README.md` 写「有云端的都是旧账号建的」（其实有 4 块在现用账号），按账号重排；`schemes/README.md` 去掉会过期的状态列；`tooling/README.md` 里「Pomelo 现在没有资产」和 Vermilion 的账号说明；`docs/cloud.md` 的现用账号清单；`design-loop` 和 `dw new` 的 README 模板里不存在的小节「换账号」改成「账号」；`skill-evolver` 里 `dw` 的路径；`docs/licensing.md`、`docs/adoption.md`、Vermilion 的 `DESIGN.md` 里「VL2 的 Pomelo 方案」这类旧说法。
- **验证**：改过的文档里写全的仓库路径都存在，`文件`「小节」的引用都对得上标题；Pomelo、Peck 仓库里没有指向被改名或删掉的小节；`npm test` 20 个全过。

## 2026-11-12 · 计划分开，仓库 0.9.0

站主 11-12 定：Dawn Plan 到 Phase 10 为止，两边的计划分开。两份计划问卷（现用账号的云端，没建本地画布）站主填完，答案写成两边各自的计划。

- **Dawn Plan 归档**：`ROADMAP.md` 里的过程原样移进 `schemes/pomelo/history/dawn-plan.md`（连同只关 Pomelo 方案的几条决定）；`ROADMAP.md` 只剩现在、到 v1.0 的六个 Phase、限制、长期的决定和授权。
- **仓库有了自己的版本号**：`package.json` 记 `0.9.0`，每个 Phase 做完升一位，tag 叫 `atelier-v<版本>`。
- **几个会话怎么分**：`CLAUDE.md` 新加一节，本仓库、Pomelo、Peck 三个会话各自能动哪些文件；Pomelo 方案的发版、发布、同步归 Pomelo 的会话。`README.md`、`docs/adoption.md`、`schemes/pomelo/CLAUDE.md`、`schemes/peck/CLAUDE.md` 里 Dawn Plan 的说法跟着改。

## 2026-11-11 · Tabloid 1.0.3（Pomelo 方案 0.6.3）、问卷连云端存储，Dawn Plan · Phase 11

站主当晚在 App 里看完提的（Atlas Refine 2），加上别的会话用 visual-atelier 时发现的问卷问题。版本号照小修走。

- **落签和图标隔一点**：小报下面一排按钮的纸签，线的起点在按钮画的圈下面 3 像素（1.0.2 贴着，站主嫌丑）；按钮自己有底色时从底色下面算。走一遍的板里量了四个按钮：2.9 像素。
- **整封信按 Markdown 排**：终章「读整封信」里 `## 小标题`、加粗、列表、`>` 引用、分隔线都排出来（`runtime.mjs` 的 `mdHtml`，先整段转义再认记号，链接只留字）；样例的信改成真的写法。
- **留下的日子往上提**：格子从 122 提到 106、一行 19 像素，图例、纸条、柚子的话跟着上去；最下面那句离纸边从 14 像素左右变成 50 像素左右。
- 冻结 `atlas/releases/tabloid-1.0.3/`，替掉 1.0.2（`--freeze` 自己删的）；`sync.json` 换成 1.0.3 的两行；审看画布重新生成，`dw check pomelo-atlas` 5 张全过，`check:atlas` 过。站主打了 `pomelo-v0.6.3`，同步进 Pomelo：235 个文件，写入 5 个，删掉 1.0.2 的 2 个；上一轮加的「收掉空文件夹」第一次在真的同步里用上，`atlas/tabloid-1.0.2/` 没留空壳；`sync --check` 一致。
- **问卷连云端存储**：Peck v0.4 验收页发到云端后页头一直是「答案只存在这台设备上」，站主填的只留在了浏览器里。云端的运行时放上 `window.claude` 比页面脚本晚，模板一开场就判断，落空以后不再连。模板 `canvases/vl2-phase4-questionnaire/survey.html` 改用 `connectDb()`（每 100ms 看一次，最多等 10 秒；源码照字面留着 `window.claude.use(`，本地 `dw serve` 认这几个字才注入），`skills/questionnaire/SKILL.md` 第 2 步写上这两条。验证：`dw check` 过；`dw serve` 里页头「已连接 · 答案自动保存」，点一题 `dw db` 读得到；另在一个新的框里让存储晚 1.5 秒才出现，页面等到了、连上、写了一次。测之前备份的 `db.json` 已还原（sha256 一样），浏览器里留下的那份也清了。

## 2026-11-11 · Tabloid 1.0.2（Pomelo 方案 0.6.2），Dawn Plan · Phase 11

站主在 App 里看完 Atlas 提的：封面要体现 Tabloid 的样子、哪些算定稿、序章星图加粉星；另有一条全局的落签（这边只动小报里的，Pomelo 的在它那边）。版本号站主定的。

- **封面由设计自己画**（`atlas/tabloid/cover.mjs`，快照多导出一个 `cover({ year, until })`）：小报头版缩小的样子，报头和两道线、年份、柚黄的一笔、三颗纸星星、柚子、顶上一条胶带，左下的小框印着「Tabloid 1.0.2」；没过完的年盖红章「截至某日」。直接摆在 Pomelo 的页上，只用行内样式和 Design System 的变量，每张里的 id 各换一个编号。
- **序章的粉星**：模型在序章挑的几条（这一年触动你的记录）那一天画成粉星，和最亮的五天（金星）按日子连成星座；两样都是的那天粉星外面一圈金色；图例多「触动你的几天」；点粉星弹出那一条。以前的数据没挑，就只有金星。
- **小报里的落签**：下面一排按钮的纸签，线从按钮手画的圈上垂下来（量按钮里画的线在正中最低到哪；以前离框 4 像素）。
- **哪些算定稿**（站主定）：只升最后一位的小修替掉同一条线里旧的那份，升了前两位的两份都留。`tooling/atlas/build.mjs` 的 `--freeze` 冻结小修版时删掉同一条线里旧的，`--check` 一条线有两份就报。冻结 1.0.2 时删掉了 1.0.0、1.0.1 的快照，`sync.json` 只剩 1.0.2 的两行。
- **同步收掉空文件夹**：`tooling/sync/sync.mjs` 删完旧文件后，空下来的文件夹（比如换掉的 `atlas/tabloid-1.0.1/`）也删掉，只删目标目录里真空的。`pomelo-v0.6.2` 同步时还没有这一条，那两个空文件夹是手删的。
- 审看画布 `canvases/pomelo-atlas/`：`Module` 板照 Pomelo 现在的 Atlas 页重画（封面是设计画的、样式、两张便签写规则），样例数据的序章挑了四条；`dw check` 5 张全过，`check:atlas` 过；走一遍的板里点粉星弹出那一条、按钮的纸签线贴着圈（内置浏览器里量的）。

## 2026-11-11 · Tabloid 1.0.1、图标「时间穿梭」（Pomelo 方案 0.6.1）

站主在 App 里看完 Atlas 提的一轮优化里，要回这边做的两样。

- **Tabloid 1.0.1**：聊天页「感情」的泡泡（一颗心）里的字偏上、顶着心口的尖，挪到心的正中（`atlas/tabloid/bubbles.mjs`，字的偏移从 −0.2R 改成 −0.03R）。用真实的一年测的时候又发现两处，一起修了：印在页上的笔记不带开头的标签和 Markdown 的记号（点开的纸条里还是原文）；钱那一页平均每天不到一块时不写「平均每天 ¥0」。版本号站主定的；冻结成 `atlas/releases/tabloid-1.0.1/`，1.0.0 的快照不动。站主定：照 1.0.0 做的那几份照旧用 1.0.0 画。
- **界面小图标「时间穿梭」**（`marks/icons/time-travel.svg`，第 149 个）：一只钟，两边各一段绕着它的斜轨道，右边那段带箭头。Atlas 里每一年的封面下面用它，点了进这一年做过的每一份。
- 审看画布 `canvases/pomelo-atlas/`、`canvases/pomelo-icons/` 重新生成，`dw check` 过。
- Pomelo 那边的 Atlas 页、真模型测试见 Pomelo 的 `docs/roadmap.md`。

## 2026-11-10 · Atlas 定稿 Tabloid 1.0.0（Pomelo 方案 0.6.0），Dawn Plan · Phase 9

站主验收了 Atlas 的探索，说优化完就作为第一轮定稿；今年不做音乐；每次定稿要有名字、版本号和快照，每次运行要留历史。名字和版本号站主用提问功能定的：**Tabloid v1.0.0**。

- **设计进了方案**：`schemes/pomelo/atlas/tabloid/`。以前画布里写死假数据的页面，改成照一份「呈现结果」画（Pomelo 存的那份数字和记录的快照 + 模型写的话）：没有的幕不出现，一幕里缺的那一块不画。数据的样子、快照怎么用写在 `schemes/pomelo/atlas/README.md`。
- **快照**：`tooling/atlas/build.mjs` 把设计打成一个文件（连同画好的柚子、贴纸、信封和冻结那天的 Design System 样式、上墨脚本），`--freeze` 冻结成 `atlas/releases/tabloid-1.0.0/`（545 KB），`--check` 核对没被改过。快照不改；`sync.json` 把每一份同步到 Pomelo，旧的年度总结一直照它那一版画。`npm run build`、`npm run all` 里加了这两步。
- **聊天页的泡泡**：模型不挑泡泡，只把话题归到固定的 12 个类别（认不出来是「别的」），次数由程序数；设计给每个类别一个专属泡泡（做饭、求职、代码、旅行、宠物、睡眠，新画了感情、钱、学习、身体、心情、家人朋友），另有 6 个通用的（圆泡、方泡、水滴、票根、云朵、悄悄话）给「别的」和重复的类别，一页里不重样。
- **去掉音乐**的开关和样子；封面「截至某日」的章挪到年份的右上，不再压住数字；终章多一个「读整封信」。
- **审看画布** `canvases/pomelo-atlas/` 改成从方案的源生成，五张板（多一张「泡泡」），`dw check` 全过；发到云端。
- **小彩蛋「撕起柚子贴纸」**：印子里那句「今天也辛苦啦」往左挪了一点，对着柚子的身子居中（印子歪 8°，身子在盒子的偏左处）。
- Pomelo 那边的 Atlas 模块、历史、补做、首页的信封见 Pomelo 的 `docs/roadmap.md`。

## 2026-11-10 · Peck 方案 0.1.0 导入（Peck 的 Phase 2 收尾）

Peck 的视觉探索在现用账号的云端画布 Peck Explore 上做完四步，站主认了 Design System「Peck」，说菜单栏模板图换成新的、开始收尾。

- **方案 `schemes/peck/`**（`0.1.0`，`approved`）：点阵终端 × 深海，青色 `#00E5FF` 是全屏唯一发光的颜色。全部文件由画布的第 4 步生成器出，和画布里的 `project/scheme/` 是同一份；另加方案的 `CLAUDE.md`、外框规则 `peck-rules.md`（66 条）、`sync.json`、两个 OFL 字体（缝合像素 12、Departure Mono，带许可原文，sha256 和云端附件一致）。资产 12 个全 approved：App 图标 J2 五个尺寸、A3（位图，`marks/raster/`）、菜单栏模板图六个——菜单栏这次换成 14 格的鸟（和 16 像素 App 图标同一只，一格 1pt），云端 Design System 跟着重传、重发。`npm run qa -- --scheme peck` 91 项全过。
- **画布 `canvases/peck-explore/`**：从云端拉回 71 个源文件（逐个 sha256 一致），其余画板在本地用生成器重新生成，和云端逐字节一致；改完发回，191 个文件 `dw verify` 全对。第 1 步的三张位图（现在的图标原图、A1、A2）云端读不回，本地预览那两页缺图，云端照常。
- **build:ds 补了四件**（站主同意碰 `tooling/`）：`tokens.config.json` 写了 `themes` 就按它排第一主题；`fonts` 打包字体文件（源在方案的 `type/<file>`）并在 tokens.css 末尾写 @font-face；`scaleGroups` 把 scale.json 里额外的组出成 token；没有圆角不出空的 radius。check:ds 认得随包的字体。改之前和改之后 Pomelo、Vermilion 构建出的 Design System 逐字节一致；Peck 用它构建出的 47 个文件和云端 Design System 一致（索引只差云端页面重存时的键顺序）。
- **sync 认得方案自己的文件**：顶层说明（`DESIGN.md`、规则）、`type/` 下的字体、Design System 的产物，跟着 `scheme.json` 的状态。Pomelo 按 `pomelo-v0.5.1` 核对一致；Peck 在临时仓库里打临时 tag 走过一遍 `--dry-run`，62 个文件。`npm test` 20 个全过。
- 许可登记了 Peck 的四个字体（`docs/licensing.md`），消费方表加了 Peck（`docs/adoption.md`）。**还没做**：站主打 tag `peck-v0.1.0` 以后同步进 Peck。

## 2026-11-10 · Atlas 第一轮优化，Pomelo 第二轮优化（Phase 9）

站主验收了 Phase 9 开工前的那一轮，又提了 Atlas 的 5 条和 Pomelo 的 6 条。

- **Atlas 探索画布第一轮优化**（`canvases/pomelo-atlas/`，云端版本 `1794288006-a43a`，9 个文件和本地逐个 sha256 一致）：封面的胶带挪到纸角，柚子的脸露出来；弹出的原记录换成纸条，打开时纸卷落下往下滚开（0.76 秒）、合上时往上卷起收走（0.56 秒）；字糊是停着的小报还在 3D 状态（透视和背面隐藏），改成只在翻页那 0.8 秒是 3D；「钱」页空白是会画出来的那几样被 0 高的盒子裁掉，同样修好了星座连线、回声箭头、跳石虚线；「收进抽屉」是小报合上、抽屉拉出来、落进去、推回去（1.76 秒）。减弱动效下都直接出现、消失。`dw check` 四张全过，逐帧截图自检过；**没目视的**：纸条和抽屉的手感、翻页节奏，等站主在画布上点 Play 看。
- **Pomelo 的 6 条**都改在 Pomelo 的代码里，方案版本不变，11-10 15:00 装进正式版（细节在 Pomelo 的 `docs/roadmap.md`）：白屏是页面没有出错兜底，一处出错整个窗口卸掉，现在每页和每个浮层各自兜底、能复制错误；念念不忘的标签是墨字加荧光笔；Pub2MD 有了设置页和能改的使用说明；分段的框不再被挤得比字窄；导入账单等白板和一批直线框换成手画的；手画的边不再画在会滚的盒子里、不再被行的白底盖住。新写的界面检查（Pomelo `scripts/ui-lint.mjs`）在柚黄浅色、薄荷深色下清零。

## 2026-11-10 · Phase 9 开工前的一轮优化，Atlas 第一轮探索上云端

站主在 App 里看完提了 8 条优化，说做完直接开始 Phase 9 第一轮，Atlas 的效果探索先放云端画布。

- **Pomelo 的 8 条优化**（都在 Pomelo 的代码里，11-10 装进正式版）：今日简报的字不被滚动条盖住；首页便签上的标签看得清；关掉贴纸簿后顶栏不再被挤上去（这一条没能在真实窗口里验证，等站主点）；呦呦漫游的关于我、职业能右键插网站图标（网站的两个 about 页也跟着认图标，站主授权的两个文件）；找东西的后几行不再被切掉、列表能滚；勾完成的果冻弹放得出来；模块「看画布」改名「有板有眼」。
- **Pomelo 方案 `0.5.1`**（站主打了 `pomelo-v0.5.1`，核对过 tag 再同步进 Pomelo；`npm run all` 1354 项全过）：新动效零件 `chat-pop`（站主 11-10 批准）：问柚子的小窗从顶栏的柚子那里长出来（0.42 秒），收起缩回去（0.2 秒）；逐帧总览看过，明暗各 41 帧。Design System 加了「便签上的字跟便签的墨色走」一条（APCA：墨 Lc 87，次要的字 Lc 69）。
- **Atlas 年度小报的探索画布** `canvases/pomelo-atlas/`：四张板（走一遍、全部 15 页、模块页、桌上的两样和节拍表），十一幕都有初稿。`dw check` 四张全过；用无头浏览器把小报从头走了一遍，明暗各截了 12 张看过（拆信封、翻页、目录跳转、弹出原记录、封底）；发到现用账号的云端 https://claude.ai/artifact/RNfxkLga1kUDvJMm4TPRYY ，9 个文件和本地逐个 sha256 一致。**没目视的**：自动翻的节奏、翻页和各幕出场的手感（预览面板藏着时动画不走），等站主在画布上点 Play 看。

## 2026-11-09 · Pomelo 第一轮视觉优化和 Dawn Plan · Phase 8 在 Pomelo 里看画布（装进正式版，等站主在 App 里验收）

站主在 App 里看完 Phase 7 提了 11 条优化，说做完直接做 Phase 8、升级测试、装正式版。方案没有新资产，版本还是 `0.5.0`，不用打 tag、不用同步。

- **bench 给别的程序的接口**（`bench/README.md`「给别的程序用」）：`dw serve --json`（启动好了打一行 `{"ready":true,…}`；端口上已经有一个时说明并退出，以前会一直挂着）、`dw status`、`dw stop`、`dw open <画布名> [--page] [--board]`（只给地址，不开浏览器）；服务上 `GET /api/status`（`app: visual-atelier-bench`、`api: 1`、进程号、仓库位置、几块画布、能不能停）、`POST /api/stop`（要 JSON，只有 `dw serve` 启动的能停）。画布界面放进别人的页面（frame）时，每换一次画布、页、画板给外面发一条消息（`{ source: "dw", type: "route", … }`）。
- **Pomelo 的「看画布」模块**（Dawn Plan · Phase 8）：兴趣一类，贴纸是 Phase 3 画的那张。「启动」后左边列画布，点开的那块下面列画板（分页的按页分），右边就是画布界面；点左边右边跟着换，右边换了左边跟着；「停止」停掉服务；别处已经开着的服务直接用；退出 Pomelo 时它启动的那个跟着停。Pomelo 不存画布，只记文件夹位置。
- **Pomelo 的 11 条优化**：一个图标库（全部 148 个界面小图标，分组；念念不忘的标签、一步一步的分组和目标都从这里挑，去掉「其他 emoji」）；写字的框里右键弹出柚儿园样子的一条纸（常用格式、柚儿园图标、网站图标：前者直接画在字里，后者写进 `:名字:` 只有网站显示）；一步一步左边一列换成典型页「列表型」的样子，去掉「分组」两个字（只有一种东西的列表都不写小标题）；柚子的项目是一个牛皮纸文件夹，点它就打开或合上；首页念念不忘的便签字多了能上下滚；落签挂在最上面一层不被纸边挡住；呦呦漫游正文上面的「图标」按钮去掉。细节在 Pomelo 的 `docs/roadmap.md`、`requirements.md`「图标库、写字的框」「看画布」。
- **验证**：`npm test` 20 个全过（新加的一项：status 认得出自己、不是 `dw serve` 启动的停不了、非 JSON 的停止请求被拒、地址怎么拼）；命令行走过一遍（启动、再启动一个被告知已有、status、open、stop）。Pomelo：`pnpm check` 通过（`tsc`、Rust 622 个，含看画布的 3 个和真的 bench 启停一次）；`?mock` 里 11 条逐条点过，看画布连着真的 bench 走了启动、列表点画板、界面里换下一张左边跟着变；写字的框在 Safari 里 24 项自测全过。升级测试：正式版是 `pomelo.db` 40，临时目录里 40 的库用新包打开升到 41（一步一步的分组、目标加 `icon`）、有「升级前」备份、数据没变。打包版里的看画布：在它前面放一个记请求的转发，看到它向 bench 要了状态、画布、画板，frame 里的界面整个载入，界面发的换页消息也被记下。11-09 19:05 `pnpm app:install`。**没看到的**：测的时候屏幕在屏保，打包版的窗口没能目视，新样子（牛皮纸文件夹、右键的那条纸、图标库、看画布）只在内置浏览器里看过，由站主在 App 里看。

## 2026-11-09 · Dawn Plan · Phase 7 界面图标（方案 0.5.0，装进正式版，等站主在 App 里验收）

- **Dawn Plan 后半段改了顺序**（站主 11-09）：界面图标提前到 Phase 7，「在 Pomelo 里看画布」提前到 Phase 8，Atlas 年度总结和收口与正式版顺延成 Phase 9、10，第二条线与 MCP 是最后一个 Phase（11），不挡 Pomelo 后面的开发和优化。两个仓库的那一节一起改了。
- **界面小图标 148 个**，全部自己画（`schemes/pomelo/marks/icons.mjs` → `marks/icons/`）：24 格一笔单线、线宽 2、抖动 0.32，线跟着文字颜色；画法和 Design System 的 Icon 是同一份。替换 Pomelo 用过的 149 个 Lucide 图标（小鸟和柑橘都是柚子），另有回桌面、翻面、一颗星三个是外框自己的。审看画布 `canvases/pomelo-icons/` 三张板（第一批 81 个、第二批 67 个、用起来的样子），站主 11-09 在 bench 都批了。
- **内容图标给呦呦漫游**：`sync.json` 的一项能写 `from`（取另一个方案的资产，照那个方案的清单看状态），Pomelo 多同步一份 `content-icons.json`（Vermilion 的 24 个内容图标的名字、标签和图）。
- **Pomelo 这边**：`lucide-react` 删了，图标从 `@/shared/icons` 取（名字沿用原来的）；外框原来在页面上现画的 13 个小图标也换成这一套；呦呦漫游正文上面多了「图标」选择器，点了插入 `:名字:`。开工前修的三处：贴纸簿偶尔弹得太高（盒子被滚了上去）、子页纸签的上边被顶栏切掉、边写边显示的输入框不在编辑时不再露出 `**` `==`（首页桌上的念念不忘便签也按笔记的样子显示）。
- **发版和同步**：站主打了 `pomelo-v0.5.0`；核对 tag（就是最新提交、版本 0.5.0、和工作区一致）后同步，`sync --check --tag pomelo-v0.5.0` 和 tag 的构建逐字节一致。
- **验证**：`npm run all` 通过（质量检查 1411 项、水印 50 项）；`dw check pomelo-icons` 三张全过。Pomelo：`pnpm check` 通过（`tsc`、Rust 619 个）；`?mock` 里看过一步一步、念念不忘、呦呦漫游、柚子页的图标，点过内容图标选择器（插进了 `:place:`）、贴纸簿（怎么滚都在原位）、桌上的便签，控制台没有报错。

## 2026-11-09 · Dawn Plan · Phase 6 的一轮优化（方案 0.4.2，装进正式版，等站主在 App 里验收）

站主在 App 里看完 Phase 6 提了 7 条：新界面卡、滚动发顿、偶尔有色块；叠着的页只有点贴纸才换；柚子页要照 Phase 2 定稿重排；设置和日历的图标和别的不是一个风格；滚动条不是柚儿园的样子。

- **卡顿的原因和修法**：在 Safari（和 Pomelo 的窗口同一个 WebKit）里量，每开一页有一帧卡 0.8～1 秒（窗口越大越久）。原因是纸纹：`card`、`sheet`、`desk` 的每一层都放了一个实时的 `feTurbulence` 滤镜，WebKit 用 CPU 逐像素算。改成一小块（128 的方块，2 倍、32 档透明度，36 KB）照 SVG 规范的参考算法算好的噪声，当背景平铺（`tooling/handmade/texture.mjs`，`build:ds` 内联进 `bundle.css`；数值还是 `tokens/handmade.json` 的 `texture`，两次算出来逐字节一样）。样子不变；换完最长一帧从 989 毫秒降到 150 毫秒以内（同一个 1177 × 769 的窗口，Safari）。
- **方案加的**：滚动条的样子（`bundle.css` 的 `.pm-scroll`：一小段淡墨线，鼠标移进来显出它走的缝线）；设置、日历的两张贴纸（`marks/places/`，和模块贴纸一个画法，不进「图标和颜色」的挑选）。审看板 `canvases/pomelo-marks` 的 `Places`，站主 11-09 批准。
- **Pomelo 这边**：叠着的页各自成层、层级写死，换页只挪位置不重画（WebKit 里 `z-index` 一变整层重画，这是换成平铺纸纹后剩下的那一帧卡顿）；露出来的任何地方都能点。柚子页照 Phase 2 定稿的 askPage：线圈本，左边桌面上一颗会想事情的大柚子和一张张小纸条；对话列表去掉「助手」「定时」两栏，定时任务写的对话进「最近」（`youzi.db` 40）。量流畅度的办法留在 Pomelo 里（`src/dev/perf.ts`、`docs/testing.md`「流畅度」）。
- **发版和同步**：站主 11-09 在 bench 批了 `Places`，打了 `pomelo-v0.4.2`；核对 tag（就是最新提交、版本 0.4.2、和工作区一致）后同步，`sync --check --tag pomelo-v0.4.2` 和 tag 的构建逐字节一致。Design System 的云端那份还没发这一版。
- **站主打完 tag 又提的一条**：速记小窗（⌥Space）没换成新样子。原因是那个窗口从没启动过手画的那一层（分段、按钮的边和底都没画出来）；接上以后底换成方格纸，笔记的框换成手画的输入框。
- **验证**：`npm run all` 通过（质量检查 1115 项、水印 50 项）；`npm test` 19 个全过；`dw check pomelo-marks` 12 张全过。Pomelo：`pnpm check` 通过（`tsc`、Rust 619 个）；升级测试：正式版是 `youzi.db` 39，用临时目录里 39 的库打开新包，升到 40、有「升级前」备份、定时对话在「定时」里排的位置清掉、置顶的没动；`?mock` 里走过柚子页（明暗、收起列表、搜索、发一条消息柚子在想再开心）、叠着的页点纸边换页、设置和日历的贴纸。

## 2026-11-08 · Dawn Plan · Phase 6 首页、日历与模块内页（装进正式版，等站主统一验收）

- **先修了 Phase 4、5 装好后站主看到的三处**（Pomelo）：柚子的对话列表照 Phase 2 定稿的 chatList 改（手画搜索框、淡墨分组名、打开的那个垫一块手剪的底）；整个窗口不再能上下拉一点（有的页比窗口高 1–16 像素，根元素又会回弹：根元素不滚动、处处 `overscroll-behavior: none`）；设置页的图标换成手画圆框里的手画齿轮，和桌面「贴纸簿」那颗一样。
- **原型** `canvases/pomelo-pages/` 七张板（`proposed`）：首页完整版（桌面宽一倍，左右拖、便签能拖能甩；两张板分别停在左右两屏）、日历、列表型、表格型、详情型、统计型。外框照抄 `pomelo-frame` 的生成器（那块批过了不动），新的样子在 `phase6.mjs`。`dw check pomelo-pages` 七张全过（画面外那一屏的便签加 `data-nolint`，由另一张板查）。
- **站主定的**：日历是桌上小月历点开的一页，不是模块（2026-11-08）。
- **Pomelo 这边**：首页换成桌面（`home/Desk.tsx`、`notes.tsx`），日历页（`calendar/CalendarPage.tsx`），模块内页照典型页：页头大标题不放图标、纸上的白框由 `shared/hand.ts` 换成手画的卡（`data-auto-card`）、标签换成带点的 `pm-chip`、右边的面板是手画的卡、图表手画。细节在 Pomelo 的 `docs/design.md`「首页（桌面）」「日历」「典型页」。
- **验证**：`pnpm check` 通过（`tsc`、Rust 617 个）；`?mock` 里走过桌面左右两屏、拖便签（位置写进 `ui.desk`）、小月历点开日历、点一条弹出原记录、明暗两种、书单开面板、钱来钱往报表、投石问路统计、柚子的对话列表换对话，Phase 4、5 的外框和小彩蛋再走一遍，控制台没有报错；每一页的高度都正好是窗口高。升级测试同前（版本不变、旧设置读对、其余数据逐字节不变），11-08 19:54 `pnpm app:install`。**没看到的**：装好的真实窗口（它缩在台前调度的缩略图里，照规矩没拉到前面），回弹是不是没了要站主在 App 里试；模块里面只换了共用的部分（页头、卡片、标签、面板、图表），各模块自己的排版没有一页页重做。

## 2026-11-08 · Dawn Plan · Phase 4、5 外框、动效与空状态（方案 0.4.1，装进正式版，等站主在 App 里验收）

- **站主 11-08 一起批了**（两个 Phase 一起做、一起批）：32 个通用贴纸、8 张空状态插图、37 个动效零件（控件的小动静、外框、柚子的表情、招牌时刻、小彩蛋），外框原型 `canvases/pomelo-frame/` 五张板和动效画布 `canvases/pomelo-motion/`。方案升 `0.4.0`，站主打了 `pomelo-v0.4.0`。
- **给消费方的 Design System 样式**：`build:ds` 另出 `consumer.css`（Design System 的变量加 `bundle.css`，动效只放 `approved` 的），`sync.json` 登记成 Pomelo 的 `src/vendor/pomelo/ds.css`；`tooling/sync/sync.mjs` 认这类来源。同步 77 个文件，`sync --check --tag pomelo-v0.4.0` 和 tag 的构建逐字节一致。
- **Pomelo 这边**：外框换成 B3 桌面（首页摆在桌上、下排「常用」；模块页是纸，开着的叠在右边、顶栏「桌上开着」；子页是纸签；模块坞变贴纸簿；柚子瓣照原型重画；搜索是小票打印机）；控件换成 Design System 的样子、接上动效零件；空着的页换插图；小彩蛋都接上。细节在 Pomelo 的 `docs/roadmap.md`、`requirements.md`「界面外框」、`design.md`「外框」。
- **批了以后加的**：柚子的第 9 张脸「担心」（`marks/pomelo/pomelo-worried.svg`、`motion/pomelo-worried`）和 `pomelo-motion` 的 `Worried`、`Eggs` 两张板，站主 11-08 在 bench 批了。方案升 `0.4.1`：`sync.json` 加上这张脸，给消费方的 `ds.css` 带上它的动效；`npm run qa` 1050 项全过。站主打了 `pomelo-v0.4.1`，核对过 tag 再同步（81 个文件，改了 5 个）；Pomelo 里简报心情「有烦心事」时顶栏的柚子是这张脸（`?mock&mood=worry` 看过），同样做了升级测试，18:46 再装一次。Design System「Pomelo 柚儿园」按 `0.4.1` 发了一版（`1794134895-37dc`）：只改 `components/bundle.css`（插进 38 个动效零件）、`tokens.json` 和 index，图片没变；`check:ds` 22 个预览明暗都没问题，发完回读 3 个文件的 sha256 和本地一致。
- **验证**：`npm run qa` 1050 项全过；`dw check pomelo-motion` 的 `Worried`、`Eggs` 通过。Pomelo：`pnpm check` 通过（`tsc`、Rust 617 个）；`?mock` 走过外框、贴纸簿、柚子瓣、找东西、待办勾完、戳柚子、空状态、设置和书影的控件，深色看过，「减少动态效果」下所有动画都不动，控制台没有报错；升级测试：正式版和新包都已有全部 migration（`pomelo.db` 40、`youzi.db` 39），临时数据目录里写进旧版存的页签和七个分类，新包读回来只留三页（`/`、`/dock` 和重复的模块去掉）、分类不动、其余数据逐字节不变；11-08 16:58 `pnpm app:install`（18:46 带 0.4.1 再装一次）。**没看到的**：打包版的真实窗口（测的时候屏幕在屏保，只从数据确认前端起来了、读对了旧设置）；动效的节奏和手感由站主在 App 里看。

## 2026-11-07 · Dawn Plan · Phase 3 柚子与模块图标（装进正式版，等站主在 App 里验收）

- **图形搬进方案**：柚子和模块贴纸的几何从 `canvases/pomelo-explore/p2-final/art.mjs` 搬到 `schemes/pomelo/marks/art.mjs`（Phase 2 小样里的柚子和 6 个模块原样），新的 `tooling/handmade/marks.mjs` 用和 Design System 同一份画法生成 SVG、更新清单，`--check` 只比较，`approved` 的生成结果一变就报错。`npm run build:handmade` 一起跑，质量检查和同步（在 tag 里）都核对。
- **34 个资产，站主 2026-11-07 批准**（7 张审看板：在 bench 里批了 5 张，模块贴纸和模块坞两张按站主说的把兴趣、工具的颜色互换后批准）：柚子 8 个表情（100 格静态帧）、AI 按钮（柚子探头加对话泡泡）、菜单栏实心和空心（18 个点的模板图，柚子 16 个点高）、App 图标三种底（方格纸、薄荷桌面、牛皮纸；1024，macOS 的 824 连续圆角网格）、20 个模块贴纸（新画 9 个：看画布、Seeker、Rater、Translator、Pub2MD、Importer、Atlas、一网打尽、DevJanitor；小样里补画的 5 个正式收进来）。颜色写成 `var(--pm-角色, var(--color-角色))`，Pomelo 和挂了 Design System 的画布都能直接用；`build:marks` 按蓝笔浅色出 App 图标 PNG，菜单栏出黑色模板图。App 图标三张都批了，正式版用方格纸（站主挑的），登记进 `sync.json`。
- **模块归类**（站主定）：跟模块坞的分类走，五色是日常薄荷、兴趣樱粉、求职葡萄紫、柚子橙、工具天蓝（批的时候兴趣和工具互换过）；Pomelo 方言的 `--module-*` 按它改，加了 `--module-canvas`、`--module-atlas`。方案升到 `0.3.0`。
- **审看画布** `canvases/pomelo-marks/`：7 张板（柚子、菜单栏和 AI 按钮、模块贴纸、模块坞里的样子、App 图标三张），挂 Pomelo 柚儿园，Tweaks 切配色和明暗；生成器取 `marks/` 里的 SVG，不另画一份。
- **bench**：批准状态（画板名字后面的小牌子、单张铺满的「批准」「退回」，记进画布的 `db.json` 的 `review/<画板>`，带标状态时画板的校验和，之后改过会标出来；`dw review` 读，Agent 只能标待批）；并排对比（另一张板，或这张在本地存过的旧版本，`&vs=`）；顶栏和单张铺满的「深色」「减弱动效」管所有画板（带 dark 参数的改参数，其余由 `src/board/emulate.js` 模拟系统设置）。
- **Pomelo 这边**：模块坞、柚子瓣、拖动的小条和「问柚子」按钮读同步来的 `src/vendor/pomelo/marks/`（`src/shared/marks.tsx`，每次换一套 id）；柚子的助手旁边（模块坞、柚子瓣、助手页标题）的小鸟换成小柚子；菜单栏换成同步来的模板图；App 图标由同步来的 1024 源图生成 `src-tauri/icons/`。`pnpm check` 通过（Rust 617 个），`?mock` 里模块坞、柚子瓣、明暗和配色看过、没有报错；打包版在临时数据目录里打开，菜单栏是新的空心柚子，App 包里是方格纸的图标。升级测试（没有新的数据库改动）：临时库里加了几条数据，新版再打开后 `pomelo.db` 40、`youzi.db` 39、数据逐行不变。11-07 21:12 `pnpm app:install` 装进正式版。
- **验证**：`npm test` 17 个全过（新增 2 个：批准状态的存储和接口、全局开关在 Chrome 里真的让页面按深色和减弱动效走）；`npm run qa` 800 项全过；生成 SVG、导出 PNG、生成画布各两次逐字节一致；`dw check pomelo-marks` 7 张全过，截图逐张看过；bench 在内置浏览器里看过：小牌子随 `dw review --propose` 实时出现、对比、深色开关。站主打了 `pomelo-v0.3.0`（`fc88b90`），同步进 Pomelo 的 `src/vendor/pomelo/`（加了 `marks/`，38 个文件），`sync --check --tag` 一致。
- **Design System「Pomelo 柚儿园」发了一版**（`1794056449-3e4a`）：Assets 加三组（Pomelo：柚子 8 个表情和问柚子按钮；App：App 图标和菜单栏模板图；Modules：20 个模块贴纸），32 个资产上传后按本地文件的 sha256 记进 `published.json`；改过的 6 个文件回读 sha256 和本地逐个一致。

## 2026-11-07 · Dawn Plan · Phase 2 地基（站主 2026-11-07 验收）

- **Pomelo 方言补齐**：`schemes/pomelo/tokens/targets.json` 的 Pomelo 方言加了 17 个 `--pm-*`（胶带、牛皮纸、线、印出来的纸、投影……），每个颜色角色在 Pomelo 里都有变量。`tooling/tokens/build.mjs` 在 `tokens.ts` 里另出 `pomeloVars`（角色 → Pomelo 的变量名），Pomelo 用它告诉手画零件该取哪个变量（`bundle.js` 默认取 `--color-*`）。Vermilion 的产物不变。
- **第一次登记同步到 Pomelo**：`schemes/pomelo/sync.json` 把 `pomelo.css`、`tokens.ts` 和 Design System 的 `bundle.js`（改名 `handmade.js`）复制到 Pomelo 的 `src/vendor/pomelo/`。`tooling/sync/sync.mjs` 认这两类来源（跟着 `scheme.json` 的状态），需要时在 tag 里跑 `build:ds`。方案升到 `0.2.0`。在一份临时 clone 里打假 tag 跑 `sync --dry-run`：构建、核对状态、列出 6 个文件，都通过。
- **Pomelo 这边**（站主 2026-11-07 给了全部开发权限）：颜色只来自同步的方言；设置 › 外观选配色和明暗；新的 `calendar.rs`（月历）和首页完整版的数据。细节记在 Pomelo 的 `docs/roadmap.md`。
- **站主定的**：面试只放已经勾上的那一步；重复待办展开（每天的除外），打卡不放；不读 macOS 日历；首页完整版是能左右拖动的桌面，加本月、今年按月、念念不忘一条，便签位置记住。
- **验证**：Pomelo 的 Rust 测试 617 个全过（新增 3 个：月历一个月的全部来源、隐藏和跨月、首页的本月和按月和便签）；`tsc` 无错，前端生产构建带上了 5 套配色；`?mock` 里 5 套配色、明暗三种都切过，设置页和首页在柚黄浅色下字都看得清（截图常慢一拍，状态用 JS 读的）。站主打了 `pomelo-v0.2.0`（`8110ed2`），同步进 Pomelo 后 `sync --check --tag` 一致，同步来的 `pomelo.css`、`handmade.js` 和本地构建逐字节相同；Design System 在现用账号发了一版（`1794042926-0207`，只换了 `tokens.json` 记的版本和 index），回读一致。**没看的**：真实窗口（打包版）。

## 2026-11-07 · Dawn Plan · Phase 1 开工（站主验收）

- **冷启动验收通过**（VL2 · Phase 6 收官）：Codex、Antigravity Argon 和另一个账号的 Claude Code 只看文档都做完了：准备仓库、`npm test` 全过、新建画布挂 Vermilion 写一张 1280×800 的板、`dw check` 通过、导出 PNG、读出问卷的 q2（`local`）和 A7（`later`）。三块 `coldstart-*` 画布看过截图后删了。
- **按反馈改的**（清单在 `bench/history/vw1-plan.md`）：`dw check` 遇到 Chrome 打不开页面（沙箱拦了端口）、报错页或 404 时报错，不再当通过（`bench/src/server/headless.js`，加了测试）；`dw new` 一起生成 `README.md`；ButtonLink 的说明加了类名和写法，Vermilion 总说明里按钮描边的颜色改对；`design-loop` 写明本地画布跳过拉回、组件类名直接读文件、截图的完整路径；`CLAUDE.md`「新会话接手」和 `bench/README.md` 写了非交互 shell 的 `nvm` 和沙箱放行；`ROADMAP.md` 的问卷答案路径改成 `db.json`。
- **Pomelo 柚儿园在现用账号重发**：https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3 ，从 `schemes/pomelo/design-system/` 构建，49 个文件一次发完，回读 sha256 逐个一致。`published.json` 顶层改成这份（账号「现用账号」），旧账号那份记在 `copies.旧账号`，只看不动。
- **三个计划合成 Dawn Plan**（站主定名）：VL2 · Phase 8–14、VW1 · Phase 1–5 和 Pomelo v0.9 的代码合成 11 个 Phase，写在 `ROADMAP.md` 和 Pomelo 的 `docs/roadmap.md`（一模一样）。VL2 · Phase 4–7 和 VW1 的记录归档到 `schemes/pomelo/history/vl2-roadmap.md` 和 `bench/history/vw1-plan.md`。文档里的「账号一 / 账号二」改成「旧账号 / 现用账号」，Pomelo 的权限改成全部可改（commit 仍由站主）。
- **验证**：`npm test` 15 个全过（新增 1 个）；`VA_BROWSER_CHANNEL=chrome npm run build` 通过；`build:ds -- --scheme pomelo` 按现用账号的记录生成 index。**没看到的**：云端的 Design System 页本身（内置浏览器没登录 claude.ai）。

## 2026-11-07 · 账号二转接

- **按链接挂载验收**：一个 Claude 会话只拿到 Pomelo 柚儿园的链接，自己建了画布「今天的待办卡片」并挂上，手画的框、胶带、勾选、划掉、按钮、手札体都对（内置浏览器里目视）。拉回成 `canvases/pomelo-todo-card/`，6 个文件校验和全对，`dw check` 通过。
- **发布 tokens.css**（那个会话的反馈：Design System 页不发布 `tokens.css`，读不到，只好照 `tokens.json` 手抄一份）：`build:ds` 现在用和自检、`dw ds install` 同一个编译函数（新的 `tooling/design-system/tokens-css.mjs`）写 `project/tokens.css`，第一行照格式写「<名字> — generated from tokens.json」。Pomelo 柚儿园发了第 4 版（`1794033316-4587`），回读 sha256 一致；和手抄的那份比，变量名和取值一个不差，多了 11 个字体样式类。`dw ds install` 改成优先复制这份。Vermilion 朱红本地也会生成，还没发到云端。
- **另一个账号发一份 Design System**：`published.json` 可以在 `copies` 里记别的账号的那份，`npm run build:ds -- --scheme <方案> --account <账号名>` 按那条记录生成 index；步骤写在 `tooling/README.md`「在另一个账号里发一份」。
- **账号一的云端都有本地源**：9 份逐个核对过，表在 `docs/cloud.md`「账号一的云端都有本地源」。Vermilion Explore 18 个文件 sha256 一致，Workbench 往返测试换回图片 id 后一致，Pomelo Explore 云端版本就是本地最后一次发布的，两份 Design System 发布后都回读过；问卷是页面，没有逐文件的校验和。
- **验证**：`npm test` 14 个全过；`check:ds` Pomelo 22 个预览没有问题；Vermilion 的 Design System 产物只多了 `tokens.css`。

## 2026-11-07 · VL2 · Phase 7 Design System（等站主验收）

- **新建并发布「Pomelo 柚儿园」**：https://claude.ai/artifact/4GgAtgCdS5fBcX9Fp4t4NU （私有，账号一），源在 `schemes/pomelo/design-system/`。说明（怎么用、内容基调、颜色、字体、版面、形状、手画的线、动效、柚子、图标、Pomelo 代码里的名字）；tokens 70 个颜色、间距 9、圆角 5、阴影 4、宽度 2、字号 10、行高 3、字体样式 11；21 个组件的静态预览和说明（五套配色、纸、卡片、便签、小票、胶带、笔迹、贴纸、小图标、按钮、开关、分段、下拉、勾选、评分、输入框、标签、鼠标提示、提示、统计数字、印出来的东西）；封面。数值都取自站主验收的 Phase 2 小样和 `tokens/`。还没有资产（Phase 8 起放）。
- **配色**（站主 2026-11-07 定）：Design System 最多 8 套主题，主题只放蓝笔的明暗；另 4 套配色由构建从 `tokens/color.json` 生成进 `bundle.css`，用 `data-palette` 切换，和 `data-theme` 写在同一个元素或谁套谁都行。
- **手画零件进了 Design System**（站主 2026-11-07 定）：`tooling/design-system/bundle.mjs` 把 `tooling/handmade/` 的 `line.mjs`、`frame.mjs`、`sticker.mjs` 和新写的 `paint.mjs` 原样拼成 `components/bundle.js`（`window.Pomelo`），挂了它的画布写 `data-hand` 就能画出和正式版同一套手画的框、线、胶带、缝线、勾选框、星星、开关、小图标和贴纸。构建时在 vm 里把打包后的画法和模块本身逐字比 17 个样例，不一致就停。框的预设（卡片、纸、按钮、输入框……）的数值在 `system.json`。
- **工具**：`build:ds` 支持多套配色、`leading` 家族、`meta.localFonts`（只在本机有的系统字体）；`check:ds` 注入 `bundle.js`、按方案取字体、查没画上的手画零件；`tokensCss` 认所有不分明暗的家族。Vermilion 的 Design System 产物逐字节没变。
- **bench**（VW 线的文件，改了一处）：`fontLinks` 跳过 `meta.localFonts`，`dw ds install` 不再让画板去 Google Fonts 取手札体和苹方；加了测试。
- **验证**：22 个预览明暗各截一张，没有脚本错误、横向溢出和没画上的零件，截图逐张看过；构建两次逐字节一致；云端 48 个文件回读，sha256 和本地逐个一致；Design System 列表里能看到它；本地新建画布 `dw ds install` 挂上、写一张用 token 和 `Pomelo.paintLive` 的板，`dw check` 通过（测试画布已删）；`npm test` 14 个全过；bench 的 `/#/ds/pomelo` 页里组件正常显示。**没看到的**：云端的 Design System 页（内置浏览器没登录 claude.ai），以及在 Claude 会话里按链接挂载。

## 2026-11-06 · 两个仓库合成 visual-atelier（等站主验收）

- **结构**（站主定，问卷 `canvases/repo-merge-questionnaire/`）：visual-assets 当底子，visual-workbench 的提交并进来，没有冲突；tag 和网站 `VERSION` 记的提交都还在。看画布的引擎在 `bench/`，画布在根目录的 `canvases/`。
- **一份规矩**：`CLAUDE.md` 并进了 workbench 的 `AGENTS.md`（新会话接手、画布与 bench 的规矩、验证、常用命令），去掉「两个仓库 clone 在同一个目录下」「唯一的例外是 visual-workbench」两条。ROADMAP、CHANGELOG、README 各一份，`bench/README.md` 讲引擎怎么用。VW1 计划站主批准，加了第 5 步「在 Pomelo 里看画布」。
- **代码**：引擎分 `BENCH_ROOT` 和 `REPO_ROOT`，不再找旁边的仓库，依赖直接用根目录的 `node_modules/`；生成器的入口 `canvases/_lib/va.mjs` 换成 `root.mjs`；只留一个 `package.json`（加了 `npm test`、`npm run serve`）。
- **旧名字**：tooling 写出的来源、同步到消费方的 README 模板、Design System 的出处都换成 visual-atelier。Pomelo 3 份文档、网站 11 个文件里的旧名字改了（站主授权，改前副本在 `scratch/backup-2026-11-06-merge/`，消费方那边没提交）。云端 Pomelo Explore 发回 `DESIGN.md`，17 个文件校验和全对；Vermilion 朱红发了一版（`1793953959-6d40`），只换了 `tokens.json` 和 index。
- **收拾**：visual-assets 底下 3 个旧 worktree 和它们的分支删了，worktree 里 VL1 的临时文件挪到 `scratch/vl1-worktrees/`；只放本机的 Pomelo `archive/`、各画布的 `.versions/`、`.shots/`、`preview/` 挪过来，和原件逐个一致。
- **验证**：`npm test` 14 个全过；`npm run all` 质量检查 731 项通过、0 失败，水印 50/50；6 块画布 33 张板 `dw check` 全过，含 Pomelo Explore 的 2 个自带检查；Pomelo Explore 重新生成，除了 `DESIGN.md` 那一行和原来逐字节一致；网站 `sync --check` 一致；新目录冷启动（只照文档：`npm ci`、构建、测试、新建画布挂 Vermilion 写一张板、`dw check`、导出、读问卷答案）走通；画布界面和 Design System 页在内置浏览器里打开正常，没有报错。
- **改名收尾**：GitHub 上 `elen-visual-assets` 改名 `elen-visual-atelier`，`elen-visual-workbench` 删掉，本地文件夹改名 `visual-atelier`，旧 workbench 文件夹放进废纸篓（站主）。改名后在新路径上再验：`npm test` 14 个全过，Pomelo Explore 重新生成工作区没有变化，Pomelo Explore 和 Vermilion Explore 29 张板 `dw check` 全过，网站 `sync --check` 一致；本地和 GitHub 都在同一个提交，7 个 tag 都在。

## 2026-11-06 · VL2 · Phase 5 画布界面（站主验收）

- **画布界面**（当时在 visual-workbench 的 `src/board/`，现在是 `bench/src/board/`）：`dw serve` 的首页换成画布界面，布局和操作照 Claude 画布：无限画布、多页、便签、活的画板（PLAY）、单张铺满（Fill / Fit，←→ 换张）、Tweaks（不写回文件，能复制参数）、回看本地旧版本（只读）。文件改了自己刷新。
- **服务**：加了版本列表、旧版本文件、旧版本还在用的图片几条路由；界面文件从代码目录读。
- **检查工具**（`test/tools/`）：`compare-cloud.mjs` 本地和云端逐张对比，`check-tweaks.mjs` 逐个切 Tweaks 选项拼总览图。
- **复现**：Vermilion Explore 16 张逐张和云端比，15 张一致，`R3-ppt` 只差缩小后的线条边缘；Vermilion 问卷第 1 页一致（状态行除外，本地还没有问卷数据库）。
- **Pomelo**：13 张板都能打开；带配色的 9 张，5 套配色明暗各切一遍都画得出来、没有报错。

## 2026-11-06 · VL2 · Phase 4 画布落地（站主验收）

- **画布的源搬家**：`canvases/` 整个搬到 visual-workbench（私有仓库 `elen-visual-workbench`），本仓库删掉这个目录。生成器改成从本仓库取 token、工具和依赖；Pomelo Explore 在新位置重新生成，和搬之前逐字节一致，版面检查通过。
- **本地真身**：Vermilion Explore 的 233 张图都在本地，和云端存的逐字节一致；Vermilion 问卷的截图、成品和答案收进来。
- **引擎**：另一个 Agent 搭好的引擎（`dw`、Claude 导出包的解包、无头截图、预览服务）整理成现在的样子：规矩重写进 workbench 的 `AGENTS.md`；去掉 `workspace/` 和 `board.json`，`canvas.json` 加 `.dc.html` 是唯一格式；画布运行时搬进 `vendor/` 并记校验和；测试只在临时目录里跑。
- **云端往返**：`dw` 能拉回、发回、核对和存本地版本。Pomelo Explore 发回 3 次（`DESIGN.md` 新编号、便签编号），17 个文件全对；新建「Workbench 往返测试」验证了图片上传和换 id。
- **规矩**（站主）：本仓库改为私有，为推进项目，站主少量的作品和文章可以进仓库；问卷做成带存储的页面；VL2 拆出 Phase 4–6，新增 Phase 12，Phase 顺序不变。

## 2026-11-05 · VL2 · Phase 2、3 验收（Pomelo `0.1.0`）

- **验收**（站主）：Phase 2 的外框 B3 桌面拼贴、迁移测试、年度小报的样式；Phase 3 的规则和调过的颜色。
- **建 `schemes/pomelo/`**：规则写成 `DESIGN.md`；token 5 套配色、每套明暗，模块色、选项色、状态色、图表色都收进同一个色板；出网页方言和 Pomelo 方言（还没被 Pomelo 采用）；字体清单；两档动效的数值。
- **对比度**：5 套配色明暗共 520 对全过 APCA。为此动了 30 处颜色，只改亮度。
- **工具**：`tooling/tokens/`、`qa/`、`catalog/` 支持多套配色；新增 `tooling/handmade/`（手绘线条、贴纸、错版），和站主验收的小样逐字一致；版面检查移进 `tooling/qa/canvas-lint.mjs`。
- **导出时好时坏大部分修好了**：主要原因是 Chrome 的 GPU 栅格，`tooling/lib/browser.mjs` 改成固定走软件栅格，结果和网站上线的 `og-default.png` 逐字节相同，`count-up` 不再出现。还剩一个偶发：`logo-mark@512-light.png`，2026-11-05 复验 6 次有 2 次不一致，原因没查清。
- **画布**（站主）：旧的三块 Pomelo 画布删了，新建 Pomelo Explore，放「Phase 2 · 最终设计」和「Phase 3 · 方案」两页。新规矩：生成画布的数据、脚本等源文件，本地项目必须留一份，放 `canvases/`。
- **计划**（站主）：插入新 Phase 4（visual-workbench 与本地画布系统），原来的 Phase 4–10 顺延成 5–11。

## 2026-11-03 · VL2 · Phase 1 图形语言深挖

- **改了做法**：Claude 会话打不开共享的画布，Phase 1–2 改由 Claude Code 生成样稿写进 Pomelo Explore（站主）。
- **两轮样例**，都在画布上，每轮一页：第一轮 6 张（三种画法、六个维度、三套颜色、三种动效性格），第二轮 5 张（S3 第二版、剩下三个维度、两组配色、按场景的动效）。手绘线条按种子算进路径，同一份源两次生成逐字节一致；每张都在本地截图自检过，动效按几个时间点定格看过。
- **定案**（站主）：画法 S3 线描贴纸；配色 5 套在设置里切换；柚子 8 个表情和平常的表情动作；动效按场景定。细节见 `schemes/pomelo/DESIGN.md`。

## 2026-11-03 · VL2 · Phase 0 问卷与计划

- **验收**：站主答完 Pomelo 视觉问卷第 1 轮，批准 VL2 的分 Phase 计划（Phase 0–9，见 `ROADMAP.md`）。
- **定案**（站主）：
  - 手作当主角；B 线只做 B3 桌面拼贴；深挖 V2 贴纸、V3 错版线描。
  - 柚子是唯一的角色，新方案里「小拾」改叫「柚子」。
  - 图标全部自己画，VL2 内画完；不做声音。
  - VL2 只出原型和规格、同步文件，界面代码和内容图标选择器移到 Pomelo v0.9。
  - 手札体按「本机调用、不打包、不转曲线」记进 `docs/licensing.md`。
- **画布**：问卷、Pomelo Explore、Pomelo Design System 共享给站主的另一个账号；那个账号的 Claude Code 能读写，原账号看得到改动。Design System 里留一份占位说明。
- **文档**：交接简报写进问卷答案和 Phase 1–2 的任务，放进探索画布。

## 2026-11-02 · VL1 收官

- **验收**：站主验收 Phase 2（Design System）与 Phase 10（线上画廊的水印）。VL1 的 10 个 Phase 全部通过。
- **定案**（站主）：
  - `expressive` 单次上限 1200ms。
  - Agent 提议、标着「站主可改」的细节全部定案。
  - 网站没用的资产留给 PPT 和动图，这些场合仍归 Vermilion。
  - 内容图标选择器并入 VL2。
- **文档**：
  - `ROADMAP.md` 只留 VL2、长期决定与现行授权。
  - VL1 的计划、决定、授权与过程记录移到 `schemes/vermilion/history/`。
  - 过程中的教训写进 `CLAUDE.md` 与 `docs/workflow.md`。
- **检查**：
  - 用模板试建临时方案：只有模板时工具会报错；加上 6 个必备文件后，全部工具都能跑。结果记在 `docs/architecture.md`，临时方案已删除。
  - 精简后 Vermilion 的 `npm run qa` 仍全部通过（数字见下）；网站里的副本 `sync --check` 一致。
