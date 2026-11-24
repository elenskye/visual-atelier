> 归档（2026-11-02）：VL1 的历史记录，内容没有改，状态与待确认都停在归档之前。不是规则，说明见同目录 `README.md`。

# CHANGELOG

只记已完成且验证过的结果，不写待办。

## 2026-11-02 · VL1 · Phase 10 作品水印（vermilion 1.5.0）

- **选择**（站主）：
  - 样式：小样页给了「字标」「标志」「署名」三版，站主选「字标」。
  - 运行位置：网站构建时自动加，原图留在资源库不动。没有选手动脚本，也没有选 Pomelo 压缩那一步。
  - 范围：作品页 `gallery` 的图与关于我页的「画作与摄影」，已上线的也包括。
  - 站主用自己的作品试跑后批准。
- **资产**（`approved`）：`marks/watermark/template.json`，字标转曲线，深浅两种墨取自 `text` 的明暗值，其余参数在 `marks/derived.json`。
- **规则**：`DESIGN.md` §4「图像」写入样式、位置、取色、范围与原图不动；§7 收尾。Design System 发布第 16 版。
- **工具**：
  - 新增 `tooling/watermark/watermark.mjs`：量角落的亮度与杂乱度，选位置和墨色，输出同格式、同尺寸的新图；不留 EXIF，留色彩配置，按体积上限降质量。只依赖 sharp。
  - 新增 `tooling/watermark/fake-images.mjs`：程序画的假图，目录页与检查只用它们，站主的作品没有进本仓库。
  - 新增 `tooling/qa/watermark.mjs`（`npm run qa:watermark`，已在 `npm run all` 里），50 项。
  - 现有资产与动效产物逐字节不变：清单只有新增。
- **网站**（按 `vermilion-v1.5.0` 同步，本地验过，**未提交**）：
  - `npm run build` 在 Astro 之后运行 `scripts/watermark.mjs --dist`，把 `dist/` 里的作品图换成带水印的版本，`public/` 不动。
  - `npm run watermark -- <图片…>` 给一张图出一张带水印的图，放在原图旁边。
  - `qa-build.mjs` 检查作品图确实加了水印，其余资源库图片与原文件逐字节相同。
  - `sharp` 写成直接依赖（原来由 Astro 带入，版本不变）。
- **检查**（Mac）：
  - 质量检查 210 项通过、0 失败，水印检查 50 项通过，加对照网站 220 项通过；两次导出 359 个文件逐字节一致；生成器 `--check` 一致。
  - 网站完整 `npm run qa` 通过：12 张作品图带水印，第三方照片与卡片小图逐字节不变，最大的作品图加水印后仍在 1.5 MB 内，EXIF 已去掉，色彩配置还在。
  - 用无头浏览器看了网站生产构建的画廊页（桌面、手机宽度）与关于我页，水印不压主体，没有横向溢出。手机宽度上水印很小，要放大才读得清；站主看过后按现在的大小批准。
  - 假图上：亮处用深墨、暗处用浅墨、右下角杂乱时换到左下角；最难的「中灰杂乱」假图上认得出但不醒目。
  - 按 tag 正式同步 29 个文件，`sync --check --tag` 确认网站里的副本与 `vermilion-v1.5.0` 的构建逐字节一致；同步后网站再跑完整 QA 通过。
- **Phase 9 验收**：线上文章页的 `og:image` 已是各自的分享图，图片能取到，Vercel 构建正常；站主看过微信、LinkedIn 的转发预览，没有问题。

## 2026-11-02 · VL1 · Phase 9 每篇文章的分享图（vermilion 1.4.0）

- **选择**（站主）：
  - 版式：小样页给了「同图」「低山」「落笔」三版，站主选「低山」。
  - 有封面的文章也用标题分享图，不再用封面。
  - 看过 18 张真实文章的图后，批准底图与模板。
- **资产**（`approved`）：
  - `marks/graphic/og-card-graphic.svg`：纸山压低、贯穿全宽，一笔提按贴着山脚走，圆相在右上角。
  - `marks/og-card/template.json`：文章分享图的模板，由 `marks/derived.json` 的 `og-card` 生成，底图与字标已上好色，标题的排法写清楚。
