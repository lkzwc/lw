// pages/timeline/timeline.js - 小区时间线
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    currentFilter: 'all',
    timelines: [],
    loading: true,
    
    // 发布弹窗
    showPublishDialog: false,
    submitting: false,
    canSubmit: false,
    typeOptions: [
      { value: 'issue', label: '问题反馈', icon: '🔴' },
      { value: 'notice', label: '小区通知', icon: '📢' },
      { value: 'improve', label: '建议改进', icon: '💡' }
    ],
    publishForm: {
      type: 'issue',
      title: '',
      desc: '',
      images: []
    }
  },

  onLoad: function () {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })
    this.loadTimelines()
  },

  onPullDownRefresh: function () {
    this.loadTimelines().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载时间线列表
  loadTimelines: async function () {
    this.setData({ loading: true })
    
    try {
      const db = wx.cloud.database()
      const _ = db.command
      
      let query = db.collection('timeline').where({
        status: _.neq('deleted')
      })
      
      if (this.data.currentFilter !== 'all') {
        query = query.where({ type: this.data.currentFilter })
      }
      
      const res = await query.orderBy('createTime', 'desc').get()
      
      this.setData({ timelines: res.data })
    } catch (err) {
      console.error('加载时间线失败', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 切换筛选
  onFilterChange: function (e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.loadTimelines()
  },

  // 点击时间线
  onTimelineTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/timeline-detail/timeline-detail?id=${id}`
    })
  },

  // 打开发布弹窗
  onPublishTap: function () {
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '上报问题需要先登录',
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
    
    this.setData({ showPublishDialog: true })
  },

  // 关闭发布弹窗
  onClosePublishDialog: function () {
    this.setData({ showPublishDialog: false })
  },

  // 检查是否可以提交
  checkCanSubmit: function () {
    const { publishForm } = this.data
    const canSubmit = publishForm.title.trim() && publishForm.desc.trim()
    this.setData({ canSubmit })
  },

  // 切换类型
  onTypeChange: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({ 'publishForm.type': type })
  },

  // 输入标题
  onTitleInput: function (e) {
    this.setData({ 'publishForm.title': e.detail.value }, this.checkCanSubmit)
  },

  // 输入描述
  onDescInput: function (e) {
    this.setData({ 'publishForm.desc': e.detail.value }, this.checkCanSubmit)
  },

  // 选择图片
  onChooseImage: function () {
    const count = 6 - this.data.publishForm.images.length
    if (count <= 0) {
      util.showToast('最多上传9张图片')
      return
    }
    
    wx.chooseMedia({
      count: count,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath)
        this.setData({
          'publishForm.images': [...this.data.publishForm.images, ...tempFiles]
        })
      }
    })
  },

  // 删除图片
  onDeleteImage: function (e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.publishForm.images.filter((_, i) => i !== index)
    this.setData({ 'publishForm.images': images })
  },

  // 提交发布
  onSubmit: async function () {
    if (!this.data.canSubmit || this.data.submitting) return
    
    this.setData({ submitting: true })
    
    try {
      // TODO: 提交到云数据库
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      util.showToast('发布成功')
      this.setData({ 
        showPublishDialog: false,
        publishForm: {
          type: 'issue',
          title: '',
          desc: '',
          images: []
        }
      })
      this.loadTimelines()
    } catch (err) {
      console.error('发布失败', err)
      util.showToast('发布失败')
    } finally {
      this.setData({ submitting: false })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '小区时间线 - 高科麓湾',
      path: '/pages/timeline/timeline'
    }
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