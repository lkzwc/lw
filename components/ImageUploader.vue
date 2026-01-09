<template>
	<view class="image-uploader">
		<!-- 已上传的图片列表 -->
		<view class="image-list">
			<view 
				class="image-item" 
				v-for="(image, index) in imageList" 
				:key="index"
			>
				<image 
					:src="image.url || image.path" 
					mode="aspectFill" 
					class="image"
					@tap="previewImage(index)"
				></image>
				<view class="delete-btn" @tap="deleteImage(index)">
					<uni-icons type="close" size="16" color="white"></uni-icons>
				</view>
				<!-- 上传进度 -->
				<view class="upload-progress" v-if="image.uploading">
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: image.progress + '%' }"></view>
					</view>
					<text class="progress-text">{{ image.progress }}%</text>
				</view>
			</view>
			
			<!-- 添加图片按钮 -->
			<view 
				class="add-image-btn" 
				v-if="imageList.length < maxCount"
				@tap="chooseImage"
			>
				<uni-icons type="plus" size="32" color="#999"></uni-icons>
				<text class="add-text">添加图片</text>
			</view>
		</view>
		
		<!-- 提示信息 -->
		<view class="tip-text" v-if="showTip">
			最多可上传{{ maxCount }}张图片，支持jpg、png格式
		</view>
	</view>
</template>

<script setup>
	import { ref, watch, defineProps, defineEmits } from 'vue';
	import { upload } from '@/utils/cloudObjectManager';
	
	// 定义props
	const props = defineProps({
		modelValue: {
			type: Array,
			default: () => []
		},
		maxCount: {
			type: Number,
			default: 6
		},
		module: {
			type: String,
			default: 'common'
		},
		showTip: {
			type: Boolean,
			default: true
		}
	});
	
	// 定义emits
	const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error']);
	
	// 响应式数据
	const imageList = ref([]);

	
	// 监听props变化
	watch(() => props.modelValue, (newVal) => {
		if (newVal && Array.isArray(newVal)) {
			imageList.value = newVal.map(item => {
				if (typeof item === 'string') {
					return { url: item, uploaded: true };
				}
				return item;
			});
		}
	}, { immediate: true });
	
	// 监听imageList变化，更新modelValue
	watch(imageList, (newVal) => {
		const uploadedImages = newVal
			.filter(item => item.uploaded && (item.url || item.fileID))
			.map(item => item.url || item.fileID);
		emit('update:modelValue', uploadedImages);
	}, { deep: true });
	
	// 选择图片
	const chooseImage = () => {
		const remainCount = props.maxCount - imageList.value.length;
		if (remainCount <= 0) {
			uni.showToast({
				title: `最多只能上传${props.maxCount}张图片`,
				icon: 'none'
			});
			return;
		}
		
		uni.chooseImage({
			count: remainCount,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				uploadImages(res.tempFilePaths);
			},
			fail: (error) => {
				uni.showToast({
					title: '选择图片失败',
					icon: 'none'
				});
			}
		});
	};
	
	// 上传图片
	const uploadImages = async (filePaths) => {
		
		// 添加到图片列表，显示上传进度
		const newImages = filePaths.map(path => ({
			path: path,
			uploading: true,
			progress: 0,
			uploaded: false
		}));
		
		imageList.value.push(...newImages);
		
		// 逐个上传图片
		for (let i = 0; i < newImages.length; i++) {
			const imageItem = newImages[i];
			const imageIndex = imageList.value.findIndex(item => item.path === imageItem.path);
			
			try {
				// 模拟上传进度
				const progressInterval = setInterval(() => {
					if (imageList.value[imageIndex] && imageList.value[imageIndex].progress < 90) {
						imageList.value[imageIndex].progress += 10;
					}
				}, 200);
				
				// 调用云对象上传
				const result = await upload().uploadFile({
					filePath: imageItem.path,
					module: props.module
				});
				
				clearInterval(progressInterval);
				
				if (result.errCode === 0) {
					// 上传成功
					imageList.value[imageIndex] = {
						...imageList.value[imageIndex],
						uploading: false,
						progress: 100,
						uploaded: true,
						url: result.data.url,
						fileID: result.data.fileID,
						cloudPath: result.data.cloudPath
					};
					
					emit('upload-success', result.data);
				} else {
					// 上传失败
					imageList.value[imageIndex].uploading = false;
					imageList.value[imageIndex].error = true;
					
					uni.showToast({
						title: result.errMsg || '上传失败',
						icon: 'none'
					});
					
					emit('upload-error', result);
				}
			} catch (error) {
				// 上传异常
				if (imageIndex >= 0) {
					imageList.value[imageIndex].uploading = false;
					imageList.value[imageIndex].error = true;
				}
				
				uni.showToast({
					title: '上传失败，请重试',
					icon: 'none'
				});
				
				emit('upload-error', error);
			}
		}
	};
	
	// 删除图片
	const deleteImage = (index) => {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这张图片吗？',
			success: (res) => {
				if (res.confirm) {
					const deletedImage = imageList.value[index];
					imageList.value.splice(index, 1);
					
					// 如果是已上传的图片，可以选择是否删除云存储文件
					if (deletedImage.uploaded && deletedImage.fileID) {
						// 这里可以调用删除云存储文件的接口
						// uploadObj.deleteFiles({ fileIDs: [deletedImage.fileID] });
					}
				}
			}
		});
	};
	
	// 预览图片
	const previewImage = (index) => {
		const urls = imageList.value
			.filter(item => item.url || item.path)
			.map(item => item.url || item.path);
		
		uni.previewImage({
			current: index,
			urls: urls
		});
	};

</script>

<style scoped>
	.image-uploader {
		width: 100%;
	}
	
	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}
	
	.image-item {
		position: relative;
		width: 200rpx;
		height: 200rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}
	
	.image {
		width: 100%;
		height: 100%;
	}
	
	.delete-btn {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 32rpx;
		height: 32rpx;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.upload-progress {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.7);
		padding: 8rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
	
	.progress-bar {
		flex: 1;
		height: 4rpx;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2rpx;
		overflow: hidden;
	}
	
	.progress-fill {
		height: 100%;
		background: #007aff;
		transition: width 0.3s ease;
	}
	
	.progress-text {
		font-size: 20rpx;
		color: white;
	}
	
	.add-image-btn {
		width: 200rpx;
		height: 200rpx;
		border: 2rpx dashed #ddd;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
	}
	
	.add-text {
		font-size: 24rpx;
		color: #999;
	}
	
	.tip-text {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #999;
		text-align: center;
	}
</style>