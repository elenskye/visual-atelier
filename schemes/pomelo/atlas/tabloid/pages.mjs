// Tabloid：年度小报的每一页，照一份「呈现结果」画（Pomelo `youzi/atlas.rs` 存的：数字和记录的快照 + 模型给各幕写的话，
// 形状见 ../README.md「数据」）。数字、日期、图都由这里照快照画，模型的话只是每一幕那一两句和它挑的记录。
// 没有的幕整页不出现；一幕里缺的那一块（没挑引用、没有去年）就不画那一块。
// 能点开原记录的东西写 data-rec="<记录的键>"；星图上的星星写 data-day="月-日"。
import { P, f, rng, rrect, circle, ellipse } from '../../../../tooling/handmade/line.mjs';
import { PW, PH, INK, INK2, RULE, NIGHT, NIGHT2, CARBON, CARBON_BG, CATS, LINE, cat, soft, st, fl, svg, fmt, b, deg, esc, clip, plainNote, hash, md, ymd, tape, slip, roll, page, head, say, recBtn, useStar } from './draw.mjs';
import { pickBubbles, drawBubble } from './bubbles.mjs';
import { gamesPage, madePage, MADE_MARKS } from './parts.mjs';
import { writingPage, writingMomentsPage } from './writing.mjs';

/** 十四幕（键、名字、目录上的贴纸），照旅程的顺序；和 Pomelo `youzi/atlas.rs` 的 SCENES 同一份键。玩物有志是 1.1.0 加的，写下的字两幕是 1.1.1 加的；
 *  自建模块一个模块一幕（键是模块的键，像 list/3），排在创作后面（`prepare`）。 */
export const SCENES = [['prologue', '序章 · 星图', 'star'], ['days', '留下的日子', 'notes'], ['writing', '写下的字', 'articles'], ['writing-moments', '重要的时刻', 'articles'], ['works', '书影相遇', 'books'], ['games', '玩物有志', 'games'], ['moments', '几个具体时刻', 'packing'], ['echo', '去年的回声', 'days'], ['drawing', '创作', 'drawing'], ['jobs', '求职这一年', 'jobs'], ['habits', '身体和习惯', 'todo'], ['talks', '和柚子聊的事', 'heart'], ['money', '钱', 'finance'], ['finale', '终章 · 柚子的来信', 'letter']];
/** 记录的种类 → 它在哪个模块（贴纸、名字）。 */
const KINDS = { note: ['notes', '念念不忘'], goal: ['todo', '一步一步'], trip: ['packing', '出门走走'], offer: ['jobs', '投石问路'], day: ['days', '来日方长'], book: ['books', '摸鱼读读'], film: ['films', '好奇看看'], course: ['drawing', '随意画画'], talk: ['heart', '柚子'], game: ['games', '玩物有志'], article: ['articles', '见字如面'] };
export const MARKS = [...new Set([...SCENES.map((s) => s[2]), ...Object.values(KINDS).map((k) => k[0]), ...MADE_MARKS, 'star', 'atlas'])];
const MONEY = { CNY: '¥', SGD: 'S$', HKD: 'HK$', USD: 'US$' };
const MD = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** 把存下的「呈现结果」理成画页要的样子。 */
export function prepare(raw) {
  const snap = raw.snapshot || {};
  const year = Number(snap.year || raw.year);
  const until = snap.until || raw.until || null;
  const recs = new Map((snap.records || []).map((r) => [r.key, r]));
  const nums = new Map((snap.numbers || []).map((n) => [n.label, n]));
  const scenes = new Map((raw.scenes || []).map((s) => [s.key, s]));
  // 没写成各幕（模型那一步失败）：序章和终章照样有，别的照快照里有内容的放
  const base = SCENES.map((s) => s[0]).filter((k) => (raw.scenes ? scenes.has(k) : k === 'prologue' || k === 'finale' || (snap.offered || []).includes(k))).filter((k) => k !== 'writing' || snap.writing?.n > 0);
  // 自建模块（1.1.0）：柚子排了的（没写成各幕时是有内容的），接在创作后面
  const made = new Map((snap.made || []).map((m) => [m.key, m]));
  const madeKeys = [...made.keys()].filter((k) => (raw.scenes ? scenes.has(k) : (snap.offered || []).includes(k)));
  const cut = base.filter((k) => SCENES.findIndex((s) => s[0] === k) <= SCENES.findIndex((s) => s[0] === 'drawing')).length;
  const order = [...base.slice(0, cut), ...madeKeys, ...base.slice(cut)];
  const heat = (snap.heat || []).filter((h) => h.day.slice(0, 4) === String(year)).map((h) => ({ m: Number(h.day.slice(5, 7)), d: Number(h.day.slice(8, 10)), notes: h.notes, all: h.all, key: `${Number(h.day.slice(5, 7))}-${Number(h.day.slice(8, 10))}`, day: h.day }));
  const created = (raw.createdAt || `${year}-12-31`).slice(0, 10);
  return {
    year, until, partial: !!until, created, letter: raw.letter || '', snap, recs, heat, order, made,
    num: (label) => nums.get(label)?.n ?? 0,
    numObj: (label) => nums.get(label),
    scene: (k) => scenes.get(k) || { key: k, lines: [], refs: [] },
    refs: (k, kinds) => (scenes.get(k)?.refs || []).map((r) => recs.get(r)).filter((r) => r && (!kinds || kinds.includes(r.kind))),
    ofKind: (...kinds) => [...recs.values()].filter((r) => kinds.includes(r.kind) && (!r.day || r.day.slice(0, 4) === String(year))),
  };
}

/** 弹出原记录要的东西：每条记录一张纸条；星图上能点的每一天。 */
export function popData(V) {
  const recs = {};
  for (const r of V.recs.values()) {
    // 自建模块的条目、课程（1.1.0）：那个模块的贴纸和名字
    const m = r.kind === 'made' ? V.made.get(r.key.split(':')[0]) : null;
    const [mark, mod] = m ? [m.mark, m.name] : KINDS[r.kind] || ['star', ''];
    const date = r.day ? ymd(r.day) : r.kind === 'book' ? `${V.year} 年读完` : r.kind === 'film' ? `${V.year} 年看完` : `${V.year} 年`;
    const note = r.kind === 'note';
    const title = note ? clip(plainNote(r.text).split('\n')[0], 16) : r.kind === 'goal' ? `目标完成：${r.text}` : r.kind === 'offer' ? '拿到 Offer' : r.text;
    recs[r.key] = { mark, mod, date, title, text: note ? r.text : r.kind === 'offer' ? r.text : '' };
  }
  const byDay = new Map();
  for (const r of V.recs.values()) if (r.day) byDay.set(r.day, [...(byDay.get(r.day) || []), r]);
  const days = {};
  for (const h of V.heat) days[h.key] = { n: h.all, date: ymd(h.day), lines: (byDay.get(h.day) || []).slice(0, 4).map((r) => [(KINDS[r.kind] || ['', ''])[1], clip(r.kind === 'note' ? plainNote(r.text) : r.text, 44)]) };
  return { recs, days, letter: V.letter, year: V.year };
}

// ---------- 封面 ----------
function cover(V, K) {
  const r = rng(1101);
  const stars = [[236, 78], [336, 150], [58, 300], [250, 262], [344, 214], [92, 418], [196, 340]].map(([x, y], i) => useStar('zstar', x, y, 22, `color:${soft(CATS[i % 5])};transform:rotate(${Math.round(r() * 60 - 30)}deg)`)).join('');
  const stamp = V.partial ? `<div style="position:absolute;left:272px;top:84px;width:150px;height:44px"><span aria-hidden="true" style="position:absolute;inset:0;border:2px solid var(--color-danger);border-radius:8px;transform:rotate(-5deg);opacity:.8"></span><span style="position:relative;display:block;line-height:44px;text-align:center;font-size:14px;font-weight:700;color:var(--color-danger)">截至 ${md(V.until)}</span></div>` : '';
  return page('cover', `${head('柚子的年度小报', V.partial ? `试刊 · ${ymd(V.created)}` : `${ymd(V.created)} 印`)}${stars}
<div class="num" style="position:absolute;left:30px;top:118px;font-size:96px;font-weight:700;line-height:1;letter-spacing:2px">${V.year}</div>
<div style="position:absolute;left:44px;top:226px;width:150px;height:14px">${svg(150, 14, st('M2 7 L148 7', 961, { c: 'var(--color-yuzu)', sw: 10, amp: 0.8 }))}</div>
${stamp}
<div style="position:absolute;right:28px;bottom:52px;width:170px;height:164px;transform:rotate(-8deg);line-height:0">${K.face('wow', 170)}</div>
<div style="position:absolute;left:36px;bottom:54px;width:170px;font-size:15px;line-height:24px;color:${INK2}">${V.partial ? '这一年还没过完<br>先看到今天' : '这一年<br>都在这本里了'}</div>
${tape(150, -8, 96, 3)}${tape(-16, 556, 86, 38, 1)}`, { bg: 'var(--color-print-cream)' });
}

