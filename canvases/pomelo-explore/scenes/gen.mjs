// Pomelo Explore 的「EX8：Atlas 新的几幕」（Pomelo v1.0 Phase 7，2026-11-16 从 Pomelo 的原型并进来）：Tabloid 1.1.0 加的几幕
// 在定稿前画的样子。站主在云端画布「Pomelo · Atlas 新的几幕」上批了玩物有志（B · 掌机）和自建模块的通用幕（零件、排法、例子、
// SKILL），定稿进了 schemes/pomelo/atlas/tabloid/（parts.mjs）；写下的字（见字如面）第三轮挑了树顶 B，定稿成 1.1.1（writing.mjs）。
// 页全用小报自己的零件画（draw.mjs、kit.mjs），数据都是编的。五张画板（文件名前面都是 Scenes-）。
// 用法：在仓库根目录 node canvases/pomelo-explore/scenes/gen.mjs（先 npm run build:ds）
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { rootImport, fromRoot } from '../../_lib/root.mjs';
import { PROJECT, writePage } from '../page.mjs';
const imp = rootImport;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const T = 'schemes/pomelo/atlas/tabloid';

const { P, f, rng, rrect, circle, ellipse } = await imp('tooling/handmade/line.mjs');
const { PW, PH, INK, INK2, RULE, LINE, CATS, cat, soft, st, fl, svg, fmt, b, esc, clip, tape, slip, roll, page, head, say, recBtn, useStar, atlasDefs, md } = await imp(`${T}/draw.mjs`);
const { CSS: ZINE_CSS } = await imp(`${T}/style.mjs`);
const { makeKit } = await imp(`${T}/kit.mjs`);
const { atlasPages, prepare } = await imp(`${T}/pages.mjs`);
const { sampleYear } = await imp(`${T}/sample.mjs`);
const { loadAssets } = await imp('tooling/atlas/build.mjs');
const { loadTokens } = await imp('tooling/lib/common.mjs');
const PALETTES = Object.keys(loadTokens('pomelo').color.palettes);
const ASSETS = await loadAssets('pomelo', 'tabloid');
for (const m of ['articles', 'games', 'coffee', 'grad', 'mountain', 'camera', 'shapes']) ASSETS.marks[m] = readFileSync(fromRoot(`schemes/pomelo/marks/modules/${m}.svg`), 'utf8').trim();
const K = makeKit(ASSETS);
const V = prepare(sampleYear());
const OLD = atlasPages(V, K);
const oldPage = (scene) => OLD.find((p) => p.includes(`data-scene="${scene}"`));

const star5 = (x, y, n, size = 15, gap = 2) => Array.from({ length: 5 }, (_, i) => i < n ? useStar('zgold', x + i * (size + gap), y, size) : useStar('zstar', x + i * (size + gap), y, size, 'color:var(--color-print-rule)')).join('');
const ink = (t, size = 14, extra = '') => `<span style="font-size:${size}px;line-height:${Math.round(size * 1.5)}px;${extra}">${t}</span>`;
const at = (x, y, w, h, inner, extra = '') => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}">${inner}</div>`;
const marker = (x, y, w, seed) => at(x, y, w, 12, svg(w, 12, st(`M2 6 L${w - 2} 6`, seed, { c: 'var(--color-yuzu)', sw: 9, amp: 0.8 })), 'opacity:.75');

// ======================================================================
// 一、笔记那一幕「写下的字」（见字如面这一年）
// ======================================================================
const W = {
  articles: 46, chars: 61840, last: { articles: 31, chars: 40210 }, untagged: 5,
  months: [2, 3, 7, 4, 5, 3, 2, 1, 4, 6, 5, 4],
  tags: [
    { name: '旅行', n: 14, kids: [{ name: '东京', n: 6 }, { name: '海边', n: 3 }, { name: '古镇', n: 2 }] },
    { name: '学习和编程', n: 11, kids: [{ name: 'rust', n: 5 }, { name: '设计', n: 3 }] },
    { name: '生活', n: 9, kids: [{ name: '做饭', n: 4 }] },
    { name: '读书', n: 7, kids: [{ name: '小说', n: 3 }] },
    { name: '工作', n: 5, kids: [] },
  ],
  // 换一份数据看树：三个主标签，子标签多
  tags2: [
    { name: '生活', n: 12, kids: [{ name: '做饭', n: 5 }, { name: '散步', n: 3 }, { name: '家', n: 2 }] },
    { name: '读书', n: 8, kids: [{ name: '小说', n: 4 }, { name: '历史', n: 2 }] },
    { name: '工作', n: 4, kids: [] },
  ],
  quote: { key: 'article:12', title: '东京的第三天', day: '2026-10-14', text: '旅行的意义，是把日常换一个地方过。' },
  // 第二幕：柚子挑的几篇（重要的时刻），最上面那句写进稿纸
  moments: [
    { key: 'article:3', day: '2026-03-18', title: '第一次自己修好自行车', text: '链条装回去的那一下，手上全是油，心里很亮。', tag: '生活' },
    { key: 'article:20', day: '2026-06-02', title: '写完第一个小工具', text: '编译器终于不骂我了，它说的都对。', tag: 'rust' },
    { key: 'article:31', day: '2026-08-21', title: '外婆的菜园', text: '她把最红的那个番茄留给我，说城里买不到这个味道。', tag: '生活' },
    { key: 'article:44', day: '2026-11-28', title: '第一场雪', text: '下班路上下了今年第一场雪，我在路灯下站了很久。', tag: '生活' },
  ],
  ps: '这一年你写了 46 篇，有一半是在路上写的。明年也多写写平常的日子吧：平常的那些，过几年再读最好看。',
};
const peakMonth = W.months.indexOf(Math.max(...W.months)) + 1;

