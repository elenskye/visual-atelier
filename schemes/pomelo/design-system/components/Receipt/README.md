# Receipt

小票：一张白纸从出纸口打出来，锯齿底边，虚线分段，数字右对齐。

**写法**：`<div class="pm-receipt">` 里放 `pm-receipt-head`（居中的小字，「— 柚儿园 · 找东西 —」）、`pm-receipt-row`（左边名字、右边 `pm-num` 数字）、`pm-receipt-cut`（2px 的 `color-line` 虚线）、`pm-receipt-total`（合计，粗）、`pm-receipt-foot`（「谢谢光临 · 柚子」）。纸面 `color-card`，锯齿 10px 深，都在样式里，不用 `Pomelo.paint`。

**用在**：资产和记账的明细、全局搜索（找东西）的结果、年度小票。

**使用方提供**：一行一项；金额自己格式化（`¥1,234.50`）。手札体的数字等宽，右对齐就齐，不用换字体。

**不要**：在小票里画竖线或表格框；把小票做成圆角卡片；金额左对齐。
