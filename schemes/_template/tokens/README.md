# tokens

语义角色的色彩（明暗两套）、字号、间距、圆角、动效时长与缓动，写成 JSON。各文件的结构见 `docs/architecture.md`「目录与清单约定」。

模板给的是一套能构建、能过检查的占位：`color.json`、`scale.json`、`motion.json`、`contrast.json`、`targets.json` 少一个工具就报错。换成这套方案自己的数；加了颜色角色，`contrast.json`、`targets.json`、`design-system/tokens.config.json` 跟着加。
