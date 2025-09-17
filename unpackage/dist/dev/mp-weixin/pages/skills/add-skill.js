"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "add-skill",
  setup(__props) {
    const currentTag = common_vendor.ref("");
    const categoryIndex = common_vendor.ref(-1);
    const priceUnitIndex = common_vendor.ref(-1);
    const formData = common_vendor.reactive({
      title: "",
      description: "",
      category: "",
      location: "",
      price: "",
      priceUnit: "",
      tags: [],
      images: [],
      phone: "",
      wechat: ""
    });
    const categoryList = common_vendor.reactive([
      { label: "家政服务", value: "housekeeping" },
      { label: "维修安装", value: "repair" },
      { label: "教育培训", value: "education" },
      { label: "美容美发", value: "beauty" },
      { label: "健康护理", value: "health" },
      { label: "其他服务", value: "other" }
    ]);
    const priceUnitList = common_vendor.reactive(["小时", "次", "天", "课时", "项目"]);
    const isFormValid = common_vendor.computed(() => {
      return formData.title.trim() && formData.description.trim() && formData.category && formData.location.trim() && formData.price && formData.priceUnit;
    });
    const getCategoryLabel = (value) => {
      const category = categoryList.find((item) => item.value === value);
      return category ? category.label : "";
    };
    const onCategoryChange = (e) => {
      categoryIndex.value = e.detail.value;
      formData.category = categoryList[e.detail.value].value;
    };
    const onPriceUnitChange = (e) => {
      priceUnitIndex.value = e.detail.value;
      formData.priceUnit = priceUnitList[e.detail.value];
    };
    const addTag = () => {
      const tag = currentTag.value.trim();
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
        formData.tags.push(tag);
        currentTag.value = "";
      } else if (formData.tags.length >= 5) {
        common_vendor.index.showToast({
          title: "最多添加5个标签",
          icon: "none"
        });
      } else if (formData.tags.includes(tag)) {
        common_vendor.index.showToast({
          title: "标签已存在",
          icon: "none"
        });
      }
    };
    const removeTag = (index) => {
      formData.tags.splice(index, 1);
    };
    const chooseImage = () => {
      const remainCount = 6 - formData.images.length;
      common_vendor.index.chooseImage({
        count: remainCount,
        sizeType: ["compressed"],
        sourceType: ["camera", "album"],
        success: (res) => {
          formData.images.push(...res.tempFilePaths);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/skills/add-skill.vue:267", "选择图片失败:", err);
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
    };
    const removeImage = (index) => {
      formData.images.splice(index, 1);
    };
    const onSubmit = () => {
      if (!isFormValid.value) {
        common_vendor.index.showToast({
          title: "请完善必填信息",
          icon: "none"
        });
        return;
      }
      if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        common_vendor.index.showToast({
          title: "请输入有效价格",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "发布中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "发布成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }, 2e3);
      common_vendor.index.__f__("log", "at pages/skills/add-skill.vue:317", "提交的表单数据:", formData);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: formData.title,
        b: common_vendor.o(($event) => formData.title = $event.detail.value),
        c: formData.description,
        d: common_vendor.o(($event) => formData.description = $event.detail.value),
        e: common_vendor.t(formData.description.length),
        f: common_vendor.t(formData.category ? getCategoryLabel(formData.category) : "请选择服务分类"),
        g: common_vendor.p({
          type: "right",
          size: "16",
          color: "#999"
        }),
        h: categoryIndex.value,
        i: categoryList,
        j: common_vendor.o(onCategoryChange),
        k: formData.location,
        l: common_vendor.o(($event) => formData.location = $event.detail.value),
        m: formData.price,
        n: common_vendor.o(($event) => formData.price = $event.detail.value),
        o: common_vendor.t(formData.priceUnit || "单位"),
        p: common_vendor.p({
          type: "down",
          size: "12",
          color: "#999"
        }),
        q: priceUnitIndex.value,
        r: priceUnitList,
        s: common_vendor.o(onPriceUnitChange),
        t: common_vendor.o(addTag),
        v: currentTag.value,
        w: common_vendor.o(($event) => currentTag.value = $event.detail.value),
        x: currentTag.value.trim()
      }, currentTag.value.trim() ? {
        y: common_vendor.p({
          type: "plus",
          size: "16",
          color: "#007aff"
        }),
        z: common_vendor.o(addTag)
      } : {}, {
        A: common_vendor.f(formData.tags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: "8ed1818b-3-" + i0,
            c: common_vendor.o(($event) => removeTag(index), index),
            d: index
          };
        }),
        B: common_vendor.p({
          type: "close",
          size: "12",
          color: "#999"
        }),
        C: common_vendor.f(formData.images, (img, index, i0) => {
          return {
            a: img,
            b: "8ed1818b-4-" + i0,
            c: common_vendor.o(($event) => removeImage(index), index),
            d: index
          };
        }),
        D: common_vendor.p({
          type: "close",
          size: "16",
          color: "white"
        }),
        E: formData.images.length < 6
      }, formData.images.length < 6 ? {
        F: common_vendor.p({
          type: "plus",
          size: "40",
          color: "#ccc"
        }),
        G: common_vendor.o(chooseImage)
      } : {}, {
        H: formData.phone,
        I: common_vendor.o(($event) => formData.phone = $event.detail.value),
        J: formData.wechat,
        K: common_vendor.o(($event) => formData.wechat = $event.detail.value),
        L: common_vendor.o(onSubmit),
        M: !isFormValid.value,
        N: common_vendor.o(onSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8ed1818b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/skills/add-skill.js.map
