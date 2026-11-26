import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { BENCH_ROOT, loadConfig } from '../src/utils/config.js';
import { catalog } from '../src/server/catalog.js';

const dw = (...args) => spawnSync(process.execPath, [path.join(BENCH_ROOT, 'bin', 'dw.js'), ...args], { encoding: 'utf8' });

test('cli: every command answers --help with its own usage, and dw list names every section', () => {
  const all = dw('help');
  assert.equal(all.status, 0);
  const commands = [...new Set([...all.stdout.matchAll(/^ {2}dw ([a-z]+)/gm)].map((m) => m[1]))];
  assert.ok(commands.length > 20, commands.join(' '));
  for (const c of commands) {
    for (const args of c === 'frames' ? [[c, '--help'], [c, 'x', '-h'], ['help', c]] : [[c, '--help']]) {
      const r = dw(...args);
      assert.equal(r.status, 0, `dw ${args.join(' ')}: ${r.stderr}`);
      assert.match(r.stdout, new RegExp(`^ {2}dw ${c}\\b`, 'm'), `dw ${args.join(' ')}`);
      for (const other of commands.filter((o) => o !== c)) assert.doesNotMatch(r.stdout, new RegExp(`^ {2}dw ${other}\\b`, 'm'), `dw ${args.join(' ')} shows ${other}`);
    }
  }
  // a missing argument is still an error
  const bad = dw('frames');
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /用法：dw frames/);
  assert.equal(dw('help', 'nope').status, 1);
  // the list's help names the sections the bench really has
  const titles = catalog(loadConfig()).sections.map((s) => s.title);
  const line = dw('list', '--help').stdout;
  for (const t of titles) assert.ok(line.includes(t), `dw list --help is missing ${t}`);
  assert.ok(line.includes(['', '一', '二', '三', '四', '五', '六'][titles.length] + '类'));
});
