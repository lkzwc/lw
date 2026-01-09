<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="navbar">
			<view class="nav-left" @tap="goBack">
				<uni-icons type="arrowleft" size="20" color="#333"></uni-icons>
			</view>
			<view class="nav-title">我的技能</view>
			<view class="nav-right" @tap="addSkill">
				<uni-icons type="plus" size="24" color="#fff"></uni-icons>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<uni-load-more status="loading" :content-text="{contentdown: '加载中...',contentrefresh: '加载中...',contentnomore: ''}"></uni-load-more>
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
					<uni-icons type="gear" size="48" color="#ddd"></uni-icons>
				</view>

				<!-- 技能信息 -->
				<view class="skill-info">
					<text class="skill-title">{{ skill.title }}</text>
					<text class="skill-desc">{{ skill.description }}</text>

					<!-- 技能标签 -->
					<view class="skill-tags">
						<uni-tag
							v-for="tag in (skill.tags || []).slice(0, 3)"
							:key="tag"
							text=""
							size="mini"
							type="primary">
							{{ tag }}
						</uni-tag>
					</view>

					<!-- 价格和位置 -->
					<view class="skill-meta">
						<view class="meta-item">
							<uni-icons type="wallet" size="16" color="#00a870"></uni-icons>
							<text class="meta-text">{{ skill.price }}{{ skill.price_unit || '/次' }}</text>
						</view>
						<view class="meta-item">
							<uni-icons type="location" size="16" color="#666"></uni-icons>
							<text class="meta-text">{{ skill.location || '在线' }}</text>
						</view>
					</view>

					<!-- 统计信息 -->
					<view class="skill-stats">
						<text class="stat-item">
							<uni-icons type="heart" size="14" color="#ff6b6b"></uni-icons>
							{{ skill.rating || 5 }}
						</text>
						<text class="stat-item">
							<uni-icons type="eye" size="14" color="#999"></uni-icons>
							{{ skill.view_count || 0 }}
						</text>
						<text class="stat-item">
							<uni-icons type="calendar" size="14" color="#999"></uni-icons>
							{{ formatTime(skill.create_time) }}
						</text>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="skill-actions" @tap.stop>
					<view class="action-btn" @tap="showActions(skill)">
						<uni-icons type="more-filled" size="20" color="#666"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-if="skillList.length === 0 && !loading">
				<image class="empty-image" src="/static/empty.png" mode="aspectFit"></image>
				<text class="empty-text">还没有发布技能，快去添加吧~</text>
				<button class="add-btn" type="primary" size="mini" @tap="addSkill">添加技能</button>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore">
				<uni-load-more status="loading"></uni-load-more>
			</view>

			<!-- 到底提示 -->
			<view class="load-more" v-else-if="skillList.length > 0">
				<text class="load-text">已经到底啦</text>
			</view>
		</scroll-view>

		<!-- 操作菜单 -->
		<uni-popup ref="actionPopup" type="bottom" @change="onPopupChange">
			<view class="action-sheet">
				<view class="action-item" @tap="editSkill">
					<uni-icons type="compose" size="24" color="#333"></uni-icons>
					<text class="action-text">编辑</text>
				</view>
				<view class="action-item" @tap="toggleStatus">
					<uni-icons type="loop" size="24" color="#333"></uni-icons>
					<text class="action-text">{{ currentSkill?.status === 1 ? '下架' : '上架' }}</text>
				</view>
				<view class="action-item delete-item" @tap="deleteSkill">
					<uni-icons type="trash" size="24" color="#ff4d4f"></uni-icons>
					<text class="action-text" style="color: #ff4d4f;">删除</text>
				</view>
				<view class="action-cancel" @tap="closePopup">取消</view>
			</view>
		</uni-popup>

		<!-- 确认删除弹窗 -->
		<uni-popup ref="deletePopup" type="dialog">
			<uni-popup-dialog
				type="warn"
				title="确认删除"
				content="确定要删除这个技能吗？删除后无法恢复"
				:duration="0"
				:before-close="true"
				@confirm="confirmDelete"
				@close="closeDeleteDialog">
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted, computed } from 'vue';

	const loading = ref(true);
	const skillList = reactive([]);
	const hasMore = ref(true);
	const page = ref(1);
	const pageSize = 10;
	const actionPopup = ref(null);
	const deletePopup = ref(null);
	const currentSkill = ref(null);

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

		loading.value = true;

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
			uni.showToast({ title: '加载失败，请重试', icon: 'none' });
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

	// 显示操作菜单
	const showActions = (skill) => {
		currentSkill.value = skill;
		if (actionPopup.value) {
			actionPopup.value.open();
		}
	};

	// 关闭弹窗
	const closePopup = () => {
		if (actionPopup.value) {
			actionPopup.value.close();
		}
	};

	// 编辑技能
	const editSkill = () => {
		closePopup();
		if (currentSkill.value) {
			uni.navigateTo({
				url: `/pages/skills/add-skill?id=${currentSkill.value._id}`
			});
		}
	};

	// 切换状态
	const toggleStatus = async () => {
		closePopup();
		if (!currentSkill.value) return;

		try {
			const newStatus = currentSkill.value.status === 1 ? 0 : 1;
			const db = uniCloud.database();
			await db.collection('skills').doc(currentSkill.value._id).update({
				status: newStatus
			});

			uni.showToast({
				title: newStatus === 1 ? '上架成功' : '下架成功',
				icon: 'success'
			});
			currentSkill.value.status = newStatus;
		} catch (error) {
			console.error('切换状态失败:', error);
			uni.showToast({ title: '操作失败，请重试', icon: 'none' });
		}
	};

	// 删除技能
	const deleteSkill = () => {
		closePopup();
		if (deletePopup.value) {
			deletePopup.value.open();
		}
	};

	// 关闭删除弹窗
	const closeDeleteDialog = () => {
		if (deletePopup.value) {
			deletePopup.value.close();
		}
	};

	// 确认删除
	const confirmDelete = async () => {
		if (!currentSkill.value || !skillsObj) return;

		try {
			const result = await skillsObj.deleteSkill(currentSkill.value._id);

			if (result.errCode === 0) {
				uni.showToast({ title: '删除成功', icon: 'success' });
				const index = skillList.findIndex(s => s._id === currentSkill.value._id);
				if (index !== -1) {
					skillList.splice(index, 1);
				}
			} else {
				uni.showToast({ title: result.errMsg || '删除失败', icon: 'none' });
			}
		} catch (error) {
			console.error('删除技能失败:', error);
			uni.showToast({ title: '删除失败，请重试', icon: 'none' });
		}

		closeDeleteDialog();
	};

	// 跳转到详情
	const goToDetail = (id) => {
		uni.navigateTo({
			url: `/pages/skills/skill-detail?id=${id}`
		});
	};

	// 添加技能
	const addSkill = () => {
		uni.navigateTo({
			url: '/pages/skills/add-skill'
		});
	};

	// 弹窗状态变化
	const onPopupChange = (e) => {
		console.log('popup变化:', e.show);
	};

	// 格式化时间
	const formatTime = (time) => {
		if (!time) return '';
		const now = new Date();
		const target = new Date(time);
		const diff = Math.floor((now - target) / 1000);

		if (diff < 60) return '刚刚';
		if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
		if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;

		return target.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	};

	// 返回
	const goBack = () => {
		uni.navigateBack();
	};

	onMounted(() => {
		// 初始化云对象
		initCloudObj();

		// 获取技能列表
		getSkillList();
	});
