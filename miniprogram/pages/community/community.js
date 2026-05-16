// pages/community/community.js - 按设计图重构
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')

const PAGE_SIZE = 20

Page({
  data: {
    posts: [],
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

  // 加载帖子
  loadPosts: async function () {
    this.setData({ loading: true })

    try {
      const { list, hasMore } = await api.post.getList({
        page: 1,
        pageSize: PAGE_SIZE
      })

      const posts = await this.formatPosts(list)

      this.setData({
        posts,
        hasMore,
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

    try {
      const nextPage = this.data.page + 1
      const { list, hasMore } = await api.post.getList({
        page: nextPage,
        pageSize: PAGE_SIZE
      })

      const posts = await this.formatPosts(list)

      this.setData({
        posts: [...this.data.posts, ...posts],
        hasMore,
        page: nextPage
      })
    } catch (err) {
      console.error('加载更多失败', err)
      util.showToast('加载失败')
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  // 格式化帖子列表
  formatPosts: async function (posts) {
    const openid = app.globalData.openid

    return Promise.all(posts.map(async (post) => {
      let isLiked = false
      if (openid) {
        try {
          isLiked = await api.post.checkLiked(post._id, openid)
        } catch (err) {
          console.error('检查点赞状态失败', err)
        }
      }

      return {
        ...post,
        tag: post.tag || (post.tags && post.tags[0]) || '',
        timeStr: util.formatRelativeTime(post.createTime),
        isLiked
      }
    }))
  },

  // 搜索
  onSearchTap: function () {
    util.showToast('搜索功能开发中')
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

  // 阻止事件冒泡
  stopPropagation: function () {},

  // 点赞
  onLikeTap: async function (e) {
    if (!app.globalData.isLoggedIn || !app.globalData.openid) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再点赞',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' })
          }
        }
      })
      return
    }

    const id = e.currentTarget.dataset.id
    const posts = this.data.posts
    const index = posts.findIndex(p => p._id === id)
    if (index === -1) return

    const post = posts[index]
    // 乐观更新：先改 UI，再请求接口
    const newIsLiked = !post.isLiked
    const newLikeCount = (post.likeCount || 0) + (newIsLiked ? 1 : -1)
    this.setData({
      [`posts[${index}].isLiked`]: newIsLiked,
      [`posts[${index}].likeCount`]: newLikeCount
    })

    try {
      await api.post.like(id, app.globalData.openid)
    } catch (err) {
      // 接口失败则回滚
      console.error('点赞失败', err)
      this.setData({
        [`posts[${index}].isLiked`]: post.isLiked,
        [`posts[${index}].likeCount`]: post.likeCount
      })
      util.showToast('操作失败')
    }
  },

  // 打开发布弹窗
  onPublishTap: function () {
    if (!app.globalData.isLoggedIn || !app.globalData.openid) {
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

      await api.post.create({
        content: content.trim(),
        tag: tag || allTags[0] || '',
        tags: allTags,
        images: uploadedImages
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
