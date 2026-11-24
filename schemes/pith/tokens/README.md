# tokens

Pith 的 token（结构见 `docs/architecture.md`「目录与清单约定」）：

- `color.json`：两套配色（`paper-sea` 纸与海默认、`mist-ochre` 雾与赭），各有明暗；19 个角色（`roleDefs`）。网页方言 `--color-<角色>`，根上 `data-palette` 换配色、`data-theme="dark"` 换暗色（`targets.json`）。
- `contrast.json`：两套、明暗都查的 APCA 配对（正文 ≥ 75，次要和交互色 ≥ 60）；珊瑚、金、线是装饰，不进配对。
- `scale.json`：字（衬线、无衬线）、字号、行高、间距、圆角、宽、阴影。
- `motion.json`：两档、缓动、三种性格（舒展、生长、上墨）和登记的六个 expressive 表面。

改了跑 `npm run build:tokens -- --scheme pith`、`npm run qa -- --scheme pith`。
