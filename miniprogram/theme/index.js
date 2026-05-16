/**
 * 主题配置文件 - 邻里圈社区小程序
 * 可通过修改此文件快速切换整体视觉风格
 */

// 当前主题：清新蓝
const theme = {
  // ========== 核心色板 ==========
  colors: {
    // 主色调 - 清新的蓝色系
    primary: '#4A90D9',
    primaryLight: '#6BA8E8',
    primaryDark: '#3A7BC8',
    primaryBg: 'rgba(74, 144, 217, 0.1)',
    
    // 辅助色 - 温暖的橙色系
    secondary: '#FF6B35',
    secondaryLight: '#FF8B5A',
    secondaryDark: '#E55A25',
    secondaryBg: 'rgba(255, 107, 53, 0.1)',
    
    // 功能色
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    info: '#1890FF',
    
    // 文字色
    textPrimary: '#2D2D2D',
    textSecondary: '#666666',
    textPlaceholder: '#999999',
    textDisabled: '#CCCCCC',
    textWhite: '#FFFFFF',
    
    // 背景色 - 清新的浅蓝系
    bgPrimary: '#F4F7FB',
    bgSecondary: '#FFFFFF',
    bgCard: '#FFFFFF',
    bgMask: 'rgba(0, 0, 0, 0.5)',
    
    // 边框色
    border: '#E8F0F8',
    borderLight: '#F0F5FA',
    borderDark: '#D8E8F5',
    
    // 渐变色
    gradientPrimary: 'linear-gradient(135deg, #4A90D9 0%, #6BA8E8 100%)',
    gradientSecondary: 'linear-gradient(135deg, #FF6B35 0%, #FF8B5A 100%)',
    gradientWarm: 'linear-gradient(180deg, #F4F7FB 0%, #FFFFFF 100%)',
    gradientCard: 'linear-gradient(135deg, #FFFFFF 0%, #F8FBFE 100%)',
  },
  
  // ========== 字体规范 ==========
  typography: {
    // 字号
    fontSizeXs: 20,   // 辅助信息
    fontSizeSm: 24,   // 小字
    fontSizeBase: 28, // 正文
    fontSizeMd: 32,   // 小标题
    fontSizeLg: 36,   // 标题
    fontSizeXl: 44,   // 大标题
    fontSizeXxl: 56,  // 特大标题
    
    // 字重
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    
    // 行高
    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightLoose: 1.8,
  },
  
  // ========== 间距规范 ==========
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
  },
  
  // ========== 圆角规范 ==========
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    round: 999,
  },
  
  // ========== 阴影规范 ==========
  shadows: {
    sm: '0 2rpx 8rpx rgba(74, 144, 217, 0.08)',
    md: '0 4rpx 16rpx rgba(74, 144, 217, 0.12)',
    lg: '0 8rpx 32rpx rgba(74, 144, 217, 0.16)',
    card: '0 4rpx 20rpx rgba(45, 45, 45, 0.06)',
    float: '0 8rpx 40rpx rgba(45, 45, 45, 0.12)',
  },
  
  // ========== 动画时长 ==========
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  
  // ========== 图标映射 ==========
  // 可替换为自定义图标
  icons: {
    // 快捷入口图标
    property: '🏠',      // 一键物业
    manager: '👨‍💼',    // 一键楼管
    alarm: '🚨',        // 一键报警
    vote: '🗳️',        // 业主议事厅
    carpool: '🚗',      // 捎一段
    news: '📰',        // 60秒知天下
    timeline: '📅',    // 小区时间线
    skill: '🛠️',       // 技能墙
    
    // 功能图标
    weather: '☀️',
    notice: '📢',
    activity: '🎉',
    hot: '🔥',
    location: '📍',
    phone: '📞',
    time: '⏰',
    user: '👤',
    like: '❤️',
    comment: '💬',
    share: '🔗',
    arrow: '›',
    check: '✓',
    close: '✕',
  },
}

// 导出主题
module.exports = theme

// 导出获取颜色的方法（便于在JS中使用）
module.exports.getColor = function(path) {
  const parts = path.split('.')
  let result = theme.colors
  for (const part of parts) {
    result = result[part]
    if (!result) return null
  }
  return result
}