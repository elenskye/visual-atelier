# Strip

一栏左右滑的（1.1.0）：文献库的集合、知识库的生长阶段。衬线的名字，后面一个小计数；悬停一层淡底，选中的那个是浮在纸上的胶囊（`color-surface`、描一圈、`shadow-sm`）。放不下就左右滑（触控板两指横滑，鼠标竖着滚也行），右边缘淡出去。

**写法**：`<div class="pith-strip"><button class="pith-strip-item">方法论<em>2</em></button>…</div>`。选中 `is-on`；有下级的 `has-kids`（名字后面一个小折角），展开了加 `is-open`，下级接在它后面：先一根小枝 `<span class="pith-strip-twig">`，下级加 `is-sub`（小一号、淡一点，从左边长出来），最后一道竖线 `<span class="pith-strip-end">`。末尾「＋ 集合」用 `is-add`。
