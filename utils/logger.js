/**
 * 统一日志系统
 * 根据环境配置输出不同级别的日志
 */

import { isDev, getEnv } from '@/config/env.js';

// 日志级别
const LOG_LEVELS = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3,
	NONE: 4
};

// 获取当前日志级别
const getCurrentLogLevel = () => {
	const envConfig = getEnv('logLevel');
	return LOG_LEVELS[envConfig?.toUpperCase()] || LOG_LEVELS.DEBUG;
};

/**
 * 调试日志（仅在开发环境）
 * @param {string} tag - 日志标签
 * @param {*} message - 日志消息
 * @param {...*} args - 额外参数
 */
export const logDebug = (tag, message, ...args) => {
	if (!isDev()) return;

	const currentLevel = getCurrentLogLevel();
	if (currentLevel <= LOG_LEVELS.DEBUG) {
		console.log(`[${tag}]`, message, ...args);
	}
};

/**
 * 信息日志
 * @param {string} tag - 日志标签
 * @param {*} message - 日志消息
 * @param {...*} args - 额外参数
 */
export const logInfo = (tag, message, ...args) => {
	const currentLevel = getCurrentLogLevel();
	if (currentLevel <= LOG_LEVELS.INFO) {
		console.log(`[${tag}]`, message, ...args);
	}
};

/**
 * �告日志
 * @param {string} tag - 日志标签
 * @param {*} message - 日志消息
 * @param {...*} args - 额外参数
 */
export const logWarn = (tag, message, ...args) => {
	const currentLevel = getCurrentLogLevel();
	if (currentLevel <= LOG_LEVELS.WARN) {
		console.warn(`[${tag}]`, message, ...args);
	}
};

/**
 * 错误日志（所有环境都会记录）
 * @param {string} tag - 日志标签
 * @param {Error|string} error - 错误对象或消息
 * @param {...*} args - 额外参数
 */
export const logError = (tag, error, ...args) => {
	const currentLevel = getCurrentLogLevel();
	if (currentLevel <= LOG_LEVELS.ERROR) {
		console.error(`[${tag}]`, error, ...args);

		// TODO: 可选 - 上报错误到监控系统
		// reportErrorToMonitoring(tag, error, ...args);
	}
};

/**
 * 性能日志
 * @param {string} tag - 日志标签
 * @param {string} message - 日志消息
 * @param {number} duration - 持续时间（毫秒）
 */
export const logPerformance = (tag, message, duration) => {
	const currentLevel = getCurrentLogLevel();
	if (currentLevel <= LOG_LEVELS.INFO && isDev()) {
		console.log(`[${tag}] [性能]`, message, `${duration}ms`);
	}
};

/**
 * 网络请求日志
 * @param {string} tag - 日志标签
 * @param {Object} request - 请求信息
 * @param {Object} response - 响应信息
 */
export const logNetwork = (tag, request, response) => {
	const currentLevel = getCurrentLogLevel();
	if (currentLevel <= LOG_LEVELS.INFO && isDev()) {
		console.log(`[${tag}] [网络]`, {
			url: request?.url,
			method: request?.method,
			status: response?.status,
			duration: request?.duration
		});
	}
};

/**
 * 用户行为日志
 * @param {string} tag - 日志标签
 * @param {string} action - 用户行为
 * @param {Object} data - 相关数据
 */
export const logUserAction = (tag, action, data) => {
	const currentLevel = getCurrentLogLevel();
	if (currentLevel <= LOG_LEVELS.INFO && isDev()) {
		console.log(`[${tag}] [行为]`, action, data);
	}
};

/**
 * 格式化错误信息
 * @param {Error|Object|string} error - 错误对象
 * @returns {string} 格式化后的错误消息
 */
export const formatErrorMessage = (error) => {
	if (!error) return '未知错误';

	if (typeof error === 'string') return error;

	if (error instanceof Error) {
		return error.message || '未知错误';
	}

	if (error.errMsg) return error.errMsg;

	if (error.message) return error.message;

	if (error.data?.errMsg) return error.data.errMsg;

	return '未知错误';
};

export default {
	logDebug,
	logInfo,
	logWarn,
	logError,
	logPerformance,
	logNetwork,
	logUserAction,
	formatErrorMessage
};
