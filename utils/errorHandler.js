/**
 * 全局错误处理工具
 * 统一处理应用中的错误，提供友好的用户提示
 */

import { ERROR_MESSAGES } from '@/config/constants.js';
import { logError, formatErrorMessage } from '@/utils/logger.js';

/**
 * 处理错误并显示用户友好的提示
 * @param {Error|Object|string} error - 错误对象
 * @param {Object} options - 配置选项
 * @param {string} options.context - 错误上下文（用于日志）
 * @param {boolean} options.showToast - 是否显示Toast提示，默认true
 * @param {string} options.defaultMessage - 默认错误消息
 * @param {Function} options.onSuccess - 成功回调
 * @param {Function} options.onError - 错误回调
 * @returns {string} 错误消息
 */
export const handleError = (error, options = {}) => {
	const {
		context = '',
		showToast = true,
		defaultMessage = '操作失败，请重试',
		onSuccess,
		onError
	} = options;

	// 格式化错误消息
	let errorMessage = formatErrorMessage(error);

	// 如果没有具体的错误消息，使用默认消息
	if (!errorMessage || errorMessage === '未知错误') {
		errorMessage = defaultMessage;
	}

	// 记录错误日志
	logError(context || 'ErrorHandler', error);

	// 显示用户提示
	if (showToast) {
		uni.showToast({
			title: errorMessage,
			icon: 'none',
			duration: 2000
		});
	}

	// 执行错误回调
	if (typeof onError === 'function') {
		onError(error, errorMessage);
	}

	return errorMessage;
};

/**
 * 处理API响应错误
 * @param {Object} response - API响应对象
 * @param {string} context - 错误上下文
 * @returns {boolean} 是否成功
 */
export const handleApiResponse = (response, context = '') => {
	if (!response) {
		handleError(new Error('响应为空'), { context, showToast: true });
		return false;
	}

	// 检查errCode
	if (response.errCode !== 0) {
		const error = new Error(response.errMsg || ERROR_MESSAGES.BUSINESS_ERROR);
		handleError(error, { context });
		return false;
	}

	return true;
};

/**
 * 处理网络请求错误
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文
 * @returns {string} 错误消息
 */
export const handleNetworkError = (error, context = '网络请求') => {
	let errorMessage = ERROR_MESSAGES.NETWORK_ERROR;

	// 判断错误类型
	if (error.message) {
		if (error.message.includes('timeout') || error.message.includes('超时')) {
			errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
		} else if (error.message.includes('network') || error.message.includes('network')) {
			errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
		} else {
			errorMessage = error.message;
		}
	}

	logError(context, error);

	uni.showToast({
		title: errorMessage,
		icon: 'none',
		duration: 2000
	});

	return errorMessage;
};

/**
 * 处理权限错误
 * @param {string} permissionType - 权限类型
 * @returns {void}
 */
export const handlePermissionError = (permissionType) => {
	const message = '需要相关权限才能继续操作';

	logError('权限错误', `缺少权限: ${permissionType}`);

	uni.showModal({
		title: '权限提示',
		content: message,
		showCancel: false,
		success: () => {
			// 可以在这里跳转到设置页面
			// uni.openSetting();
		}
	});
};

/**
 * 处理验证错误
 * @param {Array<string>} errors - 错误信息数组
 * @returns {void}
 */
export const handleValidationError = (errors) => {
	if (!errors || errors.length === 0) return;

	const message = errors[0]; // 显示第一个错误

	logError('验证错误', errors);

	uni.showToast({
		title: message,
		icon: 'none',
		duration: 2000
	});
};

/**
 * 异步错误处理包装器
 * 自动捕获异步函数中的错误并统一处理
 * @param {Function} asyncFn - 异步函数
 * @param {Object} options - 错误处理选项
 * @returns {Promise} 包装后的Promise
 */
export const withErrorHandler = (asyncFn, options = {}) => {
	return async (...args) => {
		try {
			const result = await asyncFn(...args);

			// 检查响应是否有错误
			if (result && typeof result === 'object' && result.errCode !== 0) {
				throw new Error(result.errMsg || ERROR_MESSAGES.BUSINESS_ERROR);
			}

			return result;
		} catch (error) {
			return handleError(error, options);
		}
	};
};

/**
 * 创建错误边界
 * 在uni-app中用于捕获组件中的错误
 * @param {Object} vueInstance - Vue实例
 * @param {string} componentName - 组件名称
 */
export const createErrorBoundary = (vueInstance, componentName) => {
	const originalError = vueInstance.$options.errorCaptured;

	vueInstance.$options.errorCaptured = (err, vm, info) => {
		logError(`ErrorBoundary[${componentName}]`, err, { info, component: vm?.$options?.name });

		// 如果有原始的错误处理器，调用它
		if (typeof originalError === 'function') {
			return originalError.call(vueInstance, err, vm, info);
		}

		// 阻止错误继续传播
		return false;
	};
};

export default {
	handleError,
	handleApiResponse,
	handleNetworkError,
	handlePermissionError,
	handleValidationError,
	withErrorHandler,
	createErrorBoundary
};
