// Tabloid 1.1.1 加的两幕「写下的字」（见字如面这一年，站主 2026-11-16 在 Pomelo 的云端画布「Atlas 新的几幕」第三轮批的，树顶挑 B）：
// - 写下的字（紧跟留下的日子）：几篇、多少字、和去年比；标签长成一棵树（中间一根树干，主标签是左右伸出去的枝，子标签是枝上的小枝，
//   枝头垂一个柚子，柚子大小是篇数、不写数字；树干下面挂一块小木牌，写没打标签的几篇）；十二支铅笔，一个月一支，写得越多削得越短。
// - 重要的时刻：柚子挑的几篇。第一篇里抄的那句写进稿纸，其余像书签夹在本子里（左边一截写日子），最后是柚子的附言。
// 数据：snapshot.writing（数字、十二个月、标签），记录 kind `article`（键 article:12，`tags` 是那篇的标签），
// 第二幕的 refs 是柚子挑的几篇、quotes 是每篇抄的一句（Pomelo 核对过是原文）、lines 是附言。
import { P, f, rrect, circle, ellipse } from '../../../../tooling/handmade/line.mjs';
import { PW, PH, INK, INK2, CATS, cat, soft, st, fl, svg, fmt, b, esc, clip, pline, md, tape, slip, roll, page, head, recBtn } from './draw.mjs';

const BARK = '#B98A55', LEAF = cat('mint'), VEIN = soft('mint');
const pt = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
const dirOf = (deg) => [Math.sin((deg * Math.PI) / 180), -Math.cos((deg * Math.PI) / 180)];
const angOf = (d) => Math.atan2(d[0], -d[1]) * 57.3;
const textW = (str, px) => [...str].reduce((a, ch) => a + (/[　-鿿＀-￯]/.test(ch) ? px : px * 0.6), 0);
const wBox = (x, y, w, h, inner, extra = '') => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}">${inner}</div>`;
const wInk = (t, size = 14) => `<span style="font-size:${size}px;line-height:${Math.round(size * 1.5)}px">${t}</span>`;
const wMark = (x, y, w, seed) => wBox(x, y, w, 12, svg(w, 12, st(`M2 6 L${w - 2} 6`, seed, { c: 'var(--color-yuzu)', sw: 9, amp: 0.8 })), 'opacity:.75');

