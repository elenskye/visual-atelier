# Phase 5 说明：新方案 pith 的第一版

给 Claude、Codex、Argon 的同一份说明（到 v1.0 计划 Phase 5，站主 2026-11-16）。三家各在自己的分支上起一版 pith 的视觉方案，最后由本仓库的 Claude 会话把三版并排评估，站主挑一版进 `schemes/pith/`。

## 0. 先读、先跑

1. 你在站主建好的 worktree 里（`~/Documents/GitHub/visual-atelier-<claude|codex|argon>`，分支 `agent/<claude|codex|argon>/pith`）。`git branch --show-current` 对不上就停下问站主。
2. 读 `CLAUDE.md`（「核心约定」「画布与 bench」）、`docs/sessions.md`（「新会话接手」「第二条线」）、`docs/architecture.md`（「新方案怎么起」「目录与清单约定」）、`docs/motion-tiers.md`、`canvases/README.md`、`skills/design-loop/SKILL.md`。别的方案（`schemes/vermilion/`、`schemes/pomelo/`、`schemes/peck/`）可以看怎么写，但 pith 不借用它们的 token、规则和资产（核心约定 1）。
3. 冷启动，只照文档：`npm ci`、`VA_BROWSER_CHANNEL=chrome npm run build`、`npm test` 全过。卡住的地方记下来。
4. 调一次 `dw` 的 MCP 工具 `list`。没有这个工具：照 `bench/README.md`「MCP」查；查不出就用命令行 `node bench/bin/dw.js`，交付时写清楚。
5. **pith 要什么**：
   - 先读同目录的 `pith-app.md`：Pith App 是什么、现在的界面、接进去时要对上的变量名、画哪一屏。
   - 再读站主填在 `canvases/v1-phase56-questionnaire/db.json` 第 1 页的答案（`dw db v1-phase56-questionnaire survey/answers`，或 MCP `db_get`），看 `summary`。这就是简报，和 `pith-app.md` 说法不一样时照它。
   - 两份都没写到的你自己定，写进 `DESIGN.md` 第 7 节「待确认」。
   - 这一轮只做 App 的方案；WonderLab 的另起，不做。
   - 站主给的参考网站只取感觉，不抄它的图形、插画、字体和文字。
6. **独立做**：别看别人的分支（`git log --all`、`git show agent/...` 都不看），也别去主工作区找。

## 1. 要交的

1. **方案** `schemes/pith/`：`node bench/bin/dw.js scheme new pith --title Pith`（MCP `scheme_new`），它从模板起一套能构建的占位、跑一遍检查。然后换成你的：
   - `DESIGN.md`：第 1 节方向照简报写（给谁用、多什么少什么、参考），2–6 节写你定的规则。
   - `tokens/`：颜色角色（明暗两套，按需要加减角色；加了就在 `contrast.json`、`targets.json`、`design-system/tokens.config.json` 跟着加）、字、间距、圆角、动效档位。字体只用可再分发许可的（登记在 `type/fonts.json`），或系统字体。颜色角色要对得上 `pith-app.md`「接进 Pith 时怎么对上」那几个变量，名字不同就在 `DESIGN.md` 写一张对照表。
   - `marks/`：标志一个（SVG，`currentColor` 或角色变量），简报要了 App 图标、界面小图标就一起画；都登记进 `marks/manifest.json`，状态 `proposed`。
   - `design-system/`：`README.md` 写给用它的 Agent；`bundle.css` 至少有按钮、卡片、输入框；`components/` 每个一份 `README.md` 加 `preview.html`；`Cover` 换成 pith 的样子。
   - `motion/`：简报要了「一个动效」，站主说动效是这套视觉的亮点，界面不能呆板、静止。做一个零件 `motion/<id>/`：
     - 一份 `motion.json` 加 CSS 和 HTML 片段，标档位 `calm` 或 `expressive`，带减弱动效时的静态终态（`docs/motion-tiers.md`）；
     - 写法照 `schemes/vermilion/motion/` 里的零件（`capture` 也写上），但数值是你自己的；
     - 在 Motion Deck `/#/motion/pith` 里能播，`npm run build:motion -- --scheme pith --part <id>` 能导出 GIF；
     - `X1-Screen` 里用上它（比如悬停、展开、加载时的一个小反馈）。
2. **画布** `canvases/pith-explore/`（`dw new pith-explore --title "Pith Explore"`，再 `dw ds install pith-explore pith`），一页 `EX1：第一版`（页 id `ex1`），两张 1280×800 的板：
   - `X1-Overview.dc.html`：方案总览：标志、颜色（明暗）、字、几个组件，加上那个动效（能动）。
   - `X1-Screen.dc.html`：Pith 的一屏真的样子，画哪一屏照 `pith-app.md` 最后一节（第 1 页另说了就照第 1 页）。用挂上的 Design System 的变量和类名。
   - 有生成器就放在 `canvases/pith-explore/` 里、只走 `canvases/_lib/root.mjs`，两次生成逐字节一样；没有也行。
3. **README**：`canvases/pith-explore/README.md` 写「交付说明」一节：方向一句话、每张板是什么、你定了哪些简报里没写的、自检结果、冷启动和做的时候卡在哪。

只动 `schemes/pith/`、`canvases/pith-explore/` 两个目录。`tooling/`、`bench/`、别的方案、别的画布都不改；要它们改的写进交付说明。

## 2. 自检

- `node bench/bin/dw.js scheme new` 那三步你改完以后再各跑一遍，都要过：`npm run build:tokens -- --scheme pith`、`npm run qa -- --scheme pith`（对比度 APCA 明暗都过，0 失败）、`npm run build:ds -- --scheme pith`。
- 改了 Design System 就重新 `dw ds install pith-explore pith`，再 `dw check pith-explore` 全过，截图看过（MCP `check` 写 `image: true`）。
- 开你自己的 bench：Claude 4351、Codex 4331、Argon 4341（MCP `serve_start` 写 `port`，或 `dw serve --port <端口>`），把 `http://127.0.0.1:<端口>/#/pith-explore?page=ex1` 和 `http://127.0.0.1:<端口>/#/ds/pith` 给站主。主工作区的 4321 别碰。

## 3. 提交、交付

- 只 `git add schemes/pith canvases/pith-explore`，提交在自己的分支上（提交说明用 `p5 <claude|codex|argon>: …`）。不推送、不合并、不碰 main 和别人的分支（`docs/sessions.md`「第二条线」）。
- 最后告诉站主：分支名、`git log --oneline main..HEAD`、两个地址、自检结果、卡在哪。
