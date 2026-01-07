// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
// 引入配置
const config = require('../common/config.js')

module.exports = {
	_before: function () { // 通用预处理器

	},
	
	/**
	 * 获取天气信息
	 * @param {string} city 城市编码，如：110101（北京市东城区）
	 * @param {string} extensions 气象类型，base:实况天气，all:预报天气，默认base
	 * @returns {object} 返回天气信息
	 */
	async getWeather(city = '610111', extensions = 'base') {
		try {
			// 参数校验
			if (!city) {
				return {
					errCode: 'PARAM_IS_NULL',
					errMsg: '城市编码不能为空',
					data: null
				}
			}
			
			// 高德地图API Key
			const AMAP_KEY = config.amap.key;
			
			// 构建请求URL
			const apiUrl = `https://restapi.amap.com/v3/weather/weatherInfo?city=${city}&key=${AMAP_KEY}&extensions=${extensions}&output=JSON`;
			
			// 发起HTTP请求
			const response = await uniCloud.request({
				url: apiUrl,
				method: 'GET',
				timeout: 10000
			});
			
			// 解析响应数据
			let weatherData;
			if (typeof response.data === 'string') {
				weatherData = JSON.parse(response.data);
			} else {
				weatherData = response.data;
			}
			
			// 检查API返回状态
			if (weatherData.status !== '1') {
				return {
					errCode: 'WEATHER_API_ERROR',
					errMsg: weatherData.info || '天气数据获取失败',
					data: null
				}
			}
			
			// 格式化返回数据
			let formattedData = {};
			
			if (extensions === 'base' && weatherData.lives && weatherData.lives.length > 0) {
				// 实况天气数据
				const live = weatherData.lives[0];
				
				formattedData = {
					type: 'live',
					province: live.province,
					city: live.city,
					adcode: live.adcode,
					weather: live.weather,
					temperature: live.temperature,
					winddirection: live.winddirection,
					windpower: live.windpower,
					humidity: live.humidity,
					reporttime: live.reporttime
				};
			} else if (extensions === 'all' && weatherData.forecasts && weatherData.forecasts.length > 0) {
				// 预报天气数据
				const forecast = weatherData.forecasts[0];
				
				formattedData = {
					type: 'forecast',
					province: forecast.province,
					city: forecast.city,
					adcode: forecast.adcode,
					reporttime: forecast.reporttime,
					casts: forecast.casts
				};
			}
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: formattedData
			};
			
		} catch (error) {
			// 记录真实错误
			console.error('获取天气数据失败:', error);
			
			return {
				errCode: 'WEATHER_API_ERROR',
				errMsg: error.message || '天气数据获取失败',
				data: null
			};
		}
	},
	
	/**
	 * 根据城市名称获取天气（支持中文城市名）
	 * @param {string} cityName 城市名称，如：北京、上海、广州
	 * @returns {object} 返回天气信息
	 */
	async getWeatherByCityName() {
		// 默认返回西安灞桥区的天气
		return await this.getWeather('610111', 'base');
	},
	
	/**
	 * 获取每日60秒新闻
	 * @returns {object} 返回新闻信息
	 */
	async getDailyNews() {
		try {
			// 发起HTTP请求
			const response = await uniCloud.request({
				url: 'https://60s.viki.moe/v2/60s',
				method: 'GET',
				timeout: 15000
			});

			console.log('response:', response);
			
			// 解析响应数据
			let newsData;
			if (typeof response.data === 'string') {
				newsData = JSON.parse(response.data);
			} else {
				newsData = response.data;
			}

			// 检查API返回状态
			if (response.status !== 200) {
				return {
					errCode: 'NEWS_API_ERROR',
					errMsg: '新闻数据获取失败',
					data: null
				}
			}
			
			// 格式化返回数据
			const formattedData = {
				date: newsData.date || new Date().toISOString().split('T')[0],
				news: newsData.news || [],
				tip: newsData.tip || '',
				image: newsData.image || '',
				head: newsData.head || '每日60秒读懂世界',
				updated: new Date().toISOString()
			};
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: formattedData
			};
			
		} catch (error) {
			// 记录真实错误
			console.error('获取每日新闻失败:', error);
			
			return {
				errCode: 'NEWS_API_ERROR',
				errMsg: error.message || '新闻数据获取失败',
				data: null
			};
		}
	},
	
	/**
	 * 获取AI新闻快讯
	 * @returns {object} 返回AI新闻信息
	 */
	async getAINews() {
		try {
			// 发起HTTP请求
			const response = await uniCloud.request({
				url: 'https://60s.viki.moe/v2/ai-news',
				method: 'GET',
				timeout: 15000
			});
			
			// 解析响应数据
			let newsData;
			if (typeof response.data === 'string') {
				newsData = JSON.parse(response.data);
			} else {
				newsData = response.data;
			}

			// 检查API返回状态
			if (response.status !== 200) {
				return {
					errCode: 'AI_NEWS_API_ERROR',
					errMsg: 'AI新闻数据获取失败',
					data: null
				}
			}
			
			// 格式化返回数据
			const formattedData = {
				date: newsData.date || new Date().toISOString().split('T')[0],
				news: newsData.news || [],
				tip: newsData.tip || '',
				image: newsData.image || '',
				head: newsData.head || 'AI快讯',
				updated: new Date().toISOString()
			};
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: formattedData
			};
			
		} catch (error) {
			// 记录真实错误
			console.error('获取AI新闻失败:', error);
			
			return {
				errCode: 'AI_NEWS_API_ERROR',
				errMsg: error.message || 'AI新闻数据获取失败',
				data: null
			};
		}
	}
}