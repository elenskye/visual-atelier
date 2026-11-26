// 把 Design System「Vermilion 朱红」的 tokens 和字体写进问卷页（模板或从它复制的问卷）：
//   /* vermilion:tokens */ … /* /vermilion:tokens */      颜色（明暗两套，按 data-theme）、间距、圆角、字号、字体栈
//   <!-- vermilion:fonts --> … <!-- /vermilion:fonts -->  Google Fonts 托管的同款字体（Design System 的做法，不上传字体文件）
// 读的是构建好的 Design System（dist/vermilion/design-system/project/），所以先在仓库根目录 npm run build:ds。
// 页面里照字面写进去，一个文件自己就能跑（发到云端也只有这一个文件）。
// 用法（在仓库根目录）：node skills/questionnaire/template/vermilion.mjs [页面…]   不写就是模板本身；--check 只看是不是最新的
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fontLinks } from '../../../tooling/design-system/tokens-css.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const DS = path.join(ROOT, 'dist/vermilion/design-system/project');
const args = process.argv.slice(2);
const check = args.includes('--check');
const files = args.filter((a) => a !== '--check');
if (!files.length) files.push(path.join(HERE, 'survey.html'));

if (!fs.existsSync(path.join(DS, 'tokens.css'))) {
  console.error('没有构建好的 Vermilion Design System：先在仓库根目录 npm run build:ds');
  process.exit(1);
}
// tokens.css 里的自定义属性（三段：明、暗、尺寸和字体）；后面的 .type-* 是网站用的排版类，问卷不用
const css = fs.readFileSync(path.join(DS, 'tokens.css'), 'utf8');
const vars = [...css.matchAll(/\/\*[\s\S]*?\*\/|[^{}]+\{[^{}]*\}/g)]
  .map((m) => m[0].trim())
  .filter((rule) => rule.startsWith('/*') || /^(:root|\[data-theme)/.test(rule))
  .join('\n');
const tokens = JSON.parse(fs.readFileSync(path.join(DS, 'tokens.json'), 'utf8'));
const fonts = fontLinks(tokens).map((href) => `<link rel="stylesheet" href="${href}">`).join('\n');

const put = (text, open, close, body) => {
  const a = text.indexOf(open);
  const b = text.indexOf(close);
  if (a < 0 || b < a) throw new Error(`找不到 ${open} … ${close}`);
  return text.slice(0, a + open.length) + '\n' + body + '\n' + text.slice(b);
};
let stale = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  let after = put(before, '/* vermilion:tokens */', '/* /vermilion:tokens */', vars);
  after = put(after, '<!-- vermilion:fonts -->', '<!-- /vermilion:fonts -->', fonts);
  const rel = path.relative(ROOT, f);
  if (after === before) console.log(`${rel}：已经是最新的`);
  else if (check) {
    stale++;
    console.log(`${rel}：不是最新的 Vermilion tokens（跑一次 node skills/questionnaire/template/vermilion.mjs ${rel}）`);
  } else {
    fs.writeFileSync(f, after);
    console.log(`${rel}：写进了 Vermilion 的 tokens 和字体`);
  }
}
if (stale) process.exit(1);
