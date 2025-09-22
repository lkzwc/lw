<template>
  <view class="profile-editor">
    <view class="editor-content">
      <!-- 头像编辑 -->
      <view class="editor-item">
        <view class="avatar-editor">
          <view class="avatar-upload-hint">
            <!-- 微信头像选择按钮 -->
            <button 
              class="avatar-choose-btn" 
              open-type="chooseAvatar" 
              @chooseavatar="onChooseAvatar"
            >
               <image 
            :src="formData.avatar || '/static/default.png'" 
            class="edit-avatar"
            mode="aspectFill"
          ></image>
            </button>
          </view>
        </view>
      </view>

      
      <!-- 昵称编辑 -->
      <view class="editor-item">
        <!-- 微信昵称输入框 -->
        <input 
          v-model="formData.nickname"
          class="nickname-input"
          type="nickname"
          placeholder="请输入昵称"
          maxlength="20"
          @blur="onNicknameBlur"
        />
      </view>
    </view>
    
    <view class="editor-actions">
      <button v-if="showSkip" class="skip-btn" @tap="handleSkip">跳过</button>
      <button v-else class="cancel-btn" @tap="handleClose">取消</button>
      <button class="save-btn" @tap="handleSave" :disabled="!formData.nickname.trim()">
        {{ isSaving ? '保存中...' : '保存' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: '编辑个人信息'
  },
  showSkip: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: () => ({
      nickname: '',
      avatar: ''
    })
  }
})

// Emits
const emit = defineEmits(['close', 'save', 'skip'])

// 响应式数据
const formData = reactive({
  nickname: '',
  avatar: ''
})

const isSaving = ref(false)

// 监听初始数据变化
watch(() => props.initialData, (newData) => {
  Object.assign(formData, newData)
}, { immediate: true, deep: true })

// 方法
const onChooseAvatar = (e) => {
  const { avatarUrl } = e.detail
  if (avatarUrl) {
    formData.avatar = avatarUrl
    console.log('选择头像成功:', avatarUrl)
  }
}

const onNicknameBlur = (e) => {
  const { value } = e.detail
  formData.nickname = value.trim()
}

const handleClose = () => {
  emit('close')
}

const handleSkip = () => {
  emit('skip')
}

const handleSave = async () => {
  if (!formData.nickname.trim()) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }
  
  isSaving.value = true
  
  try {
    await emit('save', { ...formData })
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.profile-editor {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}


.editor-content {
  display: flex;
  padding: 32rpx;
}

.editor-item {
  margin-bottom: 32rpx;
}

.editor-item:last-child {
  margin-bottom: 0;
}

.editor-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.avatar-editor {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.edit-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 2rpx solid #e0e6ed;
}

.avatar-upload-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.avatar-choose-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  background: transparent;
  border: none;
  padding: 0;
  font-size: 24rpx;
}

.avatar-choose-btn::after {
  border: none;
}

.upload-text {
  font-size: 24rpx;
  color: #1DA1F2;
}

.nickname-input {
  width: 100%;
  margin: 20rpx;
  padding: 15rpx;
  border: 2rpx solid #e0e6ed;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
}

.editor-actions {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx 32rpx;
}

.cancel-btn, .save-btn, .skip-btn {
  flex: 1;
  padding: 5rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.cancel-btn, .skip-btn {
  background: #f5f7fa;
  color: #666;
}

.save-btn {
  background: #1DA1F2;
  color: #fff;
}

.save-btn:disabled {
  background: #ccc;
  opacity: 0.6;
}
</style>