// 年度小报 = Atlas 年度总结的视觉初稿（VL2 · Phase 2 成文这一轮）。
// 新年第一周桌上出现一个信封：柚子贴纸封口被撕掉、翻盖翻到后面、小报从口袋里升起来，放大成一本合着的书，再翻开。
// 一本 6 个跨页、8 幕：封面 → 目录 | 序章·星星罐 → 留下的日子·十字绣 | 书影相遇 → 几个具体时刻·胶带时间线 | 身体和习惯·贴纸打卡表
//   → 钱·年度小票 | 去年的回声·复写纸 → 终章·柚子的来信 | 完。
// 默认按节拍自动翻（一拍 0.8 秒），碰一下就停；点星星、原话、时刻弹出原记录。字一律摆正，歪的只是纸、胶带和贴纸。
import { P, rrect, circle, ellipse, handStroke, handFill, f, rng } from './lib.mjs';
import { wob, hline, glyph, icon, tape, tiltLayer, money } from './parts.mjs';

const CAT = ['mint', 'sky', 'pink', 'orange', 'grape'];
const CAT_MOD = { mint: ['steps', '一步一步'], sky: ['read', '摸鱼读读'], pink: ['memo', '念念不忘'], orange: ['trip', '出门走走'], grape: ['days', '来日方长'] };
// 小报是印出来的纸：颜色固定，不跟配色走；深色模式下也是浅色的纸（终章的信纸本来就要浅色）
const Z = { paper: '#FFFDF6', cream: '#FFF4D6', ink: '#22261F', ink2: '#5D615A', rule: 'rgba(70,60,40,.12)', kraft: '#EBD3A4', kraftIn: '#D7B67E', flap: '#E2C38B', line: '#2B2F27' };
export const BEAT = 800; // 一拍 0.8 秒（75 BPM）；翻一页 = 一拍
// 每个跨页停几拍；终章不自动往下走，留给读信
export const BEATS = [3, 10, 8, 8, 9, 0];
export const SPREADS = ['封面', '目录 · 序章', '留下的日子 · 书影相遇', '几个具体时刻 · 身体和习惯', '钱 · 去年的回声', '终章 · 完'];

// ---------- 假数据：一年 365 天，每天记了几条、主要是哪个模块 ----------
const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const SPECIAL = { '2-9': [8, 'orange'], '3-2': [7, 'mint'], '3-14': [8, 'pink'], '5-20': [9, 'orange'], '7-8': [9, 'mint'], '9-15': [5, 'grape'], '10-1': [6, 'orange'], '11-1': [7, 'pink'] };
function yearDays() {
  const r = rng(2026);
  const busy = [0.56, 0.6, 0.86, 0.64, 0.7, 0.74, 0.6, 0.5, 0.64, 0.7, 0.72, 0.62];
  const out = [];
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= MD[m - 1]; d++) {
    const a = r(), b = r(), c = r();
    let n = a < busy[m - 1] ? 1 + Math.floor(Math.pow(b, 2.3) * 6) + (m === 3 ? 1 : 0) : 0;
    let cat = CAT[Math.floor(c * 5)];
    const sp = SPECIAL[`${m}-${d}`];
    if (sp) [n, cat] = sp;
    out.push({ m, d, n, cat });
  }
  return out;
}
const DAYS = yearDays();
const LIVED = DAYS.filter((x) => x.n > 0);
const TOTAL = LIVED.reduce((a, x) => a + x.n, 0);
const BY_MONTH = Array.from({ length: 12 }, (_, i) => DAYS.filter((x) => x.m === i + 1).reduce((a, x) => a + x.n, 0));
const TOP_MONTH = BY_MONTH.indexOf(Math.max(...BY_MONTH)) + 1;
const GOLD = new Set(['5-20', '7-8', '3-14', '2-9', '11-1']);
const fmtN = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// 原记录（点开在旅程里弹出原文）
const RECS = {
  note1: { mod: 'memo', modName: '念念不忘', date: '2026 年 11 月 1 日 · 周日', title: '周末想去看海', text: '周末想去看海，顺路买一袋柚子。要是下雨，就在家把那本《海边的柚子树》读完。' },
  echo26: { mod: 'memo', modName: '念念不忘', date: '2026 年 3 月 14 日 · 周六', title: '柚子茶', text: '柚子茶终于不酸了，加了两勺蜂蜜，泡了一大罐，够喝到四月。' },
  echo25: { mod: 'memo', modName: '念念不忘', date: '2025 年 3 月 14 日 · 周五', title: '柚子茶', text: '第一次自己做柚子茶，太酸了。下次少放点皮，多放蜂蜜。' },
  t1: { mod: 'trip', modName: '出门走走', date: '2026 年 2 月 9 日 — 11 日', title: '外婆家', text: '带了 12 样东西，忘了充电线。外婆做了一桌菜，回来胖了一斤。' },
  t2: { mod: 'steps', modName: '一步一步', date: '2026 年 3 月 2 日', title: '目标完成：每天背 20 个单词', text: '连着 60 天，一共 1,200 个。最难记的是 ephemeral。' },
  t3: { mod: 'trip', modName: '出门走走', date: '2026 年 5 月 20 日 — 23 日', title: '海边', text: '第一次一个人去海边。买了一袋柚子，坐在礁石上吃完了。' },
  t4: { mod: 'jobs', modName: '投石问路', date: '2026 年 7 月 8 日', title: '拿到 Offer', text: '柚子科技 · 视觉设计。三轮面试，最后一轮聊了一个小时的手账。' },
  t5: { mod: 'days', modName: '来日方长', date: '2026 年 9 月 15 日', title: '猫猫来家 3 周年', text: '买了一罐冻干，猫猫只吃了两口，剩下的都拿去玩了。' },
  t6: { mod: 'trip', modName: '出门走走', date: '2026 年 10 月 1 日 — 5 日', title: '山里', text: '爬到山顶的时候起雾了，什么都没看见，但是很开心。' },
};
export function zineData() {
  return {
    days: DAYS.map((x) => [x.m, x.d, x.n, CAT.indexOf(x.cat)]),
    recs: RECS, beats: BEATS, beat: BEAT, spreads: SPREADS,
    catMod: CAT.map((c) => CAT_MOD[c][1]),
  };
}

