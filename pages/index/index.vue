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
				<!-- 大卡片 - 天气 -->
				<view class="menu-card large-card weather-card" @tap="clickMenuItem(menuList[0])">
					<view class="card-content">
						<view class="card-icon">
							<uni-icons :type="menuList[0].icon" :size="40" color="white"></uni-icons>
						</view>
						<view class="card-info">
							<text class="card-title">{{ menuList[0].name }}</text>
							<text class="card-desc">今日晴朗 25°C</text>
						</view>
					</view>
				</view>

				<!-- 中等卡片 - 技能台 -->
				<view class="menu-card medium-card skills-card" @tap="clickMenuItem(menuList[1])">
					<view class="card-content">
						<view class="card-icon">
							<uni-icons :type="menuList[1].icon" :size="32" color="white"></uni-icons>
						</view>
						<text class="card-title">{{ menuList[1].name }}</text>
						<text class="card-subtitle">提升技能</text>
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
			title: '业主共享技能',
			content: '学习新技能，提升自己'
		}
	]);

	// 菜单数据（去掉更多选项）
	const menuList = reactive([
		{
			name: '每日热榜',
			icon: 'cloud',
			color: '#667eea',
			type: 'news'
		},
		{
			name: '技能台',
			icon: 'gear',
			color: '#764ba2',
			type: 'weather'
		},
		{
			name: '技能台',
			icon: 'gear',
			color: '#764ba2',
			type: 'skills'
		},
		{
			name: '随手拍',
			icon: 'settings',
			color: '#f093fb',
			type: 'cars'
		},
		{
			name: '健康',
			icon: 'heart',
			color: '#43e97b',
			type: 'health'
		},
		{
			name: '购物',
			icon: 'cart',
			color: '#fa709a',
			type: 'shopping'
		},
		{
			name: '学习',
			icon: 'book',
			color: '#ffecd2',
			type: 'study'
		}
	]);

	// 轮播图切换事件
	const change = (e) => {
		current.value = e.detail.current;
		swiperCurrent.value = e.detail.current;
	};

	// 点击轮播图
	const clickBannerItem = (item) => {
		console.log('点击轮播图:', item);
		uni.showToast({
			title: item.title,
			icon: 'none'
		});
	};

	// 点击菜单项
	const clickMenuItem = (item) => {
		console.log('点击菜单:', item);
		switch (item.type) {
			case 'weather':
				uni.showToast({
					title: '天气功能开发中',
					icon: 'none'
				});
				break;
			case 'skills':
				uni.navigateTo({
					url: '/pages/skills/skills'
				});
				break;
			case 'tools':
				uni.navigateTo({
					url: '/pages/camera/camera'
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
	}

	.swiper-item image {
		width: 100%;
		height: 100%;
	}

	.banner-title {
		position: absolute;
		bottom: 24rpx;
		left: 24rpx;
		color: white;
		font-size: 36rpx;
		font-weight: 700;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
		letter-spacing: 1rpx;
	}

	/* 个性化菜单样式 */
	.creative-menu-section {
		margin: 0 20rpx;
		padding-bottom: 40rpx;
	}

	.menu-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: auto auto auto;
		gap: 16rpx;
		height: auto;
	}

	.menu-card {
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.menu-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
		pointer-events: none;
	}

	.menu-card:active {
		transform: scale(0.96);
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
	}

	.card-content {
		padding: 24rpx;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		z-index: 1;
	}

	/* 大卡片 - 天气 */
	.large-card {
		grid-column: 1 / 2;
		grid-row: 1 / 2;
		height: 180rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.large-card .card-content {
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		padding: 28rpx;
	}

	.large-card .card-info {
		margin-left: 24rpx;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.large-card .card-title {
		color: white;
		font-size: 34rpx;
		font-weight: 700;
		display: block;
		margin-bottom: 8rpx;
		letter-spacing: 1rpx;
	}

	.large-card .card-desc {
		color: rgba(255, 255, 255, 0.9);
		font-size: 26rpx;
		display: block;
		font-weight: 500;
	}

	/* 中等卡片 - 技能台 */
	.medium-card {
		grid-column: 2 / 3;
		grid-row: 1 / 2;
		height: 180rpx;
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}

	.medium-card .card-content {
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 24rpx;
	}

	.medium-card .card-title {
		color: white;
		font-size: 28rpx;
		font-weight: 700;
		margin-top: 12rpx;
		letter-spacing: 1rpx;
	}

	.medium-card .card-subtitle {
		color: rgba(255, 255, 255, 0.8);
		font-size: 22rpx;
		margin-top: 6rpx;
		font-weight: 500;
	}

	/* 小卡片组 */
	.small-cards-group {
		grid-column: 1 / 3;
		grid-row: 2 / 3;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16rpx;
		margin: 8rpx 0;
	}

	.small-card {
		height: 160rpx;
		background: white;
	}

	.small-card .card-content {
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 24rpx 16rpx;
	}

	.small-card .card-title {
		color: white;
		font-size: 24rpx;
		font-weight: 600;
		margin-top: 12rpx;
		letter-spacing: 0.5rpx;
		line-height: 1.2;
	}

	.small-card.card-1 {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	}

	.small-card.card-2 {
		background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
	}

	.small-card.card-3 {
		background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
	}

	.small-card.card-4 {
		background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
	}

	.small-card.card-4 .card-title {
		color: #333;
	}

	/* 横向长卡片 - 学习 */
	.wide-card {
		grid-column: 1 / 3;
		grid-row: 3 / 4;
		height: 120rpx;
		background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
		margin-top: 8rpx;
	}

	.wide-card .card-content {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx;
	}

	.wide-card .card-left {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.wide-card .card-info {
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.wide-card .card-title {
		color: #333;
		font-size: 28rpx;
		font-weight: 700;
		display: block;
		margin-bottom: 4rpx;
		letter-spacing: 1rpx;
	}

	.wide-card .card-desc {
		color: #666;
		font-size: 22rpx;
		display: block;
		font-weight: 500;
	}

	.wide-card .card-right {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 100rpx;
	}

	.progress-text {
		color: #333;
		font-size: 30rpx;
		font-weight: 700;
		margin-bottom: 8rpx;
	}

	.progress-bar {
		width: 80rpx;
		height: 6rpx;
		background-color: rgba(255, 255, 255, 0.6);
		border-radius: 3rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		border-radius: 3rpx;
		transition: width 0.3s ease;
	}
</style>