// ---------- 小树（第二轮，站主 11-16：一个主标签一根主干，子标签是主干上的枝，枝头挂柚子；树干里不画线） ----------
const BARK = '#B98A55', LEAF = cat('mint'), VEIN = soft('mint');
const pt = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
const dirOf = (deg) => [Math.sin((deg * Math.PI) / 180), -Math.cos((deg * Math.PI) / 180)];
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
const pline = (pts) => P('M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' Z');
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

/** 标签长成一棵树（第三轮，站主 11-16）：中间一根竖着的树干，不代表哪个标签；每个主标签是从树干上左右伸出去的一根枝
 *  （写得多的在下面、更粗更长，左右交替），枝头一簇叶子、旁边写名字和篇数；子标签是这根枝上的小枝，小枝头垂下一个柚子，
 *  篇数只看柚子大小、不写数字。树干不光秃秃：干上长几片叶子，树顶 `crown` 两种：
 *  - `yuzu`：一簇叶子里坐着柚子（这本见字如面是它的）；
 *  - `sign`：树顶一簇叶子，树干下面钉一块小木牌，写没打标签的几篇（它们长在树干上）。
 *  小枝一个个找地方（篇数多的先挑）：枝上几个位置、朝上朝下、长短，名字写在柚子旁边或下面，挑碰得最少的；哪儿都碰就不画。
 *  树干和枝是一整块：先描所有的边、再整块填色，叠在一起的地方只剩外面一圈边。 */
function tagTree(list, ox, gy, s, seed, bb0, { left = 34, right = 426, top = 0, crown = 'yuzu', untagged = 0, H = 216 } = {}) {
  const tags = [...list].sort((a, c) => c.n - a.n).slice(0, 6), max = tags[0].n;
  const kidMax = Math.max(1, ...tags.flatMap((t) => t.kids.map((k) => k.n)));
  const limbs = [], leaves = [], fruits = [], extra = [];
  let labels = '';
  const wood = [], blobs = [], boxes = [];
  const textW = (str, px) => [...str].reduce((a, ch) => a + (/[　-鿿＀-￯]/.test(ch) ? px : px * 0.6), 0);
  const addWood = (p0, c1, c2, p1, w, owner) => { for (let u = 0; u <= 1.0001; u += 1 / 18) { const { p } = bez(p0, c1, c2, p1, u); wood.push({ x: p[0], y: p[1], r: w(u) / 2 + 2, owner }); } };
  const clamp = (v, a, z) => Math.max(a, Math.min(z, v));
  const rc = (b, c) => Math.hypot(c.x - clamp(c.x, b.x0, b.x1), c.y - clamp(c.y, b.y0, b.y1)) < c.r;
  const rr = (a, b) => !(a.x1 < b.x0 || b.x1 < a.x0 || a.y1 < b.y0 || b.y1 < a.y0);
  const cc = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r;
  const angOf = (d) => Math.atan2(d[0], -d[1]) * 57.3;
  // 树干：根部张开，往上收细，轻轻弯一下
  const T = [[ox, gy + 4], [ox - 7 * s, gy - H * 0.38], [ox + 7 * s, gy - H * 0.72], [ox + 2 * s, gy - H]];
  const tw = (u) => (7 + 11 * (1 - u) + 18 * Math.pow(1 - u, 7)) * s;
  limbs.push(limb(...T, tw));
  addWood(...T, tw, 'trunk');
  const at = (u) => bez(...T, u);
  const tip = T[3];
  // 树顶的一簇叶子
  const crownLeaves = (crown === 'yuzu' ? [-112, -82, -52, 52, 82, 112] : [-80, -50, -22, 0, 22, 50, 80]).map((a, j) => ({ a, l: (crown === 'yuzu' ? 21 : 19 + (j % 2) * 4) * s }));
  leaves.push({ bb: bb0 + 0.3, html: crownLeaves.map((c, j) => leaf(tip, c.a, c.l, seed + 200 + j)).join('') });
  for (const c of crownLeaves) { const m = pt(tip, dirOf(c.a), c.l * 0.55); blobs.push({ x: m[0], y: m[1], r: c.l * 0.5 + 2, id: '树顶' }); }
  if (crown === 'yuzu') {
    const fs = 44 * s;
    extra.push({ bb: bb0 + 0.6, html: `<span style="position:absolute;left:${f(tip[0] - fs / 2)}px;top:${f(tip[1] - fs * 0.86)}px;width:${f(fs)}px;height:${f(fs * 108 / 112)}px;line-height:0">${K.face('happy', Math.round(fs))}</span>` });
    blobs.push({ x: tip[0], y: tip[1] - fs * 0.4, r: fs * 0.55, id: '树顶' });
  }
  // 树干上几片小叶子（不让它光秃秃）
  [[0.5, 1], [0.66, -1], [0.86, 1]].forEach(([u, side], j) => {
    const { p, d } = at(u), base = pt(p, [-d[1] * side, d[0] * side], tw(u) * 0.35), a = angOf(d) + side * 55;
    leaves.push({ bb: bb0 + 0.3, html: leaf(base, a, 11 * s, seed + 230 + j) });
    const m = pt(base, dirOf(a), 5.5 * s); blobs.push({ x: m[0], y: m[1], r: 6.5 * s, id: `干叶${j}` });
  });
  // 小木牌：钉在树干下面，两根绳挂着
  if (crown === 'sign' && untagged > 0) {
    const { p } = at(0.25), w = 76 * s, h = 34 * s, sx = p[0] - w / 2, sy = p[1] + 4 * s;
    const board = rrect(sx, sy, w, h, 3 * s);
    extra.push({ bb: bb0 + 0.6, html: `${svg(PW, PH, `${st(`M${f(p[0])} ${f(p[1] - 6 * s)} L${f(sx + 8 * s)} ${f(sy + 1)} M${f(p[0])} ${f(p[1] - 6 * s)} L${f(sx + w - 8 * s)} ${f(sy + 1)}`, seed + 260, { sw: 1.2, amp: 0.2 })}${fl(board, seed + 261, 'var(--color-kraft)', { amp: 0.3 })}${st(board, seed + 262, { sw: 1.5, amp: 0.3 })}${fl(circle(p[0], p[1] - 6 * s, 2 * s), seed + 263, INK)}`)}<span style="position:absolute;left:${f(sx)}px;top:${f(sy + 2 * s)}px;width:${f(w)}px;text-align:center"><span style="display:block;font-size:10.5px;line-height:14px;color:${INK2}">没打标签</span><span class="num" style="display:block;font-size:13px;line-height:17px;font-weight:700">${untagged} 篇</span></span>` });
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
    const tuft = [-50, -12, 26].map((d, j) => ({ a: end + side * d, l: (11 + 4 * k) * s }));
    leaves.push({ bb: bb0 + 0.5 + i * 0.3, html: tuft.map((c, j) => leaf(p1, c.a, c.l, seed + 300 + i * 10 + j)).join('') });
    for (const c of tuft) { const m = pt(p1, dirOf(c.a), c.l * 0.55); blobs.push({ x: m[0], y: m[1], r: c.l * 0.5 + 2, id: `枝头${i}` }); }
    // 名字和篇数写在枝头外面
    const lw = textW(`${t.name} ${t.n}`, 13), lx = p1[0] + side * (16 * s), ly = p1[1] - 6 * s;
    const box = side > 0 ? { x0: lx, x1: lx + lw, y0: ly - 10, y1: ly + 10 } : { x0: lx - lw, x1: lx, y0: ly - 10, y1: ly + 10 };
    labels += `<span style="position:absolute;left:${f(box.x0 - 2)}px;top:${f(box.y0)}px;width:${f(lw + 4)}px;text-align:${side > 0 ? 'left' : 'right'};font-size:13px;line-height:20px;font-weight:700;white-space:nowrap">${esc(t.name)}<span class="num" style="font-weight:400;color:${INK2}"> ${t.n}</span></span>`;
    boxes.push({ ...box, id: `名${i}` });
    return { t, i, side, p0, c1, c2, p1 };
  });
  // 子标签：小枝和柚子，篇数多的先找地方
  const kids = branches.flatMap((br) => br.t.kids.slice(0, 3).map((kid, j) => ({ ...br, kid, j }))).sort((a, c) => c.kid.n - a.kid.n);
  for (const { i, side, p0, c1, c2, p1, kid, j } of kids) {
    const kk = kid.n / kidMax, pref = [0.42, 0.62, 0.8][j], r = (5.5 + 7 * kk) * s, lw = textW(kid.name, 11);
    let best = null;
    for (const tt of [0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78, 0.86]) for (const up of [1, -1]) for (const spread of [34, 48, 62]) for (const reach of [1, 1.3, 0.75]) for (const lab of ['out', 'under', 'in']) {
      const { p: bp, d: bd } = bez(p0, c1, c2, p1, tt);
      // up：小枝朝枝的上面还是下面长（枝往外伸，上面 = 往天上那一侧）
      const a0 = angOf(bd) - side * up * spread, lb = (16 + 12 * kk) * s * reach;
      const twigTip = pt(pt(bp, dirOf(a0), lb), [0, 1], 2 * s);
      const hang = twigTip[0] >= bp[0] ? 1 : -1;
      const fc = { x: twigTip[0] + hang * 1.5, y: twigTip[1] + 4 + r * 1.25, r: r + 2 };
      const ls = lab === 'in' ? -hang : hang, under = lab === 'under';
      const box = under ? { x0: fc.x - lw / 2, x1: fc.x + lw / 2, y0: fc.y + r + 2, y1: fc.y + r + 16 } : ls > 0 ? { x0: fc.x + r + 4, x1: fc.x + r + 4 + lw, y0: fc.y - 8, y1: fc.y + 8 } : { x0: fc.x - r - 4 - lw, x1: fc.x - r - 4, y0: fc.y - 8, y1: fc.y + 8 };
      let score = Math.abs(tt - pref) * 5 + Math.abs(reach - 1) * 2 + (under ? 0.8 : lab === 'in' ? 1.2 : 0) + (up > 0 ? 0 : 0.6) + Math.abs(spread - 48) / 40;
      const hits = new Set();
      for (let q = 0.3; q <= 1.0001; q += 0.35) { const pq = { x: bp[0] + (twigTip[0] - bp[0]) * q, y: bp[1] + (twigTip[1] - bp[1]) * q, r: 2.5 * s }; for (const wd of wood) if (wd.owner !== `b${i}` && cc(pq, wd)) hits.add(`枝/${wd.owner}`); for (const bl of blobs) if (cc(pq, bl)) hits.add(`枝/${bl.id}`); for (const bx of boxes) if (rc(bx, pq)) hits.add(`枝/${bx.id}`); }
      for (const wd of wood) { if (cc(fc, wd)) hits.add(`果/${wd.owner}`); if (rc(box, wd)) hits.add(`字/${wd.owner}`); }
      for (const bl of blobs) { if (cc(fc, bl)) hits.add(`果/${bl.id}`); if (rc(box, bl)) hits.add(`字/${bl.id}`); }
      for (const bx of boxes) { if (rc(bx, fc)) hits.add(`果/${bx.id}`); if (rr(bx, box)) hits.add(`字/${bx.id}`); }
      if (box.x0 < left || box.x1 > right || box.y0 < top || box.y1 > gy || fc.y + r > gy) hits.add('出界');
      score += hits.size * 6;
      if (!best || score < best.score) best = { score, hits: [...hits], bp, a0, lb, twigTip, fc, box, under, ls, hang };
    }
    if (process.env.TREE_DEBUG) console.error(kid.name, Math.round(best.score * 10) / 10, best.hits.join(' '));
    if (best.hits.length) continue; // 哪儿都碰：这个子标签不画
    const { bp, a0, lb, twigTip, fc, box, under, ls, hang } = best;
    const w = (q) => (3.4 - 1.8 * q) * s, b1 = pt(bp, dirOf(a0), lb * 0.35), b2 = pt(bp, dirOf(a0 + hang * 8), lb * 0.72);
    limbs.push(limb(bp, b1, b2, twigTip, w));
    addWood(bp, b1, b2, twigTip, w, `小枝${kid.name}`);
    blobs.push({ ...fc, id: `果${kid.name}` });
    boxes.push({ ...box, id: `字${kid.name}` });
    fruits.push({ bb: bb0 + 1.1 + i * 0.3 + j * 0.15, html: yuzu(twigTip, fc.r - 2, hang, seed + 500 + i * 30 + j * 9) });
    labels += `<span style="position:absolute;left:${f(box.x0 - 2)}px;top:${f(box.y0 - (under ? 1 : 0))}px;width:${f(box.x1 - box.x0 + 4)}px;text-align:${under ? 'center' : ls > 0 ? 'left' : 'right'};font-size:11px;line-height:16px;color:${INK2};white-space:nowrap">${esc(kid.name)}</span>`;
  }
  const ground = fl(ellipse(ox, gy + 4, 92 * s, 9 * s), seed, 'var(--color-kraft)', { amp: 0.6, op: '.8' }) + st(`M${f(ox - 100 * s)} ${f(gy + 6)} Q${f(ox)} ${f(gy - 2)} ${f(ox + 100 * s)} ${f(gy + 6)}`, seed + 1, { sw: 1.4, amp: 0.6, c: INK2, op: '.6' });
  const woodArt = `${limbs.map((l, i) => st(l, seed + 10 + i, { sw: 3.4, amp: 0.25 })).join('')}${limbs.map((l, i) => fl(l, seed + 60 + i, BARK, { amp: 0.15 })).join('')}`;
  const art = `${ground}<g ${b(bb0, 'grow', `transform-origin:${f(ox)}px ${f(gy)}px`)}>${woodArt}</g>${leaves.map((l) => `<g ${b(f(l.bb), 'fade')}>${l.html}</g>`).join('')}${fruits.map((x) => `<g ${b(f(x.bb), 'fade')}>${x.html}</g>`).join('')}`;
  // 木牌和树顶的柚子是 HTML（字、柚子的脸），跟在 labels 里一起出来
  return { art, labels: labels + extra.map((x) => `<div ${b(f(x.bb), 'fade')}>${x.html}</div>`).join('') };
}

/** 十二个月一排小条：最多的那个月是柚黄，其余跟着位置换颜色。 */
function monthBars(x, y, w, h, values, seed, bb, { label = '', unit = '篇' } = {}) {
  const max = Math.max(...values, 1), gap = 6, bw = (w - gap * 11) / 12, top = values.indexOf(max);
  const bars = values.map((v, i) => {
    const bh = Math.max(3, (v / max) * (h - 34)), bx = x + i * (bw + gap), by = y + h - 18 - bh;
    return `${fl(rrect(bx, by, bw, bh, 3), seed + i, i === top ? 'var(--color-yuzu)' : soft(CATS[i % 5]), { amp: 0.3 })}${i === top ? st(rrect(bx, by, bw, bh, 3), seed + 20 + i, { sw: 1.3, amp: 0.3 }) : ''}`;
  }).join('');
  const nums = values.map((v, i) => `<span class="num" style="position:absolute;left:${f(x + i * (bw + gap))}px;top:${y + h - 16}px;width:${f(bw)}px;text-align:center;font-size:10px;line-height:14px;color:${i === top ? INK : INK2};font-weight:${i === top ? 700 : 400}">${i + 1}</span>`).join('');
  const peak = `<span class="num" style="position:absolute;left:${f(x + top * (bw + gap) - 20)}px;top:${f(y + h - 18 - (max / max) * (h - 34) - 18)}px;width:${f(bw + 40)}px;text-align:center;font-size:11px;line-height:16px;font-weight:700">${max} ${unit}</span>`;
  return `<div ${b(bb, 'fade')}>${label ? `<span style="position:absolute;left:${x}px;top:${y - 22}px;font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">${label}</span>` : ''}${svg(PW, PH, bars)}${nums}${peak}</div>`;
}

