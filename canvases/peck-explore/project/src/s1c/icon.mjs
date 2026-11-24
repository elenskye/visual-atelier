// 第 1 步 · 第三轮 · App 图标：站主选 J2，同时留现在的图标（只润色背景，鸟不动），设置里能在两个之间换。
// 现在的图标润色三版（A1–A3）是把鸟从原来的纯色底里分出来、放到新底上生成的 PNG，已传到画布。
import { board, PROPS, A, SANS, DOTS, px, FLIP } from './kit.mjs';
import { J2, T16, pix } from '../s1b/icon.mjs';

const CY = '#00E5FF', PALE = '#A8F6FF';
const D = `font-family:${DOTS};font-weight:900`;

function symbols() {
  const BIRD = { c: CY, l: PALE };
  const bg = (n) => `<rect width="${n}" height="${n}" rx="${(n * 0.224).toFixed(2)}" fill="url(#gb3)"></rect>`;
  const mono = (rows) => rows.map((r) => r.replace(/[bel]/g, (m) => (m === 'l' ? 'c' : '.')));
  // j2f：和润色版 PNG 一样留边（圆角方块占 87%），放进 Dock 和设置里两个一样大
  const m = 2.35;
  return `<svg class="defs" width="0" height="0" aria-hidden="true"><defs>
    <linearGradient id="gb3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16214A"></stop><stop offset="1" stop-color="#050816"></stop></linearGradient>
    <filter id="gl3" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow in="SourceGraphic" dx="0" dy="0" stdDeviation="0.6" flood-color="${CY}" flood-opacity=".55"></feDropShadow></filter>
  </defs>
  <symbol id="j2" viewBox="0 0 32 32">${bg(32)}<g filter="url(#gl3)">${pix(J2, BIRD)}</g></symbol>
  <symbol id="j2f" viewBox="${-m} ${-m} ${32 + 2 * m} ${32 + 2 * m}">${bg(32)}<g filter="url(#gl3)">${pix(J2, BIRD)}</g></symbol>
  <symbol id="j2s" viewBox="0 0 16 16">${bg(16)}${pix(T16, BIRD)}</symbol>
  <symbol id="t2" viewBox="0 0 16 16">${pix(mono(T16), { c: 'currentColor' })}</symbol>
  </svg>`;
}
const use = (id, cls) => `<svg class="${cls}" aria-hidden="true" shape-rendering="crispEdges"><use href="#${id}"></use></svg>`;
const img = (src, cls, alt = '') => `<img class="${cls}" src="${src}" alt="${alt}">`;

