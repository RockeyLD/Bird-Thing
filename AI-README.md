# AI-README.md · 鸟类科普养成游戏

> 本文件供 AI 代理快速理解项目全貌，无需读取其他文件即可掌握核心架构、数据模型、业务规则与修改规范。

---

## 1. 项目概要

| 项 | 值 |
|----|----|
| 名称 | 鸟类科普养成游戏 |
| 平台 | 微信小程序（原生 WXML/WXSS/JS/JSON） |
| 技术栈 | 原生小程序 + 微信云开发（云函数 + 云数据库） |
| 云环境 | `eduction-cloud1-9g1g39x5d24e6574` |
| 阶段 | MVP，界面与交互已完成，题目/知识内容待填充 |

---

## 2. 文件结构

```
app.js              # 全局应用初始化，云开发 init，默认用户状态
app.json            # 路由（6 页面 + 自定义 tabBar）、窗口样式
app.wxss            # 全局 CSS 变量（森绿/暖黄配色），通用组件类

cloudfunctions/
  bird-login/       # 云函数：用户登录/注册，数据同步到 bird-users 集合
    index.js        # 主逻辑：openid 获取、用户查询/创建、状态同步
    package.json

components/         # 可复用组件（当前项目未大量使用）
custom-tab-bar/     # 自定义底部导航（首页/知识库/图鉴/宠物）

data/
  birds.js          # 15 种鸟静态数据、DIMENSIONS 5 维度、成长阶段函数、饲料参数

pages/
  index/            # 首页：宠物展示、积分、快捷入口、登录按钮
  library/          # 知识库：鸟类网格卡片、搜索过滤
  quiz/             # 答题：接收 birdId 参数，展示当前维度学习卡
  pet/              # 宠物养成：5 阶段成长、喂食、满级放归
  codex/            # 图鉴：学习进度、筛选、统计
  tutorial/         # 新手教程：4 步引导（领蛋→答题→喂食→完成）

utils/
  storage.js        # 本地存储封装（get/setUserState、addScore、feedPet、addToCodex）
  cloud.js          # 云开发封装（callLogin、syncToCloud，函数名 bird-login）

images/             # 图片资源
```

---

## 3. 核心数据模型

### 3.1 用户状态（本地存储 key = `userState`，云端集合 = `bird-users`）

```js
{
  totalScore: 0,               // 积分
  currentBird: {               // 当前宠物
    birdId: 'bird_001',
    exp: 0,
    feedCount: 0,
    isRetired: false
  },
  birdShed: [],                // 已放归的宠物列表
  learnedBirdIds: [],          // 已学鸟的 ID 列表
  codex: {                     // 图鉴进度
    'bird_001': {
      learnedDimensions: ['appearance'],
      mastered: false,
      lastReviewAt: 0
    }
  }
}
```

### 3.2 鸟类静态数据（`data/birds.js` 中 `BIRDS` 数组）

```js
{
  id: 'bird_001',
  name: '红耳鹎',
  emoji: '🐦',
  category: '深圳常见鸟'
}
```

### 3.3 5 个知识维度（`data/birds.js` 中 `DIMENSIONS`）

```js
['appearance', 'name', 'diet', 'habitat', 'behavior']
```

### 3.4 宠物成长 5 阶段（`data/birds.js` 中 `getStage()`）

| 阶段 | key | 所需经验 | emoji |
|------|-----|---------|-------|
| 鸟蛋 | egg | 0 | 🥚 |
| 幼鸟 | chick | 100 | 🐣 |
| 成鸟 | adult | 300 | 🐦 |
| 老年 | elder | 600 | 🦅 |
| 满级 | max | 1000 | 🦜 |

---

## 4. 关键工具函数（`utils/storage.js`）

| 函数 | 作用 | 说明 |
|------|------|------|
| `getUserState()` | 读取本地用户状态 | 返回对象，含默认值兜底 |
| `setUserState(state)` | 写入本地 + **自动同步云端** | 每次调用都会触发 `syncToCloud()`（异步，失败静默） |
| `addScore(delta)` | 增减积分 | 自动写回本地和云端 |
| `getCurrentPet()` | 获取当前宠物 | 从 userState 中读取 |
| `setCurrentPet(pet)` | 设置当前宠物 | 自动写回 |
| `feedPet(expGain)` | 喂食 | 增加经验值和 feedCount |
| `addToCodex(birdId, dimension)` | 记录图鉴学习进度 | 自动标记 mastered（5 维度全部完成） |
| `loadFromCloud()` | 从云端拉取数据覆盖本地 | 首页登录按钮调用 |

