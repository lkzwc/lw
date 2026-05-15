// components/post-card/post-card.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')

Component({
  properties: {
    post: {
      type: Object,
      value: {}
    }
  },

  data: {
    isLiked: false
  },

  lifetimes: {
    attached: function () {
      // 检查是否已点赞
      if (app.globalData.isLoggedIn && this.properties.post._id) {
        this.checkLiked()
      }
    }
  },

  methods: {
    // 检查是否已点赞
    checkLiked: async function () {
      try {
        const isLiked = await api.post.checkLiked(
          this.properties.post._id,
          app.globalData.openid
        )
        this.setData({ isLiked })
      } catch (err) {
        console.error('检查点赞状态失败', err)
      }
    },

    // 阻止事件冒泡
    stopPropagation: function () {},

    // 点击卡片进入详情
    onTap: function (e) {
      const id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/post-detail/post-detail?id=${id}`
      })
    },

    // 预览图片
    onPreviewImage: function (e) {
      const url = e.currentTarget.dataset.url
      const urls = e.currentTarget.dataset.urls
      util.previewImage(urls, url)
    },

    // 点赞
    onLike: async function () {
      if (!app.globalData.isLoggedIn) {
        wx.showModal({
          title: '提示',
          content: '请先登录后再点赞',
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

      try {
        // API返回true表示点赞成功，false表示取消点赞
        const isLiked = await api.post.like(
          this.properties.post._id,
          app.globalData.openid
        )
        
        this.setData({ isLiked })
        
        // 更新点赞数：true=+1, false=-1
        const post = this.properties.post
        post.likeCount = (post.likeCount || 0) + (isLiked ? 1 : -1)
        this.triggerEvent('update', { post })
      } catch (err) {
        console.error('点赞失败', err)
        util.showToast('操作失败')
      }
    },

    // 评论
    onComment: function () {
      // 直接跳转到详情页
      wx.navigateTo({
        url: `/pages/post-detail/post-detail?id=${this.properties.post._id}`
      })
    }
  }
})