/** 三次曲线上的点和方向。 */
function bez(p0, c1, c2, p1, t) {
  const u = 1 - t, x = u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0], y = u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1];
  const dx = 3 * u * u * (c1[0] - p0[0]) + 6 * u * t * (c2[0] - c1[0]) + 3 * t * t * (p1[0] - c2[0]), dy = 3 * u * u * (c1[1] - p0[1]) + 6 * u * t * (c2[1] - c1[1]) + 3 * t * t * (p1[1] - c2[1]), l = Math.hypot(dx, dy) || 1;
  return { p: [x, y], d: [dx / l, dy / l] };
}
/** 一根枝（树干也是）：沿中线从粗到细的一整块，头上是圆的。w(t) 是 t 处的宽。 */
function limb(p0, c1, c2, p1, w) {
  const n = 14, L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const { p, d } = bez(p0, c1, c2, p1, i / n), h = w(i / n) / 2;
    L.push([p[0] - d[1] * h, p[1] + d[0] * h]);
    R.push([p[0] + d[1] * h, p[1] - d[0] * h]);
  }
  const { d } = bez(p0, c1, c2, p1, 1), h = w(1) / 2;
  return pline([...L, [p1[0] + d[0] * h, p1[1] + d[1] * h], ...R.reverse()]);
}
/** 一片叶子：从 base 朝 deg 长出去，杏仁形，中间一条叶脉。 */
function leaf(base, deg, l, seed, { w = 0.42, op = '' } = {}) {
  const d = dirOf(deg), nrm = [-d[1], d[0]], tip = pt(base, d, l), mid = pt(base, d, l * 0.48);
  const shape = P(`M${f(base[0])} ${f(base[1])} Q${f(mid[0] + nrm[0] * l * w)} ${f(mid[1] + nrm[1] * l * w)} ${f(tip[0])} ${f(tip[1])} Q${f(mid[0] - nrm[0] * l * w)} ${f(mid[1] - nrm[1] * l * w)} ${f(base[0])} ${f(base[1])} Z`);
  const vein = pt(base, d, l * 0.8);
  return `${fl(shape, seed, LEAF, { amp: 0.25, op })}${st(shape, seed + 1, { sw: 1.3, amp: 0.25 })}${st(`M${f(base[0])} ${f(base[1])} L${f(vein[0])} ${f(vein[1])}`, seed + 2, { sw: 1, c: VEIN, amp: 0.15 })}`;
}
/** 一个柚子：挂在 tip 下面（果柄从 tip 垂下来插进果子的顶），柄上一片叶子朝 side 那边。 */
function yuzu(tip, r, side, seed) {
  const stem = 4 + r * 0.25, c = [tip[0] + side * 1.5, tip[1] + stem + r];
  const top = [c[0], c[1] - r + 1.5];
  const body = ellipse(c[0], c[1], r * 1.04, r);
  return `${st(`M${f(tip[0])} ${f(tip[1])} Q${f(tip[0] + side * 2)} ${f(tip[1] + stem * 0.6)} ${f(top[0])} ${f(top[1])}`, seed, { sw: 1.6, amp: 0.1 })}
${fl(body, seed + 1, 'var(--color-yuzu)', { amp: 0.3 })}${st(body, seed + 2, { sw: 1.5, amp: 0.3 })}
${st(`M${f(c[0] - r * 0.55)} ${f(c[1] - r * 0.15)} Q${f(c[0] - r * 0.5)} ${f(c[1] - r * 0.6)} ${f(c[0] - r * 0.1)} ${f(c[1] - r * 0.68)}`, seed + 3, { sw: 1.4, c: '#FFFFFF', amp: 0.1, op: '.85' })}
${fl(circle(top[0], top[1] + 0.5, 1.6), seed + 4, LEAF)}${leaf(tip, side > 0 ? 70 : -70, 9 + r * 0.55, seed + 5)}`;
}

/** 标签长成一棵树：中间一根竖着的树干，不代表哪个标签；每个主标签是从树干上左右伸出去的一根枝（写得多的在下面、更粗更长，
 *  左右交替），枝头一簇叶子、旁边写名字和篇数；子标签是这根枝上的小枝，小枝头垂下一个柚子，篇数只看柚子大小、不写数字。
 *  树顶一簇叶子，树干上几片小叶子，树干下面挂一块小木牌写没打标签的几篇。
 *  小枝一个个找地方（篇数多的先挑）：枝上几个位置、朝上朝下、长短，名字写在柚子旁边或下面，挑碰得最少的；哪儿都碰就不画。
 *  树干和枝是一整块：先描所有的边、再整块填色，叠在一起的地方只剩外面一圈边。 */
