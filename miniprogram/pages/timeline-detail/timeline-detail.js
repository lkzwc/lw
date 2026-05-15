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
      detail: {
        _id: '1',
        userName: '王先生',
        avatar: '',
        timeStr: '今天 14:30',
        type: 'issue',
        typeLabel: '问题',
        title: '3号楼电梯有异响，请物业尽快检修',
        desc: '最近几天发现3号楼电梯运行时有明显的异响，特别是在上升过程中，声音比较大。希望物业能够尽快安排专业人员检查维修，确保业主出行安全。',
        images: [],
        status: 'processing',
        statusText: '处理中',
        likeCount: 12,
        commentCount: 5
      },
      comments: [
        {
          _id: '1',
          userName: '李女士',
          avatar: '',
          content: '我也听到了，确实挺响的',
          timeStr: '今天 15:00'
        },
        {
          _id: '2',
          userName: '物业管理处',
          avatar: '',
          content: '已收到反馈，明天上午安排维保单位上门检查',
          timeStr: '今天 15:30'
        }
      ],
      loading: false
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