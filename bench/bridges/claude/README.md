# bridges/claude

Claude 画布「导出单文件 HTML」的格式：`dw import` 用它解包，`dw export --html` 用 `templates/bundler-page-shell.html` 把一张画板打成单文件。

- `adapter.config.json`：解包配置；`knownAssetUuids` 认出导出包里的画布运行时。
- `scripts/hooks.mjs`：解包的钩子，现在都是默认行为。
- `templates/`：单张画板导出的外壳 `bundler-page-shell.html`，和旧的清单格式说明 `manifest.schema.json`（代码不读它）。

解包本身在 `src/bundler/`。导出包没有画布的排布、页和便签，`dw import` 把它转成 `canvas.json` 加 `.dc.html` 时按每行 4 张排开（`src/canvas/create.js`）。