function tagTree(list, ox, gy, s, seed, bb0, { left = 34, right = 426, top = 0, untagged = 0, H = 216 } = {}) {
  const tags = [...list].filter((t) => t && t.name && t.n > 0).sort((a, c) => c.n - a.n).slice(0, 6), max = tags[0]?.n || 1;
  const kidMax = Math.max(1, ...tags.flatMap((t) => (t.kids || []).map((k) => k.n)));
  const limbs = [], leaves = [], fruits = [], extra = [];
  let labels = '';
  const wood = [], blobs = [], boxes = [];
  const addWood = (p0, c1, c2, p1, w, owner) => { for (let u = 0; u <= 1.0001; u += 1 / 18) { const { p } = bez(p0, c1, c2, p1, u); wood.push({ x: p[0], y: p[1], r: w(u) / 2 + 2, owner }); } };
  const clamp = (v, a, z) => Math.max(a, Math.min(z, v));
  const rc = (bx, c) => Math.hypot(c.x - clamp(c.x, bx.x0, bx.x1), c.y - clamp(c.y, bx.y0, bx.y1)) < c.r;
  const rr = (a, c) => !(a.x1 < c.x0 || c.x1 < a.x0 || a.y1 < c.y0 || c.y1 < a.y0);
  const cc = (a, c) => Math.hypot(a.x - c.x, a.y - c.y) < a.r + c.r;
  // 树干：根部张开，往上收细，轻轻弯一下
  const T = [[ox, gy + 4], [ox - 7 * s, gy - H * 0.38], [ox + 7 * s, gy - H * 0.72], [ox + 2 * s, gy - H]];
  const tw = (u) => (7 + 11 * (1 - u) + 18 * Math.pow(1 - u, 7)) * s;
  limbs.push(limb(...T, tw));
  addWood(...T, tw, 'trunk');
  const at = (u) => bez(...T, u);
  const tip = T[3];
  // 树顶一簇叶子
  const crownLeaves = [-80, -50, -22, 0, 22, 50, 80].map((a, j) => ({ a, l: (19 + (j % 2) * 4) * s }));
  leaves.push({ bb: bb0 + 0.3, html: crownLeaves.map((c, j) => leaf(tip, c.a, c.l, seed + 200 + j)).join('') });
  for (const c of crownLeaves) { const m = pt(tip, dirOf(c.a), c.l * 0.55); blobs.push({ x: m[0], y: m[1], r: c.l * 0.5 + 2, id: '树顶' }); }
  // 树干上几片小叶子（不让它光秃秃）
  [[0.5, 1], [0.66, -1], [0.86, 1]].forEach(([u, side], j) => {
    const { p, d } = at(u), base = pt(p, [-d[1] * side, d[0] * side], tw(u) * 0.35), a = angOf(d) + side * 55;
    leaves.push({ bb: bb0 + 0.3, html: leaf(base, a, 11 * s, seed + 230 + j) });
    const m = pt(base, dirOf(a), 5.5 * s); blobs.push({ x: m[0], y: m[1], r: 6.5 * s, id: `干叶${j}` });
  });
  // 小木牌：钉在树干下面，两根绳挂着
  if (untagged > 0) {
    const { p } = at(0.25), w = 76 * s, h = 34 * s, sx = p[0] - w / 2, sy = p[1] + 4 * s;
    const board = rrect(sx, sy, w, h, 3 * s);
    extra.push({ bb: bb0 + 0.6, html: `${svg(PW, PH, `${st(`M${f(p[0])} ${f(p[1] - 6 * s)} L${f(sx + 8 * s)} ${f(sy + 1)} M${f(p[0])} ${f(p[1] - 6 * s)} L${f(sx + w - 8 * s)} ${f(sy + 1)}`, seed + 260, { sw: 1.2, amp: 0.2 })}${fl(board, seed + 261, 'var(--color-kraft)', { amp: 0.3 })}${st(board, seed + 262, { sw: 1.5, amp: 0.3 })}${fl(circle(p[0], p[1] - 6 * s, 2 * s), seed + 263, INK)}`)}<span style="position:absolute;left:${f(sx)}px;top:${f(sy + 2 * s)}px;width:${f(w)}px;text-align:center"><span style="display:block;font-size:10.5px;line-height:14px;color:${INK2}">没打标签</span><span class="num" style="display:block;font-size:13px;line-height:17px;font-weight:700">${fmt(untagged)} 篇</span></span>` });
    boxes.push({ x0: sx, x1: sx + w, y0: p[1] - 8 * s, y1: sy + h, id: '木牌' });
  }
  // 主标签：从树干左右伸出去的枝，写得多的在下面
  const n = tags.length;
  const branches = tags.map((t, i) => {
    const k = t.n / max, side = i % 2 ? 1 : -1, u = 0.34 + (n > 1 ? i / (n - 1) : 0) * 0.44;
    const { p: bp } = at(u), L = (64 + 84 * k) * s * (1.05 - u * 0.3), a = side * (66 - i * 3);
    const p0 = [bp[0] - side * tw(u) * 0.25, bp[1]], p1 = pt(p0, dirOf(a), L);
    const c1 = pt(p0, dirOf(side * (Math.abs(a) + 14)), L * 0.4), c2 = pt(p1, dirOf(side * (Math.abs(a) - 22) + 180), L * 0.34);
    const wb = Math.min(tw(u) * 0.8, (4 + 6 * k) * s), w = (q) => wb - (wb - 2 * s) * q;
    limbs.push(limb(p0, c1, c2, p1, w));
    addWood(p0, c1, c2, p1, w, `b${i}`);
    const end = angOf(bez(p0, c1, c2, p1, 1).d);
    const tuft = [-50, -12, 26].map((d) => ({ a: end + side * d, l: (11 + 4 * k) * s }));
    leaves.push({ bb: bb0 + 0.5 + i * 0.3, html: tuft.map((c, j) => leaf(p1, c.a, c.l, seed + 300 + i * 10 + j)).join('') });
    for (const c of tuft) { const m = pt(p1, dirOf(c.a), c.l * 0.55); blobs.push({ x: m[0], y: m[1], r: c.l * 0.5 + 2, id: `枝头${i}` }); }
    // 名字和篇数写在枝头外面（太长的省略）
    // 放不下就挪到枝头那簇叶子上面、贴着纸边
    const name = clip(t.name, 8), lw = textW(`${name} ${t.n}`, 13), edge = [12, PW - 12], over = side > 0 ? p1[0] + 16 * s + lw > edge[1] : p1[0] - 16 * s - lw < edge[0];
    const lx = over ? (side > 0 ? edge[1] - lw : edge[0] + lw) : p1[0] + side * (16 * s), ly = p1[1] - 6 * s - (over ? 22 * s : 0);
    const bx = side > 0 ? { x0: lx, x1: lx + lw, y0: ly - 10, y1: ly + 10 } : { x0: lx - lw, x1: lx, y0: ly - 10, y1: ly + 10 };
    labels += `<span style="position:absolute;left:${f(bx.x0 - 2)}px;top:${f(bx.y0)}px;width:${f(bx.x1 - bx.x0 + 4)}px;text-align:${side > 0 ? 'left' : 'right'};font-size:13px;line-height:20px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(name)}<span class="num" style="font-weight:400;color:${INK2}"> ${t.n}</span></span>`;
    boxes.push({ ...bx, id: `名${i}` });
    return { t, i, side, p0, c1, c2, p1 };
  });
  // 子标签：小枝和柚子，篇数多的先找地方
  const kids = branches.flatMap((br) => (br.t.kids || []).filter((kid) => kid && kid.name && kid.n > 0).slice(0, 3).map((kid, j) => ({ ...br, kid, j }))).sort((a, c) => c.kid.n - a.kid.n);
  for (const { i, side, p0, c1, c2, p1, kid, j } of kids) {
    const kk = kid.n / kidMax, pref = [0.42, 0.62, 0.8][j], r = (5.5 + 7 * kk) * s, kname = clip(kid.name, 6), lw = textW(kname, 11);
    let best = null;
    for (const tt of [0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78, 0.86]) for (const up of [1, -1]) for (const spread of [34, 48, 62]) for (const reach of [1, 1.3, 0.75]) for (const lab of ['out', 'under', 'in']) {
      const { p: bp, d: bd } = bez(p0, c1, c2, p1, tt);
      // up：小枝朝枝的上面还是下面长（枝往外伸，上面 = 往天上那一侧）
      const a0 = angOf(bd) - side * up * spread, lb = (16 + 12 * kk) * s * reach;
      const twigTip = pt(pt(bp, dirOf(a0), lb), [0, 1], 2 * s);
      const hang = twigTip[0] >= bp[0] ? 1 : -1;
      const fc = { x: twigTip[0] + hang * 1.5, y: twigTip[1] + 4 + r * 1.25, r: r + 2 };
      const ls = lab === 'in' ? -hang : hang, under = lab === 'under';
      const bx = under ? { x0: fc.x - lw / 2, x1: fc.x + lw / 2, y0: fc.y + r + 2, y1: fc.y + r + 16 } : ls > 0 ? { x0: fc.x + r + 4, x1: fc.x + r + 4 + lw, y0: fc.y - 8, y1: fc.y + 8 } : { x0: fc.x - r - 4 - lw, x1: fc.x - r - 4, y0: fc.y - 8, y1: fc.y + 8 };
      let score = Math.abs(tt - pref) * 5 + Math.abs(reach - 1) * 2 + (under ? 0.8 : lab === 'in' ? 1.2 : 0) + (up > 0 ? 0 : 0.6) + Math.abs(spread - 48) / 40;
      const hits = new Set();
      for (let q = 0.3; q <= 1.0001; q += 0.35) { const pq = { x: bp[0] + (twigTip[0] - bp[0]) * q, y: bp[1] + (twigTip[1] - bp[1]) * q, r: 2.5 * s }; for (const wd of wood) if (wd.owner !== `b${i}` && cc(pq, wd)) hits.add(`枝/${wd.owner}`); for (const bl of blobs) if (cc(pq, bl)) hits.add(`枝/${bl.id}`); for (const bb of boxes) if (rc(bb, pq)) hits.add(`枝/${bb.id}`); }
      for (const wd of wood) { if (cc(fc, wd)) hits.add(`果/${wd.owner}`); if (rc(bx, wd)) hits.add(`字/${wd.owner}`); }
      for (const bl of blobs) { if (cc(fc, bl)) hits.add(`果/${bl.id}`); if (rc(bx, bl)) hits.add(`字/${bl.id}`); }
      for (const bb of boxes) { if (rc(bb, fc)) hits.add(`果/${bb.id}`); if (rr(bb, bx)) hits.add(`字/${bb.id}`); }
      if (bx.x0 < left || bx.x1 > right || bx.y0 < top || bx.y1 > gy || fc.y + r > gy) hits.add('出界');
      score += hits.size * 6;
      if (!best || score < best.score) best = { score, hits: [...hits], bp, a0, lb, twigTip, fc, bx, under, ls, hang };
    }
    if (best.hits.length) continue; // 哪儿都碰：这个子标签不画
    const { bp, a0, lb, twigTip, fc, bx, under, ls, hang } = best;
    const w = (q) => (3.4 - 1.8 * q) * s, b1 = pt(bp, dirOf(a0), lb * 0.35), b2 = pt(bp, dirOf(a0 + hang * 8), lb * 0.72);
    limbs.push(limb(bp, b1, b2, twigTip, w));
    addWood(bp, b1, b2, twigTip, w, `小枝${kid.name}`);
    blobs.push({ ...fc, id: `果${kid.name}` });
    boxes.push({ ...bx, id: `字${kid.name}` });
    fruits.push({ bb: bb0 + 1.1 + i * 0.3 + j * 0.15, html: yuzu(twigTip, fc.r - 2, hang, seed + 500 + i * 30 + j * 9) });
    labels += `<span style="position:absolute;left:${f(bx.x0 - 2)}px;top:${f(bx.y0 - (under ? 1 : 0))}px;width:${f(bx.x1 - bx.x0 + 4)}px;text-align:${under ? 'center' : ls > 0 ? 'left' : 'right'};font-size:11px;line-height:16px;color:${INK2};white-space:nowrap">${esc(kname)}</span>`;
  }
  const ground = fl(ellipse(ox, gy + 4, 92 * s, 9 * s), seed, 'var(--color-kraft)', { amp: 0.6, op: '.8' }) + st(`M${f(ox - 100 * s)} ${f(gy + 6)} Q${f(ox)} ${f(gy - 2)} ${f(ox + 100 * s)} ${f(gy + 6)}`, seed + 1, { sw: 1.4, amp: 0.6, c: INK2, op: '.6' });
  const woodArt = `${limbs.map((l, i) => st(l, seed + 10 + i, { sw: 3.4, amp: 0.25 })).join('')}${limbs.map((l, i) => fl(l, seed + 60 + i, BARK, { amp: 0.15 })).join('')}`;
  const art = `${ground}<g ${b(bb0, 'grow', `transform-origin:${f(ox)}px ${f(gy)}px`)}>${woodArt}</g>${leaves.map((l) => `<g ${b(f(l.bb), 'fade')}>${l.html}</g>`).join('')}${fruits.map((x) => `<g ${b(f(x.bb), 'fade')}>${x.html}</g>`).join('')}`;
  // 木牌是 HTML（字），跟在 labels 里一起出来
  return { art, labels: labels + extra.map((x) => `<div ${b(f(x.bb), 'fade')}>${x.html}</div>`).join('') };
}

