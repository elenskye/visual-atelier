// 第 1 步 · App 图标：六个方向。每个画大图（深色）、64 深浅两版、32、16，再看菜单栏的单色模板图三态（空闲、在跑、等你）。
// 图形都在 100×100 的格子里。角色：main（深色版青、浅色版墨）、acc（深色版浅青白、浅色版青）、eye（深色版墨、浅色版白）。
import { board, SANS, MONO } from './common.mjs';

const ICONS = [
  {
    id: 'I1', name: '光标鸟', d: '终端里一闪一闪的方块光标，长出一个尖喙。在跑的时候它就像光标一样闪。',
    shapes: [
      ['main', '<rect x="30" y="22" width="27" height="56" rx="3.5"/>'],
      ['main', '<polygon points="57,30 81,39.5 57,49"/>'],
      ['eye', '<circle cx="47.5" cy="35.5" r="3.6"/>'],
    ],
  },
  {
    id: 'I2', name: '啄', d: '圆头、尖喙、后脑一撮冠，喙尖三道敲击线：Peck 就是「啄」。最有动作感。',
    shapes: [
      ['acc', '<polygon points="26,41 21,21 42,31"/>'],
      ['main', '<circle cx="40" cy="47" r="18"/>'],
      ['acc', '<polygon points="52,40 81,47 52,54"/>'],
      ['eye', '<circle cx="44" cy="42" r="3.2"/>'],
      ['mainS', '<path d="M86 36.5 L91 31.5 M87.5 47 L94.5 47 M86 57.5 L91 62.5" stroke-width="3.4" stroke-linecap="round" fill="none"/>'],
    ],
  },
  {
    id: 'I3', name: 'P 喙', d: '字母 P，圆肚子换成尖喙的形状，里面一颗眼睛。最像一个「标」，小尺寸也认得出。',
    shapes: [
      ['mainS', '<path d="M34 81 V25 H57.5 L79 40.5 L57.5 56 H34" stroke-width="10.5" stroke-linejoin="miter" stroke-miterlimit="10" fill="none"/>'],
      ['main', '<circle cx="51" cy="40.5" r="4.2"/>'],
    ],
  },
  {
    id: 'I4', name: '提示符', d: '圆头 + 「›」当喙 + 一根下划线光标，连起来读就是命令行的「›_」。',
    shapes: [
      ['main', '<circle cx="33" cy="50" r="15"/>'],
      ['eye', '<circle cx="36.5" cy="45.5" r="3"/>'],
      ['mainS', '<path d="M54 35.5 L69 50 L54 64.5" stroke-width="9" stroke-linejoin="miter" fill="none"/>'],
      ['acc', '<rect x="73" y="60" width="15" height="5.5"/>'],
    ],
  },
  {
    id: 'I5', name: '像素', d: '12 × 12 的像素啄木鸟，冠、眼、喙都是方格。和点阵终端（方向 C）是一家。',
    pixels: [
      'A...........',
      'AA..........',
      '.AAMMM......',
      '.AMMMMM.....',
      'MMMMMEMM....',
      'MMMMMMMMAAA.',
      'MMMMMMMAAAAA',
      'MMMMMMMM....',
      '.MMMMMM.....',
      '..MMMMM.....',
      '..MMMMM.....',
      '..MMMMM.....',
    ],
  },
  {
    id: 'I6', name: '信号鸟', d: '一条平平的信号线，中间升起来画出啄木鸟的侧脸，再落回去。和精密仪器（方向 A）、示波（M2）是一家。',
    shapes: [
      ['mainS', '<path d="M8 69 H31 L37 55 L34 41 L27 29 L42 33 C46 31.5 49 31 53 31 C58 31 62 33.5 64.5 37.5 L89 46 L64.5 50.5 C62.5 55.5 61 61 61 69 H92" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" fill="none"/>'],
      ['main', '<circle cx="51" cy="41.5" r="3.4"/>'],
    ],
  },
];
ICONS[4].d = '12 × 12 的像素啄木鸟，冠、眼、喙都是方格。和点阵终端（方向 C）是一家。';

