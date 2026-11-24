# bench

看画布的引擎。`canvases/` 里的每块 Claude 画布在这里有一份本地真身：和云端一模一样的文件、本地的版本历史、能拉回也能发回，开个本地服务就能看，一条命令就能无头截图自检。只给 Claude 和其他 Agent 用，不做编辑器。

命令都在仓库根目录跑。依赖装在根目录的 `node_modules/`；Design System 页读根目录 `dist/` 里的构建产物。

第一次用（`npm ci`、完整构建一次、`npm test`）见根目录 `README.md`「第一次用」；Agent 在非交互的 shell、沙箱里跑要注意的见 `docs/sessions.md`「新会话接手」。

## 常用

```bash
node bench/bin/dw.js list
```

新建一块本地画布（`README.md`、`cloud.json`、`project/canvas.json`、`project/Main.dc.html` 一次建好）：

```bash
node bench/bin/dw.js new <画布名> --title <标题>
```

```bash
node bench/bin/dw.js serve
```

打开 http://127.0.0.1:4321/ 就是画布界面，布局和操作学 Claude 画布。顶栏左边的菜单分五类，次序固定（`src/server/catalog.js`）：

| 类 | 是什么 | 地址 |
| --- | --- | --- |
| Design System | `schemes/<方案>/design-system/` 构建好的那份 | `/#/ds/<方案>` |
| Motion Deck | `schemes/<方案>/motion/` 的动效零件 | `/#/motion/<方案>` |
| Explore Deck | 画布，每个方案一块（`canvases/README.md`「Explore Deck 的规矩」） | `/#/<画布名>?page=<页>&board=<文件>` |
| Questionnaire | 问卷页（`cloud.json` 的 `kind` 是 `page`） | `/#/<名字>`，单独打开 `/c/<名字>/` |
| Checks | `npm run all` 的结果：哪一步、哪个方案、哪张图没过 | `/#/qa/all` |

- **画布**：拖空白处或滚轮平移，⌘/Ctrl + 滚轮缩放；`1` 整块放进窗口，`0` 回到 100%，`+`、`−` 放大缩小；`H` 抓手，按住空格也能拖。左上角换页，顶栏换画布。
- **不卡**：画板按离视野中心的远近排队载入，一次两张；载完 1.5 秒后，看不见的、缩得很小的（屏幕上窄于 360 像素）板定格（`src/board/embed.js` 停住 CSS 动画、SVG 动画、Web Animations 和 `requestAnimationFrame`），指着的、选中的、PLAY 的、开着 Tweaks 的照常动；单张铺满、看 Design System 或 Motion Deck 时，画布上的板全定格。只有画布上的板带 `embed.js`（地址加 `?va-embed=1`），单张铺满、单张打开、导出、自检都是画板原样。为的是 Pomelo 的「有板有眼」（WKWebView，和 Pomelo 共用一个主线程）不被一页十几张动着的板拖慢。
- **单张铺满**：双击画板，或点画板标题条上的 ⤢。`←`、`→` 换上一张、下一张，`Esc` 回到画布；Fill 是宽度铺满上下滚，Fit 是整张放进窗口。放大缩小：顶栏的 −、百分比（点一下回到 100%）、+，或 ⌘ / 触控板捏合加滚轮（在画板上面也行，以指着的地方为中心），`+`、`−` 键，`0` 是 100%，`1` 是 Fit；放大到比窗口大时上下左右都能滚。并排对比时两边一起变，同一个倍数。
- **Tweaks**：带参数的画板，标题条和铺满的顶栏上有 Tweaks 按钮。改了马上看到，不写回文件；要留下哪一组，点「复制参数」发给 Agent。改过的值记在这台电脑的浏览器里（`localStorage` 的 `dw.tweaks.<画布>`，每张板各记各的），刷新、下次打开还在，改过的板 Tweaks 按钮上有个点；「恢复默认」清掉。
- **活的画板**：能玩的画板标题条上有 PLAY，在画布上直接玩，`Esc` 停。
- **旧版本**：顶栏的「版本」列出本地存过的每个版本，点开只读地看当时的样子，「回到最新」回来。
- **改名、删除**：菜单里每块 Explore Deck、每份问卷后面，和左上角页菜单里每一页后面，都有「⋯」：改名…、删除…。改名只改名字（标题、页名），目录名和地址不变；删除是整块画布，或一页连它的画板、便签和批准记录，都挪进回收处 `canvases/.trash/`（不进 Git），下面的提示条上马上能撤销。改页之前存一个本地版本（「版本」里的「改名前」「删除前」）。看旧版本时没有这些。Pomelo 的「有板有眼」里也能做，两边跟着变。
  - **画板**：每张画板标题条上、单张铺满顶栏标题后面的「⋯」：改名…（只改 `canvas.json` 里的标题，文件名不变）、删除这张…（文件和它的批准记录进回收处，撤销后回到原来的页、原来的先后，`canvas.json` 和删之前一模一样；它的页那时已经删了就放到第一页）。有板有眼里看的就是这个界面，一样能做。重跑那一页的生成器会把板名改回去、删掉的板加回来（`canvases/README.md`「Explore Deck 的规矩」）。
  - **Design System、Motion Deck**：菜单里它们后面的「⋯」只有改名…，只改 bench 里显示的名字（菜单、顶栏、`/api/index`、有板有眼的左栏），记在 `bench/names.json`（进 Git）；方案的源、云端 Design System 的名字、`dw ds install` 记进画布的名字都不变。改过的多一项「回到原名」。