// ---------- 桌上的信封 ----------
// 层次（都在歪着的纸层里）：里层 → 翻盖（打开后退到小报后面）→ 小报（缩小的一本）→ 正面口袋 → 封口贴纸。字在纸层外面，是正的。
export function envelope(seal) {
  const w = 330, h = 210;
  const s = (d, seed, sw = 1.9) => `<path d="${handStroke(d, { amp: 0.9, seed, sp: 2, keep: 3 })}" fill="none" stroke="var(--a-ink)" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"></path>`;
  const fl = (d, seed, c) => `<path d="${handFill(d, { amp: 0.6, seed, sp: 3, prec: 0 })}" fill="${c}"></path>`;
  const body = rrect(0, 0, w, h, 10);
  const flapD = P(`M3 3 L${w / 2} ${Math.round(h * 0.58)} L${w - 3} 3 Z`);
  // 口袋（信封背面）盖住除了翻盖以外的地方；它的 V 口比翻盖的边高一点，合着时一点缝都不露
  const vy = Math.round(h * 0.52);
  const pocketD = P(`M0 2 L${w / 2} ${vy} L${w} 2 L${w} ${h - 10} Q${w} ${h} ${w - 10} ${h} L10 ${h} Q0 ${h} 0 ${h - 10} Z`);
  const pocketTop = P(`M2 3 L${w / 2} ${vy} L${w - 2} 3`);
  const folds = P(`M4 ${h - 4} L${w * 0.4} ${Math.round(h * 0.6)} M${w - 4} ${h - 4} L${w * 0.6} ${Math.round(h * 0.6)}`);
  // 缩小的小报：只有图，没有字（它跟着信封一起歪）
  const mini = `<div class="emini" style="position:absolute;left:105px;top:16px;width:120px;height:156px;z-index:2"><div style="position:absolute;inset:0;border-radius:4px;background:${Z.cream};box-shadow:0 1px 2px rgba(0,0,0,.18)"></div><div style="position:absolute;left:12px;top:16px;width:58px;height:8px;border-radius:4px;background:#FFD23F"></div><div style="position:absolute;left:12px;top:30px;width:36px;height:5px;border-radius:3px;background:rgba(0,0,0,.14)"></div><svg width="70" height="70" viewBox="-6 -6 112 108" style="position:absolute;left:38px;top:62px;transform:rotate(-8deg)" aria-hidden="true"><use href="#pm-static"></use></svg>${tape({ x: 30, y: -8, w: 56, h: 18, rot: 4 })}</div>`;
  return `<button type="button" class="{{envCls}}" onClick="{{openEnv}}" aria-label="拆开：2026 年度小报" style="position:absolute;left:478px;top:236px;width:${w}px;height:${h}px;z-index:30">
${tiltLayer(-3, `<div style="position:absolute;inset:0;border-radius:10px;box-shadow:0 2px 3px var(--shadow),0 16px 30px var(--shadow)"></div><svg width="${w}" height="${h}" style="position:absolute;inset:0;overflow:visible;z-index:0" aria-hidden="true">${fl(body, 950, Z.kraftIn)}</svg><svg class="eflap" width="${w}" height="${h}" style="position:absolute;inset:0;overflow:visible;transform-origin:50% 3px;z-index:4" aria-hidden="true">${fl(flapD, 953, Z.flap)}${s(flapD, 954)}</svg>${mini}<svg width="${w}" height="${h}" style="position:absolute;inset:0;overflow:visible;z-index:3" aria-hidden="true">${fl(pocketD, 955, Z.kraft)}${s(folds, 956, 1.3)}${s(pocketTop, 957, 1.7)}</svg><svg width="${w}" height="${h}" style="position:absolute;inset:0;overflow:visible;z-index:5;pointer-events:none" aria-hidden="true">${s(body, 951)}</svg>`)}
<span class="seal" style="position:absolute;left:${w / 2 - 30}px;top:${Math.round(h * 0.58) - 40}px;width:60px;height:60px;z-index:6">${seal}</span>
<span style="position:absolute;left:0;right:0;bottom:20px;text-align:center;color:#3B2E1C;z-index:7"><span style="display:block;font-size:19px;font-weight:700;line-height:26px">2026 年度小报</span><span style="display:block;font-size:13px;line-height:20px">柚子写的 · {{envHint}}</span></span>
</button>`;
}

// ---------- 页面零件 ----------
const page = (inner, { bg = Z.paper, lines = false, no = '', side = 'r' } = {}) => `<div class="zpg" style="position:absolute;inset:0;background:${bg};${lines ? `background-image:repeating-linear-gradient(transparent 0 31px,${Z.rule} 31px 32px);background-position:0 96px;` : ''}color:${Z.ink}">${inner}${no ? `<div style="position:absolute;${side === 'r' ? 'right' : 'left'}:${side === 'r' ? 46 : 26}px;bottom:16px;font-size:12px;line-height:16px;color:${Z.ink2}" class="num">${no}</div>` : ''}</div>`;
const title = (t, sub = '') => `<div style="font-size:22px;font-weight:700;line-height:30px">${t}</div>${sub ? `<div style="font-size:13px;line-height:20px;color:${Z.ink2}">${sub}</div>` : ''}`;
const top = (t, sub) => `<div style="position:absolute;left:36px;top:34px;right:36px">${title(t, sub)}</div>`;
const stroke = (d, seed, c = Z.line, sw = 1.8, o = {}) => `<path d="${handStroke(typeof d === 'string' ? P(d) : d, { amp: 0.5, seed, sp: 1.2, keep: 2, ...o })}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"></path>`;
const fillp = (d, seed, c, o = {}) => `<path d="${handFill(typeof d === 'string' ? P(d) : d, { amp: 0.4, seed, ...o })}" fill="${c}"></path>`;
// 点开原记录的按钮：样式是纸片，整块能点
const recBtn = (id, inner, style, label) => `<button type="button" class="zrec press" onClick="{{recOpen.${id}}}" aria-label="${label}" style="position:absolute;${style}">${inner}</button>`;

