import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { readJsonFile } from '../utils/config.js';

// 检查结果（Phase 2 B4，站主 2026-11-14 定在菜单里再加一类「Checks」）：npm run all 的结果。
// 跑的是 tooling/qa/all.mjs，它每跑一步把结果写进 dist/qa/run.json；各方案的检查明细在 dist/<方案>/qa-report.json，
// 水印的在 dist/qa/watermark.json。界面上「跑一遍」也是启动它（自己一个进程，bench 停了它照样跑完），bench 每秒看一次
// run.json 有没有变，变了就告诉界面。

const distOf = (config) => path.join(config.repoAbs, 'dist');
const runPath = (config) => path.join(distOf(config), 'qa', 'run.json');

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** The last run (status "stopped" when it says running but its process is gone). */
function readRun(config) {
  const run = readJsonFile(runPath(config), null);
  if (run?.status === 'running' && !alive(run.pid)) return { ...run, status: 'stopped' };
  return run;
}

/** Everything the Checks page shows. */
export function readChecks(config) {
  const dist = distOf(config);
  const schemes = fs.existsSync(dist)
    ? fs
        .readdirSync(dist)
        .filter((d) => fs.existsSync(path.join(dist, d, 'qa-report.json')))
        .sort()
        .map((d) => {
          const r = readJsonFile(path.join(dist, d, 'qa-report.json'), {});
          let at = null;
          try {
            at = fs.statSync(path.join(dist, d, 'qa-report.json')).mtime.toISOString();
          } catch {}
          return { scheme: d, at, items: r.items || [] };
        })
    : [];
  return { run: readRun(config), schemes, watermark: readJsonFile(path.join(dist, 'qa', 'watermark.json'), null) };
}

/** One line for the menu. */
export function checksSub(config) {
  const run = readRun(config);
  if (!run) return '还没跑过：npm run all';
  const when = (iso) => {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getMonth() + 1}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  if (run.status === 'running') return `正在跑：${run.steps.find((s) => s.status === 'running')?.id || '…'}`;
  if (run.status === 'stopped') return `上次没跑完 · ${when(run.startedAt)}`;
  const fails = readChecks(config).schemes.reduce((a, s) => a + s.items.filter((i) => i.status === 'fail').length, 0);
  if (run.status === 'pass') return `全过 · ${when(run.finishedAt)}`;
  const bad = run.steps.find((s) => s.status === 'fail');
  return `没过：${bad?.id || '?'}${fails ? `，${fails} 项` : ''} · ${when(run.finishedAt || run.startedAt)}`;
}

let watcher = null;
/**
 * Starts `npm run all` (tooling/qa/all.mjs) on its own; `onUpdate` is called whenever run.json changes until it ends.
 * Throws when a run is going already.
 */
export function startChecks(config, onUpdate) {
  const now = readRun(config);
  if (now?.status === 'running') {
    const err = new Error(`已经有一遍在跑（${now.steps.find((s) => s.status === 'running')?.id || '…'}）`);
    err.code = 'already_exists';
    throw err;
  }
  const env = { ...process.env };
  if (!env.VA_CHROMIUM && !env.VA_BROWSER_CHANNEL) env.VA_BROWSER_CHANNEL = 'chrome';
  const child = spawn(process.execPath, [path.join(config.repoAbs, 'tooling', 'qa', 'all.mjs')], { cwd: config.repoAbs, env, detached: true, stdio: 'ignore' });
  child.unref();
  watchRun(config, onUpdate);
  return { pid: child.pid };
}

/** Tells `onUpdate` each time run.json changes while a run is going (polls once a second). */
export function watchRun(config, onUpdate) {
  clearInterval(watcher);
  let last = 0;
  let quiet = 0;
  watcher = setInterval(() => {
    let m = 0;
    try {
      m = fs.statSync(runPath(config)).mtimeMs;
    } catch {}
    if (m !== last) {
      last = m;
      quiet = 0;
      onUpdate();
    }
    const run = readRun(config);
    // wait a few seconds for the new run to write its first run.json, then stop once it is over
    if (run?.status !== 'running' && ++quiet > 5) {
      clearInterval(watcher);
      watcher = null;
      onUpdate();
    }
  }, 1000);
  watcher.unref?.();
}

export const stopWatching = () => {
  clearInterval(watcher);
  watcher = null;
};
