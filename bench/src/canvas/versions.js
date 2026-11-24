import fs from 'node:fs';
import path from 'node:path';
import { canvasDir, trackedFiles } from './store.js';
import { readJsonFile, writeJsonFile, stamp } from '../utils/config.js';

// Local version history: canvases/<name>/.versions/
//   objects/<sha256>   file contents, stored once
//   <id>.json          { id, label, createdAt, files: { rel: sha256 } }
// Ids sort by time. Not in Git: Git commits stay the durable record.

function versionsDir(config, name) {
  return path.join(canvasDir(config, name), '.versions');
}

export function listVersions(config, name) {
  const dir = versionsDir(config, name);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => readJsonFile(path.join(dir, f)))
    .filter(Boolean);
}

function sameFiles(a, b) {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => a[k] === b[k]);
}

/**
 * Saves the current tracked files as a version. Nothing is written when they equal the latest version;
 * the latest is returned instead.
 */
export function snapshot(config, name, label = 'save', { at = new Date() } = {}) {
  const dir = versionsDir(config, name);
  const root = canvasDir(config, name);
  const files = trackedFiles(config, name);
  const latest = listVersions(config, name).at(-1);
  if (latest && sameFiles(latest.files, files)) {
    // same files: keep one version, but note what happened to it (publish, pull…)
    if (label !== latest.label && !(latest.events || []).some((e) => e.label === label && e.at === at.toISOString())) {
      latest.events = [...(latest.events || []), { label, at: at.toISOString() }];
      writeJsonFile(path.join(dir, `${latest.id}.json`), latest);
    }
    return { ...latest, reused: true };
  }

  fs.mkdirSync(path.join(dir, 'objects'), { recursive: true });
  for (const [rel, sha] of Object.entries(files)) {
    const obj = path.join(dir, 'objects', sha);
    if (!fs.existsSync(obj)) fs.copyFileSync(path.join(root, rel), obj);
  }
  let id = `${stamp(at)}-${label.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()}`;
  let n = 2;
  while (fs.existsSync(path.join(dir, `${id}.json`))) id = `${id.replace(/~\d+$/, '')}~${n++}`;
  const record = { id, label, createdAt: at.toISOString(), files };
  writeJsonFile(path.join(dir, `${id}.json`), record);
  return record;
}

/** Puts the tracked files back as they were in version `id`. The current state is saved first. */
export function restore(config, name, id) {
  const dir = versionsDir(config, name);
  const root = canvasDir(config, name);
  const record = readJsonFile(path.join(dir, `${id}.json`));
  if (!record) throw new Error(`没有这个版本：${id}`);
  const before = snapshot(config, name, 'before-restore');
  const current = trackedFiles(config, name);
  for (const rel of Object.keys(current)) {
    if (!(rel in record.files)) fs.rmSync(path.join(root, rel));
  }
  for (const [rel, sha] of Object.entries(record.files)) {
    if (current[rel] === sha) continue;
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.copyFileSync(path.join(dir, 'objects', sha), abs);
  }
  return { restored: record.id, savedBefore: before.id };
}

/** Bytes of one file in one version. */
export function readVersionFile(config, name, id, rel) {
  const dir = versionsDir(config, name);
  const record = readJsonFile(path.join(dir, `${id}.json`));
  const sha = record?.files?.[rel];
  if (!sha) return null;
  return fs.readFileSync(path.join(dir, 'objects', sha));
}
