// 第 4 步 · App 图标按第 1 步的比例（站主 2026-11-10 定）：底板占画面的 7/8，鸟占底板的 2/3 左右。
// 三只同一个样子的鸟，按尺寸换，底板占 7/8 时每个尺寸一格都是整像素：
//   J2（32 格，第 1 步定的）：1024、512、256，一格 28、14、7 像素
//   B28（28 格，照 J2 缩、手修）：128、64、32，一格 4、2、1 像素
//   B14（14 格）：16，一格 1 像素
// 第一版小尺寸用的是第 1 步给菜单栏画的 16 格鸟（T16），站主 11-10 说脸太臃肿，换成 B28、B14。
// 菜单栏模板图收尾时也换成 B14（站主 11-10 定）；第 3 步的那版留作对照（oldMenuSvg）。
import { J2, T16, pix } from '../s1b/icon.mjs';
import { menuSvg as oldMenuSvg } from '../s3/icon.mjs';
import { ICON } from '../s3/tokens.mjs';

export const PLATE = 7 / 8; // 底板占画面（第 1 步：底板占满 32 格，四周留白，占 87%）
const BIRD = { c: ICON.bird, l: ICON.crest };
const r2 = (n) => Math.round(n * 100) / 100;

/** n×n 的格子，按行写 [颜色, 从, 到]（相对鸟的左上角 ox、oy）。 */
const grid = (n, ox, oy, segs) => {
  const rows = Array.from({ length: n }, () => Array(n).fill('.'));
  segs.forEach((row, y) => row.forEach(([k, a, b]) => { for (let x = a; x <= b; x++) rows[oy + y][ox + x] = k; }));
  return rows.map((r) => r.join(''));
};
// 28 格的鸟：J2 按 7/8 缩，冠羽往后掠、喙张开（上喙、喙尖、下喙三段）、脖子一格一格收成尖；眼睛 2×2
export const B28 = grid(28, 5, 5, [
  [['l', 0, 0]], [['c', 0, 0], ['l', 1, 2]], [['c', 0, 1], ['l', 2, 8]], [['c', 0, 3], ['l', 4, 10]], [['c', 1, 10], ['l', 11, 11]], [['c', 2, 11], ['l', 12, 12]],
  [['c', 3, 9], ['e', 10, 11], ['c', 12, 14]], [['c', 4, 9], ['e', 10, 11], ['c', 12, 13], ['c', 15, 16]], [['c', 4, 12], ['c', 15, 17]], [['c', 4, 11], ['c', 14, 15]],
  [['c', 3, 13]], [['c', 3, 10]], [['c', 2, 8]], [['c', 2, 7]], [['c', 3, 7]], [['c', 4, 7]], [['c', 5, 7]], [['c', 6, 7]],
]);
// 14 格的鸟（16 像素用）：同一个轮廓，眼睛 1 格，喙也张开（上喙、喙尖、下喙）
export const B14 = grid(14, 2, 2, [
  [['l', 0, 0]], [['c', 0, 0], ['l', 1, 4]], [['c', 0, 2], ['l', 3, 5]], [['c', 1, 4], ['e', 5, 5], ['c', 6, 7]], [['c', 1, 6], ['c', 8, 9]], [['c', 1, 5], ['c', 7, 7]],
  [['c', 1, 4]], [['c', 2, 4]], [['c', 3, 4]],
]);
export { J2, T16, oldMenuSvg };

