<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<view class="nav-left" @tap="goBack">
				<t-icon name="chevron-left" size="24px" color="#fff"></t-icon>
			</view>
			<view class="nav-title">设置</view>
			<view class="nav-right"></view>
		</view>

		<!-- 设置列表 -->
		<scroll-view scroll-y class="settings-list">
			<!-- 个人信息 -->
			<view class="settings-group">
				<view class="group-header">个人信息</view>
				<view class="settings-item" @tap="goToProfile">
					<view class="item-left">
						<t-icon name="user" size="20px" color="#667eea"></t-icon>
						<text class="item-text">编辑资料</text>
					</view>
					<t-icon name="chevron-right" size="16px" color="#ccc"></t-icon>
				</view>
				<view class="settings-item" @tap="goToAvatar">
					<view class="item-left">
						<t-icon name="image" size="20px" color="#667eea"></t-icon>
						<text class="item-text">修改头像</text>
					</view>
					<view class="item-right">
						<image :src="userInfo.avatar" class="avatar-preview" mode="aspectFill"></image>
						<t-icon name="chevron-right" size="16px" color="#ccc"></t-icon>
					</view>
				</view>
			</view>

			<!-- 账号安全 -->
			<view class="settings-group">
				<view class="group-header">账号安全</view>
				<view class="settings-item" @tap="goToPhone">
					<view class="item-left">
						<t-icon name="mobile" size="20px" color="#00a870"></t-icon>
						<text class="item-text">手机号</text>
					</view>
					<view class="item-right">
						<text class="item-desc">{{ userInfo.phone || '未绑定' }}</text>
						<t-icon name="chevron-right" size="16px" color="#ccc"></t-icon>
					</view>
				</view>
				<view class="settings-item" @tap="goToPassword">
					<view class="item-left">
						<t-icon name="lock-on" size="20px" color="#00a870"></t-icon>
						<text class="item-text">修改密码</text>
					</view>
					<t-icon name="chevron-right" size="16px" color="#ccc"></t-icon>
				</view>
			</view>

			<!-- 通知设置 -->
			<view class="settings-group">
				<view class="group-header">通知设置</view>
				<view class="settings-item switch-item">
					<view class="item-left">
						<t-icon name="notification" size="20px" color="#ed7b2f"></t-icon>
						<text class="item-text">消息通知</text>
					</view>
					<t-switch v-model="settings.messageNotification" @change="onSettingChange('messageNotification')"></t-switch>
				</view>
				<view class="settings-item switch-item">
					<view class="item-left">
						<t-icon name="comment" size="20px" color="#ed7b2f"></t-icon>
						<text class="item-text">评论提醒</text>
					</view>
					<t-switch v-model="settings.commentNotification" @change="onSettingChange('commentNotification')"></t-switch>
				</view>
				<view class="settings-item switch-item">
					<view class="item-left">
						<t-icon name="heart" size="20px" color="#ed7b2f"></t-icon>
						<text class="item-text">点赞提醒</text>
					</view>
					<t-switch v-model="settings.likeNotification" @change="onSettingChange('likeNotification')"></t-switch>
				</view>
			</view>

			<!-- 通用设置 -->
			<view class="settings-group">
				<view class="group-header">通用设置</view>
				<view class="settings-item switch-item">
					<view class="item-left">
						<t-icon name="mode-dark" size="20px" color="#666"></t-icon>
						<text class="item-text">深色模式</text>
					</view>
					<t-switch v-model="settings.darkMode" @change="onSettingChange('darkMode')"></t-switch>
				</view>
				<view class="settings-item" @tap="clearCache">
					<view class="item-left">
						<t-icon name="clear" size="20px" color="#666"></t-icon>
						<text class="item-text">清除缓存</text>
					</view>
					<view class="item-right">
						<text class="item-desc">{{ cacheSize }}</text>
						<t-icon name="chevron-right" size="16px" color="#ccc"></t-icon>
					</view>
				</view>
				<view class="settings-item" @tap="checkUpdate">
					<view class="item-left">
						<t-icon name="refresh" size="20px" color="#666"></t-icon>
						<text class="item-text">检查更新</text>
					</view>
					<view class="item-right">
						<text class="item-desc">当前版本 1.0.0</text>
						<t-icon name="chevron-right" size="16px" color="#ccc"></t-icon>
					</view>
				</view>
			</view>

			<!-- 关于 -->
			<view class="settings-group">
				<view class="group-header">关于</view>
				<view class="settings-item" @tap="goToAbout">
					<view class="item-left">
						<t-icon name="info-circle" size="20px" color="#999"></t-icon>
						<text class="item-text">关于我们</text>
					</view>
					<t-icon name="chevron-right" size="16px" color="#ccc"></t-icon>
				</view>
				<view class="settings-item" @tap="goToFeedback">
					<view class="item-left">
						<t-icon name="bulb" size="20px" color="#999"></t-icon>
						<text class="item-text">意见反馈</text>
					</view>
					<t-icon name="chevron-right" size="16px" color="#ccc"></t-icon>
				</view>
				<view class="settings-item" @tap="goToPrivacy">
					<view class="item-left">
						<t-icon name="shield" size="20px" color="#999"></t-icon>
						<text class="item-text">隐私政策</text>
					</view>
					<t-icon name="chevron-right" size="16px" color="#ccc"></t-icon>
				</view>
			</view>

			<!-- 底部按钮 -->
			<view class="bottom-actions">
				<t-button
					theme="danger"
					size="large"
					variant="outline"
					block
					@tap="handleLogout">
					退出登录
				</t-button>
			</view>
		</scroll-view>

		<!-- 确认退出弹窗 -->
		<t-dialog
			v-model:visible="logoutDialogVisible"
			title="确认退出"
			content="确定要退出登录吗？"
			confirm-btn="退出"
			cancel-btn="取消"
			@confirm="confirmLogout">
		</t-dialog>

		<!-- 提示消息 -->
		<t-toast v-model:visible="toastVisible" :content="toastMessage"></t-toast>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue';
	import TIcon from 'tdesign-miniprogram/icon/icon';
	import TButton from 'tdesign-miniprogram/button/button';
	import TSwitch from 'tdesign-miniprogram/switch/switch';
	import TToast from 'tdesign-miniprogram/toast/toast';
	import TDialog from 'tdesign-miniprogram/dialog/dialog';

	const logoutDialogVisible = ref(false);
	const toastVisible = ref(false);
	const toastMessage = ref('');
	const cacheSize = ref('0MB');

	// 用户信息
	const userInfo = reactive({
		nickname: '',
		avatar: '',
		phone: '',
		building: ''
	});

	// 设置项
	const settings = reactive({
		messageNotification: true,
		commentNotification: true,
		likeNotification: true,
		darkMode: false
	});

	// 云对象实例
	let loginObj = null;

	// 初始化云对象
	const initCloudObj = () => {
		try {
			loginObj = uniCloud.importObject('login');
		} catch (error) {
			console.error('云对象初始化失败:', error);
		}
	};

	// 获取用户信息
	const getUserInfo = async () => {
		if (!loginObj) return;

		try {
			const result = await loginObj.getUserInfo();
			if (result.errCode === 0 && result.data) {
				Object.assign(userInfo, result.data);
			}
		} catch (error) {
			console.error('获取用户信息失败:', error);
		}
	};

	// 获取缓存大小
	const getCacheSize = () => {
		try {
			const res = uni.getStorageInfoSync();
			const sizeKB = res.currentSize / 1024;
			cacheSize.value = sizeKB < 1024 ? `${sizeKB.toFixed(2)}KB` : `${(sizeKB / 1024).toFixed(2)}MB`;
		} catch (error) {
			console.error('获取缓存大小失败:', error);
		}
	};

	// 设置变更
	const onSettingChange = (key) => {
		showToast('设置已保存');
		// TODO: 保存到数据库
		console.log(key, settings[key]);
	};

	// 跳转编辑资料
	const goToProfile = () => {
		uni.navigateTo({
			url: '/pages/me/profile'
		});
	};

	// 跳转修改头像
	const goToAvatar = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			success: (res) => {
				// TODO: 上传头像
				showToast('头像更新功能开发中');
			}
		});
	};

	// 跳转手机号
	const goToPhone = () => {
		showToast('手机号绑定功能开发中');
	};

	// 跳转密码
	const goToPassword = () => {
		showToast('密码修改功能开发中');
	};

	// 清除缓存
	const clearCache = () => {
		uni.showModal({
			title: '提示',
			content: '确定要清除缓存吗？',
			success: (res) => {
				if (res.confirm) {
					try {
						uni.clearStorageSync();
						cacheSize.value = '0KB';
						showToast('缓存已清除');
					} catch (error) {
						console.error('清除缓存失败:', error);
						showToast('清除失败');
					}
				}
			}
		});
	};

	// 检查更新
	const checkUpdate = () => {
		uni.showLoading({
			title: '检查中...'
		});

		setTimeout(() => {
			uni.hideLoading();
			showToast('已是最新版本');
		}, 1000);
	};

	// 关于我们
	const goToAbout = () => {
		uni.navigateTo({
			url: '/pages/about/about'
		});
	};

	// 意见反馈
	const goToFeedback = () => {
		uni.navigateTo({
			url: '/pages/feedback/feedback'
		});
	};

	// 隐私政策
	const goToPrivacy = () => {
		uni.navigateTo({
			url: '/pages/privacy/privacy'
		});
	};

	// 退出登录
	const handleLogout = () => {
		logoutDialogVisible.value = true;
	};

	// 确认退出
	const confirmLogout = async () => {
		try {
			// 清除本地存储
			uni.removeStorageSync('token');
			uni.removeStorageSync('userInfo');

			// 跳转到登录页
			uni.reLaunch({
				url: '/pages/me/me'
			});

			showToast('已退出登录');
		} catch (error) {
			console.error('退出登录失败:', error);
			showToast('退出失败，请重试');
		}
	};

	// 显示提示
	const showToast = (message) => {
		toastMessage.value = message;
		toastVisible.value = true;
	};

	// 返回
	const goBack = () => {
		uni.navigateBack();
	};

	onMounted(() => {
		initCloudObj();
		getUserInfo();
		getCacheSize();
	});