- **规则**：`DESIGN.md` §4 写入文章分享图的版式、字体、长标题的处理与确定性；§7 去掉；Design System 发布第 15 版，加入底图与两张示例。
- **工具**：
  - 新增 `tooling/og-card/`：`card.mjs` 选字号、断行、截断，排成 SVG，用 resvg 的 wasm 版渲染成 PNG；`outline.mjs` 是从 `marks/derive.mjs` 提出来的文字转曲线，两边共用。不依赖浏览器。
  - 换行规则：同样的行数里挑最匀称的断法，偏向在冒号、分隔符、句读后面断；标点守禁则；单词放不下才拆开；最小一档还放不下就停在省略号上。字体里没有的字（如 Emoji）不画。
  - `render/marks.mjs` 用生成模块出 7 张示例，目录页显示。质量检查新增「分享图」一组：排得下、守标点禁则、尺寸对、超长标题能截断。示例标题是编的，不用真实文章。
  - `sync.json` 能同步 `tooling/` 下的生成模块（`tool`），状态跟着它服务的资产走。
  - 现有资产与动效产物逐字节不变：清单只有新增，字标与默认分享图 `--check` 一致。
- **网站**（按 `vermilion-v1.4.0` 同步，本地验过，**未提交**）：
  - 新路由 `src/pages/og/[locale]/[card].png.ts` 在构建时给每个文章页生成一张图，文件名带标题的短哈希；`src/lib/og-card.ts` 算地址。
  - 中英文文章页（含英文占位页）的 `og:image` 换成自己的分享图，并声明 1200 × 630；其他页面仍用默认分享图。
  - `qa-build.mjs` 检查每个文章页的 `og:image` 都是自己的分享图，并检查尺寸与体积。
  - 新增构建依赖 `fontkit`、`@resvg/resvg-wasm`；字体用网站已有的两个 fontsource 包。
- **检查**（Mac）：
  - 质量检查 209 项通过、0 失败，加对照网站 219 项通过；两次导出 353 个文件逐字节一致；生成器 `--check` 一致。
  - 网站完整 `npm run qa` 通过。网站两次构建的 18 张分享图逐字节一致，也与本仓库用同一标题生成的逐字节一致；最大 48 KB。
  - 用网站的生产构建打开中英文文章页，`og:image` 能取到 1200 × 630 的 PNG；首页仍是默认分享图。
  - 按 tag 正式同步 27 个文件，`sync --check --tag` 确认网站里的副本与 `vermilion-v1.4.0` 的构建逐字节一致；同步后网站再跑完整 QA 通过，18 张分享图与批准时逐字节一致。
  - 没有验证：微信、LinkedIn 的真实转发预览（要等上线）；Vercel 上的实际构建（wasm 与 JS 的运算应当跨平台一致，但没有实测）。

## 2026-11-02 · VL1 · Phase 8 内容图标集（vermilion 1.3.0）

- **选择**（站主）：
  - 清单：拟的 20 个加备选 4 个，共 24 个。
  - 写法：`:tip:`（两个冒号夹着名字），不用 `:icon[tip]`。
  - 职业页的 ❗ 由 Agent 换。
  - 画法：小样页给了「简笔加纸片」与「只有简笔」，各配跟文字与结构色两种颜色，另附 Lucide 对照。站主选「简笔加纸片 · 结构色」，所以笔势仍按 §4 用 `accent`，计划里「颜色跟文字走」不再适用。
  - 站主批准全部 24 个图标与清单。
- **资产**（`tooling/graphic/` 生成，`approved`）：
  - `marks/graphic/icon-<名字>.svg` × 24：64 网格，一张纸片加 1–2 笔光洁的笔势。笔比分类图形简笔版略粗（最粗处 6–10.5），在 16–20px 里分得清。
  - 纸片没设变量时不画（`var(--va-paper, none)`），在没有 `graphic.css` 的地方只剩笔势，不会变成实心一块。
  - `marks/icons.json`：名字、中英文标签与关键词，加每个图标可内联的 SVG。与 SVG 同源生成，清单里登记为 `content-icons`。
  - `marks/icons.md`：Markdown 写法说明，给写内容的人与 Pomelo 编辑器。
  - 自查时重画了三个：推荐（原来像加号）、绘画（原来和写作太像）、日期（原来像窗户、后来像软盘）。
- **规则**：
  - `DESIGN.md` §6 写入内容图标：画法、颜色、尺寸、写法、读屏，以及和 Lucide 的分工。§4 资产清单加上，§7 去掉。
  - `tokens/contrast.json` 新增两对：笔势对卡片、对纸片。
- **工具**：
  - 生成器新增 `icons.mjs` 并产出 `icons.json`，已批准的 `icons.json` 同样拒绝覆盖。
  - `svg.mjs` 的上色认得 `none` 兜底。
  - 目录页能显示清单文件。
  - 现有资产与动效产物逐字节不变。
