/**
 * 通用上传工具函数
 * 基于uniCloud云存储的文件上传工具
 */

// 云对象实例
let uploadObj = null;

/**
 * 初始化上传云对象
 */
const initUploadObj = () => {
	if (!uploadObj) {
		try {
			uploadObj = uniCloud.importObject('upload');
		} catch (error) {
			console.error('上传云对象初始化失败:', error);
			throw new Error('上传服务初始化失败');
		}
	}
	return uploadObj;
};

/**
 * 选择并上传图片
 * @param {Object} options 配置选项
 * @param {number} options.maxCount 最大选择数量，默认9
 * @param {string} options.module 模块名称，默认'common'
 * @param {Array} options.sizeType 图片尺寸类型，默认['compressed']
 * @param {Array} options.sourceType 图片来源，默认['album', 'camera']
 * @returns {Promise} 返回上传结果
 */
export const chooseAndUploadImages = (options = {}) => {
	const {
		maxCount = 9,
		module = 'common',
		sizeType = ['compressed'],
		sourceType = ['album', 'camera']
	} = options;

	return new Promise((resolve, reject) => {
		// 选择图片
		uni.chooseImage({
			count: maxCount,
			sizeType: sizeType,
			sourceType: sourceType,
			success: async (res) => {
				try {
					// 上传图片
					const uploadResult = await uploadImages(res.tempFilePaths, module);
					resolve(uploadResult);
				} catch (error) {
					reject(error);
				}
			},
			fail: (error) => {
				reject(new Error('选择图片失败'));
			}
		});
	});
};

/**
 * 上传图片数组
 * @param {Array} filePaths 文件路径数组
 * @param {string} module 模块名称
 * @returns {Promise} 返回上传结果
 */
export const uploadImages = async (filePaths, module = 'common') => {
	try {
		const uploadObjInstance = initUploadObj();
		
		// 调用云对象批量上传
		const result = await uploadObjInstance.uploadFiles({
			filePaths: filePaths,
			module: module
		});

		if (result.errCode === 0) {
			return {
				success: true,
				data: result.data,
				message: '上传成功'
			};
		} else {
			throw new Error(result.errMsg || '上传失败');
		}
	} catch (error) {
		console.error('上传图片失败:', error);
		throw error;
	}
};

/**
 * 上传单个文件
 * @param {string} filePath 文件路径
 * @param {string} module 模块名称
 * @param {string} cloudPath 云端路径（可选）
 * @returns {Promise} 返回上传结果
 */
export const uploadFile = async (filePath, module = 'common', cloudPath = '') => {
	try {
		const uploadObjInstance = initUploadObj();
		
		// 调用云对象上传单个文件
		const result = await uploadObjInstance.uploadFile({
			filePath: filePath,
			module: module,
			cloudPath: cloudPath
		});

		if (result.errCode === 0) {
			return {
				success: true,
				data: result.data,
				message: '上传成功'
			};
		} else {
			throw new Error(result.errMsg || '上传失败');
		}
	} catch (error) {
		console.error('上传文件失败:', error);
		throw error;
	}
};

/**
 * 删除云存储文件
 * @param {Array} fileIDs 文件ID数组
 * @returns {Promise} 返回删除结果
 */
export const deleteFiles = async (fileIDs) => {
	try {
		const uploadObjInstance = initUploadObj();
		
		// 调用云对象删除文件
		const result = await uploadObjInstance.deleteFiles({
			fileIDs: fileIDs
		});

		if (result.errCode === 0) {
			return {
				success: true,
				data: result.data,
				message: '删除成功'
			};
		} else {
			throw new Error(result.errMsg || '删除失败');
		}
	} catch (error) {
		console.error('删除文件失败:', error);
		throw error;
	}
};

/**
 * 获取文件临时访问地址
 * @param {Array} fileIDs 文件ID数组
 * @returns {Promise} 返回文件访问地址
 */
export const getTempFileURLs = async (fileIDs) => {
	try {
		const uploadObjInstance = initUploadObj();
		
		// 调用云对象获取临时地址
		const result = await uploadObjInstance.getTempFileURLs({
			fileIDs: fileIDs
		});

		if (result.errCode === 0) {
			return {
				success: true,
				data: result.data,
				message: '获取成功'
			};
		} else {
			throw new Error(result.errMsg || '获取地址失败');
		}
	} catch (error) {
		console.error('获取文件地址失败:', error);
		throw error;
	}
};

/**
 * 压缩图片
 * @param {string} src 图片路径
 * @param {Object} options 压缩选项
 * @returns {Promise} 返回压缩后的图片路径
 */
export const compressImage = (src, options = {}) => {
	const {
		quality = 0.8,
		width = 'auto',
		height = 'auto'
	} = options;

	return new Promise((resolve, reject) => {
		uni.compressImage({
			src: src,
			quality: quality,
			width: width,
			height: height,
			success: (res) => {
				resolve(res.tempFilePath);
			},
			fail: (error) => {
				reject(new Error('图片压缩失败'));
			}
		});
	});
};

/**
 * 获取图片信息
 * @param {string} src 图片路径
 * @returns {Promise} 返回图片信息
 */
export const getImageInfo = (src) => {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src: src,
			success: (res) => {
				resolve(res);
			},
			fail: (error) => {
				reject(new Error('获取图片信息失败'));
			}
		});
	});
};

export default {
	chooseAndUploadImages,
	uploadImages,
	uploadFile,
	deleteFiles,
	getTempFileURLs,
	compressImage,
	getImageInfo
};