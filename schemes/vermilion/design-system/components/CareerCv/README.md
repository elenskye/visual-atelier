# CareerCv

职业页的简历：顶部一排描边按钮，下面按节排技能表和经历条目，左栏是标签或时间，右栏是内容。

**结构** `.cv`：

- 操作 `.cv-actions`：几个 ButtonLink 横排，间距 `space-4`。
- 分节 `section.cv-section`：节与节之间 `space-8`；节标题 `h2` 衬线 1.55rem、400。
- 技能表 `dl.cv-skills`：两栏（140px + 内容），技能名 `dt` 用 `color-accent-strong`，说明 `dd` 用 `color-muted`、行高 1.7。
- 经历条目 `.cv-entry`：两栏（150px 时间 + 内容），间距 `space-5`，条目间 `space-6`。时间 `.cv-period`（`text-sm`、`color-muted`）；标题 `h3` 衬线 1.22rem；机构 `.cv-org`（`text-sm`、`color-accent-strong`）；要点 `ul`（`color-muted`、行高 1.75，条目间 `space-2`）。没有时间的条目用 `.cv-entry--undated`（单栏）。

**窄屏**（≤ 760px）：两栏都改成上下排。

**使用方提供**：简历数据（技能、经历、时间、机构、要点）、邮箱与简历文件链接。

**不要**：给经历加卡片框或时间线节点（时间线是关于页的写法）；用进度条、星级表示技能熟练度。
