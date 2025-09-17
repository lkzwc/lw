<template>
	<view class="container">
		<!-- 发布内容区域 -->
		<view class="publish-content">
			<!-- 内容输入框 -->
			<textarea 
				v-model="formData.content" 
				class="content-input" 
				placeholder="说说您的新鲜事..."
				:auto-height="true"
				:maxlength="280"
				@input="onContentInput"
				@blur="onInputBlur">
			</textarea>
			
			<!-- 标签选择面板 -->
			<view class="tag-panel" v-if="showTagPanel">
				<view class="tag-panel-header">
					<text class="panel-title">选择标签</text>
					<view class="close-panel" @tap="closeTagPanel">
						<uni-icons type="close" size="16" color="#999"></uni-icons>
					</view>
				</view>
				<view class="hot-tags">
					<view class="tag-title">热门标签</view>
					<view class="tag-list">
						<view 
							v-for="(tag, index) in hotTags" 
							:key="index" 
							class="tag-item" 
							@tap="selectTag(tag)">
							#{{ tag }}
						</view>
					</view>
				</view>
			</view>

			<!-- 已选标签显示 -->
			<view class="selected-tags" v-if="selectedTags.length > 0">
				<view 
					v-for="(tag, index) in selectedTags" 
					:key="index" 
					class="selected-tag">
					<text class="tag-text">#{{ tag }}</text>
					<view class="remove-tag" @tap="removeTag(index)">
						<uni-icons type="close" size="12" color="#999"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 图片展示 -->
			<view class="images-section" v-if="formData.images.length > 0">
				<view class="image-grid" :class="'grid-' + Math.min(formData.images.length, 4)">
					<view 
						v-for="(image, index) in formData.images" 
						:key="index" 
						class="image-item"
						@tap="previewImage(index)">
						<image :src="image" class="uploaded-image" mode="aspectFill"></image>
						<view class="image-delete" @tap.stop="removeImage(index)">
							<uni-icons type="close" color="white" size="14"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部工具栏 -->
		<view class="bottom-toolbar">
			<view class="toolbar-left">
				<view class="tool-item" @tap="chooseImage">
					<uni-icons type="image" size="24" color="#4A90E2"></uni-icons>
				</view>
				<view class="tool-item" @tap="chooseVideo">
					<uni-icons type="videocam" size="24" color="#50C878"></uni-icons>
				</view>
				<view class="tool-item" @tap="addLocation">
					<uni-icons type="location" size="24" color="#FF6B6B"></uni-icons>
				</view>
				<view class="tool-item" @tap="showEmojiPanel">
					<uni-icons type="compose" size="24" color="#FFD700"></uni-icons>
				</view>
			</view>
			<view class="toolbar-right">
				<view class="privacy-circle" @tap="togglePrivacy">
					<uni-icons :type="formData.isPublic ? 'eye' : 'eye-slash'" size="16" :color="formData.isPublic ? '#4A90E2' : '#999'"></uni-icons>
				</view>
				<button class="publish-btn" @tap="publishPost" :disabled="!canPublish" :class="{ active: canPublish }">
					发布
				</button>
			</view>
		</view>

		<!-- 加载遮罩 -->
		<uni-load-more v-if="isPublishing" status="loading" :content-text="loadingText"></uni-load-more>
	</view>
</template>