// 纸星星（幸运星）：鼓鼓的五角星，填分类色；金星描墨线
function starPath(r, k = 0.56) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * k : r; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + ' Z';
}
export function zineDefs() {
  const st = handFill(P(starPath(9.4, 0.6)), { amp: 0.25, seed: 1201 });
  const gold = P(starPath(9.4, 0.58));
  const x = 'M-3.2 -3.2 L3.2 3.2 M3.2 -3.2 L-3.2 3.2';
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="zstar" viewBox="-10 -10 20 20" overflow="visible"><path d="${st}" fill="currentColor" stroke="rgba(0,0,0,.22)" stroke-width=".9" stroke-linejoin="round"></path><path d="M-2.5 -4 L-0.6 -6.4" stroke="rgba(255,255,255,.75)" stroke-width="1.4" stroke-linecap="round"></path></symbol>
<symbol id="zgold" viewBox="-10 -10 20 20" overflow="visible"><path d="${handFill(gold, { amp: 0.25, seed: 1202 })}" fill="#FFD23F" transform="translate(.6 .8)"></path><path d="${handStroke(gold, { amp: 0.3, seed: 1203, sp: 0.6 })}" fill="none" stroke="${Z.line}" stroke-width="1.5" stroke-linejoin="round"></path><path d="M-2.6 -4.2 L-0.7 -6.6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"></path></symbol>
<symbol id="zx" viewBox="-5 -5 10 10" overflow="visible"><path d="${handStroke(P(x), { amp: 0.18, seed: 1204, sp: 0.5, keep: 2 })}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"></path></symbol>
</defs></svg>`;
}

// ---------- 0 封面 ----------
function cover(coverPomelo) {
  const r = rng(1101);
  const stars = Array.from({ length: 7 }, (_, i) => `<svg width="22" height="22" viewBox="-10 -10 20 20" style="position:absolute;left:${[300, 336, 58, 250, 344, 92, 196][i]}px;top:${[70, 132, 300, 262, 214, 418, 340][i]}px;color:var(--c-${CAT[i % 5]}-s);transform:rotate(${Math.round(r() * 60 - 30)}deg)" aria-hidden="true"><use href="#zstar" x="-10" y="-10" width="20" height="20"></use></svg>`).join('');
  return page(`${top('柚子的年度小报', '第 1 期 · 2027 年 1 月 2 日')}${stars}
<div style="position:absolute;left:30px;top:118px;font-size:96px;font-weight:700;line-height:1;letter-spacing:2px">2026</div>
<div style="position:absolute;left:44px;top:226px;width:150px;height:14px">${hline(150, { seed: 961, sw: 10, color: '#FFD23F', y: 7 })}</div>
<div style="position:absolute;right:28px;bottom:48px;width:170px;height:170px;transform:rotate(-8deg)" class="pmw f-wow">${coverPomelo}</div>
<div style="position:absolute;left:36px;bottom:50px;width:170px;font-size:15px;line-height:24px;color:${Z.ink2}">这一年<br>都在这本里了</div>
${tape({ x: 150, y: -10, w: 96, rot: 3 })}${tape({ x: 318, y: 470, w: 80, rot: -28, kind: 1 })}`, { bg: Z.cream });
}

// ---------- 1 左：目录（点一行跳过去） ----------
const TOC = [['序章 · 星星罐', 3, 1, 'sparkle'], ['留下的日子', 4, 2, 'memo'], ['书影相遇', 5, 2, 'read'], ['几个具体时刻', 6, 3, 'trip'], ['身体和习惯', 7, 3, 'steps'], ['钱', 8, 4, 'money'], ['去年的回声', 9, 4, 'days'], ['终章 · 柚子的来信', 10, 5, 'memo']];
function tocPage() {
  const rows = TOC.map(([n, pg, zp, ic], i) => `<button type="button" class="ztoc press" onClick="{{zJump.${zp}}}" style="position:absolute;left:36px;right:36px;top:${112 + i * 44}px;height:40px;display:flex;align-items:center;gap:10px;font-size:16px;line-height:22px">${ic === 'sparkle' ? `<span style="display:flex;width:24px;justify-content:center;color:#E0A100">${glyph('sparkle', 20)}</span>` : icon(ic, 24)}<span>${n}</span><span style="flex:1;margin:0 4px;border-bottom:2px dotted rgba(70,60,40,.28);transform:translateY(5px)"></span><span class="num" style="font-size:14px;color:${Z.ink2}">${pg}</span></button>`).join('');
  return page(`${top('这一期', '8 幕 · 柚子按这一年的记录挑的')}${rows}`, { no: '2', side: 'l' });
}

// ---------- 1 右：序章 · 星星罐（一颗星 = 有记录的一天；越多越大，最多的 5 天是金星；点一颗看那天） ----------
function jarPage() {
  const W = 236, H = 300; // 罐子
  const bx = 14, by = 64, bw = W - 28, bh = H - 78, br = 40; // 罐身里面能放星星的地方
  // 从下往上一层层摆：位置固定（种子），按日子先后从罐底往上放
  const r = rng(1301);
  const slots = [];
  for (let row = 0; row < 40; row++) {
    const y = by + bh - 8 - row * 10.4;
    if (y < by + 4) break;
    for (let c = 0; c < 22; c++) {
      const x = bx + 8 + c * 11.6 + (row % 2 ? 5.8 : 0) + (r() - 0.5) * 3;
      const yy = y + (r() - 0.5) * 3;
      // 圆角里面的才算
      const inX = Math.max(0, Math.max(bx + br - x, x - (bx + bw - br)));
      const inY = Math.max(0, yy - (by + bh - br));
      if (x < bx + 6 || x > bx + bw - 6) continue;
      if (inX > 0 && inY > 0 && Math.hypot(inX, inY) > br - 7) continue;
      slots.push([x, yy]);
    }
  }
  slots.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  const groups = Array.from({ length: 12 }, () => []);
  LIVED.forEach((x, i) => {
    const [sx, sy] = slots[i];
    const gold = GOLD.has(`${x.m}-${x.d}`);
    const sz = gold ? 20 : x.n >= 6 ? 15 : x.n >= 3 ? 12.5 : 10.5;
    const rot = Math.round(r() * 72);
    const di = DAYS.indexOf(x);
    groups[x.m - 1].push(`<use href="#${gold ? 'zgold' : 'zstar'}" data-d="${di}" x="${f(sx - sz / 2)}" y="${f(sy - sz / 2)}" width="${f(sz)}" height="${f(sz)}" color="var(--c-${x.cat})" transform="rotate(${rot} ${f(sx)} ${f(sy)})"></use>`);
  });
  // 金星放在最上层，好点
  const stars = groups.map((g, i) => `<g class="jm" style="--i:${i}">${g.filter((u) => !u.includes('zgold')).join('')}${g.filter((u) => u.includes('zgold')).join('')}</g>`).join('');
  const glass = rrect(6, 52, W - 12, H - 58, 46);
  const jar = `<svg class="jar" width="${W}" height="${H}" style="position:absolute;left:0;top:0;overflow:visible" aria-hidden="true">
${fillp(glass, 1310, 'rgba(198,228,240,.32)')}
${stars}
${stroke(glass, 1311, Z.line, 2.6, { amp: 0.7, sp: 2 })}
${stroke(`M${W * 0.18} 96 C${W * 0.14} 140 ${W * 0.14} 200 ${W * 0.2} 250`, 1312, '#FFFFFF', 4.5)}
${stroke(`M${W * 0.27} 84 L${W * 0.3} 80`, 1313, '#FFFFFF', 4.5)}
<g class="lid">${fillp(rrect(28, 18, W - 56, 34, 8), 1314, '#FF9A3C')}${stroke(rrect(28, 18, W - 56, 34, 8), 1315, Z.line, 2.4)}${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => stroke(`M${44 + i * 21} 24 L${44 + i * 21} 46`, 1316 + i, 'rgba(0,0,0,.22)', 1.6)).join('')}</g>
</svg>`;
  return page(`${top('序章', `这一年，你有 ${LIVED.length} 天留下了点什么`)}
