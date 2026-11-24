// 外框原型的交互（画板脚本，经典 JS；gen.mjs 原样放进每张画板）。动静照 Phase 2 定稿（canvases/pomelo-explore/p2-final/logic.js）。
// 画板的结构是静态的（gen.mjs 生成）；这里只改元素的 class、data-*、hidden，往空的容器里放东西，
// 所以画布运行时重画（换配色、明暗）时不会被冲掉。
// 动静本身都在 Design System 的 bundle.css 里（schemes/pomelo/motion/ 的零件）；这里只在该动的时候加上零件的类名：
//   is-in（刚出现）、is-pop（刚点过）、is-open / is-closing（展开、收起）、is-leaving（要走了）、is-hover（找到的那张）。
//   开着的页 = 页签：open 按最近看的排（第一个是当前页），tabs 按打开的先后（顶栏「桌上开着」的顺序）。
//   ‹ › 是走过的页；回桌面、柚子瓣、贴纸簿、找东西、关页都不算一步。
var PomeloFrame = (function () {
  function start(app, cfg) {
    var S = { view: cfg.view, open: cfg.open.slice(), tabs: cfg.open.slice(), hist: [], fwd: [], ov: null, ang: 0, ssel: 0, shown: cfg.open.slice() };
    var $ = function (s, r) { return (r || app).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || app).querySelectorAll(s)); };
    var root = app.closest('.root');
    var reduce = function () { return root.dataset.motion === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
    var pageEl = function (id) { return $('.page[data-mod="' + id + '"]'); };
    var snap = function () { return { view: S.view, cur: S.view === 'page' ? S.open[0] : null }; };
    var later = function (fn, ms) { return setTimeout(fn, reduce() ? 0 : ms); };
    var moved = false;
    // 只放一次的动画：先去掉、读一次宽高、再加上，才会从头放
    function replay(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
    // 放完就把类名拿掉：不然它藏起来再出来（换页、回桌面、再打开）时会再放一遍
    function flash(el, cls, ms) { if (!el) return; replay(el, cls); clearTimeout(el._flashT); el._flashT = setTimeout(function () { el.classList.remove(cls); }, ms); }

    // ---------- 柚子的表情：到桌上眨眼，开柚子瓣、贴纸簿是「哇」，进一页开心，问它时在想；20 秒不动睡着，鼠标一动吓一跳 ----------
    var faceT = 0, lastMove = Date.now();
    function faceFor(f, ms) {
      clearTimeout(faceT);
      app.dataset.face = f;
      if (ms) faceT = setTimeout(function () { app.dataset.face = 'normal'; }, ms);
    }
    setInterval(function () {
      if (Date.now() - lastMove > 20000 && (app.dataset.face || 'normal') === 'normal' && !S.ov) app.dataset.face = 'sleepy';
    }, 2000);
    root.addEventListener('pointermove', function () {
      lastMove = Date.now();
      if (app.dataset.face === 'sleepy') faceFor('surprised', 900);
    });

    // 顶栏的一张小贴纸：拿这一页右边露出来的那张，缩小
    function smallSticker(id, size) {
      var src = $('.peek', pageEl(id));
      var mk = src ? src.querySelector('.mk') : null;
      return (mk ? mk.outerHTML : '').replace(/<svg([^>]*?) width="[\d.]+" height="[\d.]+"/, '<svg$1 width="' + size + '" height="' + size + '"');
    }

    function render(enterId) {
      app.dataset.view = S.view;
      if (S.ov) app.dataset.ov = S.ov; else delete app.dataset.ov;
      var cur = S.view === 'page' ? S.open[0] : null;
      $$('.page').forEach(function (el) {
        var i = S.open.indexOf(el.dataset.mod);
        var front = !!cur && i === 0, wasFront = el.classList.contains('on');
        el.classList.toggle('on', front);
        el.classList.toggle('st', !!cur && i > 0 && i <= 4);
        el.classList.toggle('is-stacked', !!cur && i > 0 && i <= 4);
        el.classList.toggle('far', i < 0 || i > 4);
        el.style.setProperty('--j', String(Math.max(0, i - 1)));
        // 换到最前的那页：左上角的贴纸再拍一下
        if (front && !wasFront && !reduce()) replay($('.slap', el), 'is-in');
      });
      if (enterId && !reduce()) replay(pageEl(enterId), 'is-in');
      var box = $('.opens');
      var before = {};
      $$('.ob', box).forEach(function (b) { before[b.dataset.go] = true; });
      box.innerHTML = S.tabs.map(function (id) {
        var name = cfg.mods[id].name;
        var fresh = !before[id] && S.shown.indexOf(id) < 0;
        return '<button type="button" role="tab" aria-selected="' + (id === cur) + '" class="ob pm-press pm-open-tab pm-tip-host' + (id === cur ? ' on' : '') + (fresh ? ' pm-slap-in is-in' : '') + '" data-go="' + id + '" aria-label="' + name + '">' + smallSticker(id, 30) +
          '<span class="ul" data-hand="rule" data-seed="700" data-sw="3"></span><span class="ux" data-close="' + id + '" role="button" aria-label="关掉「' + name + '」"><span data-hand="icon" data-size="11" data-seed="3" data-d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5"></span></span>' +
          '<span class="pm-tip" role="tooltip"><span class="pm-tip-string"></span><span class="pm-tip-tag">' + name + '</span></span></button>';
      }).join('');
      S.tabs.forEach(function (id) { if (S.shown.indexOf(id) < 0) S.shown.push(id); });
      $('.openlbl').hidden = !S.tabs.length;
      if (window.Pomelo) Pomelo.paint(box);
      // 贴纸簿里开着的那几张撕走了：留虚线空位，写「在桌上」；关掉的那页的贴纸贴回来啪一下
      $$('.stk').forEach(function (s) {
        var used = S.tabs.indexOf(s.dataset.stk) >= 0;
        if (s.classList.contains('used') && !used && !reduce()) flash(s, 'is-back', 520);
        s.classList.toggle('used', used);
        s.classList.remove('is-flyoff');
        s.style.transform = ''; s.style.opacity = '';
      });
      $('[data-act=back]').disabled = !S.hist.length;
      $('[data-act=fwd]').disabled = !S.fwd.length;
    }

    function step() { S.hist.push(snap()); if (S.hist.length > 50) S.hist.shift(); S.fwd = []; }
    function show(id) {
      var fresh = S.tabs.indexOf(id) < 0;
      if (fresh) S.tabs.push(id);
      var wasHome = S.view !== 'page';
      S.open = [id].concat(S.open.filter(function (x) { return x !== id; }));
      S.view = 'page';
      leaveOv();
      render(fresh || wasHome ? id : null);
      faceFor('happy', 900);
    }
    function goPage(id) {
      if (S.view === 'page' && S.open[0] === id && !S.ov) return;
      step();
      show(id);
    }
    // 问候：便签一张张落下来、「下午好呀」写出来，写完柚子眨一下眼
    function greet() { if (!reduce()) replay($('.desk'), 'is-in'); faceFor('normal'); later(function () { if (!S.ov) faceFor('wink', 900); }, 1250); }
    function goHome() { if (S.view === 'home' && !S.ov) return; step(); var was = S.view; S.view = 'home'; leaveOv(); render(); if (was !== 'home') greet(); else faceFor('wink', 900); }
    function apply(s) {
      if (s.view === 'page' && s.cur && S.tabs.indexOf(s.cur) >= 0) show(s.cur);
      else { S.view = 'home'; leaveOv(); render(); greet(); }
    }
    function back() { if (!S.hist.length) return; S.fwd.push(snap()); apply(S.hist.pop()); }
    function fwd() { if (!S.fwd.length) return; S.hist.push(snap()); apply(S.fwd.pop()); }
    // 关掉一页：顶栏的小贴纸掀起来撕走（0.3 秒），再关
    function closeTab(id) {
      var b = $('.ob[data-go="' + id + '"]');
      var done = function () {
        S.tabs = S.tabs.filter(function (x) { return x !== id; });
        S.shown = S.shown.filter(function (x) { return x !== id; });
        var wasCur = S.view === 'page' && S.open[0] === id;
        S.open = S.open.filter(function (x) { return x !== id; });
        if (wasCur && !S.open.length) S.view = 'home';
        render();
        if (wasCur && S.view === 'home') greet();
      };
      if (!b || reduce()) return done();
      b.classList.remove('is-in');
      b.classList.add('is-leaving');
      setTimeout(done, 300);
    }

    // ---------- 柚子瓣、贴纸簿、找东西：打开 .is-open，收起 .is-closing（放完再藏起来） ----------
    var OV = { bloom: ['.jp', '.whl'], book: ['.bk', '.book'], search: ['.sr'] };
    var OUT_MS = { bloom: 300, book: 320, search: 300 };
    var closingT = 0;
    function ovEls(kind) { return OV[kind].map(function (s) { return $(s); }); }
    function openOv(kind) {
      if (S.ov === kind) return closeOv();
      if (S.ov) leaveOv();
      if (kind === 'bloom') {
        // 从左上角的柚子那里转着长出来
        var hub = $('.hub').getBoundingClientRect(), r = root.getBoundingClientRect(), whl = $('.whl');
        whl.style.setProperty('--pm-from-x', Math.round(hub.left + hub.width / 2 - r.left - 640) + 'px');
        whl.style.setProperty('--pm-from-y', Math.round(hub.top + hub.height / 2 - r.top - 429) + 'px');
      }
      S.ov = kind;
      render();
      ovEls(kind).forEach(function (e) { e.classList.remove('is-closing'); if (!reduce()) replay(e, 'is-open'); });
      if (kind !== 'search') faceFor('wow', 900);
      var q = $(kind === 'bloom' ? '.wq' : kind === 'book' ? '.bq' : '.sq');
      q.value = kind === 'search' && cfg.sq ? cfg.sq : '';
      if (kind === 'search') runSearch(); else filter(kind, '');
      setTimeout(function () { q.focus({ preventScroll: true }); }, 60);
    }
    // 收起：放收起的动画，同时状态已经回去了（底下的桌面、页马上能用）
    function leaveOv() {
      if (!S.ov) return;
      var kind = S.ov;
      S.ov = null;
      clearTimeout(closingT);
      if (reduce()) { delete app.dataset.closing; return; }
      app.dataset.closing = kind;
      ovEls(kind).forEach(function (e) { e.classList.remove('is-open'); e.classList.add('is-closing'); });
      closingT = setTimeout(function () {
        if (app.dataset.closing === kind) delete app.dataset.closing;
        ovEls(kind).forEach(function (e) { e.classList.remove('is-closing'); });
      }, OUT_MS[kind]);
    }
    function closeOv() { if (!S.ov) return; leaveOv(); render(); }

    // 打字就找：对不上的变淡，对上的亮（柚子瓣里挂出名字小签）；回车进第一个；什么都对不上就问柚子
    function filter(kind, text) {
      var t = text.trim();
      var cells = $$(kind === 'bloom' ? '.slot' : '.stk');
      var hits = [];
      cells.forEach(function (c) {
        var id = c.dataset.go || c.dataset.stk;
        var hit = !!t && cfg.mods[id].name.indexOf(t) >= 0;
        if (hit) hits.push(id);
        c.classList.toggle('dim', !!t && !hit);
        c.classList.toggle('hit', hit);
        var lift = $('.slotlift', c);
        if (lift) lift.classList.toggle('is-hover', hit);
      });
      var ask = $(kind === 'bloom' ? '.wask' : '.bask');
      ask.hidden = !t || hits.length > 0;
      $('span', ask).textContent = (kind === 'bloom' ? '问柚子「' : '没有这一页，问柚子「') + t + '」';
      if (kind === 'bloom' && t === '柚子' && !reduce()) {
        flash($('.whl'), 'is-spin', 920);
        faceFor('happy', 1300);
      }
      return hits;
    }
    ['bloom', 'book'].forEach(function (kind) {
      var q = $(kind === 'bloom' ? '.wq' : '.bq');
      q.addEventListener('input', function () { filter(kind, q.value); });
      q.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var hits = filter(kind, q.value);
        if (hits.length) goPage(hits[0]); else if (q.value.trim()) askYouzi(q.value.trim());
      });
    });
    $('.wask').addEventListener('click', function () { askYouzi($('.wq').value.trim()); });
    $('.bask').addEventListener('click', function () { askYouzi($('.bq').value.trim()); });

    // 柚子瓣：拖着转，松手接着转一会儿（每帧乘 0.95）；没拖动就是点了那个模块
    (function () {
      var whl = $('.whl');
      whl.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || e.target.closest('input,.nodrag')) return;
        var box = whl.getBoundingClientRect(), cx = box.left + box.width / 2, cy = box.top + box.height / 2;
        var angOf = function (x, y) { return Math.atan2(y - cy, x - cx) * 180 / Math.PI; };
        var last = angOf(e.clientX, e.clientY), w = 0, lt = performance.now(), x0 = e.clientX, y0 = e.clientY;
        moved = false;
        whl.setPointerCapture(e.pointerId);
        var move = function (ev) {
          if (Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) > 4) moved = true;
          if (!moved) return;
          var a = angOf(ev.clientX, ev.clientY), da = a - last;
          if (da > 180) da -= 360; if (da < -180) da += 360;
          var now = performance.now();
          w = 0.6 * w + 0.4 * (da / Math.max(1, now - lt)) * 16; lt = now; last = a;
          S.ang += da; whl.style.setProperty('--pm-a', S.ang.toFixed(2) + 'deg');
        };
        var up = function (ev) {
          whl.removeEventListener('pointermove', move); whl.removeEventListener('pointerup', up); whl.removeEventListener('pointercancel', up);
          if (!moved) {
            var t = document.elementFromPoint(ev.clientX, ev.clientY), slot = t && t.closest && t.closest('.slot');
            if (slot) goPage(slot.dataset.go);
            return;
          }
          setTimeout(function () { moved = false; }, 0);
          if (performance.now() - lt > 90 || reduce()) return;
          var coast = function () {
            w *= 0.95; S.ang += w; whl.style.setProperty('--pm-a', S.ang.toFixed(2) + 'deg');
            if (Math.abs(w) > 0.05) requestAnimationFrame(coast);
          };
          requestAnimationFrame(coast);
        };
        whl.addEventListener('pointermove', move); whl.addEventListener('pointerup', up); whl.addEventListener('pointercancel', up);
      });
    })();

    // 贴纸簿：点一下撕下来飞走就去那里；拖出簿子（拖到簿子上边外面）放到桌上也行
    $$('.stk').forEach(function (el) {
      var id = el.dataset.stk;
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') goPage(id); });
      el.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-peeling');
        var x0 = e.clientX, y0 = e.clientY, drag = false;
        var move = function (ev) {
          var dx = ev.clientX - x0, dy = ev.clientY - y0;
          if (!drag && Math.abs(dx) + Math.abs(dy) < 5) return;
          drag = true;
          el.classList.add('is-held');
          el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (dx * 0.05).toFixed(1) + 'deg) scale(1.12)';
        };
        var up = function (ev) {
          el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
          el.classList.remove('is-peeling', 'is-held');
          if (drag) {
            var top = $('.book').getBoundingClientRect().top;
            if (ev.clientY < top + 10) { el.style.opacity = '0'; goPage(id); return; }
            el.style.transform = '';
            return;
          }
          if (reduce()) return goPage(id);
          el.classList.add('is-flyoff');
          later(function () { goPage(id); }, 420);
        };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      });
    });

    // 找东西：一张小票从出纸口打出来，边打字边往下打印结果；选中一行，小票撕下来带你过去
    function hits() {
      var q = $('.sq').value.trim();
      if (!q) return { groups: [], near: [] };
      var list = cfg.index.filter(function (h) { return h[1].indexOf(q) >= 0 || h[2].indexOf(q) >= 0 || cfg.mods[h[0]].name.indexOf(q) >= 0; });
      var groups = [];
      cfg.order.forEach(function (m) { var rows = list.filter(function (h) { return h[0] === m; }).slice(0, 3); if (rows.length) groups.push({ mod: m, rows: rows }); });
      var near = (cfg.near[q] || []).map(function (h) { return { mod: h[0], rows: [h] }; });
      return { groups: groups.slice(0, 5), near: near };
    }
    function flat() { var h = hits(); return h.groups.concat(h.near).reduce(function (a, g) { return a.concat(g.rows.map(function (r) { return r[0]; })); }, []); }
    function runSearch() {
      var h = hits(), q = $('.sq').value.trim(), k = 0;
      var n = h.groups.reduce(function (a, g) { return a + g.rows.length; }, 0);
      $('.scount').textContent = q ? (n ? n + ' 条' : '') : '';
      var grp = function (g) {
        return '<div class="sgh">' + smallSticker(g.mod, 18) + '<span>' + cfg.mods[g.mod].name + '</span></div>' + g.rows.map(function (r) {
          var i = k++;
          return '<button type="button" class="srow pm-print-row' + (i === S.ssel ? ' on' : '') + '" data-pick="' + i + '" style="--pm-i:' + i + '"><span class="rt">' + r[1] + '</span><span class="rd">' + r[2] + '</span></button>';
        }).join('');
      };
      var html = h.groups.map(grp).join('');
      if (q && !n) html += '<div class="snone">没找到「' + q.replace(/</g, '&lt;') + '」<button type="button" class="sask">问问柚子</button></div>';
      if (h.near.length) html += '<div class="snear"><i></i><span>意思相近</span><i></i></div>' + h.near.map(grp).join('');
      $('.sres').innerHTML = html;
    }
    function pick(i) {
      var f = flat();
      if (!f.length) return;
      var mod = f[Math.max(0, Math.min(f.length - 1, i))];
      var r = $('.rcpt');
      if (reduce()) return goPage(mod);
      replay(r, 'is-tear');
      setTimeout(function () { r.classList.remove('is-tear'); goPage(mod); }, 340);
    }
    $('.sq').addEventListener('input', function () { S.ssel = 0; runSearch(); });
    $('.sq').addEventListener('keydown', function (e) {
      var n = flat().length;
      if (e.key === 'ArrowDown') { e.preventDefault(); S.ssel = Math.min(n - 1, S.ssel + 1); runSearch(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); S.ssel = Math.max(0, S.ssel - 1); runSearch(); }
      else if (e.key === 'Enter') pick(S.ssel);
    });
    $('.sres').addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick]');
      if (b) pick(Number(b.dataset.pick));
      else if (e.target.closest('.sask')) askYouzi($('.sq').value.trim());
    });

    // ---------- 问柚子（柚子那一页）：我问的便签啪地贴上；柚子先想（表情「在想」、绕一笔），再一个字一个字写出回答 ----------
    var asking = false;
    function answerFor(q) {
      if (!q) return [['想问什么都行：今天要做什么、这个月花了多少、谁的生日快到了。', 0]];
      if (q.indexOf('柚子') >= 0) return [['我在这儿呢～', 0], ['想去哪一页，打字就能找到', 1], ['；想记点什么，直接跟我说。', 0]];
      if (/花|钱|吃饭|账/.test(q)) return [['这个月到今天花了 ', 0], ['¥3,619.50', 1], ['，房租占了大头；吃饭 ¥486，比上个月少一点。', 0]];
      if (/生日|礼物|小林/.test(q)) return [['小林的生日在 11 月 13 日，还有 5 天。念念不忘里记着一个点子：', 0], ['一盆小柚子树', 1], ['。', 0]];
      if (/今天|做什么|待办/.test(q)) return [['今天有 3 件事，最急的是', 0], ['交作业', 1], ['，今晚 12 点截止。给猫买粮已经做完啦。', 0]];
      return [['我翻了翻你的本子，「' + q + '」没有对应的一页。要不要我帮你记进念念不忘？', 0]];
    }
    function askYouzi(q) {
      goPage('youzi');
      if (!q || asking) { setTimeout(function () { var c = $('.cq'); if (c) c.focus({ preventScroll: true }); }, 80); return; }
      asking = true;
      var msgs = $('.msgs', pageEl('youzi'));
      var me = document.createElement('div');
      me.className = 'me';
      me.innerHTML = '<div class="mebub pm-slap-in' + (reduce() ? '' : ' is-in') + '" data-hand="frame" data-r="10" data-sw="1.4" data-amp="0.5" data-fill="selected" data-tilt="0.7" data-tapes="1" data-seed="' + (961 + msgs.children.length) + '"></div>';
      me.firstChild.textContent = q;
      msgs.appendChild(me);
      // 之前的回答旁边的柚子不再跟着换表情：只留「平常」那张
      $$('.yzav.faces', msgs).forEach(function (av) {
        av.classList.remove('faces');
        $$('.fc', av).forEach(function (fc) { if (fc.dataset.face !== 'normal') av.removeChild(fc); });
      });
      var yz = document.createElement('div');
      yz.className = 'yz';
      yz.innerHTML = '<span class="yzav">' + cfg.avatar + '</span><div class="thinking"><svg class="pm-think-line" width="44" height="40" viewBox="0 0 44 40" style="overflow:visible" aria-hidden="true"><path pathLength="1" d="' + cfg.thinkPath + '" fill="none" stroke="var(--color-pen)" stroke-width="2.4" stroke-linecap="round"></path></svg><span>柚子在想…</span></div>';
      yz.querySelector('.yzav').className = 'yzav faces';
      msgs.appendChild(yz);
      while (msgs.children.length > 6) msgs.removeChild(msgs.firstChild);
      if (window.Pomelo) Pomelo.paint(msgs);
      later(function () { faceFor('think'); }, 450);
      later(function () {
        var segs = answerFor(q), i = 0;
        var html = segs.map(function (sg) {
          return Array.prototype.map.call(sg[0], function (c) {
            return '<span class="pm-ch' + (sg[1] ? ' pm-ch-b' : '') + '" style="--pm-i:' + (i++) + '">' + c.replace(/</g, '&lt;') + '</span>';
          }).join('');
        }).join('');
        var ans = document.createElement('div');
        ans.className = 'pm-answer' + (reduce() ? '' : ' is-live');
        ans.innerHTML = html;
        $('.thinking', yz).replaceWith(ans);
        setTimeout(function () { ans.classList.remove('is-live'); }, Math.min(i, 120) * 24 + 300);
        faceFor('happy', Math.min(i, 120) * 24 + 900);
        asking = false;
      }, 2050);
    }
    (function () {
      var c = $('.cq'), send = $('.csend');
      if (!c) return;
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' && c.value.trim()) { askYouzi(c.value.trim()); c.value = ''; } });
      send.addEventListener('click', function () { if (c.value.trim()) { askYouzi(c.value.trim()); c.value = ''; } });
      $$('.sug').forEach(function (b) { b.addEventListener('click', function () { askYouzi(b.dataset.ask); }); });
    })();

    // ---------- 勾选：果冻弹、划掉；一张单子全勾完，撒一把小贴纸 ----------
    function cheer(list) {
      var box = list.getBoundingClientRect(), r = root.getBoundingClientRect();
      stickNote('今天的事都做完啦！', Math.round(box.left + box.width / 2 - r.left), Math.round(box.top + box.height / 2 - r.top - 30), true);
      faceFor('happy', 1300);
    }
    // 便签啪地贴上、停一会儿撕走（motion/done-cheer 的写法）；confetti：同时撒一把小贴纸
    function stickNote(text, x, y, confetti) {
      var c = document.createElement('div');
      c.className = 'cheer pm-cheer is-in';
      c.style.left = x + 'px';
      c.style.top = y + 'px';
      var cols = ['yuzu', 'cat-pink', 'cat-sky', 'cat-mint', 'cat-grape', 'cat-orange'], shapes = ['pm-cf-dot', 'pm-cf-sq', 'pm-cf-star'], bits = '';
      for (var k = 0; k < 20; k++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4, d = 80 + Math.random() * 140, sz = 8 + Math.round(Math.random() * 6);
        bits += '<i class="' + shapes[k % 3] + '" style="width:' + sz + 'px;height:' + sz + 'px;background:var(--color-' + cols[k % 6] + ');--dx:' + Math.round(Math.cos(a) * d) + 'px;--dy:' + Math.round(Math.sin(a) * d) + 'px;--rr:' + Math.round(Math.random() * 540 - 270) + 'deg;--pm-d:' + (Math.random() * 0.1).toFixed(2) + 's"></i>';
      }
      c.innerHTML = '<div class="pm-cheer-note"><div class="pm-note" data-hand="note" data-seed="1455" data-tilt="-3" data-tapes="1" style="width:220px;height:92px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700">' + text + '</div></div>' + (confetti && !reduce() ? '<div class="pm-confetti">' + bits + '</div>' : '');
      app.appendChild(c);
      if (window.Pomelo) Pomelo.paint(c);
      setTimeout(function () { c.classList.remove('is-in'); c.classList.add('is-leaving'); }, 2400);
      setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 2800);
    }

    // ---------- 小彩蛋：连戳柚子（柚子那一页的大柚子）。每戳一下换一张脸；2.5 秒里戳 5 下，它转两圈晕过去，贴一张便签 ----------
    var pokes = [], dizzy = false;
    $$('.poke').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var now = Date.now();
        pokes = pokes.filter(function (t) { return now - t < 2500; }).concat(now);
        if (pokes.length >= 5 && !dizzy) {
          pokes = [];
          dizzy = true;
          faceFor('error', 2200);
          if (!reduce()) flash($('.fc[data-face=error]', btn), 'is-dizzy', 2200);
          var b = btn.getBoundingClientRect(), r = root.getBoundingClientRect();
          stickNote('别戳啦，晕了…', Math.round(b.right - r.left + 300), Math.round(b.top - r.top + 60), false);
          setTimeout(function () { dizzy = false; }, 3300);
          return;
        }
        if (!dizzy) faceFor(['wow', 'happy', 'wink', 'surprised'][pokes.length % 4], 1000);
      });
    });

    // ---------- 小彩蛋：撕起简报角上的柚子贴纸，底下的印子写着悄悄话（motion/sticker-whisper） ----------
    // 点一下往上翻起来，停 2.4 秒落回去；拖着撕就朝拖的方向翻，松手落回去；落到一半柚子眨眼。
    $$('.pm-whisper-peel').forEach(function (peel) {
      var upT = 0;
      function fall(ax, ay, a, origin) {
        clearTimeout(upT);
        peel.classList.remove('is-up');
        peel.style.transform = ''; peel.style.transformOrigin = '';
        if (reduce() || a < 1) { peel.classList.remove('is-falling'); return; }
        peel.style.setProperty('--pm-ax', ax.toFixed(3)); peel.style.setProperty('--pm-ay', ay.toFixed(3));
        peel.style.setProperty('--pm-a', a.toFixed(1)); peel.style.setProperty('--pm-origin', origin);
        var ms = 380 + a * 2.4;
        flash(peel, 'is-falling', ms + 40);
        setTimeout(function () { faceFor('wink', 900); }, Math.round(ms * 0.58));
      }
      function up() {
        clearTimeout(upT);
        peel.classList.remove('is-falling');
        replay(peel, 'is-up');
        upT = setTimeout(function () { fall(1, 0, 150, '50% 0'); }, 2400);
      }
      peel.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault(); e.stopPropagation();
        peel.setPointerCapture(e.pointerId);
        var x0 = e.clientX, y0 = e.clientY, pose = null;
        var move = function (ev) {
          var dx = ev.clientX - x0, dy = ev.clientY - y0, len = Math.hypot(dx, dy);
          if (len < 4) return;
          clearTimeout(upT);
          peel.classList.remove('is-up', 'is-falling');
          pose = { ax: -dy / len, ay: dx / len, a: Math.min(165, len * 1.7), origin: (dx < 0 ? '0%' : '100%') + ' ' + (dy < 0 ? '0%' : '100%') };
          peel.style.transformOrigin = pose.origin;
          peel.style.transform = 'perspective(420px) rotate3d(' + pose.ax.toFixed(3) + ', ' + pose.ay.toFixed(3) + ', 0, ' + pose.a.toFixed(1) + 'deg)';
        };
        var upH = function () {
          peel.removeEventListener('pointermove', move); peel.removeEventListener('pointerup', upH); peel.removeEventListener('pointercancel', upH);
          if (pose) fall(pose.ax, pose.ay, pose.a, pose.origin); else if (peel.classList.contains('is-up')) fall(1, 0, 150, '50% 0'); else up();
        };
        peel.addEventListener('pointermove', move); peel.addEventListener('pointerup', upH); peel.addEventListener('pointercancel', upH);
      });
      peel.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); up(); } });
    });
    function toggleCheck(t) {
      var on = t.getAttribute('aria-checked') !== 'true';
      t.setAttribute('aria-checked', String(on));
      if (!on) { t.classList.remove('is-pop'); return; }
      if (!reduce()) flash(t, 'is-pop', 620);
      var list = t.closest('.pm-card');
      if (list && $$('.pm-check', list).every(function (x) { return x.getAttribute('aria-checked') === 'true'; })) setTimeout(function () { cheer(list); }, 350);
    }

    // ---------- 下拉（钱来钱往的月份）：纸条一格格展开，选中的画个勾 ----------
    function closeMenu(menu, btn) {
      btn.setAttribute('aria-expanded', 'false');
      if (reduce()) { menu.hidden = true; return; }
      menu.classList.remove('is-open'); menu.classList.add('is-closing');
      setTimeout(function () { menu.hidden = true; menu.classList.remove('is-closing'); }, 180);
    }
    $$('.selwrap').forEach(function (w) {
      var btn = $('.pm-select', w), menu = $('.pm-menu', w);
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-expanded') === 'true') return closeMenu(menu, btn);
        btn.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
        if (window.Pomelo) Pomelo.paint(menu);
        if (!reduce()) replay(menu, 'is-open');
      });
      $$('.pm-menu-item', menu).forEach(function (it) {
        it.addEventListener('click', function () {
          $$('.pm-menu-item', menu).forEach(function (x) { x.setAttribute('aria-selected', String(x === it)); });
          $('.sellab', w).textContent = '2026 年 ' + it.dataset.m;
          later(function () { closeMenu(menu, btn); }, 380);
        });
      });
    });

    // ---------- 分段（来日方长）：荧光笔拖到新的一格 ----------
    function placeSeg(seg, pop) {
      var on = $('.pm-seg-item[aria-pressed="true"]', seg), hl = $('.pm-seg-hl', seg);
      if (!on || !hl) return;
      hl.style.width = on.offsetWidth + 'px';
      hl.style.setProperty('--pm-seg-x', (on.offsetLeft - 3) + 'px');
      if (window.Pomelo) Pomelo.paint(seg);
      if (pop && !reduce()) flash(hl, 'is-pop', 440);
    }
    $$('.pm-seg').forEach(function (seg) {
      $$('.pm-seg-item', seg).forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.getAttribute('aria-pressed') === 'true') return;
          $$('.pm-seg-item', seg).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          placeSeg(seg, true);
        });
      });
    });
    function placeAllSegs() { $$('.pm-seg').forEach(function (seg) { if (seg.offsetWidth) placeSeg(seg, false); }); }

    // 子页的纸签
    function pickSub(t) {
      var pg = t.closest('.page');
      $$('.ft', pg).forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
      $$('.sub', pg).forEach(function (s) { s.hidden = s.dataset.sub !== t.dataset.sub; });
      if (window.Pomelo) Pomelo.paint(pg);
    }

    app.addEventListener('click', function (e) {
      var t = e.target.closest('[data-close],[data-go],[data-act],.ft,.pm-check');
      if (!t || !app.contains(t) || moved || t.classList.contains('slot')) return;
      if (t.dataset.close) { e.stopPropagation(); closeTab(t.dataset.close); return; }
      if (t.classList.contains('ft')) { pickSub(t); return; }
      if (t.classList.contains('pm-check')) { toggleCheck(t); return; }
      if (t.dataset.go) { goPage(t.dataset.go); return; }
      var a = t.dataset.act;
      if (a === 'bloom' || a === 'book' || a === 'search') openOv(a);
      else if (a === 'home') goHome();
      else if (a === 'back') back();
      else if (a === 'fwd') fwd();
      else if (a === 'ask') askYouzi('');
      else if (a === 'flip') t.parentElement.querySelector('.pm-flip').classList.toggle('is-flipped');
    });
    // 点空白处收起
    ['.jp', '.bk', '.sr'].forEach(function (s) { $(s).addEventListener('click', function (e) { if (e.target === e.currentTarget) closeOv(); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.ov) { e.preventDefault(); closeOv(); } });

    // 便签：拖着走，松手有惯性（每帧乘 0.92），碰到桌边弹回；停下时落在整像素上。减弱动态效果时松手就停。
    var topZ = 20;
    $$('.note').forEach(function (n) {
      var pos = { x: 0, y: 0 };
      n.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || e.target.closest('button,input,a,.pm-whisper')) return;
        e.preventDefault();
        n.setPointerCapture(e.pointerId);
        n.classList.add('drag');
        n.style.zIndex = String(++topZ);
        var sx = e.clientX - pos.x, sy = e.clientY - pos.y, last = { x: e.clientX, y: e.clientY, t: performance.now() }, v = { x: 0, y: 0 };
        moved = false;
        var move = function (ev) {
          pos.x = ev.clientX - sx; pos.y = ev.clientY - sy;
          if (Math.abs(pos.x) + Math.abs(pos.y) > 3) moved = true;
          var now = performance.now(), dt = Math.max(8, now - last.t);
          v = { x: (ev.clientX - last.x) / dt * 16, y: (ev.clientY - last.y) / dt * 16 };
          last = { x: ev.clientX, y: ev.clientY, t: now };
          n.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
        };
        var up = function () {
          n.removeEventListener('pointermove', move); n.removeEventListener('pointerup', up); n.removeEventListener('pointercancel', up);
          n.classList.remove('drag');
          setTimeout(function () { moved = false; }, 0);
          var box = n.getBoundingClientRect(), desk = root.getBoundingClientRect();
          var rest = function () { pos.x = Math.round(pos.x); pos.y = Math.round(pos.y); n.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)'; };
          if (reduce()) return rest();
          var ox = box.left - pos.x - desk.left, oy = box.top - pos.y - desk.top;
          var tick = function () {
            pos.x += v.x; pos.y += v.y; v.x *= 0.92; v.y *= 0.92;
            var l = ox + pos.x, tp = oy + pos.y;
            if (l < 0) { pos.x = -ox; v.x = Math.abs(v.x) * 0.6; }
            if (l + box.width > 1280) { pos.x = 1280 - box.width - ox; v.x = -Math.abs(v.x) * 0.6; }
            if (tp < 58) { pos.y = 58 - oy; v.y = Math.abs(v.y) * 0.6; }
            if (tp + box.height > 800) { pos.y = 800 - box.height - oy; v.y = -Math.abs(v.y) * 0.6; }
            n.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
            if (Math.abs(v.x) + Math.abs(v.y) > 0.3) requestAnimationFrame(tick); else rest();
          };
          requestAnimationFrame(tick);
        };
        n.addEventListener('pointermove', move); n.addEventListener('pointerup', up); n.addEventListener('pointercancel', up);
      });
    });

    render();
    // 分段的荧光笔：页显示出来、字体到了以后量一次位置
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAllSegs);
    new MutationObserver(function () { placeAllSegs(); }).observe(app, { attributes: true, attributeFilter: ['data-view'] });
    $$('.page').forEach(function (p) { new MutationObserver(function () { if (p.classList.contains('on')) placeAllSegs(); }).observe(p, { attributes: true, attributeFilter: ['class'] }); });
    // 打开时：问候（便签一张张落下来、「下午好呀」写出来、柚子眨眼）；从柚子瓣、贴纸簿、找东西开始的板直接打开它
    if (cfg.overlay) openOv(cfg.overlay);
    else if (S.view === 'home') greet();
    else { faceFor('happy', 1100); var f = pageEl(S.open[0]); if (f && !reduce()) replay($('.slap', f), 'is-in'); }
  }
  return { start: start };
})();
