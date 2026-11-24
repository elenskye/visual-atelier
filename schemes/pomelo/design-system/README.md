Pomelo（柚儿园）是站主自己 Mac 上的手账式桌面 App。一张摊开的桌面，上面是手账：手画的墨线、错开一点的颜色、带白边的贴纸、胶带和纸；纸可以歪，字永远是正的、清楚的；处处有小动静，动起来都像纸和贴纸。

## 怎么用

- 把一块页面（或根元素）写成 `class="pm"`：字体、字号、行高、墨色都从这里来。桌面底色加 `pm-desk`。
- **配色**：默认是蓝笔 · 方格纸，不用写什么。换配色在任何元素上写 `data-palette="purple"`（紫笔 · 樱粉荧光）、`"kraft"`（黑笔 · 牛皮纸）、`"yellow"`（柚黄桌面）、`"mint"`（薄荷桌面）。**明暗**写 `data-theme="dark"` / `"light"`。两个属性写在同一个元素上、或谁套着谁都行，变量名不变（`--color-paper` 还是 `--color-paper`）。Design System 页上的「浅色 / 暗色」是蓝笔的明暗，五套并排看 Palettes。
- **手画的线**：框、线、笔迹、胶带、缝线、勾选框、星星都是手画的，由 `components/bundle.js` 画。元素写 `data-hand="<名字>"`，页面最后调一次 `Pomelo.paintLive(document.body)`（只画一次用 `Pomelo.paint(el)`）。它按元素的宽高算出手画的线，放进元素里一层 `[data-hand-painted]`，垫在内容下面，不改元素的大小。
  - 框的预设：`card` 卡片、`sheet` 模块页的纸（带缝线、方格）、`note` 便签、`desk` 桌面纸纹、`button` 按钮、`field` 输入框和下拉、`round` 圆的图标按钮、`cell` 小卡片、`pick` 选中的一抹、`frame` 只画边。
  - 线和形状：`rule` 分割线、`underline` 手写下划线、`marker` 荧光笔、`strike` 划掉、`stitches` 缝线点、`check` 勾选框、`star` 评分星星、`pstar` 纸星星、`switch` 开关、`icon` 界面小图标、`sticker` 贴纸。
  - 常用的选项：`data-seed`（种子，同一个宽高、同一个种子永远画出同一条线；同一屏里别重复）、`data-tilt`（歪几度，只歪纸那一层）、`data-tapes="1"` / `"2"`（贴一条或两条胶带）、`data-stitches`（左边一列缝线）、`data-fill`、`data-stroke`（写颜色角色名如 `card`、`pen`，或 `none`）、`data-r`、`data-amp`、`data-sw`。
  - 挂到画布上时，画板要引三个文件：`tokens.css`、`components/bundle.css`、`components/bundle.js`。画板（`.dc.html`）的内容是运行时渲染出来的，所以在 `componentDidMount()` 里调 `this.stop = Pomelo.paintLive(document.body)`，`componentDidUpdate()` 里调 `Pomelo.paint(document.body)`，`componentWillUnmount()` 里调 `this.stop()`。
  - 不在页面上时：`Pomelo.hand` 里的函数（`wob`、`hline`、`marker`、`strike`、`tapes`、`stitches`、`checkboxSvg`、`ratingStarSvg`、`paperStarSvg`、`switchSvg`、`glyphSvg`、`stickerSvg`、`handStroke`、`handFill`……）直接返回 SVG 字符串；数值在 `Pomelo.params`，框的预设在 `Pomelo.presets`。
- **字体**：手札体（Hannotate SC）和苹方都是 macOS 的系统字体，只在 Mac 上有，不上传、不转曲线；在 Mac 上看才是对的样子。其他设备会退到系统无衬线。
- 每个组件写在 `components/<名字>/README.md`，预览就是它的标准写法，照抄类名和 `data-hand`。

## 内容基调