<div class="nodrag" onClick="{{jarTap}}" style="position:absolute;left:82px;top:120px;width:${W}px;height:${H}px;cursor:pointer">${jar}</div>
<div style="position:absolute;left:36px;right:36px;top:438px;display:flex;align-items:center;justify-content:center;gap:14px;font-size:13px;line-height:18px;color:${Z.ink2}"><span style="display:flex;align-items:center;gap:4px"><svg width="11" height="11" viewBox="-10 -10 20 20" style="color:var(--c-sky)" aria-hidden="true"><use href="#zstar" x="-10" y="-10" width="20" height="20"></use></svg>记得少</span><span style="display:flex;align-items:center;gap:4px"><svg width="16" height="16" viewBox="-10 -10 20 20" style="color:var(--c-pink)" aria-hidden="true"><use href="#zstar" x="-10" y="-10" width="20" height="20"></use></svg>记得多</span><span style="display:flex;align-items:center;gap:4px"><svg width="18" height="18" viewBox="-10 -10 20 20" aria-hidden="true"><use href="#zgold" x="-10" y="-10" width="20" height="20"></use></svg>最难忘的 5 天</span></div>`, { no: '3' });
}

// ---------- 2 左：留下的日子 · 十字绣日历（一行一个月，一针一天；线越深记得越多） ----------
const THREAD = ['#FFD3B0', '#FFB06A', '#F38A2E', '#C9621A'];
function stitchPage() {
  const pitch = 10, rowH = 18, gx = 26;
  const rows = Array.from({ length: 12 }, (_, m) => {
    const cells = DAYS.filter((x) => x.m === m + 1).map((x) => {
      const cx = gx + (x.d - 1) * pitch + pitch / 2, cy = rowH / 2;
      if (!x.n) return '';
      const lv = x.n >= 7 ? 3 : x.n >= 5 ? 2 : x.n >= 3 ? 1 : 0;
      return `<use href="#zx" x="${f(cx - 4.5)}" y="${f(cy - 4.5)}" width="9" height="9" color="${THREAD[lv]}"></use>`;
    }).join('');
    return `<div class="zrow" style="position:absolute;left:0;top:${Math.round(m * rowH)}px;width:340px;height:${Math.ceil(rowH)}px;--i:${m}"><svg width="340" height="${Math.ceil(rowH)}" style="display:block;overflow:visible" aria-hidden="true">${cells}</svg></div>`;
  }).join('');
  const months = Array.from({ length: 12 }, (_, m) => `<div style="position:absolute;left:0;top:${Math.round(m * rowH)}px;width:20px;height:${Math.ceil(rowH)}px;font-size:10px;line-height:${Math.ceil(rowH)}px;text-align:right;color:${Z.ink2}" class="num">${m + 1}</div>`).join('');
  // 布：浅米色，细细的格子孔
  const cloth = `<div style="position:absolute;left:22px;top:-10px;width:318px;height:${Math.round(12 * rowH) + 20}px;border-radius:6px;background-color:#FBF5E6;background-image:radial-gradient(circle,rgba(90,70,40,.22) .8px,transparent 1.2px);background-size:${pitch}px ${rowH / 2}px;background-position:${gx - 22 + pitch / 2 - 5}px ${rowH / 4 + 10 - 4.5}px;box-shadow:0 1px 2px rgba(0,0,0,.16),0 6px 12px rgba(0,0,0,.06)"></div>`;
  const legend = `<div style="position:absolute;left:36px;top:362px;display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:${Z.ink2}">记得少${THREAD.map((c) => `<svg width="12" height="12" viewBox="-5 -5 10 10" style="color:${c}" aria-hidden="true"><use href="#zx" x="-5" y="-5" width="10" height="10"></use></svg>`).join('')}记得多</div>`;
  const quote = recBtn('note1', `${tiltLayer(-2.5, `<div style="position:absolute;inset:0;border-radius:4px;background:#FFFFFF;box-shadow:0 1px 2px rgba(0,0,0,.18),2px 8px 14px rgba(0,0,0,.08)"></div>${tape({ x: 96, y: -9, w: 58, h: 18, rot: -6 })}`)}<span style="position:relative;display:block;padding:14px 14px 10px;text-align:left"><span style="display:block;font-size:15px;line-height:23px">「周末想去看海，顺路买一袋柚子。」</span><span style="display:block;font-size:12px;line-height:18px;color:${Z.ink2};margin-top:2px">11 月 1 日 · 念念不忘</span></span>`, 'left:36px;top:394px;width:290px;height:66px', '看原文：周末想去看海');
  return page(`${top('留下的日子', `一共 ${fmtN(TOTAL)} 条 · ${TOP_MONTH} 月记得最多`)}
<div style="position:absolute;left:32px;top:116px;width:340px;height:${Math.round(12 * rowH)}px">${cloth}${months}<div class="stitches" style="position:absolute;inset:0">${rows}</div></div>
${legend}${quote}`, { no: '4', side: 'l' });
}

// ---------- 2 右：书影相遇（书架 + 电影票根） ----------
function booksPage() {
  const r = rng(970);
  let x = 0, spines = '';
  for (let i = 0; i < 12; i++) {
    const w = 16 + Math.round(r() * 8), hh = 66 + Math.round(r() * 36);
    const c = CAT[i % 5];
    const d = rrect(x + 2, 110 - hh, w, hh, 3);
    spines += `<g class="bsp" style="--i:${i}"><path d="${handFill(d, { amp: 0.4, seed: 971 + i })}" fill="var(--c-${c}-s)" transform="translate(1 1.4)"></path><path d="${handStroke(d, { amp: 0.5, seed: 990 + i })}" fill="none" stroke="${Z.line}" stroke-width="1.7" stroke-linejoin="round"></path><path d="${handStroke(P(`M${x + 5} ${116 - hh + 10} L${x + w - 1} ${116 - hh + 10}`), { amp: 0.3, seed: 1010 + i })}" stroke="${Z.line}" stroke-width="1.2"></path></g>`;
    x += w + 2;
  }
  const shelf = `<path d="${handStroke(P(`M0 113 L${x + 8} 112`), { amp: 0.7, seed: 1030 })}" stroke="${Z.line}" stroke-width="2.4" stroke-linecap="round"></path>`;
  const T = [['柚子味的夏天', 5, '#FFE7EF'], ['晚风', 4, '#E3F1FC'], ['雨停之前', 4, '#E4F6EC']];
  const tickets = T.map(([n, s, bg], i) => `<div class="tk" style="position:absolute;left:${[0, 112, 224][i]}px;top:${[0, 14, 4][i]}px;width:104px;height:104px;--i:${i}">${tiltLayer([-5, 3, -2][i], `<div style="position:absolute;inset:0;background:${bg};border-radius:6px;box-shadow:0 1px 2px rgba(0,0,0,.18);clip-path:polygon(0 0,100% 0,100% 40%,94% 50%,100% 60%,100% 100%,0 100%,0 60%,6% 50%,0 40%)"></div><div style="position:absolute;left:8px;right:8px;top:30px;border-top:1.5px dashed rgba(0,0,0,.25)"></div>`)}<div style="position:relative;padding:7px 12px 0;font-size:12px;line-height:18px;color:${Z.ink2}">电影票 · 1 张</div><div style="position:relative;padding:10px 12px 0;font-size:13px;line-height:19px;font-weight:700;white-space:nowrap">${n}</div><div style="position:relative;padding:4px 12px;font-size:13px;line-height:18px;color:#A87400">${'★'.repeat(s)}${'☆'.repeat(5 - s)}</div></div>`).join('');
  return page(`${top('书影相遇', '读完 12 本，看完 9 部')}
