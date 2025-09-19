<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-section">
      <view class="user-info">
        <!-- 已登录状态 -->
        <view v-if="isLoggedIn" class="user-profile">
          <view class="avatar-container" @tap="showProfileEditor">
            <image 
              :src="userInfo.avatar || '/static/default-avatar.png'" 
              class="user-avatar"
              mode="aspectFill"
            ></image>
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
          </view>
        </view>
        
        <!-- 未登录状态 -->
        <view v-else class="login-section">
          <image src="/static/default-avatar.png" class="default-avatar"></image>
          <view class="login-info">
            <text class="login-title">欢迎使用 hxzyL</text>
            <text class="login-subtitle">登录后享受更多功能</text>
          </view>
          <button class="login-btn" @tap="handleLogin">
            <uni-icons type="weixin" size="18" color="#fff"></uni-icons>
            <text class="login-text">微信登录</text>
          </button>
        </view>
      </view>
    </view>


	<view class="quick-actions">
			<view class="actions-grid">
				<view class="grid-item" @tap="goToMyPosts">
					<view class="grid-icon">
						<uni-icons type="compose" size="20" color="#4A90E2"></uni-icons>
					</view>
					<text class="grid-text">我的帖子</text>
				</view>
				<view class="grid-item" @tap="goToMyLikes">
					<view class="grid-icon">
						<uni-icons type="heart" size="20" color="#FF6B6B"></uni-icons>
					</view>
					<text class="grid-text">我的点赞</text>
				</view>
				<view class="grid-item" @tap="goToMyComments">
					<view class="grid-icon">
						<uni-icons type="chatbubble" size="20" color="#50C878"></uni-icons>
					</view>
					<text class="grid-text">我的评论</text>
				</view>
				<view class="grid-item" @tap="goToMyCollections">
					<view class="grid-icon">
						<uni-icons type="star" size="20" color="#FFD700"></uni-icons>
					</view>
					<text class="grid-text">我的收藏</text>
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
        
        <view class="menu-item" @tap="goToSettings">
          <view class="menu-icon">
            <uni-icons type="settings" size="20" color="#FF6B6B"></uni-icons>
          </view>
          <text class="menu-text">设置</text>
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
      <ProfileEditor
        title="编辑个人信息"
        :show-skip="false"
        :initial-data="{ nickname: userInfo.nickname, avatar: userInfo.avatar }"
        @close="closeProfileEditor"
        @save="saveProfile"
      />
    </uni-popup>

    <!-- 首次设置提示弹窗 -->
    <uni-popup ref="welcomePopup" type="center" :mask-click="false">
      <view class="welcome-dialog">
        <view class="welcome-header">
          <uni-icons type="person-filled" size="40" color="#1DA1F2"></uni-icons>
          <text class="welcome-title">完善个人信息</text>
          <text class="welcome-subtitle">设置头像和昵称，让大家更好地认识你</text>
        </view>
        
        <ProfileEditor
          title="完善个人信息"
          :show-skip="true"
          :initial-data="{ nickname: userInfo.nickname, avatar: userInfo.avatar }"
          @close="closeWelcomeDialog"
          @save="completeProfileSetup"
          @skip="skipProfileSetup"
        />
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ProfileEditor from '@/components/ProfileEditor.vue'

// 响应式数据
const userInfo = reactive({
  _id: '',
  nickname: '',
  avatar: '',
  openid: ''
})

const isLoggedIn = ref(false)
const isFirstLogin = ref(false)

// 弹窗引用
const profilePopup = ref(null)
const welcomePopup = ref(null)

// 计算属性
const hasCompleteProfile = computed(() => {
  return userInfo.nickname && userInfo.avatar
})

// 方法
const checkLoginStatus = () => {
  // 检查本地存储的登录状态
  const token = uni.getStorageSync('token')
  const cachedUserInfo = uni.getStorageSync('userInfo')
  
  if (token && cachedUserInfo) {
    isLoggedIn.value = true
    Object.assign(userInfo, cachedUserInfo)
    
    // 检查是否需要完善信息
    if (!hasCompleteProfile.value) {
      isFirstLogin.value = true
      setTimeout(() => {
        showWelcomeDialog()
      }, 500)
    }
  }
}

const handleLogin = async () => {
  try {
    // 微信登录
    const loginRes = await uni.login({
      provider: 'weixin'
    })
    
    if (loginRes.errMsg === 'login:ok') {
      // 这里应该调用后端接口验证登录
      console.log('登录成功，code:', loginRes.code)
      
      // 模拟登录成功
      const mockUserInfo = {
        _id: 'user_' + Date.now(),
        openid: 'mock_openid',
        nickname: '',
        avatar: ''
      }
      
      // 保存登录状态
      uni.setStorageSync('token', 'mock_token')
      uni.setStorageSync('userInfo', mockUserInfo)
      
      isLoggedIn.value = true
      Object.assign(userInfo, mockUserInfo)
      
      // 首次登录显示完善信息弹窗
      isFirstLogin.value = true
      setTimeout(() => {
        showWelcomeDialog()
      }, 500)
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
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
          openid: ''
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
    // 这里应该调用后端接口保存用户信息
    console.log('保存用户信息:', profileData)
    
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新本地用户信息
    userInfo.nickname = profileData.nickname
    userInfo.avatar = profileData.avatar
    
    // 更新本地存储
    uni.setStorageSync('userInfo', userInfo)
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    closeProfileEditor()
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
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

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/settings/settings'
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

/* 功能菜单 */
.menu-section {
  padding: 32rpx;
}

.menu-group {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f2f5;
  transition: background-color 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f8f9fc;
}

.menu-icon {
  width: 56rpx;
  height: 56rpx;
  background: #f8f9fc;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.logout-group {
  margin-top: 32rpx;
}

.logout-item {
  justify-content: center;
}

.logout-item .menu-icon {
  background: #fff5f5;
}

.logout-text {
  color: #FF4757;
  text-align: center;
  flex: none;
}

/* 首次设置弹窗样式 */
.welcome-dialog {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 48rpx 32rpx 0;
  text-align: center;
}

.welcome-header {
  margin-bottom: 32rpx;
}

.welcome-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin: 16rpx 0 8rpx;
}

.welcome-subtitle {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}


/* 快捷功能区域样式 */
	.quick-actions {
		background-color: white;
		margin-bottom: 20rpx;
		border-radius: 16rpx;
		margin: 0 20rpx 20rpx;
		overflow: hidden;
		padding: 20rpx;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 20rpx;
	}

	.grid-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 30rpx 20rpx;
		border-radius: 12rpx;
		background-color: #fafafa;
		transition: background-color 0.2s;
	}

	.grid-item:active {
		background-color: #f0f0f0;
	}

	.grid-icon {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.grid-text {
		font-size: 24rpx;
		color: #333;
		text-align: center;
	}

	/* 保留原有的 action-item 样式以防其他地方使用 */
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


</style>