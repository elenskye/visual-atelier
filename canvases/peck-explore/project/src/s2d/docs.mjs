// 第 2 步 · 第四轮 · 规则板（第三版）、结果板；外加规则文档 peck-rules.md（第三版）。都从 rules.mjs 出。
import { board, PROPS, SANS, DOTS, FLIP, px } from '../s1c/kit.mjs';
import { CSS as PROTO } from '../s2/proto.mjs';
import { GROUPS, COUNT, DECIDED, LOCK, ENGINES, TESTS, QUESTIONS, PLACE } from './rules.mjs';
import { TIERS, TIER_COLS } from '../s2c/rules.mjs';

const D = `font-family:${DOTS};font-weight:900`;
const BASE = `
.doc{font-family:${SANS};color:var(--tx)}
.ft{display:flex;align-items:baseline;gap:18px}
.ft h1{font-size:22px;font-weight:600;white-space:nowrap}
.ft p{font-size:13px;color:var(--tx2)}
.tg2{display:inline-flex;align-items:center;height:18px;padding:0 5px;${D};font-size:12px;letter-spacing:.06em;clip-path:var(--notch);white-space:nowrap}
.tg2.new{background:var(--ok);color:var(--bg)}
.tg2.chg{background:var(--warn);color:var(--bg)}
.tg2.id{background:var(--raise);color:var(--tx2)}
.tg2.idn{background:var(--ok-soft);color:var(--ok);box-shadow:inset 0 0 0 1px var(--ok)}
`;

// ---------- 规则板 ----------
const RH = 1480;
const RULES_CSS = `
.pk.rb4{width:1760px;height:${RH}px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:18px}
.ft .lg{margin-left:auto;display:flex;gap:14px;align-items:center;font-size:12.5px;color:var(--tx2);white-space:nowrap}
.cols{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;min-height:0}
.cc3{display:flex;flex-direction:column;gap:18px;min-width:0}
.gc{padding:14px 18px 12px}
.gc.nw{--mline:var(--cy-line)}
.gh{display:flex;align-items:baseline;gap:10px;margin-bottom:8px}
.gh .k{${D};font-size:26px;line-height:1;color:var(--cy-tx);text-shadow:var(--dglow)}
.gh b{font-size:16px;font-weight:600}
.gh span{${D};font-size:13px;letter-spacing:.1em;color:var(--tx3)}
.gh em{margin-left:auto;font-style:normal;font-size:12px;color:var(--tx3)}
.gl li{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:8px;align-items:start;padding:5px 0;border-top:1px dotted var(--line2)}
.gl li .i{${D};font-size:14px;color:var(--tx2);padding-top:1px}
.gl li p{font-size:12.5px;line-height:1.6;color:var(--tx)}
`;
function rulesBoard() {
  const def = FLIP ? '浅色' : '深色';
  const card = (g) => `<div class="mod gc"><p class="gh"><span class="k">${g.k}</span><b>${g.name}</b><span>${g.en}</span></p><ul class="gl">${g.rules.map(([id, t, n]) => `<li><span class="i">${id}</span><p>${t}</p>${n ? `<em class="tg2 ${n}">${n === 'new' ? 'NEW' : 'CHG'}</em>` : '<span></span>'}</li>`).join('')}</ul></div>`;
  const by = (k) => GROUPS.find((g) => g.k === k);
  const cards = [['L', 'R'], ['K', 'T', 'C', 'S'], ['M', 'I', 'A', 'W']].map((col) => `<div class="cc3">${col.map((k) => card(by(k))).join('')}</div>`).join('');
  const body = `<div class="{{root}}"><div class="ft"><h1>外框规则 · 第三版</h1><p>第三轮的 62 条，落了你回的三件事，再拿改到的地方做迁移测试：补了 ${COUNT.nw} 条、改了 ${COUNT.chg} 条，共 ${COUNT.all} 条。</p>
    <p class="lg"><em class="tg2 new">NEW</em>这一轮补的<em class="tg2 chg">CHG</em>这一轮改的</p></div><div class="cols">${cards}</div></div>`;
  const logic = `renderVals() { const dark = (this.props.theme ?? '${def}') === '深色'; return { root: 'pk rb4 doc dots ' + (dark ? 'dk' : 'lt') }; }`;
  return { file: 'S2d-Rules.dc.html', w: 1760, h: RH, title: `外框规则 · 第三版 · ${COUNT.all} 条`, html: board({ title: '外框规则 · 第三版', css: `${PROTO}\n${BASE}\n${RULES_CSS}`, body, props: PROPS.theme(def), logic, w: 1760, h: RH }) };
}

