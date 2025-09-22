<template>
	<view class="container">
		<!-- 搜索区域 -->
		<view class="search-section">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input 
					class="search-input" 
					placeholder="搜索技能、位置、服务..." 
					v-model="searchKeyword"
					@input="onSearchInput"
					@confirm="onSearch"
				/>
				<view class="search-btn" @tap="onSearch" v-if="searchKeyword">
					<text>搜索</text>
				</view>
			</view>
		</view>

		<!-- 筛选区域 -->
		<view class="filter-section">
			<scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
				<view class="filter-item" 
					v-for="(item, index) in filterList" 
					:key="index"
					:class="{ active: currentFilter === item.value }"
					@tap="selectFilter(item.value)">
					<text>{{ item.label }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 技能列表 -->
		<view class="skills-list">
			<view class="skill-item" 
				v-for="(skill, index) in skillsList" 
				:key="skill._id || index"
				@tap="goToSkillDetail(skill)">
				
				<!-- 用户头像和基本信息 -->
				<view class="skill-header">
					<image :src="skill.userAvatar || '/static/default.png'" class="user-avatar" mode="aspectFill"></image>
					<view class="user-info">
						<text class="username">{{ skill.username }}</text>
						<view class="location">
							<uni-icons type="location" size="12" color="#999"></uni-icons>
							<text class="location-text">{{ skill.location }}</text>
						</view>
					</view>
					<view class="price">
						<text class="price-text">¥{{ skill.price }}</text>
						<text class="price-unit">/{{ skill.priceUnit }}</text>
					</view>
				</view>

				<!-- 技能图片 -->
				<view class="skill-images" v-if="skill.images && skill.images.length > 0">
					<image 
						v-for="(img, imgIndex) in skill.images.slice(0, 3)" 
						:key="imgIndex"
						:src="img" 
						class="skill-image"
						mode="aspectFill"
						@tap.stop="previewImage(skill.images, imgIndex)">
					</image>
					<view class="more-images" v-if="skill.images.length > 3">
						<text>+{{ skill.images.length - 3 }}</text>
					</view>
				</view>

				<!-- 技能特色 -->
				<view class="skill-content">
					<text class="skill-title">{{ skill.title }}</text>
					<text class="skill-desc">{{ skill.description }}</text>
					<view class="skill-tags" v-if="skill.tags && skill.tags.length > 0">
						<text class="tag" v-for="(tag, tagIndex) in skill.tags" :key="tagIndex">
							{{ tag }}
						</text>
					</view>
				</view>

				<!-- 底部信息 -->
				<view class="skill-footer">
					<view class="rating">
						<uni-icons type="star-filled" size="14" color="#FFD700"></uni-icons>
						<text class="rating-text">{{ skill.rating || 5.0 }}</text>
						<text class="review-count">({{ skill.reviewCount || 0 }}评价)</text>
					</view>
					<text class="publish-time">{{ formatTime(skill.createTime) }}</text>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-if="skillsList.length === 0 && !isLoading">
			<uni-icons type="info" size="60" color="#ccc"></uni-icons>
			<text class="empty-text">暂无相关技能</text>
			<text class="empty-desc">试试其他搜索条件吧</text>
		</view>

		<!-- 加载状态 -->
		<view class="loading-state" v-if="isLoading">
			<uni-load-more :status="loadMoreStatus"></uni-load-more>
		</view>

		<!-- 添加技能按钮 -->
		<view class="add-skill-btn" @tap="goToAddSkill">
			<uni-icons type="plus" size="24" color="white"></uni-icons>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import { onReachBottom, onShow } from '@dcloudio/uni-app';

	const searchKeyword = ref('');
	const currentFilter = ref('all');
	const isLoading = ref(false);
	const loadMoreStatus = ref('more');
	const currentPage = ref(1);
	const hasMore = ref(true);

	// 技能列表数据
	const skillsList = ref([]);

	// 筛选选项
	const filterList = ref([
		{ label: '全部', value: 'all' },
		{ label: '家政服务', value: 'housekeeping' },
		{ label: '维修服务', value: 'repair' },
		{ label: '教育培训', value: 'education' },
		{ label: '美容美发', value: 'beauty' },
		{ label: '健康服务', value: 'health' },
		{ label: '其他', value: 'other' }
	]);

	// 云对象实例
	let skillsCloudObj = null;

	// 初始化云对象
	const initCloudObj = () => {
		try {
			skillsCloudObj = uniCloud.importObject('skills');
		} catch (error) {
			console.error('技能云对象初始化失败:', error);
			uni.showToast({
				title: '服务初始化失败',
				icon: 'none'
			});
		}
	};

	// 获取技能列表
	const getSkillsList = async (reset = false) => {
		if (isLoading.value && !reset) {
			return;
		}

		if (!hasMore.value && !reset) {
			return;
		}

		if (!skillsCloudObj) {
			initCloudObj();
			if (!skillsCloudObj) {
				uni.showToast({
					title: '服务不可用，请重试',
					icon: 'none'
				});
				return;
			}
		}

		try {
			isLoading.value = true;

			if (reset) {
				currentPage.value = 1;
				skillsList.value = [];
				hasMore.value = true;
			}

			// 构建查询参数
			const params = {
				keyword: searchKeyword.value.trim(),
				category: currentFilter.value === 'all' ? '' : currentFilter.value,
				page: currentPage.value,
				pageSize: 10
			};

			// 调用云对象查询
			const result = await skillsCloudObj.getSkillsList(params);

			if (result && result.errCode === 0 && result.data) {
				const { list, hasMore: moreData } = result.data;

				if (reset) {
					skillsList.value = list || [];
				} else {
					skillsList.value.push(...(list || []));
				}

				hasMore.value = moreData || false;
				currentPage.value++;

				// 如果是搜索或筛选后没有数据
				if (skillsList.value.length === 0) {
					uni.showToast({
						title: '暂无相关技能',
						icon: 'none'
					});
				}
			} else {
				// 处理业务错误
				const errorMsg = result?.errMsg || '获取技能列表失败';
				console.error('获取技能列表失败:', result);
				
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				});
			}

		} catch (error) {
			console.error('获取技能列表异常:', error);
			
			let errorMessage = '网络错误，请检查网络连接';
			
			if (error.message && error.message.includes('timeout')) {
				errorMessage = '请求超时，请重试';
			} else if (error.message && error.message.includes('uniCloud')) {
				errorMessage = '云服务连接失败，请重试';
			}
			
			uni.showToast({
				title: errorMessage,
				icon: 'none'
			});
		} finally {
			isLoading.value = false;
		}
	};

	// 搜索输入
	const onSearchInput = (e) => {
		searchKeyword.value = e.detail.value;
	};

	// 执行搜索
	const onSearch = () => {
		getSkillsList(true);
	};

	// 选择筛选条件
	const selectFilter = (value) => {
		currentFilter.value = value;
		getSkillsList(true);
	};

	// 格式化时间
	const formatTime = (dateStr) => {
		if (!dateStr) return '';
		
		try {
			let date;
			// 处理不同的时间格式
			if (typeof dateStr === 'object' && dateStr.$date) {
				date = new Date(dateStr.$date);
			} else if (dateStr instanceof Date) {
				date = dateStr;
			} else {
				date = new Date(dateStr);
			}
			
			const now = new Date();
			const diff = now - date;
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			
			if (days === 0) {
				return '今天';
			} else if (days === 1) {
				return '昨天';
			} else if (days < 7) {
				return `${days}天前`;
			} else {
				return date.toLocaleDateString();
			}
		} catch (error) {
			console.error('时间格式化错误:', error);
			return '';
		}
	};

	// 预览图片
	const previewImage = (urls, current) => {
		if (!urls || urls.length === 0) return;
		uni.previewImage({
			urls: urls,
			current: current
		});
	};

	// 跳转到技能详情
	const goToSkillDetail = (skill) => {
		uni.navigateTo({
			url: `/pages/skills/skill-detail?id=${skill._id}`
		});
	};

	// 跳转到添加技能
	const goToAddSkill = () => {
		uni.navigateTo({
			url: '/pages/skills/add-skill'
		});
	};

	// 页面触底加载更多
	onReachBottom(() => {
		if (hasMore.value && !isLoading.value) {
			getSkillsList(false);
		}
	});

	// 页面初始化
	const initPage = async () => {
		// 初始化云对象
		initCloudObj();
		
		// 等待云对象初始化完成
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// 获取技能列表
		await getSkillsList(true);
	};

	onMounted(() => {
		initPage();
	});

	onShow(() => {
		// 如果技能列表为空，则重新加载
		if (!skillsList.value || skillsList.value.length === 0) {
			initPage();
		}
	});
