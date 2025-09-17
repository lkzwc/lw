<template>
	<view class="container">
		<!-- 顶部TAB菜单 -->
		<view class="tab-bar">
			<view class="tab-item" 
				:class="{ active: currentTab === 'report' }" 
				@tap="switchTab('report')">
				<text>举报</text>
			</view>
			<view class="tab-item" 
				:class="{ active: currentTab === 'ranking' }" 
				@tap="switchTab('ranking')">
				<text>榜单</text>
			</view>
		</view>

		<!-- 举报界面 -->
		<view class="report-section" v-if="currentTab === 'report'">
			<!-- 拍照区域 -->
			<view class="photo-section">
				<view class="section-title">
					<uni-icons type="camera" size="20" color="#007aff"></uni-icons>
					<text>违停拍照</text>
					<text class="photo-count">({{ photos.length }}/3)</text>
				</view>
				
				<view class="photos-container">
					<view class="photo-item" v-for="(photo, index) in photos" :key="index">
						<image :src="photo" mode="aspectFill" class="photo-image" @tap="previewPhoto(index)"></image>
						<view class="remove-photo" @tap="removePhoto(index)">
							<uni-icons type="close" size="16" color="white"></uni-icons>
						</view>
					</view>
					<view class="add-photo" @tap="takePhoto" v-if="photos.length < 3">
						<uni-icons type="plus" size="40" color="#ccc"></uni-icons>
						<text class="add-text">拍照举报</text>
					</view>
				</view>
				<text class="photo-tip">最多可拍摄3张照片，请确保车牌号清晰可见</text>
			</view>

			<!-- 车牌识别区域 -->
			<view class="license-section" v-if="photos.length > 0">
				<view class="section-title">
					<uni-icons type="scan" size="20" color="#ff4757"></uni-icons>
					<text>车牌识别</text>
					<view class="scan-btn" @tap="recognizeLicense" :class="{ loading: isRecognizing }">
						<text v-if="!isRecognizing">{{ recognizedLicense ? '重新识别' : '开始识别' }}</text>
						<text v-else>识别中...</text>
					</view>
				</view>
				
				<view class="license-result">
					<input 
						class="license-input" 
						placeholder="车牌号将自动识别，也可手动输入"
						v-model="licenseNumber"
						maxlength="8"
					/>
					<text class="license-tip" v-if="recognizedLicense">
						自动识别：{{ recognizedLicense }}
					</text>
				</view>
			</view>

			<!-- 违停信息 -->
			<view class="violation-section" v-if="photos.length > 0">
				<view class="section-title">
					<uni-icons type="location" size="20" color="#50c878"></uni-icons>
					<text>违停信息</text>
				</view>
				
				<view class="form-item">
					<text class="label">违停位置</text>
					<input 
						class="input" 
						placeholder="请输入具体位置，如：1号楼门口、消防通道等"
						v-model="violationLocation"
						maxlength="50"
					/>
				</view>

				<view class="form-item">
					<text class="label">违停类型</text>
					<picker 
						:value="violationTypeIndex" 
						:range="violationTypes"
						@change="onViolationTypeChange">
						<view class="picker">
							{{ violationType || '请选择违停类型' }}
							<uni-icons type="right" size="16" color="#999"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="form-item">
					<text class="label">补充说明</text>
					<textarea 
						class="textarea" 
						placeholder="可补充违停的具体情况"
						v-model="violationDesc"
						maxlength="200"
					></textarea>
				</view>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-section" v-if="photos.length > 0">
				<button class="submit-btn" @tap="submitReport" :disabled="!canSubmit">
					提交举报
				</button>
			</view>
		</view>

		<!-- 榜单界面 -->
		<view class="ranking-section" v-if="currentTab === 'ranking'">
			<view class="ranking-header">
				<text class="ranking-title">违停举报榜单</text>
				<text class="ranking-desc">统计最近30天的举报数据</text>
			</view>

			<view class="ranking-list">
				<view class="ranking-item" v-for="(item, index) in rankingList" :key="index">
					<view class="ranking-number" :class="'rank-' + (index + 1)">
						{{ index + 1 }}
					</view>
					<view class="license-info">
						<text class="license-plate">{{ item.licenseNumber }}</text>
						<text class="report-count">被举报 {{ item.reportCount }} 次</text>
					</view>
					<view class="latest-report">
						<text class="report-time">最近举报：{{ formatTime(item.latestReport) }}</text>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-ranking" v-if="rankingList.length === 0">
				<uni-icons type="info" size="60" color="#ccc"></uni-icons>
				<text class="empty-text">暂无举报数据</text>
				<text class="empty-desc">快去举报违停车辆吧</text>
			</view>
		</view>

		<!-- 成功提示弹窗 -->
		<uni-popup ref="successPopup" type="center">
			<view class="success-modal">
				<view class="success-icon">
					<uni-icons type="checkmarkempty" size="60" color="#50c878"></uni-icons>
				</view>
				<text class="success-title">举报成功</text>
				<text class="success-desc">感谢您的举报，我们会及时处理违停问题</text>
				<button class="confirm-btn" @tap="closeSuccessModal">确定</button>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import { ref, reactive, computed, onMounted } from 'vue';

	const currentTab = ref('report');
	const photos = ref([]);
	const licenseNumber = ref('');
	const recognizedLicense = ref('');
	const isRecognizing = ref(false);
	const violationLocation = ref('');
	const violationType = ref('');
	const violationTypeIndex = ref(-1);
	const violationDesc = ref('');
	const successPopup = ref(null);

	// 违停类型选项
	const violationTypes = reactive([
		'占用消防通道',
		'占用盲道',
		'占用绿化带',
		'占用人行道',
		'占用车位',
		'乱停乱放',
		'其他违停'
	]);

	// 榜单数据
	const rankingList = reactive([
		{
			licenseNumber: '京A12345',
			reportCount: 15,
			latestReport: new Date('2024-01-20')
		},
		{
			licenseNumber: '京B67890',
			reportCount: 12,
			latestReport: new Date('2024-01-19')
		},
		{
			licenseNumber: '京C11111',
			reportCount: 8,
			latestReport: new Date('2024-01-18')
		},
		{
			licenseNumber: '京D22222',
			reportCount: 6,
			latestReport: new Date('2024-01-17')
		},
		{
			licenseNumber: '京E33333',
			reportCount: 4,
			latestReport: new Date('2024-01-16')
		}
	]);

	// 是否可以提交
	const canSubmit = computed(() => {
		return photos.value.length > 0 && 
			   licenseNumber.value.trim() && 
			   violationLocation.value.trim() && 
			   violationType.value;
	});

	// 切换TAB
	const switchTab = (tab) => {
		currentTab.value = tab;
	};

	// 拍照
	const takePhoto = () => {
		uni.chooseImage({
			count: 3 - photos.value.length,
			sizeType: ['compressed'],
			sourceType: ['camera'],
			success: (res) => {
				photos.value.push(...res.tempFilePaths);
				// 自动触发车牌识别
				if (photos.value.length === 1) {
					setTimeout(() => {
						recognizeLicense();
					}, 500);
				}
			},
			fail: (err) => {
				console.error('拍照失败:', err);
				uni.showToast({
					title: '拍照失败',
					icon: 'none'
				});
			}
		});
	};

	// 预览照片
	const previewPhoto = (index) => {
		uni.previewImage({
			urls: photos.value,
			current: index
		});
	};

	// 删除照片
	const removePhoto = (index) => {
		photos.value.splice(index, 1);
		// 如果删除了所有照片，清空识别结果
		if (photos.value.length === 0) {
			licenseNumber.value = '';
			recognizedLicense.value = '';
		}
	};

	// 车牌识别
	const recognizeLicense = () => {
		if (photos.value.length === 0) {
			uni.showToast({
				title: '请先拍照',
				icon: 'none'
			});
			return;
		}

		isRecognizing.value = true;
		
		// 模拟车牌识别API调用
		setTimeout(() => {
			// 模拟识别结果
			const mockLicenses = ['京A12345', '沪B67890', '粤C11111', '川D22222', '鲁E33333'];
			const randomLicense = mockLicenses[Math.floor(Math.random() * mockLicenses.length)];
			
			recognizedLicense.value = randomLicense;
			licenseNumber.value = randomLicense;
			isRecognizing.value = false;
			
			uni.showToast({
				title: '识别成功',
				icon: 'success'
			});
		}, 2000);
	};

	// 违停类型选择
	const onViolationTypeChange = (e) => {
		violationTypeIndex.value = e.detail.value;
		violationType.value = violationTypes[e.detail.value];
	};

	// 提交举报
	const submitReport = () => {
		if (!canSubmit.value) {
			uni.showToast({
				title: '请完善举报信息',
				icon: 'none'
			});
			return;
		}

		uni.showLoading({
			title: '提交中...'
		});

		// 模拟提交API
		setTimeout(() => {
			uni.hideLoading();
			
			// 显示成功弹窗
			successPopup.value.open();
			
			// 清空表单
			photos.value = [];
			licenseNumber.value = '';
			recognizedLicense.value = '';
			violationLocation.value = '';
			violationType.value = '';
			violationTypeIndex.value = -1;
			violationDesc.value = '';
			
		}, 2000);

		console.log('提交举报数据:', {
			photos: photos.value,
			licenseNumber: licenseNumber.value,
			violationLocation: violationLocation.value,
			violationType: violationType.value,
			violationDesc: violationDesc.value,
			reportTime: new Date()
		});
	};

	// 关闭成功弹窗
	const closeSuccessModal = () => {
		successPopup.value.close();
	};

	// 格式化时间
	const formatTime = (date) => {
		const now = new Date();
		const diff = now - date;
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		
		if (days === 0) {
			return '今天';
		} else if (days === 1) {
			return '昨天';
		} else if (days < 7) {
			return `${days}天前`;
		} else {
			return date.toLocaleDateString();
		}
	};

	onMounted(() => {
		console.log('随手拍页面加载完成');
	});