- 全中文，俏皮，像柚子在跟你说话。AI 就叫「柚子」，不叫助手。
- 空白页只写一句话，不写使用提示：「书架空空，去摸会儿鱼吧」「今天没有安排，喝杯茶吧」「来日方长，日子还空着」「行李箱还空着」。
- 按钮和提示用短词：「记一笔」「存一下」「取消」「存好啦」「已丢掉 · 撤销」「加一个」「问问柚子」「再看一遍」「收进抽屉」。
- 问候一句：「下午好呀」。数字和汉字之间空一格：「还有 12 天」「今天有 3 件事」「¥486」；日期写「11 月 8 日 · 周日」，元信息用「·」分开。
- 模块的名字是四个字：一步一步、钱来钱往、摸鱼读读、好奇看看、念念不忘、来日方长、出门走走、投石问路、芝麻开门、随意画画……
- 演示只用编的数据：待办、书名、金额都编。

## 颜色

- **桌面 → 纸 → 卡面**：`color-desk` 是桌子；`color-paper` 是摊在上面的模块页和简报；`color-card` 是白卡、输入框、按钮的纸面。拖动时的投影区用 `color-desk-deep`。
- **字**：正文和标题用 `color-ink`，次要文字用 `color-ink-soft`。它们在 desk、paper、card、selected 和分类色的浅底、淡底上都过 APCA（正文 Lc ≥ 75，次要 Lc ≥ 60），五套配色明暗都验过。
- **笔**：`color-pen` 画所有手画的线条、框、缝线点和图标按钮。钢笔家族（蓝笔、紫笔、黑笔）里它就是那支笔的颜色；色面家族（柚黄、薄荷）里是墨色，深色时反过来。
- **按钮**：主按钮的纸面是 `color-primary`，字是 `color-on-primary`；一屏最多一两个。其余按钮是卡面加笔色的边。
- **选中和强调**：选中的底色 `color-selected`（跟主色走）；强调的一抹是荧光笔 `color-marker`，画在字下面，字还是 `color-ink`。
- **功能色**：链接 `color-link`，链到 Pomelo 里的东西用 `color-link-pomelo`（柚子链接）；删除、截止、出错 `color-danger`（和主色明显分开），它上面的字用 `color-on-danger`；钱涨了 `color-up`，跌了用 `color-ink-soft`，不用红。
- **分类色 5 种，各套共用**：`color-cat-mint` 薄荷、`color-cat-sky` 天蓝、`color-cat-pink` 樱粉、`color-cat-orange` 橙、`color-cat-grape` 葡萄紫。只当圆点、图表和贴纸，不写字。每种派生三档：`-bg` 浅底（标签、状态）、`-tint` 淡底（整行、整块）、`-sticker` 贴纸填色。上面的字一律是墨色，靠圆点和底色分。
- **柚子的固定色**：柚黄 `color-yuzu`、叶子 `color-leaf`、腮红 `color-blush`。柚黄只当底色和点睛，不当文字。
- **不跟明暗走的**：便签纸 `color-sticky`（字用 `color-on-sticky`）、贴纸的填色和白边 `color-art-*`；印出来的东西（年度小报、票根、信纸）用 `color-print-*`，深色模式下也是浅色的纸。
- **胶带**：两种，薄荷 `color-tape-mint-a/b`、柚黄 `color-tape-yuzu-a/b`，45° 斜条纹，每条 7px。

## 字体与排版

