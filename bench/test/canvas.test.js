import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadConfig, sha256, BENCH_ROOT, REPO_ROOT } from '../src/utils/config.js';
import { listCanvases, trackedFiles, canvasDir } from '../src/canvas/store.js';
import { snapshot, listVersions, restore } from '../src/canvas/versions.js';
import { createCanvas, importBundle } from '../src/canvas/create.js';
import { addTarget, listTargets, addBlobMap, planPull, applyPull, verify, planBlobs, applyBlobs, planPublish, recordPublish, runtimeDrift } from '../src/canvas/cloud.js';
import { encodeManifestEntry } from '../src/bundler/codec.js';
import { startServer } from '../src/server/server.js';
import { benchStatus, boardAddress } from '../src/cli/commands.js';
import { listSystems, readSystem, installSystem, fontLinks } from '../src/ds/systems.js';
import { runCheck } from '../src/canvas/check.js';
import { runFrames, frameTimes, MAX_FRAMES } from '../src/canvas/frames.js';
import { packBoard, exportBoards } from '../src/canvas/export.js';
import { captureUrl, resolveChromeExecutable } from '../src/server/headless.js';
import { listReviews, setReview, clearReview } from '../src/canvas/review.js';
import { renameCanvas, deleteCanvas, renamePage, deletePage, renameBoard, deleteBoard, renameScheme, readNames, withNames, listTrash, restoreTrash, emptyTrash } from '../src/canvas/manage.js';
import { catalog } from '../src/server/catalog.js';
import { colorGroups } from '../src/board/ds.js';
import { seedCache, runtimeResources, prefetchPage, readCached } from '../src/server/offline.js';

// Every test works in its own temp folder; nothing under the real canvases/ is touched.
function tempConfig() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-test-'));
  fs.mkdirSync(path.join(root, 'canvases'));
  return loadConfig({ rootDir: root, canvasesDir: path.join(root, 'canvases'), runtimeAbs: path.join(BENCH_ROOT, 'vendor/claude-design/dc-runtime.js'), cacheAbs: path.join(root, 'cache') });
}

/** A fake list_files result for what the cloud holds: rel → bytes. */
function listingOf(files, version = 'v1') {
  return {
    version,
    files: [
      { path: 'index.html', sha256: 'x', of_type: true },
      ...Object.entries(files).map(([p, b]) => ({ path: p, size: b.length, sha256: sha256(Buffer.from(b)) }))
    ]
  };
}

const ID_A = 'a'.repeat(32);
const ID_REMOTE = 'b'.repeat(32);
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect width="4" height="4" fill="#123"></rect></svg>';

test('new canvas: canvas.json + Main.dc.html, listed, first version saved', () => {
  const config = tempConfig();
  createCanvas(config, 'demo', { title: '示例' });
  const [c] = listCanvases(config);
  assert.equal(c.name, 'demo');
  assert.equal(c.kind, 'canvas');
  assert.equal(c.boards, 1);
  assert.deepEqual(Object.keys(trackedFiles(config, 'demo')), ['project/Main.dc.html', 'project/canvas.json']);
  assert.equal(listVersions(config, 'demo').length, 1);
  // the README every canvas carries, so the next step of design-loop (read it) has something to read
  const readme = fs.readFileSync(path.join(canvasDir(config, 'demo'), 'README.md'), 'utf8');
  assert.ok(readme.startsWith('# 示例') && readme.includes('check demo') && readme.includes('.shots/check/'));
  assert.throws(() => createCanvas(config, 'Bad Name'));
});

test('versions: unchanged state is not saved twice; restore brings files back', () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  const main = path.join(canvasDir(config, 'demo'), 'project/Main.dc.html');
  const first = listVersions(config, 'demo')[0];
  assert.equal(snapshot(config, 'demo').reused, true);
  fs.writeFileSync(main, 'changed');
  fs.writeFileSync(path.join(canvasDir(config, 'demo'), 'project/extra.md'), 'x');
  snapshot(config, 'demo', 'edit', { at: new Date(Date.now() + 2000) });
  restore(config, 'demo', first.id);
  assert.notEqual(fs.readFileSync(main, 'utf8'), 'changed');
  assert.equal(fs.existsSync(path.join(canvasDir(config, 'demo'), 'project/extra.md')), false);
});

test('pull: plan, match downloads by sha256, verify every file, keep a version', () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  addTarget(config, 'demo', 'slug-home', { url: 'https://claude.ai/artifact/x', blobs: 'same' });
  const dir = canvasDir(config, 'demo');
  const canvasJson = fs.readFileSync(path.join(dir, 'project/canvas.json'), 'utf8');
  const cloud = { 'project/canvas.json': canvasJson, 'project/Main.dc.html': '<x-dc>cloud</x-dc>', 'project/DESIGN.md': '# rules' };
  const listing = listingOf(cloud);

  const plan = planPull(config, 'demo', listing);
  assert.equal(plan.same, 1);
  assert.deepEqual(plan.changed, ['project/Main.dc.html']);
  assert.deepEqual(plan.added, ['project/DESIGN.md']);
  assert.equal(plan.readFileBatches.flat().length, 2);

  const dl = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-dl-'));
  fs.writeFileSync(path.join(dl, 'random-name-1'), cloud['project/Main.dc.html']);
  assert.throws(() => applyPull(config, 'demo', listing, [dl]), /还缺 1 个/);
  fs.writeFileSync(path.join(dl, 'random-name-2'), cloud['project/DESIGN.md']);
  const r = applyPull(config, 'demo', listing, [dl]);
  assert.equal(r.verified, 3);
  assert.equal(verify(config, 'demo', listing).bad.length, 0);
  assert.deepEqual(listVersions(config, 'demo').map((v) => v.label).slice(-1), ['pull']);
});

test('publish to another copy: upload list, blob ids rewritten in a staged copy, record checks', () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  addTarget(config, 'demo', 'slug-home', { blobs: 'same' });
  const dir = canvasDir(config, 'demo');
  fs.mkdirSync(path.join(dir, 'blobs'));
  fs.writeFileSync(path.join(dir, 'blobs', `${ID_A}.svg`), SVG);
  const board = `<x-dc><img src="/_blob/${ID_A}"></x-dc>`;
  fs.writeFileSync(path.join(dir, 'project/Main.dc.html'), board);

  // home uses the same ids: nothing to upload, files go as they are
  const home = planPublish(config, 'demo', null);
  assert.equal(home.needUpload, undefined);
  assert.ok(home.publishFilesCalls[0].every((f) => f.path.startsWith(path.join(dir, 'project'))));
  assert.equal(home.publishFilesCalls[0].at(-1).as, 'project/canvas.json');

  addTarget(config, 'demo', 'slug-copy');
  const first = planPublish(config, 'demo', null, { target: 'slug-copy' });
  assert.equal(first.needUpload, true);
  assert.equal(first.uploads[0].name, `${ID_A}.svg`);
  addBlobMap(config, 'demo', 'slug-copy', [{ name: `${ID_A}.svg`, url: `/_blob/${ID_REMOTE}` }]);
  const plan = planPublish(config, 'demo', null, { target: 'slug-copy' });
  const sent = plan.publishFilesCalls.flat().find((f) => f.as === 'project/Main.dc.html');
  assert.ok(sent.path.includes(`${path.sep}.stage${path.sep}`));
  assert.ok(fs.readFileSync(sent.path, 'utf8').includes(`/_blob/${ID_REMOTE}`));
  assert.equal(fs.readFileSync(path.join(dir, 'project/Main.dc.html'), 'utf8'), board);

  const cloud = Object.fromEntries(plan.publishFilesCalls.flat().map((f) => [f.as, fs.readFileSync(f.path, 'utf8')]));
  const r = recordPublish(config, 'demo', listingOf(cloud), { target: 'slug-copy' });
  assert.equal(r.verified, 2);
  assert.equal(planPublish(config, 'demo', listingOf(cloud), { target: 'slug-copy' }).publishFilesCalls.length, 0);

  // pulling the copy back maps its ids to the local ones
  const back = planPull(config, 'demo', listingOf(cloud), { target: 'slug-copy' });
  assert.equal(back.same, 2);
  const blobs = planBlobs(config, 'demo', { assets: [{ opaque_id: ID_REMOTE, content_type: 'image/svg+xml', sha256: sha256(Buffer.from(SVG)) }] }, { target: 'slug-copy' });
  assert.equal(blobs.same, 1);
});

