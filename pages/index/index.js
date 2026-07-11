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
    currentExp: 0
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
      learnProgress: totalBirds > 0 ? Math.round((learnedCount / totalBirds) * 100) : 0
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
    const pet = createRandomPet();
    setCurrentPet(pet);
    this.refresh();
    wx.showToast({ title: `获得${getPetBird(pet.birdId).name}蛋！`, icon: 'success' });
  },

  onRecommendTap() {
    const bird = this.data.recommendBird;
    if (!bird) return;
    this.setData({ showRecommendCard: true });
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