- **检查**（Mac）：
  - 质量检查 191 项通过、0 失败（对比度 26 项含新增两对，明暗各一）。
  - 两次导出 340 个文件逐字节一致；生成器 `--check` 一致。
  - 笔势在页面、卡片、纸片上明暗都是 Lc ≥ 60。按钮悬停底色上跟着文字变成 `accent-strong` 后，是 63.3（浅）/ 62.1（深）。
- **网站**（打 tag 前，`icons.json` 临时放进 `src/vendor/vermilion/icons/` 验证）：
  - 新增 `src/lib/content-icons.mjs`（替换与去除）与 `src/lib/remark-content-icons.mjs`（remark 插件，不加新依赖），`astro.config.mjs` 接上插件。
  - 职业页的按钮、技能、经历条目与文章摘要能显示图标；卡片摘要、`meta description` 去掉写法。
  - `global.css` 加 `.va-icon`：1.2em，按钮里不缩小；链接与按钮悬停时笔势跟着文字变色。
  - 职业页中文按钮的 `❗️中文页面简历仍在完善中❗️` 改为 `:tip: 中文页面简历仍在完善中`（只改这一行）。
  - 用 Astro 自己的 Markdown 处理器测了插件：正文、粗体、链接里替换；行内代码、代码块、`10:30`、`:abc:` 不动；中文文件读「提示」，英文文件读 “Tip”。
  - 类型检查通过，构建通过。
  - 职业页：读屏读出「提示」；图标 19.2px；明暗与 390 宽都没有横向溢出，没有脚本错误。
- **Design System** 发布到第 14 版：
  - 新增 ContentIcon 组件。
  - 上传 48 个上好色的内容图标。
  - 说明、Icons 资产说明、`bundle.css` 跟着改。
  - 21 个预览明暗各渲染一遍，没有问题；线上页面未目视。

## 2026-11-02 · VL1 · Phase 7 404 插图与文末落款（vermilion 1.2.0）

- **选择**（站主，2026-11-01 至 11-02）：
  - 小样页给了 404 两版（山外、折页）、落款三版（抵达、远山、三点），左浅右深，可重播写出。站主选 404「折页」；落款三版都要，每次打开文章随机一版；落款滚到时写一次。
  - 站主觉得描边绘制 320ms 太快。速度对比页把 320 / 480 / 640 / 800 / 1000ms 五档同时播放，站主选 640ms。
  - 站主批准全部新资产与零件。
- **资产**（`tooling/graphic/` 生成，`approved`）：
  - `marks/graphic/not-found.svg`：404 插图「折页」，640 × 400，提按。地图纸从左下角出血、右上角折起一角，笔冲出纸边，圆相落在纸外。
  - `marks/graphic/end-mark-arrive.svg`、`end-mark-hills.svg`、`end-mark-dots.svg`：三版文末落款，64 网格，光洁。
  - 生成结果与站主看过的小样逐字节一致；已批准的旧图形一个都没动。
  - 旧 404 位图在清单里记 `supersededBy`，留档。
- **动效零件**（`calm`，`approved`）：
  - `stroke-draw-v2`：描边绘制 640ms（纸片淡入 320ms，每笔 640ms / 笔画数）。类名改为 `.va-draw-v2`，与初版同页不冲突。初版 `stroke-draw`（320ms）记 `supersededBy`，留档，网站没用过。
  - `not-found-intro`：404 插图，打开页面时写一次，不需要脚本。
  - `end-mark`：三版放在一个片段里，`end-mark.js` 每次随机挑一版，第一次滚进视口时写一次。打开页面时已经在屏幕里的直接静态显示。等待时整版 `visibility: hidden`，不只是把笔画倒回起点，因为倒回的笔画在起点会留一个圆头小点。没有脚本时只显示第一版。
  - 每个零件都有规格、实时版、明暗 GIF、逐帧总览与减弱动效回退。
- **规则**：
  - `tokens/motion.json` 新增 `calmExceptions`。描边绘制 640ms 超过 calm 入场 320ms 的上限，登记为站主批准的例外，只适用于登记的三个零件。
  - `DESIGN.md` §4 写入 404 插图与文末落款，§5 写入描边绘制 v2、例外与两处用法，§7 去掉已完成的一条。
