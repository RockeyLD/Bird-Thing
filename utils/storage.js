/** 本地存储封装，支持自动同步云端 */
const { syncToCloud } = require('./cloud');
const USER_KEY = 'userState';
const TUTORIAL_KEY = 'tutorialCompleted';
const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_INTERVALS = [1, 2, 4, 7]; // days between reviews: 1/5→2/5, 2/5→3/5, 3/5→4/5, 4/5→5/5

let isGuestMode = false;
let guestState = getDefaultState();

const { PET_BIRDS } = require('../data/birds');

function getDefaultState() {
  return {
    totalScore: 0,
    currentBird: null,
    birdShed: [],
    learnedBirdIds: [],
    codex: {},
    feedStock: 0,
    ownedPetTypes: []
  };
}

function setIsGuestMode(v) {
  isGuestMode = v;
  if (v) {
    guestState = getDefaultState();
  }
  const app = getApp();
  if (app) app.globalData.isGuest = v;
}

function getIsGuestMode() {
  return isGuestMode;
}

function getUserState() {
  if (isGuestMode) return guestState;
  try {
    const data = wx.getStorageSync(USER_KEY);
    return data || getDefaultState();
  } catch {
    return getDefaultState();
  }
}

function setUserState(state) {
  if (isGuestMode) {
    guestState = state;
    return;
  }
  wx.setStorageSync(USER_KEY, state);
  try {
    syncToCloud(state).catch(() => {});
  } catch {
    // 忽略云同步失败，保证本地可用
  }
}

function loadFromCloud() {
  return new Promise((resolve, reject) => {
    const { callLogin } = require('./cloud');
    const localState = getUserState();
    callLogin(localState).then(res => {
      if (res && res.userData) {
        wx.setStorageSync(USER_KEY, res.userData);
      }
      resolve(res);
    }).catch(reject);
  });
}

function getTutorialCompleted() {
  try {
    return wx.getStorageSync(TUTORIAL_KEY) || false;
  } catch {
    return false;
  }
}

function setTutorialCompleted(v) {
  wx.setStorageSync(TUTORIAL_KEY, v);
}

function addScore(delta) {
  const state = getUserState();
  state.totalScore = Math.max(0, state.totalScore + delta);
  setUserState(state);
  return state.totalScore;
}

function getCurrentPet() {
  const state = getUserState();
  return state.currentBird;
}

function setCurrentPet(pet) {
  const state = getUserState();
  state.currentBird = pet;
  setUserState(state);
}

function feedPet(expGain) {
  const state = getUserState();
  if (!state.currentBird) return null;
  state.currentBird.exp += expGain;
  state.currentBird.feedCount += 1;
  setUserState(state);
  return state.currentBird;
}

function addToCodex(birdId, dimension) {
  const state = getUserState();
  if (!state.codex[birdId]) {
    state.codex[birdId] = { learnedDimensions: [], mastered: false, lastReviewAt: 0 };
  }
  const entry = state.codex[birdId];
  if (!entry.learnedDimensions.includes(dimension)) {
    entry.learnedDimensions.push(dimension);
  }
  const dims = ['appearance','name','diet','habitat','behavior'];
  if (dims.every(d => entry.learnedDimensions.includes(d))) {
    if (!entry.learned) {
      entry.learned = true;
      entry.progress = 1;
      entry.learnedAt = Date.now();
      entry.nextReviewAt = Date.now() + REVIEW_INTERVALS[0] * DAY_MS;
    }
  }
  if (!state.learnedBirdIds.includes(birdId)) {
    state.learnedBirdIds.push(birdId);
  }
  setUserState(state);
  return entry;
}

function completeFirstLearning(birdId) {
  const state = getUserState();
  if (!state.codex[birdId]) {
    state.codex[birdId] = { learnedDimensions: [], mastered: false, lastReviewAt: 0 };
  }
  const entry = state.codex[birdId];
  const alreadyFull = entry.learnedDimensions.length >= 5;
  if (!alreadyFull) {
    entry.learnedDimensions.push('quiz');
  }
  if (!entry.learned) {
    entry.learned = true;
    entry.progress = 1;
    entry.learnedAt = Date.now();
    entry.nextReviewAt = Date.now() + REVIEW_INTERVALS[0] * DAY_MS;
  }
  if (!state.learnedBirdIds.includes(birdId)) {
    state.learnedBirdIds.push(birdId);
  }
  setUserState(state);
  return { alreadyFull, entry };
}

