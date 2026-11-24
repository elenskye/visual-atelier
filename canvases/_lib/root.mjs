// 画布生成器取用仓库里的 token、工具和依赖都走这里：仓库根目录就是 canvases/ 的上一层。
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Claude 画布运行时的副本，本地预览页要用。 */
export const RUNTIME = path.join(ROOT, 'bench/vendor/claude-design/dc-runtime.js');

/** 仓库里的路径。 */
export const fromRoot = (rel) => path.join(ROOT, rel);

/** 引入仓库里的模块，例如 await rootImport('tooling/lib/common.mjs')。 */
export const rootImport = (rel) => import(pathToFileURL(fromRoot(rel)).href);

/** 引入仓库装好的依赖包，例如 await rootPackage('apca-w3')（CommonJS 的包也能按名字取导出）。 */
export async function rootPackage(name) {
  const mod = await import(pathToFileURL(createRequire(fromRoot('package.json')).resolve(name)).href);
  return { ...(mod.default && typeof mod.default === 'object' ? mod.default : {}), ...mod };
}
