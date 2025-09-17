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
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const skillsList = common_vendor.reactive([]);
    const filterList = common_vendor.reactive([]);
    let skillsCloudObj = null;
    const initCloudObj = () => {
      try {
        skillsCloudObj = common_vendor.nr.importObject("skills");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skills.vue:139", "初始化云对象失败:", error);
        common_vendor.index.showToast({
          title: "服务初始化失败",
          icon: "none"
        });
      }
    };
    const getCategories = async () => {
      try {
        const result = await skillsCloudObj.getCategories();
        if (result.errCode === 0) {
          filterList.splice(0, filterList.length, ...result.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skills.vue:155", "获取分类失败:", error);
      }
    };
    const getSkillsList = async (reset = false) => {
      if (isLoading.value)
        return;
      common_vendor.index.__f__("log", "at pages/skills/skills.vue:163", "开始获取技能列表, reset:", reset);
      try {
        isLoading.value = true;
        loadMoreStatus.value = "loading";
        if (reset) {
          currentPage.value = 1;
          hasMore.value = true;
        }
        const params = {
          keyword: searchKeyword.value.trim(),
          category: currentFilter.value,
          page: currentPage.value,
          pageSize: pageSize.value
        };
        common_vendor.index.__f__("log", "at pages/skills/skills.vue:181", "调用云对象参数:", params);
        common_vendor.index.__f__("log", "at pages/skills/skills.vue:182", "云对象实例状态:", skillsCloudObj ? "已初始化" : "未初始化");
        if (!skillsCloudObj) {
          common_vendor.index.__f__("error", "at pages/skills/skills.vue:185", "云对象未初始化");
          common_vendor.index.showToast({
            title: "服务未初始化，请重试",
            icon: "none"
          });
          return;
        }
        common_vendor.index.__f__("log", "at pages/skills/skills.vue:193", "准备调用云对象方法...");
        const result = await skillsCloudObj.getSkillsList(params);
        common_vendor.index.__f__("log", "at pages/skills/skills.vue:195", "云对象返回结果:", result);
        if (result && result.errCode === 0) {
          common_vendor.index.__f__("log", "at pages/skills/skills.vue:198", "获取成功，数据:", result.data);
          const { list, hasMore: moreData } = result.data;
          if (reset) {
            skillsList.splice(0, skillsList.length, ...list);
          } else {
            skillsList.push(...list);
          }
          hasMore.value = moreData;
          loadMoreStatus.value = hasMore.value ? "more" : "noMore";
          if (list.length > 0) {
            currentPage.value++;
          }
          common_vendor.index.__f__("log", "at pages/skills/skills.vue:214", "技能列表更新完成，当前列表长度:", skillsList.length);
        } else {
          common_vendor.index.__f__("error", "at pages/skills/skills.vue:216", "获取技能列表失败:", result);
          const errorMsg = (result == null ? void 0 : result.errMsg) || "获取技能列表失败";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none"
          });
          loadMoreStatus.value = "more";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skills.vue:225", "获取技能列表异常:", error);
        common_vendor.index.__f__("error", "at pages/skills/skills.vue:226", "异常详情:", error.message, error.stack);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
        loadMoreStatus.value = "more";
      } finally {
        isLoading.value = false;
        common_vendor.index.__f__("log", "at pages/skills/skills.vue:234", "获取技能列表流程结束");
      }
    };
    const searchSkills = async () => {
      if (!skillsCloudObj)
        return;
      try {
        isLoading.value = true;
        const params = {
          keyword: searchKeyword.value.trim(),
          category: currentFilter.value,
          page: 1,
          pageSize: pageSize.value
        };
        common_vendor.index.__f__("log", "at pages/skills/skills.vue:252", "搜索参数:", params);
        const result = await skillsCloudObj.searchSkills(searchKeyword.value.trim(), params);
        common_vendor.index.__f__("log", "at pages/skills/skills.vue:254", "搜索结果:", result);
        if (result && result.errCode === 0) {
          const { list, hasMore: moreData } = result.data;
          skillsList.splice(0, skillsList.length, ...list);
          hasMore.value = moreData;
          currentPage.value = 2;
          loadMoreStatus.value = hasMore.value ? "more" : "noMore";
        } else {
          common_vendor.index.__f__("error", "at pages/skills/skills.vue:263", "搜索失败:", result);
          const errorMsg = (result == null ? void 0 : result.errMsg) || "搜索失败";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skills.vue:271", "搜索异常:", error);
        common_vendor.index.showToast({
          title: "搜索失败，请重试",
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
      if (searchKeyword.value.trim()) {
        searchSkills();
      } else {
        getSkillsList(true);
      }
    };
    const selectFilter = (value) => {
      currentFilter.value = value;
      getSkillsList(true);
    };
    const formatTime = (dateStr) => {
      if (!dateStr)
        return "";
      const date = new Date(dateStr);
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
    };
    const previewImage = (urls, current) => {
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
    common_vendor.onMounted(() => {
      initCloudObj();
      if (skillsCloudObj) {
        getCategories();
        getSkillsList(true);
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
        g: common_vendor.f(filterList, (item, index, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: index,
            c: currentFilter.value === item.value ? 1 : "",
            d: common_vendor.o(($event) => selectFilter(item.value), index)
          };
        }),
        h: common_vendor.f(skillsList, (skill, index, i0) => {
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
            m: common_vendor.f(skill.tags, (tag, tagIndex, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIndex
              };
            }),
            n: "1c7c41d0-2-" + i0,
            o: common_vendor.t(skill.rating),
            p: common_vendor.t(skill.reviewCount),
            q: common_vendor.t(formatTime(skill.createTime)),
            r: skill._id,
            s: common_vendor.o(($event) => goToSkillDetail(skill), skill._id)
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
        k: skillsList.length === 0 && !isLoading.value
      }, skillsList.length === 0 && !isLoading.value ? {
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
