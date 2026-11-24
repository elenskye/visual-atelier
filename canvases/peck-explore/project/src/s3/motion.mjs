// 第 3 步 · 动效数值：一格 50ms，一步一格。15 个动作现场演（REPLAY 重放），右边是全表、两档和减弱动态效果。
import { board, DOTS, FLIP, px, twinkle, dotCheck } from '../s1c/kit.mjs';
import { CSS as SIDE } from '../s2d/side.mjs';
import { MOTIONS, TICK, MS, themeCss } from './tokens.mjs';
import { BASE, themeProps } from './color.mjs';
import { STATES } from './controls.mjs';

const D = `font-family:${DOTS};font-weight:900`;
const M = Object.fromEntries(MOTIONS.map((m) => [m[0], m]));
const s = (id) => `${MS(M[id][3]) / 1000}s`;

const CSS = `
.pk.mo3{width:1760px;height:940px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:16px}
.ft .rp{margin-left:auto}
.mg{flex:1;display:grid;grid-template-columns:minmax(0,1fr) 470px;gap:16px;min-height:0}
.tiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));gap:12px;min-height:0}
.tl{display:flex;flex-direction:column;gap:8px;padding:11px 13px 12px;min-width:0}
.tl .th{display:flex;align-items:baseline;gap:8px;white-space:nowrap}
.tl .th b{${D};font-size:13px;letter-spacing:.08em;color:var(--cy-tx)}
.tl .th span{font-size:12.5px;font-weight:600}
.tl .stg{position:relative;flex:1;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--pane2);clip-path:var(--clip2)}
.tl .mt2{display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;font-size:12px;color:var(--tx3)}
.tl .mt2 em{${D};font-size:12px;letter-spacing:.06em;color:var(--tx)}
.tl .was{font-size:12px;color:var(--tx3)}
.tg3{display:inline-flex;align-items:center;height:16px;padding:0 4px;${D};font-size:11.5px;letter-spacing:.06em;clip-path:var(--notch);background:var(--raise);color:var(--tx2)}
.tg3.ex{background:var(--cy-soft);color:var(--cy-tx)}
.tg3.lp{background:var(--warn-soft);color:var(--warn)}
/* 各个演示 */
.dm-st{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px}
.dm-st span{width:100%;text-align:center;font-size:12px;color:var(--tx3)}
.dm-rev{width:190px;font-size:12.5px;line-height:1.5;color:var(--tx);animation:revealX ${s('reveal')} .3s steps(${M.reveal[3]},end) both}
.dm-toast{display:flex;align-items:center;gap:6px;padding:7px 10px;clip-path:var(--clip2);background:var(--tx);color:var(--bg);font-size:12px;white-space:nowrap;animation:revealY ${s('reveal-s')} .3s steps(${M['reveal-s'][3]},end) both}
.dm-toast .px{width:12px;height:12px}
.dm-card{position:relative;width:180px;height:74px;padding:10px 12px;background:var(--pane)}
.dm-card .q{position:absolute;background:var(--warn)}
.dm-card .q1{left:0;top:0;width:100%;height:2px;transform-origin:left;animation:eX .2s .3s steps(4,end) both}
.dm-card .q2{right:0;top:0;width:2px;height:100%;transform-origin:top;animation:eY .2s .5s steps(4,end) both}
.dm-card .q3{right:0;bottom:0;width:100%;height:2px;transform-origin:right;animation:eX .2s .7s steps(4,end) both}
.dm-card .q4{left:0;bottom:0;width:2px;height:100%;transform-origin:bottom;animation:eY .2s .9s steps(4,end) both}
.dm-card p{font-size:12px;line-height:1.5;color:var(--tx2);animation:revealY ${s('reveal')} 1.1s steps(${M.reveal[3]},end) both}
.dm-card p b{display:block;font-family:var(--f-name);font-size:var(--fs-name);font-weight:400;color:var(--tx)}
.dm-scan{position:absolute;top:0;bottom:0;left:-80px;width:76px;background:linear-gradient(90deg,transparent,var(--cy-scan) 78%,var(--cy-blk) 97%,transparent);animation:sweepOnce ${s('scan-once')} .3s both}
.dm-lines{display:flex;flex-direction:column;gap:6px;width:170px}
.dm-lines i{display:block;height:6px;background:var(--off)}
.dm-lines i:nth-child(2){width:80%}.dm-lines i:nth-child(3){width:60%}
.dm-pkt{position:absolute;left:30px;bottom:24px;width:10px;height:10px;background:var(--cy-blk);box-shadow:var(--dglow);animation:pk3 ${s('send')} .3s steps(6,end) both}
.dm-pkt0{position:absolute;left:22px;bottom:16px;width:80px;height:26px;box-shadow:inset 0 0 0 1px var(--cy-ol)}
.dm-pkt1{position:absolute;right:22px;top:16px;width:70px;height:20px;background:var(--raise)}
@keyframes pk3{from{transform:translate(0,0)}to{transform:translate(150px,-62px)}}
.dm-done{display:flex;align-items:center;gap:10px;animation:flash ${s('done-flash')} .3s steps(1) 1}
.dm-done b{font-family:var(--f-name);font-size:var(--fs-name);font-weight:400;color:var(--tx)}
.dm-wq{display:grid;grid-template-columns:repeat(10,12px);gap:3px}
.dm-wq i{height:12px;background:var(--off)}
.dm-wq i.f{background:var(--cy-blk);box-shadow:var(--bglow)}
.dm-wq i.q{animation:wq ${s('wait-turn')} .3s steps(1) 1 both}
.dm-roll{display:flex;align-items:center;gap:10px}
.dm-roll .win{height:26px;overflow:hidden}
.dm-roll .col{display:flex;flex-direction:column;animation:roll3 ${s('roll')} .3s steps(6,end) both}
.dm-roll .col span{${D};font-size:26px;line-height:26px;height:26px;color:var(--cy-tx);text-shadow:var(--glow)}
.dm-roll em{font-size:12.5px;color:var(--tx2)}
@keyframes roll3{from{transform:translateY(0)}to{transform:translateY(-156px)}}
.dm-dis{display:flex;flex-direction:column;gap:4px;width:180px}
.dm-dis p{display:flex;gap:8px;font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx);animation:dissolve ${s('dissolve')} .3s steps(${M.dissolve[3]},end) both}
.dm-dis p:nth-child(2){animation-delay:.45s}.dm-dis p:nth-child(3){animation-delay:.6s}
.dm-dis p span{color:var(--bad)}
.dm-caret{display:flex;align-items:center;gap:6px;font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx)}
.dm-caret .pr{color:var(--cy-tx)}
.dm-caret .caret{animation-duration:${s('caret')}}
.dm-tw{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--tx2)}
.dm-tw .tw i{animation-duration:${s('twinkle')}}
.dm-blk{display:grid;grid-template-columns:repeat(12,10px);gap:3px}
.dm-blk i{height:12px;background:var(--off)}
.dm-blk i.f{background:var(--cy-blk);box-shadow:var(--bglow);animation:wave ${s('wave')} ease-in-out infinite}
.dm-blk i.h{background:var(--cy-blk);box-shadow:var(--bglow);animation:blink ${s('head-blink')} steps(1) infinite}
.dm-run{display:flex;align-items:center;gap:10px;font-family:var(--f-name);font-size:var(--fs-name);color:var(--tx)}
.dm-run .b{position:relative;width:10px;height:10px}
.dm-run .b i{position:absolute;inset:0;background:var(--cy-blk);box-shadow:var(--dglow);animation:bounce ${s('running')} infinite}
.dm-run .b u{position:absolute;inset:-3px;box-shadow:0 0 0 1px var(--cy-tx);animation:ring ${s('running')} infinite}
.dm-sl{position:relative;width:190px;height:26px;overflow:hidden;background:var(--pane)}
.dm-sl i{position:absolute;top:0;bottom:0;left:-90px;width:88px;background:linear-gradient(90deg,transparent,var(--cy-scan) 80%,var(--cy-blk) 98%,transparent);animation:scanx ${s('scan-loop')} cubic-bezier(.45,0,.55,1) infinite}
.dm-sl span{position:relative;display:block;padding:4px 8px;font-family:var(--f-name);font-size:var(--fs-name);color:var(--tx)}
@media (prefers-reduced-motion:reduce){.pk.mo3 .stg *{animation:none!important}.pk.mo3 .dm-scan,.pk.mo3 .dm-sl i{display:none}}
/* 右栏 */
.rcl{display:flex;flex-direction:column;gap:12px;min-height:0}
.rcl .mod{padding:12px 16px 12px}
.rcl .ml{margin-bottom:6px}
.mr3 li{display:grid;grid-template-columns:82px minmax(0,1fr);gap:8px;padding:5px 0;border-top:1px dotted var(--line2);font-size:12px;line-height:1.5;color:var(--tx2)}
.mr3 li:first-child{border-top:0}
.mr3 b{${D};font-size:13px;letter-spacing:.06em;color:var(--tx)}
.tt6{width:100%;border-collapse:collapse;font-size:12px}
.tt6 th{text-align:left;font-weight:400;color:var(--tx3);padding:0 6px 4px 0;white-space:nowrap}
.tt6 td{padding:1px 6px 1px 0;border-top:1px dotted var(--line2);color:var(--tx2);white-space:nowrap;line-height:17px}
.tt6 td.c{font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx)}
.tt6 td.n{${D};font-size:12.5px;color:var(--tx);text-align:right}
.tt6 th.n{text-align:right}
`;

