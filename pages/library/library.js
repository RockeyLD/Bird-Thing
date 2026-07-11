/** 知识库 */
const { BIRDS } = require('../../data/birds');
const { getImageUrl } = require('../../utils/imageUrls');

Page({
  data: {
    birds: BIRDS.map(b => ({ ...b, cover: getImageUrl(b.cover) })),
    filtered: BIRDS.map(b => ({ ...b, cover: getImageUrl(b.cover) })),
    keyword: '',
    showCard: false,
    cardBird: null,
    isImageZoomed: false,
    bgImage: getImageUrl('/images/Background.png'),
    searchIcon: getImageUrl('/images/icons/搜索.png')
  },

  onLoad() {
    getApp().setNavBarData(this);
    this.refresh();
  },

  refresh() {
    const keyword = this.data.keyword || '';
    const filtered = keyword
      ? BIRDS.filter(b =>
          b.name.includes(keyword) ||
          b.desc.includes(keyword) ||
          b.tags.some(t => t.includes(keyword))
        ).map(b => ({ ...b, cover: getImageUrl(b.cover) }))
      : BIRDS.map(b => ({ ...b, cover: getImageUrl(b.cover) }));
    const cardBird = this.data.cardBird ? BIRDS.find(b => b.id === this.data.cardBird.id) : null;
    this.setData({
      birds: BIRDS.map(b => ({ ...b, cover: getImageUrl(b.cover) })),
      filtered,
      cardBird: cardBird ? { ...cardBird, cover: getImageUrl(cardBird.cover) } : null,
      bgImage: getImageUrl('/images/Background.png'),
      searchIcon: getImageUrl('/images/icons/搜索.png')
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  onSearch(e) {
    const keyword = e.detail.value.toLowerCase();
    const filtered = keyword
      ? BIRDS.filter(b =>
          b.name.includes(keyword) ||
          b.desc.includes(keyword) ||
          b.tags.some(t => t.includes(keyword))
        ).map(b => ({ ...b, cover: getImageUrl(b.cover) }))
      : BIRDS.map(b => ({ ...b, cover: getImageUrl(b.cover) }));
    this.setData({ keyword, filtered });
  },

  onBirdTap(e) {
    const { id } = e.currentTarget.dataset;
    const bird = BIRDS.find(b => b.id === id);
    this.setData({ showCard: true, cardBird: bird ? { ...bird, cover: getImageUrl(bird.cover) } : null, isImageZoomed: false });
  },

  onImageTap() {
    this.setData({ isImageZoomed: !this.data.isImageZoomed });
  },

  onStartQuiz() {
    const id = this.data.cardBird.id;
    this.setData({ showCard: false });
    wx.navigateTo({ url: `/pages/quiz/quiz?birdId=${id}&skipCard=1` });
  },

  onMaskTap() {
    this.setData({ showCard: false });
  },

  onContentTap() {
    // 阻止事件冒泡
  }
});
