<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="nav-left" @tap="goBack">
				<uni-icons type="arrowleft" size="20" color="#333"></uni-icons>
			</view>
			<view class="nav-title">帖子详情</view>
			<view class="nav-right" @tap="showMoreActions">
				<uni-icons type="more-filled" size="20" color="#333"></uni-icons>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<uni-load-more status="loading" :content-text="{contentdown: '加载中...',contentrefresh: '加载中...',contentnomore: ''}"></uni-load-more>
		</view>

		<!-- 帖子内容 -->
		<scroll-view v-else scroll-y class="scroll-container" :style="{ paddingBottom: bottomHeight + 'px' }">
			<!-- 帖子卡片 -->
			<view class="post-card">
				<!-- 用户信息 -->
				<view class="post-header">
					<image :src="postDetail.user_avatar || '/static/default.png'" class="user-avatar" mode="aspectFill"></image>
					<view class="user-details">
						<view class="username-row">
							<text class="username">{{ postDetail.username }}</text>
							<uni-tag v-if="postDetail.tag && postDetail.tag.length > 0" :text="postDetail.tag[0]" size="mini" type="primary"></uni-tag>
						</view>
						<text class="post-time">{{ formatTime(postDetail.create_time) }}</text>
					</view>
					<button class="follow-btn" type="default" size="mini" plain>关注</button>
				</view>

				<!-- 帖子内容 -->
				<view class="post-content">
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
						<text class="stat-text" :class="{ liked: postDetail.isLiked }">{{ postDetail.like_count || 0 }}</text>
					</view>
					<view class="stat-item">
						<uni-icons type="chatbubble" color="#999" size="20"></uni-icons>
						<text class="stat-text">{{ commentList.length }}</text>
					</view>
					<view class="stat-item" @tap="sharePost">
						<uni-icons type="redo" color="#999" size="20"></uni-icons>
						<text class="stat-text">分享</text>
					</view>
					<view class="stat-item">
						<uni-icons type="star" color="#999" size="20"></uni-icons>
						<text class="stat-text">收藏</text>
					</view>
				</view>
			</view>

			<!-- 评论区 -->
			<view class="comment-section">
				<view class="section-header">
					<text class="section-title">评论 {{ commentList.length > 0 ? `(${commentList.length})` : '' }}</text>
					<view class="sort-btn" @tap="toggleSort">
						<text class="sort-text">{{ sortType === 'hot' ? '最热' : '最新' }}</text>
						<uni-icons type="arrowdown" size="16" color="#999"></uni-icons>
					</view>
				</view>

				<!-- 评论列表 -->
				<view class="comment-list" v-if="commentList.length > 0">
					<view class="comment-item" v-for="comment in commentList" :key="comment._id">
						<image :src="comment.user_avatar || '/static/default.png'" class="comment-avatar" mode="aspectFill"></image>
						<view class="comment-content">
							<view class="comment-header">
								<text class="comment-author">{{ comment.username }}</text>
								<text class="comment-time">{{ formatTime(comment.create_time) }}</text>
							</view>
							<text class="comment-text">{{ comment.content }}</text>
							<view class="comment-actions">
								<view class="action-item" @tap="toggleCommentLike(comment)">
									<uni-icons
										:type="comment.isLiked ? 'heart-filled' : 'heart'"
										:color="comment.isLiked ? '#ff6b6b' : '#999'"
										size="16">
									</uni-icons>
									<text class="action-text">{{ comment.like_count || 0 }}</text>
								</view>
								<view class="action-item" @tap="replyComment(comment)">
									<uni-icons type="chatbubble" color="#999" size="16"></uni-icons>
									<text class="action-text">回复</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view class="empty-state" v-else>
					<image class="empty-image" src="/static/empty-comment.png" mode="aspectFit"></image>
					<text class="empty-text">暂无评论，快来抢沙发吧~</text>
				</view>
			</view>
		</scroll-view>

		<!-- 底部评论输入框 -->
		<view class="comment-bar">
			<view class="input-wrapper">
				<uni-easyinput
					v-model="commentText"
					placeholder="写下你的评论..."
					:clearable="true"
					class="comment-input">
				</uni-easyinput>
				<button class="send-btn" type="primary" size="mini" :disabled="!commentText.trim()" @tap="sendComment">发送</button>
			</view>
		</view>

		<!-- 更多操作弹窗 -->
		<uni-popup ref="morePopup" type="bottom" @change="onPopupChange">
			<view class="action-sheet">
				<view class="action-item" @tap="handleAction('favorite')">
					<uni-icons type="star" size="24" color="#333"></uni-icons>
					<text class="action-text">收藏帖子</text>
				</view>
				<view class="action-item" @tap="handleAction('report')">
					<uni-icons type="info" size="24" color="#333"></uni-icons>
					<text class="action-text">举报帖子</text>
				</view>
				<view class="action-item" @tap="handleAction('copy')">
					<uni-icons type="link" size="24" color="#333"></uni-icons>
					<text class="action-text">复制链接</text>
				</view>
				<view class="action-cancel" @tap="closePopup">取消</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue';

	const loading = ref(true);
	const commentText = ref('');
	const postId = ref('');
	const sortType = ref('newest');
	const bottomHeight = ref(100);
	const morePopup = ref(null);

	// 帖子详情数据
	const postDetail = reactive({
		_id: '',
		content: '',
		images: [],
		username: '',
		user_avatar: '',
		create_time: '',
		like_count: 0,
		comment_count: 0,
		view_count: 0,
		tag: [],
		isLiked: false
	});

	// 评论列表数据
	const commentList = reactive([]);

	// 云对象实例
	let communityObj = null;

	// 初始化云对象
	const initCloudObj = () => {
		try {
			communityObj = uniCloud.importObject('community');
		} catch (error) {
			console.error('云对象初始化失败:', error);
		}
	};

	// 获取帖子详情
	const getPostDetail = async () => {
		if (!communityObj || !postId.value) return;

		try {
			const result = await communityObj.getPostDetail(postId.value);

			if (result.errCode === 0 && result.data) {
				Object.assign(postDetail, {
					_id: result.data._id,
					content: result.data.content,
					images: result.data.images || [],
					username: result.data.username,
					user_avatar: result.data.user_avatar || '',
					create_time: result.data.create_time,
					like_count: result.data.like_count || 0,
					comment_count: result.data.comment_count || 0,
					view_count: result.data.view_count || 0,
					tag: result.data.tag || []
				});

				// 检查点赞状态
				checkLikeStatus();

				// 获取评论列表
				await getCommentList();
			} else {
				uni.showToast({ title: result.errMsg || '帖子加载失败', icon: 'none' });
			}
		} catch (error) {
			console.error('获取帖子详情失败:', error);
			uni.showToast({ title: '网络错误，请重试', icon: 'none' });
		} finally {
			loading.value = false;
		}
	};

	// 获取评论列表
	const getCommentList = async () => {
		if (!communityObj || !postId.value) return;

		try {
			const result = await communityObj.getCommentList({
				post_id: postId.value,
				page: 1,
				pageSize: 50
			});

			if (result.errCode === 0 && result.data) {
				commentList.splice(0, commentList.length, ...result.data);
			}
		} catch (error) {
			console.error('获取评论列表失败:', error);
		}
	};

	// 检查点赞状态
	const checkLikeStatus = async () => {
		// TODO: 从likes表查询当前用户是否点赞
		// 这里暂时使用本地状态
	};

	// 点赞帖子
	const toggleLike = async () => {
		if (!communityObj) return;

		try {
			const result = await communityObj.toggleLike({
				post_id: postId.value
			});

			if (result.errCode === 0) {
				postDetail.isLiked = !postDetail.isLiked;
				if (postDetail.isLiked) {
					postDetail.like_count++;
					uni.showToast({ title: '点赞成功', icon: 'success' });
				} else {
					postDetail.like_count--;
					uni.showToast({ title: '取消点赞', icon: 'none' });
				}
			}
		} catch (error) {
			console.error('点赞失败:', error);
			uni.showToast({ title: '操作失败，请重试', icon: 'none' });
		}
	};

	// 点赞评论
	const toggleCommentLike = async (comment) => {
		// TODO: 实现评论点赞
		comment.isLiked = !comment.isLiked;
		if (comment.isLiked) {
			comment.like_count = (comment.like_count || 0) + 1;
		} else {
			comment.like_count = Math.max(0, (comment.like_count || 0) - 1);
		}
	};

	// 回复评论
	const replyComment = (comment) => {
		commentText.value = `@${comment.username} `;
	};

	// 发送评论
	const sendComment = async () => {
		if (!communityObj || !commentText.value.trim()) {
			return;
		}

		try {
			const result = await communityObj.addComment({
				post_id: postId.value,
				content: commentText.value.trim()
			});

			if (result.errCode === 0) {
				uni.showToast({ title: '评论成功', icon: 'success' });
				commentText.value = '';
				await getCommentList();
			} else {
				uni.showToast({ title: result.errMsg || '评论失败', icon: 'none' });
			}
		} catch (error) {
			console.error('发送评论失败:', error);
			uni.showToast({ title: '网络错误，请重试', icon: 'none' });
		}
	};

	// 分享帖子
	const sharePost = () => {
		uni.showShareMenu({
			withShareTicket: true,
			success: () => {
				uni.showToast({ title: '分享成功', icon: 'success' });
			}
		});
	};

	// 显示更多操作
	const showMoreActions = () => {
		if (morePopup.value) {
			morePopup.value.open();
		}
	};

	// 关闭弹窗
	const closePopup = () => {
		if (morePopup.value) {
			morePopup.value.close();
		}
	};

	// 处理操作
	const handleAction = (action) => {
		closePopup();
		switch (action) {
			case 'favorite':
				uni.showToast({ title: '收藏成功', icon: 'success' });
				break;
			case 'report':
				uni.showToast({ title: '举报功能开发中', icon: 'none' });
				break;
			case 'copy':
				uni.setClipboardData({
					data: `https://你的小程序链接/pages/community/post-detail?id=${postId.value}`,
					success: () => uni.showToast({ title: '链接已复制', icon: 'success' })
				});
				break;
		}
	};

	// 切换排序
	const toggleSort = () => {
		sortType.value = sortType.value === 'hot' ? 'newest' : 'hot';
		// TODO: 重新加载评论列表
	};

	// 弹窗状态变化
	const onPopupChange = (e) => {
		console.log('popup变化:', e.show);
	};

	// 预览图片
	const previewImage = (images, current) => {
		uni.previewImage({
			urls: images,
			current: current
		});
	};

	// 格式化时间
	const formatTime = (time) => {
		if (!time) return '';
		const now = new Date();
		const target = new Date(time);
		const diff = Math.floor((now - target) / 1000);

		if (diff < 60) return '刚刚';
		if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
		if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;

		return target.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	};

	// 返回
	const goBack = () => {
		uni.navigateBack();
	};

	onMounted(() => {
		// 获取帖子ID
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		postId.value = currentPage.options.id || '';

		// 初始化云对象
		initCloudObj();

		// 获取帖子详情
		getPostDetail();

		// 获取系统信息设置底部高度
		const systemInfo = uni.getSystemInfoSync();
		bottomHeight.value = 100 + (systemInfo.safeAreaInsets?.bottom || 0);
	});
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		height: 100vh;
		background: #f5f5f5;
		display: flex;
		flex-direction: column;
	}

	/* 顶部导航栏 */
	.navbar {
		width: 100%;
		height: 44px;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		box-sizing: border-box;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
	}

	.nav-left, .nav-right {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-title {
		font-size: 18px;
		font-weight: 600;
		color: #333;
	}

	/* 加载状态 */
	.loading-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 0;
	}

	/* 滚动容器 */
	.scroll-container {
		flex: 1;
		width: 100%;
	}

	/* 帖子卡片 */
	.post-card {
		background: #fff;
		margin: 12px;
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.post-header {
		display: flex;
		align-items: center;
		margin-bottom: 12px;
	}

	.user-avatar {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		margin-right: 12px;
		background: #f0f0f0;
	}

	.user-details {
		flex: 1;
	}

	.username-row {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
	}

	.username {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		margin-right: 8px;
	}

	.post-time {
		font-size: 12px;
		color: #999;
	}

	.follow-btn {
		margin: 0 !important;
		padding: 4px 16px !important;
		height: 28px !important;
		line-height: 20px !important;
		font-size: 12px !important;
		border-radius: 14px !important;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
		border: none !important;
		color: #fff !important;
	}

	/* 帖子内容 */
	.post-content {
		margin-bottom: 16px;
	}

	.post-text {
		font-size: 15px;
		line-height: 1.6;
		color: #333;
		display: block;
		margin-bottom: 12px;
	}

	.post-images {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}

	.post-image {
		width: 100%;
		height: 0;
		padding-bottom: 100%;
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		background: #f5f5f5;
	}

	.post-image::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	/* 互动统计 */
	.post-stats {
		display: flex;
		align-items: center;
		padding-top: 16px;
		border-top: 1px solid #f0f0f0;
	}

	.stat-item {
		display: flex;
		align-items: center;
		margin-right: 24px;
	}

	.stat-text {
		font-size: 14px;
		color: #999;
		margin-left: 4px;
	}

	.stat-text.liked {
		color: #ff6b6b;
	}

	/* 评论区 */
	.comment-section {
		background: #fff;
		margin: 12px;
		margin-top: 0;
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: #333;
	}

	.sort-btn {
		display: flex;
		align-items: center;
	}

	.sort-text {
		font-size: 14px;
		color: #999;
		margin-right: 4px;
	}

	/* 评论列表 */
	.comment-list {
		margin-top: 16px;
	}

	.comment-item {
		display: flex;
		padding: 16px 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.comment-item:last-child {
		border-bottom: none;
	}

	.comment-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin-right: 12px;
		background: #f0f0f0;
		flex-shrink: 0;
	}

	.comment-content {
		flex: 1;
	}

	.comment-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.comment-author {
		font-size: 14px;
		font-weight: 500;
		color: #333;
	}

	.comment-time {
		font-size: 12px;
		color: #999;
	}

	.comment-text {
		font-size: 15px;
		line-height: 1.5;
		color: #333;
		display: block;
		margin-bottom: 8px;
	}

	.comment-actions {
		display: flex;
		align-items: center;
	}

	.action-item {
		display: flex;
		align-items: center;
		margin-right: 20px;
		opacity: 0.6;
		transition: opacity 0.2s;
	}

	.action-item:active {
		opacity: 1;
	}

	.action-text {
		font-size: 12px;
		color: #999;
		margin-left: 4px;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
	}

	.empty-image {
		width: 160px;
		height: 160px;
		margin-bottom: 16px;
		opacity: 0.6;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
	}

	/* 底部评论输入框 */
	.comment-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 12px 16px;
		box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.comment-input {
		flex: 1;
	}

	.send-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
		border: none !important;
		color: #fff !important;
		padding: 8px 24px !important;
		height: 36px !important;
		line-height: 20px !important;
		border-radius: 18px !important;
		font-size: 14px !important;
	}

	/* 操作弹窗 */
	.action-sheet {
		background: #fff;
		border-radius: 16px 16px 0 0;
		overflow: hidden;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.action-item {
		display: flex;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid #f0f0f0;
		transition: background 0.2s;
	}

	.action-item:active {
		background: #f5f5f5;
	}

	.action-text {
		font-size: 16px;
		color: #333;
		margin-left: 12px;
	}

	.action-cancel {
		padding: 16px;
		text-align: center;
		font-size: 16px;
		color: #ff3b30;
		background: #fff;
		margin-top: 8px;
	}
</style>