</script>

<style lang="scss" scoped>
	.container {
		background-color: #f3f3f3;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 导航栏样式 */
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20rpx 30rpx;
		height: 88rpx;
		box-shadow: 0 2rpx 12rpx rgba(102, 126, 234, 0.15);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
	}

	.nav-left,
	.nav-right {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #ffffff;
	}

	/* 设置列表 */
	.settings-list {
		flex: 1;
		margin-top: 108rpx;
		padding: 20rpx;
		padding-bottom: 200rpx;
		height: calc(100vh - 108rpx);
	}

	/* 设置分组 */
	.settings-group {
		background-color: #ffffff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.group-header {
		padding: 30rpx 30rpx 20rpx;
		font-size: 26rpx;
		font-weight: 600;
		color: #333333;
	}

	/* 设置项 */
	.settings-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		transition: background-color 0.3s;
	}

	.settings-item:last-child {
		border-bottom: none;
	}

	.settings-item:active {
		background-color: #f8f8f8;
	}

	.item-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
		flex: 1;
	}

	.item-text {
		font-size: 28rpx;
		color: #333333;
	}

	.item-right {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.item-desc {
		font-size: 24rpx;
		color: #999999;
	}

	.avatar-preview {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
	}

	/* 开关项 */
	.switch-item {
		justify-content: space-between;
	}

	/* 底部按钮 */
	.bottom-actions {
		padding: 40rpx 20rpx;
	}
</style>
