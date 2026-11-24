// EX11（页 id ex12）从 EX10 原样复制，没改。
// EX10（页 id ex11）的叶子和枝桠：从 EX9 复制，芽悬停时变珊瑚色、对话历史和设置的行加了悬停（hv-row）。原注：EX9（页 id ex10）的叶子和枝桠：从 EX8（ex9/app.mjs）原样搬出来，App 板和亮眼时刻板共用。
// 叶子：主脉在对话框的中线上，十对侧脉、叶缘、叶面、五颗芽；枝桠：对话历史（叫出来才长）、设置的导航（常驻）。
import { esc, C } from './shell.mjs';
import { icon } from './marks.mjs';

const r1 = (v) => Math.round(v * 10) / 10;

// ---------- 叶子：主脉在对话框的中线上（y = 448），叶柄在左、叶尖在右 ----------
const Y = 448, X0 = 176, X1 = 1124, LEN = X1 - X0, H = 154;
const fa = 0.78, fb = 1.15, TSTAR = fa / (fa + fb);
const f = (t) => Math.pow(t, fa) * Math.pow(1 - t, fb);
const half = (t) => (t <= 0 || t >= 1 ? 0 : (H * f(t)) / f(TSTAR));
const X = (t) => X0 + t * LEN;
const VEINS = Array.from({ length: 10 }, (_, i) => 0.085 + i * 0.076);
const vEnd = (t) => Math.min(t + 0.13 + 0.05 * (1 - t), 0.93);
/** 叶缘上的芽：哪根侧脉（下标）、上还是下（-1 上、1 下）、哪份材料、标签放哪。 */
const BUDS = [
  { i: 0, s: -1, k: 1, j: 2, at: 'l' },
  { i: 2, s: 1, k: 1, j: 5, at: 'b' },
  { i: 5, s: 1, k: 0, j: 3, at: 'b' },
  { i: 7, s: 1, k: 1, j: 9, at: 'b' },
  { i: 9, s: -1, k: 2, j: 1, at: 'r' },
];

export function leaf() {
  const pts = (s) => Array.from({ length: 121 }, (_, k) => { const t = (k / 120) ** 1.35; return [X(t), Y + s * half(t)]; });
  const poly = (p) => 'M' + p.map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L');
  const up = pts(-1), dn = pts(1);
  const blade = poly(up) + 'L' + dn.slice().reverse().map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + 'Z';
  let veins = '';
  VEINS.forEach((t, i) => {
    const te = vEnd(t);
    [-1, 1].forEach((s) => {
      const bud = BUDS.find((b) => b.i === i && b.s === s);
      const k = bud ? 1 : 0.86;
      const P = [X(t), Y], E = [X(te), Y + s * half(te) * k];
      const Cc = [P[0] + (E[0] - P[0]) * 0.26, Y + s * half(te) * k * 0.8];
      const d = (0.95 + i * 0.07).toFixed(2);
      veins += `<path class="vn${bud ? ` bv bv${BUDS.indexOf(bud)}` : ''}" pathLength="1" style="--d:${d}s" d="M${r1(P[0])} ${Y}Q${r1(Cc[0])} ${r1(Cc[1])} ${r1(E[0])} ${r1(E[1])}"/>`;
    });
  });
  const budsDots = BUDS.map((b, n) => {
    const te = vEnd(VEINS[b.i]);
    return `<circle class="bd bd${n}" cx="${r1(X(te))}" cy="${r1(Y + b.s * half(te))}" r="4" style="--d:${(2.35 + n * 0.1).toFixed(2)}s"/>`;
  }).join('');
  const svg = `<svg class="v1-leaf" viewBox="0 0 1280 800" aria-hidden="true">
<path class="bl" d="${blade}"/>
<path class="mr" pathLength="1" d="M108 465Q146 452 ${X0} ${Y}L${X1 - 14} ${Y}"/>
${veins}
<path class="ct" pathLength="1" d="${poly(up)}"/><path class="ct" pathLength="1" d="${poly(dn)}"/>
${budsDots}</svg>`;
  const labels = BUDS.map((b, n) => {
    const m = C.MATS[b.k][b.j];
    const te = vEnd(VEINS[b.i]);
    const x = X(te), y = Y + b.s * half(te);
    const pos = b.at === 'l' ? `right:${r1(1280 - x + 14)}px;top:${r1(y - 46)}px;text-align:right` : b.at === 'r' ? `left:${r1(x + 14)}px;top:${r1(y - 46)}px` : `left:${r1(x - 10)}px;top:${r1(y + 14)}px`;
    return `<button type="button" class="v1-bud b${n} at-${b.at}" onClick="{{bud${b.k}_${b.j}}}" style="${pos};--d:${(2.45 + n * 0.1).toFixed(2)}s"><b class="w${m.stage}">${esc(m.title)}</b><span>${esc(C.KBS[b.k].name)} · ${m.date}</span></button>`;
  }).join('');
  return `<div class="v1">${svg}${labels}</div>`;
}