/** 一行数字：几篇（大）、多少字、和去年比。 */
const writingNums = (y, bb) => `<div ${b(bb)}>${at(34, y, 392, 66, `<div style="display:flex;align-items:baseline;gap:6px;white-space:nowrap"><span style="font-size:52px;line-height:58px;font-weight:700">${roll(String(W.articles), bb, 58)}</span>${ink('篇', 16)}<span style="width:14px"></span><span style="font-size:26px;line-height:34px;font-weight:700">${roll(fmt(W.chars), bb + 0.3, 34)}</span>${ink('字', 14)}<span class="num" style="margin-left:auto;font-size:11.5px;line-height:17px;color:${INK2}">比去年多 ${W.articles - W.last.articles} 篇<br>去年 ${W.last.articles} 篇、${fmt(W.last.chars)} 字</span></div>`)}${marker(36, y + 50, 74, 2190)}</div>`;

/** 稿纸：一格一个字，把柚子挑的那句写进去。 */
function manuscript(x, y, cols, rows, text, seed) {
  const s = 20, chars = [...clip(text, cols * rows)];
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(`<rect x="${x}" y="${y + r * (s + 8)}" width="${cols * s}" height="${s}" fill="none" stroke="#E7A07A" stroke-width="1"></rect>`);
    for (let c = 1; c < cols; c++) grid.push(`<line x1="${x + c * s}" y1="${y + r * (s + 8)}" x2="${x + c * s}" y2="${y + r * (s + 8) + s}" stroke="#E7A07A" stroke-width=".8"></line>`);
  }
  const letters = chars.map((ch, i) => `<span style="position:absolute;left:${x + (i % cols) * s}px;top:${y + Math.floor(i / cols) * (s + 8)}px;width:${s}px;height:${s}px;text-align:center;font-size:14px;line-height:${s}px">${esc(ch)}</span>`).join('');
  return `${svg(PW, PH, grid.join(''))}${letters}`;
}

/** 十二支铅笔：一个月一支，写得越多削得越短（用掉的越多）；屁股上是橡皮。写得最多的那支是柚黄、头上写几篇。 */
function pencils(y, bb) {
  const max = Math.max(...W.months), top = W.months.indexOf(max), step = 32, pw = 16, x0 = 38, bot = y + 72;
  const art = W.months.map((v, i) => {
    const x = x0 + i * step + (step - pw) / 2, t = y + (v / max) * 36, c = CATS[i % 5], sd = 2600 + i * 10;
    const body = rrect(x, t + 12, pw, bot - 12 - (t + 12), 1), band = rrect(x - 0.5, bot - 12, pw + 1, 4.5, 1), rub = P(`M${x} ${bot - 7.5} L${x + pw} ${bot - 7.5} L${x + pw} ${bot - 3} Q${x + pw} ${bot} ${x + pw - 3} ${bot} L${x + 3} ${bot} Q${x} ${bot} ${x} ${bot - 3} Z`);
    const cone = P(`M${x} ${t + 12} L${x + pw / 2} ${t} L${x + pw} ${t + 12} Z`);
    return `${fl(body, sd, i === top ? 'var(--color-yuzu)' : soft(c), { amp: 0.2 })}${st(`M${x + pw / 2} ${t + 15} L${x + pw / 2} ${bot - 15}`, sd + 1, { sw: 1, c: i === top ? INK2 : cat(c), amp: 0.1, op: '.5' })}${st(body, sd + 2, { sw: 1.2, amp: 0.2 })}
${fl(cone, sd + 3, '#F3D9B1', { amp: 0.1 })}${st(cone, sd + 4, { sw: 1.1, amp: 0.1 })}${fl(P(`M${x + pw / 2 - 2.6} ${t + 4} L${x + pw / 2} ${t} L${x + pw / 2 + 2.6} ${t + 4} Z`), sd + 5, INK)}
${fl(rub, sd + 6, soft('pink'), { amp: 0.15 })}${st(rub, sd + 7, { sw: 1.1, amp: 0.15 })}${fl(band, sd + 8, '#C9C4BA', { amp: 0.1 })}${st(band, sd + 9, { sw: 1.1, amp: 0.1 })}`;
  }).join('');
  const pnum = W.months.map((v, i) => `<span class="num" style="position:absolute;left:${x0 + i * step}px;top:${bot + 3}px;width:${step}px;text-align:center;font-size:10px;line-height:14px;color:${i === top ? INK : INK2};font-weight:${i === top ? 700 : 400}">${i + 1}</span>`).join('');
  const peak = `<span class="num" style="position:absolute;left:${x0 + top * step - 14}px;top:${f(y + 36 - 17)}px;width:${step + 28}px;text-align:center;font-size:11px;line-height:16px;font-weight:700">${max} 篇</span>`;
  return `<div ${b(bb, 'fade')}><span style="position:absolute;left:34px;top:${y - 26}px;font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">十二支铅笔 · 写得越多削得越短</span>${svg(PW, PH, art)}${pnum}${peak}</div>`;
}

/** 第一幕「写下的字」：总的数字、标签长成的树、十二支铅笔。 */
function writingStats(crown = 'yuzu') {
  const tree = tagTree(W.tags, 230, 428, 1, 2100, 2, { top: 160, crown, untagged: W.untagged });
  return page('writing', `${head('写下的字', `见字如面 · 最常写「${W.tags[0].name}」· ${peakMonth} 月写得最多`)}${writingNums(92, 1)}
${svg(PW, PH, tree.art)}<div ${b(3.6, 'fade')}>${tree.labels}</div>
${pencils(478, 5)}`);
}

/** 第二幕「重要的时刻」：最上面柚子挑的一句写进稿纸，下面几篇像夹在本子里的书签（左边一截写日子），最后是柚子的附言。 */
function writingMoments() {
  const qx = 50, qy = 112;
  const paper = `<div ${b(1)}>${recBtn(W.quote.key, 'left:34px;top:94px;width:392px;height:104px', `${slip(-1, '#FFFDF7')}${tape(30, -8, 70, -6)}<span style="position:absolute;right:16px;bottom:6px;font-size:11px;line-height:16px;color:${INK2}">${esc(W.quote.title)} · ${md(W.quote.day)}</span>`, `打开原记录：${W.quote.title}`)}${manuscript(qx, qy, 18, 2, W.quote.text, 2400)}</div>`;
  const tint = { 生活: 'mint', rust: 'sky', 东京: 'pink', 旅行: 'pink' };
  const rows = W.moments.slice(0, 4).map((m, i) => {
    const y = 218 + i * 58, rot = [-0.8, 0.6, -0.5, 0.8][i], c = tint[m.tag] || CATS[i % 5];
    return `<div ${b(f(2 + i * 0.6))}>${recBtn(m.key, `left:34px;top:${y}px;width:392px;height:48px`, `${slip(rot)}<span aria-hidden="true" style="position:absolute;left:0;top:0;width:56px;height:48px;border-radius:4px 0 0 4px;background:${soft(c)};transform:rotate(${rot}deg);transform-origin:196px 24px"></span>
<span style="position:absolute;left:0;top:5px;width:56px;text-align:center"><span class="num" style="display:block;font-size:10.5px;line-height:14px;color:${INK2}">${Number(m.day.slice(5, 7))} 月</span><span class="num" style="display:block;font-size:19px;line-height:22px;font-weight:700">${Number(m.day.slice(8, 10))}</span></span>
<span style="position:absolute;left:68px;right:12px;top:5px;text-align:left"><span style="display:flex;gap:8px;align-items:baseline;white-space:nowrap"><span style="font-size:14px;line-height:20px;font-weight:700;overflow:hidden;text-overflow:ellipsis">${esc(m.title)}</span><span style="margin-left:auto;font-size:11px;line-height:16px;color:${INK2}">#${esc(m.tag)}</span></span><span style="display:block;font-size:12px;line-height:18px;color:${INK2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">「${esc(m.text)}」</span></span>`, `打开原记录：${m.title}`)}</div>`;
  }).join('');
  const ps = `<div ${b(5)}><div style="position:absolute;left:40px;top:460px;width:380px;height:100px">${slip(-1.2, 'var(--color-print-cream)')}${tape(150, -9, 70, 3, 1)}
<div style="position:relative;padding:12px 84px 0 18px"><div style="font-size:13px;line-height:20px;font-weight:700">附言</div><div style="font-size:13.5px;line-height:21px">${esc(W.ps)}</div></div>
<span style="position:absolute;right:14px;bottom:10px;width:56px;height:54px;line-height:0;transform:rotate(8deg)">${K.face('wink', 56)}</span></div></div>`;
  return page('writing-moments', `${head('重要的时刻', '见字如面 · 柚子从这一年写的里面挑的')}${paper}${rows}${ps}`);
}

