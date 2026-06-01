// pages/timeline-detail/timeline-detail.js
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    id: '',
    detail: null,
    comments: [],
    commentInput: '',
    loading: true
  },

  onLoad: function (options) {
    const id = options.id
    if (id) {
      this.setData({ id })
      this.loadDetail(id)
    } else {
      this.loadMockData()
    }
  },

  // 加载详情
  loadDetail: async function (id) {
    this.setData({ loading: true })
    
    try {
      const db = wx.cloud.database()
      const _ = db.command

      // 加载详情
      const detailRes = await db.collection('timeline').doc(id).get()

      const typeMap = {
        issue: '问题反馈',
        notice: '小区通知',
        improve: '建议改进'
      }
      const statusMap = {
        pending: '待处理',
        processing: '处理中',
        resolved: '已解决'
      }
      const raw = detailRes.data || {}
      const detail = {
        ...raw,
        userName: raw.userName || '邻居',
        avatar: raw.avatar || '',
        title: raw.title || typeMap[raw.type] || '时间线详情',
        desc: raw.desc || '',
        typeLabel: typeMap[raw.type] || '',
        statusText: statusMap[raw.status] || '',
        timeStr: util.formatRelativeTime(raw.createTime),
        images: raw.images || []
      }
      
      // 加载评论列表
      const commentRes = await db.collection('timeline_comments')
        .where({ timelineId: id, status: _.neq('deleted') })
        .orderBy('createTime', 'desc')
        .limit(50)
        .get()

      const comments = (commentRes.data || []).map(item => ({
        _id: item._id,
        userName: item.userName || '邻居',
        avatar: item.avatar || '',
        content: item.content || '',
        timeStr: util.formatRelativeTime(item.createTime)
      })).reverse()

      this.setData({
        detail,
        comments,
        loading: false
      })
    } catch (err) {
      console.error('加载失败', err)
      this.setData({ loading: false })
      wx.showModal({
        title: '加载失败',
        content: '数据加载失败，请返回重试',
        showCancel: false,
        confirmText: '返回',
        success: () => {
          wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/index/index' }) })
        }
      })
    }
  },

  // 加载模拟数据（无ID时使用）
  loadMockData: function () {
    this.setData({
      loading: false,
      detail: {
        title: '小区动态',
        content: '暂无详细信息'
      }
    })
  },

  // 输入评论
  onCommentInput: function (e) {
    this.setData({ commentInput: e.detail.value })
  },

  // 发送评论
  onSendComment: async function () {
    const content = this.data.commentInput.trim()
    if (!content) {
      util.showToast('请输入评论内容')
      return
    }
    
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再评论',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' })
          }
        }
      })
      return
    }

    try {
      const db = wx.cloud.database()
      
      // 保存评论到云数据库
      await db.collection('timeline_comments').add({
        data: {
          timelineId: this.data.id,
          userName: app.globalData.userInfo?.nickName || '邻居',
          avatar: app.globalData.userInfo?.avatarUrl || '',
          content,
          status: 'active',
          createTime: db.serverDate()
        }
      })

      // 添加到本地列表（不用重新加载）
      const newComment = {
        _id: Date.now().toString(),
        userName: app.globalData.userInfo?.nickName || '我',
        avatar: app.globalData.userInfo?.avatarUrl || '',
        content: content,
        timeStr: '刚刚'
      }
      
      this.setData({
        comments: [...this.data.comments, newComment],
        commentInput: ''
      })
      
      util.showToast('评论成功')
    } catch (err) {
      console.error('评论失败', err)
      util.showToast('评论失败，请重试')
    }
  },

  // 预览图片
  onImageTap: function (e) {
    const { images, current } = e.currentTarget.dataset
    wx.previewImage({
      current,
      urls: images
    })
  },

  onShareAppMessage: function () {
    const detail = this.data.detail
    return {
      title: detail ? detail.title : '小区动态',
      path: `/pages/timeline-detail/timeline-detail?id=${this.data.id}`
    }
  }
})
