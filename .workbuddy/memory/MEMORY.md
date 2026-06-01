# MEMORY.md - 长期记忆

## 项目：邻里圈社区小程序

- **AppID:** wxe5255795fa333b60
- **云环境:** home-d1g4f2kcnf409bde5
- **技术栈:** 微信小程序原生 + WeUI + 微信云开发
- **品牌名:** 高科麓湾
- **主题色:** #4A90D9 (主色) / #6BA8E8 (浅色)
- **TabBar:** 首页/社区/我的 (3 Tab)

## UI 规范

- **卡片圆角:** 20rpx
- **导航栏:** 二级页面统一蓝色渐变背景 + 白色文字
- **图标体系:** iconfont 字体图标，禁止使用 Emoji
- **字体加载:** iconfont.wxss 中 @font-face 使用 base64 data URL 内联加载（不再依赖本地文件路径），同时 app.js 中 wx.loadFontFace 也使用同样 base64 做双重保障。真机不显示图标时优先检查字体 base64 是否正确。
- **FAB 按钮:** 圆形 100rpx，icon-tianjia 图标
- **半屏弹窗按钮:** 继承 app.wxss 全局 `.dialog-submit-btn`，不再页面级重复定义
- **搜索栏:** 融入蓝色头部，半透明背景 rgba(255,255,255,0.2)
- **iconfont 语义别名:** icon-sousuo(搜索) / icon-gonggao(公告) / icon-tiezhi(帖子) / icon-gongju(工具) / icon-yonghu(用户) / icon-qiche(汽车) / icon-rili(日历) / icon-dianhua(电话) / icon-tianjia(添加) / icon-aixin(爱心) / icon-wode(我的) / icon-guanli(管理) / icon-liulan(浏览) / icon-dingwei(定位) / icon-naozhong_huaban1(时间) / icon-pinglun(评论) / icon-baojing(报警) / icon-pingjia(评价)
- **iconfont 关键 unicode:** 定位(推荐用 icon-dingwei)=`\e6bc`（不是 `\e609`，后者在当前字体中不存在）；新闻=`\e7f7`；点赞=`\e768`

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
- **授权时机**：帖子作者打开自己帖子时请求授权（不是评论者/点赞者）
- **通知链路**：评论者评论 → 云函数 `sendSubscribeMessage` 发通知给作者
- **通知去重**：notifications 表记录，30 分钟内同一帖子同一作者不重复通知
- **评论回复嵌套通知**：B 回复 C 的评论 → C 也收到通知
- **活动提醒**：报名成功后请求授权，`activityReminder` 模板 ID 待申请
- **拒绝授权处理**：errCode 20004 → 引导去设置页 `wx.openSetting()`
- **云函数**：参数校验 + 防刷（不能给自己发）+ thing 字段截断 + miniprogramState 环境自动切换
- **subscriptions 表**：记录用户授权，字段 templateId/type/activityId/acceptTime/used
- **notifications 表**：记录已发通知去重，字段 postId/type/toOpenid/createTime
- **⚠️ 云数据库**：subscriptions / notifications 集合需在云开发控制台创建，权限设为"所有用户可读写"

## 待完成

- 天气 API 接入（config.js apiKey 为空）
- 点赞图标字体文件需更新（空心/实心目前 code 相同 \e768）
- TabBar 图标目前用 PNG，后续可考虑替换为 iconfont
- 管理员用户管理功能（admin 用户管理页 placeholder）
- 搜索功能（community 页 placeholder）
- 活动提醒模板 ID 申请（config.subscribeTemplates.activityReminder 为空）
- 活动开始前定时推送云函数（需配置云函数触发器）
- .btn-primary/.btn-secondary 在 app.wxss 和 theme.wxss 重复定义冲突
