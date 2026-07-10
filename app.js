/** 全局应用数据 */
App({
  globalData: {
    userInfo: null,
    openid: null,
    cloudInited: false
  },

  onLaunch() {
    this.initCloud();
    this.initStorage();
  },

  initCloud() {
    if (!wx.cloud) {
      console.warn('当前基础库不支持云开发');
      return;
    }
    try {
      wx.cloud.init({ env: 'eduction-cloud1-9g1g39x5d24e6574' });
      this.globalData.cloudInited = true;
    } catch (e) {
      console.warn('云开发初始化失败', e);
    }
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