test('blobs: missing ones are listed and stored as blobs/<id>.<ext>', () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  addTarget(config, 'demo', 'slug-home', { blobs: 'same' });
  const assets = { assets: [{ opaque_id: ID_A, content_type: 'image/svg+xml', sha256: sha256(Buffer.from(SVG)), size_bytes: SVG.length }] };
  assert.equal(planBlobs(config, 'demo', assets).need.length, 1);
  const dl = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-dl-'));
  fs.writeFileSync(path.join(dl, 'whatever.txt'), SVG);
  applyBlobs(config, 'demo', assets, [dl]);
  assert.equal(fs.readFileSync(path.join(canvasDir(config, 'demo'), 'blobs', `${ID_A}.svg`), 'utf8'), SVG);
  assert.equal(planBlobs(config, 'demo', assets).need.length, 0);
});

test('import: a standalone export becomes canvas.json + .dc.html + blobs', async () => {
  const config = tempConfig();
  const page = '0c81346e-ec35-491c-8d16-fc24b51ed21a';
  const runtime = '7082c4d2-af20-4139-891c-5ca5457e8573';
  const img = '11111111-2222-4333-8444-555555555555';
  const j = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
  const inner = `<!DOCTYPE html><html><head><title>S1</title><script src="${runtime}"></script></head><body><x-dc><div style="width: 400px; height: 300px"><img src="${img}"></div></x-dc></body></html>`;
  const innerBundle = `<!DOCTYPE html><html><head><title>S1</title></head><body>
<script type="__bundler/manifest">${j({ [runtime]: encodeManifestEntry('window.__dcBoot=1', 'text/javascript'), [img]: encodeManifestEntry(SVG, 'image/svg+xml') })}</script>
<script type="__bundler/template">${j(inner)}</script></body></html>`;
  const root = `<!DOCTYPE html><html><head><title>Demo</title></head><body><section class="board"><h2>S1 贴纸</h2><iframe src="about:blank#${page}" title="S1 贴纸" width="400" height="300"></iframe></section></body></html>`;
  const bundle = `<!DOCTYPE html><html><head><title>Demo</title></head><body>
<script type="__bundler/manifest">${j({ [page]: encodeManifestEntry(innerBundle, 'text/html') })}</script>
<script type="__bundler/page_order">${j([page])}</script>
<script type="__bundler/template">${j(root)}</script></body></html>`;
  const file = path.join(config.rootDir, 'export.html');
  fs.writeFileSync(file, bundle);

  const r = await importBundle(config, file, 'imported');
  assert.equal(r.boards, 1);
  const dir = canvasDir(config, 'imported');
  const main = fs.readFileSync(path.join(dir, 'project/Main.dc.html'), 'utf8');
  assert.ok(main.includes('<script src="./support.js"></script>'));
  const id = img.replace(/-/g, '');
  assert.ok(main.includes(`/_blob/${id}`));
  assert.equal(fs.readFileSync(path.join(dir, 'blobs', `${id}.svg`), 'utf8'), SVG);
  const canvas = JSON.parse(fs.readFileSync(path.join(dir, 'project/canvas.json'), 'utf8'));
  assert.deepEqual(canvas.boards['Main.dc.html'], { x: 0, y: 0, w: 400, h: 300, title: 'S1 贴纸', is_interactive: true });
});

test('server: board files, support.js = runtime, /_blob/, API, no escaping the canvas', async () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  const dir = canvasDir(config, 'demo');
  fs.mkdirSync(path.join(dir, 'blobs'));
  fs.writeFileSync(path.join(dir, 'blobs', `${ID_A}.svg`), SVG);
  fs.writeFileSync(path.join(config.rootDir, 'secret.txt'), 'no');
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const get = (p) => fetch(srv.baseUrl + p);
    assert.equal((await get('/c/demo/Main.dc.html')).status, 200);
    const rt = Buffer.from(await (await get('/c/demo/support.js')).arrayBuffer());
    assert.equal(sha256(rt), sha256(fs.readFileSync(config.runtimeAbs)));
    const blob = await get(`/_blob/${ID_A}`);
    assert.equal(blob.headers.get('content-type'), 'image/svg+xml');
    assert.equal(await blob.text(), SVG);
    assert.equal((await (await get('/api/canvases')).json()).canvases[0].name, 'demo');
    assert.equal((await get('/c/demo/..%2F..%2Fsecret.txt')).status, 404);
    assert.equal((await get('/c/demo/../../secret.txt')).status, 404);
  } finally {
    await srv.close();
  }
});

test('server: versions API, old files under /v/, the board UI, favicon', async () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  const dir = canvasDir(config, 'demo');
  const first = listVersions(config, 'demo')[0];
  fs.writeFileSync(path.join(dir, 'project/Main.dc.html'), 'changed');
  snapshot(config, 'demo', 'edit', { at: new Date(Date.now() + 2000) });
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const get = (p) => fetch(srv.baseUrl + p);
    const vs = (await (await get('/api/canvases/demo/versions')).json()).versions;
    assert.deepEqual(vs.map((v) => v.label), ['new', 'edit']);
    const old = await (await get(`/v/demo/${first.id}/Main.dc.html`)).text();
    assert.ok(old.includes('<x-dc>'));
    assert.equal(await (await get('/c/demo/Main.dc.html')).text(), 'changed');
    const oldCanvas = (await (await get(`/api/canvases/demo?version=${first.id}`)).json());
    assert.equal(oldCanvas.version, first.id);
    assert.equal((await get(`/v/demo/${first.id}/support.js`)).status, 200);
    assert.equal((await get(`/v/demo/${first.id}/..%2F..%2Fcloud.json`)).status, 404);
    assert.equal((await get('/favicon.ico')).status, 204);
    const ui = await get('/');
    assert.ok((await ui.text()).includes('/board/board.js'));
    assert.equal((await get('/board/board.js')).headers.get('content-type'), 'text/javascript; charset=utf-8');
  } finally {
    await srv.close();
  }
});

