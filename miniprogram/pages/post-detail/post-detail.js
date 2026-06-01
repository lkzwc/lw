// pages/post-detail/post-detail.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')
const config = require('../../utils/config')

Page({
  data: {
    postId: '',
    post: null,
    comments: [],
    isLiked: false,
    isOwner: false,
    loading: true,
    // 评论相关
    commentContent: '',
    replyTo: null,
    submitting: false,
    // 操作菜单
    showActionSheet: false,
    actions: [
      { name: '删除帖子', color: '#FF6B6B' },
      { name: '取消', color: '#999' }
    ]
  },

  onLoad: function (options) {
    this.setData({ postId: options.id })
    this.loadPostDetail()
    this.loadComments()
  },

  // 加载帖子详情
  loadPostDetail: async function () {
    try {
      const post = await api.post.getDetail(this.data.postId)
      
      // 格式化时间
      post.createTimeStr = util.formatRelativeTime(post.createTime)
      
      // 检查是否是作者
      const isOwner = post._openid === app.globalData.openid
      
      // 检查是否已点赞（直接从 likedBy 数组判断）
      const isLiked = api.post.checkLiked(post, app.globalData.openid)
      
      this.setData({
        post,
        isOwner,
        isLiked,
        loading: false
      })

      // 关键修复：帖子作者打开自己帖子 → 请求订阅授权
      // 这样后续有人评论时，作者才能收到通知
      if (isOwner && app.globalData.isLoggedIn) {
        this.requestAuthorSubscribe()
      }
    } catch (err) {
      console.error('加载帖子详情失败', err)
      util.showToast('加载失败')
      wx.navigateBack()
    }
  },

  // 加载评论
  loadComments: async function () {
    try {
      const comments = await api.comment.getList(this.data.postId)
      
      // 格式化时间
      const formattedComments = comments.map(item => ({
        ...item,
        createTimeStr: util.formatRelativeTime(item.createTime)
      }))
      
      this.setData({ comments: formattedComments })
    } catch (err) {
      console.error('加载评论失败', err)
    }
  },

  // 预览图片
  onPreviewImage: function (e) {
    const url = e.currentTarget.dataset.url
    util.previewImage(this.data.post.images, url)
  },

  // 点击标签 → 回社区页（tabBar 页面只能用 switchTab）
  onTagTap: function (e) {
    wx.switchTab({
      url: '/pages/community/community'
    })
  },

  // 下载文件
  onDownloadFile: function (e) {
    const file = e.currentTarget.dataset.file
    util.showLoading('下载中...')
    
    wx.cloud.downloadFile({
      fileID: file.fileID,
      success: (res) => {
        wx.openDocument({
          filePath: res.tempFilePath,
          fail: (err) => {
            console.error('打开文件失败', err)
            util.showToast('打开失败')
          }
        })
      },
      fail: (err) => {
        console.error('下载文件失败', err)
        util.showToast('下载失败')
      },
      complete: () => {
        util.hideLoading()
      }
    })
  },

  // 点赞
  onLikeTap: async function () {
    if (!app.globalData.isLoggedIn) {
      util.showToast('请先登录')
      return
    }
    
    try {
      const isLiked = await api.post.like(this.data.postId, app.globalData.openid)
      
      this.setData({
        isLiked,
        'post.likeCount': isLiked ? this.data.post.likeCount + 1 : this.data.post.likeCount - 1
      })
      // 移除点赞时的订阅授权请求 — 点赞不需要订阅通知
    } catch (err) {
      console.error('点赞失败', err)
      util.showToast('操作失败')
    }
  },

  /**
   * 帖子作者打开自己帖子时，请求订阅授权
   * 这样有人评论时，作者才能收到通知
   * requestSubscribeMessage 必须在用户点击事件或 onShow 等时机调用
   * 这里用 loadPostDetail（页面加载时）调用，首次可能被微信拒绝
   * 更稳妥的做法是在作者进行某次交互时再调用
   */
  requestAuthorSubscribe: function () {
    const templateId = config.subscribeTemplates.commentReply
    if (!templateId) return

    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (res) => {
        if (res[templateId] === 'accept') {
          // 记录授权到 subscriptions 表
          this.recordSubscription(templateId, 'reply')
        }
      },
      fail: (err) => {
        // 用户拒绝或不在用户点击事件中调用
        // errCode 20004 = 用户不再询问，可引导去设置页
        if (err.errCode === 20004) {
          this.showSubscribeSettingGuide()
        }
      }
    })
  },

  // 记录用户订阅授权
  recordSubscription: async function (templateId, type) {
    try {
      const db = wx.cloud.database()
      await db.collection('subscriptions').add({
        data: {
          templateId,
          type,
          acceptTime: db.serverDate(),
          used: false
        }
      })
    } catch (err) {
      console.error('记录订阅授权失败', err)
    }
  },

  // 用户关闭了"总是询问"，引导去设置页重新开启
  showSubscribeSettingGuide: function () {
    wx.showModal({
      title: '开启消息通知',
      content: '您已关闭通知授权，如需接收评论回复通知，请在设置中开启',
      confirmText: '去设置',
      cancelText: '暂不',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting()
        }
      }
    })
  },

  // 点击评论
  onCommentTap: function () {
    wx.pageScrollTo({
      selector: '.comments-section',
      duration: 300
    })
  },

  // 分享
  onShareTap: function () {
    this.setData({
      'post.shareCount': this.data.post.shareCount + 1
    })
  },

  // 更多操作
  onMoreTap: function () {
    this.setData({ showActionSheet: true })
  },

  // 操作菜单点击
  onActionTap: async function (e) {
    const index = e.detail.index
    
    if (index === 0) {
      wx.showModal({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除吗？',
        success: async (res) => {
          if (res.confirm) {
            util.showLoading('删除中...')
            try {
              await api.post.delete(this.data.postId)
              util.hideLoading()
              util.showToast('已删除')
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            } catch (err) {
              console.error('删除失败', err)
              util.hideLoading()
              util.showToast('删除失败')
            }
          }
        }
      })
    }
    
    this.setData({ showActionSheet: false })
  },

  // 取消操作菜单
  onCancelAction: function () {
    this.setData({ showActionSheet: false })
  },

  // 评论输入
  onCommentInput: function (e) {
    this.setData({ commentContent: e.detail.value })
  },

  // 回复评论
  onReplyTap: function (e) {
    const comment = e.currentTarget.dataset.comment
    this.setData({ replyTo: comment })
  },

  // 提交评论
  onSubmitComment: async function () {
    if (!app.globalData.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再发表评论',
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
    
    const content = this.data.commentContent.trim()
    if (!content) {
      util.showToast('请输入评论内容')
      return
    }
    
    if (this.data.submitting) return

    this.setData({ submitting: true })
    util.showLoading('发送中...')
    
    try {
      const commentData = {
        postId: this.data.postId,
        content,
        userInfo: {
          nickName: app.globalData.userInfo?.nickName || '邻居',
          avatarUrl: app.globalData.userInfo?.avatarUrl || ''
        }
      }

      // 如果是回复
      if (this.data.replyTo) {
        commentData.parentId = this.data.replyTo._id
        commentData.replyToName = this.data.replyTo.userInfo.nickName
      }

      await api.comment.create(commentData)

      util.hideLoading()
      util.showToast('发送成功')

      // 发送订阅消息通知帖子作者（非自己评论自己时）
      if (!this.data.isOwner) {
        this.sendReplyNotification(content)
      }

      // 如果是回复某条评论，也通知被回复的人
      if (this.data.replyTo && this.data.replyTo._openid && this.data.replyTo._openid !== app.globalData.openid) {
        this.sendReplyToCommentNotification(content)
      }

      // 清空输入
      this.setData({
        commentContent: '',
        replyTo: null,
        submitting: false,
        'post.commentCount': (this.data.post?.commentCount || 0) + 1
      })

      // 刷新评论列表
      this.loadComments()
    } catch (err) {
      console.error('评论失败', err)
      util.hideLoading()

      let errMsg = '发送失败'
      if (err.errMsg && err.errMsg.includes('collection not exists')) {
        errMsg = '评论功能尚未开通，请联系管理员'
      } else if (err.message) {
        errMsg = err.message
      }

      util.showToast(errMsg)
      this.setData({ submitting: false })
    }
  },

  // 发送回复通知给帖子作者
  sendReplyNotification: async function (commentContent) {
    const post = this.data.post
    if (!post || !post._openid) return

    const templateId = config.subscribeTemplates.commentReply
    if (!templateId) return

    // 通知去重：检查是否已对该帖子发送过首条评论通知
    try {
      const db = wx.cloud.database()
      const dedupRes = await db.collection('notifications')
        .where({
          postId: this.data.postId,
          type: 'first_reply',
          toOpenid: post._openid
        })
        .count()

      // 如果已有通知记录，不再重复发送（避免骚扰）
      // 但如果是不同评论者，仍然需要发送
      // 简化方案：30分钟内不重复通知同一用户
      const recentNotifs = await db.collection('notifications')
        .where({
          postId: this.data.postId,
          toOpenid: post._openid,
          createTime: db.command.gte(new Date(Date.now() - 30 * 60 * 1000))
        })
        .count()

      if (recentNotifs.total > 0) {
        return // 30分钟内已通知过，不重复发送
      }
    } catch (err) {
      // notifications 表可能不存在，跳过去重直接发送
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'sendSubscribeMessage',
        data: {
          openid: post._openid,
          templateId: templateId,
          data: {
            thing1: { value: this.getPostTitle(post.content) },
            thing2: { value: this.truncateField(commentContent, 20) },
            time3: { value: util.formatTime(new Date()) }
          },
          page: `/pages/post-detail/post-detail?id=${this.data.postId}`
        }
      })

      // 记录通知（去重用）
      if (result.result && result.result.success) {
        this.recordNotification(this.data.postId, 'first_reply', post._openid)
      }
    } catch (err) {
      console.error('发送回复通知失败', err)
    }
  },

  // 发送回复通知给被回复的评论者
  sendReplyToCommentNotification: async function (commentContent) {
    const replyTo = this.data.replyTo
    if (!replyTo || !replyTo._openid) return

    const templateId = config.subscribeTemplates.commentReply
    if (!templateId) return

    try {
      await wx.cloud.callFunction({
        name: 'sendSubscribeMessage',
        data: {
          openid: replyTo._openid,
          templateId: templateId,
          data: {
            thing1: { value: this.getPostTitle(this.data.post?.content) },
            thing2: { value: this.truncateField(commentContent, 20) },
            time3: { value: util.formatTime(new Date()) }
          },
          page: `/pages/post-detail/post-detail?id=${this.data.postId}`
        }
      })
    } catch (err) {
      console.error('发送回复评论通知失败', err)
    }
  },

  // 记录通知发送（用于去重）
  recordNotification: async function (postId, type, toOpenid) {
    try {
      const db = wx.cloud.database()
      await db.collection('notifications').add({
        data: {
          postId,
          type,
          toOpenid,
          createTime: db.serverDate()
        }
      })
    } catch (err) {
      // 表可能不存在，静默失败
    }
  },

  // 获取帖子标题（取前20字，thing 类型限制 20 字符）
  getPostTitle: function (content) {
    if (!content) return '帖子'
    const cleaned = content.replace(/#[^\s#]+/g, '').trim()
    return this.truncateField(cleaned, 20) || '帖子'
  },

  // thing 类型字段截断（微信限制 20 字符，中文字符算 1 个）
  truncateField: function (str, maxLen) {
    if (!str) return ''
    if (str.length <= maxLen) return str
    return str.slice(0, maxLen - 1) + '…'
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: this.data.post ? this.data.post.content.slice(0, 50) : '邻里圈动态',
      path: `/pages/post-detail/post-detail?id=${this.data.postId}`,
      imageUrl: this.data.post && this.data.post.images[0]
    }
  }
})
