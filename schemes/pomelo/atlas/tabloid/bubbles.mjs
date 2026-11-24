// Tabloid ·「和柚子聊的事」的泡泡。模型不挑泡泡：它只把话题归到一个固定的类别（Pomelo `youzi/atlas.rs` 的 TOPIC_KINDS，
// 认不出来就是 other），画什么由这里定：
//   专属的 12 个，一个类别一个（一页里同一个专属泡泡只用一次）；
//   通用的 6 个，给 other、没有专属泡泡的类别和重复的类别，轮着用，一页里不重样。
// 所以哪一年聊什么都画得出来：没聊过做饭，冒热气的泡泡就不出现；聊了没画过的话题，用通用的。
// 每个泡泡都按「在哪、多大」画（cx、cy、R：和它一样大的圆的半径），连尾巴是一笔。dir：尾巴朝左下（-1）还是右下（1）。
import { P, f, rng, rrect, circle, handStroke } from '../../../../tooling/handmade/line.mjs';
import { INK2, LINE, RULE, NIGHT, cat, soft, st, fl, deg, pline } from './draw.mjs';

/** 绕一圈的形状：rf(角度) 是那个方向的半径（0° 朝右、90° 朝下）；gap = [a0, a1]：这两个角度之间开口，接到尾巴尖 tip。 */
function around(cx, cy, rf, { gap = null, tip = null, step = 2.5 } = {}) {
  const at = (a) => [cx + Math.cos(deg(a)) * rf(a), cy + Math.sin(deg(a)) * rf(a)];
  const pts = [];
  if (gap) { for (let a = gap[1]; a <= gap[0] + 360 + 1e-6; a += step) pts.push(at(a)); pts.push(tip); }
  else for (let a = 0; a < 360; a += step) pts.push(at(a));
  return pline(pts);
}
const ovalR = (rx, ry) => (a) => (rx * ry) / Math.hypot(ry * Math.cos(deg(a)), rx * Math.sin(deg(a)));
const adiff = (a, b2) => Math.abs((((a - b2) % 360) + 540) % 360 - 180);
/** 尾巴的口子和尖：朝右下（dir 1）开在 45°–70°，朝左下开在 110°–135°。 */
const tailOf = (cx, cy, rf, dir, reach = 1.5) => {
  const gap = dir > 0 ? [45, 70] : [110, 135], a = dir > 0 ? 52 : 128;
  return { gap, tip: [cx + Math.cos(deg(a)) * rf(a) * reach, cy + Math.sin(deg(a)) * rf(a) * reach] };
};
/** 圆角方框，尾巴在下边（x0 < x1）。 */
function boxPath(x, y, w, h, r, x0, x1, tip) {
  return P(`M${x + r} ${y} L${x + w - r} ${y} Q${x + w} ${y} ${x + w} ${y + r} L${x + w} ${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} L${x1} ${y + h} L${tip[0]} ${tip[1]} L${x0} ${y + h} L${x + r} ${y + h} Q${x} ${y + h} ${x} ${y + h - r} L${x} ${y + r} Q${x} ${y} ${x + r} ${y} Z`);
}
/** 方框的尾巴：在下边靠 dir 那一侧。 */
const boxTail = (x, y, w, h, dir, len = 24) => (dir > 0 ? { x0: x + w * 0.62, x1: x + w * 0.8, tip: [x + w * 0.9, y + h + len] } : { x0: x + w * 0.2, x1: x + w * 0.38, tip: [x + w * 0.1, y + h + len] });
const body = (d, seed, fill, { sw = 1.8, amp = 0.6, stroke = LINE, dash = '' } = {}) => `${fl(d, seed, fill, { amp: amp * 0.6 })}${st(d, seed + 50, { c: stroke, sw, amp, sp: 1, keep: 2, dash })}`;

