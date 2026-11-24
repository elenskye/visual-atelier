// 第 4 步 · 第一轮结果板和画布上的便签。数从构建结果（built）、上传记录（published）、逐格对照（compare.json）取。
import * as m from './markup.mjs';
import { components } from './ds.mjs';
import { GLYPHS } from './css.mjs';

const STATE_NAME = { d: '平时', h: '悬停', f: '焦点', p: '按下', o: '选中', x: '不能用' };
// 有意和第 3 步控件板不一样的地方：[行名, 为什么]
export const INTENDED = {
  单选: '选项的名字用缝合像素（DESIGN.md：名字包括选项）；第 3 步控件板写成了正文字',
  多选: '同上',
};

const CSS = `
.s4r{width:1280px;height:960px;padding:26px 32px 28px;display:flex;flex-direction:column;gap:14px}
.r1{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px;min-height:0;flex:1}
.cc{display:flex;flex-direction:column;gap:14px;min-width:0;min-height:0}
.box{padding:12px 16px 14px}
.box .pk-mod-head{margin-bottom:8px}
.dn li{display:grid;grid-template-columns:76px minmax(0,1fr);gap:10px;padding:7px 0;border-top:1px dotted var(--color-line-strong)}
.dn li:first-child{border-top:0}
.dn b{font-size:13px;font-weight:600}
.dn p{margin:0;font-size:12.5px;line-height:1.55;color:var(--color-text-2)}
.dn p em{display:block;margin-top:2px;font-style:normal;font-family:var(--font-code);font-size:var(--text-code);color:var(--color-cyan-text)}
.cmp2{display:flex;gap:18px;align-items:baseline;margin-bottom:6px}
.cmp2 b{font-family:var(--font-dots);font-weight:900;font-size:26px;line-height:1;color:var(--color-ok)}
.cmp2 span{font-size:12px;color:var(--color-text-3)}
.df li{display:grid;grid-template-columns:120px minmax(0,1fr);gap:10px;padding:3px 0;font-size:12px;line-height:1.5;color:var(--color-text-2);border-top:1px dotted var(--color-line-strong)}
.df li:first-child{border-top:0}
.df li span:first-child{color:var(--color-text)}
.im li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px;padding:3px 0;font-size:12.5px;line-height:1.55;color:var(--color-text-2)}
.im li .n{font-family:var(--font-dots);font-weight:900;font-size:14px;color:var(--color-text-3)}
.qs li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;padding:8px 0;border-top:1px dotted var(--color-line-strong)}
.qs li:first-child{border-top:0}
.qs .n{font-family:var(--font-dots);font-weight:900;font-size:18px;color:var(--color-warn)}
.qs b{display:block;font-size:13px;font-weight:600;margin-bottom:2px}
.qs p{margin:0;font-size:12.5px;line-height:1.6;color:var(--color-text-2)}
.nx p{margin:0;font-size:12.5px;line-height:1.6;color:var(--color-text-2)}
.lk{font-family:var(--font-code);font-size:var(--text-code);color:var(--color-cyan-text);word-break:break-all}
`;

export function summary({ built }) {
  const t = built.tokens;
  const nComp = Object.keys(components()).length;
  return {
    colors: t.color.tokens.length, styles: t.type.groups.reduce((n, g) => n + g.styles.length, 0),
    other: ['spacing', 'width', 'text', 'leading', 'size', 'step', 'shadow'].reduce((n, k) => n + (t[k]?.tokens.length || 0), 0),
    comps: nComp, icons: Object.keys(GLYPHS).length, assets: built.uploads.length, files: Object.keys(built.files).length,
  };
}

