<template>
	<view class="container">
		<form @submit="onSubmit">
			<!-- 基本信息 -->
			<view class="form-section">
				<view class="section-title">基本信息</view>
				
				<view class="form-item">
					<text class="label">技能标题 <text class="required">*</text></text>
					<input 
						class="input" 
						placeholder="请输入技能标题，如：专业家电维修"
						v-model="formData.title"
						maxlength="50"
					/>
				</view>

				<view class="form-item">
					<text class="label">技能描述 <text class="required">*</text></text>
					<textarea 
						class="textarea" 
						placeholder="详细描述您的技能特色、服务内容等"
						v-model="formData.description"
						maxlength="500"
						show-confirm-bar="false"
					></textarea>
					<text class="char-count">{{ formData.description.length }}/500</text>
				</view>

				<view class="form-item">
					<text class="label">服务分类 <text class="required">*</text></text>
					<picker 
						:value="categoryIndex" 
						:range="categoryList"
						range-key="label"
						@change="onCategoryChange">
						<view class="picker">
							{{ formData.category ? getCategoryLabel(formData.category) : '请选择服务分类' }}
							<uni-icons type="right" size="16" color="#999"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="form-item">
					<text class="label">服务位置 <text class="required">*</text></text>
					<input 
						class="input" 
						placeholder="如：1号楼301、2号楼205等"
						v-model="formData.location"
						maxlength="50"
					/>
				</view>
			</view>

			<!-- 价格信息 -->
			<view class="form-section">
				<view class="section-title">价格信息</view>
				
				<view class="form-item">
					<text class="label">服务价格 <text class="required">*</text></text>
					<view class="price-input">
						<text class="currency">¥</text>
						<input 
							class="input price-value" 
							placeholder="0"
							v-model="formData.price"
							type="digit"
						/>
						<text class="separator">/</text>
						<picker 
							:value="priceUnitIndex" 
							:range="priceUnitList"
							@change="onPriceUnitChange">
							<view class="unit-picker">
								{{ formData.priceUnit || '单位' }}
								<uni-icons type="down" size="12" color="#999"></uni-icons>
							</view>
						</picker>
					</view>
				</view>
			</view>

			<!-- 技能标签 -->
			<view class="form-section">
				<view class="section-title">技能标签</view>
				
				<view class="form-item">
					<text class="label">添加标签</text>
					<view class="tag-input-box">
						<input 
							class="tag-input" 
							placeholder="输入标签后按回车添加"
							v-model="currentTag"
							@confirm="addTag"
							maxlength="10"
						/>
						<view class="add-tag-btn" @tap="addTag" v-if="currentTag.trim()">
							<uni-icons type="plus" size="16" color="#007aff"></uni-icons>
						</view>
					</view>
					<view class="tags-container">
						<view class="tag-item" v-for="(tag, index) in formData.tags" :key="index">
							<text>{{ tag }}</text>
							<view class="remove-tag" @tap="removeTag(index)">
								<uni-icons type="close" size="12" color="#999"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 服务图片 -->
			<view class="form-section">
				<view class="section-title">服务图片</view>
				
				<view class="form-item">
					<text class="label">上传图片</text>
					<view class="images-container">
						<view class="image-item" v-for="(img, index) in formData.images" :key="index">
							<image :src="img" mode="aspectFill" class="preview-image"></image>
							<view class="remove-image" @tap="removeImage(index)">
								<uni-icons type="close" size="16" color="white"></uni-icons>
							</view>
						</view>
						<view class="add-image" @tap="chooseImage" v-if="formData.images.length < 6">
							<uni-icons type="plus" size="40" color="#ccc"></uni-icons>
							<text class="add-text">添加图片</text>
						</view>
					</view>
					<text class="tip">最多上传6张图片，建议尺寸16:9</text>
				</view>
			</view>

			<!-- 联系方式 -->
			<view class="form-section">
				<view class="section-title">联系方式</view>
				
				<view class="form-item">
					<text class="label">联系电话</text>
					<input 
						class="input" 
						placeholder="请输入联系电话"
						v-model="formData.phone"
						type="number"
						maxlength="11"
					/>
				</view>

				<view class="form-item">
					<text class="label">微信号</text>
					<input 
						class="input" 
						placeholder="请输入微信号"
						v-model="formData.wechat"
						maxlength="50"
					/>
				</view>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-section">
				<button class="submit-btn" @tap="onSubmit" :disabled="!isFormValid || isSubmitting">
					{{ isSubmitting ? '发布中...' : '发布技能' }}
				</button>
			</view>
		</form>
	</view>
</template>

