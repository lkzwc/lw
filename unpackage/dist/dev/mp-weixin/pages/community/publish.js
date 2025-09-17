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
  __name: "publish",
  setup(__props, { expose: __expose }) {
    const isPublishing = common_vendor.ref(false);
    const showTagPanel = common_vendor.ref(false);
    const cursorPosition = common_vendor.ref(0);
    const selectedTags = common_vendor.ref([]);
    const loadingText = common_vendor.reactive({
      contentText: {
        loading: "发布中..."
      }
    });
    const formData = common_vendor.reactive({
      content: "",
      images: [],
      isPublic: true
    });
    const hotTags = common_vendor.reactive([
      "日常",
      "生活",
      "美食",
      "旅行",
      "学习",
      "工作",
      "健身",
      "摄影",
      "音乐",
      "电影",
      "读书",
      "科技",
      "游戏",
      "宠物",
      "时尚"
    ]);
    const canPublish = common_vendor.computed(() => {
      return formData.content.trim().length > 0;
    });
    common_vendor.watch(() => formData.content, (newContent) => {
      const lastChar = newContent.slice(-1);
      if (lastChar === "#") {
        showTagPanel.value = true;
      }
    });
    const onContentInput = (e) => {
      formData.content = e.detail.value;
      cursorPosition.value = e.detail.cursor;
    };
    const onInputBlur = () => {
      setTimeout(() => {
        if (showTagPanel.value) {
          showTagPanel.value = false;
        }
      }, 200);
    };
    const selectTag = (tag) => {
      if (!selectedTags.value.includes(tag)) {
        selectedTags.value.push(tag);
        const content = formData.content;
        const beforeCursor = content.substring(0, cursorPosition.value);
        const afterCursor = content.substring(cursorPosition.value);
        const lastHashIndex = beforeCursor.lastIndexOf("#");
        if (lastHashIndex !== -1) {
          const newContent = content.substring(0, lastHashIndex) + "#" + tag + " " + afterCursor;
          formData.content = newContent;
        }
      }
      closeTagPanel();
    };
    const removeTag = (index) => {
      const removedTag = selectedTags.value[index];
      selectedTags.value.splice(index, 1);
      formData.content = formData.content.replace("#" + removedTag, "").replace(/\s+/g, " ").trim();
    };
    const closeTagPanel = () => {
      showTagPanel.value = false;
    };
    const chooseImage = () => {
      const remainCount = 6 - formData.images.length;
      if (remainCount <= 0) {
        common_vendor.index.showToast({
          title: "最多上传6张图片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: remainCount,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          formData.images.push(...res.tempFilePaths);
        }
      });
    };
    const chooseVideo = () => {
      common_vendor.index.showToast({
        title: "视频功能开发中",
        icon: "none"
      });
    };
    const removeImage = (index) => {
      formData.images.splice(index, 1);
    };
    const previewImage = (index) => {
      common_vendor.index.previewImage({
        urls: formData.images,
        current: index
      });
    };
    const showEmojiPanel = () => {
      common_vendor.index.showToast({
        title: "表情功能开发中",
        icon: "none"
      });
    };
    const addLocation = () => {
      common_vendor.index.showToast({
        title: "位置功能开发中",
        icon: "none"
      });
    };
    const togglePrivacy = () => {
      formData.isPublic = !formData.isPublic;
    };
    const publishPost = () => {
      if (!canPublish.value) {
        return;
      }
      isPublishing.value = true;
      setTimeout(() => {
        isPublishing.value = false;
        common_vendor.index.showToast({
          title: "发布成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }, 2e3);
    };
    const onBackPress = () => {
      if (formData.content.trim() || formData.images.length > 0) {
        common_vendor.index.showModal({
          title: "提示",
          content: "确定要放弃编辑吗？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateBack();
            }
          }
        });
        return true;
      }
      return false;
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/community/publish.vue:294", "简约发布页面加载完成");
    });
    __expose({
      onBackPress
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o([($event) => formData.content = $event.detail.value, onContentInput]),
        b: common_vendor.o(onInputBlur),
        c: formData.content,
        d: showTagPanel.value
      }, showTagPanel.value ? {
        e: common_vendor.p({
          type: "close",
          size: "16",
          color: "#999"
        }),
        f: common_vendor.o(closeTagPanel),
        g: common_vendor.f(hotTags, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: index,
            c: common_vendor.o(($event) => selectTag(tag), index)
          };
        })
      } : {}, {
        h: selectedTags.value.length > 0
      }, selectedTags.value.length > 0 ? {
        i: common_vendor.f(selectedTags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: "354f064d-1-" + i0,
            c: common_vendor.o(($event) => removeTag(index), index),
            d: index
          };
        }),
        j: common_vendor.p({
          type: "close",
          size: "12",
          color: "#999"
        })
      } : {}, {
        k: formData.images.length > 0
      }, formData.images.length > 0 ? {
        l: common_vendor.f(formData.images, (image, index, i0) => {
          return {
            a: image,
            b: "354f064d-2-" + i0,
            c: common_vendor.o(($event) => removeImage(index), index),
            d: index,
            e: common_vendor.o(($event) => previewImage(index), index)
          };
        }),
        m: common_vendor.p({
          type: "close",
          color: "white",
          size: "14"
        }),
        n: common_vendor.n("grid-" + Math.min(formData.images.length, 4))
      } : {}, {
        o: common_vendor.p({
          type: "image",
          size: "24",
          color: "#4A90E2"
        }),
        p: common_vendor.o(chooseImage),
        q: common_vendor.p({
          type: "videocam",
          size: "24",
          color: "#50C878"
        }),
        r: common_vendor.o(chooseVideo),
        s: common_vendor.p({
          type: "location",
          size: "24",
          color: "#FF6B6B"
        }),
        t: common_vendor.o(addLocation),
        v: common_vendor.p({
          type: "compose",
          size: "24",
          color: "#FFD700"
        }),
        w: common_vendor.o(showEmojiPanel),
        x: common_vendor.p({
          type: formData.isPublic ? "eye" : "eye-slash",
          size: "16",
          color: formData.isPublic ? "#4A90E2" : "#999"
        }),
        y: common_vendor.o(togglePrivacy),
        z: common_vendor.o(publishPost),
        A: !canPublish.value,
        B: canPublish.value ? 1 : "",
        C: isPublishing.value
      }, isPublishing.value ? {
        D: common_vendor.p({
          status: "loading",
          ["content-text"]: loadingText
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-354f064d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/publish.js.map
