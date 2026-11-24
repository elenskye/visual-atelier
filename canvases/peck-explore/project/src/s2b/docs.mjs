// 第 2 步 · 第二轮 · 规则板、外框解剖、迁移测试结果；外加一份规则文档 peck-rules.md。都从 rules.mjs 出。
import { board, PROPS, SANS, DOTS, FLIP } from '../s1c/kit.mjs';
import { CSS as PROTO, template, V, FRAMES } from '../s2/proto.mjs';
import { GROUPS, RULES, COUNT, TESTS, QUESTIONS } from './rules.mjs';

const D = `font-family:${DOTS};font-weight:900`;
const BASE = `
.doc{font-family:${SANS};color:var(--tx)}
.ft{display:flex;align-items:baseline;gap:18px}
.ft h1{font-size:22px;font-weight:600}
.ft p{font-size:13px;color:var(--tx2)}
.tg2{display:inline-flex;align-items:center;height:18px;padding:0 5px;${D};font-size:12px;letter-spacing:.06em;clip-path:var(--notch);white-space:nowrap}
.tg2.new{background:var(--ok);color:var(--bg)}
.tg2.chg{background:var(--warn);color:var(--bg)}
.tg2.id{background:var(--raise);color:var(--tx2)}
.tg2.idn{background:var(--ok-soft);color:var(--ok);box-shadow:inset 0 0 0 1px var(--ok)}
`;

// ---------- 规则板 ----------
const RULES_CSS = `
.pk.rb2{width:1760px;height:1080px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:18px}
.ft .lg{margin-left:auto;display:flex;gap:14px;align-items:center;font-size:12.5px;color:var(--tx2);white-space:nowrap}
.cols{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;min-height:0}
.cc3{display:flex;flex-direction:column;gap:18px;min-width:0}
.gc{padding:14px 18px 12px}
.gh{display:flex;align-items:baseline;gap:10px;margin-bottom:8px}
.gh .k{${D};font-size:26px;line-height:1;color:var(--cy-tx);text-shadow:var(--dglow)}
.gh b{font-size:16px;font-weight:600}
.gh span{${D};font-size:13px;letter-spacing:.1em;color:var(--tx3)}
.gl li{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:8px;align-items:start;padding:5px 0;border-top:1px dotted var(--line2)}
.gl li .i{${D};font-size:14px;color:var(--tx2);padding-top:1px}
.gl li p{font-size:12.5px;line-height:1.6;color:var(--tx)}
`;
function rulesBoard() {
  const def = FLIP ? '浅色' : '深色';
  const card = (g) => `<div class="mod gc"><p class="gh"><span class="k">${g.k}</span><b>${g.name}</b><span>${g.en}</span></p><ul class="gl">${g.rules.map(([id, t, n]) => `<li><span class="i">${id}</span><p>${t}</p>${n ? `<em class="tg2 ${n}">${n === 'new' ? 'NEW' : 'CHG'}</em>` : '<span></span>'}</li>`).join('')}</ul></div>`;
  const by = (k) => GROUPS.find((g) => g.k === k);
  const cards = [['L', 'M', 'S'], ['K', 'T', 'C'], ['I', 'A', 'W']].map((col) => `<div class="cc3">${col.map((k) => card(by(k))).join('')}</div>`).join('');
  const body = `<div class="{{root}}"><div class="ft"><h1>外框规则 · 第一版</h1><p>从第一轮批准的小样里写出来，共 ${COUNT.all} 条。又拿 4 个没画过的界面只照它画，补了 ${COUNT.nw} 条、改了 ${COUNT.chg} 条。</p>
    <p class="lg"><em class="tg2 new">NEW</em>迁移测试补的<em class="tg2 chg">CHG</em>迁移测试改过的</p></div><div class="cols">${cards}</div></div>`;
  const logic = `renderVals() { const dark = (this.props.theme ?? '${def}') === '深色'; return { root: 'pk rb2 doc dots ' + (dark ? 'dk' : 'lt') }; }`;
  return { file: 'S2b-Rules.dc.html', w: 1760, h: 1080, title: `外框规则 · ${COUNT.all} 条`, html: board({ title: '外框规则', css: `${PROTO}\n${BASE}\n${RULES_CSS}`, body, props: PROPS.theme(def), logic, w: 1760, h: 1080 }) };
}