</script>

<style scoped>
	.container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 100rpx;
	}

	.search-section {
		background-color: white;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		border-radius: 50rpx;
		padding: 0 30rpx;
		height: 80rpx;
	}

	.search-input {
		flex: 1;
		margin-left: 20rpx;
		font-size: 28rpx;
	}

	.search-btn {
		background-color: #007aff;
		color: white;
		padding: 10rpx 20rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		margin-left: 20rpx;
	}

	.filter-section {
		background-color: white;
		padding: 20rpx 0;
		margin-bottom: 20rpx;
	}

	.filter-scroll {
		white-space: nowrap;
	}

	.filter-item {
		display: inline-block;
		padding: 10rpx 30rpx;
		margin: 0 10rpx;
		background-color: #f8f8f8;
		border-radius: 30rpx;
		font-size: 26rpx;
		color: #666;
	}

	.filter-item.active {
		background-color: #007aff;
		color: white;
	}

	.skills-list {
		padding: 0 20rpx;
	}

	.skill-item {
		background-color: white;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.skill-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.user-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.user-info {
		flex: 1;
	}

	.username {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}

	.location {
		display: flex;
		align-items: center;
	}

	.location-text {
		font-size: 24rpx;
		color: #999;
		margin-left: 5rpx;
	}

	.price {
		text-align: right;
	}

	.price-text {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff6b35;
	}

	.price-unit {
		font-size: 24rpx;
		color: #999;
	}

	.skill-images {
		display: flex;
		margin-bottom: 20rpx;
	}

	.skill-image {
		width: 200rpx;
		height: 150rpx;
		border-radius: 10rpx;
		margin-right: 20rpx;
	}

	.more-images {
		width: 200rpx;
		height: 150rpx;
		border-radius: 10rpx;
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		font-size: 24rpx;
	}

	.skill-content {
		margin-bottom: 20rpx;
	}

	.skill-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
	}

	.skill-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		display: block;
		margin-bottom: 15rpx;
	}

	.skill-tags {
		display: flex;
		flex-wrap: wrap;
	}

	.tag {
		background-color: #e8f4fd;
		color: #007aff;
		padding: 5rpx 15rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
		margin-right: 10rpx;
		margin-bottom: 10rpx;
	}

	.skill-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.rating {
		display: flex;
		align-items: center;
	}

	.rating-text {
		font-size: 26rpx;
		color: #333;
		margin-left: 5rpx;
	}

	.review-count {
		font-size: 24rpx;
		color: #999;
		margin-left: 10rpx;
	}

	.publish-time {
		font-size: 24rpx;
		color: #999;
	}

	.empty-state {
		text-align: center;
		padding: 100rpx 0;
		color: #999;
	}

	.empty-text {
		font-size: 32rpx;
		margin: 20rpx 0 10rpx;
		display: block;
	}

	.empty-desc {
		font-size: 26rpx;
		display: block;
	}

	.loading-state {
		padding: 40rpx 0;
	}

	.add-skill-btn {
		position: fixed;
		right: 40rpx;
		bottom: 40rpx;
		width: 100rpx;
		height: 100rpx;
		background-color: #007aff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.3);
		z-index: 999;
	}
</style>