- **批准状态**：画板名字后面的小牌子是它的状态（待批、已批准、退回；标完以后板又改过会多「· 改过」），点开能批准、退回（可以写一句原因）、改回待批。单张铺满时顶栏也有「批准」「退回」。记在这块画布的 `db.json`（`review/<画板>`），Agent 用 `dw review` 读。
- **并排对比**：单张铺满时点「对比」，选另一张板，或这张在本地存过的某个旧版本，左右各一半；地址带 `&vs=<文件>` 或 `&vs=@<版本>`。`Esc` 先关掉对比。
- **深色、减弱动效**：顶栏（单张铺满时在它自己的顶栏）的两个开关管所有画板：带 `dark` 参数的画板直接改参数，其余的由 `src/board/emulate.js` 模拟系统的深色和「减弱动态效果」（画板会重新载入）。开关记在浏览器里，下次打开还在。
- **Design System**：菜单的第一类，打开就和 Claude 的 Design System 页一样看 Overview、Colors、Typography、Spacing……Components（能切明暗）、Assets、Files（分节的名字和云端一样用英文）。Colors 照云端分组：`color-` 后面那个词有别的 token 接着往下写的（`color-surface-cool` → surface，`color-surface` 也进去）自成一组，其余是 Palette。Files 和云端一样连资产一起数：构建产物里的文件加上 Assets 里的图（云端 Vermilion 是 165 = 50 + 115；云端「assets」文件夹 118 是 115 张图加 3 个 `README.md`）。内容直接读构建好的那份（`npm run build:ds` 之后刷新）。挂着 Design System 的画布，顶栏右边有它的名字，点一下过去。
- **Motion Deck**（原来叫「动效台」）：菜单的第二类，或地址 `/#/motion/<方案>?p=<零件>`。左边是 `schemes/<方案>/motion/` 里的零件（按档位分，开着时新加的零件点「重新读零件」），右边一次看一个：
  - 演示页就是逐帧导出用的那一页（`tooling/render/motion.mjs` 的 `partPage`，Pomelo 的底是 Design System 的 tokens、`bundle.css`、`bundle.js`），能切明暗、配色、减弱动效、放大。
  - 「播放」重新载入演示页，按 `capture.steps` 的时刻真的去做；拖时间轴（或 ←、→ 一帧，空格播放）是定格，和导出同一个算法：步骤和页面里的做法都直接用 `tooling/lib/motion-harness.mjs`。预览面板藏起来时 `requestAnimationFrame` 会停，定格不靠它，照样准；倒回到某一步之前会重新载入演示页（约一秒）。
  - 「导出 GIF」在服务端调 `renderPart`，写 `dist/<方案>/motion/<零件>/`，和 `npm run build:motion` 逐字节一样；下面是两种明暗的 GIF 和逐帧总览图（触发前一张，再每 3 帧一张）。没设 `VA_CHROMIUM`、`VA_BROWSER_CHANNEL` 时用 Chrome。