// ---------- 目录：只列有的幕，页码由 runtime.mjs 填，点了跳过去；多于十一幕排两栏（1.1.0） ----------
function toc(V, K) {
  const all = V.order.map((key) => { const s = SCENES.find((x) => x[0] === key), m = V.made.get(key); return s ? [key, s[1], s[2]] : [key, m ? m.name : key, m ? m.mark : 'star']; });
  const two = all.length > 11, half = Math.ceil(all.length / 2);
  const row = ([key, name, mk]) => `<button type="button" class="ztoc pm-press" data-toc="${esc(key)}" style="display:flex;align-items:center;gap:${two ? 6 : 10}px;width:100%;height:${two ? 32 : 38}px;font-size:${two ? 14 : 16}px;line-height:22px;text-align:left">${K.mark(mk, two ? 20 : 26)}<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(name)}</span><span aria-hidden="true" style="flex:1;min-width:6px;border-bottom:2px dotted ${RULE};transform:translateY(-4px)"></span><span class="num ztocno" style="width:${two ? 18 : 22}px;text-align:right;color:${INK2}"></span></button>`;
  const col = (list, left, right) => `<div style="position:absolute;left:${left}px;right:${right}px;top:100px;display:flex;flex-direction:column;gap:${two ? 2 : 3}px">${list.map(row).join('')}</div>`;
  return page('toc', `${head('这一期', `${V.order.length} 幕 · 柚子按这一年的记录挑的`)}${two ? col(all.slice(0, half), 34, 238) + col(all.slice(half), 238, 34) : col(all, 34, 34)}`);
}

// ---------- 序章 · 星图：一颗星是有记录的一天，记得越多越亮；最亮的五颗是金星；柚子挑的触动你的几条（序章的 refs，
// 1.0.2 起）那一天是粉星；金星和粉星按日子连成今年的星座。点金星看那天，点粉星看柚子挑的那一条 ----------
function prologue(V) {
  const cx = 230, cy = 292, R = 172;
  const r = rng(1301);
  // j：环上的一点抖动（默认从这一页的随机数里取；不在热力里的粉星按记录的键取，不打乱别的星）
  const pos = (x, j = r()) => {
    const a = ((-90 + (x.m - 1 + (x.d - 0.5) / MD[x.m - 1]) * 30) * Math.PI) / 180;
    const ring = 62 + ((x.d * 7 + x.m * 13) % 5) * 19 + (j - 0.5) * 8;
    return [cx + Math.cos(a) * ring, cy + Math.sin(a) * ring];
  };
  // 亮不亮按这一年自己排：最多的五天是金星，前两成是星星（能点），再三成是小闪光，其余是一个点
  const ranked = [...V.heat].sort((p, q) => q.all - p.all || p.day.localeCompare(q.day));
  const goldKeys = new Set(ranked.slice(0, Math.min(5, ranked.length)).map((x) => x.key));
  const bright = new Set(ranked.slice(0, Math.min(60, Math.ceil(ranked.length * 0.2))).map((x) => x.key));
  const mid = new Set(ranked.slice(0, Math.ceil(ranked.length * 0.5)).map((x) => x.key));
  // 粉星：一天只画一颗（那天挑了几条，点开的是最早挑的那条）；只认今年有日子的记录
  const pinkOf = new Map();
  for (const rec of V.refs('prologue')) {
    if (!rec.day || rec.day.slice(0, 4) !== String(V.year)) continue;
    const k = `${Number(rec.day.slice(5, 7))}-${Number(rec.day.slice(8, 10))}`;
    if (!pinkOf.has(k)) pinkOf.set(k, rec);
  }
  const months = Array.from({ length: 12 }, () => []);
  const golds = [];
  for (const x of V.heat) {
    const [sx, sy] = pos(x);
    const gold = goldKeys.has(x.key), pink = pinkOf.get(x.key);
    if (gold || pink) { golds.push({ key: x.key, sx, sy, day: x.day, gold, pink }); continue; }
    const c = soft(CATS[(x.d + x.m * 2) % 5]);
    const star = bright.has(x.key);
    const tw = star && (x.d + x.m) % 3 === 0 ? ` class="tw" style="animation-delay:${f(3.4 + r() * 2.6)}s"` : '';
    const g = star
      ? `<g${tw}><use href="#zstar" x="${f(sx - 5.5)}" y="${f(sy - 5.5)}" width="11" height="11" color="${c}" transform="rotate(${Math.round(r() * 72)} ${f(sx)} ${f(sy)})"></use></g><circle cx="${f(sx)}" cy="${f(sy)}" r="9" fill="transparent" data-day="${x.key}" style="cursor:pointer"></circle>`
      : mid.has(x.key) ? `<use href="#zspark" x="${f(sx - 4)}" y="${f(sy - 4)}" width="8" height="8" color="${c}"></use>` : `<circle cx="${f(sx)}" cy="${f(sy)}" r="1.5" fill="${c}"></circle>`;
    months[x.m - 1].push(g);
  }
  const dust = Array.from({ length: 110 }, () => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (R - 8); return `<circle cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d)}" r="${r() < 0.2 ? 1 : 0.6}" fill="#FFFFFF" opacity="${f(0.18 + r() * 0.3)}"></circle>`; }).join('');
  const spokes = Array.from({ length: 12 }, (_, i) => { const a = ((-90 + i * 30) * Math.PI) / 180; return st(`M${f(cx + Math.cos(a) * 48)} ${f(cy + Math.sin(a) * 48)} L${f(cx + Math.cos(a) * (R - 6))} ${f(cy + Math.sin(a) * (R - 6))}`, 1320 + i, { c: '#FFFFFF', sw: 0.8, op: '.14' }); }).join('');
  const labels = Array.from({ length: 12 }, (_, i) => { const a = ((-90 + (i + 0.5) * 30) * Math.PI) / 180; return `<span class="num" style="position:absolute;left:${f(cx + Math.cos(a) * (R + 14) - 16)}px;top:${f(cy + Math.sin(a) * (R + 14) - 9)}px;width:32px;text-align:center;font-size:11px;line-height:18px;color:${INK2}">${i + 1} 月</span>`; }).join('');
  // 挑的那天没别的记录（比如来日方长的日子）：照样按日子摆上去
  for (const [k, rec] of pinkOf) {
    if (golds.some((g) => g.key === k)) continue;
    const x = { m: Number(rec.day.slice(5, 7)), d: Number(rec.day.slice(8, 10)) };
    const [sx, sy] = pos(x, (hash(rec.key) % 100) / 100);
    golds.push({ key: k, sx, sy, day: rec.day, gold: false, pink: rec });
  }
  golds.sort((p, q) => p.day.localeCompare(q.day));
  const nGold = golds.filter((g) => g.gold).length, nPink = golds.filter((g) => g.pink).length;
  // 今年的星座一笔一笔连出来（第 C0 拍起，CL 拍连完）：虚线由一条实线的遮罩画出来，线走到哪颗金星，那颗就亮一下
  const C0 = 3.4, CL = 2.6;
  let consDraw = '';
  const reach = golds.map(() => C0);
  if (golds.length > 1) {
    const consPath = 'M' + golds.map((g) => `${f(g.sx)} ${f(g.sy)}`).join(' L');
    const segs = golds.slice(1).map((g, i) => Math.hypot(g.sx - golds[i].sx, g.sy - golds[i].sy));
    const total = segs.reduce((a, v) => a + v, 0) || 1;
    let run = 0;
    golds.forEach((_, i) => { if (i) run += segs[i - 1]; reach[i] = C0 + (run / total) * CL; });
    consDraw = `<mask id="zconsm" maskUnits="userSpaceOnUse" x="0" y="0" width="${PW}" height="${PH}"><path class="consdraw" style="--b:${C0};animation-duration:${f(CL * 0.8)}s" d="${consPath}" pathLength="1" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"></path></mask><g mask="url(#zconsm)">${st(consPath, 1340, { c: 'var(--color-yuzu)', sw: 1.4, dash: '2 5', amp: 0.6 })}</g>`;
  }
  // 又是最亮的、又是柚子挑的那天：粉星外面一圈金色
  const goldStars = golds.map((g, i) => `<g ${b(f(reach[i]), 'gold')}><circle class="glow" cx="${f(g.sx)}" cy="${f(g.sy)}" r="13" fill="none" stroke="${g.gold ? 'var(--color-yuzu)' : 'var(--color-cat-pink)'}" stroke-width="2"></circle>${g.pink && g.gold ? `<circle cx="${f(g.sx)}" cy="${f(g.sy)}" r="12.5" fill="none" stroke="var(--color-yuzu)" stroke-width="1.6" opacity=".9"></circle>` : ''}<use href="#${g.pink ? 'zpink' : 'zgold'}" x="${f(g.sx - 10)}" y="${f(g.sy - 10)}" width="20" height="20" ${g.pink ? `data-rec="${esc(g.pink.key)}"` : `data-day="${g.key}"`} style="cursor:pointer"></use></g>`).join('');
  // 流星：星都出来时从右上划过星盘（只在走一遍里有）
  const shoot = `<div class="b tr shoot" style="--b:2.6;clip-path:circle(${R - 4}px at ${cx}px ${cy}px)"><span style="position:absolute;left:${cx + 92}px;top:${cy - 150}px;width:0;height:0"><svg width="90" height="60" viewBox="0 0 90 60" style="position:absolute;left:-6px;top:-54px;overflow:visible" aria-hidden="true"><defs><linearGradient id="zshootg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"></stop><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"></stop></linearGradient></defs><path d="M6 54 L84 4" stroke="url(#zshootg)" stroke-width="3.2" stroke-linecap="round"></path><use href="#zspark" x="-2" y="46" width="16" height="16" color="#FFFFFF"></use></svg></span></div>`;
  return page('prologue', `${head('序章', `这一年，你有 ${V.heat.length} 天留下了点什么${V.partial ? '（到今天）' : ''}`)}
<div ${b(0)}>${svg(PW, PH, `${fl(circle(cx, cy, R), 1301, NIGHT, { amp: 0.9 })}${fl(circle(cx, cy, 44), 1302, NIGHT2, { amp: 0.6 })}${spokes}${st(circle(cx, cy, R), 1303, { c: LINE, sw: 2.2, amp: 0.9, sp: 2 })}`)}
<div class="num" style="position:absolute;left:${cx - 40}px;top:${cy - 13}px;width:80px;text-align:center;font-size:18px;font-weight:700;line-height:26px;color:#FFFFFF">${V.year}</div></div>
<div ${b(1, 'fade')}>${svg(PW, PH, dust)}</div>
<div class="zsky">${svg(PW, PH, months.map((g, i) => `<g ${b(f(1 + i * 0.25), 'fade')}>${g.join('')}</g>`).join(''))}</div>
${shoot}
<div ${b(C0, 'fade')}>${svg(PW, PH, consDraw, 'pointer-events:none')}</div>
<div class="zsky">${svg(PW, PH, goldStars)}</div>
${labels}
<div style="position:absolute;left:24px;right:24px;top:494px;display:flex;align-items:center;justify-content:center;gap:${nPink ? 12 : 14}px;font-size:12px;line-height:18px;color:${INK2};white-space:nowrap"><span>一颗星 = 一天</span><span>记得越多越亮</span><span style="display:flex;align-items:center;gap:4px"><svg width="14" height="14" viewBox="-10 -10 20 20" aria-hidden="true"><use href="#zgold" x="-10" y="-10" width="20" height="20"></use></svg>最亮的${nGold === 5 ? '五' : '几'}天</span>${nPink ? `<span style="display:flex;align-items:center;gap:4px"><svg width="14" height="14" viewBox="-10 -10 20 20" aria-hidden="true"><use href="#zpink" x="-10" y="-10" width="20" height="20"></use></svg>触动你的${['', '一', '两', '三', '四', '五'][nPink] || '几'}天</span>` : ''}</div>
${say(520, V.scene('prologue').lines, 6.3)}`);
}

