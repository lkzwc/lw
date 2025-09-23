<template>
	<view class="profile-editor">
		<uni-section title="个人信息" type="line" style="display: flex;"></uni-section>
		<view class="editor-content">

			<!-- 头像编辑 -->
			<view class="editor-item">
				<view class="avatar-editor">
					<view class="avatar-upload-hint">
						<!-- 微信头像选择按钮 -->
						<button class="avatar-choose-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
							<image :src="formData.avatar || '/static/default.png'" class="edit-avatar"
								mode="aspectFill"></image>
						</button>
					</view>
				</view>
			</view>


			<!-- 昵称编辑 -->
			<view class="editor-item">
				<!-- 微信昵称输入框 -->
				<input v-model="formData.nickname" class="nickname-input" type="nickname" placeholder="请输入昵称"
					maxlength="20" @blur="onNicknameBlur" />
			</view>

		</view>


		<!-- 楼号选择 -->
		<uni-section title="小区楼号" type="line" class="building-section"></uni-section>
		<view class="editor-item-building">
			<uni-data-picker popup-title="请选择小区的楼号" :localdata="localData" v-model="formData.building"
				placeholder="请选择您所在的楼号" @change="chooseBuilding">
			</uni-data-picker>
		</view>

		<view class="editor-actions">
			<button v-if="showSkip" class="skip-btn" @tap="handleSkip">跳过</button>
			<button v-else class="cancel-btn" @tap="handleClose">取消</button>
			<button class="save-btn" @tap="handleSave"
				:disabled="!formData.nickname.trim() || !formData.building || isSaving">
				{{ isSaving ? '保存中...' : '保存' }}
			</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		watch
	} from 'vue'

	// 头像相关数据
	const avatarUrl = ref(uni.getStorageSync('user')?.avatarURL || '')

	// 小区楼号数据
	const localData = [{
			text: "一期",
			value: "1-0",
			children: Array.from({
				length: 17
			}, (v, i) => ({
				text: `1期${i+1}栋`,
				value: `1期${i+1}栋`
			})),
		},
		{
			text: "二期",
			value: "2-0",
			children: Array.from({
				length: 27
			}, (v, i) => ({
				text: `2期${i+1}栋`,
				value: `2期${i+1}栋`
			})),
		},
		{
			text: "三期",
			value: "3-0",
			children: Array.from({
				length: 20
			}, (v, i) => ({
				text: `3期${i+1}栋`,
				value: `3期${i+1}栋`
			})),
		},
		{
			text: "四期",
			value: "4-0",
			children: [...Array.from({
				length: 8
			}, (v, i) => ({
				text: `4期${i+1}栋`,
				value: `4期${i+1}栋`
			})), {
				text: "4期L1栋",
				value: '4期L1栋'
			}, {
				text: "4期L2栋",
				value: '4期L2栋'
			}]
		},
	]



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
				avatar: '',
				building: ''
			})
		}
	})

	// Emits
	const emit = defineEmits(['close', 'save', 'skip'])

	// 响应式数据
	const formData = reactive({
		nickname: '',
		avatar: '',
		building: ''
	})

	const isSaving = ref(false)

	// 监听初始数据变化
	watch(() => props.initialData, (newData) => {
		Object.assign(formData, newData)
	}, {
		immediate: true,
		deep: true
	})

	// 方法
	const onChooseAvatar = (e) => {
		const {
			avatarUrl
		} = e.detail
		if (avatarUrl) {
			formData.avatar = avatarUrl
			console.log('选择头像成功:', avatarUrl)
		}
	}

	const onNicknameBlur = (e) => {
		const {
			value
		} = e.detail
		formData.nickname = value.trim()
	}

	const handleClose = () => {
		emit('close')
	}

	const handleSkip = () => {
		emit('skip')
	}

	// 选择楼号
	const chooseBuilding = (e) => {
		const selectedBuilding = e.detail.value[1]?.value || ''
		formData.building = selectedBuilding
		console.log('选择楼号:', selectedBuilding)
	}

	const handleSave = async () => {
		// 验证必填字段
		if (!formData.nickname.trim()) {
			uni.showToast({
				title: '请输入昵称',
				icon: 'none'
			})
			return
		}

		if (!formData.building.trim()) {
			uni.showToast({
				title: '请选择楼号',
				icon: 'none'
			})
			return
		}

		isSaving.value = true

		try {
			// 如果有选择头像，先上传头像
			let avatarUrl = formData.avatar
			if (formData.avatar && formData.avatar.startsWith('wxfile://')) {
				// 头像是本地临时文件，需要上传
				avatarUrl = await uploadAvatar(formData.avatar)
			}

			const profileData = {
				...formData,
				avatar: avatarUrl
			}

			await emit('save', profileData)
		} catch (error) {
			console.error('保存失败:', error)
			uni.showToast({
				title: '保存失败，请重试',
				icon: 'none'
			})
		} finally {
			isSaving.value = false
		}
	}

	// 上传头像
	const uploadAvatar = async (tempFilePath) => {
		try {
			const result = await uniCloud.uploadFile({
				filePath: tempFilePath,
				cloudPath: `avatars/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
				fileType: 'image'
			})
			return result.fileID
		} catch (error) {
			console.error('头像上传失败:', error)
			throw new Error('头像上传失败')
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

	.cancel-btn,
	.save-btn,
	.skip-btn {
		flex: 1;
		padding: 5rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: 500;
		border: none;
	}

	.cancel-btn,
	.skip-btn {
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

	.building-section {
		width: 100%;
		margin: 0;
	}

	.editor-item-building{
		margin: 20rpx;
	}
	.selected-building {
		margin-top: 16rpx;
		padding: 12rpx 16rpx;
		background: #f0f9ff;
		border: 1rpx solid #1DA1F2;
		border-radius: 8rpx;
		font-size: 26rpx;
		color: #1DA1F2;
		text-align: center;
	}
</style>