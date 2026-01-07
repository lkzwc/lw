<template>
	<view class="container">
		<!-- 头部标题 -->
		<view class="header">
			<view class="header-content">
				<text class="header-title">{{ getCurrentNewsData().head || '每日60秒读懂世界' }}</text>
				<text class="header-date">{{ formatDate(getCurrentNewsData().date) }}</text>
			</view>
			<view class="refresh-btn" @tap="refreshNews">
				<uni-icons type="refresh" :size="24" :color="isLoading ? '#ccc' : '#667eea'"></uni-icons>
			</view>
		</view>

		<!-- TAB切换 -->
		<view class="tab-container">
			<view class="tab-list">
				<view 
					class="tab-item" 
					:class="{ active: currentTab === 'daily' }"
					@tap="switchTab('daily')"
				>
					<text class="tab-text">每日热榜</text>
				</view>
				<view 
					class="tab-item" 
					:class="{ active: currentTab === 'ai' }"
					@tap="switchTab('ai')"
				>
					<text class="tab-text">AI快讯</text>
				</view>
			</view>
			<view class="tab-indicator" :style="{ left: tabIndicatorLeft }"></view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<uni-icons type="spinner-cycle" :size="32" color="#667eea"></uni-icons>
			<text class="loading-text">正在获取最新资讯...</text>
		</view>

		<!-- 新闻内容 -->
		<view class="news-content" v-else>
			<!-- 新闻图片 -->
			<view class="news-image" v-if="getCurrentNewsData().image">
				<image :src="getCurrentNewsData().image" mode="aspectFill" class="image"></image>
			</view>

			<!-- 新闻列表 -->
			<view class="news-list">
				<view 
					class="news-item" 
					v-for="(item, index) in getCurrentNewsData().news" 
					:key="index"
					@tap="copyNewsItem(item)"
				>
					<view class="news-index">{{ index + 1 }}</view>
					<text class="news-text">{{ item }}</text>
					<view class="copy-icon">
						<uni-icons type="copy" :size="16" color="#999"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 温馨提示 -->
			<view class="tip-section" v-if="getCurrentNewsData().tip">
				<view class="tip-header">
					<uni-icons type="info" :size="18" color="#667eea"></uni-icons>
					<text class="tip-title">温馨提示</text>
				</view>
				<text class="tip-content">{{ getCurrentNewsData().tip }}</text>
			</view>

			<!-- 更新时间 -->
			<view class="update-info">
				<text class="update-text">更新时间：{{ formatDateTime(getCurrentNewsData().updated) }}</text>
			</view>
		</view>

		<!-- 底部操作 -->
		<view class="bottom-actions">
			<view class="action-btn" @tap="shareNews">
				<uni-icons type="share" :size="20" color="white"></uni-icons>
				<text class="action-text">分享</text>
			</view>
			<view class="action-btn" @tap="copyAllNews">
				<uni-icons type="copy" :size="20" color="white"></uni-icons>
				<text class="action-text">复制全部</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onMounted,
		reactive,
		ref,
		computed
	} from 'vue';

	const isLoading = ref(true);
	const currentTab = ref('daily'); // 当前选中的tab: daily, global, ai
	
	// 三个不同类型的新闻数据
	const dailyNewsData = reactive({
		date: '',
		head: '每日60秒读懂世界',
		news: [],
		tip: '',
		image: '',
		updated: ''
	});
	
	const globalNewsData = reactive({
		date: '',
		head: '全球热点',
		news: [],
		tip: '',
		image: '',
		updated: ''
	});
	
	const aiNewsData = reactive({
		date: '',
		head: 'AI快讯',
		news: [],
		tip: '',
		image: '',
		updated: ''
	});

	// 云对象实例
	let apiObj = null;

	// 计算当前显示的新闻数据
	const getCurrentNewsData = () => {
		switch (currentTab.value) {
			case 'daily':
				return dailyNewsData;
			case 'global':
				return globalNewsData;
			case 'ai':
				return aiNewsData;
			default:
				return dailyNewsData;
		}
	};

	// 计算tab指示器位置
	const tabIndicatorLeft = computed(() => {
		const tabIndex = currentTab.value === 'daily' ? 0 : currentTab.value === 'global' ? 1 : 2;
		return `${tabIndex * 33.33}%`;
	});

	// 初始化云对象
	const initCloudObj = () => {
		try {
			apiObj = uniCloud.importObject('api');
		} catch (error) {
			uni.showToast({
				title: '云对象初始化失败',
				icon: 'none'
			});
		}
	};

	// 获取每日新闻数据
	const getDailyNewsData = async (forceUpdate = false) => {
		if (!apiObj) return;

		try {
			const result = await apiObj.getDailyNews('', forceUpdate);
			
			if (result && result.errCode === 0 && result.data) {
				Object.assign(dailyNewsData, {
					date: result.data.date,
					head: result.data.head,
					news: result.data.news || [],
					tip: result.data.tip,
					image: result.data.image,
					updated: result.data.updated
				});
			}
		} catch (error) {
			uni.showToast({
				title: '每日新闻获取失败',
				icon: 'none'
			});
		}
	};

	// 获取全球热点数据（使用每日新闻接口）
	const getGlobalNewsData = async (forceUpdate = false) => {
		if (!apiObj) return;

		try {
			const result = await apiObj.getDailyNews('', forceUpdate);
			
			if (result && result.errCode === 0 && result.data) {
				Object.assign(globalNewsData, {
					date: result.data.date,
					head: '全球热点',
					news: result.data.news || [],
					tip: '了解全球重要事件，拓展国际视野。',
					image: result.data.image,
					updated: result.data.updated
				});
			}
		} catch (error) {
			uni.showToast({
				title: '全球热点获取失败',
				icon: 'none'
			});
		}
	};

	// 获取AI新闻数据
	const getAINewsData = async (forceUpdate = false) => {
		if (!apiObj) return;

		try {
			const result = await apiObj.getAINews('', forceUpdate);
			
			if (result && result.errCode === 0 && result.data) {
				Object.assign(aiNewsData, {
					date: result.data.date,
					head: result.data.head,
					news: result.data.news || [],
					tip: result.data.tip,
					image: result.data.image,
					updated: result.data.updated
				});
			}
		} catch (error) {
			uni.showToast({
				title: 'AI快讯获取失败',
				icon: 'none'
			});
		}
	};

	// 获取新闻数据
	const getNewsData = async (forceUpdate = false) => {
		if (!apiObj) {
			isLoading.value = false;
			return;
		}

		try {
			isLoading.value = true;
			
			// 根据当前tab获取对应数据
			switch (currentTab.value) {
				case 'daily':
					await getDailyNewsData(forceUpdate);
					break;
				case 'global':
					await getGlobalNewsData(forceUpdate);
					break;
				case 'ai':
					await getAINewsData(forceUpdate);
					break;
			}
			
			if (!forceUpdate) {
				uni.showToast({
					title: '新闻加载成功',
					icon: 'success',
					duration: 1500
				});
			}
		} catch (error) {
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			});
		} finally {
			isLoading.value = false;
		}
	};

	// 切换tab
	const switchTab = async (tab) => {
		if (currentTab.value === tab) return;
		
		currentTab.value = tab;
		
		// 检查当前tab的数据是否已加载
		const currentData = getCurrentNewsData();
		if (!currentData.news || currentData.news.length === 0) {
			await getNewsData();
		}
	};

	// 刷新新闻
	const refreshNews = () => {
		if (isLoading.value) return;
		
		uni.showToast({
			title: '正在刷新...',
			icon: 'loading'
		});
		
		getNewsData(true);
	};

	// 格式化日期
	const formatDate = (dateStr) => {
		if (!dateStr) return '';
		
		const date = new Date(dateStr);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);
		
		if (date.toDateString() === today.toDateString()) {
			return '今日';
		} else if (date.toDateString() === yesterday.toDateString()) {
			return '昨日';
		} else {
			return date.toLocaleDateString('zh-CN', {
				month: 'long',
				day: 'numeric'
			});
		}
	};

	// 格式化日期时间
	const formatDateTime = (dateTimeStr) => {
		if (!dateTimeStr) return '';
		
		const date = new Date(dateTimeStr);
		return date.toLocaleString('zh-CN', {
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// 复制单条新闻
	const copyNewsItem = (newsItem) => {
		uni.setClipboardData({
			data: newsItem,
			success: () => {
				uni.showToast({
					title: '已复制到剪贴板',
					icon: 'success',
					duration: 1500
				});
			},
			fail: () => {
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				});
			}
		});
	};

	// 复制全部新闻
	const copyAllNews = () => {
		const currentData = getCurrentNewsData();
		if (!currentData.news || currentData.news.length === 0) {
			uni.showToast({
				title: '暂无新闻内容',
				icon: 'none'
			});
			return;
		}

		const allNews = `${currentData.head}\n${formatDate(currentData.date)}\n\n${currentData.news.join('\n\n')}\n\n${currentData.tip || ''}`;
		
		uni.setClipboardData({
			data: allNews,
			success: () => {
				uni.showToast({
					title: '全部内容已复制',
					icon: 'success',
					duration: 1500
				});
			},
			fail: () => {
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				});
			}
		});
	};

	// 分享新闻
	const shareNews = () => {
		const currentData = getCurrentNewsData();
		if (!currentData.news || currentData.news.length === 0) {
			uni.showToast({
				title: '暂无新闻内容',
				icon: 'none'
			});
			return;
		}

		const shareContent = `${currentData.head}\n${formatDate(currentData.date)}\n\n${currentData.news.slice(0, 3).join('\n\n')}...`;
		
		uni.share({
			provider: 'weixin',
			scene: 'WXSceneSession',
			type: 0,
			summary: shareContent,
			success: () => {
				uni.showToast({
					title: '分享成功',
					icon: 'success'
				});
			},
			fail: () => {
				// 如果分享失败，则复制到剪贴板
				copyAllNews();
			}
		});
	};

	onMounted(() => {
		// 初始化云对象
		initCloudObj();
		// 获取新闻数据
		setTimeout(() => {
			getNewsData();
		}, 100);
	});