// ---------- 留下的日子 · 十字绣日历：一行一个月，一针一天，线越深记得越多 ----------
const THREAD = ['#FFD3B0', '#FFB06A', '#F38A2E', '#C9621A'];
function daysPage(V) {
  const pitch = 11.4, rowH = 19, gx = 60, gy = 106;
  const noted = V.heat.filter((x) => x.notes > 0);
  const sorted = noted.map((x) => x.notes).sort((p, q) => p - q);
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] || 1;
  const [q1, q2, q3] = [Math.max(2, q(0.5)), Math.max(3, q(0.78)), Math.max(4, q(0.93))];
  const rows = Array.from({ length: 12 }, (_, m) => `<g ${b(f(1 + m * 0.25), 'fade')}>${noted.filter((x) => x.m === m + 1).map((x) => {
    const lv = x.notes >= q3 ? 3 : x.notes >= q2 ? 2 : x.notes >= q1 ? 1 : 0;
    return `<use href="#zx" x="${f(gx + (x.d - 1) * pitch + pitch / 2 - 4.5)}" y="${f(gy + m * rowH + rowH / 2 - 4.5)}" width="9" height="9" color="${THREAD[lv]}"></use>`;
  }).join('')}</g>`).join('');
  const months = Array.from({ length: 12 }, (_, m) => `<span class="num" style="position:absolute;left:30px;top:${gy + m * rowH}px;width:22px;text-align:right;font-size:10px;line-height:${rowH}px;color:${INK2}">${m + 1}</span>`).join('');
  const cloth = `<div aria-hidden="true" style="position:absolute;left:${gx - 8}px;top:${gy - 10}px;width:${Math.round(31 * pitch) + 16}px;height:${12 * rowH + 20}px;border-radius:6px;background-color:#FBF5E6;background-image:radial-gradient(circle,rgba(90,70,40,.2) .8px,transparent 1.2px);background-size:${pitch}px ${rowH / 2}px;background-position:8px 5px;box-shadow:inset 0 0 0 1.5px rgba(90,70,40,.14)"></div>`;
  const legend = `<div style="position:absolute;left:${gx - 8}px;top:${gy + 12 * rowH + 16}px;display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:${INK2}">记得少${THREAD.map((c) => `<svg width="12" height="12" viewBox="-5 -5 10 10" style="color:${c}" aria-hidden="true"><use href="#zx" x="-5" y="-5" width="10" height="10"></use></svg>`).join('')}记得多</div>`;
  const note = V.refs('days', ['note'])[0];
  const quote = note ? `<div ${b(5)}>${recBtn(note.key, 'left:70px;top:382px;width:320px;height:108px', `${slip(-2.5)}${tape(128, -9, 64, -6)}<span style="position:relative;display:block;padding:16px 18px 0;text-align:left"><span style="display:block;font-size:15px;line-height:24px;height:48px;overflow:hidden">「${esc(clip(plainNote(note.text), 34))}」</span><span style="display:block;margin-top:6px;font-size:12px;line-height:18px;color:${INK2}">${md(note.day)} · 念念不忘 · 点开看原文</span></span>`, '打开原记录：这一年的一条笔记')}</div>` : '';
  const byMonth = Array.from({ length: 12 }, (_, i) => noted.filter((x) => x.m === i + 1).reduce((a, x) => a + x.notes, 0));
  const top = byMonth.indexOf(Math.max(...byMonth)) + 1;
  const total = V.num('笔记') || byMonth.reduce((a, v) => a + v, 0);
  return page('days', `${head('留下的日子', `一共 ${fmt(total)} 条 · ${top} 月记得最多`)}${cloth}${months}${svg(PW, PH, rows)}${legend}${quote}${say(note ? 506 : 400, V.scene('days').lines, 6)}`);
}