</script>

<style lang="scss" scoped>
	.container {
		width: 100%;
		height: 100vh;
		background: #f5f5f5;
		display: flex;
		flex-direction: column;
	}

	/* 顶部导航 */
	.navbar {
		width: 100%;
		height: 44px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		box-sizing: border-box;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 1px 4px rgba(102, 126, 234, 0.2);
	}

	.nav-left, .nav-right {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-title {
		font-size: 18px;
		font-weight: 600;
		color: #fff;
	}

	/* 加载状态 */
	.loading-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 0;
	}

	/* 统计卡片 */
	.stats-card {
		background: #fff;
		margin: 12px;
		margin-top: 16px;
		border-radius: 12px;
		padding: 20px;
		display: flex;
		align-items: center;
		justify-content: space-around;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 4px;
	}

	.stat-label {
		font-size: 12px;
		color: #999;
	}

	.stat-divider {
		width: 1px;
		height: 40px;
		background: #f0f0f0;
	}

	/* 技能列表 */
	.skill-list {
		flex: 1;
		padding: 12px;
	}

	.skill-card {
		display: flex;
		background: #fff;
		border-radius: 12px;
		padding: 12px;
		margin-bottom: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		position: relative;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.skill-card:active {
		transform: scale(0.98);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
	}

	.skill-image {
		width: 100px;
		height: 100px;
		border-radius: 8px;
		margin-right: 12px;
		flex-shrink: 0;
		background: #f5f5f5;
	}

	.skill-image.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fafafa;
	}

	.skill-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-width: 0;
	}

	.skill-title {
		font-size: 16px;
		font-weight: 600;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-bottom: 4px;
	}

	.skill-desc {
		font-size: 13px;
		color: #666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-bottom: 8px;
	}

	.skill-tags {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
	}

	.skill-meta {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 8px;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.meta-text {
		font-size: 13px;
		color: #666;
	}

	.skill-stats {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.stat-item {
		display: flex;
		align-items: center;
		font-size: 12px;
		color: #999;
	}

	.skill-actions {
		position: absolute;
		top: 12px;
		right: 12px;
	}

	.action-btn {
		padding: 4px;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 20px;
	}

	.empty-image {
		width: 160px;
		height: 160px;
		margin-bottom: 16px;
		opacity: 0.6;
	}

	.empty-text {
		font-size: 14px;
		color: #999;
		margin-bottom: 16px;
	}

	.add-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none !important;
		color: #fff !important;
		padding: 8px 24px !important;
		height: 36px !important;
		line-height: 20px !important;
		border-radius: 18px !important;
		font-size: 14px !important;
	}

	/* 加载更多 */
	.load-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px 0;
	}

	.load-text {
		font-size: 13px;
		color: #999;
	}

	/* 操作弹窗 */
	.action-sheet {
		background: #fff;
		border-radius: 16px 16px 0 0;
		overflow: hidden;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.action-item {
		display: flex;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid #f0f0f0;
		transition: background 0.2s;
	}

	.action-item:active {
		background: #f5f5f5;
	}

	.action-item.delete-item:active {
		background: #fff1f0;
	}

	.action-text {
		font-size: 16px;
		color: #333;
		margin-left: 12px;
	}

	.action-cancel {
		padding: 16px;
		text-align: center;
		font-size: 16px;
		color: #333;
		background: #fff;
		margin-top: 8px;
	}
</style>
