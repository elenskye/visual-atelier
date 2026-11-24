// Tabloid 1.1.0 加的两种页（站主 2026-11-16 在 Pomelo 的云端画布「Atlas 新的几幕」上批的）：
// - 玩物有志（紧跟书影相遇）：掌机屏幕上是最喜欢的一部，卡带盒里竖着插这一年通关的，玩了不止一遍的书脊上盖小红章；
//   下面三个数和一行「玩到二周目以上」（一个都没有就不出这一行）。
// - 自建模块的一幕（五花八门、循序渐进建的模块，一个模块一页）：程序不定死样子，这里给十个零件、三种排法；柚子照
//   SKILL 挑（Pomelo `youzi/made.rs`），数字由 Pomelo 填好，这里照 `plan` 画。没有柚子的排法时画 `made[].plan`（默认的）。
import { P, f, rrect, circle } from '../../../../tooling/handmade/line.mjs';
import { PW, PH, INK, INK2, CATS, cat, soft, st, fl, svg, fmt, b, esc, clip, hash, tape, slip, roll, page, head, say, recBtn, useStar } from './draw.mjs';

/** 自建模块能戴的贴纸（Pomelo src/modules/custom/icons.ts 的 MADE_MARKS，一个图标一张）：打包时带上。 */
export const MADE_MARKS = ['shapes', 'checklist', 'game', 'music', 'headphones', 'camera', 'tv', 'coffee', 'bowl', 'bag', 'gift', 'shirt', 'plane', 'mountain', 'leaf', 'sprout', 'dumbbell', 'heart', 'star', 'grad', 'translate', 'code', 'puzzle', 'trophy'];

const starRow = (x, y, n, size = 15, gap = 2) => Array.from({ length: 5 }, (_, i) => (i < n ? useStar('zgold', x + i * (size + gap), y, size) : useStar('zstar', x + i * (size + gap), y, size, 'color:var(--color-print-rule)'))).join('');
const inkSpan = (t, size = 14) => `<span style="font-size:${size}px;line-height:${Math.round(size * 1.5)}px">${t}</span>`;
const box = (x, y, w, h, inner, extra = '') => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}">${inner}</div>`;
/** 数字底下柚黄的一笔。 */
const markLine = (x, y, w, seed) => box(x, y, w, 12, svg(w, 12, st(`M2 6 L${w - 2} 6`, seed, { c: 'var(--color-yuzu)', sw: 9, amp: 0.8 })), 'opacity:.75');

/** 十二个月一排小条：最多的那个月是柚黄，头上写几个。 */
function monthBars(x, y, w, h, values, seed, bb, { label = '', unit = '' } = {}) {
  const vals = Array.from({ length: 12 }, (_, i) => Number(values?.[i]) || 0);
  const max = Math.max(...vals, 1), gap = 6, bw = (w - gap * 11) / 12, top = vals.indexOf(max);
  const bars = vals.map((v, i) => {
    const bh = Math.max(3, (v / max) * (h - 34)), bx = x + i * (bw + gap), by = y + h - 18 - bh;
    return `${fl(rrect(bx, by, bw, bh, 3), seed + i, i === top ? 'var(--color-yuzu)' : soft(CATS[i % 5]), { amp: 0.3 })}${i === top ? st(rrect(bx, by, bw, bh, 3), seed + 20 + i, { sw: 1.3, amp: 0.3 }) : ''}`;
  }).join('');
  const nums = vals.map((v, i) => `<span class="num" style="position:absolute;left:${f(x + i * (bw + gap))}px;top:${y + h - 16}px;width:${f(bw)}px;text-align:center;font-size:10px;line-height:14px;color:${i === top ? INK : INK2};font-weight:${i === top ? 700 : 400}">${i + 1}</span>`).join('');
  const peak = `<span class="num" style="position:absolute;left:${f(x + top * (bw + gap) - 20)}px;top:${f(y + h - 18 - (h - 34) - 18)}px;width:${f(bw + 40)}px;text-align:center;font-size:11px;line-height:16px;font-weight:700">${fmt(max)} ${esc(unit)}</span>`;
  return `<div ${b(bb, 'fade')}>${label ? `<span style="position:absolute;left:${x}px;top:${y - 22}px;font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">${esc(label)}</span>` : ''}${svg(PW, PH, bars)}${nums}${max > 0 ? peak : ''}</div>`;
}

