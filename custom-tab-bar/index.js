const { getImageUrl } = require('../utils/imageUrls');

function getTabBarList() {
  return [
    { pagePath: '/pages/index/index', text: '首页', iconPath: getImageUrl('/images/icons/主页.png'), selectedIconPath: getImageUrl('/images/icons/主页.png') },
    { pagePath: '/pages/library/library', text: '答题学鸟', iconPath: getImageUrl('/images/icons/答题学鸟.png'), selectedIconPath: getImageUrl('/images/icons/答题学鸟.png') },
    { pagePath: '/pages/codex/codex', text: '图鉴', iconPath: getImageUrl('/images/icons/图鉴.png'), selectedIconPath: getImageUrl('/images/icons/图鉴.png') },
    { pagePath: '/pages/pet/pet', text: '宠物养成', iconPath: getImageUrl('/images/icons/宠物养成.png'), selectedIconPath: getImageUrl('/images/icons/宠物养成.png') }
  ];
}

Component({
  data: {
    selected: 0,
    safeAreaBottom: 0,
    guideActive: false,
    list: getTabBarList()
  },
  lifetimes: {
    attached() {
      const info = wx.getWindowInfo();
      this.setData({ safeAreaBottom: info.safeArea ? (info.screenHeight - info.safeArea.bottom) : 0 });
      // 云存储图片临时链接就绪后，刷新 tabBar 图标
      if (getApp().globalData.imagesReady) {
        this.setData({ list: getTabBarList() });
      } else {
        const check = setInterval(() => {
          if (getApp().globalData.imagesReady) {
            clearInterval(check);
            this.setData({ list: getTabBarList() });
          }
        }, 500);
        // 10秒后自动停止轮询
        setTimeout(() => clearInterval(check), 10000);
      }
    }
  },
  methods: {
    switchTab(e) {
      const { index, url } = e.currentTarget.dataset;
      this.setData({ selected: index });
      wx.switchTab({ url });
    },
    onOverlayTap() {
      wx.showToast({ title: '请按照引导点击高亮按钮', icon: 'none', duration: 2000 });
    }
  }
});