- **问卷页**：本地也能填，答案存进这块的 `db.json`，和云端是同一套写法。
- **Checks**：`npm run all` 上次的结果。先是每一步过没过、用了多久、点开看最后几十行输出；再按方案列出没过的、提醒的检查项（过了的收起来），说的是哪张图的有缩略图，点了看大图。「跑一遍」在后台启动 `tooling/qa/all.mjs`（几分钟，bench 停了它也照样跑完），跑的时候这一页和菜单那一行自己更新。Agent 在终端跑 `npm run all` 也写到这里（`dist/qa/run.json`、`dist/<方案>/qa-report.json`、`dist/qa/watermark.json`）。
- **断网也能看**：画板、问卷、Design System 页要从网上取的只有画布运行时的 React（jsDelivr）和 Google Fonts。本机服务把它们都改走 `/_cdn/`：第一次（联网时）取来存进 `bench/.cache/cdn/`（不进 Git），以后从这里给。React 这几个文件按画布运行时写的 sha384 核对，对不上不存；运行时文件本身一个字没改（页面里先放一句 `window.__resources`，是运行时自带的换地址的口子）。想一次取好，联网时跑：

  ```bash
  node bench/bin/dw.js offline
  ```

  它把所有画布、问卷、Design System 用到的取齐（用到的字所在的分块；`--all-glyphs` 连没用到的也取），最后说缺什么。导出的单文件 HTML 也断网能开：React 打进文件，Google Fonts 的样式直接写进页面、只留这张板用到的字的分块。
- 文件改了界面自己刷新。每张画板也能单独打开：`/c/<画布名>/<文件名>`；地址 `/#/<画布名>?page=<页>&board=<文件>` 直接打开某一页、某一张，`/#/ds/<方案>` 打开一个 Design System。

一条命令自检（每张板截图、零报错、版面，再跑画布自带的检查；截图在 `canvases/<画布名>/.shots/check/<画板名>.png`，画板名去掉 `.dc.html`）：

```bash
node bench/bin/dw.js check pomelo-explore
```

`dw check` 是在「减弱动态效果」下截终态，看不到动效。看动效用 `dw frames`：不减弱动效，按时间线截几帧（默认每 250ms 到 2000ms，最多 24 帧），拼成一张总览图 `canvases/<画布名>/.shots/frames/<画板名>.png`，每一帧在同名目录里；要先点一下才动的，加 `--click <按钮上的字>`（可写几次，依次点）。时间从画板画完（点完）那一刻算，误差一两百毫秒，只为看、不保证两次一样；要确定的导出用 `dw export`、`npm run build:motion`：

```bash
node bench/bin/dw.js frames pith-explore --board X3-B.dc.html --every 600 --until 4200
```

导出 PNG 或单文件 HTML（默认放 `canvases/<画布名>/.shots/export/`）：

```bash
node bench/bin/dw.js export pomelo-explore --board X4-Kit.dc.html --png --html
```

改名、删除、回收处（和界面里的同一套，`src/canvas/manage.js`）：

```bash
node bench/bin/dw.js rename <画布名> <新名字>
```

```bash
node bench/bin/dw.js rename <画布名> --page <页 id> <新页名>
```

```bash
node bench/bin/dw.js rename <画布名> --board <文件> <新标题>
```

```bash
node bench/bin/dw.js delete <画布名> [--page <页 id> | --board <文件>]
```

Design System、Motion Deck 在 bench 里的名字（不写新名字就回到方案自己的）：

```bash
node bench/bin/dw.js rename --ds <方案> <新名字>
```

```bash
node bench/bin/dw.js rename --motion <方案> <新名字>
```

```bash
node bench/bin/dw.js trash
```

`dw trash restore <id>` 放回一样，`dw trash empty --yes` 清空（清空就找不回了，提交过的还在 Git 里）。

把 Design System 挂到一块画布上：

```bash
node bench/bin/dw.js ds install <画布名> vermilion
```

起一套新方案（从 `schemes/_template/` 复制、填名字，再跑一遍 token 构建、质量检查、Design System 构建；`docs/architecture.md`「新方案怎么起」）：

```bash
node bench/bin/dw.js scheme new <方案名> --title <显示名>
```

看每张画板的批准状态（批准、退回只由站主在界面里做；Agent 只标「待批」）：

```bash
node bench/bin/dw.js review pomelo-explore
```

```bash
node bench/bin/dw.js review pomelo-explore --propose --note "第一版"
```

列出动效零件、导出一个（和 `npm run build:motion -- --scheme pomelo --part tooltip` 同一个函数；不写零件就是整个方案）：

