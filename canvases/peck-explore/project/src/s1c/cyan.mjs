// 第 1 步 · 第三轮 · 浅色里的青：站主说深色里的青很好看，浅色里纯青当荧光笔底有点违和、突兀。
// 深色不动；浅色给三种：L1 柔青（还是浅青底墨字，但不刺眼）、L2 深青（推荐：深一点的青，白字）、L3 墨底青光（青色只在墨色小块里亮）。
import { board, DOTS, SANS, px, blocks, dotCheck } from './kit.mjs';

const D = `font-family:${DOTS};font-weight:900`;
const CSS = `
.pk.cy{width:1280px;height:800px;padding:24px 32px 26px;display:flex;flex-direction:column;gap:14px;font-family:${SANS}}
.top{display:flex;align-items:baseline;gap:16px}
.top h1{font-size:20px;font-weight:600}
.top p{font-size:13px;color:var(--tx2)}
.g4{flex:1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;min-height:0}
.cc{display:flex;flex-direction:column;gap:9px;min-height:0;padding:14px;color:var(--tx);background:var(--bg)}
.cc.dk{background-color:var(--bg)}
.ch{display:flex;align-items:center;gap:10px;white-space:nowrap}
.ch .k{${D};font-size:20px;color:var(--cy-tx);text-shadow:var(--dglow)}
.ch b{font-size:15px;font-weight:600}
.ch .tag{margin-left:auto}
.cd{font-size:12px;line-height:1.5;color:var(--tx2);min-height:36px}
.pn{display:flex;flex-direction:column;gap:10px}
.pn .seg{align-self:flex-start}
.ro{display:flex;align-items:flex-end;justify-content:space-between}
.rl{display:inline-block;${D};font-size:14px;letter-spacing:.14em;line-height:1.2;color:var(--cy-tx);text-shadow:var(--tglow)}
.lt .rl{background:var(--cy-fill);color:var(--on-cy);text-shadow:var(--on-glow);padding:2px 6px 1px;clip-path:var(--notch)}
.rv{${D};font-size:40px;line-height:.9;color:var(--cy-tx);text-shadow:var(--tglow)}
.pn .blocks{grid-template-columns:repeat(20,minmax(0,1fr))}
.pn .blocks i{height:12px}
.srow{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:10px;align-items:center}
.srow .nd{width:16px;height:16px;display:flex;align-items:center;justify-content:center}
.srow .nd i{width:10px;height:10px;background:var(--cy-blk);box-shadow:var(--glow)}
.lt .srow .nd i{box-shadow:inset 0 0 0 1px var(--blk-ol)}
.srow b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.srow .tm{${D};font-size:14px;color:var(--cy-tx);text-shadow:var(--dglow)}
.cin{display:flex;align-items:center;font-size:13px;color:var(--tx3)}
.cin .pr{font-family:var(--f-code);color:var(--cy-tx);margin-right:8px}
.opt{display:grid;grid-template-columns:16px minmax(0,1fr);gap:10px;align-items:center;padding:7px 8px;clip-path:var(--clip2);background:var(--cy-soft)}
.opt b{display:flex;align-items:center;gap:8px}
.br{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.br .chip{padding:0 8px;font-size:12.5px;letter-spacing:.04em;gap:5px}
.sw{margin-top:auto;display:flex;flex-direction:column;gap:5px;padding-top:10px;border-top:1px dotted var(--line2)}
.sw li{display:grid;grid-template-columns:18px 60px minmax(0,1fr);gap:8px;align-items:center;font-size:11.5px;color:var(--tx2)}
.sw .c{width:18px;height:18px;clip-path:var(--notch);box-shadow:inset 0 0 0 1px rgba(128,128,128,.35)}
.sw code{font-family:var(--f-code);font-size:11px;color:var(--tx)}
.dn{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center}
.dn b{display:block}
.dn .s{display:block;font-size:12px;color:var(--tx2)}
.lk{font-size:12.5px;color:var(--cy-tx);text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}
.pn2 .bt{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.pn2 .bt .lbl{margin:0}
.pn2 .bt b{${D};font-size:14px}
.lt .cc.rec{box-shadow:inset 0 0 0 2px var(--cy-ol)}
.dk.cc{box-shadow:inset 0 0 0 1px var(--line2)}
`;

