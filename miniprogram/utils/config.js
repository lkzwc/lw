// utils/config.js - 配置文件

module.exports = {
  // 技能墙类目
  skillCategories: [
    { id: 'housekeeping', name: '家政保洁', iconClass: 'icon-wuyebaoxiu' },
    { id: 'repair', name: '维修服务', iconClass: 'icon-gongju' },
    { id: 'tutor', name: '家教辅导', iconClass: 'icon-bangzhuzhongxin' },
    { id: 'moving', name: '搬家服务', iconClass: 'icon-qiche' },
    { id: 'pet', name: '宠物照料', iconClass: 'icon-aixin' },
    { id: 'other', name: '其他', iconClass: 'icon-pingjia' }
  ],
  
  // 期号选项（高科麓湾 4 期）
  phases: ['一期', '二期', '三期', '四期'],

  // 各期楼号
  phaseBuildings: {
    '一期': Array.from({ length: 17 }, (_, i) => `${i + 1}栋`),
    '二期': Array.from({ length: 27 }, (_, i) => `${i + 1}栋`),
    '三期': Array.from({ length: 20 }, (_, i) => `${i + 1}栋`),
    '四期': ['1栋', '2栋', '3栋', '4栋', '5栋', '6栋', '7栋', 'L1', 'L2']
  },
  
  // 天气API配置（西安灞桥区）
  weather: {
    city: '西安',
    district: '灞桥区',
    apiKey: ''
  },
  
  // 图片上传配置
  upload: {
    maxCount: 6,        // 最大图片数量
    maxSize: 5 * 1024 * 1024, // 最大文件大小 5MB
    maxSizeText: '5MB'
  },
  
  // 分页配置
  pagination: {
    defaultPageSize: 10,
    postPageSize: 10,
    skillPageSize: 10,
    commentPageSize: 20
  },
  
  // 缓存配置
  cache: {
    userInfoExpire: 7 * 24 * 60 * 60 * 1000, // 用户信息缓存7天
    noticeExpire: 30 * 60 * 1000 // 公告缓存30分钟
  },

  // 订阅消息模板 ID（需在微信公众平台后台 → 订阅消息 中配置）
  subscribeTemplates: {
    // 评论回复通知 - 通知帖子作者有人评论
    commentReply: '19XJ-vNa8CD9RTDJG42yqTGklIkX0lep2o2CR50yVFI',
    // 活动提醒 - 活动开始前通知报名用户
    activityReminder: '' // TODO: 在微信公众平台后台申请活动提醒模板后填入
  }
}