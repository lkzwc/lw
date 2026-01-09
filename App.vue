<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')

			// 自动设置uniCloud的token
			this.setupUniCloudToken()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			/**
			 * 设置uniCloud全局token
			 */
			setupUniCloudToken() {
				try {
					// 从本地存储获取token
					const token = uni.getStorageSync('token')

					if (token) {
						// 设置uniCloud的uniIdToken
						// 这样云对象可以通过 this.getUniIdToken() 获取到token
						if (uniCloud && uniCloud.setCustomData) {
							uniCloud.setCustomData({
								token: token
							})
							console.log('[App] uniCloud token设置成功')
						} else {
							console.log('[App] uniCloud或setCustomData不可用')
						}
					}
				} catch (error) {
					console.error('[App] 设置uniCloud token失败:', error)
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
