// pages/notice-detail/notice-detail.js - 公告详情（Markdown渲染）
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    statusBarHeight: 20,
    notice: null,
    renderedContent: [],
    loading: true
  },

  onLoad: function (options) {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight })

    if (options.id) {
      this.loadNotice(options.id)
    }
  },

  // 加载公告
  loadNotice: async function (id) {
    this.setData({ loading: true })
    try {
      const res = await db.collection('notices').doc(id).get()
      const notice = res.data
      notice.dateStr = this.formatDate(notice.createTime)

      // 渲染Markdown内容
      const renderedContent = this.renderMarkdown(notice.content || '')

      this.setData({
        notice,
        renderedContent,
        loading: false
      })
    } catch (err) {
      console.error('加载公告失败', err)
      util.showToast('加载失败')
      wx.navigateBack()
    }
  },

  // 简易Markdown渲染器
  renderMarkdown: function (md) {
    if (!md) return []
    const lines = md.split('\n')
    const result = []

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]

      // 空行跳过
      if (!line.trim()) continue

      // 分割线
      if (/^---+$/.test(line.trim())) {
        result.push({ type: 'hr' })
        continue
      }

      // H2
      if (line.startsWith('## ')) {
        result.push({ type: 'h2', text: line.replace(/^## /, '') })
        continue
      }

      // H3
      if (line.startsWith('### ')) {
        result.push({ type: 'h3', text: line.replace(/^### /, '') })
        continue
      }

      // 列表项
      if (/^[-*]\s/.test(line.trim())) {
        result.push({ type: 'li', text: line.trim().replace(/^[-*]\s/, '') })
        continue
      }

      // 图片
      const imgMatch = line.match(/!\[.*?\]\((.*?)\)/)
      if (imgMatch) {
        result.push({ type: 'image', src: imgMatch[1] })
        continue
      }

      // 段落（支持加粗）
      const segments = this.parseInline(line)
      result.push({ type: 'p', segments })
    }

    return result
  },

  // 解析行内格式（加粗）
  parseInline: function (text) {
    const segments = []
    const regex = /\*\*(.*?)\*\*/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: text.slice(lastIndex, match.index), bold: false })
      }
      segments.push({ text: match[1], bold: true })
      lastIndex = regex.lastIndex
    }

    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), bold: false })
    }

    return segments.length > 0 ? segments : [{ text, bold: false }]
  },

  // 格式化日期
  formatDate: function (timestamp) {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },

  // 图片预览
  onImageTap: function (e) {
    const src = e.currentTarget.dataset.src
    wx.previewImage({ current: src, urls: [src] })
  },

  // 返回
  onBackTap: function () {
    wx.navigateBack({
      delta: 1,
      fail: () => { wx.switchTab({ url: '/pages/index/index' }) }
    })
  }
})
