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
				<button class="submit-btn" @tap="onSubmit" :disabled="!isFormValid">
					发布技能
				</button>
			</view>
		</form>
	</view>
</template>

<script setup>
	import { ref, reactive, computed } from 'vue';

	const currentTag = ref('');
	const categoryIndex = ref(-1);
	const priceUnitIndex = ref(-1);

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
			sourceType: ['camera', 'album'],
			success: (res) => {
				formData.images.push(...res.tempFilePaths);
			},
			fail: (err) => {
				console.error('选择图片失败:', err);
				uni.showToast({
					title: '选择图片失败',
					icon: 'none'
				});
			}
		});
	};

	// 移除图片
	const removeImage = (index) => {
		formData.images.splice(index, 1);
	};

	// 提交表单
	const onSubmit = () => {
		if (!isFormValid.value) {
			uni.showToast({
				title: '请完善必填信息',
				icon: 'none'
			});
			return;
		}

		// 验证价格
		if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
			uni.showToast({
				title: '请输入有效价格',
				icon: 'none'
			});
			return;
		}

		uni.showLoading({
			title: '发布中...'
		});

		// 模拟提交
		setTimeout(() => {
			uni.hideLoading();
			uni.showToast({
				title: '发布成功',
				icon: 'success'
			});
			
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}, 2000);

		console.log('提交的表单数据:', formData);
	};
</script>

<style scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	/* 表单区块 */
	.form-section {
		background-color: white;
		margin-bottom: 20rpx;
		padding: 32rpx 24rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 32rpx;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid #f0f0f0;
	}

	/* 表单项 */
	.form-item {
		margin-bottom: 32rpx;
	}

	.form-item:last-child {
		margin-bottom: 0;
	}

	.label {
		font-size: 28rpx;
		color: #333;
		display: block;
		margin-bottom: 16rpx;
	}

	.required {
		color: #ff4757;
	}

	.input {
		width: 100%;
		padding: 20rpx 24rpx;
		border: 2rpx solid #e8e8e8;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #fafafa;
	}

	.input:focus {
		border-color: #007aff;
		background-color: white;
	}

	.textarea {
		width: 100%;
		min-height: 200rpx;
		padding: 20rpx 24rpx;
		border: 2rpx solid #e8e8e8;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #fafafa;
		resize: none;
	}

	.textarea:focus {
		border-color: #007aff;
		background-color: white;
	}

	.char-count {
		font-size: 22rpx;
		color: #999;
		text-align: right;
		margin-top: 8rpx;
		display: block;
	}

	/* 选择器 */
	.picker {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 24rpx;
		border: 2rpx solid #e8e8e8;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #fafafa;
	}

	/* 价格输入 */
	.price-input {
		display: flex;
		align-items: center;
		border: 2rpx solid #e8e8e8;
		border-radius: 12rpx;
		background-color: #fafafa;
		padding: 0 24rpx;
	}

	.currency {
		font-size: 28rpx;
		color: #333;
		margin-right: 8rpx;
	}

	.price-value {
		flex: 1;
		border: none;
		background: transparent;
		padding: 20rpx 0;
	}

	.separator {
		font-size: 28rpx;
		color: #999;
		margin: 0 16rpx;
	}

	.unit-picker {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #333;
		min-width: 80rpx;
	}

	/* 标签输入 */
	.tag-input-box {
		display: flex;
		align-items: center;
		border: 2rpx solid #e8e8e8;
		border-radius: 12rpx;
		background-color: #fafafa;
		padding: 0 24rpx;
		margin-bottom: 20rpx;
	}

	.tag-input {
		flex: 1;
		border: none;
		background: transparent;
		padding: 20rpx 0;
		font-size: 28rpx;
	}

	.add-tag-btn {
		padding: 8rpx;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.tag-item {
		display: flex;
		align-items: center;
		background-color: #e8f4fd;
		color: #007aff;
		padding: 12rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
	}

	.remove-tag {
		margin-left: 8rpx;
		padding: 4rpx;
	}

	/* 图片上传 */
	.images-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16rpx;
	}

	.image-item {
		position: relative;
		aspect-ratio: 1;
	}

	.preview-image {
		width: 100%;
		height: 100%;
		border-radius: 12rpx;
	}

	.remove-image {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 32rpx;
		height: 32rpx;
		background-color: rgba(0, 0, 0, 0.6);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-image {
		aspect-ratio: 1;
		border: 2rpx dashed #ddd;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
	}

	.add-text {
		font-size: 22rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.tip {
		font-size: 22rpx;
		color: #999;
		margin-top: 16rpx;
		display: block;
	}

	/* 提交区域 */
	.submit-section {
		padding: 40rpx 24rpx;
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 44rpx;
		font-size: 32rpx;
		font-weight: 600;
	}

	.submit-btn[disabled] {
		background-color: #ccc;
	}
</style>