- **工具**：
  - 质量检查认得 `calmException`。
  - 导出与目录页支持 `playAll`（三版落款同时写）。
  - 零件可以带 `files.site`（给网站用、与演示不同的片段）。
  - 目录页显示「取代 / 已被取代」与时长例外。
  - 生成器的方形渲染尺寸改按网格判断，现有资产不受影响。
- **检查**（Mac）：
  - `npm run all` 质量检查 138 项通过、0 失败；加对照网站 148 项通过。
  - 两次导出 219 个文件逐字节一致。
  - 生成器 `--check` 一致。
  - 逐帧总览明暗都目视过。
- **网站本地预览**（打 tag 前，零件临时放进 `src/vendor/vermilion/`）：
  - 404 页明暗与 375 宽：插图写出，没有横向溢出，不再有 `<img>`。
  - 中英文文章：每页一个落款，遮罩 id 不重复。英文占位页（链向中文原文）不放。
  - 无头浏览器检查：滚到前隐藏 → 滚到时写出 → 写完；减弱动效时静态、没有动画（404 也是）。打开 30 次三版都出现（12 / 10 / 8）；落款一打开就在屏幕里时直接静态；没有脚本错误。
  - 预览面板在后台时 IntersectionObserver 不触发，面板重新显示后正常。
- **发版与同步**：
  - 站主打 tag `vermilion-v1.2.0`（`234c251`）。第一次误打在主工作区只含 Phase 6 遗留文档的提交上（版本仍是 1.1.0），同步工具不会接受；站主删掉远端与本地的 tag，在 worktree 提交、合并 main 后重打。
  - 按 tag 在 Mac 上构建、同步到网站：新增 6 个文件，共 23 个。`--check --tag` 与 tag 的构建逐字节一致。同步前删掉了临时放进去的零件文件。
- **网站**（站主授权编辑，未提交）：
  - 404 页换成内联的「折页」插图。
  - 中英文文章正文后加落款与 `src/scripts/end-mark.ts`。
  - `BaseLayout` 引入三个零件的样式，`global.css` 删掉旧 `img` 规则、加 `.wander-article-end`。
  - 删除旧位图 `wander-error-cloud-pages-404.png`。
  - `qa-build.mjs` 改查内联 404 插图与每篇文章的落款（有正文的 1 个，英文占位页 0 个）。
  - `DESIGN.md` 第 10 节、`README.md` 目录表跟着改。
  - 完整 `npm run qa` 通过（29 个页面、类型检查、资源审计、引用、构建、职业、Wander、分类、发现）。
  - 同步后再查本地预览：404 与中英文文章没有脚本错误，也没有失败的请求。
- **Design System** 发布到第 13 版：
  - 上传 8 个资产（三版落款与 404 插图的明暗 SVG）。
  - StatusState 换上 404「折页」，Prose 加文末落款；说明、资产说明、`bundle.css` 跟着改。
  - 20 个预览明暗各渲染一遍，没有问题；线上页面未目视。

## 2026-11-01 · VL1 · Phase 5 调整与 Phase 6 动效小零件（vermilion 1.1.0）

- **Phase 5 验收与调整**：站主验收 Phase 5，并要求页头只放 Logo A 标志、不放名字，网站不放分区装饰。
  - 网站的 `SiteHeader.astro` 恢复原样；`PageShell` 去掉装饰位；六个页面去掉 `deco`；对应的样式与脚本删除。
  - `wordmark.svg` 与分区装饰的零件留在本仓库，不再同步。
  - `DESIGN.md` §4、§6 与问卷记录跟着改。
- **四个 `calm` 零件**（站主批准，`motion/` 下）：
  - 链接下划线收拢 `link-underline`：提取自网站正文链接，220ms，与网站逐像素一致（明暗各 9 个时间点）。
  - 选中指示滑移 `selection-slide`：单选项下的 1.5px 青绿下划线，换选时滑过去（位移与横向缩放 220ms），取消时淡出，第一次选中原地淡入；`selection-slide.js` 量位置。
  - 数字计数 `count-up`：徽标从 00 数到实际值，320ms。用 `@property` 注册的整数做 CSS 动画，所以能逐帧定格导出 GIF；每次打开网站只数一次。
  - 描边绘制 `stroke-draw`：「笔势与纸片」图形按笔顺画出，320ms，片段由生成器产出，留给 Phase 7。
  - 共用标记 `motion/visit-once.js`：同一次访问的后续页面根元素带 `data-va-visited`。
  - 每个零件都有规格、实时版、明暗 GIF、逐帧总览与减弱动效回退。目录页里的重播都能用。
