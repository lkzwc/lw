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
    const filterList = common_vendor.reactive([
      { label: "全部", value: "all" },
      { label: "家政服务", value: "housekeeping" },
      { label: "维修安装", value: "repair" },
      { label: "教育培训", value: "education" },
      { label: "美容美发", value: "beauty" },
      { label: "健康护理", value: "health" },
      { label: "其他服务", value: "other" }
    ]);
    const skillsList = common_vendor.reactive([
      {
        id: 1,
        username: "张师傅",
        userAvatar: "https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=张",
        location: "1号楼301",
        price: 50,
        priceUnit: "小时",
        title: "专业家电维修",
        description: "10年维修经验，擅长各种家电故障排除，价格公道，服务周到",
        tags: ["家电维修", "经验丰富", "价格实惠"],
        images: [
          "https://via.placeholder.com/200x150/FF6B6B/FFFFFF?text=维修1",
          "https://via.placeholder.com/200x150/4ECDC4/FFFFFF?text=维修2",
          "https://via.placeholder.com/200x150/45B7D1/FFFFFF?text=维修3"
        ],
        rating: 4.8,
        reviewCount: 23,
        createTime: /* @__PURE__ */ new Date("2024-01-15"),
        category: "repair"
      },
      {
        id: 2,
        username: "李阿姨",
        userAvatar: "https://via.placeholder.com/80x80/FF6B6B/FFFFFF?text=李",
        location: "2号楼205",
        price: 30,
        priceUnit: "小时",
        title: "专业家政清洁",
        description: "提供家庭清洁、整理收纳服务，细致认真，让您的家焕然一新",
        tags: ["家政清洁", "整理收纳", "细致认真"],
        images: [
          "https://via.placeholder.com/200x150/96CEB4/FFFFFF?text=清洁1",
          "https://via.placeholder.com/200x150/FFEAA7/FFFFFF?text=清洁2"
        ],
        rating: 4.9,
        reviewCount: 45,
        createTime: /* @__PURE__ */ new Date("2024-01-20"),
        category: "housekeeping"
      },
      {
        id: 3,
        username: "王老师",
        userAvatar: "https://via.placeholder.com/80x80/A8E6CF/FFFFFF?text=王",
        location: "3号楼102",
        price: 80,
        priceUnit: "课时",
        title: "小学数学辅导",
        description: "退休小学教师，30年教学经验，擅长小学数学辅导，因材施教",
        tags: ["数学辅导", "经验丰富", "因材施教"],
        images: [
          "https://via.placeholder.com/200x150/DDA0DD/FFFFFF?text=教学1"
        ],
        rating: 4.7,
        reviewCount: 18,
        createTime: /* @__PURE__ */ new Date("2024-01-25"),
        category: "education"
      },
      {
        id: 4,
        username: "小美",
        userAvatar: "https://via.placeholder.com/80x80/FFB6C1/FFFFFF?text=美",
        location: "4号楼508",
        price: 60,
        priceUnit: "次",
        title: "上门美甲服务",
        description: "专业美甲师，提供上门美甲服务，款式新颖，技术精湛",
        tags: ["美甲服务", "上门服务", "款式新颖"],
        images: [
          "https://via.placeholder.com/200x150/FF69B4/FFFFFF?text=美甲1",
          "https://via.placeholder.com/200x150/DA70D6/FFFFFF?text=美甲2",
          "https://via.placeholder.com/200x150/BA55D3/FFFFFF?text=美甲3",
          "https://via.placeholder.com/200x150/9370DB/FFFFFF?text=美甲4"
        ],
        rating: 4.6,
        reviewCount: 32,
        createTime: /* @__PURE__ */ new Date("2024-02-01"),
        category: "beauty"
      }
    ]);
    const filteredSkills = common_vendor.computed(() => {
      let result = skillsList;
      if (currentFilter.value !== "all") {
        result = result.filter((skill) => skill.category === currentFilter.value);
      }
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(
          (skill) => skill.title.toLowerCase().includes(keyword) || skill.description.toLowerCase().includes(keyword) || skill.username.toLowerCase().includes(keyword) || skill.location.toLowerCase().includes(keyword) || skill.tags.some((tag) => tag.toLowerCase().includes(keyword))
        );
      }
      return result;
    });
    const onSearchInput = (e) => {
      searchKeyword.value = e.detail.value;
    };
    const onSearch = () => {
      common_vendor.index.__f__("log", "at pages/skills/skills.vue:244", "搜索关键词:", searchKeyword.value);
    };
    const selectFilter = (value) => {
      currentFilter.value = value;
    };
    const formatTime = (date) => {
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
    const previewImage = (images, current) => {
      common_vendor.index.previewImage({
        urls: images,
        current
      });
    };
    const goToSkillDetail = (skill) => {
      common_vendor.index.navigateTo({
        url: `/pages/skills/skill-detail?id=${skill.id}`
      });
    };
    const goToAddSkill = () => {
      common_vendor.index.navigateTo({
        url: "/pages/skills/add-skill"
      });
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/skills/skills.vue:293", "技能台页面加载完成");
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
        h: common_vendor.f(filteredSkills.value, (skill, index, i0) => {
          return common_vendor.e({
            a: skill.userAvatar,
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
            r: skill.id,
            s: common_vendor.o(($event) => goToSkillDetail(skill), skill.id)
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
        k: filteredSkills.value.length === 0 && !isLoading.value
      }, filteredSkills.value.length === 0 && !isLoading.value ? {
        l: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ccc"
        })
      } : {}, {
        m: isLoading.value
      }, isLoading.value ? {
        n: common_vendor.p({
          status: "loading"
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
