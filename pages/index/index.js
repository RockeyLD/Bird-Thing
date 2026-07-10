const { getUserState, getTutorialCompleted, addScore, getCurrentPet, setCurrentPet, feedPet, loadFromCloud, getIsGuestMode, getFeedStock, consumeFeed } = require('../../utils/storage');
const { isCloudReady } = require('../../utils/cloud');
const { BIRDS, getStage, FEED_PRICE, FEED_EXP } = require('../../data/birds');

Page({
  data: {
    user: null,
    pet: null,
    stageInfo: null,
    feedPrice: FEED_PRICE,
    feedExp: FEED_EXP,
    isLoggedIn: false,
    isGuest: false,
    quickActions: [
      { label: '答题学鸟', icon: '💡', page: '/pages/library/library', color: '#4CAF82' },
      { label: '我的图鉴', icon: '📖', page: '/pages/codex/codex', color: '#2196F3' },
      { label: '宠物养成', icon: '🐣', page: '/pages/pet/pet', color: '#FF9800' },
      { label: '知识库', icon: '🔍', page: '/pages/library/library', color: '#9C27B0' }
    ]
  },

  onLoad() {
    getApp().setNavBarData(this);
    if (!getTutorialCompleted()) {
      wx.redirectTo({ url: '/pages/tutorial/tutorial' });
      return;
    }
    this.checkLogin();
    this.refresh();
  },

  onShow() {
    if (getTutorialCompleted()) {
      this.checkLogin();
      this.refresh();
    }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  checkLogin() {
    const openid = wx.getStorageSync('openid');
    const isGuest = getIsGuestMode();
    this.setData({ isLoggedIn: !!openid || isGuest, isGuest });
  },

  refresh() {
    const user = getUserState();
    const pet = getCurrentPet();
    const stageInfo = pet ? getStage(pet.exp) : null;
    if (stageInfo) {
      stageInfo.isMax = stageInfo.nextExp === Infinity;
      stageInfo.nextExpLabel = stageInfo.isMax ? '满级' : stageInfo.nextExp;
    }
    this.setData({
      user,
      pet,
      stageInfo
    });
  },

  onLoginTap() {
    if (getIsGuestMode()) {
      wx.showModal({
        title: '切换账号',
        content: '当前为访客模式，是否返回登录页？',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.reLaunch({ url: '/pages/login/login' });
          }
        }
      });
      return;
    }
    if (!isCloudReady()) {
      wx.setStorageSync('openid', 'local-user');
      this.setData({ isLoggedIn: true });
      wx.showToast({ title: '欢迎！', icon: 'success' });
      return;
    }
    wx.showLoading({ title: '登录中...' });
    loadFromCloud().then(res => {
      wx.hideLoading();
      this.checkLogin();
      this.refresh();
      wx.showToast({ title: res.isNew ? '登录成功' : '同步成功', icon: 'success' });
    }).catch(err => {
      wx.hideLoading();
      console.error('登录失败', err);
      // 云环境不可用，降级到本地登录
      wx.setStorageSync('openid', 'local-user');
      this.setData({ isLoggedIn: true });
      wx.showToast({ title: '欢迎！', icon: 'success' });
    });
  },

  onAdoptTap() {
    const pet = {
      birdId: BIRDS[0].id,
      exp: 0,
      feedCount: 0,
      isRetired: false
    };
    setCurrentPet(pet);
    this.refresh();
    wx.showToast({ title: '领养成功！', icon: 'success' });
  },

  onQuickTap(e) {
    const { page } = e.currentTarget.dataset;
    wx.switchTab({ url: page });
  },

  onFeedTap() {
    const stock = getFeedStock();
    if (stock <= 0) {
      wx.navigateTo({ url: '/pages/shop/shop?noStock=1' });
      return;
    }
    consumeFeed();
    const updated = feedPet(FEED_EXP);
    this.refresh();
    wx.showToast({ title: `喂食成功 +${FEED_EXP}经验`, icon: 'success' });
  }
});
