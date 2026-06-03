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
    timeRange: [['今天', '明天', '后天'], ['12:00', '18:00', '20:00', '22:00']],

    // 投票进度计算
    voteApprovePercent: 0,
    voteRejectPercent: 0,
    remainingTime: '',
    voteEnded: false
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

  onShow: function () {
    // 页面显示时启动倒计时
    this.startCountdown()
  },

  onHide: function () {
    this.stopCountdown()
  },

  onUnload: function () {
    this.stopCountdown()
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

      // 计算投票数据
      const voteData = (data.vote) || null
      const voteApprove = data.voteApprove || 0
      const voteReject = data.voteReject || 0
      const totalVotes = voteApprove + voteReject
      const voteApprovePercent = totalVotes > 0 ? Math.round(voteApprove / totalVotes * 100) : 0
      const voteRejectPercent = totalVotes > 0 ? Math.round(voteReject / totalVotes * 100) : 0

      // 判断是否截止
      let voteEnded = false
      let remainingTime = ''
      if (voteData && voteData.deadlineTs) {
        const now = Date.now()
        voteEnded = now >= voteData.deadlineTs
        if (!voteEnded) {
          remainingTime = this.formatRemainingTime(voteData.deadlineTs - now)
        }
      } else if (voteData && !voteData.deadlineTs) {
        // 兼容旧数据（没有 deadlineTs 的存量投票，尝试从 deadline 字符串解析）
        voteEnded = this.isDeadlinePassed(voteData.deadline)
      }

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
          vote: voteData,
          voteApprove,
          voteReject,
          votedUsers,
          myVote
        },
        messages,
        voteApprovePercent,
        voteRejectPercent,
        remainingTime,
        voteEnded,
        loading: false
      })

      // 启动倒计时
      if (voteData && voteData.deadlineTs && !voteEnded) {
        this.startCountdown()
      }

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

    // 把 "明天 20:00" 转成时间戳
    const deadlineTs = this.parseDeadline(deadline)

    try {
      await api.discuss.createVote(this.data.id, {
        title: title.trim(),
        deadline: deadline,
        deadlineTs: deadlineTs,
        createdAt: Date.now()
      })

      util.showToast('投票已发起')
      const remainMs = deadlineTs - Date.now()
      this.setData({
        showVotePopup: false,
        'topic.vote': { title: title.trim(), deadline: deadline, deadlineTs: deadlineTs, createdAt: Date.now() },
        'topic.voteApprove': 0,
        'topic.voteReject': 0,
        'topic.votedUsers': [],
        'topic.myVote': false,
        voteApprovePercent: 0,
        voteRejectPercent: 0,
        voteEnded: false,
        remainingTime: this.formatRemainingTime(remainMs)
      })

      this.startCountdown()
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

    // 检查是否截止
    if (this.data.voteEnded) {
      util.showToast('投票已截止')
      return
    }
    if (this.data.topic.myVote) {
      util.showToast('您已投过票')
      return
    }

    // 乐观更新
    const incField = type === 'approve' ? 'voteApprove' : 'voteReject'
    const newApprove = (this.data.topic.voteApprove || 0) + (type === 'approve' ? 1 : 0)
    const newReject = (this.data.topic.voteReject || 0) + (type === 'reject' ? 1 : 0)
    const totalVotes = newApprove + newReject

    this.setData({
      'topic.myVote': true,
      [`topic.${incField}`]: (this.data.topic[incField] || 0) + 1,
      'topic.votedUsers': [...(this.data.topic.votedUsers || []), openid],
      voteApprovePercent: totalVotes > 0 ? Math.round(newApprove / totalVotes * 100) : 0,
      voteRejectPercent: totalVotes > 0 ? Math.round(newReject / totalVotes * 100) : 0
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

  // ===== 截止时间解析 =====
  parseDeadline: function (deadlineStr) {
    // "今天 20:00" / "明天 20:00" / "后天 20:00"
    const parts = deadlineStr.split(' ')
    const datePart = parts[0] || '今天'
    const timePart = parts[1] || '20:00'
    const [hours, minutes] = timePart.split(':').map(Number)

    const now = new Date()
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)

    if (datePart === '明天') {
      target.setDate(target.getDate() + 1)
    } else if (datePart === '后天') {
      target.setDate(target.getDate() + 2)
    }
    return target.getTime()
  },

  // ===== 格式化剩余时间 =====
  formatRemainingTime: function (ms) {
    if (ms <= 0) return '已截止'
    const totalMin = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(totalMin / 60)
    const minutes = totalMin % 60
    if (hours > 0) return `剩余 ${hours} 小时 ${minutes} 分钟`
    if (minutes > 0) return `剩余 ${minutes} 分钟`
    return '即将截止'
  },

  // ===== 兼容旧数据（没 deadlineTs）判断是否截止 =====
  isDeadlinePassed: function (deadlineStr) {
    if (!deadlineStr) return false
    try {
      const ts = this.parseDeadline(deadlineStr)
      return Date.now() >= ts
    } catch (e) {
      return false
    }
  },

  // ===== 倒计时 =====
  startCountdown: function () {
    if (this._countdownTimer) return

    const tick = () => {
      const vote = this.data.topic && this.data.topic.vote
      if (!vote || !vote.deadlineTs) {
        this.stopCountdown()
        return
      }
      const remainMs = vote.deadlineTs - Date.now()
      if (remainMs <= 0) {
        this.setData({ voteEnded: true, remainingTime: '已截止' })
        this.stopCountdown()
        return
      }
      this.setData({ remainingTime: this.formatRemainingTime(remainMs) })
    }

    tick() // 立即执行一次
    this._countdownTimer = setInterval(tick, 30000) // 每 30 秒刷新
  },

  stopCountdown: function () {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer)
      this._countdownTimer = null
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
