import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { BaseBundlerAdapter } from '../base-adapter.js';
import {
  isClaudeBundlerHtml,
  extractBundlerBlocks,
  decodeManifestEntry,
  mimeToExt,
  stripSriOnLocalTags,
  extractTweaksFromHtml,
  decodeHtmlEntities
} from '../codec.js';
import { slugify, writeJsonFile } from '../../utils/config.js';

/**
 * Puts `window.__resources` (an ext_resources id → the unpacked file, `prefix` + its path) first in <head>, so the
 * unpacked page finds the runtime's files locally. `dw import` takes it out again.
 */
function withResources(html, extResources, assetPaths, prefix) {
  if (!Array.isArray(extResources) || !extResources.length) return html;
  const resMap = {};
  for (const r of extResources) {
    if (assetPaths[r.uuid]) resMap[r.id] = `${prefix}${assetPaths[r.uuid]}`;
  }
  if (!Object.keys(resMap).length) return html;
  const resJson = JSON.stringify(resMap).replace(/</g, '\\u003c');
  const resScript = `<script data-dw-injected="resources">window.__resources = Object.assign(window.__resources || {}, ${resJson});</script>`;
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => `${m}\n${resScript}`) : `${resScript}\n${html}`;
}

/**
 * Standard Pluggable Adapter for Claude Design Single-File HTML Bundles (`ClaudeDesignAdapter`)
 *
 * Connected to the dedicated Claude Bridge Slot (`bridges/claude/`):
 * - Reads `bridges/claude/adapter.config.json`
 * - Invokes lifecycle hooks from `bridges/claude/scripts/hooks.mjs`
 *
 * Handles both:
 * 1. Multi-board recursive bundles (`page_order` non-empty, `about:blank#<uuid>` iframe markers,
 *    where each UUID in `page_order` gunzips to a nested `__bundler` HTML document).
 * 2. Single-board `__bundler` HTML documents (`page_order` empty).
 */
export class ClaudeDesignAdapter extends BaseBundlerAdapter {
  constructor(config) {
    super(config);
    this.name = 'claude-design';
  }

  async init() {
    await this.loadBridgeSlot(this.config.claudeBridgeAbs);
  }

  detect(htmlContent, _filePath = '') {
    return isClaudeBundlerHtml(htmlContent);
  }