// ======================================================================
// 二、玩物有志那一幕（紧跟书影相遇；站主 11-16 挑了 B · 掌机，还要算玩到二周目以上的）
// ======================================================================
const game = (key, title, platform, kind, rating, runs = 1) => ({ key: `game:${key}`, title, platform, kind, rating, runs });
const GAMES = {
  // 平常的一年：七个，一个玩了二周目
  one: { done: [game(3, '雾港侦探', 'Switch', '解谜', 5, 2), game(1, '纸飞机邮差', 'Steam', '冒险', 4), game(5, '深海食堂', 'Switch', '模拟经营', 4), game(2, '月面菜园', 'PC', '模拟经营', 3), game(6, '方块山谷', '手机', '解谜', 4), game(4, '猫咪旅馆', 'Switch', '解谜', 3), game(7, '慢车旅人', 'PS5', '冒险', 5)], last: 5, say: ['雾港侦探你通关了两次，第二次是为了那只猫。'] },
  // 玩得多的一年：十一个（盒子只插最喜欢的七个），两个玩了不止一遍
  many: { done: [game(3, '雾港侦探', 'Switch', '解谜', 5, 3), game(1, '纸飞机邮差', 'Steam', '冒险', 4), game(5, '深海食堂', 'Switch', '模拟经营', 4), game(2, '月面菜园', 'PC', '模拟经营', 3), game(6, '方块山谷', '手机', '解谜', 4), game(4, '猫咪旅馆', 'Switch', '解谜', 3), game(7, '慢车旅人', 'PS5', '冒险', 5, 2), game(8, '灯塔守望', 'Switch', '冒险', 4), game(9, '小镇邮局', 'PC', '模拟经营', 3), game(10, '星星拼图', '手机', '解谜', 2), game(11, '雨夜书店', 'Steam', '冒险', 4)], last: 7, say: ['雾港侦探你玩了三遍，比哪一年都多。'] },
  // 没有玩第二遍的（最常见）：那一行不出来
  none: { done: [game(1, '纸飞机邮差', 'Steam', '冒险', 4), game(5, '深海食堂', 'Switch', '模拟经营', 5), game(6, '方块山谷', '手机', '解谜', 4), game(4, '猫咪旅馆', 'Switch', '解谜', 3), game(7, '慢车旅人', 'PS5', '冒险', 4)], last: 6, say: ['深海食堂那家店，你开到了第一百天。'] },
};
const KIND_TINT = { 解谜: 'mint', 冒险: 'sky', 模拟经营: 'pink', 动作: 'orange', 角色扮演: 'grape' };
const RUN_NAMES = ['', '', '二周目', '三周目', '四周目', '五周目'];
const runName = (n) => RUN_NAMES[n] || `${n} 周目`;
const tally = (list, key) => Object.entries(list.reduce((a, g) => ((a[g[key]] = (a[g[key]] || 0) + 1), a), {})).sort((a, c) => c[1] - a[1]);
/** 盖在书脊上、写在下面那一行里的小红章：几周目。 */
const runStamp = (n, size = 10.5) => `<span style="flex:none;display:inline-block;padding:0 5px;border:1.5px solid var(--color-danger);border-radius:4px;font-size:${size}px;line-height:${size + 4}px;font-weight:700;color:var(--color-danger);transform:rotate(-4deg);opacity:.9">${runName(n)}</span>`;

/** 掌机：屏幕上是最喜欢的那一部；右边卡带盒里竖着插这一年通关的（多于七个只插最喜欢的七个，下面写还有几个）；
 *  下面三个数和一行「二周目以上」（没有就不出这一行）。 */
function gamesPage(G) {
  const fav = [...G.done].sort((a, c) => c.rating - a.rating)[0];
  const kinds = tally(G.done, 'kind'), plats = tally(G.done, 'platform');
  const again = G.done.filter((g) => g.runs >= 2).sort((a, c) => c.runs - a.runs);
  const x = 40, y = 102, w = 176, h = 268;
  const bodyP = rrect(0, 0, w, h, 18);
  const art = `${fl(bodyP, 3000, soft('pink'), { amp: 0.6 })}${st(bodyP, 3001, { sw: 2.2, amp: 0.6 })}${fl(rrect(16, 18, w - 32, 112, 8), 3002, '#3B4A3A', { amp: 0.3 })}${fl(rrect(26, 28, w - 52, 92, 4), 3003, '#C9DDB0', { amp: 0.3 })}${st(rrect(16, 18, w - 32, 112, 8), 3004, { sw: 1.6, amp: 0.3 })}
${fl(P('M40 168 L52 168 L52 156 L64 156 L64 168 L76 168 L76 180 L64 180 L64 192 L52 192 L52 180 L40 180 Z'), 3005, INK, { amp: 0.15 })}${fl(circle(126, 166, 9), 3006, 'var(--color-cat-pink)', { amp: 0.3 })}${st(circle(126, 166, 9), 3007, { sw: 1.4, amp: 0.3 })}${fl(circle(148, 184, 9), 3008, 'var(--color-cat-pink)', { amp: 0.3 })}${st(circle(148, 184, 9), 3009, { sw: 1.4, amp: 0.3 })}
${st('M60 226 L80 220 M96 226 L116 220', 3010, { sw: 4, c: '#9C8C99', amp: 0.2 })}${[0, 1, 2].map((i) => st(`M${120 + i * 9} 248 L${128 + i * 9} 238`, 3011 + i, { sw: 1.4, amp: 0.1 })).join('')}`;
  const screen = `<span style="position:absolute;left:26px;top:30px;width:${w - 52}px;text-align:center;font-size:11px;line-height:16px;color:#3B4A3A">最喜欢的一部</span><span style="position:absolute;left:26px;top:50px;width:${w - 52}px;text-align:center;font-size:19px;line-height:26px;font-weight:700;color:#24301F">${esc(fav.title)}</span><span style="position:absolute;left:${f(w / 2 - 44)}px;top:84px;width:90px;height:18px">${star5(0, 0, fav.rating, 15, 3)}</span>`;
  const hand = `<div ${b(1, 'grow', `transform-origin:${x + w / 2}px ${y + h}px`)}>${recBtn(fav.key, `left:${x}px;top:${y}px;width:${w}px;height:${h}px`, `<span aria-hidden="true" style="position:absolute;inset:0;transform:rotate(-3deg)">${svg(w, h, art)}${screen}</span>`, `打开原记录：${fav.title}`)}</div>`;
  // 卡带盒：按通关的先后；多于七个时留评分最高的七个（最喜欢的一定在），先后不变
  const keep = new Set([...G.done].sort((a, c) => c.rating - a.rating).slice(0, 7));
  const inBox = G.done.filter((g) => keep.has(g)), more = G.done.length - inBox.length;
  const boxX = 238, boxY = 116, boxW = 188, slotH = 31, boxH = slotH * inBox.length + 20 + (more ? 22 : 0);
  const box = svg(PW, PH, `${fl(rrect(boxX, boxY, boxW, boxH, 8), 3100, 'var(--color-kraft)', { amp: 0.5, op: '.55' })}${st(rrect(boxX, boxY, boxW, boxH, 8), 3101, { sw: 1.8, amp: 0.5 })}`);
  const spines = inBox.map((g, i) => {
    const c = KIND_TINT[g.kind] || 'sky', sy = boxY + 10 + i * slotH;
    return `<div ${b(f(2 + i * 0.25))}>${recBtn(g.key, `left:${boxX + 10}px;top:${sy}px;width:${boxW - 20}px;height:${slotH - 5}px`, `<span aria-hidden="true" style="position:absolute;inset:0">${svg(boxW - 20, slotH - 5, `${fl(rrect(0, 0, boxW - 20, slotH - 5, 4), 3120 + i, g === fav ? 'var(--color-yuzu)' : soft(c), { amp: 0.3 })}${st(rrect(0, 0, boxW - 20, slotH - 5, 4), 3140 + i, { sw: 1.2, amp: 0.3 })}`)}</span><span style="position:relative;display:flex;align-items:center;gap:6px;height:${slotH - 5}px;padding:0 9px;font-size:13px;line-height:18px;white-space:nowrap"><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">${esc(g.title)}</span>${g.runs >= 2 ? runStamp(g.runs, 9.5) : ''}<span style="font-size:10.5px;color:${INK2}">${esc(g.platform)}</span></span>`, `打开原记录：${g.title}`)}</div>`;
  }).join('');
  const rest = more ? `<div ${b(f(2 + inBox.length * 0.25))}><span class="num" style="position:absolute;left:${boxX}px;top:${boxY + boxH - 26}px;width:${boxW}px;text-align:center;font-size:11.5px;line-height:18px;color:${INK2}">还有 ${more} 个</span></div>` : '';
  const sy0 = Math.max(390, boxY + boxH + 18);
  const col = (label, big, small) => `<div style="flex:1;min-width:0"><div style="font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">${label}</div>${big}<div class="num" style="font-size:11px;line-height:16px;color:${INK2};white-space:nowrap">${small}</div></div>`;
  const stats = `<div ${b(4)}>${at(40, sy0, 386, 76, `<div style="display:flex;gap:18px">${col('通关', `<div style="display:flex;align-items:baseline;gap:3px"><span style="font-size:34px;line-height:40px;font-weight:700">${roll(String(G.done.length), 4, 40)}</span>${ink('个', 14)}</div>`, `去年 ${G.last} 个`)}
${col('最常玩的类型', `<div style="font-size:20px;line-height:40px;font-weight:700">${esc(kinds[0][0])}</div>`, `${kinds[0][1]} 个${kinds[1] ? ` · 其次是${esc(kinds[1][0])}` : ''}`)}
${col('最常用的平台', `<div style="font-size:20px;line-height:40px;font-weight:700">${esc(plats[0][0])}</div>`, `${plats[0][1]} 个`)}</div>`)}</div>`;
  // 二周目以上：一个都没有就不出这一行
  const againRow = again.length ? `<div ${b(4.6)}>${at(40, sy0 + 84, 386, 24, `<div style="display:flex;align-items:center;gap:8px;font-size:13px;line-height:22px;white-space:nowrap;overflow:hidden"><span style="color:${INK2}">玩到二周目以上</span><span class="num" style="font-weight:700">${again.length} 个</span><span aria-hidden="true" style="color:${INK2}">·</span>${again.map((g) => `<span style="display:inline-flex;align-items:center;gap:4px">${esc(g.title)}${runStamp(g.runs)}</span>`).join('')}</div>`)}</div>` : '';
  const sayY = sy0 + (again.length ? 120 : 92);
  return page('games', `${head('玩物有志', `这一年通关 ${G.done.length} 个，最喜欢的插在掌机里`)}${hand}${box}${spines}${rest}${stats}${againRow}${say(sayY, G.say, 6)}`);
}

// ======================================================================
// 三、自建模块的通用幕：一套零件 + 三种排法，模型照数据挑
// ======================================================================
// 位置（一页 460 × 600，页头占到 90，柚子的话在最下面）：
//   上下（hero）：H 宽的大块、S 一条、Q 一张纸条；左右（pair）：A、B 两半、S、Q；一列（list）：H 高的一大块、A、B
const LAYOUTS = {
  hero: { H: [34, 98, 392, 178], S: [34, 300, 392, 92], Q: [34, 408, 392, 98] },
  pair: { A: [34, 98, 186, 178], B: [240, 98, 186, 178], S: [34, 300, 392, 92], Q: [34, 408, 392, 98] },
  list: { H: [34, 98, 392, 296], A: [34, 412, 186, 92], B: [240, 412, 186, 92] },
};
const SAY_Y = 522;

