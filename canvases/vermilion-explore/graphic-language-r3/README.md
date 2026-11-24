# graphic-language-r3

VL1 Phase 3 图形语言探索（2026-10-26）画 `blobs/` 里那些图的脚本，2026-11-05 从主工作区 `scratch/` 收来，脚本没改过。定稿的规则和资产在 `schemes/vermilion/`，这里只为重做 Vermilion Explore 的图。

- `lib.js`：几何工具（Catmull-Rom 平滑、收尖笔触 `brush`、三缕飞白 `dryBrush`、鬃丝飞白 `inkBrush`、提按 `pressBrush`、径向形状）。
- `dirs.js`、`render.js`：第一轮五个方向（`inline` 模式带动画 class 和书写遮罩）。
- `e2.js`、`render2.js`：第二轮笔势的单维度变体、笔势 × 剪纸。
- `e3.js`、`render3.js`：第三轮定稿规则下的图形和迁移测试（PPT、Pomelo App 图标、模块图标、菜单栏模板图、加载圆相）。
- `render4.js`：墨感五选一的对比图。`e3.js` 的 `setInk()` 切换，默认是站主选的 `bristle`。
- `package.json` 只写 `"type": "commonjs"`：仓库根是 ESM，没有它脚本跑不起来。

怎么跑、怎么和云端存的逐张核对，见上一层的 `README.md`「重新生成图片」。

2026-11-15 清理（站主在 Phase 2/3 验收问卷里定的）：删了只为留档的 `r3-assets-svg.tgz`（第三轮 SVG 的打包，`render3.js` 能重做）、加载圆相的两张 GIF 和跑不了的 `gif.js`（要的 `out3/loading.html` 没留下），都在 Git 历史里。
