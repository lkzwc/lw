// pages/activity-detail/activity-detail.js
const app = getApp()
const util = require('../../utils/util')
const config = require('../../utils/config')

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
      
      const data = res.data
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
    const db = wx.cloud.database()
    const _ = db.command
    const openid = app.globalData.openid
    const avatarUrl = app.globalData.userInfo?.avatarUrl || ''
    
    try {
      if (isJoined) {
        // 取消报名 - 云数据库原子操作
        await db.collection('activities').doc(activity._id).update({
          data: {
            joinedBy: _.pull(openid),
            joinCount: _.inc(-1)
          }
        })
        
        this.setData({
          'activity.isJoined': false,
          'activity.joinCount': Math.max(0, (activity.joinCount || 0) - 1)
        })
        util.showToast('已取消报名')
      } else {
        // 报名 - 云数据库原子操作
        await db.collection('activities').doc(activity._id).update({
          data: {
            joinedBy: _.addToSet(openid),
            joinCount: _.inc(1)
          }
        })
        
        this.setData({
          'activity.isJoined': true,
          'activity.joinCount': (activity.joinCount || 0) + 1
        })
        util.showToast('报名成功')

        // 报名成功后请求订阅授权，活动开始前可收到提醒
        this.requestActivityReminder()
      }
    } catch (err) {
      console.error('操作失败', err)
      util.showToast('操作失败，请重试')
    }
  },

  /**
   * 报名成功后请求订阅授权
   * 用户点击"立即报名"是合法的交互时机
   * 授权后，活动开始前可通过云函数发送提醒
   */
  requestActivityReminder: function () {
    const templateId = config.subscribeTemplates.activityReminder
    if (!templateId) {
      // 模板 ID 未配置，跳过订阅
      return
    }

    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (res) => {
        if (res[templateId] === 'accept') {
          // 记录授权，后续云函数定时任务可据此发送提醒
          this.recordSubscription(templateId, 'activity_reminder')
        }
      },
      fail: (err) => {
        // errCode 20004 = 用户不再询问
        if (err.errCode === 20004) {
          wx.showModal({
            title: '开启活动提醒',
            content: '您已关闭通知授权，如需接收活动开始提醒，请在设置中开启',
            confirmText: '去设置',
            cancelText: '暂不',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        }
      }
    })
  },

  // 记录用户订阅授权
  recordSubscription: async function (templateId, type) {
    try {
      const db = wx.cloud.database()
      await db.collection('subscriptions').add({
        data: {
          templateId,
          type,
          activityId: this.data.id,
          acceptTime: db.serverDate(),
          used: false
        }
      })
    } catch (err) {
      console.error('记录订阅授权失败', err)
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
