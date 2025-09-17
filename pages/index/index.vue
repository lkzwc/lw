<template>
	<view class="container">
		<!-- 轮播图区域 -->
		<view class="banner-section">
			<uni-swiper-dot :info="bannerList" :current="current" field="content" mode="round">
				<swiper class="swiper-box" @change="change" :current="swiperCurrent">
					<swiper-item v-for="(item, index) in bannerList" :key="index">
						<view class="swiper-item" @tap="clickBannerItem(item)">
							<image :src="item.image" mode="aspectFill"></image>
							<view class="banner-title">{{ item.title }}</view>
						</view>
					</swiper-item>
				</swiper>
			</uni-swiper-dot>
		</view>

		<!-- 个性化菜单区域 -->
		<view class="creative-menu-section">
			<view class="menu-grid">
				<!-- 大卡片 - 每日热榜 -->
				<view class="menu-card large-card news-card" @tap="clickMenuItem(menuList[0])">
					<view class="card-content">
						<view class="card-icon">
							<uni-icons :type="menuList[0].icon" :size="40" color="white"></uni-icons>
						</view>
						<view class="card-info">
							<text class="card-title">{{ menuList[0].name }}</text>
							<text class="card-desc">60s读懂全球新闻和AI热点</text>
						</view>
					</view>
				</view>

				<!-- 中等卡片 - 天气 -->
				<view class="menu-card medium-card weather-card" @tap="clickMenuItem(menuList[1])">
					<view class="card-content">
						<view class="weather-loading" v-if="weatherLoading">
							<uni-icons type="spinner-cycle" :size="24" color="white"></uni-icons>
							<text class="loading-text">加载中...</text>
						</view>
						<view class="weather-info" v-else>
							<view class="weather-main">
								<view class="weather-icon">
									<uni-icons :type="getWeatherIcon(weatherData.weather)" :size="36" color="white"></uni-icons>
								</view>
								<view class="weather-primary">
									<text class="temperature">{{ weatherData.temperature }}°C</text>
									<text class="weather-desc">{{ weatherData.weather }}</text>
								</view>
							</view>
							<view class="weather-details">
								<view class="detail-item">
									<uni-icons type="navigate" :size="14" color="rgba(255,255,255,0.8)"></uni-icons>
									<text class="detail-text">{{ weatherData.winddirection }}风 {{ weatherData.windpower }}级</text>
								</view>
								<view class="detail-item">
									<uni-icons type="water" :size="14" color="rgba(255,255,255,0.8)"></uni-icons>
									<text class="detail-text">湿度 {{ weatherData.humidity }}%</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 小卡片组 -->
				<view class="small-cards-group">
					<view class="menu-card small-card" 
						v-for="(item, index) in menuList.slice(2, 6)" 
						:key="index" 
						@tap="clickMenuItem(item)"
						:class="'card-' + (index + 1)">
						<view class="card-content">
							<view class="card-icon">
								<uni-icons :type="item.icon" :size="24" color="white"></uni-icons>
							</view>
							<text class="card-title">{{ item.name }}</text>
						</view>
					</view>
				</view>

				<!-- 横向长卡片 - 学习 -->
				<view class="menu-card wide-card learning-card" @tap="clickMenuItem(menuList[6])">
					<view class="card-content">
						<view class="card-left">
							<view class="card-icon">
								<uni-icons :type="menuList[6].icon" :size="28" color="#333"></uni-icons>
							</view>
							<view class="card-info">
								<text class="card-title">{{ menuList[6].name }}</text>
								<text class="card-desc">今日学习进度</text>
							</view>
						</view>
						<view class="card-right">
							<text class="progress-text">60%</text>
							<view class="progress-bar">
								<view class="progress-fill" style="width: 60%"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onMounted,
		reactive,
		ref
	} from 'vue';

	const current = ref(0);
	const swiperCurrent = ref(0);
	const weatherLoading = ref(true);
	const isGettingWeather = ref(false); // 添加防重复调用标志
	const weatherData = reactive({
		city: '天气',
		weather: '晴',
		temperature: '25',
		winddirection: '东南',
		windpower: '≤3',
		humidity: '65'
	});

	// 云对象实例
	let utilObj = null;

	// 轮播图数据
	const bannerList = reactive([
		{
			image: 'https://via.placeholder.com/750x300/667eea/FFFFFF?text=欢迎使用hxzyL',
			title: '欢迎使用hxzyL',
			content: '发现更多精彩内容'
		},
		{
			image: 'https://via.placeholder.com/750x300/764ba2/FFFFFF?text=社区互动',
			title: '社区互动',
			content: '与朋友分享生活点滴'
		},
		{
			image: 'https://via.placeholder.com/750x300/f093fb/FFFFFF?text=技能提升',
			title: '技能提升',
			content: '学习新技能，提升自己'
		}
	]);

	// 菜单数据
	const menuList = reactive([
		{
			name: '每日热榜',
			icon: 'star',
			color: '#667eea',
			type: 'news'
		},
		{
			name: '天气',
			icon: 'cloud',
			color: '#764ba2',
			type: 'weather'
		},
		{
			name: '随手拍',
			icon: 'camera',
			color: '#4facfe',
			type: 'tools'
		},
		{
			name: '技能台',
			icon: 'gear',
			color: '#43e97b',
			type: 'skills'
		},
		{
			name: '健康',
			icon: 'heart',
			color: '#fa709a',
			type: 'health'
		},
		{
			name: '购物',
			icon: 'cart',
			color: '#ffeaa7',
			type: 'shopping'
		},
		{
			name: '学习',
			icon: 'book',
			color: '#ffecd2',
			type: 'study'
		}
	]);

	// 初始化云对象
	const initCloudObj = () => {
		try {
			utilObj = uniCloud.importObject('util');
		} catch (error) {
			uni.showToast({
				title: '云对象初始化失败',
				icon: 'none'
			});
		}
	};

	// 获取天气数据
	const getWeatherData = async () => {
		// 防止重复调用
		if (isGettingWeather.value) {
			return;
		}
		
		if (!utilObj) {
			weatherLoading.value = false;
			uni.showToast({
				title: '云对象未初始化',
				icon: 'none'
			});
			return;
		}

		try {
			isGettingWeather.value = true;
			weatherLoading.value = true;
			
			// 调用云对象的天气查询方法
			const result = await utilObj.getWeatherByCityName();
			
			if (result && result.errCode === 0 && result.data) {
				// 更新天气数据
				Object.assign(weatherData, {
					city: result.data.city,
					weather: result.data.weather,
					temperature: result.data.temperature,
					winddirection: result.data.winddirection,
					windpower: result.data.windpower,
					humidity: result.data.humidity
				});
				
				uni.showToast({
					title: '天气数据加载成功',
					icon: 'success',
					duration: 1500
				});
			} else {
				uni.showToast({
					title: result?.errMsg || '天气数据获取失败',
					icon: 'none'
				});
			}
			
		} catch (error) {
			// 使用MOCK数据
			Object.assign(weatherData, {
				city: '西安市',
				weather: '晴',
				temperature: '22',
				winddirection: '东南',
				windpower: '≤3',
				humidity: '60'
			});
			
			uni.showToast({
				title: '使用本地数据',
				icon: 'none'
			});
		} finally {
			weatherLoading.value = false;
			isGettingWeather.value = false;
		}
	};

	// 根据天气状况返回对应图标
	const getWeatherIcon = (weather) => {
		const weatherIconMap = {
			'晴': 'color',
			'晴天': 'color',
			'多云': 'cloud',
			'少云': 'cloud',
			'阴': 'cloud-filled',
			'阴天': 'cloud-filled',
			'小雨': 'cloud-drizzle',
			'中雨': 'cloud-rain',
			'大雨': 'cloud-rain-filled',
			'暴雨': 'cloud-rain-filled',
			'雷阵雨': 'cloud-lightning',
			'雷雨': 'cloud-lightning',
			'雪': 'cloud-snow',
			'小雪': 'cloud-snow',
			'中雪': 'cloud-snow',
			'大雪': 'cloud-snow',
			'雾': 'eye-slash',
			'霾': 'eye-slash-filled',
			'沙尘暴': 'eye-slash-filled',
			'浮尘': 'eye-slash',
			'扬沙': 'eye-slash'
		};
		
		return weatherIconMap[weather] || 'cloud';
	};

	// 轮播图切换事件
	const change = (e) => {
		current.value = e.detail.current;
		swiperCurrent.value = e.detail.current;
	};

	// 点击轮播图
	const clickBannerItem = (item) => {
		uni.showToast({
			title: item.title,
			icon: 'none'
		});
	};

	// 点击菜单项
	const clickMenuItem = (item) => {
		switch (item.type) {
			case 'news':
				uni.navigateTo({
					url: '/pages/news/news'
				});
				break;
			case 'weather':
				// 重新获取天气数据
				if (isGettingWeather.value) {
					uni.showToast({
						title: '天气数据获取中...',
						icon: 'loading'
					});
				} else {
					getWeatherData();
				}
				break;
			case 'tools':
				uni.navigateTo({
					url: '/pages/camera/camera'
				});
				break;
			case 'skills':
				uni.navigateTo({
					url: '/pages/skills/skills'
				});
				break;
			case 'health':
				uni.showToast({
					title: '健康功能开发中',
					icon: 'none'
				});
				break;
			case 'shopping':
				uni.showToast({
					title: '购物功能开发中',
					icon: 'none'
				});
				break;
			case 'study':
				uni.showToast({
					title: '学习功能开发中',
					icon: 'none'
				});
				break;
			default:
				uni.showToast({
					title: `${item.name}功能开发中`,
					icon: 'none'
				});
		}
	};

	onMounted(() => {
		console.log('首页加载完成');
		// 初始化云对象
		initCloudObj();
		// 获取天气数据
		setTimeout(() => {
			getWeatherData();
		}, 500); // 延迟500ms确保云对象初始化完成
	});
