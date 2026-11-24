// 作品水印的检查：只用程序画的假图，站主的作品不进本仓库。
// 查的是规则：不遮主体（面积小、只改角落）、取色跟着画面走、尺寸格式不变、原图不动、不留 EXIF、留色彩配置、体积不超、两次一致。
// 用法：npm run qa:watermark
import path from 'node:path';
import { calcAPCA } from 'apca-w3';
import sharp from 'sharp';
import { ROOT, parseArgs, schemesToBuild, schemeDir, readJson, sha256, writeFile, log, isMain } from '../lib/common.mjs';
import { watermarkImage } from '../watermark/watermark.mjs';
import { fakeImage, FAKE_KINDS } from '../watermark/fake-images.mjs';

const MAX_AREA = 0.015;
const MIN_LC = 45;
// 假图上该落在哪、用哪种墨：这几张的答案是确定的；texture、painting 只查不遮主体与体积，取色没有标准答案
const EXPECT = {
  sky: { corner: 'bottom-right', ink: 'onLight' },
  night: { corner: 'bottom-right', ink: 'onDark' },
  crowded: { corner: 'bottom-left', ink: 'onLight' },
};

const hex = (v) => Math.round(v).toString(16).padStart(2, '0');
const blend = (inkHex, grey, a) => `#${[1, 3, 5].map((i) => hex(parseInt(inkHex.slice(i, i + 2), 16) * a + grey * (1 - a))).join('')}`;

/** 灰度图的平均绝对差：rect 之内、之外各算一个。 */
async function diffBy(a, b, rect) {
  const raw = (x) => sharp(x, { autoOrient: true }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const [{ data: da, info }, { data: db }] = await Promise.all([raw(a), raw(b)]);
  const pad = Math.round(rect.height * 0.6);
  let inSum = 0, inN = 0, outSum = 0, outN = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const d = Math.abs(da[y * info.width + x] - db[y * info.width + x]);
      const inside = x >= rect.left - pad && x < rect.left + rect.width + pad && y >= rect.top - pad && y < rect.top + rect.height + pad;
      if (inside) { inSum += d; inN++; } else { outSum += d; outN++; }
    }
  }
  return { inside: inSum / inN, outside: outSum / outN };
}

