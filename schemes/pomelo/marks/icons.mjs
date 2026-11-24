// Pomelo 的界面小图标（Dawn Plan · Phase 7，替换 Lucide）：24 格一笔单线，跟着文字颜色，没有填色和白边（DESIGN.md §4）。
// 全部自己画：这里只有几何，画法（抖动算进路径）和数值跟 Design System 的 Icon 是同一份（tooling/handmade/line.mjs、
// tokens/handmade.json 的 uiIcon）。art.mjs 的 assets() 把它们写成 marks/icons/<名字>.svg。
// 每个图标：
//   d      线（只用绝对的 M L C Q Z）
//   o      圆 [[cx, cy, r], …]
//   rect   圆角方块 [[x, y, w, h, r], …]
//   dots   实心小点 [[cx, cy, r], …]
//   name   中文名
//   for    它替换的 Lucide 图标（Pomelo 里现在用的名字）；没有的是外框自己的
//   batch  第几批验收：1 是到处都有的（方向、增删改、文件、状态），2 是指东西的（模块、标签、自建模块能选的），3 是见字如面的格式条和左栏
import { P, circle, rrect, handStroke, handFill, f } from '../../../tooling/handmade/line.mjs';

const FILE = 'M6 3.5 L14 3.5 L18.5 8 L18.5 20.5 L6 20.5 Z M14 3.5 L14 8 L18.5 8';
const FOLDER = 'M3.5 6 L9.5 6 L11.5 8.5 L20.5 8.5 L20.5 18.5 L3.5 18.5 Z';
const CALENDAR = 'M4.5 6.5 L19.5 6.5 L19.5 20 L4.5 20 Z M4.5 10.5 L19.5 10.5 M8.5 4 L8.5 8 M15.5 4 L15.5 8';
const PIN = 'M9 4.5 L15 4.5 M10 4.5 L10 10 L7 14 L17 14 L14 10 L14 4.5 M12 14 L12 20';
const EYE = 'M3 12 C5.5 7.5 8.5 5.5 12 5.5 C15.5 5.5 18.5 7.5 21 12 C18.5 16.5 15.5 18.5 12 18.5 C8.5 18.5 5.5 16.5 3 12 Z';
const BUBBLE = 'M12 4 C7.3 4 3.5 7.4 3.5 11.7 C3.5 13.6 4.2 15.3 5.5 16.7 L4.5 20 L8.3 18.6 C9.4 19.1 10.7 19.4 12 19.4 C16.7 19.4 20.5 16 20.5 11.7 C20.5 7.4 16.7 4 12 4 Z';
const BOX = 'M3.5 5 L20.5 5 L20.5 9 L3.5 9 Z M5.5 9 L5.5 19.5 L18.5 19.5 L18.5 9';
const BACK_ARC = 'M4.5 5 L4.5 9.5 L9 9.5 M5 9.5 C6.2 6.5 8.9 4.5 12 4.5 C16.2 4.5 19.5 7.9 19.5 12 C19.5 16.1 16.2 19.5 12 19.5 C8.6 19.5 5.8 17.3 4.9 14.3';
const HEART = 'M12 20 C7 16.3 3.8 13.5 3.8 9.8 C3.8 7 5.9 5 8.4 5 C9.9 5 11.2 5.8 12 7.2 C12.8 5.8 14.1 5 15.6 5 C18.1 5 20.2 7 20.2 9.8 C20.2 13.5 17 16.3 12 20 Z';
const NOTEBOOK_LINES = 'M3.5 7.5 L7.5 7.5 M3.5 12 L7.5 12 M3.5 16.5 L7.5 16.5';
const gear = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return `M${f(12 + 7 * Math.cos(a))} ${f(12 + 7 * Math.sin(a))} L${f(12 + 9.6 * Math.cos(a))} ${f(12 + 9.6 * Math.sin(a))}`;
}).join(' ');
const star = (() => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 3.9 : 8.8;
    pts.push(`${f(12 + Math.cos(a) * r)} ${f(12.6 + Math.sin(a) * r)}`);
  }
  return `M${pts.join(' L')} Z`;
})();
// 时间穿梭：一只钟，两边各一段绕着它的斜轨道（钟前后的那两段不画），右边那段的头上带箭头
const orbit = (() => {
  const ph = (-32 * Math.PI) / 180;
  const arc = (a0, a1, n = 14) => Array.from({ length: n + 1 }, (_, i) => {
    const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [12 + 10.8 * Math.cos(t) * Math.cos(ph) - 6.2 * Math.sin(t) * Math.sin(ph), 12 + 10.8 * Math.cos(t) * Math.sin(ph) + 6.2 * Math.sin(t) * Math.cos(ph)];
  });
  const line = (pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}`;
  const right = arc(66, -46), left = arc(124, 222);
  const [x1, y1] = right[right.length - 1], [x0, y0] = right[right.length - 3];
  const a = Math.atan2(y1 - y0, x1 - x0);
  const wing = (b) => `${f(x1 - 2.8 * Math.cos(a + b))} ${f(y1 - 2.8 * Math.sin(a + b))}`;
  return `${line(right)} M${wing(0.62)} L${f(x1)} ${f(y1)} L${wing(-0.62)} ${line(left)}`;
})();
const petals = Array.from({ length: 5 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
  return [Number(f(12 + Math.cos(a) * 3.9)), Number(f(8.8 + Math.sin(a) * 3.9)), 2.1];
});

export const UI_ICONS = {
  // ---------- 第一批：方向、增删改、文件、状态 ----------
  plus: { name: '加', for: ['Plus'], batch: 1, d: 'M12 5 L12 19 M5 12 L19 12' },
  x: { name: '关', for: ['X'], batch: 1, d: 'M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5' },
  check: { name: '勾', for: ['Check'], batch: 1, d: 'M5.5 12.5 L10 17 L18.5 7' },
  'chevron-right': { name: '往右', for: ['ChevronRight'], batch: 1, d: 'M9 5.5 L15.5 12 L9 18.5' },
  'chevron-left': { name: '往左', for: ['ChevronLeft'], batch: 1, d: 'M15 5.5 L8.5 12 L15 18.5' },
  'chevron-down': { name: '往下', for: ['ChevronDown'], batch: 1, d: 'M6 9 L12 15 L18 9' },
  'chevron-up': { name: '往上', for: ['ChevronUp'], batch: 1, d: 'M6 15 L12 9 L18 15' },
  'chevrons-up-down': { name: '上下挑', for: ['ChevronsUpDown'], batch: 1, d: 'M7.5 9 L12 4.5 L16.5 9 M7.5 15 L12 19.5 L16.5 15' },
  'arrow-up': { name: '箭头 · 上', for: ['ArrowUp'], batch: 1, d: 'M12 19 L12 5.5 M6.5 11 L12 5.5 L17.5 11' },
  'arrow-down': { name: '箭头 · 下', for: ['ArrowDown'], batch: 1, d: 'M12 5 L12 18.5 M6.5 13 L12 18.5 L17.5 13' },
  'arrow-left-right': { name: '对调', for: ['ArrowLeftRight'], batch: 1, d: 'M4 8.5 L20 8.5 M16.5 5 L20 8.5 L16.5 12 M20 15.5 L4 15.5 M7.5 12 L4 15.5 L7.5 19' },
  'corner-down-right': { name: '接着', for: ['CornerDownRight'], batch: 1, d: 'M5 5 L5 11.5 C5 13.5 6.5 15 8.5 15 L19 15 M15.5 11.5 L19 15 L15.5 18.5' },
  'back-desk': { name: '回桌面', for: [], batch: 1, d: 'M9.5 6 L4.5 11 L9.5 16 M4.5 11 L14.5 11 C18 11 20 13 20 16 L20 19' },
  flip: { name: '翻面', for: [], batch: 1, d: 'M5 9 C6 5.5 9 4 12 4 C16.5 4 19.5 7.5 19.5 11 M19.5 11 L21.5 8.5 M19.5 11 L17 9.5 M19 15 C18 18.5 15 20 12 20 C7.5 20 4.5 16.5 4.5 13 M4.5 13 L2.5 15.5 M4.5 13 L7 14.5' },
  'refresh-cw': { name: '刷新', for: ['RefreshCw'], batch: 1, d: 'M19.5 11 C19 7 15.8 4.5 12 4.5 C9 4.5 6.5 6 5.2 8.5 M5 4.5 L5 8.7 L9.2 8.7 M4.5 13 C5 17 8.2 19.5 12 19.5 C15 19.5 17.5 18 18.8 15.5 M19 19.5 L19 15.3 L14.8 15.3' },
  'rotate-ccw': { name: '重来', for: ['RotateCcw'], batch: 1, d: BACK_ARC },
  history: { name: '历史', for: ['History'], batch: 1, d: `${BACK_ARC} M12 8 L12 12.3 L15 14` },
  repeat: { name: '重复', for: ['Repeat'], batch: 1, d: 'M5 11 L5 9.5 C5 8 6 7 7.5 7 L19 7 M16.5 4.5 L19 7 L16.5 9.5 M19 13 L19 14.5 C19 16 18 17 16.5 17 L5 17 M7.5 14.5 L5 17 L7.5 19.5' },
  'maximize-2': { name: '放大', for: ['Maximize2'], batch: 1, d: 'M14 4.5 L19.5 4.5 L19.5 10 M19.5 4.5 L13.5 10.5 M10 19.5 L4.5 19.5 L4.5 14 M4.5 19.5 L10.5 13.5' },
  'external-link': { name: '打开', for: ['ExternalLink'], batch: 1, d: 'M13 5 L19 5 L19 11 M19 5 L11 13 M16.5 14 L16.5 19 L5 19 L5 7.5 L10 7.5' },
  search: { name: '找', for: ['Search'], batch: 1, d: 'M16 16 L20.5 20.5', o: [[10.5, 10.5, 6]] },
  ellipsis: { name: '更多', for: ['Ellipsis', 'MoreHorizontal'], batch: 1, dots: [[5.5, 12, 1.4], [12, 12, 1.4], [18.5, 12, 1.4]] },
  'grip-vertical': { name: '拖动', for: ['GripVertical'], batch: 1, dots: [[9, 6, 1.3], [15, 6, 1.3], [9, 12, 1.3], [15, 12, 1.3], [9, 18, 1.3], [15, 18, 1.3]] },
  'trash-2': { name: '删', for: ['Trash2'], batch: 1, d: 'M4.5 7 L19.5 7 M9.5 7 L9.5 4.5 L14.5 4.5 L14.5 7 M6.5 7 L7.5 20 L16.5 20 L17.5 7 M10 11 L10 16.5 M14 11 L14 16.5' },
  pencil: { name: '改', for: ['Pencil'], batch: 1, d: 'M5 19 L6 15 L16 5 L19 8 L9 18 Z M14 7 L17 10' },
  'pen-line': { name: '写', for: ['PenLine'], batch: 1, d: 'M4.5 19.5 L5.3 16 L15.5 5.8 L18.2 8.5 L8 18.7 Z M13 20 L20 20' },
  'square-pen': { name: '新写一篇', for: ['SquarePen'], batch: 1, d: 'M11 5 L5 5 L5 19 L19 19 L19 13 M10 14 L10.8 11 L18 3.8 L20.2 6 L13 13.2 Z' },
  copy: { name: '复制', for: ['Copy'], batch: 1, d: 'M5.5 15.5 L4.5 15.5 L4.5 4.5 L15.5 4.5 L15.5 5.5', rect: [[8.5, 8.5, 11.5, 11.5, 2]] },
  send: { name: '发', for: ['Send'], batch: 1, d: 'M20.5 3.5 L3.5 10.5 L10 13.5 L13.5 20.5 Z M20.5 3.5 L10 13.5' },
  play: { name: '开始', for: ['Play'], batch: 1, d: 'M8.5 5.5 L18.5 12 L8.5 18.5 Z' },
  square: { name: '方块 · 停', for: ['Square'], batch: 1, rect: [[5, 5, 14, 14, 2.5]] },
  'check-square': { name: '勾选框', for: ['CheckSquare'], batch: 1, d: 'M8 12.3 L11 15.2 L16 9', rect: [[4.5, 4.5, 15, 15, 2.5]] },
  circle: { name: '圆', for: ['Circle'], batch: 1, o: [[12, 12, 8.5]] },
  'circle-check': { name: '做完', for: ['CircleCheck', 'CheckCircle2'], batch: 1, d: 'M8 12.3 L11 15.2 L16 9.3', o: [[12, 12, 8.5]] },
  'circle-dot': { name: '在做', for: ['CircleDot'], batch: 1, o: [[12, 12, 8.5]], dots: [[12, 12, 2.2]] },
  'circle-question-mark': { name: '是什么', for: ['CircleQuestionMark'], batch: 1, d: 'M9.6 9.6 C9.8 8.2 10.8 7.5 12 7.5 C13.4 7.5 14.4 8.4 14.4 9.6 C14.4 11.3 12 11.6 12 13.4', o: [[12, 12, 8.5]], dots: [[12, 16.3, 0.9]] },
  // 当心：0.9.0 重画（站主 11-16：感叹号的点看不见）——三角放大一点、竖线短一点；点用一小段圆头的线画（和竖线一样粗、是圆的），离竖线和底边都远一点
  'triangle-alert': { name: '当心', for: ['TriangleAlert'], batch: 1, d: 'M12 3.3 L21.7 20 L2.3 20 Z M12 8.8 L12 12.6 M12 16.1 L12 16.3' },
  pin: { name: '置顶', for: ['Pin'], batch: 1, d: PIN },
  'pin-off': { name: '取消置顶', for: ['PinOff'], batch: 1, d: `${PIN} M4 4 L20 20` },
  eye: { name: '显示', for: ['Eye'], batch: 1, d: EYE, o: [[12, 12, 3]] },
  'eye-off': { name: '隐藏', for: ['EyeOff'], batch: 1, d: `${EYE} M4 4 L20 20`, o: [[12, 12, 3]] },
  lock: { name: '锁', for: ['Lock'], batch: 1, d: 'M8 10.5 L8 7.5 C8 5.2 9.8 3.5 12 3.5 C14.2 3.5 16 5.2 16 7.5 L16 10.5', rect: [[5, 10.5, 14, 10, 2.5]], dots: [[12, 15.3, 1.1]] },
  'link-2': { name: '链接', for: ['Link2'], batch: 1, d: 'M9.5 16.5 L7.5 16.5 C5 16.5 3.5 14.5 3.5 12 C3.5 9.5 5 7.5 7.5 7.5 L9.5 7.5 M14.5 7.5 L16.5 7.5 C19 7.5 20.5 9.5 20.5 12 C20.5 14.5 19 16.5 16.5 16.5 L14.5 16.5 M8.5 12 L15.5 12' },
  paperclip: { name: '附件', for: ['Paperclip'], batch: 1, d: 'M19 11 L11.5 18.5 C9.6 20.4 6.8 20.4 5 18.6 C3.2 16.8 3.2 14 5.1 12.1 L12.8 4.6 C14 3.4 15.9 3.4 17.1 4.6 C18.3 5.8 18.3 7.7 17.1 8.9 L9.6 16.3 C9 16.9 8 16.9 7.4 16.3 C6.8 15.7 6.8 14.8 7.4 14.2 L14.3 7.4' },
  hash: { name: '井号', for: ['Hash'], batch: 1, d: 'M9.5 4.5 L7.5 19.5 M16.5 4.5 L14.5 19.5 M5 9 L19.5 9 M4.5 15 L19 15' },
  quote: { name: '引用', for: ['Quote'], batch: 1, d: 'M5 17 C7.5 16 8.8 13.8 8.8 11 L8.8 7 L4.5 7 L4.5 11.5 L8.6 11.5 M14.2 17 C16.7 16 18 13.8 18 11 L18 7 L13.7 7 L13.7 11.5 L17.8 11.5' },
  'file-text': { name: '文件', for: ['FileText'], batch: 1, d: `${FILE} M9 12.5 L15.5 12.5 M9 16 L15.5 16` },
  'file-down': { name: '存成文件', for: ['FileDown'], batch: 1, d: `${FILE} M12 11 L12 17 M9.5 14.5 L12 17 L14.5 14.5` },
  'file-plus': { name: '新文件', for: ['FilePlus', 'FilePlus2'], batch: 1, d: `${FILE} M12 11.5 L12 17.5 M9 14.5 L15 14.5` },
  'file-input': { name: '读进来', for: ['FileInput'], batch: 1, d: 'M6 9 L6 3.5 L14 3.5 L18.5 8 L18.5 20.5 L6 20.5 L6 18 M14 3.5 L14 8 L18.5 8 M3 13.5 L12 13.5 M9.5 11 L12 13.5 L9.5 16' },
  'file-output': { name: '导出去', for: ['FileOutput'], batch: 1, d: 'M6 9 L6 3.5 L14 3.5 L18.5 8 L18.5 20.5 L6 20.5 L6 18 M14 3.5 L14 8 L18.5 8 M12 13.5 L3 13.5 M5.5 11 L3 13.5 L5.5 16' },
  'file-pen': { name: '改文件', for: ['FilePen'], batch: 1, d: 'M12 20.5 L6 20.5 L6 3.5 L14 3.5 L18.5 8 L18.5 10 M14 3.5 L14 8 L18.5 8 M14.5 20 L15.2 17.3 L19.8 12.7 L21.6 14.5 L17 19.1 Z' },
  'file-user': { name: '简历', for: ['FileUser'], batch: 1, d: `${FILE} M8.8 17.5 C9.2 15.9 10.4 15.2 12 15.2 C13.6 15.2 14.8 15.9 15.2 17.5`, o: [[12, 12, 1.8]] },
  folder: { name: '文件夹', for: ['Folder'], batch: 1, d: FOLDER },
  'folder-open': { name: '打开的文件夹', for: ['FolderOpen'], batch: 1, d: 'M4 18.5 L4 5.5 L9.5 5.5 L11.5 8 L18.5 8 L18.5 10.5 M4 18.5 L6.5 10.5 L21 10.5 L18.5 18.5 Z' },
  'folder-plus': { name: '新文件夹', for: ['FolderPlus'], batch: 1, d: `${FOLDER} M12 11 L12 16 M9.5 13.5 L14.5 13.5` },
  'folder-input': { name: '放进文件夹', for: ['FolderInput'], batch: 1, d: 'M3.5 11.5 L3.5 6 L9.5 6 L11.5 8.5 L20.5 8.5 L20.5 18.5 L3.5 18.5 L3.5 16.5 M2.5 14 L11 14 M8.5 11.5 L11 14 L8.5 16.5' },
  archive: { name: '归档', for: ['Archive'], batch: 1, d: `${BOX} M10 13 L14 13` },
  'archive-restore': { name: '恢复', for: ['ArchiveRestore'], batch: 1, d: `${BOX} M12 17 L12 12 M9.8 14 L12 12 L14.2 14` },
  'image-plus': { name: '加图片', for: ['ImagePlus'], batch: 1, d: 'M12.5 4.5 L4.5 4.5 L4.5 19.5 L19.5 19.5 L19.5 11.5 M4.5 16 L9 11.5 L13 15.5 L15.5 13.5 L19.5 17 M18 2.5 L18 8.5 M15 5.5 L21 5.5', o: [[9, 9, 1.5]] },
  'image-off': { name: '图片没了', for: ['ImageOff'], batch: 1, d: 'M4.5 16 L9 11.5 L13 15.5 M3.5 3.5 L20.5 20.5', rect: [[4.5, 4.5, 15, 15, 2]] },
  'list-plus': { name: '加一条', for: ['ListPlus'], batch: 1, d: 'M4 6.5 L15 6.5 M4 12 L12 12 M4 17.5 L10 17.5 M17 12.5 L17 19.5 M13.5 16 L20.5 16' },
  'list-checks': { name: '清单', for: ['ListChecks'], batch: 1, d: 'M3.5 6.5 L5.5 8.5 L8.5 5 M3.5 16 L5.5 18 L8.5 14.5 M12 7 L20.5 7 M12 16.5 L20.5 16.5' },
  'panel-left-open': { name: '展开左栏', for: ['PanelLeftOpen'], batch: 1, d: 'M9.5 5 L9.5 19 M13.5 10 L15.5 12 L13.5 14', rect: [[4, 5, 16, 14, 2]] },
  'panel-left-close': { name: '收起左栏', for: ['PanelLeftClose'], batch: 1, d: 'M9.5 5 L9.5 19 M15.5 10 L13.5 12 L15.5 14', rect: [[4, 5, 16, 14, 2]] },
  'layout-grid': { name: '格子', for: ['LayoutGrid'], batch: 1, rect: [[4.5, 4.5, 6, 6, 1.2], [13.5, 4.5, 6, 6, 1.2], [4.5, 13.5, 6, 6, 1.2], [13.5, 13.5, 6, 6, 1.2]] },
  settings: { name: '设置', for: ['Settings'], batch: 1, d: gear, o: [[12, 12, 3], [12, 12, 6.6]] },
  'settings-2': { name: '管理', for: ['Settings2'], batch: 1, d: 'M4 8 L13 8 M17.5 8 L20 8 M4 16 L6.5 16 M11 16 L20 16', o: [[15.2, 8, 2.2], [8.8, 16, 2.2]] },
  'sliders-horizontal': { name: '筛选', for: ['SlidersHorizontal'], batch: 1, d: 'M4 6 L11 6 M15.5 6 L20 6 M4 12 L7 12 M11.5 12 L20 12 M4 18 L13 18 M17.5 18 L20 18 M13.2 4 L13.2 8 M9.2 10 L9.2 14 M15.3 16 L15.3 20' },
  sparkle: { name: '一颗星', for: [], batch: 1, d: 'M12 4 Q12 12 20 12 Q12 12 12 20 Q12 12 4 12 Q12 12 12 4 Z' },
  sparkles: { name: '柚子帮忙', for: ['Sparkles'], batch: 1, d: 'M10 4 Q10 11 17 11 Q10 11 10 18 Q10 11 3 11 Q10 11 10 4 Z M18.5 3.5 L18.5 7.5 M16.5 5.5 L20.5 5.5 M18.5 16 L18.5 20 M16.5 18 L20.5 18' },
  'wand-sparkles': { name: '变一下', for: ['WandSparkles'], batch: 1, d: 'M4.5 19.5 L15 9 M13 7 L17 11 M17.5 3.5 L17.5 6.5 M16 5 L19 5 M7 4.5 L7 7.5 M5.5 6 L8.5 6 M19 13.5 L19 16.5 M17.5 15 L20.5 15' },
  'message-square': { name: '对话', for: ['MessageSquare'], batch: 1, d: 'M4.5 5 L19.5 5 L19.5 16 L10 16 L5.5 19.5 L5.5 16 L4.5 16 Z' },
  'message-circle': { name: '聊', for: ['MessageCircle'], batch: 1, d: BUBBLE },
  'message-circle-question': { name: '问我', for: ['MessageCircleQuestion'], batch: 1, d: `${BUBBLE} M9.8 9.6 C10 8.4 10.9 7.8 12 7.8 C13.3 7.8 14.2 8.6 14.2 9.7 C14.2 11.2 12 11.4 12 13`, dots: [[12, 15.6, 0.9]] },
  globe: { name: '联网', for: ['Globe'], batch: 1, d: 'M3.5 12 L20.5 12 M12 3.5 C8.5 7 8.5 17 12 20.5 M12 3.5 C15.5 7 15.5 17 12 20.5', o: [[12, 12, 8.5]] },
  cloud: { name: '云端', for: ['Cloud'], batch: 1, d: 'M7 18.5 C4.8 18.5 3.2 16.9 3.2 14.8 C3.2 12.9 4.6 11.4 6.5 11.2 C7 8.2 9.3 6 12.2 6 C15 6 17.3 8 17.9 10.7 C19.7 11.1 21 12.7 21 14.6 C21 16.8 19.3 18.5 17.2 18.5 Z' },
  lightbulb: { name: '思考', for: ['Lightbulb'], batch: 1, d: 'M9 17 L15 17 M10 20 L14 20 M9 17 C9 14.5 6.5 13.5 6.5 9.8 C6.5 6.5 9 4 12 4 C15 4 17.5 6.5 17.5 9.8 C17.5 13.5 15 14.5 15 17' },
  keyboard: { name: '打字', for: ['Keyboard'], batch: 1, d: 'M8 14.5 L16 14.5', rect: [[3, 6.5, 18, 11, 2]], dots: [[7, 10.3, 1], [10.3, 10.3, 1], [13.7, 10.3, 1], [17, 10.3, 1]] },
  'scan-text': { name: '认字', for: ['ScanText'], batch: 1, d: 'M4 8 L4 4 L8 4 M16 4 L20 4 L20 8 M20 16 L20 20 L16 20 M8 20 L4 20 L4 16 M8 9 L16 9 M8 12 L14 12 M8 15 L16 15' },
  'trending-up': { name: '走势', for: ['TrendingUp'], batch: 1, d: 'M3.5 17 L9.5 11 L13 14.5 L20.5 7 M15.5 7 L20.5 7 L20.5 12' },

  // ---------- 第二批：指东西的 ----------
  pomelo: { name: '柚子', for: ['Bird', 'Citrus'], batch: 2, d: 'M12 6.5 C8 7 4.5 10.5 4.5 14.5 C4.5 18 7.8 20.5 12 20.5 C16.2 20.5 19.5 18 19.5 14.5 C19.5 10.5 16 7 12 6.5 Z M12 6.5 C12.5 4.5 14 3.2 16.5 3.2 C16.5 5.2 15 6.5 12 6.5', dots: [[9.5, 14, 0.95], [14.5, 14, 0.95]] },
  house: { name: '首页', for: ['House'], batch: 2, d: 'M4 11.5 L12 4.5 L20 11.5 M6.5 9.5 L6.5 19.5 L17.5 19.5 L17.5 9.5 M10 19.5 L10 14.5 L14 14.5 L14 19.5' },
  footprints: { name: '一步一步', for: ['Footprints'], batch: 2, d: 'M8 11.3 C6.3 11.3 5.3 13 5.3 15.3 C5.3 17.8 6.4 19.8 8 19.8 C9.6 19.8 10.7 17.8 10.7 15.3 C10.7 13 9.7 11.3 8 11.3 Z M16 6.8 C14.3 6.8 13.3 8.5 13.3 10.8 C13.3 13.3 14.4 15.3 16 15.3 C17.6 15.3 18.7 13.3 18.7 10.8 C18.7 8.5 17.7 6.8 16 6.8 Z', dots: [[5.9, 9.3, 1.05], [8, 8.5, 1.05], [10.1, 9.3, 1.05], [13.9, 4.8, 1.05], [16, 4, 1.05], [18.1, 4.8, 1.05]] },
  feather: { name: '念念不忘', for: ['Feather'], batch: 2, d: 'M19.5 4.5 C13 4.5 7.5 8.5 6.5 16.5 L7.5 17.5 C15.5 16.5 19.5 11 19.5 4.5 Z M19.5 4.5 L4 20 M10 14 L15.5 14' },
  'calendar-days': { name: '日历', for: ['CalendarDays'], batch: 2, d: CALENDAR, dots: [[8.5, 14, 0.9], [12, 14, 0.9], [15.5, 14, 0.9], [8.5, 17, 0.9], [12, 17, 0.9]] },
  'calendar-heart': { name: '来日方长', for: ['CalendarHeart'], batch: 2, d: `${CALENDAR} M12 18 C10 16.6 9 15.6 9 14.5 C9 13.6 9.7 13 10.5 13 C11.1 13 11.7 13.4 12 14 C12.3 13.4 12.9 13 13.5 13 C14.3 13 15 13.6 15 14.5 C15 15.6 14 16.6 12 18 Z` },
  'calendar-check': { name: '到期', for: ['CalendarCheck'], batch: 2, d: `${CALENDAR} M9 15 L11.3 17.2 L15.2 12.8` },
  wallet: { name: '钱来钱往', for: ['Wallet'], batch: 2, d: 'M4 7.5 L4 18.5 L20 18.5 L20 9.5 L6 9.5 C4.8 9.5 4 8.7 4 7.5 C4 6.3 4.8 5.5 6 5.5 L17.5 5.5 L17.5 9.5', dots: [[16.3, 14, 1.1]] },
  luggage: { name: '出门走走', for: ['Luggage'], batch: 2, d: 'M9.5 7 L9.5 4.5 L14.5 4.5 L14.5 7 M10 10.5 L10 15.5 M14 10.5 L14 15.5 M8.5 19 L8.5 20.5 M15.5 19 L15.5 20.5', rect: [[6, 7, 12, 12, 2]] },
  'book-open': { name: '摸鱼读读', for: ['BookOpen'], batch: 2, d: 'M12 6.5 C10 5 7 4.5 3.5 5 L3.5 18 C7 17.5 10 18 12 19.5 C14 18 17 17.5 20.5 18 L20.5 5 C17 4.5 14 5 12 6.5 Z M12 6.5 L12 19.5' },
  clapperboard: { name: '好奇看看', for: ['Clapperboard'], batch: 2, d: 'M4 10 L20 10 L20 19.5 L4 19.5 Z M4 10 L3.5 6.8 L18.5 4 L19.2 7.2 L4 10 M8 5.9 L10 9 M13 5 L15 8' },
  palette: { name: '随意画画', for: ['Palette'], batch: 2, d: 'M12 3.5 C7 3.5 3.5 7.3 3.5 12 C3.5 16.7 7.2 20.5 11.8 20.5 C13.4 20.5 14 19.6 14 18.6 C14 17.6 13.3 17.2 13.3 16.2 C13.3 15.2 14.1 14.5 15.2 14.5 L17 14.5 C19 14.5 20.5 13 20.5 10.8 C20.5 6.7 16.8 3.5 12 3.5 Z', dots: [[8, 10, 1.1], [11.2, 7.2, 1.1], [15.3, 7.8, 1.1]] },
  compass: { name: '呦呦漫游', for: ['Compass'], batch: 2, d: 'M15.5 8.5 L13.5 13.5 L8.5 15.5 L10.5 10.5 Z', o: [[12, 12, 8.5]] },
  briefcase: { name: '投石问路', for: ['Briefcase'], batch: 2, d: 'M9 7.5 L9 5 L15 5 L15 7.5 M3.5 13 L20.5 13', rect: [[3.5, 7.5, 17, 12, 2]] },
  target: { name: '目标', for: ['Target'], batch: 2, o: [[12, 12, 8.5], [12, 12, 5]], dots: [[12, 12, 1.5]] },
  'key-round': { name: '芝麻开门', for: ['KeyRound'], batch: 2, d: 'M11 12.5 L19.5 4 M16.5 7 L19 9.5 M14 9.5 L16 11.5', o: [[8, 15.5, 4.2]] },
  fingerprint: { name: '指纹', for: ['Fingerprint'], batch: 2, d: 'M6.5 9 C7.5 6.5 9.5 5 12 5 C15.3 5 17.8 7.6 17.8 11 C17.8 13.5 17.6 15.5 17 17.5 M9 12 C9 10 10.3 8.5 12 8.5 C13.7 8.5 14.6 10 14.6 11.5 C14.6 14.5 14.2 17 13.2 19.5 M12 12 C12 15 11.5 17.2 10 19.5 M6.2 12.5 C6.2 14.5 6 16 5.2 17.5' },
  bookmark: { name: '一网打尽', for: ['Bookmark'], batch: 2, d: 'M7 4 L17 4 L17 20 L12 16 L7 20 Z' },
  'brush-cleaning': { name: 'DevJanitor', for: ['BrushCleaning'], batch: 2, d: 'M14 3.5 L11 11 M7 11 L16 11 L18.5 20.5 L5 20.5 Z M9.5 20.5 L10.3 16.5 M13.8 20.5 L13.5 16.5' },
  'hard-drive': { name: '磁盘', for: ['HardDrive'], batch: 2, d: 'M4 13 L6.5 6 L17.5 6 L20 13 L20 18 L4 18 Z M4 13 L20 13', dots: [[7.5, 15.5, 0.9], [10.8, 15.5, 0.9]] },
  'database-backup': { name: '备份', for: ['DatabaseBackup'], batch: 2, d: 'M4.5 6.5 C4.5 4.8 8 3.8 12 3.8 C16 3.8 19.5 4.8 19.5 6.5 C19.5 8.2 16 9.2 12 9.2 C8 9.2 4.5 8.2 4.5 6.5 Z M4.5 6.5 L4.5 17.5 C4.5 19 7.5 20.2 11 20.2 M19.5 6.5 L19.5 11 M4.5 12 C4.5 13.5 7.5 14.6 11 14.6 M14.5 14 L14.5 17 L17.5 17 M14.8 17 C15.5 15.3 17 14.5 18.6 14.8 C20.3 15.2 21.3 16.8 21 18.4 C20.6 20.1 19 21.1 17.3 20.8' },
  stethoscope: { name: '体检', for: ['Stethoscope'], batch: 2, d: 'M6 4 L5 4 L5 9.5 C5 12 6.8 13.8 9 13.8 C11.2 13.8 13 12 13 9.5 L13 4 L12 4 M9 13.8 L9 16 C9 18.5 10.8 20 13.2 20 C15.7 20 17.5 18.3 17.5 16 L17.5 13', o: [[17.5, 10.5, 2.3]] },
  languages: { name: '翻译', for: ['Languages'], batch: 2, d: 'M3.5 6.5 L12.5 6.5 M8 4 L8 6.5 M10.8 6.5 C10 10.5 7.5 13.2 4 14.8 M5.5 9.5 C6.6 12 8.6 13.8 11.2 14.6 M12.5 20 L16.5 10.5 L20.5 20 M13.9 17 L19.1 17' },
  brain: { name: '记忆', for: ['Brain'], batch: 2, d: 'M12 5 C10.5 3.5 7.5 4 7 6.5 C5 7 4 9 5 11 C3.8 12.5 4.3 15 6.2 15.8 C6.2 18.2 8.5 20 10.5 19.3 C11.3 19 12 18.3 12 17.5 L12 5 M12 5 C13.5 3.5 16.5 4 17 6.5 C19 7 20 9 19 11 C20.2 12.5 19.7 15 17.8 15.8 C17.8 18.2 15.5 20 13.5 19.3 C12.7 19 12 18.3 12 17.5 M7.5 9.5 C9.2 9.8 10 11.2 9.5 12.8 M16.5 9.5 C14.8 9.8 14 11.2 14.5 12.8 M6.8 15.6 C8.2 15.3 9.3 15.8 9.8 17 M17.2 15.6 C15.8 15.3 14.7 15.8 14.2 17' },
  library: { name: '资料', for: ['Library'], batch: 2, d: 'M5 4.5 L5 19.5 M9 4.5 L9 19.5 M13 6 L13 19.5 M16 7 L20 19.5' },
  'library-big': { name: '知识库', for: ['LibraryBig'], batch: 2, d: 'M15.5 7 L18.5 6 L21.5 19 L18.5 20 Z', rect: [[4, 4.5, 5, 15.5, 1], [9.5, 4.5, 4.5, 15.5, 1]] },
  puzzle: { name: '插件', for: ['Puzzle'], batch: 2, d: 'M9 5 L9 7.5 L4.5 7.5 L4.5 12 C6 11.2 7.8 12 7.8 13.8 C7.8 15.6 6 16.4 4.5 15.6 L4.5 19.5 L9.5 19.5 C8.7 18 9.5 16.4 11.3 16.4 C13.1 16.4 13.9 18 13.1 19.5 L17.5 19.5 L17.5 15 C19 15.8 20.6 15 20.6 13.2 C20.6 11.4 19 10.6 17.5 11.4 L17.5 7.5 L13 7.5 L13 5 C13 3.8 12.2 3 11 3 C9.8 3 9 3.8 9 5 Z' },
  'alarm-clock': { name: '定时', for: ['AlarmClock'], batch: 2, d: 'M12 9.5 L12 13 L14.5 14.5 M5 4.5 L3 6.5 M19 4.5 L21 6.5 M7 19 L5.5 20.8 M17 19 L18.5 20.8', o: [[12, 13, 7]] },
  'bell-ring': { name: '提醒', for: ['BellRing'], batch: 2, d: 'M6.5 16.5 C7.5 15 7.5 13 7.5 10.5 C7.5 8 9.5 6 12 6 C14.5 6 16.5 8 16.5 10.5 C16.5 13 16.5 15 17.5 16.5 Z M10.3 19.3 C10.8 20.2 13.2 20.2 13.7 19.3 M12 4 L12 6 M4 9 C4 7.5 4.6 6.2 5.6 5.2 M20 9 C20 7.5 19.4 6.2 18.4 5.2' },
  hourglass: { name: '等一等', for: ['Hourglass'], batch: 2, d: 'M6 3.5 L18 3.5 M6 20.5 L18 20.5 M7.5 3.5 L7.5 7 C7.5 9.5 12 10.5 12 12 C12 13.5 7.5 14.5 7.5 17 L7.5 20.5 M16.5 3.5 L16.5 7 C16.5 9.5 12 10.5 12 12 C12 13.5 16.5 14.5 16.5 17 L16.5 20.5' },
  'time-travel': { name: '时间穿梭', for: [], batch: 2, d: `M12 9.3 L12 12 L13.9 13.1 ${orbit}`, o: [[12, 12, 4.8]] },
  sun: { name: '太阳', for: ['Sun'], batch: 2, d: 'M12 3 L12 5.5 M12 18.5 L12 21 M3 12 L5.5 12 M18.5 12 L21 12 M5.6 5.6 L7.4 7.4 M16.6 16.6 L18.4 18.4 M5.6 18.4 L7.4 16.6 M16.6 7.4 L18.4 5.6', o: [[12, 12, 4]] },
  moon: { name: '月亮', for: ['Moon'], batch: 2, d: 'M19.5 14.5 C18.3 15.2 17 15.5 15.5 15.5 C11.5 15.5 8.5 12.5 8.5 8.5 C8.5 7 8.9 5.6 9.6 4.5 C6 5.4 3.5 8.6 3.5 12.3 C3.5 16.8 7.2 20.5 11.7 20.5 C15.4 20.5 18.5 18 19.5 14.5 Z' },
  'map-pin': { name: '地点', for: ['MapPin'], batch: 2, d: 'M12 21 C8 16.5 5.5 13.3 5.5 9.8 C5.5 6.2 8.4 3.5 12 3.5 C15.6 3.5 18.5 6.2 18.5 9.8 C18.5 13.3 16 16.5 12 21 Z', o: [[12, 9.8, 2.4]] },
  tag: { name: '标签', for: ['Tag'], batch: 2, d: 'M4 4.5 L11.5 4.5 L20 13 L13 20 L4 11.5 Z', dots: [[7.7, 8.2, 1.1]] },
  tags: { name: '几个标签', for: ['Tags'], batch: 2, d: 'M3.5 4.5 L10 4.5 L18 12.5 L12 18.5 L3.5 10.5 Z M13.5 4.5 L21 12 L15.5 17.5', dots: [[7, 8, 1.1]] },
  notebook: { name: '本子', for: ['Notebook'], batch: 2, d: `${NOTEBOOK_LINES} M10.5 8 L15.5 8 M10.5 11.5 L15.5 11.5`, rect: [[6, 3.5, 13, 17, 2]] },
  'notebook-pen': { name: '记在本子上', for: ['NotebookPen'], batch: 2, d: `M13 3.5 L8 3.5 C6.9 3.5 6 4.4 6 5.5 L6 18.5 C6 19.6 6.9 20.5 8 20.5 L17 20.5 C18.1 20.5 19 19.6 19 18.5 L19 14 ${NOTEBOOK_LINES} M12.5 13.5 L13.2 10.8 L19.3 4.7 L21.3 6.7 L15.2 12.8 Z` },
  'scroll-text': { name: '长文', for: ['ScrollText'], batch: 2, d: 'M6.5 4 L18.5 4 L18.5 16.5 M6.5 4 C5.2 4 4.5 5 4.5 6.2 L4.5 7.5 L6.5 7.5 M6.5 4 L6.5 18 C6.5 19.2 7.4 20 8.6 20 L19 20 C20.2 20 21 19.2 21 18 L21 16.5 L10 16.5 L10 18 C10 19.2 9.3 20 8.6 20 M10 8.5 L15 8.5 M10 12 L15 12' },
  user: { name: '一个人', for: ['User'], batch: 2, d: 'M5 20 C5.5 16.5 8.3 14.5 12 14.5 C15.7 14.5 18.5 16.5 19 20', o: [[12, 8.2, 3.7]] },
  users: { name: '几个人', for: ['Users'], batch: 2, d: 'M3 19.5 C3.4 16.5 5.8 14.5 9 14.5 C12.2 14.5 14.6 16.5 15 19.5 M15.5 5.6 C17.2 5.9 18.3 7.2 18.3 8.8 C18.3 10.4 17.2 11.6 15.6 11.9 M17.5 14.8 C19.5 15.5 20.7 17.2 21 19.5', o: [[9, 8.5, 3.2]] },
  smile: { name: '笑脸', for: ['Smile'], batch: 2, d: 'M8.5 14 C9.3 15.6 10.5 16.3 12 16.3 C13.5 16.3 14.7 15.6 15.5 14', o: [[12, 12, 8.5]], dots: [[9.2, 10, 0.95], [14.8, 10, 0.95]] },
  heart: { name: '心', for: ['Heart'], batch: 2, d: HEART },
  'heart-pulse': { name: '身体', for: ['HeartPulse'], batch: 2, d: `${HEART} M7 12 L9.5 12 L11 9.5 L13 14.5 L14.5 12 L17 12` },
  star: { name: '星星', for: ['Star'], batch: 2, d: star },
  flame: { name: '火', for: ['Flame'], batch: 2, d: 'M12 3.5 C12.5 7 16.5 9 16.5 14 C16.5 17.5 14.5 20.5 12 20.5 C9.5 20.5 7.5 17.8 7.5 14.5 C7.5 12.5 8.5 11 9.5 10 C9.8 11.5 10.5 12.3 11.5 12.5 C11 9.5 11 6 12 3.5 Z' },
  'flower-2': { name: '花', for: ['Flower2'], batch: 2, d: 'M12 14.8 L12 20.5 M12 18.5 C10.2 18.5 9 17.5 8.5 16', o: petals, dots: [[12, 8.8, 1.2]] },
  leaf: { name: '叶子', for: ['Leaf'], batch: 2, d: 'M5 19 C5 11 9.5 5 19.5 4.5 C19.5 14.5 14 19 6.5 19 M4 20.5 C7 15.5 10.5 12 15 9.5' },
  sprout: { name: '小苗', for: ['Sprout'], batch: 2, d: 'M12 20.5 L12 11 M12 13 C12 9.5 9.5 7.5 5 7.5 C5 11 7.5 13 12 13 M12 11 C12 7 14.5 4.5 19.5 4.5 C19.5 8.5 17 11 12 11 M8 20.5 L16 20.5' },
  mountain: { name: '山', for: ['Mountain'], batch: 2, d: 'M2.5 19.5 L9.5 5.5 L14 14 L16.5 10.5 L21.5 19.5 Z' },
  plane: { name: '飞机', for: ['Plane'], batch: 2, d: 'M12 3.5 C13 3.5 13.6 4.5 13.6 6 L13.6 9.5 L20.5 13.5 L20.5 15.5 L13.6 13.5 L13.6 17.5 L16 19.5 L16 20.8 L12 19.8 L8 20.8 L8 19.5 L10.4 17.5 L10.4 13.5 L3.5 15.5 L3.5 13.5 L10.4 9.5 L10.4 6 C10.4 4.5 11 3.5 12 3.5 Z' },
  cat: { name: '猫', for: ['Cat'], batch: 2, d: 'M5 5 L9 8.2 C11 7.6 13 7.6 15 8.2 L19 5 L19 14 C19 17.5 16 20 12 20 C8 20 5 17.5 5 14 Z M10.8 15.6 L12 16.5 L13.2 15.6', dots: [[9.3, 12.6, 0.95], [14.7, 12.6, 0.95]] },
  camera: { name: '相机', for: ['Camera'], batch: 2, d: 'M3.5 8 L7.5 8 L9 5.5 L15 5.5 L16.5 8 L20.5 8 L20.5 19 L3.5 19 Z', o: [[12, 13.2, 3.3]] },
  music: { name: '音乐', for: ['Music'], batch: 2, d: 'M9 18 L9 6.5 L19 4.5 L19 16', o: [[6.5, 18, 2.5], [16.5, 16, 2.5]] },
  headphones: { name: '耳机', for: ['Headphones'], batch: 2, d: 'M4.5 14 L4.5 12 C4.5 7.5 7.8 4.5 12 4.5 C16.2 4.5 19.5 7.5 19.5 12 L19.5 14', rect: [[4.5, 13.5, 3.5, 6, 1.5], [16, 13.5, 3.5, 6, 1.5]] },
  tv: { name: '电视', for: ['Tv'], batch: 2, d: 'M8 3.5 L12 7.5 L16 3.5', rect: [[3.5, 7.5, 17, 11.5, 2]] },
  'gamepad-2': { name: '游戏', for: ['Gamepad2'], batch: 2, d: 'M7.5 7.5 L16.5 7.5 C19 7.5 20.3 9 20.8 11.5 L21.5 15.5 C21.8 17.3 20.6 18.6 19 18.3 C18 18.1 17.3 17.2 16.5 16.2 L7.5 16.2 C6.7 17.2 6 18.1 5 18.3 C3.4 18.6 2.2 17.3 2.5 15.5 L3.2 11.5 C3.7 9 5 7.5 7.5 7.5 Z M6.5 12 L10 12 M8.25 10.25 L8.25 13.75', dots: [[15, 11, 0.95], [17.3, 13, 0.95]] },
  coffee: { name: '咖啡', for: ['Coffee'], batch: 2, d: 'M5 9 L17 9 L17 15 C17 17.5 15 19.5 12.5 19.5 L9.5 19.5 C7 19.5 5 17.5 5 15 Z M17 10.5 L18.5 10.5 C20 10.5 21 11.5 21 13 C21 14.5 20 15.5 18.5 15.5 L17 15.5 M8.5 3.5 L8.5 6 M12.5 3.5 L12.5 6' },
  utensils: { name: '吃饭', for: ['Utensils'], batch: 2, d: 'M7 3.5 L7 20.5 M4.5 3.5 L4.5 8 C4.5 9.5 5.5 10.5 7 10.5 C8.5 10.5 9.5 9.5 9.5 8 L9.5 3.5 M17.5 20.5 L17.5 3.5 C15.3 4.5 14 7 14 10 L14 13 L17.5 13' },
  'shopping-bag': { name: '买东西', for: ['ShoppingBag'], batch: 2, d: 'M5.5 8 L18.5 8 L19.5 20 L4.5 20 Z M9 10.5 L9 7 C9 5.2 10.3 4 12 4 C13.7 4 15 5.2 15 7 L15 10.5' },
  gift: { name: '礼物', for: ['Gift'], batch: 2, d: 'M5.5 13 L5.5 20 L18.5 20 L18.5 13 M12 9 L12 20 M12 9 C10 9 7.5 8.3 7.5 6.2 C7.5 4.8 8.6 4 9.6 4 C11.2 4 12 6.5 12 9 C12 6.5 12.8 4 14.4 4 C15.4 4 16.5 4.8 16.5 6.2 C16.5 8.3 14 9 12 9', rect: [[4, 9, 16, 4, 1]] },
  shirt: { name: '衣服', for: ['Shirt'], batch: 2, d: 'M8.5 4 L4 7 L6 11 L8 10 L8 20 L16 20 L16 10 L18 11 L20 7 L15.5 4 C15.2 5.5 13.8 6.5 12 6.5 C10.2 6.5 8.8 5.5 8.5 4 Z' },
  dumbbell: { name: '运动', for: ['Dumbbell'], batch: 2, d: 'M8 12 L16 12 M6 7 L6 17 M3.5 9.5 L3.5 14.5 M18 7 L18 17 M20.5 9.5 L20.5 14.5' },
  'graduation-cap': { name: '上学', for: ['GraduationCap'], batch: 2, d: 'M2.5 9.5 L12 5 L21.5 9.5 L12 14 Z M6.5 11.5 L6.5 16 C8 17.5 10 18.2 12 18.2 C14 18.2 16 17.5 17.5 16 L17.5 11.5 M21.5 9.5 L21.5 15' },
  code: { name: '代码', for: ['Code'], batch: 2, d: 'M8.5 7 L3.5 12 L8.5 17 M15.5 7 L20.5 12 L15.5 17 M13.5 5 L10.5 19' },
  wrench: { name: '工具', for: ['Wrench'], batch: 2, d: 'M20 6.5 L16.8 9.7 L14.3 7.2 L17.5 4 C15.5 3.2 13 3.8 11.7 5.5 C10.5 7 10.3 9 11 10.6 L3.8 17.8 C3 18.6 3 19.8 3.8 20.4 C4.5 21 5.6 21 6.3 20.2 L13.4 13 C15 13.7 17 13.5 18.5 12.3 C20.2 11 20.8 8.5 20 6.5 Z' },
  trophy: { name: '奖杯', for: ['Trophy'], batch: 2, d: 'M8 4 L16 4 L16 9.5 C16 12 14.2 13.8 12 13.8 C9.8 13.8 8 12 8 9.5 Z M8 5.5 L4.5 5.5 C4.5 8.5 5.8 10.2 8.2 10.5 M16 5.5 L19.5 5.5 C19.5 8.5 18.2 10.2 15.8 10.5 M12 13.8 L12 17.5 M8.5 20 L15.5 20 M9.5 20 C9.5 18.5 10.5 17.5 12 17.5 C13.5 17.5 14.5 18.5 14.5 20' },
  shapes: { name: '形状', for: ['Shapes'], batch: 2, d: 'M8 3.5 L12 10.5 L4 10.5 Z', rect: [[13.5, 13.5, 7, 7, 1.2]], o: [[7.5, 17, 3.5]] },
  // ---- batch 3：见字如面的格式条和左栏（v1.0 Phase 1，站主 2026-11-13 在云端画布上批） ----
  heading: { name: '标题', for: ['Heading'], batch: 3, d: 'M6.5 5 L6.5 19 M15.5 5 L15.5 19 M6.5 12 L15.5 12 M18.5 12.5 L20 11.5 L20 19' },
  bold: { name: '加粗', for: ['Bold'], batch: 3, d: 'M7 5 L7 19 M7 5 L12.8 5 C15.4 5 16.8 6.5 16.8 8.4 C16.8 10.4 15.4 11.8 12.8 11.8 L7 11.8 M12.8 11.8 L13.6 11.8 C16.6 11.8 18 13.5 18 15.4 C18 17.5 16.6 19 13.6 19 L7 19' },
  italic: { name: '斜体', for: ['Italic'], batch: 3, d: 'M10.5 5 L18 5 M6 19 L13.5 19 M14.3 5 L9.7 19' },
  underline: { name: '下划线', for: ['Underline'], batch: 3, d: 'M7 4.5 L7 11 C7 14.2 9.1 16.2 12 16.2 C14.9 16.2 17 14.2 17 11 L17 4.5 M5 20 L19 20' },
  strikethrough: { name: '删除线', for: ['Strikethrough'], batch: 3, d: 'M17.8 6.5 C14.8 2.8 6.1 3.7 6.2 7.7 Q6.2 9.2 8.2 9.9 M15.7 14.5 C21.7 18.7 11.1 22.7 6 17.8 M3 12.4 Q12 12.6 21 11.9' }, // Codex b28c553（站主 11-16 挑，0.9.0）
  highlighter: { name: '高亮', for: ['Highlighter'], batch: 3, d: 'M14 3.5 L20 9.5 L12.5 17 L6.5 11 Z M8 12.5 L4.5 16.5 L7.5 18.5 L11 15.5 M3.8 20.5 L18.5 20.5' }, // Argon 6e7bb6c（站主 11-16 挑，0.9.0）
  'code-block': { name: '代码块', for: ['SquareCode'], batch: 3, d: 'M9.8 9.2 L7.3 12 L9.8 14.8 M14.2 9.2 L16.7 12 L14.2 14.8', rect: [[3.5, 4.5, 17, 15, 3]] },
  list: { name: '列表', for: ['List'], batch: 3, d: 'M9 6.5 L20 6.5 M9 12 L20 12 M9 17.5 L20 17.5', dots: [[4.8, 6.5, 1.35], [4.8, 12, 1.35], [4.8, 17.5, 1.35]] },
  'list-ordered': { name: '编号', for: ['ListOrdered'], batch: 3, d: 'M4.5 5.6 L6 4.4 L6 9.4 M4.2 15.1 C4.2 13.9 5.1 13.3 6.2 13.3 C7.3 13.3 7.9 14 7.9 14.9 C7.9 15.9 7 16.6 5.6 17.6 L4.2 19.4 L8.1 19.4 M11.5 6 L20 6 M11.5 12 L20 12 M11.5 18 L20 18' }, // Argon 6e7bb6c（站主 11-16 挑，0.9.0）
  callout: { name: '提示框', for: ['MessageSquareWarning'], batch: 3, d: 'M4.5 20.5 L4.5 6 C4.5 4.6 5.6 3.5 7 3.5 L17.5 3.5 C18.9 3.5 20 4.6 20 6 L20 15 C20 16.4 18.9 17.5 17.5 17.5 L8 17.5 Z M12.25 7 L12.25 10.6', dots: [[12.25, 14.1, 1.05]] }, // Argon 6e7bb6c（站主 11-16 挑，0.9.0）
  divider: { name: '分隔线', for: ['SeparatorHorizontal'], batch: 3, d: 'M3 12.2 Q11.9 12.6 21 11.9 M9 5.3 L12 7.6 L15 5.2 M9.1 18.7 L12 16.4 L15.1 18.6' }, // Codex b28c553（站主 11-16 挑，0.9.0）
  wikilink: { name: '互链', for: ['Brackets'], batch: 3, d: 'M4.9 5.3 L2.7 5.3 L2.7 18.7 L4.9 18.7 M10 5.3 L7.3 5.3 Q7.5 12 7.3 18.7 L10 18.7 M14 5.3 L16.7 5.3 Q16.5 12 16.7 18.7 L14 18.7 M19.1 5.3 L21.3 5.3 L21.3 18.7 L19.1 18.7' }, // Codex b28c553（站主 11-16 挑，0.9.0）
  table: { name: '表格', for: ['Table'], batch: 3, d: 'M3.5 9.5 L20.5 9.5 M3.5 14.5 L20.5 14.5 M10 9.5 L10 19.5', rect: [[3.5, 4.5, 17, 15, 3]] },
  sigma: { name: '公式', for: ['Sigma'], batch: 3, d: 'M17.5 7 L17.5 5 L6.5 5 L12.6 12 L6.5 19 L17.5 19 L17.5 17' },
  flowchart: { name: '流程图', for: ['Workflow'], batch: 3, d: 'M7 10.5 L7 15.3 C7 16.5 8 17.5 9.2 17.5 L13.5 17.5', rect: [[3.5, 3.5, 7, 7, 1.8], [13.5, 13.5, 7, 7, 1.8]] }, // Argon 6e7bb6c（站主 11-16 挑，0.9.0）
  footnote: { name: '脚注', for: ['Superscript'], batch: 3, d: 'M3.5 9 L12 9 M3.5 13.5 L13.5 13.5 M3.5 18 L10 18 M16.5 5.2 L18.3 4 L18.3 10' },
  fold: { name: '折叠', for: ['ListCollapse'], batch: 3, d: 'M3.4 6.1 L6.2 9.1 L9 6.1 M3.4 17.9 L6.2 14.9 L9 17.9 M13 6 Q17.1 6.1 21 5.9 M13 12.1 L21 12 M13 18.1 L19.5 17.9' }, // Codex b28c553（站主 11-16 挑，0.9.0）
  'tag-off': { name: '没标签', for: ['TagOff'], batch: 3, d: 'M4 4.5 L11.5 4.5 L20 13 L13 20 L4 11.5 Z M3.5 20.5 L20.5 3.5', dots: [[7.7, 8.2, 1.1]] },
  'minimize-2': { name: '缩小', for: ['Minimize2'], batch: 3, d: 'M19.5 4.5 L14 10 M14 4.5 L14 10 L19.5 10 M4.5 19.5 L10 14 M10 19.5 L10 14 L4.5 14' },
};
export const UI_ICON_ORDER = Object.keys(UI_ICONS);

/** 名字算出来的种子：同一个图标永远是同一条线。 */
const seedOf = (id) => 300 + [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);

/** 一个界面小图标的 SVG 文件（24 格，线跟着 currentColor）。ic 是 tokens/handmade.json 的 uiIcon。和 paint.mjs 的 glyphSvg 同一种画法。 */
export function uiIconSvg(id, ic) {
  const { d = '', o = [], rect = [], dots = [], name } = UI_ICONS[id];
  const seed = seedOf(id);
  const sw = { amp: ic.amp, wave: ic.wave, sp: ic.sp, keep: ic.keep };
  let path = d ? handStroke(P(d), { ...sw, seed }) : '';
  o.forEach(([cx, cy, r], i) => { path += handStroke(circle(cx, cy, r), { ...sw, seed: seed + 1 + i, over: ic.over }); });
  rect.forEach(([x, y, w, h, r], i) => { path += handStroke(rrect(x, y, w, h, r), { ...sw, seed: seed + 11 + i, over: ic.over }); });
  const dot = dots.map(([cx, cy, r], i) => handFill(circle(cx, cy, r), { amp: 0.1, seed: seed + 21 + i })).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-label="${name}">${path ? `<path d="${path}" stroke="currentColor" stroke-width="${ic.line}" stroke-linecap="round" stroke-linejoin="round"></path>` : ''}${dot ? `<path d="${dot}" fill="currentColor"></path>` : ''}</svg>\n`;
}
