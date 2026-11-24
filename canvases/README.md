# canvases

画布的源。Claude 画布上的东西都由这里的文件生成，云端只是发布出去的一份：画布删了或读不回来，靠这里能原样重建。

云端的都私有。**旧账号**建的只看不动，**现用账号**建的能拉回、发回（`docs/cloud.md`「账号」）；要给站主在 Claude 里看的新画布在现用账号里新建。哪块由哪个会话做，见 `CLAUDE.md`「几个会话怎么分」（`pomelo-explore` 归 Pomelo 的会话，`peck-explore` 归 Peck 的会话）。

bench 把画布分成两类列出（`bench/README.md`）：**Explore Deck** 是画布，每个方案一块；**Questionnaire** 是问卷页。另外两类 Design System、Motion Deck 的源不在这里，在 `schemes/<方案>/design-system/` 和 `schemes/<方案>/motion/`。

| 目录 | 是什么 | 云端 |
| --- | --- | --- |
| `vermilion-explore/` | Vermilion 的 Explore Deck：图形语言四轮探索（2026-10-30 结束） | 现用账号 [Vermilion Explore](https://claude.ai/artifact/HxHyVFMZPgwcjpXQrAoDbP)，分页以前的样子；旧账号那份只看 |
| `pomelo-explore/` | Pomelo 的 Explore Deck：EX1–EX8（画法、配色家族、外框 A / B3、方案、见字如面的贴纸、跨模块联动、玩物有志、Atlas 新的几幕）和 R1–R8（外框、图形、小图标、动效、Atlas、见字如面两页、侧栏展开），站主在 bench 里批 | 只看：旧账号 Pomelo Explore（前两页）、现用账号几块并进来之前的（列在它的 `README.md`）；以本地为准 |
| `peck-explore/` | Peck 的 Explore Deck：初版、图形语言三轮、外框小样、方案、Design System；生成器在 `project/src/`，方案在 `schemes/peck/` | 现用账号 [Peck Explore](https://claude.ai/artifact/2YJB1WKiiC6q7s6VmryCaR)，11-10 的样子 |
| `pith-explore/` | Pith 的 Explore Deck：只有 R1「Pith 定稿」（站主 11-24 验收后清理，EX1–EX11 的经过在 `history/pith-phase5.md` 和 `CHANGELOG.md` 的归档）；颜色、图形、动效都从 `schemes/pith/` 来，挂着 Design System「Pith」 | 现用账号 [Pith Explore](https://claude.ai/artifact/HcCFtnXuGg9fQnp5qSVoH7)（R1）；旧账号那份（EX1–EX11）只看 |
| `pomelo-v1-1-questionnaire/` | Pomelo 1.1 的问卷（单个页面），等站主填；读法在它的 `README.md` | 现用账号 |

问卷用完、结论写进文档以后就删（答案留在 Git 历史）。第二条线做版时，各家的画布只在它们自己的分支上，验收时并排进一块临时对比画布，站主挑完就删（`docs/sessions.md`「第二条线」）。删掉的画布和页先进回收处 `.trash/`（只在本机，`node bench/bin/dw.js trash` 列出、放回、清空）。

## 看、批、写（2026-11-22 从 `CLAUDE.md`「画布与 bench」挪过来）

- **两条线**（站主 2026-11-05）：Claude 探索可以就在 Claude 的云端画布上做，到里程碑把成稿拉回本地（`dw pull`）；其他 Agent（Codex、Antigravity Argon、另一个账号的 Claude Code）探索和成稿都在本地画布上做。碰云端前照 `docs/cloud.md`「账号」看清自己是哪个账号。
- **站主看、批，不改内容**：平移缩放、动 Tweaks、批准退回，给画布、页和画板改名、删除（进回收处，能撤销），给 Design System、Motion Deck 改 bench 里显示的名字（只记在 `bench/names.json`）；画板里的东西交给 Agent 改。Tweaks 不写回文件，站主说「就这个」，Agent 再改源。批准和退回只由站主做，Agent 只标「待批」。
- **格式和 Claude 画布同一套**：`project/` 里是 `canvas.json` 加 `*.dc.html`，和云端一模一样；普通 HTML 也能当画板。第一张画板叫 `Main.dc.html`；文件名用字母或数字开头，只用字母、数字、`.`、`-`、`_`。
- **给站主看某一张，直接给地址**：`http://127.0.0.1:4321/#/<画布名>?page=<页>&board=<文件>`（`page` 在 `canvas.json` 的 `pages` 里，没有分页就不写；不带 `board` 是整块画布）。

## Explore Deck 的规矩（站主 2026-11-13）

- **每个方案一块**，叫 `<方案>-explore`、标题 `<方案> Explore`。新的探索、新的审看画板都加成这一块的一页，不另开画布；有生成器的页用 `_lib/page.mjs` 的 `writePage` 只写自己那一页。
- **页分探索和优化**，页名写「EX<N>：<主题>」或「R<N>：<主题>」（站主 2026-11-14，照站主给 Peck Explore 改的样子）。探索在前、按时间编号 EX1、EX2……；优化在后，也按时间编号 R1、R2……。冒号用全角「：」，并列用顿号，日期写 `11/08`。页名短，只说这一页看什么；轮次、阶段号不进页名（编号就是先后），也不写进画板标题，写在这块的 `README.md`。
  - **探索**：几个方向、几套配色里挑一个。全留，淘汰的也留，探索的过程值得看。
  - **优化**：同一样东西改好几轮。每项只留最新的一份，旧轮次删掉（在 Git 历史里）；只在旧轮次画过的（迁移测试、流程一览）是独一份，留。
- **两档门槛**（站主 2026-11-22，Phase 5 的教训：探索阶段就上定稿的门槛，精力全花在工程上）：
  - **EX 页（探索）**：画板可以直接手写 `project/*.dc.html`，不要求生成器、不要求两次生成逐字节一致；字体直接用 Google Fonts 托管的，不做子集；配色跑一下 APCA，不过的配对写进交付说明，不挡出图。第一轮只摆 2–4 个低保真方向（`skills/design-craft`）。
  - **R 页（优化）和建方案**：画板由 `canvases/<画布名>/` 里的数据和生成器出、两次生成逐字节一致；字体可再分发、登记在 `docs/licensing.md`，要打包的做子集；APCA 全过（`CLAUDE.md` 核心约定 9）；定下来的 token 和资产进 `schemes/<方案>/`。
- **画板文件名** `<页的前缀>-<资产>.dc.html`：探索页用 `X<N>-`，优化页用主题（`Frame-`、`Marks-`、`Notes-`……）。批过的板改名时，`db.json` 的 `review/<画板>` 跟着改。
- **画板标题**写「<资产> · <说明>」；挑选用的代号（S1、A、B3、P1）留着，站主是照它们挑的。
- **名字以 `canvas.json` 为准**：站主在 bench 或有板有眼里能给画布和页改名、删除（2026-11-13），也能给一张画板改标题、删掉一张画板（2026-11-14，bench 的画板标题条和单张铺满的顶栏上的「⋯」；有板有眼里看的就是 bench 的画布界面，一样能做）。生成器只在一页还没有时给它起名，已有的页名、页的先后、打开时落在哪页都不改；页删了，生成器还在，下次清理时一起删（别再跑它，会把那一页加回来）。**画板的标题现在还是生成器说了算**：重跑一页的生成器，这一页的板会照生成器写回原来的标题，删掉的板也会回来；所以站主在界面里改过板名、删过板的页，重跑生成器之前先把改动写进生成器。
- 删板、改名、并画布之前先 `node bench/bin/dw.js snapshot <画布名>` 存一个版本（`dw rename`、`dw delete` 和界面里的改名、删页自己会存）；冻结的生成器（只为留档、跑了会改掉批过的板）一跑就停，`FROZEN_OK=1` 才跑。

## 每块画布一个目录

```
canvases/<画布名>/
  README.md     画布链接、每页对应的生成器、怎么生成和发布
  cloud.json    云端地址（home 和别的副本），图片 id 的对照表
  project/      和画布上一模一样的文件：canvas.json、*.dc.html、附带的文档；挂了 Design System 的还有 ds/<名字>/
  blobs/        画板用的图片（/_blob/<id>），名字是 <id>.<扩展名>，字节和云端存的一样
  <这一页>/     这一页的生成器和数据；有 lint.mjs 的，dw check 会顺带跑它
  db.json       页面存的数据（claude.use('db')），问卷答案在这；画板的批准状态也在这（review/<画板>，dw review 读）
  preview/      生成器的本地预览页，不进 Git
  .versions/    本地版本历史，不进 Git
  .shots/       截图，不进 Git：check/<画板名>.png 是 dw check 的，export/ 是 dw export 的（画板名去掉 .dc.html）
```

页面（问卷这类单个 Artifact 页面）没有 `project/`：`cloud.json` 的 `kind` 是 `page`，`entry` 是那个 HTML。

画布名只用小写字母、数字和连字符。`_lib/` 不是画布，放生成器共用的零件：`root.mjs`（取仓库里的东西）、`board.mjs`（画板外壳 `dcBoard`、一张板几屏共用状态的 `screens`）、`page.mjs`（只写一页的 `writePage`）、`apca.mjs`（对比度 `lc`、`checkPairs`）。`node bench/bin/dw.js new <画布名>` 一次建好 `README.md`、`cloud.json`、`project/canvas.json` 和 `project/Main.dc.html`；本地新建的画布 `cloud.json` 的 `targets` 是空的，发到云端以后才有。

## 注意

- **先进这里，再上云端。** 发布只从 `project/` 发，不手写一份临时的。
- **云端改过的要带回来。** 站主在画布上挪了画板或改了字，发布前先拉回；读不回来就先问站主。
- **发布前 `node bench/bin/dw.js check <画布名>`**：每张板截图、零报错、版面，再跑这块自带的 `lint.mjs`。
- **板和生成器要对得上**：改了方案、生成器以后重跑用到它的页；`npm run check:canvases` 在临时目录里把生成器全跑一遍、和 `project/` 逐个文件比，对不上就列出来（站主 2026-11-24 定，`npm run all` 的一步）。新画布有生成器就登记进 `tooling/qa/canvases.mjs` 的 `GENERATORS`；冻结的、跑不了的不登记。
- **生成器取用仓库里的东西只走 `_lib/root.mjs`**：`rootImport('tooling/…')` 引入工具，`rootPackage('apca-w3')` 引入根目录装好的依赖（CommonJS 的包也能按名字取导出），`ROOT` 是仓库根目录，`RUNTIME` 是画布运行时的副本。画板外壳、对比度、中文字体子集用共用的 `_lib/board.mjs`、`_lib/apca.mjs`、`tooling/fonts/subset.mjs`，别各写一份（Phase 5 三家各写了一遍）。
- **内容**：仓库私有，为推进项目站主少量的作品和文章可以进；Pomelo 的真实数据不进。
