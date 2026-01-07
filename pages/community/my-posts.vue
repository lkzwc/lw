<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<view class="nav-left" @tap="goBack">
				<t-icon name="chevron-left" size="24px" color="#333"></t-icon>
			</view>
			<view class="nav-title">我的帖子</view>
			<view class="nav-right"></view>
		</view>

		<!-- 筛选标签 -->
		<view class="filter-tabs">
			<t-tabs
				v-model:active="activeTab"
				:space-evenly="true"
				theme="line"
				class="tabs">
				<t-tab-panel value="all" label="全部"></t-tab-panel>
				<t-tab-panel value="published" label="已发布"></t-tab-panel>
				<t-tab-panel value="draft" label="草稿"></t-tab-panel>
			</t-tabs>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<t-loading theme="circular" size="40px" text="加载中..."></t-loading>
		</view>

		<!-- 帖子列表 -->
		<scroll-view v-else scroll-y class="post-list" @scrolltolower="loadMore">
			<view class="post-card" v-for="post in postList" :key="post._id" @tap="goToDetail(post._id)">
				<!-- 帖子封面 -->
				<image
					v-if="post.images && post.images.length > 0"
					:src="post.images[0]"
					class="post-cover"
					mode="aspectFill">
				</image>
				<view v-else class="post-cover placeholder">
					<t-icon name="image" size="48px" color="#ddd"></t-icon>
				</view>

				<!-- 帖子信息 -->
				<view class="post-info">
					<text class="post-title">{{ post.content || '暂无标题' }}</text>
					<view class="post-meta">
						<t-tag
							v-for="tag in (post.tag || []).slice(0, 2)"
							:key="tag"
							size="small"
							variant="light"
							theme="default">
							{{ tag }}
						</t-tag>
					</view>
					<view class="post-stats">
						<text class="stat-item">
							<t-icon name="chat-bubble" size="16px" color="#999"></t-icon>
							{{ post.comment_count || 0 }}
						</text>
						<text class="stat-item">
							<t-icon name="heart" size="16px" color="#999"></t-icon>
							{{ post.like_count || 0 }}
						</text>
						<text class="stat-item">
							<t-icon name="browse" size="16px" color="#999"></t-icon>
							{{ post.view_count || 0 }}
						</text>
						<text class="post-time">{{ formatTime(post.create_time) }}</text>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="post-actions" @tap.stop>
					<t-dropdown>
						<view class="action-btn">
							<t-icon name="more" size="20px" color="#666"></t-icon>
						</view>
						<t-dropdown-menu>
							<t-dropdown-item value="edit" @click="editPost(post)">
								<view class="dropdown-item">
									<t-icon name="edit" size="16px" color="#333"></t-icon>
									<text class="dropdown-text">编辑</text>
								</view>
							</t-dropdown-item>
							<t-dropdown-item value="top" @click="setTop(post)">
								<view class="dropdown-item">
									<t-icon name="pushpin" size="16px" color="#333"></t-icon>
									<text class="dropdown-text">{{ post.is_top ? '取消置顶' : '置顶' }}</text>
								</view>
							</t-dropdown-item>
							<t-dropdown-item value="delete" @click="deletePost(post)">
								<view class="dropdown-item">
									<t-icon name="delete" size="16px" color="#ff4d4f"></t-icon>
									<text class="dropdown-text" style="color: #ff4d4f;">删除</text>
								</view>
							</t-dropdown-item>
						</t-dropdown-menu>
					</t-dropdown>
				</view>
			</view>

			<!-- 空状态 -->
			<t-empty v-if="postList.length === 0 && !loading"
				description="暂无帖子，快去发布吧~"
				:image="https://tdesign.gtimg.com/miniprogram/images/empty.png">
			</t-empty>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore">
				<t-loading theme="circular" size="20px"></t-loading>
				<text class="load-text">加载更多</text>
			</view>

			<!-- 到底提示 -->
			<view class="load-more" v-else-if="postList.length > 0">
				<text class="load-text">已经到底啦</text>
			</view>
		</scroll-view>

		<!-- 底部发布按钮 -->
		<view class="fab-button" @tap="goToPublish">
			<t-button shape="circle" theme="primary" size="large">
				<t-icon name="add" size="24px" color="#fff"></t-icon>
			</t-button>
		</view>

		<!-- 确认删除弹窗 -->
		<t-dialog
			v-model:visible="deleteDialogVisible"
			title="确认删除"
			content="确定要删除这条帖子吗？删除后无法恢复"
			confirm-btn="删除"
			cancel-btn="取消"
			@confirm="confirmDelete">
		</t-dialog>

		<!-- 提示消息 -->
		<t-toast v-model:visible="toastVisible" :content="toastMessage"></t-toast>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted, watch } from 'vue';
	import TIcon from 'tdesign-miniprogram/icon/icon';
	import TButton from 'tdesign-miniprogram/button/button';
	import TTag from 'tdesign-miniprogram/tag/tag';
	import TTabs from 'tdesign-miniprogram/tabs/tabs';
	import TTabPanel from 'tdesign-miniprogram/tab-panel/tab-panel';
	import TLoading from 'tdesign-miniprogram/loading/loading';
	import TEmpty from 'tdesign-miniprogram/empty/empty';
	import TToast from 'tdesign-miniprogram/toast/toast';
	import TDropdown from 'tdesign-miniprogram/dropdown/dropdown';
	import TDropdownMenu from 'tdesign-miniprogram/dropdown-menu/dropdown-menu';
	import TDropdownItem from 'tdesign-miniprogram/dropdown-item/dropdown-item';
	import TDialog from 'tdesign-miniprogram/dialog/dialog';

	const loading = ref(true);
	const activeTab = ref('all');
	const postList = reactive([]);
	const hasMore = ref(true);
	const page = ref(1);
	const pageSize = 10;
	const deleteDialogVisible = ref(false);
	const currentDeletePost = ref(null);
	const toastVisible = ref(false);
	const toastMessage = ref('');

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

	// 获取帖子列表
	const getPostList = async (refresh = false) => {
		if (!communityObj) return;

		if (refresh) {
			page.value = 1;
			hasMore.value = true;
			postList.splice(0, postList.length);
		}

		if (!hasMore.value) return;

		loading.value = true;

		try {
			const db = uniCloud.database();
			let query = db.collection('posts');

			// 筛选条件
			const where = {};

			if (activeTab.value === 'published') {
				where.status = 1;
			} else if (activeTab.value === 'draft') {
				where.status = 0;
			}

			const result = await query.where(where)
				.orderBy('create_time', 'desc')
				.skip((page.value - 1) * pageSize)
				.limit(pageSize)
				.get();

			if (result.data.length > 0) {
				postList.push(...result.data);
				page.value++;

				if (result.data.length < pageSize) {
					hasMore.value = false;
				}
			} else {
				hasMore.value = false;
			}
		} catch (error) {
			console.error('获取帖子列表失败:', error);
			showToast('加载失败，请重试');
		} finally {
			loading.value = false;
		}
	};

	// 加载更多
	const loadMore = () => {
		if (!loading.value && hasMore.value) {
			getPostList();
		}
	};

	// 编辑帖子
	const editPost = (post) => {
		uni.navigateTo({
			url: `/pages/community/publish?id=${post._id}`
		});
	};

	// 置顶帖子
	const setTop = async (post) => {
		try {
			const db = uniCloud.database();
			await db.collection('posts').doc(post._id).update({
				is_top: !post.is_top
			});

			post.is_top = !post.is_top;
			showToast(post.is_top ? '置顶成功' : '取消置顶');
		} catch (error) {
			console.error('置顶失败:', error);
			showToast('操作失败');
		}
	};

	// 删除帖子
	const deletePost = (post) => {
		currentDeletePost.value = post;
		deleteDialogVisible.value = true;
	};

	// 确认删除
	const confirmDelete = async () => {
		if (!communityObj || !currentDeletePost.value) return;

		try {
			const result = await communityObj.deletePost({
				post_id: currentDeletePost.value._id
			});

			if (result.errCode === 0) {
				const index = postList.findIndex(p => p._id === currentDeletePost.value._id);
				if (index > -1) {
					postList.splice(index, 1);
				}
				showToast('删除成功');
			} else {
				showToast(result.errMsg || '删除失败');
			}
		} catch (error) {
			console.error('删除帖子失败:', error);
			showToast('删除失败，请重试');
		} finally {
			deleteDialogVisible.value = false;
			currentDeletePost.value = null;
		}
	};

	// 跳转详情
	const goToDetail = (postId) => {
		uni.navigateTo({
			url: `/pages/community/post-detail?id=${postId}`
		});
	};

	// 跳转发布
	const goToPublish = () => {
		uni.navigateTo({
			url: '/pages/community/publish'
		});
	};

	// 格式化时间
	const formatTime = (time) => {
		if (!time) return '';
		const now = new Date();
		const target = new Date(time);
		const diff = Math.floor((now - target) / 1000);

		if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
		if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;

		return target.toLocaleDateString('zh-CN', {
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

	// 监听标签切换
	watch(activeTab, () => {
		getPostList(true);
	});

	onMounted(() => {
		initCloudObj();
		getPostList(true);
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

	/* 筛选标签 */
	.filter-tabs {
		background-color: #ffffff;
		padding: 0 20rpx;
		position: fixed;
		top: 88rpx;
		left: 0;
		right: 0;
		z-index: 999;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 200rpx 0;
		background-color: #f3f3f3;
		margin-top: 100rpx;
	}

	/* 帖子列表 */
	.post-list {
		flex: 1;
		margin-top: 180rpx;
		margin-bottom: 100rpx;
		height: calc(100vh - 180rpx - 100rpx);
	}

	/* 帖子卡片 */
	.post-card {
		display: flex;
		background-color: #ffffff;
		margin: 20rpx;
		border-radius: 20rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		position: relative;
	}

	.post-cover {
		width: 180rpx;
		height: 180rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
		background-color: #f5f5f5;
	}

	.post-cover.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f8f8f8;
	}

	.post-info {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 180rpx;
	}

	.post-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		margin-bottom: 12rpx;
	}

	.post-meta {
		display: flex;
		gap: 8rpx;
		flex-wrap: wrap;
	}

	.post-stats {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 4rpx;
		font-size: 22rpx;
		color: #999999;
	}

	.post-time {
		font-size: 22rpx;
		color: #999999;
		margin-left: auto;
	}

	/* 操作按钮 */
	.post-actions {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
	}

	.action-btn {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.05);
	}

	/* 下拉菜单项 */
	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 8rpx 0;
	}

	.dropdown-text {
		font-size: 28rpx;
		color: #333333;
	}

	/* 加载更多 */
	.load-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;
		gap: 16rpx;
	}

	.load-text {
		font-size: 24rpx;
		color: #999999;
	}

	/* 浮动按钮 */
	.fab-button {
		position: fixed;
		bottom: calc(40rpx + env(safe-area-inset-bottom));
		right: 40rpx;
		z-index: 999;
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
	}
</style>
