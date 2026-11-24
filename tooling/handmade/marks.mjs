// 手作的资产：按方案的 marks/art.mjs 写出 marks/ 下的 SVG，并更新 marks/manifest.json。只处理带 marks/art.mjs 的方案。
// 画法是 sticker.mjs（和 Design System 的 bundle.js 同一份），数值是方案的 tokens/handmade.json；art.mjs 只给几何和构图。
// 颜色写成「方言变量，退回网页变量」：var(--pm-<角色>, var(--color-<角色>))，Pomelo 里和挂了 Design System 的画布里都能直接用；
// 上好色的 PNG 和 themed SVG 由 tooling/render/marks.mjs 换成具体色值（resolveRoles）。
//
// 用法：
//   node tooling/handmade/marks.mjs              重新生成并写入方案目录
//   node tooling/handmade/marks.mjs --check      只比较，不写入（同步时在 tag 里跑）
//
// 换色的挂钩：模块贴纸的分类色写成 var(--mark-color, 分类色)、浅一档写成 var(--mark-color-soft, 分类色贴纸填色)。
//   不设这两个变量就是原来的颜色；Pomelo 在贴纸外面设上，就换成站主挑的另一种分类色。挂钩不算几何和参数。
//
// 保护：清单里已是 approved 的资产，生成结果与文件不同就报错、不覆盖（approved 不改几何与参数，要改开新版本）。
//   只差换色挂钩的不算不同（去掉挂钩后逐字节一样），照样写入，仍是 approved。
import path from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs, schemesToBuild, schemeDir, readJson, loadTokens, sha256, log, isMain } from '../lib/common.mjs';
import { render } from './sticker.mjs';

export const GENERATOR = 'tooling/handmade/marks.mjs';
export const roleVar = (role) => `var(--pm-${role}, var(--color-${role}))`;

/** 贴纸的颜色表：图里写的名字 → 方案的角色。 */
export const STICKER_ROLES = { ink: 'art-ink', white: 'art-white', shadow: 'art-shadow', blush: 'blush', yellow: 'yuzu', leaf: 'leaf', heart: 'heart', wood: 'wood' };
export const CATS = ['mint', 'sky', 'pink', 'orange', 'grape'];

/** 换色挂钩：tint 为真时分类色外面包一层 --mark-color。 */
export const HOOK = { cat: '--mark-color', catLight: '--mark-color-soft' };
const hooked = (name, value) => `var(${HOOK[name]}, ${value})`;
/** 去掉换色挂钩（比较 approved 的资产、上色时用）。 */
export const stripHooks = (src) => src.replace(/var\(--mark-color(?:-soft)?, (var\(--pm-[a-z0-9-]+, var\(--color-[a-z0-9-]+\)\)|[^()]+)\)/g, '$1');

export function stickerColors(V = roleVar, { tint = false } = {}) {
  const col = Object.fromEntries(Object.entries(STICKER_ROLES).map(([k, role]) => [k, V(role)]));
  col.cats = Object.fromEntries(CATS.map((c) => [c, tint ? hooked('cat', V(`cat-${c}`)) : V(`cat-${c}`)]));
  col.catLight = (c) => (tint ? hooked('catLight', V(`cat-${c}-sticker`)) : V(`cat-${c}-sticker`));
  return col;
}

