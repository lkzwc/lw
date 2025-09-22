<template>
  <view class="publish-container">
    <!-- 发布内容区 -->
    <view class="publish-content">
      <!-- 用户头像和输入区 -->
      <view class="compose-area">
        <image 
          class="user-avatar" 
          :src="userInfo.avatar || '/static/default.png'"
          mode="aspectFill"
        ></image>
        
        <view class="input-area">
          <!-- 文本输入框 -->
          <textarea
            v-model="postContent"
            class="content-input"
            placeholder="分享你的想法..."
            :maxlength="280"
            auto-height
            :show-count="false"
            @input="onContentInput"
            @focus="onInputFocus"
            @blur="onInputBlur"
          ></textarea>
          
          <!-- 标签显示区 -->
          <view v-if="selectedTags.length > 0" class="tags-display">
            <view 
              v-for="(tag, index) in selectedTags" 
              :key="index"
              class="tag-item"
              @tap="removeTag(index)"
            >
              <text class="tag-text">#{{ tag }}</text>
              <uni-icons type="clear" size="14" color="#999"></uni-icons>
            </view>
          </view>

          <!-- 图片上传组件 -->
          <ImageUploader
            v-if="showImageUploader"
            :max-count="9"
            :size-limit="10"
            @on-upload-success="onImageUploadSuccess"
            @on-delete="onImageDelete"
            class="image-uploader"
          />
        </view>
      </view>

      <!-- 工具栏 -->
      <view class="toolbar">
        <view class="toolbar-left">
          <view class="tool-item" @tap="toggleImageUploader">
            <uni-icons type="image" size="20" color="#1DA1F2"></uni-icons>
          </view>
          <view class="tool-item" @tap="showTagSelector">
            <uni-icons type="compose" size="20" color="#1DA1F2"></uni-icons>
          </view>
          <view class="tool-item" @tap="showAttachmentPicker">
            <uni-icons type="paperclip" size="20" color="#1DA1F2"></uni-icons>
          </view>
        </view>
        
        <view class="toolbar-right">
          <view class="char-count" :class="{ 'char-count-warning': charCount > 260 }">
            {{ charCount }}/280
          </view>
          <button 
            class="publish-btn" 
            :class="{ 'publish-btn-active': canPublish }"
            :disabled="!canPublish"
            @tap="handlePublish"
          >
            {{ isPublishing ? '发布中...' : '发布' }}
          </button>
        </view>
      </view>
    </view>


    <!-- 标签选择弹窗 -->
    <uni-popup ref="tagPopup" type="bottom" background-color="#fff">
      <view class="tag-selector">
        <view class="tag-selector-header">
          <text class="tag-selector-title">选择标签 (最多3个)</text>
          <view class="tag-selector-close" @tap="closeTagSelector">
            <uni-icons type="clear" size="20" color="#666"></uni-icons>
          </view>
        </view>
        
        <view class="tag-input-area">
          <input
            v-model="tagInput"
            class="tag-input"
            placeholder="输入自定义标签"
            @confirm="addCustomTag"
          />
          <button class="add-tag-btn" @tap="addCustomTag">添加</button>
        </view>
        
        <view class="popular-tags">
          <text class="popular-tags-title">热门标签</text>
          <view class="tags-grid">
            <view
              v-for="(tag, index) in popularTags"
              :key="index"
              class="popular-tag-item"
              :class="{ 'tag-selected': selectedTags.includes(tag) }"
              @tap="toggleTag(tag)"
            >
              #{{ tag }}
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 位置选择弹窗 -->
    <uni-popup ref="locationPopup" type="bottom" background-color="#fff">
      <view class="location-selector">
        <view class="location-header">
          <text class="location-title">添加位置</text>
          <view class="location-close" @tap="closeLocationPicker">
            <uni-icons type="clear" size="20" color="#666"></uni-icons>
          </view>
        </view>
        <view class="location-content">
          <text class="location-placeholder">位置功能开发中...</text>
        </view>
      </view>
    </uni-popup>

    <!-- 附件选择弹窗 -->
    <uni-popup ref="attachmentPopup" type="bottom" background-color="#fff">
      <view class="attachment-selector">
        <view class="attachment-header">
          <text class="attachment-title">选择附件</text>
          <view class="attachment-close" @tap="closeAttachmentPicker">
            <uni-icons type="clear" size="20" color="#666"></uni-icons>
          </view>
        </view>
        <view class="attachment-options">
          <view class="attachment-option" @tap="selectFile">
            <uni-icons type="folder" size="24" color="#1DA1F2"></uni-icons>
            <text class="attachment-option-text">选择文件</text>
          </view>
          <view class="attachment-option" @tap="selectDocument">
            <uni-icons type="compose" size="24" color="#1DA1F2"></uni-icons>
            <text class="attachment-option-text">选择文档</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import ImageUploader from '@/components/ImageUploader.vue'

