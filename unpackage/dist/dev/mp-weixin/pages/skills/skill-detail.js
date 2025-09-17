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
  __name: "skill-detail",
  setup(__props) {
    const contactPopup = common_vendor.ref(null);
    const isCollected = common_vendor.ref(false);
    const skillDetail = common_vendor.reactive({
      id: 1,
      username: "张师傅",
      userAvatar: "https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=张",
      location: "1号楼301",
      price: 50,
      priceUnit: "小时",
      title: "专业家电维修",
      description: "10年维修经验，擅长各种家电故障排除，价格公道，服务周到。提供上门维修服务，包括冰箱、洗衣机、空调、电视等各类家电的维修保养。",
      tags: ["家电维修", "经验丰富", "价格实惠", "上门服务"],
      images: [
        "https://via.placeholder.com/750x400/FF6B6B/FFFFFF?text=维修1",
        "https://via.placeholder.com/750x400/4ECDC4/FFFFFF?text=维修2",
        "https://via.placeholder.com/750x400/45B7D1/FFFFFF?text=维修3"
      ],
      rating: 4.8,
      reviewCount: 23,
      createTime: /* @__PURE__ */ new Date("2024-01-15"),
      category: "repair",
      phone: "13800138000",
      wechat: "zhangshifu123",
      skillCount: 3,
      goodRate: "98%"
    });
    const reviews = common_vendor.reactive([
      {
        id: 1,
        username: "李女士",
        userAvatar: "https://via.placeholder.com/60x60/FF69B4/FFFFFF?text=李",
        rating: 5,
        content: "张师傅技术很好，态度也很好，修好了我家的洗衣机，价格合理，推荐！",
        createTime: /* @__PURE__ */ new Date("2024-01-20")
      },
      {
        id: 2,
        username: "王先生",
        userAvatar: "https://via.placeholder.com/60x60/32CD32/FFFFFF?text=王",
        rating: 4,
        content: "服务及时，修理技术专业，就是时间稍微长了一点。",
        createTime: /* @__PURE__ */ new Date("2024-01-18")
      }
    ]);
    const relatedSkills = common_vendor.reactive([
      {
        id: 2,
        title: "专业家政清洁",
        price: 30,
        priceUnit: "小时",
        images: ["https://via.placeholder.com/200x150/96CEB4/FFFFFF?text=清洁"]
      },
      {
        id: 3,
        title: "小学数学辅导",
        price: 80,
        priceUnit: "课时",
        images: ["https://via.placeholder.com/200x150/DDA0DD/FFFFFF?text=教学"]
      }
    ]);
    const formatDate = (date) => {
      return date.toLocaleDateString();
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
    const previewImage = (current) => {
      common_vendor.index.previewImage({
        urls: skillDetail.images,
        current
      });
    };
    const showContactModal = () => {
      contactPopup.value.open();
    };
    const closeContactModal = () => {
      contactPopup.value.close();
    };
    const makePhoneCall = () => {
      common_vendor.index.makePhoneCall({
        phoneNumber: skillDetail.phone,
        success: () => {
          closeContactModal();
        }
      });
    };
    const copyWechat = () => {
      common_vendor.index.setClipboardData({
        data: skillDetail.wechat,
        success: () => {
          common_vendor.index.showToast({
            title: "微信号已复制",
            icon: "success"
          });
          closeContactModal();
        }
      });
    };
    const toggleCollect = () => {
      isCollected.value = !isCollected.value;
      common_vendor.index.showToast({
        title: isCollected.value ? "已收藏" : "已取消收藏",
        icon: "success"
      });
    };
    const shareSkill = () => {
      common_vendor.index.share({
        provider: "weixin",
        scene: "WXSceneSession",
        type: 0,
        href: "",
        title: skillDetail.title,
        summary: skillDetail.description,
        imageUrl: skillDetail.images[0],
        success: () => {
          common_vendor.index.showToast({
            title: "分享成功",
            icon: "success"
          });
        }
      });
    };
    const goToSkillDetail = (id) => {
      common_vendor.index.redirectTo({
        url: `/pages/skills/skill-detail?id=${id}`
      });
    };
    const goToAllReviews = () => {
      common_vendor.index.showToast({
        title: "查看全部评价功能开发中",
        icon: "none"
      });
    };
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;
      if (options.id) {
        common_vendor.index.__f__("log", "at pages/skills/skill-detail.vue:340", "技能ID:", options.id);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: skillDetail.images && skillDetail.images.length > 0
      }, skillDetail.images && skillDetail.images.length > 0 ? {
        b: common_vendor.f(skillDetail.images, (img, index, i0) => {
          return {
            a: img,
            b: common_vendor.o(($event) => previewImage(index), index),
            c: index
          };
        })
      } : {}, {
        c: common_vendor.t(skillDetail.title),
        d: common_vendor.t(skillDetail.price),
        e: common_vendor.t(skillDetail.priceUnit),
        f: common_vendor.f(skillDetail.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        }),
        g: common_vendor.t(skillDetail.description),
        h: common_vendor.p({
          type: "star-filled",
          size: "16",
          color: "#FFD700"
        }),
        i: common_vendor.t(skillDetail.rating),
        j: common_vendor.t(skillDetail.reviewCount),
        k: common_vendor.t(formatDate(skillDetail.createTime)),
        l: skillDetail.userAvatar,
        m: common_vendor.t(skillDetail.username),
        n: common_vendor.p({
          type: "location",
          size: "14",
          color: "#999"
        }),
        o: common_vendor.t(skillDetail.location),
        p: common_vendor.t(skillDetail.skillCount || 1),
        q: common_vendor.t(skillDetail.goodRate || "100%"),
        r: common_vendor.p({
          type: "chatbubble",
          size: "16",
          color: "#007aff"
        }),
        s: common_vendor.o(showContactModal),
        t: reviews.length > 0
      }, reviews.length > 0 ? {
        v: common_vendor.o(goToAllReviews),
        w: common_vendor.f(reviews.slice(0, 3), (review, index, i0) => {
          return {
            a: review.userAvatar,
            b: common_vendor.t(review.username),
            c: common_vendor.f(5, (star, k1, i1) => {
              return {
                a: star,
                b: "aae43d6e-3-" + i0 + "-" + i1,
                c: common_vendor.p({
                  type: "star-filled",
                  size: "12",
                  color: star <= review.rating ? "#FFD700" : "#E8E8E8"
                })
              };
            }),
            d: common_vendor.t(formatTime(review.createTime)),
            e: common_vendor.t(review.content),
            f: index
          };
        })
      } : {}, {
        x: relatedSkills.length > 0
      }, relatedSkills.length > 0 ? {
        y: common_vendor.f(relatedSkills, (skill, index, i0) => {
          return {
            a: skill.images[0],
            b: common_vendor.t(skill.title),
            c: common_vendor.t(skill.price),
            d: common_vendor.t(skill.priceUnit),
            e: skill.id,
            f: common_vendor.o(($event) => goToSkillDetail(skill.id), skill.id)
          };
        })
      } : {}, {
        z: common_vendor.p({
          type: isCollected.value ? "heart-filled" : "heart",
          size: "20",
          color: isCollected.value ? "#ff4757" : "#666"
        }),
        A: common_vendor.t(isCollected.value ? "已收藏" : "收藏"),
        B: common_vendor.o(toggleCollect),
        C: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#666"
        }),
        D: common_vendor.o(shareSkill),
        E: common_vendor.o(showContactModal),
        F: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        G: common_vendor.o(closeContactModal),
        H: skillDetail.phone
      }, skillDetail.phone ? {
        I: common_vendor.p({
          type: "phone",
          size: "24",
          color: "white"
        }),
        J: common_vendor.t(skillDetail.phone),
        K: common_vendor.o(makePhoneCall)
      } : {}, {
        L: skillDetail.wechat
      }, skillDetail.wechat ? {
        M: common_vendor.p({
          type: "weixin",
          size: "24",
          color: "white"
        }),
        N: common_vendor.t(skillDetail.wechat),
        O: common_vendor.o(copyWechat)
      } : {}, {
        P: common_vendor.sr(contactPopup, "aae43d6e-6", {
          "k": "contactPopup"
        }),
        Q: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-aae43d6e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/skills/skill-detail.js.map
