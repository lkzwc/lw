<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input-wrapper">
				<t-icon name="search" size="20px" color="#999" class="search-icon"></t-icon>
				<t-input
					v-model="searchKeyword"
					placeholder="搜索帖子、用户、技能"
					:clearable="true"
					@confirm="handleSearch"
					@clear="handleClear"
					class="search-input">
				</t-input>
			</view>
			<view class="search-btn" @tap="handleSearch">
				<text class="search-text">搜索</text>
			</view>
		</view>

		<!-- 搜索历史 -->
		<view class="search-history" v-if="!hasSearched && searchHistory.length > 0">
			<view class="history-header">
				<text class="history-title">搜索历史</text>
				<text class="history-clear" @tap="clearHistory">清除</text>
			</view>
			<view class="history-tags">
				<t-tag
					v-for="(keyword, index) in searchHistory"
					:key="index"
					variant="light"
					theme="default"
					shape="round"
					@tap="searchFromHistory(keyword)">
					{{ keyword }}
				</t-tag>
			</view>
		</view>

		<!-- 搜索结果 -->
		<view class="search-results" v-if="hasSearched">
			<!-- 筛选标签 -->
			<view class="filter-tabs">
				<t-tabs v-model:active="activeTab" :space-evenly="true" theme="line">
					<t-tab-panel value="all" label="全部"></t-tab-panel>
					<t-tab-panel value="posts" label="帖子"></t-tab-panel>
					<t-tab-panel value="skills" label="技能"></t-tab-panel>
					<t-tab-panel value="users" label="用户"></t-tab-panel>
				</t-tabs>
			</view>

			<!-- 加载状态 -->
			<view class="loading-container" v-if="loading">
				<t-loading theme="circular" size="40px" text="搜索中..."></t-loading>
			</view>

			<!-- 帖子结果 -->
			<view class="result-section" v-if="activeTab === 'all' || activeTab === 'posts'">
				<view class="section-header">
					<text class="section-title">帖子 ({{ postResults.length }})</text>
				</view>
				<view class="result-list">
					<view
						class="result-card post-card"
						v-for="post in postResults"
						:key="post._id"
						@tap="goToPostDetail(post._id)">
						<image
							v-if="post.images && post.images.length > 0"
							:src="post.images[0]"
							class="result-image"
							mode="aspectFill">
						</image>
						<view class="result-content">
							<text class="result-title">{{ post.content || '暂无内容' }}</text>
							<view class="result-meta">
								<t-tag size="small" variant="light" theme="primary">
									{{ (post.tag || ['全部'])[0] }}
								</t-tag>
								<text class="result-stats">
									<t-icon name="chat-bubble" size="14px"></t-icon>
									{{ post.comment_count || 0 }}
								</text>
								<text class="result-stats">
									<t-icon name="heart" size="14px"></t-icon>
									{{ post.like_count || 0 }}
								</text>
							</view>
						</view>
					</view>
				</view>
				<t-empty v-if="postResults.length === 0 && !loading"
					description="没有找到相关帖子"
					image="https://tdesign.gtimg.com/miniprogram/images/empty.png">
				</t-empty>
			</view>

			<!-- 技能结果 -->
			<view class="result-section" v-if="activeTab === 'all' || activeTab === 'skills'">
				<view class="section-header">
					<text class="section-title">技能 ({{ skillResults.length }})</text>
				</view>
				<view class="result-list">
					<view
						class="result-card skill-card"
						v-for="skill in skillResults"
						:key="skill._id"
						@tap="goToSkillDetail(skill._id)">
						<image
							v-if="skill.images && skill.images.length > 0"
							:src="skill.images[0]"
							class="result-image"
							mode="aspectFill">
						</image>
						<view class="result-content">
							<text class="result-title">{{ skill.title }}</text>
							<text class="result-desc">{{ skill.description }}</text>
							<view class="result-meta">
								<t-tag size="small" variant="light" theme="primary">
									{{ skill.category }}
								</t-tag>
								<text class="result-stats">
									<t-icon name="money-circle" size="14px"></t-icon>
									{{ skill.price }}{{ skill.price_unit || '/次' }}
								</text>
							</view>
						</view>
					</view>
				</view>
				<t-empty v-if="skillResults.length === 0 && !loading"
					description="没有找到相关技能"
					image="https://tdesign.gtimg.com/miniprogram/images/empty.png">
				</t-empty>
			</view>

			<!-- 用户结果 -->
			<view class="result-section" v-if="activeTab === 'all' || activeTab === 'users'">
				<view class="section-header">
					<text class="section-title">用户 ({{ userResults.length }})</text>
				</view>
				<view class="user-list">
					<view
						class="user-card"
						v-for="user in userResults"
						:key="user._id"
						@tap="goToUserProfile(user._id)">
						<t-avatar :image="user.avatar" size="large"></t-avatar>
						<view class="user-info">
							<text class="user-name">{{ user.nickname }}</text>
							<text class="user-building">{{ user.building || '' }}</text>
						</view>
					</view>
				</view>
				<t-empty v-if="userResults.length === 0 && !loading"
					description="没有找到相关用户"
					image="https://tdesign.gtimg.com/miniprogram/images/empty.png">
				</t-empty>
			</view>

			<!-- 空状态 -->
			<t-empty v-if="postResults.length === 0 && skillResults.length === 0 && userResults.length === 0 && !loading"
				description="没有找到任何相关内容"
				image="https://tdesign.gtimg.com/miniprogram/images/empty.png">
			</t-empty>
		</view>

		<!-- 热门推荐 -->
		<view class="hot-recommend" v-if="!hasSearched && searchHistory.length === 0">
			<view class="recommend-header">
				<t-icon name="fire" size="20px" color="#ff6b6b"></t-icon>
				<text class="recommend-title">热门搜索</text>
			</view>
			<view class="hot-tags">
				<view class="hot-tag" v-for="(hot, index) in hotSearches" :key="index" @tap="searchHot(hot)">
					<text class="hot-rank">{{ index + 1 }}</text>
					<text class="hot-text">{{ hot }}</text>
				</view>
			</view>
		</view>

		<!-- 提示消息 -->
		<t-toast v-model:visible="toastVisible" :content="toastMessage"></t-toast>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue';
	import TIcon from 'tdesign-miniprogram/icon/icon';
	import TInput from 'tdesign-miniprogram/input/input';
	import TTag from 'tdesign-miniprogram/tag/tag';
	import TTabs from 'tdesign-miniprogram/tabs/tabs';
	import TTabPanel from 'tdesign-miniprogram/tab-panel/tab-panel';
	import TLoading from 'tdesign-miniprogram/loading/loading';
	import TEmpty from 'tdesign-miniprogram/empty/empty';
	import TToast from 'tdesign-miniprogram/toast/toast';
	import TAvatar from 'tdesign-miniprogram/avatar/avatar';

	const searchKeyword = ref('');
	const activeTab = ref('all');
	const loading = ref(false);
	const hasSearched = ref(false);
	const toastVisible = ref(false);
	const toastMessage = ref('');

	// 搜索历史
	const searchHistory = reactive([]);

	// 搜索结果
	const postResults = reactive([]);
	const skillResults = reactive([]);
	const userResults = reactive([]);

	// 热门搜索
	const hotSearches = [
		'家政服务',
		'维修服务',
		'教育培训',
		'技能交换',
		'社区活动',
		'邻里互助'
	];

	// 云对象实例
	let communityObj = null;
	let skillsObj = null;

	// 初始化云对象
	const initCloudObj = () => {
		try {
			communityObj = uniCloud.importObject('community');
			skillsObj = uniCloud.importObject('skills');
		} catch (error) {
			console.error('云对象初始化失败:', error);
		}
	};

	// 执行搜索
	const handleSearch = async () => {
		const keyword = searchKeyword.value.trim();
		if (!keyword) {
			showToast('请输入搜索关键词');
			return;
		}

		loading.value = true;
		hasSearched.value = true;

		try {
			// 搜索帖子
			const postResult = await communityObj.getPostList({});
			if (postResult.errCode === 0 && postResult.data) {
				const filteredPosts = postResult.data.list.filter(post =>
					post.content?.includes(keyword) ||
					(post.tag || []).some(tag => tag.includes(keyword))
				);
				postResults.splice(0, postResults.length, ...filteredPosts);
			}

			// 搜索技能
			const skillResult = await skillsObj.getSkillsList({});
			if (skillResult.errCode === 0 && skillResult.data) {
				const filteredSkills = skillResult.data.list.filter(skill =>
					skill.title?.includes(keyword) ||
					skill.description?.includes(keyword) ||
					skill.category?.includes(keyword)
				);
				skillResults.splice(0, skillResults.length, ...filteredSkills);
			}

			// 搜索用户（从数据库直接查询）
			const db = uniCloud.database();
			const userResult = await db.collection('users')
				.where({
					nickname: db.command.contains(keyword)
				})
				.limit(10)
				.get();
			if (userResult.data.length > 0) {
				userResults.splice(0, userResults.length, ...userResult.data);
			}

			// 保存搜索历史
			saveSearchHistory(keyword);

		} catch (error) {
			console.error('搜索失败:', error);
			showToast('搜索失败，请重试');
		} finally {
			loading.value = false;
		}
	};

	// 清除搜索
	const handleClear = () => {
		searchKeyword.value = '';
		hasSearched.value = false;
		postResults.splice(0, postResults.length);
		skillResults.splice(0, skillResults.length);
		userResults.splice(0, userResults.length);
	};

	// 从历史搜索
	const searchFromHistory = (keyword) => {
		searchKeyword.value = keyword;
		handleSearch();
	};

	// 热门搜索
	const searchHot = (hot) => {
		searchKeyword.value = hot;
		handleSearch();
	};

	// 保存搜索历史
	const saveSearchHistory = (keyword) => {
		const index = searchHistory.indexOf(keyword);
		if (index > -1) {
			searchHistory.splice(index, 1);
		}
		searchHistory.unshift(keyword);

		// 最多保存10条历史
		if (searchHistory.length > 10) {
			searchHistory.length = 10;
		}

		uni.setStorageSync('searchHistory', searchHistory);
	};

	// 清除历史
	const clearHistory = () => {
		searchHistory.splice(0, searchHistory.length);
		uni.removeStorageSync('searchHistory');
		showToast('搜索历史已清除');
	};

	// 加载搜索历史
	const loadSearchHistory = () => {
		try {
			const history = uni.getStorageSync('searchHistory');
			if (history && Array.isArray(history)) {
				searchHistory.push(...history);
			}
		} catch (error) {
			console.error('加载搜索历史失败:', error);
		}
	};

	// 跳转帖子详情
	const goToPostDetail = (postId) => {
		uni.navigateTo({
			url: `/pages/community/post-detail?id=${postId}`
		});
	};

	// 跳转技能详情
	const goToSkillDetail = (skillId) => {
		uni.navigateTo({
			url: `/pages/skills/skill-detail?id=${skillId}`
		});
	};

	// 跳转用户资料
	const goToUserProfile = (userId) => {
		showToast('用户资料功能开发中');
	};

	// 显示提示
	const showToast = (message) => {
		toastMessage.value = message;
		toastVisible.value = true;
	};

	onMounted(() => {
		initCloudObj();
		loadSearchHistory();
	});
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f3f3f3;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 搜索栏 */
	.search-bar {
		display: flex;
		align-items: center;
		background-color: #ffffff;
		padding: 20rpx 30rpx;
		gap: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.search-input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		border-radius: 30rpx;
		padding: 0 24rpx;
		height: 70rpx;
	}

	.search-icon {
		margin-right: 12rpx;
	}

	.search-input {
		flex: 1;
	}

	.search-btn {
		padding: 0 30rpx;
		height: 70rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 35rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: 600;
	}

	/* 搜索历史 */
	.search-history {
		background-color: #ffffff;
		margin: 20rpx;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.history-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.history-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
	}

	.history-clear {
		font-size: 24rpx;
		color: #999999;
	}

	.history-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	/* 搜索结果 */
	.search-results {
		flex: 1;
		overflow-y: auto;
	}

	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 200rpx 0;
		background-color: #f3f3f3;
	}

	/* 筛选标签 */
	.filter-tabs {
		background-color: #ffffff;
		padding: 0 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	}

	/* 结果区域 */
	.result-section {
		margin: 20rpx;
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.section-header {
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333333;
	}

	/* 帖子卡片 */
	.result-card {
		display: flex;
		background-color: #f8f8f8;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		transition: all 0.3s;
	}

	.result-card:active {
		transform: scale(0.98);
		background-color: #f0f0f0;
	}

	.result-card:last-child {
		margin-bottom: 0;
	}

	.result-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
		background-color: #f5f5f5;
	}

	.result-content {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 160rpx;
	}

	.result-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
		line-height: 1.4;
		margin-bottom: 12rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.result-desc {
		font-size: 24rpx;
		color: #666666;
		line-height: 1.4;
		margin-bottom: 12rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.result-meta {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.result-stats {
		display: flex;
		align-items: center;
		gap: 4rpx;
		font-size: 22rpx;
		color: #999999;
	}

	/* 用户列表 */
	.user-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.user-card {
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		border-radius: 16rpx;
		padding: 20rpx;
		transition: all 0.3s;
	}

	.user-card:active {
		transform: scale(0.98);
		background-color: #f0f0f0;
	}

	.user-info {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.user-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
	}

	.user-building {
		font-size: 24rpx;
		color: #999999;
	}

	/* 热门推荐 */
	.hot-recommend {
		background-color: #ffffff;
		margin: 20rpx;
		border-radius: 20rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.recommend-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 24rpx;
	}

	.recommend-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333333;
	}

	.hot-tags {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.hot-tag {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 16rpx 24rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
		transition: all 0.3s;
	}

	.hot-tag:active {
		background-color: #f0f0f0;
	}

	.hot-rank {
		width: 32rpx;
		height: 32rpx;
		background: linear-gradient(135deg, #ff6b6b 0%, #ffa600 100%);
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		font-weight: 700;
		color: #ffffff;
	}

	.hot-text {
		font-size: 28rpx;
		color: #333333;
	}
</style>
