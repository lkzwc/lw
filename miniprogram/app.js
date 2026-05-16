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
            success: async (openidRes) => {
              const openid = openidRes.result.openid;
              
              // 保存用户信息（内部会上传头像到云存储）
              await this.saveUserInfo(userInfo, openid);

              // 用云存储头像更新 globalData 和本地缓存
              const db = wx.cloud.database()
              const userRes = await db.collection('users').where({ _openid: openid }).field({ avatarUrl: true, nickName: true }).get()
              const savedAvatarUrl = (userRes.data.length > 0 && userRes.data[0].avatarUrl) ? userRes.data[0].avatarUrl : userInfo.avatarUrl
              const finalUserInfo = { ...userInfo, avatarUrl: savedAvatarUrl }

              this.globalData.userInfo = finalUserInfo;
              this.globalData.openid = openid;
              this.globalData.isLoggedIn = true;
              
              wx.setStorageSync('userInfo', finalUserInfo);
              wx.setStorageSync('openid', openid);
              
              resolve(finalUserInfo);
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

  // 上传头像到云存储，返回永久 fileID
  uploadAvatar: function (avatarUrl, openid) {
    return new Promise((resolve) => {
      // 先下载微信头像到本地临时文件
      wx.downloadFile({
        url: avatarUrl,
        success: (downloadRes) => {
          if (downloadRes.statusCode !== 200) {
            resolve(avatarUrl) // 下载失败，回退用原 URL
            return
          }
          const cloudPath = `avatars/${openid}.jpg`
          wx.cloud.uploadFile({
            cloudPath,
            filePath: downloadRes.tempFilePath,
            success: (uploadRes) => resolve(uploadRes.fileID),
            fail: () => resolve(avatarUrl) // 上传失败，回退用原 URL
          })
        },
        fail: () => resolve(avatarUrl) // 下载失败，回退用原 URL
      })
    })
  },

  // 保存用户信息到数据库
  saveUserInfo: async function (userInfo, openid) {
    const db = wx.cloud.database();

    // 将头像上传到云存储，获取永久链接
    const avatarUrl = await this.uploadAvatar(userInfo.avatarUrl, openid)

    // 检查用户是否已存在
    db.collection('users').where({
      _openid: openid
    }).get().then(res => {
      if (res.data.length === 0) {
        // 新用户
        db.collection('users').add({
          data: {
            nickName: userInfo.nickName,
            avatarUrl,
            isAdmin: false,
            createTime: db.serverDate(),
            updateTime: db.serverDate()
          }
        });
      } else {
        // 更新用户信息（头像每次登录都刷新，确保最新）
        db.collection('users').doc(res.data[0]._id).update({
          data: {
            nickName: userInfo.nickName,
            avatarUrl,
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