<script setup>
	import {
		computed,
		onMounted,
		reactive,
		ref,
		watch
	} from 'vue';

	const isPublishing = ref(false);
	const showTagPanel = ref(false);
	const cursorPosition = ref(0);
	const selectedTags = ref([]);

	const loadingText = reactive({
		contentText: {
			loading: '发布中...'
		}
	});

	// 表单数据
	const formData = reactive({
		content: '',
		images: [],
		isPublic: true
	});

	// 热门标签
	const hotTags = reactive([
		'日常', '生活', '美食', '旅行', '学习', 
		'工作', '健身', '摄影', '音乐', '电影',
		'读书', '科技', '游戏', '宠物', '时尚'
	]);

	// 计算是否可以发布
	const canPublish = computed(() => {
		return formData.content.trim().length > 0;
	});

	// 监听内容变化，检测#标签
	watch(() => formData.content, (newContent) => {
		const lastChar = newContent.slice(-1);
		if (lastChar === '#') {
			showTagPanel.value = true;
		}
	});

	// 内容输入事件
	const onContentInput = (e) => {
		formData.content = e.detail.value;
		cursorPosition.value = e.detail.cursor;
	};

	// 输入框失焦
	const onInputBlur = () => {
		setTimeout(() => {
			if (showTagPanel.value) {
				showTagPanel.value = false;
			}
		}, 200);
	};

	// 选择标签
	const selectTag = (tag) => {
		if (!selectedTags.value.includes(tag)) {
			selectedTags.value.push(tag);
			
			const content = formData.content;
			const beforeCursor = content.substring(0, cursorPosition.value);
			const afterCursor = content.substring(cursorPosition.value);
			
			const lastHashIndex = beforeCursor.lastIndexOf('#');
			if (lastHashIndex !== -1) {
				const newContent = content.substring(0, lastHashIndex) + '#' + tag + ' ' + afterCursor;
				formData.content = newContent;
			}
		}
		closeTagPanel();
	};

	// 移除标签
	const removeTag = (index) => {
		const removedTag = selectedTags.value[index];
		selectedTags.value.splice(index, 1);
		formData.content = formData.content.replace('#' + removedTag, '').replace(/\s+/g, ' ').trim();
	};

	// 关闭标签面板
	const closeTagPanel = () => {
		showTagPanel.value = false;
	};

	// 选择图片
	const chooseImage = () => {
		const remainCount = 6 - formData.images.length;
		if (remainCount <= 0) {
			uni.showToast({
				title: '最多上传6张图片',
				icon: 'none'
			});
			return;
		}

		uni.chooseImage({
			count: remainCount,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				formData.images.push(...res.tempFilePaths);
			}
		});
	};

	// 选择视频
	const chooseVideo = () => {
		uni.showToast({
			title: '视频功能开发中',
			icon: 'none'
		});
	};

	// 删除图片
	const removeImage = (index) => {
		formData.images.splice(index, 1);
	};

	// 预览图片
	const previewImage = (index) => {
		uni.previewImage({
			urls: formData.images,
			current: index
		});
	};

	// 显示表情面板
	const showEmojiPanel = () => {
		uni.showToast({
			title: '表情功能开发中',
			icon: 'none'
		});
	};

	// 添加位置
	const addLocation = () => {
		uni.showToast({
			title: '位置功能开发中',
			icon: 'none'
		});
	};

	// 切换隐私设置
	const togglePrivacy = () => {
		formData.isPublic = !formData.isPublic;
	};

	// 发布帖子
	const publishPost = () => {
		if (!canPublish.value) {
			return;
		}

		isPublishing.value = true;

		setTimeout(() => {
			isPublishing.value = false;
			
			uni.showToast({
				title: '发布成功',
				icon: 'success'
			});
			
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		}, 2000);
	};

	// 页面返回处理
	const onBackPress = () => {
		if (formData.content.trim() || formData.images.length > 0) {
			uni.showModal({
				title: '提示',
				content: '确定要放弃编辑吗？',
				success: (res) => {
					if (res.confirm) {
						uni.navigateBack();
					}
				}
			});
			return true;
		}
		return false;
	};

	onMounted(() => {
		console.log('简约发布页面加载完成');
	});

	// 导出页面返回处理函数
	defineExpose({
		onBackPress
	});
</script>

<style scoped>
	.container {
		background-color: #ffffff;
		min-height: 30vh;
		display: flex;
		flex-direction: column;
		color: white;
	}

	/* 发布内容区域 */
	.publish-content {
		flex: 1;
		padding: 40rpx 32rpx;
		min-height: calc(100vh - 200rpx);
		display: flex;
		flex-direction: column;
	}

	.content-input {
		width: 100%;
		min-height: 400rpx;
		font-size: 36rpx;
		line-height: 1.6;
		color: #ffffff;
		background-color: transparent;
		border: none;
		outline: none;
		resize: none;
		font-weight: 400;
		flex: 1;
	}

	.content-input::placeholder {
		color: #666666;
		font-weight: 300;
	}

	/* 标签面板 */
	.tag-panel {
		background-color: #2a2a2a;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-top: 20rpx;
	}

	.tag-panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.panel-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #ffffff;
	}

	.close-panel {
		padding: 8rpx;
	}

	.hot-tags {
		margin-bottom: 20rpx;
	}

	.tag-title {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 16rpx;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.tag-item {
		background-color: #3a3a3a;
		padding: 12rpx 20rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		color: #4A90E2;
		border: 1rpx solid #444;
	}

	/* 已选标签 */
	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 20rpx;
	}

	.selected-tag {
		display: flex;
		align-items: center;
		background-color: rgba(74, 144, 226, 0.2);
		padding: 8rpx 16rpx;
		border-radius: 16rpx;
	}

	.tag-text {
		font-size: 24rpx;
		color: #4A90E2;
		margin-right: 8rpx;
	}

	.remove-tag {
		padding: 4rpx;
	}

	/* 图片区域 */
	.images-section {
		margin-top: 24rpx;
	}

	.image-grid {
		display: grid;
		gap: 8rpx;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.image-grid.grid-1 {
		grid-template-columns: 1fr;
	}

	.image-grid.grid-2 {
		grid-template-columns: 1fr 1fr;
	}

	.image-grid.grid-3 {
		grid-template-columns: 2fr 1fr;
		grid-template-rows: 1fr 1fr;
	}

	.image-grid.grid-3 .image-item:first-child {
		grid-row: 1 / 3;
	}

	.image-grid.grid-4 {
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
	}

	.image-item {
		position: relative;
		height: 200rpx;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.uploaded-image {
		width: 100%;
		height: 100%;
	}

	.image-delete {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 32rpx;
		height: 32rpx;
		background-color: rgba(0, 0, 0, 0.8);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 底部工具栏 */
	.bottom-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 32rpx;
		background-color: #999;
		border-top: 1rpx solid #333;
	}

	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 40rpx;
	}

	.tool-item {
		padding: 12rpx;
		border-radius: 8rpx;
		transition: all 0.2s;
	}

	.tool-item:active {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.privacy-circle {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: #2a2a2a;
		border: 2rpx solid #444;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.publish-btn {
		width: 120rpx;
		height: 60rpx;
		background-color: #333;
		color: #666;
		border: none;
		border-radius: 30rpx;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 500;
	}

	.publish-btn.active {
		background-color: #4A90E2;
		color: white;
	}
</style>