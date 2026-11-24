// 单向同步：按 Git tag 构建方案，把 schemes/<方案>/sync.json 登记的文件复制到消费方的约定目录（docs/adoption.md）。
//
// 用法：
//   npm run sync -- --scheme vermilion --to personal-website --tag vermilion-v1.0.0            构建并复制
//   npm run sync -- --scheme vermilion --to personal-website --tag vermilion-v1.0.0 --dry-run  只构建，列出要写的文件
//   npm run sync -- --scheme vermilion --to personal-website --check                           核对消费方的副本没被手改
//   npm run sync -- --scheme vermilion --to personal-website --check --tag vermilion-v1.0.0    另外与该 tag 的构建逐字节比较
//
// 规则：
//   - 只同步 tag，不同步工作区；tag 名必须是「<方案>-v<该 tag 里 scheme.json 的 version>」。
//   - tag 用 git archive 导出到临时目录再构建，工作区里没提交的改动不会混进去。发版构建只在 Mac 上做。
//   - 只同步 approved 的资产与动效零件。清单里写了 from 的是另一个方案的资产（src 相对那个方案的目录），照那个方案的清单看状态。
//   - 目标目录整个归同步管：复制前先按现有 SHA256SUMS 核对没被手改（--force 跳过），旧文件按清单删除；
//     不碰消费方的其他文件。目录里另写 VERSION、README.md 与 SHA256SUMS（覆盖其余所有文件）。
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { ROOT, parseArgs, readJson, readText, motionParts, expandHome, sha256, walk, writeFile, log, isMain } from '../lib/common.mjs';

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const IGNORED = new Set(['.DS_Store']);

function consumerOf(scheme, name) {
  const spec = readJson(path.join(ROOT, 'schemes', scheme, 'sync.json'));
  const c = spec.consumers[name];
  if (!c) throw new Error(`schemes/${scheme}/sync.json 没有登记消费方 ${name}`);
  const root = path.resolve(expandHome(c.root));
  const target = path.resolve(root, c.dir);
  if (!target.startsWith(root + path.sep)) throw new Error(`同步目录 ${c.dir} 不在 ${root} 里面`);
  if (!existsSync(root)) throw new Error(`找不到消费方仓库 ${root}`);
  return { ...c, root, target };
}

/** 按目标目录里的 SHA256SUMS 核对：缺少、被改、多出的文件都算问题。 */
export function verifyTarget(target) {
  const sumsPath = path.join(target, 'SHA256SUMS');
  const present = walk(target).map((p) => path.relative(target, p)).filter((rel) => !IGNORED.has(path.basename(rel)));
  if (!existsSync(sumsPath)) return { listed: [], problems: present.length ? ['目标目录里有文件，但没有 SHA256SUMS'] : [] };
  const listed = readText(sumsPath).trim().split('\n').filter(Boolean).map((line) => {
    const i = line.indexOf('  ');
    return { hash: line.slice(0, i), rel: line.slice(i + 2) };
  });
  const problems = [];
  for (const { hash, rel } of listed) {
    const p = path.join(target, rel);
    if (!existsSync(p)) problems.push(`缺少 ${rel}`);
    else if (sha256(readFileSync(p)) !== hash) problems.push(`${rel} 与 SHA256SUMS 不一致（被手改过？）`);
  }
  const known = new Set([...listed.map((x) => x.rel), 'SHA256SUMS']);
  for (const rel of present) if (!known.has(rel)) problems.push(`多出 ${rel}`);
  return { listed, problems };
}