/** 十二支铅笔：一个月一支，写得越多削得越短（用掉的越多）；屁股上是橡皮。写得最多的那支是柚黄、头上写几篇。 */
function pencils(months, y, bb) {
  const vals = Array.from({ length: 12 }, (_, i) => Number(months?.[i]) || 0);
  const max = Math.max(...vals, 1), top = vals.indexOf(Math.max(...vals)), step = 32, pw = 16, x0 = 38, bot = y + 72;
  const art = vals.map((v, i) => {
    const x = x0 + i * step + (step - pw) / 2, t = y + (v / max) * 36, c = CATS[i % 5], sd = 2600 + i * 10, peak = i === top && v > 0;
    const body = rrect(x, t + 12, pw, bot - 12 - (t + 12), 1), band = rrect(x - 0.5, bot - 12, pw + 1, 4.5, 1), rub = P(`M${x} ${bot - 7.5} L${x + pw} ${bot - 7.5} L${x + pw} ${bot - 3} Q${x + pw} ${bot} ${x + pw - 3} ${bot} L${x + 3} ${bot} Q${x} ${bot} ${x} ${bot - 3} Z`);
    const cone = P(`M${x} ${t + 12} L${x + pw / 2} ${t} L${x + pw} ${t + 12} Z`);
    return `${fl(body, sd, peak ? 'var(--color-yuzu)' : soft(c), { amp: 0.2 })}${st(`M${x + pw / 2} ${t + 15} L${x + pw / 2} ${bot - 15}`, sd + 1, { sw: 1, c: peak ? INK2 : cat(c), amp: 0.1, op: '.5' })}${st(body, sd + 2, { sw: 1.2, amp: 0.2 })}
${fl(cone, sd + 3, '#F3D9B1', { amp: 0.1 })}${st(cone, sd + 4, { sw: 1.1, amp: 0.1 })}${fl(P(`M${x + pw / 2 - 2.6} ${t + 4} L${x + pw / 2} ${t} L${x + pw / 2 + 2.6} ${t + 4} Z`), sd + 5, INK)}
${fl(rub, sd + 6, soft('pink'), { amp: 0.15 })}${st(rub, sd + 7, { sw: 1.1, amp: 0.15 })}${fl(band, sd + 8, '#C9C4BA', { amp: 0.1 })}${st(band, sd + 9, { sw: 1.1, amp: 0.1 })}`;
  }).join('');
  const pnum = vals.map((v, i) => `<span class="num" style="position:absolute;left:${x0 + i * step}px;top:${bot + 3}px;width:${step}px;text-align:center;font-size:10px;line-height:14px;color:${i === top ? INK : INK2};font-weight:${i === top ? 700 : 400}">${i + 1}</span>`).join('');
  const peak = vals[top] > 0 ? `<span class="num" style="position:absolute;left:${x0 + top * step - 14}px;top:${f(y + 36 - 17)}px;width:${step + 28}px;text-align:center;font-size:11px;line-height:16px;font-weight:700">${fmt(vals[top])} 篇</span>` : '';
  return `<div ${b(bb, 'fade')}><span style="position:absolute;left:34px;top:${y - 26}px;font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">十二支铅笔 · 写得越多削得越短</span>${svg(PW, PH, art)}${pnum}${peak}</div>`;
}

