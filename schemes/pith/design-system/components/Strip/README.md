# Strip

一栏左右滑的（1.1.0，1.2.0 改）：文献库的集合、知识库的生长阶段。衬线的名字，后面一个小计数；悬停「上墨」（加 `pith-ink`：淡底从左下滑进来，前面有图标的，图标重描一遍、珊瑚点落下来），选中的那个是浮在纸上的胶囊（`color-surface`、描一圈、`shadow-sm`）。放不下就左右滑（触控板两指横滑，鼠标竖着滚也行），右边缘淡出去。栏高 42px：底下留出展开时茎的位置，展开、收起时下面的东西不跳。

**展开下级**（1.2.0，站主 11-25：「做一个小分支图形展开的想法非常好，但一条曲线很单调」）：有下级的名字后面一个小折角；点开以后折角收起，从它身上长出一小段枝桠——一根带叶的岔（`pith-strip-fork`，先画线、叶子再弹出来），底下一根茎往右长，每个下级下面一颗节点（`pith-strip-node`，选中、悬停时是珊瑚色），茎的尽头一个珊瑚色的芽（`pith-strip-bud`）；下级的名字一个接一个从左边长出来。和对话历史、设置的枝桠是同一种画法。

**写法**：`<div class="pith-strip"><button class="pith-strip-item pith-ink">方法论<em>2</em></button>…</div>`。选中 `is-on`；有下级 `has-kids`，展开 `is-open`，下级包在 `<span class="pith-strip-sub" style="--n:下级个数">` 里：先放岔的 SVG（`.st` 线、`.lf` 叶），再放下级 `<button class="pith-strip-item pith-ink is-sub" style="--i:第几个"><i class="pith-strip-node"></i>名字</button>`，最后 `<i class="pith-strip-bud"></i>`。末尾「＋ 集合」用 `is-add`。前面带图标的（生长阶段）把图标放在名字前面。

**字的居中**：Newsreader（中文后备宋体）的字形比行框的中线高约 0.07em，胶囊里的行框往下挪 0.14em（WebKit 里量过，偏差在 0.35px 内）。`Tag` 的集合、`Branch` 的条目同样处理。
