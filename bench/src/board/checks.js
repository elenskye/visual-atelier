// Checks：npm run all 的结果（站主 2026-11-14 定：菜单里再加一类）。读 /api/checks，只看不改；「跑一遍」启动
// tooling/qa/all.mjs（POST /api/checks/run），跑的时候服务每秒告诉一次（SSE checks），这里重新读。
// 先看哪一步没过；再按方案列出没过、提醒的检查项，说的是哪张图的点了看图；过了的收起来。

import { $, h, when, post } from './dom.js';

const C = { data: null, open: new Set(), starting: false }; // open：展开的输出（步骤 id）和「过了的」（pass:<标题>），每次重画都照着
const STATUS = { pass: '过了', fail: '没过', warn: '提醒', running: '正在跑', waiting: '等着', skipped: '没跑', stopped: '没跑完', info: '说明' };
const IMG = /\.(png|jpe?g|gif|webp|svg)$/i;
const dur = (ms) => (ms == null ? '' : ms < 1000 ? `${ms} 毫秒` : ms < 60000 ? `${(ms / 1000).toFixed(1)} 秒` : `${Math.floor(ms / 60000)} 分 ${Math.round((ms % 60000) / 1000)} 秒`);

export async function openChecks() {
  $('#checksview').hidden = false;
  await refreshChecks();
}

export function closeChecks() {
  $('#checksview').hidden = true;
  $('#ck-main').replaceChildren();
}

export async function refreshChecks() {
  try {
    const r = await fetch('/api/checks', { cache: 'no-store' });
    C.data = r.ok ? await r.json() : null;
  } catch {
    C.data = null;
  }
  render();
}

async function runAll() {
  C.starting = true;
  note = null; // 上一次没跑起来的那句不留着
  render();
  try {
    await post('/api/checks/run', {});
  } catch (e) {
    alertLine(`没跑起来：${e.message}`);
  }
  // the run writes its first run.json in a moment; the server says so (SSE checks)
  setTimeout(() => {
    C.starting = false;
    refreshChecks();
  }, 1500);
}

let note = null;
function alertLine(text) {
  note = text;
  render();
}

const badge = (status) => h('span', { class: `ck-badge ${status}`, text: STATUS[status] || status });

function render() {
  const main = $('#ck-main');
  if (!main || $('#checksview').hidden) return;
  const d = C.data;
  const run = d?.run || null;
  const busy = C.starting || run?.status === 'running';
  const head = h('section', { class: 'ds-card' }, [
    h('div', { class: 'ds-card-head' }, [
      h('h1', { text: 'npm run all' }),
      h('button', { class: 'pill primary', disabled: busy, onclick: runAll, text: busy ? '正在跑…' : '跑一遍' })
    ]),
    h('p', { class: 'sub', text: '构建所有方案、导出图和动效、做质量检查，再出目录页。整遍要几分钟；跑的时候这一页自己更新。Agent 在仓库根目录跑 npm run all 也写到这里。' }),
    note ? h('p', { class: 'ck-note', text: note }) : null,
    !run
      ? h('p', { text: '还没跑过。' })
      : h('p', { class: 'ck-summary' }, [
          badge(run.status),
          ` ${run.status === 'running' ? `${when(run.startedAt)} 开始，正在跑「${run.steps.find((s) => s.status === 'running')?.title || '…'}」` : `${when(run.startedAt)} 开始${run.finishedAt ? `，用时 ${dur(new Date(run.finishedAt) - new Date(run.startedAt))}` : ''}`}`,
          run.status === 'fail' ? `；没过的是「${run.steps.find((s) => s.status === 'fail')?.title}」，后面的没跑` : ''
        ])
  ]);
  const kids = [head];
  if (run) kids.push(stepsCard(run));
  for (const s of d?.schemes || []) kids.push(schemeCard(s));
  if (d?.watermark) kids.push(listCard('作品水印', d.watermark.at, d.watermark.items));
  // 跑的时候每秒重画一次：展开的输出保持滚到的地方（在最底下就跟着到最底下）
  const logs = new Map([...main.querySelectorAll('.ck-log[data-step]')].map((p) => [p.dataset.step, p.scrollTop + p.clientHeight >= p.scrollHeight - 4 ? -1 : p.scrollTop]));
  main.replaceChildren(...kids);
  for (const p of main.querySelectorAll('.ck-log[data-step]')) {
    const top = logs.get(p.dataset.step);
    if (top !== undefined) p.scrollTop = top < 0 ? p.scrollHeight : top;
  }
}

