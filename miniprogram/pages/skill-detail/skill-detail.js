// pages/skill-detail/skill-detail.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')
const config = require('../../utils/config')

Page({
  data: {
    skillId: '',
    skill: null,
    categoryIcon: 'icon-pingjia',
    loading: true,
    isLiked: false,
    liking: false
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
      const categoryIcon = cat ? cat.iconClass : 'icon-pingjia'

      // 检查是否已点赞（直接从 likedBy 数组判断）
      const isLiked = app.globalData.isLoggedIn && app.globalData.openid
        ? api.skill.checkLiked(skill, app.globalData.openid)
        : false
      
      this.setData({ skill, categoryIcon, isLiked, loading: false })
      
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

  // 点赞
  onLike: async function () {
    if (!app.globalData.isLoggedIn || !app.globalData.openid) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再点赞',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) wx.switchTab({ url: '/pages/mine/mine' })
        }
      })
      return
    }

    if (this.data.liking) return
    this.setData({ liking: true })

    const { isLiked, skill } = this.data
    const newIsLiked = !isLiked
    const newLikeCount = (skill.likeCount || 0) + (newIsLiked ? 1 : -1)

    // 乐观更新
    this.setData({
      isLiked: newIsLiked,
      'skill.likeCount': newLikeCount
    })

    try {
      await api.skill.like(this.data.skillId, app.globalData.openid)
    } catch (err) {
      // 失败回滚
      console.error('点赞失败', err)
      this.setData({ isLiked, 'skill.likeCount': skill.likeCount })
      util.showToast('操作失败')
    } finally {
      this.setData({ liking: false })
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