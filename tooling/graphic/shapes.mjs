// 「笔势与纸片」的全部图形定义：分类图形（64 网格三笔版、简笔版）、分区装饰、分享图与文章分享图、空状态、PPT 封面与章节页、加载圆相、
// 404 插图、文末落款（三版）、内容图标（24 个）。
// 每个图形是一组元素：
//   { k: 'paper', d, layer: 1|2, i, dx, dy }   纸片（layer 1 = 第一层纸，2 = 第二层纸），dx/dy 是入场时的错位
//   { k: 'stroke', d, c, w, i }                 笔势：d 是填充轮廓，c 是中心线（写出动画的遮罩沿它走），w 是遮罩描边宽
//   { k: 'ember', cx, cy, r }                   朱红抵达点：只在动效里出现，静态图形不画
// i 是书写顺序（动效的先后），从 0 开始：纸片在前，笔势在后。
// 几何与 Round 3 迁移测试、Round 4 站主选定的「提按」一致（2026-10-30）。
import { crPath, brush, pressBrush, radial, circlePts } from './geometry.mjs';
import { CONTENT_ICONS } from './icons.mjs';

export const CATEGORIES = [
  ['write', '写作'], ['project', '项目'], ['gallery', '画廊'], ['create', '创作'], ['travel', '游记'], ['other', '其他'],
];

const paper = (pts, layer, i, dx = 0, dy = 4) => ({ k: 'paper', d: typeof pts === 'string' ? pts : crPath(pts, true), layer, i, dx, dy });

/** 一组笔：[中心线点列, 最粗处宽, 收笔]。ink = clean（光洁）或 press（提按）。 */
function strokes(set, { ink = 'clean', i0 = 1, seed = 5, g = {} } = {}) {
  return set.map(([pts, w, prof], j) => ({
    k: 'stroke',
    d: ink === 'press' ? pressBrush(pts, w, prof, seed + j * 7, g) : brush(pts, w, prof, g),
    c: crPath(pts),
    w: w * 1.9,
    i: i0 + j,
  }));
}
const ember = (cx, cy, r) => ({ k: 'ember', cx, cy, r });

/* ---------- 分类图形：64 网格 ---------- */

// 三笔版（显示 ≥ 48px）：[中心线, 最粗处宽, 收笔]
const GLYPH = {
  write: [[[[11, 56], [20, 44], [32, 29], [43, 17], [53, 8]], 5.2, 'head'], [[[52, 11], [47, 25], [37, 36], [24, 44]], 3.6, 'sym'], [[[14, 57], [30, 54], [44, 56], [54, 53]], 2.8, 'sym']],
  project: [[[[18, 59], [18, 34], [18, 7]], 3.6, 'tail'], [[[20, 11], [29, 6], [39, 12], [50, 8]], 5, 'sym'], [[[21, 27], [30, 23], [40, 29], [50, 25]], 3.8, 'sym']],
  gallery: [[[[13, 13], [12, 33], [13, 52], [33, 52], [52, 51]], 4.2, 'head'], [[[16, 12], [34, 12], [52, 13], [52, 30], [51, 46]], 3.2, 'tail'], [[[17, 45], [25, 34], [31, 40], [39, 28], [48, 43]], 3.6, 'sym']],
  create: [[[[31, 22], [21, 15], [10, 18], [10, 33], [11, 47]], 4, 'head'], [[[33, 22], [43, 15], [54, 18], [54, 33], [53, 47]], 4, 'head'], [[[11, 47], [22, 44], [32, 51], [43, 44], [53, 47]], 3, 'sym']],
  travel: [[[[5, 49], [16, 32], [22, 38], [32, 18], [43, 36], [49, 30], [59, 45]], 5, 'sym'], [circlePts(50, 13, 5, -1.2, 4.4, 10), 2.8, 'head']],
  other: [[circlePts(32, 32, 21, 2.6, 2.6 + Math.PI * 1.85, 22), 7, 'head']],
};
// 简笔版（显示 ≤ 32px）：每类 1–2 笔，纸片不变
const GLYPH_SIMPLE = {
  write: [[[[10, 57], [20, 45], [32, 30], [43, 18], [54, 8]], 6, 'head'], [[[16, 57], [32, 54], [52, 55]], 3, 'sym']],
  project: [[[[18, 59], [18, 34], [18, 7]], 3.8, 'tail'], [[[20, 13], [30, 6], [40, 16], [52, 9]], 6.4, 'sym']],
  gallery: [[[[14, 12], [12, 32], [13, 52], [33, 52], [52, 51]], 4.6, 'head'], [[[18, 44], [26, 33], [32, 40], [40, 27], [50, 43]], 4.4, 'sym']],
  create: [[[[9, 20], [21, 14], [32, 22], [43, 14], [55, 20]], 5.2, 'sym'], [[[10, 46], [22, 43], [32, 51], [43, 43], [54, 46]], 4, 'sym']],
  travel: [[[[4, 50], [16, 32], [22, 38], [32, 16], [43, 36], [49, 30], [60, 46]], 6.2, 'sym']],
  other: [[circlePts(32, 32, 21, 2.6, 2.6 + Math.PI * 1.85, 22), 8, 'head']],
};
const GLYPH_EMBER = { write: [54, 53], project: [18, 5], gallery: [42, 21], create: [32, 16], travel: [50, 13], other: [32, 32] };
const GLYPH_SIMPLE_EMBER = { write: [53, 55], project: [18, 5], gallery: [44, 20], create: [32, 32], travel: [51, 12], other: [32, 32] };
const GLYPH_PAPER = {
  write: () => [paper(radial(26, 40, () => 18, 20), 1, 0, -4, 4)],
  project: () => [paper(radial(37, 30, () => 19, 20), 1, 0, 4, 4)],
  gallery: () => [paper('M18,14H48Q54,14 54,20V48Q54,54 48,54H20Q14,54 14,48V20Q14,14 18,14Z', 1, 0, 3, 3)],
  create: () => [paper(radial(32, 34, () => 22, 22), 1, 0, 0, 4)],
  travel: () => [paper([[2, 58], [8, 46], [18, 36], [28, 42], [38, 30], [50, 40], [62, 44], [62, 58]], 1, 0, 0, 5)],
  other: () => [paper(radial(36, 36, () => 19, 22), 1, 0, 3, 3)],
};

