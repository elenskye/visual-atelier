---
name: design-loop
description: 在 visual-atelier 里新建、修改、检查一块画布或一张画板，并和 Claude 云端画布同步。用于写或改 canvases/<画布名>/ 下的画板、挂 Design System、跑 dw check 自检、导出 PNG 或单文件 HTML、把成稿拉回本地或发回云端。
---

# design-loop

## 用途

在 `canvases/<画布名>/` 里做画板：写、看、检查、和云端同步。**画什么、怎么判断好不好看 `skills/design-craft/SKILL.md`**：开始一轮探索、写简报（`design-craft/brief-template.md`）、评估几家的版本之前先读它。规矩在仓库根的 `CLAUDE.md`（`AGENTS.md` 指向它），拉回和发回的细节在 `docs/cloud.md`。

**在「第二条线」的任务里**（同一份说明几家各做一版）：只在站主建好的 worktree 和自己的分支上做，bench 用自己的端口，规矩在 `docs/sessions.md`「第二条线」。新方案用 `dw scheme new`（MCP `scheme_new`）起。

**有 `dw` 这个 MCP 服务就用它**（三家的配置都在仓库里：`.mcp.json`、`.codex/config.toml`、`.agents/plugins/dw/`，工具清单在 `bench/README.md`「MCP」；在 worktree 里打开，连的就是那个 worktree 自己的画布）。下面每一步都有对应的工具：`list`、`canvas` 看有什么，`new_canvas`、`write_board`（顺带登记 `canvas.json`、新建页）写，`check`（`image: true` 把截图给回来）自检，`export` 导出，`ds_install` 挂 Design System，`review_propose` 标待批，`open` 给站主地址，`serve_start` 开服务；别的（拉回、发回、版本）用 `dw` 工具照命令行跑。没有 MCP 时照下面的命令行做，结果一样。

## 输入

- 画布名（小写字母、数字、连字符）。探索和审看都加进这个方案的 Explore Deck（`<方案>-explore`）当一页，页名、留哪些板照 `canvases/README.md`「Explore Deck 的规矩」（探索全留，优化每项只留最新的一份）；方案还没有 Explore Deck 才新建：`node bench/bin/dw.js new <画布名> --title <标题>`，它一次建好 `README.md`、`cloud.json`、`project/canvas.json`、`project/Main.dc.html`。命令都在仓库根目录、Node 22 下跑（`docs/sessions.md`「新会话接手」：非交互的 shell 要先 `source ~/.nvm/nvm.sh && nvm use`）。
- 要用的视觉方案：读 `schemes/<方案>/DESIGN.md`，数值从它的 `tokens/` 取。有生成器的画布，取用仓库里的东西一律走 `canvases/_lib/root.mjs`。
- 方案有 Design System 的（`node bench/bin/dw.js ds` 列出来），可以挂到画布上直接用它的 token 和组件样式，见步骤 2。

## 步骤

