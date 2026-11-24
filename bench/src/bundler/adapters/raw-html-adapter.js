import fs from 'node:fs';
import path from 'node:path';
import { BaseBundlerAdapter } from '../base-adapter.js';
import { isClaudeBundlerHtml, extractTweaksFromHtml, decodeHtmlEntities } from '../codec.js';

/**
 * Fallback Adapter for standard single-file `.html` and `.dc.html` files (`RawHtmlAdapter`)
 *
 * When importing a `.dc.html` file (Claude Design raw component format with `<x-dc>`),
 * it wires the canvas runtime (`vendor/claude-design/dc-runtime.js`) in as `assets/dc-runtime.js`;
 * `dw import` then points the board at `./support.js`.
 */
export class RawHtmlAdapter extends BaseBundlerAdapter {
  constructor(config) {
    super(config);
    this.name = 'raw-html';
  }

  detect(htmlContent, _filePath = '') {
    return typeof htmlContent === 'string' && !isClaudeBundlerHtml(htmlContent);
  }

  async unpack(htmlContent, options) {
    const {
      artifactId,
      artifactDir,
      sourcePath = '',
      model = 'local-agent',
      title: customTitle = null,
      tags = [],
      parentId = null
    } = options;

    const assetsDir = path.join(artifactDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    const isDcComponent = /<x-dc[\s>]/i.test(htmlContent);
    let processedHtml = htmlContent;

    if (isDcComponent) {
      const dcRuntimeSrc = this.config.runtimeAbs;
      if (fs.existsSync(dcRuntimeSrc)) {
        fs.copyFileSync(dcRuntimeSrc, path.join(assetsDir, 'dc-runtime.js'));
        processedHtml = processedHtml.replace(
          /<script\s+src=["']\.\/(?:support|dc-runtime)\.js["'][^>]*><\/script>/i,
          '<script src="./assets/dc-runtime.js"></script>'
        );
      }
    }

    fs.writeFileSync(path.join(artifactDir, 'index.html'), processedHtml, 'utf8');

    const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title =
      customTitle ||
      (titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : null) ||
      (sourcePath ? path.basename(sourcePath, path.extname(sourcePath)) : artifactId);

    const tweaksInfo = extractTweaksFromHtml(processedHtml);
    const nowIso = new Date().toISOString();

    return {
      id: artifactId,
      title,
      createdAt: nowIso,
      updatedAt: nowIso,
      source: {
        model,
        origin: isDcComponent ? 'dc-component' : 'raw-html',
        adapter: this.name,
        originalFile: sourcePath ? path.basename(sourcePath) : null
      },
      status: 'exploring',
      tags: Array.from(new Set([isDcComponent ? 'dc-component' : 'raw-html', ...tags])),
      entry: 'index.html',
      subpages: [],
      assets: {},
      tweaks: tweaksInfo.values,
      lineage: {
        parent: parentId,
        notes: `Imported from ${sourcePath ? path.basename(sourcePath) : 'raw HTML'}.`
      }
    };
  }
}
