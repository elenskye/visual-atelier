// 见字如面贴纸没选上的两个方案（A 漂流瓶、C 字里的笑脸），留作记录。站主 2026-11-13 挑了 B 纸飞机，
// 已搬进 schemes/pomelo/marks/art.mjs（MODULE_ICONS.articles）；19 个新图标也已搬进 icons.mjs（batch 3）。
import { rootImport } from '../../_lib/root.mjs';

const { P, rrect, rotate, ellipse } = await rootImport('tooling/handmade/line.mjs');

// ---------- 模块贴纸：三个方案（64 格，薄荷「日常」，和 MODULE_ICONS 同样的写法），站主挑一个 ----------
// 不画纸、笔、本子这些字面上的东西（站主 11-13：太浅显），画「字能把人带到眼前」：
// A 漂流瓶（写下的话漂到对方那里）、B 纸飞机（一封信飞出去，后面拖着一圈虚线）、C 字里的笑脸（纸上的字排成一张脸）。
const turn = (parts, cx, cy, deg) => parts.map((p) => ({ ...p, d: rotate(p.d, cx, cy, deg) }));

export const DRAFT_STICKERS = {
  'notes-a': {
    name: '见字如面 · A 漂流瓶', cat: 'mint', parts: [
      ...turn([
        { t: 'shape', d: P('M28 9 L36 9 L36 17 C42 19 45 23 45 29 L45 46 C45 50 42 52 38 52 L26 52 C22 52 19 50 19 46 L19 29 C19 23 22 19 28 17 Z'), fill: 'catLight', seed: 831 },
        { t: 'shape', d: rrect(26.5, 3, 11, 8, 2.5), fill: 'wood', sw: 0.9, seed: 832 },
        { t: 'shape', d: rrect(24.5, 27, 15, 20, 3), fill: 'white', sw: 0.8, seed: 833 },
        { t: 'shape', d: rrect(30.2, 25.5, 3.6, 23, 1.2), fill: 'yellow', sw: 0.7, seed: 834 },
        { t: 'line', d: P('M23 21 L23 25'), sw: 0.55, seed: 835 },
      ], 32, 30, -34),
      { t: 'shape', d: P('M3 52 C9 48 14 56 20 52 C26 48 31 56 37 52 C43 48 48 56 54 52 C57 50.4 59 50.4 61 51.5 L61 58 C42 61 22 61 3 58 Z'), fill: 'cat', seed: 836 },
      { t: 'line', d: P('M14 57 L22 57 M34 58 L44 58'), sw: 0.55, seed: 838 },
      { t: 'shape', d: P('M52 6 Q52.6 12 58 12.6 Q52.6 13.2 52 19 Q51.4 13.2 46 12.6 Q51.4 12 52 6 Z'), fill: 'yellow', sw: 0.7, amp: 0.3, seed: 837 },
    ],
  },
  'notes-c': {
    name: '见字如面 · C 字里的笑脸', cat: 'mint', parts: [
      ...turn([
        { t: 'shape', d: rrect(9, 11, 46, 47, 7), fill: 'catLight', seed: 851 },
        { t: 'line', d: P('M19 29 C21.5 25.5 25 25.5 27.5 29 M36.5 29 C39 25.5 42.5 25.5 45 29'), sw: 0.9, seed: 852 },
        { t: 'line', d: P('M21 38 C26 46 38 46 43 38'), sw: 0.9, seed: 853 },
        { t: 'blush', d: ellipse(17.5, 37, 3.6, 2.3), seed: 854 },
        { t: 'blush', d: ellipse(46.5, 37, 3.6, 2.3), seed: 855 },
        { t: 'line', d: P('M18 51 C21 49 23 53 26 51 C29 49 31 53 34 51 C37 49 39 53 42 51 L46 51'), sw: 0.6, seed: 856 },
      ], 32, 34, -7),
      { t: 'shape', d: rotate(rrect(21, 4.5, 22, 9, 2), 32, 9, 8), fill: 'yellow', sw: 0.8, seed: 857 },
    ],
  },
};
// 画板上三个并排：B 是方案里的 modules/articles。
export const STICKER_PICK = ['notes-a', 'articles', 'notes-c'];