/** 同步的每个文件都要来自 approved 的资产或动效零件。 */
function unapproved(sdir, files) {
  const manifest = readJson(path.join(sdir, 'marks', 'manifest.json'));
  // 属于方案本身的文件跟着 scheme.json 的状态
  const ofScheme = (rel) => ({ status: readJson(path.join(sdir, 'scheme.json')).status, what: `${path.basename(sdir)} 方案（${rel}）` });
  const bad = [];
  for (const f of files) {
    let status, what;
    if (f.from) {
      // 另一个方案的资产（Pomelo 的「呦呦漫游」用 Vermilion 的内容图标清单，DESIGN.md 写明的唯一例外）：照那个方案的清单
      const other = readJson(path.join(sdir, '..', f.from, 'marks', 'manifest.json'));
      const a = other.assets.find((x) => `marks/${x.file}` === f.src);
      status = a?.status; what = `${f.from} 的 ${a?.id ?? f.src}`;
    } else if (f.src?.startsWith('marks/')) {
      const a = manifest.assets.find((x) => `marks/${x.file}` === f.src);
      status = a?.status; what = a?.id ?? f.src;
    } else if (f.src?.startsWith('motion/') && f.src.split('/').length === 2) {
      // 零件共用的文件（例如 motion/visit-once.js）：引用它的零件都要是 approved
      const users = motionParts(sdir).map((p) => p.spec).filter((spec) => spec.files.js && path.posix.join('motion', spec.id, spec.files.js) === f.src);
      status = users.length && users.every((spec) => spec.status === 'approved') ? 'approved' : users.length ? 'proposed' : undefined;
      what = f.src;
    } else if (f.src?.startsWith('motion/')) {
      const part = f.src.split('/')[1];
      status = readJson(path.join(sdir, 'motion', part, 'motion.json')).status; what = part;
    } else if (f.tool) {
      // 工具里的生成模块（例如分享图的 og-card/card.mjs）：跟着它服务的资产走
      status = manifest.assets.find((x) => x.id === f.asset)?.status; what = f.asset ?? f.tool;
    } else if (f.dist?.startsWith('marks/png/')) {
      const id = path.basename(f.dist).split('@')[0];
      status = manifest.assets.find((x) => x.id === id)?.status; what = id;
    } else if (f.dist?.startsWith('tokens/') || f.dist?.startsWith('design-system/project/') || f.dist === 'design-system/consumer.css') {
      // token 方言、手画零件的画法、Design System 的产物（样式、字体；consumer.css 里的动效只放 approved 的零件）属于方案本身
      ({ status, what } = ofScheme(f.dist));
    } else if (f.src && !f.src.split('/').includes('..') && (/^[^/]+\.md$/.test(f.src) || f.src.startsWith('type/') || f.src.startsWith('atlas/releases/'))) {
      // 方案自己的说明（DESIGN.md、规则）、随方案发的字体文件（type/ 下；Peck 的云端开发看不到本仓库，2026-11-10）、
      // Atlas 的设计快照（冻结以后不改，tooling/atlas/build.mjs；站主定稿才冻结）：也属于方案本身
      ({ status, what } = ofScheme(f.src));
    } else {
      throw new Error(`不认识的同步来源：${JSON.stringify(f)}`);
    }
    if (status !== 'approved') bad.push(`${what}（${status ?? '清单里没有'}）`);
  }
  return [...new Set(bad)];
}

