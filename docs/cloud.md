# 云端往返

云端只能通过 Claude 的 artifact 工具碰到，所以 `dw` 自己从不联网：Agent 把工具返回的清单存成 JSON，按 `dw` 给的单子下载或上传，再交回 `dw` 核对。所有文件都按 sha256 对。

下面的工具名是 claude-artifacts 的（`list_files`、`read_file`、`publish_files`、`upload_asset`、`list_assets`、`read_asset`）。Claude Code 自带的 Artifact 工具也能做同样的事，见「下载」。

## 登记云端地址

```bash
node bench/bin/dw.js target <画布名> <slug> --url <链接> --home
```

- 从云端拉下来的画布，本地和云端用同一套图片 id，加 `--same-ids`。
- 本地新建、要发到一块新云端画布的，不加：图片上传后会拿到新 id，记在 `cloud.json` 的对照表里。
- 新建云端画布：`create_from_type`，类型选 Design，标题用站主的说法。

## 拉回：云端 → 本地

1. `list_files` 拿到清单，存成 JSON。只要 `version` 和 `project/` 开头的条目（`path`、`size`、`sha256`），类型自带的文件（`of_type`）里留下 `artifact-type/dc-runtime.js` 这一条：`dw pull`、`verify`、`publish` 拿它对 bench 的运行时副本，云端换了会提示「云端画布类型的运行时换了」，这时照 `CLAUDE.md` 换掉 `bench/vendor/claude-design/` 的副本、更新 `runtime.json`、跑 `npm test`。
2. 看要下载什么：

   ```bash
   node bench/bin/dw.js pull <画布名> --listing <清单.json>
   ```

3. 下载列出的文件，放进一个空目录，文件名随便（按 sha256 认）。
4. 写进本地，逐个核对，前后各存一个版本：

   ```bash
   node bench/bin/dw.js pull <画布名> --listing <清单.json> --from <目录>
   ```

图片同样：`list_assets` 存成 JSON，`pull --assets <它>` 看缺哪几张，用 `read_asset` 下载（SVG 是文本），再 `pull --assets <它> --from <目录>`。

### 下载

- **Claude Code 自带的 Artifact 工具**：`read` 加 `path` 或 `paths`，文件直接存到本地，不经过对话。有它就用它，大文件也行。
- **claude-artifacts 的 `read_file`**：用类型建的画布一次只给一个文本文件，内容回到对话里，要自己原样写进文件。几十 KB 的没问题（核对会抓出抄错）；几百 KB 以上的画板别这样做。
- **都不行时**：请站主在画布上 Share › Export 导出单文件 HTML，`dw import <文件> --name <新画布名>` 转成一块新画布对照。导出包里没有画布的排布、页和便签。

### 读不回的情况

另一个组织的账号写过的画布，`list_files` 和 `read_file` 都不给（2026-11-05 遇到过，旧画布因此丢了源）。要拉回的画布，别让别的账号往里写。

## 发回：本地 → 云端

1. 先 `list_files` 存成清单（新画布可以不要清单，全发）。Design 类型要求发 `canvas.json` 之前读回云端那份：站主可能在画布上挪过东西，云端改过就先拉回。
2. 看要发什么：

   ```bash
   node bench/bin/dw.js publish <画布名> --listing <清单.json>
   ```

3. 要上传图片时，它会列出来：`upload_asset`，`name` 照写，每次最多 10 张；把返回结果原样存成 JSON，交给 `--blob-map`，按 sha256 对上本地图片：

   ```bash
   node bench/bin/dw.js publish <画布名> --blob-map <上传结果.json> --listing <清单.json>
   ```

   图片 id 要换的画板，会先写一份副本到 `.stage/<slug>/` 再发，源文件不动。
4. `publish_files`：`mode` 用 `patch`，`base_version` 用清单的 `version`，`files` 照 `dw` 给的抄。`canvas.json` 排在最后，画布不会指向还没上去的画板。
5. 再 `list_files` 存一份，核对并存版本：

   ```bash
   node bench/bin/dw.js publish <画布名> --record --listing <新清单.json>
   ```

页面（`cloud.json` 的 kind 是 page）：`publish_files` 把 entry 发成 `index.html`，`cloud.json` 里记了要声明的能力，用 `declare_capabilities` 声明。页面的云端清单没有校验和，只能发，不能按文件拉回。

## 页面存的数据

问卷这类页面用 `claude.use('db')` 存数据。云端存在页面自己的存储里，本地存在 `canvases/<名字>/db.json`，写法一样，所以同一个页面两边都能跑。

- **站主在云端填完，读回本地**：`db_list`（集合，如 `survey`）或 `db_get`（文档，如 `survey/answers`），把 `data` 原样存成一个 JSON 文件，再写进来，最后用 `dw db` 读一遍核对：

  ```bash
  node bench/bin/dw.js db <名字> set survey/answers <文件.json>
  ```