<svg width="${x + 10}" height="120" style="position:absolute;left:36px;top:100px;overflow:visible" aria-hidden="true">${spines}${shelf}</svg>
<div style="position:absolute;left:36px;top:236px;font-size:15px;line-height:22px">最喜欢的：<span style="position:relative;z-index:0;font-weight:700">《海边的柚子树》${hline(140, { seed: 1040, sw: 9, color: '#FFD23F', y: 6, style: 'position:absolute;left:0;bottom:-2px;z-index:-1' })}</span></div>
<div style="position:absolute;left:36px;top:292px;font-size:13px;line-height:20px;color:${Z.ink2}">电影票根</div>
<div style="position:absolute;left:36px;top:322px;width:330px;height:124px">${tickets}</div>`, { no: '5' });
}

// ---------- 3 左：几个具体时刻（竖着一条胶带，时刻按日子贴在旁边） ----------
const MOMENTS = [['t1', '2/9', 'trip', '外婆家', '出门走走 · 3 天'], ['t2', '3/2', 'steps', '背完 1,200 个单词', '一步一步 · 目标完成'], ['t3', '5/20', 'trip', '一个人去海边', '出门走走 · 4 天'], ['t4', '7/8', 'jobs', '拿到 Offer', '投石问路'], ['t5', '9/15', 'days', '猫猫来家 3 周年', '来日方长'], ['t6', '10/1', 'trip', '山里起雾了', '出门走走 · 5 天']];
function momentsPage() {
  const items = MOMENTS.map(([id, d, ic, t, sub], i) => {
    const y = 104 + i * 64;
    const anniv = id === 't5';
    return `<div class="mo" style="position:absolute;left:0;top:${y}px;width:400px;height:58px;--i:${i}"><div class="num" style="position:absolute;left:18px;top:16px;width:46px;height:24px;border-radius:12px;background:#FFFFFF;box-shadow:0 1px 2px rgba(0,0,0,.2);font-size:13px;line-height:24px;text-align:center;font-weight:700">${d}</div>${recBtn(id, `${tiltLayer([-1.5, 1.2, -1, 1.5, -1.2, 1][i], `<div style="position:absolute;inset:0;border-radius:8px;background:${anniv ? '#FFE7EF' : '#FFFFFF'};box-shadow:0 1px 2px rgba(0,0,0,.16),2px 6px 12px rgba(0,0,0,.07)"></div>`)}<span style="position:relative;display:flex;align-items:center;gap:10px;padding:0 12px;height:52px;text-align:left">${icon(ic, 30)}<span style="display:block"><span style="display:block;font-size:15px;line-height:21px;font-weight:700">${t}</span><span style="display:block;font-size:12px;line-height:17px;color:${Z.ink2}">${sub}</span></span></span>`, 'left:80px;top:3px;width:284px;height:52px', `看原记录：${t}`)}</div>`;
  }).join('');
  const tapeV = `<div class="tapev" style="position:absolute;left:30px;top:92px;width:22px;height:388px;background:repeating-linear-gradient(45deg,#C4EDD9 0 7px,#A6E3C6 7px 14px);opacity:.9;clip-path:polygon(0 0,20% 1.2%,40% 0,60% 1.2%,80% 0,100% 1.2%,100% 98.8%,80% 100%,60% 98.8%,40% 100%,20% 98.8%,0 100%);transform-origin:50% 0"></div>`;
  return page(`${top('几个具体时刻')}${tapeV}${items}`, { no: '6', side: 'l' });
}

// ---------- 3 右：身体和习惯 · 贴纸打卡表（六月的日历，打了卡的日子贴一张；连着的 23 天描了荧光笔） ----------
function habitPage() {
  const on = new Set([1, ...Array.from({ length: 23 }, (_, i) => i + 3), 27, 29]);
  const cell = 44, gx = 36, gy = 176;
  let k = 0;
  const cells = Array.from({ length: 30 }, (_, i) => {
    const d = i + 1, col = i % 7, row = Math.floor(i / 7);
    const x = gx + col * cell, y = gy + row * cell;
    const has = on.has(d), last = d === 25;
    const st = has ? `<svg class="hs" width="${last ? 34 : 28}" height="${last ? 34 : 28}" viewBox="-10 -10 20 20" style="position:absolute;left:${x + (last ? 9 : 13)}px;top:${y + (last ? 9 : 13)}px;--i:${k++};transform:rotate(${(d * 37) % 50 - 25}deg)" aria-hidden="true"><use href="#${last ? 'zgold' : 'zstar'}" x="-10" y="-10" width="20" height="20" ${last ? '' : `color="var(--c-${d >= 3 && d <= 25 ? 'mint' : 'sky'})"`}></use></svg>` : '';
    return `<div class="num" style="position:absolute;left:${x}px;top:${y}px;width:${cell}px;height:${cell}px;font-size:12px;line-height:16px;color:${Z.ink2};padding:2px 0 0 4px">${d}</div>${st}`;
  }).join('');
  const week = '一二三四五六日'.split('').map((w, i) => `<div style="position:absolute;left:${gx + i * cell}px;top:150px;width:${cell}px;text-align:center;font-size:12px;line-height:18px;color:${Z.ink2}">${w}</div>`).join('');
  // 连着的 23 天：6/3–6/7、6/8–6/14、6/15–6/21、6/22–6/25，荧光笔描在格子下面
  const runs = [[0, 2, 6], [1, 0, 6], [2, 0, 6], [3, 0, 3]].map(([row, c0, c1], i) => `<div style="position:absolute;left:${gx + c0 * cell + 4}px;top:${gy + row * cell + 8}px;width:${(c1 - c0 + 1) * cell - 8}px;height:28px">${hline((c1 - c0 + 1) * cell - 8, { seed: 1401 + i, sw: 22, color: 'rgba(166,227,198,.55)', y: 14 })}</div>`).join('');
  const chips = [['跑步', '112 天', 'mint'], ['早睡', '48 天', 'grape'], ['喝水', '26 天', 'sky']].map(([n, v, c]) => `<span style="display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:13px;background:var(--c-${c}-s);font-size:13px;line-height:18px">${n}<b class="num">${v}</b></span>`).join('');
  return page(`${top('身体和习惯', '最长连着跑了 23 天 · 6 月 3 日到 25 日')}
<div style="position:absolute;left:36px;top:96px;display:flex;align-items:baseline;gap:6px"><span class="num" style="font-size:40px;font-weight:700;line-height:48px">23</span><span style="font-size:15px;line-height:22px">天</span><span style="font-size:13px;line-height:20px;color:${Z.ink2};margin-left:8px">六月的跑步打卡表</span></div>
${week}${runs}${cells}
<div style="position:absolute;left:36px;right:36px;top:410px;display:flex;flex-wrap:wrap;gap:8px">${chips}</div>
<div style="position:absolute;left:36px;top:450px;font-size:13px;line-height:20px;color:${Z.ink2}">这一年一共打卡 186 天</div>`, { no: '7' });
}

// ---------- 4 左：钱 · 年度小票（像桌上的资产小票，打印出来） ----------
function moneyPage() {
  const rows = [['吃饭', 12340], ['出门', 6820], ['猫猫', 3200], ['买书看片', 1960], ['画画', 1480], ['其他', 2700]];
  const spent = rows.reduce((a, [, v]) => a + v, 0);
  const W = 268, H = 392;
  const zz = []; const n = 12;
  for (let i = 0; i <= n * 2; i++) zz.push(`${f((i / (n * 2)) * 100)}% ${i % 2 ? 'calc(100% - 9px)' : '100%'}`);
  const clip = `polygon(0 0,100% 0,${zz.reverse().join(',')})`;
  const dash = `<div style="border-top:2px dashed rgba(70,60,40,.25);margin:9px 0"></div>`;
  const line = (k, v, o = '') => `<div style="display:flex;justify-content:space-between;align-items:center;height:24px;font-size:14px;line-height:20px;${o}"><span style="color:${Z.ink2}">${k}</span><span class="num">${v}</span></div>`;
  const bars = Array.from({ length: 28 }, (_, i) => `<i style="display:block;width:${[2, 1, 3, 1, 2, 2, 1, 3][i % 8]}px;height:26px;background:${Z.ink}"></i>`).join('');
  const inner = `<div style="text-align:center;font-size:13px;line-height:19px;color:${Z.ink2}">— 柚儿园 · 年度小票 —<br><span class="num">2026.01.01 – 12.31</span></div>${dash}${rows.map(([k, v]) => line(k, '¥' + money(v, false))).join('')}${dash}${line('一共花了', '¥' + money(spent, false), 'font-weight:700')}<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px"><span style="font-size:14px;line-height:20px">存下</span><span class="num" style="font-size:30px;font-weight:700;line-height:38px">¥28,460</span></div><div style="font-size:12px;line-height:18px;color:${Z.ink2};text-align:right">总资产 <span class="num">¥142,300 → ¥186,420</span></div><div style="display:flex;justify-content:center;gap:2px;margin-top:12px">${bars}</div>`;
  return page(`${top('钱', '比去年多存了一点')}
<div class="rcp" style="position:absolute;left:66px;top:102px;width:${W}px;height:${H}px">${tiltLayer(-1.5, `<div style="position:absolute;inset:0;filter:drop-shadow(0 4px 8px rgba(0,0,0,.14))"><div style="position:absolute;inset:0;background:#FFFFFF;clip-path:${clip}"></div></div>`)}<div style="position:relative;padding:16px 20px">${inner}</div></div>`, { no: '8', side: 'l' });
}

