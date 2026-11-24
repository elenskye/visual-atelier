// 第 1 步 · 第二轮 · App 图标：站主说第一轮六个都不如现在的图标，这一轮全从现在的图标出发。
// J1 只把现在的图标像素化（格子取样，不改形状和颜色）；J2–J5 换成 P3 深海底，各加一种这套视觉的语言。
import { board, themeProp, MONO, KIT, themeCss, FLIP } from './kit.mjs';
import { J1_COLORS, J1_16, J1_24, J1_32, J1_48, J1_64 } from './icon-data.mjs';

// 现在的图标原图（站主自己的，作对照）。上传到画布后用它的地址；本地检查时指到本地文件。
const REF = process.env.PECK_REF || '/_blob/b44f0fb53fca08297a47e3b734091ffe';
const CY = '#00E5FF', PALE = '#A8F6FF';

// J2 像素重绘：以 32 格的像素化为底稿手工清理（眼睛 2×2、喙的缝一格宽、下喙接回喉咙、脖子按台阶收），形状照原图
const J2 = (() => {
  const seg = {
    6: [['l', 6, 6]], 7: [['c', 6, 6], ['l', 7, 8]], 8: [['c', 6, 7], ['l', 8, 15]], 9: [['c', 6, 9], ['l', 10, 17]],
    10: [['c', 7, 17], ['l', 18, 18]], 11: [['c', 8, 19], ['l', 20, 20]], 12: [['c', 9, 16], ['e', 17, 18], ['c', 19, 22]],
    13: [['c', 10, 16], ['e', 17, 18], ['c', 19, 20], ['c', 22, 24]], 14: [['c', 10, 20], ['c', 24, 26]],
    15: [['c', 10, 19], ['c', 22, 24]], 16: [['c', 9, 21]], 17: [['c', 9, 17]], 18: [['c', 8, 15]], 19: [['c', 8, 14]],
    20: [['c', 8, 14]], 21: [['c', 9, 14]], 22: [['c', 10, 14]], 23: [['c', 11, 14]], 24: [['c', 12, 14]], 25: [['c', 13, 14]],
  };
  return Array.from({ length: 32 }, (_, y) => {
    const row = Array(32).fill('.');
    for (const [k, a, b] of seg[y] || []) for (let x = a; x <= b; x++) row[x] = k;
    return row.join('');
  });
})();
// 16 格的小尺寸和菜单栏用：同一只鸟照原图摆在 16 格里
const T16 = (() => {
  const seg = {
    3: [['l', 3, 3]], 4: [['c', 3, 3], ['l', 4, 8]], 5: [['c', 4, 9], ['l', 10, 10]], 6: [['c', 5, 7], ['e', 8, 8], ['c', 9, 11]],
    7: [['c', 5, 10], ['c', 12, 13]], 8: [['c', 5, 9], ['c', 11, 11]], 9: [['c', 4, 10]], 10: [['c', 4, 7]],
    11: [['c', 4, 7]], 12: [['c', 5, 7]], 13: [['c', 6, 7]],
  };
  return Array.from({ length: 16 }, (_, y) => {
    const row = Array(16).fill('.');
    for (const [k, a, b] of seg[y] || []) for (let x = a; x <= b; x++) row[x] = k;
    return row.join('');
  });
})();
const shift = (rows, dx) => rows.map((r) => (dx < 0 ? r.slice(-dx) + '.'.repeat(-dx) : '.'.repeat(dx) + r.slice(0, r.length - dx)));

