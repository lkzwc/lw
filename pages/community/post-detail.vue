<template>
	<view class="container">
		<!-- 帖子内容 -->
		<view class="post-detail">
			<!-- 用户信息 -->
			<view class="post-header">
				<view class="user-info">
					<image :src="postDetail.avatar" class="user-avatar" mode="aspectFill"></image>
					<view class="user-details">
						<text class="username">{{ postDetail.username }}</text>
						<text class="post-time">{{ postDetail.createTime }}</text>
					</view>
				</view>
				<view class="post-category">
					<uni-tag :text="postDetail.categoryName" type="primary" size="small"></uni-tag>
				</view>
			</view>

			<!-- 帖子标题和内容 -->
			<view class="post-content">
				<text class="post-title">{{ postDetail.title }}</text>
				<text class="post-text">{{ postDetail.content }}</text>
				
				<!-- 图片展示 -->
				<view class="post-images" v-if="postDetail.images && postDetail.images.length > 0">
					<image 
						v-for="(img, index) in postDetail.images" 
						:key="index"
						:src="img" 
						class="post-image"
						mode="aspectFill"
						@tap="previewImage(postDetail.images, index)">
					</image>
				</view>
			</view>

			<!-- 互动统计 -->
			<view class="post-stats">
				<view class="stat-item" @tap="toggleLike">
					<uni-icons 
						:type="postDetail.isLiked ? 'heart-filled' : 'heart'" 
						:color="postDetail.isLiked ? '#ff6b6b' : '#999'" 
						size="20">
					</uni-icons>
					<text class="stat-text" :class="{ liked: postDetail.isLiked }">{{ postDetail.likeCount }}</text>
				</view>
				<view class="stat-item">
					<uni-icons type="chatbubble" color="#999" size="20"></uni-icons>
					<text class="stat-text">{{ commentList.length }}</text>
				</view>
				<view class="stat-item" @tap="sharePost">
					<uni-icons type="redo" color="#999" size="20"></uni-icons>
					<text class="stat-text">分享</text>
				</view>
			</view>
		</view>

		<!-- 评论列表 -->
		<view class="comment-section">
			<view class="section-title">
				<text>评论 ({{ commentList.length }})</text>
			</view>
			
			<view class="comment-list">
				<view v-for="(comment, index) in commentList" :key="comment.id" class="comment-item">
					<image :src="comment.avatar" class="comment-avatar" mode="aspectFill"></image>
					<view class="comment-content">
						<view class="comment-header">
							<text class="comment-username">{{ comment.username }}</text>
							<text class="comment-time">{{ comment.createTime }}</text>
						</view>
						<text class="comment-text">{{ comment.content }}</text>
						
						<!-- 回复列表 -->
						<view v-if="comment.replies && comment.replies.length > 0" class="reply-list">
							<view v-for="(reply, replyIndex) in comment.replies" :key="reply.id" class="reply-item">
								<text class="reply-user">{{ reply.username }}</text>
								<text class="reply-text">: {{ reply.content }}</text>
								<text class="reply-time">{{ reply.createTime }}</text>
							</view>
						</view>
						
						<view class="comment-actions">
							<view class="action-btn" @tap="toggleCommentLike(comment)">
								<uni-icons 
									:type="comment.isLiked ? 'heart-filled' : 'heart'" 
									:color="comment.isLiked ? '#ff6b6b' : '#ccc'" 
									size="14">
								</uni-icons>
								<text class="action-text" :class="{ liked: comment.isLiked }">{{ comment.likeCount || 0 }}</text>
							</view>
							<view class="action-btn" @tap="replyComment(comment)">
								<uni-icons type="chatbubble" color="#ccc" size="14"></uni-icons>
								<text class="action-text">回复</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 评论输入框 -->
		<view class="comment-input-section">
			<view class="input-container">
				<input 
					v-model="commentText" 
					class="comment-input" 
					placeholder="写下你的评论..." 
					:focus="inputFocus"
					@blur="inputFocus = false">
				<button class="send-btn" @tap="sendComment" :disabled="!commentText.trim()">发送</button>
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

	const commentText = ref('');
	const inputFocus = ref(false);
	const postId = ref('');

	// 帖子详情数据
	const postDetail = reactive({
		id: 1,
		username: '技术达人',
		avatar: 'https://via.placeholder.com/60x60/4A90E2/FFFFFF?text=U1',
		createTime: '2小时前',
		categoryName: '技术',
		title: 'Vue 3 Composition API 最佳实践',
		content: '在实际项目开发中，Vue 3 的 Composition API 为我们提供了更灵活的代码组织方式。本文将分享一些在使用过程中总结的最佳实践和经验技巧。\n\n1. 合理使用 ref 和 reactive\n- ref 适用于基本数据类型\n- reactive 适用于对象和数组\n\n2. 组合式函数的抽取\n将相关的逻辑抽取到独立的组合式函数中，提高代码的复用性和可维护性。\n\n3. 生命周期钩子的使用\n在 setup 中使用 onMounted、onUpdated 等钩子函数。',
		images: [
			'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Code1',
			'https://via.placeholder.com/400x300/50C878/FFFFFF?text=Code2'
		],
		likeCount: 24,
		isLiked: false
	});

	// 评论列表数据
	const commentList = reactive([
		{
			id: 1,
			username: '前端小白',
			avatar: 'https://via.placeholder.com/40x40/50C878/FFFFFF?text=C1',
			createTime: '1小时前',
			content: '写得很好，学到了很多！特别是关于组合式函数的部分，之前一直不太理解。',
			likeCount: 3,
			isLiked: false,
			replies: [
				{
					id: 11,
					username: '技术达人',
					content: '谢谢支持！有问题可以随时交流',
					createTime: '30分钟前'
				}
			]
		},
		{
			id: 2,
			username: 'Vue爱好者',
			avatar: 'https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=C2',
			createTime: '45分钟前',
			content: '请问在大型项目中，如何更好地组织这些组合式函数呢？',
			likeCount: 1,
			isLiked: true,
			replies: []
		},
		{
			id: 3,
			username: '代码新手',
			avatar: 'https://via.placeholder.com/40x40/FFD700/FFFFFF?text=C3',
			createTime: '20分钟前',
			content: '收藏了，准备好好学习一下！',
			likeCount: 0,
			isLiked: false,
			replies: []
		}
	]);

	// 点赞帖子
	const toggleLike = () => {
		postDetail.isLiked = !postDetail.isLiked;
		if (postDetail.isLiked) {
			postDetail.likeCount++;
		} else {
			postDetail.likeCount--;
		}
	};

	// 点赞评论
	const toggleCommentLike = (comment) => {
		comment.isLiked = !comment.isLiked;
		if (comment.isLiked) {
			comment.likeCount = (comment.likeCount || 0) + 1;
		} else {
			comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1);
		}
	};

	// 回复评论
	const replyComment = (comment) => {
		commentText.value = `@${comment.username} `;
		inputFocus.value = true;
	};

	// 发送评论
	const sendComment = () => {
		if (!commentText.value.trim()) {
			return;
		}

		const newComment = {
			id: Date.now(),
			username: '当前用户',
			avatar: 'https://via.placeholder.com/40x40/9370DB/FFFFFF?text=ME',
			createTime: '刚刚',
			content: commentText.value.trim(),
			likeCount: 0,
			isLiked: false,
			replies: []
		};

		commentList.unshift(newComment);
		commentText.value = '';
		
		uni.showToast({
			title: '评论成功',
			icon: 'success'
		});
	};

	// 分享帖子
	const sharePost = () => {
		uni.showActionSheet({
			itemList: ['分享到微信', '分享到朋友圈', '复制链接'],
			success: (res) => {
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

	onMounted(() => {
		// 获取帖子ID
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		postId.value = currentPage.options.id || '1';
		
		console.log('帖子详情页加载完成, ID:', postId.value);
		// 实际项目中这里应该根据ID加载帖子详情和评论数据
	});
</script>

<style scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding-bottom: 120rpx;
	}

	/* 帖子详情样式 */
	.post-detail {
		background-color: white;
		padding: 24rpx;
		margin-bottom: 20rpx;
	}

	.post-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
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

	.post-content {
		margin-bottom: 24rpx;
	}

	.post-title {
		font-size: 36rpx;
		color: #333;
		font-weight: bold;
		line-height: 1.4;
		margin-bottom: 20rpx;
		display: block;
	}

	.post-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 24rpx;
		display: block;
		white-space: pre-line;
	}

	.post-images {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.post-image {
		width: 340rpx;
		height: 240rpx;
		border-radius: 12rpx;
	}

	.post-stats {
		display: flex;
		align-items: center;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.stat-item {
		display: flex;
		align-items: center;
		margin-right: 40rpx;
		padding: 8rpx 0;
	}

	.stat-text {
		font-size: 24rpx;
		color: #999;
		margin-left: 8rpx;
	}

	.stat-text.liked {
		color: #ff6b6b;
	}

	/* 评论区域样式 */
	.comment-section {
		background-color: white;
		padding: 24rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 24rpx;
	}

	.comment-list {
		display: flex;
		flex-direction: column;
	}

	.comment-item {
		display: flex;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.comment-item:last-child {
		border-bottom: none;
	}

	.comment-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.comment-content {
		flex: 1;
	}

	.comment-header {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.comment-username {
		font-size: 26rpx;
		color: #333;
		font-weight: bold;
		margin-right: 20rpx;
	}

	.comment-time {
		font-size: 22rpx;
		color: #999;
	}

	.comment-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 16rpx;
		display: block;
	}

	.reply-list {
		background-color: #f8f8f8;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-bottom: 16rpx;
	}

	.reply-item {
		margin-bottom: 8rpx;
		font-size: 24rpx;
		line-height: 1.4;
	}

	.reply-item:last-child {
		margin-bottom: 0;
	}

	.reply-user {
		color: #007aff;
		font-weight: bold;
	}

	.reply-text {
		color: #666;
	}

	.reply-time {
		color: #999;
		margin-left: 20rpx;
	}

	.comment-actions {
		display: flex;
		align-items: center;
	}

	.action-btn {
		display: flex;
		align-items: center;
		margin-right: 32rpx;
		padding: 4rpx 0;
	}

	.action-text {
		font-size: 22rpx;
		color: #999;
		margin-left: 6rpx;
	}

	.action-text.liked {
		color: #ff6b6b;
	}

	/* 评论输入框样式 */
	.comment-input-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: white;
		border-top: 1rpx solid #f0f0f0;
		padding: 20rpx;
		z-index: 999;
	}

	.input-container {
		display: flex;
		align-items: center;
	}

	.comment-input {
		flex: 1;
		height: 60rpx;
		background-color: #f8f8f8;
		border-radius: 30rpx;
		padding: 0 24rpx;
		font-size: 28rpx;
		margin-right: 20rpx;
	}

	.send-btn {
		width: 120rpx;
		height: 60rpx;
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 30rpx;
		font-size: 26rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.send-btn[disabled] {
		background-color: #ccc;
	}
</style>