// ---------- 结果板 ----------
const REP_CSS = `
.pk.rp4{width:1280px;height:860px;padding:26px 32px 28px;display:flex;flex-direction:column;gap:14px}
.r1{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}
.box{padding:12px 16px 14px}
.box .ml{margin-bottom:8px}
.dc li{display:grid;grid-template-columns:84px minmax(0,1fr) auto;gap:10px;align-items:start;padding:6px 0;border-top:1px dotted var(--line2)}
.dc li:first-child{border-top:0}
.dc b{font-size:13px;font-weight:600}
.dc p{font-size:12.5px;line-height:1.55;color:var(--tx2)}
.dc p em{display:block;font-style:normal;font-size:13px;font-weight:600;color:var(--cy-tx)}
.dc .ids{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px;max-width:96px}
.lk4{display:flex;gap:3px}
.lk4 > div{display:flex;flex-direction:column;justify-content:center;gap:2px;min-width:0;height:48px;padding:0 10px;clip-path:var(--clip2);background:var(--ok-soft)}
.lk4 > div.lk{background:var(--raise)}
.lk4 b{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;white-space:nowrap;color:var(--ok)}
.lk4 .lk b{color:var(--tx)}
.lk4 b .px{width:12px;height:12px;color:var(--tx3)}
.lk4 span{font-size:12px;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lkn{margin-top:10px}
.lkn li{position:relative;padding:5px 0 5px 14px;border-top:1px dotted var(--line2);font-size:12.5px;line-height:1.55;color:var(--tx2)}
.lkn li:before{content:"";position:absolute;left:2px;top:12px;width:5px;height:5px;background:var(--tx3)}
.tests{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.tc{padding:11px 14px 12px;display:flex;flex-direction:column;gap:7px}
.tc .th{display:flex;align-items:baseline;gap:8px}
.tc .th b{${D};font-size:14px;letter-spacing:.08em;color:var(--cy-tx)}
.tc .th span{font-size:13px;font-weight:600}
.tc .rw{display:flex;flex-direction:column;gap:3px;font-size:12px;line-height:1.55;color:var(--tx2)}
.tc .rw > span:first-child{color:var(--tx3)}
.tc .ids{display:flex;flex-wrap:wrap;gap:4px}
.r3{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:14px}
.qs li{display:grid;grid-template-columns:22px 170px minmax(0,1fr);gap:10px;align-items:start;padding:7px 0;border-top:1px dotted var(--line2)}
.qs li:first-child{border-top:0}
.qs .n{${D};font-size:18px;color:var(--warn)}
.qs b{font-size:13px;font-weight:600}
.qs p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.pl li{display:grid;grid-template-columns:76px minmax(0,1fr);gap:8px;align-items:baseline;padding:6px 0;border-top:1px dotted var(--line2)}
.pl li:first-child{border-top:0}
.pl .k{${D};font-size:13px;letter-spacing:.08em;color:var(--tx)}
.pl b{display:block;font-size:12.5px;font-weight:600}
.pl span{display:block;font-size:12px;line-height:1.5;color:var(--tx3)}
`;
// 锁着时的几件事（结果板 LOCK 下面）
const LOCK_NOTES = [
  '输入行换成一把锁和一句什么时候解锁；TERM 页签上也一把锁。',
  '之前的输出照样能看，失败那条照样能带去 ONE SHOT 问。',
  '发任务前就在跑的命令接着跑，STOP 一直能点（问题 1）。',
  '做完解锁；之后你改的文件不算进任务，撤销不动它们。',
];
function reportBoard() {
  const def = FLIP ? '浅色' : '深色';
  const ids = (arr, nw) => arr.map((i) => `<em class="tg2 ${nw ? 'idn' : 'id'}">${i}</em>`).join('');
  const dec = DECIDED.map(([a, b, c, r]) => `<li><b>${a}</b><p><em>${b}</em>${c}</p><span class="ids">${ids(r, true)}</span></li>`).join('');
  const lock = `<div class="lk4">${LOCK.map(([n, sub, on, f]) => `<div class="${on ? 'lk' : ''}" style="flex:${f} 1 0"><b>${on ? px('lock') : ''}${n}</b><span>${sub}</span></div>`).join('')}</div>`;
  const tests = TESTS.map((t) => `<div class="mod tc"><p class="th"><b>${t.k}</b><span>${t.nm}</span></p>
    <div class="rw"><span>用到</span><div class="ids">${ids(t.used)}</div></div>
    <div class="rw"><span>不够</span><span>${t.gap}</span></div>
    <div class="rw"><span>补和改</span><div class="ids">${ids(t.fix, true)}</div></div></div>`).join('');
  const qs = QUESTIONS.map(([b, p], i) => `<li><span class="n">${i + 1}</span><b>${b}</b><p>${p}</p></li>`).join('');
  const pl = PLACE.map(([k, b, s]) => `<li><span class="k">${k}</span><div><b>${b}</b><span>${s}</span></div></li>`).join('');
  const body = `<div class="{{root}}"><div class="ft"><h1>第四轮结果</h1><p>你回的三件事落进了小样和规则；改到的地方只照规则画，不够的补进规则板（NEW / CHG）。</p></div>
    <div class="r1"><div class="mod box"><p class="ml"><span class="l">DECIDED</span><span class="r">你 11-10 回的</span></p><ul class="dc">${dec}</ul></div>
      <div class="mod box"><p class="ml"><span class="l">LOCK</span><span class="r">终端什么时候锁</span></p>${lock}<ul class="lkn">${LOCK_NOTES.map((t) => `<li>${t}</li>`).join('')}</ul></div></div>
    <div class="tests">${tests}</div>
    <div class="r3"><div class="mod box qs wait"><p class="ml"><span class="l">QUESTIONS</span><span class="r">要你定</span></p><ul>${qs}</ul></div>
      <div class="mod box pl"><p class="ml"><span class="l">ROADMAP</span><span class="r">放进哪个 Phase</span></p><ul>${pl}</ul></div></div></div>`;
  const logic = `renderVals() { const dark = (this.props.theme ?? '${def}') === '深色'; return { root: 'pk rp4 doc dots ' + (dark ? 'dk' : 'lt') }; }`;
  return { file: 'S2d-Report.dc.html', h: 860, title: '第四轮结果 · 要你定的 3 件事', html: board({ title: '第四轮结果', css: `${PROTO}\n${BASE}\n${REP_CSS}`, body, props: PROPS.theme(def), logic, h: 860 }) };
}

