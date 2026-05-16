// pages/activity/activity.js - 活动日历
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    weekStartDate: '',
    weekTitle: '',
    weekDays: [],
    selectedDate: '',
    selectedDateStr: '',
    activities: [],
    loading: true,

    // 发布弹窗
    showPublishDialog: false,
    submitting: false,
    canSubmit: false,
    today: '',
    publishForm: {
      title: '',
      date: '',
      location: '',
      desc: '',
      maxCount: 20
    }
  },

  onLoad: function () {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })
    const today = util.formatDate(new Date(), 'YYYY-MM-DD')
    this.setData({ today })
    this.initCalendar()
  },

  onPullDownRefresh: function () {
    this.loadWeek(this.data.weekStartDate).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 初始化日历
  initCalendar: function () {
    const now = new Date()
    const today = util.formatDate(now, 'YYYY-MM-DD')

    this.setData({
      weekStartDate: today,
      selectedDate: today,
      selectedDateStr: '今天'
    })

    this.loadWeek(today)
  },

  // 加载一周日期和活动标记
  loadWeek: async function (startDate) {
    const weekDays = this.buildWeekDays(startDate)
    const weekTitle = this.formatWeekTitle(weekDays)

    this.setData({ weekStartDate: startDate, weekTitle, weekDays })
    await this.loadActivityMarkers()
    await this.loadActivities()
  },

  // 构建连续七天
  buildWeekDays: function (startDate) {
    const weekNames = ['日', '一', '二', '三', '四', '五', '六']
    const start = this.parseDate(startDate)
    const today = this.data.today || util.formatDate(new Date(), 'YYYY-MM-DD')

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const dateStr = util.formatDate(date, 'YYYY-MM-DD')

      return {
        day: date.getDate(),
        weekday: weekNames[date.getDay()],
        date: dateStr,
        isToday: dateStr === today,
        isSelected: dateStr === this.data.selectedDate,
        hasActivity: false
      }
    })
  },

  // 格式化周标题
  formatWeekTitle: function (weekDays) {
    if (!weekDays.length) return ''

    const first = this.parseDate(weekDays[0].date)
    const last = this.parseDate(weekDays[weekDays.length - 1].date)
    const firstText = util.formatDate(first, 'MM月DD日')
    const lastText = util.formatDate(last, 'MM月DD日')
    return `${firstText} - ${lastText}`
  },

  // 上一周
  onPrevWeek: function () {
    const start = this.parseDate(this.data.weekStartDate)
    start.setDate(start.getDate() - 7)
    const startDate = util.formatDate(start, 'YYYY-MM-DD')
    this.setData({
      selectedDate: startDate,
      selectedDateStr: this.formatSelectedDate(startDate)
    })
    this.loadWeek(startDate)
  },

  // 下一周
  onNextWeek: function () {
    const start = this.parseDate(this.data.weekStartDate)
    start.setDate(start.getDate() + 7)
    const startDate = util.formatDate(start, 'YYYY-MM-DD')
    this.setData({
      selectedDate: startDate,
      selectedDateStr: this.formatSelectedDate(startDate)
    })
    this.loadWeek(startDate)
  },

  // 选择日期
  onDayTap: function (e) {
    const date = e.currentTarget.dataset.date

    // 更新选中状态
    const weekDays = this.data.weekDays.map(d => ({
      ...d,
      isSelected: d.date === date
    }))

    this.setData({
      selectedDate: date,
      selectedDateStr: this.formatSelectedDate(date),
      weekDays
    })

    this.loadActivities()
  },

  // 选中日期标题
  formatSelectedDate: function (date) {
    return date === this.data.today ? '今天' : util.formatDate(this.parseDate(date), 'MM月DD日')
  },

  // 避免不同机型对 YYYY-MM-DD 解析不一致
  parseDate: function (date) {
    if (date instanceof Date) return new Date(date)
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day)
  },

  // 加载当前周活动标记
  loadActivityMarkers: async function () {
    try {
      const db = wx.cloud.database()
      const _ = db.command
      const dates = this.data.weekDays.map(item => item.date)

      const res = await db.collection('activities')
        .where({
          status: _.neq('deleted'),
          date: _.in(dates)
        })
        .field({ date: true })
        .get()

      const activityDateSet = {}
      res.data.forEach(item => {
        activityDateSet[item.date] = true
      })

      this.setData({
        weekDays: this.data.weekDays.map(item => ({
          ...item,
          hasActivity: !!activityDateSet[item.date]
        }))
      })
    } catch (err) {
      console.error('加载活动标记失败', err)
    }
  },

  // 加载活动列表
  loadActivities: async function () {
    this.setData({ loading: true })

    try {
      const db = wx.cloud.database()
      const _ = db.command

      const res = await db.collection('activities')
        .where({
          status: _.neq('deleted'),
          date: this.data.selectedDate
        })
        .orderBy('createTime', 'desc')
        .get()

      this.setData({ activities: this.formatActivities(res.data) })
    } catch (err) {
      console.error('加载活动失败', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 格式化活动展示字段
  formatActivities: function (activities) {
    const statusMap = {
      upcoming: '未开始',
      ongoing: '进行中',
      ended: '已结束',
      active: '未开始',
      published: '未开始'
    }

    return activities.map(item => ({
      ...item,
      status: item.status === 'active' || item.status === 'published' ? 'upcoming' : item.status,
      statusLabel: item.statusLabel || statusMap[item.status] || '未开始',
      time: item.time || item.date || '',
      joinCount: item.joinCount || 0,
      joinAvatars: item.joinAvatars || []
    }))
  },

  // 点击活动
  onActivityTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${id}`
    })
  },

  // 报名活动
  onJoinTap: function (e) {
    const id = e.currentTarget.dataset.id
    const isJoined = e.currentTarget.dataset.joined

    if (isJoined) {
      wx.showModal({
        title: '取消报名',
        content: '确定要取消报名吗？',
        success: (res) => {
          if (res.confirm) {
            this.updateJoinStatus(id, false)
          }
        }
      })
    } else {
      // 检查登录
      if (!app.globalData.userInfo) {
        wx.showModal({
          title: '提示',
          content: '报名活动需要先登录',
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

      this.updateJoinStatus(id, true)
    }
  },

  // 更新报名状态
  updateJoinStatus: function (id, isJoined) {
    const activities = this.data.activities.map(a => {
      if (a._id === id) {
        return {
          ...a,
          isJoined,
          joinCount: isJoined ? a.joinCount + 1 : a.joinCount - 1
        }
      }
      return a
    })

    this.setData({ activities })
    util.showToast(isJoined ? '报名成功' : '已取消报名')
  },

  // 打开发布弹窗
  onPublishTap: function () {
    if (!app.globalData.isLoggedIn || !app.globalData.openid) {
      wx.showModal({
        title: '提示',
        content: '发起活动需要先登录',
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

    this.setData({ showPublishDialog: true })
  },

  // 关闭发布弹窗
  onClosePublishDialog: function () {
    this.setData({ showPublishDialog: false })
  },

  // 检查是否可以提交
  checkCanSubmit: function () {
    const { publishForm } = this.data
    const canSubmit = publishForm.title.trim() &&
                      publishForm.date &&
                      publishForm.location.trim()
    this.setData({ canSubmit })
  },

  // 输入标题
  onTitleInput: function (e) {
    this.setData({ 'publishForm.title': e.detail.value }, this.checkCanSubmit)
  },

  // 选择日期
  onDateChange: function (e) {
    this.setData({ 'publishForm.date': e.detail.value }, this.checkCanSubmit)
  },

  // 输入地点
  onLocationInput: function (e) {
    this.setData({ 'publishForm.location': e.detail.value }, this.checkCanSubmit)
  },

  // 输入描述
  onDescInput: function (e) {
    this.setData({ 'publishForm.desc': e.detail.value })
  },

  // 减少人数
  onCountMinus: function () {
    const count = this.data.publishForm.maxCount
    if (count > 5) {
      this.setData({ 'publishForm.maxCount': count - 5 })
    }
  },

  // 增加人数
  onCountPlus: function () {
    const count = this.data.publishForm.maxCount
    if (count < 100) {
      this.setData({ 'publishForm.maxCount': count + 5 })
    }
  },

  // 提交发布
  onSubmit: async function () {
    if (!this.data.canSubmit || this.data.submitting) return

    this.setData({ submitting: true })

    try {
      const db = wx.cloud.database()
      const { publishForm } = this.data

      await db.collection('activities').add({
        data: {
          title: publishForm.title.trim(),
          date: publishForm.date,
          time: publishForm.date,
          location: publishForm.location.trim(),
          desc: publishForm.desc.trim(),
          maxCount: publishForm.maxCount,
          joinCount: 0,
          joinAvatars: [],
          status: 'upcoming',
          statusLabel: '未开始',
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })

      util.showToast('发布成功')
      const selected = this.parseDate(publishForm.date)
      const weekStartDate = util.formatDate(selected, 'YYYY-MM-DD')
      this.setData({
        showPublishDialog: false,
        canSubmit: false,
        weekStartDate,
        selectedDate: publishForm.date,
        selectedDateStr: this.formatSelectedDate(publishForm.date),
        publishForm: {
          title: '',
          date: '',
          location: '',
          desc: '',
          maxCount: 20
        }
      })
      this.loadWeek(weekStartDate)
    } catch (err) {
      console.error('发布失败', err)
      util.showToast(err.errMsg || err.message || '发布失败')
    } finally {
      this.setData({ submitting: false })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '活动日历 - 社区活动，邻里同乐',
      path: '/pages/activity/activity'
    }
  },

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' })
      }
    })
  }
})