const PARTS = {
  /** 大数字：一年有几条（或某个数字字段的合计），可带去年。 */
  big(x, y, w, h, d, seed, bb) {
    const size = h >= 150 && w >= 300 ? 72 : h >= 150 ? 56 : 40;
    return `<div ${b(bb)}>${at(x, y, w, h, `<div style="font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">${esc(d.label)}</div>
<div style="display:flex;align-items:baseline;gap:5px"><span style="font-size:${size}px;line-height:${size + 6}px;font-weight:700">${roll(fmt(d.n), bb, size + 6)}</span>${ink(esc(d.unit), 16)}</div>
${d.last != null ? `<div class="num" style="font-size:11.5px;line-height:17px;color:${INK2};white-space:nowrap">${d.n === d.last ? '和去年一样' : `比去年${d.n > d.last ? '多' : '少'} ${fmt(Math.abs(d.n - d.last))} ${esc(d.unit)}`} · 去年 ${fmt(d.last)}</div>` : ''}`)}${marker(x + 2, y + 18 + size - 4, Math.min(w - 10, 30 + String(fmt(d.n)).length * size * 0.55), seed)}</div>`;
  },
  /** 和去年比：两条，今年柚黄，去年复写纸蓝。 */
  compare(x, y, w, h, d, seed, bb) {
    const max = Math.max(d.n, d.last, 1), bw = w - 70;
    const wa = Math.max(4, (d.n / max) * bw), wz = Math.max(4, (d.last / max) * bw);
    return `<div ${b(bb)}>${at(x, y, w, h, `<div style="font-size:12px;line-height:18px;color:${INK2}">${esc(d.label)}</div>
<div style="position:relative;height:${h - 24}px">${svg(w, h, `${fl(rrect(0, 14, wa, 16, 7), seed, 'var(--color-yuzu)', { amp: 0.3 })}${fl(rrect(0, 50, wz, 11, 5), seed + 1, '#E6ECF8', { amp: 0.3 })}${st(rrect(0, 50, wz, 11, 5), seed + 2, { sw: 1, c: '#5B6FA8', amp: 0.3 })}`)}
<span class="num" style="position:absolute;left:${f(wa + 8)}px;top:10px;font-size:16px;line-height:24px;font-weight:700">${fmt(d.n)} ${esc(d.unit)}</span><span class="num" style="position:absolute;left:${f(wz + 8)}px;top:44px;font-size:11px;line-height:22px;color:#5B6FA8">去年 ${fmt(d.last)}</span></div>`)}</div>`;
  },
  /** 一排星：评分最高的几条，点了看那一条。 */
  stars(x, y, w, h, d, seed, bb) {
    const rows = d.items.slice(0, Math.max(1, Math.floor((h - 24) / 40)));
    return `<div ${b(bb)}>${at(x, y, w, 22, `<div style="font-size:12px;line-height:18px;color:${INK2}">${esc(d.label)}</div>`)}${rows.map((it, i) => `<div ${b(f(bb + 0.3 + i * 0.3))}>${recBtn(it.key, `left:${x}px;top:${y + 24 + i * 40}px;width:${w}px;height:36px`, `<span aria-hidden="true" style="position:absolute;inset:0;border-radius:8px;background:${i === 0 ? 'var(--color-print-cream)' : 'transparent'}"></span><span style="position:relative;display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;white-space:nowrap"><span class="num" style="width:14px;font-size:12px;color:${INK2}">${i + 1}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:15px;line-height:22px;font-weight:${i === 0 ? 700 : 400}">${esc(it.title)}</span><span style="position:relative;width:${5 * 16}px;height:14px">${star5(0, 0, it.rating, 14, 2)}</span></span>`, `打开原记录：${it.title}`)}</div>`).join('')}</div>`;
  },
  /** 分布条：单选、多选字段里各有几条；最多的在最上面。 */
  dist(x, y, w, h, d, seed, bb) {
    const rows = d.rows.slice(0, Math.max(2, Math.floor((h - 24) / 26))), max = Math.max(...rows.map((r) => r.n)), lw = Math.min(70, w * 0.32), bw = w - lw - 34;
    return `<div ${b(bb)}>${at(x, y, w, 22, `<div style="font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">${esc(d.label)}</div>`)}${rows.map((r, i) => `<div ${b(f(bb + 0.2 + i * 0.2))}><span style="position:absolute;left:${x}px;top:${y + 24 + i * 26}px;width:${lw}px;font-size:13px;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.name)}</span>${svg(PW, PH, fl(rrect(x + lw + 4, y + 28 + i * 26, Math.max(6, (r.n / max) * bw), 12, 6), seed + i, i === 0 ? cat(CATS[(seed + i) % 5]) : soft(CATS[(seed + i) % 5]), { amp: 0.3 }))}<span class="num" style="position:absolute;left:${f(x + lw + 10 + (r.n / max) * bw)}px;top:${y + 24 + i * 26}px;font-size:12px;line-height:20px;color:${INK2}">${r.n}</span></div>`).join('')}</div>`;
  },
  /** 十二个月的小条。 */
  months(x, y, w, h, d, seed, bb) {
    return monthBars(x, y + 22, w, h - 22, d.values, seed, bb, { label: d.label, unit: d.unit });
  },
  /** 条目卡：几张贴着的小纸片，写名字和一两个字段。 */
  cards(x, y, w, h, d, seed, bb) {
    const slipOf = (it, i, cx, cy, cw, ch, wide) => { const rot = [-1.5, 1.2, -1, 1.5, -1.2, 1][i]; return `<div ${b(f(bb + i * 0.35))}>${recBtn(it.key, `left:${f(cx)}px;top:${f(cy)}px;width:${f(cw)}px;height:${f(ch)}px`, `${slip(rot)}${i % 2 ? '' : tape(wide ? cw - 90 : cw / 2 - 26, -9, 52, -5, i % 4 ? 1 : 0)}<span style="position:absolute;left:0;top:0;right:0;display:block;padding:12px 14px 0;text-align:left"><span style="display:block;font-size:${wide ? 16 : 15}px;line-height:22px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.title)}</span>${(it.sub || []).map((t) => `<span style="display:block;font-size:${wide ? 12.5 : 11.5}px;line-height:${wide ? 19 : 17}px;color:${INK2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t)}</span>`).join('')}${it.rating ? `<span style="position:relative;display:block;height:16px;margin-top:3px">${star5(0, 0, it.rating, 13, 2)}</span>` : ''}</span>`, `打开原记录：${it.title}`)}</div>`; };
    // 高的位置、条目不多：一条一张宽纸片，竖着贴；别的：一排三张
    if (h >= 200 && d.items.length <= 4) { const n = d.items.length, ch = Math.min(88, (h - 12 * (n - 1)) / n); return d.items.map((it, i) => slipOf(it, i, x + 4, y + 4 + i * (ch + 12), w - 8, ch, true)).join(''); }
    const n = Math.min(d.items.length, w >= 300 ? 3 : 1), cw = (w - (n - 1) * 12) / n, ch = Math.min(h - 8, 92);
    return d.items.slice(0, n).map((it, i) => slipOf(it, i, x + (i % n) * (cw + 12), y + 4, cw, ch, false)).join('');
  },
  /** 引用：备注里的一句，或者链到这一条的笔记、文章里的一句。 */
  quote(x, y, w, h, d, seed, bb) {
    return `<div ${b(bb)}>${recBtn(d.key, `left:${x + 8}px;top:${y + 8}px;width:${w - 16}px;height:${h - 16}px`, `${slip(-1.5)}${tape(w / 2 - 40, -9, 64, 4, 1)}<span style="position:relative;display:block;padding:14px 18px 0;text-align:left"><span style="display:block;font-size:15px;line-height:24px;max-height:48px;overflow:hidden">「${esc(clip(d.text, 40))}」</span><span style="display:block;margin-top:4px;font-size:11px;line-height:16px;color:${INK2};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.from)}</span></span>`, '打开原记录')}</div>`;
  },
  /** 合计：数字字段加起来，打成一张小票。 */
  sum(x, y, w, h, d, seed, bb) {
    const rows = d.rows.slice(0, Math.max(1, Math.floor((h - 70) / 20)));
    const zig = `polygon(0 0,100% 0,100% calc(100% - 6px),${Array.from({ length: 13 }, (_, i) => `${f(100 - (i * 100) / 12)}% ${i % 2 ? '100%' : 'calc(100% - 6px)'}`).join(',')})`;
    return `<div ${b(bb)}><div style="position:absolute;left:${x + 8}px;top:${y}px;width:${w - 16}px;height:${h}px"><span aria-hidden="true" style="position:absolute;inset:0;background:#FFFFFF;box-shadow:0 1px 2px rgba(0,0,0,.16);transform:rotate(1.2deg);clip-path:${zig}"></span><div style="position:relative;padding:10px 14px 0"><div style="font-size:12px;line-height:18px;color:${INK2};text-align:center">${esc(d.label)}</div>${rows.map(([n, v]) => `<div style="display:flex;gap:6px;font-size:12.5px;line-height:20px;white-space:nowrap"><span style="overflow:hidden;text-overflow:ellipsis">${esc(n)}</span><span aria-hidden="true" style="flex:1;border-bottom:1.5px dotted var(--color-print-rule);transform:translateY(-5px)"></span><span class="num">${fmt(v)}</span></div>`).join('')}<div style="margin-top:4px;border-top:1.5px dashed var(--color-print-rule);display:flex;justify-content:space-between;align-items:baseline;padding-top:4px;font-weight:700"><span style="font-size:13px">合计</span><span class="num" style="font-size:20px;line-height:28px">${roll(fmt(d.total), bb + 0.5, 28)} <span style="font-size:12px;font-weight:400">${esc(d.unit)}</span></span></div></div></div></div>`;
  },
  /** 学完的几门（循序渐进）：一门一根进度条，学完的盖一个小金星。 */
  courses(x, y, w, h, d, seed, bb) {
    const rows = d.items.slice(0, Math.max(1, Math.floor((h - 26) / 44))), bw = w - 8;
    return `<div ${b(bb)}>${at(x, y, w, 22, `<div style="font-size:12px;line-height:18px;color:${INK2}">${esc(d.label)}</div>`)}${rows.map((c, i) => { const yy = y + 26 + i * 44, fw = Math.max(8, (c.done / c.total) * bw), yr = Math.max(0, (c.year / c.total) * bw); return `<div ${b(f(bb + 0.3 + i * 0.4))}>${recBtn(c.key, `left:${x}px;top:${yy}px;width:${w}px;height:40px`, `<span style="position:absolute;left:0;top:0;right:0;display:flex;align-items:baseline;gap:6px;font-size:14px;line-height:20px;white-space:nowrap"><span style="font-weight:700;overflow:hidden;text-overflow:ellipsis">${esc(c.name)}</span><span class="num" style="font-size:11px;color:${INK2}">${c.done}/${c.total} ${esc(d.unit)}${c.finished ? ` · ${md(c.finished)} 学完` : ''}</span></span><span aria-hidden="true" style="position:absolute;left:0;top:24px;width:${bw}px;height:12px">${svg(bw, 12, `${fl(rrect(0, 1, bw, 10, 5), seed + i * 3, 'var(--color-print-cream)', { amp: 0.2 })}${fl(rrect(0, 1, fw, 10, 5), seed + i * 3 + 1, soft(CATS[i % 5]), { amp: 0.25 })}${yr ? fl(rrect(fw - yr, 1, yr, 10, 5), seed + i * 3 + 2, cat(CATS[i % 5]), { amp: 0.25 }) : ''}${st(rrect(0, 1, bw, 10, 5), seed + 40 + i, { sw: 1.1, amp: 0.2 })}`)}</span>${c.finished ? useStar('zgold', bw - 6, 14, 20, 'transform:rotate(12deg)') : ''}`, `打开原记录：${c.name}`)}</div>`; }).join('')}</div>`;
  },
  /** 多选的词：一个词一张圆贴纸，用得多的大；词和数字两行、一起放在圆的正中，四周至少留 6 像素（圆按字的大小撑开，
   *  不会比字小）。一行放不下就换行，位置里放不下的词不放（用得少的先不放）。 */
  chips(x, y, w, h, d, seed, bb) {
    const max = Math.max(...d.rows.map((r) => r.n)), room = h - 26, gap = 10, FW = 13, NW = 11, LH = 17, NH = 15;
    const sized = d.rows.map((r, i) => {
      const tw = Math.max([...r.name].length * FW, String(r.n).length * NW * 0.62), th = LH + NH;
      const need = Math.hypot(tw + 12, th + 12);
      return { r, i, s: Math.min(Math.max(need, 56 + (r.n / max) * 18), Math.max(need, room)) };
    });
    // 排成几行，每行在位置里横着居中；放不下就从用得最少的那个起不放
    const pack = (list) => { const ls = [[]]; let lw = 0; for (const c of list) { if (lw && lw + gap + c.s > w) { ls.push([]); lw = 0; } ls[ls.length - 1].push(c); lw += (lw ? gap : 0) + c.s; } return ls; };
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
    return `<div ${b(bb)}>${at(x, y, w, 22, `<div style="font-size:12px;line-height:18px;color:${INK2}">${esc(d.label)}</div>`)}</div>${out}`;
  },
};
/** 每个零件能放在哪种位置（Rust 照这张表核对模型的排法）。 */
const FITS = { big: 'HAB', compare: 'HAB', stars: 'HAB', dist: 'HAB', months: 'S', cards: 'QH', quote: 'Q', sum: 'HAB', courses: 'HA', chips: 'HAB' };
const PART_NAMES = { big: '大数字', compare: '和去年比', stars: '一排星', dist: '分布条', months: '十二个月', cards: '条目卡', quote: '引用', sum: '合计（小票）', courses: '学完的几门', chips: '多选的词' };

/** 照一份「排法」（模型给的，Rust 填好了数）画一页。 */
function customPage(m, plan, data, seed) {
  const L = LAYOUTS[plan.layout];
  const parts = Object.entries(plan.slots).map(([slot, s], i) => { const [x, y, w, h] = L[slot]; return PARTS[s.part](x, y, w, h, data[slot], seed + i * 100, 1 + i * 1.2); }).join('');
  return page(`custom`, `<div style="position:absolute;right:30px;top:26px;line-height:0;transform:rotate(8deg)">${K.mark(m.mark, 44)}</div>${head(esc(m.name), esc(m.sub))}${parts}${say(SAY_Y, plan.lines, 6)}`);
}

// 例子：一份清单「咖啡馆」、一份进度「日语」、条目很少的清单「想去的展」、带数字的清单「爬过的山」
const EX = [
  {
    m: { name: '咖啡馆', mark: 'coffee', sub: '五花八门 · 这一年新去了 23 家', key: 'list/3' },
    fields: '评分（星）· 区域（单选）· 价格（数字，元）· 招牌（多选）· 备注（长文字）',
    plan: { layout: 'pair', slots: { A: { part: 'big', of: '条目' }, B: { part: 'dist', field: '区域' }, S: { part: 'months' }, Q: { part: 'quote', ref: 'list/3:41:备注' } }, lines: ['江边那家你去了最多次，可颂值得为它早起。'] },
    data: {
      A: { label: '这一年新去了', n: 23, unit: '家', last: 15 },
      B: { label: '区域', rows: [{ name: '江边', n: 9 }, { name: '老城', n: 7 }, { name: '学校附近', n: 4 }, { name: '其他', n: 3 }] },
      S: { label: '每个月新去的', values: [1, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 1], unit: '家' },
      Q: { key: 'item:41', text: '江边那家的可颂，值得为它早起。', from: '备注 · 江边的小窗咖啡 · ★★★★★' },
    },
  },
  {
    m: { name: '日语', mark: 'grad', sub: '循序渐进 · 这一年学完 49 课', key: 'progress/2' },
    fields: '课本（门）· 课（节）· 完成日期 · 类型（听力、语法、单词）',
    plan: { layout: 'hero', slots: { H: { part: 'courses' }, S: { part: 'months' }, Q: { part: 'quote', ref: 'note:88' } }, lines: ['初级 1 在六月学完了，初级 2 也过了一半。'] },
    data: {
      H: { label: '学完的几门', unit: '课', items: [{ key: 'course:21', name: '大家的日语 初级 1', done: 25, total: 25, year: 18, finished: '2026-06-12' }, { key: 'course:22', name: '大家的日语 初级 2', done: 13, total: 25, year: 13 }, { key: 'course:23', name: '听力练习', done: 18, total: 30, year: 18 }] },
      S: { label: '每个月学完的课', values: [6, 5, 7, 4, 6, 9, 2, 1, 3, 2, 3, 1], unit: '课' },
      Q: { key: 'note:88', text: '第一次听懂了便利店店员说的整句话，出门时脚步都轻了。', from: '念念不忘 · 9 月 3 日 · 链到「日语」' },
    },
  },
  {
    m: { name: '想去的展', mark: 'camera', sub: '五花八门 · 这一年去了 3 场', key: 'list/5' },
    fields: '城市（单选）· 去了没（单选）· 日期 · 备注',
    plan: { layout: 'list', slots: { H: { part: 'cards' }, A: { part: 'big', of: '条目' }, B: { part: 'chips', field: '城市' } }, lines: ['三场都是一个人去的，最后一场看到闭馆。'] },
    data: {
      H: { items: [{ key: 'item:7', title: '纸的形状', sub: ['上海 · 3 月 9 日', '「纸折出来的山，比真的还安静。」'] }, { key: 'item:9', title: '海边的房子', sub: ['杭州 · 6 月 1 日'] }, { key: 'item:12', title: '一百把椅子', sub: ['上海 · 11 月 2 日', '看到闭馆'] }] },
      A: { label: '去了', n: 3, unit: '场', last: 1 },
      B: { label: '城市', rows: [{ name: '上海', n: 2 }, { name: '杭州', n: 1 }] },
    },
  },
  {
    m: { name: '爬过的山', mark: 'mountain', sub: '五花八门 · 这一年爬了 9 座', key: 'list/6' },
    fields: '公里（数字）· 爬升（数字，米）· 评分（星）· 和谁（多选）',
    plan: { layout: 'pair', slots: { A: { part: 'sum', field: '公里' }, B: { part: 'stars', field: '评分' }, S: { part: 'months' }, Q: { part: 'cards' } }, lines: ['九座山加起来走了 86 公里，差不多从家走到海边。'] },
    data: {
      A: { label: '公里', rows: [['十里山', 14], ['雾岭', 12], ['东湖绿道', 8], ['还有 6 座', 52]], total: 86, unit: '公里' },
      B: { label: '最喜欢的', items: [{ key: 'item:3', title: '雾岭', rating: 5 }, { key: 'item:1', title: '十里山', rating: 5 }, { key: 'item:6', title: '后山小路', rating: 4 }] },
      S: { label: '每个月爬的', values: [0, 1, 2, 1, 2, 0, 0, 0, 1, 2, 0, 0], unit: '座' },
      Q: { items: [{ key: 'item:3', title: '雾岭', sub: ['10 月 1 日 · 12 公里'] }, { key: 'item:1', title: '十里山', sub: ['3 月 21 日 · 14 公里'] }, { key: 'item:8', title: '东湖绿道', sub: ['5 月 4 日 · 8 公里'] }] },
    },
  },
];

// ======================================================================
// 画板
// ======================================================================
const CSS = `
html,body{margin:0}
.board{background:var(--color-desk)}
.deskbg{position:absolute;inset:0}
${ZINE_CSS}
.pg{position:absolute;width:${PW}px;height:${PH}px}
.pg .zp{box-shadow:0 2px 4px var(--zshadow),0 14px 30px var(--zshadow);border-radius:6px}
.pg .zno{display:none}
.cap{position:absolute;font-size:14px;line-height:22px;color:var(--color-ink-soft);white-space:nowrap}
.cap b{color:var(--color-ink)}
.ttl{position:absolute;font-size:22px;line-height:30px;font-weight:700}
.sub{position:absolute;font-size:14px;line-height:22px;color:var(--color-ink-soft)}
.code{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:11.5px;line-height:17px;white-space:pre;color:var(--color-ink)}
`;
const pg = (x, y, html, cap) => `<div class="pg still" style="left:${x}px;top:${y}px">${html}</div>${cap ? `<div class="cap" style="left:${x}px;top:${y + PH + 10}px">${cap}</div>` : ''}`;
const note = (x, y, w, title, text, seed, tilt = -1.2) => `<div class="pm-note" data-hand="note" data-seed="${seed}" data-tilt="${tilt}" data-tapes="1" style="position:absolute;left:${x}px;top:${y}px;width:${w}px"><div style="font-size:15px;line-height:24px;font-weight:700">${title}</div><div style="font-size:13.5px;line-height:21px">${text}</div></div>`;
const card = (x, y, w, title, meta, inner, seed) => `<div class="pm-card" data-hand="card" data-seed="${seed}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px"><div class="pm-card-title">${title}${meta ? `<span class="pm-card-meta">${meta}</span>` : ''}</div>${inner}</div>`;

/** 换一份数据看树：三个主标签，子标签多一些（放大一点画）。 */
function treePage() {
  const tree = tagTree(W.tags2, 230, 540, 1.25, 2700, 1, { top: 90, H: 300 });
  return page('writing', `${head('换一份数据看树', '三个主标签，子标签多一些 · 放大一点画 · 树顶是柚子')}${svg(PW, PH, tree.art)}<div ${b(2.6, 'fade')}>${tree.labels}</div>`);
}

function writingBoard() {
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="760"></div>${atlasDefs()}
<div class="ttl" style="left:40px;top:28px">写下的字 · 见字如面这一年（两幕，第三轮：小树）</div>
<div class="sub" style="left:40px;top:60px">小树改成：中间一根竖着的树干（不代表哪个标签），主标签是从树干上左右伸出去的枝，子标签是枝上的小枝，柚子大小就是篇数。树顶两种，挑一种。</div>
${pg(40, 110, writingStats('yuzu'), '<b>A · 树顶坐着柚子</b>：一簇叶子里坐着柚子')}
${pg(530, 110, writingStats('sign'), '<b>B · 小木牌</b>：树顶一簇叶子，树干下面挂一块木牌，写没打标签的几篇')}
${pg(1020, 110, treePage(), '同一棵树换一份数据（三个主标签、子标签多）')}
${pg(1510, 110, writingMoments(), '第二幕 · 重要的时刻（上一轮看过，没改）')}
${note(2000, 110, 300, '小树怎么长', '中间一根竖着的树干，干上长几片叶子。每个主标签是从树干上伸出去的一根枝（写得多的在下面、更粗更长，左右交替，最多六根），枝头一簇叶子，外面写名字和篇数。子标签是这根枝上的小枝（每根最多三个），小枝头垂下一个柚子：篇数越多柚子越大，只写名字、不写数字。', 761, -1.5)}
${note(2000, 400, 300, '节拍', '第一幕：数字滚出来 → 树干长出来 → 树顶（柚子或木牌）→ 枝上的叶子 → 柚子一个个挂上 → 名字 → 铅笔一排出来。', 762, 1.2)}
${note(2000, 580, 300, '要你定', '树顶要 A（柚子）还是 B（木牌）。B 的木牌写的是一个标签都没打的那几篇：它们不在哪根枝上，就算在树干上；一篇都没有就不挂。', 763, -1)}`;
}

