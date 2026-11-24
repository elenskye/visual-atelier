import fs from 'node:fs';
import path from 'node:path';
import { canvasDir, readCanvasJson } from './store.js';
import { setDoc, deleteDoc, listCollection } from './db.js';
import { sha256File } from '../utils/config.js';

// 画板的批准状态：存在画布的 db.json 里，路径 review/<画板文件名>，和页面存储同一个文件，Agent 直接读。
//   { status: 'proposed' | 'approved' | 'rejected', at, by: 'owner' | 'agent', note?, sha256 }
// sha256 是标状态那一刻画板文件的校验和：批过以后画板又改了，读的时候标「批过后改过」。
// 只有站主在画布界面里批准、退回；Agent 用 dw review 只能标「待批」或清掉（approved 只能由站主给）。

export const REVIEW_COLLECTION = 'review';
const STATUSES = ['proposed', 'approved', 'rejected'];
export const STATUS_LABEL = { proposed: '待批', approved: '已批准', rejected: '退回' };

function boardPath(config, name, file) {
  const canvas = readCanvasJson(config, name);
  if (!canvas?.boards?.[file]) throw Object.assign(new Error(`${name} 没有画板 ${file}`), { code: 'invalid_argument' });
  return path.join(canvasDir(config, name), 'project', file);
}

/** 每张标过状态的画板：{ 文件名: { status, at, by, note, sha256, changed } }；changed 是标完以后画板又改了。 */
export function listReviews(config, name) {
  const canvas = readCanvasJson(config, name);
  const out = {};
  for (const doc of listCollection(config, name, REVIEW_COLLECTION)) {
    const file = doc.id;
    const abs = path.join(canvasDir(config, name), 'project', file);
    const now = canvas?.boards?.[file] && fs.existsSync(abs) ? sha256File(abs) : null;
    out[file] = { ...doc.data, missing: !now, changed: !!now && !!doc.data.sha256 && doc.data.sha256 !== now };
  }
  return out;
}

export function setReview(config, name, file, status, { note = '', by = 'owner', at = new Date() } = {}) {
  if (!STATUSES.includes(status)) throw Object.assign(new Error(`状态只能是 ${STATUSES.join(' / ')}`), { code: 'invalid_argument' });
  if (by !== 'owner' && status !== 'proposed') throw Object.assign(new Error('只有站主能批准或退回'), { code: 'permission_denied' });
  const abs = boardPath(config, name, file);
  const doc = { status, at: at.toISOString(), by, sha256: sha256File(abs) };
  const text = String(note || '').trim().slice(0, 2000);
  if (text) doc.note = text;
  setDoc(config, name, `${REVIEW_COLLECTION}/${file}`, doc);
  return doc;
}

export function clearReview(config, name, file) {
  deleteDoc(config, name, `${REVIEW_COLLECTION}/${file}`);
}
