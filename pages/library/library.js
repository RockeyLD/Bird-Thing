/** 知识库 */
const { BIRDS } = require('../../data/birds');

Page({
  data: {
    birds: BIRDS,
    filtered: BIRDS,
    keyword: ''
  },

  onLoad() {
    getApp().setNavBarData(this);
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },
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
    wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${id}` });
  }
});
