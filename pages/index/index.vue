<template>
	<view class="container">
		<!-- 顶部 Banner -->
		<view class="banner-section">
			<uni-swiper-dot :info="bannerList" :current="current" field="content" mode="round">
				<swiper class="swiper-box" @change="change" :current="swiperCurrent">
					<swiper-item v-for="(item, index) in bannerList" :key="index">
						<view class="swiper-item" @tap="clickBannerItem(item)">
							<image :src="item.image" mode="aspectFill"></image>
							<view class="banner-title">{{ item.title }}</view>
						</view>
					</swiper-item>
				</swiper>
			</uni-swiper-dot>
		</view>

		<!-- 功能拼图区域（重构） -->
		<view class="feature-mosaic">
			<!-- 每日热榜（横向扁平，跨两列） -->
			<view class="card news-hero" @tap="clickMenuItem(menuList[0])">
				<view class="news-hero-left">
					<view class="icon-chip primary">
						<uni-icons :type="menuList[0].icon" :size="22" color="#fff"></uni-icons>
					</view>
					<view class="news-info">
						<text class="news-title">每日热榜</text>
						<text class="news-sub">60s 读懂全球新闻与 AI 热点</text>
					</view>
				</view>
				<view class="badge-hot">HOT</view>
			</view>

			<!-- 紧凑卡片两列：天气 + 学习 -->
			<view class="mosaic-grid">
				<!-- 天气卡片 -->
				<view class="card small-card" @tap="clickMenuItem(menuList[1])">
					<view v-if="weatherLoading" class="loading-row">
						<view class="spinner"></view>
						<text class="loading-text">天气获取中</text>
					</view>
					<view v-else class="weather-wrap">
						<view class="row">
							<view class="icon-circle soft-blue">
								<uni-icons :type="getWeatherIcon(weatherData.weather)" :size="20" color="#fff"></uni-icons>
							</view>
							<text class="temp">{{ weatherData.temperature }}°</text>
							<text class="wx">{{ weatherData.weather }}</text>
						</view>
						<view class="meta">
							<text class="meta-text">{{ weatherData.city }}</text>
							<text class="dot">·</text>
							<text class="meta-text">{{ weatherData.winddirection }}风 {{ weatherData.windpower }}级</text>
						</view>
					</view>
				</view>

				<!-- 学习进度卡片 -->
				<view class="card small-card" @tap="clickMenuItem(menuList[6])">
					<view class="study-wrap">
						<view class="row">
							<view class="icon-circle soft-orange">
								<uni-icons :type="menuList[6].icon" :size="20" color="#fff"></uni-icons>
							</view>
							<text class="study-title-text">学习</text>
							<text class="study-sub">今日进度</text>
						</view>
						<view class="progress">
							<view class="progress-fill" style="width: 60%"></view>
						</view>
						<text class="progress-num">60%</text>
					</view>
				</view>
			</view>
			
			<!-- 快捷功能区域 -->
			<view class="card quick-actions">
				<view class="qa-header">
					<text class="qa-title">快捷功能</text>
				</view>
				<view class="qa-grid">
					<view
						class="qa-item"
						v-for="(item, index) in menuList.slice(2, 6)"
						:key="index"
						@tap="clickMenuItem(item)"
					>
						<view class="qa-icon" :style="{ background: getFunctionGradient(index) }">
							<uni-icons :type="item.icon" :size="18" color="#fff"></uni-icons>
						</view>
						<text class="qa-name">{{ item.name }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 公告模块 -->
		<view class="card section">
			<view class="section-header">
				<text class="section-title">📢 最新公告</text>
				<!-- <text class="section-more" @tap="goToAnnouncementList">查看全部</text> -->
			</view>
			<unicloud-db 
				v-slot:default="{data, loading, error}" 
				collection="announcements" 
				where="status == 1"
				field="title,createTime,tag,image,_id"
				orderby="createTime desc"
				:page-size="3"
			>
				<!-- 加载状态 -->
				<view v-if="loading" class="announcement-loading">
					<view class="loading-item" v-for="i in 3" :key="i">
						<view class="loading-avatar"></view>
						<view class="loading-content">
							<view class="loading-title"></view>
							<view class="loading-meta"></view>
						</view>
					</view>
				</view>
				
				<!-- 错误状态 -->
				<view v-else-if="error" class="announcement-error">
					<uni-icons type="info-filled" size="32" color="#ff6b6b"></uni-icons>
					<text class="error-text">公告加载失败</text>
				</view>
				
				<!-- 公告列表（使用图片缩略图 + 紧凑布局，并支持 tag 数组） -->
				<view v-else-if="data && data.length > 0" class="announcements-list">
					<view 
						class="announcement-item" 
						v-for="(item, index) in data" 
						:key="item._id"
						@tap="goToAnnouncementDetail(item._id)"
					>
						<!-- 左侧图片缩略图；若无图片使用默认占位 -->
						<image 
							:src="item.image || '/static/default-announcement.png'"
							class="announcement-image"
							mode="aspectFill"
						></image>

						<!-- 右侧内容 -->
						<view class="announcement-content">
							<view class="announcement-header">
								<view class="tags-row">
									<view
										v-for="(t, i) in normalizeTag(item.tag).slice(0, 2)"
										:key="i"
										class="announcement-tag"
										:class="getAnnouncementTagClass(t)"
									>
										{{ getAnnouncementTagText(t) }}
									</view>
								</view>
								<text class="announcement-date">{{ formatAnnouncementDate(item.createTime) }}</text>
							</view>
							<text class="announcement-title">{{ item.title }}</text>
						</view>

						<view class="announcement-arrow">
							<uni-icons type="right" size="14" color="#c0c4cc"></uni-icons>
						</view>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view v-else class="announcement-empty">
					<uni-icons type="chat" size="48" color="#ddd"></uni-icons>
					<text class="empty-text">暂无公告</text>
				</view>
			</unicloud-db>
		</view>

		<!-- 热门技能 -->
		<view class="card section">
			<view class="section-header">
				<text class="section-title">热门技能</text>
				<text class="section-more" @tap="goToSkills">查看全部</text>
			</view>
			<scroll-view class="skills-scroll" scroll-x="true" show-scrollbar="false">
				<view class="skills-list">
					<view
						class="skill-card"
						v-for="(skill, index) in hotSkills"
						:key="index"
						@tap="goToSkillDetail(skill)"
					>
						<image :src="skill.userAvatar || '/static/default-avatar.png'" class="skill-avatar" />
						<view class="skill-info">
							<text class="skill-title">{{ skill.title }}</text>
							<text class="skill-price">¥{{ skill.price }}/{{ skill.priceUnit }}</text>
							<view class="skill-rating">
								<uni-icons type="star-filled" :size="12" color="#FFD700"></uni-icons>
								<text class="rating-text">{{ skill.rating }}</text>
							</view>
                        </view>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 今日数据 -->
		<view class="card section">
			<view class="section-header">
				<text class="section-title">今日数据</text>
			</view>
			<div class="stats-grid">
				<div class="stat-card" v-for="(stat, index) in todayStats" :key="index">
					<div class="stat-icon" :style="{ backgroundColor: stat.color }">
						<uni-icons :type="stat.icon" :size="18" color="#fff"></uni-icons>
					</div>
					<div class="stat-info">
						<text class="stat-number">{{ stat.value }}</text>
						<text class="stat-label">{{ stat.label }}</text>
					</div>
				</div>
			</div>
		</view>
	</view>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';

const current = ref(0);
const swiperCurrent = ref(0);
const weatherLoading = ref(true);
const isGettingWeather = ref(false);
const weatherData = reactive({
  city: '天气',
  weather: '晴',
  temperature: '25',
  winddirection: '东南',
  windpower: '≤3',
  humidity: '65'
});

// 云对象实例
let utilObj = null;

// 轮播图
const bannerList = reactive([
  { image: 'https://via.placeholder.com/750x300/667eea/FFFFFF?text=欢迎使用hxzyL', title: '欢迎使用hxzyL', content: '发现更多精彩内容' },
  { image: 'https://via.placeholder.com/750x300/764ba2/FFFFFF?text=社区互动', title: '社区互动', content: '与朋友分享生活点滴' },
  { image: 'https://via.placeholder.com/750x300/f093fb/FFFFFF?text=技能提升', title: '技能提升', content: '学习新技能，提升自己' }
]);

// 菜单数据
const menuList = reactive([
  { name: '每日热榜', icon: 'star', color: '#667eea', type: 'news' },
  { name: '天气', icon: 'cloud', color: '#764ba2', type: 'weather' },
  { name: '随手拍', icon: 'camera', color: '#4facfe', type: 'tools' },
  { name: '技能台', icon: 'gear', color: '#43e97b', type: 'skills' },
  { name: '健康', icon: 'heart', color: '#fa709a', type: 'health' },
  { name: '购物', icon: 'cart', color: '#ffeaa7', type: 'shopping' },
  { name: '学习', icon: 'book', color: '#ffecd2', type: 'study' }
]);

// 热门技能
const hotSkills = reactive([
  { id: '1', title: '专业家电维修', price: 50, priceUnit: '小时', rating: 4.8, userAvatar: '/static/avatar1.jpg' },
  { id: '2', title: '家政清洁服务', price: 30, priceUnit: '小时', rating: 4.9, userAvatar: '/static/avatar2.jpg' },
  { id: '3', title: '小学数学辅导', price: 80, priceUnit: '课时', rating: 4.7, userAvatar: '/static/avatar3.jpg' },
  { id: '4', title: '上门美甲服务', price: 60, priceUnit: '次', rating: 4.6, userAvatar: '/static/avatar4.jpg' }
]);

// 今日数据
const todayStats = reactive([
  { label: '违停举报', value: '23', icon: 'camera', color: '#ff6b6b' },
  { label: '技能发布', value: '8', icon: 'gear', color: '#4ecdc4' },
  { label: '社区帖子', value: '15', icon: 'chatbubble', color: '#45b7d1' },
  { label: '活跃用户', value: '156', icon: 'person', color: '#96ceb4' }
]);

// 快捷功能图标渐变
const getFunctionGradient = (index) => {
  const gradients = [
    'linear-gradient(135deg, #9face6 0%, #74ebd5 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)'
  ];
  return gradients[index] || gradients[0];
};

// 初始化云对象
const initCloudObj = () => {
  try {
    utilObj = uniCloud.importObject('util');
  } catch (error) {
    uni.showToast({ title: '云对象初始化失败', icon: 'none' });
  }
};

// 获取天气
const getWeatherData = async () => {
  if (isGettingWeather.value) return;

  if (!utilObj) {
    weatherLoading.value = false;
    uni.showToast({ title: '云对象未初始化', icon: 'none' });
    return;
  }

  try {
    isGettingWeather.value = true;
    weatherLoading.value = true;
    const result = await utilObj.getWeatherByCityName();
    if (result && result.errCode === 0 && result.data) {
      Object.assign(weatherData, {
        city: result.data.city,
        weather: result.data.weather,
        temperature: result.data.temperature,
        winddirection: result.data.winddirection,
        windpower: result.data.windpower,
        humidity: result.data.humidity
      });
    } else {
      uni.showToast({ title: result?.errMsg || '天气数据获取失败', icon: 'none' });
    }
  } catch (e) {
    console.error('获取天气数据失败:', e);
    uni.showToast({ title: '天气数据获取失败', icon: 'none' });
  } finally {
    weatherLoading.value = false;
    isGettingWeather.value = false;
  }
};

// 事件
const change = (e) => {
  current.value = e.detail.current;
};
const clickBannerItem = (item) => {
  console.log('点击轮播图:', item);
};
const clickMenuItem = (item) => {
  switch (item.type) {
    case 'news':
      uni.navigateTo({ url: '/pages/news/news' });
      break;
    case 'weather':
      getWeatherData();
      break;
    case 'tools':
      uni.navigateTo({ url: '/pages/camera/camera' });
      break;
    case 'skills':
      uni.navigateTo({ url: '/pages/skills/skills' });
      break;
    default:
      uni.showToast({ title: `${item.name}功能开发中`, icon: 'none' });
  }
};
const goToSkills = () => {
  uni.navigateTo({ url: '/pages/skills/skills' });
};
const goToSkillDetail = (skill) => {
  uni.navigateTo({ url: `/pages/skills/skill-detail?id=${skill.id}` });
};
const getWeatherIcon = (weather) => {
  const iconMap = { 晴: 'sunny', 多云: 'cloud', 阴: 'cloudy', 雨: 'rain', 雪: 'snow' };
  return iconMap[weather] || 'cloud';
};

// 跳转到公告详情
const goToAnnouncementDetail = (id) => {
  uni.navigateTo({
    url: `/pages/announcement/announcement-detail?id=${id}`
  });
};


// 获取公告头像样式类
const getAnnouncementAvatarClass = (tag) => {
  const avatarClasses = {
    'announcement': 'avatar-announcement',
    'property': 'avatar-property'
  };
  return avatarClasses[tag] || 'avatar-default';
};

// 获取公告图标
const getAnnouncementIcon = (tag) => {
  const iconMap = {
    'announcement': 'sound',
    'property': 'home'
  };
  return iconMap[tag] || 'chat';
};

// 获取公告标签样式类
const getAnnouncementTagClass = (tag) => {
  const tagClasses = {
    'announcement': 'tag-announcement',
    'property': 'tag-property'
  };
  return tagClasses[tag] || 'tag-default';
};

// 获取公告标签文本
const getAnnouncementTagText = (tag) => {
  const tagTexts = {
    'announcement': '公告',
    'property': '物业通知'
  };
  return tagTexts[tag] || '公告';
};

// 格式化公告日期
const formatAnnouncementDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  }
};

