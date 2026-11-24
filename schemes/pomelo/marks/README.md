# marks

Pomelo 的静态资产：柚子（8 个表情，加撕起贴纸后的印子）、AI 按钮、菜单栏的小柚子、App 图标、模块贴纸（22 个模块自己的，加 32 个通用的，都在 `modules/`）、空状态插图（8 张，在 `empty/`）。

- **源是 `art.mjs`**：几何和构图。画法在 `tooling/handmade/`（和 Design System 的 `bundle.js` 同一份），数值在 `../tokens/handmade.json`。
- **SVG 是生成的**：`node tooling/handmade/marks.mjs` 写出 `pomelo/`、`app-icon/`、`modules/`、`empty/` 下的 SVG 并更新 `manifest.json`；`--check` 只比较。不要手改 SVG，改 `art.mjs` 再生成。
- **颜色**：写成 `var(--pm-角色, var(--color-角色))`，Pomelo 里取方言变量，挂了 Design System 的画布取网页变量，跟着配色和明暗走。菜单栏的是模板图，只有 `currentColor`。
- **换色**：`modules/` 的贴纸，分类色外面包一层 `var(--mark-color, …)`、浅一档包 `var(--mark-color-soft, …)`。在贴纸外面设 `--mark-color: var(--pm-cat-pink)`、`--mark-color-soft: var(--pm-cat-pink-sticker)`（网页里用 `--color-cat-*`）就换成樱粉；不设就是它自己的颜色。上色的 PNG 和 themed SVG 去掉这层再上色。这层挂钩不算几何和参数：`approved` 的贴纸只差挂钩时照样写入。
- **空状态插图**：一页还空着时一张小插图配一句话，`art.mjs` 的 `EMPTY`（模块、名字、那句话、主色）和 `EMPTY_ORDER`。8 张：一步一步、念念不忘、来日方长、出门走走、摸鱼读读、好奇看看、投石问路、芝麻开门；话取 Phase 2 定的文案，书架和投石问路的图取自 Phase 2。画法同贴纸（`k` 1.25，取样放稀到 1.8），240 × 150 的图、东西都站在 y ≈ 132；视口 `-8 0 256 150`。每样东西一张白边、成一组 `<g class="pt 名字 动作" style="--i:第几个">`，墨线带 `pathLength="1"`，动效零件 `motion/empty-state/` 照这个结构一笔笔画出来、再一样样弹一下；动作的词（hop、tip、sway、swing、flap、rise、twinkle、echo）写在组名后面。
- **柚子贴纸的印子**（`pomelo/pomelo-ghost.svg`，小彩蛋）：简报角上的柚子贴纸撕起来，底下是这块和贴纸同形状的印子（柚子橙的浅色、外沿一圈虚线），悄悄话由界面写在上面；照 Phase 2 定稿的 `pomeloGhost`，和柚子 100 格一样大，贴着时被贴纸整个盖住。
- **设置、日历的贴纸**（`places/`，站主 2026-11-09 要的）：这两页不是模块，叠在桌上时也用和别的贴纸一个风格的贴纸。`art.mjs` 的 `PLACE_ICONS`：齿轮（天蓝）、月历（薄荷，和来日方长那张的区别是格子里一个柚黄的圆，没有心），画法、64 格和模块贴纸一样；放在 `places/`，不进 Pomelo「图标和颜色」的挑选。
- **界面小图标**（`icons/`）：168 个（148 个替换 Lucide 的；「时间穿梭」`time-travel`：Atlas 里一年的封面下面，进这一年做过的每一份；见字如面的 19 个，第 3 批），源是 `icons.mjs`（24 格一笔单线：线 `d`、圆 `o`、圆角方块 `rect`、小点 `dots`，中文名、替换的 Lucide 名字、第几批），画法和 Design System 的 Icon、`paint.mjs` 的 `glyphSvg` 是同一份，种子由名字算出来。文件里只有 `currentColor`，用的地方定颜色。
- **自建模块的图标名 → 贴纸**：`art.mjs` 的 `MADE_ICON_MARKS`（Pomelo 的 `modules/custom/icons.ts` 有同样一份）。
- **PNG**：`npm run build:marks` 按清单的 `renders` 导出到 `dist/pomelo/marks/png/`：App 图标 1024（蓝笔浅色）、菜单栏 36 像素的模板图（黑）。
- **状态**：新生成的是 `proposed`，站主在 bench 里批了才改 `approved`（现在 248 个都是 `approved`，谁哪天在哪批的记在 `manifest.json` 的 `approved`）；`approved` 的生成结果一变，生成器就报错、不覆盖。
- 清单字段见 `docs/architecture.md`。
