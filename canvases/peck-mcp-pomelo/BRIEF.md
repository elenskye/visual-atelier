# Pomelo 一轮：前十个模块图标 + 首页（Atelier MCP 测试）

这是一次 **Atelier MCP 的接口测试**（Peck Phase 13）：几家 Agent 用同一份说明各做一版，都在这一个 worktree 里，各写各的画布。说明只有这一份，做的时候照它来。

## 规矩

- **画布的事全部用 MCP 服务 `dw` 的工具做**：`list`、`canvas`、`new_canvas`、`ds_list`、`ds_install`、`read_board`、`write_board`、`write_file`、`check`、`export`。不要直接写 `canvases/` 下的文件，也不要在终端里跑 `node bench/bin/dw.js`。读仓库里的说明、方案文件可以直接读。
- **只动自己的那块画布** `canvases/peck-mcp-<你的名字>/`（名字见下面「交付」）；仓库里别的文件一律不改，不 `git commit`，不起 `dw serve`。
- 先读：`schemes/pomelo/DESIGN.md`（Pomelo 的视觉规则，必读）、`schemes/pomelo/marks/README.md`、`canvases/README.md`（画板的写法）。
- 字用中文；数据全是编的（模拟数据），不要用任何真实的人名、账号、地址。

## 做什么

画布 `peck-mcp-<你的名字>`，标题「Pomelo · <你的名字>」，挂上 Design System `pomelo`（`ds_install`），两张画板放在同一页「EX1：Pomelo 一轮」：

1. **`icons.dc.html` · 前十个模块的图标**（宽 1200 左右）。Pomelo 贴纸簿默认顺序的前十个模块，按两个分类排两行，每个一格：贴纸（大约 96 见方）+ 下面的中文名。
   - 日常（薄荷）：一步一步 `todo`、念念不忘 `notes`、来日方长 `days`、钱来钱往 `finance`、出门走走 `packing`
   - 兴趣（樱粉）：摸鱼读读 `books`、好奇看看 `films`、随意画画 `drawing`、呦呦漫游 `site`、有板有眼 `canvas`
   - 照 DESIGN.md「手画的框和线」「贴纸」的画法**自己画一版**（墨线描边、填色错开一点、一圈白边、轻投影、歪一点）。`schemes/pomelo/marks/modules/<id>.svg` 是现在用的那一版，可以看来对齐风格，但不要原样复制它的路径。
2. **`home.dc.html` · 首页（桌面）**（宽 1200、高 800 左右）。照下面「首页」画一屏，带模拟数据。

画完对每张板跑 `check`，有报错、出框、字被裁就改到全过；最后 `export` 两张 PNG。

## 首页（左边那一屏）

一张桌面（Design System 里的桌面色和纹理），上面摆便签，每块都歪一点、贴一两条胶带：

- 顶栏（高 51）：左起红黄绿三个点、柚子、‹ ›；右边日期小纸条、找东西、设置。
- 问候语（46 粗）「下午好」，后面淡墨「今天也慢慢来。」
- 今日简报（右上角贴一张柚子贴纸）：两三句话。
- 今天的待办（横线卡）：4～5 条，勾了的划掉。
- 快到的日子：3 条（「妈妈生日 · 5 天」这种），第一个的天数用荧光笔划一下。
- 在读在看：两三本书、一部片。
- 资产小票：几行账户和合计。
- 念念不忘一条（黄便签）。
- 最下面一排「常用」：薄荷胶带写「常用」，后面五个置顶模块的贴纸（56 见方，各歪一点，下面名字：一步一步、念念不忘、投石问路、Seeker、柚子），最后是手画圆框里的「贴纸簿」。

规则都在 DESIGN.md：纸、胶带、贴纸可以歪，**字永远是正的、清楚的**；一张卡最多两条胶带、一张贴纸；分类色只当圆点、图表和贴纸，不写字。

## 交付

- 你的名字：Codex 写 `codex`，Grok 写 `grok`，Muse 写 `muse`，Antigravity 写 `agy`，Claude Code 写 `claude`，Peck 循环写 `peck-<模型简称>`（比如 `peck-deepseek`、`peck-sonnet`）。
- 最后在回答里写：画布名、两张板过没过 `check`、导出的 PNG 在哪、用了哪些 `dw` 工具（每个调用了几次）、卡在哪里。