export function report({ built, published, cmp, shell }) {
  const s = summary({ built });
  const url = published?.url;
  const cmpLine = (th) => {
    const c = cmp?.[th];
    if (!c) return '还没对';
    return `${c.same} / ${c.total} 格一样`;
  };
  const diffs = cmp ? ['dark', 'light'].flatMap((th) => cmp[th].diffs.map((d) => ({ ...d, th }))) : [];
  // 按行合并：同一行的几个状态写在一起
  const byRow = {};
  for (const d of diffs) (byRow[d.row] ||= new Set()).add(`${d.th === 'dark' ? '深' : '浅'}·${STATE_NAME[d.state]}`);
  const dfl = Object.entries(byRow).map(([row, st]) => `<li><span>${row}</span><span>${INTENDED[row] || [...st].join('、') + ' 有差别'}</span></li>`).join('');
  const DONE = [
    ['Design System', `云端「Peck」：说明（README 九节）、颜色 ${s.colors} 个（深浅两套，第一主题深色）、字体样式 ${s.styles} 个、其余 token ${s.other} 个（间距、宽、字号、行高、尺寸、像素角、发光）、组件 ${s.comps} 个带预览、封面、图标 ${s.icons} 个、资产 ${s.assets} 个（App 图标 ${s.assets - 6}、菜单栏 6）、两个字体文件。`, url || '（发上去以后写链接）'],
    ['挂上画布', '照 Design 画布的做法：project/ds/peck/ 放 tokens.json、tokens.css、bundle.css、bundle.js 和两个字体文件，canvas.json 记了一条。这一页的四张板都只引它，没有自己的控件样式。', 'ds/peck/ · S4-Kit · S4-Main · S4-Icon'],
    ['对一遍', `控件全套和第 3 步的控件板一格一格截图对：深色 ${cmpLine('dark')}，浅色 ${cmpLine('light')}。主界面「在跑」「停下来问你」两个时刻也拿它搭了一屏。`, 'S4-Kit · S4-Main'],
    ['三个回答', '深色亮一档、键盘焦点都按第 3 步的落了；图标的底板换回第 1 步的比例（占 7/8）；小尺寸的鸟照 J2 缩下来重画（你说第一版脸太臃肿），每个尺寸一格都是整像素。', 'S4-Icon · scheme/DESIGN.md §6'],
  ];
  const IMPORT = [
    '第一主题是深色（Pomelo 的是浅色先）：build:ds 要能按 tokens.config.json 的 themes 排。',
    '两个字体文件放进 Design System 的 fonts/，tokens.json 的 type.fonts 列出来。',
    '控件尺寸 size-* 和像素角 step-* 两组 token（取自 scale.json）；没有圆角就不出 radius。',
    'scheme/ 整个复制成 schemes/peck/（含 design-system/），画布复制成 canvases/peck-explore/。',
  ];
  const FIXED = [
    ['红底、琥珀按钮', '键盘焦点的点线画成了青色（选择器权重不够），改回块上的字色'],
    ['选中的选项片', '图标被染成青字；第 3 步是白的，照第 3 步'],
    ['模块套模块', '里面那块跟着外面描了彩边（变量从外层继承），边和面改成写在模块自己身上'],
    ['键盘焦点', '组件样式里一开始漏写了焦点的点线，补上'],
  ];
  const QUESTIONS = [
    ['Design System 认不认？', '云端打开「Peck」看说明、组件、封面；画布上 S4-Kit、S4-Main 是挂上以后搭的。认了方案状态改 approved，进收尾。'],
  ];
  const body = `<div class="pk pk-dots doc s4r" data-theme="{{theme}}"><div class="ft"><h1>第 4 步 · 第一轮结果</h1><p>在云端建了 Peck 的 Design System，挂到这块画布上，拿它重搭了控件全套和一屏主界面，和第 3 步逐格对过。</p></div>
    <div class="r1"><div class="cc"><div class="pk-mod box">${m.modHead('DONE', '这一轮做的')}<ul class="dn">${DONE.map(([a, b, c]) => `<li><b>${a}</b><p>${b}<em>${c}</em></p></li>`).join('')}</ul></div>
        <div class="pk-mod box" style="flex:1">${m.modHead('DIFF', '和第 3 步控件板不一样的格')}${cmp ? `<div class="cmp2"><b>${cmp.dark.same + cmp.light.same}/${cmp.dark.total + cmp.light.total}</b><span>深浅一共 ${cmp.dark.total + cmp.light.total} 格，截图逐像素比（错开 1 像素以内，不一样的点不到 2% 算一样）</span></div><ul class="df">${dfl || '<li><span>没有</span><span>每一格都一样</span></li>'}</ul>` : '<p class="nt5">还没对</p>'}
          <p class="pk-mod-head" style="margin:12px 0 6px"><span class="pk-mod-label">FIXED</span><span class="pk-mod-note">对出来改了的</span></p><ul class="df">${FIXED.map(([a, b]) => `<li><span>${a}</span><span>${b}</span></li>`).join('')}</ul></div></div>
      <div class="cc"><div class="pk-mod pk-mod--wait box qs">${m.modHead('QUESTIONS', '要你定')}<ul>${QUESTIONS.map(([b, p], i) => `<li><span class="n">${i + 1}</span><div><b>${b}</b><p>${p}</p></div></li>`).join('')}</ul></div>
        <div class="pk-mod box">${m.modHead('IMPORT', '收尾时 visual-atelier 要补的')}<ul class="im">${IMPORT.map((t, i) => `<li><span class="n">${i + 1}</span><span>${t}</span></li>`).join('')}</ul></div>
        <div class="pk-mod box nx">${m.modHead('NEXT', '收尾')}<p>认了就收尾：画布、方案、Design System 一起导入 visual-atelier；你打 tag 以后同步进 Peck，Peck 的 Phase 2 完成。</p></div></div></div></div>`;
  return { file: 'S4-Report.dc.html', w: 1280, h: 960, title: '第 4 步 · 第一轮结果 · 要你定 1 件事', html: shell({ title: '第 4 步 · 第一轮结果', css: CSS, body, w: 1280, h: 960 }) };
}

/** 这一页的便签。 */
export function notes(PAGE, { published, built }) {
  const s = summary({ built });
  return {
    [`${PAGE}-title`]: { x: 0, y: -300, text: '第 4 步 · Design System · 第一轮：云端建好「Peck」，挂到画布上对一遍', kind: 'title1', maxW: 4480, page: PAGE },
    [`${PAGE}-took`]: {
      x: 4560, y: 0, w: 400, fill: 'teal', page: PAGE,
      text: `第 3 步收尾了：深色亮一档、键盘焦点按第 3 步的落了；图标底板换回第 1 步的比例（S4-Icon）。\n\n这一页是 Design System：\n· 云端「Peck」${published?.url ? '：' + published.url : ''}——说明、${s.comps} 个组件带预览、封面、${s.colors} 个颜色深浅两套、${s.icons} 个图标\n· 挂到这块画布（project/ds/peck/），S4-Kit、S4-Main 只用它搭\n· S4-Kit 和第 3 步的控件板逐格对过，结果在 S4-Report`,
    },
    [`${PAGE}-pick`]: {
      x: 4560, y: 760, w: 400, fill: 'orange', page: PAGE,
      text: '这一轮请你看\n\nDesign System 认不认：云端打开「Peck」看说明、组件、封面（右上角能切深浅）；画布上 S4-Main 能在 Tweaks 里切「在跑 / 停下来问你」。\n\n认了就收尾：画布、方案、Design System 一起导入 visual-atelier。',
    },
  };
}
