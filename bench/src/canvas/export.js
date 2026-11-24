import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { canvasDir, kindOf, readCanvasJson, localBlobs } from './store.js';
import { encodeManifestEntry, extToMime, escapeHtml } from '../bundler/codec.js';
import { boardsOf, boardUrl, stemOf } from './check.js';
import { startServer } from '../server/server.js';
import { captureUrl } from '../server/headless.js';
import { readCached, runtimeResources, fontCssLinks, facesFor, codePoints, prefetchPage, cdnUrl } from '../server/offline.js';

// dw export：把画板导出成 PNG，或打成一个单文件 HTML。
// 单文件 HTML 用 Claude「导出单文件 HTML」同一种外壳（bridges/claude/templates/bundler-page-shell.html）：
// 画板源码里的 support.js、/_blob/<id>、同目录的文件（ds/<名字>/…）换成清单 id，文件 gzip 后放进清单，
// 打开时外壳再换回来。id 由路径算出，同一份源两次导出逐字节一致。
// 断网也能打开（站主 2026-11-14 在 Phase 1 验收问卷里定的）：画布运行时取的 React 打进清单，经外壳的 ext_resources
// 换掉 jsDelivr 的地址；Google Fonts 的样式直接写进页面，只留这张板用到的字所在的分块，字体文件打进清单。这些都从
// 本机的缓存取（server/offline.js），exportBoards 先联网补齐；补不齐的照旧联网取，列在 offlineMissing 里。

const SHELL = fileURLToPath(new URL('../../bridges/claude/templates/bundler-page-shell.html', import.meta.url));

