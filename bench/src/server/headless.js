import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

/**
 * Resolves the Chrome executable path on macOS / Linux.
 */
export function resolveChromeExecutable(config) {
  const candidates = [
    process.env.VA_CHROMIUM,
    process.env.CHROME_PATH,
    config?.browser?.executablePath, // bench/config.json; Google Chrome's own place by default
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('找不到 Chrome：在 bench/config.json 的 browser.executablePath 写它的位置（或设环境变量 VA_CHROMIUM）');
}

/**
 * Renders a URL in headless Chrome (CDP over --remote-debugging-pipe, no extra packages), waits for
 * `<x-dc>` boards and iframes to mount, collects console errors, uncaught exceptions,
 * `#__bundler_err` and `.sc-logic-error`, flags zero-size containers, and saves a PNG.
 */
export async function captureUrl(config, url, outputPath, { width = 1280, height = 800, fullPage = false, scale = 2, reducedMotion = false, inspect = null } = {}) {
  try {
    // inspect: an expression evaluated once the page is ready, just before the screenshot; its value comes back as `inspect`
    const r = await runCdpPipeCapture(config, url, outputPath, { width, height, fullPage, scale, reducedMotion, inspect });
    return { ...r, url, outputPath, width, height };
  } catch (pipeErr) {
    if (process.env.DEBUG) console.error(`[headless] CDP 截图没成，改走 Chrome 命令行：${pipeErr.message}`);
    const r = await runChromeCliScreenshot(config, url, outputPath, { width, height });
    return { ...r, url, outputPath, width, height, fallbackReason: pipeErr.message };
  }
}

const DOM_INSPECTION_EXPRESSION = `(() => {
  const bundlerLoading = document.getElementById('__bundler_loading');
  const bundlerErr = document.getElementById('__bundler_err');
  const logicErrors = Array.from(document.querySelectorAll('.sc-logic-error, .sc-placeholder-error'))
    .map(el => (el.textContent || '').trim())
    .filter(Boolean);

  const iframes = Array.from(document.querySelectorAll('iframe'));
  let iframesReady = true;
  const iframeErrors = [];
  for (const f of iframes) {
    const src = f.getAttribute('src') || '';
    if (src.startsWith('about:blank#')) {
      iframesReady = false;
      continue;
    }
    try {
      const doc = f.contentDocument;
      if (!doc || doc.readyState !== 'complete') {
        iframesReady = false;
        continue;
      }
      if (doc.getElementById('__bundler_loading')) {
        iframesReady = false;
      }
      if (doc.querySelector('x-dc')) {
        iframesReady = false;
      }
      const fErr = doc.getElementById('__bundler_err');
      if (fErr && fErr.textContent) iframeErrors.push(fErr.textContent.trim());
      for (const le of doc.querySelectorAll('.sc-logic-error, .sc-placeholder-error')) {
        if (le.textContent) iframeErrors.push(le.textContent.trim());
      }
    } catch {}
  }

  const unmountedXdc = Boolean(document.querySelector('x-dc'));
  // the runtime drops <x-dc> before React has drawn into #dc-root: wait until the root has a size
  // (a root that stays empty is still reported below, once the wait runs out)
  const dcRoot = document.getElementById('dc-root');
  const rootDrawn = !dcRoot || dcRoot.getBoundingClientRect().height > 0;
  const ready = document.readyState === 'complete' && !bundlerLoading && !unmountedXdc && iframesReady && rootDrawn;

  const zeroSizeSelectors = [];
  for (const sel of ['body', '#dc-root', 'section.board', 'iframe']) {
    const nodes = document.querySelectorAll(sel);
    nodes.forEach((node, idx) => {
      const r = node.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) {
        zeroSizeSelectors.push(sel + '[' + idx + '] (' + Math.round(r.width) + 'x' + Math.round(r.height) + ')');
      }
    });
  }

  return {
    ready,
    // a page Chrome could not open (a sandbox that blocks the port, say) is its own error page, not ours
    errorPage: location.protocol === 'chrome-error:' ? location.href : null,
    bundlerErr: bundlerErr ? bundlerErr.textContent.trim() : null,
    logicErrors: [...logicErrors, ...iframeErrors],
    zeroSizeElements: zeroSizeSelectors,
    iframeCount: iframes.length,
    docWidth: Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0),
    docHeight: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)
  };
})()`;

/**
 * Starts headless Chrome on a CDP pipe, attaches one page with the given viewport and calls fn with it:
 * fn({ send(method, params), consoleErrors, pageErrors, mainStatus() }). Chrome is closed when fn returns.
 */
async function withCdpPage(config, { width, height, scale = 2, reducedMotion = false }, fn) {
  const chromeBin = resolveChromeExecutable(config);
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-chrome-pipe-'));

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--allow-file-access-from-files',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--use-mock-keychain',
    '--password-store=basic',
    '--hide-scrollbars',
    `--user-data-dir=${profileDir}`,
    // a window smaller than about 500 px gives headless Chromium (Linux) no surface to capture: the viewport is set below anyway
    `--window-size=${Math.max(width, 800)},${Math.max(height, 600)}`,
    '--remote-debugging-pipe',
    'about:blank'
  ];

  const child = spawn(chromeBin, args, {
    stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
    env: { ...process.env, HOME: profileDir }
  });

  const pipeWrite = child.stdio[3];
  const pipeRead = child.stdio[4];

  let msgId = 0;
  const pending = new Map();
  const consoleErrors = [];
  const pageErrors = [];
  let mainStatus = 0;

  let recvBuf = '';
  pipeRead.on('data', (chunk) => {
    recvBuf += chunk.toString('utf8');
    let nullIdx;
    while ((nullIdx = recvBuf.indexOf('\0')) !== -1) {
      const rawMsg = recvBuf.slice(0, nullIdx);
      recvBuf = recvBuf.slice(nullIdx + 1);
      if (!rawMsg.trim()) continue;

      let data;
      try {
        data = JSON.parse(rawMsg);
      } catch {
        continue;
      }

      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) {
          reject(new Error(data.error.message || JSON.stringify(data.error)));
        } else {
          resolve(data.result);
        }
        continue;
      }

      if (data.method === 'Runtime.consoleAPICalled' && data.params?.type === 'error') {
        const text = (data.params.args || [])
          .map((a) => a.value ?? a.description ?? '')
          .join(' ');
        consoleErrors.push(text);
      } else if (data.method === 'Runtime.exceptionThrown') {
        const details = data.params?.exceptionDetails;
        const desc =
          details?.exception?.description ||
          details?.text ||
          'Uncaught runtime exception';
        pageErrors.push(desc);
      } else if (data.method === 'Network.responseReceived' && data.params?.type === 'Document' && !mainStatus) {
        // the first document response is the page itself (iframes come later)
        mainStatus = data.params.response?.status || 0;
      } else if (data.method === 'Log.entryAdded' && data.params?.entry?.level === 'error') {
        const entry = data.params.entry;
        // {{hole}} placeholders: the browser fetches <img src="{{src}}"> literally before the runtime fills it in
        const u = String(entry.url || '');
        if (!u.includes('favicon.ico') && !/%7B%7B|\{\{/i.test(u)) {
          consoleErrors.push(`[${entry.source}] ${entry.text} (${entry.url || ''})`);
        }
      }
    }
  });

  const sendCdp = (method, params = {}, sessionId = undefined) =>
    new Promise((resolve, reject) => {
      const id = ++msgId;
      const timer = setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`CDP timeout on ${method}`));
        }
      }, 15000);
      pending.set(id, {
        resolve: (res) => {
          clearTimeout(timer);
          resolve(res);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        }
      });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      pipeWrite.write(JSON.stringify(payload) + '\0');
    });

  try {
    const { targetInfos } = await sendCdp('Target.getTargets');
    let pageTarget = (targetInfos || []).find((t) => t.type === 'page');
    let targetId = pageTarget?.targetId;
    if (!targetId) {
      const created = await sendCdp('Target.createTarget', { url: 'about:blank' });
      targetId = created.targetId;
    }

    const { sessionId } = await sendCdp('Target.attachToTarget', {
      targetId,
      flatten: true
    });
    const send = (method, params = {}) => sendCdp(method, params, sessionId);

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Network.enable');
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
    if (reducedMotion) {
      // like the page lints: everything settles where it ends
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    }
    return await fn({ send, consoleErrors, pageErrors, mainStatus: () => mainStatus });
  } finally {
    try {
      pipeWrite.destroy();
      pipeRead.destroy();
    } catch {}
    await new Promise((resolve) => {
      child.once('close', () => resolve());
      try {
        child.kill('SIGKILL');
      } catch {
        resolve();
      }
      setTimeout(resolve, 500);
    });
    try {
      fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {}
  }
}


