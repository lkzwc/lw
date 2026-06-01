// pages/discuss-detail/discuss-detail.js - 议题详情
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    statusBarHeight: 20,
    id: '',
    topic: null,
    vote: null,
    messages: [],
    scrollToView: '',
    hasMore: true,
    inputContent: '',
    myAvatar: '',
    loading: true,

    // 发起投票弹窗
    showVotePopup: false,
    voteForm: {
      title: '',
      deadline: '',
      description: '',
      timeIndex: [0, 0]
    },
    timeRange: [['今天', '明天', '后天'], ['12:00', '18:00', '20:00', '22:00']]
  },

  onLoad: function (options) {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })

    const id = options.id
    if (id) {
      this.setData({ id })
      this.loadDetail(id)
    } else {
      util.showToast('缺少议题ID')
      wx.navigateBack()
    }

    if (app.globalData.userInfo) {
      this.setData({ myAvatar: app.globalData.userInfo.avatarUrl })
    }
  },

  onShow: function () {
    if (this.data.vote && this.data.vote.active) {
      this.refreshVoteProgress()
      this.voteTimer = setInterval(() => {
        this.refreshVoteProgress()
      }, 5000)
    }
  },

  onHide: function () {
    this.clearVoteTimer()
  },

  onUnload: function () {
    this.clearVoteTimer()
  },

  clearVoteTimer: function () {
    if (this.voteTimer) {
      clearInterval(this.voteTimer)
      this.voteTimer = null
    }
  },

  // 加载详情
  loadDetail: async function (id) {
    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const res = await db.collection('discussions').doc(id).get()

      const data = res.data
      this.setData({
        topic: {
          id: data._id,
          title: data.title || '',
          description: data.description || '',
          author: data.author || data.userName || '邻居',
          avatar: data.avatarUrl || '',
          createTime: data.createTime ? util.formatDate(data.createTime, 'MM-DD HH:mm') : '',
          status: data.status || 'discussing',
          statusText: data.statusText || '讨论中',
          isAuthor: data._openid === app.globalData.openid
        },
        loading: false
      })
    } catch (err) {
      console.error('加载议题失败', err)
      util.showToast('加载失败')
      wx.navigateBack()
    }
  },

  refreshVoteProgress: function () {
    if (!this.data.vote) return
    const vote = this.data.vote
    const total = vote.approveCount + vote.rejectCount + vote.neutralCount
    if (total > 0) {
      this.setData({
        vote: {
          ...vote,
          approvePercent: Math.round(vote.approveCount / total * 100),
          rejectPercent: Math.round(vote.rejectCount / total * 100)
        }
      })
    }
  },

  onVoteApprove: function () {
    const vote = this.data.vote
    if (!vote || vote.myVote) return
    this.setData({
      vote: {
        ...vote,
        myVote: 'approve',
        approveCount: vote.approveCount + 1
      }
    })
    this.refreshVoteProgress()
    util.showToast('已投票赞成')
  },

  onVoteReject: function () {
    const vote = this.data.vote
    if (!vote || vote.myVote) return
    this.setData({
      vote: {
        ...vote,
        myVote: 'reject',
        rejectCount: vote.rejectCount + 1
      }
    })
    this.refreshVoteProgress()
    util.showToast('已投票反对')
  },

  onStartVote: function () {
    this.setData({
      showVotePopup: true,
      voteForm: { title: '', deadline: '', description: '', timeIndex: [0, 0] }
    })
  },

  onCloseVotePopup: function () {
    this.setData({ showVotePopup: false })
  },

  onVoteTitleInput: function (e) {
    this.setData({ 'voteForm.title': e.detail.value })
  },

  onTimePick: function (e) {
    const index = e.detail.value
    const deadline = this.data.timeRange[0][index[0]] + ' ' + this.data.timeRange[1][index[1]]
    this.setData({
      'voteForm.timeIndex': index,
      'voteForm.deadline': deadline
    })
  },

  onVoteDescInput: function (e) {
    this.setData({ 'voteForm.description': e.detail.value })
  },

  onSubmitVote: function () {
    const { title, deadline } = this.data.voteForm
    if (!title.trim()) { util.showToast('请输入投票议题'); return }
    if (!deadline) { util.showToast('请选择截止时间'); return }

    util.showToast('投票已发起')
    this.setData({
      showVotePopup: false,
      vote: {
        active: true,
        title: title,
        deadline: deadline,
        approveCount: 0,
        rejectCount: 0,
        neutralCount: 80,
        approvePercent: 0,
        rejectPercent: 0,
        myVote: null
      }
    })
  },

  onInput: function (e) {
    this.setData({ inputContent: e.detail.value })
  },

  onSend: function () {
    const content = this.data.inputContent.trim()
    if (!content) return

    const newMsg = {
      _id: Date.now().toString(),
      nickName: '我',
      avatar: this.data.myAvatar,
      content: content,
      timeStr: new Date().toISOString(),
      displayTime: util.formatTime(new Date(), 'HH:mm'),
      showTime: true,
      isMine: true
    }

    this.setData({
      messages: [...this.data.messages, newMsg],
      inputContent: ''
    })
    this.scrollToBottom()
  },

  scrollToBottom: function () {
    const messages = this.data.messages
    if (messages.length > 0) {
      this.setData({ scrollToView: 'msg-' + messages[messages.length - 1]._id })
    }
  },

  onScrollToUpper: function () {
    if (!this.data.hasMore) return
  },

  onBackTap: function () {
    wx.navigateBack({
      delta: 1,
      fail: () => { wx.switchTab({ url: '/pages/index/index' }) }
    })
  },

  onShareAppMessage: function () {
    return {
      title: this.data.topic ? this.data.topic.title : '业主议事厅',
      path: '/pages/discuss-detail/discuss-detail?id=' + this.data.id
    }
  }
})
