import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** bench/: the engine's code (command line, preview server, board UI, runtime copy). */
export const BENCH_ROOT = path.resolve(__dirname, '..', '..');
/** The repository root: schemes/, tooling/, canvases/, dist/ and node_modules/ live here. */
export const REPO_ROOT = path.resolve(BENCH_ROOT, '..');

const DEFAULTS = {
  canvasesDir: '../canvases',
  claudeBridgeDir: './bridges/claude',
  runtime: './vendor/claude-design/dc-runtime.js',
  server: { port: 4321 },
  browser: { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }
};

/**
 * Loads `config.json` from bench/. `rootDir`, `canvasesDir` and `repoAbs` can be overridden
 * (tests use a temp root and a fake repo). Env: `DW_CANVASES` points at another canvases folder.
 */
export function loadConfig(overrides = {}) {
  const rootDir = overrides.rootDir || BENCH_ROOT;
  let user = {};
  const configPath = path.join(rootDir, 'config.json');
  if (fs.existsSync(configPath)) {
    user = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  const merged = {
    ...DEFAULTS,
    ...user,
    ...overrides,
    server: { ...DEFAULTS.server, ...(user.server || {}), ...(overrides.server || {}) },
    browser: { ...DEFAULTS.browser, ...(user.browser || {}) }
  };
  const canvasesAbs = process.env.DW_CANVASES && !overrides.canvasesDir
    ? path.resolve(process.env.DW_CANVASES)
    : path.resolve(rootDir, merged.canvasesDir);
  // schemes, tooling, the Design System builds and the npm packages all come from this repository
  const repoAbs = path.resolve(overrides.repoAbs || REPO_ROOT);
  return {
    ...merged,
    rootDir,
    canvasesAbs,
    repoAbs,
    // code-side files always come from this checkout, whatever rootDir holds the data
    claudeBridgeAbs: path.resolve(BENCH_ROOT, merged.claudeBridgeDir),
    // 断网也能看：从 CDN 取来的 React、字体存在这里（server/offline.js），不进 Git
    cacheAbs: path.resolve(overrides.cacheAbs || path.join(BENCH_ROOT, '.cache')),
    runtimeAbs: path.resolve(overrides.runtimeAbs || path.resolve(BENCH_ROOT, merged.runtime))
  };
}

export function readJsonFile(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJsonFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function sha256File(filePath) {
  return sha256(fs.readFileSync(filePath));
}

/** Kebab-case ASCII slug; Chinese and other characters are dropped. */
export function slugify(input, fallback = 'untitled') {
  if (!input || typeof input !== 'string') return fallback;
  const cleaned = input
    .toLowerCase()
    .replace(/\.dc\.html$|\.html?$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

/** Local timestamp `YYYYMMDD-HHMMSS`. */
export function stamp(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
}
