// 通用文件上传云对象
module.exports = {
	_before: function () {
		// 通用预处理器
	},
	
	/**
	 * 获取当前用户信息
	 * @returns {object} 用户信息
	 */
	async getCurrentUser() {
		try {
			const userInfo = this.getUniIdToken();
			if (!userInfo || !userInfo.uid) {
				return {
					errCode: 'UNAUTHORIZED',
					errMsg: '用户未登录'
				};
			}
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: userInfo
			};
		} catch (error) {
			return {
				errCode: 'GET_USER_FAILED',
				errMsg: '获取用户信息失败'
			};
		}
	},
	
	/**
	 * 上传单个文件到云存储
	 * @param {Object} params 上传参数
	 * @param {string} params.filePath 本地文件路径
	 * @param {string} params.cloudPath 云端存储路径
	 * @param {string} params.module 模块名称 (skills, community, report等)
	 * @returns {Object} 上传结果
	 */
	async uploadFile(params) {
		try {
			
			const { filePath, cloudPath, module = 'common' } = params;
			
			// 参数验证
			if (!filePath) {
				return {
					errCode: 'INVALID_PARAMS',
					errMsg: '文件路径不能为空'
				};
			}
			
			// 生成云端路径
			let finalCloudPath = cloudPath;
			if (!finalCloudPath) {
				const timestamp = Date.now();
				const randomStr = Math.random().toString(36).substring(2);
				const fileExt = filePath.substring(filePath.lastIndexOf('.'));
				finalCloudPath = `${module}/${userInfo.data.uid}/${timestamp}_${randomStr}${fileExt}`;
			}
			
			// 使用uniCloud.uploadFile上传文件
			const uploadResult = await uniCloud.uploadFile({
				filePath: filePath,
				cloudPath: finalCloudPath
			});
			
			if (uploadResult.fileID) {
				// 获取文件的HTTP访问地址
				const fileUrl = await uniCloud.getTempFileURL({
					fileList: [uploadResult.fileID]
				});
				
				return {
					errCode: 0,
					errMsg: 'success',
					data: {
						fileID: uploadResult.fileID,
						url: fileUrl.fileList[0].tempFileURL,
						cloudPath: finalCloudPath
					}
				};
			} else {
				return {
					errCode: 'UPLOAD_FAILED',
					errMsg: '文件上传失败'
				};
			}
			
		} catch (error) {
			return {
				errCode: 'UPLOAD_ERROR',
				errMsg: '上传过程中发生错误: ' + error.message
			};
		}
	},
	
	/**
	 * 批量上传文件
	 * @param {Object} params 上传参数
	 * @param {Array} params.filePaths 本地文件路径数组
	 * @param {string} params.module 模块名称 (skills, community, report等)
	 * @param {number} params.maxCount 最大上传数量，默认6
	 * @returns {Object} 上传结果
	 */
	async uploadFiles(params) {
		try {
			// 验证用户登录状态
			const userInfo = await this.getCurrentUser();
			if (userInfo.errCode !== 0) {
				return userInfo;
			}
			
			const { filePaths, module = 'common', maxCount = 6 } = params;
			
			// 参数验证
			if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
				return {
					errCode: 'INVALID_PARAMS',
					errMsg: '文件路径数组不能为空'
				};
			}
			
			if (filePaths.length > maxCount) {
				return {
					errCode: 'EXCEED_MAX_COUNT',
					errMsg: `最多只能上传${maxCount}个文件`
				};
			}
			
			const uploadResults = [];
			const failedFiles = [];
			
			// 逐个上传文件
			for (let i = 0; i < filePaths.length; i++) {
				const filePath = filePaths[i];
				
				try {
					const result = await this.uploadFile({
						filePath: filePath,
						module: module
					});
					
					if (result.errCode === 0) {
						uploadResults.push(result.data);
					} else {
						failedFiles.push({
							filePath: filePath,
							error: result.errMsg
						});
					}
				} catch (error) {
					failedFiles.push({
						filePath: filePath,
						error: error.message
					});
				}
			}
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: {
					successCount: uploadResults.length,
					failedCount: failedFiles.length,
					uploadResults: uploadResults,
					failedFiles: failedFiles
				}
			};
			
		} catch (error) {
			return {
				errCode: 'BATCH_UPLOAD_ERROR',
				errMsg: '批量上传过程中发生错误: ' + error.message
			};
		}
	},
	
	/**
	 * 删除云存储文件
	 * @param {Object} params 删除参数
	 * @param {Array} params.fileIDs 文件ID数组
	 * @returns {Object} 删除结果
	 */
	async deleteFiles(params) {
		try {
			// 验证用户登录状态
			const userInfo = await this.getCurrentUser();
			if (userInfo.errCode !== 0) {
				return userInfo;
			}
			
			const { fileIDs } = params;
			
			// 参数验证
			if (!fileIDs || !Array.isArray(fileIDs) || fileIDs.length === 0) {
				return {
					errCode: 'INVALID_PARAMS',
					errMsg: '文件ID数组不能为空'
				};
			}
			
			// 删除文件
			const deleteResult = await uniCloud.deleteFile({
				fileList: fileIDs
			});
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: deleteResult
			};
			
		} catch (error) {
			return {
				errCode: 'DELETE_ERROR',
				errMsg: '删除文件过程中发生错误: ' + error.message
			};
		}
	},
	
	/**
	 * 获取文件临时访问地址
	 * @param {Object} params 参数
	 * @param {Array} params.fileIDs 文件ID数组
	 * @returns {Object} 文件访问地址
	 */
	async getTempFileURLs(params) {
		try {
			// 验证用户登录状态
			const userInfo = await this.getCurrentUser();
			if (userInfo.errCode !== 0) {
				return userInfo;
			}
			
			const { fileIDs } = params;
			
			// 参数验证
			if (!fileIDs || !Array.isArray(fileIDs) || fileIDs.length === 0) {
				return {
					errCode: 'INVALID_PARAMS',
					errMsg: '文件ID数组不能为空'
				};
			}
			
			// 获取临时访问地址
			const urlResult = await uniCloud.getTempFileURL({
				fileList: fileIDs
			});
			
			return {
				errCode: 0,
				errMsg: 'success',
				data: urlResult
			};
			
		} catch (error) {
			return {
				errCode: 'GET_URL_ERROR',
				errMsg: '获取文件地址过程中发生错误: ' + error.message
			};
		}
	}
}