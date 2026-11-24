// 第 3 步 · 图标定稿：App 图标各尺寸（J2 照 Apple 的格子、每个尺寸都是整像素）、现在的图标 A3、菜单栏模板图四个状态。
// 同一份画法写成方案的 marks/（SVG），导入 visual-atelier 后由它出 .icns 和 PNG。
import { board, A, DOTS, FLIP, px } from '../s1c/kit.mjs';
import { CSS as PROTO } from '../s2/proto.mjs';
import { J2, T16, pix } from '../s1b/icon.mjs';
import { ICON, themeCss } from './tokens.mjs';
import { BASE, rootLogic, themeProps } from './color.mjs';

const D = `font-family:${DOTS};font-weight:900`;
const BIRD = { c: ICON.bird, l: ICON.crest };
const r2 = (n) => Math.round(n * 100) / 100;

// ---------- App 图标：32 格，底板内缩 3 格（1024 上 832，占 81.25%），鸟按格子画，所以 32、64……1024 都是整像素 ----------
function plate(n, inset, id) {
  const w = n - 2 * inset;
  return `<rect x="${inset}" y="${inset}" width="${w}" height="${w}" rx="${r2(w * ICON.radius)}" fill="url(#${id})"></rect>`;
}
const defs = (id, glow, shadow) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ICON.plate[0]}"></stop><stop offset="1" stop-color="${ICON.plate[1]}"></stop></linearGradient>
  ${glow ? `<filter id="${id}g" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="0.6" flood-color="${ICON.bird}" flood-opacity=".55"></feDropShadow></filter>` : ''}
  ${shadow ? `<filter id="${id}s" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="0.3" stdDeviation="0.3" flood-color="#000" flood-opacity=".35"></feDropShadow></filter>` : ''}</defs>`;
/** 尺寸 size 的 App 图标 SVG（16 用手画的 16 格；32 不加光；128 以上加底板阴影）。 */
export function appIcon(size, id = 'pk' + size) {
  if (size <= 16) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges">${defs(id)}${plate(16, 1, id)}${pix(T16, BIRD)}</svg>`;
  const glow = size >= 64, shadow = size >= 128;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" shape-rendering="crispEdges">${defs(id, glow, shadow)}<g${shadow ? ` filter="url(#${id}s)"` : ''}>${plate(32, ICON.inset, id)}</g><g${glow ? ` filter="url(#${id}g)"` : ''}>${pix(J2, BIRD)}</g></svg>`;
}
/** 第 1 步时的 J2：底板占满 32 格，四周留 2.35 格（鸟只占底板的 66%），对照用。 */
function oldJ2(size, id) {
  const m = 2.35;
  return `<svg viewBox="${-m} ${-m} ${32 + 2 * m} ${32 + 2 * m}" width="${size}" height="${size}" shape-rendering="crispEdges">${defs(id, true)}${plate(32, 0, id)}<g filter="url(#${id}g)">${pix(J2, BIRD)}</g></svg>`;
}

// ---------- 菜单栏模板图：18pt，黑 + 透明，系统上色。鸟用 16 格（眼睛是空的），右边放状态 ----------
const mono = (rows) => rows.map((r) => r.replace(/[bel]/g, (m) => (m === 'l' ? 'c' : '.')));
const GLYPH = {
  q: ['.##.', '#..#', '...#', '..#.', '.#..', '....', '.#..'],
  3: ['###', '..#', '.##', '..#', '###'],
};
const cells = (rows, ox, oy) => { let r = ''; rows.forEach((row, y) => [...row].forEach((k, x) => { if (k === '#') r += `<rect x="${ox + x}" y="${oy + y}" width="1" height="1"></rect>`; })); return r; };
/** state：idle / run（frame 0–2 哪颗点亮）/ wait / count。返回 [宽, SVG 内容]。 */
function menuMark(state, frame = 0) {
  const bird = pix(['.'.repeat(18), ...mono(T16).map((r) => '.' + r + '.')], { c: 'currentColor' }); // 鸟在 18 格里：左右各空 1 格，往下挪 1 格居中
  if (state === 'idle') return [18, bird];
  if (state === 'run') return [27, bird + [0, 1, 2].map((i) => `<rect x="${18 + i * 3}" y="${i === frame ? 9 : 10}" width="2" height="2" opacity="${i === frame ? 1 : 0.35}"></rect>`).join('')];
  if (state === 'wait') return [24, bird + cells(GLYPH.q, 19, 5)];
  return [23, bird + cells(GLYPH[3], 19, 7)];
}
export function menuSvg(state, frame = 0) {
  const [w, body] = menuMark(state, frame);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 18" width="${w}" height="18" fill="currentColor" shape-rendering="crispEdges">${body.replace(/fill="currentColor"/g, '')}</svg>`;
}
const MENU = [['idle', '空闲', '只有鸟'], ['run', '在跑', '右边三颗点轮流亮（每颗 6 格，一圈 0.9 秒）'], ['wait', '等你', '一个问号，不动'], ['count', '在跑 3 个', 'v0.7 起：几个项目同时在跑']];

