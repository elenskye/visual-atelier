// 给网页预览用的字体子集：只留用到的字（画布生成器、优化页和方案要打包中文字体时用；探索页直接用 Google Fonts，不用它）。
// fontkit（仓库已有的依赖）只会拆出字形（glyf、loca、hmtx……），不写 cmap、name、OS/2、post，浏览器不认；
// 这里把这四张表补上，再按 OpenType 的格式重新排表头、算校验和：
//   cmap：自己写一张 (3,1) 格式 4（只收 BMP 里的字）。
//   OS/2、name：原样从原字体复制（name 里留着原作者、许可和网址）。
//   post：写格式 3（不带字形名），斜角、下划线照原字体。
// 只给 TrueType 轮廓（.ttf）用。保留字名的字体（得意黑这类）改过就不能用原名，别拿它做子集。
// 用法：import { subsetFont } from 'tooling/fonts/subset.mjs'（生成器走 canvases/_lib/root.mjs 的 rootImport）；
// 或命令行 node tooling/fonts/subset.mjs <原字体.ttf> --text <放着要留的字的文件> --out <输出.ttf>
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';

/** 表目录：{ tag: { offset, length } } */
function tablesOf(buf) {
  const n = buf.readUInt16BE(4);
  const out = {};
  for (let i = 0; i < n; i++) {
    const o = 12 + i * 16;
    out[buf.toString('latin1', o, o + 4)] = { offset: buf.readUInt32BE(o + 8), length: buf.readUInt32BE(o + 12) };
  }
  return out;
}
const tableBytes = (buf, dir, tag) => {
  if (!dir[tag]) throw new Error(`原字体没有 ${tag} 表`);
  return Buffer.from(buf.subarray(dir[tag].offset, dir[tag].offset + dir[tag].length));
};

/** cmap：一张 (3,1) 格式 4。pairs 是按码位排好的 [码位, 字形号]，码位连着、字形号也连着的并成一段。 */
function cmapTable(pairs) {
  const segs = [];
  for (const [c, g] of pairs) {
    const last = segs[segs.length - 1];
    if (last && c === last.end + 1 && g === last.gEnd + 1) { last.end = c; last.gEnd = g; } else segs.push({ start: c, end: c, g0: g, gEnd: g });
  }
  segs.push({ start: 0xffff, end: 0xffff, g0: 0, last: true });
  const n = segs.length;
  const sub = Buffer.alloc(16 + n * 8);
  const searchRange = 2 * 2 ** Math.floor(Math.log2(n));
  sub.writeUInt16BE(4, 0);
  sub.writeUInt16BE(sub.length, 2);
  sub.writeUInt16BE(0, 4);
  sub.writeUInt16BE(n * 2, 6);
  sub.writeUInt16BE(searchRange, 8);
  sub.writeUInt16BE(Math.log2(searchRange / 2), 10);
  sub.writeUInt16BE(n * 2 - searchRange, 12);
  let p = 14;
  for (const s of segs) { sub.writeUInt16BE(s.end, p); p += 2; }
  p += 2; // reservedPad
  for (const s of segs) { sub.writeUInt16BE(s.start, p); p += 2; }
  for (const s of segs) { sub.writeUInt16BE(s.last ? 1 : (s.g0 - s.start) & 0xffff, p); p += 2; }
  // idRangeOffset 都是 0（Buffer.alloc 已经清零）
  const head = Buffer.alloc(12);
  head.writeUInt16BE(0, 0);
  head.writeUInt16BE(1, 2);
  head.writeUInt16BE(3, 4);
  head.writeUInt16BE(1, 6);
  head.writeUInt32BE(12, 8);
  return Buffer.concat([head, sub]);
}

/** post 格式 3：32 字节，斜角、下划线位置和粗细、是否等宽照原字体。 */
function postTable(orig) {
  const b = Buffer.alloc(32);
  b.writeUInt32BE(0x00030000, 0);
  orig.copy(b, 4, 4, 16);
  return b;
}

const checksum = (buf) => {
  let sum = 0;
  for (let i = 0; i < buf.length; i += 4) sum = (sum + buf.readUInt32BE(i)) >>> 0;
  return sum;
};

