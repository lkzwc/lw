/**
 * 全局常量定义
 */

// 云对象名称
export const CLOUD_OBJECTS = {
	API: 'api',
	COMMUNITY: 'community',
	LOGIN: 'login',
	SKILLS: 'skills',
	UPLOAD: 'upload'
};

// 存储键名
export const STORAGE_KEYS = {
	TOKEN: 'token',
	USER_INFO: 'userInfo',
	USER_SETTINGS: 'userSettings'
};

// 错误码
export const ERROR_CODES = {
	NETWORK_ERROR: 'NETWORK_ERROR',
	TIMEOUT_ERROR: 'TIMEOUT_ERROR',
	AUTH_ERROR: 'AUTH_ERROR',
	PERMISSION_ERROR: 'PERMISSION_ERROR',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	BUSINESS_ERROR: 'BUSINESS_ERROR'
};

// 业务错误消息
export const ERROR_MESSAGES = {
	NETWORK_ERROR: '网络连接失败，请检查网络',
	TIMEOUT_ERROR: '请求超时，请重试',
	AUTH_ERROR: '登录已过期，请重新登录',
	PERMISSION_ERROR: '没有操作权限',
	VALIDATION_ERROR: '数据验证失败',
	BUSINESS_ERROR: '操作失败，请重试'
};

// 默认配置
export const DEFAULT_CONFIG = {
	// 分页配置
	PAGE_SIZE: 10,
	MAX_PAGE_SIZE: 100,

	// 图片配置
	MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
	IMAGE_QUALITY: 80,
	ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],

	// 文件上传配置
	UPLOAD_TIMEOUT: 30000, // 30秒

	// 请求配置
	REQUEST_TIMEOUT: 15000, // 15秒
	RETRY_COUNT: 3,

	// 缓存配置
	CACHE_EXPIRE_TIME: 5 * 60 * 1000 // 5分钟
};

// 技能分类
export const SKILL_CATEGORIES = [
	{ label: '全部', value: 'all' },
	{ label: '家政服务', value: 'housekeeping' },
	{ label: '维修服务', value: 'repair' },
	{ label: '教育培训', value: 'education' },
	{ label: '美容美发', value: 'beauty' },
	{ label: '健康服务', value: 'health' },
	{ label: '其他', value: 'other' }
];

// 社区帖子分类
export const POST_CATEGORIES = [
	{ id: 'all', name: '全部' },
	{ id: '公告', name: '公告' },
	{ id: '业主', name: '业主' },
	{ id: '举报', name: '举报' },
	{ id: '畅玩', name: '畅玩' },
	{ id: '跳蚤', name: '跳蚤' },
	{ id: '活动', name: '活动' }
];

// 公告标签
export const ANNOUNCEMENT_TAGS = {
	ANNOUNCEMENT: 'announcement',
	PROPERTY: 'property'
};

export default {
	CLOUD_OBJECTS,
	STORAGE_KEYS,
	ERROR_CODES,
	ERROR_MESSAGES,
	DEFAULT_CONFIG,
	SKILL_CATEGORIES,
	POST_CATEGORIES,
	ANNOUNCEMENT_TAGS
};
