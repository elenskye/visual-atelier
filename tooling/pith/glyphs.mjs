// Pith 的图形：Logo、图标、十种记录、生长阶段、Agent 图标的几何（图形语言「铅字 × 数字花园」，站主 2026-11-23 定画法、11-24 验收）。
// 唯一的一份：schemes/pith/marks/ 的 SVG、动效零件的片段、Pith Explore 的画板都从这里出（node tooling/pith/build.mjs）。
// 内联用的标记带类名：.t 一组、.so 实心（currentColor）、.st 细线（pathLength=1，动画重写）、.co 珊瑚色；样式在 Design System 的 bundle.css（.pith-glyph）。
// 规矩：48 格；实心的「铅字」部分（.so）粗细对比（粗笔约 5、细笔 2.2）；细线（.st，带 pathLength，悬停时重写一遍）；
// 每个图标一处珊瑚色（.co）：芽、种子、注码，是它「活」的那一点。植物的特征：叶序（互生的叶）、叶脉（实心叶里一道细缝）、
// 卷须和蕨芽（细线卷起来，末端一颗球，像铅字的球形收笔）、轮生（一圈叶子）、髓（茎的芯）。
const n1 = (v) => Math.round(v * 100) / 100;
const P = (x, y) => `${n1(x)} ${n1(y)}`;
const rot = ([x, y], [cx, cy], a) => { const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]; };

/** 实心的叶：从 base 长到 tip，最宽 w；rib 为真时中间留一道细缝（叶脉，evenodd）。 */
export function leaf(base, tip, w, { rib = true, cls = 'so', bulge = 0.42 } = {}) {
  const dx = tip[0] - base[0], dy = tip[1] - base[1], L = Math.hypot(dx, dy);
  const u = [dx / L, dy / L], nn = [-u[1], u[0]];
  const at = (t, o) => [base[0] + dx * t + nn[0] * o, base[1] + dy * t + nn[1] * o];
  const k = w * 1.33;
  let d = `M${P(...base)}C${P(...at(bulge * 0.55, k))} ${P(...at(0.78, k * 0.92))} ${P(...tip)}C${P(...at(0.78, -k * 0.92))} ${P(...at(bulge * 0.55, -k))} ${P(...base)}Z`;
  if (rib && L > 8) {
    const h = Math.max(0.5, w * 0.13);
    const a = at(0.2, 0), b = at(0.74, 0);
    d += `M${P(a[0] + nn[0] * h, a[1] + nn[1] * h)}L${P(b[0] + nn[0] * h * 0.4, b[1] + nn[1] * h * 0.4)}L${P(b[0] - nn[0] * h * 0.4, b[1] - nn[1] * h * 0.4)}L${P(a[0] - nn[0] * h, a[1] - nn[1] * h)}Z`;
  }
  return `<path class="${cls}" fill-rule="evenodd" d="${d}"/>`;
}
const ball = (cx, cy, r, cls = 'co') => `<circle class="${cls}" cx="${n1(cx)}" cy="${n1(cy)}" r="${r}"/>`;
const st = (d, w = 2.2) => `<path class="st" pathLength="1" d="${d}" stroke-width="${w}"/>`;
const rect = (x, y, w, h, r = 0.6, cls = 'so') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const ring = (cx, cy, R, r, cls = 'so', dx = 0, dy = 0) => `<path class="${cls}" fill-rule="evenodd" d="M${P(cx, cy - R)}A${R} ${R} 0 1 1 ${P(cx, cy + R)}A${R} ${R} 0 1 1 ${P(cx, cy - R)}ZM${P(cx + dx, cy + dy - r)}A${r} ${r} 0 1 0 ${P(cx + dx, cy + dy + r)}A${r} ${r} 0 1 0 ${P(cx + dx, cy + dy - r)}Z"/>`;

/** 一条由粗渐细的蕨芽卷（对数螺线），从角度 a0 转到 a1，半径从 r0 收到 r1，粗细从 w0 收到 w1。
 * 返回整条的实心多边形 d、末端 end，以及拆成两段（外面那一圈 loop、卷进去的 curl）各自的多边形和中心线，生长动画沿中心线一段段露出来。 */
