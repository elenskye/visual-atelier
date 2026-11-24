// 有生成器的页都用它写进画布（canvases/README.md「Explore Deck 的规矩」）：一页的生成器只动自己那一页。
// canvas.json 里别的页、别的画板和便签都不碰；画板文件名带这一页的前缀，只删这一页多出来的板。
// 新的一页加在最后；已有的页名、页的先后、画布打开时落在哪一页都不改（站主在界面里能改名、删页，2026-11-13）。
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

/**
 * @param {string} project   画布的 project/ 目录
 * @param {object} o
 * @param {string} o.id      页的 id（canvas.json 的 pages[].id）
 * @param {string} o.name    页名（只在新建这一页时用）
 * @param {string} o.prefix  这一页画板文件名的前缀，比如 'Marks-'
 * @param {Array<{file: string, html?: string}>} o.boards  画板：file 带前缀；带 html 的在这里写出文件（不带的生成器已经写好），
 *                           其余属性（x、y、w、h、title……）原样写进 canvas.json
 * @param {object} [o.notes] 便签：{ 名字: { x, y, text, … } }，写成 `<页 id>-<名字>`
 */
export function writePage(project, { id, name, prefix, boards, notes = {} }) {
  for (const b of boards) if (!b.file.startsWith(prefix)) throw new Error(`${b.file} 没有前缀 ${prefix}`);
  const cpath = path.join(project, 'canvas.json');
  const canvas = JSON.parse(readFileSync(cpath, 'utf8'));
  // 删掉这一页原来有、这次没有的板；带这个前缀、哪一页都不在的也删（上次写到一半的）。别的页的板不碰，
  // 几页可以共用一个前缀（见字如面的两页都是 Notes-）。
  for (const f of readdirSync(project)) {
    if (!f.endsWith('.dc.html') || boards.some((b) => b.file === f)) continue;
    const was = canvas.boards[f];
    if (was ? was.page === id : f.startsWith(prefix)) rmSync(path.join(project, f));
  }
  // 页名以 canvas.json 为准：站主在界面里改过的不盖掉；name 只在这一页还没有时用
  if (!canvas.pages.some((p) => p.id === id)) canvas.pages.push({ id, name });
  for (const [k, b] of Object.entries(canvas.boards)) if (b.page === id) delete canvas.boards[k];
  for (const [k, n] of Object.entries(canvas.notes ?? {})) if (n.page === id) delete canvas.notes[k];
  for (const { file, html, ...rest } of boards) {
    if (canvas.boards[file]) throw new Error(`${file} 已经是别的页的画板`);
    if (html !== undefined) writeFileSync(path.join(project, file), html);
    canvas.boards[file] = { ...rest, page: id };
  }
  for (const [k, n] of Object.entries(notes)) canvas.notes[`${id}-${k}`] = { ...n, page: id };
  // 画板顺序按页排：先 pages 的顺序，同一页里照原来的先后
  const pageAt = (f) => canvas.pages.findIndex((p) => p.id === canvas.boards[f].page);
  canvas.order = [...canvas.order.filter((f) => canvas.boards[f]), ...boards.map((b) => b.file)];
  canvas.order = [...new Set(canvas.order)].sort((a, b) => pageAt(a) - pageAt(b));
  writeFileSync(cpath, JSON.stringify(canvas, null, 2) + '\n');
  return canvas;
}
