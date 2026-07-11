/** 图鉴 */
const { getUserState, addScore } = require('../../utils/storage');
const { BIRDS, DIMENSIONS } = require('../../data/birds');

Page({
  data: {
    birds: [],
    filter: 'all',
    searchKeyword: '',
    showCard: false,
    cardBird: null
  },

  onLoad() {
    getApp().setNavBarData(this);
  },

  onShow() {
    this.refresh();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  refresh() {
    const user = getUserState();
    const keyword = this.data.searchKeyword.trim();
    const list = BIRDS.filter(b => !keyword || b.name.includes(keyword)).map(b => {
      const entry = user.codex[b.id];
      const progress = entry ? entry.learnedDimensions.length : 0;
      return {
        ...b,
        iconPath: `/images/Bird Icon/${b.name}.png`,
        learnedDimensions: entry ? entry.learnedDimensions : [],
        mastered: progress >= 5,
        progress
      };
    });
    this.setData({
      birds: list,
      user,
      masteredCount: list.filter(b => b.mastered).length
    });
  },

  onFilterTap(e) {
    this.setData({ filter: e.currentTarget.dataset.filter });
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
    this.refresh();
  },

  onBirdTap(e) {
    const { id } = e.currentTarget.dataset;
    const bird = BIRDS.find(b => b.id === id);
    this.setData({ showCard: true, cardBird: bird });
  },

  onStartQuiz() {
    const id = this.data.cardBird.id;
    this.setData({ showCard: false });
    wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${id}&review=1&skipCard=1` });
  },

  onMaskTap() {
    this.setData({ showCard: false });
  },

  onContentTap() {
    // 阻止事件冒泡
  }
});