- 手札体 `--font-hand` 管整个界面，钱和统计数字也用它：数字等宽，金额右对齐就齐，表格里不换字体。苹方 `--font-long` 只给柚子的长回答和来信（`long-body`）。
- 字号：问候 `greeting` 46 粗；统计数字 `stat-lg` 30 粗、`stat` 20 粗；页标题 `page-title-lg` 26、`page-title` 22；卡片标题 `card-title` 17；正文 `body-lg` 15、`body` 14；次要 `small` 13；最小 `caption` 12。行高 `leading-tight` 1.45 到 `leading-loose` 1.75。
- **字要清楚**：纸、胶带、贴纸可以歪，字永远是正的；停下时不缩放、不挂 `will-change`，落在整像素上。歪只歪 `[data-hand-painted]` 那一层（`data-tilt`），不歪元素本身。
- 字离它所在的框左右至少 6px，上下不出框；框按内容算大小。

## 间距、圆角、投影、版面

- 以 4 像素为单位：`space-1` 到 `space-9`（4、8、12、16、20、24、32、40、48）。
- 桌面画板 `width-desk` 1280 × 800；模块页的纸 `width-sheet` 1140 × 716。
- 圆角：纸 `radius-paper` 10、按钮 `radius-button` 10、卡片 `radius-card` 14、标签 `radius-tag` 8；贴纸、统计数字的圆、开关的钮是圆的 `radius-round`。
- 投影四档：便签 `shadow-note`、卡片 `shadow-card`、纸 `shadow-sheet`、拿起来 `shadow-lift`。两层，柔和，向下。
- 不画表格的竖线：表格用整行底色（分类色的 `-tint`）和留白分行；小票用 2px 虚线 `color-line`。

## 形状

- **纸**（模块页、简报、便签）：圆角 10，手画边，纸纹；模块页和简报的左边一列缝线点（`sheet`，间隔 20，半透明的笔色）。蓝笔的纸是 22px 一格的方格纸（`color-grid`）。
- **卡片**（首页的块、弹出的原记录）：白卡，圆角 14，手画边，一到两条胶带，两层柔和投影，歪 −2.2° 到 +2°。
- **贴纸**（模块图标、柚子、统计数字、打卡）：墨线描边 3.3，填色比墨线错开 (1.4, 1.8)，外面一圈 4.2 的白边，轻投影，歪着贴（±8°）。
- **胶带**：第一条贴上边居中附近、歪 −4° 上下 3°；第二条斜贴一个角，约 ±30°。两端锯齿。一张卡片最多两条。
- **小票**（资产、找东西、年度小票）：白纸，锯齿底边，虚线分段，数字右对齐。
- **票根、信封、信纸**（年度小报）：票根两侧缺口；信封是牛皮纸 `color-kraft`，柚子贴纸封口；信纸浅色带横线。
- **纸星星**：鼓鼓的五角星，填分类色的贴纸色；最重要的几颗是描墨线的柚黄金星。
- **笔迹**：荧光笔划过（字下面）、墨线划掉（完成的待办）、手写下划线、十字绣的 ×。

## 手画的线

- 抖动算进路径，同一个种子永远得到同一条线；不用运行时的 SVG 滤镜画抖动。纸纹那层噪声也不是实时滤镜：一小块（128 的方块）照 `tokens/handmade.json` 的 `texture` 算好、当背景平铺（`.pm-tex`；`tooling/handmade/texture.mjs`，构建时内联进 `bundle.css`）。实时的 `feTurbulence` 在 WebKit 里是 CPU 逐像素算的，纸一多，Pomelo 每开一页卡一秒（2026-11-09 量的）。
- **滚动条**（`.pm-scroll`，写在根元素或要滚的那一块上）：平时只有一小段淡墨线；鼠标移进那一块，它走的那条缝线显出来、墨线变深，按住拖时是整支笔的颜色。系统的灰条不出现。
- 图形（贴纸、插图，64 格）：墨线 3.3、抖动 0.75。界面小图标（24 格）：一笔单线 2、抖动 0.32，跟着文字颜色，没有填色和白边。框（卡片、按钮、输入框）：线宽 1.6–1.9；输入框聚焦时描粗到 2.8。分割：手画横线 1.6。
- 墨线在钢笔家族用笔色，在色面家族用墨色（`color-art-ink`、`color-pen` 已经按配色换好）。

