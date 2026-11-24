// Round 3：全部带纸片；迁移测试（PPT、Pomelo、加载）
const { crPath, brush, dryBrush, bristleBrush, slitBrush, inkBrush, pressBrush, radial, circlePts } = require('./lib');
let INK = 'bristle';
const setInk = (v) => { INK = v; };
const E = require('./e2');
const CATS = E.CATS;

const fl = (pts, role, i, dx = 0, dy = 4) => ({ k: 'fl', d: typeof pts === 'string' ? pts : crPath(pts, true), role, i, dx, dy });
// 一组笔画：[中心线, 最大宽, 收笔]；dry=true 时用飞白
const strokes = (set, { dry = false, i0 = 1, seed = 5 } = {}) => {
  const out = [];
  set.forEach(([pts, w, prof], j) => {
    const base = { c: crPath(pts), w: w * 1.9, i: i0 + j };
    if (!dry || INK === 'clean') { out.push({ k: 'br', d: brush(pts, w, prof), ...base }); return; }
    if (INK === 'split') { out.push({ k: 'br', d: dryBrush(pts, w, prof, seed + j * 7), ...base }); return; }
    if (INK === 'bristle') { out.push({ k: 'br', d: inkBrush(pts, w * 1.1, prof, seed + j * 7, w > 15 ? 16 : 11), ...base }); return; }
    if (INK === 'bristleLight') { out.push({ k: 'br', d: inkBrush(pts, w * 1.06, prof, seed + j * 7, w > 15 ? 16 : 11, 0.72), ...base }); return; }
    if (INK === 'press') { out.push({ k: 'br', d: pressBrush(pts, w, prof, seed + j * 7), ...base }); return; }
  });
  return out;
};
const em = (x, y, r = 2.6) => ({ k: 'em', cx: x, cy: y, r });

/* 分类图形：64px 三笔 + 纸片；24px 简笔 + 纸片（同一张纸） */
const PAPER = {
  write: () => [fl(radial(26, 40, () => 18, 20), 'pBack', 0, -4, 4)],
  project: () => [fl(radial(37, 30, () => 19, 20), 'pBack', 0, 4, 4)],
  gallery: () => [fl('M18,14H48Q54,14 54,20V48Q54,54 48,54H20Q14,54 14,48V20Q14,14 18,14Z', 'pBack', 0, 3, 3)],
  create: () => [fl(radial(32, 34, () => 22, 22), 'pBack', 0, 0, 4)],
  travel: () => [fl([[2, 58], [8, 46], [18, 36], [28, 42], [38, 30], [50, 40], [62, 44], [62, 58]], 'pBack', 0, 0, 5)],
  other: () => [fl(radial(36, 36, () => 19, 22), 'pBack', 0, 3, 3)],
};
function icons64() { return E.fusionIcons(); }
function icons24() {
  const s = E.icons({ simple: true }); const out = {};
  for (const [k] of CATS) out[k] = PAPER[k]().concat(s[k].map((e) => e.k === 'br' ? { ...e, i: e.i + 1 } : e));
  return out;
}

/* 大图：纸片 + 飞白 */
function deco() {
  return [
    fl([[180, 220], [230, 170], [300, 120], [370, 140], [430, 90], [500, 110], [560, 80], [560, 220]], 'pBack', 0, 0, 10),
    fl([[260, 220], [320, 180], [400, 170], [470, 140], [560, 150], [560, 220]], 'pFront', 1, 0, 10),
  ].concat(strokes([[[[150, 196], [260, 182], [380, 192], [500, 172], [556, 176]], 10, 'sym'], [circlePts(470, 54, 16, 3.5, 3.5 + 5.6, 14), 5, 'head']], { dry: true, i0: 2 }));
}
function og() {
  return [
    fl([[420, 630], [520, 520], [640, 420], [760, 470], [880, 300], [1000, 360], [1120, 260], [1200, 280], [1200, 630]], 'pBack', 0, 0, 20),
    fl([[560, 630], [680, 560], [820, 540], [960, 470], [1080, 500], [1200, 450], [1200, 630]], 'pFront', 1, 0, 20),
  ].concat(strokes([[[[440, 590], [620, 560], [800, 585], [980, 545], [1180, 560]], 24, 'sym'], [circlePts(1010, 150, 50, 3.5, 3.5 + 5.5, 18), 13, 'head']], { dry: true, i0: 2 }));
}
function empty() {
  return [
    fl([[30, 200], [80, 150], [140, 130], [200, 150], [260, 120], [320, 140], [320, 200]], 'pBack', 0, 0, 8),
    fl([[90, 200], [150, 175], [220, 170], [320, 160], [320, 200]], 'pFront', 1, 0, 8),
  ].concat(strokes([[[[40, 172], [120, 162], [200, 170], [290, 158]], 7, 'sym'], [circlePts(220, 62, 20, 3.3, 3.3 + 5.4, 14), 5.5, 'head']], { dry: true, i0: 2 }));
}

