# 到 v1.0 的计划 · Phase 4 第二条线（2026-11-15～11-16）

**只是历史，不是规则。** 规矩在 `CLAUDE.md`「第二条线」，结果摘要在 `CHANGELOG.md`。11-16 站主挑完以后，临时画布 `canvases/p4-format-icons/`、验收问卷 `canvases/v1-phase34-questionnaire/`、两条分支 `agent/codex/format-icons`（`b28c553`）、`agent/argon/format-icons`（`6e7bb6c`）都删了；临时画布和问卷在提交 `b06c1c6` 里还能看到，两条分支的内容只在这份记录和那块临时画布里（两家的几何、四张原板都原样复制过）。

## 站主挑的（2026-11-16）

Claude 那版（方案 `icons.mjs` 第 3 批）换掉 8 个：删除线、互链、分隔线、折叠换成 Codex 的；高亮、编号、提示框、流程图换成 Argon 的。其余 11 个不动。换方案里的图标归 Pomelo 的会话做（写在 Pomelo 的 `docs/atelier-sync.md`「8」）。

下面是这 8 个照 `icons.mjs` 的写法（`name`、`for`、`batch` 取方案里原来那一项，几何原样取自两家的提交；Argon 的字段原来叫 `lucide`、`group`，这里改回 `for`）。种子由 id 算：用原来的 id，画出来和站主看的对比板一模一样。

```js
  strikethrough: { name: '删除线', for: ['Strikethrough'], batch: 3, d: 'M17.8 6.5 C14.8 2.8 6.1 3.7 6.2 7.7 Q6.2 9.2 8.2 9.9 M15.7 14.5 C21.7 18.7 11.1 22.7 6 17.8 M3 12.4 Q12 12.6 21 11.9' }, // Codex b28c553
  highlighter: { name: '高亮', for: ['Highlighter'], batch: 3, d: 'M14 3.5 L20 9.5 L12.5 17 L6.5 11 Z M8 12.5 L4.5 16.5 L7.5 18.5 L11 15.5 M3.8 20.5 L18.5 20.5' }, // Argon 6e7bb6c
  'list-ordered': { name: '编号', for: ['ListOrdered'], batch: 3, d: 'M4.5 5.6 L6 4.4 L6 9.4 M4.2 15.1 C4.2 13.9 5.1 13.3 6.2 13.3 C7.3 13.3 7.9 14 7.9 14.9 C7.9 15.9 7 16.6 5.6 17.6 L4.2 19.4 L8.1 19.4 M11.5 6 L20 6 M11.5 12 L20 12 M11.5 18 L20 18' }, // Argon 6e7bb6c
  wikilink: { name: '互链', for: ['Brackets'], batch: 3, d: 'M4.9 5.3 L2.7 5.3 L2.7 18.7 L4.9 18.7 M10 5.3 L7.3 5.3 Q7.5 12 7.3 18.7 L10 18.7 M14 5.3 L16.7 5.3 Q16.5 12 16.7 18.7 L14 18.7 M19.1 5.3 L21.3 5.3 L21.3 18.7 L19.1 18.7' }, // Codex b28c553
  callout: { name: '提示框', for: ['MessageSquareWarning'], batch: 3, d: 'M4.5 20.5 L4.5 6 C4.5 4.6 5.6 3.5 7 3.5 L17.5 3.5 C18.9 3.5 20 4.6 20 6 L20 15 C20 16.4 18.9 17.5 17.5 17.5 L8 17.5 Z M12.25 7 L12.25 10.6', dots: [[12.25,14.1,1.05]] }, // Argon 6e7bb6c
  divider: { name: '分隔线', for: ['SeparatorHorizontal'], batch: 3, d: 'M3 12.2 Q11.9 12.6 21 11.9 M9 5.3 L12 7.6 L15 5.2 M9.1 18.7 L12 16.4 L15.1 18.6' }, // Codex b28c553
  flowchart: { name: '流程图', for: ['Workflow'], batch: 3, d: 'M7 10.5 L7 15.3 C7 16.5 8 17.5 9.2 17.5 L13.5 17.5', rect: [[3.5,3.5,7,7,1.8],[13.5,13.5,7,7,1.8]] }, // Argon 6e7bb6c
  fold: { name: '折叠', for: ['ListCollapse'], batch: 3, d: 'M3.4 6.1 L6.2 9.1 L9 6.1 M3.4 17.9 L6.2 14.9 L9 17.9 M13 6 Q17.1 6.1 21 5.9 M13 12.1 L21 12 M13 18.1 L19.5 17.9' }, // Codex b28c553
```

