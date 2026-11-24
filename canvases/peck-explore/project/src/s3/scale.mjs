// 第 3 步 · 字和尺寸：字的角色（真字体、真字号摆出来）、控件尺寸、间距、像素角、布局、发光。值从 tokens.mjs 取。
import { board, SANS, DOTS, FLIP } from '../s1c/kit.mjs';
import { CSS as PROTO } from '../s2/proto.mjs';
import { TYPE, FONT, SPACE, SIZE, LAYOUT, STEPS, GLOW, themeCss } from './tokens.mjs';
import { BASE, rootLogic, themeProps } from './color.mjs';

const D = `font-family:${DOTS};font-weight:900`;
const FN = { name: '缝合像素 12', body: 'Plex Sans + 苹方', code: 'Departure Mono', dots: 'Doto 900' };
const SAMPLE = {
  hero: 'weather-cli 要做什么？', title: '把设置里三个对话框合成一个面板', name: '把设置里三个对话框合成一个面板',
  body: '三个设置对话框合成了一个 SettingsSheet；旧的两个删了。', small: '在 ~/code/weather-cli 里跑 · 3 分钟前',
  code: 'const [settingsOpen, setSettingsOpen] = useState(false)', label: 'MUSE→GROK  EDIT', button: 'SEND  UNDO TASK',
  count: '13', num: '+87 −191', timer: '00:19',
};

