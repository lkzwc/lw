// 社区云对象
module.exports = {
	_before: function () {
		// 通用预处理器
	},
	
	/**
	 * 添加帖子
	 * @param {Object} postData 帖子数据
	 * @returns {Object} 返回结果
	 */
	async addPost(postData) {
		try {
			// 获取当前用户信息
			const userInfo = this.getUniIdToken();
			if (!userInfo || !userInfo.uid) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '用户未登录',
					data: null
				};
			}
			
			// 参数验证
			if (!postData.title || !postData.content) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '标题和内容不能为空',
					data: null
				};
			}
			
			// 获取数据库引用
			const db = uniCloud.database();
			const postsCollection = db.collection('posts');
			
			// 准备插入数据
			const insertData = {
				content: postData.content,
				images: postData.images || [],
				category: postData.category || '闲聊交流',
				userId: userInfo.uid,
				likeCount: 0,
				commentCount: 0,
				status: 1, // 1: 启用, 0: 草稿, -1: 已删除
				createTime: new Date(),
				updateTime: new Date()
			};
			
			// 插入数据
			const result = await postsCollection.add(insertData);
			
			if (result.id) {
				return {
					errCode: 0,
					errMsg: 'success',
					data: {
						postId: result.id,
						...insertData
					}
				};
			} else {
				return {
					errCode: 'ADD_POST_FAILED',
					errMsg: '帖子发布失败',
					data: null
				};
			}
			
		} catch (error) {
			return {
				errCode: 'ADD_POST_ERROR',
				errMsg: '发布帖子时发生错误: ' + error.message,
				data: null
			};
		}
	},
	
	/**
	 * 获取帖子列表
	 * @param {Object} params 查询参数
	 * @returns {Object} 返回帖子列表
	 */
	async getPostList(params = {}) {
		try {
			const { category, page = 1, pageSize = 10 } = params;
			
			// 获取数据库引用
			const db = uniCloud.database();
			let query = db.collection('posts').where({
				status: 1 // 只查询启用状态的帖子
			});
			
			// 按分类筛选
			if (category) {
				query = query.where({
					category: category
				});
			}
			
			// 分页查询
			const skip = (page - 1) * pageSize;
			const result = await query
				.orderBy('createTime', 'desc')
				.skip(skip)
				.limit(pageSize)
				.get();
			
			// 获取总数
			const countResult = await query.count();
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: {
					list: result.data,
					total: countResult.total,
					page: page,
					pageSize: pageSize
				}
			};
			
		} catch (error) {
			return {
				errCode: 'GET_POST_LIST_ERROR',
				errMsg: '获取帖子列表时发生错误: ' + error.message,
				data: null
			};
		}
	}
}