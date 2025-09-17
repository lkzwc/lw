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
    const isSubmitting = common_vendor.ref(false);
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
    let skillsCloudObj = null;
    const initCloudObj = () => {
      try {
        skillsCloudObj = common_vendor.nr.importObject("skills");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/add-skill.vue:213", "初始化云对象失败:", error);
        common_vendor.index.showToast({
          title: "服务初始化失败",
          icon: "none"
        });
      }
    };
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
        sourceType: ["album", "camera"],
        success: (res) => {
          uploadImages(res.tempFilePaths);
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/skills/add-skill.vue:285", "选择图片失败:", error);
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
    };
    const uploadImages = async (tempFilePaths) => {
      if (!skillsCloudObj) {
        common_vendor.index.showToast({
          title: "服务未初始化",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "上传中..."
      });
      try {
        for (let i = 0; i < tempFilePaths.length; i++) {
          const tempFilePath = tempFilePaths[i];
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2);
          const fileExt = tempFilePath.substring(tempFilePath.lastIndexOf("."));
          const cloudPath = `skills/${timestamp}_${randomStr}${fileExt}`;
          const fileContent = await new Promise((resolve, reject) => {
            common_vendor.index.getFileSystemManager().readFile({
              filePath: tempFilePath,
              success: (res) => resolve(res.data),
              fail: reject
            });
          });
          const result = await skillsCloudObj.uploadImage({
            cloudPath,
            fileContent
          });
          if (result.errCode === 0) {
            formData.images.push(result.data.url);
          } else {
            throw new Error(result.errMsg || "上传失败");
          }
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "上传成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/add-skill.vue:346", "上传图片失败:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "上传失败",
          icon: "none"
        });
      }
    };
    const removeImage = (index) => {
      formData.images.splice(index, 1);
    };
    const validateForm = () => {
      if (!formData.title.trim()) {
        common_vendor.index.showToast({
          title: "请输入技能标题",
          icon: "none"
        });
        return false;
      }
      if (formData.title.trim().length < 2 || formData.title.trim().length > 50) {
        common_vendor.index.showToast({
          title: "技能标题长度应在2-50个字符之间",
          icon: "none"
        });
        return false;
      }
      if (!formData.description.trim()) {
        common_vendor.index.showToast({
          title: "请输入技能描述",
          icon: "none"
        });
        return false;
      }
      if (formData.description.trim().length < 10 || formData.description.trim().length > 500) {
        common_vendor.index.showToast({
          title: "技能描述长度应在10-500个字符之间",
          icon: "none"
        });
        return false;
      }
      if (!formData.category) {
        common_vendor.index.showToast({
          title: "请选择服务分类",
          icon: "none"
        });
        return false;
      }
      if (!formData.location.trim()) {
        common_vendor.index.showToast({
          title: "请输入服务位置",
          icon: "none"
        });
        return false;
      }
      if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        common_vendor.index.showToast({
          title: "请输入有效的服务价格",
          icon: "none"
        });
        return false;
      }
      if (!formData.priceUnit) {
        common_vendor.index.showToast({
          title: "请选择价格单位",
          icon: "none"
        });
        return false;
      }
      if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
        common_vendor.index.showToast({
          title: "请输入有效的手机号码",
          icon: "none"
        });
        return false;
      }
      if (formData.wechat && (formData.wechat.length < 6 || formData.wechat.length > 20)) {
        common_vendor.index.showToast({
          title: "微信号长度应在6-20个字符之间",
          icon: "none"
        });
        return false;
      }
      return true;
    };
    const onSubmit = async () => {
      if (!validateForm()) {
        return;
      }
      if (!skillsCloudObj) {
        common_vendor.index.showToast({
          title: "服务未初始化",
          icon: "none"
        });
        return;
      }
      if (isSubmitting.value) {
        return;
      }
      try {
        isSubmitting.value = true;
        const submitData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          location: formData.location.trim(),
          price: parseFloat(formData.price),
          priceUnit: formData.priceUnit,
          tags: formData.tags,
          images: formData.images,
          phone: formData.phone.trim(),
          wechat: formData.wechat.trim()
        };
        const result = await skillsCloudObj.publishSkill(submitData);
        if (result.errCode === 0) {
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack({
              delta: 1
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: result.errMsg || "发布失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/skills/add-skill.vue:502", "发布技能失败:", error);
        common_vendor.index.showToast({
          title: "发布失败，请重试",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    common_vendor.onMounted(() => {
      initCloudObj();
    });
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
        L: common_vendor.t(isSubmitting.value ? "发布中..." : "发布技能"),
        M: common_vendor.o(onSubmit),
        N: !isFormValid.value || isSubmitting.value,
        O: common_vendor.o(onSubmit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8ed1818b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/skills/add-skill.js.map