// ---------- 外框解剖：第一轮小样停在「停下来问你」，标上对应的规则 ----------
const S = 0.78;
const MARKS = [
  [1, 560, 44, ['L3', 'W1'], '顶栏：品牌、项目、模式、设置；迁移测试加了额度入口（L3），RESET 只是小样里演示用'],
  [2, 304, 300, ['L2', 'L4', 'T1'], '左栏：项目和任务，每个项目带最近几次任务'],
  [3, 40, 90, ['M1', 'M2', 'T4'], '模块两层、切台阶；头上写 [ LABEL ]'],
  [4, 296, 214, ['C2', 'W4'], '在等你的任务标琥珀，写「等你回答」'],
  [5, 893, 136, ['M3'], '等你时这块描琥珀边，同一时刻只有它一块彩边'],
  [6, 690, 200, ['T4', 'C2'], '计时大字 54，等你时变琥珀'],
  [7, 893, 258, ['K5', 'A1'], '方块进度，头一格变琥珀'],
  [8, 338, 374, ['A2', 'T1'], '步骤名用像素字；在跑那一步才弹'],
  [9, 338, 418, ['T3'], '输出、命令、文件名用 Departure Mono'],
  [10, 893, 506, ['L5', 'M5', 'I3'], '问你的卡片占住输入位，边一格格点亮'],
  [11, 530, 582, ['K3', 'W1'], 'PICK 标签、选中的那行都切台阶'],
  [12, 893, 742, ['K1'], '同一时刻只有一个青色主按钮'],
  [13, 1246, 290, ['C2', 'T3'], '改动：新增绿、删除红，文件名用代码字'],
  [14, 1246, 440, ['M4'], 'Diff 直接放在模块里，用点线分开，不再套卡'],
  [15, 304, 600, ['W5', 'I4'], '这个任务的记录：时间用 Doto'],
];
const ANAT_CSS = `
.pk.an{width:1760px;height:1000px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:20px}
.ab{flex:1;display:grid;grid-template-columns:${Math.round(1280 * S)}px minmax(0,1fr);gap:36px;min-height:0}
.af{position:relative;width:${Math.round(1280 * S)}px;height:${Math.round(800 * S)}px;box-shadow:0 0 0 1px var(--line2)}
.af > .pk{position:absolute;left:0;top:0;transform:scale(${S});transform-origin:0 0}
.mk2{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;display:flex;align-items:center;justify-content:center;${D};font-size:14px;color:#02101A;background:#FFB86B;clip-path:var(--clip2);z-index:3;box-shadow:0 0 0 2px #050816}
.lg3{display:flex;flex-direction:column;gap:6px;min-height:0}
.lg3 li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;align-items:start;padding:5px 0;border-top:1px dotted var(--line2)}
.lg3 .n{width:24px;height:24px;display:flex;align-items:center;justify-content:center;${D};font-size:13px;color:#02101A;background:#FFB86B;clip-path:var(--clip2)}
.lg3 p{font-size:12.5px;line-height:1.55;color:var(--tx)}
.lg3 .ids{display:flex;gap:4px;margin-top:3px}
.an .still *{animation:none!important}
`;
function anatomyBoard() {
  const def = FLIP ? '浅色' : '深色';
  const marks = MARKS.map(([n, x, y]) => `<span class="mk2" style="left:${Math.round(x * S)}px;top:${Math.round(y * S)}px">${n}</span>`).join('');
  const legend = MARKS.map(([n, , , ids, t]) => `<li><span class="n">${n}</span><div><p>${t}</p><p class="ids">${ids.map((i) => `<em class="tg2 id">${i}</em>`).join('')}</p></div></li>`).join('');
  const body = `<div class="{{root}}"><div class="ft"><h1>外框解剖</h1><p>第一轮批准的小样停在「停下来问你」，标上每一处对应的规则。</p></div>
    <div class="ab"><div class="af" data-nolint="">${template('a.')}${marks}</div><ul class="lg3">${legend}</ul></div></div>`;
  const H = ['type', 'send', 'pw0', 'pw1', 'pw2', 'pw3', 'pa0', 'pa1', 'pa2', 'newTask', 'pp0', 'pp1', 'pp2', 'allow', 'deny', 'scope', 'po0', 'po1', 'po2', 'submit', 'later', 'busy', 'stop', 'again', 'undo', 'cancelUndo', 'doUndo', 'reset', 'api', 'gear'];
  const logic = `renderVals() {
    const V = ${V.toString()};
    const dark = (this.props.theme ?? '${def}') === '深色';
    const a = V(Object.assign({ still: true, perm: [true, true, false], ts: [], ans: -1, permN: 0, permTxt: '' }, ${JSON.stringify(FRAMES[4].s)}), dark);
    ${JSON.stringify(H)}.forEach((k) => { a[k] = () => {}; });
    return { root: 'pk an doc dots ' + (dark ? 'dk' : 'lt'), a };
  }`;
  return { file: 'S2b-Anatomy.dc.html', w: 1760, h: 1000, title: '外框解剖 · 小样上标出规则', html: board({ title: '外框解剖', css: `${PROTO}\n${BASE}\n${ANAT_CSS}`, body, props: PROPS.theme(def), logic, w: 1760, h: 1000 }) };
}

