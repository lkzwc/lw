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
				:key="skill._id"
				@tap="goToSkillDetail(skill)">
				
				<!-- 用户头像和基本信息 -->
				<view class="skill-header">
					<image :src="skill.userAvatar || '/static/default-avatar.png'" class="user-avatar" mode="aspectFill"></image>
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
					<view class="skill-tags">
						<text class="tag" v-for="(tag, tagIndex) in skill.tags" :key="tagIndex">
							{{ tag }}
						</text>
					</view>
				</view>

				<!-- 底部信息 -->
				<view class="skill-footer">
					<view class="rating">
						<uni-icons type="star-filled" size="14" color="#FFD700"></uni-icons>
						<text class="rating-text">{{ skill.rating }}</text>
						<text class="review-count">({{ skill.reviewCount }}评价)</text>
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
	import { ref, reactive, computed, onMounted } from 'vue';
	import { onReachBottom } from '@dcloudio/uni-app';

	const searchKeyword = ref('');
	const currentFilter = ref('all');
	const isLoading = ref(false);
	const loadMoreStatus = ref('more'); // more, loading, noMore
	const currentPage = ref(1);
	const pageSize = ref(10);
	const hasMore = ref(true);

	// 技能列表数据
	const skillsList = reactive([]);

	// 筛选选项
	const filterList = reactive([]);

	// 云对象实例
	let skillsCloudObj = null;

	// 初始化云对象
	const initCloudObj = () => {
		try {
			skillsCloudObj = uniCloud.importObject('skills');
		} catch (error) {
			console.error('初始化云对象失败:', error);
			uni.showToast({
				title: '服务初始化失败',
				icon: 'none'
			});
		}
	};

	// 获取技能分类列表
	const getCategories = async () => {
		try {
			const result = await skillsCloudObj.getCategories();
			if (result.errCode === 0) {
				filterList.splice(0, filterList.length, ...result.data);
			}
		} catch (error) {
			console.error('获取分类失败:', error);
		}
	};

	// 获取技能列表
	const getSkillsList = async (reset = false) => {
		if (isLoading.value) return;
		
		console.log('开始获取技能列表, reset:', reset);
		
		try {
			isLoading.value = true;
			loadMoreStatus.value = 'loading';
			
			if (reset) {
				currentPage.value = 1;
				hasMore.value = true;
			}

			const params = {
				keyword: searchKeyword.value.trim(),
				category: currentFilter.value,
				page: currentPage.value,
				pageSize: pageSize.value
			};

			console.log('调用云对象参数:', params);
			console.log('云对象实例状态:', skillsCloudObj ? '已初始化' : '未初始化');
			
			if (!skillsCloudObj) {
				console.error('云对象未初始化');
				uni.showToast({
					title: '服务未初始化，请重试',
					icon: 'none'
				});
				return;
			}
			
			console.log('准备调用云对象方法...');
			const result = await skillsCloudObj.getSkillsList(params);
			console.log('云对象返回结果:', result);
			
			if (result && result.errCode === 0) {
				console.log('获取成功，数据:', result.data);
				const { list, hasMore: moreData } = result.data;
				
				if (reset) {
					skillsList.splice(0, skillsList.length, ...list);
				} else {
					skillsList.push(...list);
				}
				
				hasMore.value = moreData;
				loadMoreStatus.value = hasMore.value ? 'more' : 'noMore';
				
				if (list.length > 0) {
					currentPage.value++;
				}
				
				console.log('技能列表更新完成，当前列表长度:', skillsList.length);
			} else {
				console.error('获取技能列表失败:', result);
				const errorMsg = result?.errMsg || '获取技能列表失败';
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				});
				loadMoreStatus.value = 'more';
			}
		} catch (error) {
			console.error('获取技能列表异常:', error);
			console.error('异常详情:', error.message, error.stack);
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			});
			loadMoreStatus.value = 'more';
		} finally {
			isLoading.value = false;
			console.log('获取技能列表流程结束');
		}
	};

	// 搜索技能
	const searchSkills = async () => {
		if (!skillsCloudObj) return;
		
		try {
			isLoading.value = true;
			
			const params = {
				keyword: searchKeyword.value.trim(),
				category: currentFilter.value,
				page: 1,
				pageSize: pageSize.value
			};

			console.log('搜索参数:', params);
			const result = await skillsCloudObj.searchSkills(searchKeyword.value.trim(), params);
			console.log('搜索结果:', result);
			
			if (result && result.errCode === 0) {
				const { list, hasMore: moreData } = result.data;
				skillsList.splice(0, skillsList.length, ...list);
				hasMore.value = moreData;
				currentPage.value = 2;
				loadMoreStatus.value = hasMore.value ? 'more' : 'noMore';
			} else {
				console.error('搜索失败:', result);
				const errorMsg = result?.errMsg || '搜索失败';
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('搜索异常:', error);
			uni.showToast({
				title: '搜索失败，请重试',
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
		if (searchKeyword.value.trim()) {
			searchSkills();
		} else {
			getSkillsList(true);
		}
	};

	// 选择筛选条件
	const selectFilter = (value) => {
		currentFilter.value = value;
		getSkillsList(true);
	};

	// 格式化时间
	const formatTime = (dateStr) => {
		if (!dateStr) return '';
		
		const date = new Date(dateStr);
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
	};

	// 预览图片
	const previewImage = (urls, current) => {
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

	// 页面加载时初始化
	onMounted(() => {
		initCloudObj();
		if (skillsCloudObj) {
			getCategories();
			getSkillsList(true);
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
		padding: 15rpx 30rpx;
		margin: 0 10rpx;
		background-color: #f8f8f8;
		border-radius: 40rpx;
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
		border-radius: 40rpx;
		margin-right: 20rpx;
	}

	.user-info {
		flex: 1;
	}

	.username {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.location {
		display: flex;
		align-items: center;
		margin-top: 10rpx;
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
		color: #ff4757;
	}

	.price-unit {
		font-size: 24rpx;
		color: #999;
	}

	.skill-images {
		display: flex;
		margin-bottom: 20rpx;
		gap: 10rpx;
	}

	.skill-image {
		width: 200rpx;
		height: 150rpx;
		border-radius: 10rpx;
	}

	.more-images {
		width: 200rpx;
		height: 150rpx;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 24rpx;
	}

	.skill-content {
		margin-bottom: 20rpx;
	}

	.skill-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.skill-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 15rpx;
	}

	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.tag {
		background-color: #e3f2fd;
		color: #1976d2;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
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
		margin: 0 10rpx;
	}

	.review-count {
		font-size: 24rpx;
		color: #999;
	}

	.publish-time {
		font-size: 24rpx;
		color: #999;
	}

	.empty-state {
		text-align: center;
		padding: 100rpx 0;
	}

	.empty-text {
		display: block;
		font-size: 32rpx;
		color: #999;
		margin-top: 20rpx;
	}

	.empty-desc {
		display: block;
		font-size: 26rpx;
		color: #ccc;
		margin-top: 10rpx;
	}

	.loading-state {
		padding: 40rpx 0;
	}

	.add-skill-btn {
		position: fixed;
		right: 40rpx;
		bottom: 120rpx;
		width: 100rpx;
		height: 100rpx;
		background-color: #007aff;
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.3);
		z-index: 999;
	}
</style>