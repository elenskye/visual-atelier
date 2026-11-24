> 归档（2026-11-02）：VL1 的历史记录，内容没有改，状态与待确认都停在归档之前。不是规则，说明见同目录 `README.md`。

# ROADMAP

## 当前状态

**VL1 的开发全部完成（2026-11-02）。** Phase 10（作品水印）已发版 `vermilion-v1.5.0` 并同步到网站，站主已用自己的作品试跑并批准；网站完整 `npm run qa` 通过。还差两件站主的事：提交、推送网站后看一眼线上的画廊，以及验收 Phase 2（Design System）。网站改动在工作区，**未提交**。Design System 发布到第 16 版。VL2 未开始，开工需站主指令。

上一阶段：**VL1 · Phase 9（每篇文章的分享图）已验收（2026-11-02）。** 发版 `vermilion-v1.4.0`，已同步并上线（`website v1.0.3`）。线上文章页的 `og:image` 已是各自的分享图，Vercel 构建正常；站主看过微信、LinkedIn 的转发预览，没有问题。

Phase 2（Design System）仍待站主验收。

- 网站优化问卷：第一轮 2026-10-31 提交，答案与解读见 `docs/website-survey.md`；页面「网站优化问卷」https://claude.ai/artifact/4WRcFrgr2A267EsRrfghVR （私有，8 页），答案存在页面自己的存储里（`survey/answers`），Agent 用 ArtifactData 读回。页面源在 `scratch/website-survey/`（`python3 build.py` 生成，不进 Git）。
- 探索画布：「Vermilion 图形语言 · 探索」https://claude.ai/artifact/HiPsn6vm1nLTknV2witmCb （私有）。三轮经过见 `docs/exploration-brief.md` 的探索日志。
- 生成器在 `tooling/graphic/`（`npm run build:graphic`）。探索期的草稿脚本与迁移测试的 GIF 仍在 `scratch/graphic-language-r3/`（不进 Git）；其中 Pomelo 的 App 图标、菜单栏与模块图标草稿是按 Vermilion 规则画的，不再属于任何方案，VL2 是否参考由站主届时决定。

- Design System「Vermilion 朱红」：https://claude.ai/artifact/SstTrLGgvnTocopdSsfF5i （私有）。源在 `schemes/vermilion/design-system/`，由 `npm run build:ds` 生成，发布步骤见 `tooling/README.md`。
- `schemes/vermilion/` 是 Vermilion 的唯一来源，当前版本 `1.5.0`（tag `vermilion-v1.5.0`）：规则 `DESIGN.md` 已批准；四层齐全：`tokens/`、`marks/`（迁入的 11 个资产、图形语言 18 个 SVG 与 `graphic.css`、派生的字标与默认分享图 3 个，全部 `approved`）、`motion/`（`logo-route` 与图形语言三个零件，`approved`）、`type/fonts.json`。同步清单在 `sync.json`。
- 网站里的副本：`~/Documents/GitHub/personal-website/src/vendor/vermilion/`（`vermilion-v1.5.0`，29 个文件，`VERSION` 记版本与提交）。`npm run sync -- --scheme vermilion --to personal-website --check` 核对没被手改。
- Mac 上的检查（2026-11-02，Phase 10 后）：`npm run all` 质量检查 210 项通过、0 失败，水印检查 50 项通过，加对照网站 220 项通过；同机两次导出 359 个文件逐字节一致；生成器 `--check` 一致；网站里的副本与 `vermilion-v1.5.0` 的构建逐字节一致。网站完整 `npm run qa` 通过，12 张作品图带水印，其余资源库图片与原文件逐字节相同。
- Mac 上的检查（2026-11-02，Phase 9 后）：`npm run all` 质量检查 209 项通过、0 失败，加对照网站 219 项通过；同机两次导出 353 个文件逐字节一致；生成器 `--check` 一致；网站里的副本与 `vermilion-v1.4.0` 的构建逐字节一致。网站完整 `npm run qa` 通过；网站多次构建的 18 张分享图逐字节一致，也与本仓库用同一标题生成的逐字节一致。
- Mac 上的检查（2026-11-02，Phase 7 后）：`npm run all` 质量检查 138 项通过、0 失败，加对照网站 148 项通过（旧 404 位图已被取代，不再对照）；同机两次导出 219 个文件逐字节一致；生成器 `--check` 一致；网站里的副本与 `vermilion-v1.2.0` 的构建逐字节一致。
- Mac 上的检查（2026-11-01，Phase 6 后）：质量检查 118 项通过、0 失败，加对照网站 129 项通过；`logo-route` 与 `link-underline` 与网站逐像素一致；同机两次导出 179 个文件逐字节一致；生成器与派生资产 `--check` 一致；网站里的副本与 `vermilion-v1.1.0` 的构建逐字节一致。和云端产物相比，动效帧有 ≤ 2/255 的抗锯齿差，所以发版构建固定在 Mac 上做。
- 目录页：`dist/catalog/index.html`，用浏览器直接打开。

## 开发计划

大阶段记作 `VLx`，子阶段记作 `Phase x`，写作「VL1 · Phase 2」。方案自己的版本号（semver）另记，不随阶段走。每个 Phase 开工都需要站主的显式指令。

### VL1

| Phase | 内容 | 验收点 | 状态 |
| --- | --- | --- | --- |
| 1 Set Up | 工具链；网站的视觉资产与规则入库；Logo A 的「虚线延伸 → 到达 → 圆圈变红」提炼成 `calm` 零件 | 资产与网站一致；导出确定；站主验收目录页 | 已验收（2026-10-23） |
| 2 Design System | 用 `schemes/vermilion/` 生成 Claude 的 Design System：说明、明暗 token、字体与刻度、组件预览与规范、标志资产。来源仍是本仓库 | 站主在 Claude 里浏览确认；token 与本仓库一致 | 已发布（2026-10-23），待站主验收 |
| 3 图形语言探索 | 给 Vermilion 补一套图形语言。站主在 Claude 会话里主导，画布用 Vermilion 的 Design System；交接见 `docs/exploration-brief.md` | 选定方向，写成规则并通过迁移测试 | 完成（2026-10-30）：站主批准规则，大图墨感定为「提按」 |
| 4 图形语言成文与资产 | 规则写进 `DESIGN.md` §4，图形落进 `marks/`，Design System 跟着更新 | 站主批准 | 已验收（2026-10-31） |
| 5 首批上线 | 同步工具；字标转曲线、新的默认分享图；把 Phase 4 已做好的资产换到网站上，统一页头，修小毛病 | 站主批准字标与默认分享图；网站本地预览目视通过 | 已验收（2026-11-01）；按站主要求调整：页头不放名字、网站不放分区装饰 |
| 6 动效小零件 | `calm` 零件：链接下划线收拢、选中指示滑移、数字计数、描边绘制；网站接上滑移与计数 | 每个零件有规格、实时版、GIF 版、减弱动效版；站主目视手感 | 已验收（2026-11-01） |
| 7 404 与文末落款 | 新画 404 插图；文章结尾的小图形 | 站主选定小样并批准；网站目视 | 已验收（2026-11-02） |
| 8 内容图标集 | 一套「笔势与纸片」风格的常用图标，可写进网站内容；职业页的 ❗ 换成「提示」图标 | 正文字号下分得清；网站目视 | 已验收（2026-11-02） |
| 9 每篇文章的分享图 | 每篇文章各有一张分享图，网站构建时按标题自动生成，发文章不用手动做图 | 转发预览目视；两次输出一致 | 已验收（2026-11-02） |
| 10 作品水印 | 画作与摄影的水印样式与批处理 | 站主用自己的作品试跑目视 | 站主已试跑并批准，已发版并同步（2026-11-02，`vermilion-v1.5.0`）；待网站提交、上线后看一眼线上画廊 |

