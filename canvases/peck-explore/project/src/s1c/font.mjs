// 第 1 步 · 第三轮 · 界面字体：点阵字 Doto 已定（数字、标签、按钮）。剩下三种字——名字、说明、代码——摆三种做法，中间是推荐。
import { board, PROPS, DOTS, SANS, MONO, PIX, DEP, px, FLIP } from './kit.mjs';

const D = `font-family:${DOTS};font-weight:900`;
const CSS = `
.pk.fb{width:1280px;height:800px;padding:24px 32px 26px;display:flex;flex-direction:column;gap:14px}
.top{display:flex;align-items:baseline;gap:16px;font-family:${SANS}}
.top h1{font-size:20px;font-weight:600}
.top p{font-size:13px;color:var(--tx2)}
.cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.fc{display:flex;flex-direction:column;gap:6px;padding:12px 16px 14px;font-family:${SANS}}
.fh{display:flex;align-items:baseline;gap:8px;white-space:nowrap}
.fh b{font-size:14px;font-weight:600}
.fh span{font-size:11.5px;color:var(--tx3);overflow:hidden;text-overflow:ellipsis}
.fh .tag{margin-left:auto}
.s1{font-size:24px;line-height:30px;white-space:nowrap;overflow:hidden}
.s2{font-size:12px;line-height:18px;color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fn{font-size:11.5px;line-height:1.5;color:var(--tx3);margin-top:2px}
.f-pix .s1,.f-pix .s2{font-family:${PIX}}
.f-dep .s1{font-family:${DEP};font-size:22px}
.f-dep .s2{font-family:${DEP};font-size:11px}
.f-sans .s1{font-family:${SANS};font-size:22px;font-weight:600}
.f-sans .s2{font-family:${SANS};font-size:12.5px}
.f-dots .s1{${D};font-size:24px;letter-spacing:.06em;color:var(--cy-tx);text-shadow:var(--tglow)}
.f-dots .s2{${D};font-size:14px;letter-spacing:.08em}
.opts3{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;min-height:0}
.oc{display:flex;flex-direction:column;gap:8px;min-height:0}
.oh{display:flex;align-items:center;gap:10px;font-family:${SANS};white-space:nowrap}
.oh .k{${D};font-size:20px;color:var(--cy-tx);text-shadow:var(--dglow)}
.oh b{font-size:15px;font-weight:600}
.oh .tag{margin-left:auto}
.od{font-family:${SANS};font-size:12px;line-height:1.5;color:var(--tx2);min-height:36px;margin-top:-2px}
.sp{flex:1;display:flex;flex-direction:column;gap:7px;min-height:0;overflow:hidden}
.sp .ml{margin-bottom:0}
.sp .clk{${D};font-size:22px;line-height:1;color:var(--cy-tx);text-shadow:var(--tglow)}
.ttl{font-family:var(--f-title);font-weight:var(--fw-title);font-size:var(--fs-title);line-height:1.35;text-shadow:var(--hglow)}
.st2{display:flex;flex-direction:column;gap:6px}
.st2 li{display:grid;grid-template-columns:16px minmax(0,1fr);gap:10px}
.st2 .ic{height:20px;display:flex;align-items:center;justify-content:center;color:var(--ok)}
.st2 .ic i{width:10px;height:10px;background:var(--cy-blk);box-shadow:var(--glow)}
.lt .st2 .ic i{box-shadow:inset 0 0 0 1px var(--blk-ol)}
.sl{display:flex;align-items:baseline;gap:10px;line-height:20px}
.sl b{white-space:nowrap}
.sl .lead{flex:1;border-bottom:1px dotted var(--line2);transform:translateY(-4px)}
.sl .tm{${D};font-size:14px;color:var(--tx3)}
.run .sl .tm{color:var(--cy-tx);text-shadow:var(--dglow)}
.sx{font-size:var(--fs-body);color:var(--tx3)}
.out{margin-top:4px;padding-left:10px;font-family:var(--f-code);font-size:var(--fs-code);line-height:18px;color:var(--tx2);white-space:nowrap;overflow:hidden;background:linear-gradient(var(--cy-blk) 50%,transparent 0) 0 0/2px 4px repeat-y}
.out div{overflow:hidden;text-overflow:ellipsis}
.out .o3{color:var(--tx)}
.askm{padding-top:9px;border-top:1px dotted var(--line2);display:flex;flex-direction:column;gap:3px}
.q{font-family:var(--f-title);font-weight:var(--fw-title);font-size:var(--fs-title);line-height:1.35;margin-bottom:4px}
.opt{display:grid;grid-template-columns:16px minmax(0,1fr);gap:10px;padding:5px 8px;clip-path:var(--clip2)}
.opt.on{background:var(--cy-soft)}
.opt .rb{margin-top:2px}
.opt b{display:flex;align-items:center;gap:8px}
.opt .d{display:block;font-size:var(--fs-body);color:var(--tx2)}
.brow{display:flex;align-items:center;gap:8px;margin-top:auto}
.brow .fp{margin-left:auto;font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx3);white-space:nowrap}
.leg{display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 12px;font-family:${SANS};font-size:11.5px;color:var(--tx3)}
.leg b{font-weight:500;color:var(--tx2)}
.oc.rec .mod{--mline:var(--cy-line)}
`;

