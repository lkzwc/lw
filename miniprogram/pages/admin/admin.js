// pages/admin/admin.js
const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 20,
    totalPosts: 0,
    totalSkills: 0,
    totalComments: 0,
    totalUsers: 0,
    todayOnline: 0
  },

  onLoad: function () {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })
    this.loadStats()
  },

  onShow: function () {
    this.loadStats()
  },

  // 加载统计数据
  loadStats: async function () {
    try {
      const db = wx.cloud.database()
      const _ = db.command
      
      // 今日零点时间
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 并行查询全部数据
      const [postsRes, skillsRes, commentsRes, usersRes, todayUsersRes] = await Promise.all([
        db.collection('posts').where({
          status: _.neq('deleted')
        }).count(),
        db.collection('skills').where({
          status: _.neq('deleted')
        }).count(),
        db.collection('comments').where({
          status: _.neq('deleted')
        }).count(),
        db.collection('users').count(),
        // 今日活跃用户
        db.collection('users').where({
          updateTime: _.gte(today)
        }).count()
      ])
      
      this.setData({
        totalPosts: postsRes.total || 0,
        totalSkills: skillsRes.total || 0,
        totalComments: commentsRes.total || 0,
        totalUsers: usersRes.total || 0,
        todayOnline: todayUsersRes.total || 0
      })
    } catch (err) {
      console.error('加载统计失败', err)
    }
  },

  // 公告管理
  onNoticeManage: function () {
    wx.navigateTo({ url: '/pages/admin/notice/notice' })
  },

  // 帖子管理
  onPostManage: function () {
    wx.navigateTo({ url: '/pages/admin/post/post' })
  },

  // 技能管理
  onSkillManage: function () {
    wx.navigateTo({ url: '/pages/admin/skill/skill' })
  },

  // 用户管理
  onUserManage: function () {
    wx.showModal({
      title: '用户管理',
      content: '功能即将上线，届时可查看和管理社区用户',
      confirmText: '知道了',
      showCancel: false
    })
  },

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' })
      }
    })
  }
})