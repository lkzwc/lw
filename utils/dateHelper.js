/**
 * 时间处理工具函数
 * 用于统一时间格式化和显示
 */

import { isDev } from '@/config/env.js';

/**
 * 格式化时间为相对时间（如：今天、昨天、3天前）
 * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
 * @param {boolean} includeTime - 是否包含具体时间
 * @returns {string} 格式化后的时间字符串
 */
export const formatRelativeTime = (date, includeTime = false) => {
	if (!date) return '';

	try {
		let dateObj;

		// 处理不同的时间格式
		if (typeof date === 'object' && date.$date) {
			dateObj = new Date(date.$date);
		} else if (date instanceof Date) {
			dateObj = date;
		} else if (typeof date === 'number') {
			dateObj = new Date(date);
		} else if (typeof date === 'string') {
			dateObj = new Date(date);
		} else {
			return '';
		}

		const now = new Date();
		const diff = now - dateObj;

		// 如果日期无效
		if (isNaN(diff)) return '';

		const minute = 60 * 1000;
		const hour = 60 * minute;
		const day = 24 * hour;

		if (diff < minute) {
			return '刚刚';
		} else if (diff < hour) {
			return Math.floor(diff / minute) + '分钟前';
		} else if (diff < day) {
			return Math.floor(diff / hour) + '小时前';
		} else if (diff < 2 * day) {
			return '昨天';
		} else if (diff < 7 * day) {
			return Math.floor(diff / day) + '天前';
		} else {
			// 超过7天显示完整日期
			return formatDate(dateObj, includeTime);
		}
	} catch (error) {
		if (isDev()) {
			console.error('时间格式化错误:', error);
		}
		return '';
	}
};

/**
 * 格式化日期为标准格式
 * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
 * @param {boolean} includeTime - 是否包含具体时间
 * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD 或 YYYY-MM-DD HH:mm)
 */
export const formatDate = (date, includeTime = false) => {
	if (!date) return '';

	try {
		let dateObj;

		if (typeof date === 'object' && date.$date) {
			dateObj = new Date(date.$date);
		} else if (date instanceof Date) {
			dateObj = date;
		} else if (typeof date === 'number') {
			dateObj = new Date(date);
		} else if (typeof date === 'string') {
			dateObj = new Date(date);
		} else {
			return '';
		}

		if (isNaN(dateObj.getTime())) return '';

		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0');
		const day = String(dateObj.getDate()).padStart(2, '0');

		if (includeTime) {
			const hours = String(dateObj.getHours()).padStart(2, '0');
			const minutes = String(dateObj.getMinutes()).padStart(2, '0');
			return `${year}-${month}-${day} ${hours}:${minutes}`;
		}

		return `${year}-${month}-${day}`;
	} catch (error) {
		if (isDev()) {
			console.error('日期格式化错误:', error);
		}
		return '';
	}
};

/**
 * 格式化日期为友好格式（如：2024年1月7日）
 * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
 * @param {boolean} includeTime - 是否包含具体时间
 * @returns {string} 格式化后的日期字符串
 */
export const formatFriendlyDate = (date, includeTime = false) => {
	if (!date) return '';

	try {
		let dateObj;

		if (typeof date === 'object' && date.$date) {
			dateObj = new Date(date.$date);
		} else if (date instanceof Date) {
			dateObj = date;
		} else if (typeof date === 'number') {
			dateObj = new Date(date);
		} else if (typeof date === 'string') {
			dateObj = new Date(date);
		} else {
			return '';
		}

		if (isNaN(dateObj.getTime())) return '';

		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);

		// 判断是否是今天或昨天
		if (dateObj.toDateString() === today.toDateString()) {
			return includeTime ? `今天 ${formatTime(dateObj)}` : '今日';
		} else if (dateObj.toDateString() === yesterday.toDateString()) {
			return includeTime ? `昨天 ${formatTime(dateObj)}` : '昨日';
		} else {
			return dateObj.toLocaleDateString('zh-CN', {
				month: 'long',
				day: 'numeric'
			});
		}
	} catch (error) {
		if (isDev()) {
			console.error('友好日期格式化错误:', error);
		}
		return '';
	}
};

/**
 * 格式化时间（HH:mm）
 * @param {Date|number} date - 日期对象或时间戳
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (date) => {
	if (!date) return '';

	try {
		let dateObj = date instanceof Date ? date : new Date(date);
		if (isNaN(dateObj.getTime())) return '';

		const hours = String(dateObj.getHours()).padStart(2, '0');
		const minutes = String(dateObj.getMinutes()).padStart(2, '0');
		return `${hours}:${minutes}`;
	} catch (error) {
		if (isDev()) {
			console.error('时间格式化错误:', error);
		}
		return '';
	}
};

/**
 * 获取当前时间戳
 * @returns {number} 当前时间戳（毫秒）
 */
export const getTimestamp = () => {
	return Date.now();
};

/**
 * 获取今日的开始时间（00:00:00）
 * @returns {Date} 今日零点时间对象
 */
export const getTodayStart = () => {
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	return now;
};

/**
 * 获取今日的结束时间（23:59:59）
 * @returns {Date} 今日结束时间对象
 */
export const getTodayEnd = () => {
	const now = new Date();
	now.setHours(23, 59, 59, 999);
	return now;
};

export default {
	formatRelativeTime,
	formatDate,
	formatFriendlyDate,
	formatTime,
	getTimestamp,
	getTodayStart,
	getTodayEnd
};
