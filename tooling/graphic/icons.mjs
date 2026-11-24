// 内容图标：写进网站内容（Markdown 正文与 frontmatter 文字字段）、替代 Emoji 的常用图标（DESIGN.md §6，VL1 Phase 8）。
// 画法是「简笔加纸片」（站主 2026-11-02 选定）：64 网格，一张纸片 + 1–2 笔光洁的笔势，笔势用结构色，与分类图形同一规则。
// 每个图标：name（Markdown 写法 :name:）、中英文标签与关键词、paper（纸片中心与半径）、strokes（[中心线, 最粗处宽, 收笔]）。
// 显示在正文字号（约 1.2em）里，笔比分类图形简笔版略粗（6–10.5），小字号下才分得清。
import { circlePts } from './geometry.mjs';

/** 椭圆弧上的点列：中心、半轴、旋转角（度）、起止角（弧度）。 */
function ellPts(cx, cy, rx, ry, rot, a0, a1, n = 16) {
  const r = (rot * Math.PI) / 180, out = [];
  for (let i = 0; i <= n; i++) {
    const t = a0 + ((a1 - a0) * i) / n;
    const x = rx * Math.cos(t), y = ry * Math.sin(t);
    out.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return out;
}
// 很短很粗的一笔，当作点（感叹号、问号下面的点）
const dot = (x, y, w = 10.5) => [[[x - 1.8, y - 0.8], [x + 1.8, y + 0.8]], w, 'sym'];
// 圆角方框（信封、日历、屏幕、行李箱）：沿四边取点，Catmull-Rom 把角磨圆
// 五角星的轮廓：从顶角出发顺时针绕一圈，外角与内角交替
const star = (cx, cy, ro, ri) => Array.from({ length: 11 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? ri : ro;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
const box = (x0, y0, x1, y1) => [[x0, y0], [(x0 + x1) / 2, y0 - 0.5], [x1, y0], [x1 + 1, (y0 + y1) / 2], [x1, y1], [(x0 + x1) / 2, y1 + 0.5], [x0, y1], [x0 - 1, (y0 + y1) / 2], [x0, y0 + 1]];

export const CONTENT_ICONS = [
  // 提示与状态
  { name: 'tip', zh: '提示', en: 'Tip', keywords: { zh: ['提示', '说明', '须知'], en: ['tip', 'notice', 'note', 'info'] },
    paper: [36, 33, 24], strokes: [[[[32, 9], [32, 24], [32, 40]], 9, 'head'], dot(32, 51.5)] },
  { name: 'caution', zh: '注意', en: 'Caution', keywords: { zh: ['注意', '警告', '小心'], en: ['caution', 'warning'] },
    paper: [29, 39, 23], strokes: [[[[14, 51], [22, 34], [32, 13], [42, 33], [50, 50], [32, 51.5], [13, 51]], 7, 'sym'], [[[32, 25], [32, 33], [32, 41]], 7.6, 'head']] },
  { name: 'idea', zh: '想法', en: 'Idea', keywords: { zh: ['想法', '灵感', '点子'], en: ['idea', 'insight'] },
    paper: [35, 30, 23], strokes: [[[[25, 45], [19, 36], [15, 25], [19, 14], [32, 8.5], [45, 14], [49, 25], [45, 36], [39, 45]], 7.2, 'sym'], [[[24, 53.5], [32, 52.5], [40, 53.5]], 7.2, 'sym']] },
  { name: 'done', zh: '完成', en: 'Done', keywords: { zh: ['完成', '已完成', '对勾'], en: ['done', 'check', 'complete'] },
    paper: [28, 36, 23], strokes: [[[[11, 33], [19, 40], [26, 47], [38, 33], [54, 15]], 9, 'sym']] },
  { name: 'wip', zh: '进行中', en: 'In progress', keywords: { zh: ['进行中', '未完成', '完善中'], en: ['in progress', 'wip', 'ongoing'] },
    paper: [29, 35, 23], strokes: [[circlePts(32, 32, 21, -Math.PI / 2 + 0.35, -Math.PI / 2 + 0.35 + 4.6, 20), 7.6, 'tail'], dot(32, 32, 10)] },
  { name: 'question', zh: '疑问', en: 'Question', keywords: { zh: ['疑问', '问题'], en: ['question', 'ask'] },
    paper: [36, 32, 23], strokes: [[[[19, 21], [23, 12], [33, 8.5], [43, 12.5], [46, 21], [41, 29], [34, 34], [32, 42]], 8, 'tail'], dot(32, 52)] },
  // 信息
  { name: 'link', zh: '链接', en: 'Link', keywords: { zh: ['链接', '网址'], en: ['link', 'url'] },
    paper: [34, 34, 24], strokes: [[ellPts(24, 40, 15, 8.5, -45, 0.55, 0.55 + 5.4, 18), 7, 'head'], [ellPts(40, 24, 15, 8.5, -45, 3.69, 3.69 + 5.4, 18), 7, 'head']] },
  { name: 'place', zh: '地点', en: 'Place', keywords: { zh: ['地点', '位置', '地图'], en: ['place', 'location', 'map'] },
    paper: [37, 30, 22], strokes: [[[[32, 57], [22, 43], [15, 29], [17, 16], [26, 9], [38, 9], [47, 16], [49, 29], [42, 43], [33, 56]], 7.6, 'sym'], [circlePts(32, 26, 6.5, -2, -2 + 5.6, 12), 5.6, 'head']] },
  { name: 'time', zh: '时间', en: 'Time', keywords: { zh: ['时间', '钟点'], en: ['time', 'clock'] },
    paper: [28, 30, 23], strokes: [[circlePts(32, 33, 22, -1.9, -1.9 + 5.9, 22), 7.6, 'head'], [[[32, 19], [32, 26], [32, 33], [43, 40]], 6.4, 'tail']] },
  { name: 'date', zh: '日期', en: 'Date', keywords: { zh: ['日期', '日历'], en: ['date', 'calendar'] },
    paper: [29, 40, 23], strokes: [[[[20, 7], [20, 15], [14, 15], [10, 17], [9.5, 35], [10, 54], [32, 54.5], [54, 54], [54.5, 35], [54, 17], [50, 15], [44, 15], [44, 7]], 6.6, 'sym'], [[[11, 26], [32, 25.5], [53, 26]], 6.6, 'sym']] },
  { name: 'mail', zh: '邮件', en: 'Mail', keywords: { zh: ['邮件', '邮箱'], en: ['mail', 'email'] },
    paper: [35, 36, 23], strokes: [[box(10, 17, 54, 48), 6.6, 'sym'], [[[12, 20], [22, 29], [32, 35], [42, 29], [52, 20]], 6.4, 'sym']] },
  { name: 'download', zh: '下载', en: 'Download', keywords: { zh: ['下载', '文件'], en: ['download', 'file'] },
    paper: [30, 36, 23], strokes: [[[[32, 8], [32, 24], [32, 42]], 8, 'head'], [[[18, 30], [25, 37], [32, 44], [39, 37], [46, 30]], 7.2, 'sym']] },
  // 生活与创作
  { name: 'book', zh: '读书', en: 'Book', keywords: { zh: ['书', '阅读', '读书'], en: ['book', 'reading'] },
    paper: [34, 37, 23], strokes: [[[[32, 50], [22, 45.5], [9, 47], [8.5, 32], [9, 18], [21, 16], [32, 21.5]], 6.8, 'sym'], [[[32, 21.5], [43, 16], [55, 18], [55.5, 32], [55, 47], [42, 45.5], [32, 50]], 6.8, 'sym']] },
  { name: 'music', zh: '音乐', en: 'Music', keywords: { zh: ['音乐', '歌'], en: ['music', 'song'] },
    paper: [34, 34, 23], strokes: [[[[51, 26], [50, 16], [41, 10], [40, 26], [40, 44]], 6.8, 'sym'], [[[25, 47], [30, 45], [36, 44.5]], 12.5, 'sym']] },
  { name: 'film', zh: '影视', en: 'Film', keywords: { zh: ['电影', '视频', '剧'], en: ['film', 'video', 'movie'] },
    paper: [35, 36, 23], strokes: [[box(9, 14, 55, 50), 6.4, 'sym'], [[[26, 22], [34, 27], [42, 32], [34, 37], [26, 42], [25.5, 32], [26, 23]], 6.4, 'sym']] },
  { name: 'photo', zh: '摄影', en: 'Photo', keywords: { zh: ['照片', '相机', '摄影'], en: ['photo', 'camera'] },
    paper: [29, 38, 23], strokes: [[[[9, 23], [19, 22.5], [24, 14], [40, 14], [45, 22.5], [55, 23], [55.5, 37], [55, 51], [32, 51.5], [9, 51], [8.5, 37], [9, 24]], 6.4, 'sym'], [circlePts(32, 36, 9, -2, -2 + 5.9, 14), 6, 'head']] },
  { name: 'paint', zh: '绘画', en: 'Painting', keywords: { zh: ['画', '绘画', '画画'], en: ['painting', 'drawing', 'art'] },
    paper: [31, 38, 23], strokes: [[[[54, 8], [46, 19], [37, 32]], 8.4, 'tail'], [[[8, 50], [17, 43], [27, 49], [38, 42]], 7.6, 'sym']] },
  { name: 'food', zh: '美食', en: 'Food', keywords: { zh: ['美食', '吃', '餐'], en: ['food', 'meal'] },
    paper: [35, 40, 23], strokes: [[[[8, 30], [32, 30], [56, 30], [51, 44], [32, 52], [13, 44], [8.5, 31]], 7, 'sym'], [[[28, 24], [24, 18], [28, 12], [25, 7]], 5.4, 'sym']] },
  { name: 'heart', zh: '喜欢', en: 'Like', keywords: { zh: ['喜欢', '爱'], en: ['like', 'love', 'heart'] },
    paper: [29, 31, 23], strokes: [[[[32, 54], [19, 41], [10, 29], [12, 18], [21, 12.5], [29, 16.5], [32, 23], [35, 16.5], [43, 12.5], [52, 18], [54, 29], [45, 41], [33, 53]], 8.2, 'head']] },
  { name: 'star', zh: '推荐', en: 'Recommended', keywords: { zh: ['推荐', '亮点', '星'], en: ['recommended', 'highlight', 'star'] },
    paper: [36, 37, 22], strokes: [[star(32, 34, 25, 11), 6.6, 'sym']] },
  { name: 'code', zh: '代码', en: 'Code', keywords: { zh: ['代码', '编程'], en: ['code', 'programming'] },
    paper: [32, 37, 23], strokes: [[[[25, 17], [17, 25], [11, 32], [17, 39], [25, 47]], 7.2, 'sym'], [[[39, 17], [47, 25], [53, 32], [47, 39], [39, 47]], 7.2, 'sym']] },
  { name: 'trip', zh: '出行', en: 'Trip', keywords: { zh: ['出行', '旅行', '行李'], en: ['trip', 'travel', 'luggage'] },
    paper: [35, 40, 23], strokes: [[box(10, 22, 54, 52), 6.6, 'sym'], [[[24, 21], [24.5, 14], [32, 12.5], [39.5, 14], [40, 21]], 6, 'sym']] },
  { name: 'flag', zh: '目标', en: 'Goal', keywords: { zh: ['目标', '里程碑'], en: ['goal', 'milestone', 'flag'] },
    paper: [37, 27, 22], strokes: [[[[16, 57], [16, 32], [16, 8]], 6.4, 'tail'], [[[18, 11], [28, 7], [38, 13], [50, 9], [50, 20], [50, 31], [38, 35], [28, 29], [18, 33]], 6.4, 'sym']] },
  { name: 'pen', zh: '写作', en: 'Writing', keywords: { zh: ['写作', '笔记', '写'], en: ['writing', 'notes', 'pen'] },
    paper: [35, 31, 23], strokes: [[[[13, 51], [25, 37], [38, 22], [51, 9]], 8.4, 'tail'], [[[12, 57], [24, 56], [36, 55]], 5, 'sym']] },
];