// ---------- 迁移测试结果 ----------
const REP_CSS = `
.pk.rp{width:1280px;height:800px;padding:28px 34px 30px;display:flex;flex-direction:column;gap:16px}
.nums{display:flex;gap:28px}
.nums div{display:flex;flex-direction:column;gap:2px}
.nums b{${D};font-size:40px;line-height:1;color:var(--cy-tx);text-shadow:var(--tglow)}
.nums span{font-size:12.5px;color:var(--tx2)}
.tests{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.tc{padding:12px 16px 14px;display:flex;flex-direction:column;gap:8px}
.tc .th{display:flex;align-items:baseline;gap:10px}
.tc .th b{${D};font-size:15px;letter-spacing:.08em;color:var(--cy-tx)}
.tc .th span{font-size:15px;font-weight:600}
.tc .rw{display:grid;grid-template-columns:48px minmax(0,1fr);gap:8px;align-items:start;font-size:12.5px;line-height:1.55;color:var(--tx2)}
.tc .rw > span:first-child{color:var(--tx3);padding-top:1px}
.tc .ids{display:flex;flex-wrap:wrap;gap:4px}
.qs{padding:12px 16px 14px;flex:1;min-height:0}
.qs li{display:grid;grid-template-columns:28px 150px minmax(0,1fr);gap:10px;align-items:start;padding:7px 0;border-top:1px dotted var(--line2)}
.qs li:first-child{border-top:0}
.qs .n{${D};font-size:18px;color:var(--warn)}
.qs b{font-size:13.5px;font-weight:600}
.qs p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.qn{font-size:12.5px;line-height:1.6;color:var(--tx2)}
`;
function reportBoard() {
  const def = FLIP ? '浅色' : '深色';
  const ids = (arr, nw) => arr.map((i) => `<em class="tg2 ${nw ? 'idn' : 'id'}">${i}</em>`).join('');
  const tests = TESTS.map((t) => `<div class="mod tc"><p class="th"><b>${t.k}</b><span>${t.nm}</span></p>
    <div class="rw"><span>用到</span><div class="ids">${ids(t.used)}</div></div>
    <div class="rw"><span>不够</span><span>${t.gap}</span></div>
    <div class="rw"><span>补和改</span><div class="ids">${ids(t.fix, true)}</div></div></div>`).join('');
  const qs = QUESTIONS.map(([b, p], i) => `<li><span class="n">${i + 1}</span><b>${b}</b><p>${p}</p></li>`).join('');
  const body = `<div class="{{root}}"><div class="ft"><h1>迁移测试结果</h1><p>4 个没画过的界面，只照规则画。规则不够用的地方，补进规则板（标 NEW / CHG）。</p></div>
    <div class="nums"><div><b>${COUNT.all}</b><span>条规则</span></div><div><b>4</b><span>个界面</span></div><div><b>${COUNT.nw}</b><span>条补上的</span></div><div><b>${COUNT.chg}</b><span>条改过的</span></div><div><b>${QUESTIONS.length}</b><span>件要你定</span></div></div>
    <div class="tests">${tests}</div>
    <div class="mod qs wait"><p class="ml"><span class="l">QUESTIONS</span><span class="r">要你定</span></p><ul>${qs}</ul>
      <p class="qn">另外：额度与花费这一页的内容是 Peck 自己的作业（roadmap Phase 8），这一轮只画了入口、外框和空状态，没替它设计内容。</p></div></div>`;
  const logic = `renderVals() { const dark = (this.props.theme ?? '${def}') === '深色'; return { root: 'pk rp doc dots ' + (dark ? 'dk' : 'lt') }; }`;
  return { file: 'S2b-Report.dc.html', title: '迁移测试结果 · 要你定的 3 件事', html: board({ title: '迁移测试结果', css: `${PROTO}\n${BASE}\n${REP_CSS}`, body, props: PROPS.theme(def), logic }) };
}

export function boards() {
  return [rulesBoard(), anatomyBoard(), reportBoard()];
}

/** 规则文档：project/peck-rules.md，第 3 步做方案、第 4 步做 Design System 都照它。 */
export function rulesMd() {
  const g = GROUPS.map((x) => `## ${x.k} ${x.name}\n\n${x.rules.map(([id, t, n]) => `- **${id}** ${t}${n === 'new' ? '（迁移测试补的）' : n === 'chg' ? '（迁移测试改过）' : ''}`).join('\n')}`).join('\n\n');
  const t = TESTS.map((x) => `| ${x.nm} | ${x.used.join(' ')} | ${x.gap} | ${x.fix.join(' ')} |`).join('\n');
  const q = QUESTIONS.map(([b, p], i) => `${i + 1}. **${b}**：${p}`).join('\n');
  return `# Peck 外框规则 · 第一版

第 2 步第二轮写的：从第一轮批准的能点的小样里写出来，共 ${COUNT.all} 条；再拿没画过的界面（设置、API 模式、空、加载、出错、额度与花费的外框）只照规则画，补了 ${COUNT.nw} 条、改了 ${COUNT.chg} 条。第 3 步做方案、第 4 步做 Design System 都照这份；定稿后并进 Peck 方案的 \`DESIGN.md\`。

${g}

## 迁移测试

| 界面 | 用到的规则 | 不够的地方 | 补和改 |
| --- | --- | --- | --- |
${t}

额度与花费这一页的内容是 Peck 自己的作业（roadmap Phase 8），这一轮只画入口、外框和空状态。

## 要站主定

${q}
`;
}