原 Phase 6「Pomelo 身份」2026-10-31 移到 VL2。原 Phase 7「同步」拆进 Phase 5–10：同步工具在 Phase 5 做，之后每个 Phase 自己同步。

#### 每个 Phase 的走法（Phase 5 起）

按 `docs/workflow.md`：

1. 在本仓库做。
2. 在目录页或 Claude 画布里给站主看；要选的给 2–3 版小样。
3. 站主批准，资产改为 `approved`。
4. 站主提交并打 tag，Agent 在 Mac 上按 tag 构建。
5. 站主逐个文件授权后，同步到网站，中英文页一起改。
6. 站主在网站本地预览里目视，明暗、手机宽度、减弱动效都看。
7. Design System 跟着更新。

日常只跑与改动相关的检查；每次打 tag 前跑 `npm run all`。网站仓库的提交与推送由站主做。

#### Phase 5 · 首批上线

本仓库：
- `tooling/sync/`：按 tag 在 Mac 上构建，复制到网站的约定目录，写 `VERSION` 与校验和；`--check` 核对网站里的副本有没有被手改。
- 字标转曲线：字体是 Noto Serif SC 600，OFL 许可，可以转。做成 `logo-lockup` 的新版本，外观与现版一致。
- 默认分享图：分享图底图加转好曲线的字标，导出 1200 × 630 PNG。
- 分区装饰入场改为「每次打开网站只写一次」：同步改 `DESIGN.md` §5 与 `tokens/motion.json` 的触发说明，零件加一个直接显示终态的入口。
- 目录页加上字标、默认分享图，以及卡片和页头接入网站后的示意。

网站（逐个文件授权）：
- 无封面卡片：通用图标换成写作、项目、画廊、创作四类分类图形，悬停时一笔笔写出（`expressive`，700ms）。游记、其他两类不同步。
- 页头：站内搜索页改用其他主页面的同一套页头（`PageShell`），页头加分区装饰位。首页、当下、站内搜索三页放分区装饰，每次打开网站入场写一次。
- 空状态插图换矢量版；默认分享图换新图。
- 站内搜索等结果时显示加载圆相。
- 页头左上角换字标。
- 修掉每页左上角的灰影：「跳到主要内容」链接藏起来时阴影露了出来。
- 网站 `DESIGN.md` 登记这些新用法。

Design System：CategoryGlyph、StatusState 的说明里还写着「VL1 Phase 7 同步时换用」，网站换上后改成现状。

开工时确认：同步到网站的哪个目录。要避开 Pomelo 读写的 `src/content/`、`src/data/`、`public/`；分享图这类必须放在 `public/` 的文件怎么放，也要一起定。

验收点：
- 站主批准字标与默认分享图；
- 网站本地预览目视通过；
- 网站自己的检查、本仓库的对照检查都通过；
- `sync --check` 一致。

Phase 5 验收时的调整（2026-11-01，站主）：页头左上角只留 Logo A 标志，去掉名字；三页的分区装饰全部去掉，页头留白。`wordmark.svg` 与分区装饰的零件留在本仓库，不再同步到网站。

#### Phase 6 · 动效小零件（`calm`）

每个零件都带规格、实时版、GIF 版与减弱动效版，先在目录页给站主看。
- 链接下划线收拢：网站在用，提成零件，用对照检查保证与网站逐像素一致。网站那边不用换。
- 选中指示滑移：首页话题栏切换时，下划线滑到新位置。顶部导航切换是整页跳转，`calm` 不做页面转场，所以导航不滑。
- 数字计数：首页的数量徽标从 00 数到实际篇数，≤ 320ms；和页头装饰一样，每次打开网站只数一次。
- 描边绘制：图标或路径按笔顺画出的通用零件，≤ 320ms；先给 Phase 7 的 404 与文末落款用。
- 逐行显现不做（问卷没选）。

网站：首页话题栏接上滑移，数量徽标接上计数。

验收点：站主在目录页目视手感并批准；网站目视通过。

#### Phase 7 · 404 插图与文末落款

- 404 插图：按「笔势与纸片」的大图规则新画，静态不用朱红；旧位图留在 `marks/illustrations/` 存档。
- 文末落款：文章正文结尾的一个小图形，和分类图形同一网格。给 2–3 版小样，站主选；是否用描边绘制写出、什么时候写，按 `calm` 规则定。

网站：404 页；中英文文章页的结尾。

验收点：站主选定并批准；网站目视通过。

结果（2026-11-02）：
- 404 插图「折页」（`not-found`）。打开页面时用描边绘制写一次（`not-found-intro`）。旧位图留档，网站上删掉。
- 文末落款三版：抵达、远山、三点（`end-mark-*`）。每次打开文章随机一版，第一次滚进视口时写一次（`end-mark`）。只放在有正文的文章里，英文占位页不放。
- 描边绘制改为 640ms（`stroke-draw-v2`），320ms 的初版留档。
- 小样页与速度对比页在 `scratch/phase7/`（`node scratch/phase7/samples.mjs` 生成，不进 Git）。

#### Phase 8 · 内容图标集

本仓库：
- 先定清单：Agent 拟 16–24 个常用图标（提示、注意、完成、链接、地点、时间等），站主增删。
- 给 2–3 版画法的小样，放在正文字号（16–20px）里比较，例如「简笔加纸片」和「只有简笔」。
- 站主选定后写进 `DESIGN.md`，并写清内容图标和 Lucide 通用图标各管什么。
- 产物：颜色跟文字走的 SVG、`icons.json` 清单（名字、中英文标签、关键词）、Markdown 写法说明。