// ---------- 玩物有志 ----------

const GAME_TINT = { 解谜: 'mint', 冒险: 'sky', 模拟经营: 'pink', 动作: 'orange', 角色扮演: 'grape', 剧情: 'grape', 休闲: 'mint' };
const RUN_NAMES = ['', '', '二周目', '三周目', '四周目', '五周目', '六周目', '七周目', '八周目'];
const runName = (n) => RUN_NAMES[n] || `${n} 周目`;
const tallyOf = (list, key) => Object.entries(list.reduce((a, g) => (g[key] ? ((a[g[key]] = (a[g[key]] || 0) + 1), a) : a), {})).sort((a, c) => c[1] - a[1]);
/** 盖在书脊上、写在下面那一行里的小红章：几周目。 */
const runStamp = (n, size = 10.5) => `<span style="flex:none;display:inline-block;padding:0 5px;border:1.5px solid var(--color-danger);border-radius:4px;font-size:${size}px;line-height:${size + 4}px;font-weight:700;color:var(--color-danger);transform:rotate(-4deg);opacity:.9">${runName(n)}</span>`;

/** 掌机：屏幕上是最喜欢的一部（柚子挑的那条，没挑就评分最高的）；卡带盒里竖着插这一年通关的（多于七个只插评分最高的七个，
 *  先后不变，下面写还有几个）；三个数和一行「二周目以上」。 */
