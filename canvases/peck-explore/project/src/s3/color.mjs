// 第 3 步 · 色板（明暗定值）和对比度（APCA）两张板。值都从 tokens.mjs 取。
import { board, PROPS, SANS, DOTS, FLIP, px } from '../s1c/kit.mjs';
import { CSS as PROTO } from '../s2/proto.mjs';
import { GROUPS, ROLES, FROM, NEW, CHECK, LEVELS, themeCss, val } from './tokens.mjs';

const D = `font-family:${DOTS};font-weight:900`;
export const BASE = `
.doc{font-family:${SANS};color:var(--tx)}
.ft{display:flex;align-items:baseline;gap:18px}
.ft h1{font-size:22px;font-weight:600;white-space:nowrap}
.ft p{font-size:13px;color:var(--tx2)}
.ft .lg{margin-left:auto;display:flex;gap:14px;align-items:center;font-size:12.5px;color:var(--tx2);white-space:nowrap}
.tg2{display:inline-flex;align-items:center;height:18px;padding:0 5px;${D};font-size:12px;letter-spacing:.06em;clip-path:var(--notch);white-space:nowrap}
.tg2.new{background:var(--ok);color:var(--bg)}
.tg2.chg{background:var(--warn);color:var(--bg)}
.tg2.id{background:var(--raise);color:var(--tx2)}
.tg2.ok{background:var(--ok-soft);color:var(--ok);box-shadow:inset 0 0 0 1px var(--ok)}
.tg2.no{background:var(--bad-soft);color:var(--bad);box-shadow:inset 0 0 0 1px var(--bad)}
`;
const rootLogic = (cls, def) => `renderVals() { const dark = (this.props.theme ?? '${def}') === '深色'; return { root: '${cls} ' + (dark ? 'dk' : 'lt') }; }`;
export const themeProps = (def) => PROPS.theme(def);

