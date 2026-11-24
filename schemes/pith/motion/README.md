# motion

Pith 的动效零件：每个一个目录，一份规格（`motion.json`）、一份 CSS、一个演示片段（`*.fragment.html`）。三种性格和数值见 `DESIGN.md` §7、`tokens/motion.json`。

**一份实现，到处用同一份**：零件的 CSS 直接套在 Design System 的类名上（`pith-ink`、`pith-brand`、`pith-agent`……），`npm run build:ds -- --scheme pith` 把全部零件插进 `bundle.css` 的 `/* @generate motion */`；画布 R1 也用这一份。`npm run build:motion -- --scheme pith` 逐帧导出 GIF 和总览图（`dist/pith/motion/<id>/`），bench 的 Motion Deck（`/#/motion/pith`）用同一个页面。

**写法**：

- 悬停都配一个替身类：`:hover` ↔ `.is-hover`；只在某一刻放一次的用 `.is-in`（Logo 打开时、回答一段、种子、波纹）；页边注展开是 `.is-open`，存卡落下是 `.is-fed`。
- `.is-frame` 加 `--at: <秒>` 把动画定在那一刻（分解图用）；时间都写成 `calc(起点 - var(--at))`，所以分解图和真的播放是同一份。
- 类名和关键帧名以 `pith-` 开头；每个零件都写 `@media (prefers-reduced-motion: reduce)`，停在最后的样子（分解图照样定格）。
- 演示片段用 `<!-- @include marks/… -->` 直接放图标文件；规格里 `requires` 带上 `design-system/bundle.css`（演示页的底只有 token）。

| 零件 | 档位 | 说明 |
| --- | --- | --- |
| `hover/` | calm（0.52 秒） | 上墨：图标按钮、链接、列表行、卡片、按钮 |
| `topbar-grow/` | expressive（≤ 1.32 秒） | 顶栏三个图标各自长出来，珊瑚色最后出现 |
| `logo-grow/` | expressive（1.74 秒，待批） | Logo 从底下长出来，结一颗果 |
| `agents/` | expressive（循环） | Pith 在想：十四个 Agent 图标、状态行的光、「存进知识库」的 `.once` |
| `unfold/` | expressive（≤ 1.4 秒） | 舒展：回答一段段展开、页边注展开 |
| `save-grow/` | expressive（1.9 秒） | 生长：种子落到知识库图标、晃一下、+1 |
| `palette-lake/` | expressive（2.3 秒） | 换配色：五圈湖面波纹、水面晃一下、颜色慢慢过渡 |
