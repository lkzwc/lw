<template>
	<view class="container">
		<!-- 加载状态 -->
		<view class="loading-container" v-if="isLoading">
			<uni-load-more status="loading"></uni-load-more>
		</view>

		<!-- 技能详情内容 -->
		<view v-else-if="skillDetail._id">
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

				<view class="skill-tags" v-if="skillDetail.tags && skillDetail.tags.length > 0">
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
					<image :src="skillDetail.userAvatar || '/static/default.png'" class="provider-avatar" mode="aspectFill"></image>
					<view class="provider-details">
						<text class="provider-name">{{ skillDetail.username }}</text>
						<view class="provider-location">
							<uni-icons type="location" size="14" color="#999"></uni-icons>
							<text class="location-text">{{ skillDetail.location }}</text>
						</view>
						<view class="provider-stats">
							<text class="stat">浏览: {{ skillDetail.viewCount || 0 }}</text>
							<text class="stat">评分: {{ skillDetail.rating }}</text>
						</view>
					</view>
					<view class="contact-btn" @tap="showContactModal">
						<uni-icons type="chatbubble" size="16" color="#007aff"></uni-icons>
						<text>联系</text>
					</view>
				</view>
			</view>

			<!-- 相关技能推荐 -->
			<view class="related-section" v-if="relatedSkills.length > 0">
				<view class="section-title">相关技能推荐</view>
				<scroll-view class="related-scroll" scroll-x="true" show-scrollbar="false">
					<view class="related-item" 
						v-for="(skill, index) in relatedSkills" 
						:key="skill._id"
						@tap="goToSkillDetail(skill._id)">
						<image :src="skill.images && skill.images[0] ? skill.images[0] : '/static/default-skill.png'" class="related-image" mode="aspectFill"></image>
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
		</view>

		<!-- 错误状态 -->
		<view class="error-container" v-else-if="!isLoading">
			<uni-icons type="info" size="60" color="#ccc"></uni-icons>
			<text class="error-text">技能不存在或已下架</text>
			<button class="retry-btn" @tap="loadSkillDetail">重新加载</button>
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
					<view class="no-contact" v-if="!skillDetail.phone && !skillDetail.wechat">
						<text>暂无联系方式</text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import { skills } from '@/utils/cloudObjectManager';

	const contactPopup = ref(null);
	const isCollected = ref(false);
	const isLoading = ref(true);
	const skillId = ref('');

	// 技能详情数据
	const skillDetail = reactive({});

	// 相关技能推荐
	const relatedSkills = reactive([]);

	// 使用 onLoad 获取页面参数 - 这是 uni-app 推荐的方式
	onLoad((options) => {
		if (options && options.id) {
			skillId.value = options.id;
		}
	});

	// 加载技能详情
	const loadSkillDetail = async () => {
		console.log('开始加载技能详情, skillId:', skillId.value);
		
		if (!skillId.value) {
			console.error('技能ID为空，无法加载详情');
			uni.showToast({
				title: '技能ID不能为空',
				icon: 'none'
			});
			isLoading.value = false;
			return;
		}

		if (!skillsCloudObj) {
			console.error('云对象未初始化');
			uni.showToast({
				title: '服务未初始化',
				icon: 'none'
			});
			isLoading.value = false;
			return;
		}

		try {
			isLoading.value = true;
			console.log('调用云对象获取技能详情...');

			const result = await skills().getSkillDetail(skillId.value);
			console.log('云对象返回结果:', result);

			if (result && result.errCode === 0) {
				console.log('获取技能详情成功:', result.data);
				// 清空原有数据并赋值新数据
				Object.keys(skillDetail).forEach(key => {
					delete skillDetail[key];
				});
				Object.assign(skillDetail, result.data);

				// 加载相关技能推荐
				loadRelatedSkills();
			} else {
				console.error('获取技能详情失败:', result);
				const errorMsg = result?.errMsg || '获取技能详情失败';
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('获取技能详情异常:', error);
			console.error('异常详情:', error.message, error.stack);
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			});
		} finally {
			isLoading.value = false;
			console.log('技能详情加载流程结束');
		}
	};

	// 加载相关技能推荐
	const loadRelatedSkills = async () => {
		if (!skillsCloudObj || !skillDetail.category) {
			console.log('跳过相关技能加载，云对象或分类信息缺失');
			return;
		}

		try {
			const result = await skills().getSkillsList({
				category: skillDetail.category,
				page: 1,
				pageSize: 5
			});

			if (result && result.errCode === 0) {
				// 过滤掉当前技能，只显示其他技能
				const filteredSkills = result.data.list.filter(skill => skill._id !== skillId.value);
				relatedSkills.splice(0, relatedSkills.length, ...filteredSkills.slice(0, 4));
			}
		} catch (error) {
			console.error('获取相关技能失败:', error);
		}
	};

	// 格式化日期
	const formatDate = (dateStr) => {
		if (!dateStr) return '';
		
		const date = new Date(dateStr);
		return date.toLocaleDateString();
	};

	// 预览图片
	const previewImage = (current) => {
		if (!skillDetail.images || skillDetail.images.length === 0) return;
		
		uni.previewImage({
			urls: skillDetail.images,
			current: current
		});
	};

	// 显示联系方式弹窗
	const showContactModal = () => {
		if (!skillDetail.phone && !skillDetail.wechat) {
			uni.showToast({
				title: '暂无联系方式',
				icon: 'none'
			});
			return;
		}
		contactPopup.value?.open();
	};

	// 关闭联系方式弹窗
	const closeContactModal = () => {
		contactPopup.value?.close();
	};

	// 拨打电话
	const makePhoneCall = () => {
		if (!skillDetail.phone) return;
		
		uni.makePhoneCall({
			phoneNumber: skillDetail.phone,
			success: () => {
				closeContactModal();
			},
			fail: (error) => {
				console.error('拨打电话失败:', error);
				uni.showToast({
					title: '拨打电话失败',
					icon: 'none'
				});
			}
		});
	};

	// 复制微信号
	const copyWechat = () => {
		if (!skillDetail.wechat) return;
		
		uni.setClipboardData({
			data: skillDetail.wechat,
			success: () => {
				uni.showToast({
					title: '微信号已复制',
					icon: 'success'
				});
				closeContactModal();
			},
			fail: (error) => {
				console.error('复制微信号失败:', error);
				uni.showToast({
					title: '复制失败',
					icon: 'none'
				});
			}
		});
	};

	// 切换收藏状态
	const toggleCollect = async () => {
		if (!skillsCloudObj) {
			uni.showToast({
				title: '服务未初始化',
				icon: 'none'
			});
			return;
		}

		try {
			if (isCollected.value) {
				// 取消收藏
				const result = await skills().uncollectSkill(skillId.value);
				if (result.errCode === 0) {
					isCollected.value = false;
					uni.showToast({
						title: '已取消收藏',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: result.errMsg || '取消收藏失败',
						icon: 'none'
					});
				}
			} else {
				// 收藏
				const result = await skills().collectSkill(skillId.value);
				if (result.errCode === 0) {
					isCollected.value = true;
					uni.showToast({
						title: '已收藏',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: result.errMsg || '收藏失败',
						icon: 'none'
					});
				}
			}
		} catch (error) {
			console.error('收藏操作失败:', error);
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		}
	};

	// 分享技能
	const shareSkill = () => {
		uni.share({
			provider: 'weixin',
			scene: 'WXSceneSession',
			type: 0,
			href: `pages/skills/skill-detail?id=${skillId.value}`,
			title: skillDetail.title,
			summary: skillDetail.description,
			imageUrl: skillDetail.images && skillDetail.images[0] ? skillDetail.images[0] : '',
			success: () => {
				uni.showToast({
					title: '分享成功',
					icon: 'success'
				});
			},
			fail: (error) => {
				console.error('分享失败:', error);
				// 降级处理：复制链接
				const shareText = `${skillDetail.title} - ${skillDetail.description}`;
				uni.setClipboardData({
					data: shareText,
					success: () => {
						uni.showToast({
							title: '内容已复制到剪贴板',
							icon: 'success'
						});
					}
				});
			}
		});
	};

	// 跳转到技能详情
	const goToSkillDetail = (id) => {
		uni.navigateTo({
			url: `/pages/skills/skill-detail?id=${id}`
		});
	};

	// 检查收藏状态 - 暂时禁用，避免报错
	const checkCollectStatus = async () => {
		// 暂时注释掉收藏状态检查，避免云对象方法调用错误
		console.log('收藏状态检查已暂时禁用');
		return;
		
		// if (!skillsCloudObj || !skillId.value) {
		// 	return;
		// }

		// try {
		// 	const result = await skillsCloudObj.isSkillCollected(skillId.value);
		// 	if (result.errCode === 0) {
		// 		isCollected.value = result.data.isCollected;
		// 	}
		// } catch (error) {
		// 	console.error('检查收藏状态失败:', error);
		// }
	};

	// 页面挂载时初始化
	onMounted(() => {
		console.log('页面挂载，开始初始化...');

		// 延迟一下确保 skillId 已经通过 onLoad 设置
		setTimeout(() => {
			if (skillId.value) {
				console.log('开始加载技能详情...');
				loadSkillDetail();
				// 暂时不检查收藏状态，避免报错
				// checkCollectStatus();
			} else {
				console.log('技能ID缺失，停止加载');
				isLoading.value = false;
			}
		}, 100);
	});
