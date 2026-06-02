// pages/my-posts/my-posts.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    statusBarHeight: 20,
    navTitle: '我的发布',
    type: 'post', // 'post' / 'skill' / 'carpool'
    posts: [],
    skills: [],
    carpools: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: true,
    loadingMore: false,
    slideButtons: [{ text: '删除', type: 'warn' }]
  },

  onLoad: function (options) {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })

    if (!app.globalData.isLoggedIn) {
      util.showToast('请先登录')
      wx.switchTab({ url: '/pages/mine/mine' })
      return
    }

    const type = options.type || 'post'
    const titleMap = { post: '我的发布', skill: '我的技能', carpool: '我的捎一段' }
    this.setData({ type, navTitle: titleMap[type] || '我的发布' })

    this.loadData()
  },

  onShow: function () {
    // 从详情页返回时刷新数据
    const { type } = this.data
    const listMap = { post: 'posts', skill: 'skills', carpool: 'carpools' }
    const listKey = listMap[type]
    if (this.data[listKey] && this.data[listKey].length > 0) {
      this.loadData()
    }
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  onPullDownRefresh: function () {
    this.setData({ page: 1, posts: [], skills: [], carpools: [] })
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  loadData: async function () {
    const { type } = this.data
    if (type === 'skill') {
      return this.loadSkills()
    } else if (type === 'carpool') {
      return this.loadCarpools()
    }
    return this.loadPosts()
  },

  loadPosts: async function () {
    this.setData({ loading: true })
    try {
      const posts = await api.user.getMyPosts(app.globalData.openid, 1, this.data.pageSize)
      this.setData({
        posts: this.formatItems(posts),
        page: 1,
        hasMore: posts.length >= this.data.pageSize
      })
    } catch (err) {
      console.error('加载帖子失败', err)
      util.showToast('加载失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  loadSkills: async function () {
    this.setData({ loading: true })
    try {
      const skills = await api.user.getMySkills(app.globalData.openid, 1, this.data.pageSize)
      this.setData({
        skills: this.formatItems(skills),
        page: 1,
        hasMore: skills.length >= this.data.pageSize
      })
    } catch (err) {
      console.error('加载技能失败', err)
      util.showToast('加载失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  loadCarpools: async function () {
    this.setData({ loading: true })
    try {
      const carpools = await api.user.getMyCarpools(app.globalData.openid, 1, this.data.pageSize)
      this.setData({
        carpools: this.formatItems(carpools),
        page: 1,
        hasMore: carpools.length >= this.data.pageSize
      })
    } catch (err) {
      console.error('加载拼车失败', err)
      util.showToast('加载失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  loadMore: async function () {
    this.setData({ loadingMore: true })
    try {
      const page = this.data.page + 1
      const { type } = this.data

      if (type === 'skill') {
        const skills = await api.user.getMySkills(app.globalData.openid, page, this.data.pageSize)
        this.setData({
          skills: [...this.data.skills, ...this.formatItems(skills)],
          page,
          hasMore: skills.length >= this.data.pageSize
        })
      } else if (type === 'carpool') {
        const carpools = await api.user.getMyCarpools(app.globalData.openid, page, this.data.pageSize)
        this.setData({
          carpools: [...this.data.carpools, ...this.formatItems(carpools)],
          page,
          hasMore: carpools.length >= this.data.pageSize
        })
      } else {
        const posts = await api.user.getMyPosts(app.globalData.openid, page, this.data.pageSize)
        this.setData({
          posts: [...this.data.posts, ...this.formatItems(posts)],
          page,
          hasMore: posts.length >= this.data.pageSize
        })
      }
    } catch (err) {
      console.error('加载更多失败', err)
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  formatItems: function (items) {
    return items.map(item => ({
      ...item,
      createTimeStr: util.formatRelativeTime(item.createTime)
    }))
  },

  // ========== 左滑删除（mp-slideview） ==========

  onSlideButtonTap: function (e) {
    const { index, id, type } = e.currentTarget.dataset
    const typeNameMap = { post: '帖子', skill: '技能', carpool: '路线' }
    const typeName = typeNameMap[type] || '帖子'

    wx.showModal({
      title: '确认删除',
      content: `确定要删除这条${typeName}吗？删除后不可恢复。`,
      confirmText: '删除',
      confirmColor: '#FF4D4F',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          try {
            if (type === 'skill') {
              await api.skill.delete(id)
            } else if (type === 'carpool') {
              await api.carpool.delete(id)
            } else {
              await api.post.delete(id)
            }

            wx.hideLoading()
            util.showToast('删除成功')

            // 从列表中移除
            const listMap = { post: 'posts', skill: 'skills', carpool: 'carpools' }
            const listKey = listMap[type]
            const items = this.data[listKey].filter((_, i) => i !== index)
            this.setData({ [listKey]: items })
          } catch (err) {
            wx.hideLoading()
            console.error('删除失败', err)
            util.showToast('删除失败')
          }
        }
      }
    })
  },

  // 点击卡片 → 跳转详情
  onItemTap: function (e) {
    const id = e.currentTarget.dataset.id

    if (this.data.type === 'skill') {
      wx.navigateTo({
        url: `/pages/skill-detail/skill-detail?id=${id}`
      })
    } else if (this.data.type === 'carpool') {
      // 拼车没有详情页，拨打电话
      const item = this.data.carpools.find(c => c._id === id)
      if (item && item.phone) {
        wx.makePhoneCall({
          phoneNumber: item.phone,
          fail: () => util.showToast('拨打失败')
        })
      }
    } else {
      wx.navigateTo({
        url: `/pages/post-detail/post-detail?id=${id}`
      })
    }
  },

  onShareAppMessage: function () {
    const titleMap = { post: '我的发布', skill: '我的技能', carpool: '我的捎一段' }
    const title = (titleMap[this.data.type] || '我的发布') + ' - 邻里圈'
    return { title, path: '/pages/index/index' }
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