// ---------- 色板 ----------
const COLOR_CSS = `
.pk.cb3{width:1760px;height:1140px;padding:30px 40px 32px;display:flex;flex-direction:column;gap:18px}
.modes{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:24px;min-height:0}
.mode{position:relative;isolation:isolate;display:flex;flex-direction:column;gap:12px;padding:18px 22px 20px;clip-path:var(--clip);background:var(--line);color:var(--tx)}
.mode:before{content:"";position:absolute;inset:1px;clip-path:var(--clip);background:var(--bg);background-image:radial-gradient(circle at 1.5px 1.5px,var(--grid) 1.1px,transparent 1.6px);background-size:8px 8px;z-index:-1}
.mh{display:flex;align-items:baseline;gap:12px}
.mh b{${D};font-size:22px;letter-spacing:.1em;color:var(--cy-tx);text-shadow:var(--dglow)}
.mh span{font-size:12.5px;color:var(--tx2)}
.sub{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:16px;min-height:0}
.gcol{display:flex;flex-direction:column;gap:12px}
.grp{padding:10px 12px 8px}
.grp .gh{display:flex;align-items:baseline;gap:8px;margin-bottom:4px}
.grp .gh b{${D};font-size:13px;letter-spacing:.1em;color:var(--tx2)}
.grp .gh span{font-size:12px;color:var(--tx3)}
.sw{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;padding:3px 0;border-top:1px dotted var(--line2)}
.sw:first-of-type{border-top:0}
.chipc{position:relative;width:34px;height:26px;clip-path:var(--clip2);box-shadow:inset 0 0 0 1px var(--line2)}
.chipc.al{background-image:linear-gradient(var(--c),var(--c)),linear-gradient(var(--bg),var(--bg))}
.sw .t{min-width:0}
.sw .t p{display:flex;align-items:center;gap:7px;white-space:nowrap;line-height:17px}
.sw .t b{font-size:12.5px;font-weight:600}
.sw .t .code{color:var(--tx2)}
.sw .t .u{font-size:12px;line-height:16px;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sw .hx{display:flex;flex-direction:column;align-items:flex-end;gap:1px;font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx)}
.sw .hx s{color:var(--tx3)}
.sw.chg .chipc{box-shadow:inset 0 0 0 1px var(--warn)}
`;
function swatch(id, mode) {
  const r = ROLES[id], v = r[mode], alpha = v.startsWith('rgba');
  const old = FROM[id]?.[mode];
  const tag = old ? '<em class="tg2 chg">CHG</em>' : NEW.includes(id) ? '<em class="tg2 new">NEW</em>' : '';
  const shown = alpha ? v.replace(/\s/g, '') : v;
  return `<div class="sw${old ? ' chg' : ''}"><i class="chipc${alpha ? ' al' : ''}" style="${alpha ? `--c:${v}` : `background:${v}`}"></i>
    <div class="t"><p><b>${r.name}</b><span class="code">${id}</span>${tag}</p><p class="u">${r.use}</p></div>
    <p class="hx"><span>${shown}</span>${old ? `<s>${old.replace(/\s/g, '')}</s>` : ''}</p></div>`;
}
function colorBoard() {
  const def = FLIP ? '浅色' : '深色';
  const cols = [['BASE', 'TEXT', 'CYAN'], ['STATE', 'WHO']];
  const grp = (k, mode) => { const g = GROUPS.find((x) => x.k === k); return `<div class="mod grp"><p class="gh"><b>${k}</b><span>${g.name}</span></p>${g.roles.map(([id]) => swatch(id, mode)).join('')}</div>`; };
  const mode = (m, cls, name, note) => `<section class="mode ${cls}"><p class="mh"><b>${name}</b><span>${note}</span></p>
    <div class="sub">${cols.map((c) => `<div class="gcol">${c.map((k) => grp(k, m)).join('')}</div>`).join('')}</div></section>`;
  const nChg = Object.keys(FROM).length;
  const body = `<div class="{{root}}"><div class="ft"><h1>色板 · 明暗定值</h1><p>34 个角色，深浅各一套。深色为过 APCA 改了 ${nChg} 处（橙框，下面划掉的是原来的值）；新加 4 个角色给悬停和红底按钮。</p>
    <p class="lg"><em class="tg2 chg">CHG</em>为过 APCA 改的<em class="tg2 new">NEW</em>这一轮新加的</p></div>
    <div class="modes">${mode('dark', 'dk', 'DARK', '深色 · P3 深海，青色发光')}${mode('light', 'lt', 'LIGHT', '浅色 · L2 深青，没有发光')}</div></div>`;
  const html = board({ title: '色板 · 明暗定值', css: `${PROTO}\n${BASE}\n${COLOR_CSS}\n${themeCss()}`, body, props: themeProps(def), logic: rootLogic('pk cb3 doc dots', def), w: 1760, h: 1140 });
  return { file: 'S3-Color.dc.html', w: 1760, h: 1140, title: '色板 · 34 个角色的明暗定值', html };
}

