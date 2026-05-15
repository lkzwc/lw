// pages/index/index.js - 高科麓湾未来感首页
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    hasNotify: false,
    
    // 天气信息
    weather: {
      icon: '☀️',
      temp: 28,
      desc: '晴',
      airQuality: '优'
    },
    
    // 第一行：三个一键
    row1Menus: [
      { id: 'property', name: '一键物业', icon: 'icon-wuyebaoxiu' },
      { id: 'manager', name: '一键楼管', icon: 'icon-kefu' },
      { id: 'alarm', name: '一键报警', icon: 'icon-baojing' }
    ],
    
    // 第二行
    row2Menus: [
      { id: 'discuss', name: '业主议事厅', icon: 'icon-pinglun' },
      { id: 'carpool', name: '牛马拼车', icon: 'icon-yewujieshao-chengjipinche' },
      { id: 'news', name: '60秒知天下', icon: 'icon-xinwen' },
      { id: 'timeline', name: '小区时间线', icon: 'icon-richangjilu' }
    ],
    
    // 公告
    notices: [],
    
    // 技能列表
    skills: [],
    
    // 活动列表
    activities: []
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  // 加载数据
  loadData: function () {
    this.loadNotices()
    this.loadSkills()
    this.loadActivities()
    this.loadWeather()
  },

  // 加载公告
  loadNotices: async function () {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('notices')
        .where({ status: 'published' })
        .orderBy('createTime', 'desc')
        .limit(3)
        .get()

      const notices = res.data.map(item => ({
        ...item,
        dateStr: this.formatDate(item.createTime)
      }))

      this.setData({ notices })
    } catch (err) {
      console.error('加载公告失败', err)
      // 兜底模拟数据
      this.setData({
        notices: [
          { _id: 'n1', title: '物业通知：本周六小区绿化修剪，请大家注意避让', category: '物业通知', dateStr: '05-15' },
          { _id: 'n2', title: '关于小区停车位分配方案的投票通知', category: '投票', dateStr: '05-12' },
          { _id: 'n3', title: '社区亲子运动会报名开始啦！', category: '活动', dateStr: '05-10' }
        ]
      })
    }
  },

  // 加载技能
  loadSkills: function () {
    this.setData({
      skills: [
        { _id: '1', title: 'AI绘画入门教程', cover: '', avatar: '', author: '张老师', likes: 128 },
        { _id: '2', title: '家庭收纳小技巧', cover: '', avatar: '', author: '李阿姨', likes: 256 },
        { _id: '3', title: '手机摄影构图法', cover: '', avatar: '', author: '王先生', likes: 89 }
      ]
    })
  },

  // 加载活动
  loadActivities: function () {
    this.setData({
      activities: [
        { 
          _id: '1', 
          title: '亲子运动会', 
          cover: '', 
          month: '5月', 
          day: '15', 
          location: '中央广场', 
          timeStr: '09:00-12:00',
          isJoined: false
        },
        { 
          _id: '2', 
          title: '社区读书会', 
          cover: '', 
          month: '5月', 
          day: '18', 
          location: '社区图书馆', 
          timeStr: '14:00-16:00',
          isJoined: true
        }
      ]
    })
  },

  // 格式化日期
  formatDate: function (timestamp) {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },

  // 加载天气
  loadWeather: function () {
    // TODO: 调用天气API
    this.setData({
      weather: {
        icon: '☀️',
        temp: 28,
        desc: '晴',
        airQuality: '优'
      }
    })
  },

  // 公告点击
  onNoticeTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  },

  // 扫码
  onScanTap: function () {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果', res)
      }
    })
  },

  // 通知
  onNotifyTap: function () {
    util.showToast('通知功能开发中')
  },

  // 菜单点击
  onMenuTap: function (e) {
    const id = e.currentTarget.dataset.id
    const routes = {
      'property': '/pages/carpool/carpool',
      'manager': '/pages/carpool/carpool',
      'alarm': '/pages/carpool/carpool',
      'discuss': '/pages/discuss/discuss',
      'carpool': '/pages/carpool/carpool',
      'timeline': '/pages/timeline/timeline',
      'skill': '/pages/skill-wall/skill-wall'
    }
    
    // 60s知天下跳转外部链接
    if (id === 'news') {
      wx.navigateTo({
        url: '/pages/webview/webview?url=https://newsnow.busiyi.world/'
      })
      return
    }
    
    const url = routes[id]
    if (url) {
      wx.navigateTo({ url })
    } else {
      util.showToast('功能开发中')
    }
  },

  // 技能更多
  onSkillMore: function () {
    wx.navigateTo({
      url: '/pages/skill-wall/skill-wall'
    })
  },

  // 技能点击
  onSkillTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/skill-detail/skill-detail?id=${id}`
    })
  },

  // 活动更多
  onActivityMore: function () {
    wx.navigateTo({
      url: '/pages/activity/activity'
    })
  },

  // 活动点击
  onActivityTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${id}`
    })
  },

  onShareAppMessage: function () {
    return {
      title: '高科麓湾 - 美好社区 智慧生活',
      path: '/pages/index/index'
    }
  }
})