const ROLE = {
  dark: { main: '#00E5FF', acc: '#B9F7FF', eye: '#061014' },
  light: { main: '#0A1418', acc: '#00C8E0', eye: '#F4F8F9' },
  tmplL: { main: '#111111', acc: '#111111', eye: '#E9E9E9' },
  tmplD: { main: '#F2F2F2', acc: '#F2F2F2', eye: '#252525' },
};

function glyph(ic, mode) {
  const c = ROLE[mode];
  if (ic.pixels) {
    const map = { M: c.main, A: c.acc, E: c.eye };
    let out = '';
    ic.pixels.forEach((row, y) => row.split('').forEach((ch, x) => {
      if (ch !== '.') out += `<rect x="${20 + x * 5}" y="${20 + y * 5}" width="5.1" height="5.1" fill="${map[ch]}"/>`;
    }));
    return `<g shape-rendering="crispEdges">${out}</g>`;
  }
  return ic.shapes.map(([role, s]) => {
    if (role === 'mainS') return s.replace('<path', `<path stroke="${c.main}"`);
    return s.replace(/^<(\w+)/, `<$1 fill="${c[role]}"`);
  }).join('');
}

function appIcon(ic, mode, size, cls = '') {
  const bg = mode === 'dark' ? 'url(#pkBgD)' : 'url(#pkBgL)';
  const rim = mode === 'dark' ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.08)';
  const glow = mode === 'dark' && size >= 64 ? '<rect x="0" y="0" width="100" height="100" rx="22.4" fill="url(#pkGlow)"/>' : '';
  const filt = mode === 'dark' && size >= 64 ? ' filter="url(#pkSoft)"' : '';
  return `<svg class="ai ${cls}" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${ic.id} ${ic.name}"><rect x="0" y="0" width="100" height="100" rx="22.4" fill="${bg}"/>${glow}<g${filt}>${glyph(ic, mode)}</g><rect x=".4" y=".4" width="99.2" height="99.2" rx="22" fill="none" stroke="${rim}" stroke-width=".8"/></svg>`;
}

function tmpl(ic, mode, state) {
  // 菜单栏模板图：单色，眼睛挖空；在跑多一个点，等你多一个问号
  const c = mode === 'tmplL' ? '#111111' : '#F2F2F2';
  const badge = state === 'run'
    ? `<circle class="pulse" cx="88" cy="84" r="11" fill="${c}"/>`
    : state === 'ask'
      ? `<circle cx="86" cy="82" r="15" fill="${c}"/><path d="M80.5 77 a5.5 5.5 0 1 1 7.8 5 c-1.8 1 -2.3 2 -2.3 4" stroke="${mode === 'tmplL' ? '#E9E9E9' : '#252525'}" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="86" cy="91.5" r="2" fill="${mode === 'tmplL' ? '#E9E9E9' : '#252525'}"/>`
      : '';
  const mask = `m${ic.id}${mode}${state}`;
  return `<svg width="20" height="20" viewBox="0 0 100 100" aria-hidden="true"><defs><mask id="${mask}"><rect width="100" height="100" fill="#fff"/>${state !== 'idle' ? '<circle cx="86" cy="83" r="19" fill="#000"/>' : ''}</mask></defs><g mask="url(#${mask})" transform="translate(50 50) scale(1.25) translate(-50 -50)">${glyph(ic, mode)}</g>${badge}</svg>`;
}