// ---------- 4 右：去年的回声 · 复写纸（今年这页底下垫着去年同一天，掀开看） ----------
function echoPage() {
  const sheet = (bg, inner, extra = '') => `<div style="position:absolute;inset:0;border-radius:4px;background:${bg};box-shadow:0 1px 2px rgba(0,0,0,.18),2px 8px 14px rgba(0,0,0,.08);${extra}"></div><div style="position:relative;padding:14px 16px">${inner}</div>`;
  const lastYear = `<div class="num" style="font-size:12px;line-height:18px;color:#3A55A8">2025 年 3 月 14 日</div><div style="font-size:15px;line-height:24px;color:#2C4596;margin-top:6px">第一次自己做柚子茶，太酸了。下次少放点皮，多放蜂蜜。</div>`;
  const thisYear = `<div class="num" style="font-size:12px;line-height:18px;color:${Z.ink2}">2026 年 3 月 14 日</div><div style="font-size:15px;line-height:24px;margin-top:6px">柚子茶终于不酸了，加了两勺蜂蜜，泡了一大罐。</div>`;
  const cmp = [['笔记', '268', '312'], ['读完', '9 本', '12 本'], ['出门', '2 趟', '4 趟'], ['花的钱', '¥31,200', '¥28,500']].map(([k, a, b]) => `<div style="display:flex;align-items:center;height:26px;font-size:14px;line-height:20px"><span style="width:64px;color:${Z.ink2}">${k}</span><span class="num" style="width:88px;color:${Z.ink2}">${a}</span><span style="width:26px;color:${Z.ink2}">→</span><span class="num" style="font-weight:700">${b}</span></div>`).join('');
  return page(`${top('去年的回声', '3 月 14 日，两年都记了一笔')}
<div style="position:absolute;left:36px;top:100px;width:328px;height:240px">
${recBtn('echo25', `${tiltLayer(1.8, sheet('#E6EDFA', '', 'background-image:repeating-linear-gradient(transparent 0 23px,rgba(58,85,168,.12) 23px 24px)'))}<span style="position:absolute;left:84px;right:30px;top:20px;display:block;text-align:left">${lastYear}</span>`, 'left:8px;top:12px;width:320px;height:190px', '看去年的原文')}
<div class="{{echoCls}}" style="position:absolute;left:0;top:0;width:300px;height:176px;transform-origin:0 50%">${recBtn('echo26', `${tiltLayer(-1.2, sheet('#FFFFFF', ''))}<span class="et" style="position:relative;display:block;padding:16px 18px;text-align:left">${thisYear}</span>`, 'left:0;top:0;width:300px;height:176px', '看今年的原文')}${tape({ x: 116, y: -10, w: 70, h: 20, rot: -3 })}</div>
<button type="button" class="press" onClick="{{echoFlip}}" style="position:absolute;right:0;top:212px;height:28px;padding:0 12px;border-radius:14px;background:#FFFFFF;box-shadow:0 1px 2px rgba(0,0,0,.22);font-size:13px;line-height:18px;color:#2C4596;display:flex;align-items:center">{{echoLabel}}</button>
</div>
<div style="position:absolute;left:36px;top:352px;font-size:13px;line-height:20px;color:${Z.ink2}">和去年比</div>
<div style="position:absolute;left:36px;top:376px;width:328px">${cmp}</div>`, { no: '9' });
}
// ---------- 5 左：终章 · 柚子的来信（浅色信纸） ----------
function letterPage(signPomelo) {
  const paras = [
    `这一年你有 ${LIVED.length} 天留下了点什么，${TOP_MONTH} 月最勤快。`,
    '你读完 12 本书，最喜欢《海边的柚子树》；5 月 20 日一个人去了海边，那天花得最多，不过我猜你很开心。',
    '六月连着跑了 23 天，七月拿到了 Offer，柚子茶也终于不酸了。',
    '明年也慢慢来，我一直在这儿。',
  ];
  return page(`${top('给 2026 的你')}
<div class="pf ltr" style="position:absolute;left:36px;top:96px;right:36px;font-size:15px;line-height:32px">${paras.map((p, i) => `<p style="margin:0;--i:${i}">${p}</p>`).join('')}</div>
<div style="position:absolute;right:40px;top:424px;font-size:16px;line-height:24px">— 柚子</div>
<div class="pmw f-happy" style="position:absolute;left:30px;top:400px;width:80px;height:80px">${signPomelo}</div>`, { bg: '#FFFDF8', lines: true, no: '10', side: 'l' });
}

// ---------- 5 右：完 ----------
function endPage() {
  const r = rng(1080);
  const bits = Array.from({ length: 22 }, (_, i) => {
    const a = r() * Math.PI * 2, d = 90 + r() * 150;
    const c = ['#FFD23F', '#F78FB3', '#4AA8E8', '#3DBE8B', '#9B87F5', '#FF9A3C'][i % 6];
    const shape = i % 3 === 0 ? 'border-radius:50%' : i % 3 === 1 ? 'border-radius:2px' : 'clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%)';
    return `<i style="position:absolute;left:0;top:0;width:${8 + Math.round(r() * 6)}px;height:${8 + Math.round(r() * 6)}px;background:${c};${shape};--dx:${Math.round(Math.cos(a) * d)}px;--dy:${Math.round(Math.sin(a) * d - 60)}px;--rr:${Math.round(r() * 540 - 270)}deg;animation-delay:${(r() * 0.12).toFixed(2)}s;display:block"></i>`;
  }).join('');
  const b = (label, gl, h, seed, ww) => `<button type="button" class="press" onClick="{{${h}}}" style="position:relative;height:38px;width:${ww}px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:15px;line-height:22px"><span style="position:absolute;inset:0">${wob(ww, 38, { r: 10, amp: 0.5, sw: 1.6, seed, fill: '#FFFFFF', pad: 4, color: 'var(--a-ink)' })}</span><span style="position:relative;display:flex;align-items:center;gap:6px">${glyph(gl, 16)}${label}</span></button>`;
  return page(`<div style="position:absolute;left:0;right:0;top:150px;text-align:center"><div style="font-size:40px;font-weight:700;line-height:52px">完</div><div style="font-size:15px;line-height:24px;color:${Z.ink2};margin-top:6px">柚子的年度小报 · 第 1 期<br>明年见</div></div>
<div style="position:absolute;left:0;right:0;top:330px;display:flex;justify-content:center;gap:14px">${b('再看一遍', 'back2', 'zRestart', 1083, 118)}${b('收进抽屉', 'check', 'closeZine', 1081, 118)}</div>
${tape({ x: 160, y: 120, w: 84, rot: -4, kind: 1 })}
<sc-if value="{{confetti}}" hint-placeholder-val="{{false}}"><div class="cf" style="position:absolute;left:200px;top:250px;width:0;height:0">${bits}</div></sc-if>`, { bg: Z.cream });
}