- **工具**：
  - 网站对照改成由零件 `motion.json` 的 `parity` 声明，Logo 与链接下划线都用它。
  - 导出与目录页支持 `playTarget`，触发类可以加在演示里的某个元素上。
  - 同步工具认得零件共用的文件。
- **网站**（站主授权编辑网站，`/love-shuyu/` 除外；未提交）：
  - 按 `vermilion-v1.1.0` 重新同步：删除名字与分区装饰的 4 个文件，新增滑移、计数与 `visit-once.js`。
  - 首页话题栏接上选中指示滑移，数量徽标接上计数。
  - 网站 `DESIGN.md` 第 10 节重写。
- **检查**：
  - 网站完整 `npm run qa` 通过。
  - 本地预览：桌面明暗、390 宽、减弱动效四种情况下，计数第一次打开时数一遍，跳页再回来直接显示数字；话题下划线滑到新话题并贴着文字（左缩进 6px），取消时淡出；没有横向溢出、没有脚本错误。
  - 本仓库：质量检查 118 项、对照网站 129 项通过；两次导出 179 个文件逐字节一致；网站里的副本与 `vermilion-v1.1.0` 的构建逐字节一致。
  - 打 tag 前先把零件临时注入网站本地预览，在真实的话题栏与徽标上试过。
- **Design System** 发布到第 12 版：
  - SiteHeader 回到只有标志；SectionDeco 注明网站不用。
  - PageHeading（计数）、WanderFilter（选中指示）、TextLink（零件）说明更新；`bundle.css` 加入滑移与计数的样式。
  - 20 个预览明暗各渲染一遍，没有问题；线上页面未目视。
- **失误**：开工备份时把整个网站目录（含 `/love-shuyu/`）复制进了本仓库的 `scratch/`，发现后立即删除，改为只备份要改的文件。

## 2026-10-31 · VL1 · Phase 5 首批上线（vermilion 1.0.0）

- **验收与发版**：
  - 站主验收 Phase 4：图形语言 19 个资产与三个动效零件改为 `approved`。
  - 站主批准新做的字标与默认分享图。
  - `scheme.json` 升到 `1.0.0`，站主打 tag `vermilion-v1.0.0`。
- **派生资产**（`tooling/marks/derive.mjs`，规格在 `marks/derived.json`）：
  - 把字标里的「Elen Skye」用 Noto Serif SC 600（OFL，取自 `@fontsource/noto-serif-sc` 5.2.9，与网站同版本）转成曲线，得到 `wordmark.svg` 与 `logo-lockup-paths.svg`。
  - 排字用 fontkit，带 GPOS 字偶距。与浏览器排的原字标逐字比较，位置一致，只有字形边缘的抗锯齿差。
  - 合成默认分享图 v3：分享图底图、字标与「呦呦漫游 · Wander」，1200 × 630，约 39 KB。
  - 已批准的拒绝覆盖。质量检查新增「派生资产与生成器一致」。
- **同步工具**（`tooling/sync/sync.mjs`，清单在方案的 `sync.json`）：
  - 用 `git archive` 把 tag 导出到临时目录，再在 Mac 上构建，所以工作区里没提交的改动不会混进去。
  - 只同步 approved 的资产与零件，tag 名要与版本号对得上。
  - 目标目录与上次的 `SHA256SUMS` 不一致就停下；复制后写入 `VERSION`、`README.md`、`SHA256SUMS`；`--check` 可以核对。
  - 在一个临时克隆里测过：首次同步、重复同步（写入 0 个）、手改与多出文件的检测、`--force`、tag 名不对、未批准资产被拦下。
- **分区装饰入场**改为每次打开网站只写一次：零件新增 `section-deco-intro.once.js`，同一次访问里之后的页面根元素带 `data-va-visited`、直接显示终态。`DESIGN.md` §5、`tokens/motion.json` 跟着改。
- **网站**（站主逐个文件授权，未提交）：
  - 同步 17 个文件到 `src/vendor/vermilion/`。
  - 页头换成字标。
  - 无封面卡片换上写作、项目、画廊、创作四类分类图形，悬停时写出；卡片窄时图形移到标题上方。
  - 呦呦漫游、当下、站内搜索三页加分区装饰；站内搜索页改用 `PageShell` 页头。
  - 卡片墙与搜索的空状态换成矢量图；搜索等待超过 250ms 时显示加载圆相。
  - 默认分享图换成 v3；修掉左上角的灰影。
  - 删除两张旧位图；`qa-build.mjs` 跟着改；网站 `DESIGN.md` 末尾加第 10 节登记。