## 动效

- 性格是「纸和贴纸在桌上动」：果冻弹（`cubic-bezier(.3,1.6,.5,1)`，按下 0.08 秒缩到 0.9，松开 0.38 秒弹回）；画完再弹（线先画出来 0.5–1 秒，再一样样弹一下）；纸的物理（惯性每帧乘 0.92，翻页 0.8 秒）。
- 两档：`calm` 是控件的小动静，每样东西碰一下都有回应，可以弹、不能循环、不超过 600 毫秒，正在读的长文本身不动；`expressive` 是招牌时刻和柚子的表情，不超过 3 秒，只有柚子和等待的动画能循环。
- 减弱动态效果时停在最后的样子，循环停下，字照样清楚。
- 这里的组件只给静态的样子；动效零件另做，不要自己按描述写一版。

## 柚子

- 柚子是唯一的角色，就是 AI；也是顶栏、菜单栏（实心表示模型就绪、空心表示没运行）、AI 按钮和 App 图标。
- 梨形，带叶子，柚黄 `color-yuzu`，叶子 `color-leaf`，腮红 `color-blush`；8 个表情：平常、在想、眨眼、困了、开心、出错、惊讶、哇。墨色只用实心小点，不和错开的填色叠在一起。
- 正式的柚子图还没进来：不要自己画一个柚子冒充，要用就留位置、写「柚子」。

## 图标

- 界面小图标自己画，替换 Lucide：24 格一笔单线、线宽 2、跟着文字颜色、不填色。选中时底下抹一笔荧光笔，不加方框。正式的一套 168 个在 Assets 的 Icons（文件名就是图标名，线是 `currentColor`）；Icon 组件里的几个是画法示意。这套里没有的，按这个画法用 `data-hand="icon"` 画，别拿通用的细线图标。
- 模块图标是贴纸（见上面「形状」），行内 24 / 26 / 30，桌面下排 52–60；21 个在 Assets 的 Modules，填色跟模块坞的分类走。

## 资产

- **Pomelo**：柚子 8 个表情的静态帧和「问柚子」按钮。
- **App**：App 图标（1024，方格纸）和菜单栏的模板图（实心、空心）。
- **Modules**：21 个模块贴纸。
- **Stickers**：32 个通用贴纸（自建模块和标签能选的），加设置、日历两张（`settings.svg`、`calendar.svg`）。
- **Empty**：8 张空状态插图（一页还空着时配一句话）。
- **Icons**：168 个界面小图标。

贴纸、插图都按蓝笔浅色上好了色；要跟着配色和明暗走，就内联方案 `marks/` 里的源文件（颜色写成 `var(--pm-角色, var(--color-角色))`）。界面小图标的线是 `currentColor`，用的地方定颜色。

## 在 Pomelo 的代码里叫什么

Pomelo 的前端用 shadcn 的命名。对照：`--background` = `color-paper`、`--foreground` = `color-ink`、`--sidebar` = `color-desk`、`--card` / `--popover` = `color-card`、`--border` / `--input` = `color-line`、`--muted` = `color-desk`、`--muted-foreground` = `color-ink-soft`、`--primary` = `color-primary`、`--primary-foreground` = `color-on-primary`、`--accent` = `color-selected`、`--destructive` = `color-danger`、`--ring` = `color-primary`、`--star` = `color-yuzu`；状态和标签的底色是分类色的 `-bg`，字一律是墨色。手作专用的颜色另有 `--pm-*`。

## 不要

- 不要后台表格感、通用细线图标、扁平几何色块、果切色块、橡皮章颗粒、表格网格线。
- 不要装饰堆砌：一张卡片最多两条胶带、一张贴纸。
- 不要古朴安静的样子，也不要像 Bear、Things 3。
- 不要渐变色、霓虹、玻璃拟态，不要用柚黄写字，不要歪着的字。