// ---------- 书影相遇：书架上的书脊，电影票根 ----------
function works(V) {
  const books = V.ofKind('book'), films = V.ofKind('film');
  const name = (r) => r.text.replace(/^《|》$/g, '');
  const base = 296, room = 380;
  const shown = [];
  let x = 46;
  for (const [i, bk] of books.entries()) {
    const h = hash(bk.key), w = 16 + (h % 6) * 2;
    if (x + w > 46 + room - (books.length > i + 1 ? 34 : 0)) break;
    shown.push({ bk, x, w, h: 106 + (h % 8) * 6, c: CATS[(h >> 3) % 5] });
    x += w + 3;
  }
  // 书名竖着写在够宽的书脊上；放不下的书名不写
  const spines = shown.map(({ bk, x: bx, w, h, c }, i) => {
    const t = [...name(bk)].length <= Math.floor((h - 28) / 12.5) && (w >= 22 || shown.length <= 8) ? name(bk) : '';
    return `<div ${b(f(1 + i * 0.2))}><div style="position:absolute;left:${bx}px;top:${base - h}px;width:${w}px;height:${h}px">${svg(w, h, `${fl(rrect(0, 0, w, h, 3), 1400 + i, soft(c))}${st(rrect(0, 0, w, h, 3), 1420 + i, { sw: 1.5 })}${st(`M2 ${h - 14} L${w - 2} ${h - 14}`, 1440 + i, { sw: 1.1, c: cat(c) })}`)}${t ? `<span style="position:absolute;left:0;top:8px;width:${w}px;height:${h - 28}px;writing-mode:vertical-rl;font-size:12px;line-height:${w}px;text-align:start;white-space:nowrap;overflow:hidden">${esc(t)}</span>` : ''}</div></div>`;
  }).join('');
  const more = books.length > shown.length ? `<div class="num" style="position:absolute;left:${x + 4}px;top:${base - 26}px;font-size:12px;line-height:18px;color:${INK2};white-space:nowrap">+${books.length - shown.length}</div>` : '';
  const shelf = books.length ? svg(PW, PH, `${st(`M34 ${base + 2} L426 ${base + 2}`, 1460, { sw: 2.4, amp: 0.8 })}${st(`M40 ${base + 9} L420 ${base + 9}`, 1461, { sw: 1, c: INK2, op: '.5' })}`) : '';
  const picked = V.refs('works', ['book', 'film']);
  const tickets = [...picked.filter((r) => r.kind === 'film'), ...films.filter((r) => !picked.includes(r))].slice(0, 3);
  const ty = books.length ? 346 : 150;
  const ticket = (r, i) => `<div ${b(5 + i * 0.5)}>${recBtn(r.key, `left:${48 + i * 126}px;top:${ty}px;width:112px;height:86px`, `<span aria-hidden="true" style="position:absolute;inset:0;border-radius:6px;background:${soft(['pink', 'sky', 'mint'][i])};box-shadow:0 1px 2px rgba(0,0,0,.18);transform:rotate(${[-3, 2, -2][i]}deg);clip-path:polygon(0 0,100% 0,100% 38%,95% 50%,100% 62%,100% 100%,0 100%,0 62%,5% 50%,0 38%)"></span><span style="position:relative;display:block;padding:8px 12px 0;text-align:left"><span style="display:block;font-size:11px;line-height:16px;color:${INK2}">好奇看看</span><span aria-hidden="true" style="display:block;margin:5px 0;border-top:1.5px dashed ${RULE}"></span><span style="display:block;font-size:14px;line-height:20px;font-weight:700;white-space:nowrap;overflow:hidden">${esc(clip(name(r), 6))}</span><span class="num" style="display:block;font-size:11px;line-height:16px;color:${INK2}">入场券 · 1 位</span></span>`, `打开原记录：${name(r)}`)}</div>`;
  const star = picked.find((r) => r.kind === 'book') || picked[0];
  const strip = star ? `<div ${b(7)}>${recBtn(star.key, `left:34px;top:${ty + 106}px;width:392px;height:44px`, `<span aria-hidden="true" style="position:absolute;inset:0;border-radius:8px;background:var(--color-print-cream)"></span><span style="position:relative;display:flex;align-items:center;gap:8px;height:44px;padding:0 14px;font-size:14px;line-height:20px;white-space:nowrap"><svg width="16" height="16" viewBox="-10 -10 20 20" aria-hidden="true"><use href="#zgold" x="-10" y="-10" width="20" height="20"></use></svg>柚子想提的一${star.kind === 'book' ? '本' : '部'}：${esc(clip(star.text, 16))}</span>`, `打开原记录：${name(star)}`)}</div>` : '';
  const sub = [books.length ? `读完 ${V.num('读完的书') || books.length} 本` : '', films.length ? `看完 ${V.num('看完的电影和剧') || films.length} 部` : ''].filter(Boolean).join(' · ');
  return page('works', `${head('书影相遇', sub)}${shelf}${spines}${more}
${tickets.map(ticket).join('')}${strip}
${say(ty + 166, V.scene('works').lines, 8)}`);
}

// ---------- 几个具体时刻：一条虚线从年初走到年尾，贴着几张小卡片 ----------
function moments(V, K) {
  const list = V.refs('moments', ['goal', 'trip', 'offer', 'day']).slice(0, 6);
  const y0 = 112, gap = list.length > 4 ? 76 : 92;
  const line = st(`M230 ${y0 - 14} L230 ${y0 + gap * Math.max(1, list.length - 1) + 44}`, 1500, { sw: 1.6, dash: '3 7', c: INK2, amp: 1.2 });
  const items = list.map((r, i) => {
    const left = i % 2 === 0, y = y0 + i * gap, rot = [-2, 1.5, -1.5, 2, -1, 1.8][i];
    const title = r.kind === 'offer' ? '拿到 Offer' : r.text;
    return `<div ${b(1 + i)}><span style="position:absolute;left:213px;top:${y + 6}px;width:34px;height:34px;transform:rotate(${rot * 3}deg);line-height:0;z-index:2">${K.mark(KINDS[r.kind][0], 34)}</span>${recBtn(r.key, `left:${left ? 34 : 262}px;top:${y}px;width:164px;height:52px`, `${slip(rot)}<span style="position:relative;display:block;padding:7px 12px 0;text-align:left"><span class="num" style="display:block;font-size:11px;line-height:16px;color:${INK2}">${md(r.day)}</span><span style="display:block;font-size:14px;line-height:22px;font-weight:700;white-space:nowrap;overflow:hidden">${esc(clip(title, 10))}</span></span>`, `打开原记录：${title}`)}</div>`;
  }).join('');
  return page('moments', `${head('几个具体时刻', '做成的事、出的门、等到的日子')}${list.length ? svg(PW, PH, line) : ''}${items}${list.length <= 4 ? say(y0 + gap * Math.max(1, list.length) + 10, V.scene('moments').lines, 1 + list.length) : ''}`);
}

// ---------- 去年的回声 · 复写纸：两年同一天写下的话叠在一起，再和去年比几个数 ----------
function echo(V) {
  const refs = V.refs('echo', ['note']);
  const now = refs.find((r) => r.day.slice(0, 4) === String(V.year)), then = refs.find((r) => r.day.slice(0, 4) !== String(V.year));
  const pair = now && then;
  const cmp = ['笔记', '做完的事', '读完的书', '看完的电影和剧', '打卡', '画完的课节', '出行'].map((l) => V.numObj(l)).filter((n) => n && n.last != null && (n.n > 0 || n.last > 0)).slice(0, pair ? 3 : 5);
  const top = pair ? 392 : 120;
  const rows = cmp.map((n, i) => {
    const max = Math.max(n.n, n.last, 1), w = 190, up = n.n >= n.last;
    const wa = Math.max(4, Math.round((n.n / max) * w)), wz = Math.max(4, Math.round((n.last / max) * w));
    return `<div ${b(4 + i * 0.5)}><div style="position:absolute;left:34px;right:34px;top:${top + i * 50}px;height:44px"><span style="position:absolute;left:0;top:0;font-size:14px;line-height:20px;white-space:nowrap">${esc(clip(n.label, 7))}</span><span style="position:absolute;left:0;top:22px;font-size:11px;line-height:16px;color:${INK2};white-space:nowrap">${n.n === n.last ? '和去年一样' : `比去年${up ? '多' : '少'} ${fmt(Math.abs(n.n - n.last))} ${esc(n.unit)}`}</span>
<span class="growx" aria-hidden="true" style="position:absolute;left:112px;top:6px;width:${wa}px;height:12px;border-radius:6px;background:${up ? 'var(--color-yuzu)' : soft('sky')}"></span><span style="position:absolute;left:${112 + wa + 8}px;top:2px;font-size:13px;line-height:20px;font-weight:700">${roll(fmt(n.n), 4 + i * 0.5, 20)}</span>
<span class="growx" aria-hidden="true" style="position:absolute;left:112px;top:26px;width:${wz}px;height:8px;border-radius:4px;background:${CARBON_BG};box-shadow:inset 0 0 0 1px ${CARBON}"></span><span class="num" style="position:absolute;left:${112 + wz + 8}px;top:20px;font-size:11px;line-height:20px;color:${CARBON};white-space:nowrap">去年 ${fmt(n.last)}</span></div></div>`;
  }).join('');
  const notes = pair ? `<div ${b(1)}>${recBtn(then.key, 'left:40px;top:104px;width:300px;height:112px', `${slip(-3, CARBON_BG)}<span style="position:relative;display:block;padding:14px 18px 0;text-align:left;color:${CARBON}"><span class="num" style="display:block;font-size:11px;line-height:16px">${ymd(then.day)}</span><span style="display:block;margin-top:4px;font-size:14px;line-height:23px;height:69px;overflow:hidden">「${esc(clip(plainNote(then.text), 50))}」</span></span>`, '打开原记录：去年这一天的笔记')}</div>
<div ${b(2, 'wipe')}>${svg(PW, PH, `${st('M330 206 C366 214 374 236 356 254', 1601, { sw: 1.6, c: INK2 })}${st('M364 244 L356 255 L343 250', 1602, { sw: 1.6, c: INK2 })}`)}</div>
<div ${b(3)}>${recBtn(now.key, 'left:110px;top:236px;width:310px;height:116px', `${slip(2)}${tape(120, -9, 70, 4, 1)}<span style="position:relative;display:block;padding:16px 18px 0;text-align:left"><span class="num" style="display:block;font-size:11px;line-height:16px;color:${INK2}">${ymd(now.day)}</span><span style="display:block;margin-top:4px;font-size:15px;line-height:24px;height:72px;overflow:hidden">「${esc(clip(plainNote(now.text), 48))}」</span></span>`, '打开原记录：今年这一天的笔记')}</div>
${cmp.length ? svg(PW, PH, st('M34 376 L426 376', 1603, { sw: 1.2, c: INK2, dash: '2 6' })) : ''}` : '';
  return page('echo', `${head('去年的回声', pair ? `${md(now.day)}，两年的同一天` : '和去年比一比')}${notes}${rows}${say(Math.min(540, top + cmp.length * 50 + 12), V.scene('echo').lines, 6)}`);
}

