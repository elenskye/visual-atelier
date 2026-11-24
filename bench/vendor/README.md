# vendor

不是我们写的第三方文件，原样存放，不手改。

- `claude-design/dc-runtime.js`：Claude 画布（Design 类型）的运行时，让 `.dc.html` 跑起来。画板里写的是 `<script src="./support.js"></script>`，`dw serve` 把这个请求接到这里。`runtime.json` 记着它的 sha256 和核对日期。云端的画布类型换了运行时（`list_files` 里 `artifact-type/dc-runtime.js` 的 sha256 变了），就换掉这份并更新 `runtime.json`。仓库私有，所以它进 Git。
- 运行时自己从 jsdelivr 取 React 18.3.1，没放进来：设 `window.__resources` 能改成本地文件，但运行时会因此跳过一步读取，和云端的行为不一样。
