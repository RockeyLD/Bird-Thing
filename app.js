const { BIRDS } = require('./data/birds');

const CLOUD_ENV = 'eduction-cloud1-9g1g39x5d24e6574';

/** 全局应用数据 */
App({
  globalData: {
    userInfo: null,
    openid: null,
    cloudInited: false,
    isGuest: false,
    statusBarHeight: 0,
    navBarHeight: 44,
    menuButtonRight: 0
  },

  onLaunch() {
    this.initCloud();
    const windowInfo = wx.getWindowInfo();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.globalData.statusBarHeight = windowInfo.statusBarHeight;
    this.globalData.navBarHeight = (menuButtonInfo.top - windowInfo.statusBarHeight) * 2 + menuButtonInfo.height;
    this.globalData.menuButtonRight = windowInfo.screenWidth - menuButtonInfo.left;
    this.globalData.menuButtonBottom = menuButtonInfo.bottom;
    // 计算积分显示区域需要下移的距离，确保在胶囊按钮下方
    const navBarRealBottom = windowInfo.statusBarHeight + this.globalData.navBarHeight;
    this.globalData.scoreBarOffset = Math.max(0, menuButtonInfo.bottom - navBarRealBottom + 8);
    this.initStorage();
    this.generateDailyRecommend();
  },

  initCloud() {
    if (!wx.cloud) {
      console.warn('当前基础库不支持云开发');
      return;
    }
    try {
      wx.cloud.init({ env: CLOUD_ENV });
      this.globalData.cloudInited = true;
    } catch (e) {
      console.warn('云开发初始化失败', e);
    }
  },

  setNavBarData(page) {
    page.setData({
      statusBarHeight: this.globalData.statusBarHeight,
      navBarHeight: this.globalData.navBarHeight,
      menuButtonRight: this.globalData.menuButtonRight,
      scoreBarOffset: this.globalData.scoreBarOffset
    });
  },

  initStorage() {
    const keys = ['userState', 'tutorialCompleted'];
    keys.forEach(k => {
      const val = wx.getStorageSync(k);
      if (val === '' || val === undefined || val === null) {
        wx.setStorageSync(k, k === 'userState' ? this.getDefaultUserState() : false);
      }
    });
  },

  getDefaultUserState() {
    return {
      totalScore: 0,
      currentBird: null,
      birdShed: [],
      learnedBirdIds: [],
      codex: {}
    };
  },

  generateDailyRecommend() {
    const birdsWithHooks = BIRDS.filter(b => b.hooks && b.hooks.length > 0);
    if (birdsWithHooks.length === 0) return;
    const bird = birdsWithHooks[Math.floor(Math.random() * birdsWithHooks.length)];
    const hook = bird.hooks[Math.floor(Math.random() * bird.hooks.length)];
    const recommend = { bird, hook };
    this.globalData.dailyRecommend = recommend;
    wx.setStorageSync('dailyRecommend', recommend);
  }
});