网站：
- Markdown 正文里的图标写法要能显示，frontmatter 的文字字段（如职业页按钮）也要能显示。网站内容只用 Markdown、不支持 MDX，所以要用 remark 插件之类的办法，新依赖写成 `^x.y.z`。
- 职业页的 ❗ 换成「提示」图标。这个内容文件由 Pomelo 读写，改前先确认由谁改。

Pomelo：「呦呦漫游」编辑器的图标选择器在 Pomelo 仓库里另做，复制 `icons.json` 与 SVG 过去。本仓库不写 Pomelo，需要时站主另开 Pomelo 的会话。

开工时确认：Markdown 里怎么写图标，例如 `:icon[tip]`。（2026-11-02 定为 `:tip:`。）

验收点：
- 24px 和正文字号下都分得清；
- 明暗两种模式的对比度过 APCA（Lc ≥ 60）；
- 读屏能读出标签；
- 网站目视通过。

#### Phase 9 · 每篇文章的分享图

本仓库：
- 版式：底图、标题、字标，中英文都要。
- 长标题怎么换行、怎么截断。
- 生成模块：同一标题两次输出逐字节一致；PNG ≤ 1.5 MB。

网站：每篇文章用自己的分享图，没有就用默认分享图。

说明（2026-10-31，答站主）：是每篇一张，但不用逐篇做。做一次模板与生成器，之后网站每次构建都按文章标题自动生成；新文章或改了标题，下次构建自动出新图，站主不用动手。做不做这个 Phase，开工前由站主定；不做就一直用默认分享图。

开工时确认：在哪生成。Agent 建议在网站构建时生成，新文章自动就有图，但要给网站加渲染依赖与 OFL 字体。另一种是本仓库预先生成，新文章要等下次同步才有图。（2026-11-01 定为网站构建时生成。）

验收点：抽几篇在微信、LinkedIn 的转发预览里目视；两次输出一致。

结果（2026-11-02）：
- 版式「低山」：底图 `og-card-graphic`，模板 `marks/og-card/template.json`，规则写在 `DESIGN.md` §4。
- 生成模块 `tooling/og-card/`（`card.mjs`、`outline.mjs`）同步到网站，网站构建时按标题生成：`/og/<zh|en>/<文章>-<短哈希>.png`。
- 18 张真实文章的图最大 48 KB，全部构建只多不到 1 秒。
- 小样页与全部文章图的总览页在 `scratch/phase9/`（`node scratch/phase9/samples.mjs`、`node scratch/phase9/real.mjs` 生成，不进 Git）。

#### Phase 10 · 作品水印

本仓库：
- 水印样式：位置、大小、在深浅画面上的取色，不遮主体。
- 批处理脚本：给一张图，出一张带水印的图。
- 演示只用假图，站主的作品不进本仓库。

开工时确认：
- 批处理跑在哪：网站的脚本，或者 Pomelo「呦呦漫游」压缩图片的那一步。后者同样只在 Pomelo 仓库里复制接入。
- 已上线的作品要不要补加。

验收点：站主在本机用自己的几张作品试跑并目视。网站 v2 待办里的「决定并实现作品水印样式与批处理方式」由此完成。

结果（2026-11-02）：
- 样式「字标」：Logo A 标志加名字，规则写在 `DESIGN.md` §4「图像」，模板 `marks/watermark/template.json`。
- 生成模块 `tooling/watermark/watermark.mjs` 同步到网站。网站 `npm run build` 在 Astro 之后把 `dist/` 里的作品图换成带水印的版本，`public/` 里的原图不动。已上线的作品由此补上。
- 给一张图出一张图的命令在网站：`npm run watermark -- <图片…>`，输出放在原图旁边。批处理放在网站，因为它要读网站的内容才知道哪些图算作品。
- 本仓库的目录页与检查只用程序画的假图（`tooling/watermark/fake-images.mjs`），站主的作品没有进本仓库。
- 小样页在 `scratch/phase10/`（`node scratch/phase10/samples.mjs` 生成，不进 Git）。

### VL2

| 内容 | 说明 | 状态 |
| --- | --- | --- |
| Pomelo 的新方案与 Design System | 从 `schemes/_template/` 新建一套 Pomelo 自己的方案（名字待定）：token、规则、图形与动效都自己定，不取用 Vermilion；再由它生成 Pomelo 的 Design System。包括原 VL1 Phase 6 的 App 图标（`tauri icon` 由一张 1024px 源图生成）、菜单栏小鸟的空心与实心、模块图标、空状态小插图，在 Pomelo 的 `?mock` 模式里目视确认 | 未开始，开工需站主指令 |

VL2 开工时的输入（历史，不是规则）：
- Pomelo 前端用 shadcn 命名变量（`--background` 等）；`tooling/tokens/` 仍能生成这种方言，新方案在 `targets.json` 里声明 `pomelo` 即可。
- 从 Vermilion 移出的两个未决项：Pomelo 的选中底色（现为柚红浅）要不要单独一个角色；危险色是否与主色分开。
- Pomelo 原生界面用手札体（macOS 系统字体，只作运行时字体，不转曲线、不进产物），许可登记在 `docs/licensing.md`。
- 2026-10-26 迁移测试里按 Vermilion 规则画过 Pomelo 的 App 图标、菜单栏模板图与模块图标（`scratch/graphic-language-r3/`，不进 Git）。移出前 Vermilion 里写给 Pomelo 的条目见备份 `scratch/backup-2026-10-31-split/schemes/vermilion/DESIGN.md` §4「用到别处」。

## 已拍板的决定

