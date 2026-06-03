# MEMORY.md - 长期记忆

## 项目：邻里圈社区小程序

- **AppID:** wxe5255795fa333b60
- **云环境:** home-d1g4f2kcnf409bde5
- **技术栈:** 微信小程序原生 + WeUI + 微信云开发
- **品牌名:** 高科麓湾
- **主题渐变:** `--gradient-primary: linear-gradient(135deg, #4A90D9 0%, #6BA8E8 100%)`，所有页面必须使用此变量，禁止硬编码渐变串
- **共享样式:** `styles/nav.wxss` 导航栏全局样式；theme.wxss 包含全局 `.fab-btn` / `.empty-text` / `.empty-hint` / `.post-header` / `.post-footer` / `.post-stat` 等。新增页面优先使用全局样式，需要覆盖的在页面级 WXSS 只写差异属性
- **TabBar:** 首页/社区/我的 (3 Tab)

## UI 规范

- **卡片圆角:** 20rpx
- **导航栏:** 所有页面统一使用 `"navigationStyle": "custom"`。全局样式在 `styles/nav.wxss`（蓝色渐变 + 白色文字），activity-detail 页面级覆盖绿色渐变，notice-detail 页面级覆盖白色背景 + 暗色文字。排除 news/webview（纯 web-view 页面不需要）
- **导航栏防分割线:** `.custom-nav` 需设 `overflow: hidden; box-shadow: none; border-bottom: none;`
- **page-header:** 底部圆角 `40rpx`，padding `0 var(--spacing-lg) var(--spacing-md)`
- **图标体系:** iconfont 字体图标，禁止使用 Emoji
- **字体加载:** iconfont.wxss 中 @font-face 使用 base64 data URL 内联加载（不再依赖本地文件路径），同时 app.js 中 wx.loadFontFace 也使用同样 base64 做双重保障。真机不显示图标时优先检查字体 base64 是否正确。
- **FAB 按钮:** 圆形 100rpx，icon-tianjia 图标。全局 `.fab-btn` 类（theme.wxss），`.fab-btn--tabbar` 修饰符用于有 TabBar 页面。使用 `var(--gradient-primary)` 渐变。无 TabBar 页面需页面级覆盖 `bottom: calc(40rpx + env(safe-area-inset-bottom))`
- **左滑删除:** 统一使用 WeUI `mp-slideview` 组件，不再手写 touch 事件。buttons 配置 `[{ text: '删除', type: 'warn' }]`，通过 `bindbuttontap` 绑定事件，用 `e.currentTarget.dataset` 获取 index/id。添加 `ext-class="slideview-item"` 确保删除按钮高度匹配列表项
- **评论层级:** 数据库 comments 集合二级评论用 `parentId`（非 `isReply`）标识，`replyToName`（非 `replyToUserName`）存回复目标用户名。判断逻辑：`isReply: !!item.parentId`
- **半屏弹窗按钮:** 继承 app.wxss 全局 `.dialog-submit-btn`，不再页面级重复定义
- **搜索栏:** 融入蓝色头部，半透明背景 rgba(255,255,255,0.2)
- **iconfont 语义别名:** icon-sousuo(搜索) / icon-gonggao(公告) / icon-tiezhi(帖子) / icon-gongju(工具→\e693) / icon-yonghu(用户→\e617) / icon-qiche(汽车) / icon-rili(日历) / icon-dianhua(电话→\e628) / icon-tianjia(添加) / icon-aixin(爱心) / icon-wode(我的→\e617) / icon-guanli(管理→\e638) / icon-liulan(浏览) / icon-dingwei(定位→\e628) / icon-naozhong_huaban1(时间) / icon-pinglun(评论) / icon-baojing(报警) / icon-pingjia(评价) / icon-tieziguanli(帖子管理) / icon-wodetiezi(我的帖子) / icon-jinengliang-xian(技能量) / icon-bianji(编辑)
- **iconfont 关键 unicode:** 定位=`\e628`（2026-06-02 更新，原 `\e6bc`）；新闻=`\e7f7`；点赞=`\e768`；帖子管理=`\e638`；用户=`\e617`；技能量=`\e693`

