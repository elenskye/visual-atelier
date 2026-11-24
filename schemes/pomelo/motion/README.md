# motion

Pomelo 的动效零件：每个零件一个目录，一份规格（`motion.json`）、一份实现（CSS，少数带一个小 JS），标明档位 `calm` 或 `expressive`，带减弱动效的回退。数值照 `tokens/motion.json` 和 `DESIGN.md` §5。

**一份实现，到处用同一份**：

- 零件的 CSS 直接套在 Design System 的类名上（`pm-btn`、`pm-switch`、`pm-tip`……），`npm run build:ds` 把全部零件的 CSS 原样插进 `bundle.css` 的 `/* @generate motion */`，挂了 Design System 的画布（`dw ds install`）就有动效。
- `npm run build:motion -- --scheme pomelo` 逐帧定格导出 GIF 和逐帧总览图（`dist/pomelo/motion/<id>/`）；页面的底是 Design System 的 tokens、`bundle.css`、`bundle.js`（手画的框照样画）。bench 的 Motion Deck用同一个页面、同一个导出函数。
- Pomelo 照搬这些 CSS（同步时登记进 `sync.json`），不另写一版。

**写法**：

- 状态用元素本来的属性（`aria-checked`、`aria-pressed`、`aria-expanded`、`aria-selected`）：样式变化用 `transition`，页面刚打开时不会动。
- 只在用户动手时才放一次的动画（果冻弹、啪地贴上、撕走），用 `is-` 开头的类名触发，界面在那一刻加上：`is-pop`（刚点过）、`is-in`（刚出现）、`is-leaving`（要走了，动画放完再拿掉）、`is-open` / `is-closing`（展开、收起）。
- 伪类都配一个同样效果的类名，导出和Motion Deck才触发得了：`:hover` ↔ `.is-hover`，`:active` ↔ `.is-pressed`，`:focus-within` ↔ `.is-focus`。
- 类名和关键帧名都以 `pm-` 开头。缓动照 `tokens/motion.json` 的 `easing` 抄数值（例如弹性 `cubic-bezier(.3,1.6,.5,1)`）。
- 每个零件都写 `@media (prefers-reduced-motion: reduce)`：停在最后的样子，循环停下，字照样清楚。
- `calm` 不循环、单次不超过 600 毫秒（例外登记在 `tokens/motion.json` 的 `calmExceptions`）；`expressive` 要登记在 `registeredSurfaces`，`surface` 写登记的名字。`npm run qa` 查这些。
- 片段（`*.fragment.html`）是演示：用 Design System 的写法（`data-hand` 交给 `bundle.js` 画），只放演示需要的最少的东西；字用假的。
- `motion.json` 的 `capture.steps` 写演示怎么触发：第几毫秒（`at`）给哪个元素（`on`，默认 `host`；`all` 是所有匹配的）加类（`add`）、去类（`remove`）、设属性（`attr`）、设样式（`style`）。例：按下 0 毫秒加 `is-pressed`、80 毫秒去掉。`requires` 列出用到的别的零件的 CSS（相对方案目录）。

