# Tooltip

鼠标提示：一根 2px 的线（`color-ink-soft`）从图标按钮下面垂下来，挂着一张便签纸的小签（`color-sticky`、字 `color-on-sticky`、13）。出现时晃两下停住（动效零件另做）。

**写法**：按钮下面放 `<span class="pm-tip" role="tooltip"><span class="pm-tip-string"></span><span class="pm-tip-tag">置顶</span></span>`，绝对定位在按钮正下方 4px。按钮本身要有同样的 `aria-label`。

**用在**：只有图标、没有字的按钮。

**使用方提供**：两三个字，和按钮的 `aria-label` 一样。

**不要**：在提示里写句子或快捷键说明；给有字的按钮加提示；黑底白字的浮层。
