/** 答题页面 */
const { BIRDS, DIMENSIONS } = require('../../data/birds');
const { getUserState, addScore, addToCodex } = require('../../utils/storage');

Page({
  data: {
    bird: null,
    dimensions: DIMENSIONS,
    user: getUserState(),
    dimension: null,
    dimIndex: 0,
    quiz: null,
    selected: -1,
    isCorrect: false,
    answered: false,
    review: false
  },

  onLoad(options) {
    getApp().setNavBarData(this);
    const bird = BIRDS.find(b => b.id === options.birdId) || BIRDS[0];
    const review = options.review === '1';
    this.setData({ bird, review, dimIndex: 0 });
    this.loadDimension(0);
  },

  loadDimension(idx) {
    const dim = DIMENSIONS[idx];
    if (!dim) {
      wx.showModal({
        title: '学习完成',
        content: '你已经完成了这只鸟的所有维度学习！',
        showCancel: false,
        success: () => wx.navigateBack()
      });
      return;
    }
    this.setData({
      dimension: dim,
      dimIndex: idx,
      selected: -1,
      answered: false,
      isCorrect: false
    });
  },

  onOptionTap(e) {
    if (this.data.answered) return;
    const idx = e.currentTarget.dataset.idx;
    // MVP 阶段无真实题目，模拟答题
    const isCorrect = idx === 0;
    const score = this.data.review ? 3 : 10;
    if (isCorrect) {
      addScore(score);
      addToCodex(this.data.bird.id, this.data.dimension.key);
    }
    this.setData({ selected: idx, answered: true, isCorrect });
    wx.showToast({ title: isCorrect ? `+${score}分` : '答错了', icon: isCorrect ? 'success' : 'none' });
  },

  onNextTap() {
    this.loadDimension(this.data.dimIndex + 1);
  },

  onBackTap() {
    wx.navigateBack();
  }
});
