/** 宠物养成 */
const { getUserState, getCurrentPet, setCurrentPet, feedPet, getFeedStock, consumeFeed, createRandomPet } = require('../../utils/storage');
const { PET_BIRDS, getStage, getStageIndex, FEED_PRICE, FEED_EXP } = require('../../data/birds');

function getPetBird(birdId) {
  return PET_BIRDS.find(b => b.id === birdId) || PET_BIRDS[0];
}

function getPetImage(pet) {
  if (!pet) return '';
  const bird = getPetBird(pet.birdId);
  const stage = getStage(pet.exp);
  return bird.stages[stage.key] || bird.stages.egg;
}

function getPetBg(pet) {
  if (!pet) return '/images/Background.png';
  return getPetBird(pet.birdId).bg || '/images/Background.png';
}

Page({
  data: {
    user: null,
    pet: null,
    stageInfo: null,
    stageIndex: 0,
    feedPrice: FEED_PRICE,
    feedExp: FEED_EXP,
    feedStock: 0,
    petImage: '',
    petBg: '/images/Background.png'
  },

  onLoad() {
    getApp().setNavBarData(this);
  },

  onShow() {
    this.refresh();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  refresh() {
    const user = getUserState();
    const pet = getCurrentPet();
    const stageInfo = pet ? getStage(pet.exp) : null;
    if (stageInfo) {
      stageInfo.isMax = stageInfo.key === 'ultimate';
      stageInfo.nextExpLabel = stageInfo.isMax ? 'MAX' : stageInfo.nextExp;
    }
    this.setData({
      user,
      pet,
      stageInfo,
      stageIndex: pet ? getStageIndex(pet.exp) : 0,
      feedStock: getFeedStock(),
      petImage: getPetImage(pet),
      petBg: getPetBg(pet)
    });
  },

  goToShed() {
    wx.navigateTo({ url: '/pages/shed/shed' });
  },

  goToShop() {
    wx.navigateTo({ url: '/pages/shop/shop' });
  },

  onAdoptTap() {
    const pet = createRandomPet();
    setCurrentPet(pet);
    this.refresh();
    wx.showToast({ title: `获得一颗${getPetBird(pet.birdId).name}蛋！`, icon: 'success' });
  },

  onFeedTap() {
    if (!this.data.pet) {
      wx.showToast({ title: '先领养一只鸟吧', icon: 'none' });
      return;
    }
    const stock = this.data.feedStock;
    if (stock <= 0) {
      wx.showToast({ title: '没有饲料啦！来商店看看吧～', icon: 'none' });
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/shop/shop' });
      }, 1500);
      return;
    }
    const oldStageIndex = this.data.stageIndex;
    const oldPet = this.data.pet;
    consumeFeed();
    const updated = feedPet(FEED_EXP);
    this.refresh();
    const newStage = getStageIndex(updated.exp);
    if (oldStageIndex === 3 && oldPet.exp < 1000 && updated.exp >= 1000) {
      // 究极满级，获得新鸟蛋
      const oldBird = getPetBird(oldPet.birdId);
      wx.showModal({
        title: '恭喜！',
        content: `你的${oldBird.name}已经究极满级！获得一颗新的鸟蛋！`,
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
        content: `你的宠物鸟进化到了「${getStage(updated.exp).label}」阶段！`,
        showCancel: false
      });
    } else {
      wx.showToast({ title: `喂食成功 +${FEED_EXP}经验`, icon: 'success' });
    }
  }
});
