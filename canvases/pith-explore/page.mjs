// 每一页的生成器（src/build.mjs……）都用它：一页的生成器只动自己那一页（canvases/README.md「Explore Deck 的规矩」，规矩见 _lib/page.mjs）。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePage as writeCanvasPage } from '../_lib/page.mjs';

export const PROJECT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'project');

/** 把一页写进这块画布的 project/（_lib/page.mjs 的 writePage）：boards 是 [{ file, html, x, y, w, h, title }]，html 在这里写成画板文件。 */
export const writePage = (o) => writeCanvasPage(PROJECT, o);