// ---------- 创作：速写本上的小画（画完的课），下面一排笔触（一笔是一节） ----------
function drawing(V) {
  const courses = V.ofKind('course').map((r) => { const m = /^(.*)（这一年画完 (\d+) 节）$/.exec(r.text); return { r, name: m ? m[1] : r.text, n: m ? Number(m[2]) : 0 }; });
  const lessons = V.num('画完的课节') || courses.reduce((a, c) => a + c.n, 0);
  const frame = (x, y, art, c, rot, bb) => `<div ${b(bb)}>${recBtn(c.r.key, `left:${x}px;top:${y}px;width:176px;height:176px`, `<span aria-hidden="true" style="position:absolute;left:0;top:0;width:176px;height:136px;background:#FFFFFF;box-shadow:0 1px 2px rgba(0,0,0,.18),2px 8px 14px rgba(0,0,0,.08);transform:rotate(${rot}deg)"></span><span aria-hidden="true" style="position:absolute;left:0;top:0;width:176px;height:136px;transform:rotate(${rot}deg)">${svg(176, 136, art)}</span><span style="position:absolute;left:0;top:144px;width:176px;text-align:center;font-size:14px;line-height:20px;font-weight:700;white-space:nowrap;overflow:hidden">${esc(clip(c.name, 11))}</span><span class="num" style="position:absolute;left:0;top:164px;width:176px;text-align:center;font-size:11px;line-height:14px;color:${INK2}">这一年画完 ${c.n} 节</span>`, `打开原记录：${c.name}`)}</div>`;
  const a1 = `${fl(circle(126, 40, 20), 1701, 'var(--color-yuzu)')}${fl(P('M12 118 L58 56 L92 100 L116 74 L164 118 Z'), 1702, soft('mint'))}${st('M12 118 L58 56 L92 100 L116 74 L164 118', 1703, { sw: 1.6 })}${st('M18 124 L158 124', 1704, { sw: 1.2, c: cat('sky') })}`;
  const a2 = `${fl(ellipse(88, 76, 46, 40), 1711, 'var(--color-yuzu)')}${st(ellipse(88, 76, 46, 40), 1712, { sw: 1.8 })}${fl(P('M84 38 C92 22 108 20 116 28 C106 38 94 40 84 38 Z'), 1713, soft('mint'))}${st('M84 38 C92 22 108 20 116 28', 1714, { sw: 1.5 })}${st('M70 70 L72 76 M104 70 L106 76 M80 90 C86 96 92 96 98 90', 1715, { sw: 1.6 })}`;
  const two = courses.length > 1;
  const frames = courses.length ? `${tape(two ? 96 : 198, 92, 70, -5)}${two ? tape(300, 96, 70, 6, 1) : ''}${frame(two ? 40 : 142, 104, a1, courses[0], -2, 1)}${two ? frame(244, 108, a2, courses[1], 2.5, 2) : ''}` : '';
  const r = rng(1720), n = Math.min(lessons, 48);
  const dabs = Array.from({ length: n }, (_, i) => { const x = 44 + (i % 16) * 24, y = 370 + Math.floor(i / 16) * 28; return `<g ${b(f(3 + i * 0.06), 'fade')}>${fl(ellipse(x, y, 9, 5.5, r() * 40 - 20), 1730 + i, Math.floor(i / 16) % 2 ? cat(CATS[(i * 3) % 5]) : soft(CATS[(i * 2) % 5]), { amp: 0.6 })}</g>`; }).join('');
  const rowsN = Math.ceil(n / 16);
  const more = courses.length > 2 ? ` · 还有 ${courses.length - 2} 门` : '';
  return page('drawing', `${head('创作', `画了 ${courses.length} 门课 · ${lessons} 节${more}`)}${frames}
${svg(PW, PH, dabs)}
${n ? `<div style="position:absolute;left:34px;top:${370 + rowsN * 28 - 6}px;font-size:12px;line-height:18px;color:${INK2}">一笔是一节课${lessons > n ? `（只画了前 ${n} 笔）` : ''}</div>` : ''}
${say(370 + rowsN * 28 + 26, V.scene('drawing').lines, 6)}`);
}