/** 方案 marks/ 下的文件。 */
export function markFiles() {
  const f = {};
  f['marks/app-icon/j2.svg'] = appIcon(1024, 'j2');
  f['marks/app-icon/j2-32.svg'] = appIcon(32, 'j232');
  f['marks/app-icon/j2-16.svg'] = appIcon(16, 'j216');
  f['marks/menubar/idle.svg'] = menuSvg('idle');
  for (let i = 0; i < 3; i++) f[`marks/menubar/run-${i + 1}.svg`] = menuSvg('run', i);
  f['marks/menubar/wait.svg'] = menuSvg('wait');
  f['marks/menubar/count-3.svg'] = menuSvg('count');
  return f;
}
export const MARKS = [
  ['app-icon-j2', 'App 图标 · J2（主图标）', 'marks/app-icon/j2.svg', '32 格，底板内缩 3 格；64 以上加光，128 以上加底板阴影；导出 .icns 的 64–1024'],
  ['app-icon-j2-32', 'App 图标 · J2 · 32', 'marks/app-icon/j2-32.svg', '32 不加光；16@2x、32@1x 用它'],
  ['app-icon-j2-16', 'App 图标 · J2 · 16', 'marks/app-icon/j2-16.svg', '手画的 16 格，底板内缩 1 格；16@1x 用它'],
  ['menubar-idle', '菜单栏 · 空闲', 'marks/menubar/idle.svg', '模板图，18pt'],
  ['menubar-run', '菜单栏 · 在跑（3 帧）', 'marks/menubar/run-1.svg', 'run-1、run-2、run-3 轮流，每帧 6 格（300ms）'],
  ['menubar-wait', '菜单栏 · 等你', 'marks/menubar/wait.svg', '不动'],
  ['menubar-count', '菜单栏 · 在跑 N 个', 'marks/menubar/count-3.svg', 'v0.7 起；数字 3×5 像素，2–9'],
];

// .icns 里的 10 张：[文件名, 像素, 用哪个画法]
const ICNS = [
  ['icon_16x16.png', 16, '16 格（j2-16）'], ['icon_16x16@2x.png', 32, '32 格，不加光（j2-32）'],
  ['icon_32x32.png', 32, '32 格，不加光（j2-32）'], ['icon_32x32@2x.png', 64, '32 格，一格 2 像素，加光'],
  ['icon_128x128.png', 128, '一格 4 像素，加光、阴影'], ['icon_128x128@2x.png', 256, '一格 8 像素'],
  ['icon_256x256.png', 256, '一格 8 像素'], ['icon_256x256@2x.png', 512, '一格 16 像素'],
  ['icon_512x512.png', 512, '一格 16 像素'], ['icon_512x512@2x.png', 1024, '一格 32 像素（j2）'],
];

