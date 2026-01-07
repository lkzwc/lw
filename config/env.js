/**
 * 环境配置管理
 * 用于管理不同环境（开发、测试、生产）的配置信息
 */

// 当前环境：可通过 process.env.NODE_ENV 或自定义设置
const ENV = process.env.NODE_ENV || 'development';

// 环境配置
const ENV_CONFIG = {
	development: {
		// API 基础配置
		apiBaseUrl: '', // uniCloud 自动处理

		// 日志级别：debug, info, warn, error, none
		logLevel: 'debug',

		// 功能开关
		enableMockData: false,
		enableConsoleLog: true,

		// 业务配置
		cloudEnv: 'development'
	},

	production: {
		apiBaseUrl: '',

		// 生产环境只记录错误日志
		logLevel: 'error',

		// 功能开关
		enableMockData: false,
		enableConsoleLog: false,

		// 业务配置
		cloudEnv: 'production'
	}
};

// 获取当前环境配置
export const getConfig = () => {
	return ENV_CONFIG[ENV] || ENV_CONFIG.development;
};

// 获取特定配置项
export const getEnv = (key) => {
	const config = getConfig();
	return config[key];
};

// 判断是否为开发环境
export const isDev = () => ENV === 'development';

// 判断是否为生产环境
export const isProd = () => ENV === 'production';

// 获取当前环境名称
export const getEnvName = () => ENV;

export default {
	getConfig,
	getEnv,
	isDev,
	isProd,
	getEnvName
};