- 一个仓库加 `schemes/`；工具共用，方案独立（2026-10-23）。
- 本仓库与站主的其他个人项目互相独立：文档不互相指向，其他项目取用本仓库一律复制（2026-10-23）。
- `schemes/vermilion/DESIGN.md` 批准为 Vermilion 的规则来源（从网站规则提炼）；`route-glyph` 纳入基线（2026-10-23）。
- 阶段标识：大阶段 `VLx`，子阶段 `Phase x`；现有计划全部放进 VL1（2026-10-23）。
- 顺序：先建 Vermilion 的 Design System；再由站主在 Claude 会话里探索图形语言；探索完成后才开始其余开发（2026-10-23）。
- 图形语言是给 Vermilion 补的，不另起第二套视觉语言（2026-10-23）。
- Design System 收网站全部 16 类组件（2026-10-23）。组件是静态预览（HTML 加与网站同名同值的样式），不做 React 组件；字体用 Google Fonts 托管的同款字体，不上传字体文件（Agent 提议，站主可改）。
- Design System 只从本仓库生成和发布，不在页面上直接改（2026-10-23，Agent 提议，站主可改）。
- 探索在 Claude 会话里做，不用独立版 Claude Design（它 2026-12-14 关闭，功能已并入 Claude）（2026-10-23）。
- 动效分 `calm` / `expressive` 两档（2026-10-23）。
- 不使用 Rive；暂不做视频；输出以静态图与 GIF 为主（2026-10-23）。
- 「路径与节点」不作为图形语言系统；只把 Logo A 的动作（虚线延伸、到达、圆圈变红）当作 `calm` 招牌动作（2026-10-23）。
- 站主两年内没有可用的手绘素材，图形语言以几何与代码生成为主（2026-10-23）。
- 采用方式是单向复制已发版本，不用本机链接；每次同步需站主授权（2026-10-23）。
- ~~Pomelo 逐步向网站统一~~（2026-10-31 被下一条取代）。字体按媒介区分仍成立：网站用可分发字体，Pomelo 原生用手札体（2026-10-23）。
- **Vermilion 只用于个人网站；Pomelo 在 VL2 另建自己的方案与 Design System**，不取用 Vermilion（2026-10-31，站主决定）。站主以同一身份对外用的 PPT 与动图仍归 Vermilion（Agent 的理解，站主可改）。
  - 例外只有一处：网站内容里用的内容图标（Phase 8）。Pomelo「呦呦漫游」编辑器复制图标清单，只用来给网站内容插入图标名；Pomelo 自己的界面不用这套图标（2026-10-31，站主确认）。
- 迁入范围只含网站「自定义的视觉资产」：Logo 系列、favicon、app-icon、apple-touch-icon、OG 图、状态插图，以及页面里内联的自定义图形。不含站主的私人页面、Lucide 等第三方图标、GitHub 与 LinkedIn 品牌标识、字体文件、内容图片（2026-10-23）。
- 暂不 `git init`（2026-10-23）。第一次同步（Phase 5）之前，由站主 `git init`、提交并打 tag，之后按 tag 发版（2026-10-31，站主决定）。
- Skill 与工具放在本仓库内，所有 Agent 共用（2026-10-23）。
- GIF 用 gifenc 合成，不依赖 ffmpeg；浏览器用 playwright-core（Agent 提议，站主可改）。
- `dist/` 不进 Git；发版以 Git tag 为准，同步时按 tag 在 Mac 上构建（Agent 提议，站主可改）。
- 图形语言方向：笔势（E）为主、剪纸（D）为辅，融合为「笔势与纸片」；一笔、流线、涟漪淘汰（2026-10-26）。
- 朱红只在交互「抵达」那一刻出现，静态图形不用朱红（2026-10-26）。
- 笔势粗细取中档；图标光洁、大图飞白（大图后改为提按，见下）；≥ 48px 用三笔、≤ 32px 用简笔（2026-10-26）。
- 所有图形都带纸片，包括分类图形（2026-10-26，站主在 Round 3 改定；当时也包括 Pomelo 模块图标，已随 Pomelo 移出）。
- 纸片借用 `surface` / `surface-cool` / `line` 作填充面（2026-10-26，站主批准）。
- 大图墨感用「提按」：不加纹理，靠粗细起伏表现笔意。三缕飞白（站主：「大图的飞白效果很牵强」）与鬃丝飞白都不用（2026-10-30，站主在 Round 4 改定；Round 3 Fix 时曾选鬃丝飞白）。
- 批准 `DESIGN.md` §4「笔势与纸片」整体与 §5 登记的三个 `expressive` 表面（2026-10-30）。
- 图形语言资产不写死颜色：笔势与纸片用角色变量（`--va-ink` 等，`marks/graphic/graphic.css`），构建时另出上好色的明暗 SVG 与 PNG；SVG 由 `tooling/graphic/` 生成，不手改（2026-10-30，Agent 提议，站主可改）。
- Phase 4 只做网站与通用的图形（分类图形、分区装饰、分享图底图、空状态、PPT 底图、加载圆相）（2026-10-30）；Pomelo 的 App 图标、菜单栏与模块图标 2026-10-31 随 Pomelo 移到 VL2。
- 动效档位由 Agent 定：分类图形悬停 `expressive` ≤ 700ms；分区装饰入场一次 ≤ 1200ms；加载圆相 1800ms 循环（2026-10-26，站主授权）。
- Phase 4 验收通过：图形语言 19 个资产与三个动效零件改为 `approved`（2026-10-31，站主）。
- 第一次发版叫 `vermilion-v1.0.0`，`scheme.json` 从 `0.0.0` 升到 `1.0.0`（2026-10-31，站主选定）。tag 名必须是 `<方案>-v<version>`，同步工具会核对。
- 网站的同步目录是 `src/vendor/vermilion/`：全部放在 `src` 里由构建打包，默认分享图走带哈希的网址，不碰 Pomelo 读写的 `public/`、`src/content/`、`src/data/`（2026-10-31，站主）。
- 字标转曲线 `wordmark.svg`、`logo-lockup-paths.svg` 与默认分享图 v3 批准（2026-10-31，站主看过网站接入示意后批准）。页头里标志 `accent-strong`、名字 `text`；默认分享图带副题「呦呦漫游 · Wander」（Agent 提议，站主批准）。
- 转曲线的排字用 fontkit 读 `@fontsource/noto-serif-sc`（与网站同版本 5.2.9），带 GPOS 字偶距，与浏览器排的位置一致（Agent 提议，站主可改）。
- 网站接入的细节（Agent 提议，站主可改）：搜索 250ms 后仍在等才显示加载圆相；卡片窄的区间分类图形移到标题上方；同一次访问的判断用 `sessionStorage`（同一个标签页）。
- 网站页头只放 Logo A 标志，不放名字；网站不放分区装饰，页头留白（2026-11-01，站主验收 Phase 5 时改定）。取代问卷里「页头换字标」「分区装饰放三页」两条。
- Phase 9 按计划做：每篇文章各一张分享图，网站构建时按标题自动生成（2026-11-01，站主确认）。
- 四个 `calm` 零件批准（2026-11-01，站主）；第二次发版 `vermilion-v1.1.0`。
- 「每次打开网站只播一次」改用共用标记 `motion/visit-once.js`（同一页引入两次也只判定一次）；话题下划线左右各缩进 6px 贴着文字；对照检查改为由零件 `motion.json` 的 `parity` 声明（Agent 提议，站主可改）。
- Phase 6 验收通过（2026-11-01，站主下达 Phase 7 开工指令时确认）。
- 404 插图用「折页」（2026-11-01，站主从「山外」「折页」两版里选）。
- 文末落款三版都用：抵达、远山、三点，每次打开文章随机显示一版（2026-11-01，站主）。
- 落款第一次滚进视口时写一次（2026-11-01，站主选）。
- 描边绘制 320ms 太快，改为 640ms（2026-11-01，站主在 320 / 480 / 640 / 800 / 1000ms 里选定）。新版本 `stroke-draw-v2`，登记为 calm 时长例外（`tokens/motion.json` 的 `calmExceptions`），站主选定即批准。
- 404 插图、三版落款与 `stroke-draw-v2`、`not-found-intro`、`end-mark` 三个零件批准，第三次发版 `vermilion-v1.2.0`（2026-11-02，站主）。tag 第一次误打在主工作区只含 Phase 6 遗留文档的提交上（版本仍是 1.1.0），站主删掉重打在合并后的 `234c251`。
- Phase 7 验收通过（2026-11-02，站主下达 Phase 8 开工指令时确认）。
- 内容图标清单 24 个：拟的 20 个加备选 4 个（code 代码、trip 出行、flag 目标、pen 写作）（2026-11-02，站主）。
- 内容图标的写法是 `:名字:`，不用 `:icon[tip]`；网站自己写 remark 插件，不加依赖（2026-11-02，站主）。
- 职业页的 ❗ 由 Agent 换成 `:tip:`（2026-11-02，站主）。
- 内容图标的画法是「简笔加纸片」，笔势用结构色（2026-11-02，站主）。计划里「颜色跟文字走的 SVG」因此不再适用：笔势按 §4 用 `accent`，只有在链接与按钮里悬停时跟着文字变色。
- 内容图标与清单批准，第四次发版 `vermilion-v1.3.0`（2026-11-02，站主）。
- Phase 8 验收通过（2026-11-02，站主下达 Phase 9 开工指令时确认）。
- 文章分享图用「低山」（2026-11-02，站主从「同图」「低山」「落笔」三版里选）。
- 所有文章都用标题分享图，有封面的文章也一样，不再用封面（2026-11-02，站主）。其他页面仍用默认分享图。
- 「低山」的底图与模板批准，第五次发版 `vermilion-v1.4.0`（2026-11-02，站主）。
- Phase 9 验收通过（2026-11-02，站主确认看过微信、LinkedIn 的转发预览，没有问题）。
- 作品水印用「字标」（2026-11-02，站主从「字标」「标志」「署名」三版里选）。
- 作品水印在网站构建时自动加，原图留在资源库不动；不做 Pomelo 压缩那一步（2026-11-02，站主）。
- 水印加在作品页 `gallery` 的图与关于我页的「画作与摄影」，已上线的也包括（2026-11-02，站主）。
- 站主用自己的作品试跑后批准水印模板，第六次发版 `vermilion-v1.5.0`（2026-11-02，站主）。
- 作品水印的细节（Agent 提议，站主可改）：
  - 高度为短边的 3.4%，离边缘 2.8%，不透明度 82%，下面垫一层淡的反色柔光；
  - 默认右下角，右下角的杂乱度超过左下角 1.5 倍时换到左下角；
  - 短边小于 480px 的图、GIF、SVG、AVIF 不加；
  - 不保留 EXIF，保留色彩配置；JPEG 与 WebP 从质量 90 往下试，取第一个不超过 1.5 MB 的；
  - 单张图处理失败时原样发布并在构建日志里提示，不让一张图拦住整次发布；全部没加才算检查失败。
