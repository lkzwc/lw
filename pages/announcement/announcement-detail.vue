<template>
  <view class="container">
    <!-- 公告详情 -->
    <unicloud-db 
      v-slot:default="{data, loading, error, options}" 
      collection="announcements" 
      :where="whereCondition"
      field="title,content,createTime,tag,image"
      :getone="true"
    >
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading" :content-text="loadingText"></uni-load-more>
      </view>
      
      <!-- 错误状态 -->
      <view v-else-if="error" class="error-container">
        <view class="error-icon">⚠️</view>
        <text class="error-text">加载失败，请重试</text>
        <button class="retry-btn" @tap="retry">重试</button>
      </view>
      
      <!-- 公告内容 -->
      <view v-else-if="data" class="announcement-detail">
        <!-- 公告图片 -->
        <image 
          v-if="data.image" 
          :src="data.image" 
          class="announcement-banner"
          mode="aspectFill"
        ></image>
        
        <!-- 头部信息 -->
        <view class="header">
          <view class="tag-wrapper">
            <view class="tag" :class="getTagClass(data.tag)">
              {{ getTagText(data.tag) }}
            </view>
          </view>
          <text class="title">{{ data.title }}</text>
          <view class="meta">
            <text class="date">{{ formatDate(data.createTime) }}</text>
          </view>
        </view>
        
        <!-- 内容区域 -->
        <view class="content">
          <text class="content-text">{{ data.content }}</text>
        </view>
        
        <!-- 底部操作 -->
        <view class="footer">
          <button class="back-btn" @tap="goBack">返回</button>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-container">
        <view class="empty-icon">📄</view>
        <text class="empty-text">公告不存在或已删除</text>
        <button class="back-btn" @tap="goBack">返回首页</button>
      </view>
    </unicloud-db>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 页面参数
const announcementId = ref('');
const loadingText = ref({
  contentdown: '查看更多',
  contentrefresh: '加载中...',
  contentnomore: '没有更多'
});

// 查询条件
const whereCondition = computed(() => {
  return `_id == "${announcementId.value}" && status == 1`;
});

// 页面加载
onLoad((options) => {
  if (options.id) {
    announcementId.value = options.id;
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'error'
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }
});

// 获取标签样式类
const getTagClass = (tag) => {
  const tagClasses = {
    'announcement': 'tag-announcement',
    'property': 'tag-property'
  };
  return tagClasses[tag] || 'tag-default';
};

// 获取标签文本
const getTagText = (tag) => {
  const tagTexts = {
    'announcement': '公告',
    'property': '物业通知'
  };
  return tagTexts[tag] || '公告';
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 重试加载
const retry = () => {
  // unicloud-db 组件会自动重新加载
  uni.showToast({
    title: '正在重新加载...',
    icon: 'loading'
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      // 如果没有上一页，则跳转到首页
      uni.switchTab({
        url: '/pages/index/index'
      });
    }
  });
};
</script>

<style scoped>
.container {
  background: #f6f7fb;
  min-height: 100vh;
}

/* 加载状态 */
.loading-container {
  padding: 100rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 错误状态 */
.error-container {
  padding: 100rpx 40rpx;
  text-align: center;
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.error-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
  display: block;
}

.retry-btn {
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

/* 空状态 */
.empty-container {
  padding: 100rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
  display: block;
}

/* 公告详情 */
.announcement-detail {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(28, 39, 60, 0.06);
}

/* 公告横幅图片 */
.announcement-banner {
  width: 100%;
  height: 400rpx;
}

/* 头部 */
.header {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tag-wrapper {
  margin-bottom: 20rpx;
}

.tag {
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.tag-announcement {
  background: #e3f2fd;
  color: #1976d2;
}

.tag-property {
  background: #fff3e0;
  color: #f57c00;
}

.tag-default {
  background: #f5f5f5;
  color: #666;
}

.title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  line-height: 1.4;
  display: block;
  margin-bottom: 16rpx;
}

.meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.date {
  font-size: 24rpx;
  color: #888;
}

/* 内容区域 */
.content {
  padding: 30rpx;
}

.content-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 底部操作 */
.footer {
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
  text-align: center;
}

.back-btn {
  background: #f6f7fb;
  color: #333;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
}

.back-btn:active {
  background: #e0e0e0;
}
</style>