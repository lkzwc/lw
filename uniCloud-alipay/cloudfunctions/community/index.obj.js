const { getUidByToken } = require('wxlogin')

module.exports = {

	/**
	 * 通用用户验证方法
	 * @returns {Object} 返回用户验证结果
	 */
	verifyUser() {
		// 获取token
		const token = this.getUniCloudRequestHeaders()['token']
		
		if (!token) {
			return {
				errCode: 'UNAUTHORIZED',
				errMsg: '用户未登录',
				data: null
			}
		}
		
		// 通过token获取openid
		const openid = getUidByToken(token)
		if (!openid) {
			return {
				errCode: 'INVALID_TOKEN',
				errMsg: '无效的token',
				data: null
			}
		}
		
		return {
			errCode: 0,
			errMsg: 'success',
			data: { openid }
		}
	},
	
	/**
	 * 发布帖子
	 * @param {Object} postData 帖子数据
	 * @returns {Object} 返回结果
	 */
	async addPost(postData) {
		try {
			// 用户验证
			const userCheck = this.verifyUser()
			if (userCheck.errCode !== 0) {
				return userCheck
			}
			
			const { openid } = userCheck.data
			
			// 参数验证
			if (!postData.content) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '内容不能为空',
					data: null
				}
			}
			
			// 获取数据库引用
			const db = uniCloud.database()
			const postsCollection = db.collection('posts')
			const usersCollection = db.collection('users')
			
			// 获取用户信息
			const userResult = await usersCollection.where({ openid }).get()
			if (userResult.data.length === 0) {
				return {
					errCode: 'USER_NOT_FOUND',
					errMsg: '用户不存在',
					data: null
				}
			}
			
			const user = userResult.data[0]
			
			// 准备插入数据
			const insertData = {
				content: postData.content,
				images: postData.images || [],
				tag: postData.tag || ['全部'],
				user_id: user._id,
				username: user.nickname,
				user_avatar: user.avatar,
				like_count: 0,
				comment_count: 0,
				view_count: 0,
				is_top: false,
				status: 1,
				create_time: new Date(),
				update_time: new Date()
			}
			
			// 插入数据
			const result = await postsCollection.add(insertData)
			
			if (result.id) {
				return {
					errCode: 0,
					errMsg: 'success',
					data: {
						postId: result.id,
						...insertData
					}
				}
			} else {
				return {
					errCode: 'ADD_POST_FAILED',
					errMsg: '帖子发布失败',
					data: null
				}
			}
			
		} catch (error) {
			console.error('发布帖子错误:', error)
			return {
				errCode: 'ADD_POST_ERROR',
				errMsg: '发布帖子时发生错误: ' + error.message,
				data: null
			}
		}
	},
	
	/**
	 * 获取帖子列表
	 * @param {Object} params 查询参数
	 * @returns {Object} 返回帖子列表
	 */
	async getPostList(params = {}) {
		try {
			const { tag, page = 1, pageSize = 10 } = params
			
			// 获取数据库引用
			const db = uniCloud.database()
			let query = db.collection('posts').where({
				status: 1 // 只查询已发布的帖子
			})
			
			// 按标签筛选
			if (tag && tag !== '全部') {
				query = query.where({
					tag: db.command.in([tag])
				})
			}
			
			// 分页查询，置顶帖子优先
			const skip = (page - 1) * pageSize
			const result = await query
				.orderBy('is_top', 'desc')
				.orderBy('create_time', 'desc')
				.skip(skip)
				.limit(pageSize)
				.get()
			
			// 获取总数
			const countResult = await query.count()
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: {
					list: result.data,
					total: countResult.total,
					page: page,
					pageSize: pageSize
				}
			}
			
		} catch (error) {
			console.error('获取帖子列表错误:', error)
			return {
				errCode: 'GET_POST_LIST_ERROR',
				errMsg: '获取帖子列表时发生错误: ' + error.message,
				data: null
			}
		}
	},
	
	/**
	 * 获取帖子详情
	 * @param {string} postId 帖子ID
	 * @returns {Object} 返回帖子详情
	 */
	async getPostDetail(postId) {
		try {
			if (!postId) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '帖子ID不能为空',
					data: null
				}
			}
			
			const db = uniCloud.database()
			const postsCollection = db.collection('posts')
			
			// 查询帖子详情
			const result = await postsCollection.doc(postId).get()
			
			if (result.data.length === 0) {
				return {
					errCode: 'POST_NOT_FOUND',
					errMsg: '帖子不存在',
					data: null
				}
			}
			
			// 增加浏览数
			await postsCollection.doc(postId).update({
				view_count: db.command.inc(1)
			})
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: result.data[0]
			}
			
		} catch (error) {
			console.error('获取帖子详情错误:', error)
			return {
				errCode: 'GET_POST_DETAIL_ERROR',
				errMsg: '获取帖子详情时发生错误: ' + error.message,
				data: null
			}
		}
	},
	
	/**
	 * 发布评论
	 * @param {Object} commentData 评论数据
	 * @returns {Object} 返回结果
	 */
	async addComment(commentData) {
		try {
			// 用户验证
			const userCheck = this.verifyUser()
			if (userCheck.errCode !== 0) {
				return userCheck
			}
			
			const { openid } = userCheck.data
			
			// 参数验证
			if (!commentData.post_id || !commentData.content) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '帖子ID和评论内容不能为空',
					data: null
				}
			}
			
			const db = uniCloud.database()
			const commentsCollection = db.collection('comments')
			const postsCollection = db.collection('posts')
			const usersCollection = db.collection('users')
			
			// 获取用户信息
			const userResult = await usersCollection.where({ openid }).get()
			if (userResult.data.length === 0) {
				return {
					errCode: 'USER_NOT_FOUND',
					errMsg: '用户不存在',
					data: null
				}
			}
			
			const user = userResult.data[0]
			
			// 准备插入数据
			const insertData = {
				post_id: commentData.post_id,
				parent_id: commentData.parent_id || null,
				content: commentData.content,
				user_id: user._id,
				username: user.nickname,
				user_avatar: user.avatar,
				status: 1,
				create_time: new Date()
			}
			
			// 插入评论
			const result = await commentsCollection.add(insertData)
			
			if (result.id) {
				// 更新帖子评论数
				await postsCollection.doc(commentData.post_id).update({
					comment_count: db.command.inc(1)
				})
				
				return {
					errCode: 0,
					errMsg: 'success',
					data: {
						commentId: result.id,
						...insertData
					}
				}
			} else {
				return {
					errCode: 'ADD_COMMENT_FAILED',
					errMsg: '评论发布失败',
					data: null
				}
			}
			
		} catch (error) {
			console.error('发布评论错误:', error)
			return {
				errCode: 'ADD_COMMENT_ERROR',
				errMsg: '发布评论时发生错误: ' + error.message,
				data: null
			}
		}
	},
	
	/**
	 * 获取评论列表
	 * @param {Object} params 查询参数
	 * @returns {Object} 返回评论列表
	 */
	async getCommentList(params = {}) {
		try {
			const { post_id, page = 1, pageSize = 20 } = params
			
			if (!post_id) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '帖子ID不能为空',
					data: null
				}
			}
			
			const db = uniCloud.database()
			const commentsCollection = db.collection('comments')
			
			// 查询一级评论
			const skip = (page - 1) * pageSize
			const result = await commentsCollection.where({
				post_id: post_id,
				parent_id: null,
				status: 1
			}).orderBy('create_time', 'asc')
			  .skip(skip)
			  .limit(pageSize)
			  .get()
			
			// 获取每个一级评论的回复
			const comments = []
			for (const comment of result.data) {
				// 查询该评论的回复
				const repliesResult = await commentsCollection.where({
					parent_id: comment._id,
					status: 1
				}).orderBy('create_time', 'asc').get()
				
				comments.push({
					...comment,
					replies: repliesResult.data
				})
			}
			
			// 获取总数
			const countResult = await commentsCollection.where({
				post_id: post_id,
				parent_id: null,
				status: 1
			}).count()
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: {
					list: comments,
					total: countResult.total,
					page: page,
					pageSize: pageSize
				}
			}
			
		} catch (error) {
			console.error('获取评论列表错误:', error)
			return {
				errCode: 'GET_COMMENT_LIST_ERROR',
				errMsg: '获取评论列表时发生错误: ' + error.message,
				data: null
			}
		}
	},
	
	/**
	 * 点赞/取消点赞
	 * @param {Object} likeData 点赞数据 - { post_id: string }
	 * @returns {Object} 返回结果
	 */
	async toggleLike(likeData) {
		try {
			// 用户验证
			const userCheck = this.verifyUser()
			if (userCheck.errCode !== 0) {
				return userCheck
			}
			
			const { openid } = userCheck.data
			
			// 参数验证
			if (!likeData.post_id) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '帖子ID不能为空',
					data: null
				}
			}
			
			const db = uniCloud.database()
			const likesCollection = db.collection('likes')
			const postsCollection = db.collection('posts')
			const usersCollection = db.collection('users')
			
			// 获取用户信息
			const userResult = await usersCollection.where({ openid }).get()
			if (userResult.data.length === 0) {
				return {
					errCode: 'USER_NOT_FOUND',
					errMsg: '用户不存在',
					data: null
				}
			}
			
			const user = userResult.data[0]
			
			// 检查是否已点赞
			const existingLike = await likesCollection.where({
				post_id: likeData.post_id,
				user_id: user._id
			}).get()
			
			if (existingLike.data.length > 0) {
				// 已点赞，取消点赞
				await likesCollection.doc(existingLike.data[0]._id).remove()
				
				// 更新帖子点赞数
				await postsCollection.doc(likeData.post_id).update({
					like_count: db.command.inc(-1)
				})
				
				return {
					errCode: 0,
					errMsg: 'success',
					data: { isLiked: false, action: 'unlike' }
				}
			} else {
				// 未点赞，添加点赞
				await likesCollection.add({
					post_id: likeData.post_id,
					user_id: user._id,
					username: user.nickname,
					create_time: new Date()
				})
				
				// 更新帖子点赞数
				await postsCollection.doc(likeData.post_id).update({
					like_count: db.command.inc(1)
				})
				
				return {
					errCode: 0,
					errMsg: 'success',
					data: { isLiked: true, action: 'like' }
				}
			}
			
		} catch (error) {
			console.error('点赞操作错误:', error)
			return {
				errCode: 'TOGGLE_LIKE_ERROR',
				errMsg: '点赞操作时发生错误: ' + error.message,
				data: null
			}
		}
	}
}