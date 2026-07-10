const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function pickState(data) {
  return {
    totalScore: data.totalScore || 0,
    currentBird: data.currentBird || null,
    birdShed: data.birdShed || [],
    learnedBirdIds: data.learnedBirdIds || [],
    codex: data.codex || {},
    userInfo: data.userInfo || {}
  };
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const OPENID = wxContext.OPENID;

  const userRes = await db.collection('users').where({ _openid: OPENID }).get();
  let userData = userRes.data[0] || null;

  // 同步数据到云端
  if (event.action === 'sync') {
    const state = pickState(event.state || {});
    if (!userData) {
      await db.collection('users').add({
        data: {
          ...state,
          updatedAt: db.serverDate(),
          createdAt: db.serverDate()
        }
      });
    } else {
      const updateData = {};
      for (const k in state) {
        updateData[k] = state[k];
      }
      updateData.updatedAt = db.serverDate();
      await db.collection('users').doc(userData._id).update({ data: updateData });
    }
    return { success: true, openid: OPENID };
  }

  // 默认登录：获取或创建用户
  if (!userData) {
    const localState = event.localState || {};
    const defaultData = {
      ...pickState(localState),
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    };
    const addRes = await db.collection('users').add({ data: defaultData });
    userData = { _id: addRes._id, ...defaultData };
  }

  return {
    openid: OPENID,
    userData: pickState(userData),
    docId: userData._id,
    isNew: !userRes.data.length
  };
};
