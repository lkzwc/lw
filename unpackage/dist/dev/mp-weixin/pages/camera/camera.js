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
  __name: "camera",
  setup(__props) {
    const currentTab = common_vendor.ref("report");
    const photos = common_vendor.ref([]);
    const licenseNumber = common_vendor.ref("");
    const recognizedLicense = common_vendor.ref("");
    const isRecognizing = common_vendor.ref(false);
    const violationLocation = common_vendor.ref("");
    const violationType = common_vendor.ref("");
    const violationTypeIndex = common_vendor.ref(-1);
    const violationDesc = common_vendor.ref("");
    const successPopup = common_vendor.ref(null);
    const violationTypes = common_vendor.reactive([
      "占用消防通道",
      "占用盲道",
      "占用绿化带",
      "占用人行道",
      "占用车位",
      "乱停乱放",
      "其他违停"
    ]);
    const rankingList = common_vendor.reactive([
      {
        licenseNumber: "京A12345",
        reportCount: 15,
        latestReport: /* @__PURE__ */ new Date("2024-01-20")
      },
      {
        licenseNumber: "京B67890",
        reportCount: 12,
        latestReport: /* @__PURE__ */ new Date("2024-01-19")
      },
      {
        licenseNumber: "京C11111",
        reportCount: 8,
        latestReport: /* @__PURE__ */ new Date("2024-01-18")
      },
      {
        licenseNumber: "京D22222",
        reportCount: 6,
        latestReport: /* @__PURE__ */ new Date("2024-01-17")
      },
      {
        licenseNumber: "京E33333",
        reportCount: 4,
        latestReport: /* @__PURE__ */ new Date("2024-01-16")
      }
    ]);
    const canSubmit = common_vendor.computed(() => {
      return photos.value.length > 0 && licenseNumber.value.trim() && violationLocation.value.trim() && violationType.value;
    });
    const switchTab = (tab) => {
      currentTab.value = tab;
    };
    const takePhoto = () => {
      common_vendor.index.chooseImage({
        count: 3 - photos.value.length,
        sizeType: ["compressed"],
        sourceType: ["camera"],
        success: (res) => {
          photos.value.push(...res.tempFilePaths);
          if (photos.value.length === 1) {
            setTimeout(() => {
              recognizeLicense();
            }, 500);
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/camera/camera.vue:242", "拍照失败:", err);
          common_vendor.index.showToast({
            title: "拍照失败",
            icon: "none"
          });
        }
      });
    };
    const previewPhoto = (index) => {
      common_vendor.index.previewImage({
        urls: photos.value,
        current: index
      });
    };
    const removePhoto = (index) => {
      photos.value.splice(index, 1);
      if (photos.value.length === 0) {
        licenseNumber.value = "";
        recognizedLicense.value = "";
      }
    };
    const recognizeLicense = () => {
      if (photos.value.length === 0) {
        common_vendor.index.showToast({
          title: "请先拍照",
          icon: "none"
        });
        return;
      }
      isRecognizing.value = true;
      setTimeout(() => {
        const mockLicenses = ["京A12345", "沪B67890", "粤C11111", "川D22222", "鲁E33333"];
        const randomLicense = mockLicenses[Math.floor(Math.random() * mockLicenses.length)];
        recognizedLicense.value = randomLicense;
        licenseNumber.value = randomLicense;
        isRecognizing.value = false;
        common_vendor.index.showToast({
          title: "识别成功",
          icon: "success"
        });
      }, 2e3);
    };
    const onViolationTypeChange = (e) => {
      violationTypeIndex.value = e.detail.value;
      violationType.value = violationTypes[e.detail.value];
    };
    const submitReport = () => {
      if (!canSubmit.value) {
        common_vendor.index.showToast({
          title: "请完善举报信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        successPopup.value.open();
        photos.value = [];
        licenseNumber.value = "";
        recognizedLicense.value = "";
        violationLocation.value = "";
        violationType.value = "";
        violationTypeIndex.value = -1;
        violationDesc.value = "";
      }, 2e3);
      common_vendor.index.__f__("log", "at pages/camera/camera.vue:336", "提交举报数据:", {
        photos: photos.value,
        licenseNumber: licenseNumber.value,
        violationLocation: violationLocation.value,
        violationType: violationType.value,
        violationDesc: violationDesc.value,
        reportTime: /* @__PURE__ */ new Date()
      });
    };
    const closeSuccessModal = () => {
      successPopup.value.close();
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
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/camera/camera.vue:369", "随手拍页面加载完成");
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: currentTab.value === "report" ? 1 : "",
        b: common_vendor.o(($event) => switchTab("report")),
        c: currentTab.value === "ranking" ? 1 : "",
        d: common_vendor.o(($event) => switchTab("ranking")),
        e: currentTab.value === "report"
      }, currentTab.value === "report" ? common_vendor.e({
        f: common_vendor.p({
          type: "camera",
          size: "20",
          color: "#007aff"
        }),
        g: common_vendor.t(photos.value.length),
        h: common_vendor.f(photos.value, (photo, index, i0) => {
          return {
            a: photo,
            b: common_vendor.o(($event) => previewPhoto(index), index),
            c: "7b8d50ad-1-" + i0,
            d: common_vendor.o(($event) => removePhoto(index), index),
            e: index
          };
        }),
        i: common_vendor.p({
          type: "close",
          size: "16",
          color: "white"
        }),
        j: photos.value.length < 3
      }, photos.value.length < 3 ? {
        k: common_vendor.p({
          type: "plus",
          size: "40",
          color: "#ccc"
        }),
        l: common_vendor.o(takePhoto)
      } : {}, {
        m: photos.value.length > 0
      }, photos.value.length > 0 ? common_vendor.e({
        n: common_vendor.p({
          type: "scan",
          size: "20",
          color: "#ff4757"
        }),
        o: !isRecognizing.value
      }, !isRecognizing.value ? {
        p: common_vendor.t(recognizedLicense.value ? "重新识别" : "开始识别")
      } : {}, {
        q: common_vendor.o(recognizeLicense),
        r: isRecognizing.value ? 1 : "",
        s: licenseNumber.value,
        t: common_vendor.o(($event) => licenseNumber.value = $event.detail.value),
        v: recognizedLicense.value
      }, recognizedLicense.value ? {
        w: common_vendor.t(recognizedLicense.value)
      } : {}) : {}, {
        x: photos.value.length > 0
      }, photos.value.length > 0 ? {
        y: common_vendor.p({
          type: "location",
          size: "20",
          color: "#50c878"
        }),
        z: violationLocation.value,
        A: common_vendor.o(($event) => violationLocation.value = $event.detail.value),
        B: common_vendor.t(violationType.value || "请选择违停类型"),
        C: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        D: violationTypeIndex.value,
        E: violationTypes,
        F: common_vendor.o(onViolationTypeChange),
        G: violationDesc.value,
        H: common_vendor.o(($event) => violationDesc.value = $event.detail.value)
      } : {}, {
        I: photos.value.length > 0
      }, photos.value.length > 0 ? {
        J: common_vendor.o(submitReport),
        K: !canSubmit.value
      } : {}) : {}, {
        L: currentTab.value === "ranking"
      }, currentTab.value === "ranking" ? common_vendor.e({
        M: common_vendor.f(rankingList, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.n("rank-" + (index + 1)),
            c: common_vendor.t(item.licenseNumber),
            d: common_vendor.t(item.reportCount),
            e: common_vendor.t(formatTime(item.latestReport)),
            f: index
          };
        }),
        N: rankingList.length === 0
      }, rankingList.length === 0 ? {
        O: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ccc"
        })
      } : {}) : {}, {
        P: common_vendor.p({
          type: "checkmarkempty",
          size: "60",
          color: "#50c878"
        }),
        Q: common_vendor.o(closeSuccessModal),
        R: common_vendor.sr(successPopup, "7b8d50ad-7", {
          "k": "successPopup"
        }),
        S: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7b8d50ad"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/camera/camera.js.map
