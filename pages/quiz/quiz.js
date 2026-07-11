/** 答题页面 */
const { BIRDS, DIMENSIONS } = require('../../data/birds');
const { getUserState, addScore, setUserState, addToCodex } = require('../../utils/storage');


const QUIZ_PASS_COUNT = 5;

const CONGRATS = [
  '答对了！🎉',
  '太棒了！✨',
  '厉害！继续加油！💪',
  '牛！🐮',
  '答得好！👍',
  '聪明！🧠',
  '正确！✅',
  '漂亮！🌟',
  '赞！👏',
  '完美！💯'
];

function getRandomCongrats() {
  return CONGRATS[Math.floor(Math.random() * CONGRATS.length)];
}

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
    showCard: false,
    showFeedback: false,
    feedbackText: ''
  },

  onLoad(options) {
    getApp().setNavBarData(this);
    const bird = BIRDS.find(b => b.id === options.birdId) || BIRDS[0];
    const review = options.review === '1';
    const quizMode = !!(bird.questions && bird.questions.length > 0);
    this.setData({ bird, review, quizMode });
    if (options.skipCard === '1') {
      this.startQuizMode();
    } else if (quizMode) {
      this.setData({ showCard: true });
    } else {
      this.loadRandomDimension(true);
    }
  },

  // ===== 题库模式 =====
  startQuizMode() {
    this.setData({ showCard: false, correctCount: 0, usedIndices: [], showFeedback: false });
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
    // 打乱选项顺序，保持正确答案不变
    const originalOptions = [...q.options];
    const originalAnswer = q.a;
    const answerText = originalOptions[originalAnswer];
    // Fisher-Yates 洗牌
    for (let i = originalOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [originalOptions[i], originalOptions[j]] = [originalOptions[j], originalOptions[i]];
    }
    const newAnswer = originalOptions.indexOf(answerText);
    this.setData({
      currentQuestion: { q: q.q, options: originalOptions, a: newAnswer, explanation: q.explanation || '' },
      selected: -1,
      answered: false,
      isCorrect: false,
      showFeedback: false,
      usedIndices: [...usedIndices, idx]
    });
  },

  onQuizComplete() {
    const state = getUserState();
    if (!state.codex[this.data.bird.id]) {
      state.codex[this.data.bird.id] = { learnedDimensions: [], mastered: false, lastReviewAt: 0 };
    }
    const entry = state.codex[this.data.bird.id];
    entry.mastered = true;
    entry.lastReviewAt = Date.now();
    const alreadyFull = entry.learnedDimensions.length >= 5;
    if (!alreadyFull) {
      entry.learnedDimensions.push('quiz');
    }
    if (!state.learnedBirdIds.includes(this.data.bird.id)) {
      state.learnedBirdIds.push(this.data.bird.id);
    }
    setUserState(state);

    const score = this.data.review ? (alreadyFull ? 0 : 3) : 50;
    if (score > 0) {
      addScore(score);
    }
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
      showCard,
      showFeedback: false
    });
  },

  // ===== 答题交互 =====
  onOptionTap(e) {
    if (this.data.answered) return;
    const idx = e.currentTarget.dataset.idx;
    if (this.data.quizMode) {
      const q = this.data.currentQuestion;
      const isCorrect = idx === q.a;
      const feedbackText = isCorrect ? getRandomCongrats() : ('正确答案是：' + q.options[q.a] + '。' + (q.explanation || '再想想~'));
      if (isCorrect) {
        this.setData({ correctCount: this.data.correctCount + 1, selected: idx, answered: true, isCorrect, feedbackText, showFeedback: true });
      } else {
        this.setData({ selected: idx, answered: true, isCorrect, feedbackText, showFeedback: true });
      }
    } else {
      const isCorrect = idx === 0;
      const score = this.data.review ? 3 : 10;
      const feedbackText = isCorrect ? getRandomCongrats() : '正确答案是 A：' + (this.data.bird.tags[0] || '体型较小') + '。';
      if (isCorrect) {
        addScore(score);
        addToCodex(this.data.bird.id, this.data.dimension.key);
      }
      this.setData({ selected: idx, answered: true, isCorrect, feedbackText, showFeedback: true });
    }
  },

  onNextTap() {
    if (!this.data.isCorrect) {
      wx.navigateBack();
      return;
    }
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
      this.setData({ showCard: false, showFeedback: false });
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
