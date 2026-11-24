// B3 桌面拼贴（Phase 2 第三轮）。规则：纸、胶带、贴纸可以歪，字永远是正的、停下时落在整像素上。
// 首页是桌面，便签能拖能甩；模块页是摊在桌上的纸，开着的别的页叠在它右边，露出边和贴纸；
// 左上角的柚子出柚子瓣；首页的贴纸簿；搜索是一张打出来的小票；新年第一周桌上有一封年度小报。
import { P, rrect, circle, handStroke, handFill, f, rng } from './lib.mjs';
import { wob, hline, marker, stitches, tex, glyph, icon, tw, btn, tape, tapes, chip, tiltLayer } from './parts.mjs';
import { MODS, PINNED, CATS_ORDER, TODAY, CHATS, ASSETS } from './content.mjs';
import { roundSticker, briefInner, todoInner, booksInner, daysInner, curveSvg, finToolbar, entriesTable, assetsView, editPanel, messages, askBar, stubView, palettePanel } from './views.mjs';
import { money as fmt } from './parts.mjs';
import { wheel, WHEEL_CSS } from './wheel.mjs';
import { searchOverlay, SEARCH_CSS } from './search.mjs';
import { envelope, zineOverlay, ZINE_CSS } from './zine.mjs';

const W = 1280;

// 桌上的便签：[左, 上, 宽, 高, 纸歪的角度, 层]。字不跟着歪，所以纸也只歪一点
export const NOTES = {
  brief: [64, 170, 476, 214, -1.2, 3],
  todo: [580, 88, 312, 224, 1.4, 2],
  days: [930, 74, 300, 214, -1.8, 2],
  books: [596, 352, 318, 182, -1, 2],
  receipt: [954, 322, 262, 330, 2, 4],
  sticky: [86, 420, 230, 200, -2.2, 5],
  year: [352, 420, 214, 232, 0, 1],
};

// 模块页的纸（钱来钱往、空页）和问柚子的本子：位置和大小
export const SHEET = { x: 36, y: 66, w: 1140, h: 716 };
export const PAD = { x: 300, y: 70, w: 880, h: 712 };
const pmIcon = (size) => `<svg width="${size}" height="${size}" viewBox="-6 -6 112 108" style="overflow:visible" aria-hidden="true"><use href="#pm-static"></use></svg>`;
const OPENABLE = Object.keys(MODS).filter((k) => k !== 'home');

