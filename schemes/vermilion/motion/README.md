# motion

动效零件：每个一份规格与一份实现，标明档位 calm 或 expressive，带减弱动效的静态回退。

| 零件 | 档位 | 说明 |
| --- | --- | --- |
| `logo-route/` | calm（招牌动作） | Logo A 虚线延伸 → 到达 → 圆圈变朱红，520ms |
| `category-glyph-hover/` | expressive（登记表面） | 分类图形悬停：纸片滑入、笔画写出、朱红点抵达，700ms |
| `section-deco-intro/` | expressive（登记表面） | 分区装饰入场，1030ms；每次打开网站只写一次（`once.js`） |
| `loading-enso/` | expressive（登记表面） | 加载圆相，1800ms 一圈循环 |
| `link-underline/` | calm | 链接下划线收拢：文字变朱红、上浮 1px，下划线从两端收拢，220ms。提取自网站，与网站逐像素一致 |
| `selection-slide/` | calm | 选中指示滑移：单选项下的下划线滑到新选中项，220ms；`selection-slide.js` 量位置 |
| `count-up/` | calm | 数字计数：徽标从 00 数到实际值，320ms，每次打开网站只数一次 |
| `stroke-draw/` | calm | 描边绘制初版，320ms。已被 `stroke-draw-v2` 取代，留档 |
| `stroke-draw-v2/` | calm（时长例外） | 描边绘制：「笔势与纸片」图形按笔顺画出，640ms，给不在登记表面上的图形用 |
| `not-found-intro/` | calm（时长例外） | 404 插图「折页」入场：打开页面时用描边绘制写一次，640ms |
| `end-mark/` | calm（时长例外） | 文末落款：三版（抵达、远山、三点）每次随机一版，第一次滚进视口时写一次，640ms；`end-mark.js` 负责挑选与触发 |

`visit-once.js` 是共用的「同一次访问」标记：放在页面 `<head>` 里，同一次访问的后续页面根元素带 `data-va-visited`，入场类零件（`count-up`）据此直接显示终态。`section-deco-intro.once.js` 做的是同一件事，二者取一。

「时长例外」指超过 calm 入场 320ms 上限、经站主批准的例外，登记在 `tokens/motion.json` 的 `calmExceptions`，零件的 `motion.json` 用 `calmException` 指向它。

`end-mark/` 有两份片段：`end-mark.fragment.html` 给网站用（三版放在一起，脚本挑一版），`end-mark.all.fragment.html` 三版并排，给目录页与导出用（`motion.json` 的 `files.site` 与 `files.html`）。

分类图形悬停、分区装饰、加载圆相与描边绘制的几个零件是「笔势与纸片」的动效（DESIGN.md §5），依赖 `marks/graphic/graphic.css`（`motion.json` 的 `requires`）。它们的 HTML 片段由 `npm run build:graphic` 生成，不手改；CSS 与 `motion.json` 是手写的。`category-glyph-hover/single/` 是单个类别的片段，卡片里一次只放一个时取它。