// ---------- 求职这一年 · 投石问路：石头一块块跳过水面，越往后越小；拿到了，最后一块上有金星 ----------
const STONES = { 1: [[230, 300, 60, 34]], 2: [[130, 380, 58, 33], [330, 220, 40, 24]], 3: [[110, 396, 58, 33], [236, 292, 44, 26], [356, 190, 34, 21]], 4: [[96, 404, 60, 34], [214, 330, 46, 27], [308, 252, 38, 23], [376, 172, 32, 20]] };
function jobs(V) {
  let stages = (V.snap.jobStages || []).filter((s) => s.n > 0).slice(0, 4);
  if (!stages.length) stages = [{ label: '有进展', n: V.num('有进展的投递'), unit: '份' }, ...(V.num('拿到的工作') ? [{ label: 'Offer', n: V.num('拿到的工作'), unit: '个', got: true }] : [])];
  const k = stages.length, stones = STONES[k].map((p, i) => [...p, stages[i]]);
  const got = !!stages[k - 1].got && k > 1;
  const pond = fl(rrect(26, 112, 408, 366, 30), 1801, soft('sky'), { amp: 1.2, op: '.55' });
  const ripple = ([x, y, rx, ry], i) => `${st(ellipse(x, y + 6, rx + 12, ry + 8), 1810 + i, { sw: 1, c: cat('sky'), op: '.7' })}${st(ellipse(x, y + 8, rx + 24, ry + 15), 1820 + i, { sw: 0.8, c: cat('sky'), op: '.4', dash: '10 8' })}`;
  // 一颗小石子真的跳过去（只在走一遍里有）：石头 i 在第 1+i 拍冒出来，小石子正好那时落在它上面，溅起水花；
  // 每一跳 0.45 秒，路上的虚线跟着它画出来；在石头上滑一小段再跳下一下；落到最后一块上沉下去
  const land = (i) => (1 + i) * 0.8 + 0.15, HOP = 0.45, D = land(k - 1) + 0.4;
  const arc = (i) => { const [x, y] = stones[i], [nx, ny] = stones[i + 1]; return [[x + 14, y - 26], [(x + nx) / 2, Math.min(y, ny) - 74], [nx - 10, ny - 26]]; };
  let pebble = '', hops = '';
  if (k > 1) {
    hops = stones.slice(0, -1).map((_, i) => { const [p0, c, p1] = arc(i); return `<g ${b(f((land(i + 1) - HOP - 0.15) / 0.8), 'wipe hop')}>${st(`M${p0[0]} ${p0[1]} Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`, 1830 + i, { sw: 1.5, c: INK2, dash: '2 6' })}</g>`; }).join('');
    const kf = [];
    const key = (t, [x, y], { o = 1, r = 0, s = 1 } = {}) => kf.push(`${f((t / D) * 100)}%{opacity:${o};transform:translate(${f(x)}px,${f(y)}px) rotate(${f(r)}deg) scale(${s})}`);
    const start = arc(0)[0];
    key(0, start, { o: 0 }); key(1.0, start, { o: 0 }); key(1.15, start);
    for (let i = 0; i < k - 1; i++) {
      const [p0, c, p1] = arc(i), t0 = land(i + 1) - HOP;
      for (let j = 0; j <= 8; j++) { const u = j / 8, w = 1 - u; key(t0 + u * HOP, [w * w * p0[0] + 2 * w * u * c[0] + u * u * p1[0], w * w * p0[1] + 2 * w * u * c[1] + u * u * p1[1]], { r: -360 * u - 360 * i }); }
      if (i < k - 2) { key(land(i + 1) + 0.06, [p1[0] + 4, p1[1] + 1], { r: -360 * (i + 1), s: '1.25,.7' }); key(land(i + 1) + 0.3, arc(i + 1)[0], { r: -360 * (i + 1) }); }
    }
    const last = arc(k - 2)[2], spin = -360 * (k - 1);
    key(land(k - 1) + 0.06, [last[0] + 3, last[1] + 1], { r: spin, s: '1.25,.7' }); key(land(k - 1) + 0.3, [last[0] + 6, last[1] + 4], { o: 0, r: spin, s: '.3' }); key(D, [last[0] + 6, last[1] + 4], { o: 0, r: spin, s: '.3' });
    pebble = `<style>@keyframes at-skip{${kf.join('')}}</style><span class="pebble tr" aria-hidden="true" style="animation-duration:${f(D)}s"><svg width="20" height="14" viewBox="-10 -7 20 14" style="position:absolute;left:-10px;top:-9px;overflow:visible">${fl(ellipse(0, 0, 9, 5.8), 1861, '#A9B1BB', { amp: 0.25 })}${st(ellipse(0, 0, 9, 5.8), 1862, { sw: 1.6, amp: 0.25 })}${st('M-4 -2.4 L1 -3.4', 1863, { c: '#FFFFFF', sw: 1.4, amp: 0.1 })}</svg></span>`;
  }
  const splashes = stones.slice(1).map(([x, y, rx, ry], i) => `<div class="b tr splash" style="--b:${2 + i};transform-origin:${x}px ${y + 6}px">${svg(PW, PH, `${st(ellipse(x, y + 6, rx + 10, ry + 7), 1870 + i, { sw: 2, c: cat('sky') })}${st(ellipse(x, y + 8, rx + 22, ry + 13), 1875 + i, { sw: 1.4, c: cat('sky'), op: '.6' })}${[-1, 1].map((s) => st(`M${x + s * (rx - 4)} ${y - ry + 4} L${x + s * (rx + 6)} ${y - ry - 8}`, 1880 + i + s, { sw: 1.8, c: cat('sky') })).join('')}`)}</div>`).join('');
  const rocks = stones.map(([x, y, rx, ry, s], i) => `<div ${b(1 + i)}>${svg(PW, PH, `${ripple(stones[i], i)}${fl(ellipse(x, y, rx, ry), 1840 + i, 'var(--color-kraft)')}${st(ellipse(x, y, rx, ry), 1850 + i, { sw: 1.8 })}`)}<div style="position:absolute;left:${x - 50}px;top:${y - 22}px;width:100px;text-align:center;color:${INK}"><span class="num" style="display:block;font-size:${i === 0 ? 22 : 18}px;line-height:24px;font-weight:700">${fmt(s.n)}<span style="font-size:11px;font-weight:400"> ${esc(s.unit || '份')}</span></span><span style="display:block;font-size:11px;line-height:14px;white-space:nowrap">${esc(clip(s.label, 6))}</span></div></div>`).join('');
  const [lx, ly] = stones[k - 1], sx = lx + 33, sy = ly - 31, fb = f((land(k - 1) + 0.24 - 0.15) / 0.8);
  const sparks = [[0, -1], [0.8, -0.6], [1, 0.25], [0.55, 0.85], [-0.6, 0.8], [-1, 0], [-0.75, -0.7]].map(([dx, dy], i) => `<span class="spk" style="left:${sx}px;top:${sy}px;--dx:${f(dx * 30)}px;--dy:${f(dy * 30)}px"><svg width="10" height="10" viewBox="-10 -10 20 20" style="position:absolute;left:-5px;top:-5px;color:${i % 2 ? 'var(--color-yuzu)' : cat('sky')}" aria-hidden="true"><use href="#zspark" x="-10" y="-10" width="20" height="20"></use></svg></span>`).join('');
  const flag = got ? `<div ${b(fb, 'grow', `transform-origin:${sx}px ${sy}px`)}>${useStar('zgold', sx - 13, sy - 13, 26, 'transform:rotate(14deg)')}</div><div class="b tr burst" style="--b:${fb}">${sparks}</div>` : '';
  const offer = V.refs('jobs', ['offer'])[0] || (got ? V.ofKind('offer').slice(-1)[0] : null);
  const strip = offer ? `<div ${b(k + 2)}>${recBtn(offer.key, 'left:34px;top:494px;width:392px;height:52px', `${slip(-1)}<span style="position:relative;display:block;padding:7px 14px 0;text-align:left"><span class="num" style="display:block;font-size:11px;line-height:16px;color:${INK2}">${md(offer.day)} · 投石问路</span><span style="display:block;font-size:14px;line-height:22px;font-weight:700;white-space:nowrap;overflow:hidden">${esc(clip(offer.text, 24))}</span></span>`, '打开原记录：拿到 Offer')}</div>` : say(494, V.scene('jobs').lines, k + 2);
  return page('jobs', `${head('求职这一年', `${fmt(stages[0].n)} 份有了进展，一块石头一块石头地跳`)}${svg(PW, PH, pond)}${splashes}${svg(PW, PH, hops)}${rocks}${pebble}${flag}${strip}`);
}

// ---------- 身体和习惯 · 贴纸打卡表：一格一周，贴满的是差不多天天做 ----------
function habits(V) {
  const list = (V.snap.habits || []).slice(0, 3);
  const leap = V.year % 4 === 0 && (V.year % 100 !== 0 || V.year % 400 === 0);
  const doy = (d) => { let n = Number(d.slice(8, 10)); for (let m = 1; m < Number(d.slice(5, 7)); m++) n += m === 2 && !leap ? 28 : MD[m - 1]; return n; };
  const rows = list.map((h, k) => {
    const c = ['mint', 'pink', 'grape'][k], y = 118 + k * 126;
    const r = rng(1900 + k);
    // 老的快照没记每周几天：照总天数撒，只是个样子
    const weeks = h.weeks?.length ? h.weeks : Array.from({ length: 52 }, () => (r() < h.days / 300 ? (r() < 0.5 ? 6 : 3) : 0));
    const at = h.longestFrom ? Math.min(51, Math.floor((doy(h.longestFrom) - 1) / 7)) : -1, span = Math.max(1, Math.ceil(h.longest / 7));
    const cells = Array.from({ length: 52 }, (_, i) => {
      const n = (weeks[i] || 0) + (i === 51 ? weeks[52] || 0 : 0), v = n >= 5 ? 2 : n >= 1 ? 1 : 0;
      const cx = 46 + (i % 26) * 14.4, cy = y + 50 + Math.floor(i / 26) * 18;
      return v === 2 ? fl(circle(cx, cy, 5.4), 1910 + k * 60 + i, cat(c), { amp: 0.3 }) : v === 1 ? fl(circle(cx, cy, 5.4), 1910 + k * 60 + i, soft(c), { amp: 0.3 }) : `<circle cx="${f(cx)}" cy="${f(cy)}" r="4.6" fill="none" stroke="${RULE}" stroke-width="1.4"></circle>`;
    }).join('');
    const len = Math.min(span, 26 - (at % 26));
    const mark = at >= 0 && h.longest >= 7 ? st(`M${f(46 + (at % 26) * 14.4 - 8)} ${y + 50 + Math.floor(at / 26) * 18} L${f(46 + (at % 26) * 14.4 - 8 + len * 14.4 + 4)} ${y + 50 + Math.floor(at / 26) * 18}`, 1990 + k, { sw: 15, c: 'var(--color-yuzu)', op: '.55', amp: 0.6 }) : '';
    return `<div ${b(1 + k * 1.5)}><div style="position:absolute;left:34px;right:34px;top:${y}px;display:flex;align-items:baseline;gap:10px;white-space:nowrap"><span style="font-size:16px;line-height:24px;font-weight:700">${esc(clip(h.title, 12))}</span><span class="num" style="font-size:12px;line-height:18px;color:${INK2}">${h.days} 天 · 最长连着 ${h.longest} 天</span></div>
${svg(PW, PH, `${mark}${cells}`)}</div>`;
  }).join('');
  const bottom = 118 + list.length * 126 - 6;
  const longest = Math.max(0, ...(V.snap.habits || []).map((h) => h.longest));
  return page('habits', `${head('身体和习惯', `打卡 ${fmt(V.num('打卡') || list.reduce((a, h) => a + h.days, 0))} 天 · 最长连着 ${longest} 天`)}${rows}
<div style="position:absolute;left:34px;top:${bottom}px;display:flex;align-items:center;gap:10px;font-size:12px;line-height:18px;color:${INK2}"><span>一格是一周</span><span style="display:flex;align-items:center;gap:4px"><span aria-hidden="true" style="width:10px;height:10px;border-radius:50%;background:${cat('mint')}"></span>差不多天天做</span><span style="display:flex;align-items:center;gap:4px"><span aria-hidden="true" style="width:22px;height:10px;border-radius:5px;background:var(--color-yuzu);opacity:.55"></span>最长的一段</span></div>
${say(bottom + 26, V.scene('habits').lines, 6)}`);
}