```bash
node bench/bin/dw.js motion list pomelo
```

```bash
node bench/bin/dw.js motion export pomelo tooltip
```

读问卷存的答案：

```bash
node bench/bin/dw.js db <问卷名> survey/answers
```

## 给别的程序用

Pomelo 的「有板有眼」模块用这一套在它自己的窗口里启动、停止、看画布，不开浏览器。别的程序照这个用就行，都只在本机。

| 要做的事 | 命令行 | 开着的服务 |
| --- | --- | --- |
| 启动 | `dw serve [--port 4321] --json`：启动好了打一行 `{"ready":true,"url":…,"pid":…,"api":1}`，然后一直开着；端口上已经有一个时打 `{"ready":false,"running":true,…}` 并退出 | |
| 是不是它、在不在跑 | `dw status [--port] [--json]` | `GET /api/status` → `{"app":"visual-atelier-bench","api":1,"pid":…,"startedAt":…,"url":…,"root":…,"canvases":…,"stoppable":…}`；认 `app` 这个名字，不是它就当没在跑 |
| 停止 | `dw stop [--port] [--json]` | `POST /api/stop`，内容是 JSON（`{}` 就行，`Content-Type: application/json`）；只有 `dw serve` 启动的能停 |
| 列出全部（五类） | `dw list --json`（`sections`） | `GET /api/index`：`{ sections: [{ id, title, items: [{ name, title, sub, route, … }] }] }`，`id` 依次是 `ds`、`motion`、`explore`、`questionnaire`、`checks`（`api` 5 起；它只有一项，`route` 是 `/qa/all`，`sub` 说上次的结果）；`route` 是 `#` 后面那段，问卷另有 `page`（`/c/<名字>/`） |
| `npm run all` 的结果 | `npm run all` | `GET /api/checks`：`{ run, schemes: [{ scheme, at, items }], watermark }`；`POST /api/checks/run` `{}` 在后台跑一遍（已经在跑回 409）；跑的时候 `/api/events` 发 `checks`；`/_dist/<路径>` 给 `dist/` 里的图 |
| 批准状态 | `dw review` | `GET /api/review/<画布名>` → `{ reviews: { 文件: { status, note, at, by, changed } } }`；批准、退回只由站主在界面里点（界面里的按钮发 `POST`） |
| 改名 | `dw rename` | `POST /api/canvases/<画布名>/rename` `{ title }`；一页：`POST /api/canvases/<画布名>/page-rename` `{ page, name }`；一张画板：`…/board-rename` `{ file, title }`；Design System、Motion Deck 在 bench 里的名字：`POST /api/names/<ds\|motion>/<方案>` `{ title }`（空的就回到原名），`/api/index` 里改过的多一个 `schemeTitle`（方案自己的名字） |
| 删除、撤销 | `dw delete`、`dw trash` | `POST /api/canvases/<画布名>/delete` `{}`、`…/page-delete` `{ page }`、`…/board-delete` `{ file }`，回 `{ id, … }`；`POST /api/trash/restore` `{ id }` 放回，`GET /api/trash` 列出（`what` 是 `canvas`、`page` 或 `board`） |
| 列画布 | `dw list --json`（`canvases`） | `GET /api/canvases`（每块的名字、标题、`deck`、几张板、有哪几页）、`GET /api/canvases/<画布名>`（它的 `canvas.json`：画板、页、顺序） |
| 打开某一张 | `dw open <画布名> [--page 页] [--board 文件名] [--json]`：给出地址，不开浏览器 | 地址就是界面的地址：`/#/<画布名>?page=<页>&board=<文件>`（`board` 是单张铺满；问卷页是 `/c/<画布名>/`） |

