<template>
	<view class="container">
		<!-- 个人信息区域 -->
		<view class="profile-section">
			<view class="profile-header">
				<image :src="userInfo.avatar" class="user-avatar" mode="aspectFill" @tap="changeAvatar"></image>
				<view class="user-info">
					<text class="username">{{ userInfo.nickname || '点击登录' }}</text>
					<text class="user-desc">{{ userInfo.signature || '这个人很懒，什么都没留下' }}</text>
					<view class="user-stats">
						<view class="stat-item">
							<text class="stat-number">{{ userInfo.postCount || 0 }}</text>
							<text class="stat-label">帖子</text>
						</view>
						<view class="stat-item">
							<text class="stat-number">{{ userInfo.followCount || 0 }}</text>
							<text class="stat-label">关注</text>
						</view>
						<view class="stat-item">
							<text class="stat-number">{{ userInfo.fanCount || 0 }}</text>
							<text class="stat-label">粉丝</text>
						</view>
					</view>
				</view>
				<view class="login-btn" @tap="handleLogin" v-if="!userInfo.isLogin">
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 快捷功能区域 -->
		<view class="quick-actions">
			<view class="action-item" @tap="goToMyPosts">
				<view class="action-icon">
					<uni-icons type="compose" size="20" color="#4A90E2"></uni-icons>
				</view>
				<text class="action-text">我的帖子</text>
				<view class="action-arrow">
					<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
				</view>
			</view>
			<view class="action-item" @tap="goToMyLikes">
				<view class="action-icon">
					<uni-icons type="heart" size="20" color="#FF6B6B"></uni-icons>
				</view>
				<text class="action-text">我的点赞</text>
				<view class="action-arrow">
					<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
				</view>
			</view>
			<view class="action-item" @tap="goToMyComments">
				<view class="action-icon">
					<uni-icons type="chatbubble" size="20" color="#50C878"></uni-icons>
				</view>
				<text class="action-text">我的评论</text>
				<view class="action-arrow">
					<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
				</view>
			</view>
			<view class="action-item" @tap="goToMyCollections">
				<view class="action-icon">
					<uni-icons type="star" size="20" color="#FFD700"></uni-icons>
				</view>
				<text class="action-text">我的收藏</text>
				<view class="action-arrow">
					<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 功能菜单区域 -->
		<view class="menu-section">
			<view class="menu-group">
				<view class="menu-item" @tap="goToSettings">
					<view class="menu-icon">
						<uni-icons type="gear" size="20" color="#666"></uni-icons>
					</view>
					<text class="menu-text">设置</text>
					<view class="menu-arrow">
						<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
					</view>
				</view>
				<view class="menu-item" @tap="goToHelp">
					<view class="menu-icon">
						<uni-icons type="help" size="20" color="#666"></uni-icons>
					</view>
					<text class="menu-text">帮助与反馈</text>
					<view class="menu-arrow">
						<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
					</view>
				</view>
				<view class="menu-item" @tap="goToAbout">
					<view class="menu-icon">
						<uni-icons type="info" size="20" color="#666"></uni-icons>
					</view>
					<text class="menu-text">关于我们</text>
					<view class="menu-arrow">
						<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
					</view>
				</view>
			</view>

			<view class="menu-group">
				<view class="menu-item" @tap="goToPrivacy">
					<view class="menu-icon">
						<uni-icons type="locked" size="20" color="#666"></uni-icons>
					</view>
					<text class="menu-text">隐私政策</text>
					<view class="menu-arrow">
						<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
					</view>
				</view>
				<view class="menu-item" @tap="goToTerms">
					<view class="menu-icon">
						<uni-icons type="paperplane" size="20" color="#666"></uni-icons>
					</view>
					<text class="menu-text">用户协议</text>
					<view class="menu-arrow">
						<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
					</view>
				</view>
			</view>

			<view class="menu-group" v-if="userInfo.isLogin">
				<view class="menu-item logout-item" @tap="handleLogout">
					<view class="menu-icon">
						<uni-icons type="loop" size="20" color="#ff4757"></uni-icons>
					</view>
					<text class="menu-text logout-text">退出登录</text>
				</view>
			</view>
		</view>

		<!-- 版本信息 -->
		<view class="version-info">
			<text class="version-text">版本号: {{ appVersion }}</text>
		</view>

		<!-- 登录弹窗 -->
		<uni-popup ref="loginPopup" type="center" :mask-click="false">
			<view class="login-modal">
				<view class="modal-header">
					<text class="modal-title">登录</text>
					<view class="close-btn" @tap="closeLogin">
						<uni-icons type="close" size="20" color="#999"></uni-icons>
					</view>
				</view>
				<view class="modal-content">
					<view class="login-avatar">
						<image src="https://via.placeholder.com/120x120/4A90E2/FFFFFF?text=Login" class="login-avatar-img"></image>
					</view>
					<text class="login-desc">登录后可以发布帖子、评论互动</text>
					<button class="wechat-login-btn" @tap="wechatLogin" :loading="isLogging">
						<uni-icons type="weixin" size="20" color="white" style="margin-right: 12rpx;"></uni-icons>
						微信登录
					</button>
				</view>
			</view>
		</uni-popup>

		<!-- 头像选择弹窗 -->
		<uni-popup ref="avatarPopup" type="bottom">
			<view class="avatar-modal">
				<view class="modal-header">
					<text class="modal-title">更换头像</text>
				</view>
				<view class="avatar-options">
					<view class="avatar-option" @tap="chooseAvatar('camera')">
						<uni-icons type="camera" size="24" color="#4A90E2"></uni-icons>
						<text class="option-text">拍照</text>
					</view>
					<view class="avatar-option" @tap="chooseAvatar('album')">
						<uni-icons type="image" size="24" color="#50C878"></uni-icons>
						<text class="option-text">从相册选择</text>
					</view>
				</view>
				<view class="cancel-btn" @tap="closeAvatarModal">
					<text>取消</text>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		onMounted,
		reactive,
		ref
	} from 'vue';

	const loginPopup = ref(null);
	const avatarPopup = ref(null);
	const isLogging = ref(false);
	const appVersion = ref('1.0.0');

	// 用户信息
	const userInfo = reactive({
		isLogin: false,
		nickname: '',
		avatar: 'https://via.placeholder.com/120x120/999/FFFFFF?text=未登录',
		signature: '',
		postCount: 0,
		followCount: 0,
		fanCount: 0,
		openid: ''
	});

	// 处理登录
	const handleLogin = () => {
		if (userInfo.isLogin) {
			return;
		}
		loginPopup.value.open();
	};

	// 微信登录
	const wechatLogin = async () => {
		if (isLogging.value) {
			return;
		}
		
		isLogging.value = true;
		
		try {
			// 调用微信登录
			const loginRes = await new Promise((resolve, reject) => {
				uni.login({
					provider: 'weixin',
					success: resolve,
					fail: reject
				});
			});

			console.log('微信登录结果:', loginRes);

			// 调用云函数获取用户信息
			const login = uniCloud.importObject('Login');
			const openid = await login.getUniID(loginRes.code);
			
			console.log('获取到openid:', openid);

			// 获取用户信息
			const userProfile = await new Promise((resolve, reject) => {
				uni.getUserProfile({
					desc: '用于完善用户资料',
					success: resolve,
					fail: reject
				});
			});

			console.log('用户信息:', userProfile);

			// 更新用户状态
			userInfo.isLogin = true;
			userInfo.nickname = userProfile.userInfo.nickName;
			userInfo.avatar = userProfile.userInfo.avatarUrl;
			userInfo.openid = openid;
			userInfo.signature = '新用户，请多关照';
			userInfo.postCount = Math.floor(Math.random() * 10);
			userInfo.followCount = Math.floor(Math.random() * 50);
			userInfo.fanCount = Math.floor(Math.random() * 30);

			// 保存用户信息到本地
			uni.setStorageSync('userInfo', userInfo);

			uni.showToast({
				title: '登录成功',
				icon: 'success'
			});

			closeLogin();

		} catch (error) {
			console.error('登录失败:', error);
			uni.showToast({
				title: '登录失败',
				icon: 'none'
			});
		} finally {
			isLogging.value = false;
		}
	};

	// 关闭登录弹窗
	const closeLogin = () => {
		loginPopup.value.close();
	};

	// 退出登录
	const handleLogout = () => {
		uni.showModal({
			title: '提示',
			content: '确定要退出登录吗？',
			success: (res) => {
				if (res.confirm) {
					// 清除用户信息
					userInfo.isLogin = false;
					userInfo.nickname = '';
					userInfo.avatar = 'https://via.placeholder.com/120x120/999/FFFFFF?text=未登录';
					userInfo.signature = '';
					userInfo.postCount = 0;
					userInfo.followCount = 0;
					userInfo.fanCount = 0;
					userInfo.openid = '';

					// 清除本地存储
					uni.removeStorageSync('userInfo');

					uni.showToast({
						title: '已退出登录',
						icon: 'success'
					});
				}
			}
		});
	};

	// 更换头像
	const changeAvatar = () => {
		if (!userInfo.isLogin) {
			handleLogin();
			return;
		}
		avatarPopup.value.open();
	};

	// 选择头像
	const chooseAvatar = (type) => {
		const sourceType = type === 'camera' ? ['camera'] : ['album'];
		
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: sourceType,
			success: (res) => {
				userInfo.avatar = res.tempFilePaths[0];
				// 实际项目中这里应该上传到服务器
				uni.showToast({
					title: '头像更新成功',
					icon: 'success'
				});
				closeAvatarModal();
			},
			fail: (err) => {
				console.error('选择头像失败:', err);
				uni.showToast({
					title: '选择头像失败',
					icon: 'none'
				});
			}
		});
	};

	// 关闭头像选择弹窗
	const closeAvatarModal = () => {
		avatarPopup.value.close();
	};

	// 跳转到我的帖子
	const goToMyPosts = () => {
		if (!userInfo.isLogin) {
			handleLogin();
			return;
		}
		uni.showToast({
			title: '我的帖子功能开发中',
			icon: 'none'
		});
	};

	// 跳转到我的点赞
	const goToMyLikes = () => {
		if (!userInfo.isLogin) {
			handleLogin();
			return;
		}
		uni.showToast({
			title: '我的点赞功能开发中',
			icon: 'none'
		});
	};

	// 跳转到我的评论
	const goToMyComments = () => {
		if (!userInfo.isLogin) {
			handleLogin();
			return;
		}
		uni.showToast({
			title: '我的评论功能开发中',
			icon: 'none'
		});
	};

	// 跳转到我的收藏
	const goToMyCollections = () => {
		if (!userInfo.isLogin) {
			handleLogin();
			return;
		}
		uni.showToast({
			title: '我的收藏功能开发中',
			icon: 'none'
		});
	};

	// 跳转到设置
	const goToSettings = () => {
		uni.showToast({
			title: '设置功能开发中',
			icon: 'none'
		});
	};

	// 跳转到帮助
	const goToHelp = () => {
		uni.showToast({
			title: '帮助与反馈功能开发中',
			icon: 'none'
		});
	};

	// 跳转到关于我们
	const goToAbout = () => {
		uni.showToast({
			title: '关于我们功能开发中',
			icon: 'none'
		});
	};

	// 跳转到隐私政策
	const goToPrivacy = () => {
		uni.showToast({
			title: '隐私政策功能开发中',
			icon: 'none'
		});
	};

	// 跳转到用户协议
	const goToTerms = () => {
		uni.showToast({
			title: '用户协议功能开发中',
			icon: 'none'
		});
	};

	// 加载用户信息
	const loadUserInfo = () => {
		try {
			const savedUserInfo = uni.getStorageSync('userInfo');
			if (savedUserInfo && savedUserInfo.isLogin) {
				Object.assign(userInfo, savedUserInfo);
			}
		} catch (e) {
			console.error('加载用户信息失败:', e);
		}
	};

	onMounted(() => {
		console.log('我的页面加载完成');
		loadUserInfo();
	});
