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
				v-for="(skill, index) in filteredSkills" 
				:key="skill.id"
				@tap="goToSkillDetail(skill)">
				
				<!-- 用户头像和基本信息 -->
				<view class="skill-header">
					<image :src="skill.userAvatar" class="user-avatar" mode="aspectFill"></image>
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
		<view class="empty-state" v-if="filteredSkills.length === 0 && !isLoading">
			<uni-icons type="info" size="60" color="#ccc"></uni-icons>
			<text class="empty-text">暂无相关技能</text>
			<text class="empty-desc">试试其他搜索条件吧</text>
		</view>

		<!-- 加载状态 -->
		<view class="loading-state" v-if="isLoading">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 添加技能按钮 -->
		<view class="add-skill-btn" @tap="goToAddSkill">
			<uni-icons type="plus" size="24" color="white"></uni-icons>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive, computed, onMounted } from 'vue';

	const searchKeyword = ref('');
	const currentFilter = ref('all');
	const isLoading = ref(false);

	// 筛选选项
	const filterList = reactive([
		{ label: '全部', value: 'all' },
		{ label: '家政服务', value: 'housekeeping' },
		{ label: '维修安装', value: 'repair' },
		{ label: '教育培训', value: 'education' },
		{ label: '美容美发', value: 'beauty' },
		{ label: '健康护理', value: 'health' },
		{ label: '其他服务', value: 'other' }
	]);

	// 模拟技能数据
	const skillsList = reactive([
		{
			id: 1,
			username: '张师傅',
			userAvatar: 'https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=张',
			location: '1号楼301',
			price: 50,
			priceUnit: '小时',
			title: '专业家电维修',
			description: '10年维修经验，擅长各种家电故障排除，价格公道，服务周到',
			tags: ['家电维修', '经验丰富', '价格实惠'],
			images: [
				'https://via.placeholder.com/200x150/FF6B6B/FFFFFF?text=维修1',
				'https://via.placeholder.com/200x150/4ECDC4/FFFFFF?text=维修2',
				'https://via.placeholder.com/200x150/45B7D1/FFFFFF?text=维修3'
			],
			rating: 4.8,
			reviewCount: 23,
			createTime: new Date('2024-01-15'),
			category: 'repair'
		},
		{
			id: 2,
			username: '李阿姨',
			userAvatar: 'https://via.placeholder.com/80x80/FF6B6B/FFFFFF?text=李',
			location: '2号楼205',
			price: 30,
			priceUnit: '小时',
			title: '专业家政清洁',
			description: '提供家庭清洁、整理收纳服务，细致认真，让您的家焕然一新',
			tags: ['家政清洁', '整理收纳', '细致认真'],
			images: [
				'https://via.placeholder.com/200x150/96CEB4/FFFFFF?text=清洁1',
				'https://via.placeholder.com/200x150/FFEAA7/FFFFFF?text=清洁2'
			],
			rating: 4.9,
			reviewCount: 45,
			createTime: new Date('2024-01-20'),
			category: 'housekeeping'
		},
		{
			id: 3,
			username: '王老师',
			userAvatar: 'https://via.placeholder.com/80x80/A8E6CF/FFFFFF?text=王',
			location: '3号楼102',
			price: 80,
			priceUnit: '课时',
			title: '小学数学辅导',
			description: '退休小学教师，30年教学经验，擅长小学数学辅导，因材施教',
			tags: ['数学辅导', '经验丰富', '因材施教'],
			images: [
				'https://via.placeholder.com/200x150/DDA0DD/FFFFFF?text=教学1'
			],
			rating: 4.7,
			reviewCount: 18,
			createTime: new Date('2024-01-25'),
			category: 'education'
		},
		{
			id: 4,
			username: '小美',
			userAvatar: 'https://via.placeholder.com/80x80/FFB6C1/FFFFFF?text=美',
			location: '4号楼508',
			price: 60,
			priceUnit: '次',
			title: '上门美甲服务',
			description: '专业美甲师，提供上门美甲服务，款式新颖，技术精湛',
			tags: ['美甲服务', '上门服务', '款式新颖'],
			images: [
				'https://via.placeholder.com/200x150/FF69B4/FFFFFF?text=美甲1',
				'https://via.placeholder.com/200x150/DA70D6/FFFFFF?text=美甲2',
				'https://via.placeholder.com/200x150/BA55D3/FFFFFF?text=美甲3',
				'https://via.placeholder.com/200x150/9370DB/FFFFFF?text=美甲4'
			],
			rating: 4.6,
			reviewCount: 32,
			createTime: new Date('2024-02-01'),
			category: 'beauty'
		}
	]);

	// 过滤后的技能列表
	const filteredSkills = computed(() => {
		let result = skillsList;
		
		// 按分类筛选
		if (currentFilter.value !== 'all') {
			result = result.filter(skill => skill.category === currentFilter.value);
		}
		
		// 按关键词搜索
		if (searchKeyword.value.trim()) {
			const keyword = searchKeyword.value.toLowerCase();
			result = result.filter(skill => 
				skill.title.toLowerCase().includes(keyword) ||
				skill.description.toLowerCase().includes(keyword) ||
				skill.username.toLowerCase().includes(keyword) ||
				skill.location.toLowerCase().includes(keyword) ||
				skill.tags.some(tag => tag.toLowerCase().includes(keyword))
			);
		}
		
		return result;
	});

	// 搜索输入
	const onSearchInput = (e) => {
		searchKeyword.value = e.detail.value;
	};

	// 执行搜索
	const onSearch = () => {
		console.log('搜索关键词:', searchKeyword.value);
		// 这里可以调用搜索API
	};

	// 选择筛选条件
	const selectFilter = (value) => {
		currentFilter.value = value;
	};

	// 格式化时间
	const formatTime = (date) => {
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
	const previewImage = (images, current) => {
		uni.previewImage({
			urls: images,
			current: current
		});
	};

	// 跳转到技能详情
	const goToSkillDetail = (skill) => {
		uni.navigateTo({
			url: `/pages/skills/skill-detail?id=${skill.id}`
		});
	};

	// 跳转到添加技能
	const goToAddSkill = () => {
		uni.navigateTo({
			url: '/pages/skills/add-skill'
		});
	};

	onMounted(() => {
		console.log('技能台页面加载完成');
	});
</script>

<style scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding-bottom: 120rpx;
	}

	/* 搜索区域 */
	.search-section {
		background-color: white;
		padding: 24rpx;
		margin-bottom: 16rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 50rpx;
		padding: 16rpx 24rpx;
	}

	.search-input {
		flex: 1;
		margin-left: 16rpx;
		font-size: 28rpx;
		color: #333;
	}

	.search-btn {
		background-color: #007aff;
		color: white;
		padding: 12rpx 24rpx;
		border-radius: 30rpx;
		margin-left: 16rpx;
	}

	.search-btn text {
		font-size: 24rpx;
		color: white;
	}

	/* 筛选区域 */
	.filter-section {
		background-color: white;
		padding: 24rpx 0;
		margin-bottom: 16rpx;
	}

	.filter-scroll {
		white-space: nowrap;
	}

	.filter-item {
		display: inline-block;
		padding: 12rpx 24rpx;
		margin: 0 12rpx;
		border-radius: 30rpx;
		background-color: #f5f5f5;
		color: #666;
		font-size: 24rpx;
		transition: all 0.3s;
	}

	.filter-item.active {
		background-color: #007aff;
		color: white;
	}

	/* 技能列表 */
	.skills-list {
		padding: 0 24rpx;
	}

	.skill-item {
		background-color: white;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	/* 技能头部 */
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
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
	}

	.location {
		display: flex;
		align-items: center;
	}

	.location-text {
		font-size: 22rpx;
		color: #999;
		margin-left: 8rpx;
	}

	.price {
		text-align: right;
	}

	.price-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #ff4757;
	}

	.price-unit {
		font-size: 22rpx;
		color: #999;
	}

	/* 技能图片 */
	.skill-images {
		display: flex;
		margin-bottom: 20rpx;
		gap: 12rpx;
	}

	.skill-image {
		width: 200rpx;
		height: 150rpx;
		border-radius: 12rpx;
	}

	.more-images {
		width: 200rpx;
		height: 150rpx;
		border-radius: 12rpx;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 24rpx;
	}

	/* 技能内容 */
	.skill-content {
		margin-bottom: 20rpx;
	}

	.skill-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 12rpx;
	}

	.skill-desc {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
		display: block;
		margin-bottom: 16rpx;
	}

	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.tag {
		background-color: #e8f4fd;
		color: #007aff;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
	}

	/* 技能底部 */
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
		font-size: 24rpx;
		color: #333;
		margin-left: 8rpx;
	}

	.review-count {
		font-size: 22rpx;
		color: #999;
		margin-left: 8rpx;
	}

	.publish-time {
		font-size: 22rpx;
		color: #999;
	}

	/* 空状态 */
	.empty-state {
		text-align: center;
		padding: 120rpx 40rpx;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
		display: block;
		margin: 24rpx 0 12rpx;
	}

	.empty-desc {
		font-size: 24rpx;
		color: #ccc;
		display: block;
	}

	/* 加载状态 */
	.loading-state {
		padding: 40rpx;
	}

	/* 添加技能按钮 */
	.add-skill-btn {
		position: fixed;
		right: 40rpx;
		bottom: 120rpx;
		width: 100rpx;
		height: 100rpx;
		background-color: #007aff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(0, 122, 255, 0.3);
		z-index: 999;
	}
</style>