// 云函数：发送订阅消息
// 文件路径：cloudfunctions/sendSubscribeMessage/index.js

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 发送订阅消息
 * 
 * @param {string} openid - 接收用户的 openid（必填）
 * @param {string} templateId - 消息模板 ID（必填）
 * @param {object} data - 模板数据，字段名需与模板匹配（必填）
 * @param {string} page - 点击消息后跳转的页面路径（可选）
 * 
 * 模板数据示例（评论回复通知）：
 * {
 *   thing1: { value: '帖子标题' },
 *   thing2: { value: '回复内容' },
 *   time3: { value: '2024-01-01 12:00' }
 * }
 */
exports.main = async (event, context) => {
  const { openid, templateId, data, page } = event

  // 参数校验
  if (!openid || typeof openid !== 'string') {
    return { success: false, errCode: -1, errMsg: '缺少 openid 参数' }
  }
  if (!templateId || typeof templateId !== 'string') {
    return { success: false, errCode: -1, errMsg: '缺少 templateId 参数' }
  }
  if (!data || typeof data !== 'object') {
    return { success: false, errCode: -1, errMsg: '缺少 data 参数' }
  }

  // 防刷：不能给自己发通知
  const wxContext = cloud.getWXContext()
  if (openid === wxContext.OPENID) {
    return { success: false, errCode: -1, errMsg: '不能给自己发通知' }
  }

  // thing 类型字段截断保护（微信限制 20 字符）
  for (const key of Object.keys(data)) {
    if (key.startsWith('thing') && data[key].value && data[key].value.length > 20) {
      data[key].value = data[key].value.slice(0, 19) + '…'
    }
  }

  // 根据运行环境选择 miniprogramState
  // 正式版: 'formal', 开发版: 'developer', 体验版: 'trial'
  const envVersion = wxContext.ENV || 'prod'
  const miniprogramState = envVersion === 'prod' ? 'formal' : 'developer'

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: templateId,
      page: page || 'pages/index/index',
      data: data,
      miniprogramState: miniprogramState
    })

    return {
      success: true,
      msgId: result.msgId,
      errCode: result.errCode,
      errMsg: result.errMsg
    }
  } catch (err) {
    console.error('发送订阅消息失败', err.errCode, err.errMsg)

    // 常见错误码说明：
    // 43101 - 用户未授权该模板消息（最常见：作者从未点过"允许"）
    // 47003 - 模板字段不匹配
    // 41030 - page 路径不正确
    // 40003 - openid 无效

    return {
      success: false,
      errCode: err.errCode,
      errMsg: err.errMsg
    }
  }
}
