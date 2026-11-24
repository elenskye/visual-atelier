// 第 1 步 · 第二轮 · 还没定的四个细节：角、底纹、发光、点阵字用到哪。一次只变一项，三格，中间是推荐。
import { board, themeProp, MONO, DOTS, KIT, themeCss, px, blocks, FLIP } from './kit.mjs';

const ROWS = [
  { k: '角', d: '模块、按钮、标签的四个角', opts: [['c-sq', '方角', '最干净，但少了像素味'], ['c-step', '像素阶梯角', '两级台阶，像放大的像素'], ['c-brk', '方括号角', '只描四个角，第一轮 C 的做法']] },
  { k: '底纹', d: '窗口最底下那层', opts: [['bg-flat', '纯色', '最安静'], ['bg-dots', 'LED 点阵孔', '8 像素一颗，很淡'], ['bg-scan', '扫描线', '老显示器的横纹']] },
  { k: '发光', d: '青色的字、进度块、在跑的点（浅色里都不发光）', opts: [['g-0', '不发光', '只靠颜色本身'], ['g-1', '轻', '一圈很窄的光'], ['g-2', '强', '像老 CRT 屏的光晕']] },
  { k: '点阵字用到哪', d: 'Doto 点阵字只有英文和数字', opts: [['f-1', '只用在计时', '其他数字用等宽字'], ['f-2', '计时和计数', '计时、文件数、项目数'], ['f-3', '标签和按钮也用', '标签和按钮要改成英文大写']] },
];

const CSS = `
.pk.dm{width:1280px;height:800px;padding:26px 34px 30px;display:flex;flex-direction:column;gap:14px}
.top{display:flex;align-items:baseline;gap:16px}
.top h1{font-size:20px;font-weight:600}
.top p{font-size:13px;color:var(--tx2)}
.rows{flex:1;display:grid;grid-template-rows:repeat(4,minmax(0,1fr));gap:12px;min-height:0}
.drow{display:grid;grid-template-columns:150px repeat(3,minmax(0,1fr));gap:14px;min-height:0}
.rk{display:flex;flex-direction:column;justify-content:center;gap:4px}
.rk b{font-size:16px;font-weight:600}
.rk span{font-size:12px;color:var(--tx2);line-height:1.5}
.cell{position:relative;display:flex;flex-direction:column;gap:6px;padding:8px 12px 10px;background:var(--bg);box-shadow:inset 0 0 0 1px var(--line);min-height:0;overflow:hidden}
.ch{display:flex;align-items:baseline;gap:8px;font-size:12.5px;white-space:nowrap}
.ch b{font-weight:600}
.ch span{color:var(--tx3);overflow:hidden;text-overflow:ellipsis}
.ch .tag{margin-left:auto}
.mini{padding:8px 12px 10px}
.mini .ml{margin-bottom:2px}
.mrow{display:flex;align-items:baseline;gap:10px}
.mrow b{font-family:${MONO};font-weight:500;font-size:13px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.clk{font-family:${DOTS};font-weight:900;font-size:27px;line-height:1;color:var(--cy-tx);text-shadow:var(--tglow)}
.mini .blocks{grid-template-columns:repeat(20,minmax(0,1fr));margin:6px 0 8px}
.mini .blocks i{height:10px}
.mact{display:flex;align-items:center;gap:8px}
.mact .btn{height:28px;padding:0 10px;font-size:12px}
.mact .chip{height:26px}
.mact .cnt{margin-left:auto;font-family:${DOTS};font-weight:900;font-size:18px;color:var(--tx2)}
.tk{display:none;position:absolute;width:9px;height:9px;border:0 solid var(--line2)}
.tk.tl{left:0;top:0;border-left-width:2px;border-top-width:2px}.tk.tr{right:0;top:0;border-right-width:2px;border-top-width:2px}
.tk.bl{left:0;bottom:0;border-left-width:2px;border-bottom-width:2px}.tk.br{right:0;bottom:0;border-right-width:2px;border-bottom-width:2px}
.mod.run .tk{border-color:var(--cy)}
.lt .mod.run .tk{border-color:var(--blk-ln)}
/* 角 */
.c-sq .mod,.c-sq .mod:before,.c-sq .btn,.c-sq .btn:before,.c-sq .chip,.c-sq .chip:before{clip-path:none}
.c-brk .mod{clip-path:none;background:transparent}
.c-brk .mod:before{inset:0;clip-path:none}
.c-brk .tk{display:block}
.c-brk .btn,.c-brk .btn:before,.c-brk .chip,.c-brk .chip:before{clip-path:none}
/* 底纹 */
.bg-dots{background-image:radial-gradient(circle at 1.5px 1.5px,var(--grid) 1.1px,transparent 1.6px);background-size:8px 8px}
.bg-scan{background-image:repeating-linear-gradient(0deg,var(--scanl) 0 1px,transparent 1px 3px)}
.dk{--scanl:rgba(150,170,255,.07)}.lt{--scanl:rgba(20,30,90,.06)}
.bg-scan .mod:before{background:var(--pane) repeating-linear-gradient(0deg,var(--scanl) 0 1px,transparent 1px 3px)}
/* 发光 */
.g-0{--glow:none;--tglow:none;--dglow:none}
.dk .g-0 .blocks i.f,.dk .g-0 .blocks i.h{box-shadow:none}
.dk .g-2{--glow:0 0 16px rgba(0,229,255,.85);--tglow:0 0 26px rgba(0,229,255,.75),0 0 6px rgba(0,229,255,1);--dglow:0 0 8px rgba(0,229,255,1)}
.dk .g-2 .blocks i.f,.dk .g-2 .blocks i.h{box-shadow:0 0 12px rgba(0,229,255,.85)}
.dk .g-2 .btn.pri{text-shadow:0 0 6px rgba(0,229,255,.9)}
.dk .g-2 .mrow b{text-shadow:0 0 8px rgba(232,236,255,.35)}
/* 点阵字 */
.f-1 .clk{font-family:${MONO};font-weight:500;font-size:24px}
.f-1 .ml .n,.f-1 .cnt{font-family:${MONO};font-weight:500;font-size:13px}
.f-3 .ml .l,.f-3 .btn,.f-3 .chip{font-family:${DOTS};font-weight:900;letter-spacing:.08em}
.f-3 .ml .l{font-size:14px}
.f-3 .btn,.f-3 .chip{font-size:14px}
.f-3 .mrow b{font-family:${DOTS};font-weight:900;font-size:15px;letter-spacing:.04em}
`;