</script>

<style scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	/* TAB栏样式 */
	.tab-bar {
		display: flex;
		background-color: white;
		border-bottom: 1rpx solid #e8e8e8;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 32rpx 0;
		font-size: 28rpx;
		color: #666;
		position: relative;
	}

	.tab-item.active {
		color: #007aff;
		font-weight: 600;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60rpx;
		height: 4rpx;
		background-color: #007aff;
		border-radius: 2rpx;
	}

	/* 举报界面样式 */
	.report-section {
		padding: 24rpx;
	}

	.section-title {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
	}

	.section-title text {
		margin-left: 12rpx;
	}

	.photo-count {
		color: #999 !important;
		font-weight: normal !important;
		margin-left: auto !important;
	}

	.scan-btn {
		margin-left: auto;
		background-color: #007aff;
		color: white;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
	}

	.scan-btn.loading {
		background-color: #ccc;
	}

	/* 拍照区域 */
	.photo-section {
		background-color: white;
		border-radius: 16rpx;
		padding: 32rpx 24rpx;
		margin-bottom: 24rpx;
	}

	.photos-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.photo-item {
		position: relative;
		aspect-ratio: 1;
	}

	.photo-image {
		width: 100%;
		height: 100%;
		border-radius: 12rpx;
	}

	.remove-photo {
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

	.add-photo {
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

	.photo-tip {
		font-size: 22rpx;
		color: #999;
		text-align: center;
	}

	/* 车牌识别区域 */
	.license-section {
		background-color: white;
		border-radius: 16rpx;
		padding: 32rpx 24rpx;
		margin-bottom: 24rpx;
	}

	.license-result {
		margin-top: 16rpx;
	}

	.license-input {
		width: 100%;
		padding: 20rpx 24rpx;
		border: 2rpx solid #e8e8e8;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #fafafa;
		text-align: center;
		font-weight: 600;
		letter-spacing: 2rpx;
	}

	.license-tip {
		font-size: 22rpx;
		color: #007aff;
		text-align: center;
		margin-top: 12rpx;
		display: block;
	}

	/* 违停信息区域 */
	.violation-section {
		background-color: white;
		border-radius: 16rpx;
		padding: 32rpx 24rpx;
		margin-bottom: 24rpx;
	}

	.form-item {
		margin-bottom: 24rpx;
	}

	.form-item:last-child {
		margin-bottom: 0;
	}

	.label {
		font-size: 26rpx;
		color: #333;
		display: block;
		margin-bottom: 12rpx;
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

	.textarea {
		width: 100%;
		min-height: 120rpx;
		padding: 20rpx 24rpx;
		border: 2rpx solid #e8e8e8;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #fafafa;
		resize: none;
	}

	/* 提交按钮 */
	.submit-section {
		padding: 20rpx 0;
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

	/* 榜单界面样式 */
	.ranking-section {
		padding: 24rpx;
	}

	.ranking-header {
		background-color: white;
		border-radius: 16rpx;
		padding: 32rpx 24rpx;
		margin-bottom: 24rpx;
		text-align: center;
	}

	.ranking-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #333;
		display: block;
		margin-bottom: 12rpx;
	}

	.ranking-desc {
		font-size: 24rpx;
		color: #999;
	}

	.ranking-list {
		background-color: white;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.ranking-item {
		display: flex;
		align-items: center;
		padding: 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.ranking-item:last-child {
		border-bottom: none;
	}

	.ranking-number {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: 700;
		color: white;
		margin-right: 24rpx;
	}

	.rank-1 {
		background-color: #ffd700;
	}

	.rank-2 {
		background-color: #c0c0c0;
	}

	.rank-3 {
		background-color: #cd7f32;
	}

	.ranking-number:not(.rank-1):not(.rank-2):not(.rank-3) {
		background-color: #999;
	}

	.license-info {
		flex: 1;
	}

	.license-plate {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
		letter-spacing: 1rpx;
	}

	.report-count {
		font-size: 24rpx;
		color: #ff4757;
	}

	.latest-report {
		text-align: right;
	}

	.report-time {
		font-size: 22rpx;
		color: #999;
	}

	/* 空状态 */
	.empty-ranking {
		text-align: center;
		padding: 120rpx 40rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
		display: block;
		margin: 24rpx 0 12rpx;
	}

	.empty-desc {
		font-size: 24rpx;
		color: #ccc;
	}

	/* 成功弹窗 */
	.success-modal {
		width: 600rpx;
		background-color: white;
		border-radius: 20rpx;
		padding: 60rpx 40rpx;
		text-align: center;
	}

	.success-icon {
		margin-bottom: 32rpx;
	}

	.success-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 16rpx;
	}

	.success-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
		display: block;
		margin-bottom: 40rpx;
	}

	.confirm-btn {
		width: 200rpx;
		height: 72rpx;
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 36rpx;
		font-size: 28rpx;
	}
</style>