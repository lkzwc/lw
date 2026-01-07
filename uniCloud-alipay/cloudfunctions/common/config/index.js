// 项目配置文件
module.exports = {
  // 高德地图API配置
  amap: {
    key: process.env.AMAP_KEY || '21fe33e33ccc4559f2671ef63f997ecd' // 生产环境中应通过环境变量配置
  },
  
  // 微信登录配置
  wechat: {
    appId: process.env.WECHAT_APPID || 'wxdfe9979725d25ed2', // 生产环境中应通过环境变量配置
    appSecret: process.env.WECHAT_APP_SECRET || 'cf39bd3f424dcd580a84990479549c5c' // 生产环境中应通过环境变量配置
  }
};