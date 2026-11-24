// Tabloid：舞台。一张 1280 × 800 的桌面（.ztable，runtime.mjs 按容器的大小整张缩放），上面是桌上的信封、一本小报、
// 下面那排按钮、收进抽屉用的纸板抽屉；弹出的原记录（.pop）盖在整个容器上。结构是静态的，交互在 runtime.mjs。
import { P, handStroke, rrect } from '../../../../tooling/handmade/line.mjs';
import { atlasDefs, md } from './draw.mjs';
import { atlasPages, MARKS, SCENE_NAMES } from './pages.mjs';

const PAUSE = `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="${handStroke(P('M9 6 L9 18 M15 6 L15 18'), { amp: 0.3, seed: 31, sp: 0.8, keep: 2 })}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`;
const tip = (t) => `<span class="pm-tip" role="tooltip"><span class="pm-tip-string"></span><span class="pm-tip-tag">${t}</span></span>`;

/** 收进抽屉用的抽屉：里面（在小报后面）和前脸（在小报前面）分两层，一起拉出来、推回去。 */
function drawer(year) {
  const LN = 'var(--color-print-line)';
  const line = (c, seed, sw = 2, extra = '') => `<path d="${handStroke(c, { amp: 0.7, seed, sp: 3, keep: 3, wave: 14 })}" fill="none" stroke="${LN}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${extra}></path>`;
  const box = (x, y, w, h, r, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"></rect>`;
  const back = `${box(15, 5, 490, 90, 8, 'var(--color-kraft-inside)')}${box(15, 5, 490, 20, 6, 'rgba(60,40,10,.16)')}${line(rrect(14, 4, 492, 92, 8), 803)}`;
  const front = `${box(1, 61, 518, 198, 14, 'var(--color-kraft)')}${line(rrect(0, 60, 520, 200, 14), 812, 2.2)}${line(P('M18 71 L502 71'), 813, 2, ' opacity=".45"').replace(`stroke="${LN}"`, 'stroke="#FFFFFF"')}
${box(200, 94, 120, 20, 10, 'var(--color-kraft-flap)')}${line(rrect(200, 94, 120, 20, 10), 815)}
${box(206, 130, 108, 34, 3, 'var(--color-print-paper)')}${line(rrect(206, 130, 108, 34, 3), 817, 1.4, ' opacity=".6"')}`;
  return `<div class="drawer back" hidden aria-hidden="true"><svg width="520" height="260" viewBox="0 0 520 260">${back}</svg></div>
<div class="drawer front" hidden aria-hidden="true"><svg width="520" height="260" viewBox="0 0 520 260">${front}</svg><span class="lbl">Atlas · ${year}</span></div>`;
}

/** 整个舞台。opts.desk：先摆桌上的信封（拆开才是小报）；false 时直接是翻开的小报（从 Atlas 里「翻开」）。 */
export function stage(V, K, { desk = true } = {}) {
  const bar = `<div class="bar" hidden>
<button type="button" class="pm-btn pm-btn--icon pm-tip-host" data-hand="round" data-seed="41" data-act="prev" aria-label="上一页">${K.icon('chevron-left')}${tip('上一页')}</button>
<span class="dots" aria-hidden="true"></span>
<button type="button" class="pm-btn pm-btn--icon pm-tip-host" data-hand="round" data-seed="42" data-act="next" aria-label="下一页">${K.icon('chevron-right')}${tip('下一页')}</button>
<button type="button" class="pm-btn pm-btn--plain tog" data-hand="button" data-fill="card" data-seed="43" data-act="auto" aria-pressed="true"><span class="ic-on">${PAUSE}</span><span class="ic-off">${K.icon('play')}</span><span>自动翻</span></button>
<button type="button" class="pm-btn pm-btn--icon pm-tip-host" data-hand="round" data-seed="45" data-act="toc" aria-label="目录">${K.icon('list-checks')}${tip('目录')}</button>
<button type="button" class="pm-btn pm-btn--icon pm-tip-host" data-hand="round" data-seed="46" data-act="close" aria-label="收进抽屉">${K.icon('x')}${tip('收进抽屉')}</button>
</div>`;
  const hint = V.partial ? `「立即运行」写到 ${md(V.until)} 的，也能拆开看` : `桌上多了一个信封`;
  return `${atlasDefs()}
<div class="ztable" data-start="${desk ? 'desk' : 'book'}">
<div class="hint" data-desk>${hint}</div>
<div class="envwrap" data-desk>${K.envelope(V.year)}</div>
<div class="book rest" hidden data-at="first">${atlasPages(V, K).join('\n')}</div>
${drawer(V.year)}
${bar}
<div class="toastline" aria-live="polite"></div>
</div>
<div class="popmarks" aria-hidden="true">${MARKS.map((m) => `<span data-mk="${m}">${K.mark(m, 22)}</span>`).join('')}</div>
<div class="pop" hidden><div class="popwrap"><div class="popcard" data-theme="light"><span class="bg" aria-hidden="true"></span><div style="position:relative"><div class="poprow"><span class="popmark"></span><span class="popmod"></span><span class="popdot">·</span><span class="popdate num"></span></div><div class="poptitle" style="margin-top:8px;font-size:20px;line-height:28px;font-weight:700"></div><div class="poplines pm-long pm-scroll"></div><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><button type="button" class="pm-btn pm-btn--plain" data-hand="button" data-fill="card" data-seed="51" data-act="goto">在模块里打开</button><button type="button" class="pm-btn" data-hand="button" data-seed="52" data-act="shut">合上</button></div></div></div><span class="roll" aria-hidden="true"></span></div></div>`;
}

/** 全部的页摊开（审看用）：一页一格，下面写是哪一幕。 */
export function flat(V, K) {
  const caps = { cover: '封面', toc: '目录（只列有的幕）', spare: '凑成双数页的一页（幕数是单数时才有）', back: '封底', ...SCENE_NAMES };
  const cap = (key) => caps[key] || (V.made.get(key) ? `自建模块 · ${V.made.get(key).name}` : key);
  return `${atlasDefs()}<div class="grid still">${atlasPages(V, K).map((p, i) => `<div class="cell">${p}<div class="cap">${i + 1} · ${cap(/data-scene="([^"]+)"/.exec(p)[1])}</div></div>`).join('\n')}</div>`;
}
