Component({
  data: {
    selected: 0,
    safeAreaBottom: 0,
    list: [
      { pagePath: '/pages/index/index', text: '首页', icon: '🏠' },
      { pagePath: '/pages/library/library', text: '知识库', icon: '📚' },
      { pagePath: '/pages/codex/codex', text: '图鉴', icon: '📖' },
      { pagePath: '/pages/pet/pet', text: '宠物', icon: '🐣' }
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
    }
  }
});
