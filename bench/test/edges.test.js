import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadConfig, sha256, BENCH_ROOT } from '../src/utils/config.js';
import { canvasDir, listCanvases } from '../src/canvas/store.js';
import { createCanvas, importBundle } from '../src/canvas/create.js';
import { addTarget, verify, recordPublish, planPull } from '../src/canvas/cloud.js';
import { exportBoards } from '../src/canvas/export.js';
import { encodeManifestEntry } from '../src/bundler/codec.js';

// The edges: a canvas that is not there, a questionnaire page where a canvas is wanted, a flag without its value.
// Everything in temp folders; the command line runs with DW_CANVASES pointing at one.

function tempConfig() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-edge-'));
  fs.mkdirSync(path.join(root, 'canvases'));
  return loadConfig({ rootDir: root, canvasesDir: path.join(root, 'canvases'), runtimeAbs: path.join(BENCH_ROOT, 'vendor/claude-design/dc-runtime.js'), cacheAbs: path.join(root, 'cache') });
}

/** A questionnaire page: cloud.json kind page, one entry file, one cloud copy. */
function makePage(config, name) {
  const dir = path.join(config.canvasesAbs, name);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html><head></head><body>问卷</body></html>');
  fs.writeFileSync(path.join(dir, 'cloud.json'), JSON.stringify({ kind: 'page', entry: 'index.html', targets: { p1: { url: 'https://example.invalid/p', blobs: 'same' } }, home: 'p1' }));
  return dir;
}

const dw = (config, ...args) => spawnSync(process.execPath, [path.join(BENCH_ROOT, 'bin', 'dw.js'), ...args], { encoding: 'utf8', env: { ...process.env, DW_CANVASES: config.canvasesAbs } });

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect width="4" height="4"/></svg>';

test('target: a name nobody has is an error and leaves nothing behind; --new registers a canvas to pull into', () => {
  const config = tempConfig();
  assert.throws(() => addTarget(config, 'typo', 's1', { url: 'https://example.invalid/x' }), (e) => e.code === 'not_found' && /没有画布 typo/.test(e.message));
  assert.equal(fs.existsSync(canvasDir(config, 'typo')), false);
  const r = dw(config, 'target', 'typo', 's1', '--url', 'https://example.invalid/x');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /没有画布 typo/);
  assert.equal(fs.existsSync(canvasDir(config, 'typo')), false);
  assert.deepEqual(listCanvases(config), []);
  // on purpose: the cloud canvas comes down into a new local one
  assert.equal(dw(config, 'target', 'fresh', 's1', '--url', 'https://example.invalid/x', '--same-ids', '--new').status, 0);
  const plan = planPull(config, 'fresh', { files: [{ path: 'project/canvas.json', size: 2, sha256: sha256(Buffer.from('{}')) }] });
  assert.deepEqual(plan.added, ['project/canvas.json']);
});

test('a missing canvas is one message and exit code 1 for every command', () => {
  const config = tempConfig();
  for (const args of [['versions', 'nope'], ['target', 'nope'], ['snapshot', 'nope'], ['review', 'nope'], ['db', 'nope'], ['shot', 'nope'], ['check', 'nope'], ['export', 'nope'], ['open', 'nope', '--port', '9'], ['delete', 'nope'], ['restore', 'nope', 'v1']]) {
    const r = dw(config, ...args);
    assert.equal(r.status, 1, `dw ${args.join(' ')}: ${r.stdout}`);
    assert.match(r.stderr, /没有画布 nope（list 看有哪些）/, `dw ${args.join(' ')}`);
  }
  // nothing was made for it on the way (dw export used to make .shots/export/ first)
  assert.deepEqual(fs.readdirSync(config.canvasesAbs), []);
});