const CARDS = [
  ['f-pix', '缝合像素 12', 'Fusion Pixel · 中文像素字', '合成一个面板 Ab12', '12 格一个字，中文、English、0123 都有', '只用 12、18、24 号才清楚。开源（OFL），能打包进 App。'],
  ['f-dep', 'Departure Mono', '像素等宽', 'pnpm check', 'SettingsSheet.tsx:41  +74 −21', '11 格，只用 11、22 号。只有英文和符号，中文落到缝合像素。开源（OFL）。'],
  ['f-sans', 'IBM Plex Sans + 苹方', '光滑字', '合成一个面板 Ab12', '第二轮一直在用的字，读长段不累', '苹方是 Mac 自带的中文字；Plex 问卷里定过。'],
  ['f-dots', 'Doto', '点阵字 · 已定', 'RUNNING 02:14', 'SEND · PICK · UNDO TASK', '数字、标签、按钮（第二轮定的）。只有英文和数字。'],
];

const OPTS = [
  ['ff1', 'F1', '光滑', '名字、说明、代码都用光滑字；像素味只靠点阵字、图形和角。', [['名字', 'Plex Sans 粗 · 13.5'], ['说明', 'Plex Sans · 12.5'], ['代码', 'Plex Mono · 12']]],
  ['ff2', 'F2', '像素名字', '任务名、步骤名、问题、选项这些「名字」用像素字；说明留光滑字，长段好读；代码用 Departure Mono。', [['名字', '缝合像素 · 12，标题 18'], ['说明', 'Plex Sans + 苹方 · 12.5'], ['代码', 'Departure Mono · 11']]],
  ['ff3', 'F3', '全像素', '说明也换成像素字，整屏最统一；代价是长段文字读着累一点。', [['名字', '缝合像素 · 12，标题 18'], ['说明', '缝合像素 · 12'], ['代码', 'Departure Mono · 11']]],
];

function specimen() {
  return `<div class="mod sp run"><p class="ml"><span class="l">NOW</span><span class="r"><span class="clk">02:14</span></span></p>
    <h2 class="ttl">把设置里三个对话框合成一个面板</h2>
    <ol class="st2">
      <li><span class="ic">${px('check')}</span><div><p class="sl"><b class="nm">Muse 写规范</b><i class="lead"></i><span class="tm">48s</span></p><p class="sx">读了 12 个文件，列出 6 条要改的</p></div></li>
      <li class="run"><span class="ic"><i></i></span><div><p class="sl"><b class="nm">Grok 跑 pnpm check</b><i class="lead"></i><span class="tm">02:14</span></p>
        <div class="out"><div>SettingsSheet.tsx:41  providers 的类型不对</div><div class="o3">→ 改 SettingsProps，再跑一遍</div></div></div></li>
    </ol>
    <div class="askm"><p class="q">Tailwind 要不要一起升到 4.1？</p>
      <div class="opt on"><i class="rb"></i><div><b class="nm">一起升<em class="tag rec">PICK</em></b><span class="d">顺手改 6 个文件的类名，多跑约 2 分钟</span></div></div>
      <div class="opt"><i class="rb"></i><div><b class="nm">先不升</b><span class="d">这次只合并对话框，升级另开任务</span></div></div>
    </div>
    <div class="brow"><button type="button" class="btn pri">SEND${px('send')}</button><button type="button" class="btn">CANCEL</button><span class="fp">+86 −132 · 4 files</span></div>
  </div>`;
}

function body() {
  const cards = CARDS.map(([cls, nm, sub, s1, s2, note]) => `<div class="mod fc ${cls}"><p class="fh"><b>${nm}</b><span>${sub}</span></p><p class="s1">${s1}</p><p class="s2">${s2}</p><p class="fn">${note}</p></div>`).join('');
  const opts = OPTS.map(([cls, k, nm, d, leg], i) => `<section class="oc ${cls}${i === 1 ? ' rec' : ''}">
    <p class="oh"><span class="k">${k}</span><b>${nm}</b>${i === 1 ? '<em class="tag rec">PICK</em>' : ''}</p>
    <p class="od">${d}</p>
    ${specimen()}
    <div class="leg">${leg.map(([a, b]) => `<b>${a}</b><span>${b}</span>`).join('')}</div>
  </section>`).join('');
  return `<div class="{{root}}">
  <div class="top"><h1>界面字体</h1><p>点阵字 Doto 已经管数字、标签、按钮。剩下三种字：名字、说明、代码。三格摆同一段界面，中间是我推荐的。</p></div>
  <div class="cards">${cards}</div>
  <div class="opts3">${opts}</div>
</div>`;
}

export function boards() {
  const def = FLIP ? '浅色' : '深色';
  const logic = `renderVals() {
    const dark = (this.props.theme ?? '${def}') === '深色';
    const lc = 'c' + ((this.props.lc ?? 'L2').slice(1, 2));
    return { root: 'pk fb dots ' + (dark ? 'dk' : 'lt') + ' ' + lc };
  }`;
  const html = board({ title: '界面字体', css: CSS, body: body(), props: { ...PROPS.theme(def), ...PROPS.lc }, logic });
  return [{ file: 'S1c-Font.dc.html', x: 2720, y: 0, title: '界面字体 · F1–F3', html }];
}
