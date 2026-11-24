// 第 2 步 · 第二轮 · 迁移测试共用的外框：顶栏、左栏、右栏的空状态、宽栏、设置行、出错模块。
// 只照 rules.mjs 里的规则画；第一轮小样的样式（../s2/proto.mjs 的 CSS）原样拿来用。
import { DOTS, px, twinkle } from '../s1c/kit.mjs';
import { CSS as PROTO } from '../s2/proto.mjs';

const D = `font-family:${DOTS};font-weight:900`;

// 8×8 像素小图标（K6），第 1 步那套之外这一轮要用的
const ICON8 = {
  gear: ['...##...', '.#.##.#.', '..####..', '###..###', '###..###', '..####..', '.#.##.#.', '...##...'],
  bars: ['......##', '......##', '...##.##', '...##.##', '##.##.##', '##.##.##', '##.##.##', '########'],
  key: ['.###....', '#...#...', '#...####', '#...#.#.', '.###..#.', '........', '........', '........'],
  plug: ['..#..#..', '..#..#..', '.######.', '.######.', '.######.', '..####..', '...##...', '...##...'],
  eye: ['........', '..####..', '.#....#.', '#..##..#', '#..##..#', '.#....#.', '..####..', '........'],
};
export const ic = (name, cls = '') => {
  const rows = ICON8[name];
  let r = '';
  rows.forEach((row, y) => { for (let x = 0; x < 8;) { if (row[x] !== '#') { x++; continue; } let e = x; while (e < 8 && row[e] === '#') e++; r += `<rect x="${x}" y="${y}" width="${e - x}" height="1"></rect>`; x = e; } });
  return `<svg class="px${cls ? ' ' + cls : ''}" viewBox="0 0 8 8" aria-hidden="true" shape-rendering="crispEdges">${r}</svg>`;
};