test('interface for another program: status says who answers, stop only for a server that can, open gives the address', async () => {
  const config = tempConfig();
  createCanvas(config, 'demo', { title: '演示' });
  // a server someone owns (no onStop): says so, and refuses to stop
  const owned = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const st = await benchStatus(owned.baseUrl);
    assert.equal(st.app, 'visual-atelier-bench');
    assert.deepEqual([st.api, st.pid, st.canvases, st.stoppable, st.url], [5, process.pid, 1, false, owned.baseUrl]);
    const r = await fetch(`${owned.baseUrl}/api/stop`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(r.status, 409);
    assert.equal((await fetch(`${owned.baseUrl}/api/stop`)).status, 405);
  } finally {
    await owned.close();
  }
  // one started like dw serve: a form post from a web page is refused, a JSON post stops it
  let stopped = false;
  const srv = await startServer(config, { port: 0, watch: false, quiet: true, onStop: () => (stopped = true) });
  try {
    assert.equal((await benchStatus(srv.baseUrl)).stoppable, true);
    const form = await fetch(`${srv.baseUrl}/api/stop`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' });
    assert.equal(form.status, 400);
    assert.equal(stopped, false);
    const ok = await fetch(`${srv.baseUrl}/api/stop`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.deepEqual(await ok.json(), { ok: true });
    await new Promise((r) => setTimeout(r, 120));
    assert.equal(stopped, true);
  } finally {
    await srv.close();
  }
  // nothing on the port (or something that isn't this server): not running
  assert.equal(await benchStatus(srv.baseUrl), null);
  assert.equal(boardAddress('http://127.0.0.1:4321', 'demo'), 'http://127.0.0.1:4321/#/demo');
  assert.equal(boardAddress('http://127.0.0.1:4321', 'demo', { page: 'p2', board: 'Main.dc.html' }), 'http://127.0.0.1:4321/#/demo?page=p2&board=Main.dc.html');
});

test('five lists: /api/index and dw list put canvases and pages in Explore Deck and Questionnaire, then Checks; boards on the canvas view get embed.js', async () => {
  const config = tempConfig();
  createCanvas(config, 'demo', { title: '演示' });
  const page = path.join(config.canvasesAbs, 'qp');
  fs.mkdirSync(page);
  fs.writeFileSync(path.join(page, 'cloud.json'), JSON.stringify({ kind: 'page', title: '问卷', entry: 'survey.html', targets: {} }));
  fs.writeFileSync(path.join(page, 'survey.html'), '<!doctype html><html><head><title>t</title></head><body>问卷</body></html>');
  assert.deepEqual(listCanvases(config).map((c) => [c.name, c.deck]), [['demo', 'explore'], ['qp', 'questionnaire']]);
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const { sections } = await (await fetch(`${srv.baseUrl}/api/index`)).json();
    assert.deepEqual(sections.map((s) => s.title), ['Design System', 'Motion Deck', 'Explore Deck', 'Questionnaire', 'Checks']);
    assert.deepEqual(sections.at(-1).items.map((i) => [i.name, i.route]), [['all', '/qa/all']]);
    const explore = sections.find((s) => s.id === 'explore').items;
    assert.deepEqual(explore.map((i) => [i.name, i.title, i.sub, i.route]), [['demo', '演示', '1 张板', '/demo']]);
    const q = sections.find((s) => s.id === 'questionnaire').items;
    assert.deepEqual(q.map((i) => [i.name, i.sub, i.page]), [['qp', '问卷页', '/c/qp/']]);
    // the board UI asks for ?va-embed=1 on the canvas view: embed.js first in <head>; anywhere else the board is as it is
    const plain = await (await fetch(`${srv.baseUrl}/c/demo/Main.dc.html`)).text();
    const embedded = await (await fetch(`${srv.baseUrl}/c/demo/Main.dc.html?va-embed=1&va-scheme=dark`)).text();
    assert.ok(!plain.includes('/board/embed.js'));
    assert.match(embedded, /<head[^>]*><script src="\/board\/embed.js"><\/script><script src="\/board\/emulate.js\?scheme=dark"><\/script>/);
    assert.equal((await fetch(`${srv.baseUrl}/board/embed.js`)).status, 200);
  } finally {
    await srv.close();
  }
});

test('checks: npm run all\'s results from dist/, a line for the menu, images under /_dist/ only', async () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-qa-'));
  const config = { ...tempConfig(), repoAbs: repo };
  const w = (rel, data) => {
    fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
    fs.writeFileSync(path.join(repo, rel), typeof data === 'string' ? data : JSON.stringify(data));
  };
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  const index = async () => (await (await fetch(`${srv.baseUrl}/api/index`)).json()).sections.find((x) => x.id === 'checks').items[0];
  try {
    // never run: says so
    assert.match((await index()).sub, /还没跑过/);
    assert.equal((await (await fetch(`${srv.baseUrl}/api/checks`)).json()).run, null);
    // a run that stopped at build:marks, a scheme report with an image, the watermark report
    w('dist/qa/run.json', { status: 'fail', pid: 1, startedAt: '2026-11-15T02:00:00Z', finishedAt: '2026-11-15T02:03:00Z', steps: [{ id: 'build:tokens', status: 'pass', ms: 10, log: [] }, { id: 'build:marks', title: '资产导出 PNG', status: 'fail', ms: 20, log: ['坏了'] }, { id: 'qa', status: 'skipped', log: [] }] });
    w('dist/demo/qa-report.json', { items: [{ scheme: 'demo', group: '体积', name: 'big.png', status: 'fail', detail: '2 MB 超过 1.5 MB', file: 'dist/demo/marks/png/big.png' }, { scheme: 'demo', group: '资产', name: 'x', status: 'pass' }] });
    w('dist/demo/marks/png/big.png', 'PNG');
    w('dist/qa/watermark.json', { items: [{ name: '位置', status: 'pass' }] });
    w('secret.txt', 'no');
    const body = await (await fetch(`${srv.baseUrl}/api/checks`)).json();
    assert.equal(body.run.status, 'fail');
    assert.deepEqual(body.schemes.map((x) => [x.scheme, x.items.length]), [['demo', 2]]);
    assert.equal(body.watermark.items.length, 1);
    assert.match((await index()).sub, /没过：build:marks，1 项/);
    assert.equal(await (await fetch(`${srv.baseUrl}/_dist/demo/marks/png/big.png`)).text(), 'PNG');
    assert.equal((await fetch(`${srv.baseUrl}/_dist/../secret.txt`)).status, 404);
    assert.equal((await fetch(`${srv.baseUrl}/_dist/%2e%2e/secret.txt`)).status, 404);
    // starting a run: JSON only, and not while one is going (a live pid: this process)
    assert.equal((await fetch(`${srv.baseUrl}/api/checks/run`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' })).status, 400);
    w('dist/qa/run.json', { status: 'running', pid: process.pid, startedAt: '2026-11-15T02:00:00Z', steps: [{ id: 'build:ds', status: 'running', log: [] }] });
    assert.match((await index()).sub, /正在跑：build:ds/);
    const busy = await fetch(`${srv.baseUrl}/api/checks/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(busy.status, 409);
    // a run whose process is gone is not "running"
    w('dist/qa/run.json', { status: 'running', pid: 999999, startedAt: '2026-11-15T02:00:00Z', steps: [] });
    assert.match((await index()).sub, /没跑完/);
  } finally {
    await srv.close();
  }
});

test('approve and reject from inside another program\'s page (the way Pomelo\'s 有板有眼 frames the bench)', async (t) => {
  let chromium;
  try {
    const pw = await import('playwright-core');
    chromium = pw.chromium || pw.default.chromium;
  } catch {
    return t.skip('没装 playwright-core：在仓库根目录 npm ci');
  }
  const config = tempConfig();
  twoPages(config);
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  // the outer page lives on another origin (Pomelo's is tauri://localhost) and only listens
  const outer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html><body style="margin:0"><script>window.got = []; addEventListener('message', (e) => { if (e.data && e.data.source === 'dw') window.got.push(e.data); });</script><iframe id="f" src="${srv.baseUrl}/#/deck?page=p2&board=B.dc.html" style="width:1200px;height:800px;border:0"></iframe></body></html>`);
  });
  await new Promise((r) => outer.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ channel: 'chrome' }).catch(() => null);
  if (!browser) {
    outer.close();
    await srv.close();
    return t.skip('没有 Chrome');
  }
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await page.goto(`http://localhost:${outer.address().port}/`);
    const frame = page.frameLocator('#f');
    await frame.locator('#focus-approve').click();
    await page.waitForFunction(() => window.got.some((m) => m.type === 'reviews' && m.reviews['B.dc.html']?.status === 'approved'));
    assert.equal(listReviews(config, 'deck')['B.dc.html'].status, 'approved');
    assert.equal(listReviews(config, 'deck')['B.dc.html'].by, 'owner');
    // reject with a reason typed in the frame
    await frame.locator('#focus-reject').click();
    await frame.locator('#review-menu textarea').fill('颜色再暖一点');
    await frame.locator('#review-menu button', { hasText: '退回' }).click();
    await page.waitForFunction(() => window.got.some((m) => m.type === 'reviews' && m.reviews['B.dc.html']?.status === 'rejected'));
    assert.deepEqual([listReviews(config, 'deck')['B.dc.html'].status, listReviews(config, 'deck')['B.dc.html'].note], ['rejected', '颜色再暖一点']);
    // the route message tells the outer page where the frame is
    assert.ok(await page.evaluate(() => window.got.some((m) => m.type === 'route' && m.name === 'deck' && m.board === 'B.dc.html')));
  } finally {
    await browser.close();
    outer.close();
    await srv.close();
  }
});

test('embed.js holds a board still: CSS animations pause, requestAnimationFrame callbacks wait and come back', async (t) => {
  let chromium;
  try {
    const pw = await import('playwright-core');
    chromium = pw.chromium || pw.default.chromium;
  } catch {
    return t.skip('没装 playwright-core：在仓库根目录 npm ci');
  }
  const config = tempConfig();
  createCanvas(config, 'demo');
  fs.writeFileSync(path.join(canvasDir(config, 'demo'), 'project', 'Spin.dc.html'), `<!doctype html><html><head><title>t</title>
<style>@keyframes spin { to { transform: rotate(360deg); } } .s { width: 20px; height: 20px; animation: spin 1s linear infinite; }</style></head>
<body><div class="s"></div><script>window.ticks = 0; const f = () => { window.ticks++; requestAnimationFrame(f); }; requestAnimationFrame(f);</script></body></html>`);
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  const browser = await chromium.launch({ channel: 'chrome' }).catch(() => null);
  if (!browser) {
    await srv.close();
    return t.skip('没有 Chrome');
  }
  try {
    const page = await browser.newPage();
    await page.goto(`${srv.baseUrl}/c/demo/Spin.dc.html?va-embed=1`);
    await page.waitForFunction(() => window.ticks > 5);
    await page.evaluate(() => window.__vaFreeze(true));
    const held = await page.evaluate(async () => {
      const t0 = window.ticks;
      await new Promise((r) => setTimeout(r, 300));
      return { moved: window.ticks - t0, state: getComputedStyle(document.querySelector('.s')).animationPlayState };
    });
    assert.deepEqual(held, { moved: 0, state: 'paused' });
    await page.evaluate(() => window.__vaFreeze(false));
    const back = await page.evaluate(async () => {
      const t0 = window.ticks;
      await new Promise((r) => setTimeout(r, 300));
      return { moved: window.ticks - t0 > 3, state: getComputedStyle(document.querySelector('.s')).animationPlayState };
    });
    assert.deepEqual(back, { moved: true, state: 'running' });
  } finally {
    await browser.close();
    await srv.close();
  }
});