export function glyph(cat, { simple = false, g = {} } = {}) {
  const set = (simple ? GLYPH_SIMPLE : GLYPH)[cat];
  const [ex, ey] = (simple ? GLYPH_SIMPLE_EMBER : GLYPH_EMBER)[cat];
  return [...GLYPH_PAPER[cat](), ...strokes(set, { i0: 1, g }), ember(ex, ey, cat === 'other' ? 3 : 2.6)];
}

/* ---------- 大图：纸山 + 提按笔 ---------- */

function sectionDeco(g) {
  return [
    paper([[180, 220], [230, 170], [300, 120], [370, 140], [430, 90], [500, 110], [560, 80], [560, 220]], 1, 0, 0, 10),
    paper([[260, 220], [320, 180], [400, 170], [470, 140], [560, 150], [560, 220]], 2, 1, 0, 10),
    ...strokes([[[[150, 196], [260, 182], [380, 192], [500, 172], [556, 176]], 10, 'sym'], [circlePts(470, 54, 16, 3.5, 3.5 + 5.6, 14), 5, 'head']], { ink: 'press', i0: 2, g }),
  ];
}
function og(g) {
  return [
    paper([[420, 630], [520, 520], [640, 420], [760, 470], [880, 300], [1000, 360], [1120, 260], [1200, 280], [1200, 630]], 1, 0, 0, 20),
    paper([[560, 630], [680, 560], [820, 540], [960, 470], [1080, 500], [1200, 450], [1200, 630]], 2, 1, 0, 20),
    ...strokes([[[[440, 590], [620, 560], [800, 585], [980, 545], [1180, 560]], 24, 'sym'], [circlePts(1010, 150, 50, 3.5, 3.5 + 5.5, 18), 13, 'head']], { ink: 'press', i0: 2, g }),
  ];
}
// 文章分享图的底图（VL1 Phase 9，站主选定「低山」）：纸山压低、贯穿全宽，一笔提按贴着山脚走，圆相在右上角；
// 标题放在纸山上方的大片留白里，字标在左上。
function ogCard(g) {
  return [
    paper([[-30, 660], [-30, 570], [140, 530], [300, 556], [470, 510], [640, 538], [820, 490], [1000, 520], [1230, 468], [1230, 660]], 1, 0, 0, 20),
    paper([[260, 660], [420, 590], [620, 598], [820, 562], [1020, 584], [1230, 540], [1230, 660]], 2, 1, 0, 20),
    ...strokes([[[[64, 590], [280, 566], [520, 590], [760, 556], [1000, 574], [1160, 548]], 22, 'sym'], [circlePts(1088, 112, 42, 3.5, 3.5 + 5.5, 18), 11, 'head']], { ink: 'press', i0: 2, seed: 11, g }),
  ];
}
function empty(g) {
  return [
    paper([[30, 200], [80, 150], [140, 130], [200, 150], [260, 120], [320, 140], [320, 200]], 1, 0, 0, 8),
    paper([[90, 200], [150, 175], [220, 170], [320, 160], [320, 200]], 2, 1, 0, 8),
    ...strokes([[[[40, 172], [120, 162], [200, 170], [290, 158]], 7, 'sym'], [circlePts(220, 62, 20, 3.3, 3.3 + 5.4, 14), 5.5, 'head']], { ink: 'press', i0: 2, g }),
  ];
}
function pptCover(g) {
  return [
    paper([[760, 1080], [900, 900], [1060, 760], [1220, 820], [1380, 600], [1540, 680], [1720, 520], [1920, 560], [1920, 1080]], 1, 0, 0, 30),
    paper([[980, 1080], [1140, 960], [1320, 930], [1500, 840], [1680, 880], [1920, 800], [1920, 1080]], 2, 1, 0, 30),
    paper(radial(1560, 260, () => 120, 28), 1, 2, 0, 20),
    ...strokes([
      [[[720, 990], [960, 950], [1220, 985], [1480, 930], [1880, 950]], 36, 'sym'],
      [circlePts(1560, 260, 92, 3.5, 3.5 + 5.5, 22), 20, 'head'],
      [[[1100, 520], [1240, 470], [1380, 495], [1560, 420]], 16, 'sym'],
    ], { ink: 'press', i0: 3, seed: 21, g }),
  ];
}
function pptSection(g) {
  return [
    paper([[1180, 1080], [1260, 860], [1420, 700], [1600, 640], [1780, 700], [1920, 640], [1920, 1080]], 1, 0, 0, 30),
    paper(radial(1640, 860, () => 150, 26), 2, 1, 0, 20),
    ...strokes([
      [[[150, 640], [420, 616], [700, 640], [980, 606]], 18, 'sym'],
      [[[1300, 980], [1500, 900], [1700, 930], [1900, 860]], 28, 'sym'],
    ], { ink: 'press', i0: 2, seed: 33, g }),
  ];
}

