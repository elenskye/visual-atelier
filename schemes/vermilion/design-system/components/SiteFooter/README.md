# SiteFooter

每页底部的页脚：整条 `color-surface-cool` 分区，顶部一条 `color-line` 横线，左半是介绍，右半是链接列。

**结构**：`footer.site-footer > .footer-inner`，两等分网格，两半各自居中，上下内边距 `space-8`，宽度 `width-chrome`。文字 `color-muted`、`text-sm`、无衬线。

- 介绍 `.footer-intro`（纵向，间距 `space-5`）：衬线主句 `.footer-heading`（2rem，`color-text`，页脚里唯一的衬线字）→ RSS 胶囊 `.footer-rss-link`（44px 高、999px 圆角、1px `color-line` 描边，悬停描边和文字变 `color-ember` 并上浮 1px）→ 社交入口 `.footer-social` → 版权 `.footer-copyright`。
- 社交入口：每个 `a` 是 44px 点击盒、紧挨着排（间距 0），可见图形 24px；悬停变 `color-ember` 并上浮 2px。
- 链接列 `.footer-columns > .footer-col`：每列最多 6 个链接，纵向间距 `space-4`；悬停时文字变 `color-ember`、青绿下划线从两端收拢。

**使用方提供**：主句文案、RSS 地址、社交平台列表、链接列内容。GitHub、LinkedIn 在网站上用平台官方的单色品牌图形（实心、按 Lucide 的光学尺寸归一）；本系统不收录第三方标识，预览里用的是 Lucide 的替代图标 `git-branch`、`briefcase-business`。

**窄屏**（≤ 760px）：两半上下排，链接列在介绍下方。

**不要**：在页脚放第二种底色或卡片；给社交图标加圆形底；把品牌标识重画成线稿。
