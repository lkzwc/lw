"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "skills",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const currentFilter = common_vendor.ref("all");
    const isLoading = common_vendor.ref(false);
    const loadMoreStatus = common_vendor.ref("more");
    const currentPage = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    const skillsList = common_vendor.ref([]);
    const filterList = common_vendor.ref([
      { label: "全部", value: "all" },
      { label: "家政服务", value: "housekeeping" },
      { label: "维修服务", value: "repair" },
      { label: "教育培训", value: "education" },
      { label: "美容美发", value: "beauty" },
      { label: "健康服务", value: "health" },
      { label: "其他", value: "other" }
    ]);
    let skillsCloudObj = null;
    const initCloudObj = () => {
      try {
        skillsCloudObj = common_vendor.nr.importObject("skills");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skills.vue:146", "技能云对象初始化失败:", error);
        common_vendor.index.showToast({
          title: "服务初始化失败",
          icon: "none"
        });
      }
    };
    const getSkillsList = async (reset = false) => {
      if (isLoading.value && !reset) {
        return;
      }
      if (!hasMore.value && !reset) {
        return;
      }
      if (!skillsCloudObj) {
        initCloudObj();
        if (!skillsCloudObj) {
          common_vendor.index.showToast({
            title: "服务不可用，请重试",
            icon: "none"
          });
          return;
        }
      }
      try {
        isLoading.value = true;
        if (reset) {
          currentPage.value = 1;
          skillsList.value = [];
          hasMore.value = true;
        }
        const params = {
          keyword: searchKeyword.value.trim(),
          category: currentFilter.value === "all" ? "" : currentFilter.value,
          page: currentPage.value,
          pageSize: 10
        };
        const result = await skillsCloudObj.getSkillsList(params);
        if (result && result.errCode === 0 && result.data) {
          const { list, hasMore: moreData } = result.data;
          if (reset) {
            skillsList.value = list || [];
          } else {
            skillsList.value.push(...list || []);
          }
          hasMore.value = moreData || false;
          currentPage.value++;
          if (skillsList.value.length === 0) {
            common_vendor.index.showToast({
              title: "暂无相关技能",
              icon: "none"
            });
          }
        } else {
          const errorMsg = (result == null ? void 0 : result.errMsg) || "获取技能列表失败";
          common_vendor.index.__f__("error", "at pages/skills/skills.vue:217", "获取技能列表失败:", result);
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skills.vue:226", "获取技能列表异常:", error);
        let errorMessage = "网络错误，请检查网络连接";
        if (error.message && error.message.includes("timeout")) {
          errorMessage = "请求超时，请重试";
        } else if (error.message && error.message.includes("uniCloud")) {
          errorMessage = "云服务连接失败，请重试";
        }
        common_vendor.index.showToast({
          title: errorMessage,
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const onSearchInput = (e) => {
      searchKeyword.value = e.detail.value;
    };
    const onSearch = () => {
      getSkillsList(true);
    };
    const selectFilter = (value) => {
      currentFilter.value = value;
      getSkillsList(true);
    };
    const formatTime = (dateStr) => {
      if (!dateStr)
        return "";
      try {
        let date;
        if (typeof dateStr === "object" && dateStr.$date) {
          date = new Date(dateStr.$date);
        } else if (dateStr instanceof Date) {
          date = dateStr;
        } else {
          date = new Date(dateStr);
        }
        const now = /* @__PURE__ */ new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
        if (days === 0) {
          return "今天";
        } else if (days === 1) {
          return "昨天";
        } else if (days < 7) {
          return `${days}天前`;
        } else {
          return date.toLocaleDateString();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skills.vue:290", "时间格式化错误:", error);
        return "";
      }
    };
    const previewImage = (urls, current) => {
      if (!urls || urls.length === 0)
        return;
      common_vendor.index.previewImage({
        urls,
        current
      });
    };
    const goToSkillDetail = (skill) => {
      common_vendor.index.navigateTo({
        url: `/pages/skills/skill-detail?id=${skill._id}`
      });
    };
    const goToAddSkill = () => {
      common_vendor.index.navigateTo({
        url: "/pages/skills/add-skill"
      });
    };
    common_vendor.onReachBottom(() => {
      if (hasMore.value && !isLoading.value) {
        getSkillsList(false);
      }
    });
    const initPage = async () => {
      initCloudObj();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await getSkillsList(true);
    };
    common_vendor.onMounted(() => {
      initPage();
    });
    common_vendor.onShow(() => {
      if (!skillsList.value || skillsList.value.length === 0) {
        initPage();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "18",
          color: "#999"
        }),
        b: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, onSearchInput]),
        c: common_vendor.o(onSearch),
        d: searchKeyword.value,
        e: searchKeyword.value
      }, searchKeyword.value ? {
        f: common_vendor.o(onSearch)
      } : {}, {
        g: common_vendor.f(filterList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: index,
            c: currentFilter.value === item.value ? 1 : "",
            d: common_vendor.o(($event) => selectFilter(item.value), index)
          };
        }),
        h: common_vendor.f(skillsList.value, (skill, index, i0) => {
          return common_vendor.e({
            a: skill.userAvatar || "/static/default-avatar.png",
            b: common_vendor.t(skill.username),
            c: "1c7c41d0-1-" + i0,
            d: common_vendor.t(skill.location),
            e: common_vendor.t(skill.price),
            f: common_vendor.t(skill.priceUnit),
            g: skill.images && skill.images.length > 0
          }, skill.images && skill.images.length > 0 ? common_vendor.e({
            h: common_vendor.f(skill.images.slice(0, 3), (img, imgIndex, i1) => {
              return {
                a: imgIndex,
                b: img,
                c: common_vendor.o(($event) => previewImage(skill.images, imgIndex), imgIndex)
              };
            }),
            i: skill.images.length > 3
          }, skill.images.length > 3 ? {
            j: common_vendor.t(skill.images.length - 3)
          } : {}) : {}, {
            k: common_vendor.t(skill.title),
            l: common_vendor.t(skill.description),
            m: skill.tags && skill.tags.length > 0
          }, skill.tags && skill.tags.length > 0 ? {
            n: common_vendor.f(skill.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            })
          } : {}, {
            o: "1c7c41d0-2-" + i0,
            p: common_vendor.t(skill.rating || 5),
            q: common_vendor.t(skill.reviewCount || 0),
            r: common_vendor.t(formatTime(skill.createTime)),
            s: skill._id || index,
            t: common_vendor.o(($event) => goToSkillDetail(skill), skill._id || index)
          });
        }),
        i: common_vendor.p({
          type: "location",
          size: "12",
          color: "#999"
        }),
        j: common_vendor.p({
          type: "star-filled",
          size: "14",
          color: "#FFD700"
        }),
        k: skillsList.value.length === 0 && !isLoading.value
      }, skillsList.value.length === 0 && !isLoading.value ? {
        l: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ccc"
        })
      } : {}, {
        m: isLoading.value
      }, isLoading.value ? {
        n: common_vendor.p({
          status: loadMoreStatus.value
        })
      } : {}, {
        o: common_vendor.p({
          type: "plus",
          size: "24",
          color: "white"
        }),
        p: common_vendor.o(goToAddSkill)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1c7c41d0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/skills/skills.js.map
