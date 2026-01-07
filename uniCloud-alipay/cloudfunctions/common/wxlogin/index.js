const APPID = 'wxdfe9979725d25ed2'
// 引入配置
const config = require('./config.js')

const SECRET = config.jwt.secret
const WEATHERKEY = config.weather.apiKey
const jwt = require('jsonwebtoken')

function getToken( openId){
	return jwt.sign({
		iat: Math.floor(Date.now() / 1000) + (60 * 60 * 30),
		data: openId
	},SECRET)
}


function getUidByToken(token){
	return jwt.verify(token,SECRET)?.data
}


module.exports = {
	APPID,
	SECRET,
	WEATHERKEY,
	getToken,
	getUidByToken
}
