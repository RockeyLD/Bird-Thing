/** 答题页面 */
const { BIRDS, DIMENSIONS } = require('../../data/birds');
const { getUserState, addScore, setUserState, addToCodex } = require('../../utils/storage');


const QUIZ_PASS_COUNT = 5;

Page({
  data: {
    bird: null,
    dimensions: DIMENSIONS,
    user: getUserState(),
    dimension: null,
    dimIndex: 0,
    quizMode: false,
    currentQuestion: null,
    correctCount: 0,
    usedIndices: [],
    selected: -1,
    isCorrect: false,
    answered: false,
    review: false,
    showCard: false
  },

  onLoad(options) {
    getApp().setNavBarData(this);
    const bird = BIRDS.find(b => b.id === options.birdId) || BIRDS[0];
    const review = options.review === '1';
    const quizMode = !!(bird.questions && bird.questions.length > 0);
    this.setData({ bird, review, quizMode });
    if (quizMode) {
      this.setData({ showCard: true });
    } else {
      this.loadRandomDimension(true);
    }
  },

  // ===== 题库模式 =====
  startQuizMode() {
    this.setData({ showCard: false, correctCount: 0, usedIndices: [] });
    this.loadNextQuestion();
  },

  loadNextQuestion() {
    const { bird, usedIndices, correctCount } = this.data;
    if (correctCount >= QUIZ_PASS_COUNT) {
      this.onQuizComplete();
      return;
    }
    const available = bird.questions.map((_, i) => i).filter(i => !usedIndices.includes(i));
    if (available.length === 0) {
      wx.showModal({
        title: '答题结束',
        content: `你答对了 ${correctCount} 题，还差 ${QUIZ_PASS_COUNT - correctCount} 题通过。`,
        showCancel: false,
        success: () => wx.navigateBack()
      });
      return;
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    const q = bird.questions[idx];
    this.setData({
      currentQuestion: q,
      selected: -1,
      answered: false,
      isCorrect: false,
      usedIndices: [...usedIndices, idx]
    });
  },

  onQuizComplete() {
    const score = this.data.review ? 3 : 50;
    addScore(score);
    const state = getUserState();
    if (!state.codex[this.data.bird.id]) {
      state.codex[this.data.bird.id] = { learnedDimensions: [], mastered: false, lastReviewAt: 0 };
    }
    const entry = state.codex[this.data.bird.id];
    entry.mastered = true;
    entry.lastReviewAt = Date.now();
    if (!entry.learnedDimensions.includes('quiz')) {
      entry.learnedDimensions.push('quiz');
    }
    if (!state.learnedBirdIds.includes(this.data.bird.id)) {
      state.learnedBirdIds.push(this.data.bird.id);
    }
    setUserState(state);
    wx.showModal({
      title: '恭喜通过！',
      content: `你答对了 5 题，成功解锁了 ${this.data.bird.name}！`,
      showCancel: false,
      success: () => wx.navigateBack()
    });
  },

  // ===== 维度模式（fallback） =====
  getRemainingDimensions() {
    const user = getUserState();
    const learned = user.codex[this.data.bird.id]?.learnedDimensions || [];
    return DIMENSIONS.filter(d => !learned.includes(d.key));
  },

  loadRandomDimension(showCard = false) {
    const remaining = this.getRemainingDimensions();
    if (remaining.length === 0) {
      wx.showModal({
        title: '学习完成',
        content: '你已经完成了这只鸟的所有维度学习！',
        showCancel: false,
        success: () => wx.navigateBack()
      });
      return;
    }
    const dim = remaining[Math.floor(Math.random() * remaining.length)];
    const idx = DIMENSIONS.findIndex(d => d.key === dim.key);
    this.setData({
      dimension: dim,
      dimIndex: idx,
      selected: -1,
      answered: false,
      isCorrect: false,
      showCard
    });
  },

  // ===== 答题交互 =====
  onOptionTap(e) {
    if (this.data.answered) return;
    const idx = e.currentTarget.dataset.idx;
    if (this.data.quizMode) {
      const q = this.data.currentQuestion;
      const isCorrect = idx === q.a;
      if (isCorrect) {
        this.setData({ correctCount: this.data.correctCount + 1 });
      }
      this.setData({ selected: idx, answered: true, isCorrect });
      wx.showToast({ title: isCorrect ? '答对了！' : '答错了', icon: isCorrect ? 'success' : 'none' });
    } else {
      const isCorrect = idx === 0;
      const score = this.data.review ? 3 : 10;
      if (isCorrect) {
        addScore(score);
        addToCodex(this.data.bird.id, this.data.dimension.key);
      }
      this.setData({ selected: idx, answered: true, isCorrect });
      wx.showToast({ title: isCorrect ? `+${score}分` : '答错了', icon: isCorrect ? 'success' : 'none' });
    }
  },

  onNextTap() {
    if (this.data.quizMode) {
      this.loadNextQuestion();
    } else {
      this.loadRandomDimension();
    }
  },

  onStartQuiz() {
    if (this.data.quizMode) {
      this.startQuizMode();
    } else {
      this.setData({ showCard: false });
    }
  },

  onMaskTap() {
    this.setData({ showCard: false });
  },

  onContentTap() {
    // 阻止事件冒泡
  },

  onBackTap() {
    wx.navigateBack();
  }
});
