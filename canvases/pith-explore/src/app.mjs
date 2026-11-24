// R1 能点的 App 板：颜色、图形、动效都从 schemes/pith 来（scheme.mjs、marks.mjs），这里只管屏幕和状态。原注：EX11 能点的 App 板：从 EX10 复制。这一轮（站主 11-24）：Logo 只用蕨芽，打开时、悬停时从底下长出来、结果；顶栏三个图标悬停各自长出来；
// 交付卡存下以后「已种下」前面是「存进知识库」的 Agent 图标，种子落进知识库以后演一遍（埋进土里、长出小枝丫）。EX10 的说明：
//   一、图形语言定为「铅字 × 数字花园」（type.mjs），Logo 三个候选在 Tweaks 里换；二、珊瑚色点缀（芽、种子、+1、当前那一条的节点、悬停抵达的点）；
//   三、悬停借 Vermilion 的做法（hover.mjs），所有能悬停的地方都有；四、动效：回答、页边注「舒展」，存卡「生长」（种子按真位置落到知识库图标正中）；
//   五、换配色是几圈湖面波纹 + 一层水面扭曲；六、对话的状态行换成 Agent 行为的动态图标（agents.mjs），在跑的时候输入框里是「在想」。
import { esc, board, screens, cited, stageIcon, palette, toast, C } from './shell.mjs';
import { CSS_ADD, card, ORDER, COVERS } from './a-cards.mjs';
import { FONTS, BASE_CSS } from './base.mjs';
import { logoMark, wordmark, icon, typeIcon, agentIcon } from './marks.mjs';
import { SCHEME_CSS, ALIAS_CSS, PALETTES } from './scheme.mjs';
import { home, drawer, branch, SETN, GARDEN_CSS } from './garden.mjs';

const r1 = (v) => Math.round(v * 10) / 10;

