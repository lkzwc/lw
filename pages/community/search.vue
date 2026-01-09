<template>
	<view class="container">
		<!-- 搜索栏 -->
		<view class="search-bar">
			<view class="search-input-wrapper">
				<uni-icons type="search" size="20" color="#999" class="search-icon"></uni-icons>
				<uni-easyinput
					v-model="searchKeyword"
					placeholder="搜索帖子、用户、技能"
					:clearable="true"
					@confirm="handleSearch"
					@clear="handleClear"
					class="search-input">
				</uni-easyinput>
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
				<view
					class="history-tag"
					v-for="(keyword, index) in searchHistory"
					:key="index"
					@tap="searchFromHistory(keyword)">
					{{ keyword }}
				</view>
			</view>
		</view>

		<!-- 搜索结果 -->
		<scroll-view scroll-y class="search-results" v-if="hasSearched">
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
				<uni-load-more status="loading" :content-text="{contentdown: '搜索中...',contentrefresh: '搜索中...',contentnomore: ''}"></uni-load-more>
			</view>

			<!-- 帖子结果 -->
			<view class="result-section" v-if="currentIndex === 0 || currentIndex === 1">
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
								<uni-tag :text="(post.tag || ['全部'])[0]" size="mini" type="primary"></uni-tag>
								<view class="result-stats">
									<uni-icons type="chatbubble" size="14"></uni-icons>
									{{ post.comment_count || 0 }}
								</view>
								<view class="result-stats">
									<uni-icons type="heart" size="14"></uni-icons>
									{{ post.like_count || 0 }}
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="empty-state" v-if="postResults.length === 0 && !loading">
					<image class="empty-image" src="/static/empty.png" mode="aspectFit"></image>
					<text class="empty-text">没有找到相关帖子</text>
				</view>
			</view>

			<!-- 技能结果 -->
			<view class="result-section" v-if="currentIndex === 0 || currentIndex === 2">
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
								<uni-tag :text="skill.category" size="mini" type="primary"></uni-tag>
								<view class="result-stats">
									<uni-icons type="wallet" size="14"></uni-icons>
									{{ skill.price }}{{ skill.price_unit || '/次' }}
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="empty-state" v-if="skillResults.length === 0 && !loading">
					<image class="empty-image" src="/static/empty.png" mode="aspectFit"></image>
					<text class="empty-text">没有找到相关技能</text>
				</view>
			</view>

			<!-- 用户结果 -->
			<view class="result-section" v-if="currentIndex === 0 || currentIndex === 3">
				<view class="section-header">
					<text class="section-title">用户 ({{ userResults.length }})</text>
				</view>
				<view class="user-list">
					<view
						class="user-card"
						v-for="user in userResults"
						:key="user._id"
						@tap="goToUserProfile(user._id)">
						<image :src="user.avatar || '/static/default.png'" class="user-avatar" mode="aspectFill"></image>
						<view class="user-info">
							<text class="user-name">{{ user.nickname }}</text>
							<text class="user-building">{{ user.building || '' }}</text>
						</view>
					</view>
				</view>
				<view class="empty-state" v-if="userResults.length === 0 && !loading">
					<image class="empty-image" src="/static/empty.png" mode="aspectFit"></image>
					<text class="empty-text">没有找到相关用户</text>
				</view>
			</view>

			<!-- 全部空状态 -->
			<view class="empty-state" v-if="postResults.length === 0 && skillResults.length === 0 && userResults.length === 0 && !loading">
				<image class="empty-image" src="/static/empty.png" mode="aspectFit"></image>
				<text class="empty-text">没有找到任何相关内容</text>
			</view>
		</scroll-view>

		<!-- 热门推荐 -->
		<view class="hot-recommend" v-if="!hasSearched && searchHistory.length === 0">
			<view class="recommend-header">
				<uni-icons type="fire-filled" size="20" color="#ff6b6b"></uni-icons>
				<text class="recommend-title">热门搜索</text>
			</view>
			<view class="hot-tags">
				<view class="hot-tag" v-for="(hot, index) in hotSearches" :key="index" @tap="searchHot(hot)">
					<text class="hot-rank">{{ index + 1 }}</text>
					<text class="hot-text">{{ hot }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue';
	import { community, skills } from '@/utils/cloudObjectManager';

	const searchKeyword = ref('');
	const currentIndex = ref(0);
	const loading = ref(false);
	const hasSearched = ref(false);
	const tabList = ['全部', '帖子', '技能', '用户'];

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

	// 执行搜索
	const handleSearch = async () => {
		const keyword = searchKeyword.value.trim();
		if (!keyword) {
			uni.showToast({ title: '请输入搜索关键词', icon: 'none' });
			return;
		}

		loading.value = true;
		hasSearched.value = true;

		try {
			// 搜索帖子
			if (currentIndex.value === 0 || currentIndex.value === 1) {
				const postRes = await community().searchPosts({ keyword });
				if (postRes.errCode === 0) {
					postResults.splice(0, postResults.length, ...(postRes.data || []));
				}
			}

			// 搜索技能
			if (currentIndex.value === 0 || currentIndex.value === 2) {
				const skillRes = await skills().searchSkills({ keyword });
				if (skillRes.errCode === 0) {
					skillResults.splice(0, skillResults.length, ...(skillRes.data || []));
				}
			}

			// 搜索用户
			if (currentIndex.value === 0 || currentIndex.value === 3) {
				const db = uniCloud.database();
				const userRes = await db.collection('users')
					.where({
						nickname: new RegExp(keyword, 'i')
					})
					.limit(10)
					.get();

				userResults.splice(0, userResults.length, ...userRes.data);
			}

			// 保存到搜索历史
			saveSearchHistory(keyword);
		} catch (error) {
			console.error('搜索失败:', error);
			uni.showToast({ title: '搜索失败，请重试', icon: 'none' });
		} finally {
			loading.value = false;
		}
	};

	// 清空搜索
	const handleClear = () => {
		searchKeyword.value = '';
		hasSearched.value = false;
		postResults.splice(0, postResults.length);
		skillResults.splice(0, skillResults.length);
		userResults.splice(0, userResults.length);
	};

	// 切换标签
	const onTabChange = (e) => {
		currentIndex.value = e.currentIndex;
		if (hasSearched.value) {
			handleSearch();
		}
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

		// 最多保存10条
		if (searchHistory.length > 10) {
			searchHistory.pop();
		}

		uni.setStorageSync('searchHistory', searchHistory);
	};

	// 清除历史
	const clearHistory = () => {
		uni.showModal({
			title: '提示',
			content: '确定要清除搜索历史吗？',
			success: (res) => {
				if (res.confirm) {
					searchHistory.splice(0, searchHistory.length);
					uni.removeStorageSync('searchHistory');
					uni.showToast({ title: '已清除', icon: 'success' });
				}
			}
		});
	};

	// 加载搜索历史
	const loadSearchHistory = () => {
		try {
			const history = uni.getStorageSync('searchHistory');
			if (Array.isArray(history)) {
				searchHistory.splice(0, searchHistory.length, ...history);
			}
		} catch (error) {
			console.error('加载搜索历史失败:', error);
		}
	};

	// 跳转帖子详情
	const goToPostDetail = (id) => {
		uni.navigateTo({
			url: `/pages/community/post-detail?id=${id}`
		});
	};

	// 跳转技能详情
	const goToSkillDetail = (id) => {
		uni.navigateTo({
			url: `/pages/skills/skill-detail?id=${id}`
		});
	};

	// 跳转用户主页
	const goToUserProfile = (id) => {
		uni.showToast({ title: '用户主页功能开发中', icon: 'none' });
	};

	onMounted(() => {
		// 加载搜索历史
		loadSearchHistory();
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

	/* 搜索栏 */
	.search-bar {
		background: #fff;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.search-input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		background: #f5f5f5;
		border-radius: 22px;
		padding: 8px 16px;
	}

	.search-icon {
		margin-right: 8px;
	}

	.search-input {
		flex: 1;
		background: transparent !important;
	}

	.search-input::v-deep .uni-easyinput__content {
		background: transparent !important;
	}

	.search-btn {
		padding: 8px 20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 22px;
	}

	.search-text {
		font-size: 15px;
		color: #fff;
		font-weight: 500;
	}

	/* 搜索历史 */
	.search-history {
		background: #fff;
		margin-top: 12px;
		padding: 16px;
	}

	.history-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.history-title {
		font-size: 15px;
		font-weight: 600;
		color: #333;
	}

	.history-clear {
		font-size: 14px;
		color: #999;
	}

	.history-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.history-tag {
		padding: 6px 14px;
		background: #f5f5f5;
		border-radius: 16px;
		font-size: 14px;
		color: #666;
		transition: all 0.2s;
	}

	.history-tag:active {
		background: #e5e5e5;
	}

	/* 搜索结果 */
	.search-results {
		flex: 1;
		padding: 12px;
	}

	.filter-tabs {
		background: #fff;
		padding: 12px 16px;
		margin-bottom: 12px;
		border-radius: 12px;
	}

	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 0;
	}

	.result-section {
		margin-bottom: 16px;
	}

	.section-header {
		margin-bottom: 12px;
	}

	.section-title {
		font-size: 15px;
		font-weight: 600;
		color: #333;
	}

	.result-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.result-card {
		display: flex;
		background: #fff;
		border-radius: 12px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		transition: transform 0.2s;
	}

	.result-card:active {
		transform: scale(0.98);
	}

	.result-image {
		width: 80px;
		height: 80px;
		border-radius: 8px;
		margin-right: 12px;
		flex-shrink: 0;
		background: #f5f5f5;
	}

	.result-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0;
	}

	.result-title {
		font-size: 15px;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-bottom: 6px;
	}

	.result-desc {
		font-size: 13px;
		color: #999;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-bottom: 8px;
	}

	.result-meta {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.result-stats {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		color: #999;
	}

	/* 用户列表 */
	.user-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.user-card {
		background: #fff;
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		transition: transform 0.2s;
	}

	.user-card:active {
		transform: scale(0.98);
	}

	.user-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: #f0f0f0;
		margin-bottom: 12px;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.user-name {
		font-size: 15px;
		font-weight: 600;
		color: #333;
		margin-bottom: 4px;
	}

	.user-building {
		font-size: 12px;
		color: #999;
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

	/* 热门推荐 */
	.hot-recommend {
		background: #fff;
		margin-top: 12px;
		padding: 16px;
	}

	.recommend-header {
		display: flex;
		align-items: center;
		margin-bottom: 12px;
	}

	.recommend-title {
		font-size: 15px;
		font-weight: 600;
		color: #333;
		margin-left: 6px;
	}

	.hot-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.hot-tag {
		display: flex;
		align-items: center;
		padding: 8px 16px;
		background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
		border-radius: 20px;
		transition: all 0.2s;
	}

	.hot-tag:active {
		transform: scale(0.95);
	}

	.hot-rank {
		font-size: 14px;
		font-weight: 700;
		color: #ff6b6b;
		margin-right: 6px;
	}

	.hot-text {
		font-size: 14px;
		color: #333;
	}
</style>
