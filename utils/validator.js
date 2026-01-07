/**
 * 数据验证工具函数
 */

/**
 * 验证是否为空值（null, undefined, '', [], {}）
 * @param {*} value - 待验证的值
 * @returns {boolean} 是否为空
 */
export const isEmpty = (value) => {
	if (value === null || value === undefined) return true;
	if (typeof value === 'string') return value.trim() === '';
	if (Array.isArray(value)) return value.length === 0;
	if (typeof value === 'object') return Object.keys(value).length === 0;
	return false;
};

/**
 * 验证手机号（中国大陆）
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
export const isValidPhone = (phone) => {
	if (!phone || typeof phone !== 'string') return false;
	const phoneRegex = /^1[3-9]\d{9}$/;
	return phoneRegex.test(phone);
};

/**
 * 验证邮箱地址
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export const isValidEmail = (email) => {
	if (!email || typeof email !== 'string') return false;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

/**
 * 验证URL地址
 * @param {string} url - URL地址
 * @returns {boolean} 是否有效
 */
export const isValidUrl = (url) => {
	if (!url || typeof url !== 'string') return false;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

/**
 * 验证身份证号（中国大陆）
 * @param {string} idCard - 身份证号
 * @returns {boolean} 是否有效
 */
export const isValidIdCard = (idCard) => {
	if (!idCard || typeof idCard !== 'string') return false;
	const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
	return idCardRegex.test(idCard);
};

/**
 * 验证金额格式（支持小数点后两位）
 * @param {string|number} amount - 金额
 * @returns {boolean} 是否有效
 */
export const isValidAmount = (amount) => {
	if (amount === null || amount === undefined || amount === '') return false;
	const amountRegex = /^\d+(\.\d{1,2})?$/;
	return amountRegex.test(String(amount));
};

/**
 * 验证昵称（2-20个字符）
 * @param {string} nickname - 昵称
 * @returns {boolean} 是否有效
 */
export const isValidNickname = (nickname) => {
	if (!nickname || typeof nickname !== 'string') return false;
	const trimmed = nickname.trim();
	return trimmed.length >= 2 && trimmed.length <= 20;
};

/**
 * 验证密码强度（至少8位，包含字母和数字）
 * @param {string} password - 密码
 * @returns {boolean} 是否有效
 */
export const isValidPassword = (password) => {
	if (!password || typeof password !== 'string') return false;
	const hasLetter = /[a-zA-Z]/.test(password);
	const hasNumber = /\d/.test(password);
	return password.length >= 8 && hasLetter && hasNumber;
};

/**
 * 验证文件类型
 * @param {string} fileName - 文件名
 * @param {Array<string>} allowedTypes - 允许的文件类型数组
 * @returns {boolean} 是否有效
 */
export const isValidFileType = (fileName, allowedTypes = []) => {
	if (!fileName || typeof fileName !== 'string') return false;
	const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
	return allowedTypes.some(type => {
		const allowedExt = type.startsWith('.') ? type : `.${type}`;
		return ext === allowedExt;
	});
};

/**
 * 验证文件大小
 * @param {number} fileSize - 文件大小（字节）
 * @param {number} maxSize - 最大文件大小（字节）
 * @returns {boolean} 是否有效
 */
export const isValidFileSize = (fileSize, maxSize) => {
	if (typeof fileSize !== 'number' || fileSize <= 0) return false;
	return fileSize <= maxSize;
};

/**
 * 验证图片格式
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否为图片
 */
export const isImageFile = (fileName) => {
	if (!fileName || typeof fileName !== 'string') return false;
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
	const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
	return imageExtensions.includes(ext);
};

/**
 * 截断文本（超出指定长度时添加省略号）
 * @param {string} text - 原文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀，默认为'...'
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength, suffix = '...') => {
	if (!text || typeof text !== 'string') return '';
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + suffix;
};

/**
 * 清理HTML标签（防止XSS）
 * @param {string} html - HTML字符串
 * @returns {string} 清理后的纯文本
 */
export const stripHtmlTags = (html) => {
	if (!html || typeof html !== 'string') return '';
	return html.replace(/<[^>]*>/g, '');
};

/**
 * 转义HTML特殊字符
 * @param {string} text - 原文本
 * @returns {string} 转义后的文本
 */
export const escapeHtml = (text) => {
	if (!text || typeof text !== 'string') return '';
	const htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;'
	};
	return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
};

export default {
	isEmpty,
	isValidPhone,
	isValidEmail,
	isValidUrl,
	isValidIdCard,
	isValidAmount,
	isValidNickname,
	isValidPassword,
	isValidFileType,
	isValidFileSize,
	isImageFile,
	truncateText,
	stripHtmlTags,
	escapeHtml
};
