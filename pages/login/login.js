const { loadFromCloud, setIsGuestMode } = require('../../utils/storage');
const { isCloudReady } = require('../../utils/cloud');

Page({
  data: {
    isLoggingIn: false
  },

  onLoad() {
    const openid = wx.getStorageSync('openid');
    if (openid) {
      // 延迟跳转，避免 onLoad 阶段同步路由导致 webview 生命周期错误
      wx.nextTick(() => {
        wx.switchTab({ url: '/pages/index/index' });
      });
    }
  },

  onWxLogin() {
    if (this.data.isLoggingIn) return;
    if (!isCloudReady()) {
      wx.setStorageSync('openid', 'local-user');
      wx.switchTab({ url: '/pages/index/index' });
      return;
    }
    this.setData({ isLoggingIn: true });
    wx.showLoading({ title: '登录中...' });
    loadFromCloud().then(() => {
      wx.hideLoading();
      wx.switchTab({ url: '/pages/index/index' });
    }).catch(err => {
      wx.hideLoading();
      console.error('登录失败', err);
      wx.setStorageSync('openid', 'local-user');
      wx.switchTab({ url: '/pages/index/index' });
    }).finally(() => {
      this.setData({ isLoggingIn: false });
    });
  },

  onGuestLogin() {
    setIsGuestMode(true);
    wx.switchTab({ url: '/pages/index/index' });
  }
});
