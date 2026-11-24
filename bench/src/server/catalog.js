import { listCanvases } from '../canvas/store.js';
import { listSystems } from '../ds/systems.js';
import { listMotionSchemes } from '../motion/parts.js';
import { withNames } from '../canvas/manage.js';
import { checksSub } from './checks.js';

// Everything the bench shows, in five lists (站主 2026-11-13 四类，11-14 加了 Checks), in this order everywhere: the top bar's menu, Pomelo's
// 有板有眼 (GET /api/index), `dw list`.
//   Design System   schemes/<方案>/design-system/, built into dist/        → #/ds/<方案>
//   Motion Deck     schemes/<方案>/motion/ parts                           → #/motion/<方案>
//   Explore Deck    canvases/<名字>/ with project/canvas.json              → #/<名字>
//   Questionnaire   canvases/<名字>/ that is a single page (cloud.json kind "page") → #/<名字>, alone at /c/<名字>/
//   Checks          npm run all's results (server/checks.js), one item       → #/qa/all（站主 2026-11-14 加的第五类）
const SECTIONS = [
  { id: 'ds', title: 'Design System' },
  { id: 'motion', title: 'Motion Deck' },
  { id: 'explore', title: 'Explore Deck' },
  { id: 'questionnaire', title: 'Questionnaire' },
  { id: 'checks', title: 'Checks' }
];

/** One line under a list's title: what it is and how big. */
function subOf(section, item) {
  if (section === 'ds') return item.built ? `schemes · ${item.name}` : '还没构建：npm run build:ds';
  if (section === 'motion') return `${item.parts} 个零件`;
  if (section === 'questionnaire') return '问卷页';
  if (section === 'checks') return item.sub;
  return `${item.boards} 张板${item.pages?.length > 1 ? ` · ${item.pages.length} 页` : ''}`;
}

/** Where the bench UI shows it (the part after #). */
function routeOf(section, name) {
  if (section === 'ds') return `/ds/${name}`;
  if (section === 'motion') return `/motion/${name}`;
  if (section === 'checks') return `/qa/${name}`;
  return `/${name}`;
}

export function catalog(config) {
  // the names given in the bench (bench/names.json) on top of the schemes' own; schemeTitle is the scheme's own
  const items = {
    ds: withNames(config, 'ds', listSystems(config)).map((s) => ({ name: s.name, title: s.title, ...(s.schemeTitle ? { schemeTitle: s.schemeTitle } : {}), built: s.built, cloud: s.cloud?.url || null })),
    motion: withNames(config, 'motion', listMotionSchemes(config)).map((s) => ({ name: s.name, title: s.title, ...(s.schemeTitle ? { schemeTitle: s.schemeTitle } : {}), parts: s.parts })),
    explore: [],
    questionnaire: [],
    checks: [{ name: 'all', title: 'npm run all', sub: checksSub(config) }]
  };
  for (const c of listCanvases(config)) {
    const row = { name: c.name, title: c.title, kind: c.kind, cloud: c.home?.url || null };
    if (c.kind === 'canvas') Object.assign(row, { boards: c.boards, pages: c.pages });
    else row.page = `/c/${c.name}/`;
    (items[c.deck] || items.explore).push(row);
  }
  return {
    sections: SECTIONS.map(({ id, title }) => ({
      id,
      title,
      items: items[id].map((it) => ({ ...it, sub: subOf(id, it), route: routeOf(id, it.name) }))
    }))
  };
}