/** 一行数字：几篇（大）、多少字、和去年比（去年没有就不写）。 */
function writingNums(W, y, bb) {
  const last = W.last, diff = last ? W.n - last.n : 0;
  const vs = last ? `${diff > 0 ? `比去年多 ${diff} 篇` : diff < 0 ? `比去年少 ${-diff} 篇` : '和去年一样多'}<br>去年 ${fmt(last.n)} 篇、${fmt(last.chars)} 字` : '';
  return `<div ${b(bb)}>${wBox(34, y, 392, 66, `<div style="display:flex;align-items:baseline;gap:6px;white-space:nowrap"><span style="font-size:52px;line-height:58px;font-weight:700">${roll(fmt(W.n), bb, 58)}</span>${wInk('篇', 16)}<span style="width:14px"></span><span style="font-size:26px;line-height:34px;font-weight:700">${roll(fmt(W.chars), bb + 0.3, 34)}</span>${wInk('字', 14)}<span class="num" style="margin-left:auto;font-size:11.5px;line-height:17px;color:${INK2};text-align:right">${vs}</span></div>`)}${wMark(36, y + 50, 74, 2190)}</div>`;
}

/** 第一幕「写下的字」：总的数字、标签长成的树、十二支铅笔。 */
export function writingPage(V) {
  const W = V.snap.writing;
  if (!W || !(W.n > 0)) return '';
  const tags = (W.tags || []).filter((t) => t && t.name && t.n > 0);
  const months = Array.from({ length: 12 }, (_, i) => Number(W.months?.[i]) || 0), peak = months.indexOf(Math.max(...months)) + 1;
  const sub = [`见字如面`, tags[0] ? `最常写「${esc(clip(tags[0].name, 8))}」` : '', Math.max(...months) > 0 ? `${peak} 月写得最多` : ''].filter(Boolean).join(' · ');
  const tree = tagTree(tags, 230, 428, 1, 2100, 2, { top: 160, untagged: W.untagged || 0 });
  return page('writing', `${head('写下的字', sub)}${writingNums(W, 92, 1)}
${svg(PW, PH, tree.art)}<div ${b(3.6, 'fade')}>${tree.labels}</div>
${pencils(months, 478, 5)}`);
}

