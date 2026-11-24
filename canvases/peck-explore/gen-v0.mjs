// Peck Explore 的生成器：从 schemes/peck/tokens/ 取颜色和字号，写 project/*.dc.html 和 canvas.json（不手改 project/）。
// 在仓库根目录：node canvases/peck-explore/gen.mjs
import path from 'node:path';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fromRoot } from '../_lib/root.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'project');
const color = JSON.parse(readFileSync(fromRoot('schemes/peck/tokens/color.json'), 'utf8'));
const scale = JSON.parse(readFileSync(fromRoot('schemes/peck/tokens/scale.json'), 'utf8'));
const motion = JSON.parse(readFileSync(fromRoot('schemes/peck/tokens/motion.json'), 'utf8'));

const W = 1280, H = 800;
const FONTS = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap';

// ---------- token → CSS ----------
const vars = (mode) => Object.entries(color.roles).map(([k, v]) => `--color-${k}:${v[mode]}`).join(';');
const CSS = `
body{margin:0}
.peck{position:relative;overflow:hidden;box-sizing:border-box;font-family:${scale.font.sans};font-size:${scale.text.body};line-height:${scale.leading.body};color:var(--color-text);background:var(--color-page);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
.peck *{box-sizing:border-box}
.peck[data-theme="dark"]{${vars('dark')};--shadow-card:${scale.shadow.card.dark};--shadow-sheet:${scale.shadow.sheet.dark};--glow:${scale.shadow.glow.dark};color-scheme:dark}
.peck[data-theme="light"]{${vars('light')};--shadow-card:${scale.shadow.card.light};--shadow-sheet:${scale.shadow.sheet.light};--glow:${scale.shadow.glow.light};color-scheme:light}
.peck{--color-accent:var(--accent)}
.peck[data-theme="dark"]{--color-accent-text:var(--accent);--color-accent-line:var(--accent)}
.peck[data-mood="quiet"]{--glow:0 0 0 0 transparent}
.peck[data-mood="quiet"] .shine{display:none}
.mono{font-family:${scale.font.mono};font-size:${scale.text.mono}}
.muted{color:var(--color-muted)}.faint{color:var(--color-faint)}
.small{font-size:${scale.text.small}}.caption{font-size:${scale.text.caption}}
.h-title{font-size:${scale.text.title};font-weight:600;line-height:${scale.leading.tight}}
.h-page{font-size:${scale.text['page-title']};font-weight:600;line-height:${scale.leading.tight}}
.h-display{font-size:${scale.text.display};font-weight:600;line-height:${scale.leading.tight}}
/* 外壳 */
.titlebar{height:44px;display:flex;align-items:center;gap:12px;padding:0 14px 0 12px;background:var(--color-panel);border-bottom:1px solid var(--color-line);position:relative}
.shine{position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,var(--color-accent) 30%,var(--color-accent) 45%,transparent 70%);opacity:.55}
.lights{display:flex;gap:8px;margin-right:8px}.lights i{width:12px;height:12px;border-radius:50%;background:var(--color-line-strong);display:block}
.cols{display:flex;height:${H - 44}px}
.col{display:flex;flex-direction:column;min-width:0;background:var(--color-panel)}
.col+.col{border-left:1px solid var(--color-line)}
.col-side{width:${scale.width.sidebar}}.col-main{flex:1 1 0;background:var(--color-page)}.col-changes{width:${scale.width.changes}}
.colhead{height:44px;display:flex;align-items:center;gap:8px;padding:0 14px;border-bottom:1px solid var(--color-line);flex:none}
.pill{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:${scale.radius.pill};border:1px solid var(--color-line);background:var(--color-card);font-size:${scale.text.small};color:var(--color-text);white-space:nowrap}
.pill.ghost{background:transparent}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 14px;border-radius:${scale.radius.sm};border:1px solid var(--color-line);background:var(--color-card);font-size:${scale.text.small};font-weight:500;color:var(--color-text);white-space:nowrap}
.btn.primary{background:var(--color-accent);border-color:transparent;color:var(--color-on-accent);box-shadow:var(--glow)}
.btn.danger{color:var(--color-danger);border-color:var(--color-danger)}
.btn.quiet{color:var(--color-muted)}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex:none}
.dot.muse{background:var(--color-muse)}.dot.grok{background:var(--color-grok)}.dot.api{background:var(--color-api)}
.dot.run{background:var(--color-accent);box-shadow:var(--glow)}
.who{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.who .arrow{color:var(--color-faint);margin:0 1px}
/* 左栏任务 */
.task{display:flex;gap:10px;padding:10px 14px;border-bottom:1px solid var(--color-line);align-items:flex-start}
.task.on{background:var(--color-accent-soft)}
.task .st{width:16px;height:16px;border-radius:50%;flex:none;margin-top:3px;display:flex;align-items:center;justify-content:center}
.st.run{border:2px solid var(--color-accent);box-shadow:var(--glow)}.st.run i{width:6px;height:6px;border-radius:50%;background:var(--color-accent);display:block}
.st.ok{background:var(--color-success)}.st.bad{background:var(--color-danger)}.st.todo{border:1.5px solid var(--color-line-strong)}
.task .t{min-width:0}.task .t p{margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* 中栏 */
.chat{flex:1 1 0;overflow:hidden;padding:20px 24px 0;display:flex;flex-direction:column;gap:14px}
.me{align-self:flex-end;max-width:70%;background:var(--color-accent-soft);border:1px solid var(--color-line);border-radius:${scale.radius.lg} ${scale.radius.lg} 4px ${scale.radius.lg};padding:10px 14px}
.steps{position:relative;padding-left:22px}
.steps:before{content:"";position:absolute;left:7px;top:10px;bottom:10px;width:1px;background:var(--color-line-strong)}
.step{position:relative;padding:6px 0 6px 0}
.step .st{position:absolute;left:-22px;top:9px;width:16px;height:16px;border-radius:50%;background:var(--color-page);display:flex;align-items:center;justify-content:center}
.step .st.ok{background:var(--color-success)}.step .st.run{border:2px solid var(--color-accent);box-shadow:var(--glow);background:var(--color-page)}.step .st.run i{width:6px;height:6px;border-radius:50%;background:var(--color-accent);display:block}.step .st.todo{border:1.5px solid var(--color-line-strong)}
.step .line{display:flex;align-items:center;gap:8px;min-width:0}
.step .line b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.step .sub{margin:2px 0 0;color:var(--color-muted);font-size:${scale.text.small}}
.out{margin-top:8px;background:var(--color-code);border:1px solid var(--color-line);border-radius:${scale.radius.md};padding:10px 12px;color:var(--color-muted);white-space:pre;overflow:hidden;line-height:1.7}
.out .ok{color:var(--color-success)}.out .hl{color:var(--color-text)}
.card{background:var(--color-card);border:1px solid var(--color-line);border-radius:${scale.radius.lg};box-shadow:var(--shadow-card);padding:16px 18px;position:relative;overflow:hidden}
.card .shine{top:0;height:2px;opacity:.9}
.composer{flex:none;margin:12px 24px 20px;background:var(--color-card);border:1px solid var(--color-line);border-radius:${scale.radius.lg};box-shadow:var(--shadow-card)}
.composer.on{border-color:var(--color-accent-line);box-shadow:var(--glow)}
.composer .in{padding:12px 14px 6px;color:var(--color-faint);min-height:52px}
.composer .row{display:flex;align-items:center;gap:8px;padding:8px 10px 10px;border-top:1px solid var(--color-line)}
.composer .row .sp{flex:1}
.kbd{font-family:${scale.font.mono};font-size:11px;color:var(--color-faint);border:1px solid var(--color-line);border-radius:4px;padding:1px 5px}
/* 右栏改动 */
.file{display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid var(--color-line)}
.file .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.file .pm{white-space:nowrap}.pm .a{color:var(--color-success)}.pm .d{color:var(--color-danger);margin-left:6px}
.tag{font-size:11px;padding:1px 6px;border-radius:4px;border:1px solid currentColor;line-height:1.4}
.tag.new{color:var(--color-success)}.tag.del{color:var(--color-danger)}
.diff{margin:12px 14px 0;background:var(--color-code);border:1px solid var(--color-line);border-radius:${scale.radius.md};overflow:hidden}
.diff .hd{padding:6px 10px;border-bottom:1px solid var(--color-line);color:var(--color-muted);display:flex;gap:8px}
.diff .ln{display:flex;line-height:1.6;white-space:pre}
.diff .ln i{width:34px;flex:none;text-align:right;padding-right:8px;color:var(--color-faint);font-style:normal}
.diff .ln span{padding-left:8px;flex:1}
.diff .add{background:var(--color-diff-add)}.diff .add span{color:var(--color-success)}
.diff .del{background:var(--color-diff-del)}.diff .del span{color:var(--color-danger)}
/* 卡片 */
.ask{width:460px;background:var(--color-card);border:1px solid var(--color-warning);border-radius:${scale.radius.lg};box-shadow:var(--shadow-sheet);padding:16px 18px}
.ask.red{border-color:var(--color-danger)}
.ask .hd{display:flex;align-items:center;gap:8px;color:var(--color-warning);font-weight:500;font-size:${scale.text.small}}
.ask.red .hd{color:var(--color-danger)}
.ask h3{margin:8px 0 0;font-size:${scale.text.title};font-weight:600;line-height:1.4}
.ask .opts{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.input{height:34px;border:1px solid var(--color-line);border-radius:${scale.radius.sm};background:var(--color-raised);padding:0 10px;display:flex;align-items:center;color:var(--color-faint);font-size:${scale.text.small}}
.input.on{border-color:var(--color-accent-line);box-shadow:var(--glow);color:var(--color-text)}
/* 开关 */
.sw{width:34px;height:20px;border-radius:999px;background:var(--color-line-strong);position:relative;flex:none}
.sw i{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;display:block}
.sw.on{background:var(--color-accent)}.sw.on i{left:16px}
.sw.on{box-shadow:var(--glow)}
.seg{display:inline-flex;border:1px solid var(--color-line);border-radius:${scale.radius.sm};overflow:hidden}
.seg span{padding:5px 12px;font-size:${scale.text.small};color:var(--color-muted)}
.seg span.on{background:var(--color-accent-soft);color:var(--color-accent-text);font-weight:500}
`;