/** A uuid made from a string, so the same input always gets the same id. */
function stableUuid(seed) {
  const h = crypto.createHash('sha256').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const TEXT = /^(text\/|application\/(javascript|json)|image\/svg)/;

/** Packs one board into a self-contained bundle HTML string. */
export function packBoard(config, name, file) {
  const dir = canvasDir(config, name);
  if (kindOf(dir) !== 'canvas') throw new Error(`${name} 不是画布（页面已经是单文件，直接用它的入口）`);
  const projectDir = path.join(dir, 'project');
  const boardAbs = path.join(projectDir, file);
  if (!fs.existsSync(boardAbs)) throw new Error(`${name} 没有画板 ${file}`);
  let html = fs.readFileSync(boardAbs, 'utf8');
  const source = html;
  const manifest = {};
  const add = (key, buf, mime) => {
    const id = stableUuid(`${name}/${key}`);
    if (!manifest[id]) manifest[id] = encodeManifestEntry(buf, mime, TEXT.test(mime) || !/^(image\/(png|jpe?g|webp|gif)|font\/woff2?)$/.test(mime));
    return id;
  };
  const missing = [];
  // images by id
  const blobs = localBlobs(config, name);
  html = html.replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => {
    const b = blobs[id];
    if (!b) {
      missing.push(m);
      return m;
    }
    return add(b.rel, fs.readFileSync(b.abs), extToMime(b.rel));
  });
  // support.js and files next to the board (ds/<folder>/…, other relative src / href)
  const boardDir = path.dirname(boardAbs);
  html = html.replace(/\b(src|href)=(["'])([^"'#?]+)\2/g, (m, attr, q, ref) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#|\{\{)/i.test(ref) || manifest[ref]) return m;
    const clean = ref.replace(/^\.\//, '');
    if (clean === 'support.js') return `${attr}=${q}${add('support.js', fs.readFileSync(config.runtimeAbs), 'text/javascript')}${q}`;
    const abs = path.resolve(boardDir, clean);
    if (!abs.startsWith(projectDir + path.sep) || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      missing.push(ref);
      return m;
    }
    const rel = path.relative(projectDir, abs).split(path.sep).join('/');
    return `${attr}=${q}${add(rel, fs.readFileSync(abs), extToMime(rel))}${q}`;
  });
  // offline: Google Fonts written into the page (only the blocks for characters this board has), fonts packed
  const offlineMissing = [];
  const used = codePoints(source);
  for (const cssUrl of fontCssLinks(source)) {
    const css = readCached(config, cssUrl);
    if (!css) {
      offlineMissing.push(cssUrl);
      continue;
    }
    const faces = facesFor(css.body.toString('utf8'), used).map((face) => {
      let block = face.css;
      for (const u of face.urls) {
        const font = readCached(config, u);
        if (!font) {
          offlineMissing.push(u);
          continue;
        }
        block = block.split(u).join(add(`cdn/${u.replace(/^https:\/\//, '')}`, font.body, font.type || 'font/woff2'));
      }
      return block;
    });
    const style = `<style data-va-offline="fonts">\n${faces.join('\n')}\n</style>`;
    html = html.replace(/<link\b[^>]*\bhref=(["'])(https:\/\/fonts\.googleapis\.com\/css2?\?[^"']+)\1[^>]*>/gi, (m, q, href) => (cdnUrl(href) === cssUrl ? style : m));
  }
  if (!offlineMissing.length) html = html.replace(/<link\b[^>]*\brel=(["'])preconnect\1[^>]*\bhref=(["'])https:\/\/fonts\.(googleapis|gstatic)\.com\/?\2[^>]*>\s*/gi, '');
  // offline: the runtime's React (and Babel, for text/babel) from the manifest instead of jsDelivr
  const ext = [];
  if (/\bsupport\.js\b/.test(source)) {
    for (const r of runtimeResources(config)) {
      if (/babel/.test(r.url) && !/type=["']text\/babel/.test(source)) continue;
      const hit = readCached(config, r.url);
      if (!hit) {
        offlineMissing.push(r.url);
        continue;
      }
      ext.push({ id: r.url, uuid: add(`cdn/${r.url.replace(/^https:\/\//, '')}`, hit.body, 'text/javascript') });
    }
  }
  const title = (readCanvasJson(config, name).boards[file]?.title) || file.replace(/\.dc\.html$/, '');
  const safeJson = (v) => JSON.stringify(v).replace(/<\/script/gi, '<\\/script');
  const shell = fs.readFileSync(SHELL, 'utf8');
  const out = shell
    .replace(/\{\{TITLE\}\}/g, escapeHtml(title))
    .replace('{{MANIFEST_JSON}}', () => safeJson(manifest))
    .replace('{{EXT_RESOURCES_JSON}}', () => safeJson(ext))
    .replace('{{PAGE_ORDER_JSON}}', () => safeJson([]))
    .replace('{{TEMPLATE_JSON}}', () => safeJson(html));
  return { html: out, files: Object.keys(manifest).length, missing, offlineMissing: [...new Set(offlineMissing)] };
}

/**
 * Exports boards as PNG (at their own size, `scale` × pixels) and/or single-file HTML into outDir.
 * Returns one row per board.
 */
export async function exportBoards(config, name, { board = null, png = true, html = false, scale = 2, outDir = null } = {}) {
  const dir = canvasDir(config, name);
  const out = outDir || path.join(dir, '.shots', 'export');
  fs.mkdirSync(out, { recursive: true });
  const rows = [];
  const boards = boardsOf(config, name, board);
  const srv = png ? await startServer(config, { port: 0, watch: false, quiet: true }) : null;
  try {
    for (const b of boards) {
      const stem = stemOf(b.file).split('/').join('-');
      const row = { file: b.file };
      if (png) {
        const target = path.join(out, `${stem}.png`);
        const r = await captureUrl(config, boardUrl(srv.baseUrl, name, b), target, { width: b.w, height: b.h, scale, fullPage: Boolean(b.page) });
        row.png = target;
        row.errors = r.allErrors;
      }
      if (html && !b.page) {
        // everything it needs offline into the cache first (needs the network once); what can't be had stays online
        await prefetchPage(config, fs.readFileSync(path.join(dir, 'project', b.file), 'utf8'));
        const p = packBoard(config, name, b.file);
        row.offlineMissing = p.offlineMissing;
        const target = path.join(out, `${stem}.html`);
        fs.writeFileSync(target, p.html);
        row.html = target;
        row.missing = p.missing;
      }
      rows.push(row);
    }
  } finally {
    await srv?.close();
  }
  return { outDir: out, rows };
}