- 把界面放进自己的页面（一个 frame）：换地址只改 `#` 后面那一段，界面自己换过去，不重新载入。界面每次换了画布、页或画板，会给外面那一页发一条消息 `{ source: "dw", type: "route", name, page, board, ds, motion, checks }`（`window.parent.postMessage`；看 Design System、Motion Deck、Checks 时 `name` 是 `null`，`ds` 或 `motion` 是方案名，`checks` 是 `true`），外面可以跟着更新自己的列表。
- 批准状态变了（站主在框里批准、退回，或者打开一块画布时读到的）会发 `{ source: "dw", type: "reviews", name, reviews }`，外面可以在自己的列表里给画板标上「待批、已批准、退回」。在别的源的页面里框着 bench 批准、退回都试过（`npm test`「approve and reject from inside another program's page」，Chrome）。
- 会改东西的请求（GET、HEAD 以外的都是）都用 JSON 发，`Host` 要是 `127.0.0.1:<端口>` 或 `localhost:<端口>`，带 `Origin` 的也要是这两个之一：别处的网页（包括把自己的域名指到 127.0.0.1 的）改不了画布。不肯时回 `{ code, message }`，`message` 是给人看的中文。
- 界面里改名、删除以后，给外面那一页发 `{ source: "dw", type: "changed" }`；文件被别处改了（`dw`、Agent、外面那一页自己）界面也发。外面收到就重新读清单。
- 接口有变动时 `api` 加一，现在是 `5`（2026-11-13：`2` 加了 `/api/index`、画布上的板会定格；`3` 加了改名、删除和回收处；2026-11-14：`4` 加了画板的改名删除、Design System 和 Motion Deck 的名字；2026-11-15：`5` 加了第五类 Checks、`/api/checks`、`/_cdn/`、`reviews` 消息）。用 `api` 1 的服务时没有 `/api/index`，照 `/api/canvases` 把画布当 Explore Deck、页面当 Questionnaire 就行（Pomelo 就是这样退回的）。旧的 `dw serve`（没有 `/api/status`）要先停掉再用新的。

## MCP（给 Agent 用）

`dw` 包成了一个 MCP 服务：stdio，只在本机，不加遥测，没装新的依赖（协议是手写的，`src/mcp/server.js`）。Agent 不用命令行也能用 bench。启动写 `bench/bin/dw-mcp.sh`：它切到自己所在的仓库（或 worktree）根目录，有 nvm 就换成 `.nvmrc` 写的 Node（22），再跑 `dw mcp`。

| 工具 | 做什么 |
| --- | --- |
| `list`、`canvas` | 五类的清单；一块画布的页和画板（位置大小、批准状态） |
| `scheme_new` | 起一套新方案：从 `schemes/_template/` 复制、填名字、跑一遍 token 构建、质量检查、Design System 构建（和 `dw scheme new` 一样） |
| `new_canvas`、`read_board`、`write_board`、`write_file` | 新建画布；读、写画板（写的时候在 `canvas.json` 登记，`page` 写一个新 id 就新建这一页） |
| `check` | 自检：截图、报错、版面、画布自带的 lint；`image` 为 true 时把截图一起给回来，Agent 能看见 |
| `frames` | 看动效：一张板不减弱动效、按时间线截几帧，拼成总览图；`click` 先点按钮；`image` 为 true 时把总览图给回来 |
| `export` | PNG、单文件 HTML（断网能开） |
| `open` | 给站主看的地址（服务换过端口就写同一个 `port`） |
| `rename`、`delete`、`trash` | 改名（画布、页、画板、Design System 和 Motion Deck 在 bench 里的名字）；删除进回收处、放回 |
| `ds_list`、`ds_install` | Design System |
| `db_get`、`db_set` | 页面存储（问卷答案在 `survey/answers`） |
| `review`、`review_propose` | 批准状态；Agent 只能标「待批」 |
| `serve_status`、`serve_start`、`serve_stop` | 看画布的服务。几份同时开（主工作区和 worktree）各用各的 `port`；端口上开着的是别的仓库或 worktree 的 bench 时，说换个端口，不当成自己的、也不停它 |
| `checks` | `npm run all` 的结果，`run` 为 true 时再跑一遍 |
| `dw` | 其余命令行能做的（拉回、发回、版本、动效导出、断网缓存……），照 `dw <args>` 跑，给回输出 |

只读的工具（`list`、`canvas`、`read_board`、`open`、`ds_list`、`db_get`、`review`、`serve_status`）标了 `readOnlyHint`，会改东西的没标，会删、会覆盖的标了 `destructiveHint`。

**配置都在仓库里、进 Git**（站主 2026-11-15 定：三家都用项目级配置），用户目录里的配置不用改。三份都不写绝对路径，所以在新的 worktree 里打开，连的就是那个 worktree 自己的 `dw`、自己的 `canvases/`（要先在那里 `npm ci`，`check`、`export` 才跑得动）。Grok、Muse 也读 `.mcp.json`，不用另写（2026-11-16 Peck Phase 13 试过）。**每家第一次在一个文件夹里用，都要站主点一次「信任」或「批准」**，各家记在自己的用户目录里，这一步不进仓库：

