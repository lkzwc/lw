"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_swiper_dot2 = common_vendor.resolveComponent("uni-swiper-dot");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_swiper_dot2 + _easycom_uni_icons2)();
}
const _easycom_uni_swiper_dot = () => "../../uni_modules/uni-swiper-dot/components/uni-swiper-dot/uni-swiper-dot.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_swiper_dot + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const current = common_vendor.ref(0);
    const swiperCurrent = common_vendor.ref(0);
    const bannerList = common_vendor.reactive([
      {
        image: "https://via.placeholder.com/750x300/667eea/FFFFFF?text=欢迎使用hxzyL",
        title: "欢迎使用hxzyL",
        content: "发现更多精彩内容"
      },
      {
        image: "https://via.placeholder.com/750x300/764ba2/FFFFFF?text=社区互动",
        title: "社区互动",
        content: "与朋友分享生活点滴"
      },
      {
        image: "https://via.placeholder.com/750x300/f093fb/FFFFFF?text=技能提升",
        title: "技能提升",
        content: "学习新技能，提升自己"
      }
    ]);
    const menuList = common_vendor.reactive([
      {
        name: "每日热榜",
        icon: "star",
        color: "#667eea",
        type: "news"
      },
      {
        name: "天气",
        icon: "cloud",
        color: "#764ba2",
        type: "weather"
      },
      {
        name: "随手拍",
        icon: "camera",
        color: "#4facfe",
        type: "tools"
      },
      {
        name: "技能台",
        icon: "gear",
        color: "#43e97b",
        type: "skills"
      },
      {
        name: "健康",
        icon: "heart",
        color: "#fa709a",
        type: "health"
      },
      {
        name: "购物",
        icon: "cart",
        color: "#ffeaa7",
        type: "shopping"
      },
      {
        name: "学习",
        icon: "book",
        color: "#ffecd2",
        type: "study"
      }
    ]);
    const change = (e) => {
      current.value = e.detail.current;
      swiperCurrent.value = e.detail.current;
    };
    const clickBannerItem = (item) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:168", "点击轮播图:", item);
      common_vendor.index.showToast({
        title: item.title,
        icon: "none"
      });
    };
    const clickMenuItem = (item) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:177", "点击菜单:", item);
      switch (item.type) {
        case "news":
          common_vendor.index.showToast({
            title: "每日热榜功能开发中",
            icon: "none"
          });
          break;
        case "weather":
          common_vendor.index.showToast({
            title: "天气功能开发中",
            icon: "none"
          });
          break;
        case "tools":
          common_vendor.index.navigateTo({
            url: "/pages/camera/camera"
          });
          break;
        case "skills":
          common_vendor.index.navigateTo({
            url: "/pages/skills/skills"
          });
          break;
        case "health":
          common_vendor.index.showToast({
            title: "健康功能开发中",
            icon: "none"
          });
          break;
        case "shopping":
          common_vendor.index.showToast({
            title: "购物功能开发中",
            icon: "none"
          });
          break;
        case "study":
          common_vendor.index.showToast({
            title: "学习功能开发中",
            icon: "none"
          });
          break;
        default:
          common_vendor.index.showToast({
            title: `${item.name}功能开发中`,
            icon: "none"
          });
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:228", "首页加载完成");
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(bannerList, (item, index, i0) => {
          return {
            a: item.image,
            b: common_vendor.t(item.title),
            c: common_vendor.o(($event) => clickBannerItem(item), index),
            d: index
          };
        }),
        b: common_vendor.o(change),
        c: swiperCurrent.value,
        d: common_vendor.p({
          info: bannerList,
          current: current.value,
          field: "content",
          mode: "round"
        }),
        e: common_vendor.p({
          type: menuList[0].icon,
          size: 40,
          color: "white"
        }),
        f: common_vendor.t(menuList[0].name),
        g: common_vendor.o(($event) => clickMenuItem(menuList[0])),
        h: common_vendor.p({
          type: menuList[1].icon,
          size: 32,
          color: "white"
        }),
        i: common_vendor.t(menuList[1].name),
        j: common_vendor.o(($event) => clickMenuItem(menuList[1])),
        k: common_vendor.f(menuList.slice(2, 6), (item, index, i0) => {
          return {
            a: "1cf27b2a-3-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: 24,
              color: "white"
            }),
            c: common_vendor.t(item.name),
            d: index,
            e: common_vendor.o(($event) => clickMenuItem(item), index),
            f: common_vendor.n("card-" + (index + 1))
          };
        }),
        l: common_vendor.p({
          type: menuList[6].icon,
          size: 28,
          color: "#333"
        }),
        m: common_vendor.t(menuList[6].name),
        n: common_vendor.o(($event) => clickMenuItem(menuList[6]))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
