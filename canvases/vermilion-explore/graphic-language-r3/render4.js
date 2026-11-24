const fs = require('fs'), path = require('path');
const { svg, THEMES } = require('./render');
const R = require('./e3');
const T = {
  light: { ...THEMES.light, pBack: THEMES.light.cool, pFront: THEMES.light.line },
  dark: { ...THEMES.dark, pBack: THEMES.dark.surface, pFront: THEMES.dark.line },
};
const Tsurf = { light: T.light, dark: { ...T.dark, pBack: THEMES.dark.cool } };
const INKS = ['clean', 'split', 'bristle', 'bristleLight', 'press'];
const out = path.join(__dirname, 'out4'); fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
const files = []; const put = (n, s) => { fs.writeFileSync(path.join(out, 'assets', n), s); files.push('assets/' + n); };
for (const ink of INKS) { R.setInk(ink); for (const tn of ['light', 'dark']) {
  put(`f-${ink}-deco-${tn}.svg`, svg(R.deco(), [560, 220], { theme: T[tn] }));
  put(`f-${ink}-og-${tn}.svg`, svg(R.og(), [1200, 630], { theme: T[tn] }));
  put(`f-${ink}-ppt-${tn}.svg`, svg(R.pptCover(), [1920, 1080], { theme: T[tn] }));
  put(`f-${ink}-empty-${tn}.svg`, svg(R.empty(), [320, 200], { theme: Tsurf[tn] }));
} }
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(files, null, 1));
let h = '<html><body style="margin:0;font-family:sans-serif">';
for (const tn of ['light', 'dark']) for (const ink of INKS) h += `<div style="background:${T[tn].page};padding:10px 16px;display:flex;gap:14px;align-items:center"><b style="width:60px;color:${T[tn].text}">${ink}</b><img src="assets/f-${ink}-deco-${tn}.svg" width="420"><img src="assets/f-${ink}-ppt-${tn}.svg" width="420" style="outline:1px solid ${T[tn].line}"><div style="width:420px;height:200px;overflow:hidden;position:relative;outline:1px solid ${T[tn].line}"><img src="assets/f-${ink}-ppt-${tn}.svg" style="position:absolute;width:1680px;left:-1100px;top:-735px"></div></div>`;
fs.writeFileSync(path.join(out, 'preview.html'), h + '</body></html>');
console.log(files.length);
