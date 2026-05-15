// app.js
App({
  globalData: {
    env: "home-d1g4f2kcnf409bde5", // 云开发环境ID
    userInfo: null,
    isLoggedIn: false,
    openid: null,
    isAdmin: false
  },

  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    
    // 检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    
    if (userInfo && openid) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = openid;
      this.globalData.isLoggedIn = true;
      
      // 检查是否是管理员
      this.checkAdminStatus(openid);
    }
  },

  // 检查管理员状态
  checkAdminStatus: function (openid) {
    // 只有指定的 openid 才是管理员
    const adminOpenId = 'onv5k3UOPWVZb5YVlKP3QqLHaLJc';
    if (openid === adminOpenId) {
      this.globalData.isAdmin = true;
      wx.setStorageSync('isAdmin', true);
    }
  },

  // 用户登录
  login: function () {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const userInfo = res.userInfo;
          
          // 获取openid
          wx.cloud.callFunction({
            name: 'getOpenId',
            success: (openidRes) => {
              const openid = openidRes.result.openid;
              
              // 保存用户信息
              this.saveUserInfo(userInfo, openid);
              
              this.globalData.userInfo = userInfo;
              this.globalData.openid = openid;
              this.globalData.isLoggedIn = true;
              
              wx.setStorageSync('userInfo', userInfo);
              wx.setStorageSync('openid', openid);
              
              resolve(userInfo);
            },
            fail: (err) => {
              reject(err);
            }
          });
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 保存用户信息到数据库
  saveUserInfo: function (userInfo, openid) {
    const db = wx.cloud.database();

    // 检查用户是否已存在
    db.collection('users').where({
      _openid: openid
    }).get().then(res => {
      if (res.data.length === 0) {
        // 新用户
        db.collection('users').add({
          data: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            isAdmin: false,
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        });
      } else {
        // 更新用户信息
        db.collection('users').doc(res.data[0]._id).update({
          data: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            updateTime: db.serverDate()
          }
        });

        if (res.data[0].isAdmin) {
          this.globalData.isAdmin = true;
          wx.setStorageSync('isAdmin', true);
        }
      }
    });

    // 检查管理员状态
    this.checkAdminStatus(openid);
  },

  // 退出登录
  logout: function () {
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    this.globalData.isLoggedIn = false;
    this.globalData.isAdmin = false;
    
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('openid');
    wx.removeStorageSync('isAdmin');
  }
});
