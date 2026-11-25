# Select

下拉框（1.1.0）。系统的 `<select>` 在 macOS 上弹出原生菜单、改不了样子，所以自己画：按钮是一行字加一个小折角，打开时折角翻上去；弹出的列表（`pith-menu`）从上往下舒展开一点，收起时往回收、淡出。右键菜单、「新建」这种按钮菜单用同一个列表。

**写法**：按钮 `<button class="pith-select">全部类型</button>`；表单里有框的加 `pith-select--field`，小一号加 `pith-select--s`，出错加 `is-bad`，打开时加 `is-open`。列表 `<div class="pith-menu">`，一项 `<button class="pith-menu-item pith-row"><span>名字</span><em>计数或快捷键</em></button>`：选中的 `is-on`（前面一颗海蓝的点、字加粗），键盘或鼠标停在上面的 `is-active`（淡底，珊瑚点落下来），危险的 `is-danger`（绯红）；分隔线 `<hr class="pith-menu-sep">`，分组 `<p class="pith-menu-group">`。贴着按钮放不下时翻到上面加 `is-up`，收起时加 `is-out` 演退场（约 0.14 秒）再拿掉；长列表加 `pith-menu--tall`。

键盘：↑↓ 移动、Enter / 空格选、Esc 收起、打字跳到开头对得上的那项。Pith 里是 `src/shared/controls.tsx` 的 `Select`、`Menu`。
