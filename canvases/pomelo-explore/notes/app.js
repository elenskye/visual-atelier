// 见字如面的可点原型：换一篇、左栏选一样、拖列表两边的边框调三栏的宽、双指左右滑收起 / 放出左边两栏、
// 右键出格式那条纸、选中文字时浮出格式条（或钉住一直在）、「专心写」占满整个窗口、加密的那篇用 Touch ID 打开、
// 导出弹设置、「设置」子页调字号 / 行距 / 正文宽度 / 格式条。只是原型：字不能改。
var PomeloNotes = (function () {
  var MIN = { t: 132, l: 220, e: 400 }, MAX = { t: 260, l: 420 };
  function start(app) {
    var $ = function (s, r) { return (r || app).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || app).querySelectorAll(s)); };
    var ctx = $('.ctx'), float = $('.float'), cols = $('.cols'), page = $('.page.front');
    var paint = function () { Pomelo.paint(app); };

    // ---------- 换一篇、左栏 ----------
    function showDoc(id) {
      $$('.doc').forEach(function (d) { d.hidden = d.getAttribute('data-doc') !== id; });
      $$('.nrow').forEach(function (r) { r.classList.toggle('on', r.getAttribute('data-doc') === (id === 'letter-open' ? 'letter' : id)); });
      var row = $('.nrow[data-doc="' + (id === 'letter-open' ? 'letter' : id) + '"]');
      var crumb = $('.crumb-t');
      if (row && crumb) crumb.textContent = row.getAttribute('data-crumb') || '';
      hideFloat();
      paint();
      if (app.getAttribute('data-bar') === 'select') placeFloat();
    }
    $$('.nrow').forEach(function (r) { r.addEventListener('click', function () { showDoc(r.getAttribute('data-doc')); }); });
    $$('.side .srow').forEach(function (r) {
      r.addEventListener('click', function () { $$('.side .srow').forEach(function (x) { x.classList.toggle('on', x === r); }); paint(); });
    });

    // ---------- 三栏的宽：拖列表左右两条边；每栏有最小宽度 ----------
    var w = { t: parseFloat(cols.style.getPropertyValue('--wt')) || 176, l: parseFloat(cols.style.getPropertyValue('--wl')) || 296 };
    function apply() { cols.style.setProperty('--wt', w.t + 'px'); cols.style.setProperty('--wl', w.l + 'px'); }
    function fold() { return Number(app.getAttribute('data-fold') || 0); }
    $$('.grip').forEach(function (g) {
      var which = g.classList.contains('gl') ? 't' : 'l';
      g.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        g.setPointerCapture(e.pointerId);
        var x0 = e.clientX, w0 = { t: w.t, l: w.l }, total = cols.clientWidth;
        app.classList.add('dragging'); g.classList.add('on');
        var move = function (ev) {
          var dx = ev.clientX - x0;
          if (which === 't') w.t = Math.max(MIN.t, Math.min(MAX.t, w0.t + dx, total - 16 - w.l - MIN.e));
          else w.l = Math.max(MIN.l, Math.min(MAX.l, w0.l + dx, total - (fold() ? 0 : w.t + 16) - MIN.e));
          apply();
        };
        var up = function () {
          g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up);
          app.classList.remove('dragging'); g.classList.remove('on'); paint();
        };
        g.addEventListener('pointermove', move); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
      });
    });

    // ---------- 双指左右滑：往左一次收起标签，再一次收起列表；往右反过来（没有按钮） ----------
    var acc = 0, fired = false, idle = 0;
    cols.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (e.target.closest && e.target.closest('pre, .tbl')) return;
      e.preventDefault();
      acc += e.deltaX;
      clearTimeout(idle);
      idle = setTimeout(function () { acc = 0; fired = false; }, 280);
      if (fired || Math.abs(acc) < 60) return;
      fired = true;
      var f = Math.max(0, Math.min(2, fold() + (acc > 0 ? 1 : -1)));
      app.setAttribute('data-fold', String(f));
      hideFloat(); hideCtx();
      setTimeout(function () { paint(); if (app.getAttribute('data-bar') === 'select') placeFloat(); }, 340);
    }, { passive: false });

    // ---------- 右键：格式那条纸 ----------
    function hideCtx() { ctx.classList.remove('show'); ctx.classList.remove('wide'); $$('.cv', ctx).forEach(function (v) { v.hidden = v.getAttribute('data-v') !== 'fmt'; }); }
    function openCtx(x, y) {
      var box = app.getBoundingClientRect();
      ctx.classList.add('show');
      var cw = ctx.offsetWidth, ch = ctx.offsetHeight;
      ctx.style.left = Math.max(8, Math.min(x - box.left, box.width - cw - 8)) + 'px';
      ctx.style.top = Math.max(8, Math.min(y - box.top, box.height - ch - 8)) + 'px';
      Pomelo.paint(ctx);
    }
    $$('.doc').forEach(function (d) { d.addEventListener('contextmenu', function (e) { e.preventDefault(); hideCtx(); openCtx(e.clientX, e.clientY); }); });
    $$('[data-cv]', ctx).forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var v = b.getAttribute('data-cv');
        $$('.cv', ctx).forEach(function (x) { x.hidden = x.getAttribute('data-v') !== v; });
        ctx.classList.toggle('wide', v !== 'fmt');
        Pomelo.paint(ctx);
      });
    });
    app.addEventListener('pointerdown', function (e) { if (!ctx.contains(e.target)) hideCtx(); });

    // ---------- 选中文字时浮出来的格式条 ----------
    function hideFloat() { float.classList.remove('show'); }
    function placeAt(rect) {
      var box = app.getBoundingClientRect();
      float.classList.add('show');
      var fw = float.offsetWidth;
      float.style.left = Math.round(Math.max(8, Math.min(rect.left + rect.width / 2 - fw / 2 - box.left, box.width - fw - 8))) + 'px';
      float.style.top = Math.round(Math.max(8, rect.top - box.top - float.offsetHeight - 12)) + 'px';
      Pomelo.paint(float);
    }
    function placeFloat() {
      var doc = $('.doc:not([hidden])');
      var at = doc && ($('.sel', doc) || $('.caret', doc) || $('p:not(.dmeta)', doc));
      if (at && page.getAttribute('data-sub') !== '1') placeAt(at.getClientRects()[0] || at.getBoundingClientRect());
    }
    app.addEventListener('mouseup', function () {
      if (app.getAttribute('data-bar') !== 'select') return;
      var s = window.getSelection();
      if (!s || s.isCollapsed || !s.rangeCount) return;
      var r = s.getRangeAt(0);
      if (!$('.ed').contains(r.commonAncestorContainer)) return;
      placeAt(r.getClientRects()[0] || r.getBoundingClientRect());
    });
    function setBar(v) {
      app.setAttribute('data-bar', v);
      if (v === 'select') placeFloat(); else hideFloat();
      syncSeg('bar', v);
      paint();
    }
    $$('.pin').forEach(function (p) { p.addEventListener('click', function () { setBar(app.getAttribute('data-bar') === 'select' ? 'always' : 'select'); }); });

    // ---------- 专心写：占满整个窗口；右上角缩小回来 ----------
    function setFocus(on) {
      app.setAttribute('data-focus', on ? 'on' : 'off');
      hideFloat(); hideCtx();
      paint();
      if (app.getAttribute('data-bar') === 'select') setTimeout(placeFloat, 0);
    }
    $$('.focus').forEach(function (b) { b.addEventListener('click', function () { setFocus(true); }); });
    $$('.unfocus').forEach(function (b) { b.addEventListener('click', function () { setFocus(false); }); });

    // ---------- 加密的那篇：Touch ID 打开（原型里点一下就开） ----------
    $$('.unlock').forEach(function (b) {
      b.addEventListener('click', function () { b.disabled = true; setTimeout(function () { showDoc(b.getAttribute('data-open')); }, 500); });
    });

    // ---------- 子页：见字如面 · 设置 ----------
    $$('.ft').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.ft').forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        page.setAttribute('data-sub', t.getAttribute('data-sub'));
        hideFloat(); hideCtx();
        syncSeg('bar', app.getAttribute('data-bar'));
        paint();
        if (t.getAttribute('data-sub') === '0' && app.getAttribute('data-bar') === 'select') setTimeout(placeFloat, 0);
      });
    });

    // ---------- 设置：字号、行距、正文宽度、格式条（改了马上换） ----------
    function pick(btn) {
      $$('.pm-seg-item', btn.parentNode).forEach(function (x) {
        var on = x === btn;
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
        var old = x.querySelector(':scope > [data-hand-painted]');
        if (on) x.setAttribute('data-hand', 'pick'); else { x.removeAttribute('data-hand'); if (old) old.remove(); }
      });
    }
    function syncSeg(key, v) { var b = $('[data-set="' + key + '"] .pm-seg-item[data-v="' + v + '"]'); if (b) pick(b); }
    var VARS = { fs: ['--fs', 'px'], lh: ['--lh', ''], mw: ['--mw', 'px'] };
    $$('[data-set] .pm-seg-item').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.parentNode.getAttribute('data-set'), v = b.getAttribute('data-v');
        pick(b);
        if (key === 'bar') { app.setAttribute('data-bar', v); hideFloat(); }
        else app.style.setProperty(VARS[key][0], v + VARS[key][1]);
        paint();
      });
    });

    // ---------- 导出：弹设置 ----------
    $$('.export').forEach(function (b) { b.addEventListener('click', function () { app.setAttribute('data-dlg', 'export'); paint(); }); });
    $$('.dlg-x').forEach(function (b) { b.addEventListener('click', function () { app.removeAttribute('data-dlg'); }); });
    $$('.sty').forEach(function (s) { s.addEventListener('click', function () { $$('.sty').forEach(function (x) { x.classList.toggle('on', x === s); }); paint(); }); });
    $$('.dlg .pm-check').forEach(function (c) { c.addEventListener('click', function () { c.setAttribute('aria-checked', c.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); }); });
    $$('.dlg .pm-seg-item').forEach(function (s) { s.addEventListener('click', function () { pick(s); paint(); }); });

    // ---------- 起始画面 ----------
    if (app.getAttribute('data-ctx') === 'open') {
      var at = $('.doc:not([hidden]) .ctx-at');
      if (at) { var r = at.getBoundingClientRect(); openCtx(r.left, r.top); }
    }
    if (app.getAttribute('data-bar') === 'select') {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeFloat); else placeFloat();
    }
  }
  return { start: start };
})();
