// 分区装饰入场「每次打开网站只写一次」（DESIGN.md §5，站主 2026-10-31 定）。
// 同一次访问（同一个标签页的会话）里，第一次打开的页面照常播放；之后在站内跳转或刷新，
// 根元素带上 data-va-visited，section-deco-intro.css 让装饰直接显示终态。
// 放在 <head> 里、页面样式之前同步执行，免得先播一帧再停。sessionStorage 读写失败（隐私模式等）时每次都播放。
(() => {
  try {
    if (sessionStorage.getItem('va-visited')) document.documentElement.setAttribute('data-va-visited', '');
    else sessionStorage.setItem('va-visited', '1');
  } catch {}
})();
