// pages/admin/notice/notice.js
const app = getApp()
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    notices: [],
    totalCount: 0,
    loading: true,
    showModal: false,
    editId: '',
    formData: {
      title: '',
      content: '',
      status: 'draft'
    }
  },

  onLoad: function () {
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

  // 删除公告
  onDeleteNotice: function (e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      confirmColor: '#FF4D4F',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.notice.delete(id)
            util.showToast('删除成功')
            this.loadNotices()
          } catch (err) {
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
  }
})
