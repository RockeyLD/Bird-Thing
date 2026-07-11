/** 商店 */
const { getUserState, addScore, addFeedInventory, getCurrentPet } = require('../../utils/storage');
const { FEED_ITEMS, PET_FEED_MAP } = require('../../data/birds');
const { getImageUrl } = require('../../utils/imageUrls');

function getAvailableFeedKeys(pet) {
  if (!pet) return [];
  const keys = PET_FEED_MAP[pet.birdId];
  if (keys) return keys;
  // 兼容旧数据：如果 birdId 是百科鸟 ID，映射到对应宠物
  if (pet.birdId === 'bird_008') return PET_FEED_MAP['pet_starling'];
  if (pet.birdId === 'bird_005') return PET_FEED_MAP['pet_bulbul'];
  return [];
}

Page({
  data: {
    user: null,
    FEED_ITEMS,
    currentPet: null,
    availableKeys: [],
    availableMap: {},
    bgImage: getImageUrl('/images/shop-bg-new.png')
  },

  onLoad(options) {
    getApp().setNavBarData(this);
    this.refresh();
    if (options.noStock) {
      wx.showToast({ title: '没有粮食啦！来商店看看吧～', icon: 'none', duration: 2500 });
    }
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const user = getUserState();
    const pet = getCurrentPet();
    const availableKeys = getAvailableFeedKeys(pet);
    const availableMap = {};
    availableKeys.forEach(key => availableMap[key] = true);
    this.setData({ user, currentPet: pet, availableKeys, availableMap });
  },

  onBackTap() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  onBuyItem(e) {
    const { type } = e.currentTarget.dataset;
    const item = FEED_ITEMS.find(i => i.key === type);
    if (!item) return;

    const { availableKeys } = this.data;
    if (!availableKeys.includes(type)) {
      wx.showToast({ title: '这不是你的宠物的食物，看看其他的吧～', icon: 'none' });
      return;
    }

    const user = getUserState();
    if (user.totalScore < item.price) {
      wx.showToast({ title: '积分不足，去答题吧', icon: 'none' });
      return;
    }
    addScore(-item.price);
    addFeedInventory(type, 1);
    this.refresh();
    wx.showToast({ title: `购买${item.name}成功！`, icon: 'success' });
  }
});
