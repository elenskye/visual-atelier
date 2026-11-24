// Tabloid：一份编的「呈现结果」（审看用，形状和 Pomelo 存的一样，见 ../README.md「数据」）。数据全是编的。
// sampleYear({ partial, skip, other })：partial 今年没过完；skip 去掉几幕（'made' 去掉全部自建模块）；other 换一年聊的话题（看通用的泡泡）。
import { rng } from '../../../../tooling/handmade/line.mjs';

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const pad = (n) => String(n).padStart(2, '0');
const SPECIAL = { '2-9': 8, '3-2': 7, '3-14': 8, '5-20': 9, '7-8': 9, '9-15': 5, '10-1': 6, '11-1': 7 };

function heat(until) {
  const r = rng(2026);
  const busy = [0.56, 0.6, 0.86, 0.64, 0.7, 0.74, 0.6, 0.5, 0.64, 0.7, 0.72, 0.62];
  const out = [];
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= MONTH_DAYS[m - 1]; d++) {
    const a = r(), bb = r(), c = r();
    let n = a < busy[m - 1] ? 1 + Math.floor(Math.pow(bb, 2.3) * 6) + (m === 3 ? 1 : 0) : 0;
    if (SPECIAL[`${m}-${d}`]) n = SPECIAL[`${m}-${d}`];
    const day = `2026-${pad(m)}-${pad(d)}`;
    if (n && (!until || day <= until)) out.push({ day, notes: Math.max(c < 0.25 ? 0 : 1, Math.round(n * (0.45 + c * 0.4))), all: n });
  }
  return out;
}

const NOTES = [
  ['note:1', '2026-11-01', '周末想去看海，顺路买一袋柚子。要是下雨，就在家把那本《海边的柚子树》读完。'],
  ['note:2', '2026-03-14', '柚子茶终于不酸了，加了两勺蜂蜜，泡了一大罐，够喝到四月。'],
  ['note:3', '2025-03-14', '第一次自己做柚子茶，太酸了。下次少放点皮，多放蜂蜜。'],
  ['note:4', '2026-05-20', '第一次一个人到海边。买了一袋柚子，坐在礁石上吃完了。'],
  ['note:5', '2026-07-08', '收到 Offer 的邮件，在楼下转了三圈才上楼。'],
  ['note:6', '2026-02-09', '外婆做了一桌菜，回来胖了一斤。忘了带充电线。'],
  ['note:7', '2026-10-01', '爬到山顶的时候起雾了，什么都没看见，但是很开心。'],
];
const BOOKS = ['海边的柚子树', '山里的夏天', '慢慢来', '一个人的厨房', '猫的事', '小画册', '雨天书店', '种一棵树', '夜航', '手账的一年', '面包与汤', '远方的信'];
const FILMS = ['柚子与海', '慢车', '厨房里的人', '山那边', '夏天的尾巴', '第二碗面'];
const TALKS = [['番茄炒蛋先放哪个', '2026-06-03'], ['一周的便当怎么排', '2026-06-20'], ['面试自我介绍', '2026-04-11'], ['作品集的顺序', '2026-05-02'], ['去海边带什么', '2026-05-12'], ['山里住哪', '2026-09-20'], ['这段代码为什么慢', '2026-03-08'], ['猫不吃冻干', '2026-09-16'], ['两点还醒着', '2026-08-02']];

// 写下的字（1.1.1）：见字如面这一年
const WRITING = {
  n: 46, chars: 61840, last: { n: 31, chars: 40210 }, untagged: 5,
  months: [2, 3, 7, 4, 5, 3, 2, 1, 4, 6, 5, 4],
  tags: [
    { name: '旅行', n: 14, kids: [{ name: '东京', n: 6 }, { name: '海边', n: 3 }, { name: '古镇', n: 2 }] },
    { name: '学习和编程', n: 11, kids: [{ name: 'rust', n: 5 }, { name: '设计', n: 3 }] },
    { name: '生活', n: 9, kids: [{ name: '做饭', n: 4 }] },
    { name: '读书', n: 7, kids: [{ name: '小说', n: 3 }] },
    { name: '工作', n: 5, kids: [] },
  ],
};
const ARTICLES = [
  ['article:12', '2026-10-14', '东京的第三天', ['旅行/东京'], '旅行的意义，是把日常换一个地方过。'],
  ['article:3', '2026-03-18', '第一次自己修好自行车', ['生活'], '链条装回去的那一下，手上全是油，心里很亮。'],
  ['article:20', '2026-06-02', '写完第一个小工具', ['学习和编程/rust'], '编译器终于不骂我了，它说的都对。'],
  ['article:31', '2026-08-21', '外婆的菜园', ['生活'], '她把最红的那个番茄留给我，说城里买不到这个味道。'],
  ['article:44', '2026-11-28', '第一场雪', ['生活'], '下班路上下了今年第一场雪，我在路灯下站了很久。'],
];