const CSS = `
.pk.ib{width:1280px;height:800px;padding:24px 32px 26px;display:flex;flex-direction:column;gap:14px;font-family:${SANS}}
.defs{position:absolute;width:0;height:0;overflow:hidden}
.top{display:flex;align-items:baseline;gap:16px}
.top h1{font-size:20px;font-weight:600}
.top p{font-size:13px;color:var(--tx2)}
.g3{flex:1;display:grid;grid-template-columns:316px minmax(0,1fr) 334px;gap:14px;min-height:0}
.cl{display:flex;flex-direction:column;gap:10px;min-height:0}
.ih{display:flex;align-items:center;gap:8px;white-space:nowrap}
.ih .k{${D};font-size:18px;color:var(--cy-tx);text-shadow:var(--dglow)}
.ih b{font-size:15px;font-weight:600}
.ih .tag{margin-left:auto}
.nt{font-size:12px;line-height:1.55;color:var(--tx2)}
.big{width:196px;height:196px;display:block;align-self:center;margin:4px 0}
.strip{display:flex;align-items:center;gap:16px;height:80px;padding:0 14px;background:#050816}
.strip.lite{background:#EEF1F8}
.strip .lb{margin-left:auto;font-size:11px;color:#7A84B6}
.strip.lite .lb{color:#646C92}
.s64{width:64px;height:64px;display:block}.s32{width:32px;height:32px;display:block}.s16{width:16px;height:16px;display:block}
.mbar{display:flex;align-items:center;gap:18px;height:30px;padding:0 12px;font-size:11px}
.mbar.ml{background:#E4E8F2;color:#0B1030}
.mbar.md{background:#161C33;color:#E8ECFF}
.mbar .st{display:flex;align-items:center;gap:5px}
.mbar .t{width:18px;height:18px;display:block}
.mbar .ex{display:inline-flex;align-items:center;gap:2px}
.mbar .ex i{width:3px;height:3px;background:currentColor;animation:tw 1.2s steps(1) infinite}
.mbar .ex i:nth-child(2){animation-delay:.3s}.mbar .ex i:nth-child(3){animation-delay:.6s}
.mbar .ex.q{font-weight:700;font-size:12px;line-height:1}
.mbar .lb{margin-left:auto;opacity:.65}
.vs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.vs figure{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px 8px;clip-path:var(--clip2)}
.vs figure.on{background:var(--cy-soft)}
.vs img{width:104px;height:104px;display:block}
.vs figcaption{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;white-space:nowrap}
.vs figcaption .k{${D};font-size:15px;color:var(--cy-tx)}
.vs figcaption .tag{margin-left:2px}
.vs .d{font-size:11.5px;color:var(--tx3);text-align:center;line-height:1.45;font-weight:400}
.vs .ref .k{color:var(--tx3)}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.zz{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto}
.zc{position:relative;height:176px;overflow:hidden;background:#050816}
.zc img{position:absolute;width:512px;height:512px;left:-176px;top:-100px;max-width:none}
.zc span{position:absolute;left:8px;bottom:6px;font-size:11px;color:#9AA3CF;background:#050816;padding:0 4px}
/* 设置 */
.set{display:flex;flex-direction:column;gap:12px}
.set .ml{margin-bottom:2px}
.srow{display:flex;justify-content:space-between;align-items:baseline}
.srow b{font-size:13.5px;font-weight:600}
.srow span{font-size:11.5px;color:var(--tx3)}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tile{position:relative;isolation:isolate;display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 8px 12px;clip-path:var(--clip2);background:var(--line2)}
.tile:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.tile.on{background:var(--cy-ol)}
.tile.on:before{inset:2px;background:linear-gradient(var(--cy-soft),var(--cy-soft)),var(--pane)}
.tile .ti{width:104px;height:104px;display:block}
.tile .tl{display:flex;align-items:center;gap:8px;${D};font-size:14px;letter-spacing:.08em}
.tile .tl .rb{width:14px;height:14px}
.tile .tl .rb:after{left:4px;top:4px;width:6px;height:6px}
.tile .td{font-size:11.5px;color:var(--tx3)}
.dock{display:flex;align-items:flex-end;justify-content:center;gap:8px;padding:12px 10px 8px;background:rgba(160,175,220,.16);box-shadow:inset 0 0 0 1px var(--line2);clip-path:var(--clip2)}
.dock .ap{position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center}
.dock .ap i{width:44px;height:44px;border-radius:11px;background:var(--raise);box-shadow:inset 0 0 0 1px var(--line2)}
.dock .ap .di{width:52px;height:52px;display:block}
.dock .ap.run:after{content:"";position:absolute;bottom:-5px;left:24px;width:4px;height:4px;background:var(--tx2)}
.dl{display:flex;justify-content:space-between;font-size:11.5px;color:var(--tx3)}
.ul{display:flex;flex-direction:column;gap:6px;font-size:12px;line-height:1.5;color:var(--tx2)}
.ul li{display:grid;grid-template-columns:14px minmax(0,1fr);gap:8px}
.ul li .px{width:12px;height:12px;margin-top:4px;color:var(--cy-tx)}
.ul li.w .px{color:var(--warn)}
`;

function colJ2() {
  return `<section class="mod cl"><p class="ih"><span class="k">J2</span><b>像素重绘 · 主图标</b><em class="tag rec">DEFAULT</em></p>
    ${use('j2', 'big')}
    <div class="strip">${use('j2', 's64')}${use('j2', 's32')}${use('j2s', 's16')}<span class="lb">64 · 32 · 16</span></div>
    <div class="strip lite">${use('j2', 's64')}${use('j2', 's32')}${use('j2s', 's16')}<span class="lb">浅底</span></div>
    <div class="mbar ml"><span class="st">${use('t2', 't')}</span><span class="st">${use('t2', 't')}<span class="ex"><i></i><i></i><i></i></span></span><span class="st">${use('t2', 't')}<span class="ex q">!</span></span><span class="lb">菜单栏：空闲 · 在跑 · 等你</span></div>
    <div class="mbar md"><span class="st">${use('t2', 't')}</span><span class="st">${use('t2', 't')}<span class="ex"><i></i><i></i><i></i></span></span><span class="st">${use('t2', 't')}<span class="ex q">!</span></span><span class="lb">深色菜单栏</span></div>
    <p class="nt">第二轮的 J2 原样定稿：32 格，眼睛 2×2，底是深海渐变，鸟带一圈光。16 号用手画的 16 格。</p>
  </section>`;
}

