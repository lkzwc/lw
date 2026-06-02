// pages/my-likes/my-likes.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    statusBarHeight: 20,
    navTitle: '我的点赞',
    posts: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: true,
    loadingMore: false,
    slideButtons: [{ text: '取消点赞', type: 'warn' }]
  },

  onLoad: function () {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })

    if (!app.globalData.isLoggedIn) {
      util.showToast('请先登录')
      wx.switchTab({ url: '/pages/mine/mine' })
      return
    }
    this.loadLikes()
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  onPullDownRefresh: function () {
    this.setData({ page: 1, posts: [] })
    this.loadLikes().then(() => wx.stopPullDownRefresh())
  },

  loadLikes: async function () {
    this.setData({ loading: true })
    try {
      const posts = await api.user.getMyLikes(app.globalData.openid, 1, this.data.pageSize)
      this.setData({
        posts: this.formatPosts(posts),
        page: 1,
        hasMore: posts.length >= this.data.pageSize
      })
    } catch (err) {
      console.error('加载点赞失败', err)
      util.showToast('加载失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  loadMore: async function () {
    this.setData({ loadingMore: true })
    try {
      const page = this.data.page + 1
      const posts = await api.user.getMyLikes(app.globalData.openid, page, this.data.pageSize)
      this.setData({
        posts: [...this.data.posts, ...this.formatPosts(posts)],
        page,
        hasMore: posts.length >= this.data.pageSize
      })
    } catch (err) {
      console.error('加载更多失败', err)
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  formatPosts: function (posts) {
    return posts.map(item => ({
      ...item,
      createTimeStr: util.formatRelativeTime(item.createTime),
      isLiked: true // 我的点赞列表中的帖子肯定是已点赞状态
    }))
  },

  // ========== 取消点赞 ==========

  // 点击点赞按钮（在"我的点赞"列表中点击即取消点赞）
  onUnlike: async function (e) {
    const { index, id } = e.currentTarget.dataset

    wx.showModal({
      title: '取消点赞',
      content: '确定要取消点赞吗？',
      confirmText: '取消点赞',
      confirmColor: '#FF4D4F',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.post.like(id, app.globalData.openid)
            util.showToast('已取消点赞')

            // 从列表中移除
            const posts = this.data.posts.filter((_, i) => i !== index)
            this.setData({ posts })
          } catch (err) {
            console.error('取消点赞失败', err)
            util.showToast('操作失败')
          }
        }
      }
    })
  },

  // ========== 左滑取消点赞（mp-slideview） ==========

  onSlideButtonTap: function (e) {
    const { index, id } = e.currentTarget.dataset

    wx.showModal({
      title: '取消点赞',
      content: '确定要取消点赞吗？',
      confirmText: '取消点赞',
      confirmColor: '#FF4D4F',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.post.like(id, app.globalData.openid)
            util.showToast('已取消点赞')

            const posts = this.data.posts.filter((_, i) => i !== index)
            this.setData({ posts })
          } catch (err) {
            console.error('取消点赞失败', err)
            util.showToast('操作失败')
          }
        }
      }
    })
  },

  // 点击卡片 → 跳转详情
  onItemTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${id}`
    })
  },

  onShareAppMessage: function () {
    return { title: '我的点赞 - 邻里圈', path: '/pages/index/index' }
  },

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({ url: '/pages/mine/mine' })
      }
    })
  }
})
