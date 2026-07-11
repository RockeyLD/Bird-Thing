const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function buildUpdateData(state, db) {
  const updateData = {};
  for (const k in state) {
    if (state[k] === null) {
      updateData[k] = db.command.remove();
    } else {
      updateData[k] = db.command.set(state[k]);
    }
  }
  return updateData;
}

function pickState(data) {
  return {
    totalScore: data.totalScore || 0,
    currentBird: data.currentBird || null,
    birdShed: data.birdShed || [],
    learnedBirdIds: data.learnedBirdIds || [],
    codex: data.codex || {},
    feedStock: data.feedStock || 0,
    feedInventory: data.feedInventory || { fruit: 0, worm: 0, beetle: 0 },
    ownedPetTypes: data.ownedPetTypes || [],
    userInfo: data.userInfo || {},
    tutorialCompleted: data.tutorialCompleted || false
  };
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const OPENID = wxContext.OPENID;

  if (!OPENID) {
    return { error: '无法获取用户身份' };
  }

  const userRes = await db.collection('bird-users').where({ openid: OPENID }).get();
  let userData = userRes.data[0] || null;

  // 同步数据到云端
  if (event.action === 'sync') {
    const state = pickState(event.state || {});
    if (!userData) {
      // 二次确认，防止并发创建重复用户
      const doubleCheck = await db.collection('bird-users').where({ openid: OPENID }).get();
      if (doubleCheck.data.length > 0) {
        userData = doubleCheck.data[0];
        const updateData = buildUpdateData(state, db);
        updateData.updatedAt = db.serverDate();
        await db.collection('bird-users').doc(userData._id).update({ data: updateData });
      } else {
        await db.collection('bird-users').add({
          data: {
            ...state,
            openid: OPENID,
            updatedAt: db.serverDate(),
            createdAt: db.serverDate()
          }
        });
      }
    } else {
      const updateData = buildUpdateData(state, db);
      updateData.updatedAt = db.serverDate();
      await db.collection('bird-users').doc(userData._id).update({ data: updateData });
    }
    return { success: true, openid: OPENID };
  }

  // 默认登录：获取或创建用户
  if (!userData) {
    // 二次确认，防止并发创建重复用户
    const doubleCheck = await db.collection('bird-users').where({ openid: OPENID }).get();
    if (doubleCheck.data.length > 0) {
      userData = doubleCheck.data[0];
    } else {
      const localState = event.localState || {};
      const defaultData = {
        ...pickState(localState),
        openid: OPENID,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      };
      const addRes = await db.collection('bird-users').add({ data: defaultData });
      userData = { _id: addRes._id, ...defaultData };
    }
  }

  return {
    openid: OPENID,
    userData: pickState(userData),
    docId: userData._id,
    isNew: !userRes.data.length
  };
};
