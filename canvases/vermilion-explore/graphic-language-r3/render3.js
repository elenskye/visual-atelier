const fs = require('fs'), path = require('path');
const { svg, THEMES } = require('./render');
const R = require('./e3');
const T = {
  light: { ...THEMES.light, pBack: THEMES.light.cool, pFront: THEMES.light.line, tpl: '#000' },
  dark: { ...THEMES.dark, pBack: THEMES.dark.surface, pFront: THEMES.dark.line, tpl: '#000' },
};
// 暗色、放在表面底上：纸片退一层
const Tsurf = { light: T.light, dark: { ...T.dark, pBack: THEMES.dark.cool } };
// brush 的颜色由 svg() 固定取 accent；菜单栏模板要黑色
const tplTheme = { ...T.light, accent: '#000', pBack: '#000' };
const out = path.join(__dirname, 'out3'); fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
const files = []; const put = (n, s) => { fs.writeFileSync(path.join(out, 'assets', n), s); files.push('assets/' + n); };
for (const tn of ['light', 'dark']) {
  const a = R.icons64(), b = R.icons24();
  for (const [k] of R.CATS) { put(`r3-${k}-64-${tn}.svg`, svg(a[k], [64, 64], { theme: T[tn] })); put(`r3-${k}-24-${tn}.svg`, svg(b[k], [64, 64], { theme: T[tn] })); }
  put(`r3-deco-${tn}.svg`, svg(R.deco(), [560, 220], { theme: T[tn] }));
  put(`r3-og-${tn}.svg`, svg(R.og(), [1200, 630], { theme: T[tn] }));
  put(`r3-empty-${tn}.svg`, svg(R.empty(), [320, 200], { theme: Tsurf[tn] }));
  put(`r3-ppt-cover-${tn}.svg`, svg(R.pptCover(), [1920, 1080], { theme: T[tn] }));
  put(`r3-ppt-section-${tn}.svg`, svg(R.pptSection(), [1920, 1080], { theme: T[tn] }));
  put(`r3-appicon-${tn}.svg`, svg(R.appIcon(), [1024, 1024], { theme: tn === 'light' ? { ...T.light, pBack: THEMES.light.cool } : { ...T.dark, pBack: THEMES.dark.surface } }));
  const m = R.modules();
  for (const [id, v] of Object.entries(m)) put(`r3-mod-${id}-${tn}.svg`, svg(v.els, [64, 64], { theme: T[tn] }));
}
put('r3-tray-idle.svg', svg(R.tray('idle'), [64, 64], { theme: tplTheme }));
put('r3-tray-ready.svg', svg(R.tray('ready'), [64, 64], { theme: tplTheme }));
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(files, null, 1));
// 预览
const row = (bg, inner) => `<div style="background:${bg};padding:14px 20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">${inner}</div>`;
let h = '<html><body style="margin:0;font-family:sans-serif">';
for (const tn of ['light', 'dark']) {
  const th = T[tn];
  h += row(th.page, R.CATS.map(([k]) => `<img src="assets/r3-${k}-64-${tn}.svg" width="64"><img src="assets/r3-${k}-24-${tn}.svg" width="24">`).join('') + `<img src="assets/r3-deco-${tn}.svg" width="280"><img src="assets/r3-og-${tn}.svg" width="240"><img src="assets/r3-empty-${tn}.svg" width="160" style="background:${th.surface}">`);
  h += row(th.page, `<img src="assets/r3-ppt-cover-${tn}.svg" width="480" style="outline:1px solid ${th.line}"><img src="assets/r3-ppt-section-${tn}.svg" width="480" style="outline:1px solid ${th.line}"><div style="width:200px;height:200px;border-radius:44px;overflow:hidden;background:${tn === 'light' ? th.surface : th.page}"><img src="assets/r3-appicon-${tn}.svg" width="200"></div>` + ['todo', 'books', 'finance', 'notes', 'days', 'picky'].map((id) => `<img src="assets/r3-mod-${id}-${tn}.svg" width="56"><img src="assets/r3-mod-${id}-${tn}.svg" width="20">`).join(''));
}
h += row('#ddd', `<img src="assets/r3-tray-idle.svg" width="22"><img src="assets/r3-tray-ready.svg" width="22"><img src="assets/r3-tray-idle.svg" width="64"><img src="assets/r3-tray-ready.svg" width="64">`);
fs.writeFileSync(path.join(out, 'preview.html'), h + '</body></html>');
console.log(files.length);
