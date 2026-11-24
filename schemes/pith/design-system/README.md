Pith 的 Design System：站主的 macOS 研究工作台。花园笔记（奶油纸、衬线、海蓝和绯红、生长阶段、页边注）× 铅字 × 数字花园（实心一粗一细的图标，每个一处珊瑚色的芽或种子）。一屏只放这一步要的东西，能说话代替的就不画按钮。视觉基线在方案的 `DESIGN.md`。

## 怎么用

- 页面最外层写 `class="pith"`（界面的字、正文色、页面底）；读的东西（回答、标题、卡片标题）用衬线，组件里已经写好。
- **配色**：两套。默认纸与海；根上写 `data-palette="mist-ochre"` 换成雾与赭。**明暗**：根上 `data-theme="dark"`。两套、明暗的变量名都一样。局部也能换（色板预览就是这样画自己的）。
- **样式**：先 `tokens.css`，再 `components/bundle.css`（最后是动效零件，同一份）。挂到画布上时，画板在 `support.js` 那行后面依次写 `<link rel="stylesheet" href="ds/pith/tokens.css">`、`<link rel="stylesheet" href="ds/pith/components/bundle.css">`。
- **类名**以 `pith-` 开头。组件写在 `components/<名字>/README.md`，预览就是标准写法。图标放内联 SVG（Assets 里的文件），类名留着，动效照它动。

## 颜色

- 底：`color-page` 页面（纸），`color-surface` 卡片、输入框、表格，`color-raised` 右侧面板、弹层、⌘K，`color-tint` 悬停的纸片和选中的行。线：`color-line`、`color-line-2`（装饰，不查对比）。
- 字：`color-text` 正文，`color-text-2` 次正文，`color-text-3` 说明，`color-text-4` 最淡的字（日期、计数）。
- 强调：`color-accent`（叶脉、枝桠、发送、选中），字用 `color-accent-text`（链接、编号），底上的字 `color-on-accent`。第二色 `color-second`（类型标签、页边注出处、角色头像）。
- **珊瑚** `color-coral` 只点缀：图标里的芽和种子、+1、悬停最后抵达的点、当前那条的节点。不写字（亮底上 Lc 约 44）。

## 组件

- 框架：`TopBar`（Logo + 三个图标，不写字）、`Branch`（对话历史、设置的枝桠导航，没有底色）。
- 对话：`Composer`（输入框、/ @ #、发送、「在想」）、`Status`（状态行和 Agent 图标）、`Answer`（回答、编号、页边注）、`DeliveryCard`（交付卡和「存进……」）。
- 知识库、文献库：`KnowledgeCard`、`LibraryRow`。设置：`Appearance`（两块色板）。控件：`Buttons`（按钮少，链接多）。图形：`Icons`。

## 动效

三种性格：**舒展**（回答一段段展开、页边注展开）、**生长**（存进知识库的种子、Logo、顶栏图标）、**上墨**（悬停）。悬停的替身类 `.is-hover`，只放一次的 `.is-in`，页边注 `.is-open`，存卡落下 `.is-fed`。减弱动态效果时都停在最后的样子。零件在 bench 的 Motion Deck 里一个个看。
