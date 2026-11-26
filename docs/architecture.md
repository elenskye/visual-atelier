# 架构

## 一句话

一份源（文件），多种输出（网页、App、静态图、GIF），多套方案并存。

## 分层

每套方案内部分四层，工具在 `tooling/` 里对所有方案通用：

| 层 | 位置 | 内容 | 输出 |
| --- | --- | --- | --- |
| Token | `schemes/<n>/tokens/` | 语义角色（页面、表面、文字、结构色、交互色……）、字号、间距、圆角、动效时长与缓动 | 网站方言（`--color-*`）、TS 常量；方案声明了才出 Pomelo 方言（`--background` 等 shadcn 命名） |
| 静态矢量 | `schemes/<n>/marks/` | Logo、图标、图形构件；SVG，颜色用 `currentColor` | 内联 SVG、React 组件、PNG、App 图标集 |
| 动效 | `schemes/<n>/motion/` | 每个动效一份规格 + 一份实现，档位 `calm` 或 `expressive` | 实时播放（CSS/WAAPI/SVG）、逐帧定格后的 GIF |
| 字标与字体 | `schemes/<n>/type/` | 字标（用可分发字体转曲线）、字体清单与许可 | 字标 SVG、字体声明 CSS |

另有一个可选的汇总层：`schemes/<n>/design-system/` 放 Claude Design System 的说明、组件预览与组件样式，由 `tooling/design-system/` 把它和上面四层合成一套 Design System，发布到 Claude，供 Claude 会话、画布和幻灯片取用。它是产物，源仍在本仓库。

## 数据流

```
 tooling/graphic ──► 方案源文件（marks/graphic、动效片段；改了参数才跑）
 方案源文件 ──► tooling/tokens  ──► dist/<n>/tokens
            ├─► tooling/render  ──► dist/<n>/marks（svg、上好色的 themed svg、png）
            ├─► tooling/render  ──► 逐帧 ──► dist/<n>/motion（gif）
            ├─► tooling/qa      ──► 对比度、体积、减弱动效、禁用项
            ├─► tooling/design-system ──► dist/<n>/design-system ──► 发布到 Claude 的 Design System
            └─► tooling/catalog ──► dist/catalog（预览页：明暗模式、实时动效）
```

`tooling/sync` 只读 Git tag 对应的构建结果，复制到消费方的约定位置。

## 画布与 bench

`canvases/<画布名>/` 是一块 Claude 画布（`project/` 里 `canvas.json` 加 `*.dc.html`）或一个问卷页的源。有生成器的画布从 `schemes/` 取 token、从 `tooling/` 取工具，都经过 `canvases/_lib/root.mjs`。`bench/` 是看画布的引擎：`dw` 命令行新建、拉回、发回、核对、存版本、自检、导出；`dw serve` 的画布界面只看不改；Design System 页和「挂到画布上」直接读 `dist/<方案>/design-system/`。

```
 schemes/、tooling/ ──► canvases/<画布名>/ 的生成器 ──► project/（canvas.json、*.dc.html）
 project/ ──► bench（dw serve 看、dw check 自检、dw export 导出 PNG 和单文件 HTML）
         ◄─► Claude 云端画布（dw pull 拉回、dw publish 发回，逐个核对 sha256）
 dist/<方案>/design-system/ ──► bench 的 Design System 页、dw ds install 挂到画布
```

## 动效如何同时服务网页与 GIF

每个动效以「时间的函数」写成：给定进度 `t`，状态确定。网页里用 CSS/WAAPI 驱动；导出时用 Playwright 暂停全部动画，逐帧设置 `currentTime` 截图，再由 gifenc 合成 GIF（全局调色板，平涂色体积很小）。这样网页与 GIF 来自同一份实现。

## 采用方式（为什么是复制）

网站推到 `main` 后由 Vercel 构建，云端没有本机的兄弟目录，所以 `file:` 链接会让线上构建失败。因此采用单向复制：同步脚本把已发版本复制进消费方约定的文件夹，写入 `VERSION` 与校验和，消费方提交这份副本。细则见 `adoption.md`。

## 为什么一个仓库、多套方案

管线对所有方案相同，分仓库会让同一个 bug 要改很多处；方案各自的规则文件放在各自目录，Agent 在哪个目录工作就读哪份规则。方案需要独立（不同可见范围、发版节奏）时，可用 Git 把它拆出去。画布和看画布的引擎也在同一个仓库（2026-11-06 合进来），引擎和生成器直接用本仓库的路径和 `node_modules/`。

## 新方案怎么起

```bash
node bench/bin/dw.js scheme new <方案名> --title <显示名>
```

（MCP 是 `scheme_new`。）它把 `schemes/_template/` 复制成 `schemes/<方案名>/`、填上名字，再照 tooling 跑一遍 token 构建、质量检查、Design System 构建，每一步过没过都说；没过就停在那一步。模板是一套能构建、能过检查的占位（2026-11-16，v1.0 Phase 5），数都要换成这套方案自己的：

| 文件 | 是什么 |
| --- | --- |
| `scheme.json` | 名字、显示名、状态 `draft`、版本 `0.0.0`、动效档位 |
| `CLAUDE.md`（`AGENTS.md` 指向它）、`DESIGN.md` | 方案的规则和视觉基线；`DESIGN.md` 第 1 节是方向（给谁用、多什么少什么、参考） |
| `tokens/` | 必须有的五个：`color.json`（7 个角色、明暗两套）、`scale.json`、`motion.json`、`contrast.json`（APCA 配对）、`targets.json`（网页变量名） |
| `marks/manifest.json` | 资产清单，先是空的 |
| `type/fonts.json` | 字体清单，先只有系统的苹方 |
| `design-system/` | `system.json`、`tokens.config.json`（每个 token 的用途、字体样式）、`README.md`、`bundle.css`（类名以 `<方案名>-` 开头）、组件 `Cover`。不要 Design System 就删掉这个目录 |

