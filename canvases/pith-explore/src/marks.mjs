// R1 各张板共用的图形出口：几何只有 tooling/pith/glyphs.mjs 一份（schemes/pith/marks/ 也从它生成）。
// 类名：pith-glyph 之外，App 原来的尺寸类（ico、tyi、stg、mark）照旧留着。
import { rootImport } from '../../_lib/root.mjs';

const G = await rootImport('tooling/pith/glyphs.mjs');
export const { LOGO, ICON, TYPE, STAGE, AGENTS, svg48, homeLeaf } = G;
export const icon = (n, cls = 'ico') => G.svg48(G.ICON[n], `${cls} pith-icon pith-icon--${n}`);
export const typeIcon = (t, cls = 'tyi') => G.svg48(G.TYPE[t], `${cls} pith-type`);
export const stageIcon = (k, cls = 'stg') => G.svg48(G.STAGE[k], `${cls} pith-stage pith-stage--${['seed', 'sprout', 'evergreen'][k]}`);
/** 会长的 Logo：uid 让同一页上几个 Logo 的遮罩不撞名。 */
export const logoMark = (uid, cls = 'mark') => G.svg48(G.logoGrow(uid), `${cls} pith-logo`);
export const wordmark = () => '<span class="wm pith-wordmark">Pith</span>';
export const appIcon = (cls = 'appi') => `<span class="${cls}">${G.appIcon(G.LOGO)}</span>`;
export const agentIcon = (id, cls = '') => G.agentIcon(id, cls);