</script>

<style scoped>
	.container {
		background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
		min-height: 100vh;
		padding-bottom: 120rpx;
	}

	/* 头部样式 */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 40rpx 30rpx 20rpx;
		background: white;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.header-content {
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.header-title {
		display: block;
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}

	.header-date {
		font-size: 24rpx;
		color: #666;
	}

	.refresh-btn {
		padding: 16rpx;
		border-radius: 50%;
		background: #f5f5f5;
		transition: all 0.3s ease;
	}

	.refresh-btn:active {
		transform: scale(0.95);
		background: #e5e5e5;
	}

	/* TAB样式 */
	.tab-container {
		position: relative;
		background: white;
		margin: 0 30rpx 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.tab-list {
		display: flex;
		position: relative;
	}

	.tab-item {
		flex: 1;
		padding: 24rpx 0;
		text-align: center;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.tab-item.active .tab-text {
		color: #667eea;
		font-weight: bold;
	}

	.tab-text {
		font-size: 28rpx;
		color: #666;
		transition: all 0.3s ease;
	}

	.tab-indicator {
		position: absolute;
		bottom: 0;
		width: 33.33%;
		height: 4rpx;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		border-radius: 2rpx;
		transition: left 0.3s ease;
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		gap: 20rpx;
	}

	.loading-text {
		font-size: 28rpx;
		color: #666;
	}

	/* 新闻内容 */
	.news-content {
		padding: 0 30rpx;
	}

	/* 新闻图片 */
	.news-image {
		margin: 30rpx 0;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	}

	.image {
		width: 100%;
		height: 300rpx;
	}

	/* 新闻列表 */
	.news-list {
		background: white;
		border-radius: 20rpx;
		padding: 30rpx;
		margin: 30rpx 0;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.news-item {
		display: flex;
		align-items: flex-start;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.news-item:last-child {
		border-bottom: none;
	}

	.news-item:active {
		background: #f8f9fa;
		transform: scale(0.98);
	}

	.news-index {
		width: 40rpx;
		height: 40rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		font-weight: bold;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.news-text {
		flex: 1;
		font-size: 28rpx;
		line-height: 1.6;
		color: #333;
		margin-right: 20rpx;
	}

	.copy-icon {
		opacity: 0.5;
		transition: opacity 0.3s ease;
	}

	.news-item:active .copy-icon {
		opacity: 1;
	}

	/* 温馨提示 */
	.tip-section {
		background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
		border-radius: 16rpx;
		padding: 30rpx;
		margin: 30rpx 0;
	}

	.tip-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		gap: 12rpx;
	}

	.tip-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #667eea;
	}

	.tip-content {
		font-size: 26rpx;
		line-height: 1.6;
		color: #555;
	}

	/* 更新信息 */
	.update-info {
		text-align: center;
		padding: 20rpx 0;
	}

	.update-text {
		font-size: 22rpx;
		color: #999;
	}

	/* 底部操作 */
	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		background: white;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
		gap: 20rpx;
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		padding: 24rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16rpx;
		transition: all 0.3s ease;
	}

	.action-btn:active {
		transform: scale(0.98);
		opacity: 0.8;
	}

	.action-text {
		font-size: 28rpx;
		color: white;
		font-weight: bold;
	}

	/* 响应式调整 */
	@media screen and (max-width: 750rpx) {
		.header {
			padding: 30rpx 20rpx 15rpx;
		}

		.tab-container {
			margin: 0 20rpx 15rpx;
		}

		.news-content {
			padding: 0 20rpx;
		}

		.news-list {
			padding: 20rpx;
		}

		.bottom-actions {
			padding: 15rpx 20rpx;
			padding-bottom: calc(15rpx + env(safe-area-inset-bottom));
		}
	}
</style>