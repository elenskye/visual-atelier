import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// 断网也能看（Phase 2 B2，站主 2026-11-12 定，2026-11-14 加了导出的单文件 HTML 也要）。
// 画板、问卷、Design System 页从网上取的只有两样：画布运行时取的 React（jsDelivr），和 Google Fonts 的样式、字体。
// 本机服务把它们都改成走 /_cdn/<主机>/<路径>：第一次（联网时）取来存进 bench/.cache/cdn/，以后都从这里给，断网也有。
//   - 运行时的 React：页面里先放一句 window.__resources（运行时自带的换地址的口子），运行时文件本身一个字也不改。
//     这几个文件带着运行时写好的 sha384，取来时核对，对不上不存。
//   - Google Fonts：页面里的 https://fonts.googleapis.com/、https://fonts.gstatic.com/ 换成 /_cdn/…；样式按 Chrome 的
//     User-Agent 取（拿到 woff2 和按字符分块的 unicode-range），给浏览器时把里面字体的地址也换掉。
//   - dw offline 一次把所有画布、问卷、Design System 用到的都取好；导出单文件 HTML 时也从这里取，打进文件（export.js）。
// 只取下面这几个主机的东西，只 GET；缓存不进 Git，只在这台机器上（和 .versions/ 一样）。

export const CDN_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const FONT_CSS = 'fonts.googleapis.com';

export const cacheDir = (config) => path.join(config.cacheAbs, 'cdn');
const keyOf = (url) => crypto.createHash('sha256').update(url).digest('hex').slice(0, 40);

/** https://<host>/<path> on one of the hosts above, or null. */
export function cdnUrl(raw) {
  let u;
  try {
    u = new URL(String(raw).replace(/&amp;/g, '&'));
  } catch {
    return null;
  }
  return u.protocol === 'https:' && CDN_HOSTS.includes(u.hostname) ? u.href : null;
}
/** Where this server gives it out. */
export const localUrl = (url) => `/_cdn/${url.replace(/^https:\/\//, '')}`;

/** The files the canvas runtime fetches from jsDelivr, with the sha384 it expects: [{ url, integrity }]. */
export function runtimeResources(config) {
  let src = '';
  try {
    src = fs.readFileSync(config.runtimeAbs, 'utf8');
  } catch {
    return [];
  }
  const out = [];
  for (const m of src.matchAll(/"(https:\/\/cdn\.jsdelivr\.net\/npm\/[^"]+\.js)"\s*,\s*[\w$]+\s*=\s*"(sha(?:256|384|512)-[A-Za-z0-9+/=]+)"/g)) out.push({ url: m[1], integrity: m[2] });
  return out;
}
const integrityOf = (config, url) => runtimeResources(config).find((r) => r.url === url)?.integrity || null;
function sri(buf, integrity) {
  const [alg, want] = integrity.split('-');
  return crypto.createHash(alg).update(buf).digest('base64') === want;
}

/** What is cached for a URL: { body, type, meta } or null. */
export function readCached(config, url) {
  const base = path.join(cacheDir(config), keyOf(url));
  try {
    const meta = JSON.parse(fs.readFileSync(`${base}.json`, 'utf8'));
    if (meta.url !== url) return null;
    return { body: fs.readFileSync(base), type: meta.type, meta };
  } catch {
    return null;
  }
}

function store(config, url, body, type) {
  const dir = cacheDir(config);
  fs.mkdirSync(dir, { recursive: true });
  const base = path.join(dir, keyOf(url));
  fs.writeFileSync(base, body);
  const meta = { url, type, size: body.length, sha256: crypto.createHash('sha256').update(body).digest('hex'), fetchedAt: new Date().toISOString() };
  fs.writeFileSync(`${base}.json`, JSON.stringify(meta, null, 2) + '\n');
  return { body, type, meta };
}

/** Puts one file in the cache by hand (tests, or a file brought from elsewhere). */
export const seedCache = (config, url, body, type) => store(config, url, Buffer.isBuffer(body) ? body : Buffer.from(body), type);

/**
 * The file for a CDN URL: from the cache, else fetched (online) and kept. Throws when it can't be had; the error says
 * whether it was the network. `config.offlineFetch` replaces fetch (tests).
 */
export async function getResource(config, url) {
  const hit = readCached(config, url);
  if (hit) return hit;
  const doFetch = config.offlineFetch || fetch;
  let r;
  try {
    r = await doFetch(url, { headers: new URL(url).hostname === FONT_CSS ? { 'User-Agent': CHROME_UA } : {}, signal: AbortSignal.timeout(20000) });
  } catch (e) {
    const err = new Error(`没联网，这个文件还没存过：${url}`);
    err.code = 'offline';
    err.cause = e;
    throw err;
  }
  if (!r.ok) {
    const err = new Error(`${url} 返回 ${r.status}`);
    err.code = 'upstream';
    throw err;
  }
  const body = Buffer.from(await r.arrayBuffer());
  const integrity = integrityOf(config, url);
  if (integrity && !sri(body, integrity)) {
    const err = new Error(`${url} 的内容和画布运行时写的 ${integrity.split('-')[0]} 对不上，没存`);
    err.code = 'integrity';
    throw err;
  }
  return store(config, url, body, (r.headers.get('content-type') || 'application/octet-stream').split(';')[0].trim());
}