function recordReview(birdId, passed) {
  const state = getUserState();
  const entry = state.codex[birdId];
  if (!entry || !entry.learned || entry.mastered) return null;

  const now = Date.now();
  if (passed) {
    entry.progress += 1;
    entry.lastReviewAt = now;
    if (entry.progress >= 5) {
      entry.mastered = true;
      entry.nextReviewAt = 0;
    } else {
      entry.nextReviewAt = now + REVIEW_INTERVALS[entry.progress - 1] * DAY_MS;
    }
    addScore(20);
  } else {
    // Reset current interval on failure
    entry.nextReviewAt = now + REVIEW_INTERVALS[entry.progress - 1] * DAY_MS;
  }
  setUserState(state);
  return entry;
}

function getDueReviews() {
  const state = getUserState();
  const now = Date.now();
  const due = [];
  for (const birdId in state.codex) {
    const entry = state.codex[birdId];
    if (entry.learned && !entry.mastered && entry.nextReviewAt && now >= entry.nextReviewAt) {
      due.push({ birdId, progress: entry.progress || 1, entry });
    }
  }
  return due;
}

function getReviewStatus(birdId) {
  const state = getUserState();
  const entry = state.codex[birdId];
  if (!entry || !entry.learned || entry.mastered) return null;
  const now = Date.now();
  const canReview = entry.nextReviewAt ? now >= entry.nextReviewAt : true;
  const daysLeft = entry.nextReviewAt ? Math.ceil((entry.nextReviewAt - now) / DAY_MS) : 0;
  return { canReview, daysLeft, progress: entry.progress || 1 };
}

function getProgress(entry) {
  if (!entry) return 0;
  if (entry.mastered) return 5;
  if (entry.progress) return entry.progress;
  return Math.min(entry.learnedDimensions?.length || 0, 5);
}

function getFeedStock() {
  const state = getUserState();
  return state.feedStock || 0;
}

function addFeedStock(delta) {
  const state = getUserState();
  state.feedStock = Math.max(0, (state.feedStock || 0) + delta);
  setUserState(state);
  return state.feedStock;
}

function consumeFeed() {
  const state = getUserState();
  const stock = state.feedStock || 0;
  if (stock > 0) {
    state.feedStock = stock - 1;
    setUserState(state);
    return true;
  }
  return false;
}

function getOwnedPetTypes() {
  const state = getUserState();
  return state.ownedPetTypes || [];
}

function recordOwnedPetType(typeId) {
  const state = getUserState();
  if (!state.ownedPetTypes) state.ownedPetTypes = [];
  if (!state.ownedPetTypes.includes(typeId)) {
    state.ownedPetTypes.push(typeId);
    setUserState(state);
  }
}

function createRandomPet() {
  const owned = getOwnedPetTypes();
  const candidates = PET_BIRDS.filter(b => !owned.includes(b.id));
  const pool = candidates.length > 0 ? candidates : PET_BIRDS;
  const bird = pool[Math.floor(Math.random() * pool.length)];
  const pet = {
    birdId: bird.id,
    exp: 0,
    feedCount: 0,
    isRetired: false
  };
  recordOwnedPetType(bird.id);
  return pet;
}

module.exports = {
  getUserState, setUserState,
  getTutorialCompleted, setTutorialCompleted,
  addScore, getCurrentPet, setCurrentPet, feedPet, addToCodex,
  completeFirstLearning, recordReview, getDueReviews, getReviewStatus, getProgress,
  getFeedStock, addFeedStock, consumeFeed,
  getOwnedPetTypes, recordOwnedPetType, createRandomPet,
  loadFromCloud, setIsGuestMode, getIsGuestMode
};
