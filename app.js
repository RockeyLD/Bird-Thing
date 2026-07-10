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
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.globalData.statusBarHeight = systemInfo.statusBarHeight;
    this.globalData.navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height;
    this.globalData.menuButtonRight = systemInfo.screenWidth - menuButtonInfo.left;
    this.globalData.menuButtonBottom = menuButtonInfo.bottom;
    // 计算积分显示区域需要下移的距离，确保在胶囊按钮下方
    const navBarRealBottom = systemInfo.statusBarHeight + this.globalData.navBarHeight;
    this.globalData.scoreBarOffset = Math.max(0, menuButtonInfo.bottom - navBarRealBottom + 8);
    this.initStorage();
  },

  initCloud() {
    if (!wx.cloud) {
      console.warn('当前基础库不支持云开发');
      return;
    }
    try {
      wx.cloud.init();
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
  }
});
