# Pomelo Explore · 见字如面

Pomelo v1.0 · Phase 1 的设计：新模块「见字如面」（写成篇的文章和长笔记，替代 Bear），写三页。需求在 Pomelo 的 `docs/requirements.md`「文章「见字如面」」，计划在 Pomelo 的 `docs/roadmap.md`。站主 11-13 在现用账号的云端画布 [见字如面](https://claude.ai/artifact/79kFbKGj2nSXFqpE7o6D3k) 上批了原型、导出设置和两种 PDF（印刷那种），贴纸挑 B 纸飞机；云端停在那一轮，只看。

| 页 | 画板 |
| --- | --- |
| EX5：见字如面的贴纸 | `X5-Sticker`：A 漂流瓶、B 纸飞机、C 字里的笑脸（定了 B，进了方案 0.7.0） |
| R6：见字如面原型 | `Notes-Main`（三栏，列表和正文合在一张卡里）、`Notes-Fold`（往左滑一次：收起标签）、`Notes-Select`（深色，选中文字时才出格式条）、`Notes-Menu`（右键的格式）、`Notes-Locked`（加密的笔记）、`Notes-Focus`（专心写：占满整个窗口）、`Notes-Settings`（设置子页） |
| R7：见字如面格式条、PDF | `Notes-Toolbar`（格式条、「更多格式」、新画的 19 个图标）、`Notes-Export`（导出时弹的设置）、`Notes-PDF-Pomelo`、`Notes-PDF-Print`（PDF 的两种样式，A4 按 1 pt = 1 像素画） |

原型的七张板是同一份，起始画面不同；点得动：换一篇、点左栏、拖卡片左边和列表右边的虚线调宽（各栏有最小宽度）、双指左右滑收起 / 放出左边两栏、右键正文、格式条右边的图钉、「专心写」和右上角「缩小」、Touch ID 打开、「导出」、纸签「设置」里调字号 / 行距 / 正文宽度。Tweaks：配色、明暗、格式条两种模式、贴纸方案。

## 文件

- `gen.mjs`：生成三页的画板和 `canvas.json` 里的这三页（`../page.mjs`，一页一页写，两页共用 `Notes-` 前缀）。外框照「R1：外框（B3）」的 `Frame-Page`；手画的框、线、勾选都用挂上的 Design System「Pomelo 柚儿园」。
- `notes.css` 样子，`app.js` 交互（原样放进每张能点的板）。
- `drafts.mjs`：贴纸没选上的 A 漂流瓶、C 字里的笑脸（`X5-Sticker` 和原型 Tweaks 的贴纸方案要用）。图标和贴纸 B 已经在方案里（`icons.mjs` 第 3 批、`art.mjs` 的 `articles`），画板直接取 `schemes/pomelo/marks/` 生成好的。
- 假数据：笔记、金额、人名都是编的。

```bash
node canvases/pomelo-explore/notes/gen.mjs
```

```bash
VA_BROWSER_CHANNEL=chrome node bench/bin/dw.js check pomelo-explore
```

正文和笔记列表是能滚的区域，下面还有内容，标了 `data-nolint`。
