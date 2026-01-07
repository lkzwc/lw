<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<view class="nav-left" @tap="goBack">
				<t-icon name="chevron-left" size="24px" color="#333"></t-icon>
			</view>
			<view class="nav-title">我的技能</view>
			<view class="nav-right" @tap="addSkill">
				<t-icon name="add" size="24px" color="#fff"></t-icon>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<t-loading theme="circular" size="40px" text="加载中..."></t-loading>
		</view>

		<!-- 统计卡片 -->
		<view class="stats-card" v-else-if="!loading">
			<view class="stat-item">
				<text class="stat-value">{{ skillList.length }}</text>
				<text class="stat-label">全部技能</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-value">{{ publishedCount }}</text>
				<text class="stat-label">已发布</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-value">{{ totalViews }}</text>
				<text class="stat-label">总浏览</text>
			</view>
		</view>

		<!-- 技能列表 -->
		<scroll-view v-else scroll-y class="skill-list" @scrolltolower="loadMore">
			<view class="skill-card" v-for="skill in skillList" :key="skill._id" @tap="goToDetail(skill._id)">
				<!-- 技能图片 -->
				<image
					v-if="skill.images && skill.images.length > 0"
					:src="skill.images[0]"
					class="skill-image"
					mode="aspectFill">
				</image>
				<view v-else class="skill-image placeholder">
					<t-icon name="service" size="48px" color="#ddd"></t-icon>
				</view>

				<!-- 技能信息 -->
				<view class="skill-info">
					<text class="skill-title">{{ skill.title }}</text>
					<text class="skill-desc">{{ skill.description }}</text>

					<!-- 技能标签 -->
					<view class="skill-tags">
						<t-tag
							v-for="tag in (skill.tags || []).slice(0, 3)"
							:key="tag"
							size="small"
							variant="light"
							theme="primary">
							{{ tag }}
						</t-tag>
					</view>

					<!-- 价格和位置 -->
					<view class="skill-meta">
						<view class="meta-item">
							<t-icon name="money-circle" size="16px" color="#00a870"></t-icon>
							<text class="meta-text">{{ skill.price }}{{ skill.price_unit || '/次' }}</text>
						</view>
						<view class="meta-item">
							<t-icon name="location" size="16px" color="#666"></t-icon>
							<text class="meta-text">{{ skill.location || '在线' }}</text>
						</view>
					</view>

					<!-- 统计信息 -->
					<view class="skill-stats">
						<text class="stat-item">
							<t-icon name="heart" size="14px" color="#ff6b6b"></t-icon>
							{{ skill.rating || 5 }}
						</text>
						<text class="stat-item">
							<t-icon name="browse" size="14px" color="#999"></t-icon>
							{{ skill.view_count || 0 }}
						</text>
						<text class="stat-item">
							<t-icon name="time" size="14px" color="#999"></t-icon>
							{{ formatTime(skill.create_time) }}
						</text>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="skill-actions" @tap.stop>
					<t-dropdown>
						<view class="action-btn">
							<t-icon name="more" size="20px" color="#666"></t-icon>
						</view>
						<t-dropdown-menu>
							<t-dropdown-item value="edit" @click="editSkill(skill)">
								<view class="dropdown-item">
									<t-icon name="edit" size="16px" color="#333"></t-icon>
									<text class="dropdown-text">编辑</text>
								</view>
							</t-dropdown-item>
							<t-dropdown-item value="offline" @click="toggleStatus(skill)">
								<view class="dropdown-item">
									<t-icon name="poweroff" size="16px" color="#333"></t-icon>
									<text class="dropdown-text">{{ skill.status === 1 ? '下架' : '上架' }}</text>
								</view>
							</t-dropdown-item>
							<t-dropdown-item value="delete" @click="deleteSkill(skill)">
								<view class="dropdown-item">
									<t-icon name="delete" size="16px" color="#ff4d4f"></t-icon>
									<text class="dropdown-text" style="color: #ff4d4f;">删除</text>
								</view>
							</t-dropdown-item>
						</t-dropdown-menu>
					</t-dropdown>
				</view>
			</view>

			<!-- 空状态 -->
			<t-empty v-if="skillList.length === 0 && !loading"
				description="还没有发布技能，快去添加吧~"
				image="https://tdesign.gtimg.com/miniprogram/images/empty.png">
				<template #action>
					<t-button theme="primary" size="medium" @tap="addSkill">添加技能</t-button>
				</template>
			</t-empty>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore">
				<t-loading theme="circular" size="20px"></t-loading>
				<text class="load-text">加载更多</text>
			</view>

			<!-- 到底提示 -->
			<view class="load-more" v-else-if="skillList.length > 0">
				<text class="load-text">已经到底啦</text>
			</view>
		</scroll-view>

		<!-- 确认删除弹窗 -->
		<t-dialog
			v-model:visible="deleteDialogVisible"
			title="确认删除"
			content="确定要删除这个技能吗？删除后无法恢复"
			confirm-btn="删除"
			cancel-btn="取消"
			@confirm="confirmDelete">
		</t-dialog>

		<!-- 提示消息 -->
		<t-toast v-model:visible="toastVisible" :content="toastMessage"></t-toast>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted, computed } from 'vue';
	import TIcon from 'tdesign-miniprogram/icon/icon';
	import TButton from 'tdesign-miniprogram/button/button';
	import TTag from 'tdesign-miniprogram/tag/tag';
	import TLoading from 'tdesign-miniprogram/loading/loading';
	import TEmpty from 'tdesign-miniprogram/empty/empty';
	import TToast from 'tdesign-miniprogram/toast/toast';
	import TDropdown from 'tdesign-miniprogram/dropdown/dropdown';
	import TDropdownMenu from 'tdesign-miniprogram/dropdown-menu/dropdown-menu';
	import TDropdownItem from 'tdesign-miniprogram/dropdown-item/dropdown-item';
	import TDialog from 'tdesign-miniprogram/dialog/dialog';

	const loading = ref(true);
	const skillList = reactive([]);
	const hasMore = ref(true);
	const page = ref(1);
	const pageSize = 10;
	const deleteDialogVisible = ref(false);
	const currentDeleteSkill = ref(null);
	const toastVisible = ref(false);
	const toastMessage = ref('');

	// 计算属性
	const publishedCount = computed(() => {
		return skillList.filter(skill => skill.status === 1).length;
	});

	const totalViews = computed(() => {
		return skillList.reduce((sum, skill) => sum + (skill.view_count || 0), 0);
	});

	// 云对象实例
	let skillsObj = null;

	// 初始化云对象
	const initCloudObj = () => {
		try {
			skillsObj = uniCloud.importObject('skills');
		} catch (error) {
			console.error('云对象初始化失败:', error);
		}
	};

	// 获取技能列表
	const getSkillList = async (refresh = false) => {
		if (!skillsObj) return;

		if (refresh) {
			page.value = 1;
			hasMore.value = true;
			skillList.splice(0, skillList.length);
		}

		if (!hasMore.value) return;

		try {
			const result = await skillsObj.getSkillsList({
				page: page.value,
				pageSize: pageSize
			});

			if (result.errCode === 0 && result.data && result.data.length > 0) {
				skillList.push(...result.data);
				page.value++;

				if (result.data.length < pageSize) {
					hasMore.value = false;
				}
			} else {
				hasMore.value = false;
			}
		} catch (error) {
			console.error('获取技能列表失败:', error);
			showToast('加载失败，请重试');
		} finally {
			loading.value = false;
		}
	};

	// 加载更多
	const loadMore = () => {
		if (!loading.value && hasMore.value) {
			getSkillList();
		}
	};

	// 添加技能
	const addSkill = () => {
		uni.navigateTo({
			url: '/pages/skills/add-skill'
		});
	};

	// 编辑技能
	const editSkill = (skill) => {
		uni.navigateTo({
			url: `/pages/skills/add-skill?id=${skill._id}`
		});
	};

	// 切换状态
	const toggleStatus = async (skill) => {
		try {
			const db = uniCloud.database();
			const newStatus = skill.status === 1 ? 0 : 1;

			await db.collection('skills').doc(skill._id).update({
				status: newStatus
			});

			skill.status = newStatus;
			showToast(newStatus === 1 ? '上架成功' : '下架成功');
		} catch (error) {
			console.error('切换状态失败:', error);
			showToast('操作失败');
		}
	};

	// 删除技能
	const deleteSkill = (skill) => {
		currentDeleteSkill.value = skill;
		deleteDialogVisible.value = true;
	};

	// 确认删除
	const confirmDelete = async () => {
		if (!skillsObj || !currentDeleteSkill.value) return;

		try {
			const result = await skillsObj.deleteSkill({
				skill_id: currentDeleteSkill.value._id
			});

			if (result.errCode === 0) {
				const index = skillList.findIndex(s => s._id === currentDeleteSkill.value._id);
				if (index > -1) {
					skillList.splice(index, 1);
				}
				showToast('删除成功');
			} else {
				showToast(result.errMsg || '删除失败');
			}
		} catch (error) {
			console.error('删除技能失败:', error);
			showToast('删除失败，请重试');
		} finally {
			deleteDialogVisible.value = false;
			currentDeleteSkill.value = null;
		}
	};

	// 跳转详情
	const goToDetail = (skillId) => {
		uni.navigateTo({
			url: `/pages/skills/skill-detail?id=${skillId}`
		});
	};

	// 格式化时间
	const formatTime = (time) => {
		if (!time) return '';
		const now = new Date();
		const target = new Date(time);
		const diff = Math.floor((now - target) / 1000);

		if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
		if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;

		return target.toLocaleDateString('zh-CN', {
			month: '2-digit',
			day: '2-digit'
		});
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
		getSkillList(true);
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

	/* 加载状态 */
	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 300rpx 0;
		background-color: #f3f3f3;
		margin-top: 88rpx;
	}

	/* 统计卡片 */
	.stats-card {
		display: flex;
		align-items: center;
		background-color: #ffffff;
		margin: 108rpx 20rpx 20rpx;
		border-radius: 20rpx;
		padding: 40rpx 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}

	.stat-value {
		font-size: 48rpx;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.stat-label {
		font-size: 24rpx;
		color: #999999;
	}

	.stat-divider {
		width: 1rpx;
		height: 60rpx;
		background-color: #f0f0f0;
	}

	/* 技能列表 */
	.skill-list {
		flex: 1;
		margin-bottom: 100rpx;
		height: calc(100vh - 280rpx - 100rpx);
	}

	/* 技能卡片 */
	.skill-card {
		display: flex;
		background-color: #ffffff;
		margin: 20rpx;
		border-radius: 20rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
		position: relative;
	}

	.skill-image {
		width: 180rpx;
		height: 180rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
		background-color: #f5f5f5;
	}

	.skill-image.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f8f8f8;
	}

	.skill-info {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		min-height: 180rpx;
	}

	.skill-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333333;
		line-height: 1.4;
		margin-bottom: 8rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
	}

	.skill-desc {
		font-size: 24rpx;
		color: #666666;
		line-height: 1.4;
		margin-bottom: 12rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.skill-tags {
		display: flex;
		gap: 8rpx;
		margin-bottom: 12rpx;
	}

	.skill-meta {
		display: flex;
		gap: 20rpx;
		margin-bottom: 12rpx;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.meta-text {
		font-size: 24rpx;
		color: #666666;
	}

	.skill-stats {
		display: flex;
		gap: 20rpx;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 4rpx;
		font-size: 22rpx;
		color: #999999;
	}

	/* 操作按钮 */
	.skill-actions {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
	}

	.action-btn {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.05);
	}

	/* 下拉菜单项 */
	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 8rpx 0;
	}

	.dropdown-text {
		font-size: 28rpx;
		color: #333333;
	}

	/* 加载更多 */
	.load-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40rpx 0;
		gap: 16rpx;
	}

	.load-text {
		font-size: 24rpx;
		color: #999999;
	}
</style>
