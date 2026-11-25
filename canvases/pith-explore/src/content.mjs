// EX6（页 id ex7）共用的内容，从 EX5 复制，知识库补齐了每一种记录（站主 11-23：每种类型都做一种卡片），文献库加了几本真书好放进表格。
// 原注：EX4 四个方向共用的内容：同一条任务、同一批书和知识库（Pith 仓库 docs/atelier-handoff-2026-11-22.md 5.2）。
// 书、论文、作者、年份、刊物是真的；斯密的三句和 Young 的一句是原话（WN I.iii.1–3）；对话、笔记、摘抄、日期是演示用的。

/** 第一问：用 # 选了「读《国富论》」，角色是伴读。 */
export const Q = '斯密为什么说分工受市场范围限制？';
/** 第二问：@审稿人。 */
export const RQ = '@审稿人 这个解释站得住吗？';

export const STATUS = ['在「读《国富论》」里找了 6 段', '读了第一篇第三章的 3 段', '又看了你记的 Stigler 摘抄'];
export const REV_STATUS = '联网查了 Young 1928，快照存进「读《国富论》」';

/** 回答：[n] 是引用编号。最后一段是伴读的反问。 */
export const ANSWER = [
  '斯密的推理只有一步：分工是因为能交换才出现的，所以分工能有多细，就看能交换多少，也就是市场有多大[1]。',
  '市场太小，一个人就没法只干一件事。他举苏格兰高地的散村：农夫得给自家当屠夫、面包师和酿酒人[2]。所以他紧接着讲水运：水路把市场一下子扩大，分工和改良最先出现在沿海和通航的河边[3]。',
  '一百多年后，Stigler 把这句话用到了企业上：行业刚起步、市场还小，企业只好什么都自己做；行业长大了，专门的环节才分出去，成了独立的厂家[4]。',
];
export const ASK_BACK = '想一想：今天的网购，算不算又把「市场」扩大了一次？';

export const REV_ANSWER = {
  verbose: '大体站得住，有两处可以再追。一，高地散村是斯密的观察，不是统计[2]，拿来当证据要说清楚。二，Young 1928 说市场和分工是互相推着走的：分工本身也会把市场做大，不只是市场限制分工[5]。写进论文的话，最好把 Young 也放进去。',
  terse: '站得住，补两点：高地散村是观察，不是统计[2]；Young 1928 说分工也会反过来做大市场[5]。',
};
export const QCARD = { q: 'Young 1928 还不在文献库里，加进去吗？', yes: '加进文献库', no: '先不用', done: '已加进文献库：Young 1928', skip: '好，先不加。' };

export const CARD = { kind: '概念卡', title: '分工受市场范围限制', meta: '3 处原文 · 1 条摘抄', saved: '已存进「读《国富论》」', save: '存进「读《国富论》」' };

/** 引用：kb 是知识库序号，mat 是那个库里的材料序号，lib 是文献库条目序号（-1：不在文献库）。 */
export const CITES = [
  { n: 1, src: '《国富论》', loc: 'I.iii.1', kind: '全文', kb: 1, mat: 0, lib: 0, text: 'As it is the power of exchanging that gives occasion to the division of labour, so the extent of this division must always be limited by the extent of that power, or, in other words, by the extent of the market.' },
  { n: 2, src: '《国富论》', loc: 'I.iii.2', kind: '全文', kb: 1, mat: 0, lib: 0, text: 'In the lone houses and very small villages which are scattered about in so desert a country as the Highlands of Scotland, every farmer must be butcher, baker and brewer for his own family.' },
  { n: 3, src: '《国富论》', loc: 'I.iii.3', kind: '全文', kb: 1, mat: 0, lib: 0, text: '…so it is upon the sea-coast, and along the banks of navigable rivers, that industry of every kind naturally begins to subdivide and improve itself…' },
  { n: 4, src: 'Stigler 1951 的摘抄', loc: '我的摘抄', kind: '摘抄', kb: 1, mat: 2, lib: 1, text: '行业年轻时，企业什么都自己做（纵向一体化）；行业长大，专门的环节分出去成了独立的厂家；行业衰退，又收回来自己做。' },
  { n: 5, src: 'Young 1928', loc: 'The Economic Journal 38(152)', kind: '网页快照', kb: 1, mat: 12, lib: 6, text: 'Adam Smith’s dictum amounts to the theorem that the division of labour depends upon the extent of the market, but the extent of the market also depends upon the division of labour.' },
];

