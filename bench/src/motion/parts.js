import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { NAME_RE as NAME } from '../canvas/store.js';

// The Motion Deck: each scheme's motion parts (schemes/<方案>/motion/<id>/motion.json), the same page the
// exporter freezes (tooling/render/motion.mjs partPage) and the same export (renderPart). Nothing here draws or times a
// motion itself: the page comes from tooling/, the step timeline from tooling/lib/motion-harness.mjs, so what the bench
// shows and exports is what `npm run build:motion` gives.

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** A tooling/ module of this repository (config.repoAbs). */
const tooling = (config, rel) => import(pathToFileURL(path.join(config.repoAbs, rel)).href);

export function motionPaths(config, scheme, id = '') {
  if (!NAME.test(scheme) || (id && !NAME.test(id))) throw Object.assign(new Error(`名字不对：${scheme}/${id}`), { code: 'invalid_argument' });
  const dist = config.distAbs ? path.resolve(config.distAbs) : path.join(config.repoAbs, 'dist');
  return { src: path.join(config.repoAbs, 'schemes', scheme, 'motion', id), out: path.join(dist, scheme, 'motion', id) };
}

const partDirs = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((id) => NAME.test(id) && fs.existsSync(path.join(dir, id, 'motion.json'))).sort()
    : [];

/** A scheme's own name (scheme.json's title), or its folder name. */
function schemeTitle(config, scheme) {
  try {
    return readJson(path.join(config.repoAbs, 'schemes', scheme, 'scheme.json')).title || scheme;
  } catch {
    return scheme;
  }
}

/** Every scheme with at least one motion part: [{ name, title, parts }]. */
export function listMotionSchemes(config) {
  const root = path.join(config.repoAbs, 'schemes');
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((s) => NAME.test(s))
    .map((name) => ({ name, title: schemeTitle(config, name), parts: partDirs(path.join(root, name, 'motion')).length }))
    .filter((s) => s.parts > 0);
}

/**
 * A scheme's parts as the bench UI needs them. Read at request time, part by part: a part someone is still writing
 * (motion.json not valid yet) comes back with `error` instead of breaking the list.
 */
export async function readMotion(config, scheme) {
  const { src } = motionPaths(config, scheme);
  if (!fs.existsSync(src)) return null;
  const { stepsOf } = await tooling(config, 'tooling/lib/motion-harness.mjs');
  const { loadTokens, paletteIds } = await tooling(config, 'tooling/lib/common.mjs');
  let palettes = [];
  let defaultPalette = null;
  try {
    const t = loadTokens(scheme);
    palettes = paletteIds(t).filter(Boolean).map((id) => ({ id, label: t.color.palettes[id]?.label || id }));
    defaultPalette = t.color.defaultPalette || palettes[0]?.id || null;
  } catch {}
  const title = schemeTitle(config, scheme);
  const parts = partDirs(src).map((dir) => {
    let spec;
    try {
      spec = readJson(path.join(src, dir, 'motion.json'));
    } catch (e) {
      return { id: dir, error: `motion.json 读不了：${e.message}` };
    }
    const c = spec.capture || {};
    const steps = stepsOf({ steps: c.steps, trigger: { type: 'class', host: c.host, playClass: c.playClass, target: c.playTarget, all: c.playAll }, host: c.host }) || [];
    const id = spec.id || dir;
    const { out } = motionPaths(config, scheme, NAME.test(id) ? id : dir);
    const exported = {};
    for (const theme of c.themes || ['light']) {
      const gif = path.join(out, `${id}-${theme}.gif`);
      const contact = path.join(out, `contact-${theme}.png`);
      if (!fs.existsSync(gif)) continue;
      const at = Math.round(fs.statSync(gif).mtimeMs);
      exported[theme] = {
        gif: `/motion/${scheme}/${id}/${encodeURIComponent(path.basename(gif))}?t=${at}`,
        contact: fs.existsSync(contact) ? `/motion/${scheme}/${id}/${path.basename(contact)}?t=${at}` : null,
        bytes: fs.statSync(gif).size,
        at: new Date(at).toISOString()
      };
    }
    return {
      id: dir,
      title: spec.title || dir,
      status: spec.status || null,
      tier: spec.tier || null,
      surface: spec.surface || null,
      calmException: spec.calmException || null,
      durationMs: spec.durationMs ?? null,
      loop: !!spec.loop,
      trigger: spec.trigger || '',
      reducedMotion: spec.reducedMotion || '',
      use: spec.use || '',
      source: typeof spec.source === 'string' ? spec.source : spec.source ? Object.values(spec.source).join(' · ') : '',
      files: spec.files || {},
      capture: { host: c.host, viewport: c.viewport || [240, 160], themes: c.themes || ['light'], palette: c.palette || null, fps: c.fps, scale: c.scale, endMs: c.endMs ?? null, steps },
      exported
    };
  });
  return { scheme, title, palettes, defaultPalette, parts };
}

