/** 商店 */
const { getUserState, addScore, addFeedStock } = require('../../utils/storage');
const { FEED_PRICE } = require('../../data/birds');

Page({
  data: {
    user: null,
    FEED_PRICE
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

  onBuyFeed() {
    const user = getUserState();
    if (user.totalScore < FEED_PRICE) {
      wx.showToast({ title: '积分不足，去答题吧', icon: 'none' });
      return;
    }
    addScore(-FEED_PRICE);
    addFeedStock(1);
    this.refresh();
    wx.showToast({ title: '购买成功！', icon: 'success' });
  }
});
