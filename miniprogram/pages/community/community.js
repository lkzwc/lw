// pages/community/community.js - 按设计图重构
const app = getApp()
const util = require('../../utils/util')
const db = wx.cloud.database()

Page({
  data: {
    posts: [],
    currentTag: '',
    page: 1,
    hasMore: true,
    loading: true,
    loadingMore: false,
    // 发布弹窗
    showPublishDialog: false,
    submitting: false,
    publishForm: {
      content: '',
      tag: '',
      images: [],
      detectedTags: []
    }
  },

  onLoad: function () {
    this.loadPosts()
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    // 每次显示刷新列表
    if (this.data.posts.length > 0) {
      this.loadPosts()
    }
  },

  onPullDownRefresh: function () {
    this.setData({ page: 1, hasMore: true })
    this.loadPosts().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  // 加载帖子 - 优先从云数据库读取
  loadPosts: async function () {
    this.setData({ loading: true })

    try {
      const res = await db.collection('posts')
        .orderBy('createTime', 'desc')
        .limit(20)
        .get()

      let posts = res.data.map(p => ({
        ...p,
        timeStr: util.formatTime(new Date(p.createTime)),
        isLiked: false
      }))

      this.setData({
        posts,
        hasMore: false,
        page: 1
      })
    } catch (err) {
      console.error('加载帖子失败', err)
      this.setData({
        posts: [],
        hasMore: false,
        page: 1
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载更多
  loadMore: async function () {
    this.setData({ loadingMore: true })
    setTimeout(() => {
      this.setData({ loadingMore: false, hasMore: false })
    }, 1000)
  },

  // 搜索
  onSearchTap: function () {
    util.showToast('搜索功能开发中')
  },

  // 标签筛选
  onTagTap: function (e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({ currentTag: tag, page: 1 })
    this.loadPosts()
  },

  // 点击帖子
  onPostTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${id}`
    })
  },

  // 图片预览
  onImageTap: function (e) {
    const { images, current } = e.currentTarget.dataset
    wx.previewImage({
      current,
      urls: images
    })
  },

  // 点赞（同时跳转详情页）
  onLikeTap: function (e) {
    const id = e.currentTarget.dataset.id
    // 跳转到帖子详情
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${id}`
    })
  },

  // 打开发布弹窗
  onPublishTap: function () {
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再发布',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/mine/mine'
            })
          }
        }
      })
      return
    }
    
    this.setData({
      showPublishDialog: true,
      submitting: false,
      publishForm: {
        content: '',
        tag: '',
        images: [],
        detectedTags: []
      }
    })
  },

  // 关闭发布弹窗
  onClosePublishDialog: function () {
    this.setData({ showPublishDialog: false })
  },

  // 输入内容 - 自动识别#标签
  onContentInput: function (e) {
    const content = e.detail.value
    // 自动识别 #标签
    const tagRegex = /#([^\s#]+)/g
    const detectedTags = []
    let match
    while ((match = tagRegex.exec(content)) !== null) {
      const tag = match[1]
      if (!detectedTags.includes(tag)) {
        detectedTags.push(tag)
      }
    }
    this.setData({
      'publishForm.content': content,
      'publishForm.detectedTags': detectedTags
    })
  },

  // 选择标签
  onTagSelect: function (e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({
      'publishForm.tag': this.data.publishForm.tag === tag ? '' : tag
    })
  },

  // 添加图片
  onAddImage: function () {
    const count = 6 - this.data.publishForm.images.length
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const images = [...this.data.publishForm.images, ...res.tempFiles.map(f => f.tempFilePath)]
        this.setData({ 'publishForm.images': images })
      }
    })
  },

  // 删除图片
  onDeleteImage: function (e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.publishForm.images.filter((_, i) => i !== index)
    this.setData({ 'publishForm.images': images })
  },

  // 提交帖子 - 写入云数据库
  onSubmitPost: async function () {
    const { content, tag, images, detectedTags } = this.data.publishForm
    
    if (!content.trim()) {
      util.showToast('请输入帖子内容')
      return
    }
    
    // 合并自动识别标签和手动选择标签
    const allTags = [...detectedTags]
    if (tag && !allTags.includes(tag)) {
      allTags.push(tag)
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })

    try {
      // 上传图片到云存储
      const uploadedImages = []
      for (let i = 0; i < images.length; i++) {
        const filePath = images[i]
        const cloudPath = `posts/${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}.jpg`
        try {
          const uploadRes = await wx.cloud.uploadFile({
            cloudPath,
            filePath
          })
          uploadedImages.push(uploadRes.fileID)
        } catch (uploadErr) {
          console.error('上传图片失败', uploadErr)
          // 上传失败用本地路径兜底
          uploadedImages.push(filePath)
        }
      }

      // 写入云数据库
      const userInfo = app.globalData.userInfo || {}
      await db.collection('posts').add({
        data: {
          content: content.trim(),
          tag: tag || '',
          tags: allTags,
          images: uploadedImages,
          likeCount: 0,
          commentCount: 0,
          userInfo: {
            nickName: userInfo.nickName || '邻居',
            avatarUrl: userInfo.avatarUrl || ''
          },
          createTime: db.serverDate(),
          status: 'published'
        }
      })

      wx.hideLoading()
      util.showToast('发布成功')
      this.setData({ 
        showPublishDialog: false,
        submitting: false
      })
      // 刷新列表
      this.loadPosts()
    } catch (err) {
      console.error('发布帖子失败', err)
      wx.hideLoading()
      this.setData({ submitting: false })
      util.showToast('发布失败，请重试')
    }
  },

  onShareAppMessage: function () {
    return {
      title: '邻里圈 - 社区动态',
      path: '/pages/community/community'
    }
  }
})