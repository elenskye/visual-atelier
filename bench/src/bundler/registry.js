import { ClaudeDesignAdapter } from './adapters/claude-design-adapter.js';
import { RawHtmlAdapter } from './adapters/raw-html-adapter.js';
import { isClaudeBundlerHtml } from './codec.js';

/** The adapter that unpacks a file for `dw import`: Claude's standalone HTML export, or else a plain (.dc).html page. */
export function adapterFor(config, htmlContent) {
  return isClaudeBundlerHtml(htmlContent) ? new ClaudeDesignAdapter(config) : new RawHtmlAdapter(config);
}
