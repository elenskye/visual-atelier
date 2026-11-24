// 第 4 步 · 方案文件：第 3 步的 scheme/ 落上站主 11-10 的三个回答（深色亮一档认了、键盘焦点认了、图标底板用第 1 步的比例），
// 再加 Design System 的源（design-system/）。收尾（站主 11-10 认了 Design System）：状态改 approved，菜单栏换成 14 格的鸟，A3 收进 marks/raster/。
// 导入时 project/scheme/ 整个复制成 visual-atelier 的 schemes/peck/（另加 CLAUDE.md、sync.json、type/fonts/ 两个字体文件）。
import { createHash } from 'node:crypto';
import { schemeFiles as s3Files } from '../s3/scheme.mjs';
import { markFiles, MARKS } from './icon.mjs';
import { SIZE_TOKENS, sourceFiles } from './ds.mjs';
import { GLYPHS } from './css.mjs';

const J = (o) => JSON.stringify(o, null, 2) + '\n';
export const DS_URL_NOTE = '云端「Peck」Design System（现用账号）';

const SEC6 = (dsUrl) => `## 6. 标志与图标

- **App 图标 J2**（主图标，Dock、Finder、打包）：32 格像素鸟，鸟青 #00E5FF、冠羽 #A8F6FF，眼睛空着；深海渐变 #16214A → #050816 的底板占画面 7/8（第 1 步的比例，站主 2026-11-10 定），圆角 22.5%。底板占 7/8 时每个尺寸一格都是整像素：1024、512、256 用 J2（32 格），一格 28、14、7 像素；128、64、32 用照 J2 缩、手修的 28 格鸟，一格 4、2、1 像素；16 用 14 格的鸟。（第一版小尺寸借的是菜单栏的 16 格鸟，站主 2026-11-10 说脸太臃肿，重画了。）64 以上加一圈光，128 以上底板下一点阴影；32、16 不加光。底稿 \`marks/app-icon/j2.svg\`（256 以上）、\`j2-128.svg\`、\`j2-64.svg\`、\`j2-32.svg\`（16@2x 也用它）、\`j2-16.svg\`。
- **A3**（现在的图标润色，设置里能换）：位图 \`marks/raster/a3.png\`（1024），只出 Dock 用的 128 以上；底板本来就占 87%，和 J2 一样大，不用缩。
- **菜单栏模板图**：18pt，14 格的鸟（和 16 像素 App 图标同一只，站主 2026-11-10 定换掉第 1 步的 16 格胖脸鸟），一格 1pt，@1x、@2x 都是整像素；黑 + 透明由系统上色，眼睛空着。鸟在 18 格里占 x 4–13、y 5–13，右边的状态和鸟隔 3 格。四个状态：空闲、在跑（三颗点轮流亮）、等你（问号）、在跑 N 个（v0.7 起）。
- **界面图标**：8×8 像素格画成 16（小处 12、大处 24），${Object.keys(GLYPHS).length} 个，在 Design System 里是 \`pk-i pk-i--<名字>\`（CSS 遮罩，颜色跟字走）。
- 文件在 \`marks/\`（\`marks/manifest.json\`，A3 在 \`marks/raster/\`），全部 approved。.icns 的 10 张按尺寸取底稿（16 用 \`j2-16.svg\`，16@2x、32 用 \`j2-32.svg\`，32@2x 用 \`j2-64.svg\`，128 用 \`j2-128.svg\`，256 以上用 \`j2.svg\`），不要从一张 1024 缩；菜单栏模板图出 18、36 像素两份 PNG。

## 7. Design System

- ${DS_URL_NOTE}：${dsUrl || '（建好后写链接）'}。源在 \`design-system/\`（照 visual-atelier 的格式：system.json、tokens.config.json、README.md、bundle.css、components/）；第一主题深色，类名都以 \`pk-\` 开头，没有 JS 组件。
- 挂到画布上：\`project/ds/peck/\` 放 tokens.json、tokens.css、components/bundle.css、bundle.js 和两个字体文件，画板只引 tokens.css 和 bundle.css。

## 8. 待确认

没有。站主 2026-11-10 认了第 4 步，方案 0.1.0 approved；以后改视觉基线开新版本（approved 的资产不改几何和参数）。
`;