export const home = () => `<div class="v1-hello"><h1>${C.GREETING}</h1><p>${esc(C.HINT)}</p></div>${leaf()}`;

// ---------- 枝桠：对话历史（叫出来才长）、设置的导航（常驻）共用一种画法 ----------
const bx = (y) => 56 + 2.6 * Math.sin(y / 64);
/** 一根从左边长进来的主枝，从 y0 长到 y1；nodes：[{ y, kind: 'g'|'i'|'new', on }]。返回 svg 里的 path 和 circle。 */
export function branch(y0, y1, nodes, { lead = 0.05, step = 0.055 } = {}) {
  const top = y0 + 74;
  let main = `M-6 ${y0}C30 ${y0 + 4} ${r1(bx(top) - 2)} ${y0 + 30} ${r1(bx(top))} ${top}`;
  for (let y = top + 12; y <= y1; y += 12) main += `L${r1(bx(y))} ${y}`;
  let svg = `<path class="main" pathLength="1" style="--d:0s;--dur:.7s" d="${main}"/>`;
  nodes.forEach((n, k) => {
    const d = (lead + 0.18 + k * step).toFixed(2);
    if (n.kind === 'g') {
      const ya = n.y + 6;
      svg += `<path class="tw g" pathLength="1" style="--d:${d}s" d="M${r1(bx(ya))} ${ya}C${r1(bx(ya) + 8)} ${ya} 70 ${n.y} 80 ${n.y}"/>`;
      return;
    }
    const ya = n.y + 20;
    svg += `<path class="tw${n.on ? ' on' : ''}" pathLength="1" style="--d:${d}s" d="M${r1(bx(ya))} ${ya}C${r1(bx(ya) + 16)} ${ya} 74 ${n.y + 1} 90 ${n.y}"/><circle class="${n.on ? 'on' : ''}" cx="90" cy="${n.y}" r="2.8" style="--d:${(Number(d) + 0.3).toFixed(2)}s"/>`;
  });
  return svg;
}

export const HIST = [
  { kind: 'new', y: 54 },
  { kind: 'g', y: 112, t: '今天' },
  { kind: 'i', y: 146, t: C.Q, m: '伴读 · 刚刚', st: 0, on: true, act: 'pgNow' },
  { kind: 'g', y: 214, t: '这周' },
  ...C.RECENT.map((r, i) => ({ kind: 'i', y: 248 + i * 56, t: r.t, m: `${r.who.split(' · ')[0]} · ${r.when}`, st: r.stage, act: 'pgOld' })),
  { kind: 'g', y: 438, t: '更早' },
  { kind: 'i', y: 472, t: '政治效能感最早怎么定义', m: 'Pith · 10 月', st: 2, act: 'pgOld' },
  { kind: 'i', y: 528, t: '量表的信度够不够', m: '审稿人 · 10 月', st: 1, act: 'pgOld' },
  { kind: 'i', y: 584, t: '把第 2 章的论证理一遍', m: 'Pith · 10 月', st: 2, act: 'pgOld' },
];
export const drawer = () => {
  const svg = branch(30, 600, HIST);
  const lbl = HIST.map((n, k) => {
    const d = (0.05 + 0.3 + k * 0.055).toFixed(2);
    if (n.kind === 'new') return `<button type="button" class="br-new hv-row" onClick="{{newChat}}" style="top:${n.y - 12}px;--d:${d}s">${icon('new')}新对话<kbd>⌘N</kbd></button>`;
    if (n.kind === 'g') return `<p class="br-g" style="top:${n.y - 7}px;--d:${d}s">${n.t}</p>`;
    return `<button type="button" class="br-it hv-row${n.on ? ' is-on' : ''}" onClick="{{${n.act}}}" style="top:${n.y - 11}px;--d:${d}s"><b class="w${n.st}">${esc(n.t)}</b><span>${esc(n.m)}</span></button>`;
  }).join('');
  return `<sc-if value="{{isSide}}" hint-placeholder-val="{{ false }}"><button type="button" class="br-scrim" onClick="{{closeSide}}" aria-label="收起以前的对话"></button></sc-if>
<nav class="a-br" aria-label="以前的对话"><svg class="br-svg" viewBox="0 0 330 732" aria-hidden="true">${svg}</svg>${lbl}</nav>`;
};

