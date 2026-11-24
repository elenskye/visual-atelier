# Status

状态行：一行短的，说 Pith 刚才在做什么。每一步一个 Agent 图标（Motion Deck 的 `agents`），在跑的那一步加 `is-run`（图标动、字是 `.pith-shimmer`），做完加 `is-done`（停住、变淡）。点开能看工具调用。

**写法**：`<p class="pith-status"><span class="pith-status-step is-done">图标<span>找了 6 段</span></span>…</p>`。图标跟着工具调用的事件换，不按时间假装。