  /**
   * Unpacks a Claude Design HTML bundle into `artifactDir` (`dw import` makes it a canvas from there).
   * @param {string} htmlContent
   * @param {{ artifactId: string, artifactDir: string, sourcePath?: string, model?: string, title?: string, tags?: string[], parentId?: string }} options
   */
  async unpack(htmlContent, options) {
    await this.init();

    const {
      artifactId,
      artifactDir,
      sourcePath = '',
      model = 'claude-design',
      title: customTitle = null,
      tags = [],
      parentId = null
    } = options;

    let context = {
      htmlContent,
      sourcePath,
      artifactId,
      artifactDir,
      adapterConfig: this.adapterConfig
    };

    context = (await this.runHook('beforeUnpack', context)) || context;

    if (this.externalHooks && typeof this.externalHooks.customUnpack === 'function') {
      const customResult = await this.externalHooks.customUnpack(context.htmlContent, context);
      if (customResult) return customResult;
    }

    const pagesDir = path.join(artifactDir, 'pages');
    const assetsDir = path.join(artifactDir, 'assets');
    const rawDir = path.join(artifactDir, 'raw');
    fs.mkdirSync(pagesDir, { recursive: true });
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.mkdirSync(rawDir, { recursive: true });

    const rootBlocks = extractBundlerBlocks(context.htmlContent);
    const title = customTitle || rootBlocks.title || artifactId;
    const pageSet = new Set(rootBlocks.pageOrder || []);
    const isMultiPage = pageSet.size > 0;

    // Extract board titles and dimensions from root template (`<section class="board"><h2>...</h2><iframe src="about:blank#<uuid>" width="..." height="...">`)
    const boardMetaByUuid = this._parseRootBoardMarkers(rootBlocks.template);

    // Track extracted assets across root and nested pages (deduplicating identical content hashes or known UUIDs)
    const assetsManifest = {};
    const hashToAssetPath = new Map();
    const usedFilenames = new Set();

    const saveAsset = async (uuid, entry, scope = 'root', extResourceId = null) => {
      const decoded = decodeManifestEntry(entry);
      const sha256 = crypto.createHash('sha256').update(decoded.buffer).digest('hex');

      let assetObj = {
        uuid,
        mime: decoded.mime,
        compressed: decoded.compressed,
        buffer: decoded.buffer,
        size: decoded.buffer.length,
        sha256,
        scope,
        extResourceId,
        logicalName: null
      };

      assetObj = (await this.runHook('onAssetExtracted', assetObj, context)) || assetObj;

      // Reuse existing file on disk if identical sha256 was already written
      let relPath = hashToAssetPath.get(sha256);
      if (!relPath) {
        const ext = mimeToExt(assetObj.mime);
        let filename;
        if (assetObj.logicalName) {
          filename = assetObj.logicalName;
        } else {
          const shortUuid = uuid.slice(0, 8);
          filename = `asset-${shortUuid}${ext}`;
        }
        if (usedFilenames.has(filename)) {
          const base = path.basename(filename, path.extname(filename));
          const extName = path.extname(filename);
          filename = `${base}-${uuid.slice(0, 8)}${extName}`;
        }
        usedFilenames.add(filename);
        relPath = `assets/${filename}`;
        fs.writeFileSync(path.join(artifactDir, relPath), assetObj.buffer);
        hashToAssetPath.set(sha256, relPath);
      }

      assetsManifest[uuid] = {
        uuid,
        path: relPath,
        mime: assetObj.mime,
        compressed: assetObj.compressed,
        size: assetObj.size,
        sha256,
        scope
      };

      return relPath;
    };

    const subpages = [];
    // which unpacked file each asset uuid became, for `dw import` (raw/bundler-meta.json)
    const bundlerMeta = { rootAssetUuids: {}, subpagesMeta: {} };

    const aggregatedTweaks = {};

    // 1. Process root manifest entries
    const rootExtByUuid = new Map(
      (rootBlocks.extResources || []).map((r) => [r.uuid, r.id])
    );
    for (const [uuid, entry] of Object.entries(rootBlocks.manifest)) {
      if (pageSet.has(uuid)) {
        // Defer subpage processing to ordered loop below
        continue;
      }
      const relPath = await saveAsset(uuid, entry, 'root', rootExtByUuid.get(uuid) || null);
      bundlerMeta.rootAssetUuids[uuid] = relPath;
    }

    // 2. Process ordered subpages (if multi-page bundle)
    if (isMultiPage) {
      let index = 0;
      for (const pageUuid of rootBlocks.pageOrder) {
        const entry = rootBlocks.manifest[pageUuid];
        if (!entry) continue;
        index++;

        const decodedPage = decodeManifestEntry(entry);
        const pageHtmlRaw = decodedPage.buffer.toString('utf8');
        const markerMeta = boardMetaByUuid.get(pageUuid) || {};

        const indexPrefix = String(index).padStart(2, '0');
        let pageTitle = markerMeta.title || `Board ${index}`;
        let pageTemplate = pageHtmlRaw;
        let innerBlocks = null;
        const pageAssetUuids = {};

        if (isClaudeBundlerHtml(pageHtmlRaw)) {
          innerBlocks = extractBundlerBlocks(pageHtmlRaw);
          if (!markerMeta.title && innerBlocks.title) {
            pageTitle = innerBlocks.title;
          }
          pageTemplate = innerBlocks.template;

          const innerExtByUuid = new Map(
            (innerBlocks.extResources || []).map((r) => [r.uuid, r.id])
          );
          for (const [innerUuid, innerEntry] of Object.entries(innerBlocks.manifest)) {
            const relAssetPath = await saveAsset(
              innerUuid,
              innerEntry,
              `page:${pageUuid}`,
              innerExtByUuid.get(innerUuid) || null
            );
            pageAssetUuids[innerUuid] = relAssetPath;
          }
        }

        const pageSlug = `${indexPrefix}-${slugify(pageTitle, `board-${index}`)}`;
        const pageRelPath = `pages/${pageSlug}.html`;

        // Rewrite inner asset UUIDs in pageTemplate to `../assets/...` for direct HTTP preview
        let cleanPageHtml = pageTemplate;
        for (const [innerUuid, relAssetPath] of Object.entries(pageAssetUuids)) {
          const fromPageRel = `../${relAssetPath}`;
          cleanPageHtml = cleanPageHtml.split(innerUuid).join(fromPageRel);
        }
        cleanPageHtml = stripSriOnLocalTags(cleanPageHtml);

        if (innerBlocks) cleanPageHtml = withResources(cleanPageHtml, innerBlocks.extResources, pageAssetUuids, '../');

        // Extract tweaks / data-props from this subpage
        const pageTweaks = extractTweaksFromHtml(cleanPageHtml);
        if (Object.keys(pageTweaks.values).length > 0) {
          aggregatedTweaks[pageSlug] = pageTweaks.values;
        }

        const isDcComponent = /<x-dc[\s>]/i.test(cleanPageHtml);
        const width = markerMeta.width || pageTweaks.preview?.width || 1280;
        const height = markerMeta.height || pageTweaks.preview?.height || 800;

        let subpageRecord = {
          uuid: pageUuid,
          index,
          slug: pageSlug,
          title: pageTitle,
          path: pageRelPath,
          width,
          height,
          isDcComponent,
          tweaks: pageTweaks.values,
          propsMeta: pageTweaks.propsMeta,
          html: cleanPageHtml
        };

        subpageRecord = (await this.runHook('onSubpageExtracted', subpageRecord, context)) || subpageRecord;

        fs.writeFileSync(path.join(artifactDir, pageRelPath), subpageRecord.html, 'utf8');

        bundlerMeta.subpagesMeta[pageUuid] = { assetUuids: pageAssetUuids };

        subpages.push({
          uuid: pageUuid,
          index,
          slug: pageSlug,
          title: pageTitle,
          path: pageRelPath,
          width,
          height,
          isDcComponent,
          tweaks: subpageRecord.tweaks,
          propsMeta: subpageRecord.propsMeta
        });
      }
    }

    // Root `index.html`: `about:blank#<uuid>` boards point at `./pages/<slug>.html`, root asset UUIDs at `./assets/...`
    let rootIndexHtml = rootBlocks.template;
    for (const sp of subpages) {
      const markerRe = new RegExp(`about:blank#${sp.uuid}(#[^"']*)?`, 'gi');
      rootIndexHtml = rootIndexHtml.replace(markerRe, (_m, frag) => `./${sp.path}${frag || ''}`);
    }
    for (const [uuid, relAssetPath] of Object.entries(bundlerMeta.rootAssetUuids)) {
      rootIndexHtml = rootIndexHtml.split(uuid).join(`./${relAssetPath}`);
    }
    rootIndexHtml = stripSriOnLocalTags(rootIndexHtml);
    if (!isMultiPage) {
      // a single-page bundle (`page_order` is empty): the root is the board
      rootIndexHtml = withResources(rootIndexHtml, rootBlocks.extResources, bundlerMeta.rootAssetUuids, './');
      const rootTweaks = extractTweaksFromHtml(rootIndexHtml);
      if (Object.keys(rootTweaks.values).length > 0) {
        Object.assign(aggregatedTweaks, rootTweaks.values);
      }
    }
    fs.writeFileSync(path.join(artifactDir, 'index.html'), rootIndexHtml, 'utf8');

    writeJsonFile(path.join(rawDir, 'bundler-meta.json'), bundlerMeta);

    const nowIso = new Date().toISOString();
    const manifest = {
      id: artifactId,
      title,
      createdAt: nowIso,
      updatedAt: nowIso,
      source: {
        model,
        origin: 'claude-design-bundle',
        adapter: this.name,
        originalFile: sourcePath ? path.basename(sourcePath) : null
      },
      status: 'exploring',
      tags: Array.from(new Set(['claude-design', ...tags])),
      entry: 'index.html',
      subpages,
      assets: assetsManifest,
      tweaks: aggregatedTweaks,
      lineage: {
        parent: parentId,
        notes: `Unpacked from ${sourcePath ? path.basename(sourcePath) : 'Claude Design bundle'} (${subpages.length || 1} board(s), ${Object.keys(assetsManifest).length} unique asset(s)).`
      }
    };

    return (await this.runHook('afterUnpack', manifest, context)) || manifest;
  }

