/** 本地存储封装，支持自动同步云端 */
const { syncToCloud } = require('./cloud');
const USER_KEY = 'userState';
const TUTORIAL_KEY = 'tutorialCompleted';

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
    entry.mastered = true;
  }
  if (!state.learnedBirdIds.includes(birdId)) {
    state.learnedBirdIds.push(birdId);
  }
  setUserState(state);
  return entry;
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
  getFeedStock, addFeedStock, consumeFeed,
  getOwnedPetTypes, recordOwnedPetType, createRandomPet,
  loadFromCloud, setIsGuestMode, getIsGuestMode
};
