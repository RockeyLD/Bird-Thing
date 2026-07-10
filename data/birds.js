/** 10 种深圳常见鸟基础数据（题目后续补充） */
const BIRDS = [
  {
    id: 'bird_001',
    name: '白头鹎',
    enName: 'Light-vented Bulbul',
    cover: '/images/birds/白头鹎.jpeg',
    tags: ['城市常见','头顶白毛'],
    desc: '深圳最常见的留鸟之一，头顶白色羽冠非常醒目。',
    persona: '城市里的"白头老爷爷"，最接地气的野生邻居。',
    identification: '后颈大片白斑如戴头盔，体背黄绿，腹灰白。幼鸟头灰，成年后"白头"，年纪越大白得越干净。',
    habit: '适应极强，公园、小区、行道树随处可见。鸣声软糯"啤哟—啤哟"，有地域方言。秋冬集群，几乎不长途飞行。',
    trivia: '会主动在居民阳台盆栽中筑巢，是极少数完全融入城市生活的野生鸟类。'
  },
  {
    id: 'bird_002',
    name: '珠颈斑鸠',
    enName: 'Spotted Dove',
    cover: '/images/birds/珠颈斑鸠.png',
    tags: ['公园常见','颈有斑点'],
    desc: '颈后有珍珠状斑点，常在地面上觅食。',
    persona: '城市里的"咕咕邻居"，温顺的地面漫步者。',
    identification: '颈侧密布白点黑斑，如珍珠围脖，幼鸟无此纹。体羽灰褐，尾缘白斑明显。',
    habit: '适应各类人居环境，喜地面踱步觅食，起飞笨拙。鸣声低沉"咕—咕—咕"，常被误认作雨兆。',
    trivia: '筑巢堪称"极简主义"：几根枯枝随意搭成，透光漏风，鸟蛋偶尔会掉出来。'
  },
  {
    id: 'bird_003',
    name: '鹊鸲',
    enName: 'Oriental Magpie-Robin',
    cover: '/images/birds/鹊鸲.jpeg',
    tags: ['黑白相间','尾巴翘'],
    desc: '黑白相间的羽毛，喜欢翘着尾巴站在枝头。',
    persona: '黑白穿搭的"四喜歌手"，庭院常客。',
    identification: '雄鸟黑白分明，翅有白斑；雌鸟灰褐低调。停步必翘尾，像打节拍。常被误认为小喜鹊。',
    habit: '喜近人居，地面蹦跳觅食，飞行短距低掠。鸣声多变，善模仿他鸟，晨鸣尤勤。领地意识强，敢驱赶入侵者。',
    trivia: '筑巢极简，偏爱墙缝、树洞，甚至空调管口，从不精修豪宅。'
  },
  {
    id: 'bird_005',
    name: '红耳鹎',
    enName: 'Red-whiskered Bulbul',
    cover: '/images/birds/红耳鹎.jpeg',
    tags: ['红脸颊','冠羽'],
    desc: '眼睛下方有一块醒目的红色斑块。',
    persona: '树梢上的"美妆博主"，南方城市常见留鸟。',
    identification: '头顶黑色羽冠，眼下鲜红"腮红"，尾下红臀，黑白红撞色醒目。幼鸟无红纹，成年后才"上妆"。',
    habit: '群居树冠，极少落地，鸣声清亮"叽呀—叽呀"。情绪写在头上：放松时羽冠平，警戒时竖起。',
    trivia: '唯一常见能吃有毒夹竹桃种子的鸟类，肠胃自带抗性。'
  },
  {
    id: 'bird_006',
    name: '暗绿绣眼鸟',
    enName: 'Swinhoe\'s White-eye',
    cover: '/images/birds/暗绿绣眼鸟.jpeg',
    tags: ['眼周白圈','体型小巧'],
    desc: '眼睛周围有一圈白色细边，体型只有拇指大小。',
    persona: '林间"绿衣小精灵"，传统四大鸣鸟之一。',
    identification: '体小仅10厘米，眼周一圈白绒羽如眼线，故名"绣眼"。通体橄榄绿，喉黄。白眼圈沾水会塌，像卸妆。',
    habit: '群居，动作敏捷，可倒悬取食、悬停吸蜜。鸣声细碎"唧伊—唧伊"，雄鸟能发八种不同音调。',
    trivia: '巢如吊篮，用蛛丝与细草编织，悬于细枝，精巧隐蔽。'
  },
  {
    id: 'bird_008',
    name: '黑领椋鸟',
    enName: 'Black-collared Starling',
    cover: '/images/birds/黑领椋鸟.jpeg',
    tags: ['黑领白身','嗓门大'],
    desc: '颈部黑色犹如戴了领结，叫声非常响亮。',
    persona: '自带领带的"白领打工人"，嗓门洪亮的草坪常客。',
    identification: '头白，眼周鲜黄裸皮，颈环宽阔黑纹如领带。背褐腹白，翅尾具白斑。幼鸟无黑领，成年后显现。',
    habit: '偏爱开阔草坪，常伴耕牛、家畜活动，啄食惊起草虫。鸣声粗犷穿透，善仿环境杂音。胆大不怕人，常与八哥混群。',
    trivia: '筑巢认真：做封闭式厚实圆巢，且年年复用，甚至集群扎堆繁殖。'
  },
  {
    id: 'bird_009',
    name: '八哥',
    enName: 'Crested Myna',
    cover: '/images/birds/八哥.jpeg',
    tags: ['会说话','黄脚'],
    desc: '善于模仿声音，脚呈黄色，眼周有黄色裸皮。',
    persona: '会模仿的"黑衣话痨"，鸟中口技演员。',
    identification: '通体乌黑，翅上白斑飞时呈"八"字。额羽耸立如冠，幼鸟灰褐无冠。',
    habit: '群居，常伴牛羊啄食寄生虫。鸣声粗哑洪亮，模仿力极强，可学车鸣、人言。喜沙浴，以沙代水清洁羽毛。',
    trivia: '野生八哥从不嫌弃"脏活"，是农田与草地的兼职清洁工。'
  },
  { id: 'bird_012', name: '大山雀', enName: 'Great Tit', cover: '/images/birds/大山雀.jpeg', tags: ['脸颊白','黑头'], desc: '头部黑色，脸颊白色，活泼好动。' },
  { id: 'bird_015', name: '大白鹭', enName: 'Great Egret', cover: '/images/birds/大白鹭.jpeg', tags: ['全身白','黑脚黄趾'], desc: '全身洁白，脚黑色，趾黄色，常见于水边。' },
  { id: 'bird_016', name: '白鹡鸰', enName: 'White Wagtail', cover: '/images/birds/白鹡鸰.jpeg', tags: ['黑白相间','摇尾巴'], desc: '黑白相间的羽毛，尾巴常常上下摆动，喜欢在水边或地面活动。' }
];

