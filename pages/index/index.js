const { getUserState, getTutorialCompleted, addScore, getCurrentPet, setCurrentPet, feedPet } = require('../../utils/storage');
const { BIRDS, getStage, FEED_PRICE, FEED_EXP } = require('../../data/birds');

Page({
  data: {
    user: null,
    pet: null,
    stageInfo: null,
    feedPrice: FEED_PRICE,
    feedExp: FEED_EXP,
    quickActions: [
      { label: '答题学鸟', icon: '💡', page: '/pages/library/library', color: '#4CAF82' },
      { label: '我的图鉴', icon: '📖', page: '/pages/codex/codex', color: '#2196F3' },
      { label: '宠物养成', icon: '🐣', page: '/pages/pet/pet', color: '#FF9800' },
      { label: '知识库', icon: '🔍', page: '/pages/library/library', color: '#9C27B0' }
    ]
  },

  onLoad() {
    if (!getTutorialCompleted()) {
      wx.redirectTo({ url: '/pages/tutorial/tutorial' });
      return;
    }
    this.refresh();
  },

  onShow() {
    if (getTutorialCompleted()) {
      this.refresh();
    }
  },

  refresh() {
    const user = getUserState();
    const pet = getCurrentPet();
    const stageInfo = pet ? getStage(pet.exp) : null;
    if (stageInfo) {
      stageInfo.isMax = stageInfo.nextExp === Infinity;
      stageInfo.nextExpLabel = stageInfo.isMax ? '满级' : stageInfo.nextExp;
    }
    this.setData({
      user,
      pet,
      stageInfo
    });
  },

  onAdoptTap() {
    const pet = {
      birdId: BIRDS[0].id,
      exp: 0,
      feedCount: 0,
      isRetired: false
    };
    setCurrentPet(pet);
    this.refresh();
    wx.showToast({ title: '领养成功！', icon: 'success' });
  },

  onQuickTap(e) {
    const { page } = e.currentTarget.dataset;
    wx.switchTab({ url: page });
  },

  onFeedTap() {
    const user = getUserState();
    if (user.totalScore < FEED_PRICE) {
      wx.showToast({ title: '积分不足，去答题吧', icon: 'none' });
      return;
    }
    addScore(-FEED_PRICE);
    const updated = feedPet(FEED_EXP);
    this.refresh();
    wx.showToast({ title: `喂食成功 +${FEED_EXP}经验`, icon: 'success' });
  }
});
