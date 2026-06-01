// pages/news/news.js
Page({
  data: {
    url: 'https://newsnow.busiyi.world/'
  },

  onLoad: function (options) {
    // 支持从外部传入 url
    if (options.url) {
      this.setData({ url: decodeURIComponent(options.url) })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '新闻资讯 - 邻里圈',
      path: '/pages/news/news'
    }
  }
})