// ---------- 通用的 6 个 ----------
const GENERIC = {
  /** 圆泡 */
  oval({ cx, cy, R, seed, color, dir }) {
    const rf = ovalR(R * 1.12, R * 0.88), t = tailOf(cx, cy, rf, dir);
    return { art: body(around(cx, cy, rf, t), seed, soft(color)), tip: t.tip };
  },
  /** 方泡 */
  box({ cx, cy, R, seed, color, dir }) {
    const w = R * 2.2, h = R * 1.46, x = cx - w / 2, y = cy - h / 2, t = boxTail(x, y, w, h, dir);
    return { art: body(boxPath(x, y, w, h, Math.min(18, R * 0.34), t.x0, t.x1, t.tip), seed, soft(color), { amp: 0.45 }), tip: t.tip };
  },
  /** 云朵：一串小圆点飘出去 */
  cloud({ cx, cy, R, seed, color, dir }) {
    const d = around(cx, cy, (a) => R * 1.08 * (0.86 + 0.17 * Math.abs(Math.sin((deg(a) * 9) / 2))), { step: 2 });
    const dots = [[0.98, 0.92, 0.15], [1.32, 1.22, 0.1], [1.56, 1.44, 0.06]].map(([kx, ky, kr], i) => body(circle(cx + dir * R * kx, cy + R * ky, Math.max(2, R * kr)), seed + 3 + i, soft(color), { sw: 1.4, amp: 0.3 })).join('');
    return { art: body(d, seed, soft(color), { amp: 0.5 }) + dots, tip: [cx + dir * R * 1.56, cy + R * 1.44] };
  },
  /** 水滴：尾巴就是它的尖 */
  drop({ cx, cy, R, seed, color, dir }) {
    const at = dir > 0 ? 50 : 130;
    const rf = (a) => R * (0.98 + 0.62 * Math.max(0, 1 - adiff(a, at) / 34) ** 1.6);
    return { art: body(around(cx, cy, rf), seed, soft(color), { amp: 0.5 }), tip: [cx + Math.cos(deg(at)) * R * 1.6, cy + Math.sin(deg(at)) * R * 1.6] };
  },
  /** 票根：两边各咬一口 */
  ticket({ cx, cy, R, seed, color, dir }) {
    const w = R * 2.25, h = R * 1.4, x = cx - w / 2, y = cy - h / 2, n = Math.min(9, h * 0.16), t = boxTail(x, y, w, h, dir, 22);
    const bite = (bx, s) => Array.from({ length: 7 }, (_, i) => { const a = -90 + i * 30; return [bx + s * Math.cos(deg(a)) * n, cy + Math.sin(deg(a)) * n]; });
    const pts = [[x + 5, y], [x + w - 5, y], [x + w, y + 5], ...bite(x + w, -1), [x + w, y + h - 5], [x + w - 5, y + h], [t.x1, y + h], t.tip, [t.x0, y + h], [x + 5, y + h], [x, y + h - 5], ...bite(x, 1).reverse(), [x, y + 5]];
    return { art: body(pline(pts), seed, soft(color), { amp: 0.4 }) + st(`M${x + w * 0.24} ${y + 7} L${x + w * 0.24} ${y + h - 7}`, seed + 9, { sw: 1.1, c: INK2, dash: '3 4', op: '.6' }), tip: t.tip, dx: w * 0.08 };
  },
  /** 悄悄话：虚线的圆泡 */
  dash({ cx, cy, R, seed, color, dir }) {
    const rf = ovalR(R * 1.1, R * 0.9), t = tailOf(cx, cy, rf, dir, 1.4);
    return { art: body(around(cx, cy, rf, t), seed, soft(color), { dash: '7 6', sw: 1.7 }), tip: t.tip };
  },
};
const GENERIC_ORDER = ['oval', 'box', 'drop', 'ticket', 'cloud', 'dash'];