/** 按 OpenType 的规矩排成一个字体文件：表按标签排序、四字节对齐、各表校验和、head 的 checkSumAdjustment。 */
function sfnt(tables) {
  const tags = Object.keys(tables).sort();
  const n = tags.length;
  const entrySelector = Math.floor(Math.log2(n));
  const searchRange = 2 ** entrySelector * 16;
  const dir = Buffer.alloc(12 + 16 * n);
  dir.writeUInt32BE(0x00010000, 0);
  dir.writeUInt16BE(n, 4);
  dir.writeUInt16BE(searchRange, 6);
  dir.writeUInt16BE(entrySelector, 8);
  dir.writeUInt16BE(n * 16 - searchRange, 10);
  const parts = [dir];
  let offset = dir.length;
  let headAt = 0;
  tags.forEach((tag, i) => {
    let data = tables[tag];
    if (tag === 'head') { data = Buffer.from(data); data.writeUInt32BE(0, 8); headAt = offset; }
    const padded = Buffer.concat([data, Buffer.alloc((4 - (data.length % 4)) % 4)]);
    const r = 12 + i * 16;
    dir.write(tag, r, 'latin1');
    dir.writeUInt32BE(checksum(padded), r + 4);
    dir.writeUInt32BE(offset, r + 8);
    dir.writeUInt32BE(data.length, r + 12);
    parts.push(padded);
    offset += padded.length;
  });
  const font = Buffer.concat(parts);
  font.writeUInt32BE((0xb1b0afba - checksum(font)) >>> 0, headAt + 8);
  return font;
}

/**
 * 子集：src 是原字体（.ttf 的 Buffer），chars 是要留的字（字符串）。
 * 返回 { buffer, kept: 留下的字, missing: 原字体里本来就没有的字 }。
 */
export function subsetFont(src, chars) {
  const font = fontkit.create(src);
  if (!font.directory?.tables?.glyf) throw new Error('只支持 TrueType 轮廓（glyf）的字体');
  const sub = font.createSubset();
  const pairs = [];
  const missing = [];
  const kept = [];
  for (const cp of [...new Set([...chars].map((c) => c.codePointAt(0)))].sort((a, b) => a - b)) {
    if (cp > 0xffff || cp < 0x20) continue;
    const g = font.glyphForCodePoint(cp);
    if (!g || g.id === 0) { missing.push(String.fromCodePoint(cp)); continue; }
    pairs.push([cp, sub.includeGlyph(g.id)]);
    kept.push(String.fromCodePoint(cp));
  }
  const out = Buffer.from(sub.encode());
  const dOut = tablesOf(out);
  const dSrc = tablesOf(src);
  const tables = {};
  for (const tag of Object.keys(dOut)) tables[tag] = tableBytes(out, dOut, tag);
  tables.cmap = cmapTable(pairs);
  tables['OS/2'] = tableBytes(src, dSrc, 'OS/2');
  tables.name = tableBytes(src, dSrc, 'name');
  tables.post = postTable(tableBytes(src, dSrc, 'post'));
  const buffer = sfnt(tables);
  // 自己验一遍：拿 fontkit 打开，每个留下的字都要找得到字形
  const back = fontkit.create(buffer);
  const lost = kept.filter((c) => !back.hasGlyphForCodePoint(c.codePointAt(0)));
  if (lost.length) throw new Error(`子集里找不到：${lost.join('')}`);
  return { buffer, kept: kept.join(''), missing: missing.join('') };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const [src] = process.argv.slice(2);
  const text = arg('--text');
  const out = arg('--out');
  if (!src || !text || !out) {
    console.error('用法：node tooling/fonts/subset.mjs <原字体.ttf> --text <放着要留的字的文件> --out <输出.ttf>');
    process.exit(1);
  }
  const r = subsetFont(readFileSync(src), readFileSync(text, 'utf8'));
  writeFileSync(out, r.buffer);
  console.log(`${out}：${(r.buffer.length / 1024).toFixed(0)} KB，留了 ${[...r.kept].length} 个字${r.missing ? `；原字体没有：${r.missing}` : ''}`);
}