export function gamesPage(V) {
  const games = V.snap.games || [];
  const picked = (V.scene('games').refs || []).map((k) => games.find((g) => g.key === k)).find(Boolean);
  const fav = picked || [...games].sort((a, c) => (c.rating || 0) - (a.rating || 0))[0];
  const kinds = tallyOf(games, 'kind'), plats = tallyOf(games, 'platform');
  const again = games.filter((g) => g.runs >= 2).sort((a, c) => c.runs - a.runs);
  const x = 40, y = 102, w = 176, h = 268;
  const bodyP = rrect(0, 0, w, h, 18);
  const art = `${fl(bodyP, 3000, soft('pink'), { amp: 0.6 })}${st(bodyP, 3001, { sw: 2.2, amp: 0.6 })}${fl(rrect(16, 18, w - 32, 112, 8), 3002, '#3B4A3A', { amp: 0.3 })}${fl(rrect(26, 28, w - 52, 92, 4), 3003, '#C9DDB0', { amp: 0.3 })}${st(rrect(16, 18, w - 32, 112, 8), 3004, { sw: 1.6, amp: 0.3 })}
${fl(P('M40 168 L52 168 L52 156 L64 156 L64 168 L76 168 L76 180 L64 180 L64 192 L52 192 L52 180 L40 180 Z'), 3005, INK, { amp: 0.15 })}${fl(circle(126, 166, 9), 3006, 'var(--color-cat-pink)', { amp: 0.3 })}${st(circle(126, 166, 9), 3007, { sw: 1.4, amp: 0.3 })}${fl(circle(148, 184, 9), 3008, 'var(--color-cat-pink)', { amp: 0.3 })}${st(circle(148, 184, 9), 3009, { sw: 1.4, amp: 0.3 })}
${st('M60 226 L80 220 M96 226 L116 220', 3010, { sw: 4, c: '#9C8C99', amp: 0.2 })}${[0, 1, 2].map((i) => st(`M${120 + i * 9} 248 L${128 + i * 9} 238`, 3011 + i, { sw: 1.4, amp: 0.1 })).join('')}`;
  const screen = fav ? `<span style="position:absolute;left:26px;top:30px;width:${w - 52}px;text-align:center;font-size:11px;line-height:16px;color:#3B4A3A">最喜欢的一部</span><span style="position:absolute;left:30px;top:50px;width:${w - 60}px;text-align:center;font-size:19px;line-height:26px;font-weight:700;color:#24301F;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(fav.title)}</span>${fav.rating ? `<span style="position:absolute;left:${f(w / 2 - 44)}px;top:84px;width:90px;height:18px">${starRow(0, 0, fav.rating, 15, 3)}</span>` : ''}` : '';
  const hand = `<div ${b(1, 'grow', `transform-origin:${x + w / 2}px ${y + h}px`)}>${fav ? recBtn(fav.key, `left:${x}px;top:${y}px;width:${w}px;height:${h}px`, `<span aria-hidden="true" style="position:absolute;inset:0;transform:rotate(-3deg)">${svg(w, h, art)}${screen}</span>`, `打开原记录：${fav.title}`) : ''}</div>`;
  // 最喜欢的一定在，其余按评分挑满七个；盒子里还是通关的先后
  const keep = new Set([fav, ...games.filter((g) => g !== fav).sort((a, c) => (c.rating || 0) - (a.rating || 0))].filter(Boolean).slice(0, 7));
  const inBox = games.filter((g) => keep.has(g)), more = games.length - inBox.length;
  const boxX = 238, boxY = 116, boxW = 188, slotH = 31, boxH = slotH * inBox.length + 20 + (more ? 22 : 0);
  const boxArt = svg(PW, PH, `${fl(rrect(boxX, boxY, boxW, boxH, 8), 3100, 'var(--color-kraft)', { amp: 0.5, op: '.55' })}${st(rrect(boxX, boxY, boxW, boxH, 8), 3101, { sw: 1.8, amp: 0.5 })}`);
  const spines = inBox.map((g, i) => {
    const c = GAME_TINT[g.kind] || CATS[i % 5], sy = boxY + 10 + i * slotH;
    return `<div ${b(f(2 + i * 0.25))}>${recBtn(g.key, `left:${boxX + 10}px;top:${sy}px;width:${boxW - 20}px;height:${slotH - 5}px`, `<span aria-hidden="true" style="position:absolute;inset:0">${svg(boxW - 20, slotH - 5, `${fl(rrect(0, 0, boxW - 20, slotH - 5, 4), 3120 + i, g === fav ? 'var(--color-yuzu)' : soft(c), { amp: 0.3 })}${st(rrect(0, 0, boxW - 20, slotH - 5, 4), 3140 + i, { sw: 1.2, amp: 0.3 })}`)}</span><span style="position:relative;display:flex;align-items:center;gap:6px;height:${slotH - 5}px;padding:0 9px;font-size:13px;line-height:18px;white-space:nowrap"><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">${esc(g.title)}</span>${g.runs >= 2 ? runStamp(g.runs, 9.5) : ''}${g.platform ? `<span style="font-size:10.5px;color:${INK2}">${esc(g.platform)}</span>` : ''}</span>`, `打开原记录：${g.title}`)}</div>`;
  }).join('');
  const rest = more ? `<div ${b(f(2 + inBox.length * 0.25))}><span class="num" style="position:absolute;left:${boxX}px;top:${boxY + boxH - 26}px;width:${boxW}px;text-align:center;font-size:11.5px;line-height:18px;color:${INK2}">还有 ${more} 个</span></div>` : '';
  const sy0 = Math.max(390, boxY + boxH + 18);
  const last = V.snap.gamesLast;
  const col = (label, big, small) => `<div style="flex:1;min-width:0"><div style="font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">${label}</div>${big}<div class="num" style="font-size:11px;line-height:16px;color:${INK2};white-space:nowrap">${small}</div></div>`;
  const cols = [
    col('通关', `<div style="display:flex;align-items:baseline;gap:3px"><span style="font-size:34px;line-height:40px;font-weight:700">${roll(String(games.length), 4, 40)}</span>${inkSpan('个', 14)}</div>`, last != null ? `去年 ${last} 个` : ''),
    kinds[0] ? col('最常玩的类型', `<div style="font-size:20px;line-height:40px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(kinds[0][0])}</div>`, `${kinds[0][1]} 个${kinds[1] ? ` · 其次是${esc(kinds[1][0])}` : ''}`) : '',
    plats[0] ? col('最常用的平台', `<div style="font-size:20px;line-height:40px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(plats[0][0])}</div>`, `${plats[0][1]} 个`) : '',
  ].join('');
  const stats = `<div ${b(4)}>${box(40, sy0, 386, 76, `<div style="display:flex;gap:18px">${cols}</div>`)}</div>`;
  const againRow = again.length ? `<div ${b(4.6)}>${box(40, sy0 + 84, 386, 24, `<div style="display:flex;align-items:center;gap:8px;font-size:13px;line-height:22px;white-space:nowrap;overflow:hidden"><span style="color:${INK2}">玩到二周目以上</span><span class="num" style="font-weight:700">${again.length} 个</span><span aria-hidden="true" style="color:${INK2}">·</span>${again.slice(0, 3).map((g) => `<span style="display:inline-flex;align-items:center;gap:4px">${esc(clip(g.title, 8))}${runStamp(g.runs)}</span>`).join('')}</div>`)}</div>` : '';
  return page('games', `${head('玩物有志', `这一年通关 ${games.length} 个，最喜欢的插在掌机里`)}${hand}${boxArt}${spines}${rest}${stats}${againRow}${say(sy0 + (again.length ? 120 : 92), V.scene('games').lines, 6)}`);
}

