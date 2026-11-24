# Pomelo Explore

Pomelo 的 Explore Deck：探索和优化都在这一块，按页分（站主 2026-11-13：每个方案一块）。站主在 bench 里看和批：`http://127.0.0.1:4321/#/pomelo-explore`，打开落在「R6：见字如面原型」。批准记录在 `db.json` 的 `review/<画板>`，`node bench/bin/dw.js review pomelo-explore` 读。

页名（EX<N> 探索、R<N> 优化）和留什么照 `canvases/README.md`「Explore Deck 的规矩」：**探索**（从几个里挑）全留，**优化**（同一样东西改好几轮）每项只留最新的一份。

## 页

| 页 | 画板 | 源 |
| --- | --- | --- |
| EX1：三种画法、维度、颜色、动效 | 6 张 `X1-*`（Phase 1 第一轮：S1 贴纸、S2 错版线描、S3 线描贴纸） | 冻结，生成器已删 |
| EX2：线描贴纸第二版、两个配色家族 | 5 张 `X2-*`（钢笔家族、色面家族） | 冻结，生成器已删 |
| EX3：外框 A 和 B3 | 8 张 `X3-A-*`、`X3-B-*`（Phase 2 第一轮，选了 B3） | 冻结，生成器已删 |
| EX4：五套配色、对比度、手作零件、动效 | 4 张 `X4-*`（Phase 3，站主 2026-11-05 批） | 冻结，生成器已删 |
| EX5：见字如面的贴纸 | `X5-Sticker`（A 漂流瓶、B 纸飞机、C 字里的笑脸，定了 B） | `notes/` |
| EX6：跨模块联动 | 15 张 `Links-*`（文章里嵌笔记、`[[` 的提示、笔记里的链接、写文章时翻笔记、记到念念不忘、链到这里的） | `links/` |
| EX7：玩物有志 | 5 张 `Games-*`（表格、平台、面板和周目；贴纸 A 卡带、B 掌机、C 手柄，定了 B） | `links/` |
| EX8：Atlas 新的几幕 | 5 张 `Scenes-*`（写下的字两幕和小树、玩物有志 B · 掌机、通用幕的零件和排法、四个模块的例子、放在哪和 SKILL；Tabloid 1.1.1 照它定稿，小树挑了树顶 B） | `scenes/` |
| R1：外框（B3） | 5 张 `Frame-*`，能玩的原型 | `frame/` |
| R2：柚子、贴纸、App 图标 | 12 张 `Marks-*` | `marks/` |
| R3：界面小图标 | 3 张 `Icons-*` | `icons/` |
| R4：动效、空状态 | 7 张 `Motion-*` | `motion/` |
| R5：Atlas 年度小报 | 5 张 `Atlas-*` | `atlas/` |
| R6：见字如面原型 | 7 张 `Notes-*`，能玩的原型 | `notes/` |
| R7：见字如面格式条、PDF | `Notes-Toolbar`、`Notes-Export`、`Notes-PDF-Pomelo`、`Notes-PDF-Print` | `notes/` |
| R8：侧栏展开 | `Fold-Sidebar`，能玩的原型（标签树、文件夹、分组三栏；零件 `motion/fold`，站主 2026-11-24 挑了 C 并批准） | 手写，没有生成器，直接改 `project/Fold-Sidebar.dc.html` |

每个目录的 `README.md` 写它那一页的画板和做法。`schemes/pomelo/` 清单里「pomelo-marks 的 Main」这类出处，说的是这里带前缀的板（`Marks-Main`）。

## 生成和检查

在仓库根目录 `nvm use`、`npm ci`、`npm run build:ds` 之后，改哪一页跑哪一页：

```bash
node canvases/pomelo-explore/notes/gen.mjs
```

```bash
VA_BROWSER_CHANNEL=chrome node bench/bin/dw.js check pomelo-explore
```

- **先别重跑 `atlas/`、`marks/` 的生成器**（2026-11-24 发现）：`project/` 里 `Atlas-Main`、`Marks-*` 共 11 张板和 `canvas.json` 已经和现在的生成器对不上，重跑会把它们改掉。要重跑先在一份副本里跑、比对，确认改动是想要的。
- 每页的生成器都用 `page.mjs` 的 `writePage`（实现在 `../_lib/page.mjs`）、画板外壳 `dsBoard` 和 `esc`：只写自己那一页的画板和 `canvas.json` 里自己那一页，别的页、画板、便签不动；页名、页的先后、打开时落在哪页都以 `canvas.json` 为准（站主在 bench 和有板有眼里能改名、删页），生成器只在一页还没有时把它加在最后。上面那张表以界面里的为准。
- 画板标题、删掉的画板不一样：重跑生成器会把它那一页的板名写回去、删掉的板加回来。站主在界面里改过板名或删过板的页，重跑之前先把改动写进生成器；新加的页照「EX<N>：主题」「R<N>：主题」起名。
- 同一份源两次生成逐字节一致。生成器取用仓库里的 token、工具和依赖都走 `../../_lib/root.mjs`。
- 这几页的板挂着 Design System「Pomelo 柚儿园」（`project/ds/pomelo/`）；`node bench/bin/dw.js ds install pomelo-explore pomelo` 换成新的。EX1–EX4 的板不用它。
- 站主在画布上挪过东西时，先拉回 `canvas.json`（`dw pull`）再生成，别把站主的改动盖掉。

## 冻结的生成器

- EX1–EX4 是当时批的样子，板原样留在 `project/`，不再生成。
- `p2-final/` 留着：它是 Phase 2 定稿，方案里动效零件、贴纸和手画零件写的出处都是它；它的生成器一跑就停（冻结）。

## 云端

- 旧账号 [Pomelo Explore](https://claude.ai/artifact/CwBUdwLqGsRxZz5hKiX143)（`cloud.json` 的 home）和现用账号的副本「Pomelo Explore_Copy」只有最早的两页，只看。
- 现用账号的 [Pomelo Fold](https://claude.ai/artifact/U7ieNnEjrX3dEdF2427atr)（R8 的原画布，站主 11-24 在那里批的；零件的 CSS 当时写在画板里，现在在 Design System 里）只看。
- 现用账号的 [见字如面](https://claude.ai/artifact/79kFbKGj2nSXFqpE7o6D3k)（站主 11-13 在那里批的）、[Atlas 年度小报（探索）](https://claude.ai/artifact/RNfxkLga1kUDvJMm4TPRYY) 和 [Pomelo · 联动和玩物有志](https://claude.ai/artifact/WiXRSdag98S76mVQB92eL8)（站主 11-15 批的，EX6、EX7）都停在旧的一轮，只看。
- 以本地为准，不再发回（ROADMAP「不做」）。真要发，照 `docs/cloud.md` 在现用账号新建一块。

## 两个坑

- `<use href="#某个 symbol">` 不写 `x y width height` 时，symbol 的 viewBox 原点会被挪到 (0, 0)，图会偏。用 symbol 就写全四个值。
- 版面检查只把「自己有底色或边框、带 `.wob` / `.tl` 子元素、或 class 有 `framed`」的祖先当成字的框。手画边放在子 `span` 里的按钮要加 `framed`。
