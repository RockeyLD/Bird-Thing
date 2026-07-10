/** 图鉴 */
const { getUserState, addScore } = require('../../utils/storage');
const { BIRDS, DIMENSIONS } = require('../../data/birds');

Page({
  data: {
    birds: [],
    filter: 'all' // all, mastered, learning
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const user = getUserState();
    const list = BIRDS.map(b => {
      const entry = user.codex[b.id];
      return {
        ...b,
        learnedDimensions: entry ? entry.learnedDimensions : [],
        mastered: entry ? entry.mastered : false,
        progress: entry ? entry.learnedDimensions.length : 0
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

  onBirdTap(e) {
    const { id } = e.currentTarget.dataset;
    const user = getUserState();
    const entry = user.codex[id];
    if (!entry || entry.learnedDimensions.length === 0) {
      wx.showToast({ title: '先去学习这只鸟吧', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${id}&review=1` });
  }
});