// 响应式数据
const postContent = ref('')
const selectedTags = ref([])
const uploadedImages = ref([])
const isPublishing = ref(false)
const showImageUploader = ref(false)
const tagInput = ref('')
const inputFocused = ref(false)

// 用户信息
const userInfo = reactive({
  avatar: '/static/default.png',
  nickname: '用户'
})

// 热门标签
const popularTags = ref([
  '生活', '美食', '旅行', '摄影', '音乐', 
  '电影', '读书', '运动', '科技', '时尚',
  '宠物', '学习', '工作', '情感', '随想'
])

// 计算属性
const charCount = computed(() => postContent.value.length)

const canPublish = computed(() => {
  return postContent.value.trim().length > 0 && 
         charCount.value <= 280 && 
         !isPublishing.value
})

// 弹窗引用
const tagPopup = ref(null)
const attachmentPopup = ref(null)

// 方法
const goBack = () => {
  uni.navigateBack()
}

const onContentInput = (e) => {
  const value = e.detail.value
  // 检测 # 标签输入
  if (value.endsWith('#')) {
    showTagSelector()
  }
}

const onInputFocus = () => {
  inputFocused.value = true
}

const onInputBlur = () => {
  inputFocused.value = false
}

const toggleImageUploader = () => {
  showImageUploader.value = !showImageUploader.value
}

const onImageUploadSuccess = (images) => {
  uploadedImages.value = images
}

const onImageDelete = (images) => {
  uploadedImages.value = images
}

const showTagSelector = () => {
  tagPopup.value?.open()
}

const closeTagSelector = () => {
  tagPopup.value?.close()
  tagInput.value = ''
}

const addCustomTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !selectedTags.value.includes(tag)) {
    if (selectedTags.value.length >= 3) {
      // 超过3个标签时，替换最后一个
      selectedTags.value[2] = tag
    } else {
      selectedTags.value.push(tag)
    }
    tagInput.value = ''
  }
}

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    if (selectedTags.value.length >= 3) {
      // 超过3个标签时，替换最后一个
      selectedTags.value[2] = tag
    } else {
      selectedTags.value.push(tag)
    }
  }
}

const removeTag = (index) => {
  selectedTags.value.splice(index, 1)
}

const showAttachmentPicker = () => {
  attachmentPopup.value?.open()
}

const closeAttachmentPicker = () => {
  attachmentPopup.value?.close()
}

const selectFile = () => {
  uni.chooseFile({
    count: 1,
    extension: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
    success: (res) => {
      console.log('选择文件成功:', res)
      uni.showToast({
        title: '文件选择成功',
        icon: 'success'
      })
      closeAttachmentPicker()
    },
    fail: (err) => {
      console.error('选择文件失败:', err)
      uni.showToast({
        title: '文件选择失败',
        icon: 'none'
      })
    }
  })
}

const selectDocument = () => {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    success: (res) => {
      console.log('选择文档成功:', res)
      uni.showToast({
        title: '文档选择成功',
        icon: 'success'
      })
      closeAttachmentPicker()
    },
    fail: (err) => {
      console.error('选择文档失败:', err)
      uni.showToast({
        title: '文档选择失败',
        icon: 'none'
      })
    }
  })
}

const handlePublish = async () => {
  if (!canPublish.value) return
  
  try {
    isPublishing.value = true
    
    // 构建发布数据
    const publishData = {
      content: postContent.value.trim(),
      tags: selectedTags.value,
      images: uploadedImages.value,
      createTime: Date.now()
    }
    
    // 这里应该调用发布接口
    console.log('发布数据:', publishData)
    
    // 模拟发布延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    uni.showToast({
      title: '发布成功',
      icon: 'success'
    })
    
    // 发布成功后返回
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
    
  } catch (error) {
    console.error('发布失败:', error)
    uni.showToast({
      title: '发布失败，请重试',
      icon: 'none'
    })
  } finally {
    isPublishing.value = false
  }
}

onMounted(() => {
  // 初始化用户信息
  // 这里可以从缓存或接口获取用户信息
})
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background: #fff;
}

/* 发布内容区 */
.publish-content {
  padding: 20rpx 24rpx; /* 减少padding */
}

.compose-area {
  display: flex;
  gap: 20rpx; /* 减少间距 */
  margin-bottom: 24rpx;
}