| 零件 | 档位 | 说明 |
| --- | --- | --- |
| `press/` | calm（0.38 秒） | 按钮：按下扁一下，松手弹回来；小按钮、贴纸按钮 `.pm-press` 鼠标移上去抬一点 |
| `switch/` | calm（0.45 秒） | 开关：圆贴纸弹着滑过去、压扁再弹，荧光笔把轨道涂满 |
| `segmented/` | calm（0.42 秒） | 分段：荧光笔（`.pm-seg-hl`）弹着拖到新的一格，路上抹宽一点 |
| `select/` | calm（0.45 秒） | 下拉：箭头翻过来，菜单一格格展开，选中的那格画个勾；收起往上折回去 |
| `fold/` | calm（0.57 秒） | 侧栏展开：子项一行接一行从上一行底下滑出来，落到位弹一下，下面的行顺着让开；收起倒着收回去；箭头弹着转过去 |
| `check/` | calm（0.6 秒） | 勾选：果冻弹，柚黄弹出来、勾画出来，墨线把那一行划掉 |
| `rating/` | calm（0.6 秒） | 评分：星星一颗接一颗弹出来，鼠标移上去那颗歪着放大 |
| `field/` | calm（0.6 秒） | 输入框：聚焦时边描粗，框里的小图标晃一下 |
| `toast/` | calm（0.45 秒） | 提示：便签从右上方啪地贴上，停一会儿自己撕走（0.38 秒） |
| `crumple/` | calm（0.6 秒） | 删除：揉成纸团丢出去，下面一行「已丢掉 · 撤销」，撤销时弹回来 |
| `sort/` | calm（0.32 秒） | 拖动排序：拿起来歪一下、影子变深，别的让开，松手落到位 |
| `tag/` | calm（0.45 秒） | 标签：加的时候拍上去，去掉时撕下来 |
| `tooltip/` | calm（例外 1.1 秒） | 鼠标提示：纸签挂在线上，垂下来晃两下停住 |
| `slap-in/` | calm（0.5 秒） | 啪地贴上：便签、贴纸从右上方落下来，压一下再弹平 |
| `page-stack/` | calm（0.5 秒） | 开着的页：换页时纸滑过去，叠着的页鼠标移上去往外抽，新开的从右边滑进来；子页纸签抬起来；「桌上开着」的小贴纸关掉时撕走 |
| `sticker-peel/` | calm（0.45 秒） | 贴纸簿的贴纸：翘起一角，撕下来往上飞走，贴回来啪一下；`.pm-lift` 是鼠标移上去抬起来的贴纸 |
| `book-open/` | calm（0.6 秒） | 贴纸簿从下面歪着滑上来，收起滑回去 |
| `chat-pop/` | calm（0.42 秒） | 问柚子：小窗从顶栏右上角的柚子那里长出来，收起缩回去（0.2 秒） |
| `receipt-print/` | calm（0.55 秒） | 找东西：出纸口落下来，小票打出来，结果一行行印出来，选中撕下来飞走 |
| `receipt-flip/` | calm（0.6 秒） | 小票翻面 |
| `greeting/` | expressive（1.7 秒） | 打开 App 的问候：便签一张张落下来，「下午好呀」写出来，荧光笔划过（写完柚子眨眼：`pomelo-wink`） |
| `wheel-open/` | expressive（0.88 秒） | 呼出柚子瓣：从左上角的柚子转着长出来，墨线画出来，贴纸一张接一张弹出来；收起缩回去 |
| `wheel-spin/` | expressive（0.9 秒） | 柚子瓣：打「柚子」整整转一圈 |
| `think-line/` | expressive（循环 1.6 秒） | 柚子在想：一笔小卷卷画出来再擦掉，和「在想」的表情同一个节拍 |
| `pomelo-answer/` | expressive（按字数，最多 3 秒） | 柚子回答：一个字一个字写出来，重点下面带荧光笔 |
| `done-cheer/` | expressive（1.2 秒） | 全做完：便签「今天的事都做完啦！」贴上，撒一把小贴纸 |
| `sticker-whisper/` | expressive（小彩蛋，0.52 秒翻起、最多 0.78 秒落回） | 撕起简报角上的柚子贴纸：翻起来露出白背面和底下的印子（`marks/pomelo/pomelo-ghost.svg`），印子里写着悄悄话；停 2.4 秒像掉下去一样落回、压一下弹平 |
| `pomelo-dizzy/` | expressive（小彩蛋，1.1 秒） | 连戳柚子：2.5 秒里戳 5 下，换上「出错」的脸转两圈晕过去，旁边贴一张「别戳啦，晕了…」（便签用 `done-cheer` 的写法） |
| `empty-state/` | expressive（`empty-state`） | 空状态：插图（`marks/empty/`）一笔笔画出来，再一样样弹一下，那句话浮上来；带 `is-in` 渲染就画一次，最长 1.94 秒 |
| `pomelo-idle/` | expressive（循环 5.2 秒） | 柚子平常：呼吸两下（一下 2.6 秒）、看右看左、眨一下眼；表情零件共用的外层和关键帧也在这里 |
| `pomelo-think/` | expressive（循环 1.6 秒） | 柚子在想：一压一弹，眼睛跟着转，三个想法泡泡依次往上浮 |
| `pomelo-sleepy/` | expressive（循环 5.2 秒） | 柚子睡着了：慢慢呼吸，z 一个接一个往上飘 |
| `pomelo-worried/` | expressive（循环 5.2 秒） | 柚子担心：平常的呼吸加往下看（简报说有烦心事的那一小时，顶栏的柚子换成这张脸） |
| `pomelo-wink/` | expressive（0.7 秒） | 柚子眨眼：歪一下头 |
| `pomelo-happy/` | expressive（1.3 秒） | 柚子开心：跳两下，小星星闪一闪 |
| `pomelo-error/` | expressive（0.9 秒） | 柚子出错：摇头，红色的「!」弹出来 |
| `pomelo-wow/` | expressive（1.2 秒） | 柚子「哇」：跳一下，小星星闪一闪 |
| `pomelo-surprised/` | expressive（0.5 秒） | 柚子吓一跳：跳一下 |
| `atlas-envelope/` | expressive（1.22 秒） | 拆年度小报的信封：封口贴纸撕走、翻盖翻到后面、小报升起来；片段由 `gen.mjs` 生成 |
| `loading-needle/` | expressive（循环 3.2 秒） | 加载 · 穿针：一针针缝过去，打结，一起淡掉重来；片段和每一针的关键帧由 `gen.mjs` 生成 |

**柚子的表情**：外层 `<span class="pm-pomelo" data-face="<脸>">`，里面原样放 `marks/pomelo/pomelo-<脸>.svg`。换表情就换 `data-face` 和里面的 SVG（或叠着几张、只显示一张）：脸一出现动画就开始，循环的（平常、在想、睡着）一直放，一次的（眨眼、开心、出错、哇、吓一跳）放完停在那张脸上，界面再换回平常。脸外面的东西（想法泡泡、小星星、z、「!」）底下的白边是 SVG 里 `.wb` 的第几条，零件按顺序找它们一起动；柚子的 SVG 改了部件顺序要跟着改。
