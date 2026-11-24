// 动效「时间的函数」：触发后暂停全部动画，按指定时间点逐帧定格截图。
// head：页面 <head> 里另加的东西（Pomelo 的零件要 Design System 的 tokens、bundle.css、bundle.js）；
// boot：片段放好以后跑的脚本（Pomelo 用它画手画的框，Pomelo.paint）；bodyClass：给 <body> 的类名（Pomelo 是 pm）。
export const harnessHtml = ({ webCss, pieceCss = '', fragment, theme, head = '', boot = '', bodyClass = '', palette = '' }) => `<!doctype html>
<html lang="zh" data-theme="${theme}"${palette ? ` data-palette="${palette}"` : ''}><head><meta charset="utf-8">
<style>${webCss}</style>
${head}
<style>${pieceCss}</style>
<style>html,body{margin:0;background:var(--color-page,var(--color-desk))}#stage{position:absolute;left:24px;top:24px;display:flex}</style>
</head><body${bodyClass ? ` class="${bodyClass}"` : ''}><div id="stage">${fragment}</div>${boot ? `<script>${boot}</script>` : ''}</body></html>`;

export function frameTimes(endMs, fps) {
  const step = 1000 / fps;
  const n = Math.floor(endMs / step + 1e-9);
  const times = Array.from({ length: n + 1 }, (_, i) => Math.round(i * step * 1000) / 1000);
  if (times[times.length - 1] < endMs) times.push(endMs);
  return times;
}

/**
 * 触发写成一串步骤：在第 at 毫秒，给 on（默认 host；all 时是所有匹配的）加类（add）、去类（remove）、
 * 设属性（attr，值写 null 是去掉）、设样式变量或样式（style）。按下再松开、开了再关这种两步的动静就这样写。
 * 旧写法 trigger（{ type: 'class', playClass, target, all }）换成一步：第 0 毫秒加 playClass。
 */
export function stepsOf({ steps, trigger, host }) {
  if (steps?.length) return [...steps].sort((a, b) => a.at - b.at);
  if (trigger?.type === 'class') return [{ at: 0, add: trigger.playClass, on: trigger.target ?? host, all: !!(trigger.target && trigger.all) }];
  return null;
}

/** 在页面里做一步（浏览器里也用这一份：bench 的 Motion Deck把它原样放进页面）。 */
export function applyStepInPage(step, host) {
  const sel = step.on ?? host;
  const nodes = step.all ? [...document.querySelectorAll(sel)] : [document.querySelector(sel)];
  for (const n of nodes) {
    if (!n) throw new Error(`找不到 ${sel}`);
    for (const c of String(step.add ?? '').split(/\s+/).filter(Boolean)) n.classList.add(c);
    for (const c of String(step.remove ?? '').split(/\s+/).filter(Boolean)) n.classList.remove(c);
    for (const [k, v] of Object.entries(step.attr ?? {})) { if (v === null) n.removeAttribute(k); else n.setAttribute(k, v); }
    for (const [k, v] of Object.entries(step.style ?? {})) n.style.setProperty(k, v);
  }
  // 读一次样式：过渡从这一刻的值开始
  getComputedStyle(document.querySelector(host) ?? document.body).transform;
}

/** 在页面里：新出现的动画记下它是第几毫秒（at）出现的，全部暂停；返回最晚的结束时刻。 */
export function markInPage(at) {
  if (!window.__vaOff) window.__vaOff = new Map();
  let end = 0;
  for (const a of document.getAnimations()) {
    if (!window.__vaOff.has(a)) window.__vaOff.set(a, at);
    a.pause();
    end = Math.max(end, window.__vaOff.get(a) + a.effect.getComputedTiming().endTime);
  }
  return end;
}

/** 在页面里：每个动画定格到 t − 它出现的时刻（offsets 为 false 时都定格到 t）。 */
export function seekInPage(t, offsets) {
  for (const a of document.getAnimations()) {
    const o = offsets ? (window.__vaOff?.get(a) ?? 0) : 0;
    a.pause();
    a.currentTime = Math.max(0, t - o);
  }
}

/**
 * 走到第 t 毫秒：做完 at ≤ t 还没做的步骤，每一步先把动画定格到那一步的时刻再做。
 * state 是 { k: 做到第几步, end: 最晚结束时刻 }；ops.seek(at)、ops.apply(step)（返回结束时刻）可以是 async。
 * 逐帧导出和 bench 的 Motion Deck都走这一个函数。
 */
