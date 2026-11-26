import fs from 'node:fs';
import path from 'node:path';
import { BaseBundlerAdapter } from '../base-adapter.js';
import { decodeHtmlEntities } from '../codec.js';

/**
 * A plain `.html` or `.dc.html` file (Claude Design's raw component format, `<x-dc>`), for `dw import`.
 * A `<x-dc>` board loads the canvas runtime as `./support.js` (served from vendor/), whatever it called it before.
 */
export class RawHtmlAdapter extends BaseBundlerAdapter {
  constructor(config) {
    super(config);
    this.name = 'raw-html';
  }

  /** Writes the page as `artifactDir/index.html`. Returns { title, entry, subpages: [] } like ClaudeDesignAdapter. */
  async unpack(htmlContent, { artifactId, artifactDir, sourcePath = '' }) {
    fs.mkdirSync(artifactDir, { recursive: true });
    let html = htmlContent;
    if (/<x-dc[\s>]/i.test(htmlContent) && fs.existsSync(this.config.runtimeAbs)) {
      html = html.replace(/<script\s+src=["']\.\/(?:support|dc-runtime)\.js["'][^>]*><\/script>/i, '<script src="./support.js"></script>');
    }
    fs.writeFileSync(path.join(artifactDir, 'index.html'), html, 'utf8');
    const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = (titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : null) || (sourcePath ? path.basename(sourcePath, path.extname(sourcePath)) : artifactId);
    return { title, entry: 'index.html', subpages: [] };
  }
}
