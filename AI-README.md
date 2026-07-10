# AI-README.md · 鸟圳（鸟类科普养成游戏）

> 本文件供 AI 代理快速理解项目全貌。修改代码前必读，确保改动与现有架构兼容。

---

## 1. 项目概要

| 项 | 值 |
|----|----|
| 名称 | 鸟圳（原 Bird Thing） |
| 平台 | 微信小程序（原生 WXML/WXSS/JS/JSON） |
| 技术栈 | 原生小程序 + 微信云开发（云函数 + 云数据库） |
| 云环境 | `eduction-cloud1-9g1g39x5d24e6574` |
| 阶段 | 10 种鸟已上线，每种 10 题 + 知识卡片（persona/identification/habit/trivia） |

---

## 2. 文件结构

```
app.js                  # 全局应用初始化，云开发 init，setNavBarData
app.json                # 路由（9 页面 + 自定义 tabBar）、窗口样式
app.wxss                # 全局 CSS 变量（森绿/暖黄配色），通用组件类

cloudfunctions/
  bird-login/           # 云函数：用户登录/注册，同步到 bird-users 集合
    index.js
    package.json

components/             # 可复用组件（navigation-bar 等）
custom-tab-bar/         # 自定义底部导航（首页/知识库/图鉴/宠物）

data/
  birds.js              # 10 种鸟静态数据 + 题库 + 成长阶段函数 + hooks

pages/
  login/                # 登录页：logo.png + 微信一键登录/访客模式
  index/                # 首页：宠物展示、积分、快捷入口、每日推荐
  library/              # 知识库：鸟类卡片列表（照片+人设）、搜索过滤
  quiz/                 # 答题：知识卡片弹窗 → 题库答题（答对5题通过）
  pet/                  # 宠物养成：5 阶段成长、喂食、满级放归
  codex/                # 图鉴：学习进度、筛选、统计
  shed/                 # 已放归宠物列表
  shop/                 # 商店：购买鸟蛋/道具
  tutorial/             # 新手教程：4 步引导

utils/
  storage.js            # 本地存储封装（含自动同步云端）
  cloud.js              # 云开发封装（callLogin、syncToCloud）

images/
  logo.png              # 登录页品牌 logo
  Background.png        # 全局背景图
  birds/                # 鸟照片（10 张，与 birds.js 中 cover 路径对应）
```

---

## 3. 核心数据模型

### 3.1 用户状态（本地 key = `userState`，云端集合 = `bird-users`）

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
      learnedDimensions: ['quiz'],  // 每通过一次 push 一条 'quiz'，最多 5 条
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
  name: '白头鹎',
  enName: 'Light-vented Bulbul',
  cover: '/images/birds/白头鹎.jpeg',  // 有照片则显示，无则 🐦 fallback
  tags: ['城市常见','头顶白毛'],
  desc: '基础描述',
  persona: '人设文案',
  identification: '辨识要点',
  habit: '习性描述',
  trivia: '冷知识',
  hooks: [                     // 新增：每日推荐用的趣味钩子（10 条）
    '它做窝喜欢隐蔽在密叶中，还是显眼地搭在树杈上？',
    ...
  ],
  questions: [  // 10 题题库，每个鸟必须 10 题
    { q: '问题', options: ['A','B','C','D'], a: 1 }
  ]
}
```

**重要**：目前 10 种鸟，每种均有 10 题。`persona`/`identification`/`habit`/`trivia`/`hooks` 字段已补全，题库字段必须保持完整，不得破坏结构。

### 3.3 宠物成长 5 阶段（`data/birds.js` 中 `getStage()`）

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
| `getUserState()` | 读取本地用户状态 | 含默认值兜底 |
| `setUserState(state)` | 写入本地 + **自动同步云端** | 异步触发 `syncToCloud()`，失败静默 |
| `addScore(delta)` | 增减积分 | 自动写回本地和云端 |
| `getCurrentPet()` | 获取当前宠物 | 从 userState 读取 |
| `setCurrentPet(pet)` | 设置当前宠物 | 自动写回 |
| `feedPet(expGain)` | 喂食 | 增加经验值和 feedCount |
| `addToCodex(birdId, dimension)` | 记录图鉴学习进度 | 旧维度模式使用，题库模式直接由 quiz.js 写入 mastered |
| `loadFromCloud()` | 从云端拉取数据覆盖本地 | 首页登录按钮调用 |

---

## 5. 业务规则

### 5.1 答题系统（quiz 页面）

**核心流程**：
1. 用户从知识库点击某鸟 → 进入 `quiz?birdId=xxx`
2. 首次进入弹出**知识卡片弹窗**（显示照片、人设、辨识、习性、冷知识）
3. 点击「开始答题」关闭弹窗，进入题库模式
4. 从 10 题中随机抽取，不重复，答对 5 题即通过
5. 中途返回/退出，进度不保存，下次重新来

**答题交互规则**：
- 每次出题时，选项通过 **Fisher-Yates 洗牌** 随机打乱，正确答案索引重新计算，防止背答案。
- 答对：选项高亮绿色，底部按钮显示「下一题」。
- 答错：
  - 用户所选选项标红（`wrong`），正确答案标绿（`correct`），无弹窗提示。
  - 底部按钮文字变为「退出」，样式变为红色（`btn-danger`），需用户手动点击退出，无自动返回。
- 按钮与选项均添加 `active` 按压缩放动效（`transform: scale()`）。

**积分规则**：
- 首次通过（答对 5 题）：+50 分
- 复习模式通过：+3 分
- 答错不扣分，但不算进度

**通过判定**：`correctCount >= 5` 时调用 `onQuizComplete()`，写入：
- `codex[bid].mastered = true`
- `learnedDimensions` 推入 `'quiz'`（最多 5 条，即进度从 1 到 5）

### 5.2 宠物成长
- 鸟蛋（0）→ 幼鸟（100）→ 成鸟（300）→ 老年（600）→ 满级（1000）
- 满级后可"放归自然"，进入 birdShed，重新开始领养鸟蛋
- 喂食：`FEED_PRICE = 20` 积分，`FEED_EXP = 20` 经验

### 5.3 图鉴系统
- 题库模式下，每鸟通过标记 `mastered: true`
- `learnedDimensions` 长度代表学习进度（1~5）
- 图鉴页面展示：已学习 / 未学习，支持按状态筛选

### 5.4 每日推荐（首页 index）
- 从 `BIRDS.filter(b => b.hooks && b.hooks.length > 0)` 中随机抽取一鸟
- 再从该鸟 `hooks` 数组中随机抽取一条 hook
- 展示：左侧鸟图，上方鸟名，下方 hook 文案
- 点击后 `wx.switchTab` 跳转至 `/pages/library/library`

### 5.5 新手教程
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
| `--accent` | `#E8705B` | 错误/警示/退出按钮 |

