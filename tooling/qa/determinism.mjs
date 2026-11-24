// 确定性检查：同一份源导出两次，结果必须逐字节一致。
import path from 'node:path';
import os from 'node:os';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { parseArgs, walk, sha256, log, isMain } from '../lib/common.mjs';
import { runTokens } from '../tokens/build.mjs';
import { runHandmade } from '../handmade/build.mjs';
import { runMarks } from '../render/marks.mjs';
import { runMotion } from '../render/motion.mjs';
import { runCatalog } from '../catalog/build.mjs';

export async function runDeterminism(args = parseArgs()) {
  const dirs = [mkdtempSync(path.join(os.tmpdir(), 'va-det-a-')), mkdtempSync(path.join(os.tmpdir(), 'va-det-b-'))];
  const log0 = console.log; console.log = () => {};
  try {
    for (const d of dirs) {
      const a = { ...args, out: d };
      runTokens(a); runHandmade(a); await runMarks(a); await runMotion(a); runCatalog(a);
    }
  } finally { console.log = log0; }
  const hashes = dirs.map((d) => new Map(walk(d).map((f) => [path.relative(d, f), sha256(readFileSync(f))])));
  const names = new Set([...hashes[0].keys(), ...hashes[1].keys()]);
  const diff = [...names].filter((n) => hashes[0].get(n) !== hashes[1].get(n));
  dirs.forEach((d) => rmSync(d, { recursive: true, force: true }));
  log(`determinism  比较 ${names.size} 个文件：${diff.length ? '不一致 ' + diff.join(', ') : '两次导出逐字节一致'}`);
  if (diff.length) process.exitCode = 1;
  return { files: names.size, diff };
}

if (isMain(import.meta.url)) runDeterminism().catch((e) => { console.error(e.message); process.exit(1); });
