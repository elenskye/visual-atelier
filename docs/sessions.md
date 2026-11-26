# 会话：接手、分工、第二条线

`CLAUDE.md` 的细则：新会话怎么冷启动、几个会话怎么按文件分开做、几家 Agent 各在自己分支上做一版时的 Git 规矩。

## 新会话接手（换账号、换 Agent、新 worktree）

1. 照 `README.md`「第一次用」准备：`nvm use`、`npm ci`、`VA_BROWSER_CHANNEL=chrome npm run build`（Design System 页和挂到画布上都用它的构建产物），`npm test` 要全过。
   - 系统默认的 node 不是 22。Agent 的命令先试 `nvm use`；shell 里没有 `nvm` 再 `source ~/.nvm/nvm.sh && nvm use`（Claude Code 的隔离 worktree 不让跑 `source`，那里 `nvm use` 直接能用）；都不行就 `export PATH="$(ls -d ~/.nvm/versions/node/v22.*/bin | tail -1):$PATH"`。只换 `node` 的路径不够，`npm` 跑的脚本还是用默认的 node。
   - `npm ci`、`npm test`、`dw check`、`dw serve` 要写 npm 缓存、启动 Chrome、绑本机端口：在沙箱里跑会被拦，先放行再跑；页面打不开时 `dw check` 报「打不开页面」或「报错页」，不会当作通过。在 worktree 里，`.git` 指向主工作区的 `.git/worktrees/<名字>`，在沙箱的工作区外面：`git` 也要放行。
   - Claude 的云端容器里没有 Chrome：设 `VA_CHROMIUM` 指向预装的 Chromium（`/opt/pw-browsers/chromium-*/chrome-linux64/chrome`），`dw check`、`dw frames`、`npm test` 都认它。
   - 新 worktree 里没有 `node_modules/`、`dist/`，看不到主工作区的 `scratch/` 和别的 worktree 里没提交的改动：换会话或换账号前先提交。
2. 读 `CLAUDE.md` 和 `ROADMAP.md`：站主定过什么、现行授权都写在那里，已经定的别再问。认清自己是哪个会话、能动哪些文件（`CLAUDE.md`「几个会话怎么分」）；Pomelo 的会话还要读 Pomelo 的 `CLAUDE.md` 和 `docs/roadmap.md`。
3. 只认提交过的东西。`git status` 里有你不认识的改动，多半是别的会话的：别动也别还原，先问站主。
4. 碰云端之前，照 `docs/cloud.md`「账号」看清自己是哪个账号：旧账号的云端只看不动，要上云端在现用账号里新建。
5. 记忆不跟人走：规矩都写在仓库里。Agent 自己的记忆、会话临时目录不进 Git；`.versions/`、`.shots/`、`dist/`、`scratch/`、`node_modules/`、`bench/.cache/`（断网缓存）只在这台机器上。

## 几个会话一起做（站主 2026-11-12）

同一个仓库、同一个工作区，几个会话同时做，按文件分开（谁能动哪些在 `CLAUDE.md`「几个会话怎么分」），各照各的计划：本仓库的会话照 `ROADMAP.md`，Pomelo、Peck、Pith 的会话照各自仓库的计划。各方案的发版、Design System 的发布、同步进消费方只由做这个方案的会话做。

- **Pith 的会话**（站主 2026-11-16）：开在 Pith 仓库（`~/Documents/GitHub/pith`）、把本仓库加为第二个目录，站主叫它「pith 环境」。Pith 开发、使用中发现工具、Skill、流程不顺，它也改本仓库的共用部分（`bench/`、`tooling/`、`skills/`、`docs/`），这时照本仓库的会话的规矩：动之前读最新的，改了跑对应的验证，记进 `CHANGELOG.md`。
- **Pith 用别的方案就复制**：要用 Pomelo、Vermilion、Peck 的设计，复制成新方案 `pith-wonder-<名字>`（Design System「Pith Wonder - <名字>」），原方案不动，`DESIGN.md` 第一节写从哪个方案、哪个版本复制的。App 用的 `pith` 和 WonderLab 用的 `pith-wonder-*` 不共用 token。
- **共用的几个文件**：`CHANGELOG.md`、`ROADMAP.md`「现在」里的方案那几行、`README.md` 的方案表，各写各的那一条，动之前先读最新的。`package.json`、`package-lock.json` 只归本仓库的会话，别的会话要加依赖或命令先问站主。
- **要改别人那块**：先问站主，或者告诉站主、等对方的会话做。
- **提交**：每个会话只 `git add` 自己动过的文件，提交信息照 `CLAUDE.md`「版本与 Git」。

## 第二条线：几家 Agent 各在自己的分支上做一版（站主 2026-11-15 批）

同一份说明交给几家各做一版（Phase 4 是 Codex、Argon；Phase 5 再加一个 Claude Code 会话），最后由本仓库的 Claude 会话评估、站主挑。只在这种任务里，做版的 Agent 在自己的分支上提交（别的时候照 `CLAUDE.md`「版本与 Git」）。两次的经过在 `history/v1-phase4.md`、`history/pith-phase5.md`。

- **一个 Agent 一个 worktree、一条分支**：分支 `agent/<claude|codex|argon>/<任务>`，worktree 在仓库旁边 `../visual-atelier-<claude|codex|argon>`。站主开工前在主工作区建好（主工作区不切分支），再在各家的 App 里打开那个目录开新会话：

  ```bash
  git -C ~/Documents/GitHub/visual-atelier worktree add ../visual-atelier-codex -b agent/codex/<任务> main
  ```

- **能用的 Git 命令**（都在自己的 worktree 里）：`status`、`diff`、`log`、`show`；`add` 自己改的文件；`commit`（只在自己的分支上）。别的（`push`、`merge`、`reset`、`stash`、`tag`、换分支、删分支或 worktree、改主工作区和别人的文件）都不做，由站主做或站主让 Claude 做。
- **冷启动**：照上面「新会话接手」1，只照文档；卡住的地方写进交付说明。
- **bench 的端口**：主工作区的 4321 留给站主和有板有眼；Claude 用 4351，Codex 用 4331，Argon 用 4341（`dw serve --port`，MCP 的 `serve_start`、`open` 写 `port`）。
- **独立做**：不看别人的分支，不去主工作区找。
- **交付**：最后一次提交以后，把分支名、`git log --oneline main..HEAD`、做了什么、哪些自检过、卡在哪告诉站主。
- **写说明的（Claude）**：要拿来比的那一版放在做版的 Agent 用不着读的地方；要原样搬进方案的东西，字段名写死、给一个例子。
- **验收**：Claude 只读地看分支（`git log main..<分支>`、`git diff --stat main...<分支>`），并排放进一块临时对比画布，写评估；探索阶段照 `canvases/README.md`「两档门槛」的探索档，别一上来就上定稿的门槛（Phase 5 的教训）。