const COLS = [
  ['dk', 'D', '深色 · 不动', '深色里纯青 #00E5FF 很好看：字、线、进度都用它，带强光。', [['#00E5FF', '#00E5FF', '填色、字、进度都用它'], ['#02101A', '#02101A', '青上面的墨字 12.5:1']]],
  ['lt c1', 'L1', '柔青', '还是浅青底配墨字，但把纯青换成淡一点的青，再描一圈深青边；最接近第二轮。', [['#A6ECF7', '#A6ECF7', '填色，墨字 14:1'], ['#00758C', '#00758C', '青色的字 4.9:1'], ['#4DD3E8', '#4DD3E8', '进度块，描 #0089A6 边']]],
  ['lt c2', 'L2', '深青', '浅色里青色往深走一档，和墨色、冷白放在一起不抢；按钮白字，进度块亮一档。', [['#007A94', '#007A94', '填色白字 5.0:1，当字 4.5:1'], ['#0099B8', '#0099B8', '进度块、光标 3.1:1'], ['#E2F4F8', '#E2F4F8', '选中的那行']]],
  ['lt c3', 'L3', '墨底青光', '青色只在墨色小块里亮，像嵌在白纸上的一块块小屏；最像深色，也最重。', [['#0B1030', '#0B1030', '填色，青字 12:1'], ['#00D8F0', '#00D8F0', '进度块，描墨边'], ['#00758C', '#00758C', '青色的字 4.9:1']]],
];

function panel() {
  return `<div class="mod pn">
    <div class="seg"><button type="button" class="on">CLI</button><button type="button">API</button></div>
    <div class="ro"><span class="rl">RUNNING</span><span class="rv">02:14</span></div>
    ${blocks(20, 12)}
    <div class="srow"><span class="nd"><i></i></span><b class="nm">Grok 跑 pnpm check</b><span class="tm">02:14</span></div>
    <p class="cin"><span class="pr">›</span>下一句话…<i class="caret"></i></p>
    <div class="opt"><i class="rb on"></i><b class="nm">一起升<em class="tag rec">PICK</em></b></div>
    <div class="br"><button type="button" class="btn pri">SEND${px('send')}</button><span class="chip on"><i class="dot muse"></i>MUSE→<i class="dot grok"></i>GROK</span></div>
    <label class="tg"><span class="tgt"><i></i></span>完成后通知我</label>
  </div>
  <div class="mod pn pn2">
    <div class="dn">${dotCheck()}<div><b class="nm">任务完成</b><span class="s">4 个文件 · 留在项目里</span></div><span class="lk">看改动 →</span></div>
    <div class="field"><span class="pr">›</span>给任务起个名字<i class="caret"></i></div>
    <div><p class="bt"><span class="lbl">API SPEND</span><b>$3.20</b></p><div class="meter">${Array.from({ length: 20 }, (_, i) => `<i class="${i < 6 ? 'f' : ''}"></i>`).join('')}</div></div>
  </div>`;
}

function body() {
  const cols = COLS.map(([cls, k, nm, d, sw], i) => `<section class="cc ${cls}${i === 2 ? ' rec' : ''}${i === 0 ? ' dots' : ''}">
    <p class="ch"><span class="k">${k}</span><b>${nm}</b>${i === 2 ? '<em class="tag rec">PICK</em>' : ''}</p>
    <p class="cd">${d}</p>
    ${panel()}
    <ul class="sw">${sw.map(([c, hex, t]) => `<li><i class="c" style="background:${c}"></i><code>${hex}</code><span>${t}</span></li>`).join('')}</ul>
  </section>`).join('');
  return `<div class="pk cy dots lt">
  <div class="top"><h1>浅色里的青</h1><p>第二轮浅色用的是纯青当荧光笔底、描墨边，你说有点突兀。深色不动，浅色换三种，中间是我推荐的。</p></div>
  <div class="g4">${cols}</div>
</div>`;
}

export function boards() {
  const html = board({ title: '浅色里的青', css: CSS, body: body(), props: {}, logic: 'renderVals() { return {}; }' });
  return [{ file: 'S1c-Cyan.dc.html', x: 0, y: 920, title: '浅色里的青 · L1–L3', html }];
}