const CSS = `
.ib{width:1280px;height:800px;box-sizing:border-box;padding:30px 36px 34px;background:#0E1114;color:#E8EEF1;font-family:${SANS};font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased;display:flex;flex-direction:column;gap:18px}
.ib *{box-sizing:border-box}.ib p,.ib h1{margin:0}
.top{display:flex;align-items:baseline;gap:16px}
.top h1{font-size:20px;font-weight:600;letter-spacing:-.01em}
.top p{color:#8A979E}
.grid{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:16px;min-height:0}
.cell{border-radius:14px;background:#13181C;box-shadow:inset 0 0 0 1px #1E262C;padding:18px;display:grid;grid-template-columns:128px minmax(0,1fr);grid-template-rows:auto 1fr;gap:12px 18px;min-height:0}
.big{grid-row:1 / span 2;display:flex;flex-direction:column;gap:12px}
.big .ai{filter:drop-shadow(0 10px 24px rgba(0,0,0,.55))}
.nm b{font-size:17px;font-weight:600}
.nm b span{font-family:${MONO};font-size:13px;color:#6F7E86;margin-right:8px;font-weight:500}
.nm p{margin-top:4px;font-size:12px;color:#97A5AC;line-height:1.6}
.sz{display:flex;align-items:flex-end;gap:10px;margin-top:2px}
.cap{font-size:11px;color:#6F7E86;margin-top:4px}
.sz .ai{display:block}
.sz span{display:block;font-family:${MONO};font-size:10px;color:#6F7E86;text-align:center;margin-top:4px}
.mbar{display:flex;flex-direction:column;gap:6px;align-self:end}
.strip{display:flex;align-items:center;gap:14px;height:28px;padding:0 12px;border-radius:7px}
.strip.l{background:#E9E9E9;color:#111}
.strip.d{background:#252525;color:#F2F2F2}
.strip svg{display:block}
.strip em{font-style:normal;font-size:10.5px;opacity:.6;margin-left:auto;font-family:${MONO}}
.pulse{animation:pl 1.6s ease-in-out infinite;transform-origin:88px 84px}
@keyframes pl{50%{opacity:.25}}
@media (prefers-reduced-motion:reduce){.ib *{animation:none!important}}
`;

const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="pkBgD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18222A"/><stop offset="1" stop-color="#05080B"/></linearGradient>
<linearGradient id="pkBgL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E2E9EC"/></linearGradient>
<radialGradient id="pkGlow" cx=".5" cy=".46" r=".5"><stop offset="0" stop-color="#00E5FF" stop-opacity=".16"/><stop offset="1" stop-color="#00E5FF" stop-opacity="0"/></radialGradient>
<filter id="pkSoft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow in="SourceGraphic" dx="0" dy="0" stdDeviation="1.8" flood-color="#00E5FF" flood-opacity=".5"/></filter>
</defs></svg>`;

export function boards() {
  const cells = ICONS.map((ic) => `<div class="cell">
  <div class="big">${appIcon(ic, 'dark', 128)}</div>
  <div class="nm"><b><span>${ic.id}</span>${ic.name}</b><p>${ic.d}</p></div>
  <div class="mbar">
    <div class="sz"><div>${appIcon(ic, 'dark', 64)}<span>64</span></div><div>${appIcon(ic, 'light', 64)}<span>浅色</span></div><div>${appIcon(ic, 'dark', 32)}<span>32</span></div><div>${appIcon(ic, 'dark', 16)}<span>16</span></div></div>
    <p class="cap">菜单栏模板图：空闲 · 在跑 · 等你</p>
    <div class="strip l">${tmpl(ic, 'tmplL', 'idle')}${tmpl(ic, 'tmplL', 'run')}${tmpl(ic, 'tmplL', 'ask')}<em>浅色</em></div>
    <div class="strip d">${tmpl(ic, 'tmplD', 'idle')}${tmpl(ic, 'tmplD', 'run')}${tmpl(ic, 'tmplD', 'ask')}<em>深色</em></div>
  </div>
</div>`).join('');
  const body = `<div class="ib">${DEFS}
  <div class="top"><h1>App 图标</h1><p>六个方向，都保留「啄木鸟 + 青色 + 深底」。每格：大图、64 深浅两版、32、16，下面是菜单栏的单色模板图三态。</p></div>
  <div class="grid">${cells}</div>
</div>`;
  const html = board({ title: 'App 图标 · 六个方向', css: CSS, body, logic: 'renderVals() { return {}; }' });
  return [{ file: 'S1-Icon.dc.html', x: 2720, y: 920, title: 'App 图标 · I1–I6', html }];
}