export const SETN = [{ kind: 'g', y: 36, t: '设置' }, ...C.SETTINGS.map((t, i) => ({ kind: 'i', y: 92 + i * 50, t, on: i === 0 }))];
export const setNav = () => {
  const svg = branch(10, 430, SETN, { lead: 0.1, step: 0.06 });
  const lbl = SETN.map((n, k) => {
    const d = (0.1 + 0.3 + k * 0.06).toFixed(2);
    if (n.kind === 'g') return `<p class="br-g br-h" style="top:${n.y - 12}px;--d:${d}s">${n.t}</p>`;
    return `<button type="button" class="br-st${n.on ? ' is-on' : ''}" ${n.on ? '' : `onClick="{{pgOther${k - 2}}}" `}style="top:${n.y - 11}px;--d:${d}s">${esc(n.t)}</button>`;
  }).join('');
  return `<nav class="a-sbr" aria-label="设置"><svg class="br-svg" viewBox="0 0 300 560" aria-hidden="true">${svg}</svg>${lbl}</nav>`;
};


export const GARDEN_CSS = `
/* ---- 首页：一片叶子 ---- */
.v1-hello{position:absolute;left:0;right:0;top:146px;text-align:center;transition:transform .6s var(--out)}
.v1-hello h1{font:480 58px/1.1 var(--serif);letter-spacing:-.015em;animation:v-grow 1.8s .15s var(--out) backwards}
@keyframes v-grow{from{font-weight:200;opacity:0;transform:translateY(6px)}}
.v1-hello p{margin-top:12px;font:300 19px/1.5 var(--serif);color:var(--muted);animation:v-fade .8s 1s var(--out) backwards}
@keyframes v-fade{from{opacity:0;transform:translateY(4px)}}
.v1{position:absolute;inset:0;transition:opacity .5s var(--out),transform .6s var(--out)}
.is-side .v1{opacity:.12;transform:translateX(60px);pointer-events:none}
.a-shell:has(.a-comp.is-typing) .v1,.a-shell:has(.a-comp.is-ready) .v1{opacity:.45}
.v1-leaf{position:absolute;inset:0;width:1280px;height:800px;pointer-events:none;overflow:visible}
.v1-leaf path{fill:none;stroke:var(--sea);stroke-linecap:round;stroke-linejoin:round}
.v1-leaf .bl{stroke:none;fill:var(--sea);opacity:0;animation:v-blade 1.6s 2s var(--out) forwards}
@keyframes v-blade{to{opacity:.05}}
.v1-leaf .mr{stroke-width:1.7;stroke-dasharray:1;stroke-dashoffset:1;opacity:0;animation:v-draw 1.2s .45s cubic-bezier(.45,0,.2,1) forwards;--o:.8}
.v1-leaf .vn{stroke-width:1.05;stroke-dasharray:1;stroke-dashoffset:1;opacity:0;animation:v-draw .95s var(--out) forwards;animation-delay:var(--d);--o:.42;transition:stroke .3s,stroke-width .3s}
.v1-leaf .bv{--o:.7}
.v1-leaf .ct{stroke-width:1;stroke-dasharray:1;stroke-dashoffset:1;opacity:0;animation:v-draw 1.6s 1.15s cubic-bezier(.45,0,.2,1) forwards;--o:.3}
@keyframes v-draw{0%{stroke-dashoffset:1;opacity:0}6%{opacity:var(--o)}100%{stroke-dashoffset:0;opacity:var(--o)}}
.v1-leaf .bd{fill:var(--bg);stroke:var(--sea);stroke-width:1.6;transform-box:fill-box;transform-origin:center;transform:scale(0);animation:v-pop .6s var(--spring) forwards;animation-delay:var(--d);transition:fill .3s}
@keyframes v-pop{to{transform:scale(1)}}
.v1-bud{position:absolute;display:flex;flex-direction:column;gap:3px;max-width:200px;pointer-events:auto;opacity:0;animation:v1-in .7s var(--out) forwards;animation-delay:var(--d)}
@keyframes v1-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.v1-bud b{font:15.5px/1.3 var(--serif);color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .25s}
.v1-bud span{font-size:12px;color:var(--faint);white-space:nowrap}
.v1-bud.at-l{align-items:flex-end}
.v1-bud:hover b{color:var(--sea-t)}
${[0, 1, 2, 3, 4].map((n) => `.v1:has(.b${n}:hover) .bv${n}{stroke:var(--sea-t);stroke-width:1.8}.v1:has(.b${n}:hover) .bd${n}{fill:var(--sea)}`).join('\n')}
/* ---- 枝桠：没有底色，和页面是一张纸 ---- */
.br-svg{position:absolute;left:0;top:0;overflow:visible;pointer-events:none}
.br-svg path{fill:none;stroke:var(--sea);stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1}
.br-svg .main{stroke-width:1.6;opacity:.75}
.br-svg .tw{stroke-width:1.1;opacity:.55}
.br-svg .tw.g{opacity:.35}
.br-svg .tw.on{stroke-width:1.6;opacity:.9}
.br-svg circle{fill:var(--bg);stroke:var(--sea);stroke-width:1.3;transform-box:fill-box;transform-origin:center;transform:scale(0)}
.br-svg circle.on{fill:var(--coral);stroke:var(--coral)}
.br-g{position:absolute;left:88px;font:700 11px/14px var(--sans);letter-spacing:.12em;color:var(--faint)}
.br-h{left:86px;font:400 24px/1 var(--serif);letter-spacing:0;color:var(--ink)}
.a-br{position:absolute;left:0;top:68px;bottom:0;width:330px;z-index:19;visibility:hidden;transition:visibility 0s .45s}
.a-br .br-svg{width:330px;height:732px}
.br-scrim{position:absolute;left:0;right:0;top:68px;bottom:0;z-index:18;cursor:default}
.a-br .br-svg path{transition:stroke-dashoffset .35s var(--out)}
.a-br .br-svg circle{transition:transform .2s}
.br-new,.br-it,.a-br .br-g{opacity:0;transform:translateX(-10px);transition:opacity .18s,transform .3s var(--out)}
.is-side .a-br{visibility:visible;transition:none}
.is-side .a-br .br-svg path{stroke-dashoffset:0;transition:stroke-dashoffset var(--dur,.55s) var(--out) var(--d)}
.is-side .a-br .br-svg circle{transform:none;transition:transform .5s var(--spring) var(--d)}
.is-side .br-new,.is-side .br-it,.is-side .a-br .br-g{opacity:1;transform:none;transition:opacity .5s var(--out) var(--d),transform .6s var(--out) var(--d)}
.br-new{position:absolute;left:98px;display:flex;align-items:center;gap:7px;font:700 14px/24px var(--sans);color:var(--sea-t)}
.br-new .ico{width:17px;height:17px}
.br-new kbd{margin-left:8px;font:400 11.5px/1 var(--sans);color:var(--faint)}
.br-it{position:absolute;left:100px;width:214px;display:flex;flex-direction:column;gap:2px;text-align:left}
.br-it b{font:15.5px/21px var(--serif);color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .2s}
.br-it span{font-size:12px;color:var(--faint)}
.br-it:hover b,.br-new:hover{color:var(--sea-t)}
.br-it.is-on b{color:var(--ink)}
/* 设置的枝桠：常驻，每次进设置长一遍 */
.a-set{grid-template-columns:300px 1fr}
.a-sbr{position:relative;height:100%}
.a-sbr .br-svg{width:300px;height:560px;top:20px}
.a-sbr .br-svg path{animation:br-draw .6s var(--out) forwards;animation-delay:var(--d)}
.a-sbr .br-svg .main{animation-duration:.8s}
@keyframes br-draw{to{stroke-dashoffset:0}}
.a-sbr .br-svg circle{animation:v-pop .5s var(--spring) forwards;animation-delay:var(--d)}
.a-sbr .br-g,.br-st{animation:v-in2 .5s var(--out) backwards;animation-delay:var(--d)}
@keyframes v-in2{from{opacity:0;transform:translateX(-10px)}}
.a-sbr .br-g{margin-top:20px}
.br-st{position:absolute;left:100px;margin-top:20px;font:16px/22px var(--serif);color:var(--muted);white-space:nowrap;transition:color .2s}
.br-st:hover{color:var(--ink)}
.br-st.is-on{color:var(--ink);font-weight:600}
`;
