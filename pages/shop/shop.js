/** 商店 */
const { getUserState, addScore, addFeedInventory, getCurrentPet } = require('../../utils/storage');
const { FEED_ITEMS, PET_FEED_MAP } = require('../../data/birds');

function getAvailableFeedKeys(pet) {
  if (!pet) return [];
  return PET_FEED_MAP[pet.birdId] || [];
}

Page({
  data: {
    user: null,
    FEED_ITEMS,
    currentPet: null,
    availableKeys: []
  },

  onLoad(options) {
    getApp().setNavBarData(this);
    this.refresh();
    if (options.noStock) {
      wx.showToast({ title: '没有粮食啦！来商店看看吧～', icon: 'none', duration: 2500 });
    }
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const user = getUserState();
    const pet = getCurrentPet();
    const availableKeys = getAvailableFeedKeys(pet);
    this.setData({ user, currentPet: pet, availableKeys });
  },

  onBackTap() {
    wx.navigateBack();
  },

  onBuyItem(e) {
    const { type } = e.currentTarget.dataset;
    const item = FEED_ITEMS.find(i => i.key === type);
    if (!item) return;

    const { availableKeys } = this.data;
    if (!availableKeys.includes(type)) {
      wx.showToast({ title: '这不是你的宠物的食物，看看其他的吧～', icon: 'none' });
      return;
    }

    const user = getUserState();
    if (user.totalScore < item.price) {
      wx.showToast({ title: '积分不足，去答题吧', icon: 'none' });
      return;
    }
    addScore(-item.price);
    addFeedInventory(type, 1);
    this.refresh();
    wx.showToast({ title: `购买${item.name}成功！`, icon: 'success' });
  }
});
