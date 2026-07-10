/** 知识库 */
const { BIRDS } = require('../../data/birds');

Page({
  data: {
    birds: BIRDS,
    filtered: BIRDS,
    keyword: '',
    showCard: false,
    cardBird: null
  },

  onLoad() {
    getApp().setNavBarData(this);
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  onSearch(e) {
    const keyword = e.detail.value.toLowerCase();
    this.setData({
      keyword,
      filtered: keyword
        ? BIRDS.filter(b =>
            b.name.includes(keyword) ||
            b.desc.includes(keyword) ||
            b.tags.some(t => t.includes(keyword))
          )
        : BIRDS
    });
  },

  onBirdTap(e) {
    const { id } = e.currentTarget.dataset;
    const bird = BIRDS.find(b => b.id === id);
    this.setData({ showCard: true, cardBird: bird });
  },

  onStartQuiz() {
    const id = this.data.cardBird.id;
    this.setData({ showCard: false });
    wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${id}` });
  },

  onMaskTap() {
    this.setData({ showCard: false });
  },

  onContentTap() {
    // 阻止事件冒泡
  }
});
