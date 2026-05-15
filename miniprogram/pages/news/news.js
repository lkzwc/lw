// pages/news/news.js
const util = require('../../utils/util')

Page({
  data: {
    currentTab: 'domestic',
    newsList: [],
    loading: false
  },

  onLoad: function (options) {
    this.loadNews()
  },

  onPullDownRefresh: function () {
    this.loadNews().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 切换标签
  onTabChange: function (e) {
    const tab = e.currentTarget.dataset.tab
    if (tab !== this.data.currentTab) {
      this.setData({ currentTab: tab })
      this.loadNews()
    }
  },

  // 加载新闻
  loadNews: async function () {
    this.setData({ loading: true, newsList: [] })

    try {
      const type = this.data.currentTab === 'domestic' ? 'guonei' : 'world'
      
      // 使用天行数据API（需要注册获取免费key）
      // 或者使用其他免费新闻API
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://api.tianapi.com/txapi/' + type + '/index',
          data: {
            key: 'your_api_key', // 替换为你的API key
            num: 10
          },
          success: (res) => {
            if (res.data.code === 200) {
              resolve(res.data.newslist || [])
            } else {
              reject(new Error(res.data.msg || '获取失败'))
            }
          },
          fail: reject
        })
      })

      const newsList = res.map((item, index) => ({
        id: item.id || index,
        title: item.title,
        source: item.source || '网络',
        time: item.ctime || '',
        cover: item.picUrl || '',
        url: item.url || ''
      }))

      this.setData({ newsList })
    } catch (err) {
      console.error('加载新闻失败', err)
      util.showToast('加载失败，请下拉刷新')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 点击新闻
  onNewsTap: function (e) {
    const { url, title } = e.currentTarget.dataset
    
    if (url) {
      // 如果有链接，跳转到webview
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
      })
    } else {
      // 否则显示详情弹窗
      wx.showModal({
        title: '新闻详情',
        content: title,
        showCancel: false,
        confirmText: '知道了'
      })
    }
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '新闻资讯 - 邻里圈',
      path: '/pages/news/news'
    }
  }
})