  _parseRootBoardMarkers(rootTemplate) {
    const map = new Map();
    if (typeof rootTemplate !== 'string') return map;

    const sectionRe =
      /<section\b[^>]*class=["'][^"']*board[^"']*["'][^>]*>([\s\S]*?)<\/section>/gi;
    let match;
    while ((match = sectionRe.exec(rootTemplate)) !== null) {
      const block = match[1];
      const h2Match = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
      const iframeMatch = block.match(
        /<iframe\b[^>]*src=["']about:blank#([0-9a-f-]{36})(?:#[^"']*)?["'][^>]*>/i
      );
      if (iframeMatch) {
        const uuid = iframeMatch[1];
        const iframeTag = iframeMatch[0];
        const titleAttr = iframeTag.match(/\btitle=["']([^"']*)["']/i);
        const widthAttr = iframeTag.match(/\bwidth=["'](\d+)["']/i);
        const heightAttr = iframeTag.match(/\bheight=["'](\d+)["']/i);
        const title = decodeHtmlEntities(
          (h2Match ? h2Match[1] : titleAttr ? titleAttr[1] : '').trim()
        );
        map.set(uuid, {
          title,
          width: widthAttr ? Number(widthAttr[1]) : null,
          height: heightAttr ? Number(heightAttr[1]) : null
        });
      }
    }

    // Fallback for any bare `<iframe src="about:blank#<uuid>">` not inside `<section class="board">`
    const bareIframeRe =
      /<iframe\b[^>]*src=["']about:blank#([0-9a-f-]{36})(?:#[^"']*)?["'][^>]*>/gi;
    while ((match = bareIframeRe.exec(rootTemplate)) !== null) {
      const uuid = match[1];
      if (map.has(uuid)) continue;
      const tag = match[0];
      const titleAttr = tag.match(/\btitle=["']([^"']*)["']/i);
      const widthAttr = tag.match(/\bwidth=["'](\d+)["']/i);
      const heightAttr = tag.match(/\bheight=["'](\d+)["']/i);
      map.set(uuid, {
        title: titleAttr ? decodeHtmlEntities(titleAttr[1].trim()) : '',
        width: widthAttr ? Number(widthAttr[1]) : null,
        height: heightAttr ? Number(heightAttr[1]) : null
      });
    }

    return map;
  }
}