- **检查**：
  - 网站：完整 `npm run qa` 通过（29 个页面、类型检查、资源登记、引用、职业页、卡片墙、分类、搜索）。
  - 本地预览逐页截图（首页明暗、768 / 520 / 390 宽、悬停、当下、搜索无结果、搜索等待），没有横向溢出、没有脚本错误、遮罩 id 没有重复。同一次访问里第二页的装饰确实直接显示终态。
  - 本仓库：质量检查 102 项、对照网站 113 项通过；`logo-route` 与网站逐像素一致；两次导出 153 个文件逐字节一致；网站里的副本与 `vermilion-v1.0.0` 的构建逐字节一致。
- **工具小改**：
  - 对照检查只截标志本身：网站的链接里标志旁边多了名字。
  - 被取代的旧资产（旧默认分享图、旧空状态位图）在清单里记 `supersededBy`，不再与网站对照。
  - 派生资产里的 `text` 等颜色角色，上色时直接取方案的颜色。
- **Design System**「Vermilion 朱红」发布到第 11 版：
  - 上传字标转曲线（SVG 与明暗 PNG）、名字 SVG、默认分享图 v3。
  - SiteHeader、WanderCard、PageHeading、SectionDeco、StatusState、SiteSearch、CategoryGlyph 的说明与预览改成网站现状。
  - `bundle.css` 同步网站新增的样式。
  - 20 个预览明暗各渲染一遍，没有问题；线上页面未目视。

## 2026-10-31 · VL1 · 网站优化问卷第一轮与新计划

- 读回站主提交的问卷（`survey/answers`，2026-10-31 12:05 UTC 提交）：20 题与 23 条判断全部作答。答案与解读写进新文件 `docs/website-survey.md`。读回后又当面确认了三件事：内容图标归属、职业页的 ❗、发版方式。
- `ROADMAP.md`：
  - Phase 5 起重排为六个 Phase：首批上线、动效小零件、404 与文末落款、内容图标集、每篇文章的分享图、作品水印。原 Phase 7「同步」拆进各 Phase。
  - 问卷的决定写进「已拍板的决定」。
  - 待确认里三件已有答案：多出的两个分类图形留作备用、旧插图在 Phase 5 换、`git init` 放在第一次同步之前。
- `schemes/vermilion/DESIGN.md`：
  - §1：内容图标是唯一的 Pomelo 例外；写入网站优化的取向。
  - §4：网站只用四类分类图形；分区装饰只放三页；矢量接替者在 Phase 5 换上。
  - §5：分区装饰入场改为每次打开网站只写一次；不再登记新的 `expressive` 表面；列出 Phase 6 的 `calm` 零件。
  - §6：页头换字标；内容图标。
  - §7：更新待确认。
  - 只改文字，token、资产、零件与工具都没动。`tokens/motion.json` 的触发说明在 Phase 5 跟着改。
- 其他文档：`docs/adoption.md` 写入第一次同步前 `git init`，以及 Pomelo 的内容图标例外；`README.md` 的目录说明加上问卷文件；`tooling/README.md` 的同步工具改为 Phase 5 实现。

## 2026-10-31 · VL1 · Phase 4 收尾：Mac 复核，Vermilion 只用于网站

