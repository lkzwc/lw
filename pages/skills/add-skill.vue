<template>
	<view class="container">
		<form @submit="submitSkill">
			<!-- 技能标题 -->
			<view class="form-group">
				<text class="label">技能标题 *</text>
				<input 
					class="input" 
					v-model="skillData.title" 
					placeholder="请输入技能标题"
					maxlength="50"
				/>
			</view>

			<!-- 技能分类 -->
			<view class="form-group">
				<text class="label">技能分类 *</text>
				<picker 
					:value="categoryIndex" 
					:range="categories" 
					range-key="name"
					@change="onCategoryChange"
				>
					<view class="picker">
						{{ skillData.category || '请选择技能分类' }}
					</view>
				</picker>
			</view>

			<!-- 技能描述 -->
			<view class="form-group">
				<text class="label">技能描述 *</text>
				<textarea 
					class="textarea" 
					v-model="skillData.description" 
					placeholder="请详细描述您的技能，包括技能水平、经验等"
					maxlength="500"
				></textarea>
			</view>

			<!-- 技能图片 -->
			<view class="form-group">
				<text class="label">技能图片</text>
				<ImageUploader 
					v-model="skillData.images"
					:max-count="6"
					module="skills"
					@upload-success="onUploadSuccess"
					@upload-error="onUploadError"
				/>
			</view>

			<!-- 联系方式 -->
			<view class="form-group">
				<text class="label">联系方式 *</text>
				<input 
					class="input" 
					v-model="skillData.contact" 
					placeholder="请输入微信号、QQ号或手机号"
					maxlength="50"
				/>
			</view>

			<!-- 价格范围 -->
			<view class="form-group">
				<text class="label">价格范围</text>
				<input 
					class="input" 
					v-model="skillData.price" 
					placeholder="如：50-100元/小时，面议等"
					maxlength="30"
				/>
			</view>

			<!-- 可服务时间 -->
			<view class="form-group">
				<text class="label">可服务时间</text>
				<textarea 
					class="textarea" 
					v-model="skillData.availableTime" 
					placeholder="请描述您的可服务时间，如：周末、工作日晚上等"
					maxlength="200"
				></textarea>
			</view>

			<!-- 提交按钮 -->
			<button 
				class="submit-btn" 
				:disabled="isSubmitting"
				@tap="submitSkill"
			>
				{{ isSubmitting ? '发布中...' : '发布技能' }}
			</button>
		</form>
	</view>
</template>

<script setup>
	import { ref, reactive } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import ImageUploader from '@/components/ImageUploader.vue';
	import { skills } from '@/utils/cloudObjectManager';

	// 响应式数据
	const skillData = reactive({
		title: '',
		category: '',
		description: '',
		images: [],
		contact: '',
		price: '',
		availableTime: ''
	});

	const isSubmitting = ref(false);
	const categoryIndex = ref(0);

	// 技能分类
	const categories = ref([
		{ name: '编程开发', value: 'programming' },
		{ name: '设计创意', value: 'design' },
		{ name: '语言翻译', value: 'language' },
		{ name: '音乐艺术', value: 'music' },
		{ name: '体育健身', value: 'sports' },
		{ name: '学习辅导', value: 'education' },
		{ name: '生活服务', value: 'life' },
		{ name: '其他技能', value: 'other' }
	]);

	// 分类选择
	const onCategoryChange = (e) => {
		categoryIndex.value = e.detail.value;
		skillData.category = categories.value[e.detail.value].name;
	};

	// 图片上传成功回调
	const onUploadSuccess = (data) => {
		// 图片上传成功，ImageUploader组件会自动更新skillData.images
	};

	// 图片上传失败回调
	const onUploadError = (error) => {
		// 图片上传失败处理
	};

	// 表单验证
	const validateForm = () => {
		if (!skillData.title.trim()) {
			uni.showToast({
				title: '请输入技能标题',
				icon: 'none'
			});
			return false;
		}

		if (!skillData.category) {
			uni.showToast({
				title: '请选择技能分类',
				icon: 'none'
			});
			return false;
		}

		if (!skillData.description.trim()) {
			uni.showToast({
				title: '请输入技能描述',
				icon: 'none'
			});
			return false;
		}

		if (!skillData.contact.trim()) {
			uni.showToast({
				title: '请输入联系方式',
				icon: 'none'
			});
			return false;
		}

		return true;
	};

	// 提交技能
	const submitSkill = async () => {
		if (!validateForm()) {
			return;
		}

		if (isSubmitting.value) {
			return;
		}

		try {
			isSubmitting.value = true;

			// 准备提交数据
			const submitData = {
				title: skillData.title.trim(),
				category: skillData.category,
				description: skillData.description.trim(),
				images: skillData.images,
				contact: skillData.contact.trim(),
				price: skillData.price.trim(),
				availableTime: skillData.availableTime.trim()
			};

			// 调用云对象提交技能
			const result = await skills().addSkill(submitData);

			if (result.errCode === 0) {
				uni.showToast({
					title: '技能发布成功',
					icon: 'success'
				});

				// 返回上一页
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
		height: 200rpx;
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