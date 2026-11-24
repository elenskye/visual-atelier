# Vermilion Explore

Vermilion 图形语言的探索画布：现用账号 https://claude.ai/artifact/HxHyVFMZPgwcjpXQrAoDbP （私有；slug `894a9621-fd42-454e-9d34-1a57bd3efb9a`；站主 2026-11-12 从旧账号复制过来，18 个文件和本地逐个 sha256 一致，图片 id 也一样，是 `cloud.json` 的 home）。旧账号那份 https://claude.ai/artifact/HiPsn6vm1nLTknV2witmCb （slug `8759cf86-4c2c-4b29-8159-66be7379a958`）只看不动。探索 2026-10-30 结束。本目录 2026-11-05 从云端版本 `1793707853-80d7` 收来。和本地用同一套图片 id。

四轮都是探索（挑方向、挑处理），一张都不删；2026-11-13 照 `canvases/README.md`「Explore Deck 的规矩」分成四页，画板改名 `X<轮>-…`，标题去掉轮次（页名里有）；11-14 页名改成 EX1–EX4。云端两份还是改名前的样子，以本地为准。

| 页 | 画板（`project/<名字>.dc.html`） | 图片来自 |
| --- | --- | --- |
| EX1：五个方向（A 一笔、B 流线、C 涟漪、D 剪纸、E 笔势） | `X1-Overview-light`、`X1-Overview-dark`（原 `Main`、`Overview-dark`）；放进网站里看：`X1-A-one-line`、`X1-B-flow`、`X1-C-ripple`、`X1-D-paper`、`X1-E-brush` | `render.js`；B 方向的 6 个分类图形（明暗共 12 张）在 `blobs/`；放进网站的图形内联在页面里 |
| EX2：深挖笔势，融合剪纸 | `X2-Dimensions`、`X2-Fusion`、`X2-Site-light`、`X2-Site-dark`（原 `R2-*`） | `render.js`、`render2.js` |
| EX3：规则成文、迁移测试 | `X3-Icons`、`X3-PPT`、`X3-Pomelo`、`X3-Loading`（原 `R3-*`） | `render2.js`、`render3.js`、`render4.js`；加载动画全部内联 |
| EX4：飞白、大图的墨感 | `X4-Ink`（原 `R3F-ink`） | `render3.js`、`render4.js` |

## 目录

- `project/`：`canvas.json`、16 个画板和 `ds/vermilion/tokens.json`。2026-11-06 从云端读回时 18 个文件都和云端校验和一致；11-13 本地分页、改名。
- `graphic-language-r3/`：生成图片的脚本，说明见其中的 `README.md`。
- `blobs/`：页面里 `/_blob/<id>` 的 233 张图，`<id>.svg`，字节和云端存的一样（2026-11-06 和 `list_assets` 逐张核对）。
- `blobs.json`：每张图从哪来。`file` 是脚本生成的路径（相对 `graphic-language-r3/`），`source_sha256` 是上传前的校验和，`sha256` 和 `size` 是云端存的版本；`saved` 的 12 张脚本做不出来，是从云端读回的。
- `rebuild-blobs.mjs`：从脚本重新做出 `blobs/`，见下。

## 重新生成图片

`blobs/` 已经进 Git，平时不用重做。要从脚本重做并逐张核对：

```bash
cd canvases/vermilion-explore
```

```bash
node rebuild-blobs.mjs
```

它跑两遍脚本（默认墨感一遍，「split」一遍），再在 Chrome 里按云端的办法把 SVG 重新序列化（`<path/>` 变成 `<path></path>`），和 `blobs.json` 的 `sha256` 对上才写。2026-11-06：221 张做出来、12 张原本就存着，233 张全对。

只想看脚本的原始输出：

```bash
cd canvases/vermilion-explore/graphic-language-r3
```

```bash
node render.js && node render2.js && node render3.js && node render4.js
```

输出在 `out*/`，不进 Git，是上传前的原文件，和云端存的差在序列化。

`X3-PPT` 的两张章节页标着 `"ink": "split"`，当时用的是三缕飞白，现在的默认墨感已经改了。要生成它们，单独跑下面这条，它会覆盖 `out3/`：

```bash
node -e "require('./e3').setInk('split'); require('./render3')"
```

发到一块新画布时，`dw publish` 会列出要上传的图片，上传后按对照表换掉页面里的 id，见 `docs/cloud.md`。

## 找不到的源

- **画板页面的生成器。** 16 个 `*.dc.html` 和 `canvas.json` 没有生成器：主工作区 `scratch/`、其他 worktree、临时目录和本机会话记录里都没有。要改就直接改 `project/` 里的文件。
- **第一轮 B 方向分类图形的脚本。** 现在的 `dirs.js` 生成的和总览页上的不一样，当时那版没留下。这 12 张从云端读回，存在 `blobs/`，是云端存的版本，不是上传前的原文件。

## 公开内容

`X1-A-one-line`、`X1-B-flow`、`X1-C-ripple`、`X1-D-paper`、`X1-E-brush`、`X2-Site-light`、`X2-Site-dark` 里有站主两篇已发表文章的标题和摘要，站主 2026-11-05 同意原样收。
