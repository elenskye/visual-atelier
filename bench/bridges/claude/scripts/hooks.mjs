import path from 'node:path';

// Claude 导出包的解包钩子：`dw import` 解出每个资产时给它起名（src/bundler/adapters/claude-design-adapter.js 调用）。

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
