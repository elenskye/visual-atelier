# skills

本仓库的 Skill，每个是一个带 `SKILL.md` 的文件夹。`.claude/skills`、`.agents/skills`（Codex 之类的 Agent 用）都是指向这里的软链接；别的 Agent 直接读 `skills/<name>/SKILL.md`。

规则：自包含（用途、输入、输出、验证）；不依赖用户全局目录；只写与本仓库工作流有关的内容。

| Skill | 用途 |
| --- | --- |
| `design-craft/` | 视觉探索的设计功夫：起几个真正不同的方向、点名默认惯性、押一个记忆点、动效放在哪、评估几家；带简报模板 `brief-template.md` |
| `design-loop/` | 新建、修改、检查一块画布或一张画板，挂 Design System，导出，和云端同步 |
| `questionnaire/` | 做一份带存储的问卷页，本地或云端填，读回答案 |
| `skill-evolver/` | 把反复出现的做法沉淀成新的 Skill |

候选（需要时再建）：新建方案、动效零件规格与实现、导出与质量检查、同步到消费方。