| Agent | 文件 | 什么时候读 |
| --- | --- | --- |
| Claude Code | `.mcp.json` | 在仓库里开 Claude Code，问要不要用 `dw` 时同意。没批过时 `claude mcp get dw` 写「Pending approval」，非交互（`claude -p`，Peck 就是这样起它的）**不会**问、直接不连；在那个文件夹里开一次 Claude Code 点同意，或者在不进 Git 的 `.claude/settings.local.json` 里写 `{"enabledMcpjsonServers": ["dw"]}`，之后 `claude mcp get dw` 是 Connected。新 worktree 要再批一次 |
| Grok | `.mcp.json`（Grok 当成兼容来源读） | 文件夹要被信任：第一次在这里开 `grok` 点信任（或 `/hooks-trust`），记在 `~/.grok/trusted_folders.toml`；信任按仓库算，主工作区信任了，它的 worktree 也算。`grok mcp list` 只列它自己的 TOML，看不到 `dw`；看连上没有用 `grok mcp doctor`（`.mcp.json 1 server`、25 个工具）或 `grok inspect --json`（`projectTrusted`、`mcpServers`）。工具名是 `dw__<工具>` |
| Muse | `.mcp.json`（`muse mcp add --project` 写的也是这份） | 工作区要被信任：第一次在这个文件夹里开 `muse`，选「1 Trust and continue」，记在 `~/.config/muse/trust.json`。没信任时 `muse mcp list` 写「no project MCP servers will load」，非交互的 `muse exec`、`muse serve` 也不读。每个 worktree 是单独的工作区，要各点一次 |
| Codex | `.codex/config.toml`（`[mcp_servers.dw]`） | 只在这个目录被设为「信任」时：第一次在这里开 Codex、问要不要信任时点同意，或用户配置 `~/.codex/config.toml` 里给这个路径写 `trust_level = "trusted"`（这台机器已经写了；这个仓库的 worktree 也算信任，11-15 试过）。同一项两边都写了，项目里的优先。`codex mcp add` 只写用户配置，项目级的只能改文件 |
| Antigravity（Argon） | 工作区插件 `.agents/plugins/dw/`：`plugin.json` 加 `mcp_config.json`（顶层 `mcpServers`） | 打开这个仓库（或 worktree）当工作区时，工作区 `.agents/plugins/` 里的插件默认就开着。它**不读**工作区根上的 `.agents/mcp_config.json`（2026-11-15 Phase 4 Argon 查出来的），工作区里的 MCP 只能放进插件。全局的在 `~/.gemini/config/mcp_config.json`（网上有些教程写的 `~/.gemini/antigravity/mcp_config.json` 是旧路径），这里不用它。命令行的 `agy`（`agy acp` 也一样）同样读这个插件，服务器名是「插件名_服务器名」`dw_dw`，用 `call_mcp_tool` 调；它的系统提示里的 MCP 摘要可能漏列 `dw_dw`，说明里点名 `dw_dw` 它就找得到（2026-11-16 试过） |

Codex、Antigravity 那两份的命令是 `/bin/sh -c 'exec "$(git rev-parse --show-toplevel)/bench/bin/dw-mcp.sh"'`：从仓库里哪一层目录启动都找得到根目录（Antigravity 的 `cwd` 写 `.`：插件里相对的 `cwd` 照它的文档按插件目录算，在插件目录里跑这条命令试过，25 个工具都在；插件的工具名可能带上前缀）。Codex 不问就只用只读的工具，会改东西的照它的批准设置问人。

**Peck**（站主的 Harness，`personal-cli-studio/peck`）：Peck 用 CLI 干活时，上面几家照各自的规矩读这个仓库的配置；Peck 自己的循环（API 模型）现在不读项目里的 `.mcp.json`，要在 Peck 的「设置 → MCP」里加一台：名字 `dw`，命令写这个仓库（或 worktree）里 `bench/bin/dw-mcp.sh` 的完整路径，参数空着。会删改的工具（`write_board`、`delete`……）Peck 每次都问；`check` 带图回来时，能看图的模型看得见截图。

看连上没有：Codex 里 `codex mcp list` 有 `dw` 这一行（命令行的 codex 在 `/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex`）；Antigravity 在「Additional Options（…）> MCP Servers」里看得到 `dw` 和 25 个工具；Claude Code 里 `/mcp`。