const CSS = `
.pk.sc3{width:1280px;height:900px;padding:26px 32px 28px;display:flex;flex-direction:column;gap:14px}
.g3{flex:1;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr);gap:14px;min-height:0}
.cc{display:flex;flex-direction:column;gap:14px;min-width:0}
.box{padding:12px 16px 14px}
.box .ml{margin-bottom:8px}
.ty li{padding:6px 0 5px;border-top:1px dotted var(--line2)}
.ty li:first-child{border-top:0;padding-top:0}
.ty .sp{display:block;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ty .mt{display:flex;gap:8px;align-items:baseline;margin-top:2px;font-size:12px;color:var(--tx3);white-space:nowrap}
.ty .mt b{${D};font-size:12px;letter-spacing:.06em;color:var(--cy-tx)}
.ty .mt .code{color:var(--tx2)}
.ty .mt span:last-child{overflow:hidden;text-overflow:ellipsis}
.sz li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:baseline;padding:4px 0;border-top:1px dotted var(--line2);font-size:12px;color:var(--tx2)}
.sz li:first-child{border-top:0}
.sz li b{font-size:12.5px;font-weight:600;color:var(--tx)}
.sz li span{display:block;font-size:12px;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sz li em{${D};font-size:14px;color:var(--tx)}
.spc{display:flex;align-items:flex-end;gap:7px;height:52px}
.spc div{display:flex;flex-direction:column;align-items:center;gap:4px}
.spc i{display:block;width:var(--w);height:var(--w);background:var(--cy-blk);box-shadow:var(--dglow)}
.spc span{${D};font-size:12px;color:var(--tx3)}
.stp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.stp figure{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.stp svg{width:66px;height:66px;display:block}
.stp figcaption{font-size:12px;line-height:1.45;color:var(--tx2)}
.stp figcaption b{display:block;${D};font-size:12px;letter-spacing:.06em;color:var(--tx)}
.lay{display:grid;grid-template-columns:72px minmax(0,1fr) 84px;gap:4px;height:70px;margin:2px 0 6px}
.lay i{display:flex;align-items:center;justify-content:center;background:var(--raise);${D};font-size:12px;color:var(--tx2)}
.lay i.c{background:var(--cy-soft);color:var(--cy-tx)}
.gl{display:grid;grid-template-columns:repeat(3,1fr);gap:10px 8px}
.gl figure{display:flex;flex-direction:column;align-items:center;gap:6px}
.gl .st{display:flex;align-items:center;justify-content:center;width:100%;height:42px;background:var(--pane2)}
.gl figcaption{font-size:12px;color:var(--tx3);text-align:center;line-height:1.35}
.gl .d1{width:4px;height:4px;background:var(--cy-blk);box-shadow:var(--dglow)}
.gl .d2{width:22px;height:12px;background:var(--cy-blk);box-shadow:var(--bglow)}
.gl .d3{${D};font-size:20px;color:var(--cy-tx);text-shadow:var(--glow)}
.gl .d4{${D};font-size:26px;color:var(--cy-tx);text-shadow:var(--tglow)}
.gl .d5{display:flex;align-items:center;height:24px;padding:0 8px;background:var(--cy-fill);clip-path:var(--clip2);${D};font-size:13px;color:var(--on-cy);text-shadow:var(--on-glow)}
.gl .d6{font-size:13px;color:var(--tx);text-shadow:var(--hglow)}
.nt4{font-size:12px;line-height:1.55;color:var(--tx3)}
`;
/** 一个角放大 6 倍：levels 级、每级 step 像素。 */
function corner(levels, step, cls) {
  const n = 10, k = 6;
  let r = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const out = Math.floor(x / step) + Math.floor(y / step) < levels;
    r += `<rect x="${x * k}" y="${y * k}" width="${k - 1}" height="${k - 1}" fill="${out ? 'var(--off)' : cls}"></rect>`;
  }
  return `<svg viewBox="0 0 ${n * k} ${n * k}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}
function scaleBoard() {
  const def = FLIP ? '浅色' : '深色';
  const ty = TYPE.map(([id, nm, f, size, lh, w, use]) => `<li><span class="sp" style="font-family:${FONT[f].replace(/"/g, '&quot;')};font-size:${size}px;line-height:${lh}px;font-weight:${w}${f === 'dots' ? ';letter-spacing:.06em' : ''}">${SAMPLE[id]}</span>
    <p class="mt"><b>${id.toUpperCase()}</b><span>${nm}</span><span class="code">${FN[f]} ${size} / ${lh}</span><span>${use}</span></p></li>`).join('');
  const sz = SIZE.map(([id, nm, v, use]) => `<li><div><b>${nm}</b><span>${use}</span></div><em>${v}</em></li>`).join('');
  const spc = Object.entries(SPACE).map(([k, v]) => `<div><i style="--w:${v}px"></i><span>${v}</span></div>`).join('');
  const stp = STEPS.map(([id, use, lv, st]) => `<figure>${corner(lv, st, id === 'module' ? 'var(--line2)' : 'var(--cy-blk)')}<figcaption><b>${lv} × ${st}PX</b>${use}</figcaption></figure>`).join('');
  const L = Object.fromEntries(LAYOUT.map(([k, , v]) => [k, v]));
  const gl = GLOW.map(([id, nm], i) => `<figure><span class="st"><i class="d${i + 1}">${i === 2 ? 'NOW' : i === 3 ? '00:19' : i === 4 ? 'SEND' : i === 5 ? 'Muse 写规范' : ''}</i></span><figcaption>${nm}</figcaption></figure>`).join('');
  const body = `<div class="{{root}}"><div class="ft"><h1>字和尺寸</h1><p>四种字各管一件事；尺寸、间距、角都是整像素。发光只在深色里有。</p></div>
    <div class="g3"><div class="mod box"><p class="ml"><span class="l">TYPE</span><span class="r">真字体、真字号</span></p><ul class="ty">${ty}</ul></div>
      <div class="cc"><div class="mod box"><p class="ml"><span class="l">SIZE</span><span class="r">控件尺寸</span></p><ul class="sz">${sz}</ul></div>
        <div class="mod box"><p class="ml"><span class="l">SPACE</span><span class="r">间距只用这几个</span></p><div class="spc">${spc}</div></div></div>
      <div class="cc"><div class="mod box"><p class="ml"><span class="l">STEPS</span><span class="r">像素阶梯角（放大 6 倍）</span></p><div class="stp">${stp}</div></div>
        <div class="mod box"><p class="ml"><span class="l">LAYOUT</span><span class="r">三栏</span></p><div class="lay"><i>${L.left}</i><i class="c">FLEX</i><i>${L.right}</i></div>
          <p class="nt4">栏间 ${L.gap}；窗口上 ${L['pad-top']}、左右 ${L['pad-x']}、下 ${L['pad-bottom']}；模块内边距 ${L['mod-pad']}；顶栏 44。宽栏 = 中栏 + 右栏。</p></div>
        <div class="mod box"><p class="ml"><span class="l">GLOW</span><span class="r">只在深色</span></p><div class="gl">${gl}</div></div></div></div></div>`;
  const html = board({ title: '字和尺寸', css: `${PROTO}\n${BASE}\n${CSS}\n${themeCss()}`, body, props: themeProps(def), logic: rootLogic('pk sc3 doc dots', def), h: 900 });
  return { file: 'S3-Scale.dc.html', h: 900, title: '字和尺寸 · 字的角色、控件尺寸、间距、角、发光', html };
}

export function boards() {
  return [scaleBoard()];
}