const LETTER = `**这一年的关键词**：柚子 · 海 · 慢慢来

见字如面。这一年你走得不快，但每一步都留下了字。

## 这一年的数字

- 笔记：644 条，三月记得最多，八月最少
- 做完的事：312 件
- 出行：3 次

## 去过的地方

你去了外婆家、海边和山里。山顶起雾了，什么都没看见，你在笔记里写「但是很开心」。我很喜欢这一句。

## 求职这一年

从春天走到夏天：投了 38 份，笔试、面试一场一场过去，**七月等到了那封邮件**。

## 你写下的话

> 但是很开心（6 月 2 日）
> 慢慢来，比较快（9 月 18 日）

## 写给明年

也慢慢来。我一直在这儿。`;

function weeks(seed, days, from, longest) {
  const r = rng(seed), out = Array.from({ length: 53 }, () => (r() < days / 150 ? (r() < 0.5 ? 6 : 3) : 0));
  const at = Math.floor((from - 1) / 7);
  for (let i = at; i < at + Math.ceil(longest / 7) && i < 53; i++) out[i] = 7;
  return out;
}

// 玩物有志（1.1.0）：这一年通关的七个，雾港侦探是二周目
const GAMES = [
  ['雾港侦探', 'Switch', '解谜', 5, 2], ['纸飞机邮差', 'Steam', '冒险', 4, 1], ['深海食堂', 'Switch', '模拟经营', 4, 1], ['月面菜园', 'PC', '模拟经营', 3, 1],
  ['方块山谷', '手机', '解谜', 4, 1], ['猫咪旅馆', 'Switch', '解谜', 3, 1], ['慢车旅人', 'PS5', '冒险', 5, 1],
].map(([title, platform, kind, rating, runs], i) => ({ key: `game:${i + 1}`, title, platform, kind, rating, runs }));

