// utils/api.js - 云数据库操作封装

const db = wx.cloud.database()
const _ = db.command

/**
 * 帖子相关操作
 */
const postApi = {
  // 获取帖子列表
  getList: async (params = {}) => {
    const { page = 1, pageSize = 10, tag } = params
    const skip = (page - 1) * pageSize

    const condition = {
      status: _.neq('deleted')
    }

    if (tag) {
      condition.tags = tag
    }

    const query = db.collection('posts').where(condition)

    const countRes = await query.count()
    const listRes = await query
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    listRes.data = listRes.data.map(post => ({
      ...post,
      tag: post.tag || (post.tags && post.tags[0]) || ''
    }))

    // 获取所有帖子的 openid
    const openids = [...new Set(listRes.data.map(post => post._openid))]

    // 批量查询用户信息
    if (openids.length > 0) {
      const usersRes = await db.collection('users')
        .where({
          _openid: _.in(openids)
        })
        .field({
          _openid: true,
          nickName: true,
          avatarUrl: true
        })
        .get()

      // 构建 openid -> userInfo 的映射
      const userMap = {}
      usersRes.data.forEach(user => {
        userMap[user._openid] = {
          nickName: user.nickName,
          avatarUrl: user.avatarUrl
        }
      })

      // 将最新的用户信息附加到帖子
      listRes.data = listRes.data.map(post => ({
        ...post,
        userInfo: userMap[post._openid] || post.userInfo || {}
      }))
    }

    return {
      list: listRes.data,
      total: countRes.total,
      hasMore: skip + listRes.data.length < countRes.total
    }
  },

  // 获取帖子详情
  getDetail: async (postId) => {
    const res = await db.collection('posts').doc(postId).get()
    const post = res.data

    // 获取作者最新用户信息
    if (post._openid) {
      const userRes = await db.collection('users')
        .where({ _openid: post._openid })
        .field({
          _openid: true,
          nickName: true,
          avatarUrl: true
        })
        .get()

      if (userRes.data.length > 0) {
        post.userInfo = {
          nickName: userRes.data[0].nickName,
          avatarUrl: userRes.data[0].avatarUrl
        }
      }
    }

    return post
  },

  // 发布帖子
  create: async (data) => {
    // 获取当前用户信息
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}

    const res = await db.collection('posts').add({
      data: {
        ...data,
        userInfo: {
          nickName: userInfo.nickName || '邻居',
          avatarUrl: userInfo.avatarUrl || ''
        },
        status: 'active',
        likeCount: 0,
        likedBy: [],
        commentCount: 0,
        shareCount: 0,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    return res._id
  },

  // 删除帖子
  delete: async (postId) => {
    await db.collection('posts').doc(postId).update({
      data: {
        status: 'deleted',
        updateTime: db.serverDate()
      }
    })
  },

  // 点赞帖子（likedBy 数组方式，一次 update 搞定）
  like: async (postId, openid) => {
    const doc = await db.collection('posts').doc(postId).get()
    const likedBy = doc.data.likedBy || []

    if (likedBy.includes(openid)) {
      // 取消点赞
      await db.collection('posts').doc(postId).update({
        data: {
          likedBy: _.pull(openid),
          likeCount: _.inc(-1)
        }
      })
      return false
    } else {
      // 点赞
      await db.collection('posts').doc(postId).update({
        data: {
          likedBy: _.addToSet(openid),
          likeCount: _.inc(1)
        }
      })
      return true
    }
  },

  // 检查是否已点赞（直接从文档 likedBy 数组判断，无需额外查询）
  checkLiked: (post, openid) => {
    const likedBy = post.likedBy || []
    return likedBy.includes(openid)
  },

  // 搜索帖子
  search: async (keyword, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize

    const res = await db.collection('posts')
      .where({
        status: _.neq('deleted'),
        content: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取所有帖子的 openid
    const openids = [...new Set(res.data.map(post => post._openid))]

    // 批量查询用户信息
    if (openids.length > 0) {
      const usersRes = await db.collection('users')
        .where({
          _openid: _.in(openids)
        })
        .field({
          _openid: true,
          nickName: true,
          avatarUrl: true
        })
        .get()

      // 构建 openid -> userInfo 的映射
      const userMap = {}
      usersRes.data.forEach(user => {
        userMap[user._openid] = {
          nickName: user.nickName,
          avatarUrl: user.avatarUrl
        }
      })

      // 将最新的用户信息附加到帖子
      res.data = res.data.map(post => ({
        ...post,
        userInfo: userMap[post._openid] || post.userInfo || {}
      }))
    }

    return res.data
  },

  // ===== 内嵌评论（posts 文档内 comments 数组） =====

  // 获取帖子的评论列表
  getComments: async (postId) => {
    const res = await db.collection('posts').doc(postId).field({ comments: true }).get()
    return (res.data && res.data.comments) || []
  },

  // 添加评论
  addComment: async (postId, content, options = {}) => {
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}
    const now = Date.now()
    const _id = now.toString() + '_' + Math.random().toString(36).substr(2, 6)

    const newComment = {
      _id,
      userId: app.globalData.openid || '',
      nickName: userInfo.nickName || '邻居',
      avatar: userInfo.avatarUrl || '',
      content,
      parentId: options.parentId || null,
      replyToName: options.replyToName || '',
      time: now
    }

    await db.collection('posts').doc(postId).update({
      data: {
        comments: _.push([newComment]),
        commentCount: _.inc(1),
        updateTime: db.serverDate()
      }
    })
    return newComment
  },

  // 删除评论
  deleteComment: async (postId, commentId) => {
    const post = await db.collection('posts').doc(postId).field({ comments: true }).get()
    const comments = (post.data.comments || []).filter(c => c._id !== commentId)
    await db.collection('posts').doc(postId).update({
      data: { comments, commentCount: _.inc(-1), updateTime: db.serverDate() }
    })
  }
}

/**
 * 评论操作（已迁移到内嵌方案，此模块保留兼容）
 */
/**
 * 评论操作（内嵌方案，委托给 postApi）
 */
const commentApi = {
  getList: async (postId) => {
    return await postApi.getComments(postId)
  },

  create: async (data) => {
    return await postApi.addComment(data.postId, data.content, {
      parentId: data.parentId || null,
      replyToName: data.replyToName || ''
    })
  },

  delete: async (commentId, postId) => {
    return await postApi.deleteComment(postId, commentId)
  },

  reply: async (data) => {
    return await commentApi.create({
      ...data,
      parentId: data.parentId,
      replyToName: data.replyToName
    })
  }
}

/**
 * 技能墙相关操作
 */
const skillApi = {
  // 获取技能列表
  getList: async (params = {}) => {
    const { page = 1, pageSize = 10, category, keyword, showHome } = params
    const skip = (page - 1) * pageSize

    const condition = {
      status: _.neq('deleted')
    }

    if (category) {
      condition.category = category
    }

    if (keyword) {
      condition.title = db.RegExp({
        regexp: keyword,
        options: 'i'
      })
    }

    if (showHome !== undefined) {
      condition.showHome = true
    }

    const query = db.collection('skills').where(condition)

    const countRes = await query.count()

    const listRes = await query
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取所有技能的 openid
    const openids = [...new Set(listRes.data.map(skill => skill._openid))]

    // 批量查询用户信息
    if (openids.length > 0) {
      const usersRes = await db.collection('users')
        .where({
          _openid: _.in(openids)
        })
        .field({
          _openid: true,
          nickName: true,
          avatarUrl: true
        })
        .get()

      // 构建 openid -> userInfo 的映射
      const userMap = {}
      usersRes.data.forEach(user => {
        userMap[user._openid] = {
          nickName: user.nickName,
          avatarUrl: user.avatarUrl
        }
      })

      // 将最新的用户信息附加到技能
      listRes.data = listRes.data.map(skill => ({
        ...skill,
        userInfo: userMap[skill._openid] || skill.userInfo || {}
      }))
    }

    return {
      list: listRes.data,
      total: countRes.total,
      hasMore: skip + listRes.data.length < countRes.total
    }
  },

  // 获取技能详情
  getDetail: async (skillId) => {
    const res = await db.collection('skills').doc(skillId).get()
    const skill = res.data

    // 获取作者最新用户信息
    if (skill._openid) {
      const userRes = await db.collection('users')
        .where({ _openid: skill._openid })
        .field({
          _openid: true,
          nickName: true,
          avatarUrl: true
        })
        .get()

      if (userRes.data.length > 0) {
        skill.userInfo = {
          nickName: userRes.data[0].nickName,
          avatarUrl: userRes.data[0].avatarUrl
        }
      }
    }

    return skill
  },

  // 点赞 / 取消点赞（likedBy 数组方式）
  like: async (skillId, openid) => {
    const doc = await db.collection('skills').doc(skillId).get()
    const likedBy = doc.data.likedBy || []

    if (likedBy.includes(openid)) {
      // 取消点赞
      await db.collection('skills').doc(skillId).update({
        data: {
          likedBy: _.pull(openid),
          likeCount: _.inc(-1)
        }
      })
      return false
    } else {
      // 点赞
      await db.collection('skills').doc(skillId).update({
        data: {
          likedBy: _.addToSet(openid),
          likeCount: _.inc(1)
        }
      })
      return true
    }
  },

  // 检查是否已点赞（直接从文档 likedBy 数组判断）
  checkLiked: (skill, openid) => {
    const likedBy = skill.likedBy || []
    return likedBy.includes(openid)
  },

  // 发布技能
  create: async (data) => {
    // 获取当前用户信息
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}


    const res = await db.collection('skills').add({
      data: {
        ...data,
        userInfo: {
          nickName: userInfo.nickName || '邻居',
          avatarUrl: userInfo.avatarUrl || ''
        },
        status: 'active',
        viewCount: 0,
        likeCount: 0,
        likedBy: [],
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    return res._id
  },

  // 更新技能
  update: async (skillId, data) => {
    await db.collection('skills').doc(skillId).update({
      data: {
        ...data,
        updateTime: db.serverDate()
      }
    })
  },

  // 删除技能
  delete: async (skillId) => {
    await db.collection('skills').doc(skillId).update({
      data: {
        status: 'deleted',
        updateTime: db.serverDate()
      }
    })
  },

  // 增加浏览量
  addView: async (skillId) => {
    await db.collection('skills').doc(skillId).update({
      data: {
        viewCount: _.inc(1)
      }
    })
  }
}

/**
 * 用户相关操作
 */
const userApi = {
  // 获取用户信息
  getInfo: async (openid) => {
    const res = await db.collection('users').where({
      _openid: openid
    }).get()
    return res.data[0]
  },

  // 更新用户信息
  update: async (data) => {
    const userInfo = await userApi.getInfo()
    if (userInfo) {
      await db.collection('users').doc(userInfo._id).update({
        data: {
          ...data,
          updateTime: db.serverDate()
        }
      })
    }
  },

  // 获取我的帖子
  getMyPosts: async (openid, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize

    const res = await db.collection('posts')
      .where({
        _openid: openid,
        status: _.neq('deleted')
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取用户最新信息
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .field({
        _openid: true,
        nickName: true,
        avatarUrl: true
      })
      .get()

    const userInfo = userRes.data.length > 0 ? {
      nickName: userRes.data[0].nickName,
      avatarUrl: userRes.data[0].avatarUrl
    } : {}

    // 将最新的用户信息附加到帖子
    res.data = res.data.map(post => ({
      ...post,
      userInfo
    }))

    return res.data
  },

  // 获取我的技能
  getMySkills: async (openid, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize

    const res = await db.collection('skills')
      .where({
        _openid: openid,
        status: _.neq('deleted')
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取用户最新信息
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .field({
        _openid: true,
        nickName: true,
        avatarUrl: true
      })
      .get()

    const userInfo = userRes.data.length > 0 ? {
      nickName: userRes.data[0].nickName,
      avatarUrl: userRes.data[0].avatarUrl
    } : {}

    // 将最新的用户信息附加到技能
    res.data = res.data.map(skill => ({
      ...skill,
      userInfo
    }))

    return res.data
  },

  // 获取我的点赞（从 posts 的 likedBy 数组查找）
  getMyLikes: async (openid, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize

    const res = await db.collection('posts')
      .where({
        likedBy: openid,
        status: _.neq('deleted')
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    return res.data
  },

  // 获取我的拼车
  getMyCarpools: async (openid, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize

    const res = await db.collection('carpools')
      .where({
        _openid: openid,
        status: _.neq('deleted')
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    return res.data
  },

  // 获取我的统计数据
  getMyStats: async (openid) => {
    const [postsRes, skillsRes, likesRes, carpoolsRes] = await Promise.all([
      db.collection('posts').where({ _openid: openid, status: _.neq('deleted') }).count(),
      db.collection('skills').where({ _openid: openid, status: _.neq('deleted') }).count(),
      db.collection('posts').where({ likedBy: openid, status: _.neq('deleted') }).count(),
      db.collection('carpools').where({ _openid: openid, status: _.neq('deleted') }).count()
    ])
    return { postCount: postsRes.total, skillCount: skillsRes.total, likeCount: likesRes.total, carpoolCount: carpoolsRes.total }
  }
}

/**
 * 公告相关操作
 */
const noticeApi = {
  // 获取公告列表
  getList: async (limit = 5, includeAll = false) => {
    let query = db.collection('notices')

    if (!includeAll) {
      query = query.where({ status: 'active' })
    } else {
      query = query.where({ status: _.neq('deleted') })
    }

    const res = await query.orderBy('createTime', 'desc').limit(limit).get()
    return res.data
  },

  // 创建公告（管理员）
  create: async (data) => {
    const res = await db.collection('notices').add({
      data: { ...data, status: 'active', createTime: db.serverDate(), updateTime: db.serverDate() }
    })
    return res._id
  },

  // 更新公告
  update: async (noticeId, data) => {
    await db.collection('notices').doc(noticeId).update({ data: { ...data, updateTime: db.serverDate() } })
  },

  // 删除公告
  delete: async (noticeId) => {
    await db.collection('notices').doc(noticeId).update({ data: { status: 'deleted' } })
  },

  // 获取公告详情
  getDetail: async (noticeId) => {
    const res = await db.collection('notices').doc(noticeId).get()
    return res.data
  }
}

/**
 * 议事厅（discussions）
 */
const discussApi = {
  getList: async (page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize
    const query = db.collection('discussions').where({ status: _.neq('deleted') })
    const countRes = await query.count()
    const res = await query.orderBy('createTime', 'desc').skip(skip).limit(pageSize).get()
    return { list: res.data, total: countRes.total, hasMore: skip + res.data.length < countRes.total }
  },

  getDetail: async (id) => {
    const res = await db.collection('discussions').doc(id).get()
    return res.data
  },

  create: async (data) => {
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}
    const res = await db.collection('discussions').add({
      data: {
        ...data,
        author: userInfo.nickName || '邻居',
        avatarUrl: userInfo.avatarUrl || '',
        status: 'discussing',
        statusText: '讨论中',
        commentCount: 0,
        messages: [],
        vote: null,
        voteApprove: 0,
        voteReject: 0,
        votedUsers: [],
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    return res._id
  },

  delete: async (id) => {
    await db.collection('discussions').doc(id).update({ data: { status: 'deleted', updateTime: db.serverDate() } })
  },

  // 发送消息（push 到 messages 数组）
  sendMessage: async (discussId, msg) => {
    await db.collection('discussions').doc(discussId).update({
      data: {
        messages: _.push([msg]),
        commentCount: _.inc(1),
        updateTime: db.serverDate()
      }
    })
  },

  // 投票
  createVote: async (discussId, vote) => {
    await db.collection('discussions').doc(discussId).update({
      data: { vote, voteApprove: 0, voteReject: 0, votedUsers: [], updateTime: db.serverDate() }
    })
  },

  doVote: async (discussId, openid, type) => {
    const incField = type === 'approve' ? 'voteApprove' : 'voteReject'
    await db.collection('discussions').doc(discussId).update({
      data: { [incField]: _.inc(1), votedUsers: _.push([openid]), updateTime: db.serverDate() }
    })
  }
}

/**
 * 拼车（carpools）
 */
const carpoolApi = {
  getList: async (params = {}) => {
    const { page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize
    const query = db.collection('carpools').where({ status: _.neq('deleted') })
    const countRes = await query.count()
    const res = await query.orderBy('createTime', 'desc').skip(skip).limit(pageSize).get()
    return { list: res.data, total: countRes.total, hasMore: skip + res.data.length < countRes.total }
  },

  create: async (data) => {
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}
    const res = await db.collection('carpools').add({
      data: {
        ...data,
        userInfo: { nickName: userInfo.nickName || '邻居', avatarUrl: userInfo.avatarUrl || '' },
        status: 'active',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    return res._id
  },

  delete: async (id) => {
    await db.collection('carpools').doc(id).update({ data: { status: 'deleted', updateTime: db.serverDate() } })
  }
}

/**
 * 活动（activities）
 */
const activityApi = {
  getList: async (params = {}) => {
    const { page = 1, pageSize = 10 } = params
    const skip = (page - 1) * pageSize
    const query = db.collection('activities').where({ status: _.neq('deleted') })
    const countRes = await query.count()
    const res = await query.orderBy('createTime', 'desc').skip(skip).limit(pageSize).get()
    return { list: res.data, total: countRes.total, hasMore: skip + res.data.length < countRes.total }
  },

  getDetail: async (id) => {
    const res = await db.collection('activities').doc(id).get()
    return res.data
  },

  create: async (data) => {
    const res = await db.collection('activities').add({
      data: { ...data, status: 'active', joinCount: 0, joinedUsers: [], createTime: db.serverDate(), updateTime: db.serverDate() }
    })
    return res._id
  },

  join: async (activityId, openid) => {
    await db.collection('activities').doc(activityId).update({
      data: { joinedUsers: _.push([openid]), joinCount: _.inc(1), updateTime: db.serverDate() }
    })
  },

  cancelJoin: async (activityId, openid) => {
    await db.collection('activities').doc(activityId).update({
      data: { joinedUsers: _.pull(openid), joinCount: _.inc(-1), updateTime: db.serverDate() }
    })
  }
}

/**
 * 时间线（timeline）
 */
const timelineApi = {
  getList: async (page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize
    const query = db.collection('timeline').where({ status: _.neq('deleted') })
    const countRes = await query.count()
    const res = await query.orderBy('createTime', 'desc').skip(skip).limit(pageSize).get()
    return { list: res.data, total: countRes.total, hasMore: skip + res.data.length < countRes.total }
  },

  getDetail: async (id) => {
    const res = await db.collection('timeline').doc(id).get()
    return res.data
  },

  create: async (data) => {
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}
    const res = await db.collection('timeline').add({
      data: {
        ...data,
        userInfo: { nickName: userInfo.nickName || '邻居', avatarUrl: userInfo.avatarUrl || '' },
        status: 'active',
        comments: [],
        commentCount: 0,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    return res._id
  },

  // 内嵌评论
  getComments: async (timelineId) => {
    const res = await db.collection('timeline').doc(timelineId).field({ comments: true }).get()
    return (res.data && res.data.comments) || []
  },

  addComment: async (timelineId, content) => {
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}
    const now = Date.now()
    const newComment = {
      _id: now.toString() + '_' + Math.random().toString(36).substr(2, 6),
      userId: app.globalData.openid || '',
      nickName: userInfo.nickName || '邻居',
      avatar: userInfo.avatarUrl || '',
      content,
      time: now
    }
    await db.collection('timeline').doc(timelineId).update({
      data: {
        comments: _.push([newComment]),
        commentCount: _.inc(1),
        updateTime: db.serverDate()
      }
    })
    return newComment
  }
}

module.exports = {
  post: postApi,
  comment: commentApi,
  skill: skillApi,
  user: userApi,
  notice: noticeApi,
  discuss: discussApi,
  carpool: carpoolApi,
  activity: activityApi,
  timeline: timelineApi
}
