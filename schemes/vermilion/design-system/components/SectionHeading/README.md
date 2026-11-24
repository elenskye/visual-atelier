# SectionHeading

带漫游路径图标的小标题：衬线 1.5rem 的文字前面，跟一个和字号一样高的点状虚线加终点圆圈。

**结构**：`h2.about-heading`（flex，图标与文字间距 `space-3`，下距 `space-5`，字距 0.04em），里面先放 `assets/Icons/route-glyph.svg` 的内联 SVG（`aria-hidden="true"`），再放文字。图标描边由样式统一设为 `color-accent`、线宽 2.4、圆头，宽高都是 1em。

**用在**：长页面里的大分节，一页 2–3 个为宜。英文标题写大写（「A LITTLE CONTEXT」）。

**使用方提供**：标题文字。

**不要**：把图标换成别的形状或填色；在同一页里给不同小标题配不同图标；把这个图标放大成装饰图。
