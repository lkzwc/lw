// pages/discuss-detail/discuss-detail.js - 业主议事厅详情（消息+投票内嵌 discussions 文档）
const app = getApp()
const util = require('../../utils/util')
const api = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 20,
    id: '',
    topic: null,
    messages: [],
    scrollToView: '',
    inputContent: '',
    myAvatar: '',
    myNickName: '',
    loading: true,
    replyTo: null,

    // 投票弹窗
    showVotePopup: false,
    voteForm: { title: '', deadline: '', timeIndex: [0, 0] },
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
      this.setData({
        myAvatar: app.globalData.userInfo.avatarUrl || '',
        myNickName: app.globalData.userInfo.nickName || '邻居'
      })
    }
  },

  // ===== 加载议题（含消息+投票） =====
  loadDetail: async function (id) {
    this.setData({ loading: true })

    try {
      const data = await api.discuss.getDetail(id)
      const openid = app.globalData.openid || ''

      // 格式化消息
      const rawMessages = data.messages || []
      const messages = this.formatMessages(rawMessages, openid)

      // 投票状态
      const votedUsers = data.votedUsers || []
      const myVote = votedUsers.indexOf(openid) >= 0

      this.setData({
        topic: {
          id: data._id,
          title: data.title || '',
          description: data.description || '',
          author: data.author || '邻居',
          avatar: data.avatarUrl || '',
          createTime: data.createTime ? util.formatDate(data.createTime, 'MM-DD HH:mm') : '',
          status: data.status || 'discussing',
          statusText: data.statusText || '讨论中',
          isAuthor: data._openid === openid,
          vote: (data.vote) || null,
          voteApprove: data.voteApprove || 0,
          voteReject: data.voteReject || 0,
          votedUsers: votedUsers,
          myVote: myVote
        },
        messages,
        loading: false
      })

      setTimeout(() => this.scrollToBottom(), 300)
    } catch (err) {
      console.error('加载失败', err)
      util.showToast('加载失败')
      wx.navigateBack()
    }
  },

  // ===== 格式化消息 =====
  formatMessages: function (rawList, openid) {
    if (!rawList || rawList.length === 0) return []

    return rawList.map((item, idx) => {
      const prev = idx > 0 ? rawList[idx - 1] : null
      let showTime = false
      if (!prev) {
        showTime = true
      } else {
        showTime = (item.time - prev.time) > 5 * 60 * 1000 || (item.time - prev.time) < 0
      }

      const msgDate = new Date(item.time)
      return {
        _id: item.time ? item.time.toString() : String(idx),
        userId: item.userId || '',
        nickName: item.nickName || '邻居',
        avatar: item.avatar || '',
        content: item.content || '',
        displayTime: util.formatTime(msgDate, 'HH:mm'),
        dateStr: util.formatDate(msgDate, 'MM月DD日 HH:mm'),
        showTime: showTime,
        isMine: item.userId === openid,
        replyToName: item.replyToName || ''
      }
    })
  },

  // ===== 发送消息 =====
  onSend: async function () {
    const content = this.data.inputContent.trim()
    if (!content) return

    const userInfo = app.globalData.userInfo || {}
    const openid = app.globalData.openid || ''
    const now = Date.now()

    const newMsg = {
      time: now,
      userId: openid,
      nickName: userInfo.nickName || '邻居',
      avatar: userInfo.avatarUrl || '',
      content: content,
      replyToName: this.data.replyTo ? this.data.replyTo.nickName : ''
    }

    // 乐观更新
    const localMsg = {
      _id: now.toString(),
      userId: openid,
      nickName: newMsg.nickName,
      avatar: newMsg.avatar,
      content: newMsg.content,
      displayTime: util.formatTime(new Date(now), 'HH:mm'),
      dateStr: util.formatDate(new Date(now), 'MM月DD日 HH:mm'),
      showTime: true,
      isMine: true,
      replyToName: newMsg.replyToName
    }

    this.setData({
      messages: [...this.data.messages, localMsg],
      inputContent: '',
      replyTo: null
    })
    this.scrollToBottom()

    // 写入数据库
    try {
      await api.discuss.sendMessage(this.data.id, newMsg)
    } catch (err) {
      console.error('发送失败', err)
      util.showToast('发送失败')
      const messages = this.data.messages.filter(m => m._id !== now.toString())
      this.setData({ messages, inputContent: content })
    }
  },

  // ===== 回复 =====
  onReplyTap: function (e) {
    const item = e.currentTarget.dataset.item
    this.setData({ replyTo: item })
  },

  onInputBlur: function () {
    if (!this.data.inputContent.trim()) {
      this.setData({ replyTo: null })
    }
  },

  // ===== 输入 =====
  onInput: function (e) {
    this.setData({ inputContent: e.detail.value })
  },

  // ===== 滚动 =====
  scrollToBottom: function () {
    const messages = this.data.messages
    if (messages.length > 0) {
      this.setData({ scrollToView: 'msg-' + messages[messages.length - 1]._id })
    }
  },

  // ===== 投票：发起 =====
  onStartVote: function () {
    this.setData({
      showVotePopup: true,
      voteForm: { title: '', deadline: '', timeIndex: [0, 0] }
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
    this.setData({ 'voteForm.timeIndex': index, 'voteForm.deadline': deadline })
  },

  onSubmitVote: async function () {
    const { title, deadline } = this.data.voteForm
    if (!title.trim()) { util.showToast('请输入投票议题'); return }
    if (!deadline) { util.showToast('请选择截止时间'); return }

    try {
      await api.discuss.createVote(this.data.id, { title: title.trim(), deadline: deadline })

      util.showToast('投票已发起')
      this.setData({
        showVotePopup: false,
        'topic.vote': { title: title.trim(), deadline: deadline },
        'topic.voteApprove': 0,
        'topic.voteReject': 0,
        'topic.votedUsers': [],
        'topic.myVote': false
      })
    } catch (err) {
      console.error('发起投票失败', err)
      util.showToast('发起失败')
    }
  },

  // ===== 投票：赞成/反对 =====
  onVoteApprove: async function () {
    await this.doVote('approve')
  },

  onVoteReject: async function () {
    await this.doVote('reject')
  },

  doVote: async function (type) {
    const openid = app.globalData.openid
    if (!openid || !this.data.topic) return
    if (this.data.topic.myVote) {
      util.showToast('您已投过票')
      return
    }

    // 乐观更新
    const incField = type === 'approve' ? 'voteApprove' : 'voteReject'
    this.setData({
      'topic.myVote': true,
      [`topic.${incField}`]: (this.data.topic[incField] || 0) + 1,
      'topic.votedUsers': [...(this.data.topic.votedUsers || []), openid]
    })

    try {
      await api.discuss.doVote(this.data.id, openid, type)
      util.showToast(type === 'approve' ? '已投票赞成' : '已投票反对')
    } catch (err) {
      console.error('投票失败', err)
      // 回滚
      this.setData({
        'topic.myVote': false,
        [`topic.${incField}`]: (this.data.topic[incField] || 1) - 1
      })
    }
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