/** A canvas with two pages: p1 has A (no page named, so the first page's) and a note; p2 has B and C. */
function twoPages(config, name = 'deck') {
  createCanvas(config, name, { title: '旧名字' });
  const dir = canvasDir(config, name);
  const cpath = path.join(dir, 'project', 'canvas.json');
  const c = JSON.parse(fs.readFileSync(cpath, 'utf8'));
  for (const f of ['A.dc.html', 'B.dc.html', 'C.dc.html']) fs.writeFileSync(path.join(dir, 'project', f), `<!doctype html><title>${f}</title>`);
  fs.rmSync(path.join(dir, 'project', 'Main.dc.html'));
  c.pages = [{ id: 'p1', name: '第一页' }, { id: 'p2', name: '第二页' }];
  c.boards = { 'A.dc.html': { x: 0, y: 0, w: 10, h: 10, title: 'A' }, 'B.dc.html': { x: 0, y: 0, w: 10, h: 10, title: 'B', page: 'p2' }, 'C.dc.html': { x: 20, y: 0, w: 10, h: 10, title: 'C', page: 'p2' } };
  c.order = ['A.dc.html', 'B.dc.html', 'C.dc.html'];
  c.notes = { n1: { x: 0, y: -40, text: '一张便签', page: 'p2' } };
  c.launch = { view: 'canvas', page: 'p2' };
  fs.writeFileSync(cpath, JSON.stringify(c, null, 2));
  return { dir, cpath, read: () => JSON.parse(fs.readFileSync(cpath, 'utf8')) };
}

test('rename and delete: titles change and folders stay; a deleted page or canvas goes to the trash and comes back as it was', () => {
  const config = tempConfig();
  const { dir, read } = twoPages(config);
  // rename: title in cloud.json and canvas.json, folder unchanged
  renameCanvas(config, 'deck', '  新的  名字 ');
  assert.equal(listCanvases(config)[0].title, '新的 名字');
  assert.equal(read().title, '新的 名字');
  assert.throws(() => renameCanvas(config, 'deck', '   '), /不能是空的/);
  assert.throws(() => renameCanvas(config, 'nope', 'x'), /没有画布/);
  renamePage(config, 'deck', 'p2', '第二页 · 改过');
  assert.equal(read().pages[1].name, '第二页 · 改过');
  assert.throws(() => renamePage(config, 'deck', 'p9', 'x'), /没有这一页/);
  assert.ok(listVersions(config, 'deck').some((v) => v.label === 'before-rename'));

  // delete page p2: B, C, the note, B's review record go; the launch page moves; A stays on p1
  setReview(config, 'deck', 'B.dc.html', 'approved', { by: 'owner' });
  const before = read();
  const gone = deletePage(config, 'deck', 'p2');
  let c = read();
  assert.deepEqual(c.pages.map((p) => p.id), ['p1']);
  assert.deepEqual(Object.keys(c.boards), ['A.dc.html']);
  assert.deepEqual(c.order, ['A.dc.html']);
  assert.deepEqual(c.notes, {});
  assert.equal(c.launch.page, 'p1');
  assert.ok(!fs.existsSync(path.join(dir, 'project', 'B.dc.html')));
  assert.deepEqual(listReviews(config, 'deck'), {});
  assert.throws(() => deletePage(config, 'deck', 'p1'), /只剩这一页/);
  assert.equal(listTrash(config)[0].id, gone.id);

  // restore: page back in its place, boards, note, order and review record as they were
  restoreTrash(config, gone.id);
  c = read();
  assert.deepEqual(c.pages, before.pages);
  assert.deepEqual(c.order, before.order);
  assert.deepEqual(c.notes, before.notes);
  assert.deepEqual(Object.keys(c.boards).sort(), ['A.dc.html', 'B.dc.html', 'C.dc.html']);
  assert.equal(c.boards['B.dc.html'].page, 'p2');
  assert.equal(listReviews(config, 'deck')['B.dc.html'].status, 'approved');
  assert.deepEqual(listTrash(config), []);

  // deleting the first page takes the board that named no page with it, and brings it back to that page
  const first = deletePage(config, 'deck', 'p1');
  assert.deepEqual(Object.keys(read().boards).sort(), ['B.dc.html', 'C.dc.html']);
  restoreTrash(config, first.id);
  assert.deepEqual(read().pages.map((p) => p.id), ['p1', 'p2']);
  assert.equal(read().boards['A.dc.html'].page, 'p1');

  // delete the canvas: the folder moves, nothing is listed; back again; a name taken meanwhile blocks it
  const del = deleteCanvas(config, 'deck');
  assert.equal(listCanvases(config).length, 0);
  assert.ok(fs.existsSync(path.join(config.canvasesAbs, '.trash', del.id, 'canvas', 'project', 'canvas.json')));
  createCanvas(config, 'deck');
  assert.throws(() => restoreTrash(config, del.id), /已经有一块叫 deck/);
  fs.rmSync(canvasDir(config, 'deck'), { recursive: true });
  restoreTrash(config, del.id);
  assert.equal(listCanvases(config)[0].title, '新的 名字');
  assert.throws(() => restoreTrash(config, '../x'), /回收处没有/);

  // a questionnaire page: rename and delete work, it has no pages
  const q = path.join(config.canvasesAbs, 'qp');
  fs.mkdirSync(q);
  fs.writeFileSync(path.join(q, 'cloud.json'), JSON.stringify({ kind: 'page', title: '问卷', entry: 'survey.html', targets: {} }));
  fs.writeFileSync(path.join(q, 'survey.html'), '<!doctype html>');
  renameCanvas(config, 'qp', '验收问卷');
  assert.equal(listCanvases(config).find((x) => x.name === 'qp').title, '验收问卷');
  assert.throws(() => deletePage(config, 'qp', 'p1'), /问卷页/);
  deleteCanvas(config, 'qp');
  assert.equal(emptyTrash(config).length, 1);
  assert.ok(!fs.existsSync(path.join(config.canvasesAbs, '.trash')));
});

test('boards: rename one (file stays), delete one into the trash, undo puts it back where it was', () => {
  const config = tempConfig();
  const { dir, read } = twoPages(config);
  renameBoard(config, 'deck', 'B.dc.html', '  B · 改过的 ');
  assert.equal(read().boards['B.dc.html'].title, 'B · 改过的');
  assert.ok(fs.existsSync(path.join(dir, 'project', 'B.dc.html')));
  assert.throws(() => renameBoard(config, 'deck', 'Z.dc.html', 'x'), /没有这张画板/);
  assert.throws(() => renameBoard(config, 'deck', 'B.dc.html', ' '), /不能是空的/);

  // delete B (on p2, with a review record and the launch view on it): file, entry, order, review go; launch falls back
  setReview(config, 'deck', 'B.dc.html', 'rejected', { by: 'owner', note: '再想想' });
  const cpath = path.join(dir, 'project', 'canvas.json');
  fs.writeFileSync(cpath, JSON.stringify({ ...read(), launch: { view: 'focused', file: 'B.dc.html' } }, null, 2));
  const before = read();
  const gone = deleteBoard(config, 'deck', 'B.dc.html');
  assert.equal(gone.what, 'board');
  let c = read();
  assert.deepEqual(Object.keys(c.boards).sort(), ['A.dc.html', 'C.dc.html']);
  assert.deepEqual(c.order, ['A.dc.html', 'C.dc.html']);
  assert.deepEqual(c.launch, { view: 'canvas', page: 'p2' });
  assert.ok(!fs.existsSync(path.join(dir, 'project', 'B.dc.html')));
  assert.equal(listReviews(config, 'deck')['B.dc.html'], undefined);
  assert.equal(listTrash(config)[0].what, 'board');
  assert.ok(listVersions(config, 'deck').some((v) => v.label === 'before-delete'));

  // undo: same page, same place in the order, same title, review back
  restoreTrash(config, gone.id);
  c = read();
  assert.deepEqual(c.order, before.order);
  assert.deepEqual(Object.keys(c.boards), Object.keys(before.boards)); // same place in canvas.json too
  assert.deepEqual(c.boards['B.dc.html'], before.boards['B.dc.html']);
  assert.ok(fs.existsSync(path.join(dir, 'project', 'B.dc.html')));
  assert.equal(listReviews(config, 'deck')['B.dc.html'].note, '再想想');
  assert.deepEqual(listTrash(config), []);

  // a board that named no page comes back to the page it was on, even when that page is no longer first;
  // a board whose page was deleted meanwhile comes back to the first page
  const a = deleteBoard(config, 'deck', 'A.dc.html');
  const cc = deleteBoard(config, 'deck', 'C.dc.html');
  deletePage(config, 'deck', 'p2');
  restoreTrash(config, a.id);
  assert.equal(read().boards['A.dc.html'].page, 'p1');
  restoreTrash(config, cc.id);
  assert.equal(read().boards['C.dc.html'].page, 'p1');
  // something already there blocks it
  const again = deleteBoard(config, 'deck', 'C.dc.html');
  fs.writeFileSync(path.join(dir, 'project', 'C.dc.html'), 'x');
  assert.throws(() => restoreTrash(config, again.id), /已经有画板/);
});

