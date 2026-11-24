# logo-route · Logo A 路径延伸

calm 档招牌动作：虚线路径延伸到终点圆圈，到达时圆圈变为交互色（朱红）。

- `logo-route.css`：样式与动画（网页实时播放用）。
- `logo-route.fragment.html`：内联 SVG 结构（同页多个实例需各自唯一的 mask id）。
- `motion.json`：规格与导出参数。

迁入时与网站当时的实现逐像素一致。`npm run qa:parity` 可检查网站现用的实现是否仍与本零件一致（只读）。
