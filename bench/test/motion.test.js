import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadConfig, BENCH_ROOT, REPO_ROOT } from '../src/utils/config.js';
import { startServer } from '../src/server/server.js';
import { listMotionSchemes, readMotion, closeExportBrowser } from '../src/motion/parts.js';
import { resolveChromeExecutable } from '../src/server/headless.js';

// The motion bench reads this repository's schemes/ (the real parts) but writes exports into a temp dist/
// (config.distAbs): nothing under the real dist/ or canvases/ is touched.
function tempConfig() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-motion-'));
  fs.mkdirSync(path.join(root, 'canvases'));
  return loadConfig({ rootDir: root, canvasesDir: path.join(root, 'canvases'), runtimeAbs: path.join(BENCH_ROOT, 'vendor/claude-design/dc-runtime.js'), distAbs: path.join(root, 'dist') });
}
const PART = ['pomelo', 'tooltip'];
const hasPart = fs.existsSync(path.join(REPO_ROOT, 'schemes', ...PART.slice(0, 1), 'motion', PART[1], 'motion.json'));

let chrome = null;
try {
  chrome = resolveChromeExecutable(loadConfig());
} catch {}
let playwright = true;
try {
  await import('playwright-core');
} catch {
  playwright = false;
}

test('motion bench: schemes and parts listed from schemes/, the part page is the exporter\'s, nothing escapes', { skip: hasPart ? false : '仓库里没有 schemes/pomelo/motion/tooltip' }, async () => {
  const config = tempConfig();
  const schemes = listMotionSchemes(config);
  const pomelo = schemes.find((s) => s.name === 'pomelo');
  assert.ok(pomelo && pomelo.parts >= 1 && pomelo.title.includes('Pomelo'));
  const m = await readMotion(config, 'pomelo');
  const tip = m.parts.find((p) => p.id === 'tooltip');
  assert.equal(tip.tier, 'calm');
  assert.ok(tip.capture.steps.length >= 1 && tip.capture.steps.every((s) => typeof s.at === 'number'));
  assert.ok(m.palettes.length >= 1 && m.defaultPalette);
  // nothing exported into the temp dist yet
  assert.deepEqual(tip.exported, {});
  // legacy playClass parts come back as one step at 0
  const ver = await readMotion(config, 'vermilion');
  if (ver) for (const p of ver.parts) assert.ok(p.error || p.capture.steps[0]?.at === 0, p.id);

  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const get = (p) => fetch(srv.baseUrl + p);
    assert.ok((await (await get('/api/motion')).json()).schemes.some((s) => s.name === 'pomelo'));
    assert.equal((await (await get('/api/motion/pomelo')).json()).parts.find((p) => p.id === 'tooltip').title, tip.title);
    // the page: tooling's partPage (theme, Design System base, the fragment), plus the harness module; reduce puts
    // emulate.js first in <head>
    const { partPage } = await import(pathToFileURL(path.join(REPO_ROOT, 'tooling/render/motion.mjs')).href);
    const mine = await partPage(...PART, 'dark');
    const html = await (await get('/motion/pomelo/tooltip.html?theme=dark&reduce=1')).text();
    assert.ok(html.includes('data-theme="dark"') && html.includes('/_va/motion-harness.mjs'));
    assert.ok(/<head[^>]*><script src="\/board\/emulate\.js\?motion=reduce"><\/script>/.test(html));
    const strip = (s) => s.replace(/<script src="\/board\/emulate\.js[^"]*"><\/script>/, '').replace(/<script type="module">import \* as H[\s\S]*?<\/script><\/body>/, '</body>');
    assert.equal(strip(html), mine);
    const harness = await (await get('/_va/motion-harness.mjs')).text();
    assert.equal(harness, fs.readFileSync(path.join(REPO_ROOT, 'tooling/lib/motion-harness.mjs'), 'utf8'));
    assert.equal((await get('/motion/pomelo/nope.html')).status, 404);
    assert.equal((await get('/api/motion/nope')).status, 404);
    assert.equal((await get('/motion/pomelo/tooltip/..%2F..%2F..%2Fpackage.json')).status, 404);
    assert.equal((await get('/api/motion/pomelo/tooltip/export')).status, 405);
  } finally {
    await srv.close();
  }
});

test('motion bench: exporting through the bench gives the same bytes as tooling\'s renderPart', { skip: !hasPart ? '仓库里没有 schemes/pomelo/motion/tooltip' : !chrome || !playwright ? '没有 Chrome 或 playwright-core' : false, timeout: 180000 }, async () => {
  // the bench exports with Chrome unless told otherwise (the repo's builds run with VA_BROWSER_CHANNEL=chrome); so does this
  if (!process.env.VA_CHROMIUM && !process.env.VA_BROWSER_CHANNEL) process.env.VA_BROWSER_CHANNEL = 'chrome';
  const config = tempConfig();
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  let viaBench;
  try {
    const r = await fetch(`${srv.baseUrl}/api/motion/pomelo/tooltip/export`, { method: 'POST' });
    const body = await r.json();
    assert.equal(r.status, 200, body.message);
    assert.deepEqual(body.rows.map((x) => x.theme).sort(), ['dark', 'light']);
    assert.ok(body.part.exported.light.gif.startsWith('/motion/pomelo/tooltip/tooltip-light.gif'));
    // the files it wrote are served back
    const gif = await fetch(srv.baseUrl + body.part.exported.light.gif);
    assert.equal(gif.headers.get('content-type'), 'image/gif');
    viaBench = path.join(config.distAbs, 'pomelo', 'motion', 'tooltip');
  } finally {
    await srv.close();
    await closeExportBrowser();
  }

  const { renderPart } = await import(pathToFileURL(path.join(REPO_ROOT, 'tooling/render/motion.mjs')).href);
  const { launchBrowser } = await import(pathToFileURL(path.join(REPO_ROOT, 'tooling/lib/browser.mjs')).href);
  const direct = path.join(config.rootDir, 'direct');
  const browser = await launchBrowser();
  try {
    await renderPart(browser, ...PART, { out: direct });
  } finally {
    await browser.close();
  }
  for (const f of ['tooltip-light.gif', 'tooltip-dark.gif', 'contact-light.png', 'contact-dark.png']) {
    assert.ok(fs.readFileSync(path.join(viaBench, f)).equals(fs.readFileSync(path.join(direct, f))), `${f} 和 tooling 导出的不一样`);
  }
});
