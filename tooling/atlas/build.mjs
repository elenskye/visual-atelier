// Atlas 的设计（schemes/<方案>/atlas/<设计>/）打成一个文件，和冻结成快照。
//
//   node tooling/atlas/build.mjs                    打包每份设计 → dist/<方案>/atlas/<设计>/design.js
//   node tooling/atlas/build.mjs --freeze tabloid   把这份设计现在的样子冻结成 schemes/<方案>/atlas/releases/<设计>-<版本>/，
//                                                   替掉同一条线（前两位一样）里旧的那份
//   node tooling/atlas/build.mjs --check            核对每份快照没被改过、一条线只有一份；版本和源一样的快照，还要和现在打出来的逐字节一样
//
// 一份设计 = 一个文件夹：design.json（id、名字、版本、要打包的模块）和它的模块。打出来是一个 ES 模块，
// 导出 design = { id, name, version, css, mount(host, 呈现结果, opts), envelope(年), frame() }，画好的柚子、贴纸、信封，
// 连同当时的 Design System 样式（dist/<方案>/design-system/consumer.css）和上墨的脚本（bundle.js）都在里面，不再读别的文件：
// 所以先 npm run build:ds。frame() 是放它的那个 frame 的文档。
// 快照定了就不改（站主 2026-11-10：每次设计定稿都要有快照）：要改，改源、升版本、再冻结一份。
// 哪些算定稿（站主 2026-11-11）：只升最后一位是小修，新的一份替掉同一条线里旧的（1.0.0 → 1.0.1，留下的只有 1.0.1，
// 照 1.0.0 做的年度总结改照 1.0.1 画）；升了前两位是新的定稿，两份都留着（1.0.3 → 1.1.0，两份都在）。
// 打包不经过第三方打包器：和 tooling/design-system/bundle.mjs 一样把模块原样拼起来（顶层名字不能重复）。
import path from 'node:path';
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { ROOT, parseArgs, readJson, sha256, writeFile, log, isMain } from '../lib/common.mjs';
import { joinModules } from '../design-system/bundle.mjs';

const SCHEME = 'pomelo';
const atlasDir = (scheme = SCHEME) => path.join(ROOT, 'schemes', scheme, 'atlas');
export const designsOf = (scheme = SCHEME) => readdirSync(atlasDir(scheme)).filter((d) => existsSync(path.join(atlasDir(scheme), d, 'design.json')));

/** 画好的 SVG：柚子的脸、模块贴纸、界面小图标、信封（动效零件 atlas-envelope 的那个按钮）。 */
export async function loadAssets(scheme, id) {
  const sdir = path.join(ROOT, 'schemes', scheme), ddir = path.join(atlasDir(scheme), id);
  const { ASSET_LIST } = await import(pathToFileURL(path.join(ddir, 'kit.mjs')).href);
  const { MARKS } = await import(pathToFileURL(path.join(ddir, 'pages.mjs')).href);
  const read = (rel) => readFileSync(path.join(sdir, rel), 'utf8').trim();
  const env = read('motion/atlas-envelope/atlas-envelope.fragment.html');
  return {
    faces: Object.fromEntries(ASSET_LIST.faces.map((n) => [n, read(`marks/pomelo/pomelo-${n}.svg`)])),
    marks: Object.fromEntries(MARKS.map((n) => [n, read(`marks/modules/${n}.svg`)])),
    icons: Object.fromEntries(ASSET_LIST.icons.map((n) => [n, read(`marks/icons/${n}.svg`)])),
    envelope: env.slice(env.indexOf('<button'), env.indexOf('</button>') + 9),
  };
}

/** 打成一个 ES 模块（文本）。 */
export async function bundleDesign(scheme, id) {
  const ddir = path.join(atlasDir(scheme), id);
  const meta = readJson(path.join(ddir, 'design.json'));
  if (meta.id !== id) throw new Error(`${id}/design.json 的 id 是 ${meta.id}`);
  if (!/^\d+\.\d+\.\d+$/.test(meta.version)) throw new Error(`${id}：版本要写成 1.0.0 这样`);
  const { parts, names } = joinModules(meta.modules.map((m) => {
    const file = path.resolve(ddir, m);
    // import 的路径只留文件名：打包以后都在一个作用域里
    const text = readFileSync(file, 'utf8').replace(/^(import\s*\{[^}]*\}\s*from\s*')(?:\.{1,2}\/)+(?:[\w.-]+\/)*([\w.-]+\.mjs';\s*)$/gm, "$1./$2");
    return { rel: path.relative(ROOT, file), text };
  }));
  const assets = await loadAssets(scheme, id);
  const dsDir = path.join(ROOT, 'dist', scheme, 'design-system');
  if (!existsSync(path.join(dsDir, 'consumer.css'))) throw new Error(`没有 dist/${scheme}/design-system/consumer.css：先 npm run build:ds`);
  const ds = readFileSync(path.join(dsDir, 'consumer.css'), 'utf8'), painter = readFileSync(path.join(dsDir, 'project/components/bundle.js'), 'utf8');
  if (/<\/script/i.test(painter) || /<\/style/i.test(ds)) throw new Error('Design System 的样式或脚本里有 </script、</style，放不进 frame');
  const head = { id: meta.id, name: meta.name, version: meta.version };
  return [
    `/* Atlas 的设计「${meta.name}」${meta.version}（方案 ${scheme}）。由 tooling/atlas/build.mjs 把 ${[...names].join('、')} 原样打包，不要手改。 */`,
    ...parts,
    `const ASSETS = ${JSON.stringify(assets)};`,
    `const DS = ${JSON.stringify(ds)};`,
    `const PAINTER = ${JSON.stringify(painter)};`,
    // cover（1.0.2 起有）：Atlas 页上一年一张的封面，印着这一版的名字和版本号
    `export const design = { ...${JSON.stringify(head)}, css: ${meta.css}, mount: (host, raw, opts = {}) => ${meta.mount}(host, raw, { ...opts, assets: ASSETS }), envelope: (year) => ${meta.envelope}(ASSETS, year), frame: () => ${meta.frame}(DS, PAINTER)${meta.cover ? `, cover: (o = {}) => ${meta.cover}(ASSETS, { ...o, name: ${JSON.stringify(meta.name)}, version: ${JSON.stringify(meta.version)} })` : ''} };`,
    'export default design;',
    '',
  ].join('\n');
}

