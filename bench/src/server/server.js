import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listCanvases, canvasDir, kindOf, readCloud, blobIndex, readCanvasJson } from '../canvas/store.js';
import { listVersions, readVersionFile } from '../canvas/versions.js';
import { listSystems, readSystem, systemBlobs, systemPaths, tokensCss, previewDocument } from '../ds/systems.js';
import { getDoc, setDoc, updateDoc, deleteDoc, listCollection } from '../canvas/db.js';
import { listReviews, setReview, clearReview } from '../canvas/review.js';
import { listMotionSchemes, readMotion, partDocument, exportMotion, motionPaths, closeExportBrowser } from '../motion/parts.js';
import { catalog } from './catalog.js';
import { CDN_HOSTS, getResource, rewriteFontCss, rewritePage, resourcesScript, localUrl } from './offline.js';
import { readChecks, startChecks, watchRun, stopWatching } from './checks.js';
import { renameCanvas, deleteCanvas, renamePage, deletePage, renameBoard, deleteBoard, renameScheme, withNames, listTrash, restoreTrash } from '../canvas/manage.js';

// Local preview server. Binds to 127.0.0.1 only.
//   /                      the canvas board UI (src/board/)
//   /c/<name>/<file>       a canvas's project file; support.js is the Claude canvas runtime
//   /v/<name>/<id>/<file>  the same file as it was in local version <id> (read-only)
//   /_blob/<id>            a board image, looked up in every canvas's blobs/
//   /api/index             everything in five lists (Design System, Motion Deck, Explore Deck, Questionnaire, Checks), catalog.js
//   /api/canvases[/name]   JSON for the board UI and for Agents (?version=<id> for an old canvas.json)
//   /api/canvases/<name>/versions   the local version history
//   /api/ds[/name]         the Design Systems built at the repo root (dist/<方案>/design-system/)
//   /ds/<name>/<file>      a system's built file; tokens.css is compiled; components/<C>/preview.html
//                          comes with tokens.css, fonts and bundle.css injected (?theme=<id>)
//   /api/db/<name>?path=   the page store of a canvas or page (db.json), same calls as the cloud db:
//                          GET / PUT (set) / PATCH (update) / DELETE; /api/db/<name>/collection?path= lists
//   /_claude/runtime.js    the local window.claude (db, user), put first in any page that calls claude.use(
//   /api/events            Server-Sent Events: "reload" when anything under canvases/ changes, "db" when a db.json does
//   POST /api/canvases/<name>/rename { title }          a canvas's or page's new title (folder and address stay)
//   POST /api/canvases/<name>/delete {}                 the whole folder into canvases/.trash/ → { id, … }
//   POST /api/canvases/<name>/page-rename { page, name }   POST /api/canvases/<name>/page-delete { page }
//   POST /api/canvases/<name>/board-rename { file, title }   POST /api/canvases/<name>/board-delete { file }
//   GET /api/trash, POST /api/trash/restore { id }      what was deleted; put one back (the undo)
//   POST /api/names/<ds|motion>/<scheme> { title }      a Design System's or Motion Deck's name in the bench only
//                          (bench/names.json); an empty title goes back to the scheme's own
//   Anything that changes something (every method but GET / HEAD) must come with Host 127.0.0.1:<port> or
//   localhost:<port>, and an Origin, if any, from the same: a web page elsewhere (or one that rebinds its name to
//   127.0.0.1) can't change canvases.
//   /api/review/<name>     each board's review status (db.json review/<file>); POST { file, status, note } from the
//                          board UI marks one (status "clear" removes it)
//   /api/motion[/scheme]   the motion bench: schemes with motion parts, a scheme's parts (schemes/<方案>/motion/)
//   POST /api/motion/<scheme>/<id>/export   renders the part with tooling's renderPart into dist/<方案>/motion/<id>/
//   /motion/<scheme>/<id>.html   the part's page as the exporter renders it (?theme=dark&palette=<id>&reduce=1),
//                          plus the harness module for stepping and freezing time
//   /motion/<scheme>/<id>/<file> what the export wrote (GIFs, contact sheets) in dist/
//   /_va/motion-harness.mjs  tooling/lib/motion-harness.mjs itself, for the board UI and the part pages
//   /api/checks            npm run all's last results (dist/qa/run.json, dist/<方案>/qa-report.json, checks.js);
//   POST /api/checks/run {} starts a run (tooling/qa/all.mjs); SSE "checks" whenever its results change
//   /_dist/<path>          a file under dist/ (the images a check is about), read-only
//   /_cdn/<host>/<path>    React for the canvas runtime and Google Fonts, from bench/.cache/cdn/ (fetched once while
//                          online); every page this server gives out points there, so canvases open offline (offline.js)
//   ?va-scheme=dark&va-motion=reduce on a board under /c/ or /v/: /board/emulate.js goes first in <head> and makes
//                          the page see prefers-color-scheme: dark / prefers-reduced-motion: reduce (the UI's global switches)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const IGNORED_DIRS = ['.versions', '.stage', '.shots', '.trash', 'preview', 'node_modules'];

