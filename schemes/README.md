# schemes

每个子目录是一套独立的视觉方案，方案之间不得借用对方的 token 与规则。版本、给谁用、谁在做，见根目录 `README.md` 的方案表。

| 方案 | 是什么 |
| --- | --- |
| `vermilion/` | 朱红：个人网站和站主对外的 PPT、动图 |
| `pomelo/` | 柚儿园：Pomelo，5 套配色、手绘线描贴纸 |
| `peck/` | Peck（站主的本地 Coding Agent）：点阵终端 × 深海，青色是唯一发光的颜色 |

每套方案先读它的 `CLAUDE.md` 和 `DESIGN.md`。新方案：`node bench/bin/dw.js scheme new <方案名> --title <显示名>`，它从 `_template/` 复制、填名字、跑一遍检查（`docs/architecture.md`「新方案怎么起」）。