export async function runWatermarkQa(args = parseArgs()) {
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok, detail });
  for (const scheme of schemesToBuild(args)) {
    const spec = readJson(path.join(schemeDir(scheme), 'marks', 'manifest.json')).assets.find((a) => a.fakeImages?.length);
    if (!spec) continue;
    const template = readJson(path.join(schemeDir(scheme), 'marks', spec.file));

    for (const kind of FAKE_KINDS) {
      const input = await fakeImage(kind);
      const before = sha256(input);
      const { data, info } = await watermarkImage(template, input);
      const again = await watermarkImage(template, input);
      const meta = await sharp(input).metadata();
      check(`${kind}：两次输出逐字节一致`, Buffer.from(data).equals(Buffer.from(again.data)));
      check(`${kind}：原图字节没变`, sha256(input) === before);
      check(`${kind}：尺寸与格式不变`, info.width === meta.width && info.height === meta.height && info.format === meta.format, `${info.width} × ${info.height} ${info.format}`);
      check(`${kind}：不超体积`, info.bytes <= template.maxBytes, `${Math.round(info.bytes / 1024)} KB，质量 ${info.quality}`);
      const area = (info.rect.width * info.rect.height) / (info.width * info.height);
      check(`${kind}：水印面积不超过画面的 ${MAX_AREA * 100}%`, area <= MAX_AREA, `${(area * 100).toFixed(2)}%`);
      const d = await diffBy(input, data, info.rect);
      check(`${kind}：只改了角落`, d.inside > d.outside * 1.05 && d.outside < 12, `水印处差 ${d.inside.toFixed(2)}，其余差 ${d.outside.toFixed(2)}（其余只有重新压缩的差）`);
      const want = EXPECT[kind];
      if (want) {
        check(`${kind}：位置`, info.corner === want.corner, info.corner);
        check(`${kind}：取色`, info.ink === template.ink[want.ink], info.ink);
        const lc = Math.abs(calcAPCA(blend(info.ink, info.mean, template.opacity), blend(info.ink, info.mean, 0)));
        check(`${kind}：对比度 APCA Lc ≥ ${MIN_LC}`, lc >= MIN_LC, `Lc ${lc.toFixed(1)}`);
      }
    }

    const base = await fakeImage('sky');
    const forced = await watermarkImage(template, base, { corner: 'bottom-left' });
    check('可以手动指定位置', forced.info.corner === 'bottom-left');

    const rotated = await sharp(base).withMetadata({ orientation: 6 }).jpeg().toBuffer();
    const rotatedOut = await watermarkImage(template, rotated);
    const rotatedMeta = await sharp(rotatedOut.data).metadata();
    check('手机竖拍（EXIF 方向）按看到的方向加', rotatedMeta.width === 1200 && rotatedMeta.height === 1800 && !rotatedMeta.orientation, `${rotatedMeta.width} × ${rotatedMeta.height}`);

    const withGps = await sharp(base).withExif({ IFD0: { Artist: 'test' }, IFD3: { GPSLatitudeRef: 'N' } }).jpeg().toBuffer();
    check('假图确实带 EXIF（检查本身有效）', Boolean((await sharp(withGps).metadata()).exif));
    check('不保留 EXIF（包括拍摄地点）', !(await sharp((await watermarkImage(template, withGps)).data).metadata()).exif);

    const p3 = await sharp(base).pipelineColourspace('rgb16').withIccProfile('p3').jpeg().toBuffer();
    check('保留色彩配置', Boolean((await sharp((await watermarkImage(template, p3)).data).metadata()).icc));

    const png = await sharp(base).ensureAlpha(0.5).png().toBuffer();
    const pngOut = await watermarkImage(template, png);
    const pngMeta = await sharp(pngOut.data).metadata();
    check('PNG 仍是 PNG，透明保留', pngMeta.format === 'png' && pngMeta.hasAlpha);
    const webp = await watermarkImage(template, await sharp(base).webp().toBuffer());
    check('WebP 仍是 WebP', (await sharp(webp.data).metadata()).format === 'webp');

    const small = await sharp(base).resize(600, 400).jpeg().toBuffer();
    check('太小的图不加', Boolean((await watermarkImage(template, small)).skipped));
    const gif = await sharp(base).resize(800, 600).gif().toBuffer();
    check('不支持的格式不加，也不报错', Boolean((await watermarkImage(template, gif)).skipped));

    const texture = await fakeImage('texture');
    const first = (await watermarkImage(template, texture)).info;
    const tight = { ...template, maxBytes: Math.round(first.bytes * 0.8) };
    const fitted = (await watermarkImage(tight, texture)).info;
    check('超体积时降质量到限内', fitted.bytes <= tight.maxBytes && fitted.quality < first.quality, `质量 ${first.quality} → ${fitted.quality}`);
    const impossible = await watermarkImage({ ...template, maxBytes: 1000 }, texture).then(() => false, (e) => /超过/.test(e.message));
    check('怎么都压不下时明确报错', impossible);
  }
  const fails = results.filter((r) => !r.ok);
  // 给 bench 的 Checks 页看（tooling/qa/all.mjs）
  writeFile(path.join(ROOT, 'dist', 'qa', 'watermark.json'), JSON.stringify({ generatedBy: 'tooling/qa/watermark.mjs', at: new Date().toISOString(), items: results.map((r) => ({ name: r.name, status: r.ok ? 'pass' : 'fail', detail: r.detail || '' })) }, null, 2) + '\n');
  for (const r of args.verbose ? results : fails) log(`  ${r.ok ? '✔' : '✘'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  log(`watermark  ${results.length - fails.length}/${results.length} 项通过`);
  if (fails.length) process.exitCode = 1;
  return results;
}

if (isMain(import.meta.url)) runWatermarkQa().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
