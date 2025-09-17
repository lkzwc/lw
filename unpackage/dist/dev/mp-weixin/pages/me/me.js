"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "me",
  setup(__props) {
    const loginPopup = common_vendor.ref(null);
    const avatarPopup = common_vendor.ref(null);
    const isLogging = common_vendor.ref(false);
    const appVersion = common_vendor.ref("1.0.0");
    const userInfo = common_vendor.reactive({
      isLogin: false,
      nickname: "",
      avatar: "https://via.placeholder.com/120x120/999/FFFFFF?text=未登录",
      signature: "",
      postCount: 0,
      followCount: 0,
      fanCount: 0,
      openid: ""
    });
    const handleLogin = () => {
      if (userInfo.isLogin) {
        return;
      }
      loginPopup.value.open();
    };
    const wechatLogin = async () => {
      if (isLogging.value) {
        return;
      }
      isLogging.value = true;
      try {
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        common_vendor.index.__f__("log", "at pages/me/me.vue:225", "微信登录结果:", loginRes);
        const login = common_vendor.nr.importObject("Login");
        const openid = await login.getUniID(loginRes.code);
        common_vendor.index.__f__("log", "at pages/me/me.vue:231", "获取到openid:", openid);
        const userProfile = await new Promise((resolve, reject) => {
          common_vendor.index.getUserProfile({
            desc: "用于完善用户资料",
            success: resolve,
            fail: reject
          });
        });
        common_vendor.index.__f__("log", "at pages/me/me.vue:242", "用户信息:", userProfile);
        userInfo.isLogin = true;
        userInfo.nickname = userProfile.userInfo.nickName;
        userInfo.avatar = userProfile.userInfo.avatarUrl;
        userInfo.openid = openid;
        userInfo.signature = "新用户，请多关照";
        userInfo.postCount = Math.floor(Math.random() * 10);
        userInfo.followCount = Math.floor(Math.random() * 50);
        userInfo.fanCount = Math.floor(Math.random() * 30);
        common_vendor.index.setStorageSync("userInfo", userInfo);
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        closeLogin();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/me/me.vue:265", "登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败",
          icon: "none"
        });
      } finally {
        isLogging.value = false;
      }
    };
    const closeLogin = () => {
      loginPopup.value.close();
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            userInfo.isLogin = false;
            userInfo.nickname = "";
            userInfo.avatar = "https://via.placeholder.com/120x120/999/FFFFFF?text=未登录";
            userInfo.signature = "";
            userInfo.postCount = 0;
            userInfo.followCount = 0;
            userInfo.fanCount = 0;
            userInfo.openid = "";
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
          }
        }
      });
    };
    const changeAvatar = () => {
      if (!userInfo.isLogin) {
        handleLogin();
        return;
      }
      avatarPopup.value.open();
    };
    const chooseAvatar = (type) => {
      const sourceType = type === "camera" ? ["camera"] : ["album"];
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType,
        success: (res) => {
          userInfo.avatar = res.tempFilePaths[0];
          common_vendor.index.showToast({
            title: "头像更新成功",
            icon: "success"
          });
          closeAvatarModal();
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/me/me.vue:336", "选择头像失败:", err);
          common_vendor.index.showToast({
            title: "选择头像失败",
            icon: "none"
          });
        }
      });
    };
    const closeAvatarModal = () => {
      avatarPopup.value.close();
    };
    const goToMyPosts = () => {
      if (!userInfo.isLogin) {
        handleLogin();
        return;
      }
      common_vendor.index.showToast({
        title: "我的帖子功能开发中",
        icon: "none"
      });
    };
    const goToMyLikes = () => {
      if (!userInfo.isLogin) {
        handleLogin();
        return;
      }
      common_vendor.index.showToast({
        title: "我的点赞功能开发中",
        icon: "none"
      });
    };
    const goToMyComments = () => {
      if (!userInfo.isLogin) {
        handleLogin();
        return;
      }
      common_vendor.index.showToast({
        title: "我的评论功能开发中",
        icon: "none"
      });
    };
    const goToMyCollections = () => {
      if (!userInfo.isLogin) {
        handleLogin();
        return;
      }
      common_vendor.index.showToast({
        title: "我的收藏功能开发中",
        icon: "none"
      });
    };
    const goToSettings = () => {
      common_vendor.index.showToast({
        title: "设置功能开发中",
        icon: "none"
      });
    };
    const goToHelp = () => {
      common_vendor.index.showToast({
        title: "帮助与反馈功能开发中",
        icon: "none"
      });
    };
    const goToAbout = () => {
      common_vendor.index.showToast({
        title: "关于我们功能开发中",
        icon: "none"
      });
    };
    const goToPrivacy = () => {
      common_vendor.index.showToast({
        title: "隐私政策功能开发中",
        icon: "none"
      });
    };
    const goToTerms = () => {
      common_vendor.index.showToast({
        title: "用户协议功能开发中",
        icon: "none"
      });
    };
    const loadUserInfo = () => {
      try {
        const savedUserInfo = common_vendor.index.getStorageSync("userInfo");
        if (savedUserInfo && savedUserInfo.isLogin) {
          Object.assign(userInfo, savedUserInfo);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/me/me.vue:446", "加载用户信息失败:", e);
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/me/me.vue:451", "我的页面加载完成");
      loadUserInfo();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.avatar,
        b: common_vendor.o(changeAvatar),
        c: common_vendor.t(userInfo.nickname || "点击登录"),
        d: common_vendor.t(userInfo.signature || "这个人很懒，什么都没留下"),
        e: common_vendor.t(userInfo.postCount || 0),
        f: common_vendor.t(userInfo.followCount || 0),
        g: common_vendor.t(userInfo.fanCount || 0),
        h: !userInfo.isLogin
      }, !userInfo.isLogin ? {
        i: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        j: common_vendor.o(handleLogin)
      } : {}, {
        k: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#4A90E2"
        }),
        l: common_vendor.o(goToMyPosts),
        m: common_vendor.p({
          type: "heart",
          size: "20",
          color: "#FF6B6B"
        }),
        n: common_vendor.o(goToMyLikes),
        o: common_vendor.p({
          type: "chatbubble",
          size: "20",
          color: "#50C878"
        }),
        p: common_vendor.o(goToMyComments),
        q: common_vendor.p({
          type: "star",
          size: "20",
          color: "#FFD700"
        }),
        r: common_vendor.o(goToMyCollections),
        s: common_vendor.p({
          type: "gear",
          size: "20",
          color: "#666"
        }),
        t: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        v: common_vendor.o(goToSettings),
        w: common_vendor.p({
          type: "help",
          size: "20",
          color: "#666"
        }),
        x: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        y: common_vendor.o(goToHelp),
        z: common_vendor.p({
          type: "info",
          size: "20",
          color: "#666"
        }),
        A: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        B: common_vendor.o(goToAbout),
        C: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#666"
        }),
        D: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        E: common_vendor.o(goToPrivacy),
        F: common_vendor.p({
          type: "paperplane",
          size: "20",
          color: "#666"
        }),
        G: common_vendor.p({
          type: "right",
          size: "14",
          color: "#c0c4cc"
        }),
        H: common_vendor.o(goToTerms),
        I: userInfo.isLogin
      }, userInfo.isLogin ? {
        J: common_vendor.p({
          type: "loop",
          size: "20",
          color: "#ff4757"
        }),
        K: common_vendor.o(handleLogout)
      } : {}, {
        L: common_vendor.t(appVersion.value),
        M: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        N: common_vendor.o(closeLogin),
        O: common_vendor.p({
          type: "weixin",
          size: "20",
          color: "white"
        }),
        P: common_vendor.o(wechatLogin),
        Q: isLogging.value,
        R: common_vendor.sr(loginPopup, "19c123a7-16", {
          "k": "loginPopup"
        }),
        S: common_vendor.p({
          type: "center",
          ["mask-click"]: false
        }),
        T: common_vendor.p({
          type: "camera",
          size: "24",
          color: "#4A90E2"
        }),
        U: common_vendor.o(($event) => chooseAvatar("camera")),
        V: common_vendor.p({
          type: "image",
          size: "24",
          color: "#50C878"
        }),
        W: common_vendor.o(($event) => chooseAvatar("album")),
        X: common_vendor.o(closeAvatarModal),
        Y: common_vendor.sr(avatarPopup, "19c123a7-19", {
          "k": "avatarPopup"
        }),
        Z: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-19c123a7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/me/me.js.map
