<template>
	<view class="container">
		<form @submit="submitPost">
			<!-- 帖子标题 -->
			<view class="form-group">
				<text class="label">帖子标题 *</text>
				<input 
					class="input" 
					v-model="postData.title" 
					placeholder="请输入帖子标题"
					maxlength="100"
				/>
			</view>

			<!-- 帖子内容 -->
			<view class="form-group">
				<text class="label">帖子内容 *</text>
				<textarea 
					class="textarea" 
					v-model="postData.content" 
					placeholder="分享你的想法、经验或问题..."
					maxlength="2000"
				></textarea>
			</view>

			<!-- 帖子图片 -->
			<view class="form-group">
				<text class="label">添加图片</text>
				<ImageUploader 
					v-model="postData.images"
					:max-count="9"
					module="community"
					@upload-success="onUploadSuccess"
					@upload-error="onUploadError"
				/>
			</view>

			<!-- 帖子分类 -->
			<view class="form-group">
				<text class="label">帖子分类</text>
				<picker 
					:value="categoryIndex" 
					:range="categories" 
					range-key="name"
					@change="onCategoryChange"
				>
					<view class="picker">
						{{ postData.category || '请选择帖子分类' }}
					</view>
				</picker>
			</view>

			<!-- 提交按钮 -->
			<button 
				class="submit-btn" 
				:disabled="isSubmitting"
				@tap="submitPost"
			>
				{{ isSubmitting ? '发布中...' : '发布帖子' }}
			</button>
		</form>
	</view>
</template>

<script setup>
	import { ref, reactive } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import ImageUploader from '@/components/ImageUploader.vue';

	// 响应式数据
	const postData = reactive({
		title: '',
		content: '',
		images: [],
		category: '闲聊交流'
	});

	const isSubmitting = ref(false);
	const categoryIndex = ref(0);

	// 帖子分类
	const categories = ref([
		{ name: '闲聊交流', value: 'chat' },
		{ name: '技能分享', value: 'skill' },
		{ name: '求助问答', value: 'help' },
		{ name: '经验分享', value: 'experience' },
		{ name: '资源分享', value: 'resource' },
		{ name: '其他', value: 'other' }
	]);

	// 云对象实例
	let communityObj = null;

	// 初始化云对象
	const initCloudObj = () => {
		try {
			communityObj = uniCloud.importObject('community');
		} catch (error) {
			uni.showToast({
				title: '服务初始化失败',
				icon: 'none'
			});
		}
	};

	// 分类选择
	const onCategoryChange = (e) => {
		categoryIndex.value = e.detail.value;
		postData.category = categories.value[e.detail.value].name;
	};

	// 图片上传成功回调
	const onUploadSuccess = (data) => {
		// 图片上传成功，ImageUploader组件会自动更新postData.images
	};

	// 图片上传失败回调
	const onUploadError = (error) => {
		// 图片上传失败处理
	};

	// 表单验证
	const validateForm = () => {
		if (!postData.title.trim()) {
			uni.showToast({
				title: '请输入帖子标题',
				icon: 'none'
			});
			return false;
		}

		if (!postData.content.trim()) {
			uni.showToast({
				title: '请输入帖子内容',
				icon: 'none'
			});
			return false;
		}

		return true;
	};

	// 提交帖子
	const submitPost = async () => {
		if (!validateForm()) {
			return;
		}

		if (isSubmitting.value) {
			return;
		}

		if (!communityObj) {
			initCloudObj();
			if (!communityObj) {
				uni.showToast({
					title: '服务不可用，请重试',
					icon: 'none'
				});
				return;
			}
		}

		try {
			isSubmitting.value = true;

			// 准备提交数据
			const submitData = {
				title: postData.title.trim(),
				content: postData.content.trim(),
				images: postData.images,
				category: postData.category
			};

			// 调用云对象提交帖子
			const result = await communityObj.addPost(submitData);

			if (result.errCode === 0) {
				uni.showToast({
					title: '帖子发布成功',
					icon: 'success'
				});

				// 返回社区页面
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			} else {
				uni.showToast({
					title: result.errMsg || '发布失败',
					icon: 'none'
				});
			}
		} catch (error) {
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			});
		} finally {
			isSubmitting.value = false;
		}
	};

	onLoad(() => {
		initCloudObj();
	});
</script>

<style scoped>
	.container {
		padding: 30rpx;
		background: #f8f9fa;
		min-height: 100vh;
	}

	.form-group {
		background: white;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
	}

	.label {
		display: block;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.input, .textarea, .picker {
		width: 100%;
		padding: 20rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		background: #fafafa;
	}

	.textarea {
		height: 300rpx;
		resize: none;
	}

	.picker {
		display: flex;
		align-items: center;
		height: 80rpx;
		color: #666;
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 16rpx;
		font-size: 32rpx;
		font-weight: bold;
		margin-top: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-btn:disabled {
		opacity: 0.6;
	}

	.submit-btn:active:not(:disabled) {
		transform: scale(0.98);
	}
</style>