/** 稿纸：一格一个字，把柚子抄的那句写进去。 */
function manuscript(x, y, cols, rows, text) {
  const s = 20, chars = [...clip(text, cols * rows)];
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(`<rect x="${x}" y="${y + r * (s + 8)}" width="${cols * s}" height="${s}" fill="none" stroke="#E7A07A" stroke-width="1"></rect>`);
    for (let c = 1; c < cols; c++) grid.push(`<line x1="${x + c * s}" y1="${y + r * (s + 8)}" x2="${x + c * s}" y2="${y + r * (s + 8) + s}" stroke="#E7A07A" stroke-width=".8"></line>`);
  }
  const letters = chars.map((ch, i) => `<span style="position:absolute;left:${x + (i % cols) * s}px;top:${y + Math.floor(i / cols) * (s + 8)}px;width:${s}px;height:${s}px;text-align:center;font-size:14px;line-height:${s}px">${esc(ch)}</span>`).join('');
  return `${svg(PW, PH, grid.join(''))}${letters}`;
}

/** 一篇的标签在书签上写最后一层（「旅行/东京」写「东京」），颜色跟着它的主标签在树上的位置。 */
const tagOf = (r) => (r.tags || [])[0] || '';
const leafTag = (t) => t.split('/').filter(Boolean).pop() || '';