export async function advanceSteps(state, t, seq, ops) {
  while (state.k < seq.length && seq[state.k].at <= t) {
    await ops.seek(seq[state.k].at);
    state.end = Math.max(state.end, await ops.apply(seq[state.k]));
    state.k++;
  }
  return state;
}

/** 页面里要有的这几样（逐帧导出用 page.evaluate 放进去；bench 的 Motion Deck直接 import 这个文件）。 */
const inPageSource = () => `window.__vaHarness = { applyStepInPage: ${applyStepInPage}, markInPage: ${markInPage}, seekInPage: ${seekInPage} };`;

/**
 * trigger: { type: 'class', host, playClass } 或 { type: 'hover', host }；steps：见 stepsOf（有 steps 就不看 trigger）
 * times: 毫秒数组；null 则取动画的最长结束时间并按 fps 生成
 */
export async function captureFrames(page, { host, trigger, steps = null, padPx, fps = 50, times = null, clipHost = null }) {
  const el = page.locator(host).first();
  await el.waitFor();
  // 先读一次计算样式，保证过渡有起点
  await el.evaluate((n) => { getComputedStyle(n).transform; });
  // 截图范围默认是 host；clipHost 可以只截 host 里的某个部分（例如只截标志、不截旁边的字）
  const box = await (clipHost ? page.locator(clipHost).first() : el).boundingBox();
  const clip = { x: box.x - padPx, y: box.y - padPx, width: box.width + padPx * 2, height: box.height + padPx * 2 };
  const rest = await page.screenshot({ clip });
  await page.evaluate(inPageSource());

  const seq = stepsOf({ steps, trigger, host });
  if (!seq) {
    // 悬停：只有一步，用鼠标
    if (trigger.type === 'hover') await el.hover();
    await el.evaluate((n) => { getComputedStyle(n).transform; });
    const endMs = await page.evaluate(() => {
      let end = 0;
      for (const a of document.getAnimations()) { a.pause(); end = Math.max(end, a.effect.getComputedTiming().endTime); }
      return end;
    });
    const ts = times ?? frameTimes(endMs, fps);
    const frames = [];
    for (const t of ts) {
      await seekAll(page, t, false);
      frames.push({ t, png: await page.screenshot({ clip }) });
    }
    return { rest, frames, endMs, clip };
  }

  // 一串步骤：每个动画记下它是第几毫秒出现的；定格到 t 时，每个动画放到 t − 它出现的时刻
  await page.evaluate(() => { window.__vaOff = new Map(); });
  const ops = {
    seek: (at) => seekAll(page, at, true),
    apply: (s) => page.evaluate(({ s, host }) => { window.__vaHarness.applyStepInPage(s, host); return window.__vaHarness.markInPage(s.at); }, { s, host }),
  };
  const state = { k: 0, end: 0 };
  const stepMs = 1000 / fps;
  const frames = [];
  const grid = times ? [...times] : null;
  for (let i = 0; ; i++) {
    const t = grid ? grid[i] : Math.round(i * stepMs * 1000) / 1000;
    if (t === undefined) break;
    // 到这一刻要做的步骤：先把动画放到那一步的时刻，再做
    await advanceSteps(state, t, seq, ops);
    const endMs = state.end;
    if (!grid && state.k >= seq.length && t > endMs) {
      if (frames.length && frames[frames.length - 1].t < endMs) { await seekAll(page, endMs, true); frames.push({ t: endMs, png: await page.screenshot({ clip }) }); }
      break;
    }
    await seekAll(page, t, true);
    frames.push({ t, png: await page.screenshot({ clip }) });
  }
  const endMs = state.end;
  return { rest, frames, endMs: grid ? grid[grid.length - 1] : endMs, clip };
}

// 定格后等两帧再截图：遮罩里的动画改变后，浏览器要重绘遮罩，否则偶尔截到上一帧的遮罩
function seekAll(page, t, offsets) {
  return page.evaluate(({ tt, offsets }) => new Promise((done) => {
    window.__vaHarness.seekInPage(tt, offsets);
    requestAnimationFrame(() => requestAnimationFrame(done));
  }), { tt: t, offsets });
}
