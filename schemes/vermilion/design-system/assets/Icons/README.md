# Icons

本系统自有的图标：漫游路径小图标、图形语言的分类图形、文末落款与内容图标；通用图标用 Lucide（见说明里的「图标」一节），不收录在这里。

- `glyph-<类别>-light.svg` / `-dark.svg`：分类图形三笔版，64 网格，显示 ≥ 48px（无封面卡片 44px 也用它）。类别：`write` 写作、`project` 项目、`gallery` 画廊、`create` 创作、`travel` 游记、`other` 其他。已经按页面底色上好色：`-light` 放在浅色页面上，`-dark` 放在暗色页面上。网页里要悬停写出的动效时，用 CategoryGlyph 的内联写法。
- `glyph-<类别>-simple-light.svg` / `-dark.svg`：简笔版，1–2 笔，显示 ≤ 32px。
- `icon-<名字>-light.svg` / `-dark.svg`：24 个内容图标，64 网格，写进内容、替代 Emoji，显示约 1.2em（见 ContentIcon）。名字：`tip` 提示、`caution` 注意、`idea` 想法、`done` 完成、`wip` 进行中、`question` 疑问、`link` 链接、`place` 地点、`time` 时间、`date` 日期、`mail` 邮件、`download` 下载、`book` 读书、`music` 音乐、`film` 影视、`photo` 摄影、`paint` 绘画、`food` 美食、`heart` 喜欢、`star` 推荐、`code` 代码、`trip` 出行、`flag` 目标、`pen` 写作。
- `end-mark-<版>-light.svg` / `-dark.svg`：文末落款，64 网格，显示 40px。三版：`arrive` 抵达、`hills` 远山、`dots` 三点；网站每次随机显示一版（见 Prose）。

- `route-glyph.svg`：漫游路径小图标，32 网格，与 Logo A 同一母题。单色线稿，用 `currentColor`，放在页面里用 `color-accent` 上色、线宽 2.4、高度等于字号；用 `<img>` 显示时会是黑色。只放在小标题前（见 SectionHeading）。