export const CSS = `${PROTO}
/* T5：字号不小于 12（把第一轮里 11.5 的都提到 12） */
.tr .tt em,.last,.lfoot,.log li span.a,.msg .mm,.keys,.note,.snap,.empty{font-size:12px}
/* 顶栏：额度与花费的入口（L3） */
.qb{position:relative;isolation:isolate;display:flex;align-items:center;gap:7px;height:34px;padding:0 10px;clip-path:var(--clip2);background:var(--line2);color:var(--tx2);${D};font-size:14px;letter-spacing:.04em}
.qb:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.qb.on,.ib.on{background:var(--cy-ol);color:var(--cy-tx)}
.qb.on:before,.ib.on:before{background:linear-gradient(var(--cy-soft),var(--cy-soft)),var(--pane)}
/* 宽栏（L6） */
.grid.wide{grid-template-columns:288px minmax(0,1fr)}
.ml .cl{margin-left:12px;height:26px;padding:0 8px;font-size:13px}
.ml .cl .px{width:12px;height:12px}
/* 设置：页内导航（K8）和设置行（K7） */
.sg{display:grid;grid-template-columns:176px minmax(0,1fr);gap:22px;flex:1;min-height:0}
.nav{display:flex;flex-direction:column;gap:2px}
.nav button{display:flex;flex-direction:column;gap:1px;padding:7px 10px;clip-path:var(--clip2);color:var(--tx2)}
.nav button b{${D};font-size:14px;letter-spacing:.08em;line-height:1.3}
.nav button span{font-size:12px;color:var(--tx3)}
.nav button.on{background:var(--cy-soft);color:var(--tx)}
.nav button.on b{color:var(--cy-tx)}
.pane{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden}
.ph2{font-family:var(--f-title);font-weight:var(--fw-title);font-size:18px;line-height:1.35}
.pd{margin-top:4px;font-size:12.5px;line-height:1.6;color:var(--tx2);max-width:560px}
.rows{margin-top:14px;display:flex;flex-direction:column}
.srow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:center;padding:11px 0;border-top:1px dotted var(--line2)}
.srow:last-child{border-bottom:1px dotted var(--line2)}
.srow .sn{display:flex;align-items:center;gap:8px}
.srow .sn .code{color:var(--tx3)}
.srow .sd{display:block;margin-top:2px;font-size:12px;color:var(--tx2)}
.srow .sc{display:flex;align-items:center;gap:8px;justify-content:flex-end}
.srow.off .sn b,.srow.off .sd{color:var(--tx3)}
.tag.ok{background:var(--ok-soft);color:var(--ok);box-shadow:inset 0 0 0 1px var(--ok)}
.lt .tag.ok{background:var(--ok-soft)}
.code{font-family:var(--f-code);font-size:var(--fs-code)}
.big2{display:flex;align-items:baseline;gap:12px;margin-top:16px;${D}}
.big2 b{font-size:54px;line-height:1;color:var(--cy-tx);text-shadow:var(--tglow)}
.big2 span{font-size:24px;color:var(--tx2)}
.big2 em{font-family:var(--f-body);font-weight:400;font-size:12.5px;color:var(--tx2);margin-left:6px}
.meter.lg i{height:14px}
.fld{display:flex;align-items:center;height:34px;width:120px;padding:0 10px;clip-path:var(--clip2);background:var(--cy-ol);position:relative;isolation:isolate;${D};font-size:15px}
.fld:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane2);z-index:-1}
.ac{display:flex;flex-direction:column;gap:2px;margin-top:14px}
.ac button{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:12px;align-items:start;padding:9px 10px;clip-path:var(--clip2)}
.ac button.on{background:var(--cy-soft)}
.ac button .rb{margin-top:2px}
.ac button b{display:flex;align-items:center;gap:8px;line-height:20px}
.ac button b .k{${D};font-size:14px;letter-spacing:.08em;color:var(--tx2)}
.ac button span.d{display:block;font-size:12px;color:var(--tx2)}
.hr{margin-top:16px;padding-top:12px;border-top:1px dotted var(--line2)}
.hr .lbl{margin-bottom:8px}
.hl{display:flex;flex-wrap:wrap;gap:6px}
.hl span{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;clip-path:var(--clip2);background:var(--pane2);font-size:12.5px;color:var(--tx2)}
.hl span .px{width:12px;height:12px;color:var(--bad)}
.tiles2{display:grid;grid-template-columns:repeat(2,168px);gap:12px}
.tile2{position:relative;isolation:isolate;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 8px 12px;clip-path:var(--clip2);background:var(--line2)}
.tile2:before{content:"";position:absolute;inset:1px;clip-path:var(--clip2);background:var(--pane);z-index:-1}
.tile2.on{background:var(--cy-ol)}
.tile2.on:before{inset:2px;background:linear-gradient(var(--cy-soft),var(--cy-soft)),var(--pane)}
.tile2 .ti{width:72px;height:72px;display:block}
.tile2 .tl{display:flex;align-items:center;gap:8px;${D};font-size:14px;letter-spacing:.08em}
.tile2 .tl .rb{width:14px;height:14px}
.tile2 .tl .rb:after{left:4px;top:4px;width:6px;height:6px}
.tile2 .td{font-size:12px;color:var(--tx3)}
.defs{position:absolute;width:0;height:0;overflow:hidden}
/* 出错模块（M3、S3） */
.mod.err{--mline:var(--bad-line)}
.task.err .rl,.task.err .rv{color:var(--bad);text-shadow:none}
.lt .task.err .rl{background:var(--bad-soft);color:var(--bad)}
.eb{position:relative;margin-top:12px;padding:12px 14px;clip-path:var(--clip2);background:var(--bad-soft)}
.eb .e1{display:flex;align-items:center;gap:8px;color:var(--bad)}
.eb .e2{margin-top:4px;font-size:12.5px;line-height:1.6;color:var(--tx2)}
.eb .row{display:flex;gap:8px;margin-top:10px;align-items:center;flex-wrap:wrap}
.raw{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12px;color:var(--tx3)}
.raw .code{color:var(--tx3)}
.raw .px{width:12px;height:12px;transform:rotate(-90deg)}
.task.err .blocks i.f{animation:none}
.step.fail .nd{color:var(--bad)}
.step.fail .sl b,.step.fail .tm{color:var(--bad)}
.step.fail .i-x{display:flex}
.nd .i-x{display:none}
.tr.cur.st-fail .si{color:var(--bad)}
.st-fail .s-fail{display:flex!important}
.st-fail .tt em{color:var(--bad)}
/* 加载、空（S1、S2） */
.ld{display:flex;flex-direction:column;gap:2px;margin-top:14px}
.ld li{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:12px;align-items:center;padding:9px 0;border-top:1px dotted var(--line2)}
.ld li:last-child{border-bottom:1px dotted var(--line2)}
.ld li .s{display:flex;align-items:center;justify-content:center;color:var(--ok)}
.ld li .s.w{color:var(--tx3)}
.ld li .s.bad{color:var(--bad)}
.ld li b{display:block}
.ld li span.d{display:block;font-size:12px;color:var(--tx2)}
.ld li em{${D};font-size:14px;color:var(--tx3)}
.e0{display:flex;flex-direction:column;gap:12px;padding:6px 0 4px}
.e0 p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.e0 .row{display:flex;gap:8px;align-items:center}
.e0 .row span{font-size:12px;color:var(--tx3)}
.hero2{font-family:var(--f-title);font-weight:var(--fw-title);font-size:24px;line-height:1.3;text-shadow:var(--hglow)}
.wait2{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--tx2)}
.cin.dim{color:var(--tx3);cursor:default}
.cin.dim .caret{display:none}
.chip.no{color:var(--tx3);background:var(--line);box-shadow:none}
.chip.no:before{background:var(--pane2)}
`;

