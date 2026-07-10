/** 新手教程 */
Page({
  data: {
    step: 0,
    steps: [
      { title: '领养鸟蛋', desc: '点击领养你的第一颗鸟蛋，开始鸟类养成之旅。', emoji: '🥚', action: '领养鸟蛋' },
      { title: '答题学鸟', desc: '前往知识库，学习鸟类知识，答对题目获得积分。', emoji: '💡', action: '去答题' },
      { title: '喂食成长', desc: '用积分购买饲料，喂食宠物鸟，让它成长进化。', emoji: '🌾', action: '去喂食' },
      { title: '完成', desc: '你已经掌握了基本玩法，开始你的鸟类探索之旅吧！', emoji: '🎉', action: '开始探索' }
    ]
  },

  onLoad() {
    const completed = require('../../utils/storage').getTutorialCompleted();
    if (completed) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  onNextTap() {
    if (this.data.step < 3) {
      this.setData({ step: this.data.step + 1 });
    } else {
      require('../../utils/storage').setTutorialCompleted(true);
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  onSkipTap() {
    require('../../utils/storage').setTutorialCompleted(true);
    wx.switchTab({ url: '/pages/index/index' });
  }
});
