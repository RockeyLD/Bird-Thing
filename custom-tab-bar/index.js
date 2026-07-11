Component({
  data: {
    selected: 0,
    safeAreaBottom: 0,
    guideActive: false,
    list: [
      { pagePath: '/pages/index/index', text: '首页', iconPath: '/images/icons/主页.png', selectedIconPath: '/images/icons/主页.png' },
      { pagePath: '/pages/library/library', text: '答题学鸟', iconPath: '/images/icons/答题学鸟.png', selectedIconPath: '/images/icons/答题学鸟.png' },
      { pagePath: '/pages/codex/codex', text: '图鉴', iconPath: '/images/icons/图鉴.png', selectedIconPath: '/images/icons/图鉴.png' },
      { pagePath: '/pages/pet/pet', text: '宠物养成', iconPath: '/images/icons/宠物养成.png', selectedIconPath: '/images/icons/宠物养成.png' }
    ]
  },
  lifetimes: {
    attached() {
      const info = wx.getWindowInfo();
      this.setData({ safeAreaBottom: info.safeArea ? (info.screenHeight - info.safeArea.bottom) : 0 });
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