- 在 Mac 上复跑 Phase 4（此前只在云端跑过）：质量检查 97 项通过、0 失败；对照网站 110 项通过；`logo-route` 明暗各 13 个时间点与网站逐像素一致；同机两次导出 145 个文件逐字节一致；生成器 `--check` 与 27 个源文件一致。图形与三个动效的逐帧总览图已目视，明暗都正常。
- 站主决定 Vermilion 只用于个人网站，Pomelo 在 VL2 另建方案与 Design System。`schemes/vermilion/` 去掉写给 Pomelo 的内容：`DESIGN.md`（§1 用途、§4 墨感与「用到别处」里的 App 图标、模块图标、菜单栏模板图，§5 分类图形悬停的 Pomelo 模块图标，§7 Pomelo 未决项）、`scheme.json` 的消费方、`tokens/targets.json` 的 Pomelo 方言、`tokens/contrast.json` 的 Pomelo 配对、`tokens/motion.json` 与 `tokens/graphic.json` 的用途说明（几何与参数未动，生成的 SVG 不变）、`type/fonts.json` 的手札体、Design System 的 LoadingEnso 说明。
- 工具：Pomelo 方言改为方案在 `targets.json` 里声明了才生成（`tokens/build.mjs`、`lib/common.mjs`、`catalog/build.mjs`），留给 VL2 的新方案用；旧的 `dist/vermilion/tokens/pomelo.css` 构建时自动删除。
- 检查（Mac，改动后）：质量检查 95 项通过、0 失败（少的 2 项是删掉的 Pomelo 对比度配对，明暗各一）；对照网站 108 项通过；两次导出 144 个文件逐字节一致；生成器 `--check` 一致；目录页不再出现 Pomelo。
- Design System「Vermilion 朱红」发布到第 10 版：只改 LoadingEnso 说明与 index 的 `lastChange`；发布前与线上逐个比对，README、tokens 与其余文件和本地构建一致。
- 网站优化问卷（私有页面，https://claude.ai/artifact/4WRcFrgr2A267EsRrfghVR ）：8 页选择题与判断题，第 1、3、4、5、6 页题前附 Agent 的分析与建议；用线上网站截图（只读访问）和图形语言源 SVG 做示意；答案自动存进页面存储。本机渲染检查：浅色、暗色、手机宽度均无横向溢出、无脚本错误；线上存储可读，尚无答案。
- 文档：`ROADMAP.md`（Phase 6 移到 VL2，VL2 写入 Pomelo 新方案及其输入）、`README.md`、`docs/adoption.md`、`docs/architecture.md`、`docs/licensing.md`、`docs/exploration-brief.md`、`tooling/README.md`。

## 2026-10-30 · VL1 · Phase 4 图形语言成文与资产（待站主验收）

- 站主批准 `schemes/vermilion/DESIGN.md` §4「笔势与纸片」与 §5 登记的三个 `expressive` 表面；大图墨感定为「提按」（不加纹理，靠粗细起伏）。`tokens/graphic.json` 改为 `approved`，写入提按参数；`tokens/motion.json` 的登记表面改为 `approved`。
- 新增生成器 `tooling/graphic/`（`npm run build:graphic`，`--check` 只比较）：探索期的脚本整理成 ESM，几何与站主在画布上看过的版本逐路径一致。已批准的图形拒绝覆盖。
- 资产（`proposed`）：`schemes/vermilion/marks/graphic/` 下 18 个 SVG——分类图形六类 × 三笔版、简笔版，分区装饰，分享图底图，空状态，PPT 封面与章节页底图，加载圆相静止帧；外加内联上色用的 `graphic.css`。源文件不写死颜色（`colorMode: roles`），构建时另出上好色的明暗 SVG（`dist/<方案>/marks/themed/`）与 PNG。
- 动效零件（`proposed`，`expressive`）：`motion/category-glyph-hover`（700ms）、`motion/section-deco-intro`（1030ms，载入时一次）、`motion/loading-enso`（1800ms 一圈循环），各带减弱动效回退、实时版与明暗 GIF。
- 工具：`render/marks.mjs` 支持角色上色与长方形导出；`render/motion.mjs` 支持依赖样式、画布尺寸、入场与循环的定格；质量检查新增「源文件与生成器一致」「expressive 必须是登记表面」「循环按登记时长」；目录页能展示多色图形与新零件。修正逐帧定格的一个竞态：遮罩里的动画定格后要等重绘再截图，否则偶尔截到上一帧（Logo 动效的产物不受影响，逐字节与改动前相同）。
- Design System「Vermilion 朱红」更新：说明新增「图形语言：笔势与纸片」一节，动效、图标、资产几节跟着改；新增 CategoryGlyph、SectionDeco、LoadingEnso 三个组件；Icons 新增分类图形 24 个、Illustrations 新增大图 12 个；WanderCard、StatusState 补充图形语言说明（网站换用前，WanderCard 预览仍按网站现状）。
- 检查（云端）：质量检查 97 项通过、0 失败；两次导出 145 个文件逐字节一致；生成器 `--check` 与源文件一致；Design System 20 个预览明暗各渲染一遍，无脚本错误、无横向溢出；36 个新资产的字节数与资产库一致。尚未在 Mac 上复跑；线上 Design System 页面未目视。

## 2026-10-23 · VL1 · Phase 2 Design System

