# SectionDeco

分区装饰：页面大标题旁的一幅小景——两层纸山叠在右下，一笔提按长笔从左横过，右上一个圆相。图形语言「笔势与纸片」的大图版。

**结构**：`div.va-section-deco` 里放内联 SVG（`svg.va-graphic`，560 × 220），标记取 `motion/section-deco-intro/section-deco-intro.fragment.html`。放在 PageHeading 里：外层 `.page-head.page-head--deco` 是两栏网格（文字一栏，装饰一栏 `min(380px, 40%)`，栏间 `space-6`），装饰跨三行、贴着导语底部；≤ 760px 移到导语下方，靠右，宽 `min(78%, 320px)`。

**颜色**：笔势 `color-accent`；第一层纸页面底上浅色 `color-surface-cool`、暗色 `color-surface`，第二层纸 `color-line`。没有朱红。

**入场（expressive，登记表面 `section-deco-intro`）**：片段的外层已带 `is-playing`，纸片每张 420ms、相隔 140ms 升起，笔画每笔 520ms、相隔 170ms 写出，整段约 1030ms，之后静止。**每次打开网站只写一次**：页面 `<head>` 里先运行 `motion/section-deco-intro/section-deco-intro.once.js`，同一次访问里之后的页面（站内跳转或刷新）根元素带 `data-va-visited`，直接显示终态。不加 `is-playing` 就直接显示静态图。减弱动效时显示静态终态。

**用在**：网站不用，页头留白（2026-11-01 站主改定；2026-10-31 曾放三页）。留给 PPT、动图等别处：大标题旁一处，每屏只此一处。要用 `<img>` 或贴进别处时，用 `assets/Illustrations/section-deco-light.svg` / `-dark.svg`。

**不要**：放在正文段落之间或当分隔线；循环播放；同屏放两处；给它加边框、底色块或阴影；用朱红画笔势。
