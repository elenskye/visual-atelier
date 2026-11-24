---
name: skill-evolver
description: 在 visual-atelier 中沉淀、创建或迭代可复用 Agent 技能（skills/<skill-name>/SKILL.md）。当在设计探索、解包还原或视觉排障中发现高频重复模式并希望将其固化为团队共享技能时使用。
---

# Skill Evolver (`skill-evolver`)

本技能规定了各模型（Claude Code、Codex、Argon）如何在 `visual-atelier` 中共同维护和演进 `skills/` 目录。

## 1. 触发时机

仅在以下情况触发技能演进，**禁止为一次性、临时性的小任务随意新建 Skill**：
1. 在多次设计探索或 `dw import` / `dw export` 过程中，提炼出了具有普适性的新流程（例如特定设计系统的 Token 映射校验、复杂 SVG 手绘滤镜校准、特定动效曲线验证等）。
2. 修复了一类隐蔽的跨模型或跨运行态兼容问题（如 `<x-dc>` 组件特定绑定语法、`file://` 与 `blob:` 源策略边界），需要写入技能库防止后续模型踩坑。
3. 使用者明确指示“把这个工作流沉淀为 Skill”。

## 2. 目录与格式规范

所有共享技能统一存放在仓库根目录 `skills/<skill-name>/` 下（通过软链自动暴露给 `.claude/skills/` 与 `.agents/skills/`）：

```text
skills/<skill-name>/
├── SKILL.md        # 必填：包含 YAML frontmatter (name, description) 与精炼操作步骤
├── scripts/        # 选填：可复用的确定性辅助脚本 (.mjs)
└── references/     # 选填：参考规范或样本片段
```

### `SKILL.md` 编写准则
1. **YAML Frontmatter 必填**：
   - `name`：与文件夹同名（kebab-case）。
   - `description`：清晰说明该技能做什么、何时触发、何时不触发。
2. **指令精炼、可执行**：
   - 优先给出可直接运行的 CLI 命令（如 `node bench/bin/dw.js ...`）与明确的检查清单（Checklist）。
   - 避免冗长的空泛理论。

## 3. 演进安全护栏

1. **先更新比新建优先**：如果新经验属于现有技能（如 `design-loop`）的自然延伸，优先编辑补充现有 `SKILL.md`，保持技能库紧凑。
2. **向使用者透明汇报**：每次新建或大幅修改 `skills/<skill-name>/SKILL.md` 后，必须在回复中明确告知使用者变更的技能路径与沉淀的核心规则。