// ---------- 小零件 ----------
const svg = (d, size = 16, extra = '') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const I = {
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  back: svg('<path d="m15 18-6-6 6-6"/>'),
  down: svg('<path d="m6 9 6 6 6-6"/>', 14),
  check: svg('<path d="m5 12 4 4L19 7"/>', 10, 'stroke-width="3"'),
  x: svg('<path d="M18 6 6 18M6 6l12 12"/>', 10, 'stroke-width="3"'),
  folder: svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  undo: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', 14),
  bird: (s = 18) => svg('<path d="M14 4a5 5 0 0 0-5 5v3l-5 2 5 1v2a4 4 0 0 0 4 4h1V9"/><path d="M14 9h6l-6 2"/><circle cx="12.5" cy="8" r=".8" fill="currentColor"/>', s),
  help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5"/><path d="M12 17h.01"/>', 14),
  key: svg('<circle cx="8" cy="15" r="4"/><path d="m10.9 12.1 9.1-9.1M16 7l3 3M13 10l3 3"/>'),
  alert: svg('<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/>'),
};
const st = (k, inner = '') => `<span class="st ${k}">${k === 'ok' ? I.check : k === 'bad' ? I.x : k === 'run' ? '<i></i>' : inner}</span>`;
const who = (parts) => `<span class="who">${parts.map((p, i) => `${i ? '<span class="arrow">→</span>' : ''}<span class="dot ${p.toLowerCase().replace(/[^a-z]/g, '')}"></span>${p}`).join('')}</span>`;
const whoOf = (s) => who(s.split('→').map((x) => x.trim()));
const pm = (a, d) => `<span class="pm mono"><span class="a">+${a}</span><span class="d">−${d}</span></span>`;