</script>

<style scoped>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	/* 个人信息区域样式 */
	.profile-section {
		background-color: white;
		padding: 40rpx 24rpx 24rpx;
		margin-bottom: 20rpx;
	}

	.profile-header {
		display: flex;
		align-items: center;
	}

	.user-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		margin-right: 24rpx;
		border: 4rpx solid #f0f0f0;
	}

	.user-info {
		flex: 1;
	}

	.username {
		font-size: 36rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 12rpx;
		display: block;
	}

	.user-desc {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
		display: block;
	}

	.user-stats {
		display: flex;
		align-items: center;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 40rpx;
	}

	.stat-number {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.stat-label {
		font-size: 22rpx;
		color: #999;
	}

	.login-btn {
		padding: 12rpx;
	}

	/* 快捷功能区域样式 */
	.quick-actions {
		background-color: white;
		margin-bottom: 20rpx;
		border-radius: 16rpx;
		margin: 0 20rpx 20rpx;
		overflow: hidden;
	}

	.action-item {
		display: flex;
		align-items: center;
		padding: 32rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.action-item:last-child {
		border-bottom: none;
	}

	.action-icon {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: #f8f8f8;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}

	.action-text {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}

	.action-arrow {
		margin-left: 20rpx;
	}

	/* 功能菜单区域样式 */
	.menu-section {
		padding: 0 20rpx;
	}

	.menu-group {
		background-color: white;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 32rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-icon {
		margin-right: 24rpx;
	}

	.menu-text {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}

	.menu-arrow {
		margin-left: 20rpx;
	}

	.logout-item {
		justify-content: center;
	}

	.logout-text {
		color: #ff4757;
		text-align: center;
		flex: none;
	}

	/* 版本信息样式 */
	.version-info {
		text-align: center;
		padding: 40rpx 0;
	}

	.version-text {
		font-size: 22rpx;
		color: #999;
	}

	/* 登录弹窗样式 */
	.login-modal {
		width: 600rpx;
		background-color: white;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.modal-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.close-btn {
		padding: 8rpx;
	}

	.modal-content {
		padding: 60rpx 40rpx;
		text-align: center;
	}

	.login-avatar {
		margin-bottom: 40rpx;
	}

	.login-avatar-img {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
	}

	.login-desc {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 60rpx;
		display: block;
	}

	.wechat-login-btn {
		width: 100%;
		height: 80rpx;
		background-color: #07c160;
		color: white;
		border: none;
		border-radius: 40rpx;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 头像选择弹窗样式 */
	.avatar-modal {
		background-color: white;
		border-radius: 20rpx 20rpx 0 0;
		padding: 40rpx 0;
	}

	.avatar-options {
		display: flex;
		justify-content: space-around;
		padding: 40rpx 0;
	}

	.avatar-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx;
	}

	.option-text {
		font-size: 24rpx;
		color: #333;
		margin-top: 16rpx;
	}

	.cancel-btn {
		text-align: center;
		padding: 32rpx;
		border-top: 1rpx solid #f0f0f0;
		font-size: 28rpx;
		color: #666;
	}
</style>