# marks

静态矢量：Logo、图标、图形构件。SVG，颜色用 currentColor 或角色变量，带清单（`manifest.json`）。

- 根目录：Logo A 系列、favicon、应用图标、小标题图标（从网站迁入）。
- `illustrations/`：网站现用的位图插图（OG、404、空状态）。
- `graphic/`：图形语言「笔势与纸片」（DESIGN.md §4）——分类图形、分区装饰、分享图底图与文章分享图底图、空状态、PPT 底图、加载圆相，以及内联上色用的 `graphic.css`。SVG 由 `npm run build:graphic` 生成，不手改；构建时另出上好色的 `dist/<方案>/marks/themed/<id>-light|dark.svg` 与 PNG。
- `og-card/template.json`：文章分享图的模板（DESIGN.md §4），由 `npm run build:derived` 生成，不手改；色值取自 token，上好了色，因为它要交给网站构建时的生成模块。
- `watermark/template.json`：作品水印的模板（DESIGN.md §4「图像」），同样由 `npm run build:derived` 生成；两种墨取自 token，运行时按画面亮度选。