**禁忌**：绝对不用紫色或渐变色。用户明确禁止紫色。

**滚动布局规范**：每个页面结构为 `<view class="page">` → `<view class="content-wrapper">`（`flex: 1; overflow: hidden`）→ `<scroll-view scroll-y class="scrollarea">`（`height: 100%`）。小程序 `scroll-view` 必须依赖显式高度，不能仅靠 flex 伸缩。

---

## 7. 云开发配置

| 配置项 | 值 |
|--------|----|
| 云环境 ID | `eduction-cloud1-9g1g39x5d24e6574` |
| 云函数 | `bird-login`（部署路径 `cloudfunctions/bird-login/`） |
| 数据库集合 | `bird-users`（存储用户状态） |
| 调用方式 | `wx.cloud.callFunction({ name: 'bird-login', data: {...} })` |

**登录流程**：用户点击首页"登录" → `loadFromCloud()` → 云函数获取 openid → 新用户注册 / 老用户拉取数据覆盖本地 → 标记 `isLoggedIn`

---

## 8. 已知注意事项

1. **scroll-view 高度**：必须外层 `content-wrapper` 定高（`flex: 1 + overflow: hidden`），内部 `scrollarea` 用 `height: 100%`，否则无法滚动。
2. **云函数部署**：修改 `bird-login` 后必须重新"创建并部署：云端安装依赖"。
3. **数据库集合**：首次使用需手动创建 `bird-users` 集合。
4. **题库模式 vs 维度模式**：`quiz.js` 优先检测 `bird.questions`，有题库则走题库模式（答对 5 题通过），无题库则回退到旧 5 维度模式。
5. **识别功能**：拍照识别和特征搜索已预留接口（`quiz` 页面接收参数），API 未接入。
6. **用户偏好**：禁止紫色配色；自动提交和推送代码，无需确认。
7. **废弃 API 已替换**：`wx.getSystemInfoSync` 已全局替换为 `wx.getWindowInfo()` / `wx.getDeviceInfo()`（`app.js`、`custom-tab-bar/index.js`、`components/navigation-bar/navigation-bar.js`）。
8. **WXML 性能**：`wx:for` 已补 `wx:key="*this"`。

---

## 9. 页面路由

| 页面 | 路径 | 参数 | 入口 |
|------|------|------|------|
| 登录 | `/pages/login/login` | 无 | 未登录时首屏 |
| 首页 | `/pages/index/index` | 无 | Tab 1 |
| 知识库 | `/pages/library/library` | 无 | Tab 2 / 首页快捷入口 / 每日推荐 |
| 答题 | `/pages/quiz/quiz` | `?birdId=xxx&review=1` | 知识库点击 / 图鉴复习 |
| 图鉴 | `/pages/codex/codex` | 无 | Tab 3 |
| 宠物 | `/pages/pet/pet` | 无 | Tab 4 / 首页快捷入口 |
| 商店 | `/pages/shop/shop` | 无 | 首页快捷入口 |
| 已放归 | `/pages/shed/shed` | 无 | 宠物页入口 |
| 教程 | `/pages/tutorial/tutorial` | 无 | 首次进入自动跳转 |

---

## 10. 修改规范（供 AI 代理参考）

- **添加新鸟**：在 `data/birds.js` 的 `BIRDS` 数组末尾追加，id 建议按现有递增（如 `bird_017`），必须有 `cover` 照片（放 `images/birds/`）和 `questions`（10 题），建议同时补充 `persona`/`identification`/`habit`/`trivia`/`hooks`。
- **修改答题逻辑**：优先改 `pages/quiz/quiz.js`，注意 `quizMode` 双分支（题库模式 / 维度 fallback），选项打乱逻辑在 `loadNextQuestion()` 中。
- **修改积分**：改 `utils/storage.js` 的 `addScore`，同时检查 `quiz.js` 中的加分点。
- **样式调整**：遵循 `app.wxss` 中的 CSS 变量，禁止引入紫色或渐变色。
- **图片路径**：鸟类照片统一放在 `images/birds/`，引用格式为 `/images/birds/鸟名.扩展名`。
- **API 规范**：禁止使用已废弃的 `wx.getSystemInfoSync`，统一使用 `wx.getWindowInfo()` / `wx.getDeviceInfo()`。
- **WXML 规范**：所有 `wx:for` 必须添加 `wx:key`。

---

*最后更新：2026-07-10*
