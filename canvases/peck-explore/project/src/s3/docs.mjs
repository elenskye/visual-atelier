// 第 3 步 · 第一轮结果板和画布上的便签。数从 tokens.mjs 取。
import { board, DOTS, FLIP, px } from '../s1c/kit.mjs';
import { CSS as PROTO } from '../s2/proto.mjs';
import { CHECK, FROM, NEW, GROUPS, TYPE, SIZE, SPACE, STEPS, GLOW, MOTIONS, TICK, themeCss } from './tokens.mjs';
import { BASE, rootLogic, themeProps } from './color.mjs';

const D = `font-family:${DOTS};font-weight:900`;
const nRoles = GROUPS.reduce((n, g) => n + g.roles.length, 0);
const nPass = CHECK.filter((c) => c.pass).length;

// 这一轮定下的（结果板 DONE）：[名字, 一句话, 看哪张板]
const DONE = [
  ['颜色', `${nRoles} 个角色深浅各一套，${CHECK.length} 对对比度 ${nPass} 对过 APCA。深色为过 APCA 改了 ${Object.keys(FROM).length} 处，新加 ${NEW.length} 个角色给悬停和红底按钮。`, 'S3-Color · S3-Contrast'],
  ['字和尺寸', `字 ${TYPE.length} 个角色、控件尺寸 ${SIZE.length} 个、间距 ${Object.keys(SPACE).length} 档、像素角 ${STEPS.length} 种、发光 ${GLOW.length} 种（只在深色）。`, 'S3-Scale'],
  ['控件', '14 种控件 × 6 个状态：补上悬停、键盘焦点、按下、不能用；左边一格真能指、能按、能用 Tab 走到。', 'S3-Controls'],
  ['动效', `一格 ${TICK}ms，${MOTIONS.length} 个动作都是整格；calm、expressive 两档，减弱动态效果只留最后的样子。`, 'S3-Motion'],
  ['图标', 'J2 照 Apple 的格子，每个尺寸整像素；.icns 10 张怎么出；A3 只出 Dock 用的；菜单栏模板图 4 个状态。', 'S3-Icon'],
  ['方案文件', '照 visual-atelier 的格式写好了 scheme/：tokens 五个、fonts、marks、DESIGN.md。导入时整个复制成 schemes/peck/。', 'scheme/'],
];
// 方案文件，以及在 visual-atelier 的工具上试跑的结果（临时副本，没写进仓库）
const FILES = [
  ['scheme.json · DESIGN.md', '状态 draft，版本 0.1.0；DESIGN.md 七节照模板写'],
  ['tokens/', 'color · contrast · scale · motion · targets'],
  ['type/fonts.json', '四个 OFL 字体 + 苹方'],
  ['marks/', 'manifest.json + 8 个 SVG（App 图标 3、菜单栏 5）'],
  ['history/apca-changes.json', '深色为过 APCA 改的 6 处'],
];
const TRIED = '拿 visual-atelier 的工具在临时副本上试跑：token 构建出了 web.css、tokens.json、tokens.ts；npm run qa 84 项全过（资产 11、APCA 72、体积 1）。';
const STEP2 = '权限三档、右栏四个模块、ONE SHOT（谁来答、只读）、终端锁、API 模式「谁来干」两种，已写进 Peck 的 docs/design.md 和 docs/roadmap.md（还没提交）。';
const QUESTIONS = [
  ['深色亮一档认不认？', '为过 APCA，深色里说明字、提示字、红字、控件边亮了一档（正文和青色没动）。对照在对比度板右下。'],
  ['图标的底板', '照 Apple 的格子，鸟在底板里大一点（81%），换来每个尺寸都是整像素。也可以保留第 1 步的比例，大尺寸边缘会糊一点。对照在图标板左下。'],
  ['键盘焦点的样子', '画成控件里面一圈 1 像素青点线：像素角会把外面的光圈切掉。另一种是焦点时整个边变青、加粗一像素（和悬停太像）。'],
];

