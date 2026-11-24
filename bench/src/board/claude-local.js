// 本地版的 window.claude：让为云端写的页面（问卷之类）在 dw serve 里原样能跑。
// 只实现 db 和 user 两个能力，写法照云端的接口（claude.use('db') → doc / collection、get / set / update / delete、
// where / orderBy / limit、onSnapshot）；数据存在 canvases/<名字>/db.json。其他能力一律 null，页面按「没有」处理。
// 服务把它插在页面 <head> 的最前面：/_claude/runtime.js?canvas=<名字>[&readonly=1]（看旧版本时只读）。
(() => {
  if (window.claude) return;
  const params = new URL(document.currentScript.src).searchParams;
  const canvas = params.get('canvas');
  const readonly = params.get('readonly') === '1';
  const SEG = /^[A-Za-z0-9_\-.~:@+]+$/;

  const fail = (code, message) => Object.assign(new Error(message), { code });
  function check(path, parity) {
    if (typeof path !== 'string' || !path) throw new TypeError('db: 路径要是非空字符串');
    const segs = path.split('/');
    for (const s of segs) if (!s || s === '.' || s === '..' || !SEG.test(s)) throw new TypeError(`db: 路径里有不能用的一段 ${JSON.stringify(s)}`);
    if (segs.length > 16) throw new TypeError('db: 路径超过 16 段');
    if (parity === 'doc' && segs.length % 2) throw new TypeError(`db: 文档路径要有偶数段，${path} 是 ${segs.length} 段`);
    if (parity === 'collection' && !(segs.length % 2)) throw new TypeError(`db: 集合路径要有奇数段，${path} 是 ${segs.length} 段`);
    return segs;
  }
  async function call(query, init) {
    let r;
    try {
      r = await fetch(`/api/db/${encodeURIComponent(canvas)}${query}`, init && { ...init, headers: { 'Content-Type': 'application/json' } });
    } catch {
      throw fail('unavailable', '连不上本地服务');
    }
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw fail(body.code || 'unavailable', body.message || `本地服务答 ${r.status}`);
    return body;
  }
  const freeze = (v) => {
    if (v && typeof v === 'object') {
      for (const x of Object.values(v)) freeze(x);
      Object.freeze(v);
    }
    return v;
  };
  const META = Object.freeze({ fromCache: false, hasPendingWrites: false });
  const docSnap = (path, exists, data) => Object.freeze({ id: path.split('/').pop(), exists, data: () => (exists ? data : undefined), metadata: META });
  const writable = () => {
    if (readonly) throw fail('invalid_argument', '在看旧版本，只读');
  };

  // 文件变了，服务在 /api/events 发 db 事件；每个订阅收到后重读一次，有变化才通知
  const refreshers = new Set();
  let events = null;
  function listen(fn) {
    refreshers.add(fn);
    if (!events) {
      try {
        events = new EventSource('/api/events');
        events.addEventListener('db', (e) => {
          let d = {};
          try {
            d = JSON.parse(e.data);
          } catch {}
          if (d.canvas === canvas) for (const f of refreshers) f();
        });
      } catch {}
    }
    return () => refreshers.delete(fn);
  }
  function subscribe(read, deliver, error) {
    let dead = false;
    let last;
    const run = async () => {
      if (dead) return;
      try {
        const value = await read();
        const key = JSON.stringify(value.key);
        if (key !== last && !dead) {
          last = key;
          deliver(value);
        }
      } catch (e) {
        if (dead) return;
        dead = true;
        stop();
        if (error) error({ code: e.code || 'unavailable', message: e.message });
        else reportError(e);
      }
    };
    const stop = listen(run);
    setTimeout(run, 0);
    return () => {
      dead = true;
      stop();
    };
  }

  function docRef(path) {
    check(path, 'doc');
    const enc = `?path=${encodeURIComponent(path)}`;
    const read = async () => {
      const r = await call(enc);
      const data = r.exists ? freeze(r.data) : undefined;
      return { key: r.exists ? r.data : null, snap: docSnap(path, r.exists, data) };
    };
    return Object.freeze({
      id: path.split('/').pop(),
      path,
      get: async () => (await read()).snap,
      set: async (data) => {
        writable();
        await call(enc, { method: 'PUT', body: JSON.stringify(data) });
      },
      update: async (data) => {
        writable();
        await call(enc, { method: 'PATCH', body: JSON.stringify(data) });
      },
      delete: async () => {
        writable();
        await call(enc, { method: 'DELETE' });
      },
      // 本机只有一个人：租约总是拿得到
      acquire: async ({ holder, ttlMs } = {}) => ({ acquired: true, version: 1, holder, expiresAt: new Date(Date.now() + Math.min(600000, Math.max(1000, ttlMs || 30000))).toISOString() }),
      onSnapshot: (next, error) => subscribe(read, (v) => next(v.snap), error),
      collection: (sub) => collRef(`${path}/${sub}`)
    });
  }

  const OPS = {
    '==': (a, b) => JSON.stringify(a) === JSON.stringify(b),
    '!=': (a, b) => JSON.stringify(a) !== JSON.stringify(b),
    '<': (a, b) => a < b,
    '<=': (a, b) => a <= b,
    '>': (a, b) => a > b,
    '>=': (a, b) => a >= b,
    in: (a, b) => Array.isArray(b) && b.some((x) => JSON.stringify(x) === JSON.stringify(a)),
    'not-in': (a, b) => Array.isArray(b) && !b.some((x) => JSON.stringify(x) === JSON.stringify(a)),
    'array-contains': (a, b) => Array.isArray(a) && a.some((x) => JSON.stringify(x) === JSON.stringify(b))
  };

  function query(collection, filters = [], order = null, lim = null) {
    const read = async () => {
      const r = await call(`/collection?path=${encodeURIComponent(collection)}`);
      let docs = r.docs.filter((d) => filters.every(([f, op, v]) => Object.hasOwn(d.data, f) && OPS[op](d.data[f], v)));
      if (order) {
        const [f, dir] = order;
        docs = docs.slice().sort((a, b) => {
          const ha = Object.hasOwn(a.data, f);
          const hb = Object.hasOwn(b.data, f);
          if (!ha || !hb) return ha === hb ? 0 : ha ? -1 : 1;
          const c = a.data[f] < b.data[f] ? -1 : a.data[f] > b.data[f] ? 1 : 0;
          return dir === 'desc' ? -c : c;
        });
      }
      if (lim) docs = docs.slice(0, lim);
      return { key: docs.map((d) => [d.path, d.data]), docs };
    };
    const toSnap = (docs, prev) => {
      const snaps = docs.map((d) => docSnap(d.path, true, freeze(d.data)));
      const before = prev || [];
      const changes = [];
      before.forEach((p, i) => {
        if (!snaps.some((s) => s.id === p.id)) changes.push({ type: 'removed', doc: p, oldIndex: i, newIndex: -1 });
      });
      snaps.forEach((s, i) => {
        const j = before.findIndex((p) => p.id === s.id);
        if (j < 0) changes.push({ type: 'added', doc: s, oldIndex: -1, newIndex: i });
        else if (JSON.stringify(before[j].data()) !== JSON.stringify(s.data())) changes.push({ type: 'modified', doc: s, oldIndex: j, newIndex: i });
      });
      return Object.freeze({ docs: snaps, size: snaps.length, empty: !snaps.length, docChanges: () => changes, metadata: META });
    };
    return {
      where: (field, op, value) => {
        if (!OPS[op]) throw fail('invalid_argument', `不认识的比较 ${op}`);
        if (filters.length >= 10) throw fail('invalid_argument', '最多 10 个条件');
        return query(collection, [...filters, [field, op, value]], order, lim);
      },
      orderBy: (field, dir = 'asc') => query(collection, filters, [field, dir], lim),
      limit: (n) => {
        if (!(n >= 1 && n <= 1000)) throw fail('invalid_argument', 'limit 要在 1 到 1000 之间');
        return query(collection, filters, order, n);
      },
      get: async () => toSnap((await read()).docs, null),
      onSnapshot: (next, error) => {
        let prev = null;
        return subscribe(read, (v) => {
          const s = toSnap(v.docs, prev);
          prev = s.docs;
          next(s);
        }, error);
      }
    };
  }

  function collRef(path) {
    check(path, 'collection');
    const q = query(path);
    const doc = (id) => docRef(`${path}/${id || crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`);
    return Object.freeze({
      ...q,
      path,
      doc,
      add: async (data) => {
        const r = doc();
        await r.set(data);
        return r;
      }
    });
  }

  const db = Object.freeze({ doc: docRef, collection: collRef });
  const ME = Object.freeze({ id: 'local', name: '站主', avatarUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%232f6fe4"/%3E%3C/svg%3E', color: '#2f6fe4', email: null, isOwner: true, canEdit: true });
  const user = Object.freeze({
    isOwner: async () => true,
    canEdit: async () => true,
    can: async (name) => ['data.write', 'files.write', 'assets.write'].includes(name),
    me: async () => ME,
    id: async () => ME.id,
    name: async () => ME.name,
    avatarUrl: async () => null,
    email: async () => null,
    profiles: async (ids) => Object.fromEntries([].concat(ids).map((id) => [id, { id, name: id === ME.id ? ME.name : '', avatarUrl: ME.avatarUrl, color: ME.color, email: null, isMe: id === ME.id, guest: false }])),
    search: async () => []
  });
  const CAPS = { db, user };
  // 云端说 use() 的结果不会在页面脚本第一次跑完之前到；这里也等一拍
  window.claude = Object.freeze({ use: (name) => new Promise((resolve) => setTimeout(() => resolve(CAPS[name] || null), 0)) });
})();
