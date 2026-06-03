/**
 * 一次性迁移脚本：把 activities 集合里 joinedUsers 字段迁移为 joinedBy
 *
 * 使用方法（云开发控制台 → 数据库 → 导出 JSON 手动处理，
 * 或在微信开发者工具的云函数中直接调用以下逻辑）：
 *
 * 推荐方式：复制 main() 内容到云开发控制台的"脚本"功能，或创建临时云函数运行一次。
 *
 * 逻辑：
 *   1. 查所有含 joinedUsers 字段的 activities 文档
 *   2. 将 joinedUsers 内容复制到 joinedBy（合并去重）
 *   3. 清空 joinedUsers 字段（设为 null/删除）
 */

// ====== 云函数版（复制到临时云函数 index.js 的 main 中）======
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  // 查询所有活动文档（云函数端不受权限限制）
  const { data: activities } = await db
    .collection('activities')
    .where({ status: _.neq('deleted') })
    .limit(100)
    .get()

  let migrated = 0
  let skipped = 0
  const errors = []

  for (const act of activities) {
    const hasJoinedUsers = Array.isArray(act.joinedUsers) && act.joinedUsers.length > 0
    const hasJoinedBy = Array.isArray(act.joinedBy)

    if (!hasJoinedUsers) {
      // 没有旧字段，确保 joinedBy 存在
      if (!hasJoinedBy) {
        await db.collection('activities').doc(act._id).update({
          data: { joinedBy: [] }
        })
        migrated++
      } else {
        skipped++
      }
      continue
    }

    // 合并去重
    const existing = hasJoinedBy ? act.joinedBy : []
    const merged = [...new Set([...existing, ...act.joinedUsers])]

    try {
      await db.collection('activities').doc(act._id).update({
        data: {
          joinedBy: merged,
          joinedUsers: _.remove() // 删除旧字段
        }
      })
      migrated++
      console.log(`[OK] ${act._id}: joinedUsers(${act.joinedUsers.length}) → joinedBy(${merged.length})`)
    } catch (err) {
      errors.push({ id: act._id, err: err.message })
      console.error(`[ERR] ${act._id}:`, err.message)
    }
  }

  return {
    total: activities.length,
    migrated,
    skipped,
    errors
  }
}