// ---------- 弹出的原记录 ----------
function recPopup() {
  return `<sc-if value="{{recOn}}" hint-placeholder-val="{{false}}"><div class="zpop" onClick="{{recBg}}" style="position:absolute;inset:0;z-index:70">
<div class="zcard" style="position:absolute;left:460px;top:210px;width:360px;height:260px">
${tiltLayer(-1.2, `<div style="position:absolute;inset:0;border-radius:10px;background:#FFFFFF;box-shadow:0 2px 4px rgba(0,0,0,.2),0 18px 36px rgba(0,0,0,.25)"></div>${tape({ x: 140, y: -10, w: 80, h: 20, rot: 3 })}`)}
<div style="position:relative;padding:22px 24px 0;color:${Z.ink}">
<div style="display:flex;align-items:center;gap:8px;font-size:13px;line-height:20px;color:${Z.ink2}"><span style="height:22px;padding:0 9px;border-radius:8px;background:#FFF0C2;color:${Z.ink};line-height:22px">{{rec.modName}}</span><span>{{rec.date}}</span></div>
<div style="font-size:19px;font-weight:700;line-height:28px;margin-top:8px">{{rec.title}}</div>
<div class="pf" style="font-size:15px;line-height:25px;margin-top:6px;height:100px;overflow:hidden">{{rec.text}}</div>
</div>
<div style="position:absolute;left:24px;right:24px;bottom:18px;display:flex;align-items:center;gap:10px">
<button type="button" class="press framed" onClick="{{recGo}}" style="position:relative;width:180px;height:34px;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:20px;color:${Z.ink};white-space:nowrap"><span style="position:absolute;inset:0">${wob(180, 34, { r: 10, amp: 0.5, sw: 1.6, seed: 1501, fill: '#FFF4D6', pad: 4, color: 'var(--a-ink)' })}</span><span style="position:relative">在「{{rec.modName}}」里打开</span></button>
<span style="flex:1"></span>
<button type="button" class="press" onClick="{{recClose}}" style="height:34px;padding:0 10px;font-size:14px;line-height:20px;color:${Z.ink2};display:flex;align-items:center;gap:4px">${glyph('x', 16)}关掉</button>
</div>
</div>
</div></sc-if>`;
}

export function zineOverlay({ coverPomelo, signPomelo }) {
  // 叶子：正面在右、背面在左；pages[i] = [正面, 背面]
  const leaves = [[cover(coverPomelo), tocPage()], [jarPage(), stitchPage()], [booksPage(), momentsPage()], [habitPage(), moneyPage()], [echoPage(), letterPage(signPomelo)]];
  const leaf = (i, [front, back]) => `<div ref="{{refLeaf${i}}}" class="{{leafCls.${i}}}" style="position:absolute;left:400px;top:0;width:400px;height:520px;transform-origin:0 50%;transform-style:preserve-3d;z-index:{{leafZ.${i}}}"><div class="{{faceCls.f${i}}}" style="position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:0 8px 8px 0;overflow:hidden">${front}<div class="shade r"></div><div class="ear"></div></div><div class="{{faceCls.b${i}}}" style="position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);border-radius:8px 0 0 8px;overflow:hidden">${back}<div class="shade l"></div></div></div>`;
  return `<div class="{{zineCls}}" ref="{{refZine}}" tabindex="-1" onKeyDown="{{zKey}}" onClick="{{zineBg}}" style="position:absolute;inset:0;z-index:58;outline:none">
<div class="zfly" style="position:absolute;left:240px;top:110px;width:800px;height:520px;transform-origin:400px 260px">
<div class="{{zShift}}" onPointerDown="{{zineDown}}" onPointerMove="{{dragMove}}" onPointerUp="{{dragEnd}}" onPointerCancel="{{dragEnd}}" style="position:absolute;inset:0;perspective:2400px;touch-action:none">
<div class="zboard" style="position:absolute;top:-8px;height:536px;border-radius:12px;background:#C9A36B;box-shadow:0 4px 8px rgba(0,0,0,.2),0 30px 60px rgba(0,0,0,.25)"></div>
<div style="position:absolute;left:400px;top:0;width:400px;height:520px;border-radius:0 8px 8px 0;overflow:hidden" class="{{faceCls.end}}">${endPage()}<div class="shade r"></div></div>
${leaves.map((p, i) => leaf(i, p)).join('')}
<div class="zspine" style="position:absolute;left:396px;top:0;width:8px;height:520px;background:linear-gradient(90deg,rgba(0,0,0,.08),rgba(0,0,0,.22),rgba(0,0,0,.08));z-index:30;pointer-events:none"></div>
</div>
</div>
<button type="button" class="press zx" onClick="{{closeZine}}" aria-label="收起小报" style="position:absolute;left:1060px;top:96px;width:40px;height:40px;border-radius:20px;background:rgba(20,24,18,.72);color:#FFFFFF;display:flex;align-items:center;justify-content:center">${glyph('x', 20)}</button>
<div class="zbar" style="position:absolute;left:390px;top:650px;width:500px;height:44px;border-radius:22px;background:rgba(20,24,18,.78);color:#FFFFFF;display:flex;align-items:center;padding:0 8px;gap:4px;font-size:14px;line-height:20px">
<button type="button" class="press" onClick="{{zPrev}}" aria-label="上一页" style="display:flex;width:36px;height:36px;align-items:center;justify-content:center;color:#FFFFFF">${glyph('back', 22)}</button>
<span style="flex:1;text-align:center;white-space:nowrap">{{zLabel}}<span class="num" style="opacity:.7;margin-left:8px">{{zPage}} / 6</span></span>
<button type="button" class="press" onClick="{{zNext}}" aria-label="下一页" style="display:flex;width:36px;height:36px;align-items:center;justify-content:center;color:#FFFFFF">${glyph('fwd', 22)}</button>
<span style="width:1px;height:20px;background:rgba(255,255,255,.3);margin:0 4px"></span>
<button type="button" class="press" onClick="{{zAuto}}" aria-label="{{autoAria}}" style="display:flex;height:36px;padding:0 10px;align-items:center;gap:5px;color:#FFFFFF"><sc-if value="{{autoOn}}" hint-placeholder-val="{{true}}">${glyph('pause', 18)}</sc-if><sc-if value="{{autoOff}}" hint-placeholder-val="{{false}}">${glyph('play', 18)}</sc-if>自动翻</button>
<button type="button" class="press" onClick="{{zMusic}}" aria-label="{{musicAria}}" style="display:flex;width:36px;height:36px;align-items:center;justify-content:center;color:#FFFFFF"><sc-if value="{{musicOn}}" hint-placeholder-val="{{false}}">${glyph('note', 20)}</sc-if><sc-if value="{{musicOff}}" hint-placeholder-val="{{true}}">${glyph('noteoff', 20)}</sc-if></button>
</div>
${recPopup()}
</div>`;
}