<script setup>
	import { ref, reactive, computed, onMounted } from 'vue';

	const currentTag = ref('');
	const categoryIndex = ref(-1);
	const priceUnitIndex = ref(-1);
	const isSubmitting = ref(false);

	// 表单数据
	const formData = reactive({
		title: '',
		description: '',
		category: '',
		location: '',
		price: '',
		priceUnit: '',
		tags: [],
		images: [],
		phone: '',
		wechat: ''
	});

	// 分类列表
	const categoryList = reactive([
		{ label: '家政服务', value: 'housekeeping' },
		{ label: '维修安装', value: 'repair' },
		{ label: '教育培训', value: 'education' },
		{ label: '美容美发', value: 'beauty' },
		{ label: '健康护理', value: 'health' },
		{ label: '其他服务', value: 'other' }
	]);

	// 价格单位列表
	const priceUnitList = reactive(['小时', '次', '天', '课时', '项目']);

	// 云对象实例
	let skillsCloudObj = null;

	// 初始化云对象
	const initCloudObj = () => {
		try {
			skillsCloudObj = uniCloud.importObject('skills');
		} catch (error) {
			console.error('初始化云对象失败:', error);
			uni.showToast({
				title: '服务初始化失败',
				icon: 'none'
			});
		}
	};

	// 表单验证
	const isFormValid = computed(() => {
		return formData.title.trim() && 
			   formData.description.trim() && 
			   formData.category && 
			   formData.location.trim() && 
			   formData.price && 
			   formData.priceUnit;
	});

	// 获取分类标签
	const getCategoryLabel = (value) => {
		const category = categoryList.find(item => item.value === value);
		return category ? category.label : '';
	};

	// 分类选择
	const onCategoryChange = (e) => {
		categoryIndex.value = e.detail.value;
		formData.category = categoryList[e.detail.value].value;
	};

	// 价格单位选择
	const onPriceUnitChange = (e) => {
		priceUnitIndex.value = e.detail.value;
		formData.priceUnit = priceUnitList[e.detail.value];
	};

	// 添加标签
	const addTag = () => {
		const tag = currentTag.value.trim();
		if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
			formData.tags.push(tag);
			currentTag.value = '';
		} else if (formData.tags.length >= 5) {
			uni.showToast({
				title: '最多添加5个标签',
				icon: 'none'
			});
		} else if (formData.tags.includes(tag)) {
			uni.showToast({
				title: '标签已存在',
				icon: 'none'
			});
		}
	};

	// 移除标签
	const removeTag = (index) => {
		formData.tags.splice(index, 1);
	};

	// 选择图片
	const chooseImage = () => {
		const remainCount = 6 - formData.images.length;
		
		uni.chooseImage({
			count: remainCount,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				uploadImages(res.tempFilePaths);
			},
			fail: (error) => {
				console.error('选择图片失败:', error);
				uni.showToast({
					title: '选择图片失败',
					icon: 'none'
				});
			}
		});
	};

	// 上传图片
	const uploadImages = async (tempFilePaths) => {
		if (!skillsCloudObj) {
			uni.showToast({
				title: '服务未初始化',
				icon: 'none'
			});
			return;
		}

		uni.showLoading({
			title: '上传中...'
		});

		try {
			for (let i = 0; i < tempFilePaths.length; i++) {
				const tempFilePath = tempFilePaths[i];
				
				// 生成云端路径
				const timestamp = Date.now();
				const randomStr = Math.random().toString(36).substring(2);
				const fileExt = tempFilePath.substring(tempFilePath.lastIndexOf('.'));
				const cloudPath = `skills/${timestamp}_${randomStr}${fileExt}`;

				// 读取文件内容
				const fileContent = await new Promise((resolve, reject) => {
					uni.getFileSystemManager().readFile({
						filePath: tempFilePath,
						success: (res) => resolve(res.data),
						fail: reject
					});
				});

				// 调用云对象上传图片
				const result = await skillsCloudObj.uploadImage({
					cloudPath: cloudPath,
					fileContent: fileContent
				});

				if (result.errCode === 0) {
					formData.images.push(result.data.url);
				} else {
					throw new Error(result.errMsg || '上传失败');
				}
			}

			uni.hideLoading();
			uni.showToast({
				title: '上传成功',
				icon: 'success'
			});
		} catch (error) {
			console.error('上传图片失败:', error);
			uni.hideLoading();
			uni.showToast({
				title: error.message || '上传失败',
				icon: 'none'
			});
		}
	};

	// 移除图片
	const removeImage = (index) => {
		formData.images.splice(index, 1);
	};

	// 表单验证
	const validateForm = () => {
		if (!formData.title.trim()) {
			uni.showToast({
				title: '请输入技能标题',
				icon: 'none'
			});
			return false;
		}

		if (formData.title.trim().length < 2 || formData.title.trim().length > 50) {
			uni.showToast({
				title: '技能标题长度应在2-50个字符之间',
				icon: 'none'
			});
			return false;
		}

		if (!formData.description.trim()) {
			uni.showToast({
				title: '请输入技能描述',
				icon: 'none'
			});
			return false;
		}

		if (formData.description.trim().length < 10 || formData.description.trim().length > 500) {
			uni.showToast({
				title: '技能描述长度应在10-500个字符之间',
				icon: 'none'
			});
			return false;
		}

		if (!formData.category) {
			uni.showToast({
				title: '请选择服务分类',
				icon: 'none'
			});
			return false;
		}

		if (!formData.location.trim()) {
			uni.showToast({
				title: '请输入服务位置',
				icon: 'none'
			});
			return false;
		}

		if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
			uni.showToast({
				title: '请输入有效的服务价格',
				icon: 'none'
			});
			return false;
		}

		if (!formData.priceUnit) {
			uni.showToast({
				title: '请选择价格单位',
				icon: 'none'
			});
			return false;
		}

		if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
			uni.showToast({
				title: '请输入有效的手机号码',
				icon: 'none'
			});
			return false;
		}

		if (formData.wechat && (formData.wechat.length < 6 || formData.wechat.length > 20)) {
			uni.showToast({
				title: '微信号长度应在6-20个字符之间',
				icon: 'none'
			});
			return false;
		}

		return true;
	};

	// 提交表单
	const onSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		if (!skillsCloudObj) {
			uni.showToast({
				title: '服务未初始化',
				icon: 'none'
			});
			return;
		}

		if (isSubmitting.value) {
			return;
		}

		try {
			isSubmitting.value = true;

			// 准备提交数据
			const submitData = {
				title: formData.title.trim(),
				description: formData.description.trim(),
				category: formData.category,
				location: formData.location.trim(),
				price: parseFloat(formData.price),
				priceUnit: formData.priceUnit,
				tags: formData.tags,
				images: formData.images,
				phone: formData.phone.trim(),
				wechat: formData.wechat.trim()
			};

			// 调用云对象发布技能
			const result = await skillsCloudObj.publishSkill(submitData);

			if (result.errCode === 0) {
				uni.showToast({
					title: '发布成功',
					icon: 'success'
				});

				// 延迟跳转，让用户看到成功提示
				setTimeout(() => {
					uni.navigateBack({
						delta: 1
					});
				}, 1500);
			} else {
				uni.showToast({
					title: result.errMsg || '发布失败',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('发布技能失败:', error);
			uni.showToast({
				title: '发布失败，请重试',
				icon: 'none'
			});
		} finally {
			isSubmitting.value = false;
		}
	};

	// 页面加载时初始化
	onMounted(() => {
		initCloudObj();
	});
</script>

<style scoped>
	.container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 100rpx;
	}

	.form-section {
		background-color: white;
		margin-bottom: 20rpx;
		padding: 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		padding-bottom: 15rpx;
		border-bottom: 2rpx solid #f0f0f0;
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.form-item:last-child {
		margin-bottom: 0;
	}

	.label {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 15rpx;
	}

	.required {
		color: #ff4757;
	}

	.input {
		width: 100%;
		height: 80rpx;
		background-color: #f8f8f8;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	.textarea {
		width: 100%;
		min-height: 150rpx;
		background-color: #f8f8f8;
		border-radius: 10rpx;
		padding: 20rpx;
		font-size: 28rpx;
		box-sizing: border-box;
		line-height: 1.5;
	}

	.char-count {
		display: block;
		text-align: right;
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.picker {
		height: 80rpx;
		background-color: #f8f8f8;
		border-radius: 10rpx;
		padding: 0 20rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 28rpx;
		color: #333;
	}

	.price-input {
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		border-radius: 10rpx;
		padding: 0 20rpx;
		height: 80rpx;
	}

	.currency {
		font-size: 28rpx;
		color: #333;
		margin-right: 10rpx;
	}

	.price-value {
		flex: 1;
		background: none;
		border: none;
		font-size: 28rpx;
		height: 100%;
	}

	.separator {
		font-size: 28rpx;
		color: #999;
		margin: 0 15rpx;
	}

	.unit-picker {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #333;
	}

	.tag-input-box {
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		border-radius: 10rpx;
		padding: 0 20rpx;
		height: 80rpx;
		margin-bottom: 20rpx;
	}

	.tag-input {
		flex: 1;
		background: none;
		border: none;
		font-size: 28rpx;
		height: 100%;
	}

	.add-tag-btn {
		margin-left: 15rpx;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}

	.tag-item {
		background-color: #e3f2fd;
		color: #1976d2;
		padding: 10rpx 15rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.remove-tag {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30rpx;
		height: 30rpx;
		background-color: rgba(0, 0, 0, 0.1);
		border-radius: 50%;
	}

	.images-container {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		margin-bottom: 15rpx;
	}

	.image-item {
		position: relative;
		width: 200rpx;
		height: 150rpx;
	}

	.preview-image {
		width: 100%;
		height: 100%;
		border-radius: 10rpx;
	}

	.remove-image {
		position: absolute;
		top: -10rpx;
		right: -10rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.6);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-image {
		width: 200rpx;
		height: 150rpx;
		border: 2rpx dashed #ccc;
		border-radius: 10rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
	}

	.add-text {
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.tip {
		font-size: 24rpx;
		color: #999;
	}

	.submit-section {
		padding: 30rpx;
	}

	.submit-btn {
		width: 100%;
		height: 90rpx;
		background-color: #007aff;
		color: white;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: bold;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-btn:disabled {
		background-color: #ccc;
		color: #999;
	}
</style>