<template>
	<view class="container">
		<!-- 顶部搜索栏 -->
		<view class="search-bar">
			<uni-search-bar 
				@input="onSearchInput" 
				placeholder="搜索帖子内容..." 
				:focus="false" 
				bg-color="#f5f5f5"
				cancel-button="none">
			</uni-search-bar>
		</view>

		<!-- 分类标签 -->
		<view class="category-tabs">
			<scroll-view scroll-x="true" class="scroll-tabs">
				<view class="tabs-container">
					<view 
						v-for="(item, index) in categoryList" 
						:key="index"
						class="tab-item"
						:class="{ active: currentCategory === item.id }"
						@tap="switchCategory(item.id)">
						{{ item.name }}
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 帖子列表 -->
		<view class="post-list">
			<view v-for="(post, index) in postList" :key="post.id" class="post-item" @tap="goToDetail(post)">
				<!-- 用户信息 -->
				<view class="post-header">
					<view class="user-info">
						<image :src="post.avatar" class="user-avatar" mode="aspectFill"></image>
						<view class="user-details">
							<text class="username">{{ post.username }}</text>
							<text class="post-time">{{ post.createTime }}</text>
						</view>
					</view>
					<view class="post-category">
						<uni-tag :text="post.categoryName" type="primary" size="small"></uni-tag>
					</view>
				</view>

				<!-- 帖子内容 -->
				<view class="post-content">
					<text class="post-title">{{ post.title }}</text>
					<text class="post-desc" v-if="post.content">{{ post.content }}</text>
					
					<!-- 图片展示 -->
					<view class="post-images" v-if="post.images && post.images.length > 0">
						<image 
							v-for="(img, imgIndex) in post.images.slice(0, 3)" 
							:key="imgIndex"
							:src="img" 
							class="post-image"
							:class="{ 'single-image': post.images.length === 1 }"
							mode="aspectFill"
							@tap.stop="previewImage(post.images, imgIndex)">
						</image>
						<view v-if="post.images.length > 3" class="more-images">
							<text>+{{ post.images.length - 3 }}</text>
						</view>
					</view>
				</view>

				<!-- 互动区域 -->
				<view class="post-actions">
					<view class="action-item" @tap.stop="toggleLike(post)">
						<uni-icons 
							:type="post.isLiked ? 'heart-filled' : 'heart'" 
							:color="post.isLiked ? '#ff6b6b' : '#999'" 
							size="18">
						</uni-icons>
						<text class="action-text" :class="{ liked: post.isLiked }">{{ post.likeCount || 0 }}</text>
					</view>
					<view class="action-item" @tap.stop="goToDetail(post)">
						<uni-icons type="chatbubble" color="#999" size="18"></uni-icons>
						<text class="action-text">{{ post.commentCount || 0 }}</text>
					</view>
					<view class="action-item" @tap.stop="sharePost(post)">
						<uni-icons type="redo" color="#999" size="18"></uni-icons>
						<text class="action-text">分享</text>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<uni-load-more :status="loadStatus" @clickLoadMore="loadMore"></uni-load-more>
		</view>

		<!-- 发布按钮 -->
		<view class="fab-button" @tap="goToPublish">
			<uni-icons type="plus" color="white" size="24"></uni-icons>
		</view>
	</view>
</template>

