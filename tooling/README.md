# tooling

所有方案共用的脚本。每个脚本都能单独运行，也可以通过 `npm run` 一次跑完。哪些工具只处理带某个文件的方案，见 `docs/architecture.md`「新方案怎么起」后面那张表。

## 生成源文件（写进 `schemes/`）

| 目录 | 做什么 |
| --- | --- |
| `graphic/` | 生成 Vermilion 图形语言「笔势与纸片」的 SVG、内容图标清单与动效片段，并更新 `marks/manifest.json`。几何在 `geometry.mjs`、图形定义在 `shapes.mjs`、内容图标在 `icons.mjs`、写法与上色在 `svg.mjs` |
| `marks/derive.mjs` | 由已批准资产派生新资产（规格在 `marks/derived.json`）：文字转曲线、合成默认分享图、生成文章分享图与水印模板。字体按 `type/fonts.json` 登记的 npm 包取，只用可转曲线的 OFL 字体；排字用 fontkit（带 GPOS 字偶距，与浏览器一致） |
| `pith/` | Pith 的图形：`glyphs.mjs` 是 Logo、图标、十种记录、生长阶段、Agent 图标的几何（唯一的一份），`build.mjs` 写出 `schemes/pith/marks/` 的 SVG 和清单（`--check` 只核对）。Pith Explore 的生成器也从 `glyphs.mjs` 取图形 |

两者都拒绝覆盖已批准的文件；`--check` 只比较不写入。

## 构建（写进 `dist/`）

| 目录 | 做什么 | 输出 |
| --- | --- | --- |
| `tokens/build.mjs` | 读方案的 token JSON，生成网站方言（`--color-*`）、TS 常量；方案在 `targets.json` 里声明了 `pomelo` 才另出 Pomelo 方言（shadcn 命名，`--background` 等）。多套配色时每套明暗各一组变量，用 `data-palette` 切换 | `dist/<方案>/tokens/` |
| `handmade/texture.mjs` | 纸纹的一小块：照 SVG 规范里 feTurbulence 的参考算法算好（数值在方案 `tokens/handmade.json` 的 `texture`），存成能平铺的带调色板 PNG；`build:ds` 把它内联进 `bundle.css` 的 `@texture-data`。不在页面上放实时滤镜：WebKit 里它是 CPU 逐像素算的 |
| `handmade/build.mjs` | 手作零件的样张，逐套配色、逐明暗一张。算法在 `line.mjs`（手绘的线，抖动算进路径）、`sticker.mjs`（贴纸和错版）、`frame.mjs`（框、胶带、缝线），`paint.mjs` 是组件的形状（勾选框、星星、开关、小图标）和在页面上按 `data-hand` 画的办法；数值在方案的 `tokens/handmade.json` | `dist/<方案>/handmade/` |
| `render/marks.mjs` | 复制资产；按清单的 `renders` 导出 PNG；`colorMode: roles` 的图形另出上好色的 `themed/<id>-light\|dark.svg`；带 `samples` 的分享图模板与带 `fakeImages` 的水印模板出示例 | `dist/<方案>/marks/` |
| `render/motion.mjs` | 把动效零件逐帧定格，合成 GIF 与逐帧总览图，复制 CSS 与片段。导出参数写在零件的 `capture`（`steps` 是一串按时间加类名、改属性的触发）、`requires`、`files.site`；片段里的 `<!-- @include 路径 -->` 展开成方案里的文件。方案有 Design System 的画法（Pomelo）时，页面的底是 Design System 的 tokens、`bundle.css`、`bundle.js`。bench 的 Motion Deck调同一个 `renderPart` | `dist/<方案>/motion/<id>/` |
| `catalog/build.mjs` | 目录页：颜色与对比度、标志与插图（明暗）、实时动效与重播、GIF、检查结果 | `dist/catalog/index.html` |
| `design-system/build.mjs` | 由方案的 `tokens/` 与 `design-system/` 生成 Claude Design System 的文件；`bundle.css` 里的 `/* @generate motion */` 换成方案全部动效零件的 CSS（同一份，不另写）；把要上传的图片放进 `upload/`。多套配色的方案，默认那套进 tokens 的明暗，其余各套插进 `bundle.css` 的 `/* @generate palettes */`；`system.json` 写了 `bundle` 的，用 `bundle.mjs` 把列出的模块打包成 `components/bundle.js`，并在 vm 里和模块本身逐字比对 | `dist/<方案>/design-system/` |
| `design-system/check.mjs` | 按 Design System 页面的方式渲染每个组件预览（注入 tokens、字体、`bundle.css`、`bundle.js`），明暗各截一张，报告脚本错误、横向溢出与没画上的手画零件 | `dist/<方案>/design-system/check/` |
| `atlas/build.mjs` | 把 Atlas 的设计（`schemes/<方案>/atlas/<设计>/`）打成一个文件：设计的模块原样拼起来，带上画好的柚子、贴纸、信封和 Design System 的样式、上墨脚本（所以排在 `build:ds` 后面）。`--freeze <设计>` 冻结成 `atlas/releases/<设计>-<版本>/`（冻结过、源又改了会拒绝：升版本）；`--check` 核对每份快照的校验和，版本和源一样的还要和源打出来的一样 | `dist/<方案>/atlas/<设计>/design.js` |