function crozier(c, a0, a1, r0, r1, w0, w1, N = 90, { hold = 0, rh = r0 } = {}) {
  // 前 hold 弧度半径从 r0 慢慢收到 rh（这一圈回到茎上，合成 P 的碗），之后按对数螺线收到 r1（卷进碗里）
  const k = Math.log(rh / r1) / (a1 - a0 - hold);
  const rad = (a) => (a - a0 <= hold ? r0 + (rh - r0) * ((a - a0) / (hold || 1)) : rh * Math.exp(-k * (a - a0 - hold)));
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = a0 + (a1 - a0) * t, r = rad(a), w = w0 + (w1 - w0) * Math.pow(t, 1.1);
    const p = [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
    const e = 1e-3, r2 = rad(a + e), q = [c[0] + r2 * Math.cos(a + e), c[1] + r2 * Math.sin(a + e)];
    const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty);
    const nx = -ty / tl, ny = tx / tl;
    pts.push({ p, nx, ny, w, a, tx: tx / tl, ty: ty / tl });
  }
  const poly = (ps) => {
    const L = ps.map(({ p, nx, ny, w }) => [p[0] + nx * w / 2, p[1] + ny * w / 2]);
    const R = ps.map(({ p, nx, ny, w }) => [p[0] - nx * w / 2, p[1] - ny * w / 2]).reverse();
    return 'M' + [...L, ...R].map((q) => P(...q)).join('L') + 'Z';
  };
  // 中心线：末端顺着切线多伸出 ext，免得遮罩的平头切掉一点
  const line = (ps, ext) => { const z = ps[ps.length - 1]; return 'M' + [...ps.map((q) => q.p), [z.p[0] + z.tx * ext, z.p[1] + z.ty * ext]].map((q) => P(...q)).join('L'); };
  const iH = pts.findIndex((q) => q.a - a0 >= hold);
  const loop = pts.slice(0, iH + 2), curl = pts.slice(iH - 1);
  // 碗再拆两段：前段（茎顶到碗底，粗）和后段（碗底回到茎上，细，挨着茎）。后段用窄一点的遮罩，茎长上去时不会把它提前露出来。
  const iS = pts.findIndex((q) => q.a - a0 >= Math.PI * 1.5);
  return { d: poly(pts), end: pts[N].p, loop: { line: line(loop, 0.6), a: poly(pts.slice(0, iS + 2)), b: poly(pts.slice(iS - 1, iH + 2)) }, curl: { d: poly(curl), line: line(curl, 1.6) } };
}

// ---------- Logo：B 蕨芽（站主 11-24 截图用的这一个） ----------
// 茎往上长，顶上卷成一个蕨芽，卷起来的那一圈就是 P 的碗；卷心一颗珊瑚色的果
const CZ = crozier([26.6, 18.4], Math.PI, Math.PI * 4.25, 11.4, 2.6, 7.2, 2.2, 160, { hold: Math.PI * 2, rh: 9.4 });
// 生长版的茎：比原来的茎往上多伸 1，伸进碗的起头里，和碗叠一点，两块放在同一个遮罩下面一起露出来，接口不留缝。
// （不能把茎和碗合成一条轮廓：碗绕回来压在茎上的那一截方向相反，叠的地方会抵消成一个洞。）
const STEM_X = [11.6, 18.8], STEM_Y = 42;
const STEM_UP = `M${STEM_X[0]} ${STEM_Y}L${STEM_X[1]} ${STEM_Y}L${STEM_X[1]} 17.4L${STEM_X[0]} 17.4Z`;
// 茎和碗的中心线：从茎底直着上来，接着碗那一圈；生长时一笔画出来，中间不停
const STEM_LOOP_LINE = `M${P((STEM_X[0] + STEM_X[1]) / 2, STEM_Y)}L` + CZ.loop.line.slice(1);
export const LOGO = `<g class="t">${rect(11.6, 18.2, 7.2, 23.8, 0.6)}${rect(8, 38.8, 14.4, 3.2, 0.5)}<path class="so" d="${CZ.d}"/>${ball(CZ.end[0], CZ.end[1], 2.9)}</g>`;
/** 会长的 Logo：脚（地面）→ 茎从底下长上去、一口气绕一圈成 P 的碗 → 卷进去 → 卷心结出珊瑚色的果。
 * 茎和碗（.cz1 茎和碗的前段叠在一个遮罩下，.cz1b 碗的后段用窄一点的遮罩，两个遮罩画的是同一条中心线、同一个时间）一笔长出来，卷进去的那段是另一块（.cz2），各用一个遮罩，遮罩里是它的中心线，动画时中心线一点点画出来；
 * 不动的时候中心线是整条，看起来和 LOGO 一样。uid 让同一页上几个 Logo 的遮罩不撞名。 */
