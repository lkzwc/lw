// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
// 引入配置

const {
	WEATHERKEY
} = require('wxlogin')

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
			
			
			// 构建请求URL
			const apiUrl = `https://restapi.amap.com/v3/weather/weatherInfo?city=${city}&key=${WEATHERKEY}&extensions=${extensions}&output=JSON`;
			
			// 发起HTTP请求
			const response = await uniCloud.request({
				url: apiUrl,
				method: 'GET',
				timeout: 10000
			});
			
			// 检查API返回状态
			if (response.data?.status === '0') {
				return {
					errCode: 'WEATHER_API_ERROR',
					errMsg: weatherData.info || '天气数据获取失败',
					data: null
				}
			}
			
			// 格式化返回数据
			const live = response.data?.lives[0];
				
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: {
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
				}
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

			console.log('新闻数据:', response);
			

			// 检查API返回状态
			if (response.data.code !== 200) {
				return {
					errCode: 'NEWS_API_ERROR',
					errMsg: '新闻数据获取失败',
					data: null
				}
			}

			const newsData = response.data?.data;
			
			// 格式化返回数据
			const formattedData = {
				date: newsData.date || new Date().toISOString().split('T')[0],
				news: newsData.news || [],
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

			console.log("response",response)
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