/** Navigates and polls until the document, nested iframes and <x-dc> have mounted. failed: nothing of ours is on screen. */
async function openAndSettle(ctx, targetUrl) {
  const nav = await ctx.send('Page.navigate', { url: targetUrl });
  // the page itself could not be opened: nothing below is ours to check, but it must not pass as a blank board
  if (nav?.errorText) ctx.pageErrors.push(`打不开页面：${nav.errorText}（${targetUrl}）。dw check 和 dw serve 要能启动 Chrome、连本机端口；在沙箱里跑要先放行`);

  let domReport = null;
  const deadline = Date.now() + (nav?.errorText ? 0 : 12000);
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const evalRes = await ctx.send('Runtime.evaluate', { expression: DOM_INSPECTION_EXPRESSION, returnByValue: true });
      domReport = evalRes?.result?.value || null;
      if (domReport?.ready) break;
    } catch {
      // Frame still navigating
    }
  }

  if (domReport?.errorPage) ctx.pageErrors.push(`Chrome 打开的是它自己的报错页（${domReport.errorPage}），不是画板。dw check 和 dw serve 要能启动 Chrome、连本机端口；在沙箱里跑要先放行`);
  if (ctx.mainStatus() >= 400) ctx.pageErrors.push(`页面返回 ${ctx.mainStatus()}（${targetUrl}）：文件不在，或者名字写错了`);
  const failed = Boolean(nav?.errorText || domReport?.errorPage || ctx.mainStatus() >= 400);
  return { domReport, failed };
}