/** 把 tag 导出到临时目录、构建，返回要写进目标目录的全部文件（不写盘）。 */
export function buildAtTag(scheme, tag, consumer) {
  if (process.platform !== 'darwin') throw new Error('发版构建只在 Mac 上做（其他平台的渲染有抗锯齿差）');
  if (!/^[A-Za-z0-9._-]+$/.test(tag)) throw new Error(`tag 名不合规：${tag}`);
  try { git('rev-parse', '--verify', '--quiet', `refs/tags/${tag}`); } catch { throw new Error(`本仓库没有 tag ${tag}`); }
  const commit = git('rev-list', '-n', '1', tag);
  const tmp = mkdtempSync(path.join(os.tmpdir(), `va-sync-${scheme}-`));
  try {
    const tar = execFileSync('git', ['archive', '--format=tar', tag], { cwd: ROOT, maxBuffer: 1 << 30 });
    execFileSync('tar', ['-x', '-C', tmp], { input: tar });
    const sdir = path.join(tmp, 'schemes', scheme);
    const { version } = readJson(path.join(sdir, 'scheme.json'));
    if (tag !== `${scheme}-v${version}`) throw new Error(`tag ${tag} 与该 tag 里 scheme.json 的版本 ${version} 对不上（应为 ${scheme}-v${version}）`);
    const files = readJson(path.join(sdir, 'sync.json')).consumers[consumer.name].files;
    const bad = unapproved(sdir, files);
    if (bad.length) throw new Error(`这些还不是 approved，不能同步：${bad.join('、')}`);

    // 依赖与工作区相同时直接借用 node_modules，否则在临时目录里按 lock 安装
    const sameLock = readText(path.join(tmp, 'package-lock.json')) === readText(path.join(ROOT, 'package-lock.json'));
    if (sameLock) symlinkSync(path.join(ROOT, 'node_modules'), path.join(tmp, 'node_modules'), 'dir');
    else execFileSync('npm', ['ci', '--ignore-scripts'], { cwd: tmp, stdio: 'inherit' });
    const node = (script, ...a) => execFileSync(process.execPath, [script, '--scheme', scheme, ...a], { cwd: tmp, stdio: ['ignore', 'ignore', 'inherit'] });
    // tag 里的源文件必须与生成器一致；再构建要用到的产物
    if (existsSync(path.join(sdir, 'tokens', 'graphic.json'))) node('tooling/graphic/build.mjs', '--check');
    if (existsSync(path.join(sdir, 'marks', 'derived.json'))) node('tooling/marks/derive.mjs', '--check');
    if (existsSync(path.join(sdir, 'marks', 'art.mjs'))) node('tooling/handmade/marks.mjs', '--check');
    if (files.some((f) => f.dist)) { node('tooling/tokens/build.mjs'); node('tooling/render/marks.mjs'); }
    if (files.some((f) => f.dist?.startsWith('design-system/'))) node('tooling/design-system/build.mjs');

    const out = new Map();
    for (const f of files) out.set(f.to, readFileSync(f.tool ? path.join(tmp, 'tooling', f.tool) : f.from ? path.join(tmp, 'schemes', f.from, f.src) : f.src ? path.join(sdir, f.src) : path.join(tmp, 'dist', scheme, f.dist)));
    out.set('VERSION', Buffer.from(`scheme: ${scheme}\nversion: ${version}\ntag: ${tag}\ncommit: ${commit}\n`));
    out.set('README.md', Buffer.from([
      `# ${scheme}`,
      '',
      `这个目录里的文件由 visual-atelier 仓库的 \`tooling/sync/sync.mjs\` 按 tag \`${tag}\` 复制而来，是已发版本的副本。`,
      '',
      '- 单向同步，**不要在这里手改**。要改，回 visual-atelier 改、发版，再重新同步。',
      '- `VERSION` 记版本与提交，`SHA256SUMS` 记每个文件的校验和，下次同步前会先核对。',
      '',
    ].join('\n')));
    const sums = [...out.keys()].sort().map((rel) => `${sha256(out.get(rel))}  ${rel}`).join('\n') + '\n';
    out.set('SHA256SUMS', Buffer.from(sums));
    return { version, commit, out };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

export function runSync(args = parseArgs()) {
  const scheme = args.scheme, to = args.to;
  if (typeof scheme !== 'string' || typeof to !== 'string') throw new Error('用法：npm run sync -- --scheme <方案> --to <消费方> (--tag <tag> | --check)');
  const consumer = { name: to, ...consumerOf(scheme, to) };
  const rel = path.relative(consumer.root, consumer.target);
  const { problems } = verifyTarget(consumer.target);

  if (args.check) {
    const extra = [];
    if (typeof args.tag === 'string') {
      const { out } = buildAtTag(scheme, args.tag, consumer);
      for (const [f, buf] of out) {
        const p = path.join(consumer.target, f);
        if (!existsSync(p) || !readFileSync(p).equals(buf)) extra.push(`${f} 与 ${args.tag} 的构建不同`);
      }
    }
    const all = [...problems, ...extra];
    log(`sync check ${scheme} → ${to}:${rel}：${all.length ? `${all.length} 个问题\n  - ${all.join('\n  - ')}` : '一致'}`);
    if (all.length) process.exitCode = 1;
    return { problems: all };
  }

  if (typeof args.tag !== 'string') throw new Error('同步需要 --tag：只同步已发版本');
  if (problems.length && !args.force) throw new Error(`目标目录 ${rel} 与上次同步的记录不一致，先查明再同步（或加 --force）：\n  - ${problems.join('\n  - ')}`);
  const { version, commit, out } = buildAtTag(scheme, args.tag, consumer);
  const old = existsSync(consumer.target) ? walk(consumer.target).map((p) => path.relative(consumer.target, p)) : [];
  const removed = old.filter((f) => !out.has(f) && !IGNORED.has(path.basename(f)));
  const changed = [...out.keys()].filter((f) => { const p = path.join(consumer.target, f); return !existsSync(p) || !readFileSync(p).equals(out.get(f)); });
  if (!args['dry-run']) {
    for (const f of removed) rmSync(path.join(consumer.target, f));
    // 删完空下来的文件夹也收掉（比如 Atlas 换掉的旧快照 atlas/tabloid-1.0.1/），只收目标目录里面的、真空的
    for (const dir of [...new Set(removed.map((f) => path.dirname(f)))].sort((a, b) => b.length - a.length)) {
      for (let d = dir; d && d !== '.'; d = path.dirname(d)) {
        const p = path.join(consumer.target, d);
        if (!existsSync(p) || readdirSync(p).some((n) => !IGNORED.has(n))) break;
        rmSync(p, { recursive: true });
      }
    }
    for (const f of changed) writeFile(path.join(consumer.target, f), out.get(f));
  }
  const verb = args['dry-run'] ? '将' : '已';
  log(`sync ${scheme} ${version}（${commit.slice(0, 7)}）→ ${to}:${rel}：${out.size} 个文件，${verb}写入 ${changed.length} 个${removed.length ? `，${verb}删除 ${removed.length} 个：${removed.join('、')}` : ''}`);
  for (const f of changed) log(`  ${f}`);
  return { changed, removed };
}

if (isMain(import.meta.url)) {
  try { runSync(); } catch (e) { console.error(e.message); process.exit(1); }
}