## 给两家的说明（原文）

给 Codex、Argon 的同一份说明（到 v1.0 计划 Phase 4，站主 2026-11-15）。Claude 那一版已经画过、进了 Pomelo 方案；这次你独立画一版，最后由 Claude 把三版并排评估，站主挑。

### 0. 先读、先跑

1. 你在站主建好的 worktree 里（`~/Documents/GitHub/visual-atelier-<codex|argon>`，分支 `agent/<codex|argon>/format-icons`）。`git branch --show-current` 对不上就停下问站主。
2. 读 `CLAUDE.md`（「新会话接手」「第二条线」「画布与 bench」「核心约定」）、`canvases/README.md`、`skills/design-loop/SKILL.md`、`skills/questionnaire/SKILL.md`、`schemes/pomelo/DESIGN.md`（§4 图形语言、§6 标志与图标）。
3. 冷启动，只照文档：`npm ci`、`VA_BROWSER_CHANNEL=chrome npm run build`、`npm test` 全过。卡住的地方记下来，交付时写。
4. 调一次 `dw` 的 MCP 工具 `list`。没有这个工具：照 `bench/README.md`「MCP」查；查不出就用命令行 `node bench/bin/dw.js`，交付时写清楚。

### 1. 要画的

Pomelo 的新模块「见字如面」（写文章和长笔记）要 19 个界面小图标。格式条浮在正文上（一直在，或选中文字时才出来）；正文栏窄了，一部分收进「更多格式」。

| id | 名字 | 用在哪 | 替换的 Lucide |
| --- | --- | --- | --- |
| `heading` | 标题 | 格式条（点了换级别） | Heading |
| `bold` | 加粗 | 格式条 | Bold |
| `italic` | 斜体 | 格式条 | Italic |
| `underline` | 下划线 | 格式条 | Underline |
| `strikethrough` | 删除线 | 格式条 | Strikethrough |
| `highlighter` | 高亮 | 格式条（点开选颜色） | Highlighter |
| `list` | 列表 | 格式条（再窄收进更多格式） | List |
| `list-ordered` | 编号 | 格式条 | ListOrdered |
| `wikilink` | 互链（链到别的笔记） | 格式条（窄了收进更多格式） | Brackets |
| `code-block` | 代码块 | 更多格式 | SquareCode |
| `table` | 表格 | 更多格式 | Table |
| `callout` | 提示框 | 更多格式 | MessageSquareWarning |
| `divider` | 分隔线 | 更多格式 | SeparatorHorizontal |
| `sigma` | 公式 | 更多格式 | Sigma |
| `flowchart` | 流程图 | 更多格式 | Workflow |
| `footnote` | 脚注 | 更多格式 | Superscript |
| `fold` | 折叠（全部折起来 / 展开） | 更多格式 | ListCollapse |
| `tag-off` | 没标签 | 左栏「没标签的」 | TagOff |
| `minimize-2` | 缩小（退出专心写） | 专心写时右上角 | Minimize2 |

### 2. 画法

- **和 Pomelo 已有的界面小图标是同一家**：24 格，一笔单线 2、抖动 0.32，线跟着文字颜色（`currentColor`），没有填色和白边（`DESIGN.md` §4）。避开它的反关键词，尤其「通用线条图标感」。先看已有的：`schemes/pomelo/marks/icons/` 里生成好的 SVG，Pomelo Explore「R3：界面小图标」一页。
- **几何的写法和 `schemes/pomelo/marks/icons.mjs` 一样**（`d` 只用绝对的 `M L C Q Z`，另有 `o`、`rect`、`dots`、`name`、`for`），**画法和它的 `uiIconSvg` 一样**（`tooling/handmade/line.mjs` 的 `handStroke`、`handFill`，参数取 `schemes/pomelo/tokens/handmade.json` 的 `uiIcon`，种子照它由 id 算）。这样挑中的那版能原样搬进方案。
- **独立画，不参考 Claude 那版**：`icons.mjs` 里 `batch: 3` 的 19 项（从 `heading` 到 `minimize-2`）、`schemes/pomelo/marks/icons/` 里这 19 个 id 的 SVG、Pomelo Explore 的「R6」「R7」两页和 `canvases/pomelo-explore/notes/`，都别看。别的都能看。
- **只建自己的两个目录**（下面写的），`schemes/`、`tooling/`、`bench/`、别的画布都不动。

### 3. 放哪、交什么

一块临时画布 `canvases/p4-<codex|argon>-format-icons/`，标题「P4 格式条图标 · Codex」（或 Argon），站主挑完就删。

