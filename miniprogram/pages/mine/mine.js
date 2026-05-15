// pages/mine/mine.js - 我的页面
const app = getApp()
const util = require('../../utils/util')

// 期数列表
const PHASE_LIST = ['一期', '二期', '三期', '四期']

// 各期对应的楼号列表
const BUILDING_MAP = {
  '一期': ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼'],
  '二期': ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼', '7号楼'],
  '三期': ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼', '7号楼', '8号楼'],
  '四期': ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼', '7号楼', '8号楼', '9号楼', '10号楼']
}

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
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  // 检查登录状态
  checkLoginStatus: function () {
    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo: app.globalData.userInfo,
      isAdmin: app.globalData.isAdmin
    })
  },

  // 加载统计数据
  loadStats: function () {
    if (!app.globalData.isLoggedIn) return

    // 模拟数据，后续接入云数据库
    this.setData({
      stats: {
        postCount: 5,
        likeCount: 12,
        skillCount: 2,
        carpoolCount: 3
      }
    })
  },

  // 登录
  onLogin: function () {
    wx.showLoading({ title: '登录中...' })
    
    // 模拟登录成功
    setTimeout(() => {
      app.globalData.isLoggedIn = true
      app.globalData.userInfo = {
        avatarUrl: '/assets/images/default-avatar.png',
        nickName: '新用户',
        phase: '',
        building: ''
      }
      
      wx.hideLoading()
      util.showToast('登录成功')
      
      this.checkLoginStatus()
      this.loadStats()
    }, 500)
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
  onSaveUserInfo: function () {
    const { editForm } = this.data
    
    if (!editForm.nickName.trim()) {
      util.showToast('请输入昵称')
      return
    }
    
    wx.showLoading({ title: '保存中...' })
    
    // 模拟保存
    setTimeout(() => {
      app.globalData.userInfo = {
        ...app.globalData.userInfo,
        ...editForm
      }
      
      this.setData({
        userInfo: app.globalData.userInfo,
        showEditDialog: false
      })
      
      wx.hideLoading()
      util.showToast('保存成功')
    }, 500)
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
    util.showToast('我的拼车功能开发中')
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
          app.globalData.isLoggedIn = false
          app.globalData.userInfo = null
          
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