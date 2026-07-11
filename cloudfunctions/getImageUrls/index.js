const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const { fileList } = event;
  if (!Array.isArray(fileList) || fileList.length === 0) {
    return { success: false, message: 'fileList 为空' };
  }

  const batchSize = 50;
  const batches = [];
  for (let i = 0; i < fileList.length; i += batchSize) {
    batches.push(fileList.slice(i, i + batchSize));
  }

  try {
    const results = await Promise.all(
      batches.map(batch => cloud.getTempFileURL({ fileList: batch }))
    );
    const allFileList = results.reduce((acc, res) => acc.concat(res.fileList || []), []);
    return { success: true, fileList: allFileList };
  } catch (err) {
    return { success: false, message: err.message, error: err };
  }
};