// 自建模块（1.1.0）：清单「咖啡馆」、进度「日语」、带数字的清单「爬过的山」。排法和零件里的数照 Pomelo `youzi/made.rs` 填好的样子写
const item = (mod, id, title, day, values = {}) => ({ key: `${mod}:${id}`, title, day, values });
const MADE = [
  {
    key: 'list/3', name: '咖啡馆', template: 'list', icon: 'coffee', mark: 'coffee', courseWord: '', lessonWord: '',
    fields: [{ name: '评分', kind: 'rating' }, { name: '区域', kind: 'select' }, { name: '招牌', kind: 'multi' }, { name: '备注', kind: 'longtext' }],
    items: [item('list/3', 41, '江边的小窗咖啡', '2026-03-02', { 评分: 5, 区域: '江边', 招牌: ['手冲', '可颂'], 备注: '江边那家的可颂，值得为它早起。' }), item('list/3', 42, '老城一号', '2026-06-11', { 评分: 4, 区域: '老城', 招牌: ['拿铁'] }), item('list/3', 43, '学校后门', '2026-09-01', { 评分: 3, 区域: '学校附近', 招牌: ['手冲'] })],
    courses: [], months: [1, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 1], n: 23, last: 15,
    quotes: [{ key: 'list/3:41', text: '江边那家的可颂，值得为它早起。', from: '备注 · 江边的小窗咖啡' }],
    plan: { layout: 'pair', parts: [
      { slot: 'A', part: 'big', data: { label: '这一年记了', n: 23, unit: '条', last: 15 } },
      { slot: 'B', part: 'stars', data: { label: '最喜欢的', items: [{ key: 'list/3:41', title: '江边的小窗咖啡', rating: 5 }, { key: 'list/3:42', title: '老城一号', rating: 4 }, { key: 'list/3:43', title: '学校后门', rating: 3 }] } },
      { slot: 'S', part: 'months', data: { label: '每个月记的', values: [1, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 1], unit: '条' } },
      { slot: 'Q', part: 'quote', data: { key: 'list/3:41', text: '江边那家的可颂，值得为它早起。', from: '备注 · 江边的小窗咖啡' } },
    ] },
    // 柚子排的
    laid: { lines: ['江边那家你去了最多次，可颂值得为它早起。'], plan: { layout: 'pair', parts: [
      { slot: 'A', part: 'big', data: { label: '这一年新去了', n: 23, unit: '家', last: 15 } },
      { slot: 'B', part: 'dist', data: { label: '区域', rows: [{ name: '江边', n: 9 }, { name: '老城', n: 7 }, { name: '学校附近', n: 4 }, { name: '其他', n: 3 }] } },
      { slot: 'S', part: 'months', data: { label: '每个月新去的', values: [1, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 1], unit: '家' } },
      { slot: 'Q', part: 'quote', data: { key: 'list/3:41', text: '江边那家的可颂，值得为它早起。', from: '备注 · 江边的小窗咖啡' } },
    ] } },
  },
  {
    key: 'progress/2', name: '日语', template: 'progress', icon: 'graduation-cap', mark: 'grad', courseWord: '课本', lessonWord: '课',
    fields: [], items: [],
    courses: [{ key: 'progress/2:21', name: '大家的日语 初级 1', done: 25, total: 25, year: 18, finished: '2026-06' }, { key: 'progress/2:22', name: '大家的日语 初级 2', done: 13, total: 25, year: 13, finished: null }, { key: 'progress/2:23', name: '听力练习', done: 18, total: 30, year: 18, finished: null }],
    months: [6, 5, 7, 4, 6, 9, 2, 1, 3, 2, 3, 1], n: 49, last: 20,
    quotes: [{ key: 'progress/2:22', text: '第一次听懂了便利店店员说的整句话，出门时脚步都轻了。', from: '大家的日语 初级 2 · 第 31 课' }],
    plan: { layout: 'hero', parts: [
      { slot: 'H', part: 'courses', data: { label: '这一年学的课本', unit: '课', items: [] } },
      { slot: 'S', part: 'months', data: { label: '每个月学完的', values: [6, 5, 7, 4, 6, 9, 2, 1, 3, 2, 3, 1], unit: '课' } },
      { slot: 'Q', part: 'quote', data: { key: 'progress/2:22', text: '第一次听懂了便利店店员说的整句话，出门时脚步都轻了。', from: '大家的日语 初级 2 · 第 31 课' } },
    ] },
    laid: { lines: ['初级 1 在六月学完了，初级 2 也过了一半。'] },
  },
  {
    key: 'list/6', name: '爬过的山', template: 'list', icon: 'mountain', mark: 'mountain', courseWord: '', lessonWord: '',
    fields: [{ name: '公里', kind: 'number' }, { name: '评分', kind: 'rating' }, { name: '和谁', kind: 'multi' }],
    items: [item('list/6', 3, '雾岭', '2026-10-01', { 公里: 12, 评分: 5, 和谁: ['一个人'] }), item('list/6', 1, '十里山', '2026-03-21', { 公里: 14, 评分: 5, 和谁: ['朋友'] }), item('list/6', 8, '东湖绿道', '2026-05-04', { 公里: 8, 评分: 4, 和谁: ['一个人', '猫'] })],
    courses: [], months: [0, 1, 2, 1, 2, 0, 0, 0, 1, 2, 0, 0], n: 9, last: 4, quotes: [],
    plan: { layout: 'pair', parts: [] },
    laid: { lines: ['九座山加起来走了好远，差不多从家走到了海边。'], plan: { layout: 'pair', parts: [
      { slot: 'A', part: 'sum', data: { label: '公里', rows: [['十里山', 14], ['雾岭', 12], ['东湖绿道', 8], ['还有 6 座', 52]], total: 86, unit: '公里' } },
      { slot: 'B', part: 'chips', data: { label: '和谁', rows: [{ name: '一个人', n: 6 }, { name: '朋友', n: 3 }, { name: '猫', n: 1 }] } },
      { slot: 'S', part: 'months', data: { label: '每个月爬的', values: [0, 1, 2, 1, 2, 0, 0, 0, 1, 2, 0, 0], unit: '座' } },
      { slot: 'Q', part: 'cards', data: { items: [{ key: 'list/6:3', title: '雾岭', sub: ['10 月 1 日 · 12 公里'], rating: 5 }, { key: 'list/6:1', title: '十里山', sub: ['3 月 21 日 · 14 公里'], rating: 5 }, { key: 'list/6:8', title: '东湖绿道', sub: ['5 月 4 日 · 8 公里'], rating: 4 }] } },
    ] } },
  },
];
// 日语的默认排法：H 是这一年学的几门
MADE[1].plan.parts[0].data.items = MADE[1].courses;
MADE[1].laid.plan = MADE[1].plan;
MADE[2].plan = MADE[2].laid.plan;

