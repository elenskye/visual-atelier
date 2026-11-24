import fs from 'node:fs';
import path from 'node:path';
import { BaseBundlerAdapter } from '../base-adapter.js';
import { isClaudeBundlerHtml, extractTweaksFromHtml, decodeHtmlEntities } from '../codec.js';
import { writeJsonFile } from '../../utils/config.js';
import { ClaudeDesignAdapter } from './claude-design-adapter.js';

/**
 * Fallback Adapter for standard single-file `.html` and `.dc.html` files (`RawHtmlAdapter`)
 *
 * When importing a `.dc.html` file (Claude Design raw component format with `<x-dc>`),
 * it automatically wires `dc-runtime.js` from `bridges/claude/templates/dc-runtime.js`
 * so the component can be previewed locally via `dw serve` and `dw shot`.
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
    const rawDir = path.join(artifactDir, 'raw');
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.mkdirSync(rawDir, { recursive: true });

    fs.writeFileSync(path.join(rawDir, 'original.html'), htmlContent, 'utf8');

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

    const manifest = {
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

    writeJsonFile(path.join(artifactDir, 'manifest.json'), manifest);
    return manifest;
  }

  async pack(artifactDir, options = {}) {
    // Delegate packing to ClaudeDesignAdapter so any raw HTML artifact can also be exported as a self-contained Claude Design bundle
    const claudeAdapter = new ClaudeDesignAdapter(this.config);
    return await claudeAdapter.pack(artifactDir, options);
  }
}
