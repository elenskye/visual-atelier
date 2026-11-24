// 动效画板的播放（画板脚本，经典 JS；gen.mjs 原样放进每张画板）。
// 每格放一个动效零件的演示片段（schemes/pomelo/motion/<id>/ 的 fragment），「再来一次」按零件 motion.json 的 capture.steps
// 在同样的时刻加同样的类名——和导出 GIF、bench 动效台是同一套触发；动效本身在 Design System 的 bundle.css 里。
// 控件也能直接点：勾选、开关、分段、评分、下拉、标签、删除、信封、小票翻面。
var PomeloPlay = (function () {
  function applyStep(stage, s, host) {
    var sel = s.on || host;
    var nodes = s.all ? Array.prototype.slice.call(stage.querySelectorAll(sel)) : [stage.querySelector(sel)];
    nodes.forEach(function (n) {
      if (!n) return;
      String(s.add || '').split(/\s+/).filter(Boolean).forEach(function (c) { n.classList.add(c); });
      String(s.remove || '').split(/\s+/).filter(Boolean).forEach(function (c) { n.classList.remove(c); });
      Object.keys(s.attr || {}).forEach(function (k) { if (s.attr[k] === null) n.removeAttribute(k); else n.setAttribute(k, s.attr[k]); });
      Object.keys(s.style || {}).forEach(function (k) { n.style.setProperty(k, s.style[k]); });
    });
  }
  function replay(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  function start(cfg) {
    var timers = {};
    function play(cell) {
      var id = cell.dataset.part, part = cfg.parts[id];
      var stage = cell.querySelector('.stage');
      (timers[id] || []).forEach(clearTimeout);
      timers[id] = [];
      stage.innerHTML = part.html;
      if (window.Pomelo) Pomelo.paint(stage);
      // 等画好、字到了再开始（读一次宽高，过渡才有起点）
      void stage.offsetWidth;
      timers[id].push(setTimeout(function () {
        (part.steps || []).forEach(function (s) { timers[id].push(setTimeout(function () { applyStep(stage, s, part.host); void stage.offsetWidth; }, s.at)); });
      }, 120));
      // 放完东西就没了的：停一会儿放回开头的样子（不再放动画）
      if (part.reset) timers[id].push(setTimeout(function () { stage.innerHTML = part.html; if (window.Pomelo) Pomelo.paint(stage); }, part.reset));
    }
    var cells = Array.prototype.slice.call(document.querySelectorAll('.cell[data-part]'));
    cells.forEach(function (cell, i) {
      cell.querySelector('.again').addEventListener('click', function () { play(cell); });
      // 打开画板时一格接一格放一遍
      setTimeout(function () { play(cell); }, 400 + i * 260);
    });

    // ---------- 控件直接点 ----------
    document.addEventListener('click', function (e) {
      var t;
      if ((t = e.target.closest('.pm-check'))) {
        var on = t.getAttribute('aria-checked') !== 'true';
        t.setAttribute('aria-checked', String(on));
        if (on) replay(t, 'is-pop'); else t.classList.remove('is-pop');
      } else if ((t = e.target.closest('.pm-switch'))) {
        t.setAttribute('aria-checked', String(t.getAttribute('aria-checked') !== 'true'));
        replay(t, 'is-pop');
      } else if ((t = e.target.closest('.pm-seg-item'))) {
        var seg = t.closest('.pm-seg'), hl = seg.querySelector('.pm-seg-hl');
        if (t.getAttribute('aria-pressed') === 'true') return;
        Array.prototype.forEach.call(seg.querySelectorAll('.pm-seg-item'), function (x) { x.setAttribute('aria-pressed', String(x === t)); });
        if (hl) { hl.style.width = t.offsetWidth + 'px'; hl.style.setProperty('--pm-seg-x', (t.offsetLeft - 3) + 'px'); replay(hl, 'is-pop'); }
      } else if ((t = e.target.closest('.pm-rating-star'))) {
        var stars = Array.prototype.slice.call(t.parentElement.children), k = stars.indexOf(t);
        stars.forEach(function (x, i) { x.classList.toggle('is-on', i <= k); x.setAttribute('aria-checked', String(i === k)); });
        replay(t.parentElement, 'is-pop');
      } else if ((t = e.target.closest('.pm-menu-item'))) {
        var menu = t.closest('.pm-menu'), btn = menu.parentElement.querySelector('.pm-select');
        Array.prototype.forEach.call(menu.querySelectorAll('.pm-menu-item'), function (x) { x.setAttribute('aria-selected', String(x === t)); });
        var lab = btn && btn.querySelector('.pm-num');
        if (lab) lab.textContent = '2026 年 ' + t.textContent.trim();
        setTimeout(function () { closeMenu(menu, btn); }, 380);
      } else if ((t = e.target.closest('.pm-select'))) {
        var m = t.parentElement.querySelector('.pm-menu');
        if (!m) return;
        if (t.getAttribute('aria-expanded') === 'true') return closeMenu(m, t);
        t.setAttribute('aria-expanded', 'true');
        m.style.visibility = 'visible'; m.classList.remove('is-closing');
        if (window.Pomelo) Pomelo.paint(m);
        replay(m, 'is-open');
      } else if ((t = e.target.closest('.pm-tag-x'))) {
        var tag = t.closest('.pm-tag');
        tag.classList.remove('is-in'); tag.classList.add('is-leaving');
        setTimeout(function () { tag.style.display = 'none'; }, 380);
      } else if ((t = e.target.closest('.pm-crumple'))) {
        var box = t.parentElement, undo = box.querySelector('.pm-undo');
        replay(t, 'is-leaving');
        setTimeout(function () { t.style.visibility = 'hidden'; if (undo) { undo.style.visibility = 'visible'; replay(undo, 'is-in'); undo.onclick = function () { t.style.visibility = ''; t.classList.remove('is-leaving'); replay(t, 'is-back'); undo.style.visibility = 'hidden'; }; } }, 620);
      } else if ((t = e.target.closest('.pm-flip'))) {
        t.classList.toggle('is-flipped');
      } else if ((t = e.target.closest('.pm-env'))) {
        t.classList.toggle('is-open');
      } else if ((t = e.target.closest('.pm-peel'))) {
        replay(t, 'is-flyoff');
        setTimeout(function () { t.classList.remove('is-flyoff'); replay(t, 'is-back'); }, 900);
      } else if ((t = e.target.closest('.empty-cell'))) {
        // 空状态：拿掉再放回去，再画一次
        var e2 = t.querySelector('.pm-empty');
        var clone = e2.cloneNode(true);
        e2.parentNode.replaceChild(clone, e2);
      }
    });
    function closeMenu(menu, btn) {
      if (btn) btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open'); menu.classList.add('is-closing');
      setTimeout(function () { menu.style.visibility = 'hidden'; menu.classList.remove('is-closing'); }, 180);
    }
  }
  return { start: start };
})();
