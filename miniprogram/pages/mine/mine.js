// pages/mine/mine.js - 我的页面
const app = getApp()
const util = require('../../utils/util')
const config = require('../../utils/config')
const api = require('../../utils/api')

const PHASE_LIST = config.phases
const BUILDING_MAP = config.phaseBuildings

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    isAdmin: false,
    stats: {
      postCount: 0,
      likeCount: 0,
      skillCount: 0,
      carpoolCount: 0
    },
    // 编辑弹窗
    showEditDialog: false,
    editForm: {
      avatarUrl: '',
      nickName: '',
      phase: '',
      building: ''
    },
    // 多列选择器数据
    phaseBuildingRange: [PHASE_LIST, BUILDING_MAP['一期']],
    phaseBuildingValue: [0, 0]
  },

  onLoad: function () {
    this.checkLoginStatus()
  },

  onShow: function () {
    this.checkLoginStatus()
    this.loadStats()

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  // 检查登录状态（支持云端异步恢复延迟刷新）
  checkLoginStatus: function () {
    const update = () => {
      this.setData({
        isLoggedIn: app.globalData.isLoggedIn,
        userInfo: app.globalData.userInfo,
        isAdmin: app.globalData.isAdmin
      })
      if (app.globalData.isLoggedIn) {
        this.loadStats()
      }
    }
    update()

    // 如果启动时没登录，等待云端异步恢复（app.js restoreFromCloud）
    if (!app.globalData.isLoggedIn) {
      setTimeout(() => {
        if (app.globalData.isLoggedIn !== this.data.isLoggedIn) {
          update()
        }
      }, 1500)
    }
  },

  // 加载统计数据
  loadStats: async function () {
    if (!app.globalData.isLoggedIn) return
    
    try {
      const openid = app.globalData.openid
      if (!openid) return

      const stats = await api.user.getMyStats(openid)
      this.setData({ stats })
    } catch (err) {
      console.error('加载统计失败', err)
    }
  },

  // 登录 - 纯云端方案，无需授权弹窗
  onLogin: async function () {
    wx.showLoading({ title: '进入中...' })

    try {
      // 获取 openid
      const openidRes = await wx.cloud.callFunction({ name: 'getOpenId' })
      const openid = openidRes.result.openid
      if (!openid) throw new Error('获取 openid 失败')

      const db = wx.cloud.database()
      const userRes = await db.collection('users')
        .where({ _openid: openid })
        .get()

      if (userRes.data.length > 0) {
        // 老用户：从云端恢复全部信息
        const u = userRes.data[0]
        app.globalData.userInfo = {
          nickName: u.nickName || '邻居',
          avatarUrl: u.avatarUrl || '',
          phase: u.phase || '',
          building: u.building || ''
        }
        app.globalData.isAdmin = !!u.isAdmin
      } else {
        // 新用户：创建基础记录
        const newUser = {
          nickName: '邻居',
          avatarUrl: '',
          phase: '',
          building: '',
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          _openid: openid
        }
        await db.collection('users').add({ data: newUser })
        app.globalData.userInfo = {
          nickName: '邻居',
          avatarUrl: '',
          phase: '',
          building: ''
        }
        app.globalData.isAdmin = false
      }

      app.globalData.openid = openid
      app.globalData.isLoggedIn = true
      wx.setStorageSync('userInfo', app.globalData.userInfo)
      wx.setStorageSync('openid', openid)
      app.checkAdminStatus(openid)

      wx.hideLoading()
      this.checkLoginStatus()
      this.loadStats()
    } catch (err) {
      wx.hideLoading()
      console.error('登录失败:', err)
      util.showToast('登录失败，请重试')
    }
  },

  // 打开编辑弹窗
  onEditTap: function () {
    const { userInfo } = this.data
    
    // 计算选择器的初始值
    let phaseIndex = 0
    let buildingIndex = 0
    
    if (userInfo && userInfo.phase) {
      phaseIndex = PHASE_LIST.indexOf(userInfo.phase)
      if (phaseIndex === -1) phaseIndex = 0
    }
    
    if (userInfo && userInfo.building) {
      const buildingList = BUILDING_MAP[PHASE_LIST[phaseIndex]] || BUILDING_MAP['一期']
      buildingIndex = buildingList.indexOf(userInfo.building)
      if (buildingIndex === -1) buildingIndex = 0
    }

    this.setData({
      showEditDialog: true,
      editForm: {
        avatarUrl: userInfo?.avatarUrl || '',
        nickName: userInfo?.nickName || '',
        phase: userInfo?.phase || '',
        building: userInfo?.building || ''
      },
      phaseBuildingRange: [PHASE_LIST, BUILDING_MAP[PHASE_LIST[phaseIndex]] || BUILDING_MAP['一期']],
      phaseBuildingValue: [phaseIndex, buildingIndex]
    })
  },

  // 关闭编辑弹窗
  onCloseEditDialog: function () {
    this.setData({ showEditDialog: false })
  },

  // 编辑头像
  onChooseAvatarEdit: function (e) {
    const { avatarUrl } = e.detail
    this.setData({
      'editForm.avatarUrl': avatarUrl
    })
  },

  // 编辑昵称
  onNickNameInput: function (e) {
    this.setData({
      'editForm.nickName': e.detail.value
    })
  },

  // 期数列变化时，联动更新楼号列
  onPhaseColumnChange: function (e) {
    const { column, value } = e.detail
    if (column !== 0) return  // 只有期数列变化才处理

    const phase = PHASE_LIST[value]
    const buildings = BUILDING_MAP[phase] || BUILDING_MAP['一期']

    this.setData({
      'phaseBuildingRange[1]': buildings,
      phaseBuildingValue: [value, 0]
    })
  },

  // 期数+楼号选择器 - 确认选择
  onPhaseBuildingChange: function (e) {
    const { value } = e.detail
    const phaseIndex = value[0]
    const buildingIndex = value[1]
    
    const phase = PHASE_LIST[phaseIndex]
    const buildingList = BUILDING_MAP[phase] || BUILDING_MAP['一期']
    const building = buildingList[buildingIndex]
    
    this.setData({
      'editForm.phase': phase,
      'editForm.building': building,
      phaseBuildingValue: value
    })
  },

  // 保存用户信息
  // 保存用户资料
  onSaveUserInfo: async function () {
    const { editForm } = this.data
    
    if (!editForm.nickName.trim()) {
      util.showToast('请输入昵称')
      return
    }
    
    wx.showLoading({ title: '保存中...' })
    
    try {
      const app = getApp()
      const db = wx.cloud.database()
      
      // 如果是新选择的头像（临时文件路径），上传到云存储获取永久链接
      let avatarUrl = editForm.avatarUrl
      if (avatarUrl && (avatarUrl.startsWith('http://tmp/') || avatarUrl.startsWith('wxfile://'))) {
        avatarUrl = await app.uploadAvatar(avatarUrl, app.globalData.openid)
      }
      
      // 获取当前用户
      const userRes = await db.collection('users')
        .where({ _openid: app.globalData.openid })
        .get()
      
      if (userRes.data.length > 0) {
        // 更新用户信息
        await db.collection('users').doc(userRes.data[0]._id).update({
          data: {
            nickName: editForm.nickName,
            avatarUrl,
            phase: editForm.phase,
            building: editForm.building,
            updateTime: db.serverDate()
          }
        })
        
        // 更新 globalData
        app.globalData.userInfo = {
          ...userRes.data[0],
          ...editForm,
          avatarUrl
        }
        // 更新本地存储
        wx.setStorageSync('userInfo', app.globalData.userInfo)
      } else {
        // 创建新用户
        await db.collection('users').add({
          data: {
            nickName: editForm.nickName,
            avatarUrl: avatarUrl || '/assets/icons/avatar.png',
            phase: editForm.phase,
            building: editForm.building,
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        })
        
        app.globalData.userInfo = editForm
      }
      
      this.setData({
        userInfo: app.globalData.userInfo,
        showEditDialog: false
      })
      
      wx.hideLoading()
      util.showToast('保存成功')
    } catch (err) {
      wx.hideLoading()
      console.error('保存失败:', err)
      util.showToast('保存失败，请重试')
    }
  },

  // 我的发布
  onMyPostsTap: function () {
    wx.navigateTo({
      url: '/pages/my-posts/my-posts'
    })
  },

  // 我的点赞
  onMyLikesTap: function () {
    wx.navigateTo({
      url: '/pages/my-likes/my-likes'
    })
  },

  // 我的技能
  onMySkillsTap: function () {
    wx.navigateTo({
      url: '/pages/my-posts/my-posts?type=skill'
    })
  },

  // 我的拼车
  onMyCarpoolsTap: function () {
    wx.navigateTo({
      url: '/pages/my-posts/my-posts?type=carpool',
      fail: function (err) {
        console.error('[mine] navigateTo failed:', err)
      }
    })
  },

  // 联系开发者
  onContactTap: function () {
    wx.showModal({
      title: '联系开发者',
      content: '如有问题或建议，欢迎联系',
      confirmText: '复制微信',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'linliquan_dev',
            success: () => {
              util.showToast('已复制')
            }
          })
        }
      }
    })
  },

  // 关于我们
  onAboutTap: function () {
    wx.showModal({
      title: '邻里圈',
      content: '版本：v1.0.0\n\n一款专注于社区邻里互助的小程序，让社区生活更美好。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 管理后台
  onAdminTap: function () {
    wx.navigateTo({
      url: '/pages/admin/admin'
    })
  },

  // 退出登录
  onLogout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      confirmColor: '#FF4D4F',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          
          this.checkLoginStatus()
          util.showToast('已退出登录')
        }
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '邻里圈 - 社区生活更美好',
      path: '/pages/index/index'
    }
  }
})
