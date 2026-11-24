// APCA 用 visual-atelier 装的 apca-w3（和它的 npm run qa 同一个算法）。
// 在 visual-atelier 里跑直接能找到；在别处跑生成器，设环境变量 VA_ROOT 指到 visual-atelier 的根目录。
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let mod;
try {
  mod = await import('apca-w3');
} catch {
  if (!process.env.VA_ROOT) throw new Error('找不到 apca-w3：在 visual-atelier 里跑，或者设 VA_ROOT');
  mod = await import(pathToFileURL(path.join(process.env.VA_ROOT, 'node_modules/apca-w3/src/apca-w3.js')).href);
}
/** 两个不透明颜色的 APCA 对比度（取绝对值，保留一位小数）。 */
export const lc = (fg, bg) => Math.round(Math.abs(mod.calcAPCA(fg, bg)) * 10) / 10;
