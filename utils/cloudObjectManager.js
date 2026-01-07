/**
 * 云对象管理器
 * 用于统一管理云对象的创建和缓存
 */

import { isDev } from '@/config/env.js';
import { CLOUD_OBJECTS } from '@/config/constants.js';

// 云对象缓存
const cloudObjectCache = new Map();

/**
 * 获取云对象实例（带缓存）
 * @param {string} objectName - 云对象名称
 * @param {Object} options - 可选配置
 * @param {boolean} options.customUI - 是否自定义UI
 * @param {Object} options.loadingOptions - 加载选项
 * @returns {Object|null} 云对象实例，失败返回null
 */
export const getCloudObject = (objectName, options = {}) => {
	// 检查缓存
	if (cloudObjectCache.has(objectName)) {
		return cloudObjectCache.get(objectName);
	}

	try {
		// 导入云对象
		const cloudObj = uniCloud.importObject(objectName, {
			customUI: options.customUI || false,
			loadingOptions: options.loadingOptions || {
				title: '加载中...'
			}
		});

		// 缓存云对象
		cloudObjectCache.set(objectName, cloudObj);

		if (isDev()) {
			console.log(`[CloudObjectManager] 云对象 ${objectName} 初始化成功`);
		}

		return cloudObj;
	} catch (error) {
		if (isDev()) {
			console.error(`[CloudObjectManager] 云对象 ${objectName} 初始化失败:`, error);
		}
		return null;
	}
};

/**
 * 清除云对象缓存
 * @param {string} objectName - 云对象名称，不传则清除所有缓存
 */
export const clearCloudObjectCache = (objectName) => {
	if (objectName) {
		cloudObjectCache.delete(objectName);
		if (isDev()) {
			console.log(`[CloudObjectManager] 已清除 ${objectName} 云对象缓存`);
		}
	} else {
		cloudObjectCache.clear();
		if (isDev()) {
			console.log('[CloudObjectManager] 已清除所有云对象缓存');
		}
	}
};

/**
 * 预加载云对象（提前初始化，避免首次调用延迟）
 * @param {Array<string>} objectNames - 云对象名称数组
 */
export const preLoadCloudObjects = async (objectNames) => {
	if (isDev()) {
		console.log('[CloudObjectManager] 开始预加载云对象:', objectNames);
	}

	const promises = objectNames.map(async (objectName) => {
		try {
			await getCloudObject(objectName);
		} catch (error) {
			if (isDev()) {
				console.error(`[CloudObjectManager] 预加载 ${objectName} 失败:`, error);
			}
		}
	});

	await Promise.allSettled(promises);

	if (isDev()) {
		console.log('[CloudObjectManager] 云对象预加载完成');
	}
};

// 便捷方法：获取常用云对象
export const api = () => getCloudObject(CLOUD_OBJECTS.API);
export const community = () => getCloudObject(CLOUD_OBJECTS.COMMUNITY);
export const login = () => getCloudObject(CLOUD_OBJECTS.LOGIN);
export const skills = () => getCloudObject(CLOUD_OBJECTS.SKILLS);
export const upload = () => getCloudObject(CLOUD_OBJECTS.UPLOAD);

export default {
	getCloudObject,
	clearCloudObjectCache,
	preLoadCloudObjects,
	api,
	community,
	login,
	skills,
	upload
};