/** 按行合并同色格子，画成 rect。fill: 字符 → 颜色（没有就不画）。 */
function pix(rows, fill, h = 1) {
  let r = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const k = row[x], f = fill[k];
      if (!f) { x++; continue; }
      let e = x; while (e < row.length && row[e] === k) e++;
      r += `<rect x="${x}" y="${y + (1 - h) / 2}" width="${e - x}" height="${h}" fill="${f}"></rect>`;
      x = e;
    }
  });
  return r;
}
function dots(rows, on, off) {
  let r = '';
  rows.forEach((row, y) => [...row].forEach((k, x) => {
    const f = on[k] || off;
    if (f) r += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${on[k] ? 0.38 : 0.3}" fill="${f}"></circle>`;
  }));
  return r;
}
const bg = (n, id) => `<rect width="${n}" height="${n}" rx="${(n * 0.224).toFixed(2)}" fill="url(#${id})"></rect>`;
const grad = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16214A"></stop><stop offset="1" stop-color="#050816"></stop></linearGradient>`;
const glow = (id, sd) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow in="SourceGraphic" dx="0" dy="0" stdDeviation="${sd}" flood-color="${CY}" flood-opacity=".55"></feDropShadow></filter>`;

function symbols() {
  const J1F = { b: J1_COLORS.b, c: J1_COLORS.c, l: J1_COLORS.l };
  const BIRD = { c: CY, l: PALE };
  const s = [];
  // J1 只像素化：各种格数
  for (const [n, rows] of [[16, J1_16], [24, J1_24], [32, J1_32], [48, J1_48]]) s.push(`<symbol id="j1-${n}" viewBox="0 0 ${n} ${n}">${pix(rows, J1F)}</symbol>`);
  // J2 像素重绘
  s.push(`<symbol id="j2" viewBox="0 0 32 32">${bg(32, 'gb')}<g filter="url(#gl32)">${pix(J2, BIRD)}</g></symbol>`);
  s.push(`<symbol id="j2s" viewBox="0 0 16 16">${bg(16, 'gb')}${pix(T16, BIRD)}</symbol>`);
  // J3 LED 点阵：亮的点拼出鸟，没亮的点也看得见
  s.push(`<symbol id="j3" viewBox="0 0 24 24">${bg(24, 'gb')}${dots(J1_24, {}, '#1A2552')}<g filter="url(#gl24)">${dots(J1_24, { c: CY, l: PALE }, null)}</g></symbol>`);
  const t16bg = T16.map((r, y) => [...r].map((k, x) => (k !== '.' ? k : ((x < 2 || x > 13) && (y < 2 || y > 13)) ? '.' : 'b')).join(''));
  s.push(`<symbol id="j3s" viewBox="0 0 16 16">${bg(16, 'gb')}${dots(t16bg, {}, '#1A2552')}${dots(T16, { c: CY, l: PALE }, null)}</symbol>`);
  // J4 扫描线：现在图标的轮廓（64 格取样）一行行画成横线，中间一条亮带
  const band = (rows) => rows.map((r, y) => (y >= 25 && y <= 31 ? r.replace(/c/g, 'h') : r));
  s.push(`<symbol id="j4" viewBox="0 0 64 64">${bg(64, 'gb')}<g filter="url(#gl64)">${pix(band(J1_64), { c: CY, l: PALE, h: '#C9FBFF' }, 0.56)}</g></symbol>`);
  s.push(`<symbol id="j4m" viewBox="0 0 32 32">${bg(32, 'gb')}${pix(J1_32.map((r, y) => (y >= 12 && y <= 15 ? r.replace(/c/g, 'h') : r)), { c: CY, l: PALE, h: '#C9FBFF' }, 0.62)}</symbol>`);
  s.push(`<symbol id="j4s" viewBox="0 0 16 16">${bg(16, 'gb')}${pix(T16, BIRD, 0.6)}</symbol>`);
  // J5 啄光标：J2 的鸟往左挪两格，喙尖前面一个方块光标
  const j5 = shift(J2, -2).map((r, y) => (y >= 11 && y <= 16 ? r.slice(0, 26) + 'kk' + r.slice(28) : r));
  s.push(`<symbol id="j5" viewBox="0 0 32 32">${bg(32, 'gb')}<g filter="url(#gl32)">${pix(j5, { ...BIRD, k: CY })}</g></symbol>`);
  const t5 = shift(T16, -1).map((r, y) => (y >= 5 && y <= 8 ? r.slice(0, 14) + 'k' + r.slice(15) : r));
  s.push(`<symbol id="j5s" viewBox="0 0 16 16">${bg(16, 'gb')}${pix(t5, { ...BIRD, k: CY })}</symbol>`);
  // 菜单栏模板图（单色）：J1 用像素化的 16 格，其余用手画的 16 格
  const mono = (rows) => rows.map((r) => r.replace(/[bel]/g, (m) => (m === 'l' ? 'c' : '.')));
  s.push(`<symbol id="t1" viewBox="0 0 16 16">${pix(mono(J1_16), { c: 'currentColor' })}</symbol>`);
  s.push(`<symbol id="t2" viewBox="0 0 16 16">${pix(mono(T16), { c: 'currentColor' })}</symbol>`);
  s.push(`<symbol id="t3" viewBox="0 0 16 16">${dots(mono(T16), { c: 'currentColor' }, null)}</symbol>`);
  s.push(`<symbol id="t4" viewBox="0 0 16 16">${pix(mono(T16), { c: 'currentColor' }, 0.62)}</symbol>`);
  s.push(`<symbol id="t5" viewBox="0 0 16 16">${pix(mono(t5).map((r) => r.replace(/k/g, 'c')), { c: 'currentColor' })}</symbol>`);
  return `<svg class="defs" width="0" height="0" aria-hidden="true"><defs>${grad('gb')}${glow('gl24', 0.45)}${glow('gl32', 0.6)}${glow('gl64', 1.1)}</defs>${s.join('')}</svg>`;
}

const use = (id, cls) => `<svg class="${cls}" aria-hidden="true" shape-rendering="crispEdges"><use href="#${id}"></use></svg>`;

const CSS = `
.pk.ib{width:1280px;height:800px;padding:24px 32px 28px;display:flex;flex-direction:column;gap:12px}
.defs{position:absolute;width:0;height:0;overflow:hidden}
.top{display:flex;align-items:baseline;gap:16px}
.top h1{font-size:20px;font-weight:600}
.top p{font-size:13px;color:var(--tx2)}
.g6{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:14px;min-height:0}
.ic{position:relative;isolation:isolate;display:flex;flex-direction:column;gap:10px;padding:12px 14px;clip-path:var(--clip);background:var(--line);min-height:0}
.ic:before{content:"";position:absolute;inset:1px;clip-path:var(--clip);background:var(--pane);z-index:-1}
.ic.ref{background:var(--line2)}
.ih{display:flex;align-items:baseline;gap:8px;white-space:nowrap}
.ih b{font-family:${MONO};font-weight:600;font-size:13px;color:var(--cy-tx)}
.lt .ih b{background:var(--cy);padding:0 4px}
.ref .ih b{color:var(--tx2)}
.lt .ref .ih b{background:var(--raise)}
.ih .nm{font-size:15px;font-weight:600}
.ih .ds{font-size:12px;color:var(--tx3);overflow:hidden;text-overflow:ellipsis}
.bd{flex:1;display:grid;grid-template-columns:128px minmax(0,1fr);gap:14px;min-height:0}
.lc{display:flex;flex-direction:column;gap:8px}
.big{width:128px;height:128px;display:block}
img.big,img.s64,img.s32,img.s16{object-fit:contain}
.nt{font-size:11.5px;color:var(--tx2);line-height:1.55}
.rcol{display:flex;flex-direction:column;gap:6px;min-width:0}
.strip{display:flex;align-items:center;gap:14px;height:76px;padding:0 12px;background:#050816}
.strip.lite{background:#EEF1F8}
.strip .lb{margin-left:auto;font-family:${MONO};font-size:10.5px;color:#7A84B6;align-self:flex-end;padding-bottom:6px}
.strip.lite .lb{color:#646C92}
.s64{width:64px;height:64px;display:block}.s32{width:32px;height:32px;display:block}.s16{width:16px;height:16px;display:block}
.den{display:flex;align-items:center;gap:10px;height:76px;padding:0 10px;background:#050816}
.den figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:2px}
.den svg{width:44px;height:44px;display:block}
.den figcaption{font-family:${MONO};font-size:10px;color:#7A84B6}
.mbar{display:flex;align-items:center;gap:16px;height:30px;padding:0 10px;font-family:${MONO};font-size:10.5px}
.mbar.ml{background:#E4E8F2;color:#0B1030}
.mbar.md{background:#161C33;color:#E8ECFF}
.mbar .st{display:flex;align-items:center;gap:5px}
.mbar .t{width:20px;height:20px;display:block}
.mbar .ex{display:inline-flex;align-items:center;gap:2px}
.mbar .ex i{width:3px;height:3px;background:currentColor;animation:tw 1.2s steps(1) infinite}
.mbar .ex i:nth-child(2){animation-delay:.3s}.mbar .ex i:nth-child(3){animation-delay:.6s}
.mbar .ex.q{font-weight:700;font-size:12px;line-height:1}
.mbar .ml2{margin-left:auto;opacity:.6}
.none{display:flex;align-items:center;height:66px;padding:0 12px;font-size:12px;color:var(--tx3);box-shadow:inset 0 0 0 1px var(--line2)}
`;

function sizes(id, small, mid = id) {
  const row = (lite) => `<div class="strip${lite ? ' lite' : ''}">${use(id, 's64')}${use(mid, 's32')}${use(small, 's16')}</div>`;
  return row(false) + row(true);
}
function mbars(t) {
  const st = (extra) => `<span class="st">${use(t, 't')}${extra}</span>`;
  const one = (cls) => `<div class="mbar ${cls}">${st('')}${st('<span class="ex"><i></i><i></i><i></i></span>')}${st('<span class="ex q">!</span>')}</div>`;
  return one('ml') + one('md');
}

function body() {
  const cells = [];
  cells.push(`<div class="ic ref"><p class="ih"><b>现在</b><span class="nm">现在的图标</span><span class="ds">对照；第一轮六个都不如它</span></p>
    <div class="bd"><div class="lc"><img class="big" src="${REF}" alt="Peck 现在的 App 图标"><p class="nt">这一轮五个都从它出发：轮廓、冠羽高光、眼睛都留着。</p></div>
    <div class="rcol"><div class="strip"><img class="s64" src="${REF}" alt=""><img class="s32" src="${REF}" alt=""><img class="s16" src="${REF}" alt=""></div><div class="strip lite"><img class="s64" src="${REF}" alt=""><img class="s32" src="${REF}" alt=""><img class="s16" src="${REF}" alt=""></div><div class="none">现在没有菜单栏图标</div></div></div></div>`);
  cells.push(`<div class="ic"><p class="ih"><b>J1</b><span class="nm">像素化</span><span class="ds">只像素化：形状、颜色都是原图的</span></p>
    <div class="bd"><div class="lc">${use('j1-32', 'big')}<p class="nt">32 格。每格取原图里占多数的颜色，没有新加的颜色。</p></div>
    <div class="rcol"><div class="den">${[16, 24, 32, 48].map((n) => `<figure>${use('j1-' + n, '')}<figcaption>${n} 格</figcaption></figure>`).join('')}</div><div class="strip">${use('j1-32', 's64')}${use('j1-32', 's32')}${use('j1-16', 's16')}</div>${mbars('t1')}</div></div></div>`);
  const J = [
    ['j2', 'J2', '像素重绘', 'J1 手工清理，换深海底', '同样 32 格：眼睛 2×2、喙缝一格、下喙接回喉咙；底换成深海，鸟带一点光。'],
    ['j3', 'J3', 'LED 点阵', '亮着的点拼出鸟（24 格）', '没亮的点也看得见，像一块点阵屏；和点阵动效、点阵字是一家。'],
    ['j4', 'J4', '扫描线', '现在的轮廓画成一行行横线', '形状最接近现在的图标；中间一条亮带是扫描。'],
    ['j5', 'J5', '啄光标', '鸟对着一个方块光标', '光标就是 Peck 一下一下在敲代码；App 里在跑时光标会闪。'],
  ];
  for (const [id, k, nm, ds, nt] of J) {
    cells.push(`<div class="ic"><p class="ih"><b>${k}</b><span class="nm">${nm}</span><span class="ds">${ds}</span></p>
    <div class="bd"><div class="lc">${use(id, 'big')}<p class="nt">${nt}</p></div>
    <div class="rcol">${sizes(id, id + 's', id === 'j4' ? 'j4m' : id)}${mbars('t' + id.slice(1))}</div></div></div>`);
  }
  return `<div class="{{root}}">${symbols()}
  <div class="top"><h1>App 图标 · 第二轮</h1><p>全部从现在的图标出发。每格：大图；64、32、16 放在深底和浅底上；菜单栏模板图三种状态：空闲、在跑、等你。</p></div>
  <div class="g6">${cells.join('')}</div>
</div>`;
}

export function boards() {
  const def = FLIP ? '浅色' : '深色';
  const logic = `renderVals() { return { root: 'pk ib ' + ((this.props.theme ?? '${def}') === '深色' ? 'dk' : 'lt') }; }`;
  const html = board({ title: 'App 图标 · 第二轮', css: `${KIT}\n${themeCss('pk')}\n${CSS}`, body: body(), props: themeProp(def), logic });
  return [{ file: 'S1b-Icon.dc.html', x: 2720, y: 920, title: 'App 图标 · J1–J5（都从现在的图标出发）', html }];
}

// 第三轮的图标板要用到 J2 和 16 格小鸟
export { J2, T16, pix, shift };