/* PPT 1920×1080 */
function pptCover() {
  return [
    fl([[760, 1080], [900, 900], [1060, 760], [1220, 820], [1380, 600], [1540, 680], [1720, 520], [1920, 560], [1920, 1080]], 'pBack', 0, 0, 30),
    fl([[980, 1080], [1140, 960], [1320, 930], [1500, 840], [1680, 880], [1920, 800], [1920, 1080]], 'pFront', 1, 0, 30),
    fl(radial(1560, 260, () => 120, 28), 'pBack', 2, 0, 20),
  ].concat(strokes([
    [[[720, 990], [960, 950], [1220, 985], [1480, 930], [1880, 950]], 36, 'sym'],
    [circlePts(1560, 260, 92, 3.5, 3.5 + 5.5, 22), 20, 'head'],
    [[[1100, 520], [1240, 470], [1380, 495], [1560, 420]], 16, 'sym'],
  ], { dry: true, i0: 3, seed: 21 }));
}
function pptSection() {
  return [
    fl([[1180, 1080], [1260, 860], [1420, 700], [1600, 640], [1780, 700], [1920, 640], [1920, 1080]], 'pBack', 0, 0, 30),
    fl(radial(1640, 860, () => 150, 26), 'pFront', 1, 0, 20),
  ].concat(strokes([
    [[[150, 640], [420, 616], [700, 640], [980, 606]], 18, 'sym'],
    [[[1300, 980], [1500, 900], [1700, 930], [1900, 860]], 28, 'sym'],
  ], { dry: true, i0: 2, seed: 33 }));
}

