// 云函数：内容安全检测
// cloudfunctions/checkContent/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: event.content
    })
    
    return {
      errCode: result.errCode,
      errMsg: result.errMsg
    }
  } catch (err) {
    console.error('内容安全检测失败', err)
    return {
      errCode: -1,
      errMsg: err.message || '检测失败'
    }
  }
}