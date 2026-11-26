import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * What the `dw import` adapters share (`ClaudeDesignAdapter`, `RawHtmlAdapter`): the bench config and the bridge's
 * hooks (`bridges/claude/`). `unpack(html, { artifactId, artifactDir, sourcePath })` writes the files into
 * artifactDir and returns { title, entry, subpages }.
 */
export class BaseBundlerAdapter {
  /**
   * @param {object} config Bench config from `loadConfig()`
   */
  constructor(config) {
    this.config = config;
    this.name = 'base';
    this.externalHooks = null;
    this.adapterConfig = {};
  }

  /**
   * Loads external bridge configuration & lifecycle hooks (e.g. from `bridges/claude/`).
   * @param {string} bridgeDir
   */
  async loadBridgeSlot(bridgeDir) {
    if (!bridgeDir || !fs.existsSync(bridgeDir)) return;

    const configPath = path.join(bridgeDir, 'adapter.config.json');
    if (fs.existsSync(configPath)) {
      try {
        this.adapterConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (err) {
        console.warn(`[${this.name}] Failed to parse bridge adapter.config.json: ${err.message}`);
      }
    }

    const hooksRel = this.adapterConfig.hooksModule || './scripts/hooks.mjs';
    const hooksAbs = path.resolve(bridgeDir, hooksRel);
    if (fs.existsSync(hooksAbs)) {
      try {
        this.externalHooks = await import(pathToFileURL(hooksAbs).href);
      } catch (err) {
        console.warn(`[${this.name}] Failed to import bridge hooks (${hooksAbs}): ${err.message}`);
      }
    }
  }

  /** Runs the bridge's hook of that name; without one, gives back its first argument. */
  async runHook(hookName, ...args) {
    if (this.externalHooks && typeof this.externalHooks[hookName] === 'function') {
      return await this.externalHooks[hookName](...args);
    }
    return args[0];
  }
}
