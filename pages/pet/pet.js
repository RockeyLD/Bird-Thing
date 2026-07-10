/** 宠物养成 */
const { getUserState, addScore, getCurrentPet, setCurrentPet, feedPet } = require('../../utils/storage');
const { BIRDS, getStage, getStageIndex, FEED_PRICE, FEED_EXP } = require('../../data/birds');

Page({
  data: {
    user: null,
    pet: null,
    stageInfo: null,
    stageIndex: 0,
    feedPrice: FEED_PRICE,
    feedExp: FEED_EXP
  },

  onLoad() {
    getApp().setNavBarData(this);
  },

  onShow() {
    this.refresh();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  refresh() {
    const user = getUserState();
    const pet = getCurrentPet();
    const stageInfo = pet ? getStage(pet.exp) : null;
    if (stageInfo) {
      stageInfo.isMax = stageInfo.nextExp === Infinity;
      stageInfo.nextExpLabel = stageInfo.isMax ? 'MAX' : stageInfo.nextExp;
    }
    this.setData({
      user,
      pet,
      stageInfo,
      stageIndex: pet ? getStageIndex(pet.exp) : 0
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

  onFeedTap() {
    const user = getUserState();
    if (!this.data.pet) {
      wx.showToast({ title: '先领养一只鸟吧', icon: 'none' });
      return;
    }
    if (user.totalScore < FEED_PRICE) {
      wx.showToast({ title: '积分不足，去答题吧', icon: 'none' });
      return;
    }
    addScore(-FEED_PRICE);
    const updated = feedPet(FEED_EXP);
    this.refresh();

    const newStage = getStageIndex(updated.exp);
    if (newStage > this.data.stageIndex) {
      wx.showModal({
        title: '恭喜升级！',
        content: `你的宠物鸟进化到了「${getStage(updated.exp).label}」阶段！`,
        showCancel: false
      });
    } else {
      wx.showToast({ title: `喂食成功 +${FEED_EXP}经验`, icon: 'success' });
    }
  },

  onReleaseTap() {
    const pet = getCurrentPet();
    if (!pet || getStageIndex(pet.exp) < 4) {
      wx.showToast({ title: '还没满级呢', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '放归自然',
      content: '确定要放归这只满级的宠物鸟吗？它将加入你的鸟舍收藏。',
      success: (res) => {
        if (res.confirm) {
          const state = getUserState();
          state.birdShed.push({ ...pet, isRetired: true });
          state.currentBird = null;
          setUserState(state);
          this.refresh();
          wx.showToast({ title: '放归成功！', icon: 'success' });
        }
      }
    });
  }
});
