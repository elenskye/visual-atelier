import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Base Pluggable Bundler Adapter (`BaseBundlerAdapter`)
 *
 * Defines the standard lifecycle hooks and contract for all design bundle providers
 * (e.g. `ClaudeDesignAdapter`, `RawHtmlAdapter`).
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

  /**
   * Runs a named lifecycle hook if registered on externalHooks or subclass.
   * @param {string} hookName
   * @param  {...any} args
   */
  async runHook(hookName, ...args) {
    if (this.externalHooks && typeof this.externalHooks[hookName] === 'function') {
      return await this.externalHooks[hookName](...args);
    }
    if (typeof this[hookName] === 'function') {
      return await this[hookName](...args);
    }
    return args[0];
  }

  /**
   * Determines whether this adapter can handle the given HTML content / file.
   * @param {string} _htmlContent
   * @param {string} _filePath
   * @returns {boolean}
   */
  detect(_htmlContent, _filePath) {
    return false;
  }

  /**
   * Unpacks a bundle file into `workspace/artifacts/<id>/`.
   * @param {string} _htmlContent
   * @param {object} _options
   * @returns {Promise<object>} The generated artifact manifest
   */
  async unpack(_htmlContent, _options) {
    throw new Error(`${this.name}.unpack() is not implemented`);
  }

  /**
   * Packs an artifact directory `workspace/artifacts/<id>/` back into a single-file HTML bundle.
   * @param {string} _artifactDir
   * @param {object} _options
   * @returns {Promise<string>} The packed single-file HTML string
   */
  async pack(_artifactDir, _options) {
    throw new Error(`${this.name}.pack() is not implemented`);
  }
}
