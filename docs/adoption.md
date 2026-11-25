# 采用（同步到消费方）

## 原则

- **单向**：只能从本仓库复制到消费方，消费方不手改同步来的文件；要改，回本仓库改、再发版。
- **按版本**：只同步已发版本（Git tag），不同步工作区。
- **留痕**：同步目标目录里写 `VERSION`（方案名与版本）与校验和清单，便于核对有没有被手改。
- **逐项授权**：每个消费方的每次同步，都要站主明确授权。
- **只写约定位置**：同步位置登记在下表，且不与消费方自己的内容读写逻辑冲突；消费方在自己的规则里注明这些文件是复制来的已发版本、不手改。

## 消费方

| 消费方 | 位置 | 要注意 |
| --- | --- | --- |
| 个人网站（elenskye-website） | `~/Documents/GitHub/personal-website` 的 `src/vendor/vermilion/`（清单见 `schemes/vermilion/sync.json`） | 由 Vercel 构建，所以必须复制进仓库；图片 ≤ 1.5 MB，其他 ≤ 5 MB；内容与资源由 Pomelo 读写 `src/content/`、`src/data/`、`public/`，同步目录要避开它们，新位置在改动前先问站主 |
| Pomelo | `~/Documents/GitHub/pomelo` 的 `src/vendor/pomelo/`（清单见 `schemes/pomelo/sync.json`；资产批了、站主打了 tag 就同步，由 Pomelo 的会话做） | 只取用 Pomelo 方案。唯一的例外：「呦呦漫游」编辑器的内容图标选择器用 Vermilion 的图标清单与 SVG，随 Pomelo 方案一起同步过去，Pomelo 自己的界面不用。本仓库只同步文件；接线、换外框、换 App 图标、选择器这些代码都在 Pomelo 那边改（2026-11-03，站主）。App 图标由 `tauri icon` 从一张 1024px 源图生成，再复制进 `src-tauri/icons/`；前端 token 用它的 shadcn 命名变量；演示用 `?mock` |
| Peck | `~/Documents/GitHub/personal-cli-studio/peck` 的 `src/vendor/peck/`（清单见 `schemes/peck/sync.json`；方案 tag 叫 `peck-v<版本>`） | 只取用 Peck 方案。除了样式、字体、图标，还同步 `DESIGN.md`、外框规则 `peck-rules.md` 和 Design System 的说明、组件示例：Peck 从 v0.4 起由另一个 Claude 账号在云端开发，看不到本仓库（2026-11-10，站主）。接线、换图标这些代码在 Peck 那边改；同步要用系统 Chrome（`VA_BROWSER_CHANNEL=chrome`） |
| Pith | `~/Documents/GitHub/pith` 的 `src/vendor/pith/`（清单见 `schemes/pith/sync.json`；tag `pith-v<版本>`；由 Pith 的会话做） | 只取用 `pith` 方案；WonderLab 的 `pith-wonder-*` 等 Pith 做到 WonderLab 再定位置（作品在 Pith 里由模型现做，方案要作为数据随 App 带上）。前端用 shadcn 命名的变量，和 `--color-*` 的对照在 `schemes/pith/DESIGN.md` 第 9 节（2026-11-25）；字体不同步，Lato、Newsreader 由 Pith 自己装 `@fontsource` 的包；接线、换 App 图标都在 Pith 那边改。演示用 `?mock` |

## 怎么同步

`npm run sync -- --scheme <方案> --to <消费方> --tag <方案>-v<版本>`（`tooling/sync/sync.mjs`），前后步骤见 `docs/workflow.md`「资产从做到用」。同步的文件列在方案的 `sync.json`（写了 `from` 的一项取自另一个方案：Pomelo 的 `content-icons.json` 是 Vermilion 的内容图标清单，只给「呦呦漫游」的选择器用）；目标目录整个归同步管，里面的 `VERSION`、`SHA256SUMS` 记版本与校验和。`--check` 核对消费方的副本没被手改。消费方那边怎么引用这些文件（组件、样式）属于消费方的改动，同样要逐个文件授权。

资产可以同步成品，也可以同步生成模块（`sync.json` 的 `tool`），让消费方构建时运行。Vermilion 有两个：

- **文章分享图** `og-card/`：网站每次构建按标题生成 PNG，新文章不用同步。网站自己装 `fontkit`、`@resvg/resvg-wasm` 与模板登记的字体包。
- **作品水印** `watermark/`：网站构建后把作品图换成带水印的版本，原图不动；哪些图算作品由网站决定。网站自己装 `sharp`。

## 不做什么

- 不用 `file:`、`npm link` 等依赖本机目录的方式。
- 不把 `love-shuyu` 页的素材与方案混进来。
