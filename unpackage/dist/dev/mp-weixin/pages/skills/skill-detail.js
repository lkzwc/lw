"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_load_more2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_load_more + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "skill-detail",
  setup(__props) {
    const contactPopup = common_vendor.ref(null);
    const isCollected = common_vendor.ref(false);
    const isLoading = common_vendor.ref(true);
    const skillId = common_vendor.ref("");
    const skillDetail = common_vendor.reactive({});
    const relatedSkills = common_vendor.reactive([]);
    let skillsCloudObj = null;
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:167", "页面加载参数:", options);
      if (options && options.id) {
        skillId.value = options.id;
        common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:170", "获取到技能ID:", skillId.value);
      } else {
        common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:172", "未获取到技能ID参数");
      }
    });
    const initCloudObj = () => {
      try {
        skillsCloudObj = common_vendor.nr.importObject("skills");
        common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:180", "云对象初始化成功");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:182", "初始化云对象失败:", error);
        common_vendor.index.showToast({
          title: "服务初始化失败",
          icon: "none"
        });
      }
    };
    const loadSkillDetail = async () => {
      common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:192", "开始加载技能详情, skillId:", skillId.value);
      if (!skillId.value) {
        common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:195", "技能ID为空，无法加载详情");
        common_vendor.index.showToast({
          title: "技能ID不能为空",
          icon: "none"
        });
        isLoading.value = false;
        return;
      }
      if (!skillsCloudObj) {
        common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:205", "云对象未初始化");
        common_vendor.index.showToast({
          title: "服务未初始化",
          icon: "none"
        });
        isLoading.value = false;
        return;
      }
      try {
        isLoading.value = true;
        common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:216", "调用云对象获取技能详情...");
        const result = await skillsCloudObj.getSkillDetail(skillId.value);
        common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:219", "云对象返回结果:", result);
        if (result && result.errCode === 0) {
          common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:222", "获取技能详情成功:", result.data);
          Object.keys(skillDetail).forEach((key) => {
            delete skillDetail[key];
          });
          Object.assign(skillDetail, result.data);
          loadRelatedSkills();
        } else {
          common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:232", "获取技能详情失败:", result);
          const errorMsg = (result == null ? void 0 : result.errMsg) || "获取技能详情失败";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:240", "获取技能详情异常:", error);
        common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:241", "异常详情:", error.message, error.stack);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:248", "技能详情加载流程结束");
      }
    };
    const loadRelatedSkills = async () => {
      if (!skillsCloudObj || !skillDetail.category) {
        common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:255", "跳过相关技能加载，云对象或分类信息缺失");
        return;
      }
      try {
        common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:260", "开始加载相关技能推荐...");
        const result = await skillsCloudObj.getSkillsList({
          category: skillDetail.category,
          page: 1,
          pageSize: 5
        });
        if (result && result.errCode === 0) {
          const filteredSkills = result.data.list.filter((skill) => skill._id !== skillId.value);
          relatedSkills.splice(0, relatedSkills.length, ...filteredSkills.slice(0, 4));
          common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:271", "相关技能加载成功，数量:", relatedSkills.length);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:274", "获取相关技能失败:", error);
      }
    };
    const formatDate = (dateStr) => {
      if (!dateStr)
        return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    };
    const previewImage = (current) => {
      if (!skillDetail.images || skillDetail.images.length === 0)
        return;
      common_vendor.index.previewImage({
        urls: skillDetail.images,
        current
      });
    };
    const showContactModal = () => {
      var _a;
      if (!skillDetail.phone && !skillDetail.wechat) {
        common_vendor.index.showToast({
          title: "暂无联系方式",
          icon: "none"
        });
        return;
      }
      (_a = contactPopup.value) == null ? void 0 : _a.open();
    };
    const closeContactModal = () => {
      var _a;
      (_a = contactPopup.value) == null ? void 0 : _a.close();
    };
    const makePhoneCall = () => {
      if (!skillDetail.phone)
        return;
      common_vendor.index.makePhoneCall({
        phoneNumber: skillDetail.phone,
        success: () => {
          closeContactModal();
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:323", "拨打电话失败:", error);
          common_vendor.index.showToast({
            title: "拨打电话失败",
            icon: "none"
          });
        }
      });
    };
    const copyWechat = () => {
      if (!skillDetail.wechat)
        return;
      common_vendor.index.setClipboardData({
        data: skillDetail.wechat,
        success: () => {
          common_vendor.index.showToast({
            title: "微信号已复制",
            icon: "success"
          });
          closeContactModal();
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:346", "复制微信号失败:", error);
          common_vendor.index.showToast({
            title: "复制失败",
            icon: "none"
          });
        }
      });
    };
    const toggleCollect = async () => {
      if (!skillsCloudObj) {
        common_vendor.index.showToast({
          title: "服务未初始化",
          icon: "none"
        });
        return;
      }
      try {
        if (isCollected.value) {
          const result = await skillsCloudObj.uncollectSkill(skillId.value);
          if (result.errCode === 0) {
            isCollected.value = false;
            common_vendor.index.showToast({
              title: "已取消收藏",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: result.errMsg || "取消收藏失败",
              icon: "none"
            });
          }
        } else {
          const result = await skillsCloudObj.collectSkill(skillId.value);
          if (result.errCode === 0) {
            isCollected.value = true;
            common_vendor.index.showToast({
              title: "已收藏",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: result.errMsg || "收藏失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:398", "收藏操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      }
    };
    const shareSkill = () => {
      common_vendor.index.share({
        provider: "weixin",
        scene: "WXSceneSession",
        type: 0,
        href: `pages/skills/skill-detail?id=${skillId.value}`,
        title: skillDetail.title,
        summary: skillDetail.description,
        imageUrl: skillDetail.images && skillDetail.images[0] ? skillDetail.images[0] : "",
        success: () => {
          common_vendor.index.showToast({
            title: "分享成功",
            icon: "success"
          });
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/skills/skill-detail.vue:423", "分享失败:", error);
          const shareText = `${skillDetail.title} - ${skillDetail.description}`;
          common_vendor.index.setClipboardData({
            data: shareText,
            success: () => {
              common_vendor.index.showToast({
                title: "内容已复制到剪贴板",
                icon: "success"
              });
            }
          });
        }
      });
    };
    const goToSkillDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/skills/skill-detail?id=${id}`
      });
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:468", "页面挂载，开始初始化...");
      initCloudObj();
      setTimeout(() => {
        if (skillsCloudObj && skillId.value) {
          common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:476", "开始加载技能详情...");
          loadSkillDetail();
        } else {
          common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:481", "云对象或技能ID缺失，停止加载");
          isLoading.value = false;
        }
      }, 100);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value
      }, isLoading.value ? {
        b: common_vendor.p({
          status: "loading"
        })
      } : skillDetail._id ? common_vendor.e({
        d: skillDetail.images && skillDetail.images.length > 0
      }, skillDetail.images && skillDetail.images.length > 0 ? {
        e: common_vendor.f(skillDetail.images, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewImage(index), index),
            c: index
          };
        })
      } : {}, {
        f: common_vendor.t(skillDetail.title),
        g: common_vendor.t(skillDetail.price),
        h: common_vendor.t(skillDetail.priceUnit),
        i: skillDetail.tags && skillDetail.tags.length > 0
      }, skillDetail.tags && skillDetail.tags.length > 0 ? {
        j: common_vendor.f(skillDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        k: common_vendor.t(skillDetail.description),
        l: common_vendor.p({
          type: "star-filled",
          size: "16",
          color: "#FFD700"
        }),
        m: common_vendor.t(skillDetail.rating),
        n: common_vendor.t(skillDetail.reviewCount),
        o: common_vendor.t(formatDate(skillDetail.createTime)),
        p: skillDetail.userAvatar || "/static/default-avatar.png",
        q: common_vendor.t(skillDetail.username),
        r: common_vendor.p({
          type: "location",
          size: "14",
          color: "#999"
        }),
        s: common_vendor.t(skillDetail.location),
        t: common_vendor.t(skillDetail.viewCount || 0),
        v: common_vendor.t(skillDetail.rating),
        w: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#007aff"
        }),
        x: common_vendor.o(showContactModal),
        y: relatedSkills.length > 0
      }, relatedSkills.length > 0 ? {
        z: common_vendor.f(relatedSkills, (skill, index, i0) => {
          return {
            a: skill.images && skill.images[0] ? skill.images[0] : "/static/default-skill.png",
            b: common_vendor.t(skill.title),
            c: common_vendor.t(skill.price),
            d: common_vendor.t(skill.priceUnit),
            e: skill._id,
            f: common_vendor.o(($event) => goToSkillDetail(skill._id), skill._id)
          };
        })
      } : {}, {
        A: common_vendor.p({
          type: isCollected.value ? "heart-filled" : "heart",
          size: "20",
          color: isCollected.value ? "#ff4757" : "#666"
        }),
        B: common_vendor.t(isCollected.value ? "已收藏" : "收藏"),
        C: common_vendor.o(toggleCollect),
        D: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#666"
        }),
        E: common_vendor.o(shareSkill),
        F: common_vendor.o(showContactModal)
      }) : !isLoading.value ? {
        H: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ccc"
        }),
        I: common_vendor.o(loadSkillDetail)
      } : {}, {
        c: skillDetail._id,
        G: !isLoading.value,
        J: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        K: common_vendor.o(closeContactModal),
        L: skillDetail.phone
      }, skillDetail.phone ? {
        M: common_vendor.p({
          type: "phone",
          size: "24",
          color: "white"
        }),
        N: common_vendor.t(skillDetail.phone),
        O: common_vendor.o(makePhoneCall)
      } : {}, {
        P: skillDetail.wechat
      }, skillDetail.wechat ? {
        Q: common_vendor.p({
          type: "weixin",
          size: "24",
          color: "white"
        }),
        R: common_vendor.t(skillDetail.wechat),
        S: common_vendor.o(copyWechat)
      } : {}, {
        T: !skillDetail.phone && !skillDetail.wechat
      }, !skillDetail.phone && !skillDetail.wechat ? {} : {}, {
        U: common_vendor.sr(contactPopup, "aae43d6e-7", {
          "k": "contactPopup"
        }),
        V: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-aae43d6e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/skills/skill-detail.js.map