function colNow() {
  const V = [
    [A.now, '原图', '', '现在的图标，纯色底', 'ref'],
    [A.a1, 'A1', '渐变', '底换成深海渐变', ''],
    [A.a2, 'A2', '加光', '再加和 J2 一样的光，顶边一道细高光', 'on'],
    [A.a3, 'A3', '点阵孔', '再加一层很淡的 LED 点阵孔', ''],
  ];
  return `<section class="mod cl"><p class="ih"><span class="k">A</span><b>现在的图标 · 润色背景</b></p>
    <p class="nt">鸟一个像素都没动：轮廓、冠羽高光、眼睛都是原图的，只换了底。中间那版的光和 J2 一样，两个图标放在一起是一家。</p>
    <div class="vs">${V.map(([src, k, nm, d, cls]) => `<figure class="${cls}">${img(src, '', k === '原图' ? 'Peck 现在的 App 图标' : `现在的图标 · ${k}`)}<figcaption><span class="k">${k}</span>${nm}${cls === 'on' ? '<em class="tag rec">PICK</em>' : ''}</figcaption><p class="d">${d}</p></figure>`).join('')}</div>
    <div class="pair">
      <div class="strip">${img(A.a2, 's64')}${img(A.a2, 's32')}${img(A.a2, 's16')}<span class="lb">A2</span></div>
      <div class="strip lite">${img(A.a2, 's64')}${img(A.a2, 's32')}${img(A.a2, 's16')}<span class="lb">浅底</span></div>
    </div>
    <div class="pair">
      <div class="strip">${img(A.now, 's64')}${img(A.now, 's32')}${img(A.now, 's16')}<span class="lb">原图</span></div>
      <div class="strip lite">${img(A.now, 's64')}${img(A.now, 's32')}${img(A.now, 's16')}<span class="lb">浅底</span></div>
    </div>
    <div class="zz"><div class="zc">${img(A.now, '')}<span>原图 · 放大看</span></div><div class="zc">${img(A.a2, '')}<span>A2 · 同一块</span></div></div>
  </section>`;
}

function colSet() {
  return `<section class="mod cl set"><p class="ml"><span class="l">APPEARANCE</span><span class="r">设置 · 外观（点两个图标试试）</span></p>
    <p class="srow"><b>App 图标</b><span>换了马上生效</span></p>
    <div class="tiles">
      <button type="button" class="tile {{c0}}" onClick="{{p0}}">${use('j2f', 'ti')}<span class="tl"><i class="rb {{r0}}"></i>PIXEL</span><span class="td">像素 J2 · 默认</span></button>
      <button type="button" class="tile {{c1}}" onClick="{{p1}}">${img(A.a2, 'ti')}<span class="tl"><i class="rb {{r1}}"></i>CLASSIC</span><span class="td">现在的图标 · 润色版</span></button>
    </div>
    <div class="dock"><span class="ap"><i></i></span><span class="ap"><i></i></span><span class="ap run">
      <sc-if value="{{isJ2}}" hint-placeholder-val="{{true}}">${use('j2f', 'di')}</sc-if>
      <sc-if value="{{isA}}" hint-placeholder-val="{{false}}">${img(A.a2, 'di', 'Dock 里的 Peck')}</sc-if>
    </span><span class="ap"><i></i></span><span class="ap"><i></i></span></div>
    <p class="dl"><span>Dock 预览</span><span>{{pickName}}</span></p>
    <ul class="ul">
      <li>${px('check')}<span>App 开着时，Dock、⌘Tab 切换器、关于窗口里马上换。</span></li>
      <li>${px('check')}<span>菜单栏两种都用 16 格的像素小鸟，最小的地方像素最清楚。</span></li>
      <li class="w">${px('bang')}<span>App 没开时，Dock 和 Finder 里显示打包时的那个（J2）。要它们也跟着换得改 App 包本身，先不做。</span></li>
      <li>${px('check')}<span>外框保持系统的圆角方块，不切像素角：新版 macOS 会把别的形状装进一个灰框里。</span></li>
    </ul>
  </section>`;
}

export function boards() {
  const def = FLIP ? '浅色' : '深色';
  const logic = `
  constructor(p) { super(p); this.state = { pick: 0 }; }
  renderVals() {
    const dark = (this.props.theme ?? '${def}') === '深色';
    const lc = 'c' + ((this.props.lc ?? 'L2').slice(1, 2));
    const s = this.state;
    return {
      root: 'pk ib dots ' + (dark ? 'dk' : 'lt') + ' ' + lc,
      c0: s.pick === 0 ? 'on' : '', c1: s.pick === 1 ? 'on' : '',
      r0: s.pick === 0 ? 'on' : '', r1: s.pick === 1 ? 'on' : '',
      p0: () => this.setState({ pick: 0 }), p1: () => this.setState({ pick: 1 }),
      isJ2: s.pick === 0, isA: s.pick === 1,
      pickName: s.pick === 0 ? 'PIXEL · 像素 J2' : 'CLASSIC · 现在的图标',
    };
  }`;
  const html = board({
    title: 'App 图标 · 第三轮', css: CSS, props: { ...PROPS.theme(def), ...PROPS.lc }, logic,
    body: `<div class="{{root}}">${symbols()}
  <div class="top"><h1>App 图标 · 第三轮</h1><p>J2 定成主图标；现在的图标留着，只润色背景。设置里能在两个之间换。</p></div>
  <div class="g3">${colJ2()}${colNow()}${colSet()}</div>
</div>`,
  });
  return [{ file: 'S1c-Icon.dc.html', x: 2720, y: 920, title: 'App 图标 · J2 + 现在的图标（润色）', html }];
}