export const logoGrow = (uid) => `<g class="t lgw"><mask id="lgm-${uid}-1" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><path class="m1" pathLength="1" d="${STEM_LOOP_LINE}" fill="none" stroke="white" stroke-width="7.6" stroke-linejoin="round"/></mask><mask id="lgm-${uid}-3" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><path class="m1" pathLength="1" d="${STEM_LOOP_LINE}" fill="none" stroke="white" stroke-width="5.4" stroke-linejoin="round"/></mask><mask id="lgm-${uid}-2" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48"><path class="m2" pathLength="1" d="${CZ.curl.line}" fill="none" stroke="white" stroke-width="5.6" stroke-linejoin="round"/></mask><g class="cz1" mask="url(#lgm-${uid}-1)"><path class="so" d="${STEM_UP}"/><path class="so" d="${CZ.loop.a}"/></g><path class="so cz1b" d="${CZ.loop.b}" mask="url(#lgm-${uid}-3)"/><path class="so cz2" d="${CZ.curl.d}" mask="url(#lgm-${uid}-2)"/>${rect(8, 38.8, 14.4, 3.2, 0.5, 'so ft')}${ball(CZ.end[0], CZ.end[1], 2.9, 'co fr')}</g>`;
export const FRUIT = CZ.end.map(n1);

// ---------- 顶栏三个 ----------
// 每个部件有自己的名字，悬停时按顺序出来：知识库从底下长（茎 .stem、三片叶 .l1–.l3、芽）；文献库书一本本摆出来（.b1–.b3），叶书签最后冒出来；
// 设置一圈叶边转边一片片出来（.wh 转、.w0–.w5），停住，环心的珊瑚色最后出现。叶的 --o 是叶柄那一点（view-box 坐标），从那里长出来。
const org = ([x, y]) => `style="--o:${n1(x)}px ${n1(y)}px"`;
const leafAt = (base, tip, w, cls, opt = {}) => leaf(base, tip, w, opt).replace('<path class="so"', `<path class="so ${cls}" ${org(base)}`);
// 知识库：叶序。一根细茎，三片互生的叶一片比一片小，顶上一颗珊瑚色的芽
const KB = `<g class="t">${st('M24 44C23.4 36 23.6 24 24.4 12', 2.4).replace('class="st"', 'class="st stem"')}${leafAt([23.8, 36.5], [10.5, 26.5], 5.4, 'l1')}${leafAt([24, 28], [36.6, 18.6], 5, 'l2')}${leafAt([24.2, 20.4], [13.6, 11.6], 4.2, 'l3')}${ball(24.6, 8.6, 3.3)}</g>`;
// 文献库：三本立着的书（铅字的实心书脊），中间那本里夹着一片叶当书签，叶尖露在外面（书签画在书后面，书挡住夹进去的那截）
const BOOK = (x, y, w, cls, extra = '') => `<path class="so ${cls}" fill-rule="evenodd" d="M${x} ${y}L${n1(x + w)} ${y}L${n1(x + w)} 41.5L${x} 41.5ZM${n1(x + 1.6)} 34.6L${n1(x + w - 1.6)} 34.6L${n1(x + w - 1.6)} 35.8L${n1(x + 1.6)} 35.8Z"${extra}/>`;
const LIB = `<g class="t">${leaf([22.4, 11], [27.6, 1.8], 2.6, { rib: false, cls: 'co' }).replace('<path class="co"', `<path class="co bm" ${org([22.4, 11])}`)}${BOOK(8, 11.5, 7.4, 'b1')}${BOOK(18.2, 8, 8, 'b2')}<g class="b3"><g transform="rotate(13 36.4 41.5)">${BOOK(29, 13.5, 7.4, '')}</g></g></g>`;
// 设置：轮生。一圈六片叶围着一个环，像齿轮也像一朵轮生的叶；环心一颗珊瑚色的髓
const whorl = Array.from({ length: 6 }, (_, k) => { const a = k * 60 - 90; return leafAt(rot([24, 15.2], [24, 24], a), rot([24, 4.6], [24, 24], a), 3.6, `w${k}`, { bulge: 0.5 }); }).join('');
const SET = `<g class="t"><g class="wh">${whorl}${ring(24, 24, 9.2, 5.4, 'so rg')}</g>${ball(24, 24, 2.9)}</g>`;

