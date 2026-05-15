// pages/activity/activity.js - 活动日历
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    currentYear: 2026,
    currentMonth: 5,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
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
    this.loadActivities()
  },

  onPullDownRefresh: function () {
    this.loadActivities().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 初始化日历
  initCalendar: function () {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    
    this.setData({
      currentYear: year,
      currentMonth: month,
      selectedDate: util.formatDate(now, 'YYYY-MM-DD'),
      selectedDateStr: '今天'
    })
    
    this.generateCalendarDays(year, month)
  },

  // 生成日历天数
  generateCalendarDays: function (year, month) {
    const days = []
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const firstDayWeek = firstDay.getDay()
    const totalDays = lastDay.getDate()
    
    // 上月补充天数
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      const prevMonth = month - 1 === 0 ? 12 : month - 1
      const prevYear = month - 1 === 0 ? year - 1 : year
      days.push({
        day,
        date: `${prevYear}-${prevMonth}-${day}`,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasActivity: false
      })
    }
    
    // 当月天数
    const today = new Date()
    for (let i = 1; i <= totalDays; i++) {
      const date = `${year}-${month}-${i}`
      const isToday = today.getFullYear() === year && 
                      today.getMonth() + 1 === month && 
                      today.getDate() === i
      const isSelected = this.data.selectedDate === util.formatDate(new Date(year, month - 1, i), 'YYYY-MM-DD')
      
      days.push({
        day: i,
        date: util.formatDate(new Date(year, month - 1, i), 'YYYY-MM-DD'),
        isCurrentMonth: true,
        isToday,
        isSelected,
        hasActivity: this.checkHasActivity(date)
      })
    }
    
    // 下月补充天数
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month + 1 === 13 ? 1 : month + 1
      const nextYear = month + 1 === 13 ? year + 1 : year
      days.push({
        day: i,
        date: `${nextYear}-${nextMonth}-${i}`,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasActivity: false
      })
    }
    
    this.setData({ calendarDays: days })
  },

  // 检查是否有活动（模拟）
  checkHasActivity: function (date) {
    const activityDates = ['2026-05-15', '2026-05-20', '2026-05-28']
    return activityDates.includes(date)
  },

  // 上个月
  onPrevMonth: function () {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 1) {
      currentYear -= 1
      currentMonth = 12
    } else {
      currentMonth -= 1
    }
    this.setData({ currentYear, currentMonth })
    this.generateCalendarDays(currentYear, currentMonth)
    this.loadActivities()
  },

  // 下个月
  onNextMonth: function () {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 12) {
      currentYear += 1
      currentMonth = 1
    } else {
      currentMonth += 1
    }
    this.setData({ currentYear, currentMonth })
    this.generateCalendarDays(currentYear, currentMonth)
    this.loadActivities()
  },

  // 选择日期
  onDayTap: function (e) {
    const date = e.currentTarget.dataset.date
    const dayObj = this.data.calendarDays.find(d => d.date === date)
    
    // 更新选中状态
    const calendarDays = this.data.calendarDays.map(d => ({
      ...d,
      isSelected: d.date === date
    }))
    
    this.setData({
      selectedDate: date,
      selectedDateStr: dayObj.isToday ? '今天' : util.formatDate(new Date(date), 'MM月DD日'),
      calendarDays
    })
    
    this.loadActivities()
  },

  // 加载活动列表
  loadActivities: async function () {
    this.setData({ loading: true })
    
    try {
      // 模拟数据
      const mockActivities = [
        {
          _id: '1',
          title: '社区亲子运动会',
          cover: '',
          location: '小区广场',
          timeStr: '5月15日 上午9:00',
          status: 'upcoming',
          joinCount: 32,
          joinAvatars: ['', '', ''],
          isJoined: false
        },
        {
          _id: '2',
          title: '端午节包粽子活动',
          cover: '',
          location: '物业中心',
          timeStr: '5月28日 下午2:00',
          status: 'upcoming',
          joinCount: 18,
          joinAvatars: ['', ''],
          isJoined: true
        },
        {
          _id: '3',
          title: '小区读书分享会',
          cover: '',
          location: '社区图书馆',
          timeStr: '每周三 晚上7:00',
          status: 'ongoing',
          joinCount: 8,
          joinAvatars: [''],
          isJoined: false
        }
      ]
      
      this.setData({ activities: mockActivities })
    } catch (err) {
      console.error('加载活动失败', err)
    } finally {
      this.setData({ loading: false })
    }
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
    if (!app.globalData.userInfo) {
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
      // TODO: 提交到云数据库
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      util.showToast('发布成功')
      this.setData({ 
        showPublishDialog: false,
        publishForm: {
          title: '',
          date: '',
          location: '',
          desc: '',
          maxCount: 20
        }
      })
      this.loadActivities()
    } catch (err) {
      console.error('发布失败', err)
      util.showToast('发布失败')
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