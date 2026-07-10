/** 鸟舍页面 */
const { getUserState } = require('../../utils/storage');

Page({
  data: {
    birdShed: []
  },

  onLoad() {
    getApp().setNavBarData(this);
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const user = getUserState();
    this.setData({
      birdShed: user.birdShed || []
    });
  },

  onBackTap() {
    wx.navigateBack();
  }
});
