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
					<text class="photo-count">({{ uploadedImages.length }}/3)</text>
				</view>
				
				<!-- 使用封装的图片上传组件 -->
				<ImageUploader 
					v-model="uploadedImages"
					:max-count="3"
					module="report"
					@upload-success="onUploadSuccess"
					@upload-error="onUploadError"
				/>
				
				<text class="photo-tip">最多可拍摄3张照片，请确保车牌号清晰可见</text>
			</view>

			<!-- 车牌识别区域 -->
			<view class="license-section" v-if="uploadedImages.length > 0">
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
			<view class="violation-section" v-if="uploadedImages.length > 0">
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
			<view class="submit-section" v-if="uploadedImages.length > 0">
				<button class="submit-btn" @tap="submitReport" :disabled="!canSubmit || isSubmitting">
					{{ isSubmitting ? '提交中...' : '提交举报' }}
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
	import ImageUploader from '@/components/ImageUploader.vue';

	const currentTab = ref('report');
	const uploadedImages = ref([]);
	const licenseNumber = ref('');
	const recognizedLicense = ref('');
	const isRecognizing = ref(false);
	const violationLocation = ref('');
	const violationType = ref('');
	const violationTypeIndex = ref(-1);
	const violationDesc = ref('');
	const successPopup = ref(null);
	const isSubmitting = ref(false);

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

	// 云对象实例
	let reportCloudObj = null;

	// 初始化云对象
	const initCloudObj = () => {
		try {
			reportCloudObj = uniCloud.importObject('report');
		} catch (error) {
			console.error('举报云对象初始化失败:', error);
		}
	};

	// 是否可以提交
	const canSubmit = computed(() => {
		return uploadedImages.value.length > 0 && 
			   licenseNumber.value.trim() && 
			   violationLocation.value.trim() && 
			   violationType.value;
	});

	// 切换TAB
	const switchTab = (tab) => {
		currentTab.value = tab;
	};

	// 图片上传成功回调
	const onUploadSuccess = (data) => {
			// 自动触发车牌识别
		if (uploadedImages.value.length === 1) {
			setTimeout(() => {
				recognizeLicense();
			}, 500);
		}
	};

	// 图片上传失败回调
	const onUploadError = (error) => {
		console.error('图片上传失败:', error);
		uni.showToast({
			title: '图片上传失败',
			icon: 'none'
		});
	};

	// 车牌识别
	const recognizeLicense = async () => {
		if (uploadedImages.value.length === 0) {
			uni.showToast({
				title: '请先上传照片',
				icon: 'none'
			});
			return;
		}

		isRecognizing.value = true;
		
		try {
			// 模拟车牌识别过程
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// 模拟识别结果
			const mockLicenses = ['京A12345', '沪B67890', '粤C11111', '川D22222'];
			const randomLicense = mockLicenses[Math.floor(Math.random() * mockLicenses.length)];
			
			recognizedLicense.value = randomLicense;
			licenseNumber.value = randomLicense;
			
			uni.showToast({
				title: '识别成功',
				icon: 'success'
			});
		} catch (error) {
			console.error('车牌识别失败:', error);
			uni.showToast({
				title: '识别失败，请手动输入',
				icon: 'none'
			});
		} finally {
			isRecognizing.value = false;
		}
	};

	// 违停类型选择
	const onViolationTypeChange = (e) => {
		violationTypeIndex.value = e.detail.value;
		violationType.value = violationTypes[e.detail.value];
	};

	// 提交举报
	const submitReport = async () => {
		if (!canSubmit.value) {
			uni.showToast({
				title: '请完善举报信息',
				icon: 'none'
			});
			return;
		}

		isSubmitting.value = true;

		try {
			// 构建举报数据
			const reportData = {
				licenseNumber: licenseNumber.value.trim(),
				violationLocation: violationLocation.value.trim(),
				violationType: violationType.value,
				violationDesc: violationDesc.value.trim(),
				images: uploadedImages.value,
				reportTime: new Date().toISOString()
			};



			// 如果有举报云对象，调用云函数
			if (reportCloudObj) {
				const result = await reportCloudObj.submitReport(reportData);
				
				if (result.errCode === 0) {
					// 提交成功
					successPopup.value.open();
					resetForm();
				} else {
					uni.showToast({
						title: result.errMsg || '提交失败',
						icon: 'none'
					});
				}
			} else {
				// 模拟提交成功
				await new Promise(resolve => setTimeout(resolve, 1000));
				successPopup.value.open();
				resetForm();
			}

		} catch (error) {
			console.error('提交举报失败:', error);
			uni.showToast({
				title: '提交失败，请重试',
				icon: 'none'
			});
		} finally {
			isSubmitting.value = false;
		}
	};

	// 重置表单
	const resetForm = () => {
		uploadedImages.value = [];
		licenseNumber.value = '';
		recognizedLicense.value = '';
		violationLocation.value = '';
		violationType.value = '';
		violationTypeIndex.value = -1;
		violationDesc.value = '';
	};

	// 关闭成功弹窗
	const closeSuccessModal = () => {
		successPopup.value.close();
	};

	// 格式化时间
	const formatTime = (date) => {
		if (!date) return '';
		
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
		initCloudObj();
	});