test('names of Design Systems and Motion Decks: bench only, an empty one goes back to the scheme\'s', () => {
  const config = tempConfig();
  const list = [{ name: 'vermilion', title: 'Vermilion 朱红' }, { name: 'pomelo', title: 'Pomelo 柚儿园' }];
  renameScheme(config, 'ds', 'vermilion', '  朱红 · 网站 ', { known: ['vermilion', 'pomelo'] });
  renameScheme(config, 'motion', 'pomelo', '柚子的动效');
  assert.deepEqual(readNames(config), { ds: { vermilion: '朱红 · 网站' }, motion: { pomelo: '柚子的动效' } });
  assert.deepEqual(withNames(config, 'ds', list)[0], { name: 'vermilion', title: '朱红 · 网站', schemeTitle: 'Vermilion 朱红' });
  assert.deepEqual(withNames(config, 'ds', list)[1], list[1]);
  assert.throws(() => renameScheme(config, 'ds', 'nope', 'x', { known: ['vermilion'] }), /没有 Design System/);
  assert.throws(() => renameScheme(config, 'canvas', 'vermilion', 'x'), /只能给/);
  // back to the scheme's own: the file goes when nothing is left in it
  assert.equal(renameScheme(config, 'ds', 'vermilion', '').reset, true);
  renameScheme(config, 'motion', 'pomelo', null);
  assert.deepEqual(readNames(config), { ds: {}, motion: {} });
  assert.ok(!fs.existsSync(path.join(config.rootDir, 'names.json')));
});

test('colour groups as the cloud shows them: Palette first, then the words some token goes on from', () => {
  const names = ['color-page', 'color-surface', 'color-surface-cool', 'color-text', 'color-soft-line', 'color-accent', 'color-accent-strong', 'color-ember'];
  const groups = colorGroups(names.map((name) => ({ name })));
  assert.deepEqual(groups.map((g) => [g.name, g.tokens.map((t) => t.name)]), [
    ['Palette', ['color-page', 'color-text', 'color-ember']],
    ['surface', ['color-surface', 'color-surface-cool']],
    ['soft', ['color-soft-line']],
    ['accent', ['color-accent', 'color-accent-strong']]
  ]);
});

test('rename and delete over HTTP: JSON only, from this server only; the trash restores', async () => {
  const config = tempConfig();
  twoPages(config);
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  const post = (p, body, headers = {}) => fetch(`${srv.baseUrl}${p}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  try {
    assert.equal((await post('/api/canvases/deck/rename', { title: '新名字' })).status, 200);
    assert.equal((await (await fetch(`${srv.baseUrl}/api/canvases`)).json()).canvases[0].title, '新名字');
    const r = await post('/api/canvases/deck/page-rename', { page: 'p9', name: 'x' });
    assert.equal(r.status, 404);
    assert.match((await r.json()).message, /没有这一页/);
    const del = await (await post('/api/canvases/deck/page-delete', { page: 'p2' })).json();
    assert.equal(del.what, 'page');
    assert.equal((await (await fetch(`${srv.baseUrl}/api/trash`)).json()).items.length, 1);
    assert.equal((await post('/api/trash/restore', { id: del.id })).status, 200);
    // boards
    assert.equal((await post('/api/canvases/deck/board-rename', { file: 'C.dc.html', title: 'C 新' })).status, 200);
    assert.equal((await (await fetch(`${srv.baseUrl}/api/canvases/deck`)).json()).canvas.boards['C.dc.html'].title, 'C 新');
    assert.equal((await post('/api/canvases/deck/board-rename', { file: 'Z.dc.html', title: 'x' })).status, 404);
    const bd = await (await post('/api/canvases/deck/board-delete', { file: 'C.dc.html' })).json();
    assert.equal(bd.what, 'board');
    assert.equal((await (await fetch(`${srv.baseUrl}/api/canvases/deck`)).json()).canvas.boards['C.dc.html'], undefined);
    assert.equal((await post('/api/trash/restore', { id: bd.id })).status, 200);
    // a Design System or Motion Deck the bench doesn't have can't be named
    assert.equal((await post('/api/names/ds/nope', { title: 'x' })).status, 404);
    // a form post, another site, another host name: refused, nothing changed
    const form = await fetch(`${srv.baseUrl}/api/canvases/deck/delete`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' });
    assert.equal(form.status, 400);
    assert.equal((await post('/api/canvases/deck/delete', {}, { Origin: 'https://example.com' })).status, 403);
    const port = new URL(srv.baseUrl).port;
    const rebound = await new Promise((resolve) => {
      const req = http.request({ host: '127.0.0.1', port, path: '/api/canvases/deck/delete', method: 'POST', headers: { Host: `evil.example:${port}`, 'Content-Type': 'application/json' } }, (res) => resolve(res.statusCode));
      req.end('{}');
    });
    assert.equal(rebound, 403);
    assert.equal(listCanvases(config).length, 1);
    assert.equal((await post('/api/canvases/deck/delete', {})).status, 200);
    assert.equal(listCanvases(config).length, 0);
  } finally {
    await srv.close();
  }
});

test('review: statuses live in db.json, only the owner approves, a board changed after review says so', async () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  const dir = canvasDir(config, 'demo');
  assert.deepEqual(listReviews(config, 'demo'), {});
  setReview(config, 'demo', 'Main.dc.html', 'proposed', { by: 'agent' });
  assert.throws(() => setReview(config, 'demo', 'Main.dc.html', 'approved', { by: 'agent' }), /只有站主/);
  assert.throws(() => setReview(config, 'demo', 'Nope.dc.html', 'proposed', { by: 'agent' }), /没有画板/);
  assert.throws(() => setReview(config, 'demo', 'Main.dc.html', 'maybe'), /状态只能是/);
  const store = JSON.parse(fs.readFileSync(path.join(dir, 'db.json'), 'utf8'));
  assert.equal(store['review/Main.dc.html'].status, 'proposed');
  assert.equal(store['review/Main.dc.html'].sha256, sha256(fs.readFileSync(path.join(dir, 'project/Main.dc.html'))));

  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const post = (body) => fetch(`${srv.baseUrl}/api/review/demo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let r = await post({ file: 'Main.dc.html', status: 'rejected', note: '叶子再大一点' });
    assert.equal(r.status, 200);
    assert.equal((await r.json()).reviews['Main.dc.html'].note, '叶子再大一点');
    r = await post({ file: 'Main.dc.html', status: 'approved' });
    const rec = (await r.json()).reviews['Main.dc.html'];
    assert.equal(rec.status, 'approved');
    assert.equal(rec.by, 'owner');
    assert.equal(rec.changed, false);
    assert.equal((await post({ file: 'Main.dc.html', status: 'nope' })).status, 400);
    assert.equal((await fetch(`${srv.baseUrl}/api/review/nocanvas`)).status, 404);
    fs.writeFileSync(path.join(dir, 'project/Main.dc.html'), 'changed');
    const after = (await (await fetch(`${srv.baseUrl}/api/review/demo`)).json()).reviews['Main.dc.html'];
    assert.equal(after.changed, true);
    r = await post({ file: 'Main.dc.html', status: 'clear' });
    assert.deepEqual((await r.json()).reviews, {});
  } finally {
    await srv.close();
  }
  setReview(config, 'demo', 'Main.dc.html', 'proposed', { by: 'agent' });
  clearReview(config, 'demo', 'Main.dc.html');
  assert.deepEqual(listReviews(config, 'demo'), {});
});

