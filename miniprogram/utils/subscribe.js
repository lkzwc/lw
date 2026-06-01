/**
 * utils/subscribe.js - 订阅消息囤票公共模块
 *
 * 微信订阅消息机制：一次授权 = 一次发送配额（"票"）
 * 用户授权后，服务端可向该用户发一条订阅消息；用完需再次授权
 *
 * 囤票策略：
 *   - Tier 1（必囤）：评论提交后、帖子作者打开帖子时、活动报名后
 *   - Tier 2（低频囤票）：点赞、打开评论弹窗、转发（受频率控制）
 *
 * 关键限制：
 *   - wx.requestSubscribeMessage 必须在用户 tap 事件回调中调用
 *   - 不能在 onShow/onLoad 等生命周期中调用
 *   - 一次可传多个 tmplIds，弹一次窗囤多张票
 *
 * 频率控制：
 *   - Tier 2 场景 5 分钟内不重复弹窗，避免骚扰用户
 *   - Tier 1 场景（评论/报名）每次都弹，因为这些是用户明确意图
 */

const config = require('./config')

// 频率控制：存储 key 和冷却时间
const COOLDOWN_KEY = 'lastSubscribeTime'
const COOLDOWN_MS = 5 * 60 * 1000 // 5 分钟

/**
 * 尝试请求订阅授权（囤票）
 *
 * @param {Object} options
 * @param {string[]} options.tmplIds - 模板 ID 数组，一次传多个可一次囤多张票
 * @param {boolean} options.force - 是否强制请求（跳过频率控制），Tier 1 场景传 true
 * @param {Function} options.onAccept - 授权成功回调（可选）
 * @param {Function} options.onReject - 拒绝回调（可选）
 */
function trySubscribe(options) {
  const {
    tmplIds = [],
    force = false,
    onAccept,
    onReject
  } = options

  // 过滤掉空的模板 ID（比如 activityReminder 还没申请）
  const validTmplIds = tmplIds.filter(id => id && id.trim())
  if (validTmplIds.length === 0) return

  // 频率控制：非强制模式下，5 分钟内不重复弹窗
  if (!force) {
    const lastTime = wx.getStorageSync(COOLDOWN_KEY)
    if (lastTime && Date.now() - lastTime < COOLDOWN_MS) {
      // 冷却期内，跳过本次囤票
      return
    }
  }

  wx.requestSubscribeMessage({
    tmplIds: validTmplIds,
    success: (res) => {
      // 更新最后一次弹窗时间（无论用户同意或拒绝）
      wx.setStorageSync(COOLDOWN_KEY, Date.now())

      // 检查每个模板的授权结果
      let anyAccepted = false
      validTmplIds.forEach(tmplId => {
        if (res[tmplId] === 'accept') {
          anyAccepted = true
          recordSubscription(tmplId)
        }
      })

      if (anyAccepted && typeof onAccept === 'function') {
        onAccept()
      }
    },
    fail: (err) => {
      // 更新最后一次弹窗时间（弹窗失败也算一次，避免频繁重试）
      wx.setStorageSync(COOLDOWN_KEY, Date.now())

      console.error('[trySubscribe] 请求订阅授权失败', err)

      // errCode 20004 = 用户关闭了"总是询问"，引导去设置页
      if (err.errCode === 20004) {
        showSubscribeSettingGuide()
      }

      if (typeof onReject === 'function') {
        onReject(err)
      }
    }
  })
}

/**
 * 请求评论回复订阅授权（Tier 1 - 必囤）
 * 适用场景：用户提交评论后，为自己的评论囤一张票
 * 这样别人回复该评论时，才能发通知给评论者
 *
 * @param {boolean} force - 是否强制（默认 true，评论是明确意图，不跳过）
 */
function requestCommentReplySubscribe(force = true) {
  const commentReplyId = config.subscribeTemplates.commentReply
  if (!commentReplyId) return

  trySubscribe({
    tmplIds: [commentReplyId],
    force,
    onAccept: () => {
      console.log('[subscribe] 评论回复授权成功，已囤票')
    }
  })
}

/**
 * 请求活动提醒订阅授权（Tier 1 - 必囤）
 * 适用场景：用户报名活动成功后
 *
 * @param {boolean} force - 是否强制（默认 true）
 */
function requestActivityReminderSubscribe(force = true) {
  const activityReminderId = config.subscribeTemplates.activityReminder
  const commentReplyId = config.subscribeTemplates.commentReply

  if (!activityReminderId && !commentReplyId) return

  // 一次弹窗囤两张票：活动提醒 + 评论回复
  const tmplIds = [activityReminderId, commentReplyId].filter(id => id && id.trim())

  trySubscribe({
    tmplIds,
    force,
    onAccept: () => {
      console.log('[subscribe] 活动提醒/评论回复授权成功，已囤票')
    }
  })
}

/**
 * 低频囤票（Tier 2 - 点赞/打开评论弹窗等）
 * 受 5 分钟频率控制，避免频繁弹窗骚扰用户
 * 一次请求评论回复+活动提醒两个模板
 */
function requestLowFrequencySubscribe() {
  const commentReplyId = config.subscribeTemplates.commentReply
  const activityReminderId = config.subscribeTemplates.activityReminder

  // 合并有效的模板 ID
  const tmplIds = [commentReplyId, activityReminderId].filter(id => id && id.trim())
  if (tmplIds.length === 0) return

  trySubscribe({
    tmplIds,
    force: false // 受频率控制
  })
}

/**
 * 记录用户订阅授权到 subscriptions 表
 * 用于后续统计和分析
 *
 * @param {string} templateId - 模板 ID
 */
async function recordSubscription(templateId) {
  try {
    const db = wx.cloud.database()
    await db.collection('subscriptions').add({
      data: {
        templateId,
        type: 'subscribe',
        acceptTime: db.serverDate(),
        used: false
      }
    })
  } catch (err) {
    // subscriptions 表可能不存在，静默失败
    console.error('[recordSubscription] 记录失败', err)
  }
}

/**
 * 用户关闭了"总是询问"，引导去设置页重新开启
 */
function showSubscribeSettingGuide() {
  wx.showModal({
    title: '开启消息通知',
    content: '您已关闭通知授权，如需接收评论回复通知，请在设置中开启',
    confirmText: '去设置',
    cancelText: '暂不',
    success: (res) => {
      if (res.confirm) {
        wx.openSetting()
      }
    }
  })
}

module.exports = {
  trySubscribe,
  requestCommentReplySubscribe,
  requestActivityReminderSubscribe,
  requestLowFrequencySubscribe,
  recordSubscription,
  showSubscribeSettingGuide
}