// ---------- 外壳 ----------
function titlebar({ project = 'weather-cli', branch = 'main', mode = 'CLI 模式', home = false } = {}) {
  return `<div class="titlebar"><div class="shine"></div><div class="lights"><i></i><i></i><i></i></div>
  ${home ? `<span class="h-title" style="display:inline-flex;align-items:center;gap:8px"><span style="color:var(--color-accent-text)">${I.bird(20)}</span>Peck</span>`
    : `<span style="display:inline-flex;align-items:center;gap:8px;min-width:0"><span class="muted">${I.back}</span><b style="font-weight:600">${project}</b><span class="mono faint">${branch}</span></span>
  <span class="pill ghost" style="margin-left:4px">${mode}</span>`}
  <span style="flex:1"></span>
  <span class="muted">${I.gear}</span></div>`;
}

const TASKS = [
  { k: 'run', t: '把设置里三个对话框合成一个面板', w: 'Muse → Grok', m: '在跑 · 2 分 14 秒', on: true },
  { k: 'ok', t: '给首页加项目列表，带最近三次任务', w: 'Grok', m: '今天 09:12 · +118 −40' },
  { k: 'ok', t: '修 Diff 里中文文件名乱码', w: 'Muse', m: '昨天 · +6 −2' },
  { k: 'bad', t: '升级 Tailwind 到 4.1', w: 'DeepSeek', m: '11-06 · 失败，已撤销' },
  { k: 'ok', t: '初始化 Tauri 工程', w: 'Muse → Grok', m: '11-05 · +2,140 −0' },
];
function sideTasks(doneFirst) {
  const list = doneFirst ? [{ ...TASKS[0], k: 'ok', m: '14:06 · +86 −132' }, ...TASKS.slice(1)] : TASKS;
  return `<div class="col col-side"><div class="colhead"><b style="font-weight:600">任务</b><span class="faint small">${list.length} 次</span><span style="flex:1"></span><span class="muted">${I.plus}</span></div>
  <div style="overflow:hidden">${list.map((t) => `<div class="task${t.on ? ' on' : ''}">${st(t.k)}<div class="t"><p>${t.t}</p><p class="small muted" style="display:flex;gap:8px;margin-top:2px">${whoOf(t.w)}<span class="faint" style="overflow:hidden;text-overflow:ellipsis">${t.m}</span></p></div></div>`).join('')}</div>
  <div style="margin-top:auto;padding:12px 14px;border-top:1px solid var(--color-line)" class="small muted">同一个项目一次跑一个；别的项目可以同时跑。</div></div>`;
}

