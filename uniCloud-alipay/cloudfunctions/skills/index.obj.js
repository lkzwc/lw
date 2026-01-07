const db = uniCloud.database();
const dbCmd = db.command;

module.exports = {
	/**
	 * 预处理方法 - 统一的身份验证和参数处理
	 */
	_before: function() {
		// 记录请求开始时间
		this.startTime = Date.now();
		
		// 获取客户端信息
		this.clientInfo = this.getClientInfo();
		
	},

	/**
	 * 后处理方法 - 统一的响应处理
	 */
	_after: function(error, result) {
		if (error) {
			console.error('云对象执行错误:', error);
			throw error;
		}
		
		// 添加执行时间
		if (result && typeof result === 'object') {
			result.executionTime = Date.now() - this.startTime;
		}
		
		return result;
	},

	/**
	 * 获取当前用户信息
	 * @returns {Object} 用户信息
	 */
	async getCurrentUser() {
		try {
			const token = this.getUniIdToken();
			if (!token) {
				return null;
			}
			
			// 修复：直接返回 token 中的用户信息，或者使用简化的验证逻辑
			return {
				errCode: 0,
				uid: token.uid,
				...token
			};
		} catch (error) {
			console.error('获取用户信息失败:', error);
			return null;
		}
	},


	/**
	 * 获取技能列表
	 * @param {Object} params 查询参数
	 * @returns {Object} 技能列表数据
	 */
	async getSkillsList(params = {}) {
		try {
			const { keyword, category, page = 1, pageSize = 10, userId } = params;
			
			// 获取数据库引用
			const db = uniCloud.database();
			let query = db.collection('skills').where({
				status: 1 // 只查询已发布的技能
			});
			
			// 按关键词搜索
			if (keyword && keyword.trim()) {
				query = query.where({
					title: new RegExp(keyword.trim(), 'i')
				});
			}
			
			// 按分类筛选
			if (category && category !== 'all') {
				query = query.where({
					category: category
				});
			}
			
			// 按用户筛选
			if (userId) {
				query = query.where({
					user_id: userId
				});
			}
			
			// 分页查询
			const skip = (page - 1) * pageSize;
			const result = await query
				.orderBy('create_time', 'desc')
				.skip(skip)
				.limit(pageSize)
				.get();
			
			// 获取总数
			const countResult = await query.count();
			
			// 判断是否还有更多数据
			const hasMore = (skip + result.data.length) < countResult.total;
			
			return {
				errCode: 0,
				errMsg: '获取成功',
				data: {
					list: result.data,
					total: countResult.total,
					page: page,
					pageSize: pageSize,
					hasMore: hasMore
				}
			};
			
		} catch (error) {
			console.error('获取技能列表失败:', error);
			return {
				errCode: 'GET_SKILLS_FAILED',
				errMsg: '获取技能列表失败: ' + error.message
			};
		}
	},

	/**
	 * 发布技能
	 * @param {Object} skillData 技能数据
	 * @param {string} skillData.title 技能标题
	 * @param {string} skillData.description 技能描述
	 * @param {string} skillData.category 服务分类
	 * @param {string} skillData.location 服务位置
	 * @param {number} skillData.price 服务价格
	 * @param {string} skillData.priceUnit 价格单位
	 * @param {Array} skillData.tags 技能标签
	 * @param {Array} skillData.images 服务图片
	 * @param {string} skillData.phone 联系电话
	 * @param {string} skillData.wechat 微信号
	 * @returns {Object} 发布结果
	 */
	async publishSkill(skillData) {
		try {
			// 获取用户信息
			const userInfo = await this.getCurrentUser();
			if (!userInfo || userInfo.errCode !== 0) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '请先登录'
				};
			}
			
			// 参数验证
			const { title, description, category, location, price, priceUnit, tags = [], images = [], phone, wechat } = skillData;
			
			if (!title || title.trim().length < 2 || title.trim().length > 50) {
				return {
					errCode: 'INVALID_TITLE',
					errMsg: '技能标题长度应在2-50个字符之间'
				};
			}
			
			if (!description || description.trim().length < 10 || description.trim().length > 500) {
				return {
					errCode: 'INVALID_DESCRIPTION',
					errMsg: '技能描述长度应在10-500个字符之间'
				};
			}
			
			const validCategories = ['housekeeping', 'repair', 'education', 'beauty', 'health', 'other'];
			if (!category || !validCategories.includes(category)) {
				return {
					errCode: 'INVALID_CATEGORY',
					errMsg: '请选择有效的服务分类'
				};
			}
			
			if (!location || location.trim().length < 2 || location.trim().length > 50) {
				return {
					errCode: 'INVALID_LOCATION',
					errMsg: '服务位置长度应在2-50个字符之间'
				};
			}
			
			if (!price || isNaN(price) || price <= 0 || price > 99999) {
				return {
					errCode: 'INVALID_PRICE',
					errMsg: '请输入有效的服务价格(1-99999)'
				};
			}
			
			const validPriceUnits = ['小时', '次', '天', '课时', '项目'];
			if (!priceUnit || !validPriceUnits.includes(priceUnit)) {
				return {
					errCode: 'INVALID_PRICE_UNIT',
					errMsg: '请选择有效的价格单位'
				};
			}
			
			// 验证标签
			if (tags.length > 5) {
				return {
					errCode: 'INVALID_TAGS',
					errMsg: '最多只能添加5个标签'
				};
			}
			
			for (let tag of tags) {
				if (!tag || tag.trim().length > 10) {
					return {
						errCode: 'INVALID_TAGS',
						errMsg: '标签长度不能超过10个字符'
					};
				}
			}
			
			// 验证图片
			if (images.length > 6) {
				return {
					errCode: 'INVALID_IMAGES',
					errMsg: '最多只能上传6张图片'
				};
			}
			
			// 验证联系方式
			if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
				return {
					errCode: 'INVALID_PHONE',
					errMsg: '请输入有效的手机号码'
				};
			}
			
			if (wechat && (wechat.length < 6 || wechat.length > 20)) {
				return {
					errCode: 'INVALID_WECHAT',
					errMsg: '微信号长度应在6-20个字符之间'
				};
			}
			
			// 获取用户详细信息
			const userDetail = await db.collection('uni-id-users')
				.where({ _id: userInfo.uid })
				.field({ nickname: true, avatar: true })
				.get();
			
			const userData = userDetail.data[0] || {};
			
			// 构建技能数据
			const skillRecord = {
				title: title.trim(),
				description: description.trim(),
				category,
				location: location.trim(),
				price: parseFloat(price),
				price_unit: priceUnit,
				tags: tags.map(tag => tag.trim()).filter(tag => tag),
				images: images || [],
				phone: phone || '',
				wechat: wechat || '',
				user_id: userInfo.uid,
				username: userData.nickname || '用户',
				user_avatar: userData.avatar || '',
				rating: 5.0,
				review_count: 0,
				view_count: 0,
				status: 1, // 1-已发布 0-草稿 -1-已下架
				create_time: new Date(),
				update_time: new Date()
			};
			
			// 插入数据库
			const result = await db.collection('skills').add(skillRecord);
			
			if (result.id) {
				return {
					errCode: 0,
					errMsg: '发布成功',
					data: {
						skillId: result.id
					}
				};
			} else {
				return {
					errCode: 'PUBLISH_FAILED',
					errMsg: '发布失败，请重试'
				};
			}
		} catch (error) {
			console.error('发布技能失败:', error);
			return {
				errCode: 'PUBLISH_FAILED',
				errMsg: '发布失败，请重试'
			};
		}
	},

	/**
	 * 获取技能详情
	 * @param {string} skillId 技能ID
	 * @returns {Object} 技能详情
	 */
	async getSkillDetail(skillId) {
		try {
			if (!skillId || typeof skillId !== 'string') {
				return {
					errCode: 'INVALID_SKILL_ID',
					errMsg: '技能ID不能为空'
				};
			}
			
			const result = await db.collection('skills')
				.where({
					_id: skillId,
					status: 1
				})
				.get();
			
			if (result.data.length === 0) {
				return {
					errCode: 'SKILL_NOT_FOUND',
					errMsg: '技能不存在或已下架'
				};
			}
			
			// 增加浏览次数
			await db.collection('skills')
				.where({ _id: skillId })
				.update({
					viewCount: dbCmd.inc(1)
				});
			
			const skillData = result.data[0];
			
			return {
				errCode: 0,
				errMsg: '获取成功',
				data: skillData
			};
		} catch (error) {
			console.error('获取技能详情失败:', error);
			return {
				errCode: 'GET_DETAIL_FAILED',
				errMsg: '获取技能详情失败: ' + error.message
			};
		}
	},

	/**
	 * 获取技能分类列表
	 * @returns {Object} 分类列表
	 */
	async getCategories() {
		try {
			// 返回预定义的分类列表
			const categories = [
				{ label: '全部', value: 'all' },
				{ label: '编程开发', value: 'programming' },
				{ label: '设计创意', value: 'design' },
				{ label: '语言翻译', value: 'language' },
				{ label: '音乐艺术', value: 'music' },
				{ label: '体育健身', value: 'sports' },
				{ label: '学习辅导', value: 'education' },
				{ label: '生活服务', value: 'life' },
				{ label: '其他技能', value: 'other' }
			];
			
			return {
				errCode: 0,
				errMsg: '获取成功',
				data: categories
			};
			
		} catch (error) {
			return {
				errCode: 'GET_CATEGORIES_ERROR',
				errMsg: '获取分类列表时发生错误: ' + error.message,
				data: null
			};
		}
	},

	/**
	 * 上传图片到云存储
	 * @param {Object} fileInfo 文件信息
	 * @param {string} fileInfo.cloudPath 云端路径
	 * @param {Buffer} fileInfo.fileContent 文件内容
	 * @returns {Object} 上传结果
	 */
	async uploadImage(fileInfo) {
		try {
			// 验证用户登录状态
			const userInfo = await this.getCurrentUser();
			console.log('getCurrentUser:', userInfo);
			if (!userInfo || userInfo.errCode !== 0) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '请先登录'
				};
			}
			
			const { cloudPath, fileContent } = fileInfo;
			
			if (!cloudPath || !fileContent) {
				return {
					errCode: 'INVALID_FILE',
					errMsg: '文件信息不完整'
				};
			}
			
			// 验证文件类型
			const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
			const fileExt = cloudPath.substring(cloudPath.lastIndexOf('.')).toLowerCase();
			
			if (!allowedTypes.includes(fileExt)) {
				return {
					errCode: 'INVALID_FILE_TYPE',
					errMsg: '只支持jpg、png、webp格式的图片'
				};
			}
			
			// 生成唯一的云端路径
			const timestamp = Date.now();
			const randomStr = Math.random().toString(36).substring(2);
			const finalCloudPath = `skills/${userInfo.uid}/${timestamp}_${randomStr}${fileExt}`;
			
			// 上传到云存储
			const uploadResult = await uniCloud.uploadFile({
				cloudPath: finalCloudPath,
				fileContent: fileContent
			});
			
			if (uploadResult.fileID) {
				// 获取临时访问链接
				const getTempFileURLResult = await uniCloud.getTempFileURL({
					fileList: [uploadResult.fileID]
				});
				
				const fileUrl = getTempFileURLResult.fileList[0]?.tempFileURL || uploadResult.fileID;
				
				return {
					errCode: 0,
					errMsg: '上传成功',
					data: {
						fileID: uploadResult.fileID,
						url: fileUrl
					}
				};
			} else {
				return {
					errCode: 'UPLOAD_FAILED',
					errMsg: '图片上传失败'
				};
			}
		} catch (error) {
			console.error('图片上传失败:', error);
			return {
				errCode: 'UPLOAD_FAILED',
				errMsg: '图片上传失败'
			};
		}
	},

	/**
	 * 搜索技能
	 * @param {string} keyword 搜索关键词
	 * @param {Object} options 搜索选项
	 * @returns {Object} 搜索结果
	 */
	async searchSkills(keyword, options = {}) {
		try {
			if (!keyword || !keyword.trim()) {
				return {
					errCode: 'INVALID_KEYWORD',
					errMsg: '搜索关键词不能为空'
				};
			}
			
			// 调用获取技能列表方法，传入搜索关键词
			return await this.getSkillsList({
				keyword: keyword.trim(),
				...options
			});
		} catch (error) {
			console.error('搜索技能失败:', error);
			return {
				errCode: 'SEARCH_FAILED',
				errMsg: '搜索失败，请重试'
			};
		}
	},

	/**
	 * 获取用户发布的技能列表
	 * @param {Object} params 查询参数
	 * @returns {Object} 用户技能列表
	 */
	async getUserSkills(params = {}) {
		try {
			// 验证用户登录状态
			const userInfo = await this.getCurrentUser();
			if (!userInfo || userInfo.errCode !== 0) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '请先登录'
				};
			}
			
			const { page = 1, pageSize = 10, status } = params;
			
			// 参数验证
			if (page < 1 || pageSize < 1 || pageSize > 50) {
				return {
					errCode: 'INVALID_PARAMS',
					errMsg: '分页参数无效'
				};
			}
			
			const skip = (page - 1) * pageSize;
			
			// 构建查询条件
			let whereCondition = {
				userId: userInfo.uid
			};
			
			// 状态筛选
			if (status !== undefined) {
				whereCondition.status = status;
			}
			
			// 查询用户发布的技能
			const skillsResult = await db.collection('skills')
				.where(whereCondition)
				.orderBy('createTime', 'desc')
				.skip(skip)
				.limit(pageSize)
				.get();
			
			// 查询总数
			const countResult = await db.collection('skills')
				.where(whereCondition)
				.count();
			
			return {
				errCode: 0,
				errMsg: '获取成功',
				data: {
					list: skillsResult.data,
					total: countResult.total,
					page: page,
					pageSize: pageSize,
					hasMore: skip + pageSize < countResult.total
				}
			};
		} catch (error) {
			console.error('获取用户技能列表失败:', error);
			return {
				errCode: 'GET_USER_SKILLS_FAILED',
				errMsg: '获取用户技能列表失败'
			};
		}
	},

	/**
	 * 更新技能信息
	 * @param {string} skillId 技能ID
	 * @param {Object} updateData 更新数据
	 * @returns {Object} 更新结果
	 */
	async updateSkill(skillId, updateData) {
		try {
			// 验证用户登录状态
			const userInfo = await this.getCurrentUser();
			if (!userInfo || userInfo.errCode !== 0) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '请先登录'
				};
			}
			
			if (!skillId) {
				return {
					errCode: 'INVALID_SKILL_ID',
					errMsg: '技能ID不能为空'
				};
			}
			
			// 检查技能是否存在且属于当前用户
			const skillResult = await db.collection('skills')
				.where({
					_id: skillId,
					user_id: userInfo.uid
				})
				.get();
			
			if (skillResult.data.length === 0) {
				return {
					errCode: 'SKILL_NOT_FOUND',
					errMsg: '技能不存在或无权限修改'
				};
			}
			
			// 过滤允许更新的字段
			const allowedFields = ['title', 'description', 'category', 'location', 'price', 'price_unit', 'tags', 'images', 'phone', 'wechat', 'status'];
			const filteredUpdateData = {};
			
			for (let key of allowedFields) {
				if (updateData.hasOwnProperty(key)) {
					filteredUpdateData[key] = updateData[key];
				}
			}
			
			// 添加更新时间
			filteredUpdateData.update_time = new Date();
			
			// 执行更新
			const updateResult = await db.collection('skills')
				.where({ _id: skillId })
				.update(filteredUpdateData);
			
			if (updateResult.updated > 0) {
				return {
					errCode: 0,
					errMsg: '更新成功'
				};
			} else {
				return {
					errCode: 'UPDATE_FAILED',
					errMsg: '更新失败'
				};
			}
		} catch (error) {
			console.error('更新技能失败:', error);
			return {
				errCode: 'UPDATE_FAILED',
				errMsg: '更新失败，请重试'
			};
		}
	},

	/**
	 * 删除技能
	 * @param {string} skillId 技能ID
	 * @returns {Object} 删除结果
	 */
	async deleteSkill(skillId) {
		try {
			// 验证用户登录状态
			const userInfo = await this.getCurrentUser();
			if (!userInfo || userInfo.errCode !== 0) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '请先登录'
				};
			}
			
			if (!skillId) {
				return {
					errCode: 'INVALID_SKILL_ID',
					errMsg: '技能ID不能为空'
				};
			}
			
			// 软删除：将状态设置为-1
			const updateResult = await db.collection('skills')
				.where({
					_id: skillId,
					user_id: userInfo.uid
				})
				.update({
					status: -1,
					update_time: new Date()
				});
			
			if (updateResult.updated > 0) {
				return {
					errCode: 0,
					errMsg: '删除成功'
				};
			} else {
				return {
					errCode: 'DELETE_FAILED',
					errMsg: '删除失败，技能不存在或无权限'
				};
			}
		} catch (error) {
			console.error('删除技能失败:', error);
			return {
				errCode: 'DELETE_FAILED',
				errMsg: '删除失败，请重试'
			};
		}
	},

	/**
	 * 检查技能是否已收藏
	 * @param {string} skillId 技能ID
	 * @returns {Object} 收藏状态
	 */
	async isSkillCollected(skillId) {
		try {
			// 简化用户验证逻辑，避免 this 上下文问题
			const token = this.getUniIdToken();
			if (!token || !token.uid) {
				return {
					errCode: 0,
					errMsg: '未登录',
					data: { isCollected: false }
				};
			}

			if (!skillId || typeof skillId !== 'string') {
				return {
					errCode: 'INVALID_SKILL_ID',
					errMsg: '技能ID不能为空'
				};
			}

			// 查询收藏记录
			const result = await db.collection('skill_collections')
				.where({
					user_id: token.uid,
					skill_id: skillId
				})
				.get();

			return {
				errCode: 0,
				errMsg: '查询成功',
				data: {
					isCollected: result.data.length > 0
				}
			};
		} catch (error) {
			console.error('检查收藏状态失败:', error);
			return {
				errCode: 0,
				errMsg: '查询失败，默认未收藏',
				data: { isCollected: false }
			};
		}
	},

	/**
	 * 收藏技能
	 * @param {string} skillId 技能ID
	 * @returns {Object} 收藏结果
	 */
	async collectSkill(skillId) {
		try {
			// 简化用户验证逻辑
			const token = this.getUniIdToken();
			if (!token || !token.uid) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '请先登录'
				};
			}

			if (!skillId || typeof skillId !== 'string') {
				return {
					errCode: 'INVALID_SKILL_ID',
					errMsg: '技能ID不能为空'
				};
			}

			// 检查技能是否存在
			const skillResult = await db.collection('skills')
				.where({ _id: skillId, status: 1 })
				.get();

			if (skillResult.data.length === 0) {
				return {
					errCode: 'SKILL_NOT_FOUND',
					errMsg: '技能不存在或已下架'
				};
			}

			// 检查是否已经收藏
			const existResult = await db.collection('skill_collections')
				.where({
					userId: token.uid,
					skillId: skillId
				})
				.get();

			if (existResult.data.length > 0) {
				return {
					errCode: 'ALREADY_COLLECTED',
					errMsg: '已经收藏过了'
				};
			}

			// 添加收藏记录
			const collectResult = await db.collection('skill_collections').add({
				userId: token.uid,
				skillId: skillId,
				createTime: new Date()
			});

			if (collectResult.id) {
				return {
					errCode: 0,
					errMsg: '收藏成功',
					data: { collectionId: collectResult.id }
				};
			} else {
				return {
					errCode: 'COLLECT_FAILED',
					errMsg: '收藏失败，请重试'
				};
			}
		} catch (error) {
			console.error('收藏技能失败:', error);
			return {
				errCode: 'COLLECT_FAILED',
				errMsg: '收藏失败: ' + error.message
			};
		}
	},

	/**
	 * 取消收藏技能
	 * @param {string} skillId 技能ID
	 * @returns {Object} 取消收藏结果
	 */
	async uncollectSkill(skillId) {
		try {
			// 简化用户验证逻辑
			const token = this.getUniIdToken();
			if (!token || !token.uid) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '请先登录'
				};
			}

			if (!skillId || typeof skillId !== 'string') {
				return {
					errCode: 'INVALID_SKILL_ID',
					errMsg: '技能ID不能为空'
				};
			}

			// 删除收藏记录
			const result = await db.collection('skill_collections')
				.where({
					userId: token.uid,
					skillId: skillId
				})
				.remove();

			if (result.deleted > 0) {
				return {
					errCode: 0,
					errMsg: '取消收藏成功'
				};
			} else {
				return {
					errCode: 'NOT_COLLECTED',
					errMsg: '尚未收藏该技能'
				};
			}
		} catch (error) {
			console.error('取消收藏技能失败:', error);
			return {
				errCode: 'UNCOLLECT_FAILED',
				errMsg: '取消收藏失败: ' + error.message
			};
		}
	},

	/**
	 * 获取用户收藏的技能列表
	 * @param {Object} params 查询参数
	 * @param {number} params.page 页码，默认1
	 * @param {number} params.pageSize 每页数量，默认10
	 * @returns {Object} 收藏列表
	 */
	async getUserCollections(params = {}) {
		try {
			// 验证用户登录状态
			const userInfo = await this.getCurrentUser();
			if (!userInfo || userInfo.errCode !== 0) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '请先登录'
				};
			}
			
			const { page = 1, pageSize = 10 } = params;
			
			// 参数验证
			if (page < 1 || pageSize < 1 || pageSize > 50) {
				return {
					errCode: 'INVALID_PARAMS',
					errMsg: '分页参数无效'
				};
			}
			
			const skip = (page - 1) * pageSize;
			
			// 查询用户收藏记录
			const collectionsResult = await db.collection('skill_collections')
				.where({
					user_id: userInfo.uid
				})
				.orderBy('create_time', 'desc')
				.skip(skip)
				.limit(pageSize)
				.get();
			
			// 获取技能详情
			const skillIds = collectionsResult.data.map(item => item.skillId);
			let skillsList = [];
			
			if (skillIds.length > 0) {
				const skillsResult = await db.collection('skills')
					.where({
						_id: dbCmd.in(skillIds),
						status: 1
					})
					.field({
						password: false,
						phone: false,
						wechat: false
					})
					.get();
				
				skillsList = skillsResult.data;
			}
			
			// 查询总数
			const countResult = await db.collection('skill_collections')
				.where({
					user_id: userInfo.uid
				})
				.count();
			
			return {
				errCode: 0,
				errMsg: '获取成功',
				data: {
					list: skillsList,
					total: countResult.total,
					page: page,
					pageSize: pageSize,
					hasMore: skip + pageSize < countResult.total
				}
			};
		} catch (error) {
			console.error('获取收藏列表失败:', error);
			return {
				errCode: 'GET_COLLECTIONS_FAILED',
				errMsg: '获取收藏列表失败'
			};
		}
	},

	/**
	 * 添加技能
	 * @param {Object} skillData 技能数据
	 * @returns {Object} 返回结果
	 */
	async addSkill(skillData) {
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
			if (!skillData.title || !skillData.category || !skillData.description || !skillData.contact) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '必填参数不能为空',
					data: null
				};
			}
			
			// 获取数据库引用
			const db = uniCloud.database();
			const skillsCollection = db.collection('skills');
			
			// 准备插入数据
			const insertData = {
				title: skillData.title,
				category: skillData.category,
				description: skillData.description,
				images: skillData.images || [],
				contact: skillData.contact,
				price: skillData.price || '',
				available_time: skillData.availableTime || '',
				user_id: userInfo.uid,
				status: 1, // 1: 启用, 0: 草稿, -1: 已删除
				create_time: new Date(),
				update_time: new Date()
			};
			
			// 插入数据
			const result = await skillsCollection.add(insertData);
			
			if (result.id) {
				return {
					errCode: 0,
					errMsg: 'success',
					data: {
						skillId: result.id,
						...insertData
					}
				};
			} else {
				return {
					errCode: 'ADD_SKILL_FAILED',
					errMsg: '技能添加失败',
					data: null
				};
			}
			
		} catch (error) {
			return {
				errCode: 'ADD_SKILL_ERROR',
				errMsg: '添加技能时发生错误: ' + error.message,
				data: null
			};
		}
	},
	
	/**
	 * 获取技能详情
	 * @param {string} skillId 技能ID
	 * @returns {Object} 返回技能详情
	 */
	async getSkillDetail(skillId) {
		try {
			// 参数验证
			if (!skillId) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '技能ID不能为空',
					data: null
				};
			}
			
			// 获取数据库引用
			const db = uniCloud.database();
			const result = await db.collection('skills').doc(skillId).get();
			
			if (result.data && result.data.length > 0) {
				return {
					errCode: 0,
					errMsg: 'success',
					data: result.data[0]
				};
			} else {
				return {
					errCode: 'SKILL_NOT_FOUND',
					errMsg: '技能不存在',
					data: null
				};
			}
			
		} catch (error) {
			return {
				errCode: 'GET_SKILL_DETAIL_ERROR',
				errMsg: '获取技能详情时发生错误: ' + error.message,
				data: null
			};
		}
	},
	
	/**
	 * 更新技能
	 * @param {string} skillId 技能ID
	 * @param {Object} updateData 更新数据
	 * @returns {Object} 返回结果
	 */
	async updateSkill(skillId, updateData) {
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
			if (!skillId) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '技能ID不能为空',
					data: null
				};
			}
			
			// 获取数据库引用
			const db = uniCloud.database();
			
			// 检查技能是否存在且属于当前用户
			const skillResult = await db.collection('skills').doc(skillId).get();
			if (!skillResult.data || skillResult.data.length === 0) {
				return {
					errCode: 'SKILL_NOT_FOUND',
					errMsg: '技能不存在',
					data: null
				};
			}
			
			const skill = skillResult.data[0];
			if (skill.userId !== userInfo.uid) {
				return {
					errCode: 'PERMISSION_DENIED',
					errMsg: '无权限修改此技能',
					data: null
				};
			}
			
			// 准备更新数据
			const finalUpdateData = {
				...updateData,
				updateTime: new Date()
			};
			
			// 更新数据
			const result = await db.collection('skills').doc(skillId).update(finalUpdateData);
			
			if (result.updated > 0) {
				return {
					errCode: 0,
					errMsg: 'success',
					data: {
						skillId: skillId,
						updated: result.updated
					}
				};
			} else {
				return {
					errCode: 'UPDATE_SKILL_FAILED',
					errMsg: '技能更新失败',
					data: null
				};
			}
			
		} catch (error) {
			return {
				errCode: 'UPDATE_SKILL_ERROR',
				errMsg: '更新技能时发生错误: ' + error.message,
				data: null
			};
		}
	},
	
	/**
	 * 删除技能（软删除）
	 * @param {string} skillId 技能ID
	 * @returns {Object} 返回结果
	 */
	async deleteSkill(skillId) {
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
			if (!skillId) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '技能ID不能为空',
					data: null
				};
			}
			
			// 获取数据库引用
			const db = uniCloud.database();
			
			// 检查技能是否存在且属于当前用户
			const skillResult = await db.collection('skills').doc(skillId).get();
			if (!skillResult.data || skillResult.data.length === 0) {
				return {
					errCode: 'SKILL_NOT_FOUND',
					errMsg: '技能不存在',
					data: null
				};
			}
			
			const skill = skillResult.data[0];
			if (skill.userId !== userInfo.uid) {
				return {
					errCode: 'PERMISSION_DENIED',
					errMsg: '无权限删除此技能',
					data: null
				};
			}
			
			// 软删除（更新状态为-1）
			const result = await db.collection('skills').doc(skillId).update({
				status: -1,
				updateTime: new Date()
			});
			
			if (result.updated > 0) {
				return {
					errCode: 0,
					errMsg: 'success',
					data: {
						skillId: skillId,
						deleted: true
					}
				};
			} else {
				return {
					errCode: 'DELETE_SKILL_FAILED',
					errMsg: '技能删除失败',
					data: null
				};
			}
			
		} catch (error) {
			return {
				errCode: 'DELETE_SKILL_ERROR',
				errMsg: '删除技能时发生错误: ' + error.message,
				data: null
			};
		}
	},

	/**
	 * 测试云对象连接
	 * @returns {Object} 返回测试结果
	 */
	async test() {
		try {
			return {
				errCode: 0,
				errMsg: 'success',
				data: {
					message: '技能云对象连接正常',
					timestamp: new Date().toISOString()
				}
			};
		} catch (error) {
			return {
				errCode: 'TEST_ERROR',
				errMsg: '测试失败: ' + error.message,
				data: null
			};
		}
	},
	
};