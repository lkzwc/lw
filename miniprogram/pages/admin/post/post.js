// pages/admin/post/post.js
const app = getApp()
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    statusBarHeight: 20,
    posts: [],
    totalCount: 0,
    todayCount: 0,
    loading: true,
    slideButtons: [{ text: '删除', type: 'warn' }]
  },

  onLoad: function () {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })
    this.loadPosts()
  },

  onPullDownRefresh: function () {
    this.loadPosts().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载帖子列表
  loadPosts: async function () {
    this.setData({ loading: true })
    
    try {
      const { list, total } = await api.post.getList({ page: 1, pageSize: 100 })
      
      // 格式化数据
      const formattedList = list.map(item => ({
        ...item,
        createTimeStr: util.formatRelativeTime(item.createTime)
      }))
      
      // 计算今日新增
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = today.getTime()
      const todayCount = list.filter(item => item.createTime >= todayTimestamp).length
      
      this.setData({
        posts: formattedList,
        totalCount: total,
        todayCount,
        loading: false
      })
    } catch (err) {
      console.error('加载帖子失败', err)
      this.setData({ loading: false })
    }
  },

  // 查看帖子
  onViewPost: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${id}`
    })
  },

  // 左滑删除帖子（mp-slideview）
  onSlideButtonTap: function (e) {
    const { index, id } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      confirmColor: '#FF4D4F',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.post.delete(id)
            util.showToast('删除成功')

            // 从列表移除
            const posts = this.data.posts.filter((_, i) => i !== index)
            this.setData({ posts })
          } catch (err) {
            console.error('删除失败', err)
            util.showToast('删除失败')
          }
        }
      }
    })
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