/**
 * The part's page, as the exporter renders it, plus two things that don't draw anything: emulate.js first in <head>
 * when asked for reduced motion, and the harness module (window.__vaHarness) so the bench can step and freeze time in
 * the page the same way the exporter does. `va-ready` fires once fonts are in and the hand-drawn frames repainted
 * (what the exporter's settle() waits for).
 */
export async function partDocument(config, scheme, id, { theme = 'light', palette = null, reduce = false } = {}) {
  motionPaths(config, scheme, id);
  const { partPage, forgetBases } = await tooling(config, 'tooling/render/motion.mjs');
  forgetBases?.();
  const html = await partPage(scheme, id, theme === 'dark' ? 'dark' : 'light', { palette: palette || undefined });
  const head = reduce ? '<script src="/board/emulate.js?motion=reduce"></script>' : '';
  // requestAnimationFrame stops while the preview pane is hidden: every wait here also gives up after a moment
  const tail = `<script type="module">import * as H from '/_va/motion-harness.mjs';window.__vaHarness=H;const soon=(p,ms)=>Promise.race([p,new Promise((r)=>setTimeout(r,ms))]);await soon(document.fonts.ready,3000);if(window.Pomelo&&window.Pomelo.paint)window.Pomelo.paint(document.body);await soon(new Promise((r)=>requestAnimationFrame(()=>requestAnimationFrame(r))),80);window.__vaReady=true;window.dispatchEvent(new Event('va-ready'));</script>`;
  return html.replace(/<head[^>]*>/i, (m) => m + head).replace(/<\/body>/i, `${tail}</body>`);
}

// One headless browser for exports, the exporter's own launcher (--disable-gpu etc.), closed after a minute idle.
// Exports run one at a time.
let shared = null;
let idle = null;
let queue = Promise.resolve();
async function exportBrowser(config) {
  clearTimeout(idle);
  if (!shared) {
    // the repo's builds run with VA_BROWSER_CHANNEL=chrome (tooling/README.md); without either setting, use Chrome too
    if (!process.env.VA_CHROMIUM && !process.env.VA_BROWSER_CHANNEL) process.env.VA_BROWSER_CHANNEL = 'chrome';
    const { launchBrowser } = await tooling(config, 'tooling/lib/browser.mjs');
    shared = launchBrowser();
  }
  return shared;
}
function releaseBrowser() {
  clearTimeout(idle);
  idle = setTimeout(async () => {
    const b = shared;
    shared = null;
    if (b) (await b.catch(() => null))?.close().catch(() => {});
  }, 60000);
  idle.unref?.();
}
export async function closeExportBrowser() {
  clearTimeout(idle);
  const b = shared;
  shared = null;
  if (b) await (await b.catch(() => null))?.close().catch(() => {});
}

/**
 * Exports one part (or every part of the scheme when id is empty) with tooling's renderPart into
 * dist/<方案>/motion/<id>/ (config.distAbs moves dist/, for tests), the same files `npm run build:motion` writes.
 * Returns [{ id, theme, frames, gif, contact }] with byte counts.
 */
export function exportMotion(config, scheme, id = '', { out = null } = {}) {
  const run = async () => {
    const { renderPart, partList, forgetBases } = await tooling(config, 'tooling/render/motion.mjs');
    forgetBases?.();
    const parts = partList(scheme).filter((p) => !id || p.id === id);
    if (!parts.length) throw Object.assign(new Error(id ? `${scheme} 没有动效零件 ${id}` : `${scheme} 没有动效零件`), { code: 'not_found' });
    const browser = await exportBrowser(config);
    const rows = [];
    try {
      for (const p of parts) {
        const dest = out ? (id ? out : path.join(out, p.spec.id)) : motionPaths(config, scheme, p.spec.id).out;
        for (const r of await renderPart(browser, scheme, p.id, { out: dest })) rows.push({ id: p.id, theme: r.theme, frames: r.frames, gif: r.gif.length, contact: r.contact.length, out: dest });
      }
    } finally {
      releaseBrowser();
    }
    return rows;
  };
  const p = queue.then(run, run);
  queue = p.catch(() => {});
  return p;
}
