/** 云存储图片管理：将本地 /images/... 路径映射为云存储临时链接 */

const CLOUD_ENV = 'eduction-cloud1-9g1g39x5d24e6574';

const CLOUD_BASE = `cloud://${CLOUD_ENV}.6564-eduction-cloud1-9g1g39x5d24e6574-1394729867`;

/** 所有图片的本地路径 -> 云存储路径映射 */
const IMAGE_MAP = {
  // 根目录
  '/images/Background.png': `${CLOUD_BASE}/images/Background.png`,
  '/images/logo.png': `${CLOUD_BASE}/images/logo.png`,
  '/images/shop-bg-new.png': `${CLOUD_BASE}/images/shop-bg-new.png`,
  '/images/unclaimed_egg.png': `${CLOUD_BASE}/images/unclaimed_egg.png`,
  // icons
  '/images/icons/主页.png': `${CLOUD_BASE}/images/icons/主页.png`,
  '/images/icons/图鉴.png': `${CLOUD_BASE}/images/icons/图鉴.png`,
  '/images/icons/宠物养成.png': `${CLOUD_BASE}/images/icons/宠物养成.png`,
  '/images/icons/搜索.png': `${CLOUD_BASE}/images/icons/搜索.png`,
  '/images/icons/未登录.png': `${CLOUD_BASE}/images/icons/未登录.png`,
  '/images/icons/登录.png': `${CLOUD_BASE}/images/icons/登录.png`,
  '/images/icons/答题学鸟.png': `${CLOUD_BASE}/images/icons/答题学鸟.png`,
  // birds
  '/images/birds/白头鹎.jpeg': `${CLOUD_BASE}/images/birds/白头鹎.jpeg`,
  '/images/birds/珠颈斑鸠.png': `${CLOUD_BASE}/images/birds/珠颈斑鸠.png`,
  '/images/birds/鹊鸲.jpeg': `${CLOUD_BASE}/images/birds/鹊鸲.jpeg`,
  '/images/birds/红耳鹎.jpeg': `${CLOUD_BASE}/images/birds/红耳鹎.jpeg`,
  '/images/birds/暗绿绣眼鸟.jpeg': `${CLOUD_BASE}/images/birds/暗绿绣眼鸟.jpeg`,
  '/images/birds/黑领椋鸟.jpeg': `${CLOUD_BASE}/images/birds/黑领椋鸟.jpeg`,
  '/images/birds/八哥.jpeg': `${CLOUD_BASE}/images/birds/八哥.jpeg`,
  '/images/birds/大山雀.jpeg': `${CLOUD_BASE}/images/birds/大山雀.jpeg`,
  '/images/birds/大白鹭.jpeg': `${CLOUD_BASE}/images/birds/大白鹭.jpeg`,
  '/images/birds/白鹡鸰.jpeg': `${CLOUD_BASE}/images/birds/白鹡鸰.jpeg`,
  // Bird Icon
  '/images/Bird Icon/白头鹎.png': `${CLOUD_BASE}/images/Bird Icon/白头鹎.png`,
  '/images/Bird Icon/珠颈斑鸠.png': `${CLOUD_BASE}/images/Bird Icon/珠颈斑鸠.png`,
  '/images/Bird Icon/鹊鸲.png': `${CLOUD_BASE}/images/Bird Icon/鹊鸲.png`,
  '/images/Bird Icon/红耳鹎.png': `${CLOUD_BASE}/images/Bird Icon/红耳鹎.png`,
  '/images/Bird Icon/暗绿绣眼鸟.png': `${CLOUD_BASE}/images/Bird Icon/暗绿绣眼鸟.png`,
  '/images/Bird Icon/黑领椋鸟.png': `${CLOUD_BASE}/images/Bird Icon/黑领椋鸟.png`,
  '/images/Bird Icon/八哥.png': `${CLOUD_BASE}/images/Bird Icon/八哥.png`,
  '/images/Bird Icon/大山雀.png': `${CLOUD_BASE}/images/Bird Icon/大山雀.png`,
  '/images/Bird Icon/大白鹭.png': `${CLOUD_BASE}/images/Bird Icon/大白鹭.png`,
  '/images/Bird Icon/白鹡鸰.png': `${CLOUD_BASE}/images/Bird Icon/白鹡鸰.png`,
  // pets
  '/images/pets/eagle_egg.png': `${CLOUD_BASE}/images/pets/eagle_egg.png`,
  '/images/pets/eagle_young.png': `${CLOUD_BASE}/images/pets/eagle_young.png`,
  '/images/pets/eagle_adult.png': `${CLOUD_BASE}/images/pets/eagle_adult.png`,
  '/images/pets/eagle_ultimate.png': `${CLOUD_BASE}/images/pets/eagle_ultimate.png`,
  '/images/pets/eagle_bg.png': `${CLOUD_BASE}/images/pets/eagle_bg.png`,
  '/images/pets/starling_egg.png': `${CLOUD_BASE}/images/pets/starling_egg.png`,
  '/images/pets/starling_young.png': `${CLOUD_BASE}/images/pets/starling_young.png`,
  '/images/pets/starling_adult.png': `${CLOUD_BASE}/images/pets/starling_adult.png`,
  '/images/pets/starling_ultimate.png': `${CLOUD_BASE}/images/pets/starling_ultimate.png`,
  '/images/pets/starling_bg.png': `${CLOUD_BASE}/images/pets/starling_bg.png`,
  '/images/pets/bulbul_egg.png': `${CLOUD_BASE}/images/pets/bulbul_egg.png`,
  '/images/pets/bulbul_young.png': `${CLOUD_BASE}/images/pets/bulbul_young.png`,
  '/images/pets/bulbul_adult.png': `${CLOUD_BASE}/images/pets/bulbul_adult.png`,
  '/images/pets/bulbul_ultimate.png': `${CLOUD_BASE}/images/pets/bulbul_ultimate.png`,
  '/images/pets/bulbul_bg.png': `${CLOUD_BASE}/images/pets/bulbul_bg.png`,
  // shop
  '/images/shop/fruit.png': `${CLOUD_BASE}/images/shop/fruit.png`,
  '/images/shop/worm.png': `${CLOUD_BASE}/images/shop/worm.png`,
  '/images/shop/beetle.png': `${CLOUD_BASE}/images/shop/beetle.png`,
  '/images/shop/mouse.png': `${CLOUD_BASE}/images/shop/mouse.png`,
  '/images/shop/rabbit.png': `${CLOUD_BASE}/images/shop/rabbit.png`,
  '/images/shop/fox.png': `${CLOUD_BASE}/images/shop/fox.png`,
  '/images/shop/ant.png': `${CLOUD_BASE}/images/shop/ant.png`,
  '/images/shop/caterpillar.png': `${CLOUD_BASE}/images/shop/caterpillar.png`,
  '/images/shop/fig.png': `${CLOUD_BASE}/images/shop/fig.png`,
};