- 发布 Claude Design System「Vermilion 朱红」（https://claude.ai/artifact/SstTrLGgvnTocopdSsfF5i ）：明暗 12 个颜色 token（含焦点色别名）、间距 9 档、圆角 2 档、阴影、宽度与字号变量，22 个字体样式；说明书（内容基调、颜色、排版、版面、状态、动效、图形母题、图标、资产、图像）；网站全部 16 类组件的静态预览与使用说明，加封面；Logo、图标、插图共 14 个资产。
- 源放在 `schemes/vermilion/design-system/`：组件样式 `bundle.css` 由网站样式表一次性迁入（类名与数值不变，基础元素样式收进 `.vm-page`）；token 的数值由 `tokens/` 生成。新增 `tooling/design-system/build.mjs`（`npm run build:ds`）与 `check.mjs`（`npm run check:ds`）。
- 资产库会去掉 SVG 里的 `<style>`：favicon 改为上传明暗两张 128px PNG（`marks/manifest.json` 给 favicon 加了 128px 导出），单色 Logo 另上传上好色的 PNG。
- 检查：17 个预览明暗各渲染一遍，无脚本错误、无横向溢出；对照网站的质量检查 57 项通过；已从 Design System 读回 index 与 14 个资产记录，与本地一致。线上页面未目视（内置浏览器未登录 claude.ai）。

## 2026-10-23 · VL1 · Phase 1 验收（Set Up）

- 站主验收目录页；批准 `schemes/vermilion/DESIGN.md` 为 Vermilion 的规则来源，`route-glyph` 纳入基线（`approved`），方案状态改为 `approved`。
- `DESIGN.md` 补进控件规则（标签、圆形按钮、社交入口、画廊），去掉指向网站文件的说法。
- 独立化：本仓库的文档与 token 不再指向其他项目；对照网站的检查改为只读、可选的「网站对照」。
- 计划标识改为 `VLx` / `Phase x`；探索简报改为给 Vermilion 补图形语言。
- 网站仓库（获授权，只改 `DESIGN.md`）：登记漫游路径小图标；两处 visual-assets 提法改成「复制来的已发版本，网站内不手改」。未提交。
- 检查：对照网站的质量检查 57 项通过、0 失败。

## 2026-10-23 · 阶段 0 复核与补漏

- 补迁网站 About 页标题前内联的漫游路径小图标：`marks/route-glyph.svg`（`proposed`）。质量检查新增「内联来源」核对：没有独立源文件的资产，核对关键几何仍在来源里。
- `schemes/vermilion/DESIGN.md` 写成从网站 `DESIGN.md` §1–§7 与 `global.css` 提炼的规则稿（待批准）；新增 `type/fonts.json` 字体清单。
- 文档：开发计划改为「Design System → 图形语言探索 → 其余开发」；探索改在 Claude 会话里进行；去掉过时的状态与重复的数值。
- 在 Mac 上复核：对照网站的质量检查 57 项通过、0 失败；动效与网站逐像素一致；两次导出 34 个文件逐字节一致。与云端产物相比，标志 PNG 逐字节一致，动效帧最大通道差 2/255。

## 2026-10-23 · 阶段 0 脚手架（0.0.0，基线已迁入）

- `schemes/vermilion/` 迁入网站的自定义视觉资产 10 个（Logo A v1.0.0 的 5 个 SVG、favicon、apple-touch-icon、OG 图、两张状态插图），逐字节与网站一致。
- token 结构化：11 个颜色角色的明暗取值、字号与间距等刻度、动效档位数值、对比度配对、各方言的变量映射。网页方言与网站 `global.css` 的变量逐项一致。
- 工具：token 构建、标志导出（PNG）、动效逐帧导出（GIF 与逐帧总览图）、质量检查、确定性检查、动效对照检查、目录页。
- 动效零件 `logo-route`（`calm` 档招牌动作），含减弱动效回退；与网站真实悬停动画逐像素一致。
- 自检：54 项通过、0 失败；两次导出 31 个文件逐字节一致。在云端环境运行，尚未在 Mac 上复跑。
- 修正：重复构建时，如果 `dist/` 里有只读的旧文件，`build:marks` 会报 EACCES。现在写文件前先删除旧文件，复制文件也不再继承只读权限；已用非 root 用户在只读旧产物上验证。
- 网站仓库：仅 `DESIGN.md` 被修改（动效档位与共享资产来源），未提交；Pomelo 无改动。

## 2026-10-23 · 仓库骨架

- 建立目录结构、`CLAUDE.md`（`AGENTS.md` 软链接指向它）、`docs/`、`schemes/_template/` 与 `schemes/vermilion/` 的占位、`tooling/` 与 `skills/` 目录。
