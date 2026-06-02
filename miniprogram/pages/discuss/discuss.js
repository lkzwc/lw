// pages/discuss/discuss.js - 业主议事厅列表版
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    topics: [],
    loading: true,
    statusBarHeight: 20,

    // 发布弹窗
    showPublishDialog: false,
    submitting: false,
    canSubmit: false,
    publishForm: {
      content: ''
    }
  },

  onLoad: function () {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })
    this.loadTopics()
  },

  onPullDownRefresh: function () {
    this.loadTopics().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载议题列表
  loadTopics: async function () {
    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const _ = db.command

      const res = await db.collection('discussions')
        .where({
          status: _.neq('deleted')
        })
        .orderBy('createTime', 'desc')
        .get()

      this.setData({ topics: this.formatTopics(res.data) })
    } catch (err) {
      console.error('加载议题失败', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 格式化议题展示字段
  formatTopics: function (topics) {
    const statusMap = {
      discussing: '讨论中',
      voting: '投票中',
      resolved: '已解决'
    }

    return topics.map(item => ({
      ...item,
      title: item.title || '',
      description: item.description || item.desc || '',
      statusText: item.statusText || statusMap[item.status] || '讨论中',
      author: item.author || item.userName || '邻居',
      avatar: item.avatar || item.avatarUrl || '',
      createTime: item.createTime ? util.formatDate(item.createTime, 'MM-DD HH:mm') : '',
      commentCount: item.commentCount || 0
    }))
  },

  // 点击议题 → 跳转详情
  onTopicTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/discuss-detail/discuss-detail?id=${id}`
    })
  },

  // 打开发布弹窗
  onPublishTap: function () {
    if (!app.globalData.isLoggedIn || !app.globalData.openid) {
      wx.showModal({
        title: '提示',
        content: '发起议题需要先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' })
          }
        }
      })
      return
    }

    this.setData({
      showPublishDialog: true,
      publishForm: { content: '' },
      canSubmit: false
    })
  },

  // 关闭发布弹窗
  onClosePublishDialog: function () {
    this.setData({ showPublishDialog: false })
  },

  // 检查是否可以提交
  checkCanSubmit: function () {
    this.setData({ canSubmit: !!this.data.publishForm.content.trim() })
  },

  // 输入内容
  onContentInput: function (e) {
    this.setData({ 'publishForm.content': e.detail.value }, this.checkCanSubmit)
  },

  // 提交发布
  onSubmit: async function () {
    if (!this.data.canSubmit || this.data.submitting) return
    this.setData({ submitting: true })

    try {
      const db = wx.cloud.database()
      const { publishForm } = this.data
      const userInfo = app.globalData.userInfo || {}

      await db.collection('discussions').add({
        data: {
          title: publishForm.content.trim().substring(0, 50), // 取内容前50字作为标题
          description: publishForm.content.trim(),
          status: 'discussing',
          statusText: '讨论中',
          author: userInfo.nickName || '邻居',
          avatarUrl: userInfo.avatarUrl || '',
          commentCount: 0,
          joinAvatars: [],
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })

      util.showToast('发起成功')
      this.setData({
        showPublishDialog: false,
        publishForm: { content: '' },
        canSubmit: false
      })
      this.loadTopics()
    } catch (err) {
      console.error('发布失败', err)
      util.showToast(err.errMsg || err.message || '发起失败')
    } finally {
      this.setData({ submitting: false })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '业主议事厅 - 共商共议，共建美好家园',
      path: '/pages/discuss/discuss'
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
