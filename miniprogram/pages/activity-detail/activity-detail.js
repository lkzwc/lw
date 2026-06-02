// pages/activity-detail/activity-detail.js
const app = getApp()
const util = require('../../utils/util')
const config = require('../../utils/config')
const subscribe = require('../../utils/subscribe') // 订阅消息囤票模块
const api = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 20,
    id: '',
    activity: null,
    loading: true
  },

  onLoad: function (options) {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })

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
      const data = await api.activity.getDetail(id)
      const openid = app.globalData.openid || ''
      
      const activity = {
        ...data,
        timeStr: data.time || data.date || '',
        isJoined: data.joinedBy ? data.joinedBy.includes(openid) : false
      }
      
      this.setData({
        activity,
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
    const openid = app.globalData.openid
    
    try {
      if (isJoined) {
        await api.activity.cancelJoin(activity._id, openid)
        
        this.setData({
          'activity.isJoined': false,
          'activity.joinCount': Math.max(0, (activity.joinCount || 0) - 1)
        })
        util.showToast('已取消报名')
      } else {
        await api.activity.join(activity._id, openid)
        
        this.setData({
          'activity.isJoined': true,
          'activity.joinCount': (activity.joinCount || 0) + 1
        })
        util.showToast('报名成功')

        // Tier 1 囤票（必囤）：报名成功后请求订阅授权
        // 一次弹窗囤活动提醒+评论回复两张票
        // force=true 表示每次报名都弹授权窗（报名是用户明确意图，不受频率控制）
        subscribe.requestActivityReminderSubscribe(true)
      }
    } catch (err) {
      console.error('操作失败', err)
      util.showToast('操作失败，请重试')
    }
  },

  onShareAppMessage: function () {
    const activity = this.data.activity
    return {
      title: activity ? activity.title : '邻里圈活动',
      path: `/pages/activity-detail/activity-detail?id=${this.data.id}`,
      imageUrl: activity ? activity.cover : ''
    }
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
