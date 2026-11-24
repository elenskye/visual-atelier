// 画布和生成器对得上吗（站主 2026-11-24 定，npm run all 的一步）：把工作区复制到一个临时目录，在那里把每块画布的
// 生成器按顺序跑一遍，再和真的 canvases/ 逐个文件比。对不上就列出哪几个文件，真的画布一个字节都不动。
// 板旧了（方案改了、板没重生成）或者板被手改了、生成器没跟上，都会在这里报出来；要怎么处理见 canvases/README.md。
// canvas.json 只比内容：键的先后、order 的先后不算（生成器写的时候会挪）。
// 用法：npm run check:canvases [-- --canvas pomelo-explore] [--keep]（--keep 留下临时目录看差在哪）
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, readlinkSync, rmSync, existsSync, lstatSync, symlinkSync } from 'node:fs';
import { ROOT, walk, parseArgs, isMain } from '../lib/common.mjs';

// 每块画布的生成器，按这个顺序跑（各画布的 README.md「生成」写着为什么）。冻结的生成器（一跑就停的）不列。
// Vermilion Explore 没有板的生成器（图片由 rebuild-blobs.mjs 对着云端核对，它自己会报对不上）。
export const GENERATORS = {
  'pith-explore': [{ script: 'canvases/pith-explore/src/build.mjs' }],
  'pomelo-explore': ['atlas', 'frame', 'icons', 'links', 'marks', 'motion', 'notes', 'scenes'].map((p) => ({ script: `canvases/pomelo-explore/${p}/gen.mjs` })),
  'peck-explore': ['s1', 's1b', 's1c', 's2d', 's3', 's4'].map((s) => ({ script: 'gen.mjs', cwd: `canvases/peck-explore/project/src/${s}` }))
};

// 只在本机、不进 Git 的东西不比
const SKIP = new Set(['.shots', '.versions', '.trash', '.stage', '.ds', 'preview']);

function copyWorkTree(dest) {
  const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(Boolean);
  for (const f of files) {
    const src = path.join(ROOT, f);
    if (!existsSync(src)) continue; // 删了还没提交的
    const to = path.join(dest, f);
    const st = lstatSync(src);
    if (st.isDirectory()) continue; // 没提交的嵌套仓库（比如 .claude/worktrees/ 里的 worktree），不是画布要的
    if (st.isSymbolicLink()) {
      mkdirSync(path.dirname(to), { recursive: true });
      symlinkSync(readlinkSync(src), to);
    } else cpSync(src, to);
  }
  // 依赖只读，链过去；构建产物复制一份，免得哪个生成器写进真的 dist/
  symlinkSync(path.join(ROOT, 'node_modules'), path.join(dest, 'node_modules'));
  if (existsSync(path.join(ROOT, 'dist'))) cpSync(path.join(ROOT, 'dist'), path.join(dest, 'dist'), { recursive: true });
}

const filesOf = (dir) => (existsSync(dir) ? walk(dir) : [])
  .map((p) => path.relative(dir, p))
  .filter((rel) => !rel.split(path.sep).some((part) => SKIP.has(part)) && path.basename(rel) !== '.DS_Store');

/** canvas.json 按内容比：对象不管键的先后，order 不管先后。 */
function sameCanvas(a, b) {
  const norm = (v, key) => {
    if (Array.isArray(v)) return key === 'order' ? [...v].sort() : v.map((x) => norm(x));
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k], k)]));
    return v;
  };
  return JSON.stringify(norm(JSON.parse(a))) === JSON.stringify(norm(JSON.parse(b)));
}

export function checkCanvases({ canvas, keep = false } = {}) {
  const names = canvas ? [canvas] : Object.keys(GENERATORS);
  for (const n of names) if (!GENERATORS[n]) throw new Error(`没登记的画布：${n}（登记在 tooling/qa/canvases.mjs 的 GENERATORS）`);
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'va-canvases-'));
  const problems = [];
  try {
    copyWorkTree(tmp);
    for (const name of names) {
      for (const g of GENERATORS[name]) {
        const cwd = path.join(tmp, g.cwd ?? '');
        const r = spawnSync(process.execPath, [path.join(cwd, g.script)], { cwd, env: { ...process.env, VA_ROOT: tmp }, encoding: 'utf8' });
        if (r.status !== 0) {
          problems.push(`${name}：${path.join(g.cwd ?? '', g.script)} 跑失败（退出码 ${r.status}）\n    ${(r.stderr || r.stdout).trim().split('\n').slice(-3).join('\n    ')}`);
        }
      }
      const real = path.join(ROOT, 'canvases', name);
      const fresh = path.join(tmp, 'canvases', name);
      const a = new Set(filesOf(real));
      const b = new Set(filesOf(fresh));
      for (const f of [...new Set([...a, ...b])].sort()) {
        if (!a.has(f)) { problems.push(`${name}：生成器多写了 ${f}`); continue; }
        if (!b.has(f)) { problems.push(`${name}：生成器没写 ${f}（删了或手加的）`); continue; }
        const x = readFileSync(path.join(real, f));
        const y = readFileSync(path.join(fresh, f));
        if (x.equals(y)) continue;
        if (path.basename(f) === 'canvas.json' && sameCanvas(x.toString('utf8'), y.toString('utf8'))) continue;
        problems.push(`${name}：${f} 和生成器写的不一样`);
      }
    }
  } finally {
    if (keep) console.log(`临时目录留着：${tmp}`);
    else rmSync(tmp, { recursive: true, force: true });
  }
  return { names, problems };
}

if (isMain(import.meta.url)) {
  const args = parseArgs();
  const { names, problems } = checkCanvases({ canvas: typeof args.canvas === 'string' ? args.canvas : null, keep: Boolean(args.keep) });
  if (problems.length) {
    console.error(`canvases  ${problems.length} 处对不上：\n  - ${problems.join('\n  - ')}`);
    console.error('板旧了就重跑那一页的生成器（先在副本里比），板被手改过就先把改动写进生成器（canvases/README.md）。');
    process.exitCode = 1;
  } else {
    console.log(`canvases  ${names.join('、')}：生成器重跑和画布逐个文件一样`);
  }
}
