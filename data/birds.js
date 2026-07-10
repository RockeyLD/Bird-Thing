/** 10 种深圳常见鸟基础数据（题目后续补充） */
const BIRDS = [
  { id: 'bird_001', name: '白头鹎', enName: 'Light-vented Bulbul', cover: '/images/birds/白头鹎.jpeg', tags: ['城市常见','头顶白毛'], desc: '深圳最常见的留鸟之一，头顶白色羽冠非常醒目。' },
  { id: 'bird_002', name: '珠颈斑鸠', enName: 'Spotted Dove', cover: '/images/birds/珠颈斑鸠.png', tags: ['公园常见','颈有斑点'], desc: '颈后有珍珠状斑点，常在地面上觅食。' },
  { id: 'bird_003', name: '鹊鸲', enName: 'Oriental Magpie-Robin', cover: '/images/birds/鹊鸲.jpeg', tags: ['黑白相间','尾巴翘'], desc: '黑白相间的羽毛，喜欢翘着尾巴站在枝头。' },
  { id: 'bird_005', name: '红耳鹎', enName: 'Red-whiskered Bulbul', cover: '/images/birds/红耳鹎.jpeg', tags: ['红脸颊','冠羽'], desc: '眼睛下方有一块醒目的红色斑块。' },
  { id: 'bird_006', name: '暗绿绣眼鸟', enName: 'Swinhoe\'s White-eye', cover: '/images/birds/暗绿绣眼鸟.jpeg', tags: ['眼周白圈','体型小巧'], desc: '眼睛周围有一圈白色细边，体型只有拇指大小。' },
  { id: 'bird_008', name: '黑领椋鸟', enName: 'Black-collared Starling', cover: '/images/birds/黑领椋鸟.jpeg', tags: ['黑领白身','嗓门大'], desc: '颈部黑色犹如戴了领结，叫声非常响亮。' },
  { id: 'bird_009', name: '八哥', enName: 'Crested Myna', cover: '/images/birds/八哥.jpeg', tags: ['会说话','黄脚'], desc: '善于模仿声音，脚呈黄色，眼周有黄色裸皮。' },
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
