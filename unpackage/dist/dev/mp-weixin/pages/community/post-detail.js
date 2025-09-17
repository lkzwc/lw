"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_tag2 + _easycom_uni_icons2)();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_tag + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "post-detail",
  setup(__props) {
    const commentText = common_vendor.ref("");
    const inputFocus = common_vendor.ref(false);
    const postId = common_vendor.ref("");
    const postDetail = common_vendor.reactive({
      id: 1,
      username: "技术达人",
      avatar: "https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=U1",
      createTime: "2小时前",
      categoryName: "技术",
      title: "Vue 3 Composition API 最佳实践",
      content: "在实际项目开发中，Vue 3 的 Composition API 为我们提供了更灵活的代码组织方式。本文将分享一些在使用过程中总结的最佳实践和经验技巧。\n\n1. 合理使用 ref 和 reactive\n- ref 适用于基本数据类型\n- reactive 适用于对象和数组\n\n2. 组合式函数的抽取\n将相关的逻辑抽取到独立的组合式函数中，提高代码的复用性和可维护性。\n\n3. 生命周期钩子的使用\n在 setup 中使用 onMounted、onUpdated 等钩子函数。",
      images: [
        "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Code1",
        "https://via.placeholder.com/400x300/50C878/FFFFFF?text=Code2"
      ],
      likeCount: 24,
      isLiked: false
    });
    const commentList = common_vendor.reactive([
      {
        id: 1,
        username: "前端小白",
        avatar: "https://via.placeholder.com/40x40/50C878/FFFFFF?text=C1",
        createTime: "1小时前",
        content: "写得很好，学到了很多！特别是关于组合式函数的部分，之前一直不太理解。",
        likeCount: 3,
        isLiked: false,
        replies: [
          {
            id: 11,
            username: "技术达人",
            content: "谢谢支持！有问题可以随时交流",
            createTime: "30分钟前"
          }
        ]
      },
      {
        id: 2,
        username: "Vue爱好者",
        avatar: "https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=C2",
        createTime: "45分钟前",
        content: "请问在大型项目中，如何更好地组织这些组合式函数呢？",
        likeCount: 1,
        isLiked: true,
        replies: []
      },
      {
        id: 3,
        username: "代码新手",
        avatar: "https://via.placeholder.com/40x40/FFD700/FFFFFF?text=C3",
        createTime: "20分钟前",
        content: "收藏了，准备好好学习一下！",
        likeCount: 0,
        isLiked: false,
        replies: []
      }
    ]);
    const toggleLike = () => {
      postDetail.isLiked = !postDetail.isLiked;
      if (postDetail.isLiked) {
        postDetail.likeCount++;
      } else {
        postDetail.likeCount--;
      }
    };
    const toggleCommentLike = (comment) => {
      comment.isLiked = !comment.isLiked;
      if (comment.isLiked) {
        comment.likeCount = (comment.likeCount || 0) + 1;
      } else {
        comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1);
      }
    };
    const replyComment = (comment) => {
      commentText.value = `@${comment.username} `;
      inputFocus.value = true;
    };
    const sendComment = () => {
      if (!commentText.value.trim()) {
        return;
      }
      const newComment = {
        id: Date.now(),
        username: "当前用户",
        avatar: "https://via.placeholder.com/40x40/9370DB/FFFFFF?text=ME",
        createTime: "刚刚",
        content: commentText.value.trim(),
        likeCount: 0,
        isLiked: false,
        replies: []
      };
      commentList.unshift(newComment);
      commentText.value = "";
      common_vendor.index.showToast({
        title: "评论成功",
        icon: "success"
      });
    };
    const sharePost = () => {
      common_vendor.index.showActionSheet({
        itemList: ["分享到微信", "分享到朋友圈", "复制链接"],
        success: (res) => {
          common_vendor.index.showToast({
            title: "分享功能开发中",
            icon: "none"
          });
        }
      });
    };
    const previewImage = (images, current) => {
      common_vendor.index.previewImage({
        urls: images,
        current
      });
    };
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      postId.value = currentPage.options.id || "1";
      common_vendor.index.__f__("log", "at pages/community/post-detail.vue:265", "帖子详情页加载完成, ID:", postId.value);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: postDetail.avatar,
        b: common_vendor.t(postDetail.username),
        c: common_vendor.t(postDetail.createTime),
        d: common_vendor.p({
          text: postDetail.categoryName,
          type: "primary",
          size: "small"
        }),
        e: common_vendor.t(postDetail.title),
        f: common_vendor.t(postDetail.content),
        g: postDetail.images && postDetail.images.length > 0
      }, postDetail.images && postDetail.images.length > 0 ? {
        h: common_vendor.f(postDetail.images, (img, index, i0) => {
          return {
            a: index,
            b: img,
            c: common_vendor.o(($event) => previewImage(postDetail.images, index), index)
          };
        })
      } : {}, {
        i: common_vendor.p({
          type: postDetail.isLiked ? "heart-filled" : "heart",
          color: postDetail.isLiked ? "#ff6b6b" : "#999",
          size: "20"
        }),
        j: common_vendor.t(postDetail.likeCount),
        k: postDetail.isLiked ? 1 : "",
        l: common_vendor.o(toggleLike),
        m: common_vendor.p({
          type: "chatbubble",
          color: "#999",
          size: "20"
        }),
        n: common_vendor.t(commentList.length),
        o: common_vendor.p({
          type: "redo",
          color: "#999",
          size: "20"
        }),
        p: common_vendor.o(sharePost),
        q: common_vendor.t(commentList.length),
        r: common_vendor.f(commentList, (comment, index, i0) => {
          return common_vendor.e({
            a: comment.avatar,
            b: common_vendor.t(comment.username),
            c: common_vendor.t(comment.createTime),
            d: common_vendor.t(comment.content),
            e: comment.replies && comment.replies.length > 0
          }, comment.replies && comment.replies.length > 0 ? {
            f: common_vendor.f(comment.replies, (reply, replyIndex, i1) => {
              return {
                a: common_vendor.t(reply.username),
                b: common_vendor.t(reply.content),
                c: common_vendor.t(reply.createTime),
                d: reply.id
              };
            })
          } : {}, {
            g: "4bcdf8bd-4-" + i0,
            h: common_vendor.p({
              type: comment.isLiked ? "heart-filled" : "heart",
              color: comment.isLiked ? "#ff6b6b" : "#ccc",
              size: "14"
            }),
            i: common_vendor.t(comment.likeCount || 0),
            j: comment.isLiked ? 1 : "",
            k: common_vendor.o(($event) => toggleCommentLike(comment), comment.id),
            l: "4bcdf8bd-5-" + i0,
            m: common_vendor.o(($event) => replyComment(comment), comment.id),
            n: comment.id
          });
        }),
        s: common_vendor.p({
          type: "chatbubble",
          color: "#ccc",
          size: "14"
        }),
        t: inputFocus.value,
        v: common_vendor.o(($event) => inputFocus.value = false),
        w: commentText.value,
        x: common_vendor.o(($event) => commentText.value = $event.detail.value),
        y: common_vendor.o(sendComment),
        z: !commentText.value.trim()
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4bcdf8bd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/post-detail.js.map