/** 缓存：本地路径 -> 临时链接 */
let tempUrlCache = {};

function getCloudFileID(localPath) {
  return IMAGE_MAP[localPath] || null;
}

/** 批量获取所有图片的临时链接，在 app.js onLaunch 中调用 */
function initCloudImages() {
  return new Promise((resolve) => {
    if (!wx.cloud) {
      console.warn('云开发不可用');
      resolve(false);
      return;
    }
    const fileIDs = Object.values(IMAGE_MAP).filter(Boolean);
    if (fileIDs.length === 0) {
      resolve(false);
      return;
    }

    wx.cloud.callFunction({
      name: 'getImageUrls',
      data: { fileList: fileIDs },
      success: res => {
        const result = res.result || {};
        if (!result.success) {
          console.warn('云函数获取临时链接失败:', result.message);
          resolve(false);
          return;
        }
        const imageMapEntries = Object.entries(IMAGE_MAP);
        const list = result.fileList || [];
        const missingFiles = [];
        let successCount = 0;
        list.forEach(item => {
          if (item.status === 0 && item.tempFileURL) {
            const found = imageMapEntries.find(([localPath, cloudPath]) => cloudPath === item.fileID);
            if (found) {
              tempUrlCache[found[0]] = item.tempFileURL;
              successCount++;
            } else {
              console.warn('无法匹配临时链接:', item.fileID);
            }
          } else {
            missingFiles.push(item.fileID);
          }
        });
        if (missingFiles.length > 0) {
          console.warn(`[imageUrls] ${missingFiles.length} 个云存储文件不存在，已回退到 cloud 路径。示例:`, missingFiles.slice(0, 3));
        }
        console.log('云存储图片临时链接已获取，共', successCount, '个');
        resolve(true);
      },
      fail: err => {
        console.warn('调用云函数 getImageUrls 失败:', err);
        resolve(false);
      }
    });
  });
}

/** 获取图片临时链接；若缓存未命中则返回空字符串，不再返回 cloud:// 路径 */
function getImageUrl(localPath) {
  if (!localPath) return '';
  // 如果已经是临时链接，直接返回
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath;
  }
  // 只返回已缓存的临时链接，避免 cloud:// 路径在渲染层被当作相对路径导致 500 错误
  return tempUrlCache[localPath] || '';
}

/** 按需获取单个图片的临时链接；若缓存已存在则直接返回缓存值 */
function ensureImageUrl(localPath) {
  return new Promise((resolve) => {
    const cached = tempUrlCache[localPath];
    if (cached) {
      resolve(cached);
      return;
    }
    const cloudPath = IMAGE_MAP[localPath];
    if (!cloudPath) {
      resolve('');
      return;
    }
    if (!wx.cloud) {
      resolve('');
      return;
    }
    wx.cloud.callFunction({
      name: 'getImageUrls',
      data: { fileList: [cloudPath] },
      success: res => {
        const result = res.result || {};
        if (result.success) {
          const item = (result.fileList || [])[0];
          if (item && item.status === 0 && item.tempFileURL) {
            tempUrlCache[localPath] = item.tempFileURL;
            resolve(item.tempFileURL);
            return;
          }
        }
        resolve('');
      },
      fail: () => resolve('')
    });
  });
}

/** 将 birds.js 中的静态图片路径转换为临时链接（应在 initCloudImages 成功后调用） */
function resolveBirdImages(birds, petBirds, feedItems) {
  birds.forEach(b => {
    if (b.cover) b.cover = getImageUrl(b.cover);
  });
  petBirds.forEach(p => {
    if (p.stages) {
      for (const k in p.stages) {
        p.stages[k] = getImageUrl(p.stages[k]);
      }
    }
    if (p.bg) p.bg = getImageUrl(p.bg);
  });
  feedItems.forEach(f => {
    if (f.icon) f.icon = getImageUrl(f.icon);
  });
}

module.exports = {
  initCloudImages,
  getImageUrl,
  ensureImageUrl,
  resolveBirdImages,
  getCloudFileID
};
