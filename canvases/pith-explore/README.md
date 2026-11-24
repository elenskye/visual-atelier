# Pith Explore

Pith 的 Explore Deck（`canvases/README.md`「Explore Deck 的规矩」）。站主 2026-11-24 验收了 EX11（「验收完毕，开始做优化页、建 schemes/pith/」），同一天定：本地只留最终一轮。所以这块画布现在只有一页 **R1：Pith 定稿**，打开画布落在这页。

EX1–EX11（Claude、Codex、Argon 三家的 Phase 5 和照新架构做的八轮）的板和生成器在站主 11-24 重建 Git 之前的历史里（旧 `.git` 备份，清理前的提交 `546725d`）；经过和三家的评估在 `history/pith-phase5.md`，每一轮的说明在 `history/changelog-2026-11.md`。

云端（Design 画布，私有）：

- **现用账号** https://claude.ai/artifact/HcCFtnXuGg9fQnp5qSVoH7 （`cloud.json` 的 home，11-24 新建，只有 R1，挂着 Design System「Pith」）。
- 旧账号 https://claude.ai/artifact/3qPdEANYGZCWLqNyfaajvx ：EX1–EX11 十一页（第 15 版），只看不动（站主 11-24 说不清理）。

本地是真身。画板挂着 Design System「Pith」（`project/ds/pith/`，`node bench/bin/dw.js ds install pith-explore pith` 换成新的）；R1 的板把方案的样式原样放在自己里面，不靠这份副本。

## R1

| 板 | 尺寸 | 看什么 |
| --- | --- | --- |
| `Pith-Notes` | 2720 × 620 | 说明：定下来的、每张板看什么、方案在哪 |
| `Pith-App` | 1280 × 800，能点 | App：对话（打开时叶子长出来、发问看状态行和「在想」、点编号看页边注、存卡看种子落到知识库图标）、知识库、文献库（右侧面板、编辑元信息）、设置（角色、外观换配色看湖面波纹）；⌘\ 或两指横滑叫出对话历史的枝桠；⌘K。Tweaks：明暗、配色、开在哪一屏、对话从哪开始 |
| `Pith-Logo` | 1600 × 860，能点 | 蕨芽怎么长：大图一直演、五段时间、亮暗字标（放上鼠标再长）、App 图标和小尺寸、按时间截的分解 |
| `Pith-Topbar` | 1280 × 960，能点 | 一条真的顶栏能悬停；知识库、文献库、设置各一行：大图一直演、按时间截的分解 |
| `Pith-Agents` | 1280 × 1390 | 十四个 Agent 图标、「一次回答里」状态行怎么换、「存进知识库」的分解 |
| `Pith-Icons` | 1280 × 960 | 整套图标：顶栏、界面、十种记录、生长阶段，亮暗两条用起来的样子 |

悬停、舒展、生长、湖面波纹这些动效零件一个个看、导出 GIF，在 bench 的 Motion Deck（`/#/motion/pith`）；组件在 Design System（`/#/ds/pith`）。

在 bench 里看：`node bench/bin/dw.js serve`，打开 `http://127.0.0.1:4321/#/pith-explore`；单张铺满才能直接点，缩略视图里先点 PLAY。

## 生成

仓库根目录、Node 22：`node canvases/pith-explore/src/build.mjs`，只写 `r1` 这一页（`page.mjs`），两次逐字节一样。生成时打出两套配色、明暗的 APCA（门槛是方案的 `tokens/contrast.json`，四版全过）。

- **全从方案来**：`src/scheme.mjs` 用 Design System 的运行时（`tooling/design-system/build.mjs` 的 `dsRuntime`）拿 `tokens.css` 和 `bundle.css`（组件、第二套配色、七个动效零件），每张板原样放进去；App 板从 EX 一路沿用的变量名（`--bg`、`--ink`、`--sea`……）由 `ALIAS_CSS` 指到 `--color-*`。`src/marks.mjs` 的图形来自 `tooling/pith/glyphs.mjs`（`schemes/pith/marks/` 也从它生成）。
- **自己的**：`app.mjs`、`shell.mjs`（屏幕和状态：叶子首页、枝桠、对话的播放、种子的真实落点 `saveCard`、换配色 `toPal`）、`garden.mjs`（叶子和枝桠）、`a-cards.mjs`（知识库的十种卡片）、`base.mjs`（版面）、`content.mjs`（假数据：《国富论》、Stigler 1951、《全球通史》）、`boards.mjs`（Logo、顶栏、Agent、图标四张）、`guide.mjs`（说明板）。
- 字体：Newsreader、Noto Serif SC、Lato、Noto Sans SC，都是 OFL，从 Google Fonts 取（`docs/licensing.md`），不打包、不做子集。

改了方案（颜色、动效零件、图形）就重跑这一页的生成器，再 `dw check pith-explore`。

## 自检（2026-11-24）

- `dw check pith-explore`：6 张板全过（它按减弱动态效果截图；分解帧用暂停的动画定在某一刻，不算动效，照样显示）；`dw frames` 看过顶栏板的循环。
- App 板走了一遍（打开时 Logo 长出来、悬停三个图标、发问、点编号看页边注、存卡看种子和 +1、设置 › 外观换雾与赭看波纹），没有报错。
- 生成两次逐字节一样。
- 没目视的：动效的手感、设置一秒转 600 度快不快、水面扭曲在真机上的流畅度。
