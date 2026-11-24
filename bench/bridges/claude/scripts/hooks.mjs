import path from 'node:path';

/**
 * Claude Bridge Slot — Lifecycle Hooks (`bridges/claude/scripts/hooks.mjs`)
 *
 * Claude 接手工作台时，可在此文件中直接注入专有的无损导入/导出逻辑、
 * AST 转换规则、`<x-dc>` 组件提取器或自定义打包流程，无需修改 `src/` 主干代码。
 */

/**
 * 若返回非 null 对象，则完全接管 `dw import` 的解包流程。
 * @param {string} _htmlContent
 * @param {object} _context
 * @returns {Promise<null | object>}
 */
export async function customUnpack(_htmlContent, _context) {
  return null;
}

/**
 * 解包开始前的预处理 Hook。
 * @param {{ htmlContent: string, sourcePath: string, adapterConfig: object }} context
 */
export async function beforeUnpack(context) {
  return context;
}

/**
 * 单个 UUID 资产解压后的处理 Hook。
 * 自动识别：
 * 1. `adapter.config.json` 中登记的 `knownAssetUuids`
 * 2. `__bundler/ext_resources` 中携带的原始路径（如 `./FrameA.dc.html`、`react.production.min.js`）
 * 3. 包含 `__dcBoot` / `StreamableLogic` 的 Claude Design `<x-dc>` 核心运行态（映射为 `dc-runtime.js`）
 *
 * @param {{ uuid: string, mime: string, compressed: boolean, buffer: Buffer, extResourceId?: string, scope: string }} asset
 * @param {{ adapterConfig: object }} context
 */
export async function onAssetExtracted(asset, context) {
  const known = context?.adapterConfig?.knownAssetUuids?.[asset.uuid];
  if (known?.logicalName) {
    asset.logicalName = known.logicalName;
    return asset;
  }

  if (asset.extResourceId) {
    const cleanId = asset.extResourceId.split('?')[0].split('#')[0];
    const base = path.posix.basename(cleanId);
    if (base && base !== '.' && base !== '/') {
      asset.logicalName = base;
      return asset;
    }
  }

  if (/javascript/i.test(asset.mime) && asset.buffer) {
    const sample = asset.buffer.subarray(0, 4096).toString('utf8');
    const tail = asset.buffer.subarray(Math.max(0, asset.buffer.length - 4096)).toString('utf8');
    if (sample.includes('dc-runtime') || tail.includes('__dcBoot') || tail.includes('StreamableLogic')) {
      asset.logicalName = 'dc-runtime.js';
    }
  }

  return asset;
}

/**
 * 单个子页面（Board / `<x-dc>` 页面）解压并还原后的处理 Hook。
 * @param {{ uuid: string, index: number, title: string, slug: string, html: string, tweaks: object }} subpage
 * @param {object} _context
 */
export async function onSubpageExtracted(subpage, _context) {
  return subpage;
}

/**
 * 解包完成并准备写入 `manifest.json` 前的 Hook。
 * @param {object} manifest
 * @param {object} _context
 */
export async function afterUnpack(manifest, _context) {
  return manifest;
}

/**
 * 若返回非 null 字符串，则完全接管 `dw export` 的打包流程。
 * @param {string} _artifactDir
 * @param {object} _manifest
 * @param {object} _context
 * @returns {Promise<null | string>}
 */
export async function customPack(_artifactDir, _manifest, _context) {
  return null;
}

/**
 * 打包开始前的预处理 Hook。
 * @param {string} _artifactDir
 * @param {object} manifest
 * @param {object} _context
 */
export async function beforePack(_artifactDir, manifest, _context) {
  return manifest;
}

/**
 * 打包生成最终 HTML 字符串后的后处理 Hook。
 * @param {string} bundleHtml
 * @param {object} _context
 */
export async function afterPack(bundleHtml, _context) {
  return bundleHtml;
}