1. 建画布（MCP `new_canvas`，或 `dw new`），挂 Pomelo 的 Design System（`ds_install … pomelo`）。
2. 源放在这块画布里：`icons.mjs`（19 项几何，导出 `FORMAT_ICONS`，按上表的顺序）、`gen.mjs`（写画板和 `canvas.json`；取用仓库里的东西只走 `canvases/_lib/root.mjs`；两次生成逐字节一样）、`README.md`（怎么生成、每张板是什么、小问卷的结论）。
3. 两张画板，都 1280×800，用挂上的 Design System 的变量和类名：
   - `Main.dc.html`：19 个图标照上表的顺序，每个放大 3 倍一个、原大 24 一个，下面写名字；Tweaks 能切明暗。
   - `Toolbar.dc.html`：放在用的地方看：一张纸上一段正文，选中几个字，格式条浮在上面（标题到互链），「更多格式」打开着；左上角一小截左栏有「没标签的」，右上角有「缩小」。
4. 自检：`check`（命令行 `dw check p4-<…>-format-icons`）全过，截图看过（MCP 的 `check` 写 `image: true` 把截图拿回来）。
5. 导出两张 PNG（`export`），标「待批」（`review_propose`）。

### 4. 小问卷（试一下问卷能力）

1. 照 `skills/questionnaire/SKILL.md` 出一份 `canvases/p4-<codex|argon>-questionnaire/`，最多 3 题，问站主对你这一版的看法（比如哪几个认不出是什么、像不像已有的那一家、最想改哪个）。
2. `dw check` 通过，测试答案删干净。
3. 开你自己的 bench：Codex 用 4331，Argon 用 4341（MCP `serve_start` 写 `port`，或 `node bench/bin/dw.js serve --port <端口>`；主工作区的 4321 别碰）。把两个地址给站主：问卷 `http://127.0.0.1:<端口>/#/p4-<…>-questionnaire`，画板 `http://127.0.0.1:<端口>/#/p4-<…>-format-icons`。
4. 站主说填完了：`db_get`（或 `dw db … survey/answers`）读回，结论写进画布的 `README.md`。

### 5. 提交、交付

- 只 `git add` 你建的这两个目录，提交在自己的分支上（提交说明用 `p4 <codex|argon>: …`）。不推送、不合并、不碰 main 和别人的分支（`CLAUDE.md`「第二条线」）。
- 最后告诉站主：分支名、`git log --oneline main..HEAD`、交了什么、自检和测试的结果、冷启动和做的时候卡在哪（哪份文档没写清楚）。站主会把这段贴给 Claude 验收。

## Claude 的评估（2026-11-15，原文）

**画法**：三版都用方案自己的画法和参数（24 格、线 2、抖动 0.32、种子由 id 算），放在一起是同一家，原大看不出线的差别。Codex 在几何里自己又加了一层弯（`Q` 曲线），放大看更像手写，原大看不出来。

**一个个看**（以原大 24 认不认得出为主，`Strip` 那张最准）：

| 图标 | Claude | Codex | Argon |
| --- | --- | --- | --- |
| 标题 | H₁，带级别，原大那个 1 有点挤 | H | H |
| 互链 | 套着的两层方括号，原大像 `[i]`，三版里最难认 | `[[ ]]`，一眼是 wiki 链接 | `[[ ]]`，同 Codex |
| 提示框 | 方框加左边一条和 i，像「信息卡」 | 对话框里一个 !（Lucide 的写法） | 同 Codex |
| 分隔线 | 两段线中间一个点，意思不明显 | 线加两个向里的箭头，更像「合起来」，和折叠容易混 | 线加两个向外的箭头（Lucide 的写法），最清楚 |
| 流程图 | 两个方块拐角连着 | 一上两下的树，像组织结构图 | 同 Claude |
| 脚注 | 几行字加上标 1，最像「脚注」 | A¹ | x²，读起来是「上标、乘方」，挨着 Σ 容易当成公式 |
| 没标签 | 标签加一道斜线 | 标签被斜线断开，最干净 | 标签、斜线、小圆点，原大有点挤 |
| 其余 12 个 | 三版差不多：B、I、U、S、高亮、列表、编号、代码块、表格、Σ、折叠、缩小 | 编号只有两行 | — |

**画在用的地方**：Argon 的编辑场景最完整（标签、柚子链接色的 `[[…]]`、「更多格式」里带 Markdown 写法），但板上留了几段说明文字，不像真的界面；Codex 的干净、照 Design System，内容少；Claude 那张（R7）是两种格式条加图标清单，还列了用已有的 20 个。