// ---------- 菜单栏模板图：18pt，黑 + 透明，系统按明暗上色 ----------
// 鸟用 16 像素 App 图标那只 14 格的（B14），一格 1pt，@1x、@2x 都是整像素；冠羽并进身子，眼睛空着。
// 鸟占 10×9 格，放在 18 格的 x 4–13、y 5–13；右边的状态照第 3 步的样子，和鸟隔 3 格。
const mono = (rows) => rows.map((r) => r.replace(/[bel]/g, (m) => (m === 'l' ? 'c' : '.')));
const MENU_BIRD = [...Array(3).fill('.'.repeat(18)), ...mono(B14).map((r) => '..' + r + '..'), '.'.repeat(18)];
const GLYPH = {
  q: ['.##.', '#..#', '...#', '..#.', '.#..', '....', '.#..'],
  3: ['###', '..#', '.##', '..#', '###'],
};
const cells = (rows, ox, oy) => { let r = ''; rows.forEach((row, y) => [...row].forEach((k, x) => { if (k === '#') r += `<rect x="${ox + x}" y="${oy + y}" width="1" height="1"></rect>`; })); return r; };
/** state：idle / run（frame 0–2 哪颗点亮）/ wait / count。返回 [宽, SVG 内容]。 */
function menuMark(state, frame = 0) {
  const bird = pix(MENU_BIRD, { c: 'currentColor' });
  if (state === 'idle') return [18, bird];
  if (state === 'run') return [26, bird + [0, 1, 2].map((i) => `<rect x="${17 + i * 3}" y="${i === frame ? 9 : 10}" width="2" height="2" opacity="${i === frame ? 1 : 0.35}"></rect>`).join('')];
  if (state === 'wait') return [23, bird + cells(GLYPH.q, 18, 5)];
  return [22, bird + cells(GLYPH[3], 18, 7)];
}
/** 菜单栏模板图的 SVG（高 18，宽随状态）。 */
export function menuSvg(state, frame = 0) {
  const [w, body] = menuMark(state, frame);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 18" width="${w}" height="18" fill="currentColor" shape-rendering="crispEdges">${body.replace(/fill="currentColor"/g, '')}</svg>`;
}

const grad = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ICON.plate[0]}"></stop><stop offset="1" stop-color="${ICON.plate[1]}"></stop></linearGradient>`;
const glowF = (id, sd) => `<filter id="${id}g" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="${sd}" flood-color="${ICON.bird}" flood-opacity=".55"></feDropShadow></filter>`;
const shadowF = (id, dy, sd) => `<filter id="${id}s" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="${dy}" stdDeviation="${sd}" flood-color="#000" flood-opacity=".35"></feDropShadow></filter>`;

/**
 * n 格的鸟放在底板上：画面 8n 个单位，底板 7n（7/8），一格 7 个单位。
 * 一圈光 0.6 格、底板阴影向下 0.3 格（和第 3 步一样，按这只鸟自己的格子算）。
 */
