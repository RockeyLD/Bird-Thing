/** 本地存储封装 */
const USER_KEY = 'userState';
const TUTORIAL_KEY = 'tutorialCompleted';

function getDefaultState() {
  return {
    totalScore: 0,
    currentBird: null,
    birdShed: [],
    learnedBirdIds: [],
    codex: {}
  };
}

function getUserState() {
  try {
    const data = wx.getStorageSync(USER_KEY);
    return data || getDefaultState();
  } catch {
    return getDefaultState();
  }
}

function setUserState(state) {
  wx.setStorageSync(USER_KEY, state);
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

module.exports = {
  getUserState, setUserState,
  getTutorialCompleted, setTutorialCompleted,
  addScore, getCurrentPet, setCurrentPet, feedPet, addToCodex
};
