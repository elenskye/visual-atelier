# CategoryGlyph

分类图形：图形语言「笔势与纸片」的小号——一张柔软的纸片垫底，两三笔两头收尖的笔势写在上面。六个类别：写作、项目、画廊、创作、游记、其他。

**结构**：`span.va-glyph` 里放内联 SVG（`svg.va-graphic`，64 网格）。纸片是 `path.va-paper`，笔势是 `path.va-ink`，悬停时写出笔画用的遮罩与朱红点 `circle.va-ember` 都在 SVG 里。整段标记直接取 `motion/category-glyph-hover/category-glyph-hover.fragment.html`，用哪个类别取哪个；同页放多个时，遮罩 id 要各自唯一。

**两种尺寸**：显示 ≥ 48px（无封面卡片的 44px 也算）用三笔版；≤ 32px 用简笔版（`assets/Icons/glyph-<类别>-simple-*.svg`，1–2 笔，纸片不变），简笔版不做动效。

**颜色**：笔势 `color-accent`；纸片取「与所在底色相邻的一层面色」——页面底上浅色用 `color-surface-cool`、暗色用 `color-surface`；放在表面底上（卡片悬停、面板）时外层加 `va-on-surface`，两种模式都用 `color-surface-cool`。没有朱红，朱红点只在悬停抵达时出现。

**悬停（expressive，登记表面 `category-glyph-hover`）**：图形或外层 `.va-glyph-trigger`（例如整张无封面卡片）悬停、键盘聚焦时，纸片 260ms 滑入，笔画每笔 340ms、相隔 100ms 写出，朱红点在 82% 之后抵达，整段 700ms；离开即回到静态。卡片的上浮、标题变色仍按 `calm`。减弱动效时直接显示终态。

**用在**：无封面卡片（44px，放在标题左侧，替代 Lucide 的类别图标；网站 2026-10-31 起使用写作、项目、画廊、创作四类，游记、其他留作备用）、分类图形单独出现处。

**不要**：给笔势换颜色或用朱红画笔势；去掉纸片只留笔势；把纸片做成卡片背景；在同一处混用三笔版与简笔版；把图形放大成装饰（大图用 SectionDeco 与 `assets/Illustrations/`）。
