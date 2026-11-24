// 第 2 步 · 第三轮 · 规则板（第二版）、结果板；外加规则文档 peck-rules.md（第二版）。都从 rules.mjs 出。
import { board, PROPS, SANS, DOTS, FLIP } from '../s1c/kit.mjs';
import { CSS as PROTO } from '../s2/proto.mjs';
import { GROUPS, COUNT, DECIDED, TIERS, TIER_COLS, TESTS, QUESTIONS, PLACE } from './rules.mjs';

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
const RH = 1380;
const RULES_CSS = `
.pk.rb3{width:1760px;height:${RH}px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:18px}
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
  const card = (g) => `<div class="mod gc${g.k === 'R' ? ' nw' : ''}"><p class="gh"><span class="k">${g.k}</span><b>${g.name}</b><span>${g.en}</span>${g.k === 'R' ? '<em>这一轮新加的一组</em>' : ''}</p><ul class="gl">${g.rules.map(([id, t, n]) => `<li><span class="i">${id}</span><p>${t}</p>${n ? `<em class="tg2 ${n}">${n === 'new' ? 'NEW' : 'CHG'}</em>` : '<span></span>'}</li>`).join('')}</ul></div>`;
  const by = (k) => GROUPS.find((g) => g.k === k);
  const cards = [['L', 'M', 'R'], ['K', 'T', 'C', 'S'], ['I', 'A', 'W']].map((col) => `<div class="cc3">${col.map((k) => card(by(k))).join('')}</div>`).join('');
  const body = `<div class="{{root}}"><div class="ft"><h1>外框规则 · 第二版</h1><p>第二轮的 49 条，落了你定的三件事，又拿右栏三个新模块做迁移测试：补了 ${COUNT.nw} 条、改了 ${COUNT.chg} 条，共 ${COUNT.all} 条。</p>
    <p class="lg"><em class="tg2 new">NEW</em>这一轮补的<em class="tg2 chg">CHG</em>这一轮改的</p></div><div class="cols">${cards}</div></div>`;
  const logic = `renderVals() { const dark = (this.props.theme ?? '${def}') === '深色'; return { root: 'pk rb3 doc dots ' + (dark ? 'dk' : 'lt') }; }`;
  return { file: 'S2c-Rules.dc.html', w: 1760, h: RH, title: `外框规则 · 第二版 · ${COUNT.all} 条`, html: board({ title: '外框规则 · 第二版', css: `${PROTO}\n${BASE}\n${RULES_CSS}`, body, props: PROPS.theme(def), logic, w: 1760, h: RH }) };
}

// ---------- 结果板 ----------
const REP_CSS = `
.pk.rp3{width:1280px;height:860px;padding:26px 32px 28px;display:flex;flex-direction:column;gap:14px}
.r1{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px}
.box{padding:12px 16px 14px}
.box .ml{margin-bottom:8px}
.dc li{display:grid;grid-template-columns:110px minmax(0,1fr) auto;gap:10px;align-items:start;padding:6px 0;border-top:1px dotted var(--line2)}
.dc li:first-child{border-top:0}
.dc b{font-size:13px;font-weight:600}
.dc p{font-size:12.5px;line-height:1.55;color:var(--tx2)}
.dc p em{display:block;font-style:normal;${D};font-size:13px;letter-spacing:.06em;color:var(--cy-tx)}
.dc .ids{display:flex;gap:4px}
.tt3{width:100%;border-collapse:collapse;font-size:12.5px}
.tt3 th{text-align:left;font-weight:400;color:var(--tx3);font-size:12px;padding:0 6px 6px 0;white-space:nowrap}
.tt3 td{padding:6px 6px 6px 0;border-top:1px dotted var(--line2);color:var(--tx2);white-space:nowrap}
.tt3 td.k{${D};font-size:14px;letter-spacing:.08em;color:var(--tx)}
.tt3 td.k span{margin-left:8px;font-family:${SANS};font-weight:400;font-size:12px;letter-spacing:0;color:var(--tx3)}
.tt3 td.ask{color:var(--warn)}
.tt3 td.no{color:var(--tx3)}
.tests{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.tc{padding:11px 14px 12px;display:flex;flex-direction:column;gap:7px}
.tc .th{display:flex;align-items:baseline;gap:8px}
.tc .th b{${D};font-size:14px;letter-spacing:.08em;color:var(--cy-tx)}
.tc .th span{font-size:13px;font-weight:600}
.tc .rw{display:flex;flex-direction:column;gap:3px;font-size:12px;line-height:1.55;color:var(--tx2)}
.tc .rw > span:first-child{color:var(--tx3)}
.tc .ids{display:flex;flex-wrap:wrap;gap:4px}
.r3{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:14px}
.qs li{display:grid;grid-template-columns:22px 150px minmax(0,1fr);gap:10px;align-items:start;padding:7px 0;border-top:1px dotted var(--line2)}
.qs li:first-child{border-top:0}
.qs .n{${D};font-size:18px;color:var(--warn)}
.qs b{font-size:13px;font-weight:600}
.qs p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.pl li{display:grid;grid-template-columns:90px minmax(0,1fr);gap:8px;align-items:baseline;padding:7px 0;border-top:1px dotted var(--line2)}
.pl li:first-child{border-top:0}
.pl .k{${D};font-size:13px;letter-spacing:.08em;color:var(--tx)}
.pl b{font-size:12.5px;font-weight:600}
.pl span{margin-left:8px;font-size:12px;color:var(--tx3)}
.pl .nt{margin-top:8px;font-size:12px;line-height:1.55;color:var(--tx3)}
`;
function reportBoard() {
  const def = FLIP ? '浅色' : '深色';
  const ids = (arr, nw) => arr.map((i) => `<em class="tg2 ${nw ? 'idn' : 'id'}">${i}</em>`).join('');
  const dec = DECIDED.map(([a, b, c, r]) => `<li><b>${a}</b><p><em>${b}</em>${c}</p><span class="ids">${ids(r, true)}</span></li>`).join('');
  const cell = (x) => `<td class="${x === '一次批' ? 'ask' : x === '不改' || x === '不跑' || x === '—' ? 'no' : ''}">${x}</td>`;
  const tiers = `<table class="tt3"><tr><th></th>${TIER_COLS.map((c) => `<th>${c}</th>`).join('')}</tr>${TIERS.map(([k, n, xs]) => `<tr><td class="k">${k}<span>${n}</span></td>${xs.map(cell).join('')}</tr>`).join('')}</table>`;
  const tests = TESTS.map((t) => `<div class="mod tc"><p class="th"><b>${t.k}</b><span>${t.nm}</span></p>
    <div class="rw"><span>用到</span><div class="ids">${ids(t.used)}</div></div>
    <div class="rw"><span>不够</span><span>${t.gap}</span></div>
    <div class="rw"><span>补和改</span><div class="ids">${ids(t.fix, true)}</div></div></div>`).join('');
  const qs = QUESTIONS.map(([b, p], i) => `<li><span class="n">${i + 1}</span><b>${b}</b><p>${p}</p></li>`).join('');
  const pl = PLACE.map(([k, b, s]) => `<li><span class="k">${k}</span><div><b>${b}</b><span>${s}</span></div></li>`).join('');
  const body = `<div class="{{root}}"><div class="ft"><h1>第三轮结果</h1><p>你定的三件事落进了规则；右栏加了三个模块，只照规则画，不够的地方补进规则板（NEW / CHG）。</p></div>
    <div class="r1"><div class="mod box"><p class="ml"><span class="l">DECIDED</span><span class="r">你 11-10 定的</span></p><ul class="dc">${dec}</ul></div>
      <div class="mod box"><p class="ml"><span class="l">ACCESS</span><span class="r">三档各问什么</span></p>${tiers}</div></div>
    <div class="tests">${tests}</div>
    <div class="r3"><div class="mod box qs wait"><p class="ml"><span class="l">QUESTIONS</span><span class="r">要你定</span></p><ul>${qs}</ul></div>
      <div class="mod box pl"><p class="ml"><span class="l">ROADMAP</span><span class="r">放进哪个 Phase</span></p><ul>${pl}</ul><p class="nt">这是我的建议。第 2 步收尾时，四个模块和权限三档一起写进 design.md 和 roadmap。</p></div></div></div>`;
  const logic = `renderVals() { const dark = (this.props.theme ?? '${def}') === '深色'; return { root: 'pk rp3 doc dots ' + (dark ? 'dk' : 'lt') }; }`;
  return { file: 'S2c-Report.dc.html', h: 860, title: '第三轮结果 · 要你定的 3 件事', html: board({ title: '第三轮结果', css: `${PROTO}\n${BASE}\n${REP_CSS}`, body, props: PROPS.theme(def), logic, h: 860 }) };
}

export function boards() {
  return [rulesBoard(), reportBoard()];
}

/** 规则文档：project/peck-rules.md（第二版），第 3 步做方案、第 4 步做 Design System 都照它。 */
export function rulesMd() {
  const tag = (n) => (n === 'new' ? '（第三轮补的）' : n === 'chg' ? '（第三轮改过）' : '');
  const g = GROUPS.map((x) => `## ${x.k} ${x.name}\n\n${x.rules.map(([id, t, n]) => `- **${id}** ${t}${tag(n)}`).join('\n')}`).join('\n\n');
  const dec = DECIDED.map(([a, b, c, r]) => `- **${a}**：${b}。${c}（${r.join('、')}）`).join('\n');
  const tiers = `| | ${TIER_COLS.join(' | ')} |\n| --- | ${TIER_COLS.map(() => '---').join(' | ')} |\n${TIERS.map(([k, n, xs]) => `| ${k}（${n}） | ${xs.join(' | ')} |`).join('\n')}`;
  const t = TESTS.map((x) => `| ${x.k} ${x.nm} | ${x.used.join(' ')} | ${x.gap} | ${x.fix.join(' ')} |`).join('\n');
  const q = QUESTIONS.map(([b, p], i) => `${i + 1}. **${b}** ${p}`).join('\n');
  const pl = PLACE.map(([k, b, s]) => `| ${k} | ${b} | ${s} |`).join('\n');
  return `# Peck 外框规则 · 第二版

第 2 步第二轮从批准的小样里写出 49 条，又拿没画过的界面（设置、API 模式、空 / 加载 / 出错、额度与花费的外框）做了迁移测试。第三轮落了站主 11-10 定的三件事，再拿右栏新加的三个模块（ONE SHOT、FILES、TERM）只照规则画：补了 ${COUNT.nw} 条、改了 ${COUNT.chg} 条，共 ${COUNT.all} 条。第 3 步做方案、第 4 步做 Design System 都照这份；定稿后并进 Peck 方案的 \`DESIGN.md\`。

${g}

## 站主定的

${dec}

权限三档各自问什么：

${tiers}

## 迁移测试（第三轮）

| 界面 | 用到的规则 | 不够的地方 | 补和改 |
| --- | --- | --- | --- |
${t}

## 要站主定

${q}

## 四个模块进 roadmap 的哪里（建议）

| 模块 | Phase | 说明 |
| --- | --- | --- |
${pl}

第 2 步收尾时，四个模块和权限三档一起写进 Peck 的 \`docs/design.md\` 和 \`docs/roadmap.md\`。
`;
}
