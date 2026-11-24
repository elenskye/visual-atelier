// 在本地做出和云端一模一样的 233 张图，放进 blobs/<id>.svg。
// 云端存图时会把 SVG 按 HTML 重新序列化一遍（<path/> 变成 <path></path>），所以先跑 graphic-language-r3 的脚本，
// 再在 Chrome 里用同样的办法序列化，最后逐张和 blobs.json 记的云端 sha256 核对。12 张脚本做不出来的本来就在 blobs/。
// 用法：node rebuild-blobs.mjs        要 Chrome（VA_BROWSER_CHANNEL 不用设，这里直接用 chrome 通道）。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { rootPackage } from '../_lib/root.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, 'graphic-language-r3');
const BLOBS = path.join(HERE, 'blobs');
const map = JSON.parse(fs.readFileSync(path.join(HERE, 'blobs.json'), 'utf8'));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

// 两遍：默认墨感；X3-PPT（原 R3-ppt）的两张章节页当时用的是「split」，单独一遍（见 README）
function render(dir, split) {
  fs.cpSync(SRC, dir, { recursive: true, filter: (p) => !/[/\\]out\d*$/.test(p) });
  const run = (args) => execFileSync(process.execPath, args, { cwd: dir, stdio: 'ignore' });
  if (split) run(['-e', "require('./e3').setInk('split'); require('./render3')"]);
  else for (const f of ['render.js', 'render2.js', 'render3.js', 'render4.js']) run([f]);
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vexp-'));
const dirs = [path.join(tmp, 'default'), path.join(tmp, 'split')];
render(dirs[0], false);
render(dirs[1], true);

const { chromium } = await rootPackage('playwright-core');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
fs.mkdirSync(BLOBS, { recursive: true });
let made = 0;
let kept = 0;
const bad = [];
for (const [id, v] of Object.entries(map)) {
  const out = path.join(BLOBS, `${id}.svg`);
  if (v.saved) {
    if (sha(fs.readFileSync(path.join(HERE, v.saved))) === v.sha256) kept++;
    else bad.push(`${id}：blobs/ 里存的和云端不一样`);
    continue;
  }
  const src = dirs.map((d) => path.join(d, v.file)).map((p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null)).find((s) => s && sha(Buffer.from(s)) === v.source_sha256);
  if (!src) {
    bad.push(`${id}：脚本做不出 ${v.file}`);
    continue;
  }
  const text = await page.evaluate((s) => {
    const t = document.createElement('template');
    t.innerHTML = s;
    return t.innerHTML;
  }, src);
  if (sha(Buffer.from(text)) !== v.sha256) {
    bad.push(`${id}：序列化后和云端不一样`);
    continue;
  }
  fs.writeFileSync(out, text);
  made++;
}
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`脚本做出 ${made} 张，原本存着 ${kept} 张，共 ${made + kept}/${Object.keys(map).length} 张和云端一致`);
if (bad.length) {
  console.log(bad.join('\n'));
  process.exitCode = 1;
}
