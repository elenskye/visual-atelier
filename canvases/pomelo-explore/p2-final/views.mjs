// 两套小样共用的内容块。外框（A 的顶栏和纸、B3 的桌面）各自摆，内容一样才好比。
import { P, rrect, circle, handStroke, handFill, f, rng } from './lib.mjs';
import { wob, hline, vline, marker, strike, tapes, tape, glyph, icon, checkbox, chip, btn, tw, money, uid, tiltLayer } from './parts.mjs';
import { MODS, BRIEF, YEAR, TODOS, DAYS, BOOKS, NOTE, ASSETS, ENTRIES, FIN_CATS, FIN_STATS, CHATS, CARD, SUGGEST, TODAY } from './content.mjs';
import { SHELF, svg as artSvg, STYLES, pomeloGhost } from './art.mjs';
import { V } from './parts.mjs';
import { PALS, PAL_ORDER } from './parts.mjs';

const st = STYLES.hybrid;

// 卡片：白卡 + 手画边 + 胶带 + 柔和阴影 + 轻轻歪
export function card(w, h, inner, { seed = 11, tilt = -0.6, tape = true, pad = '18px 20px 16px', bg = 'var(--card)', cls = '', style = '', nTapes = 'rand' } = {}) {
  return `<div class="card ${cls}" style="position:relative;width:${w}px;height:${h}px;${style}">${tiltLayer(tilt, `<div style="position:absolute;inset:0;background:${bg};border-radius:14px;box-shadow:0 1px 2px var(--shadow),0 8px 18px var(--shadow)"></div>${wob(w, h, { r: 14, amp: 0.95, sw: 1.9, seed })}${tape ? tapes(w, h, seed, nTapes) : ''}`)}<div style="position:relative;padding:${pad};height:100%">${inner}</div></div>`;
}
export const head = (ic, title, right = '', { px = 17 } = {}) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">${ic ? icon(ic, 26, 'transform:rotate(-6deg)') : ''}<div style="font-size:${px}px;font-weight:700">${title}</div><div style="flex:1"></div>${right}</div>`;

// 圆形贴纸：白边 + 错开的填色 + 墨线
export function roundSticker(dia, cat, seed, inner, { tilt = 0 } = {}) {
  const r = dia / 2, c = circle(r + 6, r + 6, r);
  const id = uid('rs');
  return `<div style="position:relative;width:${dia}px;height:${dia}px"><svg width="${dia + 12}" height="${dia + 12}" style="position:absolute;left:-6px;top:-6px;overflow:visible;transform:rotate(${tilt}deg)" aria-hidden="true"><path d="${handFill(circle(r + 6, r + 6, r + 4.5), { amp: 0.5, seed })}" fill="var(--a-white)" style="filter:drop-shadow(0 2px 2px var(--shadow))"></path><path d="${handFill(c, { amp: 0.5, seed: seed + 1 })}" fill="var(--c-${cat}-s)" transform="translate(1.4 1.8)"></path><path d="${handStroke(c, { amp: 0.7, seed: seed + 2 })}" fill="none" stroke="var(--a-ink)" stroke-width="2.2" stroke-linecap="round"></path></svg><div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#20241F">${inner}</div></div>`;
}