1. **读**：`canvases/<画布名>/README.md`、`project/canvas.json`。站主要求和云端同步、而且有云端那份的（`cloud.json` 的 `targets` 不空），云端可能被站主改过：先 `list_files`，`node bench/bin/dw.js pull <画布名> --listing <清单>`，有改动先拉回。平时（站主没要求）不碰云端，跳过这一步（根目录 `CLAUDE.md`「画布与 bench」）。
2. **写**：画板是 `project/<文件>.dc.html`，格式照 Claude 的 Design 类型（`<script src="./support.js">`、`<x-dc>`、`data-props` 里的 Tweaks）。新画板同时在 `canvas.json` 的 `boards` 和 `order` 里登记，`w`、`h` 和 `$preview` 一致。有生成器的画布改生成器，不手改 `project/`。
   - **探索页（EX）和优化页（R）门槛不一样**（`canvases/README.md`「Explore Deck 的规矩」两档门槛）：探索页可以直接手写画板、用 Google Fonts、APCA 只提示；优化页和建方案才要生成器、逐字节一致、字体子集、APCA 全过。
   - 挂 Design System：`node bench/bin/dw.js ds install <画布名> <方案>`。它把 `tokens.json`、`tokens.css`、`components/bundle.css` 复制进 `project/ds/<名字>/`、在 `canvas.json` 记一条，并打印画板要加的几行：`<link rel="stylesheet" href="ds/<名字>/tokens.css">` 和组件样式放在 `<head>` 里 `support.js` 那行后面，Google Fonts 的 `<link>` 放进 `<helmet>`。之后画板里用 `var(--color-page)` 这类变量和 Design System 的类名，不抄数值。带 `components/bundle.js` 的（Pomelo 的手画零件）它也打印引它的那行，用法看那份 Design System 的 `README.md`。组件的类名和写法直接读文件：`schemes/<方案>/design-system/README.md`（「使用这套系统」一节）和 `components/<组件>/README.md`、`preview.html`（预览就是标准写法，照抄类名，比如 Vermilion 的描边按钮是 `.button-link`、页面外层是 `.vm-page`）；挂上以后 `project/ds/<名字>/tokens.css` 列着全部变量，`components/bundle.css` 列着全部类名。开着 `dw serve` 时 `http://127.0.0.1:4321/#/ds/<方案>` 是同样的内容，带预览。
3. **检查**：

   ```bash
   node bench/bin/dw.js check <画布名>
   ```

   要全部通过（只查一张加 `--board <文件>`）。`dw check` 截的是减弱动效下的终态；有动效的板再跑 `node bench/bin/dw.js frames <画布名> --board <文件>`（MCP `frames`），看按时间线截的总览图（`.shots/frames/<画板名>.png`），要先点一下才动的加 `--click <按钮上的字>`。它在「减弱动态效果」下按每张板的宽高打开，查报错、宽高为 0 的容器、内容或字出了画板、字被容器裁掉、图片没出来，再跑画布自带的 `*/lint.mjs`。故意出框或藏起来的字给元素加 `data-nolint`。然后用看图工具看截图：`canvases/<画布名>/.shots/check/<画板名>.png`（画板名去掉 `.dc.html`，不进 Git）：排版、对比、留白。页面打不开（沙箱拦了 Chrome 或端口）时它报「打不开页面」或「报错页」，先放行再跑。
4. **给站主看**：开 `node bench/bin/dw.js serve`，给站主地址 `http://127.0.0.1:4321/#/<画布名>?page=<页>&board=<文件>`。画布上缩得很小、在视野外的板会定格（指着、选中、PLAY 时才动），要看动效就放大或指着它。站主在 Tweaks 里挑好的参数会复制给你，照着改源，Tweaks 本身不写回文件。
5. **存版本**：`node bench/bin/dw.js snapshot <画布名> --label <说明>`。
   - 改名、删整块画布、一页或一张画板：`node bench/bin/dw.js rename …`、`dw delete …`（`--board <文件>` 是一张画板；都进回收处 `canvases/.trash/`，`dw trash` 放回），和站主在界面里做的同一套；页名以 `canvas.json` 为准，生成器别盖掉站主改的名字；站主在界面里改过板名、删过板的页，重跑生成器之前先把改动写进生成器。
6. **导出**（要交 PNG 或单文件 HTML 时）：`node bench/bin/dw.js export <画布名> [--board <文件>] --png --html`，默认放 `canvases/<画布名>/.shots/export/<画板名>.png`。单文件 HTML 断网也能打开（React 和这张板用到的字体都打进去；先要联网取过一次，`node bench/bin/dw.js offline` 一次取齐），导出时说「没取到，打开时要联网」的就是还缺的。
7. **发回**（只在站主明确要求时）：先照 `docs/cloud.md`「账号」确认云端那份是你这个账号的，再照「发回」做，最后 `--record` 核对。

## 输出

- `canvases/<画布名>/` 下改过的文件；本地版本在 `.versions/`。
- 交付时说明：改了哪些画板、截图看过哪些、哪些没目视（动效、交互）。

## 验证

- `dw check` 全部通过，截图看过。
- 发回后 `node bench/bin/dw.js verify <画布名> --listing <新清单>` 全对。
