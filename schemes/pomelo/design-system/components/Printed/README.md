# Printed

印出来的东西：年度小报（Atlas）里的票根、信纸、小报的纸。颜色固定用 `color-print-*`，不跟配色走，深色模式下也是浅色的纸。

**写法**：
- 票根：`<div class="pm-ticket" data-hand="ticket" data-tilt="-5">`，104 × 104，两侧缺口，上面一条撕线 `pm-ticket-tear`，里面 `pm-ticket-kind`（小字）和 `pm-ticket-name`（粗）。纸是 `color-print-paper`（第二种纸色写 `--pm-print: var(--color-print-cream)`），字 `color-print-ink` / `color-print-ink-soft`。
- 信纸：`<div class="pm-letter">`，浅色的纸，32px 一行的横线（`color-print-rule`），苹方 15；最后一行落款「— 柚子」用手札体。

**用在**：年度小报的各幕、柚子的来信、桌上的信封里那本小报。信封是牛皮纸（`color-kraft`、`color-kraft-inside`、`color-kraft-flap`），用柚子贴纸封口，等柚子的正式图进来再画。

**使用方提供**：编的数据（片名、天数、书名都编）；每张票根的种子和歪的角度。

**不要**：跟着暗色模式把纸变深；在印出来的东西上用 `color-ink`、`color-paper` 这些跟配色走的颜色。
