/** 全局应用数据 */
App({
  globalData: {
    userInfo: null,
    openid: null,
    statusBarHeight: 0,
    navBarHeight: 44,
    menuButtonRight: 0
  },

  onLaunch() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.globalData.statusBarHeight = systemInfo.statusBarHeight;
    this.globalData.navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height;
    this.globalData.menuButtonRight = systemInfo.screenWidth - menuButtonInfo.left;
    this.initStorage();
  },

  setNavBarData(page) {
    page.setData({
      statusBarHeight: this.globalData.statusBarHeight,
      navBarHeight: this.globalData.navBarHeight,
      menuButtonRight: this.globalData.menuButtonRight
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
