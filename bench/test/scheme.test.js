import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { REPO_ROOT } from '../src/utils/config.js';
import { createScheme, checkScheme, namespaceOf } from '../src/scheme/new.js';

// dw scheme new（v1.0 Phase 5）：在一份临时的仓库里（tooling、package.json、模板，node_modules 用链接）起一套方案，
// 照 tooling 真的跑一遍 token 构建、质量检查、Design System 构建。

function tempRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-scheme-'));
  fs.cpSync(path.join(REPO_ROOT, 'tooling'), path.join(root, 'tooling'), { recursive: true });
  fs.cpSync(path.join(REPO_ROOT, 'schemes', '_template'), path.join(root, 'schemes', '_template'), { recursive: true, verbatimSymlinks: true });
  fs.copyFileSync(path.join(REPO_ROOT, 'package.json'), path.join(root, 'package.json'));
  fs.symlinkSync(path.join(REPO_ROOT, 'node_modules'), path.join(root, 'node_modules'));
  return root;
}

test('scheme new: the template becomes a scheme that builds and passes the checks', { timeout: 120000 }, () => {
  const root = tempRepo();
  const made = createScheme(root, 'demo-kit', { title: '示例' });
  assert.equal(made.namespace, 'DemoKit');
  const dir = path.join(root, 'schemes', 'demo-kit');
  const scheme = JSON.parse(fs.readFileSync(path.join(dir, 'scheme.json'), 'utf8'));
  assert.deepEqual([scheme.name, scheme.title, scheme.status, scheme.version], ['demo-kit', '示例', 'draft', '0.0.0']);
  assert.equal(fs.readlinkSync(path.join(dir, 'AGENTS.md')), 'CLAUDE.md');
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'design-system', 'system.json'), 'utf8')).namespace, 'DemoKit');
  for (const f of made.files) {
    const abs = path.join(dir, f);
    if (!fs.lstatSync(abs).isSymbolicLink()) assert.doesNotMatch(fs.readFileSync(abs, 'utf8'), /\{\{\w+\}\}/, f);
  }

  const check = checkScheme(root, 'demo-kit');
  assert.ok(check.ok, JSON.stringify(check.steps, null, 2));
  assert.deepEqual(check.steps.map((s) => s.id), ['tokens', 'qa', 'ds']);
  assert.ok(fs.existsSync(path.join(root, 'dist', 'demo-kit', 'tokens', 'web.css')));
  assert.ok(fs.existsSync(path.join(root, 'dist', 'demo-kit', 'design-system', 'project', 'components', 'bundle.css')));

  assert.throws(() => createScheme(root, 'demo-kit'), /已经有了/);
  assert.throws(() => createScheme(root, 'Bad_Name'), /小写字母/);
  assert.throws(() => createScheme(root, '_template'), /小写字母/);
  fs.rmSync(root, { recursive: true, force: true });
});

test('scheme new: names become Design System namespaces', () => {
  assert.equal(namespaceOf('pith'), 'Pith');
  assert.equal(namespaceOf('my-scheme-2'), 'MyScheme2');
});
