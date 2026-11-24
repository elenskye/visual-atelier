# Rating

评分：五颗星星贴纸，笔色的边；选中的填柚黄 `color-yuzu`（错开一点），没选中的只留一点点淡的填色。点下去星星一颗接一颗弹出来（动效零件另做）。

**写法**：`<div class="pm-rating" role="radiogroup">`，每颗 `<button class="pm-rating-star" role="radio">` 里放 `<span data-hand="star">`。亮着的星星加 `is-on`；当前那一颗写 `aria-checked="true"`。每颗 32 × 32，星星 30。下面可以跟一句俏皮的小字（「三颗星，挺好」）。

**用在**：书、电影、地方的评分。

**使用方提供**：分数（1–5）、种子。

**不要**：半颗星；用 ★ 字符代替（年度小报的票根除外）；换成别的颜色。
