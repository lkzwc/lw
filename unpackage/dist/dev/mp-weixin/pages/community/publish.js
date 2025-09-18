"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ImageUploader();
}
const ImageUploader = () => "../../components/ImageUploader.js";
const _sfc_main = {
  __name: "publish",
  setup(__props) {
    const postData = common_vendor.reactive({
      title: "",
      content: "",
      images: [],
      category: "闲聊交流"
    });
    const isSubmitting = common_vendor.ref(false);
    const categoryIndex = common_vendor.ref(0);
    const categories = common_vendor.ref([
      { name: "闲聊交流", value: "chat" },
      { name: "技能分享", value: "skill" },
      { name: "求助问答", value: "help" },
      { name: "经验分享", value: "experience" },
      { name: "资源分享", value: "resource" },
      { name: "其他", value: "other" }
    ]);
    let communityObj = null;
    const initCloudObj = () => {
      try {
        communityObj = common_vendor.nr.importObject("community");
      } catch (error) {
        common_vendor.index.showToast({
          title: "服务初始化失败",
          icon: "none"
        });
      }
    };
    const onCategoryChange = (e) => {
      categoryIndex.value = e.detail.value;
      postData.category = categories.value[e.detail.value].name;
    };
    const onUploadSuccess = (data) => {
    };
    const onUploadError = (error) => {
    };
    const validateForm = () => {
      if (!postData.title.trim()) {
        common_vendor.index.showToast({
          title: "请输入帖子标题",
          icon: "none"
        });
        return false;
      }
      if (!postData.content.trim()) {
        common_vendor.index.showToast({
          title: "请输入帖子内容",
          icon: "none"
        });
        return false;
      }
      return true;
    };
    const submitPost = async () => {
      if (!validateForm()) {
        return;
      }
      if (isSubmitting.value) {
        return;
      }
      if (!communityObj) {
        initCloudObj();
        if (!communityObj) {
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
          title: postData.title.trim(),
          content: postData.content.trim(),
          images: postData.images,
          category: postData.category
        };
        const result = await communityObj.addPost(submitData);
        if (result.errCode === 0) {
          common_vendor.index.showToast({
            title: "帖子发布成功",
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
        a: postData.title,
        b: common_vendor.o(($event) => postData.title = $event.detail.value),
        c: postData.content,
        d: common_vendor.o(($event) => postData.content = $event.detail.value),
        e: common_vendor.o(onUploadSuccess),
        f: common_vendor.o(onUploadError),
        g: common_vendor.o(($event) => postData.images = $event),
        h: common_vendor.p({
          ["max-count"]: 9,
          module: "community",
          modelValue: postData.images
        }),
        i: common_vendor.t(postData.category || "请选择帖子分类"),
        j: categoryIndex.value,
        k: categories.value,
        l: common_vendor.o(onCategoryChange),
        m: common_vendor.t(isSubmitting.value ? "发布中..." : "发布帖子"),
        n: isSubmitting.value,
        o: common_vendor.o(submitPost),
        p: common_vendor.o(submitPost)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-354f064d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/publish.js.map
