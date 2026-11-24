# Icon

界面小图标的画法：24 格一笔单线，线宽 2、抖动 0.32，跟着文字颜色（`currentColor`），没有填色和白边。这里的十几个只是画法示意；正式的一套 168 个（替换 Lucide，加见字如面的 19 个）在 Assets 的 Icons，用的时候先在那里找。

**写法**：`<span data-hand="icon" data-size="20" data-d="M12 5 L12 19 M5 12 L19 12">`。`data-d` 只认绝对的 M L C Q Z；圆写 `data-o="cx cy r"`，圆角方块写 `data-rect="x y w h r"`，实心小点写 `data-dots="cx cy r"`，多个用逗号隔开。颜色由外面的 `color` 决定：正文里跟 `color-ink`，图标按钮里是 `color-pen`，删除是 `color-danger`。

**选中**：底下抹一笔荧光笔（`pm-mark` + `data-hand="marker"`），不加方框，不换颜色。

**大小**：16（行内小字旁）、20（按钮、输入框里）、24（工具栏）。

**使用方提供**：图标的路径（按 24 格画）、种子、尺寸。

**不要**：拿 Lucide 或别的通用细线图标混着用；给小图标加填色、白边或描边框；选中时套方框。
