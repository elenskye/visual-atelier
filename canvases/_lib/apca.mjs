// 画布生成器共用的对比度检查（APCA，apca-w3）。门槛照 CLAUDE.md 核心约定 9：正文 Lc ≥ 75，次要文字与交互色 Lc ≥ 60，明暗都验。
// 探索页（EX）只提示、不挡；优化页（R）和方案必须过（canvases/README.md「两档门槛」）：checkPairs 只给结果，提示还是停下由生成器定。
import { rootPackage } from './root.mjs';

const { calcAPCA } = await rootPackage('apca-w3');

/** 一对颜色的 APCA 对比度（绝对值）。颜色写 #rrggbb。 */
export const lc = (fg, bg) => Math.abs(calcAPCA(fg, bg));

/**
 * 查一组配对。pairs：[{ label, fg, bg, need }]（fg、bg 是色值）。
 * 返回 { checked, fails: [{ label, fg, bg, lc, need }], min: { label, lc, need } }，min 是离门槛最近的一对。
 */
export function checkPairs(pairs) {
  const fails = [];
  let min = null;
  for (const p of pairs) {
    const v = lc(p.fg, p.bg);
    if (v < p.need) fails.push({ ...p, lc: v });
    if (!min || v - p.need < min.lc - min.need) min = { label: p.label, lc: v, need: p.need };
  }
  return { checked: pairs.length, fails, min };
}
