const { getUserState, getTutorialCompleted, setTutorialCompleted, addScore, getCurrentPet, setCurrentPet, feedPet, loadFromCloud, getIsGuestMode, getFeedStock, consumeFeed, getFeedInventory, consumeFeedInventory, createRandomPet, getDueReviews, retirePet } = require('../../utils/storage');
const { isCloudReady } = require('../../utils/cloud');
const { PET_BIRDS, getStage, getStageIndex, FEED_PRICE, FEED_EXP, FEED_ITEMS, BIRDS } = require('../../data/birds');
const { getImageUrl, ensureImageUrl } = require('../../utils/imageUrls');

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
    isDueReview: false,
    bgImage: getImageUrl('/images/Background.png'),
    loginIcon: getImageUrl('/images/icons/登录.png'),
    guestIcon: getImageUrl('/images/icons/未登录.png'),
    unclaimedEggImage: getImageUrl('/images/unclaimed_egg.png'),
    showFeedModal: false,
    feedInventoryList: []
  },

  onLoad() {
    getApp().setNavBarData(this);
    this.checkLogin();
    this.refresh();
    if (!getApp().globalData.imagesReady) {
      const paths = ['/images/Background.png', '/images/icons/登录.png', '/images/icons/未登录.png', '/images/unclaimed_egg.png'];
      Promise.all(paths.map(p => ensureImageUrl(p))).then(() => {
        this.refresh();
      });
    }
  },

  onShow() {
    if (getTutorialCompleted() && this.data.guideStep >= 0) {
      this.setData({ guideStep: -1 });
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ guideActive: false });
      }
    }
    this.checkLogin();
    this.refresh();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    if (this.data.guideStep >= 0) {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ guideActive: true });
      }
      wx.nextTick(() => this.updateGuidePosition(this.data.guideStep));
    }
  },

  onReady() {
    this.initGuide();
  },

  initGuide() {
    if (getTutorialCompleted()) return;
    this.setData({ guideStep: 0 });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ guideActive: true });
    }
    wx.nextTick(() => this.updateGuidePosition(0));
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
          if (attempts < 5) {
            setTimeout(() => tryUpdate(attempts + 1), 100);
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
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ guideActive: false });
      }
      wx.showToast({ title: '引导完成！', icon: 'success' });
    } else {
      this.setData({ guideStep: nextStep });
      wx.nextTick(() => this.updateGuidePosition(nextStep));
    }
  },

  onGuideMaskTap() {
    wx.showToast({ title: '请按照引导点击高亮按钮', icon: 'none', duration: 2000 });
  },

  onSkipGuide() {
    wx.showModal({
      title: '跳过教程',
      content: '是否跳过新手教程？跳过后可随时在设置中重新查看。',
      confirmText: '跳过',
      cancelText: '继续',
      success: (res) => {
        if (res.confirm) {
          setTutorialCompleted(true);
          this.setData({ guideStep: -1, guideScrollTop: 0 });
          if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({ guideActive: false });
          }
          wx.showToast({ title: '已跳过教程', icon: 'success' });
        }
      }
    });
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
      return bird ? { ...bird, cover: getImageUrl(bird.cover), progress } : null;
    }).filter(Boolean);

    const app = getApp();
    let isDueReview = false;
    let recommendBird = null;
    let recommendHook = '';
    if (dueReviews.length > 0) {
      isDueReview = true;
      recommendBird = dueReviews[0];
      recommendHook = '有一种鸟待复习';
    } else {
      const recommend = app.globalData.dailyRecommend || wx.getStorageSync('dailyRecommend');
      if (recommend && recommend.bird) {
        recommendBird = recommend.bird;
        recommendHook = recommend.hook;
      }
    }

    const codexEntries = Object.values(user.codex || {});
    const learnedCount = codexEntries.filter(e => e.learned).length;
    const masteredCount = codexEntries.filter(e => e.mastered).length;
    const totalBirds = BIRDS.length;

    const progress = (masteredCount * 10 + (learnedCount - masteredCount) * 5) / (totalBirds * 10) * 100;

    const feedInventory = getFeedInventory();
    const feedInventoryList = FEED_ITEMS
      .filter(item => feedInventory[item.key] > 0)
      .map(item => ({
        ...item,
        iconUrl: getImageUrl(item.icon),
        stock: feedInventory[item.key]
      }));

    this.setData({
      user,
      pet,
      stageInfo,
      currentExp,
      petImage: getImageUrl(getPetImage(pet)),
      feedStock: getFeedStock(),
      dueReviews,
      isDueReview,
      recommendBird: recommendBird ? { ...recommendBird, cover: getImageUrl(recommendBird.cover) } : null,
      recommendHook,
      learnedCount,
      masteredCount,
      totalBirds,
      learnProgress: totalBirds > 0 ? Math.round(progress) : 0,
      bgImage: getImageUrl('/images/Background.png'),
      loginIcon: getImageUrl('/images/icons/登录.png'),
      guestIcon: getImageUrl('/images/icons/未登录.png'),
      unclaimedEggImage: getImageUrl('/images/unclaimed_egg.png'),
      feedInventoryList
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
      wx.nextTick(() => this.nextGuideStep());
    }
  },

  onMaskTap() {
    if (this.data.guideStep >= 0) {
      wx.showToast({ title: '请按照引导点击高亮按钮', icon: 'none', duration: 2000 });
      return;
    }
    this.setData({ showRecommendCard: false });
  },

  onContentTap() {
    // 阻止事件冒泡
  },

  onStartQuizTap() {
    const bird = this.data.recommendBird;
    if (!bird) return;
    this.setData({ showRecommendCard: false });

    if (this.data.guideStep === 2) {
      this.nextGuideStep();
    }
    if (this.data.isDueReview) {
      wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${bird.id}&mode=delayed&review=1&skipCard=1` });
    } else {
      wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${bird.id}&skipCard=1` });
    }
  },

  onRetireTap() {
    const pet = getCurrentPet();
    if (!pet) return;
    const oldBird = getPetBird(pet.birdId);
    retirePet(pet);
    wx.showModal({
      title: '恭喜！',
      content: `${oldBird.name}已经究极满级！它已移居鸟舍，获得一颗新的鸟蛋！`,
      showCancel: false,
      success: () => {
        const newPet = createRandomPet();
        setCurrentPet(newPet);
        this.refresh();
        wx.showToast({ title: `获得${getPetBird(newPet.birdId).name}蛋！`, icon: 'success' });
      }
    });
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
    const feedInventoryList = this.data.feedInventoryList;
    if (feedInventoryList.length === 0) {
      wx.navigateTo({ url: '/pages/shop/shop?noStock=1' });
      return;
    }
    this.setData({ showFeedModal: true });
  },

  onFeedItemTap(e) {
    const { type, exp } = e.currentTarget.dataset;
    const consumed = consumeFeedInventory(type);
    if (!consumed) {
      wx.showToast({ title: '食物不足', icon: 'none' });
      this.setData({ showFeedModal: false });
      return;
    }

    const pet = getCurrentPet();
    const oldStageIndex = getStageIndex(pet.exp);
    const oldExp = pet.exp;
    const updated = feedPet(Number(exp));
    this.refresh();
    this.setData({ showFeedModal: false });

    const newStage = getStageIndex(updated.exp);
    if (oldStageIndex === 4 && oldExp < 1350 && updated.exp >= 1350) {
      const oldBird = getPetBird(pet.birdId);
      retirePet(pet);
      wx.showModal({
        title: '恭喜！',
        content: `${oldBird.name}已经究极满级！它已移居鸟舍，获得一颗新的鸟蛋！`,
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
      wx.showToast({ title: `喂食成功 +${exp}经验`, icon: 'success' });
    }
  },

  onFeedModalClose() {
    this.setData({ showFeedModal: false });
  },
});
