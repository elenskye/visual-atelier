// Round 2：笔势的单维度变体 + 笔势×剪纸融合
const { crPath, brush, dryBrush, radial, circlePts } = require('./lib');
const CATS = [['write', '写作'], ['project', '项目'], ['gallery', '画廊'], ['create', '创作'], ['travel', '游记'], ['other', '其他']];

// 笔画数据：[中心线, 最大宽, 收笔类型]
const S = {
  write: [[[[11, 56], [20, 44], [32, 29], [43, 17], [53, 8]], 5.2, 'head'], [[[52, 11], [47, 25], [37, 36], [24, 44]], 3.6, 'sym'], [[[14, 57], [30, 54], [44, 56], [54, 53]], 2.8, 'sym']],
  project: [[[[18, 59], [18, 34], [18, 7]], 3.6, 'tail'], [[[20, 11], [29, 6], [39, 12], [50, 8]], 5, 'sym'], [[[21, 27], [30, 23], [40, 29], [50, 25]], 3.8, 'sym']],
  gallery: [[[[13, 13], [12, 33], [13, 52], [33, 52], [52, 51]], 4.2, 'head'], [[[16, 12], [34, 12], [52, 13], [52, 30], [51, 46]], 3.2, 'tail'], [[[17, 45], [25, 34], [31, 40], [39, 28], [48, 43]], 3.6, 'sym']],
  create: [[[[31, 22], [21, 15], [10, 18], [10, 33], [11, 47]], 4, 'head'], [[[33, 22], [43, 15], [54, 18], [54, 33], [53, 47]], 4, 'head'], [[[11, 47], [22, 44], [32, 51], [43, 44], [53, 47]], 3, 'sym']],
  travel: [[[[5, 49], [16, 32], [22, 38], [32, 18], [43, 36], [49, 30], [59, 45]], 5, 'sym'], [circlePts(50, 13, 5, -1.2, 4.4, 10), 2.8, 'head']],
  other: [[circlePts(32, 32, 21, 2.6, 2.6 + Math.PI * 1.85, 22), 7, 'head']],
};
// 简笔：每类 1–2 笔
const SIMPLE = {
  write: [[[[10, 57], [20, 45], [32, 30], [43, 18], [54, 8]], 6, 'head'], [[[16, 57], [32, 54], [52, 55]], 3, 'sym']],
  project: [[[[18, 59], [18, 34], [18, 7]], 3.8, 'tail'], [[[20, 13], [30, 6], [40, 16], [52, 9]], 6.4, 'sym']],
  gallery: [[[[14, 12], [12, 32], [13, 52], [33, 52], [52, 51]], 4.6, 'head'], [[[18, 44], [26, 33], [32, 40], [40, 27], [50, 43]], 4.4, 'sym']],
  create: [[[[9, 20], [21, 14], [32, 22], [43, 14], [55, 20]], 5.2, 'sym'], [[[10, 46], [22, 43], [32, 51], [43, 43], [54, 46]], 4, 'sym']],
  travel: [[[[4, 50], [16, 32], [22, 38], [32, 16], [43, 36], [49, 30], [60, 46]], 6.2, 'sym']],
  other: [[circlePts(32, 32, 21, 2.6, 2.6 + Math.PI * 1.85, 22), 8, 'head']],
};
const EM = { write: [54, 53], project: [18, 5], gallery: [42, 21], create: [32, 16], travel: [50, 13], other: [32, 32] };
const EM_SIMPLE = { write: [53, 55], project: [18, 5], gallery: [44, 20], create: [32, 32], travel: [51, 12], other: [32, 32] };