- 文章分享图的细节（Agent 提议，站主可改）：
  - 只出浅色；标题字重 600，比网站大标题的 400 重，因为转发预览里图会缩小；
  - 字号四档 88 / 74 / 62 / 52px，各档最多 1 / 2 / 3 / 3 行，最小一档放不下就停在省略号上；
  - 用 fontkit 转曲线、resvg 的 wasm 版出 PNG，不用浏览器，Vercel 上也能跑；换行只按自己的规则，不用 `Intl.Segmenter`（结果随 ICU 版本变）；
  - 文件名带标题的短哈希，改了标题就换地址，转发平台才不会一直显示旧图；
  - 字体里没有的字（如 Emoji）不画；某个标题生成失败时只留底图与字标，并在构建日志里警告，不让一篇文章拦住整次发布；
  - 英文占位页用 `englishTitle`，没有就用中文标题。
- 内容图标的细节（Agent 提议，站主可改）：
  - 显示 1.2em；
  - 职业页的按钮、技能、经历条目与文章摘要能显示图标；
  - 卡片摘要、`meta description` 与搜索文字里去掉写法；
  - 页面导语与标题里不支持。
- 网站接入的细节（Agent 提议，站主可改）：
  - 落款 40px，居中，与正文之间 32px；
  - 打开页面时已在屏幕里的落款直接静态显示，不先藏再写；
  - 英文占位页（只链向中文原文）不放落款；
  - 没有脚本时显示第一版；
  - 404 插图每次打开 404 页都写，不按「每次打开网站只播一次」。

### 网站优化问卷第一轮（2026-10-31，站主作答；答案与解读见 `docs/website-survey.md`）

- 范围：中度优化。骨架和颜色、字体、留白的基线都不变；中英文页一样改。
  - 「统一页头」指站内搜索页改用其他主页面的同一套页头，并加分区装饰位。
  - 「统一卡片墙」只换无封面卡片的图标，卡片底色不统一，因为站主不认为墙面不齐。
  - 这两点是 Agent 的解读，站主可改。
- 优先照顾朋友与读者：取舍时偏向有个性、有记忆点；招聘方需要的清楚与可信仍是底线。
- 图形语言浓度适中：
  - 分类图形、404 与空状态都用上；
  - 分区装饰只放首页、当下、站内搜索，职业、关于我不放；
  - 文章正文旁边不放图形。
- 无封面卡片保持透明，通用图标换成分类图形。网站只用写作、项目、画廊、创作四类，游记、其他留作备用。封面维持 16:10。
- 要做的资产：
  - Phase 4 已做好的五项全部换上：分类图形、分区装饰、矢量空状态、矢量默认分享图、搜索时的加载圆相；
  - 新做 404 插图、文末落款、每篇文章的分享图、作品水印；
  - 内容图标集（问卷补充，见上面的例外）。