/** 知识库。n 是没存东西时的材料数。 */
export const KBS = [
  { name: '毕业论文', note: '政治效能感：概念、量表、测量', n: 14 },
  { name: '读《国富论》', note: '斯密 1776，中英对齐。全文、摘抄、笔记，和对话里长出来的东西', n: 11 },
  { name: '读《全球通史》', note: 'Stavrianos，在读第一编', n: 3 },
  { name: '随手存', note: '网页和对话里的好回答', n: 9 },
];

/** 每个知识库里的材料。stage：0 发芽、1 生长、2 常青（数字花园的生长阶段）。dyn：'saved' 存了概念卡才有、'rev' 审稿人查过才有。 */
/** 记录的种类：type 决定卡片的样子（A 的知识库每种一个样式，C 的画布上每种一个芽的记号）。 */
export const TYPES = {
  full: '全文', excerpt: '摘抄', note: '笔记', web: '网页快照', file: '本机文件', scan: '扫描件', concept: '概念卡', report: '调查报告', wonder: 'WonderLab 作品', answer: '存下的回答',
};

/** 每个知识库里的材料。stage：0 发芽、1 生长、2 常青。dyn：'saved' 存了概念卡才有、'rev' 审稿人查过才有。 */
export const MATS = [
  [
    { type: 'full', kind: '全文', title: 'The Voter Decides', sub: 'Campbell 等 1954 · 第 11 章', stage: 2, date: '10 月 18 日', text: '第 11 章把「政治效能感」定义成一种感觉：个人的政治行动对政治过程有影响，或者能有影响。' },
    { type: 'full', kind: '全文', title: 'Measuring Internal Political Efficacy', sub: 'Niemi, Craig & Mattei 1991 · APSR', stage: 2, date: '10 月 20 日', text: '用 1988 年全国选举研究的数据，检验内在效能感的几道题。' },
    { type: 'excerpt', kind: '摘抄', title: '量表的题目怎么分内外', sub: '我的摘抄 · 12 条', stage: 1, date: '11 月 3 日', text: '内在效能：觉得自己懂、能参与；外在效能：觉得政府会回应。' },
    { type: 'note', kind: '笔记', title: '第 2 章的结构', sub: '我的笔记', stage: 0, date: '11 月 19 日', text: '先讲概念的来历，再讲两种测量，最后讲中国的数据。' },
  ],
  [
    { type: 'full', kind: '全文', title: 'The Wealth of Nations', sub: 'Smith 1776 · 中英对齐，带段落号', stage: 2, date: '10 月 30 日', text: 'As it is the power of exchanging that gives occasion to the division of labour, so the extent of this division must always be limited by the extent of that power…' },
    { type: 'full', kind: '全文', title: 'The Division of Labor is Limited by the Extent of the Market', sub: 'Stigler 1951 · JPE 59(3)', stage: 2, date: '11 月 2 日', text: '把斯密的定理用到行业的一生：纵向一体化先降后升。' },
    { type: 'excerpt', kind: '摘抄', title: 'Stigler 1951 的摘抄', sub: '我的摘抄 · 8 条', stage: 1, date: '11 月 4 日', text: '行业年轻时，企业什么都自己做；行业长大，专门的环节分出去；行业衰退，又收回来自己做。' },
    { type: 'note', kind: '笔记', title: '分工、市场和城市', sub: '我的笔记', stage: 0, date: '11 月 12 日', text: '为什么搬运工只在大城市里有活干（I.iii.2）。小镇养不起只干一件事的人。' },
    { type: 'web', kind: '网页快照', title: 'Adam Smith’s Moral and Political Philosophy', sub: 'plato.stanford.edu', stage: 1, date: '11 月 8 日', text: '斯坦福哲学百科里讲斯密的那一条。' },
    { type: 'concept', kind: '概念卡', title: '看不见的手', sub: '上周从对话里存的 · 2 处原文', stage: 1, date: '11 月 15 日', text: '只在 IV.ii.9 出现过一次，后人讲得比斯密多。' },
    { type: 'file', kind: '本机文件', title: '读书报告：分工与市场.docx', sub: '~/Documents/读书报告', stage: 0, date: '11 月 18 日', text: '1,800 字的草稿，还没写结论。' },
    { type: 'scan', kind: '扫描件', title: '第一卷扉页', sub: '1776 年初版影印本 · 已识别文字', stage: 1, date: '11 月 9 日', text: 'AN INQUIRY INTO THE NATURE AND CAUSES OF THE WEALTH OF NATIONS. IN TWO VOLUMES. VOL. I.' },
    { type: 'report', kind: '调查报告', title: '斯密怎么评价东印度公司', sub: '事实调查 · 3 条证据', stage: 1, date: '11 月 11 日', text: '批评它的垄断：IV.vii 讲殖民地，V.i.e 讲股份公司。', verdict: '有出处' },
    { type: 'wonder', kind: 'WonderLab 作品', title: '别针工厂：分工让产量翻几倍', sub: '能拖动的图解 · 三幕', stage: 0, date: '11 月 16 日', text: '十个人分十八道工序，一天四万八千枚（I.i.3）。拖动人数，看产量怎么变。' },
    { type: 'answer', kind: '存下的回答', title: '为什么搬运工只在大城市有活干', sub: '伴读 · 2 处原文', stage: 1, date: '11 月 13 日', text: '小村子里交换的机会太少，一个人没法只靠搬运过活（I.iii.2）。' },
    { type: 'concept', kind: '概念卡', title: '分工受市场范围限制', sub: '刚从对话里存的 · 3 处原文', stage: 0, date: '今天', text: '分工因交换而起，所以受市场范围限制（I.iii.1）；高地散村、水运两个例子；Stigler 用到行业的一生。', dyn: 'saved' },
    { type: 'web', kind: '网页快照', title: 'Increasing Returns and Economic Progress', sub: 'Young 1928 · 审稿人存的', stage: 0, date: '今天', text: '分工取决于市场的范围，市场的范围也取决于分工。', dyn: 'rev' },
  ],
  [
    { type: 'full', kind: '全文', title: 'A Global History', sub: 'Stavrianos · 中译本', stage: 1, date: '11 月 10 日', text: '第一编：人类在史前的世界。' },
    { type: 'excerpt', kind: '摘抄', title: '四大古文明的地理条件', sub: '我的摘抄 · 5 条', stage: 0, date: '11 月 16 日', text: '大河流域，土地肥，也要治水。' },
    { type: 'answer', kind: '存下的回答', title: '越丰裕越好吗', sub: '伴读', stage: 0, date: '11 月 17 日', text: '太丰裕的地方反而不急着组织起来。' },
  ],
  [
    { type: 'web', kind: '网页快照', title: 'What is a digital garden', sub: '网页', stage: 1, date: '11 月 1 日', text: '笔记不是写完就发，是一直照料着长。' },
    { type: 'answer', kind: '存下的回答', title: '引文格式：APA 第 7 版', sub: '编辑', stage: 2, date: '10 月 25 日', text: '学校规范和 APA 第 7 版不一样的三处。' },
    { type: 'web', kind: '网页快照', title: 'Zotero 的八种标注颜色', sub: '网页', stage: 0, date: '11 月 21 日', text: '黄、红、绿、蓝、紫、品红、橙、灰。' },
  ],
];