// ---------- 和柚子聊的事：一个话题一个泡泡（挑哪个见 bubbles.mjs），聊得多的大；泡泡从尾巴尖弹出来；
// 最后柚子在底下先「正在输入」，再回一句 ----------
const SLOTS = [[142, 184, 76, 1], [344, 172, 66, -1], [102, 322, 54, -1], [254, 330, 54, 1], [386, 338, 44, 1], [140, 444, 40, -1]];
function talks(V, K) {
  const scene = V.scene('talks');
  // 老的呈现结果没有分话题：模型挑的那几个对话各算一个
  let topics = (scene.topics || []).filter((t) => t.name && t.n > 0);
  if (!topics.length) topics = V.refs('talks', ['talk']).map((r) => ({ name: clip(r.text, 5), kind: 'other', n: 1, refs: [r.key] }));
  topics = [...topics].sort((p, q) => q.n - p.n).slice(0, 6);
  const keys = pickBubbles(topics), top = topics[0]?.n || 1;
  const draw = topics.map((t, i) => {
    const [cx, cy, max, dir] = SLOTS[i];
    const R = Math.max(max * 0.72, Math.min(max, SLOTS[0][2] * Math.sqrt(t.n / top)));
    const beat = f(1 + i * 0.6);
    const o = drawBubble(keys[i], { cx, cy, R, seed: 2001 + i * 200, color: CATS[(i * 2 + 3) % 5], dir, beat: Number(beat) });
    const fs = R >= 66 ? 23 : R >= 50 ? 18 : R >= 42 ? 16 : 14;
    const name = clip(t.name, Math.max(2, Math.floor((R * 1.75) / fs)));
    const lx = cx + (o.dx || 0), ly = cy + (o.dy || 0) - (fs + 22) / 2;
    const rec = (t.refs || []).find((r) => V.recs.has(r));
    const hit = rec ? `<button type="button" class="zrec pm-press" data-rec="${esc(rec)}" aria-label="打开原记录：聊${esc(name)}" style="position:absolute;left:${f(cx - R)}px;top:${f(cy - R * 0.8)}px;width:${f(R * 2)}px;height:${f(R * 1.6)}px;border-radius:50%"></button>` : '';
    return `<div ${b(beat, 'grow', `transform-origin:${f(o.tip[0])}px ${f(o.tip[1])}px`)}>${svg(PW, PH, o.art)}<div style="position:absolute;left:${f(lx - 90)}px;top:${f(ly)}px;width:180px;text-align:center;pointer-events:none;color:${o.color || INK}"><span style="display:block;font-size:${fs}px;line-height:${fs + 6}px;font-weight:700;white-space:nowrap">${esc(name)}${o.after || ''}</span><span class="num" style="display:block;font-size:11px;line-height:16px;color:${o.sub || INK2}">${t.n} 次</span></div>${hit}</div>`;
  }).join('');
  // 柚子的回话：这一幕模型写的那句，分成最多三行；先在标点后面断，一段太长才硬断
  const text = clip((scene.lines || []).join(''), 30), end = 1 + topics.length * 0.6;
  const per = 10, lines = [];
  for (const seg of text.match(/[^，。！？；、,.!?;]+[，。！？；、,.!?;]*/g) || []) {
    const last = lines[lines.length - 1];
    if (last != null && [...last].length + [...seg].length <= per) lines[lines.length - 1] = last + seg;
    else for (let cs = [...seg]; cs.length; cs = cs.slice(per)) lines.push(cs.slice(0, per).join(''));
  }
  // 末尾只剩一个标点或一个字的那一行并回上一行
  if (lines.length > 1 && [...lines[lines.length - 1]].length <= 1) lines.splice(lines.length - 2, 2, lines[lines.length - 2] + lines[lines.length - 1]);
  if (lines.length > 3) { const cs = [...text]; lines.length = 0; for (let i = 0; i < cs.length; i += per) lines.push(cs.slice(i, i + per).join('')); }
  const w = Math.min(196, Math.max(...lines.map((l) => [...l].length), 4) * 15 + 30), h = lines.length * 23 + 20;
  const tipR = [352, 488], bx = 338 - w, by = 488 - 14 - h / 2;
  const bubble = (x, y, bw, bh, seed) => { const d = P(`M${x + 16} ${y} L${x + bw - 16} ${y} Q${x + bw} ${y} ${x + bw} ${y + 16} L${x + bw} ${tipR[1] - 16} L${tipR[0]} ${tipR[1]} L${x + bw} ${tipR[1]} L${x + bw} ${y + bh - 16} Q${x + bw} ${y + bh} ${x + bw - 16} ${y + bh} L${x + 16} ${y + bh} Q${x} ${y + bh} ${x} ${y + bh - 16} L${x} ${y + 16} Q${x} ${y} ${x + 16} ${y} Z`); return `${fl(d, seed, '#FFFFFF', { amp: 0.25 })}${st(d, seed + 50, { amp: 0.4, sp: 1 })}`; };
  const reply = text ? `<div class="b tr blip" style="--b:${f(end + 1.2)};transform-origin:${tipR[0]}px ${tipR[1]}px">${svg(PW, PH, bubble(276, 462, 62, 40, 2911))}<span class="typing" aria-hidden="true" style="position:absolute;left:290px;top:478px"><i></i><i></i><i></i></span></div>
<div ${b(f(end + 2.4), 'grow', `transform-origin:${tipR[0]}px ${tipR[1]}px`)}>${svg(PW, PH, bubble(bx, Math.min(by, 462), w, Math.max(h, 40), 2912))}<div style="position:absolute;left:${bx + 15}px;top:${Math.min(by, 462) + 10}px;width:${w - 28}px;font-size:15px;line-height:23px;white-space:nowrap">${lines.map(esc).join('<br>')}</div></div>` : '';
  const n = V.num('和柚子的对话');
  return page('talks', `${head('和柚子聊的事', `${n ? `聊了 ${fmt(n)} 次` : ''}${n && topics[0] ? ' · ' : ''}${topics[0] ? `最爱聊${esc(topics[0].name)}` : ''}`)}${draw}
<div ${b(f(end + 0.6))}><div style="position:absolute;left:346px;top:446px;width:88px;height:85px;line-height:0;transform:rotate(6deg)">${K.face('wink', 88)}</div></div>${reply}
<div style="position:absolute;left:34px;right:34px;top:552px;font-size:11px;line-height:16px;color:${INK2}">设成私密的对话不算在里面</div>`);
}

