/** 答题页面 */
const { BIRDS, DIMENSIONS } = require('../../data/birds');
const { getUserState, addScore, addToCodex, completeFirstLearning, recordReview } = require('../../utils/storage');
const { getImageUrl } = require('../../utils/imageUrls');

const DAY_MS = 24 * 60 * 60 * 1000;


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
    isDelayed: false,
    showCard: false,
    showFeedback: false,
    feedbackText: '',
    hasWrong: false,
    isEarlyReview: false,
    isImageZoomed: false
  },

  // 安全返回：防止页面栈为空时 navigateBack 失败
  safeNavigateBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  onLoad(options) {
    getApp().setNavBarData(this);
    const bird = BIRDS.find(b => b.id === options.birdId) || BIRDS[0];
    const user = getUserState();
    const entry = user.codex[bird.id];
    const review = options.review === '1';
    let isDelayed = options.mode === 'delayed';
    const quizMode = !!(bird.questions && bird.questions.length > 0);

    // Auto-detect delayed review mode for learned-but-not-mastered birds
    if (entry && entry.learned && !entry.mastered && !isDelayed) {
      isDelayed = true;
    }

    let isEarlyReview = false;

    // Guard: not ready for delayed review yet
    if (isDelayed) {
      if (!entry || !entry.learned || entry.mastered) {
        wx.showToast({ title: '该鸟类无需复习', icon: 'none' });
        setTimeout(() => this.safeNavigateBack(), 1500);
        return;
      }
      if (entry.nextReviewAt && Date.now() < entry.nextReviewAt) {
        isEarlyReview = true;
      }
    }

    const birdWithUrl = { ...bird, cover: getImageUrl(bird.cover) };
    this.setData({ bird: birdWithUrl, review, quizMode, isDelayed, isEarlyReview });
    if (options.skipCard === '1') {
      this.startQuizMode();
    } else if (quizMode) {
      this.setData({ showCard: true });
    } else {
      this.loadRandomDimension(true);
    }
  },

  refresh() {
    const bird = BIRDS.find(b => b.id === this.data.bird.id) || BIRDS[0];
    const birdWithUrl = { ...bird, cover: getImageUrl(bird.cover) };
    this.setData({ bird: birdWithUrl });
  },

  // ===== 题库模式 =====
  startQuizMode() {
    this.setData({ showCard: false, correctCount: 0, usedIndices: [], showFeedback: false, hasWrong: false });
    this.loadNextQuestion();
  },

  loadNextQuestion() {
    const { bird, usedIndices, correctCount, hasWrong } = this.data;
    if (!hasWrong && correctCount >= QUIZ_PASS_COUNT) {
      this.onQuizComplete();
      return;
    }
    if (usedIndices.length >= 5) {
      if (!hasWrong && correctCount >= QUIZ_PASS_COUNT) {
        this.onQuizComplete();
      } else {
        wx.showModal({
          title: '很遗憾，就差一点点',
          content: `你答对了 ${correctCount} 题，再接再厉！`,
          showCancel: false,
          success: () => this.safeNavigateBack()
        });
      }
      return;
    }
    const available = bird.questions.map((_, i) => i).filter(i => !usedIndices.includes(i));
    if (available.length === 0) {
      wx.showModal({
        title: '很遗憾，就差一点点',
        content: `你答对了 ${correctCount} 题，再接再厉！`,
        showCancel: false,
        success: () => this.safeNavigateBack()
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
    if (this.data.isDelayed) {
      if (this.data.isEarlyReview) {
        wx.showModal({
          title: '练习完成',
          content: `你答对了 5 题，但复习时间还没到，本次不记录进度和积分。`,
          showCancel: false,
          success: () => this.safeNavigateBack()
        });
        return;
      }
      const result = recordReview(this.data.bird.id, true);
      if (!result) {
        wx.showToast({ title: '复习记录失败', icon: 'none' });
        this.safeNavigateBack();
        return;
      }
      if (result.mastered) {
        wx.showModal({
          title: '真正精通！',
          content: `恭喜！你已经完全掌握了 ${this.data.bird.name}！`,
          showCancel: false,
          success: () => this.safeNavigateBack()
        });
      } else {
        const daysLeft = Math.ceil((result.nextReviewAt - Date.now()) / DAY_MS);
        wx.showModal({
          title: '复习通过！',
          content: `复习通过！+20 分，下次 ${daysLeft} 天后复习。`,
          showCancel: false,
          success: () => this.safeNavigateBack()
        });
      }
      return;
    }

    const { alreadyFull } = completeFirstLearning(this.data.bird.id);
    if (!alreadyFull) {
      addScore(15);
    }
    wx.showModal({
      title: '恭喜通过！',
      content: `你答对了 5 题，成功解锁了 ${this.data.bird.name}！1天后可以开始复习。`,
      showCancel: false,
      success: () => this.safeNavigateBack()
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
      success: () => this.safeNavigateBack()
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
        this.setData({ hasWrong: true, selected: idx, answered: true, isCorrect, feedbackText, showFeedback: true });
      }
    } else {
      const isCorrect = idx === 0;
      const score = this.data.review ? 3 : 10;
      const tags = (this.data.bird && this.data.bird.tags) || [];
      const feedbackText = isCorrect ? getRandomCongrats() : '正确答案是 A：' + (tags[0] || '体型较小') + '。';
      if (isCorrect && !this.data.isEarlyReview) {
        addScore(score);
        addToCodex(this.data.bird.id, this.data.dimension.key);
      }
      this.setData({ selected: idx, answered: true, isCorrect, feedbackText, showFeedback: true });
    }
  },

  onNextTap() {
    if (!this.data.isCorrect && this.data.isDelayed) {
      // 复习模式答错也继续做完所有题目，最后统一处理结果
      this.loadNextQuestion();
      return;
    }
    if (!this.data.isCorrect) {
      // 首次学习模式答错也继续做完，不中途退出
      if (this.data.quizMode) {
        this.loadNextQuestion();
      } else {
        this.safeNavigateBack();
      }
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
    this.safeNavigateBack();
  },

  onImageTap() {
    this.setData({ isImageZoomed: !this.data.isImageZoomed });
  }
});
