"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ImageUploader();
}
const ImageUploader = () => "../../components/ImageUploader.js";
const _sfc_main = {
  __name: "add-skill",
  setup(__props) {
    const skillData = common_vendor.reactive({
      title: "",
      category: "",
      description: "",
      images: [],
      contact: "",
      price: "",
      availableTime: ""
    });
    const isSubmitting = common_vendor.ref(false);
    const categoryIndex = common_vendor.ref(0);
    const categories = common_vendor.ref([
      { name: "编程开发", value: "programming" },
      { name: "设计创意", value: "design" },
      { name: "语言翻译", value: "language" },
      { name: "音乐艺术", value: "music" },
      { name: "体育健身", value: "sports" },
      { name: "学习辅导", value: "education" },
      { name: "生活服务", value: "life" },
      { name: "其他技能", value: "other" }
    ]);
    let skillsObj = null;
    const initCloudObj = () => {
      try {
        skillsObj = common_vendor.nr.importObject("skills");
      } catch (error) {
        common_vendor.index.showToast({
          title: "服务初始化失败",
          icon: "none"
        });
      }
    };
    const onCategoryChange = (e) => {
      categoryIndex.value = e.detail.value;
      skillData.category = categories.value[e.detail.value].name;
    };
    const onUploadSuccess = (data) => {
    };
    const onUploadError = (error) => {
    };
    const validateForm = () => {
      if (!skillData.title.trim()) {
        common_vendor.index.showToast({
          title: "请输入技能标题",
          icon: "none"
        });
        return false;
      }
      if (!skillData.category) {
        common_vendor.index.showToast({
          title: "请选择技能分类",
          icon: "none"
        });
        return false;
      }
      if (!skillData.description.trim()) {
        common_vendor.index.showToast({
          title: "请输入技能描述",
          icon: "none"
        });
        return false;
      }
      if (!skillData.contact.trim()) {
        common_vendor.index.showToast({
          title: "请输入联系方式",
          icon: "none"
        });
        return false;
      }
      return true;
    };
    const submitSkill = async () => {
      if (!validateForm()) {
        return;
      }
      if (isSubmitting.value) {
        return;
      }
      if (!skillsObj) {
        initCloudObj();
        if (!skillsObj) {
          common_vendor.index.showToast({
            title: "服务不可用，请重试",
            icon: "none"
          });
          return;
        }
      }
      try {
        isSubmitting.value = true;
        const submitData = {
          title: skillData.title.trim(),
          category: skillData.category,
          description: skillData.description.trim(),
          images: skillData.images,
          contact: skillData.contact.trim(),
          price: skillData.price.trim(),
          availableTime: skillData.availableTime.trim()
        };
        const result = await skillsObj.addSkill(submitData);
        if (result.errCode === 0) {
          common_vendor.index.showToast({
            title: "技能发布成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: result.errMsg || "发布失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    common_vendor.onLoad(() => {
      initCloudObj();
    });
    return (_ctx, _cache) => {
      return {
        a: skillData.title,
        b: common_vendor.o(($event) => skillData.title = $event.detail.value),
        c: common_vendor.t(skillData.category || "请选择技能分类"),
        d: categoryIndex.value,
        e: categories.value,
        f: common_vendor.o(onCategoryChange),
        g: skillData.description,
        h: common_vendor.o(($event) => skillData.description = $event.detail.value),
        i: common_vendor.o(onUploadSuccess),
        j: common_vendor.o(onUploadError),
        k: common_vendor.o(($event) => skillData.images = $event),
        l: common_vendor.p({
          ["max-count"]: 6,
          module: "skills",
          modelValue: skillData.images
        }),
        m: skillData.contact,
        n: common_vendor.o(($event) => skillData.contact = $event.detail.value),
        o: skillData.price,
        p: common_vendor.o(($event) => skillData.price = $event.detail.value),
        q: skillData.availableTime,
        r: common_vendor.o(($event) => skillData.availableTime = $event.detail.value),
        s: common_vendor.t(isSubmitting.value ? "发布中..." : "发布技能"),
        t: isSubmitting.value,
        v: common_vendor.o(submitSkill),
        w: common_vendor.o(submitSkill)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8ed1818b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/skills/add-skill.js.map