- 不做：无封面文章的生成式题图、简历 PDF 模板、页脚纸山装饰、话题图标、换 favicon 与主屏图标。
- 动效：
  - `calm` 加三个已批准的 `expressive`，不再登记新的 `expressive` 表面；
  - 小零件做选中指示滑移、描边绘制、数字计数，不做逐行显现；
  - 分区装饰入场每次打开网站只写一次，站内跳转直接显示终态。
- 细节：
  - 页头左上角换成字标（问卷里「页头只有小标志」一条选了不在意，按换字标那一题的明确选择做）；
  - 页脚维持现状；
  - 修掉左上角灰影；
  - 职业页的 ❗ 等内容图标集做好后换成「提示」图标（取代问卷里「改成普通文字」的答案）。
- 节奏：
  - 新资产先在本仓库的目录页或 Claude 画布里看；
  - 分批同步，先换已做好的，再做新资产；
  - 站主愿意授权改网站的样式与组件，具体文件届时逐项确认。

## 授权记录

- 2026-10-23：允许修改网站仓库的 `DESIGN.md`（仅此一个文件），用于引入动效档位。已完成：§4 新增「动效档位」，§5 新增共享资产说明。**未提交**。
- 2026-10-23：要求把网站自定义视觉资产「移动」到 `schemes/vermilion/`。因为只有 `DESIGN.md` 获准修改，实际是**复制**，网站里的原件保留、没有删除；原件何时换成复制来的版本，放到 Phase 7，并需要另行授权。（2026-10-31 计划重排后，这件事在 Phase 5 起的各 Phase 同步时逐项授权。）
- 2026-10-23：允许再改网站的 `DESIGN.md`（仅此一个文件）：§5 登记漫游路径小图标；提到 visual-assets 的两句改成「复制来的已发版本，网站内不手改」。已完成，**未提交**。
- 消费方的其他文件（包括网站的 `ROADMAP.md`、`CHANGELOG.md`）未获授权，保持只读。Pomelo 没有任何改动。
- 2026-10-26：站主允许编辑本仓库，写入图形语言规则。改了 `schemes/vermilion/DESIGN.md`（§4 新增「笔势与纸片」、§5 登记 `expressive` 表面、§7）、新增 `schemes/vermilion/tokens/graphic.json`、`tokens/motion.json` 加 `registeredSurfaces`、`tokens/README.md`、本文件、`docs/exploration-brief.md`。改动前的副本在 `scratch/backup-2026-10-26-r3/`。
- 2026-10-26（Round 3 Fix）：按站主选择改了 `schemes/vermilion/DESIGN.md`（§4 墨感一条、§7 去掉已批准的纸片取色）、`tokens/graphic.json` 的 `stroke.ink.dry`、本文件、`docs/exploration-brief.md`；生成器更新到 `scratch/graphic-language-r3/`。改动前的副本在 `scratch/backup-2026-10-26-r3fix/`。
- 2026-10-30（Round 4）：站主批准规则并下达 Phase 4 开工指令（含更新 Design System）。改了 `schemes/vermilion/`（`DESIGN.md`、`tokens/graphic.json`、`tokens/motion.json`、`tokens/README.md`、`marks/`、`motion/`、`design-system/`）、`tooling/`（新增 `graphic/`；`render/`、`qa/`、`catalog/`、`design-system/build.mjs`、`lib/` 小改）、`package.json`（新增 `build:graphic`）、`README.md`、`docs/architecture.md`、`docs/exploration-brief.md`、本文件、`CHANGELOG.md`；发布了 Design System。改动前的副本在 `scratch/backup-2026-10-30-p4/`。消费方仓库没有改动。
- 2026-10-26：站主授予 Pomelo 仓库只读访问，用于读取模块名与菜单栏图标做迁移测试；未写入任何文件。
- 2026-10-31：站主下达「完成 Phase 4」与「Vermilion 只用于网站、Pomelo 移到 VL2」，并要求做网站优化问卷。改了 `schemes/vermilion/`（`DESIGN.md` §1、§4、§5、§7；`scheme.json`；`tokens/targets.json` 去掉 Pomelo 方言；`tokens/contrast.json`、`tokens/motion.json`、`tokens/graphic.json` 去掉 Pomelo 条目，几何与参数未动；`type/fonts.json`；`design-system/components/LoadingEnso/README.md`、`design-system/published.json`）、`tooling/`（`tokens/build.mjs`、`lib/common.mjs`、`catalog/build.mjs`：Pomelo 方言改为方案声明了才生成；`README.md`）、`README.md`、`docs/`（`adoption.md`、`architecture.md`、`licensing.md`、`exploration-brief.md`）、本文件、`CHANGELOG.md`；Design System 发布到第 10 版（只改 LoadingEnso 说明与 index 的 `lastChange`）；新建私有问卷页。改动前的副本在 `scratch/backup-2026-10-31-split/`。网站仓库只读（用 Playwright 截了线上各页），Pomelo 没有读也没有改。
- 2026-10-31（VL1 Dev Plan）：站主要求读问卷、更新项目文档、重排 Phase 5 起的计划，只做这两件事。改了本文件、`CHANGELOG.md`、`README.md`、`tooling/README.md`（同步工具改为 Phase 5 实现）、`schemes/vermilion/DESIGN.md`（§1、§4、§5、§6、§7）、`docs/adoption.md`，新增 `docs/website-survey.md`；没有改 token、资产、零件与工具。改动前的副本在 `scratch/backup-2026-10-31-plan/`。为了排计划，只读了网站的页头、卡片墙、内容结构与待办，以及 Pomelo 的 `README.md`（确认「呦呦漫游」模块负责编辑网站内容）；两边都没有写入，也没有读 `/love-shuyu/` 与 Pomelo 的数据目录。
- 2026-10-31（VL1 Phase 5）：站主下达 Phase 5 开工指令，验收 Phase 4，批准字标与默认分享图，授权改网站的下列文件（含删除两张旧图）。
  - 本仓库：`schemes/vermilion/`（`scheme.json` 升到 1.0.0；`marks/manifest.json` 状态与新资产、`supersededBy`；新增 `marks/derived.json`、`marks/wordmark.svg`、`marks/logo-lockup-paths.svg`、`marks/illustrations/og/default-v3.svg`、`sync.json`；`motion/` 三个零件改 `approved`，`section-deco-intro` 新增 `once.js` 并改 CSS 与说明；`tokens/motion.json` 触发说明；`type/fonts.json` 备注；`DESIGN.md` §4、§5、§6；`design-system/` 的 README、7 个组件、`bundle.css`、`system.json`、`published.json`）、`tooling/`（新增 `marks/derive.mjs`、`sync/sync.mjs`；`graphic/build.mjs`、`graphic/svg.mjs`、`render/motion.mjs`、`qa/check.mjs`、`qa/motion-parity.mjs`、`lib/motion-harness.mjs`、`README.md`）、`package.json`（新增 `fontkit`、`@fontsource/noto-serif-sc`，脚本 `build:derived`、`sync`）、`docs/adoption.md`、`.claude/launch.json`（网站本地预览）、本文件、`CHANGELOG.md`。Design System 上传 5 个资产、发布第 11 版。改动前的副本在 `scratch/backup-2026-10-31-p5/`。
  - 网站（`~/Documents/GitHub/personal-website`，**未提交**）：新增 `src/vendor/vermilion/`（同步，17 个文件）；改 `src/components/` 的 `PageShell.astro`、`SiteHeader.astro`、`WanderWall.astro`、`SearchPanel.astro`，`src/pages/` 的 `index`、`now`、`search` 与 `en/` 下同名三页，`src/layouts/BaseLayout.astro`，`src/styles/global.css`，`public/scripts/site-search.js`，`scripts/qa-build.mjs`，`DESIGN.md`（只在末尾加第 10 节）；删除 `public/images/og/default.png`、`public/images/status/wander-empty-cloud-pages-oops.png`。站主没提交的职业页内容、简历文件没有动。Pomelo 没有读也没有改。
