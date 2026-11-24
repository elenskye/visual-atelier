# CHANGELOG · 2026-11（归档）

根目录 `CHANGELOG.md` 里 VL1 收官、VL2、两个仓库合并、Dawn Plan 这一段的逐条记录，2026-11-12（v1.0 · Phase 0）原样移来，内容没有改。**只是历史，不是规则**：文中的「`ROADMAP.md`」「下一步」「还没做」都停在当时；摘要表在 `CHANGELOG.md`，现在的状态看 `ROADMAP.md`。

文中提到的 `bench/history/vw1-plan.md` 现在是本目录的 `vw1-plan.md`。

2026-11-15（到 v1.0 计划 Phase 2、3 验收以后）又原样移来 11-12～11-15 仓库自己的八段（计划分开、Phase 0–3），排在最前面；同一时期 Pomelo 的会话写的两段留在 `CHANGELOG.md`。那几段说的「`ROADMAP.md` 的 Phase N」现在在本目录 `v1-plan.md`。

2026-11-16（Phase 4 验收以后）又原样移来 11-15 仓库自己的两段（Phase 2、3 验收和 Phase 3 Refine，Phase 4），排在最前面。

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
