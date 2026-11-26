import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { BaseBundlerAdapter } from '../base-adapter.js';
import { isClaudeBundlerHtml, extractBundlerBlocks, decodeManifestEntry, mimeToExt, stripSriOnLocalTags, previewSize, decodeHtmlEntities } from '../codec.js';
import { slugify } from '../../utils/config.js';

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
 * Claude's "standalone HTML" export (`__bundler` single-file bundle), unpacked for `dw import`.
 * Names the runtime and other assets with the bridge's `onAssetExtracted` (`bridges/claude/`).
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

  /**
   * Unpacks a bundle into `artifactDir` (pages/, assets/, index.html). Returns what `dw import` needs:
   * { title, entry, subpages: [{ uuid, title, path, width, height, assetUuids }], rootAssetUuids }
   * (assetUuids: asset uuid → the unpacked file, relative to artifactDir).
   * @param {string} htmlContent
   * @param {{ artifactId: string, artifactDir: string }} options
   */
  async unpack(htmlContent, { artifactId, artifactDir }) {
    await this.loadBridgeSlot(this.config.claudeBridgeAbs);
    const context = { adapterConfig: this.adapterConfig };

    const pagesDir = path.join(artifactDir, 'pages');
    const assetsDir = path.join(artifactDir, 'assets');
    fs.mkdirSync(pagesDir, { recursive: true });
    fs.mkdirSync(assetsDir, { recursive: true });

    const rootBlocks = extractBundlerBlocks(htmlContent);
    const title = rootBlocks.title || artifactId;
    const pageSet = new Set(rootBlocks.pageOrder || []);
    const isMultiPage = pageSet.size > 0;

    // Extract board titles and dimensions from root template (`<section class="board"><h2>...</h2><iframe src="about:blank#<uuid>" width="..." height="...">`)
    const boardMetaByUuid = this._parseRootBoardMarkers(rootBlocks.template);

    // one file per distinct content (same sha256, same file), named by the bridge or by uuid
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
      return relPath;
    };

    const subpages = [];
    const rootAssetUuids = {};

    // 1. Process root manifest entries
    const rootExtByUuid = new Map(
      (rootBlocks.extResources || []).map((r) => [r.uuid, r.id])
    );
    for (const [uuid, entry] of Object.entries(rootBlocks.manifest)) {
      if (pageSet.has(uuid)) {
        // Defer subpage processing to ordered loop below
        continue;
      }
      rootAssetUuids[uuid] = await saveAsset(uuid, entry, 'root', rootExtByUuid.get(uuid) || null);
    }

    // 2. Process ordered subpages (if multi-page bundle)
    if (isMultiPage) {
      let index = 0;
      for (const pageUuid of rootBlocks.pageOrder) {
        const entry = rootBlocks.manifest[pageUuid];
        if (!entry) continue;
        index++;

        const pageHtmlRaw = decodeManifestEntry(entry).buffer.toString('utf8');
        const markerMeta = boardMetaByUuid.get(pageUuid) || {};

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
            pageAssetUuids[innerUuid] = await saveAsset(innerUuid, innerEntry, `page:${pageUuid}`, innerExtByUuid.get(innerUuid) || null);
          }
        }

        const pageRelPath = `pages/${String(index).padStart(2, '0')}-${slugify(pageTitle, `board-${index}`)}.html`;

        // Rewrite inner asset UUIDs in pageTemplate to `../assets/...` for direct HTTP preview
        let cleanPageHtml = pageTemplate;
        for (const [innerUuid, relAssetPath] of Object.entries(pageAssetUuids)) {
          cleanPageHtml = cleanPageHtml.split(innerUuid).join(`../${relAssetPath}`);
        }
        cleanPageHtml = stripSriOnLocalTags(cleanPageHtml);
        if (innerBlocks) cleanPageHtml = withResources(cleanPageHtml, innerBlocks.extResources, pageAssetUuids, '../');
        fs.writeFileSync(path.join(artifactDir, pageRelPath), cleanPageHtml, 'utf8');

        const size = previewSize(cleanPageHtml);
        subpages.push({
          uuid: pageUuid,
          title: pageTitle,
          path: pageRelPath,
          width: markerMeta.width || size?.width || 1280,
          height: markerMeta.height || size?.height || 800,
          assetUuids: pageAssetUuids
        });
      }
    }

    // Root `index.html`: `about:blank#<uuid>` boards point at `./pages/<slug>.html`, root asset UUIDs at `./assets/...`
    let rootIndexHtml = rootBlocks.template;
    for (const sp of subpages) {
      const markerRe = new RegExp(`about:blank#${sp.uuid}(#[^"']*)?`, 'gi');
      rootIndexHtml = rootIndexHtml.replace(markerRe, (_m, frag) => `./${sp.path}${frag || ''}`);
    }
    for (const [uuid, relAssetPath] of Object.entries(rootAssetUuids)) {
      rootIndexHtml = rootIndexHtml.split(uuid).join(`./${relAssetPath}`);
    }
    rootIndexHtml = stripSriOnLocalTags(rootIndexHtml);
    // a single-page bundle (`page_order` is empty): the root is the board
    if (!isMultiPage) rootIndexHtml = withResources(rootIndexHtml, rootBlocks.extResources, rootAssetUuids, './');
    fs.writeFileSync(path.join(artifactDir, 'index.html'), rootIndexHtml, 'utf8');

    return { title, entry: 'index.html', subpages, rootAssetUuids };
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
