<template>
	<view class="container">
		<!-- 技能图片轮播 -->
		<view class="banner-section" v-if="skillDetail.images && skillDetail.images.length > 0">
			<swiper class="swiper-box" :indicator-dots="true" :autoplay="false" :circular="true">
				<swiper-item v-for="(img, index) in skillDetail.images" :key="index">
					<image :src="img" mode="aspectFill" class="banner-image" @tap="previewImage(index)"></image>
				</swiper-item>
			</swiper>
		</view>

		<!-- 技能基本信息 -->
		<view class="info-section">
			<view class="skill-header">
				<text class="skill-title">{{ skillDetail.title }}</text>
				<view class="price-info">
					<text class="price">¥{{ skillDetail.price }}</text>
					<text class="price-unit">/{{ skillDetail.priceUnit }}</text>
				</view>
			</view>

			<view class="skill-tags">
				<text class="tag" v-for="(tag, index) in skillDetail.tags" :key="index">
					{{ tag }}
				</text>
			</view>

			<view class="skill-desc">
				<text>{{ skillDetail.description }}</text>
			</view>

			<view class="skill-stats">
				<view class="stat-item">
					<uni-icons type="star-filled" size="16" color="#FFD700"></uni-icons>
					<text class="rating">{{ skillDetail.rating }}</text>
					<text class="review-count">({{ skillDetail.reviewCount }}评价)</text>
				</view>
				<text class="publish-time">发布于 {{ formatDate(skillDetail.createTime) }}</text>
			</view>
		</view>

		<!-- 服务提供者信息 -->
		<view class="provider-section">
			<view class="section-title">服务提供者</view>
			<view class="provider-info">
				<image :src="skillDetail.userAvatar" class="provider-avatar" mode="aspectFill"></image>
				<view class="provider-details">
					<text class="provider-name">{{ skillDetail.username }}</text>
					<view class="provider-location">
						<uni-icons type="location" size="14" color="#999"></uni-icons>
						<text class="location-text">{{ skillDetail.location }}</text>
					</view>
					<view class="provider-stats">
						<text class="stat">技能数: {{ skillDetail.skillCount || 1 }}</text>
						<text class="stat">好评率: {{ skillDetail.goodRate || '100%' }}</text>
					</view>
				</view>
				<view class="contact-btn" @tap="showContactModal">
					<uni-icons type="chatbubble" size="16" color="#007aff"></uni-icons>
					<text>联系</text>
				</view>
			</view>
		</view>

		<!-- 服务评价 -->
		<view class="reviews-section" v-if="reviews.length > 0">
			<view class="section-title">
				<text>服务评价</text>
				<text class="more-reviews" @tap="goToAllReviews">查看全部</text>
			</view>
			<view class="review-item" v-for="(review, index) in reviews.slice(0, 3)" :key="index">
				<view class="review-header">
					<image :src="review.userAvatar" class="reviewer-avatar" mode="aspectFill"></image>
					<view class="reviewer-info">
						<text class="reviewer-name">{{ review.username }}</text>
						<view class="review-rating">
							<uni-icons 
								v-for="star in 5" 
								:key="star"
								type="star-filled" 
								size="12" 
								:color="star <= review.rating ? '#FFD700' : '#E8E8E8'">
							</uni-icons>
						</view>
					</view>
					<text class="review-time">{{ formatTime(review.createTime) }}</text>
				</view>
				<text class="review-content">{{ review.content }}</text>
			</view>
		</view>

		<!-- 相关技能推荐 -->
		<view class="related-section" v-if="relatedSkills.length > 0">
			<view class="section-title">相关技能推荐</view>
			<scroll-view class="related-scroll" scroll-x="true" show-scrollbar="false">
				<view class="related-item" 
					v-for="(skill, index) in relatedSkills" 
					:key="skill.id"
					@tap="goToSkillDetail(skill.id)">
					<image :src="skill.images[0]" class="related-image" mode="aspectFill"></image>
					<text class="related-title">{{ skill.title }}</text>
					<text class="related-price">¥{{ skill.price }}/{{ skill.priceUnit }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="action-btn collect-btn" @tap="toggleCollect">
				<uni-icons :type="isCollected ? 'heart-filled' : 'heart'" size="20" :color="isCollected ? '#ff4757' : '#666'"></uni-icons>
				<text>{{ isCollected ? '已收藏' : '收藏' }}</text>
			</view>
			<view class="action-btn share-btn" @tap="shareSkill">
				<uni-icons type="redo" size="20" color="#666"></uni-icons>
				<text>分享</text>
			</view>
			<view class="contact-main-btn" @tap="showContactModal">
				<text>立即联系</text>
			</view>
		</view>

		<!-- 联系方式弹窗 -->
		<uni-popup ref="contactPopup" type="bottom">
			<view class="contact-modal">
				<view class="modal-header">
					<text class="modal-title">联系服务提供者</text>
					<view class="close-btn" @tap="closeContactModal">
						<uni-icons type="close" size="20" color="#999"></uni-icons>
					</view>
				</view>
				<view class="contact-options">
					<view class="contact-option" @tap="makePhoneCall" v-if="skillDetail.phone">
						<view class="option-icon phone-icon">
							<uni-icons type="phone" size="24" color="white"></uni-icons>
						</view>
						<view class="option-info">
							<text class="option-title">电话联系</text>
							<text class="option-desc">{{ skillDetail.phone }}</text>
						</view>
					</view>
					<view class="contact-option" @tap="copyWechat" v-if="skillDetail.wechat">
						<view class="option-icon wechat-icon">
							<uni-icons type="weixin" size="24" color="white"></uni-icons>
						</view>
						<view class="option-info">
							<text class="option-title">微信联系</text>
							<text class="option-desc">{{ skillDetail.wechat }}</text>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue';

	const contactPopup = ref(null);
	const isCollected = ref(false);

	// 技能详情数据
	const skillDetail = reactive({
		id: 1,
		username: '张师傅',
		userAvatar: 'https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=张',
		location: '1号楼301',
		price: 50,
		priceUnit: '小时',
		title: '专业家电维修',
		description: '10年维修经验，擅长各种家电故障排除，价格公道，服务周到。提供上门维修服务，包括冰箱、洗衣机、空调、电视等各类家电的维修保养。',
		tags: ['家电维修', '经验丰富', '价格实惠', '上门服务'],
		images: [
			'https://via.placeholder.com/750x400/FF6B6B/FFFFFF?text=维修1',
			'https://via.placeholder.com/750x400/4ECDC4/FFFFFF?text=维修2',
			'https://via.placeholder.com/750x400/45B7D1/FFFFFF?text=维修3'
		],
		rating: 4.8,
		reviewCount: 23,
		createTime: new Date('2024-01-15'),
		category: 'repair',
		phone: '13800138000',
		wechat: 'zhangshifu123',
		skillCount: 3,
		goodRate: '98%'
	});

	// 评价数据
	const reviews = reactive([
		{
			id: 1,
			username: '李女士',
			userAvatar: 'https://via.placeholder.com/60x60/FF69B4/FFFFFF?text=李',
			rating: 5,
			content: '张师傅技术很好，态度也很好，修好了我家的洗衣机，价格合理，推荐！',
			createTime: new Date('2024-01-20')
		},
		{
			id: 2,
			username: '王先生',
			userAvatar: 'https://via.placeholder.com/60x60/32CD32/FFFFFF?text=王',
			rating: 4,
			content: '服务及时，修理技术专业，就是时间稍微长了一点。',
			createTime: new Date('2024-01-18')
		}
	]);

	// 相关技能推荐
	const relatedSkills = reactive([
		{
			id: 2,
			title: '专业家政清洁',
			price: 30,
			priceUnit: '小时',
			images: ['https://via.placeholder.com/200x150/96CEB4/FFFFFF?text=清洁']
		},
		{
			id: 3,
			title: '小学数学辅导',
			price: 80,
			priceUnit: '课时',
			images: ['https://via.placeholder.com/200x150/DDA0DD/FFFFFF?text=教学']
		}
	]);

	// 格式化日期
	const formatDate = (date) => {
		return date.toLocaleDateString();
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
	const previewImage = (current) => {
		uni.previewImage({
			urls: skillDetail.images,
			current: current
		});
	};

	// 显示联系弹窗
	const showContactModal = () => {
		contactPopup.value.open();
	};

	// 关闭联系弹窗
	const closeContactModal = () => {
		contactPopup.value.close();
	};

	// 拨打电话
	const makePhoneCall = () => {
		uni.makePhoneCall({
			phoneNumber: skillDetail.phone,
			success: () => {
				closeContactModal();
			}
		});
	};

	// 复制微信号
	const copyWechat = () => {
		uni.setClipboardData({
			data: skillDetail.wechat,
			success: () => {
				uni.showToast({
					title: '微信号已复制',
					icon: 'success'
				});
				closeContactModal();
			}
		});
	};

	// 切换收藏状态
	const toggleCollect = () => {
		isCollected.value = !isCollected.value;
		uni.showToast({
			title: isCollected.value ? '已收藏' : '已取消收藏',
			icon: 'success'
		});
	};

	// 分享技能
	const shareSkill = () => {
		uni.share({
			provider: 'weixin',
			scene: 'WXSceneSession',
			type: 0,
			href: '',
			title: skillDetail.title,
			summary: skillDetail.description,
			imageUrl: skillDetail.images[0],
			success: () => {
				uni.showToast({
					title: '分享成功',
					icon: 'success'
				});
			}
		});
	};

	// 跳转到技能详情
	const goToSkillDetail = (id) => {
		uni.redirectTo({
			url: `/pages/skills/skill-detail?id=${id}`
		});
	};

	// 查看全部评价
	const goToAllReviews = () => {
		uni.showToast({
			title: '查看全部评价功能开发中',
			icon: 'none'
		});
	};

	onMounted(() => {
		// 获取页面参数
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		const options = currentPage.options;
		
		if (options.id) {
			console.log('技能ID:', options.id);
			// 这里可以根据ID加载具体的技能数据
		}
	});
</script>

<style scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding-bottom: 120rpx;
	}

	/* 轮播图 */
	.banner-section {
		height: 400rpx;
		background-color: white;
	}

	.swiper-box {
		height: 100%;
	}

	.banner-image {
		width: 100%;
		height: 100%;
	}

	/* 基本信息区域 */
	.info-section {
		background-color: white;
		padding: 32rpx 24rpx;
		margin-bottom: 16rpx;
	}

	.skill-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20rpx;
	}

	.skill-title {
		flex: 1;
		font-size: 36rpx;
		font-weight: 700;
		color: #333;
		line-height: 1.3;
		margin-right: 20rpx;
	}

	.price-info {
		text-align: right;
	}

	.price {
		font-size: 40rpx;
		font-weight: 700;
		color: #ff4757;
	}

	.price-unit {
		font-size: 24rpx;
		color: #999;
	}

	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 24rpx;
	}

	.tag {
		background-color: #e8f4fd;
		color: #007aff;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
	}

	.skill-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 24rpx;
	}

	.skill-stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.stat-item {
		display: flex;
		align-items: center;
	}

	.rating {
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

	/* 服务提供者区域 */
	.provider-section {
		background-color: white;
		padding: 32rpx 24rpx;
		margin-bottom: 16rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.provider-info {
		display: flex;
		align-items: center;
	}

	.provider-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 24rpx;
	}

	.provider-details {
		flex: 1;
	}

	.provider-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
	}

	.provider-location {
		display: flex;
		align-items: center;
		margin-bottom: 8rpx;
	}

	.location-text {
		font-size: 22rpx;
		color: #999;
		margin-left: 8rpx;
	}

	.provider-stats {
		display: flex;
		gap: 24rpx;
	}

	.stat {
		font-size: 22rpx;
		color: #666;
	}

	.contact-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16rpx;
		border: 2rpx solid #007aff;
		border-radius: 12rpx;
		color: #007aff;
		font-size: 22rpx;
	}

	/* 评价区域 */
	.reviews-section {
		background-color: white;
		padding: 32rpx 24rpx;
		margin-bottom: 16rpx;
	}

	.more-reviews {
		font-size: 24rpx;
		color: #007aff;
	}

	.review-item {
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.review-item:last-child {
		border-bottom: none;
	}

	.review-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.reviewer-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		margin-right: 16rpx;
	}

	.reviewer-info {
		flex: 1;
	}

	.reviewer-name {
		font-size: 26rpx;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
	}

	.review-rating {
		display: flex;
		gap: 4rpx;
	}

	.review-time {
		font-size: 22rpx;
		color: #999;
	}

	.review-content {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
	}

	/* 相关推荐区域 */
	.related-section {
		background-color: white;
		padding: 32rpx 0;
		margin-bottom: 16rpx;
	}

	.related-scroll {
		white-space: nowrap;
		padding: 0 24rpx;
	}

	.related-item {
		display: inline-block;
		width: 200rpx;
		margin-right: 16rpx;
		vertical-align: top;
	}

	.related-image {
		width: 100%;
		height: 150rpx;
		border-radius: 12rpx;
		margin-bottom: 12rpx;
	}

	.related-title {
		font-size: 24rpx;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.related-price {
		font-size: 22rpx;
		color: #ff4757;
		font-weight: 600;
	}

	/* 底部操作栏 */
	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: white;
		padding: 20rpx 24rpx;
		border-top: 1rpx solid #f0f0f0;
		display: flex;
		align-items: center;
		gap: 20rpx;
		z-index: 999;
	}

	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 20rpx;
		color: #666;
		min-width: 80rpx;
	}

	.contact-main-btn {
		flex: 1;
		background-color: #007aff;
		color: white;
		text-align: center;
		padding: 24rpx;
		border-radius: 50rpx;
		font-size: 28rpx;
		font-weight: 600;
	}

	/* 联系弹窗 */
	.contact-modal {
		background-color: white;
		border-radius: 20rpx 20rpx 0 0;
		padding: 40rpx 0;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 32rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.close-btn {
		padding: 8rpx;
	}

	.contact-options {
		padding: 32rpx;
	}

	.contact-option {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.contact-option:last-child {
		border-bottom: none;
	}

	.option-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}

	.phone-icon {
		background-color: #07c160;
	}

	.wechat-icon {
		background-color: #1aad19;
	}

	.option-info {
		flex: 1;
	}

	.option-title {
		font-size: 28rpx;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
	}

	.option-desc {
		font-size: 24rpx;
		color: #666;
	}
</style>