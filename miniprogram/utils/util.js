// utils/util.js - 工具函数

/**
 * 格式化时间
 * 兼容云数据库 serverDate 对象（{$date: timestamp}）、Date 对象、时间戳、字符串
 */
const formatTime = (input) => {
  let date
  if (!input) return ''
  if (input instanceof Date) {
    date = input
  } else if (typeof input === 'object' && input.$date) {
    // 云数据库 serverDate 格式
    date = new Date(input.$date)
  } else {
    date = new Date(input)
  }
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 按模板格式化日期
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date)
  const values = {
    YYYY: d.getFullYear(),
    MM: formatNumber(d.getMonth() + 1),
    DD: formatNumber(d.getDate()),
    HH: formatNumber(d.getHours()),
    mm: formatNumber(d.getMinutes()),
    ss: formatNumber(d.getSeconds())
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, key => values[key])
}

/**
 * 格式化相对时间
 * 兼容云数据库 serverDate 对象
 */
const formatRelativeTime = (input) => {
  if (!input) return ''
  let date
  if (input instanceof Date) {
    date = input
  } else if (typeof input === 'object' && input.$date) {
    date = new Date(input.$date)
  } else {
    date = new Date(input)
  }
  if (isNaN(date.getTime())) return ''

  const now = new Date()
  const diff = now - date

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

/**
 * 防抖函数
 */
const debounce = (fn, delay = 500) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
const throttle = (fn, delay = 500) => {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

/**
 * 内容安全检测
 */
const checkContentSecurity = async (content) => {
  try {
    const res = await wx.cloud.callFunction({
      name: 'checkContent',
      data: { content }
    })
    return res.result.errCode === 0
  } catch (err) {
    console.error('内容安全检测失败', err)
    return true
  }
}

/**
 * 显示加载提示
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true })
}

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示提示消息
 */
const showToast = (title, icon = 'none') => {
  wx.showToast({ title, icon, duration: 2000 })
}

/**
 * 显示确认对话框
 */
const showConfirm = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 复制文本到剪贴板
 */
const copyText = (text) => {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        showToast('已复制')
        resolve()
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 拨打电话
 */
const makePhoneCall = (phoneNumber) => {
  wx.makePhoneCall({
    phoneNumber,
    fail: (err) => {
      if (err.errMsg !== 'makePhoneCall:fail user cancel') {
        showToast('拨打电话失败')
      }
    }
  })
}

/**
 * 预览图片
 */
const previewImage = (urls, current = '') => {
  wx.previewImage({
    urls,
    current
  })
}

module.exports = {
  formatTime,
  formatDate,
  formatRelativeTime,
  debounce,
  checkContentSecurity,
  showLoading,
  hideLoading,
  showToast,
  showConfirm,
  copyText,
  makePhoneCall,
  previewImage
}