/** Font CSS from Google, with its font files pointing here. */
export const rewriteFontCss = (css) => css.replace(/https:\/\/fonts\.gstatic\.com\//g, '/_cdn/fonts.gstatic.com/');

/** A page's Google Fonts addresses pointed here. */
export const rewritePage = (html) => html.replace(/https:\/\/fonts\.(googleapis|gstatic)\.com\//g, (m, h) => `/_cdn/fonts.${h}.com/`);

/** The script that sends the runtime's React (and Babel) here instead of jsDelivr; '' when there is no runtime. */
export function resourcesScript(config) {
  const map = Object.fromEntries(runtimeResources(config).map((r) => [r.url, localUrl(r.url)]));
  if (!Object.keys(map).length) return '';
  return `<script>window.__resources=Object.assign(window.__resources||{},${JSON.stringify(map)})</script>`;
}

// ---------- 字符、unicode-range、样式 ----------

/** Every code point a text uses (the board's whole source: markup, scripts, data). */
export function codePoints(text) {
  const out = new Set();
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c >= 0x20) out.add(c);
  }
  return out;
}

function inRange(range, used) {
  if (!range) return true; // no unicode-range: the whole font
  for (const part of range.split(',')) {
    const m = part.trim().match(/^U\+([0-9a-f?]+)(?:-([0-9a-f]+))?$/i);
    if (!m) continue;
    let lo;
    let hi;
    if (m[1].includes('?')) {
      lo = parseInt(m[1].replace(/\?/g, '0'), 16);
      hi = parseInt(m[1].replace(/\?/g, 'f'), 16);
    } else {
      lo = parseInt(m[1], 16);
      hi = m[2] ? parseInt(m[2], 16) : lo;
    }
    for (const c of used) if (c >= lo && c <= hi) return true;
  }
  return false;
}

/** The @font-face blocks of a Google Fonts stylesheet: [{ css, urls, range }]; `rest` is everything else. */
export function fontFaces(css) {
  const faces = [];
  const rest = css.replace(/(?:\/\*[^*]*\*\/\s*)?@font-face\s*\{[^}]*\}/g, (block) => {
    const range = block.match(/unicode-range:\s*([^;}]+)/i)?.[1]?.trim() || null;
    const urls = [...block.matchAll(/url\((["']?)(https:\/\/fonts\.gstatic\.com\/[^)"']+)\1\)/g)].map((m) => m[2]);
    faces.push({ css: block.replace(/^\/\*[^*]*\*\/\s*/, ''), urls, range });
    return '';
  });
  return { faces, rest: rest.trim() };
}

/** Only the blocks with characters this text uses. */
export const facesFor = (css, used) => fontFaces(css).faces.filter((f) => inRange(f.range, used));

/** The Google Fonts stylesheets a page links to (absolute https URLs, &amp; undone). */
export function fontCssLinks(html) {
  const out = [];
  for (const m of html.matchAll(/https:\/\/fonts\.googleapis\.com\/css2?\?[^"'\s<>)]+/g)) {
    const u = cdnUrl(m[0]);
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}

/**
 * Makes sure everything a page needs offline is cached: the runtime's files (when it uses the runtime; Babel only for
 * text/babel), its Google Fonts stylesheets and, of those, the font files for the characters it uses (all of them with
 * `allGlyphs`). Returns { have: [...], missing: [{ url, why }] }.
 */
export async function prefetchPage(config, html, { allGlyphs = false, extraText = '' } = {}) {
  const have = [];
  const missing = [];
  const take = async (url) => {
    try {
      const r = await getResource(config, url);
      have.push(url);
      return r;
    } catch (e) {
      missing.push({ url, why: e.message });
      return null;
    }
  };
  if (/\bsupport\.js\b/.test(html)) {
    for (const r of runtimeResources(config)) {
      if (/babel/.test(r.url) && !/type=["']text\/babel/.test(html)) continue;
      await take(r.url);
    }
  }
  const used = codePoints(html + extraText);
  for (const cssUrl of fontCssLinks(html)) {
    const css = await take(cssUrl);
    if (!css) continue;
    const faces = allGlyphs ? fontFaces(css.body.toString('utf8')).faces : facesFor(css.body.toString('utf8'), used);
    for (const f of faces) for (const u of f.urls) await take(u);
  }
  return { have, missing };
}
