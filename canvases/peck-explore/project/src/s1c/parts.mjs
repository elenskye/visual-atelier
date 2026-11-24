// 第 1 步 · 第三轮 · 零件：所有控件都切成像素角，青色小块（分段的选中块、PICK 标签、开关）也一样。左深右浅，浅色的青跟 Tweaks 走。
import { board, PROPS, DOTS, SANS, px, blocks, FLIP } from './kit.mjs';

const D = `font-family:${DOTS};font-weight:900`;
const CSS = `
.pk.pt{width:1280px;height:800px;padding:24px 32px 26px;display:flex;flex-direction:column;gap:14px}
.top{display:flex;align-items:baseline;gap:16px;font-family:${SANS}}
.top h1{font-size:20px;font-weight:600}
.top p{font-size:13px;color:var(--tx2)}
.g2{flex:1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;min-height:0}
.half{display:flex;flex-direction:column;gap:12px;padding:16px 20px;color:var(--tx);background-color:var(--bg);box-shadow:inset 0 0 0 1px var(--line2);min-height:0}
.hh{display:flex;align-items:baseline;gap:10px;font-family:${SANS}}
.hh b{font-size:15px;font-weight:600}
.hh span{font-size:12px;color:var(--tx3)}
.rows{display:flex;flex-direction:column;gap:13px}
.r{display:grid;grid-template-columns:76px minmax(0,1fr);gap:12px;align-items:center}
.r>span{font-family:${SANS};font-size:12px;color:var(--tx3)}
.r>div{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.r .chip{padding:0 9px}
.r .tg{gap:8px;margin-right:10px}
.r .field{width:280px}
.r .bk{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0}
.r .blocks{grid-template-columns:repeat(24,minmax(0,1fr))}
.r .blocks i{height:12px}
.tab{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 10px;${D};font-size:13.5px;letter-spacing:.08em;color:var(--tx2);clip-path:var(--clip2)}
.tab .tn{width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;background:var(--raise);color:var(--tx2);clip-path:var(--notch)}
.tab.on{background:var(--raise);color:var(--tx)}
.tab.on .tn{background:var(--warn);color:var(--pane)}
.zm{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:auto}
.zb{position:relative;height:156px;overflow:hidden;background:var(--pane);box-shadow:inset 0 0 0 1px var(--line)}
.zb .in{position:absolute;transform:scale(4);transform-origin:0 0}
.zb .cap{position:absolute;right:8px;bottom:6px;font-family:${SANS};font-size:11px;color:var(--tx3);background:var(--pane);padding:0 4px}
.zb .in{left:10px;top:10px}
.r .mod{flex:1;padding:10px 14px 12px}
.r .mod .ml{margin-bottom:6px}
.r .mod p.t{font-size:12.5px;color:var(--tx2)}
`;

function parts() {
  const rows = [
    ['按钮', `<button type="button" class="btn pri">${px('play')}START</button><button type="button" class="btn">CANCEL</button><button type="button" class="btn ghost">LATER</button><button type="button" class="btn warn">STOP</button><button type="button" class="btn danger">${px('undo')}UNDO</button>`],
    ['分段', `<div class="seg"><button type="button" class="on">CLI</button><button type="button">API</button></div><div class="seg ink"><button type="button">READ</button><button type="button">ASK</button><button type="button" class="on">EDIT</button></div>`],
    ['标签', '<em class="tag rec">PICK</em><em class="tag new">NEW</em><em class="tag del">DEL</em><em class="tag hi">HIGH</em><em class="tag mid">MED</em><em class="tag lo">LOW</em>'],
    ['选项片', '<span class="chip"><i class="dot muse"></i>MUSE</span><span class="chip on"><i class="dot muse"></i>MUSE→<i class="dot grok"></i>GROK</span><span class="chip"><i class="dot api"></i>API</span>'],
    ['开关、选择', `<label class="tg"><span class="tgt"><i></i></span></label><label class="tg"><span class="tgt off"><i></i></span></label><i class="cb on">${px('check')}</i><i class="cb">${px('check')}</i><i class="rb on"></i><i class="rb"></i>`],
    ['输入框', '<div class="field"><span class="pr">›</span>给任务起个名字<i class="caret"></i></div>'],
    ['进度', `<div class="bk">${blocks(24, 15)}<div class="meter">${Array.from({ length: 20 }, (_, i) => `<i class="${i < 7 ? 'f' : ''}"></i>`).join('')}</div></div>`],
    ['模块', '<div class="mod run"><p class="ml"><span class="l">NOW</span><span class="r">每级 3 像素</span></p><p class="t">在跑的模块描青边；等你的描琥珀边</p></div>'],
    ['页签', `<button type="button" class="tab on"><i class="tn">1</i>VERSION</button><button type="button" class="tab"><i class="tn">2</i>SCOPE</button><button type="button" class="tab">${px('check')}REVIEW</button>`],
  ];
  return `<div class="rows">${rows.map(([k, v]) => `<div class="r"><span>${k}</span><div>${v}</div></div>`).join('')}</div>
    <div class="zm">
      <div class="zb z1" data-nolint><div class="in"><div class="seg"><button type="button" class="on">CLI</button><button type="button">API</button></div></div><span class="cap">分段 · 放大 4 倍</span></div>
      <div class="zb z2" data-nolint><div class="in"><em class="tag rec">PICK</em></div><span class="cap">标签 · 放大 4 倍</span></div>
    </div>`;
}

function body() {
  return `<div class="pk pt dots {{lt}}">
  <div class="top"><h1>零件 · 像素角</h1><p>模块和按钮切两级台阶，标签、开关的钮切一级。分段里选中的那块、PICK 标签这些青色小块也一样。</p></div>
  <div class="g2">
    <section class="half dk dots"><p class="hh"><b>深色</b><span>青 #00E5FF，强光</span></p>${parts()}</section>
    <section class="half {{lt}} dots"><p class="hh"><b>浅色</b><span>{{lcName}}（Tweaks 里能换）</span></p>${parts()}</section>
  </div>
</div>`;
}

export function boards() {
  const logic = `renderVals() {
    const k = (this.props.lc ?? 'L2').slice(1, 2);
    const names = { 1: 'L1 柔青', 2: 'L2 深青', 3: 'L3 墨底青光' };
    return { lt: 'lt c' + k, lcName: names[k] };
  }`;
  const html = board({ title: '零件 · 像素角', css: CSS, body: body(), props: { ...PROPS.lc }, logic });
  return [{ file: 'S1c-Parts.dc.html', x: 1360, y: 920, title: '零件 · 像素角（左深右浅）', html }];
}
