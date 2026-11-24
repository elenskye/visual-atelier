# CHANGELOG

只记已完成且验证过的结果，不写待办。大阶段做完后，逐条记录移进 `history/`，这里只留摘要表：VL1 每一步在 `schemes/vermilion/history/vl1-changelog.md`；2026-11-02～11-11 的，和到 v1.0 计划 Phase 0–3（11-12～11-15）仓库自己的，在 `history/changelog-2026-11.md`。

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
