# Tag

标签：分类色的浅底（`color-cat-*-bg`），字一律是墨色 `color-ink`，靠底色和圆点分。两种：能去掉的标签（胶囊，高 28，后面一个小 ×），和只读的小标签（圆角 `radius-tag`，高 22，前面一个分类色的圆点）。加的时候拍上去、去掉时撕下来（动效零件另做）。

**写法**：
- 能去掉的：`<span class="pm-tag pm-cat-orange">柚子<button class="pm-tag-x" aria-label="去掉「柚子」">…×…</button></span>`。后面跟一个 `color-link` 的「加一个」。
- 只读的：`<span class="pm-chip pm-cat-sky">读看</span>`。
- 颜色类：`pm-cat-mint`、`pm-cat-sky`、`pm-cat-pink`、`pm-cat-orange`、`pm-cat-grape`、`pm-cat-yuzu`。

**用在**：书和地方的标签、模块的分类、状态（要做 = 天蓝、在做 = 橙、做完 = 薄荷，未标记是 `color-desk` 底 `color-ink-soft` 字）。

**使用方提供**：两三个字的名字、分类。

**不要**：把字写成分类色；标签加描边；一行放太多（换行，别横着滚）。
