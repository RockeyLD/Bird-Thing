/** 图鉴 */
const { getUserState, addScore, getReviewStatus, getProgress } = require('../../utils/storage');
const { BIRDS, DIMENSIONS } = require('../../data/birds');

const DAY_MS = 24 * 60 * 60 * 1000;

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
      const progress = getProgress(entry);
      const mastered = entry ? entry.mastered : false;
      const status = getReviewStatus(b.id);
      return {
        ...b,
        iconPath: `/images/Bird Icon/${b.name}.png`,
        learnedDimensions: entry ? entry.learnedDimensions : [],
        mastered,
        progress,
        canReview: status ? status.canReview : false,
        daysLeft: status ? status.daysLeft : 0
      };
    });
    this.setData({
      birds: list,
      user,
      masteredCount: list.filter(b => b.mastered).length,
      dueCount: list.filter(b => b.canReview).length
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
    const user = getUserState();
    const entry = user.codex[id];

    if (entry && entry.learned && !entry.mastered) {
      // Delayed review mode
      const status = getReviewStatus(id);
      if (status && !status.canReview) {
        wx.showToast({ title: `还差 ${status.daysLeft} 天才能复习`, icon: 'none' });
        return;
      }
      this.setData({ showCard: false });
      wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${id}&mode=delayed&review=1&skipCard=1` });
      return;
    }

    // First-time learning
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
