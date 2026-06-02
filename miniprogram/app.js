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
    // this.loadFontFromLocal('woff2');
    
    // 策略2：包内 ttf 文件也尝试
    // setTimeout(() => this.loadFontFromLocal('ttf'), 200);
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

  // 检查登录状态（本地 + 云端双重恢复）
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    
    if (userInfo && openid) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = openid;
      this.globalData.isLoggedIn = true;
      this.checkAdminStatus(openid);
      return;
    }

    // 本地缓存为空，尝试从云端恢复
    this.restoreFromCloud();
  },

  // 从云数据库恢复用户信息
  restoreFromCloud: async function () {
    try {
      const openidRes = await wx.cloud.callFunction({ name: 'getOpenId' });
      const openid = openidRes.result.openid;
      if (!openid) return;

      const db = wx.cloud.database();
      const userRes = await db.collection('users')
        .where({ _openid: openid })
        .field({ nickName: true, avatarUrl: true, phase: true, building: true })
        .get();

      if (userRes.data.length > 0) {
        const u = userRes.data[0];
        const userInfo = {
          nickName: u.nickName || '邻居',
          avatarUrl: u.avatarUrl || '',
          phase: u.phase || '',
          building: u.building || ''
        };
        this.globalData.userInfo = userInfo;
        this.globalData.openid = openid;
        this.globalData.isLoggedIn = true;
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('openid', openid);
        this.checkAdminStatus(openid);
      }
    } catch (err) {
      console.warn('云端恢复登录失败', err);
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
      // 已经是云存储 fileID，无需再上传
      if (avatarUrl && avatarUrl.startsWith('cloud://')) {
        resolve(avatarUrl)
        return
      }

      // 本地临时文件（chooseAvatar 返回），直接上传
      if (avatarUrl && (avatarUrl.startsWith('wxfile://') || avatarUrl.startsWith('http://tmp/'))) {
        const cloudPath = `avatars/${openid}.jpg`
        wx.cloud.uploadFile({
          cloudPath,
          filePath: avatarUrl,
          success: (uploadRes) => resolve(uploadRes.fileID),
          fail: () => resolve('')
        })
        return
      }

      // 微信头像 URL（http/https），先下载再上传
      if (avatarUrl && avatarUrl.startsWith('http')) {
        wx.downloadFile({
          url: avatarUrl,
          success: (downloadRes) => {
            if (downloadRes.statusCode !== 200) {
              resolve('')
              return
            }
            const cloudPath = `avatars/${openid}.jpg`
            wx.cloud.uploadFile({
              cloudPath,
              filePath: downloadRes.tempFilePath,
              success: (uploadRes) => resolve(uploadRes.fileID),
              fail: () => resolve('')
            })
          },
          fail: () => resolve('')
        })
        return
      }

      // 未知来源，返回空
      resolve('')
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