// 跳转到公告列表
const goToAnnouncementList = () => {
  uni.navigateTo({
    url: '/pages/announcement/announcement'
  });
};

// 兼容 tag 为数组或字符串的工具函数
const normalizeTag = (tag) => {
  if (Array.isArray(tag)) return tag.filter(Boolean);
  return tag ? [tag] : [];
};

onMounted(() => {
  initCloudObj();
  setTimeout(() => getWeatherData(), 500);
});
</script>

<style scoped>
/* 基础 */
.container {
  background: #f6f7fb;
  min-height: 100vh;
  padding-bottom: 24rpx;
}

/* Banner */
.banner-section {
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
}
.swiper-box { height: 300rpx; }
.swiper-item { position: relative; height: 100%; }
.swiper-item image { width: 100%; height: 100%; }
.banner-title {
  position: absolute; bottom: 20rpx; left: 20rpx;
  color: #fff; font-size: 30rpx; font-weight: 600;
  text-shadow: 0 2rpx 6rpx rgba(0,0,0,0.3);
}

/* 通用卡片 */
.card {
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(28, 39, 60, 0.06);
}
.section { margin: 20rpx; padding: 24rpx; }

/* 功能拼图 */
.feature-mosaic { margin: 20rpx; display: flex; flex-direction: column; gap: 16rpx; }

