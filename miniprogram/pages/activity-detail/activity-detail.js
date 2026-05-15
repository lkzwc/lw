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
      util.showToast('缺少活动ID')
      wx.navigateBack()
    }
  },

  // 加载详情
  loadDetail: async function (id) {
    this.setData({ loading: true })
    
    try {
      const db = wx.cloud.database()
      const res = await db.collection('activities').doc(id).get()
      
      this.setData({
        activity: res.data,
        loading: false
      })
    } catch (err) {
      console.error('加载失败', err)
      util.showToast('加载失败')
      wx.navigateBack()
    }
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