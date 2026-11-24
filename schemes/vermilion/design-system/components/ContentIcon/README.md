# ContentIcon

内容图标：写进网站内容里、替代 Emoji 的小图形，24 个。画法是「笔势与纸片」的简笔加纸片：一张纸片垫底，1–2 笔青绿的笔势。

**写法**：Markdown 正文与 frontmatter 的文字字段里写 `:名字:`，例如 `:tip: 中文页面简历仍在完善中`。网站构建时换成内联图标。只认清单里的名字，其他冒号写法原样保留；行内代码与代码块里不替换。清单与写法说明在本方案的 `marks/icons.json`、`marks/icons.md`。

**清单**：提示与状态 `tip` 提示、`caution` 注意、`idea` 想法、`done` 完成、`wip` 进行中、`question` 疑问；信息 `link` 链接、`place` 地点、`time` 时间、`date` 日期、`mail` 邮件、`download` 下载；生活与创作 `book` 读书、`music` 音乐、`film` 影视、`photo` 摄影、`paint` 绘画、`food` 美食、`heart` 喜欢、`star` 推荐、`code` 代码、`trip` 出行、`flag` 目标、`pen` 写作。

**结构**：`span.va-icon`（`role="img"`、`aria-label` 是页面语言的标签）里放内联 SVG（`svg.va-graphic`，64 网格，自身 `aria-hidden`）。纸片 `path.va-paper`，笔势 `path.va-ink`。

**尺寸**：跟着字号走，`1.2em` 见方，基线下沉 `0.22em`，两侧各留 `0.1em`；放在 ButtonLink 里时不缩小，与文字之间 `0.35em`。24px 是检验尺寸。

**颜色**：笔势 `color-accent`，纸片按图形语言取与所在底色相邻的一层面色。放在链接或按钮里，悬停时笔势跟着文字变色（正文链接变朱红，按钮仍是 `color-accent-strong`）。笔势在页面、卡片、纸片与悬停底色上都过 APCA Lc ≥ 60。静态，不做动效。

**和 Lucide 分工**：Lucide 管网站界面自己的通用图标（导航、按钮图标、搜索、社交入口、卡片控件）；内容图标只出现在内容里，由写内容的人选用。两套不混用。

**使用方提供**：写在内容里的 `:名字:`；读屏标签按页面语言取。

**不要**：在界面控件上用内容图标；在内容里用 Emoji 或 Lucide；放大成插图或放进标题；一句话里连排一串；手改 SVG。
