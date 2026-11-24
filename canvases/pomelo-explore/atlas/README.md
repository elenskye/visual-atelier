# Pomelo Explore · Atlas 年度小报

Pomelo Explore「R5：Atlas 年度小报」那一页：Atlas 的设计 Tabloid（现在是 1.1.1）的审看。站主 2026-11-10 验收，定为第一轮定稿（不代表以后不优化）。设计的源和冻结的快照在方案里（`schemes/pomelo/atlas/`，规矩和数据的样子见它的 `README.md`）；这里只用一份编的数据（它的 `sample.mjs`）把它摆出来，画板没有自己的页面代码。

云端（现用账号）[Atlas 年度小报（探索）](https://claude.ai/artifact/RNfxkLga1kUDvJMm4TPRYY) 停在旧的一轮，只看。

| 画板 | 内容 |
| --- | --- |
| `Atlas-Main` | 走一遍：桌上的信封 → 拆开 → 小报跟着节拍自己翻，碰一下就停；点星星、纸条、卡片弹出原记录；「收进抽屉」。Tweaks 的「这一年」能关掉几幕、换成「今年没过完」、换一年聊的话题（看通用的泡泡）。板上跑的就是打好的设计（和快照是同一份代码） |
| `Atlas-Pages` | 全部的页摊开看（样例 21 页：1.1.x 有写下的字两幕、玩物有志和三个自建模块，目录排两栏） |
| `Atlas-Bubbles` | 聊天页的泡泡：通用的 6 个、专属的 12 个，各是什么时候用 |
| `Atlas-Module` | Atlas 模块页（和 Pomelo 里的一样）：一年一张封面排成一排（封面是设计自己画的，`cover.mjs`），封面下面的时间穿梭进这一年做过的每一份；右边「样式」；两张便签写封面和哪一版算定稿 |
| `Atlas-Desk` | 桌上的两样（新年第一周的信封、那年今日的便签）、节拍表、弹出和收起的动静 |

**文件**：`gen.mjs` 写五张画板和 `canvas.json` 里的这一页（`../page.mjs`）；`shot.mjs` 把 `Atlas-Main` 从头走一遍截图。`project/` 不手改。

```bash
node canvases/pomelo-explore/atlas/gen.mjs
```

```bash
node bench/bin/dw.js check pomelo-explore --board Atlas-Main.dc.html
```

```bash
VA_BROWSER_CHANNEL=chrome node canvases/pomelo-explore/atlas/shot.mjs <放截图的目录> [dark]
```

（`gen.mjs` 之前先 `npm run build:ds`；`shot.mjs` 要先开着 `node bench/bin/dw.js serve`。）
