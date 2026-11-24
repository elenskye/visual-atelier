// 贴纸和错版：一张图由若干部分（art.parts）组成，每部分是图形（shape）、线（line）、点（dot）或腮红（blush）。
//   白边 wb：所有部分描粗铺一层，外面再加投影；填色 fl：比墨线错开 off；墨线 ol：手画。
// st 是画法参数（tokens/handmade.json 的 sticker），col 是颜色表（可以是 CSS 变量）：
//   { ink, white, shadow, blush, cats: { 分类: 色 }, catLight(分类), 其他名字: 色 }。图的 fill 写 'cat' 或 col 里的名字。
import { handStroke, handFill, f, mix } from './line.mjs';

export function render(art, st, col, { k = 1, merge = true, idp = 'a', anim = false, over = {}, layer = null } = {}) {
  const s = { ...st, ...over };
  const C = (name) => {
    if (name === 'cat') return col.cats[art.cat];
    if (name === 'catLight') return col.catLight ? col.catLight(art.cat) : mix(col.cats[art.cat], '#ffffff', 0.72);
    return col[name] ?? name;
  };
  const off = s.off.map((v) => v * k);
  const bw = s.border * k;
  const defs = s.shadow && bw > 0
    ? `<filter id="${idp}sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="${f(1.3 * k)}" stdDeviation="${f(1.2 * k)}" flood-color="${col.shadow}" flood-opacity="1"></feDropShadow></filter>`
    : '';
  const shadowAttr = defs ? ` filter="url(#${idp}sh)"` : '';
  const blob = (p) => {
    const extra = Math.max(Math.abs(off[0]), Math.abs(off[1])) * 0.6;
    const w = 2 * (bw + extra);
    if (p.t === 'line') return `<path d="${handStroke(p.d, { amp: s.amp * k * 0.6, seed: p.seed, sp: s.sp ?? 0.9 })}" fill="none" stroke="${col.white}" stroke-width="${f(s.line * k * (p.sw ?? 0.8) + w)}" stroke-linecap="round" stroke-linejoin="round"></path>`;
    if (p.t === 'blush') return '';
    return `<path d="${handFill(p.d, { amp: s.fillAmp * k, seed: p.seed, sp: s.sp ?? 0.9 })}" fill="${col.white}" stroke="${col.white}" stroke-width="${f(w)}" stroke-linejoin="round"></path>`;
  };
  const body = (p) => {
    const amp = s.amp * k * (p.amp ?? 1);
    const tr = `transform="translate(${f(off[0])} ${f(off[1])})"`;
    const out = [];
    if (p.t === 'shape') {
      out.push(`<path class="fl" d="${handFill(p.d, { amp: s.fillAmp * k * (p.amp ?? 1), seed: p.seed, sp: s.sp ?? 0.9 })}" fill="${C(p.fill)}" ${s.outline ? tr : ''}></path>`);
      if (s.outline) out.push(`<path class="ol"${anim ? ' pathLength="1"' : ''} d="${handStroke(p.d, { amp, seed: p.seed, sp: s.sp ?? 0.9 })}" fill="none" stroke="${col.ink}" stroke-width="${f(s.line * k * (p.sw ?? 1))}" stroke-linecap="round" stroke-linejoin="round"></path>`);
    } else if (p.t === 'line') {
      const color = p.color ? C(p.color) : s.outline ? col.ink : C(p.sticker ?? 'white');
      const move = p.withFill && s.outline ? tr : '';
      out.push(`<path class="ol"${anim ? ' pathLength="1"' : ''} d="${handStroke(p.d, { amp: amp * 0.7, seed: p.seed, sp: s.sp ?? 0.9 })}" fill="none" stroke="${color}" stroke-width="${f(s.line * k * (p.sw ?? 0.8))}" stroke-linecap="round" stroke-linejoin="round" ${move}></path>`);
    } else if (p.t === 'dot') {
      out.push(`<path class="dt" d="${handFill(p.d, { amp: 0.12 * k, seed: p.seed })}" fill="${p.color ? C(p.color) : col.ink}"></path>`);
    } else if (p.t === 'blush') {
      out.push(`<path class="bl" d="${handFill(p.d, { amp: 0.3 * k, seed: p.seed })}" fill="${col.blush}" ${s.outline ? tr : ''}></path>`);
    }
    return out.join('');
  };
  let html = '';
  // 只要白边，或只要图形（柚子的脸要分层：白边在身子下面，五官在身子上面）
  if (layer === 'blob') return { defs, html: bw > 0 ? `<g class="wb"${shadowAttr}>${art.parts.map(blob).join('')}</g>` : '' };
  if (layer === 'body') return { defs, html: art.parts.map((p) => `<g class="pt${p.id ? ' ' + p.id : ''}">${body(p)}</g>`).join('') };
  if (merge) {
    if (bw > 0) html += `<g class="wb"${shadowAttr}>${art.parts.map(blob).join('')}</g>`;
    html += art.parts.map((p) => `<g class="pt${p.id ? ' ' + p.id : ''}">${body(p)}</g>`).join('');
  } else {
    // 按 id 分组：同一组的各块共用一张白边
    const groups = [];
    for (const p of art.parts) {
      const g = groups.find((x) => x.id && x.id === p.id);
      if (g) g.parts.push(p); else groups.push({ id: p.id, parts: [p] });
    }
    html += groups.map((g) => `<g class="pt${g.id ? ' ' + g.id : ''}">${bw > 0 ? `<g class="wb"${shadowAttr}>${g.parts.map(blob).join('')}</g>` : ''}${g.parts.map(body).join('')}</g>`).join('');
  }
  return { defs, html };
}

export function svg(art, st, col, { size = 64, view = '-8 -8 80 80', k = 1, idp = 'a', merge = true, anim = false, cls = '', style = '', over = {}, label = '' } = {}) {
  const { defs, html } = render(art, st, col, { k, merge, idp, anim, over });
  const [, , vw, vh] = view.split(' ').map(Number);
  const h = Math.round((size * vh) / vw);
  return `<svg class="${cls}" width="${size}" height="${h}" viewBox="${view}" style="${style}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${defs ? `<defs>${defs}</defs>` : ''}${html}</svg>`;
}
