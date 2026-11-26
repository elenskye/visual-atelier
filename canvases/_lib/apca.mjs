// 画布生成器共用的对比度检查（APCA，apca-w3）。门槛照 CLAUDE.md 核心约定 9：正文 Lc ≥ 75，次要文字与交互色 Lc ≥ 60，明暗都验。
// 探索页（EX）只提示、不挡；优化页（R）和方案必须过（canvases/README.md「两档门槛」）：lc 只给数值，提示还是停下由生成器定。
import { rootPackage } from './root.mjs';

const { calcAPCA } = await rootPackage('apca-w3');

/** 一对颜色的 APCA 对比度（绝对值）。颜色写 #rrggbb。 */
export const lc = (fg, bg) => Math.abs(calcAPCA(fg, bg));