// ---------- 自建模块的一幕 ----------

/** 三种排法的位置（一页 460 × 600，页头占到 90，柚子的话在 SAY_Y）：H 宽的大块、A B 两半、S 一条、Q 一张纸条。 */
export const LAYOUTS = {
  hero: { H: [34, 98, 392, 178], S: [34, 300, 392, 92], Q: [34, 408, 392, 98] },
  pair: { A: [34, 98, 186, 178], B: [240, 98, 186, 178], S: [34, 300, 392, 92], Q: [34, 408, 392, 98] },
  list: { H: [34, 98, 392, 296], A: [34, 412, 186, 92], B: [240, 412, 186, 92] },
};
const SAY_Y = 522;

/** 十个零件：(x, y, w, h, 数据, 种子, 第几拍) → 一块 HTML。数据由 Pomelo 填好（形状见 ../README.md「自建模块」）。 */
export const MADE_PARTS = {
  /** 大数字：一年几条（或某个数字字段的合计），有去年就写去年。 */
  big(x, y, w, h, d, seed, bb) {
    const size = h >= 150 && w >= 300 ? 72 : h >= 150 ? 56 : 40;
    return `<div ${b(bb)}>${box(x, y, w, h, `<div style="font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">${esc(d.label)}</div>
<div style="display:flex;align-items:baseline;gap:5px"><span style="font-size:${size}px;line-height:${size + 6}px;font-weight:700">${roll(fmt(d.n), bb, size + 6)}</span>${inkSpan(esc(d.unit || ''), 16)}</div>
${d.last != null ? `<div class="num" style="font-size:11.5px;line-height:17px;color:${INK2};white-space:nowrap">${d.n === d.last ? '和去年一样' : `比去年${d.n > d.last ? '多' : '少'} ${fmt(Math.abs(d.n - d.last))} ${esc(d.unit || '')}`} · 去年 ${fmt(d.last)}</div>` : ''}`)}${markLine(x + 2, y + 18 + size - 4, Math.min(w - 10, 30 + String(fmt(d.n)).length * size * 0.55), seed)}</div>`;
  },
  /** 和去年比：两条，今年柚黄，去年复写纸蓝。 */
  compare(x, y, w, h, d, seed, bb) {
    const max = Math.max(d.n, d.last, 1), bw = w - 70;
    const wa = Math.max(4, (d.n / max) * bw), wz = Math.max(4, (d.last / max) * bw);
    return `<div ${b(bb)}>${box(x, y, w, h, `<div style="font-size:12px;line-height:18px;color:${INK2}">${esc(d.label)}</div>
<div style="position:relative;height:${h - 24}px">${svg(w, h, `${fl(rrect(0, 14, wa, 16, 7), seed, 'var(--color-yuzu)', { amp: 0.3 })}${fl(rrect(0, 50, wz, 11, 5), seed + 1, '#E6ECF8', { amp: 0.3 })}${st(rrect(0, 50, wz, 11, 5), seed + 2, { sw: 1, c: '#5B6FA8', amp: 0.3 })}`)}
<span class="num" style="position:absolute;left:${f(wa + 8)}px;top:10px;font-size:16px;line-height:24px;font-weight:700;white-space:nowrap">${fmt(d.n)} ${esc(d.unit || '')}</span><span class="num" style="position:absolute;left:${f(wz + 8)}px;top:44px;font-size:11px;line-height:22px;color:#5B6FA8;white-space:nowrap">去年 ${fmt(d.last)}</span></div>`)}</div>`;
  },
  /** 一排星：评分最高的几条，点了看那一条。 */
  stars(x, y, w, h, d, seed, bb) {
    const rows = (d.items || []).slice(0, Math.max(1, Math.floor((h - 24) / 40)));
    return `<div ${b(bb)}>${box(x, y, w, 22, `<div style="font-size:12px;line-height:18px;color:${INK2}">${esc(d.label)}</div>`)}${rows.map((it, i) => `<div ${b(f(bb + 0.3 + i * 0.3))}>${recBtn(it.key, `left:${x}px;top:${y + 24 + i * 40}px;width:${w}px;height:36px`, `<span aria-hidden="true" style="position:absolute;inset:0;border-radius:8px;background:${i === 0 ? 'var(--color-print-cream)' : 'transparent'}"></span><span style="position:relative;display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;white-space:nowrap"><span class="num" style="width:14px;font-size:12px;color:${INK2}">${i + 1}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:15px;line-height:22px;font-weight:${i === 0 ? 700 : 400}">${esc(it.title)}</span><span style="position:relative;width:${5 * 16}px;height:14px">${starRow(0, 0, it.rating, 14, 2)}</span></span>`, `打开原记录：${it.title}`)}</div>`).join('')}</div>`;
  },
  /** 分布条：单选、多选字段里各有几条；最多的在最上面。 */
  dist(x, y, w, h, d, seed, bb) {
    const rows = (d.rows || []).slice(0, Math.max(2, Math.floor((h - 24) / 26))), max = Math.max(1, ...rows.map((r) => r.n)), lw = Math.min(70, w * 0.32), bw = w - lw - 34;
    return `<div ${b(bb)}>${box(x, y, w, 22, `<div style="font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">${esc(d.label)}</div>`)}${rows.map((r, i) => `<div ${b(f(bb + 0.2 + i * 0.2))}><span style="position:absolute;left:${x}px;top:${y + 24 + i * 26}px;width:${f(lw)}px;font-size:13px;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.name)}</span>${svg(PW, PH, fl(rrect(x + lw + 4, y + 28 + i * 26, Math.max(6, (r.n / max) * bw), 12, 6), seed + i, i === 0 ? cat(CATS[(seed + i) % 5]) : soft(CATS[(seed + i) % 5]), { amp: 0.3 }))}<span class="num" style="position:absolute;left:${f(x + lw + 10 + (r.n / max) * bw)}px;top:${y + 24 + i * 26}px;font-size:12px;line-height:20px;color:${INK2}">${r.n}</span></div>`).join('')}</div>`;
  },
  /** 十二个月的小条。 */
  months(x, y, w, h, d, seed, bb) {
    return monthBars(x, y + 22, w, h - 22, d.values, seed, bb, { label: d.label, unit: d.unit || '' });
  },
  /** 条目卡：几张贴着的小纸片，写名字和一两个字段。高的位置、条目不多一条一张宽纸片竖着贴；别的一排三张。 */
  cards(x, y, w, h, d, seed, bb) {
    const items = d.items || [];
    const slipOf = (it, i, cx, cy, cw, ch, wide) => { const rot = [-1.5, 1.2, -1, 1.5, -1.2, 1][i]; return `<div ${b(f(bb + i * 0.35))}>${recBtn(it.key, `left:${f(cx)}px;top:${f(cy)}px;width:${f(cw)}px;height:${f(ch)}px`, `${slip(rot)}${i % 2 ? '' : tape(wide ? cw - 90 : cw / 2 - 26, -9, 52, -5, i % 4 ? 1 : 0)}<span style="position:absolute;left:0;top:0;right:0;display:block;padding:12px 14px 0;text-align:left"><span style="display:block;font-size:${wide ? 16 : 15}px;line-height:22px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.title)}</span>${(it.sub || []).map((t) => `<span style="display:block;font-size:${wide ? 12.5 : 11.5}px;line-height:${wide ? 19 : 17}px;color:${INK2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t)}</span>`).join('')}${it.rating ? `<span style="position:relative;display:block;height:16px;margin-top:3px">${starRow(0, 0, it.rating, 13, 2)}</span>` : ''}</span>`, `打开原记录：${it.title}`)}</div>`; };
    if (h >= 200 && items.length <= 4) { const n = Math.max(1, items.length), ch = Math.min(88, (h - 12 * (n - 1)) / n); return items.map((it, i) => slipOf(it, i, x + 4, y + 4 + i * (ch + 12), w - 8, ch, true)).join(''); }
    const n = Math.min(items.length, w >= 300 ? 3 : 1), cw = (w - (n - 1) * 12) / Math.max(1, n), ch = Math.min(h - 8, 92);
    return items.slice(0, n).map((it, i) => slipOf(it, i, x + (i % n) * (cw + 12), y + 4, cw, ch, false)).join('');
  },
  /** 引用：条目长文字里的一句，或者课节备注里的一句。 */
  quote(x, y, w, h, d, seed, bb) {
    return `<div ${b(bb)}>${recBtn(d.key, `left:${x + 8}px;top:${y + 8}px;width:${w - 16}px;height:${h - 16}px`, `${slip(-1.5)}${tape(w / 2 - 40, -9, 64, 4, 1)}<span style="position:relative;display:block;padding:14px 18px 0;text-align:left"><span style="display:block;font-size:15px;line-height:24px;max-height:48px;overflow:hidden">「${esc(clip(d.text, 40))}」</span><span style="display:block;margin-top:4px;font-size:11px;line-height:16px;color:${INK2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.from)}</span></span>`, '打开原记录')}</div>`;
  },
  /** 合计：数字字段加起来，打成一张小票。 */
  sum(x, y, w, h, d, seed, bb) {
    const rows = (d.rows || []).slice(0, Math.max(1, Math.floor((h - 70) / 20)));
    const zig = `polygon(0 0,100% 0,100% calc(100% - 6px),${Array.from({ length: 13 }, (_, i) => `${f(100 - (i * 100) / 12)}% ${i % 2 ? '100%' : 'calc(100% - 6px)'}`).join(',')})`;
    return `<div ${b(bb)}><div style="position:absolute;left:${x + 8}px;top:${y}px;width:${w - 16}px;height:${h}px"><span aria-hidden="true" style="position:absolute;inset:0;background:#FFFFFF;box-shadow:0 1px 2px rgba(0,0,0,.16);transform:rotate(1.2deg);clip-path:${zig}"></span><div style="position:relative;padding:10px 14px 0"><div style="font-size:12px;line-height:18px;color:${INK2};text-align:center">${esc(d.label)}</div>${rows.map(([n, v]) => `<div style="display:flex;gap:6px;font-size:12.5px;line-height:20px;white-space:nowrap"><span style="overflow:hidden;text-overflow:ellipsis">${esc(n)}</span><span aria-hidden="true" style="flex:1;border-bottom:1.5px dotted var(--color-print-rule);transform:translateY(-5px)"></span><span class="num">${fmt(v)}</span></div>`).join('')}<div style="margin-top:4px;border-top:1.5px dashed var(--color-print-rule);display:flex;justify-content:space-between;align-items:baseline;padding-top:4px;font-weight:700"><span style="font-size:13px">合计</span><span class="num" style="font-size:20px;line-height:28px;white-space:nowrap">${roll(fmt(d.total), bb + 0.5, 28)} <span style="font-size:12px;font-weight:400">${esc(d.unit || '')}</span></span></div></div></div></div>`;
  },
  /** 学的几门（循序渐进）：一门一根进度条，这一年学的那段颜色深，学完的盖一个小金星。 */
  courses(x, y, w, h, d, seed, bb) {
    const rows = (d.items || []).slice(0, Math.max(1, Math.floor((h - 26) / 44))), bw = w - 8;
    return `<div ${b(bb)}>${box(x, y, w, 22, `<div style="font-size:12px;line-height:18px;color:${INK2}">${esc(d.label)}</div>`)}${rows.map((c, i) => {
      const yy = y + 26 + i * 44, total = Math.max(1, c.total), fw = Math.max(8, (c.done / total) * bw), yr = Math.max(0, (c.year / total) * bw);
      const done = c.finished ? ` · ${Number(c.finished.slice(5, 7))} 月学完` : '';
      return `<div ${b(f(bb + 0.3 + i * 0.4))}>${recBtn(c.key, `left:${x}px;top:${yy}px;width:${w}px;height:40px`, `<span style="position:absolute;left:0;top:0;right:0;display:flex;align-items:baseline;gap:6px;font-size:14px;line-height:20px;white-space:nowrap"><span style="font-weight:700;overflow:hidden;text-overflow:ellipsis">${esc(c.name)}</span><span class="num" style="font-size:11px;color:${INK2}">${c.done}/${c.total} ${esc(d.unit || '')}${done}</span></span><span aria-hidden="true" style="position:absolute;left:0;top:24px;width:${bw}px;height:12px">${svg(bw, 12, `${fl(rrect(0, 1, bw, 10, 5), seed + i * 3, 'var(--color-print-cream)', { amp: 0.2 })}${fl(rrect(0, 1, fw, 10, 5), seed + i * 3 + 1, soft(CATS[i % 5]), { amp: 0.25 })}${yr ? fl(rrect(Math.max(0, fw - yr), 1, Math.min(yr, fw), 10, 5), seed + i * 3 + 2, cat(CATS[i % 5]), { amp: 0.25 }) : ''}${st(rrect(0, 1, bw, 10, 5), seed + 40 + i, { sw: 1.1, amp: 0.2 })}`)}</span>${c.finished ? useStar('zgold', bw - 6, 14, 20, 'transform:rotate(12deg)') : ''}`, `打开原记录：${c.name}`)}</div>`;
    }).join('')}</div>`;
  },
  /** 多选的词：一个词一张圆贴纸，用得多的大；词和数字两行、一起放在圆的正中，四周至少留 6 像素（圆按字的大小撑开）。
   *  一行放不下换行，每行在位置里横着居中；放不下就从用得最少的起不放。 */
  chips(x, y, w, h, d, seed, bb) {
    const rows = d.rows || [], max = Math.max(1, ...rows.map((r) => r.n)), room = h - 26, gap = 10, FW = 13, NW = 11, LH = 17, NH = 15;
    const sized = rows.map((r, i) => {
      const tw = Math.max([...String(r.name)].length * FW, String(r.n).length * NW * 0.62), need = Math.hypot(tw + 12, LH + NH + 12);
      return { r, i, s: Math.min(Math.max(need, 56 + (r.n / max) * 18), Math.max(need, room)) };
    });
    const pack = (list) => { const ls = [[]]; let lw = 0; for (const c of list) { if (lw && lw + gap + c.s > w) { ls.push([]); lw = 0; } ls[ls.length - 1].push(c); lw += (lw ? gap : 0) + c.s; } return ls.filter((l) => l.length); };
    const tall = (ls) => ls.reduce((a, l) => a + Math.max(...l.map((o) => o.s)), 0) + 6 * (ls.length - 1);
    let keep = [...sized].sort((a, c) => c.r.n - a.r.n), lines = pack(sized);
    while (keep.length > 1 && tall(lines) > room) { keep = keep.slice(0, -1); lines = pack(sized.filter((o) => keep.includes(o))); }
    let cy = y + 26;
    const out = lines.map((line) => {
      const lh = Math.max(...line.map((o) => o.s)), total = line.reduce((a, o) => a + o.s, 0) + gap * (line.length - 1);
      let cx = x + (w - total) / 2;
      const html = line.map(({ r, i, s }) => {
        const left = cx, top = cy + (lh - s) / 2;
        cx += s + gap;
        return `<div ${b(f(bb + i * 0.2), 'grow', `transform-origin:${f(left + s / 2)}px ${f(top + s / 2)}px`)}><span style="position:absolute;left:${f(left)}px;top:${f(top)}px;width:${f(s)}px;height:${f(s)}px">${svg(s, s, `${fl(circle(s / 2, s / 2, s / 2 - 1), seed + i, soft(CATS[i % 5]), { amp: 0.4 })}${st(circle(s / 2, s / 2, s / 2 - 1), seed + 20 + i, { sw: 1.2, amp: 0.4 })}`)}<span style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;white-space:nowrap"><span style="font-size:${FW}px;line-height:${LH}px">${esc(r.name)}</span><span class="num" style="font-size:${NW}px;line-height:${NH}px;color:${INK2}">${r.n}</span></span></span></div>`;
      }).join('');
      cy += lh + 6;
      return html;
    }).join('');
    return `<div ${b(bb)}>${box(x, y, w, 22, `<div style="font-size:12px;line-height:18px;color:${INK2}">${esc(d.label)}</div>`)}</div>${out}`;
  },
};

