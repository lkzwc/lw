// pages/discuss/discuss.js - 业主议事厅
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    // 状态栏高度
    statusBarHeight: 20,
    
    // 议题信息
    topic: {
      id: '',
      title: '关于小区停车位分配方案的讨论',
      description: '近期小区停车位紧张，物业提出了新的分配方案，请大家讨论并提出意见。方案要点：1. 按住户比例分配；2. 引入临时停车收费机制；3. 设置访客停车专区。',
      author: '张大爷',
      createTime: '2024-05-12 10:30',
      status: 'voting', // discussing | voting | resolved
      statusText: '投票中',
      isAuthor: true, // 当前用户是否是发起人
      isParticipant: true // 当前用户是否是参与者
    },
    
    // 投票信息
    vote: {
      active: true,
      title: '是否同意新停车位分配方案？',
      deadline: '2024-05-15 18:00',
      approveCount: 45,
      rejectCount: 12,
      neutralCount: 23,
      approvePercent: 55,
      rejectPercent: 15,
      myVote: null // null | 'approve' | 'reject'
    },
    
    // 消息列表
    messages: [
      {
        _id: '1',
        nickName: '王先生',
        avatar: '',
        content: '我觉得方案整体不错，但临时停车收费是不是太高了？',
        timeStr: '2024-05-12 11:00',
        displayTime: '11:00',
        showTime: true,
        isMine: false
      },
      {
        _id: '2',
        nickName: '李女士',
        avatar: '',
        content: '同意，访客停车专区这个想法很好，解决了之前访客乱停的问题',
        timeStr: '2024-05-12 11:15',
        displayTime: '11:15',
        showTime: true,
        isMine: false
      },
      {
        _id: '3',
        nickName: '我',
        avatar: '',
        content: '我赞成这个方案，按住户比例分配更公平',
        timeStr: '2024-05-12 11:30',
        displayTime: '11:30',
        showTime: true,
        isMine: true
      },
      {
        _id: '4',
        nickName: '赵阿姨',
        avatar: '',
        content: '但是有些住户家里车多，按比例分配会不会不公平？',
        timeStr: '2024-05-12 12:00',
        displayTime: '12:00',
        showTime: true,
        isMine: false
      }
    ],
    
    scrollToView: '',
    hasMore: true,
    
    // 输入
    inputContent: '',
    myAvatar: '',
    
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
    // 获取系统状态栏高度
    const sysInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight
    })

    const topicId = options.id
    if (topicId) {
      // TODO: 加载议题详情
    }
    
    // 设置用户头像
    if (app.globalData.userInfo) {
      this.setData({
        myAvatar: app.globalData.userInfo.avatarUrl
      })
    }
    
    // 滚动到最后一条消息
    this.scrollToBottom()
  },

  onShow: function () {
    // 实时更新投票进度
    this.refreshVoteProgress()
    
    // 定时刷新投票进度（每5秒）
    if (this.data.vote.active) {
      this.voteTimer = setInterval(() => {
        this.refreshVoteProgress()
      }, 5000)
    }
  },

  onHide: function () {
    // 清除定时器
    if (this.voteTimer) {
      clearInterval(this.voteTimer)
      this.voteTimer = null
    }
  },

  onUnload: function () {
    // 清除定时器
    if (this.voteTimer) {
      clearInterval(this.voteTimer)
      this.voteTimer = null
    }
  },

  // 刷新投票进度
  refreshVoteProgress: function () {
    // TODO: 从服务器获取最新投票数据
    // 模拟实时更新
    const vote = this.data.vote
    const total = vote.approveCount + vote.rejectCount + vote.neutralCount
    this.setData({
      vote: {
        ...vote,
        approvePercent: Math.round(vote.approveCount / total * 100),
        rejectPercent: Math.round(vote.rejectCount / total * 100)
      }
    })
  },

  // 投票赞成
  onVoteApprove: async function () {
    const vote = this.data.vote
    this.setData({
      vote: {
        ...vote,
        myVote: 'approve',
        approveCount: vote.approveCount + 1,
        neutralCount: vote.neutralCount - 1
      }
    })
    this.refreshVoteProgress()
    util.showToast('已投票赞成')
    
    // TODO: 提交投票到服务器
  },

  // 投票反对
  onVoteReject: async function () {
    const vote = this.data.vote
    this.setData({
      vote: {
        ...vote,
        myVote: 'reject',
        rejectCount: vote.rejectCount + 1,
        neutralCount: vote.neutralCount - 1
      }
    })
    this.refreshVoteProgress()
    util.showToast('已投票反对')
    
    // TODO: 提交投票到服务器
  },

  // 发起投票
  onStartVote: function () {
    this.setData({
      showVotePopup: true,
      voteForm: {
        title: '',
        deadline: '',
        description: '',
        timeIndex: [0, 0]
      }
    })
  },

  // 关闭投票弹窗
  onCloseVotePopup: function () {
    this.setData({ showVotePopup: false })
  },

  // 输入投票标题
  onVoteTitleInput: function (e) {
    this.setData({
      voteForm: {
        ...this.data.voteForm,
        title: e.detail.value
      }
    })
  },

  // 选择截止时间
  onTimePick: function (e) {
    const index = e.detail.value
    const deadline = this.data.timeRange[0][index[0]] + ' ' + this.data.timeRange[1][index[1]]
    this.setData({
      voteForm: {
        ...this.data.voteForm,
        timeIndex: index,
        deadline: deadline
      }
    })
  },

  // 输入投票说明
  onVoteDescInput: function (e) {
    this.setData({
      voteForm: {
        ...this.data.voteForm,
        description: e.detail.value
      }
    })
  },

  // 提交投票
  onSubmitVote: function () {
    const { title, deadline } = this.data.voteForm
    if (!title.trim()) {
      util.showToast('请输入投票议题')
      return
    }
    if (!deadline) {
      util.showToast('请选择截止时间')
      return
    }
    
    // TODO: 提交到服务器
    util.showToast('投票已发起')
    this.setData({
      showVotePopup: false,
      vote: {
        active: true,
        title: title,
        deadline: deadline,
        approveCount: 0,
        rejectCount: 0,
        neutralCount: 80, // 参与者总数
        approvePercent: 0,
        rejectPercent: 0,
        myVote: null
      },
      topic: {
        ...this.data.topic,
        status: 'voting',
        statusText: '投票中'
      }
    })
  },

  // 输入消息
  onInput: function (e) {
    this.setData({ inputContent: e.detail.value })
  },

  // 发送消息
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
    
    // 滚动到底部
    this.scrollToBottom()
    
    // TODO: 发送消息到服务器
  },

  // 滚动到底部
  scrollToBottom: function () {
    const messages = this.data.messages
    if (messages.length > 0) {
      const lastId = messages[messages.length - 1]._id
      this.setData({
        scrollToView: `msg-${lastId}`
      })
    }
  },

  // 加载更多消息
  onScrollToUpper: function () {
    if (!this.data.hasMore) return
    // TODO: 加载历史消息
  },

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' })
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: this.data.topic.title,
      path: `/pages/discuss/discuss?id=${this.data.topic.id}`
    }
  }
})