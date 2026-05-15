// pages/carpool/carpool.js - 牛马专线
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    filterType: 'all',
    routes: [],
    loading: true,
    
    // 发布弹窗
    showPublishDialog: false,
    submitting: false,
    canSubmit: false,
    publishForm: {
      type: 'long',
      start: '',
      end: '',
      timeStr: '',
      schedule: '',
      seats: 3,
      phone: ''
    },
    timeRange: [[], [], []],
    timeIndex: [0, 0, 0]
  },

  onLoad: function (options) {
    this.initTimeRange()
    this.loadRoutes()
  },

  initTimeRange: function () {
    const days = ['今天', '明天', '后天']
    const hours = []
    const minutes = []
    
    for (let i = 0; i < 24; i++) {
      hours.push(i.toString().padStart(2, '0') + '时')
    }
    for (let i = 0; i < 60; i += 10) {
      minutes.push(i.toString().padStart(2, '0') + '分')
    }
    
    this.setData({
      timeRange: [days, hours, minutes]
    })
  },

  onPullDownRefresh: function () {
    this.loadRoutes().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载路线列表
  loadRoutes: async function () {
    this.setData({ loading: true })
    
    try {
      // 模拟数据
      const mockRoutes = [
        {
          _id: '1',
          start: '小区东门',
          end: '高新软件园',
          type: 'long',
          distance: '约12km',
          seats: 2,
          userName: '张先生',
          avatar: '',
          timeStr: '工作日 8:00',
          phone: '138****8888'
        },
        {
          _id: '2',
          start: '小区西门',
          end: '钟楼',
          type: 'once',
          distance: '约8km',
          seats: 3,
          userName: '李女士',
          avatar: '',
          timeStr: '周六 10:00',
          phone: '139****9999'
        },
        {
          _id: '3',
          start: '小区北门',
          end: '咸阳机场',
          type: 'once',
          distance: '约35km',
          seats: 1,
          userName: '王先生',
          avatar: '',
          timeStr: '明天 6:00',
          phone: '137****7777'
        }
      ]
      
      let filteredRoutes = mockRoutes
      if (this.data.filterType !== 'all') {
        filteredRoutes = mockRoutes.filter(r => r.type === this.data.filterType)
      }
      
      this.setData({ routes: filteredRoutes })
    } catch (err) {
      console.error('加载路线失败', err)
      util.showToast('加载失败，请重试')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 切换筛选
  onFilterChange: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({ filterType: type })
    this.loadRoutes()
  },

  // 点击路线
  onRouteTap: function (e) {
    const id = e.currentTarget.dataset.id
    const route = this.data.routes.find(r => r._id === id)
    
    if (!route) return
    
    wx.showModal({
      title: '联系车主',
      content: `确定要联系 ${route.userName} 吗？`,
      confirmText: '拨打电话',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: route.phone,
            fail: () => {
              util.showToast('拨打电话失败')
            }
          })
        }
      }
    })
  },

  // 打开发布弹窗
  onPublishTap: function () {
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '发布路线需要先登录',
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
    const canSubmit = publishForm.start.trim() && 
                      publishForm.end.trim() && 
                      publishForm.phone.trim() &&
                      (publishForm.type === 'once' ? publishForm.timeStr : publishForm.schedule.trim())
    this.setData({ canSubmit })
  },

  // 切换路线类型
  onTypeChange: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({ 'publishForm.type': type }, this.checkCanSubmit)
  },

  // 输入出发地
  onStartInput: function (e) {
    this.setData({ 'publishForm.start': e.detail.value }, this.checkCanSubmit)
  },

  // 输入目的地
  onEndInput: function (e) {
    this.setData({ 'publishForm.end': e.detail.value }, this.checkCanSubmit)
  },

  // 选择时间
  onTimeChange: function (e) {
    const index = e.detail.value
    const timeStr = this.data.timeRange[0][index[0]] + ' ' + 
                    this.data.timeRange[1][index[1]].replace('时', ':') + 
                    this.data.timeRange[2][index[2]].replace('分', '')
    this.setData({
      timeIndex: index,
      'publishForm.timeStr': timeStr
    }, this.checkCanSubmit)
  },

  // 输入行驶时间
  onScheduleInput: function (e) {
    this.setData({ 'publishForm.schedule': e.detail.value }, this.checkCanSubmit)
  },

  // 减少座位
  onSeatMinus: function () {
    const seats = this.data.publishForm.seats
    if (seats > 1) {
      this.setData({ 'publishForm.seats': seats - 1 })
    }
  },

  // 增加座位
  onSeatPlus: function () {
    const seats = this.data.publishForm.seats
    if (seats < 6) {
      this.setData({ 'publishForm.seats': seats + 1 })
    }
  },

  // 输入电话
  onPhoneInput: function (e) {
    this.setData({ 'publishForm.phone': e.detail.value }, this.checkCanSubmit)
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
          type: 'long',
          start: '',
          end: '',
          timeStr: '',
          schedule: '',
          seats: 3,
          phone: ''
        }
      })
      this.loadRoutes()
    } catch (err) {
      console.error('发布失败', err)
      util.showToast('发布失败')
    } finally {
      this.setData({ submitting: false })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '牛马专线 - 邻里拼车出行',
      path: '/pages/carpool/carpool'
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