加了颜色角色，`contrast.json`、`targets.json`、`design-system/tokens.config.json` 跟着加，不然检查或构建会报。

其他都是可选的，方案没有就跳过：

| 方案有了什么 | 才会跑 |
| --- | --- |
| `tokens/graphic.json` | `tooling/graphic/`。里面的形状是 Vermilion 的「笔势与纸片」，别的方案不写这个文件，也不借用这些形状 |
| `tokens/handmade.json` | `tooling/handmade/`：手绘线条、贴纸、错版的生成器，算法通用，数值在这个文件。出样张到 `dist/<方案>/handmade/` |
| `marks/art.mjs`（还要有 `tokens/handmade.json`） | `tooling/handmade/marks.mjs`：照它的几何把手作资产写进 `marks/` 和清单 |
| `marks/derived.json` | `tooling/marks/derive.mjs`：文字转曲线、合成分享图、生成分享图与水印模板 |
| `design-system/` | `tooling/design-system/` |
| `sync.json` | `tooling/sync/` |
| 清单里带 `fakeImages` 的资产 | `tooling/qa/watermark.mjs` |

## 目录与清单约定

`tokens/` 里每个文件各管一件事：

| 文件 | 内容 |
| --- | --- |
| `color.json` | 语义角色的明暗取值。可以只有一套（`roles`），也可以有多套配色（`palettes`：每套明暗各一份，`roleDefs` 列出每套都要给的角色，`shared` 各套共用，`derive` 由别的角色混出来，`defaultPalette`、`pageRole` 指默认配色和当底色的角色） |
| `scale.json` | 字号、间距、圆角、宽度、阴影 |
| `motion.json` | 动效档位的数值与招牌动作 |
| `contrast.json` | 要通过的 APCA 配对与门槛，多套配色时逐套、逐明暗查 |
| `targets.json` | 各方言的变量名映射（网页；需要时加 Pomelo），以及未决项。多套配色的选择器写 `%s` 占配色 id |

`marks/` 放资产文件，位图放 `raster/` 与 `illustrations/`。`marks/manifest.json` 每个资产一条：`id`、`title`、`file`、`kind`（`svg`、`raster` 或 `css`）、`status`（`draft` / `proposed` / `approved`）、`colorMode`（`currentColor` 由使用处决定颜色，`fixed` 写死在文件里，`roles` 用角色变量给多色图形上色）、`colorRole`（`currentColor` 的资产预览时用哪个角色；没写就按正文色 `text`/`ink` 预览，比如 macOS 菜单栏的模板图）、`origin`（来自哪个仓库、哪个路径、何时迁入；本仓库生成的资产改用 `source`）、`renders`（要导出的 PNG）、`notes`、`sha256`（迁入时的校验和，用于发现被手改）。从页面内联 SVG 提取、没有独立源文件的资产，`origin` 加 `inline: true` 与 `contains`（来源里必须仍然存在的几何片段），质量检查改为核对这些片段。

`type/fonts.json` 是字体清单：字体、用途、字重、许可、能否转曲线。字体文件本身不进仓库。

`motion/<id>/` 每个动效一个目录：`motion.json`（`id`、`tier`、`signature`、`trigger`、`durationMs`、`reducedMotion`、`origin`、`files`、`capture`）、一份 CSS、一份 HTML 片段。`capture` 记录导出参数：缩放、边距、帧率、首尾停留、明暗主题。

`design-system/`（可选）：`README.md`（Design System 的说明，写给使用它的 Agent，点名 token）、`bundle.css`（组件样式，类名与数值和消费方一致；基础元素样式收在 `.vm-page` 里）、`components/<组件>/`（`README.md` 使用说明 + `preview.html` 静态预览；`Cover/` 是封面）、`assets/<分组>/README.md`、`tokens.config.json`（每个 token 的用途说明与字体样式）、`system.json`（名字、命名空间与资产分组）、`published.json`（发布地址、建它的账号、上传记录）。构建另写一个只声明命名空间的 `components/bundle.js`：组件都是静态预览，但 Design System 页没有它就不跑预览。`system.json` 写了 `bundle`（模块清单和参数文件）的方案，`bundle.js` 改由 `tooling/design-system/bundle.mjs` 把那几个 `tooling/` 模块原样打包（Pomelo 的手画零件，`window.Pomelo`），框的预设写在 `bundle.presets`。多套配色的方案在 `bundle.css` 里写 `/* @generate palettes */`，构建在那里插入非默认配色的 `data-palette` 变量块。预览里可写 `<!-- @include 路径 -->` 与 `@asset-data:路径`，构建时展开成方案里的文件内容或 data URI，不复制第二份。

`dist/<方案>/` 的结构：`tokens/`、`marks/`（`png/` 放导出的 PNG）、`motion/<id>/`（GIF、逐帧总览图、CSS 与 HTML 片段）、`design-system/`（`project/` 要发布的文件、`upload/` 要上传的图片、`check/` 自检截图）、`qa-report.json`；`dist/catalog/index.html` 是目录页。`dist/` 不进 Git。

质量检查的几类：资产校验和、颜色没有写死、对比度、体积预算、动效规则（档位、循环、时长）、渲染合理性；另有确定性检查。加 `--origin <消费方目录>` 时，再只读对照 `scheme.json` 的 `consumers` 里有这个消费方的方案（现在是 Vermilion 和网站）：现用的文件、变量与动效，发现被手改或没跟上。