// [id, 演示的 html]
const DEMOS = [
  ['state', `<div class="dm-st"><button type="button" class="btn">CANCEL</button><button type="button" class="btn pri">SEND</button><span>指上去、按下去试试</span></div>`],
  ['reveal', `<p class="dm-rev">三个设置对话框合成了一个面板；旧的两个删了。</p>`],
  ['reveal-s', `<div class="dm-toast">${px('bang')}<span>同一个项目一次跑一个任务</span></div>`],
  ['card-edge', `<div class="dm-card"><i class="q q1"></i><i class="q q2"></i><i class="q q3"></i><i class="q q4"></i><p><b>Grok 停下来问你</b>Tailwind 要不要一起升到 4.1？</p></div>`],
  ['scan-once', `<div class="dm-lines"><i></i><i></i><i></i></div><i class="dm-scan"></i>`],
  ['send', `<i class="dm-pkt0"></i><i class="dm-pkt1"></i><i class="dm-pkt"></i>`],
  ['done-flash', `<div class="dm-done">${dotCheck()}<b>做完了</b></div>`],
  ['wait-turn', `<div class="dm-wq"><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="f"></i><i class="q"></i><i></i><i></i><i></i><i></i></div>`],
  ['roll', `<div class="dm-roll"><div class="win" data-nolint=""><div class="col">${[6, 5, 4, 3, 2, 1, 0].map((n) => `<span>${n}</span>`).join('')}</div></div><em>个文件</em></div>`],
  ['dissolve', `<div class="dm-dis"><p>Composer.tsx<span>−21</span></p><p>App.tsx<span>−18</span></p><p>package.json<span>−1</span></p></div>`],
  ['caret', `<p class="dm-caret"><span class="pr">›</span><span>把设置里三个</span><i class="caret"></i></p>`],
  ['twinkle', `<p class="dm-tw">${twinkle()}<span>Muse 在读 units.ts…</span></p>`],
  ['head-blink', `<div class="dm-blk">${Array.from({ length: 12 }, (_, i) => `<i class="${i < 6 ? 'f' : i === 6 ? 'h' : ''}"></i>`).join('')}</div>`],
  ['running', `<p class="dm-run"><span class="b"><u></u><i></i></span><span>Grok 改 5 个文件</span></p>`],
  ['scan-loop', `<div class="dm-sl"><i></i><span>Grok 跑 pnpm check</span></div>`],
];
const LOOP_NOTE = { 'head-blink': '亮着的格另有呼吸 48 格（2.4 秒）' };

