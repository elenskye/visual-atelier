# 内容图标 · 写法说明

内容图标是写进网站内容里的小图形，用来替代 Emoji，例如提示、地点、时间、读书。画法是「笔势与纸片」的简笔加纸片：一张纸片垫在下面，1–2 笔青绿的笔势。规则见 `DESIGN.md` §6「内容图标」。

清单以生成的 `icons.json` 为准（名字、中英文标签、关键词，以及可以直接内联的 SVG）。源文件是 `graphic/icon-<名字>.svg`，由 `tooling/graphic/` 生成，不手改。

## 怎么写

在 Markdown 正文里，或 frontmatter 的文字字段里（例如职业页按钮的 `label`），写两个英文冒号夹着图标名：

```markdown
:tip: 中文页面简历仍在完善中
下次约在 :place: 解放碑，:time: 下午三点。
```

- 图标名只认下表里的 24 个。别的冒号写法原样保留，例如 `10:30`、`:abc:`。
- 代码里不替换：行内代码与代码块里的 `:tip:` 照原样显示。
- 图标前后要不要空格随意；网站会在图标两侧各留一点空隙。
- 读屏会读出图标的标签：中文页读中文（「提示」），英文页读英文（“Tip”）。图标只是点缀，句子本身要能读通。

## 清单

| 写法 | 中文 | English | 写法 | 中文 | English |
| --- | --- | --- | --- | --- | --- |
| `:tip:` | 提示 | Tip | `:download:` | 下载 | Download |
| `:caution:` | 注意 | Caution | `:book:` | 读书 | Book |
| `:idea:` | 想法 | Idea | `:music:` | 音乐 | Music |
| `:done:` | 完成 | Done | `:film:` | 影视 | Film |
| `:wip:` | 进行中 | In progress | `:photo:` | 摄影 | Photo |
| `:question:` | 疑问 | Question | `:paint:` | 绘画 | Painting |
| `:link:` | 链接 | Link | `:food:` | 美食 | Food |
| `:place:` | 地点 | Place | `:heart:` | 喜欢 | Like |
| `:time:` | 时间 | Time | `:star:` | 推荐 | Recommended |
| `:date:` | 日期 | Date | `:code:` | 代码 | Code |
| `:mail:` | 邮件 | Mail | `:trip:` | 出行 | Trip |
|  |  |  | `:flag:` | 目标 | Goal |
|  |  |  | `:pen:` | 写作 | Writing |

## 用在哪、不用在哪

- 用在内容里：正文句子、列表、frontmatter 的文字字段。一句话里一两个就够，不连排一串。
- 不用在网站界面上：导航、按钮图标、搜索、社交入口、卡片上的控件用 Lucide 通用图标（`DESIGN.md` §6），两套不混用。
- 不用在标题里，也不放大成插图：它只为正文字号画（约 1.2em）；要大图用分类图形或大图。

## 给使用方

- 网站：构建时把 `:名字:` 换成内联 SVG，外面包一层 `<span class="va-icon" role="img" aria-label="标签">`；SVG 加 `va-graphic`，样式由 `graphic/graphic.css` 给出（笔势 `--va-ink` 青绿，纸片 `--va-paper` 取所在底色相邻的一层面色）。在链接与按钮里，悬停时笔势跟着文字变色。
- Pomelo「呦呦漫游」编辑器：复制 `icons.json` 做图标选择器，只插入 `:名字:` 这段文字；选择器里的预览可以直接用其中的 `svg`。没有引入 `graphic.css` 的地方，笔势跟随文字颜色，纸片不画。
- 要 `<img>`、贴进文档或幻灯片时，用构建产物里上好色的 `themed/icon-<名字>-light.svg` / `-dark.svg`。