function gamesBoard() {
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="770"></div>${atlasDefs()}
<div class="ttl" style="left:40px;top:28px">玩物有志 · 这一年通关的（B · 掌机）</div>
<div class="sub" style="left:40px;top:60px">紧跟「书影相遇」。只算这一年通关的（完成时间在这一年）；没通关的这一幕不出现。三份编的数据：平常的一年、玩得多的一年、没有玩第二遍的一年。</div>
${pg(40, 110, gamesPage(GAMES.one), '<b>平常的一年</b>：七个，一个玩了二周目')}
${pg(530, 110, gamesPage(GAMES.many), '<b>玩得多的一年</b>：十一个，盒子只插最喜欢的七个')}
${pg(1020, 110, gamesPage(GAMES.none), '<b>没有玩第二遍的</b>：「二周目以上」那一行不出来')}
${note(1510, 110, 300, '这一页放什么', '掌机屏幕上是最喜欢的一部（评分最高，同分柚子挑）；卡带盒里竖着插这一年通关的，按通关的先后，最喜欢的那盒是柚黄，玩了不止一遍的书脊上盖一个小红章（二周目、三周目…）。下面：通关几个和去年比、最常玩的类型、最常用的平台；再下面一行「玩到二周目以上」：几个、是哪几个，一个都没有就不出这一行。', 771, -1.5)}
${note(1510, 420, 300, '节拍', '掌机先弹出来 → 卡带一盒一盒插进盒子 → 三个数滚出来 → 二周目那一行 → 柚子说一句。一共 6 拍。', 772, 1.2)}
${note(1510, 570, 300, '我先定了', '多于七个只插评分最高的七个（最喜欢的一定在、先后不变），盒子下面写「还有几个」。「玩到二周目以上」按周目数从多到少排。', 773, -1)}`;
}

function kitBoard() {
  const cells = [
    ['big', 'H A B', '一年几条，或者某个数字字段的合计；有去年就写去年', { label: '这一年新去了', n: 23, unit: '家', last: 15 }, 186, 120],
    ['compare', 'H A B', '和去年比：今年、去年两条', { label: '和去年比', n: 49, last: 20, unit: '课' }, 186, 100],
    ['stars', 'H A B', '评分字段最高的几条（同分的看柚子挑的）', { label: '最喜欢的', items: [{ key: 'a', title: '雾岭', rating: 5 }, { key: 'b', title: '十里山', rating: 5 }, { key: 'c', title: '后山小路', rating: 4 }] }, 186, 150],
    ['dist', 'H A B', '单选、多选字段里各有几条', { label: '区域', rows: [{ name: '江边', n: 9 }, { name: '老城', n: 7 }, { name: '学校附近', n: 4 }, { name: '其他', n: 3 }] }, 186, 130],
    ['chips', 'H A B', '多选字段的词：一个词一张圆贴纸，用得多的大，字在正中', { label: '招牌', rows: [{ name: '手冲', n: 11 }, { name: '可颂', n: 7 }, { name: '拿铁', n: 5 }, { name: '甜点', n: 3 }] }, 186, 178],
    ['sum', 'H A B', '数字字段加起来，打成一张小票', { label: '公里', rows: [['十里山', 14], ['雾岭', 12], ['还有 7 座', 60]], total: 86, unit: '公里' }, 186, 150],
    ['courses', 'H A', '循序渐进：一门一根进度条，这一年学的那段颜色深，学完的有金星', { label: '学完的几门', unit: '课', items: [{ key: 'x', name: '初级 1', done: 25, total: 25, year: 18, finished: '2026-06-12' }, { key: 'y', name: '初级 2', done: 13, total: 25, year: 13 }] }, 260, 120],
    ['months', 'S', '十二个月一排小条，最多的那个月柚黄', { label: '每个月新去的', values: [1, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 1], unit: '家' }, 392, 92],
    ['cards', 'Q H', '条目卡：名字和一两个字段，贴在纸上', { items: [{ key: 'p', title: '纸的形状', sub: ['上海 · 3 月 9 日'] }, { key: 'q', title: '海边的房子', sub: ['杭州 · 6 月 1 日'] }, { key: 'r', title: '一百把椅子', sub: ['上海 · 11 月 2 日'] }] }, 392, 98],
    ['quote', 'Q', '引用：备注里的一句，或者链到这一条的笔记、文章里的一句', { key: 'z', text: '江边那家的可颂，值得为它早起。', from: '备注 · 江边的小窗咖啡' }, 392, 98],
  ];
  let x = 40, y = 110, rowH = 0;
  const out = cells.map(([key, fits, what, d, w, h], i) => {
    const cw = w + 40, chh = h + 104;
    if (x + cw > 1880) { x = 40; y += rowH + 24; rowH = 0; }
    const html = `<div class="still" style="position:absolute;left:${x}px;top:${y}px;width:${cw}px;height:${chh}px"><section class="zp" data-theme="light" style="position:absolute;left:0;top:0;width:${cw}px;height:${chh}px;background:var(--color-print-paper);border-radius:8px;box-shadow:0 1px 2px var(--zshadow),0 8px 18px var(--zshadow)">
<div style="position:absolute;left:20px;top:12px;right:16px;display:flex;align-items:baseline;gap:8px;white-space:nowrap"><span style="font-size:16px;line-height:24px;font-weight:700">${PART_NAMES[key]}</span><span class="num" style="font-size:11px;color:var(--color-print-ink-soft)">${key} · 放在 ${fits}</span></div>
<div style="position:absolute;left:0;top:0">${PARTS[key](20, 44, w, h, d, 3200 + i * 50, 0)}</div>
<div style="position:absolute;left:20px;right:16px;bottom:10px;font-size:11.5px;line-height:17px;color:var(--color-print-ink-soft)">${what}</div></section></div>`;
    x += cw + 24; rowH = Math.max(rowH, chh);
    return html;
  }).join('');
  const lay = Object.entries(LAYOUTS).map(([k, L], i) => {
    const s = 0.36, names = { hero: '上下（hero）', pair: '左右（pair）', list: '一列（list）' };
    const boxes = Object.entries(L).map(([slot, [bx, by, bw, bh]]) => `<span style="position:absolute;left:${f(bx * s)}px;top:${f(by * s)}px;width:${f(bw * s)}px;height:${f(bh * s)}px;border:1.5px dashed var(--color-print-rule);border-radius:4px;display:grid;place-items:center;font-size:13px;font-weight:700;color:var(--color-print-ink-soft)">${slot}</span>`).join('');
    return `<div style="display:flex;flex-direction:column;gap:6px"><div style="position:relative;width:${f(PW * s)}px;height:${f(PH * s)}px;background:var(--color-print-paper);border-radius:4px;box-shadow:0 1px 2px var(--zshadow)" data-theme="light">${boxes}<span style="position:absolute;left:${f(34 * s)}px;top:${f(SAY_Y * s)}px;width:${f(392 * s)}px;height:4px;border-radius:2px;background:var(--color-yuzu)"></span></div><span style="font-size:13px;line-height:20px">${names[k]}</span></div>`;
  }).join('');
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="780"></div>${atlasDefs()}
<div class="ttl" style="left:40px;top:28px">通用幕的零件</div>
<div class="sub" style="left:40px;top:60px">五花八门、循序渐进建的模块，一个模块一幕。程序不定死这一幕长什么样：设计给这十个零件、三种排法，柚子看这一年的数据挑。数字都是程序算的，柚子只挑、只写那一句。</div>
${out}
${card(x, y, 640, '三种排法', '黄条是柚子那一句的位置', `<div style="display:flex;gap:22px;margin-top:10px">${lay}</div><div style="margin-top:12px;font-size:13px;line-height:20px;color:var(--color-ink-soft)">H 宽的大块 · A、B 左右两半 · S 一条（只放十二个月） · Q 一张纸条（引用、条目卡）。每个零件后面写着它能放哪几种位置，Rust 照这张表核对。</div>`, 781)}`;
}

