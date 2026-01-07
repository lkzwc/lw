<template>
	<view class="container">
		<!-- 顶部搜索栏 -->
		<view class="search-bar" @tap="goToSearch">
			<uni-search-bar
				placeholder="搜索帖子内容..."
				:focus="false"
				bg-color="#f5f5f5"
				cancel-button="none"
				:readonly="true">
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
						<text class="action-text" :class="{ liked: post.isLiked }">{{ post.like_count || 0 }}</text>
					</view>
					<view class="action-item" @tap.stop="goToDetail(post)">
						<uni-icons type="chatbubble" color="#999" size="18"></uni-icons>
						<text class="action-text">{{ post.comment_count || 0 }}</text>
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
} from 'vue'

const currentCategory = ref('all')
const searchKeyword = ref('')
const loadStatus = ref('more') // more, loading, noMore
const page = ref(1)
const pageSize = 10

// 分类数据
const categoryList = reactive([
	{ id: 'all', name: '全部' },
	{ id: '公告', name: '公告' },
	{ id: '业主', name: '业主' },
	{ id: '举报', name: '举报' },
	{ id: '畅玩', name: '畅玩' },
	{ id: '跳蚤', name: '跳蚤' },
	{ id: '活动', name: '活动' }
])

// 帖子列表数据
const postList = reactive([])

// 加载帖子列表
const loadPostList = async (isRefresh = false) => {
	try {
		if (isRefresh) {
			page.value = 1
			postList.length = 0
		}
		
		loadStatus.value = 'loading'
		
		// 调用云函数
		const communityObj = uniCloud.importObject('community')
		const result = await communityObj.getPostList({
			tag: currentCategory.value === 'all' ? null : currentCategory.value,
			page: page.value,
			pageSize: pageSize
		})
		
		if (result.errCode === 0) {
			const newPosts = result.data.list.map(post => ({
				...post,
				id: post._id,
				isLiked: false, // 后续可以通过查询点赞表获取
				createTime: formatTime(post.create_time)
			}))
			
			if (isRefresh) {
				postList.splice(0, postList.length, ...newPosts)
			} else {
				postList.push(...newPosts)
			}
			
			// 判断是否还有更多数据
			if (result.data.list.length < pageSize) {
				loadStatus.value = 'noMore'
			} else {
				loadStatus.value = 'more'
				page.value++
			}
		} else {
			uni.showToast({
				title: result.errMsg || '加载失败',
				icon: 'none'
			})
			loadStatus.value = 'more'
		}
	} catch (error) {
		uni.showToast({
			title: '加载失败，请重试',
			icon: 'none'
		})
		loadStatus.value = 'more'
	}
}

// 跳转到搜索页面
const goToSearch = () => {
	uni.navigateTo({
		url: '/pages/community/search'
	})
}

// 切换分类
const switchCategory = (categoryId) => {
	currentCategory.value = categoryId
	loadPostList(true) // 刷新数据
}

// 点赞/取消点赞
const toggleLike = async (post) => {
	try {
		const communityObj = uniCloud.importObject('community')
		const result = await communityObj.toggleLike({
			post_id: post.id
		})
		
		if (result.errCode === 0) {
			post.isLiked = result.data.isLiked
			if (result.data.action === 'like') {
				post.like_count++
			} else {
				post.like_count--
			}
		} else {
			uni.showToast({
				title: result.errMsg || '操作失败',
				icon: 'none'
			})
		}
	} catch (error) {
		uni.showToast({
			title: '操作失败，请重试',
			icon: 'none'
		})
	}
}

// 分享帖子
const sharePost = (post) => {
	uni.showActionSheet({
		itemList: ['分享到微信', '分享到朋友圈', '复制链接'],
		success: (res) => {
			uni.showToast({
				title: '分享功能开发中',
				icon: 'none'
			})
		}
	})
}

// 预览图片
const previewImage = (images, current) => {
	uni.previewImage({
		urls: images,
		current: current
	})
}

// 跳转到帖子详情
const goToDetail = (post) => {
	uni.navigateTo({
		url: `/pages/community/post-detail?id=${post.id}`
	})
}

// 跳转到发布页面
const goToPublish = () => {
	// 检查登录状态
	const token = uni.getStorageSync('token')
	if (!token) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		return
	}
	
	uni.navigateTo({
		url: '/pages/community/publish'
	})
}

// 加载更多
const loadMore = () => {
	if (loadStatus.value === 'loading' || loadStatus.value === 'noMore') {
		return
	}
	loadPostList(false)
}

// 时间格式化
const formatTime = (timestamp) => {
	const now = new Date()
	const time = new Date(timestamp)
	const diff = now - time
	
	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour
	
	if (diff < minute) {
		return '刚刚'
	} else if (diff < hour) {
		return Math.floor(diff / minute) + '分钟前'
	} else if (diff < day) {
		return Math.floor(diff / hour) + '小时前'
	} else if (diff < 7 * day) {
		return Math.floor(diff / day) + '天前'
	} else {
		return time.toLocaleDateString()
	}
}

// 下拉刷新
const onPullDownRefresh = () => {
	loadPostList(true).then(() => {
		uni.stopPullDownRefresh()
	})
}

// 触底加载更多
const onReachBottom = () => {
	loadMore()
}

// 页面显示时刷新数据
const onShow = () => {
	loadPostList(true)
}

onMounted(() => {
	loadPostList(true)
})

// 导出页面生命周期方法
defineExpose({
	onPullDownRefresh,
	onReachBottom,
	onShow
})
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