/** 给 art.mjs 的工具：整份 SVG、贴纸的 defs 和 html、角色变量。 */
export function makeCtx(tokens) {
  const st = tokens.handmade.sticker;
  const col = stickerColors();
  const colTint = stickerColors(roleVar, { tint: true });
  const sticker = (art, { k = 1, idp = 'pm-', merge = true, tint = false, anim = false, over = {} } = {}) => render(art, st, tint ? colTint : col, { k, idp, merge, anim, over });
  // 插图（空状态）要动：merge: false 每样东西一张白边、各成一组（<g class="pt 名字">）；anim: true 墨线带 pathLength="1"（能一笔笔画出来）；
  // stagger: true 给每组写上 --i（第几个弹出来，按 art.order，没写就按画的先后）；over 改画法参数（大图把取样放稀，sp）。不写这几个就和原来一样。
  const svg = (art, { view, size, k = 1, idp, label, tint = false, merge = true, anim = false, stagger = false, over = {} }) => {
    let { defs, html } = sticker(art, { k, idp, tint, merge, anim, over });
    if (stagger) {
      let n = 0;
      html = html.replace(/<g class="pt( [^"]*)?">/g, (m, cls = '') => {
        const name = cls.trim().split(/\s+/)[0];
        const i = art.order ? art.order.indexOf(name) : n;
        if (i < 0) throw new Error(`${art.name}：order 里没有 ${name}`);
        n++;
        return `<g class="pt${cls}" style="--i:${i}">`;
      });
    }
    const [, , vw, vh] = view.split(' ').map(Number);
    const h = Math.round((size * vh) / vw);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="${view}" role="img" aria-label="${label}">${defs ? `<defs>${defs}</defs>` : ''}${html}</svg>\n`;
  };
  return { st, V: roleVar, sticker, svg, tokens };
}

/** 把 var(--pm-x, var(--color-x)) 换成某套配色、某个明暗下的色值（只换颜色，不动几何）。 */
export function resolveRoles(src, tokens, palette, mode) {
  const roles = palette ? tokens.color.paletteRoles[palette] : tokens.color.roles;
  return stripHooks(src).replace(/var\(--pm-([a-z0-9-]+), var\(--color-\1\)\)/g, (m, role) => {
    if (!roles[role]) throw new Error(`没有颜色角色 ${role}`);
    return roles[role][mode];
  });
}

const GEN_NOTE = '由 tooling/handmade/marks.mjs 按 marks/art.mjs 生成，不要手改';

export async function runHandmadeMarks(args = parseArgs()) {
  let problems = 0;
  const results = [];
  for (const scheme of schemesToBuild(args)) {
    const sdir = schemeDir(scheme);
    const artPath = path.join(sdir, 'marks', 'art.mjs');
    if (!existsSync(artPath)) continue;
    const tokens = loadTokens(scheme);
    if (!tokens.handmade) throw new Error(`${scheme}：有 marks/art.mjs 但没有 tokens/handmade.json`);
    const art = await import(pathToFileURL(artPath).href);
    const list = art.assets(makeCtx(tokens));
    const mpath = path.join(sdir, 'marks', 'manifest.json');
    const manifest = readJson(mpath);
    const byId = new Map(manifest.assets.map((a) => [a.id, a]));
    const changed = [], blocked = [];
    const next = manifest.assets.filter((a) => a.source?.generator !== GENERATOR || list.some((e) => e.id === a.id));
    for (const e of list) {
      const file = path.join(sdir, 'marks', e.file);
      const old = byId.get(e.id);
      const hash = sha256(Buffer.from(e.svg));
      const onDisk = existsSync(file) ? readFileSync(file, 'utf8') : null;
      if (old?.status === 'approved' && (onDisk !== e.svg || old.sha256 !== hash)) {
        const sameArt = onDisk !== null && old.sha256 === sha256(Buffer.from(onDisk)) && stripHooks(onDisk) === stripHooks(e.svg);
        if (!sameArt) { blocked.push(e.id); continue; }
      }
      if (onDisk !== e.svg) changed.push(`marks/${e.file}`);
      const entry = {
        id: e.id, title: e.title, file: e.file, kind: 'svg', status: old?.status ?? 'proposed',
        ...(old?.approved ? { approved: old.approved } : {}),
        colorMode: e.colorMode, ...(e.colorRole ? { colorRole: e.colorRole } : {}),
        ...(e.category ? { category: e.category } : {}),
        ...(e.renders ? { renders: e.renders } : {}),
        source: { generator: GENERATOR, art: 'marks/art.mjs', rules: 'DESIGN.md §4、§6', note: GEN_NOTE },
        notes: e.notes, sha256: hash,
      };
      const i = next.findIndex((a) => a.id === e.id);
      if (i < 0) next.push(entry);
      else if (JSON.stringify(next[i]) !== JSON.stringify(entry)) next[i] = entry;
      if (!args.check) { mkdirSync(path.dirname(file), { recursive: true }); if (onDisk !== e.svg) writeFileSync(file, e.svg); }
    }
    const manifestChanged = JSON.stringify(next) !== JSON.stringify(manifest.assets);
    if (manifestChanged) changed.push('marks/manifest.json');
    if (!args.check && manifestChanged) writeFileSync(mpath, JSON.stringify({ ...manifest, assets: next }, null, 2) + '\n');
    if (blocked.length) { problems++; console.error(`${scheme}：这些已是 approved，生成结果变了，不覆盖（要改开新版本）：${blocked.join('、')}`); }
    if (args.check && changed.length) { problems++; console.error(`${scheme}：marks 与 art.mjs 的生成结果不同：${changed.join('、')}`); }
    log(`handmade marks ${scheme}：${list.length} 个资产${changed.length ? `，${args.check ? '待更新' : '已写入'} ${changed.length} 个文件` : '，没有变化'}`);
    results.push({ scheme, changed, blocked });
  }
  if (problems && !args.quiet) process.exitCode = 1;
  return results;
}

if (isMain(import.meta.url)) runHandmadeMarks().catch((e) => { console.error(e.message); process.exit(1); });
