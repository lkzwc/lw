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

  // 点赞帖子
  like: async (postId, openid) => {
    // 检查是否已点赞
    const likeRes = await db.collection('likes').where({
      postId,
      _openid: openid
    }).get()

    if (likeRes.data.length > 0) {
      // 取消点赞
      await db.collection('likes').doc(likeRes.data[0]._id).remove()
      await db.collection('posts').doc(postId).update({
        data: {
          likeCount: _.inc(-1)
        }
      })
      return false
    } else {
      // 添加点赞
      await db.collection('likes').add({
        data: {
          postId,
          createTime: db.serverDate()
        }
      })
      await db.collection('posts').doc(postId).update({
        data: {
          likeCount: _.inc(1)
        }
      })
      return true
    }
  },

  // 检查是否已点赞
  checkLiked: async (postId, openid) => {
    const res = await db.collection('likes').where({
      postId,
      _openid: openid
    }).get()
    return res.data.length > 0
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
  }
}

/**
 * 评论相关操作
 */
const commentApi = {
  // 获取评论列表
  getList: async (postId, page = 1, pageSize = 20) => {
    const skip = (page - 1) * pageSize

    const res = await db.collection('comments')
      .where({
        postId,
        status: _.neq('deleted')
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取所有评论者的 openid
    const openids = [...new Set(res.data.map(comment => comment._openid))]

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

      // 将最新的用户信息附加到评论
      res.data = res.data.map(comment => ({
        ...comment,
        userInfo: userMap[comment._openid] || comment.userInfo || {}
      }))
    }

    return res.data
  },

  // 发表评论
  create: async (data) => {
    // 获取当前用户信息
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}

    const res = await db.collection('comments').add({
      data: {
        ...data,
        userInfo: {
          nickName: userInfo.nickName || '邻居',
          avatarUrl: userInfo.avatarUrl || ''
        },
        status: 'active',
        likeCount: 0,
        createTime: db.serverDate()
      }
    })

    // 更新帖子评论数
    await db.collection('posts').doc(data.postId).update({
      data: {
        commentCount: _.inc(1)
      }
    })

    return res._id
  },

  // 删除评论
  delete: async (commentId, postId) => {
    await db.collection('comments').doc(commentId).update({
      data: {
        status: 'deleted'
      }
    })

    // 更新帖子评论数
    await db.collection('posts').doc(postId).update({
      data: {
        commentCount: _.inc(-1)
      }
    })
  },

  // 回复评论
  reply: async (data) => {
    return await commentApi.create({
      ...data,
      isReply: true
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
    console.log('[skillApi.getList] condition:', JSON.stringify(condition), '总数:', countRes.total)

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

  // 点赞 / 取消点赞
  like: async (skillId, openid) => {
    const likeRes = await db.collection('skill_likes').where({
      skillId,
      _openid: openid
    }).get()

    if (likeRes.data.length > 0) {
      // 取消点赞
      await db.collection('skill_likes').doc(likeRes.data[0]._id).remove()
      await db.collection('skills').doc(skillId).update({
        data: { likeCount: _.inc(-1) }
      })
      return false
    } else {
      // 点赞
      await db.collection('skill_likes').add({
        data: { skillId, createTime: db.serverDate() }
      })
      await db.collection('skills').doc(skillId).update({
        data: { likeCount: _.inc(1) }
      })
      return true
    }
  },

  // 检查是否已点赞
  checkLiked: async (skillId, openid) => {
    const res = await db.collection('skill_likes').where({
      skillId,
      _openid: openid
    }).get()
    return res.data.length > 0
  },

  // 发布技能
  create: async (data) => {
    // 获取当前用户信息
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}

    console.log('[skillApi.create] userInfo:', userInfo)
    console.log('[skillApi.create] data:', data)

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
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    console.log('[skillApi.create] 写入成功，_id:', res._id)
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

  // 获取我的点赞
  getMyLikes: async (openid, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize

    // 先获取点赞记录
    const likesRes = await db.collection('likes')
      .where({ _openid: openid })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    if (likesRes.data.length === 0) {
      return []
    }

    // 再获取帖子详情
    const postIds = likesRes.data.map(like => like.postId)
    const postsRes = await db.collection('posts')
      .where({
        _id: _.in(postIds),
        status: _.neq('deleted')
      })
      .get()

    return postsRes.data
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
      query = query.where({
        status: 'active'
      })
    } else {
      query = query.where({
        status: _.neq('deleted')
      })
    }

    const res = await query
      .orderBy('createTime', 'desc')
      .limit(limit)
      .get()

    return res.data
  },

  // 创建公告（管理员）
  create: async (data) => {
    const res = await db.collection('notices').add({
      data: {
        ...data,
        status: 'active',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    return res._id
  },

  // 更新公告
  update: async (noticeId, data) => {
    await db.collection('notices').doc(noticeId).update({
      data: {
        ...data,
        updateTime: db.serverDate()
      }
    })
  },

  // 删除公告
  delete: async (noticeId) => {
    await db.collection('notices').doc(noticeId).update({
      data: {
        status: 'deleted'
      }
    })
  }
}

module.exports = {
  post: postApi,
  comment: commentApi,
  skill: skillApi,
  user: userApi,
  notice: noticeApi
}