function strip(pomelo) {
  const lights = ['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => `<i style="position:absolute;left:${14 + i * 20}px;top:19.5px;width:12px;height:12px;border-radius:50%;background:${c};display:block"></i>`).join('');
  const open = OPENABLE.map((id) => `<button type="button" class="{{tabCls.${id}}} press" onClick="{{go.${id}}}" title="${MODS[id].name}" aria-label="${MODS[id].name}" style="order: {{tabOrd.${id}}};position:relative;width:40px;height:44px;display:flex;align-items:center;justify-content:center">${id === 'pomelo' ? pmIcon(30) : icon(MODS[id].icon, 30)}<span class="openmk" style="position:absolute;left:6px;bottom:2px">${hline(28, { seed: 700, sw: 3, color: 'var(--pen)', y: 2 })}</span></button>`).join('');
  const dw = tw(TODAY, 13) + 28;
  return `<div style="position:absolute;left:0;top:0;width:${W}px;height:58px;z-index:30">${lights}
<button type="button" class="press hub" onClick="{{openJump}}" aria-label="柚子瓣：去哪，或问柚子" title="点我：柚子瓣" style="position:absolute;left:78px;top:2px;width:58px;height:58px;display:flex;align-items:center;justify-content:center"><div class="{{face}}" style="transform:rotate(-8deg)">${pomelo}</div></button>
<sc-if value="{{notHome}}" hint-placeholder-val="{{false}}"><button type="button" class="press" onClick="{{back}}" style="position:absolute;left:146px;top:16px;width:104px;height:28px;display:flex;align-items:center;justify-content:center;gap:4px;font-size:15px">${tiltLayer(-2, tape({ x: 0, y: 1, w: 104, h: 26, rot: 0 }))}<span style="position:relative;z-index:5;display:flex;align-items:center;gap:4px;color:#20241F">${glyph('back2', 17)}回桌面</span></button></sc-if>
<div style="position:absolute;right:${dw + 100}px;top:6px;display:flex;align-items:center;gap:2px"><span class="i2" style="font-size:12px;margin-right:4px">桌上开着</span>${open}</div>
<div style="position:absolute;right:12px;top:12px;display:flex;align-items:center;gap:14px"><div style="position:relative;width:${dw}px;height:30px;display:flex;align-items:center;justify-content:center;font-size:13px;white-space:nowrap">${tiltLayer(1.5, `<div style="position:absolute;inset:0;border-radius:4px;background:var(--card)"></div>${wob(dw, 30, { r: 4, amp: 0.5, sw: 1.4, seed: 701, pad: 4 })}`)}<span style="position:relative" class="num">${TODAY}</span></div><button type="button" class="press" onClick="{{openSearch}}" aria-label="找东西（⌘K）" title="找东西（⌘K）" style="display:flex">${glyph('search', 21)}</button><button type="button" class="press" onClick="{{toggleCfg}}" aria-label="设置（配色）" title="配色" style="display:flex">${glyph('gear', 21)}</button></div></div>`;
}

// 一张能拖的便签：位置用 translate（停下时取整），纸的歪用 --r，字不歪
function note(id, inner) {
  const [x, y, w, h] = NOTES[id];
  const delay = (Object.keys(NOTES).indexOf(id) * 0.09 + 0.05).toFixed(2);
  return `<div class="note" onPointerDown="{{note.${id}}}" onPointerMove="{{dragMove}}" onPointerUp="{{dragEnd}}" onPointerCancel="{{dragEnd}}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;animation-delay:${delay}s;z-index:{{nz.${id}}};transform: {{np.${id}}};--r: {{nr.${id}}}">${inner}</div>`;
}
function paperNote(w, h, inner, { seed, bg = 'var(--card)', lines = false, stitch = false, nTapes = 'rand', pad = '18px 20px 16px 20px' } = {}) {
  const lined = lines ? 'background-image:repeating-linear-gradient(transparent 0 37px,var(--line) 37px 38.5px);background-position:0 46px;' : '';
  return `<div style="position:relative;width:${w}px;height:${h}px">${tiltLayer('var(--r, 0deg)', `<div class="shd" style="position:absolute;inset:0;background:${bg};${lined}border-radius:10px;box-shadow:0 1px 2px var(--shadow),0 10px 22px var(--shadow)">${tex('tx')}</div>${wob(w, h, { r: 10, amp: 0.95, sw: 1.9, seed })}${stitch ? stitches(h, { seed: seed + 1, x: 8, gap: 18 }) : ''}${tapes(w, h, seed, nTapes)}`)}<div style="position:relative;padding:${pad};height:100%">${inner}</div></div>`;
}
// 小票：锯齿底边，右上角能翻面
function receipt() {
  const [, , w, h] = NOTES.receipt;
  const zz = []; const n = 13;
  for (let i = 0; i <= n * 2; i++) zz.push(`${f((i / (n * 2)) * 100)}% ${i % 2 ? 'calc(100% - 9px)' : '100%'}`);
  const clip = `polygon(0 0,100% 0,${zz.reverse().join(',')})`;
  const face = (inner, back) => `<div class="${back ? 'rback' : 'rfront'}" style="position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;${back ? 'transform:rotateY(180deg);' : ''}">${tiltLayer('var(--r, 0deg)', `<div style="position:absolute;inset:0;filter:drop-shadow(0 6px 10px var(--shadow))"><div style="position:absolute;inset:0;background:var(--card);clip-path:${clip}">${tex('tx')}</div></div>`)}<div style="position:relative;padding:20px 22px">${inner}</div></div>`;
  const dash = `<div style="border-top:2px dashed var(--line);margin:10px 0"></div>`;
  const acc = ASSETS.accounts.map(([n2, v]) => `<div style="display:flex;justify-content:space-between;height:27px;align-items:center;font-size:15px"><span class="i2">${n2}</span><span class="num">${fmt(v, false)}</span></div>`).join('');
  const front = `<div style="text-align:center;font-size:13px;line-height:20px" class="i2">— 柚儿园 · 资产小票 —</div><div style="text-align:center;font-size:12px;line-height:18px" class="i2">${TODAY}</div>${dash}${acc}${dash}<div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:15px;font-weight:700">合计</span><span class="num" style="font-size:24px;font-weight:700">¥${fmt(ASSETS.total, false)}</span></div><div style="text-align:right;font-size:13px;color:var(--up)">比上次 <span class="num">+¥${fmt(ASSETS.diff, false)}</span></div><div class="i2" style="font-size:12px;margin-top:14px;text-align:center">翻过来看曲线</div>`;
  const back = `<div style="font-size:16px;font-weight:700;margin-bottom:8px">这三个月</div>${curveSvg(214, 150, 720)}<div class="i2" style="display:flex;justify-content:space-between;font-size:12px;margin-top:4px;width:214px"><span>9 月</span><span>10 月</span><span>11 月</span></div><div style="font-size:14px;margin-top:14px;line-height:1.6">十一月第一周就<br>多了 <span class="num" style="font-weight:700">¥2,310</span>，工资到啦。</div>`;
  return `<div style="position:relative;width:${w}px;height:${h}px;perspective:900px"><div class="{{flipCls}}" style="position:absolute;inset:0;transform-style:preserve-3d">${face(front, false)}${face(back, true)}</div>${tiltLayer('var(--r, 0deg)', tape({ x: 92, y: -12, w: 80, rot: 4, kind: 1 }))}<button type="button" class="press" onClick="{{flipNote}}" aria-label="翻面" title="翻面" style="position:absolute;right:10px;top:10px;display:flex;color:var(--pen)">${glyph('flip', 20)}</button></div>`;
}

// 小彩蛋：便签啪地贴上来，几秒后撕走（勾完所有待办、戳柚子太多下）
function eggNote(x, y, text, cls) {
  return `<div class="eggnote ${cls}" style="position:absolute;left:${x}px;top:${y}px;width:220px;height:92px;z-index:45">${tiltLayer(-3, `<div style="position:absolute;inset:0;background:#FFE38A;box-shadow:0 2px 3px var(--shadow),3px 12px 18px var(--shadow)"></div>${tape({ x: 70, y: -10, w: 76, rot: 4 })}`)}<div style="position:relative;height:100%;display:flex;align-items:center;justify-content:center;padding:0 16px;text-align:center;font-size:18px;font-weight:700;color:#20241F">${text}</div></div>`;
}
function confetti(seed) {
  const r = rng(seed);
  return Array.from({ length: 20 }, (_, i) => {
    const a = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.4, d = 80 + r() * 140;
    const c = ['#FFD23F', '#F78FB3', '#4AA8E8', '#3DBE8B', '#9B87F5', '#FF9A3C'][i % 6];
    const shape = i % 3 === 0 ? 'border-radius:50%' : i % 3 === 1 ? 'border-radius:2px' : 'clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%)';
    return `<i style="position:absolute;left:0;top:0;width:${8 + Math.round(r() * 6)}px;height:${8 + Math.round(r() * 6)}px;background:${c};${shape};--dx:${Math.round(Math.cos(a) * d)}px;--dy:${Math.round(Math.sin(a) * d)}px;--rr:${Math.round(r() * 540 - 270)}deg;animation-delay:${(r() * 0.1).toFixed(2)}s;display:block"></i>`;
  }).join('');
}

function desk(seal) {
  const greet = `<div class="greet" style="position:absolute;left:92px;top:70px;z-index:1;pointer-events:none"><div style="position:relative;display:inline-block;z-index:0;font-size:46px;font-weight:700;line-height:1.1"><span class="gw">下午好呀</span>${marker(194, { seed: 710, sw: 18, top: '74%' })}</div><span class="gs" style="display:inline-block;font-size:17px;margin-left:12px;opacity:.75">今天也慢慢来。</span></div>`;
  const yearSt = (() => {
    const cats = { read: 'sky', films: 'sky', drawing: 'pink', trip: 'orange' };
    const pos = [[0, 26, -7], [108, 0, 5], [18, 124, 4], [118, 112, -6]];
    const it = [['read', '12', '本', '读完'], ['films', '9', '部', '看完'], ['drawing', '18', '节', '画了'], ['trip', '4', '趟', '出门']];
    return `<div style="position:absolute;left:4px;top:-4px;font-size:14px;font-weight:700;line-height:20px">2026 年 · 到今天</div>` + it.map(([ic, n, u, lab], i) => `<div style="position:absolute;left:${pos[i][0]}px;top:${pos[i][1] + 24}px">${roundSticker(92, cats[ic], 730 + i * 5, `${icon(ic, 22, 'margin-bottom:-2px')}<div class="num" style="font-size:24px;font-weight:700;line-height:1.05">${n}<span style="font-size:12px;font-weight:400">${u}</span></div><div style="font-size:11px;line-height:14px">${lab}</div>`, { tilt: pos[i][2] })}</div>`).join('');
  })();
  const sticky = `<div style="position:relative;width:230px;height:200px;color:#20241F">${tiltLayer('var(--r, 0deg)', `<div style="position:absolute;inset:0;background:#FFE38A;box-shadow:0 1px 2px var(--shadow),4px 12px 18px var(--shadow);clip-path:polygon(0 0,100% 0,100% 88%,90% 100%,0 100%)"></div><div style="position:absolute;right:0;bottom:0;width:23px;height:24px;background:linear-gradient(135deg,#E8C454 50%,transparent 50%)"></div>`)}<div style="position:relative;padding:20px 20px 0"><div style="display:flex;align-items:center;gap:6px;font-size:15px;font-weight:700;margin-bottom:8px">${icon('memo', 22, 'transform:rotate(-8deg)')}念念不忘</div><div style="font-size:18px;line-height:1.6">周末想去看海，<br>顺路买一袋柚子。</div><div style="font-size:12px;margin-top:10px;opacity:.65">11 月 1 日 · 周日</div></div></div>`;
  const row = PINNED.filter((id) => id !== 'pomelo').concat(['packing', 'films']);
  const stickers = row.map((id, i) => `<button type="button" class="dstk" onClick="{{go.${id}}}" style="display:flex;flex-direction:column;align-items:center;gap:2px;width:78px"><span class="dic" style="display:flex">${icon(MODS[id].icon, 56, `transform:rotate(${[-6, 4, -3, 6, -5, 3, -4][i % 7]}deg)`)}</span><span style="font-size:13px;line-height:18px;white-space:nowrap">${MODS[id].name}</span></button>`).join('');
  return `<div class="{{deskCls}}">${greet}
${note('brief', paperNote(476, 214, briefInner(), { seed: 740, stitch: true, pad: '18px 22px 16px 30px' }))}
${note('todo', paperNote(312, 224, todoInner(), { seed: 741, lines: true }))}
${note('days', paperNote(300, 214, daysInner(), { seed: 742, bg: 'var(--c-pink-t)' }))}
${note('books', paperNote(318, 182, booksInner(), { seed: 743 }))}
${note('receipt', receipt())}
${note('sticky', sticky)}
${note('year', `<div style="position:relative;width:214px;height:232px">${yearSt}</div>`)}
<div style="position:absolute;left:60px;top:678px;display:flex;align-items:flex-end;gap:12px;z-index:1"><div style="position:relative;width:64px;height:26px;margin-bottom:34px">${tiltLayer(-6, tape({ x: 0, y: 0, w: 64, h: 26, rot: 0 }))}<span style="position:relative;z-index:5;display:block;text-align:center;line-height:26px;font-size:14px;color:#20241F">常用</span></div>${stickers}<button type="button" class="dstk" onClick="{{openBook}}" style="display:flex;flex-direction:column;align-items:center;gap:4px;width:84px;margin-left:6px"><span class="dic" style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;color:var(--pen)">${wob(52, 52, { r: 26, amp: 0.9, sw: 1.8, seed: 750, pad: 4 })}${glyph('grid', 24)}</span><span style="font-size:13px;line-height:18px">贴纸簿</span></button></div>
<sc-if value="{{showEnv}}" hint-placeholder-val="{{false}}">${envelope(seal)}</sc-if>
<sc-if value="{{allDone}}" hint-placeholder-val="{{false}}">${eggNote(640, 300, '今天的事都做完啦！', 'egg-done')}<div class="cf" style="position:absolute;left:730px;top:200px;width:0;height:0;z-index:46">${confetti(760)}</div></sc-if>
</div>`;
}

// 开着的别的页：叠在当前这页下面，右边露出一条边和它的贴纸；点一下换到上面来
function stack(base, current) {
  return OPENABLE.map((id) => {
    const isPad = id === 'pomelo';
    const bg = isPad
      ? 'background-color:var(--paper);background-image:repeating-linear-gradient(transparent 0 33px,color-mix(in srgb,var(--line) 85%,transparent) 33px 34.5px)'
      : 'background-color:var(--paper);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:22px 22px';
    return `<button type="button" class="{{stc.${id}}}" onClick="{{go.${id}}}" aria-label="换到「${MODS[id].name}」" title="${MODS[id].name}" style="--j: {{stj.${id}}};position:absolute;left:calc(${base.x}px + 22px * (var(--j) + 1));top:calc(${base.y}px + 4px * var(--j));width:${base.w}px;height:${base.h}px;z-index:calc(8 - var(--j))">${tiltLayer('calc(0.6deg + 0.8deg * var(--j))', `<div style="position:absolute;inset:0;border-radius:6px 12px 12px 6px;${bg};box-shadow:0 2px 4px var(--shadow),0 12px 30px var(--shadow)"></div><svg width="${base.w + 16}" height="${base.h + 16}" style="position:absolute;left:-8px;top:-8px;overflow:visible" aria-hidden="true"><use href="#edge-${base.w}"></use></svg>`)}<span class="stsk" style="position:absolute;left:${base.w - 24}px;top:calc(96px + 96px * var(--j));display:flex">${isPad ? pmIcon(46) : icon(MODS[id].icon, 46)}</span></button>`;
  }).join('');
}
// 当前这页：纸本身歪一点（只有纸），字正着；左边缝线，上边插页签，左上角拍一张模块贴纸
function sheet(inner, { iconHtml, tabsHtml = '', seed = 760 } = {}) {
  const { x, y, w, h } = SHEET;
  const bg = `background-color:var(--paper);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:22px 22px;background-position:-1px -1px`;
  return `${stack(SHEET)}<div class="sheet" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:10">${tabsHtml}${tiltLayer(-0.3, `<div style="position:absolute;inset:0;border-radius:6px 12px 12px 6px;${bg};box-shadow:0 2px 4px var(--shadow),0 18px 40px var(--shadow)">${tex('tx')}</div>${wob(w, h, { r: 10, amp: 1.1, sw: 1.9, seed })}${stitches(h, { seed: seed + 1 })}`)}<div style="position:absolute;inset:0">${inner}</div>${iconHtml ? `<div class="slapped" style="position:absolute;left:-22px;top:-30px;z-index:20">${iconHtml}</div>` : ''}</div>`;
}
function folderTabs() {
  const subs = [['entries', '收支'], ['assets', '资产'], ['reports', '报表'], ['import', '导入账单']];
  let x = 330;
  return subs.map(([k, n], i) => {
    const w = tw(n, 15) + 36;
    const s = `<button type="button" class="{{subCls.${k}}} ftab framed" onClick="{{sub.${k}}}" style="position:absolute;left:${x}px;top:-28px;width:${w}px;height:40px;font-size:15px;display:flex;justify-content:center;padding-top:7px"><span class="ftoff">${wob(w, 40, { r: 9, amp: 0.5, sw: 1.5, seed: 770 + i, fill: `var(--c-${['mint', 'sky', 'orange', 'grape'][i]}-l)`, pad: 4 })}</span><span class="fton">${wob(w, 40, { r: 9, amp: 0.5, sw: 1.7, seed: 780 + i, fill: 'var(--paper)', pad: 4 })}</span><span style="position:relative;line-height:22px">${n}</span></button>`;
    x += w + 6;
    return s;
  }).join('');
}
function moneyPage() {
  const TW = SHEET.w - 74;
  const content = (which) => which === 'entries'
    ? `<div style="position:absolute;left:44px;top:116px">${entriesTable(TW, 580)}</div>`
    : `<div style="position:absolute;left:52px;top:126px">${assetsView(TW - 10, 560)}</div>`;
  const head2 = `<div style="position:absolute;left:66px;top:18px;display:flex;align-items:center;gap:14px;width:${TW - 22}px"><div style="font-size:28px;font-weight:700;line-height:36px">钱来钱往</div><div style="flex:1"></div><div style="font-size:14px" class="i2">11 月 · 支出 <span class="num" style="color:var(--ink);font-size:17px">¥3,619.50</span> · 收入 <span class="num" style="color:var(--ink);font-size:17px">¥15,800.00</span></div></div><div style="position:absolute;left:44px;top:66px">${finToolbar(TW)}</div>`;
  const pageBg = `background-color:var(--paper);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:22px 22px;background-position:-1px -1px;border-radius:6px 12px 12px 6px`;
  const inner = `${head2}
<sc-if value="{{isEntries}}" hint-placeholder-val="{{true}}">${content('entries')}</sc-if>
<sc-if value="{{isAssets}}" hint-placeholder-val="{{false}}">${content('assets')}</sc-if>
<sc-if value="{{turnEntries}}" hint-placeholder-val="{{false}}"><div class="turnwrap"><div class="turn" style="${pageBg}">${stitches(SHEET.h, { seed: 761 })}${head2}${content('entries')}</div></div></sc-if>
<sc-if value="{{turnAssets}}" hint-placeholder-val="{{false}}"><div class="turnwrap"><div class="turn" style="${pageBg}">${stitches(SHEET.h, { seed: 761 })}${head2}${content('assets')}</div></div></sc-if>
<sc-if value="{{hasToast}}" hint-placeholder-val="{{false}}"><div class="toast" style="position:absolute;left:560px;top:22px;z-index:40;height:36px;padding:0 16px;display:flex;align-items:center;background:var(--marker);color:#20241F;font-size:14px;border-radius:6px;box-shadow:0 2px 6px var(--shadow)">{{toast}}</div></sc-if>
<sc-if value="{{panelOn}}" hint-placeholder-val="{{false}}"><div class="{{panelCls}} bpanel" style="position:absolute;right:26px;top:76px;width:380px;height:612px;z-index:35;--r: 1.2deg">${paperNote(380, 612, `<div style="position:relative;height:100%">${editPanel(380 - 16, 612)}</div>`, { seed: 790, nTapes: 2, pad: '22px 22px 20px 26px' })}</div></sc-if>`;
  return sheet(inner, { iconHtml: icon('money', 84, 'transform:rotate(-10deg);filter:drop-shadow(0 3px 3px var(--shadow))'), tabsHtml: folderTabs() });
}
function askPage(bigPomelo) {
  const slips = CHATS.recent.slice(1, 5).map((t, i) => `<div style="position:absolute;left:${[6, 30, 12, 36][i]}px;top:${36 + i * 52}px;width:210px;height:40px;display:flex;align-items:center;padding:0 14px;font-size:14px;white-space:nowrap;overflow:hidden">${tiltLayer([-4, 3, -2, 5][i], `<div style="position:absolute;inset:0;background:var(--card);box-shadow:0 1px 2px var(--shadow),0 4px 8px var(--shadow);border-radius:4px"></div>`)}<span style="position:relative">${t}</span></div>`).join('');
  const { x, y, w, h } = PAD;
  const lined = 'background-image:repeating-linear-gradient(transparent 0 33px,color-mix(in srgb,var(--line) 85%,transparent) 33px 34.5px);background-position:0 112px';
  const binding = Array.from({ length: 23 }, (_, i) => `<span style="position:absolute;left:${30 + i * 37}px;top:-10px;width:12px;height:22px;border-radius:6px;border:2.5px solid var(--pen);background:var(--desk);opacity:.85"></span>`).join('');
  return `<div style="position:absolute;left:58px;top:236px;width:220px;display:flex;flex-direction:column;align-items:center;z-index:5"><button type="button" onClick="{{pomeloPoke}}" aria-label="戳一下柚子" style="display:flex"><div class="{{faceBig}}">${bigPomelo}</div></button><svg width="150" height="18" style="margin-top:-12px" aria-hidden="true"><ellipse cx="75" cy="9" rx="66" ry="7" fill="var(--shadow)"></ellipse></svg><div style="font-size:13px;line-height:20px;margin-top:4px;opacity:.75">戳戳我</div></div>
<div style="position:absolute;left:40px;top:520px;width:250px;height:260px;z-index:4"><div style="font-size:14px;font-weight:700;line-height:20px">聊过的</div>${slips}</div>
${stack(PAD)}
<div class="sheet" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:10">${tiltLayer(-0.3, `<div style="position:absolute;inset:0;border-radius:6px;background-color:var(--paper);${lined};box-shadow:0 2px 4px var(--shadow),0 18px 40px var(--shadow)">${tex('tx')}</div>${wob(w, h, { r: 8, amp: 1.1, sw: 1.9, seed: 800 })}${binding}`)}
<div style="position:absolute;left:40px;top:34px"><div style="font-size:22px;font-weight:700;line-height:30px">和柚子聊聊 · 这个月吃饭花了多少</div><div class="i2" style="font-size:13px;line-height:20px">本地模型 · 今天 18:42</div></div>
<div ref="{{refMsgs}}" style="position:absolute;left:40px;top:96px;width:${w - 70}px;height:468px;overflow:auto;padding:4px 30px 10px 4px">${messages()}</div>
<div style="position:absolute;left:40px;top:586px">${askBar(w - 80)}</div></div>
<sc-if value="{{dizzy}}" hint-placeholder-val="{{false}}">${eggNote(70, 160, '别戳啦，晕了…', 'egg-dizzy')}</sc-if>`;
}
function stubPage() {
  return sheet(`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${stubView()}</div>`, { iconHtml: `<svg width="84" height="84" style="overflow:visible;transform:rotate(-10deg);filter:drop-shadow(0 3px 3px var(--shadow))" aria-hidden="true"><use href="#ic-{{stub.icon}}"></use></svg>` });
}

// 贴纸簿：从下面滑上来，撕一张贴纸就去那里
function book(bookPomelo) {
  const cells = [...CATS_ORDER, ['yellow', '柚子', ['pomelo']]];
  const grid = cells.map(([cat, name, ids], ci) => {
    const lab = `<div style="position:relative;width:86px;height:26px;margin:0 0 8px 2px">${tiltLayer([-3, 2, -2, 3, -4, 2][ci], tape({ x: 0, y: 0, w: 86, h: 26, rot: 0, kind: ci % 2 }))}<span style="position:relative;z-index:5;display:block;text-align:center;line-height:26px;font-size:15px;font-weight:700;color:#20241F">${name}</span></div>`;
    const st = ids.map((id, j) => {
      const ic = id === 'pomelo' ? pmIcon(70) : icon(MODS[id].icon, 70);
      return `<div class="{{stickCls.${id}}}" onPointerDown="{{stk.${id}}}" onPointerMove="{{dragMove}}" onPointerUp="{{dragEnd}}" onPointerCancel="{{dragEnd}}" role="button" tabindex="0" aria-label="${MODS[id].name}" style="position:relative;width:96px;height:104px;display:flex;flex-direction:column;align-items:center;gap:2px;touch-action:none"><span class="ghost" style="position:absolute;left:12px;top:2px;width:72px;height:72px;border:2px dashed var(--line);border-radius:22px"></span><span class="stkart" style="display:flex;transform:rotate(${[-6, 5, -3, 7, -5, 4][(ci + j) % 6]}deg)">${ic}</span><span class="stklab" style="font-size:14px;line-height:20px;white-space:nowrap">${MODS[id].name}</span><span class="usedtag i2" style="position:absolute;top:2px;right:0;font-size:11px;line-height:16px">在桌上</span></div>`;
    }).join('');
    return `<div style="width:410px;height:150px">${lab}<div style="display:flex;gap:12px;padding-left:8px">${st}</div></div>`;
  }).join('');
  return `<div class="{{bookCls}}" onClick="{{bookBg}}" style="position:absolute;inset:0;z-index:50">
<div ref="{{refBook}}" class="book" style="position:absolute;left:168px;top:96px;width:944px;height:760px">${tiltLayer(-1.2, `<div style="position:absolute;inset:0;border-radius:18px;background-color:var(--card);background-image:repeating-linear-gradient(135deg,transparent 0 22px,color-mix(in srgb,var(--line) 45%,transparent) 22px 23.5px);box-shadow:0 -4px 10px var(--shadow),0 -20px 50px var(--shadow)"></div>${wob(944, 760, { r: 18, amp: 1.1, sw: 2, seed: 820 })}`)}
<div style="position:relative;padding:30px 44px 0 48px"><div style="display:flex;align-items:center;gap:16px;margin-bottom:22px"><div class="{{face}}">${bookPomelo}</div><div><div style="font-size:26px;font-weight:700;line-height:34px">柚子的贴纸簿</div><div class="i2" style="font-size:13px;line-height:20px">撕一张贴纸，就去那里 · 拖出簿子放到桌上也行</div></div><div style="flex:1"></div><div class="nodrag field" style="position:relative;width:300px;height:42px;display:flex;align-items:center;gap:8px;padding:0 14px">${wob(300, 42, { r: 12, amp: 0.6, sw: 1.7, seed: 821, fill: 'var(--paper)', pad: 4 })}<span style="position:relative;display:flex" class="i2">${glyph('search', 18)}</span><input aria-label="去哪，或问柚子" placeholder="去哪，或问柚子" value="{{q}}" onChange="{{onQ}}" onKeyDown="{{qKey}}" style="position:relative;flex:1;font-size:16px"></div></div>
<sc-if value="{{noMatch}}" hint-placeholder-val="{{false}}"><button type="button" class="press" onClick="{{askFromJump}}" style="position:absolute;right:48px;top:86px;font-size:14px;color:var(--link);display:flex;align-items:center;gap:4px;max-width:300px;white-space:nowrap;overflow:hidden">${glyph('sparkle', 14)}没有这一页，问柚子「{{qText}}」</button></sc-if>
<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 24px">${grid}</div></div></div></div>`;
}

// 叠着的页共用一条手画的边（每种纸一条），不然每页都存一遍，画板会很大
export const edgeSymbols = () => [SHEET, PAD].map((b) => `<symbol id="edge-${b.w}" viewBox="0 0 ${b.w + 16} ${b.h + 16}">${wob(b.w, b.h, { r: 10, amp: 1.1, sw: 1.7, seed: 1200 }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</symbol>`).join('');

export const B_CSS = WHEEL_CSS + SEARCH_CSS + ZINE_CSS + `
.note{cursor:grab;touch-action:none}
.note.lift{cursor:grabbing}
.note.lift .shd{box-shadow:0 2px 4px var(--shadow),0 22px 34px var(--shadow)}
.note .shd{transition:box-shadow .2s}
.desk.in .note{animation:noteIn .55s cubic-bezier(.3,1.5,.5,1) both}
@keyframes noteIn{0%{opacity:0;translate:26px -36px;scale:1.4;rotate:18deg}55%{opacity:1;translate:0 0;scale:.94;rotate:-3deg}78%{scale:1.03;rotate:1deg}100%{opacity:1;translate:0 0;scale:1;rotate:0deg}}
.flipper{transition:transform .65s cubic-bezier(.3,1.35,.5,1)}.flipper.flipped{transform:rotateY(180deg)}
.dstk .dic{transition:transform .35s cubic-bezier(.3,1.6,.5,1)}.dstk:hover .dic{transform:translateY(-6px) scale(1.1)}.dstk:active .dic{transform:scale(.9)}
.tab.gone{display:none}.tab .openmk{opacity:0}.tab.on .openmk{opacity:1}
.ftab{z-index:-1}.ftab .fton{display:none}.ftab.on .fton{display:block}.ftab.on .ftoff{display:none}.ftab.on{z-index:2;font-weight:700}.ftab:not(.on):hover{transform:translateY(-4px)}
.ftab{transition:transform .3s cubic-bezier(.3,1.6,.5,1)}
.sheet{animation:sheetIn .5s cubic-bezier(.25,1.2,.5,1) both}
@keyframes sheetIn{0%{transform:translateX(90px);opacity:0}100%{transform:none;opacity:1}}
.sedge{cursor:pointer;transition:transform .35s cubic-bezier(.3,1.6,.5,1)}
.sedge:hover{transform:translateX(16px)}
.sedge .stsk{transition:transform .35s cubic-bezier(.3,1.6,.5,1)}
.sedge:hover .stsk{transform:rotate(-8deg) scale(1.08)}
.sedge.gone{display:none}
.slapped{animation:noteIn .5s .3s cubic-bezier(.3,1.5,.5,1) both}
.bpanel.in{animation:panelSlap .5s cubic-bezier(.3,1.5,.5,1) both}.bpanel.out{animation:panelFly .26s ease-in both}
@keyframes panelSlap{0%{opacity:0;transform:translate(40px,-60px) rotate(14deg) scale(1.15)}60%{opacity:1;transform:rotate(-1deg) scale(.98)}100%{opacity:1;transform:none}}
@keyframes panelFly{to{opacity:0;transform:translate(160px,-40px) rotate(18deg)}}
.bk{background:rgba(20,24,18,.28)}
.bk.in{animation:fadeIn .25s both}.bk.out{animation:fadeIn .22s reverse both}
.bk.in .book{animation:bookUp .6s cubic-bezier(.25,1.3,.5,1) both}.bk.out .book{animation:bookDown .22s ease-in both}
@keyframes bookUp{0%{transform:translateY(700px) rotate(5deg)}100%{transform:none}}
@keyframes bookDown{to{transform:translateY(700px) rotate(4deg)}}
.stk{cursor:grab}
.stk .stkart{transition:transform .3s cubic-bezier(.3,1.6,.5,1),filter .2s}
.stk:hover .stkart{transform:perspective(300px) rotateX(14deg) rotateY(-10deg) translateY(-5px) scale(1.06) !important;filter:drop-shadow(2px 8px 6px rgba(0,0,0,.2))}
.stk.peeling .stkart{transform:perspective(300px) rotateX(24deg) rotateY(-16deg) translateY(-8px) scale(1.1) !important;filter:drop-shadow(4px 12px 8px rgba(0,0,0,.25))}
.stk.held{z-index:60;cursor:grabbing}.stk.held .stkart{filter:drop-shadow(6px 18px 12px rgba(0,0,0,.28))}
.stk.flyoff{animation:flyoff .45s cubic-bezier(.5,0,.75,0) both;z-index:60}
@keyframes flyoff{0%{transform:none}30%{transform:translateY(-14px) rotate(-10deg) scale(1.15)}100%{transform:translate(-120px,-520px) rotate(-40deg) scale(.4);opacity:0}}
.stk .ghost,.stk .usedtag{display:none}
.stk.used .stkart,.stk.used .stklab{opacity:.3}.stk.used .ghost,.stk.used .usedtag{display:block}
.stk.dim{opacity:.18}.stk.hit .stkart{filter:drop-shadow(0 0 8px var(--marker))}
.hub{filter:drop-shadow(0 3px 3px var(--shadow))}
.eggnote{animation:eggLife 3.2s cubic-bezier(.3,1.4,.5,1) both}
@keyframes eggLife{0%{opacity:0;transform:translate(30px,-40px) rotate(16deg) scale(1.3)}12%{opacity:1;transform:rotate(-2deg) scale(.96)}18%{transform:none}82%{opacity:1;transform:none}100%{opacity:0;transform:translate(60px,-80px) rotate(24deg)}}
.cf i{animation:burst 1.1s cubic-bezier(.2,.7,.3,1) both}
.pmw.f-error.spinme{animation:dizzy 1.1s ease-in-out both}
@keyframes dizzy{0%{transform:rotate(0)}60%{transform:rotate(720deg)}80%{transform:rotate(700deg)}100%{transform:rotate(720deg)}}
`;

export function buildB({ pomeloHub, pomeloBig, pomeloBook, pomeloCenter, printerPomelo, coverPomelo, signPomelo, year = false }) {
  return `${tex('tx', 'calc(var(--tex-o) * .8)')}
${strip(pomeloHub)}
<sc-if value="{{isHome}}" hint-placeholder-val="{{true}}">${desk(pmIcon(60))}</sc-if>
<sc-if value="{{isMoney}}" hint-placeholder-val="{{false}}">${moneyPage()}</sc-if>
<sc-if value="{{isAsk}}" hint-placeholder-val="{{false}}">${askPage(pomeloBig)}</sc-if>
<sc-if value="{{isStub}}" hint-placeholder-val="{{false}}">${stubPage()}</sc-if>
<sc-if value="{{bookOn}}" hint-placeholder-val="{{false}}">${book(pomeloBook)}</sc-if>
<sc-if value="{{jumpOn}}" hint-placeholder-val="{{false}}">${wheel(pomeloCenter)}</sc-if>
<sc-if value="{{searchOn}}" hint-placeholder-val="{{false}}">${searchOverlay(printerPomelo)}</sc-if>
${year ? `<sc-if value="{{zineOn}}" hint-placeholder-val="{{false}}">${zineOverlay({ coverPomelo, signPomelo })}</sc-if>` : ''}
<sc-if value="{{cfgOn}}" hint-placeholder-val="{{false}}">${palettePanel(20, 54, 850)}</sc-if>`;
}