// ---------- 界面里的 ----------
const NEW = `<g class="t">${rect(21.4, 11, 5.2, 28, 2.6)}${st('M9.5 25L38.5 25')}${ball(9, 25, 2.2, 'so')}${ball(39, 25, 2.2, 'so')}${ball(24, 11.4, 3.8)}</g>`;
const SEARCH = `<g class="t"><path class="so" fill-rule="evenodd" d="M20 6A14 14 0 1 1 20 34A14 14 0 1 1 20 6ZM21.6 9.8A9.4 10.8 0 1 0 21.6 31.4A9.4 10.8 0 1 0 21.6 9.8Z"/><path class="so" d="M28.6 31.4L31.4 28.6L42.6 39.8C43.4 40.6 43.4 41.8 42.6 42.6C41.8 43.4 40.6 43.4 39.8 42.6Z"/>${ball(19, 17.4, 2.8)}</g>`;
const SEND = `<g class="t">${st('M6 24L32 24')}<path class="so" d="M27.5 12L44 24L27.5 36L31.6 24Z"/></g>`;
export const ICON = { kb: KB, lib: LIB, set: SET, new: NEW, search: SEARCH, send: SEND };

// ---------- 知识库里的十种记录 ----------
export const TYPE = {
  full: `<g class="t"><path class="co" d="M25.6 7L20.6 7C14 7 9.6 11.4 9.6 17C9.6 22.6 14 27 20.6 27L25.6 27Z"/>${rect(23, 7, 4.6, 34)}${rect(31.6, 7, 2.4, 34, 0.4)}${rect(23, 7, 11, 2.6, 0.3)}</g>`,
  excerpt: `<g class="t">${[[0, 'so'], [15, 'co']].map(([dx, c]) => `<g transform="translate(${dx} 0)"><circle class="${c}" cx="16.5" cy="28" r="6"/><path class="${c}" d="M10.6 27.4C10 18.6 13.4 13.2 20.4 9.6L21.8 11.6C17.2 14.4 15.4 18 15.8 22Z"/></g>`).join('')}</g>`,
  note: `<g class="t"><path class="so" fill-rule="evenodd" d="M24 4L33 15.5L28 33L20 33L15 15.5ZM23.2 15L24.8 15L24.8 27L23.2 27ZM24 11.6A2 2 0 1 0 24 15.6A2 2 0 1 0 24 11.6Z"/>${rect(19, 33, 10, 3.6, 0.4)}${ball(24, 42, 2.8)}</g>`,
  web: `<g class="t"><path class="so" fill-rule="evenodd" d="M24 7A17 17 0 1 1 24 41A17 17 0 1 1 24 7ZM24 10.4A13.6 13.6 0 1 0 24 37.6A13.6 13.6 0 1 0 24 10.4Z"/>${st('M24 9C17 15 17 33 24 39M24 9C31 15 31 33 24 39M9 24L39 24')}${ball(31.5, 16.5, 3)}</g>`,
  file: `<g class="t"><path class="so" fill-rule="evenodd" d="M11 6L29 6L37 14L37 42L11 42ZM16 20L32 20L32 22.2L16 22.2ZM16 26.4L32 26.4L32 28.6L16 28.6ZM16 32.8L26 32.8L26 35L16 35Z"/><path class="co" d="M29 6L37 14L29 14Z"/></g>`,
  scan: `<g class="t"><path class="so" fill-rule="evenodd" d="M12 6L36 6L36 42L12 42ZM16.4 11L31.6 11L31.6 13.2L16.4 13.2ZM16.4 16.4L28 16.4L28 18.6L16.4 18.6ZM16.4 31L31.6 31L31.6 33.2L16.4 33.2Z"/>${rect(5, 22, 38, 4.4, 0.4, 'co')}</g>`,
  concept: `<g class="t"><path class="so" d="M15.4 12.6L24 21.2L32.6 12.6L35.4 15.4L26.8 24L35.4 32.6L32.6 35.4L24 26.8L15.4 35.4L12.6 32.6L21.2 24L12.6 15.4Z"/>${ball(24, 8.2, 3.2)}${ball(24, 39.8, 3.2)}${ball(8.2, 24, 3.2)}${ball(39.8, 24, 3.2)}</g>`,
  report: `<g class="t"><path class="so" fill-rule="evenodd" d="M24 6A18 18 0 1 1 24 42A18 18 0 1 1 24 6ZM24 9.4A14.6 14.6 0 1 0 24 38.6A14.6 14.6 0 1 0 24 9.4Z"/><path class="co" d="M14.2 24.6L17.6 21.2L21.6 25.2L30.6 15.4L34 18.8L21.6 32.2Z"/></g>`,
  wonder: `<g class="t">${rect(9.4, 27, 5, 14, 0.4)}${ball(11.9, 23.4, 3.4, 'so')}${rect(21.5, 19, 5, 22, 0.4)}${ball(24, 15.4, 3.4, 'so')}${rect(33.6, 12, 5, 29, 0.4)}${ball(36.1, 8.4, 3.4)}${st('M5 43L43 43')}</g>`,
  answer: `<g class="t"><path class="so" d="M10 9L38 9C40.2 9 42 10.8 42 13L42 30C42 32.2 40.2 34 38 34L22 34L13 42L14 34L10 34C7.8 34 6 32.2 6 30L6 13C6 10.8 7.8 9 10 9Z"/>${leaf([33, 12], [37.6, 2.4], 3.4, { rib: false, cls: 'co' })}</g>`,
};

