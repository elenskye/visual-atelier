# Peck Explore

Peck（站主的本地 Coding Agent）的视觉探索画布：https://claude.ai/artifact/2YJB1WKiiC6q7s6VmryCaR （私有，现用账号；slug `0c77c74b-af76-46cf-ad03-c0d9e7f491ee`）。整个探索在云端画布上做（站主 2026-11-09 定），一步一页、一步一验收；2026-11-10 四步做完，站主认了 Design System「Peck」（https://claude.ai/artifact/KpUihg5AHn6cw1ggNTx6s1），收尾时导入这里。和云端用同一套图片 id（`cloud.json` 的 `blobs: same`）。

简报和日志在 `project/peck-explore-brief.md`（站主的话、每轮定了什么、淘汰了什么）；外框规则在 `project/peck-rules.md`（第三版，66 条，方案里 `schemes/peck/peck-rules.md` 是同一份）。

页的名字（2026-11-14 站主自己改成 EX1–EX4、R1–R4，成了所有 Explore Deck 的样子）和留什么照 `canvases/README.md`「Explore Deck 的规矩」（站主 2026-11-13）：探索全留；外框小样四轮是优化，每项只留最新的一份。页的 id 还是原来的（`v0`、`s1r1`…），生成器靠它只写自己那一页。

| 页 | 生成器 | 画板 |
| --- | --- | --- |
| EX1：初版（11/08，整版退回） | `gen-v0.mjs`（跑不了，留作记录） | 7 张：`Main`、`Main-Light`、`Done`、`Home`、`Cards`、`Settings`、`Tokens` |
| EX2：配色、动效、图标（图形语言第一轮） | `project/src/s1/` | 6 张 `S1-*` |
| EX3：主样板、四个细节、ASK 卡片、图标（第二轮） | `project/src/s1b/` | 6 张 `S1b-*` |
| EX4：界面字体、浅色的青、像素角、图标（第三轮） | `project/src/s1c/` | 6 张 `S1c-*` |
| R1：右栏模块、ONE SHOT、规则第三版（外框小样第四轮） | `project/src/s2d/` | 5 张 `S2d-*`，`peck-rules.md` 第三版 |
| R2：外框小样（只在前两轮画过的） | 冻结（`s2/`、`s2b/`） | `S2-Flow`（流程一览）、`S2b-Anatomy`（外框解剖）、`S2b-Settings`、`S2b-Api`、`S2b-States`、`S2b-StatesFlow`（迁移测试） |
| R3：色板、对比度、控件、字和尺寸、图标、动效（方案） | `project/src/s3/` | 7 张 `S3-*`；定值源 `tokens.mjs` |
| R4：Design System | `project/src/s4/` | 4 张 `S4-*`；写方案 `project/scheme/`、构建 Design System、挂到 `project/ds/peck/` |

**2026-11-13 删掉的**（被第四轮替掉，Git 历史里有）：`S2-Proto`（第一轮的三栏小样）、`S2b-Rules`、`S2b-Report`、`S2c-*` 五张（第二三轮的规则、结果板，第三轮整轮）。`s2/`、`s2b/`、`s2c/` 的生成器一跑就停（`FROZEN_OK=1 PECK_OUT=<别的目录>` 才跑），别写回 `project/`。

## 这些文件是什么

- `project/`：画板、`canvas.json`、简报、规则、生成器 `src/`、方案 `scheme/`、挂上的 Design System `ds/peck/`。2026-11-10 从云端收来时和云端一模一样；11-13 本地改了页名、删了外框小样的 8 张旧板，以本地为准（云端停在 11-10）。生成器放在 `project/` 里是因为探索时全在云端做。
- `project/scheme/` 就是 `schemes/peck/` 的生成部分（0.1.0，approved）。`schemes/peck/` 另有不是生成的：`CLAUDE.md`、`AGENTS.md`、`sync.json`、各目录 `README.md`、`type/fonts/`。
- `blobs/`：云端附件全部六个（两个字体，第 1 步的四张位图：现在的图标原图 `b44f0f…`、A1 `75a536…`、A2 `2e8a78…`、A3 `b2b77d…`），按云端的 id 命名，sha256 和云端 `list_assets` 一致。原图、A1、A2 云端工具读不回（标着不可读），2026-11-14 站主登录了内置浏览器的 claude.ai，从云端画布下载 `S1c-Icon` 那张板的「HTML (.zip)」取出来的；以后再有读不回的图，照这个办法（画板标题条上的下载按钮 → HTML (.zip)，包里 `assets/<id>.<扩展名>` 就是原文件）。
- `gen-v0.mjs`：初版 7 张的生成器，读的是第一版方案（已经整份换掉），现在跑不了，留作记录。
- `.ds/`（不进 Git）：第 4 步生成器构建出的 Design System（`project/` 是发到云端的文件，`upload/` 是要上传的资产）。

## 生成

都在 Node 22 下（`source ~/.nvm/nvm.sh && nvm use 22`）。每一步的 `gen.mjs` 只写自己那一页的画板和 `canvas.json` 里自己那一页，页名、页的先后、打开时落在哪页都以 `canvas.json` 为准（站主在界面里能改名、删页），这一页还没有时才加上；同一份源两次生成逐字节一致（2026-11-13 `s1c`、`s2d` 重跑，板和 `peck-rules.md` 都一样，改过的页名也没被盖掉）。

- 第 1–3 步：在 `project/src/<步>/` 里 `node gen.mjs`（第 3 步要 `VA_ROOT=<仓库根目录>` 取 `apca-w3`）。要写到别处看结果加 `PECK_OUT=<目录>`（目录里先放一份 `canvas.json`）。
- 第 4 步：它先写 `project/scheme/`，再按这份方案构建 Design System，所以 `VA_ROOT` 要指向一份 tooling 的临时副本，里面的 `schemes/peck` 是指到 `project/scheme/` 的软链接（tooling 要复制，不能软链接，不然它认的还是仓库里的 `schemes/peck/`）：

  ```bash
  T=$(mktemp -d) && cp -R tooling package.json "$T"/ && ln -s "$PWD/node_modules" "$T/node_modules" && mkdir -p "$T/schemes" && ln -sfn "$PWD/canvases/peck-explore/project/scheme" "$T/schemes/peck"
  ```

  ```bash
  cd canvases/peck-explore/project/src/s4 && VA_ROOT=$T node gen.mjs
  ```

  然后把 `project/scheme/` 复制到 `schemes/peck/`（`rsync -a`，不带 `--delete`，留住不是生成的文件），再在仓库根目录 `npm run build:ds -- --scheme peck`，和 `.ds/project/` 应该一样。改了资产：`.ds/upload/` 里的传到云端 Design System（`upload_asset`），把新 id 写进 `project/scheme/design-system/published.json`，再跑一次生成器才会写出索引。
- 检查：`VA_BROWSER_CHANNEL=chrome node bench/bin/dw.js check peck-explore --board <文件>`。

## 发回

先 `list_files` 存清单。图片 2026-11-14 补齐了，`dw publish` 应该不会再因为缺图停下（还没试过）；以前的办法是用 `node bench/bin/dw.js verify peck-explore --listing <清单>` 找出和云端不一样的文件，`publish_files`（`patch`，`canvas.json` 放最后）发，再 `list_files` 存新清单，`node bench/bin/dw.js publish peck-explore --record --listing <新清单>`。Design System 的发法见上面「第 4 步」和 `schemes/peck/CLAUDE.md`。
