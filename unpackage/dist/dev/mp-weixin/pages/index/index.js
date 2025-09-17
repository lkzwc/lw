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
    const weatherLoading = common_vendor.ref(true);
    const isGettingWeather = common_vendor.ref(false);
    const weatherData = common_vendor.reactive({
      city: "天气",
      weather: "晴",
      temperature: "25",
      winddirection: "东南",
      windpower: "≤3",
      humidity: "65"
    });
    let utilObj = null;
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
    const initCloudObj = () => {
      try {
        utilObj = common_vendor.nr.importObject("util");
      } catch (error) {
        common_vendor.index.showToast({
          title: "云对象初始化失败",
          icon: "none"
        });
      }
    };
    const getWeatherData = async () => {
      if (isGettingWeather.value) {
        return;
      }
      if (!utilObj) {
        weatherLoading.value = false;
        common_vendor.index.showToast({
          title: "云对象未初始化",
          icon: "none"
        });
        return;
      }
      try {
        isGettingWeather.value = true;
        weatherLoading.value = true;
        const result = await utilObj.getWeatherByCityName();
        if (result && result.errCode === 0 && result.data) {
          Object.assign(weatherData, {
            city: result.data.city,
            weather: result.data.weather,
            temperature: result.data.temperature,
            winddirection: result.data.winddirection,
            windpower: result.data.windpower,
            humidity: result.data.humidity
          });
          common_vendor.index.showToast({
            title: "天气数据加载成功",
            icon: "success",
            duration: 1500
          });
        } else {
          common_vendor.index.showToast({
            title: (result == null ? void 0 : result.errMsg) || "天气数据获取失败",
            icon: "none"
          });
        }
      } catch (error) {
        Object.assign(weatherData, {
          city: "西安市",
          weather: "晴",
          temperature: "22",
          winddirection: "东南",
          windpower: "≤3",
          humidity: "60"
        });
        common_vendor.index.showToast({
          title: "使用本地数据",
          icon: "none"
        });
      } finally {
        weatherLoading.value = false;
        isGettingWeather.value = false;
      }
    };
    const getWeatherIcon = (weather) => {
      const weatherIconMap = {
        "晴": "color",
        "晴天": "color",
        "多云": "cloud",
        "少云": "cloud",
        "阴": "cloud-filled",
        "阴天": "cloud-filled",
        "小雨": "cloud-drizzle",
        "中雨": "cloud-rain",
        "大雨": "cloud-rain-filled",
        "暴雨": "cloud-rain-filled",
        "雷阵雨": "cloud-lightning",
        "雷雨": "cloud-lightning",
        "雪": "cloud-snow",
        "小雪": "cloud-snow",
        "中雪": "cloud-snow",
        "大雪": "cloud-snow",
        "雾": "eye-slash",
        "霾": "eye-slash-filled",
        "沙尘暴": "eye-slash-filled",
        "浮尘": "eye-slash",
        "扬沙": "eye-slash"
      };
      return weatherIconMap[weather] || "cloud";
    };
    const change = (e) => {
      current.value = e.detail.current;
      swiperCurrent.value = e.detail.current;
    };
    const clickBannerItem = (item) => {
      common_vendor.index.showToast({
        title: item.title,
        icon: "none"
      });
    };
    const clickMenuItem = (item) => {
      switch (item.type) {
        case "news":
          common_vendor.index.navigateTo({
            url: "/pages/news/news"
          });
          break;
        case "weather":
          if (isGettingWeather.value) {
            common_vendor.index.showToast({
              title: "天气数据获取中...",
              icon: "loading"
            });
          } else {
            getWeatherData();
          }
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
      common_vendor.index.__f__("log", "at pages/index/index.vue:371", "首页加载完成");
      initCloudObj();
      setTimeout(() => {
        getWeatherData();
      }, 500);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
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
        h: weatherLoading.value
      }, weatherLoading.value ? {
        i: common_vendor.p({
          type: "spinner-cycle",
          size: 24,
          color: "white"
        })
      } : {
        j: common_vendor.p({
          type: getWeatherIcon(weatherData.weather),
          size: 36,
          color: "white"
        }),
        k: common_vendor.t(weatherData.temperature),
        l: common_vendor.t(weatherData.weather),
        m: common_vendor.p({
          type: "navigate",
          size: 14,
          color: "rgba(255,255,255,0.8)"
        }),
        n: common_vendor.t(weatherData.winddirection),
        o: common_vendor.t(weatherData.windpower),
        p: common_vendor.p({
          type: "water",
          size: 14,
          color: "rgba(255,255,255,0.8)"
        }),
        q: common_vendor.t(weatherData.humidity)
      }, {
        r: common_vendor.o(($event) => clickMenuItem(menuList[1])),
        s: common_vendor.f(menuList.slice(2, 6), (item, index, i0) => {
          return {
            a: "1cf27b2a-6-" + i0,
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
        t: common_vendor.p({
          type: menuList[6].icon,
          size: 28,
          color: "#333"
        }),
        v: common_vendor.t(menuList[6].name),
        w: common_vendor.o(($event) => clickMenuItem(menuList[6]))
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