/** 文献库条目（真书、真论文）。young：审稿人那一轮加进来才有。 */
export const LIB = [
  { by: 'Smith, A.', year: '1776', title: 'An Inquiry into the Nature and Causes of the Wealth of Nations', venue: 'W. Strahan and T. Cadell', type: '书', files: 'EPUB · PDF', kbs: '读《国富论》、毕业论文', chats: '斯密为什么说分工受市场范围限制？' },
  { by: 'Stigler, G. J.', year: '1951', title: 'The Division of Labor is Limited by the Extent of the Market', venue: 'Journal of Political Economy 59(3): 185–193', type: '期刊文章', files: 'PDF', kbs: '读《国富论》', chats: 'Stigler 的生命周期论站得住吗' },
  { by: 'Stavrianos, L. S.', year: '—', title: 'A Global History: From Prehistory to the 21st Century', venue: '中译本《全球通史》', type: '书', files: 'EPUB', kbs: '读《全球通史》', chats: '四大古文明发源的地理条件' },
  { by: 'Campbell, A., Gurin, G. & Miller, W. E.', year: '1954', title: 'The Voter Decides', venue: 'Row, Peterson', type: '书', files: 'PDF', kbs: '毕业论文', chats: '政治效能感最早怎么定义' },
  { by: 'Niemi, R. G., Craig, S. C. & Mattei, F.', year: '1991', title: 'Measuring Internal Political Efficacy in the 1988 National Election Study', venue: 'American Political Science Review 85(4): 1407–1413', type: '期刊文章', files: 'PDF', kbs: '毕业论文', chats: '量表的信度够不够' },
  { by: 'Balch, G. I.', year: '1974', title: 'Multiple Indicators in Survey Research: The Concept “Sense of Political Efficacy”', venue: 'Political Methodology 1(2): 1–43', type: '期刊文章', files: 'PDF', kbs: '毕业论文', chats: '—' },
  { by: 'Young, A. A.', year: '1928', title: 'Increasing Returns and Economic Progress', venue: 'The Economic Journal 38(152): 527–542', type: '期刊文章', files: '网页快照', kbs: '读《国富论》', chats: '这个解释站得住吗？', young: true },
  { by: 'Almond, G. A. & Verba, S.', year: '1963', title: 'The Civic Culture: Political Attitudes and Democracy in Five Nations', venue: 'Princeton University Press', type: '书', files: 'PDF', kbs: '毕业论文', chats: '—' },
  { by: 'Easton, D. & Dennis, J.', year: '1967', title: 'The Child’s Acquisition of Regime Norms: Political Efficacy', venue: 'American Political Science Review 61(1): 25–38', type: '期刊文章', files: 'PDF', kbs: '毕业论文', chats: '—' },
  { by: 'Craig, S. C., Niemi, R. G. & Silver, G. E.', year: '1990', title: 'Political Efficacy and Trust: A Report on the NES Pilot Study Items', venue: 'Political Behavior 12(3): 289–314', type: '期刊文章', files: 'PDF', kbs: '毕业论文', chats: '量表的信度够不够' },
  { by: 'Coase, R. H.', year: '1937', title: 'The Nature of the Firm', venue: 'Economica 4(16): 386–405', type: '期刊文章', files: 'PDF', kbs: '—', chats: '—' },
  { by: 'Hayek, F. A.', year: '1945', title: 'The Use of Knowledge in Society', venue: 'American Economic Review 35(4): 519–530', type: '期刊文章', files: 'PDF', kbs: '—', chats: '—' },
  { by: 'Marshall, A.', year: '1890', title: 'Principles of Economics', venue: 'Macmillan', type: '书', files: 'EPUB', kbs: '—', chats: '—' },
];