/** 顶栏（L3）。mode：'cli' | 'api'；on：'settings' | 'quota' | ''；proj：项目名，空的时候写「还没有项目」。 */
export function header({ mode = 'cli', on = '', proj = 'weather-cli', h = {} } = {}) {
  const evt = (k) => (h[k] ? ` onClick="${h[k]}"` : '');
  const projHtml = proj
    ? `<span class="proj">${px('folder')}<b class="nm">${proj}</b><em>~/code/${proj}</em></span>`
    : '<span class="proj">' + px('folder') + '<b class="nm" style="color:var(--tx3)">还没有项目</b></span>';
  return `<header class="hd">
    <div class="brand"><b>PECK</b><i class="mk"></i></div>
    ${projHtml}
    <i class="sp"></i>
    <div class="seg"><button type="button" class="${mode === 'cli' ? 'on' : ''}"${evt('cli')}>CLI</button><button type="button" class="${mode === 'api' ? 'on' : ''}"${evt('api')}>API</button></div>
    <button type="button" class="qb ${on === 'quota' ? 'on' : ''}" aria-label="额度与花费"${evt('quota')}>${ic('bars')}$3.20</button>
    <button type="button" class="ib ${on === 'settings' ? 'on' : ''}" aria-label="设置"${evt('gear')}>${ic('gear')}</button>
  </header>`;
}