const CSS = `
.pk.rp5{width:1280px;height:860px;padding:26px 32px 28px;display:flex;flex-direction:column;gap:14px}
.r1{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px;min-height:0;flex:1}
.cc{display:flex;flex-direction:column;gap:14px;min-width:0}
.box{padding:12px 16px 14px}
.box .ml{margin-bottom:8px}
.dn li{display:grid;grid-template-columns:76px minmax(0,1fr);gap:10px;padding:7px 0;border-top:1px dotted var(--line2)}
.dn li:first-child{border-top:0}
.dn b{font-size:13px;font-weight:600}
.dn p{font-size:12.5px;line-height:1.55;color:var(--tx2)}
.dn p em{display:block;margin-top:2px;font-style:normal;font-family:var(--f-code);font-size:var(--fs-code);color:var(--cy-tx)}
.s2b p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.qs li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;padding:8px 0;border-top:1px dotted var(--line2)}
.qs li:first-child{border-top:0}
.qs .n{${D};font-size:18px;color:var(--warn)}
.qs b{display:block;font-size:13px;font-weight:600;margin-bottom:2px}
.qs p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.nx p{font-size:12.5px;line-height:1.6;color:var(--tx2)}
.sch3{margin-top:4px;padding-top:10px;border-top:1px solid var(--line2)}
.sch3 li{display:grid;grid-template-columns:200px minmax(0,1fr);gap:10px;padding:3px 0;font-size:12px;color:var(--tx3)}
.sch3 li span:first-child{font-family:var(--f-code);font-size:var(--fs-code);color:var(--tx)}
.sch3 p.tried{margin-top:8px;font-size:12.5px;line-height:1.6;color:var(--ok)}
`;
function reportBoard() {
  const def = FLIP ? '浅色' : '深色';
  const dn = DONE.map(([a, b, c]) => `<li><b>${a}</b><p>${b}<em>${c}</em></p></li>`).join('');
  const qs = QUESTIONS.map(([b, p], i) => `<li><span class="n">${i + 1}</span><div><b>${b}</b><p>${p}</p></div></li>`).join('');
  const body = `<div class="{{root}}"><div class="ft"><h1>第 3 步 · 第一轮结果</h1><p>第 2 步定的样子，这一轮落成定值：颜色过 APCA、控件全套、动效数值、图标各尺寸，并写成方案文件。</p></div>
    <div class="r1"><div class="mod box"><p class="ml"><span class="l">DONE</span><span class="r">这一轮定下的</span></p><ul class="dn">${dn}</ul>
        <div class="sch3"><p class="ml" style="margin-bottom:6px"><span class="l">SCHEME</span><span class="r">导入后就是 schemes/peck/</span></p><ul>${FILES.map(([a, b]) => `<li><span>${a}</span><span>${b}</span></li>`).join('')}</ul><p class="tried">${TRIED}</p></div></div>
      <div class="cc"><div class="mod box qs wait"><p class="ml"><span class="l">QUESTIONS</span><span class="r">要你定</span></p><ul>${qs}</ul></div>
        <div class="mod box s2b"><p class="ml"><span class="l">STEP 2</span><span class="r">收尾</span></p><p>${STEP2}</p></div>
        <div class="mod box nx"><p class="ml"><span class="l">NEXT</span><span class="r">第 4 步</span></p><p>认了就进第 4 步：在云端新建「Peck」Design System（说明、组件预览、封面），挂到这块画布上对一遍。</p></div></div></div></div>`;
  const html = board({ title: '第 3 步 · 第一轮结果', css: `${PROTO}\n${BASE}\n${CSS}\n${themeCss()}`, body, props: themeProps(def), logic: rootLogic('pk rp5 doc dots', def), h: 860 });
  return { file: 'S3-Report.dc.html', h: 860, title: '第 3 步 · 第一轮结果 · 要你定的 3 件事', html };
}

export function boards() {
  return [reportBoard()];
}

/** 这一页的便签。 */
export function notes(PAGE) {
  return {
    's3r1-title': { x: 0, y: -300, text: '第 3 步 · 方案 · 第一轮：颜色过 APCA、控件全套、动效数值、图标定稿', kind: 'title1', maxW: 3600, page: PAGE },
    's3r1-took': {
      x: 4560, y: 0, w: 400, fill: 'teal', page: PAGE,
      text: `第 2 步收尾了：你回的三件都按推荐落了，权限三档、右栏四个模块、ONE SHOT、终端锁写进了 Peck 的 design.md 和 roadmap。\n\n这一页是方案：\n· 色板和对比度：${nRoles} 个角色，${CHECK.length} 对都过 APCA\n· 字和尺寸\n· 控件全套：14 种 × 6 个状态（能指、能按、能 Tab）\n· 动效：一格 50ms，15 个现场演（REPLAY）\n· 图标：J2 各尺寸、菜单栏 4 个状态\n\n同一份值写成了 project/scheme/，导入 visual-atelier 时就是 schemes/peck/。`,
    },
    's3r1-pick': {
      x: 4560, y: 760, w: 400, fill: 'orange', page: PAGE,
      text: '这一轮请你看\n\n1. 深色里说明字、提示字、红字、控件边亮了一档，认不认（对比度板右下有对照）\n2. 图标的底板：照 Apple 的格子（鸟大一点、每个尺寸都清楚），还是保留第 1 步的比例\n3. 键盘焦点画成控件里面一圈青点线，认不认\n\n认了就进第 4 步：云端新建 Peck 的 Design System。',
    },
  };
}
