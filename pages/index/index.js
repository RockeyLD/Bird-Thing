const { getUserState, getTutorialCompleted, addScore, getCurrentPet, setCurrentPet, feedPet, loadFromCloud, getIsGuestMode, getFeedStock, consumeFeed, createRandomPet, getDueReviews } = require('../../utils/storage');
const { isCloudReady } = require('../../utils/cloud');
const { PET_BIRDS, getStage, getStageIndex, FEED_PRICE, FEED_EXP, BIRDS } = require('../../data/birds');

function getPetBird(birdId) {
  return PET_BIRDS.find(b => b.id === birdId) || PET_BIRDS[0];
}

function getPetImage(pet) {
  if (!pet) return '';
  const bird = getPetBird(pet.birdId);
  const stage = getStage(pet.exp);
  return bird.stages[stage.key] || bird.stages.egg;
}

Page({
  data: {
    user: null,
    pet: null,
    stageInfo: null,
    feedPrice: FEED_PRICE,
    feedExp: FEED_EXP,
    isLoggedIn: false,
    isGuest: false,
    petImage: '',
    recommendBird: null,
    recommendHook: '',
    showRecommendCard: false,
    feedStock: 0,
    currentExp: 0,
    isLoggingIn: false,
    guideStep: -1,
    guideTop: 0,
    guideLeft: 0,
    guideWidth: 0,
    guideHeight: 0,
    guideBottom: 0,
    guideRight: 0,
    guideRightWidth: 0,
    guideBottomHeight: 0,
    guideTooltipStyle: '',
    guideText: '',
    guideTooltipPos: 'bottom',
    guideScrollTop: 0,
    windowHeight: 0
  },

  onLoad() {
    getApp().setNavBarData(this);
    this.checkLogin();
    this.refresh();
  },

  onShow() {
    this.checkLogin();
    this.refresh();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    if (this.data.guideStep >= 0) {
      setTimeout(() => this.updateGuidePosition(this.data.guideStep), 300);
    }
  },

  onReady() {
    this.initGuide();
  },

  initGuide() {
    if (getTutorialCompleted()) return;
    this.setData({ guideStep: 0 });
    this.updateGuidePosition(0);
  },

  updateGuidePosition(stepIndex) {
    const steps = [
      { target: '.adopt-btn', text: '点击这里领养你的第一颗鸟蛋，开启鸟类养成之旅！', tooltipPos: 'bottom' },
      { target: '.daily-recommend', text: '点击每日推荐，了解今天的神秘鸟类！', tooltipPos: 'bottom' },
      { target: '.card-btn', text: '点击开始答题，答对题目获得积分！', tooltipPos: 'top' }
    ];
    const step = steps[stepIndex];
    if (!step) return;

    const sysInfo = wx.getWindowInfo();
    this.setData({ windowHeight: sysInfo.windowHeight });

    const tryUpdate = (attempts = 0) => {
      const query = wx.createSelectorQuery().in(this);
      query.select(step.target).boundingClientRect();
      query.select('.scrollarea').scrollOffset();
      query.exec(res => {
        const rect = res[0];
        const scrollInfo = res[1];

        if (!rect) {
          if (attempts < 10) {
            setTimeout(() => tryUpdate(attempts + 1), 200);
          }
          return;
        }

        if (scrollInfo && rect.top > sysInfo.windowHeight - 200) {
          const scrollTop = rect.top - scrollInfo.top + scrollInfo.scrollTop - 200;
          this.setData({ guideScrollTop: scrollTop });
        }

        const windowWidth = sysInfo.windowWidth;
        const windowHeight = sysInfo.windowHeight;

        this.setData({
          guideTop: rect.top,
          guideLeft: rect.left,
          guideWidth: rect.width,
          guideHeight: rect.height,
          guideBottom: rect.bottom,
          guideRight: rect.right,
          guideRightWidth: windowWidth - rect.right,
          guideBottomHeight: windowHeight - rect.bottom,
          guideText: step.text,
          guideTooltipPos: step.tooltipPos
        });

        const tooltipStyle = this.calcTooltipStyle(rect, step.tooltipPos, windowWidth, windowHeight);
        this.setData({ guideTooltipStyle: tooltipStyle });
      });
    };

    tryUpdate();
  },

  calcTooltipStyle(rect, pos, windowWidth, windowHeight) {
    let style = '';
    if (pos === 'bottom') {
      const top = rect.bottom + 20;
      style = `top: ${top}px; left: ${rect.left + rect.width / 2}px; transform: translateX(-50%);`;
    } else if (pos === 'top') {
      const top = Math.max(20, rect.top - 140);
      style = `top: ${top}px; left: ${rect.left + rect.width / 2}px; transform: translateX(-50%);`;
    }
    return style;
  },

  nextGuideStep() {
    const nextStep = this.data.guideStep + 1;
    if (nextStep >= 3) {
      setTutorialCompleted(true);
      this.setData({ guideStep: -1, guideScrollTop: 0 });
      wx.showToast({ title: '引导完成！', icon: 'success' });
    } else {
      this.setData({ guideStep: nextStep });
      setTimeout(() => this.updateGuidePosition(nextStep), 300);
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
      stageInfo.isMax = stageInfo.key === 'ultimate';
      stageInfo.nextExpLabel = stageInfo.isMax ? 'MAX' : stageInfo.nextExp;
    }
    const currentExp = pet && stageInfo ? pet.exp - stageInfo.baseExp : 0;

    const dueReviews = getDueReviews().map(({ birdId, progress }) => {
      const bird = BIRDS.find(b => b.id === birdId);
      return bird ? { ...bird, progress } : null;
    }).filter(Boolean);

    const app = getApp();
    const recommend = app.globalData.dailyRecommend || wx.getStorageSync('dailyRecommend');
    let recommendBird = this.data.recommendBird;
    let recommendHook = this.data.recommendHook;
    if (recommend && recommend.bird) {
      recommendBird = recommend.bird;
      recommendHook = recommend.hook;
    }

    const codexEntries = Object.values(user.codex || {});
    const learnedCount = codexEntries.filter(e => e.learned).length;
    const masteredCount = codexEntries.filter(e => e.mastered).length;
    const totalBirds = BIRDS.length;

    const progress = (masteredCount * 10 + (learnedCount - masteredCount) * 5) / (totalBirds * 10) * 100;

    this.setData({
      user,
      pet,
      stageInfo,
      currentExp,
      petImage: getPetImage(pet),
      feedStock: getFeedStock(),
      dueReviews,
      recommendBird,
      recommendHook,
      learnedCount,
      masteredCount,
      totalBirds,
      learnProgress: totalBirds > 0 ? Math.round(progress) : 0
    });
  },

  onLoginTap() {
    if (this.data.isLoggingIn) return;
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
    this.setData({ isLoggingIn: true });
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
    }).finally(() => {
      this.setData({ isLoggingIn: false });
    });
  },

  onAdoptTap() {
    const pet = createRandomPet();
    setCurrentPet(pet);
    this.refresh();
    wx.showToast({ title: `获得${getPetBird(pet.birdId).name}蛋！`, icon: 'success' });

    if (this.data.guideStep === 0) {
      this.nextGuideStep();
    }
  },

  onRecommendTap() {
    const bird = this.data.recommendBird;
    if (!bird) return;
    this.setData({ showRecommendCard: true });

    if (this.data.guideStep === 1) {
      setTimeout(() => this.nextGuideStep(), 300);
    }
  },

  onMaskTap() {
    this.setData({ showRecommendCard: false });
  },

  onContentTap() {
    // 阻止事件冒泡
  },

  onStartQuizTap() {
    const bird = this.data.recommendBird;
    if (!bird) return;
    this.setData({ showRecommendCard: false });
    wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${bird.id}&skipCard=1` });

    if (this.data.guideStep === 2) {
      this.nextGuideStep();
    }
  },

  onDueReviewTap(e) {
    const birdId = e.currentTarget.dataset.birdId;
    wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${birdId}&mode=delayed&review=1&skipCard=1` });
  },

  onFeedTap() {
    const pet = getCurrentPet();
    if (!pet) {
      wx.showToast({ title: '先领养一只鸟吧', icon: 'none' });
      return;
    }
    const stock = getFeedStock();
    if (stock <= 0) {
      wx.navigateTo({ url: '/pages/shop/shop?noStock=1' });
      return;
    }
    const oldStageIndex = getStageIndex(pet.exp);
    consumeFeed();
    const updated = feedPet(FEED_EXP);
    this.refresh();
    const newStage = getStageIndex(updated.exp);
    if (oldStageIndex === 3 && pet.exp < 1000 && updated.exp >= 1000) {
      const oldBird = getPetBird(pet.birdId);
      wx.showModal({
        title: '恭喜！',
        content: `${oldBird.name}已经究极满级！获得一颗新的鸟蛋！`,
        showCancel: false,
        success: () => {
          const newPet = createRandomPet();
          setCurrentPet(newPet);
          this.refresh();
          wx.showToast({ title: `获得${getPetBird(newPet.birdId).name}蛋！`, icon: 'success' });
        }
      });
    } else if (newStage > oldStageIndex) {
      wx.showModal({
        title: '恭喜升级！',
        content: `宠物鸟进化到了「${getStage(updated.exp).label}」阶段！`,
        showCancel: false
      });
    } else {
      wx.showToast({ title: `喂食成功 +${FEED_EXP}经验`, icon: 'success' });
    }
  }
});
