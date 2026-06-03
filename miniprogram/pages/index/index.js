// pages/index/index.js - 高科麓湾未来感首页
const app = getApp()
const util = require('../../utils/util')
const api = require('../../utils/api')

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
      { id: 'carpool', name: '捎一段', icon: 'icon-yewujieshao-chengjipinche' },
      { id: 'news', name: '60秒知天下', icon: 'icon-xinwen' },
      { id: 'timeline', name: '小区时间线', icon: 'icon-jilu' }
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
      const notices = await api.notice.getList(5)
      const processedNotices = notices.map(item => ({
        ...item,
        dateStr: this.formatDate(item.createTime)
      }))
      this.setData({ notices: processedNotices })
    } catch (err) {
      console.error('加载公告失败', err)
    }
  },

  // 加载技能
  loadSkills: async function () {
    try {
      const res = await api.skill.getList({ pageSize: 6 })
      const skills = res.list.map(item => ({
        ...item,
        // 取第一张图片，没有则用兜底图
        cover: (item.images && item.images.length > 0) ? item.images[0] : '',
        avatar: (item.userInfo && item.userInfo.avatarUrl) ? item.userInfo.avatarUrl : '/assets/icons/avatar.png',
        author: (item.userInfo && item.userInfo.nickName) ? item.userInfo.nickName : '邻居',
        likes: item.likeCount || 0
      }))
      this.setData({ skills })
    } catch (err) {
      console.error('加载技能失败', err)
    }
  },

  // 加载活动
  loadActivities: async function () {
    try {
      const res = await api.activity.getList({ pageSize: 3 })
      const activities = res.list.map(item => ({
        ...item,
        timeStr: item.time || item.date || this.formatDate(item.createTime),
        cover: item.cover || item.images && item.images.length > 0 ? item.images[0] : ''
      }))
      this.setData({ activities })
    } catch (err) {
      console.error('加载活动失败', err)
    }
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
      }
    })
  },

  // 通知
  onNotifyTap: function () {
    wx.showModal({
      title: '消息通知',
      content: '通知功能即将上线，敬请期待',
      confirmText: '知道了',
      showCancel: false
    })
  },

  // 菜单点击
  onMenuTap: function (e) {
    const id = e.currentTarget.dataset.id

    // 一键报警：确认后直接拨打物业安保电话
    if (id === 'alarm') {
      wx.showModal({
        title: '一键报警',
        content: '确认拨打物业安保电话 029-83584509？\n\n如遇紧急情况请直接拨打 110',
        confirmText: '立即拨打',
        confirmColor: '#E74C3C',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: '02983584509',
              fail: (err) => {
                if (err.errMsg !== 'makePhoneCall:fail cancel' && err.errMsg !== 'makePhoneCall:fail user cancel') {
                  util.showToast('拨打失败，请手动拨打')
                }
              }
            })
          }
        }
      })
      return
    }

    // 一键物业：拨打物业服务电话
    if (id === 'property') {
      wx.makePhoneCall({
        phoneNumber: '02983584509',
        fail: (err) => {
          if (err.errMsg !== 'makePhoneCall:fail cancel' && err.errMsg !== 'makePhoneCall:fail user cancel') {
            util.showToast('拨打失败，请手动拨打 029-83584509')
          }
        }
      })
      return
    }

    // 一键楼管：拨打楼管服务电话
    if (id === 'manager') {
      wx.makePhoneCall({
        phoneNumber: '02983584509',
        fail: (err) => {
          if (err.errMsg !== 'makePhoneCall:fail cancel' && err.errMsg !== 'makePhoneCall:fail user cancel') {
            util.showToast('拨打失败，请手动拨打 029-83584509')
          }
        }
      })
      return
    }

    const routes = {
      'discuss': '/pages/discuss/discuss',
      'carpool': '/pages/carpool/carpool',
      'timeline': '/pages/timeline/timeline',
      'skill': '/pages/skill-wall/skill-wall'
    }
    
    // 60秒知天下 → 新闻页（内嵌 webview）
    if (id === 'news') {
      wx.navigateTo({
        url: '/pages/news/news'
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