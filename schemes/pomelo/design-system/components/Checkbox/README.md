# Checkbox

勾选：22 的线描贴纸框（白底、笔色的边）；勾上时柚黄 `color-yuzu` 错开一点填进去、墨线 `color-art-ink` 画一个勾，那一行的字变淡并被墨线划掉。勾的时候果冻弹一下（动效零件另做）。

**写法**：`<button class="pm-check" role="checkbox" aria-checked="true"><span data-hand="check"></span><span class="pm-check-text" data-hand="strike">给猫买粮</span></button>`。勾没勾只看 `aria-checked`：没勾时柚黄、勾和划线都藏着。整行可点，至少 32 高。

**用在**：待办、打卡、清单。全做完撒一把小贴纸（招牌时刻）。

**使用方提供**：一行字（一行之内，划线按一行画）、状态、种子。

**不要**：勾上以后把那一行删掉或挪走（先划掉，留在原地）；用开关代替它；勾选框换成圆的。