## 云数据库权限要点

- 微信云开发默认权限"仅创建者可写"，客户端无法 update 他人创建的文档
- 已将 posts/skills 集合权限改为"所有用户可读写"，解决跨用户写操作
- 点赞系统使用内嵌 `likedBy: [openid]` 数组，不再使用独立的 likes/skill_likes 集合
  - 点赞：`_.addToSet(openid)` + `_.inc(1)` 原子操作
  - 取消：`_.pull(openid)` + `_.inc(-1)` 原子操作
  - 判断：`likedBy.includes(openid)` 直接读文档，无需额外查询
- comments 集合也需设为"所有用户可读写"
- 删除操作也有权限问题（admin 页面删除他人帖子/技能），后续需处理

## 图标体系

- **iconfont 字体图标**：全局使用 iconfont，已替换所有 emoji 和大部分 PNG 图标
- **已替换项**：首页技能点赞❤️→icon-aixin、技能卡片浏览👁→icon-liulan、公告PNG→icon-gonggao、电话PNG→icon-dianhua
- **技能分类**：config.js skillCategories 使用 iconClass 字段（对应 iconfont 类名），不再使用 emoji
- **theme/index.js icons**：已清空（迁移至 iconfont）
- **天气图标 ☀️**：仍为 emoji，待天气 API 接入时一并替换
- **未使用的 PNG 已清理**：删除了 10 个未引用的 PNG 图标文件
- **开发辅助文件已清理**：删除了 iconfont-demo.wxml、iconfont.js、iconfont.css、demo.css、demo_index.html
- **兜底图优化**：活动封面和技能封面不再使用不相干的图片（homebg.jpeg/skill.png）做兜底，改为 CSS 渐变 + iconfont 占位符

## 主题

- `--color-secondary-bg` 已从蓝色修复为橙色 `rgba(255,107,53,0.1)`
- 边框色统一为蓝色系 `#E8F0F8`（theme.wxss 与 theme/index.js 一致）

## 订阅消息架构

- **模板 ID 集中管理**：`config.subscribeTemplates`（commentReply / activityReminder）
- **公共囤票模块**：`utils/subscribe.js`，所有页面复用
  - `trySubscribe(options)` — 底层囤票函数，支持多模板+频率控制
  - `requestCommentReplySubscribe(force)` — Tier 1 评论回复囤票
  - `requestActivityReminderSubscribe(force)` — Tier 1 活动+评论双票囤票
  - `requestLowFrequencySubscribe()` — Tier 2 低频囤票（5分钟冷却）
- **囤票策略**：
  - Tier 1（必囤，force=true）：评论提交后、帖子作者打开自己帖子、活动报名后
  - Tier 2（低频，5分钟冷却）：打开评论弹窗、点赞、转发
  - 一次弹窗可传多个 tmplIds 囤多张票
- **授权限制**：`requestSubscribeMessage` 必须在用户 tap 事件回调中调用，不能在 onShow/onLoad
- **通知链路**：评论者评论 → 云函数 `sendSubscribeMessage` 发通知给作者
- **通知去重**：notifications 表记录，30 分钟内同一帖子同一作者不重复通知
- **评论回复嵌套通知**：B 回复 C 的评论 → C 也收到通知
- **活动提醒**：报名成功后请求授权，`activityReminder` 模板 ID 待申请
- **拒绝授权处理**：errCode 20004 → 引导去设置页 `wx.openSetting()`
- **云函数**：参数校验 + 防刷（不能给自己发）+ thing 字段截断 + miniprogramState 环境自动切换
- **subscriptions 表**：记录用户授权，字段 templateId/type/activityId/acceptTime/used
- **notifications 表**：记录已发通知去重，字段 postId/type/toOpenid/createTime
- **⚠️ 云数据库**：subscriptions / notifications 集合需在云开发控制台创建，权限设为"所有用户可读写"
- **方案文档**：`docs/订阅消息囤票方案.md`

