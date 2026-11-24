# visual-atelier

个人视觉仓库。多套视觉方案，每套独立定义自己的色彩、图形、字标与动效，共用同一套构建与导出工具；画布的源和看画布的引擎也在这里。产出是 SVG、PNG、GIF 与动效零件。

| 方案 | 给谁用 | 状态 |
| --- | --- | --- |
| `schemes/vermilion/`（朱红） | 个人网站，以及站主的 PPT 与动图 | `1.5.0`，已上线；[Design System](https://claude.ai/artifact/B89E9carxtZjjkT4adbNer)（私有，现用账号） |
| `schemes/pomelo/`（柚儿园） | Pomelo | `1.0.1`（加了侧栏展开 `fold`）；[Design System](https://claude.ai/artifact/5uaouHwXAXihjxhh9g4vb3)（私有，现用账号，按 1.0.1 发了）；由 Pomelo 的会话做，计划在 Pomelo 的 `docs/roadmap.md` |
| `schemes/peck/` | Peck（站主的本地 Coding Agent） | `1.0.0`；Design System「Peck」（私有）；由 Peck 的会话做，计划在 Peck 自己的仓库 |
| `schemes/pith/` | Pith（站主的 macOS 研究工作台）的 App 界面：花园笔记 × 铅字 × 数字花园；WonderLab 作品另起 `pith-wonder-*` | `1.0.0`（站主 2026-11-24 验收）；[Design System](https://claude.ai/artifact/CPavXvD8wdYuEEXbVhYqAb)（私有，现用账号）；由 Pith 的会话做 |

2026-11-06 之前分成两个仓库：visual-assets（方案和工具）和 visual-workbench（画布和引擎）。旧文档、历史记录、消费方和云端里写着这两个名字的，说的都是这里。

## 目录

```
CLAUDE.md          核心规则（AGENTS.md 是指向它的软链接；细则在 docs/ 和各份 README）
ROADMAP.md         当前状态、接下来做什么、长期的决定和授权
CHANGELOG.md       已完成的结果
docs/              会话和第二条线、工作流和验证、架构、动效档位、采用、许可、云端往返
schemes/           视觉方案（_template 是新方案的起点）
tooling/           共用工具
canvases/          画布（每个方案一块 Explore Deck）和问卷页的源
bench/             看画布的引擎：命令行 dw、本地服务和画布界面（分五类：Design System、Motion Deck、Explore Deck、Questionnaire、Checks）、给 Agent 用的 MCP 服务
skills/            本仓库的 Skill（.claude/skills、.agents/skills 指向这里）
history/           做完的大计划和逐条记录（只是历史）
.mcp.json、.codex/、.agents/   三家 Agent（Claude Code、Codex、Antigravity）的项目级配置：MCP 服务 dw（Antigravity 的在 .agents/plugins/dw/）、Skill 的链接
package.json       命令入口（npm run ...）
dist/              构建产物，不进 Git
scratch/           临时文件，不进 Git
```

## 开始

- 想知道做到哪了、下一步做什么：读 `ROADMAP.md`。
- 想了解规则：读 `CLAUDE.md`；做视觉探索先读 `skills/design-craft/SKILL.md`。
- 想了解整体设计：读 `docs/architecture.md`。
- 看画布、拉回发回：读 `bench/README.md` 和 `docs/cloud.md`。
- 新建一套方案：`node bench/bin/dw.js scheme new <方案名> --title <显示名>`（`docs/architecture.md`「新方案怎么起」）。

## 第一次用

在仓库根目录（或 worktree 目录）里跑。依赖只装在这个目录的 `node_modules/`，Node 版本读 `.nvmrc`（22）。

```bash
nvm use && npm ci
```

完整构建一次（约一分钟；Design System 页和挂到画布上都用构建产物）。浏览器用系统的 Chrome；不想用就先 `npx playwright-core install chromium` 下载一个，去掉前面的环境变量：

```bash
VA_BROWSER_CHANNEL=chrome npm run build
```

```bash
npm test
```

联网时把画布要的 React 和字体存一份在本机，之后断网也能看：

```bash
node bench/bin/dw.js offline
```

浏览器怎么选：环境变量 `VA_CHROMIUM`（可执行文件路径）优先，其次 `VA_BROWSER_CHANNEL`（`chrome` 或 `msedge`），最后是 playwright-core 下载的 Chromium。Agent 在非交互的 shell、沙箱里跑要注意的，见 `docs/sessions.md`「新会话接手」。

## 常用命令

```
npm run all          构建、检查、生成目录页（发版前跑；结果在 bench 菜单的 Checks 里看）
npm test             bench 的测试
npm run serve        本地看画布：http://127.0.0.1:4321/
open dist/catalog/index.html   用浏览器浏览所有资产与动效
```

全部工具和参数见 `tooling/README.md`，`dw` 的全部命令见 `node bench/bin/dw.js help`。Agent 用的 MCP 服务 `dw`：三家的配置都在仓库里，工具清单和怎么看连上没有见 `bench/README.md`「MCP」。
