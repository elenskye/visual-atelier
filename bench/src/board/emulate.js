// 画布界面的全局开关（深色、减弱动效）：本地服务把这个文件放在画板 <head> 的最前面（?va-scheme=dark&va-motion=reduce）。
// 浏览器不能给一个 iframe 单独设系统的明暗和减弱动效，这里模拟：
//   - matchMedia 里的 (prefers-color-scheme: …)、(prefers-reduced-motion: …) 按开关算；
//   - 页面样式表里这两类 @media 改写成恒真或恒假（新加的 <style>、<link> 也改，跨域的样式表读不到就跳过）；
//   - 深色时根元素写 color-scheme: dark。
// 带 dark / theme 参数的画板，画布界面另外直接改参数（board.js），两样一起用。
(() => {
  const q = new URLSearchParams((document.currentScript && document.currentScript.src.split('?')[1]) || '');
  const scheme = q.get('scheme'); // 'dark' | 'light' | null
  const reduce = q.get('motion') === 'reduce';
  if (!scheme && !reduce) return;

  const rewrite = (text) => {
    let t = String(text);
    if (scheme) {
      t = t.replace(/\(\s*prefers-color-scheme\s*:\s*(dark|light)\s*\)/gi, (_, v) => (v.toLowerCase() === scheme ? '(width >= 0px)' : '(width < 0px)'));
    }
    if (reduce) {
      t = t.replace(/\(\s*prefers-reduced-motion\s*:\s*(reduce|no-preference)\s*\)/gi, (_, v) => (v.toLowerCase() === 'reduce' ? '(width >= 0px)' : '(width < 0px)'));
      t = t.replace(/\(\s*prefers-reduced-motion\s*\)/gi, '(width >= 0px)');
    }
    return t;
  };

  const native = window.matchMedia.bind(window);
  window.matchMedia = (query) => native(rewrite(query));

  const seen = new WeakSet();
  const fixRules = (rules) => {
    for (const r of Array.from(rules || [])) {
      if (r.media && r.media.mediaText) {
        const next = rewrite(r.media.mediaText);
        if (next !== r.media.mediaText) {
          try { r.media.mediaText = next; } catch {}
        }
      }
      if (r.cssRules) fixRules(r.cssRules);
    }
  };
  const fixSheets = () => {
    for (const sh of Array.from(document.styleSheets)) {
      if (seen.has(sh)) continue;
      let rules;
      try { rules = sh.cssRules; } catch { continue; }
      seen.add(sh);
      fixRules(rules);
    }
  };
  // 样式表改了内容（运行时往 <style> 里写字）要重新改：按节点内容记一次
  const done = new WeakMap();
  const fixStyle = (node) => {
    if (node.tagName === 'STYLE' && done.get(node) !== node.textContent && node.sheet) {
      done.set(node, node.textContent);
      fixRules(node.sheet.cssRules);
    }
  };
  const scan = () => {
    fixSheets();
    for (const s of document.querySelectorAll('style')) fixStyle(s);
  };
  new MutationObserver(scan).observe(document, { childList: true, subtree: true, characterData: true });
  document.addEventListener('load', (e) => { if (e.target && e.target.tagName === 'LINK') scan(); }, true);
  document.addEventListener('DOMContentLoaded', scan);
  addEventListener('load', scan);
  if (scheme) document.documentElement.style.colorScheme = scheme;
  document.documentElement.dataset.vaEmulate = [scheme && `scheme-${scheme}`, reduce && 'reduced-motion'].filter(Boolean).join(' ');
})();
