// 云函数：发送订阅消息
// 文件路径：cloudfunctions/sendSubscribeMessage/index.js

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 发送订阅消息
 * 
 * @param {string} openid - 接收用户的openid
 * @param {string} templateId - 消息模板ID
 * @param {object} data - 模板数据，字段名需与模板匹配
 * @param {string} page - 点击消息后跳转的页面路径
 * 
 * 模板数据示例（根据实际模板调整）：
 * {
 *   thing1: { value: '帖子标题' },
 *   thing2: { value: '回复内容' },
 *   time3: { value: '2024-01-01 12:00' }
 * }
 */
exports.main = async (event, context) => {
  const { openid, templateId, data, page } = event
  
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: templateId,
      page: page || 'pages/index/index',
      data: data,
      miniprogramState: 'formal' // formal-正式版, developer-开发版, trial-体验版
    })
    
    console.log('发送成功', result)
    return {
      success: true,
      msgId: result.msgId,
      errCode: result.errCode,
      errMsg: result.errMsg
    }
  } catch (err) {
    console.error('发送失败', err)
    return {
      success: false,
      errCode: err.errCode,
      errMsg: err.errMsg
    }
  }
}