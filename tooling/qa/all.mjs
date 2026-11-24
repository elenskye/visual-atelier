// npm run all：构建和检查一条一条跑，和原来用 && 串起来一样，前一步没过就停，后面的标「没跑」。
// 每跑完一步（开始一步时也）把结果写进 dist/qa/run.json：哪一步、过没过、用时、最后几十行输出。bench 的「Checks」
// 一类看它（站主 2026-11-14 在 Phase 1 验收问卷里定：检查结果页放在菜单里，再加一类），各方案的检查明细在
// dist/<方案>/qa-report.json（qa/check.mjs 写），水印的在 dist/qa/watermark.json（qa/watermark.mjs 写）。
// 用法：npm run all（参数照传给每一步，比如 -- --scheme vermilion）。同一时间只跑一遍。
import path from 'node:path';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { ROOT, writeFile, isMain } from '../lib/common.mjs';

export const STEPS = [
  { id: 'build:tokens', title: '颜色、字号这些 token', script: 'tooling/tokens/build.mjs' },
  { id: 'build:handmade', title: '手画零件', script: 'tooling/handmade/build.mjs' },
  { id: 'build:handmade-marks', title: '手画零件做成的资产', script: 'tooling/handmade/marks.mjs' },
  { id: 'build:derived', title: '派生的资产', script: 'tooling/marks/derive.mjs' },
  { id: 'build:marks', title: '资产导出 PNG', script: 'tooling/render/marks.mjs' },
  { id: 'build:motion', title: '动效导出 GIF', script: 'tooling/render/motion.mjs' },
  { id: 'build:ds', title: 'Design System', script: 'tooling/design-system/build.mjs' },
  { id: 'build:atlas', title: 'Atlas 年度小报', script: 'tooling/atlas/build.mjs' },
  { id: 'build:catalog', title: '目录页', script: 'tooling/catalog/build.mjs' },
  { id: 'qa', title: '质量检查（资产、对比度、体积……）', script: 'tooling/qa/check.mjs' },
  { id: 'qa:watermark', title: '作品水印', script: 'tooling/qa/watermark.mjs' },
  { id: 'check:atlas', title: 'Atlas 和 Pomelo 里的一致', script: 'tooling/atlas/build.mjs', args: ['--check'] },
  { id: 'catalog', title: '目录页（带上检查结果）', script: 'tooling/catalog/build.mjs' }
];

export const runFile = (root = ROOT) => path.join(root, 'dist', 'qa', 'run.json');
const KEEP_LINES = 60;

/** Is a run going on now (its process still alive)? */
export function running(root = ROOT) {
  try {
    const r = JSON.parse(readFileSync(runFile(root), 'utf8'));
    if (r.status !== 'running' || !r.pid) return null;
    process.kill(r.pid, 0);
    return r;
  } catch {
    return null;
  }
}

function runStep(step, extra, onLine) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, step.script), ...(step.args || []), ...extra], { cwd: ROOT, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    const take = (chunk, err) => {
      (err ? process.stderr : process.stdout).write(chunk);
      buf += chunk.toString('utf8');
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const l of lines) onLine(l);
    };
    child.stdout.on('data', (c) => take(c, false));
    child.stderr.on('data', (c) => take(c, true));
    child.on('close', (code) => {
      if (buf) onLine(buf);
      resolve(code ?? 1);
    });
  });
}

export async function runAll(extra = []) {
  const busy = running();
  if (busy && busy.pid !== process.pid) throw new Error(`已经有一遍在跑（pid ${busy.pid}，${busy.startedAt} 开始）`);
  const run = { status: 'running', pid: process.pid, startedAt: new Date().toISOString(), finishedAt: null, args: extra, steps: STEPS.map((s) => ({ id: s.id, title: s.title, command: `node ${s.script}${s.args ? ` ${s.args.join(' ')}` : ''}`, status: 'waiting', ms: null, exitCode: null, log: [] })) };
  const save = () => writeFile(runFile(), JSON.stringify(run, null, 2) + '\n');
  save();
  let failed = false;
  for (const [i, step] of STEPS.entries()) {
    const row = run.steps[i];
    if (failed) {
      row.status = 'skipped';
      continue;
    }
    row.status = 'running';
    save();
    const t0 = Date.now();
    const code = await runStep(step, extra, (line) => {
      row.log.push(line.replace(/\u001b\[[0-9;]*m/g, ''));
      if (row.log.length > KEEP_LINES) row.log.shift();
    });
    row.ms = Date.now() - t0;
    row.exitCode = code;
    row.status = code === 0 ? 'pass' : 'fail';
    failed = code !== 0;
    save();
  }
  run.status = failed ? 'fail' : 'pass';
  run.finishedAt = new Date().toISOString();
  save();
  return run;
}

if (isMain(import.meta.url)) {
  runAll(process.argv.slice(2))
    .then((r) => {
      const bad = r.steps.find((s) => s.status === 'fail');
      console.log(bad ? `\nall  没过：${bad.id}（${bad.title}），后面的没跑。结果在 dist/qa/run.json，bench 的 Checks 里能看。` : '\nall  全过。结果在 dist/qa/run.json，bench 的 Checks 里能看。');
      if (bad) process.exitCode = 1;
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