const DEF = { c: 'c-step', bg: 'bg-dots', g: 'g-1', f: 'f-2' };

function mini(v) {
  const en = v.f === 'f-3';
  const ticks = '<i class="tk tl"></i><i class="tk tr"></i><i class="tk bl"></i><i class="tk br"></i>';
  return `<div class="${v.c} ${v.g} ${v.f}"><div class="mod run mini">${ticks}<p class="ml"><span class="l">${en ? 'RUNNING' : '正在做'}</span><span class="r n">3/4</span></p>
  <div class="mrow"><b>${en ? 'GROK · PNPM CHECK' : 'Grok 跑 pnpm check'}</b><span class="clk">02:14</span></div>
  ${blocks(20, 12, 'blocks')}
  <div class="mact"><button type="button" class="btn pri">${en ? 'SEND' : '发送'}${px('send')}</button><span class="chip on">${en ? 'MUSE→GROK' : 'Muse → Grok'}</span><span class="cnt">4</span></div>
</div></div>`;
}

function body() {
  const rows = ROWS.map((r, ri) => {
    const cells = r.opts.map(([cls, name, desc], oi) => {
      const v = { ...DEF };
      if (ri === 0) v.c = cls; if (ri === 1) v.bg = cls; if (ri === 2) v.g = cls; if (ri === 3) v.f = cls;
      return `<div class="cell ${v.bg}"><p class="ch"><b>${name}</b><span>${desc}</span>${oi === 1 ? '<em class="tag rec">推荐</em>' : ''}</p>${mini(v)}</div>`;
    }).join('');
    return `<div class="drow"><div class="rk"><b>${r.k}</b><span>${r.d}</span></div>${cells}</div>`;
  }).join('');
  return `<div class="{{root}}">
  <div class="top"><h1>还没定的四个细节</h1><p>一次只变一项，其他三项都用推荐那格（中间）。每行挑一格。</p></div>
  <div class="rows">${rows}</div>
</div>`;
}

export function boards() {
  const def = FLIP ? '浅色' : '深色';
  const logic = `renderVals() { return { root: 'pk dm ' + ((this.props.theme ?? '${def}') === '深色' ? 'dk' : 'lt') }; }`;
  const html = board({ title: '还没定的四个细节', css: `${KIT}\n${themeCss('pk')}\n${CSS}`, body: body(), props: themeProp(def), logic });
  return [{ file: 'S1b-Dims.dc.html', x: 2720, y: 0, title: '还没定的四个细节 · 角、底纹、发光、点阵字', html }];
}
