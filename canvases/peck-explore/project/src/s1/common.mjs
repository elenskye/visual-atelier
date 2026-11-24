// 第 1 步共用：画板外壳、字体、演示内容、小工具。生成器不依赖 visual-atelier，放哪都能跑。

export const FONTS = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Doto:wght@700;900&display=swap';
export const SANS = '"IBM Plex Sans","PingFang SC","Hiragino Sans GB",sans-serif';
export const MONO = '"IBM Plex Mono","PingFang SC",monospace';
export const DOTS = '"Doto","IBM Plex Mono",monospace';
export const CYAN = '#00E5FF';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/'/g, '&#39;');

/** 一张画板的完整 .dc.html。logic 是 class 体（不含 class 声明）。 */
export function board({ title, css, body, props = {}, logic = '', w = 1280, h = 800 }) {
  const dp = esc(JSON.stringify({ ...props, $preview: { width: w, height: h } }));
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link rel="stylesheet" href="${FONTS.replace(/&/g, '&amp;')}">
<style>
body{margin:0}
${css.trim()}
</style>
</helmet>
${body.trim()}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='${dp}'>
class Component extends DCLogic {
${logic.trim()}
}
</script>
</body>
</html>
`;
}

/** 明暗 Tweak 的标准写法。 */
export const themeProp = (def) => ({ theme: { editor: 'enum', options: ['深色', '浅色'], default: def, section: '看' } });

/** 计时器：每秒 +1，给「已经跑了多久」用。 */
export const clockLogic = (start = 134) => `
  constructor(p) { super(p); this.state = { t: ${start} }; }
  componentDidMount() { this.iv = setInterval(() => this.setState({ t: this.state.t + 1 }), 1000); }
  componentWillUnmount() { clearInterval(this.iv); }
  clock() { const t = this.state.t; return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }`;

/** 可复现的伪随机。 */
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// ---------- 演示内容（都是编的） ----------
export const C = {
  project: 'weather-cli',
  projects: [
    { name: 'weather-cli', st: 'run', when: '在跑', last: '把设置里三个对话框合成一个面板', n: 12 },
    { name: 'notes-sync', st: 'ok', when: '今天 09:12', last: '导出加一个 Markdown 选项', n: 31 },
    { name: 'pomelo-site', st: 'ok', when: '昨天', last: '首页图片改成懒加载', n: 8 },
  ],
  task: '把设置里三个对话框合成一个面板',
  steps: [
    { st: 'ok', who: 'muse', t: 'Muse 写规范', d: '读了 12 个文件，列出 6 条要改的', time: '48s' },
    { st: 'ok', who: 'grok', t: 'Grok 改 Composer.tsx、App.tsx', d: '新建 SettingsSheet.tsx，删掉两个旧对话框', time: '1:02' },
    { st: 'run', who: 'grok', t: 'Grok 跑 pnpm check', d: '第一次有报错，Grok 在改', time: '' },
    { st: 'todo', who: '', t: '验证并总结', d: '', time: '' },
  ],
  out: ['> tsc --noEmit', 'SettingsSheet.tsx:41  providers 的类型不对', '→ 改 SettingsProps，再跑一遍'],
  files: [
    { p: 'settings/SettingsSheet.tsx', tag: '新', a: 74, d: 0 },
    { p: 'chat/Composer.tsx', tag: '', a: 9, d: 21 },
    { p: 'App.tsx', tag: '', a: 3, d: 18 },
    { p: 'settings/AgentsDialog.tsx', tag: '删', a: 0, d: 93 },
  ],
  add: 86, del: 132,
  ask: { who: 'Grok', q: 'Tailwind 要不要一起升到 4.1？', d: '升级会顺手改 6 个文件的类名；不升也能做完这次任务。' },
};
