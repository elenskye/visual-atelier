# PenMarks

笔迹：荧光笔划过、墨线划掉、手写下划线、手画的分割线、小票的虚线、十字绣的 ×。都是手画的，同一个种子永远画出同一笔。

**写法**（行内的字用 `span` 包起来）：
- 荧光笔：`<span class="pm-mark" data-hand="marker">交作业</span>`，`color-marker`、12px 粗，画在字下面，字还是 `color-ink`。
- 划掉：`<span class="pm-strike" data-hand="strike">给猫买粮</span>`，字和线都是 `color-ink-soft`，线宽 2。完成的待办用它（见 Checkbox）。
- 手写下划线：`<span class="pm-underline" data-hand="underline">`，笔色 1.6。
- 分割线：`<span class="pm-rule" data-hand="rule">`（块元素，给宽度），笔色 1.6。
- 小票虚线：`<span class="pm-dash">`，2px `color-line` 虚线，不用画。
- 十字绣的 ×：`data-hand="icon" data-d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5"`，颜色用 `color-thread-1` 到 `-4`，记得越多线越深（年度小报「留下的日子」）。

**用在**：问候和关键词的强调、完成的事、选中的小图标（荧光笔垫在下面）、纸上的分段。

**使用方提供**：要强调的字（一行之内）、种子。

**不要**：一段里抹好几处荧光笔；用荧光笔当大块底色；划掉还没完成的事。
