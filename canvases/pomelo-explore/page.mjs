// 每一页的生成器（frame/、marks/、icons/、motion/、atlas/、notes/……）都用它：一页的生成器只动自己那一页（writePage，
// 规矩见 _lib/page.mjs），挂着 Design System 的画板用 dsBoard 写。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dcBoard } from '../_lib/board.mjs';
import { writePage as writeCanvasPage } from '../_lib/page.mjs';

export const PROJECT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'project');

/** 正文里的字：只转义 & 和 <。 */
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** 画板挂的 Design System「Pomelo 柚儿园」（project/ds/pomelo/）。 */
const DS_HEAD = `<link rel="stylesheet" href="ds/pomelo/tokens.css">
<link rel="stylesheet" href="ds/pomelo/components/bundle.css">
<script src="ds/pomelo/components/bundle.js"></script>
`;

/**
 * 一张挂着 Design System 的画板的源码：外壳是 _lib/board.mjs 的 dcBoard，<head> 引 ds/pomelo/ 的三个文件，
 * helmet 里一段 <style>（css）。script 是 data-dc-script 里的全部代码（class Component extends DCLogic { … }，前面可以放别的）。
 */
export const dsBoard = ({ title, css, body, props, script }) => dcBoard({ title, head: DS_HEAD, helmet: `<style>\n${css}\n</style>\n`, body, props, script: `\n${script}` });

/** 把一页写进这块画布的 project/（_lib/page.mjs 的 writePage）：boards 是 [{ file, x, y, w, h, title… }]，画板文件由生成器自己写；notes 是这一页的便签。 */
export const writePage = (o) => writeCanvasPage(PROJECT, o);
