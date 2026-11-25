# TagTree

文献库的标签树（1.1.0）：和对话历史、设置的导航是同一种枝桠（`Branch`），没有按钮，两指往右滑从左边长出来、往左滑收起（Esc 也收）。每个标签一根小枝，名字后面一个小计数；名字里有「/」的按前面那段分组（`pith-branch-group`）。能多选（文献要同时带着这几个），选中的 `is-on`：节点珊瑚色、字加粗。右键改名、删掉。

**写法**：`<nav class="pith-branch"><p class="pith-branch-group">政治</p><a class="pith-branch-item pith-row is-on">效能感<em>3</em></a>…</nav>`。App 里枝桠是画出来的（和对话历史一样每次叫出来长一遍），这里是静态的样子。
