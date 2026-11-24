import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { BENCH_ROOT, loadConfig } from '../src/utils/config.js';
import { resolveChromeExecutable } from '../src/server/headless.js';
import { startServer } from '../src/server/server.js';

// dw mcp（v1.0 Phase 3）：真的起一个进程，照 MCP 客户端那样一行一条 JSON-RPC 说话。画布都在临时目录（DW_CANVASES）。

const chrome = (() => {
  try {
    return resolveChromeExecutable(loadConfig());
  } catch {
    return null;
  }
})();

function client(env) {
  const child = spawn(process.execPath, [path.join(BENCH_ROOT, 'bin', 'dw.js'), 'mcp'], { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
  let buf = '';
  const raw = [];
  const waiting = new Map();
  child.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      raw.push(line);
      const m = JSON.parse(line); // anything on stdout that isn't JSON-RPC fails the test here
      waiting.get(m.id)?.(m);
      waiting.delete(m.id);
    }
  });
  let n = 0;
  const request = (method, params) =>
    new Promise((resolve) => {
      const id = ++n;
      waiting.set(id, resolve);
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  const notify = (method, params) => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  const call = async (name, args = {}) => {
    const m = await request('tools/call', { name, arguments: args });
    if (m.error) throw new Error(m.error.message);
    const text = m.result.content.find((c) => c.type === 'text')?.text;
    return { isError: !!m.result.isError, data: m.result.isError ? text : JSON.parse(text), content: m.result.content };
  };
  const close = () =>
    new Promise((resolve) => {
      child.on('close', resolve);
      child.stdin.end();
    });
  return { request, notify, call, close, raw };
}

test('mcp: an Agent makes, writes, checks and exports a canvas with tools alone', { skip: chrome ? false : '没有 Chrome', timeout: 180000 }, async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-mcp-'));
  const canvases = path.join(root, 'canvases');
  fs.mkdirSync(canvases);
  const c = client({ DW_CANVASES: canvases });
  try {
    const init = await c.request('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
    assert.equal(init.result.protocolVersion, '2025-03-26');
    assert.equal(init.result.serverInfo.name, 'visual-atelier-dw');
    assert.match(init.result.instructions, /批准和退回只由站主/);
    c.notify('notifications/initialized');
    const { result } = await c.request('tools/list');
    const names = result.tools.map((t) => t.name);
    for (const n of ['list', 'canvas', 'new_canvas', 'write_board', 'check', 'frames', 'export', 'ds_install', 'db_get', 'db_set', 'review_propose', 'serve_start', 'serve_stop', 'dw']) assert.ok(names.includes(n), n);
    assert.ok(result.tools.every((t) => t.inputSchema?.type === 'object' && t.description));
    assert.equal((await c.request('nope/nope')).error.code, -32601);

    // make a canvas, add a board on a new page
    await c.call('new_canvas', { canvas: 'mcp-demo', title: 'MCP 演示', width: 400, height: 240 });
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>t</title></head><body style="margin:0"><div style="width:400px;height:240px;background:#2d6f6a;color:#fff;font:24px sans-serif;padding:24px;box-sizing:border-box">你好 MCP</div></body></html>';
    const w = await c.call('write_board', { canvas: 'mcp-demo', file: 'X1-Hello.dc.html', html, title: 'Hello · 第一张', page: 'x1', page_name: 'EX1：你好', width: 400, height: 240 });
    assert.equal(w.data.created, true);
    assert.equal(w.data.page, 'x1');
    const bad = await c.call('write_board', { canvas: 'mcp-demo', file: '../evil.html', html });
    assert.ok(bad.isError && /文件名/.test(bad.data));
    const cv = (await c.call('canvas', { canvas: 'mcp-demo' })).data;
    assert.deepEqual(cv.pages.map((p) => [p.id, p.name, p.boards.map((b) => b.file)]), [[cv.pages[0].id, cv.pages[0].name, ['Main.dc.html']], ['x1', 'EX1：你好', ['X1-Hello.dc.html']]]);
    assert.equal((await c.call('read_board', { canvas: 'mcp-demo', file: 'X1-Hello.dc.html' })).data.content, html);

    // self-check with the screenshot coming back, and an export that opens offline
    const ck = await c.call('check', { canvas: 'mcp-demo', board: 'X1-Hello.dc.html', image: true });
    assert.equal(ck.data.passed, true, JSON.stringify(ck.data));
    const img = ck.content.find((x) => x.type === 'image');
    assert.ok(img && img.mimeType === 'image/png' && img.data.length > 100);
    const ex = (await c.call('export', { canvas: 'mcp-demo', board: 'X1-Hello.dc.html', png: true, html: true, scale: 1, out: path.join(root, 'out') })).data;
    assert.ok(fs.existsSync(ex.rows[0].png) && fs.existsSync(ex.rows[0].html));

    // page store, review (only "proposed"), rename, delete and back
    await c.call('db_set', { canvas: 'mcp-demo', path: 'notes/one', data: { a: 1 } });
    assert.deepEqual((await c.call('db_get', { canvas: 'mcp-demo', path: 'notes/one' })).data.data, { a: 1 });
    await c.call('review_propose', { canvas: 'mcp-demo', boards: ['X1-Hello.dc.html'], note: '看一下' });
    assert.equal((await c.call('review', { canvas: 'mcp-demo' })).data.reviews['X1-Hello.dc.html'].status, 'proposed');
    await c.call('rename', { canvas: 'mcp-demo', board: 'X1-Hello.dc.html', title: 'Hello · 改过' });
    const del = (await c.call('delete', { canvas: 'mcp-demo', board: 'X1-Hello.dc.html' })).data;
    assert.equal(del.what, 'board');
    await c.call('trash', { restore: del.id });
    assert.equal((await c.call('canvas', { canvas: 'mcp-demo' })).data.pages[1].boards[0].title, 'Hello · 改过');

    // the address for the owner, the five lists, anything else through dw
    assert.match((await c.call('open', { canvas: 'mcp-demo', board: 'X1-Hello.dc.html' })).data.url, /#\/mcp-demo\?page=x1&board=X1-Hello\.dc\.html$/);
    assert.deepEqual((await c.call('list')).data.sections.map((s) => s.id), ['ds', 'motion', 'explore', 'questionnaire', 'checks']);
    const v = (await c.call('dw', { args: ['versions', 'mcp-demo'] })).data;
    assert.equal(v.exitCode, 0);
    assert.match(v.stdout, /new|save|新建|存档/);
    assert.ok((await c.call('dw', { args: ['serve'] })).isError);
  } finally {
    await c.close();
  }
  // nothing but JSON-RPC came out on stdout
  assert.ok(c.raw.length > 10 && c.raw.every((l) => JSON.parse(l).jsonrpc === '2.0'));
});

test('mcp: a bench on the port that shows another checkout is not ours (Phase 4 worktrees)', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-mcp-ports-'));
  const theirs = path.join(root, 'main-canvases');
  const ours = path.join(root, 'worktree-canvases');
  fs.mkdirSync(theirs);
  fs.mkdirSync(ours);
  const srv = await startServer(loadConfig({ canvasesDir: theirs }), { port: 0, watch: false, quiet: true });
  const port = Number(new URL(srv.baseUrl).port);
  const c = client({ DW_CANVASES: ours });
  try {
    await c.request('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
    assert.ok(!(await c.call('new_canvas', { canvas: 'wt-demo', title: 'Worktree' })).isError);
    const st = (await c.call('serve_status', { port })).data;
    assert.equal(st.running, false);
    assert.match(st.note, /另一份的 bench/);
    const start = await c.call('serve_start', { port });
    assert.ok(start.isError);
    assert.match(start.data, /换一个端口/);
    assert.ok((await c.call('serve_stop', { port })).isError);
    const op = (await c.call('open', { canvas: 'wt-demo', port })).data;
    assert.equal(op.running, false);
    assert.ok(op.url.startsWith(`http://127.0.0.1:${port}/`) && op.note);
  } finally {
    await c.close();
    await srv.close();
  }
});
