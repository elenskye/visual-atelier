// 画布界面几个模块（board.js、ds.js、motion.js、checks.js）共用的小工具。
// claude-local.js、emulate.js、embed.js 是插进画板页面的普通脚本，不用这里。

export const $ = (sel, root = document) => root.querySelector(sel);

/** One element: attrs `text`, `html`, `style` (an object), `on<event>`; null / undefined / false ones are left out,
 *  true is an empty attribute. Kids: elements or strings; null / undefined / false are left out. */
export const h = (tag, attrs = {}, kids = []) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(kids)) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
};

/** 「11/26 14:05」这样的日期时间；没有就是空的。 */
export const when = (t) => (t ? new Date(t).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

/** POST JSON to this server; the answer's JSON, or an Error with the server's message. */
export async function post(p, body) {
  const r = await fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || `${r.status}`);
  return d;
}