export function birdSvg(rows, size, id, { glow = false, shadow = false } = {}) {
  const n = rows.length, U = 8 * n, P = 7 * n, o = n / 2, cell = 7;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${U} ${U}" width="${size}" height="${size}" shape-rendering="crispEdges"><defs>${grad(id)}${glow ? glowF(id, r2(0.6 * cell)) : ''}${shadow ? shadowF(id, r2(0.3 * cell), r2(0.3 * cell)) : ''}</defs><g${shadow ? ` filter="url(#${id}s)"` : ''}><rect x="${o}" y="${o}" width="${P}" height="${P}" rx="${r2(P * ICON.radius)}" fill="url(#${id})"></rect></g><g${glow ? ` filter="url(#${id}g)"` : ''} transform="translate(${o} ${o}) scale(${cell})">${pix(rows, BIRD)}</g></svg>`;
}
/** 尺寸 size 用哪只鸟：256 以上 J2，32–128 B28，16 B14。64 以上加光，128 以上加底板阴影。 */
export function appIcon(size, id = 'ai' + size) {
  const rows = size >= 256 ? J2 : size >= 32 ? B28 : B14;
  return birdSvg(rows, size, id, { glow: size >= 64, shadow: size >= 128 });
}
/** 第一版的小尺寸（16 格的鸟 T16），对照用。 */
export function oldSmall(size, id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges"><defs>${grad(id)}</defs><rect x="1" y="1" width="14" height="14" rx="${r2(14 * ICON.radius)}" fill="url(#${id})"></rect>${pix(T16, BIRD)}</svg>`;
}
/** 第 3 步第一轮的样子（Apple 的格子，底板 81%），对照用。 */
export { appIcon as s3Icon } from '../s3/icon.mjs';

/** 方案 marks/ 下的文件。 */
export function markFiles() {
  const f = {};
  f['marks/app-icon/j2.svg'] = appIcon(1024, 'j2');
  f['marks/app-icon/j2-128.svg'] = appIcon(128, 'j2128');
  f['marks/app-icon/j2-64.svg'] = appIcon(64, 'j264');
  f['marks/app-icon/j2-32.svg'] = appIcon(32, 'j232');
  f['marks/app-icon/j2-16.svg'] = appIcon(16, 'j216');
  f['marks/menubar/idle.svg'] = menuSvg('idle');
  for (let i = 0; i < 3; i++) f[`marks/menubar/run-${i + 1}.svg`] = menuSvg('run', i);
  f['marks/menubar/wait.svg'] = menuSvg('wait');
  f['marks/menubar/count-3.svg'] = menuSvg('count');
  return f;
}
// [id, 名字, 文件, 说明]
export const MARKS = [
  ['app-icon-j2', 'App 图标 · J2（主图标）', 'marks/app-icon/j2.svg', '32 格的鸟，底板占 7/8（第 1 步的比例）；256、512、1024 用它，一格 7、14、28 像素；加一圈光和底板阴影'],
  ['app-icon-j2-128', 'App 图标 · J2 · 128', 'marks/app-icon/j2-128.svg', '28 格的鸟（照 J2 缩），一格 4 像素；加光和底板阴影'],
  ['app-icon-j2-64', 'App 图标 · J2 · 64', 'marks/app-icon/j2-64.svg', '28 格的鸟，一格 2 像素，加光；32@2x 用它'],
  ['app-icon-j2-32', 'App 图标 · J2 · 32', 'marks/app-icon/j2-32.svg', '28 格的鸟，一格 1 像素，不加光；32@1x、16@2x 用它'],
  ['app-icon-j2-16', 'App 图标 · J2 · 16', 'marks/app-icon/j2-16.svg', '14 格的鸟，一格 1 像素，不加光；16@1x 用它'],
  ['menubar-idle', '菜单栏 · 空闲', 'marks/menubar/idle.svg', '模板图，18pt；14 格的鸟（和 16 像素 App 图标同一只），一格 1pt'],
  ['menubar-run-1', '菜单栏 · 在跑 · 1', 'marks/menubar/run-1.svg', 'run-1、run-2、run-3 轮流，每帧 6 格（300ms）'],
  ['menubar-run-2', '菜单栏 · 在跑 · 2', 'marks/menubar/run-2.svg', '同上'],
  ['menubar-run-3', '菜单栏 · 在跑 · 3', 'marks/menubar/run-3.svg', '同上'],
  ['menubar-wait', '菜单栏 · 等你', 'marks/menubar/wait.svg', '不动'],
  ['menubar-count', '菜单栏 · 在跑 N 个', 'marks/menubar/count-3.svg', 'v0.7 起；数字 3×5 像素，2–9'],
];
// .icns 里的 10 张：[文件名, 像素, 用哪份底稿, 一格几像素]
export const ICNS = [
  ['icon_16x16.png', 16, 'j2-16', '1'], ['icon_16x16@2x.png', 32, 'j2-32', '1'],
  ['icon_32x32.png', 32, 'j2-32', '1'], ['icon_32x32@2x.png', 64, 'j2-64', '2'],
  ['icon_128x128.png', 128, 'j2-128', '4'], ['icon_128x128@2x.png', 256, 'j2', '7'],
  ['icon_256x256.png', 256, 'j2', '7'], ['icon_256x256@2x.png', 512, 'j2', '14'],
  ['icon_512x512.png', 512, 'j2', '14'], ['icon_512x512@2x.png', 1024, 'j2', '28'],
];
