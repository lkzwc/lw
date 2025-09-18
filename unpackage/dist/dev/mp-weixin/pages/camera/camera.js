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
  (_easycom_uni_icons + ImageUploader + _easycom_uni_popup)();
}
const ImageUploader = () => "../../components/ImageUploader.js";
const _sfc_main = {
  __name: "camera",
  setup(__props) {
    const currentTab = common_vendor.ref("report");
    const uploadedImages = common_vendor.ref([]);
    const licenseNumber = common_vendor.ref("");
    const recognizedLicense = common_vendor.ref("");
    const isRecognizing = common_vendor.ref(false);
    const violationLocation = common_vendor.ref("");
    const violationType = common_vendor.ref("");
    const violationTypeIndex = common_vendor.ref(-1);
    const violationDesc = common_vendor.ref("");
    const successPopup = common_vendor.ref(null);
    const isSubmitting = common_vendor.ref(false);
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
    let reportCloudObj = null;
    const initCloudObj = () => {
      try {
        reportCloudObj = common_vendor.nr.importObject("report");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/camera/camera.vue:220", "举报云对象初始化失败:", error);
      }
    };
    const canSubmit = common_vendor.computed(() => {
      return uploadedImages.value.length > 0 && licenseNumber.value.trim() && violationLocation.value.trim() && violationType.value;
    });
    const switchTab = (tab) => {
      currentTab.value = tab;
    };
    const onUploadSuccess = (data) => {
      common_vendor.index.__f__("log", "at pages/camera/camera.vue:239", "图片上传成功:", data);
      if (uploadedImages.value.length === 1) {
        setTimeout(() => {
          recognizeLicense();
        }, 500);
      }
    };
    const onUploadError = (error) => {
      common_vendor.index.__f__("error", "at pages/camera/camera.vue:250", "图片上传失败:", error);
      common_vendor.index.showToast({
        title: "图片上传失败",
        icon: "none"
      });
    };
    const recognizeLicense = async () => {
      if (uploadedImages.value.length === 0) {
        common_vendor.index.showToast({
          title: "请先上传照片",
          icon: "none"
        });
        return;
      }
      isRecognizing.value = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        const mockLicenses = ["京A12345", "沪B67890", "粤C11111", "川D22222"];
        const randomLicense = mockLicenses[Math.floor(Math.random() * mockLicenses.length)];
        recognizedLicense.value = randomLicense;
        licenseNumber.value = randomLicense;
        common_vendor.index.showToast({
          title: "识别成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/camera/camera.vue:285", "车牌识别失败:", error);
        common_vendor.index.showToast({
          title: "识别失败，请手动输入",
          icon: "none"
        });
      } finally {
        isRecognizing.value = false;
      }
    };
    const onViolationTypeChange = (e) => {
      violationTypeIndex.value = e.detail.value;
      violationType.value = violationTypes[e.detail.value];
    };
    const submitReport = async () => {
      if (!canSubmit.value) {
        common_vendor.index.showToast({
          title: "请完善举报信息",
          icon: "none"
        });
        return;
      }
      isSubmitting.value = true;
      try {
        const reportData = {
          licenseNumber: licenseNumber.value.trim(),
          violationLocation: violationLocation.value.trim(),
          violationType: violationType.value,
          violationDesc: violationDesc.value.trim(),
          images: uploadedImages.value,
          reportTime: (/* @__PURE__ */ new Date()).toISOString()
        };
        common_vendor.index.__f__("log", "at pages/camera/camera.vue:324", "提交举报数据:", reportData);
        if (reportCloudObj) {
          const result = await reportCloudObj.submitReport(reportData);
          if (result.errCode === 0) {
            successPopup.value.open();
            resetForm();
          } else {
            common_vendor.index.showToast({
              title: result.errMsg || "提交失败",
              icon: "none"
            });
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          successPopup.value.open();
          resetForm();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/camera/camera.vue:348", "提交举报失败:", error);
        common_vendor.index.showToast({
          title: "提交失败，请重试",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    const resetForm = () => {
      uploadedImages.value = [];
      licenseNumber.value = "";
      recognizedLicense.value = "";
      violationLocation.value = "";
      violationType.value = "";
      violationTypeIndex.value = -1;
      violationDesc.value = "";
    };
    const closeSuccessModal = () => {
      successPopup.value.close();
    };
    const formatTime = (date) => {
      if (!date)
        return "";
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
      initCloudObj();
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
        g: common_vendor.t(uploadedImages.value.length),
        h: common_vendor.o(onUploadSuccess),
        i: common_vendor.o(onUploadError),
        j: common_vendor.o(($event) => uploadedImages.value = $event),
        k: common_vendor.p({
          ["max-count"]: 3,
          module: "report",
          modelValue: uploadedImages.value
        }),
        l: uploadedImages.value.length > 0
      }, uploadedImages.value.length > 0 ? common_vendor.e({
        m: common_vendor.p({
          type: "scan",
          size: "20",
          color: "#ff4757"
        }),
        n: !isRecognizing.value
      }, !isRecognizing.value ? {
        o: common_vendor.t(recognizedLicense.value ? "重新识别" : "开始识别")
      } : {}, {
        p: common_vendor.o(recognizeLicense),
        q: isRecognizing.value ? 1 : "",
        r: licenseNumber.value,
        s: common_vendor.o(($event) => licenseNumber.value = $event.detail.value),
        t: recognizedLicense.value
      }, recognizedLicense.value ? {
        v: common_vendor.t(recognizedLicense.value)
      } : {}) : {}, {
        w: uploadedImages.value.length > 0
      }, uploadedImages.value.length > 0 ? {
        x: common_vendor.p({
          type: "location",
          size: "20",
          color: "#50c878"
        }),
        y: violationLocation.value,
        z: common_vendor.o(($event) => violationLocation.value = $event.detail.value),
        A: common_vendor.t(violationType.value || "请选择违停类型"),
        B: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        C: violationTypeIndex.value,
        D: violationTypes,
        E: common_vendor.o(onViolationTypeChange),
        F: violationDesc.value,
        G: common_vendor.o(($event) => violationDesc.value = $event.detail.value)
      } : {}, {
        H: uploadedImages.value.length > 0
      }, uploadedImages.value.length > 0 ? {
        I: common_vendor.t(isSubmitting.value ? "提交中..." : "提交举报"),
        J: common_vendor.o(submitReport),
        K: !canSubmit.value || isSubmitting.value
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
        R: common_vendor.sr(successPopup, "7b8d50ad-6", {
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
