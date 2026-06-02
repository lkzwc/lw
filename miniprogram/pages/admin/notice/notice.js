// pages/admin/notice/notice.js
const app = getApp()
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    statusBarHeight: 20,
    notices: [],
    totalCount: 0,
    loading: true,
    showModal: false,
    editId: '',
    slideButtons: [{ text: '删除', type: 'warn' }],
    formData: {
      title: '',
      content: '',
      status: 'draft'
    }
  },

  onLoad: function () {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })
    this.loadNotices()
  },

  onPullDownRefresh: function () {
    this.loadNotices().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载公告列表
  loadNotices: async function () {
    this.setData({ loading: true })
    
    try {
      const notices = await api.notice.getList(100, true)
      
      const formattedNotices = notices.map(item => ({
        ...item,
        createTimeStr: util.formatRelativeTime(item.createTime)
      }))
      
      this.setData({
        notices: formattedNotices,
        totalCount: notices.length,
        loading: false
      })
    } catch (err) {
      console.error('加载公告失败', err)
      this.setData({ loading: false })
    }
  },

  // 新增公告
  onAddNotice: function () {
    this.setData({
      showModal: true,
      editId: '',
      formData: {
        title: '',
        content: '',
        status: 'draft'
      }
    })
  },

  // 编辑公告
  onEditNotice: function (e) {
    const id = e.currentTarget.dataset.id
    const notice = this.data.notices.find(item => item._id === id)
    
    if (notice) {
      this.setData({
        showModal: true,
        editId: id,
        formData: {
          title: notice.title,
          content: notice.content || '',
          status: notice.status || 'draft'
        }
      })
    }
  },

  // 左滑删除
  onSlideButtonTap: function (e) {
    const { index, id } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条公告吗？',
      confirmColor: '#FF4D4F',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          try {
            await api.notice.delete(id)
            wx.hideLoading()
            util.showToast('删除成功')
            const notices = this.data.notices.filter((_, i) => i !== index)
            this.setData({ notices, totalCount: notices.length })
          } catch (err) {
            wx.hideLoading()
            console.error('删除失败', err)
            util.showToast('删除失败')
          }
        }
      }
    })
  },

  // 关闭弹窗
  onCloseModal: function () {
    this.setData({ showModal: false })
  },

  // 输入标题
  onTitleInput: function (e) {
    this.setData({ 'formData.title': e.detail.value })
  },

  // 输入内容
  onContentInput: function (e) {
    this.setData({ 'formData.content': e.detail.value })
  },

  // 切换状态
  onStatusChange: function (e) {
    this.setData({
      'formData.status': e.detail.value ? 'active' : 'draft'
    })
  },

  // 保存公告
  onSaveNotice: async function () {
    const { title, content, status } = this.data.formData
    
    if (!title.trim()) {
      util.showToast('请输入标题')
      return
    }
    
    if (!content.trim()) {
      util.showToast('请输入内容')
      return
    }
    
    util.showLoading('保存中...')
    
    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        status
      }
      
      if (this.data.editId) {
        await api.notice.update(this.data.editId, data)
      } else {
        await api.notice.create(data)
      }
      
      util.hideLoading()
      util.showToast('保存成功')
      this.onCloseModal()
      this.loadNotices()
    } catch (err) {
      console.error('保存失败', err)
      util.hideLoading()
      
      // 更详细的错误提示
      let msg = '保存失败'
      if (err.errMsg && err.errMsg.includes('collection')) {
        msg = '请先在云开发控制台创建 notices 集合'
      }
      util.showToast(msg)
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