const DIMENSIONS = [
  { key: 'appearance', label: '外形', icon: '👁' },
  { key: 'name', label: '名字', icon: '🏷' },
  { key: 'diet', label: '食性', icon: '🌿' },
  { key: 'habitat', label: '环境', icon: '🌲' },
  { key: 'behavior', label: '习性', icon: '✨' }
];

const STAGES = [
  { key: 'egg', label: '鸟蛋', nextExp: 100 },
  { key: 'chick', label: '幼鸟', nextExp: 300 },
  { key: 'adult', label: '成鸟', nextExp: 600 },
  { key: 'elder', label: '老年', nextExp: 1000 },
  { key: 'max', label: '满级', nextExp: Infinity }
];

const FEED_PRICE = 20;
const FEED_EXP = 20;

function getStage(exp) {
  if (exp < 100) return STAGES[0];
  if (exp < 300) return STAGES[1];
  if (exp < 600) return STAGES[2];
  if (exp < 1000) return STAGES[3];
  return STAGES[4];
}

function getStageIndex(exp) {
  if (exp < 100) return 0;
  if (exp < 300) return 1;
  if (exp < 600) return 2;
  if (exp < 1000) return 3;
  return 4;
}

module.exports = {
  BIRDS, DIMENSIONS, STAGES, FEED_PRICE, FEED_EXP, getStage, getStageIndex
};
