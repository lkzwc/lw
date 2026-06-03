// pages/skill-wall/skill-wall.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')
const config = require('../../utils/config')

Page({
  data: {
    skills: [],
    categories: config.skillCategories,
    currentCategory: '',
    keyword: '',
    page: 1,
    hasMore: true,
    loading: true,
    loadingMore: false,
    // 发布弹窗
    showPublishDialog: false,
    title: '',
    category: '',
    description: '',
    price: '',
    phone: '',
    images: [],
    canSubmit: false,
    submitting: false
  },

  onLoad: function () {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })
    this.loadSkills()
  },

  onShow: function () {
    // 发布弹窗打开时（如选图后返回），不触发列表刷新，避免出现双 loading
    if (this.data.showPublishDialog) return
    this.loadSkills()
  },

  onPullDownRefresh: function () {
    this.setData({ page: 1, hasMore: true })
    this.loadSkills().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  // 加载技能
  loadSkills: async function () {
    this.setData({ loading: true })

    try {
      const params = {
        page: 1,
        category: this.data.currentCategory,
        keyword: this.data.keyword
      }

      const { list, hasMore, total } = await api.skill.getList(params)

      const formattedList = list.map(item => ({
        ...item,
        createTimeStr: util.formatRelativeTime(item.createTime),
        categoryName: this.getCategoryName(item.category)
      }))

      this.setData({
        skills: formattedList,
        hasMore,
        page: 1
      })
    } catch (err) {
      console.error('[loadSkills] 失败:', JSON.stringify(err), err)
      util.showToast('加载失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载更多
  loadMore: async function () {
    this.setData({ loadingMore: true })

    try {
      const nextPage = this.data.page + 1
      const { list, hasMore } = await api.skill.getList({
        page: nextPage,
        category: this.data.currentCategory,
        keyword: this.data.keyword
      })

      const formattedList = list.map(item => ({
        ...item,
        createTimeStr: util.formatRelativeTime(item.createTime),
        categoryName: this.getCategoryName(item.category)
      }))

      this.setData({
        skills: [...this.data.skills, ...formattedList],
        hasMore,
        page: nextPage
      })
    } catch (err) {
      console.error('加载更多失败', err)
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  // 获取分类名称
  getCategoryName: function (categoryId) {
    const category = this.data.categories.find(c => c.id === categoryId)
    return category ? category.name : '其他'
  },

  // 搜索输入
  onSearchInput: function (e) {
    this.setData({ keyword: e.detail.value })
  },

  // 搜索
  onSearch: util.debounce(function () {
    this.loadSkills()
  }, 500),

  // 分类筛选
  onCategoryTap: function (e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category, page: 1 })
    this.loadSkills()
  },

  // 点击技能
  onSkillTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/skill-detail/skill-detail?id=${id}`
    })
  },

  // 打开发布弹窗
  onPublishTap: function () {
    if (!util.requireLogin('发布')) return

    this.setData({
      showPublishDialog: true,
      title: '',
      category: '',
      description: '',
      price: '',
      phone: '',
      images: [],
      canSubmit: false,
      submitting: false
    })
  },

  // 关闭发布弹窗
  onClosePublishDialog: function () {
    this.setData({ showPublishDialog: false })
  },

  // 技能标题输入
  onTitleInput: function (e) {
    this.setData({ title: e.detail.value }, this.checkCanSubmit)
  },

  // 选择分类
  onSelectCategory: function (e) {
    this.setData({ category: e.currentTarget.dataset.id }, this.checkCanSubmit)
  },

  // 描述输入
  onDescriptionInput: function (e) {
    this.setData({ description: e.detail.value })
  },

  // 报价输入
  onPriceInput: function (e) {
    this.setData({ price: e.detail.value })
  },

  // 电话输入
  onPhoneInput: function (e) {
    this.setData({ phone: e.detail.value }, this.checkCanSubmit)
  },

  // 检查是否可以提交
  checkCanSubmit: function () {
    const { title, category, phone } = this.data
    const canSubmit = title.trim() && category && phone.length === 11
    this.setData({ canSubmit })
  },

  // 选择图片
  onChooseImage: function () {
    wx.chooseMedia({
      count: 6 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath)
        util.showLoading('上传中...')

        try {
          const uploadPromises = tempFiles.map(path => this.uploadImage(path))
          const cloudPaths = await Promise.all(uploadPromises)

          this.setData({
            images: [...this.data.images, ...cloudPaths]
          })
        } catch (err) {
          console.error('上传图片失败', err)
          util.showToast('上传失败')
        } finally {
          util.hideLoading()
        }
      }
    })
  },

  // 上传图片
  uploadImage: function (tempFilePath) {
    return new Promise((resolve, reject) => {
      const cloudPath = `skills/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`

      wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath,
        success: (res) => resolve(res.fileID),
        fail: (err) => reject(err)
      })
    })
  },

  // 预览图片
  onPreviewImage: function (e) {
    const url = e.currentTarget.dataset.url
    util.previewImage(this.data.images, url)
  },

  // 删除图片
  onDeleteImage: function (e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  // 发布
  onSubmit: async function () {
    if (this.data.submitting) return
    if (!this.data.canSubmit) {
      const { title, category, phone } = this.data
      if (!title.trim()) {
        util.showToast('请输入技能标题')
      } else if (!category) {
        util.showToast('请选择技能分类')
      } else if (phone.length !== 11) {
        util.showToast('请输入11位手机号')
      }
      return
    }

    // 验证手机号
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(this.data.phone)) {
      util.showToast('请输入正确的手机号')
      return
    }

    this.setData({ submitting: true })
    util.showLoading('发布中...')

    try {
      const skillData = {
        title: this.data.title.trim(),
        category: this.data.category,
        description: (this.data.description || '').trim(),
        price: (this.data.price || '').trim(),
        phone: this.data.phone,
        images: this.data.images || []
      }

      const id = await api.skill.create(skillData)

      util.hideLoading()
      util.showToast('发布成功')

      this.setData({
        showPublishDialog: false,
        currentCategory: '',
        keyword: '',
        title: '',
        category: '',
        description: '',
        price: '',
        phone: '',
        images: [],
        canSubmit: false
      })

      // 刷新列表
      setTimeout(() => {
        this.loadSkills()
      }, 500)
    } catch (err) {
      console.error('[发布技能] 失败，完整错误:', JSON.stringify(err), err)
      util.hideLoading()
      const msg = err.errMsg || err.message || (typeof err === 'string' ? err : '发布失败，请重试')
      util.showToast(msg)
    } finally {
      this.setData({ submitting: false })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '邻里圈 - 技能墙',
      path: '/pages/skill-wall/skill-wall'
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
