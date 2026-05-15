// utils/config.js - 配置文件

module.exports = {
  // 技能墙类目
  skillCategories: [
    { id: 'housekeeping', name: '家政保洁', icon: '🏠' },
    { id: 'repair', name: '维修服务', icon: '🔧' },
    { id: 'tutor', name: '家教辅导', icon: '📚' },
    { id: 'moving', name: '搬家服务', icon: '🚚' },
    { id: 'pet', name: '宠物照料', icon: '🐾' },
    { id: 'other', name: '其他', icon: '📋' }
  ],
  
  // 期号选项
  phases: ['一期', '二期', '三期', '四期'],
  
  // 楼号选项
  buildings: Array.from({ length: 20 }, (_, i) => `${i + 1}栋`),
  
  // 天气API配置（西安灞桥区）
  weather: {
    city: '西安',
    district: '灞桥区',
    // 可替换为实际天气API
    apiKey: ''
  },
  
  // 新闻API配置
  news: {
    // 可使用天行数据、聚合数据等免费API
    apiKey: '',
    pageSize: 10
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
  }
}