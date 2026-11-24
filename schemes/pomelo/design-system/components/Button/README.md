# Button

按钮：手画的边（笔色 1.6，圆角 9），纸面是手剪的填色。按下去扁一下、松手弹回来（动效零件另做）。

**写法**：
- 主按钮：`<button class="pm-btn" data-hand="button">`，纸面 `color-primary`，字和图标 `color-on-primary`。一屏最多一两个。
- 普通：`class="pm-btn pm-btn--plain" data-hand="button" data-fill="card"`，卡面加墨色的字。
- 危险：`class="pm-btn pm-btn--danger"`，不画框，`color-danger` 的字和图标（「丢掉」）。要确认的危险操作才用 `data-hand="button" data-fill="danger"` 加 `color-on-danger` 的字。
- 圆的图标按钮：`class="pm-btn pm-btn--icon" data-hand="round"`，40 × 40，图标是 `color-pen`，必须写 `aria-label`。
- 不能点：`disabled`，整体淡到 0.45。

**尺寸**：高 34，左右 15，字 15（`text-body-lg`），图标 16 放在字前面，间距 6。键盘焦点是 2px 的 `color-primary` 实线，外扩 3px。

**使用方提供**：动词开头的短字（「记一笔」「存一下」「取消」）；可选的图标；种子。

**不要**：把按钮写成长句；按钮套方框阴影；一排放三个以上的主按钮；按钮的字跟着按钮歪。
