import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { BaseBundlerAdapter } from '../base-adapter.js';
import {
  isClaudeBundlerHtml,
  extractBundlerBlocks,
  decodeManifestEntry,
  encodeManifestEntry,
  mimeToExt,
  extToMime,
  stripSriOnLocalTags,
  extractTweaksFromHtml,
  applyTweaksToHtml,
  escapeHtml,
  decodeHtmlEntities
} from '../codec.js';
import { slugify, writeJsonFile, readJsonFile } from '../../utils/config.js';

/**
 * Standard Pluggable Adapter for Claude Design Single-File HTML Bundles (`ClaudeDesignAdapter`)
 *
 * Connected to the dedicated Claude Bridge Slot (`bridges/claude/`):
 * - Reads `bridges/claude/adapter.config.json`
 * - Invokes lifecycle hooks from `bridges/claude/scripts/hooks.mjs`
 * - Uses native shell templates from `bridges/claude/templates/`
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
   * Unpacks a Claude Design HTML bundle into `workspace/artifacts/<id>/`.
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

    // Preserve original raw bundle for reference
    fs.writeFileSync(path.join(rawDir, 'original.bundle.html'), context.htmlContent, 'utf8');

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
    const bundlerMeta = {
      adapter: this.name,
      version: '1.0.0',
      rootTitle: rootBlocks.title,
      isMultiPage,
      rootExtResources: rootBlocks.extResources,
      rootPageOrder: rootBlocks.pageOrder,
      rootTemplate: rootBlocks.template,
      rootAssetUuids: {},
      subpagesMeta: {}
    };

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

        // Inject window.__resources mapping if extResources exist on the inner bundle
        if (innerBlocks && Array.isArray(innerBlocks.extResources) && innerBlocks.extResources.length > 0) {
          const resMap = {};
          for (const r of innerBlocks.extResources) {
            if (pageAssetUuids[r.uuid]) {
              resMap[r.id] = `../${pageAssetUuids[r.uuid]}`;
            }
          }
          if (Object.keys(resMap).length > 0) {
            const resJson = JSON.stringify(resMap).replace(/</g, '\\u003c');
            const resScript = `<script data-dw-injected="resources">window.__resources = Object.assign(window.__resources || {}, ${resJson});</script>`;
            cleanPageHtml = /<head[^>]*>/i.test(cleanPageHtml)
              ? cleanPageHtml.replace(/<head[^>]*>/i, (m) => `${m}\n${resScript}`)
              : `${resScript}\n${cleanPageHtml}`;
          }
        }

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

        bundlerMeta.subpagesMeta[pageUuid] = {
          uuid: pageUuid,
          slug: pageSlug,
          path: pageRelPath,
          title: pageTitle,
          compressed: decodedPage.compressed,
          isNestedBundler: Boolean(innerBlocks),
          innerTitle: innerBlocks?.title || pageTitle,
          innerExtResources: innerBlocks?.extResources || [],
          innerPageOrder: innerBlocks?.pageOrder || [],
          assetUuids: pageAssetUuids
        };

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

      // Build clean root `index.html` replacing `about:blank#<uuid>` with `./pages/<slug>.html`
      let rootIndexHtml = rootBlocks.template;
      for (const sp of subpages) {
        const markerRe = new RegExp(`about:blank#${sp.uuid}(#[^"']*)?`, 'gi');
        rootIndexHtml = rootIndexHtml.replace(markerRe, (_m, frag) => `./${sp.path}${frag || ''}`);
      }
      for (const [uuid, relAssetPath] of Object.entries(bundlerMeta.rootAssetUuids)) {
        rootIndexHtml = rootIndexHtml.split(uuid).join(`./${relAssetPath}`);
      }
      rootIndexHtml = stripSriOnLocalTags(rootIndexHtml);
      fs.writeFileSync(path.join(artifactDir, 'index.html'), rootIndexHtml, 'utf8');
    } else {
      // Single-page bundle (`page_order` is empty)
      let rootIndexHtml = rootBlocks.template;
      for (const [uuid, relAssetPath] of Object.entries(bundlerMeta.rootAssetUuids)) {
        rootIndexHtml = rootIndexHtml.split(uuid).join(`./${relAssetPath}`);
      }
      rootIndexHtml = stripSriOnLocalTags(rootIndexHtml);

      if (Array.isArray(rootBlocks.extResources) && rootBlocks.extResources.length > 0) {
        const resMap = {};
        for (const r of rootBlocks.extResources) {
          if (bundlerMeta.rootAssetUuids[r.uuid]) {
            resMap[r.id] = `./${bundlerMeta.rootAssetUuids[r.uuid]}`;
          }
        }
        if (Object.keys(resMap).length > 0) {
          const resJson = JSON.stringify(resMap).replace(/</g, '\\u003c');
          const resScript = `<script data-dw-injected="resources">window.__resources = Object.assign(window.__resources || {}, ${resJson});</script>`;
          rootIndexHtml = /<head[^>]*>/i.test(rootIndexHtml)
            ? rootIndexHtml.replace(/<head[^>]*>/i, (m) => `${m}\n${resScript}`)
            : `${resScript}\n${rootIndexHtml}`;
        }
      }

      const rootTweaks = extractTweaksFromHtml(rootIndexHtml);
      if (Object.keys(rootTweaks.values).length > 0) {
        Object.assign(aggregatedTweaks, rootTweaks.values);
      }

      fs.writeFileSync(path.join(artifactDir, 'index.html'), rootIndexHtml, 'utf8');
    }

    // Write lossless bundler reconstruction metadata
    writeJsonFile(path.join(rawDir, 'bundler-meta.json'), bundlerMeta);

    const nowIso = new Date().toISOString();
    let manifest = {
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

    manifest = (await this.runHook('afterUnpack', manifest, context)) || manifest;
    writeJsonFile(path.join(artifactDir, 'manifest.json'), manifest);

    return manifest;
  }

  /**
   * Re-packs an unpacked artifact directory `workspace/artifacts/<id>/` back into
   * a single-file Claude Design `__bundler` HTML document.
   * @param {string} artifactDir
   * @param {{ outputPath?: string }} options
   */
  async pack(artifactDir, options = {}) {
    await this.init();

    const manifestPath = path.join(artifactDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Artifact manifest not found at ${manifestPath}`);
    }

    let manifest = readJsonFile(manifestPath);
    const bundlerMetaPath = path.join(artifactDir, 'raw', 'bundler-meta.json');
    const bundlerMeta = fs.existsSync(bundlerMetaPath) ? readJsonFile(bundlerMetaPath) : null;

    const context = {
      artifactDir,
      manifest,
      bundlerMeta,
      options,
      adapterConfig: this.adapterConfig
    };

    manifest = (await this.runHook('beforePack', artifactDir, manifest, context)) || manifest;

    if (this.externalHooks && typeof this.externalHooks.customPack === 'function') {
      const customHtml = await this.externalHooks.customPack(artifactDir, manifest, context);
      if (typeof customHtml === 'string') {
        if (options.outputPath) {
          fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
          fs.writeFileSync(options.outputPath, customHtml, 'utf8');
        }
        return customHtml;
      }
    }

    const rootShellTemplate = this._loadShellTemplate('rootShell');
    const pageShellTemplate = this._loadShellTemplate('pageShell');

    const rootManifest = {};
    let rootExtResources = bundlerMeta?.rootExtResources || [];
    let rootPageOrder = bundlerMeta?.rootPageOrder || [];
    let rootTemplate = '';

    // Encode root-level assets
    const rootAssetUuids = bundlerMeta?.rootAssetUuids || {};
    for (const [uuid, relAssetPath] of Object.entries(rootAssetUuids)) {
      const absAsset = path.join(artifactDir, relAssetPath);
      if (!fs.existsSync(absAsset)) continue;
      const assetMeta = manifest.assets?.[uuid] || {};
      const mime = assetMeta.mime || extToMime(relAssetPath);
      const compress = assetMeta.compressed ?? this._shouldCompress(mime);
      rootManifest[uuid] = encodeManifestEntry(fs.readFileSync(absAsset), mime, compress);
    }

    const isMultiPage =
      (bundlerMeta && bundlerMeta.isMultiPage) ||
      (Array.isArray(manifest.subpages) && manifest.subpages.length > 0);

    if (isMultiPage) {
      const subpagesList = manifest.subpages || [];
      if (rootPageOrder.length === 0) {
        rootPageOrder = subpagesList.map((sp) => sp.uuid);
      }

      // Read index.html and restore `./pages/<slug>.html` back to `about:blank#<uuid>`
      const indexHtmlPath = path.join(artifactDir, manifest.entry || 'index.html');
      rootTemplate = fs.existsSync(indexHtmlPath)
        ? fs.readFileSync(indexHtmlPath, 'utf8')
        : bundlerMeta?.rootTemplate || '';

      for (const sp of subpagesList) {
        const spMeta = bundlerMeta?.subpagesMeta?.[sp.uuid] || {};
        const pageRelPath = sp.path || spMeta.path;
        const pageAbsPath = path.join(artifactDir, pageRelPath);

        if (!fs.existsSync(pageAbsPath)) {
          throw new Error(`Missing subpage HTML file: ${pageAbsPath}`);
        }

        let pageHtml = fs.readFileSync(pageAbsPath, 'utf8');

        // Apply any tweak overrides from manifest.json (either per-subpage or top-level)
        const pageTweakOverrides =
          manifest.tweaks?.[sp.slug] && typeof manifest.tweaks[sp.slug] === 'object'
            ? manifest.tweaks[sp.slug]
            : manifest.tweaks;
        if (pageTweakOverrides && typeof pageTweakOverrides === 'object') {
          pageHtml = applyTweaksToHtml(pageHtml, pageTweakOverrides);
        }

        // Remove local helper `<script data-dw-injected="resources">...</script>`
        pageHtml = pageHtml.replace(
          /\n?<script\s+data-dw-injected=["']resources["'][^>]*>[\s\S]*?<\/script>/gi,
          ''
        );

        // Reverse-map `../assets/<filename>` back to UUIDs and build inner `__bundler/manifest`
        const innerManifest = {};
        const assetUuidsMap = spMeta.assetUuids || {};

        for (const [innerUuid, relAssetPath] of Object.entries(assetUuidsMap)) {
          const fromPageRel = `../${relAssetPath}`;
          pageHtml = pageHtml.split(fromPageRel).join(innerUuid);

          const absAsset = path.join(artifactDir, relAssetPath);
          if (fs.existsSync(absAsset)) {
            const assetMeta = manifest.assets?.[innerUuid] || {};
            const mime = assetMeta.mime || extToMime(relAssetPath);
            const compress = assetMeta.compressed ?? this._shouldCompress(mime);
            innerManifest[innerUuid] = encodeManifestEntry(
              fs.readFileSync(absAsset),
              mime,
              compress
            );
          }
        }

        // Wrap inner page into its standalone `__bundler` HTML document
        const nestedBundleHtml = this._renderShell(pageShellTemplate, {
          title: spMeta.innerTitle || sp.title || manifest.title,
          manifest: innerManifest,
          extResources: spMeta.innerExtResources || [],
          pageOrder: spMeta.innerPageOrder || [],
          template: pageHtml
        });

        // Compress nested subpage bundle into root manifest
        const compressPage = spMeta.compressed ?? true;
        rootManifest[sp.uuid] = encodeManifestEntry(nestedBundleHtml, 'text/html', compressPage);

        // Restore `./pages/<slug>.html` -> `about:blank#<uuid>` in rootTemplate
        const escapedRel = pageRelPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const localIframeRe = new RegExp(`(?:\\./)?${escapedRel}(#[^"']*)?`, 'g');
        rootTemplate = rootTemplate.replace(
          localIframeRe,
          (_m, frag) => `about:blank#${sp.uuid}${frag || ''}`
        );
      }

      // Restore root-level asset paths back to UUIDs
      for (const [uuid, relAssetPath] of Object.entries(rootAssetUuids)) {
        rootTemplate = rootTemplate.split(`./${relAssetPath}`).join(uuid);
        rootTemplate = rootTemplate.split(relAssetPath).join(uuid);
      }
    } else {
      // Single-page bundle export
      const indexHtmlPath = path.join(artifactDir, manifest.entry || 'index.html');
      rootTemplate = fs.readFileSync(indexHtmlPath, 'utf8');

      if (manifest.tweaks && typeof manifest.tweaks === 'object') {
        rootTemplate = applyTweaksToHtml(rootTemplate, manifest.tweaks);
      }

      rootTemplate = rootTemplate.replace(
        /\n?<script\s+data-dw-injected=["']resources["'][^>]*>[\s\S]*?<\/script>/gi,
        ''
      );

      for (const [uuid, relAssetPath] of Object.entries(rootAssetUuids)) {
        rootTemplate = rootTemplate.split(`./${relAssetPath}`).join(uuid);
        rootTemplate = rootTemplate.split(relAssetPath).join(uuid);
      }

      // Also pack any newly referenced local `./assets/...` files that don't yet have a UUID
      const assetsDir = path.join(artifactDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        for (const file of fs.readdirSync(assetsDir)) {
          const relAssetPath = `assets/${file}`;
          const alreadyMapped = Object.values(rootAssetUuids).includes(relAssetPath);
          if (!alreadyMapped && (rootTemplate.includes(`./${relAssetPath}`) || rootTemplate.includes(relAssetPath))) {
            const newUuid = crypto.randomUUID();
            const absAsset = path.join(artifactDir, relAssetPath);
            const mime = extToMime(relAssetPath);
            rootManifest[newUuid] = encodeManifestEntry(
              fs.readFileSync(absAsset),
              mime,
              this._shouldCompress(mime)
            );
            rootTemplate = rootTemplate.split(`./${relAssetPath}`).join(newUuid);
            rootTemplate = rootTemplate.split(relAssetPath).join(newUuid);
          }
        }
      }
    }

    let finalBundleHtml = this._renderShell(rootShellTemplate, {
      title: bundlerMeta?.rootTitle || manifest.title || manifest.id,
      manifest: rootManifest,
      extResources: rootExtResources,
      pageOrder: rootPageOrder,
      template: rootTemplate
    });

    finalBundleHtml = (await this.runHook('afterPack', finalBundleHtml, context)) || finalBundleHtml;

    if (options.outputPath) {
      fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
      fs.writeFileSync(options.outputPath, finalBundleHtml, 'utf8');
    }

    return finalBundleHtml;
  }

  _shouldCompress(mime) {
    const map = this.adapterConfig?.defaultCompression || {};
    const clean = String(mime).split(';')[0].trim().toLowerCase();
    if (clean in map) return Boolean(map[clean]);
    return /^text\/|javascript|json|svg|xml/i.test(clean);
  }

  _loadShellTemplate(templateKey) {
    const rel =
      this.adapterConfig?.templates?.[templateKey] ||
      (templateKey === 'pageShell'
        ? './templates/bundler-page-shell.html'
        : './templates/bundler-root-shell.html');
    const abs = path.resolve(this.config.claudeBridgeAbs, rel);
    return fs.readFileSync(abs, 'utf8');
  }

  _renderShell(shellHtml, { title, manifest, extResources, pageOrder, template }) {
    const safeJson = (val) => JSON.stringify(val).replace(/<\/script/gi, '<\\/script');
    return shellHtml
      .replace(/\{\{TITLE\}\}/g, escapeHtml(title))
      .replace('{{MANIFEST_JSON}}', safeJson(manifest))
      .replace('{{EXT_RESOURCES_JSON}}', safeJson(extResources))
      .replace('{{PAGE_ORDER_JSON}}', safeJson(pageOrder))
      .replace('{{TEMPLATE_JSON}}', safeJson(template));
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