function mimeOf(file) {
  return MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

/** Joins rel under base and refuses anything that escapes it. */
function safeJoin(base, rel) {
  const abs = path.resolve(base, '.' + path.sep + rel);
  return abs === base || abs.startsWith(base + path.sep) ? abs : null;
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
}

function sendFile(res, abs) {
  if (!abs || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) return send(res, 404, 'Not Found');
  res.writeHead(200, { 'Content-Type': mimeOf(abs), 'Cache-Control': 'no-cache' });
  fs.createReadStream(abs).pipe(res);
}

/** What the board UI's global switches ask for (?va-scheme=dark, ?va-motion=reduce), as emulate.js's query. */
function emulation(url) {
  const q = new URLSearchParams();
  if (url.searchParams.get('va-scheme') === 'dark' || url.searchParams.get('va-scheme') === 'light') q.set('scheme', url.searchParams.get('va-scheme'));
  if (url.searchParams.get('va-motion') === 'reduce') q.set('motion', 'reduce');
  return q.toString();
}

/** An HTML page that calls claude.use( gets the local runtime first in <head>; with emulate, emulate.js goes before
 *  everything; with embed (a board on the canvas view, ?va-embed=1), embed.js goes first of all, so the UI can hold
 *  its motion still. A page that loads the canvas runtime (support.js) gets `resources` (offline.js: React from
 *  /_cdn/); Google Fonts addresses point to /_cdn/ too. */
function sendPage(res, buf, name, { readonly = false, emulate = '', embed = false, resources = '' } = {}) {
  const html = rewritePage(buf.toString('utf8'));
  let tag = embed ? '<script src="/board/embed.js"></script>' : '';
  if (emulate) tag += `<script src="/board/emulate.js?${emulate}"></script>`;
  if (resources && /\bsupport\.js\b/.test(html)) tag += resources;
  if (html.includes('claude.use(')) tag += `<script src="/_claude/runtime.js?canvas=${encodeURIComponent(name)}${readonly ? '&readonly=1' : ''}"></script>`;
  const out = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + tag) : tag + html;
  return send(res, 200, out, MIME['.html']);
}

/** A request that may change something: addressed to this server by its own name, and, when a browser sends it,
 *  from one of this server's own pages. */