async function runCdpPipeCapture(config, targetUrl, outputPath, { width, height, fullPage, scale = 2, reducedMotion = false, inspect = null }) {
  return withCdpPage(config, { width, height, scale, reducedMotion }, async (ctx) => {
    const { domReport, failed } = await openAndSettle(ctx, targetUrl);
    if (failed) {
      // nothing of ours is on screen, and an error page has no surface to capture (the screenshot call would hang)
      return { ...buildVerificationResult('chrome-cdp-pipe', ctx.consoleErrors, ctx.pageErrors, { ...(domReport || {}), ready: false, zeroSizeElements: [] }), inspect: null };
    }

    // Settle delay for fonts and SVG rendering
    await new Promise((r) => setTimeout(r, 250));

    if (fullPage && domReport?.docHeight > height) {
      await ctx.send('Emulation.setDeviceMetricsOverride', { width, height: Math.min(domReport.docHeight, 16000), deviceScaleFactor: scale, mobile: false });
      await new Promise((r) => setTimeout(r, 150));
    }

    let inspected = null;
    if (inspect) {
      try {
        const ev = await ctx.send('Runtime.evaluate', { expression: inspect, returnByValue: true, awaitPromise: true });
        inspected = ev?.result?.value ?? null;
      } catch (e) {
        inspected = { error: e.message };
      }
    }

    const shotRes = await ctx.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(shotRes.data, 'base64'));

    return { ...buildVerificationResult('chrome-cdp-pipe', ctx.consoleErrors, ctx.pageErrors, domReport), inspect: inspected };
  });
}

// Clicks the first button (or link, label, summary) whose text is `text`, or contains it, or whose aria-label is it.
const clickExpression = (text) => `(() => {
  const want = ${JSON.stringify(String(text))};
  const norm = (s) => (s || '').replace(/\\s+/g, ' ').trim();
  const all = [...document.querySelectorAll('button, a, [role="button"], summary, label')];
  const el = all.find((e) => norm(e.textContent) === want) || all.find((e) => norm(e.getAttribute('aria-label')) === want) || all.find((e) => norm(e.textContent).includes(want));
  if (!el) return false;
  el.scrollIntoView({ block: 'center' });
  el.click();
  return true;
})()`;