export function boards() {
  return [rulesBoard(), reportBoard()];
}

/** 规则文档：project/peck-rules.md（第三版），第 3 步做方案、第 4 步做 Design System 都照它。 */
export function rulesMd() {
  const tag = (n) => (n === 'new' ? '（第四轮补的）' : n === 'chg' ? '（第四轮改过）' : '');
  const g = GROUPS.map((x) => `## ${x.k} ${x.name}\n\n${x.rules.map(([id, t, n]) => `- **${id}** ${t}${tag(n)}`).join('\n')}`).join('\n\n');
  const dec = DECIDED.map(([a, b, c, r]) => `- **${a}**：${b}。${c}（${r.join('、')}）`).join('\n');
  const tiers = `| | ${TIER_COLS.join(' | ')} |\n| --- | ${TIER_COLS.map(() => '---').join(' | ')} |\n${TIERS.map(([k, n, xs]) => `| ${k}（${n}） | ${xs.join(' | ')} |`).join('\n')}`;
  const lock = LOCK.map(([n, sub, on]) => `| ${n} | ${on ? '锁' : '能用'} | ${on ? sub : ''} |`).join('\n');
  const eng = ENGINES.map(([k, c, how, pay]) => `| ${k} | ${c} | ${how} | ${pay} |`).join('\n');
  const t = TESTS.map((x) => `| ${x.k} ${x.nm} | ${x.used.join(' ')} | ${x.gap} | ${x.fix.join(' ')} |`).join('\n');
  const q = QUESTIONS.map(([b, p], i) => `${i + 1}. **${b}** ${p}`).join('\n');
  const pl = PLACE.map(([k, b, s]) => `| ${k} | ${b} | ${s} |`).join('\n');
  return `# Peck 外框规则 · 第三版

第 2 步第二轮从批准的小样里写出 49 条，第三轮落了权限三档等三件事、拿右栏新加的三个模块（ONE SHOT、FILES、TERM）做迁移测试，到 62 条。第四轮落了站主 11-10 回的三件事（单次请求挪进 ONE SHOT；ONE SHOT 用 API 和 CLI 都能答、能读项目不能改；模型在跑任务时终端锁着），再拿改到的地方只照规则画：补了 ${COUNT.nw} 条、改了 ${COUNT.chg} 条，共 ${COUNT.all} 条。第 3 步做方案、第 4 步做 Design System 都照这份；定稿后并进 Peck 方案的 \`DESIGN.md\`。

${g}

## 站主定的

第四轮（11-10 回的）：

${dec}

权限三档各自问什么（第三轮定的）：

${tiers}

终端什么时候锁：

| 任务走到哪 | 终端 | 说明 |
| --- | --- | --- |
${lock}

ONE SHOT 谁来答（都只读）：

| 谁来答 | 种类 | 怎么只读 | 算钱 |
| --- | --- | --- | --- |
${eng}

## 迁移测试（第四轮）

| 界面 | 用到的规则 | 不够的地方 | 补和改 |
| --- | --- | --- | --- |
${t}

## 要站主定

${q}

## 四个模块进 roadmap 的哪里（建议）

| 模块 | Phase | 说明 |
| --- | --- | --- |
${pl}

第 2 步收尾时，四个模块、权限三档、ONE SHOT 和终端锁一起写进 Peck 的 \`docs/design.md\` 和 \`docs/roadmap.md\`。
`;
}
