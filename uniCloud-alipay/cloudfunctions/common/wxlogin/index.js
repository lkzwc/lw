const APPID = 'wxdfe9979725d25ed2'
const SECRET = 'cf39bd3f424dcd580a84990479549c5c'
const WEATHERKEY = '9fbdcab1ae888ab615566e7bb7e8ab22'
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