/** 生长阶段：一颗珊瑚色的种子 → 四瓣 → 八瓣，芯一直是珊瑚色。 */
const petals = (n, d, rx, ry) => Array.from({ length: n }, (_, k) => `<ellipse class="so" cx="24" cy="${24 - d}" rx="${rx}" ry="${ry}" transform="rotate(${(360 / n) * k} 24 24)"/>`).join('');
export const STAGE = [
  `<g class="t">${ball(24, 24, 6)}</g>`,
  `<g class="t">${petals(4, 11, 3.4, 6.2)}${ball(24, 24, 4.2)}</g>`,
  `<g class="t">${petals(8, 13, 3.2, 7.4)}${ball(24, 24, 4.6)}</g>`,
];

/** App 图标：墨色的圆角方，Logo 用纸色，芽是珊瑚色。 */
export const appIcon = (g) => `<svg class="pith-appicon" viewBox="0 0 100 100" aria-hidden="true"><rect x="5" y="5" width="90" height="90" rx="21" class="ap-bg"/><g transform="translate(20 21) scale(1.25)" class="ap">${g}</g></svg>`;

/** 一个图标的 <svg>（48 格）。cls 是额外的类，前面总有 pith-glyph。 */
export const svg48 = (g, cls = '') => `<svg class="pith-glyph${cls ? ' ' + cls : ''}" viewBox="0 0 48 48" aria-hidden="true">${g}</svg>`;

// ---------- Agent 行为的动态图标（Pith 在想）：十四个，动画在 schemes/pith/motion/agents/ ----------
const aBall = (cx, cy, r, cls = 'co') => `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}"/>`;
const aSt = (d, w = 2.2, cls = 'st') => `<path class="${cls}" pathLength="1" d="${d}" stroke-width="${w}"/>`;
const aRect = (x, y, w, h, r = 0.6, cls = 'so') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const aPetals = (n, d, rx, ry) => Array.from({ length: n }, (_, k) => `<ellipse class="so" cx="24" cy="${24 - d}" rx="${rx}" ry="${ry}" transform="rotate(${(360 / n) * k} 24 24)"/>`).join('');
const lens = (x0, y0, x1, y1, w, cls = 'so') => {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L * w * 1.3, ny = (x1 - x0) / L * w * 1.3;
  return `<path class="${cls}" d="M${x0} ${y0}Q${(mx + nx).toFixed(2)} ${(my + ny).toFixed(2)} ${x1} ${y1}Q${(mx - nx).toFixed(2)} ${(my - ny).toFixed(2)} ${x0} ${y0}Z"/>`;
};