## 检查

| 目录 | 做什么 |
| --- | --- |
| `qa/check.mjs` | 质量检查：资产校验和、颜色写死、生成器一致、分享图示例、APCA 对比度、体积预算、动效规则、渲染合理性；加 `--origin` 时只读对照网站现用的文件与变量。结果写进 `dist/<方案>/qa-report.json`（说的是某个文件的项带 `file`，bench 的 Checks 页点了看图）|
| `qa/watermark.mjs` | 作品水印的检查，只用假图：不遮主体、位置与取色、尺寸格式不变、原图不动、不留 EXIF、体积上限、两次一致；结果写进 `dist/qa/watermark.json` |
| `qa/all.mjs` | `npm run all`：一步一步跑构建和检查，结果写进 `dist/qa/run.json`（同一时间只跑一遍） |
| `qa/determinism.mjs` | 同一份源导出两次，逐字节比较 |
| `qa/canvases.mjs` | `npm run check:canvases`（`npm run all` 的一步）：把工作区复制到临时目录，把各画布的生成器按顺序重跑，和真的 `canvases/` 逐个文件比（`canvas.json` 只比内容），列出对不上的；真的画布不动。新画布有生成器就登记进它的 `GENERATORS` |
| `qa/canvas-lint.mjs` | 画布样稿的版面检查：字糊、字贴边、出框。由 `canvases/` 里每一页的 `lint.mjs` 调用，发布前跑 |
| `qa/motion-parity.mjs` | 网站现用的动效是否与零件逐像素一致（只读）；比较什么写在零件的 `parity` 里 |

## 同步与运行时模块

| 目录 | 做什么 |
| --- | --- |
| `sync/sync.mjs` | 单向同步（`docs/adoption.md`）：把 tag 用 `git archive` 导出到临时目录再构建，把 `sync.json` 登记的文件复制到消费方，写 `VERSION`、`README.md`、`SHA256SUMS`。只同步 approved 的资产与零件，token 方言（`dist` 的 `tokens/`）和手画零件的画法（`design-system/project/components/bundle.js`）跟着 `scheme.json` 的状态；要构建时用到浏览器，加 `VA_BROWSER_CHANNEL=chrome`；tag 名必须是 `<方案>-v<version>`；只在 Mac 上跑；目标目录与上次的校验和对不上就停下（`--force` 跳过）。`--check` 只核对，加 `--tag` 时再与该 tag 的构建逐字节比较；`--dry-run` 只列出要写的文件 |
| `og-card/` | 文章分享图的生成模块，同步到消费方、在消费方构建时运行：给标题，按模板排版，用 resvg（wasm 版）出 PNG，不依赖浏览器，两次输出逐字节一致 |
| `watermark/` | 作品水印的生成模块，同步到消费方运行：给一张图，选位置和墨色，输出同格式、同尺寸的新图，只依赖 sharp。`fake-images.mjs` 是假图，只在本仓库用 |
| `lib/` | 共用函数：路径与哈希、`~` 展开、列出方案的动效零件、生成器写清单（`common.mjs`），浏览器启动、GIF 编码、逐帧采集 |
| `fonts/subset.mjs` | TrueType 字体子集：只留用到的字，补上浏览器要的 cmap、name、OS/2、post。画布的优化页和方案要打包中文字体时用（探索页直接用 Google Fonts）；生成器经 `canvases/_lib/root.mjs` 的 `rootImport` 引，命令行 `node tooling/fonts/subset.mjs <原字体.ttf> --text <字> --out <输出.ttf>`。保留字名的字体（得意黑这类）别做子集 |