/* ---------- 404 插图：640 × 400，提按（VL1 Phase 7，站主选定「折页」） ---------- */

// 一张地图纸从左下角出血，右上角折起一角（第二层纸）；笔在纸上蜿蜒、冲出纸边停在空白里；圆相落在纸外。
function notFound(g) {
  return [
    paper('M-10,400L-10,148Q-10,128 10,127L330,117L374,160L396,372Q398,392 400,400Z', 1, 0, 0, 12),
    paper('M330,117L374,160L333,158Q326,157 327,150Z', 2, 1, 8, -8),
    ...strokes([
      [[[34, 336], [116, 292], [206, 300], [296, 250], [396, 240], [492, 208], [568, 202]], 15, 'sym'],
      [circlePts(566, 96, 30, 3.6, 3.6 + 5.2, 16), 7.5, 'head'],
    ], { ink: 'press', i0: 2, seed: 53, g }),
  ];
}

/* ---------- 文末落款：64 网格，光洁，每版两三笔（VL1 Phase 7，站主选定三版随机） ---------- */

export const END_MARKS = [['arrive', '抵达'], ['hills', '远山'], ['dots', '三点']];

// 抵达：一笔从左下走到一个小圆相前——Logo A「走到终点」的笔势版。
// 远山：低低的纸山、一笔地平线、一个小圆相作太阳——分享图与空状态的缩小版。
// 三点：三个短笔由重到轻、由长到短，像文末的三点（dinkus），不排成等距的虚线。
const dab = (x, y, len, w) => [[[x - len / 2, y + len * 0.2], [x, y], [x + len / 2, y - len * 0.2]], w, 'sym'];
const END_MARK = {
  arrive: (g) => [
    paper(radial(28, 38, (t) => 17 + 3 * Math.cos(2 * t), 22), 1, 0, -3, 3),
    ...strokes([[[[8, 54], [19, 48], [27, 39], [36, 32], [43, 29]], 5.6, 'tail'], [circlePts(49, 18, 9, 2.2, 2.2 + 5.5, 14), 3.8, 'head']], { g }),
  ],
  hills: (g) => [
    paper([[4, 56], [12, 44], [22, 38], [32, 42], [42, 32], [52, 36], [60, 44], [60, 56]], 1, 0, 0, 4),
    ...strokes([[[[5, 50], [22, 45], [38, 50], [59, 44]], 5.4, 'sym'], [circlePts(44, 18, 9, 3.4, 3.4 + 5.4, 14), 3.8, 'head']], { g }),
  ],
  dots: (g) => [
    paper(radial(31, 35, (t) => 15 + 9 * Math.cos(t) ** 2, 24), 1, 0, 0, 4),
    ...strokes([dab(16, 37, 14, 6), dab(34, 31, 11, 4.8), dab(49, 26, 8, 3.8)], { g }),
  ],
};