function motionBoard() {
  const def = FLIP ? '浅色' : '深色';
  const tiles = DEMOS.map(([id, html]) => {
    const [, nm, , n, way, loop, tier, was] = M[id];
    return `<div class="mod tl"><p class="th"><b>${id.toUpperCase()}</b><span>${nm}</span></p>
      <div class="stg"><sc-if value="{{run}}" hint-placeholder-val="{{true}}">${html}</sc-if></div>
      <p class="mt2"><em>${n} 格 · ${MS(n)}MS</em><span>${way}</span><i class="tg3 ${tier === 'calm' ? '' : 'ex'}">${tier.toUpperCase()}</i>${loop ? '<i class="tg3 lp">LOOP</i>' : ''}</p>
      ${was || LOOP_NOTE[id] ? `<p class="was">${was ? '原来 ' + was : LOOP_NOTE[id]}</p>` : ''}</div>`;
  }).join('');
  const rows = MOTIONS.map(([id, nm, when, n, , loop, tier]) => `<tr><td class="c">${id}</td><td>${nm}</td><td class="n">${n}</td><td class="n">${MS(n)}</td><td>${tier === 'calm' ? 'calm' : 'expressive'}${loop ? ' · 循环' : ''}</td></tr>`).join('');
  const tiers = `<ul class="mr3">
    <li><b>TICK</b><span>一格 ${TICK}ms。一步一格（steps），位移一格一格跳，不用平滑缓动；时长都是整格。光（扫描、发光的呼吸）可以平滑，它不是东西。</span></li>
    <li><b>CALM</b><span>控件的小动静：状态立刻变，出现、露出、溶掉 4–8 格（≤ 400ms），不循环。</span></li>
    <li><b>EXPRESSIVE</b><span>要登记：发出、等你、做完、撤销这几个时刻，单次 ≤ 1 秒；在跑和等待时能循环（光标、转圈、进度、在跑那一步）。</span></li>
    <li><b>REDUCED</b><span>减弱动态效果：只留最后的样子；光标常亮，转圈停成满格，扫描不出现。</span></li></ul>`;
  const body = `<div class="{{root}}"><div class="ft"><h1>动效 · 数值</h1><p>第 1 步定的点阵动效，数值收成一张表：一格 50ms，每个动作都是整格。15 个现场演，点 REPLAY 重放一次性的那几个。</p>
      <button type="button" class="btn rp" onClick="{{replay}}">${px('undo')}REPLAY</button></div>
    <div class="mg"><div class="tiles">${tiles}</div>
      <div class="rcl"><div class="mod"><p class="ml"><span class="l">RULES</span><span class="r">两档和减弱动态效果</span></p>${tiers}</div>
        <div class="mod"><p class="ml"><span class="l">ALL</span><span class="r">${MOTIONS.length} 个动作</span></p><table class="tt6"><tr><th>id</th><th>名字</th><th class="n">格</th><th class="n">ms</th><th>档位</th></tr>${rows}</table></div></div></div></div>`;
  const logic = `
  constructor(p) { super(p); this.state = { run: true }; }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    const dark = (this.props.theme ?? '${def}') === '深色';
    return { root: 'pk mo3 doc dots ' + (dark ? 'dk' : 'lt'), run: this.state.run,
      replay: () => { clearTimeout(this.t); this.setState({ run: false }); this.t = setTimeout(() => this.setState({ run: true }), 60); } };
  }`;
  const html = board({ title: '动效 · 数值', css: `${SIDE}\n${BASE}\n${CSS}\n${STATES}\n${themeCss()}`, body, props: themeProps(def), logic, w: 1760, h: 940 });
  return { file: 'S3-Motion.dc.html', w: 1760, h: 940, title: '动效 · 一格 50ms，15 个动作现场演', html };
}

export function boards() {
  return [motionBoard()];
}