/**
 * dw frames：在不减弱动效的情况下，按时间线截几帧，让 Agent 看得到动效。
 * times：从「画板画完（点完 clicks）」那一刻算起的毫秒数，误差一两百毫秒；clicks：先依次点这些字的按钮，每点一个等 clickWait。
 * 返回 { frames: [{ t, actual, png }], missedClicks, passed, allErrors, ready }；png 是 Buffer。只为看，不保证两次一样。
 */
export async function captureFrames(config, url, { width = 1280, height = 800, scale = 1, times, clicks = [] }) {
  const clickWait = 400;
  return withCdpPage(config, { width, height, scale, reducedMotion: false }, async (ctx) => {
    const { domReport, failed } = await openAndSettle(ctx, url);
    if (failed) return { frames: [], missedClicks: [], ...buildVerificationResult('chrome-cdp-pipe', ctx.consoleErrors, ctx.pageErrors, { ...(domReport || {}), ready: false, zeroSizeElements: [] }) };
    const missedClicks = [];
    for (const text of clicks) {
      const r = await ctx.send('Runtime.evaluate', { expression: clickExpression(text), returnByValue: true });
      if (!r?.result?.value) missedClicks.push(text);
      await new Promise((res) => setTimeout(res, clickWait));
    }
    const t0 = Date.now();
    const frames = [];
    for (const t of times) {
      const wait = t0 + t - Date.now();
      if (wait > 0) await new Promise((res) => setTimeout(res, wait));
      const actual = Date.now() - t0;
      const shot = await ctx.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      frames.push({ t, actual, png: Buffer.from(shot.data, 'base64') });
    }
    return { frames, missedClicks, ...buildVerificationResult('chrome-cdp-pipe', ctx.consoleErrors, ctx.pageErrors, domReport) };
  });
}

async function runChromeCliScreenshot(config, targetUrl, outputPath, { width, height }) {
  const chromeBin = resolveChromeExecutable(config);
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-chrome-cli-'));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    '--no-first-run',
    '--no-default-browser-check',
    '--use-mock-keychain',
    '--password-store=basic',
    '--hide-scrollbars',
    `--user-data-dir=${profileDir}`,
    `--window-size=${width},${height}`,
    '--virtual-time-budget=4000',
    `--screenshot=${outputPath}`,
    targetUrl
  ];

  await new Promise((resolve, reject) => {
    const proc = spawn(chromeBin, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, HOME: profileDir }
    });
    let stderr = '';
    proc.stderr.on('data', (d) => {
      stderr += d.toString('utf8');
    });
    proc.on('close', (code) => {
      try {
        fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      } catch {}
      if (code === 0 && fs.existsSync(outputPath)) {
        resolve();
      } else {
        reject(new Error(`Chrome headless screenshot exited with code ${code}: ${stderr}`));
      }
    });
  });

  return buildVerificationResult('chrome-cli', ['截图走了备用方式（Chrome 命令行），没能检查报错'], [], {
    ready: true,
    bundlerErr: null,
    logicErrors: [],
    zeroSizeElements: [],
    iframeCount: 0
  });
}

function buildVerificationResult(driver, consoleErrors, pageErrors, domReport) {
  const bundlerErr = domReport?.bundlerErr || null;
  const logicErrors = domReport?.logicErrors || [];
  const zeroSizeElements = domReport?.zeroSizeElements || [];

  const allErrors = [
    ...consoleErrors,
    ...pageErrors,
    ...(bundlerErr ? [`[bundler_err] ${bundlerErr}`] : []),
    ...logicErrors.map((e) => `[dc-logic] ${e}`)
  ];

  const passed =
    Boolean(domReport?.ready) &&
    allErrors.length === 0 &&
    zeroSizeElements.length === 0;

  return {
    driver,
    passed,
    ready: Boolean(domReport?.ready),
    iframeCount: domReport?.iframeCount ?? 0,
    consoleErrors,
    pageErrors,
    bundlerErr,
    logicErrors,
    zeroSizeElements,
    allErrors
  };
}
