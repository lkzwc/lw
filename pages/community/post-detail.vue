<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="nav-left" @tap="goBack">
				<t-icon name="chevron-left" size="24px" color="#333"></t-icon>
			</view>
			<view class="nav-title">帖子详情</view>
			<view class="nav-right" @tap="showMoreActions">
				<t-icon name="more" size="24px" color="#333"></t-icon>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<t-loading theme="circular" size="40px" text="加载中..."></t-loading>
		</view>

		<!-- 帖子内容 -->
		<scroll-view v-else scroll-y class="scroll-container" :style="{ paddingBottom: bottomHeight + 'px' }">
			<!-- 帖子卡片 -->
			<view class="post-card">
				<!-- 用户信息 -->
				<view class="post-header">
					<t-avatar :image="postDetail.user_avatar" size="large"></t-avatar>
					<view class="user-details">
						<view class="username-row">
							<text class="username">{{ postDetail.username }}</text>
							<t-tag theme="primary" size="small" variant="light" v-if="postDetail.tag && postDetail.tag.length > 0">
								{{ postDetail.tag[0] }}
							</t-tag>
						</view>
						<text class="post-time">{{ formatTime(postDetail.create_time) }}</text>
					</view>
					<t-button size="small" variant="outline" theme="default">关注</t-button>
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
						<t-icon
							:name="postDetail.isLiked ? 'heart-filled' : 'heart'"
							:color="postDetail.isLiked ? '#ff6b6b' : '#999'"
							size="20px">
						</t-icon>
						<text class="stat-text" :class="{ liked: postDetail.isLiked }">{{ postDetail.like_count || 0 }}</text>
					</view>
					<view class="stat-item">
						<t-icon name="chat-bubble" color="#999" size="20px"></t-icon>
						<text class="stat-text">{{ commentList.length }}</text>
					</view>
					<view class="stat-item" @tap="sharePost">
						<t-icon name="share" color="#999" size="20px"></t-icon>
						<text class="stat-text">分享</text>
					</view>
					<view class="stat-item">
						<t-icon name="star" color="#999" size="20px"></t-icon>
						<text class="stat-text">收藏</text>
					</view>
				</view>
			</view>

			<!-- 评论区 -->
			<view class="comment-section">
				<view class="section-header">
					<text class="section-title">评论 {{ commentList.length > 0 ? `(${commentList.length})` : '' }}</text>
					<t-dropdown>
						<t-dropdown-item value="hot">
							<view class="sort-btn">
								<text class="sort-text">{{ sortType === 'hot' ? '最热' : '最新' }}</text>
								<t-icon name="chevron-down" size="16px"></t-icon>
							</view>
						</t-dropdown-item>
					</t-dropdown>
				</view>

				<!-- 评论列表 -->
				<view class="comment-list" v-if="commentList.length > 0">
					<t-comment
						v-for="comment in commentList"
						:key="comment._id"
						:avatar="comment.user_avatar"
						:author="comment.username"
						:content="comment.content"
						:datetime="formatTime(comment.create_time)"
						:reply="comment.replies"
						@like="toggleCommentLike(comment)">
						<template #actions>
							<view class="comment-actions">
								<view class="action-item" @tap="toggleCommentLike(comment)">
									<t-icon
										:name="comment.isLiked ? 'heart-filled' : 'heart'"
										:color="comment.isLiked ? '#ff6b6b' : '#999'"
										size="16px">
									</t-icon>
									<text class="action-text">{{ comment.like_count || 0 }}</text>
								</view>
								<view class="action-item" @tap="replyComment(comment)">
									<t-icon name="chat-bubble" color="#999" size="16px"></t-icon>
									<text class="action-text">回复</text>
								</view>
							</view>
						</template>
					</t-comment>
				</view>

				<!-- 空状态 -->
				<t-empty v-else description="暂无评论，快来抢沙发吧~"></t-empty>
			</view>
		</scroll-view>

		<!-- 底部评论输入框 -->
		<view class="comment-bar">
			<view class="input-wrapper">
				<t-input
					v-model="commentText"
					placeholder="写下你的评论..."
					:clearable="true"
					class="comment-input">
				</t-input>
				<t-button
					theme="primary"
					size="medium"
					:disabled="!commentText.trim()"
					@tap="sendComment">
					发送
				</t-button>
			</view>
		</view>

		<!-- 更多操作弹窗 -->
		<t-action-sheet
			v-model:visible="moreActionsVisible"
			:items="moreActionItems"
			@select="handleMoreAction">
		</t-action-sheet>

		<!-- 提示消息 -->
		<t-toast v-model:visible="toastVisible" :content="toastMessage"></t-toast>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted, computed } from 'vue';
	import TIcon from 'tdesign-miniprogram/icon/icon';
	import TAvatar from 'tdesign-miniprogram/avatar/avatar';
	import TButton from 'tdesign-miniprogram/button/button';
	import TTag from 'tdesign-miniprogram/tag/tag';
	import TLoading from 'tdesign-miniprogram/loading/loading';
	import TComment from 'tdesign-miniprogram/comment/comment';
	import TEmpty from 'tdesign-miniprogram/empty/empty';
	import TInput from 'tdesign-miniprogram/input/input';
	import TToast from 'tdesign-miniprogram/toast/toast';
	import TActionSheet from 'tdesign-miniprogram/action-sheet/action-sheet';
	import TDropdown from 'tdesign-miniprogram/dropdown/dropdown';
	import TDropdownItem from 'tdesign-miniprogram/dropdown/dropdown-item';

	const loading = ref(true);
	const commentText = ref('');
	const postId = ref('');
	const moreActionsVisible = ref(false);
	const toastVisible = ref(false);
	const toastMessage = ref('');
	const sortType = ref('newest');
	const bottomHeight = ref(100);

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

	// 更多操作菜单
	const moreActionItems = [
		{ label: '收藏帖子', value: 'favorite' },
		{ label: '举报帖子', value: 'report' },
		{ label: '复制链接', value: 'copy' }
	];

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
				showToast(result.errMsg || '帖子加载失败');
			}
		} catch (error) {
			console.error('获取帖子详情失败:', error);
			showToast('网络错误，请重试');
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
				} else {
					postDetail.like_count--;
				}
			}
		} catch (error) {
			console.error('点赞失败:', error);
			showToast('操作失败，请重试');
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
				showToast('评论成功');
				commentText.value = '';
				await getCommentList();
			} else {
				showToast(result.errMsg || '评论失败');
			}
		} catch (error) {
			console.error('发送评论失败:', error);
			showToast('网络错误，请重试');
		}
	};

	// 分享帖子
	const sharePost = () => {
		uni.showShareMenu({
			withShareTicket: true,
			success: () => {
				showToast('分享成功');
			}
		});
	};

	// 显示更多操作
	const showMoreActions = () => {
		moreActionsVisible.value = true;
	};

	// 处理更多操作
	const handleMoreAction = (e) => {
		const action = e.value;
		moreActionsVisible.value = false;

		switch (action) {
			case 'favorite':
				showToast('收藏成功');
				break;
			case 'report':
				showToast('举报功能开发中');
				break;
			case 'copy':
				uni.setClipboardData({
					data: `https://你的小程序链接/pages/community/post-detail?id=${postId.value}`,
					success: () => showToast('链接已复制')
				});
				break;
		}
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

	// 显示提示
	const showToast = (message) => {
		toastMessage.value = message;
		toastVisible.value = true;
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
		background-color: #f3f3f3;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 导航栏样式 */
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20rpx 30rpx;
		height: 88rpx;
		box-shadow: 0 2rpx 12rpx rgba(102, 126, 234, 0.15);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
	}

	.nav-left,
	.nav-right {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #ffffff;
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 200rpx 0;
		background-color: #f3f3f3;
	}

	/* 滚动容器 */
	.scroll-container {
		flex: 1;
		overflow-y: auto;
		padding-top: 108rpx;
	}

	/* 帖子卡片样式 */
	.post-card {
		background-color: #ffffff;
		margin: 20rpx;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.post-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.user-details {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.username-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.username {
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
	}

	.post-time {
		font-size: 22rpx;
		color: #999999;
	}

	/* 帖子内容 */
	.post-content {
		margin-bottom: 24rpx;
	}

	.post-text {
		font-size: 28rpx;
		line-height: 1.8;
		color: #333333;
		margin-bottom: 20rpx;
		display: block;
		white-space: pre-line;
	}

	.post-images {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.post-image {
		width: 220rpx;
		height: 220rpx;
		border-radius: 12rpx;
	}

	/* 互动统计 */
	.post-stats {
		display: flex;
		align-items: center;
		padding-top: 24rpx;
		border-top: 1rpx solid #f0f0f0;
		gap: 40rpx;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 0;
	}

	.stat-text {
		font-size: 26rpx;
		color: #999999;
	}

	.stat-text.liked {
		color: #ff6b6b;
	}

	/* 评论区样式 */
	.comment-section {
		background-color: #ffffff;
		margin: 0 20rpx 20rpx;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
	}

	.sort-btn {
		display: flex;
		align-items: center;
		gap: 4rpx;
	}

	.sort-text {
		font-size: 26rpx;
		color: #666666;
	}

	/* 底部评论栏 */
	.comment-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #ffffff;
		border-top: 1rpx solid #f0f0f0;
		padding: 20rpx 30rpx;
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
		z-index: 999;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.comment-input {
		flex: 1;
	}

	/* 评论操作 */
	.comment-actions {
		display: flex;
		align-items: center;
		gap: 32rpx;
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.action-text {
		font-size: 24rpx;
		color: #999999;
	}
</style>