<script setup>
	import {
		onMounted,
		reactive,
		ref
	} from 'vue';

	const currentCategory = ref('all');
	const searchKeyword = ref('');
	const loadStatus = ref('more'); // more, loading, noMore

	// 分类数据
	const categoryList = reactive([
		{ id: 'all', name: '全部' },
		{ id: 'tech', name: '技术' },
		{ id: 'life', name: '生活' },
		{ id: 'study', name: '学习' },
		{ id: 'entertainment', name: '娱乐' },
		{ id: 'health', name: '健康' }
	]);

	// 帖子列表数据
	const postList = reactive([
		{
			id: 1,
			username: '技术达人',
			avatar: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=U1',
			createTime: '2小时前',
			categoryName: '技术',
			title: 'Vue 3 Composition API 最佳实践',
			content: '分享一些在实际项目中使用 Vue 3 Composition API 的经验和技巧，希望对大家有帮助。',
			images: [
				'https://via.placeholder.com/200x150/4A90E2/FFFFFF?text=Code1',
				'https://via.placeholder.com/200x150/50C878/FFFFFF?text=Code2'
			],
			likeCount: 24,
			commentCount: 8,
			isLiked: false
		},
		{
			id: 2,
			username: '生活家',
			avatar: 'https://via.placeholder.com/60x60/50C878/FFFFFF?text=U2',
			createTime: '5小时前',
			categoryName: '生活',
			title: '周末的美好时光',
			content: '和朋友一起去公园散步，享受阳光和自然的美好。生活中的小确幸总是让人感到温暖。',
			images: [
				'https://via.placeholder.com/200x150/50C878/FFFFFF?text=Life1'
			],
			likeCount: 15,
			commentCount: 3,
			isLiked: true
		},
		{
			id: 3,
			username: '学习者',
			avatar: 'https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=U3',
			createTime: '1天前',
			categoryName: '学习',
			title: '如何高效学习新技能',
			content: '分享一些学习方法和技巧，包括时间管理、记忆方法等。',
			images: [],
			likeCount: 32,
			commentCount: 12,
			isLiked: false
		},
		{
			id: 4,
			username: '健康专家',
			avatar: 'https://via.placeholder.com/60x60/FFD700/FFFFFF?text=U4',
			createTime: '2天前',
			categoryName: '健康',
			title: '每日运动打卡',
			content: '坚持运动第30天！今天完成了5公里跑步和30分钟力量训练。',
			images: [
				'https://via.placeholder.com/200x150/FFD700/FFFFFF?text=Sport1',
				'https://via.placeholder.com/200x150/FF69B4/FFFFFF?text=Sport2',
				'https://via.placeholder.com/200x150/9370DB/FFFFFF?text=Sport3',
				'https://via.placeholder.com/200x150/32CD32/FFFFFF?text=Sport4'
			],
			likeCount: 18,
			commentCount: 6,
			isLiked: false
		}
	]);

	// 搜索输入
	const onSearchInput = (value) => {
		searchKeyword.value = value;
		// 实际项目中这里应该调用搜索接口
		console.log('搜索关键词:', value);
	};

	// 切换分类
	const switchCategory = (categoryId) => {
		currentCategory.value = categoryId;
		// 实际项目中这里应该根据分类加载数据
		console.log('切换分类:', categoryId);
	};

	// 点赞/取消点赞
	const toggleLike = (post) => {
		post.isLiked = !post.isLiked;
		if (post.isLiked) {
			post.likeCount++;
		} else {
			post.likeCount--;
		}
		// 实际项目中这里应该调用点赞接口
		console.log('点赞操作:', post.id, post.isLiked);
	};

	// 分享帖子
	const sharePost = (post) => {
		uni.showActionSheet({
			itemList: ['分享到微信', '分享到朋友圈', '复制链接'],
			success: (res) => {
				console.log('分享选择:', res.tapIndex, post.id);
				uni.showToast({
					title: '分享功能开发中',
					icon: 'none'
				});
			}
		});
	};

	// 预览图片
	const previewImage = (images, current) => {
		uni.previewImage({
			urls: images,
			current: current
		});
	};

	// 跳转到帖子详情
	const goToDetail = (post) => {
		uni.navigateTo({
			url: `/pages/community/post-detail?id=${post.id}`
		});
	};

	// 跳转到发布页面
	const goToPublish = () => {
		uni.navigateTo({
			url: '/pages/community/publish'
		});
	};

	// 加载更多
	const loadMore = () => {
		if (loadStatus.value === 'loading' || loadStatus.value === 'noMore') {
			return;
		}
		
		loadStatus.value = 'loading';
		
		// 模拟加载数据
		setTimeout(() => {
			// 实际项目中这里应该调用接口加载更多数据
			console.log('加载更多数据');
			loadStatus.value = 'more';
		}, 1500);
	};

	onMounted(() => {
		console.log('社区页面加载完成');
		// 初始化数据加载
	});
</script>

<style scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding-bottom: 120rpx;
	}

	/* 搜索栏样式 */
	.search-bar {
		padding: 20rpx;
		background-color: white;
		border-bottom: 1rpx solid #f0f0f0;
	}

	/* 分类标签样式 */
	.category-tabs {
		background-color: white;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.scroll-tabs {
		white-space: nowrap;
	}

	.tabs-container {
		display: flex;
		padding: 0 20rpx;
	}

	.tab-item {
		flex-shrink: 0;
		padding: 24rpx 32rpx;
		font-size: 28rpx;
		color: #666;
		border-bottom: 4rpx solid transparent;
		transition: all 0.3s;
	}

	.tab-item.active {
		color: #007aff;
		border-bottom-color: #007aff;
		font-weight: bold;
	}

	/* 帖子列表样式 */
	.post-list {
		padding: 20rpx;
	}

	.post-item {
		background-color: white;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	/* 帖子头部样式 */
	.post-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
	}

	.user-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.user-details {
		display: flex;
		flex-direction: column;
	}

	.username {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.post-time {
		font-size: 22rpx;
		color: #999;
	}

	/* 帖子内容样式 */
	.post-content {
		margin-bottom: 24rpx;
	}

	.post-title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
		line-height: 1.4;
		margin-bottom: 12rpx;
		display: block;
	}

	.post-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 20rpx;
		display: block;
	}

	/* 图片展示样式 */
	.post-images {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		position: relative;
	}

	.post-image {
		width: 200rpx;
		height: 150rpx;
		border-radius: 12rpx;
	}

	.post-image.single-image {
		width: 300rpx;
		height: 200rpx;
	}

	.more-images {
		position: absolute;
		top: 0;
		right: 0;
		width: 200rpx;
		height: 150rpx;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 28rpx;
	}

	/* 互动区域样式 */
	.post-actions {
		display: flex;
		align-items: center;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.action-item {
		display: flex;
		align-items: center;
		margin-right: 40rpx;
		padding: 8rpx 0;
	}

	.action-text {
		font-size: 24rpx;
		color: #999;
		margin-left: 8rpx;
	}

	.action-text.liked {
		color: #ff6b6b;
	}

	/* 发布按钮样式 */
	.fab-button {
		position: fixed;
		bottom: 120rpx;
		right: 40rpx;
		width: 100rpx;
		height: 100rpx;
		background-color: #007aff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
		z-index: 999;
	}
</style>