// ---------- 专属的 12 个：一个话题类别一个 ----------
const SPECIFIC = {
  /** 做饭、吃喝：冒热气的圆泡 */
  cook({ cx, cy, R, seed, dir, beat }) {
    const rf = ovalR(R * 1.13, R * 0.89), t = tailOf(cx, cy, rf, dir);
    const top = cy - R * 0.89;
    const steam = [0, 1, 2].map((i) => { const x = cx - R * 0.4 + i * R * 0.37, y = top - 6; return `<path class="steam" style="animation-delay:${f(beat * 0.8 + 0.4 + i * 0.7)}s" d="${handStroke(P(`M${x} ${y} C${x - 7} ${y - 6} ${x + 7} ${y - 12} ${x} ${y - 18} C${x - 6} ${y - 23} ${x + 5} ${y - 26} ${x + 1} ${y - 30}`), { amp: 0.3, seed: seed + 41 + i, sp: 0.8, keep: 2 })}" fill="none" stroke="${INK2}" stroke-width="1.6" stroke-linecap="round"></path>`; }).join('');
    return { art: body(around(cx, cy, rf, t), seed, soft('orange')) + steam, tip: t.tip };
  },
  /** 求职、面试、工作：炸开的，旁边三道紧张的线 */
  work({ cx, cy, R, seed, dir }) {
    const r = rng(seed), k = 11, ro = R * 1.15, ri = R * 0.91, tailAt = dir > 0 ? 62 : 118;
    const pts = Array.from({ length: k * 2 }, (_, i) => [-90 + (i * 180) / k + (r() - 0.5) * 7, i % 2 ? ri * (0.95 + r() * 0.1) : ro * (0.9 + r() * 0.16)]);
    let best = 1;
    pts.forEach(([a], i) => { if (i % 2 && adiff(a, tailAt) < adiff(pts[best][0], tailAt)) best = i; });
    const tip = [cx + Math.cos(deg(tailAt)) * R * 1.62, cy + Math.sin(deg(tailAt)) * R * 1.62];
    const d = pline(pts.map(([a, rr], i) => (i === best ? tip : [cx + Math.cos(deg(a)) * rr, cy + Math.sin(deg(a)) * rr])));
    const zap = [-58, -42, -26].map((a0, i) => { const a = dir > 0 ? a0 : -180 - a0; return st(`M${f(cx + Math.cos(deg(a)) * R * 1.3)} ${f(cy + Math.sin(deg(a)) * R * 1.3)} L${f(cx + Math.cos(deg(a)) * R * (1.48 + (i % 2) * 0.09))} ${f(cy + Math.sin(deg(a)) * R * (1.48 + (i % 2) * 0.09))}`, seed + 61 + i, { sw: 2 }); }).join('');
    return { art: body(d, seed, soft('grape'), { amp: 0.5 }) + zap, tip };
  },
  /** 代码、技术：一个小窗口，标题栏三个点，字后面一根闪着的光标 */
  code({ cx, cy, R, seed, dir }) {
    const w = R * 2.3, h = R * 1.46, x = cx - w / 2, y = cy - h / 2, t = boxTail(x, y, w, h, dir), bar = Math.max(14, h * 0.26);
    const dots = ['pink', 'yuzu', 'mint'].map((c, i) => { const dd = circle(x + 15 + i * 11, y + bar / 2, 3.2); return fl(dd, seed + 71 + i, c === 'yuzu' ? 'var(--color-yuzu)' : cat(c)) + st(dd, seed + 74 + i, { sw: 1 }); }).join('');
    return { art: body(boxPath(x, y, w, h, 9, t.x0, t.x1, t.tip), seed, soft('mint'), { amp: 0.45 }) + st(`M${x} ${y + bar} L${x + w} ${y + bar}`, seed + 77, { sw: 1.4 }) + dots, tip: t.tip, dy: bar / 2, after: '<span class="caret" aria-hidden="true"></span>' };
  },
  /** 旅行、出门：盖了邮戳的邮票 */
  travel({ cx, cy, R, seed, dir }) {
    const w = R * 2.25, h = R * 1.52, x = cx - w / 2, y = cy - h / 2, bite = 3.6;
    const tip = [cx + dir * w * 0.36, y + h + 26];
    const pts = [[x, y]];
    const edge = (ax, ay, bx, by, nx, ny, tail) => {
      const L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L, m = Math.max(3, Math.round(L / 13)), seg = L / m, tj = dir > 0 ? 1 : m - 2;
      for (let j = 0; j < m; j++) {
        const mx = ax + ux * seg * (j + 0.5), my = ay + uy * seg * (j + 0.5);
        if (tail && j === tj) { pts.push([mx - ux * 9, my - uy * 9], tip, [mx + ux * 9, my + uy * 9]); continue; }
        for (let s = 0; s <= 6; s++) { const a = (Math.PI * s) / 6; pts.push([mx - ux * bite * Math.cos(a) + nx * bite * Math.sin(a), my - uy * bite * Math.cos(a) + ny * bite * Math.sin(a)]); }
      }
      pts.push([bx, by]);
    };
    edge(x, y, x + w, y, 0, 1);
    edge(x + w, y, x + w, y + h, -1, 0);
    edge(x + w, y + h, x, y + h, 0, -1, true);
    edge(x, y + h, x, y, 1, 0);
    const mark = `${st(circle(x + w - 10, y + 4, 17), seed + 81, { sw: 1.3, c: INK2, op: '.55' })}${st(circle(x + w - 10, y + 4, 12), seed + 82, { sw: 1, c: INK2, op: '.45', dash: '3 3' })}`;
    return { art: body(pline(pts.slice(0, -1)), seed, soft('sky'), { amp: 0.35, sw: 1.6 }) + st(rrect(x + 11, y + 11, w - 22, h - 22, 3), seed + 83, { sw: 1, c: INK2, dash: '3 4', op: '.6' }) + mark, tip };
  },
  /** 宠物：长着耳朵和胡子 */
  pet({ cx, cy, R, seed, dir }) {
    const base = ovalR(R * 1.1, R * 0.9), earH = R * 0.56;
    const ears = (a) => [-122.5, -57.5].reduce((s, e) => s + earH * Math.max(0, 1 - adiff(a, e) / 21), 0);
    const rf = (a) => base(a) + ears(a), t = tailOf(cx, cy, base, dir, 1.6);
    const inEar = [-122.5, -57.5].map((e, i) => { const tx = cx + Math.cos(deg(e)) * (base(e) + earH * 0.62), ty = cy + Math.sin(deg(e)) * (base(e) + earH * 0.62), s = earH / 24; return fl(pline([[tx, ty], [tx - (7 - (i ? 3 : 0)) * s, ty + 13 * s], [tx + (7 - (i ? 0 : 3)) * s, ty + 12 * s]]), seed + 91 + i, cat('pink'), { op: '.45' }); }).join('');
    const whisk = [[-1, -2], [-1, 8], [1, -2], [1, 8]].map(([s, dy], i) => st(`M${cx + s * (R * 1.1 + 4)} ${cy + dy} L${cx + s * (R * 1.1 + 18)} ${cy + dy + (dy > 0 ? 4 : -3)}`, seed + 95 + i, { sw: 1.4 })).join('');
    return { art: body(around(cx, cy, rf, { gap: t.gap, tip: t.tip }), seed, soft('pink')) + inEar + whisk, tip: t.tip, dy: R * 0.06 };
  },
  /** 睡眠、熬夜：夜色的思考云，月亮和小星星 */
  sleep({ cx, cy, R, seed, dir }) {
    const d = around(cx, cy, (a) => R * 1.1 * (0.86 + 0.17 * Math.abs(Math.sin((deg(a) * 10) / 2))), { step: 2 });
    const dots = [[1.1, 0.96, 0.15], [1.48, 1.3, 0.1], [1.72, 1.54, 0.06]].map(([kx, ky, kr], i) => body(circle(cx + dir * R * kx, cy + R * ky, Math.max(2, R * kr)), seed + 101 + i, NIGHT, { sw: 1.4, amp: 0.3 })).join('');
    const mx = cx + R * 0.45, my = cy - R * 0.55, mr = Math.max(4.5, R * 0.17);
    const moon = `${fl(circle(mx, my, mr), seed + 105, 'var(--color-yuzu)', { amp: 0.2 })}${fl(circle(mx + mr * 0.54, my - mr * 0.46, mr * 0.9), seed + 106, NIGHT, { amp: 0.2 })}`;
    const tw = [[-0.62, -0.5, 7], [0.72, 0.52, 5]].map(([kx, ky, s]) => `<use href="#zspark" x="${f(cx + R * kx - s / 2)}" y="${f(cy + R * ky - s / 2)}" width="${s}" height="${s}" color="#FFFFFF" opacity=".8"></use>`).join('');
    return { art: body(d, seed, NIGHT, { amp: 0.5 }) + dots + moon + tw, tip: [cx + dir * R * 1.72, cy + R * 1.54], color: '#FFFFFF', sub: '#C9CEF0' };
  },
  /** 感情、亲密关系：一颗心，旁边飘着一颗小的。字放在心的正中（1.0.0 里偏上，顶着心口的那个尖） */
  love({ cx, cy, R, seed, dir }) {
    const heart = (ox, oy, s) => pline(Array.from({ length: 72 }, (_, i) => { const t = (i / 72) * Math.PI * 2; return [ox + s * 16 * Math.sin(t) ** 3, oy - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]; }));
    const s = (R * 1.22) / 16, oy = cy - R * 0.12;
    const small = heart(cx + dir * R * 1.16, cy - R * 0.92, s * 0.2);
    return { art: body(heart(cx, oy, s), seed, soft('pink'), { amp: 0.5 }) + fl(small, seed + 111, cat('pink'), { amp: 0.2, op: '.7' }) + st(small, seed + 112, { sw: 1.3, amp: 0.2 }), tip: [cx, oy + s * 17], dy: -R * 0.03 };
  },
  /** 钱、理财、消费：价签，打了孔、穿着线 */
  money({ cx, cy, R, seed, dir }) {
    const w = R * 2.3, h = R * 1.4, x = cx - w / 2, y = cy - h / 2, cut = h * 0.34, t = boxTail(x, y, w, h, dir, 22);
    const pts = dir > 0
      ? [[x + cut, y], [x + w - 6, y], [x + w, y + 6], [x + w, y + h - 6], [x + w - 6, y + h], [t.x1, y + h], t.tip, [t.x0, y + h], [x + cut, y + h], [x, y + h - cut], [x, y + cut]]
      : [[x + 6, y], [x + w - cut, y], [x + w, y + cut], [x + w, y + h - cut], [x + w - cut, y + h], [t.x1, y + h], t.tip, [t.x0, y + h], [x + 6, y + h], [x, y + h - 6], [x, y + 6]];
    const hx = dir > 0 ? x + cut * 0.62 : x + w - cut * 0.62, hole = circle(hx, cy, 4.2);
    const string = st(`M${hx} ${cy} C${hx - dir * 14} ${cy - 16} ${hx - dir * 8} ${cy - 30} ${hx - dir * 22} ${cy - 36}`, seed + 123, { sw: 1.4, c: INK2 });
    return { art: body(pline(pts), seed, 'var(--color-yuzu-bg)', { amp: 0.4 }) + fl(hole, seed + 121, 'var(--color-print-paper)') + st(hole, seed + 122, { sw: 1.3 }) + string, tip: t.tip, dx: dir * cut * 0.3 };
  },
  /** 学习、读书、考试：线圈本的一页 */
  study({ cx, cy, R, seed, dir }) {
    const w = R * 2.15, h = R * 1.58, x = cx - w / 2, y = cy - h / 2, t = boxTail(x, y, w, h, dir);
    const lines = Array.from({ length: Math.max(2, Math.floor((h - 26) / 13)) }, (_, i) => st(`M${x + 9} ${y + 24 + i * 13} L${x + w - 9} ${y + 24 + i * 13}`, seed + 131 + i, { sw: 1, c: RULE, amp: 0.3 })).join('');
    const nr = Math.max(3, Math.floor(w / 18));
    const rings = Array.from({ length: nr }, (_, i) => { const rx = x + 12 + (i * (w - 24)) / (nr - 1); return st(`M${rx} ${y + 6} C${rx - 5} ${y - 2} ${rx - 5} ${y - 9} ${rx} ${y - 8} C${rx + 4} ${y - 7} ${rx + 4} ${y} ${rx} ${y + 6}`, seed + 141 + i, { sw: 1.5, amp: 0.2 }); }).join('');
    return { art: body(boxPath(x, y, w, h, 5, t.x0, t.x1, t.tip), seed, '#FFFFFF', { amp: 0.4 }) + lines + rings, tip: t.tip, dy: 3 };
  },
  /** 身体、运动、健康：圆泡，下面一道心跳，角上一个十字 */
  health({ cx, cy, R, seed, dir }) {
    const rf = ovalR(R * 1.12, R * 0.9), t = tailOf(cx, cy, rf, dir);
    const bx = cx - dir * R * 0.86, by = cy - R * 0.72, badge = circle(bx, by, Math.max(8, R * 0.2)), k = Math.max(4, R * 0.1);
    const cross = `${fl(badge, seed + 151, '#FFFFFF')}${st(badge, seed + 152, { sw: 1.5 })}${st(`M${bx - k} ${by} L${bx + k} ${by} M${bx} ${by - k} L${bx} ${by + k}`, seed + 153, { sw: 2.2, c: cat('mint'), amp: 0.2 })}`;
    const ey = cy + R * 0.56, e = R * 0.16;
    const ecg = R >= 50 ? st(`M${cx - R * 0.62} ${ey} L${cx - R * 0.2} ${ey} L${cx - R * 0.1} ${ey - e} L${cx + R * 0.02} ${ey + e} L${cx + R * 0.12} ${ey - e * 0.5} L${cx + R * 0.2} ${ey} L${cx + R * 0.62} ${ey}`, seed + 154, { sw: 1.6, c: cat('mint'), amp: 0.2 }) : '';
    return { art: body(around(cx, cy, rf, t), seed, soft('mint')) + ecg + cross, tip: t.tip, dy: R >= 50 ? -R * 0.1 : 0 };
  },
  /** 心情、烦恼：下着雨的云 */
  mood({ cx, cy, R, seed, dir }) {
    const d = around(cx, cy, (a) => { const base = ovalR(R * 1.2, R * 0.82)(a); return a % 360 > 20 && a % 360 < 160 ? base * 0.97 : base * (0.9 + 0.14 * Math.abs(Math.sin((deg(a) * 9) / 2))); }, { step: 2.5 });
    const drops = [-0.55, 0, 0.55].map((k, i) => { const x = cx + R * k, y = cy + R * 0.98 + (i % 2) * 6; return st(`M${x} ${y} L${x - 4} ${y + 12}`, seed + 161 + i, { sw: 2, c: cat('sky'), amp: 0.2 }); }).join('');
    return { art: body(d, seed, soft('sky'), { amp: 0.5 }) + drops, tip: [cx - dir * 2, cy + R * 1.2] };
  },
  /** 家人、朋友：一间小房子 */
  family({ cx, cy, R, seed, dir }) {
    const hw = R * 1.02, top = cy - R * 1.16, eave = cy - R * 0.3, bot = cy + R * 0.86, t = boxTail(cx - hw, eave, hw * 2, bot - eave, dir, 22);
    const pts = [[cx, top], [cx + hw + R * 0.2, eave], [cx + hw, eave], [cx + hw, bot], [t.x1, bot], t.tip, [t.x0, bot], [cx - hw, bot], [cx - hw, eave], [cx - hw - R * 0.2, eave]];
    const chx = cx + dir * hw * 0.52, chy = top + (eave - top) * 0.52;
    const chimney = pline([[chx - 6, chy + 8], [chx - 6, chy - R * 0.36], [chx + 6, chy - R * 0.36], [chx + 6, chy + 8]]);
    return { art: fl(chimney, seed + 171, soft('orange')) + st(chimney, seed + 172, { sw: 1.5, amp: 0.3 }) + body(pline(pts), seed, soft('orange'), { amp: 0.45 }), tip: t.tip, dy: R * 0.26 };
  },
};

