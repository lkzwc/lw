// pages/timeline/timeline.js - 小区时间线
const app = getApp()
const util = require('../../utils/util')
const api = require('../../utils/api')

Page({
  data: {
    timelines: [],
    loading: true,

    // 发布弹窗
    showPublishDialog: false,
    submitting: false,
    canSubmit: false,

    // 期数筛选
    phaseOptions: [
      { value: 'phase1', label: '一期' },
      { value: 'phase2', label: '二期' },
      { value: 'phase3', label: '三期' },
      { value: 'phase4', label: '四期' }
    ],
    currentPhase: 'phase1',

    typeOptions: [
      { value: 'issue', label: '问题反馈', icon: 'icon-baojing' },
      { value: 'notice', label: '小区通知', icon: 'icon-gonggao' },
      { value: 'improve', label: '建议改进', icon: 'icon-pingjia' }
    ],
    publishForm: {
      type: 'issue',
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
      const res = await api.timeline.getList(1, 100)
      const list = res.list || []

      const timelines = list.filter(item => item.phase === this.data.currentPhase)

      this.setData({ timelines: this.formatTimelines(timelines) })
    } catch (err) {
      console.error('加载时间线失败', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 格式化时间线展示字段
  formatTimelines: function (timelines) {
    const typeMap = this.data.typeOptions.reduce((map, item) => {
      map[item.value] = item.label
      return map
    }, {})
    const statusMap = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决'
    }

    return timelines.map(item => ({
      ...item,
      title: item.title || typeMap[item.type] || '时间线',
      statusLabel: item.statusLabel || statusMap[item.status] || '',
      date: item.date || util.formatRelativeTime(item.createTime),
      commentCount: item.commentCount || 0
    }))
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
    if (!app.globalData.isLoggedIn || !app.globalData.openid) {
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
    const canSubmit = publishForm.desc.trim()
    this.setData({ canSubmit })
  },

  // 切换期数筛选
  onPhaseChange: function (e) {
    const phase = e.currentTarget.dataset.phase
    this.setData({ currentPhase: phase })
    this.loadTimelines()
  },

  // 切换类型
  onTypeChange: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({ 'publishForm.type': type })
  },

  // 输入描述
  onDescInput: function (e) {
    this.setData({ 'publishForm.desc': e.detail.value }, this.checkCanSubmit)
  },

  // 选择图片
  onChooseImage: function () {
    const count = 6 - this.data.publishForm.images.length
    if (count <= 0) {
      util.showToast('最多上传6张图片')
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
      const { publishForm, currentPhase } = this.data

      // 上传图片
      const uploadedImages = []
      for (const img of publishForm.images) {
        if (img.startsWith('cloud://')) {
          uploadedImages.push(img)
        } else {
          const ext = img.split('.').pop()
          const cloudPath = `timeline/${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${ext}`
          const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: img })
          uploadedImages.push(uploadRes.fileID)
        }
      }

      await api.timeline.create({
        type: publishForm.type,
        phase: currentPhase,
        desc: publishForm.desc.trim(),
        images: uploadedImages,
        status: 'pending'
      })

      util.showToast('发布成功')
      this.setData({
        showPublishDialog: false,
        publishForm: {
          type: 'issue',
          desc: '',
          images: []
        }
      })
      this.loadTimelines()
    } catch (err) {
      console.error('发布失败', err)
      util.showToast(err.errMsg || err.message || '发布失败')
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
