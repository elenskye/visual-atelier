// 每一页的生成器（ex1/……）都用它：一页的生成器只动自己那一页（canvases/README.md「Explore Deck 的规矩」）。
// canvas.json 里别的页、别的画板和便签都不碰；画板文件名带这一页的前缀，只删这一页多出来的板。
// 新的一页加在最后；已有的页名、页的先后、画布打开时落在哪一页都不改（站主在界面里能改名、删页）。
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'project');

/**
 * @param {object} o
 * @param {string} o.id      页的 id（canvas.json 的 pages[].id）
 * @param {string} o.name    页名（只在新建这一页时用）
 * @param {string} o.prefix  这一页画板文件名的前缀，比如 'X1-'
 * @param {Array<{file: string, html: string}>} o.boards  画板：file 带前缀，html 是内容，其余属性（x、y、w、h、title）原样写进 canvas.json
 */
export function writePage({ id, name, prefix, boards }) {
  for (const b of boards) if (!b.file.startsWith(prefix)) throw new Error(`${b.file} 没有前缀 ${prefix}`);
  const cpath = path.join(PROJECT, 'canvas.json');
  const canvas = JSON.parse(readFileSync(cpath, 'utf8'));
  for (const f of readdirSync(PROJECT)) {
    if (!f.endsWith('.dc.html') || boards.some((b) => b.file === f)) continue;
    const was = canvas.boards[f];
    if (was ? was.page === id : f.startsWith(prefix)) rmSync(path.join(PROJECT, f));
  }
  if (!canvas.pages.some((p) => p.id === id)) canvas.pages.push({ id, name });
  for (const [k, b] of Object.entries(canvas.boards)) if (b.page === id) delete canvas.boards[k];
  for (const [k, n] of Object.entries(canvas.notes ?? {})) if (n.page === id) delete canvas.notes[k];
  for (const { file, html, ...rest } of boards) {
    if (canvas.boards[file]) throw new Error(`${file} 已经是别的页的画板`);
    writeFileSync(path.join(PROJECT, file), html);
    canvas.boards[file] = { ...rest, page: id };
  }
  const pageAt = (f) => canvas.pages.findIndex((p) => p.id === canvas.boards[f].page);
  canvas.order = [...canvas.order.filter((f) => canvas.boards[f]), ...boards.map((b) => b.file)];
  canvas.order = [...new Set(canvas.order)].sort((a, b) => pageAt(a) - pageAt(b));
  writeFileSync(cpath, JSON.stringify(canvas, null, 2) + '\n');
  return canvas;
}
