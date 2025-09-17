"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_search_bar2 + _easycom_uni_tag2 + _easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_search_bar = () => "../../uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_tag + _easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "community",
  setup(__props) {
    const currentCategory = common_vendor.ref("all");
    const searchKeyword = common_vendor.ref("");
    const loadStatus = common_vendor.ref("more");
    const categoryList = common_vendor.reactive([
      { id: "all", name: "全部" },
      { id: "tech", name: "技术" },
      { id: "life", name: "生活" },
      { id: "study", name: "学习" },
      { id: "entertainment", name: "娱乐" },
      { id: "health", name: "健康" }
    ]);
    const postList = common_vendor.reactive([
      {
        id: 1,
        username: "技术达人",
        avatar: "https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=U1",
        createTime: "2小时前",
        categoryName: "技术",
        title: "Vue 3 Composition API 最佳实践",
        content: "分享一些在实际项目中使用 Vue 3 Composition API 的经验和技巧，希望对大家有帮助。",
        images: [
          "https://via.placeholder.com/200x150/4A90E2/FFFFFF?text=Code1",
          "https://via.placeholder.com/200x150/50C878/FFFFFF?text=Code2"
        ],
        likeCount: 24,
        commentCount: 8,
        isLiked: false
      },
      {
        id: 2,
        username: "生活家",
        avatar: "https://via.placeholder.com/60x60/50C878/FFFFFF?text=U2",
        createTime: "5小时前",
        categoryName: "生活",
        title: "周末的美好时光",
        content: "和朋友一起去公园散步，享受阳光和自然的美好。生活中的小确幸总是让人感到温暖。",
        images: [
          "https://via.placeholder.com/200x150/50C878/FFFFFF?text=Life1"
        ],
        likeCount: 15,
        commentCount: 3,
        isLiked: true
      },
      {
        id: 3,
        username: "学习者",
        avatar: "https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=U3",
        createTime: "1天前",
        categoryName: "学习",
        title: "如何高效学习新技能",
        content: "分享一些学习方法和技巧，包括时间管理、记忆方法等。",
        images: [],
        likeCount: 32,
        commentCount: 12,
        isLiked: false
      },
      {
        id: 4,
        username: "健康专家",
        avatar: "https://via.placeholder.com/60x60/FFD700/FFFFFF?text=U4",
        createTime: "2天前",
        categoryName: "健康",
        title: "每日运动打卡",
        content: "坚持运动第30天！今天完成了5公里跑步和30分钟力量训练。",
        images: [
          "https://via.placeholder.com/200x150/FFD700/FFFFFF?text=Sport1",
          "https://via.placeholder.com/200x150/FF69B4/FFFFFF?text=Sport2",
          "https://via.placeholder.com/200x150/9370DB/FFFFFF?text=Sport3",
          "https://via.placeholder.com/200x150/32CD32/FFFFFF?text=Sport4"
        ],
        likeCount: 18,
        commentCount: 6,
        isLiked: false
      }
    ]);
    const onSearchInput = (value) => {
      searchKeyword.value = value;
      common_vendor.index.__f__("log", "at pages/community/community.vue:192", "搜索关键词:", value);
    };
    const switchCategory = (categoryId) => {
      currentCategory.value = categoryId;
      common_vendor.index.__f__("log", "at pages/community/community.vue:199", "切换分类:", categoryId);
    };
    const toggleLike = (post) => {
      post.isLiked = !post.isLiked;
      if (post.isLiked) {
        post.likeCount++;
      } else {
        post.likeCount--;
      }
      common_vendor.index.__f__("log", "at pages/community/community.vue:211", "点赞操作:", post.id, post.isLiked);
    };
    const sharePost = (post) => {
      common_vendor.index.showActionSheet({
        itemList: ["分享到微信", "分享到朋友圈", "复制链接"],
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/community/community.vue:219", "分享选择:", res.tapIndex, post.id);
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
    const goToDetail = (post) => {
      common_vendor.index.navigateTo({
        url: `/pages/community/post-detail?id=${post.id}`
      });
    };
    const goToPublish = () => {
      common_vendor.index.navigateTo({
        url: "/pages/community/publish"
      });
    };
    const loadMore = () => {
      if (loadStatus.value === "loading" || loadStatus.value === "noMore") {
        return;
      }
      loadStatus.value = "loading";
      setTimeout(() => {
        common_vendor.index.__f__("log", "at pages/community/community.vue:261", "加载更多数据");
        loadStatus.value = "more";
      }, 1500);
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/community/community.vue:267", "社区页面加载完成");
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(onSearchInput),
        b: common_vendor.p({
          placeholder: "搜索帖子内容...",
          focus: false,
          ["bg-color"]: "#f5f5f5",
          ["cancel-button"]: "none"
        }),
        c: common_vendor.f(categoryList, (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: index,
            c: currentCategory.value === item.id ? 1 : "",
            d: common_vendor.o(($event) => switchCategory(item.id), index)
          };
        }),
        d: common_vendor.f(postList, (post, index, i0) => {
          return common_vendor.e({
            a: post.avatar,
            b: common_vendor.t(post.username),
            c: common_vendor.t(post.createTime),
            d: "a6ef5318-1-" + i0,
            e: common_vendor.p({
              text: post.categoryName,
              type: "primary",
              size: "small"
            }),
            f: common_vendor.t(post.title),
            g: post.content
          }, post.content ? {
            h: common_vendor.t(post.content)
          } : {}, {
            i: post.images && post.images.length > 0
          }, post.images && post.images.length > 0 ? common_vendor.e({
            j: common_vendor.f(post.images.slice(0, 3), (img, imgIndex, i1) => {
              return {
                a: imgIndex,
                b: img,
                c: common_vendor.o(($event) => previewImage(post.images, imgIndex), imgIndex)
              };
            }),
            k: post.images.length === 1 ? 1 : "",
            l: post.images.length > 3
          }, post.images.length > 3 ? {
            m: common_vendor.t(post.images.length - 3)
          } : {}) : {}, {
            n: "a6ef5318-2-" + i0,
            o: common_vendor.p({
              type: post.isLiked ? "heart-filled" : "heart",
              color: post.isLiked ? "#ff6b6b" : "#999",
              size: "18"
            }),
            p: common_vendor.t(post.likeCount || 0),
            q: post.isLiked ? 1 : "",
            r: common_vendor.o(($event) => toggleLike(post), post.id),
            s: "a6ef5318-3-" + i0,
            t: common_vendor.t(post.commentCount || 0),
            v: common_vendor.o(($event) => goToDetail(post), post.id),
            w: "a6ef5318-4-" + i0,
            x: common_vendor.o(($event) => sharePost(post), post.id),
            y: post.id,
            z: common_vendor.o(($event) => goToDetail(post), post.id)
          });
        }),
        e: common_vendor.p({
          type: "chatbubble",
          color: "#999",
          size: "18"
        }),
        f: common_vendor.p({
          type: "redo",
          color: "#999",
          size: "18"
        }),
        g: common_vendor.o(loadMore),
        h: common_vendor.p({
          status: loadStatus.value
        }),
        i: common_vendor.p({
          type: "plus",
          color: "white",
          size: "24"
        }),
        j: common_vendor.o(goToPublish)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a6ef5318"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