**照说明做到没有**：

| | Codex | Argon |
| --- | --- | --- |
| Git 规矩 | 守住：只在自己的分支上提交两次，只动自己的两个目录，没推送 | 守住：一次提交，同上 |
| 冷启动 | 只照文档跑通，`npm test` 32 个过 | 跑通；沙箱里 `git`、Chrome、本机端口都要放行（worktree 的 `.git` 指向主工作区，在它的工作区外面） |
| MCP | 用仓库里的配置连上 `dw`，全程用工具 | 没连上：Antigravity 不读工作区根上的 `.agents/mcp_config.json`（Claude 上一轮写错了地方），照说明改用命令行 |
| 几何的写法 | 照 `icons.mjs` 的字段（`for`），能原样搬进方案 | 字段改成了 `lucide`、`group`，搬进方案要改名 |
| 独立画 | 和 Claude 那版没有一个相同，坐标也不像 | 没有一个完全相同，但斜体（只差一处 0.05 的取整）、流程图（两块方的位置）、缩小几处坐标和 Claude 那版几乎一样，像是读 `icons.mjs` 时看到了第 3 批。说明把「别看」写在它必须读的文件里，是说明的毛病 |
| 小问卷 | 3 题，你填了，读回、写进 README | 同 |
| 交付说明 | 齐 | 最细，卡住的地方都写了 |

**建议**：Claude 那版已经进了方案、同步进了 Pomelo，整套不用换。认得出这一条，另两家有几个更好：互链用 `[[ ]]`（Codex 或 Argon），分隔线用 Argon 的，提示框看你要「框」还是「对话框」。要换的话，照方案的规矩开新名字，归 Pomelo 的会话做。

## 当时 ROADMAP 的写法（11-16 原样移来）

### Phase 4 · 第二条线（→ 0.13.0，11-15 做完，等站主挑）

- **规矩**（站主 11-15 在问卷里批）：`CLAUDE.md`「第二条线」：一个 Agent 一个 worktree、一条分支 `agent/<codex|argon>/<任务>`，只在自己的分支上提交，不推送、不合并、不碰 main 和别人的分支；bench 用自己的端口（Codex 4331、Argon 4341）。`design-loop` 写了一句指过去。
- **任务**：同一份说明 `canvases/v1-phase34-questionnaire/phase4-brief.md`：「见字如面」格式条的 19 个图标，Codex、Argon 各画一版（任务名 `format-icons`），和 Claude 那版（Pomelo Explore「R7」、`icons.mjs` 第 3 批）比。放临时画布 `canvases/p4-<codex|argon>-format-icons/`（站主 11-15 定：单开一块，挑完就删，不碰 Pomelo 的文件）。
- **问卷能力**：各照通用模板出一份小问卷（最多 3 题，问站主对自己那版的看法），在自己的端口给站主填，`dw db` 读回。
- **冷启动**：两个 Agent 在新 worktree 里只照文档上手（`npm ci`、构建、`npm test`），卡住的地方补进文档。
- **MCP**（Phase 3 收尾）：两家用仓库里的配置连上 `dw`。
- **验收**：站主照 `v1-phase34-questionnaire` 让两个 Agent 做、记结果；本仓库的会话只读地看两条分支、查 Git 规矩，把两版复制进一块临时对比画布、和 Claude 那版并排，写评估（各好在哪、差在哪）；站主看过、挑。用不用哪一版站主定；要换方案里的图标归 Pomelo 的会话做。
- **结果**（11-15，`CHANGELOG.md` 最上面一段）：两家都守住了 Git 规矩（只在自己的分支上提交、只动自己的两个目录、没推送），冷启动只照文档跑通，各出了小问卷、站主填了、读回了。Codex 全程用 MCP；Argon 没连上（Antigravity 不读工作区根上的 `.agents/mcp_config.json`），照说明用命令行。评估的结论：Claude 那版不用整套换，互链、分隔线另两家的更好认。worktree 站主让清，11-15 清了；两条分支留到站主挑完。
- **MCP 还差 Antigravity**：配置改成工作区插件 `.agents/plugins/dw/`（它的文档写着工作区插件默认开着、会起插件里的 MCP）。在插件目录里跑那条命令 23 个工具都在，但 Antigravity 里还没连过：站主提交以后在 Antigravity 打开这个仓库，「Additional Options（…）> MCP Servers」里看到 `dw` 就算过；没有的话，Phase 5 开工前再查。
