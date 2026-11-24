// Design System 的浏览页，照 Claude 的 Design System 页排：左边分节，右边一节一张卡。
// 内容来自本仓库的构建产物（/api/ds/<方案>），只看不改。
// 分节的名字和云端一样用英文（站主 2026-11-14）；颜色照云端分组（Palette、surface、accent……，见 colorGroups）；
// Files 和云端一样连资产一起数。
import { markdown } from './md.js';

const $ = (sel, root = document) => root.querySelector(sel);
const h = (tag, attrs = {}, kids = []) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(kids)) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
};

// 和云端 Design System 页的叫法一样；没列的照 token 的名字首字母大写
const FAMILY = { spacing: 'Spacing', radius: 'Corner radius', shadow: 'Shadows', width: 'Width', text: 'Text', leading: 'Leading', size: 'Size', step: 'Step', opacity: 'Opacity', zIndex: 'Z-index' };
const familyTitle = (k) => FAMILY[k] || k.charAt(0).toUpperCase() + k.slice(1);
const TILE = { l: 200, m: 150, s: 112, xs: 84 };
const kb = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);

const D = { name: null, data: null, section: 'overview', theme: null, onNav: null };

export function systemSections(data) {
  const t = data?.tokens || {};
  const fams = Object.keys(t).filter((k) => k !== 'color' && k !== 'type' && t[k] && Array.isArray(t[k].tokens) && t[k].tokens.length);
  return [
    { id: 'overview', title: 'Overview' },
    t.color?.tokens?.length && { id: 'colors', title: 'Colors', n: t.color.tokens.length },
    t.type?.groups?.length && { id: 'type', title: 'Typography', n: t.type.groups.reduce((a, g) => a + g.styles.length, 0) },
    ...fams.map((k) => ({ id: `t-${k}`, title: familyTitle(k), n: t[k].tokens.length })),
    data?.components?.length && { id: 'components', title: 'Components', n: data.components.length },
    data?.assets?.some((a) => a.files.length) && { id: 'assets', title: 'Assets', n: assetCount(data) },
    { id: 'files', title: 'Files', n: allFiles(data).length, sep: true }
  ].filter(Boolean);
}

