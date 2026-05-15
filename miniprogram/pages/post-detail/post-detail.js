// pages/post-detail/post-detail.js
const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')

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
      
      // 检查是否已点赞
      const isLiked = await api.post.checkLiked(this.data.postId, app.globalData.openid)
      
      this.setData({
        post,
        isOwner,
        isLiked,
        loading: false
      })
    } catch (err) {
      console.error('加载帖子详情失败，使用本地数据', err)
      // 云数据库无数据时，从社区页模拟数据中查找
      this.loadMockDetail()
    }
  },

  // 本地模拟数据兜底
  loadMockDetail: function () {
    const mockPosts = {
      '1': {
        _id: '1',
        userInfo: { nickName: '王先生', avatarUrl: '' },
        content: '今天小区绿化修剪，大家注意避让！物业通知周六上午进行。',
        images: [],
        tags: ['分享'],
        tag: '分享',
        likeCount: 12,
        commentCount: 3,
        isLiked: false,
        createTimeStr: '今天 14:30'
      },
      '2': {
        _id: '2',
        userInfo: { nickName: '李女士', avatarUrl: '' },
        content: '请问有人知道3号楼的快递柜在哪里吗？刚搬来不太熟悉。',
        images: [],
        tags: ['求助'],
        tag: '求助',
        likeCount: 5,
        commentCount: 8,
        isLiked: true,
        createTimeStr: '今天 10:20'
      },
      '3': {
        _id: '3',
        userInfo: { nickName: '张大爷', avatarUrl: '' },
        content: '明天早上6点有人一起晨跑吗？从小区门口出发，绕公园两圈。',
        images: [],
        tags: ['活动'],
        tag: '活动',
        likeCount: 28,
        commentCount: 15,
        isLiked: false,
        createTimeStr: '昨天 20:15'
      }
    }
    
    const post = mockPosts[this.data.postId] || mockPosts['1']
    
    this.setData({
      post,
      isOwner: false,
      isLiked: post.isLiked || false,
      loading: false
    })
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
      console.error('加载评论失败，使用本地数据', err)
      // 云数据库无数据时，显示模拟评论
      const mockComments = [
        {
          _id: 'c1',
          userInfo: { nickName: '李女士', avatarUrl: '' },
          content: '收到，会注意的！',
          createTimeStr: '今天 15:00'
        },
        {
          _id: 'c2',
          userInfo: { nickName: '张大爷', avatarUrl: '' },
          content: '辛苦物业了！',
          createTimeStr: '今天 15:30'
        }
      ]
      this.setData({ comments: mockComments })
    }
  },

  // 预览图片
  onPreviewImage: function (e) {
    const url = e.currentTarget.dataset.url
    util.previewImage(this.data.post.images, url)
  },

  // 点击标签
  onTagTap: function (e) {
    const tag = e.currentTarget.dataset.tag
    wx.navigateTo({
      url: `/pages/community/community?tag=${tag}`
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
      
      // 点赞成功后请求订阅授权（必须在用户点击事件中）
      if (isLiked) {
        this.requestSubscribeOnAction()
      }
    } catch (err) {
      console.error('点赞失败', err)
      util.showToast('操作失败')
    }
  },

  // 用户操作时请求订阅授权
  requestSubscribeOnAction: function () {
    const templateId = '19XJ-vNa8CD9RTDJG42yqTGklIkX0lep2o2CR50yVFI'
    
    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (res) => {
        console.log('订阅授权结果', res)
      },
      fail: (err) => {
        console.error('订阅授权失败', err)
      }
    })
  },

  // 点击评论
  onCommentTap: function () {
    // 滚动到评论区域
    wx.pageScrollTo({
      selector: '.comments-section',
      duration: 300
    })
  },

  // 分享
  onShareTap: function () {
    // 更新分享数
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
      // 删除帖子
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
    console.log('onSubmitComment called', {
      isLoggedIn: app.globalData.isLoggedIn,
      commentContent: this.data.commentContent,
      submitting: this.data.submitting
    })
    
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
    
    if (this.data.submitting) {
      return
    }
    
    // 先请求订阅授权（必须在用户点击事件中直接调用）
    const templateId = '19XJ-vNa8CD9RTDJG42yqTGklIkX0lep2o2CR50yVFI'
    try {
      await wx.requestSubscribeMessage({
        tmplIds: [templateId]
      })
    } catch (err) {
      console.error('订阅授权失败', err)
    }
    
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
      
      console.log('Creating comment:', commentData)
      await api.comment.create(commentData)
      
      util.hideLoading()
      util.showToast('发送成功')
      
      // 发送订阅消息通知帖子作者
      this.sendReplyNotification(content)
      
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
      
      // 更详细的错误提示
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
    // 不通知自己
    if (this.data.isOwner) {
      console.log('自己评论自己的帖子，不发送通知')
      return
    }
    
    const post = this.data.post
    if (!post || !post._openid) {
      console.log('帖子信息不完整，无法发送通知')
      return
    }
    
    const templateId = '19XJ-vNa8CD9RTDJG42yqTGklIkX0lep2o2CR50yVFI'
    
    try {
      // 直接发送订阅消息（微信会自动检查用户是否有额度）
      const result = await wx.cloud.callFunction({
        name: 'sendSubscribeMessage',
        data: {
          openid: post._openid,
          templateId: templateId,
          data: {
            thing1: { value: this.getPostTitle(post.content) },
            thing2: { value: commentContent.slice(0, 20) },
            time3: { value: util.formatTime(new Date()) }
          },
          page: `/pages/post-detail/post-detail?id=${this.data.postId}`
        }
      })
      
      console.log('订阅消息发送结果', result)
      
      if (result.result && result.result.success) {
        console.log('回复通知已发送')
      } else {
        console.log('回复通知发送失败，可能用户额度不足或未授权')
      }
    } catch (err) {
      console.error('发送回复通知失败', err)
    }
  },

  // 获取帖子标题（取前20字）
  getPostTitle: function (content) {
    if (!content) return '帖子'
    return content.replace(/#[^\s#]+/g, '').trim().slice(0, 20) || '帖子'
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