/** 四个初始角色（Pith 仓库 docs/atelier-handoff-2026-11-22.md 第 4 节）。 */
export const ROLES = [
  { name: 'Pith', mark: 'P', line: '研究助手 · 默认', desc: '你是站主的研究助手。什么都能问：先给结论，再给依据和编号；该用哪个技能自己挑。', kb: '上一次勾的', model: '跟随全局', skills: '全部', chats: ['把第 2 章的论证理一遍', '这三篇谁引了谁'] },
  { name: '伴读', mark: '伴', line: '读一本书的时候', desc: '你陪站主读书：讲清一个概念的来龙去脉，反过来问他，帮他整理摘抄、做概念卡。不急着替他下结论。', kb: '在读的那本书', model: '跟随全局', skills: '问这本书 · 整章分析 · 追踪概念 · WonderLab', chats: ['斯密为什么说分工受市场范围限制？', '四大古文明发源的地理条件'] },
  { name: '审稿人', mark: '审', line: '专挑刺', desc: '你是站主的审稿人。先找这个判断最弱的地方，再找反例和后世的批评；有出处就给编号。站主的判断你先唱反调，但别为反对而反对。', terse: '说话再短一点：先一句结论，再列问题，最多两条。', kb: '跟着对话', model: '跟随全局', skills: '事实调查 · 反方与后世评论 · 假设推演', chats: ['Stigler 的生命周期论站得住吗', '量表的信度够不够'] },
  { name: '编辑', mark: '编', line: '写论文的时候', desc: '你是站主的编辑：守学校的规范和引文格式，润色时保留他的语气；改 Word 之前先把修订给他看。', kb: '毕业论文', model: '跟随全局', skills: 'Word 润色 · 排版 · 插入引文', chats: ['第 2 章的引文格式', '摘要压到 300 字'] },
];

export const SKILLS = [
  { cmd: '/调查', name: '事实调查' }, { cmd: '/概念', name: '概念研究' }, { cmd: '/问书', name: '问这本书' }, { cmd: '/追踪', name: '追踪概念' },
  { cmd: '/反方', name: '反方与后世评论' }, { cmd: '/润色', name: 'Word 润色' }, { cmd: '/排版', name: '排版' }, { cmd: '/画', name: 'WonderLab' },
];

export const RECENT = [
  { t: 'Stigler 的生命周期论站得住吗', who: '审稿人', when: '2 天前', stage: 1 },
  { t: '四大古文明发源的地理条件', who: '伴读 · 读《全球通史》', when: '5 天前', stage: 0 },
  { t: '第 2 章的引文格式', who: '编辑 · 毕业论文', when: '上周', stage: 2 },
];

export const SETTINGS = ['角色', '技能', '知识库与检索', '模型与费用', 'Word 与引文', '数据', '外观'];
export const STAGES = ['发芽', '生长', '常青'];
export const GREETING = '今天想弄清什么？';
export const HINT = '问一个问题。/ 叫一个技能，@ 请一个角色，# 选知识库。';
