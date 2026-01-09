<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<view class="nav-left" @tap="goBack">
				<uni-icons type="arrowleft" size="20" color="#333"></uni-icons>
			</view>
			<view class="nav-title">我的帖子</view>
			<view class="nav-right"></view>
		</view>

		<!-- 筛选标签 -->
		<view class="filter-tabs">
			<uni-segmented-control
				:current="currentIndex"
				:values="tabList"
				@clickItem="onTabChange"
				styleType="text"
				activeColor="#667eea">
			</uni-segmented-control>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<uni-load-more status="loading" :content-text="{contentdown: '加载中...',contentrefresh: '加载中...',contentnomore: ''}"></uni-load-more>
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
					<uni-icons type="image" size="48" color="#ddd"></uni-icons>
				</view>

				<!-- 帖子信息 -->
				<view class="post-info">
					<text class="post-title">{{ post.content || '暂无标题' }}</text>
					<view class="post-meta">
						<uni-tag
							v-for="tag in (post.tag || []).slice(0, 2)"
							:key="tag"
							text=""
							size="mini"
							type="default">
							{{ tag }}
						</uni-tag>
					</view>
					<view class="post-stats">
						<text class="stat-item">
							<uni-icons type="chatbubble" size="16" color="#999"></uni-icons>
							{{ post.comment_count || 0 }}
						</text>
						<text class="stat-item">
							<uni-icons type="heart" size="16" color="#999"></uni-icons>
							{{ post.like_count || 0 }}
						</text>
						<text class="stat-item">
							<uni-icons type="eye" size="16" color="#999"></uni-icons>
							{{ post.view_count || 0 }}
						</text>
						<text class="post-time">{{ formatTime(post.create_time) }}</text>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="post-actions" @tap.stop>
					<view class="action-btn" @tap="showActions(post)">
						<uni-icons type="more-filled" size="20" color="#666"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="postList.length === 0 && !loading">
				<image class="empty-image" src="/static/empty.png" mode="aspectFit"></image>
				<text class="empty-text">暂无帖子，快去发布吧~</text>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore">
				<uni-load-more status="loading"></uni-load-more>
			</view>

			<!-- 到底提示 -->
			<view class="load-more" v-else-if="postList.length > 0">
				<text class="load-text">已经到底啦</text>
			</view>
		</scroll-view>

		<!-- 底部发布按钮 -->
		<view class="fab-button" @tap="goToPublish">
			<button class="fab-icon" type="primary" size="mini">
				<uni-icons type="plus" size="24" color="#fff"></uni-icons>
			</button>
		</view>

		<!-- 操作菜单 -->
		<uni-popup ref="actionPopup" type="bottom" @change="onPopupChange">
			<view class="action-sheet">
				<view class="action-item" @tap="editPost">
					<uni-icons type="compose" size="24" color="#333"></uni-icons>
					<text class="action-text">编辑</text>
				</view>
				<view class="action-item" @tap="setTop">
					<uni-icons type="up" size="24" color="#333"></uni-icons>
					<text class="action-text">{{ currentPost?.is_top ? '取消置顶' : '置顶' }}</text>
				</view>
				<view class="action-item delete-item" @tap="deletePost">
					<uni-icons type="trash" size="24" color="#ff4d4f"></uni-icons>
					<text class="action-text" style="color: #ff4d4f;">删除</text>
				</view>
				<view class="action-cancel" @tap="closePopup">取消</view>
			</view>
		</uni-popup>

		<!-- 确认删除弹窗 -->
		<uni-popup ref="deletePopup" type="dialog">
			<uni-popup-dialog
				type="warn"
				title="确认删除"
				content="确定要删除这条帖子吗？删除后无法恢复"
				:duration="0"
				:before-close="true"
				@confirm="confirmDelete"
				@close="closeDeleteDialog">
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted, watch } from 'vue';

	const loading = ref(true);
	const currentIndex = ref(0);
	const postList = reactive([]);
	const hasMore = ref(true);
	const page = ref(1);
	const pageSize = 10;
	const actionPopup = ref(null);
	const deletePopup = ref(null);
	const currentPost = ref(null);
	const tabList = ['全部', '已发布', '草稿'];

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

			if (currentIndex.value === 1) {
				where.status = 1;
			} else if (currentIndex.value === 2) {
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
			uni.showToast({ title: '加载失败，请重试', icon: 'none' });
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

	// 切换标签
	const onTabChange = (e) => {
		currentIndex.value = e.currentIndex;
		getPostList(true);
	};

	// 显示操作菜单
	const showActions = (post) => {
		currentPost.value = post;
		if (actionPopup.value) {
			actionPopup.value.open();
		}
	};

	// 关闭弹窗
	const closePopup = () => {
		if (actionPopup.value) {
			actionPopup.value.close();
		}
	};

	// 编辑帖子
	const editPost = () => {
		closePopup();
		if (currentPost.value) {
			uni.navigateTo({
				url: `/pages/community/publish?id=${currentPost.value._id}`
			});
		}
	};

	// 置顶帖子
	const setTop = async () => {
		closePopup();
		if (!currentPost.value) return;

		try {
			const db = uniCloud.database();
			await db.collection('posts').doc(currentPost.value._id).update({
				is_top: !currentPost.value.is_top
			});

			uni.showToast({ title: currentPost.value.is_top ? '取消置顶成功' : '置顶成功', icon: 'success' });
			currentPost.value.is_top = !currentPost.value.is_top;
		} catch (error) {
			console.error('置顶失败:', error);
			uni.showToast({ title: '操作失败，请重试', icon: 'none' });
		}
	};

	// 删除帖子
	const deletePost = () => {
		closePopup();
		if (deletePopup.value) {
			deletePopup.value.open();
		}
	};

	// 关闭删除弹窗
	const closeDeleteDialog = () => {
		if (deletePopup.value) {
			deletePopup.value.close();
		}
	};

	// 确认删除
	const confirmDelete = async () => {
		if (!currentPost.value || !communityObj) return;

		try {
			const result = await communityObj.deletePost(currentPost.value._id);

			if (result.errCode === 0) {
				uni.showToast({ title: '删除成功', icon: 'success' });
				const index = postList.findIndex(p => p._id === currentPost.value._id);
				if (index !== -1) {
					postList.splice(index, 1);
				}
			} else {
				uni.showToast({ title: result.errMsg || '删除失败', icon: 'none' });
			}
		} catch (error) {
			console.error('删除帖子失败:', error);
			uni.showToast({ title: '删除失败，请重试', icon: 'none' });
		}

		closeDeleteDialog();
	};

	// 跳转到详情
	const goToDetail = (id) => {
		uni.navigateTo({
			url: `/pages/community/post-detail?id=${id}`
		});
	};

	// 跳转到发布
	const goToPublish = () => {
		uni.navigateTo({
			url: '/pages/community/publish'
		});
	};

	// 弹窗状态变化
	const onPopupChange = (e) => {
		console.log('popup变化:', e.show);
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
		// 初始化云对象
		initCloudObj();

		// 获取帖子列表
		getPostList();
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

	/* 顶部导航 */
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

	/* 筛选标签 */
	.filter-tabs {
		background: #fff;
		padding: 12px 16px;
		border-bottom: 1px solid #f0f0f0;
	}

	/* 加载状态 */
	.loading-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 0;
	}

	/* 帖子列表 */
	.post-list {
		flex: 1;
		padding: 12px;
	}

	.post-card {
		display: flex;
		background: #fff;
		border-radius: 12px;
		padding: 12px;
		margin-bottom: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		position: relative;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.post-card:active {
		transform: scale(0.98);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
	}

	.post-cover {
		width: 100px;
		height: 100px;
		border-radius: 8px;
		margin-right: 12px;
		flex-shrink: 0;
		background: #f5f5f5;
	}

	.post-cover.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fafafa;
	}

	.post-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0;
	}

	.post-title {
		font-size: 15px;
		line-height: 1.4;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		margin-bottom: 8px;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
	}

	.post-stats {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
	}

	.stat-item {
		display: flex;
		align-items: center;
		font-size: 12px;
		color: #999;
	}

	.post-time {
		font-size: 12px;
		color: #999;
	}

	.post-actions {
		position: absolute;
		top: 12px;
		right: 12px;
	}

	.action-btn {
		padding: 4px;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 20px;
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

	/* 加载更多 */
	.load-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px 0;
	}

	.load-text {
		font-size: 13px;
		color: #999;
	}

	/* 底部发布按钮 */
	.fab-button {
		position: fixed;
		bottom: 40px;
		right: 20px;
		z-index: 100;
	}

	.fab-icon {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none !important;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
		transition: transform 0.2s;
	}

	.fab-icon:active {
		transform: scale(0.9);
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

	.action-item.delete-item:active {
		background: #fff1f0;
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
		color: #333;
		background: #fff;
		margin-top: 8px;
	}
</style>