export function sampleYear({ partial = false, skip = [], other = false } = {}) {
  const until = partial ? '2026-11-10' : null;
  const records = [
    ...NOTES.map(([key, day, text]) => ({ key, kind: 'note', day, text })),
    ...ARTICLES.map(([key, day, text, tags]) => ({ key, kind: 'article', day, text, tags })),
    { key: 'trip:1', kind: 'trip', day: '2026-02-09', text: '回外婆家' },
    { key: 'goal:1', kind: 'goal', day: '2026-03-02', text: '每天背 20 个单词' },
    { key: 'trip:2', kind: 'trip', day: '2026-05-20', text: '一个人去看海' },
    { key: 'offer:1', kind: 'offer', day: '2026-07-08', text: '柚子科技 · 视觉设计' },
    { key: 'day:1', kind: 'day', day: '2026-09-15', text: '猫猫来家（3 周年）' },
    { key: 'trip:3', kind: 'trip', day: '2026-10-01', text: '进山' },
    ...BOOKS.map((t, i) => ({ key: `book:${i + 1}`, kind: 'book', day: null, text: `《${t}》` })),
    ...FILMS.map((t, i) => ({ key: `film:${i + 1}`, kind: 'film', day: null, text: `《${t}》` })),
    { key: 'course:1', kind: 'course', day: null, text: '风景速写（这一年画完 15 节）' },
    { key: 'course:2', kind: 'course', day: null, text: '水彩入门（这一年画完 16 节）' },
    ...TALKS.map(([t, day], i) => ({ key: `talk:${i + 1}`, kind: 'talk', day, text: t })),
    ...GAMES.map((g) => ({ key: g.key, kind: 'game', day: null, text: `《${g.title}》` })),
    ...MADE.flatMap((m) => [...m.items.map((it) => ({ key: it.key, kind: 'made', day: it.day, text: it.title })), ...m.courses.map((c) => ({ key: c.key, kind: 'made', day: null, text: c.name }))]),
  ].filter((r) => !until || !r.day || r.day <= until);
  const N = (label, unit, n, last) => ({ label, unit, n, last });
  const topics = other
    ? [{ name: '感情', kind: 'love', n: 38 }, { name: '理财', kind: 'money', n: 27 }, { name: '论文', kind: 'study', n: 21 }, { name: '塔罗', kind: 'other', n: 16 }, { name: '健身', kind: 'health', n: 12 }, { name: '搬家', kind: 'other', n: 8 }]
    : [{ name: '做饭', kind: 'cook', n: 42, refs: ['talk:1', 'talk:2'] }, { name: '面试', kind: 'work', n: 31, refs: ['talk:3', 'talk:4'] }, { name: '旅行', kind: 'travel', n: 24, refs: ['talk:5', 'talk:6'] }, { name: '代码', kind: 'code', n: 22, refs: ['talk:7'] }, { name: '猫', kind: 'pet', n: 18, refs: ['talk:8'] }, { name: '睡不着', kind: 'sleep', n: 9, refs: ['talk:9'] }];
  const scenes = [
    // 粉星：柚子挑的触动的几条（Offer 那天也是最亮的一天；猫猫来家那天只有一条记录；山顶起雾；想去看海）
    { key: 'prologue', lines: ['最亮的几天和让你心动的几天连起来，像一只歪歪的柚子。点一颗星，看看那天。'], refs: ['note:5', 'day:1', 'note:7', 'note:1'] },
    { key: 'days', lines: ['三月的线最密，那阵子你什么都想记下来。'], refs: ['note:1'] },
    { key: 'writing', lines: [], refs: [] },
    { key: 'writing-moments', lines: ['这一年有一半是在路上写的。明年也多写写平常的日子吧：平常的那些，过几年再读最好看。'], refs: ARTICLES.map((a) => a[0]).filter((k) => !until || ARTICLES.find((a) => a[0] === k)[1] <= until), quotes: ARTICLES.map(([key, , , , q]) => ({ key, text: q })) },
    { key: 'works', lines: ['书和电影只记了年份，就不排先后了，都摆在这儿。'], refs: ['book:1', 'film:1'] },
    { key: 'games', lines: ['雾港侦探你通关了两次，第二次是为了那只猫。'], refs: ['game:1'] },
    { key: 'moments', lines: [], refs: ['trip:1', 'goal:1', 'trip:2', 'offer:1', 'day:1', 'trip:3'] },
    { key: 'echo', lines: ['同一天，同一罐柚子茶，今年的甜一点。'], refs: ['note:2', 'note:3'] },
    { key: 'drawing', lines: ['最后一节画了一颗柚子，黄得有点过头。'], refs: ['course:2'] },
    { key: 'jobs', lines: ['一块石头一块石头地跳，夏天跳到了对岸。'], refs: ['offer:1'] },
    { key: 'habits', lines: ['背单词最长的那一段，一天都没断。'], refs: [] },
    { key: 'talks', lines: [other ? '想清楚的事，都是慢慢聊出来的。' : '番茄炒蛋先放哪个，你问过我五次。'], refs: ['talk:1'], topics },
    { key: 'money', lines: ['吃得不错，存得也不错。'], refs: [] },
    { key: 'finale', lines: ['见字如面。', '这一年你留下了 644 条笔记，做完了 312 件事。三月记得最多，八月最少，那阵子你大概在忙着画那颗黄得过头的柚子。', '你去了外婆家、海边和山里。山顶起雾了，什么都没看见，你在笔记里写「但是很开心」。我很喜欢这一句。', '明年也慢慢来。我一直在这儿。'], refs: [] },
    ...MADE.map((m) => ({ key: m.key, lines: m.laid.lines, refs: [], plan: m.laid.plan })),
  ].filter((s) => !skip.includes(s.key) && !(skip.includes('made') && s.key.includes('/')));
  return {
    id: 1, year: '2026', until, createdAt: partial ? '2026-11-10T13:00:00.000Z' : '2026-12-31T13:20:00.000Z', design: 'tabloid@1.0.0', modelName: '（编的）',
    letter: LETTER,
    snapshot: {
      year: '2026', until,
      numbers: [N('笔记', '条', 644, 432), N('笔记的字数', '字', 51200, 30100), N('写了笔记的日子', '天', 248, 170), N('做完的事', '件', 312, 268), N('做完的目标', '个', 3, 1), N('打卡', '天', 214, 96), N('读完的书', '本', 12, 15), N('看完的电影和剧', '部', 23, 19), N('画完的课节', '节', 31, 0), N('有进展的投递', '份', 38, 0), N('拿到的工作', '份', 2, 0), N('出行', '次', 3, 2), N('和柚子的对话', '个', 186, 77)],
      extras: ['写笔记最多的月份：3 月（89 条）'],
      heat: heat(until),
      habits: [{ title: '背单词', days: 86, longest: 41, longestFrom: '2026-02-19', weeks: weeks(1901, 86, 50, 41) }, { title: '拉伸', days: 74, longest: 16, longestFrom: '2026-01-22', weeks: weeks(1902, 74, 22, 16) }, { title: '十点半睡', days: 54, longest: 9, longestFrom: '2026-02-05', weeks: weeks(1903, 54, 36, 9) }],
      money: { spent: [{ currency: 'CNY', kind: '吃饭', amount: 2864000 }, { currency: 'CNY', kind: '住', amount: 2400000 }, { currency: 'CNY', kind: '出门', amount: 1230000 }, { currency: 'CNY', kind: '买书买课', amount: 648000 }, { currency: 'CNY', kind: '其他', amount: 1500000 }], income: [['CNY', 14400000]], assets: { fromDay: '2026-01-01', from: 10000000, toDay: until || '2026-12-31', to: 11800000 } },
      records,
      echo: [{ day: '03-14', this: ['note:2'], last: ['note:3'] }],
      jobStages: [{ label: '投出', n: 38, unit: '份' }, { label: '笔试', n: 14, unit: '场' }, { label: '面试', n: 9, unit: '场' }, { label: 'Offer', n: 2, unit: '个', got: true }],
      offered: scenes.map((s) => s.key),
      games: skip.includes('games') ? [] : GAMES,
      gamesLast: 5,
      writing: skip.includes('writing') ? null : WRITING,
      made: skip.includes('made') ? [] : MADE.map(({ laid, ...m }) => m),
    },
    scenes,
    error: null,
  };
}
