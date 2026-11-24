// Motion Deck：#/motion/<方案>?p=<零件>。左边是这个方案的动效零件（按档位分），右边一次看一个：
//   - 实时播放：重新载入演示页，按 capture.steps 的时刻真的去做（界面里会看到的样子）；
//   - 拖时间轴：和逐帧导出一样定格——到 t 之前的步骤按顺序做，每一步先把动画定格到那一步的时刻，
//     每个动画定格到 t − 它出现的时刻。步骤怎么走（advanceSteps）、页面里怎么做（applyStepInPage、markInPage、
//     seekInPage）都直接用 tooling/lib/motion-harness.mjs，不另写一份；
//   - 导出：服务端调 tooling 的 renderPart，写 dist/<方案>/motion/<零件>/，和 npm run build:motion 一模一样。
// 演示页是 /motion/<方案>/<零件>.html（tooling 的 partPage），预览面板藏起来时 requestAnimationFrame 会停，
// 但拖时间轴是直接定格，不靠它。
import { advanceSteps } from '/_va/motion-harness.mjs';

const $ = (sel, root = document) => root.querySelector(sel);
const h = (tag, attrs = {}, kids = []) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(kids)) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
};
const kb = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(2)} MB` : `${(n / 1024).toFixed(1)} KB`);
const TIER = { calm: 'calm · 控件的小动静', expressive: 'expressive · 招牌时刻' };
const STATUS = { draft: '草稿', proposed: '待批', approved: '已批准' };

const M = {
  scheme: null, data: null, part: null, onNav: null,
  theme: 'light', palette: null, reduce: false, zoom: null,
  frame: null, state: null, live: false, t: 0, end: null, exactEnd: false,
  timers: [], raf: 0, exporting: false, loading: null, error: null
};

export async function openMotion(scheme, partId, { onNav }) {
  M.onNav = onNav;
  if (M.scheme !== scheme || !M.data) await load(scheme);
  const parts = M.data?.parts || [];
  const next = parts.find((p) => p.id === partId) || parts.find((p) => !p.error) || parts[0] || null;
  $('#motionview').hidden = false;
  if (!M.part || !next || next.id !== M.part.id) {
    M.part = next;
    M.zoom = null;
    M.theme = next?.capture.themes.includes(M.theme) ? M.theme : next?.capture.themes[0] || 'light';
  }
  render();
  return M.part?.id || null;
}

export function closeMotion() {
  stopPlay();
  $('#motionview').hidden = true;
  $('#mo-main').replaceChildren();
  M.frame = null;
}

async function load(scheme) {
  M.scheme = scheme;
  const r = await fetch(`/api/motion/${encodeURIComponent(scheme)}`, { cache: 'no-store' });
  M.data = r.ok ? await r.json() : null;
  M.error = r.ok ? null : `读不到 ${scheme} 的动效零件（${r.status}）`;
  M.palette = M.data?.defaultPalette || null;
}

/** 键盘：空格播放，← → 一帧，Home 回到开头，End 到最后。 */
export function motionKey(e) {
  if (!M.part || M.part.error || e.metaKey || e.ctrlKey || e.altKey) return;
  const step = 1000 / (M.part.capture.fps || 50);
  if (e.key === ' ') { e.preventDefault(); M.live ? stopPlay(true) : play(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); scrubTo(Math.min(maxT(), M.t + step)); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); scrubTo(Math.max(0, M.t - step)); }
  else if (e.key === 'Home') { e.preventDefault(); scrubTo(0); }
  else if (e.key === 'End') { e.preventDefault(); scrubTo(maxT()); }
}

// ---------- 列表 ----------
function renderNav() {
  const nav = $('#mo-nav');
  const parts = M.data?.parts || [];
  const groups = [['calm', '控件的小动静'], ['expressive', '招牌时刻、表情'], ['', '其他']];
  const kids = [h('p', { class: 'mo-nav-head', text: `${M.data?.title || M.scheme} · ${parts.length} 个零件` })];
  // 名字取「 · 」前面那段；几个零件前面一样（柚子 · 眨眼、柚子 · 开心）就写全
  const head = (p) => (p.title || p.id).split(' · ')[0];
  const dup = new Set(parts.map(head).filter((x, i, a) => a.indexOf(x) !== i));
  const label = (p) => (p.error ? p.id : dup.has(head(p)) ? p.title : head(p));
  for (const [tier, name] of groups) {
    const list = parts.filter((p) => (tier ? p.tier === tier : !['calm', 'expressive'].includes(p.tier)));
    if (!list.length) continue;
    kids.push(h('p', { class: 'mo-nav-group', text: name }));
    for (const p of list) {
      kids.push(
        h('button', { class: `ds-nav-item${p.id === M.part?.id ? ' on' : ''}`, 'aria-current': p.id === M.part?.id ? 'page' : null, title: p.id, onclick: () => M.onNav?.(p.id) }, [
          h('span', { class: 'mo-nav-t', text: label(p) }),
          h('span', { class: `sub${p.error ? ' bad' : ''}`, text: p.error ? '读不了' : p.loop ? '循环' : p.durationMs != null ? `${p.durationMs}` : '' })
        ])
      );
    }
  }
  kids.push(h('button', { class: 'ds-nav-item gap', onclick: refresh }, [h('span', { text: '重新读零件' })]));
  nav.replaceChildren(...kids);
}

async function refresh() {
  const id = M.part?.id;
  await load(M.scheme);
  M.part = M.data?.parts.find((p) => p.id === id) || M.data?.parts[0] || null;
  render();
}

// ---------- 一个零件 ----------
function render() {
  renderNav();
  const main = $('#mo-main');
  stopPlay();
  if (!M.data) {
    main.replaceChildren(h('section', { class: 'ds-card' }, [h('h1', { class: 'mo-h', text: '没有动效零件' }), h('p', { text: M.error || '' })]));
    return;
  }
  const p = M.part;
  if (!p) {
    main.replaceChildren(h('section', { class: 'ds-card' }, [h('h1', { class: 'mo-h', text: '这个方案还没有动效零件' })]));
    return;
  }
  if (p.error) {
    main.replaceChildren(h('section', { class: 'ds-card' }, [h('h1', { class: 'mo-h', text: p.id }), h('p', { class: 'bad', text: p.error })]));
    return;
  }
  const c = p.capture;
  const chips = [
    p.tier && h('span', { class: `mo-chip ${p.tier}`, text: TIER[p.tier] || p.tier }),
    p.status && h('span', { class: `mo-chip st-${p.status}`, text: STATUS[p.status] || p.status }),
    p.durationMs != null && h('span', { class: 'mo-chip', text: p.loop ? `循环 · 一圈 ${p.durationMs} 毫秒` : `${p.durationMs} 毫秒` }),
    p.calmException && h('span', { class: 'mo-chip', title: 'tokens/motion.json 的 calmExceptions', text: `时长例外：${p.calmException}` }),
    p.surface && h('span', { class: 'mo-chip', title: 'tokens/motion.json 的 registeredSurfaces', text: `登记：${p.surface}` })
  ];
  const meta = [
    ['怎么触发', p.trigger],
    ['减弱动效', p.reducedMotion],
    ['用在', p.use],
    ['来源', p.source],
    ['演示的步骤', c.steps.map((s) => `${s.at} 毫秒：${describeStep(s, c.host)}`).join('；') || '（没有）'],
    ['文件', Object.values(p.files).filter(Boolean).map((f) => `schemes/${M.scheme}/motion/${p.id}/${f}`).join('  ')]
  ].filter(([, v]) => v);

  const themeSeg = h('div', { class: 'seg', role: 'group', 'aria-label': '明暗' }, c.themes.map((t) => h('button', { class: t === M.theme ? 'on' : '', 'aria-pressed': String(t === M.theme), text: t === 'dark' ? '深色' : '浅色', onclick: () => { M.theme = t; render(); } })));
  const pal = M.data.palettes.length
    ? h('select', { class: 'mo-select', 'aria-label': '配色', onchange: (e) => { M.palette = e.target.value; render(); } }, M.data.palettes.map((x) => h('option', { value: x.id, selected: x.id === M.palette ? true : null, text: x.label })))
    : null;
  const reduceBtn = h('button', { class: 'pill', 'aria-pressed': String(M.reduce), title: '按系统的「减弱动态效果」看这个零件（停在最后的样子）', text: '减弱动效', onclick: () => { M.reduce = !M.reduce; render(); } });
  const [vw, vh] = c.viewport;
  const zoom = M.zoom ?? Math.max(1, Math.min(3, Math.floor(760 / vw)));
  const zoomSeg = h('div', { class: 'seg', role: 'group', 'aria-label': '放大' }, [1, 2, 3].map((z) => h('button', { class: z === zoom ? 'on' : '', 'aria-pressed': String(z === zoom), text: `${z}×`, onclick: () => { M.zoom = z; render(); } })));

  const frame = h('iframe', { title: `${p.title} 演示`, style: { width: `${vw}px`, height: `${vh}px`, transform: `scale(${zoom})` } });
  const box = h('div', { class: 'mo-stage', style: { width: `${vw * zoom}px`, height: `${vh * zoom}px` } }, [frame]);
  M.frame = frame;

  const slider = h('input', { type: 'range', class: 'mo-range', min: '0', max: '1000', step: '1', value: '0', 'aria-label': '时间轴', oninput: (e) => scrubTo(Number(e.target.value)) });
  const ticks = h('div', { class: 'mo-ticks', 'aria-hidden': 'true' });
  const time = h('span', { class: 'mo-time', text: '触发前' });
  const playBtn = h('button', { class: 'pill mo-play', title: '空格', text: '▶ 播放', onclick: () => (M.live ? stopPlay(true) : play()) });
  const fstep = 1000 / (c.fps || 50);
  const timeline = h('div', { class: 'mo-timeline' }, [
    playBtn,
    h('button', { class: 'pill', title: '回到触发前（重新载入）', text: '触发前', onclick: () => reset() }),
    h('button', { class: 'tool', title: `上一帧（←，${fstep.toFixed(0)} 毫秒）`, 'aria-label': '上一帧', text: '‹', onclick: () => scrubTo(Math.max(0, M.t - fstep)) }),
    h('div', { class: 'mo-track' }, [slider, ticks]),
    h('button', { class: 'tool', title: '下一帧（→）', 'aria-label': '下一帧', text: '›', onclick: () => scrubTo(Math.min(maxT(), M.t + fstep)) }),
    time
  ]);
  M.ui = { slider, ticks, time, playBtn };

  const exportBox = h('div', { class: 'mo-export' });
  main.replaceChildren(
    h('section', { class: 'ds-card' }, [
      h('div', { class: 'ds-card-head' }, [h('h1', { text: p.title }), h('code', { class: 'sub', text: p.id })]),
      h('div', { class: 'mo-chips' }, chips.filter(Boolean)),
      h('div', { class: 'mo-tools' }, [themeSeg, pal, reduceBtn, zoomSeg, h('span', { class: 'sub', text: `演示 ${vw} × ${vh}` })]),
      box,
      timeline,
      h('dl', { class: 'mo-meta' }, meta.flatMap(([k, v]) => [h('dt', { text: k }), h('dd', { text: v })]))
    ]),
    h('section', { class: 'ds-card' }, [
      h('div', { class: 'ds-card-head' }, [h('h1', { text: '逐帧总览和 GIF' }), h('button', { class: 'pill', id: 'mo-export-btn', text: M.exporting ? '导出中…' : '导出 GIF', disabled: M.exporting ? true : null, onclick: doExport })]),
      h('p', { class: 'sub', text: `和 npm run build:motion 同一个函数（tooling/render/motion.mjs 的 renderPart），写 dist/${M.scheme}/motion/${p.id}/。总览图是触发前一张，再每 3 帧取一张。` }),
      exportBox
    ])
  );
  renderExport(exportBox);
  setTime(null);
  loadFrame().then(() => measure()).catch((e) => { time.textContent = `载入失败：${e.message}`; });
}

function describeStep(s, host) {
  const what = [s.add && `加 .${String(s.add).split(/\s+/).join(' .')}`, s.remove && `去 .${String(s.remove).split(/\s+/).join(' .')}`, s.attr && Object.entries(s.attr).map(([k, v]) => (v === null ? `去掉 ${k}` : `${k}="${v}"`)).join(' '), s.style && Object.entries(s.style).map(([k, v]) => `${k}: ${v}`).join('; ')].filter(Boolean).join('，');
  return `${s.on && s.on !== host ? s.on : '演示'}${s.all ? '（全部）' : ''} ${what}`;
}

function frameUrl() {
  const q = new URLSearchParams({ theme: M.theme });
  if (M.palette) q.set('palette', M.palette);
  if (M.reduce) q.set('reduce', '1');
  q.set('n', String(Date.now()));
  return `/motion/${M.scheme}/${M.part.id}.html?${q}`;
}

/** 重新载入演示页，等字体到、手画的框画好（和导出时一样）。 */
function loadFrame(frame = M.frame) {
  if (frame === M.frame) { M.state = null; M.live = false; }
  const p = new Promise((resolve, reject) => {
    const ready = () => resolve(frame.contentWindow);
    const t = setTimeout(() => reject(new Error('演示页 10 秒没准备好')), 10000);
    frame.onload = () => {
      const w = frame.contentWindow;
      if (!w) return;
      if (w.__vaReady) { clearTimeout(t); return ready(); }
      w.addEventListener('va-ready', () => { clearTimeout(t); ready(); }, { once: true });
      w.addEventListener('error', (e) => { clearTimeout(t); reject(new Error(e.message)); }, { once: true });
    };
    frame.src = frameUrl();
  });
  if (frame === M.frame) M.loading = p;
  return p;
}

/** 最后一帧在哪：另开一个看不见的演示页，把步骤都做完，读最晚的结束时刻（和导出时算法一样）。 */
async function measure() {
  const p = M.part;
  const c = p.capture;
  if (c.endMs) return setEnd(c.endMs, true);
  setEnd((c.steps.at(-1)?.at || 0) + (p.durationMs || 1000), false);
  const ghost = h('iframe', { 'aria-hidden': 'true', tabindex: '-1', style: { position: 'absolute', left: '-10000px', top: '0', width: `${c.viewport[0]}px`, height: `${c.viewport[1]}px` } });
  document.body.append(ghost);
  try {
    const w = await loadFrame(ghost);
    const st = { k: 0, end: 0 };
    w.__vaOff = new Map();
    await advanceSteps(st, Infinity, c.steps, opsFor(w));
    if (p === M.part && Number.isFinite(st.end)) setEnd(Math.ceil(st.end), true);
  } catch {} finally {
    ghost.remove();
  }
}

function setEnd(ms, exact) {
  M.end = Math.max(1, ms);
  M.exactEnd = exact;
  const { slider, ticks } = M.ui;
  slider.max = String(M.end);
  ticks.replaceChildren(...M.part.capture.steps.filter((s) => s.at > 0 && s.at <= M.end).map((s) => h('i', { style: { left: `${(s.at / M.end) * 100}%` }, title: `${s.at} 毫秒：${describeStep(s, M.part.capture.host)}` })));
  setTime(M.state ? M.t : null);
}
const maxT = () => (M.part.capture.endMs ? M.end - 1000 / (M.part.capture.fps || 50) : M.end);

function setTime(t) {
  if (!M.ui) return;
  if (M.exactEnd && M.end <= 1) {
    M.ui.time.textContent = M.reduce ? '减弱动效：不动，直接是最后的样子' : '这个演示没有动画';
    M.ui.slider.value = '0';
    return;
  }
  const total = `${M.end ?? '?'}${M.exactEnd ? '' : '?'} 毫秒`;
  M.ui.time.textContent = t === null ? `触发前 / ${total}` : `${Math.round(t)} / ${total}`;
  if (t !== null) M.ui.slider.value = String(Math.round(t));
  else M.ui.slider.value = '0';
}

const opsFor = (w) => {
  const H = w.__vaHarness;
  return { seek: (at) => H.seekInPage(at, true), apply: (s) => { H.applyStepInPage(s, M.part.capture.host); return H.markInPage(s.at); } };
};

/** 定格到 t 毫秒：要倒回到某一步之前、或刚实时播放过，就先重新载入。 */
let scrubbing = Promise.resolve();
function scrubTo(t) {
  const run = async () => {
    stopPlay();
    await M.loading;
    const steps = M.part.capture.steps;
    if (M.live || (M.state && M.state.k > 0 && steps[M.state.k - 1].at > t)) await loadFrame();
    await M.loading;
    const w = M.frame.contentWindow;
    if (!w?.__vaHarness) return;
    if (!M.state) { w.__vaOff = new Map(); M.state = { k: 0, end: 0 }; }
    await advanceSteps(M.state, t, steps, opsFor(w));
    w.__vaHarness.seekInPage(t, true);
    M.t = t;
    setTime(t);
  };
  scrubbing = scrubbing.then(run, run);
  return scrubbing;
}

async function reset() {
  stopPlay();
  await loadFrame();
  M.t = 0;
  setTime(null);
}

/** 实时播放：新载入演示页，按步骤的时刻真的去做，不定格。时间轴跟着走（只是显示）。 */
async function play() {
  stopPlay();
  const steps = M.part.capture.steps;
  await loadFrame();
  const w = M.frame.contentWindow;
  const H = w.__vaHarness;
  M.live = true;
  M.ui.playBtn.textContent = '■ 停';
  const t0 = performance.now();
  for (const s of steps) M.timers.push(setTimeout(() => { try { H.applyStepInPage(s, M.part.capture.host); } catch {} }, s.at));
  const loop = M.part.capture.endMs;
  const tick = () => {
    if (!M.live) return;
    const e = performance.now() - t0;
    if (!loop && e > M.end + 400) return stopPlay(false);
    setTime(loop ? e % M.end : Math.min(e, M.end));
    M.raf = requestAnimationFrame(tick);
  };
  M.raf = requestAnimationFrame(tick);
}

function stopPlay(freeze = false) {
  for (const t of M.timers) clearTimeout(t);
  M.timers = [];
  cancelAnimationFrame(M.raf);
  if (M.ui) M.ui.playBtn.textContent = '▶ 播放';
  if (freeze && M.live) {
    // 停下来就定格在这一刻（从头按导出的算法走到这里）
    const t = Number(M.ui.slider.value);
    M.live = false;
    M.state = null;
    loadFrame().then(() => scrubTo(t));
  }
}

// ---------- 导出 ----------
function renderExport(box) {
  const p = M.part;
  const themes = p.capture.themes;
  if (!Object.keys(p.exported).length) {
    box.replaceChildren(h('p', { class: 'sub', text: '还没导出过。点「导出 GIF」，或在仓库根目录 node bench/bin/dw.js motion export ' + `${M.scheme} ${p.id}` }));
    return;
  }
  box.replaceChildren(
    ...themes.map((t) => {
      const x = p.exported[t];
      if (!x) return h('div', { class: 'mo-ex' }, [h('h2', { text: t === 'dark' ? '深色' : '浅色' }), h('p', { class: 'sub', text: '这一版还没导出' })]);
      return h('div', { class: 'mo-ex' }, [
        h('h2', { text: `${t === 'dark' ? '深色' : '浅色'} · GIF ${kb(x.bytes)} · ${new Date(x.at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` }),
        h('div', { class: 'mo-ex-row' }, [
          h('a', { href: x.gif, target: '_blank', rel: 'noopener', class: 'mo-gif' }, [h('img', { src: x.gif, alt: `${p.title} ${t} GIF` })]),
          x.contact ? h('a', { href: x.contact, target: '_blank', rel: 'noopener', class: 'mo-contact' }, [h('img', { src: x.contact, alt: `${p.title} ${t} 逐帧总览` })]) : null
        ])
      ]);
    })
  );
}

async function doExport() {
  if (M.exporting) return;
  const p = M.part;
  M.exporting = true;
  const btn = $('#mo-export-btn');
  if (btn) { btn.textContent = '导出中…'; btn.disabled = true; }
  try {
    const r = await fetch(`/api/motion/${M.scheme}/${p.id}/export`, { method: 'POST' });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(body.message || `导出没成（${r.status}）`);
    if (body.part) {
      const i = M.data.parts.findIndex((x) => x.id === p.id);
      if (i >= 0) M.data.parts[i] = body.part;
      if (M.part === p) M.part = body.part;
    }
    if (M.part?.id === p.id) renderExport($('#mo-main .mo-export'));
  } catch (e) {
    const box = $('#mo-main .mo-export');
    if (box) box.prepend(h('p', { class: 'bad', text: e.message }));
  } finally {
    M.exporting = false;
    const b = $('#mo-export-btn');
    if (b) { b.textContent = '导出 GIF'; b.disabled = false; }
  }
}
