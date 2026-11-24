import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { canvasDir, writeCloud } from './store.js';
import { snapshot } from './versions.js';
import { writeJsonFile, sha256 } from '../utils/config.js';
import { BundlerRegistry } from '../bundler/registry.js';
import { readJsonFile } from '../utils/config.js';

const GAP_X = 80;
const GAP_Y = 120;
const PER_ROW = 4;

export function canvasIndex(title, boards, at = new Date()) {
  const index = {
    v: 3,
    createdOnFiles: { v: 1, at: at.toISOString().replace(/\.\d+Z$/, 'Z') },
    title,
    launch: { view: 'canvas' },
    pages: [],
    boards: {},
    order: [],
    notes: {},
    designSystems: []
  };
  let x = 0;
  let y = 0;
  let rowH = 0;
  boards.forEach((b, i) => {
    if (i > 0 && i % PER_ROW === 0) {
      x = 0;
      y += rowH + GAP_Y;
      rowH = 0;
    }
    index.boards[b.file] = { x, y, w: b.w, h: b.h, title: b.title, ...(b.interactive ? { is_interactive: true } : {}) };
    index.order.push(b.file);
    x += b.w + GAP_X;
    rowH = Math.max(rowH, b.h);
  });
  return index;
}

export function boardSkeleton({ title, w = 1280, h = 800 }) {
  const t = JSON.stringify(title);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
body{margin:0}
</style>
</helmet>
<div style="width: ${w}px; height: ${h}px; box-sizing: border-box; padding: 64px; background: #ffffff; color: #1f1e1d; font-family: system-ui, -apple-system, 'PingFang SC', sans-serif">
<h1 style="margin: 0; font-size: 40px">{{title}}</h1>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"title":{"editor":"string","default":${t.replace(/'/g, '&#39;')}},"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
renderVals() {
return { title: this.props.title ?? ${t} };
}
}
</script>
</body>
</html>
`;
}

/** The README every canvas carries (canvases/README.md): what it is, how to look, check, export, and where the cloud copy is. */
export function canvasReadme({ name, title, w = 1280, h = 800 }) {
  return `# ${title}

本地新建的画布，源在 \`project/\`（\`canvas.json\` 加 \`*.dc.html\`），没有生成器，直接改 \`project/\` 里的文件。还没有云端那份。

- 画板：\`project/Main.dc.html\`，${w} × ${h}。新画板同时在 \`project/canvas.json\` 的 \`boards\` 和 \`order\` 里登记。
- 方案：（挂了 Design System 写在这里：\`node bench/bin/dw.js ds install ${name} <方案>\`，文件在 \`project/ds/<名字>/\`）

看：\`node bench/bin/dw.js serve\`，打开 http://127.0.0.1:4321/#/${name}?board=Main.dc.html

自检：\`node bench/bin/dw.js check ${name}\`，截图在 \`canvases/${name}/.shots/check/<画板名>.png\`（文件名去掉 \`.dc.html\`）。

导出：\`node bench/bin/dw.js export ${name} --board Main.dc.html --png\`，放 \`canvases/${name}/.shots/export/\`。

云端：还没有。要发到云端，照 \`docs/cloud.md\`「账号」在自己账号里新建一份，链接记在这里。
`;
}

/** `dw new <name>`: an empty canvas with one board, in the same format as a Claude canvas. */
export function createCanvas(config, name, { title = name, w = 1280, h = 800 } = {}) {
  const dir = canvasDir(config, name);
  if (fs.existsSync(dir)) throw new Error(`已经有 ${dir}`);
  fs.mkdirSync(path.join(dir, 'project'), { recursive: true });
  writeJsonFile(path.join(dir, 'project', 'canvas.json'), canvasIndex(title, [{ file: 'Main.dc.html', w, h, title: 'Main' }]));
  fs.writeFileSync(path.join(dir, 'project', 'Main.dc.html'), boardSkeleton({ title, w, h }), 'utf8');
  fs.writeFileSync(path.join(dir, 'README.md'), canvasReadme({ name, title, w, h }), 'utf8');
  writeCloud(dir, { kind: 'canvas', title, targets: {} });
  snapshot(config, name, 'new');
  return dir;
}

/**
 * `dw import <bundle.html> --name <canvas>`: turns a Claude "standalone HTML" export into a canvas.
 * The export keeps each board's source and images but not the canvas layout, pages or notes,
 * so boards are laid out in rows of four. Images become blobs named by their export uuid.
 */
export async function importBundle(config, bundlePath, name, { title = null } = {}) {
  const dir = canvasDir(config, name);
  if (fs.existsSync(dir)) throw new Error(`已经有 ${dir}`);
  const html = fs.readFileSync(bundlePath, 'utf8');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-import-'));
  try {
    const adapter = new BundlerRegistry(config).resolve(html, bundlePath);
    const manifest = await adapter.unpack(html, { artifactId: name, artifactDir: tmp, sourcePath: bundlePath });
    const meta = readJsonFile(path.join(tmp, 'raw', 'bundler-meta.json'), { subpagesMeta: {} });
    const pages = manifest.subpages?.length
      ? manifest.subpages
      : [{ uuid: null, title: manifest.title, path: manifest.entry || 'index.html', width: 1280, height: 800 }];

    fs.mkdirSync(path.join(dir, 'project'), { recursive: true });
    const boards = [];
    pages.forEach((sp, i) => {
      let src = fs.readFileSync(path.join(tmp, sp.path), 'utf8');
      src = src.replace(/<script data-dw-injected="resources">[\s\S]*?<\/script>\n?/g, '');
      const assetUuids = (sp.uuid && meta.subpagesMeta?.[sp.uuid]?.assetUuids) || {};
      for (const rel of new Set(['assets/dc-runtime.js', ...Object.values(assetUuids)])) {
        const abs = path.join(tmp, rel);
        if (!rel.endsWith('.js') || !fs.existsSync(abs)) continue;
        const js = fs.readFileSync(abs, 'utf8');
        if (!/__dcBoot|StreamableLogic/.test(js)) continue;
        // the canvas runtime: boards load it as ./support.js, served from vendor/
        src = src.split(`<script src="../${rel}"></script>`).join('<script src="./support.js"></script>');
        src = src.split(`<script src="./${rel}"></script>`).join('<script src="./support.js"></script>');
      }
      for (const [uuid, rel] of Object.entries(assetUuids)) {
        const file = path.basename(rel);
        if (/^(dc-runtime|react|react-dom)/.test(file) || !/\.(svg|png|jpe?g|webp|gif|woff2?|ttf|otf)$/i.test(file)) continue;
        const id = uuid.replace(/-/g, '');
        const out = path.join(dir, 'blobs', `${id}${path.extname(file).toLowerCase()}`);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.copyFileSync(path.join(tmp, rel), out);
        src = src.split(`../${rel}`).join(`/_blob/${id}`);
      }
      const fileName = i === 0 ? 'Main.dc.html' : `B${String(i + 1).padStart(2, '0')}.dc.html`;
      fs.writeFileSync(path.join(dir, 'project', fileName), src, 'utf8');
      boards.push({ file: fileName, w: sp.width || 1280, h: sp.height || 800, title: sp.title || fileName, interactive: true });
    });
    const canvasTitle = title || manifest.title || name;
    writeJsonFile(path.join(dir, 'project', 'canvas.json'), canvasIndex(canvasTitle, boards));
    writeCloud(dir, {
      kind: 'canvas',
      title: canvasTitle,
      targets: {},
      importedFrom: { file: path.basename(bundlePath), sha256: sha256(Buffer.from(html, 'utf8')) }
    });
    snapshot(config, name, 'import');
    return { dir, boards: boards.length };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
