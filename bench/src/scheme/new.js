// dw scheme new：从 schemes/_template/ 起一套新方案（v1.0 Phase 5）。
// 复制模板、填名字（{{name}}、{{title}}、{{Name}}），再照 tooling 跑一遍：token 构建、质量检查、Design System 构建。
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const SCHEME_NAME = /^[a-z][a-z0-9-]{1,30}$/;
const TEXT = /\.(json|md|css|html|mjs|js|txt)$/;

/** 方案名 → Design System 的命名空间（JS 标识符）：pith → Pith，my-scheme → MyScheme。 */
export const namespaceOf = (name) => name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

function copyTree(from, to, files, root) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (e.name === '.DS_Store') continue;
    const src = path.join(from, e.name);
    const dst = path.join(to, e.name);
    if (e.isSymbolicLink()) fs.symlinkSync(fs.readlinkSync(src), dst);
    else if (e.isDirectory()) copyTree(src, dst, files, root);
    else fs.copyFileSync(src, dst);
    if (!e.isDirectory()) files.push(path.relative(root, dst));
  }
}

/** 建 schemes/<name>/。名字被占了、名字不合规矩、模板没填干净都报错，不留半份。 */
export function createScheme(repoAbs, name, { title } = {}) {
  if (!SCHEME_NAME.test(name)) throw new Error(`方案名只用小写字母、数字、连字符，字母开头，2–31 个字：${name}`);
  const template = path.join(repoAbs, 'schemes', '_template');
  const dir = path.join(repoAbs, 'schemes', name);
  if (!fs.existsSync(template)) throw new Error(`找不到模板 ${path.relative(repoAbs, template)}`);
  if (fs.existsSync(dir)) throw new Error(`schemes/${name}/ 已经有了`);
  const files = [];
  const vars = { name, title: title || namespaceOf(name), Name: namespaceOf(name) };
  try {
    copyTree(template, dir, files, dir);
    for (const rel of files) {
      const abs = path.join(dir, rel);
      if (fs.lstatSync(abs).isSymbolicLink() || !TEXT.test(rel)) continue;
      const text = fs.readFileSync(abs, 'utf8').replace(/\{\{(name|title|Name)\}\}/g, (_, k) => vars[k]);
      if (/\{\{\w+\}\}/.test(text)) throw new Error(`模板里有没认得的占位：${rel}`);
      fs.writeFileSync(abs, text);
    }
    for (const rel of files.filter((f) => f.endsWith('.json'))) JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8'));
  } catch (err) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw err;
  }
  return { scheme: name, dir: path.relative(repoAbs, dir), title: vars.title, namespace: vars.Name, files: files.sort() };
}

const STEPS = [
  ['tokens', 'token 构建', 'tooling/tokens/build.mjs'],
  ['qa', '质量检查（对比度、颜色没写死……）', 'tooling/qa/check.mjs'],
  ['ds', 'Design System 构建', 'tooling/design-system/build.mjs'],
];

/** 照 tooling 跑一遍这套方案：和 npm run build:tokens / qa / build:ds 带 --scheme 一样，产物在 dist/<name>/。 */
export function checkScheme(repoAbs, name) {
  const steps = [];
  for (const [id, label, script] of STEPS) {
    if (id === 'ds' && !fs.existsSync(path.join(repoAbs, 'schemes', name, 'design-system'))) continue;
    const r = spawnSync(process.execPath, [path.join(repoAbs, script), '--scheme', name], { cwd: repoAbs, encoding: 'utf8' });
    const tail = `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n').slice(-12).join('\n');
    steps.push({ id, label, ok: r.status === 0, tail });
    if (r.status !== 0) break;
  }
  return { ok: steps.every((s) => s.ok), steps };
}