export const endMark = (variant, { g = {} } = {}) => END_MARK[variant](g);

/* ---------- 内容图标：64 网格，一张纸片 + 1–2 笔光洁（VL1 Phase 8，定义见 icons.mjs） ---------- */

export const contentIcon = (icon, { g = {} } = {}) => {
  const [cx, cy, r] = icon.paper;
  return [paper(radial(cx, cy, () => r, 22), 1, 0, 0, 0), ...strokes(icon.strokes, { g })];
};

/* ---------- 加载圆相：一张纸圆 + 一笔光洁圆相 + 朱红点 ---------- */

function loadingEnso(g) {
  return [
    paper(radial(66, 66, () => 30, 24), 1, 0, 0, 0),
    ...strokes([[circlePts(60, 60, 34, 2.4, 2.4 + 5.6, 24), 10, 'head']], { i0: 1, g }),
    ember(80, 33, 4.5),
  ];
}

/**
 * 写进 marks/graphic/ 的全部图形。
 * context：纸片放在什么底上——page（页面底）或 surface（表面底：空状态框、面板）。决定第一层纸取哪个面色。
 */
export function graphics(g = {}) {
  const list = [];
  for (const [cat, label] of CATEGORIES) {
    list.push({ id: `glyph-${cat}`, title: `分类图形 · ${label}`, viewBox: [64, 64], context: 'page', ink: 'clean', els: glyph(cat, { g }), use: '显示 ≥ 48px（无封面卡片 44px 也用这一版）' });
    list.push({ id: `glyph-${cat}-simple`, title: `分类图形 · ${label} · 简笔`, viewBox: [64, 64], context: 'page', ink: 'clean', els: glyph(cat, { simple: true, g }), use: '显示 ≤ 32px' });
  }
  list.push({ id: 'section-deco', title: '分区装饰', viewBox: [560, 220], context: 'page', ink: 'press', els: sectionDeco(g), use: '页面大标题旁，每页一处' });
  list.push({ id: 'og-graphic', title: '分享图底图', viewBox: [1200, 630], context: 'page', ink: 'press', els: og(g), use: 'OG 分享图 1200 × 630，标题放左上留白处' });
  list.push({ id: 'og-card-graphic', title: '文章分享图底图（低山）', viewBox: [1200, 630], context: 'page', ink: 'press', els: ogCard(g), use: '每篇文章的分享图 1200 × 630：字标在左上，标题在纸山上方的留白处；由 marks/og-card/template.json 使用' });
  list.push({ id: 'empty-graphic', title: '空状态插图', viewBox: [320, 200], context: 'surface', ink: 'press', els: empty(g), use: '放在空状态框（表面底）里' });
  list.push({ id: 'ppt-cover', title: 'PPT 封面底图', viewBox: [1920, 1080], context: 'page', ink: 'press', els: pptCover(g), use: '16:9 封面，标题放左上留白处' });
  list.push({ id: 'ppt-section', title: 'PPT 章节页底图', viewBox: [1920, 1080], context: 'page', ink: 'press', els: pptSection(g), use: '16:9 章节页，左侧那一笔放在标题下作横线' });
  list.push({ id: 'loading-enso', title: '加载圆相（静止）', viewBox: [132, 132], context: 'page', ink: 'clean', els: loadingEnso(g), use: '加载动画的静止帧；动画见 motion/loading-enso/' });
  list.push({ id: 'not-found', title: '404 插图（折页）', viewBox: [640, 400], context: 'page', ink: 'press', els: notFound(g), use: '404 页：标题与说明下方，最宽 560px；打开页面时写一次，见 motion/not-found-intro/' });
  for (const [variant, label] of END_MARKS) {
    list.push({ id: `end-mark-${variant}`, title: `文末落款 · ${label}`, viewBox: [64, 64], context: 'page', ink: 'clean', els: endMark(variant, { g }), use: '文章正文结尾，40px；三版每次随机显示一版，滚到时写一次，见 motion/end-mark/' });
  }
  // 内容图标：纸片没设变量时不画（paperFallback none），免得在没有 graphic.css 的地方变成一块实心
  for (const icon of CONTENT_ICONS) {
    list.push({ id: `icon-${icon.name}`, title: `内容图标 · ${icon.zh}`, viewBox: [64, 64], context: 'page', ink: 'clean', els: contentIcon(icon, { g }), paperFallback: 'none', use: `写进网站内容，Markdown 写 :${icon.name}:；显示约 1.2em，见 marks/icons.json` });
  }
  return list;
}
