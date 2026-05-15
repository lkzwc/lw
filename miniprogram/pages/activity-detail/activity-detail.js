// pages/activity-detail/activity-detail.js
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    id: '',
    activity: null,
    loading: true
  },

  onLoad: function (options) {
    const id = options.id
    if (id) {
      this.setData({ id })
      this.loadDetail(id)
    } else {
      // 模拟数据
      this.loadMockData()
    }
  },

  // 加载详情
  loadDetail: async function (id) {
    this.setData({ loading: true })
    
    try {
      // TODO: 从云数据库获取
      this.loadMockData()
    } catch (err) {
      console.error('加载失败', err)
      util.showToast('加载失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 模拟数据
  loadMockData: function () {
    this.setData({
      activity: {
        _id: '1',
        title: '亲子运动会',
        cover: '',
        location: '小区中央广场',
        timeStr: '2024年5月15日 09:00-12:00',
        desc: '欢迎小区家长带着孩子参加亲子运动会！活动项目包括：亲子接力赛、袋鼠跳、两人三足等趣味运动。参与即可获得精美礼品，前三名更有大奖！\n\n注意事项：\n1. 请穿着运动服装\n2. 自备饮用水\n3. 提前10分钟到场签到',
        status: 'upcoming',
        joinCount: 32,
        joinAvatars: ['', '', '', ''],
        isJoined: false
      },
      loading: false
    })
  },

  // 报名/取消报名
  onJoinTap: async function () {
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再报名',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' })
          }
        }
      })
      return
    }
    
    const activity = this.data.activity
    const isJoined = activity.isJoined
    
    try {
      if (isJoined) {
        // 取消报名
        this.setData({
          'activity.isJoined': false,
          'activity.joinCount': activity.joinCount - 1
        })
        util.showToast('已取消报名')
      } else {
        // 报名
        this.setData({
          'activity.isJoined': true,
          'activity.joinCount': activity.joinCount + 1
        })
        util.showToast('报名成功')
      }
      
      // TODO: 更新云数据库
    } catch (err) {
      console.error('操作失败', err)
      util.showToast('操作失败')
    }
  },

  onShareAppMessage: function () {
    const activity = this.data.activity
    return {
      title: activity ? activity.title : '邻里圈活动',
      path: `/pages/activity-detail/activity-detail?id=${this.data.id}`,
      imageUrl: activity ? activity.cover : ''
    }
  }
})