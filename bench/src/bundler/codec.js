import zlib from 'node:zlib';
import path from 'node:path';

/**
 * Checks whether an HTML string is a Claude Design `__bundler` single-file bundle.
 * @param {string} htmlContent
 * @returns {boolean}
 */
export function isClaudeBundlerHtml(htmlContent) {
  if (typeof htmlContent !== 'string') return false;
  return (
    /<script\s+type=["']__bundler\/manifest["']\s*>/i.test(htmlContent) &&
    /<script\s+type=["']__bundler\/template["']\s*>/i.test(htmlContent)
  );
}

/**
 * Extracts a `<script type="__bundler/...">` JSON payload from an HTML bundle.
 * @param {string} htmlContent
 * @param {string} bundlerType e.g. '__bundler/manifest'
 * @param {any} defaultVal
 */
function extractScriptJson(htmlContent, bundlerType, defaultVal = null) {
  const escaped = bundlerType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<script\\s+type=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/script>`,
    'i'
  );
  const match = htmlContent.match(re);
  if (!match) return defaultVal;
  return JSON.parse(match[1].trim());
}

/**
 * Parses all 4 `<script type="__bundler/*">` blocks and document title from a Claude Design bundle.
 * @param {string} htmlContent
 */
export function extractBundlerBlocks(htmlContent) {
  const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : 'Untitled Bundle';

  const manifest = extractScriptJson(htmlContent, '__bundler/manifest', {});
  const extResources = extractScriptJson(htmlContent, '__bundler/ext_resources', []);
  const pageOrder = extractScriptJson(htmlContent, '__bundler/page_order', []);
  const template = extractScriptJson(htmlContent, '__bundler/template', '');

  return {
    title,
    manifest,
    extResources,
    pageOrder,
    template
  };
}

export function decodeHtmlEntities(str) {
  return String(str)
    .replace(/&hellip;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Decodes a single `__bundler/manifest` entry `{ mime, compressed, data }`.
 * @param {{ mime: string, compressed?: boolean, data: string }} entry
 * @returns {{ buffer: Buffer, mime: string, compressed: boolean }}
 */
export function decodeManifestEntry(entry) {
  if (!entry || typeof entry.data !== 'string') {
    throw new Error('Invalid manifest entry: missing base64 data');
  }
  const rawBuffer = Buffer.from(entry.data, 'base64');
  const buffer = entry.compressed ? zlib.gunzipSync(rawBuffer) : rawBuffer;
  return {
    buffer,
    mime: entry.mime || 'application/octet-stream',
    compressed: Boolean(entry.compressed)
  };
}

/**
 * Encodes a Buffer into a `__bundler/manifest` entry `{ mime, compressed, data }`.
 * @param {Buffer | string} input
 * @param {string} mime
 * @param {boolean} compress
 */
export function encodeManifestEntry(input, mime = 'text/html', compress = true) {
  const rawBuffer = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  const payload = compress ? zlib.gzipSync(rawBuffer) : rawBuffer;
  return {
    mime,
    compressed: Boolean(compress),
    data: payload.toString('base64')
  };
}

const MIME_TO_EXT_MAP = {
  'text/html': '.html',
  'text/javascript': '.js',
  'application/javascript': '.js',
  'application/x-javascript': '.js',
  'text/jsx': '.jsx',
  'text/babel': '.jsx',
  'text/css': '.css',
  'application/json': '.json',
  'image/svg+xml': '.svg',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'font/woff2': '.woff2',
  'application/font-woff2': '.woff2',
  'font/woff': '.woff',
  'application/font-woff': '.woff',
  'font/ttf': '.ttf',
  'application/x-font-ttf': '.ttf',
  'font/otf': '.otf',
  'application/x-font-opentype': '.otf'
};

const EXT_TO_MIME_MAP = Object.fromEntries(
  Object.entries(MIME_TO_EXT_MAP).map(([mime, ext]) => [ext, mime])
);

export function mimeToExt(mime = '') {
  const clean = String(mime).split(';')[0].trim().toLowerCase();
  return MIME_TO_EXT_MAP[clean] || '.bin';
}

export function extToMime(filename = '') {
  const ext = path.extname(filename).toLowerCase();
  return EXT_TO_MIME_MAP[ext] || 'application/octet-stream';
}

/**
 * Strips `integrity` and `crossorigin` attributes on tags whose `src|href|data|poster`
 * were rewritten from UUIDs to local relative paths.
 * @param {string} html
 */
export function stripSriOnLocalTags(html) {
  return html.replace(
    /<([a-zA-Z][\w-]*)(\s[^>]*?\b(?:src|href|data|poster)=["'](?:\.\.?\/|\/)[^"']*["'][^>]*?)>/g,
    (_full, tag, attrs) =>
      `<${tag}${attrs
        .replace(/\s+integrity=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/\s+crossorigin=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')}>`
  );
}

/** A board's own size: the `$preview` in its `<script data-props='…'>` (Claude Design `<x-dc>`), or null. */
export function previewSize(htmlContent) {
  const m = String(htmlContent).match(/<script\b[^>]*\bdata-props=(?:'([^']*)'|"([^"]*)")[^>]*>/i);
  if (!m) return null;
  try {
    const preview = JSON.parse(decodeHtmlEntities(m[1] ?? m[2] ?? ''))?.$preview;
    return preview && typeof preview === 'object' ? preview : null;
  } catch {
    return null;
  }
}