/* 每日热榜横向扁平 */
.news-hero {
  height: 120rpx; padding: 0 20rpx;
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%);
  color: #fff;
}
.news-hero-left { display: flex; align-items: center; gap: 16rpx; }
.icon-chip {
  width: 56rpx; height: 56rpx; border-radius: 14rpx;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.22);
}
.primary { background: rgba(255,255,255,0.22); }
.news-info { display: flex; flex-direction: column; }
.news-title { font-size: 28rpx; font-weight: 700; }
.news-sub { font-size: 22rpx; opacity: 0.9; }
.badge-hot {
  padding: 8rpx 16rpx; border-radius: 999rpx; font-size: 20rpx; font-weight: 700;
  background: rgba(255,255,255,0.22); color: #fff;
}

/* 两列紧凑卡片 */
.mosaic-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.small-card { padding: 16rpx; min-height: 140rpx; }

/* 天气 */
.loading-row { height: 108rpx; display: flex; align-items: center; justify-content: center; gap: 10rpx; }
.spinner {
  width: 28rpx; height: 28rpx; border-radius: 50%;
  border: 3rpx solid rgba(0,0,0,0.1); border-top-color: #7f7fd5; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 22rpx; color: #666; }
.weather-wrap { display: flex; flex-direction: column; gap: 10rpx; }
.row { display: flex; align-items: center; gap: 10rpx; }
.icon-circle {
  width: 48rpx; height: 48rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.soft-blue { background: linear-gradient(135deg, #74ebd5, #9face6); }
.soft-orange { background: linear-gradient(135deg, #f6d365, #fda085); }
.temp { font-size: 34rpx; font-weight: 700; color: #333; }
.wx { font-size: 22rpx; color: #666; }
.meta { display: flex; align-items: center; gap: 8rpx; }
.meta-text { font-size: 20rpx; color: #888; }
.dot { color: #ddd; }

/* 学习进度 */
.study-wrap { display: flex; flex-direction: column; gap: 12rpx; }
.study-title-text { font-size: 26rpx; font-weight: 700; color: #333; }
.study-sub { font-size: 22rpx; color: #888; }
.progress {
  width: 100%; height: 10rpx; background: #f0f2f5; border-radius: 999rpx; overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #7f7fd5, #86a8e7);
}

/* 快捷功能 */
.quick-actions { padding: 20rpx; }
.qa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.qa-title { font-size: 28rpx; font-weight: 700; color: #333; }
.qa-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16rpx; }
.qa-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.qa-icon {
  width: 64rpx; height: 64rpx; border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center; color: #fff;
  box-shadow: 0 4rpx 14rpx rgba(0,0,0,0.08);
}
.qa-name { font-size: 22rpx; color: #333; }

/* 公告 */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 700; color: #333; }
.announcement-loading,
.announcement-error,
.announcements-list,
.announcement-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.loading-item,
.loading-tag,
.loading-title,
.loading-date,
.error-text,
.empty-text {
  height: 48rpx;
}
.loading-item {
  display: flex; align-items: center; gap: 16rpx;
}
.loading-tag,
.loading-title,
.loading-date {
  width: 100%;
}
.loading-tag {
  background: #eee;
}
.loading-title {
  background: #f8f8f8;
}
.loading-date {
  background: #f1f1f1;
}
.error-text,
.empty-text {
  font-size: 24rpx;
}
.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0 -24rpx; /* 抵消父容器的左右padding */
}
.announcement-item {
  width: 100% !important;
  display: flex;
  align-items: center;
  padding: 16rpx !important; /* 减少左右内边距从24rpx到16rpx */
  gap: 12rpx;
  transition: background-color 0.2s;
}
.announcement-item:active {
  background-color: #f8f9fc;
}
.announcement-item:not(:last-child) {
  border-bottom: 1rpx solid #f0f2f5;
}
.announcement-image {
  margin:0rpx 20rpx;
  width: 120rpx;
  height: 80rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}
.announcement-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}
.announcement-tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: 500;
  width: fit-content;
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
.announcement-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
}
.announcement-date {
  font-size: 20rpx;
  color: #909399;
  flex-shrink: 0;
}
.announcement-arrow {
  margin-left: 16rpx;
}
.announcement-loading {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0 -24rpx; /* 抵消父容器的左右padding */
}
.loading-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 16rpx; /* 减少左右内边距从24rpx到16rpx */
}
.loading-tag {
  width: 80rpx;
  height: 32rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  animation: skeleton 1.5s ease-in-out infinite;
}
.loading-title {
  width: 100%;
  height: 36rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  animation: skeleton 1.5s ease-in-out infinite;
}
.loading-date {
  width: 120rpx;
  height: 28rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  animation: skeleton 1.5s ease-in-out infinite;
}
@keyframes skeleton {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.announcement-error {
  padding: 40rpx 0;
  text-align: center;
}
.error-text {
  font-size: 24rpx;
  color: #999;
}
.announcement-empty {
  padding: 40rpx 0;
  text-align: center;
}
.empty-text {
  font-size: 24rpx;
  color: #999;
}
/* 热门技能 */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 700; color: #333; }
.section-more { font-size: 24rpx; color: #007aff; }
.skills-scroll { white-space: nowrap; }
.skills-list { display: flex; gap: 16rpx; }
.skill-card {
  flex-shrink: 0; width: 200rpx; padding: 20rpx; border-radius: 14rpx;
  background: #f8f9fc; box-shadow: inset 0 0 0 1rpx #eef0f6;
}
.skill-avatar { width: 56rpx; height: 56rpx; border-radius: 50%; margin-bottom: 12rpx; }
.skill-info { display: flex; flex-direction: column; gap: 8rpx; }
.skill-title { font-size: 24rpx; font-weight: 700; color: #333; }
.skill-price { font-size: 22rpx; color: #ff6b35; font-weight: 700; }
.skill-rating { display: flex; align-items: center; gap: 6rpx; justify-content: center; }
.rating-text { font-size: 20rpx; color: #666; }

/* 今日数据 */
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12rpx; }
.stat-card {
  display: flex; align-items: center; gap: 12rpx; padding: 18rpx; border-radius: 14rpx;
  background: #f8f9fc; box-shadow: inset 0 0 0 1rpx #eef0f6;
}
.stat-icon {
  width: 52rpx; height: 52rpx; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; color: #fff;
}
.stat-info { display: flex; flex-direction: column; }
.stat-number { font-size: 30rpx; font-weight: 700; color: #333; }
.stat-label { font-size: 22rpx; color: #666; }

/* 公告模块样式：图片缩略图 + 紧凑布局 + tag 数组展示 */
.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0 -24rpx; /* 占满卡片宽度 */
}

.announcement-item {
  display: flex;
  align-items: center;
  padding: 16rpx 16rpx;
  gap: 12rpx;
  transition: background-color 0.2s;
}

.announcement-item:active {
  background-color: #f8f9fc;
}

.announcement-item:not(:last-child) {
  border-bottom: 1rpx solid #f0f2f5;
}

/* 左侧图片缩略图（更紧凑） */
.announcement-image {
  width: 96rpx;
  height: 64rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
}

/* 右侧内容 */
.announcement-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.announcement-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  max-width: 70%;
  overflow: hidden;
}

.announcement-tag {
  display: inline-block;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  font-size: 18rpx;
  font-weight: 500;
  flex-shrink: 0;
}

.tag-announcement {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.tag-property {
  background: rgba(245, 87, 108, 0.1);
  color: #f5576c;
}

.tag-default {
  background: #f5f5f5;
  color: #666;
}

.announcement-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-all;
}

.announcement-date {
  font-size: 20rpx;
  color: #909399;
  flex-shrink: 0;
}

.announcement-arrow {
  flex-shrink: 0;
  padding: 8rpx;
  margin: -8rpx;
}

/* 加载骨架占位（匹配缩略图尺寸） */
.loading-item {
  display: flex;
  align-items: center;
  padding: 16rpx 16rpx;
  gap: 12rpx;
}

.loading-avatar {
  width: 96rpx;
  height: 64rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  animation: skeleton 1.5s ease-in-out infinite;
}
</style>