test('import: a one-board bundle keeps its images and its own size', async () => {
  const config = tempConfig();
  const runtime = '7082c4d2-af20-4139-891c-5ca5457e8573';
  const img = '11111111-2222-4333-8444-555555555555';
  const j = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
  const board = `<!DOCTYPE html><html><head><title>S1</title><script src="${runtime}"></script></head><body><x-dc><div><img src="${img}"></div></x-dc><script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":500,"height":350}}'>class Component extends DCLogic {}</script></body></html>`;
  const bundle = `<!DOCTYPE html><html><head><title>S1</title></head><body>
<script type="__bundler/manifest">${j({ [runtime]: encodeManifestEntry('window.__dcBoot=1', 'text/javascript'), [img]: encodeManifestEntry(SVG, 'image/svg+xml') })}</script>
<script type="__bundler/template">${j(board)}</script></body></html>`;
  const file = path.join(config.rootDir, 'one.html');
  fs.writeFileSync(file, bundle);
  await importBundle(config, file, 'one');
  const dir = canvasDir(config, 'one');
  const main = fs.readFileSync(path.join(dir, 'project/Main.dc.html'), 'utf8');
  const id = img.replace(/-/g, '');
  assert.ok(main.includes(`<img src="/_blob/${id}">`), main);
  assert.ok(main.includes('<script src="./support.js"></script>'));
  assert.equal(fs.readFileSync(path.join(dir, 'blobs', `${id}.svg`), 'utf8'), SVG);
  const canvas = JSON.parse(fs.readFileSync(path.join(dir, 'project/canvas.json'), 'utf8'));
  assert.deepEqual([canvas.boards['Main.dc.html'].w, canvas.boards['Main.dc.html'].h], [500, 350]);
});

test('a questionnaire page: verify and publish --record refuse (no checksums), export --html says it is one file already', async () => {
  const config = tempConfig();
  makePage(config, 'qp');
  const listing = { files: [{ path: 'index.html', sha256: '00' }] };
  assert.throws(() => verify(config, 'qp', listing), /问卷页/);
  assert.throws(() => recordPublish(config, 'qp', listing), /问卷页/);
  await assert.rejects(exportBoards(config, 'qp', { png: false, html: true }), /本来就是一个文件/);
  assert.equal(fs.existsSync(path.join(config.canvasesAbs, 'qp', '.shots')), false);
  const file = path.join(config.rootDir, 'list.json');
  fs.writeFileSync(file, JSON.stringify(listing));
  const r = dw(config, 'verify', 'qp', '--listing', file);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /问卷页/);
});

test('a flag without its value is an error, not a title "true" or a Node error', () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  addTarget(config, 'demo', 's1', { url: 'https://example.invalid/x', account: '账号' });
  const cases = [
    [['new', 'other', '--title'], '--title'],
    [['import', 'x.html', '--name', 'other', '--title'], '--title'],
    [['publish', 'demo', '--out'], '--out'],
    [['publish', 'demo', '--blob-map'], '--blob-map'],
    [['pull', 'demo', '--assets'], '--assets'],
    [['pull', 'demo', '--listing', 'x.json', '--from'], '--from'],
    [['target', 'demo', 's2', '--url', '--account'], '--url'],
    [['frames', 'demo', '--board', 'Main.dc.html', '--every'], '--every'],
    [['review', 'demo', '--propose', '--board'], '--board']
  ];
  for (const [args, flag] of cases) {
    const r = dw(config, ...args);
    assert.equal(r.status, 1, `dw ${args.join(' ')}`);
    assert.ok(r.stderr.includes(`${flag} 后面要写值`), `dw ${args.join(' ')}: ${r.stderr}`);
  }
  assert.equal(fs.existsSync(canvasDir(config, 'other')), false);
  assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(path.join(canvasDir(config, 'demo'), 'cloud.json'), 'utf8')).targets), ['s1']);
  // a blob map that is not there is said so
  const missing = dw(config, 'publish', 'demo', '--blob-map', path.join(config.rootDir, 'nope.json'));
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /读不到 .*nope\.json/);
  // --title with a value still works
  assert.equal(dw(config, 'new', 'other', '--title', '别的').status, 0);
  assert.equal(JSON.parse(fs.readFileSync(path.join(canvasDir(config, 'other'), 'project/canvas.json'), 'utf8')).title, '别的');
});

test('publish --blob-map --json: one JSON on stdout, the map count in it', () => {
  const config = tempConfig();
  createCanvas(config, 'demo');
  const dir = canvasDir(config, 'demo');
  const id = 'a'.repeat(32);
  fs.mkdirSync(path.join(dir, 'blobs'));
  fs.writeFileSync(path.join(dir, 'blobs', `${id}.svg`), SVG);
  addTarget(config, 'demo', 's1', { url: 'https://example.invalid/x' });
  const map = path.join(config.rootDir, 'map.json');
  fs.writeFileSync(map, JSON.stringify({ [id]: 'b'.repeat(32) }));
  const r = dw(config, 'publish', 'demo', '--blob-map', map, '--json');
  assert.equal(r.status, 0, r.stderr);
  const data = JSON.parse(r.stdout);
  assert.equal(data.blobMap, 1);
  assert.equal(data.target, 's1');
});