---

## 5. 业务规则

### 5.1 积分规则
- 喂食消耗：`5` 积分（`FEED_PRICE`）
- 喂食获得经验：`+10`（`FEED_EXP`）
- 首次答对单题：`+10`（预留）
- 完成一只鸟全部 5 维度：`+50` 奖励（预留）
- 图鉴复习答对：`+3`（预留）

### 5.2 宠物成长
- 鸟蛋（0）→ 幼鸟（100）→ 成鸟（300）→ 老年（600）→ 满级（1000）
- 满级后可"放归自然"，进入 birdShed，重新开始领养鸟蛋

### 5.3 图鉴系统
- 每鸟 5 维度，全部学完标记 `mastered: true`
- 图鉴页面展示：已学习 / 未学习，支持按状态筛选

### 5.4 新手教程
- 首次进入若 `tutorialCompleted === false`，自动重定向到 `/pages/tutorial/tutorial`
- 4 步：欢迎 → 领蛋 → 答题演示 → 喂食演示
- 完成后 `tutorialCompleted = true`，存储于本地和云端

---

## 6. 配色与 UI 规范

| 变量 | 色值 | 用途 |
|------|------|------|
| `--primary` | `#4CAF82` | 主按钮、进度、品牌色 |
| `--secondary` | `#FFC857` | 积分、奖励、次要按钮 |
| `--bg` | `#F4F8F4` | 页面背景 |
| `--card` | `#FFFFFF` | 卡片底色 |
| `--text` | `#2E3A33` | 正文 |
| `--text-secondary` | `#8A9A90` | 辅助文字 |
| `--accent` | `#E8705B` | 错误/警示 |

**禁忌**：绝对不用紫色或渐变色。

**滚动布局规范**：每个页面结构为 `<view class="page">` → `<view class="content-wrapper">`（`flex: 1; overflow: hidden`）→ `<scroll-view scroll-y class="scrollarea">`（`height: 100%`）。小程序 `scroll-view` 必须依赖显式高度，不能仅靠 flex 伸缩。

---

## 7. 云开发配置

| 配置项 | 值 |
|--------|----|
| 云环境 ID | `eduction-cloud1-9g1g39x5d24e6574` |
| 云函数 | `bird-login`（部署路径 `cloudfunctions/bird-login/`） |
| 数据库集合 | `bird-users`（存储用户状态） |
| 调用方式 | `wx.cloud.callFunction({ name: 'bird-login', data: {...} })` |

**登录流程**：用户点击首页"🔐 登录" → `loadFromCloud()` → 云函数获取 openid → 新用户注册 / 老用户拉取数据覆盖本地 → 标记 `isLoggedIn`

---

## 8. 已知注意事项

1. **scroll-view 高度**：必须外层 `content-wrapper` 定高（`flex: 1 + overflow: hidden`），内部 `scrollarea` 用 `height: 100%`，否则无法滚动。
2. **云函数部署**：修改 `bird-login` 后必须重新"创建并部署：云端安装依赖"。
3. **数据库集合**：首次使用需手动创建 `bird-users` 集合。
4. **题目内容**：答题页面的题目区域目前是空占位，需后续填充 JSON 数据。
5. **识别功能**：拍照识别和特征搜索已预留接口（`quiz` 页面接收参数），API 未接入。
6. **用户偏好**：禁止紫色配色；自动提交和推送代码。

---

## 9. 页面路由

| 页面 | 路径 | 参数 | 入口 |
|------|------|------|------|
| 首页 | `/pages/index/index` | 无 | Tab 1 |
| 知识库 | `/pages/library/library` | 无 | Tab 2 / 首页快捷入口 |
| 答题 | `/pages/quiz/quiz` | `?birdId=xxx&review=1` | 知识库点击 / 图鉴复习 |
| 图鉴 | `/pages/codex/codex` | 无 | Tab 3 |
| 宠物 | `/pages/pet/pet` | 无 | Tab 4 / 首页快捷入口 |
| 教程 | `/pages/tutorial/tutorial` | 无 | 首次进入自动跳转 |

---

*最后更新：2026-07-10*