</script>

<style scoped>
	.container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 120rpx;
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 400rpx;
	}

	/* 轮播图区域 */
	.banner-section {
		width: 100%;
		height: 400rpx;
		background-color: white;
	}

	.swiper-box {
		width: 100%;
		height: 100%;
	}

	.banner-image {
		width: 100%;
		height: 100%;
	}

	/* 技能信息区域 */
	.info-section {
		background-color: white;
		margin: 20rpx 0;
		padding: 30rpx;
	}

	.skill-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20rpx;
	}

	.skill-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		flex: 1;
		margin-right: 20rpx;
	}

	.price-info {
		display: flex;
		align-items: baseline;
	}

	.price {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff4757;
	}

	.price-unit {
		font-size: 24rpx;
		color: #999;
		margin-left: 4rpx;
	}

	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 20rpx;
	}

	.tag {
		background-color: #f0f0f0;
		color: #666;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		margin-right: 16rpx;
		margin-bottom: 10rpx;
	}

	.skill-desc {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 20rpx;
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
		font-size: 28rpx;
		color: #333;
		margin-left: 8rpx;
	}

	.review-count {
		font-size: 24rpx;
		color: #999;
		margin-left: 8rpx;
	}

	.publish-time {
		font-size: 24rpx;
		color: #999;
	}

	/* 服务提供者区域 */
	.provider-section {
		background-color: white;
		margin: 20rpx 0;
		padding: 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.provider-info {
		display: flex;
		align-items: center;
	}

	.provider-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.provider-details {
		flex: 1;
	}

	.provider-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}

	.provider-location {
		display: flex;
		align-items: center;
		margin-bottom: 8rpx;
	}

	.location-text {
		font-size: 24rpx;
		color: #999;
		margin-left: 4rpx;
	}

	.provider-stats {
		display: flex;
		gap: 20rpx;
	}

	.stat {
		font-size: 24rpx;
		color: #999;
	}

	.contact-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
		font-size: 24rpx;
		color: #007aff;
	}

	/* 相关技能推荐 */
	.related-section {
		background-color: white;
		margin: 20rpx 0;
		padding: 30rpx;
	}

	.related-scroll {
		white-space: nowrap;
	}

	.related-item {
		display: inline-block;
		width: 200rpx;
		margin-right: 20rpx;
		vertical-align: top;
	}

	.related-image {
		width: 200rpx;
		height: 150rpx;
		border-radius: 12rpx;
		margin-bottom: 10rpx;
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
		font-weight: bold;
	}

	/* 底部操作栏 */
	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: white;
		padding: 20rpx 30rpx;
		border-top: 1rpx solid #eee;
		display: flex;
		align-items: center;
		gap: 20rpx;
		z-index: 100;
	}

	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16rpx;
		font-size: 24rpx;
		color: #666;
	}

	.contact-main-btn {
		flex: 1;
		background-color: #007aff;
		color: white;
		text-align: center;
		padding: 24rpx;
		border-radius: 50rpx;
		font-size: 28rpx;
		font-weight: bold;
	}

	/* 错误状态 */
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 400rpx;
		color: #999;
	}

	.error-text {
		font-size: 28rpx;
		margin: 20rpx 0;
	}

	.retry-btn {
		background-color: #007aff;
		color: white;
		border: none;
		padding: 20rpx 40rpx;
		border-radius: 50rpx;
		font-size: 28rpx;
	}

	/* 联系方式弹窗 */
	.contact-modal {
		background-color: white;
		border-radius: 20rpx 20rpx 0 0;
		padding: 40rpx 30rpx 60rpx 30rpx; /* 增加底部内边距 */
		min-height: 400rpx; /* 增加最小高度 */
		max-height: 80vh; /* 限制最大高度 */
		overflow-y: auto; /* 允许滚动 */
		position: relative;
		z-index: 1000; /* 确保在最上层 */
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx; /* 增加间距 */
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0; /* 添加分割线 */
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.close-btn {
		padding: 10rpx;
		border-radius: 50%;
		background-color: #f8f8f8;
	}

	.contact-options {
		display: flex;
		flex-direction: column;
		gap: 30rpx; /* 增加间距 */
		padding-bottom: 40rpx; /* 添加底部内边距 */
	}

	.contact-option {
		display: flex;
		align-items: center;
		padding: 40rpx 30rpx; /* 增加内边距 */
		background-color: #f8f8f8;
		border-radius: 20rpx; /* 增加圆角 */
		border: 2rpx solid transparent;
		transition: all 0.3s ease;
	}

	.contact-option:active {
		background-color: #e8e8e8;
		border-color: #007aff;
		transform: scale(0.98);
	}

	.option-icon {
		width: 80rpx; /* 增大图标 */
		height: 80rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx; /* 增加间距 */
		flex-shrink: 0; /* 防止压缩 */
	}

	.phone-icon {
		background-color: #4cd964;
	}

	.wechat-icon {
		background-color: #1aad19;
	}

	.option-info {
		flex: 1;
		min-width: 0; /* 允许文本截断 */
	}

	.option-title {
		font-size: 32rpx; /* 增大字体 */
		font-weight: bold;
		color: #333;
		margin-bottom: 12rpx; /* 增加间距 */
	}

	.option-desc {
		font-size: 28rpx; /* 增大字体 */
		color: #666;
		word-break: break-all; /* 允许换行 */
	}

	.no-contact {
		text-align: center;
		padding: 80rpx 0; /* 增加内边距 */
		color: #999;
		font-size: 32rpx; /* 增大字体 */
	}

	/* 弹窗遮罩层优化 */
	.uni-popup__wrapper-box {
		z-index: 999 !important;
	}

	.uni-popup {
		z-index: 999 !important;
	}

	/* 确保弹窗不被底部操作栏遮挡 */
	.bottom-bar {
		z-index: 100; /* 降低底部操作栏的层级 */
	}
</style>