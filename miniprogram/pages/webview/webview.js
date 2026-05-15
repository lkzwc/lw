// pages/webview/webview.js
Page({
  data: {
    url: ''
  },

  onLoad: function (options) {
    const url = decodeURIComponent(options.url || '')
    this.setData({ url })
  }
})