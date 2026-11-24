---
name: skill-evolver
description: 在 visual-atelier 中沉淀、创建或迭代可复用 Agent 技能（skills/<skill-name>/SKILL.md）。当在设计探索、解包还原或视觉排障中发现高频重复模式并希望将其固化为团队共享技能时使用。
---

# skill-evolver

## 用途

把在本仓库里反复出现的做法写成 Skill，或者改好现有的。几家 Agent（Claude Code、Codex、Antigravity）读的是同一份 `skills/`（`.claude/skills`、`.agents/skills` 是指向它的软链接）。

## 什么时候做

- 几次探索、导入导出里反复走的同一套流程，换个方案也用得上（某类 token 映射的核对、手画滤镜的校准、动效曲线的验证）。
- 修了一类隐蔽、会再踩的坑（画板 `<x-dc>` 的绑定写法、`file://` 和 `blob:` 的源策略）。
- 站主说「把这个做成 Skill」。

一次性的小事不建 Skill。新经验属于现有 Skill 的，补进那一份（多半是 `design-loop` 或 `design-craft`），别另开一个。

## 输入

- 要沉淀的做法：从哪几次工作里来、步骤、命令、踩过的坑。
- 现有的 `skills/README.md` 和相关的 `SKILL.md`。

## 步骤

1. 先看 `skills/README.md` 有没有该补的那一份；有就改它。
2. 新建时目录是 `skills/<名字>/`（kebab-case）：`SKILL.md` 必有，可选 `scripts/`（确定性的 `.mjs`）、`references/`（参考片段）。
3. `SKILL.md` 开头 YAML 写 `name`（和目录同名）、`description`（做什么、什么时候用、什么时候不用）；正文照本仓库的格式写「用途、输入、步骤、输出、验证」，给能直接跑的命令（`node bench/bin/dw.js …`）和检查清单，规则在别处写过的指过去，不抄。
4. 在 `skills/README.md` 的表里加一行或改那一行。

## 输出

- 新的或改过的 `skills/<名字>/SKILL.md`（和 `skills/README.md`）。
- 回复里告诉站主改了哪份 Skill、沉淀了哪几条。

## 验证

- 照这份 Skill 从头走一遍它写的命令，都跑得通。
- `CHANGELOG.md` 记一条。
