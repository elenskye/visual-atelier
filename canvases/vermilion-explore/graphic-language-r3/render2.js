const fs = require('fs'), path = require('path');
const { svg, THEMES } = require('./render');
const E = require('./e2');
const T = {
  light: { ...THEMES.light, pBack: THEMES.light.cool, pFront: THEMES.light.line },
  dark: { ...THEMES.dark, pBack: THEMES.dark.surface, pFront: THEMES.dark.line },
};
const out = path.join(__dirname, 'out2'); fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
const VARS = {
  'w07': { wScale: 0.7 }, 'w10': { wScale: 1 }, 'w135': { wScale: 1.35 },
  'dry': { wScale: 1.25, ink: 'dry' }, 'simple': { simple: true },
};
const files = [];
const put = (name, s) => { fs.writeFileSync(path.join(out, 'assets', name), s); files.push('assets/' + name); };
for (const [v, o] of Object.entries(VARS)) {
  const ic = E.icons(o);
  for (const [k] of E.CATS) put(`e2-${v}-${k}.svg`, svg(ic[k], [64, 64], { theme: T.light }));
  put(`e2-${v}-deco.svg`, svg(E.deco(o), [560, 220], { theme: T.light }));
}
for (const [tn, th] of Object.entries(T)) {
  const ic = E.fusionIcons();
  for (const [k] of E.CATS) put(`ed-${k}-${tn}.svg`, svg(ic[k], [64, 64], { theme: th }));
  put(`ed-deco-${tn}.svg`, svg(E.fusionDeco(), [560, 220], { theme: th }));
  put(`ed-og-${tn}.svg`, svg(E.fusionOG(), [1200, 630], { theme: th }));
  put(`ed-empty-${tn}.svg`, svg(E.fusionEmpty(), [320, 200], { theme: tn === 'dark' ? { ...th, pBack: THEMES.dark.cool } : th }));
}
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(files, null, 1));
// 预览
let h = '<html><body style="margin:0;font-family:sans-serif">';
for (const v of Object.keys(VARS)) {
  h += `<div style="background:#f6efe2;padding:10px 24px;display:flex;gap:16px;align-items:center"><b style="width:70px">${v}</b>`;
  for (const [k] of E.CATS) h += `<div style="text-align:center"><img src="assets/e2-${v}-${k}.svg" width="72"><br><img src="assets/e2-${v}-${k}.svg" width="24"></div>`;
  h += `<img src="assets/e2-${v}-deco.svg" width="280" style="background:#fdf9f0"></div>`;
}
for (const tn of ['light', 'dark']) {
  h += `<div style="background:${T[tn].page};padding:14px 24px;display:flex;gap:16px;align-items:center"><b style="width:70px;color:${T[tn].text}">ED ${tn}</b>`;
  for (const [k] of E.CATS) h += `<div style="text-align:center"><img src="assets/ed-${k}-${tn}.svg" width="72"><br><img src="assets/ed-${k}-${tn}.svg" width="24"></div>`;
  h += `<img src="assets/ed-deco-${tn}.svg" width="280" style="background:${T[tn].surface}"><img src="assets/ed-og-${tn}.svg" width="240" style="outline:1px solid ${T[tn].line}"><img src="assets/ed-empty-${tn}.svg" width="160" style="background:${T[tn].surface}"></div>`;
}
fs.writeFileSync(path.join(out, 'preview.html'), h + '</body></html>');
console.log(files.length);
