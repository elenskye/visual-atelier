# tokens

语义角色的色彩（明暗两套）、字号、间距、圆角、动效时长与缓动，写成 JSON。

- `graphic.json`：图形语言「笔势与纸片」的数值（笔宽、笔数、墨感光洁与提按、纸片取色、朱红抵达点）。站主 2026-10-30 批准；`tooling/graphic/` 读它生成 `marks/graphic/`，`render/marks.mjs` 读它给图形上色。
- `motion.json` 的 `registeredSurfaces`：登记过的 `expressive` 表面（分类图形悬停、分区装饰入场、加载圆相），站主 2026-10-30 批准，实现见 `motion/` 下同名零件。
