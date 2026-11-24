// 第 1 步 · 配色：青色 #00E5FF 不变，换底色和配合色。四套，上排浅色、下排深色，每格摆同一小段界面。
import { board, SANS, MONO } from './common.mjs';

// g: 底 栏 卡 抬起 线；t: 正文 次要；s: Muse Grok API 成 等 险
const P = [
  {
    id: 'P1', name: '冰川', kw: '冷蓝灰的底，配色干净常规',
    lt: { g: ['#F2F6F8', '#F8FBFC', '#FFFFFF', '#E7EEF2', '#DAE3E8'], t: ['#0B1820', '#4D606B'], s: ['#7A5CF0', '#B87400', '#2470D0', '#0E9F68', '#B87400', '#DC3046'] },
    dk: { g: ['#060B0F', '#0A1117', '#0F181F', '#16222B', '#1C2A34'], t: ['#E5F0F5', '#8BA2AE'], s: ['#A48BFF', '#FFB547', '#4DA8FF', '#34D399', '#FFB547', '#FF5C6C'] },
  },
  {
    id: 'P2', name: '纯墨', kw: '纯黑白灰，配合色压低饱和，青色最跳',
    lt: { g: ['#F4F4F4', '#FAFAFA', '#FFFFFF', '#EAEAEA', '#DEDEDE'], t: ['#0A0A0A', '#5A5A5A'], s: ['#6D5FA8', '#8F6B2A', '#3D6690', '#2F8A5E', '#8F6B2A', '#B03A3A'] },
    dk: { g: ['#000000', '#090909', '#111111', '#1B1B1B', '#232323'], t: ['#F5F5F5', '#959595'], s: ['#B3A6DB', '#D9B97C', '#91B4D9', '#82D2AA', '#D9B97C', '#E58D8D'] },
  },
  {
    id: 'P3', name: '深海', kw: '藏蓝的底，层次最多，配一点电紫',
    lt: { g: ['#F2F4FC', '#F8F9FE', '#FFFFFF', '#E7EBF8', '#DAE0F0'], t: ['#0B1030', '#4E567A'], s: ['#6D4AE8', '#B86A00', '#2563EB', '#15985A', '#B86A00', '#E11D48'] },
    dk: { g: ['#050816', '#0A0F24', '#0F1630', '#172040', '#1E2850'], t: ['#E8ECFF', '#9099C4'], s: ['#A78BFA', '#FFB86B', '#60A5FA', '#4ADE80', '#FFB86B', '#FB7185'] },
  },
  {
    id: 'P4', name: '薄荷苏打', kw: '带一点薄荷绿的底，配柠檬、青柠、粉',
    lt: { g: ['#F0F8F5', '#F7FCFA', '#FFFFFF', '#E3F1EC', '#D3E6DF'], t: ['#081A15', '#486058'], s: ['#C92C86', '#946F00', '#2470C8', '#3A8C00', '#946F00', '#D63031'] },
    dk: { g: ['#03100C', '#071813', '#0B1F19', '#122B24', '#18352D'], t: ['#E2F5EF', '#85A89E'], s: ['#FF7AC6', '#FFD24D', '#7CC4FF', '#B4F25A', '#FFD24D', '#FF6B6B'] },
  },
];

const vars = (m, dark) => [
  `--pg:${m.g[0]}`, `--pn:${m.g[1]}`, `--cd:${m.g[2]}`, `--rs:${m.g[3]}`, `--ln:${m.g[4]}`,
  `--tx:${m.t[0]}`, `--tx2:${m.t[1]}`,
  `--muse:${m.s[0]}`, `--grok:${m.s[1]}`, `--api:${m.s[2]}`, `--ok:${m.s[3]}`, `--warn:${m.s[4]}`, `--bad:${m.s[5]}`,
  `--ring:${dark ? 'rgba(0,229,255,.45)' : m.t[0]}`, `--glow:${dark ? '0 0 10px rgba(0,229,255,.6)' : 'none'}`,
].join(';');

