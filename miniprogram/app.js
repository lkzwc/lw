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

    // 动态加载 iconfont 字体（解决真机 @font-face 本地路径不生效的问题）
    this.loadIconFont();

    // 检查登录状态
    this.checkLoginStatus();
  },

  // 加载 iconfont 字体（真机多策略降级）
  loadIconFont: function () {
    // 策略1：运行时读取包内字体文件 → base64（真机最可靠）
    this.loadFontFromLocal('woff2');
    
    // 策略2：包内 ttf 文件也尝试
    setTimeout(() => this.loadFontFromLocal('ttf'), 200);
    
    // 策略3：硬编码 base64 fallback
    setTimeout(() => {
      const b64 = 'data:application/x-font-woff2;charset=utf-8;base64,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';
      this.tryLoadFont(b64, '硬编码 base64');
    }, 500);
  },

  // 从包内读取字体文件并加载
  loadFontFromLocal: function (ext) {
    try {
      const fs = wx.getFileSystemManager();
      const b64 = fs.readFileSync('/assets/fonts/iconfont.' + ext, 'base64');
      if (b64 && b64.length > 100) {
        const mime = ext === 'ttf' ? 'font/ttf' : 'application/x-font-woff2';
        const dataUrl = 'data:' + mime + ';charset=utf-8;base64,' + b64;
        console.log('[iconfont] 运行时读取字体成功 (' + ext + ')', b64.length + ' bytes');
        this.tryLoadFont(dataUrl, '运行时 ' + ext);
      }
    } catch (e) {
      // 静默失败，等下一个策略
    }
  },

  // 执行 wx.loadFontFace
  tryLoadFont: function (source, label) {
    try {
      wx.loadFontFace({
        family: 'iconfont',
        source: 'url("' + source + '")',
        global: true,
        success: function (res) {
          console.log('[iconfont] ' + label + ' 加载成功', res.status);
        },
        fail: function () {
          console.warn('[iconfont] ' + label + ' 加载失败');
        }
      });
    } catch (e) {
      console.warn('[iconfont] ' + label + ' 异常', e);
    }
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
    const existRes = await db.collection('users').where({
      _openid: openid
    }).get()

    if (existRes.data.length === 0) {
      // 新用户
      await db.collection('users').add({
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
      const existing = existRes.data[0]
      await db.collection('users').doc(existing._id).update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl,
          updateTime: db.serverDate()
        }
      });

      if (existing.isAdmin) {
        this.globalData.isAdmin = true;
        wx.setStorageSync('isAdmin', true);
      }
    }

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
