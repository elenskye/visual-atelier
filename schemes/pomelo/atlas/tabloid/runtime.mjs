// Tabloid：交互。舞台的结构是静态的（shell.mjs）；这里只改元素的 class、data-*、hidden、z-index，往空的容器里放东西。
//   页的顺序就是 DOM 的顺序；页数是单数时多放「凑数的一页」。
//   一张纸 = 右页（正面）+ 左页（背面）。翻到第 s 个跨页 = 前 s 张纸翻过去。翻一页是一拍（0.8 秒）。
//   自动翻：这一跨页里的东西按拍子出完，再停 3 拍，翻下一页；终章不自动往下走；碰一下小报就停。
// hooks（都可以不给）：openRecord(键)「在模块里打开」；onClose() 收进抽屉以后（不给就回到桌上的信封）；
//   onEscape() 没有纸条开着时按了 Esc。
// 用的是根元素所在的那个文档和窗口（Pomelo 把它放在一个 frame 里），不是全局的 document / window。
const BEAT = 800, HOLD = 3;

export function start(root, DATA, hooks = {}) {
  const doc = root.ownerDocument, win = doc.defaultView;
  const $ = (s, r) => (r || root).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || root).querySelectorAll(s));
  const book = $('.book');
  if (!book) {
    // 摊开看的那张板：目录照全部的幕写页码
    const flat = $$('.zp').filter((p) => p.dataset.scene !== 'spare');
    $$('.ztoc').forEach((row) => { const i = flat.findIndex((p) => p.dataset.scene === row.dataset.toc); $('.ztocno', row).textContent = String(i + 1); });
    return { sync() {}, stop() {} };
  }
  const table = $('.ztable');
  const S = { stage: table.dataset.start === 'book' ? 'book' : 'desk', cur: 0, auto: true, seq: [], rec: null };
  const T = { flip: 0, next: 0, toast: 0, open: 0, stow: 0, dim: 0, z: 0, rest: 0 };
  const reduce = () => root.dataset.motion === 'reduce' || win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spreads = () => S.seq.length / 2; // 0 = 合着的封面，最后一个 = 封底

  // ---------- 整张桌面按容器缩放 ----------
  function fit() {
    const w = root.clientWidth, h = root.clientHeight;
    if (w && h) table.style.setProperty('--zfit', String(Math.min(1, w / 1040, h / 790)));
  }
  const ro = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(fit) : null;
  if (ro) ro.observe(root);
  fit();

  // ---------- 排页 ----------
  function layout() {
    const all = $$('.zp', book);
    const shown = all.filter((p) => p.dataset.scene !== 'spare');
    const spare = all.find((p) => p.dataset.scene === 'spare');
    if (shown.length % 2 && spare) shown.splice(shown.length - 1, 0, spare);
    all.forEach((p) => { p.hidden = shown.indexOf(p) < 0; });
    S.seq = shown;
    shown.forEach((p, i) => {
      p.classList.toggle('R', i % 2 === 0);
      p.classList.toggle('L', i % 2 === 1);
      const no = $('.zno', p);
      if (no) no.textContent = i > 0 && i < shown.length - 1 ? String(i + 1) : '';
    });
    $$('.ztoc').forEach((row) => { const i = shown.findIndex((p) => p.dataset.scene === row.dataset.toc); $('.ztocno', row).textContent = i >= 0 ? String(i + 1) : ''; });
    // 下面那排点：一个跨页一个
    const dots = $('.dots');
    if (dots) { dots.innerHTML = ''; for (let k = 0; k <= spreads(); k++) dots.appendChild(doc.createElement('i')); }
    if (S.cur > spreads()) S.cur = spreads();
    place(false);
  }

  // ---------- 翻到第 S.cur 个跨页 ----------
  function place(animated) {
    const N = S.seq.length / 2;
    S.seq.forEach((p, i) => {
      const leaf = Math.floor(i / 2), flipped = leaf < S.cur;
      p.classList.toggle('fl', flipped);
      p.style.zIndex = String(flipped ? leaf + 1 : N - leaf);
    });
    book.dataset.at = S.cur === 0 ? 'first' : S.cur === N ? 'last' : 'mid';
    $$('.dots i').forEach((d, i) => d.classList.toggle('on', i === S.cur));
    // 这一跨页的两页：翻好了再让里面的东西按拍子出来
    const vis = S.stage === 'book' ? [S.seq[S.cur * 2 - 1], S.seq[S.cur * 2]].filter(Boolean) : [];
    clearTimeout(T.flip);
    S.seq.forEach((p) => { if (vis.indexOf(p) < 0) p.classList.remove('on'); });
    T.flip = setTimeout(() => vis.forEach((p) => p.classList.add('on')), animated && !reduce() ? BEAT : 0);
    // 翻页那一拍里是 3D 的，翻完回到平面（.rest），字才不糊
    clearTimeout(T.rest);
    if (animated && !reduce()) { book.classList.remove('rest'); T.rest = setTimeout(() => book.classList.add('rest'), BEAT + 40); }
    else book.classList.add('rest');
    schedule();
  }
  function go(to, animated) {
    const n = Math.max(0, Math.min(spreads(), to));
    if (n === S.cur) return;
    // 一次翻好几页时，正在动的那几张纸叠在最上面
    const lo = Math.min(n, S.cur), hi = Math.max(n, S.cur);
    S.cur = n;
    place(animated !== false);
    S.seq.forEach((p, i) => { const leaf = Math.floor(i / 2); if (leaf >= lo && leaf < hi) p.style.zIndex = String(100 + (n > lo ? hi - leaf : leaf)); });
    clearTimeout(T.z);
    T.z = setTimeout(() => { const N = S.seq.length / 2; S.seq.forEach((p, i) => { const leaf = Math.floor(i / 2); p.style.zIndex = String(leaf < S.cur ? leaf + 1 : N - leaf); }); }, reduce() ? 0 : BEAT);
  }

  // ---------- 自动翻 ----------
  function beatsOf(s) {
    let max = 0;
    [S.seq[s * 2 - 1], S.seq[s * 2]].filter(Boolean).forEach((p) => {
      $$('.b', p).forEach((el) => { const v = parseFloat(el.style.getPropertyValue('--b')) || 0; if (v > max) max = v; });
    });
    return Math.ceil(max) + HOLD;
  }
  const isFinale = (s) => [S.seq[s * 2 - 1], S.seq[s * 2]].some((p) => p && p.dataset.scene === 'finale');
  function schedule() {
    clearTimeout(T.next);
    const playing = S.stage === 'book' && S.auto && !reduce() && S.cur < spreads() && !isFinale(S.cur) && $('.pop').hidden;
    root.dataset.play = playing ? '1' : '0';
    if (!playing) return;
    T.next = setTimeout(() => go(S.cur + 1), (beatsOf(S.cur) + 1) * BEAT);
  }
  function setAuto(on) {
    S.auto = on;
    const bt = $('[data-act="auto"]');
    if (bt) bt.setAttribute('aria-pressed', String(on));
    schedule();
  }
  function toast(text) {
    const el = $('.toastline');
    if (!el) return;
    clearTimeout(T.toast);
    el.textContent = text;
    el.classList.toggle('on', !!text);
    if (text) T.toast = setTimeout(() => el.classList.remove('on'), 2400);
  }

  // ---------- 桌面 ↔ 小报 ----------
  function show() {
    $$('[data-desk]').forEach((el) => { el.hidden = S.stage !== 'desk'; });
    book.hidden = S.stage !== 'book';
    $('.bar').hidden = S.stage !== 'book';
  }
  function enter() {
    S.stage = 'book';
    S.cur = 0;
    show();
    setAuto(!reduce());
    place(false);
    if (!reduce()) { book.classList.add('is-in'); setTimeout(() => book.classList.remove('is-in'), 720); }
  }
  function openBook() {
    if (S.stage !== 'desk') return;
    $('.pm-env').classList.add('is-open');
    clearTimeout(T.open);
    T.open = setTimeout(enter, reduce() ? 0 : 1350);
  }
  // 收进抽屉：翻到一半的先合上（右半边一起翻过去，合在封底上），抽屉从桌子下面拉出来，小报提一下、落进去，抽屉推回去
  function closeBook() {
    if (S.stage !== 'book' || S.closing) return;
    clearTimeout(T.next);
    if (!$('.pop').hidden) shut(true);
    setAuto(false);
    if (reduce() || !book.animate) return stowed();
    S.closing = true;
    $('.bar').classList.add('is-away');
    const N = spreads(), fold = S.cur > 0 && S.cur < N;
    if (fold) go(N);
    T.stow = setTimeout(stow, fold ? BEAT + 120 : 80);
  }
  function stow() {
    const drawers = $$('.drawer');
    drawers.forEach((d) => { d.hidden = false; });
    const first = book.dataset.at === 'first', w = book.offsetWidth, h = book.offsetHeight;
    const base = 'translateX(' + (first ? -w / 4 : w / 4) + 'px)';
    book.style.transformOrigin = (first ? w * 0.75 : w * 0.25) + 'px ' + h / 2 + 'px';
    book.classList.add('is-stowing');
    const D = 1760, at = (ms) => ms / D;
    const tf = (y, s, r) => base + ' translateY(' + y + 'px) scale(' + s + ') rotate(' + r + 'deg)';
    const anims = drawers.map((d) => d.animate([
      { transform: 'translateY(260px)', offset: 0, easing: 'cubic-bezier(.2,.9,.3,1.12)' },
      { transform: 'translateY(0px)', offset: at(440) },
      { transform: 'translateY(0px)', offset: at(1300), easing: 'cubic-bezier(.55,0,.75,1)' },
      { transform: 'translateY(260px)', offset: 1 },
    ], { duration: D, fill: 'forwards' }));
    anims.push(book.animate([
      { transform: tf(0, 1, 0), offset: 0 },
      { transform: tf(0, 1, 0), offset: at(140), easing: 'cubic-bezier(.3,.7,.4,1)' },
      { transform: tf(-18, 0.97, -1), offset: at(480), easing: 'cubic-bezier(.55,0,.8,.45)' },
      { transform: tf(366, 0.6, -2.5), offset: at(1020), easing: 'cubic-bezier(.2,.6,.4,1)' },
      { transform: tf(352, 0.6, -2), offset: at(1130), easing: 'cubic-bezier(.5,0,.6,1)' },
      { transform: tf(360, 0.6, -2), offset: at(1240) },
      { transform: tf(360, 0.6, -2), offset: at(1300), easing: 'cubic-bezier(.55,0,.75,1)' },
      { transform: tf(620, 0.6, -2), offset: 1 },
    ], { duration: D, fill: 'forwards' }));
    anims[anims.length - 1].onfinish = () => {
      // 挂它的地方自己收场（Pomelo 回到 Atlas 的页）：小报停在收好的样子，不闪回来
      if (hooks.onClose) { S.closing = false; return hooks.onClose(); }
      anims.forEach((a) => a.cancel());
      drawers.forEach((d) => { d.hidden = true; });
      book.classList.remove('is-stowing');
      book.style.transformOrigin = '';
      stowed();
    };
  }
  // 回到桌面：小报合好放回第一页，信封还在桌上（审看时方便再看一遍）
  function stowed() {
    S.closing = false;
    if (hooks.onClose) return hooks.onClose();
    S.stage = 'desk';
    const env = $('.pm-env');
    if (env) env.classList.remove('is-open');
    $('.bar').classList.remove('is-away');
    S.seq.forEach((p) => p.classList.remove('on'));
    show();
    S.cur = 0;
    place(false);
    root.dataset.play = '0';
    const wrap = $('.envwrap');
    if (wrap && !reduce()) { wrap.classList.remove('is-back'); void wrap.offsetWidth; wrap.classList.add('is-back'); }
    toast('收进抽屉了 · 在 Atlas 里随时能再翻开');
  }

  // ---------- 原记录、星图上的一天、整封信 ----------
  function pop(o) {
    const el = $('.pop');
    $('.popmark', el).innerHTML = '';
    const mk = o.mark && $('.popmarks [data-mk="' + o.mark + '"]');
    if (mk && mk.firstElementChild) $('.popmark', el).appendChild(mk.firstElementChild.cloneNode(true));
    $('.popmod', el).textContent = o.mod || '';
    $('.popdot', el).hidden = !o.mod || !o.date;
    $('.popdate', el).textContent = o.date || '';
    $('.poptitle', el).textContent = o.title || '';
    const box = $('.poplines', el);
    box.innerHTML = '';
    (o.lines || []).forEach((l) => { const d = doc.createElement('div'); if (l[0]) { const bb = doc.createElement('b'); bb.textContent = l[0] + '　'; d.appendChild(bb); } d.appendChild(doc.createTextNode(l[1])); box.appendChild(d); });
    if (o.md) { const d = doc.createElement('div'); d.className = 'md'; d.innerHTML = mdHtml(o.md); box.appendChild(d); }
    box.scrollTop = 0;
    el.classList.toggle('is-letter', !!o.letter);
    S.rec = o.rec || null;
    $('[data-act="goto"]', el).hidden = !(S.rec && hooks.openRecord);
    stopPop();
    el.hidden = false;
    schedule();
    if (!reduce() && el.animate) unroll(el);
  }
  // 纸条卷开：纸卷先落下来，再往下滚，滚过的地方纸条露出来；滚到底纸卷压平不见
  let popAnims = [];
  function stopPop() { clearTimeout(T.dim); S.shutting = false; popAnims.forEach((a) => a.cancel()); popAnims = []; $('.pop').classList.remove('is-dim'); }
  const clipAt = (bottom, top) => 'inset(' + (top || '0px') + ' -40px ' + bottom + ' -40px)';
  const rollAt = (y, sy, extra) => 'translateY(' + y + 'px) rotate(-.6deg) scaleY(' + sy + ')' + (extra || '');
  function unroll(el) {
    const card = $('.popcard', el), roll = $('.roll', el), H = card.offsetHeight, D = 760, at = (ms) => ms / D;
    el.classList.add('is-dim');
    void el.offsetWidth;
    el.classList.remove('is-dim');
    popAnims = [
      roll.animate([
        { opacity: 0, transform: rollAt(-30, 1.1, ' scaleX(.6)'), offset: 0, easing: 'cubic-bezier(.3,1.4,.5,1)' },
        { opacity: 1, transform: rollAt(0, 1.1, ' scaleX(1)'), offset: at(200), easing: 'cubic-bezier(.45,.05,.25,1)' },
        { opacity: 1, transform: rollAt(H, 0.7), offset: at(680) },
        { opacity: 0, transform: rollAt(H, 0.2), offset: 1 },
      ], { duration: D, fill: 'none' }),
      card.animate([
        { clipPath: clipAt(H + 'px'), offset: 0 },
        { clipPath: clipAt(H + 'px'), offset: at(200), easing: 'cubic-bezier(.45,.05,.25,1)' },
        { clipPath: clipAt('0px'), offset: at(680) },
        { clipPath: clipAt('-60px', '-40px'), offset: 1 },
      ], { duration: D, fill: 'none' }),
    ];
  }
  // 纸条卷起来：纸卷从底下冒出来往上卷，卷到顶一甩收走
  function rollUp(el, done) {
    const card = $('.popcard', el), roll = $('.roll', el), H = card.offsetHeight, D = 560, at = (ms) => ms / D;
    popAnims = [
      roll.animate([
        { opacity: 0, transform: rollAt(H, 0.3), offset: 0 },
        { opacity: 1, transform: rollAt(H, 0.7), offset: at(70), easing: 'cubic-bezier(.45,0,.3,1)' },
        { opacity: 1, transform: rollAt(0, 1.1), offset: at(390), easing: 'cubic-bezier(.4,0,.8,.6)' },
        { opacity: 0, transform: rollAt(-46, 1.1, ' rotate(-9deg) scale(.55)'), offset: 1 },
      ], { duration: D, fill: 'forwards' }),
      card.animate([
        { clipPath: clipAt('-60px', '-40px'), offset: 0 },
        { clipPath: clipAt('0px'), offset: at(70), easing: 'cubic-bezier(.45,0,.3,1)' },
        { clipPath: clipAt(H + 'px'), offset: at(390) },
        { clipPath: clipAt(H + 'px'), offset: 1 },
      ], { duration: D, fill: 'forwards' }),
    ];
    T.dim = setTimeout(() => el.classList.add('is-dim'), 320);
    popAnims[0].onfinish = done;
  }
  function shut(now) {
    const el = $('.pop');
    if (el.hidden || S.shutting) return;
    const end = () => { stopPop(); el.hidden = true; schedule(); };
    if (now === true || reduce() || !el.animate) return end();
    stopPop();
    S.shutting = true;
    rollUp(el, end);
  }

  // ---------- 整封信是 Markdown（1.0.3）：先整段转义，再认标题、列表、引用、分隔线，行内的加粗、斜体、删除线、代码；链接只留字 ----------
  const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const inline = (s) => escHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(\S(?:[^*]*?\S)?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(\S(?:[^*]*?\S)?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/~~(\S(?:[^~]*?\S)?)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  function mdHtml(text) {
    const out = [];
    let para = [], quote = [], list = null;
    const flush = () => {
      if (para.length) out.push('<p>' + para.map(inline).join('<br>') + '</p>');
      if (quote.length) out.push('<blockquote>' + quote.map(inline).join('<br>') + '</blockquote>');
      if (list) out.push('<' + list.tag + '>' + list.items.map((i) => '<li>' + inline(i) + '</li>').join('') + '</' + list.tag + '>');
      para = []; quote = []; list = null;
    };
    for (const raw of String(text || '').replace(/\r\n?/g, '\n').split('\n')) {
      const line = raw.replace(/\s+$/, '');
      let m;
      if (!line.trim()) flush();
      else if ((m = /^ {0,3}#{1,6}\s+(.*?)(?:\s+#+)?$/.exec(line))) { flush(); out.push('<h3>' + inline(m[1]) + '</h3>'); }
      else if (/^ {0,3}([-*_])(?:\s*\1){2,}$/.test(line)) { flush(); out.push('<hr>'); }
      else if ((m = /^ {0,3}>\s?(.*)$/.exec(line))) { if (!quote.length) flush(); quote.push(m[1]); }
      else if ((m = /^ {0,3}(?:([-*+])|\d{1,3}[.)])\s+(.*)$/.exec(line))) {
        const tag = m[1] ? 'ul' : 'ol';
        if (!list || list.tag !== tag) { flush(); list = { tag, items: [] }; }
        list.items.push(m[2]);
      } else if (list && /^\s{2,}\S/.test(raw)) list.items[list.items.length - 1] += ' ' + line.trim();
      else { if (!para.length) flush(); para.push(line.trim()); }
    }
    flush();
    return out.join('');
  }

  // ---------- 落签的线垂在图标下面，隔一点（1.0.3；1.0.2 是贴着）：量出按钮里画的东西在正中那一竖上最低到哪，纸签的线从下面 GAP 像素开始 ----------
  const GAP = 3;
  const PAINT = (c) => !!c && c !== 'none' && c !== 'transparent' && !/^rgba\(.*,\s*0(?:\.0*)?\s*\)$|\/\s*0(?:\.0*)?\s*\)$/.test(c);
  function inkBottom(h, x) {
    let best = null;
    const hs = win.getComputedStyle(h);
    if (PAINT(hs.backgroundColor) || hs.backgroundImage !== 'none') { const r = h.getBoundingClientRect(); if (r.left <= x && x <= r.right && r.height) best = r.bottom; }
    for (const el of $$('path, circle, ellipse, rect, line, polyline, polygon', h)) {
      if (!(el instanceof win.SVGGeometryElement) || el.closest('.pm-tip, defs, symbol, clipPath, mask, pattern, marker, filter')) continue;
      const box = el.getBoundingClientRect(), cs = win.getComputedStyle(el);
      if ((!box.width && !box.height) || cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
      const sw = parseFloat(cs.strokeWidth) || 0;
      const fill = PAINT(cs.fill) && parseFloat(cs.fillOpacity) !== 0, stroke = PAINT(cs.stroke) && sw > 0 && parseFloat(cs.strokeOpacity) !== 0;
      if ((!fill && !stroke) || box.left - sw > x || box.right + sw < x || (best !== null && box.bottom + sw <= best)) continue;
      const svg = el.ownerSVGElement, m = el.getScreenCTM();
      let ok = !!(svg && m);
      if (ok) {
        const g = el.getBBox();
        const ps = [[g.x, g.y], [g.x + g.width, g.y], [g.x, g.y + g.height], [g.x + g.width, g.y + g.height]].map(([px, py]) => new win.DOMPoint(px, py).matrixTransform(m));
        ok = Math.abs(Math.min(...ps.map((q) => q.x)) - box.left) < 2.5 + sw && Math.abs(Math.max(...ps.map((q) => q.y)) - box.bottom) < 2.5 + sw;
      }
      if (!ok) { best = Math.max(best ?? -Infinity, box.bottom); continue; }
      const inv = m.inverse(), p = svg.createSVGPoint();
      for (let y = box.bottom + sw; y >= box.top - sw && (best === null || y > best); y -= 0.5) {
        p.x = x; p.y = y;
        const q = p.matrixTransform(inv);
        if ((fill && el.isPointInFill(q)) || (stroke && el.isPointInStroke(q))) { best = y; break; }
      }
    }
    return best;
  }
  function hang(e) {
    const h = e.target && e.target.closest ? e.target.closest('.pm-tip-host') : null;
    const tip = h && root.contains(h) ? $(':scope > .pm-tip', h) : null;
    if (!tip) return;
    const r = h.getBoundingClientRect(), k = h.offsetHeight ? r.height / h.offsetHeight : 1;
    const ink = inkBottom(h, r.left + r.width / 2);
    tip.style.top = ink === null ? '' : ((ink - r.top + GAP) / (k || 1)) + 'px';
  }

  // ---------- 点 ----------
  function onClick(e) {
    const t = e.target;
    const act = t.closest('[data-act]');
    if (act && root.contains(act)) {
      const a = act.dataset.act;
      if (a === 'open') openBook();
      else if (a === 'prev') { setAuto(false); go(S.cur - 1); }
      else if (a === 'next') { setAuto(false); go(S.cur + 1); }
      else if (a === 'auto') setAuto(!S.auto);
      else if (a === 'toc') { setAuto(false); go(1); }
      else if (a === 'close') closeBook();
      else if (a === 'again') { go(0); setAuto(!reduce()); }
      else if (a === 'shut') shut();
      else if (a === 'letter') { setAuto(false); pop({ mark: 'letter', mod: '柚子的来信', date: DATA.year + ' 年', title: '', md: DATA.letter, letter: true }); }
      else if (a === 'goto') { const key = S.rec; shut(true); if (key && hooks.openRecord) hooks.openRecord(key); }
      return;
    }
    if (t.classList && t.classList.contains('pop')) return shut();
    const rec = t.closest('[data-rec]');
    if (rec) { const r = DATA.recs[rec.dataset.rec]; if (!r) return; setAuto(false); return pop({ mark: r.mark, mod: r.mod, date: r.date, title: r.title, lines: r.text ? [['', r.text]] : [], rec: rec.dataset.rec }); }
    const day = t.closest('[data-day]');
    if (day) { const d = DATA.days[day.dataset.day]; if (!d) return; setAuto(false); return pop({ mark: 'star', mod: '星图', date: d.date, title: '这一天留下了 ' + d.n + ' 条', lines: d.lines }); }
    const toc = t.closest('[data-toc]');
    if (toc) { const i = S.seq.findIndex((p) => p.dataset.scene === toc.dataset.toc); setAuto(false); return go(Math.ceil(i / 2)); }
    // 碰一下小报就停
    if (t.closest('.book') && S.auto) setAuto(false);
  }
  function onKey(e) {
    if (S.stage !== 'book') { if (e.key === 'Escape' && hooks.onEscape) hooks.onEscape(); return; }
    if (e.key === 'Escape' && !$('.pop').hidden) { e.stopPropagation(); shut(); }
    else if (e.key === 'Escape') { if (hooks.onEscape) hooks.onEscape(); }
    else if (e.key === 'ArrowRight') { setAuto(false); go(S.cur + 1); }
    else if (e.key === 'ArrowLeft') { setAuto(false); go(S.cur - 1); }
  }
  root.addEventListener('click', onClick);
  root.addEventListener('pointerover', hang);
  root.addEventListener('focusin', hang);
  doc.addEventListener('keydown', onKey, true);

  layout();
  show();
  if (S.stage === 'book') enter();
  return {
    sync() { fit(); place(false); show(); },
    stop() { Object.keys(T).forEach((k) => clearTimeout(T[k])); if (ro) ro.disconnect(); root.removeEventListener('click', onClick); root.removeEventListener('pointerover', hang); root.removeEventListener('focusin', hang); doc.removeEventListener('keydown', onKey, true); },
  };
}
