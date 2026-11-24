# Select

下拉：关着时是手画的框（圆角 10）加一个向下的小箭头；展开是一条纸从下面翻下来，两侧笔色的边，格子之间虚线，选中的那一格是 `color-selected` 底、右边画个勾。

**写法**：开关按钮 `<button class="pm-field pm-select" data-hand="field" data-r="10">`，里面放当前值和 `data-hand="icon"` 的箭头。展开的纸 `<div class="pm-menu" role="listbox">`，每格 `<div class="pm-menu-item" role="option" aria-selected="…">`，勾 `pm-menu-check`（没选中的格子里勾是藏起来的）。高 36，宽跟着最长的一项。

**用在**：选月份、选分类这种五项以上、一次选一个的地方。

**使用方提供**：选项、当前值、种子。

**不要**：两三项的时候用下拉（用分段）；展开的纸做成带阴影的浮层卡片；选中的那格用主色实心。
