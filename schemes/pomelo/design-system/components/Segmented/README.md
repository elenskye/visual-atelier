# Segmented

分段：一条手画的框分成几格，选中的那一格抹一笔选中色（`color-selected`），字变粗。切换时荧光笔从旧的一格拖到新的一格（动效零件另做）。

**写法**：外框 `<div class="pm-seg" data-hand="field" role="group">`，每格 `<button class="pm-seg-item" aria-pressed="false">`；选中的那格写 `aria-pressed="true"` 并加 `data-hand="pick"`（手剪的那一抹）。高 36，每格至少 57 宽，字 14。

**用在**：一页里的筛选（全部 / 纪念日 / 生日 / 证件）、视图切换（月 / 周）。2–5 格。

**使用方提供**：每格两三个字、当前选中的是哪格、种子。

**不要**：超过 5 格（换成下拉）；选中的那格换成主色实心；把分段当成页签用。