export const AGENTS = [
  { id: 'think', name: '在想', when: '刚收到问题、在拆步骤', line: '在想怎么回答……', dur: '1.8 秒一轮',
    g: `<g class="f0">${aBall(24, 24, 5.4)}</g><g class="f1">${aPetals(4, 10.5, 3.2, 5.8)}${aBall(24, 24, 3.8)}</g><g class="f2">${aPetals(8, 12.5, 3, 7)}${aBall(24, 24, 4.2)}</g>` },
  { id: 'search', name: '检索知识库', when: '在勾的知识库里找段落', line: '在「读《国富论》」里找……', dur: '1.6 秒',
    g: `<g class="seeds">${aBall(12, 32, 3.2, 'so s1')}${aBall(24, 32, 3.2, 'so s2')}${aBall(36, 32, 3.2, 'so s3')}</g><g class="lp"><path class="so" fill-rule="evenodd" d="M12 6A9 9 0 1 1 12 24A9 9 0 1 1 12 6ZM12.8 8.6A6 7 0 1 0 12.8 22.4A6 7 0 1 0 12.8 8.6Z"/><path class="so" d="M17.6 21.4L19.8 19.2L24.6 24L22.4 26.2Z"/></g>` },
  { id: 'read', name: '读原文', when: '读一段的上下文、整章', line: '读第一篇第三章……', dur: '2 秒',
    g: `<path class="so" d="M13.6 9L10 9C6.4 9 4 11.4 4 14.6C4 17.8 6.4 20.2 10 20.2L13.6 20.2Z"/>${aRect(11.4, 9, 3, 30)}${aRect(16.2, 9, 1.6, 30, 0.3)}${[13, 20, 27, 34].map((y, i) => `<g class="ln l${i}">${aSt(`M22 ${y}L${[44, 40, 44, 34][i]} ${y}`)}<rect class="hi" x="21" y="${y - 2.6}" width="${[23, 19, 23, 13][i]}" height="5.2" rx="1.2"/></g>`).join('')}` },
  { id: 'cite', name: '引用', when: '给段落编号 [n]', line: '把 I.iii.1 编成 [1]……', dur: '1.6 秒',
    g: `${aSt('M4 30L30 30M4 38L24 38')}${aSt('M42 6L42 42', 1.6, 'st edge')}<g class="nb"><rect class="co" x="30" y="16" width="10" height="10" rx="2"/><path class="pp" d="M33.6 19.2L35.6 18L35.6 24" /></g>${aSt('M35 26C35 32 38 36 42 36', 1.6, 'st cl')}` },
  { id: 'lib', name: '查文献库', when: '查条目、作者、年份、附件', line: '查 Young 1928……', dur: '1.8 秒',
    g: `${aRect(8, 12, 7.4, 30)}<g class="pull">${aRect(18, 9, 8, 33)}${lens(22.2, 10, 27.4, 1.4, 2.6, 'co')}</g><g class="tilt">${aRect(29, 13, 7.4, 29)}</g>` },
  { id: 'web', name: '联网', when: '搜索、抓网页、存快照', line: '联网查 Young 1928……', dur: '2 秒',
    g: `<path class="so" fill-rule="evenodd" d="M24 7A17 17 0 1 1 24 41A17 17 0 1 1 24 7ZM24 10.4A13.6 13.6 0 1 0 24 37.6A13.6 13.6 0 1 0 24 10.4Z"/>${aSt('M9 24L39 24')}<ellipse class="mer" cx="24" cy="24" rx="7" ry="15" stroke-width="2.2"/><g class="orb">${aBall(37.6, 24, 2.8)}</g>` },
  { id: 'compute', name: '计算', when: '跑算式、小段代码，不口算', line: '算一下增长了多少……', dur: '1.6 秒',
    g: `${aSt('M6 14L42 14M6 24L42 24M6 34L42 34')}<g class="b1">${lens(9, 14, 19, 14, 3.6)}</g><g class="b2">${lens(22, 24, 32, 24, 3.6, 'co')}</g><g class="b3">${lens(12, 34, 22, 34, 3.6)}</g>` },
  { id: 'skill', name: '加载技能', when: '读某个技能的全文', line: '翻开「事实调查」……', dur: '1.8 秒',
    g: `${aRect(7, 8, 4.8, 32, 0.6)}<path class="st uf" pathLength="1" stroke-width="3" d="M14 40C26 40 38 34 38 22C38 13 32 8 25 8C19 8 15 13 15 18C15 23 19 26 23 26C27 26 29 23 29 20"/>${aBall(29, 18.4, 2.8, 'co tip')}` },
  { id: 'write', name: '写回答', when: '一段段写出来', line: '在写……', dur: '1.8 秒',
    g: `<path class="st wv" pathLength="1" stroke-width="2.2" d="M4 36C8 32 11 32 14 36C17 40 20 40 23 36C26 32 29 32 32 36"/><g class="nib"><path class="so" d="M30 4L40 14L30 30L26 26Z"/><path class="so" d="M26 26L30 30L25 33Z"/>${aBall(24.6, 34.6, 2.4)}</g>` },
  { id: 'ask', name: '问你', when: '要你拍板：问题卡', line: '想问你一件事……', dur: '1.2 秒',
    g: `<path class="so" d="M15 16C15 10.4 19 6.6 24.4 6.6C29.8 6.6 33.6 10.2 33.6 15C33.6 19 31.2 21 28.6 22.8C26.6 24.2 26 25.4 26 27.6L26 29L21.6 29L21.6 27.2C21.6 24 22.8 22.2 25.6 20.2C28 18.6 29 17.2 29 15.2C29 12.6 27 10.8 24.4 10.8C21.6 10.8 19.6 12.8 19.6 16Z"/><g class="bob">${aBall(23.8, 37, 3.6)}</g>` },
  { id: 'save', name: '存进知识库', when: '把回答、卡片存成材料', line: '存进「读《国富论》」……', dur: '2.6 秒',
    // 画的顺序：种子、小枝丫在土后面（土挡住埋进去的种子和茎根），土最后
    g: `<g class="sd">${aBall(24, 10, 3.2)}</g><g class="spr">${aSt('M24 38C24 32 23.6 26.4 24.3 18.6', 2.4, 'st ss')}${aSt('M24 32C21.8 31 19.8 29.4 18.6 27', 2, 'st sb1')}${aSt('M24.1 26.2C26.2 25.2 28 23.4 29.2 21', 2, 'st sb2')}${leaf([18.6, 27], [12.2, 22.2], 3.4, { rib: false, cls: 'so lf1' })}${leaf([29.2, 21], [35.8, 16.6], 3.4, { rib: false, cls: 'so lf2' })}${aBall(24.3, 15.6, 2.6, 'co bd')}</g><path class="so soil" d="M4 42.6C9 38.3 16 36.3 24 36.3C32 36.3 39 38.3 44 42.6L44 44.6L4 44.6Z"/>` },
  { id: 'bg', name: '后台任务', when: '长的活放到后台', line: '整本书的概念研究，在后台……', dur: '2.4 秒',
    g: `<circle class="st trk" cx="24" cy="24" r="17" stroke-width="2" pathLength="1"/><circle class="st arc" cx="24" cy="24" r="17" stroke-width="3" pathLength="1"/>${aSt('M24 32L24 22', 2.4)}${lens(24, 25, 17.6, 19.6, 3)}${lens(24, 22.6, 30.4, 17.6, 3)}<g class="head">${aBall(24, 7, 2.8)}</g>` },
  { id: 'word', name: '改 Word', when: '出修订预览，等你点头', line: '修订预览好了，等你看……', dur: '1.6 秒',
    g: `<path class="so" fill-rule="evenodd" d="M10 5L30 5L38 13L38 43L10 43ZM14.6 15L33.4 15L33.4 17.2L14.6 17.2ZM14.6 21.4L33.4 21.4L33.4 23.6L14.6 23.6ZM14.6 34.2L26 34.2L26 36.4L14.6 36.4Z"/>${aSt('M13 28.6L35 28.6', 2.4, 'st strike')}<rect class="co caret" x="27.4" y="31.6" width="2.2" height="7.6" rx="0.6"/>` },
  { id: 'done', name: '完成', when: '交付卡交出来了', line: '好了：概念卡在下面', dur: '2.4 秒',
    g: `<g class="bloom">${aPetals(8, 12.5, 3, 7)}</g>${aBall(24, 24, 4.4, 'co core')}` },
];

/** 一个 Agent 图标的 <svg>。cls 加在 pith-glyph pith-agent pith-agent--<id> 后面（例如 once、is-frame）。 */
export const agentIcon = (id, cls = '') => svg48(AGENTS.find((a) => a.id === id).g, `pith-agent pith-agent--${id}${cls ? ' ' + cls : ''}`);