// ---------- 钱 · 年度小票，旁边一条总资产的线 ----------
function money(V) {
  const m = V.snap.money || {};
  const cents = (n) => fmt(Math.round(n / 100));
  // 花得最多的那种币单独出一张小票，别的币在小票底下带一句
  const byCur = new Map();
  for (const s of m.spent || []) byCur.set(s.currency, [...(byCur.get(s.currency) || []), s]);
  const [cur, list] = [...byCur.entries()].sort((p, q) => q[1].reduce((a, x) => a + x.amount, 0) - p[1].reduce((a, x) => a + x.amount, 0))[0] || ['CNY', []];
  const sym = MONEY[cur] || '';
  const sorted = [...list].sort((p, q) => q.amount - p.amount);
  const rows = sorted.length > 5 ? [...sorted.slice(0, 4), { kind: '其他', amount: sorted.slice(4).reduce((a, x) => a + x.amount, 0) }] : sorted;
  const total = list.reduce((a, x) => a + x.amount, 0), max = Math.max(1, ...rows.map((x) => x.amount));
  const others = [...byCur.entries()].filter(([c]) => c !== cur).map(([c, xs]) => `${MONEY[c] || c}${cents(xs.reduce((a, x) => a + x.amount, 0))}`);
  const rh = 100 + rows.length * 40 + 96 + (others.length ? 20 : 0);
  const zig = Array.from({ length: 27 }, (_, i) => `${f((i / 26) * 100)}% ${i % 2 ? 'calc(100% - 8px)' : '100%'}`).reverse().join(',');
  const a = m.assets;
  const rx = a ? 34 : 112;
  // 小票从上面的出纸口一截一截吐出来（1.7 秒），合计边印边滚出来
  const receipt = rows.length ? `<div ${b(1, 'print', `clip-path:inset(97px -30px -40px -30px);--ph:${rh + 8}px`)}><div style="position:absolute;left:${rx}px;top:100px;width:236px;height:${rh}px"><span aria-hidden="true" style="position:absolute;inset:0;background:#FFFFFF;box-shadow:0 1px 2px rgba(0,0,0,.2);filter:drop-shadow(2px 8px 10px rgba(0,0,0,.1));clip-path:polygon(0 0,100% 0,${zig})"></span>
<div style="position:relative;padding:16px 16px 0;font-size:14px;line-height:22px"><div style="text-align:center;font-size:12px;line-height:18px;color:${INK2}">— 柚儿园 · ${V.year} 年度小票 —</div><div style="margin:8px 0;border-top:2px dashed ${RULE}"></div>
${rows.map((x) => `<div style="display:flex;justify-content:space-between;height:26px;white-space:nowrap"><span>${esc(clip(x.kind, 7))}</span><span class="num">${sym}${cents(x.amount)}</span></div><div aria-hidden="true" style="height:5px;margin:0 0 9px;width:${Math.max(3, Math.round((x.amount / max) * 100))}%;border-radius:3px;background:${soft('orange')}"></div>`).join('')}
<div style="margin:6px 0 8px;border-top:2px dashed ${RULE}"></div><div style="display:flex;justify-content:space-between;font-weight:700;font-size:16px;line-height:24px"><span>合计</span>${roll(sym + cents(total), 1.5, 24)}</div>${others.length ? `<div class="num" style="margin-top:4px;text-align:right;font-size:11px;line-height:16px;color:${INK2}">另有 ${others.join('、')}</div>` : ''}<div style="margin-top:8px;text-align:center;font-size:11px;line-height:16px;color:${INK2}">谢谢光临 · 明年再来</div></div></div></div>
${svg(PW, PH, `${fl(rrect(rx - 10, 90, 256, 13, 6.5), 2105, INK, { amp: 0.3 })}${st(`M${rx + 2} 97 L${rx + 234} 97`, 2106, { c: '#FFFFFF', sw: 1.6, op: '.35', amp: 0.2 })}`)}` : '';
  // 总资产：只有年初和现在两个数，画成一条从左到右的手画线（涨了往上、跌了往下）
  let chart = '';
  if (a) {
    const pct = a.from > 0 ? Math.round(((a.to - a.from) / a.from) * 100) : 0, up = a.to >= a.from;
    const cxL = rows.length ? 284 : 160, y0 = up ? 236 : 176, y1 = up ? 168 : 232;
    const r = rng(2110), pts = Array.from({ length: 12 }, (_, i) => [cxL + 8 + i * 11, y0 + ((y1 - y0) * i) / 11 + (i && i < 11 ? (r() - 0.5) * 14 : 0)]);
    chart = `<div ${b(4)}><div style="position:absolute;left:${cxL}px;top:110px;font-size:13px;line-height:20px;color:${INK2}">总资产</div><div class="num" style="position:absolute;left:${cxL}px;top:130px;font-size:24px;line-height:30px;font-weight:700;white-space:nowrap;color:${up ? `var(--color-up, ${INK})` : INK}">${pct === 0 ? '持平' : `${up ? '↑' : '↓'} ${roll(`${Math.abs(pct)}%`, 4.2, 30)}`}</div></div>
<div ${b(4.5, 'wipe')}>${svg(PW, PH, `${st(`M${cxL + 4} 256 L${cxL + 142} 256`, 2101, { sw: 1.2, c: INK2 })}${st('M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L'), 2102, { sw: 2.2, c: cat('mint'), amp: 0.7 })}${fl(circle(pts[11][0], pts[11][1], 5), 2103, 'var(--color-yuzu)')}${st(circle(pts[11][0], pts[11][1], 5), 2104, { sw: 1.5 })}`)}</div>
<div style="position:absolute;left:${cxL + 4}px;top:260px;width:138px;display:flex;justify-content:space-between;font-size:10px;line-height:16px;color:${INK2}" class="num"><span>${md(a.fromDay)}</span><span>${md(a.toDay)}</span></div>`;
  }
  const span = Math.max(1, Math.round((Date.parse(V.until || `${V.year}-12-31`) - Date.parse(`${V.year}-01-01`)) / 864e5) + 1);
  const most = rows.length ? `<div ${b(6)}><div style="position:absolute;left:${a ? 284 : 112}px;top:${a ? 300 : 100 + rh + 22}px;width:${a ? 142 : 236}px;font-size:13px;line-height:21px">花得最多的是${esc(clip(sorted[0].kind, 6))}${total / span >= 100 ? `，${a ? '<br>' : ''}平均每天 ${sym}${cents(total / span)}` : ''}。</div></div>` : '';
  return page('money', `${head('钱', rows.length ? `这一年花了 ${sym}${cents(total)}` : '这一年总资产的变化')}${receipt}${chart}${most}
${say(Math.max(a ? 340 : 0, rows.length ? 100 + rh + (a ? 28 : 74) : 300), V.scene('money').lines, 7)}`);
}

// ---------- 终章 · 柚子的来信：浅色信纸；整封信点开看 ----------
function finale(V, K) {
  const paras = (V.scene('finale').lines || []).map((l) => clip(l, 84)).slice(0, 4);
  if (!paras.length) paras.push('这一年的信写好了。');
  return page('finale', `${head('终章', '柚子的来信')}
<div class="pm-long" style="position:absolute;left:38px;right:38px;top:104px;height:288px;overflow:hidden;font-size:15px;line-height:32px;background-image:repeating-linear-gradient(transparent 0 31px,${RULE} 31px 32px)">${paras.map((p, i) => `<p ${b([0.8, 1.8, 3.6, 5.2][i], 'letter', 'margin:0')}>${esc(p)}</p>`).join('')}</div>
${V.letter ? `<div ${b(paras.length + 1.4)}><button type="button" class="pm-btn pm-btn--plain" data-hand="button" data-fill="card" data-seed="2251" data-act="letter" style="position:absolute;left:38px;top:404px">读整封信</button></div>` : ''}
<div ${b(paras.length + 2)}><div style="position:absolute;right:40px;top:470px;text-align:right"><div style="font-size:16px;line-height:24px;font-weight:700">柚子</div><div class="num" style="font-size:12px;line-height:18px;color:${INK2}">${ymd(V.created)}${V.partial ? ' · 写到今天' : ''}</div></div>
<div style="position:absolute;left:44px;top:452px;width:84px;height:81px;line-height:0;transform:rotate(-6deg)">${K.face('happy', 84)}</div></div>`, { bg: 'var(--color-print-cream)' });
}

// ---------- 凑成双数页用的一页（幕数是单数时才出现）和封底 ----------
function spare() {
  const r = rng(2200);
  const stars = Array.from({ length: 9 }, (_, i) => useStar('zstar', 60 + Math.round(r() * 320), 150 + Math.round(r() * 280), 26, `color:${soft(CATS[i % 5])};transform:rotate(${Math.round(r() * 60 - 30)}deg)`)).join('');
  return page('spare', `${stars}<div style="position:absolute;left:0;right:0;top:500px;text-align:center;font-size:14px;line-height:22px;color:${INK2}">这一页留给明年</div>`, { cls: 'zspare' });
}
function back(V, K) {
  return page('back', `<div style="position:absolute;left:0;right:0;top:150px;text-align:center;font-size:64px;line-height:1.1;font-weight:700">完</div>
<div style="position:absolute;left:0;right:0;top:236px;text-align:center;font-size:15px;line-height:24px;color:${INK2}">明年见</div>
<div style="position:absolute;left:180px;top:290px;width:100px;height:96px;line-height:0;transform:rotate(5deg)">${K.face('wink', 100)}</div>
<div style="position:absolute;left:0;right:0;top:430px;display:flex;justify-content:center;gap:14px"><button type="button" class="pm-btn" data-hand="button" data-seed="2301" data-act="again">再看一遍</button><button type="button" class="pm-btn pm-btn--plain" data-hand="button" data-fill="card" data-seed="2302" data-act="close">收进抽屉</button></div>
${tape(182, -8, 96, -3, 1)}`, { bg: 'var(--color-print-cream)' });
}

const DRAW = { prologue, days: daysPage, works, writing: writingPage, 'writing-moments': writingMomentsPage, games: gamesPage, moments, echo, drawing, jobs, habits, talks, money, finale };
/** 全部页，按旅程的顺序：封面、目录、有的幕、（凑数的一页）、封底。K：{ face(名字, 大小), mark(贴纸, 大小) }。 */
export function atlasPages(V, K) {
  const scenes = V.order.map((k) => (DRAW[k] ? DRAW[k](V, K) : madePage(V, K, k))).filter(Boolean);
  return [cover(V, K), toc(V, K), ...scenes, ...(scenes.length % 2 ? [] : []), spare(), back(V, K)];
}
export const SCENE_NAMES = Object.fromEntries(SCENES.map(([k, n]) => [k, n]));