- 2026-11-01（VL1 Phase 5 调整与 Phase 6）：站主授予网站仓库的编辑权限，`/love-shuyu/` 页面除外，其他部分视情况编辑；批准四个 `calm` 零件；下达 Phase 6 开工指令。
  - 本仓库：`schemes/vermilion/`（`scheme.json` 升到 1.1.0；新增 `motion/link-underline/`、`motion/selection-slide/`、`motion/count-up/`、`motion/stroke-draw/`、`motion/visit-once.js`；`motion/logo-route/motion.json` 加 `parity`；`motion/README.md`；`sync.json`；`DESIGN.md` §4、§5、§6；`design-system/` 的 README、`bundle.css`、6 个组件、`published.json`）、`tooling/`（`graphic/build.mjs` 生成描边绘制的片段；`qa/motion-parity.mjs` 改为按 `parity` 比较；`lib/motion-harness.mjs`、`render/motion.mjs`、`catalog/build.mjs` 支持 `playTarget`；`sync/sync.mjs` 认得零件共用的文件；`README.md`）、`docs/website-survey.md`、本文件、`CHANGELOG.md`。Design System 发布第 12 版。改动前的副本在 `scratch/backup-2026-11-01-p6/`。
  - 网站（**未提交**）：`src/vendor/vermilion/` 按 `vermilion-v1.1.0` 重新同步（删 4 个、加 4 个）；`src/components/SiteHeader.astro` 恢复原样；`PageShell.astro` 去掉分区装饰、徽标改成计数写法；`WanderWall.astro` 话题栏加选中指示；`src/scripts/wander-wall.ts` 接 `moveSlideIndicator`；`src/layouts/BaseLayout.astro` 去掉分区装饰的样式与脚本、加滑移与计数的样式和 `visit-once.js`；`src/styles/global.css` 去掉字标与分区装饰的规则；`src/pages/` 六页去掉 `deco`；`DESIGN.md` 第 10 节重写。
  - 失误与处理：开工备份时曾把整个网站目录（含 `/love-shuyu/` 的页面与素材）复制进本仓库的 `scratch/`，发现后立即删除，改为只备份要改的网站文件；网站的 `DESIGN.md`（含 `/love-shuyu/` 的视觉说明）与 `scripts/qa-build.mjs` 也没有留副本。没有读取或使用这些内容。
- 2026-11-01 至 11-02（VL1 Phase 7）：站主下达 Phase 7 开工指令（「Phase 6 验收通过，直接开始完成 Phase 7 的开发」），选定小样与速度，批准新资产与零件。网站的编辑沿用 2026-11-01 的授权（`/love-shuyu/` 除外）。
  - 本仓库：`schemes/vermilion/`（`scheme.json` 升到 1.2.0；新增 `marks/graphic/not-found.svg`、`end-mark-arrive.svg`、`end-mark-hills.svg`、`end-mark-dots.svg`；`marks/manifest.json` 新资产与 `status-404` 的 `supersededBy`；新增 `motion/stroke-draw-v2/`、`motion/not-found-intro/`、`motion/end-mark/`；`motion/stroke-draw/motion.json` 加 `supersededBy`；`motion/README.md`；`tokens/motion.json` 加 `calmExceptions`；`sync.json` 加 6 个文件；`DESIGN.md` §4、§5、§7；`design-system/` 的 README、`bundle.css`、StatusState、Prose、两份资产说明、`system.json`、`published.json`）、`tooling/`（`graphic/shapes.mjs`、`graphic/build.mjs`、`qa/check.mjs`、`lib/motion-harness.mjs`、`render/motion.mjs`、`catalog/build.mjs`、`README.md`）、本文件、`CHANGELOG.md`。开工时把主工作区里 Phase 6 没提交的文档改动（17 个文件）原样带进 worktree。Design System 上传 8 个资产、发布第 13 版。改动前的副本在 `scratch/backup-2026-11-01-p7/`。
  - 网站（**未提交**）：`src/pages/404.astro` 换成内联的 404 插图片段；`src/pages/wander/[slug].astro` 与 `src/pages/en/wander/[slug].astro` 在正文后加落款与脚本；新增 `src/scripts/end-mark.ts`；`src/layouts/BaseLayout.astro` 引入三个零件的样式；`src/styles/global.css` 删掉旧 404 位图的 `img` 规则、加 `.wander-article-end`。打 tag 前把 6 个零件文件临时放进 `src/vendor/vermilion/` 预览，同步前删掉，再按 `vermilion-v1.2.0` 正式同步（新增 6 个）。同步后：删除 `public/images/status/wander-error-cloud-pages-404.png`（`public/images/` 随之清空）；`scripts/qa-build.mjs` 改查内联的 404 插图与每篇文章的落款；`DESIGN.md` 第 10 节写入 404、落款与描边绘制；`README.md` 的目录表加 `src/vendor/vermilion/`、改 `public/` 与 `src/scripts/` 两行。备份只取了要改的 5 个文件（不含 `/love-shuyu/` 相关内容）。站主没提交的职业页内容与简历文件没有动。Pomelo 没有读也没有改。