// ---------- 首页的块 ----------
export function briefInner({ peel = true } = {}) {
  const lines = BRIEF.map(([a, b, c]) => `<p style="margin:0 0 4px">${a}${b ? `<span class="ch b">${b}</span>` : ''}${c}</p>`).join('');
  // 柚子贴纸拍在卡片右上角、探出卡片外；撕起来，底下是一块同形状的「印子」，悄悄话写在印子里（字不压卡片的边）。
  const S = 84;
  const face = (back) => `<svg width="${S}" height="${S}" viewBox="-6 -6 112 108" style="transform:rotate(${back ? -8 : 8}deg)${back ? ';filter:brightness(0) invert(.95) drop-shadow(0 1px 1px rgba(0,0,0,.25))' : ''}" aria-hidden="true"><use href="#pm-static"></use></svg>`;
  const sticker = peel ? `<div class="peelwrap" style="position:absolute;right:-18px;top:-30px;width:${S}px;height:${S}px;z-index:5"><div class="under" style="position:absolute;inset:0"><svg class="wob" width="${S}" height="${S}" viewBox="-6 -6 112 108" style="position:absolute;left:0;top:0;overflow:visible;transform:rotate(8deg)" aria-hidden="true">${pomeloGhost(st, { fill: 'var(--c-orange-t)', line: 'var(--pen)' })}</svg><div style="position:absolute;left:19px;top:39px;width:52px;font-size:13px;font-weight:700;line-height:17px;color:var(--pen);text-align:center">今天也<br>辛苦啦</div></div><div class="peel" role="button" tabindex="0" aria-label="撕起柚子贴纸" onPointerDown="{{peelDown}}" onPointerMove="{{dragMove}}" onPointerUp="{{dragEnd}}" onPointerCancel="{{dragEnd}}" onKeyDown="{{peelKey}}" style="position:relative;width:${S}px;height:${S}px;transform-style:preserve-3d"><div style="position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden">${face(false)}</div><div class="pbk" style="position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg)">${face(true)}</div></div></div>` : '';
  return `${sticker}${head('', '今日简报', `<button type="button" class="press i2" style="font-size:13px;margin-right:62px">重写</button>`)}<div class="pf" style="font-size:14px;line-height:1.75">${lines}</div><div class="i2" style="font-size:12px;margin-top:4px">没看：投石问路</div>`;
}
export function yearInner() {
  const cats = { read: 'sky', films: 'sky', drawing: 'pink', trip: 'orange' };
  return `<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:12px"><span style="font-size:17px;font-weight:700">2026 年</span><span class="i2" style="font-size:13px">到今天</span></div><div style="display:flex;gap:10px">${YEAR.map(([ic, n, unit, lab], i) => `<div class="press" style="display:flex;flex-direction:column;align-items:center;gap:6px">${roundSticker(80, cats[ic], 300 + i * 7, `${icon(ic, 24, 'margin-bottom:-2px')}<div style="font-size:24px;font-weight:700;line-height:1.05" class="num">${n}<span style="font-size:13px;font-weight:400;margin-left:1px">${unit}</span></div>`, { tilt: [-6, 4, -3, 7][i] })}<div class="i2" style="font-size:13px">${lab}</div></div>`).join('')}</div>`;
}
export function todoInner() {
  const rows = TODOS.map(([t, due, urgent], i) => `<button type="button" class="{{todoCls.${i}}}" onClick="{{todo.${i}}}" style="display:flex;align-items:center;gap:10px;width:100%;height:38px;font-size:16px">${checkbox(20 + i, 22)}<span class="tt" style="position:relative">${t}${strike(tw(t, 16), { seed: 40 + i })}</span><span style="flex:1"></span>${due ? `<span style="font-size:12px;color:var(--danger)">${due}</span>` : ''}</button>`).join('');
  return `${head('steps', '今天的待办', `<span class="i2 num" style="font-size:13px">{{todoN}} / 3</span>`)}<div>${rows}</div>`;
}
export function booksInner() {
  const rows = BOOKS.map(([t, p], i) => `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:15px"><span>《${t}》</span><span class="i2 num" style="font-size:13px">${p}%</span></div><div style="position:relative;width:280px;height:10px;margin-top:6px"><div style="position:absolute;left:1px;top:1px;height:8px;width:${Math.round(2.78 * p)}px;border-radius:5px;background:var(--c-sky)"></div>${wob(280, 10, { r: 5, amp: 0.4, sw: 1.4, seed: 70 + i, pad: 4 })}</div></div>`).join('');
  return `${head('read', '在读的书')}${rows}`;
}
export function daysInner() {
  const rows = DAYS.map(([n, d, left], i) => `<div style="display:flex;align-items:center;height:44px"><div><div style="font-size:15px">${n}</div><div class="i2" style="font-size:12px;margin-top:-2px">${d}</div></div><div style="flex:1"></div><div style="font-size:13px" class="i2">还有</div><div style="position:relative;z-index:0;font-size:22px;font-weight:700;margin:0 3px;min-width:${left < 10 ? 16 : 28}px;text-align:center" class="num">${left}${i === 0 ? marker(26, { seed: 81, sw: 14 }) : ''}</div><div style="font-size:13px" class="i2">天</div></div>`).join('');
  return `${head('days', '快到的日子')}${rows}`;
}
export function noteInner() {
  return `${head('memo', '念念不忘')}<div style="font-size:17px;line-height:1.7;background:repeating-linear-gradient(transparent 0 27px,var(--line) 27px 28px);padding-top:1px">${NOTE[0]}</div><div class="i2" style="font-size:12px;margin-top:6px">${NOTE[1]}</div>`;
}
export function curveSvg(w, h, seed = 90) {
  const pts = ASSETS.curve;
  const lo = Math.min(...pts) - 2, hi = Math.max(...pts) + 1;
  const xy = pts.map((v, i) => [6 + (i * (w - 12)) / (pts.length - 1), 6 + (h - 12) * (1 - (v - lo) / (hi - lo))]);
  const line = P('M' + xy.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L'));
  const area = P('M' + xy.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ` L${w - 6} ${h} L6 ${h} Z`);
  const last = xy[xy.length - 1];
  return `<svg width="${w}" height="${h}" style="display:block;overflow:visible" aria-hidden="true"><path d="${handFill(area, { amp: 0.6, seed, sp: 3, keep: 3, prec: 0 })}" fill="var(--c-mint-t)"></path><path pathLength="1" class="cline" d="${handStroke(line, { amp: 0.8, seed: seed + 1, wave: 14, sp: 1.5, keep: 3 })}" fill="none" stroke="var(--pen)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path><path d="${handFill(circle(last[0], last[1], 4.5), { amp: 0.2, seed })}" fill="#FFD23F" stroke="var(--pen)" stroke-width="1.8"></path></svg>`;
}
export function assetsInner({ curveW = 290, rows = true } = {}) {
  const acc = ASSETS.accounts.map(([n, v]) => `<div style="display:flex;justify-content:space-between;height:28px;align-items:center"><span class="i2" style="font-size:14px">${n}</span><span class="num" style="font-size:16px">${money(v, false)}</span></div>`).join('');
  return `${head('money', '总资产')}<div class="num" style="font-size:30px;font-weight:700;line-height:1.1">¥${money(ASSETS.total, false)}</div><div style="font-size:13px;color:var(--up);margin:2px 0 10px">比上次 <span class="num">+¥${money(ASSETS.diff, false)}</span></div>${curveSvg(curveW, 110)}<div class="i2" style="display:flex;justify-content:space-between;font-size:12px;margin:4px 0 8px"><span>9 月</span><span>10 月</span><span>11 月</span></div>${rows ? acc : ''}`;
}

// ---------- 钱来钱往 ----------
export const ROWS = ENTRIES.flatMap(([day, rows]) => rows.map((r) => ({ day, note: r[0], cat: r[1], acc: r[2], amt: r[3] })));
export function finHead({ x = 0 } = {}) {
  const subs = [['entries', '收支'], ['assets', '资产'], ['reports', '报表'], ['import', '导入账单']];
  let sx = 0;
  const seg = subs.map(([k, n], i) => {
    const w = tw(n, 15) + 26;
    const s = `<button type="button" class="{{subCls.${k}}}" onClick="{{sub.${k}}}" style="position:relative;width:${w}px;height:34px;font-size:15px"><span class="segon" style="position:absolute;left:4px;top:4px">${wob(w - 8, 26, { r: 8, amp: 0.5, sw: 1.4, seed: 120 + i, fill: 'var(--sel)', pad: 4 })}</span><span style="position:relative">${n}</span></button>`;
    sx += w;
    return s;
  }).join('');
  return `<div style="display:flex;align-items:center;gap:14px;height:52px">${icon('money', 40, 'transform:rotate(-8deg)')}<div style="font-size:26px;font-weight:700">钱来钱往</div><div style="position:relative;display:flex;align-items:center;padding:0 4px;margin-left:10px">${wob(sx + 8, 34, { r: 11, amp: 0.6, sw: 1.6, seed: 119, fill: 'var(--card)', pad: 4 })}${seg}</div><div style="flex:1"></div><div style="font-size:14px" class="i2">11 月 · 支出 <span class="num" style="color:var(--ink);font-size:17px">¥${money(FIN_STATS.out, false)}</span> · 收入 <span class="num" style="color:var(--ink);font-size:17px">¥${money(FIN_STATS.in, false)}</span></div></div>`;
}
export function finToolbar(w) {
  const cats = ['全部', '餐饮', '交通', '日用', '住房', '宠物', '娱乐'];
  const chips = cats.map((c, i) => i === 0 ? `<span style="position:relative;display:inline-flex;align-items:center;height:26px;padding:0 10px;font-size:14px">${wob(tw(c, 14) + 20, 26, { r: 9, amp: 0.4, sw: 1.4, seed: 130, fill: 'var(--sel)', pad: 3 })}<span style="position:relative">${c}</span></span>` : `<button type="button" class="press">${chip(c, FIN_CATS[c], { px: 13 })}</button>`).join('');
  return `<div style="display:flex;align-items:center;gap:12px;height:44px;width:${w}px"><div style="position:relative;width:200px;height:34px;display:flex;align-items:center;gap:8px;padding:0 10px" class="i2">${wob(200, 34, { r: 10, amp: 0.55, sw: 1.5, seed: 131, fill: 'var(--card)', pad: 4 })}<span style="position:relative;display:flex">${glyph('search', 17)}</span><span style="position:relative;font-size:14px">搜备注</span></div><div style="position:relative;width:146px;height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;font-size:14px">${wob(146, 34, { r: 10, amp: 0.55, sw: 1.5, seed: 132, fill: 'var(--card)', pad: 4 })}<span style="position:relative" class="num">2026 年 11 月</span><span style="position:relative;display:flex">${glyph('down', 15)}</span></div><div style="display:flex;align-items:center;gap:6px;margin-left:6px">${chips}</div><div style="flex:1"></div>${btn('记一笔', { seed: 133, icon: glyph('plus', 16) })}</div>`;
}
export function entriesTable(w, h, { seed = 140 } = {}) {
  const colCat = Math.round(w * 0.42), colAcc = Math.round(w * 0.6);
  let i = 0;
  const body = ENTRIES.map(([day, rows], di) => {
    const sum = rows.filter((r) => r[3] < 0).reduce((s, r) => s - r[3], 0);
    const dh = `<div style="display:flex;align-items:flex-end;height:38px;padding:0 24px 4px;font-size:15px"><span style="position:relative;z-index:0;font-weight:700">${day}${di === 0 ? marker(tw(day, 15) + 8, { seed: 141, sw: 10, top: '68%' }) : ''}</span><span style="flex:1"></span><span class="i2" style="font-size:12px">支出 <span class="num">${money(sum, false)}</span></span></div>`;
    const rs = rows.map((r) => {
      const k = i++;
      const amt = money(r[3]);
      return `<button type="button" class="{{rowCls.${k}}}" onClick="{{row.${k}}}" style="position:relative;display:flex;align-items:center;width:100%;height:38px;padding:0 24px;font-size:15px;z-index:0"><svg class="rmk" width="${w - 24}" height="34" viewBox="0 0 ${w - 24} 34" preserveAspectRatio="none" style="position:absolute;left:12px;top:2px;z-index:-1;overflow:visible" aria-hidden="true"><use href="#rowmk"></use></svg><span style="width:${colCat - 24}px">${r[0]}</span><span style="width:${colAcc - colCat}px">${chip(r[1], FIN_CATS[r[1]])}</span><span class="i2" style="font-size:14px">${r[2]}</span><span style="flex:1"></span><span class="num" style="font-size:18px;${r[3] > 0 ? 'color:var(--up)' : ''}">${amt}</span></button>`;
    }).join('');
    return `${dh}<div style="margin:0 20px;border-bottom:1.5px dashed var(--line)"></div>${rs}`;
  }).join('');
  const header = `<div class="i2" style="display:flex;align-items:center;height:34px;padding:0 24px;font-size:13px"><span style="width:${colCat - 24}px">备注</span><span style="width:${colAcc - colCat}px">分类</span><span>账户</span><span style="flex:1"></span><span>金额</span></div>`;
  return `<div style="position:relative;width:${w}px;height:${h}px"><div style="position:absolute;inset:0;background:var(--card);border-radius:14px;box-shadow:0 1px 2px var(--shadow),0 8px 18px var(--shadow)"></div>${wob(w, h, { r: 14, amp: 1, sw: 1.9, seed })}<div style="position:relative;height:100%;display:flex;flex-direction:column">${header}<div style="margin:0 16px">${hline(w - 32, { seed: seed + 1, sw: 1.5 })}</div><div class="tscroll" style="flex:1;overflow:auto;padding-bottom:10px">${body}</div></div></div>`;
}
export function assetsView(w, h) {
  const accs = ASSETS.accounts.map(([n, v], i) => `<div style="padding-top:10px">${card(220, 112, `<div class="i2" style="font-size:14px">${n}</div><div class="num" style="font-size:24px;font-weight:700;margin-top:8px">${money(v, false)}</div>`, { seed: 160 + i, tilt: [-1.2, 0.8, -0.5, 1.1][i], nTapes: 1 })}</div>`).join('');
  return `<div style="width:${w}px;height:${h}px;display:flex;flex-direction:column;gap:18px"><div style="display:flex;align-items:baseline;gap:14px"><span class="i2" style="font-size:15px">总资产</span><span class="num" style="font-size:40px;font-weight:700">¥${money(ASSETS.total, false)}</span><span style="font-size:14px;color:var(--up)">比上次 <span class="num">+¥${money(ASSETS.diff, false)}</span></span></div><div style="display:flex;gap:26px">${accs}</div><div style="margin-top:8px">${card(w - 40, 250, `${head('', '这三个月')}${curveSvg(w - 90, 150, 170)}<div class="i2" style="display:flex;justify-content:space-between;font-size:12px;margin-top:4px;width:${w - 90}px"><span>9 月</span><span>10 月</span><span>11 月</span></div>`, { seed: 170, tilt: -0.3, nTapes: 1 })}</div></div>`;
}
export function editPanel(w, h, { seed = 180 } = {}) {
  const cats = ['餐饮', '交通', '日用', '住房', '宠物', '娱乐'];
  const field = (lab, val, fs = 15) => `<div style="margin-bottom:14px"><div class="i2" style="font-size:12px;margin-bottom:4px">${lab}</div><div style="position:relative;height:36px;display:flex;align-items:center;padding:0 12px;font-size:${fs}px">${wob(w - 56, 36, { r: 10, amp: 0.5, sw: 1.4, seed: seed + lab.length, fill: 'var(--card)', pad: 4 })}<span style="position:relative">${val}</span></div></div>`;
  return `<div style="display:flex;align-items:center;margin-bottom:14px"><div style="font-size:18px;font-weight:700">这一笔</div><div style="flex:1"></div><button type="button" class="press" onClick="{{cancel}}" aria-label="关闭" style="display:flex">${glyph('x', 20)}</button></div>
<div class="num" style="font-size:38px;font-weight:700;line-height:1.1;margin-bottom:14px">{{prow.amt}}</div>
<div class="i2" style="font-size:12px;margin-bottom:6px">分类</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">${cats.map((c) => chip(c, FIN_CATS[c], { px: 14 })).join('')}</div>
${field('日期', '{{prow.day}}')}${field('账户', '{{prow.acc}}')}${field('备注', '{{prow.note}}')}
<div style="position:absolute;left:28px;right:28px;bottom:24px;display:flex;align-items:center">${btn('删除', { kind: 'danger', seed: 188, icon: glyph('trash', 16) })}<div style="flex:1"></div>${btn('取消', { kind: 'plain', seed: 189, onClick: 'cancel' })}<span style="width:10px"></span>${btn('保存', { seed: 190, onClick: 'save' })}</div>`;
}
// 收支表的一行高亮（荧光笔划过），所有行共用
export const rowMarkSymbol = (w) => `<symbol id="rowmk" viewBox="0 0 ${w - 24} 34" preserveAspectRatio="none"><path d="${handFill(rrect(0, 3, w - 24, 28, 9), { amp: 1.1, seed: 150, sp: 3, keep: 3 })}" fill="var(--sel)"></path></symbol>`;
export const rowData = () => ROWS.map((r) => ({ day: r.day.replace(' · ', ' '), note: r.note, acc: r.acc, amt: money(r.amt) }));

// ---------- 柚子问答 ----------
export function chatList(w) {
  const row = (t, on, i) => `<div style="position:relative;display:flex;align-items:center;height:34px;padding:0 10px;font-size:15px;z-index:0;white-space:nowrap;overflow:hidden">${on ? `<svg width="${w}" height="34" style="position:absolute;left:0;top:0;z-index:-1;overflow:visible" aria-hidden="true"><path d="${handFill(rrect(2, 3, w - 4, 28, 9), { amp: 1, seed: 200 + i, sp: 3, keep: 3 })}" fill="var(--sel)"></path></svg>` : ''}${t}</div>`;
  return `<div style="position:relative;width:${w}px;height:34px;display:flex;align-items:center;gap:8px;padding:0 10px;margin-bottom:14px" class="i2">${wob(w, 34, { r: 10, amp: 0.55, sw: 1.5, seed: 210, fill: 'var(--card)', pad: 4 })}<span style="position:relative;display:flex">${glyph('search', 17)}</span><span style="position:relative;font-size:14px">搜索对话</span></div>
<div class="i2" style="font-size:13px;margin:0 0 2px 10px">置顶</div>${CHATS.pinned.map((t, i) => row(t, false, i)).join('')}
<div class="i2" style="font-size:13px;margin:12px 0 2px 10px">最近</div>${CHATS.recent.map((t, i) => row(t, i === 0, i + 2)).join('')}`;
}
export function confirmCard() {
  const w = 400, h = 238;
  const rows = CARD.map(([k, v]) => `<div style="display:flex;height:26px;align-items:center;font-size:15px"><span class="i2" style="width:56px;font-size:13px">${k}</span><span class="${k === '金额' ? 'num' : ''}">${v}</span></div>`).join('');
  return `<div class="{{confirmCls}}" style="position:relative;width:${w}px;height:${h}px;margin:14px 0 6px">${tiltLayer(-0.6, `<div style="position:absolute;inset:0;background:var(--card);border-radius:14px;box-shadow:0 1px 2px var(--shadow),0 8px 18px var(--shadow)"></div>${wob(w, h, { r: 14, amp: 0.9, sw: 1.8, seed: 220 })}${tape({ x: 150, y: -10, w: 80, rot: 3 })}`)}<div style="position:relative;padding:16px 20px">
<div class="todo on" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">${checkbox(221, 22)}<span style="font-size:16px;font-weight:700">记一笔收支</span></div>${rows}
<div style="display:flex;align-items:center;gap:10px;margin-top:12px"><sc-if value="{{notConfirmed}}" hint-placeholder-val="{{true}}"><div style="flex:1"></div>${btn('取消', { kind: 'plain', seed: 223, h: 32, px: 14 })}${btn('确认', { seed: 224, h: 32, px: 14, onClick: 'confirm' })}</sc-if><sc-if value="{{confirmed}}" hint-placeholder-val="{{false}}"><div style="flex:1"></div><span class="i2" style="font-size:14px;animation:fadeUp .3s both">已记下 · 钱来钱往</span></sc-if></div></div>
<sc-if value="{{stampOn}}" hint-placeholder-val="{{false}}"><div class="toast" style="position:absolute;right:-26px;top:-24px">${roundSticker(78, 'mint', 225, `<div style="font-size:17px;font-weight:700">记好啦</div>`, { tilt: -5 })}</div></sc-if></div>`;
}
export const squiggle = (w = 56) => `<svg class="squig" width="${w}" height="40" viewBox="0 0 44 40" style="overflow:visible" aria-hidden="true"><path pathLength="1" d="${handStroke(P('M10 30 C4 22 12 12 20 18 C28 24 22 34 16 28 C10 20 20 6 32 10 C40 13 40 22 34 22'), { amp: 0.6, wave: 10, seed: 3, sp: 1 })}" fill="none" stroke="var(--pen)" stroke-width="2.4" stroke-linecap="round"></path></svg>`;
// 一条条消息：我问的是一张贴着的便签，柚子答的直接写在纸上
export function messages({ meCls = '', yzMark = '' } = {}) {
  return `<sc-for list="{{chat}}" as="m" hint-placeholder-count="2">
<sc-if value="{{m.me}}" hint-placeholder-val="{{false}}"><div style="display:flex;justify-content:flex-end;margin:6px 0 18px"><div class="pf me ${meCls}" style="position:relative;max-width:460px;padding:12px 16px;color:var(--ink);font-size:15px;line-height:1.65">${tiltLayer(0.7, `<div style="position:absolute;inset:0;background:var(--sel);border-radius:4px 14px 4px 14px;box-shadow:0 1px 2px var(--shadow)"></div>${tape({ x: 18, y: -9, w: 54, h: 18, rot: -6 })}`)}<span style="position:relative">{{m.text}}</span></div></div></sc-if>
<sc-if value="{{m.yz}}" hint-placeholder-val="{{false}}"><div style="margin:0 0 20px;max-width:640px">${yzMark}<sc-if value="{{m.hasPre}}" hint-placeholder-val="{{true}}"><div class="i2" style="display:flex;align-items:center;gap:4px;font-size:13px;margin-bottom:6px">${glyph('fwd', 13)}{{m.pre}}</div></sc-if><div class="pf" style="font-size:15px;line-height:1.75"><sc-for list="{{m.paras}}" as="p" hint-placeholder-count="1"><p style="margin:0 0 6px"><sc-for list="{{p.chars}}" as="c" hint-placeholder-count="0"><span class="{{c.cls}}" style="animation-delay: {{c.d}}">{{c.c}}</span></sc-for></p></sc-for></div><sc-if value="{{m.card}}" hint-placeholder-val="{{false}}">${confirmCard()}</sc-if></div></sc-if>
</sc-for>
<sc-if value="{{thinking}}" hint-placeholder-val="{{false}}"><div style="display:flex;align-items:center;gap:8px;margin:0 0 16px" class="i2">${squiggle(44)}<span style="font-size:14px">柚子在想…</span></div></sc-if>`;
}
export function askBar(w, { seed = 230 } = {}) {
  const sug = SUGGEST.map((s, i) => `<button type="button" class="press" onClick="{{sug.${i}}}" style="position:relative;height:30px;padding:0 12px;font-size:14px;display:inline-flex;align-items:center;gap:5px">${wob(tw(s, 14) + 42, 30, { r: 15, amp: 0.45, sw: 1.4, seed: seed + i, fill: 'var(--card)', pad: 3 })}<span style="position:relative;display:flex;color:var(--pen)">${glyph('sparkle', 13)}</span><span style="position:relative">${s}</span></button>`).join('');
  return `<div style="display:flex;gap:10px;margin-bottom:10px">${sug}</div><div class="field" style="position:relative;width:${w}px;height:52px;display:flex;align-items:center;gap:10px;padding:0 10px 0 16px">${wob(w, 52, { r: 14, amp: 0.7, sw: 1.8, seed: seed + 5, fill: 'var(--card)', pad: 5 })}<input aria-label="接着问柚子" placeholder="接着问…" value="{{input}}" onChange="{{onInput}}" onKeyDown="{{inKey}}" style="position:relative;flex:1;height:40px;font-size:15px" class="pf"><span style="position:relative">${btn('问', { seed: seed + 6, h: 34, px: 15, onClick: 'send', icon: glyph('up', 16) })}</span></div>`;
}

// ---------- 小样里没画的模块：空状态（画完再弹） ----------
export function stubView() {
  const shelf = artSvg(SHELF, st, V, { size: 300, view: '-6 20 252 104', k: 1.25, idp: 'shf', merge: false, anim: true, cls: 'draw shelf', over: { sp: 1.8 } });
  return `<div class="{{stubKey}}" style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center"><sc-if value="{{stubBooks}}" hint-placeholder-val="{{false}}">${shelf}</sc-if><sc-if value="{{stubOther}}" hint-placeholder-val="{{true}}"><div style="position:relative;width:150px;height:150px;display:flex;align-items:center;justify-content:center"><svg class="draw" width="150" height="150" style="position:absolute;inset:0;overflow:visible" aria-hidden="true"><path class="ol" pathLength="1" d="${handStroke(circle(75, 75, 64), { amp: 1.2, seed: 240, over: 0.08 })}" fill="none" stroke="var(--pen)" stroke-width="2.2" stroke-dasharray="1 1" stroke-linecap="round" opacity=".5"></path></svg><div class="draw pop" style="animation:popAfter .5s .5s cubic-bezier(.3,1.6,.5,1) both"><svg width="96" height="96" style="overflow:visible;animation:fadeIn .4s .3s both" aria-hidden="true"><use href="#ic-{{stub.icon}}"></use></svg></div></div></sc-if><div style="font-size:24px;animation:fadeUp .5s .7s both">{{stub.empty}}</div><div class="i2" style="font-size:14px;animation:fadeUp .5s .85s both">小样里只画了首页、钱来钱往和柚子，「{{stub.name}}」这页先空着。</div><div style="animation:fadeUp .5s 1s both">${btn('回首页', { seed: 245, onClick: 'back', icon: glyph('home', 16) })}</div></div>`;
}

// ---------- 配色：在设置里切换（小样里点齿轮） ----------
export function palettePop() {
  const sw = PAL_ORDER.map((k, i) => {
    const c = PALS[k].lt;
    return `<button type="button" class="{{palCls.${k}}}" onClick="{{pal.${k}}}" style="position:relative;display:flex;align-items:center;gap:10px;width:100%;height:40px;padding:0 12px;font-size:14px;border-radius:10px"><span style="position:relative;width:38px;height:26px;border-radius:7px;background:${c.desk};border:1.5px solid ${c.pen};flex:none"><i style="position:absolute;left:6px;top:6px;width:20px;height:13px;border-radius:3px;background:${c.paper};display:block"></i><i style="position:absolute;right:4px;bottom:3px;width:9px;height:9px;border-radius:50%;background:${c.marker};display:block"></i></span>${PALS[k].name}<span style="flex:1"></span><span class="swck" style="display:flex;color:var(--pen)">${glyph('check', 16)}</span></button>`;
  }).join('');
  const seg = (lab, cls, on) => `<button type="button" class="{{${cls}}}" onClick="{{${on}}}" style="flex:1;height:32px;padding:0 12px;border-radius:8px;font-size:14px;display:flex;align-items:center;justify-content:center">${lab}</button>`;
  return `<div style="font-size:16px;font-weight:700;margin:0 10px 8px;line-height:24px">配色</div>${sw}<div style="display:flex;gap:6px;margin:10px 4px 0;padding:4px;border-radius:10px;background:var(--desk)">${seg('浅色', 'lightCls', 'setLight')}${seg('深色', 'darkCls', 'setDark')}</div><div class="i2" style="font-size:12px;line-height:18px;margin:12px 10px 0">正式版放在设置里，这里先给你试</div>`;
}
// 配色小窗：高度按内容算好，手画的边和内容一样大
export const POP_W = 268, POP_H = 16 + 32 + 5 * 40 + 50 + 30 + 18;
export function palettePanel(right, top, seed) {
  return `<div class="popin" style="position:absolute;right:${right}px;top:${top}px;width:${POP_W}px;height:${POP_H}px;padding:16px 10px 18px;z-index:70"><div style="position:absolute;inset:0;background:var(--card);border-radius:14px;box-shadow:0 2px 4px var(--shadow),0 16px 40px var(--shadow)"></div>${wob(POP_W, POP_H, { r: 14, amp: 0.8, sw: 1.7, seed })}<div style="position:relative">${palettePop()}</div></div>`;
}
export const POP_CSS = `.sw:hover{background:color-mix(in srgb,var(--sel) 60%,transparent)}.sw.on{background:var(--sel)}.sw .swck{opacity:0}.sw.on .swck{opacity:1}.seg.on{background:var(--card);box-shadow:0 1px 3px var(--shadow)}
.sub .segon{opacity:0;transition:opacity .15s}.sub.on .segon{opacity:1}.sub.on{font-weight:700}
.erow .rmk{opacity:0;transition:opacity .12s}.erow:hover .rmk{opacity:.55}.erow.sel .rmk{opacity:1}
.todo{transition:transform .3s cubic-bezier(.3,1.6,.5,1)}.todo:active{transform:scale(.97)}`;
