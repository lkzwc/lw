// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const {
	getUidByToken,
	getToken
} = require('wxlogin')

module.exports = {
	_before: function () { // 通用预处理器

	},
	
	/**
	 * 微信登录，获取用户信息并存储到数据库
	 * @param {string} code - 微信登录临时凭证
	 */
	async getUserProfile(code){
		const APPID = 'wxdfe9979725d25ed2'
		const APP_SECRET= 'cf39bd3f424dcd580a84990479549c5c'

		try {
			// 通过code获取openid和session_key
			const res = await uniCloud.httpclient.request(
				`https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`
			)
			
			const wxData = JSON.parse(res?.data?.toString('utf8'))
			
			if (wxData.errcode) {
				throw new Error(`微信登录失败: ${wxData.errmsg}`)
			}
			
			const { openid, session_key } = wxData
			
			// 查询数据库中是否已存在该用户
			const db = uniCloud.database()
			const userCollection = db.collection('users')
			
			let existingUser = await userCollection.where({ openid }).get()
			
			if (existingUser.data.length > 0) {
				// 用户已存在，更新最后登录时间
				const userId = existingUser.data[0]._id
				await userCollection.doc(userId).update({
					last_login_time: new Date()
				})
				
				// 获取更新后的用户信息
				const updatedUser = await userCollection.doc(userId).get()
				
				return {
					token: getToken(openid),
					userInfo: updatedUser.data[0],
					isNewUser: false
				}
			} else {
				// 新用户，创建用户记录
				const newUser = {
					openid: openid,
					nickname: `微信用户${openid.slice(-6)}`,
					avatar: '',
					building: '',
					points: 0,
					last_login_time: new Date(),
					register_time: new Date(),
					status: 0
				}
				
				const insertResult = await userCollection.add(newUser)
				
				// 获取创建的用户信息
				const createdUser = await userCollection.doc(insertResult.id).get()
				
				return {
					token: getToken(openid),
					userInfo: createdUser.data[0],
					isNewUser: true
				}
			}
		} catch (error) {
			console.error('登录失败:', error)
			throw error
		}
	},
	
	/**
	 * 更新用户信息
	 * @param {Object} params - 参数对象
	 * @param {Object} params.userInfo - 要更新的用户信息
	 * @param {string} params.token - 用户token
	 */
	async updateUserInfo(params){
		const { userInfo, token } = params;
		
		try {
			const openid = getUidByToken(token)
			if (!openid) {
				throw new Error('无效的token')
			}
			
			const db = uniCloud.database()
			const userCollection = db.collection('users')
			
			// 构建更新数据，只更新允许的字段
			const allowedFields = ['nickname', 'avatar', 'building']
			const updateData = {}
			
			for (const field of allowedFields) {
				if (userInfo.hasOwnProperty(field)) {
					updateData[field] = userInfo[field]
				}
			}
			
			// 更新用户信息
			await userCollection.where({ openid }).update(updateData)
			
			// 查询更新后的用户信息
			const updatedUser = await userCollection.where({ openid }).get()
			
			if (updatedUser.data.length === 0) {
				throw new Error('用户不存在')
			}
			
			return {
				success: true,
				userInfo: updatedUser.data[0]
			}
		} catch (error) {
			console.error('更新用户信息失败:', error)
			throw error
		}
	},
	
	/**
	 * 获取用户信息
	 * @param {string} token - 用户token
	 */
	async getUserInfo(token) {
		try {
			const openid = getUidByToken(token)
			if (!openid) {
				throw new Error('无效的token')
			}
			
			const db = uniCloud.database()
			const userCollection = db.collection('users')
			
			const userResult = await userCollection.where({ openid }).get()
			
			if (userResult.data.length === 0) {
				throw new Error('用户不存在')
			}
			
			return {
				success: true,
				userInfo: userResult.data[0]
			}
		} catch (error) {
			console.error('获取用户信息失败:', error)
			throw error
		}
	},
	
	// 兼容旧方法名
	async update(params) {
		return await this.updateUserInfo(params)
	}
}
