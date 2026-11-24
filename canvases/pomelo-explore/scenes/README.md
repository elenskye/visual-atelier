# Pomelo Explore · Atlas 新的几幕

Pomelo Explore「EX8：Atlas 新的几幕」那一页：Atlas 的设计 Tabloid 1.1.x 加的几幕，定稿前画的样子（Pomelo v1.0 Phase 7）。站主在现用账号的云端画布 [Pomelo · Atlas 新的几幕](https://claude.ai/artifact/MBRQCCdyeGhiJ7PFhbBpuN) 上看、批，源在 Pomelo 的原型里画，11-16 并进来。

- 11-16 批了：玩物有志用 B · 掌机，加「玩到二周目以上」；通用幕的十个零件、三种排法、四个例子、放在哪和 SKILL；「多选的词」的字在圆的正中。照这些定稿成 Tabloid 1.1.0（`schemes/pomelo/atlas/tabloid/parts.mjs`）。
- 写下的字（见字如面）11-16 第三轮批了：拆成两幕（第一幕小树和十二支铅笔，第二幕重要的时刻和柚子的附言），小树是一根竖着的树干、主标签是左右伸出去的枝、子标签是小枝、柚子大小是篇数；树顶挑了 B（挂一块写「没打标签」的木牌，A 坐着柚子没用）。照它定稿成 Tabloid 1.1.1（`writing.mjs`），替掉 1.1.0。

| 画板 | 内容 |
| --- | --- |
| `Scenes-Writing` | 写下的字的两幕、小树的两种树顶、换一份数据的树 |
| `Scenes-Games` | 玩物有志 B · 掌机，三份数据（平常的一年、玩得多的一年、没有玩第二遍的一年） |
| `Scenes-Kit` | 通用幕的十个零件和三种排法 |
| `Scenes-Custom` | 四个模块排出来的样子（咖啡馆、日语、想去的展、爬过的山） |
| `Scenes-Flow` | 新的几幕放在哪（目录两栏）、通用幕怎么排出来、SKILL 草稿（Pomelo 里用的定稿在它的 `youzi/made.rs`） |

**文件**：`gen.mjs` 写五张画板和 `canvas.json` 里的这一页（`../page.mjs`）；`SKILL.md` 是 SKILL 的草稿。`project/` 不手改。

```bash
node canvases/pomelo-explore/scenes/gen.mjs
```
