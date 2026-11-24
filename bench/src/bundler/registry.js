import { ClaudeDesignAdapter } from './adapters/claude-design-adapter.js';
import { RawHtmlAdapter } from './adapters/raw-html-adapter.js';

/**
 * Pluggable Bundler Adapter Registry (`BundlerRegistry`)
 */
export class BundlerRegistry {
  constructor(config) {
    this.config = config;
    this.adapters = new Map();
    this.register(new ClaudeDesignAdapter(config));
    this.register(new RawHtmlAdapter(config));
  }

  register(adapter) {
    this.adapters.set(adapter.name, adapter);
  }

  get(name) {
    return this.adapters.get(name) || null;
  }

  /**
   * Auto-detects the appropriate adapter for an HTML string / file path.
   * Prioritizes `ClaudeDesignAdapter` before fallback adapters.
   * @param {string} htmlContent
   * @param {string} filePath
   * @param {string} preferredAdapterName
   */
  resolve(htmlContent, filePath = '', preferredAdapterName = null) {
    if (preferredAdapterName && this.adapters.has(preferredAdapterName)) {
      return this.adapters.get(preferredAdapterName);
    }
    for (const adapter of this.adapters.values()) {
      if (adapter.detect(htmlContent, filePath)) {
        return adapter;
      }
    }
    return this.adapters.get(this.config.defaultAdapter) || this.adapters.get('claude-design');
  }
}
