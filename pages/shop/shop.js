/** 商店 */
const { getUserState, addScore, addFeedInventory } = require('../../utils/storage');
const { FEED_ITEMS } = require('../../data/birds');

Page({
  data: {
    user: null,
    FEED_ITEMS
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
    this.setData({ user });
  },

  onBackTap() {
    wx.navigateBack();
  },

  onBuyItem(e) {
    const { type } = e.currentTarget.dataset;
    const item = FEED_ITEMS.find(i => i.key === type);
    if (!item) return;

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