/** 泡泡的清单（审看和文档用）：键、名字、什么时候用。专属的键就是话题的类别。 */
export const BUBBLES = [
  ...[['oval', '圆泡'], ['box', '方泡'], ['drop', '水滴'], ['ticket', '票根'], ['cloud', '云朵'], ['dash', '悄悄话']].map(([key, name]) => ({ key, name, generic: true, when: '通用：没有专属泡泡的话题' })),
  ...[['cook', '热气', '做饭、吃喝'], ['work', '炸开', '求职、面试、工作'], ['code', '小窗口', '代码、技术'], ['travel', '邮票', '旅行、出门'], ['pet', '猫耳', '宠物'], ['sleep', '夜云', '睡眠、熬夜'], ['love', '心', '感情、亲密关系'], ['money', '价签', '钱、理财、消费'], ['study', '线圈本', '学习、读书、考试'], ['health', '心跳', '身体、运动、健康'], ['mood', '雨云', '心情、烦恼'], ['family', '小房子', '家人、朋友']].map(([key, name, when]) => ({ key, name, generic: false, when })),
];

/** 给一页的话题挑泡泡：类别有专属的、这一页还没用过就用它，否则轮着用通用的（不重样）。topics：[{ kind }]，回 [键]。 */
export function pickBubbles(topics) {
  const used = new Set();
  let g = 0;
  return topics.map((t) => {
    if (SPECIFIC[t.kind] && !used.has(t.kind)) { used.add(t.kind); return t.kind; }
    const key = GENERIC_ORDER[g % GENERIC_ORDER.length];
    g += 1;
    return key;
  });
}

/** 画一个泡泡。回 { art（放进 svg 的内容）, tip（尾巴尖，弹出来的原点）, color / sub（字的颜色，夜云是白的）, dx / dy（字要挪多少）, after（跟在名字后面的） }。 */
export function drawBubble(key, o) {
  return (SPECIFIC[key] || GENERIC[key] || GENERIC.oval)(o);
}