function customBoard() {
  const x0 = 40;
  const items = EX.map((e, i) => {
    const x = x0 + i * 490;
    const plan = JSON.stringify(e.plan, null, 1).replace(/\n\s*/g, ' ').replace(/\{ /g, '{').replace(/ \}/g, '}');
    return `${pg(x, 110, customPage(e.m, e.plan, e.data, 3500 + i * 400), `<b>${e.m.name}</b> · ${e.plan.layout}`)}
<div style="position:absolute;left:${x}px;top:${110 + PH + 40}px;width:${PW}px"><div style="font-size:12.5px;line-height:19px;color:var(--color-ink-soft)">字段：${e.fields}</div><div class="pm-card" data-hand="card" data-seed="${790 + i}" style="margin-top:8px;padding:12px 14px"><div style="font-size:12px;line-height:18px;color:var(--color-ink-soft);margin-bottom:4px">柚子给的排法（数字由程序填）</div><div class="code" style="white-space:pre-wrap;word-break:break-all">${esc(plan)}</div></div></div>`;
  }).join('');
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="789"></div>${atlasDefs()}
<div class="ttl" style="left:40px;top:28px">通用幕 · 四个模块排出来的样子</div>
<div class="sub" style="left:40px;top:60px">同一套零件，照每个模块这一年的数据排：清单（咖啡馆）、进度（日语）、条目很少的清单（想去的展）、带数字的清单（爬过的山）。右上角是这个模块自己的贴纸。</div>
${items}`;
}

/** 目录：幕多了（加了自建模块）一页放不下时排两栏。 */
function tocPage() {
  const rows = [['star', '序章 · 星图'], ['notes', '留下的日子'], ['articles', '写下的字', 1], ['articles', '重要的时刻', 1], ['books', '书影相遇'], ['games', '玩物有志', 1], ['packing', '几个具体时刻'], ['days', '去年的回声'], ['drawing', '创作'], ['coffee', '咖啡馆', 1], ['grad', '日语', 1], ['jobs', '求职这一年'], ['todo', '身体和习惯'], ['heart', '和柚子聊的事'], ['finance', '钱'], ['letter', '终章 · 柚子的来信']];
  const half = Math.ceil(rows.length / 2);
  const col = (list, x, off) => `<div style="position:absolute;left:${x}px;top:100px;width:186px;display:flex;flex-direction:column;gap:2px">${list.map(([mk, name, isNew], i) => `<div style="display:flex;align-items:center;gap:7px;height:30px;font-size:14px;line-height:20px">${K.mark(mk, 22)}<span style="white-space:nowrap;${isNew ? 'font-weight:700' : ''}">${name}</span><span aria-hidden="true" style="flex:1;border-bottom:2px dotted ${RULE};transform:translateY(-4px)"></span><span class="num" style="width:18px;text-align:right;color:${INK2}">${off + i + 1}</span></div>`).join('')}</div>`;
  return page('toc', `${head('这一期', `${rows.length} 幕 · 柚子按这一年的记录挑的`)}${col(rows.slice(0, half), 34, 0)}${col(rows.slice(half), 240, half)}
<div style="position:absolute;left:34px;top:${100 + half * 32 + 18}px;right:34px;font-size:12px;line-height:18px;color:${INK2}">粗的是 1.1.0 新加的（审看时才加粗）</div>`);
}

function flowBoard() {
  const step = (x, y, w, t, d) => `<div class="pm-card" data-hand="card" data-seed="${800 + x}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:14px 16px"><div style="font-size:16px;line-height:24px;font-weight:700">${t}</div><div style="font-size:13px;line-height:20px;color:var(--color-ink-soft)">${d}</div></div>`;
  const arrow = (x, y) => `<div style="position:absolute;left:${x}px;top:${y}px;width:40px;height:20px">${svg(40, 20, st('M2 10 L36 10 M28 3 L37 10 L28 17', 811 + x, { sw: 2, c: 'var(--color-ink-soft)', amp: 0.4 }))}</div>`;
  const skill = readFileSync(path.join(HERE, 'SKILL.md'), 'utf8');
  const skillHtml = esc(skill).replace(/^### (.*)$/gm, '<b style="font-size:13px">$1</b>').replace(/^## (.*)$/gm, '<b style="font-size:14px">$1</b>').replace(/^# (.*)$/gm, '<b style="font-size:15px">$1</b>').replace(/`([^`]+)`/g, '<span style="font-family:ui-monospace,Menlo,monospace;font-size:11.5px">$1</span>');
  return `<div class="pm-desk deskbg" data-hand="desk" data-seed="799"></div>${atlasDefs()}
<div class="ttl" style="left:40px;top:28px">新的几幕放在哪 · 通用幕怎么排出来</div>
<div class="sub" style="left:40px;top:60px">Tabloid 1.1.0 = 1.0.3 加上这几幕（写下的字两幕、玩物有志、自建模块的通用幕）。1.0.3 留着，以前照 1.0.x 做的几份照旧用它画，没有这几幕。</div>
${pg(40, 110, tocPage(), '目录 · 幕多了排两栏')}
${step(540, 120, 300, '1 · Rust 整理', '这一年有数据的自建模块：模块名、贴纸、字段（名字和种类）、这一年的条目（清单按第一个「年份」字段算哪一年，没有就按加进来的那天；进度按完成的课节）、去年的数、链到这些条目的笔记和文章里的话。隐藏的、芝麻开门的不给。')}
${arrow(850, 160)}
${step(900, 120, 300, '2 · 柚子照 SKILL 排', '每个模块回一份排法：放不放、用哪种排法、每个位置放哪个零件、引用哪个字段或哪条记录、一两句话。不写数字。')}
${arrow(1210, 160)}
${step(1260, 120, 300, '3 · Rust 核对、填数', '零件能不能放那个位置、字段在不在、是不是那种字段、引用的记录在不在：不对就告诉柚子哪里不对、再要两次，还不行这个模块按默认的排法画。数字一律程序算。')}
${step(1260, 330, 300, '4 · 设计画', '照零件和数画这一页，和别的幕一样跟着节拍出来、点了弹出原记录。存进「呈现结果」，以后打开照旧。')}
<div style="position:absolute;left:1400px;top:300px;width:20px;height:30px">${svg(20, 30, st('M10 2 L10 26 M3 18 L10 27 L17 18', 830, { sw: 2, c: 'var(--color-ink-soft)', amp: 0.4 }))}</div>
${card(540, 330, 680, 'SKILL（草稿）', '给柚子看的：怎么挑零件', `<div style="margin-top:8px;font-size:12.5px;line-height:19px;white-space:pre-wrap">${skillHtml}</div>`, 840)}
${note(1260, 520, 300, '要你定', '自建模块的几幕放在「创作」后面（都是自己的爱好和学的东西）；一年最多放几个自建模块（建议不限，柚子挑有意思的）；柚子的信里写到它们。', 841, 1.2)}`;
}

function board(file, title, w, h, inner) {
  const props = { palette: { editor: 'enum', options: PALETTES, default: PALETTES[0], section: '配色' }, dark: { editor: 'boolean', default: false, section: '配色' }, $preview: { width: w, height: h } };
  const script = `class Component extends DCLogic {
  renderVals() { const p = this.props; return { palette: p.palette ?? 'blue', theme: p.dark ? 'dark' : 'light', motion: 'reduce' }; }
  componentDidMount() { this.stop = Pomelo.paintLive(document.body); }
  componentDidUpdate() { Pomelo.paint(document.body); }
  componentWillUnmount() { this.stop && this.stop(); }
}`;
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="ds/pomelo/tokens.css">
<link rel="stylesheet" href="ds/pomelo/components/bundle.css">
<script src="ds/pomelo/components/bundle.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
${CSS}
</style>
</helmet>
<div class="pm root board" data-palette="{{palette}}" data-theme="{{theme}}" data-motion="{{motion}}" style="width:${w}px;height:${h}px">
${inner}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${JSON.stringify(props).replace(/'/g, '&#39;')}'>
${script}
</script>
</body>
</html>
`;
  if (/<\/script/i.test(script)) throw new Error('script');
  writeFileSync(path.join(PROJECT, file), html);
  console.log(file, (html.length / 1024).toFixed(0) + ' KB');
  return { file, title, w, h };
}

const boards = [
  board('Scenes-Writing.dc.html', '写下的字（见字如面这一年）· 两幕', 2340, 800, writingBoard()),
  board('Scenes-Games.dc.html', '玩物有志 · B 掌机', 1850, 800, gamesBoard()),
  board('Scenes-Kit.dc.html', '通用幕的零件和排法', 2090, 820, kitBoard()),
  board('Scenes-Custom.dc.html', '通用幕 · 四个模块排出来的样子', 1980, 960, customBoard()),
  board('Scenes-Flow.dc.html', '新的几幕放在哪 · 通用幕怎么排出来', 1600, 1080, flowBoard()),
];
const pos = [[0, 0], [0, 900], [2440, 0], [2440, 940], [4640, 0]];
writePage({
  id: 'x8',
  name: 'EX8：Atlas 新的几幕',
  prefix: 'Scenes-',
  boards: boards.map((b, i) => ({ file: b.file, x: pos[i][0], y: pos[i][1], w: b.w, h: b.h, title: b.title, radius: 12 })),
  notes: { how: { x: 4640, y: 1140, w: 560, fill: 'orange', text: 'Pomelo v1.0 Phase 7 · 第三轮（11-16）\n\n· 站主挑了树顶 B（木牌）：写下的字两幕定稿成 Tabloid 1.1.1（替掉 1.1.0），同步进了 Pomelo。A（树顶坐着柚子）留在这里，没用。\n· 玩物有志（B · 掌机）和通用幕在 1.1.0 定稿。\n\n数据全是编的。' } },
});