/** 第二幕「重要的时刻」：最上面柚子挑的第一篇抄的那句写进稿纸，下面几篇像夹在本子里的书签（左边一截写日子，按日子排），
 *  最后是柚子的附言。挑的一篇都没有就只有附言；附言也没有，这一页不出现。 */
export function writingMomentsPage(V, K) {
  const sc = V.scene('writing-moments');
  const quotes = new Map((sc.quotes || []).map((q) => [q.key, q.text]));
  const picked = V.refs('writing-moments', ['article']);
  const ps = (sc.lines || []).join('');
  if (!picked.length && !ps) return '';
  const main = (V.snap.writing?.tags || []).map((t) => t.name);
  const tint = (r) => { const t = tagOf(r), i = main.indexOf(t.split('/')[0]); return i >= 0 ? CATS[i % 5] : CATS[[...t].length % 5]; };
  const first = picked[0], rest = picked.slice(1, 5).sort((a, c) => String(a.day).localeCompare(String(c.day)));
  const qx = 50, qy = 112;
  const paper = first ? `<div ${b(1)}>${recBtn(first.key, 'left:34px;top:94px;width:392px;height:104px', `${slip(-1, '#FFFDF7')}${tape(30, -8, 70, -6)}<span style="position:absolute;right:16px;bottom:6px;max-width:360px;font-size:11px;line-height:16px;color:${INK2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(clip(first.text, 20))}${first.day ? ` · ${md(first.day)}` : ''}</span>`, `打开原记录：${first.text}`)}${manuscript(qx, qy, 18, 2, quotes.get(first.key) || first.text)}</div>` : '';
  const top0 = first ? 218 : 104;
  const rows = rest.map((r, i) => {
    const y = top0 + i * 58, rot = [-0.8, 0.6, -0.5, 0.8][i], c = tint(r), tag = leafTag(tagOf(r)), q = quotes.get(r.key);
    return `<div ${b(f(2 + i * 0.6))}>${recBtn(r.key, `left:34px;top:${y}px;width:392px;height:48px`, `${slip(rot)}<span aria-hidden="true" style="position:absolute;left:0;top:0;width:56px;height:48px;border-radius:4px 0 0 4px;background:${soft(c)};transform:rotate(${rot}deg);transform-origin:196px 24px"></span>
<span style="position:absolute;left:0;top:5px;width:56px;text-align:center">${r.day ? `<span class="num" style="display:block;font-size:10.5px;line-height:14px;color:${INK2}">${Number(r.day.slice(5, 7))} 月</span><span class="num" style="display:block;font-size:19px;line-height:22px;font-weight:700">${Number(r.day.slice(8, 10))}</span>` : ''}</span>
<span style="position:absolute;left:68px;right:12px;top:5px;text-align:left"><span style="display:flex;gap:8px;align-items:baseline;white-space:nowrap"><span style="min-width:0;font-size:14px;line-height:20px;font-weight:700;overflow:hidden;text-overflow:ellipsis">${esc(r.text)}</span>${tag ? `<span style="margin-left:auto;flex:none;font-size:11px;line-height:16px;color:${INK2}">#${esc(clip(tag, 8))}</span>` : ''}</span>${q ? `<span style="display:block;font-size:12px;line-height:18px;color:${INK2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">「${esc(q)}」</span>` : ''}</span>`, `打开原记录：${r.text}`)}</div>`;
  }).join('');
  const psY = Math.min(460, top0 + rest.length * 58 + 14);
  const note = ps ? `<div ${b(f(2.4 + rest.length * 0.6))}><div style="position:absolute;left:40px;top:${psY}px;width:380px;height:100px">${slip(-1.2, 'var(--color-print-cream)')}${tape(150, -9, 70, 3, 1)}
<div style="position:relative;padding:12px 84px 0 18px"><div style="font-size:13px;line-height:20px;font-weight:700">附言</div><div style="font-size:13.5px;line-height:21px;height:63px;overflow:hidden">${esc(clip(ps, 60))}</div></div>
<span style="position:absolute;right:14px;bottom:10px;width:56px;height:54px;line-height:0;transform:rotate(8deg)">${K.face('wink', 56)}</span></div></div>` : '';
  return page('writing-moments', `${head('重要的时刻', '见字如面 · 柚子从这一年写的里面挑的')}${paper}${rows}${note}`);
}
