// pages/admin/skill/skill.js
const app = getApp()
const api = require('../../../utils/api')
const util = require('../../../utils/util')

Page({
  data: {
    statusBarHeight: 20,
    skills: [],
    totalCount: 0,
    homeCount: 0,
    loading: true,
    showModal: false,
    editId: '',
    slideButtons: [{ text: '删除', type: 'warn' }],
    categories: ['家政服务', '维修服务', '教育培训', '美容美发', '其他'],
    categoryIndex: 0,
    formData: {
      title: '',
      category: '',
      price: '',
      unit: '次',
      description: '',
      phone: '',
      showHome: false
    }
  },

  onLoad: function () {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })
    this.loadSkills()
  },

  onPullDownRefresh: function () {
    this.loadSkills().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载技能列表
  loadSkills: async function () {
    this.setData({ loading: true })
    
    try {
      const { list, total } = await api.skill.getList({ page: 1, pageSize: 100 })
      
      // 格式化数据
      const formattedList = list.map(item => ({
        ...item,
        createTimeStr: util.formatRelativeTime(item.createTime)
      }))
      
      // 计算首页展示数量
      const homeCount = list.filter(item => item.showHome).length
      
      this.setData({
        skills: formattedList,
        totalCount: total,
        homeCount,
        loading: false
      })
    } catch (err) {
      console.error('加载技能失败', err)
      this.setData({ loading: false })
    }
  },

  // 切换首页展示
  onToggleHome: async function (e) {
    const id = e.currentTarget.dataset.id
    const skill = this.data.skills.find(item => item._id === id)
    
    if (skill) {
      try {
        const newShowHome = !skill.showHome
        await api.skill.update(id, { showHome: newShowHome })
        
        // 更新本地数据
        const skills = this.data.skills.map(item => {
          if (item._id === id) {
            return { ...item, showHome: newShowHome }
          }
          return item
        })
        
        const homeCount = skills.filter(item => item.showHome).length
        
        this.setData({ skills, homeCount })
        util.showToast(newShowHome ? '已设为首页展示' : '已取消首页展示')
      } catch (err) {
        console.error('更新失败', err)
        util.showToast('操作失败')
      }
    }
  },

  // 编辑技能
  onEditSkill: function (e) {
    const id = e.currentTarget.dataset.id
    const skill = this.data.skills.find(item => item._id === id)
    
    if (skill) {
      const categoryIndex = this.data.categories.indexOf(skill.category)
      
      this.setData({
        showModal: true,
        editId: id,
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        formData: {
          title: skill.title,
          category: skill.category,
          price: skill.price,
          unit: skill.unit || '次',
          description: skill.description || '',
          phone: skill.phone || '',
          showHome: skill.showHome || false
        }
      })
    }
  },

  // 左滑删除
  onSlideButtonTap: function (e) {
    const { index, id } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条技能吗？',
      confirmColor: '#FF4D4F',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          try {
            await api.skill.delete(id)
            wx.hideLoading()
            util.showToast('删除成功')
            const skills = this.data.skills.filter((_, i) => i !== index)
            const homeCount = skills.filter(item => item.showHome).length
            this.setData({ skills, totalCount: skills.length, homeCount })
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

  // 选择分类
  onCategoryChange: function (e) {
    const index = e.detail.value
    this.setData({
      categoryIndex: index,
      'formData.category': this.data.categories[index]
    })
  },

  // 输入价格
  onPriceInput: function (e) {
    this.setData({ 'formData.price': e.detail.value })
  },

  // 输入单位
  onUnitInput: function (e) {
    this.setData({ 'formData.unit': e.detail.value })
  },

  // 输入描述
  onDescInput: function (e) {
    this.setData({ 'formData.description': e.detail.value })
  },

  // 输入电话
  onPhoneInput: function (e) {
    this.setData({ 'formData.phone': e.detail.value })
  },

  // 切换首页展示
  onShowHomeChange: function (e) {
    this.setData({ 'formData.showHome': e.detail.value })
  },

  // 保存技能
  onSaveSkill: async function () {
    const { title, category, price, unit, description, phone, showHome } = this.data.formData
    
    if (!title.trim()) {
      util.showToast('请输入标题')
      return
    }
    
    if (!category) {
      util.showToast('请选择分类')
      return
    }
    
    if (!price) {
      util.showToast('请输入价格')
      return
    }
    
    util.showLoading('保存中...')
    
    try {
      const data = {
        title: title.trim(),
        category,
        price: parseFloat(price),
        unit: unit || '次',
        description: description.trim(),
        phone: phone.trim(),
        showHome
      }
      
      await api.skill.update(this.data.editId, data)
      
      util.hideLoading()
      util.showToast('保存成功')
      this.onCloseModal()
      this.loadSkills()
    } catch (err) {
      console.error('保存失败', err)
      util.hideLoading()
      util.showToast('保存失败')
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
