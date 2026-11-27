# 工作流

站主用自然语言指挥；每一步都有验收门，过不了就停在这一步。

```
简报 → 探索 → 选择 → 规格 → 实现 → 校验 → 确认 → 发版 → 采用
```

| 步骤 | 谁做 | 产出 | 验收门 |
| --- | --- | --- | --- |
| 简报 | 站主 | 一段白话：给谁用、要什么感觉、不要什么 | 双方复述一致 |
| 探索 | Agent | 2–4 个真正不同的低保真方向（`skills/design-craft`），放在本地画布上（站主要求时才发到云端），内容相同才公平 | 遮住颜色和字体，站主还能看出差别 |
| 选择 | 站主 | 选一版，说明想改的一点 | 记入方案的决定 |
| 规格 | Agent | 几何、颜色角色、时长与缓动、档位、减弱动效回退、使用场景 | 站主确认 |
| 实现 | Agent | 源文件（状态 `draft`） | 能构建 |
| 校验 | Agent | 对比度、体积、减弱动效、禁用项、逐帧总览图 | 全部通过；未目视项如实列出 |
| 确认 | 站主 | 在 bench 或画布上目视，说「批准」 | 状态改为 `approved` |
| 发版 | Agent | 提交、tag `<方案>-v<版本>` 与 `CHANGELOG.md` | 站主推送 |
| 采用 | 站主授权，Agent 执行 | 同步到消费方 | 消费方构建与目视通过 |

## 资产从做到用

1. 在本仓库做。要选的给 2–4 版小样，放进画布 `canvases/<画布名>/`（`design-loop` Skill），站主在 bench 或云端画布上看、批；`scratch/` 和会话临时目录不算留了一份。
2. 站主批准，资产改为 `approved`。Design System 的源跟着更新；发到云端只在站主要求时做（`CLAUDE.md`「画布与 bench」），发了的话 `published.json` 进这次提交。
3. 打 tag 前跑 `npm run all`。做这个方案的会话提交、打 tag，站主推送（`CLAUDE.md`「版本与 Git」）。给站主的命令写全路径（`git -C <路径>`），因为 worktree 和主工作区容易弄混。
4. Agent 核对 tag，都对上才继续：
   - `git rev-parse <tag>` 是预期的提交；
   - tag 里 `scheme.json` 的版本是这次的版本；
   - `git diff --quiet <tag>`，工作区与 tag 一致。
5. 同步（`docs/adoption.md`）。要改消费方的文件先列清单、站主授权（Pomelo 的会话照它的授权直接做）；打 tag 前为了预览临时放进消费方的文件，同步前删掉。
6. 消费方跑完整检查；站主在本地预览里目视，明暗、手机宽度、减弱动效都看。消费方的提交与推送由站主做。
7. 上线（或装进正式版）后站主确认结果，这一轮才算验收。更新 `ROADMAP.md`，在 `CHANGELOG.md` 写结果。

要改消费方、但要等 tag 才能同步的，先在消费方本地临时放文件预览；线上才能验证的（转发预览、云端构建）如实写成「待上线后确认」。

## 探索图形语言或新方案

画什么、怎么判断好不好，先读 `skills/design-craft/SKILL.md`；简报照 `skills/design-craft/brief-template.md`。不预设风格。探索全新方案时不挂载任何已有方案或 Design System，免得被带偏；给已有方案补图形语言时，画布挂该方案的 Design System。开工前的大范围对齐用问卷页（`questionnaire` Skill）。

**先问站主三件事：**

1. 用在哪？
2. 想多一点什么、少一点什么？（各 3 个词。）
3. 喜欢和反感的参考（图片、网站、App、海报、书籍版式都行；说不出名字就描述感觉）。

**再分三轮：**

1. **广撒网**：2–4 个真正不同的低保真方向（遮住颜色和字体还分得出），同一份「内容套件」各摆一遍，比较才公平。这一轮在 Explore Deck 的探索页（EX）做，门槛低（`canvases/README.md`「两档门槛」）。套件按用途定，例如字标、6 个图标、一张卡片、一张分享图、一个加载时刻。
2. **深挖**：选 1–2 个，一次只变一个维度（形状语言、线宽、圆角、质感、动效性格）。
3. **成文**：把胜出方向写成规则（形状词汇、线条规则、网格与比例、色彩角色、动效性格、招牌时刻），再做「迁移测试」：拿一个没见过的对象（一个模块图标、一张 PPT 封面、一个加载动画）按规则做，认得出同一家才算成系统。

**站主要求在云端探索时的交接**：云端的探索会话读不到本仓库，所以先写一份简报（前提、三个问题的答案、过程、探索日志；Pomelo 的在 `schemes/pomelo/history/exploration-brief.md`），作为附带文件放进探索画布的 `project/`，简报改了就重新放；探索会话不改这份。每轮结束，探索会话总结几行（做了什么、站主选了什么、淘汰了什么及原因、画布链接），站主带回 Claude Code，Agent 拉回画布、写进探索日志。

探索稿一律是 `draft`。胜出后 `dw scheme new` 新建方案目录（从 `_template/` 起），简报移进方案的 `history/`。哪个 Agent 在云端、哪个在本地做，见 `canvases/README.md`「看、批、写」；同一份说明交给几家各做一版、再由 Claude 评估的，照 `docs/sessions.md`「第二条线」。

## 验证

- **改了哪边跑哪边**：方案和资产在 `schemes/`、`tooling/`、`canvases/`，引擎在 `bench/`、`docs/cloud.md` 和画布用的 Skill。日常只跑和改动直接相关的最小验证；`npm run all` 只在发版前或站主要求时跑（`tooling/README.md`），它的最后几步核对 Atlas 的快照、各画布的板和生成器对得上（`check:canvases`）。
- **画板**：`node bench/bin/dw.js check <画布名>`（只看一张加 `--board <文件>`）全部通过，再看 `canvases/<画布名>/.shots/check/<画板名>.png`（画板名去掉 `.dc.html`）。它会跑画布自带的 `*/lint.mjs`；故意出框、藏起来的字给元素加 `data-nolint`。
- **动效**：`dw check` 截的是减弱动效下的终态；动效用 `node bench/bin/dw.js frames <画布名> --board <文件>` 看按时间线截的总览，方案的动效零件用逐帧总览图（`npm run build:motion`）。节奏和手感由站主目视；预览面板隐藏时 `requestAnimationFrame` 会停，没法目视的部分只做程序化验证，交付说明里列出哪些没目视。
- **导出要确定**：同一份源两次导出逐字节一样（`npm run qa:determinism`）。
- **bench**：改了代码跑 `npm test`；改了画布界面再开 `node bench/bin/dw.js serve` 在浏览器里看。和云端比用 `node bench/test/tools/compare-cloud.mjs`，Tweaks 用 `node bench/test/tools/check-tweaks.mjs`，用法写在文件开头。内置浏览器里没放在最前面的标签页不重画，截图前先切到那个标签页，或者改用无头 Chrome。
- **拉回、发回之后**：`node bench/bin/dw.js verify <画布名> --listing <清单>` 全对。

