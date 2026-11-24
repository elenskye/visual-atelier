// Tabloid：年度小报这一份设计的入口。挂到一个容器里，照一份「呈现结果」画出来、动起来。
// 冻结成快照时（tooling/atlas/build.mjs）这几个模块连同画好的柚子、贴纸、信封、当时的 Design System 样式和上墨的脚本
// 打成一个文件，以后不再改。Pomelo 把它放在一个 frame 里（tabloidFrame 是那个 frame 的文档）：和审看画布是同一个环境，
// 外面的样式进不来，里面的也出不去。
import { CSS } from './style.mjs';
import { makeKit } from './kit.mjs';
import { prepare, popData } from './pages.mjs';
import { stage } from './shell.mjs';
import { start } from './runtime.mjs';

/**
 * host：放它的元素（用它所在的文档）。raw：一份「呈现结果」（../README.md「数据」）。
 * opts：assets（画好的 SVG，快照里自带）；desk（先摆信封，默认 true；false 直接是翻开的小报）；backdrop（自己铺一层桌面）；
 *   palette / theme（'light' | 'dark'）/ reduce（减弱动态效果）；paint(root)（给手画的框上墨，默认用这个文档里的
 *   Pomelo.paint）；hooks（runtime.mjs）。
 * 回 { root, set({ palette, theme, reduce }), destroy() }。
 */
export function mountTabloid(host, raw, opts = {}) {
  const doc = host.ownerDocument, win = doc.defaultView;
  const V = prepare(raw), K = makeKit(opts.assets);
  const root = doc.createElement('div');
  root.className = 'pm root';
  root.style.cssText = 'position:absolute;inset:0';
  const set = (o) => {
    if (o.palette != null) root.dataset.palette = o.palette;
    if (o.theme != null) root.dataset.theme = o.theme;
    if (o.reduce != null) root.dataset.motion = o.reduce ? 'reduce' : 'full';
  };
  set({ palette: opts.palette, theme: opts.theme, reduce: !!opts.reduce });
  root.innerHTML = (opts.backdrop ? '<div class="pm-desk zdesk" data-hand="desk" data-seed="760"></div>' : '') + stage(V, K, { desk: opts.desk !== false });
  host.appendChild(root);
  // 手画的框要等东西露出来、有了大小才画得上（下面那排按钮、弹出的纸条一开始是藏着的）：藏和露一变就再上一遍墨。
  // 上墨自己也会改页面，再跑一遍发现没什么可画就停了。
  const ink = opts.paint || ((el) => win.Pomelo && win.Pomelo.paint(el));
  let queued = false;
  const paint = () => { queued = false; if (root.isConnected) ink(root); };
  const watch = typeof win.MutationObserver === 'function' ? new win.MutationObserver(() => { if (!queued) { queued = true; win.requestAnimationFrame(paint); } }) : null;
  if (watch) watch.observe(root, { subtree: true, attributes: true, attributeFilter: ['hidden', 'data-theme', 'data-palette'] });
  paint();
  const run = start(root, popData(V), opts.hooks || {});
  return {
    root,
    set(o) { set(o); paint(); run.sync(); },
    destroy() { if (watch) watch.disconnect(); run.stop(); root.remove(); },
  };
}
export const TABLOID_CSS = CSS;
/** 桌上的那个信封（首页新年第一周摆的，只是画，点了做什么由摆它的地方定）。 */
export const tabloidEnvelope = (assets, year) => makeKit(assets).envelope(year).replace(' data-act="open"', '');
/** 放小报的 frame 的文档：Design System 的样式（ds）、这份设计的样式、上墨的脚本（painter），body 是空的，等着挂。 */
export const tabloidFrame = (ds, painter) => `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${ds}</style><style>html,body{margin:0;height:100%;overflow:hidden;background:transparent}.zdesk{position:absolute;inset:0}${CSS}</style><script>${painter}<\/script></head><body></body></html>`;
