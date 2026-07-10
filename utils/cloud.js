/** 云开发封装 */
const CLOUD_ENV = 'eduction-cloud1-9g1g39x5d24e6574';

function isCloudReady() {
  const app = getApp();
  return wx.cloud && (app ? app.globalData.cloudInited : false);
}

function ensureCloud() {
  if (!wx.cloud) {
    throw new Error('云开发不可用');
  }
  const app = getApp();
  if (app && !app.globalData.cloudInited) {
    wx.cloud.init({ env: CLOUD_ENV });
    app.globalData.cloudInited = true;
  }
}

function callLogin(localState = {}) {
  return new Promise((resolve, reject) => {
    try {
      ensureCloud();
    } catch (e) {
      return reject(e);
    }
    wx.cloud.callFunction({
      name: 'bird-login',
      data: { localState },
      success: res => {
        if (res.result && res.result.openid) {
          const app = getApp();
          if (app) app.globalData.openid = res.result.openid;
          wx.setStorageSync('openid', res.result.openid);
        }
        resolve(res.result);
      },
      fail: reject
    });
  });
}

function syncToCloud(state) {
  return new Promise((resolve, reject) => {
    try {
      ensureCloud();
    } catch (e) {
      return reject(e);
    }
    wx.cloud.callFunction({
      name: 'bird-login',
      data: { action: 'sync', state },
      success: res => resolve(res.result),
      fail: reject
    });
  });
}

module.exports = { isCloudReady, callLogin, syncToCloud };
