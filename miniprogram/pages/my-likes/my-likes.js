// pages/my-likes/my-likes.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    posts: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: true,
    loadingMore: false
  },

  onLoad: function () {
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
      createTimeStr: util.formatRelativeTime(item.createTime)
    }))
  },

  onShareAppMessage: function () {
    return { title: '我的点赞 - 邻里圈', path: '/pages/my-likes/my-likes' }
  }
})
