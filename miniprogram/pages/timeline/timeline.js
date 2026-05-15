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
      // 模拟数据
      const mockTimelines = [
        {
          _id: '1',
          type: 'issue',
          title: '3号楼电梯故障',
          desc: '3号楼东侧电梯运行时有异响，请物业尽快安排检修。',
          images: [],
          date: '2024-05-15',
          status: 'processing',
          statusLabel: '处理中',
          commentCount: 5
        },
        {
          _id: '2',
          type: 'notice',
          title: '停水通知',
          desc: '因管网维修，5月16日上午9:00-12:00，小区1-5号楼将暂停供水。',
          images: [],
          date: '2024-05-14',
          status: 'resolved',
          statusLabel: '已完成',
          commentCount: 3
        },
        {
          _id: '3',
          type: 'improve',
          title: '建议增加儿童游乐设施',
          desc: '小区儿童较多，建议在小区广场东侧增设滑梯、秋千等游乐设施。',
          images: [],
          date: '2024-05-12',
          status: 'pending',
          statusLabel: '待处理',
          commentCount: 18
        },
        {
          _id: '4',
          type: 'issue',
          title: '地下车库照明不足',
          desc: 'B2层车库部分区域灯光昏暗，存在安全隐患。',
          images: [],
          date: '2024-05-10',
          status: 'resolved',
          statusLabel: '已解决',
          commentCount: 2
        }
      ]
      
      // 根据筛选类型过滤
      let filteredTimelines = mockTimelines
      if (this.data.currentFilter !== 'all') {
        filteredTimelines = mockTimelines.filter(t => t.type === this.data.currentFilter)
      }
      
      this.setData({ timelines: filteredTimelines })
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