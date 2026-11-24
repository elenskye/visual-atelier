# Peck MCP · Pomelo 一轮

Peck Phase 13（2026-11-16）的 Atelier MCP 接口测试：同一份说明 [`BRIEF.md`](./BRIEF.md)，几家 Agent 都在 Peck 里发任务、只用 `dw` 的 MCP 工具，各画一版 Pomelo 前十个模块的图标和首页（桌面）。全部是模拟数据。

当时每家写自己的一块画布 `canvases/peck-mcp-<名字>/`（在 worktree `visual-atelier-peck`、分支 `agent/peck/mcp-pomelo` 上）。11-16 并成这一块，进了 `main`；画板内容没改，只改了文件名、附带脚本的名字和画板标题，原来那几块和那份 worktree 都删了。`BRIEF.md` 里写的画布名、「只动自己那块」是当时的说法。

本地画布，源在 `project/`，没有生成器，直接改 `project/` 里的文件。挂了 Design System `pomelo`（`project/ds/pomelo/`，六家挂的是同一份，逐字节一样）。不做评比：Benchmark 留到 Peck v1.0 发布前。

## 一页「EX1：六家各一版」

一行一家，左边图标（`<名字>-icons.dc.html`，宽 1200），右边首页（`<名字>-home.dc.html`，1200 × 800）。

| 行 | 谁 | 画板 | 结果 | 花费 |
| --- | --- | --- | --- | --- |
| 1 | Peck 循环 · DeepSeek V4.1 Flash | `peck-deepseek-*` | 两张过 `check`、导出；撞了两次 40 轮上限，点「继续」接着做 | $0.143 |
| 2 | Peck 循环 · Claude Sonnet 5.5 | `peck-sonnet-*` | 两张过 `check`、导出，一次做完；看了 `check` 的截图才发现胶带被盖掉 | $0.757 |
| 3 | Codex | `codex-*` | 第一次 MCP 写入全被拒（Peck 不认它的审批请求，已修）；重跑后两张过 `check`、导出 | 订阅，周额度约 6% |
| 4 | Grok | `grok-*` | 两张过 `check`、导出；8 种工具 16 次调用 | 订阅 |
| 5 | Antigravity | `agy-*` | 两张过 `check`、导出；11 种工具 | 订阅 |
| 6 | Muse | `muse-*` | 两张写完、过 `check`；导出 PNG 前 5 小时额度用完 | 订阅 |

Claude Code 这一轮只做了只读的连通检查，没有画（站主平时要用）。

附带的文件：

- `agy-pomelo-art.js`（原 `pomelo-art.js`）、`grok-marks.js`（原 `marks.js`）：各自两张板引的手画贴纸脚本。
- `codex-sticker-art.json`（原 `sticker-art.json`）：Codex 十张贴纸的几何，用 Pomelo 的 `line.P`、`sticker.svg` 和 `tokens/handmade.json` 的 sticker 参数生成，最终的 SVG 已内联进画板，板不引它。Codex 首页的柚子、投石问路、Seeker 用的是方案里的正式 SVG，别的模块贴纸是它画的。
- Sonnet 那块原来还有一张没动过的 `Main.dc.html` 和一份没有板引用的 `fix.css`，没搬过来。

DeepSeek 那一版点出 Pomelo Design System 的一个问题：`Pomelo.hand.tape()` 在挂了 DS 的画布上默认透明（只认 Pomelo App 里才有的 `--tape-a0` 这类变量），归 Pomelo 的会话。

## 看、检查

看：`node bench/bin/dw.js serve`，打开 http://127.0.0.1:4321/#/peck-mcp-pomelo?page=ex1（单看一张加 `&board=<文件>`）。

自检：`node bench/bin/dw.js check peck-mcp-pomelo`，截图在 `canvases/peck-mcp-pomelo/.shots/check/<画板名>.png`。

导出：`node bench/bin/dw.js export peck-mcp-pomelo --board <文件> --png`，放 `canvases/peck-mcp-pomelo/.shots/export/`。

云端：没有。
