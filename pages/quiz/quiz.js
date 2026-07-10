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
    review: false,
    showCard: false
  },

  onLoad(options) {
    getApp().setNavBarData(this);
    const bird = BIRDS.find(b => b.id === options.birdId) || BIRDS[0];
    const review = options.review === '1';
    this.setData({ bird, review });
    this.loadRandomDimension(true);
  },

  getRemainingDimensions() {
    const user = getUserState();
    const learned = user.codex[this.data.bird.id]?.learnedDimensions || [];
    return DIMENSIONS.filter(d => !learned.includes(d.key));
  },

  loadRandomDimension(showCard = false) {
    const remaining = this.getRemainingDimensions();
    if (remaining.length === 0) {
      wx.showModal({
        title: '学习完成',
        content: '你已经完成了这只鸟的所有维度学习！',
        showCancel: false,
        success: () => wx.navigateBack()
      });
      return;
    }
    const dim = remaining[Math.floor(Math.random() * remaining.length)];
    const idx = DIMENSIONS.findIndex(d => d.key === dim.key);
    this.setData({
      dimension: dim,
      dimIndex: idx,
      selected: -1,
      answered: false,
      isCorrect: false,
      showCard
    });
  },

  onOptionTap(e) {
    if (this.data.answered) return;
    const idx = e.currentTarget.dataset.idx;
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
    this.loadRandomDimension();
  },

  onStartQuiz() {
    this.setData({ showCard: false });
  },

  onMaskTap() {
    this.setData({ showCard: false });
  },

  onContentTap() {
    // 阻止事件冒泡
  },

  onBackTap() {
    wx.navigateBack();
  }
});
