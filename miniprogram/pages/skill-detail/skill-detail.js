// pages/skill-detail/skill-detail.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')
const config = require('../../utils/config')

Page({
  data: {
    skillId: '',
    skill: null,
    categoryIcon: '📋',
    loading: true
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ skillId: options.id })
      this.loadSkillDetail(options.id)
    }
  },

  // 加载技能详情
  loadSkillDetail: async function (id) {
    try {
      const skill = await api.skill.getDetail(id)
      
      // 格式化时间
      skill.createTimeStr = util.formatTime(skill.createTime)
      
      // 获取分类图标
      const cat = config.skillCategories.find(c => c.id === skill.category)
      const categoryIcon = cat ? cat.icon : '📋'
      
      this.setData({
        skill,
        categoryIcon,
        loading: false
      })
      
      // 增加浏览量
      this.incrementViewCount(id)
    } catch (err) {
      console.error('加载技能详情失败', err)
      util.showToast('加载失败')
      this.setData({ loading: false })
    }
  },

  // 增加浏览量
  incrementViewCount: async function (id) {
    try {
      await api.skill.addView(id)
    } catch (err) {
      console.error('增加浏览量失败', err)
    }
  },

  // 预览图片
  onPreviewImage: function (e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls
    util.previewImage(urls, url)
  },

  // 拨打电话
  onCallPhone: function () {
    const phone = this.data.skill?.phone
    if (!phone) {
      util.showToast('暂无联系电话')
      return
    }

    wx.makePhoneCall({
      phoneNumber: phone,
      fail: (err) => {
        if (err.errMsg.indexOf('cancel') === -1) {
          util.showToast('拨打失败')
        }
      }
    })
  },

  // 分享
  onShareAppMessage: function () {
    const skill = this.data.skill
    return {
      title: skill ? `${skill.title} - ${skill.price}` : '邻里圈技能墙',
      path: `/pages/skill-detail/skill-detail?id=${this.data.skillId}`,
      imageUrl: skill && skill.images && skill.images.length > 0 ? skill.images[0] : ''
    }
  }
})