const releaseDir = (scheme, id, version) => path.join(atlasDir(scheme), 'releases', `${id}-${version}`);
const semver = (v) => v.split('.').map(Number);
/** 冻结过的快照：[{ dir（文件夹名）, id, version, … design.json 里的 }] */
function releases(scheme) {
  const rdir = path.join(atlasDir(scheme), 'releases');
  return (existsSync(rdir) ? readdirSync(rdir) : []).filter((n) => existsSync(path.join(rdir, n, 'design.json'))).map((dir) => ({ ...readJson(path.join(rdir, dir, 'design.json')), dir }));
}
/** 同一条线：同一份设计、版本前两位一样。 */
const sameLine = (a, b) => a.id === b.id && semver(a.version).slice(0, 2).join('.') === semver(b.version).slice(0, 2).join('.');

export async function freeze(scheme, id) {
  const meta = readJson(path.join(atlasDir(scheme), id, 'design.json'));
  const code = await bundleDesign(scheme, id);
  const dir = releaseDir(scheme, id, meta.version);
  const file = path.join(dir, 'design.js');
  if (existsSync(file)) {
    if (readFileSync(file, 'utf8') === code) return log(`${id} ${meta.version} 已经冻结过，和现在的一样`);
    throw new Error(`${id} ${meta.version} 已经冻结过，源又改了：快照不改，升 design.json 的版本再冻结一份`);
  }
  // 同一条线里旧的小修版被这一份替掉；这条线里已经有更新的，就是版本写错了
  const line = releases(scheme).filter((r) => sameLine(r, meta));
  const newer = line.find((r) => semver(r.version)[2] >= semver(meta.version)[2]);
  if (newer) throw new Error(`${id} 这条线里已经有 ${newer.version}，${meta.version} 不比它新`);
  writeFile(file, code);
  writeFile(path.join(dir, 'design.json'), JSON.stringify({ id: meta.id, name: meta.name, version: meta.version, frozen: meta.frozen || null, sha256: sha256(code), note: meta.note || '' }, null, 2) + '\n');
  for (const old of line) rmSync(path.join(atlasDir(scheme), 'releases', old.dir), { recursive: true, force: true });
  log(`冻结了 ${path.relative(ROOT, dir)}（${(code.length / 1024).toFixed(0)} KB）${line.length ? `，替掉了 ${line.map((r) => r.version).join('、')}` : ''}`);
}

export async function check(scheme = SCHEME) {
  const problems = [];
  const all = releases(scheme);
  for (const r of all) {
    const twin = all.find((o) => o !== r && sameLine(o, r) && semver(o.version)[2] > semver(r.version)[2]);
    if (twin) problems.push(`${r.dir}：同一条线里有更新的 ${twin.version}，小修以后旧的不算定稿，该删掉（--freeze 会替掉它）`);
  }
  // 设计自己的那一部分要和源一样；带进去的 Design System 样式和上墨脚本是冻结那天的，方案往前走了也不算改
  const own = (text) => text.slice(0, text.indexOf('\nconst DS = '));
  for (const r of all) {
    const code = readFileSync(path.join(atlasDir(scheme), 'releases', r.dir, 'design.js'), 'utf8');
    if (r.dir !== `${r.id}-${r.version}`) problems.push(`${r.dir}：文件夹名和 design.json 对不上`);
    if (sha256(code) !== r.sha256) problems.push(`${r.dir}：design.js 和记下的校验和不一样（快照被改过？）`);
    const src = path.join(atlasDir(scheme), r.id, 'design.json');
    if (existsSync(src) && readJson(src).version === r.version && own(await bundleDesign(scheme, r.id)) !== own(code)) problems.push(`${r.dir}：源改了但版本没升（快照不改：升版本再冻结一份）`);
  }
  return problems;
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const scheme = args.scheme || SCHEME;
  if (args.check) {
    const problems = await check(scheme);
    if (problems.length) { for (const p of problems) console.error('✗ ' + p); process.exit(1); }
    log('Atlas 的快照都对');
  } else if (args.freeze) {
    await freeze(scheme, args.freeze === true ? designsOf(scheme)[0] : args.freeze);
  } else {
    for (const id of designsOf(scheme)) {
      const code = await bundleDesign(scheme, id);
      writeFile(path.join(ROOT, 'dist', scheme, 'atlas', id, 'design.js'), code);
      log(`dist/${scheme}/atlas/${id}/design.js  ${(code.length / 1024).toFixed(0)} KB`);
    }
  }
}
