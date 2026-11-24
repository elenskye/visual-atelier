const fs = require('fs'), path = require('path');
const { CATS, DIRS } = require('./dirs');

const THEMES = {
  light: { page: '#f6efe2', surface: '#fdf9f0', cool: '#ece0cb', text: '#1b1d1c', muted: '#686359', line: '#ddd2bf', soft: '#e6dfd3', accent: '#2d6f6a', strong: '#28625d', ember: '#bf2929' },
  dark: { page: '#14201f', surface: '#233230', cool: '#1d2b29', text: '#f2ece0', muted: '#c1b9ac', line: '#384340', soft: '#343e3b', accent: '#77c8c2', strong: '#87cfc9', ember: '#ffa196' },
};

// inline=true：给画板用（带动画 class、遮罩、朱红抵达点）；false：静态资产
function svg(els, vb, { theme = THEMES.light, pfx = 'x', inline = false, size, label, showEm = false } = {}) {
  const c = (r) => theme[r] || r;
  let defs = '', body = '', n = 0;
  const one = (e) => {
    const st = (extra = '') => inline ? ` style="--i:${e.i || 0}${extra}"` : '';
    if (e.k === 'ln') return `<path${inline ? ' class="ln" pathLength="1"' : ''} d="${e.d}" fill="none" stroke="${c(e.role)}" stroke-width="${e.w}" stroke-linecap="round" stroke-linejoin="round"${st()}/>`;
    if (e.k === 'fl') return `<path${inline ? ' class="fl"' : ''} d="${e.d}" fill="${c(e.role)}"${e.rule ? ` fill-rule="${e.rule}"` : ''}${st(`;--dx:${e.dx || 0}px;--dy:${e.dy || 0}px`)}/>`;
    if (e.k === 'br') {
      if (!inline) return `<path d="${e.d}" fill="${c(e.role || 'accent')}"${e.rule ? ` fill-rule="${e.rule}"` : ''}/>`;
      const id = `${pfx}m${n++}`;
      defs += `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${vb[0]}" height="${vb[1]}"><path class="mk" pathLength="1" d="${e.c}" fill="none" stroke="#fff" stroke-width="${e.w}" stroke-linecap="round" stroke-linejoin="round" style="--i:${e.i || 0}"/></mask>`;
      return `<path d="${e.d}" fill="${c(e.role || 'accent')}"${e.rule ? ` fill-rule="${e.rule}"` : ''} mask="url(#${id})"/>`;
    }
    if (e.k === 'em') return (inline || showEm) ? `<circle${inline ? ' class="em"' : ''} cx="${+e.cx.toFixed(1)}" cy="${+e.cy.toFixed(1)}" r="${e.r}" fill="${c('ember')}"/>` : '';
    if (e.k === 'clip') {
      const id = `${pfx}c${n++}`;
      defs += `<clipPath id="${id}"><path d="${e.d}${e.hole || ''}" clip-rule="${e.hole ? 'evenodd' : e.rule}"/></clipPath>`;
      return `<g clip-path="url(#${id})">${e.els.map(one).join('')}</g>`;
    }
    return '';
  };
  body = els.map(one).join('');
  const sz = size ? ` width="${size[0]}" height="${size[1]}"` : '';
  const a11y = label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"';
  return `<svg${inline ? "" : " xmlns=\"http://www.w3.org/2000/svg\""} viewBox="0 0 ${vb[0]} ${vb[1]}"${sz}${a11y}>${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
}

module.exports = { svg, THEMES, CATS, DIRS };

if (require.main === module) {
  const out = path.join(__dirname, 'out'); fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
  // 资产：每方向 × 明暗 × (6 图标 + 装饰 + OG + 空状态)
  const manifest = [];
  for (const d of DIRS) for (const [tn, th] of Object.entries(THEMES)) {
    for (const [k] of CATS) { const p = `assets/${d.id}-icon-${k}-${tn}.svg`; fs.writeFileSync(path.join(out, p), svg(d.icons[k], [64, 64], { theme: th })); manifest.push(p); }
    for (const piece of ['deco', 'og', 'empty']) { const p = `assets/${d.id}-${piece}-${tn}.svg`; fs.writeFileSync(path.join(out, p), svg(d[piece].els, d[piece].vb, { theme: th })); manifest.push(p); }
  }
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
  // 本地自检预览
  let uid=0; let h = `<html><body style="margin:0;font-family:sans-serif">`;
  for (const [tn, th] of Object.entries(THEMES)) {
    h += `<div style="background:${th.page};color:${th.text};padding:24px">`;
    for (const d of DIRS) {
      h += `<div style="display:flex;gap:18px;align-items:center;margin-bottom:18px"><b style="width:60px">${d.id.toUpperCase()} ${d.name}</b>`;
      for (const [k] of CATS) h += `<div style="text-align:center">${svg(d.icons[k], [64, 64], { theme: th, size: [72, 72], pfx: 'p'+(uid++) })}<br>${svg(d.icons[k], [64, 64], { theme: th, size: [24, 24], pfx: 'p'+(uid++) })}</div>`;
      h += `<div style="background:${th.surface}">${svg(d.deco.els, d.deco.vb, { theme: th, size: [280, 110] })}</div>`;
      h += `<div style="background:${th.page};outline:1px solid ${th.line}">${svg(d.og.els, d.og.vb, { theme: th, size: [240, 126] })}</div>`;
      h += `<div style="background:${th.surface}">${svg(d.empty.els, d.empty.vb, { theme: th, size: [160, 100] })}</div>`;
      h += `</div>`;
    }
    h += `</div>`;
  }
  fs.writeFileSync(path.join(out, 'preview.html'), h + '</body></html>');
  console.log('assets', manifest.length);
}