test('server: global switches put emulate.js first in a board, versions say which have a board', async (t) => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  const dir = canvasDir(config, 'demo');
  const first = listVersions(config, 'demo')[0];
  fs.writeFileSync(path.join(dir, 'project/Main.dc.html'), '<!doctype html><html><head><style>.a{color:red}@media (prefers-color-scheme: dark){.a{color:white}}@media (prefers-reduced-motion: reduce){.a{transition:none}}</style></head><body><p class="a">x</p><script>window.__mm=[matchMedia("(prefers-color-scheme: dark)").matches,matchMedia("(prefers-reduced-motion: reduce)").matches]</script></body></html>');
  snapshot(config, 'demo', 'edit', { at: new Date(Date.now() + 2000) });
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const get = (p) => fetch(srv.baseUrl + p);
    const plain = await (await get('/c/demo/Main.dc.html')).text();
    assert.ok(!plain.includes('emulate.js'));
    const dark = await (await get('/c/demo/Main.dc.html?va-scheme=dark&va-motion=reduce')).text();
    assert.ok(dark.startsWith('<!doctype html><html><head><script src="/board/emulate.js?scheme=dark&motion=reduce"></script>'));
    const old = await (await get(`/v/demo/${first.id}/Main.dc.html?va-motion=reduce`)).text();
    assert.ok(old.includes('/board/emulate.js?motion=reduce'));
    assert.ok(!(await (await get('/c/demo/Main.dc.html?va-scheme=evil')).text()).includes('emulate.js'));
    const vs = (await (await get('/api/canvases/demo/versions?file=Main.dc.html')).json()).versions;
    assert.equal(vs.length, 2);
    assert.ok(vs.every((v) => typeof v.board === 'string' && v.board.length === 64));
    assert.notEqual(vs[0].board, vs[1].board);
    assert.equal((await (await get('/api/canvases/demo/versions?file=Nope.dc.html')).json()).versions[0].board, null);

    let exe = null;
    try {
      exe = resolveChromeExecutable(loadConfig());
    } catch {}
    if (!exe) return t.skip('没有 Chrome，不看页面里的效果');
    const pw = await import('playwright-core');
    const browser = await (pw.chromium || pw.default.chromium).launch({ executablePath: exe, args: ['--disable-gpu'] });
    try {
      const page = await browser.newPage({ colorScheme: 'light', reducedMotion: 'no-preference' });
      await page.goto(`${srv.baseUrl}/c/demo/Main.dc.html?va-scheme=dark&va-motion=reduce`);
      assert.deepEqual(await page.evaluate(() => window.__mm), [true, true]);
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.a')).color), 'rgb(255, 255, 255)');
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.a')).transitionProperty), 'none');
      await page.goto(`${srv.baseUrl}/c/demo/Main.dc.html`);
      assert.deepEqual(await page.evaluate(() => window.__mm), [false, false]);
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.a')).color), 'rgb(255, 0, 0)');
    } finally {
      await browser.close();
    }
  } finally {
    await srv.close();
  }
});

test('targets: account label, listing with home first, home can move', () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  addTarget(config, 'demo', 'one', { url: 'https://example.invalid/1', account: '账号一', blobs: 'same' });
  addTarget(config, 'demo', 'two', { url: 'https://example.invalid/2', account: '账号二', home: true });
  const rows = listTargets(config, 'demo');
  assert.deepEqual(rows.map((r) => [r.slug, r.home, r.account, r.sameIds]), [['two', true, '账号二', false], ['one', false, '账号一', true]]);
  addTarget(config, 'demo', 'one', { home: true });
  assert.equal(listTargets(config, 'demo')[0].slug, 'one');
  assert.equal(listTargets(config, 'demo')[0].account, '账号一');
});

// A fake repo root with one built Design System; tokens.css comes from the real tooling.
function fakeRepo() {
  const real = path.join(REPO_ROOT, 'tooling');
  if (!fs.existsSync(path.join(real, 'design-system/tokens-css.mjs'))) return null;
  const va = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-va-'));
  fs.symlinkSync(real, path.join(va, 'tooling'));
  const w = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(va, rel)), { recursive: true });
    fs.writeFileSync(path.join(va, rel), text);
  };
  w('schemes/demo/design-system/published.json', JSON.stringify({ url: 'https://claude.ai/artifact/AbC123', account: '账号一' }));
  const p = 'dist/demo/design-system/';
  w(p + 'project/design-system.json', JSON.stringify({ v: 3, title: 'Demo 示例', namespace: 'Demo', groups: ['Logos'], assetGroups: { Logos: { name: 'Logos', files: { 'mark.svg': { name: 'mark.svg', blob: ID_A, size: SVG.length, type: 'image/svg+xml' } } } } }));
  w(p + 'project/tokens.json', JSON.stringify({ name: 'Demo', color: { themes: [{ id: 'light' }, { id: 'dark' }], tokens: [{ name: 'color-page', value: { light: '#ffffff', dark: '#000000' } }] }, shadow: { tokens: [] }, spacing: { tokens: [{ name: 'space-1', value: '4px' }] }, radius: { tokens: [] }, width: { tokens: [] }, text: { tokens: [] }, type: { families: { serif: '"Source Serif 4", serif' }, groups: [{ name: 'T', family: 'serif', styles: [{ name: 'type-h1', fontSize: '2rem', fontWeight: 600 }] }] } }));
  w(p + 'project/README.md', '# Demo\n\n- 一条\n');
  w(p + 'project/components/bundle.css', '.btn { color: var(--color-page); }');
  w(p + 'project/components/Btn/preview.html', '<!-- @dsCard group="操作" height=80 -->\n<!doctype html>\n<html lang="zh-CN">\n<head>\n<title>Btn</title>\n</head>\n<body><button class="btn">好</button></body>\n</html>\n');
  w(p + 'project/components/Cover/preview.html', '<!-- @dsCard height=200 -->\n<!doctype html><html><head></head><body>cover</body></html>');
  w(p + 'upload/Logos/mark.svg', SVG);
  return va;
}