</script>

<style scoped>
	.container {
		background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
		min-height: 100vh;
		padding-bottom: 60rpx;
	}

	/* 轮播图样式 */
	.banner-section {
		margin: 20rpx 20rpx 24rpx 20rpx;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
	}

	.swiper-box {
		height: 320rpx;
	}

	.swiper-item {
		position: relative;
		height: 100%;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.swiper-item image {
		width: 100%;
		height: 100%;
		border-radius: 20rpx;
	}

	.banner-title {
		position: absolute;
		bottom: 20rpx;
		left: 20rpx;
		color: white;
		font-size: 32rpx;
		font-weight: bold;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
	}

	/* 菜单网格样式 */
	.creative-menu-section {
		margin: 0 20rpx;
	}

	.menu-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: auto auto auto;
		gap: 16rpx;
		grid-template-areas:
			"news weather"
			"small-cards small-cards"
			"learning learning";
	}

	.menu-card {
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.menu-card:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12);
	}

	/* 大卡片 - 每日热榜 */
	.large-card {
		grid-area: news;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		height: 160rpx;
	}

	.news-card .card-content {
		display: flex;
		align-items: center;
		padding: 24rpx;
		height: 100%;
	}

	.news-card .card-icon {
		margin-right: 20rpx;
	}

	.news-card .card-info {
		flex: 1;
	}

	.news-card .card-title {
		display: block;
		color: white;
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.news-card .card-desc {
		display: block;
		color: rgba(255, 255, 255, 0.8);
		font-size: 24rpx;
	}

	/* 中等卡片 - 天气 */
	.medium-card {
		grid-area: weather;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		height: 160rpx;
	}

	.weather-card .card-content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 20rpx;
		height: 100%;
	}

	.weather-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 8rpx;
	}

	.loading-text {
		color: white;
		font-size: 20rpx;
	}

	.weather-info {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
	}

	.weather-main {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.weather-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.weather-primary {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.temperature {
		color: white;
		font-size: 28rpx;
		font-weight: bold;
		line-height: 1;
	}

	.weather-desc {
		color: rgba(255, 255, 255, 0.9);
		font-size: 20rpx;
	}

	.weather-details {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		margin-top: 8rpx;
	}

	.detail-item {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.detail-text {
		color: rgba(255, 255, 255, 0.8);
		font-size: 18rpx;
		line-height: 1;
	}

	/* 小卡片组 */
	.small-cards-group {
		grid-area: small-cards;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12rpx;
	}

	.small-card {
		height: 120rpx;
	}

	.small-card .card-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 16rpx;
		height: 100%;
		text-align: center;
	}

	.small-card .card-title {
		color: white;
		font-size: 20rpx;
		font-weight: bold;
		margin-top: 8rpx;
	}

	/* 小卡片颜色 */
	.card-1 {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	}

	.card-2 {
		background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
	}

	.card-3 {
		background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
	}

	.card-4 {
		background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
	}

	/* 横向长卡片 - 学习 */
	.wide-card {
		grid-area: learning;
		background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
		height: 100rpx;
	}

	.learning-card .card-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 24rpx;
		height: 100%;
	}

	.card-left {
		display: flex;
		align-items: center;
	}

	.learning-card .card-icon {
		margin-right: 16rpx;
	}

	.learning-card .card-title {
		display: block;
		color: #333;
		font-size: 26rpx;
		font-weight: bold;
		margin-bottom: 4rpx;
	}

	.learning-card .card-desc {
		display: block;
		color: #666;
		font-size: 22rpx;
	}

	.card-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.progress-text {
		color: #333;
		font-size: 24rpx;
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.progress-bar {
		width: 120rpx;
		height: 8rpx;
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: 4rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		border-radius: 4rpx;
		transition: width 0.3s ease;
	}

	/* 响应式调整 */
	@media screen and (max-width: 750rpx) {
		.menu-grid {
			grid-template-columns: 1fr;
			grid-template-areas:
				"news"
				"weather"
				"small-cards"
				"learning";
		}

		.medium-card {
			height: 120rpx;
		}
	}
</style>