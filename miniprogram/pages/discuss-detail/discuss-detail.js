// pages/discuss-detail/discuss-detail.js - 议题详情（聊天面板）
const app = getApp()
const util = require('../../utils/util')

const PAGE_SIZE = 20

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
    myNickName: '',
    loading: true,
    // 回复目标
    replyTo: null,

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
      this.setData({
        myAvatar: app.globalData.userInfo.avatarUrl,
        myNickName: app.globalData.userInfo.nickName || '邻居'
      })
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

  // ===== 加载议题 + 消息 =====
  loadDetail: async function (id) {
    this.setData({ loading: true })
    const db = wx.cloud.database()

    try {
      // 并行加载议题和消息
      const [topicRes, msgRes] = await Promise.all([
        db.collection('discussions').doc(id).get(),
        db.collection('discuss_messages')
          .where({ discussId: id })
          .orderBy('createTime', 'desc')
          .limit(PAGE_SIZE)
          .get()
      ])

      const data = topicRes.data
      const messages = this.formatMessages((msgRes.data || []).reverse())
      const hasMore = msgRes.data.length >= PAGE_SIZE

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
        messages,
        hasMore,
        loading: false
      })

      // 滚动到最新消息
      setTimeout(() => this.scrollToBottom(), 300)
    } catch (err) {
      console.error('加载失败', err)
      util.showToast('加载失败')
      wx.navigateBack()
    }
  },

  // ===== 格式化消息 =====
  formatMessages: function (rawList) {
    if (!rawList || rawList.length === 0) return []

    const openid = app.globalData.openid
    const messages = rawList.map((item, idx) => {
      const prev = idx > 0 ? rawList[idx - 1] : null
      const prevTime = prev ? prev.createTime : null
      const curTime = item.createTime

      // 时间线：与上一条间隔超过5分钟显示时间分隔
      let showTime = false
      if (!prevTime) {
        showTime = true
      } else {
        const prevDate = new Date(prevTime)
        const curDate = new Date(curTime)
        showTime = (curDate - prevDate) > 5 * 60 * 1000
      }

      return {
        _id: item._id,
        nickName: item.nickName || '邻居',
        avatar: item.avatar || '',
        content: item.content || '',
        createTime: item.createTime,
        displayTime: item.createTime ? util.formatTime(new Date(item.createTime), 'HH:mm') : '',
        dateStr: item.createTime ? util.formatDate(item.createTime, 'MM月DD日 HH:mm') : '',
        showTime: showTime,
        isMine: item._openid === openid,
        replyToName: item.replyToName || ''
      }
    })

    return messages
  },

  // ===== 加载更多历史消息 =====
  loadMoreMessages: async function () {
    if (!this.data.hasMore || this.data._loadingMore) return
    this.data._loadingMore = true

    const db = wx.cloud.database()
    const minTime = this.data.messages.length > 0
      ? this.data.messages[0].createTime
      : null

    try {
      let query = db.collection('discuss_messages')
        .where({ discussId: this.data.id })
        .orderBy('createTime', 'desc')
        .limit(PAGE_SIZE)

      if (minTime) {
        query = query.where(db.command.and([
          { discussId: this.data.id },
          { createTime: db.command.lt(minTime) }
        ]))
      }

      const res = await query.get()
      const olderMsgs = this.formatMessages((res.data || []).reverse())

      this.setData({
        messages: [...olderMsgs, ...this.data.messages],
        hasMore: res.data.length >= PAGE_SIZE
      })
    } catch (err) {
      console.error('加载更多消息失败', err)
    } finally {
      this.data._loadingMore = false
    }
  },

  // ===== 发送消息 =====
  onSend: async function () {
    const content = this.data.inputContent.trim()
    if (!content) return

    const userInfo = app.globalData.userInfo || {}
    const newMsg = {
      discussId: this.data.id,
      nickName: userInfo.nickName || '邻居',
      avatar: userInfo.avatarUrl || '',
      content: content,
      replyToName: this.data.replyTo ? this.data.replyTo.nickName : '',
      createTime: new Date(),
      _openid: app.globalData.openid || ''
    }

    // 乐观更新：先添加到本地列表
    const tempId = Date.now().toString()
    const localMsg = {
      _id: tempId,
      nickName: newMsg.nickName,
      avatar: newMsg.avatar,
      content: newMsg.content,
      createTime: newMsg.createTime,
      displayTime: util.formatTime(newMsg.createTime, 'HH:mm'),
      dateStr: util.formatDate(newMsg.createTime, 'MM月DD日 HH:mm'),
      showTime: true,
      isMine: true,
      replyToName: newMsg.replyToName,
      _pending: true
    }

    this.setData({
      messages: [...this.data.messages, localMsg],
      inputContent: '',
      replyTo: null
    })
    this.scrollToBottom()

    // 写入数据库
    try {
      const db = wx.cloud.database()
      const res = await db.collection('discuss_messages').add({ data: newMsg })

      // 更新本地消息的 _id 为真实 ID
      const messages = this.data.messages.map(m => {
        if (m._id === tempId) return { ...m, _id: res._id, _pending: false }
        return m
      })
      this.setData({ messages })

      // 更新议题的回复数
      await db.collection('discussions').doc(this.data.id).update({
        data: { commentCount: db.command.inc(1) }
      }).catch(() => {})
    } catch (err) {
      console.error('发送消息失败', err)
      util.showToast('发送失败')
      // 移除临时消息
      const messages = this.data.messages.filter(m => m._id !== tempId)
      this.setData({ messages, inputContent: content, replyTo: localMsg.replyToName ? { nickName: localMsg.replyToName } : null })
    }
  },

  // ===== 回复某人 =====
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

  onScrollToUpper: function () {
    if (!this.data.hasMore) return
    this.loadMoreMessages()
  },

  // ===== 投票（本地暂存） =====
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
      vote: { ...vote, myVote: 'approve', approveCount: vote.approveCount + 1 }
    })
    this.refreshVoteProgress()
    util.showToast('已投票赞成')
  },

  onVoteReject: function () {
    const vote = this.data.vote
    if (!vote || vote.myVote) return
    this.setData({
      vote: { ...vote, myVote: 'reject', rejectCount: vote.rejectCount + 1 }
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
    this.setData({ 'voteForm.timeIndex': index, 'voteForm.deadline': deadline })
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