test('design systems: list, read, install on a canvas, serve previews and assets', async (t) => {
  const va = fakeRepo();
  if (!va) return t.skip('仓库里没有 tooling/design-system/tokens-css.mjs');
  const config = { ...tempConfig(), repoAbs: va };
  const [ds] = listSystems(config);
  assert.deepEqual([ds.name, ds.title, ds.built, ds.cloud.account], ['demo', 'Demo 示例', true, '账号一']);
  const sys = readSystem(config, 'demo');
  assert.deepEqual(sys.components.map((c) => [c.name, c.group, c.height]), [['Btn', '操作', 80]]);
  assert.equal(sys.cover.height, 200);
  assert.equal(sys.assets[0].files[0].blob, ID_A);
  assert.ok(sys.fonts[0].includes('family=Source+Serif+4:wght@400;600'));
  // system fonts listed in meta.localFonts are not fetched from Google Fonts
  const local = { meta: { localFonts: ['Pomelo Hand', 'Hannotate SC'] }, type: { families: { hand: '"Pomelo Hand", "Hannotate SC", "Work Sans", sans-serif' }, groups: [] } };
  assert.deepEqual(fontLinks(local), ['https://fonts.googleapis.com/css2?family=Work+Sans:wght@400&display=swap']);

  createCanvas(config, 'demo');
  const r = await installSystem(config, 'demo', 'demo');
  const dir = path.join(canvasDir(config, 'demo'), 'project', 'ds', 'demo');
  assert.ok(fs.readFileSync(path.join(dir, 'tokens.css'), 'utf8').includes('--color-page: #ffffff'));
  assert.ok(fs.existsSync(path.join(dir, 'components/bundle.css')));
  assert.deepEqual(r.links, ['ds/demo/tokens.css', 'ds/demo/components/bundle.css']);
  await installSystem(config, 'demo', 'demo');
  const rec = JSON.parse(fs.readFileSync(path.join(canvasDir(config, 'demo'), 'project/canvas.json'), 'utf8')).designSystems;
  assert.equal(rec.length, 1);
  assert.deepEqual([rec[0].title, rec[0].namespace, rec[0].artifact], ['Demo 示例', 'demo', 'https://claude.ai/artifact/AbC123']);

  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const get = (p) => fetch(srv.baseUrl + p);
    assert.equal((await (await get('/api/ds')).json()).systems[0].name, 'demo');
    const html = await (await get('/ds/demo/components/Btn/preview.html?theme=dark')).text();
    assert.ok(html.includes('data-theme="dark"') && html.includes('--color-page') && html.includes('.btn {'));
    assert.ok((await (await get('/ds/demo/tokens.css')).text()).includes('[data-theme="dark"]'));
    assert.equal(await (await get(`/_blob/${ID_A}`)).text(), SVG);
    assert.equal((await get('/ds/demo/../../schemes/demo/design-system/published.json')).status, 404);
    // a name given in the bench: the lists show it, the scheme's own stays as schemeTitle
    const named = await fetch(`${srv.baseUrl}/api/names/ds/demo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: '示例 · 改过' }) });
    assert.equal(named.status, 200);
    assert.deepEqual((({ title, schemeTitle }) => ({ title, schemeTitle }))((await (await get('/api/ds')).json()).systems[0]), { title: '示例 · 改过', schemeTitle: 'Demo 示例' });
    assert.equal(catalog(config).sections.find((x) => x.id === 'ds').items[0].title, '示例 · 改过');
  } finally {
    await srv.close();
  }
  // installing still records the Design System's own name (it is what the cloud calls it)
  assert.equal(listSystems(config)[0].title, 'Demo 示例');
  await installSystem(config, 'demo', 'demo');
  assert.equal(JSON.parse(fs.readFileSync(path.join(canvasDir(config, 'demo'), 'project/canvas.json'), 'utf8')).designSystems[0].title, 'Demo 示例');

  // a build that left out design-system.json (an asset off its upload record): rebuilt from system.json + published.json
  fs.rmSync(path.join(va, 'dist/demo/design-system/project/design-system.json'));
  fs.writeFileSync(path.join(va, 'schemes/demo/design-system/system.json'), JSON.stringify({ title: 'Demo 示例', namespace: 'Demo', assetGroups: [{ name: 'Logos', tile: 'l', assets: [{ id: 'm', name: 'mark.svg' }] }] }));
  const pub = JSON.parse(fs.readFileSync(path.join(va, 'schemes/demo/design-system/published.json'), 'utf8'));
  pub.assets = { 'Logos/mark.svg': { blob: ID_A, size: SVG.length, sha256: 'x' } };
  fs.writeFileSync(path.join(va, 'schemes/demo/design-system/published.json'), JSON.stringify(pub));
  const again = readSystem(config, 'demo');
  assert.equal(listSystems(config)[0].built, true);
  assert.ok(again.partial);
  assert.equal(again.assets[0].files[0].blob, ID_A);
});

test('page store: a page that calls claude.use(\'db\') reads and writes db.json, and hears outside writes', async (t) => {
  let chromium;
  try {
    const pw = await import('playwright-core');
    chromium = pw.chromium || pw.default.chromium;
  } catch {
    return t.skip('没装 playwright-core：在仓库根目录 npm ci');
  }
  const config = tempConfig();
  const dir = path.join(config.canvasesAbs, 'qp');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'cloud.json'), JSON.stringify({ kind: 'page', title: '问卷', entry: 'survey.html', targets: {} }));
  fs.writeFileSync(path.join(dir, 'survey.html'), `<!doctype html><html><head><title>t</title></head><body><script>
(async () => {
  const db = await claude.use('db');
  await db.doc('survey/answers').set({ q1: 'a', n: 1, deep: { y: 2 } });
  await db.doc('survey/answers').update({ n: 2, deep: { x: 1 } });
  const got = await db.doc('survey/answers').get();
  await db.collection('items').add({ k: 3 });
  await db.collection('items').doc('b').set({ k: 1 });
  const q = await db.collection('items').orderBy('k', 'desc').get();
  let bad = null;
  try { await db.doc('nope/x').update({ a: 1 }); } catch (e) { bad = e.code; }
  window.__seen = [];
  db.doc('live/one').onSnapshot((s) => window.__seen.push(s.exists ? s.data().v : null));
  const user = await claude.use('user');
  window.__result = { exists: got.exists, data: got.data(), order: q.docs.map((d) => d.data().k), bad, id: await user.id(), room: await claude.use('room') };
})();
</script></body></html>`);
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  const browser = await chromium.launch({ channel: 'chrome' }).catch(() => null);
  if (!browser) {
    await srv.close();
    return t.skip('没有 Chrome');
  }
  try {
    const page = await browser.newPage();
    await page.goto(`${srv.baseUrl}/c/qp/`);
    const r = await (await page.waitForFunction(() => window.__result, null, { timeout: 15000 })).jsonValue();
    assert.deepEqual(r, { exists: true, data: { q1: 'a', n: 2, deep: { y: 2, x: 1 } }, order: [3, 1], bad: 'invalid_argument', id: 'local', room: null });
    // what an Agent reads
    const store = JSON.parse(fs.readFileSync(path.join(dir, 'db.json'), 'utf8'));
    assert.deepEqual(store['survey/answers'], { q1: 'a', n: 2, deep: { y: 2, x: 1 } });
    assert.equal(Object.keys(store).filter((k) => k.startsWith('items/')).length, 2);
    // a write from outside reaches the subscription
    await page.waitForFunction(() => window.__seen.length === 1);
    await fetch(`${srv.baseUrl}/api/db/qp?path=live/one`, { method: 'PUT', body: JSON.stringify({ v: 5 }) });
    await page.waitForFunction(() => window.__seen.includes(5), null, { timeout: 10000 });
    assert.deepEqual(await page.evaluate(() => window.__seen), [null, 5]);
    // the runtime goes first in <head>
    const html = await (await fetch(`${srv.baseUrl}/c/qp/survey.html`)).text();
    assert.ok(html.startsWith('<!doctype html><html><head><script src="/_claude/runtime.js?canvas=qp"></script>'));
  } finally {
    await browser.close();
    await srv.close();
  }
});

let chrome = null;
try {
  chrome = resolveChromeExecutable(loadConfig());
} catch {}

test('shot: headless render with zero errors', { skip: chrome ? false : '没有 Chrome' }, async () => {
  const config = tempConfig();
  const dir = path.join(config.canvasesAbs, 'plain');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'cloud.json'), JSON.stringify({ kind: 'page', entry: 'page.html', targets: {} }));
  fs.writeFileSync(path.join(dir, 'page.html'), '<!doctype html><html><body style="margin:0"><img src="{{src}}" alt="" hidden><div style="width:200px;height:100px;background:#123"></div></body></html>');
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const png = path.join(config.rootDir, 'shot.png');
    const r = await captureUrl(config, `${srv.baseUrl}/c/plain/`, png, { width: 200, height: 100 });
    assert.equal(r.passed, true, JSON.stringify(r.allErrors));
    assert.ok(fs.statSync(png).size > 100);
  } finally {
    await srv.close();
  }
});

test('cloud: a list_files that shows a different canvas runtime is flagged, the same one (or its shortened sha) is not', () => {
  const config = tempConfig();
  const ours = sha256(fs.readFileSync(config.runtimeAbs));
  const listing = (sha) => ({ version: 'v1', files: [{ path: 'index.html', sha256: 'x', of_type: true }, { path: 'artifact-type/dc-runtime.js', size: 123, sha256: sha, of_type: true }] });
  assert.equal(runtimeDrift(config, listing(ours)), null);
  assert.equal(runtimeDrift(config, listing(ours.slice(0, 32))), null);
  assert.equal(runtimeDrift(config, { version: 'v1', files: [] }), null);
  const d = runtimeDrift(config, listing('f'.repeat(64)));
  assert.equal(d.cloud, 'f'.repeat(64));
  assert.equal(d.local, ours);
  assert.match(d.message, /bench\/vendor\/claude-design\/dc-runtime\.js/);
});

test('frames: time points from --at or --every/--until, capped', () => {
  assert.deepEqual(frameTimes({}), [0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000]);
  assert.deepEqual(frameTimes({ at: ['600', '0', '600', '300'] }), [0, 300, 600]);
  assert.deepEqual(frameTimes({ every: 400, until: 1000 }), [0, 400, 800]);
  assert.throws(() => frameTimes({ every: 10, until: 10000 }), new RegExp(`最多 ${MAX_FRAMES} 帧`));
  assert.throws(() => frameTimes({ at: ['-5'] }), /不小于 0/);
});

test('frames: a board moves over time, a click starts what only runs on a click, and a contact sheet comes out', { skip: chrome ? false : '没有 Chrome', timeout: 120000 }, async () => {
  const config = tempConfig();
  createCanvas(config, 'mov', { title: '动' });
  const dir = canvasDir(config, 'mov');
  const board = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#fff}
#bar{height:40px;width:0;background:#123;animation:grow 1200ms linear forwards}
#dot{width:40px;height:40px;margin-top:10px;background:#c33;opacity:0}
.go #dot{animation:show 600ms linear forwards}
@keyframes grow{to{width:300px}}
@keyframes show{to{opacity:1}}
</style></head><body><div id="root"><div id="bar"></div><div id="dot"></div><button type="button" onclick="document.getElementById('root').classList.add('go')">开始</button></div></body></html>`;
  fs.writeFileSync(path.join(dir, 'project', 'Main.dc.html'), board);
  const c = JSON.parse(fs.readFileSync(path.join(dir, 'project', 'canvas.json'), 'utf8'));
  c.boards['Main.dc.html'] = { ...c.boards['Main.dc.html'], w: 400, h: 200 };
  fs.writeFileSync(path.join(dir, 'project', 'canvas.json'), JSON.stringify(c, null, 2));

  const r = await runFrames(config, 'mov', { board: 'Main.dc.html', times: [0, 1500], clicks: ['开始'] });
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.missedClicks, []);
  assert.equal(r.frames.length, 2);
  assert.ok(r.frames[1].actual >= 1500);
  assert.notDeepEqual(fs.readFileSync(r.frames[0].png), fs.readFileSync(r.frames[1].png), 'the board did not move');
  assert.ok(fs.statSync(r.sheet).size > 1000);
  assert.ok(r.sheet.endsWith(path.join('.shots', 'frames', 'Main.png')));

  const miss = await runFrames(config, 'mov', { board: 'Main.dc.html', times: [0], clicks: ['没有这个按钮'] });
  assert.deepEqual(miss.missedClicks, ['没有这个按钮']);
  await assert.rejects(runFrames(config, 'mov', { times: [0] }), /--board/);
});

