/** 宠物养成 */
const { getUserState, getCurrentPet, setCurrentPet, feedPet, getFeedStock, consumeFeed, getFeedInventory, consumeFeedInventory, createRandomPet, retirePet } = require('../../utils/storage');
const { PET_BIRDS, getStage, getStageIndex, FEED_ITEMS, PET_FEED_MAP } = require('../../data/birds');
const { getImageUrl } = require('../../utils/imageUrls');

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
  if (!pet) return getImageUrl('/images/Background.png');
  return getPetBird(pet.birdId).bg || getImageUrl('/images/Background.png');
}

function getAvailableFeeds(pet) {
  if (!pet) return [];
  const keys = PET_FEED_MAP[pet.birdId] || [];
  const inventory = getFeedInventory();
  return keys
    .map(key => {
      const item = FEED_ITEMS.find(i => i.key === key);
      return item ? { ...item, stock: inventory[key] || 0 } : null;
    })
    .filter(Boolean)
    .filter(item => item.stock > 0);
}

Page({
  data: {
    user: null,
    pet: null,
    stageInfo: null,
    stageIndex: 0,
    feedItems: FEED_ITEMS,
    feedStock: 0,
    petImage: '',
    petBg: getImageUrl('/images/Background.png'),
    showFeedModal: false,
    modalFeeds: [],
    showLevelUp: false,
    levelUpImage: '',
    levelUpText: '',
    levelUpReqExp: 0
  },

  onLoad() {
    getApp().setNavBarData(this);
    this.refresh();
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
      stageInfo.isMax = stageInfo.key === 'ultimate' && pet.exp >= 1350;
    }
    const currentExp = pet && stageInfo ? pet.exp - stageInfo.baseExp : 0;
    const progressWidth = stageInfo && stageInfo.reqExp ? (currentExp / stageInfo.reqExp * 100) : 0;
    this.setData({
      user,
      pet,
      stageInfo,
      currentExp,
      progressWidth,
      progressStyle: `width: ${progressWidth}%`,
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

  hideLevelUp() {
    this.setData({ showLevelUp: false });
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
      wx.navigateTo({ url: '/pages/shop/shop?noStock=1' });
      return;
    }
    const modalFeeds = getAvailableFeeds(this.data.pet);
    if (modalFeeds.length === 0) {
      wx.navigateTo({ url: '/pages/shop/shop?noStock=1' });
      return;
    }
    this.setData({ showFeedModal: true, modalFeeds });
  },

  onRetireTap() {
    const pet = this.data.pet;
    if (!pet) return;
    const oldBird = getPetBird(pet.birdId);
    retirePet(pet);
    wx.showModal({
      title: '恭喜！',
      content: `你的${oldBird.name}已经究极满级！它已移居鸟舍，获得一颗新的鸟蛋！`,
      showCancel: false,
      success: () => {
        const newPet = createRandomPet();
        setCurrentPet(newPet);
        this.refresh();
        wx.showToast({ title: `获得${getPetBird(newPet.birdId).name}蛋！`, icon: 'success' });
      }
    });
  },

  hideFeedModal() {
    this.setData({ showFeedModal: false });
  },

  onSelectFeed(e) {
    const { key } = e.currentTarget.dataset;
    const item = FEED_ITEMS.find(i => i.key === key);
    if (!item) return;

    this.hideFeedModal();

    const oldStageIndex = this.data.stageIndex;
    const oldPet = this.data.pet;
    const oldExp = oldPet.exp;
    consumeFeedInventory(key);
    const updated = feedPet(item.exp);
    this.refresh();
    const newStage = getStageIndex(updated.exp);
    if (oldStageIndex === 4 && oldExp < 1350 && updated.exp >= 1350) {
      const oldBird = getPetBird(oldPet.birdId);
      retirePet(oldPet);
      wx.showModal({
        title: '恭喜！',
        content: `你的${oldBird.name}已经究极满级！它已移居鸟舍，获得一颗新的鸟蛋！`,
        showCancel: false,
        success: () => {
          const newPet = createRandomPet();
          setCurrentPet(newPet);
          this.refresh();
          wx.showToast({ title: `获得${getPetBird(newPet.birdId).name}蛋！`, icon: 'success' });
        }
      });
    } else if (newStage > oldStageIndex) {
      const stage = getStage(updated.exp);
      const LEVELUP_TEXTS = {
        egg: '一个鸟蛋',
        chick: '一只幼年鸟',
        adult: '一只成年鸟',
        prime: '一只盛年鸟',
        ultimate: '一只究极鸟'
      };
      this.setData({
        showLevelUp: true,
        levelUpImage: getPetImage(updated),
        levelUpText: LEVELUP_TEXTS[stage.key] || '一只宠物鸟',
        levelUpReqExp: stage.reqExp
      });
    } else {
      wx.showToast({ title: `喂食成功 +${item.exp}经验`, icon: 'success' });
    }
  }
});