function strokes(set, { wScale = 1, ink = 'clean', seed = 3 } = {}) {
  return set.map(([pts, w, prof], i) => ({ k: 'br', d: ink === 'dry' ? dryBrush(pts, w * wScale, prof, seed + i * 7) : brush(pts, w * wScale, prof), c: crPath(pts), w: w * wScale * 1.9, i }));
}
function icons(opts = {}) {
  const out = {};
  for (const [k] of CATS) {
    const set = (opts.simple ? SIMPLE : S)[k];
    const em = (opts.simple ? EM_SIMPLE : EM)[k];
    out[k] = strokes(set, { ...opts, seed: k.length * 11 }).concat([{ k: 'em', cx: em[0], cy: em[1], r: k === 'other' ? 3 : 2.6 }]);
  }
  return out;
}
// 装饰（560×220）
const DECO = [[[[120, 170], [220, 140], [320, 160], [420, 120], [540, 104]], 11, 'sym'], [[[250, 96], [330, 76], [420, 84], [500, 58]], 6, 'sym'], [circlePts(480, 150, 14, 3.5, 3.5 + 5.5, 12), 4, 'head']];
const deco = (opts = {}) => strokes(DECO, opts);

/* ---- 笔势 × 剪纸 ---- */
const fl = (pts, role, i, dx, dy) => ({ k: 'fl', d: typeof pts === 'string' ? pts : crPath(pts, true), role, i, dx, dy });
const PAPER = {
  write: [fl(radial(26, 40, () => 18, 20), 'pBack', 0, -4, 4)],
  project: [fl(radial(37, 30, () => 19, 20), 'pBack', 0, 4, 4)],
  gallery: [fl('M18,14H48Q54,14 54,20V48Q54,54 48,54H20Q14,54 14,48V20Q14,14 18,14Z', 'pBack', 0, 3, 3)],
  create: [fl(radial(32, 34, () => 22, 22), 'pBack', 0, 0, 4)],
  travel: [fl([[2, 58], [8, 46], [18, 36], [28, 42], [38, 30], [50, 40], [62, 44], [62, 58]], 'pBack', 0, 0, 5)],
  other: [fl(radial(36, 36, () => 19, 22), 'pBack', 0, 3, 3)],
};
function fusionIcons() {
  const base = icons({ wScale: 1 });
  const out = {};
  for (const [k] of CATS) out[k] = PAPER[k].concat(base[k].map((e) => e.k === 'br' ? { ...e, i: e.i + 1 } : e));
  return out;
}
const fusionDeco = () => [
  fl([[180, 220], [230, 170], [300, 120], [370, 140], [430, 90], [500, 110], [560, 80], [560, 220]], 'pBack', 0, 0, 10),
  fl([[260, 220], [320, 180], [400, 170], [470, 140], [560, 150], [560, 220]], 'pFront', 1, 0, 10),
].concat(strokes([[[[150, 196], [260, 182], [380, 192], [500, 172], [556, 176]], 9, 'sym'], [circlePts(470, 54, 16, 3.5, 3.5 + 5.6, 14), 4.5, 'head']]).map((e) => ({ ...e, i: e.i + 2 })));
const fusionOG = () => [
  fl([[420, 630], [520, 520], [640, 420], [760, 470], [880, 300], [1000, 360], [1120, 260], [1200, 280], [1200, 630]], 'pBack', 0, 0, 20),
  fl([[560, 630], [680, 560], [820, 540], [960, 470], [1080, 500], [1200, 450], [1200, 630]], 'pFront', 1, 0, 20),
].concat(strokes([[[[440, 590], [620, 560], [800, 585], [980, 545], [1180, 560]], 22, 'sym'], [circlePts(1010, 150, 50, 3.5, 3.5 + 5.5, 18), 12, 'head']]).map((e) => ({ ...e, i: e.i + 2 })));
const fusionEmpty = () => [
  fl([[30, 200], [80, 150], [140, 130], [200, 150], [260, 120], [320, 140], [320, 200]], 'pBack', 0, 0, 8),
  fl([[90, 200], [150, 175], [220, 170], [320, 160], [320, 200]], 'pFront', 1, 0, 8),
].concat(strokes([[[[40, 172], [120, 162], [200, 170], [290, 158]], 6, 'sym'], [circlePts(220, 62, 20, 3.3, 3.3 + 5.4, 14), 5, 'head']]).map((e) => ({ ...e, i: e.i + 2 })));

module.exports = { CATS, icons, deco, fusionIcons, fusionDeco, fusionOG, fusionEmpty };