function fromHere(req, port) {
  const ok = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  if (!ok.has(String(req.headers.host || '').toLowerCase())) return false;
  const origin = req.headers.origin;
  return !origin || ok.has(String(origin).toLowerCase().replace(/^http:\/\//, ''));
}

function readBody(req, limit = 320 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let n = 0;
    req.on('data', (c) => {
      n += c.length;
      if (n > limit) {
        reject(Object.assign(new Error('文档超过 256 KiB'), { code: 'invalid_argument' }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** What `GET /api/status` says first: another program (Pomelo's 有板有眼) asks this to know the thing on the port is
 *  this server, and which version of the interface it speaks. */
export const BENCH_APP = 'visual-atelier-bench';
export const BENCH_API = 5; // 2: /api/index (the four lists), boards on the canvas view hold still (?va-embed=1);
// 3: rename and delete canvases and pages, the trash; 4: rename and delete boards, name Design Systems and Motion Decks;
// 5: a fifth list "checks" in /api/index and /api/checks (npm run all's results), /_cdn/ (offline)

/**
 * `onStop`: called after `POST /api/stop` has been answered (dw serve passes one and then exits); without it the
 * server can't be stopped from outside (tests, anything that owns the server itself).
 */
export async function startServer(config, { port = config.server.port, watch = true, quiet = false, onStop = null } = {}) {
  // only ever this machine
  const host = '127.0.0.1';
  const startedAt = new Date().toISOString();
  // the board UI is code, so it comes from next to this file, not from config.rootDir
  const boardDir = fileURLToPath(new URL('../board/', import.meta.url)).replace(/\/$/, '');
  let blobs = null;
  const clients = new Set();
  const broadcast = (event, data) => {
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) res.write(msg);
  };

  const watchers = [];
  if (watch && fs.existsSync(config.canvasesAbs)) {
    let timer = null;
    let changed = new Set();
    watchers.push(
      fs.watch(config.canvasesAbs, { recursive: true }, (_e, file) => {
        if (!file || file.includes('.DS_Store') || String(file).endsWith('.tmp')) return;
        const parts = String(file).split(path.sep);
        if (parts.some((p) => IGNORED_DIRS.includes(p))) return;
        // a page's store changed: tell its subscriptions, don't reload anything
        if (parts.length === 2 && parts[1] === 'db.json') return broadcast('db', { canvas: parts[0], at: Date.now() });
        blobs = null;
        changed.add(String(file).split(path.sep).join('/'));
        clearTimeout(timer);
        timer = setTimeout(() => {
          broadcast('reload', { files: [...changed], at: Date.now() });
          changed = new Set();
        }, 120);
      })
    );
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${host}`);
      const pathname = decodeURIComponent(url.pathname);
      // JSON out: compact for what a call gets back, indented for what one reads
      const json = (status, body) => send(res, status, JSON.stringify(body), MIME['.json']);
      const pretty = (body) => send(res, 200, JSON.stringify(body, null, 2), MIME['.json']);
      if (req.method !== 'GET' && req.method !== 'HEAD' && !fromHere(req, server.address().port)) {
        return json(403, { code: 'permission_denied', message: '只接受本机这个服务自己的页面和本机程序' });
      }
      // 改名、删除、回收处（canvas/manage.js）：JSON 进，JSON 出
      const mg = pathname.match(/^\/api\/canvases\/([a-z0-9-]+)\/(rename|delete|page-rename|page-delete|board-rename|board-delete)$/) || pathname.match(/^\/api\/trash(\/restore)?$/) || pathname.match(/^\/api\/names\/(ds|motion)\/([a-z0-9-]+)$/);
      if (mg) {
        const trash = pathname.startsWith('/api/trash');
        const naming = pathname.startsWith('/api/names/');
        if (trash && !mg[1] && req.method === 'GET') return json(200, { items: listTrash(config) });
        if (req.method !== 'POST') return send(res, 405, 'Method Not Allowed');
        if (!String(req.headers['content-type'] || '').startsWith('application/json')) return json(400, { code: 'invalid_argument', message: '要用 application/json 发' });
        let body;
        try {
          body = JSON.parse((await readBody(req, 16 * 1024)) || '{}');
        } catch {
          return json(400, { code: 'invalid_argument', message: '内容不是 JSON' });
        }
        try {
          let out;
          if (naming) {
            const known = (mg[1] === 'ds' ? listSystems(config) : listMotionSchemes(config)).map((x) => x.name);
            out = renameScheme(config, mg[1], mg[2], body.title, { known });
            broadcast('reload', { files: [], names: true, at: Date.now() });
            return json(200, out);
          }
          if (trash) out = restoreTrash(config, String(body.id || ''));
          else if (mg[2] === 'rename') out = renameCanvas(config, mg[1], body.title);
          else if (mg[2] === 'delete') out = deleteCanvas(config, mg[1]);
          else if (mg[2] === 'page-rename') out = renamePage(config, mg[1], String(body.page || ''), body.name);
          else if (mg[2] === 'board-rename') out = renameBoard(config, mg[1], String(body.file || ''), body.title);
          else if (mg[2] === 'board-delete') out = deleteBoard(config, mg[1], String(body.file || ''));
          else out = deletePage(config, mg[1], String(body.page || ''));
          blobs = null;
          broadcast('reload', { files: [trash ? out.canvas : mg[1]], at: Date.now() });
          return json(200, out);
        } catch (e) {
          const status = { not_found: 404, already_exists: 409, failed_precondition: 409, invalid_argument: 400 }[e.code] || 500;
          return json(status, { code: e.code || 'unavailable', message: e.message });
        }
      }
      const dbm = pathname.match(/^\/api\/db\/([a-z0-9-]+)(\/collection)?$/);
      if (dbm) {
        const [, name, coll] = dbm;
        const p = url.searchParams.get('path');
        try {
          if (coll) {
            if (req.method !== 'GET') return send(res, 405, 'Method Not Allowed');
            return json(200, { docs: listCollection(config, name, p) });
          }
          if (req.method === 'GET') return json(200, getDoc(config, name, p));
          if (req.method === 'DELETE') {
            deleteDoc(config, name, p);
            broadcast('db', { canvas: name, at: Date.now() });
            return json(200, { ok: true });
          }
          if (req.method === 'PUT' || req.method === 'PATCH') {
            let body;
            try {
              body = JSON.parse(await readBody(req));
            } catch (e) {
              return json(400, { code: 'invalid_argument', message: e.code ? e.message : '文档内容不是 JSON' });
            }
            (req.method === 'PUT' ? setDoc : updateDoc)(config, name, p, body);
            broadcast('db', { canvas: name, at: Date.now() });
            return json(200, { ok: true });
          }
          return send(res, 405, 'Method Not Allowed');
        } catch (e) {
          return json(e.code ? 400 : 500, { code: e.code || 'unavailable', message: e.message });
        }
      }
      const rv = pathname.match(/^\/api\/review\/([a-z0-9-]+)$/);
      if (rv) {
        try {
          if (kindOf(canvasDir(config, rv[1])) !== 'canvas') return send(res, 404, 'Not Found');
          if (req.method === 'GET') return json(200, { reviews: listReviews(config, rv[1]) });
          if (req.method !== 'POST') return send(res, 405, 'Method Not Allowed');
          let body;
          try {
            body = JSON.parse(await readBody(req, 16 * 1024));
          } catch {
            return json(400, { code: 'invalid_argument', message: '内容不是 JSON' });
          }
          if (body.status === 'clear') clearReview(config, rv[1], String(body.file || ''));
          else setReview(config, rv[1], String(body.file || ''), body.status, { note: body.note, by: 'owner' });
          broadcast('db', { canvas: rv[1], at: Date.now() });
          return json(200, { reviews: listReviews(config, rv[1]) });
        } catch (e) {
          return json(e.code ? 400 : 500, { code: e.code || 'unavailable', message: e.message });
        }
      }
      const mx = pathname.match(/^\/api\/motion\/([a-z0-9-]+)\/([a-z0-9-]+)\/export$/);
      if (mx) {
        if (req.method !== 'POST') return send(res, 405, 'Method Not Allowed');
        try {
          const rows = await exportMotion(config, mx[1], mx[2]);
          const all = await readMotion(config, mx[1]);
          return json(200, { rows, part: all?.parts.find((p) => p.id === mx[2]) || null });
        } catch (e) {
          return json(e.code === 'not_found' ? 404 : e.code ? 400 : 500, { code: e.code || 'unavailable', message: e.message });
        }
      }
      // the interface for another program (docs: bench/README.md「给别的程序用」)
      if (pathname === '/api/stop') {
        if (req.method !== 'POST') return send(res, 405, 'Method Not Allowed');
        // a JSON body: a web page somewhere else can't send one here without asking first, and nothing here answers that
        if (!String(req.headers['content-type'] || '').startsWith('application/json')) return json(400, { code: 'invalid_argument', message: '要用 application/json 发' });
        if (!onStop) return json(409, { code: 'failed_precondition', message: '这个服务不是 dw serve 启动的，停不了' });
        json(200, { ok: true });
        setTimeout(onStop, 50);
        return;
      }
      if (pathname === '/api/checks/run') {
        if (req.method !== 'POST') return send(res, 405, 'Method Not Allowed');
        if (!String(req.headers['content-type'] || '').startsWith('application/json')) return json(400, { code: 'invalid_argument', message: '要用 application/json 发' });
        try {
          const r = startChecks(config, () => broadcast('checks', { at: Date.now() }));
          broadcast('checks', { at: Date.now() });
          return json(200, r);
        } catch (e) {
          return json(e.code === 'already_exists' ? 409 : 500, { code: e.code || 'unavailable', message: e.message });
        }
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method Not Allowed');
      if (pathname === '/api/status') {
        const body = { app: BENCH_APP, api: BENCH_API, pid: process.pid, startedAt, url: `http://${host}:${server.address().port}`, root: config.repoAbs, canvasesDir: config.canvasesAbs, canvases: listCanvases(config).length, stoppable: !!onStop };
        return pretty(body);
      }
      if (pathname === '/_claude/runtime.js') return sendFile(res, path.join(boardDir, 'claude-local.js'));

      if (pathname === '/favicon.ico') {
        res.writeHead(204);
        return res.end();
      }
      if (pathname === '/api/events') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
        res.write('event: connected\ndata: {}\n\n');
        clients.add(res);
        req.on('close', () => clients.delete(res));
        return;
      }
      const cdn = pathname.match(/^\/_cdn\/([a-z0-9.-]+)\/(.+)$/);
      if (cdn) {
        if (!CDN_HOSTS.includes(cdn[1])) return send(res, 404, 'Not Found');
        const target = `https://${cdn[1]}/${url.pathname.split('/').slice(3).join('/')}${url.search}`;
        try {
          const r = await getResource(config, target);
          const body = cdn[1] === 'fonts.googleapis.com' ? rewriteFontCss(r.body.toString('utf8')) : r.body;
          res.writeHead(200, { 'Content-Type': r.type || 'application/octet-stream', 'Cache-Control': 'max-age=31536000, immutable' });
          return res.end(body);
        } catch (e) {
          return send(res, e.code === 'offline' ? 504 : 502, e.message, 'text/plain; charset=utf-8');
        }
      }
      if (pathname === '/api/checks') {
        const body = readChecks(config);
        // a run started elsewhere (npm run all in a terminal): follow it too
        if (body.run?.status === 'running') watchRun(config, () => broadcast('checks', { at: Date.now() }));
        return pretty(body);
      }
      const distFile = pathname.match(/^\/_dist\/(.+)$/);
      if (distFile) return sendFile(res, safeJoin(path.join(config.repoAbs, 'dist'), distFile[1]));
      if (pathname === '/api/index') return pretty(catalog(config));
      if (pathname === '/api/canvases') return pretty({ canvases: listCanvases(config) });
      const apiV = pathname.match(/^\/api\/canvases\/([a-z0-9-]+)\/versions$/);
      if (apiV) {
        if (!kindOf(canvasDir(config, apiV[1]))) return send(res, 404, 'Not Found');
        // ?file=<board>: also each version's checksum of that board (null when the version hasn't got it)
        const board = url.searchParams.get('file');
        const versions = listVersions(config, apiV[1]).map(({ id, label, createdAt, events, files }) => ({ id, label, createdAt, events: events || [], files: Object.keys(files).length, ...(board ? { board: files[`project/${board}`] || null } : {}) }));
        return pretty({ versions });
      }
      const api = pathname.match(/^\/api\/canvases\/([a-z0-9-]+)$/);
      if (api) {
        const dir = canvasDir(config, api[1]);
        const kind = kindOf(dir);
        if (!kind) return send(res, 404, 'Not Found');
        const body = { name: api[1], kind, cloud: readCloud(dir) };
        const version = url.searchParams.get('version');
        if (kind === 'canvas' && version) {
          const buf = readVersionFile(config, api[1], version, 'project/canvas.json');
          if (!buf) return send(res, 404, 'Not Found');
          body.canvas = JSON.parse(buf.toString('utf8'));
          body.version = version;
        } else if (kind === 'canvas') body.canvas = readCanvasJson(config, api[1]);
        return pretty(body);
      }

      if (pathname === '/api/ds') return pretty({ systems: withNames(config, 'ds', listSystems(config)) });
      const apiDs = pathname.match(/^\/api\/ds\/([a-z0-9-]+)$/);
      if (apiDs) {
        if (!listSystems(config).some((x) => x.name === apiDs[1])) return send(res, 404, 'Not Found');
        try {
          const sys = readSystem(config, apiDs[1]);
          sys.fonts = (sys.fonts || []).map((u) => (u.startsWith('https://fonts.googleapis.com/') ? localUrl(u) : u));
          return pretty(sys);
        } catch (err) {
          return json(409, { error: err.message });
        }
      }
      const ds = pathname.match(/^\/ds\/([a-z0-9-]+)\/(.+)$/);
      if (ds) {
        const [, name, rel] = ds;
        if (!listSystems(config).some((x) => x.name === name && x.built)) return send(res, 404, 'Not Found');
        const project = systemPaths(config, name).project;
        const prev = rel.match(/^components\/([A-Za-z_$][\w$]*)\/preview\.html$/);
        if (prev) {
          const html = previewDocument(config, name, prev[1], url.searchParams.get('theme'));
          return html ? send(res, 200, rewritePage(html), MIME['.html']) : send(res, 404, 'Not Found');
        }
        if (rel === 'tokens.css' && !fs.existsSync(path.join(project, rel))) {
          const tokens = JSON.parse(fs.readFileSync(path.join(project, 'tokens.json'), 'utf8'));
          return send(res, 200, tokensCss(tokens), MIME['.css']);
        }
        return sendFile(res, safeJoin(project, rel));
      }

      if (pathname === '/api/motion') return pretty({ schemes: withNames(config, 'motion', listMotionSchemes(config)) });
      const apiM = pathname.match(/^\/api\/motion\/([a-z0-9-]+)$/);
      if (apiM) {
        const body = await readMotion(config, apiM[1]);
        if (body) body.title = withNames(config, 'motion', [{ name: apiM[1], title: body.title }])[0].title;
        return body ? pretty(body) : send(res, 404, 'Not Found');
      }
      if (pathname === '/_va/motion-harness.mjs') return sendFile(res, path.join(config.repoAbs, 'tooling/lib/motion-harness.mjs'));
      const mp = pathname.match(/^\/motion\/([a-z0-9-]+)\/([a-z0-9-]+)\.html$/);
      if (mp) {
        if (!fs.existsSync(path.join(motionPaths(config, mp[1], mp[2]).src, 'motion.json'))) return send(res, 404, 'Not Found');
        const html = await partDocument(config, mp[1], mp[2], { theme: url.searchParams.get('theme'), palette: url.searchParams.get('palette'), reduce: url.searchParams.get('reduce') === '1' });
        return send(res, 200, rewritePage(html), MIME['.html']);
      }
      const mf = pathname.match(/^\/motion\/([a-z0-9-]+)\/([a-z0-9-]+)\/([^/]+)$/);
      if (mf) return sendFile(res, safeJoin(motionPaths(config, mf[1], mf[2]).out, mf[3]));

      const v = pathname.match(/^\/v\/([a-z0-9-]+)\/([0-9A-Za-z~_-]+)\/(.+)$/);
      if (v) {
        const [, name, id, rel] = v;
        if (rel === 'support.js') return sendFile(res, config.runtimeAbs);
        const kind = kindOf(canvasDir(config, name));
        const key = kind === 'page' ? rel : `project/${rel}`;
        if (key.split('/').includes('..')) return send(res, 404, 'Not Found');
        const buf = readVersionFile(config, name, id, key);
        if (!buf) return send(res, 404, 'Not Found');
        if (/\.html?$/i.test(rel)) return sendPage(res, buf, name, { readonly: true, emulate: emulation(url), embed: url.searchParams.get('va-embed') === '1', resources: resourcesScript(config) });
        res.writeHead(200, { 'Content-Type': mimeOf(rel), 'Cache-Control': 'no-cache' });
        return res.end(buf);
      }

      const blob = pathname.match(/^\/_blob\/([0-9a-f]{32})$/);
      if (blob) {
        blobs = blobs || blobIndex(config);
        if (blobs.has(blob[1])) return sendFile(res, blobs.get(blob[1]));
        // an asset of a built Design System
        const dsBlob = systemBlobs(config).get(blob[1]);
        if (dsBlob) return sendFile(res, dsBlob);
        // an image an old version still uses but that is gone from blobs/
        for (const c of listCanvases(config)) {
          for (const ver of listVersions(config, c.name).reverse()) {
            const rel = Object.keys(ver.files).find((r) => r.startsWith(`blobs/${blob[1]}.`));
            if (rel) {
              res.writeHead(200, { 'Content-Type': mimeOf(rel), 'Cache-Control': 'no-cache' });
              return res.end(readVersionFile(config, c.name, ver.id, rel));
            }
          }
        }
        return send(res, 404, 'Not Found');
      }

      const c = pathname.match(/^\/c\/([a-z0-9-]+)\/(.*)$/);
      if (c) {
        const dir = canvasDir(config, c[1]);
        const kind = kindOf(dir);
        if (!kind) return send(res, 404, 'Not Found');
        const rel = c[2];
        // an <img src="{{hole}}"> in a board template: the browser fetches the literal text once before render
        if (/^\{\{[^/]*\}\}$/.test(rel)) {
          res.writeHead(204);
          return res.end();
        }
        const abs = kind === 'page' ? safeJoin(dir, rel || readCloud(dir).entry) : safeJoin(path.join(dir, 'project'), rel || 'Main.dc.html');
        if (kind === 'canvas' && rel === 'support.js' && !fs.existsSync(abs)) return sendFile(res, config.runtimeAbs);
        if (abs && /\.html?$/i.test(abs) && fs.existsSync(abs) && fs.statSync(abs).isFile()) return sendPage(res, fs.readFileSync(abs), c[1], { emulate: emulation(url), embed: url.searchParams.get('va-embed') === '1', resources: resourcesScript(config) });
        return sendFile(res, abs);
      }

      if (pathname === '/' || pathname === '/index.html' || pathname.startsWith('/board/')) {
        const rel = pathname.startsWith('/board/') ? pathname.slice('/board/'.length) : 'index.html';
        const abs = safeJoin(boardDir, rel);
        if (abs && fs.existsSync(abs)) return sendFile(res, abs);
      }
      return send(res, 404, 'Not Found');
    } catch (err) {
      return send(res, 500, `500 ${err.message}`);
    }
  });

  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, host, resolve);
    });
  } catch (e) {
    // the port is taken: nothing of ours may keep the process alive
    for (const w of watchers) w.close();
    throw e;
  }
  const actualPort = server.address().port;
  const baseUrl = `http://${host}:${actualPort}`;
  if (!quiet) console.log(`[dw serve] ${baseUrl}/`);
  return {
    baseUrl,
    port: actualPort,
    close: async () => {
      for (const w of watchers) w.close();
      stopWatching();
      for (const r of clients) r.end();
      await closeExportBrowser();
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(resolve));
    }
  };
}