.user-avatar {
  width: 72rpx; /* 稍微减小头像 */
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.input-area {
  flex: 1;
}

.content-input {
  width: 100%;
  min-height: 260rpx; /* 减少最小高度 */
  font-size: 30rpx; /* 稍微减小字体 */
  line-height: 1.5;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  padding: 0; /* 移除内边距 */
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx; /* 减少间距 */
  margin-top: 12rpx; /* 减少间距 */
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6rpx; /* 减少间距 */
  padding: 6rpx 12rpx; /* 减少内边距 */
  background: #f0f8ff;
  border-radius: 16rpx; /* 减少圆角 */
  border: 1rpx solid #1DA1F2;
}

.tag-text {
  font-size: 22rpx; /* 减小字体 */
  color: #1DA1F2;
}

.image-uploader {
  margin-top: 16rpx; /* 减少间距 */
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0; /* 减少内边距 */
  border-top: 1rpx solid #f0f0f0;
}

.toolbar-left {
  display: flex;
  gap: 24rpx; /* 减少间距 */
}

.tool-item {
  padding: 12rpx; /* 减少内边距 */
  border-radius: 50%;
  transition: background-color 0.2s;
}

.tool-item:active {
  background: #f0f8ff;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16rpx; /* 添加间距 */
}

.char-count {
  font-size: 22rpx; /* 减小字体 */
  color: #666;
}

.char-count-warning {
  color: #ff4757;
}

/* 右下角发布按钮 */
.floating-publish-btn {
  position: fixed;
  right: 32rpx;
  bottom: 32rpx;
  z-index: 999;
}

.publish-btn {
  border-radius: 50rpx; /* 更圆润的圆角 */
  font-size: 26rpx;
  font-weight: 600;
  background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%); /* 渐变背景 */
  color: #999;
  border: none;
  transition: all 0.3s ease; /* 更流畅的过渡 */
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1); /* 添加阴影 */
  min-width: 120rpx; /* 最小宽度 */
  text-align: center;
}

.publish-btn-active {
  background: linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%); /* Twitter蓝渐变 */
  color: #fff;
  transform: translateY(-2rpx); /* 轻微上浮效果 */
  box-shadow: 0 8rpx 20rpx rgba(29, 161, 242, 0.3); /* 蓝色阴影 */
}

.publish-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 标签选择器 */
.tag-selector {
  padding: 24rpx; /* 减少内边距 */
}

.tag-selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx; /* 减少间距 */
}

.tag-selector-title {
  font-size: 30rpx; /* 减小字体 */
  font-weight: 600;
  color: #333;
}

.tag-selector-close {
  padding: 8rpx;
}

.tag-input-area {
  display: flex;
  gap: 12rpx; /* 减少间距 */
  margin-bottom: 24rpx; /* 减少间距 */
}

.tag-input {
  flex: 1;
  padding: 12rpx 16rpx; /* 减少内边距 */
  border: 1rpx solid #e0e0e0;
  border-radius: 6rpx; /* 减少圆角 */
  font-size: 26rpx; /* 减小字体 */
}

.add-tag-btn {
  padding: 5rpx; /* 减少内边距 */
  background: #1DA1F2;
  color: #fff;
  border: none;
  border-radius: 6rpx; /* 减少圆角 */
  font-size: 26rpx; /* 减小字体 */
}

.popular-tags-title {
  font-size: 26rpx; /* 减小字体 */
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx; /* 减少间距 */
  display: block;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx; /* 减少间距 */
}

.popular-tag-item {
  padding: 10rpx 16rpx; /* 减少内边距 */
  background: #f5f5f5;
  border-radius: 16rpx; /* 减少圆角 */
  font-size: 24rpx; /* 减小字体 */
  color: #666;
  transition: all 0.2s;
}

.tag-selected {
  background: #1DA1F2;
  color: #fff;
}

/* 位置选择器 */
.location-selector {
  padding: 24rpx; /* 减少内边距 */
}

.location-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx; /* 减少间距 */
}

.location-title {
  font-size: 30rpx; /* 减小字体 */
  font-weight: 600;
  color: #333;
}

.location-close {
  padding: 8rpx;
}

.location-content {
  padding: 60rpx 0; /* 减少内边距 */
  text-align: center;
}

.location-placeholder {
  font-size: 26rpx; /* 减小字体 */
  color: #999;
}

/* 附件选择器 */
.attachment-selector {
  padding: 24rpx; /* 减少内边距 */
}

.attachment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx; /* 减少间距 */
}

.attachment-title {
  font-size: 30rpx; /* 减小字体 */
  font-weight: 600;
  color: #333;
}

.attachment-close {
  padding: 8rpx;
}

.attachment-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.attachment-option {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f8f9fc;
  border-radius: 12rpx;
  transition: background-color 0.2s;
}

.attachment-option:active {
  background: #f0f8ff;
}

.attachment-option-text {
  font-size: 28rpx;
  color: #333;
}
</style>