// ---------- 对比度 ----------
const CON_CSS = `
.pk.ct3{width:1280px;height:900px;padding:26px 32px 28px;display:flex;flex-direction:column;gap:14px}
.cg{flex:1;display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:16px;min-height:0}
.tbl{padding:12px 16px 10px}
.tt5{width:100%;border-collapse:collapse;font-size:12px}
.tt5 th{text-align:left;font-weight:400;color:var(--tx3);padding:0 8px 6px 0;white-space:nowrap}
.tt5 th.n,.tt5 td.n{text-align:right}
.tt5 td{padding:1px 8px 1px 0;border-top:1px dotted var(--line2);color:var(--tx2);white-space:nowrap;line-height:16px}
.tt5 td.u{color:var(--tx)}
.tt5 td .code{color:var(--tx2)}
.tt5 td.n{${D};font-size:13px;color:var(--tx)}
.tt5 .tg2{height:16px}
.tt5 td.n s{${D};font-size:12px;color:var(--bad);margin-right:6px;text-decoration:line-through}
.tt5 td.mn{${D};font-size:13px;color:var(--tx3);text-align:right}
.tt5 tr.k td{border-top:1px solid var(--line2)}
.rc{display:flex;flex-direction:column;gap:14px;min-width:0}
.lv li{display:grid;grid-template-columns:34px minmax(0,1fr);gap:8px;padding:3px 0;font-size:12px;color:var(--tx2);border-top:1px dotted var(--line2)}
.lv li:first-child{border-top:0}
.lv b{${D};font-size:14px;color:var(--cy-tx)}
.ba{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.bx{position:relative;isolation:isolate;display:flex;flex-direction:column;gap:6px;padding:10px 12px 12px;clip-path:var(--clip2);background:var(--line)}
.bx:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.bx .h{${D};font-size:12px;letter-spacing:.1em;color:var(--tx3)}
.bx .nm2{font-family:var(--f-name);font-size:var(--fs-name);line-height:18px;color:var(--tx)}
.bx .s2{font-size:12.5px;line-height:1.5;color:var(--tx2)}
.bx .s3{font-size:12px;line-height:1.5;color:var(--tx3)}
.bx .rw{display:flex;align-items:center;gap:6px}
.bx .er{font-size:12.5px;color:var(--bad)}
.bx .chip{height:24px;padding:0 8px;font-size:12px}
.nt3{font-size:12px;line-height:1.55;color:var(--tx3)}
`;
function contrastBoard() {
  const def = FLIP ? '浅色' : '深色';
  let prev = '';
  const rows = CHECK.map((c) => {
    const k = c.use !== prev; prev = c.use;
    const n = (m) => `<td class="n">${c[m + 'Old'] != null ? `<s>${c[m + 'Old']}</s>` : ''}${c[m]}</td>`;
    return `<tr class="${k ? 'k' : ''}"><td class="u">${k ? c.use : ''}</td><td><span class="code">${c.fg}</span></td><td><span class="code">${c.bg}</span></td><td class="mn">${c.min}</td>${n('dark')}${n('light')}<td>${c.pass ? '<em class="tg2 ok">PASS</em>' : '<em class="tg2 no">FAIL</em>'}</td></tr>`;
  }).join('');
  const nPass = CHECK.filter((c) => c.pass).length;
  const lv = LEVELS.map(([n, t]) => `<li><b>${n}</b><span>${t}</span></li>`).join('');
  // 改之前 / 改之后：同一块东西，深色
  const sample = (h) => `<div class="bx"><p class="h">${h}</p><p class="nm2">把设置里三个对话框合成一个面板</p><p class="s2">Muse → Grok · EDIT · 14:02 开始</p><p class="s3">在 ~/code/weather-cli 里跑</p>
    <p class="rw"><em class="tag del">DEL</em><span class="er">删了 2 个旧文件</span></p><p class="rw"><span class="chip">MUSE</span><span class="chip">GROK</span></p></div>`;
  const body = `<div class="{{root}}"><div class="ft"><h1>对比度 · APCA</h1><p>${CHECK.length} 对，深浅两种都算：${nPass} 对过。划掉的红数是改之前的 Lc。半透明的角色先在模块面上混成实色再算。</p></div>
    <div class="cg"><div class="mod tbl"><table class="tt5"><tr><th>用在哪</th><th>字 / 图形</th><th>底</th><th class="n">要</th><th class="n">深色</th><th class="n">浅色</th><th></th></tr>${rows}</table></div>
      <div class="rc"><div class="mod"><p class="ml"><span class="l">LEVELS</span><span class="r">Lc 门槛</span></p><ul class="lv">${lv}</ul>
        <p class="nt3" style="margin-top:8px">Peck 的字只有 12–12.5 号，门槛比 Vermilion 的 75 / 60 高。模块外框（line）是装饰：模块靠面色和点阵分开，不查。</p></div>
        <div class="mod"><p class="ml"><span class="l">DARK</span><span class="r">改之前 / 改之后</span></p>
          <div class="ba"><div class="dk old">${sample('BEFORE')}</div><div class="dk">${sample('AFTER')}</div></div>
          <p class="nt3" style="margin-top:8px">说明字、提示字、红字、控件边亮了一档；正文和青色没动。</p></div></div></div></div>`;
  const css = `${PROTO}\n${BASE}\n${CON_CSS}\n${themeCss()}\n${themeCss({ dark: '.dk.old', light: '.lt.old' }, true)}`;
  const html = board({ title: '对比度 · APCA', css, body, props: themeProps(def), logic: rootLogic('pk ct3 doc dots', def), h: 900 });
  return { file: 'S3-Contrast.dc.html', h: 900, title: `对比度 · ${CHECK.length} 对都过 APCA`, html };
}

export function boards() {
  return [colorBoard(), contrastBoard()];
}
export { rootLogic };