test('shot: a page Chrome cannot open, or one the server has not got, never passes', { skip: chrome ? false : '没有 Chrome' }, async () => {
  const config = tempConfig();
  createCanvas(config, 'gone');
  // a port nothing listens on: Chrome shows its own error page (what a sandbox that blocks the port looks like)
  const closed = await captureUrl(config, 'http://127.0.0.1:9/c/gone/Main.dc.html', path.join(config.rootDir, 'closed.png'), { width: 200, height: 100, scale: 1 });
  assert.equal(closed.passed, false);
  assert.ok(closed.allErrors.some((e) => /打不开页面|报错页/.test(e)), JSON.stringify(closed.allErrors));
  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const missing = await captureUrl(config, `${srv.baseUrl}/c/gone/Nope.dc.html`, path.join(config.rootDir, 'missing.png'), { width: 200, height: 100, scale: 1 });
    assert.equal(missing.passed, false);
    assert.ok(missing.allErrors.some((e) => /页面返回 404/.test(e)), JSON.stringify(missing.allErrors));
  } finally {
    await srv.close();
  }
});

test('check: finds text cut off or outside the board, leaves scroll areas and data-nolint alone', { skip: chrome ? false : '没有 Chrome' }, async () => {
  const config = tempConfig();
  createCanvas(config, 'lay', { w: 400, h: 200 });
  const board = (body) => `<!doctype html><html><head><meta charset="utf-8"><title>t</title></head><body style="margin:0">${body}</body></html>`;
  const proj = path.join(canvasDir(config, 'lay'), 'project');
  fs.writeFileSync(path.join(proj, 'Main.dc.html'), board(`
    <div style="width:120px;height:20px;overflow:hidden;white-space:nowrap">这一行字很长很长很长很长会被盒子裁掉</div>
    <div style="position:absolute;left:380px;top:10px;white-space:nowrap">跑出画板</div>
    <div style="height:60px;overflow:auto"><p>滚</p><p>动</p><p>区</p><p>里</p><p>的</p><p>字</p></div>
    <div data-nolint style="position:absolute;left:390px;top:120px;white-space:nowrap">故意的</div>`));
  const r = await runCheck(config, 'lay', { lints: false });
  const layout = r.boards[0].layout.join('\n');
  assert.ok(layout.includes('字被裁掉一截'), layout);
  assert.ok(layout.includes('字出了画板') && layout.includes('跑出画板'), layout);
  assert.ok(!layout.includes('故意的') && !layout.includes('「滚'), layout);
  assert.equal(r.passed, false);
});

test('offline: pages point at /_cdn/, which serves the cache and only the CDN hosts; an export packs fonts and React', async () => {
  const config = { ...tempConfig(), offlineFetch: async () => { throw new Error('没有网'); } };
  const CSS = 'https://fonts.googleapis.com/css2?family=Demo+Serif&display=swap';
  const LATIN = 'https://fonts.gstatic.com/s/demo/latin.woff2';
  const CJK = 'https://fonts.gstatic.com/s/demo/cjk.woff2';
  seedCache(config, CSS, `/* latin */\n@font-face { font-family: 'Demo Serif'; src: url(${LATIN}) format('woff2'); unicode-range: U+0000-00FF; }\n/* cjk */\n@font-face { font-family: 'Demo Serif'; src: url(${CJK}) format('woff2'); unicode-range: U+4E00-4E3F; }\n`, 'text/css');
  seedCache(config, LATIN, Buffer.from('latin-font-bytes'), 'font/woff2');
  const rt = runtimeResources(config);
  assert.ok(rt.some((r) => r.url.includes('/react@')) && rt.every((r) => r.integrity.startsWith('sha')));
  for (const r of rt) seedCache(config, r.url, `/* ${r.url} */`, 'text/javascript');

  createCanvas(config, 'deck', { w: 200, h: 100 });
  const board = path.join(canvasDir(config, 'deck'), 'project', 'Main.dc.html');
  fs.writeFileSync(board, `<!doctype html><html><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${CSS.replace('&', '&amp;')}"><script src="./support.js"></script></head><body>Hello</body></html>`);

  // what the page needs and the cache lacks: the CJK block is not needed (no CJK text), nothing is missing
  const pre = await prefetchPage(config, fs.readFileSync(board, 'utf8'));
  assert.deepEqual(pre.missing, []);
  assert.ok(pre.have.includes(LATIN) && !pre.have.includes(CJK));

  const srv = await startServer(config, { port: 0, watch: false, quiet: true });
  try {
    const page = await (await fetch(`${srv.baseUrl}/c/deck/Main.dc.html`)).text();
    assert.ok(page.includes('/_cdn/fonts.googleapis.com/css2?family=Demo+Serif') && !page.includes('https://fonts.googleapis.com/css2'));
    assert.ok(page.includes('window.__resources') && page.includes(`"${rt[0].url}":"/_cdn/cdn.jsdelivr.net/`));
    const css = await fetch(`${srv.baseUrl}/_cdn/fonts.googleapis.com/css2?family=Demo+Serif&display=swap`);
    assert.equal(css.status, 200);
    assert.ok((await css.text()).includes('url(/_cdn/fonts.gstatic.com/s/demo/latin.woff2)'));
    assert.equal(await (await fetch(`${srv.baseUrl}/_cdn/fonts.gstatic.com/s/demo/latin.woff2`)).text(), 'latin-font-bytes');
    // not cached and no network: says so; another host: not served at all
    assert.equal((await fetch(`${srv.baseUrl}/_cdn/fonts.gstatic.com/s/demo/cjk.woff2`)).status, 504);
    assert.equal((await fetch(`${srv.baseUrl}/_cdn/example.com/x.js`)).status, 404);
  } finally {
    await srv.close();
  }

  // the export: fonts written into the page (only the latin block), React from the manifest, no CDN address left
  const p = packBoard(config, 'deck', 'Main.dc.html');
  assert.deepEqual(p.offlineMissing, []);
  assert.ok(!p.html.includes('fonts.googleapis.com') && !p.html.includes('fonts.gstatic.com'));
  assert.ok(p.html.includes('data-va-offline') && !p.html.includes('U+4E00-4E3F'));
  const ext = JSON.parse(p.html.match(/<script type="__bundler\/ext_resources">\s*([\s\S]*?)\s*<\/script>/)[1]);
  assert.deepEqual(ext.map((e) => e.id).sort(), rt.filter((r) => !/babel/.test(r.url)).map((r) => r.url).sort());
  assert.equal(packBoard(config, 'deck', 'Main.dc.html').html, p.html);

  // a runtime file whose bytes don't match the runtime's sha384 is not kept
  const bad = { ...config, cacheAbs: path.join(config.rootDir, 'cache2'), offlineFetch: async () => new Response('tampered', { headers: { 'content-type': 'text/javascript' } }) };
  const r = await prefetchPage(bad, '<script src="support.js"></script>');
  assert.ok(r.missing.length && r.missing.every((m) => /对不上/.test(m.why)));
  assert.equal(readCached(bad, rt[0].url), null);
});

test('export: a board packs into one self-contained HTML, the same bytes twice, and renders like its PNG', { skip: chrome ? false : '没有 Chrome' }, async () => {
  const config = tempConfig();
  createCanvas(config, 'ex', { w: 300, h: 160 });
  const dir = canvasDir(config, 'ex');
  fs.mkdirSync(path.join(dir, 'blobs'));
  fs.writeFileSync(path.join(dir, 'blobs', `${ID_A}.svg`), SVG);
  fs.mkdirSync(path.join(dir, 'project/ds/demo'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'project/ds/demo/tokens.css'), ':root { --ink: #123456; }');
  fs.writeFileSync(path.join(dir, 'project/Main.dc.html'), `<!doctype html><html><head><meta charset="utf-8"><title>t</title><script src="./support.js"></script><link rel="stylesheet" href="ds/demo/tokens.css"></head><body style="margin:0">
<x-dc><div style="width:300px;height:160px;background:var(--ink)"><img src="/_blob/${ID_A}" style="width:40px;height:40px" alt=""></div></x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":300,"height":160}}'>class Component extends DCLogic { renderVals() { return {}; } }</script></body></html>`);
  const a = packBoard(config, 'ex', 'Main.dc.html');
  const b = packBoard(config, 'ex', 'Main.dc.html');
  assert.equal(a.html, b.html);
  assert.deepEqual(a.missing, []);
  assert.equal(a.files, 3);
  assert.ok(!a.html.includes('/_blob/') && !a.html.includes('ds/demo/tokens.css') && !a.html.includes('./support.js'));
  const r = await exportBoards(config, 'ex', { png: true, html: true, scale: 1 });
  assert.deepEqual(r.rows[0].errors, []);
  const again = path.join(config.rootDir, 'again.png');
  const shot = await captureUrl(config, pathToFileURL(r.rows[0].html).href, again, { width: 300, height: 160, scale: 1 });
  assert.deepEqual(shot.allErrors, []);
  assert.ok(fs.statSync(again).size > 100);
});