/** 一个自建模块的一页：右上角是它的贴纸，照排法把零件放进位置，最下面柚子的话。不认识的排法、零件、位置都跳过。 */
export function madePage(V, K, key) {
  const m = V.made.get(key);
  if (!m) return '';
  const sc = V.scene(key), plan = sc.plan || m.plan || { layout: 'hero', parts: [] };
  const L = LAYOUTS[plan.layout] || LAYOUTS.hero, list = m.template !== 'progress';
  const parts = (plan.parts || []).filter((p) => L[p.slot] && MADE_PARTS[p.part]).map((p, i) => { const [x, y, w, h] = L[p.slot]; return MADE_PARTS[p.part](x, y, w, h, p.data || {}, 3500 + (hash(key) % 300) + i * 100, 1 + i * 1.2); }).join('');
  const sub = `${list ? '五花八门' : '循序渐进'} · 这一年${list ? `记了 ${fmt(m.n)} 条` : `学完 ${fmt(m.n)} ${m.lessonWord || '课节'}`}`;
  return page(key, `<div style="position:absolute;right:30px;top:26px;line-height:0;transform:rotate(8deg)">${K.mark(m.mark, 44)}</div>${head(esc(m.name), esc(sub))}${parts}${say(SAY_Y, sc.lines, (plan.parts || []).length + 1)}`);
}