- **本地填的，发到云端**：页面先发上去并声明 `db`，再用 `db_write` 把 `db.json` 里的文档逐个写上去。
- 只有建这个页面的账号能读写它的云端存储（见下面「账号」）。

## 账号

云端的画布、页面和 Design System 只有建它的 Claude 账号能拉回、发回：别的账号拿到链接只能看，`list_files`、`read_file`、`publish_files`、`list_assets` 都不给。所以本地是真身（站主 2026-11-06 定）。

站主 2026-11-07 定：现在用的 Claude Code 账号就是主力开发账号（文档里叫**现用账号**），Pomelo v1.0 发布前不换；2026-11-07 以前的云端都是另一个账号（**旧账号**，以前的文档叫「账号一」）建的，只看不动。`node bench/bin/dw.js target <画布名>` 列出每份云端和它属于哪个账号；`published.json` 的 `account` 是 Design System 的。

- **旧账号的那份**：别发，也拉不了。本地源都在（下面的表）；站主在那份云端上动过的东西，请站主在画布上 Share › Export 导出单文件 HTML 交给你（`dw import`）。
- **要上云端时，在现用账号里新建一份**：
  1. `create_from_type` 选 Design，标题照原来的。
  2. 登记，不加 `--same-ids`（图片在新账号里会拿到新 id）：

     ```bash
     node bench/bin/dw.js target <画布名> <新 slug> --url <链接> --account 现用账号 --home
     ```

  3. 照上面「发回」做：图片全部要上传（`upload_asset` 每次最多 10 张），`--blob-map` 记新 id，`publish_files`，最后 `--record`。
  4. 挂着 Design System 的画布（`canvas.json` 的 `designSystems`）：`project/ds/<名字>/` 跟着发上去，主题、样式和手画线条照样能用；记录里的链接要指向现用账号的那份（Pomelo 柚儿园：https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3 ），重新 `dw ds install` 就会写成这份。
  5. 告诉站主新链接，记进这块画布的 `README.md` 和 `canvases/README.md`。
- **home** 只是「不加 `--target` 时用哪份」。
- **内置浏览器**的 claude.ai 要单独登录，和桌面 App 用的账号可以不同；它登的是哪个账号，就只看得到哪个账号的私有画布和共享给它的。和云端截图对比前先确认。

### 旧账号的云端和本地源（2026-11-07 核对）

| 云端（旧账号） | 本地源 | 核对 |
| --- | --- | --- |
| [Pomelo Explore](https://claude.ai/artifact/CwBUdwLqGsRxZz5hKiX143) | `canvases/pomelo-explore/`（生成器在里面） | 云端版本 `1793953748-8ea3` 就是本地那时最后一次发布的；本地后来多了很多页（11-12 并进来四页，11-13 并进 Atlas、见字如面并重排），以本地为准 |
| [Vermilion Explore](https://claude.ai/artifact/HiPsn6vm1nLTknV2witmCb) | `canvases/vermilion-explore/` | 2026-11-07 时 18 个文件逐个 sha256 一致；本地 11-13 分页、改名 |
| [Vermilion 朱红](https://claude.ai/artifact/SstTrLGgvnTocopdSsfF5i)、[Pomelo 柚儿园（旧）](https://claude.ai/artifact/4GgAtgCdS5fBcX9Fp4t4NU)（Design System） | `schemes/<方案>/design-system/`，`npm run build:ds` 生成 | 每次发布后逐个回读 |

旧账号里另有三份问卷（Phase 4、仓库合并、网站优化）和两块测试画布（Workbench 往返测试、今天的待办卡片），本地源 2026-11-12 清掉了，在 Git 历史里。

现用账号里的：四个 Design System（[Pomelo 柚儿园](https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3)、[Vermilion 朱红](https://claude.ai/artifact/B89E9carxtZjjkT4adbNer)、Peck、[Pith](https://claude.ai/artifact/CPavXvD8wdYuEEXbVhYqAb)，地址在各自的 `published.json`）；画布和问卷页列在 `canvases/README.md`。旧账号的 Pith Explore（EX1–EX11）站主共享给了现用账号：内置浏览器里能看（Can view），工具照样读不了。

**站主在 Claude 里复制过来的**（2026-11-12 的「Vermilion (Copy)」「Vermilion Explore (Copy)」，已改回原名）：文件和图片 id 原样带过来，图片也存在新的那份里（Design System 页的 Assets 写着「Stored alongside the page: 115 files」）。所以不用重传图片：`published.json` 顶层换成新的这份、图片记录照抄，旧的那份挪进 `copies`；画布用 `dw target … --same-ids` 登记成 home。复制来的那份 `list_assets` 不给（工具认不出是谁建的），图显不显示只能在页面上看。
