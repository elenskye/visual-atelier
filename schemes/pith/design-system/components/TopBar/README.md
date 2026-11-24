# TopBar

顶栏：左边 Logo（点它回对话），三个图标居中、不写字（悬停 0.35 秒后出名字）。没有搜索框，搜索是 ⌘K；没有侧栏按钮，对话历史是 ⌘\ 或两指往右滑。

**写法**：`<header class="pith-topbar"><button class="pith-brand">Logo + <span class="pith-wordmark">Pith</span></button><nav class="pith-topbar-nav">三个 <button class="pith-iconbtn pith-ink">图标<span class="pith-tip">知识库</span></button></nav></header>`。
- 当前所在的那一屏加 `is-current`（图标变 `color-text`）。
- 悬停：三个图标各自长出来（Motion Deck 的 `topbar-grow`），Logo 从底下长出来、结果（`logo-grow`，App 打开时也长一次）。Logo 用 `marks/logo/pith-grow.svg`。
- 存卡：知识库图标加 `is-fed`、`+1`（`.pith-badge`）加 `is-in`（`save-grow`）。
