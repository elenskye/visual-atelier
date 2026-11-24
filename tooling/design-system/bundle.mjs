// 把方案用到的 ES 模块原样拼成 Design System 要的经典脚本 components/bundle.js，不经过第三方打包器。
// 只认本仓库的写法：顶层的 `import { a, b } from './x.mjs';`（x 必须也在这次打包的模块里）和
// `export function` / `export const`。打包后所有模块在同一个函数作用域里，顶层名字不能重复。
// 构建时用 vm 跑一遍打包结果，和直接 import 模块的输出逐字比较（selfTest），保证只有一份实现。
import path from 'node:path';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const IMPORT = /^import\s*\{([^}]*)\}\s*from\s*'(\.\/[\w.-]+\.mjs)';\s*$/;
const TOP = /^(?:export\s+)?(?:async\s+)?(?:function\*?\s+([A-Za-z_$][\w$]*)|(?:const|let|var|class)\s+([A-Za-z_$][\w$]*))/;

/** 读一个模块：去掉 import 和 export 关键字，记下导出的名字和顶层名字。 */
export function stripModule(text, file, inSet) {
  const exports = [];
  const tops = [];
  const lines = text.split('\n').map((line) => {
    const imp = IMPORT.exec(line);
    if (imp) {
      if (!inSet(imp[2])) throw new Error(`${file}：import 的 ${imp[2]} 不在这次打包的模块里`);
      return `// ${line}`;
    }
    if (/^import\b/.test(line)) throw new Error(`${file}：只认 import { … } from './x.mjs'; 这一种写法：${line}`);
    if (/^export\s+(default|\{|\*)/.test(line)) throw new Error(`${file}：不认 export default / export { } / export *：${line}`);
    const top = TOP.exec(line);
    if (top) {
      const name = top[1] || top[2];
      tops.push(name);
      if (/^export\s/.test(line)) exports.push(name);
    }
    return line.replace(/^export\s+/, '');
  });
  return { code: lines.join('\n'), exports, tops };
}

/**
 * 把几个模块原样拼起来（Atlas 的设计也用它）：每个去掉 import 和 export，前面加一行「// ---- 路径 ----」。
 * sources：[{ rel, text }]，按依赖顺序；import 只能指向这一串里的模块（按文件名认），拼起来以后顶层名字不能重复。
 * 返回 { parts（每个模块一段）, exported（导出的名字）, tops（顶层名字 → 哪个模块）, names（文件名，按先后） }。
 */
export function joinModules(sources) {
  const names = new Set(sources.map((s) => path.basename(s.rel)));
  const tops = new Map();
  const exported = [];
  const parts = sources.map(({ rel, text }) => {
    const m = stripModule(text, rel, (p) => names.has(path.basename(p)));
    for (const t of m.tops) {
      if (tops.has(t)) throw new Error(`打包后顶层名字重复：${t}（${tops.get(t)} 和 ${rel}）`);
      tops.set(t, rel);
    }
    exported.push(...m.exports);
    return `// ---- ${rel} ----\n${m.code.trim()}\n`;
  });
  return { parts, exported, tops, names };
}

/**
 * modules：仓库根目录下的相对路径（按依赖顺序）。config：打包进去的 CONFIG（JSON）。
 * entry：生成命名空间上的便捷函数的代码（字符串），可以引用模块里的名字和 CONFIG。
 */
export function bundleClassic({ root, namespace, title, modules, config, entry }) {
  if (!/^[A-Za-z_$][\w$]*$/.test(namespace)) throw new Error(`namespace 要是 JS 标识符：${namespace}`);
  const { parts, exported, tops } = joinModules(modules.map((rel) => ({ rel, text: readFileSync(path.join(root, rel), 'utf8') })));
  for (const reserved of ['CONFIG', 'NS']) if (tops.has(reserved)) throw new Error(`模块里不能有顶层名字 ${reserved}`);
  const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace, components: [] })} */`;
  const note = `/* ${title}：手画零件。由 tooling/design-system/bundle.mjs 把 ${modules.map((m) => path.basename(m)).join('、')} 原样打包，不要手改。 */`;
  const body = [
    header,
    note,
    '(function () {',
    "'use strict';",
    ...parts,
    `const CONFIG = ${JSON.stringify(config)};`,
    `const NS = (typeof window !== 'undefined' ? window : globalThis).${namespace} = (typeof window !== 'undefined' ? window : globalThis).${namespace} || {};`,
    `NS.hand = { ${exported.join(', ')} };`,
    'NS.params = CONFIG.params;',
    entry,
    '})();',
    '',
  ].join('\n');
  if (/<\/script/i.test(body) || body.includes('<!--')) throw new Error('bundle.js 里不能有 </script 或 <!--');
  return { code: body, exported };
}

/**
 * 在 vm 里跑打包结果，拿 cases 里的每一项（[函数名, 参数]）和直接 import 模块的结果逐字比较。
 * 不一致就抛错：打包不能改变画出来的线。
 */
export async function selfTest({ root, code, namespace, modules, cases }) {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'bundle.js' });
  const ns = sandbox[namespace];
  if (!ns?.hand) throw new Error(`bundle.js 没有挂上 ${namespace}.hand`);
  const mods = {};
  for (const rel of modules) Object.assign(mods, await import(pathToFileURL(path.join(root, rel)).href));
  // 参数里的 { $export: 名字 } 换成模块导出的那个值（各取各的：模块的、打包后的）
  const resolve = (src) => (x) => (x && typeof x === 'object' && !Array.isArray(x) && x.$export ? src[x.$export] : x);
  for (const [fn, args] of cases) {
    if (typeof mods[fn] !== 'function' || typeof ns.hand[fn] !== 'function') throw new Error(`自测：没有函数 ${fn}`);
    const a = JSON.stringify(mods[fn](...args.map(resolve(mods))));
    const b = JSON.stringify(ns.hand[fn](...JSON.parse(JSON.stringify(args)).map(resolve(ns.hand))));
    if (a !== b) throw new Error(`自测：${fn} 打包前后输出不同`);
  }
  return cases.length;
}