</script>

<style scoped>
	.container {
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.tab-bar {
		display: flex;
		background-color: white;
		border-bottom: 1rpx solid #eee;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 30rpx 0;
		font-size: 32rpx;
		color: #666;
		position: relative;
	}

	.tab-item.active {
		color: #007aff;
		font-weight: bold;
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

	.report-section {
		padding: 20rpx;
	}

	.photo-section,
	.license-section,
	.violation-section {
		background-color: white;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.section-title {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.section-title text {
		margin-left: 10rpx;
	}

	.photo-count {
		margin-left: auto !important;
		font-size: 28rpx !important;
		color: #999 !important;
		font-weight: normal !important;
	}

	.photo-tip {
		display: block;
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #999;
		text-align: center;
	}

	.scan-btn {
		margin-left: auto;
		background-color: #007aff;
		color: white;
		padding: 10rpx 20rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
	}

	.scan-btn.loading {
		background-color: #ccc;
	}

	.license-result {
		margin-top: 20rpx;
	}

	.license-input {
		width: 100%;
		padding: 20rpx;
		border: 2rpx solid #eee;
		border-radius: 10rpx;
		font-size: 32rpx;
		text-align: center;
		letter-spacing: 4rpx;
	}

	.license-tip {
		display: block;
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #007aff;
		text-align: center;
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.label {
		display: block;
		margin-bottom: 15rpx;
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}

	.input,
	.textarea {
		width: 100%;
		padding: 20rpx;
		border: 2rpx solid #eee;
		border-radius: 10rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	.textarea {
		height: 120rpx;
		resize: none;
	}

	.picker {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
		border: 2rpx solid #eee;
		border-radius: 10rpx;
		font-size: 28rpx;
		color: #333;
	}

	.submit-section {
		margin-top: 40rpx;
	}

	.submit-btn {
		width: 100%;
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 50rpx;
		padding: 30rpx 0;
		font-size: 32rpx;
		font-weight: bold;
	}

	.submit-btn:disabled {
		background-color: #ccc;
	}

	.ranking-section {
		padding: 20rpx;
	}

	.ranking-header {
		background-color: white;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		text-align: center;
	}

	.ranking-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}

	.ranking-desc {
		font-size: 26rpx;
		color: #999;
		display: block;
	}

	.ranking-list {
		background-color: white;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.ranking-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f5f5f5;
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
		font-weight: bold;
		color: white;
		margin-right: 20rpx;
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
		margin-right: 20rpx;
	}

	.license-plate {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 5rpx;
	}

	.report-count {
		font-size: 24rpx;
		color: #ff4757;
		display: block;
	}

	.latest-report {
		text-align: right;
	}

	.report-time {
		font-size: 24rpx;
		color: #999;
	}

	.empty-ranking {
		text-align: center;
		padding: 100rpx 0;
		color: #999;
	}

	.empty-text {
		font-size: 32rpx;
		margin: 20rpx 0 10rpx;
		display: block;
	}

	.empty-desc {
		font-size: 26rpx;
		display: block;
	}

	.success-modal {
		background-color: white;
		border-radius: 20rpx;
		padding: 60rpx 40rpx 40rpx;
		text-align: center;
		width: 600rpx;
	}

	.success-icon {
		margin-bottom: 30rpx;
	}

	.success-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 20rpx;
	}

	.success-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		display: block;
		margin-bottom: 40rpx;
	}

	.confirm-btn {
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 50rpx;
		padding: 20rpx 60rpx;
		font-size: 28rpx;
	}
</style>