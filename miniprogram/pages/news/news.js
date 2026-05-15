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
      
      // 失败时使用模拟数据
      const mockNews = this.data.currentTab === 'domestic' ? [
        { id: 1, title: '我国经济持续稳定恢复 主要指标符合预期', source: '新华社', time: '1小时前', cover: '', url: '' },
        { id: 2, title: '全国多地推出便民服务新举措', source: '人民日报', time: '2小时前', cover: '', url: '' },
        { id: 3, title: '科技创新助力产业升级转型', source: '央视新闻', time: '3小时前', cover: '', url: '' },
        { id: 4, title: '教育改革取得新进展', source: '教育部', time: '4小时前', cover: '', url: '' },
        { id: 5, title: '医疗健康服务惠及更多群众', source: '健康报', time: '5小时前', cover: '', url: '' }
      ] : [
        { id: 1, title: '全球合作推动经济复苏进程', source: '新华社', time: '1小时前', cover: '', url: '' },
        { id: 2, title: '国际社会关注气候变化议题', source: '央视新闻', time: '2小时前', cover: '', url: '' },
        { id: 3, title: '多国加强科技领域合作', source: '人民日报', time: '3小时前', cover: '', url: '' },
        { id: 4, title: '国际贸易呈现新趋势', source: '经济日报', time: '4小时前', cover: '', url: '' },
        { id: 5, title: '文化交流促进民心相通', source: '光明日报', time: '5小时前', cover: '', url: '' }
      ]

      this.setData({ newsList: mockNews })
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
