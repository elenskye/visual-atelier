# Callout

提示框（见字如面里 `> [!TIP]` 这样写的一段）：分类色的淡底，左边一道 3 像素的分类色，右边两个角圆 10；开头是那一种的图标（分类色，和字一样高、和字的中线对齐），不写名字。五种：

| 写法 | 名字 | 颜色 | 图标 |
| --- | --- | --- | --- |
| `NOTE` | 备注 | 天蓝 sky | 写（笔） |
| `TIP` | 提示 | 薄荷 mint | 灯泡 |
| `IMPORTANT` | 重要 | 葡萄紫 grape | 星星 |
| `WARNING` | 注意 | 橙 orange | 当心（三角） |
| `CAUTION` | 小心 | 樱粉 pink | 火 |

**写法**：`<div class="pm-callout is-tip"><span class="pm-callout-head" data-hand="icon" …></span>字</div>`（`is-note`、`is-tip`、`is-important`、`is-warning`、`is-caution`）。字一律是墨色 `color-ink`。

**用在**：见字如面的正文、导出的 PDF（印刷样式里也一样）；菜单里「提示框」那一组列五种。Pomelo 的编辑器一行一行地画它（`.co`），样子和这里一样。

**使用方提供**：哪一种、里面的字、种子。

**不要**：在开头写「提示」「注意」这些字；字用分类色；整块描一圈边。
