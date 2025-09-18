// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129


module.exports = {
	_before: function () { // 通用预处理器

	},
	
	async getUniID(params){
		const APPID = 'wxdfe9979725d25ed2'
		const APP_SECRET= 'cf39bd3f424dcd580a84990479549c5c'

		const res = await uniCloud.httpclient.request(`https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${APP_SECRET}&js_code=${params}&grant_type=authorization_code`)
		
		const result = JSON.parse(res?.data?.toString('utf8')).openid
		
		let userData = {
			openid: res.data.openid,
			nickName: '微信用户xxx',
		}
		
		let dbRes = await db.collection("users").where({
			openid: res.data.openid
		}).get()
		
		if(dbRes.affectedDocs <= 0){
			await db.collection("users").add(userData)
		}else{
			userData = dbRes.data[0]
		}
		userData['token'] = getToken(res.data.openid)
		delete userData['openid']
		
		// 返回结果
		// return {
		// 	userData //请根据实际需要返回值
		// }
		
		return result
	},
	async update(params){
		const {
			userInfo,
			token,
		} = params;
		
		const db = uniCloud.database()
		
		// 更新
		await db.collection("users").where({
			openid: getUidByToken(token)
		}).update({...userInfo})
		
		// 查询
		let user = await db.collection("users").where({
			openid: getUidByToken(token)
		}).get()
		
		const userRes = user.data[0]
		
		return {
			userRes
		}
	}
}
