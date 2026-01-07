/**
 * 云函数公共配置
 * 敏感信息通过 uniCloud 环境配置管理，不在代码中硬编码
 */

/**
 * 获取云函数环境配置
 * @param {string} key - 配置键名
 * @param {string} defaultValue - 默认值
 * @returns {string} 配置值
 */
function getEnvConfig(key, defaultValue = '') {
	try {
		const cloudEnv = uniCloud.getCloudEnv();
		if (cloudEnv && cloudEnv[key] !== undefined) {
			return cloudEnv[key];
		}
		return defaultValue;
	} catch (error) {
		console.error('获取云函数环境配置失败:', error);
		return defaultValue;
	}
}

/**
 * 应用配置
 */
module.exports = {
	// 微信小程序配置
	wechat: {
		appId: getEnvConfig('WX_APP_ID', ''),
		appSecret: getEnvConfig('WX_APP_SECRET', '')
	},

	// 高德地图配置
	amap: {
		apiKey: getEnvConfig('AMAP_API_KEY', '')
	},

	// JWT 配置
	jwt: {
		secret: getEnvConfig('JWT_SECRET', '')
	},

	// 天气 API 配置
	weather: {
		apiKey: getEnvConfig('WEATHER_API_KEY', '')
	}
};