第一次用（装依赖、选浏览器、构建）见根目录 `README.md`「第一次用」。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run all` | 构建、检查、重新生成目录页，发版前跑。由 `qa/all.mjs` 一步一步跑（前一步没过就停），每一步的结果、用时、最后几十行输出写进 `dist/qa/run.json`；bench 菜单里的 Checks 看它，也能在那里点「跑一遍」 |
| `npm run build` | 生成全部产物 |
| `npm run build:handmade` | 手作零件的样张（已在 `npm run build` 里） |
| `npm run build:graphic` | 改了 `tokens/graphic.json` 或 `tooling/graphic/` 之后重新生成源文件（不在 `npm run build` 里） |
| `npm run build:derived` | 改了 `marks/derived.json`、字标或 `tooling/marks/` 之后重新生成派生资产（已在 `npm run build` 里） |
| `npm run build:motion -- --scheme pomelo --part tooltip` | 只导出一个动效零件 |
| `npm run build:catalog` | 在检查之后重新生成目录页，目录页才会带上检查结果 |
| `npm run check:ds` | 渲染 Design System 的组件预览自检（需要联网取字体） |
| `npm run check:canvases -- --canvas pomelo-explore` | 各画布的板和生成器对不对得上（已在 `npm run all` 里）；`--keep` 留下临时目录看差在哪 |
| `npm run qa -- --origin ~/Documents/GitHub/personal-website` | 质量检查，并只读对照网站现用的文件 |
| `npm run qa:determinism` | 确定性检查 |
| `npm run qa:watermark` | 作品水印的检查（已在 `npm run all` 里） |
| `npm run qa:parity -- --origin ~/Documents/GitHub/personal-website` | 网站现用的动效是否与零件一致 |
| `npm run sync -- --scheme <方案> --to <消费方> --tag <方案>-v<版本>` | 把已发版本同步到消费方（每次都要站主授权）；`--check` 核对消费方的副本 |

通用参数：`--scheme <名字>` 只处理一个方案，`--out <目录>` 改输出位置，`--verbose` 列出检查的每一项。

## 确定性

`lib/browser.mjs` 启动浏览器时固定加 `--disable-gpu`，所有截图都走软件栅格。不要去掉这个开关。

- **为什么**：Mac 上的 Chrome 默认用 GPU 栅格（Skia Graphite + Metal），同一份源渲染两次，结果可能不同。`count-up` 触发前的静止帧会有 8～14 个像素差 1/255；`app-icon-180@1024.png` 60 次里有 3 次不同，差 75 个像素，最多差 21/255。`count-up` 的动画帧一直稳定，和 `@property` 的取整无关。多等也解决不了：等 500ms 后截图，还是会出现两个版本。
- **截图前先等两帧**（2026-11-15 修好）：`render/marks.mjs` 在 `setContent` 之后先调 `lib/browser.mjs` 的 `nextFrames`（等两次 `requestAnimationFrame`）再截图。原因：新开的浏览器里第一个页面，视口最下面 87 像素有时还留着没画完的一帧，那一截被换成了图最上面 87 行的内容；马上截图就把它截了进去。87 是窗口顶上浏览器界面的高度（这台 Mac 上的 Chrome 157：512×512 的窗口里网页实际只有 512×425，剩下那截是视口模拟撑出来的），换尺寸也总是最下面 87 行。同一个浏览器里后面的页面不会这样。`logo-mark@512-light.png` 是每次 `build:marks` 截的第一张，而且上面 87 行里有圆圈，所以 2026-11-05 偶发不一致的总是它（差 6486 个像素）。动效的逐帧导出本来就先等两帧（`settle`），不受影响。以后新写截图的代码，`setContent` 之后也先等两帧。
- **和已发版本的关系**：已发版本里经浏览器渲染的 PNG 都是软件栅格的结果。`og-default-v3` 的软件栅格结果和网站副本、Design System 上传记录逐字节相同；GPU 栅格和它差 8226 个像素，最多差 87/255，体积不到一半。所以用 GPU 栅格时，`sync --check --tag` 和 Design System 的上传记录都对不上。
- **旧 tag**：`sync` 用 tag 里的工具构建，`vermilion-v1.5.0` 及更早的 tag 里没有这个开关。这时 `--check --tag` 可能报 `og-default.png` 和 `SHA256SUMS` 不同，这不代表网站副本被改过。核对旧 tag 时，先做一个带开关的启动脚本，再用它核对：

```bash
mkdir -p scratch && printf '#!/bin/bash\nexec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --disable-gpu "$@"\n' > scratch/chrome-nogpu.sh && chmod +x scratch/chrome-nogpu.sh
```

```bash
VA_CHROMIUM="$PWD/scratch/chrome-nogpu.sh" npm run sync -- --scheme vermilion --to personal-website --check --tag vermilion-v1.5.0
```

- **还没解决的**：浏览器版本没有固定，`VA_BROWSER_CHANNEL=chrome` 跟着系统 Chrome 走。Chrome 更新后字节可能会变，还没验证过。`qa:determinism` 只能证明当下这个版本两次一致；`sync --check --tag` 报图片不同时，先用 `lib/gif.mjs` 的 `diffPng` 量差多少，再判断是版本差异还是副本被改。

## 发布 Design System（Agent 操作）

源在 `schemes/<方案>/design-system/`，地址与上传记录在其中的 `published.json`。不在 Design System 页面上直接改，改源文件再发布：

1. `npm run build` 之后 `npm run check:ds`，看 `check/` 里的截图。
2. 新增或改过的图片：把 `upload/` 里对应文件作为资产上传到 Design System，把返回的 id、资产库报告的字节数和源文件的 sha256 写进 `published.json`（资产库会改写 SVG 的写法并去掉 `<style>`，带样式的 SVG 改用 `render` 导出的 PNG）。更新 `published.json` 的 `lastChange`。
3. 再跑 `npm run build:ds`，生成 index（`design-system.json`）。
4. 用一次发布把改动的 `project/` 文件连同 index 发到 `published.json` 里的地址。

`project/` 里除了 index 还有 `tokens.json`、`tokens.css`（构建按 `tokens.json` 生成，第一行是「<名字> — generated from tokens.json」，Design System 页本身不发布它，读的人和挂载的画布要靠这份）、`README.md`、`components/`、`assets/` 的说明。

`published.json` 顶层的 `account` 是建这份 Design System 的 Claude 账号，只有它能发布、上传资产（四个都是「现用账号」；Vermilion 朱红旧账号那份记在 `copies.旧账号`，只能看）。用 Claude Code 的 Artifact 工具发布时，`root` 写 `dist/<方案>/design-system`，`file_path` 是 `project/design-system.json`，`files` 列其余改过的 `project/` 文件，一次发完。

### 在另一个账号里发一份

别的账号打不开、发不了旧账号的那份，要在自己账号里另建一份，源还是同一份（Pomelo 柚儿园 2026-11-07 这样做过）：

1. 在自己账号新建：Design System 类型（claude-artifacts 的 `list_types` 找到 slug，`create_from_type`，`title` 照原来的；Claude Code 的 Artifact 工具则 `publish` 带 `type_url`），不带文件。
2. 改 `published.json`：以后只用这一份的，把顶层换成它（`url`、`slug`、`account`、`createdOnFiles`（`{"v": 1, "at": 现在}`）、`lastChange`、`assets` 先是 `{}`），原来顶层的那份移进 `copies[旧账号名]`；两份都要维护的，顶层不动，新的记在 `copies[账号名]`。
3. 有资产的方案：把 `upload/` 里的图片上传到新的这份，id 记进这条的 `assets`（新账号里 id 都是新的）。站主在 Claude 里直接复制过来的副本（比如「Vermilion (Copy)」）已经建好，跳过第 1 步；它带没带资产、id 是什么，先 `list_assets` 看了再决定传哪些。
4. `npm run build:ds -- --scheme <方案>`（index 按顶层那份）；要按 `copies` 里的一份生成，加 `--account <账号名>`。
5. 照上面第 4 步一次发完 `project/` 的全部文件（`project/design-system.json` 排最后）。发完 `list_files` 逐个核对 sha256。
6. 以后改了源：只有建它的账号能发它那份。挂到画布上的记录（`canvas.json` 的 `designSystems`）`dw ds install` 写的是顶层那份的链接。

依赖版本一律 `^x.y.z`。Node 版本以 `.nvmrc` 为准。
