// pages/community/community.js - 按设计图重构
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')
const subscribe = require('../../utils/subscribe') // 订阅消息囤票模块

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
      images: []
    },
    // 评论弹窗
    showCommentDialog: false,
    currentPost: {},
    currentComments: [],
    commentLoading: false,
    commentInput: '',
    replyTo: null,
    userAvatar: ''
  },

  onLoad: function () {
    this.loadPosts()
    // 获取用户头像
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({ userAvatar: userInfo.avatarUrl || '' })
    }
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
    // 更新用户头像
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({ userAvatar: userInfo.avatarUrl || '' })
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

      const posts = this.formatPosts(list)

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

      const posts = this.formatPosts(list)

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
  formatPosts: function (posts) {
    const openid = app.globalData.openid

    return posts.map(post => ({
      ...post,
      tag: post.tag || (post.tags && post.tags[0]) || '',
      timeStr: util.formatRelativeTime(post.createTime),
      isLiked: openid ? api.post.checkLiked(post, openid) : false
    }))
  },

  // 搜索
  onSearchTap: function () {
    wx.showModal({
      title: '搜索',
      content: '输入关键词可搜索帖子内容（功能即将上线）',
      confirmText: '知道了',
      showCancel: false
    })
  },

  // 点击帖子 → 打开评论半屏
  onPostTap: function (e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    const post = this.data.posts[index]
    if (!post) return

    this.setData({
      showCommentDialog: true,
      currentPost: post,
      currentComments: [],
      commentInput: '',
      commentLoading: true
    })

    wx.hideTabBar()
    this.loadComments(id)

    // Tier 2 囤票：用户点击帖子查看评论，顺带囤一张票（受频率控制）
    subscribe.requestLowFrequencySubscribe()
  },

  // 点击评论按钮（与点击帖子卡片一样效果，catchtap 避免冒泡）
  onCommentBtnTap: function (e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    const post = this.data.posts[index]
    if (!post) return

    this.setData({
      showCommentDialog: true,
      currentPost: post,
      currentComments: [],
      commentInput: '',
      commentLoading: true
    })

    wx.hideTabBar()
    this.loadComments(id)

    // Tier 2 囤票：用户点击评论按钮，顺带囤一张票（受频率控制）
    subscribe.requestLowFrequencySubscribe()
  },

  // 加载帖子评论（通过 api.comment 使用 comments 集合）
  loadComments: async function (postId) {
    try {
      const list = await api.comment.getList(postId)

      const comments = list.map(item => ({
        _id: item._id,
        userName: item.userInfo?.nickName || '邻居',
        avatar: item.userInfo?.avatarUrl || '',
        content: item.content || '',
        timeStr: util.formatRelativeTime(item.createTime),
        isReply: !!item.parentId,
        replyToUserName: item.replyToName || item.replyToUserName || ''
      }))

      this.setData({
        currentComments: comments,
        commentLoading: false
      })
    } catch (err) {
      console.error('[loadComments] 加载评论失败', err)
      this.setData({ commentLoading: false })
      wx.showToast({ title: '评论加载失败', icon: 'none' })
    }
  },

  // 关闭评论弹窗
  onCloseCommentDialog: function () {
    wx.showTabBar()
    this.setData({
      showCommentDialog: false,
      currentPost: {},
      currentComments: [],
      commentInput: '',
      replyTo: null
    })
  },

  // 评论输入
  onCommentInput: function (e) {
    this.setData({ commentInput: e.detail.value })
  },

  // 回复评论
  onReplyTap: function (e) {
    const item = e.currentTarget.dataset.item
    this.setData({ replyTo: item })
  },

  onCommentBlur: function () {
    if (!this.data.commentInput.trim()) {
      this.setData({ replyTo: null })
    }
  },

  // 发送评论
  onSendComment: async function () {
    const content = this.data.commentInput.trim()
    if (!content) {
      util.showToast('请输入评论内容')
      return
    }

    if (!app.globalData.isLoggedIn || !app.globalData.openid) {
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

    const postId = this.data.currentPost._id
    if (!postId) return

    // 提取回复目标
    const replyTo = this.data.replyTo

    // 乐观更新
    const newComment = {
      _id: Date.now().toString(),
      userName: app.globalData.userInfo?.nickName || '我',
      avatar: app.globalData.userInfo?.avatarUrl || '',
      content,
      timeStr: '刚刚',
      isReply: !!replyTo,
      replyToUserName: replyTo ? replyTo.userName : ''
    }
    const postIndex = this.data.posts.findIndex(p => p._id === postId)
    const newCount = (this.data.currentPost.commentCount || 0) + 1

    const updates = {
      currentComments: [...this.data.currentComments, newComment],
      commentInput: '',
      replyTo: null,
      'currentPost.commentCount': newCount
    }
    if (postIndex !== -1) {
      updates[`posts[${postIndex}].commentCount`] = newCount
    }
    this.setData(updates)

    try {
      const commentData = { postId, content }
      if (replyTo) {
        commentData.parentId = replyTo._id
        commentData.replyToName = replyTo.userName
      }
      await api.comment.create(commentData)
      util.showToast('评论成功')

      // Tier 1 囤票（必囤）：评论者为自己囤一张票
      // 这样别人回复该评论时，才能发通知给评论者
      // force=true 表示每次评论都弹授权窗（评论是用户明确意图，不受频率控制）
      subscribe.requestCommentReplySubscribe(true)
    } catch (err) {
      console.error('评论失败', err)
      // 回滚
      this.setData({
        'currentPost.commentCount': (this.data.currentPost.commentCount || 1) - 1,
        currentComments: this.data.currentComments.filter(c => c._id !== newComment._id)
      })
      if (postIndex !== -1) {
        this.setData({
          [`posts[${postIndex}].commentCount`]: (this.data.posts[postIndex].commentCount || 1) - 1
        })
      }
      util.showToast('评论失败，请重试')
    }
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
      // Tier 2 囤票：用户点赞互动，顺带囤一张票（受频率控制）
      subscribe.requestLowFrequencySubscribe()
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
        images: []
      }
    })
  },

  // 关闭发布弹窗
  onClosePublishDialog: function () {
    this.setData({ showPublishDialog: false })
  },

  // 输入内容
  onContentInput: function (e) {
    this.setData({
      'publishForm.content': e.detail.value
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
    const { content, images } = this.data.publishForm

    if (!content.trim()) {
      util.showToast('请输入帖子内容')
      return
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
        tag: '',
        tags: [],
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
});