// 设置的枝桠：角色、外观两项能点（选中的那根小枝和节点是强调色，跟着状态走），别的提示「这一轮没画」
const bx = (y) => 56 + 2.6 * Math.sin(y / 64);
function setNav() {
  const svg = branch(10, 430, SETN.map((n) => ({ ...n, on: false })), { lead: 0.1, step: 0.06 })
    .replace(/<path class="tw" pathLength="1" style="--d:([\d.]+)s" d="M([\d.]+) 132/, '<path class="tw {{sn0}}" pathLength="1" style="--d:$1s" d="M$2 132')
    .replace(/<path class="tw" pathLength="1" style="--d:([\d.]+)s" d="M([\d.]+) 432/, '<path class="tw {{sn6}}" pathLength="1" style="--d:$1s" d="M$2 432')
    .replace(/<circle class="" cx="90" cy="92"/, '<circle class="{{sn0}}" cx="90" cy="92"')
    .replace(/<circle class="" cx="90" cy="392"/, '<circle class="{{sn6}}" cx="90" cy="392"');
  const lbl = SETN.map((n, k) => {
    const d = (0.1 + 0.3 + k * 0.06).toFixed(2);
    if (n.kind === 'g') return `<p class="br-g br-h" style="top:${n.y - 12}px;--d:${d}s">${n.t}</p>`;
    const i = k - 1;
    const on = i === 0 ? '{{sRole}}' : i === 6 ? '{{sLook}}' : '';
    const act = i === 0 ? 'tabRole' : i === 6 ? 'tabLook' : `pgOther${i - 1}`;
    return `<button type="button" class="br-st pith-row ${on}" onClick="{{${act}}}" style="top:${n.y - 11}px;--d:${d}s">${esc(n.t)}</button>`;
  }).join('');
  return `<nav class="a-sbr" aria-label="设置"><svg class="br-svg" viewBox="0 0 300 560" aria-hidden="true">${svg}</svg>${lbl}</nav>`;
}

// 外观页的色板：一小块那套配色的样子（叶子、问候、输入框、一个按钮）
const leafMini = '<svg class="lv" viewBox="0 0 200 60" aria-hidden="true"><path d="M6 32Q14 30 22 30L190 30" class="m"/><path d="M22 30C60 6 140 4 196 30C140 56 60 54 22 30Z" class="o"/><path d="M40 30Q48 18 62 14M40 30Q48 42 62 46M70 30Q78 16 94 11M70 30Q78 44 94 49M100 30Q108 17 124 12M100 30Q108 43 124 48M130 30Q138 20 152 16M130 30Q138 40 152 44M158 30Q164 24 174 22M158 30Q164 36 174 38" class="v"/></svg>';
const palCard = (n, name, line) => `<button type="button" class="pal-card pith-lift {{pc${n}}}" onClick="{{toPal${n}}}" aria-label="换成${name}"><span class="pv" data-palette="${PALETTES[n - 1].id}" data-theme="{{theme}}">${leafMini}<b>今天想弄清什么？</b><i class="in">问 Pith……<em>→</em></i><i class="bt">存进知识库</i></span><span class="nm"><b>${name}</b><span>${line}</span><i class="ck"></i></span></button>`;
const look = `<section class="a-look"><p class="k">外观</p><h2>配色</h2><p class="line">两套，随时换；换的时候颜色像墨一样慢慢洇过去。</p>
<div class="pals">${palCard(1, '纸与海', '默认 · 暖白的纸、海蓝和品红')}${palCard(2, '雾与赭', '冷雾灰的纸、赭石和靛蓝')}</div>
<h3>明暗</h3><div class="seg"><button type="button" class="{{lk0}}" onClick="{{look0}}">跟随系统</button><button type="button" class="{{lk1}}" onClick="{{look1}}">亮</button><button type="button" class="{{lk2}}" onClick="{{look2}}">暗</button></div>
<p class="note">也可以在对话里说「换成雾与赭」「晚上用暗色」，或者 ⌘K 里打「配色」。</p></section>`;
const CSS = `
/* ---- 顶栏：左边 Logo，中间三个图标 ---- */
.a-top{padding:0 24px 0 92px;border-bottom-color:transparent;transition:border-color .4s}
.on-kb .a-top,.on-lib .a-top,.on-set .a-top{border-bottom-color:var(--line)}
.a-brand{gap:10px}
.a-brand .mark{width:28px;height:28px}
.mk-3 .a-brand{gap:8px}
.a-icons{position:absolute;left:50%;top:0;height:68px;transform:translateX(-50%);display:flex;align-items:center;gap:16px}
.a-ic{position:relative;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:var(--muted);transition:color .25s,background .25s}
.a-ic svg{width:23px;height:23px}
.a-ic:hover{color:var(--ink);background:var(--tint)}
.a-ic.is-on{color:var(--ink)}
.a-ic .tip{position:absolute;top:44px;left:50%;padding:3px 8px;border-radius:6px;background:var(--ink);color:var(--bg);font:500 12px/1.4 var(--sans);white-space:nowrap;opacity:0;transform:translate(-50%,-4px);pointer-events:none;transition:opacity .2s,transform .25s var(--out)}
.a-ic:hover .tip{opacity:1;transform:translate(-50%,0);transition-delay:.35s}
.a-ic .lf,.a-ic .bk,.a-ic .kn,.a-ic .pod{transform-box:fill-box;transition:transform .5s var(--spring)}
.a-ic .lf{transform-origin:100% 100%}.a-ic .lf2{transform-origin:0 100%}.a-ic .ik3 .lf{transform-origin:0 100%}
.a-ic:hover .lf1{transform:rotate(-10deg)}.a-ic:hover .lf2{transform:rotate(10deg)}.a-ic:hover .ik3 .lf1{transform:rotate(-6deg)}
.a-ic .bk{transform-origin:0 100%}.a-ic:hover .bk{transform:rotate(9deg)}
.a-ic .ik3 .bk{transform-origin:50% 0}.a-ic:hover .ik3 .bk{transform:translateY(1.4px)}
.a-ic:hover .kn1{transform:translateX(-4px)}.a-ic:hover .kn2{transform:translateX(4px)}
.a-ic .pod{transform-origin:50% 100%}.a-ic:hover .pod{transform:translateY(-1.6px)}
.a-dot{position:absolute;bottom:6px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--sea);opacity:0;transition:left .45s var(--spring),opacity .3s}
.a-dot.at-kb{left:20px;opacity:1}.a-dot.at-lib{left:76px;opacity:1}.a-dot.at-set{left:132px;opacity:1}
.a-badge{left:30px;top:2px;margin:0}
.a-card b{font-weight:300!important;transition:font-weight 2.2s var(--out)}.a-card.is-saved b{font-weight:520!important}
.a-fly.is-saved{animation:a-fly8 1.2s cubic-bezier(.5,0,.3,1) both}
@keyframes a-fly8{0%{opacity:0;transform:translate(760px,660px) scale(.4)}12%{opacity:1;transform:translate(760px,640px) scale(1)}60%{transform:translate(700px,260px) scale(1)}100%{opacity:0;transform:translate(582px,30px) scale(.5)}}
/* 强调色底上的字跟着配色走 */
.dA .a-comp.is-ready .a-send,.dA .a-ref.is-on,.dA .a-sn .h i,.dA .a-q button.go,.dA .a-badge,.dA .a-tr .new,.dA .t-report .vd,.dA .a-panel .acts .go,.dA .a-fly{color:var(--on-sea)}
/* ---- 对话：居中；对话历史叫出来时，整页往右让 60 ---- */
.a-comp{transition:left .6s var(--out),top .6s var(--out),width .6s var(--out),box-shadow .2s,transform .6s var(--out)}
.a-comp.is-home{left:280px;top:420px;width:720px;animation:v1-comp .9s .3s var(--out) backwards}
@keyframes v1-comp{from{opacity:0;transform:translateY(10px) scale(.985)}}
.a-comp.is-thread{left:250px;top:722px;width:640px}
.a-thread{left:250px;width:960px;transition:transform .6s var(--out),opacity .4s}
.a-art{width:640px}
.a-sn{left:672px;width:270px}
.is-side .a-comp,.is-side .v1-hello,.is-side .a-thread{transform:translateX(60px)}
.is-side .a-thread{opacity:.4}
.a-rmain{padding:44px 80px 0 10px}
.a-people{gap:34px}
.a-person i{width:66px;height:66px;font-size:26px}
.a-rp{margin-top:36px;max-width:720px}
.a-rp h2{font-size:52px}
.a-rp dl{grid-template-columns:120px 1fr 120px 1fr}
/* ---- 知识库：更少的控件、更大的字，不写生长阶段的说明 ---- */
.a-gard{left:120px;right:120px;top:100px}
.a-gard .a-count{font-size:15px}
.a-gard .a-h1{font-size:58px}
.a-ktabs{display:flex;align-items:baseline;gap:28px;margin-top:22px;border-bottom:1px solid var(--line)}
.a-ktabs button{position:relative;padding-bottom:12px;font:17px/1 var(--serif);color:var(--faint);transition:color .25s}
.a-ktabs button span{margin-left:6px;font:12px/1 var(--sans);color:var(--faint)}
.a-ktabs button::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--ink);transform:scaleX(0);transition:transform .4s var(--out)}
.a-ktabs button:hover,.a-ktabs button.is-on{color:var(--ink)}
.a-ktabs button.is-on::after{transform:none}
.a-wallbox{margin-top:22px}
.a-drawer{top:68px}
/* ---- 文献库：表格 + 右边的面板 ---- */
.a-lib{left:120px;right:120px;top:100px;transition:right .5s var(--out)}
.is-panel .a-lib{right:480px}
.a-lib .a-h1{font-size:58px}
.a-lib .a-count{font-size:15px}
.a-ltabs{display:flex;align-items:baseline;gap:26px;margin-top:22px;border-bottom:1px solid var(--line);font:16px/1 var(--serif);color:var(--faint)}
.a-ltabs span{padding-bottom:12px}
.a-ltabs .on{color:var(--ink);box-shadow:inset 0 -2px 0 var(--ink)}
.a-ltabs .imp{margin-left:auto;font:700 13px/1 var(--sans);color:var(--sea-t)}
.a-table{border-top:0;margin-top:6px}
.a-th,.a-tr{grid-template-columns:minmax(0,1fr) 200px 56px 84px 96px}
.is-panel .a-th,.is-panel .a-tr{grid-template-columns:minmax(0,1fr) 150px 52px}
.is-panel .a-th>:nth-child(n+4),.is-panel .a-tr>:nth-child(n+4){display:none}
.a-tr{min-height:50px}
.a-tr .ti b{font-size:16.5px}
.a-panel{position:absolute;right:0;top:68px;bottom:0;width:460px;z-index:18;padding:30px 34px;background:var(--white);box-shadow:var(--sh-lg);transform:translateX(105%);visibility:hidden;transition:transform .5s var(--out),visibility 0s .5s;overflow-y:auto;scrollbar-width:none}
.is-panel .a-panel{transform:none;visibility:visible;transition:transform .5s var(--out)}
.a-panel .x{position:absolute;right:18px;top:16px;width:32px;height:32px;border-radius:10px;color:var(--faint);font-size:20px}
.a-panel .x:hover{background:var(--tint);color:var(--ink)}
.a-panel .top{display:grid;grid-template-columns:62px 1fr;column-gap:16px;align-items:end}
.a-panel .cv{height:88px;border-radius:2px 5px 5px 2px;box-shadow:inset 4px 0 0 #00000022,var(--sh-sm)}
.a-panel .k{font:700 11.5px/1 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--crim)}
.a-panel h2{margin-top:8px;font:600 24px/1.25 var(--serif)}
.a-panel .acts{display:flex;gap:8px;margin-top:20px}
.a-panel .acts button{height:34px;padding:0 16px;border-radius:3rem;font:700 13px/1 var(--sans);border:1px solid var(--line2);color:var(--ink2)}
.a-panel .acts .go{background:var(--sea);border-color:var(--sea)}
.a-fields{margin-top:22px;display:flex;flex-direction:column;border-top:1px solid var(--line)}
.a-f{display:grid;grid-template-columns:76px 1fr;column-gap:14px;align-items:baseline;padding:11px 0;border-bottom:1px solid var(--line);font-size:14px}
.a-f dt{color:var(--faint);font-size:13px}
.a-f dd{min-height:22px;padding:2px 0;border-radius:6px;color:var(--ink);transition:background .25s,box-shadow .25s,padding .25s}
.is-edit .a-f dd{padding:2px 8px;background:var(--bg);box-shadow:inset 0 0 0 1px var(--line2)}
.is-edit .a-f dd.ed::after{content:"";display:inline-block;width:1.5px;height:1em;margin-left:2px;vertical-align:-.15em;background:var(--sea);animation:x4-blink 1s steps(1) infinite}
.a-f .chips{display:flex;flex-wrap:wrap;gap:6px}
.a-f .chips span{padding:2px 9px;border-radius:3rem;background:var(--tint);font-size:12.5px;color:var(--crim)}
.a-f .files{display:flex;flex-direction:column;gap:4px}
.a-f .files span{display:flex;justify-content:space-between;color:var(--ink2)}
.a-f .files em{font-style:normal;color:var(--sea-t);font-weight:700;font-size:12.5px}
/* ---- 图标跟画法走 ---- */
.a-ic .ico{width:23px;height:23px}
.a-brand .mark{width:28px;height:28px}
.a-send .ico{width:17px;height:17px}
.a-g .lbl .tyi{width:15px;height:15px;color:var(--crim)}
.a-kick .stg{width:17px;height:17px}
.a-ic:hover .ik2 .lf1{transform:none}
/* ---- 设置 › 外观 ---- */
.br-st.is-on{color:var(--ink);font-weight:600}
.br-svg .tw.on{stroke-width:1.6;opacity:.9}
.a-look{max-width:760px}
.a-look .k{font:700 12.5px/1 var(--sans);letter-spacing:.07em;color:var(--crim)}
.a-look h2{margin-top:12px;font:600 52px/1.1 var(--serif)}
.a-look .line{margin-top:6px;font:300 21px/1.3 var(--serif);color:var(--muted)}
.pals{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:26px}
.pal-card{display:flex;flex-direction:column;border-radius:14px;background:var(--card);box-shadow:0 0 0 1px var(--line);overflow:hidden;text-align:left;transition:box-shadow .35s var(--out),transform .35s var(--out)}
.pal-card:hover{transform:translateY(-2px)}
.pal-card.is-on{box-shadow:0 0 0 2px var(--sea),0 14px 34px -20px #0005}
.pv{position:relative;display:block;height:150px;padding:14px 16px;background:var(--bg);color:var(--ink)}
.pv .lv{position:absolute;left:14px;right:14px;top:12px;width:calc(100% - 28px);height:auto;overflow:visible}
.pv .lv path{fill:none;stroke:var(--sea);stroke-linecap:round}.pv .lv .m{stroke-width:1.4;opacity:.8}.pv .lv .o{stroke-width:1;opacity:.3;fill:var(--sea);fill-opacity:.05}.pv .lv .v{stroke-width:.9;opacity:.45}
.pv b{position:absolute;left:16px;top:72px;font:500 18px/1.2 var(--serif)}
.pv .in{position:absolute;left:16px;right:16px;top:102px;display:flex;justify-content:space-between;align-items:center;height:30px;padding:0 6px 0 10px;border:1px solid var(--line2);border-radius:6px;background:var(--card);font:13px/1 var(--serif);font-style:normal;color:var(--faint)}
.pv .in em{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--sea);color:var(--on-sea);font-style:normal;font-size:11px}
.pv .bt{position:absolute;right:16px;top:70px;padding:3px 9px;border-radius:3rem;background:var(--sea);color:var(--on-sea);font:700 11px/1.3 var(--sans);font-style:normal}
.pal-card .nm{position:relative;display:flex;flex-direction:column;gap:3px;padding:12px 16px 14px;border-top:1px solid var(--line)}
.pal-card .nm b{font:600 18px/1.2 var(--serif);color:var(--ink)}
.pal-card .nm span{font-size:12.5px;color:var(--faint)}
.pal-card .ck{position:absolute;right:16px;top:16px;width:18px;height:18px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--line2);transition:all .3s}
.pal-card.is-on .ck{background:var(--sea);box-shadow:inset 0 0 0 4px var(--card)}
.a-look h3{margin-top:30px;font:700 11.5px/1 var(--sans);letter-spacing:.12em;color:var(--faint)}
.seg{display:inline-flex;margin-top:12px;padding:3px;border-radius:3rem;background:var(--tint)}
.seg button{height:32px;padding:0 16px;border-radius:3rem;font:400 13.5px/1 var(--sans);color:var(--ink2);transition:background .25s,color .25s,box-shadow .25s}
.seg button.is-on{background:var(--card);color:var(--ink);box-shadow:0 1px 3px #0002;font-weight:700}
.a-look .note{margin-top:22px;font-size:13.5px;color:var(--muted)}
.a-ripple{position:absolute;z-index:60;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:2px solid var(--sea);pointer-events:none;animation:a-rip 1s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes a-rip{from{transform:scale(.3);opacity:1}to{transform:scale(40);opacity:0}}
`;

const ref = (n) => `<button type="button" class="a-ref {{c${n}}}" onClick="{{pk${n}}}" aria-label="引用 ${n}">${n}</button>`;
const sidenotes = (text) => [...text.matchAll(/\[(\d)\]/g)].map((m) => {
  const c = C.CITES[Number(m[1]) - 1];
  return `<span class="a-sn pith-sidenote pith-unfold-note {{c${c.n}}}"><span class="h"><i>${c.n}</i>${c.kind}</span><b>${esc(c.src)}</b><span class="loc">${esc(c.loc)}</span><q>${esc(c.text)}</q><span class="go"><button type="button" class="pith-link" onClick="{{toKb}}">知识库里这一段</button><button type="button" class="pith-link" onClick="{{toLib}}">文献库那一条</button></span></span>`;
}).join('');
const para = (text, cls) => `<p class="a-p pith-unfold ${cls}">${cited(text, ref)}${sidenotes(text)}</p>`;

const top = `<header class="a-top"><button type="button" class="a-brand pith-brand {{introCls}}" onClick="{{goChat}}" aria-label="回到对话">${logoMark('app')}${wordmark()}</button>
<nav class="a-icons"><button type="button" class="a-ic pith-ink {{navKb}} {{fedCls}}" onClick="{{goKb}}" aria-label="知识库">${icon('kb')}<span class="tip">知识库</span></button><button type="button" class="a-ic pith-ink {{navLib}}" onClick="{{goLib}}" aria-label="文献库">${icon('lib')}<span class="tip">文献库</span></button><button type="button" class="a-ic pith-ink {{navSet}}" onClick="{{goSet}}" aria-label="设置">${icon('set')}<span class="tip">设置</span></button><i class="a-dot {{navAt}}"></i><span class="a-badge {{savedCls}}">+1</span></nav></header>`;

const composer = `<div class="a-comp {{stage}} {{typing}} {{ready}}">
<sc-if value="{{isNamed}}" hint-placeholder-val="{{ false }}"><p class="a-named">点名：{{named}}<button type="button" onClick="{{unname}}">×</button></p></sc-if>
<button type="button" class="a-field" onClick="{{focus}}"><sc-if value="{{chipKb}}" hint-placeholder-val="{{ false }}"><span class="a-chip"># 读《国富论》</span></sc-if><sc-if value="{{isBusy}}" hint-placeholder-val="{{ false }}"><span class="a-think">${agentIcon('think')}<span class="shim">Pith 在想……</span></span></sc-if><sc-if value="{{inFull}}" hint-placeholder-val="{{ false }}"><span>{{inText}}</span></sc-if><sc-if value="{{inEmpty}}" hint-placeholder-val="{{ true }}"><span class="ph">{{inPh}}</span></sc-if><i class="caret"></i></button>
<div class="a-sig"><button type="button" class="pith-ink {{menuSlash}}" onClick="{{openSlash}}" aria-label="技能">/</button><button type="button" class="pith-ink {{menuAt}}" onClick="{{openAt}}" aria-label="角色">@</button><button type="button" class="pith-ink {{menuHash}}" onClick="{{openHash}}" aria-label="知识库">#</button></div>
<button type="button" class="a-send pith-sweep" onClick="{{send}}" aria-label="发送">${icon('send')}</button>
<div class="a-menu {{menuSlash}}"><p>/ 技能：点名用一个，不点 Pith 自己挑</p>${C.SKILLS.map((s, i) => `<button type="button" onClick="{{sk${i}}}"><span class="k">${s.cmd}</span>${s.name}</button>`).join('')}</div>
<div class="a-menu {{menuAt}}"><p>@ 角色：请一位答这一回</p>${C.ROLES.map((r, i) => `<button type="button" onClick="{{ra${i}}}"><span class="av">${r.mark}</span>${r.name}<span style="margin-left:auto;font-size:12px;color:var(--faint)">${esc(r.line)}</span></button>`).join('')}</div>
<div class="a-menu {{menuHash}}"><p># 知识库：这一次在哪几个里找</p>${C.KBS.map((k, i) => `<button type="button" class="{{kc${i}}}" onClick="{{kp${i}}}"><span class="ck"></span>${k.name}<span style="margin-left:auto;font-size:12px;color:var(--faint)" class="num">{{kbN${i}}}</span></button>`).join('')}</div>
</div>`;

const thread = `<sc-if value="{{isThread}}" hint-placeholder-val="{{ false }}">
<div class="a-thread scroll a-page"><div class="a-art {{stepN}}">
<p class="a-kick"><span class="crim">对话</span>${stageIcon(0)}<span>{{chatRole}} · 今天</span></p>
<h1 class="a-title rv {{s1}}">${esc(C.Q)}</h1>
<div class="a-meta rv {{s1}}"><span class="tags"><span># 读《国富论》</span><span>分工</span><span>市场</span></span><p>种下于 11 月 23 日<br>刚刚照料</p></div>
<p class="a-status">${C.STATUS.map((t, i) => `<span class="{{st${i}}}">${agentIcon(['search', 'read', 'read'][i])}<span class="tx">${esc(t)}</span></span>`).join('')}</p>
${C.ANSWER.map((p, i) => para(p, `rv {{s${5 + i}}}${i === 0 ? ' cap' : ''}`)).join('\n')}
<p class="a-ask pith-unfold rv {{s8}}">${esc(C.ASK_BACK)}</p>
<article class="a-card rv {{s9}} {{savedCls}}"><span class="a-grow">${stageIcon(0, 'stg g1')}${stageIcon(1, 'stg g2')}</span><div><b>${C.CARD.title}</b><p class="d">分工因交换而起，所以受市场范围限制；高地散村和水运两个例子；Stigler 用到行业的一生。</p><p class="m">${C.CARD.kind} • ${C.CARD.meta}</p></div>
<sc-if value="{{unsaved}}" hint-placeholder-val="{{ true }}"><button type="button" class="act pith-link" onClick="{{save}}">${C.CARD.save} →</button></sc-if><sc-if value="{{saved}}" hint-placeholder-val="{{ false }}"><span class="ok">${agentIcon('save', 'once').replace('<svg ', '<svg style="--at:-0.9s" ')}<span>已种下<br>读《国富论》</span></span></sc-if></article>
<sc-if value="{{revOn}}" hint-placeholder-val="{{ false }}"><section class="a-rev"><h4>回应</h4>
<p class="a-you rv {{r1}}">你：<b>@审稿人</b> 这个解释站得住吗？</p>
<div class="a-who rv {{r1}}"><span class="a-av">审</span><b>审稿人</b><span>专挑刺</span></div>
<p class="a-status" style="margin-top:12px"><span class="{{rst}}">${agentIcon('web')}<span class="tx">${esc(C.REV_STATUS)}</span></span></p>
<sc-if value="{{verbose}}" hint-placeholder-val="{{ true }}">${para(C.REV_ANSWER.verbose, 'rv {{r3}}')}</sc-if>
<sc-if value="{{terse}}" hint-placeholder-val="{{ false }}">${para(C.REV_ANSWER.terse, 'rv {{r3}}')}</sc-if>
<sc-if value="{{qOpen}}" hint-placeholder-val="{{ false }}"><div class="a-q rv {{r4}}"><p>${C.QCARD.q}</p><div class="opts"><button type="button" class="go pith-sweep" onClick="{{addYes}}">${C.QCARD.yes}<span class="rec">推荐</span></button><button type="button" onClick="{{addNo}}">${C.QCARD.no}</button></div></div></sc-if>
<sc-if value="{{added}}" hint-placeholder-val="{{ false }}"><p class="a-done">${C.QCARD.done}<button type="button" class="pith-link" onClick="{{goLib}}">去看</button></p></sc-if>
<sc-if value="{{declined}}" hint-placeholder-val="{{ false }}"><p class="a-done">${C.QCARD.skip}</p></sc-if>
</section></sc-if>
</div></div></sc-if>`;

const order = (i) => ORDER[i] || [...C.MATS[i].keys()].reverse();
const kb = `<main class="a-gard a-page">
<p class="a-count num">{{kbNSel}} 份</p><h1 class="a-h1">{{kb.name}}</h1>
<div class="a-ktabs">${C.KBS.map((k, i) => `<button type="button" class="{{kbc${i}}}" onClick="{{ks${i}}}">${k.name}<span class="num">{{kbN${i}}}</span></button>`).join('')}</div>
<div class="a-wallbox">${C.MATS.map((list, i) => `<sc-if value="{{kbIs${i}}}" hint-placeholder-val="{{ ${i === 1} }}"><div class="a-wall">${order(i).map((j, k) => card(list[j], i, j, k, { esc, stageIcon, typeIcon })).join('')}</div></sc-if>`).join('\n')}</div>
</main>
<sc-if value="{{matOpen}}" hint-placeholder-val="{{ false }}"><aside class="a-drawer"><p class="k">${stageIcon(1)}<span>{{m.kind}}</span></p><button type="button" class="x" onClick="{{closeMat}}" aria-label="关上">×</button><h2>{{m.title}}</h2><p class="s">{{m.sub}}</p><p class="t">{{m.text}}</p>
<dl><dt>种下于</dt><dd>{{m.date}}</dd><dt>在这个知识库</dt><dd>{{kb.name}}</dd></dl></aside></sc-if>`;

const libRow = (r, i) => {
  const row = `<button type="button" class="a-tr pith-row {{lc${i}}}${r.young ? ' fresh' : ''}" onClick="{{ls${i}}}"><span class="ti"><i class="sp" style="background:${COVERS[i % COVERS.length]}"></i><b>${esc(r.title)}</b>${r.young ? '<span class="new">新</span>' : ''}</span><span class="c">${esc(r.by)}</span><span class="c num">${r.year}</span><span class="c">${r.type}</span><span class="c f">${esc(r.files)}</span></button>`;
  return r.young ? `<sc-if value="{{young}}" hint-placeholder-val="{{ false }}">${row}</sc-if>` : row;
};
const field = (k, v, ed = false) => `<div class="a-f"><dt>${k}</dt><dd class="${ed ? 'ed' : ''}">${v}</dd></div>`;
const lib = `<main class="a-lib a-page"><p class="a-count num">13 条</p><h1 class="a-h1">文献库</h1>
<div class="a-ltabs"><span class="on">全部</span><span>毕业论文</span><span>读书</span><span>没进知识库</span><span class="imp">从 Zotero 导入</span></div>
<div class="a-table"><div class="a-th"><span>题名</span><span>作者</span><span>年份 ↓</span><span>类型</span><span>附件</span></div>
${[0, 6, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12].map((i) => libRow(C.LIB[i], i)).join('\n')}</div></main>
<aside class="a-panel {{libEditCls}}"><button type="button" class="x" onClick="{{closeLib}}" aria-label="关上">×</button>
<div class="top"><i class="cv" style="background:var(--sea-t)"></i><div><p class="k">{{L.type}} · {{L.year}}</p><h2>{{L.title}}</h2></div></div>
<p class="acts"><button type="button" class="go pith-sweep" onClick="{{readLib}}">阅读</button><sc-if value="{{libViewing}}" hint-placeholder-val="{{ true }}"><button type="button" onClick="{{editLib}}">编辑元信息</button></sc-if><sc-if value="{{libEditing}}" hint-placeholder-val="{{ false }}"><button type="button" onClick="{{saveLib}}">完成</button></sc-if></p>
<dl class="a-fields">${field('题名', '{{L.title}}', true)}${field('作者', '{{L.by}}')}${field('年份', '{{L.year}}')}${field('出处', '{{L.venue}}')}${field('类型', '{{L.type}}')}${field('附件', '<span class="files"><span>{{L.files}}<em>打开</em></span></span>')}${field('在知识库', '<span class="chips"><span>{{L.kbs}}</span></span>')}${field('标签', '<span style="color:var(--faint)">＋ 加标签</span>')}</dl></aside>`;

const set = () => `<main class="a-set a-page">
${setNav()}
<div class="a-rmain"><sc-if value="{{isLook}}" hint-placeholder-val="{{ false }}">${look}</sc-if><sc-if value="{{isRole}}" hint-placeholder-val="{{ true }}"><div class="a-people">${C.ROLES.map((r, i) => `<button type="button" class="a-person {{rc${i}}}" onClick="{{rs${i}}}"><i>${r.mark}</i>${r.name}</button>`).join('')}</div>
<section class="a-rp"><p class="k">角色<button type="button" class="pith-link" onClick="{{startChat}}">和它开始对话 →</button></p><h2>{{R.name}}</h2><p class="line">{{R.line}}</p>
<p class="desc">{{R.desc}}</p>
<sc-if value="{{isRev}}" hint-placeholder-val="{{ true }}"><button type="button" class="tw {{terseCls}}" onClick="{{toggleTerse}}"><sc-if value="{{verbose}}" hint-placeholder-val="{{ true }}">＋ 让它说话再短一点（在对话里说也行）</sc-if><sc-if value="{{terse}}" hint-placeholder-val="{{ false }}">已经改短了 · 撤回</sc-if></button></sc-if>
<dl><dt>默认知识库</dt><dd>{{R.kb}}</dd><dt>偏好的模型</dt><dd>{{R.model}}</dd><dt>常用技能</dt><dd style="grid-column:2/-1">{{R.skills}}</dd></dl>
</section></sc-if></div></main>`;


/* ---- 这块板自己的：方案零件之外的位置、尺寸（动效、悬停、配色都在 SCHEME_CSS 里） ---- */
const R1_CSS = `
.a-card .ok{display:flex;align-items:center;gap:8px}.a-card .ok .pith-agent{width:24px;height:24px;flex:none;color:var(--ink)}
.a-ic:hover,.a-sig button:hover{background:none}
.a-ic .ico{width:24px;height:24px}
.a-brand .mark{width:30px;height:30px}
.a-badge{background:var(--coral);color:var(--app-ink)!important}
.a-badge.is-saved{animation-delay:.82s}
.a-tr .new{background:var(--coral);color:var(--app-ink)!important}
.a-ref:hover{box-shadow:0 0 0 1.5px var(--coral)}
.a-person:hover i{box-shadow:0 0 0 2px var(--bg),0 0 0 3.5px var(--coral)}
.br-it,.br-st{--dot-x:-10px;--dot-y:11px}.br-new{--dot-x:-8px;--dot-y:12px}.a-tr{--dot-x:7px}
/* 状态行：每一步一个 Agent 图标，在跑的那一步图标在动、字上扫过一道光 */
.a-status span{gap:7px}
.a-status .tx{opacity:1!important;display:inline!important}
.dA .br-st,.dA .br-it,.dA .br-new{position:absolute}
.a-status span::before{display:none!important}
.a-status .pith-agent{width:17px;height:17px;color:var(--muted)}
.a-status span:not(.is-run) .pith-agent,.a-status span:not(.is-run) .pith-agent *{animation-play-state:paused!important}
.a-status .is-done .pith-agent{color:var(--faint)}
.a-status .is-run .tx{background:linear-gradient(90deg,var(--muted) 0 38%,var(--ink) 50%,var(--muted) 62% 100%) 0 0/250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:pith-ag-shim 1.8s linear infinite}
.a-think{display:inline-flex;align-items:center;gap:9px;font:400 16.5px/1 var(--serif)}
.a-think .pith-agent{width:22px;height:22px;color:var(--sea)}
/* 换配色：湖面波纹和颜色过渡在方案的 palette-lake 零件里；这里只把水面扭曲放在对话区（不扭顶栏和波纹） */
.a-shell.is-lake{filter:url(#pith-lake-f)}
.a-filt{position:absolute;left:0;top:0;width:0;height:0}
@media (prefers-reduced-motion: reduce){.a-shell.is-lake{filter:none}}
`;

/** 一张能点的板：默认纸与海、亮色。 */
export function app() {
  const html = board({
    title: 'Pith · App（铅字 × 数字花园）',
    cls: 'dA',
    fonts: FONTS,
    css: SCHEME_CSS + '\n' + ALIAS_CSS('.dA') + BASE_CSS + CSS_ADD + CSS + GARDEN_CSS + R1_CSS,
    theme: 'light', palette: '纸与海',
    body: `<div class="tl"><i></i><i></i><i></i></div>
${top}
<div class="a-shell {{sideCls}} {{libPanelCls}} {{lakeCls}}">${screens({ chat: `<sc-if value="{{isHome}}" hint-placeholder-val="{{ true }}">${home()}</sc-if>\n${thread}\n${composer}\n${drawer()}`, kb, lib, set: set() })}</div>
<sc-if value="{{rip}}" hint-placeholder-val="{{ false }}"><svg class="pith-lake is-in" style="left:{{rx}}px;top:{{ry}}px" viewBox="-20 -20 40 40" aria-hidden="true">${[1, 2, 3, 4, 5].map((k) => `<circle class="rg rg${k}" r="10"/><circle class="rh rh${k}" r="10.6"/>`).join('')}</svg></sc-if>
<sc-if value="{{isFly}}" hint-placeholder-val="{{ false }}"><i class="pith-seed is-in" style="offset-path:path('{{flyPath}}')"></i></sc-if>
<svg class="a-filt" width="0" height="0" aria-hidden="true"><filter id="pith-lake-f" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".011 .016" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"><animate id="pith-lake-anim" attributeName="scale" values="0;11;5;2;0" keyTimes="0;.22;.5;.75;1" dur="1.4s" begin="indefinite" fill="freeze"/></feDisplacementMap></filter></svg>
${palette('a-pal')}
${toast('a-toast')}`,
  });
  return { html, w: 1280, h: 800 };
}
