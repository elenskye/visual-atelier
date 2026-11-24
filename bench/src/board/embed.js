// 画布界面上的画板（地址带 va-embed=1）先跑这一段：界面让它定格时，停住 CSS 动画、SVG 动画、Web Animations、
// 视频和 requestAnimationFrame，放开时接着动。画板本身不改；单张铺满、单张打开、导出、自检都不带它。
// 为什么要：Pomelo 的「有板有眼」在 WKWebView 里，画布界面和 Pomelo 共用一个主线程，一页十几张板一起动会把整个 App 拖慢。
(() => {
  let frozen = false;
  let style = null;
  let paused = [];
  const raf = window.requestAnimationFrame.bind(window);
  const caf = window.cancelAnimationFrame.bind(window);
  const held = new Map();
  let seq = 0;
  // 定格时 rAF 的回调先攒着，放开时一起交还。定格前排上的到点时也看一眼，定格了就攒起来（id 不变，还能取消）；
  // 定格时新排的 id 用负数，不和浏览器给的撞
  window.requestAnimationFrame = (cb) => {
    if (frozen) {
      const id = -++seq;
      held.set(id, cb);
      return id;
    }
    const id = raf((t) => {
      if (frozen) held.set(id, cb);
      else cb(t);
    });
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    if (!held.delete(id)) caf(id);
  };
  const svgs = (on) => {
    for (const s of document.querySelectorAll('svg')) {
      try {
        if (on) s.pauseAnimations();
        else s.unpauseAnimations();
      } catch {}
    }
  };
  const isCssAnimation = (a) => typeof CSSAnimation !== 'undefined' && a instanceof CSSAnimation;
  window.__vaFreeze = (on) => {
    on = !!on;
    if (on === frozen) return;
    frozen = on;
    if (on) {
      // CSS 动画用 animation-play-state 停：结束了的不会被重放，定格时新开始的也停着
      style = document.createElement('style');
      style.textContent = '*,*::before,*::after{animation-play-state:paused!important}';
      (document.head || document.documentElement).append(style);
      svgs(true);
      try {
        paused = document.getAnimations().filter((a) => !isCssAnimation(a) && a.playState === 'running');
        for (const a of paused) a.pause();
      } catch {
        paused = [];
      }
      for (const v of document.querySelectorAll('video')) {
        if (!v.paused) {
          v.dataset.vaPlay = '1';
          v.pause();
        }
      }
    } else {
      style?.remove();
      style = null;
      svgs(false);
      for (const a of paused) {
        try {
          a.play();
        } catch {}
      }
      paused = [];
      for (const v of document.querySelectorAll('video[data-va-play]')) {
        delete v.dataset.vaPlay;
        v.play().catch(() => {});
      }
      const cbs = [...held.values()];
      held.clear();
      for (const cb of cbs) raf(cb);
    }
  };
  // 载入完了告诉画布界面：它按这个排下一张，过一会儿再决定这张动不动
  addEventListener('load', () => {
    try {
      parent.postMessage({ type: 'va-embed-ready' }, location.origin);
    } catch {}
  });
})();