const CSS = `
.cb{width:1280px;height:800px;box-sizing:border-box;padding:30px 36px 34px;background:#0E1114;color:#E8EEF1;font-family:${SANS};font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums;display:flex;flex-direction:column;gap:18px}
.cb *{box-sizing:border-box}.cb p{margin:0}.cb i,.cb em{font-style:normal}
.cb button{font:inherit;border:0;cursor:pointer}
.top{display:flex;align-items:baseline;gap:16px}
.top h1{margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em}
.top p{color:#8A979E;font-size:13px}
.top .cy{margin-left:auto;display:flex;align-items:center;gap:8px;font-family:${MONO};font-size:12px;color:#C9D3D8}
.top .cy i{width:18px;height:18px;border-radius:4px;background:#00E5FF;box-shadow:0 0 12px rgba(0,229,255,.6)}
.heads{display:grid;grid-template-columns:28px repeat(4,minmax(0,1fr));gap:14px}
.heads p{font-size:13px;color:#8A979E}
.heads b{font-family:${MONO};color:#E8EEF1;font-weight:600;margin-right:8px}
.heads b + span{color:#E8EEF1;font-weight:600;margin-right:8px}
.rows{flex:1;display:grid;grid-template-rows:repeat(2,minmax(0,1fr));gap:14px;min-height:0}
.r{display:grid;grid-template-columns:28px repeat(4,minmax(0,1fr));gap:14px;min-height:0}
.r .mode{writing-mode:vertical-rl;font-size:12px;color:#8A979E;letter-spacing:.3em;align-self:center;justify-self:center}
.cell{position:relative;border-radius:12px;background:var(--pg);color:var(--tx);padding:14px;display:flex;flex-direction:column;gap:10px;overflow:hidden;min-height:0;box-shadow:0 0 0 1px rgba(255,255,255,.06)}
.pane{background:var(--pn);border:1px solid var(--ln);border-radius:9px;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.task{display:flex;align-items:center;gap:8px;min-width:0}
.task b{font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
.run{width:9px;height:9px;border-radius:50%;background:#00E5FF;box-shadow:0 0 0 1.5px var(--ring),var(--glow);flex:none}
.who{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--tx2);white-space:nowrap}
.dot{width:7px;height:7px;border-radius:50%;display:inline-block}
.card{background:var(--cd);border:1px solid var(--ln);border-radius:7px;padding:8px 10px;display:flex;flex-direction:column;gap:5px}
.st{display:flex;align-items:center;gap:7px;font-size:12px;white-space:nowrap}
.st .k{width:7px;height:7px;border-radius:2px;flex:none}
.st .t{flex:1;overflow:hidden;text-overflow:ellipsis}
.st .tm{font-family:${MONO};font-size:11px;color:var(--tx2)}
.hl{background:#00E5FF;color:#00181C;padding:0 5px;border-radius:3px;font-weight:600}
.nums{display:flex;align-items:center;gap:6px;font-family:${MONO};font-size:12px}
.tag{font-family:${SANS};font-size:10.5px;padding:0 5px;border-radius:3px;line-height:17px}
.ask{display:flex;align-items:center;gap:7px;font-size:12px;border:1px solid var(--warn);border-radius:7px;padding:5px 9px;color:var(--tx)}
.ask em{color:var(--warn);font-weight:600}
.btns{display:flex;gap:6px}
.btn{height:28px;padding:0 12px;border-radius:6px;font-size:12px;font-weight:500;background:var(--rs);color:var(--tx)}
.btn.pri{background:#00E5FF;color:#00181C;font-weight:600;box-shadow:var(--glow)}
.sw{margin-top:auto;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
.sw i{height:20px;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(128,128,128,.25)}
.sw2{display:flex;gap:5px;align-items:center}
.sw2 i{width:14px;height:14px;border-radius:50%}
.sw2 span{margin-left:auto;font-family:${MONO};font-size:10.5px;color:var(--tx2)}
`;

function cell(p, mode) {
  const m = p[mode];
  const dark = mode === 'dk';
  return `<div class="cell" style="${vars(m, dark)}">
  <div class="pane">
    <div class="task"><i class="run"></i><b>把设置合成一个面板</b><span class="who"><i class="dot" style="background:var(--muse)"></i>Muse →<i class="dot" style="background:var(--grok)"></i>Grok</span></div>
    <div class="card">
      <p class="st"><i class="k" style="background:var(--ok)"></i><span class="t">Muse 写规范</span><span class="tm">48s</span></p>
      <p class="st"><i class="k" style="background:#00E5FF;box-shadow:0 0 0 1px var(--ring)"></i><span class="t"><span class="hl">Grok 跑 pnpm check</span></span><span class="tm">2:14</span></p>
      <p class="st"><i class="k" style="box-shadow:inset 0 0 0 1px var(--tx2)"></i><span class="t" style="color:var(--tx2)">验证并总结</span></p>
    </div>
    <p class="nums"><span>4 个文件</span><span style="color:var(--ok)">+86</span><span style="color:var(--bad)">−132</span><em class="tag" style="background:color-mix(in srgb,var(--ok) 16%,transparent);color:var(--ok)">新</em><em class="tag" style="background:color-mix(in srgb,var(--bad) 16%,transparent);color:var(--bad)">删</em><em class="tag" style="background:color-mix(in srgb,var(--api) 16%,transparent);color:var(--api)">API</em></p>
  </div>
  <p class="ask"><em>ASK</em>Grok 想问你一件事</p>
  <div class="btns"><button type="button" class="btn pri">开始任务</button><button type="button" class="btn">取消</button><button type="button" class="btn" style="background:transparent;color:var(--bad);box-shadow:inset 0 0 0 1px var(--bad)">撤销</button></div>
  <div class="sw">${m.g.map((c) => `<i style="background:${c}"></i>`).join('')}</div>
  <div class="sw2">${m.s.map((c) => `<i style="background:${c}"></i>`).join('')}<span>${m.g[0]}</span></div>
</div>`;
}

export function boards() {
  const body = `<div class="cb">
  <div class="top"><h1>配色</h1><p>青色不变，换底色和配合色；每格同一小段界面，下面两排是底色的五层和六种配合色（Muse、Grok、API、成、等、险）</p><span class="cy"><i></i>#00E5FF</span></div>
  <div class="heads"><span></span>${P.map((p) => `<p><b>${p.id}</b><span>${p.name}</span>${p.kw}</p>`).join('')}</div>
  <div class="rows">
    <div class="r"><span class="mode">浅色</span>${P.map((p) => cell(p, 'lt')).join('')}</div>
    <div class="r"><span class="mode">深色</span>${P.map((p) => cell(p, 'dk')).join('')}</div>
  </div>
</div>`;
  const html = board({ title: '配色 · 四套', css: CSS, body, logic: 'renderVals() { return {}; }' });
  return [{ file: 'S1-Color.dc.html', x: 0, y: 920, title: '配色 · P1–P4（上浅下深）', html }];
}
