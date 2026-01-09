<template>
	<view class="container">
		<!-- 用户信息区域 -->
		<view class="user-section">
			<view class="user-info">
				<!-- 已登录状态 -->
				<view v-if="isLoggedIn" class="user-profile">
					<view class="avatar-container" @tap="showProfileEditor">
						<image :src="userInfo.avatar || '/static/default.png'" class="user-avatar" mode="aspectFill">
						</image>
						<view class="avatar-edit-hint">
							<uni-icons type="camera" size="16" color="#fff"></uni-icons>
						</view>
					</view>
					<view class="user-details">
						<view class="user-name-row" @tap="showProfileEditor">
							<text class="user-name">{{ userInfo.nickname || '点击设置昵称' }}</text>
							<uni-icons type="right" size="14" color="#999"></uni-icons>
						</view>
						<text class="user-id">ID: {{ userInfo._id || 'unknown' }}</text>
						<text v-if="userInfo.building" class="user-building">{{ userInfo.building }}</text>
					</view>
				</view>

				<!-- 未登录状态 -->
				<view v-else class="login-section">
					<image src="/static/default.png" class="default-avatar"></image>
					<view class="login-info">
						<text class="login-title">欢迎使用 hxzyL</text>
						<text class="login-subtitle">登录后享受更多功能</text>
					</view>
					<button class="login-btn" @tap="handleLogin">
						<uni-icons type="person" size="16" color="#fff"></uni-icons>
						<text class="login-text">微信登录</text>
					</button>
				</view>
			</view>
		</view>

		<!-- 数据统计区域 -->
		<view v-if="isLoggedIn" class="stats-section">
			<view class="stats-grid">
				<view class="stats-item" @tap="goToMyPosts">
					<text class="stats-number">{{ userStats.postsCount || 0 }}</text>
					<text class="stats-label">我的帖子</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ userStats.likesCount || 0 }}</text>
					<text class="stats-label">获赞</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ userStats.commentsCount || 0 }}</text>
					<text class="stats-label">评论</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ userStats.favoritesCount || 0 }}</text>
					<text class="stats-label">收藏</text>
				</view>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-group">
				<view class="menu-item" @tap="goToMySkills">
					<view class="menu-icon">
						<uni-icons type="gear" size="20" color="#50C878"></uni-icons>
					</view>
					<text class="menu-text">我的技能</text>
					<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
				</view>
			</view>

			<!-- 登录后显示退出登录 -->
			<view v-if="isLoggedIn" class="menu-group logout-group">
				<view class="menu-item logout-item" @tap="handleLogout">
					<view class="menu-icon">
						<uni-icons type="loop" size="20" color="#FF4757"></uni-icons>
					</view>
					<text class="menu-text logout-text">退出登录</text>
				</view>
			</view>
		</view>

		<!-- 个人信息编辑弹窗 -->
		<uni-popup ref="profilePopup" type="center">
			<ProfileEditor title="编辑个人信息" :show-skip="false"
				:initial-data="{ nickname: userInfo.nickname, avatar: userInfo.avatar, building: userInfo.building }"
				@close="closeProfileEditor" @save="saveProfile" />
		</uni-popup>

		<!-- 首次设置提示弹窗 -->
		<uni-popup ref="welcomePopup" type="center" :mask-click="false">
			<view class="welcome-dialog">
				<view class="welcome-header">
					<uni-icons type="person-filled" size="40" color="#1DA1F2"></uni-icons>
					<text class="welcome-title">完善个人信息</text>
					<text class="welcome-subtitle">设置头像、昵称和楼号信息，让大家更好地认识你</text>
				</view>

				<ProfileEditor title="完善个人信息" :show-skip="true"
					:initial-data="{ nickname: userInfo.nickname, avatar: userInfo.avatar, building: userInfo.building }"
					@close="closeWelcomeDialog" @save="completeProfileSetup" @skip="skipProfileSetup" />
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onMounted
	} from 'vue'
	import ProfileEditor from '@/components/ProfileEditor.vue'

	// 响应式数据
	const userInfo = reactive({
		_id: '',
		nickname: '',
		avatar: '',
		building: '',
		openid: ''
	})

	const userStats = reactive({
		postsCount: 0,
		likesCount: 0,
		commentsCount: 0,
		favoritesCount: 0
	})

	const isLoggedIn = ref(false)
	const isFirstLogin = ref(false)

	// 弹窗引用
	const profilePopup = ref(null)
	const welcomePopup = ref(null)

	// 计算属性
	const hasCompleteProfile = computed(() => {
		return userInfo.nickname && userInfo.avatar && userInfo.building
	})

	// 方法
	const checkLoginStatus = async () => {
		// 检查本地存储的登录状态
		const token = uni.getStorageSync('token')
		const cachedUserInfo = uni.getStorageSync('userInfo')

		if (token && cachedUserInfo) {
			try {
				// 从云端获取最新的用户信息
				const loginObj = uniCloud.importObject('login')
				const result = await loginObj.getUserInfo(token)

				isLoggedIn.value = true
				Object.assign(userInfo, result.userInfo)

				// 更新本地存储
				uni.setStorageSync('userInfo', result.userInfo)

				// 检查是否需要完善信息
				if (!hasCompleteProfile.value) {
					isFirstLogin.value = true
					setTimeout(() => {
						showWelcomeDialog()
					}, 500)
				}
			} catch (error) {

				// token已过期或无效，清除本地数据
				uni.removeStorageSync('token')
				uni.removeStorageSync('userInfo')
				isLoggedIn.value = false
			}
		} else {
			isLoggedIn.value = false
		}
	}

	const handleLogin = async (e) => {
		try {
			uni.showLoading({
				title: '登录中...'
			})

			const {
				code
			} = await uni.login()

			if (!code) {
				throw new Error('获取登录凭证失败')
			}

			// 调用云函数登录
			const loginObj = uniCloud.importObject('login')
			const result = await loginObj.getUserProfile(code)


			if (result && result.token) {
				// 保存登录信息
				uni.setStorageSync('token', result.token)
				uni.setStorageSync('userInfo', result.userInfo)

				// 设置uniCloud全局token
				if (uniCloud) {
					uniCloud.setCustomData({
						token: result.token
					})
				}

				isLoggedIn.value = true
				Object.assign(userInfo, result.userInfo)

				uni.hideLoading()

				// 如果是新用户或信息不完整，显示欢迎弹窗
				if (result.isNewUser || !hasCompleteProfile.value) {
					isFirstLogin.value = true
					setTimeout(() => {
						showWelcomeDialog()
					}, 500)
				}

				uni.showToast({
					title: '登录成功',
					icon: 'success'
				})
			}
		} catch (error) {
			uni.hideLoading();
			uni.showToast({
				title: error.message || '登录失败',
				icon: 'none'
			});
		}
	}

	const handleLogout = () => {
		uni.showModal({
			title: '提示',
			content: '确定要退出登录吗？',
			success: (res) => {
				if (res.confirm) {
					// 清除登录状态
					uni.removeStorageSync('token')
					uni.removeStorageSync('userInfo')

					isLoggedIn.value = false
					Object.assign(userInfo, {
						_id: '',
						nickname: '',
						avatar: '',
						building: '',
						openid: ''
					})

					Object.assign(userStats, {
						postsCount: 0,
						likesCount: 0,
						commentsCount: 0,
						favoritesCount: 0
					})

					uni.showToast({
						title: '已退出登录',
						icon: 'success'
					})
				}
			}
		})
	}

	const showProfileEditor = () => {
		profilePopup.value?.open()
	}

	const closeProfileEditor = () => {
		profilePopup.value?.close()
	}

	const showWelcomeDialog = () => {
		welcomePopup.value?.open()
	}

	const closeWelcomeDialog = () => {
		welcomePopup.value?.close()
	}

	const saveProfile = async (profileData) => {
		try {
			uni.showLoading({
				title: '保存中...'
			})

			// 获取token
			const token = uni.getStorageSync('token')
			if (!token) {
				throw new Error('请先登录')
			}

			// 调用云函数保存用户信息
			const loginObj = uniCloud.importObject('login')
			const result = await loginObj.updateUserInfo({
				userInfo: profileData,
				token: token
			})

			// 更新本地用户信息
			Object.assign(userInfo, result.userInfo)

			// 更新本地存储
			uni.setStorageSync('userInfo', result.userInfo)

			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})

			closeProfileEditor()
		} catch (error) {
			uni.showToast({
				title: error.message || '保存失败，请重试',
				icon: 'none'
			})
		}
	}

	const completeProfileSetup = async (profileData) => {
		await saveProfile(profileData)
		closeWelcomeDialog()
		isFirstLogin.value = false
	}

	const skipProfileSetup = () => {
		closeWelcomeDialog()
		isFirstLogin.value = false
	}

	// 导航方法
	const goToMyPosts = () => {
		if (!isLoggedIn.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		uni.navigateTo({
			url: '/pages/community/my-posts'
		})
	}

	const goToMySkills = () => {
		if (!isLoggedIn.value) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		uni.navigateTo({
			url: '/pages/skills/my-skills'
		})
	}

	onMounted(() => {
		checkLoginStatus()
	})
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background: #f5f7fa;
	}

	/* 用户信息区域 */
	.user-section {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 60rpx 32rpx 40rpx;
		color: #fff;
	}

	.user-profile {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.avatar-container {
		position: relative;
	}

	.user-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
	}

	.avatar-edit-hint {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 36rpx;
		height: 36rpx;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-details {
		flex: 1;
	}

	.user-name-row {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-bottom: 8rpx;
	}

	.user-name {
		font-size: 36rpx;
		font-weight: 600;
		color: #fff;
	}

	.user-id {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 4rpx;
	}

	.user-building {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.7);
		background: rgba(255, 255, 255, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
		display: inline-block;
	}

	/* 未登录状态 */
	.login-section {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.default-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		opacity: 0.8;
	}

	.login-info {
		flex: 1;
	}

	.login-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #fff;
		display: block;
		margin-bottom: 8rpx;
	}

	.login-subtitle {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.login-btn {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 16rpx 24rpx;
		background: rgba(255, 255, 255, 0.2);
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 50rpx;
		color: #fff;
		font-size: 26rpx;
		font-weight: 500;
	}

	.login-text {
		color: #fff;
	}

	/* 数据统计区域 */
	.stats-section {
		margin: 0 32rpx;
		transform: translateY(-24rpx);
	}

	.stats-grid {
		display: flex;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.stats-item {
		flex: 1;
		padding: 32rpx 16rpx;
		text-align: center;
		border-right: 1rpx solid #f0f0f0;
		transition: background-color 0.2s;
	}

	.stats-item:last-child {
		border-right: none;
	}

	.stats-item:active {
		background: #f8f9fa;
	}

	.stats-number {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 8rpx;
	}

	.stats-label {
		font-size: 24rpx;
		color: #666;
	}

	/* 功能菜单 */
	.menu-section {
		padding: 32rpx;
	}

	.menu-group {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 24rpx;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 32rpx 24rpx;
		border-bottom: 1rpx solid #f5f5f5;
		transition: background-color 0.2s;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-item:active {
		background: #f8f9fa;
	}

	.menu-icon {
		width: 40rpx;
		height: 40rpx;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}

	.menu-text {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}

	.logout-group {
		margin-bottom: 0;
	}

	.logout-item {
		color: #FF4757;
	}

	.logout-text {
		color: #FF4757;
	}

	/* 欢迎弹窗 */
	.welcome-dialog {
		width: 640rpx;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.welcome-header {
		padding: 40rpx 32rpx 20rpx;
		text-align: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
	}

	.welcome-title {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		margin: 16rpx 0 12rpx;
	}

	.welcome-subtitle {
		font-size: 24rpx;
		opacity: 0.9;
		line-height: 1.4;
	}
</style>