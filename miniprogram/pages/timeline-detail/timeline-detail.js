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
      const res = await db.collection('timeline').doc(id).get()
      
      this.setData({
        detail: res.data,
        loading: false
      })
    } catch (err) {
      console.error('加载失败', err)
      util.showToast('加载失败')
      wx.navigateBack()
    }
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
    // TODO: 保存到云数据库
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