- 2026-11-02（VL1 Phase 8）：站主验收 Phase 7，下达 Phase 8 开工指令，定清单、写法与画法，批准内容图标；职业页内容文件的那一行由 Agent 改（站主选定）。网站的编辑沿用 2026-11-01 的授权（`/love-shuyu/` 除外）。
  - 本仓库：`schemes/vermilion/`（`scheme.json` 升到 1.3.0；新增 `marks/graphic/icon-*.svg` 24 个、`marks/icons.json`、`marks/icons.md`；`marks/manifest.json`；`tokens/contrast.json` 加两对；`sync.json` 加 `icons/icons.json`；`DESIGN.md` §4、§6、§7；`design-system/` 的 README、`bundle.css`、新组件 ContentIcon、Icons 资产说明、`system.json`、`published.json`）、`tooling/`（新增 `graphic/icons.mjs`；`graphic/shapes.mjs`、`graphic/build.mjs`、`graphic/svg.mjs`、`catalog/build.mjs`、`README.md`）、`.claude/launch.json`（加 `website-preview`，用 `astro preview` 看构建后的网站）、本文件、`CHANGELOG.md`。Design System 上传 48 个资产、发布第 14 版。改动前的网站文件副本在 `scratch/backup-2026-11-02-p8/`（不含职业页内容文件：其中有联系方式，只改一行，不留副本）。
  - 网站（**未提交**）：新增 `src/lib/content-icons.mjs`、`src/lib/remark-content-icons.mjs`；改 `astro.config.mjs`、`src/components/CareerCv.astro`、`src/lib/wander.ts`、`src/layouts/BaseLayout.astro`、`src/styles/global.css`、`src/pages/wander/[slug].astro`、`src/pages/en/wander/[slug].astro`、`src/content/career/zh.md`（只改按钮 `label` 一行）。打 tag 前把 `icons.json` 临时放进 `src/vendor/vermilion/icons/` 验证，正式同步前删掉。站主自己开着的 `astro dev`（4328 端口）没有动。Pomelo 没有读也没有改。
- 2026-11-02（VL1 Phase 9）：站主验收 Phase 8，下达 Phase 9 开工指令，选定版式与封面文章的处理，按清单授权改网站文件（Agent 列出文件后，站主选「授权，按清单改」），批准「低山」的底图与模板。
  - 本仓库：`schemes/vermilion/`（`scheme.json` 升到 1.4.0；新增 `marks/graphic/og-card-graphic.svg`、`marks/og-card/template.json`；`marks/derived.json`、`marks/manifest.json`、`marks/README.md`；`sync.json` 加 3 个文件；`type/fonts.json` 备注；`DESIGN.md` §4、§7；`design-system/` 的 README、Illustrations 资产说明、`system.json`、`published.json`）、`tooling/`（新增 `og-card/card.mjs`、`og-card/outline.mjs`；`marks/derive.mjs`、`graphic/shapes.mjs`、`graphic/build.mjs`、`render/marks.mjs`、`qa/check.mjs`、`catalog/build.mjs`、`sync/sync.mjs`、`README.md`）、`package.json`（新增 `@resvg/resvg-wasm`、`@fontsource/source-serif-4`）、`docs/adoption.md`、本文件、`CHANGELOG.md`。Design System 上传 4 个资产、发布第 15 版。
  - 网站（**未提交**）：`package.json`、`package-lock.json`（新增 `fontkit`、`@resvg/resvg-wasm`）；新增 `src/lib/og-card.ts`、`src/pages/og/[locale]/[card].png.ts`；改 `src/pages/wander/[slug].astro`、`src/pages/en/wander/[slug].astro`、`src/layouts/BaseLayout.astro`、`scripts/qa-build.mjs`、`DESIGN.md` 第 10 节、`README.md` 目录表。打 tag 前把生成模块 3 个文件临时放进 `src/vendor/vermilion/og-card/` 验证，同步前删掉，再按 `vermilion-v1.4.0` 正式同步（新增这 3 个，共 27 个）。`/love-shuyu/` 没有动。Pomelo 没有读也没有改。
- 2026-11-02（VL1 Phase 10）：站主下达 Phase 10 开工指令，选定样式、运行位置与范围，确认 Phase 9 的转发预览，按清单授权改网站文件（站主选「授权，按清单改」），试跑后批准水印模板。
  - 本仓库：`schemes/vermilion/`（`scheme.json` 升到 1.5.0；新增 `marks/watermark/template.json`；`marks/derived.json`、`marks/manifest.json`、`marks/README.md`；`sync.json` 加 2 个文件；`DESIGN.md` §4、§7；`design-system/` 的 README、`published.json`）、`tooling/`（新增 `watermark/watermark.mjs`、`watermark/fake-images.mjs`、`qa/watermark.mjs`；`marks/derive.mjs`、`render/marks.mjs`、`catalog/build.mjs`、`README.md`）、`package.json`（新增 `sharp`，脚本 `qa:watermark`，`all` 加这一步）、`docs/adoption.md`、本文件、`CHANGELOG.md`。Design System 发布第 16 版。
  - 网站（**未提交**）：`package.json`、`package-lock.json`（`sharp` 写成直接依赖，脚本 `watermark`、`watermark:dist`，`build` 加这一步）；新增 `scripts/watermark.mjs`、`scripts/lib/artwork-refs.mjs`；改 `scripts/qa-build.mjs`、`DESIGN.md` 第 10 节、`README.md` 目录表、`ROADMAP.md`（勾掉水印那一行）。打 tag 前把生成模块 2 个文件临时放进 `src/vendor/vermilion/watermark/` 验证，同步前删掉，再按 `vermilion-v1.5.0` 正式同步（新增这 2 个，共 29 个）。`public/` 里的图没有改，`/love-shuyu/` 没有动。Pomelo 只读：看了 `README.md` 与 `src-tauri/src/site/images.rs`，并在代码里搜索了图片压缩的写法（确认压缩那一步怎么做），没有改，也没有读它的数据目录。
  - 看效果时读过网站构建出的作品图并截了画廊页，截图只放在会话的临时目录，没有进本仓库。

## 待确认

- 站主：提交并推送网站，上线后看一眼线上的画廊（Phase 10 的收尾）。
- 站主：在 Claude 里浏览 Design System，验收 Phase 2（Agent 没能目视线上页面：内置浏览器没有登录 claude.ai；组件预览已在本地按同样方式渲染、明暗都看过）。
- `expressive` 初始上限（单次 ≤ 1200ms）是否合适。
- 文章题图（站主自己的封面）尚未出稿，需要时按 §4 大图规则补；生成式题图不做（2026-10-31）。
- `.claude/skills` 软链接是否被各 Agent 识别，要等放进第一个 Skill 后才能验证。