const FILES = [
  { n: 'src/components/settings/SettingsSheet.tsx', a: 74, d: 0, tag: 'new' },
  { n: 'src/components/chat/Composer.tsx', a: 9, d: 21 },
  { n: 'src/App.tsx', a: 3, d: 18 },
  { n: 'src/components/settings/AgentsDialog.tsx', a: 0, d: 93, tag: 'del' },
];
function changes({ done = false } = {}) {
  return `<div class="col col-changes"><div class="colhead"><b style="font-weight:600">改动</b><span class="faint small">4 个文件 · ${pm(86, 132)}</span><span style="flex:1"></span>
  <span class="btn ${done ? 'danger' : 'quiet'}" style="height:28px;padding:0 10px">${I.undo}撤销整个任务</span></div>
  <div>${FILES.map((f) => `<div class="file"><span class="nm mono">${f.n}</span>${f.tag ? `<span class="tag ${f.tag}">${f.tag === 'new' ? '新' : '删'}</span>` : ''}${pm(f.a, f.d)}</div>`).join('')}</div>
  <div class="diff mono" data-nolint><div class="hd"><span>src/components/chat/Composer.tsx</span><span style="flex:1"></span>${pm(9, 21)}</div>
  ${[['', 41, '  const [who, setWho] = useState(agents[0]);'], ['del', 42, '  const [agentsOpen, setAgentsOpen] = useState(false);'], ['del', 43, '  const [apiOpen, setApiOpen] = useState(false);'], ['add', 42, '  const [settingsOpen, setSettingsOpen] = useState(false);'], ['', 43, ''], ['del', 58, '      <button onClick={() => setAgentsOpen(true)}>Agent 设置</button>'], ['del', 59, '      <button onClick={() => setApiOpen(true)}>API 工作台</button>'], ['add', 58, '      <WhoPicker value={who} onChange={setWho} />'], ['add', 59, '      <PermissionPicker value={perm} onChange={setPerm} />'], ['', 60, '      <button className="primary" onClick={start}>开始</button>']].map(([k, n, s]) => `<div class="ln ${k}"><i>${n}</i><span>${k === 'add' ? '+' : k === 'del' ? '−' : ' '}${s.replace(/</g, '&lt;')}</span></div>`).join('')}</div>
  <div style="margin-top:auto;padding:12px 14px;border-top:1px solid var(--color-line)" class="small muted">任务前快照 · 14:02 · 撤销就回到这里，你的 Git 不动。</div></div>`;
}

const STEPS_RUNNING = `
<div class="step">${st('ok')}<div class="line"><b>Muse 写规范</b><span class="faint small">48 秒</span></div><p class="sub">读了 12 个文件，列出 6 条任务 · 点开看规范</p></div>
<div class="step">${st('ok')}<div class="line"><b>Grok 改 Composer.tsx、App.tsx</b><span class="faint small">1 分 02 秒</span></div><p class="sub">新建 SettingsSheet.tsx，删掉 AgentsDialog 和 ApiWorkbench</p></div>
<div class="step">${st('run')}<div class="line"><b>Grok 跑 pnpm check</b><span class="small" style="color:var(--color-accent-text)">24 秒</span></div>
<div class="out mono"><span class="hl">&gt; tsc --noEmit</span>
src/components/settings/SettingsSheet.tsx:41:7 — 第一次有报错，Grok 在改
  <span class="hl">Property &#39;providers&#39; does not exist on type &#39;SettingsProps&#39;.</span>
<span class="ok">…改完再跑一遍</span></div></div>
<div class="step">${st('todo')}<div class="line"><b class="muted">验证并总结</b></div></div>`;

const STEPS_DONE = `
<div class="step">${st('ok')}<div class="line"><b>Muse 写规范</b><span class="faint small">48 秒</span></div></div>
<div class="step">${st('ok')}<div class="line"><b>Grok 改 Composer.tsx、App.tsx</b><span class="faint small">1 分 02 秒</span></div></div>
<div class="step">${st('ok')}<div class="line"><b>Grok 跑 pnpm check</b><span class="faint small">两遍 · 51 秒</span></div></div>
<div class="step">${st('ok')}<div class="line"><b>验证并总结</b><span class="faint small">59 秒</span></div></div>`;

function mainCol({ done = false } = {}) {
  return `<div class="col col-main"><div class="colhead" style="background:var(--color-page)"><span class="small muted">把设置里三个对话框合成一个面板</span><span style="flex:1"></span><span class="small muted">${who(['Muse', 'Grok'])}</span><span class="faint small">· 允许改文件和跑命令 · 14:02 开始</span></div>
  <div class="chat">
    <div class="me">把设置里三个对话框合成一个面板，供应商只显示配了 Key 的。</div>
    <div class="steps">${done ? STEPS_DONE : STEPS_RUNNING}</div>
    ${done ? `<div class="card"><div class="shine"></div><div style="display:flex;align-items:center;gap:10px"><span class="st ok" style="width:18px;height:18px;border-radius:50%;background:var(--color-success);display:inline-flex;align-items:center;justify-content:center">${I.check}</span><b class="h-title">做完了 · 3 分 40 秒</b></div>
    <p style="margin:10px 0 0">把三个对话框合成了一个设置面板（<span class="mono">SettingsSheet.tsx</span>），供应商列表只显示配了 Key 的两家；删掉了 <span class="mono">AgentsDialog</span> 和 <span class="mono">ApiWorkbench</span>。</p>
    <div style="display:flex;gap:16px;margin-top:12px" class="small"><span style="color:var(--color-success)">✓ pnpm check 通过</span><span style="color:var(--color-success)">✓ cargo test 12 / 12</span><span class="muted">4 个文件 · ${pm(86, 132)}</span></div>
    <p class="small muted" style="margin:12px 0 0">默认留着。要撤就点右边「撤销整个任务」，回到 14:02 的快照。</p></div>` : ''}
  </div>
  <div class="composer${done ? ' on' : ''}"><div class="in">${done ? '一句话说下一件要做的事' : '下一句话…（这个任务跑完才会发）'}</div>
  <div class="row"><span class="pill">${who(['Muse', 'Grok'])}${I.down}</span><span class="pill">允许改文件和跑命令${I.down}</span><span class="pill ghost muted">API 帮忙：关</span><span class="sp"></span><span class="kbd">⌘↵</span>${done ? '<span class="btn primary">开始</span>' : '<span class="btn danger">停止</span>'}</div></div></div>`;
}