## iconfont 图标颜色规范（2026-06-02 最终版）

- **颜色由 `.iconfont` 基础类统一控制**：`color: #4A90D9`
- **iconfont.wxss 只保留**：@font-face / .iconfont / 字号辅助 class (icon-xs~icon-huge) / 图标 unicode 定义 / 语义别名
- **所有页面 WXML**：图标只用 `iconfont` + 图标名 + 可选尺寸 class，不传任何颜色 class
- **特殊颜色（点赞红心、白色FAB等）**：由组件/页面级 CSS 的父选择器控制，如 `.post-stat.liked .iconfont { color: #FF6B6B }` 或 `.publish-btn .iconfont { color: #FFF }`
- **已删除的辅助颜色 class**：icon-primary / icon-secondary / icon-muted / icon-white / icon-white-light / icon-search-bar / icon-placeholder / icon-placeholder-card / icon-liked / icon-admin / icon-time-accent / icon-people-accent

## 待完成

- 天气 API 接入（config.js apiKey 为空）
- 点赞图标字体文件需更新（空心/实心目前 code 相同 \e768）
- TabBar 图标目前用 PNG，后续可考虑替换为 iconfont
- 管理员用户管理功能（admin 用户管理页 placeholder）
- 搜索功能（community 页 placeholder）
- 活动提醒模板 ID 申请（config.subscribeTemplates.activityReminder 为空）
- 活动开始前定时推送云函数（需配置云函数触发器）
- .btn-primary/.btn-secondary 在 app.wxss 和 theme.wxss 重复定义冲突
- carpools 集合权限需改为"所有用户可读写"（左滑删除需跨用户写操作）
- discussions 集合权限需改为"所有用户可读写"（左滑删除需跨用户写操作）

## 已完成（2025-05-24）

- 业主议事厅(discuss)顶部样式统一为捎一段(carpool)风格：加nav-title、border-radius改40rpx、padding调整
- 导航栏分割线处理：`.custom-nav` 添加 `overflow:hidden; box-shadow:none; border-bottom:none;`
- 业主议事厅发起议题改为纯内容输入：移除标题输入框，title 取内容前50字自动截取
- 帖子发布移除快捷标签：移除识别标签+手动标签（求助/分享/闲聊），简化发布流程

## 已完成（2026-06-02）

- 我的技能加载修复：api.js 新增 getMySkills()，my-posts 页面支持 type=skill 参数
- 左滑删除：我的发布、我的技能、捎一段均实现 touch 事件左滑删除，二次弹框确认
- 我的点赞支持取消点赞：点击爱心或左滑"取消点赞"按钮均可取消，从列表移除
- my-posts.wxml 改为内联帖子卡片（不使用 post-card 组件），避免组件事件冒泡与滑动冲突
- 全页面统一 navigationStyle: custom：11个页面（含 discuss-detail 修复双导航栏），排除 news/webview（纯 web-view 页面）
- 自定义导航栏标准模板：custom-nav + nav-placeholder(statusBarHeight) + nav-bar(返回+标题+右侧占位) + 占位 view
- 左滑删除重构：拼车(carpool)从手写 touch 事件改为 WeUI mp-slideview 组件；议事厅(discuss)新增 mp-slideview 左滑删除
- iconfont 字体包全链路更新：替换 woff2/ttf 字体文件 + iconfont.wxss base64 + app.js 硬编码 base64，新增 icon-tieziguanli 等图标，修复 dingwei/yonghu unicode 变更
- 设计重构：提取 `--gradient-primary` CSS 变量替换 20 个文件中 58 处硬编码渐变；提取全局 `.fab-btn` + `.fab-btn--tabbar` 统一 community/carpool/discuss 三页 FAB 按钮