export const ZINE_CSS = `
.zn::before{content:"";position:absolute;inset:0;background:rgba(20,24,18,.5)}
.zn.in::before{animation:fadeIn .3s both}.zn.out{animation:fadeIn .3s reverse both}
/* 从信封里那本缩小的小报放大出来；收起时缩回信封 */
.zn.in .zfly{animation:zineIn .62s cubic-bezier(.3,1.15,.5,1) both}
.zn.out .zfly{animation:zineOut .32s ease-in both}
@keyframes zineIn{0%{transform:translate(3px,-144px) scale(.3) rotate(-3deg)}100%{transform:none}}
@keyframes zineOut{to{transform:translate(3px,-144px) scale(.3) rotate(-3deg);opacity:0}}
.zn.in .zbar,.zn.in .zx{animation:fadeIn .4s .5s both}
/* 合着的时候封面在中间；翻开时整本往右挪 */
.zshift{transition:transform .8s cubic-bezier(.35,.1,.2,1)}
.zshift.closed{transform:translateX(-200px)}
.zshift.closed .zboard{left:390px;width:420px}
.zboard{left:-10px;width:820px;transition:left .8s cubic-bezier(.35,.1,.2,1),width .8s cubic-bezier(.35,.1,.2,1)}
.zshift.closed .zspine{opacity:0}
.leaf{transition:transform .8s cubic-bezier(.35,.1,.2,1);cursor:grab}
.leaf.flipped{transform:rotateY(-180deg)}
.zshift .shade{position:absolute;top:0;bottom:0;width:40px;pointer-events:none}
.zshift .shade.r{left:0;background:linear-gradient(90deg,rgba(0,0,0,.12),transparent)}
.zshift .shade.l{right:0;background:linear-gradient(270deg,rgba(0,0,0,.12),transparent)}
.zshift .ear{position:absolute;right:0;bottom:0;width:0;height:0;background:linear-gradient(315deg,transparent 50%,#E9DDBF 50%);box-shadow:-2px -2px 4px rgba(0,0,0,.12);transition:width .25s,height .25s}
.zshift:hover .leaf:not(.flipped) .ear{width:30px;height:30px}
.zrec{display:block;text-align:left;color:inherit;cursor:pointer}
.ztoc:hover span:nth-child(2){text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px;text-decoration-color:#FFD23F}
.cf i{animation:burst 1.1s cubic-bezier(.2,.7,.3,1) both}
@keyframes burst{0%{transform:translate(0,0) scale(.2) rotate(0);opacity:1}70%{opacity:1}100%{transform:translate(var(--dx),calc(var(--dy) + 120px)) scale(1) rotate(var(--rr));opacity:0}}
/* ---------- 每一幕的入场：翻到这一页才放（.go）；没放的时候就是画好的样子 ---------- */
.zs.go .jm{animation:starDrop .62s cubic-bezier(.3,1.35,.5,1) both;animation-delay:calc(.55s + var(--i) * .26s)}
@keyframes starDrop{0%{transform:translateY(-150px);opacity:0}35%{opacity:1}100%{transform:none}}
.zs.go .lid{animation:lidOn .5s cubic-bezier(.3,1.6,.5,1) 3.9s both}
@keyframes lidOn{0%{transform:translateY(-40px) rotate(-8deg);opacity:0}100%{transform:none;opacity:1}}
.zs.go .zrow{animation:sew .5s steps(16) both;animation-delay:calc(.5s + var(--i) * .2s)}
@keyframes sew{0%{clip-path:inset(0 100% 0 0)}100%{clip-path:inset(0 0 0 0)}}
.zs.go .bsp{animation:spineUp .5s cubic-bezier(.3,1.4,.5,1) both;animation-delay:calc(.5s + var(--i) * .07s)}
@keyframes spineUp{0%{transform:translateY(30px);opacity:0}100%{transform:none;opacity:1}}
.zs.go .tk{animation:slapIn .55s cubic-bezier(.3,1.6,.5,1) both;animation-delay:calc(1.5s + var(--i) * .18s)}
.zs.go .tapev{animation:tapeDown .7s cubic-bezier(.4,0,.2,1) .45s both}
@keyframes tapeDown{0%{transform:scaleY(0)}100%{transform:none}}
.zs.go .mo{animation:moPop .5s cubic-bezier(.3,1.6,.5,1) both;animation-delay:calc(.9s + var(--i) * .32s)}
@keyframes moPop{0%{transform:translateX(-14px) scale(.9);opacity:0}100%{transform:none;opacity:1}}
.zs.go .hs{animation:hsSlap .32s cubic-bezier(.3,1.7,.5,1) both;animation-delay:calc(.8s + var(--i) * .07s)}
@keyframes hsSlap{0%{opacity:0;scale:1.8}100%{opacity:1;scale:1}}
.zs.go .rcp{animation:print 1.4s steps(18) .5s both}
@keyframes print{0%{clip-path:inset(0 0 100% 0)}100%{clip-path:inset(0 0 -20px 0)}}
.zs.go .ltr p{animation:fadeIn .6s both;animation-delay:calc(.6s + var(--i) * .7s)}
.echo{transition:transform .6s cubic-bezier(.3,1.25,.5,1)}
.echo .et{transition:opacity .25s}
.echo.up{transform:perspective(900px) rotateY(78deg)}
.echo.up .et{opacity:0}
.zs.go .echo:not(.up){animation:peek 2.4s ease-in-out 2s both}
@keyframes peek{0%,100%{transform:none}30%,70%{transform:perspective(900px) rotateY(50deg)}}
.zpop{animation:fadeIn .2s both;background:rgba(20,24,18,.25)}
.zpop .zcard{animation:slapIn .45s cubic-bezier(.3,1.5,.5,1) both}
/* 桌上的信封：撕掉封口贴纸 → 翻盖翻起来退到后面 → 小报升起来 */
.env{cursor:pointer;transition:transform .35s cubic-bezier(.3,1.6,.5,1)}
.env:hover{transform:translateY(-4px)}
.env .seal{animation:sealPulse 2.8s ease-in-out infinite}
@keyframes sealPulse{0%,70%,100%{transform:none}78%{transform:scale(1.12) rotate(-8deg)}86%{transform:scale(.96) rotate(5deg)}92%{transform:scale(1.03)}}
.env.open .seal{animation:sealOff .45s cubic-bezier(.3,.6,.4,1) both}
@keyframes sealOff{0%{transform:none;opacity:1}40%{transform:translate(8px,-16px) rotate(-22deg) scale(1.12);opacity:1}100%{transform:translate(46px,-84px) rotate(-48deg) scale(.9);opacity:0}}
.env.open .eflap{animation:flapOpen .5s .3s cubic-bezier(.4,0,.2,1) both}
@keyframes flapOpen{0%{transform:perspective(700px) rotateX(0);z-index:4;filter:none}49%{z-index:4;filter:none}51%{z-index:1;filter:brightness(.9)}100%{transform:perspective(700px) rotateX(180deg);z-index:1;filter:brightness(.9)}}
.env .emini{transition:transform .5s cubic-bezier(.3,1.3,.5,1)}
.env.open .emini{transform:translateY(-104px);transition-delay:.72s}
@media (prefers-reduced-motion: reduce){.zs .jm,.zs .lid,.zs .zrow,.zs .bsp,.zs .tk,.zs .tapev,.zs .mo,.zs .hs,.zs .rcp,.zs .ltr p,.zs .echo{animation:none!important}.env.open .seal{opacity:0}.leaf,.zshift,.zboard,.echo{transition:none!important}.env.open .eflap{animation:none;transform:rotateX(180deg);z-index:1}}
`;