// ---------- 画板 ----------
const CSS = `
.pk.ic3{width:1280px;height:1000px;padding:26px 32px 28px;display:flex;flex-direction:column;gap:14px}
.ig{flex:1;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:14px;min-height:0}
.icl{display:flex;flex-direction:column;gap:14px;min-width:0}
.box{padding:12px 16px 14px}
.box .ml{margin-bottom:10px}
.j2r{display:grid;grid-template-columns:224px minmax(0,1fr);gap:18px}
.j2r svg,.j2r img{display:block}
.sizes{display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap}
.sizes figure{display:flex;flex-direction:column;align-items:center;gap:5px}
.sizes figcaption{${D};font-size:12px;color:var(--tx3)}
.spec li{display:grid;grid-template-columns:64px minmax(0,1fr);gap:8px;padding:4px 0;border-top:1px dotted var(--line2);font-size:12px;line-height:1.5;color:var(--tx2)}
.spec li:first-child{border-top:0}
.spec b{${D};font-size:12px;letter-spacing:.06em;color:var(--tx)}
.cmp{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cmp figure{display:flex;align-items:center;gap:12px;padding:8px;clip-path:var(--clip2)}
.cmp figure.on{background:var(--cy-soft)}
.cmp svg,.j2r svg,.sizes svg,.mst svg,.zoom svg{flex:none}
.icns{display:grid;grid-template-columns:1fr 1fr;column-gap:18px}
.icns li{display:grid;grid-template-columns:128px 34px minmax(0,1fr);gap:6px;align-items:baseline;padding:3px 0;border-top:1px dotted var(--line2);font-size:12px;color:var(--tx3);white-space:nowrap}
.icns li:nth-child(-n+2){border-top:0}
.icns .c{font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx)}
.icns .n{${D};font-size:12.5px;color:var(--tx);text-align:right}
.icns .s{overflow:hidden;text-overflow:ellipsis}
.cmp figcaption{font-size:12px;line-height:1.5;color:var(--tx2)}
.cmp figcaption b{display:block;font-size:12.5px;color:var(--tx)}
.a3{display:flex;align-items:flex-end;gap:14px}
.a3 img{display:block}
.a3 figure{display:flex;flex-direction:column;align-items:center;gap:5px}
.a3 figcaption{${D};font-size:12px;color:var(--tx3)}
.nt5{font-size:12px;line-height:1.55;color:var(--tx3);margin-top:8px}
.mb{display:flex;flex-direction:column;gap:8px}
.mbr{display:flex;align-items:center;gap:22px;height:30px;padding:0 14px}
.mbr.l{background:#E4E8F2;color:#000}
.mbr.d{background:#161C33;color:#FFF}
.mbr svg{display:block}
.mbr span{font-size:12px;opacity:.7;margin-left:auto}
.mst li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;padding:6px 0;border-top:1px dotted var(--line2)}
.mst li:first-child{border-top:0}
.mst .bz{display:flex;align-items:center;justify-content:center;width:62px;height:44px;background:var(--pane2);color:var(--tx)}
.mst p{font-size:12px;line-height:1.5;color:var(--tx2)}
.mst p b{display:block;font-size:12.5px;color:var(--tx)}
.zoom{display:flex;gap:10px;align-items:center}
.zoom svg{display:block;color:var(--tx);background:var(--pane2)}
`;
function iconBoard() {
  const def = FLIP ? '浅色' : '深色';
  const big = appIcon(224, 'b224');
  const sizes = [128, 64, 32, 16].map((n) => `<figure>${appIcon(n, 'sz' + n)}<figcaption>${n}</figcaption></figure>`).join('') +
    [[32, 16], [64, 32]].map(([n, base]) => `<figure>${appIcon(base, 'rt' + base).replace(`width="${base}" height="${base}"`, `width="${n}" height="${n}"`)}<figcaption>${base}@2X</figcaption></figure>`).join('');
  const spec = `<ul class="spec">
    <li><b>GRID</b><span>32 格。鸟按格子画（第 1 步的 J2，一个像素没动），1024 一格 32 像素，32 一格 1 像素：每个尺寸都是整像素，不糊。</span></li>
    <li><b>PLATE</b><span>底板内缩 3 格：1024 上 832（81%，Apple 的格子是 824），圆角 22.5%，深海渐变 ${ICON.plate.join(' → ')}。</span></li>
    <li><b>BIRD</b><span>青 ${ICON.bird}，冠羽 ${ICON.crest}，眼睛是空的。64 以上加一圈光（0.6 格），128 以上底板下一点阴影。</span></li>
    <li><b>SMALL</b><span>16 用手画的 16 格（底板内缩 1 格）；32 用 32 格，不加光。</span></li></ul>`;
  const cmp = `<div class="cmp"><figure>${oldJ2(96, 'o96')}<figcaption><b>第 1 步时</b>底板占 87%，鸟只占底板的 66%；放到 Apple 的格子里，1024 一格 25.75 像素，边会糊。</figcaption></figure>
    <figure class="on">${appIcon(96, 'n96')}<figcaption><b>这一轮</b>底板 81%（Apple 的格子），鸟在底板里大一点（81%）；每个尺寸整像素。</figcaption></figure></div>`;
  const a3 = `<div class="a3">${[[128, 'A3 · 128'], [64, '64']].map(([n, t]) => `<figure><img src="${A.a3}" width="${n}" height="${n}" style="transform:scale(.931)" alt="A3"><figcaption>${t}</figcaption></figure>`).join('')}</div>
    <p class="nt5">A3 是位图（现在的鸟一个像素不动，只润色背景）。只出 Dock 用的 128 以上；导出时底板从 87% 缩到 81%，和 J2 一样大。Finder、App 没开时都显示 J2。</p>`;
  const st = (s, f) => menuSvg(s, f).replace(/width="(\d+)" height="18"/, (m, w) => `width="${w * 2}" height="36"`);
  const mst = MENU.map(([s, nm, d]) => `<li><span class="bz">${st(s, 0)}</span><p><b>${nm}</b>${d}</p></li>`).join('');
  const bar = (cls) => `<div class="mbr ${cls}">${MENU.map(([s]) => menuSvg(s, 0)).join('')}<span>${cls === 'l' ? '浅色菜单栏' : '深色菜单栏'} · 1x</span></div>`;
  const zoom = `<div class="zoom">${menuSvg('idle').replace('width="18" height="18"', 'width="108" height="108"')}<p class="nt5" style="margin:0">18pt：@1x 18 像素，鸟用 16 格放在中间、四周空 1 格；@2x 一格 2 像素。模板图只有黑和透明，系统按明暗上色。</p></div>`;
  const body = `<div class="{{root}}"><div class="ft"><h1>图标定稿</h1><p>J2 是主图标（Dock、Finder、打包）；A3 是设置里能换的那个。菜单栏用 16 格的同一只鸟。</p></div>
    <div class="ig"><div class="icl"><div class="mod box"><p class="ml"><span class="l">APP ICON</span><span class="r">J2 · 照 Apple 的格子</span></p>
        <div class="j2r">${big}<div>${spec}</div></div><p class="ml" style="margin:14px 0 8px"><span class="l">SIZES</span><span class="r">1:1（最后两个是 2 倍屏）</span></p><div class="sizes">${sizes}</div></div>
      <div class="mod box"><p class="ml"><span class="l">PLATE</span><span class="r">要你定</span></p>${cmp}</div>
      <div class="mod box"><p class="ml"><span class="l">ICNS</span><span class="r">导出的 10 张（导入 visual-atelier 后出）</span></p><ul class="icns">${ICNS.map(([n, px2, src]) => `<li><span class="c">${n}</span><span class="n">${px2}</span><span class="s">${src}</span></li>`).join('')}</ul></div></div>
      <div class="icl"><div class="mod box"><p class="ml"><span class="l">MENU BAR</span><span class="r">模板图 · 18pt</span></p><ul class="mst">${mst}</ul>
          <div class="mb" style="margin-top:10px">${bar('l')}${bar('d')}</div><div style="margin-top:10px">${zoom}</div></div>
        <div class="mod box"><p class="ml"><span class="l">A3</span><span class="r">现在的图标 · 设置里能换</span></p>${a3}</div></div></div></div>`;
  const html = board({ title: '图标定稿', css: `${PROTO}\n${BASE}\n${CSS}\n${themeCss()}`, body, props: themeProps(def), logic: rootLogic('pk ic3 doc dots', def), h: 1000 });
  return { file: 'S3-Icon.dc.html', h: 1000, title: '图标定稿 · App 图标各尺寸、菜单栏四个状态', html };
}

export function boards() {
  return [iconBoard()];
}