const assetCount = (data) => (data?.assets || []).reduce((a, g) => a + g.files.length, 0);
/** Every file the Design System has, as the cloud counts them: the build's files and the assets (uploaded one by one). */
function allFiles(data) {
  const files = (data?.files || []).map((f) => ({ path: f.path, size: f.size, href: `/ds/${data.name}/${f.path}` }));
  for (const g of data?.assets || []) for (const f of g.files) files.push({ path: `assets/${g.group}/${f.name}`, size: f.size, href: `/_blob/${f.blob}`, asset: true });
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export async function openSystem(name, section, { onNav }) {
  D.onNav = onNav;
  if (D.name !== name || !D.data) {
    const r = await fetch(`/api/ds/${encodeURIComponent(name)}`);
    const body = await r.json().catch(() => ({}));
    D.name = name;
    D.data = r.ok ? body : null;
    D.error = r.ok ? null : body.error || `读不到 ${name}（${r.status}）`;
    D.theme = D.data?.tokens?.color?.themes?.[0]?.id || 'light';
    loadFonts(D.data?.fonts || []);
  }
  D.section = section || 'overview';
  $('#dsview').hidden = false;
  render();
  return D.data;
}

export function closeSystem() {
  $('#dsview').hidden = true;
  $('#ds-main').replaceChildren();
}

export function currentSystem() {
  return D.data;
}

function loadFonts(urls) {
  for (const u of urls) {
    if (document.querySelector(`link[data-ds-font="${CSS.escape(u)}"]`)) continue;
    document.head.append(h('link', { rel: 'stylesheet', href: u, 'data-ds-font': u }));
  }
}

function render() {
  const nav = $('#ds-nav');
  const main = $('#ds-main');
  if (!D.data) {
    nav.replaceChildren();
    main.replaceChildren(h('div', { class: 'ds-card' }, [h('h1', { text: 'Design System 还没准备好' }), h('p', { text: D.error }), h('p', { html: '在仓库根目录运行 <code>npm run build:ds</code>，再刷新这一页。' })]));
    return;
  }
  const secs = systemSections(D.data);
  if (!secs.some((s) => s.id === D.section)) D.section = 'overview';
  nav.replaceChildren(
    ...secs.map((s) =>
      h('button', { class: `ds-nav-item${s.id === D.section ? ' on' : ''}${s.sep ? ' gap' : ''}`, 'aria-current': s.id === D.section ? 'page' : null, onclick: () => D.onNav?.(s.id) }, [
        h('span', { text: s.title }),
        s.n ? h('span', { class: 'sub', text: String(s.n) }) : null
      ])
    )
  );
  const body = { overview, colors, type: typeSection, components, assets, files }[D.section] || (D.section.startsWith('t-') ? () => family(D.section.slice(2)) : overview);
  main.replaceChildren(body());
  main.scrollTop = 0;
}

const card = (title, kids, tools = null) => h('section', { class: 'ds-card' }, [h('div', { class: 'ds-card-head' }, [h('h1', { text: title }), tools]), ...[].concat(kids)]);
const themes = () => D.data.tokens?.color?.themes || [{ id: 'light', name: '浅色' }];

function themeSeg(onChange) {
  return h(
    'div',
    { class: 'seg', role: 'group', 'aria-label': '预览的明暗' },
    themes().map((t) => h('button', { class: t.id === D.theme ? 'on' : '', 'aria-pressed': String(t.id === D.theme), text: t.name || t.id, onclick: () => { D.theme = t.id; onChange(); } }))
  );
}

// 预览按自己的宽度排，再整体缩到放得下
function previewFrame(comp, { height = 120, width = null } = {}) {
  const box = h('div', { class: 'ds-preview' });
  const frame = h('iframe', { title: `${comp} 预览`, loading: 'lazy', src: `/ds/${D.name}/components/${comp}/preview.html?theme=${encodeURIComponent(D.theme)}` });
  box.append(frame);
  const fit = () => {
    const avail = box.clientWidth || 600;
    const w = width || Math.max(avail, 320);
    const s = Math.min(1, avail / w);
    Object.assign(frame.style, { width: `${w}px`, height: `${height}px`, transform: `scale(${s})` });
    box.style.height = `${Math.ceil(height * s)}px`;
  };
  // 标注的高度是起点，内容更高就跟着长（和 Design System 页一样），不在预览里出滚动条
  frame.addEventListener('load', () => {
    try {
      const doc = frame.contentDocument;
      doc.documentElement.style.overflow = 'hidden';
      const grow = () => {
        const need = Math.min(4000, Math.max(height, doc.documentElement.scrollHeight, doc.body?.scrollHeight || 0));
        if (need !== height) {
          height = need;
          fit();
        }
      };
      grow();
      doc.fonts?.ready.then(grow);
    } catch {}
  });
  requestAnimationFrame(fit);
  new ResizeObserver(fit).observe(box);
  return box;
}

function overview() {
  const d = D.data;
  const meta = h('div', { class: 'ds-meta' }, [
    h('span', { text: `源：schemes/${d.name}/design-system/，构建后在 dist/${d.name}/design-system/` }),
    d.cloud ? h('span', {}, ['云端：', h('a', { href: d.cloud.url, target: '_blank', rel: 'noopener', text: d.cloud.url }), d.cloud.account ? `（${d.cloud.account}）` : '']) : h('span', { text: '还没有发到云端' }),
    d.lastChange ? h('span', { text: `最近一次改动 ${String(d.lastChange.at || '').slice(0, 10)}：${d.lastChange.note || ''}` }) : null,
    d.partial ? h('span', { class: 'warn', text: `注意：${d.partial}` }) : null
  ]);
  const kids = [];
  if (d.cover) kids.push(previewFrame('Cover', { height: d.cover.height || 288, width: d.cover.width || 960 }));
  kids.push(meta, h('div', { class: 'md', html: markdown(d.readme || '') }));
  for (const s of d.sections) kids.push(h('div', { class: 'md', html: markdown(s.text || '') }));
  return h('section', { class: 'ds-card ds-overview' }, kids);
}

function resolveColor(name, theme, seen = new Set()) {
  const t = D.data.tokens.color.tokens.find((x) => x.name === name);
  if (!t || seen.has(name)) return null;
  seen.add(name);
  const first = themes()[0].id;
  const v = typeof t.value === 'string' ? t.value : t.value[theme] ?? t.value[first];
  const alias = /^\{(.+)\}$/.exec(v || '');
  return alias ? resolveColor(alias[1], theme, seen) : v;
}

/**
 * Colour tokens in groups, the way the cloud's Design System page shows them: the word after `color-` is a group
 * when some token goes on from it (color-surface-cool makes "surface", and color-surface joins it); the rest are
 * the Palette, first. Groups keep the order their first token has.
 */
export function colorGroups(tokens) {
  const words = (n) => n.replace(/^color-/, '').split('-');
  const grouped = new Set(tokens.map((t) => words(t.name)).filter((w) => w.length > 1).map((w) => w[0]));
  const groups = new Map([['Palette', []]]);
  for (const t of tokens) {
    const w = words(t.name)[0];
    const g = grouped.has(w) ? w : 'Palette';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(t);
  }
  return [...groups].filter(([, ts]) => ts.length).map(([name, ts]) => ({ name, tokens: ts }));
}

function colors() {
  const ts = themes();
  const row = (t) =>
    h('tr', {}, [
      h('td', { class: 'mono', text: t.name }),
      ...ts.map((th) => {
        const raw = typeof t.value === 'string' ? t.value : t.value[th.id];
        const v = resolveColor(t.name, th.id);
        return h('td', {}, h('span', { class: 'chip' }, [h('span', { class: 'sw', style: { background: v || 'transparent' } }), h('span', { class: 'mono', text: raw ?? `同${ts[0].name}` })]));
      }),
      h('td', { class: 'usage', text: t.usage || '' })
    ]);
  const head = () => h('thead', {}, h('tr', {}, [h('th', { text: 'Name' }), ...ts.map((th) => h('th', { text: th.name || th.id })), h('th', { text: 'Usage' })]));
  const groups = colorGroups(D.data.tokens.color.tokens).map((g) =>
    h('div', { class: 'ds-group' }, [h('h2', { text: g.name }), h('div', { class: 'ds-table' }, h('table', { class: 'colors' }, [head(), h('tbody', {}, g.tokens.map(row))]))])
  );
  return card('Colors', groups);
}

function typeSection() {
  const ty = D.data.tokens.type;
  const kids = ty.groups.map((g) =>
    h('div', { class: 'ds-group' }, [
      h('h2', { text: g.name }),
      h('div', { class: 'ds-table' }, h('table', {}, h('tbody', {}, g.styles.map((st) => {
        const famKey = st.family || g.family;
        const style = { fontFamily: ty.families[famKey] || 'inherit', fontSize: st.fontSize, lineHeight: st.lineHeight != null ? String(st.lineHeight) : null, fontWeight: st.fontWeight != null ? String(st.fontWeight) : null, letterSpacing: st.letterSpacing || null };
        const metaLine = [famKey, `${st.fontSize}${st.lineHeight != null ? ` / ${st.lineHeight}` : ''}`, st.fontWeight].filter(Boolean).join(' · ');
        return h('tr', {}, [
          h('td', { class: 'mono name', text: st.name }),
          h('td', {}, [h('div', { class: 'type-sample', style, text: st.sample || '呦呦漫游 The quick brown fox' }), h('div', { class: 'sub', text: metaLine }), st.usage ? h('div', { class: 'usage', text: st.usage }) : null])
        ]);
      }))))
    ])
  );
  const fams = h('div', { class: 'ds-group' }, [h('h2', { text: 'Font families' }), ...Object.entries(ty.families).map(([k, v]) => h('p', {}, [h('code', { text: `--font-${k}` }), ' ', h('span', { class: 'sub', text: v })]))]);
  return card('Typography', [...kids, fams]);
}

function family(key) {
  const fam = D.data.tokens[key];
  const ts = themes();
  const visual = (t) => {
    const v = typeof t.value === 'string' ? t.value : t.value[D.theme] ?? t.value[ts[0].id];
    if (key === 'spacing') return h('span', { class: 'bar', style: { width: `min(${v}, 100%)` } });
    if (key === 'radius') return h('span', { class: 'rad', style: { borderRadius: v } });
    if (key === 'shadow') return h('span', { class: 'shadow', style: { boxShadow: v } });
    if (key === 'text') return h('span', { class: 'txt', style: { fontSize: v }, text: '字 Aa' });
    return null;
  };
  const rows = fam.tokens.map((t) =>
    h('tr', {}, [
      h('td', { class: 'mono', text: t.name }),
      h('td', { class: 'mono', text: typeof t.value === 'string' ? t.value : ts.map((th) => `${th.name}：${t.value[th.id] ?? '同上'}`).join('\n') }),
      h('td', { class: 'vis' }, visual(t)),
      h('td', { class: 'usage', text: t.usage || '' })
    ])
  );
  return card(familyTitle(key), [fam.note ? h('p', { class: 'sub', text: fam.note }) : null, h('div', { class: 'ds-table' }, h('table', {}, [h('thead', {}, h('tr', {}, ['Name', 'Value', '', 'Usage'].map((x) => h('th', { text: x })))), h('tbody', {}, rows)]))]);
}

function components() {
  const groups = [];
  for (const c of D.data.components) {
    const g = c.group || '';
    let G = groups.find((x) => x.name === g);
    if (!G) groups.push((G = { name: g, items: [] }));
    G.items.push(c);
  }
  const kids = groups.map((g) =>
    h('div', { class: 'ds-group' }, [
      g.name ? h('h2', { text: g.name }) : null,
      ...g.items.map((c) =>
        h('div', { class: 'comp-row', id: `comp-${c.name}` }, [
          h('div', { class: 'comp-info' }, [
            h('div', { class: 'mono name', text: c.name }),
            c.subtitle ? h('div', { class: 'sub', text: c.subtitle }) : null,
            c.readme ? h('details', {}, [h('summary', { text: '用法' }), h('div', { class: 'md', html: markdown(c.readme.replace(/^#\s+.*\n/, '')) })]) : null
          ]),
          c.hasPreview ? previewFrame(c.name, { height: c.height || 120, width: c.width || null }) : h('div', { class: 'sub', text: '没有预览' })
        ])
      )
    ])
  );
  return card('Components', kids, themeSeg(render));
}

function assets() {
  const kids = D.data.assets.filter((g) => g.files.length).map((g) =>
    h('div', { class: 'ds-group' }, [
      h('h2', { text: `${g.group}（${g.files.length}）` }),
      g.readme ? h('details', {}, [h('summary', { text: '说明' }), h('div', { class: 'md', html: markdown(g.readme.replace(/^#\s+.*\n/, '')) })]) : null,
      h('div', { class: 'tiles', style: { '--tile': `${TILE[g.tile] || 150}px` } }, g.files.map((f) =>
        h('a', { class: 'tile', href: `/_blob/${f.blob}`, target: '_blank', rel: 'noopener', title: f.name }, [
          h('span', { class: 'thumb' }, h('img', { src: `/_blob/${f.blob}`, alt: '', loading: 'lazy' })),
          h('span', { class: 'mono name', text: f.name }),
          h('span', { class: 'sub', text: `${(f.type || '').replace('image/', '').replace('svg+xml', 'SVG').toUpperCase()} · ${kb(f.size)}` })
        ])
      ))
    ])
  );
  return card('Assets', kids);
}

function files() {
  const all = allFiles(D.data);
  const rows = all.map((f) => h('tr', {}, [h('td', {}, h('a', { class: 'mono', href: f.href, target: '_blank', rel: 'noopener', text: f.path })), h('td', { class: 'sub', text: kb(f.size) })]));
  const n = assetCount(D.data);
  return card('Files', [
    h('p', { class: 'sub', text: `构建产物 dist/<方案>/design-system/project/ 里的 ${all.length - n} 个文件，加上 Assets 里的 ${n} 张图（发到云端时一张张传成资产），一共 ${all.length} 个，和云端 Files 的数一样。云端 Files 里的 manifest.json 是它自己生成的，本地这里对应的是 design-system.json。` }),
    h('div', { class: 'ds-table' }, h('table', {}, h('tbody', {}, rows)))
  ]);
}