/** 方案目录下的全部文件。remove：云端要删掉的旧文件（相对 scheme/）。 */
export function schemeFiles({ dsUrl, a3 } = {}) {
  const f = s3Files();
  // 图标换成第 1 步的比例
  for (const k of Object.keys(f)) if (k.startsWith('marks/')) delete f[k];
  const marks = Object.fromEntries(Object.entries(markFiles()).map(([p, svg]) => [p, svg + '\n']));
  Object.assign(f, marks);
  const sha = (t) => createHash('sha256').update(t).digest('hex');
  f['marks/manifest.json'] = J({ assets: MARKS.map(([id, title, file, notes]) => ({
    id, title, file: file.replace(/^marks\//, ''), kind: 'svg', status: 'approved', colorMode: file.includes('menubar') ? 'currentColor' : 'fixed',
    source: { generator: 'Peck Explore 画布的 project/src/s4/icon.mjs', rules: 'DESIGN.md §6', note: '第 4 步生成，不要手改' }, notes, sha256: sha(marks[file]),
  })).concat(a3 ? [{
    id: 'app-icon-a3', title: 'App 图标 · A3（现在的图标润色）', file: 'raster/a3.png', kind: 'raster', status: 'approved', colorMode: 'fixed',
    source: { generator: '第 1 步第三轮：把现在的图标的鸟从纯色底里分出来，放到深海渐变 + 光 + LED 点阵孔的新底上（画布附件）', rules: 'DESIGN.md §6', note: '位图，不要手改' },
    notes: '1024 见方，底板占 87%；设置里能换成它，只出 Dock 用的 128 以上', sha256: sha(a3),
  }] : []) });
  if (a3) f['marks/raster/a3.png'] = a3;
  // scale.json：控件尺寸写成干净的像素值（Design System 的 size-* 从这里取）
  const scale = JSON.parse(f['tokens/scale.json']);
  scale.size = Object.fromEntries(SIZE_TOKENS.map(([id, v]) => [id, `${v}px`]));
  f['tokens/scale.json'] = J(scale);
  const tg = JSON.parse(f['tokens/targets.json']);
  tg.pending = [];
  f['tokens/targets.json'] = J(tg);
  // DESIGN.md：开头的状态、§6 换掉，§7 待确认换成 Design System + 待确认
  let d = f['DESIGN.md'];
  d = d.replace(/草稿：第 3 步第一轮（2026-11-10），站主批了第 4 步（Design System）以后状态改 approved。/, '已批准：0.1.0（2026-11-10，站主在 Peck Explore 上四步都验收了，第 4 步是 Design System「Peck」）。');
  d = d.replace('（66 条，现在在画布的 project/ 下，导入时一起放进来）', '（66 条，同目录）');
  d = d.slice(0, d.indexOf('## 6. 标志与图标')) + SEC6(dsUrl);
  f['DESIGN.md'] = d;
  for (const [p, t] of Object.entries(sourceFiles())) f[`design-system/${p}`] = t;
  // 1.0.0（站主 2026-11-24）：内容和 0.1.0 一样，只是定为 1.0.0
  f['scheme.json'] = J({ ...JSON.parse(f['scheme.json']), status: 'approved', version: '1.0.0' });
  const fonts = JSON.parse(f['type/fonts.json']);
  fonts.notes = ['缝合像素 12 和 Departure Mono 的文件在 visual-atelier 方案的 type/fonts/（带 OFL 许可原文；画布附件里是同一份），登记在 visual-atelier 的 docs/licensing.md。'];
  f['type/fonts.json'] = J(fonts);
  return f;
}
export const REMOVED = [];