/** 左栏的项目模块。kind：'normal' | 'notask' | 'empty' | 'boot' | 'run' | 'fail'。 */
export function projects(kind = 'normal', h = {}) {
  const evt = (k) => (h[k] ? ` onClick="${h[k]}"` : '');
  const old = `<li class="tr old"><span class="si">${px('check')}</span><span class="tt"><b>修 Diff 里的中文乱码</b><em>今天 09:12 · 3 个文件</em></span></li>
          <li class="tr old"><span class="si">${px('check')}</span><span class="tt"><b>加 --json 输出</b><em>昨天 · 2 个文件</em></span></li>`;
  const others = `<div class="pj"><p class="pjh">${px('folder')}<b class="nm">notes-sync</b><em>31</em></p><p class="last">${px('check')}导出加一个 Markdown 选项 · 今天</p></div>
      <div class="pj"><p class="pjh">${px('folder')}<b class="nm">pomelo-site</b><em>8</em></p><p class="last">${px('check')}首页图片改成懒加载 · 昨天</p></div>`;
  if (kind === 'empty') {
    return `<div class="mod lp"><p class="ml"><span class="l">PROJECTS</span><span class="r n">0</span></p>
      <div class="e0"><p>还没有项目。打开一个项目文件夹，Peck 就在里面干活。</p><div class="row"><button type="button" class="btn"${evt('open')}>${px('folder')}OPEN FOLDER</button></div><p style="font-size:12px;color:var(--tx3)">也可以把文件夹拖进窗口。</p></div></div>`;
  }
  if (kind === 'boot') {
    return `<div class="mod lp"><p class="ml"><span class="l">PROJECTS</span><span class="r">读取中</span></p>
      <p class="wait2">${twinkle()}在读项目列表和最近的任务…</p></div>`;
  }
  const cur = {
    notask: `<li class="tr nt on"><span class="si">${px('plus')}</span><span>NEW TASK</span></li><li class="last" style="padding-left:33px">还没有任务</li>`,
    normal: `<li class="tr nt"><span class="si">${px('plus')}</span><span>NEW TASK</span></li><li class="tr cur st-ok"><span class="si"><span class="s-ok">${px('check')}</span></span><span class="tt"><b>把设置里三个对话框合成一个面板</b><em>完成 · 14:06 · 6 个文件</em></span></li>${old}`,
    run: `<li class="tr nt"><span class="si">${px('plus')}</span><span>NEW TASK</span></li><li class="tr cur st-run"><span class="si"><span class="s-run">${twinkle()}</span></span><span class="tt"><b>把设置里三个对话框合成一个面板</b><em>在跑 · 00:12</em></span></li>${old}`,
    fail: `<li class="tr nt"><span class="si">${px('plus')}</span><span>NEW TASK</span></li><li class="tr cur st-fail"><span class="si"><span class="s-fail">${px('x')}</span></span><span class="tt"><b>把设置里三个对话框合成一个面板</b><em>失败 · Grok 的额度用完了</em></span></li>${old}`,
  }[kind];
  return `<div class="mod lp"><p class="ml"><span class="l">PROJECTS</span><span class="r n">3</span></p>
      <div class="pj on"><p class="pjh">${px('folder')}<b class="nm">weather-cli</b><em>${kind === 'notask' ? 0 : 13}</em></p><ul class="tl">${cur}</ul></div>
      ${kind === 'notask' ? '' : others}
      <p class="lfoot">同一个项目一次跑一个任务</p></div>`;
}

/** 左栏下面的记录模块。items：[[时间, 标题, 说明]]，空就写空状态。 */
export function log(items = []) {
  const body = items.length
    ? `<ul>${items.map(([t, b, a]) => `<li><span class="t">${t}</span><span><b class="nm">${b}</b><span class="a">${a}</span></span></li>`).join('')}</ul>`
    : '<p class="empty">发任务以后，存快照、批过的、问过的、做完、撤销都记在这里。</p>';
  return `<div class="mod grow log"><p class="ml"><span class="l">LOG</span><span class="r">这个任务</span></p>${body}</div>`;
}

/** 右栏只有空状态时（S1）。 */
export function changesEmpty(text, snap = '发任务时先存一份快照') {
  return `<section class="col"><div class="mod grow rc"><p class="ml"><span class="l">CHANGES</span><span class="r">直接写进项目</span></p>
      <p class="snap no">${px('clock')}<span>${snap}</span></p>
      <div class="sum2"><span class="cnt" data-nolint=""><b>0</b></span><span class="u">个文件</span><span class="plus">+0</span><span class="minus">−0</span></div>
      <p class="empty" style="margin-top:6px">${text}</p></div></section>`;
}
