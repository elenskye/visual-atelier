// Tabloid：Atlas 页上一年一张的封面（1.0.2 起，每一版定稿画自己的封面）。是小报头版缩小的样子：报头和两道线、
// 年份、柚黄的一笔、几颗纸星星、柚子、顶上一条胶带；角上一个小框印着这是哪一版设计（Tabloid 1.0.2）；
// 没过完的年盖一个红章「截至某日」。
// 它不在 frame 里，直接摆在 Pomelo 的页上：只用行内样式和 Design System 的变量，不带 <style>，里面的 id 每张换一个编号。
// 印出来的纸按浅色画（里面那层 data-theme="light"），纸的影子跟桌面的明暗走（外面那层不改明暗）。
import { f, rrect } from '../../../../tooling/handmade/line.mjs';
import { st, fl, svg, tape, md, esc, soft, starPath, LINE } from './draw.mjs';
import { makeKit } from './kit.mjs';

export const COVER_W = 168, COVER_H = 218;
let coverSeq = 0;

/** assets：快照里画好的 SVG。o：year、until（没过完的年写到哪天；null 是全年）、name、version（打包时快照自己填）。
 *  回一段 HTML：168 × 218 的一张封面。摆它的地方管歪不歪、叠不叠、点了做什么。 */
export function tabloidCover(assets, o = {}) {
  const K = makeKit(assets, `c${++coverSeq}-`);
  const W = COVER_W, H = COVER_H;
  const year = esc(o.year ?? ''), until = o.until || null;
  const edition = esc(`${o.name || 'Tabloid'} ${o.version || ''}`.trim());
  const star = (x, y, r, rot, seed, c) => `<g transform="translate(${x} ${y}) rotate(${rot})">${fl(starPath(r, 0.56), seed, c, { amp: 0.25 })}</g>`;
  const art = [
    st(`M14 35 L${W - 14} 35`, 3101, { sw: 1.7, amp: 0.4 }),
    st(`M14 39.5 L${W - 14} 39.5`, 3102, { sw: 0.8, amp: 0.3, op: '.7' }),
    st('M17 104 L100 104', 3103, { c: 'var(--color-yuzu)', sw: 7, amp: 0.8 }),
    star(150, 56, 7.5, -14, 3111, soft('pink')),
    star(156, 84, 5, 12, 3112, soft('sky')),
    star(140, 110, 4.5, 30, 3113, soft('mint')),
    `${fl(rrect(13, H - 34, 88, 22, 4), 3121, 'var(--color-print-paper)', { amp: 0.25 })}${st(rrect(13, H - 34, 88, 22, 4), 3122, { sw: 1.3, amp: 0.3, c: LINE })}`,
  ].join('');
  const stamp = until
    ? `<span style="position:absolute;left:14px;top:120px;padding:0 6px;border:1.6px solid var(--color-danger);border-radius:5px;transform:rotate(-6deg);font-size:11px;line-height:18px;font-weight:700;color:var(--color-danger);white-space:nowrap">截至 ${md(until)}</span>`
    : `<span style="position:absolute;left:15px;top:118px;font-size:11px;line-height:16px;color:var(--color-print-ink-soft)">这一年<br>都在这本里了</span>`;
  return `<span class="zcover" style="position:relative;display:block;width:${W}px;height:${H}px;text-align:left;line-height:normal">`
    + `<span aria-hidden="true" style="position:absolute;inset:0;border-radius:3px 7px 7px 3px;background:var(--color-print-cream);box-shadow:inset 10px 0 12px -10px rgba(0,0,0,.2),0 1px 2px rgba(0,0,0,.18),3px 10px 18px var(--color-shadow)"></span>`
    + `<span data-theme="light" style="position:absolute;inset:0;color:var(--color-print-ink)">`
    + svg(W, H, art)
    + `<span style="position:absolute;left:14px;top:14px;font-size:12px;line-height:18px;font-weight:700;white-space:nowrap">柚子的年度小报</span>`
    + `<span style="position:absolute;left:12px;top:46px;font-size:46px;line-height:1;font-weight:700;letter-spacing:1px;font-variant-numeric:tabular-nums">${year}</span>`
    + stamp
    + `<span style="position:absolute;right:6px;bottom:12px;width:60px;height:58px;line-height:0;transform:rotate(-8deg)">${K.face('wow', 60)}</span>`
    + `<span style="position:absolute;left:13px;bottom:12px;width:88px;font-size:11px;line-height:22px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums">${edition}</span>`
    + tape(f(W / 2 - 28), -8, 56, 3)
    + `</span></span>`;
}
