---
name: questionnaire
description: 在 visual-atelier 里做一份问卷页，和站主对齐一个 Phase 的需求：从 skills/questionnaire/template/survey.html 复制到 canvases/<名字>/，只改题目数据，本地 dw serve 里或发到 Claude 云端给站主填，再读回答案。用于开工前的大范围对齐；一两个小决定直接用提问功能问，不用问卷。
---

# questionnaire

## 用途

站主没有设计经验，大范围的需求用一份问卷页对齐：每题给选项、标出建议、允许写补充。所有 Agent 出问卷都照同一个模板（站主 2026-11-12 定）：`skills/questionnaire/template/survey.html`，样子用 Design System「Vermilion 朱红」（站主 2026-11-13 定）。同一个页面在本地（`dw serve`）和 Claude 云端都能跑，答案存在页面存储的 `survey/answers`，Agent 用 `dw db` 或 `db_get` 读。

规矩：每份问卷一个独立目录，不放进探索画布（站主 2026-11-03、11-05 定）；发成普通页面，不用 Design 类型（Design 画布上填的答案只留在站主的浏览器里，读不回）。已经拍板的事不再问。

## 输入

- 这份问卷要定的事、给站主的背景（只写结论，不贴过程）。问的是一轮视觉探索的简报时，题目照 `skills/design-craft/brief-template.md` 出（参照、反例、要避开的默认、真实任务、第一轮交什么都要问到）。
- 名字：小写字母、数字、连字符，比如 `v1-phase2-questionnaire`。

## 模板已经做好的

不用自己写，也别删：

- **题型**：单选、限数的多选（`max`）、矩阵（每行选一个）、文字（可不填）。
- **建议**：`rec` 标「建议」（矩阵是一个圆点）；每页有「没选的都按建议填」，核对页能一次按建议填完全卷。
- **每页的补充**：每页最后自动有「这一页想补充的」，存成 `note<页号>`。
- **最后一页核对**：自动加，按页列出全部答案，没选的标红、能「去改」；提交以后还能改。
- **存储**：`connectDb()` 每 100ms 看一次 `window.claude.use`，最多等 10 秒（云端的运行时放上 `window.claude` 比页面脚本晚，一开场就判断会落空）。源码里照字面写着 `window.claude.use(`：本地 `dw serve` 只在看到这几个字时才注入本地版存储，别改写法。改了答案 500ms 后写一次 `{ answers, summary, submitted, submittedAt, updatedAt }`；`answers` 是原始值，`summary` 是「题号 题目」→「选中的文字」，Agent 直接读 `summary`。打开时谁的 `updatedAt` 新用谁。
- **连不上存储时**：页头写「答案只存在这台设备上」，核对页的「复制答案」一直都在，站主贴回对话。
- **样子是 Vermilion 朱红的**：暖纸的底、衬线标题、页码是一条漫游路径（点线连着时间线的空心圆），青绿管结构和「建议」，朱红只在悬停、选中、焦点和「未答」时出现。颜色、间距、字体都是 Vermilion 的 tokens，写在 `/* vermilion:tokens */` 那一段，字体在 `<!-- vermilion:fonts -->` 那一段（Google Fonts 托管的同款），由 `template/vermilion.mjs` 从构建好的 Design System 写进去，别手改。用到的颜色配对都过 APCA（明暗都验过）。
- **手机宽度、明暗（跟系统，`?theme=dark` 能指定）、减弱动效**都照顾到了。

## 步骤

1. **建目录** `canvases/<名字>/`：
   - `survey.html`：`cp skills/questionnaire/template/survey.html canvases/<名字>/survey.html`。
   - `cloud.json`：`{"kind": "page", "title": "<标题>", "entry": "survey.html", "targets": {}}`
   - `README.md`：问卷链接（发了再填）、每页有哪些题、答案存在哪。
2. **写题**：只改 `<script>` 开头「改这里」那一段，下面的不动。
   - `SURVEY.title` 是顶栏的名字，`SURVEY.key` 是本机暂存用的名字，每份问卷不一样。
   - `PAGES` 每页 `{ name, title, lead, note?, items }`，一页 3–8 题。题的写法照那一段开头的注释和示例：单选 `single`、多选 `multi`（`max`）、矩阵 `rows`（`scale` 加 `rows`，行多时用 `groups` 分块）、文字 `text`。题的 `id` 全卷不能重复。
   - 能给建议的都给 `rec`，站主可以一键照建议填；纯粹核对事实的题（「看过没问题吗」）不给。
   - **选项配示意图**（站主 2026-11-15）：会改变样子、流程的选项都写 `fig`（一小段内联 SVG 或图），别只靠文字；纯文字的选项站主看不出在比什么。
   - **出问卷之前先用提问功能问**几个会改变问卷走向的决定（站主 2026-11-15），问卷里不再问；对话里已经定了的写成「已经定了」列出来，不再问。
   - 中文，字号和对比够大；不放站主的私人内容和真实数据。
   - 模板本身要改（加题型、修 bug）就改 `skills/questionnaire/template/survey.html`，已经发出去的问卷不跟着变。
   - Vermilion 的 tokens 改过（`npm run build:ds` 之后）：`node skills/questionnaire/template/vermilion.mjs` 更新模板，`… vermilion.mjs canvases/<名字>/survey.html` 更新一份问卷；加 `--check` 只看是不是最新的。
3. **检查**：

   ```bash
   node bench/bin/dw.js check <名字>
   ```

   要通过，再看 `canvases/<名字>/.shots/check/survey.png`。然后 `node bench/bin/dw.js serve`，在内置浏览器打开 `http://127.0.0.1:4321/c/<名字>/`，确认页头是「已连接 · 答案自动保存」，点几题、按一次建议填，`node bench/bin/dw.js db <名字> survey/answers` 读得到刚点的。读完把测试答案删掉：删 `canvases/<名字>/db.json`，再在页面里清掉 `localStorage` 的 `SURVEY.key`（不然站主打开时会带着测试答案）。
4. **给站主填**，二选一，问站主：
   - **本地**：站主开着 `dw serve`，给地址 `http://127.0.0.1:4321/#/<名字>`。
   - **云端**（手机上也能填）：`publish_files` 把 `survey.html` 发成 `index.html`（新页面不给 `slug`），再 `declare_capabilities` 声明 `{"db": {}, "user": {}}`；`node bench/bin/dw.js target <名字> <slug> --url <链接> --account 现用账号 --home`。
5. **读答案**：
   - 本地：`node bench/bin/dw.js db <名字> survey/answers`（或直接读 `canvases/<名字>/db.json`）。
   - 云端：`db_get` 读 `survey/answers`，把 `data` 原样存成文件，`node bench/bin/dw.js db <名字> set survey/answers <文件>` 写进本地，两边一致。
6. **结论写进文档**：要定的事写进对应仓库的 `ROADMAP.md`（「已拍板的决定」带日期和「站主」）或方案的 `DESIGN.md`，问卷 `README.md` 写一句结论在哪。问卷用完、结论都进了文档以后，问站主能不能删这个目录（答案留在 Git 历史）。

## 输出

- `canvases/<名字>/` 下的 `cloud.json`、`survey.html`、`README.md`，填完后还有 `db.json`。
- 交付时说明：问卷地址、几页几题、哪些题有建议。

## 验证

- `dw check <名字>` 通过，截图看过。
- 本地点一题，`dw db` 读得到；页面顶上是「已连接」而不是「答案只存在这台设备上」。测试答案删干净。
- 发到云端的：打开链接能填，`db_get` 读得到。