// ---------- 板 ----------
const PROPS = (extra = {}) => JSON.stringify({
  theme: { editor: 'enum', options: ['dark', 'light'], default: 'dark', section: '外观' },
  mood: { editor: 'enum', options: ['lively', 'quiet'], default: 'lively', section: '外观' },
  accent: { editor: 'color', options: ['#00E5FF', '#2FE9FF', '#19D3EB'], default: '#00E5FF', section: '外观' },
  ...extra,
  $preview: { width: W, height: H },
});
function board({ title, body, theme = 'dark', height = H, props = {} }) {
  const p = JSON.parse(PROPS(props)); p.theme.default = theme; p.$preview.height = height;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${CSS}</style>
</helmet>
<div class="peck" data-theme="{{theme}}" data-mood="{{mood}}" style="--accent: {{accent}}; width: ${W}px; height: ${height}px">
${body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${JSON.stringify(p).replace(/'/g, '&#39;')}'>
class Component extends DCLogic {
renderVals() {
return { theme: this.props.theme ?? '${theme}', mood: this.props.mood ?? 'lively', accent: this.props.accent ?? '#00E5FF' };
}
}
</script>
</body>
</html>
`;
}

const mainBody = (opts) => `${titlebar()}<div class="cols">${sideTasks(opts.done)}${mainCol(opts)}${changes(opts)}</div>`;

const PROJECTS = [
  { n: 'weather-cli', p: '~/Code/weather-cli', s: 'run', m: '在跑 · 把设置里三个对话框合成一个面板', t: [['run', '把设置里三个对话框合成一个面板', '2 分 14 秒'], ['ok', '给首页加项目列表，带最近三次任务', '09:12'], ['ok', '修 Diff 里中文文件名乱码', '昨天']] },
  { n: 'notes-sync', p: '~/Code/notes-sync', s: 'bad', m: '上一次失败了 · 已撤销', t: [['bad', '把同步改成增量', '11-07'], ['ok', '加冲突提示', '11-06'], ['ok', '读 iCloud 目录', '11-05']] },
  { n: 'pomelo-site', p: '~/Code/pomelo-site', s: 'idle', m: '空闲 · 上次 11-03', t: [['ok', '首页改成三栏', '11-03'], ['ok', '补 RSS', '11-01'], ['ok', '初始化', '10-28']] },
];
const homeBody = `${titlebar({ home: true })}
<div style="padding:28px 40px 0;height:${H - 44}px;overflow:hidden">
  <div style="display:flex;align-items:flex-end;gap:12px"><span class="h-page">项目</span><span class="muted small">3 个 · 1 个在跑</span><span style="flex:1"></span><span class="btn primary">${I.folder}打开项目文件夹</span></div>
  <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:16px;margin-top:20px">
  ${PROJECTS.map((pj) => `<div class="card" style="padding:0"><div class="shine" style="${pj.s === 'run' ? '' : 'display:none'}"></div>
    <div style="padding:16px 18px 12px;display:flex;align-items:center;gap:10px"><span class="st ${pj.s === 'idle' ? 'todo' : pj.s}" style="width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center">${pj.s === 'run' ? '<i style="width:5px;height:5px;border-radius:50%;background:var(--color-accent);display:block"></i>' : pj.s === 'bad' ? I.x : ''}</span><b class="h-title">${pj.n}</b><span class="mono faint" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${pj.p}</span></div>
    <p class="small muted" style="margin:0;padding:0 18px 10px">${pj.m}</p>
    <div style="border-top:1px solid var(--color-line)">${pj.t.map(([k, t, m]) => `<div class="task" style="padding:8px 18px">${st(k)}<div class="t" style="flex:1;display:flex;gap:10px;min-width:0"><p style="flex:1">${t}</p><span class="faint small" style="white-space:nowrap">${m}</span></div></div>`).join('')}</div></div>`).join('')}
    <div style="border:1.5px dashed var(--color-line-strong);border-radius:${scale.radius.lg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--color-muted);min-height:180px"><span style="color:var(--color-faint)">${I.plus}</span><span class="small">把项目文件夹拖进来，或者点右上角打开</span></div>
  </div>
  <p class="small faint" style="margin:20px 0 0">菜单栏的小啄木鸟一直在：有任务在跑它多一个点，跑完 macOS 通知你（设置里能关）。</p>
</div>`;

const cardsBody = `
<div style="position:absolute;inset:0;padding:40px;display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:32px 40px;align-content:start">
  <div><p class="caption muted" style="margin:0 0 10px">模型停下来问你（ASK）· 任何模型都能发</p>
  <div class="ask"><div class="hd">${I.help}Grok 停下来问你 · 任务在等</div><h3>设置面板里「花费上限」按每月算，还是按每个任务算？</h3>
  <p class="small muted" style="margin:8px 0 0">它说：代码里两种都能做，差别是上限提示出现的位置。</p>
  <div class="opts"><span class="btn primary">每月</span><span class="btn">每个任务</span><span class="btn quiet">两种都要</span></div>
  <div class="input" style="margin-top:10px">或者打字回答…</div></div></div>

  <div><p class="caption muted" style="margin:0 0 10px">高危操作要你点头 · 权限是「允许改文件和跑命令」也会问</p>
  <div class="ask red"><div class="hd">${I.alert}Grok 想删目录</div><h3 class="mono" style="font-size:14px;font-weight:500">rm -rf dist/ node_modules/</h3>
  <p class="small muted" style="margin:8px 0 0">这个任务的权限：允许改文件和跑命令。删除目录、推送、装依赖、改系统设置要你点头。</p>
  <div class="opts"><span class="btn">允许这一次</span><span class="btn">这个任务都允许</span><span class="btn danger">拒绝</span></div></div></div>

  <div><p class="caption muted" style="margin:0 0 10px">选了没配 Key 的模型 · 当场要</p>
  <div class="ask" style="border-color:var(--color-line)"><div class="hd" style="color:var(--color-accent-text)">${I.key}DeepSeek 还没有 Key</div><h3>贴一个 DeepSeek 的 API Key，存进钥匙串</h3>
  <div class="input on" style="margin-top:12px;font-family:${scale.font.mono}">sk-••••••••••••••••••••••••</div>
  <div class="opts"><span class="btn primary">保存并开始</span><span class="btn quiet">只用这一次，不存</span></div>
  <p class="caption faint" style="margin:10px 0 0">Key 只在这台 Mac 的钥匙串里，Peck 的记录和导出里都不会出现。</p></div></div>

  <div><p class="caption muted" style="margin:0 0 10px">菜单栏和通知</p>
  <div class="card" style="padding:0;overflow:hidden"><div style="display:flex;align-items:center;gap:0;height:30px;background:var(--color-raised);border-bottom:1px solid var(--color-line);padding:0 12px;justify-content:flex-end">
    <span class="caption faint" style="margin-right:auto">菜单栏</span>
    <span style="display:inline-flex;align-items:center;gap:22px;color:var(--color-text)">
      <span style="display:inline-flex;align-items:center;gap:4px" title="空闲">${I.bird(18)}</span>
      <span style="display:inline-flex;align-items:flex-start;gap:0;position:relative">${I.bird(18)}<span class="dot run" style="width:6px;height:6px;position:absolute;right:-5px;top:-2px"></span></span>
      <span style="display:inline-flex;align-items:flex-start;position:relative">${I.bird(18)}<span style="position:absolute;right:-7px;top:-4px;color:var(--color-warning)">${I.help}</span></span>
      <span class="caption faint">14:06</span></span></div>
    <div style="padding:12px 14px;display:flex;gap:8px" class="caption muted"><span>空闲</span><span>·</span><span>在跑（青点呼吸）</span><span>·</span><span>等你回答（问号）</span></div>
    <div style="margin:4px 14px 14px;background:var(--color-raised);border:1px solid var(--color-line);border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start;box-shadow:var(--shadow-card)">
      <span style="color:var(--color-accent-text);margin-top:2px">${I.bird(22)}</span><div style="min-width:0"><p class="small" style="margin:0;font-weight:600">Peck · weather-cli</p><p class="small" style="margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">做完了：把设置里三个对话框合成一个面板 · +86 −132</p></div><span class="caption faint" style="margin-left:auto;white-space:nowrap">刚刚</span></div></div></div>
</div>`;

function settingsBody() {
  const row = (label, right, sub = '') => `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--color-line)"><div style="flex:1;min-width:0"><p style="margin:0">${label}</p>${sub ? `<p class="small muted" style="margin:2px 0 0">${sub}</p>` : ''}</div>${right}</div>`;
  const sec = (t) => `<p class="caption muted" style="margin:18px 0 2px;letter-spacing:.04em">${t}</p>`;
  return `${titlebar()}<div class="cols" style="filter:saturate(.6)">${sideTasks(true)}<div class="col col-main"></div>${changes({ done: true })}</div>
  <div style="position:absolute;inset:0;background:rgb(0 0 0 / .35)"></div>
  <div style="position:absolute;left:50%;top:60px;transform:translateX(-50%);width:${scale.width.sheet};height:${H - 100}px;background:var(--color-card);border:1px solid var(--color-line);border-radius:${scale.radius.lg};box-shadow:var(--shadow-sheet);padding:20px 28px;overflow:hidden">
    <div style="display:flex;align-items:center"><span class="h-page">设置</span><span style="flex:1"></span><span class="muted">${I.x}</span></div>
    <div style="display:flex;gap:28px;margin-top:12px;height:${H - 170}px">
      <div style="width:150px;flex:none" class="small">${['谁能干活', '权限', '花费上限', '通知', '外观', '开发者'].map((t, i) => `<p style="margin:0;padding:7px 10px;border-radius:6px;${i === 0 ? 'background:var(--color-accent-soft);color:var(--color-accent-text);font-weight:500' : 'color:var(--color-muted)'}">${t}</p>`).join('')}</div>
      <div style="flex:1;min-width:0;overflow:hidden" data-nolint>
        ${sec('本机 CLI')}
        ${row(`<span class="dot muse" style="margin-right:6px"></span>Muse Code`, '<span class="small" style="color:var(--color-success)">✓ 1.4.14 · 已登录</span>', '/cli/muse/muse')}
        ${row(`<span class="dot grok" style="margin-right:6px"></span>Grok Build`, '<span class="small" style="color:var(--color-success)">✓ 1.0.77 · 已登录</span>', '/cli/grok/grok')}
        ${sec('API 模型 · 只显示配了 Key 的')}
        ${row(`<span class="dot api" style="margin-right:6px"></span>Anthropic`, '<span class="small muted">Claude Opus 5.5 · 思考：中</span>', 'Key 在钥匙串')}
        ${row(`<span class="dot api" style="margin-right:6px"></span>DeepSeek`, '<span class="small muted">DeepSeek Flash</span>', 'Key 在钥匙串 · 余额 ¥38.20')}
        <p class="small" style="margin:10px 0 0;color:var(--color-accent-text)">+ 添加一家（OpenAI、Google Gemini、阿里云百炼）</p>
        ${sec('花费上限')}
        ${row('每月最多花', '<span class="input on" style="width:110px;justify-content:flex-end" >¥ 200</span>', '按供应商的价格表估，估不出的标「未知」；到 80% 提醒，到 100% 新任务不发')}
        ${sec('权限 · 新任务默认')}
        ${row('<span class="seg"><span>只读</span><span class="on">允许改文件和跑命令</span><span>全部放行</span></span>', '', '删目录、推送、装依赖、改系统设置永远弹卡片问你')}
        ${sec('通知')}
        ${row('任务做完发 macOS 通知', '<span class="sw on"><i></i></span>')}
        ${row('等我回答时通知', '<span class="sw on"><i></i></span>')}
      </div></div></div>`;
}

function tokensBody() {
  const half = (mode) => {
    const sw = (k) => `<div style="display:flex;align-items:center;gap:10px;padding:5px 0"><span style="width:28px;height:28px;border-radius:6px;background:var(--color-${k});border:1px solid var(--color-line);flex:none"></span><span class="small" style="width:72px">${color.roles[k].label}</span><span class="mono faint">${color.roles[k][mode]}</span><span class="caption muted" style="margin-left:auto;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:230px">${color.roles[k].use}</span></div>`;
    const groups = [['四层底', ['page', 'panel', 'card', 'raised', 'code', 'line']], ['字', ['text', 'muted', 'faint']], ['青', ['accent', 'accent-text', 'accent-soft', 'accent-line']], ['标记', ['muse', 'grok', 'api']], ['状态', ['success', 'warning', 'danger']]];
    return `<div class="peck" data-theme="${mode}" data-mood="{{mood}}" style="--accent: {{accent}}; width:640px;height:1100px;padding:32px 36px;overflow:hidden;border-right:1px solid var(--color-line)">
      <p class="caption muted" style="margin:0">${mode === 'dark' ? '深色（主场）' : '浅色'}</p>
      <p class="h-display" style="margin:4px 0 0">Peck 安静地干活，<span style="color:var(--color-accent-text)">青色</span>只在要紧的地方亮。</p>
      <p class="small muted" style="margin:6px 0 0">IBM Plex Sans 14 / 1.55 · 标题 16、20、28 · 说明 12 不再小 · <span class="mono">IBM Plex Mono 12.5 路径 / 输出 / +12 −3</span></p>
      <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:0 28px;margin-top:18px">
        ${groups.map(([t, ks]) => `<div><p class="caption muted" style="margin:10px 0 2px">${t}</p>${ks.map(sw).join('')}</div>`).join('')}
        <div><p class="caption muted" style="margin:10px 0 6px">控件</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="btn primary">开始</span><span class="btn">次要</span><span class="btn danger">撤销</span><span class="pill">${who(['Muse', 'Grok'])}${I.down}</span><span class="sw on"><i></i></span><span class="sw"><i></i></span></div>
          <div class="input on" style="margin-top:10px;width:260px">聚焦：青描边${mode === 'dark' ? ' + 光晕' : '，没有光晕'}</div>
          <div class="steps" style="margin-top:12px"><div class="step">${st('ok')}<div class="line"><b>做完的步骤</b></div></div><div class="step">${st('run')}<div class="line"><b>在跑的步骤</b><span class="small" style="color:var(--color-accent-text)">青点呼吸</span></div></div><div class="step">${st('todo')}<div class="line"><b class="muted">还没开始</b></div></div></div>
        </div>
      </div>
      <p class="caption muted" style="margin:16px 0 4px">动效 · calm 120–240 毫秒，进入 320；登记的六个时刻</p>
      <p class="small muted" style="margin:0;line-height:1.7">${motion.tiers.expressive.registeredSurfaces.map((s) => `<span class="mono" style="color:var(--color-text)">${s}</span> ${motion.registeredSurfaces[s].where}`).join('<br>')}</p>
    </div>`;
  };
  return `<div style="display:flex">${half('dark')}${half('light')}</div>`;
}

// ---------- 写文件 ----------
mkdirSync(OUT, { recursive: true });
const boards = [
  ['Main.dc.html', { title: '主界面 · 任务进行中（深色）', body: mainBody({ done: false }), theme: 'dark' }],
  ['Main-Light.dc.html', { title: '主界面 · 任务进行中（浅色）', body: mainBody({ done: false }), theme: 'light' }],
  ['Done.dc.html', { title: '主界面 · 任务完成', body: mainBody({ done: true }), theme: 'dark' }],
  ['Home.dc.html', { title: '项目列表（打开第一眼）', body: homeBody, theme: 'dark' }],
  ['Cards.dc.html', { title: '卡片：ASK、高危确认、要 Key、菜单栏和通知', body: cardsBody, theme: 'dark' }],
  ['Settings.dc.html', { title: '设置（一个面板，浅色）', body: settingsBody(), theme: 'light' }],
];
for (const [f, o] of boards) writeFileSync(path.join(OUT, f), board(o));
// 色板那张板自己管明暗（两半各一种），只留 mood 和 accent 的 Tweaks
{
  const p = JSON.parse(PROPS()); delete p.theme; p.$preview = { width: W, height: 1100 };
  writeFileSync(path.join(OUT, 'Tokens.dc.html'), `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>色板、字体、控件、动效</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${CSS}</style>
</helmet>
${tokensBody()}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${JSON.stringify(p).replace(/'/g, '&#39;')}'>
class Component extends DCLogic {
renderVals() {
return { mood: this.props.mood ?? 'lively', accent: this.props.accent ?? '#00E5FF' };
}
}
</script>
</body>
</html>
`);
}

const prev = JSON.parse(readFileSync(path.join(OUT, 'canvas.json'), 'utf8'));
const GAP = 120, ROW = H + GAP;
const layout = {
  'Main.dc.html': { x: 0, y: 0, w: W, h: H, title: '主界面 · 任务进行中（深色）' },
  'Main-Light.dc.html': { x: W + 80, y: 0, w: W, h: H, title: '主界面 · 任务进行中（浅色）' },
  'Done.dc.html': { x: 0, y: ROW, w: W, h: H, title: '主界面 · 任务完成（默认留着，撤销在右上）' },
  'Home.dc.html': { x: W + 80, y: ROW, w: W, h: H, title: '项目列表（打开第一眼）' },
  'Cards.dc.html': { x: 0, y: ROW * 2, w: W, h: H, title: '卡片：ASK、高危确认、要 Key、菜单栏和通知' },
  'Settings.dc.html': { x: W + 80, y: ROW * 2, w: W, h: H, title: '设置：一个面板替掉三个对话框（浅色）' },
  'Tokens.dc.html': { x: 0, y: ROW * 3, w: W, h: 1100, title: '色板、字体、控件、动效（左深右浅）' },
};
for (const k of Object.keys(layout)) layout[k] = { ...layout[k], radius: 12 };
const canvas = {
  ...prev,
  title: 'Peck Explore',
  launch: { view: 'canvas' },
  pages: [],
  boards: layout,
  order: Object.keys(layout),
  notes: {
    title: { x: 0, y: -300, text: 'Peck Explore · 视觉基线提议（2026-11-08）', kind: 'title1', maxW: W * 2 + 80 },
    how: { x: W * 2 + 160, y: 0, w: 360, text: '怎么看\n\n每张板右上角 Tweaks 里有三个开关：明暗、mood（lively 有光晕和青底，quiet 没有）、强调色三选一。挑好的告诉我，我写进 schemes/peck/。\n\n要改的直接在板上评论。批了以后 Phase 3 才开始做新外壳。', fill: 'teal' },
    rules: { x: W * 2 + 160, y: 420, w: 360, text: '定了的（问卷）\n\n三栏：项目和任务 · 对话 · 改动\n打开先看项目列表\n发任务 = 一句话 + 谁来干\n跑完默认留着，撤销是整个任务一键\n权限三档 + 高危弹卡片 + 所有模型能 ASK\nIBM Plex，舒适的疏密，跟随系统明暗\n青色保留做主强调色，更灵动、有动效、颜色层次略丰富', fill: 'gray' },
  },
  designSystems: prev.designSystems ?? [],
};
writeFileSync(path.join(OUT, 'canvas.json'), JSON.stringify(canvas, null, 2) + '\n');
console.log('写了', boards.length + 1, '张板和 canvas.json →', OUT);