**自己试一下**（站主、Agent 都能跑，在仓库根目录）：在终端里起一个服务、问它有几个工具：

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"me","version":"1"}}}' '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | bench/bin/dw-mcp.sh
```

调一个工具（例：`list` 列出全部画布）：把第二行换成 `'{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list","arguments":{}}}'`。结果在 `result.content[0].text` 里，是一段 JSON 字符串：末尾接 `| tail -1 | jq -r '.result.content[0].text'` 取出来。

画布改到别的目录（测试、试跑）：环境变量 `DW_CANVASES=<目录>`，配置里写进 `env`。

## 目录

| 路径 | 内容 |
| --- | --- |
| `bin/dw.js` | 命令行，`node bench/bin/dw.js help` 列全部 |
| `src/canvas/` | 格式、版本、云端往返、导入、页面存储 `db.js`、批准状态 `review.js`、改名删除和回收处 `manage.js`（画布、页、画板，还有 Design System、Motion Deck 的名字）、自检 `check.js`、导出 `export.js` |
| `src/ds/` | 读构建好的 Design System、挂到画布上 |
| `src/server/` | 预览服务（含给别的程序用的 `/api/status`、`/api/index`、`/api/stop`）、五类的清单 `catalog.js`、`npm run all` 的结果 `checks.js`、断网缓存 `offline.js`、无头截图 |
| `src/mcp/` | MCP 服务 `server.js`（`dw mcp`，启动用 `bin/dw-mcp.sh`） |
| `src/scheme/` | `dw scheme new`：从 `schemes/_template/` 起新方案、跑一遍 tooling 的检查 `new.js` |
| `src/board/` | 画布界面，`dw serve` 的首页：五类的菜单、无限画布、多页、便签、单张铺满和并排对比、Tweaks、旧版本、批准状态、全局的深色和减弱动效、排队载入和定格；`ds.js` 是 Design System 页；`motion.js` 是 Motion Deck；`checks.js` 是 Checks；`claude-local.js` 是本地版的 `window.claude`（页面存储 `db` 和 `user`）；`emulate.js` 给画板模拟系统的明暗和减弱动效；`embed.js` 让画布上的板能定格。纯 HTML、CSS、JS，不用构建 |
| `src/motion/` | Motion Deck 的服务端：列零件、出演示页、导出（都调 `tooling/render/motion.mjs`，不另写一份） |
| `src/bundler/` | Claude 导出包的解包 |
| `src/utils/config.js` | `BENCH_ROOT`（本目录）和 `REPO_ROOT`（仓库根目录），读 `config.json` |
| `config.json` | 画布目录（`../canvases`）、运行时位置、端口、Chrome 位置 |
| `.cache/` | 不进 Git：`cdn/` 是断网缓存（React、Google Fonts），`serve.log` 是 MCP 启动的服务的输出 |
| `names.json` | 站主在 bench 里给 Design System、Motion Deck 起的名字（没改过就没有这个文件）；`src/canvas/manage.js` 读写 |
| `vendor/claude-design/` | Claude 画布运行时的副本和校验和，不是我们写的，不手改。云端的画布类型换了运行时（`dw pull`、`verify`、`publish` 读到清单时会提示），就对照 sha256 整份换掉、更新 `runtime.json`、跑 `npm test` |
| `bridges/claude/` | Claude「导出单文件 HTML」的外壳模板和钩子：`dw import` 解包、`dw export --html` 打包都用它 |
| `test/` | `npm test`，只在临时目录里跑，不碰真的 `canvases/`、`dist/`（Motion Deck 的导出写进临时目录，和 tooling 直接导出的逐字节比）；`test/tools/` 是要开着 `dw serve` 跑的检查：`compare-cloud.mjs` 本地和云端逐张对比，`check-tweaks.mjs` 逐个切 Tweaks 选项 |

## 别处

- 规矩：根目录的 `CLAUDE.md`（`AGENTS.md` 指向它）
- 做到哪了：根目录的 `ROADMAP.md`
- 拉回和发回、换账号：`docs/cloud.md`
- 画布的约定：`canvases/README.md`
- 这个引擎是怎么来的：`history/vw1-plan.md`（VW1）、`history/v1-plan.md`（到 v1.0 的 Phase 1–3）