/* Pomelo：App 图标（1024）、模块图标（64）、菜单栏小鸟（模板图，64 网格） */
function appIcon() {
  // 柚子：一张大圆纸 + 一片叶纸；笔势：果皮一圈（留口）、叶脉、果蒂
  return [
    fl(radial(512, 580, (t) => 300 * (1 + 0.04 * Math.sin(3 * t + 1)), 36), 'pBack', 0, 0, 20),
    fl([[540, 270], [610, 180], [720, 140], [800, 170], [760, 250], [660, 300]], 'pFront', 1, 10, 10),
  ].concat(strokes([
    [circlePts(512, 580, 268, 3.9, 3.9 + 5.5, 26), 46, 'head'],
    [[[560, 268], [650, 210], [740, 175], [790, 170]], 26, 'sym'],
    [[[500, 330], [505, 280], [520, 240]], 22, 'tail'],
  ], { i0: 2 }));
}
const BIRD_PAPER = [[6, 47], [16, 40], [22, 31], [31, 24], [40, 18], [48, 17], [54, 20], [62, 23], [54, 26], [51, 32], [47, 40], [38, 47], [27, 50], [16, 50]];
const BIRD_STROKES = [
  [[[6, 47], [20, 33], [34, 21], [47, 17], [61, 23]], 5.4, 'head'],
  [[[14, 50], [29, 51], [43, 45], [50, 33]], 4.2, 'sym'],
  [[[24, 39], [33, 33], [42, 33]], 3.2, 'sym'],
];
const BIRD_SIMPLE = [
  [[[5, 48], [20, 33], [34, 21], [47, 16], [62, 23]], 7.4, 'head'],
  [[[13, 51], [30, 52], [47, 42], [52, 30]], 6, 'sym'],
];
function modules() {
  return {
    todo: { label: '一步一步', els: [fl(radial(22, 44, (t) => 11 * (1 + 0.4 * Math.cos(2 * (t + 0.6))), 18), 'pBack', 0, -3, 3), fl(radial(42, 26, (t) => 11 * (1 + 0.4 * Math.cos(2 * (t + 0.6))), 18), 'pBack', 1, 3, -3)]
      .concat(strokes([[[[12, 34], [18, 40], [25, 47]], 5, 'tail'], [[[25, 47], [34, 36], [44, 24], [56, 10]], 6, 'head']], { i0: 2 })), em: [56, 10] },
    books: { label: '摸鱼读读', els: [fl([[8, 20], [30, 16], [32, 50], [10, 52]], 'pBack', 0, -3, 3), fl([[34, 16], [56, 20], [54, 52], [32, 50]], 'pFront', 1, 3, 3)]
      .concat(strokes([[[[10, 36], [22, 28], [36, 30], [46, 36], [36, 42], [22, 42], [12, 36]], 4.6, 'sym'], [[[46, 36], [54, 30], [56, 42], [46, 36]], 3.4, 'sym']], { i0: 2 })), em: [24, 34] },
    finance: { label: '钱来钱往', els: [fl(radial(32, 32, () => 20, 22), 'pBack', 0, 0, 4)]
      .concat(strokes([[circlePts(32, 32, 20, 3.4, 3.4 + 2.6, 12), 5.4, 'head'], [circlePts(32, 32, 20, 0.3, 0.3 + 2.6, 12), 5.4, 'head'], [[[26, 32], [32, 30], [38, 32]], 3, 'sym']], { i0: 1 })), em: [32, 31] },
    notes: { label: '念念不忘', els: [fl(radial(28, 38, () => 17, 20), 'pBack', 0, -4, 4)]
      .concat(strokes([[[[10, 56], [22, 42], [34, 28], [46, 16], [55, 8]], 5.4, 'head'], [[[54, 11], [48, 25], [38, 36], [25, 44]], 3.6, 'sym']], { i0: 1 })), em: [55, 8] },
    days: { label: '来日方长', els: [fl(radial(40, 30, () => 15, 20), 'pBack', 0, 0, 4), fl([[2, 58], [12, 46], [30, 42], [48, 46], [62, 42], [62, 58]], 'pFront', 1, 0, 5)]
      .concat(strokes([[[[4, 48], [20, 44], [36, 47], [52, 43], [61, 44]], 5.6, 'sym'], [circlePts(40, 30, 12, 3.3, 3.3 + 3.3, 12), 3.6, 'head']], { i0: 2 })), em: [40, 30] },
    picky: { label: '小拾', els: [fl(BIRD_PAPER, 'pBack', 0, -3, 3)].concat(strokes(BIRD_STROKES, { i0: 1 })).concat([fl(radial(46, 24, () => 2.3, 10), 'accent', 4, 0, 0)]), em: [50, 25] },
  };
}
// 菜单栏：模板图（单色），空心 = 只有笔势；实心 = 纸片剪影 + 笔势
function tray(state) {
  const eye = crPath(radial(47, 23, () => 2.6, 10), true);
  const paper = { k: 'fl', d: crPath(BIRD_PAPER, true) + eye, role: 'tpl', rule: 'evenodd', i: 0 };
  const s = strokes(BIRD_SIMPLE, { i0: 1 });
  return state === 'ready' ? [paper].concat(s.slice(1)) : s.concat([{ k: 'fl', d: crPath(radial(46, 25, () => 2.6, 10), true), role: 'tpl', i: 3 }]);
}

/* 加载：纸圆淡入 → 一笔圆相写出 → 朱红点抵达 → 淡出，循环 */
function loading() {
  return [fl(radial(66, 66, () => 30, 24), 'pBack', 0, 0, 0)].concat(strokes([[circlePts(60, 60, 34, 2.4, 2.4 + 5.6, 24), 10, 'head']], { i0: 1 })).concat([em(80, 33, 4.5)]);
}

module.exports = { setInk, CATS, icons64, icons24, deco, og, empty, pptCover, pptSection, appIcon, modules, tray, loading };
