const APPID = 'wxdfe9979725d25ed2'
const SECRET = '39a5624cce93252ba8e989da2a677bef'
const WEATHERKEY ='bcb3d565552a41c1d9535681d93057d6'
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
