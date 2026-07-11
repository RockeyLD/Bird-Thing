/** 鸟舍页面 */
const { getUserState } = require('../../utils/storage');
const { PET_BIRDS, getStage } = require('../../data/birds');

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
    const shed = (user.birdShed || []).map(item => {
      const bird = PET_BIRDS.find(b => b.id === item.birdId);
      const stage = getStage(item.exp);
      return {
        ...item,
        name: bird ? bird.name : '未知鸟类',
        stageLabel: stage.label
      };
    });
    this.setData({ birdShed: shed });
  },

  onBackTap() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  }
});