function stepsCard(run) {
  const rows = run.steps.map((s) => {
    const open = C.open.has(s.id);
    const row = h('tr', { class: `ck-step ${s.status}` }, [
      h('td', {}, badge(s.status)),
      h('td', {}, [h('div', { text: s.title }), h('div', { class: 'sub mono', text: s.command })]),
      h('td', { class: 'sub', text: dur(s.ms) }),
      h('td', {}, s.log?.length ? h('button', { class: 'pill', text: open ? '收起输出' : '看输出', onclick: () => { open ? C.open.delete(s.id) : C.open.add(s.id); render(); } }) : null)
    ]);
    return open ? [row, h('tr', {}, h('td', { colspan: '4' }, h('pre', { class: 'ck-log', 'data-step': s.id, text: s.log.join('\n') })))] : [row];
  });
  return h('section', { class: 'ds-card' }, [h('div', { class: 'ds-card-head' }, h('h1', { text: '每一步' })), h('div', { class: 'ds-table' }, h('table', {}, h('tbody', {}, rows.flat())))]);
}

function itemRow(it) {
  const file = it.file && IMG.test(it.file) ? it.file : null;
  const href = it.file ? `/_dist/${it.file.replace(/^dist\//, '')}` : null;
  const link = it.file && it.file.startsWith('dist/') ? h('a', { href, target: '_blank', rel: 'noopener', class: 'mono', text: it.file }) : it.file ? h('span', { class: 'mono sub', text: it.file }) : null;
  return h('tr', { class: `ck-item ${it.status}` }, [
    h('td', {}, badge(it.status)),
    h('td', {}, [h('div', { text: `${it.group ? `${it.group} · ` : ''}${it.name}` }), it.detail ? h('div', { class: 'sub', text: it.detail }) : null, link]),
    h('td', { class: 'ck-thumb' }, file && it.file.startsWith('dist/') ? h('a', { href, target: '_blank', rel: 'noopener' }, h('img', { src: href, alt: it.name, loading: 'lazy' })) : null)
  ]);
}

function listCard(title, at, items) {
  const order = { fail: 0, warn: 1, info: 2, pass: 3 };
  const sorted = [...items].sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2));
  const bad = sorted.filter((i) => i.status === 'fail' || i.status === 'warn');
  const good = sorted.filter((i) => !(i.status === 'fail' || i.status === 'warn'));
  const count = (st) => items.filter((i) => i.status === st).length;
  return h('section', { class: 'ds-card' }, [
    h('div', { class: 'ds-card-head' }, [h('h1', { text: title }), h('span', { class: 'sub', text: `${count('fail')} 没过 · ${count('warn')} 提醒 · ${count('pass')} 过了${at ? ` · ${when(at)}` : ''}` })]),
    bad.length ? h('div', { class: 'ds-table' }, h('table', {}, h('tbody', {}, bad.map(itemRow)))) : h('p', { class: 'sub', text: '没有没过的，也没有提醒。' }),
    good.length ? h('details', { open: C.open.has(`pass:${title}`), ontoggle: (e) => (e.currentTarget.open ? C.open.add(`pass:${title}`) : C.open.delete(`pass:${title}`)) }, [h('summary', { text: `过了的 ${good.length} 项` }), h('div', { class: 'ds-table' }, h('table', {}, h('tbody', {}, good.map(itemRow))))]) : null
  ]);
}

const schemeCard = (s) => listCard(`方案 ${s.scheme}`, s.at, s.items);
